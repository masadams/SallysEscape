const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeProgress}=require('../public/escape-progress.js');
const {EscapeWorld}=require('../public/escape-world.js');const {EscapeCatalog}=require('../public/escape-levels.js');
test('the overworld contains every escape exactly once across connected themed regions',()=>{const w=new EscapeWorld(),n=EscapeCatalog.levels.length;assert.equal(w.nodes.length,n);assert.ok(w.chapters.length>=18);assert.equal(w.chapters.at(-1).end,n);assert.equal(new Set(w.nodes.map(n=>n.id)).size,n);for(const n of w.nodes){assert.equal(w.chapters.findIndex(c=>n.index>=c.start&&n.index<c.end),n.chapter);assert.ok(w.floor(n.x,n.y));assert.equal(n.name,EscapeCatalog.levels[n.index].name);}assert.ok(w.nodes[48].x>w.chapters[10].x+5,'lagoon flag lives on the coast');});
test('visiting a locked flag never unlocks it, while the live progress callback immediately enables a cleared prerequisite',()=>{let unlocked=false;const w=new EscapeWorld(id=>id==='quiet-vault'||unlocked,'leafy-crossroads');assert.equal(w.nearby().id,'leafy-crossroads');assert.equal(w.enter(),null);unlocked=true;assert.equal(w.enter(),'leafy-crossroads');w.player.x+=3;assert.equal(w.enter(),null);});
test('click guidance physically walks Sally to a marker, and manual movement cancels the guide',()=>{const w=new EscapeWorld();const before={...w.player};w.walkTo('leafy-crossroads');w.advance(.1);assert.ok(Math.hypot(w.player.x-before.x,w.player.y-before.y)>0);assert.ok(Math.hypot(w.player.x-before.x,w.player.y-before.y)<.4);for(let i=0;i<50;i++)w.advance(.1);assert.equal(w.nearby().id,'leafy-crossroads');assert.equal(w.enter(),'leafy-crossroads');w.walkTo('crumbling-hall');w.advance(.1,{x:-1});assert.equal(w.target,null);assert.ok(w.player.moving);});
test('chapter travel resets guidance and the real rig; frame rates and diagonal input retain the same movement speed',()=>{const a=new EscapeWorld(),b=new EscapeWorld();for(let i=0;i<30;i++)a.advance(1/30,{x:1});for(let i=0;i<120;i++)b.advance(1/120,{x:1});assert.ok(Math.abs(a.player.x-b.player.x)<1e-8);const c=new EscapeWorld();for(let i=0;i<120;i++)c.advance(1/120,{x:1,y:-1});assert.ok(Math.abs(Math.hypot(c.player.x-c.nodes[0].x,c.player.y-c.nodes[0].y-1)-(a.player.x-a.nodes[0].x))<1e-8);a.walkTo('leafy-crossroads');assert.equal(a.travel(10),true);assert.equal(a.target,null);assert.equal(a.chapterAt(),10);assert.ok(Math.abs(a.motion.lizard.head.x-a.player.x)<1e-9);assert.equal(a.travel(99),false);});
test('the safe world has no combat and keeps Sally within its boundary even on a long sprint',()=>{const w=new EscapeWorld();for(let i=0;i<800;i++)w.advance(.1,{x:-1,y:-1,sprint:true});assert.ok(w.floor(w.player.x,w.player.y));assert.ok(w.player.x>1&&w.player.y>1);assert.equal(w.hunters.length,0);assert.ok(w.motion.lizard.legs.every(l=>Number.isFinite(l.foot.x)&&Number.isFinite(l.elbow.y)));});

test('every region is on one connected route and every courtyard offers multiple paths',()=>{const w=new EscapeWorld(),visited=new Set([0]),n=w.chapters.length;for(let k=0;k<n;k++)for(const [a,b]of w.paths){if(visited.has(a))visited.add(b);if(visited.has(b))visited.add(a);}assert.equal(visited.size,n);assert.equal(w.paths.length,n-1);assert.ok(w.paths.some(([a,b])=>a===9&&b===10)&&w.paths.some(([a,b])=>a===10&&b===11),'Sun and Sea sits between the Labyrinth and the Hollow');for(const n of w.nodes)assert.ok(w.route({x:n.x,y:n.y+1}),n.id);});

test('closed regions block walking and fast travel until progression opens their gate',()=>{let all=false;const w=new EscapeWorld(id=>all||['quiet-vault','leafy-crossroads'].includes(id));assert.equal(w.regionOpen(0),true);assert.equal(w.travel(1),false);assert.equal(w.walkTo('switchback-garden'),false);assert.equal(w.floor(36,18),false);all=true;w.refreshRegions();assert.equal(w.floor(36,18),true);assert.equal(w.travel(1),true);});


test('the visible main and side tracks follow actual dry walkable terrain',()=>{const w=new EscapeWorld();assert.ok(w.tracks.some(t=>t.side));assert.ok(w.tracks.length>49);for(const track of w.tracks)for(const p of track.points)assert.ok(['.','L'].includes(w.grid[Math.floor(p.y)][Math.floor(p.x)]));});

test('every courtyard hides two reachable treasure caches and a signpost on open ground',()=>{const w=new EscapeWorld();assert.equal(w.caches.length,w.chapters.length*2);assert.equal(new Set(w.caches.map(c=>c.id)).size,w.chapters.length*2);for(const c of [...w.caches,...w.signs]){assert.ok(['.','L'].includes(w.grid[c.y][c.x]));}for(const c of w.caches)assert.ok(w.route({x:c.x+.5,y:c.y+.5}),c.id);assert.equal(w.signs.length,w.chapters.length);});
test('walking onto a cache reports it once, and locked regions keep their caches out of reach',()=>{const found=[],w=new EscapeWorld();w.onCache=c=>found.push(c.id);const cache=w.caches.find(c=>c.id==='meadow-south');w.target=w.route({x:cache.x+.5,y:cache.y+.5});for(let i=0;i<200&&w.target;i++)w.advance(.1);for(let i=0;i<10;i++)w.advance(.1);assert.deepEqual(found,['meadow-south']);const locked=new EscapeWorld(id=>id==='quiet-vault');assert.equal(locked.route({x:locked.caches.find(c=>c.id==='hollow-north').x+.5,y:locked.caches.find(c=>c.id==='hollow-north').y+.5}),null);});
test('the Shedding Hollow follows Sun and Sea as a linear, gated region',()=>{const w=new EscapeWorld(),i=w.chapters.findIndex(c=>c.theme==='hollow');assert.equal(i,11);assert.ok(w.paths.some(([a,b])=>a===10&&b===11));assert.equal(w.chapters[i].start,49);assert.equal(w.chapters[i].end,53);assert.ok(!w.tracks.some(t=>t.side&&w.chapterAt(t.points[0])===i));});
test('every open courtyard has a villager on open ground who only talks when Sally is close',()=>{const w=new EscapeWorld();assert.equal(w.npcs.length,w.chapters.length);for(const n of w.npcs)assert.ok(['.','L'].includes(w.grid[n.y][n.x]));const n=w.npcs[0];assert.equal(w.nearbyNpc(),null);Object.assign(w.player,{x:n.x+1.5,y:n.y+.5});assert.equal(w.nearbyNpc(),n);const locked=new EscapeWorld(id=>id==='quiet-vault');Object.assign(locked.player,{x:locked.npcs[5].x+.5,y:locked.npcs[5].y+.5});assert.equal(locked.nearbyNpc(),null);});
test('golden flies appear on open ground near Sally, flee, expire, and are caught by walking or tongue',()=>{let seed=1;const w=new EscapeWorld();w.rng=()=>(seed=(seed*16807)%2147483647)/2147483647;let caught=0;w.onFly=()=>caught++;
  for(let i=0;i<120&&!w.fly;i++)w.advance(.1);assert.ok(w.fly,'a fly arrives');assert.ok(w.floor(w.fly.x,w.fly.y));const d=Math.hypot(w.fly.x-w.player.x,w.fly.y-w.player.y);assert.ok(d>2.5&&d<9.5);
  w.player.x=w.fly.x+5;w.player.y=w.fly.y;assert.equal(w.tongue(),false,'out of reach');w.player.x=w.fly.x+2;assert.equal(w.tongue(),true);assert.equal(caught,1);assert.equal(w.fly,null);
  for(let i=0;i<600&&!w.fly;i++)w.advance(.1);const home={...w.fly.home};Object.assign(w.player,{x:home.x+1.5,y:home.y});w.advance(.1);assert.ok(w.fly.home.x<home.x||!w.floor(home.x-.1,home.y),'it darts away');
  w.elapsed=w.fly.expires;w.advance(.1);assert.equal(w.fly,null,'it leaves when unclaimed');assert.equal(caught,1);});
test('the Gilded Burrow stays solid rock until five perfect areas, then opens north of the Garden Ruins with three escapes',()=>{
  const {EscapeWorld}=require('../public/escape-world.js'),{EscapeCatalog}=require('../public/escape-levels.js');let open=false;
  const w=new EscapeWorld(()=>true,null,()=>open);assert.equal(EscapeCatalog.hidden.filter(l=>!l.bonus&&!l.secret).length,3);assert.ok(EscapeCatalog.hidden.every(l=>l.hidden&&!EscapeCatalog.levels.includes(l)));
  assert.equal(w.grid[5][36],'#');assert.equal(w.floor(36.5,9.5),false);w.player.x=36.5;w.player.y=3.5;assert.equal(w.nearby()?.hidden,undefined);
  open=true;w.refreshRegions();assert.equal(w.hiddenCarved,true);assert.ok(w.terrainVersion>0);assert.equal(w.floor(36.5,9.5),true);
  assert.ok(w.route({x:36.5,y:3.5},{x:36.5,y:18.5}),'a path leads up from the Garden Ruins');assert.equal(w.nearby().id,EscapeCatalog.hidden[1].id);assert.equal(w.enter(),'hidden:'+EscapeCatalog.hidden[1].id);
});
test('the Bramble Maze grove is on the map behind a hedge that opens once the first five areas are mastered',()=>{
  let open=false;const w=new EscapeWorld(()=>true,null,()=>false,()=>open);const node=w.bonusNodes[0];assert.equal(node.id,'bramble-maze');assert.equal(w.hiddenNodes.some(n=>n.id==='bramble-maze'),false);
  assert.equal(w.floor(node.x+.5,node.y+.5),true,'the grove is always drawn');assert.equal(w.floor(node.lock.x+.5,node.lock.y+.5),false,'the hedge is shut');
  assert.equal(w.route({x:node.x+.5,y:node.y+.5},{x:101.5,y:15.5}),null);w.player.x=node.lock.x+.5;w.player.y=node.lock.y+1.5;assert.equal(w.nearbyBonusLock()?.id,'bramble-maze');
  open=true;assert.ok(w.route({x:node.x+.5,y:node.y+.5},{x:101.5,y:15.5}),'a path leads up from the Deep Trials');assert.equal(w.nearbyBonusLock(),null);
  w.player.x=node.x+.5;w.player.y=node.y+1;assert.equal(w.enter(),'hidden:bramble-maze');open=false;assert.equal(w.enter(),null);
  const p=new EscapeProgress(null);assert.equal(p.bonusOpen('bramble-maze',w.chapters),false);
  for(const l of EscapeCatalog.levels.slice(0,w.chapters[4].end))p.data.levels[l.id]={cleared:true,stars:3,bestTime:30};assert.equal(p.bonusOpen('bramble-maze',w.chapters),true);assert.equal(p.hiddenLevelOpen('bramble-maze',w.chapters),true);
  p.data.levels[EscapeCatalog.levels[3].id].stars=2;assert.equal(p.bonusOpen('bramble-maze',w.chapters),false,'every star, not just a clear');assert.equal(p.hiddenLevelOpen('gilded-gate',w.chapters),false);
});
test('the mega escape grove sits above the Living Labyrinth and opens once the first ten areas are mastered',()=>{
  let open=false;const w=new EscapeWorld(()=>true,null,()=>false,()=>open);const node=w.bonusNodes[1];assert.equal(node.id,'the-long-way-home');assert.equal(node.bonus.areas,10);
  const yard={x:w.chapters[9].x+.5,y:w.chapters[9].y-4.5};assert.equal(w.route({x:node.x+.5,y:node.y+.5},yard),null,'the hedge is shut');
  open=true;assert.ok(w.route({x:node.x+.5,y:node.y+.5},yard),'a path leads up from the Living Labyrinth');w.player.x=node.x+.5;w.player.y=node.y+1;assert.equal(w.enter(),'hidden:the-long-way-home');
  const p=new EscapeProgress(null);for(const l of EscapeCatalog.levels.slice(0,w.chapters[4].end))p.data.levels[l.id]={cleared:true,stars:3,bestTime:30};
  assert.equal(p.bonusOpen('bramble-maze',w.chapters),true);assert.equal(p.bonusOpen('the-long-way-home',w.chapters),false,'five areas are not enough');
  for(const l of EscapeCatalog.levels.slice(0,w.chapters[9].end))p.data.levels[l.id]={cleared:true,stars:3,bestTime:30};assert.equal(p.bonusOpen('the-long-way-home',w.chapters),true);
});
test('every hidden escape has a recorded winning run',()=>{
  const {EscapeCatalog}=require('../public/escape-levels.js'),recs=require('./fixtures/escape-playthroughs.json');
  for(const l of EscapeCatalog.hidden)assert.ok(recs.some(r=>r.options.hiddenId===l.id),l.id);
});
test('the map puts Sally back where she was: an escape, a bonus grove, or the first node when nothing is known',()=>{
  const w=new EscapeWorld(()=>true,'sunken-caravan',()=>false,()=>true),node=w.nodes.find(n=>n.id==='sunken-caravan');assert.equal(w.player.x,node.x);assert.equal(w.player.y,node.y+1);
  const b=new EscapeWorld(()=>true,'bramble-maze',()=>false,()=>true);assert.equal(b.player.x,b.bonusNodes[0].x);
  const fresh=new EscapeWorld(()=>true,null);assert.equal(fresh.player.x,fresh.nodes[0].x);
});
test('sealed spots wait off the trail for later: unreachable clearings with markers',()=>{const w=new EscapeWorld(()=>true);assert.ok(w.height>=131);
  for(const s of w.secrets){assert.equal(w.grid[s.y][s.x],'.',s.id);const inside=w.chapters.some(c=>Math.abs(s.x-c.x)<=8&&Math.abs(s.y-c.y)<=7);if(!inside)assert.equal(w.route({x:s.x+.5,y:s.y+.5}),null,s.id+' is sealed');}});
