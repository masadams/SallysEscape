// Anonymous play data: one small summary per finished or abandoned run (which escape, how it
// ended, how long it took, where Sally was caught and by what, which tools she used), so the
// escapes can be tuned from how people really play. No names, no accounts, no ids that follow a
// player. Summaries wait in this browser and go to the server a few at a time (/api/playdata); the
// admin area shows a table of them and exports them all.
(function(root){
  const KEY='sally-escape-playdata-v1',OFF='sally-escape-playdata-off',ASKED='sally-escape-playdata-asked',MAX=200,BATCH=40,SEND_AT=5;
  const store=(()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})();
  const read=()=>{try{const q=JSON.parse(store?.getItem(KEY)||'[]');return Array.isArray(q)?q:[];}catch(_){return [];}};
  const write=q=>{try{store?.setItem(KEY,JSON.stringify(q.slice(-MAX)));}catch(_){}};
  const round=n=>Math.round((Number(n)||0)*10)/10;
  let sending=false;
  // Nothing is shared until someone on the device says yes: the game asks once, on the title screen,
  // and the answer can be changed in Options. It is one switch for the whole device, since the
  // waiting summaries are kept for the device too; turning it off throws away anything not yet sent.
  const asked=()=>{try{return store?.getItem(ASKED)==='1';}catch(_){return false;}};
  const enabled=()=>{try{return asked()&&store?.getItem(OFF)!=='1';}catch(_){return false;}};
  function setEnabled(on){try{store?.setItem(ASKED,'1');if(on)store?.removeItem(OFF);else{store?.setItem(OFF,'1');store?.removeItem(KEY);}}catch(_){}}

  // The summary of a run. outcome is the engine's status, or 'quit' when the player left mid-run.
  function summary(game,outcome,device){
    const l=game.level,r=game.result,p=game.player;
    const out={v:1,id:String(l.id||'').slice(0,60),where:l.hidden?'hidden':'trail',rev:l.revision||1,out:outcome,t:round(game.elapsed),
      tr:game.treasure||0,al:game.alarms||0,catches:(game.catches||[]).slice(0,12).map(c=>[c.x,c.y,c.by,...(c.tail?[1]:[])]),day:new Date().toISOString().slice(0,10),dev:device||'desk'};
    if(game.challenge?.id)out.ch=String(game.challenge.id).slice(0,60);
    if(r?.stars)out.stars=r.stars;
    const tools=typeof game.toolsUsed==='function'?game.toolsUsed():{};if(Object.keys(tools).length)out.tools=tools;
    if(outcome==='quit'&&p)out.at=[Math.floor(p.x),Math.floor(p.y)];
    return out;
  }
  // Only the game's own escapes count: builder playtests, community levels and workshop drafts do not.
  const counts=game=>Boolean(game?.level&&!game.level.custom&&!game.level.kids&&!game.level.draft&&game.level.id);
  function record(game,outcome,device){
    if(!enabled()||!counts(game)||game.playDataSent)return false;game.playDataSent=true;
    const q=read();q.push(summary(game,outcome,device));write(q);
    if(q.length>=SEND_AT)flush();return true;
  }
  // Send what is waiting. On the way out of the page a beacon carries it, since a request may not finish.
  function flush(leaving){
    if(!enabled())return false;const q=read();if(!q.length||sending)return false;const batch=q.slice(0,BATCH),body=JSON.stringify({v:1,runs:batch});
    if(leaving&&typeof navigator!=='undefined'&&navigator.sendBeacon){if(navigator.sendBeacon('/api/playdata',new Blob([body],{type:'application/json'})))write(read().slice(batch.length));return true;}
    if(typeof fetch!=='function')return false;sending=true;
    fetch('/api/playdata',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).then(r=>{if(r.ok||r.status===400)write(read().slice(batch.length));}).catch(()=>{}).finally(()=>{sending=false;});
    return true;
  }
  const api={KEY,summary,record,flush,enabled,asked,setEnabled,pending:()=>read().length};
  root.EscapePlayData=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
