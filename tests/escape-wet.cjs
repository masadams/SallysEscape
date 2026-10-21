const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const MAP=['##############','#@...........#','#............#','#K..........X#','##############'];
const WET=[3,4,5,6,7,8,9].map(x=>[x,2]),SLOPE=[{area:[3,2,6,2],dir:[1,0],speed:1.2,surface:'ground'}];
const make=(extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'wet',name:'Wet',brief:'',guards:[],map:MAP,...extra})});
const run=(g,s,input={})=>{for(let i=0;i<Math.round(s*120)&&g.status==='playing';i++)g.advance(1/120,input);};

test('on wet ground Sally slides on a little when she lets go; on dry ground she stops dead',()=>{
  const dry=make(),wet=make({wet:WET});for(const g of [dry,wet]){Object.assign(g.player,{x:2.5,y:2.5});run(g,1,{x:1,y:0});g.mark=g.player.x;run(g,1);}
  assert.ok(dry.player.x-dry.mark<.01,'dry');assert.ok(wet.player.x-wet.mark>.25,'wet slide: '+(wet.player.x-wet.mark));
});
test('a wet slope speeds Sally down it and carries her past its foot; a crawl grips and stops at the end',()=>{
  const still=make({wet:WET,currents:SLOPE}),crawl=make({wet:WET,currents:SLOPE}),dry=make({currents:SLOPE});
  for(const g of [still,crawl,dry])Object.assign(g.player,{x:3.5,y:2.5});
  run(still,1.6);run(dry,1.6);assert.ok(still.player.x>dry.player.x+.3,'faster than a dry slope: '+still.player.x+' vs '+dry.player.x);
  run(still,3);run(crawl,5,{crawl:true});assert.ok(still.player.x>7.4,'ran on past the foot: '+still.player.x);assert.ok(crawl.player.x<7.05,'the crawl stops at the end: '+crawl.player.x);
});
test('the builder paints wet ground and keeps it through saving',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);assert.ok(B.toggleLayer(m,'wet',4,4));
  assert.deepEqual(B.fromRoute(B.toRoute(m)).wet,[[4,4]]);
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'b',name:'B',...B.toRoute(m)})});assert.equal(g.wet.size,1);
});
