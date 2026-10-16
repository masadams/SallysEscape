// The community shelf and the builder password. Published levels live in one JSON file in
// DATA_DIR; every level is checked with the builder's own rules before it is stored or served.
// Level makers prove themselves with BUILDER_PASSWORD; without one, publishing is switched off.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const Builder=require('../public/escape-builder.js');
const MAX_LEVELS=200,MAX_BODY=64*1024,FAILS_PER_MINUTE=8;

function createLevelApi({dataDir=process.env.DATA_DIR||path.join(__dirname,'../data'),password=process.env.BUILDER_PASSWORD||''}={}){
  const file=path.join(dataDir,'community-levels.json'),fails=new Map();
  const digest=text=>crypto.createHash('sha256').update(String(text)).digest();
  const passwordOk=given=>Boolean(password)&&typeof given==='string'&&crypto.timingSafeEqual(digest(given),digest(password));
  // A few wrong passwords a minute per address, then a short wait.
  const limited=ip=>{const now=Date.now(),recent=(fails.get(ip)||[]).filter(t=>now-t<60000);fails.set(ip,recent);return recent.length>=FAILS_PER_MINUTE;};
  const failed=ip=>{fails.get(ip)?.push(Date.now())||fails.set(ip,[Date.now()]);};
  function load(){try{const list=JSON.parse(fs.readFileSync(file,'utf8'));return Array.isArray(list)?list:[];}catch(_){return [];}}
  function save(list){fs.mkdirSync(dataDir,{recursive:true});const tmp=file+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify(list));fs.renameSync(tmp,file);}
  const clean=level=>{const model=Builder.sanitize(level);return model&&!Builder.validate(model).length?model:null;};
  const send=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(body===undefined?undefined:JSON.stringify(body));};
  function readBody(req){return new Promise((resolve,reject)=>{let size=0;const chunks=[];
    req.on('data',c=>{size+=c.length;if(size>MAX_BODY){reject(Object.assign(new Error('too large'),{status:413}));req.destroy();}else chunks.push(c);});
    req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'));}catch(_){reject(Object.assign(new Error('bad json'),{status:400}));}});req.on('error',reject);});}

  // Returns true when it handled the request.
  async function handle(req,res,pathname){
    if(!pathname.startsWith('/api/'))return false;
    const ip=req.socket?.remoteAddress||'?',given=req.headers['x-builder-password'];
    const maker=async()=>{if(!password){send(res,503,{error:'No builder password is set on this server.'});return false;}
      if(limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return false;}
      if(!passwordOk(given)){failed(ip);send(res,401,{error:'Wrong builder password.'});return false;}return true;};
    try{
      if(pathname==='/api/levels'&&['GET','HEAD'].includes(req.method)){const levels=load().map(l=>({...clean(l),publishedAt:l.publishedAt})).filter(l=>l.id);send(res,200,req.method==='HEAD'?undefined:{levels});return true;}
      if(pathname==='/api/builder/unlock'&&req.method==='POST'){
        if(!password){send(res,503,{error:'No builder password is set on this server.'});return true;}
        if(limited(ip)){send(res,429,{error:'Too many tries. Wait a minute.'});return true;}
        const body=await readBody(req);if(passwordOk(body.password)){send(res,204);return true;}failed(ip);send(res,401,{error:'Wrong builder password.'});return true;}
      if(pathname==='/api/levels'&&req.method==='POST'){
        if(!await maker())return true;const body=await readBody(req),level=clean(body.level);
        if(!level){send(res,400,{error:'That level is not ready to play: check it in the builder first.'});return true;}
        const list=load().filter(l=>l.id!==level.id);if(list.length>=MAX_LEVELS){send(res,409,{error:'The community shelf is full. Take a level down first.'});return true;}
        list.unshift({...level,publishedAt:new Date().toISOString()});save(list);send(res,201,{id:level.id});return true;}
      const one=/^\/api\/levels\/(custom-[a-z0-9-]{1,40})$/.exec(pathname);
      if(one&&req.method==='DELETE'){if(!await maker())return true;const list=load(),next=list.filter(l=>l.id!==one[1]);if(next.length===list.length){send(res,404,{error:'No such level.'});return true;}save(next);send(res,204);return true;}
      send(res,404,{error:'Not found.'});return true;
    }catch(error){send(res,error.status||500,{error:error.status===413?'That level is too large.':error.status===400?'That was not a level.':'The shelf could not be saved.'});return true;}
  }
  return {handle};
}
module.exports={createLevelApi};
