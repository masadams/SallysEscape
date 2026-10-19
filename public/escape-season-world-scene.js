// The campaign's terrain painter and Sally rig, on a separate seasonal world model.
const SEASON_WORLD_PALETTES={autumn:[[151,125,78],[111,66,42],[226,160,67]],frost:[[193,216,229],[94,129,144],[236,246,250]],garden:[[128,167,109],[57,99,71],[225,179,195]],coast:[[185,178,112],[66,119,99],[238,213,139]]};
let seasonWorldChunks={base:0,world:null,map:new Map()},seasonWorldCamera=null;
function clearSeasonWorldArt(){for(const g of seasonWorldChunks.map.values())g.remove?.();seasonWorldChunks={base:0,world:null,map:new Map()};seasonWorldCamera=null;}
function seasonPaintTerrain(w,c,x1,x2,y1,y2){
 const base=seasonOverview?12:Math.round(Math.max(30,Math.min(64,height/11))),size=12;if(seasonWorldChunks.base!==base||seasonWorldChunks.world!==w){clearSeasonWorldArt();seasonWorldChunks.base=base;seasonWorldChunks.world=w;}
 for(let cy=Math.floor(y1/size);cy<=Math.floor(y2/size);cy++)for(let cx=Math.floor(x1/size);cx<=Math.floor(x2/size);cx++){
  const key=cx+','+cy;let g=seasonWorldChunks.map.get(key);
  if(!g){g=createGraphics(size*base,size*base);g.pixelDensity(1);g.push();g.translate(-cx*size*base,-cy*size*base);const xa=Math.max(0,cx*size-1),xb=Math.min(w.width-1,(cx+1)*size),ya=Math.max(0,cy*size-1),yb=Math.min(w.height-1,(cy+1)*size);
   drawEscapeWorldTerrain(g,w,SEASON_WORLD_PALETTES,base,xa,xb,ya,yb);paintSeasonWorldDetails(g,w,base,xa,xb,ya,yb);g.pop();seasonWorldChunks.map.set(key,g);
  }else{seasonWorldChunks.map.delete(key);seasonWorldChunks.map.set(key,g);}
  image(g,cx*size*c,cy*size*c,size*c+.5,size*c+.5);
 }
 // Overview uses smaller chunks so it does not create a whole high-resolution world at once.
 const limit=seasonOverview?49:16;while(seasonWorldChunks.map.size>limit){const [key,g]=seasonWorldChunks.map.entries().next().value;g.remove?.();seasonWorldChunks.map.delete(key);}
}
function paintSeasonWorldDetails(d,w,c,x1,x2,y1,y2){
 const inside=(x,y,r=2)=>x>=x1-r&&x<=x2+r&&y>=y1-r&&y<=y2+r;
 // These still props are baked into terrain chunks, including snow/petal/summer silhouettes.
 for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){
  const area=w.areaAt({x,y}),hash=(x*7919+y*104729)%211;if(w.grid[y][x]!=='.'||escapeWorldBusy(w).has(x+','+y)||hash%9)continue;
  const px=(x+.5)*c,py=(y+.5)*c;d.noStroke();
  if(area.theme==='autumn'){d.fill(177,86,33);d.ellipse(px,py,c*.45,c*.31);d.fill(226,139,45);d.ellipse(px,py,c*.24,c*.33);d.fill(86,118,61);d.rect(px-c*.025,py-c*.23,c*.05,c*.1);}
  if(area.theme==='frost'&&hash%3===0){d.fill(59,98,89);d.triangle(px,py-c*.7,px-c*.33,py+c*.1,px+c*.33,py+c*.1);d.fill(233,247,249);d.triangle(px,py-c*.7,px-c*.25,py-c*.1,px+c*.25,py-c*.1);}
 }
 if(inside(20,20,3)){d.noStroke();d.fill(88,54,36);d.rect(20*c,19*c,c,c*2.4,c*.12);for(const [x,y,r,color]of [[19.2,19,1.7,[188,103,46]],[21.2,18.8,1.9,[216,141,51]],[20,17.8,2.1,[232,176,73]]]){d.fill(...color);d.ellipse(x*c,y*c,r*c,r*.85*c);}d.stroke(106,70,40);d.strokeWeight(c*.06);d.line(18.8*c,19*c,21.7*c,19*c);for(const x of[19,21.5]){d.noStroke();d.fill(255,217,114);d.rect(x*c,19.2*c,c*.22,c*.35,c*.04);}}
 if(inside(29,20)){d.noStroke();d.fill(101,67,44);d.rect(29.5*c,18.6*c,c*1.8,c*1.3);d.fill(161,89,47);d.triangle(29.2*c,18.7*c,30.4*c,17.8*c,31.6*c,18.7*c);d.fill(247,203,120);d.rect(30*c,19*c,c*.34,c*.4);d.noFill();d.stroke(103,69,43);d.strokeWeight(c*.13);d.ellipse(29.6*c,20*c,c*1.6,c*1.6);for(let i=0;i<6;i++){const a=i*Math.PI/3;d.line(29.6*c,20*c,(29.6+Math.cos(a)*.8)*c,(20+Math.sin(a)*.8)*c);}}
 // Distinct silhouettes peek out from the future regions' veils.
 for(const [x,y,theme]of [[44,11,'frost'],[65,28,'frost'],[65,46,'garden'],[45,64,'garden'],[9,46,'coast'],[30,64,'coast']])if(inside(x,y)){
  d.noStroke();if(theme==='frost'){d.fill(72,113,112);d.triangle(x*c,(y-1.4)*c,(x-.8)*c,(y+.6)*c,(x+.8)*c,(y+.6)*c);d.fill(241,250,252);d.triangle(x*c,(y-1.4)*c,(x-.55)*c,(y-.2)*c,(x+.55)*c,(y-.2)*c);}
  else if(theme==='garden'){d.fill(112,87,65);d.rect((x-.08)*c,y*c,c*.16,c*.8);d.fill(235,181,195);d.ellipse(x*c,(y-.2)*c,c*1.6,c*1.2);d.fill(255,220,223);d.ellipse((x-.3)*c,(y-.4)*c,c*.65,c*.5);}
  else{d.fill(226,199,121);d.ellipse(x*c,y*c,c*1.8,c*.8);d.stroke(92,135,77);d.strokeWeight(c*.07);d.line(x*c,y*c,x*c,(y-1)*c);d.noStroke();for(const ox of[-.25,0,.25]){d.fill(255,224,105);d.ellipse((x+ox)*c,(y-.7)*c,c*.3,c*.3);}}
 }
}
let seasonVeilMotionQuery;
function drawSeasonWorldVeil(a,c,clock){
 // Keep the campaign's painted shapes and weather strokes. The veil belongs to
 // its region; it is a glimpse of a future season, not a preview of built levels.
 seasonVeilMotionQuery??=window.matchMedia?.('(prefers-reduced-motion: reduce)')||{matches:false};
 const moving=escapeLightingFull()&&!seasonVeilMotionQuery.matches,t=moving?clock:0;
 push();translate(a.x*c,a.y*c);scale(c);noStroke();
 const mist=(color)=>{fill(...color,210);ellipse(0,0,25,21);fill(...color,238);ellipse(-3,-1,18,18);ellipse(4,1,18,18);};
 if(a.theme==='frost'){
  mist([205,222,233]);fill(228,239,244,155);ellipse(-2,3,22,13);
  // Snow-laden trees and steady bulbs emerge between the banks of windblown snow.
  for(const [x,y,s]of[[-7,5,1.3],[-4,7,1],[5,6,1.25],[8,3,1]]){
   fill(76,112,111,185);triangle(x,y-3*s,x-1.25*s,y+.5*s,x+1.25*s,y+.5*s);
   fill(242,248,248,235);triangle(x,y-3*s,x-.93*s,y-1.1*s,x+.93*s,y-1.1*s);
   triangle(x,y-1.8*s,x-1.12*s,y,x+1.12*s,y);
  }
  for(const [x,y]of[[-6.8,5.9],[4.1,6.3]]){
   noFill();stroke(100,128,120,180);strokeWeight(.055);beginShape();
   for(let j=0;j<=12;j++)vertex(x+j*.3,y+Math.sin(j/12*Math.PI)*.45);endShape();noStroke();
   for(let j=0;j<7;j++){const bx=x+j*.6,by=y+Math.sin(j/6*Math.PI)*.45;fill(255,217,141,35);ellipse(bx,by,.7,.7);fill(...[[255,219,139],[209,128,111],[153,189,148]][j%3],240);ellipse(bx,by,.23,.3);}
  }
  fill(235,244,248,150);ellipse(-5,8,14,3.4);ellipse(5,8.3,13,3);
  for(let j=0;j<28;j++){
   const u=((j*.61803398875+t*.045)%1)*2-1,v=((j*.38196601125-t*.027)%1+1)%1*2-1;
   if(u*u+v*v>.94)continue;const x=u*11.7,y=v*9.6;
   stroke(250,253,255,190);strokeWeight(j%4===0?.09:.045);line(x,y,x+.55+(j%3)*.18,y-.2);noStroke();
   if(j%3===0){fill(255,255,255,205);ellipse(x,y,.12,.12);}
  }
 }else if(a.theme==='garden'){
  mist([190,207,203]);fill(222,220,228,120);ellipse(1,-1,21,17);
  for(const [x,y,s]of[[-7,5,1],[6,5.7,1.25]]){
   stroke(118,111,99,175);strokeWeight(.17*s);line(x,y,x+.2,y-2.5*s);noStroke();
   fill(209,161,184,180);ellipse(x,y-2*s,3.4*s,2.4*s);fill(240,206,214,205);ellipse(x-.6*s,y-2.5*s,2*s,1.3*s);
  }
  fill(225,229,228,130);ellipse(0,7.9,23,4);
  for(let j=0;j<23;j++){
   const u=((j*.61803398875+t*.01)%1)*2-1,v=((j*.38196601125+t*.055)%1)*2-1;
   if(u*u+v*v>.93)continue;const x=u*11.5,y=v*9.3;
   if(j%3){stroke(150,178,190,155);strokeWeight(.035);line(x,y,x-.18,y+.65);noStroke();}
   else{push();translate(x,y);rotate(Math.sin(t*.5+j)*.6);fill(248,210,220,220);ellipse(0,0,.4,.18);pop();}
  }
 }else{
  mist([223,210,165]);fill(245,225,173,150);ellipse(0,-2,22,16);
  // Warm haze parts just enough to show meadow grasses and summer flowers.
  for(let j=0;j<18;j++){
   const x=-9+j*1.05,y=6.8+Math.sin(j*2)*.8,h=1.1+(j%4)*.45,sway=Math.sin(t*.35+j)*.12;
   stroke(135,147,96,175);strokeWeight(.065);line(x,y,x+sway,y-h);line(x,y-.3,x-.3+sway,y-h*.7);noStroke();
   if(j%5===0){fill(238,199,97,210);ellipse(x+sway,y-h,.6,.6);fill(150,121,79,210);ellipse(x+sway,y-h,.22,.22);}
  }
  noFill();strokeWeight(.12);for(let j=0;j<6;j++){const y=-6+j*2.3;stroke(251,236,196,95);beginShape();for(let k=0;k<=10;k++)vertex(-9+k*1.8,y+Math.sin(k*.7+t*.3+j)*.25);endShape();}
  noStroke();fill(242,224,183,120);ellipse(0,8.1,23,3.6);
 }
 pop();
}
function drawSeasonWorld(){
 const w=seasonWorld;if(!w)return;
 const sidebar=Math.min(280,width*.34),cell=seasonOverview?Math.min((width-sidebar-28)/w.width,(height-28)/w.height):escapeWorldCell(w);
 const ox=seasonOverview?sidebar+(width-sidebar-w.width*cell)/2:width*.48-w.player.x*cell,oy=seasonOverview?(height-w.height*cell)/2:height*.53-w.player.y*cell;
 seasonWorldCamera={cell,ox,oy,world:w};background(28,51,43);push();translate(ox,oy);
 const x1=Math.max(0,Math.floor(-ox/cell)-1),x2=Math.min(w.width-1,Math.ceil((width-ox)/cell)+1),y1=Math.max(0,Math.floor(-oy/cell)-1),y2=Math.min(w.height-1,Math.ceil((height-oy)/cell)+1);
 seasonPaintTerrain(w,cell,x1,x2,y1,y2);const near=(x,y,r=3)=>x*cell+ox>-r*cell&&x*cell+ox<width+r*cell&&y*cell+oy>-r*cell&&y*cell+oy<height+r*cell;
 const save=seasonProgress();
 for(const track of w.tracks)if(track.from&&save.data.records[track.from]&&save.data.records[track.to]){noFill();stroke(255,213,112,190);strokeWeight(cell*.2);beginShape();for(const p of track.points)vertex(p.x*cell,p.y*cell);endShape();}
 for(const n of w.nodes)if(near(n.x,n.y)){
  const x=n.x*cell,y=n.y*cell,done=Boolean(save.data.records[n.id]);noStroke();fill(71,52,37,90);ellipse(x,y+cell*.4,cell*1.7,cell*.6);fill(175,145,101);rect(x-cell*.64,y-cell*.6,cell*1.28,cell*1.2,cell*.2);fill(done?83:58,done?123:83,done?64:54);rect(x-cell*.38,y-cell*.39,cell*.76,cell*.95,cell*.3);stroke(109,72,38);strokeWeight(cell*.07);line(x+cell*.56,y+cell*.4,x+cell*.56,y-cell*.95);noStroke();fill(done?255:219,done?218:139,done?111:64);rect(x+cell*.44,y-cell*.99,cell*.3,cell*.43,cell*.06);if(done){fill(255,225,134,60);ellipse(x+cell*.6,y-cell*.8,cell,cell);}
 }
 for(const [i,a]of w.chapters.entries()){
  if(!w.regionOpen(i)&&near(a.x,a.y,20))drawSeasonWorldVeil(a,cell,w.elapsed);
  const g=a.gate;if(!w.regionOpen(i)&&near(g.x,g.y)){stroke(171,164,143);strokeWeight(cell*.12);for(const d of[-1.1,-.55,0,.55,1.1])g.axis==='y'?line((g.x+d)*cell,(g.y-.25)*cell,(g.x+d)*cell,(g.y+.25)*cell):line((g.x-.25)*cell,(g.y+d)*cell,(g.x+.25)*cell,(g.y+d)*cell);}
 }
 if(!seasonOverview&&near(20,29))drawEscapeWorldNpc(w.npcs[0],cell,w.elapsed);
 drawEscapeLizard(w.motion.lizard,cell,w.motion.clock);pop();
 positionSeasonEntrances();
}
function positionSeasonEntrances(){
 const v=seasonWorldCamera;if(!v)return;const {cell,ox,oy}=v;
 // Measure HUD bounds only after a layout change or at most four times a second.
 if(!seasonHudBounds||millis()-seasonHudBounds.at>250){seasonHudBounds={at:millis(),panels:[...document.querySelectorAll('.season-world-heading,.season-world-tools,.season-route:not([hidden]),#season-panel:not([style*="display: none"]),#game-toolbar,.world-touch #movement-stick,.world-touch .ability-pad')].filter(el=>el.getClientRects?.().length).map(el=>el.getBoundingClientRect()),bounds:document.getElementById('game-container').getBoundingClientRect?.()||{left:0,top:0,width,height}};}
 const {bounds,panels}=seasonHudBounds;
 const place=(el,x,y,visible=true)=>{if(!el)return;const sx=x*cell+ox,sy=y*cell+oy,px=bounds.left+sx/width*bounds.width,py=bounds.top+sy/height*bounds.height,r=el.classList?.contains('season-gate')?72:22;const covered=panels.some(b=>px+r>b.left&&px-r<b.right&&py+26>b.top&&py-26<b.bottom);const show=visible&&!seasonPanelOpen&&!covered&&sx>=r&&sx<=width-r&&sy>=27&&sy<=height-27;const display=show?'block':'none';if(el.style.display!==display)el.style.display=display;if(show){el.style.left=(sx/width*100).toFixed(2)+'%';el.style.top=(sy/height*100).toFixed(2)+'%';}};
 for(const n of seasonWorld.nodes)place(document.getElementById('season-node-'+n.id),n.x,n.y,!seasonOverview&&seasonWorld.areaOpen(n.level.seasonal));
 for(const a of seasonWorld.chapters)place(document.getElementById('season-gate-'+a.id),seasonOverview?a.x:a.entry.x,seasonOverview?a.y:a.entry.y,seasonOverview||!seasonWorld.areaOpen(a.id));
}
