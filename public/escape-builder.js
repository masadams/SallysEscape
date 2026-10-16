// The level builder's model: a text map plus enemies, tools and a few settings. Everything
// here is plain data, so it is easy to test, save in the browser, and share as text.
(function(root){
  const KEY='sally-escape-custom-v1',VERSION=1;
  const TILES={'#':'Wall','.':'Floor','L':'Leaves','N':'Gravel','B':'Cracked wall','M':'Mud','~':'Water','_':'Gap','c':'Crumbling floor','T':'Tangle vine','S':'Crack (Sally only)'};
  const MARKS={'@':'Sally','K':'Key','X':'Hatch','1':'Treasure 1','2':'Treasure 2','3':'Chest 3'};
  const ENEMIES={snake:'Snake',beetle:'Beetle',scorpion:'Scorpion',toad:'Toad',spider:'Spider',cricket:'Cricket',moth:'Moth',mimic:'Mimic',millipede:'Millipede',cobra:'King cobra',flytrap:'Flytrap',crab:'Hermit crab',fox:'Snow fox',heron:'Bog heron'};
  // Enemies that stay on their post; the rest walk their patrol.
  const POSTED=new Set(['scorpion','toad','mimic','millipede','cobra','flytrap','crab','heron']);
  const LIMITS={minW:11,maxW:35,minH:9,maxH:21};
  const solid=ch=>ch==='#';
  const walkable=ch=>ch!==undefined&&!['#','_','B'].includes(ch);
  // Creatures cannot squeeze through a crack; only Sally can.
  const roamable=ch=>walkable(ch)&&ch!=='S';

  function blank(width=21,height=13){
    width=Math.max(LIMITS.minW,Math.min(LIMITS.maxW,Math.round(width)));height=Math.max(LIMITS.minH,Math.min(LIMITS.maxH,Math.round(height)));
    const rows=[];for(let y=0;y<height;y++){let r='';for(let x=0;x<width;x++)r+=(x===0||y===0||x===width-1||y===height-1)?'#':'.';rows.push(r);}
    rows[height-2]=replaceAt(rows[height-2],1,'@');rows[1]=replaceAt(rows[1],width-2,'K');rows[height-2]=replaceAt(rows[height-2],width-2,'X');
    return {version:VERSION,id:'custom-'+Date.now().toString(36),name:'My escape',brief:'A level of my own.',map:rows,guards:[],burrows:0,pebbles:1,tongues:0,explore:false,requiredTreasure:0};
  }
  const replaceAt=(row,x,ch)=>row.slice(0,x)+ch+row.slice(x+1);
  const at=(model,x,y)=>model.map[y]?.[x];
  const edge=(model,x,y)=>x<=0||y<=0||y>=model.map.length-1||x>=model.map[0].length-1;

  // Paint one tile. Sally, the key and the hatch are unique, so placing one moves it.
  function paint(model,x,y,ch){
    if(at(model,x,y)===undefined||edge(model,x,y)&&ch!=='#')return false;
    if(['@','K','X'].includes(ch))model.map=model.map.map(r=>r.replaceAll(ch,'.'));
    model.map[y]=replaceAt(model.map[y],x,ch);
    if(!roamable(ch)){model.guards=model.guards.filter(g=>!(g.spawn[0]===x&&g.spawn[1]===y));for(const g of model.guards)g.patrol=g.patrol.filter(([px,py])=>px!==x||py!==y);}
    return true;
  }
  function resize(model,width,height){
    const next=blank(width,height),w=next.map[0].length,h=next.map.length;
    next.map=next.map.map((row,y)=>[...row].map((ch,x)=>edge({map:next.map},x,y)?'#':model.map[y]?.[x]!==undefined&&!edge(model,x,y)?model.map[y][x]:'.').join(''));
    const keep={...model,map:next.map};keep.guards=model.guards.filter(g=>g.spawn[0]<w-1&&g.spawn[1]<h-1).map(g=>({...g,patrol:g.patrol.filter(([x,y])=>x<w-1&&y<h-1)}));
    for(const ch of ['@','K','X'])if(!keep.map.some(r=>r.includes(ch))){const spot=findFloor(keep);if(spot)paint(keep,...spot,ch);}
    return keep;
  }
  function findFloor(model){for(let y=1;y<model.map.length-1;y++)for(let x=1;x<model.map[0].length-1;x++)if(at(model,x,y)==='.')return [x,y];return null;}
  function addEnemy(model,kind,x,y){
    if(!ENEMIES[kind]||!roamable(at(model,x,y)))return false;
    model.guards=model.guards.filter(g=>!(g.spawn[0]===x&&g.spawn[1]===y));
    model.guards.push({kind,spawn:[x,y],facing:Math.PI,patrol:[[x,y]]});return true;
  }
  function removeEnemy(model,x,y){const n=model.guards.length;model.guards=model.guards.filter(g=>!(g.spawn[0]===x&&g.spawn[1]===y));return model.guards.length<n;}
  // Turning an enemy a quarter turn sets where it faces: where a heron's beak points, a cobra looks, a crab runs.
  function turnEnemy(model,x,y){const g=model.guards.find(q=>q.spawn[0]===x&&q.spawn[1]===y);if(!g)return false;g.facing=((Math.round((g.facing??Math.PI)/(Math.PI/2))+1)%4)*Math.PI/2;return true;}
  // Patrol points are added in order; posted enemies keep their single post.
  function addPatrol(model,index,x,y){const g=model.guards[index];if(!g||POSTED.has(g.kind)||!roamable(at(model,x,y)))return false;if(g.patrol.length>=6)g.patrol.shift();g.patrol.push([x,y]);return true;}

  function find(model,ch){const out=[];model.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(c===ch)out.push([x,y]);}));return out;}
  function reach(model,from){
    const seen=new Set([from.join()]),q=[from];
    while(q.length){const [x,y]=q.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[x+dx,y+dy];if(!seen.has(n.join())&&walkable(at(model,...n))){seen.add(n.join());q.push(n);}}}
    return seen;
  }
  function treasureTotal(model){return model.map.join('').split('').filter(c=>/[1-5]/.test(c)).reduce((n,c)=>n+Number(c),0);}
  // Plain-language problems that would stop the level from being fair to play.
  function validate(model){
    const problems=[],rows=model.map,w=rows[0]?.length||0;
    if(!w||rows.some(r=>r.length!==w))problems.push('Every row must be the same width.');
    for(const [ch,name] of [['@','Sally'],['K','the key'],['X','the hatch']]){const n=find(model,ch).length;if(n!==1)problems.push(n?'Place only one '+name+'.':'Place '+name+'.');}
    if(problems.length)return problems;
    rows.forEach((r,y)=>[...r].forEach((c,x)=>{if(edge(model,x,y)&&!solid(c))problems.push('The outer edge must be wall.');}));
    const start=find(model,'@')[0],seen=reach(model,start),open=new Set(seen);
    // A tongue grab reaches three tiles in a straight line.
    if(model.tongues>0)for(const id of seen){const [x,y]=id.split(',').map(Number);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])for(let d=1;d<=3;d++){const c=at(model,x+dx*d,y+dy*d);if(c===undefined||solid(c)||c==='B')break;open.add((x+dx*d)+','+(y+dy*d));}}
    if(!open.has(find(model,'K')[0].join()))problems.push('Sally cannot reach the key.');
    if(!seen.has(find(model,'X')[0].join()))problems.push('Sally cannot reach the hatch.');
    const total=treasureTotal(model);if(model.requiredTreasure>total)problems.push('The hatch asks for more treasure than the level holds.');
    for(const g of model.guards){if(!roamable(at(model,...g.spawn)))problems.push(ENEMIES[g.kind]+' stands on a wall.');
      if(Math.hypot(g.spawn[0]-start[0],g.spawn[1]-start[1])<4)problems.push(ENEMIES[g.kind]+' starts too close to Sally.');
      for(const p of g.patrol)if(!seen.has(p.join())&&!seen.has(g.spawn.join()))problems.push(ENEMIES[g.kind]+' has a patrol point it cannot reach.');}
    return [...new Set(problems)];
  }
  // The route the game plays: the same shape every rebuilt escape uses.
  function toRoute(model){
    return {id:model.id,name:String(model.name||'My escape').slice(0,40),brief:String(model.brief||'').slice(0,140),hint:'',map:model.map.slice(),
      guards:model.guards.map(g=>({kind:g.kind,spawn:g.spawn.slice(),facing:g.facing??Math.PI,patrol:(g.patrol.length?g.patrol:[g.spawn]).map(p=>p.slice()),...(g.buried?{buried:true}:{})})),
      burrows:clampInt(model.burrows,0,5),pebbles:clampInt(model.pebbles,0,5),tongues:clampInt(model.tongues,0,5),explore:Boolean(model.explore),requiredTreasure:clampInt(model.requiredTreasure,0,99),...(model.explore?{sightRadius:5}:{})};
  }
  const clampInt=(n,a,b)=>Math.max(a,Math.min(b,Math.round(Number(n)||0)));

  // Share a level as one line of text; reading it back checks every field.
  function exportText(model){return 'SALLY1:'+btoa(unescape(encodeURIComponent(JSON.stringify(toRoute(model)))));}
  function importText(text){
    try{const raw=String(text).trim();if(!raw.startsWith('SALLY1:'))return null;const r=JSON.parse(decodeURIComponent(escape(atob(raw.slice(7)))));return sanitize(r);}catch(_){return null;}
  }
  function sanitize(r){
    if(!r||!Array.isArray(r.map)||!r.map.length||r.map.length>LIMITS.maxH||!r.map.every(row=>typeof row==='string'&&row.length===r.map[0].length&&row.length<=LIMITS.maxW&&/^[#.LNBM~_cTS@KX1-5]+$/.test(row)))return null;
    const guards=(Array.isArray(r.guards)?r.guards:[]).filter(g=>ENEMIES[g?.kind]&&Array.isArray(g.spawn)).slice(0,24).map(g=>({kind:g.kind,spawn:[clampInt(g.spawn[0],0,99),clampInt(g.spawn[1],0,99)],facing:Number.isFinite(g.facing)?g.facing:Math.PI,patrol:(Array.isArray(g.patrol)?g.patrol:[]).slice(0,6).map(p=>[clampInt(p?.[0],0,99),clampInt(p?.[1],0,99)])}));
    return {version:VERSION,id:typeof r.id==='string'&&/^custom-[a-z0-9-]{1,40}$/.test(r.id)?r.id:'custom-'+Date.now().toString(36),name:String(r.name||'Shared escape').slice(0,40),brief:String(r.brief||'').slice(0,140),map:r.map.slice(),guards,
      burrows:clampInt(r.burrows,0,5),pebbles:clampInt(r.pebbles,0,5),tongues:clampInt(r.tongues,0,5),explore:Boolean(r.explore),requiredTreasure:clampInt(r.requiredTreasure,0,99)};
  }

  // Saved levels live in this browser only.
  function loadAll(storage){try{const list=JSON.parse(storage?.getItem(KEY)||'[]');return Array.isArray(list)?list.map(sanitize).filter(Boolean):[];}catch(_){return [];}}
  function saveOne(storage,model){const list=loadAll(storage).filter(l=>l.id!==model.id);list.unshift(sanitize(toRoute(model)));try{storage?.setItem(KEY,JSON.stringify(list.slice(0,50)));return true;}catch(_){return false;}}
  function removeOne(storage,id){const list=loadAll(storage).filter(l=>l.id!==id);try{storage?.setItem(KEY,JSON.stringify(list));return true;}catch(_){return false;}}

  const api={TILES,MARKS,ENEMIES,POSTED,LIMITS,blank,paint,resize,addEnemy,removeEnemy,turnEnemy,addPatrol,validate,toRoute,treasureTotal,turnEnemy,exportText,importText,sanitize,loadAll,saveOne,removeOne};
  root.EscapeBuilder=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
