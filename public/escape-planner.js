// A route planner that needs no hints: it plays the way a careful person does. It picks the next
// goal (treasure until there is enough or it opens the way, then the key, then the hatch), breaks
// the walk there into hops between cover (leaves and nooks near the path), and at each piece of
// cover waits for the shortest pause after which the next hop gets through. Where no pause works
// it backs up and tries a later window from the hop before. The route it finds is one a player
// could follow: hide, watch, go.
//
// Shared by scripts/planner.cjs (the command line) and the builder's 🤖 Try to solve, which runs it
// in a worker (escape-planner-worker.js) so the page stays responsive.
(function(root){
  const EscapeAdventure=typeof module!=='undefined'&&module.exports?require('./escape-engine.js').EscapeAdventure:root.EscapeAdventure;
  const env=typeof process!=='undefined'&&process.env?process.env:{};
  const log=(...m)=>{if(typeof console!=='undefined')console.error(...m);};
  // Deep clone that keeps prototypes, Maps, Sets and shared references; frozen catalog data is shared.
  function clone(value,memo=new Map()){
    if(value===null||typeof value!=='object'||Object.isFrozen(value))return value;
    if(memo.has(value))return memo.get(value);let out;
    if(Array.isArray(value)){out=new Array(value.length);memo.set(value,out);for(let i=0;i<value.length;i++)out[i]=clone(value[i],memo);return out;}
    if(value instanceof Map){out=new Map();memo.set(value,out);for(const [k,v] of value)out.set(clone(k,memo),clone(v,memo));return out;}
    if(value instanceof Set){out=new Set();memo.set(value,out);for(const v of value)out.add(clone(v,memo));return out;}
    out=Object.create(Object.getPrototypeOf(value));memo.set(value,out);for(const k of Object.keys(value))out[k]=clone(value[k],memo);return out;
  }
  function push(rec,cmd){const last=rec.at(-1);if(cmd.kind==='move'&&last&&last.kind==='move'&&last.x===cmd.x&&last.y===cmd.y&&last.sprint===cmd.sprint)last.frames+=cmd.frames;else rec.push({...cmd});}
  const bad=g=>g.status==='caught'||g.status==='failed'||(g.tailsDropped>0&&!env.ALLOW_TAIL)||(g.challenge?.noChase&&g.alarms>0)||(env.STEALTH&&g.hunters.some(h=>h.state==='chase'));
  function frame(g,rec,x,y,sprint){g.advance(1/120,{x,y,sprint});push(rec,{kind:'move',frames:1,x,y,sprint});}
  function go(g,rec,item,sprint){
    const limit=Math.ceil((Math.hypot(item.x-g.player.x,item.y-g.player.y)+1.5)*120);
    for(let i=0;i<limit&&g.status==='playing';i++){
      // Reaching a bounce cap launches Sally: ride the flight out, and the waypoint counts as reached.
      if(g.player.flight){while(g.player.flight&&g.status==='playing'){frame(g,rec,0,0,false);if(bad(g))return false;}return true;}
      const dx=item.x-g.player.x,dy=item.y-g.player.y,L=Math.hypot(dx,dy);if(L<(item.exact?.004:.12))return true;
      // Near an exact spot, a shorter input moves Sally only part of a step, so she lands on it.
      const step=(item.exact?2.45:sprint?4:2.45)/120,scale=item.exact&&L<step?L/step:1;
      frame(g,rec,+(dx/L*scale).toFixed(4),+(dy/L*scale).toFixed(4),item.exact?false:sprint);if(bad(g))return false;
    }
    return g.status==='won'||(g.status==='playing'&&Math.hypot(item.x-g.player.x,item.y-g.player.y)<.3);
  }

  // Cover counts as on the way when it is within two steps of the path.
  const NEAR=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dy)<=2)NEAR.push([dx,dy]);
  NEAR.sort((a,b)=>Math.abs(a[0])+Math.abs(a[1])-Math.abs(b[0])-Math.abs(b[1]));
  const WAITS=[0,.25,.5,.75,1,1.5,2,2.5,3,4,5,6,8],TOSS_WAITS=[.5,1,1.5,2,3,4],MID_WAITS=[.5,1.5,3];
  // The planner's budget is game time simulated, not seconds on the clock, so a score is the same however
  // busy the machine is. About 50 game seconds simulate in one real second, so a budget of 60 is about a
  // minute on an idle machine. Checked inside each hop's search as well as between hops.
  const SIM_PER_SECOND=50;let simulated=0,simLimit=Infinity;
  const realAdvance=EscapeAdventure.prototype.advance;let counting=false;
    EscapeAdventure.prototype.advance=function(seconds,input){if(counting)simulated+=seconds;return realAdvance.call(this,seconds,input);};
  const spent=()=>simulated>simLimit;
  const tile=p=>[Math.floor(p.x),Math.floor(p.y)];
  const calm=g=>!g.hunters.some(h=>['chase','windup','charge','rear','strike','dive','pounce','lunge','swoop'].includes(h.state));

  // Switches, levers and plates Sally can press for a closed door (never one that slams a door shut,
  // and not a heavy plate: that wants a beetle's weight). A trigger whose door opens the way to the
  // key, the hatch or another trigger comes first: that is the "find the switch to carry on" step.
  function triggers(g,reach){
    const out=[],shut=new Set();
    for(const gate of g.gates)if(gate.shut)for(const p of [...(gate.switch?[gate.switch]:[]),...gate.plates,...(gate.levers||[])])shut.add(Math.floor(p.x)+','+Math.floor(p.y));
    g.gates.forEach((gate,i)=>{if(gate.open||gate.sealed||gate.shut||gate.heavy)return;
      for(const p of [...(gate.switch?[gate.switch]:[]),...(gate.heavy?[]:gate.plates),...(gate.levers||[])])
        if(!shut.has(Math.floor(p.x)+','+Math.floor(p.y))&&reach(p))out.push({x:p.x,y:p.y,what:'trigger',gate:i,timed:Boolean(gate.duration)});});
    if(!out.length)return out;
    // What each door would open up: flip its tiles open for a moment and see what becomes reachable.
    // Doors open in a chain through a level, so another door's switch counts as opened up too.
    const others=i=>g.gates.flatMap((gate,j)=>j===i||gate.open||gate.sealed||gate.shut||gate.heavy?[]:[...(gate.switch?[gate.switch]:[]),...gate.plates,...(gate.levers||[])]);
    const wants=i=>[...(g.hasKey?[]:[g.key]),g.exit,...g.loot.filter(l=>!l.taken),...others(i)];
    const score=t=>{const gate=g.gates[t.gate],old=gate.tiles.map(([x,y])=>g.grid[y][x]);
      for(const [x,y] of gate.tiles)g.grid[y][x]=gate.bridge?'W':'g';
      const list=wants(t.gate),n=list.filter(w=>!reach(w)&&g.route(g.player,w).length>0).length*3+(list.slice(0,g.hasKey?1:2).some(w=>!reach(w)&&g.route(g.player,w).length>0)?10:0);
      gate.tiles.forEach(([x,y],k)=>{g.grid[y][x]=old[k];});return n;};
    for(const t of out)t.opens=score(t);
    // If no door visibly opens anything, try them all anyway, nearest first: some open the way later.
    const near=(a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y);
    const useful=out.filter(t=>t.opens>0);return useful.length?useful.sort((a,b)=>b.opens-a.opens||near(a,b)):out.sort(near);
  }
  // What to fetch next, in the order a player would think of it: the hatch once it opens, the key,
  // and treasure only when the hatch wants more or nothing else can be reached (it may open the way).
  // When the key or the hatch is behind a closed door, the switch that opens it comes first.
  function goals(g){
    const reach=t=>g.route(g.player,t).length>0||Math.hypot(t.x-g.player.x,t.y-g.player.y)<.5;
    // Dashing through an open timed door comes first; the usual goals stay as a fallback.
    const r=rush(g),first=r?[r]:[];
    const blocked=(!g.hasKey&&!reach(g.key))||(g.exitUnlocked()&&!reach(g.exit))||(g.hasKey&&!reach(g.exit));
    if(blocked){const t=triggers(g,reach);if(t.length)return [...first,...t,...goalsOpen(g,reach)];
      // Only a beetle's weight opens the way: wait somewhere safe until its heavy plate lifts the door.
      const heavy=g.gates.findIndex(gate=>!gate.open&&!gate.sealed&&!gate.shut&&(gate.heavy||gate.heavyPlates?.length));
      if(heavy>=0)return [...first,{x:g.player.x,y:g.player.y,what:'await',gate:heavy},...goalsOpen(g,reach)];}
    return [...first,...goalsOpen(g,reach)];
  }
  // A timed door is open (a plate just pressed, or a beetle on its heavy plate): dash straight through
  // it, no stopping at cover, to the first tile past it on the way to the key, the hatch or a switch.
  function rush(g){
    const open=g.gates.filter(gate=>gate.duration&&gate.open&&!gate.sealed);if(!open.length)return null;
    const tiles=new Set(open.flatMap(gate=>gate.tiles.map(([x,y])=>x+','+y)));
    const wants=[...(g.hasKey?[]:[g.key]),...(g.exitUnlocked()||g.hasKey?[g.exit]:[]),...g.gates.filter(gate=>!gate.open&&!gate.sealed&&!gate.shut).flatMap(gate=>[...(gate.switch?[gate.switch]:[]),...(gate.heavy?[]:gate.plates),...(gate.levers||[])]),...(g.treasure<g.requiredTreasure?g.loot.filter(l=>!l.taken):[])];
    // Only when nothing worth having is left on this side: otherwise Sally would pace back and forth
    // through a door whose plates re-open it, fetching one thing from each side in turn.
    const shut=open.flatMap(gate=>gate.tiles.map(([x,y])=>[x,y,g.grid[y][x]]));
    for(const [x,y] of shut)g.grid[y][x]='#';
    const here=wants.some(w=>g.route(g.player,w).length>0);
    for(const [x,y,c] of shut)g.grid[y][x]=c;
    if(here)return null;
    for(const w of wants){const path=g.route(g.player,w);let last=-1;path.forEach((p,i)=>{if(tiles.has(Math.floor(p.x)+','+Math.floor(p.y)))last=i;});
      if(last>=0)return {...(path[last+1]||w),what:'rush'};}
    return null;
  }
  function goalsOpen(g,reach){
    if(g.exitUnlocked()&&reach(g.exit))return [{x:g.exit.x,y:g.exit.y,what:'hatch'}];
    const out=[],loot=g.loot.filter(l=>!l.taken&&reach(l)).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y)).map(l=>({x:l.x,y:l.y,what:'treasure'}));
    if(!g.hasKey&&reach(g.key))out.push({x:g.key.x,y:g.key.y,what:'key'});
    if(g.treasure<g.requiredTreasure||!out.length)out.push(...loot);
    // With treasure still owed, the nearest piece comes before a far key.
    if(g.treasure<g.requiredTreasure&&out[0]?.what==='key'&&loot[0]&&Math.hypot(loot[0].x-g.player.x,loot[0].y-g.player.y)<Math.hypot(g.key.x-g.player.x,g.key.y-g.player.y))out.unshift(out.splice(out.indexOf(out.find(o=>o.what==='treasure')),1)[0]);
    return out;
  }
  // The tongue reaches a key, treasure, switch or lever up to three tiles off in a straight line, so
  // the item can be had from a spot along its row or column instead of walking onto it: further off
  // first, then nearer Sally. Each spot is a goal of its own; arriving there, Sally faces the item and flicks.
  // The key is always worth a try, even where no path reaches it on foot: that is often the point.
  function tongueGoals(g,goal){
    if(!g.tongues)return [];
    const items=[...(g.hasKey?[]:[{x:g.key.x,y:g.key.y,what:'key'}]),...(goal&&goal.what!=='key'&&['treasure','trigger'].includes(goal.what)&&(goal.what!=='trigger'||g.gates[goal.gate]?.switch||g.gates[goal.gate]?.levers?.length)?[goal]:[])];
    return items.flatMap(item=>tongueSpots(g,item)).slice(0,4);
  }
  function tongueSpots(g,goal){
    const [tx,ty]=tile(goal),out=[];
    for(const [fx,fy] of [[1,0],[-1,0],[0,1],[0,-1]])for(let k=Math.floor(g.tongueRange);k>=2;k--){
      const x=tx-fx*k,y=ty-fy*k,spot={x:x+.5,y:y+.5};
      if(!g.actorFloor(x,y,null)||!g.clear(spot,goal,true)||!g.route(g.player,spot).length)continue;
      out.push({...spot,what:'tongue',face:[fx,fy],item:goal,k});
    }
    return out.sort((a,b)=>b.k-a.k||Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y)).slice(0,3);
  }
  // The quickest way rather than the shortest: swimming is slow, so water costs more than land and
  // the path hops from island to island the way a player would.
  // Where creatures are or walk their rounds: tiles near a hunter, or near the line of its patrol, cost
  // extra, so the route the planner picks goes the long way round a guarded stretch when there is one.
  function dangerCosts(g){
    const out=new Map(),mark=(px,py)=>{for(let y=Math.floor(py-2.5);y<=py+2.5;y++)for(let x=Math.floor(px-2.5);x<=px+2.5;x++){const d=Math.hypot(x+.5-px,y+.5-py),c=d<1.5?6:d<2.5?3:0;if(c>(out.get(y*g.width+x)||0))out.set(y*g.width+x,c);}};
    for(const h of g.hunters){if(h.eaten)continue;mark(h.x,h.y);const pts=h.patrol||[];
      for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/.5);for(let k=0;k<=n;k++)mark(a.x+(b.x-a.x)*k/Math.max(1,n),a.y+(b.y-a.y)*k/Math.max(1,n));}}
    return out;
  }
  function costPath(g,from,to,danger=null){
    const [sx,sy]=tile(from),[tx,ty]=tile(to),key=(x,y)=>y*g.width+x,dist=new Map([[key(sx,sy),0]]),prev=new Map(),open=[[0,sx,sy]];
    while(open.length){let b=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[b][0])b=i;const [d,x,y]=open.splice(b,1)[0];if(d>dist.get(key(x,y)))continue;
      if(x===tx&&y===ty){const out=[];let k=key(x,y);while(k!==undefined){out.unshift({x:k%g.width+.5,y:Math.floor(k/g.width)+.5});k=prev.get(k);}out.shift();return out;}
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!g.actorFloor(nx,ny,null))continue;const nd=d+(g.grid[ny][nx]==='U'?2.5:1)+(danger?.get(ny*g.width+nx)||0),k=key(nx,ny);if(nd<(dist.get(k)??Infinity)){dist.set(k,nd);prev.set(k,key(x,y));open.push([nd,nx,ny]);}}}
    return [];
  }
  // The hops toward a goal: every piece of cover the path passes beside becomes a resting place.
  // mode 0: the plain quickest way; 1: the long way round guarded stretches; 2: that, with stops across open ground.
  function hops(g,goal,mode=0){const stops=mode>=2;
    if(goal.what==='tongue'){const out=hops(g,{...goal,what:'spot'});out[out.length-1]={...out[out.length-1],tongue:goal};return out;}
    if(goal.what==='rush'||goal.what==='await')return [{...goal,rush:goal.what==='rush',await:goal.what==='await'}];
    const danger=mode?dangerCosts(g):null,path=costPath(g,g.player,goal,danger);if(!path.length)return [{x:goal.x,y:goal.y,hatch:goal.what==='hatch'}];
    const out=[],seen=new Set([Math.floor(g.player.x)+','+Math.floor(g.player.y)]);
    path.forEach((p,i)=>{
      for(const [dx,dy] of NEAR){const x=Math.floor(p.x)+dx,y=Math.floor(p.y)+dy,t=g.grid[y]?.[x];
        // A hiding place a creature is sitting in (an owl's perch, a snake coiled in the leaves) is no rest.
        if((t==='L'||t==='N')&&!seen.has(x+','+y)&&i<path.length-1&&!g.hunters.some(h=>!h.eaten&&Math.hypot(h.x-x-.5,h.y-y-.5)<1.3)){seen.add(x+','+y);
          // Only cover that brings Sally nearer the goal; never a step back.
          const left=costPath(g,{x:x+.5,y:y+.5},goal,danger).length;if(left<path.length-1)out.push({x:x+.5,y:y+.5,cover:true,left});}}
    });
    // Climbing out of the water onto an island is a rest too: fish cannot follow.
    path.forEach((p,i)=>{const [x,y]=tile(p),prev=path[i-1]&&tile(path[i-1]);if(i<path.length-1&&prev&&g.grid[prev[1]][prev[0]]==='U'&&g.grid[y][x]!=='U'&&!seen.has(x+','+y)){seen.add(x+','+y);out.push({x:x+.5,y:y+.5,cover:true,left:path.length-1-i});}});
    // Where the safer way differs from the engine's shortest one, its corners become waypoints too, so
    // Sally actually takes the long way round instead of the short way between hiding places.
    if(mode&&g.route(g.player,goal).length<path.length-1)path.forEach((p,i)=>{const a=path[i-1],b=path[i+1];if(!a||!b)return;
      if((p.x-a.x)*(b.y-p.y)-(p.y-a.y)*(b.x-p.x)!==0&&!out.some(o=>Math.hypot(o.x-p.x,o.y-p.y)<2))out.push({x:p.x,y:p.y,pass:true,left:path.length-1-i});});
    // A long dash across open ground gets stops every five tiles, so Sally can pause midway (and blend in,
    // with camouflage) instead of crossing a whole field in one go.
    const marks=stops?[...out.map(o=>o.left),0].sort((a,b)=>b-a):[];let from=path.length-1;
    for(const m of marks){for(let left=from-5;left>m+2;left-=5){const p=path[path.length-1-left];if(p)out.push({x:p.x,y:p.y,pass:true,open:true,left});}from=m;}
    out.sort((a,b)=>b.left-a.left);out.push({x:goal.x,y:goal.y,hatch:goal.what==='hatch'});return out;
  }
  // Walk to a spot along the engine's route, recording frames; false if caught on the way.
  function walk(g,rec,to,sprint){
    for(const pt of g.route(g.player,to)){if(!go(g,rec,{x:pt.x,y:pt.y},sprint))return false;if(g.status==='won')return true;}
    if(Math.hypot(to.x-g.player.x,to.y-g.player.y)>.15&&!go(g,rec,{x:to.x,y:to.y},sprint))return false;
    return !bad(g);
  }
  function hold(g,rec,t){for(let i=0;i<Math.round(t*120)&&g.status==='playing';i++){frame(g,rec,0,0,false);if(bad(g))return false;}return true;}
  // One hop: the shortest pause, then a walk (or a sprint), that arrives safe and unnoticed.
  function* windows(state,to,tools=true){
    // Pauses that end unnoticed come first; ones that leave a hunter alerted are kept for later,
    // since slipping in and out of a guarded spot can still work.
    const noticed=[];
    // Waiting for a beetle: hold still here until its plate lifts the door (up to 20 s).
    if(to.await){const g=clone(state.g),rec=state.rec.map(c=>({...c}));
      for(let t=0;t<20&&!g.gates[to.gate].open;t+=.25)if(!hold(g,rec,.25))return;
      if(g.gates[to.gate].open)yield {g,rec,w:0,sprint:false};return;}
    // Through an open timed door: go now, sprinting first; being past it is what counts.
    if(to.rush){for(const sprint of [true,false]){const g=clone(state.g),rec=state.rec.map(c=>({...c}));if(walk(g,rec,to,sprint))yield {g,rec,w:0,sprint};}return;}
    // One try: an optional move first (a pebble), then a wait, then the walk or sprint to the hop.
    // Where plain tries came to grief: a pebble thrown from just short of there is the targeted fix.
    const caughtAt=[];
    function* attempt(w,sprint,before){
      if(spent())return;
      const g=clone(state.g),rec=state.rec.map(c=>({...c}));
      if(before&&!before(g,rec))return;
      if(!hold(g,rec,w))return;
      if(!walk(g,rec,to,sprint)){if(!before&&w===0)caughtAt.push({x:g.player.x,y:g.player.y});return;}
      // At a tongue spot: face the item, flick, and wait for the tongue to bring it in.
      if(to.tongue){const [fx,fy]=to.tongue.face;frame(g,rec,fx,fy,false);if(bad(g)||!g.useTongue())return;rec.push({kind:'tongue'});
        for(let i=0;i<120&&g.tongue&&g.status==='playing';i++){frame(g,rec,0,0,false);if(bad(g))return;}}
      // The hatch counts only if Sally gets through it.
      if(to.hatch){hold(g,rec,1.5);if(g.status==='won')yield {g,rec,w,sprint};return;}
      if(to.cover||calm(g)||g.status==='won')yield {g,rec,w,sprint};else if(noticed.length<3)noticed.push({g,rec,w,sprint});
    }
    let found=0;
    for(const w of to.pass?[0,.5,1]:WAITS)for(const sprint of [false,true])for(const r of attempt(w,sprint)){found++;yield r;}
    // Camouflage, when no plain wait works: where Sally stands in the open, blend in and keep still while a
    // creature goes by, then go.
    if(tools&&!found&&state.g.camos>0&&state.g.grid[Math.floor(state.g.player.y)]?.[Math.floor(state.g.player.x)]!=='L'){
      const camo=(g,rec)=>{if(!g.camouflage())return false;rec.push({kind:'camo'});return !bad(g);};
      for(const w of [1,2,3,4])for(const sprint of [false,true])for(const r of attempt(w,sprint,camo)){found++;yield r;}
    }
    // Nothing gets through by waiting: throw a pebble to pull a creature away, then go. Sally faces
    // one way (a single frame of input) and tosses it up to three tiles that way; throws away from
    // where she is heading come first, so the creature is drawn off the path, not onto it.
    if(tools&&!found&&state.g.decoys>0){
      const dx=to.x-state.g.player.x,dy=to.y-state.g.player.y;
      const dirs=[[1,0],[-1,0],[0,1],[0,-1]].sort((a,b)=>(a[0]*dx+a[1]*dy)-(b[0]*dx+b[1]*dy));
      for(const [fx,fy] of dirs){
        const toss=(g,rec)=>{frame(g,rec,fx,fy,false);if(bad(g)||!g.throwDecoy())return false;rec.push({kind:'pebble'});return !bad(g);};
        for(const w of TOSS_WAITS)for(const sprint of [false,true])yield* attempt(w,sprint,toss);
      }
      // Still nothing: walk to a point one to three tiles short of where Sally was caught, throw from
      // there (each way, away from the hop first), wait for the creature to go and look, then go on.
      const path=state.g.route(state.g.player,to),mids=[];
      for(const c of caughtAt){const i=path.findIndex(p=>Math.hypot(p.x-c.x,p.y-c.y)<.75);if(i<0)continue;
        for(const back of [1,2,3]){const m=path[i-back];if(m&&!mids.some(q=>q.x===m.x&&q.y===m.y))mids.push(m);}}
      for(const mid of mids.slice(0,3))for(const [fx,fy] of dirs){
        const toss=(g,rec)=>{if(!walk(g,rec,mid,false))return false;frame(g,rec,fx,fy,false);if(bad(g)||!g.throwDecoy())return false;rec.push({kind:'pebble'});return !bad(g);};
        for(const w of MID_WAITS)for(const sprint of [false,true])yield* attempt(w,sprint,toss);
      }
    }
    yield* noticed;
  }
  function plan(options,{budget=60000,branch=3}={}){
    const start={g:new EscapeAdventure(options),rec:[]},t0=Date.now();simulated=0;simLimit=budget/1000*SIM_PER_SECOND;let best=start,tries=0;
    // Depth-first over hops, keeping a couple of windows per hop for backtracking.
    function solve(state,depth){
      if(state.g.status==='won')return state;if(spent()||depth>200)return null;

      if(state.g.elapsed>best.g.elapsed)best=state;
      const top=goals(state.g).slice(0,2),all=[...top,...tongueGoals(state.g,top[0])],moved=new Set(),tried=new Set();
      // Every goal gets the plain route first; only then the long way round, then that with stops across
      // open ground. Each new kind of move is a fallback, so it never spoils or delays a plan that worked.
      // Along a route, the next hiding place first; if nothing gets there safely, the one after (twice at most).
      // The ladder, cheapest first: plain route with waits only; the long way round; then each with pebbles
      // and camo; then the long way with stops across open ground.
      for(const [mode,tools] of [[0,false],[1,false],[1,true],[0,true],[2,true]])for(const goal of all){if(moved.has(goal))continue;
        for(const to of hops(state.g,goal,mode).slice(0,3)){let n=0;
          // The same next stop often serves several goals and rungs: each is searched once from here.
          const key=to.x+','+to.y+'|'+tools+'|'+(to.tongue?to.tongue.item.x+','+to.tongue.item.y:'')+(to.rush?'r':'')+(to.await?'a':'')+(to.hatch?'h':'');
          if(tried.has(key))continue;tried.add(key);
          if(env.DEBUG)log(' '.repeat(depth)+'t'+state.g.elapsed.toFixed(1),'at',state.g.player.x.toFixed(1)+','+state.g.player.y.toFixed(1),goal.what,goal.x+','+goal.y,'hop',to.x+','+to.y,'mode',mode);
          for(const next of windows(state,to,tools)){tries++;
            const done=solve(next,depth+1);if(done)return done;if(++n>=branch)break;}
          if(n){moved.add(goal);break;}}
      }
      return null;
    }
    counting=true;let done;try{done=solve(start,0);}finally{counting=false;}
    return {won:Boolean(done),commands:(done||best).rec,tries,seconds:(Date.now()-t0)/1000,reached:(done||best).g.elapsed};
  }
  const api={plan,goals,hops,triggers,clone,push,bad,frame,go};
  root.EscapePlanner=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
