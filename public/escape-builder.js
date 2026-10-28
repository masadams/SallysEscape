// The level builder's model: a text map plus enemies, doors, triggers, hazards and a few
// settings. Everything here is plain data, so it is easy to test, save in the browser, share as
// text, and publish to the community shelf. toRoute turns it into the route the game plays, and
// fromRoute turns any escape in the game back into a model, so every escape can be edited.
(function(root){
  const KEY='sally-escape-custom-v1',VERSION=3;
  const TILES={'#':'Wall','.':'Floor','L':'Leaves','N':'Gravel','B':'Cracked wall','M':'Mud (slows Sally; linger and she sinks, run and she splashes loudly)','~':'Water','_':'Gap','c':'Crumbling floor','T':'Tangle vine','S':'Crack (Sally only)','o':'Spore puffball','t':'Tide flat','m':'Moss (silent)','d':'Soft dirt (Sally digs in)','s':'Soft sand (slows Sally, keeps her tracks)','I':'Ice wall (a sentinel’s gaze glances off it)'};
  const MARKS={'@':'Sally','K':'Key','X':'Hatch','1':'Treasure 1','2':'Treasure 2','3':'Chest 3'};
  const ENEMIES={snake:'Snake',ladybird:'Ladybird',beetle:'Beetle',scorpion:'Scorpion',toad:'Toad',spider:'Spider',cricket:'Cricket',moth:'Moth',mimic:'Mimic',millipede:'Millipede',cobra:'King cobra',flytrap:'Flytrap',crab:'Hermit crab',fox:'Snow fox',heron:'Bog heron',mantis:'Praying mantis',wasp:'Wasp nest',dragonfly:'Dragonfly',mole:'Mole',bat:'Echo bat',eel:'Eel',angler:'Angler',fish:'Reef fish','sea-snake':'Sea snake',owl:'Owl',gecko:'Gecko',echofrog:'Echo frog',chameleon:'Chameleon',sentinel:'Frost sentinel',cloudray:'Cloud ray',magpie:'Magpie'};
  // Enemies that stay on their post; the rest walk their patrol.
  const POSTED=new Set(['scorpion','toad','mimic','millipede','cobra','flytrap','crab','heron','mantis','wasp','eel','angler','gecko','echofrog','sentinel','magpie']);
  const LIMITS={minW:11,maxW:45,minH:6,maxH:29,doors:6,triggers:24,hazards:40,guards:30};
  // Doors and bridges come in six colours; each colour is one door and one bridge.
  const COLORS=[['Red',[226,96,96]],['Blue',[96,150,236]],['Gold',[240,196,80]],['Green',[110,200,120]],['Violet',[178,120,230]],['Teal',[80,200,196]]];
  // How a door or bridge behaves when one of its triggers fires.
  const MODES={timed:'Opens for a few seconds',stay:'Opens and stays open',once:'Opens once for a few seconds, then is gone',shut:'Starts open, slams shut for good',crumble:'Starts open, crumbles after Sally crosses (bridge)'};
  const TRIGGERS={plate:'Plate',heavy:'Heavy plate (beetle)',lever:'Lever',switch:'Switch'};
  const HAZARDS={vent:'Steam vent',thorns:'Thorns',log:'Rolling log'};
  const SPEEDS={slow:'Slow',medium:'Medium',fast:'Fast'};
  const TIMING={vent:{slow:[5.2,1.6],medium:[4.2,1.5],fast:[3.2,1.2]},thorns:{slow:[3.2,1.4],medium:[2.6,1.2],fast:[2,1]},log:{slow:[6,5],medium:[4.5,7],fast:[3.5,9]}};
  const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  const solid=ch=>ch==='#'||ch==='I';
  const walkable=ch=>ch!==undefined&&!['#','_','B'].includes(ch);
  // Creatures cannot squeeze through a crack; only Sally can.
  const roamable=ch=>walkable(ch)&&ch!=='S';
  const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
  const clampInt=(n,a,b)=>Math.max(a,Math.min(b,Math.round(Number(n)||0)));
  const clampNum=(n,a,b,d=a)=>Number.isFinite(Number(n))?Math.max(a,Math.min(b,Number(n))):d;
  // Whole-level extras the game supports beyond the map: the sky, the weather, and what lives there.
  // How a level looks: its own palette and ground, and (for the autumn looks) the creatures in costume.
  const LOOKS={'':'Plain','autumn':'Autumn Hollow','autumn-dusk':'Autumn Hollow at dusk','autumn-night':'Autumn Hollow at night','autumn-mill':'Autumn Hollow mill','autumn-festival':'Autumn Hollow festival','winter-village':'Winterlight village','winter-ice':'Winterlight ice','winter-workshop':'Winterlight workshop','winter-night':'Winterlight night','winter-finale':'Winterlight finale','spring-garden':'Blossom Hollow garden','spring-shed':'Blossom Hollow potting shed','spring-pond':'Blossom Hollow lily pond','spring-glass':'Blossom Hollow glasshouse','spring-dusk':'Blossom Hollow after rain','summer-dunes':'Sunshore dunes','summer-pools':'Sunshore rock pools','summer-tide':'Sunshore tidal flats','summer-harbour':'Sunshore harbour','summer-lagoon':'Sunshore reed lagoon','summer-boatshed':'Sunshore boatshed','summer-sunset':'Sunshore at sunset','summer-lighthouse':'Sunshore lighthouse'};
  // Scenery that sits on any tile and changes nothing in play.
  const PROPS={lantern:'Lantern post',tree:'Autumn tree',pumpkin:'Pumpkin',brazier:'Brazier',pine:'Pine tree',gift:'Gift',blossom:'Blossom tree',flowerpot:'Flower pot',wateringcan:'Watering can',flowerlantern:'Flower lantern',parasol:'Beach parasol',sandcastle:'Sandcastle',buoy:'Buoy',crate:'Fish crate',bunting:'Bunting',harbourlantern:'Harbour lantern',rowboat:'Rowing boat',lighthouse:'Lighthouse'};
  const LAYERS={shade:'Awning (shade from the hawk)',glowPlants:'Glow plant (light in the dark)',regrowth:'Pink regrowth bug (grows back a lost tail)',slippery:'Glide ice (Sally slides and speeds up; Crawl brakes)',thinIce:'Thin ice (cracks under Sally and breaks into water; crawl to spread her weight)',wet:'Wet ground (a gentle slide; on a slope it carries Sally on down; Crawl grips)',shrubs:'Decoy shrub (looks just like a sleeping mimic but is harmless)'};
  const EXTRAS=()=>({hint:'',tailDrop:false,timeLimit:0,camos:0,seeds:0,diggers:0,glows:0,spores:0,cunning:2,unlimited:false,gaze:false,sightRadius:0,dark:false,living:false,abyss:false,biome:'',
    hawk:null,storm:null,tide:null,caps:[],wind:[],echoes:[],currents:[],tunnels:[],antTrails:[],seedCrossings:[],rootWheel:null,rivalries:[],shade:[],glowPlants:[],regrowth:[],slippery:[],thinIce:[],wet:[],shrubs:[],regions:[],messages:{},pages:[],gentle:0,foxWarn:0,look:'',checkpoints:[],signs:[],props:[],crates:[],ropes:[],millWheel:null});

  function blank(width=21,height=13){
    width=clampInt(width,LIMITS.minW,LIMITS.maxW);height=clampInt(height,LIMITS.minH,LIMITS.maxH);
    const rows=[];for(let y=0;y<height;y++){let r='';for(let x=0;x<width;x++)r+=(x===0||y===0||x===width-1||y===height-1)?'#':'.';rows.push(r);}
    rows[height-2]=replaceAt(rows[height-2],1,'@');rows[1]=replaceAt(rows[1],width-2,'K');rows[height-2]=replaceAt(rows[height-2],width-2,'X');
    return {version:VERSION,id:'custom-'+Date.now().toString(36),name:'My escape',brief:'A level of my own.',author:'',map:rows,guards:[],doors:[],triggers:[],links:[],hazards:[],cold:[],warm:[],
      burrows:0,pebbles:1,tongues:0,explore:false,requiredTreasure:0,nextId:1,...EXTRAS()};
  }
  const replaceAt=(row,x,ch)=>row.slice(0,x)+ch+row.slice(x+1);
  const at=(model,x,y)=>model.map[y]?.[x];
  const edge=(model,x,y)=>x<=0||y<=0||y>=model.map.length-1||x>=model.map[0].length-1;
  const newId=(model,prefix)=>prefix+(model.nextId=(model.nextId||1)+1);
  const doorAt=(model,x,y)=>model.doors.find(d=>d.tiles.some(t=>same(t,[x,y])));
  const triggerAt=(model,x,y)=>model.triggers.find(t=>same(t.at,[x,y]));
  const hazardAt=(model,x,y)=>model.hazards.find(h=>same(h.at,[x,y])||h.type==='log'&&same(h.to,[x,y]));
  const guardAt=(model,x,y)=>model.guards.find(g=>same(g.spawn,[x,y]));
  // The key and every chest are triggers too: taking them can open doors and wake enemies.
  // Walking into a marked area is a trigger as well.
  const regionAt=(model,x,y)=>(model.regions||[]).find(r=>x>=r.area[0]&&x<=r.area[2]&&y>=r.area[1]&&y<=r.area[3]);
  const sourceAt=(model,x,y)=>{const t=triggerAt(model,x,y);if(t)return t.id;const ch=at(model,x,y);if(ch==='K')return 'key';if(/[1-5]/.test(ch||''))return 'chest:'+x+','+y;const r=regionAt(model,x,y);return r?'enter:'+r.id:null;};
  function prune(model){
    const sources=new Set(['key',...model.triggers.map(t=>t.id),...(model.regions||[]).map(r=>'enter:'+r.id)]);model.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(/[1-5]/.test(c))sources.add('chest:'+x+','+y);}));
    const targets=new Set([...model.doors.map(d=>d.id),...model.guards.map(g=>g.id)]),guards=new Set(model.guards.map(g=>g.id));
    model.links=model.links.filter(([s,t])=>sources.has(s)&&targets.has(t));
    if(model.messages)for(const k of Object.keys(model.messages))if(!sources.has(k))delete model.messages[k];
    if(model.rivalries)model.rivalries=model.rivalries.filter(([a,b])=>guards.has(a)&&guards.has(b));
  }
  // Clearing a tile removes whatever stood there that can no longer stand on it.
  function clearAt(model,x,y,ch){
    if(!roamable(ch)){model.guards=model.guards.filter(g=>!same(g.spawn,[x,y]));for(const g of model.guards)g.patrol=g.patrol.filter(p=>!same(p,[x,y]));
      model.triggers=model.triggers.filter(t=>!same(t.at,[x,y]));}
    if(ch!=='#')model.hazards=model.hazards.filter(h=>!(h.type==='vent'&&same(h.at,[x,y])));
    if(!walkable(ch)){model.hazards=model.hazards.filter(h=>h.type==='vent'||!same(h.at,[x,y])&&!same(h.to,[x,y]));model.cold=model.cold.filter(p=>!same(p,[x,y]));model.warm=model.warm.filter(p=>!same(p,[x,y]));
      for(const k of Object.keys(LAYERS))if(model[k])model[k]=model[k].filter(p=>!same(p,[x,y]));}
    for(const d of model.doors)d.tiles=d.tiles.filter(t=>!same(t,[x,y]));model.doors=model.doors.filter(d=>d.tiles.length);
    prune(model);
  }

  // Paint one tile. Sally, the key and the hatch are unique, so placing one moves it.
  function paint(model,x,y,ch){
    if(at(model,x,y)===undefined||edge(model,x,y)&&ch!=='#')return false;
    if(['@','K','X'].includes(ch))model.map=model.map.map(r=>r.replaceAll(ch,'.'));
    model.map[y]=replaceAt(model.map[y],x,ch);clearAt(model,x,y,ch);
    return true;
  }
  function resize(model,width,height){
    const next=blank(width,height),w=next.map[0].length,h=next.map.length,inside=([x,y])=>x<w-1&&y<h-1;
    next.map=next.map.map((row,y)=>[...row].map((ch,x)=>edge({map:next.map},x,y)?'#':model.map[y]?.[x]!==undefined&&!edge(model,x,y)?model.map[y][x]:'.').join(''));
    const keep={...model,map:next.map};
    keep.guards=model.guards.filter(g=>inside(g.spawn)).map(g=>({...g,patrol:g.patrol.filter(inside)}));
    keep.doors=model.doors.map(d=>({...d,tiles:d.tiles.filter(inside)})).filter(d=>d.tiles.length);
    keep.triggers=model.triggers.filter(t=>inside(t.at));keep.hazards=model.hazards.filter(z=>inside(z.at)&&(!z.to||inside(z.to)));
    keep.cold=model.cold.filter(inside);keep.warm=model.warm.filter(inside);keep.links=model.links.slice();
    for(const k of Object.keys(LAYERS))keep[k]=(model[k]||[]).filter(inside);
    keep.caps=(model.caps||[]).filter(c=>inside(c.at)&&inside(c.to));keep.antTrails=(model.antTrails||[]).map(t=>({...t,path:t.path.filter(inside)})).filter(t=>t.path.length>1);
    keep.wind=(model.wind||[]).filter(z=>inside([z.area[2],z.area[3]]));keep.echoes=(model.echoes||[]).filter(a=>inside([a[2],a[3]]));keep.currents=(model.currents||[]).filter(z=>inside([z.area[2],z.area[3]]));keep.tunnels=(model.tunnels||[]).filter(t=>t.every(inside));keep.regions=(model.regions||[]).filter(r=>inside([r.area[2],r.area[3]]));
    keep.seedCrossings=(model.seedCrossings||[]).filter(c=>[...c.banks,...c.tiles].every(inside));keep.rootWheel=model.rootWheel&&inside(model.rootWheel)?model.rootWheel:null;
    keep.pages=(model.pages||[]).filter(q=>inside(q.at));keep.signs=(model.signs||[]).filter(q=>inside(q.at));keep.props=(model.props||[]).filter(q=>inside(q.at));keep.checkpoints=(model.checkpoints||[]).filter(inside);keep.crates=(model.crates||[]).filter(inside);keep.ropes=(model.ropes||[]).filter(r=>inside(r.from)&&(!r.to||inside(r.to)));keep.millWheel=model.millWheel&&inside(model.millWheel)?model.millWheel:null;
    for(const ch of ['@','K','X'])if(!keep.map.some(r=>r.includes(ch))){const spot=findFloor(keep);if(spot)paint(keep,...spot,ch);}
    prune(keep);return keep;
  }
  function findFloor(model){for(let y=1;y<model.map.length-1;y++)for(let x=1;x<model.map[0].length-1;x++)if(at(model,x,y)==='.')return [x,y];return null;}

  function addEnemy(model,kind,x,y){
    if(!ENEMIES[kind]||!roamable(at(model,x,y))||doorAt(model,x,y)||model.guards.length>=LIMITS.guards&&!guardAt(model,x,y))return false;
    model.guards=model.guards.filter(g=>!same(g.spawn,[x,y]));
    model.guards.push({id:newId(model,'e'),kind,spawn:[x,y],facing:Math.PI,patrol:[[x,y]],sleep:false});prune(model);return true;
  }
  function removeEnemy(model,x,y){const n=model.guards.length;model.guards=model.guards.filter(g=>!same(g.spawn,[x,y]));prune(model);return model.guards.length<n;}
  // Turning a quarter turn sets where an enemy faces (where a heron's beak points, a cobra
  // looks, a crab runs) or which way a vent blows.
  function turnEnemy(model,x,y){
    const g=guardAt(model,x,y);if(g){g.facing=((Math.round((g.facing??Math.PI)/(Math.PI/2))+1)%4)*Math.PI/2;return true;}
    const v=model.hazards.find(h=>h.type==='vent'&&same(h.at,[x,y]));if(v){v.dir=(v.dir+1)%4;return true;}return false;
  }
  // Patrol points are added in order; posted enemies keep their single post.
  function addPatrol(model,index,x,y){const g=model.guards[index];if(!g||POSTED.has(g.kind)||!(g.kind==='dragonfly'?at(model,x,y)&&at(model,x,y)!=='#':roamable(at(model,x,y))))return false;if(g.patrol.length>=6)g.patrol.shift();g.patrol.push([x,y]);return true;}
  function clearPatrol(model,index){const g=model.guards[index];if(!g)return false;g.patrol=[g.spawn.slice()];return true;}
  // A sleeping enemy is not there at the start; a linked key or chest wakes it.
  function setSleep(model,id,sleep){const g=model.guards.find(q=>q.id===id);if(!g)return false;g.sleep=Boolean(sleep);return true;}

  // Doors are painted in a colour; each colour holds one door and one bridge.
  function paintDoor(model,x,y,color,bridge){
    const ch=at(model,x,y);if(ch===undefined||edge(model,x,y)||color<0||color>=COLORS.length)return false;
    if(['@','K','X'].includes(ch)||/[1-5]/.test(ch))return false;
    const id=(bridge?'b':'d')+color;let door=model.doors.find(d=>d.id===id);
    if(!door){if(model.doors.length>=LIMITS.doors*2)return false;door={id,color,bridge:Boolean(bridge),tiles:[],mode:'timed',seconds:5};model.doors.push(door);}
    for(const d of model.doors)d.tiles=d.tiles.filter(t=>!same(t,[x,y]));
    model.map[y]=replaceAt(model.map[y],x,bridge?'_':'.');door.tiles.push([x,y]);
    model.guards=model.guards.filter(g=>!same(g.spawn,[x,y]));model.triggers=model.triggers.filter(t=>!same(t.at,[x,y]));model.hazards=model.hazards.filter(h=>!same(h.at,[x,y])&&!same(h.to,[x,y]));
    model.doors=model.doors.filter(d=>d.tiles.length);prune(model);return true;
  }
  function removeDoorTile(model,x,y){const d=doorAt(model,x,y);if(!d)return false;d.tiles=d.tiles.filter(t=>!same(t,[x,y]));if(d.bridge)model.map[y]=replaceAt(model.map[y],x,'.');model.doors=model.doors.filter(q=>q.tiles.length);prune(model);return true;}
  function setDoor(model,id,changes){const d=model.doors.find(q=>q.id===id);if(!d)return false;
    if(changes.mode&&MODES[changes.mode]&&(changes.mode!=='crumble'||d.bridge))d.mode=changes.mode;
    if(changes.seconds!==undefined)d.seconds=clampInt(changes.seconds,1,30);if(changes.root!==undefined)d.root=Boolean(changes.root);
    if(changes.name!==undefined)d.name=String(changes.name).slice(0,30);return true;}

  function addTrigger(model,type,x,y){
    if(!TRIGGERS[type]||!roamable(at(model,x,y))||!['.','L','N','M'].includes(at(model,x,y))||doorAt(model,x,y)||hazardAt(model,x,y))return false;
    const old=triggerAt(model,x,y);if(old){old.type=type;return true;}
    if(model.triggers.length>=LIMITS.triggers)return false;
    model.triggers.push({id:newId(model,'t'),type,at:[x,y]});return true;
  }
  function removeAt(model,x,y){
    if(removeEnemy(model,x,y))return true;
    const t=triggerAt(model,x,y);if(t){model.triggers=model.triggers.filter(q=>q!==t);prune(model);return true;}
    const h=hazardAt(model,x,y);if(h){model.hazards=model.hazards.filter(q=>q!==h);return true;}
    if(removeDoorTile(model,x,y))return true;
    const n=model.cold.length+model.warm.length;model.cold=model.cold.filter(p=>!same(p,[x,y]));model.warm=model.warm.filter(p=>!same(p,[x,y]));return model.cold.length+model.warm.length<n;
  }
  // Link a trigger (a plate, heavy plate, lever, the key or a chest) to a door or an enemy;
  // linking again unlinks. Only the key and chests can wake a sleeping enemy.
  function toggleLink(model,source,target){
    const validSource=source==='key'||source?.startsWith('chest:')||model.triggers.some(t=>t.id===source)||(model.regions||[]).some(r=>'enter:'+r.id===source);
    const door=model.doors.find(d=>d.id===target),guard=model.guards.find(g=>g.id===target);
    if(!validSource||!door&&!guard)return {ok:false,reason:'Link a trigger to a door, bridge or enemy.'};
    if(guard&&!(source==='key'||source.startsWith('chest:')||source.startsWith('enter:')))return {ok:false,reason:'Only taking the key or a chest, or walking into an area, can wake an enemy.'};
    const i=model.links.findIndex(([s,t])=>s===source&&t===target);
    if(i>=0){model.links.splice(i,1);return {ok:true,linked:false};}
    model.links.push([source,target]);if(guard)guard.sleep=true;return {ok:true,linked:true};
  }
  // A link normally opens a door (or slams a "starts open" door shut); it can be set to close one instead.
  function setLinkAction(model,source,target,action){const l=model.links.find(([s,t])=>s===source&&t===target);if(!l)return false;if(action==='close')l[2]='close';else l.length=2;return true;}
  const linksFrom=(model,source)=>model.links.filter(([s])=>s===source).map(([,t])=>t);
  const linksTo=(model,target)=>model.links.filter(([,t])=>t===target).map(([s])=>s);

  // Hazards: a vent sits in a wall and blows into the room; thorns rise and fall on a tile; a
  // log rolls from one tile to another along a straight line.
  function addHazard(model,type,x,y){
    if(!HAZARDS[type]||hazardAt(model,x,y)||doorAt(model,x,y)||model.hazards.length>=LIMITS.hazards)return false;
    const ch=at(model,x,y);
    if(type==='vent'){if(!solid(ch))return false;const dir=DIRS.findIndex(([dx,dy])=>walkable(at(model,x+dx,y+dy)));if(dir<0)return false;model.hazards.push({id:newId(model,'h'),type,at:[x,y],dir,length:3,speed:'medium',offset:0});return true;}
    if(!walkable(ch)||triggerAt(model,x,y))return false;
    model.hazards.push({id:newId(model,'h'),type,at:[x,y],...(type==='log'?{to:null}:{}),speed:'medium',offset:0});return true;
  }
  function setLogEnd(model,id,x,y){
    const h=model.hazards.find(q=>q.id===id&&q.type==='log');if(!h||!walkable(at(model,x,y))||same(h.at,[x,y]))return false;
    if(h.at[0]!==x&&h.at[1]!==y)return false;
    const [ax,ay]=h.at,dx=Math.sign(x-ax),dy=Math.sign(y-ay);for(let cx=ax,cy=ay;!(cx===x&&cy===y);cx+=dx,cy+=dy)if(!walkable(at(model,cx,cy)))return false;
    h.to=[x,y];return true;
  }
  function setHazard(model,id,changes){const h=model.hazards.find(q=>q.id===id);if(!h)return false;
    if(changes.speed&&SPEEDS[changes.speed])h.speed=changes.speed;if(changes.offset!==undefined)h.offset=changes.offset?.5:0;
    if(changes.length!==undefined&&h.type==='vent')h.length=clampInt(changes.length,1,8);
    // Exact timing in seconds overrides the preset speed.
    for(const k of ['period','on','delay'])if(changes[k]!==undefined)h[k]=changes[k]===null?undefined:clampNum(changes[k],0,30);
    // How long the vent hisses or the log rumbles before it goes; a log can be a rolling snowball.
    if(changes.warn!==undefined&&h.type!=='thorns'){const v=Number(changes.warn);if(v>0)h.warn=clampNum(v,0,10);else delete h.warn;}
    if(changes.skin!==undefined&&h.type==='log'){if(changes.skin==='snowball')h.skin='snowball';else delete h.skin;}
    return true;}
  // Cold ground chills Sally; warm stones thaw her.
  function paintClimate(model,kind,x,y){
    if(!walkable(at(model,x,y)))return false;const spots=kind==='warm'?model.warm:model.cold;
    if(spots.some(p=>same(p,[x,y]))||kind==='warm'&&spots.length>=60)return false;spots.push([x,y]);return true;
  }

  // Tile layers: awnings, glow plants, regrowth bugs, glide ice. Painting a marked tile again clears it.
  function toggleLayer(model,layer,x,y){
    if(!LAYERS[layer]||!walkable(at(model,x,y)))return false;model[layer]=model[layer]||[];
    const i=model[layer].findIndex(p=>same(p,[x,y]));if(i>=0)model[layer].splice(i,1);else{if(model[layer].length>=120)return false;model[layer].push([x,y]);}return true;
  }
  // Pages: up to three short notes lying on the floor for players to find and read after the run
  // (a title and a few lines). An official escape opened here shows its own story page, to move or reword.
  const PAGE_LIMIT=3,cleanText=(v,n)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,n);
  function addPage(model,x,y){model.pages=model.pages||[];if(!walkable(at(model,x,y))||model.pages.some(p=>same(p.at,[x,y]))||model.pages.length>=PAGE_LIMIT)return false;model.pages.push({at:[x,y],title:'A note',body:'',author:''});return true;}
  function setPage(model,i,changes){const pg=(model.pages||[])[i];if(!pg)return false;if(changes.title!==undefined)pg.title=cleanText(changes.title,40)||'A note';if(changes.body!==undefined)pg.body=cleanText(changes.body,320);if(changes.author!==undefined)pg.author=cleanText(changes.author,30);return true;}
  const pageAt=(model,x,y)=>(model.pages||[]).findIndex(p=>same(p.at,[x,y]));
  // A bounce cap flings Sally from one tile to another; click the cap, then where it lands.
  // A rope or vine: click one end, then the other; it swings between them every few seconds.
  function addRope(model,x,y){if(!walkable(at(model,x,y))||(model.ropes||[]).some(r=>!r.to)||(model.ropes||[]).length>=8)return false;model.ropes=model.ropes||[];model.ropes.push({from:[x,y],to:null,period:4});return true;}
  function setRopeEnd(model,x,y){const r=(model.ropes||[]).find(r=>!r.to);if(!r||!walkable(at(model,x,y))||same(r.from,[x,y]))return false;r.to=[x,y];return true;}
  function setRope(model,i,changes){const r=(model.ropes||[])[i];if(!r)return false;if(changes.period!==undefined)r.period=clampNum(changes.period,2,12,4);if(changes.phase!==undefined){const v=clampNum(changes.phase,0,.99,0);if(v>0)r.phase=v;else delete r.phase;}return true;}
  function addCap(model,x,y){if(!walkable(at(model,x,y))||(model.caps||[]).some(c=>same(c.at,[x,y]))||(model.caps||[]).length>=12)return false;model.caps=model.caps||[];model.caps.push({at:[x,y],to:null});return true;}
  // Spring 0 is a plain cap; 1-3 lets a sprint carry Sally that many tiles further.
  function setCap(model,i,changes){const c=(model.caps||[])[i];if(!c)return false;if(changes.spring!==undefined){const v=clampInt(changes.spring,0,3);if(v>0)c.spring=v;else delete c.spring;}return true;}
  function setCapEnd(model,x,y){const c=(model.caps||[]).find(c=>!c.to);if(!c||!walkable(at(model,x,y))||same(c.at,[x,y]))return false;c.to=[x,y];return true;}
  // Wind lanes, trigger areas: a rectangle dragged between two corners.
  const rect=(x1,y1,x2,y2)=>[Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2)];
  // Echo halls (sound carries further), water currents (push a swimmer) and burrow pairs (two mounds).
  function addEcho(model,x1,y1,x2,y2){model.echoes=model.echoes||[];if(model.echoes.length>=8)return false;model.echoes.push(rect(x1,y1,x2,y2));return true;}
  function addCurrent(model,x1,y1,x2,y2){model.currents=model.currents||[];if(model.currents.length>=12)return false;model.currents.push({area:rect(x1,y1,x2,y2),dir:[1,0],speed:1.2});return true;}
  function setCurrent(model,i,changes){const z=(model.currents||[])[i];if(!z)return false;if(changes.dir!==undefined)z.dir=DIRS[clampInt(changes.dir,0,3)].slice();if(changes.speed!==undefined)z.speed=clampNum(changes.speed,.4,3,1.2);if(changes.surface!==undefined){if(changes.surface==='ground')z.surface='ground';else delete z.surface;}
    // A water stream can surge and ease every few seconds (0 keeps it steady); phase shifts its rhythm.
    if(changes.pulse!==undefined){const v=Number(changes.pulse);if(v>0)z.pulse=clampNum(v,2,20,6);else{delete z.pulse;delete z.phase;}}
    if(changes.phase!==undefined&&z.pulse){const v=Number(changes.phase);if(v>0)z.phase=clampNum(v,0,.99,0);else delete z.phase;}
    return true;}
  function addTunnel(model,a,b){model.tunnels=model.tunnels||[];if(model.tunnels.length>=6||same(a,b))return false;const ok=([x,y])=>{const c=model.map[y]?.[x];return c&&!['#','B','_','~','S'].includes(c);};if(!ok(a)||!ok(b))return false;model.tunnels.push([a.slice(),b.slice()]);return true;}
  function addWind(model,x1,y1,x2,y2){if((model.wind||[]).length>=12)return false;model.wind=model.wind||[];model.wind.push({area:rect(x1,y1,x2,y2),dir:[1,0],period:5,on:1.6,offset:0});return true;}
  function addRegion(model,x1,y1,x2,y2){if((model.regions||[]).length>=12)return false;model.regions=model.regions||[];const id='r'+(model.nextId=(model.nextId||1)+1);model.regions.push({id,area:rect(x1,y1,x2,y2),requiresKey:false});return id;}
  // An ant column marches a loop through the points it is given, in order.
  function addAntPoint(model,x,y,fresh){
    if(!walkable(at(model,x,y)))return false;model.antTrails=model.antTrails||[];
    let t=fresh?null:model.antTrails.at(-1);if(!t){if(model.antTrails.length>=6)return false;t={path:[],groups:3,size:3,speed:1.5};model.antTrails.push(t);}
    const last=t.path.at(-1);if(last&&(last[0]!==x&&last[1]!==y||same(last,[x,y])))return false; // Columns march in straight lines, turning at right angles.
    if(t.path.length>=16)return false;t.path.push([x,y]);return true;
  }
  // A seed bed: two banks either side of a gap or water; a planted seed grows a crossing between them.
  function addSeedCrossing(model,a,b){
    if(a[0]!==b[0]&&a[1]!==b[1])return false;const dx=Math.sign(b[0]-a[0]),dy=Math.sign(b[1]-a[1]),tiles=[];
    for(let x=a[0]+dx,y=a[1]+dy;!(x===b[0]&&y===b[1]);x+=dx,y+=dy)tiles.push([x,y]);if(!tiles.length)return false;
    model.seedCrossings=model.seedCrossings||[];model.seedCrossings.push({id:'seed-'+(model.nextId=(model.nextId||1)+1),banks:[a.slice(),b.slice()],tiles});return true;
  }
  // Checkpoints (a catch in a gentle level sends Sally back to the last one reached), trail signs
  // (read when Sally steps on them), scenery props and the mill wheel.
  // Crates sit on open floor; Sally can shove them, and one pushed into a gap fills it.
  function toggleCrate(model,x,y){const ch=at(model,x,y);if(!walkable(ch)||['~','S','c'].includes(ch))return false;model.crates=model.crates||[];const i=model.crates.findIndex(p=>same(p,[x,y]));if(i>=0)model.crates.splice(i,1);else{if(model.crates.length>=24)return false;model.crates.push([x,y]);}return true;}
  function toggleCheckpoint(model,x,y){if(!walkable(at(model,x,y)))return false;model.checkpoints=model.checkpoints||[];const i=model.checkpoints.findIndex(p=>same(p,[x,y]));if(i>=0)model.checkpoints.splice(i,1);else{if(model.checkpoints.length>=6)return false;model.checkpoints.push([x,y]);}return true;}
  function addSign(model,x,y){model.signs=model.signs||[];if(!walkable(at(model,x,y))||model.signs.some(q=>same(q.at,[x,y]))||model.signs.length>=4)return false;model.signs.push({at:[x,y],title:'A sign',body:''});return true;}
  function setSign(model,i,changes){const q=(model.signs||[])[i];if(!q)return false;if(changes.title!==undefined)q.title=cleanText(changes.title,40)||'A sign';if(changes.body!==undefined)q.body=cleanText(changes.body,320);return true;}
  const signAt=(model,x,y)=>(model.signs||[]).findIndex(q=>same(q.at,[x,y]));
  function toggleProp(model,kind,x,y){if(!PROPS[kind]||!at(model,x,y))return false;model.props=model.props||[];const i=model.props.findIndex(q=>same(q.at,[x,y]));
    if(i>=0){const same_=model.props[i].kind===kind;model.props.splice(i,1);if(same_)return true;}if(model.props.length>=40)return false;model.props.push({at:[x,y],kind});return true;}
  function setMillWheel(model,x,y){if(!at(model,x,y))return false;model.millWheel=same(model.millWheel,[x,y])?null:[x,y];return true;}
  function setRootWheel(model,x,y){if(!walkable(at(model,x,y)))return false;model.rootWheel=same(model.rootWheel,[x,y])?null:[x,y];return true;}
  // Rivals fight when they meet; linking two enemies again ends the feud.
  function toggleRival(model,a,b){if(a===b||!model.guards.some(g=>g.id===a)||!model.guards.some(g=>g.id===b))return false;model.rivalries=model.rivalries||[];
    const i=model.rivalries.findIndex(([p,q])=>p===a&&q===b||p===b&&q===a);if(i>=0)model.rivalries.splice(i,1);else model.rivalries.push([a,b]);return true;}
  // Removes whichever of these extras sits on a tile.
  function removeExtraAt(model,x,y){
    let hit=false;for(const k of Object.keys(LAYERS)){const n=(model[k]||[]).length;model[k]=(model[k]||[]).filter(p=>!same(p,[x,y]));hit=hit||model[k].length<n;}
    const inRect=a=>x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3];
    for(const [k,test] of [['pages',pg=>same(pg.at,[x,y])],['signs',q=>same(q.at,[x,y])],['props',q=>same(q.at,[x,y])],['checkpoints',q=>same(q,[x,y])],['crates',q=>same(q,[x,y])],['ropes',r=>same(r.from,[x,y])||same(r.to,[x,y])],['caps',c=>same(c.at,[x,y])||same(c.to,[x,y])],['seedCrossings',c=>[...c.banks,...c.tiles].some(p=>same(p,[x,y]))],['wind',z=>inRect(z.area)],['currents',z=>inRect(z.area)],['tunnels',t=>t.some(p=>same(p,[x,y]))],['echoes',a=>inRect(a)],['regions',r=>inRect(r.area)],['antTrails',t=>t.path.some(p=>same(p,[x,y]))]]){
      const n=(model[k]||[]).length;model[k]=(model[k]||[]).filter(v=>!test(v));if(model[k].length<n){hit=true;break;}}
    if(!hit&&same(model.rootWheel,[x,y])){model.rootWheel=null;hit=true;}
    if(!hit&&same(model.millWheel,[x,y])){model.millWheel=null;hit=true;}
    if(hit)prune(model);return hit;
  }
  // Pick up whatever stands on one tile and set it down on another: a creature, trigger, hazard,
  // Sally, the key, the hatch, a chest, or an extra (a cap, rope end, crate, sign, page, prop...).
  // Walls, floors and painted ground stay put. Returns false when nothing moves or the tile won't take it.
  function moveThing(model,from,to){
    const [fx,fy]=from,[tx,ty]=to,dest=at(model,tx,ty);if(dest===undefined||edge(model,tx,ty)||same(from,to))return false;
    const free=list=>!(list||[]).some(p=>same(p.at||p,to)),ground=walkable(dest)&&!doorAt(model,tx,ty);
    const g=guardAt(model,fx,fy);
    if(g){if(guardAt(model,tx,ty)||!(g.kind==='dragonfly'||g.kind==='cloudray'?dest!=='#':roamable(dest))||doorAt(model,tx,ty))return false;
      const [dx,dy]=[tx-fx,ty-fy];g.patrol=g.patrol.map(p=>same(p,from)?[tx,ty]:p);g.spawn=[tx,ty];
      if(g.lure){const l=[g.lure[0]+dx,g.lure[1]+dy];if(at(model,...l)!==undefined)g.lure=l;}return true;}
    const t=triggerAt(model,fx,fy);
    if(t){if(!['.','L','N','M'].includes(dest)||doorAt(model,tx,ty)||triggerAt(model,tx,ty)||hazardAt(model,tx,ty))return false;t.at=[tx,ty];return true;}
    const h=hazardAt(model,fx,fy);
    if(h){if(hazardAt(model,tx,ty)||doorAt(model,tx,ty))return false;
      if(h.type==='vent'){if(!solid(dest))return false;const dir=DIRS.findIndex(([dx,dy])=>walkable(at(model,tx+dx,ty+dy)));if(dir<0)return false;h.at=[tx,ty];if(!walkable(at(model,tx+DIRS[h.dir][0],ty+DIRS[h.dir][1])))h.dir=dir;return true;}
      if(!walkable(dest)||triggerAt(model,tx,ty))return false;
      if(h.type==='log'){const end=same(h.to,from)?'to':'at';h[end]=[tx,ty];if(h.to&&(same(h.at,h.to)||h.at[0]!==h.to[0]&&h.at[1]!==h.to[1]))h.to=null;return true;}
      h.at=[tx,ty];return true;}
    // Sally, the key, the hatch and chests are marks in the map; a chest keeps its links as it moves.
    const ch=at(model,fx,fy);
    if(['@','K','X'].includes(ch)||/[1-5]/.test(ch||'')){if(!['.','L','N','M','m','s','d'].includes(dest)||doorAt(model,tx,ty)||triggerAt(model,tx,ty)||guardAt(model,tx,ty))return false;
      model.map[fy]=replaceAt(model.map[fy],fx,'.');model.map[ty]=replaceAt(model.map[ty],tx,ch);
      if(/[1-5]/.test(ch)){const a='chest:'+fx+','+fy,b='chest:'+tx+','+ty;for(const l of model.links)if(l[0]===a)l[0]=b;if(model.messages?.[a]){model.messages[b]=model.messages[a];delete model.messages[a];}}
      return true;}
    // The extras: single points first, then things with two ends (whichever end was grabbed moves).
    for(const k of ['crates','checkpoints']){const list=model[k]||[],i=list.findIndex(p=>same(p,from));if(i>=0){if(!ground||!free(list)||k==='crates'&&['~','S','c'].includes(dest))return false;list[i]=[tx,ty];return true;}}
    for(const k of ['pages','signs','props']){const list=model[k]||[],i=list.findIndex(q=>same(q.at,from));if(i>=0){if(k!=='props'&&!ground||!free(list))return false;list[i].at=[tx,ty];return true;}}
    for(const c of model.caps||[])for(const end of ['at','to'])if(same(c[end],from)){if(!ground||(model.caps||[]).some(q=>same(q.at,to)||same(q.to,to)))return false;c[end]=[tx,ty];return true;}
    for(const r of model.ropes||[])for(const end of ['from','to'])if(same(r[end],from)){if(!ground||(model.ropes||[]).some(q=>same(q.from,to)||same(q.to,to)))return false;r[end]=[tx,ty];return true;}
    for(const tun of model.tunnels||[])for(let i=0;i<2;i++)if(same(tun[i],from)){if(!ground||dest==='~'||same(tun[1-i],to))return false;tun[i]=[tx,ty];return true;}
    for(const k of ['millWheel','rootWheel'])if(same(model[k],from)){if(k==='rootWheel'&&!ground)return false;model[k]=[tx,ty];return true;}
    return false;
  }
  // Per-enemy settings: where an angler's lure dangles, a crab's lane, a heron's looks, a bat's beat...
  function setGuard(model,id,changes){
    const g=model.guards.find(q=>q.id===id);if(!g)return false;
    if(changes.lure!==undefined)g.lure=changes.lure&&point(changes.lure,model.map[0].length,model.map.length);
    if(changes.axis!==undefined)g.axis=changes.axis==='y'?'y':changes.axis==='x'?'x':undefined;
    for(const [k,lo,hi] of [['range',0,12],['every',0,20],['speed',0,8],['offset',0,20]])if(changes[k]!==undefined)g[k]=changes[k]===null||changes[k]===''?undefined:clampNum(changes[k],lo,hi);
    if(changes.looks!==undefined)g.looks=Array.isArray(changes.looks)&&changes.looks.length?changes.looks.slice(0,4).map(Number).filter(Number.isFinite):undefined;
    if(changes.buried!==undefined)g.buried=Boolean(changes.buried)||undefined;
    // Its own cunning (empty follows the level's) and pace (1 is normal; slower or quicker on its feet).
    if(changes.cunning!==undefined){if(changes.cunning===null||changes.cunning==='')delete g.cunning;else g.cunning=clampInt(changes.cunning,0,3);}
    if(changes.pace!==undefined){const v=clampNum(changes.pace,.5,1.6,1);if(v===1)delete g.pace;else g.pace=v;}
    return true;
  }
  // Whole-level settings, the sky and the weather.
  function setSettings(model,changes){
    for(const k of ['tailDrop','gaze','dark','living','abyss','unlimited'])if(changes[k]!==undefined)model[k]=Boolean(changes[k]);
    for(const [k,lo,hi] of [['timeLimit',0,600],['camos',0,5],['seeds',0,5],['diggers',0,5],['glows',0,5],['spores',0,5],['sightRadius',0,12]])if(changes[k]!==undefined)model[k]=clampNum(changes[k],lo,hi,0);
    if(changes.cunning!==undefined)model.cunning=Math.round(clampNum(changes.cunning,0,3,2));
    if(changes.hint!==undefined)model.hint=String(changes.hint).slice(0,400);if(changes.biome!==undefined)model.biome=changes.biome==='desert'?'desert':'';
    if(changes.gentle!==undefined)model.gentle=changes.gentle===true?.6:Number(changes.gentle)>0?clampNum(changes.gentle,.3,1,.6):0;
    if(changes.foxWarn!==undefined)model.foxWarn=clampNum(changes.foxWarn,0,3,0);
    if(changes.look!==undefined)model.look=Object.prototype.hasOwnProperty.call(LOOKS,changes.look)?changes.look:'';
    for(const [k,fields] of [['hawk',['every','warn','first']],['storm',['every','warn','first']],['tide',['period','high','offset']]])
      if(changes[k]!==undefined)model[k]=changes[k]?Object.fromEntries(fields.map(f=>[f,clampNum(changes[k][f],0,120,f==='offset'?0:6)])):null;
    return true;
  }
  function setMessage(model,source,message,objective){model.messages=model.messages||{};if(!message&&!objective)delete model.messages[source];else model.messages[source]={message:String(message||'').slice(0,160),objective:String(objective||'').slice(0,100)};return true;}
  function setWind(model,i,changes){const z=(model.wind||[])[i];if(!z)return false;if(changes.dir!==undefined)z.dir=DIRS[clampInt(changes.dir,0,3)].slice();for(const [k,lo,hi] of [['period',1,30],['on',.2,30],['offset',0,30]])if(changes[k]!==undefined)z[k]=clampNum(changes[k],lo,hi);
    if(changes.strength!==undefined){const v=clampNum(changes.strength,.5,4,2.3);if(v===2.3)delete z.strength;else z.strength=v;}return true;}
  function setAnts(model,i,changes){const t=(model.antTrails||[])[i];if(!t)return false;for(const [k,lo,hi] of [['groups',1,8],['size',1,8],['speed',.3,4]])if(changes[k]!==undefined)t[k]=clampNum(changes[k],lo,hi);return true;}
  function setRegion(model,id,changes){const r=(model.regions||[]).find(q=>q.id===id);if(!r)return false;if(changes.requiresKey!==undefined)r.requiresKey=Boolean(changes.requiresKey);return true;}

  function find(model,ch){const out=[];model.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(c===ch)out.push([x,y]);}));return out;}
  // Doors and bridges count as passable here: the checks assume their triggers can open them.
  function reach(model,from){
    // A cracked wall counts when Sally has a burrow to dig through it, and a burrow pair joins its mounds.
    const passable=(x,y)=>walkable(at(model,x,y))||Boolean(doorAt(model,x,y))||model.burrows>0&&at(model,x,y)==='B';
    const seen=new Set([from.join()]),q=[from],step=n=>{if(!seen.has(n.join())&&passable(...n)){seen.add(n.join());q.push(n);}};
    while(q.length){const [x,y]=q.shift();for(const [dx,dy] of DIRS)step([x+dx,y+dy]);for(const t of model.tunnels||[])for(const [a,b] of [[t[0],t[1]],[t[1],t[0]]])if(same(a,[x,y]))step(b.slice());for(const c of model.caps||[])if(c.to&&same(c.at,[x,y])){const n=c.to.slice();if(!seen.has(n.join())){seen.add(n.join());q.push(n);}}}
    return seen;
  }
  function treasureTotal(model){return model.map.join('').split('').filter(c=>/[1-5]/.test(c)).reduce((n,c)=>n+Number(c),0);}
  const doorName=d=>(d.name||COLORS[d.color][0])+(d.bridge?' bridge':d.root?' roots':' door');
  // Plain-language problems that would stop the level from being fair to play.
  // A patrol crosses a tile when the tile is one of its points, or lies on a straight stretch
// between two points in turn (the last leads back to the first).
function patrolCrosses(patrol,at){
  return patrol.some((p,i)=>{const q=patrol[(i+1)%patrol.length];if(p[0]===at[0]&&p[1]===at[1])return true;
    return p[1]===q[1]&&p[1]===at[1]&&at[0]>=Math.min(p[0],q[0])&&at[0]<=Math.max(p[0],q[0])||p[0]===q[0]&&p[0]===at[0]&&at[1]>=Math.min(p[1],q[1])&&at[1]<=Math.max(p[1],q[1]);});
}
function validate(model){
    const problems=[],rows=model.map,w=rows[0]?.length||0;
    if(!w||rows.some(r=>r.length!==w))problems.push('Every row must be the same width.');
    for(const [ch,name] of [['@','Sally'],['K','the key'],['X','the hatch']]){const n=find(model,ch).length;if(n!==1)problems.push(n?'Place only one '+name+'.':'Place '+name+'.');}
    if(problems.length)return problems;
    rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(edge(model,x,y)&&!solid(c))problems.push('The outer edge must be wall.');}));
    const start=find(model,'@')[0],seen=reach(model,start),open=new Set(seen);
    // A tongue grab reaches three tiles in a straight line.
    if(model.tongues>0)for(const id of seen){const [x,y]=id.split(',').map(Number);for(const [dx,dy] of DIRS)for(let d=1;d<=3;d++){const c=at(model,x+dx*d,y+dy*d);if(c===undefined||solid(c)||c==='B')break;open.add((x+dx*d)+','+(y+dy*d));}}
    if(!open.has(find(model,'K')[0].join()))problems.push('Sally cannot reach the key.');
    for(const t of model.tunnels||[])if(t.some(([x,y])=>['#','B','_','~','S'].includes(rows[y]?.[x])))problems.push('A burrow mound must sit on open ground.');
    if(!seen.has(find(model,'X')[0].join()))problems.push('Sally cannot reach the hatch.');
    for(const pg of model.pages||[])if(!walkable(rows[pg.at[1]]?.[pg.at[0]]))problems.push('A page must lie on open floor.');
    const total=treasureTotal(model);if(model.requiredTreasure>total)problems.push('The hatch asks for more treasure than the level holds.');
    for(const g of model.guards){if(!['dragonfly','cloudray'].includes(g.kind)&&!roamable(at(model,...g.spawn)))problems.push(ENEMIES[g.kind]+' stands on a wall.');
      if(!g.sleep&&!(model.gentle>0)&&Math.hypot(g.spawn[0]-start[0],g.spawn[1]-start[1])<4)problems.push(ENEMIES[g.kind]+' starts too close to Sally.');
      if(g.sleep&&!linksTo(model,g.id).length)problems.push('A sleeping '+ENEMIES[g.kind].toLowerCase()+' has nothing to wake it: link the key, a chest or an area to it.');
      if(g.kind!=='dragonfly')for(const p of g.patrol)if(!seen.has(p.join())&&!seen.has(g.spawn.join()))problems.push(ENEMIES[g.kind]+' has a patrol point it cannot reach.');}
    for(const d of model.doors)if(d.mode!=='crumble'&&!linksTo(model,d.id).length)problems.push('The '+doorName(d).toLowerCase()+' has nothing linked to '+(d.mode==='shut'?'shut':'open')+' it.');
    for(const t of model.triggers){if(!linksFrom(model,t.id).length)problems.push('A '+TRIGGERS[t.type].toLowerCase()+' is not linked to anything.');
      if(t.type==='heavy'&&!model.guards.some(g=>g.kind==='beetle'&&!g.sleep&&patrolCrosses(g.patrol,t.at)))problems.push('A heavy plate needs a beetle whose rounds cross it.');}
    for(const h of model.hazards)if(h.type==='log'&&!h.to)problems.push('A rolling log needs an end: pick it with the Link tool, then click where it rolls to.');
    if((model.caps||[]).some(c=>!c.to))problems.push('A bounce cap needs a landing: click where it throws Sally.');
    if((model.antTrails||[]).some(t=>t.path.length<2))problems.push('An ant column needs at least two points to march between.');
    if((model.antTrails||[]).some(t=>t.path.length>1&&t.path.some((p,i)=>{const q=t.path[(i+1)%t.path.length];return p[0]!==q[0]&&p[1]!==q[1];})))problems.push('An ant column marches in straight lines: its last point must line up with its first, in the same row or column.');
    for(const g of model.guards)if(g.kind==='angler'&&!g.lure)problems.push('An angler needs its lure: select it and pick the tile where the lure dangles.');
    return [...new Set(problems)];
  }

  // The route the game plays: the same shape every rebuilt escape uses.
  function toRoute(model){
    const awake=model.guards.filter(g=>!g.sleep),asleep=model.guards.filter(g=>g.sleep);
    const guard=g=>{const out={id:g.id,kind:g.kind,spawn:g.spawn.slice(),facing:g.facing??Math.PI,patrol:(g.patrol.length?g.patrol:[g.spawn]).map(p=>p.slice())};
      if(g.lure)out.lure=g.lure.slice();if(g.axis)out.axis=g.axis;if(g.looks)out.looks=g.looks.slice();if(g.buried)out.buried=true;
      for(const k of ['range','every','speed','offset','cunning','pace'])if(g[k]!==undefined)out[k]=g[k];return out;};
    const triggersFor=(d,type)=>model.triggers.filter(t=>t.type===type&&linksTo(model,d.id).includes(t.id)).map(t=>t.at.slice());
    const gates=model.doors.map(d=>{const sw=triggersFor(d,'switch')[0];return {id:d.id,name:d.name||COLORS[d.color][0],color:d.rgb||COLORS[d.color][1],tiles:d.tiles.map(t=>t.slice()),...(d.bridge?{bridge:true}:{}),...(d.root?{root:true}:{}),
      ...(sw?{switch:sw}:{}),plates:triggersFor(d,'plate'),levers:triggersFor(d,'lever'),heavyPlates:triggersFor(d,'heavy'),
      ...(d.mode==='timed'?{duration:d.seconds}:d.mode==='once'?{duration:d.seconds,once:true}:d.mode==='stay'?{stay:true}:d.mode==='shut'?{shut:true,initialOpen:true}:{crumble:true,initialOpen:true})};});
    // One reaction per key, chest or area, in the order they were first linked.
    const triggerIds=new Set(model.triggers.map(t=>t.id)),sources=[];for(const s of [...model.links.map(l=>l[0]),...Object.keys(model.messages||{})])if(!triggerIds.has(s)&&!sources.includes(s))sources.push(s);
    const reactions=sources.map(source=>{
      const links=model.links.filter(l=>l[0]===source),doors=model.doors.filter(d=>links.some(l=>l[1]===d.id)),wake=asleep.filter(g=>links.some(l=>l[1]===g.id)),note=model.messages?.[source];
      if(!doors.length&&!wake.length&&!note)return null;
      const closes=d=>d.mode==='shut'||links.some(l=>l[1]===d.id&&l[2]==='close');
      const region=source.startsWith('enter:')&&(model.regions||[]).find(r=>'enter:'+r.id===source);
      const when=source==='key'?{when:'key'}:source.startsWith('chest:')?{when:'treasure',at:source.slice(6).split(',').map(Number)}:region?{when:'enter',region:region.area.slice(),...(region.requiresKey?{requiresKey:true}:{})}:null;
      if(!when)return null;
      return {id:'builder-'+source.replace(/[^a-z0-9]/g,'-'),...when,open:doors.filter(d=>!closes(d)).map(d=>d.id),close:doors.filter(closes).map(d=>d.id),spawn:wake.map(g=>g.id),
        message:note?.message||(wake.length?'Something stirs nearby.':'Somewhere, a passage changes.'),objective:note?.objective||'Find the hatch.'};}).filter(Boolean);
    const vents=[],thorns=[],logs=[];
    for(const h of model.hazards){const [presetPeriod,presetOn]=TIMING[h.type][h.speed]||TIMING[h.type].medium,exact=h.period!==undefined;
      const period=exact?h.period:presetPeriod,second=exact?h.on:presetOn,offset=exact?(h.delay||0):+(h.offset*period).toFixed(2);
      if(h.type==='vent')vents.push({at:h.at.slice(),dir:DIRS[h.dir].slice(),length:h.length,period,on:second,offset,...(h.warn?{warn:h.warn}:{})});
      else if(h.type==='thorns')thorns.push({tiles:[h.at.slice()],period,up:second,offset});
      else if(h.to)logs.push({from:h.at.slice(),to:h.to.slice(),period,offset,speed:second,...(h.warn?{warn:h.warn}:{}),...(h.skin?{skin:h.skin}:{})});}
    const some=(k,v)=>v&&(!Array.isArray(v)||v.length)?{[k]:v}:{};
    return {id:model.id,name:String(model.name||'My escape').slice(0,40),brief:String(model.brief||'').slice(0,140),hint:String(model.hint||''),map:model.map.slice(),
      guards:awake.map(guard),...(asleep.length?{reinforcements:asleep.map(guard)}:{}),
      ...(gates.length?{gates}:{}),...(reactions.length?{reactions}:{}),...(vents.length?{vents}:{}),...(thorns.length?{thorns}:{}),...(logs.length?{logs}:{}),
      ...(model.cold.length?{cold:model.cold.map(([x,y])=>[x,y,x,y])}:{}),...(model.warm.length?{warm:model.warm.map(p=>p.slice())}:{}),
      burrows:clampInt(model.burrows,0,5),pebbles:clampInt(model.pebbles,0,5),tongues:clampInt(model.tongues,0,5),explore:Boolean(model.explore),requiredTreasure:clampInt(model.requiredTreasure,0,99),
      ...(model.sightRadius?{sightRadius:model.sightRadius}:model.explore?{sightRadius:5}:{}),
      ...(model.tailDrop?{tailDrop:true}:{}),...(model.unlimited?{unlimited:true}:{}),...(model.timeLimit?{timeLimit:model.timeLimit}:{}),...(model.camos?{camos:model.camos}:{}),...(model.seeds?{seeds:model.seeds}:{}),...(model.diggers?{diggers:model.diggers}:{}),...(model.glows?{glows:model.glows}:{}),...(model.spores?{spores:model.spores}:{}),...(model.cunning!==undefined&&model.cunning!==2?{cunning:model.cunning}:{}),
      ...(model.gaze?{gaze:true}:{}),...(model.dark?{dark:true}:{}),...(model.living?{living:true}:{}),...(model.abyss?{abyss:true}:{}),...(model.biome?{biome:model.biome}:{}),
      ...some('hawk',model.hawk),...some('storm',model.storm),...some('tide',model.tide),...some('caps',(model.caps||[]).filter(c=>c.to)),...some('wind',model.wind),...some('echoes',model.echoes),...some('currents',model.currents),...some('tunnels',model.tunnels),
      ...some('antTrails',(model.antTrails||[]).filter(t=>t.path.length>1)),...some('seedCrossings',model.seedCrossings),...some('rootWheel',model.rootWheel),...some('rivalries',model.rivalries),
      ...some('shade',model.shade),...some('glowPlants',model.glowPlants),...some('regrowth',model.regrowth),...some('slippery',model.slippery),...some('thinIce',model.thinIce),...some('wet',model.wet),...some('shrubs',model.shrubs),
      ...(model.gentle>0?{gentle:model.gentle}:{}),...(model.foxWarn>0?{foxWarn:model.foxWarn}:{}),...(model.look?{look:model.look}:{}),
      ...some('checkpoints',(model.checkpoints||[]).map(p=>p.slice())),...some('crates',(model.crates||[]).map(p=>p.slice())),...some('ropes',(model.ropes||[]).filter(r=>r.to).map(r=>({...r,from:r.from.slice(),to:r.to.slice()}))),...some('props',(model.props||[]).map(q=>({at:q.at.slice(),kind:q.kind}))),...some('millWheel',model.millWheel),
      ...some('fieldNotes',(model.signs||[]).filter(q=>q.body).map((q,i)=>({id:(q.id||'sign-'+(i+1)),at:q.at.slice(),title:q.title,body:q.body}))),
      ...some('pages',(model.pages||[]).filter(pg=>pg.body).map(pg=>({at:pg.at.slice(),title:pg.title,body:pg.body,...(pg.author?{author:pg.author}:{}),...(pg.id?{id:pg.id}:{})})))};
  }
  // Any escape in the game as a builder model, so it can be edited. Nothing the game plays is lost:
  // toRoute(fromRoute(route)) plays the same escape.
  // A seasonal or Little Explorers escape edited in the workshop keeps what the builder doesn't
  // handle (its sticker, theme, place in its pack, revision...): every key of its source entry that
  // the builder's round trip leaves out stays as it was. Cunning is always written out, because the
  // builder leaves out its own default (2) and these packs default to 0.
  function mergeInto(source,game,route){
    const managed=new Set(Object.keys(toRoute(fromRoute(game)))),out={};
    for(const [k,v] of Object.entries(source||{}))if(!managed.has(k)&&k!=='id'&&k!=='cunning')out[k]=JSON.parse(JSON.stringify(v));
    const {id,custom,draft,...play}=route;return {...out,...play,cunning:play.cunning??2,id:source?.id??game.id};
  }
  function fromRoute(route){
    const m=blank(route.map[0].length,route.map.length);m.map=route.map.slice();m.id='custom-'+String(route.id||'escape').toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,40);
    Object.assign(m,{name:String(route.name||'').slice(0,40),brief:String(route.brief||'').slice(0,140),hint:String(route.hint||'').slice(0,400),burrows:route.burrows||0,pebbles:route.pebbles||0,tongues:route.tongues||0,
      explore:Boolean(route.explore),requiredTreasure:route.requiredTreasure||0,tailDrop:Boolean(route.tailDrop),unlimited:Boolean(route.unlimited),timeLimit:route.timeLimit||0,camos:route.camos||0,seeds:route.seeds||0,diggers:route.diggers||0,glows:route.glows||0,spores:route.spores||0,cunning:route.cunning??2,gaze:Boolean(route.gaze),
      sightRadius:route.sightRadius||0,dark:Boolean(route.dark),living:Boolean(route.living),abyss:Boolean(route.abyss),biome:route.biome||'',source:route.id});
    const copy=v=>v==null?null:JSON.parse(JSON.stringify(v));
    for(const k of ['hawk','storm','tide','rootWheel'])m[k]=copy(route[k]);
    for(const k of ['caps','wind','echoes','currents','tunnels','antTrails','seedCrossings','shade','glowPlants','regrowth','slippery','thinIce','wet','shrubs','pages'])m[k]=copy(route[k])||[];
    m.gentle=route.gentle>0?route.gentle:0;m.foxWarn=route.foxWarn||0;m.look=LOOKS[route.look]!==undefined?route.look:LOOKS[route.seasonalTheme]!==undefined?route.seasonalTheme:'';
    m.checkpoints=(copy(route.checkpoints)||[]).map(p=>Array.isArray(p)?p.slice(0,2):[p.x,p.y]);m.props=copy(route.props)||[];m.crates=(copy(route.crates)||[]).map(p=>p.slice(0,2));m.ropes=copy(route.ropes)||[];m.millWheel=copy(route.millWheel);
    m.signs=(route.fieldNotes||[]).map(q=>({at:q.at.slice(),title:q.title||'A sign',body:q.body||'',...(q.id?{id:q.id}:{})}));
    // An official escape brings its story page along, so it can be seen and moved while editing.
    if(!m.pages.length&&root.EscapeNotes){const n=root.EscapeNotes.NOTES.find(q=>q.levelId===route.id);if(n)m.pages=[{at:n.at.slice(),title:n.title,body:n.body,author:n.author,id:n.id}];}
    const ids={},guardOf=(g,sleep)=>{const id=newId(m,'e');if(g.id)ids[g.id]=id;const out={id,kind:g.kind||'snake',spawn:g.spawn.slice(),facing:g.facing??Math.PI,patrol:(g.patrol||[g.spawn]).map(p=>p.slice()),sleep};
      if(g.lure)out.lure=g.lure.slice();if(g.axis)out.axis=g.axis;if(g.looks)out.looks=g.looks.slice();if(g.buried)out.buried=true;for(const k of ['range','every','speed','offset','cunning','pace'])if(g[k]!==undefined)out[k]=g[k];return out;};
    m.guards=[...(route.guards||[]).map(g=>guardOf(g,false)),...(route.reinforcements||[]).map(g=>guardOf(g,true))];
    m.rivalries=(route.rivalries||[]).map(([a,b])=>[ids[a],ids[b]]).filter(([a,b])=>a&&b);
    const doorIds={};
    (route.gates||[]).forEach((gate,i)=>{
      const id=(gate.bridge?'b':'d')+i;doorIds[gate.id]=id;
      const mode=gate.duration?(gate.once?'once':'timed'):gate.crumble?'crumble':gate.shut||gate.initialOpen?'shut':'stay';
      m.doors.push({id,color:i,bridge:Boolean(gate.bridge),tiles:gate.tiles.map(t=>t.slice()),mode,seconds:gate.duration||5,...(gate.root?{root:true}:{}),name:gate.name,rgb:gate.color});
      const trig=(type,at)=>{let t=m.triggers.find(q=>same(q.at,at)&&q.type===type);if(!t){t={id:newId(m,'t'),type,at:at.slice()};m.triggers.push(t);}m.links.push([t.id,id]);};
      if(gate.switch)trig('switch',gate.switch);for(const p of gate.plates||[])trig(gate.heavy?'heavy':'plate',p);for(const p of gate.levers||[])trig('lever',p);for(const p of gate.heavyPlates||[])trig('heavy',p);
    });
    for(const r of route.reactions||[]){
      let source=r.when==='key'?'key':r.when==='treasure'?'chest:'+r.at.join(','):null;
      if(r.when==='enter'){const id='r'+(m.nextId=(m.nextId||1)+1);m.regions.push({id,area:r.region.slice(),requiresKey:Boolean(r.requiresKey)});source='enter:'+id;}
      if(!source)continue;
      for(const g of r.open||[])if(doorIds[g])m.links.push([source,doorIds[g]]);
      for(const g of r.close||[])if(doorIds[g]){const d=m.doors.find(q=>q.id===doorIds[g]);m.links.push(d.mode==='shut'?[source,d.id]:[source,d.id,'close']);}
      for(const g of r.spawn||[])if(ids[g])m.links.push([source,ids[g]]);
      m.messages[source]={message:String(r.message||'').slice(0,160),objective:String(r.objective||'').slice(0,100)};
    }
    m.hazards=[...(route.vents||[]).map(v=>({id:newId(m,'h'),type:'vent',at:v.at.slice(),dir:Math.max(0,DIRS.findIndex(([dx,dy])=>dx===v.dir[0]&&dy===v.dir[1])),length:v.length||3,speed:'medium',offset:0,period:v.period,on:v.on,delay:v.offset||0,...(v.warn?{warn:v.warn}:{})})),
      ...(route.thorns||[]).flatMap(t=>t.tiles.map(at=>({id:newId(m,'h'),type:'thorns',at:at.slice(),speed:'medium',offset:0,period:t.period,on:t.up,delay:t.offset||0}))),
      ...(route.logs||[]).map(l=>({id:newId(m,'h'),type:'log',at:l.from.slice(),to:l.to.slice(),speed:'medium',offset:0,period:l.period,on:l.speed,delay:l.offset||0,...(l.warn?{warn:l.warn}:{}),...(l.skin?{skin:l.skin}:{})}))];
    m.cold=(route.cold||[]).flatMap(([x1,y1,x2,y2])=>{const out=[];for(let y=y1;y<=(y2??y1);y++)for(let x=x1;x<=(x2??x1);x++)out.push([x,y]);return out;});
    m.warm=(route.warm||[]).map(p=>p.slice());
    return m;
  }

  // Share a level as one line of text; reading it back checks every field.
  const encode=text=>typeof btoa==='function'?btoa(unescape(encodeURIComponent(text))):Buffer.from(text,'utf8').toString('base64');
  const decode=text=>typeof atob==='function'?decodeURIComponent(escape(atob(text))):Buffer.from(text,'base64').toString('utf8');
  function exportText(model){return 'SALLY2:'+encode(JSON.stringify(sanitize(model)));}
  function importText(text){
    try{const raw=String(text).trim(),m=/^SALLY([12]):(.+)$/s.exec(raw);if(!m)return null;return sanitize(JSON.parse(decode(m[2])));}catch(_){return null;}
  }
  const point=(p,w,h)=>Array.isArray(p)&&Number.isFinite(Number(p[0]))&&Number.isFinite(Number(p[1]))?[clampInt(p[0],0,w-1),clampInt(p[1],0,h-1)]:null;
  const list=(v,n)=>Array.isArray(v)?v.slice(0,n):[];
  const safeId=(v,re)=>typeof v==='string'&&re.test(v)?v:null;
  // Checks every field of a saved, shared or published level (old version-1 levels included)
  // and returns a clean model, or null when it is not a Sally level.
  function sanitize(r){
    if(!r||!Array.isArray(r.map)||r.map.length<LIMITS.minH||r.map.length>LIMITS.maxH||!r.map.every(row=>typeof row==='string'&&row.length===r.map[0].length&&row.length>=LIMITS.minW&&row.length<=LIMITS.maxW&&/^[#.LNBM~_cTSotmdsI@KX1-5]+$/.test(row)))return null;
    const w=r.map[0].length,h=r.map.length,model={version:VERSION,id:safeId(r.id,/^custom-[a-z0-9-]{1,40}$/)||'custom-'+Date.now().toString(36),name:String(r.name||'Shared escape').slice(0,40),brief:String(r.brief||'').slice(0,140),author:String(r.author||'').slice(0,30),
      map:r.map.slice(),burrows:clampInt(r.burrows,0,5),pebbles:clampInt(r.pebbles,0,5),tongues:clampInt(r.tongues,0,5),explore:Boolean(r.explore),requiredTreasure:clampInt(r.requiredTreasure,0,99),nextId:clampInt(r.nextId,1,1e6)};
    let n=0;const fresh=prefix=>prefix+(1e6+(++n));
    model.guards=list(r.guards,LIMITS.guards).filter(g=>ENEMIES[g?.kind]&&point(g.spawn,w,h)).map(g=>{const out={id:safeId(g.id,/^e[0-9]{1,8}$/)||fresh('e'),kind:g.kind,spawn:point(g.spawn,w,h),facing:Number.isFinite(g.facing)?g.facing:Math.PI,
      patrol:list(g.patrol,6).map(p=>point(p,w,h)).filter(Boolean),sleep:Boolean(g.sleep)};
      if(point(g.lure,w,h))out.lure=point(g.lure,w,h);if(g.axis==='x'||g.axis==='y')out.axis=g.axis;if(g.buried)out.buried=true;
      if(Array.isArray(g.looks)&&g.looks.length)out.looks=g.looks.slice(0,4).map(Number).filter(Number.isFinite);
      for(const [k,lo,hi] of [['range',0,12],['every',0,20],['speed',0,8],['offset',0,20]])if(Number.isFinite(Number(g[k]))&&g[k]!==null&&g[k]!=='')out[k]=clampNum(g[k],lo,hi);
      if(Number.isFinite(g.cunning))out.cunning=clampInt(g.cunning,0,3);if(Number(g.pace)>0&&Number(g.pace)!==1)out.pace=clampNum(g.pace,.5,1.6,1);return out;});
    for(const g of model.guards)if(!g.patrol.length)g.patrol=[g.spawn.slice()];
    const seenDoor=new Set();
    model.doors=list(r.doors,LIMITS.doors*2).filter(d=>/^[db][0-5]$/.test(d?.id)&&!seenDoor.has(d.id)&&seenDoor.add(d.id)).map(d=>({id:d.id,color:Number(d.id[1]),bridge:d.id[0]==='b',tiles:list(d.tiles,60).map(p=>point(p,w,h)).filter(Boolean),
      mode:MODES[d.mode]&&(d.mode!=='crumble'||d.id[0]==='b')?d.mode:'timed',seconds:clampInt(d.seconds||5,1,30),...(d.root?{root:true}:{}),
      ...(typeof d.name==='string'&&d.name?{name:d.name.slice(0,30)}:{}),...(Array.isArray(d.rgb)&&d.rgb.length===3?{rgb:d.rgb.map(v=>clampInt(v,0,255))}:{})})).filter(d=>d.tiles.length);
    model.triggers=list(r.triggers,LIMITS.triggers).filter(t=>TRIGGERS[t?.type]&&point(t.at,w,h)&&safeId(t.id,/^t[0-9]{1,8}$/)).map(t=>({id:t.id,type:t.type,at:point(t.at,w,h)}));
    model.hazards=list(r.hazards,LIMITS.hazards).filter(z=>HAZARDS[z?.type]&&point(z.at,w,h)&&safeId(z.id,/^h[0-9]{1,8}$/)).map(z=>({id:z.id,type:z.type,at:point(z.at,w,h),speed:SPEEDS[z.speed]?z.speed:'medium',offset:z.offset?.5:0,...(Number(z.warn)>0?{warn:Math.min(10,Number(z.warn))}:{}),...(z.type==='log'&&z.skin==='snowball'?{skin:'snowball'}:{}),
      ...(z.type==='vent'?{dir:clampInt(z.dir,0,3),length:clampInt(z.length||3,1,8)}:{}),...(z.type==='log'?{to:point(z.to,w,h)}:{}),
      ...(Number.isFinite(Number(z.period))&&z.period!==null?{period:clampNum(z.period,.2,30),on:clampNum(z.on,0,30),delay:clampNum(z.delay,0,30,0)}:{})}));
    model.cold=list(r.cold,w*h).map(p=>point(p,w,h)).filter(Boolean);model.warm=list(r.warm,60).map(p=>point(p,w,h)).filter(Boolean);
    model.links=list(r.links,200).filter(l=>Array.isArray(l)&&typeof l[0]==='string'&&typeof l[1]==='string'&&l[0].length<20&&l[1].length<20).map(l=>l[2]==='close'?[l[0],l[1],'close']:[l[0],l[1]]);
    // The extras: settings, sky and weather, and the things placed on top of the map.
    const pts=(v,n)=>list(v,n).map(p=>point(p,w,h)).filter(Boolean),area=a=>{const p=point(a,w,h),q=point(Array.isArray(a)?a.slice(2):null,w,h);return p&&q?[Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[0],q[0]),Math.max(p[1],q[1])]:null;};
    Object.assign(model,EXTRAS());setSettings(model,{hint:r.hint||'',tailDrop:r.tailDrop,unlimited:r.unlimited,gaze:r.gaze,dark:r.dark,living:r.living,abyss:r.abyss,timeLimit:r.timeLimit||0,camos:r.camos||0,seeds:r.seeds||0,diggers:r.diggers||0,glows:r.glows||0,spores:r.spores||0,cunning:r.cunning??2,sightRadius:r.sightRadius||0,biome:r.biome||'',
      hawk:r.hawk||null,storm:r.storm||null,tide:r.tide||null});
    for(const k of Object.keys(LAYERS))model[k]=pts(r[k],120);
    model.caps=list(r.caps,12).map(c=>({at:point(c?.at,w,h),to:point(c?.to,w,h),...(Number(c?.spring)>0?{spring:clampInt(c.spring,1,3)}:{})})).filter(c=>c.at);
    model.wind=list(r.wind,12).map(z=>({area:area(z?.area),dir:DIRS.find(([dx,dy])=>dx===z?.dir?.[0]&&dy===z?.dir?.[1])?.slice()||[1,0],period:clampNum(z?.period,1,30,5),on:clampNum(z?.on,.2,30,1.6),offset:clampNum(z?.offset,0,30,0),...(Number(z?.strength)>0&&Number(z.strength)!==2.3?{strength:clampNum(z.strength,.5,4,2.3)}:{})})).filter(z=>z.area);
    model.echoes=list(r.echoes,8).map(area).filter(Boolean);
    model.currents=list(r.currents,12).map(z=>({area:area(z?.area),dir:DIRS.find(([dx,dy])=>dx===z?.dir?.[0]&&dy===z?.dir?.[1])?.slice()||[1,0],speed:clampNum(z?.speed,.4,3,1.2),...(z?.surface==='ground'?{surface:'ground'}:{}),...(z?.surface!=='ground'&&Number(z?.pulse)>0?{pulse:clampNum(z.pulse,2,20,6),...(Number(z.phase)>0?{phase:clampNum(z.phase,0,.99,0)}:{})}:{})})).filter(z=>z.area);
    model.tunnels=list(r.tunnels,6).map(t=>Array.isArray(t)?[point(t[0],w,h),point(t[1],w,h)]:[]).filter(t=>t[0]&&t[1]);
    model.antTrails=list(r.antTrails,6).map(t=>({path:pts(t?.path,16),groups:clampNum(t?.groups,1,8,3),size:clampNum(t?.size,1,8,3),speed:clampNum(t?.speed,.3,4,1.5)})).filter(t=>t.path.length);
    model.seedCrossings=list(r.seedCrossings,8).map(c=>({id:safeId(c?.id,/^[a-z0-9-]{1,30}$/)||fresh('seed-'),banks:pts(c?.banks,4),tiles:pts(c?.tiles,12)})).filter(c=>c.banks.length&&c.tiles.length);
    model.rootWheel=point(r.rootWheel,w,h);
    model.gentle=Number(r.gentle)>0?clampNum(r.gentle,.3,1,.6):0;model.foxWarn=clampNum(r.foxWarn,0,3,0);model.look=typeof r.look==='string'&&Object.prototype.hasOwnProperty.call(LOOKS,r.look)?r.look:'';
    model.checkpoints=pts(r.checkpoints,6);model.crates=pts(r.crates,24);model.ropes=list(r.ropes,8).map(q=>({from:point(q?.from,w,h),to:point(q?.to,w,h),period:clampNum(q?.period,2,12,4),...(Number(q?.phase)>0?{phase:clampNum(q.phase,0,.99,0)}:{})})).filter(q=>q.from&&q.to);model.props=list(r.props,40).map(q=>({at:point(q?.at,w,h),kind:q?.kind})).filter(q=>q.at&&PROPS[q.kind]);model.millWheel=point(r.millWheel,w,h);
    model.signs=list(r.signs,4).map(q=>({at:point(q?.at,w,h),title:cleanText(q?.title,40)||'A sign',body:cleanText(q?.body,320),...(typeof q?.id==='string'&&/^[a-z0-9-]{1,40}$/.test(q.id)?{id:q.id}:{})})).filter(q=>q.at);
    model.pages=list(r.pages,PAGE_LIMIT).map(pg=>({at:point(pg?.at,w,h),title:cleanText(pg?.title,40)||'A note',body:cleanText(pg?.body,320),author:cleanText(pg?.author,30),...(typeof pg?.id==='string'&&/^level-note:[a-z]+:[12]$/.test(pg.id)?{id:pg.id}:{})})).filter(pg=>pg.at);
    model.regions=list(r.regions,12).map(q=>({id:safeId(q?.id,/^r[0-9]{1,8}$/),area:area(q?.area),requiresKey:Boolean(q?.requiresKey)})).filter(q=>q.id&&q.area);
    model.rivalries=list(r.rivalries,12).filter(p=>Array.isArray(p)&&typeof p[0]==='string'&&typeof p[1]==='string').map(p=>[p[0],p[1]]);
    if(r.messages&&typeof r.messages==='object')for(const [k,v] of Object.entries(r.messages).slice(0,40))if(typeof k==='string'&&k.length<20&&v)setMessage(model,k,v.message,v.objective);
    if(typeof r.source==='string'&&/^[a-z0-9-]{1,40}$/.test(r.source))model.source=r.source;
    prune(model);return model;
  }

  // Saved levels live in this browser only.
  function loadAll(storage){try{const saved=JSON.parse(storage?.getItem(KEY)||'[]');return Array.isArray(saved)?saved.map(sanitize).filter(Boolean):[];}catch(_){return [];}}
  function saveOne(storage,model){const saved=loadAll(storage).filter(l=>l.id!==model.id);saved.unshift(sanitize(model));try{storage?.setItem(KEY,JSON.stringify(saved.slice(0,50)));return true;}catch(_){return false;}}
  function removeOne(storage,id){const saved=loadAll(storage).filter(l=>l.id!==id);try{storage?.setItem(KEY,JSON.stringify(saved));return true;}catch(_){return false;}}

  const api={TILES,MARKS,ENEMIES,POSTED,LIMITS,COLORS,MODES,TRIGGERS,HAZARDS,SPEEDS,blank,paint,resize,addEnemy,removeEnemy,turnEnemy,addPatrol,clearPatrol,setSleep,
    paintDoor,removeDoorTile,setDoor,addTrigger,removeAt,toggleLink,linksFrom,linksTo,sourceAt,doorAt,triggerAt,hazardAt,guardAt,addHazard,setLogEnd,setHazard,paintClimate,doorName,
    validate,toRoute,fromRoute,mergeInto,treasureTotal,exportText,importText,sanitize,loadAll,saveOne,removeOne,
    LOOKS,PROPS,toggleCheckpoint,toggleCrate,addSign,setSign,signAt,toggleProp,setMillWheel,LAYERS,DIRS,toggleLayer,addPage,setPage,pageAt,PAGE_LIMIT,addCap,setCap,setCapEnd,addRope,setRopeEnd,setRope,addWind,setWind,addEcho,addCurrent,setCurrent,addTunnel,addRegion,setRegion,addAntPoint,setAnts,addSeedCrossing,setRootWheel,toggleRival,removeExtraAt,moveThing,setGuard,setSettings,setMessage,setLinkAction,regionAt};
  root.EscapeBuilder=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

