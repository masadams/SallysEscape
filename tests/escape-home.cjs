const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeCatalog}=require('../public/escape-levels.js');
const {EscapeWorld}=require('../public/escape-world.js');

test('The Long Way Home ends the trail at escape 100 with seven escapes revisiting the road',()=>{
  assert.equal(EscapeCatalog.levels.length,100);
  const home=EscapeCatalog.levels.slice(93);
  assert.deepEqual(home.map(l=>l.id),['dusk-meadow','ruins-road','lantern-ferry','rooftop-run','cold-steam','thunder-hollow','home']);
  assert.ok(EscapeCatalog.regions.includes(93));for(const l of home){assert.equal(l.loot.reduce((n,t)=>n+t[2],0),10);assert.ok(l.tailDrop);}
  // Each one brings back a different stretch of the road.
  const kinds=l=>new Set(l.guards.map(g=>g.kind||'snake'));
  assert.ok(kinds(home[1]).has('beetle')&&kinds(home[1]).has('scorpion'));assert.ok(kinds(home[2]).has('heron')&&kinds(home[2]).has('angler'));
  assert.ok(home[3].hawk&&home[3].antTrails.length);assert.ok(home[4].cold.length&&home[4].vents.length);assert.ok(home[5].caps.length&&home[5].storm);
  assert.ok(home[6].tide&&kinds(home[6]).has('cobra'));assert.equal(home[6].requiredTreasure,7);
  const w=new EscapeWorld(),c=w.chapters.find(c=>c.theme==='home');assert.equal(c.name,'The Long Way Home');assert.equal(c.start,93);assert.equal(c.end,100);
  assert.ok(w.paths.some(([a,b])=>w.chapters[a].theme==='tide'&&w.chapters[b]===c),'the road home opens off the Tide Pools');
  assert.ok(!w.secrets.some(s=>s.area),'the reserved space is now the final chapter');
});
