// The community shelf. Published levels live in one JSON file in DATA_DIR, and a starter set ships
// with the game (community-seed.json) until an admin takes one down. Every level is checked
// with the builder's own rules when it is published and when the file is (re)loaded, and the
// checked shelf is kept in memory, so reading it costs nothing per request. Publishing and taking
// levels down need a signed-in admin (a passkey, see admin.cjs).
const fs=require('node:fs'),path=require('node:path');
const Builder=require('../public/escape-builder.js');
const {send,readBody,clientAddress}=require('./http-util.cjs');
const MAX_LEVELS=200,MAX_BODY=64*1024,BODY_DEADLINE=10000;

function createLevelApi({dataDir=process.env.DATA_DIR||path.join(__dirname,'../data'),isAdmin=()=>false,bodyDeadline=BODY_DEADLINE,seedFile=path.join(__dirname,'community-seed.json')}={}){
  const file=path.join(dataDir,'community-levels.json'),hiddenFile=path.join(dataDir,'community-hidden.json');
  const readJson=(f,fallback)=>{try{const v=JSON.parse(fs.readFileSync(f,'utf8'));return Array.isArray(v)?v:fallback;}catch(_){return fallback;}};
  // Starter levels, minus any an admin has taken down.
  const seeds=()=>{const hidden=new Set(readJson(hiddenFile,[]));return readJson(seedFile,[]).filter(l=>l&&!hidden.has(l.id));};

  // The checked shelf, kept in memory and reloaded only when the file itself changes.
  let shelf=null,shelfStamp=null;
  const clean=level=>{const model=Builder.sanitize(level);return model&&!Builder.validate(model).length?model:null;};
  function readShelf(){
    let stamp='';for(const f of [file,hiddenFile,seedFile]){try{const s=fs.statSync(f);stamp+=s.mtimeMs+':'+s.size+';';}catch(_){stamp+='-;';}}
    if(shelf&&stamp===shelfStamp)return shelf;
    const own=readJson(file,[]).slice(0,MAX_LEVELS),ids=new Set(own.map(l=>l?.id));
    const raw=[...own,...seeds().filter(l=>!ids.has(l.id))].slice(0,MAX_LEVELS);
    const levels=raw.map(l=>{const c=clean(l);return c&&{...c,publishedAt:typeof l.publishedAt==='string'?l.publishedAt.slice(0,40):null,...(ids.has(l.id)?{}:{seed:true})};}).filter(Boolean);
    shelf={levels,json:JSON.stringify({levels})};shelfStamp=stamp;return shelf;
  }
  const writeJson=(f,value)=>{fs.mkdirSync(dataDir,{recursive:true});const tmp=f+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(value));fs.renameSync(tmp,f);};
  // Only the admin's own published levels go in the file; starter levels stay in the seed.
  function writeShelf(levels){writeJson(file,levels.filter(l=>!l.seed).map(({seed,...l})=>l));shelf=null;readShelf();}

  // Returns true when it handled the request.
  async function handle(req,res,pathname){
    if(!pathname.startsWith('/api/'))return false;
    const admin=()=>{if(isAdmin(req))return true;send(res,401,{error:'Sign in with your passkey first.'});return false;};
    try{
      if(pathname==='/api/levels'&&['GET','HEAD'].includes(req.method)){send(res,200,req.method==='HEAD'?undefined:readShelf().json);return true;}
      if(pathname==='/api/levels'&&req.method==='POST'){
        if(!admin())return true;const body=await readBody(req,{max:MAX_BODY,deadline:bodyDeadline}),level=clean(body.level);
        if(!level){send(res,400,{error:'That level is not ready to play: check it in the builder first.'});return true;}
        const list=readShelf().levels.filter(l=>l.id!==level.id);if(list.length>=MAX_LEVELS){send(res,409,{error:'The community shelf is full. Take a level down first.'});return true;}
        writeShelf([{...level,publishedAt:new Date().toISOString()},...list]);send(res,201,{id:level.id});return true;}
      const one=/^\/api\/levels\/(custom-[a-z0-9-]{1,40})$/.exec(pathname);
      if(one&&req.method==='DELETE'){if(!admin())return true;const list=readShelf().levels,gone=list.find(l=>l.id===one[1]);if(!gone){send(res,404,{error:'No such level.'});return true;}
        if(gone.seed)writeJson(hiddenFile,[...new Set([...readJson(hiddenFile,[]),gone.id])]);writeShelf(list.filter(l=>l.id!==one[1]));send(res,204);return true;}
      send(res,404,{error:'Not found.'});return true;
    }catch(error){if(!res.headersSent)send(res,error.status||500,{error:error.status===413?'That level is too large.':error.status===408?'The upload took too long.':error.status===400?'That was not a level.':'The shelf could not be saved.'});return true;}
  }
  return {handle};
}
module.exports={createLevelApi,clientAddress};
