// Level design linter. Two halves:
//  1. Fairness rules, checked straight from the level: the mistakes the planner kept tripping over
//     (a hunter on the only way out, treasure under a guard, a hunter by the start, a key with no
//     cover near it).
//  2. A difficulty report from each escape's recorded winning run: how long the run had to wait,
//     how close the hunters came, how many chases even the winning run set off. Late escapes that
//     score low here are probably too easy.
//
//   node scripts/lint-levels.cjs [--only id,id] [--from 79] [--rules] [--report] [--json out.json]
const path=require('path'),fs=require('fs');
const {EscapeAdventure}=require(path.join(__dirname,'../public/escape-engine.js'));
const {EscapeCatalog}=require(path.join(__dirname,'../public/escape-levels.js'));
const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage'};

// Hunters that stay on their post and strike whatever comes within reach.
const ROOTED={scorpion:1.8,cobra:2.4,crab:1.6,eel:1.5,mantis:1.5,flytrap:1.4,heron:2.5,toad:5,mimic:1.2,wasp:2,millipede:1};
// These strike whenever Sally is in reach: on the only way through, nothing gets past. The rest
// (a scorpion's tail, a toad's line, a heron's gaze, a pebble for the flytrap, an eel buried at low
// tide) leave a window.
const ALWAYS=new Set(['eel','crab','cobra','mantis']);
const FLYING=new Set(['owl','moth','dragonfly','bat','hawk','cloudray']);
const centre=([x,y])=>({x:x+.5,y:y+.5});

// Walkable tiles for Sally with every gate open, as a set of "x,y".
function walkable(g){const out=new Set();for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.actorFloor(x,y,null)||g.gates.some(gt=>gt.tiles.some(([a,b])=>a===x&&b===y)))out.add(x+','+y);return out;}
function reachable(open,from,blocked=new Set(),caps=[]){const seen=new Set([from]),q=[from];while(q.length){const k0=q.pop(),[x,y]=k0.split(',').map(Number);for(const c of caps)if(c.at.join()===k0&&!seen.has(c.to.join())){seen.add(c.to.join());q.push(c.to.join());}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(y+dy);if(open.has(k)&&!blocked.has(k)&&!seen.has(k)){seen.add(k);q.push(k);}}}return seen;}
const tileOf=p=>Math.floor(p.x)+','+Math.floor(p.y);

function rules(level,options){
  const g=new EscapeAdventure(options),open=walkable(g),start=tileOf(g.player),key=tileOf(g.key),exit=tileOf(g.exit),found=[];
  const warn=(rule,msg,level='error')=>found.push({rule,msg,level});
  const cover=new Set();for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if('LN'.includes(g.grid[y][x]))cover.add(x+','+y);
  const guards=level.guards||[];
  for(const h of guards){const kind=h.kind||'snake',post=centre(h.spawn),d=Math.hypot(post.x-g.player.x,post.y-g.player.y);
    if(!FLYING.has(kind)&&d<5)warn('near-start',kind+' at '+h.spawn+' is '+d.toFixed(1)+' tiles from the start');
    const reach=ROOTED[kind];if(!reach)continue;
    // Its strike zone, as tiles.
    const zone=new Set();for(const k of open){const [x,y]=k.split(',').map(Number);if(Math.hypot(x+.5-post.x,y+.5-post.y)<=reach)zone.add(k);}
    // A rooted hunter whose zone cuts the start off from the key or the hatch guards the only way.
    const around=reachable(open,start,zone,level.caps||[]);
    const severity=ALWAYS.has(kind)&&!(kind==='eel'&&g.tide)?'error':'note';
    if(!zone.has(key)&&!around.has(key))warn('only-way',kind+' at '+h.spawn+' guards the only way to the key',severity);
    else if(!zone.has(exit)&&!around.has(exit))warn('only-way',kind+' at '+h.spawn+' guards the only way to the hatch',severity);
    for(const [x,y,v] of level.loot)if(zone.has(x+','+y)&&Math.hypot(x+.5-post.x,y+.5-post.y)<1.2)warn('under-guard',v+' treasure at '+x+','+y+' sits on the '+kind+'’s post');
    if(zone.has(key))warn('under-guard','the key sits inside the '+kind+'’s reach',severity);}
  // Somewhere to hide within five steps of the key and of the hatch.
  const near=(target,steps)=>{const [tx,ty]=target.split(',').map(Number);let frontier=[target],seen=new Set(frontier);for(let s=0;s<steps;s++){const next=[];for(const k of frontier){const [x,y]=k.split(',').map(Number);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=(x+dx)+','+(y+dy);if(open.has(n)&&!seen.has(n)){seen.add(n);next.push(n);}}}frontier=next;}return [...seen].some(k=>cover.has(k));};
  if(!near(key,5))warn('no-cover','no leaves or nook within five steps of the key','note');
  if(!near(exit,5)&&guards.some(h=>Math.hypot(h.spawn[0]-g.exit.x,h.spawn[1]-g.exit.y)<7))warn('no-cover','no cover within five steps of a guarded hatch','note');
  // The hatch must be able to open: enough reachable treasure.
  const all=reachable(open,start,new Set(),level.caps||[]),total=level.loot.filter(([x,y])=>[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>[0,1,2,3].some(d=>all.has((x+dx*d)+','+(y+dy*d))))).reduce((n,l)=>n+l[2],0);
  if((level.requiredTreasure||0)>total)warn('treasure','the hatch wants '+level.requiredTreasure+' but only '+total+' can be reached on foot');
  return found;
}

// Replays the recorded winning run and measures it.
function measure(record){
  const g=new EscapeAdventure(record.options);let frames=0,still=0,close=Infinity,nearMiss=0,wasNear=false;
  const live=h=>!['under','buried','nest','lurk','shell','rooted','still','coiled','sleep','dormant'].includes(h.state);
  const sample=()=>{let d=Infinity;for(const h of g.hunters)if(live(h))d=Math.min(d,Math.hypot(h.x-g.player.x,h.y-g.player.y));close=Math.min(close,d);const n=d<1.6;if(n&&!wasNear)nearMiss++;wasNear=n;};
  for(const c of record.commands){if(c.kind!=='move'){g[ACT[c.kind]]?.();continue;}for(let i=0;i<c.frames;i++){g.advance(1/120,c);frames++;if(!c.x&&!c.y)still++;if(frames%6===0)sample();}}
  return {won:g.status==='won',time:+(frames/120).toFixed(1),waitShare:+(still/Math.max(1,frames)).toFixed(2),closest:+close.toFixed(2),nearMisses:nearMiss,chases:g.alarms||0,hunters:g.hunters.length,tools:record.commands.filter(c=>c.kind!=='move').length};
}
// One number to sort by: waiting, near misses, chases and tool use push it up; room to spare pulls it down.
const pressure=m=>+(m.waitShare*40+Math.min(m.nearMisses,12)*3+m.chases*4+m.tools*2+Math.max(0,2.5-m.closest)*6+m.hunters).toFixed(1);
module.exports={rules,measure,pressure};

if(require.main===module){
  const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i<0?d:process.argv[i+1];},flag=n=>process.argv.includes('--'+n);
  const only=arg('only',''),from=+arg('from',1),out=arg('json',''),doRules=flag('rules')||!flag('report'),doReport=flag('report')||!flag('rules');
  const fixtures=require(path.join(__dirname,'../tests/fixtures/escape-playthroughs.json'));
  const entries=[...EscapeCatalog.levels.map((l,i)=>({level:l,n:i+1,options:{levelId:l.id},id:l.id})),...(EscapeCatalog.hidden||[]).map(l=>({level:l,n:0,options:{hiddenId:l.id},id:'hidden:'+l.id}))]
    .filter(e=>only?only.split(',').includes(e.id)||only.split(',').includes(e.level.id):e.n===0||e.n>=from);
  const report=[];let problems=0;
  for(const e of entries){
    const row={id:e.id,escape:e.n,name:e.level.name};
    if(doRules){row.rules=rules(e.level,e.options);problems+=row.rules.length;}
    if(doReport){const rec=fixtures.find(r=>(r.options.levelId||'')===(e.options.levelId||'_')||(r.options.hiddenId||'')===(e.options.hiddenId||'_'));if(rec&&!rec.options.challengeId){row.run=measure(rec);row.pressure=pressure(row.run);}}
    report.push(row);
  }
  if(doRules){const all=report.flatMap(r=>r.rules.map(f=>({...f,r}))),show=flag('notes')?all:all.filter(f=>f.level==='error');
    for(const f of show)console.log((f.r.escape?String(f.r.escape).padStart(3):'  ★')+' '+f.r.id.padEnd(24)+' '+f.level.padEnd(6)+f.rule.padEnd(12)+f.msg);
    const errors=all.filter(f=>f.level==='error').length;console.log(errors+' fairness errors, '+(all.length-errors)+' notes'+(flag('notes')?'':' (--notes to list them)'));problems=errors;}
  if(doReport){console.log('\n  #  escape                   pressure  wait  closest  near-misses chases tools time');
    for(const r of report.filter(r=>r.run))console.log((r.escape?String(r.escape).padStart(3):'  ★')+'  '+r.name.slice(0,24).padEnd(24)+String(r.pressure).padStart(8)+String(Math.round(r.run.waitShare*100)+'%').padStart(6)+String(r.run.closest).padStart(9)+String(r.run.nearMisses).padStart(12)+String(r.run.chases).padStart(7)+String(r.run.tools).padStart(6)+String(r.run.time).padStart(6)+'s');}
  if(out)fs.writeFileSync(out,JSON.stringify(report,null,2));
  if(doRules&&problems&&flag('strict'))process.exit(1);
}
