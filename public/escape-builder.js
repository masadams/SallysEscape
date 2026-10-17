// The level builder's model: a text map plus enemies, doors, triggers, hazards and a few
// settings. Everything here is plain data, so it is easy to test, save in the browser, share as
// text, and publish to the community shelf. toRoute turns it into the route the game plays, and
// fromRoute turns any escape in the game back into a model, so every escape can be edited.
(function(root){
  const KEY='sally-escape-custom-v1',VERSION=3;
  const TILES={'#':'Wall','.':'Floor','L':'Leaves','N':'Gravel','B':'Cracked wall','M':'Mud','~':'Water','_':'Gap','c':'Crumbling floor','T':'Tangle vine','S':'Crack (Sally only)','o':'Spore puffball','t':'Tide flat'};
  const MARKS={'@':'Sally','K':'Key','X':'Hatch','1':'Treasure 1','2':'Treasure 2','3':'Chest 3'};
  const ENEMIES={snake:'Snake',beetle:'Beetle',scorpion:'Scorpion',toad:'Toad',spider:'Spider',cricket:'Cricket',moth:'Moth',mimic:'Mimic',millipede:'Millipede',cobra:'King cobra',flytrap:'Flytrap',crab:'Hermit crab',fox:'Snow fox',heron:'Bog heron',mantis:'Praying mantis',wasp:'Wasp nest',dragonfly:'Dragonfly',mole:'Mole',bat:'Echo bat',eel:'Eel',angler:'Angler',fish:'Reef fish','sea-snake':'Sea snake',owl:'Owl',gecko:'Gecko'};
  // Enemies that stay on their post; the rest walk their patrol.
  const POSTED=new Set(['scorpion','toad','mimic','millipede','cobra','flytrap','crab','heron','mantis','wasp','eel','angler','gecko']);
  const LIMITS={minW:11,maxW:45,minH:9,maxH:29,doors:6,triggers:24,hazards:40,guards:30};
  // Doors and bridges come in six colours; each colour is one door and one bridge.
  const COLORS=[['Red',[226,96,96]],['Blue',[96,150,236]],['Gold',[240,196,80]],['Green',[110,200,120]],['Violet',[178,120,230]],['Teal',[80,200,196]]];
  // How a door or bridge behaves when one of its triggers fires.
  const MODES={timed:'Opens for a few seconds',stay:'Opens and stays open',once:'Opens once for a few seconds, then is gone',shut:'Starts open, slams shut for good',crumble:'Starts open, crumbles after Sally crosses (bridge)'};
  const TRIGGERS={plate:'Plate',heavy:'Heavy plate (beetle)',lever:'Lever',switch:'Switch'};
  const HAZARDS={vent:'Steam vent',thorns:'Thorns',log:'Rolling log'};
  const SPEEDS={slow:'Slow',medium:'Medium',fast:'Fast'};
  const TIMING={vent:{slow:[5.2,1.6],medium:[4.2,1.5],fast:[3.2,1.2]},thorns:{slow:[3.2,1.4],medium:[2.6,1.2],fast:[2,1]},log:{slow:[6,5],medium:[4.5,7],fast:[3.5,9]}};
  const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  const solid=ch=>ch==='#';
  const walkable=ch=>ch!==undefined&&!['#','_','B'].includes(ch);
  // Creatures cannot squeeze through a crack; only Sally can.
  const roamable=ch=>walkable(ch)&&ch!=='S';
  const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
  const clampInt=(n,a,b)=>Math.max(a,Math.min(b,Math.round(Number(n)||0)));
  const clampNum=(n,a,b,d=a)=>Number.isFinite(Number(n))?Math.max(a,Math.min(b,Number(n))):d;
  // Whole-level extras the game supports beyond the map: the sky, the weather, and what lives there.
  const LAYERS={shade:'Awning (shade from the hawk)',glowPlants:'Glow plant (light in the dark)',regrowth:'Regrowth bug (grows back a lost tail)'};
  const EXTRAS=()=>({hint:'',tailDrop:false,timeLimit:0,camos:0,seeds:0,glows:0,gaze:false,sightRadius:0,dark:false,living:false,abyss:false,biome:'',
    hawk:null,storm:null,tide:null,caps:[],wind:[],antTrails:[],seedCrossings:[],rootWheel:null,rivalries:[],shade:[],glowPlants:[],regrowth:[],regions:[],messages:{}});

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
    keep.wind=(model.wind||[]).filter(z=>inside([z.area[2],z.area[3]]));keep.regions=(model.regions||[]).filter(r=>inside([r.area[2],r.area[3]]));
    keep.seedCrossings=(model.seedCrossings||[]).filter(c=>[...c.banks,...c.tiles].every(inside));keep.rootWheel=model.rootWheel&&inside(model.rootWheel)?model.rootWheel:null;
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
    for(const k of ['period','on','delay'])if(changes[k]!==undefined)h[k]=changes[k]===null?undefined:clampNum(changes[k],0,30);return true;}
  // Cold ground chills Sally; warm stones thaw her.
  function paintClimate(model,kind,x,y){
    if(!walkable(at(model,x,y)))return false;const spots=kind==='warm'?model.warm:model.cold;
    if(spots.some(p=>same(p,[x,y]))||kind==='warm'&&spots.length>=60)return false;spots.push([x,y]);return true;
  }

  // Tile layers: awnings, glow plants, regrowth bugs. Painting a marked tile again clears it.
  function toggleLayer(model,layer,x,y){
    if(!LAYERS[layer]||!walkable(at(model,x,y)))return false;model[layer]=model[layer]||[];
    const i=model[layer].findIndex(p=>same(p,[x,y]));if(i>=0)model[layer].splice(i,1);else{if(model[layer].length>=120)return false;model[layer].push([x,y]);}return true;
  }
  // A bounce cap flings Sally from one tile to another; click the cap, then where it lands.
  function addCap(model,x,y){if(!walkable(at(model,x,y))||(model.caps||[]).some(c=>same(c.at,[x,y]))||(model.caps||[]).length>=12)return false;model.caps=model.caps||[];model.caps.push({at:[x,y],to:null});return true;}
  function setCapEnd(model,x,y){const c=(model.caps||[]).find(c=>!c.to);if(!c||!walkable(at(model,x,y))||same(c.at,[x,y]))return false;c.to=[x,y];return true;}
  // Wind lanes, trigger areas: a rectangle dragged between two corners.
  const rect=(x1,y1,x2,y2)=>[Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2)];
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
  function setRootWheel(model,x,y){if(!walkable(at(model,x,y)))return false;model.rootWheel=same(model.rootWheel,[x,y])?null:[x,y];return true;}
  // Rivals fight when they meet; linking two enemies again ends the feud.
  function toggleRival(model,a,b){if(a===b||!model.guards.some(g=>g.id===a)||!model.guards.some(g=>g.id===b))return false;model.rivalries=model.rivalries||[];
    const i=model.rivalries.findIndex(([p,q])=>p===a&&q===b||p===b&&q===a);if(i>=0)model.rivalries.splice(i,1);else model.rivalries.push([a,b]);return true;}
  // Removes whichever of these extras sits on a tile.
  function removeExtraAt(model,x,y){
    let hit=false;for(const k of Object.keys(LAYERS)){const n=(model[k]||[]).length;model[k]=(model[k]||[]).filter(p=>!same(p,[x,y]));hit=hit||model[k].length<n;}
    const inRect=a=>x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3];
    for(const [k,test] of [['caps',c=>same(c.at,[x,y])||same(c.to,[x,y])],['seedCrossings',c=>[...c.banks,...c.tiles].some(p=>same(p,[x,y]))],['wind',z=>inRect(z.area)],['regions',r=>inRect(r.area)],['antTrails',t=>t.path.some(p=>same(p,[x,y]))]]){
      const n=(model[k]||[]).length;model[k]=(model[k]||[]).filter(v=>!test(v));if(model[k].length<n){hit=true;break;}}
    if(!hit&&same(model.rootWheel,[x,y])){model.rootWheel=null;hit=true;}
    if(hit)prune(model);return hit;
  }
  // Per-enemy settings: where an angler's lure dangles, a crab's lane, a heron's looks, a bat's beat...
  function setGuard(model,id,changes){
    const g=model.guards.find(q=>q.id===id);if(!g)return false;
    if(changes.lure!==undefined)g.lure=changes.lure&&point(changes.lure,model.map[0].length,model.map.length);
    if(changes.axis!==undefined)g.axis=changes.axis==='y'?'y':changes.axis==='x'?'x':undefined;
    for(const [k,lo,hi] of [['range',0,12],['every',0,20],['speed',0,8],['offset',0,20]])if(changes[k]!==undefined)g[k]=changes[k]===null||changes[k]===''?undefined:clampNum(changes[k],lo,hi);
    if(changes.looks!==undefined)g.looks=Array.isArray(changes.looks)&&changes.looks.length?changes.looks.slice(0,4).map(Number).filter(Number.isFinite):undefined;
    if(changes.buried!==undefined)g.buried=Boolean(changes.buried)||undefined;return true;
  }
  // Whole-level settings, the sky and the weather.
  function setSettings(model,changes){
    for(const k of ['tailDrop','gaze','dark','living','abyss'])if(changes[k]!==undefined)model[k]=Boolean(changes[k]);
    for(const [k,lo,hi] of [['timeLimit',0,600],['camos',0,5],['seeds',0,5],['glows',0,5],['sightRadius',0,12]])if(changes[k]!==undefined)model[k]=clampNum(changes[k],lo,hi,0);
    if(changes.hint!==undefined)model.hint=String(changes.hint).slice(0,400);if(changes.biome!==undefined)model.biome=changes.biome==='desert'?'desert':'';
    for(const [k,fields] of [['hawk',['every','warn','first']],['storm',['every','warn','first']],['tide',['period','high','offset']]])
      if(changes[k]!==undefined)model[k]=changes[k]?Object.fromEntries(fields.map(f=>[f,clampNum(changes[k][f],0,120,f==='offset'?0:6)])):null;
    return true;
  }
  function setMessage(model,source,message,objective){model.messages=model.messages||{};if(!message&&!objective)delete model.messages[source];else model.messages[source]={message:String(message||'').slice(0,160),objective:String(objective||'').slice(0,100)};return true;}
  function setWind(model,i,changes){const z=(model.wind||[])[i];if(!z)return false;if(changes.dir)z.dir=DIRS[clampInt(changes.dir,0,3)].slice();for(const [k,lo,hi] of [['period',1,30],['on',.2,30],['offset',0,30]])if(changes[k]!==undefined)z[k]=clampNum(changes[k],lo,hi);return true;}
  function setAnts(model,i,changes){const t=(model.antTrails||[])[i];if(!t)return false;for(const [k,lo,hi] of [['groups',1,8],['size',1,8],['speed',.3,4]])if(changes[k]!==undefined)t[k]=clampNum(changes[k],lo,hi);return true;}
  function setRegion(model,id,changes){const r=(model.regions||[]).find(q=>q.id===id);if(!r)return false;if(changes.requiresKey!==undefined)r.requiresKey=Boolean(changes.requiresKey);return true;}

  function find(model,ch){const out=[];model.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(c===ch)out.push([x,y]);}));return out;}
  // Doors and bridges count as passable here: the checks assume their triggers can open them.
  function reach(model,from){
    const passable=(x,y)=>walkable(at(model,x,y))||Boolean(doorAt(model,x,y));
    const seen=new Set([from.join()]),q=[from];
    while(q.length){const [x,y]=q.shift();for(const [dx,dy] of DIRS){const n=[x+dx,y+dy];if(!seen.has(n.join())&&passable(...n)){seen.add(n.join());q.push(n);}}}
    return seen;
  }
  function treasureTotal(model){return model.map.join('').split('').filter(c=>/[1-5]/.test(c)).reduce((n,c)=>n+Number(c),0);}
  const doorName=d=>(d.name||COLORS[d.color][0])+(d.bridge?' bridge':d.root?' roots':' door');
  // Plain-language problems that would stop the level from being fair to play.
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
    if(!seen.has(find(model,'X')[0].join()))problems.push('Sally cannot reach the hatch.');
    const total=treasureTotal(model);if(model.requiredTreasure>total)problems.push('The hatch asks for more treasure than the level holds.');
    for(const g of model.guards){if(!roamable(at(model,...g.spawn)))problems.push(ENEMIES[g.kind]+' stands on a wall.');
      if(!g.sleep&&Math.hypot(g.spawn[0]-start[0],g.spawn[1]-start[1])<4)problems.push(ENEMIES[g.kind]+' starts too close to Sally.');
      if(g.sleep&&!linksTo(model,g.id).length)problems.push('A sleeping '+ENEMIES[g.kind].toLowerCase()+' has nothing to wake it: link the key, a chest or an area to it.');
      if(g.kind!=='dragonfly')for(const p of g.patrol)if(!seen.has(p.join())&&!seen.has(g.spawn.join()))problems.push(ENEMIES[g.kind]+' has a patrol point it cannot reach.');}
    for(const d of model.doors)if(d.mode!=='crumble'&&!linksTo(model,d.id).length)problems.push('The '+doorName(d).toLowerCase()+' has nothing linked to '+(d.mode==='shut'?'shut':'open')+' it.');
    for(const t of model.triggers){if(!linksFrom(model,t.id).length)problems.push('A '+TRIGGERS[t.type].toLowerCase()+' is not linked to anything.');
      if(t.type==='heavy'&&!model.guards.some(g=>g.kind==='beetle'&&!g.sleep&&g.patrol.some(p=>same(p,t.at))))problems.push('A heavy plate needs a beetle with a patrol point on it.');}
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
      for(const k of ['range','every','speed','offset'])if(g[k]!==undefined)out[k]=g[k];return out;};
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
      if(h.type==='vent')vents.push({at:h.at.slice(),dir:DIRS[h.dir].slice(),length:h.length,period,on:second,offset});
      else if(h.type==='thorns')thorns.push({tiles:[h.at.slice()],period,up:second,offset});
      else if(h.to)logs.push({from:h.at.slice(),to:h.to.slice(),period,offset,speed:second});}
    const some=(k,v)=>v&&(!Array.isArray(v)||v.length)?{[k]:v}:{};
    return {id:model.id,name:String(model.name||'My escape').slice(0,40),brief:String(model.brief||'').slice(0,140),hint:String(model.hint||''),map:model.map.slice(),
      guards:awake.map(guard),...(asleep.length?{reinforcements:asleep.map(guard)}:{}),
      ...(gates.length?{gates}:{}),...(reactions.length?{reactions}:{}),...(vents.length?{vents}:{}),...(thorns.length?{thorns}:{}),...(logs.length?{logs}:{}),
      ...(model.cold.length?{cold:model.cold.map(([x,y])=>[x,y,x,y])}:{}),...(model.warm.length?{warm:model.warm.map(p=>p.slice())}:{}),
      burrows:clampInt(model.burrows,0,5),pebbles:clampInt(model.pebbles,0,5),tongues:clampInt(model.tongues,0,5),explore:Boolean(model.explore),requiredTreasure:clampInt(model.requiredTreasure,0,99),
      ...(model.sightRadius?{sightRadius:model.sightRadius}:model.explore?{sightRadius:5}:{}),
      ...(model.tailDrop?{tailDrop:true}:{}),...(model.timeLimit?{timeLimit:model.timeLimit}:{}),...(model.camos?{camos:model.camos}:{}),...(model.seeds?{seeds:model.seeds}:{}),...(model.glows?{glows:model.glows}:{}),
      ...(model.gaze?{gaze:true}:{}),...(model.dark?{dark:true}:{}),...(model.living?{living:true}:{}),...(model.abyss?{abyss:true}:{}),...(model.biome?{biome:model.biome}:{}),
      ...some('hawk',model.hawk),...some('storm',model.storm),...some('tide',model.tide),...some('caps',(model.caps||[]).filter(c=>c.to)),...some('wind',model.wind),
      ...some('antTrails',(model.antTrails||[]).filter(t=>t.path.length>1)),...some('seedCrossings',model.seedCrossings),...some('rootWheel',model.rootWheel),...some('rivalries',model.rivalries),
      ...some('shade',model.shade),...some('glowPlants',model.glowPlants),...some('regrowth',model.regrowth)};
  }
  // Any escape in the game as a builder model, so it can be edited. Nothing the game plays is lost:
  // toRoute(fromRoute(route)) plays the same escape.
  function fromRoute(route){
    const m=blank(route.map[0].length,route.map.length);m.map=route.map.slice();m.id='custom-'+String(route.id||'escape').toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,40);
    Object.assign(m,{name:String(route.name||'').slice(0,40),brief:String(route.brief||'').slice(0,140),hint:String(route.hint||'').slice(0,400),burrows:route.burrows||0,pebbles:route.pebbles||0,tongues:route.tongues||0,
      explore:Boolean(route.explore),requiredTreasure:route.requiredTreasure||0,tailDrop:Boolean(route.tailDrop),timeLimit:route.timeLimit||0,camos:route.camos||0,seeds:route.seeds||0,glows:route.glows||0,gaze:Boolean(route.gaze),
      sightRadius:route.sightRadius||0,dark:Boolean(route.dark),living:Boolean(route.living),abyss:Boolean(route.abyss),biome:route.biome||'',source:route.id});
    const copy=v=>v==null?null:JSON.parse(JSON.stringify(v));
    for(const k of ['hawk','storm','tide','rootWheel'])m[k]=copy(route[k]);
    for(const k of ['caps','wind','antTrails','seedCrossings','shade','glowPlants','regrowth'])m[k]=copy(route[k])||[];
    const ids={},guardOf=(g,sleep)=>{const id=newId(m,'e');if(g.id)ids[g.id]=id;const out={id,kind:g.kind||'snake',spawn:g.spawn.slice(),facing:g.facing??Math.PI,patrol:(g.patrol||[g.spawn]).map(p=>p.slice()),sleep};
      if(g.lure)out.lure=g.lure.slice();if(g.axis)out.axis=g.axis;if(g.looks)out.looks=g.looks.slice();if(g.buried)out.buried=true;for(const k of ['range','every','speed','offset'])if(g[k]!==undefined)out[k]=g[k];return out;};
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
    m.hazards=[...(route.vents||[]).map(v=>({id:newId(m,'h'),type:'vent',at:v.at.slice(),dir:Math.max(0,DIRS.findIndex(([dx,dy])=>dx===v.dir[0]&&dy===v.dir[1])),length:v.length||3,speed:'medium',offset:0,period:v.period,on:v.on,delay:v.offset||0})),
      ...(route.thorns||[]).flatMap(t=>t.tiles.map(at=>({id:newId(m,'h'),type:'thorns',at:at.slice(),speed:'medium',offset:0,period:t.period,on:t.up,delay:t.offset||0}))),
      ...(route.logs||[]).map(l=>({id:newId(m,'h'),type:'log',at:l.from.slice(),to:l.to.slice(),speed:'medium',offset:0,period:l.period,on:l.speed,delay:l.offset||0}))];
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
    if(!r||!Array.isArray(r.map)||r.map.length<LIMITS.minH||r.map.length>LIMITS.maxH||!r.map.every(row=>typeof row==='string'&&row.length===r.map[0].length&&row.length>=LIMITS.minW&&row.length<=LIMITS.maxW&&/^[#.LNBM~_cTSot@KX1-5]+$/.test(row)))return null;
    const w=r.map[0].length,h=r.map.length,model={version:VERSION,id:safeId(r.id,/^custom-[a-z0-9-]{1,40}$/)||'custom-'+Date.now().toString(36),name:String(r.name||'Shared escape').slice(0,40),brief:String(r.brief||'').slice(0,140),author:String(r.author||'').slice(0,30),
      map:r.map.slice(),burrows:clampInt(r.burrows,0,5),pebbles:clampInt(r.pebbles,0,5),tongues:clampInt(r.tongues,0,5),explore:Boolean(r.explore),requiredTreasure:clampInt(r.requiredTreasure,0,99),nextId:clampInt(r.nextId,1,1e6)};
    let n=0;const fresh=prefix=>prefix+(1e6+(++n));
    model.guards=list(r.guards,LIMITS.guards).filter(g=>ENEMIES[g?.kind]&&point(g.spawn,w,h)).map(g=>{const out={id:safeId(g.id,/^e[0-9]{1,8}$/)||fresh('e'),kind:g.kind,spawn:point(g.spawn,w,h),facing:Number.isFinite(g.facing)?g.facing:Math.PI,
      patrol:list(g.patrol,6).map(p=>point(p,w,h)).filter(Boolean),sleep:Boolean(g.sleep)};
      if(point(g.lure,w,h))out.lure=point(g.lure,w,h);if(g.axis==='x'||g.axis==='y')out.axis=g.axis;if(g.buried)out.buried=true;
      if(Array.isArray(g.looks)&&g.looks.length)out.looks=g.looks.slice(0,4).map(Number).filter(Number.isFinite);
      for(const [k,lo,hi] of [['range',0,12],['every',0,20],['speed',0,8],['offset',0,20]])if(Number.isFinite(Number(g[k]))&&g[k]!==null&&g[k]!=='')out[k]=clampNum(g[k],lo,hi);return out;});
    for(const g of model.guards)if(!g.patrol.length)g.patrol=[g.spawn.slice()];
    const seenDoor=new Set();
    model.doors=list(r.doors,LIMITS.doors*2).filter(d=>/^[db][0-5]$/.test(d?.id)&&!seenDoor.has(d.id)&&seenDoor.add(d.id)).map(d=>({id:d.id,color:Number(d.id[1]),bridge:d.id[0]==='b',tiles:list(d.tiles,60).map(p=>point(p,w,h)).filter(Boolean),
      mode:MODES[d.mode]&&(d.mode!=='crumble'||d.id[0]==='b')?d.mode:'timed',seconds:clampInt(d.seconds||5,1,30),...(d.root?{root:true}:{}),
      ...(typeof d.name==='string'&&d.name?{name:d.name.slice(0,30)}:{}),...(Array.isArray(d.rgb)&&d.rgb.length===3?{rgb:d.rgb.map(v=>clampInt(v,0,255))}:{})})).filter(d=>d.tiles.length);
    model.triggers=list(r.triggers,LIMITS.triggers).filter(t=>TRIGGERS[t?.type]&&point(t.at,w,h)&&safeId(t.id,/^t[0-9]{1,8}$/)).map(t=>({id:t.id,type:t.type,at:point(t.at,w,h)}));
    model.hazards=list(r.hazards,LIMITS.hazards).filter(z=>HAZARDS[z?.type]&&point(z.at,w,h)&&safeId(z.id,/^h[0-9]{1,8}$/)).map(z=>({id:z.id,type:z.type,at:point(z.at,w,h),speed:SPEEDS[z.speed]?z.speed:'medium',offset:z.offset?.5:0,
      ...(z.type==='vent'?{dir:clampInt(z.dir,0,3),length:clampInt(z.length||3,1,8)}:{}),...(z.type==='log'?{to:point(z.to,w,h)}:{}),
      ...(Number.isFinite(Number(z.period))&&z.period!==null?{period:clampNum(z.period,.2,30),on:clampNum(z.on,0,30),delay:clampNum(z.delay,0,30,0)}:{})}));
    model.cold=list(r.cold,w*h).map(p=>point(p,w,h)).filter(Boolean);model.warm=list(r.warm,60).map(p=>point(p,w,h)).filter(Boolean);
    model.links=list(r.links,200).filter(l=>Array.isArray(l)&&typeof l[0]==='string'&&typeof l[1]==='string'&&l[0].length<20&&l[1].length<20).map(l=>l[2]==='close'?[l[0],l[1],'close']:[l[0],l[1]]);
    // The extras: settings, sky and weather, and the things placed on top of the map.
    const pts=(v,n)=>list(v,n).map(p=>point(p,w,h)).filter(Boolean),area=a=>{const p=point(a,w,h),q=point(Array.isArray(a)?a.slice(2):null,w,h);return p&&q?[Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[0],q[0]),Math.max(p[1],q[1])]:null;};
    Object.assign(model,EXTRAS());setSettings(model,{hint:r.hint||'',tailDrop:r.tailDrop,gaze:r.gaze,dark:r.dark,living:r.living,abyss:r.abyss,timeLimit:r.timeLimit||0,camos:r.camos||0,seeds:r.seeds||0,glows:r.glows||0,sightRadius:r.sightRadius||0,biome:r.biome||'',
      hawk:r.hawk||null,storm:r.storm||null,tide:r.tide||null});
    for(const k of Object.keys(LAYERS))model[k]=pts(r[k],120);
    model.caps=list(r.caps,12).map(c=>({at:point(c?.at,w,h),to:point(c?.to,w,h)})).filter(c=>c.at);
    model.wind=list(r.wind,12).map(z=>({area:area(z?.area),dir:DIRS.find(([dx,dy])=>dx===z?.dir?.[0]&&dy===z?.dir?.[1])?.slice()||[1,0],period:clampNum(z?.period,1,30,5),on:clampNum(z?.on,.2,30,1.6),offset:clampNum(z?.offset,0,30,0)})).filter(z=>z.area);
    model.antTrails=list(r.antTrails,6).map(t=>({path:pts(t?.path,16),groups:clampNum(t?.groups,1,8,3),size:clampNum(t?.size,1,8,3),speed:clampNum(t?.speed,.3,4,1.5)})).filter(t=>t.path.length);
    model.seedCrossings=list(r.seedCrossings,8).map(c=>({id:safeId(c?.id,/^[a-z0-9-]{1,30}$/)||fresh('seed-'),banks:pts(c?.banks,4),tiles:pts(c?.tiles,12)})).filter(c=>c.banks.length&&c.tiles.length);
    model.rootWheel=point(r.rootWheel,w,h);
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
    validate,toRoute,fromRoute,treasureTotal,exportText,importText,sanitize,loadAll,saveOne,removeOne,
    LAYERS,DIRS,toggleLayer,addCap,setCapEnd,addWind,setWind,addRegion,setRegion,addAntPoint,setAnts,addSeedCrossing,setRootWheel,toggleRival,removeExtraAt,setGuard,setSettings,setMessage,setLinkAction,regionAt};
  root.EscapeBuilder=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
