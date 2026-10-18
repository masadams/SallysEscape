// Lighting design, as data: a mood for every area (a colour grade, a time-of-day wash and a
// vignette), and the light sources that glow in the dark (glow plants and mushrooms, moths,
// anglers' lures, glow bugs, warm stones, vents, an open hatch). Purely visual: what creatures
// see is decided by the engine, never by this. The scene draws it (escapescene.js).
(function(root){
  // grade: [r,g,b,alpha] blended soft-light over the whole view; wash: a gradient from one side
  // ({from:'top'|'bottom'|'left', color:[r,g,b], alpha}); vignette: how dark the edges go (0–1);
  // night: light sources glow brighter, as they do in the dark levels; shafts: [r,g,b] light
  // shafts slanting down through a canopy or cave roof.
  const MOODS={
    meadow:{grade:[255,236,200,.16],wash:{from:'top',color:[255,244,214],alpha:.14},vignette:.22},
    garden:{grade:[255,240,210,.14],wash:{from:'left',color:[255,236,200],alpha:.12},vignette:.25},
    river:{grade:[200,235,255,.14],wash:{from:'top',color:[220,240,255],alpha:.12},vignette:.25},
    ruins:{grade:[235,215,180,.16],vignette:.35},
    quarry:{grade:[210,205,195,.16],wash:{from:'top',color:[240,230,210],alpha:.1},vignette:.4},
    desert:{grade:[255,228,170,.22],wash:{from:'top',color:[255,240,200],alpha:.18},vignette:.15},
    marsh:{grade:[130,195,185,.22],wash:{from:'bottom',color:[170,220,205],alpha:.16},vignette:.45},
    jungle:{grade:[170,220,150,.18],shafts:[255,250,210],wash:{from:'top',color:[220,250,190],alpha:.14},vignette:.4},
    glow:{grade:[90,120,200,.22],shafts:[120,200,240],vignette:.5,night:true},
    orchard:{grade:[255,225,190,.15],wash:{from:'left',color:[255,230,190],alpha:.12},vignette:.3},
    coast:{grade:[255,245,220,.16],wash:{from:'top',color:[255,250,230],alpha:.16},vignette:.15},
    hollow:{grade:[150,120,170,.24],vignette:.5,night:true},
    lantern:{grade:[70,90,150,.3],wash:{from:'top',color:[40,50,100],alpha:.18},vignette:.55,night:true},
    rooftops:{grade:[255,225,170,.2],wash:{from:'top',color:[255,238,200],alpha:.16},vignette:.15},
    ants:{grade:[230,190,140,.18],vignette:.38},
    frost:{grade:[180,215,255,.22],wash:{from:'top',color:[230,245,255],alpha:.14},vignette:.3},
    vents:{grade:[255,170,110,.16],wash:{from:'bottom',color:[255,140,60],alpha:.2},vignette:.35},
    grotto:{grade:[120,160,220,.22],shafts:[150,240,230],wash:{from:'bottom',color:[110,220,210],alpha:.12},vignette:.45,night:true},
    storm:{grade:[150,160,180,.24],wash:{from:'top',color:[60,70,90],alpha:.18},vignette:.4},
    tide:{grade:[210,240,240,.14],wash:{from:'top',color:[230,250,250],alpha:.14},vignette:.2},
    home:{grade:[255,200,150,.18],wash:{from:'top',color:[255,190,120],alpha:.16},vignette:.25},
    gilded:{grade:[255,215,120,.2],wash:{from:'top',color:[255,230,160],alpha:.14},vignette:.4},
    finale:{grade:[255,180,110,.24],wash:{from:'top',color:[255,170,100],alpha:.22},vignette:.3},
    'secret:star-garden':{grade:[100,110,190,.28],wash:{from:'top',color:[60,70,140],alpha:.2},vignette:.45,night:true},
    'secret:mossy-well':{grade:[140,190,150,.2],vignette:.5},
    'secret:cloud-nest':{grade:[235,240,255,.18],wash:{from:'top',color:[255,255,255],alpha:.18},vignette:.15},
    'secret:challenge-shrine':{grade:[255,210,170,.2],wash:{from:'top',color:[255,220,180],alpha:.14},vignette:.35},
    'secret:bestiary-grove':{grade:[170,220,160,.18],shafts:[255,250,210],wash:{from:'top',color:[220,250,200],alpha:.12},vignette:.35},
    'secret:ice-cave':{grade:[180,220,255,.24],vignette:.45},
    'secret:sunken-wreck':{grade:[100,150,170,.26],shafts:[170,230,240],wash:{from:'top',color:[150,220,230],alpha:.14},vignette:.45},
    'secret:blind-grove':{grade:[130,140,180,.24],wash:{from:'top',color:[90,100,150],alpha:.16},vignette:.55}
  };
  // The Road Home warms toward sunset as Sally nears the end: step 0 is its first escape.
  function moodFor(key,step=0){
    const base=MOODS[key];if(!base)return null;
    if(key!=='home')return base;const t=Math.max(0,Math.min(1,step/6));
    return {...base,grade:[255,Math.round(200-t*30),Math.round(150-t*50),+(base.grade[3]+t*.08).toFixed(3)],wash:{...base.wash,alpha:+(base.wash.alpha+t*.08).toFixed(3)}};
  }
  // Light sources: {x,y (tiles), r (tiles), color, alpha}. Only what the player can see glows.
  function lightSources(g,clock=g.elapsed){
    const out=[],seen=(x,y)=>!g.level.explore||g.visibleTile(Math.floor(x),Math.floor(y)),add=(x,y,r,color,alpha)=>{if(seen(x,y))out.push({x,y,r,color,alpha});};
    const flicker=(seed,amount=.05)=>1+Math.sin(clock*2.3+seed*1.7)*amount+Math.sin(clock*5.1+seed)*amount*.5;
    for(const [x,y] of g.level.glowPlants||[])add(x+.5,y+.5,1.9*flicker(x+y),[64,229,206],.24);
    for(const l of g.lights||[]){const fade=Math.max(0,Math.min(1,(l.until-clock)/3,(clock-l.born)*4));add(l.x,l.y,l.r*1.15*flicker(l.x),[120,236,214],.3*fade);}
    for(const h of g.hunters||[]){
      if(h.kind==='moth')add(h.x,h.y,2.7*flicker(h.x,.08),[255,214,140],.26);
      if(h.kind==='sentinel')add(h.x,h.y,h.state==='glare'?2:1.3,[170,226,255],h.state==='glare'?.34:.2);
      if(h.kind==='angler'&&h.lure&&h.state==='lurking')add(h.lure.x,h.lure.y,1.4*flicker(h.lure.x,.1),[120,240,220],.3);
    }
    for(const b of g.glowbugs||[])if(!b.caught)add(b.x,b.y,.9*flicker(b.x,.12),[220,255,140],.24);
    let warm=0;for(const key of g.warm||[]){if(warm++>24)break;const [x,y]=key.split(',').map(Number);add(x+.5,y+.5,1.1*flicker(x*3+y,.06),[255,150,70],.16);}
    for(const v of g.vents||[])if(v.active){const [x,y]=v.at;add(x+.5,y+.5,1.3,[255,160,90],.16);}
    if(g.hasKey&&g.treasure>=g.requiredTreasure&&g.exit)add(g.exit.x,g.exit.y,1.7*flicker(7,.06),[255,215,120],.26);
    if(g.level.dark&&g.player)out.push({x:g.player.x,y:g.player.y,r:1.3,color:[255,248,226],alpha:.1});
    return out;
  }
  const api={MOODS,moodFor,lightSources};
  root.EscapeLighting=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
