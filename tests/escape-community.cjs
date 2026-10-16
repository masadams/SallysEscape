const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const B=require('../public/escape-builder.js');const {serve,adminCookie}=require('./helpers/admin-session.cjs');
const post=(base,url,body,cookie)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
function level(){const m=B.blank(21,13);m.name='Shelf test';m.author='Mason';B.addEnemy(m,'snake',12,6);B.addPatrol(m,0,16,6);return m;}

test('anyone can play the shelf; publishing and taking a level down need a signed-in admin',async t=>{
  const {base,cookie}=await adminCookie(t);
  assert.equal((await post(base,'/api/levels',{level:level()})).status,401,'publishing needs a passkey session');
  assert.equal((await post(base,'/api/levels',{level:level()},'sally_admin=made-up-token-made-up-token')).status,401);
  const m=level();assert.equal((await post(base,'/api/levels',{level:m},cookie)).status,201);
  const shelf=await (await fetch(base+'/api/levels')).json();assert.equal(shelf.levels.length,1);assert.equal(shelf.levels[0].name,'Shelf test');assert.equal(shelf.levels[0].author,'Mason');assert.ok(shelf.levels[0].publishedAt);
  assert.equal((await fetch(base+'/api/levels/'+m.id,{method:'DELETE'})).status,401,'anyone can play, only admins take levels down');
  assert.equal((await fetch(base+'/api/levels/'+m.id,{method:'DELETE',headers:{Cookie:cookie}})).status,204);
  assert.equal((await (await fetch(base+'/api/levels')).json()).levels.length,0);
  assert.equal((await fetch(base+'/api/builder/unlock',{method:'POST'})).status,404,'the old password unlock is gone');
});
test('the shelf refuses broken levels and oversized bodies, and is readable with no admin set up',async t=>{
  const {base,cookie}=await adminCookie(t);
  const broken=level();broken.map=broken.map.map(r=>r.replace('K','.'));assert.equal((await post(base,'/api/levels',{level:broken},cookie)).status,400,'a level with no key is not published');
  assert.equal((await post(base,'/api/levels',{level:{map:['<script>']}},cookie)).status,400);
  assert.equal((await fetch(base+'/api/levels',{method:'POST',headers:{Cookie:cookie},body:'x'.repeat(70000)}).catch(()=>({status:413}))).status,413);
  const fresh=await serve(t);assert.equal((await fetch(fresh.base+'/api/levels')).status,200,'the shelf can still be read');assert.equal((await fetch(fresh.base+'/api/scores')).status,404);
});
test('a stored level that was tampered with on disk is not served',async t=>{
  const {base,dataDir,cookie}=await adminCookie(t);await post(base,'/api/levels',{level:level()},cookie);
  const file=path.join(dataDir,'community-levels.json'),list=JSON.parse(fs.readFileSync(file,'utf8'));list.push({id:'custom-bad',map:['<img onerror=x>']});fs.writeFileSync(file,JSON.stringify(list));
  const shelf=await (await fetch(base+'/api/levels')).json();assert.equal(shelf.levels.length,1);
});
test('only the address added by the trusted proxy counts: a visitor cannot dodge the limit by writing their own forwarded header',async t=>{
  const {base}=await serve(t,{trustProxy:1});
  const tryAs=xff=>fetch(base+'/api/admin/register/begin',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':xff},body:JSON.stringify({code:'NOPE-NOPE'})});
  for(let i=0;i<8;i++)await tryAs('1.1.1.'+i+', 10.0.0.9');
  assert.equal((await tryAs('9.9.9.9, 10.0.0.9')).status,429,'a made-up address on the left changes nothing');
  assert.equal((await tryAs('10.0.0.7')).status,401,'another visitor behind the same proxy is not locked out');
  const direct=await serve(t);
  const raw=xff=>fetch(direct.base+'/api/admin/register/begin',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':xff},body:JSON.stringify({code:'NOPE-NOPE'})});
  for(let i=0;i<8;i++)await raw('5.5.5.'+i);assert.equal((await raw('6.6.6.6')).status,429,'with no trusted proxy the header is ignored entirely');
});
test('many wrong tries from many visitors do not lock out the admin with the right code',async t=>{
  const {base,server}=await serve(t,{trustProxy:1});
  for(let i=0;i<120;i++)await fetch(base+'/api/admin/register/begin',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':'10.1.'+(i>>8)+'.'+(i&255)},body:JSON.stringify({code:'NOPE-NOPE'})});
  assert.equal((await fetch(base+'/api/admin/register/begin',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':'10.9.9.9'},body:JSON.stringify({code:server.admin.setupCode()})})).status,200);
});
test('a stalled upload is dropped, and the shelf is read from memory until the file changes',async t=>{
  const {base,dataDir,cookie}=await adminCookie(t,{bodyDeadline:300});
  const http=require('node:http'),u=new URL(base);
  const status=await new Promise(resolve=>{const req=http.request({host:u.hostname,port:u.port,path:'/api/levels',method:'POST',headers:{'Content-Type':'application/json','Content-Length':'100',Cookie:cookie}},res=>resolve(res.statusCode));req.on('error',()=>resolve('closed'));req.write('{"level":');});
  assert.ok(status===408||status==='closed',String(status));
  await post(base,'/api/levels',{level:level()},cookie);const first=await (await fetch(base+'/api/levels')).text();
  assert.equal(await (await fetch(base+'/api/levels')).text(),first,'the same checked shelf');
  assert.equal((await fetch(base+'/api/levels',{method:'HEAD'})).status,200);
  const file=path.join(dataDir,'community-levels.json');fs.writeFileSync(file,'[]');const later=new Date(Date.now()+5000);fs.utimesSync(file,later,later);
  assert.equal((await (await fetch(base+'/api/levels')).json()).levels.length,0,'a changed file is read again');
});
test('pages send a policy that blocks form posts, plugins and powerful device features but allows passkeys',async t=>{
  const {base}=await serve(t);const r=await fetch(base+'/');const csp=r.headers.get('content-security-policy');
  assert.match(csp,/form-action 'none'/);assert.match(csp,/object-src 'none'/);assert.match(csp,/script-src 'self'/);assert.equal(r.headers.get('cross-origin-opener-policy'),'same-origin');
  assert.match(r.headers.get('permissions-policy'),/camera=\(\)/);assert.match(r.headers.get('permissions-policy'),/publickey-credentials-get=\(self\)/);
});
