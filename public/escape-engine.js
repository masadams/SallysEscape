// Escape's rules are independent of the campaign, its upgrades and leaderboards.
(function(root){
  const CreatureMotion=typeof module!=='undefined'&&module.exports?require('./creature-rig.js').EscapeCreatureMotion:root.EscapeCreatureMotion;
  const catalog=typeof module!=='undefined'&&module.exports?require('./escape-levels.js'):{EscapeCatalog:root.EscapeCatalog,escapeGridFor:root.escapeGridFor};
  const Ice=typeof module!=='undefined'&&module.exports?require('./escape-ice.js'):root.EscapeIce;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const copy=p=>({x:p.x,y:p.y});
  // How heavy hunters handle in a chase (see glideHunter): turning speed in radians a second, the share of
  // speed kept through a sharp turn, how quickly they get back up to full speed, and lunges a second.
  // How sharp hunters are, by the level's cunning (0 to 3; early areas 0, the last stretch 3): how far
  // ahead a snake reads Sally, how much looping it takes before it reads the loop, how close it feels
  // her when facing away, how quickly it turns and recovers from a skid, and its pace.
  // For every hunter on the common chase: react (how long it takes to be sure it saw her), memory (how long
  // it keeps after her once she is out of sight) and search (how long it hunts the spot before giving up).
  // For the fox, owl, beetle and scorpion: warn (how long each telegraph lasts), aim (how far ahead a
  // strike is aimed and how hard an owl's swoop bends after her), rest (how long it is stunned or
  // recovers after a strike) and ear (how far the fox hears her footsteps).
  const CUNNING=[{lead:0,loop:Infinity,feel:0,turn:.85,snap:.35,pace:.92,react:1.35,memory:1,search:1.2,warn:1.3,aim:.5,rest:1.25,ear:.8},{lead:.55,loop:8,feel:1.8,turn:.93,snap:.7,pace:.96,react:1.15,memory:1.25,search:1.6,warn:1.12,aim:.8,rest:1.1,ear:.9},{lead:1,loop:5.5,feel:3,turn:1,snap:1,pace:1,react:1,memory:1.5,search:2,warn:1,aim:1,rest:1,ear:1},{lead:1.2,loop:4.2,feel:3.6,turn:1.1,snap:1,pace:1.03,react:.85,memory:1.8,search:2.6,warn:.88,aim:1.15,rest:.85,ear:1.15}];
  // Hunters that keep their own counsel and do not answer a magpie's caw.
  const MAGPIE_DEAF=new Set(['magpie','ladybird','owl','moth','cricket','angler','mimic','flytrap','sentinel','cloudray','echofrog','toad','scorpion','millipede','heron','mantis','wasp','eel','crab','gecko']);
  // lead is how far ahead it reads Sally: 1 aims where she will be by the time it gets there, 0 where she is.
  const MOMENTUM={snake:{turn:2.4,grip:.55,accel:1.6,pulse:1.5,lead:.85},cobra:{turn:2,grip:.5,accel:1.3,pulse:1.1,lead:1},'sea-snake':{turn:2.4,grip:.55,accel:1.6,pulse:1.4,lead:.85},fish:{turn:4.5,grip:.6,accel:2.5,pulse:2.2,lead:.5},chameleon:{turn:3.5,grip:.55,accel:2,pulse:1,lead:.4}};
  // Hunters heavy enough to press a heavy plate.
  const HEAVY=new Set(['beetle']);
  // Creatures a thrown pebble can bonk on the way: the ones that walk the floor in the open.
  const BONKABLE=new Set(['snake','sea-snake','cobra','beetle','toad','spider','fox','chameleon','gecko','millipede','cricket']);
  // How far a pebble's landing carries, by the ground it lands on: gravel clatters, leaves and mud
  // muffle it, moss swallows it.
  const LANDING={N:12,L:5,M:5,m:2.5,t:6};
  // Insects Sally's tongue can snatch and eat.
  const EDIBLE=new Set(['cricket','moth']);
  // These floor-dwelling lurkers dislike thrown mushroom light. Other creatures
  // retain their own counters (including the moth's attraction to light).
  const LIGHT_SHY=new Set(['spider','millipede']);
  const GLOW_RADIUS=4;
  const centre=(x,y)=>({x:x+0.5,y:y+0.5});
  const directions=[[1,0],[-1,0],[0,1],[0,-1]];
  // A trail is a closed loop of axis-aligned corners; expand it to every tile centre on the way.
  function expandTrail(corners){
    const out=[];for(let i=0;i<corners.length;i++){const [x1,y1]=corners[i],[x2,y2]=corners[(i+1)%corners.length],dx=Math.sign(x2-x1),dy=Math.sign(y2-y1);
      if(dx&&dy)throw new Error('Ant trails turn only at right angles');for(let x=x1,y=y1;x!==x2||y!==y2;x+=dx,y+=dy)out.push(centre(x,y));}
    return out;
  }
  class EscapeAdventure{
    constructor(options={}){
      this.challenge=options.challengeId?catalog.EscapeCatalog.challenges.find(c=>c.id===options.challengeId):null;
      if(options.challengeId&&!this.challenge)throw new Error('Unknown Escape challenge');
      // Tests and tools may pass a level object directly; the game uses the catalog.
      this.level=options.level||(options.seasonalId?(catalog.EscapeCatalog.seasonal||[]).find(l=>l.id===options.seasonalId):options.kidsId?(catalog.EscapeCatalog.kids||[]).find(l=>l.id===options.kidsId):options.hiddenId?catalog.EscapeCatalog.hidden.find(l=>l.id===options.hiddenId):catalog.EscapeCatalog.levels.find(l=>l.id===(this.challenge?.levelId||options.levelId||'quiet-vault')));
      if(!this.level)throw new Error('Unknown Escape level');
      this.cunning=CUNNING[Math.max(0,Math.min(3,Math.round(this.level.cunning??2)))];
      this.grid=catalog.escapeGridFor(this.level);this.height=this.grid.length;this.width=this.grid[0].length;
      this.player={...centre(...this.level.spawn),facing:{x:0,y:-1},tongueAim:null,stamina:100,exhausted:false,moving:false,sprinting:false,crawling:false,hidden:false,noisy:false};
      this.hunters=this.level.guards.map(guard=>this.makeHunter(guard));for(const h of this.hunters)h.restState=h.state;
      // Gentle levels (Little Explorers, for young children) can't be lost: a catch is an "Oops!"
      // that hops Sally back to the last checkpoint she reached, and the creatures move slower.
      this.gentle=this.level.gentle?{pace:typeof this.level.gentle==='number'?this.level.gentle:.6}:null;this.oopses=0;
      this.checkpoints=(this.level.checkpoints||[]).map(c=>({...centre(...c),reached:false}));this.checkpoint={...centre(...this.level.spawn)};
      this.pendingSpawns=[];this.spawnedReinforcements=new Set();this.webs=[];this.glowTrail=[];this.trailAt=0;
      this.hunter=this.hunters[0]||null;this.patrol=this.hunter?.patrol||[];
      this.gates=(this.level.gates||[]).map(g=>({...g,open:Boolean(g.initialOpen),sealed:false,closingAt:null,expiresAt:null,pressed:false,warned:false,activations:0,switch:g.switch?centre(...g.switch):null,plates:(g.plates||[]).map(p=>centre(...p)),levers:(g.levers||[]).map(p=>centre(...p)),heavyPlates:(g.heavyPlates||[]).map(p=>centre(...p)),tiles:g.tiles.map(p=>p.slice())}));
      this.reactionsFired=new Set();this.mazeObjective=null;
      this.wheelAngle=0;this.clashes=0;this.swimDistance=0;
      this.key=centre(...this.level.key);this.exit=centre(...this.level.exit);this.hasKey=false;
      this.loot=this.level.loot.map(([x,y,value])=>({...centre(x,y),value,taken:false}));
      this.treasure=0;this.totalTreasure=this.loot.reduce((n,p)=>n+p.value,0);
      this.burrows=this.level.burrows;this.decoys=this.level.pebbles;this.decoy=null;this.decoyReadyAt=0;this.glows=this.level.glows||0;this.glowsUsed=0;this.flights=[];this.lights=[];this.dug=[];
      this.glowVersion=0;
      this.seeds=this.level.seeds||0;this.diggers=this.level.diggers||0;this.pendingDig=null;this.tunnelsDug=0;this.seedGrowth=[];this.seedReadyAt=0;this.seedsUsed=0;
      this.tongues=this.level.tongues||0;this.tongueRange=3;this.tongue=null;this.tongueReadyAt=0;this.tonguesUsed=0;this.keyByTongue=false;
      this.elapsed=0;this.accumulator=0;this.status='playing';this.paused=false;this.result=null;
      this.invulnerableUntil=0;this.exitHold=0;this.closeCalls=0;this.alarms=0;this.events=[];
      // Later routes forgive one catch: Sally sheds her tail as a wriggling decoy.
      this.tailDrop=Boolean(this.level.tailDrop&&!this.challenge);this.hasTail=true;this.tailsDropped=0;this.droppedTail=null;this.catches=[];this.lastCaptor=null;
      this.regrowthBugs=(this.level.regrowth||[]).map(p=>({...centre(...p),eaten:false}));
      // Bonus glow bugs drift around some escapes (the game rolls for them; tests and recordings
      // never pass the option, so recorded runs are unchanged). Catching one is a small bonus.
      this.glowbugs=options.glowbugs?this.makeGlowbugs(options.glowbugs):[];this.glowbugsCaught=0;
      // Rooftop routes: camouflage charges, shaded awnings and a hawk overhead.
      this.camos=this.level.camos||0;this.camoUntil=0;this.camosUsed=0;this.shade=new Set((this.level.shade||[]).map(([x,y])=>x+','+y));
      // Ant Kingdom: marching columns on fixed looping trails, and treasure that can be stolen.
      this.antTrails=(this.level.antTrails||[]).map(t=>({tiles:expandTrail(t.path),groups:t.groups||3,size:t.size||4,gap:t.gap||5,speed:t.speed||1.6,offset:t.offset||0}));
      this.carried=[];this.thefts=0;this.recoveries=0;this.stolen=0;
      // Frost Hollow: only marked rooms are cold; warm stones thaw Sally quickly.
      this.slippery=new Set((this.level.slippery||[]).map(p=>p.join(',')));this.softSand=new Set((this.level.softSand||[]).map(p=>p.join(',')));this.slideVelocity={x:0,y:0};
      this.cold=new Set();for(const [x1,y1,x2,y2] of this.level.cold||[])for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)this.cold.add(x+','+y);
      this.warm=new Set((this.level.warm||[]).map(([x,y])=>x+','+y));
      // Steam Vents: wall vents fire jets down a lane on a fixed rhythm.
      // Traps: rolling logs sweep a lane on a rhythm, thorns rise from the floor, and
      // crumbling tiles fall away behind Sally.
      this.logs=(this.level.logs||[]).map(l=>({...l,from:centre(...l.from),to:centre(...l.to),period:l.period||5,offset:l.offset||0,speed:l.speed||5,warn:l.warn||1,pos:null,rolling:false,warning:false}));
      // Tangle vines lie across floor tiles, grab Sally for a moment, then wither and regrow.
      this.vines=(this.level.vines||[]).map(([x,y])=>({x,y,key:x+','+y,readyAt:0,holding:false}));this.heldUntil=0;this.heldBy=null;
      this.thorns=(this.level.thorns||[]).map(t=>({...t,keys:new Set(t.tiles.map(([x,y])=>x+','+y)),period:t.period||3,up:t.up||1.2,offset:t.offset||0,raised:false,warning:false}));
      this.crumbling=new Map();
      // Storm Heights: gusting wind lanes and lightning that lights up the whole cliff.
      this.wind=(this.level.wind||[]).map(w=>{const [x1,y1,x2,y2]=w.area,keys=new Set();for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)keys.add(x+','+y);return {...w,keys,period:w.period||5,on:w.on||1.6,offset:w.offset||0,warned:false};});
      const storm=this.level.storm;this.storm=storm?{every:storm.every||9,warn:storm.warn||1.4,nextAt:storm.first||storm.every||9,warned:false}:null;this.flashUntil=0;
      // Tide Pools: tide flats turn between sand and water on the level's rhythm.
      this.tideFlats=(this.level.tideFlats||[]).map(([x,y])=>({x,y}));const tide=this.level.tide;this.tide=this.tideFlats.length?{period:tide?.period||14,high:tide?.high||6,offset:tide?.offset||0,isHigh:null,warned:false}:null;
      if(this.tide)this.applyTide(true);
      // Mushroom Grotto: spore puffballs burst into hiding clouds; bounce caps fling Sally across.
      this.puffs=(this.level.puffballs||[]).map(([x,y])=>({x,y,key:x+','+y,readyAt:0}));this.clouds=[];
      // Moss muffles every step, even a sprint. Echo halls carry sound much further. Currents push
      // a swimmer along. Burrow pairs are linked mounds: dig into one, come up out of the other.
      this.moss=new Set((this.level.moss||[]).map(([x,y])=>x+','+y));
      // Soft dirt patches (d on a text map) where Sally can dig herself in; see dig() in step.
      this.soil=new Set((this.level.soil||[]).map(([x,y])=>x+','+y));this.digs=0;
      // Ice walls are walls that a frost sentinel's gaze glances off.
      this.ice=new Set((this.level.ice||[]).map(([x,y])=>x+','+y));
      this.echoes=(this.level.echoes||[]).map(([x1,y1,x2,y2])=>({x1,y1,x2,y2}));
      this.currents=(this.level.currents||[]).map(c=>{const [x1,y1,x2,y2]=c.area;return {x1,y1,x2,y2,dir:c.dir,speed:c.speed||1.2,...(c.surface==='ground'?{surface:'ground'}:{}),...(c.pulse>0?{pulse:c.pulse,phase:c.phase||0}:{})};});this.flow={x:0,y:0};
      this.tunnels=(this.level.tunnels||[]).map(([a,b])=>({a:centre(...a),b:centre(...b)}));this.tunnelReadyAt=0;
      this.spores=this.level.spores||0;this.sporesUsed=0;this.tunnelsUsed=0;
      this.caps=(this.level.caps||[]).map(c=>({at:c.at.slice(),to:c.to.slice(),key:c.at.join(','),readyAt:0}));
      this.vents=(this.level.vents||[]).map(v=>{const [dx,dy]=v.dir,tiles=[];for(let i=1;i<=(v.length||4);i++){const x=v.at[0]+dx*i,y=v.at[1]+dy*i;if(!this.floor(x,y))break;tiles.push([x,y]);}
        return {...v,tiles,keys:new Set(tiles.map(([x,y])=>x+','+y)),period:v.period||5,on:v.on||1.6,offset:v.offset||0,warn:v.warn||.9,active:false,warning:false};});
      this.blasts=0;this.steamed=0;this.player.warmth=100;this.player.chilled=false;this.lowestWarmth=100;
      const hawk=this.level.hawk;this.hawk=hawk?{every:hawk.every||8,warn:hawk.warn||1.8,radius:hawk.radius||1.2,speed:hawk.speed||2.4,nextAt:hawk.first||16,state:'circling',shadow:null,strikes:0,dodges:0,lastStrike:null}:null;
      this.requiredTreasure=this.challenge?.allTreasure?this.totalTreasure:this.level.requiredTreasure||0;this.timeLimit=this.challenge?.timeLimit||this.level.timeLimit||null;
      this.message=this.challenge?.brief||this.level.hint;this.messageUntil=7;
      this.visible=new Set();this.discovered=new Set();this.visibilityAt=-Infinity;this.updateVisibility(true);
      this.motion=new CreatureMotion(this);
    }
    makeHunter(guard){return {...centre(...guard.spawn),id:guard.id||null,kind:guard.kind||'snake',facing:guard.facing,state:guard.kind==='echofrog'?'listen':guard.kind==='sentinel'?'watch':guard.kind==='cloudray'?'glide':guard.kind==='mimic'?'rooted':guard.kind==='cobra'?'coiled':guard.kind==='angler'?'lurking':guard.kind==='flytrap'?'open':guard.kind==='heron'||guard.kind==='mantis'?'still':guard.kind==='wasp'?'nest':guard.kind==='dragonfly'?'fly':guard.kind==='mole'?'under':guard.kind==='bat'?'fly':guard.kind==='eel'?'lurk':guard.kind==='crab'?'shell':'patrol',awareness:0,lastKnown:null,lastObserved:-Infinity,reason:'seen',path:[],routeIndex:0,pauseUntil:0,searchUntil:0,patrol:guard.patrol.map(p=>centre(...p)),aim:null,phaseUntil:0,distanceMoved:0,...(guard.kind==='cobra'?{post:centre(...guard.spawn),reach:guard.reach||2.6}:{}),...(guard.kind==='angler'?{lure:centre(...(guard.lure||guard.spawn))}:{}),...(guard.kind==='sentinel'?{facing:guard.looks?guard.looks[0]:guard.facing,looks:guard.looks||null,every:guard.every||3.5,look:0,turnAt:guard.every||3.5,range:guard.range||9,beams:[],readyAt:0}:{}),...(guard.kind==='cloudray'?{leg:0,speed:guard.speed||1.4,shadowR:guard.range||2.1}:{}),...(guard.kind==='heron'||guard.kind==='mantis'?{facing:guard.looks?guard.looks[0]:guard.facing,reach:guard.reach||(guard.kind==='mantis'?1.7:2.6),looks:guard.looks||null,every:guard.every||3.2,look:0,turnAt:guard.every||3.2}:{}),...(guard.kind==='eel'?{post:centre(...guard.spawn)}:{}),...(guard.kind==='bat'?{leg:0,speed:guard.speed||1.8,every:guard.every||2.4,range:guard.range||4.5,pulseAt:(guard.offset||0)-2,pulseFrom:null}:{}),...(guard.kind==='dragonfly'?{leg:0,hoverUntil:0,speed:guard.speed||4.6,hover:guard.hover??.4}:{}),...(guard.kind==='wasp'?{nest:centre(...guard.spawn),swarm:null,leash:guard.leash||6,readyAt:0}:{}),...(guard.kind==='crab'?{home:centre(...guard.spawn),axis:guard.axis||'x',range:guard.range||3}:{}),...(guard.kind==='scorpion'?{reach:guard.reach||1.8,buried:Boolean(guard.buried),offset:guard.offset??(guard.spawn[0]*.7+guard.spawn[1]*.3)%3.8,post:centre(...guard.spawn)}:{})};}
    floor(x,y){const t=this.grid[y]?.[x];return t!==undefined&&t!=='#'&&t!=='B'&&t!=='G'&&t!=='P';}
    water(p){return this.grid[Math.floor(p.y)]?.[Math.floor(p.x)]==='U';}
    // A crack (Y; S in text maps) is wide enough for Sally only: no hunter can squeeze through or see into it.
    actorFloor(x,y,h){const wet=this.grid[y]?.[x]==='U';if(h&&this.grid[y]?.[x]==='Y')return false;return this.floor(x,y)&&(!h||h.kind==='sea-snake'||(h.kind==='fish'?wet:!wet));}
    sightFloor(x,y){const c=this.grid[y]?.[x];return c!=='Y'&&(this.floor(x,y)||c==='P');}
    visibleTile(x,y){return !this.level.explore||this.visible.has(x+','+y);}
    lineVisible(a,b){
      // A blocking wall itself is visible; tiles beyond it are not. Do not
      // reveal diagonally across two touching walls.
      const count=Math.max(1,Math.ceil(distance(a,b)*16));let previous=copy(a);
      for(let i=0;i<=count;i++){
        const p={x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count},x=Math.floor(p.x),y=Math.floor(p.y),px=Math.floor(previous.x),py=Math.floor(previous.y);
        if(x!==px&&y!==py&&(!this.sightFloor(x,py)||!this.sightFloor(px,y)))return false;
        if(!this.sightFloor(x,y))return x===Math.floor(b.x)&&y===Math.floor(b.y);
        previous=p;
      }
      return true;
    }
    playerSees(point){
      const p=this.player,d=distance(p,point),r=this.level.sightRadius||6;
      if(d>r||!this.clear(p,point,true))return false;
      if(!this.level.gaze)return true;
      return d<.15||((point.x-p.x)*p.facing.x+(point.y-p.y)*p.facing.y)/d>=.5;
    }
    lookBack(){
      if(!this.active()||!this.level.gaze)return false;
      this.player.facing={x:-this.player.facing.x||0,y:-this.player.facing.y||0};
      this.player.tongueAim={...this.player.facing};this.lookUntil=this.elapsed+.65;
      this.updateVisibility(true);return true;
    }
    plantSeed(){
      if(!this.active()||!this.seeds||this.elapsed<this.seedReadyAt)return false;
      const p=this.player,d=p.facing,forward=q=>distance(p,q)<=1.6&&(q.x-p.x)*d.x+(q.y-p.y)*d.y>.15&&Math.abs((q.x-p.x)*d.y-(q.y-p.y)*d.x)<=.6&&this.lineVisible(p,q);
      const gate=this.gates.find(g=>g.tiles.some(([x,y])=>forward(centre(x,y))));
      if(gate&&(!gate.open||gate.bracedUntil>this.elapsed)){this.notice(gate.open?'This doorway is already braced.':'Seeds can brace an opening, but cannot reopen a closed root.');return false;}
      const bank=(this.level.seedCrossings||[]).find(b=>b.banks.some(([x,y])=>distance(p,centre(x,y))<.65));
      const bed=bank&&bank.tiles.some(([x,y])=>forward(centre(x,y)))&&bank.tiles.every(([x,y])=>this.grid[y][x]==='P')?bank:null;
      if(!gate&&bank&&!bed){this.notice('Face the water from this bank. An existing vine cannot be planted twice.');return false;}
      let message;
      if(gate){gate.bracedUntil=this.elapsed+12;gate.braceWarned=false;message='Roots brace '+gate.name+' for twelve seconds.';}
      else if(bed){
        const growth={id:bed.id,kind:'vine',tiles:bed.tiles.map(([x,y])=>({x,y,old:'P'})),expires:this.elapsed+12,warned:false};
        for(const t of growth.tiles)this.grid[t.y][t.x]='V';this.seedGrowth.push(growth);message='A vine crossing grows. It lasts twelve seconds.';
      }else{
        const x=Math.floor(p.x),y=Math.floor(p.y),old=this.grid[y][x];
        if(!['.','M','N'].includes(old)){this.notice('Plant on bare ground, face an open doorway, or stand at a marked vine bank.');return false;}
        this.grid[y][x]='L';this.seedGrowth.push({kind:'cover',tiles:[{x,y,old}],expires:this.elapsed+12,warned:false});message='Leaves grow around Sally. Stand still to hide; they last twelve seconds.';
      }
      this.spend('seeds');this.seedsUsed++;this.seedReadyAt=this.elapsed+.5;for(const h of this.hunters){h.path=[];h.targetId=null;}this.updateVisibility(true);this.notice(message,'grow');return true;
    }
    updateSeedGrowth(){
      if(!this.active())return;
      for(const gate of this.gates)if(gate.bracedUntil&&this.elapsed>=gate.bracedUntil-1.2&&!gate.braceWarned){gate.braceWarned=true;this.events.push('wilt');}
      this.seedGrowth=this.seedGrowth.filter(growth=>{
        if(!growth.warned&&this.elapsed>=growth.expires-1.2){growth.warned=true;this.events.push('wilt');}
        if(this.elapsed<growth.expires)return true;
        if(growth.kind==='vine'&&growth.tiles.some(({x,y})=>[this.player,...this.hunters.filter(h=>h.kind!=='moth')].some(p=>p.x+.28>x&&p.x-.28<x+1&&p.y+.28>y&&p.y-.28<y+1)))return true;
        for(const t of growth.tiles)this.grid[t.y][t.x]=t.old;
        for(const h of this.hunters){h.path=[];h.targetId=null;}this.updateVisibility(true);return false;
      });
    }
    updateVisibility(force=false){
      if(!this.level.explore)return;
      if(!force&&this.elapsed<this.visibilityAt)return;this.visibilityAt=this.elapsed+.08;this.visible.clear();
      const p=this.player,r=this.level.dark?6.5:this.level.sightRadius||6;
      for(let y=Math.max(0,Math.floor(p.y-r));y<=Math.min(this.height-1,Math.ceil(p.y+r));y++)for(let x=Math.max(0,Math.floor(p.x-r));x<=Math.min(this.width-1,Math.ceil(p.x+r));x++){
        const point=centre(x,y),d=distance(p,point);
        const lit=!this.level.dark||d<=this.level.sightRadius||(this.level.glowPlants||[]).some(([x,y])=>distance(point,centre(x,y))<=1.5&&this.lineVisible(centre(x,y),point))||this.glowTrail.some(t=>t.expires>this.elapsed&&distance(point,t)<=.75&&this.lineVisible(t,point));
        if(d<=r&&lit&&this.lineVisible(p,point)&&(!this.level.gaze||d<.8||((point.x-p.x)*p.facing.x+(point.y-p.y)*p.facing.y)/d>=.5)){const id=x+','+y;this.visible.add(id);this.discovered.add(id);}
      }
      for(const l of this.lights)for(let y=Math.max(0,Math.floor(l.y-l.r));y<=Math.min(this.height-1,Math.ceil(l.y+l.r));y++)for(let x=Math.max(0,Math.floor(l.x-l.r));x<=Math.min(this.width-1,Math.ceil(l.x+l.r));x++){
        const point=centre(x,y);if(distance(point,l)<=l.r&&this.lineVisible(l,point)){const id=x+','+y;this.visible.add(id);this.discovered.add(id);}
      }
    }
    activateSwitches(){
      for(const gate of this.gates){
        // A heavy plate ignores Sally; only a big hunter's weight (a beetle on its rounds) presses it.
        // A door can mix triggers: plates and levers for Sally, heavy plates for a beetle's weight.
        const on=points=>points.some(p=>distance(this.player,p)<.4),heavyOn=points=>points.length>0&&this.hunters.some(h=>HEAVY.has(h.kind)&&points.some(p=>distance(h,p)<.45));
        const pressed=(gate.heavy?heavyOn(gate.plates):on([...(gate.switch?[gate.switch]:[]),...gate.plates]))||on(gate.levers||[])||heavyOn(gate.heavyPlates||[]);
        // A door that starts open and slams shut for good when any of its triggers fires.
        if(gate.shut){if(pressed&&!gate.sealed){gate.sealed=true;gate.activations++;if(gate.open)gate.closingAt=this.elapsed+.9;this.notice(gate.name+(gate.bridge?' bridge':' gate')+' slams shut!','seal');}gate.pressed=pressed;continue;}
        if(gate.duration){
          if(pressed&&!gate.sealed){
            if(!gate.pressed){gate.activations++;this.notice(gate.heavy?'Something heavy presses the plate. '+gate.name+' opens for '+gate.duration+' seconds.':gate.name+' '+(gate.bridge?'bridge':'gate')+' lasts '+gate.duration+' seconds after you leave the plate.','plate');}
            this.setGateOpen(gate,true);gate.expiresAt=this.elapsed+gate.duration;gate.closingAt=null;gate.warned=false;
          }gate.pressed=pressed;continue;
        }
        if((gate.switch||gate.stay||gate.levers?.length)&&!gate.open&&!gate.sealed&&pressed){gate.activations++;
        this.setGateOpen(gate,true);
        this.notice(gate.name+(this.level.reactions?' gates open.':' gates open. They stay open.'),'gate');
        }
      }
    }
    updateTimedGates(){
      if(!this.active())return;
      // A crumbling bridge falls once Sally has stepped onto it and off again.
      for(const gate of this.gates)if(gate.crumble&&gate.open&&!gate.sealed){const on=gate.tiles.some(([x,y])=>Math.floor(this.player.x)===x&&Math.floor(this.player.y)===y);if(on)gate.crossed=true;else if(gate.crossed&&gate.closingAt===null){gate.closingAt=this.elapsed+.4;this.events.push('creak');this.notice('The '+gate.name.toLowerCase()+' bridge crumbles behind Sally!','warning');}}
      for(const gate of this.gates)if(gate.duration&&gate.open&&!gate.sealed&&gate.expiresAt!==null){
        if(!gate.warned&&this.elapsed>=gate.expiresAt-1.2){gate.warned=true;this.events.push('creak');}
        if(this.elapsed>=gate.expiresAt&&gate.closingAt===null)gate.closingAt=this.elapsed;
      }
    }
    setGateOpen(gate,open){
      if(gate.open===open)return;
      gate.open=open;for(const [x,y] of gate.tiles)this.grid[y][x]=gate.bridge?(open?'W':'P'):(open?'g':'G');
      for(const h of this.hunters){h.path=[];h.targetId=null;}
      this.updateVisibility(true);
    }
    reactToMaze(when,item=null){
      if(!this.active())return;
      for(const reaction of this.level.reactions||[]){
        if(reaction.when!==when||this.reactionsFired.has(reaction.id)||reaction.requiresKey&&!this.hasKey)continue;
        if(reaction.requiresOpen?.some(id=>!this.gates.find(g=>g.id===id)?.open))continue;
        if(when==='enter'){const [x1,y1,x2,y2]=reaction.region,x=Math.floor(this.player.x),y=Math.floor(this.player.y);if(x<x1||x>x2||y<y1||y>y2)continue;}
        if(when==='treasure'&&(!item||Math.floor(item.x)!==reaction.at[0]||Math.floor(item.y)!==reaction.at[1]))continue;
        this.reactionsFired.add(reaction.id);
        for(const id of reaction.spawn||[]){
          if(this.spawnedReinforcements.has(id))continue;
          const guard=(this.level.reinforcements||[]).find(h=>h.id===id);if(!guard)continue;
          this.spawnedReinforcements.add(id);this.pendingSpawns.push({id,guard,...centre(...guard.spawn),readyAt:this.elapsed+2});
          this.events.push('den');
        }
        // The alternate route opens before any door closes. A sealed switch
        // cannot silently undo the reversal on a later visit.
        for(const id of reaction.open||[]){const gate=this.gates.find(g=>g.id===id);if(gate&&!gate.sealed)this.setGateOpen(gate,true);}
        for(const id of reaction.close||[]){const gate=this.gates.find(g=>g.id===id);if(!gate||gate.sealed)continue;gate.sealed=true;if(gate.open)gate.closingAt=this.elapsed+(gate.root?1.4:.9);}
        this.mazeObjective={text:reaction.objective,untilGate:reaction.untilGate};
        this.notice(reaction.message,'maze');this.messageUntil=this.elapsed+7;
      }
    }
    updateClosingGates(){
      if(!this.active())return;
      for(const gate of this.gates)if(gate.closingAt!==null&&this.elapsed>=gate.closingAt){
        if(this.elapsed<(gate.bracedUntil||0))continue;
        // Do not close on either a player or an enemy, including the edge of
        // its collider. The warning stays active until the doorway is clear.
        const occupied=gate.tiles.some(([x,y])=>[this.player,...this.hunters.filter(h=>!gate.bridge||h.kind!=='moth')].some(p=>p.x+.28>x&&p.x-.28<x+1&&p.y+.28>y&&p.y-.28<y+1));
        if(occupied)continue;
        gate.closingAt=null;this.setGateOpen(gate,false);if(gate.duration)gate.expiresAt=null;this.events.push(gate.bridge?'creak':'seal');
        if(gate.once||gate.crumble){gate.sealed=true;this.notice(gate.name+(gate.bridge?' bridge':' gate')+' is gone for good.','seal');}
      }
    }
    updateEmergences(){
      if(!this.active())return;
      this.pendingSpawns=this.pendingSpawns.filter(den=>{
        if(this.elapsed<den.readyAt||!this.fits(den)||distance(den,this.player)<3||this.hunters.some(h=>distance(h,den)<.65))return true;
        const h=this.makeHunter(den.guard);h.state='emerge';h.phaseUntil=this.elapsed+.8;
        this.hunters.push(h);this.motion.resetHunter(h,this.hunters.length-1);this.events.push('emerge');return false;
      });
    }
    mazeObjectiveText(){
      const goal=this.mazeObjective;if(!goal||goal.untilGate&&this.gates.find(g=>g.id===goal.untilGate)?.open)return null;
      return goal.text;
    }
    clear(a,b,overGaps=false,actor=null){
      const steps=Math.max(1,Math.ceil(distance(a,b)*20));
      const open=(x,y)=>overGaps?this.sightFloor(x,y):this.actorFloor(x,y,actor);
      let previous=copy(a);
      for(let i=0;i<=steps;i++){
        const p={x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps};
        const x=Math.floor(p.x),y=Math.floor(p.y),px=Math.floor(previous.x),py=Math.floor(previous.y);
        if(!open(x,y) || (x!==px && y!==py && (!open(x,py)||!open(px,y))))return false;
        previous=p;
      }
      return true;
    }
    flowSpeed(c){return c.pulse?c.speed*(1+.55*Math.sin((this.elapsed/c.pulse+(c.phase||0))*Math.PI*2)):c.speed;}
    fits(p,radius=0.22,actor=null){
      return [[-1,-1],[-1,1],[1,-1],[1,1]].every(([x,y])=>this.actorFloor(Math.floor(p.x+x*radius),Math.floor(p.y+y*radius),actor));
    }
    // maxSteps stops the search early; a route needing more steps comes back empty.
    route(from,to,actor=null,maxSteps=Infinity,avoidGlow=false){
      const sx=Math.floor(from.x),sy=Math.floor(from.y),tx=Math.floor(to.x),ty=Math.floor(to.y);
      if(!this.actorFloor(tx,ty,actor)||!this.actorFloor(sx,sy,actor)||avoidGlow&&this.inLight(centre(tx,ty),.35))return [];
      // A lit tile is refused, and refused again from each neighbour, so each answer is kept for this search.
      const queue=[[sx,sy,0]],previous=new Map([[sx+','+sy,null]]),lit=new Map(),dark=(x,y,id)=>{let v=lit.get(id);if(v===undefined){v=!this.inLight(centre(x,y),.35);lit.set(id,v);}return v;};
      for(let i=0;i<queue.length;i++){
        const [x,y,depth]=queue[i];
        if(x===tx&&y===ty){
          const path=[];let cell=[x,y];
          while(cell){path.unshift(centre(...cell));cell=previous.get(cell.join(','));}
          // Align with the starting cell centre before turning at a corner.
          if(distance(from,path[0])<0.05 || (path[1] && (Math.abs(from.x-path[1].x)<0.02 || Math.abs(from.y-path[1].y)<0.02) && this.clear(from,path[1],false,actor)))path.shift();return path;
        }
        if(depth>=maxSteps)continue;
        for(const [dx,dy] of directions){const nx=x+dx,ny=y+dy,id=nx+','+ny;
          if(this.actorFloor(nx,ny,actor)&&!previous.has(id)&&(!avoidGlow||dark(nx,ny,id))){previous.set(id,[x,y]);queue.push([nx,ny,depth+1]);}
        }
      }
      return [];
    }
    inEcho(q){return this.echoes.some(e=>q.x>=e.x1&&q.x<e.x2+1&&q.y>=e.y1&&q.y<e.y2+1);}
    audible(a,b,range){
      // A sound made in an echo hall carries nearly twice as far.
      if(this.echoes.length&&this.inEcho(b))range*=1.8;
      if(Math.floor(a.x)===Math.floor(b.x)&&Math.floor(a.y)===Math.floor(b.y))return this.clear(a,b);
      // A route of more than `range` steps is at least `range` tiles long even after its start is trimmed.
      const path=this.route(a,b,null,Math.floor(range));return path.length>0 && path.length<=range;
    }
    // Strikers aim where Sally is heading, not where she was; the lead stops at walls.
    lead(seconds){const p=this.player,v=this.playerVelocity||{x:0,y:0},target={x:p.x+v.x*seconds,y:p.y+v.y*seconds};return this.fits(target)&&this.clear(p,target)?target:copy(p);}
    // A charging beetle breaks what it hits: leaf cover is flattened and a cracked wall opens for everyone.
    smash(x,y){const tile=this.grid[y]?.[x];if(tile!=='L'&&tile!=='B')return false;if(tile==='B'&&(x<=0||y<=0||x>=this.width-1||y>=this.height-1))return false;
      this.grid[y][x]='.';this.smashed=(this.smashed||0)+1;for(const h of this.hunters)h.path=[];this.events.push(tile==='B'?'smash':'rustle');if(tile==='B')this.notice('The beetle smashed through a cracked wall!','warning');this.visibilityAt=-Infinity;return true;}
    // Creatures Sally has come near this run, for the bestiary. A buried scorpion or a mimic still
    // posing as a chest does not count until it shows itself.
    noteMet(){
      if(this.elapsed<(this.metCheckAt||0))return;this.metCheckAt=this.elapsed+.25;this.met=this.met||new Set();const p=this.player;
      for(const h of this.hunters)if(!this.met.has(h.kind)&&!h.buried&&!['buried','dig','emerge'].includes(h.state)&&!(h.kind==='mimic'&&h.state==='rooted')&&!(h.kind==='mantis'&&!this.mantisShown(h))&&distance(p,h)<6)this.met.add(h.kind);
      if(this.hawk?.shadow)this.met.add('hawk');
      if(this.antTrails.length&&!this.met.has('ants')&&this.antAt(p,6))this.met.add('ants');
    }
    notice(message,event){if(this.level.seasonal==='winter')message=this.winterMessage(message);this.message=message;this.messageUntil=this.elapsed+2.5;if(event)this.events.push(event);}
    active(){return this.status==='playing'&&!this.paused;}
    burrow(){
      if(!this.active())return false;
      if(this.tunnels.length&&this.useTunnel())return true;
      // On soft dirt the same button, held, digs Sally in instead (see step).
      if(this.soil.has(this.tileKey(this.player)))return false;
      if(this.burrows===0){this.notice('No burrows left. Find a way around.');return false;}
      const p=this.player,x=Math.floor(p.x),y=Math.floor(p.y),d=p.facing;
      const wx=x+d.x,wy=y+d.y,landing=centre(x+2*d.x,y+2*d.y);
      if(this.grid[wy]?.[wx]==='G'){const gate=this.gates.find(g=>g.tiles.some(([x,y])=>x===wx&&y===wy));this.notice(gate?.sealed?'This passage is sealed. Find a new way around.':gate?.switch?'This gate needs its matching switch.':'Something controls this passage. Look for another route.');return false;}
      if(!['#','B'].includes(this.grid[wy]?.[wx]) || wx<=0||wy<=0||wx>=this.width-1||wy>=this.height-1||!this.fits(landing)){
        this.notice('Face a thin wall with an open tile on the other side.');return false;
      }
      p.x=landing.x;p.y=landing.y;p.sprinting=false;p.moving=false;
      this.motion.resetPlayer(p);
      this.tongue=null;
      this.updateVisibility(true);
      this.spend('burrows');this.dug.push({x:wx,y:wy});this.invulnerableUntil=this.elapsed+0.35;
      this.notice('Under the wall. Keep moving!','burrow');return true;
    }
    // The tunnel kit: dig an entrance on open ground, then an exit somewhere else (at least three
    // tiles away), and the two become a burrow pair like any other. Digging again by an unfinished
    // entrance fills it back in. Water, ice, gates, switches and other mounds cannot be dug.
    digTunnel(){
      if(!this.active()||this.player.underground||this.player.flight)return false;
      const p=this.player,x=Math.floor(p.x),y=Math.floor(p.y),here=centre(x,y),tile=this.grid[y]?.[x];
      if(this.pendingDig&&distance(here,this.pendingDig)<1.1){this.pendingDig=null;this.notice('You fill the hole back in.','rustle');return true;}
      if(!this.pendingDig&&this.diggers===0){this.notice('No tunnels left to dig.');return false;}
      const mound=this.tunnels.some(t=>distance(here,t.a)<1.1||distance(here,t.b)<1.1);
      if(!['.','M','L','N'].includes(tile)||this.slippery.has(x+','+y)||mound||here.x===this.exit.x&&here.y===this.exit.y){this.notice('Dig on open ground, away from water, ice, gates and other mounds.');return false;}
      if(!this.pendingDig){this.pendingDig=here;this.notice('Entrance dug. Now dig the way out somewhere else.','burrow');return true;}
      if(distance(here,this.pendingDig)<3){this.notice('Dig the way out at least three tiles from the entrance.');return false;}
      this.tunnels.push({a:this.pendingDig,b:here,dug:true});this.pendingDig=null;this.spend('diggers');this.tunnelsDug++;this.tunnelReadyAt=this.elapsed+.4;
      this.notice('Tunnel finished! Stand on either mound and Burrow to use it.','tunnel');return true;
    }
    // A burrow pair: standing on a mound, Sally digs in and comes up out of its partner a moment
    // later. Nothing can catch her while she is underground, and nothing can follow.
    useTunnel(){
      const p=this.player,t=this.tunnels.find(t=>distance(p,t.a)<.7||distance(p,t.b)<.7);if(!t)return false;
      if(this.elapsed<this.tunnelReadyAt)return true;
      const from=distance(p,t.a)<.7?t.a:t.b,to=from===t.a?t.b:t.a;
      p.underground={from:copy(from),to:copy(to),start:this.elapsed,dur:.9};this.invulnerableUntil=Math.max(this.invulnerableUntil,this.elapsed+1.3);
      this.tunnelReadyAt=this.elapsed+1.8;this.tunnelsUsed++;this.events.push('tunnel');return true;
    }
    // Aimed throws (a pebble or a glow mushroom, held to throw further): the throw flies along
    // the aim, banks off walls (twice at most, losing a little each time) and lands where it
    // runs out. A pebble clacks at each bounce, so hunters hear it there first, then where it
    // lands; a glow mushroom lights the ground where it lands. Gaps and water pass beneath it.
    throwAim(){const p=this.player,a=p.throwAim||p.tongueAim||p.facing,l=Math.hypot(a.x,a.y)||1;return {x:a.x/l,y:a.y/l};}
    planThrow(power=0){
      const p=this.player,v=this.throwAim(),step=.05,points=[copy(p)],bounces=[];let pos=copy(p),left=2.6+Math.max(0,Math.min(1,power))*3.4;
      const solid=(x,y)=>!this.sightFloor(x,y);
      while(left>0){
        const n={x:pos.x+v.x*step,y:pos.y+v.y*step},tx=Math.floor(n.x),ty=Math.floor(n.y),ox=Math.floor(pos.x),oy=Math.floor(pos.y);
        if(solid(tx,ty)||(tx!==ox&&ty!==oy&&solid(tx,oy)&&solid(ox,ty))){
          if(bounces.length>=2)break;
          const flipX=tx!==ox&&solid(tx,oy),flipY=ty!==oy&&solid(ox,ty);
          if(flipX)v.x=-v.x;if(flipY)v.y=-v.y;if(!flipX&&!flipY){v.x=-v.x;v.y=-v.y;}
          bounces.push(copy(pos));points.push(copy(pos));left*=.75;continue;
        }
        pos=n;left-=step;
      }
      // It cannot come to rest over a gap or in deep water: it rolls back to the last good ground.
      // In water it splashes and sinks; hunters listen from the bank it was thrown across.
      const wet=this.water(pos)?copy(pos):null;
      let land=copy(pos);for(let i=0;i<200&&(!this.actorFloor(Math.floor(land.x),Math.floor(land.y))||wet&&this.water(land));i++){land={x:land.x-v.x*step,y:land.y-v.y*step};}
      points.push(wet||land);return {points,bounces,land,wet};
    }
    launch(kind,power){
      const plan=this.planThrow(power);if(distance(this.player,plan.land)<.5&&!plan.bounces.length){this.notice('Too close to a wall to throw.');return false;}
      let length=0;const legs=plan.points.slice(1).map((q,i)=>{const from=plan.points[i],d=distance(from,q);length+=d;return {from,to:q,end:length};});
      this.flights.push({kind,legs,bounces:plan.bounces.map((b,i)=>({...b,at:legs[i].end,done:false})),land:plan.land,wet:plan.wet,start:this.elapsed,speed:9,length,from:copy(this.player)});
      this.player.throwAim=null;this.events.push('toss');return true;
    }
    throwSpore(power=0){
      if(!this.active())return false;
      if(!this.spores){this.notice(this.level.spores?'No spore pouches left.':'No spore pouches here.');return false;}
      if(this.elapsed<this.decoyReadyAt)return false;
      if(!this.launch('spore',power))return false;
      this.spend('spores');this.sporesUsed++;this.decoyReadyAt=this.elapsed+.8;this.notice('Spore pouch thrown.');return true;
    }
    throwGlow(power=0){
      if(!this.active())return false;
      if(!this.glows){this.notice(this.level.glows?'No glow mushrooms left.':'No glow mushrooms here.');return false;}
      if(this.elapsed<this.decoyReadyAt)return false;
      if(!this.launch('glow',power))return false;
      this.spend('glows');this.glowsUsed++;this.decoyReadyAt=this.elapsed+.8;this.notice('Glow mushroom thrown.');return true;
    }
    updateFlights(){
      for(const f of this.flights){
        const travelled=(this.elapsed-f.start)*f.speed;
        for(const b of f.bounces)if(!b.done&&travelled>=b.at){b.done=true;this.events.push('clack');
          if(f.kind==='pebble')this.decoy={x:b.x,y:b.y,expires:this.elapsed+1.2,noticed:false,echo:true};}
        f.pos=null;for(const leg of f.legs)if(travelled<=leg.end){const t=1-(leg.end-travelled)/Math.max(1e-6,distance(leg.from,leg.to));f.pos={x:leg.from.x+(leg.to.x-leg.from.x)*t,y:leg.from.y+(leg.to.y-leg.from.y)*t};break;}
        // A pebble that hits a creature on the way bonks it: it drops there, and the creature is dazed
        // for a moment, then goes to look where the pebble came from.
        if(f.kind==='pebble'&&f.pos&&travelled>.6){const h=this.hunters.find(h=>BONKABLE.has(h.kind)&&!h.eaten&&!['steamed','stunned','emerge','dig','buried','rise','clash'].includes(h.state)&&distance(h,f.pos)<.42);
          if(h){f.done=true;h.state='steamed';h.phaseUntil=this.elapsed+1.1;h.path=[];h.targetId=null;h.awareness=0;h.bonkFrom=copy(f.from);this.bonks=(this.bonks||0)+1;this.cue('bonk',h);this.notice('Bonk! It is dazed, but it knows where that came from.');continue;}}
        if(travelled>=f.length){f.done=true;
          // Into water: a splash, and the pebble is gone; hunters come to the bank to look, and an eel
          // or fish nearby darts at the ripples.
          if(f.kind==='pebble'&&f.wet){this.cue('splash',f.wet);this.decoy={...f.land,expires:this.elapsed+3,noticed:false,range:7};
            for(const h of this.hunters)if(h.kind==='eel'&&h.state==='lurk'&&distance(h.post||h,f.wet)<2.6){h.state='ripple';h.aim=copy(f.wet);h.phaseUntil=this.elapsed+.3;}
            continue;}
          if(f.kind==='pebble'){const tile=this.grid[Math.floor(f.land.y)]?.[Math.floor(f.land.x)],ground=this.moss.has(this.tileKey(f.land))?'m':tile;
            this.decoy={...f.land,expires:this.elapsed+4,noticed:false,range:LANDING[ground]||9};this.events.push(ground==='N'?'clatter':ground==='L'?'rustle':ground==='M'?'squish':'decoy');}
          else if(f.kind==='spore'){this.clouds.push({...f.land,r:1.9,born:this.elapsed,until:this.elapsed+6});this.events.push('puff');}
          else{this.lights.push({...f.land,born:this.elapsed,until:this.elapsed+12,r:GLOW_RADIUS});this.glowVersion++;this.events.push('glow');this.updateVisibility(true);}}
      }
      this.flights=this.flights.filter(f=>!f.done);
      if(this.lights.length){const live=this.lights.filter(l=>l.until>this.elapsed);if(live.length!==this.lights.length){this.lights=live;this.glowVersion++;this.updateVisibility(true);}}
    }
    // Sally standing in a glow mushroom's light is lit up like a moth's: leaves stop hiding her.
    inLight(q=this.player,margin=0){return this.lights.some(l=>l.until>this.elapsed&&distance(q,l)<=l.r+margin&&this.clear(l,q,true));}
    // Find nearby reachable shade, not an arbitrary point through a wall. This
    // bounded search runs on entry / failed routes, never once per animation frame.
    glowShade(h){
      const sx=Math.floor(h.x),sy=Math.floor(h.y),queue=[[sx,sy,0]],seen=new Set([sx+','+sy]);
      for(let i=0;i<queue.length&&i<512;i++){
        const [x,y,depth]=queue[i],p=centre(x,y);
        if(!this.inLight(p,.5)&&this.fits(p,.22,h))return p;
        if(depth>=12)continue;
        for(const [dx,dy]of directions){const nx=x+dx,ny=y+dy,id=nx+','+ny;if(this.actorFloor(nx,ny,h)&&!seen.has(id)){seen.add(id);queue.push([nx,ny,depth+1]);}}
      }
      return null;
    }
    updateGlowFear(dt,h){
      if(!LIGHT_SHY.has(h.kind)||!this.lights.length&&!h.glowFear)return false;
      if(h.state==='clash'||h.state==='emerge')return false;
      const p=this.player,inside=this.inLight(h,.35),sheltered=this.inLight(p),old=h.glowFear;
      if(old?.lastSeen&&!inside)h.facing=Math.atan2(old.lastSeen.y-h.y,old.lastSeen.x-h.x);
      const seen=this.seesPlayer(h),remembered=old?.lastSeen&&this.elapsed-old.seenAt<=this.cunning.memory;
      const sourceLive=old?.sources.some(l=>l.until>this.elapsed&&this.lights.includes(l));
      if(inside||sheltered&&(seen||remembered)||old&&sourceLive&&!seen){
        const fear=h.glowFear||(h.glowFear={sources:[],lastSeen:null,seenAt:-Infinity,destination:null,retryAt:0,version:-1});
        if(fear.sourceVersion!==this.glowVersion){fear.sources=fear.sources.filter(l=>l.until>this.elapsed&&this.lights.includes(l));fear.sourceVersion=this.glowVersion;}
        for(const l of this.lights)if(l.until>this.elapsed&&(distance(h,l)<=l.r+.35&&this.clear(l,h,true)||sheltered&&seen&&distance(p,l)<=l.r&&this.clear(l,p,true))&&!fear.sources.includes(l))fear.sources.push(l);
        if(seen){fear.lastSeen=copy(p);fear.seenAt=this.elapsed;}
        if(!old){this.cue('rustle',h);if(this.visibleTile(Math.floor(h.x),Math.floor(h.y)))this.notice('The '+h.kind+' shrinks from the glow. It waits for the dark.','warning');}
        h.aim=null;h.awareness=0;h.rushUntil=0;
        if(inside){
          h.state='light-flee';
          if(fear.version!==this.glowVersion||this.elapsed>=fear.retryAt&&(!fear.destination||!h.path.length)){
            fear.destination=this.glowShade(h);fear.version=this.glowVersion;fear.retryAt=this.elapsed+.5;h.path=[];h.targetId=null;
          }
          if(fear.destination)this.moveHunter(fear.destination,2.8*dt,h,true);
        }else{
          h.state='light-watch';h.path=[];h.targetId=null;
          if(fear.lastSeen)h.facing=Math.atan2(fear.lastSeen.y-h.y,fear.lastSeen.x-h.x);
        }
        return true;
      }
      if(old){
        h.glowFear=null;h.state='patrol';h.path=[];h.targetId=null;h.aim=null;h.pauseUntil=0;h.glowRetryAt=0;
        if(remembered){
          if(h.kind==='spider'){h.state='rush';h.aim=copy(old.lastSeen);h.rushUntil=this.elapsed+1.5;this.alarms++;this.cue('warning',h);this.notice('The spider leaves its vigil and rushes the last place it saw Sally!','warning');}
          else{h.awakened=true;h.followAt=this.elapsed+.25;}
        }
      }
      return false;
    }
    // In an unlimited level (the Magpie Roost, where pebbles and shiny things lie everywhere) Sally's
    // pouches never run out; each tool still has its own wait between uses.
    spend(tool){if(!this.level.unlimited)this[tool]--;}
    throwDecoy(power){
      if(!this.active())return false;
      if(typeof power==='number'){
        if(this.decoys===0){this.notice('No pebbles left. Use cover.');return false;}
        if(this.elapsed<this.decoyReadyAt||!this.launch('pebble',power))return false;
        this.spend('decoys');this.decoyReadyAt=this.elapsed+0.8;this.notice('Pebble tossed. Watch for the hunter\'s reaction.');return true;
      }
      if(this.decoys===0){this.notice('No pebbles left. Use cover.');return false;}
      if(this.elapsed<this.decoyReadyAt)return false;
      const p=this.player,d=p.facing,start=centre(Math.floor(p.x),Math.floor(p.y));let target=start;
      for(let i=1;i<=3;i++){
        const next={x:start.x+d.x*i,y:start.y+d.y*i};if(!this.clear(start,next))break;target=next;
      }
      if(distance(start,target)<0.5){this.notice('Face an open corridor to toss a pebble.');return false;}
      this.spend('decoys');this.decoyReadyAt=this.elapsed+0.8;
      this.decoy={...target,expires:this.elapsed+4,noticed:false};
      this.notice('Pebble tossed. Watch for the hunter\'s reaction.','decoy');return true;
    }
    tongueTarget(){
      // Things to grab come first, then insects, then switches, each nearest first.
      const p=this.player,d=p.tongueAim||p.facing,targets=[],rank={eat:1,switch:2};
      if(!this.hasKey)targets.push({kind:'key',point:this.key});
      this.loot.forEach((item,index)=>{if(!item.taken)targets.push({kind:'loot',index,point:item});});
      if(!this.hasTail)this.regrowthBugs.forEach((bug,index)=>{if(!bug.eaten)targets.push({kind:'bug',index,point:bug});});
      this.glowbugs.forEach((bug,index)=>{if(!bug.caught)targets.push({kind:'glow',index,point:bug});});
      // An angler's lure looks just like a glow bug, so the tongue will happily reach for it.
      this.hunters.forEach((h,index)=>{if(h.kind==='angler'&&h.state==='lurking')targets.push({kind:'lure',index,point:h.lure});});
      // Insects are food: a cricket or a moth within reach can be snatched and eaten.
      this.hunters.forEach((h,index)=>{if(EDIBLE.has(h.kind)&&!h.eaten)targets.push({kind:'eat',index,point:h});});
      // A gate's switch or lever can be flicked from a little way off.
      this.gates.forEach((gate,index)=>{if(!gate.open&&!gate.sealed&&!gate.duration&&!gate.shut)for(const point of [...(gate.switch?[gate.switch]:[]),...(gate.levers||[])])targets.push({kind:'switch',index,point});});
      return targets.filter(t=>{const dx=t.point.x-p.x,dy=t.point.y-p.y,forward=dx*d.x+dy*d.y,side=Math.abs(dx*d.y-dy*d.x);return forward>.25&&distance(p,t.point)<=this.tongueRange+1e-9&&side<=.35&&this.clear(p,t.point,true);}).sort((a,b)=>(rank[a.kind]||0)-(rank[b.kind]||0)||distance(p,a.point)-distance(p,b.point))[0]||null;
    }
    useTongue(){
      if(!this.active())return false;
      if(!this.tongues){this.notice(this.level.tongues?'No tongue grabs left. Take a walking route.':'No tongue grabs on this route.');return false;}
      if(this.tongue&&this.tongue.kind!=='miss'||this.elapsed<this.tongueReadyAt)return false;
      const target=this.tongueTarget();
      // Nothing to grab: the tongue still flicks out and back (costing nothing), so it never feels dead.
      if(!target){const p=this.player,d=p.tongueAim||p.facing,l=Math.hypot(d.x,d.y)||1;let reach={x:p.x,y:p.y};for(let i=1;i<=12;i++){const q={x:p.x+d.x/l*i*.25,y:p.y+d.y/l*i*.25};if(!this.clear(p,q,true))break;reach=q;}
        this.tongue={kind:'miss',point:reach,startedAt:this.elapsed,hit:false};this.events.push('thwip');
        this.notice('Nothing to grab there. The tongue reaches keys, treasure, bugs and switches within three tiles.');return false;}
      this.spend('tongues');this.tonguesUsed++;this.tongueReadyAt=this.elapsed+.55;
      this.tongue={...target,point:copy(target.point),startedAt:this.elapsed,hit:false};this.events.push('tongue');return true;
    }
    // An insect snatched by the tongue is gone for good: a cricket chirps no more, a moth's light goes out.
    eatInsect(h){if(!h||h.eaten)return;h.eaten=true;h.state='eaten';h.x=-99;h.y=-99;this.insectsEaten=(this.insectsEaten||0)+1;this.cue('gulp');this.notice(h.kind==='cricket'?'Gulp! That cricket will not be chirping again.':'Gulp! The moth\'s light goes out.');}
    tongueSwitch(gate){if(gate.open||gate.sealed)return;gate.activations++;this.setGateOpen(gate,true);this.notice('Flick! Sally\'s tongue hits the switch. '+gate.name+' gates open.','gate');}
    collectKey(byTongue=false){
      if(this.hasKey)return;this.hasKey=true;this.keyByTongue=byTongue;
      this.notice(this.requiredTreasure>this.treasure?'Key found! Bring '+(this.requiredTreasure-this.treasure)+' more treasure to the hatch.':'Key found! The hatch is open.','key');
      this.reactToMaze('key');
    }
    collectLoot(item){
      if(item.taken)return;item.taken=true;this.treasure+=item.value;this.carried.push(item);this.notice(item.value>1?'A whole treasure chest!':'Treasure pocketed.','treasure');this.reactToMaze('treasure',item);
    }
    shedTail(captor){
      // Who caught her and where, for the play summary; a caught run ends in finish() just after.
      this.lastCaptor={by:captor?.kind||null,at:this.elapsed};
      if(this.gentle&&this.status==='playing')return this.oops(captor);
      if(!this.tailDrop||!this.hasTail||this.status!=='playing')return false;
      this.noteCatch(captor?.kind||null,true);this.lastCaptor=null;
      const p=this.player;this.hasTail=false;this.tailsDropped++;
      this.droppedTail={x:p.x,y:p.y,born:this.elapsed,expires:this.elapsed+3};
      this.invulnerableUntil=this.elapsed+1.2;p.stamina=100;p.exhausted=false;
      // Every nearby hunter, including the one that caught her, turns on the wriggling tail.
      for(const h of this.hunters){
        if(h!==captor&&(distance(h,p)>=6||!this.clear(h,p,true)))continue;
        h.graceUntil=Math.max(h.graceUntil||0,this.elapsed+2.8);
        // Rooted plants, fish and burrowing hunters cannot chase a tail across the floor.
        if(['mimic','fish','angler','flytrap','heron','mantis','wasp','dragonfly','mole','bat','eel','crab','owl','magpie','gecko','echofrog','sentinel','cloudray'].includes(h.kind)||['emerge','dig','buried','rise','clash'].includes(h.state))continue;
        h.tailLureUntil=this.elapsed+2.4;h.path=[];h.targetId=null;
      }
      this.notice(this.regrowthBugs.some(b=>!b.eaten)?'Tail dropped! It wriggles as a decoy. Run—then eat a pink regrowth bug to grow it back.':'Tail dropped! It wriggles as a decoy. Run! The next catch is final.','tailDrop');
      return true;
    }
    // A gentle level's catch: back to the last checkpoint, safe for a moment, and every creature
    // forgets her and goes back to its rounds.
    oops(captor){
      this.noteCatch(captor?.kind||null,true);this.lastCaptor=null;this.oopses++;
      const p=this.player;p.x=this.checkpoint.x;p.y=this.checkpoint.y;p.dig=null;p.stamina=100;p.exhausted=false;p.moving=false;
      this.heldUntil=0;this.heldBy=null;this.invulnerableUntil=this.elapsed+2.5;
      for(const h of this.hunters){h.graceUntil=Math.max(h.graceUntil||0,this.elapsed+3);h.awareness=0;h.lastKnown=null;h.aim=null;h.path=[];h.targetId=null;h.tailLureUntil=0;
        if(h.restState)h.state=h.restState;}
      this.notice('Oops! Try again from here.','oops');
      return true;
    }
    updateCheckpoints(){
      const p=this.player;
      for(const c of this.checkpoints)if(!c.reached&&distance(p,c)<.8){c.reached=true;this.checkpoint={x:c.x,y:c.y};this.notice('Checkpoint! You will start here if a creature catches you.','checkpoint');}
    }
    camouflage(){
      if(!this.active())return false;
      if(!this.camos){this.notice(this.level.camos?'No camouflage left. Find shade or leaves.':'Nothing here to blend into.');return false;}
      if(this.camoUntil>this.elapsed)return false;
      this.spend('camos');this.camosUsed++;this.camoUntil=this.elapsed+6;this.notice('Sally blends into the ground. Keep still to stay hidden.','camo');return true;
    }
    // Every ant in every column, as positions along its looping trail.
    ants(trail){
      const n=trail.tiles.length,period=trail.size+trail.gap,head=trail.speed*this.elapsed+trail.offset,out=[];
      for(let g=0;g<trail.groups;g++)for(let j=0;j<trail.size*2;j++){
        let s=(head-g*n/trail.groups-j*.5)%n;if(s<0)s+=n;const i=Math.floor(s)%n,f=s-Math.floor(s),a=trail.tiles[i],b=trail.tiles[(i+1)%n];
        out.push({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,dir:Math.atan2(b.y-a.y,b.x-a.x)});
      }
      return out;
    }
    antAt(p,range=.42){for(const t of this.antTrails)for(const a of this.ants(t))if(distance(a,p)<range)return a;return null;}
    // The gecko thief lurks in its burrow, darts at Sally only while she
    // carries treasure, steals the last piece and runs home with it.
    updateGecko(dt,h){
      const p=this.player,home=h.home||(h.home={x:h.x,y:h.y});
      if(h.state==='stunned'){if(this.elapsed>=h.phaseUntil)h.state='return';return;}
      if(h.state==='flee'){
        if(this.elapsed-h.stoleAt>.35&&distance(h,p)<.55){this.treasure+=h.loot.value;this.carried.push(h.loot);h.loot=null;this.recoveries++;h.state='stunned';h.phaseUntil=this.elapsed+1.5;this.notice('Got it back! The gecko tumbles away.','recover');return;}
        if(distance(h,home)<.1){this.stolen+=h.loot.value;h.loot=null;h.state='patrol';h.cooldown=this.elapsed+10;this.notice('The gecko vanished down its burrow with your treasure.','lost');return;}
        this.moveHunter(home,2.7*dt,h);return;
      }
      if(h.state==='dash'){
        if(!this.carried.length||p.hidden||distance(h,p)>8){h.state='return';return;}
        if(distance(h,p)<.5){const item=this.carried.pop();this.treasure-=item.value;h.loot=item;this.thefts++;h.state='flee';h.stoleAt=this.elapsed;h.path=[];h.targetId=null;this.notice('A gecko snatched your treasure! Catch it before it reaches its burrow.','steal');return;}
        this.moveHunter(p,3.4*dt,h);return;
      }
      if(h.state==='return'){if(distance(h,home)<.1){h.state='patrol';h.cooldown=this.elapsed+6;return;}this.moveHunter(home,2*dt,h);return;}
      h.state='patrol';
      if(this.carried.length&&this.elapsed>=(h.cooldown||0)&&!p.hidden&&distance(h,p)<=(p.crawling?3.5:6)&&this.clear(h,p,true)){h.state='dash';this.cue('skitter',h);}
    }
    ventPhase(v,t=this.elapsed){const phase=((t+v.offset)%v.period+v.period)%v.period;return {active:phase>=v.period-v.on,warning:phase>=v.period-v.on-v.warn&&phase<v.period-v.on};}
    inJet(p){const key=this.tileKey(p);return this.vents.some(v=>v.active&&v.keys.has(key));}
    // Move an actor out of a jet: past its far end if that is open, otherwise to one side.
    blowClear(v,a,actor=null){
      const [dx,dy]=v.dir,[ex,ey]=v.tiles.at(-1),key=this.tileKey(a),[ax,ay]=key.split(',').map(Number);
      for(const [x,y] of [[ex+dx,ey+dy],[ax+dy,ay+dx],[ax-dy,ay-dx],[ax+dy*2,ay+dx*2],[ax-dy*2,ay-dx*2]]){const p=centre(x,y);if(this.fits(p,.22,actor)&&!v.keys.has(x+','+y)){a.x=p.x;a.y=p.y;return true;}}
      return false;
    }
    updateVents(){
      const p=this.player;
      for(const v of this.vents){const {active,warning}=this.ventPhase(v);if(warning&&!v.warning&&distance(p,centre(...v.at))<9)this.events.push('hiss');if(active&&!v.active&&distance(p,centre(...v.at))<9)this.events.push('steam');v.active=active;v.warning=warning;if(!active)continue;
        if(v.keys.has(this.tileKey(p))&&this.blowClear(v,p)){this.blasts++;p.stamina=Math.max(0,p.stamina-35);this.motion.resetPlayer(p);this.notice('Scalding steam! Sally is blown clear.','steam');}
        this.hunters.forEach((h,i)=>{if(!v.keys.has(this.tileKey(h))||h.state==='steamed'||['owl','magpie','moth','fish','angler','flytrap','heron','mantis','wasp','dragonfly','mole','bat','eel','echofrog','sentinel','cloudray'].includes(h.kind))return;this.blowClear(v,h,h);this.motion.resetHunter?.(h,i);h.state='steamed';h.phaseUntil=this.elapsed+2.5;h.path=[];h.targetId=null;h.aim=null;h.awareness=0;h.lastKnown=null;this.steamed++;this.notice('The steam blasts a hunter aside. It is dazed!','steam');});
      }
    }
    tileKey(p){return Math.floor(p.x)+','+Math.floor(p.y);}
    updateWarmth(dt){
      const p=this.player,key=this.tileKey(p),before=p.warmth;
      p.warmth=this.warm.has(key)?Math.min(100,p.warmth+45*dt):this.cold.has(key)?Math.max(0,p.warmth-(p.sprinting?14:9)*dt):Math.min(100,p.warmth+6*dt);
      this.lowestWarmth=Math.min(this.lowestWarmth,p.warmth);
      if(!p.chilled&&p.warmth<30){p.chilled=true;this.notice('Sally is getting cold and slow! Find a warm stone.','shiver');}
      else if(p.chilled&&p.warmth>=40){p.chilled=false;if(before<40)this.notice('Warm again. Sally can sprint.');}
    }
    shaded(p=this.player){return this.shade.has(Math.floor(p.x)+','+Math.floor(p.y))||this.inRayShadow(p);}
    inRayShadow(p=this.player){return this.hunters.some(h=>h.kind==='cloudray'&&distance(h,p)<h.shadowR);}
    // The hawk circles out of reach, then its shadow drifts after Sally a
    // little slower than she walks, and it dives on wherever the shadow is.
    updateHawk(dt){
      const k=this.hawk,p=this.player;if(!k)return;
      if(k.state==='circling'){if(this.elapsed>=k.nextAt){k.state='stalk';k.shadow=copy(p);k.strikeAt=this.elapsed+k.warn;this.events.push('screech');}return;}
      if(k.state==='stalk'){
        const d=distance(k.shadow,p),step=Math.min(d,k.speed*dt);if(d>1e-6){k.shadow.x+=(p.x-k.shadow.x)/d*step;k.shadow.y+=(p.y-k.shadow.y)/d*step;}
        if(this.elapsed>=k.strikeAt){k.state='dive';k.diveUntil=this.elapsed+.35;this.events.push('dive');}return;
      }
      if(k.state==='dive'&&this.elapsed>=k.diveUntil){
        const exposed=!p.hidden&&!this.shaded()&&distance(k.shadow,p)<=k.radius&&this.elapsed>=this.invulnerableUntil;
        k.strikes++;k.state='circling';k.nextAt=this.elapsed+k.every;k.lastStrike={...k.shadow,at:this.elapsed,hit:exposed};
        if(!exposed){k.dodges++;return;}
        this.alarms++;if(!this.shedTail(null))this.finish('caught','The hawk dropped out of the sun. Shelter under an awning, in leaves, or blend in.');
      }
    }
    // Three to five bugs on open floor away from the start, chosen from a seed so a run can be replayed.
    makeGlowbugs(seed){
      let s=(Math.abs(Math.floor(seed))%2147483646)+1;const rand=()=>(s=s*16807%2147483647)/2147483647,start=centre(...this.level.spawn),spots=[];
      for(let y=1;y<this.height-1;y++)for(let x=1;x<this.width-1;x++)if(['.','L','N','M'].includes(this.grid[y][x])&&distance(centre(x,y),start)>=4&&distance(centre(x,y),this.exit)>=2)spots.push(centre(x,y));
      const bugs=[];for(let n=3+Math.floor(rand()*3);n>0&&spots.length;n--){const home=spots.splice(Math.floor(rand()*spots.length),1)[0];bugs.push({home,x:home.x,y:home.y,phase:rand()*Math.PI*2,caught:false});}
      return bugs;
    }
    // Each bug loops lazily inside its own tile, so it never needs a path.
    updateGlowbugs(){
      for(const b of this.glowbugs){if(b.caught)continue;const t=this.elapsed*.9+b.phase;b.x=b.home.x+Math.sin(t)*.32;b.y=b.home.y+Math.sin(t*1.7)*.22;}
      const p=this.player;for(const b of this.glowbugs)if(!b.caught&&distance(p,b)<0.55)this.catchGlowbug(b);
    }
    catchGlowbug(b){if(b.caught)return;b.caught=true;this.glowbugsCaught++;const left=this.glowbugs.filter(g=>!g.caught).length;this.notice('Glow bug freed! It drifts off toward the lanterns. A little bonus treasure.'+(left?' '+left+' still drifting about.':' That was the last one.'),'glowbug');}
    eatRegrowthBug(bug){
      if(bug.eaten||this.hasTail)return;bug.eaten=true;this.hasTail=true;
      this.notice('Crunch! Sally\'s tail grows back.','regrow');
    }
    updateTongue(){
      const t=this.tongue;if(!t)return;
      const age=this.elapsed-t.startedAt;
      if(!t.hit&&age>=.14){
        t.hit=true;if(t.kind==='miss')return;const present=t.kind==='eat'?!this.hunters[t.index]?.eaten:t.kind==='switch'?!this.gates[t.index].open&&!this.gates[t.index].sealed:t.kind==='key'?!this.hasKey:t.kind==='bug'?!this.regrowthBugs[t.index].eaten&&!this.hasTail:t.kind==='glow'?!this.glowbugs[t.index].caught:t.kind==='lure'?this.hunters[t.index]?.state==='lurking':!this.loot[t.index].taken;
        if(present&&t.kind==='lure')this.springAngler(this.hunters[t.index],copy(this.player),.35);
        else if(present&&distance(this.player,t.point)<=this.tongueRange+1e-9&&this.clear(this.player,t.point,true)){
          t.caught=true;t.kind==='eat'?this.eatInsect(this.hunters[t.index]):t.kind==='switch'?this.tongueSwitch(this.gates[t.index]):t.kind==='key'?this.collectKey(true):t.kind==='bug'?this.eatRegrowthBug(this.regrowthBugs[t.index]):t.kind==='glow'?this.catchGlowbug(this.glowbugs[t.index]):this.collectLoot(this.loot[t.index]);
        }else this.notice('The grab missed. Keep a clear line and stay within reach.');
      }
      if(age>=.34)this.tongue=null;
    }
    advance(seconds,input={}){
      if(!this.active() || !Number.isFinite(seconds) || seconds<=0)return;
      this.accumulator+=Math.min(seconds,0.1);
      while(this.accumulator+1e-10>=1/120 && this.active()){
        this.accumulator-=1/120;this.step(1/120,input);
      }
    }
    step(dt,input){
      this.elapsed+=dt;
      if(this.level.rootWheel)this.wheelAngle+=Math.min(this.reactionsFired.size*Math.PI*.5-this.wheelAngle,dt*Math.PI/1.4);
      this.updateSeedGrowth();this.updateTimedGates();this.updateClosingGates();
      this.webs=this.webs.filter(w=>w.expires>this.elapsed&&(!w.owner||this.hunters.includes(w.owner)));this.updateTripwires();
      this.updateEmergences();
      this.noteMet();if(this.gentle)this.updateCheckpoints();
      // A tangle vine's grip stops Sally moving until it lets go.
      if(this.elapsed<this.heldUntil)input={};
      // While a throw is held, the stick or keys aim it and Sally stands still.
      if(input.aiming){const l=Math.hypot(input.x||0,input.y||0);if(l){this.player.throwAim={x:input.x/l,y:input.y/l};this.player.facing=Math.abs(input.x)>=Math.abs(input.y)?{x:Math.sign(input.x),y:0}:{x:0,y:Math.sign(input.y)};}input={};}
      // In the air off a bounce cap Sally follows her arc and cannot steer.
      if(this.player.underground){const u=this.player.underground;input={};if(this.elapsed-u.start>=u.dur){this.player.x=u.to.x;this.player.y=u.to.y;this.player.underground=null;this.motion.resetPlayer?.(this.player);this.events.push('tunnel');this.updateVisibility(true);}}
      if(this.player.flight){this.slideVelocity.x=0;this.slideVelocity.y=0;const f=this.player.flight,t=Math.min(1,(this.elapsed-f.start)/f.dur);this.player.x=f.from.x+(f.to.x-f.from.x)*t;this.player.y=f.from.y+(f.to.y-f.from.y)*t;input={};if(t>=1){this.player.flight=null;this.events.push('hop');}}
      // Digging in: held on a soft dirt patch, Sally scrabbles for 0.75 s (noisy, dust flying), then
      // lies buried, hidden from everything and safe, until the button is let go.
      if(this.soil.size){const q=this.player;
        if(input.dig&&(q.dig||this.soil.has(this.tileKey(q)))&&!q.swimming&&!q.flight&&!q.underground){
          if(!q.dig){q.dig={start:this.elapsed,buried:false};this.cue('dig',q);}
          if(!q.dig.buried&&this.elapsed-q.dig.start>=EscapeAdventure.DIG_TIME){q.dig.buried=true;this.digs++;this.cue('buried',q);}
          input={};
        }else if(q.dig){const was=q.dig.buried;q.dig=null;if(was)this.cue('unbury',q);}
      }
      const p=this.player,old=copy(p),length=Math.hypot(input.x||0,input.y||0);
      const dx=length>0?(input.x||0)/Math.max(1,length):0,dy=length>0?(input.y||0)/Math.max(1,length):0;
      if(length&&this.elapsed>=(this.lookUntil||0)){p.facing=Math.abs(dx)>=Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)};p.tongueAim={x:(input.x||0)/length,y:(input.y||0)/length};}
      // A controller's right stick turns Sally's head: the tongue and throws aim where she looks. Which way
      // she faces (what hunters and gaze levels go by) still follows her feet.
      const look=input.look,lookLength=look?Math.hypot(look.x||0,look.y||0):0;if(lookLength>=.35){p.lookAim={x:look.x/lookLength,y:look.y/lookLength};p.tongueAim={...p.lookAim};}else p.lookAim=null;
      if(p.stamina<=0)p.exhausted=true;
      if(p.exhausted&&p.stamina>=25)p.exhausted=false;
      p.webbed=this.webs.some(w=>distance(p,w)<.65&&this.clear(p,w));
      if(this.cold.size)this.updateWarmth(dt);
      const crawl=Boolean(input.crawl&&!this.water(p)),sprint=!crawl&&Boolean(input.sprint&&!p.exhausted&&!p.chilled&&p.stamina>0&&length>0),mud=this.grid[Math.floor(p.y)][Math.floor(p.x)]==='M',sand=!p.swimming&&this.softSand.has(this.tileKey(p)),speed=(sprint?4:crawl?1.25:2.45)*(this.hasTail?1:.9)*(p.warmth<=0?.5:p.chilled?.72:1)*(p.webbed?.45:mud?.72*(1-.5*(p.sink||0)):sand?.7:1)*(this.water(p)?.55:1);
      const onIce=this.slippery.has(this.tileKey(p)),special=p.flight||p.underground||p.dig||this.heldBy;
      if(special){this.slideVelocity.x=0;this.slideVelocity.y=0;}
      // Stepping onto ice keeps the speed Sally arrived with; from there the glide builds past a
      // walk and steering is weak, so a run onto the ice feels like losing control, not stalling.
      if(onIce&&!special&&!this.wasOnIce&&Math.hypot(this.slideVelocity.x,this.slideVelocity.y)<.05&&this.playerVelocity){this.slideVelocity.x=this.playerVelocity.x;this.slideVelocity.y=this.playerVelocity.y;}
      this.wasOnIce=onIce&&!special;
      const skating=!special&&(onIce||Math.hypot(this.slideVelocity.x,this.slideVelocity.y)>.018);
      const travel=skating?Ice.steer(this.slideVelocity,{x:dx,y:dy},speed,dt,{ice:onIce,brake:crawl,glide:onIce}):{x:dx*speed*dt,y:dy*speed*dt};
      // On ice a wall knocks Sally back a little instead of stopping her dead.
      for(const axis of ['x','y']){const next={...p,[axis]:p[axis]+travel[axis]};if(this.fits(next)&&!(this.vents.length&&this.inJet(next)&&!this.inJet(p)))p[axis]=next[axis];else{const hit=this.slideVelocity[axis];this.slideVelocity[axis]=onIce?-hit*.35:0;if(onIce&&Math.abs(hit)>1.6){this.events.push('scrape');this.iceBumpAt=this.elapsed;}}}
      p.sliding=onIce&&Math.hypot(this.slideVelocity.x,this.slideVelocity.y)>.12;
      if(!onIce&&Math.hypot(this.slideVelocity.x-dx*speed,this.slideVelocity.y-dy*speed)<.04){this.slideVelocity.x=0;this.slideVelocity.y=0;}
      if(this.wind.length&&!p.flight){const gust=this.wind.find(w=>this.gustPhase(w).active&&w.keys.has(this.tileKey(p)));if(gust)for(const [axis,d] of [['x',gust.dir[0]],['y',gust.dir[1]]]){if(!d)continue;const next={...p,[axis]:p[axis]+d*2.3*dt};if(this.fits(next))p[axis]=next[axis];
        // A gust that shoves Sally against a ledge over a gap blows her off it.
        else if(this.grid[Math.floor(next.y+d*(axis==='y'?.3:0))]?.[Math.floor(next.x+d*(axis==='x'?.3:0))]==='P'&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(null)){this.finish('caught','A gust blew Sally off the ledge. Watch the streaks: when they thicken, get out of the lane or brace against a wall.');return;}}}
      if(this.currents.length&&!p.underground&&!p.flight){const c=Ice.currentAt(this.currents,p,this.water(p)),f=this.flow;
        // A ground slope carries Sally at a steady pace and lets go exactly at its end.
        if(c?.surface==='ground'){f.x=0;f.y=0;for(const [axis,d] of [['x',c.dir[0]],['y',c.dir[1]]]){if(!d)continue;const next={...p,[axis]:p[axis]+d*c.speed*dt};if(this.fits(next))p[axis]=next[axis];}}
        // Water has weight: a stream builds Sally up to its speed, and after she swims out of it she
        // drifts on a little before the still water lets go. Climbing onto land stops the drift.
        else{const s=c?this.flowSpeed(c):0,k=1-Math.exp(-(c?3:2.2)*dt);f.x+=((c?c.dir[0]*s:0)-f.x)*k;f.y+=((c?c.dir[1]*s:0)-f.y)*k;if(!c&&!this.water(p)){f.x=0;f.y=0;}
          for(const axis of ['x','y']){if(Math.abs(f[axis])<1e-4)continue;const next={...p,[axis]:p[axis]+f[axis]*dt};if(this.fits(next))p[axis]=next[axis];else f[axis]=0;}}}
      p.swimming=this.water(p);if(p.swimming)this.swimDistance+=distance(old,p);
      // Mud sucks at a lizard that lingers: after a second standing still she sinks (slowly if she crawls), and the
      // deeper she is the harder it is to move; keeping on the move pulls her free again.
      {const inMud=!this.water(p)&&!p.flight&&!p.underground&&this.grid[Math.floor(p.y)][Math.floor(p.x)]==='M',was=p.sink||0,moving=distance(old,p)>0.0001;
        if(inMud){p.mudStill=moving?0:(p.mudStill||0)+dt;p.sink=Math.max(0,Math.min(1,was+(moving?-.3:p.mudStill<1?0:crawl?.25:.55)*dt));if(was<.5&&p.sink>=.5)this.notice('Sally is sinking into the mud! Keep moving.');if(moving&&was>.45&&!p.squelched){this.events.push('squish');p.squelched=true;}if(!moving)p.squelched=false;}
        else{p.sink=Math.max(0,was-2*dt);p.mudStill=0;}}if(p.swimming&&!this.water(old))this.events.push('splash');p.moving=distance(old,p)>0.0001;p.sprinting=sprint&&p.moving;p.crawling=crawl&&!p.swimming;this.playerVelocity={x:(p.x-old.x)/dt,y:(p.y-old.y)/dt};this.trackSally(dt);
      p.stamina=Math.max(0,Math.min(100,p.stamina+(p.sprinting?-24:18)*dt));
      if(this.camoUntil>this.elapsed&&p.moving){this.camoUntil=0;this.notice('Moving broke the camouflage.');}
      p.camo=this.camoUntil>this.elapsed;
      if(this.puffs.length)this.updatePuffs();else if(this.clouds.length)this.clouds=this.clouds.filter(c=>c.until>this.elapsed);
      if(this.caps.length&&!p.flight&&p.moving){const cap=this.caps.find(c=>c.key===this.tileKey(p)&&this.elapsed>=c.readyAt);if(cap){p.flight={from:centre(...cap.at),to:centre(...cap.to),start:this.elapsed,dur:.55};cap.readyAt=this.elapsed+1;this.invulnerableUntil=Math.max(this.invulnerableUntil,this.elapsed+.6);this.events.push('hop');}}
      p.hidden=Boolean(p.underground)||this.inRayShadow(p)||!p.moving&&!this.heldBy&&(this.grid[Math.floor(p.y)][Math.floor(p.x)]==='L'||p.camo)||this.clouds.length>0&&!this.heldBy&&this.inCloud(p);
      p.webbed=this.webs.some(w=>distance(p,w)<.65&&this.clear(p,w));
      // A crawl makes no sound, even on gravel.
      p.silent=this.moss.size>0&&this.moss.has(this.tileKey(p));p.loud=p.sprinting&&!p.silent;
      // Gravel crunches underfoot; mud splashes when Sally runs through it.
      p.noisy=p.loud||(p.moving&&!p.crawling&&!p.silent&&(this.grid[Math.floor(p.y)][Math.floor(p.x)]==='N'||p.sprinting&&this.grid[Math.floor(p.y)][Math.floor(p.x)]==='M'));
      if(p.dig){if(p.dig.buried){p.hidden=true;p.noisy=false;this.invulnerableUntil=Math.max(this.invulnerableUntil,this.elapsed+.05);}else p.noisy=true;}
      if(p.noisy&&this.echoes.length&&this.elapsed>=(this.echoAt||0)&&this.inEcho(p)){this.echoAt=this.elapsed+1.2;this.events.push('echo');}
      if(this.level.dark){
        this.glowTrail=this.glowTrail.filter(t=>t.expires>this.elapsed);
        if(p.moving&&this.elapsed>=this.trailAt){this.glowTrail.push({...copy(p),born:this.elapsed,expires:this.elapsed+8});this.trailAt=this.elapsed+.18;}
      }
      this.activateSwitches();this.reactToMaze('enter');this.updateVisibility();
      if(this.flights.length||this.lights.length)this.updateFlights();
      if(this.decoy&&this.decoy.expires<=this.elapsed)this.decoy=null;
      if(this.decoy&&this.currents.length&&this.water(this.decoy)){const c=Ice.currentAt(this.currents,this.decoy,true);if(c&&c.surface!=='ground'){const s=this.flowSpeed(c)*.9;for(const [axis,d] of [['x',c.dir[0]],['y',c.dir[1]]]){if(!d)continue;const next={...this.decoy,[axis]:this.decoy[axis]+d*s*dt};if(this.water(next)&&this.fits(next,.1))this.decoy[axis]=next[axis];}this.decoy.floating=true;}}
      this.updateRivalries();for(const hunter of this.hunters)this.updateHunter(dt*(this.gentle?.pace||1),hunter);this.updateRivalries();
      this.motion.update(dt,this);this.checkTailTouch();
      if(this.vents.length)this.updateVents();
      if(this.vines.length)this.updateVines();if(this.status!=='playing')return;
      if(this.logs.length||this.thorns.length||this.level.crumble)this.updateTraps();if(this.status!=='playing')return;
      if(this.tide)this.applyTide();
      if(this.storm||this.wind.length)this.updateStorm();
      this.updateHawk(dt);if(this.status!=='playing')return;
      if(this.antTrails.length&&this.elapsed>=this.invulnerableUntil&&this.antAt(p)){this.alarms++;if(!this.shedTail(null)){this.finish('caught','The ant column marched right over Sally. Cross in the gaps between groups.');return;}}
      const sniper=this.elapsed>=this.invulnerableUntil&&!p.hidden&&this.toadTongueHit();
      if(sniper){this.alarms++;if(this.shedTail(sniper))return;this.finish('caught','The toad\'s tongue snapped Sally up. Break its line of sight behind pillars or cover.');return;}
      const stinger=this.hunters.find(h=>h.kind==='scorpion'&&h.state==='sting'&&h.aim&&distance(h,h.aim)<=(h.reach||1.8)+1&&distance(p,h.aim)<.9&&this.clear(h,p,true));
      if(this.elapsed>=this.invulnerableUntil&&stinger&&this.shedTail(stinger))return;
      if(this.elapsed>=this.invulnerableUntil&&stinger){this.finish('caught','The scorpion struck. Cross its ring while the tail is down, or change direction when it strikes.');return;}
      // Capture wins over picking up the key or escaping in the same simulation step.
      const captor=this.hunters.find(h=>!(LIGHT_SHY.has(h.kind)&&this.lights.length&&this.inLight(p))&&!h.eaten&&!['emerge','dig','buried','rise','clash','steamed','stunned'].includes(h.state)&&this.elapsed>=(h.graceUntil||0)&&!(h.kind==='mimic'&&['rooted','reveal'].includes(h.state))&&!(h.kind==='owl'&&h.state!=='swoop')&&h.kind!=='gecko'&&h.kind!=='cricket'&&h.kind!=='magpie'&&h.kind!=='ladybird'&&h.kind!=='angler'&&h.kind!=='echofrog'&&h.kind!=='sentinel'&&h.kind!=='cloudray'&&h.kind!=='flytrap'&&h.kind!=='heron'&&h.kind!=='mantis'&&h.kind!=='wasp'&&h.kind!=='dragonfly'&&h.kind!=='mole'&&h.kind!=='bat'&&h.kind!=='eel'&&!(h.kind==='crab'&&h.state!=='scuttle')&&distance(p,h)<(h.kind==='beetle'&&h.state==='charge'?.62:.48)&&this.clear(p,h));
      if(this.elapsed>=this.invulnerableUntil&&captor&&this.shedTail(captor))return;
      if(this.elapsed>=this.invulnerableUntil && captor){
        this.finish('caught',captor.kind==='owl'?'The owl dropped onto its marked spot. Leave the glare before it swoops.':captor.kind==='millipede'?'A rustle, then darkness. It crept up while Sally looked away. Keep it in view as you back off.':captor.kind==='mimic'?'That chest was a mimic! Watch for its tell, or throw a pebble to make it snap first.':captor.kind==='fox'?'A snow fox heard Sally and pounced. Stand still, keep to quiet ground, or toss a pebble to send it pouncing elsewhere.':captor.kind==='crab'?'A hermit crab scuttled out and pinched Sally. Pass its lane while it is tucked in, or send it back into its shell with a pebble.':captor.kind==='cobra'?'The king cobra struck. Step out of its line the moment it rears, then break its sight.':captor.kind==='moth'?'Pale wings found the glowing trail. Leave the marked ground before the swoop.':captor.reason==='heard'?'Noise gave you away. Find quiet floor or use cover.':'A hunter spotted you. Break sight at a corner or use a pebble.');return;
      }
      if(this.challenge?.noChase&&this.alarms>0){this.finish('failed','A hunter gave chase. Break sight before it is sure next time.');return;}
      if(this.challenge?.noChill&&this.player.chilled){this.finish('failed','Sally got too cold. Thaw on warm stones before the frost slows her.');return;}
      if(this.challenge?.noTheft&&this.stolen>0){this.finish('failed','A gecko got away with your treasure. Catch thieves before they reach their burrows.');return;}
      if(this.timeLimit&&this.elapsed>=this.timeLimit){this.finish('failed','Time ran out. Try a shorter route or save a burrow for the return.');return;}
      this.updateTongue();
      if(this.challenge?.keyByTongue&&!this.hasKey&&this.tongues===0&&!this.tongue){this.finish('failed','The key needs a tongue grab. Save one for it next time.');return;}
      if(!this.hasKey&&distance(p,this.key)<0.5&&this.clear(p,this.key)&&!(this.tongue?.kind==='key'&&!this.tongue.hit)){
        if(!this.challenge?.keyByTongue)this.collectKey();
        else if(this.messageUntil<this.elapsed)this.notice('This challenge needs a tongue grab for the key. Step back and face it.');
      }
      for(const loot of this.loot)if(!loot.taken&&distance(p,loot)<0.5&&this.clear(p,loot)&&!(this.tongue?.kind==='loot'&&this.loot[this.tongue.index]===loot&&!this.tongue.hit)){
        this.collectLoot(loot);
      }
      if(this.droppedTail&&this.droppedTail.expires<=this.elapsed)this.droppedTail=null;
      if(!this.hasTail)for(const bug of this.regrowthBugs)if(!bug.eaten&&distance(p,bug)<0.5&&this.clear(p,bug))this.eatRegrowthBug(bug);
      if(this.glowbugs.length)this.updateGlowbugs();
      if(distance(p,this.exit)<0.55){
        if(this.exitUnlocked()){this.exitHold+=dt;if(this.exitHold>=0.55)this.finish('won','Sally made it out!');}
        else if(this.messageUntil<this.elapsed)this.notice(!this.hasKey?'The hatch needs the golden key.':this.treasure<this.requiredTreasure?'Bring '+(this.requiredTreasure-this.treasure)+' more treasure to the hatch.':'Daze '+(this.challenge.steamTraps-this.steamed)+' more hunters with steam first.');
      }else this.exitHold=0;
    }
    exitUnlocked(){return this.hasKey&&this.treasure>=this.requiredTreasure&&(!this.challenge?.keyByTongue||this.keyByTongue)&&(!this.challenge?.steamTraps||this.steamed>=this.challenge.steamTraps);}
    // A moth's glow lights Sally up: leaves no longer hide her and hunters see further.
    lit(){const p=this.player;return this.hunters.some(m=>m.kind==='moth'&&!m.eaten&&distance(m,p)<=2.6&&this.clear(m,p,true));}
    seesPlayer(h=this.hunter){
      // Just after a gentle level's "Oops!" nothing notices her for a moment.
      if(this.player.underground||this.player.dig?.buried||this.gentle&&this.elapsed<this.invulnerableUntil)return false;
      const p=this.player,d=distance(p,h),lit=this.hunters.length>1&&this.lit()||this.lights.length>0&&this.inLight(p);
      if(this.clouds.length&&this.inCloud(h))return false;
      if(this.elapsed<this.flashUntil&&d<=9&&this.clear(h,p,true)&&!(this.clouds.length&&this.inCloud(p)))return true;
      if((p.hidden&&!lit)||d>(lit?6.5:4.5)||!this.clear(h,p,true))return false;
      const angle=Math.atan2(p.y-h.y,p.x-h.x);
      const difference=Math.atan2(Math.sin(angle-h.facing),Math.cos(angle-h.facing));
      return d<1 || Math.abs(difference)<(h.kind==='beetle'?Math.PI/5:Math.PI/3);
    }
    updateHunter(dt,h=this.hunter){
      this.hunterDt=dt;
      if(h.eaten)return;
      if(h.state==='steamed'){if(this.elapsed>=h.phaseUntil){h.state=h.kind==='mimic'?'rooted':'patrol';h.graceUntil=this.elapsed+.5;
        if(h.bonkFrom){if(['snake','sea-snake','cobra','chameleon','spider','toad','beetle','gecko'].includes(h.kind)){h.state='search';h.lastKnown=h.bonkFrom;h.searchUntil=this.elapsed+this.cunning.search+1.5;}h.bonkFrom=null;}}return;}
      if(this.updateGlowFear(dt,h))return;
      if(h.tailLureUntil){
        if(this.elapsed<h.tailLureUntil&&this.droppedTail){h.state='decoy';h.awareness=0;h.lastKnown=null;h.aim=null;if(distance(h,this.droppedTail)>.3)this.moveHunter(this.droppedTail,1.3*dt,h);return;}
        h.tailLureUntil=0;h.state=h.kind==='mimic'?'rooted':'patrol';h.path=[];h.targetId=null;h.aim=null;h.awareness=0;h.lastKnown=null;h.graceUntil=Math.max(h.graceUntil||0,this.elapsed+.4);
      }
      if(h.state==='clash'){if(this.elapsed>=h.phaseUntil){h.state='patrol';h.path=[];h.targetId=null;h.awareness=0;h.graceUntil=this.elapsed+.6;}return;}
      if(h.kind==='fish'){this.updateFish(dt,h);return;}
      if(h.state==='emerge'){if(this.elapsed>=h.phaseUntil)h.state=h.kind==='mimic'?'rooted':'patrol';return;}
      if(h.kind==='millipede'){this.updateMillipede(dt,h);return;}
      if(h.kind==='cricket'){this.updateCricket(dt,h);return;}
      if(h.kind==='moth'){this.updateMoth(dt,h);return;}
      if(h.kind==='owl'){this.updateOwl(dt,h);return;}
      if(h.kind==='magpie'){this.updateMagpie(dt,h);return;}
      if(h.kind==='ladybird'){this.updateLadybird(dt,h);return;}
      if(h.kind==='gecko'){this.updateGecko(dt,h);return;}
      if(h.kind==='mimic'){this.updateMimic(dt,h);return;}
      if(h.kind==='toad'||h.kind==='spider'){this.updateNestHunter(dt,h);return;}
      if(h.kind==='scorpion'){this.updateScorpion(dt,h);return;}
      if(h.kind==='beetle'){this.updateBeetle(dt,h);return;}
      if(h.kind==='cobra'&&this.updateCobra(dt,h))return;
      if(h.kind==='angler'){this.updateAngler(dt,h);return;}
      if(h.kind==='flytrap'){this.updateFlytrap(dt,h);return;}
      if(h.kind==='heron'){this.updateHeron(dt,h);return;}
      if(h.kind==='mantis'){this.updateMantis(dt,h);return;}
      if(h.kind==='wasp'){this.updateWasp(dt,h);return;}
      if(h.kind==='dragonfly'){this.updateDragonfly(dt,h);return;}
      if(h.kind==='mole'){this.updateMole(dt,h);return;}
      if(h.kind==='bat'){this.updateBat(dt,h);return;}
      if(h.kind==='eel'){this.updateEel(dt,h);return;}
      if(h.kind==='crab'){this.updateCrab(dt,h);return;}
      if(h.kind==='fox'){this.updateFox(dt,h);return;}
      if(h.kind==='echofrog'){this.updateEchoFrog(dt,h);return;}
      if(h.kind==='sentinel'){this.updateSentinel(dt,h);return;}
      if(h.kind==='cloudray'){this.updateCloudRay(dt,h);return;}
      const p=this.player,previousState=h.state;
      // Nearby visible danger overrides a lure; a pebble cannot make it ignore a bite.
      const seen=(this.seesPlayer(h)||this.feelsPlayer(h))&&!(p.crawling&&distance(h,p)>(this.hunters.length>1&&this.lit()?5.5:3.5)&&this.elapsed>=this.flashUntil),heard=(p.noisy||p.loud)&&!p.hidden&&this.audible(h,p,p.loud?6:3.5);
      const lure=this.decoy&&this.audible(h,this.decoy,this.decoy.range||9)&&!(seen&&(this.decoy.chirp||distance(h,p)<1.2));
      let target,speed=1.25;
      if(lure){
        if(!this.decoy.noticed){this.decoy.noticed=true;this.notice(this.decoy.croak?'It heard the frog. Now is your chance!':'It heard the pebble. Now is your chance!','distracted');}
        h.state='decoy';h.awareness=0;h.lastKnown=null;target=this.decoy;speed=1.7;
      }else if(seen||heard){
        h.reason=seen?'seen':'heard';h.lastKnown=copy(p);h.lastObserved=this.elapsed;
        const sure=(p.crawling&&!heard?1.2:0.7)*this.cunning.react;h.awareness=Math.min(1,h.awareness+dt/sure);
        h.state=h.awareness>=1?'chase':'alert';target=h.lastKnown;
        if(h.state==='alert'){
          if(h.awareness-dt/sure<=0)this.cue('warning',h);
          h.facing=Math.atan2(p.y-h.y,p.x-h.x);speed=0;
        }else speed=2.75;
      }else if(h.state==='alert'){
        h.awareness=Math.max(0,h.awareness-dt*1.5);speed=0;
        if(h.awareness===0){h.lastKnown=null;h.state='patrol';}
      }else if(h.lastKnown&&this.elapsed-h.lastObserved<this.cunning.memory){h.state='chase';target=h.lastKnown;speed=2.75;}
      else if(h.state==='chase'){
        h.state='search';h.searchUntil=this.elapsed+this.cunning.search;h.awareness=0;
        this.closeCalls++;this.notice('Lost it. Catch your breath.','lost');target=h.lastKnown;speed=1.3;
      }else if(h.state==='search'&&this.elapsed<h.searchUntil){
        target=h.lastKnown;speed=1.3;if(target&&distance(h,target)<0.15){h.facing+=dt;speed=0;}
      }else{
        h.state='patrol';h.awareness=Math.max(0,h.awareness-dt*1.5);h.lastKnown=null;
        target=h.patrol[h.routeIndex];
        if(distance(h,target)<0.1){
          if(h.pauseUntil===0)h.pauseUntil=this.elapsed+(h.kind==='chameleon'?1.8:0.75);
          if(this.elapsed<h.pauseUntil){speed=0;}else{h.pauseUntil=0;h.routeIndex=(h.routeIndex+1)%h.patrol.length;target=h.patrol[h.routeIndex];if(h.kind==='chameleon')this.cue('rustle',h);}
        }
      }
      if(h.state==='chase'&&previousState!=='chase'){this.alarms++;this.cue('spotted',h);}
      // A king cobra hunts a little faster than any snake.
      if(h.kind==='cobra')speed*=1.18;
      // A chameleon creeps a little slower than a snake; the scene shows it only while it moves.
      if(h.kind==='chameleon')speed*=.88;
      if(target&&speed>0){this.moveHunter(target,speed*dt,h);h.movedAt=this.elapsed;}
    }
    updateRivalries(){
      if(!this.active())return;
      // Only authored rivals clash. Armed strikes keep their original targets;
      // neither walls nor another fight can silently cancel their warning.
      const free=h=>!['clash','steamed','stunned','raise','emerge','windup','charge','sting','leap','lunge','reveal','glimmer','swoop','dig','buried','rise'].includes(h.state)&&this.elapsed>=(h.rivalReadyAt||0);
      for(const [a,b] of this.level.rivalries||[]){
        const first=this.hunters.find(h=>h.id===a),second=this.hunters.find(h=>h.id===b);
        if(!first||!second||!free(first)||!free(second)||distance(first,second)>1.35||!this.clear(first,second))continue;
        for(const [h,other] of [[first,second],[second,first]]){h.state='clash';h.phaseUntil=this.elapsed+3;h.rivalReadyAt=this.elapsed+11;h.path=[];h.targetId=null;h.facing=Math.atan2(other.y-h.y,other.x-h.x);}
        this.clashes++;this.notice('The hunters clash! Slip past while they are distracted.','clash');
      }
    }
    // Angler: a glow that bobs over dark water. Step close or grab it and the angler lunges
    // at where Sally stood, then sinks for a few seconds before the lure lights again.
    springAngler(h,aim,delay){
      if(!h||h.state!=='lurking')return;
      h.state='snap';h.aim=aim;h.phaseUntil=this.elapsed+delay;this.alarms++;this.events.push('splash');
      this.notice('That was no glow bug! Something rises from the water.','warning');
    }
    updateAngler(dt,h){
      const p=this.player;
      // A pebble landing by the lure springs it too, so a careful player can empty a pool from afar.
      if(h.state==='lurking'){if(distance(p,h.lure)<.6)this.springAngler(h,copy(h.lure),.22);else if(this.decoy&&!this.decoy.chirp&&distance(this.decoy,h.lure)<.9)this.springAngler(h,copy(h.lure),.22);return;}
      if(h.state==='snap'){
        if(this.elapsed<h.phaseUntil)return;
        h.state='sink';h.phaseUntil=this.elapsed+3.5;this.cue('snap',h);
        if(distance(p,h.aim)<.95&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','An angler snapped from the dark water. A glow that bobs on a line is bait.');
        return;
      }
      if(h.state==='sink'&&this.elapsed>=h.phaseUntil)h.state='lurking';
    }
    // Snow fox: it hunts by ear, not by eye. Footsteps close by, a sprint or noisy ground further off,
    // or a pebble, and it crouches for a blink and pounces on the sound, far and fast, with none of
    // the usual warning. Then it sniffs about where it landed before going back to its rounds.
    updateFox(dt,h){
      const p=this.player;
      if(h.state==='crouch'){if(this.elapsed>=h.phaseUntil){h.state='pounce';h.pounceFrom=copy(h);h.phaseUntil=this.elapsed+.6;this.cue('skitter',h);}return;}
      if(h.state==='pounce'){
        const remaining=distance(h,h.aim),step=Math.min(remaining,8*dt),next={x:h.x+Math.cos(h.facing)*step,y:h.y+Math.sin(h.facing)*step};
        if(remaining<.05||this.elapsed>=h.phaseUntil||!this.fits(next,.22,h)){h.state='sniff';h.phaseUntil=this.elapsed+1.6*this.cunning.rest;h.path=[];return;}
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return;
      }
      const heard=(p.noisy||p.loud)&&this.audible(h,p,7)||p.moving&&!p.hidden&&!p.silent&&this.audible(h,p,(p.crawling?1:2.6)*this.cunning.ear),lure=this.decoy&&this.decoy.expires!==h.lastLure&&this.audible(h,this.decoy,7);
      if((heard||lure)&&this.elapsed>=(h.calmUntil||0)){
        const target=lure&&!heard?copy(this.decoy):this.lead(.2*this.cunning.aim);if(lure)h.lastLure=this.decoy.expires;
        const d=Math.min(distance(h,target)+.4,4.5),a=Math.atan2(target.y-h.y,target.x-h.x);
        h.aim={x:h.x+Math.cos(a)*d,y:h.y+Math.sin(a)*d};h.facing=a;h.state='crouch';h.phaseUntil=this.elapsed+(this.level.foxWarn??.22)*this.cunning.warn;if(this.level.seasonal==='autumn-hollow')this.cue('gobble',h);h.reason='heard';h.calmUntil=this.elapsed+2.2;this.alarms++;return;
      }
      if(h.state==='sniff'){if(this.elapsed<h.phaseUntil)return;h.state='patrol';}
      const target=h.patrol[h.routeIndex];if(distance(h,target)<.1){h.routeIndex=(h.routeIndex+1)%h.patrol.length;return;}
      h.facing=Math.atan2(target.y-h.y,target.x-h.x);this.moveHunter(target,1.25*dt,h);
    }
    // Hermit crab: hides in its shell until Sally comes close, peeks out, then scuttles sideways
    // along its beach lane to cut her off and pinch. A pebble landing by it sends it back into
    // its shell for a while. It never leaves its lane.
    updateCrab(dt,h){
      const p=this.player,a=h.axis,b=a==='x'?'y':'x',lo=h.home[a]-h.range,hi=h.home[a]+h.range;
      const slide=(to,speed)=>{const d=Math.max(lo,Math.min(hi,to))-h[a],step=Math.sign(d)*Math.min(Math.abs(d),speed*dt),next={...copy(h),[a]:h[a]+step};if(step&&this.fits(next,.22,h)){h[a]=next[a];h.distanceMoved+=Math.abs(step);return true;}return false;};
      if(this.decoy&&this.decoy.expires!==h.lastLure&&distance(h,this.decoy)<1.5){h.lastLure=this.decoy.expires;h.state='hide';h.phaseUntil=this.elapsed+3;h.aim=null;this.cue('scrape',h);return;}
      if(h.state==='hide'){if(this.elapsed>=h.phaseUntil)h.state='return';return;}
      if(h.state==='peek'){if(this.elapsed>=h.phaseUntil){h.state='scuttle';h.phaseUntil=this.elapsed+1.3;this.alarms++;this.cue('skitter',h);}return;}
      if(h.state==='scuttle'){
        const lead=this.lead(.3),aim=Math.max(lo,Math.min(hi,lead[a]));h.facing=a==='x'?(aim>=h.x?0:Math.PI):(aim>=h.y?Math.PI/2:-Math.PI/2);
        if(!slide(aim,4.6)&&Math.abs(aim-h[a])<.05||this.elapsed>=h.phaseUntil){h.state='tired';h.phaseUntil=this.elapsed+1.6;}
        return;
      }
      if(h.state==='tired'){if(this.elapsed>=h.phaseUntil)h.state='return';return;}
      if(h.state==='return'){if(!slide(h.home[a],1.2)||Math.abs(h[a]-h.home[a])<.05)h.state='shell';return;}
      // In its shell: wake only for Sally in plain sight close by, roughly level with its lane.
      if(!p.hidden&&distance(h,p)<=3&&Math.abs(p[b]-h[b])<=2.2&&this.clear(h,p,true)){h.state='peek';h.phaseUntil=this.elapsed+.35;this.cue('rustle',h);}
    }
    // Flytrap: rooted and always shown. Anything that comes within reach (or a pebble that lands
    // there) makes it snap where Sally is heading; then it chews for a while and is harmless.
    // Echo frog: harmless itself. Noise near it (Sally's steps on gravel, a sprint, a pebble's
    // clack) fills its throat for two seconds, then it croaks it back loudly from where it sits,
    // and hunters in earshot come to look there instead. Then it rests a while.
    updateEchoFrog(dt,h){
      const p=this.player;
      if(h.state==='swell'){if(this.elapsed<h.phaseUntil)return;h.state='croak';h.phaseUntil=this.elapsed+.6;h.readyAt=this.elapsed+6;
        this.decoy={x:h.x,y:h.y,expires:this.elapsed+3,noticed:false,croak:true};this.cue('croak',h);return;}
      if(h.state==='croak'){if(this.elapsed>=h.phaseUntil)h.state='listen';return;}
      if(this.elapsed<(h.readyAt||0))return;
      const heard=p.noisy&&!p.hidden&&this.audible(h,p,6),clack=this.decoy&&!this.decoy.croak&&this.decoy.expires!==h.lastLure&&distance(this.decoy,h)<2.5;
      if(heard||clack){if(clack)h.lastLure=this.decoy.expires;h.state='swell';h.phaseUntil=this.elapsed+2;h.facing=Math.atan2(p.y-h.y,p.x-h.x);this.cue('ribbit',h);}
    }
    // Frost sentinel: a crystal statue that turns its gaze through set directions. The gaze is a
    // cone of light that glances off ice walls (up to twice), so it can see round a corner. Seen
    // in it, Sally gets a moment's glint of warning; still in it after that, the gaze freezes her
    // where she stands and the crack brings every hunter nearby. Leaves and spores hide her.
    sentinelBeams(h){
      const p=this.player,beams=[],half=.42;let seen=false;
      for(let k=-4;k<=4;k++){let a=h.facing+k*half/4,dx=Math.cos(a),dy=Math.sin(a),x=h.x,y=h.y,left=h.range,bounces=0;const pts=[{x,y}];
        while(left>0){const nx=x+dx*.08,ny=y+dy*.08,tx=Math.floor(nx),ty=Math.floor(ny),ox=Math.floor(x),oy=Math.floor(y);
          if(!this.sightFloor(tx,ty)){if(this.ice.has(tx+','+ty)&&bounces<2){const fx=tx!==ox&&!this.sightFloor(tx,oy),fy=ty!==oy&&!this.sightFloor(ox,ty);if(fx)dx=-dx;if(fy)dy=-dy;if(!fx&&!fy){dx=-dx;dy=-dy;}bounces++;pts.push({x,y});continue;}break;}
          x=nx;y=ny;left-=.08;if(!seen&&Math.hypot(x-p.x,y-p.y)<.4)seen=true;}
        pts.push({x,y});beams.push(pts);}
      return {beams,seen:seen&&!p.hidden&&!(this.clouds.length&&this.inCloud(p))};
    }
    updateSentinel(dt,h){
      const p=this.player;
      if(h.state==='watch'&&h.looks&&this.elapsed>=h.turnAt){h.look=(h.look+1)%h.looks.length;h.facing=h.looks[h.look];h.turnAt=this.elapsed+h.every;}
      const {beams,seen}=this.sentinelBeams(h);h.beams=beams;
      if(h.state==='glare'){if(this.elapsed<h.phaseUntil)return;
        if(seen&&this.elapsed>=this.invulnerableUntil){this.heldUntil=this.elapsed+1.6;p.frozenUntil=this.heldUntil;this.alarms++;this.decoy={x:p.x,y:p.y,expires:this.elapsed+4,chirp:true};this.cue('freeze',h);
          this.notice('The sentinel’s gaze froze Sally! The crack carries: every hunter nearby is coming.','warning');h.state='cool';h.phaseUntil=this.elapsed+2.5;h.readyAt=this.elapsed+4;}
        else{h.state='watch';h.readyAt=this.elapsed+1;}return;}
      if(h.state==='cool'){if(this.elapsed>=h.phaseUntil)h.state='watch';return;}
      if(seen&&this.elapsed>=h.readyAt){h.state='glare';h.phaseUntil=this.elapsed+.6;this.cue('glint',h);}
    }
    // Cloud ray: glides high over everything on its own loop, ignoring walls. Its broad shadow is
    // moving cover: inside it Sally is hidden from the hawk and from every hunter, even moving.
    updateCloudRay(dt,h){
      const target=h.patrol[h.leg%h.patrol.length],d=distance(h,target);
      if(d<.05){h.leg=(h.leg+1)%h.patrol.length;return;}
      const step=Math.min(d,h.speed*dt);h.facing=Math.atan2(target.y-h.y,target.x-h.x);h.x+=(target.x-h.x)/d*step;h.y+=(target.y-h.y)/d*step;
      if(distance(h,this.player)<5&&this.elapsed>=(h.whooshAt||0)){h.whooshAt=this.elapsed+4;this.cue('glide',h);}
    }
    updateFlytrap(dt,h){
      const p=this.player,reach=h.reach||1.6;
      if(h.state==='snap'){
        if(this.elapsed<h.phaseUntil)return;
        h.state='chew';h.phaseUntil=this.elapsed+2.4;this.cue('snap',h);
        if(distance(p,h.aim)<.72&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','The flytrap snapped shut. Wait for it to bite at something else, then pass while it chews.');
        return;
      }
      if(h.state==='chew'){if(this.elapsed>=h.phaseUntil)h.state='open';return;}
      const lure=this.decoy&&this.decoy.expires!==h.lastLure&&distance(h,this.decoy)<=reach&&this.clear(h,this.decoy),near=distance(h,p)<=reach&&this.clear(h,p,true);
      if(lure||near){
        h.aim=lure?copy(this.decoy):this.lead(.3);if(lure)h.lastLure=this.decoy.expires;
        if(distance(h,h.aim)>reach){const a=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.aim={x:h.x+Math.cos(a)*reach,y:h.y+Math.sin(a)*reach};}
        h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='snap';h.phaseUntil=this.elapsed+(!lure&&p.crawling?.55:.32);this.cue('rustle',h);
      }
    }
    // Bog heron: stands frozen in the reeds and stares along its beak. Anything that steps into
    // the line in front of the beak is stabbed after a short tell; a pebble there draws a stab
    // too. It watches the surface, so Sally swimming below goes unseen. Some herons turn their
    // heads between set directions every few seconds.
    inBeakLine(h,q){const dx=q.x-h.x,dy=q.y-h.y,c=Math.cos(h.facing),s=Math.sin(h.facing),along=dx*c+dy*s;return along>.2&&along<=h.reach&&Math.abs(dy*c-dx*s)<.55&&this.clear(h,q);}
    updateHeron(dt,h){
      const p=this.player;
      if(h.state==='aim'){
        if(this.elapsed<h.phaseUntil)return;
        h.state='stab';h.phaseUntil=this.elapsed+1.3;this.cue('snap',h);
        if(!p.swimming&&(this.inBeakLine(h,p)||distance(p,h.aim)<.6)&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','The bog heron stabbed. Cross its beak line while it looks away or recovers from a stab, or swim past under the surface.');
        return;
      }
      if(h.state==='stab'){if(this.elapsed>=h.phaseUntil)h.state='still';return;}
      if(h.looks&&this.elapsed>=h.turnAt){h.look=(h.look+1)%h.looks.length;h.facing=h.looks[h.look];h.turnAt=this.elapsed+h.every;}
      const lure=this.decoy&&this.decoy.expires!==h.lastLure&&this.inBeakLine(h,this.decoy),near=!p.swimming&&this.inBeakLine(h,p);
      if(lure||near){h.aim=lure?copy(this.decoy):copy(p);if(lure)h.lastLure=this.decoy.expires;h.state='aim';h.phaseUntil=this.elapsed+.25;this.cue('rustle',h);}
    }
    // Praying mantis: a twig among twigs. It stays still and all but invisible until Sally is
    // close, watching a short cone in front of it. Anything that moves into the cone (Sally, a
    // pebble, or another hunter) gets a quarter-second tell as the forelegs rise, then a snatch.
    // A snatched hunter reels back dazed, so a mantis can guard Sally's path as well as block it.
    inMantisReach(h,q){const dx=q.x-h.x,dy=q.y-h.y,c=Math.cos(h.facing),s=Math.sin(h.facing),along=dx*c+dy*s;return along>.15&&along<=h.reach&&Math.abs(dy*c-dx*s)<.42+along*.3&&this.clear(h,q);}
    mantisShown(h){return h.state!=='still'||this.elapsed<(h.shownUntil||0)||distance(this.player,h)<2.4;}
    updateMantis(dt,h){
      const p=this.player;
      if(h.state==='raise'){
        if(this.elapsed<h.phaseUntil)return;
        h.state='strike';h.phaseUntil=this.elapsed+1.2;h.shownUntil=this.elapsed+3;this.cue('snap',h);
        const prey=h.prey&&this.hunters.includes(h.prey)?h.prey:null;h.prey=null;
        if(prey&&!['steamed','stunned'].includes(prey.state)&&(this.inMantisReach(h,prey)||distance(prey,h.aim)<.6)){prey.state='steamed';prey.phaseUntil=this.elapsed+2.2;prey.mantisSafeUntil=this.elapsed+5;prey.path=[];prey.targetId=null;prey.awareness=0;prey.lastKnown=null;this.notice('The mantis snatched at a hunter. It reels back, dazed!','clash');}
        if((this.inMantisReach(h,p)||distance(p,h.aim)<.6)&&!p.swimming&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','A praying mantis was hiding among the twigs. Watch for the faint twig shape, cross behind it or while it recovers, or toss a pebble into its reach first.');
        return;
      }
      if(h.state==='strike'){if(this.elapsed>=h.phaseUntil)h.state='still';return;}
      if(h.looks&&this.elapsed>=h.turnAt){h.look=(h.look+1)%h.looks.length;h.facing=h.looks[h.look];h.turnAt=this.elapsed+h.every;}
      const lure=this.decoy&&this.decoy.expires!==h.lastLure&&this.inMantisReach(h,this.decoy),near=!p.swimming&&this.inMantisReach(h,p);
      const prey=!lure&&!near&&this.hunters.find(o=>o!==h&&!['mantis','heron','flytrap','angler','mimic','owl','magpie','moth','fish','crab','cricket','wasp','dragonfly','mole','bat','eel','echofrog','sentinel','cloudray'].includes(o.kind)&&!['steamed','stunned','emerge','dig','buried','rise','clash'].includes(o.state)&&!o.buried&&this.elapsed>=(o.mantisSafeUntil||0)&&this.inMantisReach(h,o));
      if(lure||near||prey){h.aim=lure?copy(this.decoy):near?copy(p):copy(prey);h.prey=prey||null;if(lure)h.lastLure=this.decoy.expires;h.state='raise';h.phaseUntil=this.elapsed+.25;this.cue('rustle',h);}
    }
    // Wasp nest: a papery nest on the wall. Noise close by, a pebble landing near it, or a touch
    // stirs it: a buzz, then a swarm pours out and chases the nearest creature it can reach,
    // Sally or a hunter, for a few seconds, never straying far from home. A hunter it reaches is
    // stung and dazed; Sally is caught unless she ducks into leaves or water, where it loses her.
    // Then the swarm drifts home and the nest settles for a while.
    waspTargets(h){
      const p=this.player,list=[];
      if(!p.hidden&&!p.swimming&&distance(p,h.nest)<=h.leash)list.push(p);
      for(const o of this.hunters)if(o!==h&&!['wasp','mantis','heron','flytrap','angler','mimic','owl','magpie','moth','fish','crab','dragonfly','mole','bat','eel','echofrog','sentinel','cloudray'].includes(o.kind)&&!['steamed','stunned','emerge','dig','buried','rise'].includes(o.state)&&!o.buried&&distance(o,h.nest)<=h.leash)list.push(o);
      return list;
    }
    flyToward(s,target,step){
      const d=distance(s,target);if(d<1e-6)return;const k=Math.min(1,step/d),nx=s.x+(target.x-s.x)*k,ny=s.y+(target.y-s.y)*k;
      if(this.floor(Math.floor(nx),Math.floor(ny))){s.x=nx;s.y=ny;}else if(this.floor(Math.floor(nx),Math.floor(s.y)))s.x=nx;else if(this.floor(Math.floor(s.x),Math.floor(ny)))s.y=ny;
    }
    updateWasp(dt,h){
      const p=this.player;
      if(h.state==='nest'){
        if(this.elapsed<h.readyAt)return;
        const noisy=(p.loud||p.noisy)&&!p.hidden&&distance(p,h.nest)<(this.inEcho(p)?6.3:3.5),touch=distance(p,h.nest)<.8,pebble=this.decoy&&this.decoy.expires!==h.lastLure&&distance(this.decoy,h.nest)<1.6,bumped=this.hunters.some(o=>o!==h&&o.state==='charge'&&distance(o,h.nest)<1);
        if(noisy||touch||pebble||bumped){if(pebble)h.lastLure=this.decoy.expires;h.state='stir';h.phaseUntil=this.elapsed+.45;this.cue('buzz',h);this.notice('The wasp nest is buzzing!','buzz');}
        return;
      }
      if(h.state==='stir'){if(this.elapsed>=h.phaseUntil){h.state='swarm';h.swarm=copy(h.nest);h.phaseUntil=this.elapsed+4;}return;}
      if(h.state==='swarm'){
        const targets=this.waspTargets(h);
        if(!targets.length||this.elapsed>=h.phaseUntil){h.state='home';return;}
        const target=targets.reduce((a,b)=>distance(a,h.swarm)<=distance(b,h.swarm)?a:b);this.flyToward(h.swarm,target,3*dt);
        if(distance(h.swarm,target)<.5){
          if(target===p){if(this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','The wasp swarm caught Sally. Walk softly past a nest, or duck into leaves or water to lose the swarm. A pebble can set it on a hunter instead.');h.state='home';}
          else{target.state='steamed';target.phaseUntil=this.elapsed+2.5;target.path=[];target.targetId=null;target.awareness=0;target.lastKnown=null;this.cue('sting',h);this.notice('The wasps chased off a hunter!','clash');h.state='home';}
        }
        return;
      }
      if(h.state==='home'){this.flyToward(h.swarm,h.nest,1.6*dt);if(distance(h.swarm,h.nest)<.2){h.swarm=null;h.state='nest';h.readyAt=this.elapsed+3;}}
    }
    // Dragonfly: darts round a fixed loop, over water, gaps and walls alike, far faster than Sally,
    // hovering for a blink at each corner. Its loop is always marked. Leaves do not hide Sally
    // from it and pebbles do not distract it: the only way past is to time the crossing. Sally
    // swimming under the surface is safe.
    updateDragonfly(dt,h){
      const p=this.player,pts=h.patrol;
      if(pts.length>1&&this.elapsed>=h.hoverUntil){
        let step=h.speed*dt;
        while(step>0){const next=pts[(h.leg+1)%pts.length],d=distance(h,next);
          if(d<=step){h.x=next.x;h.y=next.y;step-=d;h.leg=(h.leg+1)%pts.length;if(h.hover>0){h.hoverUntil=this.elapsed+h.hover;break;}}
          else{h.x+=(next.x-h.x)/d*step;h.y+=(next.y-h.y)/d*step;h.facing=Math.atan2(next.y-h.y,next.x-h.x);step=0;}}
      }
      if(distance(p,h)<.45&&!p.swimming&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','A dragonfly darted through. Watch its loop, wait for it to pass, then cross behind it.');
    }
    // Wind lanes gust on a rhythm (streaks warn just before), shoving Sally along the lane and out
    // of any cover. Lightning comes on a slower rhythm: a rumble, then for a moment every hunter
    // with a clear line sees Sally wherever she is, leaves or not. Only walls (and spores) hide her.
    gustPhase(w){const t=(this.elapsed+w.offset)%w.period;return {active:t<w.on,warning:t>=w.period-.8};}
    updateStorm(){
      for(const w of this.wind){const {warning}=this.gustPhase(w);if(warning&&!w.warned&&[...w.keys].some(k=>{const [x,y]=k.split(',').map(Number);return distance(this.player,centre(x,y))<6;}))this.events.push('gust');w.warned=warning;}
      const s=this.storm;if(!s)return;
      if(!s.warned&&this.elapsed>=s.nextAt-s.warn){s.warned=true;this.events.push('rumble');}
      if(this.elapsed>=s.nextAt){this.flashUntil=this.elapsed+.4;s.nextAt+=s.every;s.warned=false;this.events.push('thunder');}
    }
    // Echo bat: flies its loop sending out a sonar ring every couple of seconds. If a ring passes
    // Sally while she is moving, the bat swoops on the spot; a still Sally is invisible to it.
    updateBat(dt,h){
      const p=this.player;
      if(h.state==='dive'){this.flyToward(h,h.aim,9*dt);if(this.elapsed>=h.phaseUntil){h.state='rise';h.phaseUntil=this.elapsed+1;this.cue('dive',h);if(distance(p,h)<.75&&!p.flight&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','The echo bat heard Sally move in its sonar ring and swooped. Freeze when a ring sweeps toward you.');}return;}
      if(h.state==='rise'){const home=h.home||h.patrol[0];const d=distance(h,home),step=3*dt;if(d>step){h.x+=(home.x-h.x)/d*step;h.y+=(home.y-h.y)/d*step;}else{h.x=home.x;h.y=home.y;}if(this.elapsed>=h.phaseUntil&&d<=step)h.state='fly';return;}
      const pts=h.patrol;if(pts.length>1){let step=h.speed*dt;while(step>0){const next=pts[(h.leg+1)%pts.length],d=distance(h,next);if(d<=step){h.x=next.x;h.y=next.y;step-=d;h.leg=(h.leg+1)%pts.length;}else{h.x+=(next.x-h.x)/d*step;h.y+=(next.y-h.y)/d*step;h.facing=Math.atan2(next.y-h.y,next.x-h.x);step=0;}}}
      if(this.elapsed>=h.pulseAt+h.every){h.pulseAt=this.elapsed;h.pulseFrom=copy(h);this.cue('ping',h);}
      const age=this.elapsed-h.pulseAt;if(age<.6&&h.pulseFrom){const r=age/.6*h.range,d=distance(p,h.pulseFrom);if(p.moving&&!p.flight&&Math.abs(d-r)<.55){h.state='dive';h.aim=this.lead(.45);h.home=copy(h);h.phaseUntil=this.elapsed+.45;this.alarms++;this.cue('screech',h);}}
    }
    // The tide: for part of each cycle the flats are under water (Sally swims, land hunters keep
    // off), the rest of the time they are sand. Waves lap at the edges just before it turns.
    tidePhase(){const t=this.tide,c=(this.elapsed+t.offset)%t.period,high=c<t.high,next=high?t.high-c:t.period-c;return {high,next};}
    applyTide(force=false){
      const t=this.tide,{high,next}=this.tidePhase();
      if(next<1.5&&!t.warned){t.warned=true;if(!force)this.events.push('splash');}
      if(high===t.isHigh&&!force)return;t.isHigh=high;t.warned=false;
      for(const f of this.tideFlats)this.grid[f.y][f.x]=high?'U':'.';
      for(const h of this.hunters)h.path=[];
      if(!force){this.events.push(high?'splash':'rustle');this.notice(high?'The tide is in: the flats are water now.':'The tide is out: the flats are sand again.');}
    }
    // Eel: hides in its water tile. When Sally walks the water's edge beside it or swims close it
    // ripples for a blink, then lunges where she is heading, and sulks for a moment after. When the
    // tide is out and its tile is sand it lies buried and harmless.
    updateEel(dt,h){
      const p=this.player,home=h.post,wet=this.water(home);
      if(!wet){h.state='buried';h.x=home.x;h.y=home.y;return;}
      if(h.state==='buried')h.state='lurk';
      if(h.state==='ripple'){if(this.elapsed<h.phaseUntil)return;h.state='lunge';h.phaseUntil=this.elapsed+.25;h.x=h.aim.x;h.y=h.aim.y;this.cue('snap',h);
        if(distance(p,h.aim)<.75&&!p.flight&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','An eel lunged from the water. Keep a tile back from its pool, swim wide of it, or come by when the tide is out.');return;}
      if(h.state==='lunge'){if(this.elapsed>=h.phaseUntil){h.state='sulk';h.phaseUntil=this.elapsed+1.6;h.x=home.x;h.y=home.y;}return;}
      if(h.state==='sulk'){if(this.elapsed>=h.phaseUntil)h.state='lurk';return;}
      const reach=p.swimming?2.2:1.6;
      if(distance(p,home)<=reach&&!p.flight&&this.clear(home,p,true)){h.state='ripple';h.aim=this.lead(.3);if(distance(h.aim,home)>reach+.5)h.aim=copy(p);h.phaseUntil=this.elapsed+.3;this.cue('splash',h);}
    }
    // Spore puffballs: Sally treading on one, a hunter walking over it or a pebble landing by it
    // bursts it into a spore cloud for a few seconds. Inside the cloud Sally is hidden even on the
    // move, and a hunter inside it cannot see at all. The puffball grows back after a while.
    inCloud(q){return this.clouds.some(c=>distance(q,c)<c.r);}
    updatePuffs(){
      this.clouds=this.clouds.filter(c=>c.until>this.elapsed);
      for(const puff of this.puffs){if(this.elapsed<puff.readyAt)continue;
        const stepped=this.tileKey(this.player)===puff.key&&!this.player.flight,trod=this.hunters.some(h=>!['dragonfly','wasp','owl','magpie','moth','mole','bat','eel'].includes(h.kind)&&this.tileKey(h)===puff.key),pebble=this.decoy&&distance(this.decoy,centre(puff.x,puff.y))<1.2;
        if(stepped||trod||pebble){puff.readyAt=this.elapsed+10;this.clouds.push({x:puff.x+.5,y:puff.y+.5,r:1.8,born:this.elapsed,until:this.elapsed+4.5});this.events.push('puff');if(stepped)this.notice('Puff! The spore cloud hides Sally, even on the move.');}}
    }
    // Mole: blind, it hunts by the tremble of footsteps. Walking within a few tiles (further on
    // gravel, further still at a sprint) sends it tunnelling toward the sound, a ripple running
    // through the ground, and it bursts up beneath the spot. Footsteps on leaves, swimming, a
    // still Sally and a bounce-cap flight make no tremble; if the trail goes cold it surfaces
    // short of her, sniffs about and digs back down. A pebble's thud draws it too.
    moleHears(h){
      const p=this.player;if(!p.moving||p.flight||p.swimming||this.grid[Math.floor(p.y)]?.[Math.floor(p.x)]==='L')return null;
      if(p.silent)return null;return distance(p,h)<=(p.loud?8:p.noisy?6:p.crawling?2:4.5)*(this.inEcho(p)?1.5:1)?copy(p):null;
    }
    updateMole(dt,h){
      const p=this.player;
      if(h.state==='surface'){
        if(this.elapsed<h.phaseUntil)return;
        h.state='up';h.phaseUntil=this.elapsed+1.8;this.cue('emerge',h);
        for(const o of this.hunters)if(o!==h&&!['mole','wasp','dragonfly','owl','magpie','moth','bat','eel'].includes(o.kind)&&!['steamed','stunned'].includes(o.state)&&distance(o,h)<.7){o.state='steamed';o.phaseUntil=this.elapsed+2;o.path=[];}
        if(distance(p,h)<.85&&!p.flight&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','The mole felt Sally\'s footsteps and burst up beneath her. Stop when the ground ripples toward you, or keep to leaves.');
        return;
      }
      if(h.state==='up'){if(this.elapsed>=h.phaseUntil){h.state='under';h.target=null;}return;}
      const heard=this.moleHears(h),thud=this.decoy&&this.decoy.expires!==h.lastLure&&distance(this.decoy,h)<8?copy(this.decoy):null;
      if(thud){h.lastLure=this.decoy.expires;h.target=thud;h.heardAt=this.elapsed;h.state='track';}
      else if(heard){h.target=heard;h.heardAt=this.elapsed;if(h.state!=='track'){h.state='track';this.cue('rumble',h);}}
      if(h.state==='track'){
        if(this.elapsed-h.heardAt>.5){h.state='surface';h.phaseUntil=this.elapsed+.45;return;}
        this.flyToward(h,h.target,2.2*dt);if(distance(h,h.target)<.3){h.state='surface';h.phaseUntil=this.elapsed+.3;}
        return;
      }
      // Underground and calm: it wanders its patrol.
      const pts=h.patrol;if(pts.length>1){const next=pts[(h.routeIndex+1)%pts.length];this.flyToward(h,next,.9*dt);if(distance(h,next)<.1)h.routeIndex=(h.routeIndex+1)%pts.length;}
    }
    // Tangle vine: stepping on one holds Sally for a moment. If a hunter sees her while she is
    // held she is caught (a spare tail is left in the vine instead); otherwise it lets her go.
    updateVines(){
      const p=this.player,t=this.elapsed,here=this.tileKey(p);
      if(this.heldBy){
        const v=this.heldBy,spotter=this.hunters.find(h=>!['flytrap','heron','mantis','wasp','dragonfly','mole','bat','eel','angler','mimic','cricket','echofrog','sentinel','cloudray'].includes(h.kind)&&this.seesPlayer(h));
        if(spotter&&t>=this.invulnerableUntil){
          this.alarms++;spotter.awareness=1;spotter.lastKnown=copy(p);spotter.lastObserved=t;
          if(this.shedTail(spotter)){this.heldUntil=0;this.heldBy=null;v.holding=false;v.readyAt=t+4;this.notice('Sally tore free and left her tail in the vine!','tailDrop');return;}
          this.finish('caught','The vine held Sally until a hunter found her. Cross vines only when nothing is watching.');return;
        }
        if(t>=this.heldUntil){this.heldBy=null;v.holding=false;v.readyAt=t+4;this.events.push('rustle');this.notice('The vine lets go. Move!');}
        return;
      }
      const v=this.vines.find(v=>v.key===here&&t>=v.readyAt);
      if(v&&t>=this.invulnerableUntil){v.holding=true;this.heldBy=v;this.heldUntil=t+1.5;p.hidden=false;this.events.push('rustle');this.notice('A tangle vine grabs Sally! Hope nothing is looking.','warning');}
    }
    updateFish(dt,h){
      if(h.state==='emerge'){if(this.elapsed>=h.phaseUntil)h.state='patrol';return;}
      const seen=this.water(this.player)&&this.seesPlayer(h),lure=this.decoy&&this.water(this.decoy)&&this.audible(h,this.decoy,8);
      const previousState=h.state;let target,speed=.9;
      if(lure){h.state='decoy';h.awareness=0;target=this.decoy;speed=1.4;}
      else if(seen){h.lastKnown=copy(this.player);h.lastObserved=this.elapsed;h.awareness=Math.min(1,h.awareness+dt/.9);h.state=h.awareness>=1?'chase':'alert';target=h.lastKnown;speed=h.state==='chase'?1.85:0;h.facing=Math.atan2(target.y-h.y,target.x-h.x);}
      else if(h.lastKnown&&this.elapsed-h.lastObserved<1.2){h.state='search';target=h.lastKnown;speed=1.2;}
      else{h.state='patrol';h.awareness=0;h.lastKnown=null;target=h.patrol[h.routeIndex];if(distance(h,target)<.1){h.routeIndex=(h.routeIndex+1)%h.patrol.length;target=h.patrol[h.routeIndex];}}
      if(h.state==='alert'&&previousState!=='alert')this.cue('warning',h);
      if(h.state==='chase'&&previousState!=='chase'){this.alarms++;this.cue('spotted',h);}
      if(target&&speed)this.moveHunter(target,speed*dt,h);
    }
    updateMimic(dt,h){
      h.anchor||=copy(h);
      if(h.state==='reveal'){
        if(this.elapsed>=h.phaseUntil){h.state='lunge';h.phaseUntil=this.elapsed+.55;this.cue('snap',h);}return;
      }
      if(h.state==='lunge'){
        const remaining=distance(h,h.aim),step=Math.min(5.5*dt,remaining),next={x:h.x+Math.cos(h.facing)*step,y:h.y+Math.sin(h.facing)*step};
        if(remaining<.05||this.elapsed>=h.phaseUntil||!this.fits(next,.22,h)||!this.clear(h,next)){h.state='recover';h.phaseUntil=this.elapsed+2;return;}
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return;
      }
      if(h.state==='recover'){if(this.elapsed>=h.phaseUntil){h.state='retract';h.path=[];}return;}
      if(h.state==='retract'){
        this.moveHunter(h.anchor,1.4*dt,h);if(distance(h,h.anchor)<.05){h.state='rooted';h.aim=null;}return;
      }
      h.state='rooted';
      const lure=this.decoy&&this.decoy.expires!==h.lastLure&&distance(h,this.decoy)<=5&&this.clear(h,this.decoy),seen=!this.player.hidden&&distance(h,this.player)<=(this.player.crawling?1.2:1.7)&&this.clear(h,this.player);
      if(lure||seen){
        h.aim=lure?copy(this.decoy):this.lead(.25);if(lure)h.lastLure=this.decoy.expires;
        h.reason=lure?'heard':'seen';h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='reveal';h.phaseUntil=this.elapsed+.4;this.cue('rustle',h);
      }
    }
    updateMillipede(dt,h){
      // Observation uses the same facing, distance and occlusion as its artwork.
      // A creature must first be encountered; untouched rooms cannot send it
      // hunting through the maze. Every fresh glance resets the reaction delay.
      if(this.playerSees(h)){
        h.awakened=true;h.state='still';h.followAt=this.elapsed+.9;return;
      }
      if(!h.awakened||this.elapsed<(h.followAt||0)){h.state='still';return;}
      if(!this.audible(h,this.player,14)){h.state='still';return;}
      if(h.state!=='follow'&&this.elapsed>=(h.scrapeAt||0)){this.cue('scrape',h);h.scrapeAt=this.elapsed+3;}
      h.state='follow';h.reason='seen';
      this.moveHunter(this.player,(distance(h,this.player)<1.5?1.6:2.3)*dt,h);
    }
    updateMoth(dt,h){
      // Follow actual luminous footprints, never an unseen player's position.
      // Once a swoop is armed its landing point stays fixed.
      if(h.state==='glimmer'){
        if(this.elapsed>=h.phaseUntil){h.state='swoop';h.phaseUntil=this.elapsed+.85;this.cue('flutter',h);this.alarms++;}return;
      }
      if(h.state==='swoop'){
        const d=distance(h,h.aim),step=Math.min(d,4*dt),next={x:h.x+Math.cos(h.facing)*step,y:h.y+Math.sin(h.facing)*step};
        if(d<.05||this.elapsed>=h.phaseUntil||!this.clear(h,next,true)){h.state='recover';h.phaseUntil=this.elapsed+1.4;return;}
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return;
      }
      if(h.state==='recover'){if(this.elapsed>=h.phaseUntil){h.state='patrol';h.aim=null;}return;}
      const target=[...(this.decoy?[this.decoy]:[]),...this.glowTrail.slice().reverse()].find(t=>distance(h,t)<=4&&this.clear(h,t,true));
      if(target){h.aim=copy(target);h.state='glimmer';h.phaseUntil=this.elapsed+.6;h.facing=Math.atan2(target.y-h.y,target.x-h.x);this.cue('glimmer',h);return;}
      h.state='patrol';let point=h.patrol[h.routeIndex];
      if(distance(h,point)<.1){h.routeIndex=(h.routeIndex+1)%h.patrol.length;point=h.patrol[h.routeIndex];}
      if(this.clear(h,point,true)){
        const d=distance(h,point),step=Math.min(d,.9*dt);if(d>.001){h.facing=Math.atan2(point.y-h.y,point.x-h.x);h.x+=Math.cos(h.facing)*step;h.y+=Math.sin(h.facing)*step;h.distanceMoved+=step;}
      }else this.moveHunter(point,.9*dt,h);
    }
    // An owl never walks. It turns between look-out points, sees far down a
    // narrow beam even in the dark, glares, then swoops to the spot it locked.
    updateOwl(dt,h){
      const p=this.player,perch=h.perch||(h.perch={x:h.x,y:h.y});
      if(h.state==='glare'){if(this.elapsed>=h.phaseUntil){h.state='swoop';this.alarms++;this.cue('flutter',h);}return;}
      if(h.state==='swoop'){
        // The swoop bends toward Sally, so a straight dash is not enough; hide or turn sharply.
        h.swoopTime=(h.swoopTime||0)+dt;if(!p.hidden&&h.swoopTime<1){const want=Math.atan2(p.y-h.aim.y,p.x-h.aim.x),gap=distance(h.aim,p),pull=Math.min(gap,3*this.cunning.aim*dt);h.aim={x:h.aim.x+Math.cos(want)*pull,y:h.aim.y+Math.sin(want)*pull};}
        const d=distance(h,h.aim),step=Math.min(d,6.5*dt);
        if(d<.05||h.swoopTime>=1.2){h.state='return';h.phaseUntil=this.elapsed+.6*this.cunning.rest;h.swoopTime=0;return;}
        h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.x+=Math.cos(h.facing)*step;h.y+=Math.sin(h.facing)*step;h.distanceMoved+=step;return;
      }
      if(h.state==='return'){
        if(this.elapsed<h.phaseUntil)return;const d=distance(h,perch),step=Math.min(d,3*dt);
        if(d<.05){h.x=perch.x;h.y=perch.y;h.state='patrol';h.aim=null;h.lookUntil=this.elapsed+1;return;}
        h.facing=Math.atan2(perch.y-h.y,perch.x-h.x);h.x+=Math.cos(h.facing)*step;h.y+=Math.sin(h.facing)*step;return;
      }
      h.state='patrol';
      const lure=this.decoy&&!this.decoy.owled&&distance(h,this.decoy)<=8&&this.clear(h,this.decoy,true);
      if(lure||this.owlSees(h)){
        const target=lure?this.decoy:p;if(lure)this.decoy.owled=true;
        h.aim=copy(target);h.facing=Math.atan2(target.y-h.y,target.x-h.x);h.state='glare';h.phaseUntil=this.elapsed+.7*this.cunning.warn;h.swoopTime=0;this.cue('hoot',h);return;
      }
      const look=h.patrol[h.routeIndex],want=Math.atan2(look.y-h.y,look.x-h.x),turn=Math.atan2(Math.sin(want-h.facing),Math.cos(want-h.facing));
      if(Math.abs(turn)>.02){h.facing+=Math.sign(turn)*Math.min(Math.abs(turn),1.1*dt);h.lookUntil=this.elapsed+1.8;}
      else if(this.elapsed>=(h.lookUntil||0))h.routeIndex=(h.routeIndex+1)%h.patrol.length;
    }
    // The magpie keeps watch from its perch, turning between look-outs. It never catches Sally:
    // if it sees her it caws, and every hunter in earshot comes straight for her. And it cannot
    // leave anything shiny alone: a pebble landing or a glow mushroom lighting up within its reach
    // sends it flapping off to steal it, which ends the distraction, and while it is away (or flying
    // home with its prize) it watches nothing.
    updateMagpie(dt,h){
      const p=this.player,perch=h.perch||(h.perch={x:h.x,y:h.y});if(!Number.isFinite(h.facing))h.facing=h.patrol[0]?Math.atan2(h.patrol[0].y-h.y,h.patrol[0].x-h.x):Math.PI/2;
      if(h.state==='caw'){if(this.elapsed>=h.phaseUntil){this.magpieCall(h);this.alarms++;this.cue('caw',h);this.notice('A magpie caws! Every hunter nearby knows where you are.','warning');h.state='recover';h.phaseUntil=this.elapsed+4;}return;}
      if(h.state==='recover'){if(this.elapsed>=h.phaseUntil)h.state='patrol';return;}
      if(h.state==='grab'){if(this.elapsed>=h.phaseUntil){this.magpieTake(h);h.state='return';}return;}
      if(h.state==='fly'||h.state==='return'){
        if(h.state==='fly'&&!this.magpiePrizeLive(h.prize)){h.state='return';h.prize=null;}
        const target=h.state==='fly'?h.prize:perch,d=distance(h,target),step=Math.min(d,(h.state==='fly'?4.5:3.2)*dt);
        if(d>1e-6){h.facing=Math.atan2(target.y-h.y,target.x-h.x);h.x+=Math.cos(h.facing)*step;h.y+=Math.sin(h.facing)*step;h.distanceMoved+=step;}
        if(d-step<.05){if(h.state==='fly'){h.state='grab';h.phaseUntil=this.elapsed+.5;}else{h.x=perch.x;h.y=perch.y;h.state='patrol';h.carrying=false;h.lookUntil=this.elapsed+1;}}
        return;
      }
      h.state='patrol';
      const prize=this.magpiePrize(h);
      if(prize){h.prize=prize;h.state='fly';this.cue('flutter',h);return;}
      if(this.magpieSees(h)){h.state='caw';h.aim=copy(p);h.reason='seen';h.facing=Math.atan2(p.y-h.y,p.x-h.x);h.phaseUntil=this.elapsed+.45;return;}
      if(!h.patrol.length)return;
      const look=h.patrol[h.routeIndex%h.patrol.length],want=Math.atan2(look.y-h.y,look.x-h.x),turn=Math.atan2(Math.sin(want-h.facing),Math.cos(want-h.facing));
      if(Math.abs(turn)>.02){h.facing+=Math.sign(turn)*Math.min(Math.abs(turn),1.3*dt);h.lookUntil=this.elapsed+1.5;}
      else if(this.elapsed>=(h.lookUntil||0))h.routeIndex=(h.routeIndex+1)%h.patrol.length;
    }
    // The ladybird plays dead. It ambles along its patrol and never catches Sally, but when she comes
    // near on her feet it flips onto its back and lies still, watching. Lying still it is harmless:
    // Sally may creep past (crawling, she never startles it at all). Rush past it close, toss a pebble
    // near it, or still be standing over it when it rights itself, and it shakes its wings, flies up
    // and buzzes an alarm that brings every hunter in earshot to where Sally is; then it is gone for a
    // while before it lands back on its patrol.
    updateLadybird(dt,h){
      const p=this.player,d=distance(h,p),home=h.home||(h.home={x:h.x,y:h.y}),near=r=>d<r&&!p.hidden&&!p.underground&&this.clear(h,p,true);
      const startled=this.decoy&&!this.decoy.ladybird&&distance(this.decoy,h)<1.5;
      if(h.state==='warn'){if(this.elapsed>=h.phaseUntil){this.magpieCall(h);this.alarms++;this.cue('ladybird',h);this.notice('A ladybird buzzes up in alarm! The hunters know where you are.','warning');h.state='away';h.phaseUntil=this.elapsed+7;}return;}
      if(h.state==='away'){if(this.elapsed>=h.phaseUntil){h.x=home.x;h.y=home.y;h.state='patrol';h.routeIndex=0;}return;}
      if(h.state==='dead'){
        if(startled||near(1.3)&&p.moving&&!p.crawling||this.elapsed>=h.phaseUntil&&near(2.3)&&!p.crawling){if(this.decoy&&startled)this.decoy.ladybird=true;h.state='warn';h.phaseUntil=this.elapsed+.7;this.cue('flutter',h);return;}
        if(this.elapsed>=h.phaseUntil){h.state='patrol';this.cue('rustle',h);}
        return;}
      if(startled){this.decoy.ladybird=true;h.state='warn';h.phaseUntil=this.elapsed+.7;this.cue('flutter',h);return;}
      if(near(2.3)&&!p.crawling){h.state='dead';h.phaseUntil=this.elapsed+3;h.facing=Math.atan2(p.y-h.y,p.x-h.x);this.cue('click',h);return;}
      h.state='patrol';if(!h.patrol.length)return;
      const to=h.patrol[h.routeIndex%h.patrol.length],dist=distance(h,to),step=Math.min(dist,.7*dt);
      if(dist>.02){h.facing=Math.atan2(to.y-h.y,to.x-h.x);h.x+=Math.cos(h.facing)*step;h.y+=Math.sin(h.facing)*step;h.distanceMoved+=step;}else h.routeIndex=(h.routeIndex+1)%h.patrol.length;
    }
    // A caw is an alarm, not a lure: every chasing hunter in earshot learns where Sally is right now
    // and comes for her as if it had just seen her; it searches there when it loses her again.
    magpieCall(h){const p=this.player;for(const o of this.hunters){if(o===h||MAGPIE_DEAF.has(o.kind)||['steamed','stunned','clash','emerge','dig','buried','rise'].includes(o.state)||!this.audible(o,h,9))continue;
      o.lastKnown=copy(p);o.lastObserved=this.elapsed;o.awareness=1;o.reason='heard';if(['patrol','alert','search','decoy'].includes(o.state))o.state='chase';o.path=[];o.targetId=null;}}
    // Something shiny within reach that no other magpie is already after.
    magpiePrize(h){
      const taken=new Set(this.hunters.filter(o=>o!==h&&o.kind==='magpie'&&o.prize).map(o=>o.prize)),ok=t=>t&&!taken.has(t)&&distance(h,t)<=10;
      if(this.decoy&&!this.decoy.chirp&&this.elapsed<this.decoy.expires&&ok(this.decoy))return this.decoy;
      return this.lights.find(ok)||null;
    }
    magpiePrizeLive(prize){return Boolean(prize)&&(prize===this.decoy&&this.elapsed<prize.expires||this.lights.includes(prize));}
    magpieTake(h){
      const prize=h.prize;h.prize=null;if(!this.magpiePrizeLive(prize))return;h.carrying=true;
      if(prize===this.decoy){this.decoy=null;this.notice('A magpie snatched the pebble! The hunters lose interest.','decoy');}
      else{this.lights=this.lights.filter(l=>l!==prize);this.glowVersion++;this.updateVisibility(true);this.notice('A magpie made off with the glow mushroom.','decoy');}
      this.cue('steal',h);
    }
    magpieSees(h){
      const p=this.player,d=distance(h,p);if(p.hidden||d>6.5||!this.clear(h,p,true))return false;
      const diff=Math.atan2(Math.sin(Math.atan2(p.y-h.y,p.x-h.x)-h.facing),Math.cos(Math.atan2(p.y-h.y,p.x-h.x)-h.facing));return d<.9||Math.abs(diff)<Math.PI/6;
    }
    owlSees(h){
      const p=this.player,d=distance(h,p);if(p.hidden||d>7||!this.clear(h,p,true))return false;
      const diff=Math.atan2(Math.sin(Math.atan2(p.y-h.y,p.x-h.x)-h.facing),Math.cos(Math.atan2(p.y-h.y,p.x-h.x)-h.facing));return d<.9||Math.abs(diff)<Math.PI/9;
    }
    // The cricket is an alarm: harmless itself, but when it notices Sally it chirps, and hunters in
    // earshot that cannot see her come to the spot for a moment. It is a call, not a pebble: one that
    // sees Sally keeps after her, the call soon fades, and it never drowns out a pebble she threw.
    updateCricket(dt,h){
      const p=this.player;
      if(h.state==='chirp'){
        if(this.elapsed>=h.phaseUntil){if(!this.decoy||this.decoy.chirp)this.decoy={x:h.aim.x,y:h.aim.y,expires:this.elapsed+2,chirp:true};this.alarms++;this.cue('chirp',h);this.notice('A cricket chirps! Hunters nearby come to look.','warning');h.state='recover';h.phaseUntil=this.elapsed+8;}
        return;
      }
      if(h.state==='recover'){if(this.elapsed>=h.phaseUntil)h.state='patrol';return;}
      const seen=this.seesPlayer(h),heard=p.noisy&&!p.hidden&&this.audible(h,p,8);
      if(seen||heard){h.state='chirp';h.aim=copy(p);h.reason=seen?'seen':'heard';h.facing=Math.atan2(p.y-h.y,p.x-h.x);h.phaseUntil=this.elapsed+.5;this.cue('skitter',h);return;}
      h.state='patrol';const target=h.patrol[h.routeIndex];
      if(distance(h,target)<.1)h.routeIndex=(h.routeIndex+1)%h.patrol.length;
      this.moveHunter(h.patrol[h.routeIndex],.8*dt,h);
    }
    // The beetle is a battering ram: it locks a lane toward where Sally is heading,
    // then charges until something stops it, smashing cover and cracked walls.
    // King cobra: it waits coiled on its post, swaying to watch. On sight it rears (a short
    // warning), strikes at where Sally is heading, then gives chase like a fast snake. When
    // it loses her it glides home and coils again. Returns false to hand over to snake logic.
    // Brushing the back half of a resting snake's body (paused, coiled or watching) wakes it: it knows exactly where Sally is.
    checkTailTouch(){
      const p=this.player;this.hunters.forEach((h,i)=>{
        if(!['snake','cobra'].includes(h.kind)||['chase','rear','strike','emerge','stunned','steamed','clash'].includes(h.state))return;
        // Only a resting snake feels it: a moving tail slides away from Sally.
        const moved=h.tailCheck&&Math.hypot(h.x-h.tailCheck.x,h.y-h.tailCheck.y)>.002;h.tailCheck={x:h.x,y:h.y};if(moved)return;
        const joints=this.motion.snakes[i]?.joints;if(!joints||joints.length<4)return;
        if(!joints.slice(Math.floor(joints.length/2)).some(j=>Math.hypot(j.x-p.x,j.y-p.y)<.32))return;
        h.awareness=1;h.lastKnown=copy(p);h.lastObserved=this.elapsed;h.reason='touched';h.facing=Math.atan2(p.y-h.y,p.x-h.x);h.path=[];
        if(h.kind==='cobra'){h.aim=copy(p);h.state='rear';h.phaseUntil=this.elapsed+.45;this.alarms++;this.events.push('hiss');}
        this.notice('You brushed its tail! It knows where you are.','warning');
      });
    }
    updateCobra(dt,h){
      const p=this.player;
      if(h.state==='rear'){if(this.elapsed>=h.phaseUntil){h.state='strike';h.strikeFrom=copy(h);h.phaseUntil=this.elapsed+.4;this.cue('sting',h);}return true;}
      if(h.state==='strike'){
        const dx=Math.cos(h.facing),dy=Math.sin(h.facing),step=12*dt,next={x:h.x+dx*step,y:h.y+dy*step};
        if(!this.fits(next,.22,h)||this.elapsed>=h.phaseUntil||distance(h.strikeFrom,next)>h.reach){
          h.state='chase';h.awareness=1;h.lastKnown=copy(p);h.lastObserved=this.elapsed;h.path=[];return true;}
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return true;
      }
      if(h.state==='coiled'||h.state==='return'||h.state==='patrol'){
        if(this.seesPlayer(h)){
          h.awareness=Math.min(1,h.awareness+dt/.3);h.facing=Math.atan2(p.y-h.y,p.x-h.x);
          if(h.awareness>=1){h.aim=this.lead(.35);h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='rear';h.phaseUntil=this.elapsed+.45;this.alarms++;this.cue('hiss',h);this.notice('The king cobra rears. It strikes, then it hunts.','warning');}
          return true;
        }
        h.awareness=Math.max(0,h.awareness-dt);
        if(distance(h,h.post)>.12){h.state='return';this.moveHunter(h.post,1.4*dt,h);return true;}
        h.state='coiled';h.facing+=Math.sin(this.elapsed*1.3+h.post.x)*dt*.9;return true;
      }
      return false;
    }
    updateBeetle(dt,h){
      if(h.state==='windup'){
        if(this.elapsed>=h.phaseUntil){h.state='charge';h.phaseUntil=this.elapsed+2.4;h.chargeFrom=copy(h);this.cue('charge',h);}
        return;
      }
      if(h.state==='charge'){
        const dx=Math.cos(h.facing),dy=Math.sin(h.facing),step=7.5*dt,next={x:h.x+dx*step,y:h.y+dy*step};
        const front=[Math.floor(h.x+dx*.5),Math.floor(h.y+dy*.5)];if(this.grid[front[1]]?.[front[0]]==='L')this.smash(...front);
        // The charge runs up to three tiles past its aim, or until a wall stops it.
        h.chargeFrom||=copy(h);if(!this.fits(next,.22,h)||this.elapsed>=h.phaseUntil||h.aim&&distance(h.chargeFrom,next)>distance(h.chargeFrom,h.aim)+3){
          const straight=Math.abs(dx)>.92||Math.abs(dy)>.92,wall=[Math.floor(h.x+Math.round(dx)*.75),Math.floor(h.y+Math.round(dy)*.75)];
          const hitWall=!this.fits(next,.22,h);if(straight&&hitWall)this.smash(...wall);
          h.state=hitWall?'stunned':'recover';h.phaseUntil=this.elapsed+(hitWall?1.8:1)*this.cunning.rest;h.awareness=0;h.path=[];this.cue('clash',h);return;
        }
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return;
      }
      if(h.state==='stunned'||h.state==='recover'){if(this.elapsed>=h.phaseUntil){h.state='patrol';h.aim=null;}return;}
      const seen=this.seesPlayer(h),heard=this.player.noisy&&!this.player.hidden&&this.audible(h,this.player,this.player.loud?6:3.5);
      if(seen){
        h.awareness=Math.min(1,h.awareness+dt/.6);h.state='alert';h.reason='seen';
        h.facing=Math.atan2(this.player.y-h.y,this.player.x-h.x);
        if(h.awareness>=1){h.aim=this.lead(.45*this.cunning.aim);h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='windup';h.phaseUntil=this.elapsed+.55*this.cunning.warn;this.alarms++;this.notice('The beetle lowers its horn. Get out of its lane!','warning');}
        return;
      }
      if(h.state==='alert'){h.awareness=Math.max(0,h.awareness-dt*1.5);if(h.awareness>0)return;h.state='patrol';}
      const lure=this.decoy&&this.audible(h,this.decoy,9);
      if(lure||heard){h.state='decoy';this.moveHunter(lure?this.decoy:this.player,1.5*dt,h);return;}
      h.state='patrol';let target=h.patrol[h.routeIndex];
      if(distance(h,target)<.1){
        if(!h.pauseUntil)h.pauseUntil=this.elapsed+.9;
        if(this.elapsed<h.pauseUntil){h.facing+=dt*.7;return;}
        h.pauseUntil=0;h.routeIndex=(h.routeIndex+1)%h.patrol.length;target=h.patrol[h.routeIndex];
      }
      this.moveHunter(target,1.3*dt,h);
    }
    // The scorpion is a living trap. Its strike ring travels with it; while the tail
    // is up, anything that steps into the ring is stung where it is heading. The tail
    // rises and falls on a rhythm, and noise or a sighting keeps it raised.
    updateScorpion(dt,h){
      const p=this.player,reach=h.reach||1.8,inRing=distance(h,p)<=reach&&!p.hidden&&this.clear(h,p);
      if(h.buried&&!h.surfaced){
        h.state='buried';h.tailUp=false;
        if(distance(h,p)<2&&this.clear(h,p)){h.surfaced=true;h.state='emerge';h.phaseUntil=this.elapsed+.35;h.alertUntil=this.elapsed+3;this.cue('emerge',h);this.notice('A scorpion bursts from the sand!','tail');}
        return;
      }
      if(h.state==='emerge'){if(this.elapsed>=h.phaseUntil)h.state='patrol';return;}
      if(h.state==='raise'){h.tailUp=true;if(this.elapsed>=h.phaseUntil){if(inRing){h.aim=this.lead(.3*this.cunning.aim);h.state='windup';h.phaseUntil=this.elapsed+.3*this.cunning.warn;}else h.state='alert';}return;}
      if(h.state==='windup'){
        if(this.elapsed>=h.phaseUntil){h.state='sting';h.phaseUntil=this.elapsed+.2;this.cue('sting',h);}
        return;
      }
      if(h.state==='sting'){
        if(this.elapsed>=h.phaseUntil){h.state='recover';h.phaseUntil=this.elapsed+this.cunning.rest;h.awareness=0;h.alertUntil=0;}
        return;
      }
      if(h.state==='recover'){h.tailUp=false;if(this.elapsed>=h.phaseUntil){h.state='patrol';h.aim=null;h.path=[];h.restUntil=this.elapsed+.6;}return;}
      const cycle=(this.elapsed+(h.offset||0))%3.8,seen=this.seesPlayer(h),heard=p.noisy&&!p.hidden&&this.audible(h,p,6);
      if(heard)h.alertUntil=this.elapsed+2.5; // Noise keeps the tail up; being seen does not, so the rhythm always leaves a window.
      h.tailUp=this.elapsed>=(h.restUntil||0)&&(cycle<2||this.elapsed<(h.alertUntil||0));
      if(inRing){
        h.facing=Math.atan2(p.y-h.y,p.x-h.x);this.alarms++;
        if(h.tailUp){h.aim=this.lead(.3*this.cunning.aim);h.state='windup';h.phaseUntil=this.elapsed+.4*this.cunning.warn;this.notice('Scorpion strike! Change direction!','tail');}
        else{h.state='raise';h.phaseUntil=this.elapsed+.6;h.alertUntil=this.elapsed+2.5;this.notice('The scorpion raises its tail!','tail');}
        return;
      }
      const lure=this.decoy&&this.audible(h,this.decoy,9);
      if(lure){h.state='decoy';h.awareness=0;this.moveHunter(this.decoy,1.35*dt,h);return;}
      if(seen){
        // It edges toward Sally but never strays far from its post.
        h.state='alert';h.reason='seen';h.facing=Math.atan2(p.y-h.y,p.x-h.x);
        const post=h.post||(h.post=copy(h));if(distance(post,p)<reach+2.5)this.moveHunter(p,1.6*dt,h);
        return;
      }
      if(heard){h.state='alert';h.facing=Math.atan2(p.y-h.y,p.x-h.x);return;}
      if(h.state==='alert'&&this.elapsed<(h.alertUntil||0))return;
      h.state='patrol';let target=h.patrol[h.routeIndex];
      if(distance(h,target)<.1){
        if(!h.pauseUntil)h.pauseUntil=this.elapsed+.8;
        if(this.elapsed<h.pauseUntil){h.facing+=dt*.5;return;}
        h.pauseUntil=0;h.routeIndex=(h.routeIndex+1)%h.patrol.length;target=h.patrol[h.routeIndex];
      }
      this.moveHunter(target,1.05*dt,h);
    }
    // The toad is a sniper: from a distance it fires its tongue down any clear
    // straight line toward where Sally is heading. Pillars and cover break its aim.
    // The spider is a builder: it leaves lasting tripwire webs on its rounds and
    // rushes to any web Sally touches; up close it still spits a sticky shot.
    updateNestHunter(dt,h){
      const p=this.player;
      if(h.state==='windup'){
        if(this.elapsed>=h.phaseUntil){
          if(h.kind==='toad'){h.state='tongue';h.phaseUntil=this.elapsed+.35;h.tongueLength=0;this.cue('tongue',h);}
          else{if(this.fits(h.aim)&&this.clear(h,h.aim,true))this.webs.push({...h.aim,expires:this.elapsed+6});h.state='recover';h.phaseUntil=this.elapsed+1.2;this.cue('web',h);}
        }return;
      }
      if(h.state==='tongue'){
        let reach=0;const dx=Math.cos(h.facing),dy=Math.sin(h.facing);while(reach<5.5&&this.sightFloor(Math.floor(h.x+dx*(reach+.1)),Math.floor(h.y+dy*(reach+.1))))reach+=.1;
        h.tongueLength=Math.min(reach,(h.tongueLength||0)+16*dt);
        if(this.elapsed>=h.phaseUntil){h.state='recover';h.phaseUntil=this.elapsed+1.2;h.tongueLength=0;h.awareness=0;}return;
      }
      if(h.state==='rush'){
        // A plucked web calls its spider; it hunts Sally until it loses her for a moment.
        if(this.seesPlayer(h))h.rushUntil=Math.max(h.rushUntil,this.elapsed+1.5);
        if(this.elapsed>=h.rushUntil){h.state='patrol';h.path=[];return;}
        this.moveHunter(this.seesPlayer(h)?p:h.aim,2.6*dt,h);return;
      }
      if(h.state==='recover'){if(this.elapsed>=h.phaseUntil){h.state='patrol';h.aim=null;h.awareness=0;}return;}
      const seen=this.seesPlayer(h),lure=this.decoy&&this.audible(h,this.decoy,9)&&!(seen&&(this.decoy.chirp||distance(h,p)<1.2));
      if(lure){h.state='decoy';h.awareness=0;this.moveHunter(this.decoy,1.4*dt,h);return;}
      if(seen){
        h.state='alert';h.reason='seen';h.facing=Math.atan2(p.y-h.y,p.x-h.x);h.awareness=Math.min(1,h.awareness+dt/.45);
        const range=h.kind==='toad'?5:3.4;
        if(distance(h,p)>range){this.moveHunter(p,1*dt,h);return;}
        if(h.awareness>=1){h.aim=this.lead(h.kind==='toad'?.3:.35);h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='windup';h.phaseUntil=this.elapsed+(h.kind==='toad'?.5:.6);this.alarms++;this.notice(h.kind==='toad'?'The toad puffs its throat. Break its line of sight!':'The spider aims silk! Leave the marked ground.','warning');}return;
      }
      h.awareness=Math.max(0,h.awareness-dt*1.8);if(h.state==='alert'&&h.awareness>0)return;
      if(h.kind==='spider'&&this.elapsed>=(h.layAt||0)&&!this.water(h)){
        const tile={x:Math.floor(h.x)+.5,y:Math.floor(h.y)+.5};h.layAt=this.elapsed+3.5;
        if(!this.webs.some(w=>distance(w,tile)<.6)){const mine=this.webs.filter(w=>w.owner===h);if(mine.length>=5)this.webs.splice(this.webs.indexOf(mine[0]),1);this.webs.push({...tile,expires:Infinity,owner:h,trip:true});}
      }
      h.state='patrol';let target=h.patrol[h.routeIndex];if(distance(h,target)<.1){if(!h.pauseUntil)h.pauseUntil=this.elapsed+.8;if(this.elapsed<h.pauseUntil)return;h.pauseUntil=0;h.routeIndex=(h.routeIndex+1)%h.patrol.length;target=h.patrol[h.routeIndex];}
      this.moveHunter(target,(h.kind==='toad'?.9:.95)*dt,h);
    }
    // Sally plucking a tripwire web calls the spider that laid it.
    updateTraps(){
      const p=this.player,t=this.elapsed,here=this.tileKey(p);
      for(const log of this.logs){
        const length=distance(log.from,log.to),travel=length/log.speed,phase=(t+log.offset)%log.period,startAt=log.period-travel;
        log.warning=phase>=startAt-log.warn&&phase<startAt;if(log.warning&&!log.warned){log.warned=true;this.events.push('rumble');}
        log.rolling=phase>=startAt;if(!log.rolling){log.pos=null;if(!log.warning)log.warned=false;continue;}
        const f=(phase-startAt)/travel;log.pos={x:log.from.x+(log.to.x-log.from.x)*f,y:log.from.y+(log.to.y-log.from.y)*f};
        for(const h of this.hunters)if(distance(h,log.pos)<.6&&!['owl','magpie','moth'].includes(h.kind)&&h.state!=='steamed'){h.state='steamed';h.phaseUntil=t+2;h.path=[];this.events.push('clash');}
        if(distance(p,log.pos)<.6&&t>=this.invulnerableUntil){this.alarms++;if(this.shedTail(null))continue;this.finish('caught','A rolling log flattened Sally. Wait in a side pocket until it passes.');return;}
      }
      for(const th of this.thorns){
        const phase=(t+th.offset)%th.period,down=th.period-th.up;th.raised=phase>=down;th.warning=phase>=down-.5&&!th.raised;
        if(th.raised&&th.keys.has(here)&&t>=this.invulnerableUntil){this.alarms++;if(this.shedTail(null)){this.invulnerableUntil=t+th.up;continue;}this.finish('caught','Thorns sprang up under Sally. Cross when they sink.');return;}
      }
      if(this.level.crumble){
        const tile=this.grid[Math.floor(p.y)]?.[Math.floor(p.x)];if(tile==='c'&&!this.crumbling.has(here)){this.crumbling.set(here,{left:null});this.events.push('scrape');}
        for(const [key,c] of this.crumbling){if(c.fallen)continue;const [x,y]=key.split(',').map(Number),on=[p,...this.hunters].some(a=>a.x+.28>x&&a.x-.28<x+1&&a.y+.28>y&&a.y-.28<y+1);
          if(on){c.left=null;continue;}if(c.left===null){c.left=t;continue;}if(t-c.left>=.35){c.fallen=true;this.grid[y][x]='P';for(const h of this.hunters){h.path=[];h.targetId=null;}this.events.push('rumble');}}
      }
    }
    updateTripwires(){
      const p=this.player;for(const w of this.webs){if(!w.trip||distance(p,w)>.55||w.pluckedAt>this.elapsed-3)continue;
        w.pluckedAt=this.elapsed;const h=w.owner;if(!this.hunters.includes(h)||['steamed','clash'].includes(h.state))continue;
        if(this.inLight(p)||h.glowFear)continue;
        h.state='rush';h.aim=copy(p);h.rushUntil=this.elapsed+3;h.path=[];this.alarms++;this.notice('The web trembles. The spider is coming!','warning');}
    }
    // Is Sally on the line of a toad's tongue?
    toadTongueHit(){
      const p=this.player;return this.hunters.find(h=>h.kind==='toad'&&h.state==='tongue'&&h.tongueLength>0&&(()=>{const dx=Math.cos(h.facing),dy=Math.sin(h.facing),t=(p.x-h.x)*dx+(p.y-h.y)*dy;if(t<0||t>h.tongueLength+.2)return false;return Math.abs((p.x-h.x)*dy-(p.y-h.y)*dx)<.4;})());
    }
    moveHunter(target,budget,h=this.hunter,fleeGlow=false){
      const m=MOMENTUM[h.kind];
      if(m&&h.state==='chase'&&this.hunterDt>0)return this.glideHunter(target,budget,h,m);
      h.heading=undefined;
      if(this.slippery.has(this.tileKey(h))&&this.hunterDt>0&&!['owl','fox','beetle'].includes(h.kind)){const point=this.route(h,target,h)[0];if(point){const d=distance(h,point),v=h.iceVelocity||(h.iceVelocity={x:0,y:0}),dt=this.hunterDt,q=Ice.steer(v,{x:(point.x-h.x)/(d||1),y:(point.y-h.y)/(d||1)},budget/dt,dt,{ice:true,brake:true,grip:1.25});for(const axis of ['x','y']){const next={x:h.x,y:h.y,[axis]:h[axis]+q[axis]};if(this.fits(next,.22,h)&&(!this.lights.length||fleeGlow||!LIGHT_SHY.has(h.kind)||!this.inLight(next,.35))){h[axis]=next[axis];h.distanceMoved+=Math.abs(q[axis]);}else v[axis]=0;}h.facing=Math.atan2(v.y,v.x);return;}}else h.iceVelocity=null;
      if(this.grid[Math.floor(h.y)]?.[Math.floor(h.x)]==='M')budget*=.72;
      if(h.kind==='sea-snake')budget*=this.water(h)?1.05:.65;
      // Cold-blooded hunters crawl in the frozen rooms; owls and moths do not mind.
      if(this.cold.has(this.tileKey(h))&&!['owl','magpie','moth','fox'].includes(h.kind))budget*=.6;
      const id=Math.floor(target.x)+','+Math.floor(target.y);
      const avoidGlow=!fleeGlow&&LIGHT_SHY.has(h.kind)&&this.lights.length>0;
      if(h.glowRouteVersion!==this.glowVersion||h.pathAvoidGlow!==avoidGlow){h.path=[];h.targetId=null;h.glowRetryAt=0;h.glowRouteVersion=this.glowVersion;h.pathAvoidGlow=avoidGlow;}
      if(h.targetId!==id || !h.path.length){
        if((avoidGlow||fleeGlow)&&h.targetId===id&&this.elapsed<(h.glowRetryAt||0))return;
        h.path=this.route(h,target,h,Infinity,avoidGlow);h.targetId=id;h.glowRetryAt=this.elapsed+.5;
      }
      while(h.path.length&&budget>0){
        const point=h.path[0],d=distance(h,point);
        if(d<0.01){h.path.shift();continue;}
        const step=Math.min(budget,d),next={x:h.x+(point.x-h.x)*step/d,y:h.y+(point.y-h.y)*step/d};
        if(!this.clear(h,next,false,h)||!this.fits(next,.22,h)||avoidGlow&&this.inLight(next,.35)){h.path=[];break;}
        h.facing=Math.atan2(next.y-h.y,next.x-h.x);h.x=next.x;h.y=next.y;h.distanceMoved+=step;budget-=step;
        if(step>=d-0.00001)h.path.shift();
      }
    }
    // Sally's running line, smoothed, for hunters that read where she is going: her velocity, and how
    // fast she is curving (radians a second, + for clockwise on screen).
    trackSally(dt){if(!(dt>0))return;
      const v=this.playerVelocity,t=this.sallyTrack||(this.sallyTrack={vx:0,vy:0,curve:0,loop:0}),k=Math.min(1,dt/.2);
      const before=Math.atan2(t.vy,t.vx),moving=Math.hypot(t.vx,t.vy)>.5;t.vx+=(v.x-t.vx)*k;t.vy+=(v.y-t.vy)*k;
      const bend=moving&&Math.hypot(t.vx,t.vy)>.5?Math.atan2(Math.sin(Math.atan2(t.vy,t.vx)-before),Math.cos(Math.atan2(t.vy,t.vx)-before))/dt:0;
      t.curve+=(Math.max(-6,Math.min(6,bend))-t.curve)*Math.min(1,dt/.35);
      // How far round she has turned lately, one way: a full loop or more means she is circling.
      t.loop=t.loop*Math.exp(-dt/5)+Math.max(-6,Math.min(6,bend))*dt;
    }
    // A heavy hunter mid-chase feels Sally close by whichever way it faces, so sliding past her does
    // not lose her; leaves, cover or a crawl still do.
    feelsPlayer(h){const p=this.player;return h.state==='chase'&&Boolean(MOMENTUM[h.kind])&&!p.hidden&&!p.crawling&&!p.camo&&distance(h,p)<this.cunning.feel&&this.clear(h,p);}
    // Where a chasing hunter aims: where Sally will be by the time it gets there, following her curve,
    // so a loop round it or a long arc gets cut across. It never aims through a wall. Run rings round
    // it and it reads the loop: it leads further, turns sharper and cuts inside.
    chaseAim(target,h,m){
      const p=this.player,t=this.sallyTrack,k=this.cunning;if(!t||!m.lead||!k.lead||distance(target,p)>.3||p.hidden)return target;
      if(Math.abs(t.loop)>k.loop&&!(h.wiseUntil>this.elapsed)&&distance(h,p)<6){h.wiseUntil=this.elapsed+6;this.cue('warning',h);if(!h.wiseNoted){h.wiseNoted=true;this.notice('It has read your loop. Circling will not shake it now.','warning');}}
      const wise=h.wiseUntil>this.elapsed,d=distance(h,p);if(d<.5)return target;
      let x=p.x,y=p.y,vx=t.vx,vy=t.vy;const lead=Math.max(.25,Math.min(wise?1.2:.85,d/2.75))*m.lead*k.lead*(wise?1.4:1),steps=6,dt=lead/steps,curve=t.curve*(wise?1.2:1);
      for(let i=0;i<steps;i++){const c=Math.cos(curve*dt),s=Math.sin(curve*dt);[vx,vy]=[vx*c-vy*s,vx*s+vy*c];const next={x:x+vx*dt,y:y+vy*dt};if(!this.fits(next,.22,h))break;x=next.x;y=next.y;}
      return {x,y};
    }
    // A heavy hunter in a chase cannot turn on a dime or stop dead: it steers toward its route with a
    // limited turning speed, loses speed in a sharp turn and builds it back on a straight run. Cut back
    // hard at speed and it slides straight on, braking, then whips round and surges after you.
    glideHunter(target,budget,h,m){
      const dt=this.hunterDt;if(h.heading===undefined){h.heading=Math.atan2(target.y-h.y,target.x-h.x);h.glide=.7;h.gphase=(h.x*.37+h.y*.61)%1;} // It whips round on first sight; the momentum is in what follows.
      if(this.grid[Math.floor(h.y)]?.[Math.floor(h.x)]==='M')budget*=.72;
      if(h.kind==='sea-snake')budget*=this.water(h)?1.05:.65;
      if(this.cold.has(this.tileKey(h)))budget*=.6;
      const k=this.cunning;budget*=k.pace;
      target=this.chaseAim(target,h,m);const wise=h.wiseUntil>this.elapsed;
      const id=Math.floor(target.x)+','+Math.floor(target.y);
      if(h.targetId!==id||!h.path.length||distance(h,h.path[0])>1.6){h.path=this.route(h,target,h);h.targetId=id;}
      while(h.path.length>1&&distance(h,h.path[0])<.5)h.path.shift();
      const point=h.path[0]||target;if(distance(h,point)<.03){h.path.shift();return;}
      const want=Math.atan2(point.y-h.y,point.x-h.x),diff=Math.atan2(Math.sin(want-h.heading),Math.cos(want-h.heading));
      // A sharp turn at speed throws it into a skid: it slides straight on, braking hard...
      if(Math.abs(diff)>1.5&&h.glide>.7&&!(h.skidUntil>this.elapsed)&&!(h.whipUntil+.35>this.elapsed)){h.skidUntil=this.elapsed+.4;h.skidAt=this.elapsed;h.skidFrom={x:h.x,y:h.y,heading:h.heading};}
      const skidding=h.skidUntil>this.elapsed;
      // ...then whips round in one snap and surges off the new way.
      if(h.skidAt&&!skidding&&h.skidAt!==h.whippedAt){h.whippedAt=h.skidAt;h.heading+=diff*k.snap;h.glide=Math.max(h.glide,.85);h.whipUntil=this.elapsed+.3;}
      const whipping=h.whipUntil>this.elapsed;let turn=0;
      if(!skidding){const rate=m.turn*k.turn*(1+(1-h.glide)*2.4)*(wise?1.35:1);turn=Math.max(-rate*dt,Math.min(rate*dt,diff));h.heading+=turn;}
      const aim=skidding?.2:Math.abs(diff)>1.1?m.grip:1;h.glide+=(aim-h.glide)*Math.min(1,dt*(skidding?2.6:m.accel*(aim<h.glide?2.5:1)));
      // It moves in lunges, a surge and a check, rather than gliding at an even pace.
      const beat=(this.elapsed*m.pulse+h.gphase)%1,surge=whipping?1.4:beat<.3?1.22:.9;
      const step=Math.min(budget*h.glide*surge,Math.max(distance(h,point),.02)+.4),dx=Math.cos(h.heading)*step,dy=Math.sin(h.heading)*step;
      const go=(x,y)=>{const next={x,y};if(!this.clear(h,next,false,h)||!this.fits(next,.22,h))return false;h.distanceMoved+=Math.hypot(x-h.x,y-h.y);h.x=x;h.y=y;return true;};
      if(!go(h.x+dx,h.y+dy)&&!go(h.x+dx,h.y)&&!go(h.x,h.y+dy)){if(skidding)h.skidUntil=this.elapsed;h.heading+=turn||Math.sign(diff)*m.turn*dt;h.glide=Math.min(h.glide,m.grip);}
      h.facing=h.heading;
    }
    // How many of each tool Sally used this run.
    toolsUsed(){const out={pebble:(this.level.pebbles||0)-this.decoys,burrow:(this.level.burrows||0)-this.burrows,tongue:this.tonguesUsed,camo:this.camosUsed,seed:this.seedsUsed,glow:this.glowsUsed,spore:this.sporesUsed};
      for(const k of Object.keys(out))if(!(out[k]>0))delete out[k];return out;}
    noteCatch(by,tail){const p=this.player;if(this.catches.length<12)this.catches.push({x:Math.floor(p.x),y:Math.floor(p.y),t:+this.elapsed.toFixed(1),by:by||'?',...(tail?{tail:true}:{})});}
    // What caught Sally when no creature did: the sky, the wind, a trap.
    static causeOf(message){return [['hawk',/hawk/i],['wind',/gust/i],['ants',/ant column/i],['log',/log/i],['thorns',/thorns/i],['vine',/vine/i],['scorpion',/scorpion/i],['toad',/toad/i]].find(([,re])=>re.test(message||''))?.[0]||'?';}
    winterMessage(message){if(typeof message!=='string')return message;return message.replace(/pebbles/gi,'snowballs').replace(/pebble/gi,'snowball').replace(/snow fox/gi,'Gift Snatcher').replace(/beetle/gi,'Yeti').replace(/lowers its horn/gi,'raises its arms').replace(/spider/gi,'Krampus').replace(/The toad's tongue snapped Sally up/g,'A snowball from the snowman knocked Sally flat').replace(/toad/gi,'snowman').replace(/owl/gi,'wisp').replace(/sentinel/gi,'Nutcracker').replace(/rolling log/gi,'rolling snowball').replace(/thorns/gi,'icicles').replace(/silk/gi,'tangled ribbon');}
    finish(status,message){
      if(this.status!=='playing')return;
      if(status==='caught')this.noteCatch(this.lastCaptor?.at===this.elapsed&&this.lastCaptor.by||EscapeAdventure.causeOf(message));
      if(this.level.seasonal==='winter')message=this.winterMessage(message);this.status=status;this.notice(message,status);
      this.tongue=null;
      const stars=status==='won'?1+Number(this.treasure>=Math.ceil(this.totalTreasure*.6))+Number(this.alarms===0&&this.hasTail):0;
      this.result=Object.freeze({status,levelId:this.level.id,hidden:Boolean(this.level.hidden),kids:Boolean(this.level.kids),seasonal:this.level.seasonal||null,oopses:this.oopses,draft:Boolean(this.level.draft),routeRevision:this.level.revision||1,levelName:this.level.name,challengeId:this.challenge?.id||null,stars,alarms:this.alarms,treasure:this.treasure,totalTreasure:this.totalTreasure,time:this.elapsed,closeCalls:this.closeCalls,tonguesUsed:this.tonguesUsed,keyByTongue:this.keyByTongue,reactionsFired:this.reactionsFired.size,tailsDropped:this.tailsDropped,hasTail:this.hasTail,camosUsed:this.camosUsed,thefts:this.thefts,lowestWarmth:Math.round(this.lowestWarmth),blasts:this.blasts,steamed:this.steamed,recoveries:this.recoveries,stolen:this.stolen,hawkDodges:this.hawk?.dodges||0,glowbugs:this.glowbugsCaught,catches:this.catches.slice(),tools:this.toolsUsed(),digs:this.digs,message});
    }
    // A sound with a place: the scene pans it and lets it fade with distance from Sally.
    cue(name,at){this.events.push(name);if(at)(this.eventAt||(this.eventAt={}))[name]={x:at.x,y:at.y};}
    drainEvents(){const events=this.events;this.events=[];this.lastEventAt=this.eventAt||{};this.eventAt={};return events;}
  }
  EscapeAdventure.CUNNING=CUNNING;EscapeAdventure.DIG_TIME=.75;
  root.EscapeAdventure=EscapeAdventure;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeAdventure};
})(typeof globalThis!=='undefined'?globalThis:this);

