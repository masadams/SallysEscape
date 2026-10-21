const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const data={};global.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=v;}};
const P=require('../public/escape-playdata.js');const {EscapeAdventure}=require('../public/escape-engine.js');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');const B=require('../public/escape-builder.js');
const {serve,adminCookie,call}=require('./helpers/admin-session.cjs');

test('a run notes where Sally was caught and by what, tail drops included, and the tools she used',()=>{
  const id=EscapeCatalog.levels[30].id,g=new EscapeAdventure({levelId:id});g.tailDrop=true;g.hasTail=true;
  assert.equal(g.shedTail({kind:'fox'}),true);g.finish('caught','The hawk dropped out of the sun.');
  assert.deepEqual(g.result.catches.map(c=>[c.by,Boolean(c.tail)]),[['fox',true],['hawk',false]]);
  assert.equal(EscapeAdventure.causeOf('A rolling log flattened Sally.'),'log');
  const s=P.summary(g,g.status,'touch');assert.equal(s.id,id);assert.equal(s.out,'caught');assert.equal(s.dev,'touch');assert.deepEqual(s.catches.map(c=>c[2]),['fox','hawk']);assert.ok(!('name' in s));
});

test('only the game’s own escapes are kept, once per run, and quits remember where Sally gave up',t=>{
  delete data[P.KEY];P.setEnabled(true);const realFetch=global.fetch;global.fetch=undefined;t.after(()=>{global.fetch=realFetch;});
  const g=new EscapeAdventure({levelId:EscapeCatalog.levels[3].id});g.elapsed=12.34;
  assert.equal(P.record(g,'quit'),true);assert.equal(P.record(g,'quit'),false,'the same run counts once');
  const q=JSON.parse(data[P.KEY]);assert.equal(q.length,1);assert.equal(q[0].t,12.3);assert.equal(q[0].at.length,2);
  const custom=new EscapeAdventure({level:escapeBuildCustom(B.toRoute(B.blank()))});assert.equal(P.record(custom,'won'),false,'builder levels do not count');
});

test('the server keeps clean run summaries per day, drops junk, and only the admin can read or export them',async t=>{
  const {base,cookie,dataDir}=await adminCookie(t);const id=EscapeCatalog.levels[5].id,hid=EscapeCatalog.hidden[0].id;
  const runs=[{id,where:'trail',out:'won',t:61.27,tr:8,al:1,catches:[[3,4,'snake',1]],tools:{pebble:2,junk:9},name:'someone'},{id,where:'trail',out:'caught',t:20,catches:[[3,4,'snake']]},
    {id:hid,where:'hidden',out:'quit',t:5,at:[2,2]},{id:'not-a-level',where:'trail',out:'won'},{id,where:'trail',out:'exploded'},{id:'<script>',out:'won'}];
  const r=await call(base,'/api/playdata',{body:{v:1,runs}});assert.equal(r.status,204);
  const files=fs.readdirSync(path.join(dataDir,'playdata'));assert.equal(files.length,1);
  const lines=fs.readFileSync(path.join(dataDir,'playdata',files[0]),'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(lines.length,3,'junk dropped');assert.deepEqual(lines[0].tools,{pebble:2});assert.ok(!('name' in lines[0]));assert.equal(lines[0].t,61.3);
  assert.equal((await call(base,'/api/playdata/summary',{method:'GET'})).status,401);assert.equal((await call(base,'/api/playdata/export',{method:'GET'})).status,401);
  const sum=await (await call(base,'/api/playdata/summary',{method:'GET',cookie})).json();
  assert.equal(sum.runs,3);const row=sum.levels.find(l=>l.id===id);assert.equal(row.plays,2);assert.equal(row.winRate,.5);assert.equal(row.medianWin,61.3);assert.deepEqual(row.catchers,[['snake',2]]);assert.deepEqual(row.hotspots,[[3,4,2]]);
  const ex=await call(base,'/api/playdata/export',{method:'GET',cookie});assert.match(ex.headers.get('content-disposition'),/attachment/);assert.equal((await ex.text()).trim().split('\n').length,3);
});

test('a flood of reports from one visitor is turned away',async t=>{
  const {base}=await serve(t,{perMinute:3});const body={runs:[]};
  for(let i=0;i<3;i++)assert.equal((await call(base,'/api/playdata',{body})).status,204);
  assert.equal((await call(base,'/api/playdata',{body})).status,429);
});

test('turning sharing off keeps no new runs and throws away the ones waiting to be sent',t=>{
  delete data[P.KEY];delete data['sally-escape-playdata-off'];delete data['sally-escape-playdata-asked'];global.localStorage.removeItem=k=>{delete data[k];};
  const realFetch=global.fetch;global.fetch=undefined;t.after(()=>{global.fetch=realFetch;P.setEnabled(true);});
  assert.equal(P.enabled(),false,'nothing is shared before the player is asked');assert.equal(P.asked(),false);assert.equal(P.record(new EscapeAdventure({levelId:EscapeCatalog.levels[4].id}),'won'),false,'no summary is kept before a yes');P.setEnabled(true);assert.equal(P.asked(),true);assert.equal(P.enabled(),true);
  assert.equal(P.record(new EscapeAdventure({levelId:EscapeCatalog.levels[3].id}),'quit'),true);assert.equal(P.pending(),1);
  P.setEnabled(false);assert.equal(P.enabled(),false);assert.equal(P.pending(),0,'waiting runs are dropped');
  assert.equal(P.record(new EscapeAdventure({levelId:EscapeCatalog.levels[4].id}),'won'),false);assert.equal(P.pending(),0);assert.equal(P.flush(),false);
  P.setEnabled(true);assert.equal(P.record(new EscapeAdventure({levelId:EscapeCatalog.levels[4].id}),'won'),true);
});
