// The Far Coast: Episode 2's first steps, across the sea south of Home. Two escapes, opened by
// clearing Home, a landing page for the first and To Be Continued for the last.
const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {EscapeWorld}=require('../public/escape-world.js');
const {EscapeProgress}=require('../public/escape-progress.js');
const S=require('../public/escape-story.js');

test('the Far Coast holds two escapes that use the new physics',()=>{
  const coast=EscapeCatalog.hidden.filter(l=>l.secret==='far-coast');
  assert.deepEqual(coast.map(l=>l.id),['bottle-beach','silent-beacon']);
  for(const l of coast)assert.equal(l.loot.reduce((n,t)=>n+t[2],0),10);
  assert.ok(coast[0].currents.length&&coast[0].softSand.length,'a rip current and soft sand on the beach');
  assert.ok(coast[1].ropes.length&&coast[1].caps.length&&coast[1].wind.length,'a rope, a cap and a gusting ledge on the cliff');
});

test('it lies out in the sea south of Home, at the end of a causeway that opens once Home is cleared',()=>{
  const w=new EscapeWorld(()=>true,null,()=>true,()=>true,()=>true),s=w.secrets.find(s=>s.id==='far-coast'),home=w.chapters.find(c=>c.theme==='home');
  assert.ok(s.y>home.y+7,'south of the Home courtyard');assert.equal(w.grid[s.y+s.ry+1][s.x],'P','sea around the island');
  const door=w.secretDoors.find(d=>d.id==='far-coast');assert.ok(Math.abs(door.x-home.x)<=9&&Math.abs(door.y-home.y)<=8,'the causeway starts at Home');
  for(let y=door.y;y<s.y-s.ry;y++)assert.equal(w.grid[y][s.x],'.','a causeway across the water');
  assert.equal(w.secretNodes.filter(n=>n.secret==='far-coast').length,2);
  const p=new EscapeProgress(null);assert.equal(p.secretOpen('far-coast'),false);
  p.data.levels.home={cleared:true,stars:1,bestTime:10,treasure:0};assert.equal(p.secretOpen('far-coast'),true);
  // A boat waits on the far shore for Episode 2; Enter by it is the boat, not an escape.
  assert.equal(w.grid[w.boat.y][w.boat.x],'.');Object.assign(w.player,{x:w.boat.x+.5,y:w.boat.y+.5});assert.equal(w.enter(),'boat');
});

test('the first escape there earns the landing page; only the last earns To Be Continued',()=>{
  const [beach,beacon]=EscapeCatalog.hidden.filter(l=>l.secret==='far-coast');
  assert.equal(S.cardFor(beach),'coast:landing');assert.equal(S.cardFor(beacon),'note:far-coast');
  assert.match(S.byId('note:far-coast').body.at(-1),/To be continued/);
  assert.equal(S.cardFor(EscapeCatalog.hidden.find(l=>l.secret==='magpie-roost')),'note:magpie-roost','other spots are unchanged');
});
