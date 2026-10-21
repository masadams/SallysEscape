// Little Explorers: the kids' area from the main menu (levels in escape-kids.js). A row of
// stepping stones, one per level, each showing its sticker once finished; every level is open from
// the start. Progress is each player's own and never touches the campaign's stars or unlocks.
const ESCAPE_KIDS_KEY='sallys-escape-kids';
function escapeKidsLevels(){return typeof EscapeCatalog!=='undefined'&&EscapeCatalog.kids||[];}
function escapeKidsDone(){try{const v=JSON.parse(escapeStore.getItem(ESCAPE_KIDS_KEY)||'[]');return Array.isArray(v)?escapeKidsLevels().map(l=>l.id).filter(id=>v.includes(id)):[];}catch(_){return [];}}
function escapeKidsMark(id){const done=escapeKidsDone();if(done.includes(id)||!escapeKidsLevels().some(l=>l.id===id))return false;done.push(id);try{escapeStore.setItem(ESCAPE_KIDS_KEY,JSON.stringify(done));}catch(_){}return true;}
function escapeKidsGuideOn(){try{return escapeStore.getItem('sallys-escape-kids-guide')!=='off';}catch(_){return true;}}
function openLittleExplorers(focusId){
  const panel=escapeBuilderShow();gameState='kids';
  const done=escapeKidsDone(),levels=escapeKidsLevels(),next=levels.find(l=>!done.includes(l.id)),t=escapeText;
  panel.innerHTML='<div class="kids-picker"><div class="builder-head"><button id="kids-back" class="escape-secondary">← Main menu</button></div>'
    +'<h2 class="kids-title">Little Explorers</h2><p class="kids-sub">Help Sally on '+levels.length+' little adventures. Every one you finish gives you a sticker!</p>'
    +'<button id="kids-guide-toggle" class="escape-secondary" aria-pressed="'+escapeKidsGuideOn()+'">Guiding dots: '+(escapeKidsGuideOn()?'On':'Off')+'</button><p class="kids-guide-note">Follow the dots, or turn them off and explore. Your tools never run out. Step on a trail note to read it.</p>'
    +'<h3 class="kids-section-title">Little discoveries</h3><ol class="kids-stones">'+levels.map((l,i)=>{const got=done.includes(l.id);
      const section=l.adventure&&!levels[i-1]?.adventure?'</ol><h3 class="kids-section-title">Bigger adventures</h3><p class="kids-sub">Six journeys with room to explore. Every treasure is optional.</p><ol class="kids-stones" start="'+(i+1)+'">':'';
      return section+'<li><button class="kids-stone'+(got?' kids-done':'')+(l===next?' kids-next':'')+'" data-id="'+t(l.id)+'" aria-label="'+(i+1)+'. '+t(l.name)+(got?', finished':'')+'">'
        +'<span class="kids-num">'+(i+1)+'</span><span class="kids-sticker" aria-hidden="true">'+(got?t(l.sticker||'⭐'):'?')+'</span><span class="kids-name">'+t(l.name)+'</span></button></li>';}).join('')+'</ol>'
    +'<p class="kids-count">Stickers: '+done.length+' of '+levels.length+(done.length===levels.length?' · You finished them all! 🎉':'')+'</p></div>';
  document.getElementById('kids-back').onclick=closeEscapeBuilder;
  const guide=document.getElementById('kids-guide-toggle');guide.onclick=()=>{const on=!escapeKidsGuideOn();try{escapeStore.setItem('sallys-escape-kids-guide',on?'on':'off');}catch(_){}guide.textContent='Guiding dots: '+(escapeKidsGuideOn()?'On':'Off');guide.setAttribute('aria-pressed',String(escapeKidsGuideOn()));};
  for(const b of panel.querySelectorAll('.kids-stone'))b.onclick=()=>startEscape({kidsId:b.dataset.id});
  const focus=panel.querySelector('.kids-stone[data-id="'+(focusId||next?.id||levels[0]?.id)+'"]');focus?.focus();
}
// The results of a Little Explorers level: a sticker, always a way on, and never a world map.
function escapeKidsResult(r){
  const level=escapeGame.level,levels=escapeKidsLevels(),next=levels[levels.indexOf(level)+1],fresh=escapeKidsMark(level.id),t=escapeText;
  document.getElementById('escape-result-medals').innerHTML='<span class="kids-reward"><span class="kids-reward-sticker" aria-hidden="true">'+t(level.sticker||'⭐')+'</span>'+(fresh?'A new sticker for your collection!':'Well done!')+'</span>';
  document.getElementById('escape-result-challenge').textContent=r.oopses?'Sally said "Oops!" '+r.oopses+' time'+(r.oopses>1?'s':'')+' and kept going. Brave!':'No oopses at all. Super sneaky!';
  const nextButton=document.getElementById('escape-next-btn'),menu=document.getElementById('escape-menu-btn');
  nextButton.style.display='inline-block';nextButton.textContent=next?'Next adventure →':'See your stickers';
  nextButton.onclick=next?()=>startEscape({kidsId:next.id}):()=>openLittleExplorers(level.id);
  menu.style.display='';menu.textContent='Little Explorers';menu.className='escape-secondary';menu.onclick=()=>openLittleExplorers(level.id);
}
// Cache per run: two different levels can have identical start/key coordinates.
// Include the small grid in the key so a grown bush, opened door or tide cannot leave stale dots.
const escapeKidsTrails=new WeakMap();
// What can change the way through in a run, cheaply: gates, smashed walls, grown seeds, fallen floors
// and the tide. The guide replans only when one of these (or Sally's tile) changes.
function escapeKidsGridStamp(g){let fallen=0;if(g.crumbling)for(const c of g.crumbling.values())if(c.fallen)fallen++;
  return [g.gates.map(q=>q.open?1:0).join(''),g.smashed||0,g.seedGrowth?.length||0,fallen,g.tideFlats?.length?g.grid[g.tideFlats[0].y][g.tideFlats[0].x]:''].join(',');}
function drawEscapeKidsGuide(g,cell){
  if(g.status!=='playing')return;
  const t=g.elapsed;drawEscapeKidsSigns(g,cell);push();
  if(g.level.seasonal?seasonProgress().data.guide:escapeKidsGuideOn()){
    const key=[Math.floor(g.player.x),Math.floor(g.player.y),g.hasKey,g.burrows,g.tongues,escapeKidsGridStamp(g)].join('|');
    let guide=escapeKidsTrails.get(g);if(guide?.key!==key){guide={key,...EscapeKidsGuide.plan(g)};escapeKidsTrails.set(g,guide);}
    noStroke();guide.path.slice(1,16).forEach(([x,y],i)=>{const pulse=.5+.5*Math.sin(t*5-i*.7);fill(255,236,140,90+120*pulse);ellipse((x+.5)*cell,(y+.5)*cell,cell*(.22+.08*pulse));});
    const a=guide.action;
    if(a&&Math.hypot(a.at[0]+.5-g.player.x,a.at[1]+.5-g.player.y)<3){
      const x=(a.at[0]+.5)*cell,y=(a.at[1]+.5)*cell;
      noFill();stroke(255,236,140);strokeWeight(cell*.06);ellipse(x,y,cell*.8,cell*.8);
      const label=a.kind==='tongue'?'Tongue':a.kind==='bounce'?'Bounce':'Burrow';
      noStroke();fill(20,35,25,225);rect(x-cell*1.1,y-cell*1.05,cell*2.2,cell*.5,cell*.1);
      fill(255,244,190);textAlign(CENTER,CENTER);textSize(cell*.33);text(label,x,y-cell*.8);
      if(a.face){stroke(255,236,140);strokeWeight(cell*.06);line(x,y,x+a.face[0]*cell*.7,y+a.face[1]*cell*.7);}
    }
  }
  // Checkpoint flags remain visible when guiding dots are off.
  for(const c of g.checkpoints){if(!g.visibleTile(Math.floor(c.x),Math.floor(c.y)))continue;const x=c.x*cell,y=c.y*cell;stroke(90,70,40);strokeWeight(cell*.05);line(x-cell*.15,y+cell*.3,x-cell*.15,y-cell*.32);noStroke();
    fill(...(c.reached?[110,220,120]:[245,245,235]));triangle(x-cell*.13,y-cell*.32,x+cell*.28,y-cell*.2,x-cell*.13,y-cell*.08);}
  pop();
}

// Trail notes are optional reading spots, independent of the campaign's collectable story pages.
// Standing by a note shows a small "Read" prompt; A, Enter, Space or the touch Read button opens it.
// The existing story card supports mouse, touch, A/B and Android Back.
let escapeNearSign=null;
function tickEscapeKidsSign(g){
  const ok=(g?.level.kids||g?.level.seasonal)&&g.status==='playing'&&!g.player.flight&&!g.player.underground;
  const near=ok?(g.level.fieldNotes||[]).find(n=>Math.hypot(g.player.x-n.at[0]-.5,g.player.y-n.at[1]-.5)<.8)||null:null;
  if(near!==escapeNearSign){escapeNearSign=near;if(typeof renderEscapeHUD==='function')renderEscapeHUD(true);}
}
function readEscapeNearSign(){
  const g=escapeGame,near=escapeNearSign;if(!g||!near||gameState!=='escape'||paused||escapeIntroOpen||escapeStoryOpen)return false;
  clearTouchInput();suppressHeldKeys();g.paused=true;
  showEscapeStory({id:near.id,card:{id:near.id,kind:g.level.seasonal?'season-sign':'kids-sign',theme:g.level.seasonalTheme||g.level.kidsTheme,title:near.title,body:[near.body]}},false,()=>{clearTouchInput();suppressHeldKeys();g.paused=paused;skipSimulationFrame=true;});
  return true;
}
function drawEscapeKidsSigns(g,cell){
  for(const n of g.level.fieldNotes||[]){const [x,y]=n.at;if(!g.visibleTile(x,y))continue;push();translate((x+.5)*cell,(y+.5)*cell);noStroke();
    fill(82,60,35);rect(-cell*.04,0,cell*.08,cell*.38);fill(252,238,193);rect(-cell*.3,-cell*.25,cell*.6,cell*.4,cell*.04);
    stroke(111,87,48);strokeWeight(cell*.03);line(-cell*.19,-cell*.12,cell*.19,-cell*.12);line(-cell*.19,-cell*.02,cell*.1,-cell*.02);
    if(n===escapeNearSign){const label=(typeof escapeInputMode==='function'&&escapeInputMode()==='pad'?'A':typeof escapeInputMode==='function'&&escapeInputMode()==='touch'?'Tap Read':'Enter')+' · Read';noStroke();textAlign(CENTER,CENTER);textSize(Math.max(11,cell*.24));const w=textWidth(label)+cell*.3;fill(30,36,32,215);rect(-w/2,-cell*.92,w,cell*.38,cell*.12);fill(255,240,200);text(label,0,-cell*.73);}
    pop();}
}
