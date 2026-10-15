const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');const {EscapeProgress}=require('../public/escape-progress.js');
function ticks(g,seconds,input={}){for(let n=0;n<Math.round(seconds*120);n++)g.advance(1/120,input);}
function ring(){const g=new EscapeAdventure({levelId:'anthill-gate'});g.hunters=[];g.motion.snakes=[];return g;}
test('the Ant Kingdom branches off Venom Depths behind eight challenges with columns and gecko thieves',()=>{
  const ants=EscapeCatalog.levels.slice(63);assert.deepEqual(ants.map(l=>l.id),['anthill-gate','sugar-store','marching-tunnels','thieves-gallery','queens-chamber']);
  assert.equal(ants[0].unlockAfter,'split-jaw');assert.equal(ants[0].unlockChallenges,8);for(const l of ants)assert.ok(l.tailDrop);
  assert.ok(ants.filter(l=>l.antTrails).length>=4);assert.ok(ants.filter(l=>l.guards.some(h=>h.kind==='gecko')).length>=3);
  assert.ok(EscapeCatalog.levels.slice(0,63).every(l=>!l.antTrails&&!l.guards.some(h=>h.kind==='gecko')));
  const p=new EscapeProgress(null);p.data.levels['split-jaw']={cleared:true};assert.equal(p.unlocked('anthill-gate'),false);
  EscapeCatalog.challenges.slice(0,8).forEach(c=>p.data.challenges[c.id]={cleared:true});assert.equal(p.unlocked('anthill-gate'),true);
});
test('ant trails are closed right-angled loops on open floor, and the column moves at a steady pace',()=>{
  for(const l of EscapeCatalog.levels.filter(l=>l.antTrails)){const g=new EscapeAdventure({levelId:l.id});for(const t of g.antTrails){for(let i=0;i<t.tiles.length;i++){const a=t.tiles[i],b=t.tiles[(i+1)%t.tiles.length];assert.ok(g.floor(Math.floor(a.x),Math.floor(a.y)));assert.ok(Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=1.0001||t.tiles.length===2,l.id+' trail is continuous');}}}
  const g=ring(),before=g.ants(g.antTrails[0])[0];ticks(g,1);const after=g.ants(g.antTrails[0])[0];assert.ok(Math.abs(Math.hypot(after.x-before.x,after.y-before.y)-1.6)<.05);
});
test('ants walk over a hidden or camouflaged Sally, cost the spare tail, and the second column is final',()=>{
  const g=ring();const a=g.ants(g.antTrails[0])[0];Object.assign(g.player,{x:a.x,y:a.y});g.player.hidden=true;g.advance(1/120,{});assert.equal(g.tailsDropped,1);assert.equal(g.status,'playing');
  const h=ring();h.tailDrop=false;const b=h.ants(h.antTrails[0])[3];Object.assign(h.player,{x:b.x,y:b.y});h.advance(1/120,{});assert.equal(h.status,'caught');assert.match(h.message,/ant column/);
  const safe=ring();Object.assign(safe.player,{x:14.5,y:4.5});ticks(safe,20);assert.equal(safe.status,'playing','one tile beside the trail is always safe');
});
function store(){const g=new EscapeAdventure({levelId:'sugar-store'});const thief=g.hunters[0];g.hunters=[thief];g.motion.snakes=[g.motion.snakes[0]];return {g,thief};}
function untilState(g,h,state,limit=3){for(let i=0;i<limit*120&&h.state!==state;i++)g.advance(1/120,{});return h.state===state;}
test('a gecko ignores Sally with empty pockets, then dashes in and steals the last treasure she picked up',()=>{
  const {g,thief}=store();Object.assign(g.player,{x:12.5,y:3.5});ticks(g,2);assert.equal(thief.state,'patrol');
  g.collectLoot(g.loot.find(l=>l.x===10.5&&l.y===2.5));g.collectLoot(g.loot.find(l=>l.x===14.5&&l.y===2.5));assert.equal(g.treasure,2);
  assert.ok(untilState(g,thief,'flee'));assert.equal(g.thefts,1);assert.equal(g.treasure,1);assert.equal(thief.loot.x,14.5,'the last piece is taken');assert.equal(g.status,'playing','geckos never catch Sally');
});
test('chasing down a fleeing gecko returns the treasure; letting it reach its burrow loses it for the run',()=>{
  const a=store();Object.assign(a.g.player,{x:12.5,y:3.5});a.g.collectLoot(a.g.loot[0]);assert.ok(untilState(a.g,a.thief,'flee'));
  for(let i=0;i<120&&a.thief.loot;i++){const dx=a.thief.x-a.g.player.x,dy=a.thief.y-a.g.player.y,d=Math.hypot(dx,dy)||1;a.g.advance(1/120,{x:dx/d,y:dy/d,sprint:true});}
  assert.equal(a.g.recoveries,1);assert.equal(a.g.treasure,1);assert.equal(a.g.stolen,0);
  const b=store();Object.assign(b.g.player,{x:12.5,y:3.5});b.g.collectLoot(b.g.loot[0]);assert.ok(untilState(b.g,b.thief,'flee'));ticks(b.g,3);
  assert.equal(b.g.stolen,1);assert.equal(b.g.treasure,0);assert.equal(b.thief.state,'patrol');
  const c=new EscapeAdventure({challengeId:'sticky-fingers'});c.stolen=1;c.advance(1/120,{});assert.equal(c.status,'failed');
});
