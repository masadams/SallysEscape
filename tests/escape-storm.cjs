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
