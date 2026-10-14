const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');
function ticks(g,seconds,input={}){for(let n=0;n<Math.round(seconds*120);n++)g.advance(1/120,input);}
// A lone owl on Bramble Switchyard's open corridor, looking east.
function owl(){const g=new EscapeAdventure({levelId:'bramble-switchyard'});const h=g.hunters.find(h=>h.kind==='owl');g.hunters=[h];g.hunter=h;g.tailDrop=false;
  Object.assign(h,{x:15.5,y:9.5,facing:0,patrol:[{x:27.5,y:9.5}],routeIndex:0});g.motion.snakes=[g.motion.snakes[0]];Object.assign(g.player,{x:3.5,y:9.5});g.player.facing={x:1,y:0};return {g,h};}
test('owls are new to the Lantern Marsh and never leave their perch while watching',()=>{
  const first=EscapeCatalog.levels.findIndex(l=>l.guards.some(h=>h.kind==='owl'));assert.equal(EscapeCatalog.levels[first].id,'firefly-ford');
  assert.equal(EscapeCatalog.levels.filter(l=>l.guards.some(h=>h.kind==='owl')).length,3);
  const {g,h}=owl();h.patrol=[{x:27.5,y:9.5},{x:15.5,y:2.5}];g.player.x=2.5;g.player.y=1.5;const looks=new Set();for(let i=0;i<60;i++){ticks(g,.1);looks.add(h.routeIndex);}assert.equal(h.x,15.5);assert.equal(h.y,9.5);assert.deepEqual([...looks].sort(),[0,1],'it turns between its look-outs');
});
test('an owl sees far down a narrow beam, glares, then swoops onto the spot it locked',()=>{
  const {g,h}=owl();Object.assign(g.player,{x:21.5,y:9.5});ticks(g,.05);assert.equal(h.state,'glare');const aim={...h.aim};assert.equal(g.status,'playing');
  ticks(g,.9);assert.ok(['swoop','return'].includes(h.state));ticks(g,1.2);assert.equal(g.status,'caught');assert.ok(Math.hypot(aim.x-21.5,aim.y-9.5)<.01);
});
test('stepping off the locked spot makes the swoop miss, and the owl flies back to its perch',()=>{
  const {g,h}=owl();Object.assign(g.player,{x:21.5,y:9.5});ticks(g,.05);assert.equal(h.state,'glare');ticks(g,.5,{y:1});ticks(g,.4,{y:1});ticks(g,5);assert.equal(g.status,'playing');assert.equal(h.state,'patrol');assert.ok(Math.hypot(h.x-15.5,h.y-9.5)<.06);
});
test('outside the beam, beyond seven tiles or hidden in cover, Sally is unseen; a pebble draws the glare',()=>{
  for(const p of [{x:21.5,y:8.5},{x:28.5,y:8.5}]){const {g,h}=owl();h.facing=0;Object.assign(g.player,p);g.player.x=p.x;if(p.x===21.5){h.facing=Math.PI;}ticks(g,.1);assert.equal(h.state,'patrol');}
  const {g,h}=owl();Object.assign(g.player,{x:15.5,y:12.5});ticks(g,.1);assert.equal(h.state,'patrol');
  const lured=owl();Object.assign(lured.g.player,{x:12.5,y:9.5});lured.h.facing=Math.PI/2;lured.g.player.facing={x:1,y:0};assert.equal(lured.g.throwDecoy(),true);ticks(lured.g,.05);assert.equal(lured.h.state,'glare');assert.ok(lured.h.aim.x>13);
});
test('a perched owl is harmless to touch, and a tail drop does not drag it off its perch',()=>{
  const {g,h}=owl();h.facing=-Math.PI/2;Object.assign(g.player,{x:15.5,y:9.6});ticks(g,.02);assert.equal(g.status,'playing');
  const t=owl();t.g.tailDrop=true;Object.assign(t.g.player,{x:21.5,y:9.5});ticks(t.g,2.1);assert.equal(t.g.tailsDropped,1);assert.equal(t.g.status,'playing');assert.equal(t.h.tailLureUntil,undefined);
});
