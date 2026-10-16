const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {escapeBuildCustom}=require('../public/escape-levels.js');
function ticks(g,s,input={}){for(let n=0;n<Math.ceil(s*120)&&g.status==='playing';n++)g.advance(1/120,input);}
const ROWS=['#################','#@..............#','#...............#','#.....ttttt.....#','#.....ttttt.....#','#.....ttttt.....#','#...............#','#K.............X#','#################'];
const room=(extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'custom-test',name:'Test',map:ROWS,guards:[],...extra})});
const add=(g,guard)=>{const h=g.makeHunter({facing:0,patrol:[guard.spawn],...guard});g.hunters.push(h);g.motion.resetHunter(h,g.hunters.length-1);return h;};

test('tide flats are water at high tide and sand at low tide, on the level rhythm',()=>{
  const g=room({tide:{period:10,high:4,offset:0}});assert.equal(g.tideFlats.length,15);
  assert.equal(g.grid[4][8],'U','high tide at the start');ticks(g,4.2);assert.equal(g.grid[4][8],'.','then the tide goes out');
  assert.match(g.message,/tide is out/);ticks(g,6);assert.equal(g.grid[4][8],'U','and comes back in');
  Object.assign(g.player,{x:8.5,y:4.5});ticks(g,.1);assert.equal(g.player.swimming,true,'Sally swims the flats at high tide');
});
test('an eel lunges at Sally on the edge of its pool, but lies buried when the tide is out',()=>{
  const g=room({tide:{period:20,high:10,offset:0}});const eel=add(g,{kind:'eel',spawn:[8,3]});Object.assign(g.player,{x:3.5,y:2.5});
  ticks(g,3.5,{x:1});assert.equal(g.status,'caught','walking the edge past its pool');assert.match(g.result.message,/eel/);
  const dry=room({tide:{period:20,high:10,offset:10}});const e2=add(dry,{kind:'eel',spawn:[8,3]});Object.assign(dry.player,{x:3.5,y:2.5});
  ticks(dry,3.5,{x:1});assert.equal(dry.status,'playing');assert.equal(e2.state,'buried','at low tide it is buried');
  const wide=room({tide:{period:20,high:10,offset:0}});add(wide,{kind:'eel',spawn:[8,3]});Object.assign(wide.player,{x:3.5,y:1.5});
  ticks(wide,3.5,{x:1});assert.equal(wide.status,'playing','a tile further back is safe');
});
