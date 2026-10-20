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
  {id:'winter',name:'Winterlight Hollow',theme:'frost',x:55,y:20,rx:12,ry:10,entry:{x:55,y:35},gate:{x:55,y:33,axis:'y'}},
  {id:'spring',name:'A blossom path',theme:'garden',x:55,y:55,rx:12,ry:10,entry:{x:40,y:55},gate:{x:42,y:55,axis:'x'}},
  {id:'summer',name:'A sunlit path',theme:'coast',x:20,y:55,rx:12,ry:10,entry:{x:20,y:40},gate:{x:20,y:42,axis:'y'}}
 ].map(a=>Object.freeze({...a,entry:Object.freeze(a.entry),gate:Object.freeze(a.gate)})));
 const Ice=node?require('./escape-ice.js'):root.EscapeIce;
 const SPOTS=[[-8,3],[-8,-3],[-3,-6],[3,-6],[8,-3],[8,3],[3,7],[-3,7]];
 class EscapeSeasonWorld{
  constructor({levels=Catalog.seasonal,packs=Seasons.packs,now=()=>Date.now(),focusId=null}={}){
   this.width=76;this.height=76;this.elapsed=0;this.accumulator=0;this.terrainVersion=0;this.chapters=AREAS;this.levels=levels;this.packs=packs;this.now=now;
   this.nodes=levels.flatMap((level,index)=>{const chapter=AREAS.findIndex(a=>a.id===level.seasonal),area=AREAS[chapter];if(!area)return [];const i=levels.filter(l=>l.seasonal===area.id).indexOf(level),spot=SPOTS[i];if(!spot)throw Error('Seasonal area supports eight entrances: '+area.id);return [{id:level.id,name:level.name,index:i,chapter,x:area.x+spot[0],y:area.y+spot[1],level}];});
   // These fields let the campaign terrain painter keep scenery clear of paths and entrances.
   this.bonusNodes=[];this.hiddenNodes=[];this.caches=[];this.signs=AREAS.map((a,chapter)=>({...a.gate,chapter}));this.npcs=[{x:20,y:29,chapter:0,kind:'tortoise',name:'Wick'}];this.hunters=[];this.tracks=[];this.npcs.push({x:55,y:29,chapter:1,kind:'tortoise',name:'Pip'});this.slippery=new Set();this.slideVelocity={x:0,y:0};this.sled={at:{x:64.5,y:28.5},riding:false};this.currents=[{x1:53,y1:24,x2:55,y2:25,dir:[0,1],speed:.85,surface:'ground'}];this.gates=AREAS.filter(a=>a.id!=='autumn-hollow').map(a=>({...a.gate,id:a.id}));
   this.grid=Array.from({length:this.height},()=>Array(this.width).fill('#'));
   const room=(x1,y1,x2,y2,t='.')=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(this.grid[y]?.[x])this.grid[y][x]=t;};
   for(const a of AREAS)room(a.x-a.rx,a.y-a.ry,a.x+a.rx,a.y+a.ry);
   room(17,36,57,38);room(36,36,38,57);room(19,29,21,56);room(54,29,56,38);room(36,54,44,56);room(34,34,40,40);
   // Autumn's loop winds round an ancient oak and a mill pond. The other regions are real
   // terrain behind their gates, ready to accept future packs without changing the map.
   room(19,19,21,21,'#');room(25,19,29,22,'P');room(25,19,25,19);room(29,22,29,22);room(53,17,56,18);for(const [a,b,c,d]of [[53,17,56,18],[50,24,57,26]])for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)this.slippery.add(x+','+y);room(54,19,56,21,'#');room(45,11,48,12,'#');room(61,11,64,12,'#');room(65,18,66,20,'#');room(57,54,59,56,'P');room(17,54,20,56,'P');
   const paths=[[{x:20,y:30},{x:20,y:37},{x:37,y:37}],[{x:37,y:37},{x:55,y:37},{x:55,y:30}],[{x:37,y:37},{x:37,y:55},{x:43,y:55}],[{x:20,y:37},{x:20,y:45}]];
   for(const points of paths)this.tracks.push({points:points.map(p=>({x:p.x+.5,y:p.y+.5})),side:false});
   for(const a of AREAS){const ns=this.nodes.filter(n=>AREAS[n.chapter]===a);for(let i=1;i<ns.length;i++){const points=this.route(ns[i],ns[i-1],true);if(points)this.tracks.push({from:ns[i-1].id,to:ns[i].id,points:[{x:ns[i-1].x+.5,y:ns[i-1].y+.5},...points],side:false});}}
   const first=this.nodes.find(n=>n.id===focusId&&this.areaOpen(AREAS[n.chapter].id))||this.nodes.find(n=>this.areaOpen(AREAS[n.chapter].id));
   this.player={x:first?.x??37.5,y:(first?.y??36.5)+1,facing:{x:0,y:-1},moving:false,sprinting:false};this.target=null;this.motion=new Motion(this);this.refreshRegions();
  }
  areaOpen(id){const now=this.now(),stamp=Math.floor(now/1000);if(this.releaseStamp!==stamp){this.releaseStamp=stamp;this.releaseStates=new Map(this.packs.map(p=>[p.id,Seasons.release(p,now,this.levels.filter(l=>l.seasonal===p.id).length).open]));}return this.releaseStates.get(id)===true;}
  refreshRegions(){this.openRegions=AREAS.map(a=>this.areaOpen(a.id));for(const a of AREAS)if(!this.areaOpen(a.id)&&Math.abs(this.player.x-a.x)<=a.rx+.4&&Math.abs(this.player.y-a.y)<=a.ry+.4){this.player.x=a.entry.x;this.player.y=a.entry.y;this.target=null;this.stopSled();this.motion.resetPlayer(this.player);}if(this.target&&this.target.some(p=>!this.floor(p.x,p.y)))this.target=null;}
  regionOpen(i){return this.areaOpen(AREAS[i]?.id);}
  chapterAt(p=this.player){return AREAS.reduce((best,a,i)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(AREAS[best].x-p.x,AREAS[best].y-p.y)?i:best,0);}
  areaAt(p=this.player){return AREAS[this.chapterAt(p)];}
  floor(x,y){x=Math.floor(x);y=Math.floor(y);if(!['.','L'].includes(this.grid[y]?.[x]))return false;for(const a of AREAS){if(this.areaOpen(a.id))continue;if(Math.abs(x-a.x)<=a.rx&&Math.abs(y-a.y)<=a.ry)return false;const g=a.gate;if(g.axis==='x'?x===g.x&&Math.abs(y-g.y)<=1:y===g.y&&Math.abs(x-g.x)<=1)return false;}return true;}
  route(to,from=this.player,ignoreLocks=false){return World.prototype.route.call(this,to,from,ignoreLocks);}
  spotFor(id){return this.nodes.find(n=>n.id===id)||null;}
  nearby(){return this.nodes.find(n=>this.areaOpen(n.level.seasonal)&&Math.hypot(n.x-this.player.x,n.y-this.player.y)<=1.6)||null;}
  nearbyGate(){return AREAS.find(a=>!this.areaOpen(a.id)&&Math.hypot(a.entry.x-this.player.x,a.entry.y-this.player.y)<=2.6)||null;}
  nearSled(){return this.areaOpen('winter')&&Math.hypot(this.player.x-this.sled.at.x,this.player.y-this.sled.at.y)<1.7;}
  stopSled(){this.sled.riding=false;this.slideVelocity.x=0;this.slideVelocity.y=0;}
  toggleSled(){if(this.sled.riding){this.sled.at={x:this.player.x,y:this.player.y};this.stopSled();return true;}if(!this.nearSled())return false;this.sled.riding=true;this.target=null;return true;}
  visitSled(){if(this.sled.riding||this.nearSled())return this.toggleSled();const path=this.route(this.sled.at);if(!path)return false;this.target=path;return true;}
  enter(){return this.nearby()?.id||null;}
  walkTo(id){this.stopSled();const n=this.spotFor(id);if(!n||!this.areaOpen(n.level.seasonal))return false;const route=this.route({x:n.x,y:n.y+1});if(!route)return false;route.push({x:n.x,y:n.y+1});this.target=route;return true;}
  approach(id){this.stopSled();const a=AREAS.find(a=>a.id===id);if(!a)return false;const route=this.route(a.entry);if(!route)return false;this.target=route;return true;}
  travel(id){this.stopSled();const a=AREAS.find(a=>a.id===id);if(!a||!this.areaOpen(id))return false;const n=this.nodes.find(n=>n.level.seasonal===id);if(!n)return false;this.player.x=n.x;this.player.y=n.y+1;this.player.moving=false;this.target=null;this.accumulator=0;this.motion.resetPlayer(this.player);return true;}
  focus(id){this.stopSled();const n=this.spotFor(id);if(!n||!this.areaOpen(n.level.seasonal))return false;this.player.x=n.x;this.player.y=n.y+1;this.player.moving=false;this.target=null;this.accumulator=0;this.motion.resetPlayer(this.player);return true;}
  advance(seconds,input={}){World.prototype.advance.call(this,seconds,input);}
  step(dt,input){
   this.refreshRegions();this.elapsed+=dt;let x=Number(input.x)||0,y=Number(input.y)||0;if(x||y)this.target=null;
   else if(this.target){const p=this.target[0];if(!p){this.target=null;}else{const dx=p.x-this.player.x,dy=p.y-this.player.y,d=Math.hypot(dx,dy);if(d<.03){this.target.shift();if(!this.target.length)this.target=null;}else{x=dx/d;y=dy/d;}}}
   const length=Math.hypot(x,y),speed=(input.sprint?5:3.1)*dt/Math.max(1,length),old={x:this.player.x,y:this.player.y};if(length)this.player.facing=Math.abs(x)>=Math.abs(y)?{x:Math.sign(x),y:0}:{x:0,y:Math.sign(y)};
   const max=this.target?Math.hypot(this.target[0].x-this.player.x,this.target[0].y-this.player.y):Infinity,step=Math.min(speed,max),onIce=this.slippery.has(Math.floor(this.player.x)+','+Math.floor(this.player.y)),skating=this.sled.riding||onIce||Math.hypot(this.slideVelocity.x,this.slideVelocity.y)>.018;
   const flow=!this.sled.riding&&Ice.currentAt(this.currents,this.player),fx=flow?flow.dir[0]*flow.speed:0,fy=flow?flow.dir[1]*flow.speed:0;const pace=this.sled.riding?4.5:input.sprint?5:3.1;
   const q=skating?Ice.steer(this.slideVelocity,{x:x*Math.min(1,max/.6)-(this.target?fx/pace:0),y:y*Math.min(1,max/.6)-(this.target?fy/pace:0)},this.sled.riding?4.5:input.sprint?5:3.1,dt,{ice:this.sled.riding||onIce,brake:!!input.crawl||!!this.target&&max<.8}):{x:x*step,y:y*step};
   let nx=this.player.x+q.x+fx*dt,ny=this.player.y+q.y+fy*dt;if(this.sled.riding){nx=Math.max(59.3,Math.min(66.7,nx));ny=Math.max(24.3,Math.min(29.7,ny));if(nx===59.3||nx===66.7)this.slideVelocity.x=0;if(ny===24.3||ny===29.7)this.slideVelocity.y=0;}
   const clear=(a,b)=>[-.2,.2].every(dx=>[-.2,.2].every(dy=>this.floor(a+dx,b+dy)));if(clear(nx,this.player.y))this.player.x=nx;else this.slideVelocity.x=0;if(clear(this.player.x,ny))this.player.y=ny;else this.slideVelocity.y=0;if(!onIce&&!this.sled.riding&&Math.hypot(this.slideVelocity.x-x*(input.sprint?5:3.1),this.slideVelocity.y-y*(input.sprint?5:3.1))<.04){this.slideVelocity.x=0;this.slideVelocity.y=0;}if(this.target&&max<.04&&!flow){this.slideVelocity.x=0;this.slideVelocity.y=0;}
   this.player.moving=Math.hypot(old.x-this.player.x,old.y-this.player.y)>1e-6;this.player.sprinting=Boolean(input.sprint&&this.player.moving);this.motion.update(dt,this);
  }
 }
 EscapeSeasonWorld.areas=AREAS;root.EscapeSeasonWorld=EscapeSeasonWorld;if(node)module.exports={EscapeSeasonWorld};
})(typeof globalThis!=='undefined'?globalThis:this);
