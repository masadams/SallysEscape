// Terrain: in Full lighting the ground is one continuous surface and walls are solid masses with
// rounded outer corners, a front face that gives them height, and a material of their own (hedges
// in the green places, cut stone in the ruins, rough rock in the caves, layered sandstone in the
// desert, ice in the frost). Ground marks are scattered in world space, not per tile, so the grid
// does not show through. All of it is drawn once into the cached tile layer; nothing changes where
// Sally can walk. Water has its own pass: shallow and deep water read as one body with soft
// shores, depth that darkens away from the bank, and moving light and foam drawn each frame.
const ESCAPE_TERRAIN_HASH=(x,y,s=0)=>{let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
// What each place is made of: its walls and its ground.
const ESCAPE_TERRAIN_SETS={
  meadow:['hedge','grass'],garden:['hedge','grass'],orchard:['hedge','grass'],jungle:['hedge','grass'],hollow:['hedge','grass'],home:['hedge','grass'],finale:['hedge','grass'],
  river:['hedge','earth'],marsh:['hedge','earth'],lantern:['hedge','earth'],
  ruins:['stone','flag'],quarry:['stone','flag'],gilded:['stone','flag'],
  grotto:['rock','cave'],glow:['rock','cave'],vents:['rock','cave'],storm:['rock','cave'],ants:['rock','earth'],
  desert:['sand','sand'],coast:['rock','sand'],tide:['rock','sand'],rooftops:['sand','roof'],frost:['ice','snow'],
  'secret:bestiary-grove':['hedge','grass'],'secret:star-garden':['hedge','grass'],'secret:blind-grove':['hedge','grass'],'secret:challenge-shrine':['stone','flag'],
  'secret:mossy-well':['rock','cave'],'secret:sunken-wreck':['rock','sand'],'secret:cloud-nest':['rock','cave'],'secret:ice-cave':['ice','snow']
};
function escapeTerrainSet(g){
  const place=typeof escapePlace==='function'?escapePlace(g.level):null,set=place&&ESCAPE_TERRAIN_SETS[place.key];
  if(set)return {wall:set[0],ground:set[1]};
  if(g.level.biome==='desert')return {wall:'sand',ground:'sand'};
  return g.level.dark?{wall:'rock',ground:'cave'}:{wall:'hedge',ground:'grass'};
}
// Each material leans the area's colours toward its own (green hedges, brown earth, pale snow),
// keeping the palette's brightness so dark places stay dark.
const ESCAPE_TERRAIN_TINT={hedge:[[58,104,58],.62],grass:[[56,92,48],.5],earth:[[84,66,44],.45],sand:[[170,140,96],.5],snow:[[200,214,230],.45],ice:[[176,206,230],.5],stone:null,flag:null,rock:null,cave:null,roof:null};
const escapeTerrainLum=c=>.3*c[0]+.59*c[1]+.11*c[2];
function escapeTerrainTint(c,material){const t=ESCAPE_TERRAIN_TINT[material];if(!t)return c;const [tc,k]=t,scale=escapeTerrainLum(c)/Math.max(1,escapeTerrainLum(tc));return c.map((v,i)=>Math.max(0,Math.min(255,Math.round(v*(1-k)+tc[i]*scale*k))));}
const escapeTerrainMix=(c,k)=>c.map(v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k)))));
// Gates count as open ground here, so the terrain looks the same whether a gate is shut or open
// and does not need redrawing when one moves; the gate itself is drawn on top.
const escapeTerrainSolid=(g,x,y)=>{const t=g.grid[y]?.[x];return t===undefined||t==='#'||t==='B'||t==='Y';};
const escapeTerrainWater=t=>t==='U'||t==='P';

// ---- Ground ---------------------------------------------------------------------------------------
// The floor colour fills every open tile edge to edge, then soft patches of lighter and darker
// ground wander across tiles, then the material's own small marks.
function drawEscapeTerrainGround(g,cell,palette){
  // Storm floors are rain-darkened all over.
  const set=escapeTerrainSet(g),wet=Boolean(g.level.storm)||escapePlace?.(g.level)?.key==='storm',base=escapeTerrainMix(escapeTerrainTint(palette[0],set.ground),wet?-.22:0),W=g.width,H=g.height,open=(x,y)=>!escapeTerrainSolid(g,x,y);
  noStroke();fill(...base);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(open(x,y))rect(x*cell-.5,y*cell-.5,cell+1,cell+1);
  const near=(px,py)=>open(Math.floor(px),Math.floor(py));
  // Mottling: big, faint, overlapping patches.
  const patches=Math.round(W*H*.5);
  for(let i=0;i<patches;i++){const px=ESCAPE_TERRAIN_HASH(i,1,7)*W,py=ESCAPE_TERRAIN_HASH(i,2,7)*H;if(!near(px,py))continue;
    const r=(.7+ESCAPE_TERRAIN_HASH(i,3,7)*1.3)*cell,light=ESCAPE_TERRAIN_HASH(i,4,7)<.5,c=light?escapeTerrainMix(base,.18):escapeTerrainMix(base,-.3);
    for(const [k,a] of [[1,5],[.7,6],[.42,7]]){fill(...c,a);ellipse(px*cell,py*cell,r*2*k,r*1.6*k);}}
  const marks={grass:escapeTerrainGrass,earth:escapeTerrainEarth,flag:escapeTerrainFlag,cave:escapeTerrainCave,sand:escapeTerrainSand,snow:escapeTerrainSnow,roof:escapeTerrainRoof}[set.ground];
  marks?.(g,cell,base,near,W,H);
}
function escapeTerrainGrass(g,cell,base,near,W,H){
  const light=escapeTerrainMix(base,.32),dark=escapeTerrainMix(base,-.35),n=Math.round(W*H*9);strokeWeight(Math.max(1,cell*.028));
  for(let i=0;i<n;i++){const px=ESCAPE_TERRAIN_HASH(i,11,3)*W,py=ESCAPE_TERRAIN_HASH(i,12,3)*H;if(!near(px,py))continue;
    const r=ESCAPE_TERRAIN_HASH(i,13,3),c=r<.55?light:dark,len=cell*(.06+r*.07),lean=(ESCAPE_TERRAIN_HASH(i,14,3)-.5)*.9;
    stroke(...c,r<.55?46:40);line(px*cell,py*cell,px*cell+Math.sin(lean)*len,py*cell-Math.cos(lean)*len);}
  noStroke();for(let i=0;i<W*H*.35;i++){const px=ESCAPE_TERRAIN_HASH(i,15,3)*W,py=ESCAPE_TERRAIN_HASH(i,16,3)*H;if(!near(px,py))continue;fill(...light,30);for(const [dx,dy] of [[-.03,0],[.03,0],[0,-.03]])ellipse((px+dx)*cell,(py+dy)*cell,cell*.045,cell*.045);}
}
function escapeTerrainEarth(g,cell,base,near,W,H){
  const dark=escapeTerrainMix(base,-.45),light=escapeTerrainMix(base,.22);noStroke();
  for(let i=0;i<W*H*7;i++){const px=ESCAPE_TERRAIN_HASH(i,21,3)*W,py=ESCAPE_TERRAIN_HASH(i,22,3)*H;if(!near(px,py))continue;const r=ESCAPE_TERRAIN_HASH(i,23,3);fill(...(r<.7?dark:light),r<.7?38:30);ellipse(px*cell,py*cell,cell*(.02+r*.035),cell*(.018+r*.03));}
  // A few roots crossing the ground, and the odd damp hollow.
  stroke(...dark,40);strokeWeight(Math.max(1,cell*.025));noFill();
  for(let i=0;i<W*H*.12;i++){const px=ESCAPE_TERRAIN_HASH(i,24,3)*W,py=ESCAPE_TERRAIN_HASH(i,25,3)*H;if(!near(px,py))continue;const a=ESCAPE_TERRAIN_HASH(i,26,3)*Math.PI*2;
    beginShape();for(let k=0;k<5;k++){const d=k*.18;vertex((px+Math.cos(a+Math.sin(k*1.3)*.4)*d)*cell,(py+Math.sin(a+Math.sin(k*1.3)*.4)*d)*cell);}endShape();}
  noStroke();for(let i=0;i<W*H*.08;i++){const px=ESCAPE_TERRAIN_HASH(i,27,3)*W,py=ESCAPE_TERRAIN_HASH(i,28,3)*H;if(!near(px,py))continue;fill(...dark,22);ellipse(px*cell,py*cell,cell*.7,cell*.42);fill(...dark,18);ellipse(px*cell,py*cell,cell*.42,cell*.25);}
}
// Flagstones of uneven size, laid in rows that ignore the tile grid, with soft worn joints and
// the odd crack or tuft of moss; the walls cover what spills over.
function escapeTerrainFlag(g,cell,base,near,W,H){
  const joint=escapeTerrainMix(base,-.32);strokeWeight(Math.max(1,cell*.022));
  let y0=0,row=0;while(y0<H+1){const sh=.5+ESCAPE_TERRAIN_HASH(row,30,3)*.3;let x0=-ESCAPE_TERRAIN_HASH(row,31,3)*.8,col=0;
    while(x0<W+1){const sw=.55+ESCAPE_TERRAIN_HASH(col,row,33)*.75,cx=x0+sw/2,cy=y0+sh/2;
      if(near(cx,cy)||near(x0+.1,y0+.1)||near(x0+sw-.1,y0+sh-.1)){const r=ESCAPE_TERRAIN_HASH(col,row,32);fill(...escapeTerrainMix(base,(r-.5)*.14));stroke(...joint,60);
        rect(x0*cell+1,y0*cell+1,sw*cell-2,sh*cell-2,cell*(.08+r*.08));
        if(r<.14){noFill();stroke(...joint,55);line((x0+sw*.25)*cell,(y0+sh*.2)*cell,(x0+sw*.5)*cell,(y0+sh*.6)*cell);}
        else if(r>.84){noStroke();fill(96,140,80,46);ellipse((x0+sw*.85)*cell,(y0+sh*.92)*cell,cell*.24,cell*.09);}}
      x0+=sw;col++;}
    y0+=sh;row++;}
  noStroke();
}
function escapeTerrainCave(g,cell,base,near,W,H){
  const dark=escapeTerrainMix(base,-.5),light=escapeTerrainMix(base,.25);
  // Broad slabs with hairline seams, then grit.
  stroke(...dark,60);strokeWeight(Math.max(1,cell*.022));noFill();
  for(let i=0;i<W*H*.35;i++){const px=ESCAPE_TERRAIN_HASH(i,41,3)*W,py=ESCAPE_TERRAIN_HASH(i,42,3)*H;if(!near(px,py))continue;let a=ESCAPE_TERRAIN_HASH(i,43,3)*Math.PI*2,x=px,y=py;
    beginShape();vertex(x*cell,y*cell);for(let k=0;k<3;k++){a+=(ESCAPE_TERRAIN_HASH(i,44+k,3)-.5)*1.4;x+=Math.cos(a)*.35;y+=Math.sin(a)*.35;vertex(x*cell,y*cell);}endShape();}
  noStroke();for(let i=0;i<W*H*5;i++){const px=ESCAPE_TERRAIN_HASH(i,47,3)*W,py=ESCAPE_TERRAIN_HASH(i,48,3)*H;if(!near(px,py))continue;const r=ESCAPE_TERRAIN_HASH(i,49,3);fill(...(r<.6?dark:light),r<.6?34:26);ellipse(px*cell,py*cell,cell*(.025+r*.04),cell*(.02+r*.03));}
}
function escapeTerrainSand(g,cell,base,near,W,H){
  const dark=escapeTerrainMix(base,-.22),light=escapeTerrainMix(base,.28);noFill();strokeWeight(Math.max(1,cell*.026));
  // Wind ripples: long gentle waves running across the whole floor.
  for(let row=0;row<H*2.4;row++){const y0=row/2.4+ESCAPE_TERRAIN_HASH(row,51,3)*.2;for(let seg=0;seg<W;seg+=2){const sx=seg+ESCAPE_TERRAIN_HASH(row,seg,52)*1.2;if(!near(sx+.6,y0))continue;
    stroke(...(row%2?light:dark),row%2?40:34);beginShape();for(let k=0;k<=6;k++){const x=sx+k*.22;vertex(x*cell,(y0+Math.sin(x*2.1+row)*.06)*cell);}endShape();}}
  noStroke();for(let i=0;i<W*H*4;i++){const px=ESCAPE_TERRAIN_HASH(i,53,3)*W,py=ESCAPE_TERRAIN_HASH(i,54,3)*H;if(!near(px,py))continue;fill(...(ESCAPE_TERRAIN_HASH(i,55,3)<.5?dark:light),36);ellipse(px*cell,py*cell,cell*.03,cell*.03);}
}
function escapeTerrainSnow(g,cell,base,near,W,H){
  const light=escapeTerrainMix(base,.4);noStroke();
  for(let i=0;i<W*H*.6;i++){const px=ESCAPE_TERRAIN_HASH(i,61,3)*W,py=ESCAPE_TERRAIN_HASH(i,62,3)*H;if(!near(px,py))continue;const r=(.4+ESCAPE_TERRAIN_HASH(i,63,3)*.8)*cell;fill(...light,10);ellipse(px*cell,py*cell,r*2.2,r*1.2);fill(...light,8);ellipse(px*cell-r*.2,py*cell-r*.1,r*1.3,r*.7);}
  for(let i=0;i<W*H*3;i++){const px=ESCAPE_TERRAIN_HASH(i,64,3)*W,py=ESCAPE_TERRAIN_HASH(i,65,3)*H;if(!near(px,py))continue;fill(245,250,255,ESCAPE_TERRAIN_HASH(i,66,3)<.15?90:30);ellipse(px*cell,py*cell,cell*.025,cell*.025);}
}
// Clay roof tiles: overlapping rows of rounded tile ends.
function escapeTerrainRoof(g,cell,base,near,W,H){
  const dark=escapeTerrainMix(base,-.3),light=escapeTerrainMix(base,.16),tw=.5,th=.42;
  for(let row=0;row*th<H+1;row++){const off=(row%2)*tw*.5;for(let col=-1;col*tw<W+1;col++){const x0=col*tw+off,y0=row*th;if(!near(x0+tw/2,y0+th/2))continue;
    const r=ESCAPE_TERRAIN_HASH(col,row,71);noStroke();fill(...escapeTerrainMix(base,(r-.5)*.25));arc((x0+tw/2)*cell,y0*cell,tw*cell,th*2*cell,0,Math.PI);
    stroke(...dark,70);strokeWeight(Math.max(1,cell*.022));noFill();arc((x0+tw/2)*cell,y0*cell,tw*cell,th*2*cell,0,Math.PI);
    noStroke();fill(...light,40);ellipse((x0+tw*.38)*cell,(y0+th*.42)*cell,tw*.3*cell,th*.28*cell);}}
}

// ---- Walls ----------------------------------------------------------------------------------------
// Each wall tile is filled edge to edge so a wall run reads as one mass. Corners that stick out
// into open ground are rounded; a wall with open ground below shows a darker front face; edges
// that meet open ground get the material's own silhouette (leafy bumps, rough rock, ice).
function drawEscapeTerrainWalls(g,cell,palette){
  const set=escapeTerrainSet(g),wall=escapeTerrainTint(palette[1],set.wall),top=escapeTerrainMix(wall,set.wall==='ice'?.18:.06),face=escapeTerrainMix(wall,-.38),edge=escapeTerrainTint(palette[2],set.wall),W=g.width,H=g.height,fh=.26,r=cell*.3;
  const open=(x,y)=>!escapeTerrainSolid(g,x,y)&&x>=0&&y>=0&&x<W&&y<H;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=g.grid[y][x];if(t!=='#'&&t!=='B')continue;
    const n=open(x,y-1),s=open(x,y+1),e=open(x+1,y),w=open(x-1,y),px=x*cell,py=y*cell,tl=n&&w?r:0,tr=n&&e?r:0,br=s&&e?r:0,bl=s&&w?r:0,topH=s?cell*(1-fh):cell;
    noStroke();
    const ox=w?0:.6,oy=n?0:.6,ow=(w?0:.6)+(e?0:.6),oh=(n?0:.6)+(s?0:.6);
    if(s){fill(...face);rect(px-ox,py+cell*(1-fh)-1,cell+ow,cell*fh+1,0,0,br,bl);}
    fill(...top);rect(px-ox,py-oy,cell+ow,topH+(s?1:0)+oh,tl,tr,s?0:br,s?0:bl);
    const ctx={g,x,y,px,py,cell,top,face,edge,n,s,e,w,topH,fh,set};
    ({hedge:escapeTerrainHedge,stone:escapeTerrainStone,rock:escapeTerrainRock,sand:escapeTerrainSandstone,ice:escapeTerrainIce})[set.wall]?.(ctx);
  }
}
function escapeTerrainHedge({x,y,px,py,cell,top,face,n,s,e,w,topH}){
  const shades=[escapeTerrainMix(top,-.18),top,escapeTerrainMix(top,.14),escapeTerrainMix(top,.26)];
  // Leaf clumps over the top, a little brighter where light catches the upper side.
  for(let i=0;i<11;i++){const r=ESCAPE_TERRAIN_HASH(x,y,i+80),cx=px+cell*(.1+.8*ESCAPE_TERRAIN_HASH(x,y,i+90)),cy=py+topH*(.1+.8*ESCAPE_TERRAIN_HASH(x,y,i+100)),d=cell*(.2+.14*r);
    fill(...shades[Math.min(3,Math.floor(r*3)+(cy-py<topH*.4?1:0))],215);ellipse(cx,cy,d,d*.86);fill(...escapeTerrainMix(shades[3],.12),60);ellipse(cx-d*.15,cy-d*.18,d*.4,d*.3);}
  // A leafy silhouette where the hedge meets open ground.
  const bump=(cx,cy,d,c)=>{fill(...c);ellipse(cx,cy,d,d);};
  for(let i=0;i<3;i++){const t=(i+.5)/3+(ESCAPE_TERRAIN_HASH(x,y,i+110)-.5)*.12,d=cell*(.2+.08*ESCAPE_TERRAIN_HASH(x,y,i+120));
    if(n)bump(px+t*cell,py+cell*.02,d,shades[2]);if(w)bump(px+cell*.02,py+t*topH,d,shades[1]);if(e)bump(px+cell*.98,py+t*topH,d,shades[1]);
    if(s)bump(px+t*cell,py+cell-cell*.02,d*.9,escapeTerrainMix(face,.08));}
  if(s){stroke(...escapeTerrainMix(face,-.3),90);strokeWeight(Math.max(1,cell*.02));for(let i=0;i<4;i++){const sx=px+cell*(.15+.7*ESCAPE_TERRAIN_HASH(x,y,i+130));line(sx,py+topH+cell*.03,sx+cell*.02,py+cell*.94);}noStroke();
    fill(...escapeTerrainMix(face,-.35),90);rect(px,py+topH,cell,cell*.05);}
}
function escapeTerrainStone({x,y,px,py,cell,top,face,edge,s,n,topH}){
  // Two or three courses of cut blocks with mortar, each block a touch different.
  const rows=topH>cell*.8?3:2,rh=topH/rows,mortar=escapeTerrainMix(top,-.4);
  for(let row=0;row<rows;row++){const off=((x+row+y)%2)*.5,yy=py+row*rh;
    for(let k=-1;k<2;k++){const x0=px+(k+off)*cell*.5,x1=x0+cell*.5;const cx0=Math.max(px,x0),cx1=Math.min(px+cell,x1);if(cx1-cx0<2)continue;
      fill(...escapeTerrainMix(top,(ESCAPE_TERRAIN_HASH(x*3+k,y*3+row,140)-.5)*.22));rect(cx0+.5,yy+.5,cx1-cx0-1,rh-1,cell*.04);}
    stroke(...mortar,150);strokeWeight(Math.max(1,cell*.025));line(px,yy,px+cell,yy);noStroke();}
  if(n){stroke(...edge,120);strokeWeight(Math.max(1,cell*.03));line(px+cell*.06,py+cell*.04,px+cell*.94,py+cell*.04);noStroke();}
  if(s){fill(...escapeTerrainMix(face,.08));for(let k=0;k<2;k++)rect(px+k*cell*.5+1,py+topH+cell*.03,cell*.5-2,cell*.18,cell*.03);fill(0,0,0,40);rect(px,py+topH,cell,cell*.035);}
  if(ESCAPE_TERRAIN_HASH(x,y,141)<.22){fill(92,132,76,90);ellipse(px+cell*(.2+.6*ESCAPE_TERRAIN_HASH(x,y,142)),py+topH*.9,cell*.3,cell*.12);}
}
function escapeTerrainRock({x,y,px,py,cell,top,face,n,s,e,w,topH}){
  // Facets: a few irregular planes, lit from the top left.
  for(let i=0;i<4;i++){const cx=px+cell*(.2+.6*ESCAPE_TERRAIN_HASH(x,y,i+150)),cy=py+topH*(.2+.6*ESCAPE_TERRAIN_HASH(x,y,i+160)),rr=cell*(.18+.16*ESCAPE_TERRAIN_HASH(x,y,i+170)),k=(ESCAPE_TERRAIN_HASH(x,y,i+180)-.45)*.3;
    fill(...escapeTerrainMix(top,k),170);beginShape();for(let j=0;j<5;j++){const a=j/5*Math.PI*2+ESCAPE_TERRAIN_HASH(x,y,i*7+j)*.8;vertex(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.8);}endShape(CLOSE);}
  stroke(...escapeTerrainMix(top,-.45),110);strokeWeight(Math.max(1,cell*.022));if(ESCAPE_TERRAIN_HASH(x,y,190)<.45)line(px+cell*.3,py+topH*.25,px+cell*.55,py+topH*.6);noStroke();
  // Rough edges against open ground.
  const lump=(cx,cy,d,c)=>{fill(...c);ellipse(cx,cy,d,d*.8);};
  for(let i=0;i<2;i++){const t=(i+.5)/2+(ESCAPE_TERRAIN_HASH(x,y,i+195)-.5)*.3,d=cell*(.12+.07*ESCAPE_TERRAIN_HASH(x,y,i+197));
    if(n)lump(px+t*cell,py+cell*.02,d,escapeTerrainMix(top,.1));if(w)lump(px+cell*.03,py+t*topH,d,top);if(e)lump(px+cell*.97,py+t*topH,d,escapeTerrainMix(top,-.08));}
  if(s){fill(...escapeTerrainMix(face,-.2),120);for(let i=0;i<3;i++){const sx=px+cell*(.12+.76*ESCAPE_TERRAIN_HASH(x,y,i+200));triangle(sx-cell*.06,py+topH,sx+cell*.06,py+topH,sx,py+cell*.96);}fill(0,0,0,50);rect(px,py+topH,cell,cell*.035);}
}
function escapeTerrainSandstone({x,y,px,py,cell,top,face,s,topH}){
  // Layered rock: soft horizontal strata, brighter bands and a worn edge.
  for(let i=0;i<4;i++){const yy=py+topH*(.15+i*.22)+ESCAPE_TERRAIN_HASH(x,y,i+210)*cell*.05;fill(...escapeTerrainMix(top,i%2?.1:-.08),120);rect(px,yy,cell,cell*.07);}
  fill(...escapeTerrainMix(top,-.3),70);for(let i=0;i<3;i++)ellipse(px+cell*(.2+.6*ESCAPE_TERRAIN_HASH(x,y,i+215)),py+topH*(.2+.6*ESCAPE_TERRAIN_HASH(x,y,i+218)),cell*.06,cell*.04);
  if(s){for(let i=0;i<3;i++){fill(...escapeTerrainMix(face,i%2?.1:-.06));rect(px,py+topH+i*cell*.08,cell,cell*.08);}fill(0,0,0,40);rect(px,py+topH,cell,cell*.03);}
}
function escapeTerrainIce({x,y,px,py,cell,top,face,s,n,topH}){
  fill(255,255,255,40);beginShape();vertex(px+cell*.1,py+topH*.15);vertex(px+cell*.45,py+topH*.1);vertex(px+cell*.15,py+topH*.55);endShape(CLOSE);
  stroke(240,250,255,90);strokeWeight(Math.max(1,cell*.025));line(px+cell*(.55+.2*ESCAPE_TERRAIN_HASH(x,y,220)),py+topH*.3,px+cell*.85,py+topH*.75);noStroke();
  if(n){fill(250,253,255,70);rect(px+cell*.05,py+cell*.02,cell*.9,cell*.05,cell*.02);}
  if(s){fill(...escapeTerrainMix(face,.18),200);for(let i=0;i<3;i++){const sx=px+cell*(.15+.35*i);triangle(sx,py+topH,sx+cell*.18,py+topH,sx+cell*.09,py+cell*(.86+.1*ESCAPE_TERRAIN_HASH(x,y,i+225)));}}
}

// ---- Water ----------------------------------------------------------------------------------------
// The still part, in the tile layer: shallow water ('U') and deep channels ('P', outside the
// grotto and the heights) as one body. Water darkens with distance from the bank, and a damp band
// and a pale lip mark the shore.
function escapeTerrainWaterDepth(g){
  const W=g.width,H=g.height,d=Array.from({length:H},()=>Array(W).fill(0)),queue=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!escapeTerrainWater(g.grid[y][x]))continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!escapeTerrainWater(g.grid[y+dy]?.[x+dx]??'#'))){d[y][x]=1;queue.push([x,y]);}}
  for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(escapeTerrainWater(g.grid[ny]?.[nx])&&!d[ny][nx]){d[ny][nx]=d[y][x]+1;queue.push([nx,ny]);}}}
  return d;
}
function escapeTerrainDeepIsWater(index){return !(index>=78&&index<88);}
function drawEscapeTerrainWater(g,cell,index,palette){
  const W=g.width,H=g.height,deepWater=escapeTerrainDeepIsWater(index),isW=t=>t==='U'||(deepWater&&t==='P'),at=(x,y)=>g.grid[y]?.[x];
  const depth=escapeTerrainWaterDepth(g);
  const shallow=[38,112,128],deep=[18,62,86],abyss=[9,30,48];noStroke();
  // Flat colour per kind, then depth as soft overlapping pools, so it darkens smoothly away from the bank.
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=at(x,y);if(!isW(t))continue;fill(...(t==='P'?abyss:shallow));rect(x*cell-.5,y*cell-.5,cell+1,cell+1);}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=at(x,y);if(t!=='U'||(depth[y][x]||0)<2)continue;const k=Math.min(3,depth[y][x]-1);
    for(const [r,a] of [[1.5,10],[1.1,12],[.7,14]]){fill(...deep,a*k);ellipse((x+.5)*cell,(y+.5)*cell,cell*r,cell*r);}}
  // Where shallows drop into a deep channel: a soft dark fall-off on the shallow side.
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(at(x,y)!=='U')continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){if(at(x+dx,y+dy)!=='P'||!deepWater)continue;
    for(let i=0;i<4;i++){fill(...abyss,26);const s=(i+1)*.09;dx?rect((x+(dx>0?1-s:0))*cell,y*cell,s*cell,cell):rect(x*cell,(y+(dy>0?1-s:0))*cell,cell,s*cell);}}}
  // Rounded shores: a land corner sticking into water is cut round with water, and a water corner
  // tucked into land is filled round with ground, so banks curve instead of stepping.
  const ground=palette?escapeTerrainTint(palette[0],escapeTerrainSet(g).ground):[60,70,60],r=cell*.34;
  const corner=(cx,cy,sx,sy,c)=>{fill(...c);beginShape();vertex(cx,cy);vertex(cx+sx*r,cy);for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;vertex(cx+sx*(r-r*Math.sin(a)),cy+sy*(r-r*Math.cos(a)));}vertex(cx,cy+sy*r);endShape(CLOSE);};
  // The rounded corners are kept on the game too, so the moving foam can follow them.
  const corners=[],cornerSet=new Set();
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=at(x,y);if(t===undefined)continue;const me=isW(t);
    for(const [sx,sy] of [[1,1],[-1,1],[1,-1],[-1,-1]]){const a=at(x+sx,y),b=at(x,y+sy),d=at(x+sx,y+sy);if(a===undefined||b===undefined||d===undefined)continue;
      const X=x+(sx>0?1:0),Y=y+(sy>0?1:0),cx=X*cell,cy=Y*cell;let hit=false;
      if(!me&&!escapeTerrainSolid(g,x,y)&&isW(a)&&isW(b)&&isW(d)){corner(cx,cy,-sx,-sy,a==='P'&&b==='P'?abyss:shallow);hit=true;}
      else if(me&&!isW(a)&&!isW(b)&&!isW(d)&&!escapeTerrainSolid(g,x+sx,y)&&!escapeTerrainSolid(g,x,y+sy)&&!escapeTerrainSolid(g,x+sx,y+sy)){corner(cx,cy,-sx,-sy,ground);hit=true;}
      if(hit){corners.push({X,Y,qx:-sx,qy:-sy});cornerSet.add(X+','+Y);}}}
  g.terrainCorners=corners;g.terrainCornerSet=cornerSet;g.terrainCornerR=.34;
  // The shore: damp ground and a pale wet lip on the land side, and pebbles in the shallows.
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!isW(at(x,y)))continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nt=at(nx,ny);if(nt===undefined||isW(nt)||escapeTerrainSolid(g,nx,ny))continue;
    const bx=dx>0?x+1:x,by=dy>0?y+1:y,round=(X,Y)=>cornerSet.has(X+','+Y)?r:0,inset=(i,j)=>dx?round(bx,j<0?y:y+1):round(i<0?x:x+1,by);
    for(const [w,c] of [[.16,[0,0,0,34]],[.05,[220,236,220,36]]]){fill(...c);
      if(dx){const y0=y*cell+inset(0,-1),y1=(y+1)*cell-inset(0,1);rect(dx>0?bx*cell:(bx-w)*cell,y0,w*cell,y1-y0);}
      else{const x0=x*cell+inset(-1,0),x1=(x+1)*cell-inset(1,0);rect(x0,dy>0?by*cell:(by-w)*cell,x1-x0,w*cell);}}}
    if(at(x,y)==='U'&&ESCAPE_TERRAIN_HASH(x,y,230)<.3){fill(180,200,180,40);for(let i=0;i<3;i++)ellipse((x+.2+.6*ESCAPE_TERRAIN_HASH(x,y,231+i))*cell,(y+.2+.6*ESCAPE_TERRAIN_HASH(x,y,235+i))*cell,cell*.1,cell*.07);}}
}
// The moving part, each frame: long soft highlights drifting over the whole body, and foam that
// breathes along the banks.
function drawEscapeWaterSurface(g,cell,view,index){
  if(!escapeLightingFull())return;const t=g.elapsed,deepWater=escapeTerrainDeepIsWater(index),isW=tt=>tt==='U'||(deepWater&&tt==='P'),seen=(x,y)=>!view.follow||g.visibleTile(x,y);
  strokeWeight(Math.max(1,cell*.03));noFill();
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){const tt=g.grid[y][x];if(!isW(tt)||!seen(x,y))continue;
    // Highlights: wave crests in world space, so they run on from tile to tile.
    for(let k=0;k<2;k++){const yy=y+.25+k*.5,phase=t*.9+yy*3.1,a=(Math.sin(phase+x*.7)*.5+.5)*(tt==='P'?22:38);if(a<6)continue;stroke(210,245,250,a);
      beginShape();for(let i=0;i<=4;i++){const xx=x+i*.25;vertex(xx*cell,(yy+Math.sin(xx*2.4+t*1.6+k*2)*.05)*cell);}endShape();}
    // Foam along any bank, stopping short where the bank curves round a corner.
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nt=g.grid[y+dy]?.[x+dx];if(nt===undefined||isW(nt))continue;const pulse=.5+.5*Math.sin(t*1.8+x*1.3+y*.9);
      const bx=dx>0?x+1:x,by=dy>0?y+1:y,rr=g.terrainCornerR||0,cut=(X,Y)=>g.terrainCornerSet?.has(X+','+Y)?rr:0,f0=dx?cut(bx,y):cut(x,by),f1=1-(dx?cut(bx,y+1):cut(x+1,by));
      stroke(235,250,250,40+40*pulse);beginShape();for(let i=0;i<=5;i++){const f=f0+(f1-f0)*i/5,w=Math.sin(f*7+t*2.2+x+y)*.04+.06*pulse;
        if(dx)vertex((x+(dx>0?1-w:w))*cell,(y+f)*cell);else vertex((x+f)*cell,(y+(dy>0?1-w:w))*cell);}endShape();}}
  for(const c of g.terrainCorners||[]){if(!seen(Math.min(g.width-1,c.X),Math.min(g.height-1,c.Y)))continue;const rr=(g.terrainCornerR||.34)*cell,pulse=.5+.5*Math.sin(t*1.8+c.X*1.3+c.Y*.9),a=Math.atan2(-c.qy,-c.qx);
    stroke(235,250,250,40+40*pulse);arc((c.X+c.qx*(g.terrainCornerR||.34))*cell,(c.Y+c.qy*(g.terrainCornerR||.34))*cell,rr*2-cell*.1*pulse,rr*2-cell*.1*pulse,a-Math.PI/4,a+Math.PI/4);}
}

// ---- Zones ----------------------------------------------------------------------------------------
// Areas that matter to play (cold floor, moss) are drawn as one soft sheet with an edge only where
// the area ends, and rounded where it turns a corner, instead of a box on every tile.
function drawEscapeZone(keys,cell,seen,color,alpha,edgeAlpha){
  const has=(x,y)=>keys.has(x+','+y),r=cell*.28;noStroke();
  for(const key of keys){const [x,y]=key.split(',').map(Number);if(!seen(x,y))continue;const n=!has(x,y-1),s=!has(x,y+1),w=!has(x-1,y),e=!has(x+1,y);
    fill(...color,alpha);rect(x*cell,y*cell,cell,cell,n&&w?r:0,n&&e?r:0,s&&e?r:0,s&&w?r:0);
    if(edgeAlpha){stroke(...color,edgeAlpha);strokeWeight(Math.max(1,cell*.035));const i=cell*.04,X=x*cell,Y=y*cell;
      if(n)line(X+(w?r:0),Y+i,X+cell-(e?r:0),Y+i);if(s)line(X+(w?r:0),Y+cell-i,X+cell-(e?r:0),Y+cell-i);
      if(w)line(X+i,Y+(n?r:0),X+i,Y+cell-(s?r:0));if(e)line(X+cell-i,Y+(n?r:0),X+cell-i,Y+cell-(s?r:0));noStroke();}}
}
