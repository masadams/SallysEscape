const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');
// A new player reading the opening hint must never be caught for standing still.
for(const level of EscapeCatalog.levels)test('standing still at the start of '+level.id+' is safe for fifteen seconds',()=>{
  const g=new EscapeAdventure({levelId:level.id});for(let i=0;i<120*15&&g.status==='playing';i++)g.advance(1/120,{});
  assert.equal(g.status,'playing');assert.equal(g.alarms,0);assert.equal(g.tailsDropped,0);
  for(const h of g.level.guards)for(const [x,y] of h.patrol)assert.ok(x!==level.spawn[0]||y!==level.spawn[1],'no patrol corner on the start tile');
});
