let escapeWorld=null,escapeLibraryOpen=false,escapeWorldHudSignature='';
function escapeMovement(){
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return {x:0,y:0,sprint:false};
  return {x:touchStick.x+Number(gameKeyDown(39)||gameKeyDown(68)||touchInput.right)-Number(gameKeyDown(37)||gameKeyDown(65)||touchInput.left),y:touchStick.y+Number(gameKeyDown(40)||gameKeyDown(83)||touchInput.down)-Number(gameKeyDown(38)||gameKeyDown(87)||touchInput.up),sprint:gameKeyDown(16)||touchInput.sprint};
}
function mountEscapeChrome(active){
  const stage=document.getElementById('escape-stage-ui'),area=document.getElementById('game-area'),container=document.getElementById('game-container');
  if(active){for(const id of ['game-toolbar','scoreboard-box','touch-controls'])stage.appendChild(document.getElementById(id));}
  else{area.insertBefore(document.getElementById('game-toolbar'),container);area.insertBefore(document.getElementById('scoreboard-box'),container);area.insertBefore(document.getElementById('touch-controls'),document.getElementById('start-menu-container'));}
  document.getElementById('escape-world-ui').style.display='none';
  document.getElementById('escape-world-portals').style.display='none';
  area.classList.toggle('escape-playing',active);document.body?.classList?.toggle('escape-shell',active);
}
function openEscapeWorld(focusId){
  escapeLibraryOpen=false;escapeWorldHudSignature='';
  if(!escapeWorld)escapeWorld=new EscapeWorld(id=>escapeProgress.unlocked(id),focusId);
  else if(focusId){const node=escapeWorld.nodes.find(n=>n.id===focusId);if(node){escapeWorld.player.x=node.x;escapeWorld.player.y=node.y+1;escapeWorld.target=null;escapeWorld.motion.resetPlayer(escapeWorld.player);}}
  escapeWorld.refreshRegions();document.getElementById('escape-select').style.display='none';document.getElementById('game-container').style.display='block';
  document.getElementById('game-area').classList.add('escape-world-open');
  mountEscapeChrome(true);document.getElementById('escape-world-ui').style.display='block';document.getElementById('escape-world-portals').style.display='block';
  document.getElementById('escape-world-ui').innerHTML=`<div class="world-heading"><span>SALLY’S ESCAPE TRAIL</span><h2 id="world-region-name">Sunny Meadow</h2><label class="world-travel">Travel <select id="world-travel">${escapeWorld.chapters.map((c,i)=>'<option '+(escapeWorld.regionOpen(i)?'':'disabled')+' value="'+i+'">'+(i+1)+' · '+c.name+'</option>').join('')}</select></label></div><div class="world-guide"><span>WASD / arrows · Shift to run</span><p>Explore the clearings. Click an entrance to guide Sally there.</p><button id="world-library">Levels & challenges</button><button id="world-home">Main menu</button></div><article class="world-route"><span id="world-route-number">THE TRAIL</span><h3 id="world-route-name">A new escape awaits</h3><p id="world-route-brief"></p><p id="world-route-best"></p><button id="world-enter" class="escape-primary">Enter escape [Enter]</button></article>`;
  document.getElementById('world-travel').onchange=e=>{if(!escapeWorld.travel(Number(e.target.value)))renderEscapeWorldHUD();clearTouchInput();suppressHeldKeys();document.activeElement?.blur?.();};
  document.getElementById('world-library').onclick=openEscapeLibrary;document.getElementById('world-home').onclick=leaveEscape;document.getElementById('world-enter').onclick=enterEscapeWorld;
  document.getElementById('escape-world-portals').innerHTML=escapeWorld.nodes.map(n=>'<button id="world-node-'+n.id+'" class="world-node" aria-label="'+(n.index+1)+' · '+n.name+'">'+(n.index+1)+'</button>').join('');
  for(const node of escapeWorld.nodes)document.getElementById('world-node-'+node.id).onclick=()=>{escapeWorld.walkTo(node.id);document.activeElement?.blur?.();};
  const size=canvasDimensions();resizeCanvas(size.width,size.height,true);clearTouchInput();suppressHeldKeys();updateToolbar();renderEscapeWorldHUD();
}
function openEscapeLibrary(){
  escapeLibraryOpen=true;clearTouchInput();suppressHeldKeys();document.getElementById('game-area').classList.remove('escape-world-open');
  document.getElementById('game-container').style.display='none';document.getElementById('escape-select').style.display='block';document.getElementById('world-list-back').focus();updateToolbar();
}
function enterEscapeWorld(){const id=escapeWorld?.enter();if(id)startEscape({levelId:id});}
function renderEscapeWorldHUD(){
  const w=escapeWorld,c=w.chapters[w.chapterAt()]||w.chapters[0],node=w.nearby(),level=node&&EscapeCatalog.levels[node.index],saved=node&&escapeProgress.data.levels[node.id],unlocked=node&&escapeProgress.unlocked(node.id);
  const signature=JSON.stringify([c.name,node?.id,saved?.bestTime,saved?.revision,unlocked]);if(signature===escapeWorldHudSignature)return;escapeWorldHudSignature=signature;
  document.getElementById('world-region-name').textContent=c.name;for(const option of document.getElementById('world-travel').options||[])option.disabled=!w.regionOpen(Number(option.value));document.getElementById('world-travel').value=String(w.chapters.indexOf(c));
  document.getElementById('world-route-number').textContent=node?(level.expedition?'EXPEDITION ':'ESCAPE ')+(node.index+1)+(unlocked?'':' · LOCKED'):'EXPLORE THE WORLD';
  document.getElementById('world-route-name').textContent=level?.name||'Choose your own direction';
  document.getElementById('world-route-brief').textContent=level?.brief||'There are no enemies here. Take a look around and choose your next adventure.';
  document.getElementById('world-route-best').textContent=saved?escapeRecordSummary(level,saved):node&&!unlocked?escapeUnlockHint(level):node?'A new route awaits.':'';
  const enter=document.getElementById('world-enter');enter.disabled=!unlocked;enter.textContent=unlocked?(saved?'Play again [Enter]':'Enter escape [Enter]'):node?'Trail locked':'Find an entrance';
}
function playEscapeWorld(){
  if(!escapeWorld||escapeLibraryOpen)return;if(!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))escapeWorld.advance(deltaTime/1000,escapeMovement());drawEscapeWorld();renderEscapeWorldHUD();
}
function drawEscapeWorld(){
  const w=escapeWorld,cell=width<600?23:30,clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),cx=clamp(w.player.x,width/(2*cell),w.width-width/(2*cell)),cy=clamp(w.player.y,(height-90)/(2*cell),w.height-(height-90)/(2*cell)),ox=width/2-cx*cell,oy=(width<600?height*.42:(height+30)/2)-cy*cell;
  const bounds=document.getElementById('game-container').getBoundingClientRect?.()||{left:0,top:0,width,height},panels=[...document.querySelectorAll('.world-heading,.world-route,.world-guide,.world-touch #movement-stick,.world-touch .direction-pad,.world-touch .ability-pad')].map(p=>p.getBoundingClientRect());
  const palettes={meadow:[[134,168,106],[51,86,65],[175,190,130]],garden:[[114,153,102],[50,83,63],[161,177,123]],river:[[103,156,127],[43,90,81],[150,182,139]],ruins:[[123,147,111],[73,94,82],[171,177,139]],quarry:[[155,138,104],[99,91,75],[192,173,132]],desert:[[201,162,99],[135,112,73],[232,193,125]],marsh:[[99,141,109],[40,81,72],[143,164,120]],jungle:[[77,125,91],[27,74,54],[122,153,94]],glow:[[38,77,82],[18,44,52],[96,168,151]],orchard:[[126,153,93],[56,93,53],[180,185,119]],coast:[[179,176,121],[56,118,110],[221,201,143]]};
  background(37,66,54);push();translate(ox,oy);
  const x1=Math.max(0,Math.floor(-ox/cell)),x2=Math.min(w.width-1,Math.ceil((width-ox)/cell)),y1=Math.max(0,Math.floor(-oy/cell)),y2=Math.min(w.height-1,Math.ceil((height-oy)/cell));
  // The grid defines collision, but the overworld reads as continuous terrain.
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const c=w.chapters[w.chapterAt({x,y})],p=palettes[c.theme],tile=w.grid[y][x],floor=['.','L'].includes(tile);noStroke();fill(...p[floor?0:1]);rect(x*cell,y*cell,cell+1,cell+1);
    if(tile==='P'){fill(39,113,132);rect(x*cell,y*cell,cell+1,cell+1);stroke(126,193,182,130);strokeWeight(cell*.04);line((x+.15)*cell,(y+.4)*cell,(x+.82)*cell,(y+.4)*cell);}
    if(floor&&(x*13+y*7)%9===0){stroke(...p[2],75);strokeWeight(cell*.045);line((x+.25)*cell,(y+.7)*cell,(x+.31)*cell,(y+.54)*cell);line((x+.45)*cell,(y+.71)*cell,(x+.42)*cell,(y+.58)*cell);}
  }
  // A winding track gives the main route a readable direction through open spaces.
  for(const track of w.tracks){for(const [color,weight]of track.side?[[[157,174,117,140],.28]]:[[[45,65,45,75],.78],[[206,187,131,210],.58]]){noFill();stroke(...color);strokeWeight(cell*weight);beginShape();const first=track.points[0],last=track.points.at(-1);curveVertex(first.x*cell,first.y*cell);for(const p of track.points)curveVertex(p.x*cell,p.y*cell);curveVertex(last.x*cell,last.y*cell);endShape();}}
  // Border trees, dune rocks and ruined masonry echo the level art without tiling the whole map.
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const tile=w.grid[y][x],c=w.chapters[w.chapterAt({x,y})],p=palettes[c.theme];
    if(tile==='#'){const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>['.','L'].includes(w.grid[y+dy]?.[x+dx]));if(!edge&&(x*7+y*11)%3!==0)continue;const px=(x+.5)*cell,py=(y+.5)*cell;noStroke();fill(7,26,19,65);ellipse(px,py+cell*.29,cell*.9,cell*.4);
      if(['ruins','quarry'].includes(c.theme)){fill(...p[2]);rect(px-cell*.4,py-cell*.35,cell*.8,cell*.65,cell*.12);stroke(...p[1]);strokeWeight(cell*.04);line(px-cell*.25,py-cell*.2,px+cell*.25,py-cell*.2);}
      else if(['desert','coast'].includes(c.theme)){fill(...p[2]);ellipse(px,py,cell*.85,cell*.5);stroke(99,132,76);strokeWeight(cell*.09);line(px,py,px,py-cell*.45);}
      else{fill(...p[1]);ellipse(px,py-cell*.12,cell*.98,cell*.95);fill(...p[2],60);ellipse(px-cell*.17,py-cell*.29,cell*.55,cell*.5);}
    }else if(tile==='L'){noStroke();fill(46,110,67,200);for(const [dx,dy]of [[.3,.4],[.65,.3],[.5,.65]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.5,cell*.45);}
  }
  for(const gate of w.gates){if(w.regionOpen(gate.chapter))continue;const x=gate.x+.5,y=gate.y+.5;stroke(224,187,99);strokeWeight(cell*.1);for(const d of [-1.2,-.8,-.4,0,.4,.8,1.2]){if(gate.vertical)line((x+d)*cell,(y-.32)*cell,(x+d)*cell,(y+.32)*cell);else line((x-.32)*cell,(y+d)*cell,(x+.32)*cell,(y+d)*cell);}noStroke();fill(245,223,151);textAlign(CENTER,CENTER);textSize(cell*.34);text('◇',x*cell,y*cell);}
  for(const n of w.nodes){const x=n.x*cell,y=n.y*cell,saved=escapeProgress.data.levels[n.id],unlocked=escapeProgress.unlocked(n.id);noStroke();fill(48,82,62,75);ellipse(x,y+cell*.35,cell*1.5,cell*.55);fill(unlocked?189:139,unlocked?202:156,unlocked?142:131);rect(x-cell*.65,y-cell*.65,cell*1.3,cell*1.3,cell*.22);fill(unlocked?55:100,unlocked?99:117,unlocked?70:99);rect(x-cell*.38,y-cell*.45,cell*.76,cell*.95,cell*.35);stroke(101,110,79);strokeWeight(cell*.045);line(x+cell*.5,y+cell*.3,x+cell*.5,y-cell*.7);noStroke();fill(...(saved?[70,147,90]:unlocked?[221,139,69]:[118,134,115]));triangle(x+cell*.5,y-cell*.7,x+cell*1.05,y-cell*.48,x+cell*.5,y-cell*.26);
    const button=document.getElementById('world-node-'+n.id),sx=x+ox,sy=y+oy,px=bounds.left+sx/width*bounds.width,py=bounds.top+sy/height*bounds.height,covered=panels.some(p=>px+20>p.left&&px-20<p.right&&py+20>p.top&&py-20<p.bottom);button.style.display=!covered&&sx>=30&&sx<=width-30&&sy>=30&&sy<=height-30?'block':'none';button.style.left=sx/width*100+'%';button.style.top=sy/height*100+'%';button.className='world-node '+(saved?'world-cleared':unlocked?'world-available':'world-locked');button.setAttribute('aria-label',(n.index+1)+' · '+n.name+(saved?' · cleared':unlocked?' · available':' · locked'));
  }
  drawEscapeLizard(w.motion.lizard,cell,w.motion.clock);pop();
}
