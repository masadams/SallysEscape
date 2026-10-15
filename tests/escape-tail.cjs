const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');
function ticks(g,seconds,input={}){for(let n=0;n<Math.round(seconds*120);n++)g.advance(1/120,input);}
// A lone snake bites Sally on an open floor tile of a tail-drop route.
function bitten(levelId='fern-cloister'){
  const g=new EscapeAdventure({levelId});const snake=g.hunters.find(h=>h.kind==='snake');g.hunters=[snake];g.hunter=snake;
  Object.assign(snake,{x:g.player.x+.3,y:g.player.y,state:'chase',awareness:1,lastKnown:{...g.player},lastObserved:0});
  return {g,snake};
}
test('only the later chapters forgive a catch; early routes and every challenge stay one-touch',()=>{
  const forgiving=EscapeCatalog.levels.filter(l=>l.tailDrop).map(l=>EscapeCatalog.levels.indexOf(l));
  assert.ok(forgiving.length>=15);assert.equal(Math.min(...forgiving),23,"the tail drop starts with the scorpions of Venom Depths");
  assert.equal(new EscapeAdventure({levelId:'quiet-vault'}).tailDrop,false);assert.equal(new EscapeAdventure({levelId:'the-heartwood'}).tailDrop,true);
  for(const c of EscapeCatalog.challenges)assert.equal(new EscapeAdventure({challengeId:c.id}).tailDrop,false);
  for(const l of EscapeCatalog.levels.filter(l=>l.regrowth))assert.ok(l.tailDrop,l.id+' has bugs only with a tail to regrow');
});
test('the first bite drops the tail as a decoy, the hunter chases it, and the second bite is final',()=>{
  const {g,snake}=bitten();ticks(g,1/120);
  assert.equal(g.status,'playing');assert.equal(g.hasTail,false);assert.equal(g.tailsDropped,1);assert.ok(g.droppedTail);assert.equal(g.player.stamina,100);
  const tail={...g.droppedTail};ticks(g,.6,{x:0,y:0});assert.equal(g.status,'playing','grace lets Sally slip away');assert.equal(snake.state,'decoy');
  assert.ok(Math.hypot(snake.x-tail.x,snake.y-tail.y)<.6,'the hunter goes to the wriggling tail');
  ticks(g,3);assert.equal(g.droppedTail,null);assert.notEqual(snake.state,'decoy','the lure ends');
  Object.assign(snake,{x:g.player.x+.3,y:g.player.y,graceUntil:0,tailLureUntil:0});g.invulnerableUntil=0;ticks(g,1/120);
  assert.equal(g.status,'caught');assert.equal(g.result.tailsDropped,1);assert.equal(g.result.hasTail,false);
});
test('a bite on an early route still ends the escape immediately',()=>{
  const g=new EscapeAdventure({levelId:'quiet-vault'});Object.assign(g.hunter,{x:g.player.x+.3,y:g.player.y});ticks(g,1/120);assert.equal(g.status,'caught');assert.equal(g.tailsDropped,0);
});
test('a tailless Sally is a little slower and cannot earn the third star',()=>{
  const a=new EscapeAdventure({levelId:'fern-cloister'}),b=new EscapeAdventure({levelId:'fern-cloister'});a.hunters=[];b.hunters=[];b.hasTail=false;
  ticks(a,.4,{x:0,y:-1});ticks(b,.4,{x:0,y:-1});const da=Math.abs(a.player.y-a.level.spawn[1]-.5),db=Math.abs(b.player.y-b.level.spawn[1]-.5);assert.ok(db<da&&db>da*.85);
  for(const g of [a,b]){g.hasKey=true;g.treasure=g.totalTreasure;g.finish('won','out');}
  assert.equal(a.result.stars,3);assert.equal(b.result.stars,2);
});
test('regrowth bugs only feed a tailless Sally, by foot or by tongue',()=>{
  const g=new EscapeAdventure({levelId:'fern-cloister'});g.hunters=[];g.regrowthBugs=[{x:g.player.x,y:g.player.y,eaten:false}];
  ticks(g,.1);assert.equal(g.regrowthBugs[0].eaten,false,'a whole tail leaves the bug alone');
  g.hasTail=false;ticks(g,.05);assert.equal(g.regrowthBugs[0].eaten,true);assert.equal(g.hasTail,true);
  const t=new EscapeAdventure({levelId:'fern-cloister'});t.hunters=[];t.hasTail=false;t.tongues=1;t.player.facing={x:0,y:-1};t.player.tongueAim=null;
  t.regrowthBugs=[{x:t.player.x,y:t.player.y-2,eaten:false}];assert.ok(t.clear(t.player,t.regrowthBugs[0],true));
  assert.equal(t.useTongue(),true);ticks(t,.3);assert.equal(t.hasTail,true);assert.equal(t.regrowthBugs[0].eaten,true);
});
test('the Shedding Hollow is a hard tail-drop region where a recorded escape loses and regrows the tail',()=>{
  const hollow=EscapeCatalog.levels.slice(49,53);assert.deepEqual(hollow.map(l=>l.id),['shedskin-gully','thornback-warren','moltwater-steps','old-shedding-tree']);
  assert.equal(hollow[0].unlockAfter,'the-heartwood');for(const l of hollow){assert.ok(l.tailDrop);assert.ok(l.regrowth.length>=3);assert.ok(l.guards.length>=4);}
  // A catch costs the tail; eating a glowing regrowth bug grows it back for the next one.
  const g=new EscapeAdventure({levelId:'shedskin-gully'}),h=g.hunters.find(h=>h.kind==='snake')||g.hunters[0];Object.assign(h,{x:g.player.x+.3,y:g.player.y});g.advance(1/120,{});
  assert.equal(g.status,'playing');assert.equal(g.tailsDropped,1);assert.equal(g.hasTail,false);
  g.hunters=[];const bug=g.regrowthBugs[0];Object.assign(g.player,{x:bug.x,y:bug.y});for(let i=0;i<30;i++)g.advance(1/120,{});
  assert.equal(g.hasTail,true);assert.equal(g.regrowthBugs.filter(b=>b.eaten).length,1);
});
test('the Lantern Marsh follows the Hollow with five routes that each reuse a different earlier mechanic',()=>{
  const marsh=EscapeCatalog.levels.slice(53,58);assert.deepEqual(marsh.map(l=>l.id),['firefly-ford','bramble-switchyard','snapdragon-terrace','rival-rooftops','moonwell-keep']);
  assert.equal(marsh[0].unlockAfter,'old-shedding-tree');for(const l of marsh){assert.ok(l.tailDrop);assert.ok(l.regrowth.length>=2);}
  assert.ok(marsh[0].dark&&marsh[0].gates[0].bridge);assert.equal(marsh[1].gates.filter(g=>g.duration&&g.plates.length===2).length,3);
  assert.ok(marsh[2].living&&marsh[2].guards.filter(h=>h.kind==='mimic').length===3&&marsh[2].seeds);assert.equal(marsh[3].rivalries.length,2);
  assert.equal(marsh.filter(l=>l.guards.some(h=>h.kind==='owl')).length,3);assert.equal(marsh[4].requiredTreasure,7);assert.equal(marsh[4].reactions.length,2);assert.equal(marsh[4].reinforcements.length,2);
});
