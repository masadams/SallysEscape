// Sunshore Cove's look: a warm beach, rock pools and a little harbour. Scenery only; collision,
// sight and every warning stay in the engine, and each creature keeps its campaign body and tells.
function summerPalette(l){
  const t=l.seasonalTheme;
  return t==='summer-sunset'?[[92,70,62],[128,84,64],[250,170,110]]:t==='summer-lighthouse'?[[70,66,72],[110,92,84],[246,206,128]]:t==='summer-harbour'||t==='summer-boatshed'?[[118,98,74],[96,70,50],[238,196,110]]:t==='summer-tide'||t==='summer-pools'?[[150,138,104],[92,104,96],[240,214,150]]:t==='summer-lagoon'?[[112,128,88],[78,104,72],[236,214,130]]:[[176,150,104],[126,98,66],[246,212,128]];
}
let summerSceneryCache=null,summerMotionQuery;
function drawSummerScenery(g,c){
  // Static props are painted once per run and cell size, never per frame.
  let cached=summerSceneryCache;if(!cached||cached.game!==g||cached.cell!==c){cached?.image.remove?.();const art=createGraphics(Math.ceil(g.width*c),Math.ceil(g.height*c));art.pixelDensity(1);art.clear();
    for(const p of g.level.props||[]){art.push();art.translate((p.at[0]+.5)*c,(p.at[1]+.5)*c);art.noStroke();drawSummerProp(art,p.kind,c);art.pop();}
    cached={game:g,cell:c,image:art};summerSceneryCache=cached;
  }image(cached.image,0,0);
  summerMotionQuery??=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
  // Lantern props glow; sun glints sparkle on the water with Full lighting (fewer on TV boxes), still for reduced motion.
  for(const p of g.level.props||[])if(p.kind==='harbourlantern'){noStroke();fill(255,214,150,50);ellipse((p.at[0]+.5)*c,(p.at[1]+.3)*c,c*1.3,c*1.3);}
  if(escapeLightingFull()&&!summerMotionQuery.matches&&g.level.water?.length){const n=typeof isTvDevice==='function'&&isTvDevice()?6:16,w=g.level.water;for(let i=0;i<n;i++){const [x,y]=w[(i*7919)%w.length],a=Math.max(0,Math.sin(g.elapsed*1.6+i*2.3));if(a<.4)continue;noStroke();fill(255,246,214,120*a);ellipse((x+.2+((i*.37)%.6))*c,(y+.3+((i*.53)%.4))*c,c*.14*a,c*.05);}}
}
// One prop at the origin, shared by the escapes, the builder and the menu keepsakes.
function drawSummerProp(art,kind,c){
  if(kind==='parasol'){art.fill(0,0,0,40);art.ellipse(c*.1,c*.3,c*.9,c*.26);art.stroke(120,96,70);art.strokeWeight(c*.05);art.line(0,c*.3,0,-c*.2);art.noStroke();
    for(let i=0;i<6;i++){art.fill(...(i%2?[250,246,232]:[232,96,82]));art.arc(0,-c*.2,c*.86,c*.6,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6,PIE);}art.fill(240,200,90);art.ellipse(0,-c*.48,c*.08,c*.08);}
  else if(kind==='sandcastle'){art.fill(0,0,0,36);art.ellipse(0,c*.26,c*.7,c*.16);art.fill(222,190,128);art.rect(-c*.3,-c*.02,c*.6,c*.28,c*.03);art.rect(-c*.3,-c*.2,c*.16,c*.2);art.rect(c*.14,-c*.2,c*.16,c*.2);art.rect(-c*.08,-c*.3,c*.16,c*.3);
    art.fill(196,160,100);art.rect(-c*.05,c*.1,c*.1,c*.16,c*.05,c*.05,0,0);art.stroke(120,96,70);art.strokeWeight(c*.025);art.line(0,-c*.3,0,-c*.46);art.noStroke();art.fill(232,96,82);art.triangle(0,-c*.46,c*.14,-c*.41,0,-c*.36);}
  else if(kind==='buoy'){art.fill(0,0,0,40);art.ellipse(0,c*.26,c*.5,c*.14);art.fill(232,96,82);art.ellipse(0,0,c*.46,c*.5);art.fill(250,246,232);art.rect(-c*.23,-c*.06,c*.46,c*.12);art.fill(90,80,74);art.rect(-c*.03,-c*.4,c*.06,c*.16);}
  else if(kind==='crate'){art.fill(0,0,0,40);art.ellipse(c*.04,c*.3,c*.7,c*.18);art.fill(160,118,72);art.rect(-c*.3,-c*.26,c*.6,c*.52,c*.03);art.stroke(118,84,50);art.strokeWeight(c*.04);art.noFill();art.rect(-c*.3,-c*.26,c*.6,c*.52,c*.03);art.line(-c*.3,-c*.26,c*.3,c*.26);art.noStroke();art.fill(110,170,190);art.ellipse(-c*.1,-c*.3,c*.14,c*.06);art.ellipse(c*.08,-c*.31,c*.12,c*.05);}
  else if(kind==='bunting'){art.stroke(120,96,70);art.strokeWeight(c*.03);art.noFill();art.arc(0,-c*.3,c*1,c*.3,0,Math.PI);art.noStroke();const cols=[[232,96,82],[250,214,96],[84,178,170],[250,246,232]];for(let i=0;i<5;i++){const x=-c*.4+i*c*.2,y=-c*.3+Math.sin((i+.5)/5*Math.PI)*c*.15;art.fill(...cols[i%4]);art.triangle(x-c*.07,y,x+c*.07,y,x,y+c*.17);}}
  else if(kind==='harbourlantern'){art.stroke(84,66,48);art.strokeWeight(c*.05);art.line(0,c*.3,0,-c*.3);art.noStroke();art.fill(250,214,150);art.rect(-c*.13,-c*.38,c*.26,c*.3,c*.05);art.fill(255,240,200);art.rect(-c*.07,-c*.32,c*.14,c*.18,c*.03);art.fill(84,66,48);art.rect(-c*.16,-c*.42,c*.32,c*.06,c*.02);}
  else if(kind==='lighthouse'){art.fill(0,0,0,40);art.ellipse(0,c*.34,c*.7,c*.18);for(let i=0;i<4;i++){art.fill(...(i%2?[250,246,232]:[220,82,70]));const y=c*.3-i*c*.18,w=c*(.44-i*.05);art.quad(-w/2,y,w/2,y,w/2-c*.025,y-c*.18,-w/2+c*.025,y-c*.18);}art.fill(250,226,140);art.rect(-c*.1,-c*.56,c*.2,c*.14,c*.03);art.fill(92,80,80);art.triangle(-c*.14,-c*.56,c*.14,-c*.56,0,-c*.7);}
  else if(kind==='rowboat'){art.fill(0,0,0,36);art.ellipse(0,c*.2,c*.9,c*.22);art.fill(120,170,190);art.arc(0,0,c*.9,c*.5,0,Math.PI,CHORD);art.fill(250,246,232);art.rect(-c*.45,-c*.04,c*.9,c*.07);art.fill(160,118,72);art.rect(-c*.05,-c*.04,c*.1,c*.2);}
}
function clearSummerScenery(){summerSceneryCache?.image.remove?.();summerSceneryCache=null;}
// Summer costumes. Each creature keeps its campaign body, collision, eyes and tells; the costume
// recolours the serpent and adds coastal touches on top of the others. The gull keeps the magpie's
// perch, sight cone and theft, drawn as a white gull with a yellow bill.
const SUMMER_SNAKE={body:[214,176,96],hot:[236,196,104],edge:[132,100,52],saddle:[168,124,62],hotSaddle:[190,140,70],head:[222,186,108],hotHead:[244,206,118],band:[96,64,40]};
function drawSummerCreature(h,model,c,g){
 if(!EscapeSeasons.summerCreatures[h.kind])return false;
 const t=g.elapsed;
 if(h.kind==='snake'||h.kind==='sea-snake'){if(!model?.joints)return true;drawEscapeSnake(model,c,h.state,h.kind==='sea-snake',false,h.kind==='snake'?SUMMER_SNAKE:null);return true;}
 if(h.kind==='crab')drawEscapeCrab(h,c,t);
 else if(h.kind==='eel')drawEscapeEel(h,c,t);
 else if(h.kind==='scorpion')drawEscapeScorpion(h,c,t);
 else if(h.kind==='heron')drawEscapeHeron(h,c,t);
 else if(h.kind==='dragonfly')drawEscapeDragonfly(h,c,t);
 else if(h.kind==='fish')drawEscapeFish(h,c,t);
 // Coastal touches, in the creature's own facing.
 push();translate(h.x*c,h.y*c);rotate(h.facing||0);noStroke();
 if(h.kind==='crab'&&!['shell','hide','return'].includes(h.state)){fill(240,120,90);for(const s of[-1,1])ellipse(c*.26,s*c*.2,c*.12,c*.1);}
 else if(h.kind==='crab'){fill(250,236,206,170);for(let i=0;i<3;i++)ellipse(-c*.04+i*c*.06,-c*.04+i*c*.03,c*.05,c*.05);}
 else if(h.kind==='eel'&&h.state!=='buried'){fill(84,200,190,170);ellipse(c*.1,0,c*.3,c*.08);}
 else if(h.kind==='scorpion'){fill(214,160,80,190);ellipse(0,0,c*.26,c*.18);}
 else if(h.kind==='dragonfly'){fill(84,178,200,120);for(const s of[-1,1])ellipse(-c*.02,s*c*.16,c*.12,c*.26);fill(214,140,80);ellipse(c*.04,0,c*.08,c*.08);}
 else if(h.kind==='fish'){fill(240,150,90,220);triangle(-c*.05,0,c*.12,0,c*.02,-c*.2);}
 else if(h.kind==='heron'){fill(246,240,226,140);ellipse(-c*.1,0,c*.3,c*.22);}
 pop();return true;
}
function drawSummerGull(h,c,g){
 drawEscapeMagpie(h,c,g);
 // Paint over the magpie's dark coat: white body, grey wings, yellow bill (the shape and perch stay).
 const flying=['fly','return','grab'].includes(h.state),bob=flying?Math.sin(g.elapsed*14)*c*.04:0;
 push();translate(h.x*c,h.y*c-c*(flying?.25:.1)+bob);rotate(h.facing||0);noStroke();
 fill(246,244,236);ellipse(0,0,c*.42,c*.28);fill(170,178,186);for(const s of[-1,1])ellipse(-c*.04,s*c*(flying?.24:.11),c*(flying?.3:.24),c*(flying?.14:.1));
 fill(250,250,246);ellipse(c*.18,0,c*.2,c*.18);fill(30,30,34);ellipse(c*.22,-c*.05,c*.04,c*.04);ellipse(c*.22,c*.05,c*.04,c*.04);fill(244,196,70);triangle(c*.26,-c*.03,c*.26,c*.03,c*.38,0);fill(220,90,70);ellipse(c*.33,c*.01,c*.03,c*.025);
 pop();
}
// Sunshore Cove on the seasonal world map: a lighthouse whose lamp gathers one lens piece per escape,
// a lantern line along the harbour, and a little sailboat once all eight are home.
function paintSummerWorldDetails(d,w,c,x1,x2,y1,y2){
 paintSummerShore(d,w,c,x1,x2,y1,y2);
 const busy=escapeWorldBusy(w);for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(w.areaAt({x,y}).id!=='summer'||w.grid[y]?.[x]!=='.'||busy.has(x+','+y)||x>=27&&y<=49||x===26&&y>=63)continue;const hash=(x*29+y*13)%31,px=(x+.5)*c,py=(y+.5)*c;d.noStroke();
  if(hash===0&&(x+y)%3===0){d.push();d.translate(px,py);drawSummerProp(d,'parasol',c);d.pop();}
  else if(hash===7||hash===19){d.fill(236,214,170);for(const [dx,dy]of[[-.12,.05],[.1,-.04],[.02,.12]])d.ellipse(px+dx*c,py+dy*c,c*.1,c*.08);}
  else if(hash===11){d.fill(120,150,90,150);for(const a of[-.4,0,.4])d.ellipse(px+Math.sin(a)*c*.12,py-c*.08,c*.06,c*.3);}}
}
// Fixed seaside pieces, baked into the terrain chunks: striped beach huts, the pier and the kite lawn.
function paintSummerShore(d,w,c,x1,x2,y1,y2){
 const inside=(x,y,r=3)=>x>=x1-r&&x<=x2+r&&y>=y1-r&&y<=y2+r;d.noStroke();
 if(inside(11,45)){[[9.1,[214,84,74]],[10.75,[70,140,190]],[12.4,[236,186,70]]].forEach(([x,col])=>{d.fill(60,50,40,60);d.ellipse((x+.75)*c,46.15*c,c*1.7,c*.4);d.fill(250,246,236);d.rect(x*c,44.9*c,c*1.5,c*1.1,c*.04);d.fill(...col);for(let k=0;k<3;k++)d.rect((x+.08+k*.5)*c,44.9*c,c*.22,c*1.1);d.fill(col[0]*.7,col[1]*.7,col[2]*.7);d.triangle((x-.1)*c,45*c,(x+.75)*c,44.35*c,(x+1.6)*c,45*c);d.fill(120,88,60);d.rect((x+.55)*c,45.45*c,c*.4,c*.55,c*.03);});}
 if(inside(26,64)){d.fill(40,70,80,70);d.rect(25.9*c,63.95*c,c*1.3,c*2.1);d.fill(166,124,82);d.rect(25.85*c,63.85*c,c*1.3,c*2.15);d.stroke(120,86,56);d.strokeWeight(c*.03);for(let y=64;y<66;y+=.22)d.line(25.85*c,y*c,27.15*c,y*c);d.noStroke();d.fill(98,70,46);for(const [x,y]of [[25.85,64.4],[27.15,64.4],[25.85,65.4],[27.15,65.4]])d.ellipse(x*c,y*c,c*.16,c*.16);}
 const k=w.kiteLawn;if(k&&inside((k.x1+k.x2)/2,(k.y1+k.y2)/2,5)){d.fill(132,170,96,170);d.ellipse((k.x1+k.x2+1)/2*c,(k.y1+k.y2+1)/2*c,(k.x2-k.x1+1.6)*c,(k.y2-k.y1+1.4)*c);d.fill(150,188,108,150);d.ellipse((k.x1+k.x2+1)/2*c,(k.y1+k.y2+.6)/2*c,(k.x2-k.x1)*c,(k.y2-k.y1)*c*.8);
  d.stroke(98,140,72);d.strokeWeight(c*.03);for(let i=0;i<26;i++){const x=k.x1+.3+((i*1.37)%(k.x2-k.x1+.4)),y=k.y1+.3+((i*.83)%(k.y2-k.y1+.4));d.line(x*c,y*c,(x-.05)*c,(y-.2)*c);d.line(x*c,y*c,(x+.06)*c,(y-.18)*c);}
  d.noStroke();for(const [x,y]of SUMMER_KITES)d.fill(110,84,58),d.rect((x-.04)*c,(y-.1)*c,c*.08,c*.2);}
}
// Kites on the lawn: anchor, colours, and how far up and across each one flies.
const SUMMER_KITES=[[29,47.6,[226,84,92],[250,214,96]],[30.8,46.4,[70,150,206],[250,250,244]],[31.7,48.2,[246,180,60],[214,84,74]]];
function drawSummerWorld(w,c,near,save){
 if(!w.areaOpen('summer')||!near(20,55,18))return;
 summerMotionQuery??=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
 const moving=escapeLightingFull()&&!summerMotionQuery.matches,t=moving?w.elapsed:0,count=save.cleared('summer');
 // The lighthouse: its lamp brightens with each lens piece; the beam sweeps slowly once all eight are home.
 if(near(18.5,55,5)){noStroke();fill(40,90,100,80);ellipse(18.6*c,55.9*c,c*2.4,c*1.1);fill(124,116,104);ellipse(18.5*c,55.75*c,c*2,c*.95);fill(150,142,128);ellipse(18.3*c,55.6*c,c*1.4,c*.6);fill(255,255,255,moving?120+Math.sin(t*2)*60:120);for(const a of[0,2.1,4.2])ellipse((18.5+Math.cos(a+t*.4)*1.05)*c,(55.8+Math.sin(a+t*.4)*.5)*c,c*.22,c*.07);
  push();translate(18.5*c,55.6*c);drawSummerProp(globalThis,'lighthouse',c*2.4);pop();
  noStroke();fill(...(count?[255,226,140]:[120,112,108]),count?120+count*16:200);ellipse(18.5*c,54.15*c,c*.42,c*.3);
  if(count===8){seasonLightPool(18.5*c,54.2*c,c*3,'255,226,150',.22);if(moving){const a=t*.5;fill(255,236,180,34);triangle(18.5*c,54.2*c,(18.5+Math.cos(a-.12)*5)*c,(54.2+Math.sin(a-.12)*5)*c,(18.5+Math.cos(a+.12)*5)*c,(54.2+Math.sin(a+.12)*5)*c);}}}
 // Harbour lanterns along the shore, one lit per lens piece.
 for(let i=0;i<8;i++){const x=10+i*2,y=63.75;if(!near(x,y))continue;const on=i<count;stroke(84,66,48);strokeWeight(c*.06);line(x*c,(y+.3)*c,x*c,(y-.4)*c);noStroke();fill(...(on?[250,214,150]:[120,112,108]));rect((x-.15)*c,(y-.7)*c,c*.3,c*.32,c*.06);if(on&&escapeLightingFull())seasonLightPool(x*c,(y-.55)*c,c*1.4,'255,214,150',.2);}
 // The little sailboat, moored once every escape is done; it bobs unless motion is reduced.
 if(count===8&&near(27.6,64.9)){push();translate(27.6*c,(64.9+Math.sin(t*1.2)*.05)*c);drawSummerProp(globalThis,'rowboat',c*1.3);stroke(120,96,70);strokeWeight(c*.05);line(0,-c*.05,0,-c*.9);noStroke();fill(250,246,232);triangle(c*.03,-c*.88,c*.03,-c*.15,c*.5,-c*.2);pop();}
 // Waves run in along the south shore; kites fly over the lawn, tugging on their strings.
 if(near(20,64.5,14)){noFill();for(let k=0;k<3;k++){const f=moving?((t*.18+k/3)%1):k/3;stroke(255,255,255,150*(1-f));strokeWeight(c*.05);beginShape();for(let x=8;x<=33;x+=.5)vertex(x*c,(63.98+f*1.6+Math.sin(x*1.3+t*1.1+k)*.06)*c);endShape();}}
 for(const [ax,ay,a,b]of SUMMER_KITES){const sway=moving?Math.sin(t*.7+ax)*.5:0,kx=ax-1.4+sway,ky=ay-3.2+(moving?Math.sin(t*1.1+ay)*.25:0);if(!near(kx,ky,4))continue;
  noFill();stroke(250,250,240,170);strokeWeight(c*.015);bezier(ax*c,ay*c,(ax-.3)*c,(ay-1.2)*c,(kx+.5)*c,(ky+1.4)*c,kx*c,(ky+.35)*c);
  push();translate(kx*c,ky*c);rotate(moving?Math.sin(t*1.3+ax)*.18:0);noStroke();fill(0,0,0,30);quad(c*.08,-c*.3,c*.33,c*.06,c*.08,c*.5,-c*.17,c*.06);fill(...a);quad(0,-c*.38,c*.25,0,0,c*.42,-c*.25,0);fill(...b);triangle(0,-c*.38,c*.25,0,0,0);triangle(0,c*.42,-c*.25,0,0,0);
  stroke(...b);strokeWeight(c*.02);noFill();beginShape();for(let i=0;i<7;i++)vertex(Math.sin(t*3+i*.9+ax)*c*.08*(moving?1:.3),(.42+i*.14)*c);endShape();noStroke();fill(...a);for(let i=1;i<6;i+=2)ellipse(Math.sin(t*3+i*.9+ax)*c*.08*(moving?1:.3),(.42+i*.14)*c,c*.08,c*.05);pop();}
}
