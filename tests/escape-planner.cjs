// The route planner is shared by scripts/planner.cjs and the builder's 🤖 Solve, which runs it in a
// worker. The worker gets only the scripts it imports, not the page, so it is loaded here the same way.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const B=require('../public/escape-builder.js');
const P=require('../public/escape-planner.js');
const ACT={pebble:'throwDecoy',burrow:'burrow',tongue:'useTongue',seed:'plantSeed',camo:'camouflage',glow:'throwGlow',spore:'throwSpore'};
const replay=(level,commands)=>{const g=new EscapeAdventure({level});for(const c of commands){if(c.kind==='move'){for(let n=0;n<c.frames;n++)g.advance(1/120,c);}else g[ACT[c.kind]]?.(c.power);}return g;};

test('the planner escapes a simple level and its run replays to a win',()=>{
  const level=escapeBuildCustom(B.toRoute(B.fromRoute(EscapeCatalog.levels[0])));
  const r=P.plan({level},{budget:20000});
  assert.ok(r.won);assert.equal(replay(level,r.commands).status,'won');
});

test('the builder’s worker plans with only the scripts it imports',()=>{
  const dir=path.join(__dirname,'../public'),posted=[];
  const ctx=vm.createContext({console,postMessage:m=>posted.push(m)});
  ctx.importScripts=(...files)=>{for(const f of files)vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f});};
  ctx.self=ctx;vm.runInContext('globalThis.self=globalThis;',ctx);
  vm.runInContext(fs.readFileSync(path.join(dir,'escape-planner-worker.js'),'utf8'),ctx);
  const level=escapeBuildCustom(B.toRoute(B.fromRoute(EscapeCatalog.levels[1])));
  ctx.onmessage({data:{level:structuredClone(level),budget:20000}});
  assert.equal(posted.length,1);assert.ok(posted[0].ok,posted[0].error);assert.ok(posted[0].won);
  assert.equal(replay(level,posted[0].commands).status,'won');
  ctx.onmessage({data:{level:{name:'broken'},budget:1000}});assert.equal(posted[1].ok,false,'a bad level comes back as an error, not a crash');
});
