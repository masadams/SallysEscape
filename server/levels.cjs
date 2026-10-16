// The community shelf. Published levels live in one JSON file in DATA_DIR; every level is checked
// with the builder's own rules when it is published and when the file is (re)loaded, and the
// checked shelf is kept in memory, so reading it costs nothing per request. Publishing and taking
// levels down need a signed-in admin (a passkey, see admin.cjs).
const fs=require('node:fs'),path=require('node:path');
const Builder=require('../public/escape-builder.js');
const {send,readBody,clientAddress}=require('./http-util.cjs');
const MAX_LEVELS=200,MAX_BODY=64*1024,BODY_DEADLINE=10000;

function createLevelApi({dataDir=process.env.DATA_DIR||path.join(__dirname,'../data'),isAdmin=()=>false,bodyDeadline=BODY_DEADLINE}={}){
  const file=path.join(dataDir,'community-levels.json');

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
      if(one&&req.method==='DELETE'){if(!admin())return true;const list=readShelf().levels,next=list.filter(l=>l.id!==one[1]);if(next.length===list.length){send(res,404,{error:'No such level.'});return true;}writeShelf(next);send(res,204);return true;}
      send(res,404,{error:'Not found.'});return true;
    }catch(error){if(!res.headersSent)send(res,error.status||500,{error:error.status===413?'That level is too large.':error.status===408?'The upload took too long.':error.status===400?'That was not a level.':'The shelf could not be saved.'});return true;}
  }
  return {handle};
}
module.exports={createLevelApi,clientAddress};
