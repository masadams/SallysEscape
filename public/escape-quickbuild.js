// Quick build: a first draft of a level for the builder, made from a few settings and a seed.
// The same settings and seed always make the same level; a new seed makes a new one. It follows
// the rules the game's own escapes keep: rooms joined by corridors with loops (more than one way
// round), the key and hatch far from the start, ten treasure spread out with the best in dead
// ends, leaves never far away, nothing near the start, and nothing posted on the only way through.
// Every draft is checked before it is shown: the builder's own checks, and Sally standing still at
// the start for fifteen seconds without being seen. Then it is an ordinary builder level to edit.
(function(root){
  const need=(name,file)=>{if(root[name]||typeof require!=='function')return root[name]||null;const m=require(file);return root[name]||m[name]||m;};
  const SIZES={small:{name:'Small',w:21,h:13,cols:3,rows:2,foes:2},medium:{name:'Medium',w:29,h:17,cols:4,rows:3,foes:4},large:{name:'Large',w:37,h:23,cols:5,rows:4,foes:6}};
  // Each theme: who walks a beat, who keeps a post, what the floor is dressed with (tile, share of
  // room floor), and the area's extras.
  const THEMES={
    meadow:{name:'Meadow',walkers:['snake','beetle','cricket','spider'],posted:['toad','scorpion'],decor:[['L',.05],['N',.02]],words:['Clover','Buttercup','Hayfield','Meadow']},
    marsh:{name:'Marsh',walkers:['snake','dragonfly'],posted:['heron','toad','flytrap','echofrog'],decor:[['M',.05],['L',.04]],ponds:true,words:['Reed','Bog','Lily','Marsh']},
    desert:{name:'Desert',walkers:['snake','beetle'],posted:['scorpion','cobra'],decor:[['N',.04],['L',.03]],desert:true,words:['Dune','Sunbaked','Mesa','Dust']},
    frost:{name:'Frost',walkers:['fox','owl'],posted:['sentinel'],decor:[['L',.04]],cold:true,ice:true,words:['Frost','Icicle','Snowdrift','Rime']},
    grotto:{name:'Glow grotto',walkers:['bat','moth','spider'],posted:['flytrap','mimic'],decor:[['L',.04],['m',.04]],dark:true,words:['Glimmer','Cavern','Lantern','Grotto']},
    jungle:{name:'Jungle',walkers:['snake','spider','chameleon'],posted:['mantis','wasp'],decor:[['L',.06],['T',.03],['m',.03]],words:['Vine','Canopy','Fern','Jungle']},
    ruins:{name:'Ruins',walkers:['beetle','owl','gecko'],posted:['mimic','millipede','scorpion'],decor:[['N',.05],['L',.04]],echo:true,words:['Old','Broken','Mossy','Fallen']}
  };
  const DIFFICULTY={1:{name:'Gentle',foes:.75,cover:4,toll:4,loops:.5},2:{name:'Tricky',foes:1,cover:5,toll:6,loops:.4},3:{name:'Hard',foes:1.35,cover:6,toll:7,loops:.3}};
  const FEATURES=[...new Set(Object.values(THEMES).flatMap(t=>[...t.walkers,...t.posted]))];
  // How far a posted hunter strikes (as the linter measures it), to keep it off the only way through.
  const REACH={scorpion:1.8,cobra:2.4,mantis:1.5,flytrap:1.4,heron:2.5,toad:5,mimic:1.2,wasp:2,millipede:1,echofrog:1.5,sentinel:1};
  const WORDS=['Run','Dash','Hollow','Crossing','Path','Maze','Rooms','Trail'];
  const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];

  function rng(seed){let a=seed>>>0||1;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  const key=(x,y)=>x+','+y;

  // One attempt with one seed. Returns the model and what it put where.
  function attempt(B,opts,seed){
    const R=rng(seed),int=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=list=>list[Math.floor(R()*list.length)];
    const shuffle=list=>{const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
    const size=SIZES[opts.size],theme=THEMES[opts.theme],diff=DIFFICULTY[opts.difficulty],{w,h,cols,rows}=size;
    const grid=Array.from({length:h},()=>Array(w).fill('#'));
    // Cell edges spread the leftover tiles evenly, so the rooms fill the map.
    const colAt=c=>1+Math.floor(c*(w-1)/cols),rowAt=r=>1+Math.floor(r*(h-1)/rows);
    // Rooms: one per cell of a coarse grid, each a random size inside its cell.
    const rooms=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const cw=colAt(c+1)-colAt(c),ch=rowAt(r+1)-rowAt(r);
      const rw=int(Math.max(3,cw-4),cw-1),rh=int(Math.max(3,ch-3),ch-1),x=colAt(c)+int(0,cw-1-rw),y=rowAt(r)+int(0,ch-1-rh);
      rooms.push({c,r,x,y,w:rw,h:rh,links:[],cx:x+Math.floor(rw/2),cy:y+Math.floor(rh/2)});
      for(let yy=y;yy<y+rh;yy++)for(let xx=x;xx<x+rw;xx++)grid[yy][xx]='.';
    }
    const roomAt=(c,r)=>rooms[r*cols+c],inRoom=(rm,x,y)=>x>=rm.x&&x<rm.x+rm.w&&y>=rm.y&&y<rm.y+rm.h,roomOf=(x,y)=>rooms.find(rm=>inRoom(rm,x,y));
    // Corridors: a random spanning tree, then some of the remaining neighbours for loops.
    const edges=[];for(const rm of rooms){if(rm.c+1<cols)edges.push([rm,roomAt(rm.c+1,rm.r)]);if(rm.r+1<rows)edges.push([rm,roomAt(rm.c,rm.r+1)]);}
    const start=roomAt(0,rows-1),joined=new Set([start]),tree=new Set();
    while(joined.size<rooms.length){const options=edges.filter(([a,b])=>joined.has(a)!==joined.has(b));const e=pick(options);tree.add(e);joined.add(e[0]);joined.add(e[1]);}
    const corridor=(a,b)=>{const p=[int(a.x,a.x+a.w-1),int(a.y,a.y+a.h-1)],q=[int(b.x,b.x+b.w-1),int(b.y,b.y+b.h-1)],flat=R()<.5;
      const [mx,my]=flat?[q[0],p[1]]:[p[0],q[1]];
      for(const [[x0,y0],[x1,y1]] of [[p,[mx,my]],[[mx,my],q]]){let x=x0,y=y0;grid[y][x]=grid[y][x]==='#'?'.':grid[y][x];while(x!==x1||y!==y1){x+=Math.sign(x1-x);y+=Math.sign(y1-y);if(grid[y][x]==='#')grid[y][x]='.';}}
      a.links.push(b);b.links.push(a);};
    for(const e of edges)if(tree.has(e)||R()<diff.loops)corridor(...e);
    // Walking distance from a tile to every tile.
    const floor=(x,y)=>grid[y]?.[x]!==undefined&&grid[y][x]!=='#'&&grid[y][x]!=='I';
    const bfs=(sx,sy,blocked)=>{const d=new Map([[key(sx,sy),0]]),q=[[sx,sy]];for(let i=0;i<q.length;i++){const [x,y]=q[i],n=d.get(key(x,y));for(const [dx,dy] of DIRS){const k=key(x+dx,y+dy);if(!d.has(k)&&floor(x+dx,y+dy)&&!blocked?.has(k)){d.set(k,n+1);q.push([x+dx,y+dy]);}}}return d;};
    // Sally starts in the bottom-left room's corner; the key is in the room furthest away, and the
    // hatch is far from both.
    const sally=[start.x,start.y+start.h-1];grid[sally[1]][sally[0]]='@';
    const fromStart=bfs(...sally),dist=rm=>fromStart.get(key(rm.cx,rm.cy))??0;
    const keyRoom=rooms.filter(r=>r!==start).sort((a,b)=>dist(b)-dist(a))[0],fromKey=bfs(keyRoom.cx,keyRoom.cy);
    const exitRoom=rooms.filter(r=>r!==start&&r!==keyRoom).sort((a,b)=>(dist(b)+.7*fromKey.get(key(b.cx,b.cy)))-(dist(a)+.7*fromKey.get(key(a.cx,a.cy))))[0];
    const taken=new Set([key(...sally)]);
    const freeIn=(rm,test=()=>true)=>{const out=[];for(let y=rm.y;y<rm.y+rm.h;y++)for(let x=rm.x;x<rm.x+rm.w;x++)if(grid[y][x]==='.'&&!taken.has(key(x,y))&&test(x,y))out.push([x,y]);return out;};
    const place=(x,y,c)=>{grid[y][x]=c;taken.add(key(x,y));};
    place(keyRoom.cx,keyRoom.cy,'K');
    // Room centres stay plain floor: hunters walk between them.
    for(const rm of rooms)taken.add(key(rm.cx,rm.cy));
    const exitSpot=pick(freeIn(exitRoom));place(...exitSpot,'X');
    // Ten treasure: the chest in a dead end far from the start, the rest spread a room apiece.
    const treasureRooms=rooms.filter(r=>r!==start).sort((a,b)=>(a.links.length-b.links.length)||(dist(b)-dist(a)));
    const order=[...treasureRooms.slice(0,1),...shuffle(treasureRooms.slice(1))];
    [3,2,2,1,1,1].forEach((v,i)=>{const rm=order[i%order.length],spot=pick(freeIn(rm));if(spot)place(...spot,String(v));});
    // Dress the floor: the theme's tiles in patches inside rooms, never in a doorway.
    const doorway=(x,y)=>DIRS.some(([dx,dy])=>{const n=roomOf(x,y);return n&&floor(x+dx,y+dy)&&!inRoom(n,x+dx,y+dy);});
    for(const rm of rooms)for(const [tile,share] of theme.decor){
      const n=Math.round(rm.w*rm.h*share+R()*.8);for(let i=0;i<n;i++){const s=pick(freeIn(rm,(x,y)=>!doorway(x,y)));if(s)grid[s[1]][s[0]]=tile;}}
    if(theme.ponds)for(const rm of shuffle(rooms.filter(r=>r!==start&&r.w>=4&&r.h>=4)).slice(0,Math.ceil(rooms.length/3))){
      const px=int(rm.x+1,rm.x+rm.w-3),py=int(rm.y+1,rm.y+rm.h-3);for(let y=py;y<py+2;y++)for(let x=px;x<px+2;x++)if(grid[y][x]==='.'&&!taken.has(key(x,y)))grid[y][x]='~';}
    // Ice pillars stand clear of every room wall, so they never block the way.
    if(theme.ice)for(const rm of rooms.filter(r=>r.w>=5&&r.h>=4)){const s=pick(freeIn(rm,(x,y)=>x>rm.x&&x<rm.x+rm.w-1&&y>rm.y&&y<rm.y+rm.h-1&&DIRS.every(([dx,dy])=>!taken.has(key(x+dx,y+dy)))));if(s&&R()<.6)grid[s[1]][s[0]]='I';}
    // Cover: leaves wherever the nearest hiding place is too far away.
    for(let guard=0;guard<80;guard++){
      const cover=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(grid[y][x]==='L')cover.push([x,y]);
      const near=new Map(),q=[];for(const [x,y] of cover){near.set(key(x,y),0);q.push([x,y]);}
      for(let i=0;i<q.length;i++){const [x,y]=q[i],n=near.get(key(x,y));for(const [dx,dy] of DIRS){const k=key(x+dx,y+dy);if(!near.has(k)&&floor(x+dx,y+dy)){near.set(k,n+1);q.push([x+dx,y+dy]);}}}
      let worst=null,far=diff.cover;for(const [k] of fromStart){const n=near.has(k)?near.get(k):99;if(n>far){far=n;worst=k;}}
      if(!worst)break;const [x,y]=worst.split(',').map(Number);
      const spot=[[x,y],...DIRS.map(([dx,dy])=>[x+dx,y+dy])].find(([a,b])=>grid[b]?.[a]==='.'&&!taken.has(key(a,b)));if(!spot)break;grid[spot[1]][spot[0]]='L';
    }

    const model=B.blank(w,h);model.map=grid.map(r=>r.join(''));
    const word=pick(theme.words)+' '+pick(WORDS);
    Object.assign(model,{name:word,brief:'A quick build: '+size.name.toLowerCase()+' '+theme.name.toLowerCase()+', '+diff.name.toLowerCase()+'.',pebbles:2,burrows:1,tongues:0,requiredTreasure:diff.toll});
    B.setSettings(model,{tailDrop:opts.difficulty<3});
    // Hunters. None in the start room or within six tiles of Sally, and a posted hunter only where
    // there is still a way round its reach to the key and the hatch.
    const count=Math.max(1,Math.round(size.foes*diff.foes)),posted=new Set(B.POSTED);
    const kinds=[];if(opts.feature)for(let i=0;i<(opts.size==='small'?1:2);i++)kinds.push(opts.feature);
    // A mix: walkers and posted hunters taken in turn from the theme's lists, so no one kind crowds the level.
    const walkers=shuffle(theme.walkers),guards=shuffle(theme.posted);let wi=0,pi=0;
    while(kinds.length<count)kinds.push(R()<.6?walkers[wi++%walkers.length]:guards[pi++%guards.length]);
    const away=([x,y])=>Math.hypot(x-sally[0],y-sally[1])>=6;
    const keySpot=[keyRoom.cx,keyRoom.cy],loot=[];model.map.forEach((r,y)=>[...r].forEach((c,x)=>{if(/[1-5]/.test(c))loot.push([x,y]);}));
    const fair=(kind,[px,py])=>{const reach=REACH[kind]||1.5,zone=new Set();for(const [k] of fromStart){const [x,y]=k.split(',').map(Number);if(Math.hypot(x-px,y-py)<=reach+.5)zone.add(k);}
      if(zone.has(key(...keySpot))||zone.has(key(...exitSpot))||loot.some(([x,y])=>Math.hypot(x-px,y-py)<1.5))return false;
      const around=bfs(...sally,zone);return around.has(key(...keySpot))&&around.has(key(...exitSpot));};
    const used=new Set(),hunters=[];
    for(const kind of kinds){
      const candidates=shuffle(rooms.filter(r=>r!==start&&!used.has(r)).concat(rooms.filter(r=>r!==start&&used.has(r))));
      let done=false;
      for(const rm of candidates){
        const spots=shuffle(freeIn(rm,(x,y)=>away([x,y])&&!B.guardAt(model,x,y)&&model.map[y][x]!=='~'));
        for(const s of spots.slice(0,8)){
          if(posted.has(kind)&&!fair(kind,s))continue;
          if(!B.addEnemy(model,kind,...s))continue;
          const g=model.guards.at(-1),toward=([x,y])=>Math.atan2(y-s[1],x-s[0]);
          if(posted.has(kind)){g.facing=Math.round(toward([rm.cx,rm.cy])/(Math.PI/2))*Math.PI/2||0;if(kind==='sentinel'){g.looks=[g.facing,g.facing+Math.PI/2];g.every=4.5;g.range=7;}}
          else{const next=pick(rm.links.filter(r=>r!==start))||rm,then=pick(next.links.filter(r=>r!==start&&r!==rm));
            for(const p of [[next.cx,next.cy],...(then&&R()<.5?[[then.cx,then.cy]]:[])])B.addPatrol(model,model.guards.length-1,...p);
            g.facing=Math.round(toward(g.patrol[1]||[next.cx,next.cy])/(Math.PI/2))*Math.PI/2||0;}
          used.add(rm);hunters.push(kind);done=true;break;
        }
        if(done)break;
      }
    }
    // The area's extras.
    if(theme.cold){for(const [k] of fromStart){const [x,y]=k.split(',').map(Number);model.cold.push([x,y]);}
      for(const rm of rooms){const s=pick(freeIn(rm));if(s)B.paintClimate(model,'warm',...s);}}
    if(theme.dark){B.setSettings(model,{dark:true,glows:2});for(const rm of rooms){const s=pick(freeIn(rm));if(s)B.toggleLayer(model,'glowPlants',...s);}}
    if(theme.desert){B.setSettings(model,{biome:'desert',camos:1});if(opts.difficulty>=2){B.setSettings(model,{hawk:{every:11,warn:2.4,first:14}});
      for(const rm of rooms)for(const s of shuffle(freeIn(rm)).slice(0,2))B.toggleLayer(model,'shade',...s);}}
    if(theme.echo){const big=rooms.filter(r=>r!==start).sort((a,b)=>b.w*b.h-a.w*a.h)[0];B.addEcho(model,big.x,big.y,big.x+big.w-1,big.y+big.h-1);}
    const named=[...new Set(hunters)].map(k=>B.ENEMIES[k].toLowerCase());
    B.setSettings(model,{hint:'Find the key, gather '+diff.toll+' treasure and reach the hatch. Watch for the '+(named.length>1?named.slice(0,-1).join(', ')+' and '+named.at(-1):named[0]||'hunters')+'. Leaves are never far away: stand still in them to hide.'});
    return {model,hunters};
  }

  // Is the draft fair to start? The builder's checks, then fifteen seconds standing still at the start.
  function problems(B,model){
    const found=B.validate(model);if(found.length)return found;
    const build=need('escapeBuildCustom','./escape-levels.js'),Adventure=need('EscapeAdventure','./escape-engine.js');
    if(!build||!Adventure)return [];
    try{const g=new Adventure({level:build(B.toRoute(model))});for(let i=0;i<1800&&g.status==='playing';i++)g.advance(1/120,{x:0,y:0});
      if(g.status!=='playing'||g.alarms>0)return ['Sally is found standing at the start.'];}catch(err){return ['Does not build: '+err.message];}
    return [];
  }

  // The public entry: settings in, a checked builder model out. Tries the next seeds until a draft passes.
  function generate(options={}){
    const B=need('EscapeBuilder','./escape-builder.js');
    const opts={size:SIZES[options.size]?options.size:'medium',theme:THEMES[options.theme]?options.theme:'meadow',difficulty:DIFFICULTY[options.difficulty]?Number(options.difficulty):2,
      feature:FEATURES.includes(options.feature)?options.feature:''};
    const seed=Math.max(1,Math.floor(Number(options.seed)||1))%1000000||1;
    let last=null;
    for(let i=0;i<24;i++){const s=(seed+i*7919-1)%1000000+1,out=attempt(B,opts,s),bad=problems(B,out.model);
      out.model.id='quick-'+opts.theme+'-'+s;last={...out,seed:s,settings:opts,problems:bad};if(!bad.length)return last;}
    return last;
  }
  const newSeed=()=>1+Math.floor(Math.random()*999999);
  const api={SIZES,THEMES,DIFFICULTY,FEATURES,generate,newSeed};
  root.EscapeQuickBuild=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
