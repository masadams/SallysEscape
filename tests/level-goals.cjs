const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js'),{escapeBuildCustom}=require('../public/escape-levels.js');
const {createPlanner}=require('../scripts/lib/level-goals.cjs'),Lab=require('../scripts/lib/level-lab.cjs'),CLI=require('../scripts/level-lab.cjs');
const level=(map,extra={})=>escapeBuildCustom({id:'goals-fixture',name:'Goals fixture',map,guards:[],...extra});

test('current geometry guides a detour around a door that only opens after the key',()=>{
  const options={level:level(['###########','#@G...K..X#','#.#.#####.#','#.#.......#','#.#.#####.#','#.........#','###########'],{gates:[{id:'shortcut',tiles:[[2,1]]}],reactions:[{id:'key-opens-shortcut',when:'key',open:['shortcut']}]})};
  const config={budget:8,width:1,seconds:30,frames:15000};
  assert.equal(Lab.solve(options,{...config,planning:false}).status,'unresolved');
  const result=Lab.solve(options,config);assert.equal(result.status,'solved');assert.equal(Lab.verifyArtifact(result.replay).won,true);
  assert.ok(result.search.expanded<=8);
});

test('a reachable pressure plate becomes a subgoal without hypothetically opening real gates',()=>{
  const options={level:level(['###########','#@..G..K.X#','#...#.....#','#...#.....#','###########'],{gates:[{id:'timed',tiles:[[4,1]],plates:[[2,3]],duration:2}]})};
  const g=new EscapeAdventure(options),plan=createPlanner(),before=JSON.stringify(g.grid);
  const objective=plan(g);assert.equal(objective.kind,'trigger');assert.equal(objective.gateId,'timed');assert.deepEqual(objective.target,{x:2.5,y:3.5});
  assert.equal(g.gates[0].open,false);assert.equal(JSON.stringify(g.grid),before);
  const result=Lab.solve(options,{budget:30,width:2,seconds:30});assert.equal(result.status,'solved');assert.equal(Lab.verifyArtifact(result.replay).won,true);
});

test('navigation cache follows changed geometry and rejects sealed or heavy-only dependencies',()=>{
  const options={level:level(['###########','#@..G..K.X#','#...#.....#','###########'],{gates:[{id:'switch',tiles:[[4,1]],switch:[2,2]}]})};
  const g=new EscapeAdventure(options),plan=createPlanner();assert.equal(plan(g).kind,'trigger');
  g.setGateOpen(g.gates[0],true);assert.equal(plan(g).kind,'key');
  g.setGateOpen(g.gates[0],false);g.gates[0].sealed=true;assert.equal(plan(g).kind,'unresolved-dependency');
  g.gates[0].sealed=false;g.gates[0].heavy=true;assert.equal(plan(g).kind,'unresolved-dependency');
});

test('required treasure becomes the next goal and diagnostics are explicitly labeled attempts',()=>{
  const g=new EscapeAdventure({level:level(['#########','#@.K1..X#','#########'],{requiredTreasure:1})});
  g.hasKey=true;const plan=createPlanner();assert.equal(plan(g).kind,'treasure');g.treasure=1;assert.equal(plan(g).kind,'exit');
  const result=Lab.solve({level:g.level},{frames:1,trace:true});assert.equal(result.status,'unresolved');assert.equal(result.attempt.kind,'diagnostic-attempt');assert.equal(result.replay,null);
  assert.deepEqual(CLI.parse(['solve','quiet-vault','--no-planning','--trace']).flags,{planning:false,trace:true});
});

test('terminal completion follows real geometry only after the exit unlocks',()=>{
  const options={level:level(['#########','#@..K..X#','#########'])};
  const choice={type:'route',waypoints:[{x:2.5,y:1.5},{x:3.5,y:1.5},{x:4.5,y:1.5},{x:5.5,y:1.5}],sprint:true};
  const ordinary=Lab.execute(new EscapeAdventure(options),choice,Lab.settings());assert.equal(ordinary.g.status,'playing');
  const finished=Lab.execute(new EscapeAdventure(options),{...choice,finishExit:true},Lab.settings());
  assert.equal(finished.g.status,'won');assert.equal(Lab.replay(options,finished.commands).won,true);
  const locked=Lab.execute(new EscapeAdventure(options),{...choice,waypoints:[{x:2.5,y:1.5}],finishExit:true},Lab.settings());
  assert.equal(locked.g.status,'playing');assert.equal(locked.g.hasKey,false);
});
