// Winter costumes preserve the campaign's warning geometry and collision rules.
function winterPine(d,x,y,c,lit=false){
 d.push();d.translate(x,y);d.noStroke();d.fill(16,36,42,65);d.ellipse(c*.08,c*.35,c*1.3,c*.42);d.fill(104,76,55);d.rect(-c*.08,0,c*.16,c*.6);
 for(const [yy,w,h]of [[.23,1.15,.95],[-.2,.9,.85],[-.58,.65,.75]]){d.fill(36,81,72);d.triangle(0,(yy-h)*c,-w*c*.5,yy*c,w*c*.5,yy*c);d.fill(211,232,235);d.triangle(0,(yy-h)*c,-w*c*.38,(yy-.2)*c,w*c*.38,(yy-.2)*c);d.fill(250,249,233);d.triangle(-c*.02,(yy-h)*c,-w*c*.2,(yy-.28)*c,w*c*.11,(yy-.3)*c);}
 if(lit)for(let i=0;i<7;i++){d.fill(...[[255,210,116],[224,101,102],[127,202,171]][i%3]);d.ellipse(Math.sin(i*2)*c*(.14+i*.035),(-.75+i*.15)*c,c*.08,c*.08);}d.pop();
}
function winterBrazier(d,x,y,c,t=0){d.push();d.translate(x,y);d.noStroke();d.fill(39,51,59);d.rect(-c*.16,0,c*.32,c*.23,c*.04);d.fill(105,100,90);d.ellipse(0,0,c*.55,c*.24);d.fill(225,124,54);d.ellipse(0,-c*.2,c*.28,c*(.44+Math.sin(t*7)*.025));d.fill(255,221,128);d.ellipse(-c*.02,-c*.15,c*.13,c*.28);d.pop();}
function drawWinterWisp(h,c,g){
 if(h.state==='patrol'){noStroke();fill(151,224,249,42);beginShape();vertex(h.x*c,h.y*c);for(let a=-Math.PI/9;a<=Math.PI/9+.001;a+=Math.PI/36){let r=0;for(let d=.2;d<=7;d+=.2){if(!g.clear(h,{x:h.x+Math.cos(h.facing+a)*d,y:h.y+Math.sin(h.facing+a)*d},true))break;r=d;}vertex((h.x+Math.cos(h.facing+a)*r)*c,(h.y+Math.sin(h.facing+a)*r)*c);}endShape(CLOSE);}
 const warn=['glare','swoop'].includes(h.state);push();translate(h.x*c,h.y*c);scale(c);noStroke();fill(148,223,246,35);ellipse(0,0,1.25,1.25);fill(206,242,247);ellipse(0,-.05,.51,.64);fill(250,254,252);ellipse(-.08,-.12,.21,.3);stroke(153,219,237);strokeWeight(.045);for(let k=0;k<6;k++){const a=k*Math.PI/3;line(Math.cos(a)*.2,Math.sin(a)*.2,Math.cos(a)*.48,Math.sin(a)*.48);}noStroke();fill(36,83,109);ellipse(-.085,-.09,.065,warn?.16:.08);ellipse(.085,-.09,.065,warn?.16:.08);fill(255,228,149);ellipse(0,.17,.1,.12);pop();
}
function drawWinterCreature(h,model,c,g){
 if(!EscapeSeasons.winterCreatures[h.kind]||h.kind==='owl')return false;
 if(h.kind==='snake'){if(!model?.joints)return true;const j=model.joints;push();noFill();stroke(77,46,53);strokeWeight(c*.18);beginShape();j.forEach(p=>vertex(p.x*c,p.y*c));endShape();for(let i=j.length-1;i>0;i--){stroke(...(i%3===0?[195,58,72]:[247,238,215]));strokeWeight(c*Math.max(.045,model.widths?.[i]||.14));line(j[i].x*c,j[i].y*c,j[i-1].x*c,j[i-1].y*c);}const p=j[0];translate(p.x*c,p.y*c);rotate(model.headAngle);noStroke();fill(244,236,214);ellipse(c*.05,0,c*.47,c*.29);fill(186,47,66);rect(c*.03,-c*.13,c*.08,c*.26);fill(32,78,67);ellipse(c*.15,-c*.08,c*.06,c*.05);ellipse(c*.15,c*.08,c*.06,c*.05);pop();return true;}
 if(h.kind==='sentinel')drawEscapeSentinel(h,c,g.elapsed);
 push();translate(h.x*c,h.y*c);rotate(h.facing+Math.PI/2);scale(c);const hot=['windup','charge','crouch','pounce','reveal','tongue','glare'].includes(h.state),stride=Math.sin(h.distanceMoved*9);noStroke();fill(12,31,42,90);ellipse(0,.05,.92,.72);
 // Every costume is drawn from above, like Sally: the front of the creature is up (-y), its feet underneath.
 const t=g.elapsed,f=stride*.15,eye=hot?[214,52,52]:[33,59,68];
 if(h.kind==='beetle'){
  // Yeti: a shaggy white back, blue face at the front, big arms that swing as it walks and go up for the charge.
  fill(205,226,228);ellipse(-.2,.08+f,.24,.32);ellipse(.2,.08-f,.24,.32);
  for(const s of[-1,1]){const ex=hot?s*.4:s*.5,ey=hot?-.62:.04+s*stride*.12;stroke(224,238,235);strokeWeight(.2);line(s*.3,-.08,ex,ey);noStroke();fill(240,246,240);ellipse(ex,ey,.22,.22);fill(89,128,148);for(const k of[-1,0,1])ellipse(ex+k*.06,ey-.09,.04,.06);}
  noStroke();fill(214,232,232);ellipse(0,0,.84,.72);fill(240,246,242);for(let i=0;i<12;i++){const a=i*Math.PI/6;ellipse(Math.cos(a)*.36,Math.sin(a)*.3,.17,.15);}fill(230,241,237);ellipse(0,0,.66,.56);
  fill(246,250,246);ellipse(0,-.22,.44,.38);fill(89,128,148);ellipse(0,-.33,.3,.15);fill(...eye);ellipse(-.07,-.35,.055,hot?.09:.05);ellipse(.07,-.35,.055,hot?.09:.05);fill(250,235,184);triangle(-.05,-.4,0,-.36,.05,-.4);
 }else if(h.kind==='fox'){
  // Gift snatcher: an elf with a stolen sack on its back, pointed hat flopping behind, hands out to grab.
  fill(50,85,58);ellipse(-.12,f,.13,.24);ellipse(.12,-f,.13,.24);fill(96,72,49);ellipse(0,.26,.52,.42);fill(120,92,62);ellipse(0,.24,.32,.24);stroke(70,52,36);strokeWeight(.03);line(-.08,.08,.08,.08);
  const grab=['crouch','pounce'].includes(h.state);for(const s of[-1,1]){stroke(98,143,77);strokeWeight(.1);line(s*.22,-.04,s*(grab?.2:.3),grab?-.42:.12);noStroke();fill(222,223,161);ellipse(s*(grab?.2:.3),grab?-.46:.16,.1,.1);}
  noStroke();fill(98,143,77);ellipse(0,0,.5,.34);fill(222,223,161);for(const s of[-1,1])triangle(s*.13,-.16,s*.13,-.06,s*.3,-.16);ellipse(0,-.12,.3,.28);
  fill(79,133,76);ellipse(0,-.1,.3,.26);triangle(-.1,-.06,.1,-.06,.16+Math.sin(t*3+h.x)*.04,.36);fill(251,232,191);ellipse(.16+Math.sin(t*3+h.x)*.04,.38,.1,.1);noFill();stroke(215,67,74);strokeWeight(.05);ellipse(0,-.1,.32,.28);noStroke();fill(...eye);ellipse(-.06,-.25,.05,.045);ellipse(.06,-.25,.05,.045);
 }else if(h.kind==='spider'){
  // Krampus: dark shaggy shoulders, curling horns, a birch switch in one hand and a long red tongue on the tell.
  fill(54,47,63);ellipse(-.14,.06+f,.15,.22);ellipse(.14,.06-f,.15,.22);
  for(const s of[-1,1]){const ex=hot?s*.34:s*.42,ey=hot?-.5:.14+s*stride*.1;stroke(54,47,63);strokeWeight(.11);line(s*.26,-.04,ex,ey);stroke(231,225,194);strokeWeight(.025);for(const k of[-1,0,1])line(ex,ey,ex+k*.05,ey-.09);}
  stroke(140,110,80);strokeWeight(.02);const sx=hot?.34:.42,sy=hot?-.5:.14-stride*.1;for(const k of[-2,-1,0,1,2])line(sx,sy,sx+.24+k*.03,sy+.18-k*.04);
  noStroke();fill(93,58,69);ellipse(0,.04,.68,.5);fill(72,44,56);for(let i=0;i<9;i++){const a=i*.7+.3;ellipse(Math.cos(a)*.28,.04+Math.sin(a)*.2,.12,.1);}fill(238,205,110);ellipse(-.17,.12,.08,.09);ellipse(.17,.12,.08,.09);
  fill(123,91,79);ellipse(0,-.2,.36,.34);stroke(223,208,172);strokeWeight(.065);noFill();for(const s of[-1,1])bezier(s*.12,-.26,s*.38,-.24,s*.48,-.04,s*.36,.08);noStroke();
  if(hot){fill(196,50,60);ellipse(0,-.42,.08,.16);}fill(...(h.glowFear?[123,199,125]:hot?[232,60,52]:[248,197,125]));ellipse(-.08,-.32,.065,.06);ellipse(.08,-.32,.065,.06);fill(231,225,194);triangle(-.05,-.36,0,-.3,.05,-.36);
 }else if(h.kind==='toad'){
  // Grouchy snowman from above: big bottom ball, top hat over the head, carrot pointing where it looks, twig arms out.
  // On the wind-up the right arm comes forward with a snowball.
  fill(213,231,233);ellipse(0,.08,.86,.8);fill(249,247,233);ellipse(-.03,.05,.78,.72);fill(227,240,239);ellipse(0,-.04,.62,.56);fill(246,250,248);ellipse(-.02,-.06,.54,.48);fill(33,59,68);ellipse(0,-.31,.05,.05);ellipse(0,.33,.06,.06);
  const up=h.state==='windup';stroke(104,74,52);strokeWeight(.05);line(-.27,-.03,-.6,.06);line(-.5,.03,-.6,-.06);if(up){line(.27,-.03,.44,-.4);}else{line(.27,-.03,.6,.04);line(.5,.01,.6,-.08);}noStroke();if(up){fill(250,253,255);stroke(176,214,232);strokeWeight(.03);ellipse(.46,-.48,.24,.24);noStroke();}
  fill(167,49,66);rect(.06,-.08,.1,.34,.03);noFill();stroke(167,49,66);strokeWeight(.08);ellipse(0,-.13,.42,.38);noStroke();fill(240,246,245);ellipse(0,-.14,.36,.34);
  fill(235,140,65);triangle(-.04,-.27,.04,-.27,0,-.46);fill(...eye);ellipse(-.09,-.27,.05,hot?.08:.05);ellipse(.09,-.27,.05,hot?.08:.05);
  fill(38,59,67);ellipse(0,-.1,.38,.34);fill(191,66,75);ellipse(0,-.1,.27,.24);fill(52,76,86);ellipse(0,-.1,.22,.19);
 }else if(h.kind==='mimic'){
  // Suspicious present from above: ribbon cross and bow; when it wakes the lid lifts back off a mouth of teeth.
  const open=h.state!=='rooted',lid=open?.2:0;fill(28,64,55);rect(-.38,-.38,.76,.76,.05);
  if(open){fill(31,48,61);rect(-.33,-.33,.66,.66,.04);fill(255,228,156);ellipse(-.14,-.2,.08,.08);ellipse(.14,-.2,.08,.08);fill(253,240,214);for(let i=-3;i<3;i++)triangle(i*.1+.02,-.33,i*.1+.1,-.33,i*.1+.06,-.25);}
  push();translate(0,lid);rotate(open?Math.sin(t*9)*.05:0);fill(40,91,78);rect(-.36,-.36,.72,open?.5:.72,.05);fill(69,130,113);rect(-.3,-.3,.6,open?.38:.6,.04);fill(225,73,82);rect(-.055,-.36,.11,open?.5:.72);rect(-.36,-.055,.72,.11);stroke(229,189,109);strokeWeight(.045);noFill();ellipse(-.1,0,.2,.13);ellipse(.1,0,.2,.13);noStroke();fill(229,189,109);ellipse(0,0,.08,.08);pop();
 }else if(h.kind==='sentinel'){
  // Nutcracker from above: tall black shako with a white plume, gold epaulettes, white gloves at its sides.
  fill(41,55,65);ellipse(-.12,.04,.14,.24);ellipse(.12,.04,.14,.24);fill(161,50,69);for(const s of[-1,1])ellipse(s*.33,.05,.14,.32);fill(246,244,236);ellipse(-.34,.22,.1,.1);ellipse(.34,.22,.1,.1);
  fill(161,50,69);ellipse(0,.04,.6,.38);fill(237,194,103);for(const s of[-1,1]){ellipse(s*.25,-.01,.17,.13);for(const k of[-1,0,1])ellipse(s*.3+k*.04,.06,.025,.06);}
  fill(230,204,168);ellipse(0,-.24,.26,.12);fill(246,244,236);rect(-.09,-.31,.18,.04,.02);fill(...(h.state==='glare'||hot?[214,52,52]:[39,57,70]));ellipse(-.06,-.27,.05,.05);ellipse(.06,-.27,.05,.05);
  fill(68,47,58);ellipse(0,-.07,.34,.32);noFill();stroke(224,191,112);strokeWeight(.04);ellipse(0,-.07,.3,.28);noStroke();fill(246,244,236);ellipse(0,-.07,.13,.13);fill(224,191,112);ellipse(0,-.07,.05,.05);
 }
 pop();return true;
}
let winterMotionQuery;
function winterMoving(){winterMotionQuery??=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};return escapeLightingFull()&&!winterMotionQuery.matches;}
function drawWinterScenery(g,c){
 let cached=seasonSceneryCache;if(!cached||cached.game!==g||cached.cell!==c){cached?.image.remove?.();const d=createGraphics(Math.ceil(g.width*c),Math.ceil(g.height*c));d.pixelDensity(1);d.clear();
  // The ice is one glassy sheet: deep blue with a frosted rim where it meets snow, and scratches and
  // frozen bubbles scattered by hash (not per tile) so no grid shows through.
  const ice=new Set((g.level.slippery||[]).map(k=>k.join(','))),h=(x,y,s)=>{const v=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return v-Math.floor(v);};
  for(const [x,y]of g.level.slippery||[])if(g.floor(x,y)&&g.grid[y][x]!=='c'){d.noStroke();d.fill(118,178,204,225);d.rect(x*c,y*c,c+.5,c+.5);d.fill(150,204,224,90);d.ellipse((x+h(x,y,1))*c,(y+h(x,y,2))*c,c*1.4,c*.9);
   for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(!ice.has((x+dx)+','+(y+dy))){d.fill(226,242,246,120);d.rect((x+(dx>0?.86:0))*c,(y+(dy>0?.86:0))*c,dx?c*.14:c+.5,dy?c*.14:c+.5);}}
  for(const [x,y]of g.level.slippery||[])if(g.floor(x,y)&&g.grid[y][x]!=='c'){if(h(x,y,3)<.55){const a=h(x,y,4)*Math.PI,l=.3+h(x,y,5)*.7,sx=x+h(x,y,6),sy=y+h(x,y,7);d.stroke(238,250,252,90);d.strokeWeight(c*.016);d.line(sx*c,sy*c,(sx+Math.cos(a)*l)*c,(sy+Math.sin(a)*l)*c);if(h(x,y,8)<.4)d.line((sx+Math.cos(a)*l*.5)*c,(sy+Math.sin(a)*l*.5)*c,(sx+Math.cos(a)*l*.5+Math.cos(a+.7)*.25)*c,(sy+Math.sin(a)*l*.5+Math.sin(a+.7)*.25)*c);}
   if(h(x,y,9)<.3){d.noStroke();d.fill(236,248,252,110);for(let i=0;i<3;i++)d.ellipse((x+h(x,y,10+i))*c,(y+h(x,y,20+i))*c,c*.05,c*.05);}}
  // Snow heaped against the foot of every wall (and a little on the sides), painted once.
  const wall=(x,y)=>g.grid[y]?.[x]==='#';d.noStroke();
  for(let y=1;y<g.height-1;y++)for(let x=1;x<g.width-1;x++){if(!g.floor(x,y)||ice.has(x+','+y))continue;const r=h(x,y,30);
   if(wall(x,y-1)){d.fill(246,251,255,170);d.rect(x*c-1,y*c,c+2,c*(.16+r*.06),0,0,c*.1,c*.1);d.fill(250,253,255,90);d.ellipse((x+.3+r*.4)*c,(y+.14)*c,c*.6,c*.16);}
   if(wall(x-1,y)){d.fill(246,251,255,110);d.rect(x*c,y*c-1,c*.1,c+2,0,c*.06,c*.06,0);}
   if(wall(x+1,y)){d.fill(246,251,255,110);d.rect((x+.9)*c,y*c-1,c*.1,c+2,c*.06,0,0,c*.06);}}
  for(const p of g.level.props||[]){const x=(p.at[0]+.5)*c,y=(p.at[1]+.5)*c;if(p.kind==='pine')winterPine(d,x,y,c*.7,true);else if(p.kind==='brazier')winterBrazier(d,x,y,c*.7);else if(p.kind==='lantern'){d.noStroke();d.fill(71,88,101);d.rect(x-c*.07,y-c*.4,c*.14,c*.6);d.fill(255,219,143);d.rect(x-c*.13,y-c*.5,c*.26,c*.25,c*.035);}else{d.noStroke();d.fill(160,67,83);d.rect(x-c*.22,y-c*.16,c*.44,c*.34,c*.04);d.fill(239,205,122);d.rect(x-c*.03,y-c*.16,c*.06,c*.34);d.rect(x-c*.22,y-c*.04,c*.44,c*.06);}}
  seasonSceneryCache={game:g,cell:c,image:d};cached=seasonSceneryCache;
 }image(cached.image,0,0);
 for(const [x,y]of g.level.slippery||[])if(g.grid[y][x]==='c'){noStroke();fill(155,205,222);rect(x*c,y*c,c,c);stroke(246,252,250);strokeWeight(c*.025);line(x*c,(y+.7)*c,(x+.7)*c,(y+.2)*c);}
 for(const flow of g.currents.filter(c=>c.surface==='ground'))drawWinterFlow(flow,c);
 const moving=winterMoving(),t=moving?g.elapsed:0;
 // A slow glint travels across the ice, and Sally shows a faint reflection while she is on it.
 if(moving&&g.slippery.size){noStroke();for(const k of g.slippery){const [x,y]=k.split(',').map(Number),s=((x+y-t*1.3)%16+16)%16;if(s>1.6)continue;fill(255,255,255,46*(1-Math.abs(s-.8)/.8));quad((x+s*.3)*c,y*c,(x+s*.3+.35)*c,y*c,(x+s*.3-.05)*c,(y+1)*c,(x+s*.3-.4)*c,(y+1)*c);}}
 if(g.slippery.has(g.tileKey(g.player))){noStroke();fill(214,240,250,70);ellipse(g.player.x*c,(g.player.y+.32)*c,c*.7,c*.26);}
 // Snowfall in two layers: many small far flakes drifting slowly, a few big near ones falling faster,
 // all swaying in slow gusts (fewer flakes on TV boxes). Glints wink on the snow now and then.
 if(moving){const tv=typeof isTvDevice==='function'&&isTvDevice(),gust=Math.sin(t*.23)*.5+Math.sin(t*.61)*.25;noStroke();
  for(let i=0,n=tv?20:44;i<n;i++){const x=((i*5.73+t*(.12+gust*.1)+Math.sin(t*.9+i)*.3)%g.width+g.width)%g.width,y=((i*3.17+t*.3)%g.height);fill(245,251,250,120);ellipse(x*c,y*c,c*.028,c*.028);}
  for(let i=0,n=tv?6:14;i<n;i++){const x=((i*7.31+t*(.22+gust*.25)+Math.sin(t*1.3+i*2)*.45)%g.width+g.width)%g.width,y=((i*4.91+t*.85)%g.height);fill(255,255,255,190);ellipse(x*c,y*c,c*.075,c*.075);}
  if(!tv)for(let i=0;i<8;i++){const k=Math.floor(t*.7+i*13.7),x=(k*7919)%g.width,y=(k*104729)%g.height,a=Math.max(0,Math.sin((t*.7+i*13.7)%1*Math.PI));if(!g.floor(x,y))continue;fill(255,255,255,200*a);const gx=(x+.3+(k%5)*.1)*c,gy=(y+.3+(k%3)*.15)*c;ellipse(gx,gy,c*.05*a,c*.05*a);stroke(255,255,255,140*a);strokeWeight(c*.012);line(gx-c*.08*a,gy,gx+c*.08*a,gy);line(gx,gy-c*.08*a,gx,gy+c*.08*a);noStroke();}}
 if(g.level.millWheel){push();translate((g.level.millWheel[0]+.5)*c,(g.level.millWheel[1]+.5)*c);rotate(t*.22);noFill();stroke(133,115,83);strokeWeight(c*.12);ellipse(0,0,c*1.65,c*1.65);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(0,0,Math.cos(a)*c*.82,Math.sin(a)*c*.82);}pop();}
 if(g.player.sliding){const p=g.player,v=g.slideVelocity,sp=Math.hypot(v.x,v.y),ux=v.x/(sp||1),uy=v.y/(sp||1);noFill();stroke(237,252,251,110);strokeWeight(c*.025);for(const k of[-.14,.14])line((p.x-uy*k-v.x*.28)*c,(p.y+ux*k-v.y*.28)*c,(p.x-uy*k)*c,(p.y+ux*k)*c);
  // Ice spray kicks up from the claws, more the faster she goes (fewer flecks on TV boxes).
  noStroke();const n=typeof isTvDevice==='function'&&isTvDevice()?3:7;for(let i=0;i<n;i++){const f=(g.elapsed*3.7+i/n)%1,side=i%2?1:-1,d=f*(.25+sp*.08);fill(240,252,255,(1-f)*170);ellipse((p.x-ux*d-uy*side*(.15+f*.25))*c,(p.y-uy*d+ux*side*(.15+f*.25))*c,c*.06*(1-f*.5),c*.06*(1-f*.5));}}
 // A hard knock off a wall on the ice: a brief white flash where she hit.
 if(g.iceBumpAt!==undefined&&g.elapsed-g.iceBumpAt<.25){const a=1-(g.elapsed-g.iceBumpAt)/.25;noFill();stroke(250,255,255,200*a);strokeWeight(c*.05);ellipse(g.player.x*c,g.player.y*c,c*(.7+.6*(1-a)),c*(.7+.6*(1-a)));}
}
function drawWinterSnowball(log,c,g){
 stroke(161,214,235,log.warning?170+70*Math.sin(g.elapsed*12):55);strokeWeight(c*.045);drawingContext.setLineDash([c*.13,c*.15]);line(log.from.x*c,log.from.y*c,log.to.x*c,log.to.y*c);drawingContext.setLineDash([]);if(!log.pos)return;push();translate(log.pos.x*c,log.pos.y*c);rotate(winterMoving()?g.elapsed*5:0);noStroke();fill(16,43,62,70);ellipse(c*.07,c*.12,c*1.1,c*.8);fill(199,224,233);ellipse(0,0,c,c);fill(245,250,244);ellipse(-c*.12,-c*.15,c*.69,c*.65);stroke(132,184,206,110);strokeWeight(c*.035);noFill();arc(0,0,c*.6,c*.55,.2,Math.PI*1.25);pop();
}
function drawWinterIcicles(th,key,c,g){const [x,y]=key.split(',').map(Number);noStroke();fill(133,189,212,th.warning?160:70);rect(x*c,y*c,c,c,c*.12);const h=th.raised?.7:th.warning?.25:.1;for(const k of[.25,.5,.75]){fill(228,248,249);triangle((x+k-.09)*c,(y+.7)*c,(x+k+.09)*c,(y+.7)*c,(x+k)*c,(y+.7-h)*c);}return true;}

function paintWinterWorldDetails(d,w,c,x1,x2,y1,y2){
 for(const key of w.slippery){const [x,y]=key.split(',').map(Number);if(x<x1||x>x2||y<y1||y>y2)continue;d.noStroke();d.fill(122,180,204);d.rect(x*c,y*c,c+.5,c+.5);d.fill(190,224,233,45);d.rect(x*c,y*c,c+.5,c*.4);d.stroke(238,250,248,120);d.strokeWeight(c*.022);if((x*7+y*11)%4===0){d.line((x+.1)*c,(y+.9)*c,(x+.57)*c,(y+.28)*c);d.line((x+.57)*c,(y+.28)*c,(x+.91)*c,(y+.41)*c);}for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(!w.slippery.has((x+dx)+','+(y+dy))){d.stroke(232,245,239,220);d.strokeWeight(c*.08);dx?d.line((x+(dx>0?1:0))*c,y*c,(x+(dx>0?1:0))*c,(y+1)*c):d.line(x*c,(y+(dy>0?1:0))*c,(x+1)*c,(y+(dy>0?1:0))*c);}}
 const busy=escapeWorldBusy(w);for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(w.areaAt({x,y}).id!=='winter'||w.grid[y]?.[x]!=='.'||busy.has(x+','+y)||w.slippery.has(x+','+y))continue;const hash=(x*31+y*17)%29;if(hash===0)winterPine(d,(x+.5)*c,(y+.5)*c,c*.9,true);else if(hash===4){d.noStroke();d.fill(110,144,158,40);d.ellipse((x+.5)*c,(y+.7)*c,c*.7,c*.2);d.fill(236,245,240);d.ellipse((x+.5)*c,(y+.55)*c,c*.5,c*.43);d.ellipse((x+.5)*c,(y+.25)*c,c*.32,c*.32);d.fill(184,62,75);d.rect((x+.33)*c,(y+.34)*c,c*.35,c*.065);}}
 for(const[x,y]of[[46.5,11.8],[62.5,11.8],[65.5,19.4]])if(x>=x1-3&&x<=x2+3&&y>=y1-3&&y<=y2+3){d.noStroke();d.fill(92,77,71);d.rect((x-1.25)*c,(y-.5)*c,c*2.5,c*1.4);d.stroke(127,106,85);d.strokeWeight(c*.04);for(let k=0;k<5;k++)d.line((x-1.2)*c,(y-.3+k*.23)*c,(x+1.2)*c,(y-.3+k*.23)*c);d.noStroke();d.fill(81,91,106);d.triangle((x-1.6)*c,(y-.5)*c,x*c,(y-1.7)*c,(x+1.6)*c,(y-.5)*c);d.fill(238,247,241);d.triangle((x-1.55)*c,(y-.55)*c,x*c,(y-1.7)*c,(x+1.52)*c,(y-.55)*c);d.fill(255,219,143);d.rect((x-.85)*c,(y-.05)*c,c*.43,c*.48,c*.04);d.rect((x+.42)*c,(y-.05)*c,c*.43,c*.48,c*.04);d.fill(41,76,65);d.rect((x-.22)*c,(y+.2)*c,c*.44,c*.7,c*.1);d.fill(96,75,68);d.rect((x+.7)*c,(y-1.6)*c,c*.32,c*.65);for(let i=0;i<8;i++){d.fill(...[[246,205,112],[204,79,90],[117,182,143]][i%3]);d.ellipse((x-1.3+i*.37)*c,(y-.45+Math.sin(i*.5)*.1)*c,c*.08,c*.09);}}
 for(const[x,y]of[[49,20],[60,21],[57,29]])if(x>=x1-1&&x<=x2+1&&y>=y1-1&&y<=y2+1)winterBrazier(d,x*c,y*c,c*.8);
}
function drawWinterWorld(w,c,near,save){
 if(!w.areaOpen('winter')||!near(55,20,18))return;const moving=winterMoving(),t=moving?w.elapsed:0;for(const flow of w.currents)if(near(flow.x1,flow.y1,5))drawWinterFlow(flow,c);
 if(near(55,20,5)){winterPine(globalThis,55.5*c,20.6*c,c*3.2,true);const count=save.cleared('winter');for(let i=0;i<8;i++){const a=i*2.39996,x=55.5+Math.sin(a)*(.35+i*.08),y=17.5+i*.35;noStroke();fill(...(i<count?[[239,100,108],[255,219,126],[131,210,171]][i%3]:[111,149,153]));ellipse(x*c,y*c,c*.17,c*.2);}push();translate(55.5*c,16.2*c);noStroke();fill(...(count===8?[255,224,124]:[167,199,202]));beginShape();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?.16:.36;vertex(Math.cos(a)*r*c,Math.sin(a)*r*c);}endShape(CLOSE);pop();if(count===8&&escapeLightingFull())seasonLightPool(55.5*c,16.2*c,c*3,'255,217,126',.2);}
 const sled=w.sled.riding?w.player:w.sled.at;if(near(sled.x,sled.y)){push();translate(sled.x*c,sled.y*c);if(w.sled.riding)rotate(Math.atan2(w.slideVelocity.y,w.slideVelocity.x)+Math.PI/2);noFill();stroke(129,146,156);strokeWeight(c*.07);for(const x of[-.25,.25]){line(x*c,-c*.43,x*c,c*.45);arc((x+.09)*c,-c*.43,c*.18,c*.25,Math.PI,Math.PI*1.7);}noStroke();fill(170,57,69);rect(-c*.3,-c*.25,c*.6,c*.65,c*.07);stroke(224,175,117);strokeWeight(c*.035);for(let j=0;j<4;j++)line(-c*.22,(-.16+j*.14)*c,c*.22,(-.16+j*.14)*c);pop();}
 // A tiny background sledder follows the open practice slope, clear of entrances.
 const sx=60.5+((t*.3)%4),sy=25+Math.sin(t*.3)*.4;if(near(sx,sy)){noStroke();fill(156,61,75);rect((sx-.25)*c,(sy+.1)*c,c*.5,c*.12,c*.04);fill(216,232,231);ellipse(sx*c,(sy-.1)*c,c*.24,c*.28);fill(192,59,72);triangle((sx-.15)*c,(sy-.21)*c,(sx+.16)*c,(sy-.21)*c,sx*c,(sy-.48)*c);}
 if(!escapeLightingFull())return;
 for(const[x,y]of[[49,20],[60,21],[57,29]])if(near(x,y)){seasonLightPool(x*c,y*c,c*2.8,'255,174,92',.23);if(moving){noStroke();fill(255,215,133,120);ellipse((x+Math.sin(t*2)*.1)*c,(y-.6-(t*.3)%1)*c,c*.04,c*.04);}}
 for(let i=0;i<(seasonOverview?30:72);i++){const x=43+((i*5.73+t*.13)%25),y=10+((i*3.17+t*.33)%21);if(!near(x,y,1))continue;noStroke();fill(247,253,252,175);ellipse(x*c,y*c,c*(i%5===0?.07:.035),c*(i%5===0?.07:.035));}
 noFill();strokeWeight(c*.18);for(let k=0;k<6;k++){stroke(126,209,184,8+k*2);bezier(44*c,(11+k*.22)*c,49*c,(9+Math.sin(t*.08+k)*.4)*c,60*c,(15+k*.1)*c,66*c,(11.5+k*.2)*c);}
}

function winterSnowmanSVG(){return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M8 84h78q10 0 10-10" fill="none" stroke="#b3cbd7" stroke-width="5"/><path d="M14 73h64v8H14z" fill="#b34b5f"/><circle cx="48" cy="58" r="20" fill="#e4f2ed"/><circle cx="48" cy="31" r="15" fill="#f3f8ed"/><path d="M33 23h31v6H33zM39 7h18v17H39z" fill="#304b61"/><path d="M32 43h31v6H32z" fill="#bd5362"/><path d="m49 31 18 4-18 3z" fill="#e2a060"/><g fill="#304b61"><circle cx="43" cy="29" r="2"/><circle cx="54" cy="29" r="2"/><circle cx="48" cy="55" r="2"/><circle cx="48" cy="64" r="2"/></g></svg>';}

// Downhill chevrons remain readable with Simple lighting and reduced motion.
function drawWinterFlow(f,c){for(let y=f.y1;y<=f.y2;y++)for(let x=f.x1;x<=f.x2;x++){push();translate((x+.5)*c,(y+.5)*c);rotate(Math.atan2(f.dir[1],f.dir[0])-Math.PI/2);noFill();stroke(64,116,141,160);strokeWeight(c*.035);for(const k of[-.15,.12]){beginShape();vertex(-c*.14,(k-.08)*c);vertex(0,(k+.04)*c);vertex(c*.14,(k-.08)*c);endShape();}pop();}}
