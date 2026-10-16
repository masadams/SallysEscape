const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {serve,call,register,login,createPasskey}=require('./helpers/admin-session.cjs');
const W=require('../server/webauthn.cjs');

test('the first passkey needs the one-time setup code from the server log, and then signs in',async t=>{
  const s=await serve(t);const code=s.server.admin.setupCode();
  assert.match(code,/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);assert.ok(s.logs.some(l=>l.includes(code)),'the code is printed in the log');
  assert.deepEqual(await (await fetch(s.base+'/api/admin/status')).json(),{signedIn:false,setupNeeded:true});
  const key=createPasskey({origin:s.origin});
  assert.equal((await register(s.base,key,{code:'AAAA-BBBB'})).status,401,'a wrong code is refused');
  const first=await register(s.base,key,{code:code.toLowerCase().replace('-',' '),name:'My phone'});
  assert.equal(first.status,201);assert.match(first.cookie,/^sally_admin=/);
  assert.equal(s.server.admin.setupCode(),null,'the setup code is spent');
  assert.equal((await register(s.base,createPasskey({origin:s.origin}),{code})).status,401,'and cannot be used again');
  const status=await (await call(s.base,'/api/admin/status',{method:'GET',cookie:first.cookie})).json();assert.equal(status.signedIn,true);assert.equal(status.setupNeeded,false);
  const saved=JSON.parse(fs.readFileSync(path.join(s.dataDir,'admin-passkeys.json'),'utf8'));assert.equal(saved.passkeys.length,1);assert.equal(saved.passkeys[0].name,'My phone');
  assert.ok(!JSON.stringify(saved).includes('"d"'),'only the public key is stored');
  const again=await login(s.base,key);assert.equal(again.status,204);assert.match(again.cookie,/^sally_admin=/);
  const out=await call(s.base,'/api/admin/logout',{cookie:again.cookie});assert.equal(out.status,204);
  assert.equal((await (await call(s.base,'/api/admin/status',{method:'GET',cookie:again.cookie})).json()).signedIn,false,'signing out ends the session');
});

test('a restarted server remembers passkeys and prints no setup code',async t=>{
  const site='https://maze.example.com',s=await serve(t,{publicOrigin:site});const key=createPasskey({origin:site});await register(s.base,key,{code:s.server.admin.setupCode()});
  const again=await serve(t,{dataDir:s.dataDir,publicOrigin:site});assert.equal(again.server.admin.setupCode(),null);assert.equal(again.logs.length,0);
  assert.equal((await login(again.base,key)).status,204,'the same passkey signs in after a restart');
  assert.equal((await login(again.base,createPasskey({origin:site}))).status,401,'an unknown passkey is refused');
});

test('sign-in refuses another site, a made-up challenge, a replayed answer and a bad signature',async t=>{
  const s=await serve(t);const key=createPasskey({origin:s.origin});await register(s.base,key,{code:s.server.admin.setupCode()});
  assert.equal((await login(s.base,key,{origin:'https://evil.example'})).status,401,'wrong origin');
  const begin=await (await call(s.base,'/api/admin/login/begin')).json();const answer=key.get(begin);
  assert.equal((await call(s.base,'/api/admin/login/finish',{body:{credential:answer}})).status,204);
  assert.equal((await call(s.base,'/api/admin/login/finish',{body:{credential:answer}})).status,400,'a challenge works once');
  assert.equal((await call(s.base,'/api/admin/login/finish',{body:{credential:key.get({publicKey:{challenge:W.b64url(Buffer.alloc(32,7))}})}})).status,400,'a challenge the server never made');
  const b2=await (await call(s.base,'/api/admin/login/begin')).json();const forged=key.get(b2);const sig=Buffer.from(forged.response.signature,'base64url');sig[sig.length-1]^=1;forged.response.signature=W.b64url(sig);
  assert.equal((await call(s.base,'/api/admin/login/finish',{body:{credential:forged}})).status,401,'a bad signature');
  key.counter=0;const b3=await (await call(s.base,'/api/admin/login/begin')).json();
  assert.equal((await call(s.base,'/api/admin/login/finish',{body:{credential:key.get(b3)}})).status,401,'a counter going backwards means a cloned key');
  assert.equal((await call(s.base,'/api/admin/register/begin',{body:{code:'x'},headers:{Origin:'https://evil.example'}})).status,403,'changes from another site are refused');
});

test('a signed-in admin invites another device, lists passkeys, and cannot remove the last one',async t=>{
  const s=await serve(t);const phone=createPasskey({origin:s.origin});const {cookie}=await register(s.base,phone,{code:s.server.admin.setupCode(),name:'Phone'});
  assert.equal((await call(s.base,'/api/admin/invite')).status,401,'invites need a session');
  const invite=await (await call(s.base,'/api/admin/invite',{cookie})).json();assert.match(invite.code,/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);assert.equal(invite.minutes,15);
  const laptop=createPasskey({origin:s.origin});const added=await register(s.base,laptop,{code:invite.code,name:'Laptop'});assert.equal(added.status,201);
  assert.equal((await register(s.base,createPasskey({origin:s.origin}),{code:invite.code})).status,401,'an invite works once');
  const list=await (await call(s.base,'/api/admin/passkeys',{method:'GET',cookie})).json();assert.deepEqual(list.passkeys.map(p=>p.name),['Phone','Laptop']);assert.equal(list.current,phone.id.slice(0,12));
  assert.equal((await call(s.base,'/api/admin/passkeys/'+laptop.id.slice(0,12),{method:'DELETE',cookie})).status,204);
  assert.equal((await call(s.base,'/api/admin/passkeys',{method:'GET',cookie:added.cookie})).status,401,'removing a passkey ends its sessions');
  assert.equal((await login(s.base,laptop)).status,401,'and it can no longer sign in');
  assert.equal((await call(s.base,'/api/admin/passkeys/'+phone.id.slice(0,12),{method:'DELETE',cookie})).status,409,'the last passkey stays');
});

test('wrong codes are limited per visitor, and the session cookie is locked down',async t=>{
  const s=await serve(t);
  for(let i=0;i<8;i++)await call(s.base,'/api/admin/register/begin',{body:{code:'WRONG-'+i}});
  assert.equal((await call(s.base,'/api/admin/register/begin',{body:{code:s.server.admin.setupCode()}})).status,429);
  const s2=await serve(t);const r=await call(s2.base,'/api/admin/register/begin',{body:{code:s2.server.admin.setupCode()}});const opts=await r.json();
  const fin=await call(s2.base,'/api/admin/register/finish',{body:{credential:createPasskey({origin:s2.origin}).create(opts)}});
  const set=fin.headers.get('set-cookie');assert.match(set,/HttpOnly/);assert.match(set,/SameSite=Strict/);assert.doesNotMatch(set,/Secure/,'plain http in tests');
  assert.equal(opts.publicKey.rp.id,'127.0.0.1');assert.equal(opts.publicKey.attestation,'none');
});

test('PUBLIC_ORIGIN fixes the site passkeys belong to, and its cookie is Secure',async t=>{
  const s=await serve(t,{publicOrigin:'https://maze.example.com'});const key=createPasskey({origin:'https://maze.example.com'});
  const r=await register(s.base,key,{code:s.server.admin.setupCode()});assert.equal(r.status,201);
  const begin=await call(s.base,'/api/admin/register/begin',{body:{},cookie:r.cookie});assert.equal(begin.status,200,'a signed-in admin adds a device without a code');
  assert.equal((await login(s.base,createPasskey({origin:s.origin}))).status,401);
  const fresh=await serve(t,{publicOrigin:'https://maze.example.com'});
  const fin=await register(fresh.base,key,{code:fresh.server.admin.setupCode()});assert.equal(fin.status,201);
  const raw=await call(fresh.base,'/api/admin/login/begin');const answer=key.get(await raw.json());
  const ok=await call(fresh.base,'/api/admin/login/finish',{body:{credential:answer}});assert.match(ok.headers.get('set-cookie'),/; Secure/);
});
