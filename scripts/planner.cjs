// A route planner that needs no hints: it plays the way a careful person does. It picks the next
// goal (treasure until there is enough or it opens the way, then the key, then the hatch), breaks
// the walk there into hops between cover (leaves and nooks near the path), and at each piece of
// cover waits for the shortest pause after which the next hop gets through. Where no pause works
// it backs up and tries a later window from the hop before. The route it finds is one a player
// could follow: hide, watch, go.
//
//   node scripts/planner.cjs <level-id> [--json]      plan one escape
//   node scripts/planner.cjs --all [--from 1]          report which escapes it can plan
const path=require('path');
const {EscapeAdventure}=require(path.join(__dirname,'../public/escape-engine.js'));
const {EscapeCatalog}=require(path.join(__dirname,'../public/escape-levels.js'));
const {clone,go,frame,bad,verify,optionsFor}=require(path.join(__dirname,'route-solver.cjs'));

// Cover counts as on the way when it is within two steps of the path.
const NEAR=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dy)<=2)NEAR.push([dx,dy]);
NEAR.sort((a,b)=>Math.abs(a[0])+Math.abs(a[1])-Math.abs(b[0])-Math.abs(b[1]));
const WAITS=[0,.25,.5,.75,1,1.5,2,2.5,3,4,5,6,8];
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
  const blocked=(!g.hasKey&&!reach(g.key))||(g.exitUnlocked()&&!reach(g.exit))||(g.hasKey&&!reach(g.exit));
  if(blocked){const t=triggers(g,reach);if(t.length)return [...t,...goalsOpen(g,reach)];}
  return goalsOpen(g,reach);
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
// The quickest way rather than the shortest: swimming is slow, so water costs more than land and
// the path hops from island to island the way a player would.
function costPath(g,from,to){
  const [sx,sy]=tile(from),[tx,ty]=tile(to),key=(x,y)=>y*g.width+x,dist=new Map([[key(sx,sy),0]]),prev=new Map(),open=[[0,sx,sy]];
  while(open.length){let b=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[b][0])b=i;const [d,x,y]=open.splice(b,1)[0];if(d>dist.get(key(x,y)))continue;
    if(x===tx&&y===ty){const out=[];let k=key(x,y);while(k!==undefined){out.unshift({x:k%g.width+.5,y:Math.floor(k/g.width)+.5});k=prev.get(k);}out.shift();return out;}
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(!g.actorFloor(nx,ny,null))continue;const nd=d+(g.grid[ny][nx]==='U'?2.5:1),k=key(nx,ny);if(nd<(dist.get(k)??Infinity)){dist.set(k,nd);prev.set(k,key(x,y));open.push([nd,nx,ny]);}}}
  return [];
}
// The hops toward a goal: every piece of cover the path passes beside becomes a resting place.
function hops(g,goal){
  const path=costPath(g,g.player,goal);if(!path.length)return [{x:goal.x,y:goal.y,hatch:goal.what==='hatch'}];
  const out=[],seen=new Set([Math.floor(g.player.x)+','+Math.floor(g.player.y)]);
  path.forEach((p,i)=>{
    for(const [dx,dy] of NEAR){const x=Math.floor(p.x)+dx,y=Math.floor(p.y)+dy,t=g.grid[y]?.[x];
      if((t==='L'||t==='N')&&!seen.has(x+','+y)&&i<path.length-1){seen.add(x+','+y);
        // Only cover that brings Sally nearer the goal; never a step back.
        const left=costPath(g,{x:x+.5,y:y+.5},goal).length;if(left<path.length-1)out.push({x:x+.5,y:y+.5,cover:true,left});}}
  });
  // Climbing out of the water onto an island is a rest too: fish cannot follow.
  path.forEach((p,i)=>{const [x,y]=tile(p),prev=path[i-1]&&tile(path[i-1]);if(i<path.length-1&&prev&&g.grid[prev[1]][prev[0]]==='U'&&g.grid[y][x]!=='U'&&!seen.has(x+','+y)){seen.add(x+','+y);out.push({x:x+.5,y:y+.5,cover:true,left:path.length-1-i});}});
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
function* windows(state,to){
  // Pauses that end unnoticed come first; ones that leave a hunter alerted are kept for later,
  // since slipping in and out of a guarded spot can still work.
  const noticed=[];
  for(const w of WAITS)for(const sprint of [false,true]){
    const g=clone(state.g),rec=state.rec.map(c=>({...c}));
    if(!hold(g,rec,w)||!walk(g,rec,to,sprint))continue;
    // The hatch counts only if Sally gets through it.
    if(to.hatch){hold(g,rec,1.5);if(g.status==='won')yield {g,rec,w,sprint};continue;}
    if(to.cover||calm(g)||g.status==='won')yield {g,rec,w,sprint};else if(noticed.length<3)noticed.push({g,rec,w,sprint});
  }
  yield* noticed;
}
function plan(options,{budget=60000,branch=3}={}){
  const start={g:new EscapeAdventure(options),rec:[]},t0=Date.now();let best=start,tries=0;
  // Depth-first over hops, keeping a couple of windows per hop for backtracking.
  function solve(state,depth){
    if(state.g.status==='won')return state;if(Date.now()-t0>budget||depth>200)return null;
    if(state.g.elapsed>best.g.elapsed)best=state;
    for(const goal of goals(state.g).slice(0,2)){
      const route=hops(state.g,goal),to=route[0];let n=0;
      if(process.env.DEBUG)console.error(' '.repeat(depth)+'t'+state.g.elapsed.toFixed(1),'at',state.g.player.x.toFixed(1)+','+state.g.player.y.toFixed(1),goal.what,goal.x+','+goal.y,'hop',to.x+','+to.y);
      for(const next of windows(state,to)){tries++;
        const done=solve(next,depth+1);if(done)return done;if(++n>=branch)break;}
    }
    return null;
  }
  const done=solve(start,0);
  return {won:Boolean(done),commands:(done||best).rec,tries,seconds:(Date.now()-t0)/1000,reached:(done||best).g.elapsed};
}
module.exports={plan,goals,hops,triggers};

if(require.main===module){
  const args=process.argv.slice(2),flag=n=>args.includes('--'+n),val=(n,d)=>{const i=args.indexOf('--'+n);return i<0?d:args[i+1];};
  const ids=flag('all')?EscapeCatalog.levels.map(l=>l.id).slice(+val('from',1)-1):[args[0]];
  let wins=0;
  for(const id of ids){const options=optionsFor(id),r=plan(options,{budget:+val('budget',60)*1000}),ok=r.won&&verify(options,r.commands);wins+=ok;
    const n=EscapeCatalog.levels.findIndex(l=>l.id===id)+1;
    console.error(String(n).padStart(3),id.padEnd(22),ok?'PLANNED':'stuck  ',r.seconds.toFixed(1)+'s',r.tries+' tries',ok?'':'got to '+r.reached.toFixed(1)+'s');
    if(flag('json')&&ok)console.log(JSON.stringify({options,commands:r.commands}));}
  if(ids.length>1)console.error(wins+'/'+ids.length+' planned');
}
