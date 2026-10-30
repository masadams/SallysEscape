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
test('fast ice (new and builder levels) gives way about twice as quickly; the first winter levels keep their gentler ice',()=>{
  const time=extra=>{const g=make(extra);g.player.x=5.5;g.player.y=2.5;let t=0;while(g.status==='playing'&&!g.thinIce.get('5,2').broken&&t<5){g.advance(1/120,{});t+=1/120;}return t;};
  const slow=time(),fast=time({iceSpeed:'fast'});assert.ok(fast<.45,'fast ice breaks under a standing Sally in well under half a second: '+fast.toFixed(2));assert.ok(slow>fast*1.6,'slow ice holds much longer: '+slow.toFixed(2));
  const B=require('../public/escape-builder.js'),m=B.blank(21,13);m.thinIce=[[3,3]];assert.equal(B.toRoute(m).iceSpeed,'fast','new builder levels get fast ice');
  B.setSettings(m,{slowIce:true});assert.equal(B.toRoute(m).iceSpeed,undefined,'unless set to slow');
  const {EscapeCatalog}=require('../public/escape-levels.js');const old=[...EscapeCatalog.levels,...(EscapeCatalog.seasonal||[])].filter(l=>l.thinIce?.length);
  assert.ok(old.length>=4);for(const l of old){assert.notEqual(l.iceSpeed,'fast',l.id);assert.equal(B.fromRoute(l).slowIce,true,l.id+' keeps slow ice when opened in the builder');}
});
test('thin ice laid over water is ice to walk on until it breaks, then Sally falls into the water below',()=>{
  const map=['############','#@...~~....#','#....~~....#','#K........X#','############'];
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'pond',name:'Pond',brief:'',guards:[],map,thinIce:[[5,1],[6,1]],iceSpeed:'fast'})});
  assert.equal(g.grid[1][5],'.','frozen over: firm to step on');assert.equal(g.grid[2][5],'U','open water beside it stays water');assert.ok(g.thinIce.get('5,1').overWater);
  Object.assign(g.player,{x:5.5,y:1.5});run(g,.2);assert.equal(g.player.swimming,false,'standing on the ice, not in the water');
  run(g,.6);assert.equal(g.grid[1][5],'U','it gave way');assert.equal(g.player.swimming,true,'Sally fell in');
});
test('on fast ice creatures crack it too: one that falls in swims for shore, or an eel takes it',()=>{
  const map=['################','#@.....~~~.....#','#......~~~.....#','#......~~~.....#','#X............K#','################'];
  const ice=[];for(let y=1;y<=3;y++)for(let x=7;x<=9;x++)ice.push([x,y]);
  const level=(guards,thinIce=ice)=>new EscapeAdventure({level:escapeBuildCustom({id:'lake',name:'Lake',brief:'',map,thinIce,iceSpeed:'fast',guards})});
  const g=level([{kind:'cavefolk',spawn:[4,2],facing:0,patrol:[[4,2],[12,2]]}]),c=g.hunters[0];Object.assign(g.player,{x:1.5,y:4.5,hidden:true});
  let swam=false,grabbed=false;for(let i=0;i<120*16;i++){g.advance(1/120,{});if(c.swimming)swam=true;}
  assert.ok(swam,'it fell through');assert.equal(c.swimming,false,'and climbed out');assert.ok(c.x>10,'then carried on with its rounds the long way round: '+c.x.toFixed(1));
  const e=level([{kind:'beetle',spawn:[4,2],facing:0,patrol:[[4,2],[12,2]]},{kind:'eel',spawn:[8,3],facing:0,patrol:[[8,3]]}],ice.filter(([,y])=>y<3));Object.assign(e.player,{x:1.5,y:4.5,hidden:true});
  run(e,8);assert.equal(e.hunters[0].eaten,true,'the eel took the beetle');assert.match(e.message+' '+(e.messages||''),/./);
  const sw=level([{kind:'cavefolk',spawn:[8,2],facing:0,patrol:[[8,2]]}]);sw.thinIce.get('8,2').crack=1;sw.breakIce(sw.thinIce.get('8,2'));Object.assign(sw.player,{x:8.5,y:2.5});sw.invulnerableUntil=0;sw.advance(1/120,{});
  assert.equal(sw.hunters[0].swimming,true);assert.equal(sw.status==='caught'&&/cave folk|hunter/.test(sw.message),false,'a floundering creature cannot grab Sally');
});
test('slow-ice levels are untouched: creatures never crack the first winter levels’ ice',()=>{
  const map=['############','#@.........#','#..........#','#K........X#','############'];
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'old',name:'Old',brief:'',map,thinIce:[[4,2],[5,2],[6,2]],guards:[{kind:'beetle',spawn:[2,2],facing:0,patrol:[[2,2],[9,2]]}]})});
  Object.assign(g.player,{x:1.5,y:3.5,hidden:true});run(g,8);for(const t of g.thinIce.values())assert.equal(t.crack,0);assert.equal(g.hunters[0].swimming,undefined);
});
