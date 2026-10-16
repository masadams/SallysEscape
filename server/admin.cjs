// Admin sign-in with passkeys. There is no password: the first time the server starts with no
// passkey, it prints a one-time setup code in its log; whoever has that code creates the first
// passkey. Signed-in admins can make one-time invite codes to add more devices, and can remove
// passkeys. A signed-in admin gets a session cookie the level builder and community tools check.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const W=require('./webauthn.cjs');
const {send,readBody,clientAddress,createLimiter}=require('./http-util.cjs');
const SESSION_HOURS=12,CHALLENGE_MS=5*60000,INVITE_MS=15*60000,MAX_PASSKEYS=20,MAX_SESSIONS=200,COOKIE='sally_admin';

// Codes people type: no look-alike letters, grouped in fours.
function code(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=crypto.randomBytes(8);let s='';for(let i=0;i<8;i++){s+=chars[bytes[i]%chars.length];if(i===3)s+='-';}return s;}
const sameCode=(a,b)=>{const norm=t=>String(t||'').toUpperCase().replace(/[^A-Z0-9]/g,'');const x=crypto.createHash('sha256').update(norm(a)).digest(),y=crypto.createHash('sha256').update(norm(b)).digest();return Boolean(norm(a))&&crypto.timingSafeEqual(x,y);};

function createAdminApi({dataDir=process.env.DATA_DIR||path.join(__dirname,'../data'),publicOrigin=process.env.PUBLIC_ORIGIN||'',trustProxy=Number(process.env.TRUST_PROXY||0),bodyDeadline=10000,log=console.log}={}){
  trustProxy=Math.max(0,Math.min(5,Math.floor(Number(trustProxy)||0)));
  const file=path.join(dataDir,'admin-passkeys.json'),limiter=createLimiter();
  let store={passkeys:[]};try{const s=JSON.parse(fs.readFileSync(file,'utf8'));if(Array.isArray(s.passkeys))store={passkeys:s.passkeys.slice(0,MAX_PASSKEYS)};}catch(_){}
  const save=()=>{fs.mkdirSync(dataDir,{recursive:true});const tmp=file+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(store),{mode:0o600});fs.renameSync(tmp,file);};
  let setupCode=store.passkeys.length?null:code();
  if(setupCode)log('Admin setup: no passkey yet. Open the game, choose Level builder or Admin, and enter this one-time setup code: '+setupCode);
  const invites=new Map(),challenges=new Map(),sessions=new Map();
  const tidy=()=>{const now=Date.now();for(const m of [invites,challenges,sessions])for(const [k,v] of m)if(v.expires<now)m.delete(k);};

  // The site passkeys are bound to: PUBLIC_ORIGIN when set (recommended), otherwise the address
  // the request came in on (behind a trusted proxy, its forwarded scheme).
  function site(req){
    let origin=publicOrigin.replace(/\/+$/,'');
    if(!origin){const proto=trustProxy&&req.headers['x-forwarded-proto']?String(req.headers['x-forwarded-proto']).split(',')[0].trim():req.socket?.encrypted?'https':'http';origin=proto+'://'+String(req.headers.host||'localhost');}
    let url;try{url=new URL(origin);}catch(_){url=new URL('http://localhost');}
    return {origin:url.origin,rpId:url.hostname,secure:url.protocol==='https:'};
  }
  const cookieOf=req=>{const m=/(?:^|;\s*)sally_admin=([A-Za-z0-9_-]{20,100})/.exec(String(req.headers.cookie||''));return m?m[1]:null;};
  function session(req){tidy();const token=cookieOf(req);const s=token&&sessions.get(token);return s&&store.passkeys.some(p=>p.id===s.passkey)?s:null;}
  function startSession(req,res,passkey){
    tidy();if(sessions.size>=MAX_SESSIONS){const oldest=[...sessions.entries()].sort((a,b)=>a[1].expires-b[1].expires)[0];sessions.delete(oldest[0]);}
    const token=W.b64url(crypto.randomBytes(32));sessions.set(token,{passkey,expires:Date.now()+SESSION_HOURS*3600000});
    return COOKIE+'='+token+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+SESSION_HOURS*3600+(site(req).secure?'; Secure':'');
  }
  const newChallenge=(type,extra={})=>{tidy();if(challenges.size>500)challenges.clear();const c=W.b64url(crypto.randomBytes(32));challenges.set(c,{type,expires:Date.now()+CHALLENGE_MS,...extra});return c;};
  const takeChallenge=(credential,type)=>{
    let client;try{client=JSON.parse(W.fromB64url(credential?.response?.clientDataJSON||'').toString('utf8'));}catch(_){return null;}
    const c=typeof client?.challenge==='string'?client.challenge:'',entry=challenges.get(c);challenges.delete(c);
    return entry&&entry.type===type&&entry.expires>Date.now()?{challenge:c,...entry}:null;
  };
  const publicPasskey=p=>({id:p.id.slice(0,12),name:p.name,createdAt:p.createdAt,lastUsedAt:p.lastUsedAt||null});

  async function handle(req,res,pathname){
    if(!pathname.startsWith('/api/admin/'))return false;
    const ip=clientAddress(req,trustProxy),me=session(req),where=site(req);
    // Changes must come from the game's own page: a request from another site is refused.
    if(req.method!=='GET'&&req.method!=='HEAD'&&req.headers.origin&&req.headers.origin!==where.origin){send(res,403,{error:'Wrong origin.'});return true;}
    const refuse=(status,error)=>{limiter.failed(ip);send(res,status,{error});return true;};
    try{
      if(pathname==='/api/admin/status'&&req.method==='GET'){send(res,200,{signedIn:Boolean(me),setupNeeded:!store.passkeys.length,passkeys:me?store.passkeys.length:undefined});return true;}
      if(pathname==='/api/admin/logout'&&req.method==='POST'){const t=cookieOf(req);if(t)sessions.delete(t);send(res,204,undefined,{'Set-Cookie':COOKIE+'=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'});return true;}

      if(pathname==='/api/admin/register/begin'&&req.method==='POST'){
        if(limiter.limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return true;}
        const body=await readBody(req,{max:4096,deadline:bodyDeadline});let via=null;
        if(me)via='admin';else if(setupCode&&sameCode(body.code,setupCode))via='setup';
        else{tidy();for(const [k,v] of invites)if(sameCode(body.code,k)&&v.expires>Date.now()){via='invite:'+k;break;}}
        if(!via)return refuse(401,store.passkeys.length?'That code is not a current invite code.':'That is not the setup code. It is printed in the server log.');
        if(store.passkeys.length>=MAX_PASSKEYS){send(res,409,{error:'There are already '+MAX_PASSKEYS+' passkeys. Remove one first.'});return true;}
        const challenge=newChallenge('register',{via});
        send(res,200,{publicKey:{challenge,rp:{name:"Sally's Escape",id:where.rpId},user:{id:W.b64url(crypto.randomBytes(16)),name:'admin',displayName:"Sally's Escape admin"},
          pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-8},{type:'public-key',alg:-257}],timeout:CHALLENGE_MS,attestation:'none',
          authenticatorSelection:{residentKey:'preferred',userVerification:'preferred'},excludeCredentials:store.passkeys.map(p=>({type:'public-key',id:p.id}))}});return true;
      }
      if(pathname==='/api/admin/register/finish'&&req.method==='POST'){
        if(limiter.limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return true;}
        const body=await readBody(req,{max:16384,deadline:bodyDeadline}),entry=takeChallenge(body.credential,'register');
        if(!entry)return refuse(400,'That passkey request expired. Try again.');
        if(entry.via==='setup'&&!setupCode||entry.via.startsWith('invite:')&&!invites.has(entry.via.slice(7))||entry.via==='admin'&&!me)return refuse(401,'That code has already been used.');
        let key;try{key=W.verifyRegistration(body.credential,{challenge:entry.challenge,origin:where.origin,rpId:where.rpId});}catch(e){return refuse(400,'The passkey could not be checked: '+e.message+'.');}
        if(store.passkeys.some(p=>p.id===key.id)){send(res,409,{error:'That passkey is already registered.'});return true;}
        const name=String(body.name||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,40)||'Passkey '+(store.passkeys.length+1);
        store.passkeys.push({id:key.id,alg:key.alg,jwk:key.jwk,signCount:key.signCount,name,createdAt:new Date().toISOString(),lastUsedAt:new Date().toISOString()});save();
        if(entry.via==='setup')setupCode=null;if(entry.via.startsWith('invite:'))invites.delete(entry.via.slice(7));
        send(res,201,{name},{'Set-Cookie':startSession(req,res,key.id)});return true;
      }
      if(pathname==='/api/admin/login/begin'&&req.method==='POST'){
        if(!store.passkeys.length){send(res,409,{error:'No passkey has been set up yet.'});return true;}
        if(limiter.limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return true;}
        send(res,200,{publicKey:{challenge:newChallenge('login'),rpId:where.rpId,timeout:CHALLENGE_MS,userVerification:'preferred',allowCredentials:store.passkeys.map(p=>({type:'public-key',id:p.id}))}});return true;
      }
      if(pathname==='/api/admin/login/finish'&&req.method==='POST'){
        if(limiter.limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return true;}
        const body=await readBody(req,{max:16384,deadline:bodyDeadline}),entry=takeChallenge(body.credential,'login');
        if(!entry)return refuse(400,'That sign-in request expired. Try again.');
        const stored=store.passkeys.find(p=>p.id===String(body.credential?.rawId||body.credential?.id||''));
        if(!stored)return refuse(401,'That passkey is not registered here.');
        let result;try{result=W.verifyAuthentication(body.credential,stored,{challenge:entry.challenge,origin:where.origin,rpId:where.rpId});}catch(e){return refuse(401,'The passkey could not be checked: '+e.message+'.');}
        stored.signCount=result.signCount;stored.lastUsedAt=new Date().toISOString();save();
        send(res,204,undefined,{'Set-Cookie':startSession(req,res,stored.id)});return true;
      }

      // Everything below needs a signed-in admin.
      if(!me){send(res,401,{error:'Sign in with your passkey.'});return true;}
      if(pathname==='/api/admin/passkeys'&&req.method==='GET'){send(res,200,{passkeys:store.passkeys.map(publicPasskey),current:me.passkey.slice(0,12)});return true;}
      const one=/^\/api\/admin\/passkeys\/([A-Za-z0-9_-]{4,40})$/.exec(pathname);
      if(one&&req.method==='DELETE'){
        const target=store.passkeys.find(p=>p.id.slice(0,12)===one[1]);if(!target){send(res,404,{error:'No such passkey.'});return true;}
        if(store.passkeys.length===1){send(res,409,{error:'This is the last passkey. Add another before removing it.'});return true;}
        store.passkeys=store.passkeys.filter(p=>p!==target);save();for(const [k,v] of sessions)if(v.passkey===target.id)sessions.delete(k);
        send(res,204);return true;
      }
      if(pathname==='/api/admin/invite'&&req.method==='POST'){tidy();if(invites.size>=10){send(res,429,{error:'Too many open invites. Use one or wait for them to expire.'});return true;}const c=code();invites.set(c,{expires:Date.now()+INVITE_MS});send(res,201,{code:c,minutes:INVITE_MS/60000});return true;}
      send(res,404,{error:'Not found.'});return true;
    }catch(error){if(!res.headersSent)send(res,error.status||500,{error:error.status===413?'Too large.':error.status===408?'Too slow.':error.status===400?'That was not a valid request.':'Something went wrong.'});return true;}
  }
  return {handle,isAdmin:req=>Boolean(session(req)),setupCode:()=>setupCode};
}
module.exports={createAdminApi};
