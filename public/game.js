// Each player's settings and progress live in their own corner of the browser's storage.
const escapeStore=(()=>{try{if(typeof EscapePlayers!=='undefined')return EscapePlayers.storage();return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})()||{getItem:()=>null,setItem(){},removeItem(){}};
let gameState='start',mobile=false,paused=false,pauseStartedAt=0,pausedDuration=0,skipSimulationFrame=false;
let isMuted=false,audioUnlocked=false,soundVolume=.25,musicVolume=1,ambienceVolume=.5,escapeAudio=null,musicOn=true,escapeMusic=null,introMode='brief';
const touchInput={up:false,down:false,left:false,right:false,sprint:false,crawl:false},touchStick={x:0,y:0,pointer:null},suppressedKeys=new Set();
const controlCodes={ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Shift:16,c:67,l:76,z:90,w:87,a:65,s:83,d:68,q:81,e:69,r:82,f:70,g:71,' ':32,Enter:13};
function gameKeyDown(code){return !suppressedKeys.has(code)&&keyIsDown(code);}
function suppressHeldKeys(){Object.values(controlCodes).forEach(c=>suppressedKeys.add(c));}
function getAudioContext(){return escapeAudio||(escapeAudio=new (window.AudioContext||window.webkitAudioContext)());}
function unlockAudio(){try{const c=getAudioContext();c.resume();audioUnlocked=true;startEscapeMusic(c);}catch(_){}}
function gameNow(){return (paused?pauseStartedAt:millis())-pausedDuration;}
function isRunActive(){return gameState==='escape'&&!paused;}
function isMobileDevice(){return windowWidth<=600||Boolean(window.matchMedia?.('(pointer: coarse)')?.matches)||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);}
// A phone's screen may have three device pixels per CSS pixel; drawing all of them costs nine
// times the work for little visible gain. Cap it: 2× on a desktop, 1.5× on a phone. The game
// steps lower by itself if frames run slow (escapeWatchFrameRate).
function escapeDensityCap(){return Math.min(typeof displayDensity==='function'?displayDensity():1,mobile?1.5:2);}
let toolbarAt=-1e9;
function canvasDimensions(){return {width:Math.max(240,Math.min(windowWidth-(mobile?16:24),1400)),height:Math.max(mobile?220:360,Math.min(920,windowHeight-(mobile?16:24)))};}
function clearTouchInput() { Object.keys(touchInput).forEach(key=>{touchInput[key]=false;});touchStick.x=0;touchStick.y=0;touchStick.pointer=null;const knob=document.getElementById('movement-stick-knob');if(knob)knob.style.transform='translate(-50%,-50%)'; }
function mobilePortraitBlocked(){const blocked=mobile&&windowHeight>windowWidth&&['escapeSelect','escape','escapeResult'].includes(gameState);document.body?.classList?.toggle('mobile-portrait',blocked);document.body?.classList?.toggle('mobile-game',mobile);return blocked;}
function setupMovementStick(){
 const stick=document.getElementById('movement-stick'),knob=document.getElementById('movement-stick-knob');
 const release=e=>{if(e.pointerId!==touchStick.pointer)return;touchStick.x=0;touchStick.y=0;touchStick.pointer=null;knob.style.transform='translate(-50%,-50%)';};
 const move=e=>{if(e.pointerId!==touchStick.pointer)return;e.preventDefault();const r=stick.getBoundingClientRect(),radius=r.width*.32,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),scale=Math.min(1,radius/Math.max(d,.001));touchStick.x=d<radius*.12?0:dx*scale/radius;touchStick.y=d<radius*.12?0:dy*scale/radius;knob.style.transform='translate(calc(-50% + '+dx*scale+'px),calc(-50% + '+dy*scale+'px))';};
 stick.addEventListener('pointerdown',e=>{e.preventDefault();if(touchStick.pointer!==null||paused||mobilePortraitBlocked()||(!isRunActive()&&!(gameState==='escapeSelect'&&!escapeLibraryOpen)))return;unlockAudio();touchStick.pointer=e.pointerId;stick.setPointerCapture?.(e.pointerId);move(e);});
 stick.addEventListener('pointermove',move);for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,release);
}



function resetGameState(){paused=false;pausedDuration=0;skipSimulationFrame=false;clearTouchInput();suppressHeldKeys();escapeMapOpen=false;for(const id of ['escape-result','escape-map','escape-select'])document.getElementById(id).style.display='none';document.getElementById('game-area').classList.remove('escape-results-open','escape-map-open','escape-world-open');mountEscapeChrome(false);}
function startRun(){resetGameState();}
function togglePause(){if(gameState!=='escape')return;if(paused){pausedDuration+=millis()-pauseStartedAt;paused=false;skipSimulationFrame=true;if(escapeMapOpen){escapeMapOpen=false;document.getElementById('escape-map').style.display='none';document.getElementById('game-area').classList.remove('escape-map-open');}}else{paused=true;pauseStartedAt=millis();}clearTouchInput();suppressHeldKeys();escapeGame.paused=paused;renderEscapeHUD(true);updateToolbar();}
function updateToolbar(){document.getElementById('game-area')?.classList.toggle('title-screen',gameState==='start');{const lb=document.getElementById('lighting-button');if(lb&&typeof escapeLightingMode==='string')lb.textContent='Lighting: '+(escapeLightingAuto?'Simple (auto)':escapeLightingMode==='full'?'Full':'Simple');}{const vb=document.getElementById('view-button');if(vb){vb.style.display=mobile&&gameState==='escape'?'':'none';vb.textContent=typeof escapeCloseView==='function'&&escapeCloseView()?'View: Close':'View: Whole map';}}{const fs=document.getElementById('fullscreen-button');if(fs){fs.style.display=fullscreenAvailable()?'':'none';fs.textContent=isFullscreen()?'Exit full screen':'Full screen';}}const world=gameState==='escapeSelect'&&!escapeLibraryOpen,run=gameState==='escape';document.getElementById('mute-button').textContent=isMuted?'Sound: Off':'Sound: On';document.getElementById('music-button').textContent=musicOn?'Music: On':'Music: Off';document.getElementById('cards-button').textContent='Cards: '+({brief:'Brief',full:'Full',off:'Off'})[introMode];document.getElementById('pause-button').textContent=paused?'Resume':'Pause';document.getElementById('pause-button').disabled=!run;document.getElementById('end-run-button').style.display=run&&paused?'inline-flex':'none';{const rb=document.getElementById('restart-run-button');if(rb)rb.style.display=run&&paused?'inline-flex':'none';}document.getElementById('escape-map-button').style.display=run&&escapeGame?.level.explore?'inline-flex':'none';document.getElementById('scoreboard-box').style.display=run?'block':'none';const controls=document.getElementById('touch-controls');controls.classList.toggle('world-touch',world);controls.style.display=mobile&&(world||run)?'flex':'none';document.getElementById('touch-sprint').disabled=paused;
 for(const [id,available,charges,ready]of [['burrow',escapeGame?.level.burrows,escapeGame?.burrows,true],['camo',escapeGame?.level.pebbles,escapeGame?.decoys,escapeGame?.elapsed>=escapeGame?.decoyReadyAt],['glow',escapeGame?.level.glows,escapeGame?.glows,escapeGame?.elapsed>=escapeGame?.decoyReadyAt],['spore',escapeGame?.level.spores,escapeGame?.spores,escapeGame?.elapsed>=escapeGame?.decoyReadyAt],['tongue',escapeGame?.level.tongues,escapeGame?.tongues,!escapeGame?.tongue&&escapeGame?.elapsed>=escapeGame?.tongueReadyAt],['seed',escapeGame?.level.seeds,escapeGame?.seeds,escapeGame?.elapsed>=escapeGame?.seedReadyAt],['blend',escapeGame?.level.camos,escapeGame?.camos,escapeGame?.camoUntil<=escapeGame?.elapsed],['look',escapeGame?.level.gaze,1,true],['zoom',escapeGame?.level.explore,1,true]]){const b=document.getElementById('touch-'+id);b.style.display=run&&available?'':'none';b.disabled=paused||!charges||!ready;if(id==='zoom')b.textContent='Map';else{const kind=({camo:'decoy',blend:'camo'})[id]||id,label=({burrow:'Burrow',camo:'Pebble',glow:'Glow',spore:'Spores',tongue:'Tongue',seed:'Seed',blend:'Camo',look:'Look back'})[id],total=id==='look'?null:available;renderEscapeAbility(b,kind,label,'',charges||0,total,ready,id==='blend'&&escapeGame?.camoUntil>escapeGame?.elapsed)};}}
// Full screen hides the browser's bars on phones. Browsers only allow it from a tap, so a phone
// asks for it on the first tap and the menu has a button for it; iPhones need Add to Home Screen.
const fullscreenAvailable=()=>Boolean(document.fullscreenEnabled||document.webkitFullscreenEnabled);
const isFullscreen=()=>Boolean(document.fullscreenElement||document.webkitFullscreenElement);
function toggleFullscreen(){const d=document,el=d.documentElement;
  if(isFullscreen())(d.exitFullscreen||d.webkitExitFullscreen)?.call(d);
  else{const ask=(el.requestFullscreen||el.webkitRequestFullscreen)?.call(el,{navigationUI:'hide'});ask?.then?.(()=>screen.orientation?.lock?.('landscape').catch(()=>{})).catch(()=>{});}}
// Phones play full screen: every tap while not full screen asks again, so leaving it by accident
// (a swipe, a notification) is undone by the next touch.
function enterFullscreen(){if(!isFullscreen())toggleFullscreen();}
function closeToolbarMenu(){const bar=document.getElementById('game-toolbar');bar?.classList.remove('toolbar-open');document.getElementById('menu-button')?.setAttribute('aria-expanded','false');}
// Volume: three sliders in Options, for effects (0–100 maps to 0–0.5), music and ambience
// (0–100%). Saved with the other settings, per player.
function setupVolumePanel(){const sound=document.getElementById('sound-volume'),music=document.getElementById('music-volume'),ambience=document.getElementById('ambience-volume');if(!sound||!music)return;
  sound.value=Math.round(soundVolume*200);music.value=Math.round(musicVolume*100);if(ambience)ambience.value=Math.round(ambienceVolume*100);
  sound.oninput=()=>{soundVolume=Number(sound.value)/200;saveSettings();if(typeof escapeSound==='function')escapeSound('click');};
  music.oninput=()=>{musicVolume=Number(music.value)/100;saveSettings();};
  if(ambience)ambience.oninput=()=>{ambienceVolume=Number(ambience.value)/100;saveSettings();};
  for(const el of [sound,music,ambience].filter(Boolean))el.addEventListener('pointerdown',e=>e.stopPropagation(),true);}
function saveSettings(){try{escapeStore.setItem('sally-escape-settings',JSON.stringify({muted:isMuted,music:musicOn,cards:introMode,lighting:typeof escapeLightingMode==='string'?escapeLightingMode:'full',sound:soundVolume,musicLevel:musicVolume,ambience:ambienceVolume}));}catch(_){}updateToolbar();}
function setup(){mobile=isMobileDevice();document.getElementById('menu-button').onclick=e=>{e.stopPropagation();const bar=document.getElementById('game-toolbar'),open=!bar.classList.contains('toolbar-open');bar.classList.toggle('toolbar-open',open);e.currentTarget.setAttribute('aria-expanded',String(open));};
 document.getElementById('fullscreen-button').onclick=()=>{toggleFullscreen();closeToolbarMenu();};document.getElementById('view-button').onclick=()=>{toggleEscapeCloseView();closeToolbarMenu();};
 document.addEventListener('fullscreenchange',updateToolbar);document.addEventListener('webkitfullscreenchange',updateToolbar);
 // A tap outside the open menu closes it; on a phone any tap goes back to full screen.
 document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('#game-toolbar'))closeToolbarMenu();if(mobile&&fullscreenAvailable()&&!isFullscreen())enterFullscreen();},true);
 for(const id of ['pause-button','escape-map-button','end-run-button','restart-run-button'])document.getElementById(id)?.addEventListener('click',()=>closeToolbarMenu());
const size=canvasDimensions();createCanvas(size.width,size.height).parent('game-container');pixelDensity(escapeDensityCap());frameRate(60);setupMovementStick();try{const settings=JSON.parse(escapeStore.getItem('sally-escape-settings')||'{}');isMuted=settings.muted===true;if(['full','simple'].includes(settings.lighting))escapeLightingMode=settings.lighting;if(Number.isFinite(settings.sound))soundVolume=Math.max(0,Math.min(.5,settings.sound));if(Number.isFinite(settings.musicLevel))musicVolume=Math.max(0,Math.min(1,settings.musicLevel));if(Number.isFinite(settings.ambience))ambienceVolume=Math.max(0,Math.min(1,settings.ambience));musicOn=settings.music!==false;if(['brief','full','off'].includes(settings.cards))introMode=settings.cards;}catch(_){}setupVolumePanel();setupMenus();document.getElementById('music-button').onclick=()=>{unlockAudio();musicOn=!musicOn;saveSettings();};document.getElementById('lighting-button').onclick=()=>{escapeLightingMode=escapeLightingMode==='full'&&!escapeLightingAuto?'simple':'full';escapeLightingAuto=false;escapeSlowFrames=0;escapeFrameAvg=16;saveSettings();};document.getElementById('cards-button').onclick=()=>{introMode=({brief:'full',full:'off',off:'brief'})[introMode];saveSettings();};document.getElementById('play-button').onclick=showEscapeSelect;document.getElementById('builder-button').onclick=()=>openEscapeBuilder();document.getElementById('admin-button').onclick=()=>openEscapeAdmin();document.getElementById('community-button').onclick=()=>openEscapeCommunity();document.getElementById('mute-button').onclick=()=>{unlockAudio();isMuted=!isMuted;saveSettings();};document.getElementById('pause-button').onclick=togglePause;document.getElementById('end-run-button').onclick=showEscapeSelect;{const rb=document.getElementById('restart-run-button');if(rb)rb.onclick=()=>escapeRestart();}
 for(const action of Object.keys(touchInput)){const b=document.getElementById('touch-'+action);b.addEventListener('pointerdown',e=>{e.preventDefault();if(paused||(!isRunActive()&&gameState!=='escapeSelect'))return;unlockAudio();touchInput[action]=true;b.setPointerCapture?.(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>touchInput[action]=false);}
 escapeBindCharge(document.getElementById('touch-camo'),'pebble');escapeBindCharge(document.getElementById('touch-glow'),'glow');escapeBindCharge(document.getElementById('touch-spore'),'spore');
 for(const [id,fn]of [['burrow',useEscapeBurrow],['tongue',useEscapeTongue],['seed',useEscapeSeed],['blend',useEscapeCamo],['look',useEscapeLook],['zoom',toggleEscapeMap]])document.getElementById('touch-'+id).onclick=fn;
 window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName))return;const code=controlCodes[e.key]||controlCodes[e.key.toLowerCase()];if(!e.repeat&&code)suppressedKeys.delete(code);if(e.key.startsWith('Arrow')||e.key===' '&&e.target?.tagName!=='BUTTON')e.preventDefault();});window.addEventListener('blur',()=>{clearTouchInput();suppressHeldKeys();if(isRunActive())togglePause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&isRunActive())togglePause();});updateToolbar();}
function draw(){if(mobilePortraitBlocked()){clearTouchInput();if(isRunActive())togglePause();return;}if(millis()-toolbarAt>200){toolbarAt=millis();updateToolbar();}tickEscapeMusic();if(gameState==='escapeSelect')playEscapeWorld();else if(['escape','escapeResult'].includes(gameState)){playEscape();skipSimulationFrame=false;}else if(gameState==='builder'){}else{document.getElementById('start-menu-container').style.display='';document.getElementById('game-container').style.display='none';}}
function keyReleased(){if(gameState==='escape'&&typeof escapeKeyReleased==='function')escapeKeyReleased();}
function keyPressed(e){if(e?.repeat||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(keyCode===85&&keyIsDown(CONTROL)&&keyIsDown(ALT)){toggleEscapeTestUnlock();return false;}if(keyCode===27)togglePause();else if(String(key).toLowerCase()==='m')document.getElementById('mute-button').click();else escapeKeyPressed();}
function windowResized(){clearTouchInput();suppressHeldKeys();mobile=isMobileDevice();const size=canvasDimensions();resizeCanvas(size.width,size.height,true);mobilePortraitBlocked();}

// Options: sound, music, ambience, lighting, start cards and full screen, in one panel. Opening it
// during an escape pauses the run.
function openOptions(){const panel=document.getElementById('options-panel');if(!panel)return;closeToolbarMenu();if(gameState==='escape'&&!paused)togglePause();
  const fs=document.getElementById('options-fullscreen');if(fs){fs.style.display=fullscreenAvailable()?'':'none';fs.textContent=isFullscreen()?'Exit full screen':'Full screen';}
  panel.style.display='flex';document.getElementById('options-close')?.focus();}
function closeOptions(){const panel=document.getElementById('options-panel');if(panel)panel.style.display='none';}
// Players: who is playing, with their stars; pick one (the game reloads as them), rename, remove or add.
function playerChip(){const chip=document.getElementById('player-chip');if(!chip||typeof EscapePlayers==='undefined')return;const p=EscapePlayers.current(),sum=EscapePlayers.summary(p.id),c=EscapePlayers.COLORS[p.color]?.[1]||'#7cc46a';
  const esc=t=>String(t).replace(/[&<>"']/g,ch=>'&#'+ch.charCodeAt(0)+';');chip.innerHTML='<span class="player-dot" style="background:'+c+'"></span>Playing as <b>'+esc(p.name)+'</b> · ★ '+sum.stars;
  const play=document.getElementById('play-button');if(play)play.textContent=sum.cleared?'Continue':'Start the adventure';titleScreen(sum);}
// The title: Sally on her warm stone in her chosen colours, where the adventure stands, and on an
// iPhone (which cannot go full screen from a web page) how to play full screen.
function titleScreen(sum){
  const art=document.getElementById('title-sally');
  if(art&&typeof sallyCelebrationSVG==='function'&&typeof escapeSkinPalette==='function')try{art.innerHTML=sallyCelebrationSVG({status:'won',treasure:0,totalTreasure:10,alarms:0,tailsDropped:0,hasTail:true},escapeSkinPalette());}catch(_){}
  const where=document.getElementById('play-where');
  if(where&&typeof EscapeCatalog!=='undefined'&&typeof EscapeWorld!=='undefined'&&typeof escapeProgress!=='undefined'){
    const next=EscapeCatalog.levels.findIndex(l=>!escapeProgress.data.levels[l.id]),i=next<0?EscapeCatalog.levels.length-1:next,n=EscapeWorld.chapters.findIndex(c=>i>=c.start&&i<c.end);
    where.textContent=sum.cleared?'Area '+(n+1)+' · '+EscapeWorld.chapters[n].name+' · escape '+(i+1):'A flood, a lost lizard, and a long way home.';}
  const ios=document.getElementById('title-ios');if(ios)ios.hidden=!(/iPhone|iPod/.test(navigator.userAgent)&&!navigator.standalone);
}
let playersNewColor=1;
function renderPlayers(){
  const list=document.getElementById('players-list'),P=EscapePlayers;if(!list)return;const current=P.current();list.innerHTML='';
  for(const p of P.list()){const row=document.createElement('div');row.className='players-row'+(p.id===current.id?' players-current':'');const sum=P.summary(p.id);
    row.innerHTML='<span class="player-dot"></span><b class="players-name"></b><span class="players-stats">★ '+sum.stars+' · '+sum.cleared+' escape'+(sum.cleared===1?'':'s')+'</span>'+
      (p.id===current.id?'<span class="players-here">Playing</span>':'<button data-pplay class="escape-secondary">Play</button>')+'<button data-prename class="escape-link">Rename</button>'+(P.list().length>1?'<button data-premove class="escape-link">Remove</button>':'');
    row.querySelector('.player-dot').style.background=P.COLORS[p.color]?.[1]||'#7cc46a';row.querySelector('.players-name').textContent=p.name;
    row.querySelector('[data-pplay]')?.addEventListener('click',()=>{P.select(p.id);location.reload();});
    row.querySelector('[data-prename]').onclick=()=>{const name=prompt('New name for '+p.name,p.name);if(name){P.rename(p.id,name);renderPlayers();playerChip();}};
    const rm=row.querySelector('[data-premove]');if(rm)rm.onclick=()=>{if(!confirm('Remove '+p.name+'? Their stars and progress are forgotten.'))return;const wasCurrent=p.id===current.id;P.remove(p.id);if(wasCurrent)location.reload();else renderPlayers();};
    list.appendChild(row);}
  const form=document.getElementById('players-new');form.style.display=P.list().length>=P.MAX?'none':'';
  const colors=document.getElementById('players-colors');colors.innerHTML='';P.COLORS.forEach(([name,c],i)=>{const b=document.createElement('button');b.type='button';b.className='players-color'+(i===playersNewColor?' players-color-on':'');b.style.background=c;b.title=name;b.setAttribute('aria-label',name);b.onclick=()=>{playersNewColor=i;renderPlayers();};colors.appendChild(b);});
}
function openPlayers(){if(typeof EscapePlayers==='undefined')return;renderPlayers();document.getElementById('players-panel').style.display='flex';}
function setupMenus(){
  const $=id=>document.getElementById(id);
  $('options-button')&&($('options-button').onclick=openOptions);$('title-options')&&($('title-options').onclick=openOptions);
  $('options-close')&&($('options-close').onclick=closeOptions);$('options-fullscreen')&&($('options-fullscreen').onclick=()=>{toggleFullscreen();setTimeout(()=>{const b=$('options-fullscreen');if(b)b.textContent=isFullscreen()?'Exit full screen':'Full screen';},300);});
  $('players-button')&&($('players-button').onclick=openPlayers);$('players-close')&&($('players-close').onclick=()=>{$('players-panel').style.display='none';});
  $('players-new')&&($('players-new').onsubmit=e=>{e.preventDefault();const name=$('players-name').value;const p=EscapePlayers.create(name,playersNewColor);if(p){EscapePlayers.select(p.id);location.reload();}});
  $('extras-button')&&($('extras-button').onclick=()=>{const box=$('title-extras'),open=box.style.display==='none';box.style.display=open?'':'none';$('extras-button').setAttribute('aria-expanded',String(open));});
  for(const id of ['options-panel','players-panel'])$(id)?.addEventListener('pointerdown',e=>{if(e.target.id===id)$(id).style.display='none';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')for(const id of ['options-panel','players-panel'])if($(id)?.style.display==='flex'){$(id).style.display='none';e.stopPropagation();}},true);
  playerChip();
}
// Pausing an escape opens the menu (Resume, Restart, Options, Map, Leave), like a game's pause screen.
{const pauseOnly=togglePause;togglePause=function(){pauseOnly();if(gameState==='escape'&&paused&&typeof document!=='undefined'){const bar=document.getElementById('game-toolbar');bar?.classList.add('toolbar-open');document.getElementById('menu-button')?.setAttribute('aria-expanded','true');}else closeToolbarMenu();};}
