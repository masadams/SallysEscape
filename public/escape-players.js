// Players: up to six people can share one browser, each with their own name, colour, progress and
// settings. Nothing leaves the browser. Each player's saved keys are their own: the first player
// (whoever played before players existed) keeps the original keys, so no progress is lost, and
// every later player's keys carry an "@id" suffix. Switching player reloads the game.
(function(root){
  const KEY='sally-escape-players-v1',MAX=6,PROGRESS='sallys-escape-progress-v1';
  const COLORS=[['Leaf','#7cc46a'],['Sky','#6aa8e8'],['Sun','#f0c050'],['Berry','#d86a9a'],['Ember','#e8865a'],['Dusk','#a68ae0']];
  const raw=(()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})();
  // A fresh start for the new story: the first load of this save era clears every player's progress,
  // stickers, tips and last-played escape (names, colours, settings and built levels stay).
  const ERA_KEY='sally-escape-save-era',ERA='2',WIPE=['sallys-escape-progress-v1','sallys-escape-kids','sally-escape-last-played','sally-escape-community-best','sally-escape-current-tip','sally-escape-unlock-all'];
  function freshStart(){
    if(!raw)return false;try{if(raw.getItem(ERA_KEY)===ERA)return false;
      const keys=[];for(let i=0;i<raw.length;i++)keys.push(raw.key(i));
      for(const k of keys){const base=String(k).split('@')[0];if(WIPE.includes(base)||/^sally-escape-[a-z]+-tip$/.test(base))raw.removeItem(k);}
      raw.setItem(ERA_KEY,ERA);return true;}catch(_){return false;}
  }
  freshStart();
  const clean=n=>String(n||'').replace(/\s+/g,' ').trim().slice(0,20);
  const stamp=()=>new Date().toISOString();
  function read(){
    let s=null;try{s=JSON.parse(raw?.getItem(KEY)||'null');}catch(_){}
    if(!s||!Array.isArray(s.list)||!s.list.length){s={current:'p1',list:[{id:'p1',name:'Player 1',color:0,legacy:true,createdAt:stamp()}],keys:[]};write(s);}
    if(!s.list.some(p=>p.id===s.current))s.current=s.list[0].id;if(!Array.isArray(s.keys))s.keys=[];
    return s;
  }
  function write(s){try{raw?.setItem(KEY,JSON.stringify(s));return true;}catch(_){return false;}}
  const keyFor=(p,k)=>p.legacy?k:k+'@'+p.id;
  // The storage the game uses: the same calls as localStorage, scoped to one player.
  function storage(id){
    const s=read(),p=s.list.find(q=>q.id===(id||s.current))||s.list[0];
    const note=k=>{const t=read();if(!t.keys.includes(k)){t.keys.push(k);write(t);}};
    return {
      getItem:k=>raw?.getItem(keyFor(p,k))??null,
      setItem:(k,v)=>{note(k);raw?.setItem(keyFor(p,k),v);},
      removeItem:k=>raw?.removeItem(keyFor(p,k)),
    };
  }
  // A short summary for the player list: stars and escapes cleared.
  function summary(id){
    try{const d=JSON.parse(storage(id).getItem(PROGRESS)||'{}');let stars=0,cleared=0;
      for(const l of Object.values(d.levels||{})){stars+=Number(l?.stars)||0;if(l?.stars>0||l?.best)cleared++;}
      return {stars,cleared};}catch(_){return {stars:0,cleared:0};}
  }
  const api={KEY,MAX,COLORS,ERA_KEY,freshStart,
    list:()=>read().list,
    current:()=>{const s=read();return s.list.find(p=>p.id===s.current);},
    storage,summary,
    create(name,color=0){const s=read();if(s.list.length>=MAX)return null;let n=1;while(s.list.some(p=>p.id==='p'+n))n++;
      const p={id:'p'+n,name:clean(name)||'Player '+n,color:Math.max(0,Math.min(COLORS.length-1,Number(color)||0)),createdAt:stamp()};s.list.push(p);write(s);return p;},
    rename(id,name,color){const s=read(),p=s.list.find(q=>q.id===id);if(!p)return false;if(clean(name))p.name=clean(name);if(color!==undefined)p.color=Math.max(0,Math.min(COLORS.length-1,Number(color)||0));return write(s);},
    select(id){const s=read();if(!s.list.some(p=>p.id===id))return false;s.current=id;const p=s.list.find(q=>q.id===id);p.lastPlayed=stamp();return write(s);},
    // Removing a player forgets everything they saved. The last player cannot be removed.
    remove(id){const s=read();if(s.list.length<=1)return false;const p=s.list.find(q=>q.id===id);if(!p)return false;
      for(const k of s.keys)try{raw?.removeItem(keyFor(p,k));}catch(_){}
      s.list=s.list.filter(q=>q.id!==id);if(s.current===id)s.current=s.list[0].id;return write(s);},
  };
  root.EscapePlayers=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
