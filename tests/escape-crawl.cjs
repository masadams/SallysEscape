const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
// A long open hall: Sally starts at the west end, the key and hatch are well out of the way.
const hall=(guards,row='#@..............K#')=>escapeBuildCustom({id:'crawl-test',name:'Crawl test',brief:'',map:['##################',row,'#................#','#X...............#','##################'],guards});
const PI=Math.PI;
function run(g,input,seconds){for(let i=0;i<seconds*120;i++)g.advance(1/120,input);return g;}

test('crawling is about half walking pace, silent on gravel, and wins over sprint',()=>{
  const walk=run(new EscapeAdventure({level:hall([])}),{x:1,y:0},1),crawl=run(new EscapeAdventure({level:hall([])}),{x:1,y:0,crawl:true,sprint:true},1);
  const walked=walk.player.x-1.5,crawled=crawl.player.x-1.5;
  assert.ok(crawled>walked*.4&&crawled<walked*.6,'crawl '+crawled.toFixed(2)+' vs walk '+walked.toFixed(2));
  assert.equal(crawl.player.crawling,true);assert.equal(crawl.player.sprinting,false);assert.equal(crawl.player.stamina,100);
  const gravel=new EscapeAdventure({level:hall([],'#@NNNNNNNNNNNNNNK#')});run(gravel,{x:1,y:0,crawl:true},.5);assert.equal(gravel.player.noisy,false);
  run(gravel,{x:1,y:0},.2);assert.equal(gravel.player.noisy,true,'walking on gravel is still noisy');
});

test('a snake sees a crawling Sally a tile closer, and takes longer to be sure',()=>{
  // The snake faces Sally from four tiles off: walking she is seen, crawling she is not yet.
  const make=()=>new EscapeAdventure({level:hall([{spawn:[5,1],facing:PI,patrol:[[5,1]]}])});
  const a=make();run(a,{x:0,y:1},.2);assert.notEqual(a.hunters[0].state,'patrol','walking, she is spotted');
  const b=make();run(b,{x:0,y:1,crawl:true},.3);assert.equal(b.hunters[0].state,'patrol','crawling at four tiles, she is not');
  // Up close it sees her either way, but a crawl stretches the "?" before the chase.
  const near=()=>new EscapeAdventure({level:hall([{spawn:[3,1],facing:PI,patrol:[[3,1]]}])});
  const c=near();run(c,{x:0,y:1},.8);assert.equal(c.hunters[0].state,'chase');
  const d=near();run(d,{x:0,y:1,crawl:true},.8);assert.equal(d.hunters[0].state,'alert');
  run(d,{x:0,y:1,crawl:true},.6);assert.equal(d.hunters[0].state,'chase','it is sure after about 1.2 seconds');
});

test('a fox only hears a crawl right beside it',()=>{
  const make=()=>new EscapeAdventure({level:hall([{kind:'fox',spawn:[3,1],facing:0,patrol:[[3,1]]}])});
  const a=make();run(a,{x:0,y:1},.1);assert.equal(a.hunters[0].state,'crouch','walking two tiles off, it pounces');
  const b=make();run(b,{x:0,y:1,crawl:true},.5);assert.equal(b.hunters[0].state,'patrol','crawling, it hears nothing');
});

test('a mole hears a crawl only close by',()=>{
  const make=()=>new EscapeAdventure({level:hall([{kind:'mole',spawn:[5,1],facing:0,patrol:[[5,1]]}])});
  const a=make();a.player.moving=true;a.player.crawling=false;assert.ok(a.moleHears(a.hunters[0]),'walking three tiles off, it hears');
  const b=make();b.player.moving=true;b.player.crawling=true;assert.equal(b.moleHears(b.hunters[0]),null,'crawling, it does not');
});

test('a mimic lets a crawling Sally come closer, and a flytrap hesitates at a crawl',()=>{
  const mimic=()=>new EscapeAdventure({level:hall([{kind:'mimic',spawn:[3,1],facing:0,patrol:[[3,1]]}])});
  const a=mimic();a.player.x=2.0;run(a,{x:0,y:1},.05);assert.equal(a.hunters[0].state,'reveal','walking 1.5 tiles off, it springs');
  const b=mimic();b.player.x=2.0;run(b,{x:0,y:1,crawl:true},.3);assert.equal(b.hunters[0].state,'rooted','crawling, it stays a chest');
  const trap=crawl=>{const g=new EscapeAdventure({level:hall([{kind:'flytrap',spawn:[3,1],facing:PI,patrol:[[3,1]]}])});g.player.x=2.1;run(g,{x:0,y:1,crawl},1/120);return g.hunters[0].phaseUntil-g.elapsed;};
  assert.ok(trap(true)>trap(false)+.2,'crawling, the snap comes later');
});

test('a map too big to read whole follows Sally at a readable size, unless whole-map view is chosen',()=>{
  const {escapeCameraFor}=require('../public/escape-view.js');const {EscapeCatalog}=require('../public/escape-levels.js');
  const big=new EscapeAdventure({hiddenId:'the-long-way-home'}),small=new EscapeAdventure({levelId:'quiet-vault'});
  const v=escapeCameraFor(big,1230,600);assert.equal(v.follow,true);assert.ok(v.cell>=30,'cell '+v.cell);
  assert.equal(escapeCameraFor(big,1230,600,true).follow,false,'whole-map view is kept when chosen');
  assert.equal(escapeCameraFor(small,1230,600).follow,false,'a small map still shows whole');
  assert.ok(EscapeCatalog);
});
