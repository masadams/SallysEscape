const test=require('node:test'),assert=require('node:assert/strict');
const {escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const make=(map,extra={})=>new EscapeAdventure({level:escapeBuildCustom({id:'throw-test',name:'Throw test',brief:'',pebbles:3,glows:2,guards:[],map,...extra})});
const hall=['####################','#@................K#','#..................#','#X.................#','####################'];
// A corridor that turns a corner: from the start, the bottom of the bend cannot be seen.
const bend=['###########','#....@#####','#.....#####','#.........#','#.....###.#','#K....###X#','###########'];
function run(g,input,seconds){for(let i=0;i<Math.round(seconds*120);i++)g.advance(1/120,input);return g;}
const aim=(g,x,y)=>{const l=Math.hypot(x,y);g.player.throwAim={x:x/l,y:y/l};};

test('a held throw goes further: a tap about 2.6 tiles, full power about 6',()=>{
  const g=make(hall);aim(g,1,0);
  const tap=g.planThrow(0),full=g.planThrow(1);
  assert.ok(Math.abs(tap.land.x-g.player.x-2.6)<.1,'tap '+(tap.land.x-g.player.x));
  assert.ok(Math.abs(full.land.x-g.player.x-6)<.1,'full '+(full.land.x-g.player.x));
  assert.equal(tap.bounces.length,0);
});

test('a throw banks off walls, at most twice, losing distance each time',()=>{
  const g=make(hall);g.player.x=17.5;aim(g,1,0);const p=g.planThrow(1);
  assert.equal(p.bounces.length,1,'it hits the east wall and comes back');assert.ok(p.land.x<17.5);
  const z=make(['####################','#@...............KX#','####################']);aim(z,1,1);
  const zig=z.planThrow(1);assert.equal(zig.bounces.length,2,'zigzagging down a narrow hall it stops after two bounces');
});

test('some aim banks a pebble round a corner into a passage Sally cannot see',()=>{
  const g=make(bend);let found=null;
  for(let a=-Math.PI;a<=Math.PI&&!found;a+=.01){aim(g,Math.cos(a),Math.sin(a));const p=g.planThrow(1);if(p.bounces.length&&!g.clear(g.player,p.land,true))found=p;}
  assert.ok(found,'no aim reached the bend');
});

test('a thrown pebble makes noise where it bounces, then where it lands',()=>{
  const g=make(hall);g.player.x=15.5;aim(g,1,0);assert.equal(g.throwDecoy(.6),true);assert.equal(g.decoys,2);
  assert.equal(g.decoy,null,'nothing is heard while it is in the air');
  run(g,{},.45);assert.ok(g.decoy?.echo,'a clack where it hit the wall');assert.ok(g.decoy.x>17.5);
  run(g,{},.6);assert.ok(g.decoy&&!g.decoy.echo,'then the landing');assert.ok(g.decoy.x<g.player.x+3);
  assert.ok(g.decoy.expires-g.elapsed>3);
});

test('a glow mushroom lights the ground round where it lands, lighting Sally there too',()=>{
  const g=make(hall,{explore:true,sightRadius:2});aim(g,1,0);
  assert.equal(g.visibleTile(9,1),false,'beyond sight it is dark');
  assert.equal(g.throwGlow(1),true);assert.equal(g.glows,1);run(g,{},1);
  assert.equal(g.lights.length,1);assert.equal(g.visibleTile(Math.floor(g.lights[0].x),1),true,'the lit ground is seen');
  assert.equal(g.inLight(),false);g.player.x=g.lights[0].x;assert.equal(g.inLight(),true);
  run(g,{},12);assert.equal(g.lights.length,0,'it fades after about twelve seconds');
  const none=make(hall,{glows:0});assert.equal(none.throwGlow(1),false);
});

test('holding a throw aims instead of walking, and an old-style toss is unchanged',()=>{
  const g=make(hall),x=g.player.x;run(g,{x:0,y:1,aiming:true},.3);assert.equal(g.player.x,x);assert.equal(g.player.y,1.5);assert.deepEqual(g.player.throwAim,{x:0,y:1});
  const legacy=make(hall);legacy.player.facing={x:1,y:0};assert.equal(legacy.throwDecoy(),true);assert.ok(legacy.decoy,'a plain toss lands at once, as before');assert.equal(legacy.flights.length,0);
});
