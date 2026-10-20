// A season is released only when its content is ready AND its explicit release date has passed.
// Dates describe the first opening, never an annual reset or a deadline to finish.
(function(root){
 'use strict';
 const KEY='sally-escape-seasons-v1';
 const packs=Object.freeze([
  Object.freeze({id:'autumn-hollow',name:'Autumn Hollow',subtitle:'The Lantern Festival',theme:'autumn-festival',ready:true,opensAt:'2026-10-01T00:00:00-04:00',zone:'America/Toronto',motif:'autumn',levels:8}),
  Object.freeze({id:'winter',name:'Winterlight Hollow',subtitle:'The Missing Christmas Star',theme:'winter-village',ready:true,access:'open',opensAt:'2026-12-01T00:00:00-05:00',zone:'America/Toronto',motif:'snow',levels:8}),
  Object.freeze({id:'spring',name:'A blossom path',subtitle:'Beyond the sleeping garden',theme:'garden',ready:false,opensAt:'2027-03-20T00:00:00-04:00',zone:'America/Toronto',motif:'blossom',levels:0}),
  Object.freeze({id:'summer',name:'A sunlit path',subtitle:'Beyond the tall grasses',theme:'coast',ready:false,opensAt:'2027-06-01T00:00:00-04:00',zone:'America/Toronto',motif:'sun',levels:0})
 ]);
 const creatures=Object.freeze({snake:'Skeletal serpent',beetle:'Zombie gardener',owl:'Ghost lantern keeper',toad:'Jack-o\u2019-lantern',mimic:'Haunted treat basket',fox:'Roast turkey'});
 const copper=Object.freeze({id:'copper-lantern',name:'Copper Lantern',body:[184,91,49],light:[242,164,89],belly:[255,218,145],spots:[115,45,63],crest:[130,46,67],tail:[149,66,50],dark:[111,48,48],spot:[115,45,63]});
 function release(pack,now=Date.now(),count=pack.levels){
  const date=Date.parse(pack.opensAt),valid=Number.isFinite(date)&&Number.isFinite(now),remaining=valid?Math.max(0,date-now):null;
  const ready=pack.ready===true&&count>0,access=pack.access||'scheduled';
  const open=ready&&(access==='open'||access==='scheduled'&&valid&&remaining===0);
  if(access==='closed')return {open:false,remaining,label:'Closed for now'};
  if(open)return {open:true,remaining:0,label:pack.access==='open'?'Open for exploring':'Open all year'};
  if(remaining===null||remaining===0)return {open:false,remaining,label:'Coming soon'};
  const seconds=Math.ceil(remaining/1000),days=Math.floor(seconds/86400),hours=Math.floor(seconds/3600)%24,minutes=Math.floor(seconds/60)%60,s=seconds%60;
  return {open:false,remaining,label:days+'d '+String(hours).padStart(2,'0')+'h '+String(minutes).padStart(2,'0')+'m '+String(s).padStart(2,'0')+'s'};
 }
 const winterCreatures=Object.freeze({snake:'Candy Cane Serpent',beetle:'Yeti',fox:'Gift Snatcher',spider:'Krampus',toad:'Grouchy Snowman',mimic:'Suspicious Present',owl:'Winter Wisp',sentinel:'Nutcracker Watchman'});
 const winterberry=Object.freeze({id:'winterberry',pack:'winter',name:'Winterberry',body:[149,48,54],light:[232,189,117],belly:[247,231,194],spots:[43,91,71],crest:[37,94,73],tail:[113,36,48],dark:[83,32,46],spot:[43,91,71]});
 const skins=[{...copper,pack:'autumn-hollow'},winterberry];
 const creaturesFor=id=>id==='winter'?winterCreatures:creatures;
 function fresh(){return {version:1,records:{},legacy:{},outfit:null,guide:false,display:true,skin:false};}
 class Progress{
  constructor(storage,levels){this.storage=storage;this.levels=levels;this.persistent=true;this.read();}
  read(){if(this.persistent===false&&this.data)return this.data;let raw;try{raw=JSON.parse(this.storage.getItem(KEY)||'null');}catch(_){raw=null;}this.data=fresh();
   if(!raw||raw.version!==1)return this.data;
   this.data.guide=raw.guide===true;this.data.display=raw.display!==false;
   for(const l of this.levels){const total=l.loot.reduce((n,p)=>n+p[2],0),valid=r=>r&&Number.isFinite(r.bestTime)&&r.bestTime>0&&r.bestTime<=86400&&Number.isInteger(r.treasure)&&r.treasure>=0&&r.treasure<=total;
    const r=raw.records?.[l.id];if(valid(r)&&r.revision===(l.revision||1))this.data.records[l.id]={revision:l.revision||1,bestTime:r.bestTime,treasure:r.treasure};
    // Only the released original Autumn Hollow routes migrate. Their earned
    // keepsakes survive; their times never compete with the new layouts.
    if(l.seasonal==='autumn-hollow'&&l.revision===2)for(const old of [raw.legacy?.[l.id],r])if(valid(old)&&old.revision===1){const previous=this.data.legacy[l.id];this.data.legacy[l.id]={revision:1,bestTime:Math.min(previous?.bestTime??Infinity,old.bestTime),treasure:Math.max(previous?.treasure||0,old.treasure)};}}
   this.data.skin=raw.skin===true&&this.complete();const outfit=skins.find(k=>k.id===raw.outfit&&this.complete(k.pack));this.data.outfit=outfit?.id||(this.data.skin?'copper-lantern':null);return this.data;
  }
  save(){try{const json=JSON.stringify(this.data);this.storage.setItem(KEY,json);this.persistent=this.storage.getItem(KEY)===json;}catch(_){this.persistent=false;}return this.persistent;}
  record(r){const l=this.levels.find(l=>l.id===r.levelId),total=l?.loot.reduce((n,p)=>n+p[2],0);if(!l||r.status!=='won'||r.seasonal!==l.seasonal||r.routeRevision!==(l.revision||1)||!Number.isFinite(r.time)||r.time<=0||r.time>86400||!Number.isInteger(r.treasure)||r.treasure<0||r.treasure>total||r.totalTreasure!==total)return false;
   const old=this.data.records[l.id];this.data.records[l.id]={revision:l.revision||1,bestTime:Math.min(old?.bestTime??Infinity,r.time),treasure:Math.max(old?.treasure||0,r.treasure)};this.save();return true;
  }
  completed(id){return Boolean(this.data.records[id]||this.data.legacy[id]);}
  cleared(pack='autumn-hollow'){return this.levels.filter(l=>l.seasonal===pack&&this.completed(l.id)).length;}
  complete(pack='autumn-hollow'){const ls=this.levels.filter(l=>l.seasonal===pack);return ls.length>0&&ls.every(l=>this.completed(l.id));}
  mastered(pack='autumn-hollow'){return this.complete(pack)&&this.levels.filter(l=>l.seasonal===pack).every(l=>Math.max(this.data.records[l.id]?.treasure||0,this.data.legacy[l.id]?.treasure||0)===l.loot.reduce((n,p)=>n+p[2],0));}
  ownedSkins(){return skins.filter(k=>this.complete(k.pack));}
  activeSkin(){return this.ownedSkins().find(k=>k.id===(this.data.outfit||(this.data.skin?'copper-lantern':null)))||null;}
  wear(id){if(id!==null&&!this.ownedSkins().some(k=>k.id===id))return false;this.data.outfit=id;this.data.skin=id==='copper-lantern';this.save();return true;}
  set(key,value){if(!['guide','display','skin'].includes(key)||typeof value!=='boolean'||key==='skin'&&value&&!this.complete())return false;if(key==='skin')return this.wear(value?'copper-lantern':null);this.data[key]=value;this.save();return true;}
 }
 const api={KEY,packs,creatures,winterCreatures,creaturesFor,copper,winterberry,skins,release,Progress};root.EscapeSeasons=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
