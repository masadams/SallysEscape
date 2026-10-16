const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const B=require('../public/escape-builder.js');
const Lab=require('../scripts/lib/level-lab.cjs');
const CLI=require('../scripts/level-lab.cjs');
const Benchmark=require('../scripts/level-benchmark.cjs');
const level=(map,extra={})=>escapeBuildCustom({id:'lab-fixture',name:'Lab fixture',map,guards:[],...extra});
const room=()=>({level:level(['#########','#@..K..X#','#.......#','#.......#','#########'])});
const config={budget:160,width:6,depth:40,seconds:30};
test('finds and independently replays a solution with no supplied hints',()=>{
  const options=room(),result=Lab.solve(options,config);
  assert.equal(result.status,'solved');assert.equal(result.verification.won,true);
  assert.equal(Lab.verifyArtifact(result.replay).won,true);
  for(const c of result.replay.commands)if(c.kind==='move'){assert.ok([-1,0,1].includes(c.x));assert.ok([-1,0,1].includes(c.y));}
  const a=Lab.stress(options,result.replay.commands,{trials:3,jitter:0,seed:7});assert.equal(a.wins,3);
  assert.deepEqual(Lab.stress(options,result.replay.commands,{trials:3,seed:7}),Lab.stress(options,result.replay.commands,{trials:3,seed:7}));
});
test('discovers a legal burrow across a wall that ordinary pathfinding cannot cross',()=>{
  const options={level:level(['#########','#@#..K.X#','#.#.....#','#.#.....#','#########'],{burrows:1})};
  const result=Lab.solve(options,config);assert.equal(result.status,'solved');
  assert.ok(result.replay.commands.some(c=>c.kind==='burrow'));assert.equal(Lab.replay(options,result.replay.commands).won,true);
});
test('unreachable objective is unresolved, never a fabricated win or impossibility claim',()=>{
  const options={level:level(['#########','#@#..K.X#','#.#.....#','#.#.....#','#########'])};
  const result=Lab.solve(options,{...config,budget:10});assert.equal(result.status,'unresolved');assert.equal(result.replay,null);assert.equal(result.verification,null);assert.equal(result.reason,'expansion-budget');
});
test('collects an isolated key by tongue and required treasure before escaping',()=>{
  const options={level:level(['#########','#@._K_..#','#..###..#','#1.....X#','#########'],{tongues:1,requiredTreasure:1})};
  const result=Lab.solve(options,{...config,budget:240,width:8});assert.equal(result.status,'solved');assert.ok(result.replay.commands.some(c=>c.kind==='tongue'));assert.equal(result.verification.treasure,1);
});
test('searches away from the key to activate a closed gate',()=>{
  const options={level:level(['#########','#@...K.X#','#...#...#','#...#...#','#########'],{gates:[{id:'lab-door',name:'Lab door',tiles:[[4,1]],switch:[1,3]}]})};
  const result=Lab.solve(options,{...config,budget:240,width:12});assert.equal(result.status,'solved');assert.equal(result.verification.won,true);
});
test('reuses a saved solution only after checking it against the current map',()=>{
  const options=room(),first=Lab.solve(options,config),again=Lab.solve(options,{...config,reuseCommands:first.replay.commands});assert.equal(again.reason,'reused-verified-replay');assert.equal(again.search.expanded,0);
  const changed={level:level(['#########','#@#K...X#','#.#.....#','#.#.....#','#########'])};
  const result=Lab.solve(changed,{...config,budget:1,reuseCommands:first.replay.commands});assert.equal(result.memory.won,false);assert.equal(result.status,'unresolved');
});
test('look-back uses the real action and changes facing without fabricated movement',()=>{
  const options={level:level(['#########','#@..K..X#','#.......#','#.......#','#########'],{gaze:true})},g=new EscapeAdventure(options),facing={...g.player.facing};
  assert.ok(Lab.candidates(g).some(c=>c.lookBack));
  const r=Lab.execute(g,{type:'tool',kind:'lookBack'},Lab.settings(config));
  assert.deepEqual(r.g.player.facing,{x:-facing.x||0,y:-facing.y||0});assert.equal(r.commands[0].kind,'lookBack');
  assert.deepEqual(r.g.player.x,g.player.x);assert.equal(g.elapsed,0);
  assert.equal(Lab.replay(options,r.commands).actionFailure,null);
});
test('cloned simulation reads its own changed grid for creature geometry',()=>{
  const g=new EscapeAdventure(room()),r=Lab.execute(g,{type:'input',x:0,y:0,sprint:false,frames:1},Lab.settings(config));
  r.g.grid[2][2]='#';assert.equal(r.g.motion.floor(2,2),false);assert.equal(g.motion.floor(2,2),true);
});
test('normal tail recovery can win, while no-tail replay policy rejects that same run',()=>{
  const options={level:level(['#########','#@..K..X#','#.......#','#########'],{tailDrop:true,guards:[{kind:'snake',spawn:[1,1],facing:0,patrol:[[1,1]]}]})};
  const artifact={schemaVersion:1,options,fingerprint:Lab.fingerprint(options),commands:[{kind:'move',x:1,y:0,sprint:true,frames:220},{kind:'move',x:0,y:0,sprint:false,frames:120}]};
  assert.equal(Lab.verifyArtifact(artifact).won,true);assert.equal(Lab.verifyArtifact(artifact).tailsDropped,1);assert.equal(Lab.verifyArtifact(artifact,{allowTail:false}).won,false);
});
test('replay rejects unavailable actions, malformed inputs and stale rules',()=>{
  const options=room();assert.equal(Lab.replay(options,[{kind:'burrow'}]).won,false);assert.equal(Lab.replay(options,[{kind:'burrow'}]).actionFailure.kind,'burrow');
  assert.throws(()=>Lab.replay(options,[{kind:'move',frames:Infinity,x:0,y:0,sprint:false}]),/Invalid/);
  assert.throws(()=>Lab.replay(options,[{kind:'move',frames:1,x:2,y:0,sprint:false}]),/Invalid/);
  assert.throws(()=>Lab.replay(options,[{kind:'teleport'}]),/Unknown/);
  assert.throws(()=>Lab.verifyArtifact({schemaVersion:1,options,fingerprint:'old',commands:[]}),/stale/);
});
test('real hunters remain lethal during search and failure locations are reported',()=>{
  const options={level:level(['#########','#@..K..X#','#########'],{guards:[{kind:'snake',spawn:[1,1],facing:0,patrol:[[1,1]]}]})};
  const result=Lab.solve(options,{...config,budget:10});assert.equal(result.status,'unresolved');assert.ok(result.failures.length);assert.ok(result.failures[0].tile);
});
test('builder version-2 exports and route JSON load without editing their files',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sally-lab-'));
  try{
    const model=B.blank(),file=path.join(dir,'export.txt'),text=B.exportText(model);assert.ok(text.startsWith('SALLY2:'));fs.writeFileSync(file,text);
    assert.equal(CLI.loadOptions(undefined,{custom:file}).level.custom,true);assert.equal(fs.readFileSync(file,'utf8'),text);
    const route=path.join(dir,'route.json');fs.writeFileSync(route,JSON.stringify(B.toRoute(model)));assert.equal(CLI.loadOptions(undefined,{route}).level.custom,true);
    assert.throws(()=>CLI.loadOptions('quiet-vault',{custom:file}),/Choose one/);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('reports cannot accidentally retain a previous successful replay',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sally-lab-'));
  try{fs.writeFileSync(path.join(dir,'replay.json'),'old');const result=Lab.solve(room(),{...config,budget:1});CLI.writeOutputs(dir,result);assert.equal(fs.existsSync(path.join(dir,'replay.json')),false);assert.match(fs.readFileSync(path.join(dir,'report.md'),'utf8'),/NOT proof/);}
  finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('budgets and CLI arguments fail early on invalid values',()=>{
  for(const cfg of [{budget:NaN},{width:0},{seconds:-1},{depth:1.5}])assert.throws(()=>Lab.settings(cfg),/Invalid/);
  assert.throws(()=>Lab.stress({},[],{trials:-1}),/Invalid/);
  assert.throws(()=>CLI.parse(['solve','quiet-vault','--typo','1']),/Unknown option/);
  assert.throws(()=>CLI.parse(['solve','--out']),/Missing value/);
});
test('benchmark shards cover every catalog case exactly once, including challenges and hidden levels',()=>{
  const all=Benchmark.cases(),joined=Array.from({length:8},(_,i)=>Benchmark.shardCases(all,i+1,8)).flat();
  assert.equal(joined.length,all.length);assert.equal(new Set(joined.map(c=>c.id)).size,all.length);assert.ok(all.some(c=>c.id.startsWith('challenge:')));assert.ok(all.some(c=>c.id.startsWith('hidden:')));
  assert.throws(()=>Benchmark.shardCases(all,0,8),/shard/);
});
test('benchmark verifies a known witness separately without feeding it to independent search',()=>{
  const options=room(),known=Lab.solve(options,config).replay.commands;
  const item={id:'lab-fixture',options,level:options.level};
  // matching uses catalog IDs; room options are a custom level, used here only
  // as a small real-engine benchmark fixture.
  const result=Benchmark.benchmarkCase(item,[{options,commands:known}],{...config,budget:1,trials:0});
  assert.equal(result.reference.status,'verified');assert.equal(result.report.status,'unresolved');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sally-benchmark-'));
  try{const {summary}=Benchmark.saveSummary(dir,[result],config);assert.equal(summary.totals.referenceVerified,1);assert.equal(summary.totals.independentlySolved,0);assert.equal(summary.totals.unresolved,1);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
