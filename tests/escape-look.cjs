const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCreatureMotion}=require('../public/creature-rig.js');

// The controller's right stick turns Sally's head: tongue and throws aim there, but her facing
// (what hunters and gaze levels go by) still follows her feet.
test('looking with the right stick aims the tongue without turning Sally',()=>{
  const g=new EscapeAdventure({levelId:'quiet-vault'});g.hunters=[];
  g.player.x=2.5;g.player.y=2.5;g.key={x:4.5,y:2.5};g.player.facing={x:0,y:-1};g.player.tongueAim={x:0,y:-1};
  g.advance(1/60,{look:{x:.9,y:0}});
  assert.deepEqual(g.player.facing,{x:0,y:-1});assert.deepEqual(g.player.lookAim,{x:1,y:0});assert.deepEqual(g.player.tongueAim,{x:1,y:0});
  assert.equal(g.tongueTarget()?.kind,'key');
  g.advance(1/60,{look:{x:.1,y:0}});assert.equal(g.player.lookAim,null,'a light touch inside the dead zone lets go');
});
test('the head turns toward where Sally looks, and only a quarter-turn each side while she walks',()=>{
  const g=new EscapeAdventure({levelId:'quiet-vault'});g.hunters=[];const m=new EscapeCreatureMotion(g);
  g.player.lookAim={x:0,y:1};for(let i=0;i<60;i++)m.update(1/60,g);
  assert.ok(Math.abs(m.lizard.headAngle-Math.PI/2)<.05,'standing still, the head turns all the way: '+m.lizard.headAngle);
});
