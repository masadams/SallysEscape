const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const MAP=['############','#@...__....#','#....__....#','#K...__...X#','############'];
const make=(extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'ropes',name:'Ropes',brief:'',guards:[],map:MAP,ropes:[{from:[4,2],to:[7,2],period:4}],...extra})});
const run=(g,s,input={})=>{for(let i=0;i<Math.round(s*120)&&g.status==='playing';i++)g.advance(1/120,input);};

test('standing on a rope end as it swings in carries Sally across the gap',()=>{
  const g=make();Object.assign(g.player,{x:4.5,y:2.5});run(g,.05);
  assert.ok(g.player.flight?.rope,'grabbed as it arrives');run(g,2.2);
  assert.equal(g.player.flight,null);assert.ok(Math.abs(g.player.x-7.5)<.01&&Math.abs(g.player.y-2.5)<.01,'set down on the far end: '+g.player.x);
  assert.ok(g.drainEvents().includes('hop'));
});
test('the rope only comes when its swing brings it; waiting on the end catches the next one',()=>{
  const g=make({ropes:[{from:[4,2],to:[7,2],period:4,phase:.5}]});Object.assign(g.player,{x:4.5,y:2.5});
  run(g,.3);assert.ok(!g.player.flight,'the rope is at the far end');run(g,2);assert.ok(g.player.flight?.rope,'it swings back and she grabs it');
});
test('after landing she does not grab the rope straight back, but can once she steps off and back on',()=>{
  const g=make();Object.assign(g.player,{x:4.5,y:2.5});run(g,2.3);assert.ok(Math.abs(g.player.x-7.5)<.01);
  run(g,2.2);assert.equal(g.player.flight,null,'standing still on the landing does not swing her back');
  run(g,.5,{x:1,y:0});run(g,.6,{x:-1,y:0});run(g,4);assert.ok(g.player.x<5,'stepping off and back on rides it home: '+g.player.x);
});
test('nothing catches Sally while she swings',()=>{
  const g=make();Object.assign(g.player,{x:4.5,y:2.5});run(g,.05);assert.ok(g.player.flight?.rope);
  assert.ok(g.invulnerableUntil>g.elapsed+1.5,'safe for the whole swing');
});
test('the builder places a rope by its two ends, sets its swing, and keeps it through saving',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);
  assert.ok(B.addRope(m,3,3));assert.equal(B.addRope(m,5,5),false,'finish one rope first');assert.ok(B.setRopeEnd(m,8,3));
  assert.ok(B.setRope(m,0,{period:6,phase:.25}));const back=B.fromRoute(B.toRoute(m));assert.deepEqual(back.ropes,[{from:[3,3],to:[8,3],period:6,phase:.25}]);
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'b',name:'B',...B.toRoute(m)})});assert.equal(g.ropes.length,1);
});
