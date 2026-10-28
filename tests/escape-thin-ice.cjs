const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const MAP=['############','#@.........#','#..........#','#K........X#','############'];
const ICE=[[4,2],[5,2],[6,2]];
const make=(extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'thin',name:'Thin',brief:'',guards:[],map:MAP,thinIce:ICE,...extra})});
const run=(g,s,input={})=>{for(let i=0;i<Math.round(s*120)&&g.status==='playing';i++)g.advance(1/120,input);};

test('standing on thin ice cracks it, creaks a warning, then drops Sally into the water',()=>{
  const g=make();Object.assign(g.player,{x:5.5,y:2.5});run(g,.45);
  assert.ok(g.thinIce.get('5,2').crack>.5);assert.ok(g.drainEvents().includes('icecrack'),'a warning crackle');assert.equal(g.grid[2][5],'.');
  run(g,.4);assert.equal(g.grid[2][5],'U','it gave way');assert.equal(g.player.swimming,true,'Sally is in the water');assert.ok(g.player.noisy,'the splash is loud');
});
test('walking straight across leaves cracks but gets Sally over; crawling barely marks it',()=>{
  const g=make();Object.assign(g.player,{x:3.5,y:2.5});run(g,1.6,{x:1,y:0});
  assert.ok(g.player.x>7,'across');assert.ok([...g.thinIce.values()].every(t=>!t.broken),'nothing broke');assert.ok(g.thinIce.get('5,2').crack>.1,'but it cracked');
  const c=make();Object.assign(c.player,{x:5.5,y:2.5});run(c,3,{crawl:true});assert.equal(c.thinIce.get('5,2').broken,false,'a crawl spreads her weight');
});
test('sprinting across thin ice cracks it far more than walking',()=>{
  const walk=make(),dash=make();for(const g of [walk,dash])Object.assign(g.player,{x:5.5,y:2.5});
  run(walk,.25,{x:.2,y:0});run(dash,.25,{x:.2,y:0,sprint:true});
  assert.ok(dash.thinIce.get('5,2').crack>walk.thinIce.get('5,2').crack*2,'sprint '+dash.thinIce.get('5,2').crack+' walk '+walk.thinIce.get('5,2').crack);
});
test('a crate shoved onto thin ice crashes through it',()=>{
  const g=make({crates:[[3,2]]});Object.assign(g.player,{x:1.5,y:2.5});run(g,1.2,{x:1,y:0});
  assert.equal(g.crates[0].lost,true);assert.equal(g.grid[2][4],'U');assert.equal(g.floor(4,2),true,'the hole is water, not a crate');
});
test('the builder paints thin ice and keeps it through saving',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);assert.ok(B.toggleLayer(m,'thinIce',4,4));
  const back=B.fromRoute(B.toRoute(m));assert.deepEqual(back.thinIce,[[4,4]]);
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'b',name:'B',...B.toRoute(m)})});assert.equal(g.thinIce.size,1);
});
