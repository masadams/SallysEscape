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
  // The waterwheel turns slowly (still for reduced motion), like the autumn mill's.
  if(g.level.millWheel){const still=springMotionQuery.matches;push();translate((g.level.millWheel[0]+.5)*c,(g.level.millWheel[1]+.5)*c);rotate(still?0:g.elapsed*.4);stroke(120,90,58);strokeWeight(c*.13);noFill();ellipse(0,0,c*1.7,c*1.7);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(0,0,Math.cos(a)*c*.85,Math.sin(a)*c*.85);}pop();}
  if(escapeLightingFull()&&!springMotionQuery.matches){const n=typeof isTvDevice==='function'&&isTvDevice()?8:20;for(let i=0;i<n;i++){const x=((i*5.73+g.elapsed*.22)%g.width),y=((i*3.17+g.elapsed*.3)%g.height);if(!g.floor(Math.floor(x),Math.floor(y)))continue;push();translate(x*c,y*c);rotate(Math.sin(g.elapsed*.8+i)*1.2);noStroke();fill(246,190+i%3*14,210,150);ellipse(0,0,c*.11,c*.07);pop();}}
}
function clearSpringScenery(){springSceneryCache?.image.remove?.();springSceneryCache=null;}
// Spring costumes. Each creature keeps its campaign body, collision, eyes and tells (red eyes on the
// warning); the costume only recolours the serpent and adds garden touches on top of the others.
const SPRING_SNAKE={body:[118,170,86],hot:[150,200,96],edge:[56,92,44],saddle:[78,128,60],hotSaddle:[96,150,64],head:[132,184,96],hotHead:[164,212,108],band:[246,206,222]};
function drawSpringCreature(h,model,c,g){
 if(!EscapeSeasons.springCreatures[h.kind])return false;
 const t=g.elapsed;
 if(h.kind==='snake'){if(!model?.joints)return true;drawEscapeSnake(model,c,h.state,false,false,SPRING_SNAKE);return true;}
 if(h.kind==='beetle')drawEscapeBeetle(h,c);
 else if(h.kind==='mole')drawEscapeMole(h,c,t);
 else if(['toad','spider'].includes(h.kind))drawEscapeNestMonster(h,c,t);
 else if(h.kind==='mantis')drawEscapeMantis(h,c,t,g.mantisShown(h));
 else if(h.kind==='moth')return false;
 else if(h.kind==='ladybird')return false;
 // Garden touches, in the creature's own facing.
 push();translate(h.x*c,h.y*c);rotate(h.facing||0);noStroke();
 if(h.kind==='beetle'){stroke(112,78,46);strokeWeight(c*.035);for(const s of[-1,1]){line(c*.34,s*c*.06,c*.5,s*c*.18);line(c*.44,s*c*.13,c*.48,s*c*.28);line(c*.47,s*c*.16,c*.58,s*c*.14);}noStroke();fill(110,166,82,200);ellipse(-c*.16,0,c*.18,c*.3);fill(160,206,120,200);ellipse(-c*.16,0,c*.06,c*.22);}
 else if(h.kind==='mole'&&h.state!=='under'&&h.state!=='track'){fill(96,70,42);for(const [dx,dy]of[[-.06,-.05],[.04,-.08],[.1,.02]])ellipse(c*dx,c*dy,c*.06,c*.04);stroke(122,92,56);strokeWeight(c*.025);line(0,-c*.14,-c*.05,-c*.26);line(0,-c*.14,c*.05,-c*.27);noStroke();fill(120,180,90);ellipse(-c*.05,-c*.27,c*.07,c*.05);ellipse(c*.05,-c*.28,c*.07,c*.05);}
 else if(h.kind==='toad'){fill(92,150,86,230);arc(-c*.02,0,c*.44,c*.44,.5,Math.PI*2-.5,PIE);fill(140,196,120,200);ellipse(-c*.08,0,c*.06,c*.2);}
 else if(h.kind==='spider'){fill(226,244,255,210);for(let i=0;i<8;i++){const a=i*.785+.3;ellipse(Math.cos(a)*c*.36,Math.sin(a)*c*.36,c*.05,c*.05);}}
 else if(h.kind==='mantis'&&g.mantisShown(h)){scale(1.45);fill(246,190,210,210);for(const s of[-1,1])ellipse(c*.16,s*c*.1,c*.08,c*.05);fill(250,214,228,190);ellipse(-c*.2,0,c*.12,c*.06);}
 pop();return true;
}
// The spring garden on the seasonal world map: a blossom tree that flowers one cluster per
// flower token, lanterns round it, a waterwheel that turns once all eight are home.
function paintSpringWorldDetails(d,w,c,x1,x2,y1,y2){
 paintSpringGarden(d,c,x1,x2,y1,y2);
 const busy=escapeWorldBusy(w);for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(w.areaAt({x,y}).id!=='spring'||w.grid[y]?.[x]!=='.'||busy.has(x+','+y)||w.lilyPads?.has(x+','+y)||x>=63&&y<=48||x<=46&&y<=47)continue;const hash=(x*29+y*13)%31,px=(x+.5)*c,py=(y+.5)*c;d.noStroke();
  if(hash===0){d.fill(90,70,52);d.rect(px-c*.05,py-c*.1,c*.1,c*.35);for(const [dx,dy,r,col]of[[0,-.25,.6,[232,168,194]],[-.2,-.12,.38,[244,196,214]],[.2,-.14,.4,[226,150,182]]]){d.fill(...col);d.ellipse(px+dx*c,py+dy*c,c*r,c*r*.9);}}
  else if(hash===7||hash===19){d.fill(84,132,70);d.ellipse(px,py,c*.5,c*.3);for(const [dx,col]of[[-.12,[240,120,150]],[0,[252,214,96]],[.12,[200,150,236]]]){d.fill(...col);d.ellipse(px+dx*c,py-c*.05,c*.1,c*.1);}}
  else if(hash===11){d.fill(110,96,74,90);d.ellipse(px,py+c*.1,c*.5,c*.18);}}
}
// Fixed garden buildings, baked into the terrain chunks: a greenhouse, two straw beehives and a picket fence.
function paintSpringGarden(d,c,x1,x2,y1,y2){
 const inside=(x,y,r=3)=>x>=x1-r&&x<=x2+r&&y>=y1-r&&y<=y2+r;d.noStroke();
 if(inside(65.5,45.8)){d.fill(40,60,50,70);d.ellipse(65.5*c,47.1*c,c*4,c*.9);d.fill(206,232,226,220);d.rect(63.85*c,44.75*c,c*3.3,c*2.2,c*.08);d.fill(180,214,206,200);d.rect(63.85*c,44.75*c,c*3.3,c*.9);
  for(const [x,y,col]of [[64.4,46.3,[92,150,86]],[65,46.4,[236,150,176]],[65.8,46.3,[92,150,86]],[66.6,46.4,[248,214,96]]]){d.fill(...col);d.ellipse(x*c,y*c,c*.42,c*.34);}
  d.stroke(250,252,248);d.strokeWeight(c*.05);d.noFill();d.rect(63.85*c,44.75*c,c*3.3,c*2.2,c*.08);for(let x=64.5;x<67;x+=.66)d.line(x*c,44.75*c,x*c,46.95*c);d.line(63.85*c,45.65*c,67.15*c,45.65*c);d.stroke(226,240,236);d.line(63.85*c,45.2*c,67.15*c,45.2*c);
  d.noStroke();d.fill(160,120,84);d.rect(65.25*c,46.25*c,c*.5,c*.7,c*.04);d.fill(255,255,255,90);for(let x=64.1;x<67;x+=.66)d.quad(x*c,44.85*c,(x+.18)*c,44.85*c,(x+.05)*c,45.55*c,(x-.13)*c,45.55*c);}
 if(inside(45,46)){for(const x of[44.5,45.6]){d.fill(40,60,50,70);d.ellipse(x*c,47*c,c*1.1,c*.35);d.fill(120,92,62);d.rect((x-.45)*c,46.6*c,c*.9,c*.16);d.fill(214,176,96);d.arc(x*c,46.65*c,c*.9,c*1.3,Math.PI,Math.PI*2);d.stroke(176,136,66);d.strokeWeight(c*.04);for(const y of[46.2,45.95,45.72])d.line((x-.38+(46.65-y)*.25)*c,y*c,(x+.38-(46.65-y)*.25)*c,y*c);d.noStroke();d.fill(70,48,32);d.ellipse(x*c,46.5*c,c*.16,c*.12);}}
 if(inside(55,45,14)){d.stroke(244,240,228);d.strokeWeight(c*.05);for(let x=47;x<=62;x+=.4){if(x>=53.6&&x<=57.4)continue;d.line(x*c,45.05*c,x*c,45.45*c);}d.strokeWeight(c*.035);d.line(47*c,45.15*c,53.4*c,45.15*c);d.line(57.6*c,45.15*c,62*c,45.15*c);d.line(47*c,45.35*c,53.4*c,45.35*c);d.line(57.6*c,45.35*c,62*c,45.35*c);d.noStroke();}
}
function drawSpringWorld(w,c,near,save){
 if(!w.areaOpen('spring')||!near(55,55,18))return;
 springMotionQuery??=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
 const moving=escapeLightingFull()&&!springMotionQuery.matches,t=moving?w.elapsed:0,count=save.cleared('spring');
 // The blossom tree: bare until the first token, then a cluster for each one home.
 if(near(55,55,5)){noStroke();fill(0,0,0,50);ellipse(55.5*c,56.4*c,c*3.2,c*.9);fill(102,76,54);rect(55.2*c,53.6*c,c*.6,c*2.8,c*.12);stroke(102,76,54);strokeWeight(c*.16);line(55.5*c,54.2*c,54.3*c,53.2*c);line(55.5*c,54*c,56.8*c,53.1*c);noStroke();
  fill(96,132,80,count?110:180);ellipse(55.5*c,52.9*c,c*3.4,c*2.4);
  for(let i=0;i<8;i++){const a=i*2.39996,x=55.5+Math.sin(a)*(.4+i*.12),y=52.9+Math.cos(a)*(.3+i*.08),on=i<count;fill(...(on?[[244,180,204],[250,212,224],[232,150,184]][i%3]:[132,150,120]));ellipse(x*c,y*c,c*(on?.7:.3),c*(on?.6:.26));}
  if(count===8)seasonLightPool(55.5*c,53*c,c*3.2,'255,214,226',.22);}
 // Flower lanterns round the tree, one lit per token.
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=55.5+Math.cos(a)*2.8,y=55.5+Math.sin(a)*2.6;if(!near(x,y))continue;const on=i<count;stroke(84,66,48);strokeWeight(c*.06);line(x*c,(y+.3)*c,x*c,(y-.4)*c);noStroke();fill(...(on?[250,196,208]:[120,112,108]));ellipse(x*c,(y-.5)*c,c*.32,c*.34);if(on&&escapeLightingFull())seasonLightPool(x*c,(y-.5)*c,c*1.4,'255,206,214',.2);}
 // The little waterwheel on the pond's south bank, still until the last token.
 if(near(60.5,58.8)){push();translate(60.5*c,58.8*c);rotate(count===8?t*.5:0);stroke(120,90,58);strokeWeight(c*.11);noFill();ellipse(0,0,c*1.5,c*1.5);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(0,0,Math.cos(a)*c*.75,Math.sin(a)*c*.75);}pop();}
 // Rings spread where Sally stands on a lily pad, and the pads rock gently under her.
 const pk=Math.floor(w.player.x)+','+Math.floor(w.player.y);if(w.lilyPads?.has(pk)){noFill();for(let k=0;k<2;k++){const f=((t*.9+k*.5)%1);stroke(226,246,236,150*(1-f));strokeWeight(c*.03);ellipse(w.player.x*c,(w.player.y+.15)*c,c*(.6+f*1.2),c*(.4+f*.8));}}
 if(!moving)return;
 // Bees drift between the hives and the flowers.
 if(near(45,46,4))for(let i=0;i<(typeof isTvDevice==='function'&&isTvDevice()?3:7);i++){const a=t*(.8+i*.13)+i*2.1,x=45+Math.cos(a)*(1.2+i%3*.5)+Math.sin(t*3.1+i)*.15,y=47.2+Math.sin(a*1.3)*(.9+i%2*.4);noStroke();fill(250,206,72);ellipse(x*c,y*c,c*.09,c*.07);fill(60,44,30);rect((x-.01)*c,(y-.035)*c,c*.02,c*.07);fill(255,255,255,150);ellipse((x-.02)*c,(y-.05)*c,c*.06,c*.04);}
 const n=typeof isTvDevice==='function'&&isTvDevice()?14:(seasonOverview?20:40);
 for(let i=0;i<n;i++){const x=43+((i*5.73+t*.18)%25),y=45+((i*3.17+t*.28)%21);if(!near(x,y,1))continue;push();translate(x*c,y*c);rotate(Math.sin(t*.7+i)*1.2);noStroke();fill(246,190+i%3*14,210,150);ellipse(0,0,c*.12,c*.07);pop();}
}
