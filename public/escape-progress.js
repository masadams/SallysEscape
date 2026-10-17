(function(root){
  const catalog=typeof module!=='undefined'&&module.exports?require('./escape-levels.js').EscapeCatalog:root.EscapeCatalog;
  const KEY='sallys-escape-progress-v1',validTime=n=>Number.isFinite(n)&&n>0&&n<1000000;
  // What opens each secret spot on the map (see EscapeWorld secrets for where they are). None of
  // them shows itself until the Gilded Burrow is found; Sally's Burrow is the end of the story, not a secret.
  const SECRET_RULES={
    'star-garden':{name:'the Star Garden',stars:100},
    'cloud-nest':{name:'the Cloud Nest',flies:25},
    'mossy-well':{name:'the Mossy Well',bump:true,clue:'This bit of hedge looks thin and cracked…'},
    'moss-den':{name:'Old Moss\u2019s Den',items:['spectacles','pocket-watch','scarf'],clue:'Old Moss\u2019s den, locked tight. He lost his spectacles, pocket watch and scarf somewhere on the trail.'},
    'fairy-ring':{name:'the Fairy Ring',cache:15,clue:'Three caps glow around the ring, one after another. Lick them in that order.'},
    'struck-oak':{name:'the Struck Oak',cache:15,clue:'Something glints in the old oak, but only when lightning strikes.'},
    'challenge-shrine':{name:'the Challenge Shrine',challenges:20},
    'bestiary-grove':{name:'the Bestiary Grove',bestiary:true},
    'ice-cave':{name:'the Ice Cave',caches:['frost-north','frost-south'],clue:'Cold air seeps through the rock. Find both treasure caches in Frost Hollow to open the Ice Cave.'},
    'sunken-wreck':{name:'the Sunken Wreck',mastered:'tide',clue:'A mast pokes through the reeds. Earn every star in the Tide Pools to reach the Sunken Wreck.'},
    'sallys-burrow':{name:'Sally\u2019s Burrow',story:true,cleared:'home',clue:'Home is just through here. Reach it the long way: clear escape 100.'}
  };
  class EscapeProgress{
    constructor(storage){this.storage=storage;this.data={version:1,view:'follow',levels:{},challenges:{},caches:[],goldflies:0,regionsSeen:[],challengesSeen:[],attempts:{},masterySeen:[],skin:'classic',whisper:false,hidden:{},met:[],secrets:[],items:[],story:[]};this.lastPerfect=false;this.lastFirstTry=false;this.persistent=Boolean(storage);this.read();}
    read(){
      let raw,value;
      try{raw=this.storage?.getItem(KEY);this.persistent=Boolean(this.storage);}catch(_){this.persistent=false;return;}
      try{value=JSON.parse(raw||'null');}catch(_){return;}
      if(!value||value.version!==1)return;
      if(['follow','overview'].includes(value.view))this.data.view=value.view;
      // World caches are only ever added; a stale tab cannot forget one.
      // Failed or abandoned attempts per route; any earlier attempt rules out a first-try bonus.
      for(const level of catalog.levels){const n=value.attempts?.[level.id];if(Number.isInteger(n)&&n>0&&n>(this.data.attempts[level.id]||0))this.data.attempts[level.id]=Math.min(n,100000);}
      if(Number.isInteger(value.goldflies)&&value.goldflies>this.data.goldflies)this.data.goldflies=Math.min(value.goldflies,100000);
      if(Array.isArray(value.regionsSeen))for(const i of value.regionsSeen)if(Number.isInteger(i)&&i>=0&&i<64&&!this.data.regionsSeen.includes(i))this.data.regionsSeen.push(i);
      if(Array.isArray(value.challengesSeen))for(const id of value.challengesSeen)if(catalog.challenges.some(c=>c.id===id)&&!this.data.challengesSeen.includes(id))this.data.challengesSeen.push(id);
      if(Array.isArray(value.masterySeen))for(const t of value.masterySeen)if(typeof t==='string'&&/^[a-z]+$/.test(t)&&!this.data.masterySeen.includes(t))this.data.masterySeen.push(t);
      if(typeof value.skin==='string'&&/^[a-z]+$/.test(value.skin))this.data.skin=value.skin;
      if(value.whisper===true)this.data.whisper=true;
      if(Array.isArray(value.secrets))for(const id of value.secrets)if((SECRET_RULES[id]?.bump||SECRET_RULES[id]?.cache||id==='moss-den')&&!this.data.secrets.includes(id))this.data.secrets.push(id);
      if(Array.isArray(value.items))for(const id of value.items)if(SECRET_RULES['moss-den'].items.includes(id)&&!this.data.items.includes(id))this.data.items.push(id);
      if(Array.isArray(value.story))for(const id of value.story)if(typeof id==='string'&&/^[a-z0-9:-]{1,40}$/.test(id)&&!this.data.story.includes(id)&&this.data.story.length<80)this.data.story.push(id);
      if(Array.isArray(value.met))for(const k of value.met)if(typeof k==='string'&&/^[a-z-]{2,20}$/.test(k)&&!this.data.met.includes(k)&&this.data.met.length<64)this.data.met.push(k);
      for(const level of catalog.hidden||[]){const saved=value.hidden?.[level.id],old=this.data.hidden[level.id];if(!saved||saved.cleared!==true||!validTime(saved.bestTime)||!Number.isInteger(saved.stars)||saved.stars<1||saved.stars>3)continue;
        this.data.hidden[level.id]={cleared:true,bestTime:Math.min(old?.bestTime||Infinity,saved.bestTime),stars:Math.max(old?.stars||0,saved.stars)};}
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
        this.data[kind][item.id]={cleared:true,bestTime:Math.min(compatible?old.bestTime||Infinity:Infinity,saved.bestTime),revision,...(kind==='levels'?{stars:Math.max(compatible?old.stars||0:0,saved.stars),treasure:Math.max(compatible?old.treasure||0:0,saved.treasure),...((saved.firstTry===true||compatible&&old.firstTry)?{firstTry:true}:{}),...((saved.perfect===true&&saved.firstTry===true||compatible&&old.perfect)?{perfect:true}:{})}:{})};
      }
    }
    challengesCleared(){return catalog.challenges.filter(c=>this.data.challenges[c.id]?.cleared).length;}
    // Test mode (unlockAll) opens every escape and challenge without touching saved records.
    unlocked(id){const index=catalog.levels.findIndex(l=>l.id===id);if(index<0)return false;if(this.unlockAll)return true;
      // Some branches also wait for a number of completed challenges.
      if(catalog.levels[index].unlockChallenges&&!this.data.levels[id]?.cleared&&this.challengesCleared()<catalog.levels[index].unlockChallenges)return false;const prerequisite=catalog.levels[index].unlockAfter||catalog.levels[index-1]?.id;return index===0||index===1||Boolean(this.data.levels[id]?.cleared)||(catalog.levels[index].unlockAny?catalog.levels[index].unlockAny.some(id=>this.data.levels[id]?.cleared):Boolean(prerequisite&&this.data.levels[prerequisite]?.cleared));}
    // A challenge opens once its escape is cleared and its area has enough stars.
    challengeGate(id){const c=catalog.challenges.find(c=>c.id===id);if(!c)return null;const gate=c.starGate||{from:0,to:0,stars:0};
      const stars=catalog.levels.slice(gate.from,gate.to).reduce((n,l)=>n+(this.data.levels[l.id]?.stars||0),0);
      return {cleared:Boolean(this.data.levels[c.levelId]?.cleared),stars,need:gate.stars,open:Boolean(this.unlockAll)||Boolean(this.data.levels[c.levelId]?.cleared)&&stars>=gate.stars};}
    challengeUnlocked(id){return Boolean(this.challengeGate(id)?.open);}
    // Challenges that are open but have never been announced; announcing marks them seen.
    announceChallenges(){this.read();const fresh=catalog.challenges.filter(c=>this.challengeUnlocked(c.id)&&!this.data.challengesSeen.includes(c.id)&&!this.data.challenges[c.id]?.cleared);if(fresh.length){this.data.challengesSeen.push(...fresh.map(c=>c.id));this.write();}return fresh;}
    // An area is mastered when every escape in it has all three stars. Each mastered area
    // gives Sally its colours to wear.
    mastered(chapter){return chapter.end>chapter.start&&catalog.levels.slice(chapter.start,chapter.end).every(l=>this.data.levels[l.id]?.stars===3);}
    areaStars(chapter){const levels=catalog.levels.slice(chapter.start,chapter.end);return {stars:levels.reduce((n,l)=>n+(this.data.levels[l.id]?.stars||0),0),max:levels.length*3};}
    skins(chapters){return ['classic',...chapters.filter(c=>this.mastered(c)).map(c=>c.theme),...(this.data.secrets.includes('moss-den')?['moss']:[])];}
    skin(chapters){const owned=this.skins(chapters);return owned.includes(this.data.skin)?this.data.skin:'classic';}
    setSkin(theme,chapters){if(!this.skins(chapters).includes(theme))return false;this.read();this.data.skin=theme;this.write();return true;}
    // Mastered areas never announced before; announcing marks them seen.
    announceMastery(chapters){this.read();const fresh=chapters.filter(c=>this.mastered(c)&&!this.data.masterySeen.includes(c.theme));if(fresh.length){this.data.masterySeen.push(...fresh.map(c=>c.theme));this.write();}return fresh;}
    // Areas holding at least one perfect escape. Five of them open something; nothing says so,
    // except one quiet line after the very first perfect escape.
    perfectAreas(chapters){return chapters.filter(c=>catalog.levels.slice(c.start,c.end).some(l=>this.data.levels[l.id]?.perfect)).length;}
    hiddenOpen(chapters){return Boolean(this.unlockAll)||this.perfectAreas(chapters)>=5;}
    // A bonus escape opens once every escape in the areas before it has all three stars.
    bonusOpen(id,chapters){const level=(catalog.hidden||[]).find(l=>l.id===id);return Boolean(level?.bonus)&&(Boolean(this.unlockAll)||chapters.slice(0,level.bonus.areas).every(c=>this.mastered(c)));}
    hiddenLevelOpen(id,chapters){const level=(catalog.hidden||[]).find(l=>l.id===id);if(level?.secret)return this.secretLevelOpen(level,chapters);return level?.bonus?this.bonusOpen(id,chapters):this.hiddenOpen(chapters);}
    // Secret spots on the map open on deeds, not on the trail: stars, golden flies, challenges,
    // creatures met, caches found, or a cracked hedge Sally simply walks into. Each reports how far along it is.
    stars(){return catalog.levels.reduce((n,l)=>n+(this.data.levels[l.id]?.stars||0),0);}
    creatureKinds(){const kinds=new Set();for(const l of catalog.levels){for(const g of l.guards||[])kinds.add(g.kind||'snake');if(l.hawk)kinds.add('hawk');if(l.antTrails?.length)kinds.add('ants');}return [...kinds];}
    // The secret world shows itself once the Gilded Burrow is found.
    secretsRevealed(chapters=[]){return Boolean(this.unlockAll)||this.hiddenOpen(chapters);}
    secret(id,chapters=[]){
      const rule=SECRET_RULES[id];if(!rule)return null;const all=Boolean(this.unlockAll);
      if(!rule.story&&!this.secretsRevealed(chapters))return {open:false,have:0,need:1,hint:null,hidden:true};
      if(rule.items){const n=rule.items.filter(i=>this.data.items.includes(i)).length;return {open:all||n>=rule.items.length,have:n,need:rule.items.length,hint:rule.clue};}
      if(rule.cache){const found=this.data.secrets.includes(id);return {open:found,have:found?1:0,need:1,hint:rule.clue,cache:rule.cache};}
      if(rule.stars)return {open:all||this.stars()>=rule.stars,have:this.stars(),need:rule.stars,hint:'Earn '+rule.stars+' stars to open '+rule.name+'.'};
      if(rule.flies)return {open:all||this.data.goldflies>=rule.flies,have:this.data.goldflies,need:rule.flies,hint:'Catch '+rule.flies+' golden flies to open '+rule.name+'.'};
      if(rule.challenges){const n=this.challengesCleared();return {open:all||n>=rule.challenges,have:n,need:rule.challenges,hint:'Beat '+rule.challenges+' challenges to open '+rule.name+'.'};}
      if(rule.bestiary){const kinds=this.creatureKinds(),n=kinds.filter(k=>this.data.met.includes(k)).length;return {open:all||n>=kinds.length,have:n,need:kinds.length,hint:'Meet every creature in the bestiary to open '+rule.name+'.'};}
      if(rule.caches){const n=rule.caches.filter(c=>this.data.caches.includes(c)).length;return {open:all||n>=rule.caches.length,have:n,need:rule.caches.length,hint:rule.clue};}
      if(rule.mastered){const c=chapters.find(c=>c.theme===rule.mastered),open=all||Boolean(c&&this.mastered(c));return {open,have:open?1:0,need:1,hint:rule.clue};}
      if(rule.cleared){const open=all||Boolean(this.data.levels[rule.cleared]?.cleared);return {open,have:open?1:0,need:1,hint:rule.clue};}
      if(rule.bump){const open=all||this.data.secrets.includes(id);return {open,have:open?1:0,need:1,hint:rule.clue,bump:true};}
      return {open:all,have:0,need:1,hint:rule.clue};
    }
    secretOpen(id,chapters){return Boolean(this.secret(id,chapters)?.open);}
    // A cracked hedge gives way when Sally pushes into it, and stays open.
    // Old Moss's lost things, picked up on the world map; a secret cache found; his den visited.
    findItem(id){if(!SECRET_RULES['moss-den'].items.includes(id))return false;this.read();if(this.data.items.includes(id))return false;this.data.items.push(id);this.write();return true;}
    findSecretCache(id){if(!SECRET_RULES[id]?.cache)return false;this.read();if(this.data.secrets.includes(id))return false;this.data.secrets.push(id);this.write();return true;}
    visitMossDen(){this.read();if(this.data.secrets.includes('moss-den'))return false;this.data.secrets.push('moss-den');this.write();return true;}
    openSecret(id){if(!SECRET_RULES[id]?.bump)return false;this.read();if(this.data.secrets.includes(id))return false;this.data.secrets.push(id);this.write();return true;}
    // An escape inside a secret spot opens with the spot, unless it asks for more stars of its own.
    secretLevelOpen(level,chapters){return this.secretOpen(level.secret,chapters)&&(Boolean(this.unlockAll)||!level.stars||this.stars()>=level.stars);}
    whisper(){this.read();if(this.data.whisper||!catalog.levels.some(l=>this.data.levels[l.id]?.perfect))return false;this.data.whisper=true;this.write();return true;}
    setView(view){if(!['follow','overview'].includes(view))return false;this.read();this.data.view=view;this.write();return true;}
    // Creatures met for the bestiary; returns the ones met for the first time.
    meet(kinds){this.read();const fresh=[...new Set(kinds)].filter(k=>typeof k==='string'&&/^[a-z-]{2,20}$/.test(k)&&!this.data.met.includes(k));if(fresh.length){this.data.met.push(...fresh.slice(0,64-this.data.met.length));this.write();}return fresh;}
    catchGoldfly(){this.read();this.data.goldflies=Math.min(this.data.goldflies+1,100000);this.write();return this.data.goldflies;}
    // Returns the regions that are open now but were never announced before.
    // Story cards read so far, in the order they were found.
    storySeen(id){return this.data.story.includes(id);}
    markStory(id){this.read();if(this.data.story.includes(id))return false;this.data.story.push(id);this.write();return true;}
    announceRegions(open){this.read();const fresh=open.filter(i=>!this.data.regionsSeen.includes(i));if(fresh.length){this.data.regionsSeen.push(...fresh);this.write();}return fresh;}
    findCache(id){if(typeof id!=='string'||!/^[a-z]+-(north|south)$/.test(id))return false;this.read();if(this.data.caches.includes(id))return false;this.data.caches.push(id);this.write();return true;}
    // Lifetime totals for the world map: best stars and treasure per route, challenges and caches.
    totals(cacheValue=0){
      const levels=catalog.levels.map(l=>({level:l,saved:this.data.levels[l.id]}));
      return {stars:levels.reduce((n,{saved})=>n+(saved?.stars||0),0),maxStars:levels.length*3,
        treasure:levels.reduce((n,{saved})=>n+(saved?.treasure||0),0)+this.data.caches.length*cacheValue+this.data.goldflies*2+this.data.secrets.reduce((n,id)=>n+(SECRET_RULES[id]?.cache||0),0),goldflies:this.data.goldflies,
        maxTreasure:levels.reduce((n,{level})=>n+level.loot.reduce((t,l)=>t+l[2],0),0),
        cleared:levels.filter(({saved})=>saved?.cleared).length,levels:levels.length,
        firstTries:levels.filter(({saved})=>saved?.firstTry).length,perfect:levels.filter(({saved})=>saved?.perfect).length,
        challenges:catalog.challenges.filter(c=>this.data.challenges[c.id]?.cleared).length,maxChallenges:catalog.challenges.length,caches:this.data.caches.length,mastered:this.data.masterySeen.length};
    }
    write(){try{this.storage?.setItem(KEY,JSON.stringify(this.data));this.persistent=Boolean(this.storage);}catch(_){this.persistent=false;}}
    // A run that ends without escaping, or is abandoned part-way, uses up the first try.
    attempt(levelId){if(!catalog.levels.some(l=>l.id===levelId))return false;this.read();this.data.attempts[levelId]=(this.data.attempts[levelId]||0)+1;this.write();return true;}
    record(result){
      this.lastFirstTry=false;this.lastPerfect=false;
      // Workshop drafts are for testing: they never count.
      if(result?.draft)return false;
      if(result&&!result.challengeId&&['caught','failed'].includes(result.status))this.attempt(result.levelId);
      if(result?.hidden){
        const level=(catalog.hidden||[]).find(l=>l.id===result.levelId);if(!level||result.status!=='won'||!validTime(result.time)||!Number.isInteger(result.stars)||result.stars<1||result.stars>3)return false;
        this.read();const old=this.data.hidden[level.id];this.data.hidden[level.id]={cleared:true,bestTime:Math.min(old?.bestTime||Infinity,result.time),stars:Math.max(old?.stars||0,result.stars)};this.write();return true;
      }
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
        const firstTry=!old&&!(this.data.attempts[level.id]>0);this.lastFirstTry=firstTry;
        // A perfect escape: the very first attempt, all three stars and every treasure.
        const perfect=firstTry&&result.stars===3&&result.treasure===total;this.lastPerfect=perfect;
        this.data.levels[level.id]={cleared:true,revision,stars:Math.max(compatible?old.stars||0:0,result.stars),treasure:Math.max(compatible?old.treasure||0:0,result.treasure),bestTime:Math.min(compatible?old.bestTime||Infinity:Infinity,result.time),...((firstTry||compatible&&old.firstTry)?{firstTry:true}:{}),...((perfect||compatible&&old.perfect)?{perfect:true}:{})};
      }
      this.write();
      return true;
    }
  }
  EscapeProgress.SECRET_RULES=SECRET_RULES;
  root.EscapeProgress=EscapeProgress;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeProgress};
})(typeof globalThis!=='undefined'?globalThis:this);
