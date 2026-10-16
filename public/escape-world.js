// The trail is a safe overworld. Level records remain the source of unlocks.
(function(root){
  const catalog=typeof module!=='undefined'&&module.exports?require('./escape-levels.js').EscapeCatalog:root.EscapeCatalog;
  const Motion=typeof module!=='undefined'&&module.exports?require('./creature-rig.js').EscapeCreatureMotion:root.EscapeCreatureMotion;
  const chapters=[
    [0,5,'Sunny Meadow','meadow'],[5,9,'Garden Ruins','garden'],[9,13,'Reedbanks','river'],
    [13,17,'Restless Ruins','ruins'],[17,23,'Deep Trials','quarry'],[23,27,'Venom Depths','desert'],
    [27,32,'The Waking Maze','marsh'],[32,37,'Hollow Jungle','jungle'],[37,42,'Luminous Depths','glow'],
    [42,47,'Living Labyrinth','orchard'],[47,49,'Sun and Sea','coast'],[49,53,'The Shedding Hollow','hollow'],[53,58,'The Lantern Marsh','lantern'],[58,63,'Sunbaked Rooftops','rooftops'],[63,68,'Ant Kingdom','ants'],[68,73,'Frost Hollow','frost'],[73,78,'Steam Vents','vents'],[78,83,'Mushroom Grotto','grotto'],[83,88,'Storm Heights','storm']
  ].map(([start,end,name,theme],i)=>{const [x,y]=[[14,18],[36,18],[58,18],[80,18],[101,18],[101,43],[79,43],[57,43],[35,43],[14,43],[14,68],[36,68],[36,93],[57,68],[101,68],[14,93],[57,93],[79,93],[101,93]][i];return {start,end,name,theme,x,y,linear:['hollow','lantern','rooftops','ants','frost','vents','grotto','storm'].includes(theme)};});
  // Two treasure caches hide in the far corners of every courtyard. They add to
  // Sally's lifetime hoard but never gate progress.
  const CACHE_VALUE=5,caches=chapters.flatMap((c,i)=>[[c.x+7,c.y-6],[c.x-7,c.y+6]].map(([x,y],n)=>({id:c.theme+'-'+(n?'south':'north'),chapter:i,x,y,value:CACHE_VALUE})));
  // Signposts greet Sally at each courtyard and report how many stars it holds.
  const signs=chapters.map((c,i)=>({chapter:i,x:c.x-3,y:c.y-6}));
  // One friendly local lives in every courtyard and chats when Sally is close.
  const folk=[['tortoise','Old Moss'],['snail','Pip'],['frog','Reed'],['beetle','Brass'],['tortoise','Gravel'],['frog','Dusty'],['snail','Murk'],['frog','Fern'],['beetle','Glimmer'],['snail','Bramble'],['frog','Coral'],['tortoise','Husk'],['beetle','Wick'],['frog','Tiles'],['beetle','Pincer'],['tortoise','Frostbite'],['snail','Rivet'],['frog','Morel'],['tortoise','Gale']];
  const npcs=chapters.map((c,i)=>({chapter:i,x:c.x+3,y:c.y+5,kind:folk[i][0],name:folk[i][1]}));
  class EscapeWorld{
    constructor(unlocked=()=>true,focusId=null,hiddenOpen=()=>false,bonusOpen=()=>false){
      this.width=116;this.height=106;this.chapters=chapters;this.caches=caches;this.signs=signs;this.npcs=npcs;this.found=new Set();this.onCache=null;
      // Golden flies drift in now and then; Sally can chase them down or grab one with her tongue.
      // The Gilded Burrow lies north of the Garden Ruins. It is solid rock until it opens.
      this.hiddenOpen=hiddenOpen;this.hiddenCarved=false;this.terrainVersion=0;
      this.hiddenNodes=(catalog.hidden||[]).map((level,i)=>({id:level.id,hidden:true,index:i,x:[31,36,41][i],y:[5,3,5][i],name:level.name})).filter(n=>!catalog.hidden[n.index].bonus);
      // Bonus escapes are no secret: their grove is always on the map, behind a hedge that opens
      // once the areas before it are mastered. The Bramble Maze sits north of the Deep Trials.
      this.bonusOpen=bonusOpen;
      this.bonusNodes=(catalog.hidden||[]).map((level,i)=>({id:level.id,hidden:true,bonus:level.bonus,index:i,name:level.name})).filter(n=>n.bonus).map((n,k)=>({...n,...[{x:101,y:4,lock:{x:101,y:9},sign:{x:99,y:11}},{x:14,y:30,lock:{x:14,y:35},sign:{x:12,y:37}}][k]}));
      this.rng=Math.random;this.fly=null;this.flyAt=10;this.onFly=null;this.lick=null;this.unlocked=unlocked;this.hunters=[];this.elapsed=0;this.target=null;this.accumulator=0;
      const spots=[[-6,3],[-4,-2],[0,-4],[4,-1],[6,4],[0,6]];
      this.nodes=catalog.levels.map((level,index)=>{const chapter=chapters.findIndex(c=>index>=c.start&&index<c.end),c=chapters[chapter],[x,y]=chapter===10&&index===48?[6,5]:spots[index-c.start];return {id:level.id,index,chapter,x:c.x+x,y:c.y+y,name:level.name};});
      const node=this.spotFor(focusId)||this.nodes[0];this.player={x:node.x,y:node.y+1,facing:{x:0,y:-1},moving:false,sprinting:false};
      this.paths=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[7,13],[5,14],[12,15],[13,16],[16,17],[17,18]];
      this.grid=Array.from({length:this.height},()=>Array(this.width).fill('#'));this.gates=[];
      const room=(x1,y1,x2,y2,t='.')=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(this.grid[y]?.[x])this.grid[y][x]=t;};
      for(const c of chapters){room(c.x-8,c.y-7,c.x+8,c.y+7);if(['ruins','garden','quarry'].includes(c.theme)){room(c.x-1,c.y+1,c.x+1,c.y+1,'#');room(c.x,c.y+1,c.x,c.y+1);}else{room(c.x+1,c.y+2,c.x+2,c.y+2,'L');}for(const [dx,dy]of [[-6,1],[-5,1],[4,-1],[5,-1]])this.grid[c.y+dy][c.x+dx]='L';if(c.theme==='river')room(c.x+4,c.y-2,c.x+6,c.y+1,'P');if(c.theme==='coast')room(c.x+2,c.y+1,c.x+4,c.y+4,'P');}
      for(const [a,b]of this.paths){const c=chapters[a],d=chapters[b];if(c.y===d.y){room(Math.min(c.x,d.x),c.y-1,Math.max(c.x,d.x),c.y+1);this.gates.push({chapter:b,x:Math.round((c.x+d.x)/2),y:c.y,vertical:false});}else{room(c.x-1,Math.min(c.y,d.y),c.x+1,Math.max(c.y,d.y));this.gates.push({chapter:b,x:c.x,y:Math.round((c.y+d.y)/2),vertical:true});}}
      // Nodes are always dry, open landing spaces inside their own courtyards.
      for(const n of this.nodes)room(n.x-1,n.y-1,n.x+1,n.y+1);
      for(const n of this.bonusNodes){room(n.x-6,n.y-3,n.x+6,n.y+3);room(n.lock.x,n.y+4,n.lock.x,n.lock.y+1);for(const [dx,dy] of [[-5,-2],[5,-2],[-5,2],[5,2]])this.grid[n.y+dy][n.x+dx]='L';}

      this.refreshRegions();this.tracks=[];
      const track=(a,b,side=false)=>{const from={x:a.x+.5,y:a.y+.5},to={x:b.x+.5,y:b.y+.5},path=this.route(to,from,true);if(path)this.tracks.push({points:[from,...path],side,from:a.id,to:b.id});};
      for(const c of chapters){const nodes=this.nodes.filter(n=>n.chapter===chapters.indexOf(c));for(let i=1;i<nodes.length;i++)track(nodes[i-1],nodes[i]);if(nodes.length>3&&!c.linear)track(nodes[1],nodes[3],true);}
      for(const [a,b]of this.paths)track(this.nodes[chapters[a].end-1],this.nodes[chapters[b].start],b===13||b===14||b===16);
      this.motion=new Motion(this);
    }
    refreshRegions(){this.openRegions=this.chapters.map((_,i)=>this.nodes.some(n=>n.chapter===i&&this.unlocked(n.id)));if(!this.hiddenCarved&&this.hiddenNodes.length&&this.hiddenOpen())this.carveHidden();}
    carveHidden(){
      const room=(x1,y1,x2,y2)=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)this.grid[y][x]='.';};
      room(28,1,44,8);room(35,9,37,10);for(const [x,y] of [[29,2],[43,2],[29,7],[43,7]])this.grid[y][x]='L';
      this.hiddenCarved=true;this.terrainVersion++;
    }
    // Where Sally stands for an escape: its node, or a bonus or hidden grove (a hidden one only once carved).
    spotFor(id){return id?this.nodes.find(n=>n.id===id)||this.bonusNodes.find(n=>n.id===id)||(this.hiddenCarved?this.hiddenNodes.find(n=>n.id===id):null):null;}
    regionOpen(i){return Boolean(this.openRegions?.[i]);}
    floor(x,y){x=Math.floor(x);y=Math.floor(y);if(!['.','L'].includes(this.grid[y]?.[x]))return false;for(const [i,c]of chapters.entries())if(Math.abs(x-c.x)<=8&&Math.abs(y-c.y)<=7&&!this.regionOpen(i))return false;if(this.bonusNodes.some(n=>x===n.lock.x&&y===n.lock.y&&!this.bonusOpen(n.id)))return false;return !this.gates.some(g=>!this.regionOpen(g.chapter)&&(g.vertical?y===g.y&&Math.abs(x-g.x)<=1:x===g.x&&Math.abs(y-g.y)<=1));}
    route(to,from=this.player,ignoreLocks=false){const sx=Math.floor(from.x),sy=Math.floor(from.y),tx=Math.floor(to.x),ty=Math.floor(to.y),queue=[[sx,sy]],previous=new Map([[sx+','+sy,null]]);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];if(x===tx&&y===ty){const out=[];let p=[x,y];while(p){out.unshift({x:p[0]+.5,y:p[1]+.5});p=previous.get(p.join(','));}out.shift();return out;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if((ignoreLocks?['.','L'].includes(this.grid[ny]?.[nx]):this.floor(nx,ny))&&!previous.has(k)){previous.set(k,[x,y]);queue.push([nx,ny]);}}}return null;}
    chapterAt(p=this.player){return chapters.reduce((best,c,i)=>Math.hypot(c.x-p.x,c.y-p.y)<Math.hypot(chapters[best].x-p.x,chapters[best].y-p.y)?i:best,0);}
    nearbyNpc(){return this.npcs.find(n=>this.regionOpen(n.chapter)&&Math.hypot(n.x+.5-this.player.x,n.y+.5-this.player.y)<=1.8)||null;}
    spawnFly(){
      for(let i=0;i<40;i++){
        const a=this.rng()*Math.PI*2,d=4+this.rng()*4,x=this.player.x+Math.cos(a)*d,y=this.player.y+Math.sin(a)*d;
        if(this.floor(x,y)&&this.floor(x-.6,y)&&this.floor(x+.6,y)&&this.floor(x,y-.6)&&this.floor(x,y+.6)){this.fly={x,y,home:{x,y},born:this.elapsed,expires:this.elapsed+18};return true;}
      }
      this.flyAt=this.elapsed+5;return false;
    }
    catchFly(){if(!this.fly)return false;const fly=this.fly;this.fly=null;this.flyAt=this.elapsed+22+this.rng()*20;this.onFly?.(fly);return true;}
    tongue(){
      if(!this.fly||Math.hypot(this.fly.x-this.player.x,this.fly.y-this.player.y)>2.6)return false;
      this.lick={x:this.fly.x,y:this.fly.y,until:this.elapsed+.25};return this.catchFly();
    }
    updateFly(dt){
      if(!this.fly){if(this.elapsed>=this.flyAt)this.spawnFly();return;}
      const f=this.fly,p=this.player;if(this.elapsed>=f.expires){this.fly=null;this.flyAt=this.elapsed+15+this.rng()*15;return;}
      // It darts away from Sally a little slower than her sprint, but only over open ground.
      const d=Math.hypot(f.home.x-p.x,f.home.y-p.y);if(d<2.8&&d>0){const nx=f.home.x+(f.home.x-p.x)/d*2.4*dt,ny=f.home.y+(f.home.y-p.y)/d*2.4*dt;if(this.floor(nx,f.home.y))f.home.x=nx;if(this.floor(f.home.x,ny))f.home.y=ny;}
      const t=this.elapsed-f.born,x=f.home.x+Math.sin(t*2.3)*.7,y=f.home.y+Math.sin(t*3.1+1)*.45;if(this.floor(x,y)){f.x=x;f.y=y;}
      if(Math.hypot(f.x-p.x,f.y-p.y)<.55)this.catchFly();
    }
    nearbyCache(){return this.caches.find(c=>!this.found.has(c.id)&&Math.hypot(c.x+.5-this.player.x,c.y+.5-this.player.y)<=.8)||null;}
    nearby(){return this.nodes.find(n=>Math.hypot(n.x-this.player.x,n.y-this.player.y)<=1.5)||this.bonusNodes.find(n=>Math.hypot(n.x-this.player.x,n.y-this.player.y)<=1.5)||(this.hiddenCarved?this.hiddenNodes.find(n=>Math.hypot(n.x-this.player.x,n.y-this.player.y)<=1.5):null)||null;}
    // The hedge before a bonus grove that is still shut, when Sally stands by it.
    nearbyBonusLock(){return this.bonusNodes.find(n=>!this.bonusOpen(n.id)&&Math.hypot(n.lock.x+.5-this.player.x,n.lock.y+.5-this.player.y)<=2.5)||null;}
    enter(){const node=this.nearby();return node?.bonus&&!this.bonusOpen(node.id)?null:node?.hidden?'hidden:'+node.id:node&&this.unlocked(node.id)?node.id:null;}
    walkTo(id){this.refreshRegions();const n=this.nodes.find(n=>n.id===id);if(!n)return false;const route=this.route({x:n.x,y:n.y+1});if(!route)return false;route.push({x:n.x,y:n.y+1});this.target=route;return true;}
    travel(chapter){this.refreshRegions();const c=chapters[chapter];if(!c||!this.regionOpen(chapter))return false;const node=this.nodes.filter(n=>n.chapter===chapter).find(n=>this.unlocked(n.id))||this.nodes[c.start];this.player.x=node.x;this.player.y=node.y+1;this.player.facing={x:0,y:-1};this.target=null;this.accumulator=0;this.motion.resetPlayer(this.player);return true;}
    advance(seconds,input={}){
      if(!Number.isFinite(seconds)||seconds<=0)return;this.refreshRegions();this.accumulator+=Math.min(.1,seconds);
      while(this.accumulator+1e-10>=1/120){this.accumulator-=1/120;this.step(1/120,input);}
    }
    step(dt,input){
      this.elapsed+=dt;let x=Number(input.x)||0,y=Number(input.y)||0;
      if(x||y)this.target=null;
      else if(this.target){const point=this.target[0],dx=point.x-this.player.x,dy=point.y-this.player.y,d=Math.hypot(dx,dy);if(d<.03){this.target.shift();if(!this.target.length)this.target=null;}else{x=dx/d;y=dy/d;}}
      const length=Math.hypot(x,y),speed=(input.sprint?5:3.1)*dt/Math.max(1,length),old={...this.player};
      if(length)this.player.facing=Math.abs(x)>=Math.abs(y)?{x:Math.sign(x),y:0}:{x:0,y:Math.sign(y)};
      const max=this.target?Math.hypot(this.target[0].x-this.player.x,this.target[0].y-this.player.y):Infinity;
      const step=Math.min(speed,max);const nx=this.player.x+x*step,ny=this.player.y+y*step;if(this.floor(nx-.2,this.player.y)&&this.floor(nx+.2,this.player.y))this.player.x=nx;if(this.floor(this.player.x,ny-.2)&&this.floor(this.player.x,ny+.2))this.player.y=ny;
      const cache=this.nearbyCache();if(cache){this.found.add(cache.id);this.onCache?.(cache);}
      this.updateFly(dt);if(this.lick&&this.elapsed>this.lick.until)this.lick=null;
      this.player.moving=Math.hypot(old.x-this.player.x,old.y-this.player.y)>1e-6;this.player.sprinting=Boolean(input.sprint&&this.player.moving);this.motion.update(dt,this);
    }
  }
  EscapeWorld.chapters=chapters;
  root.EscapeWorld=EscapeWorld;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeWorld};
})(typeof globalThis!=='undefined'?globalThis:this);
