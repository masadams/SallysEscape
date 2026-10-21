const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const MAP=['##############','#@...........#','#............#','#K..........X#','##############'];
const make=(caps,map=MAP)=>new EscapeAdventure({level:escapeBuildCustom({id:'caps',name:'Caps',brief:'',guards:[],map,caps})});
// Walk or sprint onto the cap at x=3, then let go and see where she comes to rest.
function bounce(g,sprint){Object.assign(g.player,{x:1.5,y:2.5});let flew=false;for(let i=0;i<600&&g.status==='playing';i++){const before=!g.player.flight;g.advance(1/120,flew?{}:{x:1,y:0,sprint});if(g.player.flight)flew=true;}return g.player.x;}

test('a plain cap lands Sally on its mark whether she walks or sprints onto it',()=>{
  for(const sprint of [false,true]){const x=bounce(make([{at:[3,2],to:[7,2]}]),sprint);assert.ok(Math.abs(x-7.5)<.05,(sprint?'sprint ':'walk ')+x);}
});
test('a springy cap carries a sprint further, and lands Sally with a skid',()=>{
  const walk=bounce(make([{at:[3,2],to:[7,2],spring:2}]),false),run=bounce(make([{at:[3,2],to:[7,2],spring:2}]),true);
  assert.ok(walk>7.6&&walk<8.6,'a walk lands on the mark and skids on a little: '+walk);
  assert.ok(run>9.6&&run<11,'a sprint lands two tiles further and skids: '+run);
});
test('a springy cap never lands Sally in a wall, water or a crate',()=>{
  const map=['##############','#@...........#','#.......#....#','#K..........X#','##############'];
  const g=make([{at:[3,2],to:[6,2],spring:3}],map);const f=g.capFlight(g.caps[0],true);assert.equal(Math.floor(f.to.x),7,'stops short of the wall at x=8');
  const wet=make([{at:[3,2],to:[6,2],spring:2}],['##############','#@...........#','#.......~....#','#K..........X#','##############']);assert.equal(Math.floor(wet.capFlight(wet.caps[0],true).to.x),7,'not into the water');
});
test('landing on another cap from a springy one bounces Sally straight on',()=>{
  const g=make([{at:[3,2],to:[6,2],spring:1},{at:[6,2],to:[10,1]}]);Object.assign(g.player,{x:1.5,y:2.5});
  let hops=0,flew=false;for(let i=0;i<600;i++){g.advance(1/120,flew?{}:{x:1,y:0});flew=flew||!!g.player.flight;hops+=g.drainEvents().filter(e=>e==='hop').length;}
  assert.ok(hops>=4,'two flights: '+hops);assert.ok(Math.abs(g.player.x-10.5)<.6&&Math.abs(g.player.y-1.5)<.6,'on the second cap\'s mark: '+g.player.x+','+g.player.y);
});
test('the builder sets how springy a cap is and keeps it through saving',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);assert.ok(B.addCap(m,3,3));assert.ok(B.setCapEnd(m,8,3));
  assert.ok(B.setCap(m,0,{spring:2}));assert.equal(B.fromRoute(B.toRoute(m)).caps[0].spring,2);
  B.setCap(m,0,{spring:0});assert.equal('spring' in m.caps[0],false);
});
