// A safe, continuous overworld. Campaign levels and progression never enter this model.
(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports;
 const World=node?require('./escape-world.js').EscapeWorld:root.EscapeWorld;
 const Motion=node?require('./creature-rig.js').EscapeCreatureMotion:root.EscapeCreatureMotion;
 const Seasons=node?require('./escape-seasons.js'):root.EscapeSeasons;
 const Catalog=node?require('./escape-levels.js').EscapeCatalog:root.EscapeCatalog;
 const AREAS=Object.freeze([
  {id:'autumn-hollow',name:'Autumn Hollow',theme:'autumn',x:20,y:20,rx:12,ry:10,entry:{x:20,y:30},gate:{x:20,y:33,axis:'y'}},
  {id:'winter',name:'A snowy path',theme:'frost',x:55,y:20,rx:12,ry:10,entry:{x:55,y:35},gate:{x:55,y:33,axis:'y'}},
  {id:'spring',name:'A blossom path',theme:'garden',x:55,y:55,rx:12,ry:10,entry:{x:40,y:55},gate:{x:42,y:55,axis:'x'}},
  {id:'summer',name:'A sunlit path',theme:'coast',x:20,y:55,rx:12,ry:10,entry:{x:20,y:40},gate:{x:20,y:42,axis:'y'}}
 ].map(a=>Object.freeze({...a,entry:Object.freeze(a.entry),gate:Object.freeze(a.gate)})));
 const SPOTS=[[-8,3],[-8,-3],[-3,-6],[3,-6],[8,-3],[8,3],[3,7],[-3,7]];
 class EscapeSeasonWorld{
  constructor({levels=Catalog.seasonal,packs=Seasons.packs,now=()=>Date.now(),focusId=null}={}){
   this.width=76;this.height=76;this.elapsed=0;this.accumulator=0;this.terrainVersion=0;this.chapters=AREAS;this.levels=levels;this.packs=packs;this.now=now;
   this.nodes=levels.flatMap((level,index)=>{const chapter=AREAS.findIndex(a=>a.id===level.seasonal),area=AREAS[chapter];if(!area)return [];const i=levels.filter(l=>l.seasonal===area.id).indexOf(level),spot=SPOTS[i];if(!spot)throw Error('Seasonal area supports eight entrances: '+area.id);return [{id:level.id,name:level.name,index:i,chapter,x:area.x+spot[0],y:area.y+spot[1],level}];});
   // These fields let the campaign terrain painter keep scenery clear of paths and entrances.
   this.bonusNodes=[];this.hiddenNodes=[];this.caches=[];this.signs=AREAS.map((a,chapter)=>({...a.gate,chapter}));this.npcs=[{x:20,y:29,chapter:0,kind:'tortoise',name:'Wick'}];this.hunters=[];this.tracks=[];this.gates=AREAS.filter(a=>a.id!=='autumn-hollow').map(a=>({...a.gate,id:a.id}));
   this.grid=Array.from({length:this.height},()=>Array(this.width).fill('#'));
   const room=(x1,y1,x2,y2,t='.')=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(this.grid[y]?.[x])this.grid[y][x]=t;};
   for(const a of AREAS)room(a.x-a.rx,a.y-a.ry,a.x+a.rx,a.y+a.ry);
   room(17,36,57,38);room(36,36,38,57);room(19,29,21,56);room(54,29,56,38);room(36,54,44,56);room(34,34,40,40);
   // Autumn's loop winds round an ancient oak and a mill pond. The other regions are real
   // terrain behind their gates, ready to accept future packs without changing the map.
   room(19,19,21,21,'#');room(25,19,29,22,'P');room(25,19,25,19);room(29,22,29,22);room(53,17,56,18,'P');room(57,54,59,56,'P');room(17,54,20,56,'P');
   const paths=[[{x:20,y:30},{x:20,y:37},{x:37,y:37}],[{x:37,y:37},{x:55,y:37},{x:55,y:30}],[{x:37,y:37},{x:37,y:55},{x:43,y:55}],[{x:20,y:37},{x:20,y:45}]];
   for(const points of paths)this.tracks.push({points:points.map(p=>({x:p.x+.5,y:p.y+.5})),side:false});
   for(const a of AREAS){const ns=this.nodes.filter(n=>AREAS[n.chapter]===a);for(let i=1;i<ns.length;i++){const points=this.route(ns[i],ns[i-1],true);if(points)this.tracks.push({from:ns[i-1].id,to:ns[i].id,points:[{x:ns[i-1].x+.5,y:ns[i-1].y+.5},...points],side:false});}}
   const first=this.nodes.find(n=>n.id===focusId&&this.areaOpen(AREAS[n.chapter].id))||this.nodes.find(n=>this.areaOpen(AREAS[n.chapter].id));
   this.player={x:first?.x??37.5,y:(first?.y??36.5)+1,facing:{x:0,y:-1},moving:false,sprinting:false};this.target=null;this.motion=new Motion(this);this.refreshRegions();
  }
  areaOpen(id){const now=this.now(),stamp=Math.floor(now/1000);if(this.releaseStamp!==stamp){this.releaseStamp=stamp;this.releaseStates=new Map(this.packs.map(p=>[p.id,Seasons.release(p,now,this.levels.filter(l=>l.seasonal===p.id).length).open]));}return this.releaseStates.get(id)===true;}
  refreshRegions(){this.openRegions=AREAS.map(a=>this.areaOpen(a.id));if(this.target&&this.target.some(p=>!this.floor(p.x,p.y)))this.target=null;}
  regionOpen(i){return this.areaOpen(AREAS[i]?.id);}
  chapterAt(p=this.player){return AREAS.reduce((best,a,i)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(AREAS[best].x-p.x,AREAS[best].y-p.y)?i:best,0);}
  areaAt(p=this.player){return AREAS[this.chapterAt(p)];}
  floor(x,y){x=Math.floor(x);y=Math.floor(y);if(!['.','L'].includes(this.grid[y]?.[x]))return false;for(const a of AREAS){if(this.areaOpen(a.id))continue;if(Math.abs(x-a.x)<=a.rx&&Math.abs(y-a.y)<=a.ry)return false;const g=a.gate;if(g.axis==='x'?x===g.x&&Math.abs(y-g.y)<=1:y===g.y&&Math.abs(x-g.x)<=1)return false;}return true;}
  route(to,from=this.player,ignoreLocks=false){return World.prototype.route.call(this,to,from,ignoreLocks);}
  spotFor(id){return this.nodes.find(n=>n.id===id)||null;}
  nearby(){return this.nodes.find(n=>this.areaOpen(n.level.seasonal)&&Math.hypot(n.x-this.player.x,n.y-this.player.y)<=1.6)||null;}
  nearbyGate(){return AREAS.find(a=>!this.areaOpen(a.id)&&Math.hypot(a.entry.x-this.player.x,a.entry.y-this.player.y)<=2.6)||null;}
  enter(){return this.nearby()?.id||null;}
  walkTo(id){const n=this.spotFor(id);if(!n||!this.areaOpen(n.level.seasonal))return false;const route=this.route({x:n.x,y:n.y+1});if(!route)return false;route.push({x:n.x,y:n.y+1});this.target=route;return true;}
  approach(id){const a=AREAS.find(a=>a.id===id);if(!a)return false;const route=this.route(a.entry);if(!route)return false;this.target=route;return true;}
  travel(id){const a=AREAS.find(a=>a.id===id);if(!a||!this.areaOpen(id))return false;const n=this.nodes.find(n=>n.level.seasonal===id);if(!n)return false;this.player.x=n.x;this.player.y=n.y+1;this.player.moving=false;this.target=null;this.accumulator=0;this.motion.resetPlayer(this.player);return true;}
  focus(id){const n=this.spotFor(id);if(!n||!this.areaOpen(n.level.seasonal))return false;this.player.x=n.x;this.player.y=n.y+1;this.player.moving=false;this.target=null;this.accumulator=0;this.motion.resetPlayer(this.player);return true;}
  advance(seconds,input={}){World.prototype.advance.call(this,seconds,input);}
  step(dt,input){
   this.elapsed+=dt;let x=Number(input.x)||0,y=Number(input.y)||0;if(x||y)this.target=null;
   else if(this.target){const p=this.target[0];if(!p){this.target=null;}else{const dx=p.x-this.player.x,dy=p.y-this.player.y,d=Math.hypot(dx,dy);if(d<.03){this.target.shift();if(!this.target.length)this.target=null;}else{x=dx/d;y=dy/d;}}}
   const length=Math.hypot(x,y),speed=(input.sprint?5:3.1)*dt/Math.max(1,length),old={x:this.player.x,y:this.player.y};if(length)this.player.facing=Math.abs(x)>=Math.abs(y)?{x:Math.sign(x),y:0}:{x:0,y:Math.sign(y)};
   const max=this.target?Math.hypot(this.target[0].x-this.player.x,this.target[0].y-this.player.y):Infinity,step=Math.min(speed,max),nx=this.player.x+x*step,ny=this.player.y+y*step;
   const clear=(a,b)=>[-.2,.2].every(dx=>[-.2,.2].every(dy=>this.floor(a+dx,b+dy)));if(clear(nx,this.player.y))this.player.x=nx;if(clear(this.player.x,ny))this.player.y=ny;
   this.player.moving=Math.hypot(old.x-this.player.x,old.y-this.player.y)>1e-6;this.player.sprinting=Boolean(input.sprint&&this.player.moving);this.motion.update(dt,this);
  }
 }
 EscapeSeasonWorld.areas=AREAS;root.EscapeSeasonWorld=EscapeSeasonWorld;if(node)module.exports={EscapeSeasonWorld};
})(typeof globalThis!=='undefined'?globalThis:this);
