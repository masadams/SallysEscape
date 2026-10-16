// The community shelf and the builder password. Published levels live in one JSON file in
// DATA_DIR; every level is checked with the builder's own rules when it is published and when the
// file is (re)loaded, and the checked shelf is kept in memory, so reading it costs nothing per
// request. Level makers prove themselves with BUILDER_PASSWORD; without one, publishing is off.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const Builder=require('../public/escape-builder.js');
const MAX_LEVELS=200,MAX_BODY=64*1024,BODY_DEADLINE=10000;
const FAILS_PER_MINUTE=8,FAILS_PER_MINUTE_ALL=600,MAX_TRACKED=10000;

// Spaces, a stray Windows line ending or a different Unicode form must not make a correct password fail.
const normal=text=>String(text??'').normalize('NFC').trim();
// trustProxy is the number of reverse proxies in front of the game (TRUST_PROXY). Only the
// forwarded address added by the nearest trusted proxy is believed; anything a visitor writes
// into X-Forwarded-For themselves sits further left and is ignored.
function clientAddress(req,trustProxy){
  const socket=req.socket?.remoteAddress||'?';if(!trustProxy)return socket;
  const hops=String(req.headers['x-forwarded-for']||'').split(',').map(s=>s.trim()).filter(Boolean);
  return hops[hops.length-trustProxy]||socket;
}
function createLevelApi({dataDir=process.env.DATA_DIR||path.join(__dirname,'../data'),password=process.env.BUILDER_PASSWORD||'',trustProxy=Number(process.env.TRUST_PROXY||0),bodyDeadline=BODY_DEADLINE}={}){
  password=normal(password);trustProxy=Math.max(0,Math.min(5,Math.floor(Number(trustProxy)||0)));
  const file=path.join(dataDir,'community-levels.json');
  const digest=text=>crypto.createHash('sha256').update(String(text)).digest();
  const passwordOk=given=>Boolean(password)&&typeof given==='string'&&crypto.timingSafeEqual(digest(normal(given)),digest(password));

  // Wrong passwords: a few a minute per visitor, then a short wait. Old entries are dropped, the
  // table has a fixed size, and a generous cap on all wrong tries together only bites under a flood.
  const fails=new Map();let allFails=[];
  const prune=now=>{for(const [key,list] of fails){const kept=list.filter(t=>now-t<60000);if(kept.length)fails.set(key,kept);else fails.delete(key);}allFails=allFails.filter(t=>now-t<60000);};
  const limited=ip=>{const now=Date.now();return (fails.get(ip)||[]).filter(t=>now-t<60000).length>=FAILS_PER_MINUTE||allFails.filter(t=>now-t<60000).length>=FAILS_PER_MINUTE_ALL;};
  const failed=ip=>{const now=Date.now();if(fails.size>=MAX_TRACKED)prune(now);const key=fails.size>=MAX_TRACKED&&!fails.has(ip)?'(many)':ip;fails.set(key,[...(fails.get(key)||[]).filter(t=>now-t<60000),now]);allFails.push(now);};

  // The checked shelf, kept in memory and reloaded only when the file itself changes.
  let shelf=null,shelfStamp=null;
  const clean=level=>{const model=Builder.sanitize(level);return model&&!Builder.validate(model).length?model:null;};
  function readShelf(){
    let stamp=null;try{const s=fs.statSync(file);stamp=s.mtimeMs+':'+s.size;}catch(_){}
    if(shelf&&stamp===shelfStamp)return shelf;
    let raw=[];try{const list=JSON.parse(fs.readFileSync(file,'utf8'));if(Array.isArray(list))raw=list.slice(0,MAX_LEVELS);}catch(_){}
    const levels=raw.map(l=>{const c=clean(l);return c&&{...c,publishedAt:typeof l.publishedAt==='string'?l.publishedAt.slice(0,40):null};}).filter(Boolean);
    shelf={levels,json:JSON.stringify({levels})};shelfStamp=stamp;return shelf;
  }
  function writeShelf(levels){
    fs.mkdirSync(dataDir,{recursive:true});const tmp=file+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(levels));fs.renameSync(tmp,file);
    shelf=null;readShelf();
  }
  const send=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body));};
  // A body must arrive whole, small and within a few seconds; a stalled or aborted upload is dropped.
  function readBody(req){return new Promise((resolve,reject)=>{let size=0,done=false;const chunks=[];
    const fail=(status,message)=>{if(done)return;done=true;clearTimeout(timer);reject(Object.assign(new Error(message),{status}));};
    const timer=setTimeout(()=>{fail(408,'too slow');},bodyDeadline);
    req.on('data',c=>{if(done)return;size+=c.length;if(size>MAX_BODY){fail(413,'too large');req.destroy();}else chunks.push(c);});
    req.on('end',()=>{if(done)return;done=true;clearTimeout(timer);try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'));}catch(_){reject(Object.assign(new Error('bad json'),{status:400}));}});
    req.on('aborted',()=>fail(400,'aborted'));req.on('error',()=>fail(400,'error'));});}

  // Returns true when it handled the request.
  async function handle(req,res,pathname){
    if(!pathname.startsWith('/api/'))return false;
    const ip=clientAddress(req,trustProxy),given=(()=>{try{return decodeURIComponent(req.headers['x-builder-password']||'');}catch(_){return req.headers['x-builder-password'];}})();
    const maker=()=>{if(!password){send(res,503,{error:'No builder password is set on this server.'});return false;}
      if(limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return false;}
      if(!passwordOk(given)){failed(ip);send(res,401,{error:'Wrong builder password.'});return false;}return true;};
    try{
      if(pathname==='/api/levels'&&['GET','HEAD'].includes(req.method)){send(res,200,req.method==='HEAD'?undefined:readShelf().json);return true;}
      // Lets the lock screen say up front when the server has no builder password.
      if(pathname==='/api/builder'&&['GET','HEAD'].includes(req.method)){send(res,200,req.method==='HEAD'?undefined:{enabled:Boolean(password)});return true;}
      if(pathname==='/api/builder/unlock'&&req.method==='POST'){
        if(!password){send(res,503,{error:'No builder password is set on this server.'});return true;}
        if(limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return true;}
        const body=await readBody(req);if(passwordOk(body.password)){send(res,204);return true;}failed(ip);send(res,401,{error:'Wrong builder password.'});return true;}
      if(pathname==='/api/levels'&&req.method==='POST'){
        if(!maker())return true;const body=await readBody(req),level=clean(body.level);
        if(!level){send(res,400,{error:'That level is not ready to play: check it in the builder first.'});return true;}
        const list=readShelf().levels.filter(l=>l.id!==level.id);if(list.length>=MAX_LEVELS){send(res,409,{error:'The community shelf is full. Take a level down first.'});return true;}
        writeShelf([{...level,publishedAt:new Date().toISOString()},...list]);send(res,201,{id:level.id});return true;}
      const one=/^\/api\/levels\/(custom-[a-z0-9-]{1,40})$/.exec(pathname);
      if(one&&req.method==='DELETE'){if(!maker())return true;const list=readShelf().levels,next=list.filter(l=>l.id!==one[1]);if(next.length===list.length){send(res,404,{error:'No such level.'});return true;}writeShelf(next);send(res,204);return true;}
      send(res,404,{error:'Not found.'});return true;
    }catch(error){if(!res.headersSent)send(res,error.status||500,{error:error.status===413?'That level is too large.':error.status===408?'The upload took too long.':error.status===400?'That was not a level.':'The shelf could not be saved.'});return true;}
  }
  return {handle,enabled:Boolean(password),_tracked:()=>fails.size};
}
module.exports={createLevelApi,clientAddress};
