const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Lab=require('../scripts/lib/level-lab.cjs'),Policy=require('../scripts/lib/level-policy.cjs');
const Memory=require('../scripts/lib/level-memory.cjs'),Practice=require('../scripts/lib/level-practice.cjs'),CLI=require('../scripts/level-practice.cjs');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const make=id=>({level:escapeBuildCustom({id,name:id,map:['#########','#@..K..X#','#########'],guards:[]})});
const options=make('practice-fixture'),cfg={trials:2,jitter:0,seed:1,testSeed:1009,milliseconds:5000,frames:20000,candidates:2};
const solved=Lab.solve(options,{budget:20,width:2}),evaluation=Policy.stress(solved.policy,cfg);
function directory(t){
  const root=path.resolve(__dirname,'../work');fs.mkdirSync(root,{recursive:true});const dir=fs.mkdtempSync(path.join(root,'practice-test-'));
  t.after(()=>{if(!path.resolve(dir).startsWith(root+path.sep))throw new Error('Unsafe test cleanup');fs.rmSync(dir,{recursive:true,force:true});});return dir;
}

test('experience survives restart, rejects mismatched evidence and cannot cross level/tail policies',t=>{
  const dir=directory(t),file=path.join(dir,'memory.json'),memory=Memory.load(file);
  Memory.remember(memory,solved.policy,evaluation,cfg);Memory.save(file,memory);
  const loaded=Memory.load(file);assert.equal(Memory.lookup(loaded,options).hash,Memory.policyHash(solved.policy));
  assert.equal(Memory.lookup(loaded,make('other-map')),null);assert.equal(Memory.lookup(loaded,options,false),null);
  assert.throws(()=>Memory.remember(loaded,solved.policy,{...evaluation,policyHash:'wrong'},cfg),/does not match/);
  assert.throws(()=>Memory.remember(loaded,solved.policy,{...evaluation,budgetExhausted:true},cfg),/incomplete/);
  const entry=Memory.lookup(loaded,options);entry.hash='wrong';assert.throws(()=>Memory.lookup(loaded,options),/does not match/);
  fs.writeFileSync(file,'null');assert.throws(()=>Memory.load(file),/Invalid memory/);
});

test('practice retrieves automatically on its second run while held-out maps never enter memory',t=>{
  const dir=directory(t),args={items:[{id:'practice-fixture',options}],holdout:[{id:'held-out',options:make('held-out')}],memoryFile:path.join(dir,'memory.json'),out:path.join(dir,'report'),config:cfg};
  const first=Practice.run(args);assert.equal(first.results[0].source,'independent-search');assert.equal(first.results[0].initialTraining.baselineWon,true);
  assert.equal(first.heldoutMaps[0].memoryUpdated,false);assert.equal(Object.keys(Memory.load(args.memoryFile).entries).length,1);
  const second=Practice.run(args);assert.equal(second.results[0].source,'memory');assert.equal(second.results[0].search,null);
  assert.equal(second.results[0].attempts.length,0);assert.equal(second.results[0].heldoutTiming.samePolicy,true);
  assert.ok(second.budget.simulatedFrames<=cfg.frames);
});

test('one shared frame allowance covers discovery, reuse, policy trials and fresh verification',t=>{
  let frames=0;
  const denied=Lab.solve(options,{budget:20,width:2,consumeFrame:()=>++frames<=1});
  assert.equal(denied.status,'unresolved');assert.equal(denied.replay,null);assert.equal(denied.policy,null);
  const dir=directory(t),result=Practice.run({items:[{id:'practice-fixture',options}],memoryFile:path.join(dir,'memory.json'),out:path.join(dir,'report'),config:{...cfg,frames:1}});
  assert.equal(result.budget.simulatedFrames,1);assert.equal(result.budget.exhausted,true);
  assert.equal(result.results[0].finalTraining,null);assert.equal(Object.keys(Memory.load(path.join(dir,'memory.json')).entries).length,0);
  let consumed=0;
  const stress=Policy.stress(solved.policy,{...cfg,consumeFrame:()=>{if(consumed>=1)return false;consumed++;return true;}});
  assert.equal(consumed,1);assert.equal(stress.simulatedFrames,1);assert.equal(stress.baseline.won,false);assert.equal(stress.budgetExhausted,true);
  const normal=Lab.solve(options,{budget:20,width:2});let remaining=normal.search.simulatedFrames+1;
  const cutoff=Lab.solve(options,{budget:20,width:2,consumeFrame:()=>remaining-- >0});
  assert.equal(cutoff.status,'unresolved');assert.equal(cutoff.reason,'verification-budget');assert.equal(cutoff.replay,null);assert.equal(cutoff.policy,null);
});

test('practice validates distinct train/test inputs and rejects unsupported CLI flags',t=>{
  assert.throws(()=>Practice.settings({seed:1,testSeed:1}),/must differ/);
  assert.throws(()=>Practice.settings({frames:0}),/Invalid practice/);
  assert.throws(()=>CLI.parse(['--unknown','1']),/Unknown/);
  const dir=directory(t);
  assert.throws(()=>Practice.run({items:[{id:'same',options}],holdout:[{id:'same',options}],memoryFile:path.join(dir,'memory.json'),out:dir}),/distinct/);
  assert.equal(fs.existsSync(path.join(dir,'memory.json')),false);
});

test('memory locking prevents concurrent writers and releases the lock after errors',t=>{
  const file=path.join(directory(t),'memory.json');
  Memory.withLock(file,()=>assert.throws(()=>Memory.withLock(file,()=>{}),/in use/));
  assert.equal(fs.existsSync(file+'.lock'),false);
  assert.throws(()=>Memory.withLock(file,()=>{throw new Error('test interruption');}),/test interruption/);
  assert.equal(fs.existsSync(file+'.lock'),false);
});

test('a remembered policy that stops working is rejected and discovery resumes',t=>{
  const dir=directory(t),file=path.join(dir,'memory.json'),memory=Memory.load(file);
  Memory.remember(memory,solved.policy,evaluation,cfg);
  const entry=Memory.lookup(memory,options);entry.policy=structuredClone(entry.policy);
  entry.policy.choices=[{type:'input',x:0,y:0,sprint:false,frames:30}];entry.hash=Memory.policyHash(entry.policy);Memory.save(file,memory);
  const result=Practice.run({items:[{id:'practice-fixture',options}],memoryFile:file,out:path.join(dir,'report'),config:cfg});
  assert.equal(result.results[0].source,'memory-rejected-then-search');
  assert.equal(result.results[0].memoryRejected.baselineWon,false);
  assert.equal(result.results[0].finalTraining.baselineWon,true);
});

test('failure-guided practice offers real detours and only tools the level supplies',()=>{
  const toolOptions={level:escapeBuildCustom({id:'practice-tools',name:'Tools',map:['#########','#@..K..X#','#.......#','#########'],guards:[],pebbles:1})};
  const solution=Lab.solve(toolOptions,{budget:20,width:2});
  const candidates=[...Practice.variants(solution.policy,{runs:[{won:false,decisionIndex:0,position:{x:2.5,y:1.5}}]})];
  assert.ok(candidates.some(c=>c.label.startsWith('detour-')));
  assert.ok(candidates.some(c=>c.label.startsWith('pebble-')));
  assert.equal(candidates.some(c=>c.label.startsWith('burrow-')),false);
  for(const candidate of candidates)Policy.validate(candidate.policy);
  const before=JSON.stringify(solution.policy);
  const outcome=Policy.follow(candidates.find(c=>c.label.startsWith('pebble-')).policy);
  if(outcome.won)assert.equal(outcome.verification.won,true);
  assert.equal(JSON.stringify(solution.policy),before);
});
