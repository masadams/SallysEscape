const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');const {EscapeProgress}=require('../public/escape-progress.js');const {EscapeWorld}=require('../public/escape-world.js');
const legacy=require('./fixtures/legacy-levels.json');
function ticks(g,seconds,input={}){for(let n=0;n<Math.round(seconds*120);n++)g.advance(1/120,input);}
function ledge(){const g=new EscapeAdventure({level:legacy['sunbaked-ledge']});g.hunters=[];g.motion.snakes=[];g.hawk.nextAt=0;Object.assign(g.player,{x:4.5,y:2.5});return g;}
test('Sunbaked Rooftops is a five-route branch with a hawk, awnings and camouflage in every route',()=>{
  const roofs=EscapeCatalog.levels.slice(58,63);assert.deepEqual(roofs.map(l=>l.id),['sunbaked-ledge','laundry-lines','chimney-run','pigeon-court','weathervane-spire']);
  for(const l of roofs){assert.ok(l.hawk&&l.camos>=2&&l.shade.length>=8&&l.tailDrop);assert.ok(l.shade.some(([x,y])=>x===l.spawn[0]&&y===l.spawn[1]),'Sally starts in shade');}
  assert.ok(EscapeCatalog.levels.slice(0,58).every(l=>!l.hawk&&!l.camos));assert.equal(roofs[0].unlockAfter,'canopy-crown');assert.equal(roofs[0].unlockChallenges,4);
});
test('the hawk shadow keeps pace with a walking Sally, so standing or strolling in the open is punished and a sprint escapes',()=>{
  const still=ledge();still.tailDrop=false;ticks(still,.05);assert.equal(still.hawk.state,'stalk');ticks(still,3);assert.equal(still.status,'caught');assert.match(still.message,/hawk/);
  const runner=ledge();Object.assign(runner.player,{x:3.5,y:7.5});ticks(runner,.05);ticks(runner,3,{x:1,sprint:true});assert.equal(runner.status,'playing');assert.equal(runner.hawk.dodges,1);const walker=runner;assert.ok(walker.hawk.nextAt>walker.elapsed);
});
test('awnings, leaves and camouflage all keep a still Sally safe, and the hawk can cost the spare tail',()=>{
  const shaded=ledge();Object.assign(shaded.player,{x:1.5,y:2.5});ticks(shaded,3);assert.equal(shaded.status,'playing');assert.equal(shaded.hawk.dodges,1);
  const camo=ledge();assert.equal(camo.camouflage(),true);assert.equal(camo.camos,1);ticks(camo,3);assert.equal(camo.player.hidden,true);assert.equal(camo.status,'playing');assert.equal(camo.hawk.dodges,1);
  const spare=ledge();ticks(spare,3);assert.equal(spare.status,'playing');assert.equal(spare.tailsDropped,1);
});
test('camouflage hides from ground hunters only while still, breaks on movement, and runs out',()=>{
  const g=new EscapeAdventure({level:legacy['sunbaked-ledge']});g.hawk=null;const h=g.hunters[0];g.hunters=[h];Object.assign(g.player,{x:12.5,y:3.5});Object.assign(h,{x:12.5,y:1.5,facing:Math.PI/2});
  assert.equal(g.camouflage(),true);assert.equal(g.camouflage(),false,'one blend at a time');ticks(g,.05);assert.equal(g.seesPlayer(h),false);
  assert.equal(g.player.hidden,true);ticks(g,.1,{x:1});assert.equal(g.player.camo,false);assert.equal(g.camoUntil,0);g.advance(1/120,{});assert.equal(g.player.hidden,false,'moving breaks the blend');
  g.camos=0;assert.equal(g.camouflage(),false);assert.equal(new EscapeAdventure({levelId:'quiet-vault'}).camouflage(),false);
});
test('challenge-gated branches wait for enough completed challenges, and the gate shows on the map',()=>{
  const p=new EscapeProgress(null);p.data.levels['canopy-crown']={cleared:true};assert.equal(p.unlocked('sunbaked-ledge'),false);
  for(const id of ['ghost-run','treasure-sweep','quick-getaway'])p.data.challenges[id]={cleared:true};assert.equal(p.unlocked('sunbaked-ledge'),false);
  p.data.challenges['garden-dash']={cleared:true};assert.equal(p.unlocked('sunbaked-ledge'),true);assert.equal(p.unlocked('laundry-lines'),false);
  delete p.data.challenges['garden-dash'];p.data.levels['sunbaked-ledge']={cleared:true};assert.equal(p.unlocked('sunbaked-ledge'),true,'a cleared route never locks again');
  const w=new EscapeWorld(),roofs=w.chapters.findIndex(c=>c.theme==='rooftops');assert.ok(w.paths.some(([a,b])=>a===7&&b===roofs),'the branch leaves the Hollow Jungle');assert.ok(w.gates.some(g=>g.chapter===roofs));
});
