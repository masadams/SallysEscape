const test=require('node:test'),assert=require('node:assert/strict');
const {SallyCharacter,celebrationFor,celebrationSVG}=require('../public/sally-character.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
function arena(){
  const g=new EscapeAdventure({levelId:'fern-cloister'});
  for(let y=1;y<12;y++)for(let x=1;x<27;x++)g.grid[y][x]='.';
  const h=g.hunter;g.hunters=[h];Object.assign(h,{x:10.5,y:5.5,state:'still',awakened:false});
  Object.assign(g.player,{x:7.5,y:5.5,facing:{x:1,y:0}});g.motion.resetPlayer(g.player);g.motion.resetHunter(h);g.updateVisibility(true);
  return {g,h,c:new SallyCharacter()};
}
test('Sally notices visible threats, never enemies behind walls, fog or a disguised mimic',()=>{
  const {g,h,c}=arena();assert.equal(c.update(g).mood,'curious');
  h.state='follow';assert.equal(c.update(g).mood,'alert');
  g.grid[5][9]='#';assert.equal(c.update(g).mood,'calm');g.grid[5][9]='.';
  // The rebuilt cloister is fully revealed; fog is exercised on an exploration route.
  const fog=new EscapeAdventure({levelId:'root-cathedral'});Object.assign(fog.player,g.player);fog.hunters=[h];fog.grid=g.grid;fog.visible.clear();assert.equal(c.update(fog).mood,'calm');
  h.kind='mimic';h.state='rooted';assert.equal(c.update(g).mood,'calm');
  h.kind='cricket';h.state='buried';assert.equal(c.update(g).mood,'calm');
});
test('look-back expression follows actual gaze without changing the player, hunter or collision rig',()=>{
  const {g,h,c}=arena();g.lookBack();
  const before=JSON.stringify({player:g.player,hunter:h,rig:g.motion.lizard,alarms:g.alarms});
  const face=c.update(g);assert.equal(face.mood,'nervous');assert.equal(face.headAngle,Math.PI);
  assert.deepEqual(c.drainCues(),['sallyGlance']);c.update(g);assert.deepEqual(c.drainCues(),[]);
  assert.equal(JSON.stringify({player:g.player,hunter:h,rig:g.motion.lizard,alarms:g.alarms}),before);
  g.elapsed=.7;assert.equal(c.update(g).headAngle,null);
});
test('a tongue cast alone earns no success reaction; an actual pickup does, once',()=>{
  const {g,h,c}=arena();h.x=20.5;g.key={x:9.5,y:5.5};g.useTongue();
  c.update(g,g.drainEvents());assert.notEqual(c.face.mood,'pleased');assert.deepEqual(c.drainCues(),[]);
  g.advance(.1);g.advance(.06);const events=g.drainEvents();assert.ok(events.includes('key'));
  assert.equal(c.update(g,events).mood,'pleased');assert.equal(c.face.smile,1);assert.deepEqual(c.drainCues(),['sallyPleased']);
  c.update(g);assert.deepEqual(c.drainCues(),[]);g.elapsed+=1;assert.notEqual(c.update(g).mood,'pleased');
});
test('tail reactions yield to danger, pause freezes expressions, and a new attempt resets them',()=>{
  const {g,h,c}=arena();h.x=20.5;g.hasTail=false;g.elapsed=1;
  assert.equal(c.update(g,['tailDrop']).mood,'startled');g.elapsed=2.3;g.player.moving=true;
  assert.notEqual(c.update(g).mood,'tail-check');g.elapsed=6;g.player.moving=false;assert.equal(c.update(g).mood,'tail-check');
  g.paused=true;const frozen=JSON.stringify(c.face);g.elapsed=7;c.update(g,['regrow']);assert.equal(JSON.stringify(c.face),frozen);
  g.paused=false;g.hasTail=true;assert.equal(c.update(g,['regrow']).mood,'pleased');
  h.x=8.5;h.state='follow';g.updateVisibility(true);assert.equal(c.update(g).mood,'alert');
  const fresh=new SallyCharacter();assert.equal(fresh.face.mood,'calm');assert.deepEqual(fresh.drainCues(),[]);
});
test('result celebrations reflect the run without changing its score or rewarding a failed run',()=>{
  const r={status:'won',alarms:0,tailsDropped:0,treasure:1,totalTreasure:10,hasTail:true,stars:2};
  const before=JSON.stringify(r);assert.equal(celebrationFor(r).mood,'sneaky');assert.equal(JSON.stringify(r),before);
  assert.equal(celebrationFor({...r,treasure:8}).mood,'proud');
  assert.equal(celebrationFor({...r,alarms:1,treasure:10}).mood,'relieved');
  assert.match(celebrationFor({...r,tailsDropped:1,hasTail:false}).label,/missing tail/);
  const skin={body:[90,160,80],dark:[30,60,35],light:[200,220,160]};
  assert.match(celebrationSVG({...r,treasure:8},skin),/sally-proud/);
  assert.doesNotMatch(celebrationSVG({...r,hasTail:false},skin),/sally-celebration-tail/);
  assert.equal(celebrationFor({...r,status:'caught'}),null);assert.equal(celebrationSVG({...r,status:'caught'},skin),'');
});
test('reduced motion keeps expressions and gaze readable without pupil scanning or chewing loops',()=>{
  const {g}=arena(),c=new SallyCharacter({reducedMotion:true});g.lookBack();
  const face=c.update(g);assert.equal(face.mood,'nervous');assert.equal(face.look,0);assert.equal(face.headAngle,Math.PI);
  g.lookUntil=0;g.hunters=[];g.elapsed=1;c.update(g,['tongue']);g.elapsed=1.2;
  assert.equal(c.update(g,['treasure']).smile,1);assert.equal(c.face.chew,0);
});
