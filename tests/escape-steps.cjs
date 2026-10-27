// The builder's step list: a recorded winning run as steps (go, wait, use a tool) that can be changed
// and played again. Untouched steps must replay the recording exactly; a change plays from there.
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../public/escape-steps.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const runs=require('./fixtures/escape-playthroughs.json').filter(r=>!r.pending&&!r.options.challengeId);
const kids=require('./fixtures/escape-kids-adventures.json');
const picks=[...[0,3,8,15,30].map(i=>runs[i]),kids[0],kids[kids.length-1]];
const frames=list=>list.reduce((n,c)=>n+(c.kind==='move'?c.frames:0),0);

test('untouched steps replay the recording exactly',()=>{
  for(const r of picks){
    const steps=S.toSteps(r.options,r.commands),orig=EscapeAdventure.trace(r.options,r.commands);
    assert.equal(steps.reduce((n,s)=>n+(s.raw?frames(s.raw):0),0),frames(r.commands),'every recorded frame is in one step');
    assert.equal(steps.at(-1).type,'end');
    const p=S.play(r.options,steps);
    assert.equal(p.status,orig.status,JSON.stringify(r.options));assert.ok(Math.abs(p.time-orig.time)<.06);
    for(const s of steps)assert.ok(S.describe(s).length>2);
  }
});

test('a changed step plays from its settings and leaves the steps before it alone',()=>{
  const r=picks[0],steps=S.toSteps(r.options,r.commands),i=steps.findIndex((s,k)=>k>0&&s.type==='go');
  const before=S.play(r.options,steps.slice(0,i)).commands;
  // One second's wait put in first: the whole run starts a second later.
  const wait=[{type:'wait',t:1,edited:true},...steps];
  assert.ok(S.play(r.options,wait).time>=S.play(r.options,steps).time+.9);
  // Sprinting a go: the commands up to it match the recording, then differ.
  steps[i]={...steps[i],sprint:!steps[i].sprint,edited:true};
  const p=S.play(r.options,steps).commands;
  assert.deepEqual(p.slice(0,before.length-1),before.slice(0,-1));
  assert.notDeepEqual(p,r.commands);
  // A go moved somewhere else ends there.
  const g=new EscapeAdventure(r.options),to={x:g.player.x+1,y:g.player.y};
  const moved=S.play(r.options,[{type:'go',to,sprint:false,points:[],edited:true}]);
  assert.ok(Math.hypot(moved.at.x-to.x,moved.at.y-to.y)<.2,JSON.stringify(moved.at));
});

test('a tool step faces the way it is set to',()=>{
  const r=picks[0],g=new EscapeAdventure(r.options);
  const p=S.play(r.options,[{type:'act',kind:'pebble',aim:{x:0,y:1},edited:true}]);
  assert.deepEqual(p.commands.slice(-2).map(c=>c.kind),['move','pebble']);
  assert.equal(p.commands.at(-2).y,1);
  assert.equal(S.describe({type:'act',kind:'pebble',aim:{x:-1,y:0}}),'Throw a pebble ←');
  assert.equal(S.describe({type:'wait',t:2.5}),'Wait 2.5 s');
  assert.ok(g);
});
