// The level builder's model: a text map plus enemies, doors, triggers, hazards and a few
// settings. Everything here is plain data, so it is easy to test, save in the browser, share as
// text, and publish to the community shelf. toRoute turns it into the route the game plays.
(function(root){
  const KEY='sally-escape-custom-v1',VERSION=2;
  const TILES={'#':'Wall','.':'Floor','L':'Leaves','N':'Gravel','B':'Cracked wall','M':'Mud','~':'Water','_':'Gap','c':'Crumbling floor','T':'Tangle vine','S':'Crack (Sally only)'};
  const MARKS={'@':'Sally','K':'Key','X':'Hatch','1':'Treasure 1','2':'Treasure 2','3':'Chest 3'};
  const ENEMIES={snake:'Snake',beetle:'Beetle',scorpion:'Scorpion',toad:'Toad',spider:'Spider',cricket:'Cricket',moth:'Moth',mimic:'Mimic',millipede:'Millipede',cobra:'King cobra',flytrap:'Flytrap',crab:'Hermit crab',fox:'Snow fox',heron:'Bog heron',mantis:'Praying mantis',wasp:'Wasp nest',dragonfly:'Dragonfly'};
  // Enemies that stay on their post; the rest walk their patrol.
  const POSTED=new Set(['scorpion','toad','mimic','millipede','cobra','flytrap','crab','heron','mantis','wasp']);
  const LIMITS={minW:11,maxW:35,minH:9,maxH:21,doors:6,triggers:24,hazards:24,guards:24};
  // Doors and bridges come in six colours; each colour is one door and one bridge.
  const COLORS=[['Red',[226,96,96]],['Blue',[96,150,236]],['Gold',[240,196,80]],['Green',[110,200,120]],['Violet',[178,120,230]],['Teal',[80,200,196]]];
  // How a door or bridge behaves when one of its triggers fires.
  const MODES={timed:'Opens for a few seconds',stay:'Opens and stays open',once:'Opens once for a few seconds, then is gone',shut:'Starts open, slams shut for good',crumble:'Starts open, crumbles after Sally crosses (bridge)'};
  const TRIGGERS={plate:'Plate',heavy:'Heavy plate (beetle)',lever:'Lever'};
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

  function blank(width=21,height=13){
    width=clampInt(width,LIMITS.minW,LIMITS.maxW);height=clampInt(height,LIMITS.minH,LIMITS.maxH);
    const rows=[];for(let y=0;y<height;y++){let r='';for(let x=0;x<width;x++)r+=(x===0||y===0||x===width-1||y===height-1)?'#':'.';rows.push(r);}
    rows[height-2]=replaceAt(rows[height-2],1,'@');rows[1]=replaceAt(rows[1],width-2,'K');rows[height-2]=replaceAt(rows[height-2],width-2,'X');
    return {version:VERSION,id:'custom-'+Date.now().toString(36),name:'My escape',brief:'A level of my own.',author:'',map:rows,guards:[],doors:[],triggers:[],links:[],hazards:[],cold:[],warm:[],
      burrows:0,pebbles:1,tongues:0,explore:false,requiredTreasure:0,nextId:1};
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
  const sourceAt=(model,x,y)=>{const t=triggerAt(model,x,y);if(t)return t.id;const ch=at(model,x,y);return ch==='K'?'key':/[1-5]/.test(ch||'')?'chest:'+x+','+y:null;};
  function prune(model){
    const sources=new Set(['key',...model.triggers.map(t=>t.id)]);model.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(/[1-5]/.test(c))sources.add('chest:'+x+','+y);}));
    const targets=new Set([...model.doors.map(d=>d.id),...model.guards.map(g=>g.id)]);
    model.links=model.links.filter(([s,t])=>sources.has(s)&&targets.has(t));
  }
  // Clearing a tile removes whatever stood there that can no longer stand on it.
  function clearAt(model,x,y,ch){
    if(!roamable(ch)){model.guards=model.guards.filter(g=>!same(g.spawn,[x,y]));for(const g of model.guards)g.patrol=g.patrol.filter(p=>!same(p,[x,y]));
      model.triggers=model.triggers.filter(t=>!same(t.at,[x,y]));}
    if(ch!=='#')model.hazards=model.hazards.filter(h=>!(h.type==='vent'&&same(h.at,[x,y])));
    if(!walkable(ch)){model.hazards=model.hazards.filter(h=>h.type==='vent'||!same(h.at,[x,y])&&!same(h.to,[x,y]));model.cold=model.cold.filter(p=>!same(p,[x,y]));model.warm=model.warm.filter(p=>!same(p,[x,y]));}
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
    if(changes.seconds!==undefined)d.seconds=clampInt(changes.seconds,2,20);return true;}

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
    const validSource=source==='key'||source?.startsWith('chest:')||model.triggers.some(t=>t.id===source);
    const door=model.doors.find(d=>d.id===target),guard=model.guards.find(g=>g.id===target);
    if(!validSource||!door&&!guard)return {ok:false,reason:'Link a trigger to a door, bridge or enemy.'};
    if(guard&&!(source==='key'||source.startsWith('chest:')))return {ok:false,reason:'Only taking the key or a chest can wake an enemy.'};
    const i=model.links.findIndex(([s,t])=>s===source&&t===target);
    if(i>=0){model.links.splice(i,1);return {ok:true,linked:false};}
    model.links.push([source,target]);if(guard)guard.sleep=true;return {ok:true,linked:true};
  }
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
    if(changes.length!==undefined&&h.type==='vent')h.length=clampInt(changes.length,1,6);return true;}
  // Cold ground chills Sally; warm stones thaw her.
  function paintClimate(model,kind,x,y){
    if(!walkable(at(model,x,y)))return false;const spots=kind==='warm'?model.warm:model.cold;
    if(spots.some(p=>same(p,[x,y]))||kind==='warm'&&spots.length>=60)return false;spots.push([x,y]);return true;
  }

  function find(model,ch){const out=[];model.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(c===ch)out.push([x,y]);}));return out;}
  // Doors and bridges count as passable here: the checks assume their triggers can open them.
  function reach(model,from){
    const passable=(x,y)=>walkable(at(model,x,y))||Boolean(doorAt(model,x,y));
    const seen=new Set([from.join()]),q=[from];
    while(q.length){const [x,y]=q.shift();for(const [dx,dy] of DIRS){const n=[x+dx,y+dy];if(!seen.has(n.join())&&passable(...n)){seen.add(n.join());q.push(n);}}}
    return seen;
  }
  function treasureTotal(model){return model.map.join('').split('').filter(c=>/[1-5]/.test(c)).reduce((n,c)=>n+Number(c),0);}
  const doorName=d=>COLORS[d.color][0]+(d.bridge?' bridge':' door');
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
      if(g.sleep&&!linksTo(model,g.id).length)problems.push('A sleeping '+ENEMIES[g.kind].toLowerCase()+' has nothing to wake it: link the key or a chest to it.');
      if(g.kind!=='dragonfly')for(const p of g.patrol)if(!seen.has(p.join())&&!seen.has(g.spawn.join()))problems.push(ENEMIES[g.kind]+' has a patrol point it cannot reach.');}
    for(const d of model.doors)if(d.mode!=='crumble'&&!linksTo(model,d.id).length)problems.push('The '+doorName(d).toLowerCase()+' has nothing linked to '+(d.mode==='shut'?'shut':'open')+' it.');
    for(const t of model.triggers){if(!linksFrom(model,t.id).length)problems.push('A '+TRIGGERS[t.type].toLowerCase()+' is not linked to anything.');
      if(t.type==='heavy'&&!model.guards.some(g=>g.kind==='beetle'&&!g.sleep&&g.patrol.some(p=>same(p,t.at))))problems.push('A heavy plate needs a beetle with a patrol point on it.');}
    for(const h of model.hazards)if(h.type==='log'&&!h.to)problems.push('A rolling log needs an end: pick it with the Link tool, then click where it rolls to.');
    return [...new Set(problems)];
  }

  // The route the game plays: the same shape every rebuilt escape uses.
  function toRoute(model){
    const awake=model.guards.filter(g=>!g.sleep),asleep=model.guards.filter(g=>g.sleep);
    const guard=g=>({kind:g.kind,spawn:g.spawn.slice(),facing:g.facing??Math.PI,patrol:(g.patrol.length?g.patrol:[g.spawn]).map(p=>p.slice())});
    const triggersFor=(d,type)=>model.triggers.filter(t=>t.type===type&&linksTo(model,d.id).includes(t.id)).map(t=>t.at.slice());
    const gates=model.doors.map(d=>({id:d.id,name:COLORS[d.color][0],color:COLORS[d.color][1],tiles:d.tiles.map(t=>t.slice()),...(d.bridge?{bridge:true}:{}),
      plates:triggersFor(d,'plate'),levers:triggersFor(d,'lever'),heavyPlates:triggersFor(d,'heavy'),
      ...(d.mode==='timed'?{duration:d.seconds}:d.mode==='once'?{duration:d.seconds,once:true}:d.mode==='stay'?{stay:true}:d.mode==='shut'?{shut:true,initialOpen:true}:{crumble:true,initialOpen:true})}));
    const reaction=(source,extra)=>{const targets=linksFrom(model,source),doors=model.doors.filter(d=>targets.includes(d.id)),wake=asleep.filter(g=>targets.includes(g.id));
      if(!doors.length&&!wake.length)return null;
      return {id:'builder-'+source.replace(/[^a-z0-9]/g,'-'),...extra,open:doors.filter(d=>d.mode!=='shut').map(d=>d.id),close:doors.filter(d=>d.mode==='shut').map(d=>d.id),spawn:wake.map(g=>g.id),
        message:wake.length?'Something stirs nearby.':'Somewhere, a passage changes.',objective:'Find the hatch.'};};
    const reactions=[reaction('key',{when:'key'}),...find(model,'1').concat(find(model,'2'),find(model,'3'),find(model,'4'),find(model,'5')).map(([x,y])=>reaction('chest:'+x+','+y,{when:'treasure',at:[x,y]}))].filter(Boolean);
    const vents=[],thorns=[],logs=[];
    for(const h of model.hazards){const [period,second]=TIMING[h.type][h.speed]||TIMING[h.type].medium,offset=+(h.offset*period).toFixed(2);
      if(h.type==='vent')vents.push({at:h.at.slice(),dir:DIRS[h.dir].slice(),length:h.length,period,on:second,offset});
      else if(h.type==='thorns')thorns.push({tiles:[h.at.slice()],period,up:second,offset});
      else if(h.to)logs.push({from:h.at.slice(),to:h.to.slice(),period,offset,speed:second});}
    return {id:model.id,name:String(model.name||'My escape').slice(0,40),brief:String(model.brief||'').slice(0,140),hint:'',map:model.map.slice(),
      guards:awake.map(guard),...(asleep.length?{reinforcements:asleep.map(g=>({id:g.id,...guard(g)}))}:{}),
      ...(gates.length?{gates}:{}),...(reactions.length?{reactions}:{}),...(vents.length?{vents}:{}),...(thorns.length?{thorns}:{}),...(logs.length?{logs}:{}),
      ...(model.cold.length?{cold:model.cold.map(([x,y])=>[x,y,x,y])}:{}),...(model.warm.length?{warm:model.warm.map(p=>p.slice())}:{}),
      burrows:clampInt(model.burrows,0,5),pebbles:clampInt(model.pebbles,0,5),tongues:clampInt(model.tongues,0,5),explore:Boolean(model.explore),requiredTreasure:clampInt(model.requiredTreasure,0,99),...(model.explore?{sightRadius:5}:{})};
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
    if(!r||!Array.isArray(r.map)||r.map.length<LIMITS.minH||r.map.length>LIMITS.maxH||!r.map.every(row=>typeof row==='string'&&row.length===r.map[0].length&&row.length>=LIMITS.minW&&row.length<=LIMITS.maxW&&/^[#.LNBM~_cTS@KX1-5]+$/.test(row)))return null;
    const w=r.map[0].length,h=r.map.length,model={version:VERSION,id:safeId(r.id,/^custom-[a-z0-9-]{1,40}$/)||'custom-'+Date.now().toString(36),name:String(r.name||'Shared escape').slice(0,40),brief:String(r.brief||'').slice(0,140),author:String(r.author||'').slice(0,30),
      map:r.map.slice(),burrows:clampInt(r.burrows,0,5),pebbles:clampInt(r.pebbles,0,5),tongues:clampInt(r.tongues,0,5),explore:Boolean(r.explore),requiredTreasure:clampInt(r.requiredTreasure,0,99),nextId:clampInt(r.nextId,1,1e6)};
    let n=0;const fresh=prefix=>prefix+(1e6+(++n));
    model.guards=list(r.guards,LIMITS.guards).filter(g=>ENEMIES[g?.kind]&&point(g.spawn,w,h)).map(g=>({id:safeId(g.id,/^e[0-9]{1,8}$/)||fresh('e'),kind:g.kind,spawn:point(g.spawn,w,h),facing:Number.isFinite(g.facing)?g.facing:Math.PI,
      patrol:list(g.patrol,6).map(p=>point(p,w,h)).filter(Boolean),sleep:Boolean(g.sleep)}));
    for(const g of model.guards)if(!g.patrol.length)g.patrol=[g.spawn.slice()];
    const seenDoor=new Set();
    model.doors=list(r.doors,LIMITS.doors*2).filter(d=>/^[db][0-5]$/.test(d?.id)&&!seenDoor.has(d.id)&&seenDoor.add(d.id)).map(d=>({id:d.id,color:Number(d.id[1]),bridge:d.id[0]==='b',tiles:list(d.tiles,60).map(p=>point(p,w,h)).filter(Boolean),
      mode:MODES[d.mode]&&(d.mode!=='crumble'||d.id[0]==='b')?d.mode:'timed',seconds:clampInt(d.seconds||5,2,20)})).filter(d=>d.tiles.length);
    model.triggers=list(r.triggers,LIMITS.triggers).filter(t=>TRIGGERS[t?.type]&&point(t.at,w,h)&&safeId(t.id,/^t[0-9]{1,8}$/)).map(t=>({id:t.id,type:t.type,at:point(t.at,w,h)}));
    model.hazards=list(r.hazards,LIMITS.hazards).filter(z=>HAZARDS[z?.type]&&point(z.at,w,h)&&safeId(z.id,/^h[0-9]{1,8}$/)).map(z=>({id:z.id,type:z.type,at:point(z.at,w,h),speed:SPEEDS[z.speed]?z.speed:'medium',offset:z.offset?.5:0,
      ...(z.type==='vent'?{dir:clampInt(z.dir,0,3),length:clampInt(z.length||3,1,6)}:{}),...(z.type==='log'?{to:point(z.to,w,h)}:{})}));
    model.cold=list(r.cold,w*h).map(p=>point(p,w,h)).filter(Boolean);model.warm=list(r.warm,60).map(p=>point(p,w,h)).filter(Boolean);
    model.links=list(r.links,200).filter(l=>Array.isArray(l)&&typeof l[0]==='string'&&typeof l[1]==='string'&&l[0].length<20&&l[1].length<20).map(l=>[l[0],l[1]]);
    prune(model);return model;
  }

  // Saved levels live in this browser only.
  function loadAll(storage){try{const saved=JSON.parse(storage?.getItem(KEY)||'[]');return Array.isArray(saved)?saved.map(sanitize).filter(Boolean):[];}catch(_){return [];}}
  function saveOne(storage,model){const saved=loadAll(storage).filter(l=>l.id!==model.id);saved.unshift(sanitize(model));try{storage?.setItem(KEY,JSON.stringify(saved.slice(0,50)));return true;}catch(_){return false;}}
  function removeOne(storage,id){const saved=loadAll(storage).filter(l=>l.id!==id);try{storage?.setItem(KEY,JSON.stringify(saved));return true;}catch(_){return false;}}

  const api={TILES,MARKS,ENEMIES,POSTED,LIMITS,COLORS,MODES,TRIGGERS,HAZARDS,SPEEDS,blank,paint,resize,addEnemy,removeEnemy,turnEnemy,addPatrol,clearPatrol,setSleep,
    paintDoor,removeDoorTile,setDoor,addTrigger,removeAt,toggleLink,linksFrom,linksTo,sourceAt,doorAt,triggerAt,hazardAt,guardAt,addHazard,setLogEnd,setHazard,paintClimate,doorName,
    validate,toRoute,treasureTotal,exportText,importText,sanitize,loadAll,saveOne,removeOne};
  root.EscapeBuilder=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
