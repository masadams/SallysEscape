// Blossom Hollow's look: a rain-fed spring garden. Scenery only; collision, sight and every warning
// stay in the engine, and creatures keep their campaign drawings (and tells) until their costumes.
function springPalette(l){
  return l.seasonalTheme==='spring-dusk'?[[44,56,58],[78,104,84],[214,170,190]]:l.seasonalTheme==='spring-pond'?[[52,78,64],[86,120,84],[226,186,200]]:l.seasonalTheme==='spring-shed'?[[64,66,46],[110,96,66],[228,190,150]]:l.seasonalTheme==='spring-glass'?[[58,80,72],[120,150,128],[236,214,222]]:[[56,80,56],[96,134,82],[238,190,206]];
}
let springSceneryCache=null,springMotionQuery;
function drawSpringScenery(g,c){
  // Static props are painted once per run and cell size, never per frame.
  let cached=springSceneryCache;if(!cached||cached.game!==g||cached.cell!==c){cached?.image.remove?.();const art=createGraphics(Math.ceil(g.width*c),Math.ceil(g.height*c));art.pixelDensity(1);art.clear();
    for(const p of g.level.props||[]){const x=(p.at[0]+.5)*c,y=(p.at[1]+.5)*c;art.push();art.translate(x,y);art.noStroke();
      if(p.kind==='blossom'){art.fill(0,0,0,40);art.ellipse(c*.04,c*.3,c*.8,c*.24);art.fill(102,72,50);art.rect(-c*.06,-c*.12,c*.12,c*.42,c*.04);
        for(const [dx,dy,r,col] of [[0,-.3,.62,[236,170,196]],[-.22,-.18,.4,[244,196,214]],[.22,-.2,.42,[226,150,182]],[.04,-.44,.34,[250,214,226]]]){art.fill(...col);art.ellipse(c*dx,c*dy,c*r,c*r*.9);}
        art.fill(255,240,246);for(let i=0;i<7;i++)art.ellipse(c*(Math.sin(i*2.4)*.26),c*(-.3+Math.cos(i*1.7)*.16),c*.06,c*.06);}
      else if(p.kind==='flowerpot'){art.fill(0,0,0,40);art.ellipse(0,c*.24,c*.46,c*.14);art.fill(176,96,62);art.quad(-c*.18,-c*.02,c*.18,-c*.02,c*.13,c*.24,-c*.13,c*.24);art.fill(196,116,78);art.rect(-c*.21,-c*.08,c*.42,c*.09,c*.03);
        art.fill(84,140,72);for(const a of [-.6,0,.6])art.ellipse(Math.sin(a)*c*.14,-c*.16-Math.cos(a)*c*.05,c*.12,c*.2);for(const [dx,col] of [[-.1,[240,120,150]],[.02,[252,214,96]],[.12,[200,150,236]]]){art.fill(...col);art.ellipse(c*dx,-c*.28,c*.12,c*.12);}}
      else if(p.kind==='wateringcan'){art.fill(0,0,0,40);art.ellipse(0,c*.22,c*.5,c*.12);art.fill(98,150,160);art.rect(-c*.18,-c*.08,c*.3,c*.28,c*.05);art.stroke(98,150,160);art.strokeWeight(c*.05);art.line(c*.1,c*.04,c*.3,-c*.14);art.noFill();art.arc(-c*.03,-c*.08,c*.24,c*.2,Math.PI,Math.PI*2);art.noStroke();art.fill(150,196,204);art.ellipse(c*.31,-c*.15,c*.09,c*.06);}
      else if(p.kind==='flowerlantern'){art.stroke(84,66,48);art.strokeWeight(c*.05);art.line(0,c*.3,0,-c*.3);art.noStroke();art.fill(250,196,208);art.ellipse(0,-c*.2,c*.3,c*.32);art.fill(255,236,214);art.ellipse(0,-c*.2,c*.14,c*.16);art.fill(240,150,176);for(let i=0;i<5;i++){const a=i*1.2566;art.ellipse(Math.cos(a)*c*.15,-c*.2+Math.sin(a)*c*.15,c*.1,c*.1);}}
      art.pop();}
    cached={game:g,cell:c,image:art};springSceneryCache=cached;
  }image(cached.image,0,0);
  // Flower lanterns glow softly; petals drift with Full lighting (fewer on TV boxes), and stop for reduced motion.
  for(const p of g.level.props||[])if(p.kind==='flowerlantern'){noStroke();fill(255,214,190,46);ellipse((p.at[0]+.5)*c,(p.at[1]+.3)*c,c*1.3,c*1.3);}
  springMotionQuery??=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
  if(escapeLightingFull()&&!springMotionQuery.matches){const n=typeof isTvDevice==='function'&&isTvDevice()?8:20;for(let i=0;i<n;i++){const x=((i*5.73+g.elapsed*.22)%g.width),y=((i*3.17+g.elapsed*.3)%g.height);if(!g.floor(Math.floor(x),Math.floor(y)))continue;push();translate(x*c,y*c);rotate(Math.sin(g.elapsed*.8+i)*1.2);noStroke();fill(246,190+i%3*14,210,150);ellipse(0,0,c*.11,c*.07);pop();}}
}
function clearSpringScenery(){springSceneryCache?.image.remove?.();springSceneryCache=null;}
