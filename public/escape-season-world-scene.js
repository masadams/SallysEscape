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
  if(!w.regionOpen(i)&&near(a.x,a.y,20)){drawEscapeRegionCloud(a,i,cell,w.elapsed);if(seasonOverview){fill(243,248,246,100);ellipse(a.x*cell,a.y*cell,cell*22,cell*18);}}
  const g=a.gate;if(!w.regionOpen(i)&&near(g.x,g.y)){stroke(171,164,143);strokeWeight(cell*.12);for(const d of[-1.1,-.55,0,.55,1.1])g.axis==='y'?line((g.x+d)*cell,(g.y-.25)*cell,(g.x+d)*cell,(g.y+.25)*cell):line((g.x-.25)*cell,(g.y+d)*cell,(g.x+.25)*cell,(g.y+d)*cell);}
 }
 if(!seasonOverview&&near(20,29))drawEscapeWorldNpc(w.npcs[0],cell,w.elapsed);
 drawEscapeLizard(w.motion.lizard,cell,w.motion.clock);pop();
 positionSeasonEntrances();
}
function positionSeasonEntrances(){
 const v=seasonWorldCamera;if(!v)return;const {cell,ox,oy}=v;
 // Measure HUD bounds only after a layout change or at most four times a second.
 if(!seasonHudBounds||millis()-seasonHudBounds.at>250){seasonHudBounds={at:millis(),panels:[...document.querySelectorAll('.season-world-heading,.season-world-tools,.season-route:not([hidden]),#season-panel:not([style*="display: none"]),#game-toolbar,.world-touch #movement-stick')].filter(el=>el.getClientRects?.().length).map(el=>el.getBoundingClientRect()),bounds:document.getElementById('game-container').getBoundingClientRect?.()||{left:0,top:0,width,height}};}
 const {bounds,panels}=seasonHudBounds;
 const place=(el,x,y,visible=true)=>{if(!el)return;const sx=x*cell+ox,sy=y*cell+oy,px=bounds.left+sx/width*bounds.width,py=bounds.top+sy/height*bounds.height,r=el.classList?.contains('season-gate')?55:22;const covered=panels.some(b=>px+r>b.left&&px-r<b.right&&py+22>b.top&&py-22<b.bottom);const show=visible&&!seasonPanelOpen&&!covered&&sx>=r&&sx<=width-r&&sy>=24&&sy<=height-24;const display=show?'block':'none';if(el.style.display!==display)el.style.display=display;if(show){el.style.left=(sx/width*100).toFixed(2)+'%';el.style.top=(sy/height*100).toFixed(2)+'%';}};
 for(const n of seasonWorld.nodes)place(document.getElementById('season-node-'+n.id),n.x,n.y,!seasonOverview&&seasonWorld.areaOpen(n.level.seasonal));
 for(const a of seasonWorld.chapters)place(document.getElementById('season-gate-'+a.id),seasonOverview?a.x:a.entry.x,seasonOverview?a.y:a.entry.y,seasonOverview||!seasonWorld.areaOpen(a.id));
}
