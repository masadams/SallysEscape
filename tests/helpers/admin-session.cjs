// Starts a test server and signs in as admin with a software passkey.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createServer}=require('../../server/index.cjs');const {createPasskey}=require('./soft-passkey.cjs');
async function serve(t,options={}){
  const dataDir=options.dataDir||fs.mkdtempSync(path.join(os.tmpdir(),'sally-shelf-'));const logs=[];
  const server=createServer({dataDir,log:line=>logs.push(line),...options});await new Promise(r=>server.listen(0,'127.0.0.1',r));
  t.after(()=>{server.close();if(!options.dataDir)fs.rmSync(dataDir,{recursive:true,force:true});});
  const base='http://127.0.0.1:'+server.address().port;
  return {base,dataDir,server,logs,origin:base};
}
const cookieFrom=r=>{const c=r.headers.get('set-cookie');return c?c.split(';')[0]:'';};
const call=(base,url,{method='POST',body,cookie,headers={}}={})=>fetch(base+url,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
// Registers a passkey with a setup or invite code (or an admin cookie) and returns its session cookie.
async function register(base,passkey,{code,cookie,name}={}){
  const begin=await call(base,'/api/admin/register/begin',{body:{code},cookie});if(!begin.ok)return {status:begin.status,error:(await begin.json()).error};
  const finish=await call(base,'/api/admin/register/finish',{body:{credential:passkey.create(await begin.json()),name},cookie});
  return {status:finish.status,cookie:cookieFrom(finish),body:await finish.json().catch(()=>null)};
}
async function login(base,passkey,opts={}){
  const begin=await call(base,'/api/admin/login/begin');if(!begin.ok)return {status:begin.status};
  const finish=await call(base,'/api/admin/login/finish',{body:{credential:passkey.get(await begin.json(),opts)}});
  return {status:finish.status,cookie:cookieFrom(finish)};
}
async function adminCookie(t,options){const s=await serve(t,options);const key=createPasskey({origin:s.origin});const r=await register(s.base,key,{code:s.server.admin.setupCode()});return {...s,key,cookie:r.cookie};}
module.exports={serve,call,register,login,adminCookie,createPasskey,cookieFrom};
