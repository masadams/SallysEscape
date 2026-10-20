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
 const busy=escapeWorldBusy(w);for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(w.areaAt({x,y}).id!=='spring'||w.grid[y]?.[x]!=='.'||busy.has(x+','+y))continue;const hash=(x*29+y*13)%31,px=(x+.5)*c,py=(y+.5)*c;d.noStroke();
  if(hash===0){d.fill(90,70,52);d.rect(px-c*.05,py-c*.1,c*.1,c*.35);for(const [dx,dy,r,col]of[[0,-.25,.6,[232,168,194]],[-.2,-.12,.38,[244,196,214]],[.2,-.14,.4,[226,150,182]]]){d.fill(...col);d.ellipse(px+dx*c,py+dy*c,c*r,c*r*.9);}}
  else if(hash===7||hash===19){d.fill(84,132,70);d.ellipse(px,py,c*.5,c*.3);for(const [dx,col]of[[-.12,[240,120,150]],[0,[252,214,96]],[.12,[200,150,236]]]){d.fill(...col);d.ellipse(px+dx*c,py-c*.05,c*.1,c*.1);}}
  else if(hash===11){d.fill(110,96,74,90);d.ellipse(px,py+c*.1,c*.5,c*.18);}}
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
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=55.5+Math.cos(a)*3.4,y=55.5+Math.sin(a)*2.6;if(!near(x,y))continue;const on=i<count;stroke(84,66,48);strokeWeight(c*.06);line(x*c,(y+.3)*c,x*c,(y-.4)*c);noStroke();fill(...(on?[250,196,208]:[120,112,108]));ellipse(x*c,(y-.5)*c,c*.32,c*.34);if(on&&escapeLightingFull())seasonLightPool(x*c,(y-.5)*c,c*1.4,'255,206,214',.2);}
 // The little waterwheel by the pond, still until the last token.
 if(near(61,55)){push();translate(61*c,55*c);rotate(count===8?t*.5:0);stroke(120,90,58);strokeWeight(c*.11);noFill();ellipse(0,0,c*1.5,c*1.5);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(0,0,Math.cos(a)*c*.75,Math.sin(a)*c*.75);}pop();}
 if(!moving)return;
 const n=typeof isTvDevice==='function'&&isTvDevice()?14:(seasonOverview?20:40);
 for(let i=0;i<n;i++){const x=43+((i*5.73+t*.18)%25),y=45+((i*3.17+t*.28)%21);if(!near(x,y,1))continue;push();translate(x*c,y*c);rotate(Math.sin(t*.7+i)*1.2);noStroke();fill(246,190+i%3*14,210,150);ellipse(0,0,c*.12,c*.07);pop();}
}
