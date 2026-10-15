function escapeUnlockHint(level){const base=escapeUnlockBase(level),need=level.unlockChallenges,have=escapeProgress.challengesCleared();return need&&have<need?base.replace(/ to unlock\.$/,'')+' and complete '+need+' challenges ('+have+' so far) to unlock.':base;}
function escapeUnlockBase(level){if(level.unlockAny)return 'Clear '+level.unlockAny.map(id=>EscapeCatalog.levels.find(l=>l.id===id)?.name||id).join(' or ')+' to unlock.';const i=EscapeCatalog.levels.indexOf(level),id=level.unlockAfter||EscapeCatalog.levels[i-1]?.id;return 'Clear '+(EscapeCatalog.levels.find(l=>l.id===id)?.name||'the previous escape')+' to unlock.';}
function escapeRecordSummary(level,saved,challenge=false){
  if(!saved)return '';
  return challenge?'✓ Complete · Best '+saved.bestTime.toFixed(1)+'s':'★'.repeat(saved.stars)+'☆'.repeat(3-saved.stars)+' · Best '+saved.bestTime.toFixed(1)+'s'+(saved.firstTry?' · ✓ First try':'');
}
function escapeToolkit(level){return [[level.camos||0,'camouflage'],[level.seeds||0,'seed pod'],[level.tongues||0,'tongue grab'],[level.burrows,'burrow'],[level.pebbles,'pebble']].filter(([n])=>n>0).map(([n,label])=>n+' '+label+(n>1&&label!=='camouflage'?'s':'')).concat(level.requiredTreasure?[level.requiredTreasure+' treasure to escape']:[],level.timeLimit?[level.timeLimit+' second escape']:[],level.tailDrop?['spare tail']:[],level.regrowth?[level.regrowth.length+' regrowth bugs']:[],level.hawk?['hawk overhead']:[],level.antTrails?[level.antTrails.length+' ant column'+(level.antTrails.length>1?'s':'')]:[],level.guards.some(h=>h.kind==='gecko')?['gecko thief']:[],level.cold?['cold rooms']:[]);}
let escapeGame=null,escapeIntroOpen=false;
// Leaving a route part-way counts as an attempt, so the first-try bonus stays honest.
function escapeAbandonRun(){if(escapeGame&&escapeGame.status==='playing'&&!escapeGame.challenge&&escapeGame.elapsed>3){escapeProgress.attempt(escapeGame.level.id);escapeGame.status='abandoned';}}
// The intro card holds the hunters still until the player is ready.
function showEscapeIntro(){
  const g=escapeGame,level=g.level,index=EscapeCatalog.levels.indexOf(level),best=!g.challenge&&escapeProgress.data.levels[level.id];
  const card=document.getElementById('escape-intro');escapeIntroOpen=true;
  const tools=escapeToolkit(level).map(t=>'<li>'+t+'</li>').join('');
  card.innerHTML='<span class="escape-intro-number">'+(g.challenge?'CHALLENGE · '+level.name:(level.expedition?'EXPEDITION ':'ESCAPE ')+(index+1))+'</span><h2 id="escape-intro-title">'+(g.challenge?g.challenge.name:level.name)+'</h2><p class="escape-intro-brief">'+(g.challenge?g.challenge.brief:level.brief)+'</p><p class="escape-intro-hint">'+level.hint+'</p>'+(tools?'<ul class="escape-intro-tools">'+tools+'</ul>':'')+(g.tailDrop?'<p class="escape-intro-tail">Sally can drop her tail once here. The next catch is final.</p>':'')+(best?'<p class="escape-intro-best">Best: '+escapeRecordSummary(level,best)+'</p>':'')+'<button id="escape-intro-start" class="escape-primary">Start<span class="key-hint"> · any key</span></button>';
  card.style.display='block';card.onclick=hideEscapeIntro;document.getElementById('escape-intro-start').focus();
}
function hideEscapeIntro(){if(!escapeIntroOpen)return;escapeIntroOpen=false;document.getElementById('escape-intro').style.display='none';document.activeElement?.blur?.();escapeHudAt=-Infinity;escapeSound('click');}
let escapeHudAt=-Infinity;
let escapeResultShown=false;
let escapeOptions={};
let escapeMapOpen=false;
const escapeProgress=new EscapeProgress((()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})());

function showEscapeSelect(){
  escapeAbandonRun();
  const current=escapeGame?.level.id,won=escapeGame?.status==='won',index=EscapeCatalog.levels.findIndex(l=>l.id===current),focus=won?EscapeCatalog.levels[index+1]?.id||current:current;
  escapeProgress.read();
  resetGameState();gameMode='escape';gameState='escapeSelect';
  for(const id of ['start-menu-container','game-container'])document.getElementById(id).style.display='none';
  document.getElementById('game-area').classList.add('escape-mode');
  const panel=document.getElementById('escape-select');panel.style.display='block';
  const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);
  panel.innerHTML='<button id="world-list-back" class="escape-secondary">← World map</button><div class="escape-select-heading"><span>'+EscapeCatalog.levels.length+' ESCAPES · '+EscapeCatalog.challenges.length+' CHALLENGES</span><h2>Sally’s Escape Trail</h2><p>Find the key, choose your risks, and bring Sally home.</p><p class="escape-select-totals">'+(t=>'★ '+t.stars+' / '+t.maxStars+' stars · ✓ '+t.firstTries+' first '+(t.firstTries===1?'try':'tries')+' · ◆ '+t.treasure+' treasure · ⚑ '+t.challenges+' / '+t.maxChallenges+' challenges · '+t.cleared+' / '+t.levels+' escapes cleared')(escapeProgress.totals(ESCAPE_CACHE_VALUE))+'</p><div class="escape-view-choice"><label for="escape-view-choice">Larger routes</label><select id="escape-view-choice"><option value="follow" '+(escapeProgress.data.view==='follow'?'selected':'')+'>Follow Sally · explored map</option><option value="overview" '+(escapeProgress.data.view==='overview'?'selected':'')+'>Show the whole maze</option></select><small>The first five routes keep their full-map view.</small></div></div><div class="escape-levels">'+EscapeCatalog.levels.map((level,i)=>{
    const unlocked=escapeProgress.unlocked(level.id),best=escapeProgress.data.levels[level.id];
    const toolkit=escapeToolkit(level).join(' · ');
    return (i===0?'<div class="escape-chapter-heading">Chapter 1 · The first escapes</div>':i===5?'<div class="escape-chapter-heading">Chapter 2 · Into the ruins</div>':i===9?'<div class="escape-chapter-heading">Chapter 3 · Tools of the trade</div>':i===13?'<div class="escape-chapter-heading">Chapter 4 · The ruins fight back</div>':i===17?'<div class="escape-chapter-heading">Chapter 5 · Deep Trials</div>':i===23?'<div class="escape-chapter-heading">Chapter 6 · Venom Depths</div>':i===27?'<div class="escape-chapter-heading">Chapter 7 · The waking maze</div>':i===32?'<div class="escape-chapter-heading">Chapter 8 · The hollow jungle</div>':i===37?'<div class="escape-chapter-heading">Chapter 9 · The luminous depths</div>':i===42?'<div class="escape-chapter-heading">Chapter 10 · The living labyrinth</div>':i===47?'<div class="escape-chapter-heading">Optional expedition · Sun and sea</div>':i===49?'<div class="escape-chapter-heading">Chapter 11 · The Shedding Hollow</div>':i===53?'<div class="escape-chapter-heading">Chapter 12 · The Lantern Marsh</div>':i===58?'<div class="escape-chapter-heading">Branch · Sunbaked Rooftops</div>':i===63?'<div class="escape-chapter-heading">Branch · Ant Kingdom</div>':i===68?'<div class="escape-chapter-heading">Chapter 13 · Frost Hollow</div>':'')+'<article class="escape-level-card '+(unlocked?'':'escape-locked')+'"><span class="escape-stage-number">'+(i+1)+'</span><h3>'+level.name+'</h3><p>'+level.brief+'</p><div class="escape-toolkit">'+toolkit+'</div><div class="escape-best">'+(best?escapeRecordSummary(level,best):unlocked?'A new route awaits.':escapeUnlockHint(level))+'</div><button id="escape-level-'+level.id+'" class="escape-primary" '+(unlocked?'':'disabled')+'>'+(unlocked?best?'Play again':'Start escape':'Locked')+'</button></article>';
  }).join('')+'</div><h3 class="escape-challenge-heading">Extra challenges</h3><div class="escape-contracts">'+EscapeCatalog.challenges.map(challenge=>{
    const unlocked=escapeProgress.challengeUnlocked(challenge.id),best=escapeProgress.data.challenges[challenge.id],level=EscapeCatalog.levels.find(l=>l.id===challenge.levelId);
    return '<article class="escape-contract '+(unlocked?'':'escape-locked')+'"><h3>'+challenge.name+'</h3><p>'+challenge.brief+'</p><div class="escape-best">'+(best?escapeRecordSummary(level,best,true):unlocked?level.name:'Clear '+level.name+' to unlock.')+'</div><button id="escape-contract-'+challenge.id+'" class="escape-secondary" '+(unlocked?'':'disabled')+'>'+(unlocked?'Try challenge':'Locked')+'</button></article>';
  }).join('')+'</div><p class="escape-save-note">'+(escapeProgress.persistent?'Your medals and best times are saved on this device.':'Progress lasts for this session; this browser cannot save it.')+'</p><button id="escape-back-btn" class="escape-secondary">Main menu</button>';
  for(const level of EscapeCatalog.levels)document.getElementById('escape-level-'+level.id).onclick=()=>startEscape({levelId:level.id});
  for(const challenge of EscapeCatalog.challenges)document.getElementById('escape-contract-'+challenge.id).onclick=()=>startEscape({challengeId:challenge.id});
  document.getElementById('escape-back-btn').onclick=leaveEscape;
  document.getElementById('escape-view-choice').onchange=event=>escapeProgress.setView(event.target.value);
  document.getElementById('world-list-back').onclick=()=>openEscapeWorld();
  clearTouchInput();suppressHeldKeys();unlockAudio();openEscapeWorld(focus);updateToolbar();window.scrollTo?.(0,0);
}

function startEscape(options={}){
  escapeAbandonRun();
  if(options.challengeId?!escapeProgress.challengeUnlocked(options.challengeId):!escapeProgress.unlocked(options.levelId||'quiet-vault')){showEscapeSelect();return;}
  startRun('escape');escapeGame=new EscapeAdventure(options);escapeResultShown=false;escapeHudAt=-Infinity;
  escapeOptions={levelId:escapeGame.level.id,challengeId:escapeGame.challenge?.id||null};
  gameState='escape';escapeLibraryOpen=false;document.getElementById('game-area').classList.remove('escape-world-open');mountEscapeChrome(true);
  document.getElementById('game-area').classList.toggle('escape-exploring',Boolean(escapeGame.level.explore));
  for(const id of ['start-menu-container','escape-result','escape-select','escape-intro'])document.getElementById(id).style.display='none';escapeIntroOpen=false;
  document.getElementById('game-container').style.display='block';
  document.getElementById('game-area').classList.add('escape-mode');
  document.getElementById('scoreboard').innerHTML=`
    <div class="escape-mission"><span id="escape-mission-name"></span><span id="escape-timer"></span></div>
    <div class="escape-inventory"><span id="escape-key">◇ Find the key</span><span id="escape-treasure">Treasure 0 / 10</span><span id="escape-tail" style="display:none"></span></div>
    <div class="escape-breath"><span>Breath</span><div id="escape-stamina" role="progressbar" aria-label="Stamina" aria-valuemin="0" aria-valuemax="100"><i id="escape-stamina-fill"></i></div><div id="escape-warmth-row" style="display:none"><span>Warmth</span><div id="escape-warmth" role="progressbar" aria-label="Warmth" aria-valuemin="0" aria-valuemax="100"><i id="escape-warmth-fill"></i></div></div></div>
    <div class="escape-actions"><button id="escape-burrow-action">Burrow <kbd>E</kbd></button><button id="escape-decoy-action">Toss pebble <kbd>Q</kbd></button><button id="escape-tongue-action" title="Face a key or treasure within three tiles. Gaps are allowed; walls and gates block the grab.">Tongue <kbd>R</kbd></button>
    <button id="escape-seed-action" title="Plant on bare ground for cover, face an open doorway to brace it, or use a marked vine bank.">Seed <kbd>F</kbd></button><button id="escape-camo-action" title="Blend into the ground. You stay hidden while you keep still.">Camo <kbd>X</kbd></button><button id="escape-look-action" title="Turn your gaze behind you briefly, even while moving.">Look back <kbd>Space</kbd></button></div><p id="escape-objective">Find the golden key. Treasure is optional.</p><p id="escape-warning" role="status" aria-live="polite"></p>`;
  // p5 redraws synchronously on resize; the new HUD must exist first.
  const size=canvasDimensions();resizeCanvas(size.width,size.height,true);
  document.getElementById('escape-burrow-action').onclick=useEscapeBurrow;
  document.getElementById('escape-decoy-action').onclick=useEscapeDecoy;
  document.getElementById('escape-tongue-action').onclick=useEscapeTongue;
  document.getElementById('escape-look-action').onclick=useEscapeLook;
  document.getElementById('escape-seed-action').onclick=useEscapeSeed;
  document.getElementById('escape-camo-action').onclick=useEscapeCamo;
  document.getElementById('escape-map-button').onclick=toggleEscapeMap;
  clearTouchInput();suppressHeldKeys();unlockAudio();renderEscapeHUD();updateToolbar();
  if(!options.skipIntro)showEscapeIntro();
  window.scrollTo?.(0,0);
}
function leaveEscape(){
  document.getElementById('escape-result').style.display='none';
  document.getElementById('escape-select').style.display='none';
  document.getElementById('game-area').classList.remove('escape-mode');
  escapeGame=null;resetGameState();gameState='start';
  const size=canvasDimensions();resizeCanvas(size.width,size.height);
  window.scrollTo?.(0,0);
}
function useEscapeBurrow(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.burrow();renderEscapeHUD(true);}}
function useEscapeDecoy(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.throwDecoy();renderEscapeHUD(true);}}
function useEscapeTongue(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.useTongue();renderEscapeHUD(true);}}
function useEscapeCamo(){if(escapeIntroOpen){hideEscapeIntro();return;}if(escapeGame?.camouflage())escapeSound('camo');renderEscapeHUD(true);}
function drawEscapeHawk(k,cell,clock){
  if(k.state==='stalk'||k.state==='dive'){const t=k.state==='dive'?1:Math.max(0,1-(k.strikeAt-clock)/k.warn),x=k.shadow.x*cell,y=k.shadow.y*cell,r=k.radius*cell*2;
    noStroke();fill(10,8,6,60+120*t);ellipse(x,y,r*(.6+.4*t),r*(.45+.3*t));noFill();stroke(255,150,90,140+100*t);strokeWeight(cell*.05);ellipse(x,y,r,r*.8);
    const a=clock*2.2,bx=x+Math.cos(a)*cell*(2.2-1.8*t),by=y-cell*(2.2-1.8*t)+Math.sin(a)*cell*.6;push();translate(bx,by);rotate(Math.cos(a)*.3);noStroke();fill(70,50,36,220);triangle(-cell*.6,0,0,-cell*.12,0,cell*.12);triangle(cell*.6,0,0,-cell*.12,0,cell*.12);ellipse(0,0,cell*.24,cell*.5);pop();}
  if(k.lastStrike&&clock-k.lastStrike.at<.5){noFill();stroke(...(k.lastStrike.hit?[255,90,70]:[200,230,200]),255*(1-(clock-k.lastStrike.at)/.5));strokeWeight(cell*.08);ellipse(k.lastStrike.x*cell,k.lastStrike.y*cell,k.radius*cell*2*(1+(clock-k.lastStrike.at)),k.radius*cell*1.6*(1+(clock-k.lastStrike.at)));}
}
function useEscapeLook(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.lookBack();renderEscapeHUD(true);}}
function useEscapeSeed(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.plantSeed();renderEscapeHUD(true);}}
function escapeKeyPressed(){
  const k=String(key).toLowerCase();
  if(gameState==='escapeSelect'&&!escapeLibraryOpen&&(k==='r'||k==='t')){if(escapeWorld?.tongue())escapeSound('tongue');return;}
  if(gameState==='escapeSelect'){if(!escapeLibraryOpen&&(keyCode===13||k==='enter')&&document.activeElement?.tagName!=='BUTTON')enterEscapeWorld();return;}
  if(gameState==='escapeResult'&&k==='r'){startEscape({...escapeOptions,skipIntro:true});return;}
  if(gameState==='escape'&&k==='g'){toggleEscapeMap();return;}
  if(gameState!=='escape'||paused)return;
  if(escapeIntroOpen){hideEscapeIntro();return;}
  if(k==='x')useEscapeCamo();
  if(k==='e')useEscapeBurrow();
  if(k==='q')useEscapeDecoy();
  if(k==='r'||k==='t')useEscapeTongue();
  if(k==='v'||k===' '&&document.activeElement?.tagName!=='BUTTON')useEscapeLook();
  if(k==='f'||k==='c')useEscapeSeed();
}
function toggleEscapeMap(){
  if(gameState!=='escape'||!escapeGame?.level.explore)return;
  if(escapeMapOpen){document.getElementById('escape-map').style.display='none';document.getElementById('game-area').classList.remove('escape-map-open');escapeMapOpen=false;if(paused)togglePause();return;}
  if(!paused)togglePause();escapeMapOpen=true;
  const g=escapeGame,all=escapeProgress.data.view==='overview'&&!g.level.dark,seen=(x,y)=>all||g.discovered.has(x+','+y),tile=8;
  let svg='<svg viewBox="0 0 '+g.width*tile+' '+g.height*tile+'" role="img" aria-label="'+(all?'Whole maze':'Explored maze; dark areas have not been visited')+'"><rect width="100%" height="100%" fill="#060f16"/>';
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(seen(x,y))svg+='<rect x="'+x*tile+'" y="'+y*tile+'" width="7" height="7" fill="'+(['P','U'].includes(g.grid[y][x])?'#16445e':g.floor(x,y)?'#25403f':'#658081')+'"/>';
  for(const gate of g.gates){for(const p of gate.plates)if(seen(Math.floor(p.x),Math.floor(p.y)))svg+='<circle cx="'+p.x*tile+'" cy="'+p.y*tile+'" r="2.5" fill="#5be1cf"/>';const color=gate.sealed?'#d9828a':'rgb('+gate.color.join(',')+')';for(const [x,y] of gate.tiles)if(seen(x,y))svg+='<rect x="'+x*tile+'" y="'+y*tile+'" width="7" height="7" fill="'+color+'" opacity="'+(gate.open?.4:1)+'"/>';if(gate.switch&&seen(Math.floor(gate.switch.x),Math.floor(gate.switch.y)))svg+='<circle cx="'+gate.switch.x*tile+'" cy="'+gate.switch.y*tile+'" r="3" fill="'+color+'"/>';}
  for(const bed of g.level.seedCrossings||[])for(const [x,y]of bed.banks)if(seen(x,y)){const cx=(x+.5)*tile,cy=(y+.5)*tile;svg+='<path d="M '+cx+' '+(cy-2.5)+' L '+(cx+2)+' '+cy+' L '+cx+' '+(cy+2.5)+' L '+(cx-2)+' '+cy+' Z" fill="#bbd574"/>';}
  for(const [p,color] of [[g.exit,'#8adfab'],...(!g.hasKey?[[g.key,'#ffdb79']]:[])])if(seen(Math.floor(p.x),Math.floor(p.y)))svg+='<rect x="'+(p.x-.3)*tile+'" y="'+(p.y-.3)*tile+'" width="5" height="5" fill="'+color+'"/>';
  for(const p of g.loot)if(!p.taken&&seen(Math.floor(p.x),Math.floor(p.y)))svg+='<circle cx="'+p.x*tile+'" cy="'+p.y*tile+'" r="1.7" fill="#e6b970"/>';
  svg+='<circle cx="'+g.player.x*tile+'" cy="'+g.player.y*tile+'" r="3" fill="#efffd3" stroke="#68cd84" stroke-width="1"/></svg>';
  document.getElementById('escape-map').innerHTML='<h3>'+(all?'Maze overview':'Your explored map')+'</h3><p>Paused · Bright dot: Sally. Gold square: key. Gold dots: treasure. Green: hatch. Pink: sealed passage.'+(g.level.seeds?' Leaf diamonds: vine banks.':'')+'</p>'+svg+'<p>'+g.gates.map(g=>g.name+': '+(g.bracedUntil>escapeGame.elapsed?'braced · '+Math.ceil(g.bracedUntil-escapeGame.elapsed)+'s':g.closingAt!==null?'sealing':g.sealed?'sealed':g.duration?g.open?'open · '+Math.max(0,Math.ceil(g.expiresAt-escapeGame.elapsed))+'s':'step on either turquoise plate':g.open?'open':g.switch?'find its matching switch':'awaits a mechanism')).join(' · ')+'</p><button id="escape-map-close" class="escape-primary">Resume game [G]</button>';
  document.getElementById('escape-map').style.display='block';document.getElementById('game-area').classList.add('escape-map-open');document.getElementById('escape-map-close').onclick=toggleEscapeMap;document.getElementById('escape-map-close').focus();
}
function playEscape(){
  if(!escapeGame)return;
  escapeGame.paused=paused;
  if(escapeIntroOpen&&gameState==='escape'&&!paused){const m=escapeMovement();if(m.x||m.y)hideEscapeIntro();}
  if(gameState==='escape'&&!paused&&!skipSimulationFrame&&!escapeIntroOpen){
    let {x,y,sprint}=escapeMovement();
    escapeGame.advance(deltaTime/1000,{x,y,sprint});
  }
  for(const event of new Set(escapeGame.drainEvents()))escapeSound(event==='treasure'&&escapeGame.message.startsWith('A whole')?'chest':event);
  if(gameState==='escape'&&!paused)escapeFootsteps(escapeGame.player);
  drawEscapeVault();renderEscapeHUD();
  if(escapeGame.status!=='playing' && !escapeResultShown)showEscapeResult();
}
function renderEscapeHUD(force=false){
  if(!escapeGame||(!force&&gameNow()-escapeHudAt<100))return;escapeHudAt=gameNow();
  const g=escapeGame;
  document.getElementById('escape-mission-name').textContent=g.challenge?g.challenge.name:(EscapeCatalog.levels.indexOf(g.level)+1)+' · '+g.level.name;
  const crossing=g.gates.filter(gate=>gate.duration&&gate.open&&gate.expiresAt!==null).sort((a,b)=>a.expiresAt-b.expiresAt)[0];
  const brace=g.gates.filter(gate=>gate.bracedUntil>g.elapsed).sort((a,b)=>a.bracedUntil-b.bracedUntil)[0],growing=g.seedGrowth.slice().sort((a,b)=>a.expires-b.expires)[0];
  const remaining=Math.max(0,Math.ceil((g.timeLimit||0)-g.elapsed));
  document.getElementById('escape-timer').textContent=g.timeLimit?Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'):crossing?crossing.name+' · '+(crossing.closingAt!==null?'clearing':Math.max(0,Math.ceil(crossing.expiresAt-g.elapsed))+'s'):brace?'Root brace · '+Math.ceil(brace.bracedUntil-g.elapsed)+'s':growing?(growing.kind==='vine'?'Vine':'Leaves')+' · '+Math.max(0,Math.ceil(growing.expires-g.elapsed))+'s':'';
  document.getElementById('escape-key').textContent=g.hasKey?'⚿ Key found':'◇ Find the key';
  document.getElementById('escape-treasure').textContent='Treasure '+g.treasure+' / '+g.totalTreasure+(g.stolen?' · '+g.stolen+' stolen':'')+(g.requiredTreasure&&g.requiredTreasure<g.totalTreasure?' · need '+g.requiredTreasure:'');
  const tail=document.getElementById('escape-tail');tail.style.display=g.tailDrop?'':'none';tail.textContent=g.hasTail?'Tail ✓ one spare escape':'Tail lost'+(g.regrowthBugs.some(b=>!b.eaten)?' · find a glowing bug':' · next catch is final');tail.className=g.hasTail?'':'escape-tail-lost';
  const warmRow=document.getElementById('escape-warmth-row');warmRow.style.display=g.cold.size?'':'none';if(g.cold.size){const fillW=document.getElementById('escape-warmth-fill');fillW.style.width=Math.round(g.player.warmth)+'%';fillW.style.background=g.player.chilled?'#9fd0ff':'#ffb36b';document.getElementById('escape-warmth').setAttribute('aria-valuenow',String(Math.round(g.player.warmth)));}
  document.getElementById('escape-stamina-fill').style.width=Math.round(g.player.stamina)+'%';
  document.getElementById('escape-stamina-fill').style.background=g.player.exhausted?'#edc779':'#b6dda0';
  document.getElementById('escape-stamina').setAttribute('aria-valuenow',String(Math.round(g.player.stamina)));
  const burrow=document.getElementById('escape-burrow-action'),decoy=document.getElementById('escape-decoy-action'),tongue=document.getElementById('escape-tongue-action');
  burrow.textContent='Burrow · '+g.burrows+' left [E]';decoy.textContent='Pebble · '+g.decoys+' left [Q]';
  burrow.disabled=paused||!g.active()||g.burrows===0;
  decoy.disabled=paused||!g.active()||g.decoys===0||g.elapsed<g.decoyReadyAt;
  burrow.style.display=g.level.burrows?'':'none';decoy.style.display=g.level.pebbles?'':'none';tongue.style.display=g.level.tongues?'':'none';
  tongue.textContent='Tongue · '+g.tongues+' left [R]';tongue.disabled=paused||!g.active()||g.tongues===0||Boolean(g.tongue)||g.elapsed<g.tongueReadyAt;
  const camo=document.getElementById('escape-camo-action');camo.style.display=g.level.camos?'':'none';camo.textContent='Camo · '+g.camos+' left [X]';camo.disabled=paused||!g.active()||!g.camos||g.camoUntil>g.elapsed;
  const look=document.getElementById('escape-look-action');look.style.display=g.level.gaze?'':'none';look.disabled=paused||!g.active();
  look.textContent='Look back [Space]';
  const seed=document.getElementById('escape-seed-action');seed.style.display=g.level.seeds?'':'none';seed.textContent='Seed · '+g.seeds+' left [F]';seed.disabled=paused||!g.active()||!g.seeds||g.elapsed<g.seedReadyAt;
  const nextGate=g.gates.find(gate=>!gate.open&&!gate.sealed&&gate.switch),mazeGoal=g.mazeObjectiveText();
  document.getElementById('escape-objective').textContent=mazeGoal|| (nextGate?(g.hasKey?'Key found. ':'Find the key. ')+nextGate.name+' switch opens the next room.':g.exitUnlocked()?'Hatch open. Head for the green door—or risk more treasure.':g.requiredTreasure?g.hasKey?'Bring '+(g.requiredTreasure-g.treasure)+' more treasure to the hatch.':'Find the key and '+(g.requiredTreasure===g.totalTreasure?'all ':'')+g.requiredTreasure+' treasure.':g.challenge?.keyByTongue?'Use a tongue grab for the key. Save one for it.':g.challenge?.noChill?'Find the key. Never let Sally get chilled.':g.challenge?.noTheft?'Find the key. Do not let a gecko keep any treasure.':g.challenge?.noChase?'Find the key. Escape without a chase.':'Find the golden key. Treasure is optional.');
  const priority={patrol:0,recover:0,decoy:1,search:2,alert:3,chase:4,windup:5,charge:6,sting:7,leap:6,emerge:0,still:0,follow:0,dig:1,buried:1,rise:5,glimmer:5,swoop:6,rooted:0,reveal:5,lunge:6,retract:1,clash:2,glare:5,return:1},hunter=g.hunters.reduce((a,b)=>priority[a.state]>=priority[b.state]?a:b);
  const moods={patrol:'',alert:hunter.reason==='heard'?'It heard you. Find quiet floor or cover!':'It is looking your way. Find cover!',chase:'Spotted! Break sight or distract it.',decoy:'Following the pebble. Slip past!',search:'Searching. Keep quiet.'};
  const beetleWarning=hunter.kind==='owl'&&['glare','swoop'].includes(hunter.state)?'An owl has seen you! Leave the marked spot before it swoops.':hunter.kind==='mimic'&&['reveal','lunge'].includes(hunter.state)?'The plant is opening! Leave its marked lane.':hunter.kind==='moth'&&['glimmer','swoop'].includes(hunter.state)?'Pale wings gathering! Step away from the glowing mark.':hunter.kind==='cricket'&&hunter.state==='rise'?'The ground is heaving! Step away.':['toad','spider'].includes(hunter.kind)&&['windup','leap'].includes(hunter.state)?(hunter.kind==='toad'?(hunter.state==='leap'?'Toad leaping! Step aside.':'Toad crouching! Leave its landing lane.'):'Spider aiming silk! Leave the marked ground.'):hunter.kind==='scorpion'&&['windup','sting'].includes(hunter.state)?'Scorpion tail raised! Leave the marked ground.':['windup','charge'].includes(hunter.state)?'Beetle '+(hunter.state==='windup'?'aiming':'charging')+' from '+(Math.abs(hunter.x-g.player.x)>Math.abs(hunter.y-g.player.y)?hunter.x<g.player.x?'the left':'the right':hunter.y<g.player.y?'above':'below')+'! Dodge sideways.':null;
  document.getElementById('escape-warning').textContent=paused?'Paused':g.player.chilled?(g.player.warmth<=0?'Sally is frozen stiff! Crawl to a warm stone.':'Sally is freezing! Get to a warm stone or warm ground.'):g.hunters.some(h=>h.kind==='gecko'&&h.state==='flee')?'Catch the gecko before it reaches its burrow!':g.hunters.some(h=>h.kind==='gecko'&&h.state==='dash')?'A gecko is after your treasure! Outrun it or hide.':g.antTrails.length&&g.antAt(g.player,2)?'Ants marching! Cross in the gaps between groups.':g.hawk&&['stalk','dive'].includes(g.hawk.state)?(g.shaded()||g.player.hidden?'The hawk is circling. Stay put—you are hidden.':'A hawk is circling! Get under an awning, into leaves, or press X to blend in.'):g.droppedTail?'Your tail is wriggling. The hunters want it—run!':beetleWarning||(priority[hunter.state]<3?(growing&&growing.expires-g.elapsed<=1.2?'The seed growth is fading. Clear the vines or find fresh cover.':crossing&&crossing.expiresAt-g.elapsed<=1.2?'The crossing is folding! Clear the planks or doorway.':hunter.state==='clash'?'The hunters clash! Slip past.':g.player.swimming?'Swimming slows Sally. Aim for the next island.':g.player.webbed?'Silk slows your feet. Move off the web.':g.pendingSpawns.length?'A den is opening. Keep clear of the shaking ground.':null):null)|| (g.player.hidden?(hunter.state==='chase'?'Hidden, but it remembers where you were.':'Hidden in the leaves. Wait for an opening.'):['alert','chase'].includes(hunter.state)?moods[hunter.state]:g.player.noisy&&!g.player.sprinting?'Gravel is noisy. Step onto dark floor to stay quiet.':g.messageUntil>g.elapsed?g.message:moods[hunter.state]??(hunter.state==='rooted'?'The garden stirs.':['still','follow'].includes(hunter.state)?'Leaves rustle in the ruins.':hunter.kind==='scorpion'?'Scorpion recovering. Slip past.':hunter.kind==='beetle'?'The beetle is catching its breath.':'The hunter is recovering. Slip past.'));
}
function showEscapeResult(){
  escapeResultShown=true;gameState='escapeResult';clearTouchInput();suppressHeldKeys();
  const r=escapeGame.result,won=r.status==='won';
  escapeProgress.record(r);const firstTry=won&&!r.challengeId&&escapeProgress.lastFirstTry;document.getElementById('escape-result').classList.toggle('escape-first-try',firstTry);
  document.getElementById('game-area').classList.add('escape-results-open');
  document.getElementById('escape-result-location').textContent=r.levelName;
  document.getElementById('escape-result-title').textContent=won?(r.challengeId?'Challenge complete!':firstTry?'First try! Sally escaped!':'Sally escaped!'):r.status==='failed'?'Challenge missed':'Nearly… try another route';
  const rating=r.treasure===r.totalTreasure?'The vault is empty. Legendary escape.':r.treasure>=5?'A brave treasure haul.':r.treasure>0?'A little treasure and a clever escape.':'Safe and sound. Try a treasure detour next time.';
  const tailNote=r.tailsDropped?(r.hasTail?' Sally lost her tail and grew it back.':' Sally left her tail behind.'):'';
  // A failed attempt explains the catch; treasure only matters when Sally gets out.
  const best=!r.challengeId&&escapeProgress.data.levels[r.levelId];
  document.getElementById('escape-result-summary').textContent=won?rating+tailNote+' Treasure '+r.treasure+' / '+r.totalTreasure+' · '+r.time.toFixed(1)+'s':r.message+tailNote;
  document.getElementById('escape-result-medals').textContent=won?(r.challengeId?'✓ '+escapeGame.challenge.name:'★'.repeat(r.stars)+'☆'.repeat(3-r.stars)+' · ✓ Escape · '+(r.treasure>=Math.ceil(r.totalTreasure*.6)?'✓':'○')+' Collect '+Math.ceil(r.totalTreasure*.6)+'+ treasure · '+(r.alarms===0&&r.hasTail!==false?'✓':'○')+' No alarm'+(r.hasTail===false?' · tail lost':'')+(firstTry?' · ✓ First try bonus':'')):(best?'Your best here: '+escapeRecordSummary(escapeGame.level,best)+'.':'Every attempt teaches a new route.');
  const next=EscapeCatalog.levels[EscapeCatalog.levels.indexOf(escapeGame.level)+1],nextButton=document.getElementById('escape-next-btn');
  nextButton.style.display=won&&!r.challengeId?'inline-block':'none';
  nextButton.textContent=next?(next.expedition?'Explore expedition →':'Try next escape →'):'Return to world map';
  nextButton.onclick=next?()=>startEscape({levelId:next.id}):showEscapeSelect;
  document.getElementById('escape-result').style.display='block';
  document.getElementById('escape-retry-btn').onclick=()=>startEscape({...escapeOptions,skipIntro:true});
  document.getElementById('escape-retry-btn').className=won&&!r.challengeId?'escape-secondary':'escape-primary';
  document.getElementById('escape-menu-btn').onclick=showEscapeSelect;document.getElementById('escape-menu-btn').textContent='Explore the world';document.getElementById('escape-menu-btn').className=won?'escape-primary':'escape-secondary';
  (won&&!r.challengeId?nextButton:document.getElementById('escape-retry-btn')).focus();renderEscapeHUD(true);
}
// Adaptive music boots after the first user gesture and then follows the game every frame.
function startEscapeMusic(context){
  if(typeof EscapeMusic==='undefined'||escapeMusic)return;escapeMusic=new EscapeMusic();
  escapeMusic.load(context).then(ok=>{if(ok)escapeMusic.start();});
}
function tickEscapeMusic(){
  if(!escapeMusic)return;
  escapeMusic.setVolume((paused?.35:1)*.6,isMuted||!musicOn);
  const screen=gameState==='start'?'menu':gameState==='escapeSelect'?'world':'game';
  escapeMusic.setState(EscapeMusic.stateFor({screen,game:screen==='game'?escapeGame:null}),millis()/1000);
}
function escapeSound(event,options={}){
  if(isMuted||paused||!audioUnlocked||soundVolume===0||typeof EscapeAudio==='undefined')return;
  try{EscapeAudio.play(getAudioContext(),event,soundVolume,options);}catch(_){/* Audio feedback remains optional. */}
}
// Soft footfalls follow Sally's real travelled distance, louder when sprinting.
let escapeStepFrom=null,escapeStepDistance=0,escapeStepAlt=false;
function escapeFootsteps(p){
  if(!escapeStepFrom||!p.moving){escapeStepFrom={x:p.x,y:p.y};escapeStepDistance=0;return;}
  escapeStepDistance+=Math.hypot(p.x-escapeStepFrom.x,p.y-escapeStepFrom.y);escapeStepFrom={x:p.x,y:p.y};
  if(escapeStepDistance>=(p.sprinting?.62:.48)){escapeStepDistance=0;escapeStepAlt=!escapeStepAlt;escapeSound(p.swimming?'paddle':'step',{sprint:p.sprinting,alt:escapeStepAlt});}
}
function drawEscapeVault(){
  const g=escapeGame,view=escapeCameraFor(g,width,height-(mobile?110:160),escapeProgress.data.view==='overview');view.oy+=mobile?45:65;const {cell,ox,oy}=view;
  const palettes=[[[16,30,36],[39,65,74],[65,93,101]],[[19,34,29],[48,74,56],[78,103,76]],[[33,29,26],[77,63,48],[108,89,66]],[[21,28,37],[46,61,80],[75,91,109]],[[22,24,41],[54,57,85],[86,89,124]],[[14,31,26],[38,68,49],[58,92,66]],[[34,29,20],[80,67,39],[123,102,60]],[[16,30,39],[34,61,73],[55,90,103]],[[26,22,37],[62,48,76],[100,81,116]]];
  const index=EscapeCatalog.levels.indexOf(g.level),deepPalettes=[[[21,30,26],[53,75,58],[94,112,79]],[[22,29,35],[51,69,82],[91,111,124]],[[35,27,24],[80,58,45],[125,91,63]],[[27,23,38],[66,51,82],[103,82,125]],[[29,27,20],[75,68,39],[118,106,62]],[[32,27,20],[82,65,40],[132,108,65]]];
  const wakingPalettes=[[[14,32,28],[47,76,52],[87,113,73]],[[25,19,35],[62,49,75],[103,81,127]],[[19,31,43],[58,80,92],[96,123,141]],[[33,24,23],[79,65,57],[121,101,81]],[[29,22,36],[72,56,91],[118,91,141]]];
  const junglePalettes=[[[20,34,24],[57,82,43],[114,134,77]],[[16,27,39],[45,64,85],[88,114,141]],[[37,25,20],[88,61,41],[149,108,67]],[[26,22,30],[70,50,67],[133,91,118]],[[21,33,33],[43,78,75],[99,139,122]]];
  const glowPalettes=[[[5,13,21],[13,25,34],[30,54,62]],[[5,12,20],[13,22,38],[28,48,72]],[[10,9,20],[25,17,38],[51,33,72]],[[7,15,18],[16,29,34],[33,59,65]],[[7,10,24],[19,21,42],[42,45,76]]];
  const livingPalettes=[[[19,31,22],[51,77,43],[92,117,66]],[[25,31,20],[62,77,38],[110,130,64]],[[22,30,29],[53,73,63],[96,118,91]],[[30,24,33],[75,54,74],[121,84,110]],[[28,27,20],[75,68,40],[129,112,64]]];
  const hollowPalettes=[[[30,22,24],[74,48,46],[126,82,70]],[[24,24,32],[61,52,72],[111,90,118]],[[29,26,19],[78,62,36],[133,104,58]],[[33,20,27],[83,44,60],[140,78,98]]];
  const biomePalettes=[[[117,83,46],[175,120,66],[231,178,106]],[[47,78,61],[82,113,101],[155,180,140]]];
  const lanternPalettes=[[[10,22,26],[30,52,56],[62,96,94]],[[20,24,20],[58,62,40],[104,108,70]],[[16,28,22],[44,72,50],[86,118,82]],[[24,22,32],[62,54,78],[104,92,126]],[[12,20,30],[34,50,72],[70,96,126]]];
  const rooftopPalettes=[[[46,30,24],[122,72,48],[196,128,86]],[[40,30,28],[110,78,60],[180,140,100]],[[44,34,22],[120,88,46],[198,150,82]],[[38,28,30],[112,64,62],[186,112,104]],[[42,32,26],[128,84,56],[210,150,98]]];
  const antPalettes=[[[30,22,16],[86,58,38],[140,100,66]],[[28,24,18],[80,64,40],[136,110,70]],[[32,20,18],[92,52,40],[150,92,70]],[[26,22,20],[74,60,50],[126,104,88]],[[34,24,14],[98,66,34],[160,112,60]]];
  const frostPalettes=[[[22,30,40],[70,92,112],[150,176,196]],[[20,28,36],[64,86,104],[140,166,188]],[[24,30,42],[76,90,120],[160,172,204]],[[18,30,36],[60,94,104],[130,180,190]],[[26,32,42],[84,98,118],[170,186,206]]];
  const palette=index>=68?frostPalettes[(index-68)%frostPalettes.length]:index>=63?antPalettes[(index-63)%antPalettes.length]:index>=58?rooftopPalettes[(index-58)%rooftopPalettes.length]:index>=53?lanternPalettes[(index-53)%lanternPalettes.length]:index>=49?hollowPalettes[(index-49)%hollowPalettes.length]:index>=47?biomePalettes[index-47]:index>=42?livingPalettes[index-42]:index>=37?glowPalettes[index-37]:index>=32?junglePalettes[index-32]:index>=27?wakingPalettes[index-27]:palettes[index]||(index>=17?deepPalettes[(index-17)%deepPalettes.length]:palettes[0]);
  background(10,18,25);push();translate(ox,oy);textFont('sans-serif');textAlign(CENTER,CENTER);
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){
    const tile=g.grid[y][x],floor=g.floor(x,y);
    noStroke();fill(...palette[floor?0:1]);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*0.12);
    if(!floor){stroke(...palette[2]);strokeWeight(1);line((x+.15)*cell,(y+.12)*cell,(x+.85)*cell,(y+.12)*cell);}
    if(tile==='B'){
      stroke(93,151,160);strokeWeight(1.3);line((x+0.3)*cell,(y+0.2)*cell,(x+0.6)*cell,(y+0.55)*cell);line((x+0.6)*cell,(y+0.55)*cell,(x+0.35)*cell,(y+0.8)*cell);
    }
    if(tile==='L'){
      noStroke();fill(49,109,77);for(const [dx,dy] of [[.3,.4],[.65,.3],[.5,.65]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.45,cell*.4);
    }
    if(tile==='N'){
      noStroke();fill(135,118,92);for(const [dx,dy] of [[.3,.3],[.7,.45],[.4,.7]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.13,cell*.1);
    }
    if(tile==='M'){noStroke();fill(93,76,48);ellipse((x+.5)*cell,(y+.5)*cell,cell*.8,cell*.65);fill(113,102,59,140);ellipse((x+.35)*cell,(y+.4)*cell,cell*.4,cell*.24);}
    if(tile==='V'){stroke(96,172,104);strokeWeight(cell*.14);line(x*cell,(y+.4)*cell,(x+1)*cell,(y+.6)*cell);line(x*cell,(y+.7)*cell,(x+1)*cell,(y+.3)*cell);noStroke();fill(164,206,121);ellipse((x+.5)*cell,(y+.4)*cell,cell*.3,cell*.12);}
    if(tile==='U'){
      noStroke();fill(22,99,121);rect(x*cell,y*cell,cell,cell);stroke(112,213,211,100);strokeWeight(cell*.035);const tide=Math.sin(g.elapsed*1.4+x*.5+y)*.05;for(const dy of [.3,.7])line((x+.15)*cell,(y+dy+tide)*cell,(x+.85)*cell,(y+dy-tide)*cell);
    }
    if(g.level.biome==='desert'&&tile==='.'){stroke(229,179,109,85);strokeWeight(cell*.025);line((x+.18)*cell,(y+.7)*cell,(x+.7)*cell,(y+.62)*cell);}
    if(tile==='P'){
      noStroke();fill(14,47,66);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*.12);stroke(64,126,155,150);strokeWeight(cell*.025);
      for(const dy of [.3,.65])line((x+.2)*cell,(y+dy)*cell,(x+.8)*cell,(y+dy)*cell);
    }
  }
  if(g.level.rootWheel){const [x,y]=g.level.rootWheel,angle=g.wheelAngle;push();translate((x+.5)*cell,(y+.5)*cell);rotate(angle);noFill();stroke(106,147,76,95);strokeWeight(cell*.11);ellipse(0,0,cell*2.7,cell*2.7);for(let a=0;a<TWO_PI;a+=PI/2)line(0,0,Math.cos(a)*cell*1.35,Math.sin(a)*cell*1.35);pop();}
  for(const gate of g.gates){
    const s=gate.switch,label=gate.closingAt!==null?'!':gate.duration&&gate.open?String(Math.max(0,Math.ceil(gate.expiresAt-g.elapsed))):gate.sealed?'×':gate.open?'✓':s?gate.id==='blue'?'B':'A':'◇',gateColor=gate.sealed?[230,137,148]:gate.color;
    if(s){stroke(...gateColor);strokeWeight(cell*.05);fill(...gateColor,gate.open?70:160);rect((s.x-.3)*cell,(s.y-.3)*cell,cell*.6,cell*.6,cell*.1);fill(15,35,40);noStroke();textSize(cell*.36);text(label,s.x*cell,s.y*cell);}
    for(const plate of gate.plates){noStroke();fill(...gateColor,gate.pressed?230:100);ellipse(plate.x*cell,plate.y*cell,cell*.65,cell*.45);noFill();stroke(...gateColor);strokeWeight(cell*.035);ellipse(plate.x*cell,plate.y*cell,cell*.5,cell*.32);}
    for(const [x,y] of gate.tiles){if(gate.root){stroke(gate.bracedUntil>g.elapsed?186:94,gate.bracedUntil>g.elapsed?224:132,73);strokeWeight(cell*(gate.open?.055:.13));for(const offset of [.25,.55,.8])bezier((x+offset)*cell,y*cell,(x+offset-.2)*cell,(y+.3)*cell,(x+offset+.2)*cell,(y+.7)*cell,(x+offset)*cell,(y+1)*cell);if(gate.closingAt!==null){fill(242,207,116);noStroke();textSize(cell*.4);text(gate.bracedUntil>g.elapsed?Math.ceil(gate.bracedUntil-g.elapsed):'!',(x+.5)*cell,(y+.5)*cell);}continue;}if(gate.bridge){if(gate.open){stroke(gate.warned?239:151,gate.warned?174:117,73);strokeWeight(cell*.12);for(const dy of [.2,.4,.6,.8])line((x+.1)*cell,(y+dy)*cell,(x+.9)*cell,(y+dy)*cell);stroke(...gateColor);strokeWeight(cell*.035);line((x+.1)*cell,y*cell,(x+.1)*cell,(y+1)*cell);line((x+.9)*cell,y*cell,(x+.9)*cell,(y+1)*cell);noStroke();fill(232,239,200);textSize(cell*.27);text(label,(x+.5)*cell,(y+.5)*cell);}continue;}stroke(...gateColor);strokeWeight(cell*.075);for(const dx of [.25,.5,.75])line((x+dx)*cell,(y+.12)*cell,(x+dx)*cell,(y+.88)*cell);noStroke();fill(...palette[0]);rect((x+.16)*cell,(y+.23)*cell,cell*.68,cell*.54);fill(...gateColor);textSize(cell*.32);text(label,(x+.5)*cell,(y+.5)*cell);}
  }
  for(const [x,y]of g.level.shrubs||[])if(!view.follow||g.visibleTile(x,y))drawEscapeMimic({x:x+.5,y:y+.5,state:'rooted',facing:PI,distanceMoved:0},cell,g.elapsed,true);
  for(const bed of g.level.seedCrossings||[])for(const [x,y]of bed.banks)if(!view.follow||g.visibleTile(x,y)){noStroke();fill(191,213,116);ellipse((x+.5)*cell,(y+.5)*cell,cell*.2,cell*.28);stroke(113,187,103);strokeWeight(cell*.035);line((x+.5)*cell,(y+.5)*cell,(x+.7)*cell,(y+.25)*cell);}
  if(g.level.dark)drawEscapeGlow(g,cell);
  if(g.level.gaze){
    const p=g.player,heading=Math.atan2(p.facing.y,p.facing.x);
    noStroke();fill(190,224,158,20);beginShape();vertex(p.x*cell,p.y*cell);
    for(let a=-PI/3;a<=PI/3+.01;a+=PI/36){let reach=0;for(let d=.1;d<=g.level.sightRadius;d+=.1){if(!g.clear(p,{x:p.x+Math.cos(heading+a)*d,y:p.y+Math.sin(heading+a)*d},true))break;reach=d;}vertex((p.x+Math.cos(heading+a)*reach)*cell,(p.y+Math.sin(heading+a)*reach)*cell);}endShape(CLOSE);
  }
  const open=g.exitUnlocked();
  noStroke();fill(open?91:39,open?208:83,open?145:83);rect((g.exit.x-.42)*cell,(g.exit.y-.42)*cell,cell*.84,cell*.84,cell*.16);
  fill(10,33,29);textSize(cell*.48);text(open?'↥':'×',g.exit.x*cell,g.exit.y*cell);
  if(g.exitHold>0){noFill();stroke(223,253,173);strokeWeight(2);arc(g.exit.x*cell,g.exit.y*cell,cell,cell,-PI/2,-PI/2+TWO_PI*g.exitHold/.55);}
  if(!g.hasKey){
    stroke(255,213,112);strokeWeight(cell*.13);noFill();ellipse((g.key.x-.12)*cell,g.key.y*cell,cell*.28,cell*.28);line(g.key.x*cell,g.key.y*cell,(g.key.x+.3)*cell,g.key.y*cell);line((g.key.x+.22)*cell,g.key.y*cell,(g.key.x+.22)*cell,(g.key.y+.18)*cell);
  }
  for(const loot of g.loot)if(!loot.taken){
    noStroke();fill(245,189,87);push();translate(loot.x*cell,loot.y*cell);
    if(loot.value>1){rect(-cell*.3,-cell*.22,cell*.6,cell*.44,cell*.08);fill(100,71,40);rect(-cell*.06,-cell*.22,cell*.12,cell*.44);}
    else{rotate(PI/4);rect(-cell*.13,-cell*.13,cell*.26,cell*.26,2);}pop();
  }
  for(const key of g.cold){const [x,y]=key.split(',').map(Number);if(!g.floor(x,y)||view.follow&&!g.visibleTile(x,y))continue;noStroke();fill(170,215,255,55);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*.12);fill(235,248,255,120);for(const [dx,dy] of [[.25,.3],[.7,.55],[.4,.78]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.06,cell*.06);}
  for(const key of g.warm){const [x,y]=key.split(',').map(Number);if(view.follow&&!g.visibleTile(x,y))continue;const glow=.5+.5*Math.sin(g.elapsed*3+x);noStroke();fill(255,150,60,50+50*glow);ellipse((x+.5)*cell,(y+.5)*cell,cell*.95,cell*.95);fill(196,92,44);ellipse((x+.5)*cell,(y+.55)*cell,cell*.6,cell*.42);fill(255,190,110);ellipse((x+.45)*cell,(y+.48)*cell,cell*.3,cell*.16);}
  for(const key of g.shade){const [x,y]=key.split(',').map(Number);if(view.follow&&!g.visibleTile(x,y))continue;noStroke();for(let i=0;i<4;i++){fill(...(i%2?[238,226,196,150]:[204,96,72,150]));rect((x+i/4)*cell,y*cell,cell/4+.5,cell*.82);}fill(120,52,40,170);for(let i=0;i<4;i++)arc((x+(i+.5)/4)*cell,(y+.82)*cell,cell/4,cell*.22,0,PI);}
  for(const h of g.hunters)if(h.kind==='gecko'&&h.home&&(!view.follow||g.visibleTile(Math.floor(h.home.x),Math.floor(h.home.y)))){noStroke();fill(30,20,14);ellipse(h.home.x*cell,h.home.y*cell,cell*.7,cell*.45);fill(70,50,30);ellipse(h.home.x*cell,(h.home.y-.08)*cell,cell*.5,cell*.18);}
  // Ant trails are worn into the floor, so the route can be read before the column arrives.
  for(const t of g.antTrails){stroke(150,110,70,70);strokeWeight(cell*.06);for(const p of t.tiles)if(!view.follow||g.visibleTile(Math.floor(p.x),Math.floor(p.y)))point(p.x*cell,p.y*cell);noStroke();for(const a of g.ants(t)){if(view.follow&&!g.visibleTile(Math.floor(a.x),Math.floor(a.y)))continue;push();translate(a.x*cell,a.y*cell);rotate(a.dir);scale(1.45);fill(70,24,18);for(const o of [-.1,0,.1])ellipse(o*cell,0,cell*.11,cell*.09);stroke(70,24,18);strokeWeight(cell*.015);const k=Math.sin(g.elapsed*20+a.x*5)*cell*.03;for(const s of [-1,1])for(const o of [-.06,0,.06])line(o*cell,0,o*cell+k,s*cell*.1);noStroke();pop();}}
  // Regrowth bugs glow brightly only while Sally is missing her tail.
  for(const bug of g.regrowthBugs)if(!bug.eaten)drawEscapeRegrowthBug(bug,cell,g.elapsed,!g.hasTail);
  if(g.droppedTail)drawEscapeDroppedTail(g.droppedTail,cell,g.elapsed);
  if(g.decoy){
    noFill();stroke(172,152,255,130);strokeWeight(1);const pulse=(g.elapsed%0.65)/.65;
    ellipse(g.decoy.x*cell,g.decoy.y*cell,cell*(.5+pulse*2),cell*(.5+pulse*2));noStroke();fill(193,181,255);ellipse(g.decoy.x*cell,g.decoy.y*cell,cell*.22,cell*.22);
  }
  // A short, subtle gaze shows where the guard is looking; walls stop detection.
  for(const w of g.webs){if(view.follow&&!g.visibleTile(Math.floor(w.x),Math.floor(w.y)))continue;noFill();stroke(197,183,236,180);strokeWeight(cell*.025);for(const r of [.3,.65])ellipse(w.x*cell,w.y*cell,cell*r*2,cell*r*2);for(let a=0;a<TWO_PI;a+=PI/4)line(w.x*cell,w.y*cell,(w.x+Math.cos(a)*.65)*cell,(w.y+Math.sin(a)*.65)*cell);}
  for(const den of g.pendingSpawns){if(view.follow&&!g.visibleTile(Math.floor(den.x),Math.floor(den.y)))continue;noFill();stroke(231,161,121);strokeWeight(cell*.05);ellipse(den.x*cell,den.y*cell,cell*(.7+Math.sin(g.elapsed*8)*.12),cell*.5);fill(237,177,142);noStroke();textSize(cell*.5);text('!',den.x*cell,(den.y-.5)*cell);}
  for(const h of g.hunters){const ang=h.facing,cone=h.kind==='beetle'?PI/5:PI/3;
  if(view.follow&&!g.visibleTile(Math.floor(h.x),Math.floor(h.y)))continue;
  if(!g.level.dark&&!['millipede','cricket','moth','mimic'].includes(h.kind)&&['patrol','alert'].includes(h.state)){
    noStroke();fill(245,171,105,18);beginShape();vertex(h.x*cell,h.y*cell);
    for(let a=-cone;a<=cone+.01;a+=cone/6){let reach=0;for(let d=.2;d<=4.5;d+=.2){if(!g.clear(h,{x:h.x+Math.cos(ang+a)*d,y:h.y+Math.sin(ang+a)*d},true))break;reach=d;}vertex((h.x+Math.cos(ang+a)*reach)*cell,(h.y+Math.sin(ang+a)*reach)*cell);}endShape(CLOSE);
  }
  if(['windup','sting','glimmer','swoop','reveal','lunge','glare'].includes(h.state)&&h.aim){stroke(255,191,80,180);strokeWeight(cell*.07);line(h.x*cell,h.y*cell,h.aim.x*cell,h.aim.y*cell);noFill();ellipse(h.aim.x*cell,h.aim.y*cell,cell*(['scorpion','spider'].includes(h.kind)?1.3:.7),cell*(['scorpion','spider'].includes(h.kind)?1.3:.7));}
  }
  // Clip the artwork to floor tiles, so toes and a turning tail are occluded by
  // masonry. The rig also keeps its centreline and planted feet on open floor.
  g.hunters.filter(h=>h.kind==='moth'&&g.visibleTile(Math.floor(h.x),Math.floor(h.y))).forEach(h=>drawEscapeMoth(h,cell,g.elapsed));
  // Owls glow in the dark: their perch, eyes and look-out beam are always shown.
  g.hunters.filter(h=>h.kind==='owl').forEach(h=>drawEscapeOwl(h,cell,g));
  drawEscapeTongue(g,cell);
  drawingContext.save();drawingContext.beginPath();
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.floor(x,y))drawingContext.rect(x*cell+1,y*cell+1,cell-2,cell-2);
  drawingContext.clip();drawingContext.lineCap='round';drawingContext.lineJoin='round';
  g.hunters.forEach((h,i)=>{if(h.kind==='moth'||h.kind==='owl')return;if(g.level.dark&&g.visibleTile(Math.floor(h.x),Math.floor(h.y))){noStroke();fill(103,238,210,35);ellipse(h.x*cell,h.y*cell,cell*1.2,cell*1.2);}if(h.kind==='millipede'?g.playerSees(h):!view.follow||g.visibleTile(Math.floor(h.x),Math.floor(h.y)))h.kind==='fish'?drawEscapeFish(h,cell,g.elapsed):h.kind==='mimic'?drawEscapeMimic(h,cell,g.elapsed):h.kind==='millipede'?drawEscapeMillipede(h,g.motion.snakes[i],cell):h.kind==='cricket'?drawEscapeCricket(h,cell,g.elapsed):['toad','spider'].includes(h.kind)?drawEscapeNestMonster(h,cell,g.elapsed):h.kind==='scorpion'?drawEscapeScorpion(h,cell,g.elapsed):h.kind==='beetle'?drawEscapeBeetle(h,cell):h.kind==='gecko'?drawEscapeGecko(h,cell,g.elapsed):drawEscapeSnake(g.motion.snakes[i],cell,h.state,h.kind==='sea-snake');});
  drawingContext.save();drawingContext.globalAlpha*=g.player.hidden?.48:1;
  for(const h of g.hunters)if(h.state==='clash'&&g.visibleTile(Math.floor(h.x),Math.floor(h.y))){noFill();stroke(255,193,107,180);strokeWeight(cell*.035);ellipse(h.x*cell,h.y*cell,cell*(.9+Math.sin(g.elapsed*14)*.08),cell*.75);}
  drawEscapeLizard(g.motion.lizard,cell,g.motion.clock,g.player.swimming,!g.hasTail);
  drawingContext.restore();drawingContext.restore();
  if(g.player.camo){noFill();stroke(214,190,140,90+60*Math.sin(g.elapsed*6));strokeWeight(cell*.03);ellipse(g.player.x*cell,g.player.y*cell,cell*1.1,cell*1.1);}
  if(g.hawk)drawEscapeHawk(g.hawk,cell,g.elapsed);
  for(const h of g.hunters)if(h.kind!=='millipede'&&h.state!=='rooted'&&h.state!=='patrol'&&(!view.follow||g.visibleTile(Math.floor(h.x),Math.floor(h.y)))){fill(h.state==='decoy'?195:255, h.state==='decoy'?182:214, h.state==='decoy'?255:133);noStroke();textSize(cell*.65);text(h.state==='alert'?'?':['chase','windup','charge','sting','leap','glimmer','swoop','reveal','lunge'].includes(h.state)?'!':h.state==='decoy'?'♪':'…',h.x*cell,(h.y-.65)*cell);}
  if(g.player.noisy&&!g.player.sprinting){noFill();stroke(221,195,149,80);strokeWeight(1);const pulse=(g.elapsed%.6)/.6;ellipse(g.player.x*cell,g.player.y*cell,cell*(.55+pulse),cell*(.55+pulse));}
  // Opaque remembered terrain hides creatures and objects outside current
  // sight. Memory shows layout; it never reports hidden enemy positions.
  if(view.follow)for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(!g.visibleTile(x,y)){
    noStroke();const known=g.discovered.has(x+','+y);fill(...(known&&g.level.dark?[5,10,16]:known?(['P','U'].includes(g.grid[y][x])?[12,30,44]:g.floor(x,y)?[16,28,31]:[31,43,49]):[7,15,22]));rect(x*cell,y*cell,cell,cell);
    if(known){stroke(23,34,40);strokeWeight(.6);noFill();rect(x*cell+1,y*cell+1,cell-2,cell-2);}
  }
  pop();
  if(view.follow)for(const h of g.hunters)if(['alert','chase','windup','charge','sting','leap'].includes(h.state)){
    const x=h.x*cell+ox,y=h.y*cell+oy;
    if(x<12||y<12||x>width-12||y>height-12){const px=Math.max(16,Math.min(width-16,x)),py=Math.max(16,Math.min(height-16,y));noStroke();fill(241,173,86);ellipse(px,py,24,24);fill(25,29,29);textSize(18);textAlign(CENTER,CENTER);text('!',px,py);}
  }
}
function drawEscapeMimic(h,cell,clock,harmless=false){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);const hidden=h.state==='rooted',twitch=!harmless&&hidden&&Math.sin(clock*1.6+h.x)>.97?.07:0;
  noStroke();fill(9,24,16,150);ellipse(-cell*.06+cell*twitch*.3,cell*(.07+twitch*.2),cell*(.8+twitch),cell*.5);
  stroke(82,119,56);strokeWeight(cell*.05);for(const side of [-1,1]){const stride=hidden?0:Math.sin(h.distanceMoved*9+side)*.05;line(-cell*.12,side*cell*.08,-cell*.35,side*cell*.26);line(-cell*.35,side*cell*.26,-cell*(.46+stride),side*cell*.33);}
  if(!hidden){noStroke();fill(87,35,63);ellipse(cell*.08,0,cell*.65,cell*.43);fill(239,218,158);for(const side of [-1,1])for(let i=0;i<4;i++)triangle((i*.11-.12)*cell,side*cell*.14,(i*.11-.07)*cell,side*cell*.06,(i*.11-.02)*cell,side*cell*.14);}
  noStroke();for(const side of [-1,1]){fill(hidden?78:136,hidden?139:157,hidden?68:75);ellipse(-cell*.12,side*cell*(hidden?.13+twitch:.28),cell*.7,cell*.3);fill(143,185,92);ellipse(cell*.18,side*cell*(hidden?.1+twitch*.5:.3),cell*.35,cell*.18);}
  if(!harmless&&(hidden?twitch>0:true)){fill(245,204,99);ellipse(cell*.22,-cell*.08,cell*.045,cell*.045);ellipse(cell*.22,cell*.08,cell*.045,cell*.045);}pop();
}
function drawEscapeGlow(g,cell){
  for(const [x,y]of g.level.glowPlants||[]){if(!g.visibleTile(x,y))continue;const pulse=.92+Math.sin(g.elapsed*1.7+x*.8+y)*.08;
    for(const r of [1.4,.8,.45]){noStroke();fill(64,229,206,12+r*12);ellipse((x+.5)*cell,(y+.5)*cell,cell*r*pulse,cell*r*pulse);}
    for(const [dx,dy,s]of [[.35,.65,.8],[.66,.52,1],[.5,.3,.55]]){stroke(111,221,206);strokeWeight(cell*.035);line((x+dx)*cell,(y+dy)*cell,(x+dx)*cell,(y+dy-.16*s)*cell);noStroke();fill((x+y)%2?136:89,(x+y)%2?157:249,234);ellipse((x+dx)*cell,(y+dy-.18*s)*cell,cell*.24*s,cell*.11*s);fill(224,255,234);ellipse((x+dx-.025)*cell,(y+dy-.2*s)*cell,cell*.045,cell*.025);}
  }
  for(const t of g.glowTrail){if(!g.visibleTile(Math.floor(t.x),Math.floor(t.y)))continue;const fade=Math.max(0,(t.expires-g.elapsed)/8);noStroke();fill(67,209,233,22*fade);ellipse(t.x*cell,t.y*cell,cell*.65,cell*.65);fill(117,235,240,105*fade);for(const side of [-1,1])ellipse((t.x+side*.09)*cell,t.y*cell,cell*.075,cell*.045);}
  noStroke();fill(140,226,220,15);ellipse(g.player.x*cell,g.player.y*cell,cell*1.25,cell*1.25);
}
function drawEscapeGecko(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing||0);scale(1.3);const run=['dash','flee'].includes(h.state),wig=Math.sin(clock*(run?30:6))*.25;noStroke();
  fill(3,12,15,110);ellipse(cell*.03,cell*.05,cell*.7,cell*.3);fill(232,140,60);ellipse(0,0,cell*.5,cell*.24);ellipse(cell*.27,0,cell*.2,cell*.17);
  stroke(232,140,60);strokeWeight(cell*.06);noFill();bezier(-cell*.24,0,-cell*.4,wig*cell,-cell*.5,-wig*cell,-cell*.62,0);noStroke();
  fill(250,210,120);for(const o of [-.12,0,.12])ellipse(o*cell,0,cell*.06,cell*.06);fill(20);for(const s of [-1,1])ellipse(cell*.31,s*cell*.06,cell*.05,cell*.05);
  stroke(232,140,60);strokeWeight(cell*.04);for(const s of [-1,1])for(const o of [-.12,.12])line(o*cell,0,(o+wig*.1)*cell,s*cell*.2);noStroke();
  if(h.loot){fill(245,189,87);rotate(PI/4);rect(-cell*.08,-cell*.08,cell*.16,cell*.16,2);}
  if(h.state==='stunned'){rotate(-(h.facing||0));fill(255,240,160);textSize(cell*.32);text('✶',0,-cell*.35);}
  pop();
}
function drawEscapeOwl(h,cell,g){
  const perch=h.perch||h;
  if(h.state==='patrol'){noStroke();fill(255,214,120,26);beginShape();vertex(h.x*cell,h.y*cell);
    for(let a=-PI/9;a<=PI/9+.001;a+=PI/36){let reach=0;for(let d=.2;d<=7;d+=.2){if(!g.clear(h,{x:h.x+Math.cos(h.facing+a)*d,y:h.y+Math.sin(h.facing+a)*d},true))break;reach=d;}vertex((h.x+Math.cos(h.facing+a)*reach)*cell,(h.y+Math.sin(h.facing+a)*reach)*cell);}endShape(CLOSE);}
  noStroke();fill(60,42,30);ellipse(perch.x*cell,(perch.y+.32)*cell,cell*.6,cell*.14);
  push();translate(h.x*cell,h.y*cell);scale(1.4);const flying=['swoop','return'].includes(h.state);
  if(flying){fill(120,92,62);for(const s of [-1,1])ellipse(s*cell*.36,0,cell*.6,cell*.22);}
  fill(132,100,68);ellipse(0,0,cell*.56,cell*.66);fill(196,168,124);ellipse(0,cell*.05,cell*.36,cell*.4);
  fill(132,100,68);triangle(-cell*.22,-cell*.26,-cell*.12,-cell*.42,-cell*.06,-cell*.26);triangle(cell*.22,-cell*.26,cell*.12,-cell*.42,cell*.06,-cell*.26);
  const glare=h.state==='glare',look={x:Math.cos(h.facing)*cell*.03,y:Math.sin(h.facing)*cell*.03};
  for(const s of [-1,1]){fill(glare?255:250,glare?150:220,glare?60:120);ellipse(s*cell*.12,-cell*.1,cell*.18,cell*.18);fill(20);ellipse(s*cell*.12+look.x,-cell*.1+look.y,cell*.08,cell*.08);}
  fill(230,170,70);triangle(-cell*.04,-cell*.02,cell*.04,-cell*.02,0,cell*.06);pop();
}
function drawEscapeMoth(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);const flap=.7+Math.sin(clock*14+h.distanceMoved*4)*.25,armed=h.state==='glimmer';
  for(const r of [1.3,.85]){noStroke();fill(123,218,244,armed?40:22);ellipse(0,0,cell*r,cell*r);}
  stroke(147,220,224);strokeWeight(cell*.025);fill(130,191,230,145);
  for(const side of [-1,1]){ellipse(-cell*.08,side*cell*.24*flap,cell*.5,cell*.42*flap);fill(armed?247:197,armed?204:155,245,190);ellipse(cell*.13,side*cell*.21*flap,cell*.37,cell*.34*flap);fill(227,255,229);ellipse(cell*.04,side*cell*.22*flap,cell*.085,cell*.085);line(cell*.2,side*cell*.06,cell*.37,side*cell*.16);}
  noStroke();fill(222,243,172);ellipse(0,0,cell*.5,cell*.13);fill(234,255,237);ellipse(cell*.22,0,cell*.17,cell*.17);pop();
}
function drawEscapeTongue(g,cell){
  const t=g.tongue;if(!t||!g.clear(g.player,t.point,true))return;
  drawingContext.save();drawingContext.beginPath();for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.sightFloor(x,y))drawingContext.rect(x*cell,y*cell,cell,cell);drawingContext.clip();
  const age=g.elapsed-t.startedAt,reach=age<.14?Math.sin(age/.14*PI/2):Math.cos(Math.min(1,(age-.14)/.2)*PI/2);
  const head=g.motion.lizard.joints[0],angle=g.motion.lizard.headAngle,start={x:head.x+Math.cos(angle)*.17,y:head.y+Math.sin(angle)*.17};
  const tip={x:start.x+(t.point.x-start.x)*reach,y:start.y+(t.point.y-start.y)*reach};
  const dx=tip.x-start.x,dy=tip.y-start.y,bend=Math.sin(age/.34*PI)*.055;
  noFill();stroke(75,27,49);strokeWeight(cell*.08);bezier(start.x*cell,start.y*cell,(start.x+dx*.33-dy*bend)*cell,(start.y+dy*.33+dx*bend)*cell,(start.x+dx*.67+dy*bend)*cell,(start.y+dy*.67-dx*bend)*cell,tip.x*cell,tip.y*cell);
  stroke(236,128,164);strokeWeight(cell*.045);bezier(start.x*cell,start.y*cell,(start.x+dx*.33-dy*bend)*cell,(start.y+dy*.33+dx*bend)*cell,(start.x+dx*.67+dy*bend)*cell,(start.y+dy*.67-dx*bend)*cell,tip.x*cell,tip.y*cell);
  noStroke();fill(t.caught?255:246,t.caught?216:151,t.caught?112:178);ellipse(tip.x*cell,tip.y*cell,cell*.16,cell*.13);
  drawingContext.restore();
}
function drawEscapeMillipede(h,model,cell){
  // Rounded armour and two pairs of legs per segment. Gait is driven by
  // travelled distance, so observation freezes every foot as well as the head.
  for(let i=model.joints.length-2;i>=0;i--){
    const p=model.joints[i],a=model.angles[i],w=.13*(1-i/model.joints.length*.35);
    push();translate(p.x*cell,p.y*cell);rotate(a);
    stroke(190,132,72);strokeWeight(cell*.024);
    for(const side of [-1,1])for(const offset of [-.022,.022]){
      const step=Math.sin(h.distanceMoved*14-i*.8+side)*.035;
      line(offset*cell,side*w*cell,(offset-.045+step)*cell,side*(w+.08)*cell);
      line((offset-.045+step)*cell,side*(w+.08)*cell,(offset-.08+step)*cell,side*(w+.14)*cell);
    }
    stroke(39,23,20);strokeWeight(cell*.023);fill(i%2?94:111,50,30);ellipse(0,0,cell*.15,w*cell*2);
    noStroke();fill(199,130,64,180);ellipse(cell*.018,-w*cell*.45,cell*.04,cell*.065);pop();
  }
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);noStroke();fill(145,78,36);ellipse(cell*.02,0,cell*.32,cell*.3);
  stroke(225,177,106);strokeWeight(cell*.025);for(const side of [-1,1]){line(cell*.13,side*cell*.09,cell*.29,side*cell*.2);line(cell*.29,side*cell*.2,cell*.39,side*cell*.16);}pop();
}
function drawEscapeCricket(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  if(['dig','buried','rise'].includes(h.state)){
    const pulse=h.state==='rise'?1+Math.sin(clock*22)*.12:1;
    noStroke();fill(115,89,54);ellipse(0,0,cell*.65*pulse,cell*.5*pulse);
    stroke(194,155,95);strokeWeight(cell*.03);for(const side of [-1,1])line(-cell*.2,side*cell*.08,cell*.18,side*cell*.16);
    if(h.state==='rise'){noFill();stroke(245,190,98);ellipse(0,0,cell*1.35,cell*1.35);}pop();return;
  }
  const stride=h.distanceMoved*12;stroke(128,81,40);strokeWeight(cell*.06);
  for(const side of [-1,1]){const s=Math.sin(stride+side)*.08;line(-cell*.18,side*cell*.12,-cell*.4,side*cell*.36);line(-cell*.4,side*cell*.36,-cell*(.2+s),side*cell*.42);line(0,side*cell*.14,-cell*.04,side*cell*.32);line(cell*.16,side*cell*.1,cell*.36,side*cell*.24);}
  noStroke();fill(120,80,42);ellipse(-cell*.12,0,cell*.63,cell*.32);fill(172,119,62);ellipse(cell*.16,0,cell*.32,cell*.3);
  fill(224,177,99);for(const side of [-1,1]){ellipse(cell*.34,side*cell*.2,cell*.2,cell*.13);stroke(212,170,111);strokeWeight(cell*.02);line(cell*.25,side*cell*.08,cell*.53,side*cell*.17);}pop();
}
function drawEscapeNestMonster(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  const stride=h.distanceMoved*11,hot=h.state==='windup';
  if(h.kind==='spider'){
    stroke(114,93,157);strokeWeight(cell*.045);
    for(const side of [-1,1])for(let i=0;i<4;i++){const root=(i-1.5)*.11,step=Math.sin(stride+i*PI+side)*.04;line(root*cell,side*cell*.1,(root-.13+step)*cell,side*cell*.28);line((root-.13+step)*cell,side*cell*.28,(root+.06+step)*cell,side*cell*.46);}
    noStroke();fill(103,68,141);ellipse(-cell*.14,0,cell*.5,cell*.4);fill(hot?222:159,hot?159:112,hot?249:191);ellipse(cell*.17,0,cell*.28,cell*.28);fill(246,218,255);for(const side of [-1,1])ellipse(cell*.24,side*cell*.06,cell*.055,cell*.055);
  }else{
    const lift=h.state==='leap'?Math.sin(Math.max(0,Math.min(1,1-(h.phaseUntil-clock)/.5))*PI)*cell*.2:0;
    noStroke();fill(8,19,16,120);ellipse(0,cell*.06,cell*.85,cell*.6);translate(0,-lift);
    stroke(58,103,66);strokeWeight(cell*.11);for(const side of [-1,1]){const step=Math.sin(stride+side)*.06;line(-cell*.12,side*cell*.16,-cell*.37,side*cell*.31);line(-cell*.37,side*cell*.31,-cell*(.2+step),side*cell*.42);line(cell*.15,side*cell*.14,cell*.29,side*cell*.31);}
    noStroke();fill(hot?148:107,hot?171:139,hot?70:76);ellipse(-cell*.07,0,cell*.66,cell*.47);fill(149,164,87);ellipse(cell*.22,0,cell*.4,cell*.38);for(const side of [-1,1]){fill(218,220,147);ellipse(cell*.3,side*cell*.14,cell*.18,cell*.15);fill(32,39,21);ellipse(cell*.34,side*cell*.14,cell*.07,cell*.09);}stroke(70,83,47);strokeWeight(cell*.025);line(cell*.34,-cell*.07,cell*.35,cell*.07);
  }
  if(h.state==='emerge'){noFill();stroke(240,178,121,160);strokeWeight(cell*.04);ellipse(0,0,cell,cell*.7);}pop();
}
function drawEscapeScorpion(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  const hot=['windup','sting'].includes(h.state),stride=h.distanceMoved*11;
  stroke(91,48,53);strokeWeight(cell*.055);
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const root=(i-1.5)*.12,step=Math.sin(stride+i*PI+side)*.055;
    line(root*cell,side*cell*.16,(root-.12+step)*cell,side*cell*.3);
    line((root-.12+step)*cell,side*cell*.3,(root-.02+step)*cell,side*cell*.43);
  }
  noStroke();fill(12,8,18,130);ellipse(-cell*.04,cell*.04,cell*.75,cell*.62);
  stroke(90,38,46);strokeWeight(cell*.035);fill(hot?229:150,hot?113:78,hot?97:91);ellipse(-cell*.08,0,cell*.62,cell*.38);
  for(const side of [-1,1]){stroke(177,105,106);strokeWeight(cell*.07);line(cell*.13,side*cell*.13,cell*.34,side*cell*.29);noFill();arc(cell*.39,side*cell*.29,cell*.23,cell*.2,side<0?0:PI,side<0?PI:TWO_PI);}
  const raised=hot?.26:.12+Math.sin(clock*2)*.015;
  noFill();stroke(190,121,124);strokeWeight(cell*.085);
  bezier(-cell*.3,0,-cell*.64,cell*.2,-cell*.68,-cell*.42,-cell*raised,-cell*.4);
  noStroke();fill(hot?255:232,hot?176:151,hot?85:145);triangle(-cell*raised,-cell*.45,cell*(.08-raised),-cell*.36,-cell*raised,-cell*.27);
  fill(255,215,166);ellipse(cell*.18,-cell*.065,cell*.06,cell*.06);ellipse(cell*.18,cell*.065,cell*.06,cell*.06);pop();
}
function drawEscapeBeetle(h,cell){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  const stride=h.distanceMoved*12,hot=['windup','charge'].includes(h.state);
  stroke(62,51,33);strokeWeight(cell*.07);
  for(const side of [-1,1])for(let i=0;i<3;i++){
    const root=(i-1)*.18,step=Math.sin(stride+i*Math.PI+side)*.055;
    line(root*cell,side*cell*.19,(root-.11+step)*cell,side*cell*.32);line((root-.11+step)*cell,side*cell*.32,(root+.04+step)*cell,side*cell*.43);
  }
  noStroke();fill(8,14,18,150);ellipse(-cell*.07,cell*.03,cell*.8,cell*.6);
  stroke(67,48,29);strokeWeight(cell*.035);fill(hot?243:176,hot?155:132,hot?64:69);ellipse(-cell*.08,0,cell*.7,cell*.49);
  stroke(241,205,109);strokeWeight(cell*.025);line(-cell*.38,0,cell*.18,0);
  noStroke();fill(90,85,53);ellipse(cell*.24,0,cell*.32,cell*.34);fill(hot?255:224,hot?96:211,hot?65:133);ellipse(cell*.3,-cell*.09,cell*.07,cell*.07);ellipse(cell*.3,cell*.09,cell*.07,cell*.07);
  stroke(178,166,102);strokeWeight(cell*.025);line(cell*.33,-cell*.11,cell*.48,-cell*.22);line(cell*.33,cell*.11,cell*.48,cell*.22);pop();
}
function escapeBodyShape(model,cell){
  const points=[],j=model.joints,a=model.angles,w=model.widths;
  points.push({x:j[0].x+Math.cos(a[0])*.17,y:j[0].y+Math.sin(a[0])*.17});
  for(let i=0;i<j.length;i++)points.push({x:j[i].x-Math.sin(a[i])*w[i],y:j[i].y+Math.cos(a[i])*w[i]});
  for(let i=j.length-1;i>=0;i--)points.push({x:j[i].x+Math.sin(a[i])*w[i],y:j[i].y-Math.cos(a[i])*w[i]});
  beginShape();curveVertex(points[points.length-1].x*cell,points[points.length-1].y*cell);
  for(const p of points)curveVertex(p.x*cell,p.y*cell);
  curveVertex(points[0].x*cell,points[0].y*cell);curveVertex(points[1].x*cell,points[1].y*cell);endShape(CLOSE);
}
function escapeBodyShadow(model,cell){
  push();translate(cell*.035,cell*.05);noStroke();fill(2,9,13,175);escapeBodyShape(model,cell);pop();
}
function drawEscapeSnake(model,cell,state,sea=false){
  const hot=state==='alert'||state==='chase';
  escapeBodyShadow(model,cell);
  stroke(66,46,36);strokeWeight(cell*.035);fill(sea?65:hot?224:188,sea?171:hot?126:152,sea?187:hot?94:102);escapeBodyShape(model,cell);
  // Small dorsal saddles and a light edge suggest scales without losing the
  // silhouette at phone size. The body narrows all the way to the tail tip.
  noStroke();
  for(let i=2;i<model.joints.length-2;i+=2){
    const p=model.joints[i];push();translate(p.x*cell,p.y*cell);rotate(model.angles[i]);
    fill(hot?157:122,hot?78:98,hot?57:66,135);ellipse(0,0,cell*.095,model.widths[i]*cell*1.4);
    fill(236,207,157,120);ellipse(-cell*.025,-model.widths[i]*cell*.55,cell*.06,cell*.04);pop();
  }
  const head=model.joints[0];push();translate(head.x*cell,head.y*cell);rotate(model.headAngle);
  noStroke();fill(sea?104:hot?236:210,sea?213:hot?143:174,sea?215:hot?105:122);ellipse(cell*.045,0,cell*.49,cell*.36);
  for(const side of [-1,1]){
    fill(233,205,133);ellipse(cell*.08,side*cell*.125,cell*.11,cell*.082);
    fill(31,27,20);ellipse(cell*.09,side*cell*.125,cell*.027,cell*.07);
    fill(255,244,214);ellipse(cell*.075,side*cell*.14,cell*.025,cell*.023);
    fill(76,52,36);ellipse(cell*.22,side*cell*.052,cell*.023,cell*.017);
  }
  if(model.tongue>.01){
    const tip=cell*(.24+model.tongue*.16);stroke(175,93,92);strokeWeight(cell*.018);
    line(cell*.23,0,tip,0);line(tip,0,tip+cell*.04,-cell*.027);line(tip,0,tip+cell*.04,cell*.027);
  }
  pop();
}
function drawEscapeRegrowthBug(bug,cell,clock,hungry){
  const pulse=.5+.5*Math.sin(clock*5+bug.x),bob=Math.sin(clock*3+bug.y)*.05;push();translate(bug.x*cell,(bug.y+bob)*cell);noStroke();
  if(hungry){fill(255,138,190,40+pulse*60);ellipse(0,0,cell*(.8+pulse*.25),cell*(.8+pulse*.25));}
  fill(240,250,255,hungry?150:70);const flap=Math.sin(clock*28)*.5+.5;for(const side of [-1,1])ellipse(side*cell*.11,-cell*.06,cell*.16,cell*(.08+flap*.08));
  fill(...(hungry?[255,120,178]:[150,112,132]));ellipse(0,0,cell*.16,cell*.24);fill(...(hungry?[255,220,120]:[160,150,120]));ellipse(0,cell*.07,cell*.1,cell*.09);pop();
}
function drawEscapeDroppedTail(tail,cell,clock){
  const age=clock-tail.born,life=Math.max(0,Math.min(1,(tail.expires-clock)/.6));noFill();strokeCap(ROUND);
  for(const [weight,color] of [[.13,[22,66,43]],[.09,[108,194,119]]]){stroke(...color,255*life);strokeWeight(cell*weight);beginShape();
    for(let i=0;i<=7;i++){const t=i/7,wiggle=Math.sin(age*18-t*5)*.16*(1-t*.3);curveVertex((tail.x-.35+t*.7)*cell,(tail.y+wiggle)*cell);if(i===0||i===7)curveVertex((tail.x-.35+t*.7)*cell,(tail.y+wiggle)*cell);}endShape();}
  noStroke();fill(255,214,140,120*life);textSize(cell*.42);text('!',tail.x*cell,(tail.y-.45)*cell);
}
function drawEscapeLizard(model,cell,clock,swimming=false,tailless=false){
  // A tailless Sally keeps her body and a short stump; the rig itself is unchanged.
  if(tailless)model={...model,joints:model.joints.slice(0,9),angles:model.angles.slice(0,9),widths:model.widths.slice(0,8).concat([model.widths[8]*.55])};
  if(swimming){const p=model.joints[0];noFill();stroke(151,232,223,110);strokeWeight(cell*.035);ellipse(p.x*cell,p.y*cell,cell*.9,cell*.6);for(const side of [-1,1]){const q=model.joints[4],a=model.angles[4]+side*PI/2;stroke(94,179,111);strokeWeight(cell*.065);line(q.x*cell,q.y*cell,(q.x+Math.cos(a)*.15-Math.cos(model.angles[4])*.16)*cell,(q.y+Math.sin(a)*.15-Math.sin(model.angles[4])*.16)*cell);}}
  escapeBodyShadow(model,cell);
  for(const leg of swimming?[]:model.legs){
    const r=leg.root,e={x:leg.elbow.x,y:leg.elbow.y-leg.lift*.02},f={x:leg.foot.x,y:leg.foot.y-leg.lift*.045};
    noStroke();fill(3,12,15,leg.lift>.25?75:130);ellipse(leg.foot.x*cell,leg.foot.y*cell,cell*.085,cell*.035);
    noFill();stroke(19,48,37);strokeWeight(cell*.082);
    bezier(r.x*cell,r.y*cell,e.x*cell,e.y*cell,e.x*cell,e.y*cell,f.x*cell,f.y*cell);
    stroke(94,179,111);strokeWeight(cell*.052);
    bezier(r.x*cell,r.y*cell,e.x*cell,e.y*cell,e.x*cell,e.y*cell,f.x*cell,f.y*cell);
    noStroke();fill(126,204,135);ellipse(e.x*cell,e.y*cell,cell*.055,cell*.055);
    // The lifting toes brighten and tuck slightly during the swing phase.
    stroke(leg.lift>.25?165:133,leg.lift>.25?225:203,leg.lift>.25?162:132);strokeWeight(cell*.02);
    const heading=leg.footAngle;
    for(const spread of [-.55,0,.55]){
      const a=heading+spread,length=.07*(1-leg.lift*.3);
      line(f.x*cell,f.y*cell,(f.x+Math.cos(a)*length)*cell,(f.y+Math.sin(a)*length)*cell);
    }
  }
  stroke(22,66,43);strokeWeight(cell*.03);fill(108,194,119);escapeBodyShape(model,cell);
  // A dorsal stripe follows the articulated shoulders, hips and long tail.
  noFill();stroke(192,229,146,180);strokeWeight(cell*.035);beginShape();
  for(const p of model.joints.slice(0,tailless?8:10))curveVertex(p.x*cell,p.y*cell);endShape();
  noStroke();fill(43,120,66,150);
  for(let i=2;i<8;i++)for(const side of [-1,1]){
    const p=model.joints[i],a=model.angles[i]+side*Math.PI/2,r=model.widths[i]*.55;
    ellipse((p.x+Math.cos(a)*r)*cell,(p.y+Math.sin(a)*r)*cell,cell*.045,cell*.037);
  }
  const head=model.joints[0];push();translate(head.x*cell,head.y*cell);rotate(model.headAngle);
  fill(125,208,132);ellipse(cell*.015,0,cell*.37,cell*.27);
  const blinkTime=clock%5.3,blink=blinkTime>5.12?Math.sin((blinkTime-5.12)/.18*Math.PI):0;
  for(const side of [-1,1]){
    fill(193,225,143);ellipse(cell*.02,side*cell*.124,cell*.12,cell*.087);
    fill(237,229,166);ellipse(cell*.035,side*cell*.124,cell*.075,cell*.065*(1-blink*.93));
    fill(20,49,31);ellipse(cell*.049,side*cell*.124,cell*.027,cell*.054*(1-blink*.93));
    if(blink<.7){fill(245,255,218);ellipse(cell*.035,side*cell*.134,cell*.018,cell*.018);}
    fill(44,100,55);ellipse(cell*.155,side*cell*.035,cell*.017,cell*.015);
  }
  pop();
}







function drawEscapeFish(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);const wag=Math.sin(h.distanceMoved*14+clock*2)*.08;
  noStroke();fill(12,45,65,110);ellipse(0,cell*.07,cell*.65,cell*.32);
  fill(h.state==='chase'?240:146,184,164);triangle(-cell*.2,0,-cell*.43,cell*(.2+wag),-cell*.43,cell*(-.2+wag));
  fill(207,233,213);ellipse(0,0,cell*.55,cell*.25);fill(82,153,164);triangle(-cell*.05,0,-cell*.14,-cell*.22,cell*.08,-cell*.06);triangle(-cell*.07,0,-cell*.16,cell*.18,cell*.05,cell*.07);
  fill(17,38,46);ellipse(cell*.16,-cell*.06,cell*.045,cell*.045);pop();
}
