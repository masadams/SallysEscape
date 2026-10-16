const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCatalog,escapeGridFor}=require('../public/escape-levels.js');
const {EscapeProgress}=require('../public/escape-progress.js');
function advance(g,seconds,input={}){for(let n=0;n<Math.ceil(seconds*120);n++)g.advance(1/120,input);}
const result=(levelId,extra={})=>({status:'won',levelId,challengeId:null,totalTreasure:10,treasure:7,stars:3,time:8,...extra});
function storage(){const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};}

test('every route has closed borders; static gate puzzles have permanently openable walking routes',()=>{
 assert.ok(EscapeCatalog.levels.length>=78);assert.equal(EscapeCatalog.challenges.length,21);
 for(const level of EscapeCatalog.levels){
  const g=new EscapeAdventure({levelId:level.id}),grid=escapeGridFor(level);
  assert.ok(grid[0].every(c=>c==='#')&&grid.at(-1).every(c=>c==='#'));assert.ok(grid.every(row=>row[0]==='#'&&row.at(-1)==='#'));
  if(level.reactions||level.gates?.some(g=>g.duration))continue; // Stateful reversals have a separate walking-state graph check.
  while(g.gates.some(gate=>!gate.open)){const gate=g.gates.find(gate=>!gate.open&&g.route(g.player,gate.switch).length);assert.ok(gate,'each puzzle has a reachable next switch');Object.assign(g.player,gate.switch);g.activateSwitches();}
  // A cracked wall may stand in the way only when the route can be opened twice over:
  // two burrows (in and back out) or a beetle that can smash it.
  const cracked=g.grid.map(row=>row.map(c=>c==='B'?'.':c)),smashable=level.burrows>=2||level.guards.some(h=>h.kind==='beetle'),open=new EscapeAdventure({levelId:level.id});open.grid=cracked;open.gates=g.gates;
  // Bounce caps carry Sally across gaps, so they count as links when looking for a walking route.
  const capReach=(()=>{if(!g.caps.length)return null;const start=g.tileKey(g.player),seen=new Set([start]),q=[start];
    while(q.length){const [x,y]=q.shift().split(',').map(Number);const next=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([a,b])=>g.fits({x:a+.5,y:b+.5})).map(t=>t.join());for(const c of g.caps)if(c.key===x+','+y)next.push(c.to.join());for(const k of next)if(!seen.has(k)){seen.add(k);q.push(k);}}return seen;})();
  const fliers=g.hunters.filter(h=>['dragonfly','bat'].includes(h.kind));
  for(const p of [g.key,g.exit,...g.loot,...g.hunters.filter(h=>!fliers.includes(h)),...g.hunters.filter(h=>!fliers.includes(h)).flatMap(h=>h.patrol)]){
   assert.ok(g.fits(p),'spawn and goals fit inside floor');
   const walkable=Math.hypot(g.player.x-p.x,g.player.y-p.y)<.01||g.route(g.player,p).length>0||Boolean(capReach?.has(Math.floor(p.x)+','+Math.floor(p.y)));
   // A tongue grab reaches three tiles in a straight, clear line from somewhere Sally can stand.
   const grabbable=level.tongues>0&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>[1,2,3].some(d=>{const from={x:Math.floor(p.x)+.5+dx*d,y:Math.floor(p.y)+.5+dy*d};return g.fits(from)&&g.route(g.player,from).length>0&&g.clear(from,p,true);}));
   assert.ok(walkable||grabbable||smashable&&open.route(g.player,p).length>0,'no mandatory burrow or unreachable treasure');
  }
  assert.equal(g.loot.reduce((n,item)=>n+item.value,0),10);
  // Dragonflies and bats fly their loops, over drops and gaps.
  for(const h of g.hunters)if(h.patrol.length>1&&!['dragonfly','bat'].includes(h.kind))for(let i=0;i<h.patrol.length;i++)assert.ok(g.route(h.patrol[i],h.patrol[(i+1)%h.patrol.length]).length);
 }
});
test('each route resets its own resources and does not mutate shared definitions',()=>{
 const a=new EscapeAdventure({levelId:'quiet-vault'});assert.equal(a.burrows,1);a.grid[2][6]='.';a.decoys=0;a.loot[0].taken=true;
 const b=new EscapeAdventure({levelId:'quiet-vault'});assert.equal(b.grid[2][6],'B');assert.equal(b.decoys,1);assert.equal(b.loot[0].taken,false);
 assert.throws(()=>new EscapeAdventure({levelId:'unknown'}));assert.throws(()=>new EscapeAdventure({challengeId:'unknown'}));assert.ok(Object.isFrozen(EscapeCatalog.levels[0].rooms));
});
test('two guards keep independent perception, paths and animation poses',()=>{
 const g=new EscapeAdventure({levelId:'twin-watch'}),first=g.hunters[0],second=g.hunters[1];
 assert.equal(g.motion.snakes.length,2);assert.notEqual(g.motion.snakes[0].trail,g.motion.snakes[1].trail);
 g.player.x=14.5;g.player.y=5.5;second.facing=Math.PI;
 const before=JSON.stringify(first);g.updateHunter(.1,second);
 assert.equal(second.state,'alert');assert.equal(JSON.stringify(first),before);assert.deepEqual(second.lastKnown,{x:14.5,y:5.5});
});
test('capture by the second guard ends the attempt',()=>{
 const g=new EscapeAdventure({levelId:'twin-watch'});Object.assign(g.hunters[1],{x:g.player.x,y:g.player.y});advance(g,.02);
 assert.equal(g.status,'caught');assert.equal(g.result.levelId,'twin-watch');
});
test('walking on gravel is audible, stopping is quiet, and sprint hearing remains stronger',()=>{
 const g=new EscapeAdventure({levelId:'crumbling-hall'});Object.assign(g.player,{x:6.4,y:11.5});Object.assign(g.hunter,{x:8.5,y:11.5,facing:0});
 g.advance(1/120,{x:1});assert.equal(g.player.noisy,true);assert.equal(g.player.sprinting,false);assert.equal(g.hunter.reason,'heard');
 g.advance(1/120);assert.equal(g.player.noisy,false);
});
test('Ghost Run allows a warning but ends when a guard gives chase',()=>{
 const g=new EscapeAdventure({challengeId:'ghost-run'});Object.assign(g.player,{x:8.5,y:7.5});Object.assign(g.hunter,{x:11.5,y:8.5,facing:Math.PI});g.hunters[1].x=11.5;g.hunters[1].y=1.5;
 advance(g,.3);assert.equal(g.status,'playing');assert.equal(g.hunter.state,'alert');advance(g,.6);
 assert.equal(g.status,'failed');assert.equal(g.alarms,1);assert.equal(g.result.stars,0);
});
test('Treasure Sweep keeps the hatch locked until both the key and all treasure are present',()=>{
 const g=new EscapeAdventure({challengeId:'treasure-sweep'});Object.assign(g.player,g.exit);g.hasKey=true;g.treasure=9;
 advance(g,.8);assert.equal(g.status,'playing');assert.equal(g.exitUnlocked(),false);assert.equal(g.exitHold,0);
 g.treasure=10;advance(g,.6);assert.equal(g.status,'won');assert.equal(g.result.challengeId,'treasure-sweep');
});
test('Quick Getaway freezes its deadline when paused and expires before a late hatch win',()=>{
 const g=new EscapeAdventure({challengeId:'quick-getaway'});g.elapsed=44.99;g.paused=true;g.advance(30);assert.equal(g.elapsed,44.99);
 g.paused=false;advance(g,.02);assert.equal(g.status,'failed');assert.equal(g.result.stars,0);
 const late=new EscapeAdventure({challengeId:'quick-getaway'});late.elapsed=44.999;Object.assign(late.player,late.exit);late.hasKey=true;late.exitHold=.549;
 late.advance(1/120);assert.equal(late.status,'failed');
});
test('medals reward escape, a substantial treasure haul and avoiding a chase',()=>{
 for(const [treasure,alarms,stars] of [[0,1,1],[6,1,2],[0,0,2],[6,0,3]]){
  const g=new EscapeAdventure();g.elapsed=8;g.treasure=treasure;g.alarms=alarms;g.finish('won','Escaped');assert.equal(g.result.stars,stars);assert.ok(Object.isFrozen(g.result));
 }
});
test('winning unlocks the next route and retains best medals, treasure and time on reload',()=>{
 const s=storage(),p=new EscapeProgress(s);assert.equal(p.unlocked('quiet-vault'),true);assert.equal(p.unlocked('leafy-crossroads'),true);
 assert.equal(p.record(result('quiet-vault')),true);assert.equal(p.unlocked('leafy-crossroads'),true);
 p.record(result('quiet-vault',{time:12,stars:1,treasure:0}));const reload=new EscapeProgress(s);
 assert.deepEqual(reload.data.levels['quiet-vault'],{cleared:true,bestTime:8,stars:3,treasure:7,revision:2,firstTry:true});
});
test('failed, locked, unknown and malformed results cannot unlock routes',()=>{
 const p=new EscapeProgress(storage());
 for(const r of [result('quiet-vault',{status:'caught'}),result('quiet-vault',{status:'failed'}),result('moonlit-escape'),result('unknown'),result('quiet-vault',{time:NaN}),result('quiet-vault',{totalTreasure:99}),result('quiet-vault',{stars:99})])assert.equal(p.record(r),false);
 assert.deepEqual(p.data.levels,{});
});
test('challenge badges unlock after their route and never overwrite route medals',()=>{
 const s=storage(),p=new EscapeProgress(s);assert.equal(p.challengeUnlocked('ghost-run'),false);
 assert.equal(p.record(result('leafy-crossroads',{challengeId:'ghost-run'})),false);
 p.record(result('quiet-vault'));p.record(result('leafy-crossroads'));const before={...p.data.levels['leafy-crossroads']};
 assert.equal(p.challengeUnlocked('ghost-run'),true);assert.equal(p.record(result('leafy-crossroads',{challengeId:'ghost-run',time:6,treasure:0})),true);
 assert.deepEqual(p.data.levels['leafy-crossroads'],before);assert.equal(new EscapeProgress(s).data.challenges['ghost-run'].bestTime,6);
 assert.equal(p.record(result('quiet-vault',{challengeId:'ghost-run'})),false);
});
test('corrupt saves and unavailable storage are recoverable without losing session progress',()=>{
 const s=storage();s.setItem('sallys-escape-progress-v1','broken JSON');const p=new EscapeProgress(s);assert.equal(p.unlocked('quiet-vault'),true);assert.equal(p.persistent,true);p.record(result('quiet-vault'));assert.equal(p.persistent,true);
 const unavailable=new EscapeProgress({getItem(){throw new Error('disabled');},setItem(){throw new Error('disabled');}});
 assert.equal(unavailable.persistent,false);assert.equal(unavailable.record(result('quiet-vault')),true);assert.equal(unavailable.unlocked('leafy-crossroads'),true);
});
test('separate tabs merge completed routes and never downgrade saved best results',()=>{
 const s=storage(),a=new EscapeProgress(s),b=new EscapeProgress(s);
 a.record(result('quiet-vault'));assert.equal(b.record(result('leafy-crossroads',{time:15,stars:1,treasure:1})),true);
 b.record(result('quiet-vault',{time:12,stars:1,treasure:1}));a.record(result('leafy-crossroads',{time:9,stars:3,treasure:10}));
 b.record(result('crumbling-hall'));const saved=new EscapeProgress(s);
 assert.deepEqual(saved.data.levels['quiet-vault'],{cleared:true,bestTime:8,stars:3,treasure:7,revision:2,firstTry:true});
 assert.deepEqual(saved.data.levels['leafy-crossroads'],{cleared:true,bestTime:9,stars:3,treasure:10,revision:2,firstTry:true});
 assert.equal(saved.unlocked('twin-watch'),true);
});
