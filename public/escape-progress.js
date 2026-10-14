(function(root){
  const catalog=typeof module!=='undefined'&&module.exports?require('./escape-levels.js').EscapeCatalog:root.EscapeCatalog;
  const KEY='sallys-escape-progress-v1',validTime=n=>Number.isFinite(n)&&n>0&&n<1000000;
  class EscapeProgress{
    constructor(storage){this.storage=storage;this.data={version:1,view:'follow',levels:{},challenges:{},caches:[],goldflies:0,regionsSeen:[]};this.persistent=Boolean(storage);this.read();}
    read(){
      let raw,value;
      try{raw=this.storage?.getItem(KEY);this.persistent=Boolean(this.storage);}catch(_){this.persistent=false;return;}
      try{value=JSON.parse(raw||'null');}catch(_){return;}
      if(!value||value.version!==1)return;
      if(['follow','overview'].includes(value.view))this.data.view=value.view;
      // World caches are only ever added; a stale tab cannot forget one.
      if(Number.isInteger(value.goldflies)&&value.goldflies>this.data.goldflies)this.data.goldflies=Math.min(value.goldflies,100000);
      if(Array.isArray(value.regionsSeen))for(const i of value.regionsSeen)if(Number.isInteger(i)&&i>=0&&i<64&&!this.data.regionsSeen.includes(i))this.data.regionsSeen.push(i);
      if(Array.isArray(value.caches))for(const id of value.caches)if(typeof id==='string'&&/^[a-z]+-(north|south)$/.test(id)&&!this.data.caches.includes(id))this.data.caches.push(id);
      for(const [kind,entries] of [['levels',catalog.levels],['challenges',catalog.challenges]])for(const item of entries){
        const saved=value[kind]?.[item.id];
        if(!saved||saved.cleared!==true||!validTime(saved.bestTime))continue;
        if(kind==='levels'&&(!Number.isInteger(saved.stars)||saved.stars<1||saved.stars>3||!Number.isInteger(saved.treasure)||saved.treasure<0||saved.treasure>item.loot.reduce((n,l)=>n+l[2],0)))continue;
        const expected=kind==='levels'?item.revision||1:catalog.levels.find(l=>l.id===item.levelId)?.revision||1;
        if((saved.revision||1)!==expected)continue;
        const old=this.data[kind][item.id],revision=Number.isInteger(saved.revision)&&saved.revision>0?saved.revision:1;
        if(old&&(old.revision||1)>revision)continue;
        const compatible=old&&(old.revision||1)===revision;
        this.data[kind][item.id]={cleared:true,bestTime:Math.min(compatible?old.bestTime||Infinity:Infinity,saved.bestTime),revision,...(kind==='levels'?{stars:Math.max(compatible?old.stars||0:0,saved.stars),treasure:Math.max(compatible?old.treasure||0:0,saved.treasure)}:{})};
      }
    }
    unlocked(id){const index=catalog.levels.findIndex(l=>l.id===id);if(index<0)return false;const prerequisite=catalog.levels[index].unlockAfter||catalog.levels[index-1]?.id;return index===0||index===1||Boolean(this.data.levels[id]?.cleared)||(catalog.levels[index].unlockAny?catalog.levels[index].unlockAny.some(id=>this.data.levels[id]?.cleared):Boolean(prerequisite&&this.data.levels[prerequisite]?.cleared));}
    challengeUnlocked(id){const c=catalog.challenges.find(c=>c.id===id);return Boolean(c&&this.data.levels[c.levelId]?.cleared);}
    setView(view){if(!['follow','overview'].includes(view))return false;this.read();this.data.view=view;this.write();return true;}
    catchGoldfly(){this.read();this.data.goldflies=Math.min(this.data.goldflies+1,100000);this.write();return this.data.goldflies;}
    // Returns the regions that are open now but were never announced before.
    announceRegions(open){this.read();const fresh=open.filter(i=>!this.data.regionsSeen.includes(i));if(fresh.length){this.data.regionsSeen.push(...fresh);this.write();}return fresh;}
    findCache(id){if(typeof id!=='string'||!/^[a-z]+-(north|south)$/.test(id))return false;this.read();if(this.data.caches.includes(id))return false;this.data.caches.push(id);this.write();return true;}
    // Lifetime totals for the world map: best stars and treasure per route, challenges and caches.
    totals(cacheValue=0){
      const levels=catalog.levels.map(l=>({level:l,saved:this.data.levels[l.id]}));
      return {stars:levels.reduce((n,{saved})=>n+(saved?.stars||0),0),maxStars:levels.length*3,
        treasure:levels.reduce((n,{saved})=>n+(saved?.treasure||0),0)+this.data.caches.length*cacheValue+this.data.goldflies*2,goldflies:this.data.goldflies,
        maxTreasure:levels.reduce((n,{level})=>n+level.loot.reduce((t,l)=>t+l[2],0),0),
        cleared:levels.filter(({saved})=>saved?.cleared).length,levels:levels.length,
        challenges:catalog.challenges.filter(c=>this.data.challenges[c.id]?.cleared).length,maxChallenges:catalog.challenges.length,caches:this.data.caches.length};
    }
    write(){try{this.storage?.setItem(KEY,JSON.stringify(this.data));this.persistent=Boolean(this.storage);}catch(_){this.persistent=false;}}
    record(result){
      if(result?.status!=='won'||!validTime(result.time))return false;
      this.read();
      const level=catalog.levels.find(l=>l.id===result.levelId);if(!level)return false;
      const revision=level.revision||1;if(result.routeRevision&&result.routeRevision!==revision)return false;
      const total=level.loot.reduce((n,item)=>n+item[2],0);
      if(result.totalTreasure!==total||!Number.isInteger(result.treasure)||result.treasure<0||result.treasure>total)return false;
      if(result.challengeId){
        const challenge=catalog.challenges.find(c=>c.id===result.challengeId&&c.levelId===level.id);if(!challenge||!this.challengeUnlocked(challenge.id))return false;
        const old=this.data.challenges[challenge.id];if(old&&(old.revision||1)>revision)return false;
        this.data.challenges[challenge.id]={cleared:true,revision,bestTime:Math.min(old&&(old.revision||1)===revision?old.bestTime:Infinity,result.time)};
      }else{
        if(!this.unlocked(level.id)||!Number.isInteger(result.stars)||result.stars<1||result.stars>3||!Number.isInteger(result.treasure)||result.treasure<0||result.treasure>result.totalTreasure)return false;
        const old=this.data.levels[level.id];if(old&&(old.revision||1)>revision)return false;
        const compatible=old&&(old.revision||1)===revision;
        this.data.levels[level.id]={cleared:true,revision,stars:Math.max(compatible?old.stars||0:0,result.stars),treasure:Math.max(compatible?old.treasure||0:0,result.treasure),bestTime:Math.min(compatible?old.bestTime||Infinity:Infinity,result.time)};
      }
      this.write();
      return true;
    }
  }
  root.EscapeProgress=EscapeProgress;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeProgress};
})(typeof globalThis!=='undefined'?globalThis:this);
