// Small lives: creatures that share each escape with Sally but play no part in it. Birds perch on
// the walls and burst into the air when she comes close or runs; butterflies drift round flowers
// and scatter; fish shadows glide in the water and dart off; frogs sit on the banks and plop in;
// skinks freeze, then flick away along the wall. Some things only watch: stalked fungus in the
// caves turns its eyes to follow her and pulls them in if she comes too near, flowers in the green
// places turn their heads after her, anemones on the shore close up as she passes.
// None of it touches the game: nothing here can see, catch or block Sally, and the engine never
// reads it. It is Full lighting only, like the rest of the scenery, and lives entirely in this file.
const ESCAPE_CRITTER_HASH=(x,y,s=0)=>{let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
// Who lives where: [kind, how many, variety].
const ESCAPE_CRITTER_SETS={
  meadow:[['bird',4,'sparrow'],['butterfly',4],['flower',4]],garden:[['bird',3,'sparrow'],['butterfly',5],['flower',5]],orchard:[['bird',4,'finch'],['butterfly',3],['flower',3]],
  river:[['bird',3,'sparrow'],['frog',3],['fish',3]],marsh:[['frog',4],['fish',3],['bird',2,'finch']],lantern:[['frog',3],['fish',2],['fungus',3]],
  ruins:[['bird',4,'pigeon'],['flower',2],['skink',2]],quarry:[['bird',3,'pigeon'],['skink',3]],desert:[['skink',4]],ants:[['skink',3]],vents:[['skink',2]],
  rooftops:[['bird',6,'pigeon']],jungle:[['bird',3,'parrot'],['butterfly',3],['fungus',2]],hollow:[['bird',3,'finch'],['butterfly',3],['fungus',3]],
  coast:[['bird',3,'gull'],['anemone',5],['fish',3]],tide:[['bird',3,'gull'],['anemone',5],['fish',3]],frost:[['bird',3,'snowbird']],
  grotto:[['fungus',7]],glow:[['fungus',6]],storm:[],home:[['bird',4,'sparrow'],['butterfly',4],['flower',4]],finale:[['bird',4,'sparrow'],['butterfly',4],['flower',4]],
  'secret:bestiary-grove':[['bird',3,'parrot'],['butterfly',5],['flower',5]],'secret:star-garden':[['butterfly',6],['flower',6]],'secret:blind-grove':[['fungus',5],['butterfly',2]],
  'secret:mossy-well':[['fungus',4],['frog',3]],'secret:sunken-wreck':[['fish',5],['anemone',5]],'secret:cloud-nest':[['bird',6,'gull']]
};
const ESCAPE_BIRD_LOOKS={sparrow:{body:[146,108,72],belly:[226,206,170],wing:[110,80,56]},finch:{body:[196,150,62],belly:[240,214,130],wing:[120,96,50]},
  pigeon:{body:[146,148,160],belly:[186,188,198],wing:[110,112,126],neck:[110,160,140]},gull:{body:[236,236,230],belly:[250,250,246],wing:[170,176,186]},
  snowbird:{body:[222,230,240],belly:[248,250,255],wing:[130,152,186]},parrot:{body:[214,84,60],belly:[240,196,80],wing:[60,140,190]}};
const escapeCritters={key:null,list:[],last:0,chirpAt:0,water:null};

function escapeCritterTheme(g){const place=typeof escapePlace==='function'?escapePlace(g.level):null;return place?.key||null;}
// Places that matter to play are left clear, so nothing ever sits on a key, a hatch, treasure or a switch.
function escapeCritterBusy(g){
  const busy=new Set(),add=p=>{if(p)busy.add(Math.floor(p.x)+','+Math.floor(p.y));};
  add(g.key);add(g.exit);add(g.player);for(const l of g.loot||[])add(l);for(const h of g.hunters||[])add(h);
  for(const gate of g.gates||[]){add(gate.switch);for(const p of gate.plates||[])add(p);for(const [x,y] of gate.tiles||[])busy.add(x+','+y);}
  for(const t of g.tunnels||[]){add(t.a);add(t.b);}for(const b of g.glowbugs||[])add(b);
  return busy;
}
function setupEscapeCritters(g){
  const theme=escapeCritterTheme(g),set=(ESCAPE_CRITTER_SETS[theme]||[]).slice();if(g.level.dark&&!set.some(s=>s[0]==='fungus'))set.push(['fungus',5]);
  const W=g.width,H=g.height,busy=escapeCritterBusy(g),plain=(x,y)=>['.','L'].includes(g.grid[y]?.[x])&&!busy.has(x+','+y),wall=(x,y)=>['#','B'].includes(g.grid[y]?.[x]??'#');
  const water=(x,y)=>{const t=g.grid[y]?.[x];return t==='U'||(t==='P'&&typeof escapeTerrainDeepIsWater==='function'&&escapeTerrainDeepIsWater(EscapeCatalog.levels.indexOf(g.level)));};
  const spots={perch:[],foot:[],open:[],bank:[],pool:[]};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(wall(x,y)&&plain(x,y+1)&&y>0)spots.perch.push({x:x+.5,y:y+.42});
    if(plain(x,y)){const sides=[[0,-1],[-1,0],[1,0]].filter(([dx,dy])=>wall(x+dx,y+dy));if(sides.length){const [dx,dy]=sides[Math.floor(ESCAPE_CRITTER_HASH(x,y,3)*sides.length)];spots.foot.push({x:x+.5+dx*.3,y:y+.5+dy*.3,wx:dx,wy:dy});}
      else if([[1,0],[-1,0],[0,1],[0,-1]].every(([dx,dy])=>!wall(x+dx,y+dy)))spots.open.push({x:x+.5,y:y+.5});
      const wet=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>water(x+dx,y+dy));if(wet)spots.bank.push({x:x+.5,y:y+.5,wx:wet[0],wy:wet[1]});}
    if(water(x,y))spots.pool.push({x:x+.5,y:y+.5});}
  // Spread each kind out: shuffle by a seed from the level, then skip spots too close to one already taken.
  const seed=[...String(g.level.id)].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7),list=[],taken=[];
  const pick=(pool,n,gap)=>{const order=pool.map((s,i)=>[ESCAPE_CRITTER_HASH(i,seed,11),s]).sort((a,b)=>a[0]-b[0]).map(e=>e[1]),out=[];
    for(const s of order){if(out.length>=n)break;if(taken.some(t=>Math.hypot(t.x-s.x,t.y-s.y)<gap))continue;out.push(s);taken.push(s);}return out;};
  for(const [kind,n,look] of set){
    if(kind==='bird')for(const s of pick(spots.perch,n,3))list.push({kind,look:look||'sparrow',x:s.x,y:s.y,perch:s,state:'perch',face:Math.random()<.5?-1:1,next:Math.random()*3,peck:0,away:0});
    if(kind==='butterfly')for(const s of pick(spots.open.concat(spots.foot),n,3))list.push({kind,home:{x:s.x,y:s.y},x:s.x,y:s.y,ph:Math.random()*9,color:[[250,222,120],[236,170,222],[180,222,250],[250,250,240]][Math.floor(Math.random()*4)],flee:0,vx:0,vy:0});
    if(kind==='fungus'||kind==='flower'||kind==='anemone')for(const s of pick(spots.foot,n,2.2))list.push({kind,x:s.x,y:s.y,wx:s.wx,wy:s.wy,out:1,hideUntil:0,blinkAt:Math.random()*4,lookX:s.x,lookY:s.y+1,stalks:1+Math.floor(ESCAPE_CRITTER_HASH(Math.floor(s.x),Math.floor(s.y),9)*3),hue:Math.floor(ESCAPE_CRITTER_HASH(Math.floor(s.x),Math.floor(s.y),8)*3)});
    if(kind==='frog')for(const s of pick(spots.bank,n,2.5))list.push({kind,x:s.x,y:s.y,home:s,state:'sit',t:0,next:4+Math.random()*8,alpha:1});
    if(kind==='skink')for(const s of pick(spots.foot,n,2.5))list.push({kind,x:s.x,y:s.y,home:s,state:'still',t:0,heading:Math.atan2(-s.wy||.01,-s.wx||.01)+Math.PI/2,alpha:1});
    if(kind==='fish'&&spots.pool.length>=4)for(const s of pick(spots.pool,n,2))list.push({kind,x:s.x,y:s.y,heading:Math.random()*Math.PI*2,speed:.5,target:null,dart:0});
  }
  escapeCritters.list=list;escapeCritters.spots=spots;escapeCritters.water=water;escapeCritters.last=g.elapsed;escapeCritters.chirpAt=g.elapsed+4+Math.random()*6;
}
// A sound from where the creature is: quieter with distance, panned left or right of Sally.
function escapeCritterSound(g,name,x,y,gain=1){
  if(typeof escapeSound!=='function')return;const p=g.player,d=Math.hypot(x-p.x,y-p.y);if(d>10)return;
  escapeSound(name,{gain:gain*Math.max(.15,1-d/10),pan:Math.max(-1,Math.min(1,(x-p.x)/7))});
}
// How close Sally can come before a creature minds: closer when she creeps, much further when she runs.
function escapeCritterReach(p,base){return base*(p.sprinting?1.9:p.crawling?.6:1);}

function tickEscapeCritters(g){
  if(!escapeLightingFull())return;const key=g.level.id+'|'+(g.level.revision||1);
  if(escapeCritters.key!==key||escapeCritters.game!==g){escapeCritters.key=key;escapeCritters.game=g;setupEscapeCritters(g);}
  const dt=Math.max(0,Math.min(.1,g.elapsed-escapeCritters.last));escapeCritters.last=g.elapsed;if(!dt)return;
  const p=g.player,t=g.elapsed,spots=escapeCritters.spots;
  const near=(c,r)=>Math.hypot(c.x-p.x,c.y-p.y)<r,hunterNear=(c,r)=>g.hunters.some(h=>!['rooted','buried','hidden'].includes(h.state)&&Math.hypot(h.x-c.x,h.y-c.y)<r);
  for(const c of escapeCritters.list){
    if(c.kind==='bird'){
      if(c.state==='perch'){
        c.next-=dt;if(c.next<=0){c.next=1+Math.random()*3;if(Math.random()<.5)c.peck=.35;else c.face=Math.random()<.5?-1:1;}c.peck=Math.max(0,c.peck-dt);
        if(Math.hypot(p.x-c.x,p.y-c.y)<5)c.face=p.x<c.x?-1:1;
        const scared=near(c,escapeCritterReach(p,1.9))||hunterNear(c,1.3)||(p.noisy&&near(c,3.5));
        if(scared&&t>c.away){const far=spots.perch.filter(s=>Math.hypot(s.x-p.x,s.y-p.y)>4.5&&Math.hypot(s.x-c.x,s.y-c.y)>2.5&&Math.hypot(s.x-c.x,s.y-c.y)<12&&!escapeCritters.list.some(o=>o!==c&&o.perch===s));
          const to=far.length?far[Math.floor(Math.random()*far.length)]:null,off={x:c.x+(c.x<p.x?-14:14),y:c.y-6};
          c.state='fly';c.from={x:c.x,y:c.y};c.to=to||off;c.leaving=!to;c.t=0;c.dur=Math.max(.9,Math.hypot(c.to.x-c.x,c.to.y-c.y)/3.6);c.perch=to;c.face=c.to.x<c.x?-1:1;
          escapeCritterSound(g,'wingbeat',c.x,c.y,.9);if(Math.random()<.5)escapeCritterSound(g,'tweet',c.x,c.y,.6);}
      }else if(c.state==='fly'){
        c.t+=dt/c.dur;const k=Math.min(1,c.t),e=k*k*(3-2*k),lift=Math.sin(k*Math.PI)*Math.min(2.2,c.dur*1.4);
        c.x=c.from.x+(c.to.x-c.from.x)*e;c.y=c.from.y+(c.to.y-c.from.y)*e-lift;c.ground={x:c.from.x+(c.to.x-c.from.x)*e,y:c.from.y+(c.to.y-c.from.y)*e};
        if(k>=1){if(c.leaving){c.state='gone';c.back=t+6+Math.random()*8;}else{c.state='perch';c.x=c.to.x;c.y=c.to.y;c.away=t+1.2;c.next=1;}}
      }else if(c.state==='gone'&&t>c.back){const far=spots.perch.filter(s=>Math.hypot(s.x-p.x,s.y-p.y)>6&&!escapeCritters.list.some(o=>o!==c&&o.perch===s));
        if(far.length){const s=far[Math.floor(Math.random()*far.length)];c.state='fly';c.to=s;c.perch=s;c.from={x:s.x+(Math.random()<.5?-12:12),y:s.y-6};c.x=c.from.x;c.y=c.from.y;c.leaving=false;c.t=0;c.dur=2.4;}else c.back=t+4;}
    }
    else if(c.kind==='butterfly'){
      c.ph+=dt;const scared=near(c,escapeCritterReach(p,1.4));
      if(scared&&c.flee<=0){const a=Math.atan2(c.y-p.y,c.x-p.x)+(Math.random()-.5);c.vx=Math.cos(a)*2.4;c.vy=Math.sin(a)*2.4;c.flee=1.2;
        const pool=spots.open.concat(spots.foot).filter(s=>Math.hypot(s.x-p.x,s.y-p.y)>4);if(pool.length){const s=pool[Math.floor(Math.random()*pool.length)];c.home={x:s.x,y:s.y};}}
      if(c.flee>0){c.flee-=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=.97;c.vy*=.97;}
      else{const tx=c.home.x+Math.sin(c.ph*.9)*.55+Math.sin(c.ph*2.3)*.15,ty=c.home.y+Math.cos(c.ph*.7)*.4+Math.sin(c.ph*3.1)*.12;c.x+=(tx-c.x)*Math.min(1,dt*1.6);c.y+=(ty-c.y)*Math.min(1,dt*1.6);}
    }
    else if(c.kind==='fungus'||c.kind==='flower'||c.kind==='anemone'){
      const d=Math.hypot(c.x-p.x,c.y-p.y);
      if(d<escapeCritterReach(p,c.kind==='flower'?.9:1.3)){if(c.out>.5&&c.kind!=='flower')escapeCritterSound(g,'squish',c.x,c.y,.5);c.hideUntil=t+1.4;}
      c.out+=((t<c.hideUntil?(c.kind==='flower'?.35:.08):1)-c.out)*Math.min(1,dt*(t<c.hideUntil?9:1.6));
      // The eyes follow Sally when she is near, and wander when she is not.
      const watching=d<6.5;const lx=watching?p.x:c.x+Math.sin(t*.4+c.x)*2,ly=watching?p.y:c.y+Math.cos(t*.3+c.y)*2;c.lookX+=(lx-c.lookX)*Math.min(1,dt*4);c.lookY+=(ly-c.lookY)*Math.min(1,dt*4);
      if(t>c.blinkAt+.16)c.blinkAt=t+2.5+Math.random()*5;
    }
    else if(c.kind==='frog'){
      if(c.state==='sit'){c.next-=dt;if(c.next<=0){c.next=6+Math.random()*10;if(Math.hypot(c.x-p.x,c.y-p.y)<9)escapeCritterSound(g,'ribbit',c.x,c.y,.5);c.croak=.5;}c.croak=Math.max(0,(c.croak||0)-dt);
        if(near(c,escapeCritterReach(p,1.7))||hunterNear(c,1.2)){c.state='hop';c.t=0;c.from={x:c.x,y:c.y};c.to={x:c.home.x+c.home.wx*.9,y:c.home.y+c.home.wy*.9};}}
      else if(c.state==='hop'){c.t+=dt/.38;const k=Math.min(1,c.t);c.x=c.from.x+(c.to.x-c.from.x)*k;c.y=c.from.y+(c.to.y-c.from.y)*k-Math.sin(k*Math.PI)*.35;
        if(k>=1){c.state='under';c.back=t+8+Math.random()*8;escapeCritterSound(g,'plop',c.x,c.y,.8);if(typeof escapeFx!=='undefined')escapeFx.add('ripple',c.x,c.y,{t:escapeFxClock,life:1.2,size:.2});}}
      else if(c.state==='under'&&t>c.back){const pool=spots.bank.filter(s=>Math.hypot(s.x-p.x,s.y-p.y)>4&&!escapeCritters.list.some(o=>o!==c&&o.home===s));if(pool.length){const s=pool[Math.floor(Math.random()*pool.length)];c.home=s;c.x=s.x;c.y=s.y;c.state='sit';c.alpha=0;}else c.back=t+4;}
      if(c.state==='sit')c.alpha=Math.min(1,c.alpha+dt*1.5);
    }
    else if(c.kind==='skink'){
      if(c.state==='still'){if(near(c,escapeCritterReach(p,1.6))||hunterNear(c,1.2)){const pool=spots.foot.filter(s=>Math.hypot(s.x-c.x,s.y-c.y)>1.2&&Math.hypot(s.x-c.x,s.y-c.y)<4&&Math.hypot(s.x-p.x,s.y-p.y)>Math.hypot(c.x-p.x,c.y-p.y)+1);
        if(pool.length){const s=pool[Math.floor(Math.random()*pool.length)];c.state='dash';c.from={x:c.x,y:c.y};c.to=s;c.t=0;c.dur=Math.hypot(s.x-c.x,s.y-c.y)/6;c.heading=Math.atan2(s.y-c.y,s.x-c.x);escapeCritterSound(g,'skitter',c.x,c.y,.35);}}}
      else{c.t+=dt/Math.max(.1,c.dur);const k=Math.min(1,c.t);c.x=c.from.x+(c.to.x-c.from.x)*k;c.y=c.from.y+(c.to.y-c.from.y)*k;if(k>=1){c.state='still';c.home=c.to;}}
    }
    else if(c.kind==='fish'){
      const water=escapeCritters.water,threat=Math.hypot(c.x-p.x,c.y-p.y)<(p.swimming?2.2:1.3);
      if(threat&&c.dart<=0){c.heading=Math.atan2(c.y-p.y,c.x-p.x)+(Math.random()-.5)*.8;c.dart=.7;}
      if(!c.target||Math.hypot(c.target.x-c.x,c.target.y-c.y)<.3||Math.random()<dt*.1){const pool=spots.pool.filter(s=>Math.hypot(s.x-c.x,s.y-c.y)<4);c.target=pool[Math.floor(Math.random()*pool.length)]||c.target;}
      if(c.dart<=0&&c.target){const want=Math.atan2(c.target.y-c.y,c.target.x-c.x);let diff=want-c.heading;diff=Math.atan2(Math.sin(diff),Math.cos(diff));c.heading+=Math.max(-1.5*dt,Math.min(1.5*dt,diff));}
      const speed=c.dart>0?3.2:.55;c.dart-=dt;const nx=c.x+Math.cos(c.heading)*speed*dt,ny=c.y+Math.sin(c.heading)*speed*dt;
      if(water(Math.floor(nx),Math.floor(ny))&&water(Math.floor(nx+Math.cos(c.heading)*.2),Math.floor(ny+Math.sin(c.heading)*.2))){c.x=nx;c.y=ny;}else{c.heading+=Math.PI*(.5+Math.random()*.5);c.dart=0;}
    }
  }
  // Now and then a bird somewhere sings.
  if(t>escapeCritters.chirpAt){escapeCritters.chirpAt=t+7+Math.random()*12;const birds=escapeCritters.list.filter(c=>c.kind==='bird'&&c.state==='perch');if(birds.length){const b=birds[Math.floor(Math.random()*birds.length)];escapeCritterSound(g,'tweet',b.x,b.y,.55);b.sing=t;}}
}

// ---- Drawing ----------------------------------------------------------------------------------------
// 'ground': everything at floor level and birds on their perches, under the hunters. 'air': birds
// in flight and butterflies, over everything but the darkness.
function drawEscapeCritters(g,cell,view,layer){
  if(!escapeLightingFull()||escapeCritters.game!==g)return;const t=g.elapsed,seen=(x,y)=>!view.follow||g.visibleTile(Math.floor(x),Math.floor(y));
  for(const c of escapeCritters.list){
    if(layer==='ground'){
      if(c.kind==='bird'&&c.state==='fly'&&c.ground&&seen(c.ground.x,c.ground.y)){noStroke();fill(0,0,0,40);ellipse(c.ground.x*cell,(c.ground.y+.1)*cell,cell*.26,cell*.1);}
      if(c.kind==='bird'&&c.state==='perch'&&seen(c.x,c.y+.6))escapeDrawBird(c,cell,t,false);
      else if((c.kind==='fungus'||c.kind==='flower'||c.kind==='anemone')&&seen(c.x,c.y))escapeDrawWatcher(c,cell,t,g);
      else if(c.kind==='frog'&&c.state!=='under'&&seen(c.x,c.y))escapeDrawFrog(c,cell,t);
      else if(c.kind==='skink'&&seen(c.x,c.y))escapeDrawSkink(c,cell,t);
      else if(c.kind==='fish'&&seen(c.x,c.y))escapeDrawFishShadow(c,cell,t);
    }else{
      if(c.kind==='bird'&&c.state==='fly'&&(seen(c.x,c.y)||seen(c.ground?.x??c.x,c.ground?.y??c.y)))escapeDrawBird(c,cell,t,true);
      else if(c.kind==='butterfly'&&seen(c.x,c.y))escapeDrawButterfly(c,cell,t);
    }
  }
}
function escapeDrawBird(c,cell,t,flying){
  const look=ESCAPE_BIRD_LOOKS[c.look]||ESCAPE_BIRD_LOOKS.sparrow,s=cell*(c.look==='gull'?1.5:c.look==='pigeon'?1.4:1.25),f=c.face;push();translate(c.x*cell,c.y*cell);noStroke();
  if(flying){const flap=Math.sin(t*22+c.x*3);fill(...look.wing);for(const side of [-1,1]){push();scale(1,1);beginShape();vertex(0,-s*.02);vertex(side*s*.32,-s*(.06+flap*.16));vertex(side*s*.2,s*.04);endShape(CLOSE);pop();}
    fill(...look.body);ellipse(0,0,s*.24,s*.14);fill(...look.belly);ellipse(f*s*.02,s*.02,s*.14,s*.07);fill(...look.body);ellipse(f*s*.12,-s*.03,s*.1,s*.09);fill(232,170,70);triangle(f*s*.17,-s*.035,f*s*.21,-s*.02,f*s*.17,-s*.005);}
  else{const hop=Math.abs(Math.sin(t*3+c.x))<.05?-s*.03:0,peck=c.peck>0?s*.05:0;translate(0,hop);
    fill(0,0,0,35);ellipse(0,s*.1,s*.24,s*.06);
    fill(...look.wing);triangle(-f*s*.08,-s*.02,-f*s*.2,s*.04,-f*s*.06,s*.06);
    fill(...look.body);ellipse(0,0,s*.22,s*.15);fill(...look.belly);ellipse(f*s*.03,s*.025,s*.14,s*.08);fill(...look.wing);ellipse(-f*s*.02,-s*.01,s*.13,s*.08);
    if(look.neck){fill(...look.neck,160);ellipse(f*s*.08,-s*.03+peck*.5,s*.07,s*.06);}
    fill(...look.body);ellipse(f*s*.1,-s*.06+peck,s*.11,s*.1);fill(20,20,20);ellipse(f*s*.125,-s*.075+peck,s*.025,s*.025);fill(232,170,70);triangle(f*s*.15,-s*.07+peck,f*s*.2,-s*.055+peck*1.4,f*s*.15,-s*.045+peck);
    if(c.sing&&t-c.sing<.6){noFill();stroke(255,255,255,120*(1-(t-c.sing)/.6));strokeWeight(Math.max(1,cell*.02));arc(f*s*.24,-s*.08,s*.12,s*.12,-.8,.8);noStroke();}}
  pop();
}
function escapeDrawButterfly(c,cell,t){
  const s=cell*.62,flap=Math.abs(Math.sin(t*16+c.ph*3)),a=Math.sin(c.ph*1.3)*.4;push();translate(c.x*cell,c.y*cell);rotate(a);noStroke();
  fill(0,0,0,30);ellipse(cell*.06,cell*.16,s*.2,s*.08);
  fill(...c.color,220);for(const side of [-1,1]){ellipse(side*s*.12*flap,-s*.04,s*.22*flap+s*.03,s*.2);ellipse(side*s*.09*flap,s*.08,s*.15*flap+s*.02,s*.13);}
  fill(60,46,40);ellipse(0,0,s*.04,s*.2);pop();
}
// A watcher grows out of the foot of a wall: fungus with eyes on stalks, a flower that turns its
// face, or an anemone with waving arms. Each leans toward what it is watching.
function escapeDrawWatcher(c,cell,t,g){
  const out=c.out,ax=c.lookX-c.x,ay=c.lookY-c.y,d=Math.hypot(ax,ay)||1,ux=ax/d,uy=ay/d,base={x:c.x*cell,y:c.y*cell};noStroke();
  if(c.kind==='fungus'){const glow=g.level.dark,cap=[[176,140,232],[120,214,200],[236,170,120]][c.hue];
    fill(0,0,0,40);ellipse(base.x,base.y+cell*.06,cell*.34,cell*.1);
    for(let i=0;i<c.stalks;i++){const spread=(i-(c.stalks-1)/2)*.32,sway=Math.sin(t*1.3+i+c.x)*.06,h=cell*(.32+.12*((i+c.hue)%2))*out,tipX=base.x+(spread+ux*.12*out+sway)*cell,tipY=base.y-h+uy*cell*.05;
      stroke(...cap.map(v=>Math.round(v*.65)),220);strokeWeight(Math.max(1,cell*.045));noFill();bezier(base.x+spread*cell*.4,base.y,base.x+spread*cell*.5,base.y-h*.5,tipX,tipY+h*.3,tipX,tipY);noStroke();
      if(glow){fill(...cap,40);ellipse(tipX,tipY,cell*.3,cell*.3);}
      fill(...cap);ellipse(tipX,tipY,cell*.16,cell*.15);const shut=t>c.blinkAt&&t<c.blinkAt+.16||out<.4;
      if(shut){stroke(40,30,50);strokeWeight(Math.max(1,cell*.02));line(tipX-cell*.04,tipY,tipX+cell*.04,tipY);noStroke();}
      else{fill(250,248,236);ellipse(tipX,tipY,cell*.1,cell*.1);fill(24,20,30);ellipse(tipX+ux*cell*.025,tipY+uy*cell*.025,cell*.05,cell*.05);}}
    fill(...cap.map(v=>v*.7));ellipse(base.x,base.y,cell*.2,cell*.08);}
  else if(c.kind==='flower'){const petal=[[244,214,96],[236,150,196],[246,246,240]][c.hue];
    const h=cell*.34,headX=base.x+ux*cell*.08,headY=base.y-h+uy*cell*.04;stroke(70,130,70);strokeWeight(Math.max(1,cell*.035));noFill();bezier(base.x,base.y,base.x,base.y-h*.5,headX,headY+h*.3,headX,headY);noStroke();
    fill(80,140,76);ellipse(base.x-cell*.06,base.y-h*.35,cell*.1,cell*.05);
    const open=out,r=cell*.075*open;fill(...petal);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*.2;ellipse(headX+Math.cos(a)*r,headY+Math.sin(a)*r*.8,cell*.08*(.5+open*.5),cell*.07*(.5+open*.5));}
    fill(232,170,60);ellipse(headX+ux*cell*.012,headY+uy*cell*.012,cell*.06,cell*.055);}
  else{const col=[[236,110,120],[150,200,140],[240,170,90]][c.hue],arms=7,len=cell*.18*out;
    fill(...col.map(v=>v*.6));ellipse(base.x,base.y,cell*.18,cell*.12);stroke(...col,220);strokeWeight(Math.max(1,cell*.03));
    for(let i=0;i<arms;i++){const a=i/arms*Math.PI*2,w=Math.sin(t*2+i)*.3;line(base.x,base.y-cell*.02,base.x+Math.cos(a+w)*len,base.y-cell*.02+Math.sin(a+w)*len*.7);}noStroke();fill(...col);ellipse(base.x,base.y-cell*.02,cell*.08*(.5+out*.5),cell*.06);}
}
function escapeDrawFrog(c,cell,t){
  const s=cell*.38,a=Math.atan2(c.home.wy,c.home.wx);push();translate(c.x*cell,c.y*cell);rotate(a+Math.PI/2);noStroke();
  fill(0,0,0,30*c.alpha);ellipse(0,s*.06,s*.5,s*.18);fill(92,150,72,255*c.alpha);ellipse(0,0,s*.36,s*.42);
  for(const side of [-1,1]){ellipse(side*s*.2,s*.12,s*.14,s*.22);ellipse(side*s*.14,-s*.16,s*.1,s*.14);}
  fill(130,186,96,255*c.alpha);ellipse(0,-s*.02,s*.24,s*.26);if(c.croak>0){fill(206,226,150,200*c.alpha);ellipse(0,-s*.2,s*.2*(.6+.4*Math.sin(t*20)),s*.12);}
  fill(30,40,20,255*c.alpha);for(const side of [-1,1])ellipse(side*s*.1,-s*.17,s*.07,s*.07);pop();
}
function escapeDrawSkink(c,cell,t){
  const s=cell*.5,moving=c.state==='dash',wig=moving?Math.sin(t*40)*.3:0;push();translate(c.x*cell,c.y*cell);rotate(c.heading);noStroke();
  fill(0,0,0,30);ellipse(0,s*.03,s*.6,s*.1);fill(140,110,72);ellipse(0,0,s*.34,s*.1);
  stroke(140,110,72);strokeWeight(Math.max(1,s*.05));noFill();beginShape();for(let i=0;i<5;i++)vertex(-s*.16-i*s*.07,Math.sin(i*.9+wig*4)*s*.03);endShape();noStroke();
  fill(120,94,60);ellipse(s*.2,0,s*.12,s*.08);for(const side of [-1,1])for(const fx of [.08,-.08])ellipse(s*fx,side*s*(.07+Math.abs(wig)*.03),s*.05,s*.04);
  fill(20,20,20);ellipse(s*.23,-s*.02,s*.025,s*.025);pop();
}
function escapeDrawFishShadow(c,cell,t){
  const s=cell*.55,wag=Math.sin(t*(c.dart>0?24:7)+c.x*2)*.35;push();translate(c.x*cell,c.y*cell);rotate(c.heading);noStroke();
  fill(6,24,34,80);ellipse(0,0,s*.42,s*.16);push();translate(-s*.2,0);rotate(wag);triangle(0,0,-s*.16,-s*.09,-s*.16,s*.09);pop();pop();
}
