// Game feel, as data and small rules the scene draws and plays (escapescene.js): what Sally's feet
// sound like on each ground, how much a place echoes, the noise rings that show how far a sound
// carries, the little particles her steps and throws kick up, and the buzz a phone gives on the
// moments that matter. Nothing here changes what creatures see or hear; the engine decides that.
(function(root){
  // The ground under Sally decides her footstep. Gravel is loud (hunters hear it), moss is silent.
  function surface(g,x=g.player.x,y=g.player.y){
    const tx=Math.floor(x),ty=Math.floor(y),tile=g.grid?.[ty]?.[tx],k=tx+','+ty;
    if(tile==='N')return 'gravel';if(tile==='L')return 'leaves';if(tile==='m'||g.moss?.has?.(k))return 'moss';if(tile==='M')return 'mud';const marks=g.feelMarks||(g.feelMarks={vines:new Set((g.level?.vines||[]).map(String)),flats:new Set((g.level?.tideFlats||[]).map(String))});
    if(tile==='T'||marks.vines.has(k))return 'tangle';if(tile==='t'||marks.flats.has(k))return 'wet';
    if(g.cold?.has?.(k))return 'snow';if(g.level?.biome==='desert')return 'sand';return 'floor';
  }
  // Grounds that keep a footprint for a few seconds.
  const PRINTS={snow:[236,246,255],sand:[120,84,44],mud:[52,38,26]};
  // How much each place echoes: caves and wells ring, halls a little, the open air not at all.
  const SPACES={glow:'cave',grotto:'cave',ants:'cave',hollow:'cave',gilded:'cave','secret:mossy-well':'cave','secret:ice-cave':'cave',
    ruins:'hall',quarry:'hall',vents:'hall','secret:sunken-wreck':'hall','secret:challenge-shrine':'hall'};
  const space=(key,level)=>level?.dark?'cave':SPACES[key]||'open';
  // How far a noise carries, in tiles, as the hunters measure it (see the engine's audible checks).
  const RINGS={sprint:6,gravel:3.5,pebble:7};
  // Phone buzzes (milliseconds on, off, on…) for the moments worth feeling.
  const BUZZ={caught:[160,60,90],spotted:[45],tailDrop:[35,45,80],key:[25],won:[30,60,30]};

  // A small pool of particles: dust, leaves, sparks, footprints, noise rings. Old ones are reused,
  // so a long run never grows it.
  class Particles{
    constructor(max=180){this.max=max;this.items=[];}
    add(kind,x,y,o={}){
      const p={kind,x,y,vx:o.vx||0,vy:o.vy||0,born:o.t||0,life:o.life||.6,size:o.size||.2,color:o.color||null,r:o.r||0,angle:o.angle||0,spin:o.spin||0};
      if(this.items.length>=this.max)this.items.shift();this.items.push(p);return p;
    }
    update(t,dt){const keep=[];for(const p of this.items){if(t-p.born>p.life)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.9;p.vy*=.9;p.angle+=p.spin*dt;keep.push(p);}this.items=keep;}
    clear(){this.items=[];}
  }
  // What a footstep leaves: a print on soft ground, a puff of dust when sprinting on dry ground,
  // a leaf or two kicked up from leaves, a noise ring when the step is loud enough to hear.
  function step(fx,g,{t,sprint,alt,rand=Math.random}){
    const p=g.player,ground=surface(g),out=[],side=alt?1:-1,fx0=p.facing?.x??0,fy0=p.facing?.y??-1,heading=Math.atan2(fy0,fx0);
    if(PRINTS[ground])out.push(fx.add('print',p.x-fy0*.12*side,p.y+fx0*.12*side,{t,life:ground==='mud'?5:4,size:.14,color:PRINTS[ground],angle:heading}));
    if(sprint&&!p.swimming&&!['moss','wet','mud'].includes(ground))for(let i=0;i<2;i++)out.push(fx.add('dust',p.x-fx0*.25,p.y-fy0*.25+.2,{t,life:.45,size:.16+rand()*.1,vx:(rand()-.5)*1.2-fx0*.6,vy:(rand()-.5)*.8-fy0*.6-.3,color:ground==='snow'?[236,246,255]:ground==='sand'?[214,178,120]:[176,164,138]}));
    if(ground==='leaves'||ground==='tangle')for(let i=0;i<(sprint?3:1);i++)out.push(fx.add('leaf',p.x,p.y,{t,life:.8,size:.1,vx:(rand()-.5)*1.6,vy:-.6-rand()*.8,angle:rand()*6,spin:(rand()-.5)*8,color:ground==='tangle'?[96,140,70]:[140,170,80]}));
    const ring=p.loud?RINGS.sprint:p.noisy?RINGS.gravel:0;if(ring)out.push(fx.add('ring',p.x,p.y,{t,life:.7,r:ring,color:p.loud?[255,214,150]:[221,195,149]}));
    return out;
  }
  // A pebble landing: a spark and the ring of how far the clack carries.
  function land(fx,at,t,rand=Math.random){
    for(let i=0;i<5;i++){const a=rand()*Math.PI*2;fx.add('spark',at.x,at.y,{t,life:.35,size:.07,vx:Math.cos(a)*2.4,vy:Math.sin(a)*2.4,color:[255,236,180]});}
    fx.add('ring',at.x,at.y,{t,life:.9,r:RINGS.pebble,color:[255,236,180]});
  }
  // A phone buzz for the events worth feeling; nothing on a desk or with no vibration support.
  function buzz(events,nav=typeof navigator!=='undefined'?navigator:null){
    if(!nav?.vibrate)return null;const hit=['caught','tailDrop','spotted','key','won'].find(e=>events.includes(e));
    if(!hit)return null;try{nav.vibrate(BUZZ[hit]);}catch(_){}return hit;
  }
  const api={surface,space,SPACES,PRINTS,RINGS,BUZZ,Particles,step,land,buzz};
  root.EscapeFeel=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
