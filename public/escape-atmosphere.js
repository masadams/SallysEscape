// Atmosphere: the small touches that make an escape feel lived in, each kept faint enough that it
// never pulls focus from the creatures. Floors and walls get a little texture and scattered detail
// (drawn once into the tile layer); leaves sway and stay flattened where Sally pushed through; each
// area has its own drifting motes; storm floors are wet; Sally swims in rings, breathes clouds in
// the cold, and resting creatures breathe. All of it is Full lighting only.
const ESCAPE_ATMO_HASH=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;};
// What drifts in the air of each area: colour, size, how many, and how it moves.
const ESCAPE_ATMO_MOTES={
  meadow:{color:[250,240,190],n:14,size:.04,drift:[.16,.05],kind:'pollen'},garden:{color:[240,200,214],n:10,size:.05,drift:[.2,.12],kind:'petal'},
  orchard:{color:[250,236,190],n:12,size:.04,drift:[.14,.05],kind:'pollen'},jungle:{color:[214,240,140],n:10,size:.035,drift:[.08,.04],kind:'pollen'},
  river:{color:[220,240,230],n:8,size:.03,drift:[.18,.02],kind:'pollen'},marsh:{color:[200,226,190],n:10,size:.03,drift:[.06,.03],kind:'pollen'},
  coast:{color:[230,246,250],n:8,size:.03,drift:[.3,.05],kind:'spray'},tide:{color:[230,246,250],n:8,size:.03,drift:[.26,.04],kind:'spray'},
  desert:{color:[226,190,130],n:16,size:.03,drift:[.5,.04],kind:'sand'},rooftops:{color:[230,200,160],n:10,size:.03,drift:[.4,.03],kind:'sand'},
  frost:{color:[240,248,255],n:18,size:.045,drift:[.06,.22],kind:'snow'},vents:{color:[255,170,90],n:10,size:.03,drift:[.04,-.3],kind:'ember'},
  grotto:{color:[200,160,250],n:14,size:.04,drift:[.03,-.06],kind:'spore'},glow:{color:[150,255,226],n:12,size:.035,drift:[.03,-.04],kind:'spore'},
  lantern:{color:[246,226,120],n:6,size:.05,drift:[.05,.03],kind:'fly'},hollow:{color:[220,210,190],n:10,size:.035,drift:[.05,.04],kind:'pollen'},
  ants:{color:[200,170,120],n:8,size:.03,drift:[.08,.03],kind:'sand'},quarry:{color:[210,200,180],n:10,size:.03,drift:[.12,.02],kind:'sand'},
  ruins:{color:[220,210,190],n:8,size:.03,drift:[.08,.03],kind:'pollen'},storm:{color:[200,214,236],n:0,size:.03,drift:[0,0],kind:'none'},
  home:{color:[250,236,190],n:12,size:.04,drift:[.12,.04],kind:'pollen'},finale:{color:[250,236,190],n:12,size:.04,drift:[.12,.04],kind:'pollen'}
};
// Daylight areas get a faint dapple of sunlight through leaves overhead.
const ESCAPE_ATMO_DAPPLE=new Set(['meadow','garden','orchard','jungle','river','hollow','home','finale','secret:bestiary-grove','secret:star-garden']);
const escapeAtmo={motes:[],key:null,trampled:new Map(),breathAt:0,rippleAt:0,lastMoved:new WeakMap()};
function escapeAtmoTheme(g){const place=escapePlace?.(g.level);return place?place.key.replace(/^secret:.*/,s=>s):null;}

// ---- In the cached tile layer -------------------------------------------------------------------
// Floors carry scattered pebbles, cracks and the odd flower, and grass tufts where they meet a wall
// (the ground and walls themselves are escape-terrain.js). Seeded by tile, so a level always looks
// the same.
function drawEscapeAtmoGround(g,cell,palette,index){
  const theme=escapeAtmoTheme(g),wet=Boolean(g.level.storm)||theme==='storm',cold=theme==='frost',sand=g.level.biome==='desert'||theme==='desert'||theme==='rooftops';
  noStroke();
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){
    const tile=g.grid[y][x],floor=g.floor(x,y),r=ESCAPE_ATMO_HASH(x,y,1),px=x*cell,py=y*cell;
    if(!floor||!['.','L','N','M'].includes(tile))continue;
    if(tile!=='.')continue;
    const d=ESCAPE_ATMO_HASH(x,y,4);
    if(d<.2){fill(0,0,0,30);for(let i=0;i<3;i++)ellipse(px+cell*(.2+.6*ESCAPE_ATMO_HASH(x,y,i+5)),py+cell*(.2+.6*ESCAPE_ATMO_HASH(x,y,i+8)),cell*.08,cell*.055);
      fill(...(cold?[230,240,250]:sand?[230,200,150]:[200,200,170]),34);ellipse(px+cell*.62,py+cell*.42,cell*.06,cell*.05);}
    else if(d<.27){stroke(0,0,0,26);strokeWeight(Math.max(1,cell*.022));line(px+cell*.22,py+cell*.3,px+cell*.46,py+cell*.52);line(px+cell*.46,py+cell*.52,px+cell*.4,py+cell*.76);line(px+cell*.46,py+cell*.52,px+cell*.72,py+cell*.56);noStroke();}
    else if(d<.32&&!cold&&!sand&&!wet){const cx=px+cell*(.3+.4*ESCAPE_ATMO_HASH(x,y,11)),cy=py+cell*(.3+.4*ESCAPE_ATMO_HASH(x,y,12)),c=[[232,217,122],[217,166,216],[240,240,230]][Math.floor(ESCAPE_ATMO_HASH(x,y,13)*3)];
      fill(...c,120);for(let i=0;i<5;i++){const a=i/5*TWO_PI;ellipse(cx+Math.cos(a)*cell*.045,cy+Math.sin(a)*cell*.045,cell*.05,cell*.05);}fill(246,198,74,140);ellipse(cx,cy,cell*.04,cell*.04);}
    // Tufts of grass where the floor meets a wall above it.
    if(!g.floor(x,y-1)&&!cold&&!sand&&ESCAPE_ATMO_HASH(x,y,21)<.5){stroke(...(palette[2]||[110,160,90]),90);strokeWeight(Math.max(1,cell*.03));for(let i=0;i<3;i++){const bx=px+cell*(.15+.7*ESCAPE_ATMO_HASH(x,y,i+30));line(bx,py+cell*.2,bx+cell*(ESCAPE_ATMO_HASH(x,y,i+40)-.5)*.12,py+cell*.05);}noStroke();}
  }
}

// ---- Each frame, over the tiles -----------------------------------------------------------------
// Leaf cover: a few blades lean in a slow breeze and bend away from Sally and nearby creatures; where
// Sally has pushed through, the leaves lie flattened for a few seconds before they spring back.
function drawEscapeSway(g,cell,view){
  if(!escapeLightingFull())return;const t=g.elapsed,p=g.player,tr=escapeAtmo.trampled;
  const here=Math.floor(p.x)+','+Math.floor(p.y);if(g.grid[Math.floor(p.y)]?.[Math.floor(p.x)]==='L'&&p.moving)tr.set(here,t);
  strokeCap?.(ROUND);
  // Each season's cover: snow-tipped evergreen in winter, russet in autumn, pale marram grass on the
  // summer dunes, and spring green with a few blossoms.
  const season=g.level.seasonal||g.level.costume,blades=season==='winter'?[[66,110,92],[44,86,74]]:season==='autumn-hollow'?[[184,124,62],[140,94,52]]:season==='summer'?[[200,182,110],[150,150,84]]:[[96,168,96],[64,132,84]];
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){
    if(g.grid[y][x]!=='L'||view.follow&&!g.visibleTile(x,y))continue;const key=x+','+y,flat=tr.has(key)?Math.max(0,1-(t-tr.get(key))/4):0;
    if(flat===0)tr.delete(key);
    // A full clump: blades in two greens, the taller ones at the back.
    for(let i=0;i<8;i++){
      const bx=(x+.14+.72*ESCAPE_ATMO_HASH(x,y,i))*cell,by=(y+.5+.4*ESCAPE_ATMO_HASH(x,y,i+20))*cell,len=cell*(.34+.24*ESCAPE_ATMO_HASH(x,y,i+40));
      const breeze=Math.sin(t*1.3+x*.6+y*.45+i*.9)*.12,dx=bx-p.x*cell,dist=Math.hypot(dx,by-p.y*cell)/cell,push=dist<1.1?(1.1-dist)/1.1*.7:0;
      const lean=breeze+push*Math.sign(dx||1)+flat*(ESCAPE_ATMO_HASH(x,y,i+60)<.5?-1.2:1.2),reach=len*(1-flat*.45);
      const tx=bx+Math.sin(lean)*reach,ty=by-Math.cos(lean)*reach;stroke(...blades[i%2],200);strokeWeight(Math.max(1,cell*.045));line(bx,by,tx,ty);
      if(season==='winter'&&i%2===0){noStroke();fill(246,251,255,230);ellipse(tx,ty,cell*.09,cell*.07);}
      else if(season==='spring'&&i===3&&ESCAPE_ATMO_HASH(x,y,90)<.5){noStroke();fill(244,170,200,230);ellipse(tx,ty,cell*.09,cell*.09);}}
  }
}
// Motes drifting in the air, tinted to the area, very faint.
function drawEscapeMotes(g,cell){
  if(!escapeLightingFull())return;const theme=escapeAtmoTheme(g),spec=ESCAPE_ATMO_MOTES[theme]||(g.level.dark?ESCAPE_ATMO_MOTES.glow:null);if(!spec||!spec.n)return;
  const key=g.level.id+'|'+theme;if(escapeAtmo.key!==key){escapeAtmo.key=key;escapeAtmo.motes=[];for(let i=0;i<spec.n;i++)escapeAtmo.motes.push({x:Math.random()*g.width,y:Math.random()*g.height,ph:Math.random()*9,r:.6+Math.random()*.8});}
  const t=g.elapsed,dt=Math.min(.05,deltaTime/1000);noStroke();
  for(const m of escapeAtmo.motes){
    m.x+=(spec.drift[0]+Math.sin(t*.5+m.ph)*.08)*dt*(spec.kind==='snow'?.5:1);m.y+=(spec.drift[1]+Math.cos(t*.7+m.ph)*.05)*dt;
    // Sally stirs the air as she passes: motes near her swirl away.
    {const dx=m.x-g.player.x,dy=m.y-g.player.y,d=Math.hypot(dx,dy);if(d<1.3&&d>.01){const push=(1.3-d)*(g.player.moving?3.2:1)*dt;m.x+=dx/d*push-dy/d*push*.6;m.y+=dy/d*push+dx/d*push*.6;}}
    if(m.x>g.width)m.x=0;if(m.x<0)m.x=g.width;if(m.y>g.height)m.y=0;if(m.y<0)m.y=g.height;
    if(!g.visibleTile(Math.floor(m.x),Math.floor(m.y)))continue;
    const tw=.5+.5*Math.sin(t*(spec.kind==='fly'?2.2:1.4)+m.ph*3),a=(spec.kind==='fly'?Math.max(0,tw)**3*150:spec.kind==='ember'?70+60*tw:40+30*tw);
    fill(...spec.color,a);if(spec.kind==='petal'){push();translate(m.x*cell,m.y*cell);rotate(t+m.ph);ellipse(0,0,cell*spec.size*2*m.r,cell*spec.size*m.r);pop();}
    else ellipse(m.x*cell,m.y*cell,cell*spec.size*m.r*2,cell*spec.size*m.r*2);
  }
}
// Daylight through leaves: a few soft patches of light drifting slowly over the ground.
function drawEscapeDapple(g,cell){
  if(!escapeLightingFull()||!drawingContext.createRadialGradient)return;const place=escapePlace?.(g.level);if(!place||!ESCAPE_ATMO_DAPPLE.has(place.key)||g.level.dark||g.level.explore)return;
  const ctx=drawingContext,t=g.elapsed,W=g.width,H=g.height;ctx.save();ctx.globalCompositeOperation='soft-light';
  for(let i=0;i<6;i++){const x=((ESCAPE_ATMO_HASH(i,1)*W+t*.06*(.5+ESCAPE_ATMO_HASH(i,2)))%(W+3)-1.5)*cell,y=(ESCAPE_ATMO_HASH(i,3)*H+Math.sin(t*.2+i)*.5)*cell,r=cell*(1.4+ESCAPE_ATMO_HASH(i,4)*1.4);
    const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'rgba(255,240,190,.28)');grad.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);}
  ctx.restore();
}
// Wet floors in a storm: a few glints that catch the light, and a sheen when lightning flashes.
function drawEscapeWet(g,cell,view){
  if(!escapeLightingFull()||!(g.level.storm||escapeAtmoTheme(g)==='storm'))return;const t=g.elapsed,flash=g.elapsed<g.flashUntil?(g.flashUntil-g.elapsed)/.4:0;noStroke();
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){if(!g.floor(x,y)||!['.','N','M'].includes(g.grid[y][x])||view.follow&&!g.visibleTile(x,y))continue;
    const r=ESCAPE_ATMO_HASH(x,y,50);if(r>.35)continue;const glint=Math.max(0,Math.sin(t*.8+r*40))**8;
    fill(200,220,255,20+glint*50+flash*90);ellipse((x+.3+.4*ESCAPE_ATMO_HASH(x,y,51))*cell,(y+.3+.4*ESCAPE_ATMO_HASH(x,y,52))*cell,cell*.22,cell*.07);}
}
// Swimming: rings spread from Sally while she moves through water. Breath: small clouds in the
// cold, from Sally and from snow foxes. Both use the run's particle pool.
function tickEscapeAtmo(g){
  if(typeof EscapeFeel==='undefined'||!escapeLightingFull())return;const p=g.player,t=escapeFxClock,a=Math.atan2(p.facing?.y??-1,p.facing?.x??0);
  // Brushing past a hedge shakes a leaf or two loose, with the faintest rustle.
  if(p.moving&&t-(escapeAtmo.brushAt||0)>.3&&typeof escapeTerrainSet==='function'&&escapeTerrainSet(g).wall==='hedge'){const x=Math.floor(p.x),y=Math.floor(p.y);
    const side=[[1,0],[-1,0],[0,-1],[0,1]].find(([dx,dy])=>['#','B'].includes(g.grid[y+dy]?.[x+dx])&&Math.abs((dx?p.x-(x+.5):p.y-(y+.5))*2-(dx||dy))<.9);
    if(side){escapeAtmo.brushAt=t;const lx=p.x+side[0]*.45,ly=p.y+side[1]*.45;escapeFx.add('leaf',lx,ly,{t,life:.9,size:.09,vx:-side[0]*.5+(Math.random()-.5)*.6,vy:.35+Math.random()*.3,angle:Math.random()*6,spin:(Math.random()-.5)*8,color:[86,140,72]});
      if(Math.random()<.35&&typeof escapeSound==='function')escapeSound('rustle',{gain:.22});}}
  if(p.swimming&&p.moving&&t-escapeAtmo.rippleAt>.32){escapeAtmo.rippleAt=t;escapeFx.add('ripple',p.x,p.y,{t,life:1.3,size:.25});}
  const cold=g.cold?.has?.(Math.floor(p.x)+','+Math.floor(p.y))||escapeAtmoTheme(g)==='frost';
  if(cold&&t-escapeAtmo.breathAt>(p.sprinting?.7:1.6)){escapeAtmo.breathAt=t;escapeFx.add('breath',p.x+Math.cos(a)*.32,p.y+Math.sin(a)*.32,{t,life:1.1,size:p.sprinting?.24:.16,vx:Math.cos(a)*.3,vy:Math.sin(a)*.3-.12});
    for(const h of g.hunters)if(h.kind==='fox'&&g.visibleTile(Math.floor(h.x),Math.floor(h.y)))escapeFx.add('breath',h.x+Math.cos(h.facing)*.35,h.y+Math.sin(h.facing)*.35,{t,life:1,size:.18,vx:Math.cos(h.facing)*.25,vy:Math.sin(h.facing)*.25-.1});}
}
function drawEscapeAtmoParticle(p,cell,age,k){
  if(p.kind==='ripple'){const f=age/p.life;noFill();stroke(220,245,255,120*(1-f));strokeWeight(Math.max(1,cell*.03));ellipse(p.x*cell,p.y*cell,cell*(p.size+f*1.6),cell*(p.size+f*1.6)*.62);return true;}
  if(p.kind==='breath'){noStroke();const s=cell*p.size*(1+age*1.6);for(const [f,a] of [[1.6,18],[1,30],[.55,34]]){fill(240,248,255,a*k);ellipse(p.x*cell,p.y*cell,s*f,s*f*.8);}return true;}
  return false;
}
// A creature at rest breathes: a slow swell, barely there, so still things still read as alive.
const ESCAPE_ATMO_BREATHERS=new Set(['fox','toad','spider','scorpion','beetle','boogoo','gecko','crab','echofrog','chameleon','mimic','cricket','mantis','heron','flytrap']);
function escapeBreathe(g,h,i,cell){
  if(!ESCAPE_ATMO_BREATHERS.has(h.kind))return false;const last=escapeAtmo.lastMoved.get(h),still=last!==undefined&&Math.abs(h.distanceMoved-last)<1e-4;escapeAtmo.lastMoved.set(h,h.distanceMoved);
  if(!still||!escapeLightingFull())return false;const s=1+.03*Math.sin(g.elapsed*2+i*1.7);
  push();translate(h.x*cell,h.y*cell);scale(s,1+(s-1)*.5);translate(-h.x*cell,-h.y*cell);return true;
}

// Reeds along the banks in the wet places: clumps of stalks with seed heads that sway, and part
// round Sally (and anything else) as she pushes through.
const ESCAPE_ATMO_REEDS=new Set(['river','marsh','lantern','tide','coast','secret:mossy-well','secret:bestiary-grove']);
function drawEscapeReeds(g,cell,view){
  if(!escapeLightingFull())return;const theme=escapeAtmoTheme(g);if(!ESCAPE_ATMO_REEDS.has(theme))return;
  const key=g.level.id+'|reeds';if(escapeAtmo.reedKey!==key){escapeAtmo.reedKey=key;const busy=typeof escapeCritterBusy==='function'?escapeCritterBusy(g):new Set(),list=[];
    for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){if(!['.','L'].includes(g.grid[y][x])||busy.has(x+','+y)||ESCAPE_ATMO_HASH(x,y,70)>.55)continue;
      const wet=[[1,0],[-1,0],[0,1],[0,-1]].find(([dx,dy])=>g.grid[y+dy]?.[x+dx]==='U');if(wet)list.push({x:x+.5+wet[0]*.34,y:y+.5+wet[1]*.34,n:4+Math.floor(ESCAPE_ATMO_HASH(x,y,71)*3),seed:x*31+y});}
    escapeAtmo.reeds=list;}
  const t=g.elapsed,movers=[g.player,...g.hunters];strokeCap?.(ROUND);
  for(const r of escapeAtmo.reeds){if(view.follow&&!g.visibleTile(Math.floor(r.x),Math.floor(r.y)))continue;
    for(let i=0;i<r.n;i++){const bx=r.x+(ESCAPE_ATMO_HASH(r.seed,i,72)-.5)*.5,by=r.y+(ESCAPE_ATMO_HASH(r.seed,i,73)-.5)*.3,len=.5+ESCAPE_ATMO_HASH(r.seed,i,74)*.3;
      let lean=Math.sin(t*1.1+bx*.8+i)*.1;for(const m of movers){const dx=bx-m.x,d=Math.hypot(dx,by-m.y);if(d<.8)lean+=(.8-d)/.8*1.1*Math.sign(dx||1);}
      const tx=(bx+Math.sin(lean)*len)*cell,ty=(by-Math.cos(lean)*len)*cell;stroke(96,138,70,200);strokeWeight(Math.max(1,cell*.035));line(bx*cell,by*cell,tx,ty);
      if(i%2===0){stroke(116,82,48,220);strokeWeight(Math.max(1.5,cell*.07));line(tx,ty,(bx+Math.sin(lean)*(len-.12))*cell,(by-Math.cos(lean)*(len-.12))*cell);}}}
  noStroke();
}
// Cloud shadows drifting slowly over the open-sky places in daylight.
const ESCAPE_ATMO_SKY=new Set(['meadow','garden','orchard','river','desert','coast','tide','rooftops','home','finale','ruins','quarry','frost','secret:star-garden','secret:cloud-nest']);
function drawEscapeCloudShadows(g,cell,mood){
  if(!escapeLightingFull()||!drawingContext.createRadialGradient||g.level.dark||g.level.explore||mood?.night||!ESCAPE_ATMO_SKY.has(escapeAtmoTheme(g)))return;
  const ctx=drawingContext,t=g.elapsed,W=g.width,H=g.height;ctx.save();
  for(let i=0;i<3;i++){const span=W+8,x=((ESCAPE_ATMO_HASH(i,5)*span+t*(.18+ESCAPE_ATMO_HASH(i,6)*.12))%span-4)*cell,y=(ESCAPE_ATMO_HASH(i,7)*H+Math.sin(t*.05+i)*1.5)*cell,r=cell*(3+ESCAPE_ATMO_HASH(i,8)*2.5);
    const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'rgba(6,10,24,.16)');grad.addColorStop(.6,'rgba(6,10,24,.08)');grad.addColorStop(1,'rgba(6,10,24,0)');ctx.fillStyle=grad;
    ctx.save();ctx.translate(x,y);ctx.scale(1.6,1);ctx.translate(-x,-y);ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
  ctx.restore();
}
