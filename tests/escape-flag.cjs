const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const MAP=['##############','#@...........#','#............#','#K..........X#','#............#','##############'];
const make=(opts={},guards=[{kind:'snake',spawn:[11,2],facing:Math.PI,patrol:[[11,2],[11,4]]}])=>new EscapeAdventure({level:escapeBuildCustom({id:'flag',name:'Flag',brief:'',hint:'',map:MAP,guards}),...opts});

test('only runs that allow it can plant a flag',()=>{
  const g=make();Object.assign(g.player,{x:3.5,y:2.5});assert.equal(g.plantFlag(),false);assert.equal(g.flag,null);
  const k=make({plantFlag:true});Object.assign(k.player,{x:3.3,y:2.7});assert.ok(k.plantFlag());assert.deepEqual([k.flag.x,k.flag.y],[3.5,2.5],'set on the middle of her tile');
});
test('a catch with a flag planted sends Sally back to it instead of ending the run',()=>{
  const g=make({plantFlag:true});Object.assign(g.player,{x:3.5,y:2.5});assert.ok(g.plantFlag());
  Object.assign(g.player,{x:9.5,y:2.5});assert.ok(g.shedTail(g.hunters[0]));
  assert.equal(g.status,'playing');assert.deepEqual([g.player.x,g.player.y],[3.5,2.5]);assert.match(g.message,/flag/);assert.equal(g.oopses,1);
  assert.equal(g.seesPlayer(g.hunters[0]),false,'nothing spots her for a moment after');
});
test('without a flag a catch is the usual catch',()=>{
  const g=make({plantFlag:true});g.tailDrop=false;Object.assign(g.player,{x:10.5,y:2.5});assert.equal(g.shedTail(g.hunters[0]),false);
});
test('no planting next to a creature, in water or in the air; planting again moves the flag',()=>{
  const g=make({plantFlag:true});Object.assign(g.player,{x:9.5,y:2.5});assert.equal(g.plantFlag(),false);assert.match(g.message,/danger/);
  g.player.flight={from:{x:3.5,y:2.5},to:{x:4.5,y:2.5},start:0,dur:1};Object.assign(g.player,{x:3.5,y:2.5});assert.equal(g.plantFlag(),false);g.player.flight=null;
  assert.ok(g.plantFlag());Object.assign(g.player,{x:2.5,y:4.5});assert.ok(g.plantFlag());assert.deepEqual([g.flag.x,g.flag.y],[2.5,4.5]);assert.equal(g.flagsPlanted,2);
});
