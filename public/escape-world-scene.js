let escapeWorld=null,escapeLibraryOpen=false,escapeWorldHudSignature='',escapeWorldToastUntil=0;
const ESCAPE_CACHE_VALUE=5;
function escapeRegionStars(chapter){const c=escapeWorld.chapters[chapter];let stars=0;for(let i=c.start;i<c.end;i++)stars+=escapeProgress.data.levels[EscapeCatalog.levels[i].id]?.stars||0;return {stars,max:(c.end-c.start)*3};}
function renderEscapeWorldTotals(){
  const t=escapeProgress.totals(ESCAPE_CACHE_VALUE),el=document.getElementById('world-totals');if(!el)return;
  el.innerHTML='<span title="Best stars across every escape">★ '+t.stars+' / '+t.maxStars+'</span><span title="Best treasure from every escape plus hidden caches">◆ '+t.treasure+' treasure</span><span title="Extra challenges completed">⚑ '+t.challenges+' / '+t.maxChallenges+'</span><span title="Hidden world caches found">✦ '+t.caches+' / '+escapeWorld.caches.length+' caches</span><span title="Golden flies caught on the trail">✧ '+t.goldflies+' golden flies</span>';
  for(const option of document.getElementById('world-travel')?.options||[]){const i=Number(option.value),r=escapeRegionStars(i);option.textContent=(i+1)+' · '+escapeWorld.chapters[i].name+' · ★'+r.stars+'/'+r.max;}
}
const ESCAPE_FOLK_TIPS=['Cracked walls are shortcuts. Face one and burrow!','Blue switches open blue gates. Watch where they lead.','A tongue can grab treasure across water. Walls still block it.','When the maze changes behind you, look for the new way out.','Some hatches want treasure before they will open.','A raised scorpion tail cannot change its aim. Step off the circle.','Toads crouch before they leap. Leave their lane.','From here on you can drop your tail once if something catches you.','Your footprints glow in the dark, and moths love them.','Seeds grow cover, or brace a root door open.','Swimming is slow, but land hunters will not follow you in.','Pink bugs grow tails back. Every lizard here knows it.','Rival hunters fight when they meet. Let them.'];
function escapeNpcLine(npc){
  const w=escapeWorld,c=w.chapters[npc.chapter],r=escapeRegionStars(npc.chapter),here=w.caches.filter(k=>k.chapter===npc.chapter),found=here.filter(k=>w.found.has(k.id)).length;
  const lines=[ESCAPE_FOLK_TIPS[npc.chapter]||'Mind the hunters out there.'];
  if(found<here.length)lines.push('I saw something glinting in the far corners of '+c.name+'.');
  lines.push(r.stars===r.max?'Every star in '+c.name+'! The whole marsh is talking about you.':r.stars?'You have '+r.stars+' of '+r.max+' stars here. Treasure and staying unseen earn the rest.':'Welcome to '+c.name+', Sally. The flags mark the escapes.');
  lines.push('Golden flies love warm paths. Run into one, or press R to grab it.');
  return npc.name+': '+lines[Math.floor(w.elapsed/4.5)%lines.length];
}
function escapeWorldToast(text){escapeWorldToastUntil=millis()+3500;const toast=document.getElementById('world-toast');if(toast)toast.textContent=text;}
function escapeWorldCaughtFly(){const n=escapeProgress.catchGoldfly();escapeWorldToast('Golden fly caught! +2 treasure ('+n+' caught so far).');escapeSound('treasure');renderEscapeWorldTotals();}
function escapeWorldAnnounceRegions(){
  const before=escapeProgress.data.regionsSeen.length,open=escapeWorld.chapters.map((_,i)=>i).filter(i=>escapeWorld.regionOpen(i)),fresh=escapeProgress.announceRegions(open);
  // A brand new save or an older save meeting this feature learns its regions silently.
  if(before&&fresh.length){escapeWorldToast('A new path has opened: '+escapeWorld.chapters[fresh.at(-1)].name+'!');escapeSound('key');}
}
function escapeWorldFoundCache(cache){
  if(!escapeProgress.findCache(cache.id))return;escapeWorldToast('Hidden cache found! +'+ESCAPE_CACHE_VALUE+' treasure for Sally’s hoard.');
  escapeSound('cache');renderEscapeWorldTotals();
}
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
  escapeWorld.found=new Set(escapeProgress.data.caches);escapeWorld.onCache=escapeWorldFoundCache;escapeWorld.onFly=escapeWorldCaughtFly;
  escapeWorld.refreshRegions();document.getElementById('escape-select').style.display='none';document.getElementById('game-container').style.display='block';
  document.getElementById('game-area').classList.add('escape-world-open');
  mountEscapeChrome(true);document.getElementById('escape-world-ui').style.display='block';document.getElementById('escape-world-portals').style.display='block';
  document.getElementById('escape-world-ui').innerHTML=`<div class="world-heading"><span>SALLY’S ESCAPE TRAIL</span><h2 id="world-region-name">Sunny Meadow</h2><label class="world-travel">Travel <select id="world-travel">${escapeWorld.chapters.map((c,i)=>'<option '+(escapeWorld.regionOpen(i)?'':'disabled')+' value="'+i+'">'+(i+1)+' · '+c.name+'</option>').join('')}</select></label><div id="world-totals" class="world-totals"></div></div><div class="world-guide"><span>WASD / arrows · Shift to run · R grabs golden flies</span><p>Explore the clearings. Click an entrance to guide Sally there.</p><button id="world-library">Levels & challenges</button><button id="world-home">Main menu</button><p id="world-toast" class="world-toast" role="status" aria-live="polite"></p></div><article class="world-route"><span id="world-route-number">THE TRAIL</span><h3 id="world-route-name">A new escape awaits</h3><p id="world-route-brief"></p><p id="world-route-best"></p><p id="world-route-challenge" class="world-route-challenge"></p><button id="world-enter" class="escape-primary">Enter escape <span class="key-hint">[Enter]</span></button><button id="world-challenge" class="escape-secondary" style="display:none"></button></article>`;
  document.getElementById('world-travel').onchange=e=>{if(!escapeWorld.travel(Number(e.target.value)))renderEscapeWorldHUD();clearTouchInput();suppressHeldKeys();document.activeElement?.blur?.();};
  document.getElementById('world-library').onclick=openEscapeLibrary;document.getElementById('world-home').onclick=leaveEscape;document.getElementById('world-enter').onclick=enterEscapeWorld;
  document.getElementById('escape-world-portals').innerHTML=escapeWorld.nodes.map(n=>'<button id="world-node-'+n.id+'" class="world-node" aria-label="'+(n.index+1)+' · '+n.name+'">'+(n.index+1)+'</button>').join('');
  for(const node of escapeWorld.nodes)document.getElementById('world-node-'+node.id).onclick=()=>{escapeWorld.walkTo(node.id);document.activeElement?.blur?.();};
  const size=canvasDimensions();resizeCanvas(size.width,size.height,true);clearTouchInput();suppressHeldKeys();updateToolbar();renderEscapeWorldTotals();escapeWorldAnnounceRegions();renderEscapeWorldHUD();
}
function openEscapeLibrary(){
  escapeLibraryOpen=true;clearTouchInput();suppressHeldKeys();document.getElementById('game-area').classList.remove('escape-world-open');
  document.getElementById('game-container').style.display='none';document.getElementById('escape-select').style.display='block';document.getElementById('world-list-back').focus();updateToolbar();
}
function enterEscapeWorld(){const id=escapeWorld?.enter();if(id)startEscape({levelId:id});}
function renderEscapeWorldHUD(){
  const w=escapeWorld,c=w.chapters[w.chapterAt()]||w.chapters[0],node=w.nearby(),level=node&&EscapeCatalog.levels[node.index],saved=node&&escapeProgress.data.levels[node.id],unlocked=node&&escapeProgress.unlocked(node.id);
  const toast=document.getElementById('world-toast');if(toast&&millis()>escapeWorldToastUntil){const ci=w.chapters.indexOf(c),here=w.caches.filter(k=>k.chapter===ci),found=here.filter(k=>w.found.has(k.id)).length;toast.textContent=found<here.length?'Treasure caches hidden in '+c.name+': '+found+' / '+here.length+' found.':'Every cache in '+c.name+' found.';}
  const challenge=node&&EscapeCatalog.challenges.find(ch=>ch.levelId===node.id),challengeSaved=challenge&&escapeProgress.data.challenges[challenge.id];
  const signature=JSON.stringify([c.name,node?.id,saved?.bestTime,saved?.revision,unlocked,challengeSaved?.bestTime]);if(signature===escapeWorldHudSignature)return;escapeWorldHudSignature=signature;
  document.getElementById('world-region-name').textContent=c.name;for(const option of document.getElementById('world-travel').options||[])option.disabled=!w.regionOpen(Number(option.value));document.getElementById('world-travel').value=String(w.chapters.indexOf(c));
  document.getElementById('world-route-number').textContent=node?(level.expedition?'EXPEDITION ':'ESCAPE ')+(node.index+1)+(unlocked?'':' · LOCKED'):'EXPLORE THE WORLD';
  document.getElementById('world-route-name').textContent=level?.name||'Choose your own direction';
  document.getElementById('world-route-brief').textContent=level?.brief||'No enemies here. Hunt for glinting treasure caches, or choose your next adventure.';
  document.getElementById('world-route-best').textContent=saved?escapeRecordSummary(level,saved):node&&!unlocked?escapeUnlockHint(level):node?'A new route awaits.':'';
  const challengeLine=document.getElementById('world-route-challenge'),challengeButton=document.getElementById('world-challenge'),challengeOpen=challenge&&escapeProgress.challengeUnlocked(challenge.id);
  challengeLine.textContent=challenge?'⚑ Challenge · '+challenge.name+' — '+(challengeSaved?escapeRecordSummary(level,challengeSaved,true):challengeOpen?challenge.brief:'Clear this escape to unlock.'):'';
  challengeButton.style.display=challengeOpen?'':'none';challengeButton.textContent=challengeSaved?'Replay challenge':'Try challenge';challengeButton.onclick=challengeOpen?()=>startEscape({challengeId:challenge.id}):null;
  const enter=document.getElementById('world-enter');enter.disabled=!unlocked;enter.innerHTML=unlocked?(saved?'Play again':'Enter escape')+' <span class="key-hint">[Enter]</span>':node?'Trail locked':'Find an entrance';
}
function playEscapeWorld(){
  if(!escapeWorld||escapeLibraryOpen)return;if(!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){escapeWorld.advance(deltaTime/1000,escapeMovement());escapeFootsteps(escapeWorld.player);}drawEscapeWorld();renderEscapeWorldHUD();
}
function drawEscapeWorld(){
  const w=escapeWorld,cell=width<600?23:30,clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),cx=clamp(w.player.x,width/(2*cell),w.width-width/(2*cell)),cy=clamp(w.player.y,(height-90)/(2*cell),w.height-(height-90)/(2*cell)),ox=width/2-cx*cell,oy=(width<600?height*.42:(height+30)/2)-cy*cell;
  const bounds=document.getElementById('game-container').getBoundingClientRect?.()||{left:0,top:0,width,height},panels=[...document.querySelectorAll('.world-heading,.world-route,.world-guide,.world-touch #movement-stick,.world-touch .direction-pad,.world-touch .ability-pad')].map(p=>p.getBoundingClientRect());
  // Flag number buttons are DOM elements above the canvas; hide any the villager's speech bubble covers.
  const talking=w.nearbyNpc();if(talking){const b=escapeSpeechRect(talking,cell),sx=v=>bounds.left+(v+ox)/width*bounds.width,sy=v=>bounds.top+(v+oy)/height*bounds.height;panels.push({left:sx(b.x),right:sx(b.x+b.w),top:sy(b.y),bottom:sy(b.y+b.h+cell*.3)});}
  const palettes={meadow:[[134,168,106],[51,86,65],[175,190,130]],garden:[[114,153,102],[50,83,63],[161,177,123]],river:[[103,156,127],[43,90,81],[150,182,139]],ruins:[[123,147,111],[73,94,82],[171,177,139]],quarry:[[155,138,104],[99,91,75],[192,173,132]],desert:[[201,162,99],[135,112,73],[232,193,125]],marsh:[[99,141,109],[40,81,72],[143,164,120]],jungle:[[77,125,91],[27,74,54],[122,153,94]],glow:[[38,77,82],[18,44,52],[96,168,151]],orchard:[[126,153,93],[56,93,53],[180,185,119]],coast:[[179,176,121],[56,118,110],[221,201,143]],hollow:[[128,104,112],[58,40,56],[176,140,150]],lantern:[[70,104,104],[24,52,58],[120,170,150]]};
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
  for(const sign of w.signs)if(w.regionOpen(sign.chapter))drawEscapeWorldSign(sign,w.chapters[sign.chapter],escapeRegionStars(sign.chapter),cell);
  for(const cache of w.caches)if(w.regionOpen(cache.chapter))drawEscapeWorldCache(cache,w.found.has(cache.id),cell,w.elapsed,Math.hypot(cache.x+.5-w.player.x,cache.y+.5-w.player.y));
  for(const n of w.nodes){const x=n.x*cell,y=n.y*cell,saved=escapeProgress.data.levels[n.id],unlocked=escapeProgress.unlocked(n.id);noStroke();fill(48,82,62,75);ellipse(x,y+cell*.35,cell*1.5,cell*.55);fill(unlocked?189:139,unlocked?202:156,unlocked?142:131);rect(x-cell*.65,y-cell*.65,cell*1.3,cell*1.3,cell*.22);fill(unlocked?55:100,unlocked?99:117,unlocked?70:99);rect(x-cell*.38,y-cell*.45,cell*.76,cell*.95,cell*.35);stroke(101,110,79);strokeWeight(cell*.045);line(x+cell*.5,y+cell*.3,x+cell*.5,y-cell*.7);noStroke();fill(...(saved?[70,147,90]:unlocked?[221,139,69]:[118,134,115]));triangle(x+cell*.5,y-cell*.7,x+cell*1.05,y-cell*.48,x+cell*.5,y-cell*.26);
    if(saved){textSize(cell*.36);textAlign(CENTER,CENTER);noStroke();for(let i=0;i<3;i++){fill(...(i<saved.stars?[255,214,92]:[40,58,46,160]));text('★',x+(i-1)*cell*.36,y+cell*1.02);}}
    const challenge=EscapeCatalog.challenges.find(c=>c.levelId===n.id);if(challenge){const done=escapeProgress.data.challenges[challenge.id]?.cleared,open=escapeProgress.challengeUnlocked(challenge.id),bx=x-cell*.72,by=y-cell*.7;noStroke();fill(...(done?[255,205,86]:open?[236,224,190]:[120,132,118]));ellipse(bx,by,cell*.42,cell*.42);fill(...(done?[110,70,20]:[55,70,60]));textSize(cell*.26);text('⚑',bx,by+cell*.01);}
    const button=document.getElementById('world-node-'+n.id),sx=x+ox,sy=y+oy,px=bounds.left+sx/width*bounds.width,py=bounds.top+sy/height*bounds.height,covered=panels.some(p=>px+20>p.left&&px-20<p.right&&py+20>p.top&&py-20<p.bottom);button.style.display=!covered&&sx>=30&&sx<=width-30&&sy>=30&&sy<=height-30?'block':'none';button.style.left=sx/width*100+'%';button.style.top=sy/height*100+'%';button.className='world-node '+(saved?'world-cleared':unlocked?'world-available':'world-locked');button.setAttribute('aria-label',(n.index+1)+' · '+n.name+(saved?' · cleared':unlocked?' · available':' · locked'));
  }
  for(const npc of w.npcs)if(w.regionOpen(npc.chapter))drawEscapeWorldNpc(npc,cell,w.elapsed);
  if(w.lick){const head=w.motion.lizard.joints[0];stroke(232,110,140);strokeWeight(cell*.08);line(head.x*cell,head.y*cell,w.lick.x*cell,w.lick.y*cell);}
  drawEscapeLizard(w.motion.lizard,cell,w.motion.clock);
  for(const [i,c] of w.chapters.entries())if(w.regionOpen(i))drawEscapeWorldCritters(c,i,w,cell);
  if(w.fly)drawEscapeGoldfly(w.fly,cell,w.elapsed);
  // Cloud shadows drift across the whole trail.
  noStroke();for(let i=0;i<7;i++){const cx=((i*41+w.elapsed*.35)%(w.width+24))-12,cy=(i*13+7)%w.height;fill(10,30,25,26);ellipse(cx*cell,cy*cell,cell*7,cell*3.4);ellipse((cx+2.6)*cell,(cy-.8)*cell,cell*5,cell*2.6);}
  if(talking)drawEscapeSpeech(talking,escapeNpcLine(talking),cell);
  pop();
  // A slow day and night cycle tints the trail every four minutes.
  const night=(1-Math.cos(w.elapsed/240*Math.PI*2))/2;if(night>.02){noStroke();fill(12,22,58,110*night);rect(0,0,width,height);}
}
function drawEscapeWorldNpc(npc,cell,clock){
  push();translate((npc.x+.5)*cell,(npc.y+.5)*cell);scale(1.45);translate(-(npc.x+.5)*cell,-(npc.y+.5)*cell);
  const x=(npc.x+.5)*cell,bob=Math.sin(clock*2+npc.chapter)*cell*.04,y=(npc.y+.5)*cell+bob;noStroke();fill(7,26,19,70);ellipse(x,(npc.y+.5)*cell+cell*.3,cell*.9,cell*.3);
  if(npc.kind==='tortoise'){fill(98,128,74);ellipse(x+cell*.36,y,cell*.3,cell*.24);fill(122,94,58);arc(x,y+cell*.08,cell*.85,cell*.7,PI,TWO_PI);fill(150,118,72);for(const d of [-.2,0,.2])ellipse(x+d*cell,y-cell*.12,cell*.18,cell*.14);fill(20);ellipse(x+cell*.43,y-cell*.03,cell*.05,cell*.05);}
  else if(npc.kind==='snail'){fill(196,170,120);ellipse(x+cell*.1,y+cell*.16,cell*.8,cell*.22);fill(186,120,92);ellipse(x-cell*.05,y-cell*.08,cell*.55,cell*.55);noFill();stroke(120,70,52);strokeWeight(cell*.04);arc(x-cell*.05,y-cell*.08,cell*.3,cell*.3,0,PI*1.5);noStroke();stroke(196,170,120);strokeWeight(cell*.03);line(x+cell*.38,y+cell*.1,x+cell*.45,y-cell*.12);noStroke();}
  else if(npc.kind==='frog'){fill(92,170,92);ellipse(x,y+cell*.05,cell*.65,cell*.5);for(const s of [-1,1]){fill(110,190,110);ellipse(x+s*cell*.17,y-cell*.17,cell*.22,cell*.22);fill(20);ellipse(x+s*cell*.17,y-cell*.18,cell*.09,cell*.09);}fill(60,120,64);arc(x,y+cell*.05,cell*.3,cell*.15,0,PI);}
  else{fill(70,92,150);ellipse(x,y,cell*.42,cell*.6);stroke(30,40,70);strokeWeight(cell*.03);line(x,y-cell*.3,x,y+cell*.3);for(const s of [-1,1])for(const o of [-.12,0,.12])line(x+s*cell*.2,y+o*cell,x+s*cell*.34,y+o*cell+cell*.06);noStroke();fill(150,190,255,120);ellipse(x-cell*.08,y-cell*.12,cell*.1,cell*.18);}
  fill(255,246,220,230);textAlign(CENTER,CENTER);textSize(cell*.28);text(npc.name,x,y-cell*.62);pop();
}
function escapeSpeechRect(npc,cell){const w=cell*8,h=cell*2.2;return {x:(npc.x+.5)*cell-w/2,y:(npc.y+.5)*cell-cell*1.2-h,w,h};}
function drawEscapeSpeech(npc,line,cell){
  const {w,h,x,y}=escapeSpeechRect(npc,cell);noStroke();fill(250,244,222,240);rect(x,y,w,h,cell*.25);triangle((npc.x+.3)*cell,y+h,(npc.x+.7)*cell,y+h,(npc.x+.5)*cell,y+h+cell*.3);
  fill(44,58,44);textAlign(LEFT,TOP);textSize(cell*.36);text(line,x+cell*.25,y+cell*.2,w-cell*.5,h-cell*.3);textAlign(CENTER,CENTER);
}
function drawEscapeGoldfly(fly,cell,clock){
  const x=fly.x*cell,y=fly.y*cell,pulse=.5+.5*Math.sin(clock*7),fade=Math.min(1,(fly.expires-clock)/2);noStroke();
  fill(255,214,80,(60+60*pulse)*fade);ellipse(x,y,cell*(1+pulse*.3),cell*(1+pulse*.3));const flap=Math.abs(Math.sin(clock*30));
  fill(255,250,220,200*fade);for(const s of [-1,1])ellipse(x+s*cell*.13,y-cell*.05,cell*.2,cell*(.08+flap*.1));fill(255,200,40,255*fade);ellipse(x,y,cell*.2,cell*.28);
}
function drawEscapeWorldSign(sign,chapter,region,cell){
  const x=(sign.x+.5)*cell,y=(sign.y+.5)*cell,complete=region.stars===region.max;
  noStroke();fill(7,26,19,60);ellipse(x,y+cell*.5,cell*.9,cell*.25);fill(70,52,32);rect(x-cell*.07,y-cell*.2,cell*.14,cell*.75);
  fill(...(complete?[236,196,84]:[166,124,78]));rect(x-cell*1.25,y-cell*.8,cell*2.5,cell*.8,cell*.14);fill(...(complete?[255,226,130]:[188,146,96]));rect(x-cell*1.15,y-cell*.72,cell*2.3,cell*.12,cell*.06);
  fill(...(complete?[92,60,10]:[255,246,220]));textAlign(CENTER,CENTER);textSize(cell*.38);text((complete?'♛ ':'★ ')+region.stars+'/'+region.max,x,y-cell*.38);
}
function drawEscapeWorldCache(cache,found,cell,clock,near){
  const x=(cache.x+.5)*cell,y=(cache.y+.5)*cell;noStroke();
  if(found){fill(110,78,44);rect(x-cell*.28,y-cell*.08,cell*.56,cell*.3,cell*.05);fill(160,118,62);quad(x-cell*.28,y-cell*.08,x+cell*.28,y-cell*.08,x+cell*.22,y-cell*.36,x-cell*.22,y-cell*.36);return;}
  // A dig mound with an occasional glint. It shines brighter as Sally gets close.
  fill(96,74,46,150);ellipse(x,y+cell*.1,cell*.7,cell*.32);fill(126,98,60);ellipse(x,y,cell*.5,cell*.26);
  const glint=Math.max(0,Math.sin(clock*2.4+cache.x))**8,closeness=Math.max(0,1-near/5);
  fill(255,236,150,80+175*Math.max(glint,closeness));const r=cell*(.12+.18*Math.max(glint,closeness*.7));
  quad(x,y-cell*.15-r,x+r*.35,y-cell*.15,x,y-cell*.15+r,x-r*.35,y-cell*.15);quad(x-r,y-cell*.15,x,y-cell*.15-r*.35,x+r,y-cell*.15,x,y-cell*.15+r*.35);
}
function drawEscapeWorldCritters(chapter,index,w,cell){
  // Harmless wildlife drifts around each open courtyard and scatters from Sally.
  const kind={meadow:'butterfly',garden:'butterfly',orchard:'butterfly',river:'dragonfly',coast:'dragonfly',ruins:'moth',quarry:'beetle',desert:'beetle',marsh:'firefly',jungle:'firefly',glow:'firefly',hollow:'firefly',lantern:'firefly'}[chapter.theme];
  const colors={meadow:[245,214,96],garden:[236,150,190],orchard:[250,250,240],river:[110,210,230],coast:[90,200,210],ruins:[214,200,170],quarry:[60,48,36],desert:[70,52,30],marsh:[210,255,140],jungle:[190,255,120],glow:[120,255,230],hollow:[255,140,190],lantern:[255,214,110]}[chapter.theme];
  for(let k=0;k<5;k++){
    const seed=index*7.31+k*2.17,t=w.elapsed*(kind==='beetle'?.18:.32)+seed;
    let px=chapter.x+.5+Math.sin(t*1.3+seed)*6.2,py=chapter.y+.5+Math.cos(t*.9+seed*1.7)*5.2;
    const d=Math.hypot(px-w.player.x,py-w.player.y);if(d<2.4&&d>0){px+=(px-w.player.x)/d*(2.4-d);py+=(py-w.player.y)/d*(2.4-d);}
    const x=px*cell,y=py*cell;noStroke();push();translate(x,y);scale(1.8);translate(-x,-y);
    if(kind==='firefly'){const glow=.5+.5*Math.sin(w.elapsed*4+seed*3);fill(...colors,40+80*glow);ellipse(x,y,cell*.6,cell*.6);fill(...colors,200);ellipse(x,y,cell*.12,cell*.12);}
    else if(kind==='beetle'){push();translate(x,y);rotate(Math.atan2(Math.sin(t*.9+seed*1.7)*-.9*5.2,Math.cos(t*1.3+seed)*1.3*6.2));fill(...colors);ellipse(0,0,cell*.26,cell*.18);stroke(...colors);strokeWeight(cell*.02);for(const s of [-1,1])for(const o of [-.06,0,.06])line(o*cell,0,(o-.02)*cell,s*cell*.14);pop();}
    else{const flap=Math.abs(Math.sin(w.elapsed*(kind==='dragonfly'?30:12)+seed));fill(...colors,kind==='dragonfly'?150:220);
      if(kind==='dragonfly'){for(const s of [-1,1])ellipse(x+s*cell*.13,y,cell*.24,cell*.07*(.4+flap));fill(40,80,90);rect(x-cell*.02,y-cell*.12,cell*.04,cell*.28);}
      else{for(const s of [-1,1])ellipse(x+s*cell*.08*flap,y,cell*.16*flap+cell*.02,cell*.2);fill(50,40,30);ellipse(x,y,cell*.04,cell*.14);}}
    pop();
  }
}
