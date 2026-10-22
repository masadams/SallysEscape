const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');
const B=require('../public/escape-builder.js');
const {serve,adminCookie,call}=require('./helpers/admin-session.cjs');

test('the recorded winning runs are for the admin only, one escape at a time, the main run first',async t=>{
  const {base,cookie}=await adminCookie(t);
  assert.equal((await call(base,'/api/admin/runs?key=level:quiet-vault',{method:'GET'})).status,401);
  assert.equal((await call(base,'/api/admin/runs?key=../../etc',{method:'GET',cookie})).status,400);
  assert.equal((await call(base,'/api/admin/runs?key=level:quiet-vault',{method:'POST',cookie})).status,405);
  const r=await (await call(base,'/api/admin/runs?key=level:quiet-vault',{method:'GET',cookie})).json();
  assert.equal(r.key,'level:quiet-vault');assert.ok(r.runs.length>=1);assert.ok(r.runs[0].commands.length>0);
  const s=await (await call(base,'/api/admin/runs?key=seasonal:winter-yeti',{method:'GET',cookie})).json();
  assert.deepEqual(s.runs.map(x=>x.variant),['main','treasure']);
  const k=await (await call(base,'/api/admin/runs?key=kids:garden-gate',{method:'GET',cookie})).json();assert.ok(k.runs.length>=1);
  assert.deepEqual((await (await call(base,'/api/admin/runs?key=level:no-such-escape',{method:'GET',cookie})).json()).runs,[]);
});

test('a traced run says where Sally went, where she used tools and waited, and how it ended',async t=>{
  const {base,cookie}=await adminCookie(t);
  const level=EscapeCatalog.levels[6],{runs}=await (await call(base,'/api/admin/runs?key=level:'+level.id,{method:'GET',cookie})).json();
  const tr=EscapeAdventure.trace({levelId:level.id},runs[0].commands);
  assert.equal(tr.status,'won');assert.ok(tr.points.length>50);assert.ok(tr.tools.length>0);assert.ok(tr.tools.every(q=>q.kind&&Number.isFinite(q.x)));
  // The same run on the level as the builder rebuilds it still wins; wall off its route and it doesn't.
  const m=B.fromRoute(level);assert.equal(EscapeAdventure.trace({level:escapeBuildCustom(B.toRoute(m))},runs[0].commands).status,'won');
  const mid=tr.points[Math.floor(tr.points.length/2)],x=Math.floor(mid.x),y=Math.floor(mid.y);m.map[y]=m.map[y].slice(0,x)+'#'+m.map[y].slice(x+1);
  assert.notEqual(EscapeAdventure.trace({level:escapeBuildCustom(B.toRoute(m))},runs[0].commands).status,'won');
});

test('without the fixtures (or for an unknown escape) there are simply no runs',async t=>{
  const s=await serve(t,{fixturesDir:'/nonexistent'});const {cookie}=await (async()=>{const {register,createPasskey}=require('./helpers/admin-session.cjs');const key=createPasskey({origin:s.origin});return register(s.base,key,{code:s.server.admin.setupCode()});})();
  assert.deepEqual((await (await call(s.base,'/api/admin/runs?key=level:quiet-vault',{method:'GET',cookie})).json()).runs,[]);
});
