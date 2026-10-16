// Small pieces the API modules share: JSON replies, bounded request bodies, the visitor's
// address behind a trusted proxy, and a wrong-attempt limiter.
const send=(res,status,body,headers={})=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body));};

// A body must arrive whole, small and within a few seconds; a stalled or aborted upload is dropped.
function readBody(req,{max=64*1024,deadline=10000}={}){return new Promise((resolve,reject)=>{let size=0,done=false;const chunks=[];
  const fail=(status,message)=>{if(done)return;done=true;clearTimeout(timer);reject(Object.assign(new Error(message),{status}));};
  const timer=setTimeout(()=>fail(408,'too slow'),deadline);
  req.on('data',c=>{if(done)return;size+=c.length;if(size>max){fail(413,'too large');req.destroy();}else chunks.push(c);});
  req.on('end',()=>{if(done)return;done=true;clearTimeout(timer);try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'));}catch(_){reject(Object.assign(new Error('bad json'),{status:400}));}});
  req.on('aborted',()=>fail(400,'aborted'));req.on('error',()=>fail(400,'error'));});}

// trustProxy is the number of reverse proxies in front of the game (TRUST_PROXY). Only the
// forwarded address added by the nearest trusted proxy is believed; anything a visitor writes
// into X-Forwarded-For themselves sits further left and is ignored.
function clientAddress(req,trustProxy){
  const socket=req.socket?.remoteAddress||'?';if(!trustProxy)return socket;
  const hops=String(req.headers['x-forwarded-for']||'').split(',').map(s=>s.trim()).filter(Boolean);
  return hops[hops.length-trustProxy]||socket;
}

// Wrong attempts: a few a minute per visitor, then a short wait. Old entries are dropped, the
// table has a fixed size, and a generous cap on all attempts together only bites under a flood.
function createLimiter({perMinute=8,allPerMinute=600,maxTracked=10000}={}){
  const fails=new Map();let all=[];
  const fresh=(list,now)=>list.filter(t=>now-t<60000);
  const prune=now=>{for(const [key,list] of fails){const kept=fresh(list,now);if(kept.length)fails.set(key,kept);else fails.delete(key);}all=fresh(all,now);};
  return {
    limited(ip){const now=Date.now();return fresh(fails.get(ip)||[],now).length>=perMinute||fresh(all,now).length>=allPerMinute;},
    failed(ip){const now=Date.now();if(fails.size>=maxTracked)prune(now);const key=fails.size>=maxTracked&&!fails.has(ip)?'(many)':ip;fails.set(key,[...fresh(fails.get(key)||[],now),now]);all.push(now);},
    size:()=>fails.size,
  };
}
module.exports={send,readBody,clientAddress,createLimiter};
