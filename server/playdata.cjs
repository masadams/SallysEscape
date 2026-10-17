// Anonymous play data. Players' browsers send small run summaries (see public/escape-playdata.js);
// each is checked field by field, stamped with the server's date and appended to one file per day
// in DATA_DIR/playdata. Nothing about the player is stored, not even their address. The admin
// area reads a per-escape summary and can export every run as one file for tuning.
const fs=require('node:fs'),path=require('node:path');
const {send,readBody,clientAddress,createLimiter}=require('./http-util.cjs');
const MAX_BODY=32*1024,MAX_RUNS=40,MAX_BYTES=200*1024*1024;
const OUTCOMES=new Set(['won','caught','failed','quit']),TOOLS=['pebble','burrow','tongue','camo','seed','glow','spore'];
const slug=(v,max=60)=>typeof v==='string'&&new RegExp('^[a-z0-9-]{1,'+max+'}$').test(v)?v:null;
const int=(v,lo,hi)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Math.round(Number(v)))):lo;
const num=(v,lo,hi)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Math.round(Number(v)*10)/10)):lo;

// The escapes a run can be about: the game's own, trail and hidden.
let known=null;
function knownIds(){if(known)return known;const {EscapeCatalog}=require('../public/escape-levels.js');
  known={trail:new Set(EscapeCatalog.levels.map(l=>l.id)),hidden:new Set((EscapeCatalog.hidden||[]).map(l=>l.id)),names:new Map([...EscapeCatalog.levels,...(EscapeCatalog.hidden||[])].map(l=>[l.id,l.name]))};return known;}

// One run, rebuilt from only the fields we keep; anything unexpected is dropped.
function clean(run,day){
  if(!run||typeof run!=='object')return null;
  const ids=knownIds(),where=run.where==='hidden'?'hidden':'trail',id=slug(run.id);
  if(!id||!ids[where].has(id)||!OUTCOMES.has(run.out))return null;
  const out={day,id,where,rev:int(run.rev,1,999),out:run.out,t:num(run.t,0,3600),tr:int(run.tr,0,99),al:int(run.al,0,999),dev:run.dev==='touch'?'touch':'desk'};
  if(slug(run.ch))out.ch=run.ch;if(run.stars)out.stars=int(run.stars,0,3);
  if(Array.isArray(run.catches))out.catches=run.catches.slice(0,12).filter(Array.isArray).map(c=>[int(c[0],0,99),int(c[1],0,99),typeof c[2]==='string'&&/^[a-z?-]{1,20}$/.test(c[2])?c[2]:'?',...(c[3]?[1]:[])]);
  if(run.tools&&typeof run.tools==='object'){const t={};for(const k of TOOLS)if(run.tools[k]>0)t[k]=int(run.tools[k],0,20);if(Object.keys(t).length)out.tools=t;}
  if(out.out==='quit'&&Array.isArray(run.at))out.at=[int(run.at[0],0,99),int(run.at[1],0,99)];
  return out;
}

function createPlayDataApi({dataDir=process.env.DATA_DIR||path.join(__dirname,'../data'),isAdmin=()=>false,trustProxy=Number(process.env.TRUST_PROXY||0),bodyDeadline=10000,perMinute=20}={}){
  const dir=path.join(dataDir,'playdata'),limiter=createLimiter({perMinute,allPerMinute:3000});
  const files=()=>{try{return fs.readdirSync(dir).filter(f=>/^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f)).sort();}catch(_){return [];}};
  let bytes=null;const used=()=>{if(bytes===null)bytes=files().reduce((n,f)=>{try{return n+fs.statSync(path.join(dir,f)).size;}catch(_){return n;}},0);return bytes;};
  const lines=()=>files().flatMap(f=>{try{return fs.readFileSync(path.join(dir,f),'utf8').split('\n').filter(Boolean);}catch(_){return [];}});

  // The admin's table: for each escape, how runs end, the typical winning time, what catches
  // Sally most and where. Rebuilt only when the files change.
  let cache=null,cacheStamp='';
  function summary(){
    const stamp=files().map(f=>{try{const s=fs.statSync(path.join(dir,f));return f+s.size;}catch(_){return f;}}).join();
    if(cache&&stamp===cacheStamp)return cache;
    const by=new Map(),days=new Set();let runs=0;
    for(const line of lines()){let r;try{r=JSON.parse(line);}catch(_){continue;}runs++;days.add(r.day);
      const k=r.id+(r.ch?'#'+r.ch:'');let e=by.get(k);if(!e){e={id:r.id,ch:r.ch||null,where:r.where,name:knownIds().names.get(r.id)||r.id,plays:0,won:0,caught:0,failed:0,quit:0,times:[],catchers:{},spots:{},tails:0};by.set(k,e);}
      e.plays++;e[r.out]++;if(r.out==='won')e.times.push(r.t);
      for(const c of r.catches||[]){e.catchers[c[2]]=(e.catchers[c[2]]||0)+1;const s=c[0]+','+c[1];e.spots[s]=(e.spots[s]||0)+1;if(c[3])e.tails++;}}
    const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);
    const levels=[...by.values()].map(({times,catchers,spots,...e})=>({...e,winRate:+(e.won/Math.max(1,e.plays)).toFixed(2),
      medianWin:times.length?times.sort((a,b)=>a-b)[Math.floor(times.length/2)]:null,catchers:top(catchers,3),hotspots:top(spots,5).map(([s,n])=>[...s.split(',').map(Number),n])}));
    const order=[...knownIds().trail];levels.sort((a,b)=>(a.where===b.where?0:a.where==='trail'?-1:1)||(order.indexOf(a.id)-order.indexOf(b.id))||String(a.ch).localeCompare(String(b.ch)));
    cache={runs,days:days.size,from:[...days].sort()[0]||null,bytes:used(),levels};cacheStamp=stamp;return cache;
  }

  async function handle(req,res,pathname){
    if(!pathname.startsWith('/api/playdata'))return false;
    try{
      if(pathname==='/api/playdata'&&req.method==='POST'){
        const ip=clientAddress(req,trustProxy);if(limiter.limited(ip)){send(res,429,{error:'Too many reports.'});return true;}limiter.failed(ip);
        const body=await readBody(req,{max:MAX_BODY,deadline:bodyDeadline}),day=new Date().toISOString().slice(0,10);
        const runs=(Array.isArray(body.runs)?body.runs:[]).slice(0,MAX_RUNS).map(r=>clean(r,day)).filter(Boolean);
        if(runs.length&&used()<MAX_BYTES){const text=runs.map(r=>JSON.stringify(r)).join('\n')+'\n';fs.mkdirSync(dir,{recursive:true});fs.appendFileSync(path.join(dir,day+'.jsonl'),text);bytes+=Buffer.byteLength(text);}
        send(res,204);return true;}
      if(!isAdmin(req)){send(res,401,{error:'Sign in with your passkey first.'});return true;}
      if(pathname==='/api/playdata/summary'&&req.method==='GET'){send(res,200,summary());return true;}
      if(pathname==='/api/playdata/export'&&req.method==='GET'){
        res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','Content-Disposition':'attachment; filename="sally-playdata-'+new Date().toISOString().slice(0,10)+'.ndjson"'});
        res.end(lines().join('\n')+(files().length?'\n':''));return true;}
      send(res,404,{error:'Not found.'});return true;
    }catch(error){if(!res.headersSent)send(res,error.status||500,{error:error.status===413?'Too large.':error.status===400?'Not play data.':'Could not save.'});return true;}
  }
  return {handle,summary};
}
module.exports={createPlayDataApi,clean};
