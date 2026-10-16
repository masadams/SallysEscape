// Escape's rules are independent of the campaign, its upgrades and leaderboards.
(function(root){
  const CreatureMotion=typeof module!=='undefined'&&module.exports?require('./creature-rig.js').EscapeCreatureMotion:root.EscapeCreatureMotion;
  const catalog=typeof module!=='undefined'&&module.exports?require('./escape-levels.js'):{EscapeCatalog:root.EscapeCatalog,escapeGridFor:root.escapeGridFor};
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const copy=p=>({x:p.x,y:p.y});
  // Hunters heavy enough to press a heavy plate.
  const HEAVY=new Set(['beetle']);
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
      this.level=options.level||(options.hiddenId?catalog.EscapeCatalog.hidden.find(l=>l.id===options.hiddenId):catalog.EscapeCatalog.levels.find(l=>l.id===(this.challenge?.levelId||options.levelId||'quiet-vault')));
      if(!this.level)throw new Error('Unknown Escape level');
      this.grid=catalog.escapeGridFor(this.level);this.height=this.grid.length;this.width=this.grid[0].length;
      this.player={...centre(...this.level.spawn),facing:{x:0,y:-1},tongueAim:null,stamina:100,exhausted:false,moving:false,sprinting:false,hidden:false,noisy:false};
      this.hunters=this.level.guards.map(guard=>this.makeHunter(guard));
      this.pendingSpawns=[];this.spawnedReinforcements=new Set();this.webs=[];this.glowTrail=[];this.trailAt=0;
      this.hunter=this.hunters[0];this.patrol=this.hunter.patrol;
      this.gates=(this.level.gates||[]).map(g=>({...g,open:Boolean(g.initialOpen),sealed:false,closingAt:null,expiresAt:null,pressed:false,warned:false,activations:0,switch:g.switch?centre(...g.switch):null,plates:(g.plates||[]).map(p=>centre(...p)),tiles:g.tiles.map(p=>p.slice())}));
      this.reactionsFired=new Set();this.mazeObjective=null;
      this.wheelAngle=0;this.clashes=0;this.swimDistance=0;
      this.key=centre(...this.level.key);this.exit=centre(...this.level.exit);this.hasKey=false;
      this.loot=this.level.loot.map(([x,y,value])=>({...centre(x,y),value,taken:false}));
      this.treasure=0;this.totalTreasure=this.loot.reduce((n,p)=>n+p.value,0);
      this.burrows=this.level.burrows;this.decoys=this.level.pebbles;this.decoy=null;this.decoyReadyAt=0;this.dug=[];
      this.seeds=this.level.seeds||0;this.seedGrowth=[];this.seedReadyAt=0;this.seedsUsed=0;
      this.tongues=this.level.tongues||0;this.tongueRange=3;this.tongue=null;this.tongueReadyAt=0;this.tonguesUsed=0;this.keyByTongue=false;
      this.elapsed=0;this.accumulator=0;this.status='playing';this.paused=false;this.result=null;
      this.invulnerableUntil=0;this.exitHold=0;this.closeCalls=0;this.alarms=0;this.events=[];
      // Later routes forgive one catch: Sally sheds her tail as a wriggling decoy.
      this.tailDrop=Boolean(this.level.tailDrop&&!this.challenge);this.hasTail=true;this.tailsDropped=0;this.droppedTail=null;
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
      this.vents=(this.level.vents||[]).map(v=>{const [dx,dy]=v.dir,tiles=[];for(let i=1;i<=(v.length||4);i++){const x=v.at[0]+dx*i,y=v.at[1]+dy*i;if(!this.floor(x,y))break;tiles.push([x,y]);}
        return {...v,tiles,keys:new Set(tiles.map(([x,y])=>x+','+y)),period:v.period||5,on:v.on||1.6,offset:v.offset||0,warn:v.warn||.9,active:false,warning:false};});
      this.blasts=0;this.steamed=0;this.player.warmth=100;this.player.chilled=false;this.lowestWarmth=100;
      const hawk=this.level.hawk;this.hawk=hawk?{every:hawk.every||8,warn:hawk.warn||1.8,radius:hawk.radius||1.2,speed:hawk.speed||2.4,nextAt:hawk.first||16,state:'circling',shadow:null,strikes:0,dodges:0,lastStrike:null}:null;
      this.requiredTreasure=this.challenge?.allTreasure?this.totalTreasure:this.level.requiredTreasure||0;this.timeLimit=this.challenge?.timeLimit||this.level.timeLimit||null;
      this.message=this.challenge?.brief||this.level.hint;this.messageUntil=7;
      this.visible=new Set();this.discovered=new Set();this.visibilityAt=-Infinity;this.updateVisibility(true);
      this.motion=new CreatureMotion(this);
    }
    makeHunter(guard){return {...centre(...guard.spawn),id:guard.id||null,kind:guard.kind||'snake',facing:guard.facing,state:guard.kind==='mimic'?'rooted':guard.kind==='cobra'?'coiled':guard.kind==='angler'?'lurking':guard.kind==='flytrap'?'open':guard.kind==='heron'?'still':guard.kind==='crab'?'shell':'patrol',awareness:0,lastKnown:null,lastObserved:-Infinity,reason:'seen',path:[],routeIndex:0,pauseUntil:0,searchUntil:0,patrol:guard.patrol.map(p=>centre(...p)),aim:null,phaseUntil:0,distanceMoved:0,...(guard.kind==='cobra'?{post:centre(...guard.spawn),reach:guard.reach||2.6}:{}),...(guard.kind==='angler'?{lure:centre(...(guard.lure||guard.spawn))}:{}),...(guard.kind==='heron'?{facing:guard.looks?guard.looks[0]:guard.facing,reach:guard.reach||2.6,looks:guard.looks||null,every:guard.every||3.2,look:0,turnAt:guard.every||3.2}:{}),...(guard.kind==='crab'?{home:centre(...guard.spawn),axis:guard.axis||'x',range:guard.range||3}:{}),...(guard.kind==='scorpion'?{reach:guard.reach||1.8,buried:Boolean(guard.buried),offset:guard.offset??(guard.spawn[0]*.7+guard.spawn[1]*.3)%3.8,post:centre(...guard.spawn)}:{})};}
    floor(x,y){return this.grid[y]?.[x]!==undefined && !['#','B','G','P'].includes(this.grid[y][x]);}
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
      this.seeds--;this.seedsUsed++;this.seedReadyAt=this.elapsed+.5;for(const h of this.hunters){h.path=[];h.targetId=null;}this.updateVisibility(true);this.notice(message,'grow');return true;
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
    }
    activateSwitches(){
      for(const gate of this.gates){
        // A heavy plate ignores Sally; only a big hunter's weight (a beetle on its rounds) presses it.
        const pressed=gate.heavy?this.hunters.some(h=>HEAVY.has(h.kind)&&gate.plates.some(p=>distance(h,p)<.45)):[...(gate.switch?[gate.switch]:[]),...gate.plates].some(p=>distance(this.player,p)<.4);
        if(gate.duration){
          if(pressed&&!gate.sealed){
            if(!gate.pressed){gate.activations++;this.notice(gate.heavy?'Something heavy presses the plate. '+gate.name+' opens for '+gate.duration+' seconds.':gate.name+' '+(gate.bridge?'bridge':'gate')+' lasts '+gate.duration+' seconds after you leave the plate.','plate');}
            this.setGateOpen(gate,true);gate.expiresAt=this.elapsed+gate.duration;gate.closingAt=null;gate.warned=false;
          }gate.pressed=pressed;continue;
        }
        if(gate.switch&&!gate.open&&!gate.sealed&&pressed){
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
    fits(p,radius=0.22,actor=null){
      return [[-1,-1],[-1,1],[1,-1],[1,1]].every(([x,y])=>this.actorFloor(Math.floor(p.x+x*radius),Math.floor(p.y+y*radius),actor));
    }
    // maxSteps stops the search early; a route needing more steps comes back empty.
    route(from,to,actor=null,maxSteps=Infinity){
      const sx=Math.floor(from.x),sy=Math.floor(from.y),tx=Math.floor(to.x),ty=Math.floor(to.y);
      if(!this.actorFloor(tx,ty,actor)||!this.actorFloor(sx,sy,actor))return [];
      const queue=[[sx,sy,0]],previous=new Map([[sx+','+sy,null]]);
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
          if(this.actorFloor(nx,ny,actor)&&!previous.has(id)){previous.set(id,[x,y]);queue.push([nx,ny,depth+1]);}
        }
      }
      return [];
    }
    audible(a,b,range){
      if(Math.floor(a.x)===Math.floor(b.x)&&Math.floor(a.y)===Math.floor(b.y))return this.clear(a,b);
      // A route of more than `range` steps is at least `range` tiles long even after its start is trimmed.
      const path=this.route(a,b,null,Math.floor(range));return path.length>0 && path.length<=range;
    }
    // Strikers aim where Sally is heading, not where she was; the lead stops at walls.
    lead(seconds){const p=this.player,v=this.playerVelocity||{x:0,y:0},target={x:p.x+v.x*seconds,y:p.y+v.y*seconds};return this.fits(target)&&this.clear(p,target)?target:copy(p);}
    // A charging beetle breaks what it hits: leaf cover is flattened and a cracked wall opens for everyone.
    smash(x,y){const tile=this.grid[y]?.[x];if(tile!=='L'&&tile!=='B')return false;if(tile==='B'&&(x<=0||y<=0||x>=this.width-1||y>=this.height-1))return false;
      this.grid[y][x]='.';this.smashed=(this.smashed||0)+1;for(const h of this.hunters)h.path=[];this.events.push(tile==='B'?'smash':'rustle');if(tile==='B')this.notice('The beetle smashed through a cracked wall!','warning');this.visibilityAt=-Infinity;return true;}
    notice(message,event){this.message=message;this.messageUntil=this.elapsed+2.5;if(event)this.events.push(event);}
    active(){return this.status==='playing'&&!this.paused;}
    burrow(){
      if(!this.active())return false;
      if(this.burrows===0){this.notice('No burrows left. Find a way around.');return false;}
      const p=this.player,x=Math.floor(p.x),y=Math.floor(p.y),d=p.facing;
      const wx=x+d.x,wy=y+d.y,landing=centre(x+2*d.x,y+2*d.y);
      if(this.grid[wy]?.[wx]==='G'){const gate=this.gates.find(g=>g.tiles.some(([x,y])=>x===wx&&y===wy));this.notice(gate?.sealed?'This passage is sealed. Find a new way around.':gate?.switch?'This gate needs its matching switch.':'The ruins control this passage. Look for another route.');return false;}
      if(!['#','B'].includes(this.grid[wy]?.[wx]) || wx<=0||wy<=0||wx>=this.width-1||wy>=this.height-1||!this.fits(landing)){
        this.notice('Face a thin wall with an open tile on the other side.');return false;
      }
      p.x=landing.x;p.y=landing.y;p.sprinting=false;p.moving=false;
      this.motion.resetPlayer(p);
      this.tongue=null;
      this.updateVisibility(true);
      this.burrows--;this.dug.push({x:wx,y:wy});this.invulnerableUntil=this.elapsed+0.35;
      this.notice('Under the wall. Keep moving!','burrow');return true;
    }
    throwDecoy(){
      if(!this.active())return false;
      if(this.decoys===0){this.notice('No pebbles left. Use cover.');return false;}
      if(this.elapsed<this.decoyReadyAt)return false;
      const p=this.player,d=p.facing,start=centre(Math.floor(p.x),Math.floor(p.y));let target=start;
      for(let i=1;i<=3;i++){
        const next={x:start.x+d.x*i,y:start.y+d.y*i};if(!this.clear(start,next))break;target=next;
      }
      if(distance(start,target)<0.5){this.notice('Face an open corridor to toss a pebble.');return false;}
      this.decoys--;this.decoyReadyAt=this.elapsed+0.8;
      this.decoy={...target,expires:this.elapsed+4,noticed:false};
      this.notice('Pebble tossed. Watch for the guard\'s reaction.','decoy');return true;
    }
    tongueTarget(){
      const p=this.player,d=p.tongueAim||p.facing,targets=[];
      if(!this.hasKey)targets.push({kind:'key',point:this.key});
      this.loot.forEach((item,index)=>{if(!item.taken)targets.push({kind:'loot',index,point:item});});
      if(!this.hasTail)this.regrowthBugs.forEach((bug,index)=>{if(!bug.eaten)targets.push({kind:'bug',index,point:bug});});
      this.glowbugs.forEach((bug,index)=>{if(!bug.caught)targets.push({kind:'glow',index,point:bug});});
      // An angler's lure looks just like a glow bug, so the tongue will happily reach for it.
      this.hunters.forEach((h,index)=>{if(h.kind==='angler'&&h.state==='lurking')targets.push({kind:'lure',index,point:h.lure});});
      return targets.filter(t=>{const dx=t.point.x-p.x,dy=t.point.y-p.y,forward=dx*d.x+dy*d.y,side=Math.abs(dx*d.y-dy*d.x);return forward>.25&&distance(p,t.point)<=this.tongueRange+1e-9&&side<=.35&&this.clear(p,t.point,true);}).sort((a,b)=>distance(p,a.point)-distance(p,b.point))[0]||null;
    }
    useTongue(){
      if(!this.active())return false;
      if(!this.tongues){this.notice(this.level.tongues?'No tongue grabs left. Take a walking route.':'No tongue grabs on this route.');return false;}
      if(this.tongue||this.elapsed<this.tongueReadyAt)return false;
      const target=this.tongueTarget();if(!target){this.notice('Face a key or treasure within three tiles. Walls and gates block your tongue.');return false;}
      this.tongues--;this.tonguesUsed++;this.tongueReadyAt=this.elapsed+.55;
      this.tongue={...target,point:copy(target.point),startedAt:this.elapsed,hit:false};this.events.push('tongue');return true;
    }
    collectKey(byTongue=false){
      if(this.hasKey)return;this.hasKey=true;this.keyByTongue=byTongue;
      this.notice(this.requiredTreasure>this.treasure?'Key found! Bring '+(this.requiredTreasure-this.treasure)+' more treasure to the hatch.':'Key found! The hatch is open.','key');
      this.reactToMaze('key');
    }
    collectLoot(item){
      if(item.taken)return;item.taken=true;this.treasure+=item.value;this.carried.push(item);this.notice(item.value>1?'A whole treasure chest!':'Treasure pocketed.','treasure');this.reactToMaze('treasure',item);
    }
    shedTail(captor){
      if(!this.tailDrop||!this.hasTail||this.status!=='playing')return false;
      const p=this.player;this.hasTail=false;this.tailsDropped++;
      this.droppedTail={x:p.x,y:p.y,born:this.elapsed,expires:this.elapsed+3};
      this.invulnerableUntil=this.elapsed+1.2;p.stamina=100;p.exhausted=false;
      // Every nearby hunter, including the one that caught her, turns on the wriggling tail.
      for(const h of this.hunters){
        if(h!==captor&&(distance(h,p)>=6||!this.clear(h,p,true)))continue;
        h.graceUntil=Math.max(h.graceUntil||0,this.elapsed+2.8);
        // Rooted plants, fish and burrowing hunters cannot chase a tail across the floor.
        if(['mimic','fish','angler','flytrap','heron','crab','owl','gecko'].includes(h.kind)||['emerge','dig','buried','rise','clash'].includes(h.state))continue;
        h.tailLureUntil=this.elapsed+2.4;h.path=[];h.targetId=null;
      }
      this.notice(this.regrowthBugs.some(b=>!b.eaten)?'Tail dropped! It wriggles as a decoy. Run—then eat a glowing bug to regrow it.':'Tail dropped! It wriggles as a decoy. Run! The next catch is final.','tailDrop');
      return true;
    }
    camouflage(){
      if(!this.active())return false;
      if(!this.camos){this.notice(this.level.camos?'No camouflage left. Find shade or leaves.':'Nothing here to blend into.');return false;}
      if(this.camoUntil>this.elapsed)return false;
      this.camos--;this.camosUsed++;this.camoUntil=this.elapsed+6;this.notice('Sally blends into the ground. Keep still to stay hidden.','camo');return true;
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
      if(this.carried.length&&this.elapsed>=(h.cooldown||0)&&!p.hidden&&distance(h,p)<=6&&this.clear(h,p,true)){h.state='dash';this.events.push('skitter');}
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
        this.hunters.forEach((h,i)=>{if(!v.keys.has(this.tileKey(h))||h.state==='steamed'||['owl','moth','fish','angler','flytrap','heron'].includes(h.kind))return;this.blowClear(v,h,h);this.motion.resetHunter?.(h,i);h.state='steamed';h.phaseUntil=this.elapsed+2.5;h.path=[];h.targetId=null;h.aim=null;h.awareness=0;h.lastKnown=null;this.steamed++;this.notice('The steam blasts a hunter aside. It is dazed!','steam');});
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
    shaded(p=this.player){return this.shade.has(Math.floor(p.x)+','+Math.floor(p.y));}
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
    catchGlowbug(b){if(b.caught)return;b.caught=true;this.glowbugsCaught++;const left=this.glowbugs.filter(g=>!g.caught).length;this.notice('Glow bug caught! A little bonus treasure.'+(left?' '+left+' still drifting about.':' That was the last one.'),'glowbug');}
    eatRegrowthBug(bug){
      if(bug.eaten||this.hasTail)return;bug.eaten=true;this.hasTail=true;
      this.notice('Crunch! Sally\'s tail grows back.','regrow');
    }
    updateTongue(){
      const t=this.tongue;if(!t)return;
      const age=this.elapsed-t.startedAt;
      if(!t.hit&&age>=.14){
        t.hit=true;const present=t.kind==='key'?!this.hasKey:t.kind==='bug'?!this.regrowthBugs[t.index].eaten&&!this.hasTail:t.kind==='glow'?!this.glowbugs[t.index].caught:t.kind==='lure'?this.hunters[t.index]?.state==='lurking':!this.loot[t.index].taken;
        if(present&&t.kind==='lure')this.springAngler(this.hunters[t.index],copy(this.player),.35);
        else if(present&&distance(this.player,t.point)<=this.tongueRange+1e-9&&this.clear(this.player,t.point,true)){
          t.caught=true;t.kind==='key'?this.collectKey(true):t.kind==='bug'?this.eatRegrowthBug(this.regrowthBugs[t.index]):t.kind==='glow'?this.catchGlowbug(this.glowbugs[t.index]):this.collectLoot(this.loot[t.index]);
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
      // A tangle vine's grip stops Sally moving until it lets go.
      if(this.elapsed<this.heldUntil)input={};
      const p=this.player,old=copy(p),length=Math.hypot(input.x||0,input.y||0);
      const dx=length>0?(input.x||0)/Math.max(1,length):0,dy=length>0?(input.y||0)/Math.max(1,length):0;
      if(length&&this.elapsed>=(this.lookUntil||0)){p.facing=Math.abs(dx)>=Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)};p.tongueAim={x:(input.x||0)/length,y:(input.y||0)/length};}
      if(p.stamina<=0)p.exhausted=true;
      if(p.exhausted&&p.stamina>=25)p.exhausted=false;
      p.webbed=this.webs.some(w=>distance(p,w)<.65&&this.clear(p,w));
      if(this.cold.size)this.updateWarmth(dt);
      const sprint=Boolean(input.sprint&&!p.exhausted&&!p.chilled&&p.stamina>0&&length>0),mud=this.grid[Math.floor(p.y)][Math.floor(p.x)]==='M',speed=(sprint?4:2.45)*(this.hasTail?1:.9)*(p.warmth<=0?.5:p.chilled?.72:1)*(p.webbed?.45:mud?.72:1)*(this.water(p)?.55:1);
      for(const [axis,direction] of [['x',dx],['y',dy]]){
        const next={...p,[axis]:p[axis]+direction*speed*dt};if(this.fits(next)&&!(this.vents.length&&this.inJet(next)&&!this.inJet(p)))p[axis]=next[axis];
      }
      p.swimming=this.water(p);if(p.swimming)this.swimDistance+=distance(old,p);if(p.swimming&&!this.water(old))this.events.push('splash');p.moving=distance(old,p)>0.0001;p.sprinting=sprint&&p.moving;this.playerVelocity={x:(p.x-old.x)/dt,y:(p.y-old.y)/dt};
      p.stamina=Math.max(0,Math.min(100,p.stamina+(p.sprinting?-24:18)*dt));
      if(this.camoUntil>this.elapsed&&p.moving){this.camoUntil=0;this.notice('Moving broke the camouflage.');}
      p.camo=this.camoUntil>this.elapsed;
      p.hidden=!p.moving&&!this.heldBy&&(this.grid[Math.floor(p.y)][Math.floor(p.x)]==='L'||p.camo);
      p.webbed=this.webs.some(w=>distance(p,w)<.65&&this.clear(p,w));
      p.noisy=p.sprinting||(p.moving&&this.grid[Math.floor(p.y)][Math.floor(p.x)]==='N');
      if(this.level.dark){
        this.glowTrail=this.glowTrail.filter(t=>t.expires>this.elapsed);
        if(p.moving&&this.elapsed>=this.trailAt){this.glowTrail.push({...copy(p),born:this.elapsed,expires:this.elapsed+8});this.trailAt=this.elapsed+.18;}
      }
      this.activateSwitches();this.reactToMaze('enter');this.updateVisibility();
      if(this.decoy&&this.decoy.expires<=this.elapsed)this.decoy=null;
      this.updateRivalries();for(const hunter of this.hunters)this.updateHunter(dt,hunter);this.updateRivalries();
      this.motion.update(dt,this);this.checkTailTouch();
      if(this.vents.length)this.updateVents();
      if(this.vines.length)this.updateVines();if(this.status!=='playing')return;
      if(this.logs.length||this.thorns.length||this.level.crumble)this.updateTraps();if(this.status!=='playing')return;
      this.updateHawk(dt);if(this.status!=='playing')return;
      if(this.antTrails.length&&this.elapsed>=this.invulnerableUntil&&this.antAt(p)){this.alarms++;if(!this.shedTail(null)){this.finish('caught','The ant column marched right over Sally. Cross in the gaps between groups.');return;}}
      const sniper=this.elapsed>=this.invulnerableUntil&&!p.hidden&&this.toadTongueHit();
      if(sniper){this.alarms++;if(this.shedTail(sniper))return;this.finish('caught','The toad\'s tongue snapped Sally up. Break its line of sight behind pillars or cover.');return;}
      const stinger=this.hunters.find(h=>h.kind==='scorpion'&&h.state==='sting'&&h.aim&&distance(h,h.aim)<=(h.reach||1.8)+1&&distance(p,h.aim)<.9&&this.clear(h,p,true));
      if(this.elapsed>=this.invulnerableUntil&&stinger&&this.shedTail(stinger))return;
      if(this.elapsed>=this.invulnerableUntil&&stinger){this.finish('caught','The scorpion struck. Cross its ring while the tail is down, or change direction when it strikes.');return;}
      // Capture wins over picking up the key or escaping in the same simulation step.
      const captor=this.hunters.find(h=>!['emerge','dig','buried','rise','clash','steamed','stunned'].includes(h.state)&&this.elapsed>=(h.graceUntil||0)&&!(h.kind==='mimic'&&['rooted','reveal'].includes(h.state))&&!(h.kind==='owl'&&h.state!=='swoop')&&h.kind!=='gecko'&&h.kind!=='cricket'&&h.kind!=='angler'&&h.kind!=='flytrap'&&h.kind!=='heron'&&!(h.kind==='crab'&&h.state!=='scuttle')&&distance(p,h)<(h.kind==='beetle'&&h.state==='charge'?.62:.48)&&this.clear(p,h));
      if(this.elapsed>=this.invulnerableUntil&&captor&&this.shedTail(captor))return;
      if(this.elapsed>=this.invulnerableUntil && captor){
        this.finish('caught',captor.kind==='owl'?'The owl dropped onto its marked spot. Leave the glare before it swoops.':captor.kind==='millipede'?'A rustle, then darkness. Try another route through the ruins.':captor.kind==='mimic'?'The plant snapped at its marked spot. Provoke it from a distance or step aside when it opens.':captor.kind==='fox'?'A snow fox heard Sally and pounced. Stand still, keep to quiet ground, or toss a pebble to send it pouncing elsewhere.':captor.kind==='crab'?'A hermit crab scuttled out and pinched Sally. Pass its lane while it is tucked in, or send it back into its shell with a pebble.':captor.kind==='cobra'?'The king cobra struck. Step out of its line the moment it rears, then break its sight.':captor.kind==='moth'?'Pale wings found the glowing trail. Leave the marked ground before the swoop.':captor.reason==='heard'?'Noise gave you away. Find quiet floor or use cover.':'The guard spotted you. Break sight at a corner or use a pebble.');return;
      }
      if(this.challenge?.noChase&&this.alarms>0){this.finish('failed','A guard gave chase. Break sight before it is sure next time.');return;}
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
    lit(){const p=this.player;return this.hunters.some(m=>m.kind==='moth'&&distance(m,p)<=2.6&&this.clear(m,p,true));}
    seesPlayer(h=this.hunter){
      const p=this.player,d=distance(p,h),lit=this.hunters.length>1&&this.lit();
      if((p.hidden&&!lit)||d>(lit?6.5:4.5)||!this.clear(h,p,true))return false;
      const angle=Math.atan2(p.y-h.y,p.x-h.x);
      const difference=Math.atan2(Math.sin(angle-h.facing),Math.cos(angle-h.facing));
      return d<1 || Math.abs(difference)<(h.kind==='beetle'?Math.PI/5:Math.PI/3);
    }
    updateHunter(dt,h=this.hunter){
      if(h.state==='steamed'){if(this.elapsed>=h.phaseUntil){h.state=h.kind==='mimic'?'rooted':'patrol';h.graceUntil=this.elapsed+.5;}return;}
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
      if(h.kind==='gecko'){this.updateGecko(dt,h);return;}
      if(h.kind==='mimic'){this.updateMimic(dt,h);return;}
      if(h.kind==='toad'||h.kind==='spider'){this.updateNestHunter(dt,h);return;}
      if(h.kind==='scorpion'){this.updateScorpion(dt,h);return;}
      if(h.kind==='beetle'){this.updateBeetle(dt,h);return;}
      if(h.kind==='cobra'&&this.updateCobra(dt,h))return;
      if(h.kind==='angler'){this.updateAngler(dt,h);return;}
      if(h.kind==='flytrap'){this.updateFlytrap(dt,h);return;}
      if(h.kind==='heron'){this.updateHeron(dt,h);return;}
      if(h.kind==='crab'){this.updateCrab(dt,h);return;}
      if(h.kind==='fox'){this.updateFox(dt,h);return;}
      const p=this.player,previousState=h.state;
      // Nearby visible danger overrides a lure; a pebble cannot make it ignore a bite.
      const seen=this.seesPlayer(h),heard=(p.noisy||p.sprinting)&&!p.hidden&&this.audible(h,p,p.sprinting?6:3.5);
      const lure=this.decoy&&this.audible(h,this.decoy,9)&&!(seen&&distance(h,p)<1.2);
      let target,speed=1.25;
      if(lure){
        if(!this.decoy.noticed){this.decoy.noticed=true;this.notice('It heard the pebble. Now is your chance!','distracted');}
        h.state='decoy';h.awareness=0;h.lastKnown=null;target=this.decoy;speed=1.7;
      }else if(seen||heard){
        h.reason=seen?'seen':'heard';h.lastKnown=copy(p);h.lastObserved=this.elapsed;
        h.awareness=Math.min(1,h.awareness+dt/0.7);
        h.state=h.awareness>=1?'chase':'alert';target=h.lastKnown;
        if(h.state==='alert'){
          if(h.awareness-dt/0.7<=0)this.events.push('warning');
          h.facing=Math.atan2(p.y-h.y,p.x-h.x);speed=0;
        }else speed=2.75;
      }else if(h.state==='alert'){
        h.awareness=Math.max(0,h.awareness-dt*1.5);speed=0;
        if(h.awareness===0){h.lastKnown=null;h.state='patrol';}
      }else if(h.lastKnown&&this.elapsed-h.lastObserved<1.5){h.state='chase';target=h.lastKnown;speed=2.75;}
      else if(h.state==='chase'){
        h.state='search';h.searchUntil=this.elapsed+2;h.awareness=0;
        this.closeCalls++;this.notice('Lost it. Catch your breath.','lost');target=h.lastKnown;speed=1.3;
      }else if(h.state==='search'&&this.elapsed<h.searchUntil){
        target=h.lastKnown;speed=1.3;if(target&&distance(h,target)<0.15){h.facing+=dt;speed=0;}
      }else{
        h.state='patrol';h.awareness=Math.max(0,h.awareness-dt*1.5);h.lastKnown=null;
        target=h.patrol[h.routeIndex];
        if(distance(h,target)<0.1){
          if(h.pauseUntil===0)h.pauseUntil=this.elapsed+0.75;
          if(this.elapsed<h.pauseUntil){speed=0;}else{h.pauseUntil=0;h.routeIndex=(h.routeIndex+1)%h.patrol.length;target=h.patrol[h.routeIndex];}
        }
      }
      if(h.state==='chase'&&previousState!=='chase'){this.alarms++;this.events.push('spotted');}
      // A king cobra hunts a little faster than any snake.
      if(h.kind==='cobra')speed*=1.18;
      if(target&&speed>0)this.moveHunter(target,speed*dt,h);
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
        h.state='sink';h.phaseUntil=this.elapsed+3.5;this.events.push('snap');
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
      if(h.state==='crouch'){if(this.elapsed>=h.phaseUntil){h.state='pounce';h.pounceFrom=copy(h);h.phaseUntil=this.elapsed+.6;this.events.push('skitter');}return;}
      if(h.state==='pounce'){
        const remaining=distance(h,h.aim),step=Math.min(remaining,8*dt),next={x:h.x+Math.cos(h.facing)*step,y:h.y+Math.sin(h.facing)*step};
        if(remaining<.05||this.elapsed>=h.phaseUntil||!this.fits(next,.22,h)){h.state='sniff';h.phaseUntil=this.elapsed+1.6;h.path=[];return;}
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return;
      }
      const heard=(p.noisy||p.sprinting)&&this.audible(h,p,7)||p.moving&&!p.hidden&&this.audible(h,p,2.6),lure=this.decoy&&this.decoy.expires!==h.lastLure&&this.audible(h,this.decoy,7);
      if((heard||lure)&&this.elapsed>=(h.calmUntil||0)){
        const target=lure&&!heard?copy(this.decoy):this.lead(.2);if(lure)h.lastLure=this.decoy.expires;
        const d=Math.min(distance(h,target)+.4,4.5),a=Math.atan2(target.y-h.y,target.x-h.x);
        h.aim={x:h.x+Math.cos(a)*d,y:h.y+Math.sin(a)*d};h.facing=a;h.state='crouch';h.phaseUntil=this.elapsed+.22;h.reason='heard';h.calmUntil=this.elapsed+2.2;this.alarms++;return;
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
      if(this.decoy&&this.decoy.expires!==h.lastLure&&distance(h,this.decoy)<1.5){h.lastLure=this.decoy.expires;h.state='hide';h.phaseUntil=this.elapsed+3;h.aim=null;this.events.push('scrape');return;}
      if(h.state==='hide'){if(this.elapsed>=h.phaseUntil)h.state='return';return;}
      if(h.state==='peek'){if(this.elapsed>=h.phaseUntil){h.state='scuttle';h.phaseUntil=this.elapsed+1.3;this.alarms++;this.events.push('skitter');}return;}
      if(h.state==='scuttle'){
        const lead=this.lead(.3),aim=Math.max(lo,Math.min(hi,lead[a]));h.facing=a==='x'?(aim>=h.x?0:Math.PI):(aim>=h.y?Math.PI/2:-Math.PI/2);
        if(!slide(aim,4.6)&&Math.abs(aim-h[a])<.05||this.elapsed>=h.phaseUntil){h.state='tired';h.phaseUntil=this.elapsed+1.6;}
        return;
      }
      if(h.state==='tired'){if(this.elapsed>=h.phaseUntil)h.state='return';return;}
      if(h.state==='return'){if(!slide(h.home[a],1.2)||Math.abs(h[a]-h.home[a])<.05)h.state='shell';return;}
      // In its shell: wake only for Sally in plain sight close by, roughly level with its lane.
      if(!p.hidden&&distance(h,p)<=3&&Math.abs(p[b]-h[b])<=2.2&&this.clear(h,p,true)){h.state='peek';h.phaseUntil=this.elapsed+.35;this.events.push('rustle');}
    }
    // Flytrap: rooted and always shown. Anything that comes within reach (or a pebble that lands
    // there) makes it snap where Sally is heading; then it chews for a while and is harmless.
    updateFlytrap(dt,h){
      const p=this.player,reach=h.reach||1.6;
      if(h.state==='snap'){
        if(this.elapsed<h.phaseUntil)return;
        h.state='chew';h.phaseUntil=this.elapsed+2.4;this.events.push('snap');
        if(distance(p,h.aim)<.72&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','The flytrap snapped shut. Wait for it to bite at something else, then pass while it chews.');
        return;
      }
      if(h.state==='chew'){if(this.elapsed>=h.phaseUntil)h.state='open';return;}
      const lure=this.decoy&&this.decoy.expires!==h.lastLure&&distance(h,this.decoy)<=reach&&this.clear(h,this.decoy),near=distance(h,p)<=reach&&this.clear(h,p,true);
      if(lure||near){
        h.aim=lure?copy(this.decoy):this.lead(.3);if(lure)h.lastLure=this.decoy.expires;
        if(distance(h,h.aim)>reach){const a=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.aim={x:h.x+Math.cos(a)*reach,y:h.y+Math.sin(a)*reach};}
        h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='snap';h.phaseUntil=this.elapsed+.32;this.events.push('rustle');
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
        h.state='stab';h.phaseUntil=this.elapsed+1.3;this.events.push('snap');
        if(!p.swimming&&(this.inBeakLine(h,p)||distance(p,h.aim)<.6)&&this.elapsed>=this.invulnerableUntil&&!this.shedTail(h))this.finish('caught','The bog heron stabbed. Cross its beak line while it looks away or recovers from a stab, or swim past under the surface.');
        return;
      }
      if(h.state==='stab'){if(this.elapsed>=h.phaseUntil)h.state='still';return;}
      if(h.looks&&this.elapsed>=h.turnAt){h.look=(h.look+1)%h.looks.length;h.facing=h.looks[h.look];h.turnAt=this.elapsed+h.every;}
      const lure=this.decoy&&this.decoy.expires!==h.lastLure&&this.inBeakLine(h,this.decoy),near=!p.swimming&&this.inBeakLine(h,p);
      if(lure||near){h.aim=lure?copy(this.decoy):copy(p);if(lure)h.lastLure=this.decoy.expires;h.state='aim';h.phaseUntil=this.elapsed+.25;this.events.push('rustle');}
    }
    // Tangle vine: stepping on one holds Sally for a moment. If a hunter sees her while she is
    // held she is caught (a spare tail is left in the vine instead); otherwise it lets her go.
    updateVines(){
      const p=this.player,t=this.elapsed,here=this.tileKey(p);
      if(this.heldBy){
        const v=this.heldBy,spotter=this.hunters.find(h=>!['flytrap','heron','angler','mimic','cricket'].includes(h.kind)&&this.seesPlayer(h));
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
      if(h.state==='alert'&&previousState!=='alert')this.events.push('warning');
      if(h.state==='chase'&&previousState!=='chase'){this.alarms++;this.events.push('spotted');}
      if(target&&speed)this.moveHunter(target,speed*dt,h);
    }
    updateMimic(dt,h){
      h.anchor||=copy(h);
      if(h.state==='reveal'){
        if(this.elapsed>=h.phaseUntil){h.state='lunge';h.phaseUntil=this.elapsed+.55;this.alarms++;this.events.push('snap');}return;
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
      const lure=this.decoy&&this.decoy.expires!==h.lastLure&&distance(h,this.decoy)<=5&&this.clear(h,this.decoy),seen=!this.player.hidden&&distance(h,this.player)<=1.7&&this.clear(h,this.player);
      if(lure||seen){
        h.aim=lure?copy(this.decoy):this.lead(.25);if(lure)h.lastLure=this.decoy.expires;
        h.reason=lure?'heard':'seen';h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='reveal';h.phaseUntil=this.elapsed+.4;this.events.push('rustle');
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
      if(h.state!=='follow'&&this.elapsed>=(h.scrapeAt||0)){this.events.push('scrape');h.scrapeAt=this.elapsed+3;}
      h.state='follow';h.reason='seen';
      this.moveHunter(this.player,(distance(h,this.player)<1.5?1.6:2.3)*dt,h);
    }
    updateMoth(dt,h){
      // Follow actual luminous footprints, never an unseen player's position.
      // Once a swoop is armed its landing point stays fixed.
      if(h.state==='glimmer'){
        if(this.elapsed>=h.phaseUntil){h.state='swoop';h.phaseUntil=this.elapsed+.85;this.events.push('flutter');this.alarms++;}return;
      }
      if(h.state==='swoop'){
        const d=distance(h,h.aim),step=Math.min(d,4*dt),next={x:h.x+Math.cos(h.facing)*step,y:h.y+Math.sin(h.facing)*step};
        if(d<.05||this.elapsed>=h.phaseUntil||!this.clear(h,next,true)){h.state='recover';h.phaseUntil=this.elapsed+1.4;return;}
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return;
      }
      if(h.state==='recover'){if(this.elapsed>=h.phaseUntil){h.state='patrol';h.aim=null;}return;}
      const target=[...(this.decoy?[this.decoy]:[]),...this.glowTrail.slice().reverse()].find(t=>distance(h,t)<=4&&this.clear(h,t,true));
      if(target){h.aim=copy(target);h.state='glimmer';h.phaseUntil=this.elapsed+.6;h.facing=Math.atan2(target.y-h.y,target.x-h.x);this.events.push('glimmer');return;}
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
      if(h.state==='glare'){if(this.elapsed>=h.phaseUntil){h.state='swoop';this.alarms++;this.events.push('flutter');}return;}
      if(h.state==='swoop'){
        // The swoop bends toward Sally, so a straight dash is not enough; hide or turn sharply.
        h.swoopTime=(h.swoopTime||0)+dt;if(!p.hidden&&h.swoopTime<1){const want=Math.atan2(p.y-h.aim.y,p.x-h.aim.x),gap=distance(h.aim,p),pull=Math.min(gap,3*dt);h.aim={x:h.aim.x+Math.cos(want)*pull,y:h.aim.y+Math.sin(want)*pull};}
        const d=distance(h,h.aim),step=Math.min(d,6.5*dt);
        if(d<.05||h.swoopTime>=1.2){h.state='return';h.phaseUntil=this.elapsed+.6;h.swoopTime=0;return;}
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
        h.aim=copy(target);h.facing=Math.atan2(target.y-h.y,target.x-h.x);h.state='glare';h.phaseUntil=this.elapsed+.7;h.swoopTime=0;this.events.push('hoot');return;
      }
      const look=h.patrol[h.routeIndex],want=Math.atan2(look.y-h.y,look.x-h.x),turn=Math.atan2(Math.sin(want-h.facing),Math.cos(want-h.facing));
      if(Math.abs(turn)>.02){h.facing+=Math.sign(turn)*Math.min(Math.abs(turn),1.1*dt);h.lookUntil=this.elapsed+1.8;}
      else if(this.elapsed>=(h.lookUntil||0))h.routeIndex=(h.routeIndex+1)%h.patrol.length;
    }
    owlSees(h){
      const p=this.player,d=distance(h,p);if(p.hidden||d>7||!this.clear(h,p,true))return false;
      const diff=Math.atan2(Math.sin(Math.atan2(p.y-h.y,p.x-h.x)-h.facing),Math.cos(Math.atan2(p.y-h.y,p.x-h.x)-h.facing));return d<.9||Math.abs(diff)<Math.PI/9;
    }
    // The cricket is an alarm: harmless itself, but when it notices Sally it chirps,
    // and every hunter in earshot heads for the spot as if a pebble had landed there.
    updateCricket(dt,h){
      const p=this.player;
      if(h.state==='chirp'){
        if(this.elapsed>=h.phaseUntil){this.decoy={x:h.aim.x,y:h.aim.y,expires:this.elapsed+4,chirp:true};this.alarms++;this.events.push('chirp');this.notice('A cricket chirps! Every hunter nearby is coming.','warning');h.state='recover';h.phaseUntil=this.elapsed+5;}
        return;
      }
      if(h.state==='recover'){if(this.elapsed>=h.phaseUntil)h.state='patrol';return;}
      const seen=this.seesPlayer(h),heard=p.noisy&&!p.hidden&&this.audible(h,p,8);
      if(seen||heard){h.state='chirp';h.aim=copy(p);h.reason=seen?'seen':'heard';h.facing=Math.atan2(p.y-h.y,p.x-h.x);h.phaseUntil=this.elapsed+.5;this.events.push('skitter');return;}
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
      if(h.state==='rear'){if(this.elapsed>=h.phaseUntil){h.state='strike';h.strikeFrom=copy(h);h.phaseUntil=this.elapsed+.4;this.events.push('sting');}return true;}
      if(h.state==='strike'){
        const dx=Math.cos(h.facing),dy=Math.sin(h.facing),step=12*dt,next={x:h.x+dx*step,y:h.y+dy*step};
        if(!this.fits(next,.22,h)||this.elapsed>=h.phaseUntil||distance(h.strikeFrom,next)>h.reach){
          h.state='chase';h.awareness=1;h.lastKnown=copy(p);h.lastObserved=this.elapsed;h.path=[];return true;}
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return true;
      }
      if(h.state==='coiled'||h.state==='return'||h.state==='patrol'){
        if(this.seesPlayer(h)){
          h.awareness=Math.min(1,h.awareness+dt/.3);h.facing=Math.atan2(p.y-h.y,p.x-h.x);
          if(h.awareness>=1){h.aim=this.lead(.35);h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='rear';h.phaseUntil=this.elapsed+.45;this.alarms++;this.events.push('hiss');this.notice('The king cobra rears. It strikes, then it hunts.','warning');}
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
        if(this.elapsed>=h.phaseUntil){h.state='charge';h.phaseUntil=this.elapsed+2.4;h.chargeFrom=copy(h);this.events.push('charge');}
        return;
      }
      if(h.state==='charge'){
        const dx=Math.cos(h.facing),dy=Math.sin(h.facing),step=7.5*dt,next={x:h.x+dx*step,y:h.y+dy*step};
        const front=[Math.floor(h.x+dx*.5),Math.floor(h.y+dy*.5)];if(this.grid[front[1]]?.[front[0]]==='L')this.smash(...front);
        // The charge runs up to three tiles past its aim, or until a wall stops it.
        h.chargeFrom||=copy(h);if(!this.fits(next,.22,h)||this.elapsed>=h.phaseUntil||h.aim&&distance(h.chargeFrom,next)>distance(h.chargeFrom,h.aim)+3){
          const straight=Math.abs(dx)>.92||Math.abs(dy)>.92,wall=[Math.floor(h.x+Math.round(dx)*.75),Math.floor(h.y+Math.round(dy)*.75)];
          const hitWall=!this.fits(next,.22,h);if(straight&&hitWall)this.smash(...wall);
          h.state=hitWall?'stunned':'recover';h.phaseUntil=this.elapsed+(hitWall?1.8:1);h.awareness=0;h.path=[];this.events.push('clash');return;
        }
        h.x=next.x;h.y=next.y;h.distanceMoved+=step;return;
      }
      if(h.state==='stunned'||h.state==='recover'){if(this.elapsed>=h.phaseUntil){h.state='patrol';h.aim=null;}return;}
      const seen=this.seesPlayer(h),heard=this.player.noisy&&!this.player.hidden&&this.audible(h,this.player,this.player.sprinting?6:3.5);
      if(seen){
        h.awareness=Math.min(1,h.awareness+dt/.6);h.state='alert';h.reason='seen';
        h.facing=Math.atan2(this.player.y-h.y,this.player.x-h.x);
        if(h.awareness>=1){h.aim=this.lead(.45);h.facing=Math.atan2(h.aim.y-h.y,h.aim.x-h.x);h.state='windup';h.phaseUntil=this.elapsed+.55;this.alarms++;this.notice('The beetle lowers its horn. Get out of its lane!','warning');}
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
        if(distance(h,p)<2&&this.clear(h,p)){h.surfaced=true;h.state='emerge';h.phaseUntil=this.elapsed+.35;h.alertUntil=this.elapsed+3;this.events.push('emerge');this.notice('A scorpion bursts from the sand!','tail');}
        return;
      }
      if(h.state==='emerge'){if(this.elapsed>=h.phaseUntil)h.state='patrol';return;}
      if(h.state==='raise'){h.tailUp=true;if(this.elapsed>=h.phaseUntil){if(inRing){h.aim=this.lead(.3);h.state='windup';h.phaseUntil=this.elapsed+.3;}else h.state='alert';}return;}
      if(h.state==='windup'){
        if(this.elapsed>=h.phaseUntil){h.state='sting';h.phaseUntil=this.elapsed+.2;this.events.push('sting');}
        return;
      }
      if(h.state==='sting'){
        if(this.elapsed>=h.phaseUntil){h.state='recover';h.phaseUntil=this.elapsed+1;h.awareness=0;h.alertUntil=0;}
        return;
      }
      if(h.state==='recover'){h.tailUp=false;if(this.elapsed>=h.phaseUntil){h.state='patrol';h.aim=null;h.path=[];h.restUntil=this.elapsed+.6;}return;}
      const cycle=(this.elapsed+(h.offset||0))%3.8,seen=this.seesPlayer(h),heard=p.noisy&&!p.hidden&&this.audible(h,p,6);
      if(heard)h.alertUntil=this.elapsed+2.5; // Noise keeps the tail up; being seen does not, so the rhythm always leaves a window.
      h.tailUp=this.elapsed>=(h.restUntil||0)&&(cycle<2||this.elapsed<(h.alertUntil||0));
      if(inRing){
        h.facing=Math.atan2(p.y-h.y,p.x-h.x);this.alarms++;
        if(h.tailUp){h.aim=this.lead(.3);h.state='windup';h.phaseUntil=this.elapsed+.4;this.notice('Scorpion strike! Change direction!','tail');}
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
          if(h.kind==='toad'){h.state='tongue';h.phaseUntil=this.elapsed+.35;h.tongueLength=0;this.events.push('tongue');}
          else{if(this.fits(h.aim)&&this.clear(h,h.aim,true))this.webs.push({...h.aim,expires:this.elapsed+6});h.state='recover';h.phaseUntil=this.elapsed+1.2;this.events.push('web');}
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
      const seen=this.seesPlayer(h),lure=this.decoy&&this.audible(h,this.decoy,9)&&!(seen&&distance(h,p)<1.2);
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
        for(const h of this.hunters)if(distance(h,log.pos)<.6&&!['owl','moth'].includes(h.kind)&&h.state!=='steamed'){h.state='steamed';h.phaseUntil=t+2;h.path=[];this.events.push('clash');}
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
        h.state='rush';h.aim=copy(p);h.rushUntil=this.elapsed+3;h.path=[];this.alarms++;this.notice('The web trembles. The spider is coming!','warning');}
    }
    // Is Sally on the line of a toad's tongue?
    toadTongueHit(){
      const p=this.player;return this.hunters.find(h=>h.kind==='toad'&&h.state==='tongue'&&h.tongueLength>0&&(()=>{const dx=Math.cos(h.facing),dy=Math.sin(h.facing),t=(p.x-h.x)*dx+(p.y-h.y)*dy;if(t<0||t>h.tongueLength+.2)return false;return Math.abs((p.x-h.x)*dy-(p.y-h.y)*dx)<.4;})());
    }
    moveHunter(target,budget,h=this.hunter){
      if(this.grid[Math.floor(h.y)]?.[Math.floor(h.x)]==='M')budget*=.72;
      if(h.kind==='sea-snake')budget*=this.water(h)?1.05:.65;
      // Cold-blooded hunters crawl in the frozen rooms; owls and moths do not mind.
      if(this.cold.has(this.tileKey(h))&&!['owl','moth','fox'].includes(h.kind))budget*=.6;
      const id=Math.floor(target.x)+','+Math.floor(target.y);
      if(h.targetId!==id || !h.path.length){h.path=this.route(h,target,h);h.targetId=id;}
      while(h.path.length&&budget>0){
        const point=h.path[0],d=distance(h,point);
        if(d<0.01){h.path.shift();continue;}
        const step=Math.min(budget,d),next={x:h.x+(point.x-h.x)*step/d,y:h.y+(point.y-h.y)*step/d};
        if(!this.clear(h,next,false,h)||!this.fits(next,.22,h)){h.path=[];break;}
        h.facing=Math.atan2(next.y-h.y,next.x-h.x);h.x=next.x;h.y=next.y;h.distanceMoved+=step;budget-=step;
        if(step>=d-0.00001)h.path.shift();
      }
    }
    finish(status,message){
      if(this.status!=='playing')return;
      this.status=status;this.notice(message,status);
      this.tongue=null;
      const stars=status==='won'?1+Number(this.treasure>=Math.ceil(this.totalTreasure*.6))+Number(this.alarms===0&&this.hasTail):0;
      this.result=Object.freeze({status,levelId:this.level.id,hidden:Boolean(this.level.hidden),routeRevision:this.level.revision||1,levelName:this.level.name,challengeId:this.challenge?.id||null,stars,alarms:this.alarms,treasure:this.treasure,totalTreasure:this.totalTreasure,time:this.elapsed,closeCalls:this.closeCalls,tonguesUsed:this.tonguesUsed,keyByTongue:this.keyByTongue,reactionsFired:this.reactionsFired.size,tailsDropped:this.tailsDropped,hasTail:this.hasTail,camosUsed:this.camosUsed,thefts:this.thefts,lowestWarmth:Math.round(this.lowestWarmth),blasts:this.blasts,steamed:this.steamed,recoveries:this.recoveries,stolen:this.stolen,hawkDodges:this.hawk?.dodges||0,glowbugs:this.glowbugsCaught,message});
    }
    drainEvents(){const events=this.events;this.events=[];return events;}
  }
  root.EscapeAdventure=EscapeAdventure;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeAdventure};
})(typeof globalThis!=='undefined'?globalThis:this);
