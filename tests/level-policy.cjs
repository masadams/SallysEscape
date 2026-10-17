const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const Lab=require('../scripts/lib/level-lab.cjs');
const Policy=require('../scripts/lib/level-policy.cjs');
const CLI=require('../scripts/level-lab.cjs');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const level=(map,extra={})=>escapeBuildCustom({id:'policy-fixture',name:'Policy fixture',map,guards:[],...extra});
const options={level:level(['#########','#@..#..X#','###.#.###','#...#...#','#.#####.#','#...K...#','#########'])};
const solved=Lab.solve(options,{budget:80,width:4,depth:40,seconds:30});

test('saved decisions recover at corners under sampled controls and delayed decisions',()=>{
  assert.equal(solved.status,'solved');
  const exact=Policy.follow(solved.policy);
  assert.equal(exact.won,true);assert.equal(exact.verification.won,true);
  assert.equal(exact.verificationFrames,exact.executionFrames);
  const stress=Policy.stress(solved.policy,{trials:8,jitter:6,seed:1});
  assert.equal(stress.baseline.won,true);assert.equal(stress.completedTrials,8);assert.equal(stress.wins,8);
  assert.ok(stress.runs.some(r=>r.controlFrames>1&&r.delayFrames>0));
  assert.equal(stress.budgetExhausted,false);
  // This is a separate perturbation model, not an interchangeable win rate.
  assert.ok(Lab.stress(options,solved.replay.commands,{trials:8,jitter:6,seed:1}).wins<8);
  for(const run of stress.runs)assert.equal(run.verification.won,true);
  const repeat=Policy.stress(solved.policy,{trials:8,jitter:6,seed:1});
  assert.deepEqual(repeat.runs.map(r=>[r.controlFrames,r.delayFrames,r.won,r.simulatedFrames]),stress.runs.map(r=>[r.controlFrames,r.delayFrames,r.won,r.simulatedFrames]));
});

test('feedback still loses to real hunters and failed baselines do not start stress trials',()=>{
  const lethal={level:level(['#########','#@..K..X#','#########'],{guards:[{kind:'snake',spawn:[3,1],facing:Math.PI,patrol:[[3,1]]}]})};
  const policy={...solved.policy,options:lethal,fingerprint:Lab.fingerprint(lethal),choices:[{type:'route',waypoints:[{x:4.5,y:1.5},{x:7.5,y:1.5}],sprint:true}]};
  const result=Policy.follow(policy);
  assert.equal(result.won,false);assert.equal(result.status,'caught');assert.equal(result.verification,null);
  const stressed=Policy.stress(policy,{trials:8});
  assert.equal(stressed.baseline.won,false);assert.equal(stressed.attemptedTrials,0);assert.equal(stressed.budgetExhausted,false);
});

test('feedback budgets include fresh verification and are shared by baseline and every trial',()=>{
  const first=Policy.follow(solved.policy,{frames:1});
  assert.equal(first.reason,'evaluation-budget');assert.equal(first.simulatedFrames,1);assert.equal(first.won,false);
  const exact=Policy.follow(solved.policy);
  const verificationCut=Policy.follow(solved.policy,{frames:exact.executionFrames+1});
  assert.equal(verificationCut.status,'won');assert.equal(verificationCut.won,false);
  assert.equal(verificationCut.reason,'evaluation-budget');assert.equal(verificationCut.verificationFrames,1);
  const stress=Policy.stress(solved.policy,{trials:8,frames:exact.simulatedFrames+1});
  assert.equal(stress.baseline.won,true);assert.equal(stress.attemptedTrials,1);assert.equal(stress.completedTrials,0);
  assert.equal(stress.budgetExhausted,true);assert.equal(stress.simulatedFrames,exact.simulatedFrames+1);
});

test('saved policies preserve burrow, tongue, required-loot and switch decisions',()=>{
  const fixtures=[
    {options:{level:level(['#########','#@#..K.X#','#.#.....#','#.#.....#','#########'],{burrows:1})},tool:'burrow'},
    {options:{level:level(['#########','#@._K_..#','#..###..#','#1.....X#','#########'],{tongues:1,requiredTreasure:1})},tool:'tongue'},
    {options:{level:level(['#########','#@...K.X#','#...#...#','#...#...#','#########'],{gates:[{id:'door',tiles:[[4,1]],switch:[1,3]}]})}}
  ];
  for(const fixture of fixtures){
    const result=Lab.solve(fixture.options,{budget:240,width:12,depth:40,seconds:30});
    assert.equal(result.status,'solved');
    if(fixture.tool)assert.ok(result.policy.choices.some(c=>c.kind===fixture.tool));
    const followed=Policy.follow(result.policy);assert.equal(followed.won,true);
    assert.equal(Lab.replay(fixture.options,followed.commands).won,true);
  }
});

test('a saved no-tail restriction cannot be relaxed by evaluation flags',()=>{
  const tailOptions={level:level(['#########','#@..K..X#','#.......#','#########'],{tailDrop:true,guards:[{kind:'snake',spawn:[1,1],facing:0,patrol:[[1,1]]}]})};
  const policy={...solved.policy,options:tailOptions,fingerprint:Lab.fingerprint(tailOptions),settings:{seconds:30,allowTail:false},choices:[{type:'route',waypoints:[{x:4.5,y:1.5},{x:7.5,y:1.5}],sprint:true}]};
  const restricted=Policy.follow(policy,{allowTail:true});
  assert.equal(restricted.tailsDropped,1);assert.equal(restricted.won,false);
  assert.equal(restricted.reason,'verification-failed');
  assert.equal(Policy.follow({...policy,settings:{seconds:30,allowTail:true}}).won,true);
});

test('policy artifacts reject stale rules, oversized plans and malformed movement before executing',()=>{
  assert.throws(()=>Policy.follow({...solved.policy,fingerprint:'stale'}),/stale/);
  assert.throws(()=>Policy.follow({...solved.policy,settings:{}}),/settings/);
  assert.throws(()=>Policy.follow({...solved.policy,choices:Array(1001).fill({})}),/Invalid/);
  assert.throws(()=>Policy.follow({...solved.policy,choices:[{type:'tile',target:{x:NaN,y:1},sprint:true}]}),/waypoint/);
  assert.throws(()=>Policy.follow({...solved.policy,choices:[{type:'route',waypoints:Array(7).fill({x:1,y:1}),sprint:true}]}),/waypoint/);
  assert.throws(()=>Policy.follow({...solved.policy,choices:[{type:'input',frames:100000,x:0,y:0,sprint:false}]}),/exceeds/);
  assert.throws(()=>Policy.follow(solved.policy,{controlFrames:0}),/timing/);
  assert.throws(()=>Policy.follow({...solved.policy,choices:[{type:'route',waypoints:[{x:1,y:1}],sprint:true,recoverRoute:'yes'}]}),/choice/);
});

test('route recovery waits outside active steam and verifies the resulting real inputs',()=>{
  const options={level:level(['#############','#@....K....X#','#...........#','#############'],{vents:[{at:[4,0],dir:[0,1],length:1,period:2,on:1,offset:.5}]})};
  const policy={...solved.policy,options,fingerprint:Lab.fingerprint(options),choices:[
    {type:'route',waypoints:[{x:4.5,y:1.5},{x:7.5,y:1.5}],sprint:false,recoverRoute:true},
    {type:'route',waypoints:[{x:8.5,y:1.5},{x:11.5,y:1.5}],sprint:false,recoverRoute:true,finishExit:true}
  ]};
  const result=Policy.follow(policy,{frames:5000});assert.equal(result.won,true);assert.equal(result.verification.won,true);
  assert.ok(result.commands.some(c=>c.kind==='move'&&c.x===0&&c.y===0));
  assert.equal(Lab.replay(options,result.commands).won,true);
  const interrupted=Policy.follow(policy,{frames:50});assert.equal(interrupted.simulatedFrames,50);assert.equal(interrupted.won,false);assert.equal(interrupted.reason,'evaluation-budget');
});

test('route recovery cannot bypass a sealed passage or lethal hunter',()=>{
  for(const extra of [
    {gates:[{id:'sealed',tiles:[[4,1]],initialOpen:false}]},
    {guards:[{kind:'snake',spawn:[3,1],facing:Math.PI,patrol:[[3,1]]}]}
  ]){
    const options={level:level(['#########','#@..K..X#','#########'],extra)};
    const policy={...solved.policy,options,fingerprint:Lab.fingerprint(options),choices:[{type:'route',waypoints:[{x:4.5,y:1.5},{x:7.5,y:1.5}],sprint:false,recoverRoute:true,finishExit:true}]};
    const result=Policy.follow(policy,{frames:3000});assert.equal(result.won,false);assert.equal(result.verification,null);assert.ok(result.simulatedFrames<=3000);
    if(extra.guards)assert.equal(result.status,'caught');
  }
});

test('a steam displacement reconnects to the saved endpoint through real geometry',()=>{
  const options={level:level(['#############','#...........#','#@....K....X#','#############'],{vents:[{at:[0,2],dir:[1,0],length:4,period:3,on:2,offset:.7}]})};
  const choice={type:'route',waypoints:[{x:2.5,y:2.5},{x:3.5,y:2.5},{x:4.5,y:2.5},{x:7.5,y:2.5}],sprint:false,recoverRoute:true};
  const result=Lab.execute(new EscapeAdventure(options),choice,Lab.settings());
  assert.ok(result.g.blasts>0);assert.equal(result.g.hasKey,true);assert.ok(Math.hypot(result.g.player.x-7.5,result.g.player.y-2.5)<.1);
  const finish=Lab.execute(result.g,{type:'route',waypoints:[{x:8.5,y:2.5},{x:11.5,y:2.5}],sprint:false,recoverRoute:true,finishExit:true},Lab.settings());
  assert.equal(finish.g.status,'won');assert.equal(Lab.replay(options,[...result.commands,...finish.commands]).won,true);
});

test('outputs remove stale policies when a run is unresolved or only reuses raw inputs',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sally-policy-'));
  try{
    CLI.writeOutputs(dir,solved);assert.equal(fs.existsSync(path.join(dir,'policy.json')),true);
    const reused=Lab.solve(options,{reuseCommands:solved.replay.commands});
    CLI.writeOutputs(dir,reused);assert.equal(fs.existsSync(path.join(dir,'policy.json')),false);
    CLI.writeOutputs(dir,solved);
    CLI.writeOutputs(dir,Lab.solve(options,{frames:1}));assert.equal(fs.existsSync(path.join(dir,'policy.json')),false);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
