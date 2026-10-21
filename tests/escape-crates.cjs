const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const make=(map,extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'crates',name:'Crates',brief:'',guards:[],map,...extra})});
const run=(g,input,s)=>{for(let i=0;i<Math.round(s*120)&&g.status==='playing';i++)g.advance(1/120,input);};
const ROOM=['############','#@.........#','#..........#','#..........#','#K........X#','############'];

test('leaning into a crate shoves it a tile, loudly; crawling into it does not',()=>{
  const g=make(ROOM,{crates:[[4,2]]});Object.assign(g.player,{x:2.5,y:2.5});
  let noisy=false;for(let i=0;i<120;i++){g.advance(1/120,{x:1,y:0});noisy=noisy||g.player.noisy;}
  assert.equal(g.crates[0].x,5,'one tile east');assert.ok(noisy,'the scrape is heard');assert.ok(g.drainEvents().includes('scrape'));
  assert.equal(g.floor(5,2),false,'the crate blocks its new tile');assert.equal(g.floor(4,2),true,'and frees the old one');
  const c=make(ROOM,{crates:[[4,2]]});Object.assign(c.player,{x:2.5,y:2.5});run(c,{x:1,y:0,crawl:true},2);assert.equal(c.crates[0].x,4,'a crawl cannot shove');
});
test('a crate hides Sally from a hunter and stops a throw',()=>{
  const g=make(ROOM,{crates:[[5,2]]});Object.assign(g.player,{x:7.5,y:2.5});
  assert.equal(g.sightFloor(5,2),false,'sight stops at the crate');assert.equal(g.lineVisible({x:2.5,y:2.5},{x:7.5,y:2.5}),false);
  g.player.throwAim={x:-1,y:0};const plan=g.planThrow(1);assert.ok(plan.bounces.length>=1,'the pebble bounces off it');assert.ok(plan.land.x>5.5);
});
test('a crate will not cover the key or the exit, or go through a wall',()=>{
  const g=make(['#######','#@....#','#.....#','#K....#','#....X#','#######'],{crates:[[2,3],[4,4],[1,1]]});
  Object.assign(g.player,{x:3.5,y:3.5});run(g,{x:-1,y:0},1.5);assert.equal(g.crates[0].x,2,'not onto the key');
  Object.assign(g.player,{x:3.5,y:4.5});run(g,{x:1,y:0},1.5);assert.equal(g.crates[1].x,4,'not onto the exit');
  const w=make(ROOM,{crates:[[1,2]]});Object.assign(w.player,{x:2.5,y:2.5});run(w,{x:-1,y:0},1.5);assert.equal(w.crates[0].x,1,'not into a wall');
});
test('a crate pushed into a gap drops in and makes a way across',()=>{
  const g=make(['#########','#@..#...#','#...._..#','#K..#..X#','#########'],{crates:[[3,2]]});
  assert.equal(g.route(g.player,{x:6.5,y:2.5}).length,0,'no way across yet');
  Object.assign(g.player,{x:1.5,y:2.5});run(g,{x:1,y:0},2.2);
  assert.equal(g.crates[0].sunk,true);assert.equal(g.grid[2][5],'.');assert.ok(g.route(g.player,{x:6.5,y:2.5}).length>0,'now a way across');
  run(g,{x:1,y:0},.3);assert.ok(g.crates[0].sunk&&g.crates[0].x===5,'a sunk crate stays put');
});
test('a crate shoved onto ice slides until something stops it',()=>{
  const g=make(ROOM,{crates:[[3,2]],slippery:[[4,2],[5,2],[6,2],[7,2],[8,2]]});Object.assign(g.player,{x:1.5,y:2.5});
  run(g,{x:1,y:0},.9);run(g,{},2);assert.equal(g.crates[0].x,9,'slid the length of the ice and just off it');
});
test('the builder places crates, they survive saving, and a built level has them',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);
  assert.equal(B.toggleCrate(m,4,4),true);assert.deepEqual(m.crates,[[4,4]]);
  const back=B.fromRoute(B.toRoute(m));assert.deepEqual(back.crates,[[4,4]]);
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'b',name:'B',...B.toRoute(m)})});assert.equal(g.crates.length,1);assert.equal(g.floor(4,4),false);
  assert.equal(B.toggleCrate(m,4,4),true);assert.deepEqual(m.crates,[],'clicking again removes it');
  assert.equal(B.toggleCrate(m,0,0),false,'not on a wall');
});
