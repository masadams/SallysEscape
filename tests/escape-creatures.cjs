const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const make=(map,guards,extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'c',name:'c',brief:'',pebbles:1,guards,map,...extra})});
function run(g,input,seconds){for(let i=0;i<Math.round(seconds*120);i++)g.advance(1/120,input);return g;}
const PI=Math.PI;

test('an echo frog croaks Sally’s noise back from where it sits, and a snake goes to the frog',()=>{
  const g=make(['##############','#@NNNN......K#','#............#','#X...........#','##############'],[{kind:'echofrog',spawn:[6,1],facing:0,patrol:[[6,1]]},{spawn:[10,3],facing:0,patrol:[[10,3],[12,3]]}]);
  run(g,{x:1,y:0},.4);assert.equal(g.hunters[0].state,'swell','the crunch on gravel fills its throat');
  run(g,{},2);assert.ok(g.decoy?.croak,'it croaks');assert.ok(Math.abs(g.decoy.x-6.5)<.01,'from where it sits');
  run(g,{},1);assert.equal(g.hunters[1].state,'decoy','the snake goes to look');
  assert.equal(g.status,'playing');
});

test('an echo frog is harmless, rests after croaking, and echoes a pebble too',()=>{
  const g=make(['##############','#@..........K#','#............#','#X...........#','##############'],[{kind:'echofrog',spawn:[2,1],facing:0,patrol:[[2,1]]}]);
  g.player.x=2.5;run(g,{},1);assert.equal(g.status,'playing','touching it is safe');
  g.player.x=6.5;g.player.facing={x:-1,y:0};assert.equal(g.throwDecoy(),true);run(g,{},.05);assert.equal(g.hunters[0].state,'swell','a pebble’s clack nearby');
  run(g,{},2.7);assert.equal(g.hunters[0].state,'listen');g.decoy=null;g.player.x=3.5;run(g,{x:0,y:1,sprint:true},.3);assert.equal(g.hunters[0].state,'listen','it rests a while');
});

test('a chameleon creeps a little slower than a snake and pauses long at each end',()=>{
  const map=['################','#@............K#','#..............#','#X.............#','################'],patrol=[[2,2],[13,2]];
  const snake=make(map,[{spawn:[13,2],facing:PI,patrol}]),cham=make(map,[{kind:'chameleon',spawn:[13,2],facing:PI,patrol}]);
  for(const g of [snake,cham]){g.player.x=1.5;g.player.y=3.5;g.player.hidden=true;}
  run(snake,{},2);run(cham,{},2);assert.ok(cham.hunters[0].x>snake.hunters[0].x,'slower');
  assert.ok(cham.hunters[0].movedAt>0,'the scene can tell when it last moved');
});
