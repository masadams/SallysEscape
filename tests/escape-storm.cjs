const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {escapeBuildCustom}=require('../public/escape-levels.js');
function ticks(g,s,input={}){for(let n=0;n<Math.ceil(s*120)&&g.status==='playing';n++)g.advance(1/120,input);}
const ROWS=['#################','#@..............#','#...............#','#...............#','#...........L...#','#...............#','#...............#','#K.............X#','#################'];
function room(extra={}){return new EscapeAdventure({level:escapeBuildCustom({id:'custom-test',name:'Test',map:ROWS,guards:[],...extra})});}
const add=(g,guard)=>{const h=g.makeHunter({facing:0,patrol:[guard.spawn],...guard});g.hunters.push(h);g.motion.resetHunter(h,g.hunters.length-1);return h;};

test('a wind lane gusts on its rhythm and shoves Sally along it',()=>{
  const g=room({wind:[{area:[3,3,13,5],dir:[1,0],period:4,on:1.5,offset:0}]});Object.assign(g.player,{x:5.5,y:4.5});
  ticks(g,1);assert.ok(g.player.x>7,'pushed east while still: '+g.player.x);ticks(g,.6);const x=g.player.x;ticks(g,2);assert.ok(g.player.x-x<.05,'calm between gusts');
});
test('lightning lets every hunter with a clear line see Sally for a moment, even in leaves',()=>{
  const g=room({storm:{every:5,warn:1.2,first:2}});Object.assign(g.player,{x:12.5,y:4.5});const h=add(g,{spawn:[5,4],facing:Math.PI});h.pauseUntil=100;
  ticks(g,1);assert.equal(g.player.hidden,true,'in leaves');assert.equal(g.seesPlayer(h),false,'facing away, and hidden');
  ticks(g,1.05);assert.ok(g.elapsed<g.flashUntil,'the flash');assert.equal(g.seesPlayer(h),true,'the flash shows her');
  ticks(g,.5);assert.equal(g.seesPlayer(h),false,'then the dark again');
});
test('an echo bat swoops on Sally when its sonar ring finds her moving, never when she is still',()=>{
  const still=room();Object.assign(still.player,{x:8.5,y:4.5});add(still,{kind:'bat',spawn:[5,2],patrol:[[5,2],[11,2]],every:1});ticks(still,6);assert.equal(still.status,'playing');
  const g=room();Object.assign(g.player,{x:6.5,y:5.5});const bat=add(g,{kind:'bat',spawn:[5,2],patrol:[[5,2],[11,2]],every:1});
  let dove=false;for(let i=0;i<120*6&&g.status==='playing';i++){g.advance(1/120,{x:(Math.floor(i/120)%2)?1:-1});dove=dove||bat.state==='dive';}
  assert.ok(dove,'it swooped');assert.equal(g.status,'caught');assert.match(g.result.message,/bat/);
});
test('a gust that shoves Sally against a ledge over a gap blows her off it',()=>{
  const rows=['#################','#@..............#','#...............#','#...............#','#.........______#','#...............#','#...............#','#K.............X#','#################'];
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'custom-test',name:'T',map:rows,guards:[],wind:[{area:[2,2,14,3],dir:[0,1],period:5,on:2,offset:0}]})});
  Object.assign(g.player,{x:12.5,y:2.5});ticks(g,1.5);assert.equal(g.status,'caught');assert.match(g.result.message,/gust/);
  const wall=new EscapeAdventure({level:escapeBuildCustom({id:'custom-test',name:'T',map:rows,guards:[],wind:[{area:[2,2,14,3],dir:[0,1],period:5,on:2,offset:0}]})});
  Object.assign(wall.player,{x:5.5,y:2.5});ticks(wall,1.5);assert.equal(wall.status,'playing','over floor it only shoves');
});
test('Storm Heights follows the Mushroom Grotto with five escapes that teach wind, lightning and the echo bat',()=>{
  const {EscapeCatalog}=require('../public/escape-levels.js'),{EscapeWorld}=require('../public/escape-world.js');
  const storm=EscapeCatalog.levels.slice(83,88);assert.deepEqual(storm.map(l=>l.id),['gale-steps','thunder-ridge','belfry','kite-cliffs','eye-of-the-storm']);
  assert.ok(EscapeCatalog.regions.includes(83));for(const l of storm){assert.equal(l.loot.reduce((n,t)=>n+t[2],0),10);assert.ok(l.tailDrop);}
  assert.ok(storm[0].wind.length>=3);assert.ok(storm[1].storm);assert.ok(storm[2].guards.filter(g=>g.kind==='bat').length>=2);assert.ok(storm[3].wind&&storm[3].guards.some(g=>g.kind==='bat'));
  assert.ok(storm[4].storm&&storm[4].wind&&storm[4].guards.some(g=>g.kind==='cobra'));assert.equal(storm[4].requiredTreasure,6);
  const w=new EscapeWorld(),c=w.chapters.find(c=>c.theme==='storm');assert.equal(c.name,'Storm Heights');assert.equal(c.start,83);
  assert.ok(w.paths.some(([a,b])=>w.chapters[a].theme==='grotto'&&w.chapters[b]===c),'Storm Heights opens off the Grotto');
});
test('a gusting lane carries a throw downwind, and a calm one does not',()=>{
  const wind=[{area:[3,2,13,6],dir:[0,1],period:4,on:2,offset:0}];
  const g=room({wind,pebbles:2});Object.assign(g.player,{x:3.5,y:2.5});g.player.throwAim={x:1,y:0};
  const calm=room({wind:[{...wind[0],offset:2.5}],pebbles:2});Object.assign(calm.player,{x:3.5,y:2.5});calm.player.throwAim={x:1,y:0};
  ticks(g,.1);ticks(calm,.1);assert.ok(g.gustPhase(g.wind[0]).active&&!calm.gustPhase(calm.wind[0]).active);
  const blown=g.planThrow(1).land,still=calm.planThrow(1).land;
  assert.ok(Math.abs(still.y-2.5)<.05,'a calm lane leaves it straight');assert.ok(blown.y-still.y>.6,'the gust carries it south: '+blown.y);
});
test('crawling braces Sally against a gust, and a breeze pushes less than a gale',()=>{
  const lane=extra=>room({wind:[{area:[3,3,13,5],dir:[1,0],period:4,on:1.5,offset:0,...extra}]});
  const walk=lane(),crawl=lane(),breeze=lane({strength:1});for(const g of [walk,crawl,breeze])Object.assign(g.player,{x:5.5,y:4.5});
  ticks(walk,1);ticks(crawl,1,{crawl:true});ticks(breeze,1);
  assert.ok(crawl.player.x-5.5<(walk.player.x-5.5)*.6,'braced: '+crawl.player.x+' vs '+walk.player.x);
  assert.ok(breeze.player.x<walk.player.x-.8,'breeze: '+breeze.player.x);
});
test('a gust blows a spore cloud down its lane',()=>{
  const g=room({wind:[{area:[3,2,13,6],dir:[1,0],period:4,on:2,offset:0}]});g.clouds.push({x:5.5,y:4.5,r:1.9,born:0,until:6});
  ticks(g,1);assert.ok(g.clouds[0].x>6.4,'drifted east: '+g.clouds[0].x);
});
test('the builder sets a wind lane\'s strength and any direction, and keeps them through saving',()=>{
  const B=require('../public/escape-builder.js');const m=B.blank(21,13);assert.ok(B.addWind(m,2,2,6,4));
  B.setWind(m,0,{dir:2});assert.deepEqual(m.wind[0].dir,[-1,0]);B.setWind(m,0,{dir:0});assert.deepEqual(m.wind[0].dir,[1,0],'east (index 0) can be picked again');
  B.setWind(m,0,{strength:1.2});const back=B.fromRoute(B.toRoute(m));assert.equal(back.wind[0].strength,1.2);
  B.setWind(m,0,{strength:2.3});assert.equal('strength' in m.wind[0],false,'the default is not stored');
});
