const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');const {EscapeCatalog}=require('../public/escape-levels.js');const {EscapeProgress}=require('../public/escape-progress.js');
function ticks(g,seconds,input={}){for(let n=0;n<Math.round(seconds*120);n++)g.advance(1/120,input);}
function works(){const g=new EscapeAdventure({levelId:'kettle-works'});g.tailDrop=false;g.vents=[g.vents[0]];for(const h of g.hunters){Object.assign(h,{x:25.5,y:10.5,patrol:[{x:25.5,y:10.5}]});}return g;}
function untilActive(g,v,limit=12){for(let i=0;i<limit*120&&!v.active;i++)g.advance(1/120,{});return v.active;}
test('Steam Vents branches off the Rooftops behind twelve challenges, mixing the hawk, owls and ants',()=>{
  const vents=EscapeCatalog.levels.slice(73);assert.deepEqual(vents.map(l=>l.id),['kettle-works','pressure-pipes','boiler-owls','ant-furnace','great-boiler']);
  assert.equal(vents[0].unlockAfter,'weathervane-spire');assert.equal(vents[0].unlockChallenges,12);for(const l of vents)assert.ok(l.vents.length>=4&&l.tailDrop);
  assert.ok(vents[1].hawk);assert.ok(vents[2].guards.some(h=>h.kind==='owl'));assert.ok(vents[3].antTrails);
  for(const l of vents){const g=new EscapeAdventure({levelId:l.id});for(const v of g.vents){assert.equal(g.floor(...v.at),false,'vents sit in walls');assert.ok(v.tiles.length>=2);}}
  const p=new EscapeProgress(null);p.data.levels['weathervane-spire']={cleared:true};EscapeCatalog.challenges.slice(0,11).forEach(c=>p.data.challenges[c.id]={cleared:true});assert.equal(p.unlocked('kettle-works'),false);p.data.challenges[EscapeCatalog.challenges[11].id]={cleared:true};assert.equal(p.unlocked('kettle-works'),true);
});
test('a vent hisses, then fires for a fixed time on a steady rhythm',()=>{
  const g=works(),v=g.vents[0];const seen=[];for(let i=0;i<v.period*2*120;i++){g.advance(1/120,{});seen.push(v.active);}
  const on=seen.filter(Boolean).length/120;assert.ok(Math.abs(on-2*v.on)<.1);let starts=0;for(let i=1;i<seen.length;i++)if(seen[i]&&!seen[i-1])starts++;assert.equal(starts,2);
});
test('an active jet blocks its lane, and firing on Sally blows her clear without catching her',()=>{
  const g=works(),v=g.vents[0];assert.ok(untilActive(g,v));const [x,y]=v.tiles[1];const outside={x:x+.5,y:y-1.5};
  const b=works(),w=b.vents[0];Object.assign(b.player,{x:w.tiles[0][0]+1.5,y:w.tiles[0][1]+.5});untilActive(b,w);const before=b.player.x;ticks(b,.3,{x:-1});assert.ok(b.player.x>=w.tiles[0][0]+1,'cannot walk into live steam');
  const c=works(),u=c.vents[0];const [tx,ty]=u.tiles[1];Object.assign(c.player,{x:tx+.5,y:ty+.5});untilActive(c,u);c.advance(1/120,{});assert.equal(c.blasts,1);assert.equal(c.status,'playing');assert.ok(!u.keys.has(c.tileKey(c.player)));assert.ok(c.player.stamina<70);
});
test('steam dazes walking hunters for a moment, but owls ride it out',()=>{
  const g=new EscapeAdventure({levelId:'kettle-works'}),h=g.hunters[0],v=g.vents[0];g.vents=[v];g.hunters=[h];g.motion.snakes=[g.motion.snakes[0]];const [tx,ty]=v.tiles[1];Object.assign(h,{x:tx+.5,y:ty+.5,patrol:[{x:tx+.5,y:ty+.5}]});
  untilActive(g,v);g.advance(1/120,{});assert.equal(h.state,'steamed');assert.equal(g.steamed,1);assert.ok(!v.keys.has(g.tileKey(h)));
  Object.assign(g.player,{x:h.x,y:h.y});g.advance(1/120,{});assert.equal(g.status,'playing','a dazed hunter cannot catch');ticks(g,2.6);assert.notEqual(h.state,'steamed');
  const o=new EscapeAdventure({levelId:'boiler-owls'}),owl=o.hunters[0],w=o.vents[0];const [ox,oy]=w.tiles[0];Object.assign(owl,{x:ox+.5,y:oy+.5,perch:{x:ox+.5,y:oy+.5}});untilActive(o,w);o.advance(1/120,{});assert.notEqual(owl.state,'steamed');
});
test('Steam Trap only opens the hatch after three hunters have been steamed',()=>{
  const g=new EscapeAdventure({challengeId:'steam-trap'});g.hasKey=true;assert.equal(g.exitUnlocked(),false);g.steamed=3;assert.equal(g.exitUnlocked(),true);
});
