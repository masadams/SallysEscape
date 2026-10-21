let escapeMetCount=0,escapeBestiaryNote=null;
function escapeUnlockHint(level){const base=escapeUnlockBase(level),need=level.unlockChallenges,have=escapeProgress.challengesCleared();return need&&have<need?base.replace(/ to unlock\.$/,'')+' and complete '+need+' challenges ('+have+' so far) to unlock.':base;}
function escapeUnlockBase(level){if(level.unlockAny)return 'Clear '+level.unlockAny.map(id=>EscapeCatalog.levels.find(l=>l.id===id)?.name||id).join(' or ')+' to unlock.';const i=EscapeCatalog.levels.indexOf(level),id=level.unlockAfter||EscapeCatalog.levels[i-1]?.id;return 'Clear '+(EscapeCatalog.levels.find(l=>l.id===id)?.name||'the previous escape')+' to unlock.';}
// Why a challenge is still closed: its escape first, then stars in its area.
function escapeChallengeLock(challenge){const gate=escapeProgress.challengeGate(challenge.id),level=EscapeCatalog.levels.find(l=>l.id===challenge.levelId);if(!gate||gate.open)return '';if(!gate.cleared)return 'Clear '+level.name+' to unlock.';const area=EscapeWorld.chapters.find(c=>c.start===challenge.starGate.from)?.name||'this area';return 'Earn '+gate.need+'★ in '+area+' to unlock ('+gate.stars+' so far).';}
function escapeRecordSummary(level,saved,challenge=false){
  if(!saved)return '';
  return challenge?'✓ Complete · Best '+saved.bestTime.toFixed(1)+'s':'★'.repeat(saved.stars)+'☆'.repeat(3-saved.stars)+' · Best '+saved.bestTime.toFixed(1)+'s'+(saved.perfect?' · ✦ Perfect':saved.firstTry?' · ✓ First try':'')+(escapeProgress.isHard(level.id)?' · ◆ Hard mode':'');
}
function escapeToolkit(level){return [[level.camos||0,'camouflage'],[level.seeds||0,'seed pod'],[level.tongues||0,'tongue grab'],[level.glows||0,'glow mushroom'],[level.spores||0,'spore pouch'],[level.burrows,'burrow'],[level.pebbles,level.seasonal==='winter'?'snowball':'pebble']].filter(([n])=>n>0).map(([n,label])=>n+' '+label+(n>1&&label!=='camouflage'?'s':'')).concat(level.requiredTreasure?[level.requiredTreasure+' treasure to escape']:[],level.timeLimit?[level.timeLimit+' second escape']:[],level.tailDrop?['spare tail']:[],level.soil?.length?['soft dirt to dig into (hold '+(typeof escapePadActive==='function'&&escapePadActive()?'B':typeof mobile!=='undefined'&&mobile?'Burrow':'E')+')']:[],level.regrowth?.length?[level.regrowth.length+' pink regrowth bug'+(level.regrowth.length>1?'s':'')]:[],level.hawk?['hawk overhead']:[],level.antTrails?[level.antTrails.length+' ant column'+(level.antTrails.length>1?'s':'')]:[],level.guards.some(h=>h.kind==='gecko')?['gecko thief']:[],level.cold?['cold rooms']:[],level.vents?[level.vents.length+' steam vents']:[]);}
let escapeGame=null,escapeIntroOpen=false,escapeCharacter=null;
// Leaving a route part-way counts as an attempt, so the first-try bonus stays honest.
// Anonymous play data: a run left part-way counts as quit once it has really started.
const escapeDevice=()=>typeof mobile!=='undefined'&&mobile?'touch':'desk';
function escapeRecordQuit(){if(typeof EscapePlayData!=='undefined'&&escapeGame?.status==='playing'&&escapeGame.elapsed>3&&!escapeGame.level.seasonal)EscapePlayData.record(escapeGame,'quit',escapeDevice());}
if(typeof window!=='undefined'&&typeof EscapePlayData!=='undefined'){window.addEventListener('pagehide',()=>{escapeRecordQuit();EscapePlayData.flush(true);});if(typeof setTimeout==='function')setTimeout(()=>EscapePlayData.flush(),8000);}
function escapeRestart(){if(paused)togglePause();startEscape({...escapeOptions,skipIntro:true,quick:true});}
function escapeAbandonRun(){escapeRecordQuit();if(escapeGame&&escapeGame.status==='playing'&&!escapeGame.challenge&&escapeGame.elapsed>3){if(!escapeGame.level.seasonal)escapeProgress.attempt(escapeGame.level.id);escapeGame.status='abandoned';}}
// Full cards always show the hint; otherwise only where an area teaches a new idea.
// The opening tip repeats the hint in game, so it follows the same rule.
function escapeHintOpen(g){if(g.level.kids||g.level.seasonal)return true;const index=EscapeCatalog.levels.indexOf(g.level),best=escapeProgress.data.levels[g.level.id],open=(typeof introMode==='undefined'?'full':introMode)==='full'||(index===0||EscapeCatalog.regions.includes(index))&&!best;if(!open&&!g.challenge&&g.message===g.level.hint)g.message='';return open;}
// The intro card holds the hunters still until the player is ready.
function showEscapeIntro(){
  const g=escapeGame,level=g.level,index=EscapeCatalog.levels.indexOf(level),best=!g.challenge&&escapeProgress.data.levels[level.id];
  // Off skips the card; Brief keeps the hint folded away except where a new idea is taught.
  const mode=typeof introMode==='undefined'?'full':introMode,full=mode==='full',showHint=escapeHintOpen(g);
  escapeHintHidden=false;if(mode==='off')return;
  const card=document.getElementById('escape-intro');escapeIntroOpen=true;escapeHintHidden=!showHint;
  const tools=level.kids?[...escapeToolkit(level),'Your tools never run out. Treasure is optional.']:level.seasonal?[...escapeToolkit(level),'Treasure is optional. Retry for fresh supplies if caught.']:escapeToolkit(level),toolList=full?(tools.length?'<ul class="escape-intro-tools">'+tools.map(t=>'<li>'+t+'</li>').join('')+'</ul>':''):(tools.length?'<p class="escape-intro-kit">'+tools.join(' · ')+'</p>':'');
  const brief=g.challenge?g.challenge.brief:full?level.brief:'';
  // Names, briefs and hints can come from a shared or community level, so they are escaped as text.
  const t=escapeText;
  card.innerHTML='<span class="escape-intro-number">'+(g.challenge?'CHALLENGE · '+t(level.name):level.custom?'YOUR LEVEL':level.seasonal?(level.seasonal==='winter'?'WINTERLIGHT HOLLOW - ORNAMENT ':level.seasonal==='spring'?'BLOSSOM HOLLOW - FLOWER TOKEN ':level.seasonal==='summer'?'SUNSHORE COVE - SUN LENS ':'AUTUMN HOLLOW - LANTERN ')+(level.index+1):level.kids?'LITTLE EXPLORERS · '+(escapeKidsLevels().indexOf(level)+1)+' '+t(level.sticker||''):level.hidden?escapeHiddenLabel(level):'ESCAPE '+(index+1))+(level.draft?' · ✎ WORKSHOP DRAFT':'')+'</span><h2 id="escape-intro-title">'+t(g.challenge?g.challenge.name:level.name)+'</h2>'+(brief?'<p class="escape-intro-brief">'+t(brief)+'</p>':'')+(showHint?'<p class="escape-intro-hint">'+t(level.hint)+'</p>':'<p class="escape-intro-hint escape-intro-hidden" id="escape-intro-hint">'+t(level.hint)+'</p><button id="escape-intro-reveal" class="escape-secondary">Show hint'+escapeControlHint('H','Y')+'</button>')+toolList+(g.tailDrop&&full?'<p class="escape-intro-tail">Sally can drop her tail once here. The next catch is final.</p>':'')+(best?'<p class="escape-intro-best">Best: '+escapeRecordSummary(level,best)+'</p>':'')+'<button id="escape-intro-start" class="escape-primary">Start<span class="key-hint"> · any key</span></button>';
  card.style.display='block';card.onclick=e=>{if(e.target.closest('#escape-intro-reveal')){revealEscapeHint();return;}hideEscapeIntro();};document.getElementById('escape-intro-start').focus();
}
let escapeHintHidden=false;
// Text from a level (a custom, shared or community one included) goes into markup only escaped.
// What a hidden escape is called on its intro card: its secret spot, a bonus escape, or the Gilded Burrow.
function escapeHiddenLabel(level){if(level.secret){const spot=(typeof EscapeWorld!=='undefined'&&EscapeWorld.secrets||[]).find(s=>s.id===level.secret);return (spot?.name||'Secret spot').toUpperCase();}return level.bonus?'BONUS ESCAPE':'THE GILDED BURROW';}
// The Levels list groups escapes under the same area names and numbers as the world map; Ant
// Kingdom and Frost Hollow are side paths off the road home.
function escapeAreaHeading(i){const chapters=EscapeWorld.chapters,n=chapters.findIndex(c=>c.start===i);if(n<0)return '';const c=chapters[n];return '<div class="escape-chapter-heading">Area '+(n+1)+' · '+escapeText(c.name)+(['ants','frost'].includes(c.theme)?' · side path':'')+'</div>';}
function escapeText(text){return String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function revealEscapeHint(){if(!escapeHintHidden)return false;escapeHintHidden=false;document.getElementById('escape-intro-hint').classList.remove('escape-intro-hidden');if(escapeGame&&!escapeGame.challenge){escapeGame.message=escapeGame.level.hint;escapeGame.messageUntil=escapeGame.elapsed+7;}document.getElementById('escape-intro-reveal').style.display='none';document.getElementById('escape-intro-start')?.focus();return true;}
function hideEscapeIntro(){if(!escapeIntroOpen)return;escapeIntroOpen=false;
  // The card already showed the hint, so the run does not repeat it at the bottom of the screen.
  if(escapeGame&&!escapeHintHidden&&escapeGame.message===(escapeGame.challenge?.brief||escapeGame.level.hint))escapeGame.messageUntil=0;document.getElementById('escape-intro').style.display='none';document.activeElement?.blur?.();escapeHudAt=-Infinity;escapeSound('click');}
let escapeHudAt=-Infinity;
let escapeResultShown=false;
let escapeOptions={};
let escapeMapOpen=false;
const escapeProgress=new EscapeProgress(escapeStore);
// Test mode opens every escape and challenge; it is switched on and off in the Admin panel,
// behind the admin passkey.
// It is remembered in this browser until toggled off, and never changes saved records.
const ESCAPE_TEST_KEY='sally-escape-unlock-all';
try{escapeProgress.unlockAll=localStorage.getItem(ESCAPE_TEST_KEY)==='1';}catch(_){}
function toggleEscapeTestUnlock(){
  escapeProgress.unlockAll=!escapeProgress.unlockAll;
  try{if(escapeProgress.unlockAll)localStorage.setItem(ESCAPE_TEST_KEY,'1');else localStorage.removeItem(ESCAPE_TEST_KEY);}catch(_){}
  if(typeof escapeWorld!=='undefined'&&escapeWorld){escapeWorld.refreshRegions();escapeWorldHudSignature='';renderEscapeWorldTotals();escapeWorldToast(escapeProgress.unlockAll?'Test mode: every escape and challenge is open (turn it off in Admin).':'Test mode off.');}
  escapeSound('click');return escapeProgress.unlockAll;
}

const ESCAPE_LAST_PLAYED_KEY='sally-escape-last-played';
function showEscapeSelect(){
  escapeAbandonRun();
  // Sally comes out on the map where she just was (the escape she played, or the last one she
  // played before this visit), never jumped ahead to the next open escape across the map.
  const played=escapeGame&&!escapeGame.level.custom&&!escapeGame.level.seasonal&&!escapeGame.level.kids?escapeGame.level.id:null;
  if(played)try{escapeStore.setItem(ESCAPE_LAST_PLAYED_KEY,played);}catch(_){}
  let focus=played;if(!focus)try{focus=escapeStore.getItem(ESCAPE_LAST_PLAYED_KEY)||undefined;}catch(_){}
  if(!EscapeCatalog.levels.some(l=>l.id===focus)&&!EscapeCatalog.hidden.some(l=>l.id===focus))focus=undefined;
  escapeProgress.read();
  resetGameState();gameState='escapeSelect';
  for(const id of ['start-menu-container','game-container'])document.getElementById(id).style.display='none';
  document.getElementById('game-area').classList.add('escape-mode');
  const panel=document.getElementById('escape-select');panel.style.display='block';
  const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);
  panel.innerHTML='<button id="world-list-back" class="escape-secondary">← World map</button><div class="escape-select-heading"><span>'+EscapeCatalog.levels.length+' ESCAPES · '+EscapeCatalog.challenges.length+' CHALLENGES</span><h2>Sally’s Escape Trail</h2><p>Find the key, choose your risks, and bring Sally home.</p><p class="escape-select-totals">'+(t=>'★ '+t.stars+' / '+t.maxStars+' stars · ✓ '+t.firstTries+' first '+(t.firstTries===1?'try':'tries')+' · ◆ '+t.treasure+' treasure · ⚑ '+t.challenges+' / '+t.maxChallenges+' challenges · '+t.cleared+' / '+t.levels+' escapes cleared')(escapeProgress.totals(ESCAPE_CACHE_VALUE))+'</p></div><div class="escape-levels">'+EscapeCatalog.levels.map((level,i)=>{
    const unlocked=escapeProgress.unlocked(level.id),best=escapeProgress.data.levels[level.id];
    const toolkit=escapeToolkit(level).join(' · ');
    return escapeAreaHeading(i)+'<article class="escape-level-card '+(unlocked?'':'escape-locked')+'"><span class="escape-stage-number">'+(i+1)+'</span><h3>'+level.name+'</h3><p>'+level.brief+'</p><div class="escape-toolkit">'+toolkit+'</div><div class="escape-best">'+(best?escapeRecordSummary(level,best):unlocked?'A new escape awaits.':escapeUnlockHint(level))+'</div><button id="escape-level-'+level.id+'" class="escape-primary" '+(unlocked?'':'disabled')+'>'+(unlocked?best?'Play again':'Start escape':'Locked')+'</button></article>';
  }).join('')+'</div><h3 class="escape-challenge-heading">Extra challenges</h3><div class="escape-contracts">'+EscapeCatalog.challenges.map(challenge=>{
    const unlocked=escapeProgress.challengeUnlocked(challenge.id),best=escapeProgress.data.challenges[challenge.id],level=EscapeCatalog.levels.find(l=>l.id===challenge.levelId);
    return '<article class="escape-contract '+(unlocked?best?'':'escape-contract-new':'escape-locked')+'"><h3>'+challenge.name+'</h3><p>'+challenge.brief+'</p><div class="escape-best">'+(best?escapeRecordSummary(level,best,true):unlocked?level.name:escapeChallengeLock(challenge))+'</div><button id="escape-contract-'+challenge.id+'" class="escape-secondary" '+(unlocked?'':'disabled')+'>'+(unlocked?'Try challenge':'Locked')+'</button></article>';
  }).join('')+'</div><p class="escape-save-note">'+(escapeProgress.persistent?(typeof EscapePlayers!=='undefined'?EscapePlayers.current().name+'’s':'Your')+' medals and best times are saved on this device.':'Progress lasts for this session; this browser cannot save it.')+'</p><button id="escape-back-btn" class="escape-secondary">Main menu</button>';
  for(const level of EscapeCatalog.levels)document.getElementById('escape-level-'+level.id).onclick=()=>startEscape({levelId:level.id});
  for(const challenge of EscapeCatalog.challenges)document.getElementById('escape-contract-'+challenge.id).onclick=()=>startEscape({challengeId:challenge.id});
  document.getElementById('escape-back-btn').onclick=leaveEscape;
  
  document.getElementById('world-list-back').onclick=()=>openEscapeWorld();
  clearTouchInput();suppressHeldKeys();unlockAudio();openEscapeWorld(focus);updateToolbar();window.scrollTo?.(0,0);
}

// Shared artwork keeps desktop inventory and touch actions recognisable.
function escapeAbilityIcon(kind){
 if(kind==='decoy'&&escapeGame?.level.seasonal==='winter')return '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="17" r="11" fill="#d9edf4" stroke="#91b7ce" stroke-width="2"/><ellipse cx="12" cy="12" rx="5" ry="4" fill="#ffffff"/><path d="m12 23 4 2 6-4" fill="none" stroke="#b0cfdd" stroke-width="2"/></svg>';
  const art={
    burrow:'<path d="M4 21Q4 12 16 12T28 21" fill="#9b7859"/><ellipse cx="16" cy="21" rx="9" ry="4" fill="#172a2e"/><path d="M10 5l3 4m9-4-3 4m-3-7v6"/>',
    decoy:'<path d="M5 22l3-10 10-5 8 8-2 10-12 2Z" fill="#a9c4cd"/><path d="m8 12 9 3 1-8m-1 8 7 10" stroke="#617e8b"/>',
    spore:'<circle cx="12" cy="14" r="7" fill="#d6e896" opacity=".7" stroke="none"/><circle cx="20" cy="12" r="6" fill="#c4dc84" opacity=".75" stroke="none"/><circle cx="17" cy="20" r="6" fill="#e2efb0" opacity=".7" stroke="none"/><path d="M8 27q8-4 16 0" stroke="#8fae5a"/>',
    glow:'<circle cx="16" cy="14" r="12" fill="#6fe8d4" opacity=".25" stroke="none"/><path d="M6 15Q16 2 26 15Z" fill="#8ff0dc" stroke="#c9fff2"/><path d="M14 15v11h4V15" fill="#d9f5e4" stroke="#a8d8c4"/><circle cx="12" cy="11" r="1.5" fill="#fff" stroke="none"/><circle cx="19" cy="10" r="1.2" fill="#fff" stroke="none"/>',
    tongue:'<path d="M5 11h13a6 6 0 0 1 0 12h-6a3 3 0 0 1 0-6h6" stroke="#f5a0bb" stroke-width="5"/><path d="m5 7 4 4-4 4" stroke="#ffdfcd"/>',
    seed:'<path d="M16 27V13m0 7C5 20 4 11 5 7c8 0 12 6 11 13Zm0-5C16 6 22 4 28 5c0 7-5 11-12 10Z" fill="#a9d982" stroke="#c8efaa"/>',
    camo:'<path d="M5 22C3 10 14 4 28 5c0 14-7 23-18 20Z" fill="#8fbf80"/><path d="M7 25 23 10m-10 9-1-6m6 1 5 1" stroke="#355d46"/>',
    look:'<path d="M2 16Q16 1 30 16 16 31 2 16Z" fill="#b8dfd9"/><circle cx="16" cy="16" r="5" fill="#254e5a"/><path d="M7 5H2V1" stroke="#f0d992"/>',
    tail:'<path d="M5 6c20-4 28 17 14 22-9 3-15-8-8-12 5-3 10 3 5 5" stroke="#abd88b" stroke-width="5"/>',
    heart:'<path d="M16 28 4 16C-3 6 10 0 16 9 22 0 35 6 28 16Z" fill="currentColor" stroke="none"/>'
  };
  return '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(art[kind]||'')+'</svg>';
}
function escapeResourcePips(left,total){
  return '<span class="escape-pips" aria-hidden="true">'+Array.from({length:Math.min(total,5)},(_,i)=>'<i class="'+(i<left?'':'spent')+'"></i>').join('')+(total>5?'<b>×'+left+'</b>':'')+'</span>';
}
function renderEscapeAbility(button,kind,label,key,left,total,ready=true,active=false){
 if(kind==='decoy'&&escapeGame?.level.seasonal==='winter')label='Snowball';
  // In an unlimited level (the Magpie Roost) the pouch never empties: an infinity sign for the pips.
  const endless=total!==null&&Boolean(escapeGame?.level?.unlimited);
  const description=label+(total===null?'':endless?': unlimited':': '+left+' remaining')+(active?' · Active':!left&&total!==null?' · Empty':!ready?' · Recharging':'')+(key?' ['+key+']':'');
  const markup=escapeAbilityIcon(kind)+'<span class="escape-ability-name">'+label+'</span>'+(total===null?'<span class="escape-ability-state">'+(active?'Active':'Ready')+'</span>':endless?'<span class="escape-ability-state escape-endless">∞</span>':escapeResourcePips(left,total))+(key?'<kbd>'+key+'</kbd>':'');
  // Compare with what was last written: reading innerHTML back serialises the button every time.
  if(button._markup!==markup){button.innerHTML=markup;button._markup=markup;}
  const help={burrow:'Face a thin cracked wall to burrow through it.',spore:'Hold to throw further; release to throw. A spore cloud hides Sally, even moving, and blinds any hunter inside it.',decoy:'Hold to throw further; release to throw. While held, aim with the arrows or stick. Pebbles bank off walls and clack where they hit.',glow:'Hold to throw further; release to throw. It banks off walls and lights the ground where it lands for a while.',tongue:'Face a key or treasure within three tiles. Gaps are allowed; walls and gates block the grab.',seed:'Plant cover, brace an open doorway, or grow a marked vine crossing.',camo:'Blend into the ground while keeping still.',look:'Turn your gaze behind you briefly, even while moving.'};
  if(button._description!==description){button._description=description;button.setAttribute('aria-label',description);button.title=description+'. '+(kind==='decoy'&&escapeGame?.level.seasonal==='winter'?'Hold to throw further; aim with arrows or stick. Snowballs bank off walls and make a soft thump. They distract and briefly daze creatures just like pebbles.':help[kind]);}
  button.classList.toggle('escape-empty',total!==null&&!left&&!active);
  button.classList.toggle('escape-cooling',Boolean(left)&&!ready&&!active);
  button.classList.toggle('escape-ability-active',active);
}

const ESCAPE_GLOWBUG_CHANCE=.25;
// One-time tips, each shown when it first helps rather than all at once when a level starts (escape
// 1 already teaches leaves and cracked walls): crawling the first time Sally crunches across gravel
// near a hunter (or meets a creature that hunts by ear), held throws right after her first pebble,
// glow mushrooms when a level first hands her some. One at a time, after any other message clears.
const ESCAPE_EAR_HUNTERS=['fox','mole','cricket'];
const ESCAPE_TIPS=[
  {key:'sally-escape-crawl-tip',
    live:g=>g.level.id!=='quiet-vault'&&g.player.noisy&&!g.player.sprinting&&g.hunters.some(h=>Math.hypot(h.x-g.player.x,h.y-g.player.y)<7)||g.elapsed>3&&g.hunters.some(h=>ESCAPE_EAR_HUNTERS.includes(h.kind)),
    text:()=>mobile?'That crunch carries. Hold Crawl to creep: slow, but silent, and slower to be spotted.':'That crunch carries. Hold C to crawl: slow, but silent, and slower to be spotted.'},
  {key:'sally-escape-throw-tip',live:g=>g.level.pebbles>0&&g.decoys<g.level.pebbles,
    text:()=>escapeGame?.level.seasonal==='winter'?'Hold Snowball / Q to throw further; aim with the stick or arrows. A snowball distracts creatures, and can briefly daze one it hits.':mobile?'Next time, hold Pebble to throw further and aim with the stick. Pebbles bank off walls.':'Next time, hold Q to throw further and aim with the arrows. Pebbles bank off walls.'},
  {key:'sally-escape-tunnel-tip',live:g=>g.tunnels.length>0&&g.tunnels.some(t=>Math.min(Math.hypot(t.a.x-g.player.x,t.a.y-g.player.y),Math.hypot(t.b.x-g.player.x,t.b.y-g.player.y))<3),
    text:()=>mobile?'A burrow mound: stand on it and tap Burrow to come up out of its partner.':'A burrow mound: stand on it and press E to come up out of its partner.'},
  {key:'sally-escape-spore-tip',live:g=>g.level.spores>0&&g.elapsed>3,
    text:()=>mobile?'Spore pouches: hold Spores, aim and let go. The cloud hides Sally, even moving.':'Spore pouches: hold Z, aim and let go. The cloud hides Sally, even moving, and blinds hunters inside.'},
  {key:'sally-escape-moss-tip',live:g=>g.moss.size>0&&g.moss.has(g.tileKey(g.player)),text:()=>'Moss underfoot: not a sound, even at a run.'},
  {key:'sally-escape-echo-tip',live:g=>g.echoes.length>0&&g.inEcho(g.player)&&g.player.noisy,text:()=>'This hall echoes: every sound here carries much further.'},
  {key:'sally-escape-current-tip',live:g=>g.currents.length>0&&g.player.swimming&&g.currents.some(c=>g.player.x>=c.x1&&g.player.x<c.x2+1&&g.player.y>=c.y1&&g.player.y<c.y2+1),text:()=>'A current! It carries Sally along. Swim with it, or find another way.'},
  {key:'sally-escape-glow-tip',live:g=>g.level.glows>0&&g.elapsed>3,
    text:()=>mobile?'Glow mushrooms: hold Glow, aim and release. Their light keeps spiders and millipedes back until it fades.':'Glow mushrooms: hold L, aim and release. Their light keeps spiders and millipedes back until it fades.'}
];
let escapeTipQueue=[],escapeTipsPending=[];
function escapeCrawlTip(g){
  escapeTipQueue=[];escapeTipsPending=ESCAPE_TIPS.filter(tip=>{try{return !escapeStore.getItem(tip.key);}catch(_){return false;}});
}
function tickEscapeCrawlTip(g){
  if(g.status!=='playing')return;
  for(const tip of escapeTipsPending)if(!escapeTipQueue.includes(tip)&&tip.live(g))escapeTipQueue.push(tip);
  if(!escapeTipQueue.length||g.elapsed<2||g.messageUntil>g.elapsed)return;
  const tip=escapeTipQueue.shift();escapeTipsPending=escapeTipsPending.filter(t=>t!==tip);g.notice(tip.text());g.messageUntil=g.elapsed+5;
  try{escapeStore.setItem(tip.key,'1');}catch(_){}
}
// A run counts as hard only when hard mode was on from its start to its end.
let escapeHardRun=false;
function startEscape(options={}){
  escapeAbandonRun();if(typeof clearSeasonScenery==='function')clearSeasonScenery();escapeHardRun=escapeHardMode;
  escapeFx.clear();escapeFxDecoy=null;escapeMoment=null;escapeCurtain={at:millis(),ms:options.quick?260:620,seed:Math.random()*10};
  if(options.seasonalId){const level=EscapeCatalog.seasonal.find(l=>l.id===options.seasonalId),pack=EscapeSeasons.packs.find(p=>p.id===level?.seasonal);if(!level||!pack||!seasonOpen(pack)){openSeasonalHub();return;}}
  if(options.custom||options.kidsId||options.seasonalId?false:options.hiddenId?!escapeProgress.hiddenLevelOpen(options.hiddenId,EscapeWorld.chapters):options.challengeId?!escapeProgress.challengeUnlocked(options.challengeId):!escapeProgress.unlocked(options.levelId||'quiet-vault')){showEscapeSelect();return;}
  // Now and then (about one escape in four, never in a challenge) glow bugs drift about as a bonus.
  if(options.glowbugs===undefined&&!options.challengeId&&!options.custom&&!options.kidsId&&!options.seasonalId&&Math.random()<ESCAPE_GLOWBUG_CHANCE)options={...options,glowbugs:1+Math.floor(Math.random()*1e6)};
  startRun('escape');escapeGame=new EscapeAdventure(options.custom?{level:escapeBuildCustom(options.custom)}:options);escapeMetCount=0;escapeBestiaryNote=null;escapeCharacter=new SallyCharacter({reducedMotion:Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)});document.getElementById('escape-builder').style.display='none';escapeResultShown=false;escapeHudAt=-Infinity;
  escapeCrawlTip(escapeGame);
  escapeOptions=options.custom?{custom:options.custom,from:options.from||'builder'}:escapeGame.level.seasonal?{seasonalId:escapeGame.level.id,from:'seasonal'}:escapeGame.level.kids?{kidsId:escapeGame.level.id,from:'kids'}:escapeGame.level.hidden?{hiddenId:escapeGame.level.id}:{levelId:escapeGame.level.id,challengeId:escapeGame.challenge?.id||null};
  gameState='escape';escapeLibraryOpen=false;document.getElementById('game-area').classList.remove('escape-world-open');mountEscapeChrome(true);
  document.getElementById('game-area').classList.toggle('escape-exploring',Boolean(escapeGame.level.explore));
  for(const id of ['start-menu-container','escape-result','escape-select','escape-intro'])document.getElementById(id).style.display='none';escapeIntroOpen=false;
  document.getElementById('game-container').style.display='block';
  document.getElementById('game-area').classList.add('escape-mode');
  document.getElementById('scoreboard').innerHTML=`
    <div class="escape-mission"><span id="escape-mission-name"></span><span id="escape-timer"></span></div>
    <div class="escape-inventory"><span id="escape-key">◇ Find the key</span><span id="escape-treasure">Treasure 0 / 10</span></div>
    <div class="escape-kit" role="group" aria-label="Sally’s abilities and breath"><div class="escape-breath"><span>Breath <kbd>Shift</kbd></span><div id="escape-stamina" role="progressbar" aria-label="Stamina" aria-valuemin="0" aria-valuemax="100"><i id="escape-stamina-fill"></i></div><div id="escape-warmth-row" style="display:none"><span>Warmth</span><div id="escape-warmth" role="progressbar" aria-label="Warmth" aria-valuemin="0" aria-valuemax="100"><i id="escape-warmth-fill"></i></div></div></div>
    <div id="escape-tail" class="escape-tail-status" style="display:none" role="img"></div><div class="escape-actions"><button id="escape-burrow-action">Burrow <kbd>E</kbd></button><button id="escape-decoy-action">Toss pebble <kbd>Q</kbd></button><button id="escape-glow-action">Glow mushroom <kbd>L</kbd></button><button id="escape-spore-action">Spore pouch <kbd>Z</kbd></button><button id="escape-tongue-action" title="Face a key or treasure within three tiles. Gaps are allowed; walls and gates block the grab.">Tongue <kbd>R</kbd></button>
    <button id="escape-seed-action" title="Plant on bare ground for cover, face an open doorway to brace it, or use a marked vine bank.">Seed <kbd>F</kbd></button><button id="escape-dig-action" title="Dig a tunnel entrance, then dig its way out somewhere else; Burrow on either mound to use it.">Dig <kbd>T</kbd></button><button id="escape-camo-action" title="Blend into the ground. You stay hidden while you keep still.">Camo <kbd>X</kbd></button><button id="escape-look-action" title="Turn your gaze behind you briefly, even while moving.">Look back <kbd>Space</kbd></button></div></div><p id="escape-objective">Find the golden key. Treasure is optional.</p><p id="escape-warning" role="status" aria-live="polite"></p>`;
  // p5 redraws synchronously on resize; the new HUD must exist first.
  const size=canvasDimensions();resizeCanvas(size.width,size.height,true);
  document.getElementById('escape-burrow-action').onclick=useEscapeBurrow;
  {const b=document.getElementById('escape-burrow-action'),up=()=>{touchInput.dig=false;};b.addEventListener('pointerdown',()=>{touchInput.dig=true;});for(const t of ['pointerup','pointercancel','pointerleave'])b.addEventListener(t,up);}
  escapeBindCharge(document.getElementById('escape-decoy-action'),'pebble');escapeBindCharge(document.getElementById('escape-glow-action'),'glow');escapeBindCharge(document.getElementById('escape-spore-action'),'spore');
  document.getElementById('escape-tongue-action').onclick=useEscapeTongue;
  document.getElementById('escape-look-action').onclick=useEscapeLook;
  document.getElementById('escape-seed-action').onclick=useEscapeSeed;document.getElementById('escape-dig-action').onclick=useEscapeDig;
  document.getElementById('escape-camo-action').onclick=useEscapeCamo;
  document.getElementById('escape-map-button').onclick=toggleEscapeMap;
  clearTouchInput();suppressHeldKeys();unlockAudio();renderEscapeHUD();updateToolbar();
  if(!options.skipIntro)showEscapeIntro();else escapeHintOpen(escapeGame);
  window.scrollTo?.(0,0);
}
// Leaving a run mid-way: a playtest goes back to the editor, a community level to the community
// list, and anything else to the world map. A playtest never leads out into the world.
function escapeLeaveRun(){
  if(paused)togglePause();const from=escapeOptions?.from;
  if(from==='builder'&&typeof openEscapeBuilder==='function'){escapeRecordQuit?.();openEscapeBuilder();return;}
  if(from==='community'&&typeof openEscapeCommunity==='function'){escapeRecordQuit?.();openEscapeCommunity();return;}
  if(from==='seasonal'){openSeasonalHub(escapeGame?.level.seasonal||'autumn-hollow',escapeOptions.seasonalId);return;}
  if(from==='kids'&&typeof openLittleExplorers==='function'){openLittleExplorers(escapeOptions.kidsId);return;}
  showEscapeSelect();
}
function leaveEscape(){
  document.getElementById('escape-result').style.display='none';
  document.getElementById('escape-select').style.display='none';
  document.getElementById('game-area').classList.remove('escape-mode');
  escapeGame=null;escapeCharacter=null;resetGameState();gameState='start';
  const size=canvasDimensions();resizeCanvas(size.width,size.height);
  window.scrollTo?.(0,0);
}
function useEscapeBurrow(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.burrow();renderEscapeHUD(true);}}
// Held throws: press to start, hold to throw further (full power in 0.75 s), release to throw.
// While held, the stick or arrows aim instead of walking, and a dotted line shows the flight.
let escapeCharge=null;
const ESCAPE_CHARGE_TIME=.75;
// Held, the throw swings out to full reach, rests there a moment, then eases back in and out again,
// so a missed release can be caught on the next swing instead of only ever throwing at full reach.
const ESCAPE_CHARGE_REST=.2;
function escapeChargePower(){if(!escapeCharge)return 0;const T=ESCAPE_CHARGE_TIME,R=ESCAPE_CHARGE_REST,t=((millis()-escapeCharge.start)/1000)%(2*T+R);return t<T?t/T:t<T+R?1:1-(t-T-R)/T;}
function startEscapeCharge(kind,source='key'){
  if(gameState!=='escape'||paused||!escapeGame||escapeCharge)return;if(escapeIntroOpen){hideEscapeIntro();return;}
  const g=escapeGame;if(!g.active())return;
  if(kind==='pebble'&&!g.decoys){g.notice('No pebbles left. Use cover.');return;}
  if(kind==='glow'&&!g.glows){g.notice(g.level.glows?'No glow mushrooms left.':'No glow mushrooms here.');return;}
  if(kind==='spore'&&!g.spores){g.notice(g.level.spores?'No spore pouches left.':'No spore pouches here.');return;}
  if(g.elapsed<g.decoyReadyAt)return;
  escapeCharge={kind,source,start:millis()};renderEscapeHUD(true);
}
function releaseEscapeCharge(kind){
  if(!escapeCharge||(kind&&escapeCharge.kind!==kind))return;const c=escapeCharge,power=escapeChargePower();escapeCharge=null;
  if(gameState==='escape'&&!paused&&escapeGame)(c.kind==='glow'?escapeGame.throwGlow(power):c.kind==='spore'?escapeGame.throwSpore(power):escapeGame.throwDecoy(power));renderEscapeHUD(true);
}
let escapeChargePointerAt=-1e9;
function escapeBindCharge(button,kind){
  // A click with no press and hold before it (a keyboard Enter, an assistive tap) is a quick throw.
  button.onclick=()=>{if(millis()-escapeChargePointerAt<800||gameState!=='escape'||paused||!escapeGame)return;kind==='glow'?escapeGame.throwGlow(0):escapeGame.throwDecoy(0);renderEscapeHUD(true);};
  button.addEventListener('pointerdown',e=>{e.preventDefault();escapeChargePointerAt=millis();unlockAudio?.();startEscapeCharge(kind,'pointer');button.setPointerCapture?.(e.pointerId);});
  button.addEventListener('pointerup',()=>{escapeChargePointerAt=millis();releaseEscapeCharge(kind);});
  for(const ev of ['pointercancel','lostpointercapture'])button.addEventListener(ev,()=>{if(escapeCharge?.source==='pointer')releaseEscapeCharge(kind);});
}
function escapeKeyReleased(){
  const k=String(key).toLowerCase();
  if(k==='q')releaseEscapeCharge('pebble');if(k==='l')releaseEscapeCharge('glow');if(k==='z')releaseEscapeCharge('spore');
}
function useEscapeTongue(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.useTongue();renderEscapeHUD(true);}}
function useEscapeCamo(){if(escapeIntroOpen){hideEscapeIntro();return;}if(escapeGame?.camouflage())escapeSound('camo');renderEscapeHUD(true);}
function drawEscapeHawk(k,cell,clock){
  if(k.state==='stalk'||k.state==='dive'){const t=k.state==='dive'?1:Math.max(0,1-(k.strikeAt-clock)/k.warn),x=k.shadow.x*cell,y=k.shadow.y*cell,r=k.radius*cell*2;
    noStroke();fill(10,8,6,60+120*t);ellipse(x,y,r*(.6+.4*t),r*(.45+.3*t));noFill();stroke(255,150,90,140+100*t);strokeWeight(cell*.05);ellipse(x,y,r,r*.8);
    const a=clock*2.2,bx=x+Math.cos(a)*cell*(2.2-1.8*t),by=y-cell*(2.2-1.8*t)+Math.sin(a)*cell*.6;push();translate(bx,by);rotate(Math.cos(a)*.3);noStroke();fill(70,50,36,220);triangle(-cell*.6,0,0,-cell*.12,0,cell*.12);triangle(cell*.6,0,0,-cell*.12,0,cell*.12);ellipse(0,0,cell*.24,cell*.5);pop();}
  if(k.lastStrike&&clock-k.lastStrike.at<.5){noFill();stroke(...(k.lastStrike.hit?[255,90,70]:[200,230,200]),255*(1-(clock-k.lastStrike.at)/.5));strokeWeight(cell*.08);ellipse(k.lastStrike.x*cell,k.lastStrike.y*cell,k.radius*cell*2*(1+(clock-k.lastStrike.at)),k.radius*cell*1.6*(1+(clock-k.lastStrike.at)));}
}
function useEscapeLook(){if(gameState==='escape'&&!paused&&escapeGame){if(typeof readEscapeNearSign==='function'&&readEscapeNearSign())return;escapeGame.lookBack();renderEscapeHUD(true);}}
function useEscapeDig(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.digTunnel();renderEscapeHUD(true);}}
function useEscapeSeed(){if(gameState==='escape'&&!paused&&escapeGame){escapeGame.plantSeed();renderEscapeHUD(true);}}
function escapeKeyPressed(k=String(key).toLowerCase(),code=keyCode){
  if(gameState==='escape'&&escapeMoment&&!escapeResultShown){skipEscapeMoment(k);return;}
  // A quick restart from the pause menu: R starts the escape again at once.
  if(gameState==='escape'&&paused&&k==='r'){escapeRestart();return;}
  if(gameState==='escapeSelect'&&!escapeLibraryOpen&&(k==='r'||k==='t')){if(escapeWorld?.tongue())escapeSound('tongue');return;}
  // C tries the challenge of the escape Sally stands at, like X on a controller.
  // The same keys as the seasonal map: G the map (travel and the Journal), V the list of escapes.
  if(gameState==='escapeSelect'&&!escapeLibraryOpen&&k==='g'){if(escapeWorldPanelOpen)closeEscapeWorldPanel();else openEscapeWorldPanel();return;}
  if(gameState==='escapeSelect'&&!escapeLibraryOpen&&k==='v'){openEscapeLibrary();return;}
  if(gameState==='escapeSelect'&&!escapeLibraryOpen&&k==='c'){const b=document.getElementById('world-challenge');if(b&&b.style.display!=='none'&&b.onclick)b.onclick();return;}
  if(gameState==='escapeSelect'){if(!escapeLibraryOpen&&(code===13||k==='enter')&&document.activeElement?.tagName!=='BUTTON')enterEscapeWorld();return;}
  if(gameState==='escapeResult'&&k==='r'){startEscape({...escapeOptions,skipIntro:true,quick:true});return;}
  if(gameState==='escape'&&k==='g'){toggleEscapeMap();return;}
  if(gameState==='escape'&&['-','_','=','+'].includes(k)){escapeZoom(k==='-'||k==='_'?-1:1);return;}
  if(gameState!=='escape'||paused)return;
  if(escapeIntroOpen){if(k==='h'&&revealEscapeHint())return;hideEscapeIntro();return;}
  if((code===13||k==='enter')&&typeof readEscapeNearSign==='function'&&readEscapeNearSign())return;
  if(k==='x')useEscapeCamo();
  if(k==='e')useEscapeBurrow();
  if(k==='q')startEscapeCharge('pebble');
  if(k==='l')startEscapeCharge('glow');
  if(k==='z')startEscapeCharge('spore');
  if(k==='r'||k==='t')useEscapeTongue();
  if(k==='v'||k===' '&&document.activeElement?.tagName!=='BUTTON')useEscapeLook();
  if(k==='f')useEscapeSeed();
  if(k==='t')useEscapeDig();
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
  document.getElementById('escape-map').innerHTML='<h3>'+(all?'Maze overview':'Your explored map')+'</h3><p>Paused · Bright dot: Sally. Gold square: key. Gold dots: treasure. Green: hatch. Pink: sealed passage.'+(g.level.seeds?' Leaf diamonds: vine banks.':'')+'</p>'+svg+'<p>'+g.gates.map(g=>escapeText(g.name)+': '+(g.bracedUntil>escapeGame.elapsed?'braced · '+Math.ceil(g.bracedUntil-escapeGame.elapsed)+'s':g.closingAt!==null?'sealing':g.sealed?'sealed':g.duration?g.open?'open · '+Math.max(0,Math.ceil(g.expiresAt-escapeGame.elapsed))+'s':'step on either turquoise plate':g.open?'open':g.switch?'find its matching switch':'awaits a mechanism')).join(' · ')+'</p><button id="escape-map-close" class="escape-primary">Resume game [G]</button>';
  document.getElementById('escape-map').style.display='block';document.getElementById('game-area').classList.add('escape-map-open');document.getElementById('escape-map-close').onclick=toggleEscapeMap;document.getElementById('escape-map-close').focus();
}
function playEscape(){
  if(!escapeGame)return;
  escapeGame.paused=paused||Boolean(typeof escapeStoryOpen!=='undefined'&&escapeStoryOpen);
  if(!paused&&gameState==='escape')escapeWatchFrameRate(deltaTime);
  if(escapeIntroOpen&&gameState==='escape'&&!paused){const m=escapeMovement();if(m.x||m.y)hideEscapeIntro();}
  if(gameState==='escape'&&!escapeGame.paused&&!skipSimulationFrame&&!escapeIntroOpen){
    let {x,y,sprint,crawl,dig}=escapeMovement();
    // A key held for a throw can be let go while the window was away: drop the throw then.
    if(escapeCharge?.source==='key'&&!keyIsDown({glow:76,spore:90}[escapeCharge.kind]||81))releaseEscapeCharge();
    const pad=typeof escapePad!=='undefined'&&escapePad.active?escapePad:null,look=pad&&(pad.peekX||pad.peekY)?{x:pad.peekX,y:pad.peekY}:null;
    escapeGame.advance(deltaTime/1000,{x,y,sprint,crawl,dig,aiming:Boolean(escapeCharge),look});tickEscapeCrawlTip(escapeGame);
  }
  const events=escapeGame.drainEvents();
  escapeCharacter?.update(escapeGame,events);
  for(const cue of escapeCharacter?.drainCues()||[])escapeSound(cue);
  // Each glow bug caught counts like a golden fly: a little bonus treasure on the world totals.
  for(const event of events)if(event==='glowbug'){const gift=escapeProgress.glowGift(escapeProgress.catchGoldfly());if(gift)escapeGame.notice(gift.text);}
  // A creature's sound comes from where it is: panned left or right, and quieter further away.
  const at=escapeGame.lastEventAt||{},p=escapeGame.player;
  for(const event of new Set(events)){const q=at[event],d=q?Math.hypot(q.x-p.x,q.y-p.y):0;
    escapeSound(event==='treasure'&&escapeGame.message.startsWith('A whole')?'chest':event,q?{pan:Math.max(-.8,Math.min(.8,(q.x-p.x)/7)),gain:Math.max(.35,1/(1+Math.max(0,d-2)/5))}:{});}
  // Musical cues: the key, and the hatch opening once the key and enough treasure are in hand.
  if(events.includes('key'))escapeMusic?.cue('key');
  const open=escapeGame.hasKey&&escapeGame.treasure>=escapeGame.requiredTreasure;
  if(open&&!escapeHatchCued&&escapeGame.requiredTreasure>0){escapeHatchCued=true;if(!events.includes('key'))escapeMusic?.cue('hatch');}
  if(!open)escapeHatchCued=false;
  if(gameState==='escape'&&!paused){if(escapeGame.status==='playing')escapeFootsteps(escapeGame.player);tickEscapeFx(escapeGame);escapeShakeFor(events);}
  if(mobile&&typeof EscapeFeel!=='undefined'&&events.length)EscapeFeel.buzz(events);
  if(events.length&&typeof escapePadRumble==='function')escapePadRumble(events);
  drawEscapeVault();drawEscapeMoment();drawEscapeCurtain();renderEscapeHUD();seasonWarningNames();
  // A creature met for the first time joins the bestiary, with a short note at the top.
  if(!escapeGame.level.seasonal&&typeof tickEscapeNote==='function')tickEscapeNote(escapeGame);
  if(typeof tickEscapeKidsSign==='function')tickEscapeKidsSign(escapeGame);
  if(escapeGame.met&&escapeGame.met.size!==escapeMetCount&&!escapeGame.level.custom&&!escapeGame.level.seasonal){escapeMetCount=escapeGame.met.size;const fresh=escapeProgress.meet([...escapeGame.met]);const first=fresh.map(k=>EscapeBestiary.byKind(k)).find(Boolean);if(first)escapeBestiaryNote={text:'📖 New in the bestiary: '+first.name,until:millis()+3500};}
  if(escapeBestiaryNote&&millis()<escapeBestiaryNote.until){push();textAlign(CENTER,CENTER);const size=width<600?13:16;textSize(size);const w=escapeBestiaryNote.text.length*size*.56+28,a=Math.min(1,(escapeBestiaryNote.until-millis())/600);noStroke();fill(20,44,40,220*a);rect(width/2-w/2,54,w,32,16);fill(255,236,170,255*a);text(escapeBestiaryNote.text,width/2,70);pop();}
  if(escapeGame.status!=='playing'&&!escapeResultShown){if(!escapeMoment)startEscapeMoment(escapeGame);else if(millis()-escapeMoment.at>=escapeMoment.hold)showEscapeResult();}
}
function renderEscapeHUD(force=false){
  if(!escapeGame||(!force&&gameNow()-escapeHudAt<100))return;escapeHudAt=gameNow();
  const g=escapeGame;
  document.getElementById('escape-mission-name').textContent=(g.level.draft?'✎ ':'')+(g.challenge?g.challenge.name:g.level.custom?'✎ '+g.level.name:g.level.seasonal?(g.level.seasonal==='winter'?'Ornament ':g.level.seasonal==='spring'?'Flower token ':g.level.seasonal==='summer'?'Sun lens ':'Lantern ')+(g.level.index+1)+' · '+g.level.name:g.level.kids?(g.level.sticker||'⭐')+' '+g.level.name:g.level.hidden?'✦ '+g.level.name:(EscapeCatalog.levels.indexOf(g.level)+1)+' · '+g.level.name);
  const crossing=g.gates.filter(gate=>gate.duration&&gate.open&&gate.expiresAt!==null).sort((a,b)=>a.expiresAt-b.expiresAt)[0];
  const brace=g.gates.filter(gate=>gate.bracedUntil>g.elapsed).sort((a,b)=>a.bracedUntil-b.bracedUntil)[0],growing=g.seedGrowth.slice().sort((a,b)=>a.expires-b.expires)[0];
  const remaining=Math.max(0,Math.ceil((g.timeLimit||0)-g.elapsed));
  document.getElementById('escape-timer').textContent=g.timeLimit?Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'):crossing?crossing.name+' · '+(crossing.closingAt!==null?'clearing':Math.max(0,Math.ceil(crossing.expiresAt-g.elapsed))+'s'):brace?'Root brace · '+Math.ceil(brace.bracedUntil-g.elapsed)+'s':growing?(growing.kind==='vine'?'Vine':'Leaves')+' · '+Math.max(0,Math.ceil(growing.expires-g.elapsed))+'s':'';
  document.getElementById('escape-key').textContent=g.hasKey?'⚿ Key found':'◇ Find the key';
  document.getElementById('escape-treasure').textContent='Treasure '+g.treasure+' / '+g.totalTreasure+(g.stolen?' · '+g.stolen+' stolen':'')+(g.requiredTreasure&&g.requiredTreasure<g.totalTreasure?' · need '+g.requiredTreasure:'');
  const tail=document.getElementById('escape-tail');tail.style.display=g.tailDrop?'':'none';
  const tailHint=g.hasTail?'Spare tail: one extra escape from a catch':'Tail lost'+(g.regrowthBugs.some(b=>!b.eaten)?' · find a pink regrowth bug to grow it back':' · next catch is final');
  const tailArt=escapeAbilityIcon('tail')+'<span class="escape-tail-heart">'+escapeAbilityIcon('heart')+'</span><span class="escape-ability-name">'+(g.hasTail?'Spare tail':'Tail lost')+'</span>';
  if(tail.innerHTML!==tailArt)tail.innerHTML=tailArt;
  tail.setAttribute('aria-label',tailHint);tail.title=tailHint;tail.classList.toggle('escape-tail-lost',!g.hasTail);
  const warmRow=document.getElementById('escape-warmth-row');warmRow.style.display=g.cold.size?'':'none';if(g.cold.size){const fillW=document.getElementById('escape-warmth-fill');fillW.style.width=Math.round(g.player.warmth)+'%';fillW.style.background=g.player.chilled?'#9fd0ff':'#ffb36b';document.getElementById('escape-warmth').setAttribute('aria-valuenow',String(Math.round(g.player.warmth)));}
  document.getElementById('escape-stamina-fill').style.width=Math.round(g.player.stamina)+'%';
  document.getElementById('escape-stamina-fill').style.background=g.player.exhausted?'#edc779':'#b6dda0';
  document.getElementById('escape-stamina').setAttribute('aria-valuenow',String(Math.round(g.player.stamina)));
  const burrow=document.getElementById('escape-burrow-action'),decoy=document.getElementById('escape-decoy-action'),tongue=document.getElementById('escape-tongue-action');
  const locked=paused||!g.active()||escapeIntroOpen;
  const abilities=[
    // On a level with soft dirt the same button, held, digs in: it is always ready there.
    g.soil.size||g.tunnels.length?[burrow,'burrow',g.level.burrows?(g.soil.size?'Burrow · Dig':'Burrow · Tunnel'):g.soil.size?'Dig in':'Tunnel','E',Math.max(1,g.burrows),g.level.burrows||null,true,Boolean(g.player.dig||g.player.underground)]:[burrow,'burrow','Burrow','E',g.burrows,g.level.burrows,true,false],
    [decoy,'decoy','Pebble','Q',g.decoys,g.level.pebbles,g.elapsed>=g.decoyReadyAt,escapeCharge?.kind==='pebble'],
    [document.getElementById('escape-glow-action'),'glow','Glow','L',g.glows,g.level.glows||0,g.elapsed>=g.decoyReadyAt,escapeCharge?.kind==='glow'],
    [document.getElementById('escape-spore-action'),'spore','Spores','Z',g.spores,g.level.spores||0,g.elapsed>=g.decoyReadyAt,escapeCharge?.kind==='spore'],
    [tongue,'tongue','Tongue','R',g.tongues,g.level.tongues,!g.tongue&&g.elapsed>=g.tongueReadyAt,Boolean(g.tongue)],
    [document.getElementById('escape-seed-action'),'seed','Seed','F',g.seeds,g.level.seeds,g.elapsed>=g.seedReadyAt,false],
    [document.getElementById('escape-dig-action'),'dig',g.pendingDig?'Dig way out':'Dig tunnel','T',g.diggers+(g.pendingDig?1:0),g.level.diggers||0,true,Boolean(g.pendingDig)],
    [document.getElementById('escape-camo-action'),'camo','Camo','X',g.camos,g.level.camos,g.camoUntil<=g.elapsed,g.camoUntil>g.elapsed],
    [document.getElementById('escape-look-action'),'look','Look back','Space',1,g.level.gaze?null:0,true,g.lookUntil>g.elapsed]
  ];
  for(const [button,kind,label,key,left,total,ready,active]of abilities){
    button.style.display=total===null||total>0?'':'none';button.disabled=locked||!left||!ready;
    renderEscapeAbility(button,kind,label,typeof escapePadLabel==='function'?escapePadLabel(key):key,left,total,ready,active);
  }
  const nextGate=g.gates.find(gate=>!gate.open&&!gate.sealed&&gate.switch),mazeGoal=g.mazeObjectiveText();
  document.getElementById('escape-objective').textContent=mazeGoal|| (nextGate?(g.hasKey?'Key found. ':'Find the key. ')+nextGate.name.charAt(0).toUpperCase()+nextGate.name.slice(1)+' switch opens the next room.':g.exitUnlocked()?'Hatch open. Head for the green hatch—or risk more treasure.':g.requiredTreasure?g.hasKey?'Bring '+(g.requiredTreasure-g.treasure)+' more treasure to the hatch.':'Find the key and '+(g.requiredTreasure===g.totalTreasure?'all ':'')+g.requiredTreasure+' treasure.':g.challenge?.keyByTongue?'Use a tongue grab for the key. Save one for it.':g.challenge?.steamTraps?'Daze '+Math.max(0,g.challenge.steamTraps-g.steamed)+' more hunters with steam, then escape.':g.challenge?.noChill?'Find the key. Never let Sally get chilled.':g.challenge?.noTheft?'Find the key. Do not let a gecko keep any treasure.':g.challenge?.noChase?'Find the key. Escape without a chase.':'');
  const priority={patrol:0,recover:0,decoy:1,search:2,alert:3,chase:4,windup:5,charge:6,sting:7,leap:6,emerge:0,still:0,follow:0,dig:1,buried:1,rise:5,glimmer:5,swoop:6,rooted:0,reveal:5,lunge:6,caw:5,grab:1,retract:1,clash:2,glare:5,return:1},hunter=g.hunters.length?g.hunters.reduce((a,b)=>priority[a.state]>=priority[b.state]?a:b):{kind:'none',state:'patrol'};
  const moods={patrol:'',alert:hunter.reason==='heard'?'It heard you. Find quiet floor or cover!':'It is looking your way. Find cover!',chase:'Spotted! Break sight or distract it.',decoy:'Following the pebble. Slip past!',search:'Searching. Keep quiet.'};
  const beetleWarning=hunter.kind==='ladybird'&&hunter.state==='dead'?'A ladybird is playing dead. Creep past slowly, or crawl.':hunter.kind==='ladybird'&&hunter.state==='warn'?'The ladybird is about to fly up and buzz!':hunter.kind==='magpie'&&hunter.state==='caw'?'A magpie has seen you! It is about to caw.':hunter.kind==='magpie'&&['fly','grab'].includes(hunter.state)?'A magpie is after your pebble. The distraction will not last.':hunter.kind==='owl'&&['glare','swoop'].includes(hunter.state)?'An owl has seen you! Leave the marked spot before it swoops.':hunter.kind==='mimic'&&['reveal','lunge'].includes(hunter.state)?'That chest is a mimic! Change direction!':hunter.kind==='moth'&&['glimmer','swoop'].includes(hunter.state)?'Pale wings gathering! Step away from the glowing mark.':hunter.kind==='cricket'&&hunter.state==='rise'?'The ground is heaving! Step away.':['toad','spider'].includes(hunter.kind)&&['windup','leap'].includes(hunter.state)?(hunter.kind==='toad'?'Toad tongue! Break its line of sight.':'Spider aiming silk! Leave the marked ground.'):(g.logs||[]).some(l=>l.warning)?'A log is about to roll! Get out of its lane.':hunter.kind==='toad'&&['windup','tongue'].includes(hunter.state)?'Toad tongue! Break its line of sight.':hunter.kind==='spider'&&hunter.state==='rush'?'A plucked web brings the spider!':hunter.kind==='cricket'&&hunter.state==='chirp'?'A cricket is about to chirp!':hunter.kind==='scorpion'&&['windup','sting','raise'].includes(hunter.state)?(hunter.state==='raise'?'Scorpion tail rising! Get out of its ring.':'Scorpion striking! Change direction!'):['windup','charge'].includes(hunter.state)?'Beetle '+(hunter.state==='windup'?'aiming':'charging')+' from '+(Math.abs(hunter.x-g.player.x)>Math.abs(hunter.y-g.player.y)?hunter.x<g.player.x?'the left':'the right':hunter.y<g.player.y?'above':'below')+'! Dodge sideways.':null;
  document.getElementById('escape-warning').textContent=paused?'':escapeAidsHidden(g)?'':g.vents.some(v=>v.warning&&v.tiles.some(([x,y])=>Math.hypot(x+.5-g.player.x,y+.5-g.player.y)<2.2))?'A vent is hissing! Clear its lane.':g.player.chilled?(g.player.warmth<=0?'Sally is frozen stiff! Crawl to a warm stone.':'Sally is freezing! Get to a warm stone or warm ground.'):g.hunters.some(h=>h.kind==='gecko'&&h.state==='flee')?'Catch the gecko before it reaches its burrow!':g.hunters.some(h=>h.kind==='gecko'&&h.state==='dash')?'A gecko is after your treasure! Outrun it or hide.':g.antTrails.length&&g.antAt(g.player,2)?'Ants marching! Cross in the gaps between groups.':g.hawk&&['stalk','dive'].includes(g.hawk.state)?(g.shaded()||g.player.hidden?'The hawk is circling. Stay put—you are hidden.':'A hawk is circling! Get under an awning, into leaves, or press X to blend in.'):g.droppedTail?'Your tail is wriggling. The hunters want it—run!':beetleWarning||(priority[hunter.state]<3?(growing&&growing.expires-g.elapsed<=1.2?'The seed growth is fading. Clear the vines or find fresh cover.':crossing&&crossing.expiresAt-g.elapsed<=1.2?'The crossing is folding! Clear the planks or doorway.':hunter.state==='clash'?'The hunters clash! Slip past.':g.player.swimming?'Swimming slows Sally. Aim for the next island.':g.player.webbed?'Silk slows your feet. Move off the web.':g.pendingSpawns.length?'A den is opening. Keep clear of the shaking ground.':null):null)|| (g.player.hidden?(hunter.state==='chase'?'Hidden, but it remembers where you were.':(g.player.underground?'Underground. Nothing can reach Sally here.':g.player.dig?.buried?'Dug in. Nothing can see or catch Sally. Let go to climb out.':g.inCloud?.(g.player)&&g.clouds?.length?'Hidden in the spores, even on the move.':g.moss?.has(g.tileKey(g.player))&&!g.player.moving?'Hidden. Wait for an opening.':'Hidden in the leaves. Wait for an opening.')):['alert','chase'].includes(hunter.state)?moods[hunter.state]:g.player.noisy&&!g.player.sprinting?'Noisy ground! Step onto dark floor to stay quiet.':g.messageUntil>g.elapsed?g.message:moods[hunter.state]??(hunter.state==='rooted'?'The garden stirs.':['still','follow'].includes(hunter.state)?'Something rustles nearby.':hunter.kind==='scorpion'?'Scorpion recovering. Slip past.':hunter.kind==='beetle'?'The beetle is catching its breath.':'The hunter is recovering. Slip past.'));
    if(g.level.seasonal==='winter'){const warning=document.getElementById('escape-warning');warning.textContent=g.winterMessage(warning.textContent);}
}
// Autumn Hollow names its costumed creatures in the warning line: whole words only, never over Paused,
// and the line is written only when it actually changes.
function seasonWarningNames(){const g=escapeGame;if(!g||g.level.seasonal!=='autumn-hollow')return;const el=document.getElementById('escape-warning');let t=el.textContent;if(!t||t==='Paused')return;
  if(g.hunters.some(h=>h.kind==='fox'&&['crouch','pounce'].includes(h.state)))t='The roast turkey is rushing! Move sideways, or creep quietly next time.';
  const next=t.replace(/\bAn owl\b/g,'A ghost').replace(/\bowl\b/g,'ghost').replace(/\bBeetle\b/g,'Zombie gardener').replace(/\bbeetle\b/g,'zombie gardener').replace(/\bToad tongue\b/g,'Pumpkin vine').replace(/\btoad\b/g,'pumpkin').replace(/That chest is a mimic/g,'That basket is haunted');
  if(next!==el.textContent)el.textContent=next;}
function showEscapeResult(){
  escapeResultShown=true;gameState='escapeResult';clearTouchInput();suppressHeldKeys();
  const r=escapeGame.result,won=r.status==='won',hardWin=won&&!escapeGame.level.seasonal&&!r.challengeId&&!escapeGame.level.kids&&!escapeGame.level.custom&&!r.draft&&(escapeHardRun||escapeGame.level.noAids);if(hardWin)escapeProgress.markHard(r.levelId);
  const seasonal=Boolean(escapeGame.level.seasonal);if(!seasonal){escapeProgress.record(r);if(typeof escapeStoryForResult==='function')escapeStoryForResult(escapeGame.level,won);if(typeof EscapePlayData!=='undefined')EscapePlayData.record(escapeGame,r.status,escapeDevice());}const firstTry=!seasonal&&won&&!r.challengeId&&escapeProgress.lastFirstTry,perfect=!seasonal&&won&&!r.challengeId&&escapeProgress.lastPerfect;document.getElementById('escape-result').classList.toggle('escape-first-try',firstTry&&!perfect);document.getElementById('escape-result').classList.toggle('escape-perfect',perfect);
  document.getElementById('game-area').classList.add('escape-results-open');
  document.getElementById('escape-result-location').textContent=r.levelName;
  document.getElementById('escape-result-title').textContent=won?(r.challengeId?'Challenge complete!':perfect?'Perfect escape! First try, every star, every treasure.':firstTry?'First try! Sally escaped!':'Sally escaped!'):r.status==='failed'?'Challenge missed':'Nearly… try another way';
  const celebration=document.getElementById('escape-character-celebration'),pose=sallyCelebrationFor(r);
  celebration.style.display=pose?'':'none';celebration.innerHTML=pose?sallyCelebrationSVG(r,escapeSkinPalette()):'';
  celebration.setAttribute('aria-label',pose?.label||'');
  const rating=r.treasure===r.totalTreasure?'Every last treasure found. Legendary escape.':r.treasure>=5?'A brave treasure haul.':r.treasure>0?'A little treasure and a clever escape.':'Safe and sound. Try a treasure detour next time.';
  const tailNote=r.tailsDropped?(r.hasTail?' Sally lost her tail and grew it back.':' Sally left her tail behind.'):'';
  // A failed attempt explains the catch; treasure only matters when Sally gets out.
  const best=!r.challengeId&&escapeProgress.data.levels[r.levelId];
  document.getElementById('escape-result-summary').textContent=won?rating+tailNote+' Treasure '+r.treasure+' / '+r.totalTreasure+' · '+r.time.toFixed(1)+'s':r.message+tailNote;
  if(r.glowbugs)document.getElementById('escape-result-summary').textContent+=' · ✦ '+r.glowbugs+' glow bug'+(r.glowbugs>1?'s':'')+' freed';
  document.getElementById('escape-result-medals').textContent=won?(r.challengeId?'✓ '+escapeGame.challenge.name:' · ✓ Escape · '+(r.treasure>=Math.ceil(r.totalTreasure*.6)?'✓':'○')+' Collect '+Math.ceil(r.totalTreasure*.6)+'+ treasure · '+(r.alarms===0&&r.hasTail!==false?'✓':'○')+' No alarm'+(r.hasTail===false?' · tail lost':'')+(firstTry?' · ✓ First try bonus':'')+(hardWin?' · ◆ Hard mode':'')):(best?'Your best here: '+escapeRecordSummary(escapeGame.level,best)+'.':'Every attempt teaches something new.');
  // The stars pop in one at a time, each with a chime that climbs.
  if(won&&!r.challengeId&&!escapeGame.level.kids&&!seasonal){const medals=document.getElementById('escape-result-medals'),row=document.createElement('span');row.className='escape-stars';
    for(let i=0;i<3;i++){const star=document.createElement('span');star.className=i<r.stars?'star-pop':'star-pop star-empty';star.style.animationDelay=(.25+i*.3)+'s';star.textContent=i<r.stars?'★':'☆';row.appendChild(star);
      if(i<r.stars&&typeof setTimeout==='function')setTimeout(()=>{if(gameState==='escapeResult')escapeSound('ping',{gain:.8+i*.2});},250+i*300);}
    medals.prepend?.(row);}
  const next=escapeGame.level.hidden||escapeGame.level.custom||escapeGame.level.kids||seasonal?null:EscapeCatalog.levels[EscapeCatalog.levels.indexOf(escapeGame.level)+1],nextButton=document.getElementById('escape-next-btn');
  // Point at any challenge this win opened, so it is not missed on the map.
  const opened=won&&!seasonal?escapeProgress.announceChallenges():[],openedText=opened.map(c=>c.name+(c.levelId===r.levelId?'':' ('+EscapeCatalog.levels.find(l=>l.id===c.levelId).name+')')).join(', ');
  const mastered=won&&!seasonal&&!r.challengeId?escapeProgress.announceMastery(EscapeWorld.chapters):[];
  document.getElementById('escape-result-challenge').textContent=[opened.length?'⚑ New challenge open: '+openedText+'. Find the glowing flag on the map.':'',...mastered.map(c=>'♛ '+c.name+' mastered! Every star is yours, and Sally can now wear its '+(ESCAPE_SKINS[c.theme]?.name||c.name)+' colours. Change them on the world map.')].filter(Boolean).join(' ');
  if(mastered.length)escapeSound('cache');
  if(perfect&&escapeProgress.whisper())document.getElementById('escape-result-challenge').textContent+=' ✦ Somewhere beyond the trail, something has noticed you.';
  if(seasonal)document.getElementById('escape-note-btn')?.remove?.();else if(typeof escapeNoteResultButton==='function')escapeNoteResultButton();
  nextButton.style.display=won&&!r.challengeId?'inline-block':'none';
  nextButton.textContent=next?'Try next escape →':'World map';
  const community=escapeGame.level.custom&&escapeOptions.from==='community';
  if(community&&won)escapeCommunityRecord(escapeGame.level.id,r.time);
  nextButton.onclick=next?()=>startEscape({levelId:next.id}):community?()=>openEscapeCommunity():escapeGame.level.custom?()=>openEscapeBuilder():showEscapeSelect;
  if(escapeGame.level.custom){nextButton.style.display='inline-block';nextButton.textContent=community?'Back to community levels':'Back to the builder';}
  document.getElementById('escape-result').style.display='block';
  document.getElementById('escape-retry-btn').onclick=()=>startEscape({...escapeOptions,skipIntro:true,quick:true});
  document.getElementById('escape-retry-btn').className=won&&!r.challengeId?'escape-secondary':'escape-primary';
  // A playtest or a community level has no way out to the world map from its results: only back to where it came from.
  {const menu=document.getElementById('escape-menu-btn');menu.onclick=showEscapeSelect;menu.textContent='World map';menu.className=won?'escape-primary':'escape-secondary';menu.style.display=escapeGame.level.custom?'none':'';}
  if(escapeGame.level.kids&&typeof escapeKidsResult==='function')escapeKidsResult(r);
  if(seasonal)escapeSeasonResult(r);
  (won&&!r.challengeId?nextButton:document.getElementById('escape-retry-btn')).focus();renderEscapeHUD(true);
}
// Adaptive music boots after the first user gesture and then follows the game every frame.
let escapeAmbience=null;
function startEscapeMusic(context){
  if(!escapeAmbience&&typeof EscapeAmbience!=='undefined'){escapeAmbience=new EscapeAmbience();escapeAmbience.start(context);}
  if(typeof EscapeMusic==='undefined'||escapeMusic)return;escapeMusic=new EscapeMusic();
  escapeMusic.load(context).then(ok=>{if(ok)escapeMusic.start();});
}
function tickEscapeMusic(){
  if(!escapeMusic)return;
  escapeMusic.setVolume((paused?.35:1)*.6*musicVolume,isMuted||!musicOn||musicVolume===0);
  const screen=gameState==='start'?'menu':gameState==='escapeSelect'||gameState==='seasonalHub'?'world':'game';
  const seasonTheme=gameState==='seasonalHub'?({winter:'winter-village',spring:'spring-garden',summer:'summer-harbour'}[seasonWorld?.areaAt?.()?.id||seasonPack]||'autumn-festival'):screen==='game'&&escapeGame?.level.seasonal?escapeGame.level.seasonalTheme:null;
  // A story card being read has music of its own: a music box, warmer once Sally knows she is a Wayfinder.
  if(typeof escapeStoryOpen!=='undefined'&&escapeStoryOpen){const part=escapeStoryOpen.part?.n||escapeStoryOpen.card?.part||1;escapeMusic.setState('story',millis()/1000);escapeMusic.setStyle(EscapeMusic.styleFor(escapeStoryOpen.card?.kind==='season-sign'?escapeStoryOpen.card.theme:part>=2?'wayfinder':'tale'));escapeAmbience?.setVolume(0);return;}
  escapeMusic.setState(EscapeMusic.stateFor({screen,game:screen==='game'?escapeGame:null}),millis()/1000);
  // Each region has a style and each escape its own tune; the world map follows the courtyard Sally is standing in.
  const chapters=EscapeWorld.chapters,index=screen==='game'&&escapeGame?EscapeCatalog.levels.indexOf(escapeGame.level):-1,chapter=index>=0?chapters.find(c=>index>=c.start&&index<c.end):screen==='world'&&escapeWorld?chapters[escapeWorld.chapterAt()]:chapters[0];
  // Places off the trail have their own themes: each secret spot, the Gilded Burrow, the bonus
  // maze, and the finale for the last escape and the long run home.
  const lvl=screen==='game'&&escapeGame?escapeGame.level:null,hiddenAt=lvl?.hidden?EscapeCatalog.hidden.findIndex(l=>l.id===lvl.id):-1;
  const special=seasonTheme||(!lvl?null:lvl.secret?'secret:'+lvl.secret:lvl.id==='the-long-way-home'||lvl.id==='home'?'finale':lvl.bonus?'hollow':lvl.hidden?'gilded':null);
  escapeMusic.setStyle(special&&EscapeMusic.STYLES[special]?EscapeMusic.styleFor(special,seasonTheme?(lvl?.index??-1):special==='hollow'?1:Math.max(0,hiddenAt)):EscapeMusic.styleFor(chapter?.theme||'meadow',index>=0&&chapter?index-chapter.start:-1));
  escapeMusic.setFlavor?.(screen==='game'&&escapeGame?EscapeMusic.flavorFor(escapeGame):null);
  // Under the water the music is muffled, and hidden still in leaves it softens a little. The
  // nearest creature swells the tension strings as it comes close, before anything has noticed her.
  const run=screen==='game'&&escapeGame?.status==='playing'?escapeGame:null,sally=run?.player;
  escapeMusic.setMuffle?.(!run?null:sally.swimming?'water':!sally.moving&&run.grid[Math.floor(sally.y)]?.[Math.floor(sally.x)]==='L'?'hide':null);
  if(run&&escapeMusic.setNearness){let d=Infinity;for(const h of run.hunters)if(!['rooted','buried','hidden','asleep'].includes(h.state))d=Math.min(d,Math.hypot(h.x-sally.x,h.y-sally.y));escapeMusic.setNearness((5.5-d)/3.5);}
  // The soundscape follows the same place, softer on the map and the menu, ducked in a chase;
  // the map has the weather, an escape only the place's own sounds.
  // Sound effects echo in caves and halls, never on the map.
  if(audioUnlocked&&typeof EscapeAudio!=='undefined'&&EscapeAudio.setSpace&&typeof EscapeFeel!=='undefined')EscapeAudio.setSpace(getAudioContext(),screen==='game'?EscapeFeel.space(special||chapter?.theme||'meadow',lvl):'open');
  if(escapeAmbience){const key=special||chapter?.theme||'meadow';escapeAmbience.setScape(screen==='menu'?'meadow':EscapeAmbience.SCAPES[key]?key:'meadow',screen==='game'?'level':'world');
    escapeAmbience.setVolume(isMuted?0:ambienceVolume*.33*(screen==='menu'?.45:screen==='world'?.7:1)*(paused?.35:1)*(escapeMusic.state==='chase'?.5:1));escapeAmbience.tick();}
}
function escapeSound(event,options={}){
  if(isMuted||paused||!audioUnlocked||soundVolume===0||typeof EscapeAudio==='undefined')return;
  try{const voice=gameState==='escape'&&escapeGame?.level.seasonal==='winter'&&['clack','decoy'].includes(event)?'winter-snowball':event;EscapeAudio.play(getAudioContext(),voice,soundVolume,options);if(gameState==='escape'&&escapeGame?.level.seasonal){const cue=seasonSoundCue(event,escapeGame);if(cue)EscapeAudio.play(getAudioContext(),cue,soundVolume*.65,options);}}catch(_){/* Audio feedback remains optional. */}
}
// Soft footfalls follow Sally's real travelled distance, louder when sprinting.
let escapeHatchCued=false;
let escapeStepFrom=null,escapeStepDistance=0,escapeStepAlt=false;
function escapeFootsteps(p){
  if(!escapeStepFrom||!p.moving){escapeStepFrom={x:p.x,y:p.y};escapeStepDistance=0;return;}
  escapeStepDistance+=Math.hypot(p.x-escapeStepFrom.x,p.y-escapeStepFrom.y);escapeStepFrom={x:p.x,y:p.y};
  if(escapeStepDistance>=(p.sprinting?.62:p.crawling?.7:.48)){escapeStepDistance=0;escapeStepAlt=!escapeStepAlt;
    // The world map walks on plain ground; inside an escape the ground decides the step.
    const inRun=gameState==='escape'&&escapeGame&&typeof EscapeFeel!=='undefined',surface=inRun?EscapeFeel.surface(escapeGame):gameState==='seasonalHub'&&seasonWorld?seasonWorld.surfaceAt(p):'floor';
    escapeSound(p.swimming?'paddle':p.crawling?'crawl':'step',{sprint:p.sprinting,alt:escapeStepAlt,surface});
    if(inRun&&!p.swimming&&!p.crawling)EscapeFeel.step(escapeFx,escapeGame,{t:escapeFxClock,sprint:p.sprinting,alt:escapeStepAlt});}
}
// Feel: footprints, dust, leaves, sparks and noise rings, kept in one small pool per run. Rings
// show how far a noise carries, so they stay on in Simple lighting; the rest is Full only.
const escapeFx=typeof EscapeFeel!=='undefined'?new EscapeFeel.Particles():{items:[],add(){},update(){},clear(){}};
let escapeFxDecoy=null,escapeFxClock=0,escapeSkid={at:0,puff:0,v:null};const escapeSkidSeen=new WeakMap();
function tickEscapeFx(g){
  escapeFxClock+=Math.min(.1,deltaTime/1000);escapeFx.update(escapeFxClock,deltaTime/1000);
  if(g.decoy&&g.decoy!==escapeFxDecoy&&typeof EscapeFeel!=='undefined')EscapeFeel.land(escapeFx,g.decoy,escapeFxClock,Math.random,g);escapeFxDecoy=g.decoy;tickEscapeAtmo(g);
  // A hunter thrown into a skid sprays dust out to the side it is sliding from, with a scrape.
  for(const h of g.hunters)if(h.skidAt&&h.skidAt!==escapeSkidSeen.get(h)&&typeof EscapeFeel!=='undefined'){escapeSkidSeen.set(h,h.skidAt);const a=h.skidFrom?.heading??h.facing;
    for(let i=0;i<9;i++){const side=(i%2?1:-1)*(1.2+Math.random()*.6);escapeFx.add('dust',h.x,h.y+.15,{t:escapeFxClock,life:.55+Math.random()*.25,size:.15+Math.random()*.12,vx:Math.cos(a)*(1.8+Math.random()*1.4)+Math.cos(a+side)*1.1,vy:Math.sin(a)*(1.8+Math.random()*1.4)+Math.sin(a+side)*1.1-.25,color:[186,170,138]});}
    if(g.visibleTile(Math.floor(h.x),Math.floor(h.y)))escapeSound('scrape',{gain:.6});}
  // Sally skids a little when she doubles back at a sprint: a puff of dust thrown the way she was
  // going and a soft scuff. It is only for the look; she still turns on the spot.
  const v=g.playerVelocity,sk=escapeSkid;if(v&&escapeFxClock-sk.at>.12){const pv=sk.v,sp=Math.hypot(v.x,v.y),pp=pv?Math.hypot(pv.x,pv.y):0;
    if(pv&&g.player.sprinting&&pp>2.5&&sp>1&&(v.x*pv.x+v.y*pv.y)<-.4*sp*pp&&escapeFxClock-sk.puff>.5&&typeof EscapeFeel!=='undefined'){sk.puff=escapeFxClock;const p=g.player;
      for(let i=0;i<5;i++)escapeFx.add('dust',p.x,p.y+.2,{t:escapeFxClock,life:.5,size:.14+Math.random()*.1,vx:pv.x/pp*(1.6+Math.random())+(Math.random()-.5),vy:pv.y/pp*(1.6+Math.random())+(Math.random()-.5)-.3,color:[176,164,138]});escapeSound('step',{sprint:true});}
    sk.v={x:v.x,y:v.y};sk.at=escapeFxClock;}
}
// Big moments. A catch freezes the scene for a beat (the hunters stop where they struck), the
// camera leans in and "Caught!" pops up; an escape bursts with sparks and leaves before the results.
// Any key skips ahead, and R goes straight to another try.
let escapeMoment=null;
if(typeof document!=='undefined')document.addEventListener('pointerdown',()=>{if(gameState==='escape'&&escapeMoment&&!escapeResultShown)skipEscapeMoment('');});
const escapeReducedMotion=()=>typeof window!=='undefined'&&Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
function startEscapeMoment(g){
  const won=g.status==='won';escapeMoment={kind:g.status,at:millis(),hold:won?1150:850};
  if(won&&typeof EscapeFeel!=='undefined'){const p=g.player;for(let i=0;i<22;i++){const a=i/22*Math.PI*2;escapeFx.add(i%3?'spark':'leaf',p.x,p.y,{t:escapeFxClock,life:1.1,size:i%3?.09:.12,vx:Math.cos(a)*(2+i%4),vy:Math.sin(a)*(2+i%4)-1.5,angle:a,spin:5,color:i%3?[255,226,140]:[150,200,110]});}}
  else escapeShake(7,300);
}
function skipEscapeMoment(k){
  if(!escapeMoment||escapeResultShown)return false;
  if(k==='r'&&escapeMoment.kind!=='won'){startEscape({...escapeOptions,skipIntro:true,quick:true});return true;}
  showEscapeResult();return true;
}
function drawEscapeMoment(){
  if(!escapeMoment||escapeResultShown)return;const t=(millis()-escapeMoment.at)/1000,won=escapeMoment.kind==='won',fade=Math.max(0,1-t/(escapeMoment.hold/1000));
  push();noStroke();
  if(!won){const ctx=drawingContext,grad=ctx.createRadialGradient?.(width/2,height/2,Math.min(width,height)*.25,width/2,height/2,Math.max(width,height)*.7);
    if(grad){grad.addColorStop(0,'rgba(120,20,20,0)');grad.addColorStop(1,'rgba(150,30,30,'+(.45*fade).toFixed(3)+')');ctx.fillStyle=grad;ctx.fillRect(0,0,width,height);}}
  const grow=t<.16?t/.16*1.25:Math.max(1,1.25-(t-.16)*1.6),size=Math.min(64,width/9)*grow;
  textAlign(CENTER,CENTER);textStyle(BOLD);textSize(size);fill(20,30,30,200*Math.min(1,fade*3));text(won?'Escaped!':escapeMoment.kind==='failed'?'Missed!':'Caught!',width/2+3,height*.36+3);
  fill(...(won?[255,226,140]:[255,170,150]),255*Math.min(1,fade*3));text(won?'Escaped!':escapeMoment.kind==='failed'?'Missed!':'Caught!',width/2,height*.36);
  if(!won){textStyle(NORMAL);textSize(Math.max(13,size*.24));fill(236,240,226,210*Math.min(1,fade*3));text(mobile?'Tap to continue':'R to try again · any key to continue',width/2,height*.36+size*.75);}
  textStyle(NORMAL);pop();
}
// The camera leans a little ahead of Sally as she moves, pulls back when a hunter gives chase,
// leans in on a catch, and shakes for a beetle's crash, thunder or a catch (never with reduced motion).
let escapeCam={g:null,lx:0,ly:0,zoom:1,cx:null,cy:null,shakeUntil:0,shakeFor:1,shakeAmp:0};
function escapeShake(amp,ms){if(escapeReducedMotion())return;if(millis()+ms>escapeCam.shakeUntil||amp>escapeCam.shakeAmp){escapeCam.shakeAmp=amp;escapeCam.shakeFor=ms;escapeCam.shakeUntil=millis()+ms;}}
function escapeShakeFor(events){if(events.includes('thunder'))escapeShake(5,450);else if(events.some(e=>e==='clash'||e==='smash'||e==='rumble'))escapeShake(3.5,250);}
// The follow camera glides after Sally rather than being pinned to her. The game moves her in fixed
// 1/120 s steps, so a frame can carry two steps or three; a camera locked to her made the whole map
// judder whenever the frame rate wavered (a TV, a busy scene). The glide smooths that out, and a jump
// (a new area, a respawn) cuts straight to her.
function escapeCameraMotion(view,g,w,h){
  const dt=Math.min(.05,(deltaTime||16)/1000),k=1-Math.exp(-dt*3),glide=1-Math.exp(-dt*9);if(escapeCam.g!==g){escapeCam.g=g;escapeCam.lx=escapeCam.ly=0;escapeCam.zoom=1;escapeCam.cx=null;}
  const p=g.player,chasing=g.status==='playing'&&g.hunters.some(q=>q.state==='chase'&&Math.hypot(q.x-p.x,q.y-p.y)<10);
  if(!view.follow){escapeCam.cx=null;escapeCam.applied=1;}else{
    const still=escapeReducedMotion(),lead=!still&&p.moving&&g.status==='playing'?(p.sprinting?1.6:.9):0;escapeCam.lx+=((p.facing?.x||0)*lead-escapeCam.lx)*k;escapeCam.ly+=((p.facing?.y||0)*lead-escapeCam.ly)*k;
    if(!still)escapeCam.zoom+=((escapeMoment&&escapeMoment.kind!=='won'?1.1:chasing?.86:1)-escapeCam.zoom)*k;else escapeCam.zoom=1;
    const clamp=(n,a,b)=>b<a?(a+b)/2:Math.max(a,Math.min(b,n)),cell=view.cell*escapeCam.zoom;
    // The right stick peeks up to four tiles ahead (a little more across, where the screen is wider).
    const pk=1-Math.exp(-dt*8),pad=typeof escapePad!=='undefined'?escapePad:{};escapeCam.px=(escapeCam.px||0)+((pad.peekX||0)*4.5-(escapeCam.px||0))*pk;escapeCam.py=(escapeCam.py||0)+((pad.peekY||0)*3.5-(escapeCam.py||0))*pk;
    const tx=(w/2-view.ox)/view.cell+escapeCam.lx+escapeCam.px,ty=(h/2-view.oy)/view.cell+escapeCam.ly+escapeCam.py;
    if(escapeCam.cx===null||Math.hypot(tx-escapeCam.cx,ty-escapeCam.cy)>8){escapeCam.cx=tx;escapeCam.cy=ty;}else{escapeCam.cx+=(tx-escapeCam.cx)*glide;escapeCam.cy+=(ty-escapeCam.cy)*glide;}
    const cx=clamp(escapeCam.cx,w/(2*cell),g.width-w/(2*cell)),cy=clamp(escapeCam.cy,h/(2*cell),g.height-h/(2*cell));
    view.cell=cell;view.ox=w/2-cx*cell;view.oy=h/2-cy*cell;escapeCam.applied=escapeCam.zoom;
  }
  if(millis()<escapeCam.shakeUntil){const a=escapeCam.shakeAmp*(escapeCam.shakeUntil-millis())/escapeCam.shakeFor;view.ox+=(Math.random()-.5)*2*a;view.oy+=(Math.random()-.5)*2*a;}
}
// Into an escape: two leafy curtains part from the middle (quicker on a retry).
let escapeCurtain=null;
function drawEscapeCurtain(){
  if(!escapeCurtain)return;const t=(millis()-escapeCurtain.at)/escapeCurtain.ms;if(t>=1||escapeReducedMotion()){escapeCurtain=null;return;}
  const open=1-Math.pow(1-t,3),half=width/2*(1-open);push();noStroke();
  for(const side of [-1,1]){const edge=side<0?half:width-half;fill(22,44,34);rect(side<0?0:edge,0,half,height);
    fill(58,96,62);for(let y=-20;y<height+40;y+=34){const wob=Math.sin(y*.05+escapeCurtain.seed)*8;push();translate(edge+wob*side,y);rotate(side*(.6+Math.sin(y)*.2));ellipse(0,0,46,20);pop();}}
  pop();
}
// The mark over a hunter: "?" while it is unsure, with a ring filling as it grows surer, then a
// "!" that pops when it gives chase; a note while it chases a pebble; dots while it searches.
// Hard mode (an option) and the Blind Grove hide every drawn aid: gaze cones, ?/! marks, aim lines
// and charge lanes, strike and hearing rings, noise rings, off-screen markers, the danger edge and
// creature warnings. The creatures' own body tells, their sounds and the music still give them away.
function escapeAidsHidden(g=escapeGame){if(g?.level?.seasonal)return false;return Boolean((typeof escapeHardMode!=='undefined'&&escapeHardMode)||g?.level?.noAids);}
const escapeMarkPops=new WeakMap();
function escapeHunterMark(h,cell,g){
  // A creature bonked by a pebble sees stars for a moment (shown even in hard mode: it is the creature's own tell).
  if(h.bonkFrom&&h.state==='steamed'){push();noStroke();fill(255,226,120);textAlign(CENTER,CENTER);textSize(cell*.28);for(let i=0;i<3;i++){const a=g.elapsed*6+i*2.09;text('★',h.x*cell+Math.cos(a)*cell*.32,(h.y-.55)*cell+Math.sin(a)*cell*.12);}pop();}
  if(escapeAidsHidden(g))return;
  const mark=h.state==='alert'?'?':['chase','windup','charge','sting','leap','glimmer','swoop','reveal','lunge','snap','peek','scuttle','aim','raise','stir','surface','ripple'].includes(h.state)?'!':h.state==='decoy'?'♪':'…';
  let seen=escapeMarkPops.get(h);if(!seen||seen.mark!==mark){seen={mark,at:escapeFxClock};escapeMarkPops.set(h,seen);}
  const age=escapeFxClock-seen.at,scale=mark==='!'&&age<.3?1+.6*Math.sin(Math.min(1,age/.3)*Math.PI):1,y=(h.y-.65)*cell;
  if(mark==='?'&&h.awareness>0){noFill();stroke(255,214,133,90);strokeWeight(Math.max(1.5,cell*.06));ellipse(h.x*cell,y,cell*.62,cell*.62);
    stroke(255,Math.round(214-90*h.awareness),Math.round(133-70*h.awareness),230);arc(h.x*cell,y,cell*.62,cell*.62,-HALF_PI,-HALF_PI+TWO_PI*h.awareness);}
  noStroke();fill(...(h.state==='decoy'?[195,182,255]:mark==='!'?[255,170,96]:[255,214,133]));textSize(cell*.65*scale);text(mark,h.x*cell,y);
}
function drawEscapePrints(g,cell){
  if(!escapeLightingFull())return;noStroke();
  for(const p of escapeFx.items){if(p.kind!=='print')continue;const k=1-(escapeFxClock-p.born)/p.life;push();translate(p.x*cell,p.y*cell);rotate(p.angle);fill(...p.color,110*k);ellipse(0,0,cell*p.size*1.5,cell*p.size);pop();}
}
function drawEscapeFx(g,cell){
  const full=escapeLightingFull();
  for(const p of escapeFx.items){const age=escapeFxClock-p.born,k=Math.max(0,1-age/p.life);
    // A noise ring: a soft shimmer through the tips of its rays, like a vibration in the air rather
    // than a line, easing out and fading, with a fainter echo just behind it. Where rays part (a wall
    // between them, or a bounce) it breaks instead of bridging the gap.
    if(p.kind==='ring'){const n=p.rays?.length;if(!n||escapeAidsHidden())continue;const life=age/p.life;noFill();
      for(const [lag,wide,thin] of [[0,30,60],[.14,16,24]]){const f=Math.min(1,Math.max(0,life-lag)),e=1-(1-f)*(1-f),fade=(1-f)*(1-f)*Math.min(1,f*8);if(!fade)continue;
        const at=(ray,i)=>{const q=ray[Math.min(ray.length-1,Math.round(e*(ray.length-1)))],w=.05*Math.sin(i*1.7+age*40)*(1-f);return [q[0]+w,q[1]+w,q[2]];},gap=.8+e*p.r*.25;
        for(const [weight,alpha] of [[cell*.16,wide],[Math.max(1,cell*.018),thin]]){if(!alpha)continue;strokeWeight(weight);let prev=at(p.rays[n-1],n-1);
          for(let i=0;i<n;i++){const q=at(p.rays[i],i);if(Math.abs(q[0]-prev[0])+Math.abs(q[1]-prev[1])<gap){stroke(...p.color,alpha*fade*Math.pow(.75,Math.max(q[2],prev[2])));line(prev[0]*cell,prev[1]*cell,q[0]*cell,q[1]*cell);}prev=q;}}}
      continue;}
    if(!full||p.kind==='print')continue;noStroke();if(drawEscapeAtmoParticle(p,cell,age,k))continue;
    if(p.kind==='dust'){fill(...p.color,120*k);ellipse(p.x*cell,p.y*cell,cell*p.size*(1+age*2),cell*p.size*(1+age*2));}
    else if(p.kind==='leaf'){push();translate(p.x*cell,p.y*cell);rotate(p.angle);fill(...p.color,220*k);ellipse(0,0,cell*p.size*1.6,cell*p.size*.8);pop();}
    else if(p.kind==='spark'){fill(...p.color,255*k);ellipse(p.x*cell,p.y*cell,cell*p.size,cell*p.size);}}
}
// Phones show a close, following view by default; the menu switches to the whole map.
const ESCAPE_CLOSE_VIEW_KEY='sally-escape-close-view';
function escapeCloseView(){try{return escapeStore.getItem(ESCAPE_CLOSE_VIEW_KEY)!=='0';}catch(_){return true;}}
function toggleEscapeCloseView(){try{escapeStore.setItem(ESCAPE_CLOSE_VIEW_KEY,escapeCloseView()?'0':'1');}catch(_){}updateToolbar();}
// The floor, walls and other still tiles, drawn once into an offscreen layer and copied each frame;
// the layer is redrawn only when the map itself changes (a smashed wall, flattened leaves).
let escapeTileCache=null,escapeTerrainBase=null;
function drawEscapeStillTiles(g,cell,palette,index){
  // Full lighting draws continuous ground, water and solid walls first (escape-terrain.js), and keeps
  // them if the game steps down by itself; choosing Simple keeps the plain tiles.
  const terrain=escapeTerrainOn()&&typeof drawEscapeTerrainGround==='function',deepWater=terrain&&escapeTerrainDeepIsWater(index);
  if(terrain){const base=escapeTerrainBase;if(base?.layer)image(base.layer,0,0,g.width*cell,g.height*cell);else{drawEscapeTerrainGround(g,cell,palette);drawEscapeTerrainWater(g,cell,index,palette);drawEscapeTerrainWalls(g,cell,palette);}}
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){
    const tile=g.grid[y][x],floor=g.floor(x,y);
    if(!terrain||tile==='G'||tile==='Y'){noStroke();fill(...palette[floor?0:1]);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*0.12);
    if(!floor){stroke(...palette[2]);strokeWeight(1);line((x+.15)*cell,(y+.12)*cell,(x+.85)*cell,(y+.12)*cell);}}
    // A crack: drawn as wall with a dark, jagged slit only Sally fits through.
    if(tile==='Y'){noStroke();fill(...palette[1]);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*0.12);fill(6,10,12);beginShape();for(const [dx,dy] of [[.42,0],[.56,.22],[.48,.45],[.6,.7],[.52,1],[.42,1],[.46,.7],[.36,.45],[.46,.22],[.36,0]])vertex((x+dx)*cell,(y+dy)*cell);endShape(CLOSE);}
    if(tile==='B'){
      stroke(93,151,160);strokeWeight(1.3);line((x+0.3)*cell,(y+0.2)*cell,(x+0.6)*cell,(y+0.55)*cell);line((x+0.6)*cell,(y+0.55)*cell,(x+0.35)*cell,(y+0.8)*cell);
    }
    // Leaf cover: a bush in Simple; with Full lighting a soft bed for the swaying grass clump drawn over it.
    if(tile==='L'){
      noStroke();if(terrain){fill(38,84,56,150);ellipse((x+.5)*cell,(y+.62)*cell,cell*.95,cell*.62);fill(52,110,70,170);ellipse((x+.5)*cell,(y+.58)*cell,cell*.7,cell*.42);}
      else{fill(49,109,77);for(const [dx,dy] of [[.3,.4],[.65,.3],[.5,.65]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.45,cell*.4);}
    }
    if(tile==='N'){
      noStroke();fill(135,118,92);for(const [dx,dy] of [[.3,.3],[.7,.45],[.4,.7]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.13,cell*.1);
    }
    if(tile==='M'){noStroke();fill(93,76,48);ellipse((x+.5)*cell,(y+.5)*cell,cell*.8,cell*.65);fill(113,102,59,140);ellipse((x+.35)*cell,(y+.4)*cell,cell*.4,cell*.24);}
    if(tile==='V'){stroke(96,172,104);strokeWeight(cell*.14);line(x*cell,(y+.4)*cell,(x+1)*cell,(y+.6)*cell);line(x*cell,(y+.7)*cell,(x+1)*cell,(y+.3)*cell);noStroke();fill(164,206,121);ellipse((x+.5)*cell,(y+.4)*cell,cell*.3,cell*.12);}
    if(g.level.biome==='desert'&&tile==='.'){stroke(229,179,109,85);strokeWeight(cell*.025);line((x+.18)*cell,(y+.7)*cell,(x+.7)*cell,(y+.62)*cell);}
    // In the Mushroom Grotto a gap is a black sinkhole with a faint glowing rim, and on Storm Heights
    // a sheer drop with a pale edge, not a channel.
    if(tile==='P'&&index>=78&&index<88){const storm=index>=83;noStroke();fill(...(storm?[8,10,16]:[6,4,10]));rect(x*cell,y*cell,cell,cell);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(g.grid[y+dy]?.[x+dx]!=='P'&&g.floor(x+dx,y+dy)){fill(...(storm?[200,210,225,80]:[170,130,230,70]));if(dx)rect((x+(dx>0?.88:0))*cell,y*cell,cell*.12,cell);else rect(x*cell,(y+(dy>0?.88:0))*cell,cell,cell*.12);}if((x*7+y*13)%11===0){fill(190,160,255,60+40*Math.sin(g.elapsed*2+x));ellipse((x+.5)*cell,(y+.5)*cell,cell*.08,cell*.08);}}
    else if(tile==='P'&&!deepWater){
      noStroke();fill(14,47,66);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*.12);stroke(64,126,155,150);strokeWeight(cell*.025);
      for(const dy of [.3,.65])line((x+.2)*cell,(y+dy)*cell,(x+.8)*cell,(y+dy)*cell);
    }
  }
  if(escapeLightingFull())drawEscapeAtmoGround(g,cell,palette,index);
  // Cracks again on top of the wall textures: the slit with a pale broken-stone rim and a little
  // rubble at its foot, so a way through always reads at a glance.
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.grid[y][x]==='Y'){const pts=[[.42,0],[.56,.22],[.48,.45],[.6,.7],[.52,1],[.42,1],[.46,.7],[.36,.45],[.46,.22],[.36,0]];
    noStroke();fill(222,206,170,170);beginShape();for(const [dx,dy] of pts)vertex((x+.5+(dx-.47)*1.7)*cell,(y+dy)*cell);endShape(CLOSE);
    fill(6,10,12);beginShape();for(const [dx,dy] of pts)vertex((x+dx)*cell,(y+dy)*cell);endShape(CLOSE);
    fill(170,156,128,220);for(const [dx,dy,r] of [[.22,.9,.12],[.74,.86,.1],[.62,.95,.07],[.3,.97,.07]])ellipse((x+dx)*cell,(y+dy)*cell,cell*r,cell*r*.75);}
  // A thin wall Sally can burrow through: a dark forked crack with a pale edge, over any texture.
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.grid[y][x]==='B'){const P=(dx,dy)=>[(x+dx)*cell,(y+dy)*cell],path=[[.3,.14],[.52,.38],[.4,.56],[.6,.86]],fork=[[.52,.38],[.74,.46]];
    for(const [col,w] of [[[236,224,196,150],.11],[[24,20,16,235],.055]]){stroke(...col);strokeWeight(Math.max(1.5,cell*w));noFill();strokeJoin?.(ROUND);
      beginShape();for(const [dx,dy] of path)vertex(...P(dx,dy));endShape();line(...P(...fork[0]),...P(...fork[1]));}
    noStroke();fill(150,138,112,200);ellipse(...P(.62,.94),cell*.1,cell*.07);ellipse(...P(.44,.96),cell*.07,cell*.05);}
  if(terrain&&g.ice?.size)drawEscapeZone(g.ice,cell,()=>true,[143,196,220],255,0);
  for(const key of g.ice||[]){const [x,y]=key.split(',').map(Number);noStroke();if(!terrain){fill(143,196,220);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*.12);}fill(205,235,248,200);triangle(x*cell+cell*.18,y*cell+cell*.2,x*cell+cell*.55,y*cell+cell*.16,x*cell+cell*.2,y*cell+cell*.55);stroke(230,248,255,160);strokeWeight(Math.max(1,cell*.03));line(x*cell+cell*.62,y*cell+cell*.3,x*cell+cell*.8,y*cell+cell*.72);}
  // Full lighting: soft shadows where floor meets a wall above or to the left, so mazes read in depth.
  if(escapeLightingFull())for(let y=1;y<g.height;y++)for(let x=1;x<g.width;x++){if(!g.floor(x,y))continue;noStroke();
    if(!g.floor(x,y-1))for(let i=0;i<3;i++){fill(0,0,0,[58,32,14][i]);rect(x*cell,y*cell+i*cell*.07,cell,cell*.07);}
    if(!g.floor(x-1,y))for(let i=0;i<3;i++){fill(0,0,0,[40,22,10][i]);rect(x*cell+i*cell*.06,y*cell,cell*.06,cell);}}
}
function drawEscapeTiles(g,screenCell,palette,index){
  // The cached layers are drawn at the camera's size before its chase pull-back or moment lean-in, and
  // scaled to the screen: those zooms ease every frame and must not force the layers to be redrawn.
  const cell=+(screenCell/(escapeCam.applied||1)).toFixed(3);
  const key=g.level.id+'|'+cell+'|'+index+'|'+escapeLightingFull()+'|'+g.grid.map(r=>r.join('')).join('/')+'|'+(g.crateVersion||0),w=g.width*cell,h=g.height*cell;
  // Without a real p5 sketch (the test harness) the tiles are simply drawn every frame.
  if(!p5.instance?._renderer||!drawingContext.drawImage)drawEscapeStillTiles(g,screenCell,palette,index);
  else{
    // The terrain has a layer of its own that only changes when walls or water do, so a gate
    // opening redraws the light tile layer without redrawing the ground beneath it.
    if(escapeTerrainOn()&&typeof drawEscapeTerrainGround==='function'){const baseKey=g.level.id+'|'+cell+'|'+index+'|'+g.grid.map(r=>r.join('')).join('/').replace(/G/g,'g');
      if(escapeTerrainBase?.key!==baseKey){if(!escapeTerrainBase||escapeTerrainBase.w!==w||escapeTerrainBase.h!==h||escapeTerrainBase.d!==pixelDensity()){escapeTerrainBase?.layer.remove();escapeTerrainBase={layer:createGraphics(w,h),w,h,d:pixelDensity()};}
        const layer=escapeTerrainBase.layer,host=p5.instance,renderer=host._renderer;layer.clear();
        host._renderer=layer._renderer;try{push();drawEscapeTerrainGround(g,cell,palette);drawEscapeTerrainWater(g,cell,index,palette);drawEscapeTerrainWalls(g,cell,palette);pop();}finally{host._renderer=renderer;}
        escapeTerrainBase.key=baseKey;escapeTileCache&&(escapeTileCache.key=null);}}
    if(escapeTileCache?.key!==key){
    if(!escapeTileCache||escapeTileCache.w!==w||escapeTileCache.h!==h||escapeTileCache.d!==pixelDensity()){escapeTileCache?.layer.remove();escapeTileCache={layer:createGraphics(w,h),w,h,d:pixelDensity()};}
    const layer=escapeTileCache.layer,host=p5.instance,renderer=host._renderer;layer.clear();
    // Point the drawing calls at the layer for one pass, then back at the screen.
    host._renderer=layer._renderer;try{push();drawEscapeStillTiles(g,cell,palette,index);pop();}finally{host._renderer=renderer;}
    escapeTileCache.key=key;
  }
  drawingContext.drawImage(escapeTileCache.layer.elt,0,0,g.width*screenCell,g.height*screenCell);}
  {const cell=screenCell;if(!escapeLightingFull())for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.grid[y][x]==='U'){
      noStroke();fill(22,99,121);rect(x*cell,y*cell,cell,cell);stroke(112,213,211,100);strokeWeight(cell*.035);const tide=Math.sin(g.elapsed*1.4+x*.5+y)*.05;for(const dy of [.3,.7])line((x+.15)*cell,(y+dy+tide)*cell,(x+.85)*cell,(y+dy-tide)*cell);
    }}
}
// Lighting: Full (soft darkness, glowing light sources, each area's mood) or Simple (the plain,
// flat look). Full drops to Simple by itself if the frame rate sags, until the player picks again.
let escapeLightingMode='full',escapeLightingAuto=false,escapeFrameAvg=16,escapeSlowFrames=0,escapeFogCanvas=null;
// The terrain art (ground, water edges, solid walls) is a still layer drawn once, so it stays when the
// frame rate makes the game drop to Simple by itself; only choosing Simple brings back the plain tiles.
function escapeTerrainOn(){return escapeLightingMode==='full'&&typeof document!=='undefined'&&Boolean(drawingContext?.createRadialGradient&&drawingContext.drawImage);}
function escapeLightingFull(){return escapeLightingMode==='full'&&!escapeLightingAuto&&typeof document!=='undefined'&&Boolean(drawingContext?.createRadialGradient&&drawingContext.drawImage);}
function escapeWatchFrameRate(dt){
  const density=pixelDensity(),full=escapeLightingMode==='full'&&!escapeLightingAuto;
  if((!full&&density<=1)||!dt)return;escapeFrameAvg=escapeFrameAvg*.95+Math.min(100,dt)*.05;
  // Three seconds of frames under about 45 a second steps quality down: sharpness first (2× to 1.5×
  // to 1×), then Simple lighting. Sharpness steps down with Simple lighting picked too.
  escapeSlowFrames=escapeFrameAvg>22?escapeSlowFrames+Math.min(100,dt):0;if(escapeSlowFrames<3000)return;escapeSlowFrames=0;escapeFrameAvg=16;
  if(density>1){pixelDensity(density>1.5?1.5:1);return;}escapeLightingAuto=true;updateToolbar();
}
// Where a level sits, for its mood: its region (and how far into it), or a place of its own.
function escapePlace(level){
  if(!level||level.custom&&!level.costume)return null;
  if(level.seasonal||level.costume)return {key:level.seasonalTheme,step:level.index||0};
  if(level.kids)return {key:level.kidsTheme||EscapeWorld.chapters[0]?.theme||'meadow',step:0};
  if(level.secret)return {key:'secret:'+level.secret,step:0};
  if(level.id==='the-long-way-home'||level.id==='home')return {key:'finale',step:0};
  if(level.bonus)return {key:'hollow',step:0};if(level.hidden)return {key:'gilded',step:0};
  const index=EscapeCatalog.levels.findIndex(l=>l.id===level.id),chapter=EscapeWorld.chapters.find(c=>index>=c.start&&index<c.end);
  return chapter?{key:chapter.theme,step:index-chapter.start}:null;
}
// Light sources glow (additively) over the lit ground, before the darkness goes on top.
function drawEscapeLights(g,cell,mood){
  if(!escapeLightingFull())return;const strength=g.level.dark||g.level.explore||mood?.night?1:.55,ctx=drawingContext;ctx.save();ctx.globalCompositeOperation='lighter';
  // The glow bug that follows Sally gives off a faint light of its own where it is dark.
  const sources=EscapeLighting.lightSources(g);if(escapeCompanion&&escapeProgress.companion?.()&&(g.level.dark||mood?.night))sources.push({x:escapeCompanion.x,y:escapeCompanion.y,r:1.1,color:[120,230,210],alpha:.14});
  for(const s of sources){const x=s.x*cell,y=s.y*cell,r=s.r*cell,[R,G,B]=s.color,a=s.alpha*strength,grad=ctx.createRadialGradient(x,y,0,x,y,r);
    grad.addColorStop(0,'rgba('+R+','+G+','+B+','+a+')');grad.addColorStop(.45,'rgba('+R+','+G+','+B+','+a*.45+')');grad.addColorStop(1,'rgba('+R+','+G+','+B+',0)');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2);}
  ctx.restore();
}
// Darkness over what Sally cannot see. Simple: flat remembered tiles. Full: one pixel per tile,
// scaled up smoothly, so darkness fades across tile edges instead of stepping. Either way memory
// shows layout only; creatures and objects out of sight are never drawn.
function drawEscapeFog(g,cell){
  if(!escapeLightingFull()){
    for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(!g.visibleTile(x,y)){
      noStroke();const known=g.discovered.has(x+','+y);fill(...(known&&g.level.dark?[5,10,16]:known?(['P','U'].includes(g.grid[y][x])?[12,30,44]:g.floor(x,y)?[16,28,31]:[31,43,49]):[7,15,22]));rect(x*cell,y*cell,cell,cell);
      if(known){stroke(23,34,40);strokeWeight(.6);noFill();rect(x*cell+1,y*cell+1,cell-2,cell-2);}
    }
    return;
  }
  const w=g.width,h=g.height;if(!escapeFogCanvas)escapeFogCanvas=document.createElement('canvas');if(escapeFogCanvas.width!==w||escapeFogCanvas.height!==h){escapeFogCanvas.width=w;escapeFogCanvas.height=h;}
  const c=escapeFogCanvas.getContext('2d'),img=c.createImageData(w,h),d=img.data,dark=g.level.dark;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(g.visibleTile(x,y)){d[i+3]=0;continue;}
    const known=g.discovered.has(x+','+y),[r,gr,b,a]=known?(dark?[4,8,14,236]:[8,16,22,172]):[6,12,18,255];d[i]=r;d[i+1]=gr;d[i+2]=b;d[i+3]=a;}
  c.putImageData(img,0,0);const ctx=drawingContext;ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(escapeFogCanvas,0,0,w*cell,h*cell);ctx.restore();
}
// The area's mood over the whole view: a soft-light colour grade, a time-of-day wash from one
// side, and a vignette.
// Danger and safety, eased so they fade rather than snap: warm dark edges in a chase, a hush over
// the view while Sally is hidden.
let escapeDanger=0,escapeHush=0;
function drawEscapeGrade(mood,g){
  if(!escapeLightingFull())return;const ctx=drawingContext,W=width,H=height,clock=g?.elapsed||0;
  if(g){const chase=EscapeMusic.stateFor({screen:'game',game:g})==='chase';escapeDanger+=((chase&&!escapeAidsHidden(g)?1:0)-escapeDanger)*(chase?.12:.03);escapeHush+=((g.player.hidden?1:0)-escapeHush)*.08;}
  if(mood)drawEscapeMood(ctx,mood,W,H,clock);
  if(escapeHush>.01){ctx.save();ctx.fillStyle='rgba(6,12,22,'+(.14*escapeHush)+')';ctx.fillRect(0,0,W,H);ctx.restore();}
  if(escapeDanger>.01){ctx.save();const pulse=.85+.15*Math.sin(clock*4),grad=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.32,W/2,H/2,Math.hypot(W,H)*.55);
    grad.addColorStop(0,'rgba(70,10,0,0)');grad.addColorStop(1,'rgba(90,16,4,'+(.42*escapeDanger*pulse)+')');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.restore();}
}
function drawEscapeMood(ctx,mood,W,H,clock){
  ctx.save();
  const [r,gr,b,a]=mood.grade;ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba('+r+','+gr+','+b+','+Math.min(1,a*2)+')';ctx.fillRect(0,0,W,H);
  if(mood.wash){const w=mood.wash,[wr,wg,wb]=w.color,grad=w.from==='left'?ctx.createLinearGradient(0,0,W*.8,0):w.from==='bottom'?ctx.createLinearGradient(0,H,0,H*.25):ctx.createLinearGradient(0,0,0,H*.75);
    grad.addColorStop(0,'rgba('+wr+','+wg+','+wb+','+Math.min(1,w.alpha*2)+')');grad.addColorStop(1,'rgba('+wr+','+wg+','+wb+',0)');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);}
  ctx.globalCompositeOperation='source-over';
  if(mood.vignette){const grad=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.hypot(W,H)*.55);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(0,0,0,'+(mood.vignette*.55)+')');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);}
  // Light shafts slanting down through a canopy or a cave roof, swaying slowly.
  if(mood.shafts){const [r,gr,b]=mood.shafts;ctx.globalCompositeOperation='lighter';
    for(let k=0;k<4;k++){const x0=W*(.12+.25*k)+Math.sin(clock*.2+k*1.9)*W*.03,top=W*.05,bottom=W*.13,slant=H*.35,grad=ctx.createLinearGradient(0,0,0,H);
      grad.addColorStop(0,'rgba('+r+','+gr+','+b+',.09)');grad.addColorStop(1,'rgba('+r+','+gr+','+b+',0)');ctx.fillStyle=grad;
      ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x0+top,0);ctx.lineTo(x0+top+slant+bottom-top,H);ctx.lineTo(x0+slant,H);ctx.closePath();ctx.fill();}}
  ctx.restore();
}
// Mud round Sally: a ring of it rises as she sinks and wet flecks fly when she runs through it.
// Nothing is drawn when she is clear of it.
// Crates: a wooden crate, a packed snow block in winter, a hay bale in autumn. One that dropped into a
// gap shows as its lid, flush with the ground.
function drawEscapeCrates(g,view,cell){
  if(!g.crates?.length)return;const theme=String(g.level.seasonalTheme||''),skin=theme.startsWith('winter')?'snow':theme.startsWith('autumn')?'hay':'wood';
  const tone={wood:[[134,96,58],[102,70,40],[164,124,80]],snow:[[214,226,238],[170,188,206],[240,246,252]],hay:[[198,160,82],[156,120,56],[226,196,118]]}[skin];
  for(const c of g.crates){const q=g.cratePos(c);if(view.follow&&!g.visibleTile(c.x,c.y))continue;const x=q.x*cell,y=q.y*cell;noStroke();
    if(c.sunk&&!c.from){fill(...tone[1],230);rect(x+cell*.06,y+cell*.06,cell*.88,cell*.88,cell*.08);stroke(...tone[0]);strokeWeight(Math.max(1,cell*.04));for(const k of [.32,.68])line(x+cell*.1,y+cell*k,x+cell*.9,y+cell*k);continue;}
    const drop=c.sunk?Math.min(1,(g.elapsed-c.start)/c.dur):0,sz=1-drop*.12;
    fill(0,0,0,60);rect(x+cell*.1,y+cell*.2,cell*.86,cell*.86,cell*.1);
    push();translate(x+cell*.5,y+cell*.5);scale(sz);fill(...tone[0]);rect(-cell*.44,-cell*.46,cell*.88,cell*.88,cell*(skin==='snow'?.18:.08));
    if(skin==='wood'){fill(...tone[2]);rect(-cell*.44,-cell*.46,cell*.88,cell*.16,cell*.08);stroke(...tone[1]);strokeWeight(Math.max(1,cell*.05));noFill();rect(-cell*.36,-cell*.28,cell*.72,cell*.64);line(-cell*.36,-cell*.28,cell*.36,cell*.36);}
    else if(skin==='snow'){fill(...tone[2]);ellipse(-cell*.12,-cell*.2,cell*.42,cell*.2);stroke(...tone[1]);strokeWeight(Math.max(1,cell*.03));line(-cell*.44,cell*.05,cell*.44,cell*.05);}
    else{stroke(...tone[1]);strokeWeight(Math.max(1,cell*.035));for(const k of [-.25,0,.25])line(-cell*.4,k*cell,cell*.4,k*cell+cell*.04);stroke(120,84,40);strokeWeight(Math.max(1,cell*.06));line(-cell*.18,-cell*.46,-cell*.18,cell*.42);line(cell*.18,-cell*.46,cell*.18,cell*.42);}
    pop();}
}
function drawEscapeMud(g,cell){const p=g.player,sink=p.sink||0,inMud=g.grid[Math.floor(p.y)]?.[Math.floor(p.x)]==='M'&&!p.swimming;if(!(sink>.02)&&!(inMud&&p.sprinting))return;
  noStroke();if(sink>.02){fill(92,66,40,90+120*sink);ellipse(p.x*cell,(p.y+.08)*cell,cell*(.55+.35*sink),cell*(.36+.22*sink));fill(130,96,58,140*sink);ellipse(p.x*cell,(p.y+.02)*cell,cell*(.36+.3*sink),cell*(.16+.12*sink));
    if(sink>.45){const t=g.elapsed*3;fill(150,118,74,120);for(let i=0;i<3;i++){const a=t+i*2.1,r=.28+.05*Math.sin(t*2+i);ellipse((p.x+Math.cos(a)*r)*cell,(p.y+Math.sin(a)*r*.6)*cell,cell*.07,cell*.07);}}}
  if(inMud&&p.sprinting&&escapeLightingFull()){const n=typeof isTvDevice==='function'&&isTvDevice()?3:6;for(let i=0;i<n;i++){const f=(g.elapsed*4+i/n)%1,a=i*2.4+g.elapsed;fill(110,80,48,(1-f)*200);ellipse((p.x+Math.cos(a)*f*.5)*cell,(p.y+Math.sin(a)*f*.5-f*(1-f)*.6)*cell,cell*.08*(1-f*.4),cell*.08*(1-f*.4));}}}
// Moss, echo halls, currents and burrow mounds.
function drawEscapeTricks(g,cell,view){
  const seen=(x,y)=>!view.follow||g.visibleTile(x,y);
  // Soft dirt where Sally can dig in: a loose brown patch with a few clods.
  for(const k of g.soil){const [x,y]=k.split(',').map(Number);if(!seen(x,y))continue;
    stroke(196,160,104,150);strokeWeight(cell*.04);fill(74,50,28,235);ellipse((x+.5)*cell,(y+.5)*cell,cell*.9,cell*.8);noStroke();
    fill(150,112,70,230);for(const [a,b,r] of [[.3,.36,.14],[.64,.34,.11],[.46,.62,.16],[.72,.66,.1],[.3,.7,.08]])ellipse((x+a)*cell,(y+b)*cell,cell*r,cell*r*.75);}
  // Soft sand: a pale, deep drift with wind ripples. It slows Sally and keeps her tracks.
  const sandSheet=escapeLightingFull()&&typeof drawEscapeZone==='function';if(sandSheet&&g.softSand.size)drawEscapeZone(g.softSand,cell,seen,[230,206,156],150,0);
  for(const key of g.softSand){const [x,y]=key.split(',').map(Number);if(!seen(x,y))continue;if(!sandSheet){noStroke();fill(230,206,156,150);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*.18);}noFill();stroke(196,164,110,120);strokeWeight(Math.max(1,cell*.025));const o=((x*7+y*3)%5)*.06;for(const ry of [.3,.62])arc((x+.5)*cell,(y+ry+o)*cell,cell*.8,cell*.22,PI*1.1,PI*1.9);}
  const mossSheet=escapeLightingFull()&&typeof drawEscapeZone==='function';if(mossSheet&&g.moss.size)drawEscapeZone(g.moss,cell,seen,[78,128,70],130,0);
  for(const key of g.moss){const [x,y]=key.split(',').map(Number);if(!seen(x,y))continue;noStroke();if(!mossSheet){fill(78,128,70,150);rect(x*cell+2,y*cell+2,cell-4,cell-4,cell*.2);}fill(118,170,92,170);for(const [dx,dy] of [[.25,.3],[.6,.25],[.4,.6],[.75,.7],[.2,.78]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.16,cell*.12);}
  for(const e of g.echoes){noFill();stroke(185,166,232,40);strokeWeight(Math.max(1,cell*.03));for(let y=e.y1;y<=e.y2;y++)for(let x=e.x1;x<=e.x2;x++){if(!seen(x,y)||!g.floor(x,y))continue;arc((x+.5)*cell,(y+.85)*cell,cell*.55,cell*.4,PI*1.15,PI*1.85);}}
  if(g.player.noisy&&g.echoes.length&&g.inEcho(g.player)){noFill();for(let k=0;k<3;k++){const r=((g.elapsed*1.6+k/3)%1);stroke(200,185,245,150*(1-r));strokeWeight(Math.max(1,cell*.04));ellipse(g.player.x*cell,g.player.y*cell,cell*(1+r*6),cell*(1+r*6));}}
  // A stream shows how hard it is running: its streaks brighten as a pulsing current surges, and a few
  // leaves and flecks of foam ride it at its real speed, so a swimmer can read the water.
  for(const c of g.currents){if(c.surface==='ground')continue;const [dx,dy]=c.dir,len=dx?c.x2-c.x1+1:c.y2-c.y1+1,wide=dx?c.y2-c.y1+1:c.x2-c.x1+1,s=g.flowSpeed?g.flowSpeed(c):c.speed;
    for(let i=0;i<Math.min(9,2+Math.floor(len*wide/5));i++){const along=((i*.618+g.elapsed*s/len*.9)%1+1)%1,across=(i*.37%1)*.8+.1,x=dx?(dx>0?c.x1+along*len:c.x2+1-along*len):c.x1+across*wide,y=dy?(dy>0?c.y1+along*len:c.y2+1-along*len):c.y1+across*wide;
      if(!seen(Math.floor(x),Math.floor(y))||g.grid[Math.floor(y)]?.[Math.floor(x)]!=='U')continue;noStroke();if(i%3===2){fill(240,250,252,160);ellipse(x*cell,y*cell,cell*.26,cell*.15);ellipse((x-c.dir[0]*.18)*cell,(y-c.dir[1]*.18)*cell,cell*.14,cell*.09);}else{push();translate(x*cell,y*cell);rotate(Math.atan2(dy,dx)+Math.sin(g.elapsed*2+i)*.5);fill(...(i%2?[196,150,64]:[126,170,78]),235);ellipse(0,0,cell*.38,cell*.19);stroke(80,70,40,170);strokeWeight(cell*.018);line(-cell*.17,0,cell*.17,0);pop();}}}
  for(const c of g.currents){const surge=g.flowSpeed?g.flowSpeed(c)/c.speed:1;stroke(200,240,250,Math.max(40,Math.min(170,90*surge)));strokeWeight(Math.max(1,cell*.04));const [dx,dy]=c.dir,phase=(g.elapsed*c.speed*.8)%1;
    for(let y=c.y1;y<=c.y2;y++)for(let x=c.x1;x<=c.x2;x++){if(!seen(x,y)||(c.surface==='ground'?!g.floor(x,y):g.grid[y][x]!=='U'))continue;for(let k=0;k<2;k++){const t=(phase+k*.5)%1,cx=x+.5+dx*(t-.5)*.8+(dy?(k?.22:-.22):0),cy=y+.5+dy*(t-.5)*.8+(dx?(k?.22:-.22):0);line(cx*cell,cy*cell,(cx-dx*.22)*cell,(cy-dy*.22)*cell);}}}
  for(const h of g.hunters)if(h.kind==='cloudray'){noStroke();fill(6,14,24,70);ellipse(h.x*cell,h.y*cell,h.shadowR*2*cell,h.shadowR*1.6*cell);fill(6,14,24,40);ellipse(h.x*cell,h.y*cell,h.shadowR*2.4*cell,h.shadowR*1.9*cell);}
  if(g.pendingDig){const m=g.pendingDig,pulse=.5+.5*Math.sin(g.elapsed*4);noStroke();fill(96,72,46);ellipse(m.x*cell,m.y*cell+cell*.06,cell*.6,cell*.42);fill(40,28,18);ellipse(m.x*cell,m.y*cell+cell*.04,cell*.24,cell*.15);noFill();stroke(236,200,120,120+100*pulse);strokeWeight(Math.max(1,cell*.04));ellipse(m.x*cell,m.y*cell,cell*(.85+pulse*.2),cell*(.85+pulse*.2));}
  for(const t of g.tunnels)for(const m of [t.a,t.b]){if(!seen(Math.floor(m.x),Math.floor(m.y)))continue;noStroke();fill(96,72,46);ellipse(m.x*cell,m.y*cell+cell*.06,cell*.72,cell*.5);fill(40,28,18);ellipse(m.x*cell,m.y*cell+cell*.04,cell*.34,cell*.22);fill(150,118,80);for(const [dx,dy] of [[-.28,-.08],[.3,-.02],[.05,-.2]])ellipse((m.x+dx)*cell,(m.y+dy)*cell,cell*.09,cell*.07);}
}
// Sunlight rippling across water, in Full lighting.
function drawEscapeWaterLight(g,cell,view){
  if(!escapeLightingFull())return;const t=g.elapsed;
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){if(g.grid[y][x]!=='U'||view.follow&&!g.visibleTile(x,y))continue;
    noFill();stroke(200,250,250,34);strokeWeight(Math.max(1,cell*.03));
    for(let k=0;k<2;k++){const phase=t*1.3+x*1.7+y*2.3+k*2.1,yy=(y+.3+k*.4+Math.sin(phase)*.06)*cell;beginShape();for(let i=0;i<=4;i++)vertex((x+.1+i*.2)*cell,yy+Math.sin(phase*1.7+i*1.4)*cell*.05);endShape();}}
}
// A lightning flash throws long shadows from every wall, away from the strike.
function drawEscapeLightningShadows(g,cell){
  if(!g.storm||g.elapsed>=g.flashUntil||!escapeLightingFull())return;const k=Math.min(1,(g.flashUntil-g.elapsed)/.4),dx=1.4,dy=2.6;noStroke();fill(4,6,14,150*k);
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++){if(g.sightFloor(x,y)||!(g.sightFloor(x,y+1)||g.sightFloor(x+1,y)))continue;
    quad(x*cell,(y+1)*cell,(x+1)*cell,(y+1)*cell,(x+1+dx)*cell,(y+1+dy)*cell,(x+dx)*cell,(y+1+dy)*cell);quad((x+1)*cell,y*cell,(x+1)*cell,(y+1)*cell,(x+1+dx)*cell,(y+1+dy)*cell,(x+1+dx)*cell,(y+dy)*cell);}
}
// Where the map can go on screen. Phones keep their fixed bands. On a desktop or a TV the panels
// over the map (the run's details and tools at the top left, the menu at the top right) are
// measured, and the map goes either below them or beside them, whichever lets it be drawn bigger.
let escapeHudBox={at:-1e9,w:0,h:0,left:null,right:null};
function escapeHudArea(){
  if(millis()-escapeHudBox.at<500&&escapeHudBox.w===width&&escapeHudBox.h===height)return escapeHudBox;
  const box={at:millis(),w:width,h:height,left:null,right:null},host=document.getElementById('game-container')?.getBoundingClientRect?.();
  if(host&&host.width){const sx=width/host.width,sy=height/host.height,grow=(b,r)=>{const x0=(r.left-host.left)*sx,y0=(r.top-host.top)*sy,x1=(r.right-host.left)*sx,y1=(r.bottom-host.top)*sy;return b?{x0:Math.min(b.x0,x0),y0:Math.min(b.y0,y0),x1:Math.max(b.x1,x1),y1:Math.max(b.y1,y1)}:{x0,y0,x1,y1};};
    for(const el of document.querySelectorAll('#scoreboard *')){const r=el.getBoundingClientRect?.();if(!r||!r.width||!r.height||el.children.length)continue;
      if((r.top-host.top)*sy<height*.4&&(r.left-host.left)*sx<width*.6)box.left=grow(box.left,r);}
    const bar=document.querySelector('#escape-stage-ui #game-toolbar')?.getBoundingClientRect?.();if(bar&&bar.width)box.right=grow(null,bar);}
  return escapeHudBox=box;
}
// Zoom steps: 1 fits the whole map; the rest draw it bigger and follow Sally. Saved per player.
const ESCAPE_ZOOMS=[1,1.3,1.7,2.2];
function escapeZoomStep(){const z=escapeProgress.data.zoom;return Number.isInteger(z)&&z>=0&&z<ESCAPE_ZOOMS.length?z:0;}
// A controller's View button steps through the zooms and wraps back to the whole map.
function escapeZoomCycle(){if(!escapeZoom(1)){escapeProgress.setZoom?.(0);escapeGame?.notice?.('Zoom: Fit the whole map');}}
function escapeZoom(dir){
  const next=Math.max(0,Math.min(ESCAPE_ZOOMS.length-1,escapeZoomStep()+dir));if(next===escapeZoomStep())return false;escapeProgress.setZoom?.(next);
  escapeGame?.notice?.('Zoom: '+['Fit the whole map','Close','Closer','Closest'][next]);return true;
}
function escapeLayout(g){
  if(mobile){const close=escapeCloseView(),top=close?8:45,bottom=close?8:65;return {x:0,y:top,w:width,h:height-top-bottom,close};}
  const hud=escapeHudArea(),pad=12,bottom=18,barBottom=hud.right?hud.right.y1+8:56;
  if(!hud.left)return {x:pad,y:barBottom,w:width-pad*2,h:height-barBottom-bottom};
  const below={x:pad,y:Math.max(hud.left.y1,barBottom-48)+8,w:width-pad*2},beside={x:hud.left.x1+14,y:barBottom,w:0};below.h=height-below.y-bottom;beside.w=width-beside.x-pad;beside.h=height-beside.y-bottom;
  // In the follow view the map scrolls under the panels anyway, so it takes the whole screen.
  const overview=escapeProgress.data.view==='overview',zoom=ESCAPE_ZOOMS[escapeZoomStep()],fit=r=>escapeCameraFor(g,r.w,r.h,overview,false,zoom);
  const a=fit(below);if(a.follow)return {x:pad,y:barBottom,w:width-pad*2,h:height-barBottom-bottom};
  const b=beside.w>200?fit(beside):null;return b&&!b.follow&&b.cell>a.cell*1.02?beside:below;
}
function drawEscapeVault(){
  const g=escapeGame,area=escapeLayout(g),close=Boolean(area.close),view=escapeCameraFor(g,area.w,area.h,escapeProgress.data.view==='overview',close,mobile?1:ESCAPE_ZOOMS[escapeZoomStep()]);escapeCameraMotion(view,g,area.w,area.h);view.ox+=area.x;view.oy+=area.y;const {cell,ox,oy}=view;
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
  const homePalettes=[[[34,30,40],[92,78,92],[176,146,120]],[[30,28,38],[84,74,96],[168,140,128]],[[38,32,36],[100,80,84],[186,150,116]],[[28,30,40],[76,80,104],[160,150,150]],[[36,30,34],[96,76,82],[190,156,118]]];
  const tidePalettes=[[[40,40,34],[110,98,72],[176,160,120]],[[30,40,42],[80,110,112],[150,180,176]],[[42,38,30],[120,100,66],[190,166,116]],[[34,40,44],[94,108,120],[160,176,186]],[[44,36,30],[124,92,70],[196,150,116]]];
  const stormPalettes=[[[22,26,32],[66,74,88],[130,142,160]],[[20,24,30],[58,68,84],[120,136,156]],[[18,20,28],[52,58,76],[110,120,146]],[[24,26,30],[72,76,86],[140,146,160]],[[16,20,28],[48,56,74],[104,118,146]]];
  const grottoPalettes=[[[20,18,30],[56,44,78],[104,90,140]],[[16,22,28],[44,62,72],[90,130,140]],[[24,18,28],[72,46,76],[130,90,130]],[[18,20,30],[50,52,86],[96,104,150]],[[22,20,24],[66,52,62],[124,100,112]]];
  const ventPalettes=[[[30,24,22],[96,66,52],[160,112,84]],[[26,24,26],[84,70,66],[148,124,112]],[[32,26,20],[104,74,44],[172,128,80]],[[28,22,24],[92,58,56],[158,100,92]],[[30,26,22],[100,80,60],[166,136,100]]];
  const palette=(g.level.seasonal||g.level.costume)?seasonPalette(g.level):g.level.kids?[[28,50,40],[84,128,80],[150,192,118]]:g.level.custom?[[24,40,34],[58,84,70],[110,140,110]]:g.level.hidden?[[38,30,14],[96,76,32],[176,144,64]]:index>=93?homePalettes[(index-93)%homePalettes.length]:index>=88?tidePalettes[(index-88)%tidePalettes.length]:index>=83?stormPalettes[(index-83)%stormPalettes.length]:index>=78?grottoPalettes[(index-78)%grottoPalettes.length]:index>=73?ventPalettes[(index-73)%ventPalettes.length]:index>=68?frostPalettes[(index-68)%frostPalettes.length]:index>=63?antPalettes[(index-63)%antPalettes.length]:index>=58?rooftopPalettes[(index-58)%rooftopPalettes.length]:index>=53?lanternPalettes[(index-53)%lanternPalettes.length]:index>=49?hollowPalettes[(index-49)%hollowPalettes.length]:index>=47?biomePalettes[index-47]:index>=42?livingPalettes[index-42]:index>=37?glowPalettes[index-37]:index>=32?junglePalettes[index-32]:index>=27?wakingPalettes[index-27]:palettes[index]||(index>=17?deepPalettes[(index-17)%deepPalettes.length]:palettes[0]);
  background(10,18,25);push();translate(ox,oy);textFont('sans-serif');textAlign(CENTER,CENTER);
  drawEscapeTiles(g,cell,palette,index);
  drawEscapeWaterSurface(g,cell,view,index);drawEscapeLightningShadows(g,cell);
  drawEscapeWet(g,cell,view);drawEscapeSway(g,cell,view);drawEscapeDapple(g,cell);
  tickEscapeCritters(g);drawEscapeTricks(g,cell,view);drawEscapePrints(g,cell);drawEscapeCritters(g,cell,view,'ground');drawEscapeReeds(g,cell,view);
  if(g.slippery?.size&&(g.level.seasonal||g.level.costume)!=='winter'&&typeof drawCampaignIce==='function')drawCampaignIce(g,cell);
  drawEscapeMud(g,cell);
  if((g.level.seasonal||g.level.costume))drawSeasonScenery(g,cell);
  if((g.level.kids||g.level.seasonal)&&typeof drawEscapeKidsGuide==='function')drawEscapeKidsGuide(g,cell);
  if(g.level.rootWheel){const [x,y]=g.level.rootWheel,angle=g.wheelAngle;push();translate((x+.5)*cell,(y+.5)*cell);rotate(angle);noFill();stroke(106,147,76,95);strokeWeight(cell*.11);ellipse(0,0,cell*2.7,cell*2.7);for(let a=0;a<TWO_PI;a+=PI/2)line(0,0,Math.cos(a)*cell*1.35,Math.sin(a)*cell*1.35);pop();}
  for(const gate of g.gates){
    const s=gate.switch,label=gate.closingAt!==null?'!':gate.duration&&gate.open?String(Math.max(0,Math.ceil(gate.expiresAt-g.elapsed))):gate.sealed?'×':gate.open?'✓':s?gate.id==='blue'?'B':'A':'◇',gateColor=gate.sealed?[230,137,148]:gate.color;
    if(s){stroke(...gateColor);strokeWeight(cell*.05);fill(...gateColor,gate.open?70:160);rect((s.x-.3)*cell,(s.y-.3)*cell,cell*.6,cell*.6,cell*.1);fill(15,35,40);noStroke();textSize(cell*.36);text(label,s.x*cell,s.y*cell);}
    for(const plate of gate.plates){noStroke();fill(...gateColor,gate.pressed?230:100);ellipse(plate.x*cell,plate.y*cell,cell*.65,cell*.45);noFill();stroke(...gateColor);strokeWeight(cell*.035);ellipse(plate.x*cell,plate.y*cell,cell*.5,cell*.32);
      // A heavy plate is a stone slab with a beetle mark: only a big hunter's weight presses it.
      if(gate.heavy){noStroke();fill(70,62,50,220);rect((plate.x-.38)*cell,(plate.y-.28)*cell,cell*.76,cell*.56,cell*.08);fill(...gateColor,gate.pressed?255:150);ellipse(plate.x*cell,plate.y*cell,cell*.22,cell*.3);stroke(...gateColor);strokeWeight(cell*.03);line((plate.x-.15)*cell,(plate.y-.12)*cell,(plate.x+.15)*cell,(plate.y+.12)*cell);line((plate.x+.15)*cell,(plate.y-.12)*cell,(plate.x-.15)*cell,(plate.y+.12)*cell);}}
    for(const lever of gate.levers||[]){stroke(...gateColor);strokeWeight(cell*.05);fill(...gateColor,gate.open?70:160);rect((lever.x-.3)*cell,(lever.y-.3)*cell,cell*.6,cell*.6,cell*.1);stroke(30,40,40);strokeWeight(cell*.07);const tilt=gate.open?.35:-.35;line(lever.x*cell,(lever.y+.15)*cell,(lever.x+tilt)*cell,(lever.y-.25)*cell);noStroke();fill(240,230,200);ellipse((lever.x+tilt)*cell,(lever.y-.25)*cell,cell*.14,cell*.14);}
    for(const plate of gate.heavyPlates||[]){noStroke();fill(70,62,50,220);rect((plate.x-.38)*cell,(plate.y-.28)*cell,cell*.76,cell*.56,cell*.08);fill(...gateColor,gate.pressed?255:150);ellipse(plate.x*cell,plate.y*cell,cell*.22,cell*.3);stroke(...gateColor);strokeWeight(cell*.03);line((plate.x-.15)*cell,(plate.y-.12)*cell,(plate.x+.15)*cell,(plate.y+.12)*cell);line((plate.x+.15)*cell,(plate.y-.12)*cell,(plate.x-.15)*cell,(plate.y+.12)*cell);}
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
  if(typeof drawEscapeNote==='function')drawEscapeNote(g,cell);
  for(const loot of g.loot)if(!loot.taken){
    noStroke();fill(245,189,87);push();translate(loot.x*cell,loot.y*cell);
    if(loot.value>1){rect(-cell*.3,-cell*.22,cell*.6,cell*.44,cell*.08);fill(100,71,40);rect(-cell*.06,-cell*.22,cell*.12,cell*.44);}
    else{rotate(PI/4);rect(-cell*.13,-cell*.13,cell*.26,cell*.26,2);}pop();
  }
  // Traps: cracked floor, thorn beds and rolling logs, each with a visible warning.
  for(const [key,c] of g.crumbling||[]){if(c.fallen)continue;const [x,y]=key.split(',').map(Number);stroke(30,20,15,200);strokeWeight(cell*.04);line((x+.2)*cell,(y+.3)*cell,(x+.55)*cell,(y+.6)*cell);line((x+.55)*cell,(y+.6)*cell,(x+.8)*cell,(y+.45)*cell);}
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.grid[y][x]==='c'&&(!view.follow||g.visibleTile(x,y))&&!g.crumbling?.has(x+','+y)){stroke(60,45,35,140);strokeWeight(cell*.03);line((x+.3)*cell,(y+.25)*cell,(x+.45)*cell,(y+.5)*cell);line((x+.45)*cell,(y+.5)*cell,(x+.7)*cell,(y+.6)*cell);}
  for(const v of g.vines||[])if(!view.follow||g.visibleTile(v.x,v.y))drawEscapeVine(v,cell,g.elapsed,v.readyAt>g.elapsed&&!v.holding,v.holding?g.player:null);
  // Tide flats at low tide: wet sand with ripple marks, and a lapping edge as the tide turns.
  if(g.tide){const {high,next}=g.tidePhase(),sheet=escapeLightingFull()&&typeof drawEscapeZone==='function',seenTile=(x,y)=>!view.follow||g.visibleTile(x,y);
    // Full lighting lays the flats as one stretch of wet sand rather than a box per tile.
    if(sheet){g.tideKeys??=new Set(g.tideFlats.map(f=>f.x+','+f.y));if(!high)drawEscapeZone(g.tideKeys,cell,seenTile,[150,136,104],120,70);if(next<1.5)drawEscapeZone(g.tideKeys,cell,seenTile,[170,220,235],Math.round(90*(1-next/1.5)*(1+Math.sin(g.elapsed*10))/2),0);}
    for(const f of g.tideFlats){if(view.follow&&!g.visibleTile(f.x,f.y))continue;const x=f.x*cell,y=f.y*cell;
    if(!high){noStroke();if(!sheet){fill(150,136,104,140);rect(x+1,y+1,cell-2,cell-2,cell*.12);}stroke(196,180,140,110);strokeWeight(cell*.03);noFill();arc(x+cell*.5,y+cell*.45,cell*.6,cell*.2,PI*1.1,PI*1.9);arc(x+cell*.5,y+cell*.75,cell*.5,cell*.18,PI*1.1,PI*1.9);}
    if(next<1.5&&!sheet){noStroke();fill(170,220,235,90*(1-next/1.5)*(1+Math.sin(g.elapsed*10))/2);rect(x+1,y+1,cell-2,cell-2,cell*.12);}}}
  // Wind lanes: faint streaks always show the lane and its direction; they thicken and race just
  // before and during a gust.
  for(const w of g.wind||[]){const ph=g.gustPhase(w),hot=ph.active||ph.warning;for(const key of w.keys){const [x,y]=key.split(',').map(Number);if(view.follow&&!g.visibleTile(x,y))continue;
    const k=Math.sqrt((w.strength||2.3)/2.3),ang=Math.atan2(w.dir[1],w.dir[0]),speed=(ph.active?3:hot?1.8:.6)*k,t=(g.elapsed*speed+(x*.37+y*.61))%1;stroke(220,236,255,Math.min(220,(ph.active?150:hot?100:40)*k));strokeWeight(cell*(ph.active?.05:.03)*k);
    push();translate((x+.5)*cell,(y+.5)*cell);rotate(ang);line((t-.5)*cell-cell*.25,-cell*.18,(t-.5)*cell+cell*.1,-cell*.18);line(((t+.5)%1-.5)*cell-cell*.2,cell*.16,((t+.5)%1-.5)*cell+cell*.12,cell*.16);pop();}}
  // Spore puffballs (a spent one is a flat stub until it regrows) and bounce caps, each cap with
  // a dotted arc to where it lands Sally.
  drawEscapeCrates(g,view,cell);
  for(const puff of g.puffs||[]){if(view.follow&&!g.visibleTile(puff.x,puff.y))continue;const x=(puff.x+.5)*cell,y=(puff.y+.5)*cell,ready=g.elapsed>=puff.readyAt;noStroke();
    if(ready){const breathe=1+Math.sin(g.elapsed*2+puff.x)*.04;fill(0,0,0,50);ellipse(x,y+cell*.22,cell*.62,cell*.2);fill(236,226,196);ellipse(x,y,cell*.62*breathe,cell*.54*breathe);fill(206,190,150);for(const [dx,dy] of [[-.12,-.08],[.1,-.12],[.05,.08],[-.06,.1]])ellipse(x+dx*cell,y+dy*cell,cell*.07,cell*.07);fill(255,255,255,120);ellipse(x-cell*.1,y-cell*.12,cell*.16,cell*.1);}
    else{fill(150,136,104);ellipse(x,y+cell*.1,cell*.32,cell*.14);}}
  for(const cap of g.caps||[]){const [ax,ay]=cap.at,[tx,ty]=cap.to;if(view.follow&&!g.visibleTile(ax,ay))continue;const x=(ax+.5)*cell,y=(ay+.5)*cell,ex=(tx+.5)*cell,ey=(ty+.5)*cell,mx=(x+ex)/2,my=(y+ey)/2-cell*1.2;
    noFill();stroke(255,190,120,70);strokeWeight(Math.max(1,cell*.035));drawingContext.setLineDash?.([cell*.08,cell*.12]);bezier(x,y,mx,my,mx,my,ex,ey);drawingContext.setLineDash?.([]);noStroke();fill(255,190,120,60);ellipse(ex,ey,cell*.5,cell*.5);
    // A springy cap: a coiled stem, and a fainter arc to where a sprint carries Sally.
    if(cap.spring&&g.capFlight){const far=g.capFlight(cap,true).to,fx=far.x*cell,fy=far.y*cell;if(Math.abs(fx-ex)+Math.abs(fy-ey)>1){noFill();stroke(120,220,200,60);strokeWeight(Math.max(1,cell*.03));drawingContext.setLineDash?.([cell*.05,cell*.14]);const nx=(x+fx)/2,ny=(y+fy)/2-cell*1.7;bezier(x,y,nx,ny,nx,ny,fx,fy);drawingContext.setLineDash?.([]);noStroke();fill(120,220,200,50);ellipse(fx,fy,cell*.42,cell*.42);}}
    const since=g.elapsed-(cap.readyAt-1),squash=since<.12?.6:since<.3?1.15:1;fill(0,0,0,50);ellipse(x,y+cell*.25,cell*.8,cell*.22);fill(240,230,210);rect(x-cell*.1,y,cell*.2,cell*.25,cell*.05);
    if(cap.spring){noFill();stroke(120,220,200);strokeWeight(Math.max(1,cell*.035));for(let i=0;i<cap.spring+1;i++)ellipse(x,y+cell*(.06+i*.06),cell*.3,cell*.08);noStroke();}fill(214,70,58);arc(x,y+cell*.05,cell*.86,cell*.7*squash,PI,TWO_PI);fill(255,240,230);for(const [dx,dy] of [[-.2,-.12],[.05,-.22],[.22,-.08]])ellipse(x+dx*cell,y+dy*cell*squash,cell*.12,cell*.1);}
  for(const th of g.thorns||[])for(const key of th.keys){const [x,y]=key.split(',').map(Number);if(view.follow&&!g.visibleTile(x,y))continue;if((g.level.seasonal||g.level.costume)==='winter'){drawWinterIcicles(th,key,cell,g);continue;}noStroke();fill(th.raised?150:90,th.raised?60:70,th.raised?60:60,th.raised?220:140);rect(x*cell+cell*.08,y*cell+cell*.08,cell*.84,cell*.84,cell*.1);const shake=th.warning?Math.sin(g.elapsed*40)*cell*.03:0,h=th.raised?.38:th.warning?.12:.06;fill(225,210,180);for(const [ox,oy]of [[.3,.3],[.7,.3],[.5,.55],[.3,.78],[.7,.78]])triangle((x+ox-.08)*cell+shake,(y+oy+.06)*cell,(x+ox+.08)*cell+shake,(y+oy+.06)*cell,(x+ox)*cell+shake,(y+oy+.06-h)*cell);}
  for(const log of g.logs||[]){if((g.level.seasonal||g.level.costume)==='winter'){drawWinterSnowball(log,cell,g);continue;}stroke(255,150,80,log.warning?120+100*Math.sin(g.elapsed*20):40);strokeWeight(cell*.05);drawingContext.setLineDash([cell*.15,cell*.15]);line(log.from.x*cell,log.from.y*cell,log.to.x*cell,log.to.y*cell);drawingContext.setLineDash([]);
    if(log.pos){push();translate(log.pos.x*cell,log.pos.y*cell);const across=Math.abs(log.to.x-log.from.x)>Math.abs(log.to.y-log.from.y);if(across)rotate(HALF_PI);noStroke();fill(0,0,0,70);rect(-cell*.42,-cell*.3,cell*.9,cell*.66,cell*.25);fill(122,84,50);rect(-cell*.45,-cell*.34,cell*.9,cell*.62,cell*.25);fill(170,125,80);ellipse(-cell*.45,0,cell*.2,cell*.6);ellipse(cell*.45,0,cell*.2,cell*.6);stroke(90,60,35);strokeWeight(cell*.03);const roll=(g.elapsed*12)%1;for(const k of [0,.33,.66])line(-cell*.4,(-.3+((k+roll)%1)*.6)*cell,cell*.4,(-.3+((k+roll)%1)*.6)*cell);pop();}}
  for(const v of g.vents){const [vx,vy]=v.at;if(view.follow&&!g.visibleTile(vx,vy)&&!v.tiles.some(([x,y])=>g.visibleTile(x,y)))continue;noStroke();fill(120,96,80);rect((vx+.18)*cell,(vy+.18)*cell,cell*.64,cell*.64,cell*.1);stroke(60,44,36);strokeWeight(cell*.05);for(const o of [.35,.5,.65])line((vx+o)*cell,(vy+.25)*cell,(vx+o)*cell,(vy+.75)*cell);noStroke();
    for(const [i,[x,y]] of v.tiles.entries()){if(view.follow&&!g.visibleTile(x,y))continue;if(v.active){for(let k=0;k<3;k++){const wob=Math.sin(g.elapsed*9+i*1.7+k*2.1)*.15;fill(245,245,245,150-k*30);ellipse((x+.5+wob)*cell,(y+.5-wob)*cell,cell*(.9-k*.15),cell*(.9-k*.15));}}else if(v.warning){fill(235,235,235,60+40*Math.sin(g.elapsed*20));if(i<2)ellipse((x+.5)*cell,(y+.5)*cell,cell*.35,cell*.35);}else{stroke(200,120,80,60);strokeWeight(cell*.03);noFill();rect(x*cell+cell*.2,y*cell+cell*.2,cell*.6,cell*.6,cell*.1);noStroke();}}}
  const coldSheet=escapeLightingFull()&&typeof drawEscapeZone==='function';if(coldSheet&&g.cold.size)drawEscapeZone(new Set([...g.cold].filter(k=>{const [x,y]=k.split(',').map(Number);return g.floor(x,y);})),cell,(x,y)=>!view.follow||g.visibleTile(x,y),[170,215,255],45,90);
  for(const key of g.cold){const [x,y]=key.split(',').map(Number);if(!g.floor(x,y)||view.follow&&!g.visibleTile(x,y))continue;noStroke();if(!coldSheet){fill(170,215,255,55);rect(x*cell+1,y*cell+1,cell-2,cell-2,cell*.12);}fill(235,248,255,120);for(const [dx,dy] of [[.25,.3],[.7,.55],[.4,.78]])ellipse((x+dx)*cell,(y+dy)*cell,cell*.06,cell*.06);}
  for(const key of g.warm){const [x,y]=key.split(',').map(Number);if(view.follow&&!g.visibleTile(x,y))continue;const glow=.5+.5*Math.sin(g.elapsed*3+x);noStroke();fill(255,150,60,50+50*glow);ellipse((x+.5)*cell,(y+.5)*cell,cell*.95,cell*.95);fill(196,92,44);ellipse((x+.5)*cell,(y+.55)*cell,cell*.6,cell*.42);fill(255,190,110);ellipse((x+.45)*cell,(y+.48)*cell,cell*.3,cell*.16);}
  for(const key of g.shade){const [x,y]=key.split(',').map(Number);if(view.follow&&!g.visibleTile(x,y))continue;noStroke();for(let i=0;i<4;i++){fill(...(i%2?[238,226,196,150]:[204,96,72,150]));rect((x+i/4)*cell,y*cell,cell/4+.5,cell*.82);}fill(120,52,40,170);for(let i=0;i<4;i++)arc((x+(i+.5)/4)*cell,(y+.82)*cell,cell/4,cell*.22,0,PI);}
  for(const h of g.hunters)if(h.kind==='gecko'&&h.home&&(!view.follow||g.visibleTile(Math.floor(h.home.x),Math.floor(h.home.y)))){noStroke();fill(30,20,14);ellipse(h.home.x*cell,h.home.y*cell,cell*.7,cell*.45);fill(70,50,30);ellipse(h.home.x*cell,(h.home.y-.08)*cell,cell*.5,cell*.18);}
  // Ant trails are worn into the floor, so the route can be read before the column arrives.
  for(const t of g.antTrails){stroke(150,110,70,70);strokeWeight(cell*.06);for(const p of t.tiles)if(!view.follow||g.visibleTile(Math.floor(p.x),Math.floor(p.y)))point(p.x*cell,p.y*cell);noStroke();for(const a of g.ants(t)){if(view.follow&&!g.visibleTile(Math.floor(a.x),Math.floor(a.y)))continue;push();translate(a.x*cell,a.y*cell);rotate(a.dir);scale(1.45);fill(70,24,18);for(const o of [-.1,0,.1])ellipse(o*cell,0,cell*.11,cell*.09);stroke(70,24,18);strokeWeight(cell*.015);const k=Math.sin(g.elapsed*20+a.x*5)*cell*.03;for(const s of [-1,1])for(const o of [-.06,0,.06])line(o*cell,0,o*cell+k,s*cell*.1);noStroke();pop();}}
  // Regrowth bugs glow brightly only while Sally is missing her tail.
  for(const bug of g.regrowthBugs)if(!bug.eaten)drawEscapeRegrowthBug(bug,cell,g.elapsed,!g.hasTail);
  for(const bug of g.glowbugs)if(!bug.caught&&(!g.level.explore||g.visibleTile(Math.floor(bug.x),Math.floor(bug.y))))drawEscapeGlowbug(bug,cell,g.elapsed);
  if(g.droppedTail)drawEscapeDroppedTail(g.droppedTail,cell,g.elapsed);
  drawEscapeThrows(g,cell);
  if(g.decoy){
    // A pebble riding a stream bobs in a little ring of ripples as it goes.
    if(g.decoy.floating){noFill();stroke(225,245,250,140);strokeWeight(cell*.025);const r=.32+.06*Math.sin(g.elapsed*5);ellipse(g.decoy.x*cell,g.decoy.y*cell,cell*r*2,cell*r*1.5);}
    noFill();if((g.level.seasonal||g.level.costume)==='winter')stroke(185,226,245,150);else stroke(172,152,255,130);strokeWeight(1);const pulse=(g.elapsed%0.65)/.65;
    ellipse(g.decoy.x*cell,g.decoy.y*cell,cell*(.5+pulse*2),cell*(.5+pulse*2));noStroke();if((g.level.seasonal||g.level.costume)==='winter')fill(235,248,251);else fill(193,181,255);ellipse(g.decoy.x*cell,g.decoy.y*cell,cell*.22,cell*.22);
  }
  // A short, subtle gaze shows where the guard is looking; walls stop detection.
  for(const w of g.webs){if(view.follow&&!g.visibleTile(Math.floor(w.x),Math.floor(w.y)))continue;if(w.trip){noFill();stroke(220,210,245,120+60*Math.max(0,1-(g.elapsed-(w.pluckedAt||-9))));strokeWeight(cell*.022);for(const [a,b] of [[[-.45,-.45],[.45,.45]],[[-.45,.45],[.45,-.45]],[[-.5,0],[.5,0]],[[0,-.5],[0,.5]]])line((w.x+a[0])*cell,(w.y+a[1])*cell,(w.x+b[0])*cell,(w.y+b[1])*cell);ellipse(w.x*cell,w.y*cell,cell*.5,cell*.5);continue;}noFill();stroke(197,183,236,180);strokeWeight(cell*.025);for(const r of [.3,.65])ellipse(w.x*cell,w.y*cell,cell*r*2,cell*r*2);for(let a=0;a<TWO_PI;a+=PI/4)line(w.x*cell,w.y*cell,(w.x+Math.cos(a)*.65)*cell,(w.y+Math.sin(a)*.65)*cell);}
  for(const den of g.pendingSpawns){if(view.follow&&!g.visibleTile(Math.floor(den.x),Math.floor(den.y)))continue;noFill();stroke(231,161,121);strokeWeight(cell*.05);ellipse(den.x*cell,den.y*cell,cell*(.7+Math.sin(g.elapsed*8)*.12),cell*.5);fill(237,177,142);noStroke();textSize(cell*.5);text('!',den.x*cell,(den.y-.5)*cell);}
  for(const h of g.hunters){const ang=h.facing,cone=h.kind==='beetle'?PI/5:PI/3;
  if(view.follow&&!g.visibleTile(Math.floor(h.x),Math.floor(h.y)))continue;
  const aids=!escapeAidsHidden(g);
  if(aids&&!g.level.dark&&!['millipede','cricket','moth','mimic','angler','flytrap','heron','mantis','wasp','dragonfly','mole','bat','eel','crab','fox','echofrog','chameleon','sentinel','cloudray'].includes(h.kind)&&['patrol','alert'].includes(h.state)){
    // Many fine rays, so the gaze hugs walls and corners instead of cutting across them, reaching as
    // far as the guard really sees (further when Sally stands in light), and fading with distance.
    const p=g.player,range=(g.hunters.length>1&&g.lit()||g.lights.length>0&&g.inLight(p))?6.5:4.5,step=.15;
    noStroke();fill(245,171,105,18);const glow=drawingContext.createRadialGradient?.(h.x*cell,h.y*cell,0,h.x*cell,h.y*cell,range*cell);if(glow){glow.addColorStop(0,'rgba(245,171,105,.16)');glow.addColorStop(1,'rgba(245,171,105,0)');drawingContext.fillStyle=glow;}
    beginShape();vertex(h.x*cell,h.y*cell);
    for(let a=-cone;a<=cone+.001;a+=cone/24){let reach=0,from=h;for(let d=step;d<=range;d+=step){const to={x:h.x+Math.cos(ang+a)*d,y:h.y+Math.sin(ang+a)*d};if(!g.clear(from,to,true))break;reach=d;from=to;}vertex((h.x+Math.cos(ang+a)*reach)*cell,(h.y+Math.sin(ang+a)*reach)*cell);}endShape(CLOSE);
  }
  if(aids&&h.kind==='toad'&&h.state==='windup'){let d=0;const dx=Math.cos(h.facing),dy=Math.sin(h.facing);while(d<5.5&&g.sightFloor(Math.floor(h.x+dx*(d+.1)),Math.floor(h.y+dy*(d+.1))))d+=.1;stroke(240,120,140,90+70*Math.sin(g.elapsed*22));strokeWeight(cell*.06);drawingContext.setLineDash([cell*.12,cell*.12]);line(h.x*cell,h.y*cell,(h.x+dx*d)*cell,(h.y+dy*d)*cell);drawingContext.setLineDash([]);}
  // The winter snowman throws a snowball down the same line its tongue would take: a shadow on the
  // ground where it can hit, the ball arcing a little above it, and a trail of powder behind.
  if(h.kind==='toad'&&h.state==='tongue'&&h.tongueLength>0&&(g.level.seasonal||g.level.costume)==='winter'){const dx=Math.cos(h.facing),dy=Math.sin(h.facing),L=h.tongueLength,tx=h.x+dx*L,ty=h.y+dy*L,lift=Math.sin(Math.min(1,L/5)*Math.PI)*.35;noStroke();for(let i=1;i<=5;i++){const d=L*(1-i*.12);if(d<=0)break;fill(240,250,255,150-i*25);ellipse((h.x+dx*d)*cell,(h.y+dy*d-lift*(1-i*.12))*cell,cell*(.16-i*.015),cell*(.16-i*.015));}fill(30,60,80,60);ellipse(tx*cell,(ty+.1)*cell,cell*.32,cell*.14);fill(248,252,255);stroke(176,214,232);strokeWeight(cell*.03);ellipse(tx*cell,(ty-lift)*cell,cell*.4,cell*.4);noStroke();fill(214,236,246);ellipse((tx+.06)*cell,(ty-lift+.06)*cell,cell*.16,cell*.13);}
  else if(h.kind==='toad'&&h.state==='tongue'&&h.tongueLength>0){stroke(...((g.level.seasonal||g.level.costume)==='winter'?[188,234,248]:(g.level.seasonal||g.level.costume)?[112,157,65]:[232,110,140]));strokeWeight(cell*.12);line(h.x*cell,h.y*cell,(h.x+Math.cos(h.facing)*h.tongueLength)*cell,(h.y+Math.sin(h.facing)*h.tongueLength)*cell);noStroke();fill(250,150,170);ellipse((h.x+Math.cos(h.facing)*h.tongueLength)*cell,(h.y+Math.sin(h.facing)*h.tongueLength)*cell,cell*.22,cell*.22);}
  if(aids&&h.kind==='cricket'&&h.state==='chirp'){noFill();for(let k=0;k<3;k++){const r=((g.elapsed*3+k/3)%1);stroke(255,230,140,200*(1-r));strokeWeight(cell*.04);ellipse(h.x*cell,h.y*cell,cell*(.5+r*2.5),cell*(.5+r*2.5));}}
  // A scorpion's strike ring is always shown: bright while the tail is up, faint while it rests.
  if(aids&&h.kind==='scorpion'&&h.state!=='buried'){const up=h.tailUp||['raise','windup','sting'].includes(h.state),r=(h.reach||1.8)*2*cell;noStroke();fill(255,140,70,up?34:12);ellipse(h.x*cell,h.y*cell,r,r);noFill();stroke(255,up?150:200,up?70:150,up?200:70);strokeWeight(cell*(up?.06:.035));drawingContext.setLineDash(up?[]:[cell*.18,cell*.14]);ellipse(h.x*cell,h.y*cell,r,r);drawingContext.setLineDash([]);}
  // A charging beetle's lane runs until the first wall, so Sally can see where not to stand.
  if(aids&&h.kind==='beetle'&&['windup','charge'].includes(h.state)){let d=0;const dx=Math.cos(h.facing),dy=Math.sin(h.facing),from=h.state==='charge'&&h.chargeFrom?h.chargeFrom:h,limit=h.aim?Math.hypot(h.aim.x-from.x,h.aim.y-from.y)+3-Math.hypot(h.x-from.x,h.y-from.y):18;while(d<limit&&g.fits({x:h.x+dx*(d+.25),y:h.y+dy*(d+.25)},.22))d+=.25;const pulse=h.state==='windup'?.5+.5*Math.sin(g.elapsed*18):1;push();translate(h.x*cell,h.y*cell);rotate(h.facing);noStroke();fill(255,110,60,50+50*pulse);rect(0,-cell*.42,d*cell,cell*.84);fill(255,200,120,40+40*pulse);for(let s=.3;s<d;s+=.6)quad(s*cell,-cell*.42,(s+.25)*cell,-cell*.42,(s+.05)*cell,cell*.42,(s-.2)*cell,cell*.42);stroke(255,150,80,160+80*pulse);strokeWeight(cell*.05);line(0,-cell*.42,d*cell,-cell*.42);line(0,cell*.42,d*cell,cell*.42);pop();}
  if(h.kind==='beetle'&&h.state==='stunned'){noStroke();fill(255,236,150);textSize(cell*.32);for(let i=0;i<3;i++){const a=g.elapsed*5+i*TWO_PI/3;text('✦',(h.x+Math.cos(a)*.38)*cell,(h.y-.55+Math.sin(a)*.12)*cell);}}
  if(aids&&['windup','sting','glimmer','swoop','reveal','lunge','glare','rear'].includes(h.state)&&h.aim&&h.kind!=='beetle'){stroke(255,191,80,180);strokeWeight(cell*.07);line(h.x*cell,h.y*cell,h.aim.x*cell,h.aim.y*cell);noFill();ellipse(h.aim.x*cell,h.aim.y*cell,cell*(h.kind==='scorpion'?1.8:h.kind==='spider'?1.3:.7),cell*(h.kind==='scorpion'?1.8:h.kind==='spider'?1.3:.7));}
  }
  // Clip the artwork to floor tiles, so toes and a turning tail are occluded by
  // masonry. The rig also keeps its centreline and planted feet on open floor.
  g.hunters.filter(h=>h.kind==='moth'&&g.visibleTile(Math.floor(h.x),Math.floor(h.y))).forEach(h=>drawEscapeMoth(h,cell,g.elapsed));
  // Owls glow in the dark: their perch, eyes and look-out beam are always shown.
  g.hunters.filter(h=>h.kind==='owl').forEach(h=>(g.level.seasonal||g.level.costume)?drawSeasonGhost(h,cell,g):drawEscapeOwl(h,cell,g));
  g.hunters.filter(h=>h.kind==='magpie'&&(!view.follow||g.visibleTile(Math.floor(h.x),Math.floor(h.y))||['fly','return'].includes(h.state))).forEach(h=>(g.level.seasonal||g.level.costume)==='summer'?drawSummerGull(h,cell,g):drawEscapeMagpie(h,cell,g));
  drawEscapeTongue(g,cell);
  drawingContext.save();drawingContext.beginPath();
  for(let y=0;y<g.height;y++)for(let x=0;x<g.width;x++)if(g.floor(x,y))drawingContext.rect(x*cell,y*cell,cell,cell);
  drawingContext.clip();drawingContext.lineCap='round';drawingContext.lineJoin='round';
  // An angler's lure is a light, so it shows even in the dark; the angler itself only shows when it rises.
  g.hunters.filter(h=>h.kind==='angler').forEach(h=>drawEscapeAngler(h,cell,g.elapsed));
  g.motion.refresh?.();
  for(const h of g.hunters)if(h.kind==='flytrap')drawEscapeDew(g,h,cell,view);
  g.hunters.forEach((h,i)=>{if(h.kind==='moth'||h.kind==='owl'||h.kind==='magpie'||h.kind==='angler'||h.kind==='cloudray')return;if(g.level.dark&&g.visibleTile(Math.floor(h.x),Math.floor(h.y))){noStroke();fill(103,238,210,35);ellipse(h.x*cell,h.y*cell,cell*1.2,cell*1.2);}const breathing=escapeBreathe(g,h,i,cell);if(!view.follow||g.visibleTile(Math.floor(h.x),Math.floor(h.y)))(g.level.seasonal||g.level.costume)&&drawSeasonCreature(h,g.motion.snakes[i],cell,g)?null:h.kind==='ladybird'?drawEscapeLadybird(h,cell,g.elapsed):h.kind==='fish'?drawEscapeFish(h,cell,g.elapsed):h.kind==='flytrap'?drawEscapeFlytrap(h,cell,g.elapsed):h.kind==='heron'?drawEscapeHeron(h,cell,g.elapsed):h.kind==='mantis'?drawEscapeMantis(h,cell,g.elapsed,g.mantisShown(h)):h.kind==='wasp'?drawEscapeWaspNest(h,cell,g.elapsed):h.kind==='dragonfly'?drawEscapeDragonfly(h,cell,g.elapsed):h.kind==='mole'?drawEscapeMole(h,cell,g.elapsed):h.kind==='bat'?drawEscapeBat(h,cell,g.elapsed,g):h.kind==='eel'?drawEscapeEel(h,cell,g.elapsed):h.kind==='crab'?drawEscapeCrab(h,cell,g.elapsed):h.kind==='fox'?drawEscapeFox(h,cell,g.elapsed):h.kind==='echofrog'?drawEscapeEchoFrog(h,cell,g.elapsed):h.kind==='sentinel'?drawEscapeSentinel(h,cell,g.elapsed):h.kind==='chameleon'?drawEscapeChameleon(h,cell,g.elapsed):h.kind==='mimic'?drawEscapeMimic(h,cell,g.elapsed):h.kind==='millipede'?drawEscapeMillipede(h,g.motion.snakes[i],cell,g.playerSees(h),g.elapsed):h.kind==='cricket'?drawEscapeCricket(h,cell,g.elapsed):['toad','spider'].includes(h.kind)?drawEscapeNestMonster(h,cell,g.elapsed):h.kind==='scorpion'?drawEscapeScorpion(h,cell,g.elapsed):h.kind==='beetle'?drawEscapeBeetle(h,cell):h.kind==='gecko'?drawEscapeGecko(h,cell,g.elapsed):drawEscapeSnake(g.motion.snakes[i],cell,h.state,h.kind==='sea-snake',h.kind==='cobra');if(breathing)pop();});
  drawingContext.save();drawingContext.globalAlpha*=g.player.hidden?.48:1;
  for(const h of g.hunters)if(h.state==='clash'&&g.visibleTile(Math.floor(h.x),Math.floor(h.y))){noFill();stroke(255,193,107,180);strokeWeight(cell*.035);ellipse(h.x*cell,h.y*cell,cell*(.9+Math.sin(g.elapsed*14)*.08),cell*.75);}
  // Mid-flight off a bounce cap, Sally rises over her shadow.
  const flight=g.player.flight,lift=flight?Math.sin(Math.min(1,(g.elapsed-flight.start)/flight.dur)*Math.PI)*cell*.9*Math.max(.8,Math.min(1.6,Math.hypot(flight.to.x-flight.from.x,flight.to.y-flight.from.y)/6)):0;
  if(flight){noStroke();fill(0,0,0,70);ellipse(g.player.x*cell,g.player.y*cell+cell*.1,cell*.7,cell*.25);push();translate(0,-lift);}
  // Crawling, Sally hugs the ground: a little smaller and dimmer, with a hush mark over her.
  const low=g.player.crawling;if(low){push();translate(g.player.x*cell,g.player.y*cell);scale(.86);translate(-g.player.x*cell,-g.player.y*cell);drawingContext.globalAlpha=.82;}
  if(g.player.underground){const u=g.player.underground,t=Math.min(1,(g.elapsed-u.start)/u.dur),x=(u.from.x+(u.to.x-u.from.x)*t)*cell,y=(u.from.y+(u.to.y-u.from.y)*t)*cell;noStroke();fill(110,82,54,180);for(let k=0;k<4;k++)ellipse(x-(u.to.x-u.from.x)*cell*k*.04,y-(u.to.y-u.from.y)*cell*k*.04,cell*(.34-k*.06),cell*(.22-k*.04));}
  // Digging in: Sally hunches down on the spot and digs, clods and pebbles flying and dust rising;
  // a poof as she goes under, then the dust clears to a mound with two eyes peeking out. Climbing
  // out throws up a small puff of its own.
  else if(g.player.dig?.buried){drawEscapeDigFx(g,cell);drawEscapeBuried(g,cell);}
  else{const dig=g.player.dig,x=g.player.x*cell,y=g.player.y*cell;
    // She bunches up around her middle, scrabbling side to side, and sinks into the pile as it grows.
    if(dig){const k=Math.min(1,(g.elapsed-dig.start)/EscapeAdventure.DIG_TIME),scoop=Math.sin(g.elapsed*38),my=y+cell*.3;drawEscapeDigPile(g,cell,k);
      push();translate(x+scoop*cell*.035,my);rotate(scoop*.06);scale(1+.12*k,1-.45*k);translate(-x,-my);if(k>.6)drawingContext.globalAlpha=Math.max(.15,1-(k-.6)*2.2);}
    drawEscapeLizard(g.motion.lizard,cell,g.motion.clock,g.player.swimming,!g.hasTail,escapeCharacter?.face);
    if(dig){drawingContext.globalAlpha=1;pop();drawEscapeDigFx(g,cell);}
    else if(escapeDigOut&&g.elapsed-escapeDigOut.at<.5)drawEscapeDust(escapeDigOut.x,escapeDigOut.y,g.elapsed-escapeDigOut.at,.5,cell,10,escapeDigOut.seed);}
  escapeDigWas(g);
  if(low){drawingContext.globalAlpha=1;pop();noStroke();fill(214,232,190,150);textSize(cell*.3);text('shh',g.player.x*cell,(g.player.y-.62)*cell);}
  if(flight)pop();
  drawingContext.restore();drawingContext.restore();
  drawEscapeCompanion(g.player,cell,g.elapsed);
  for(const c of g.clouds||[]){const age=g.elapsed-c.born,fade=Math.min(1,age*4,(c.until-g.elapsed)/1.2);noStroke();for(let k=0;k<7;k++){const a=k*.9+age*.3,r=c.r*cell*(.45+(k%3)*.18);fill(214,232,190,70*fade);ellipse(c.x*cell+Math.cos(a)*r*.6,c.y*cell+Math.sin(a)*r*.5,r*1.3,r*1.1);}fill(240,250,220,45*fade);ellipse(c.x*cell,c.y*cell,c.r*cell*2,c.r*cell*1.8);}
  if(g.player.camo){noFill();stroke(214,190,140,90+60*Math.sin(g.elapsed*6));strokeWeight(cell*.03);ellipse(g.player.x*cell,g.player.y*cell,cell*1.1,cell*1.1);}
  if(g.hawk)drawEscapeHawk(g.hawk,cell,g.elapsed);
  for(const h of g.hunters)if(h.kind==='cloudray')drawEscapeCloudRay(h,cell,g.elapsed);
  if(g.player.frozenUntil>g.elapsed){const p=g.player,k=Math.min(1,(g.player.frozenUntil-g.elapsed)/1.6);noStroke();fill(200,236,250,120*k);ellipse(p.x*cell,p.y*cell,cell*.9,cell*.9);stroke(235,250,255,200*k);strokeWeight(Math.max(1,cell*.035));for(let a=0;a<6;a++){const r=a*Math.PI/3;line(p.x*cell,p.y*cell,(p.x+Math.cos(r)*.45)*cell,(p.y+Math.sin(r)*.45)*cell);}}
  for(const h of g.hunters)if(h.kind!=='millipede'&&h.state!=='rooted'&&h.state!=='patrol'&&!(['angler','flytrap'].includes(h.kind)&&h.state!=='snap')&&!(h.kind==='heron'&&h.state!=='aim')&&!(h.kind==='mantis'&&h.state!=='raise')&&!(h.kind==='wasp'&&h.state!=='stir')&&h.kind!=='dragonfly'&&h.kind!=='cloudray'&&h.kind!=='sentinel'&&!(h.kind==='mole'&&h.state!=='surface')&&!(h.kind==='bat'&&h.state!=='dive')&&!(h.kind==='magpie'&&h.state!=='caw')&&!(h.kind==='eel'&&h.state!=='ripple')&&!(h.kind==='crab'&&!['peek','scuttle'].includes(h.state))&&h.kind!=='fox'&&(!view.follow||g.visibleTile(Math.floor(h.x),Math.floor(h.y))))escapeHunterMark(h,cell,g);
  drawEscapeCritters(g,cell,view,'air');drawEscapeFx(g,cell);drawEscapeMotes(g,cell);
  const place=escapePlace(g.level),mood=place?EscapeLighting.moodFor(place.key,place.step):null;
  drawEscapeCloudShadows(g,cell,mood);drawEscapeLights(g,cell,mood);
  if(view.follow){drawEscapeFog(g,cell);drawEscapeGlowWatchers(g,cell);}
  pop();
  drawEscapeGrade(mood,g);
  // Storm: the sky darkens while thunder rumbles, then a white flash lights everything for a moment.
  if(g.storm){const toFlash=g.storm.nextAt-g.elapsed;if(toFlash<g.storm.warn){noStroke();fill(10,14,30,90*(1-toFlash/g.storm.warn));rect(0,0,width,height);}
    if(g.elapsed<g.flashUntil){noStroke();fill(235,240,255,(escapeLightingFull()?110:170)*(g.flashUntil-g.elapsed)/.4);rect(0,0,width,height);}}
  // Hunters off the edge of a following view: an alerted one shows a bright '!', and in a phone's
  // close view a nearby one on patrol shows a dim marker, so zooming in never hides danger.
  if(view.follow&&!escapeAidsHidden(g))for(const h of g.hunters){
    const alert=['alert','chase','windup','charge','sting','leap','rush','pounce','crouch'].includes(h.state),near=close&&!g.level.explore&&!['buried','rooted','shell','lurking','emerge'].includes(h.state)&&Math.hypot(h.x-g.player.x,h.y-g.player.y)<11;
    if(!alert&&!near)continue;const x=h.x*cell+ox,y=h.y*cell+oy;
    if(x<12||y<12||x>width-12||y>height-12){const px=Math.max(16,Math.min(width-16,x)),py=Math.max(16,Math.min(height-16,y));noStroke();
      if(alert){fill(241,173,86);ellipse(px,py,24,24);fill(25,29,29);textSize(18);textAlign(CENTER,CENTER);text('!',px,py);}
      else{const a=Math.atan2(y-height/2,x-width/2);push();translate(px,py);rotate(a);fill(232,214,170,170);triangle(9,0,-6,-7,-6,7);pop();}}
  }
}
// A snow fox: white, with a bushy tail and big ears. It flattens for a blink before it pounces,
// stretches long in the air, and noses the snow while it sniffs. No warning mark over its head.
// A creature's eye: a pale ball, a dark (or angry red) pupil looking forward and a glint.
function escapeCreatureEye(x,y,r,hot=false,iris=null){noStroke();fill(...(iris||[250,246,228]));ellipse(x,y,r,r);fill(...(hot?[190,40,30]:[22,20,26]));ellipse(x+r*.14,y,r*.58,r*.58);fill(255,255,255,230);ellipse(x-r*.06,y-r*.2,r*.26,r*.26);}
function drawEscapeFox(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);const crouch=h.state==='crouch',air=h.state==='pounce',sniff=h.state==='sniff',stretch=air?1.3:crouch?.86:1,lift=air?-cell*.05:0,trot=h.distanceMoved*13;
  noStroke();fill(0,0,0,air?25:50);ellipse(-cell*.05,cell*.09,cell*.95*stretch,cell*.42);
  // Legs: four slim dark-socked legs at a trot, tucked under when crouched, stretched in a pounce.
  if(!crouch){stroke(150,158,176);strokeWeight(cell*.07);for(const [px,side,ph] of [[.15,-1,0],[.15,1,PI],[-.2,-1,PI],[-.2,1,0]]){const s=air?(px>0?.16:-.16):Math.sin(trot+ph)*.08;line(cell*px*stretch,side*cell*.1,cell*(px+s)*stretch,side*cell*.23);}noStroke();fill(70,74,88);for(const [px,side,ph] of [[.15,-1,0],[.15,1,PI],[-.2,-1,PI],[-.2,1,0]]){const s=air?(px>0?.16:-.16):Math.sin(trot+ph)*.08;ellipse(cell*(px+s)*stretch,side*cell*.24,cell*.07,cell*.06);}}
  // A big brush of a tail, swishing, its tip white.
  const wag=Math.sin(clock*5+h.x)*.25;push();translate(-cell*.27*stretch,0);rotate(Math.PI+wag*(air?.2:1));stroke(150,160,182);strokeWeight(cell*.025);fill(222,228,240);ellipse(cell*.2,0,cell*.44,cell*.24);noStroke();fill(255);ellipse(cell*.36,0,cell*.16,cell*.15);pop();
  // Body with a soft grey saddle, then the head: ears, a pointed snout, black nose, bright eyes.
  stroke(150,160,182);strokeWeight(cell*.025);fill(238,242,250);ellipse(0,lift,cell*.58*stretch,cell*(crouch?.3:.34));noStroke();fill(206,214,230);ellipse(-cell*.05*stretch,lift,cell*.34*stretch,cell*(crouch?.14:.16));
  push();translate(cell*.29*stretch,lift+(sniff?cell*.03:0));stroke(150,160,182);strokeWeight(cell*.022);fill(246,248,252);ellipse(0,0,cell*.27,cell*.25);
  fill(232,236,246);triangle(-cell*.07,-cell*.07,-cell*.02,-cell*.22,cell*.06,-cell*.08);triangle(-cell*.07,cell*.07,-cell*.02,cell*.22,cell*.06,cell*.08);noStroke();fill(120,128,150);triangle(-cell*.04,-cell*.09,-cell*.02,-cell*.18,cell*.03,-cell*.09);triangle(-cell*.04,cell*.09,-cell*.02,cell*.18,cell*.03,cell*.09);
  fill(246,248,252);triangle(cell*.08,-cell*.07,cell*.08,cell*.07,cell*.22,0);fill(30,30,38);ellipse(cell*.21,0,cell*.06,cell*.055);
  const hot=air||crouch;escapeCreatureEye(cell*.06,-cell*.065,cell*.07,hot,[210,224,120]);escapeCreatureEye(cell*.06,cell*.065,cell*.07,hot,[210,224,120]);pop();
  pop();
}
// A hermit crab: a spiral shell that looks like any other on the beach. Peeking, it shows eyes
// on stalks and raised claws (one big crusher); out of its shell it scuttles on six legs.
function drawEscapeCrab(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);const out=['peek','scuttle','tired','return'].includes(h.state),shake=h.state==='hide'?Math.sin(clock*40)*cell*.02:0;
  noStroke();fill(0,0,0,45);ellipse(cell*.02,cell*.13,cell*.66,cell*.26);
  if(out){const walk=h.state==='scuttle'?Math.sin(h.distanceMoved*14)*cell*.06:0;stroke(150,58,40);strokeWeight(Math.max(1,cell*.04));
    for(const side of [-1,1])for(let k=0;k<3;k++){const y=(k-1)*cell*.1,w=k%2?walk:-walk;line(side*cell*.14,y,side*cell*.3,y+w+cell*.02);line(side*cell*.3,y+w+cell*.02,side*cell*.38,y+w+cell*.1);}
    const up=h.state==='peek'?-cell*.04:0;stroke(150,58,40);strokeWeight(cell*.03);
    for(const side of [-1,1]){const big=side>0,s=big?1.3:1;line(side*cell*.1,-cell*.12,side*cell*.2,-cell*.2+up);fill(226,104,72);ellipse(side*cell*.24,-cell*.24+up,cell*.17*s,cell*.13*s);noStroke();fill(250,170,140);ellipse(side*cell*.21,-cell*.27+up,cell*.06*s,cell*.04*s);stroke(150,58,40);line(side*cell*.24,-cell*.3*s+up,side*cell*.24,-cell*.22+up);}
    line(-cell*.05,-cell*.12,-cell*.08,-cell*.27);line(cell*.05,-cell*.12,cell*.08,-cell*.27);escapeCreatureEye(-cell*.08,-cell*.29,cell*.07,h.state==='peek');escapeCreatureEye(cell*.08,-cell*.29,cell*.07,h.state==='peek');}
  // The shell: a whorl with a lip, banded and shaded, a little sheen on top.
  translate(shake,0);stroke(160,112,72);strokeWeight(Math.max(1,cell*.03));fill(234,208,162);ellipse(0,0,cell*.46,cell*.4);noStroke();fill(214,180,132);ellipse(cell*.04,cell*.05,cell*.34,cell*.26);fill(250,232,196);ellipse(-cell*.09,-cell*.09,cell*.14,cell*.08);
  noFill();stroke(160,112,72);strokeWeight(Math.max(1,cell*.03));for(let k=0;k<3;k++)arc(-cell*.02,0,cell*(.34-k*.1),cell*(.3-k*.09),k*.8,PI+k*.8);
  fill(200,150,110);noStroke();ellipse(cell*.18,cell*.04,cell*.1,cell*.16);
  pop();
}
// A bog heron standing in the reeds: a grey body with folded wing feathers, a long neck, a black
// crest stripe and a dagger beak along its facing, with its beak line marked faintly on the ground.
// It draws its neck back on the tell and thrusts the beak out on the stab.
function drawEscapeHeron(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  noStroke();fill(220,120,90,h.state==='aim'?110:h.state==='stab'?30:45);rect(cell*.2,-cell*.55,cell*(h.reach-.2),cell*1.1,cell*.2);
  const neck=h.state==='aim'?.12:h.state==='stab'?.62:.34,bob=h.state==='still'?Math.sin(clock*1.4+h.x)*.02:0,hx=neck+bob+.14;
  fill(0,0,0,55);ellipse(-cell*.06,cell*.08,cell*.78,cell*.5);
  // Body and the folded wings, layered like feathers, dark flight tips at the back.
  stroke(92,104,120);strokeWeight(cell*.02);fill(160,174,190);ellipse(-cell*.06,0,cell*.66,cell*.46);
  for(const side of [-1,1]){fill(132,146,164);beginShape();vertex(cell*.14,side*cell*.06);vertex(-cell*.1,side*cell*.23);vertex(-cell*.42,side*cell*.12);vertex(-cell*.3,side*cell*.02);endShape(CLOSE);fill(64,72,86);triangle(-cell*.3,side*cell*.04,-cell*.46,side*cell*.1,-cell*.4,side*cell*.01);}
  noStroke();fill(196,206,218);ellipse(cell*.04,0,cell*.24,cell*.2);
  // The neck, the white head with its black crest and yellow eye, and the beak.
  stroke(205,214,224);strokeWeight(cell*.1);line(cell*.1,0,cell*hx,0);noStroke();
  fill(236,240,244);ellipse(cell*hx,0,cell*.21,cell*.18);stroke(30,32,40);strokeWeight(cell*.035);line(cell*(hx-.02),-cell*.05,cell*(hx-.22),-cell*.08);noStroke();
  escapeCreatureEye(cell*(hx+.03),-cell*.045,cell*.055,h.state==='aim',[248,214,90]);escapeCreatureEye(cell*(hx+.03),cell*.045,cell*.055,h.state==='aim',[248,214,90]);
  fill(232,190,70);stroke(170,120,40);strokeWeight(cell*.015);triangle(cell*(hx+.06),-cell*.045,cell*(hx+.06),cell*.045,cell*(hx+(h.state==='stab'?.48:.36)),0);
  pop();
}
// A praying mantis: from a distance only a faint twig with a kink in it. Close up (or once it
// strikes) it shows a slim segmented body, folded wings, a triangular head with big eyes and
// spiked forelegs, with its reach marked as a short cone. The forelegs rise on the tell and
// shoot out on the strike.
function drawEscapeMantis(h,cell,clock,shown){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);const sway=h.state==='still'?Math.sin(clock*1.1+h.y)*.03:0;rotate(sway);
  if(!shown){scale(1.45);stroke(120,104,70,70);strokeWeight(Math.max(1,cell*.05));line(-cell*.32,0,cell*.1,0);line(cell*.1,0,cell*.26,-cell*.08);strokeWeight(Math.max(1,cell*.025));line(-cell*.1,0,-cell*.18,cell*.14);pop();return;}
  if(!escapeAidsHidden()){noStroke();fill(220,150,60,h.state==='raise'?105:h.state==='strike'?30:42);const r=h.reach;beginShape();vertex(cell*.15,-cell*.42);vertex(cell*r,-cell*(.42+r*.3));vertex(cell*r,cell*(.42+r*.3));vertex(cell*.15,cell*.42);endShape(CLOSE);}
  scale(1.45);noStroke();fill(0,0,0,45);ellipse(-cell*.06,cell*.04,cell*.62,cell*.2);
  stroke(80,128,58);strokeWeight(Math.max(1,cell*.028));for(const side of [-1,1])for(const o of [-.2,-.02]){line(cell*o,0,cell*(o-.06),side*cell*.16);line(cell*(o-.06),side*cell*.16,cell*(o-.16),side*cell*.28);}
  // Abdomen with segment lines, folded wings over it, the long thorax.
  stroke(80,128,58);strokeWeight(cell*.015);fill(118,176,84);ellipse(-cell*.17,0,cell*.48,cell*.17);for(let k=0;k<4;k++)line(-cell*(.05+k*.08),-cell*.07,-cell*(.05+k*.08),cell*.07);
  fill(170,212,128,200);ellipse(-cell*.14,0,cell*.44,cell*.11);noStroke();fill(142,196,98);ellipse(cell*.12,0,cell*.28,cell*.08);
  stroke(80,128,58);strokeWeight(cell*.015);fill(156,210,108);triangle(cell*.22,-cell*.1,cell*.22,cell*.1,cell*.38,0);
  const hot=h.state==='raise'||h.state==='strike';escapeCreatureEye(cell*.24,-cell*.075,cell*.075,hot,[212,232,140]);escapeCreatureEye(cell*.24,cell*.075,cell*.075,hot,[212,232,140]);
  const reach=h.state==='raise'?.08:h.state==='strike'?.62:.18,lift=h.state==='raise'?.2:.06;stroke(126,186,88);strokeWeight(Math.max(1,cell*.045));
  for(const side of [-1,1]){const ex=cell*(.2+reach*.5),ey=side*cell*lift,tx=cell*(.24+reach),ty=side*cell*.03;line(cell*.16,side*cell*.04,ex,ey);line(ex,ey,tx,ty);stroke(70,110,50);strokeWeight(Math.max(1,cell*.015));for(const f of [.35,.65])line(ex+(tx-ex)*f,ey+(ty-ey)*f,ex+(tx-ex)*f-side*cell*.0,ey+(ty-ey)*f-side*cell*.04);stroke(126,186,88);strokeWeight(Math.max(1,cell*.045));}
  pop();
}
// A wasp nest: a grey paper teardrop with a dark mouth, a few wasps idling around it. On the
// tell the nest shakes; the swarm is a buzzing knot of wasps with a faint ring round it.
function drawEscapeWasp(x,y,cell,clock,seed){
  const flap=Math.abs(Math.sin(clock*40+seed));noStroke();fill(255,255,255,150);ellipse(x-cell*.03,y-cell*.05,cell*.09,cell*(.04+flap*.05));ellipse(x+cell*.03,y-cell*.05,cell*.09,cell*(.04+flap*.05));
  fill(245,196,40);ellipse(x,y,cell*.14,cell*.09);fill(40,30,10);rect(x-cell*.015,y-cell*.045,cell*.03,cell*.09);
}
function drawEscapeWaspNest(h,cell,clock){
  const shake=h.state==='stir'?Math.sin(clock*60)*cell*.04:0,nx=h.nest.x*cell+shake,ny=h.nest.y*cell;
  // Its hearing range is marked: running inside the dashed ring stirs it.
  if(h.state==='nest'&&!escapeAidsHidden()){noFill();stroke(245,196,40,32);strokeWeight(Math.max(1,cell*.02));drawingContext.setLineDash?.([cell*.1,cell*.12]);ellipse(h.nest.x*cell,ny,cell*7,cell*7);drawingContext.setLineDash?.([]);}
  push();translate(nx,ny);scale(1.35);translate(-nx,-ny);
  noStroke();fill(0,0,0,50);ellipse(nx,ny+cell*.3,cell*.6,cell*.2);fill(186,174,150);ellipse(nx,ny,cell*.62,cell*.78);
  stroke(150,138,116);strokeWeight(Math.max(1,cell*.025));noFill();for(let k=-1;k<=1;k++)arc(nx,ny+k*cell*.18,cell*.6,cell*.22,0,PI);noStroke();fill(60,48,32);ellipse(nx,ny+cell*.28,cell*.16,cell*.12);
  const idle=h.state==='nest'?3:h.state==='stir'?6:1;for(let k=0;k<idle;k++){const a=clock*(2.4+k*.3)+k*2.1;drawEscapeWasp(nx+Math.cos(a)*cell*.45,ny+Math.sin(a*1.3)*cell*.35,cell,clock,k);}
  pop();
  if(h.swarm){const sx=h.swarm.x*cell,sy=h.swarm.y*cell;noFill();stroke(245,196,40,h.state==='swarm'?90:40);strokeWeight(Math.max(1,cell*.03));ellipse(sx,sy,cell*1.1,cell*1.1);
    for(let k=0;k<12;k++){const a=clock*7+k*2.4,r=cell*(.18+(k%3)*.13);drawEscapeWasp(sx+Math.cos(a)*r,sy+Math.sin(a*1.4)*r,cell*1.4,clock,k);}}
}
// A dragonfly: a long blue body and four glassy wings in a blur, with its whole loop dotted on
// the ground so the timing can be read.
function drawEscapeDragonfly(h,cell,clock){
  const pts=h.patrol;if(pts.length>1){noFill();stroke(120,220,240,75);strokeWeight(Math.max(1,cell*.035));drawingContext.setLineDash?.([cell*.08,cell*.12]);beginShape();for(const q of pts)vertex(q.x*cell,q.y*cell);endShape(CLOSE);drawingContext.setLineDash?.([]);}
  push();translate(h.x*cell,h.y*cell);rotate(h.facing||0);scale(1.3);const flap=Math.abs(Math.sin(clock*45));noStroke();
  fill(0,0,0,40);ellipse(cell*.05,cell*.25,cell*.6,cell*.14);
  fill(200,240,255,120);for(const side of [-1,1])for(const o of [.04,-.1]){push();translate(cell*o,0);rotate(side*(.25+flap*.25));ellipse(0,side*cell*.2,cell*.14,cell*.38);pop();}
  fill(40,150,190);rect(-cell*.42,-cell*.035,cell*.5,cell*.07,cell*.03);fill(60,190,220);ellipse(cell*.1,0,cell*.18,cell*.13);fill(30,90,140);ellipse(cell*.2,0,cell*.14,cell*.16);
  fill(255,255,255,170);ellipse(cell*.23,-cell*.05,cell*.04,cell*.04);ellipse(cell*.23,cell*.05,cell*.04,cell*.04);
  pop();
}
// A mole: underground it is only a ripple of soil running through the floor (faster and
// darker while it tracks a sound); a shaking mound is the tell; then the mole itself, with its
// pink star nose and big digging claws.
function drawEscapeMole(h,cell,clock){
  const x=h.x*cell,y=h.y*cell;noStroke();
  if(h.state==='under'||h.state==='track'){const fast=h.state==='track';for(let k=0;k<4;k++){const a=clock*(fast?9:4)+k*1.6;fill(96,70,44,fast?150:90);ellipse(x+Math.cos(a)*cell*.18,y+Math.sin(a)*cell*.12,cell*(.22+k*.04),cell*.14);}
    fill(70,50,32,fast?170:110);ellipse(x,y,cell*.42,cell*.26);return;}
  if(h.state==='surface'){const shake=Math.sin(clock*50)*cell*.04;fill(0,0,0,60);ellipse(x,y+cell*.18,cell*.8,cell*.25);fill(110,80,50);ellipse(x+shake,y,cell*.75,cell*.5);fill(140,104,66);for(let k=0;k<5;k++)ellipse(x+shake+Math.cos(k*1.3)*cell*.25,y+Math.sin(k*1.3)*cell*.16,cell*.12,cell*.1);return;}
  push();translate(x,y);fill(0,0,0,60);ellipse(0,cell*.2,cell*.75,cell*.24);fill(110,80,50);ellipse(0,cell*.06,cell*.8,cell*.4);fill(60,52,58);ellipse(0,-cell*.02,cell*.56,cell*.5);
  fill(240,170,190);for(let k=0;k<6;k++){const a=k*1.047;ellipse(Math.cos(a)*cell*.05,-cell*.24+Math.sin(a)*cell*.05,cell*.06,cell*.06);}
  fill(236,214,190);for(const side of [-1,1]){ellipse(side*cell*.26,-cell*.04,cell*.18,cell*.12);for(let k=-1;k<=1;k++)ellipse(side*cell*.34,-cell*.04+k*cell*.04,cell*.06,cell*.03);}
  fill(20);ellipse(-cell*.08,-cell*.13,cell*.03,cell*.03);ellipse(cell*.08,-cell*.13,cell*.03,cell*.03);pop();
}
// An echo bat: dark wings in a slow flutter, and its sonar ring spreading out as a pale circle.
// A still Sally is invisible to it; a ring that touches her while she moves brings the swoop.
function drawEscapeBat(h,cell,clock,g){
  const age=g.elapsed-h.pulseAt;if(age<.6&&h.pulseFrom){noFill();stroke(200,220,255,160*(1-age/.6));strokeWeight(Math.max(1,cell*.04));const r=age/.6*h.range*cell*2;ellipse(h.pulseFrom.x*cell,h.pulseFrom.y*cell,r,r);}
  push();translate(h.x*cell,h.y*cell);scale(1.5);const flap=Math.sin(clock*(h.state==='dive'?30:12));noStroke();fill(0,0,0,40);ellipse(0,cell*.35,cell*.6,cell*.15);
  stroke(200,190,230,150);strokeWeight(Math.max(1,cell*.02));fill(96,82,120);for(const side of [-1,1]){beginShape();vertex(0,0);vertex(side*cell*.45,-cell*(.18+flap*.15));vertex(side*cell*.38,cell*.02);vertex(side*cell*.22,-cell*.02);vertex(side*cell*.12,cell*.08);endShape(CLOSE);}
  noStroke();fill(120,104,146);ellipse(0,0,cell*.24,cell*.28);fill(255,210,120);ellipse(-cell*.05,-cell*.04,cell*.04,cell*.04);ellipse(cell*.05,-cell*.04,cell*.04,cell*.04);
  fill(120,104,146);triangle(-cell*.09,-cell*.1,-cell*.05,-cell*.2,-cell*.01,-cell*.1);triangle(cell*.09,-cell*.1,cell*.05,-cell*.2,cell*.01,-cell*.1);pop();
}
// An eel: two eyes and a fin just breaking the surface of its pool; a ring of ripples on the tell;
// a long green body thrown out along the lunge; a sand bump when the tide has left it buried.
function drawEscapeEel(h,cell,clock){
  const hx=h.post.x*cell,hy=h.post.y*cell;noStroke();
  if(h.state==='buried'){fill(170,150,110);ellipse(hx,hy+cell*.1,cell*.5,cell*.22);fill(60,80,50);ellipse(hx-cell*.06,hy+cell*.04,cell*.05,cell*.04);return;}
  if(h.state==='ripple'||h.state==='sulk'){noFill();stroke(200,240,250,h.state==='ripple'?190:80);strokeWeight(Math.max(1,cell*.03));const t=(clock*3)%1;ellipse(hx,hy,cell*(.4+t*.6),cell*(.3+t*.4));ellipse(hx,hy,cell*(.2+t*.3),cell*(.15+t*.2));noStroke();}
  if(h.state==='lunge'){stroke(70,120,70);strokeWeight(cell*.22);line(hx,hy,h.x*cell,h.y*cell);noStroke();fill(90,150,84);ellipse(h.x*cell,h.y*cell,cell*.38,cell*.3);fill(255,240,120);ellipse(h.x*cell-cell*.06,h.y*cell-cell*.06,cell*.07,cell*.07);ellipse(h.x*cell+cell*.06,h.y*cell-cell*.06,cell*.07,cell*.07);return;}
  noFill();stroke(200,240,250,70);strokeWeight(Math.max(1,cell*.025));ellipse(hx,hy,cell*.8,cell*.5);noStroke();push();translate(hx,hy);scale(1.5);translate(-hx,-hy);
  const bob=Math.sin(clock*2+h.post.x)*cell*.03;fill(60,100,62,220);ellipse(hx,hy+bob,cell*.34,cell*.16);fill(255,240,120);ellipse(hx-cell*.07,hy+bob-cell*.03,cell*.06,cell*.06);ellipse(hx+cell*.07,hy+bob-cell*.03,cell*.06,cell*.06);
  fill(20);ellipse(hx-cell*.07,hy+bob-cell*.03,cell*.025,cell*.04);ellipse(hx+cell*.07,hy+bob-cell*.03,cell*.025,cell*.04);pop();
}
// A flytrap on its stem: two toothed lobes that gape while it waits, slam shut on a snap,
// and stay closed and bulging while it chews. Its reach is always marked.
// Sticky dew round a flytrap marks exactly how far it bites. Each drop shows wherever its own
// tile is in view, so the ring can be read from a distance before the plant itself is in sight.
// Thrown pebbles and glow mushrooms in the air (a little arc on each leg), glow mushrooms
// lighting the ground, and, while a throw is held, the dotted line of where it will go.
function drawEscapeGlowWatchers(g,cell){
  // Only eyes in the mushroom's faint outer halo show through fog. Never reveal
  // a watcher through masonry or a creature Sally has slipped away from unseen.
  for(const h of g.hunters){
    if(h.state!=='light-watch'||!h.glowFear?.lastSeen||g.elapsed-h.glowFear.seenAt>.2||g.visibleTile(Math.floor(h.x),Math.floor(h.y))||!g.clear(g.player,h,true))continue;
    if(!g.lights.some(l=>l.until>g.elapsed&&Math.hypot(l.x-h.x,l.y-h.y)<=l.r+.8&&g.clear(l,h,true)))continue;
    const dx=Math.cos(h.facing),dy=Math.sin(h.facing);noStroke();
    for(const side of[-1,1]){const x=(h.x+dx*.2-dy*side*.065)*cell,y=(h.y+dy*.2+dx*side*.065)*cell;fill(235,206,160,35);ellipse(x,y,cell*.14,cell*.14);fill(245,220,178,190);ellipse(x,y,cell*.055,cell*.055);}
  }
}
function drawEscapeThrows(g,cell){
  for(const l of g.lights||[]){const left=l.until-g.elapsed,fade=Math.min(1,left/3,(g.elapsed-l.born)*4),pulse=1+Math.sin(g.elapsed*2.2+l.x)*.04;noStroke();
    for(const k of [1,.84,.68,.52,.36,.2]){fill(111,232,212,(5+(1-k)*18.75)*fade);ellipse(l.x*cell,l.y*cell,l.r*2*cell*k*pulse,l.r*2*cell*k*pulse);}
    fill(143,240,220,230*fade);arc(l.x*cell,l.y*cell,cell*.32,cell*.26,PI,TWO_PI,CHORD);fill(217,245,228,230*fade);rect(l.x*cell-cell*.04,l.y*cell,cell*.08,cell*.12);
    fill(255,255,255,200*fade);ellipse(l.x*cell-cell*.05,l.y*cell-cell*.06,cell*.04,cell*.04);}
  for(const f of g.flights||[]){if(!f.pos)continue;const travelled=(g.elapsed-f.start)*f.speed,leg=f.legs.find(q=>travelled<=q.end)||f.legs.at(-1),legLen=Math.hypot(leg.to.x-leg.from.x,leg.to.y-leg.from.y),t=legLen?1-(leg.end-travelled)/legLen:1,lift=Math.sin(Math.PI*Math.max(0,Math.min(1,t)))*Math.min(.5,legLen*.12)*cell;
    noStroke();fill(0,0,0,60);ellipse(f.pos.x*cell,f.pos.y*cell+cell*.08,cell*.16,cell*.07);
    if(f.kind==='spore'){fill(214,232,150,110);ellipse(f.pos.x*cell,f.pos.y*cell-lift,cell*.34,cell*.34);fill(190,214,120);ellipse(f.pos.x*cell,f.pos.y*cell-lift,cell*.2,cell*.18);}
    else if(f.kind==='glow'){fill(111,232,212,90);ellipse(f.pos.x*cell,f.pos.y*cell-lift,cell*.5,cell*.5);fill(143,240,220);ellipse(f.pos.x*cell,f.pos.y*cell-lift,cell*.2,cell*.16);}
    else if((g.level.seasonal||g.level.costume)==='winter'&&f.kind==='pebble'){fill(217,237,246);ellipse(f.pos.x*cell,f.pos.y*cell-lift,cell*.24,cell*.24);fill(255);ellipse(f.pos.x*cell-cell*.035,f.pos.y*cell-lift-cell*.04,cell*.085,cell*.065);}else{fill(193,181,255);ellipse(f.pos.x*cell,f.pos.y*cell-lift,cell*.16,cell*.16);}}
  if(escapeCharge&&g.active()){const power=escapeChargePower(),plan=g.planThrow(power),glow=escapeCharge.kind==='glow',spore=escapeCharge.kind==='spore';
    noFill();stroke(glow?143:193,glow?240:181,glow?220:255,190);strokeWeight(Math.max(1.5,cell*.04));drawingContext.setLineDash([cell*.1,cell*.12]);
    beginShape();for(const q of plan.points)vertex(q.x*cell,q.y*cell);endShape();drawingContext.setLineDash([]);
    for(const b of plan.bounces){strokeWeight(Math.max(1.5,cell*.05));line(b.x*cell-cell*.1,b.y*cell-cell*.1,b.x*cell+cell*.1,b.y*cell+cell*.1);line(b.x*cell+cell*.1,b.y*cell-cell*.1,b.x*cell-cell*.1,b.y*cell+cell*.1);}
    strokeWeight(Math.max(1,cell*.03));ellipse(plan.land.x*cell,plan.land.y*cell,glow?2.5*2*cell:spore?1.9*2*cell:cell*.45,glow?2.5*2*cell:spore?1.9*2*cell:cell*.45);
    // The power ring round Sally fills as the throw is held.
    stroke(255,240,190,200);strokeWeight(Math.max(2,cell*.06));arc(g.player.x*cell,g.player.y*cell,cell*.95,cell*.95,-HALF_PI,-HALF_PI+TWO_PI*Math.max(.02,power));}
}
function drawEscapeDew(g,h,cell,view){
  const reach=h.reach||1.6,n=Math.round(reach*9);noStroke();
  for(let k=0;k<n;k++){const a=k/n*TWO_PI+h.x,x=h.x+Math.cos(a)*reach*.97,y=h.y+Math.sin(a)*reach*.97;
    if(view.follow&&!g.visibleTile(Math.floor(x),Math.floor(y)))continue;
    const glint=Math.max(0,Math.sin(g.elapsed*1.8+k*1.7));fill(205,236,160,110+glint*100);ellipse(x*cell,y*cell,cell*.1,cell*.1);
    if(glint>.92){fill(255,255,235,170);ellipse(x*cell-cell*.012,y*cell-cell*.012,cell*.03,cell*.03);}}
}
function drawEscapeFlytrap(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);noFill();stroke(200,90,90,h.state==='open'?55:25);strokeWeight(Math.max(1,cell*.02));drawingContext.setLineDash?.([cell*.08,cell*.08]);ellipse(0,0,cell*2*(h.reach||1.6),cell*2*(h.reach||1.6));drawingContext.setLineDash?.([]);
  noStroke();fill(40,90,40);ellipse(0,cell*.12,cell*.55,cell*.3);
  const sway=Math.sin(clock*2+h.x)*.08,gape=h.state==='open'?.55+Math.sin(clock*3)*.06:h.state==='snap'?.75:.05;rotate(h.facing+sway);
  for(const side of [-1,1]){push();rotate(side*gape);fill(h.state==='chew'?120:170,60,70);arc(cell*.18,0,cell*.55,cell*.36,side<0?PI:0,side<0?TWO_PI:PI,CHORD);
    fill(235,230,200);for(let k=0;k<4;k++)triangle(cell*(-.02+k*.11),0,cell*(.03+k*.11),0,cell*(.005+k*.11),side*cell*.09);pop();}
  if(h.state==='chew'){fill(255,255,255,90);ellipse(cell*.2,0,cell*.1,cell*.1);}
  pop();
}
// Tangle vine: creeping tendrils across a floor tile. Withered vines are brown; a holding vine
// wraps round Sally.
function drawEscapeVine(v,cell,clock,withered,held){
  push();noFill();strokeWeight(Math.max(1,cell*.045));stroke(withered?110:70,withered?85:150,withered?50:70,withered?150:210);
  const cx=(v.x+.5)*cell,cy=(v.y+.5)*cell;
  for(let k=0;k<5;k++){const a=k*1.26+Math.sin(clock*1.3+k)*.15*(withered?0:1),r=cell*.42;bezier(cx,cy,cx+Math.cos(a)*r*.6,cy+Math.sin(a+.6)*r*.6,cx+Math.cos(a+.4)*r,cy+Math.sin(a+.4)*r*.5,cx+Math.cos(a+.9)*r,cy+Math.sin(a+.9)*r);}
  if(!withered){noStroke();fill(120,190,90);for(let k=0;k<4;k++)ellipse(cx+Math.cos(k*1.6)*cell*.25,cy+Math.sin(k*1.6)*cell*.25,cell*.1,cell*.06);}
  if(held){stroke(60,140,60,230);strokeWeight(Math.max(1.5,cell*.06));for(let k=0;k<3;k++){const w=Math.sin(clock*8+k)*cell*.04;ellipse(held.x*cell,held.y*cell+(k-1)*cell*.12,cell*(.5+w/cell),cell*.16);}}
  pop();
}
function drawEscapeMimic(h,cell,clock,harmless=false){
  if(!harmless&&h.state==='rooted'){push();const shiver=Math.sin(clock*.7+h.x*3+h.y*5)>.975?Math.sin(clock*55)*cell*.022:0;translate(h.x*cell+shiver,h.y*cell);const breath=Math.sin(clock*1.3+h.x*2)*.5+.5,blink=Math.sin(clock*.9+h.y)>.985;noStroke();fill(245-breath*20,189+breath*8,87);rect(-cell*.3,-cell*.22,cell*.6,cell*.44,cell*.08);fill(100,71,40);rect(-cell*.06,-cell*.22,cell*.12,cell*.44);if(blink){fill(120,200,90);ellipse(-cell*.15,-cell*.02,cell*.07,cell*.05);ellipse(cell*.15,-cell*.02,cell*.07,cell*.05);}pop();return;}
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
// An echo frog: a squat green frog whose throat swells with the noise it heard, then rings
// outward as it croaks it back.
function drawEscapeEchoFrog(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);const swell=h.state==='swell'?Math.min(1,1-(h.phaseUntil-clock)/2):h.state==='croak'?1:0;
  noStroke();fill(0,0,0,60);ellipse(0,cell*.08,cell*.62,cell*.3);
  if(swell>0){fill(220,236,170,140+swell*80);ellipse(0,cell*.12,cell*(.18+swell*.32),cell*(.14+swell*.26));}
  fill(92,150,78);ellipse(0,0,cell*.52,cell*.42);fill(70,122,62);for(const s of [-1,1]){ellipse(s*cell*.24,cell*.12,cell*.2,cell*.14);ellipse(s*cell*.2,-cell*.14,cell*.16,cell*.12);}
  fill(240,226,140);for(const s of [-1,1])ellipse(s*cell*.12,-cell*.13,cell*.12,cell*.12);fill(20);for(const s of [-1,1])ellipse(s*cell*.12,-cell*.13,cell*.05,cell*.07);
  if(h.state==='croak'){noFill();for(let k=0;k<3;k++){const r=((clock*2.2+k/3)%1);stroke(200,240,170,180*(1-r));strokeWeight(cell*.04);ellipse(0,0,cell*(.6+r*3),cell*(.6+r*3));}}
  pop();
}
// A chameleon: almost invisible while it keeps still; moving, it shimmers into view.
function drawEscapeChameleon(h,cell,clock){
  const moving=clock-(h.movedAt??-9)<.2,alert=['alert','chase','search'].includes(h.state),a=moving||alert?.6:.07;
  push();translate(h.x*cell,h.y*cell);rotate(h.facing||0);drawingContext.globalAlpha*=a;noStroke();
  fill(0,0,0,70);ellipse(0,cell*.06,cell*.7,cell*.3);fill(110,170,96);ellipse(0,0,cell*.62,cell*.32);ellipse(cell*.32,0,cell*.24,cell*.22);
  stroke(110,170,96);strokeWeight(cell*.07);noFill();arc(-cell*.36,cell*.06,cell*.26,cell*.26,-HALF_PI,PI);noStroke();
  fill(214,186,96);ellipse(cell*.36,-cell*.07,cell*.09,cell*.09);fill(20);ellipse(cell*.37,-cell*.07,cell*.04,cell*.04);
  drawingContext.globalAlpha/=a;
  if(moving){noFill();stroke(170+Math.sin(clock*9)*60,220,255-Math.sin(clock*9)*60,110);strokeWeight(cell*.03);ellipse(0,0,cell*.78,cell*.44);}
  pop();
}
// A frost sentinel: a crystal statue and its gaze, a fan of pale light that glances off ice.
function drawEscapeSentinel(h,cell,clock){
  const glare=h.state==='glare',cool=h.state==='cool',a=glare?90+80*Math.abs(Math.sin(clock*18)):cool?14:26;
  noFill();stroke(190,236,255,a);strokeWeight(Math.max(1,cell*(glare?.06:.035)));
  for(const beam of h.beams||[]){beginShape();for(const q of beam)vertex(q.x*cell,q.y*cell);endShape();}
  push();translate(h.x*cell,h.y*cell);noStroke();fill(0,0,0,70);ellipse(0,cell*.12,cell*.6,cell*.26);
  fill(150,205,230);beginShape();for(let k=0;k<6;k++){const r=k*Math.PI/3-Math.PI/2;vertex(Math.cos(r)*cell*.3,Math.sin(r)*cell*.36-cell*.06);}endShape(CLOSE);
  fill(225,246,255,220);triangle(-cell*.12,-cell*.3,cell*.04,-cell*.36,-cell*.1,cell*.05);
  rotate(h.facing||0);fill(glare?255:200,glare?250:240,255);ellipse(cell*.14,0,cell*.12,cell*.08);pop();
}
// A cloud ray: a great translucent shape gliding high over everything.
function drawEscapeCloudRay(h,cell,clock){
  push();translate(h.x*cell,(h.y-1.1)*cell);rotate((h.facing||0)+HALF_PI);const flap=Math.sin(clock*1.6)*.12;noStroke();fill(214,226,240,120);
  beginShape();vertex(0,-cell*.9);bezierVertex(cell*(.9+flap),-cell*.5,cell*(1.5+flap),cell*.1,cell*.25,cell*.35);vertex(0,cell*.25);vertex(-cell*.25,cell*.35);bezierVertex(-cell*(1.5+flap),cell*.1,-cell*(.9+flap),-cell*.5,0,-cell*.9);endShape(CLOSE);
  stroke(214,226,240,110);strokeWeight(cell*.05);noFill();line(0,cell*.3,0,cell*1.2);noStroke();fill(160,180,205,140);for(const s of [-1,1])ellipse(s*cell*.16,-cell*.62,cell*.08,cell*.06);pop();
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
  if(h.state==='patrol'&&!escapeAidsHidden(g)){noStroke();fill(255,214,120,26);beginShape();vertex(h.x*cell,h.y*cell);
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
// The magpie: black and white with a blue-green sheen on the wings and a long tail. Perched, it
// shows where it is looking (a pale wedge, like the owl's beam but wider and shorter); in the air
// it flaps, and on the way home it carries whatever it stole in its beak.
function drawEscapeMagpie(h,cell,g){
  const perch=h.perch||h,flying=['fly','return','grab'].includes(h.state),t=g.elapsed;
  if(h.state==='patrol'&&!escapeAidsHidden(g)){noStroke();fill(214,230,255,24);beginShape();vertex(h.x*cell,h.y*cell);
    for(let a=-PI/6;a<=PI/6+.001;a+=PI/36){let reach=0;for(let d=.2;d<=6.5;d+=.2){if(!g.clear(h,{x:h.x+Math.cos(h.facing+a)*d,y:h.y+Math.sin(h.facing+a)*d},true))break;reach=d;}vertex((h.x+Math.cos(h.facing+a)*reach)*cell,(h.y+Math.sin(h.facing+a)*reach)*cell);}endShape(CLOSE);}
  // Its perch: a forked stick with a few stolen trinkets wedged in it.
  noStroke();fill(0,0,0,40);ellipse(perch.x*cell,(perch.y+.34)*cell,cell*.6,cell*.14);stroke(92,66,42);strokeWeight(Math.max(1,cell*.06));line(perch.x*cell,(perch.y+.34)*cell,perch.x*cell,(perch.y+.05)*cell);noStroke();
  for(const [dx,c] of [[-.16,[226,214,170]],[.14,[180,210,230]]]){fill(...c);ellipse((perch.x+dx)*cell,(perch.y+.3)*cell,cell*.1,cell*.08);}
  if(flying){fill(0,0,0,45);ellipse(h.x*cell,(h.y+.45)*cell,cell*.4,cell*.12);}
  push();translate(h.x*cell,(h.y-(flying?.12:0))*cell);const face=Math.cos(h.facing)>=0?1:-1;scale(1.25);
  if(flying){const flap=Math.sin(t*20+h.distanceMoved*3);fill(28,32,40);for(const s of [-1,1]){beginShape();vertex(0,-cell*.02);vertex(s*cell*.38,-cell*(.08+flap*.16));vertex(s*cell*.22,cell*.06);endShape(CLOSE);}
    fill(60,120,130,180);for(const s of [-1,1])ellipse(s*cell*.2,-cell*(.02+flap*.06),cell*.14,cell*.06);}
  fill(24,28,36);triangle(-face*cell*.1,0,-face*cell*.42,cell*.08,-face*cell*.38,cell*.16);
  fill(30,34,44);ellipse(0,0,cell*.34,cell*.24);fill(240,242,246);ellipse(face*cell*.02,cell*.04,cell*.18,cell*.12);
  if(!flying){fill(54,108,124);ellipse(-face*cell*.06,-cell*.01,cell*.18,cell*.1);fill(236,240,244);ellipse(-face*cell*.08,cell*.02,cell*.1,cell*.04);}
  fill(26,30,38);ellipse(face*cell*.15,-cell*.08,cell*.16,cell*.15);
  const caw=h.state==='caw',bob=caw?Math.sin(t*30)*cell*.01:0;
  fill(20,20,24);triangle(face*cell*.21,-cell*.1+bob,face*cell*.32,-cell*(caw?.12:.08),face*cell*.21,-cell*.06);if(caw)triangle(face*cell*.21,-cell*.07,face*cell*.3,-cell*.03,face*cell*.21,-cell*.05);
  fill(250,250,250);ellipse(face*cell*.18,-cell*.1,cell*.05,cell*.05);fill(10);ellipse(face*cell*.185,-cell*.1,cell*.025,cell*.025);
  if(h.carrying){fill(230,226,210);ellipse(face*cell*.3,-cell*.07,cell*.08,cell*.07);fill(255,255,255,180);ellipse(face*cell*.29,-cell*.08,cell*.03,cell*.03);}
  pop();
}
function drawEscapeMoth(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);const flap=.7+Math.sin(clock*14+h.distanceMoved*4)*.25,armed=h.state==='glimmer';
  for(const r of [5.2,3.6,2.2]){noStroke();fill(170,230,255,armed?26:16);ellipse(0,0,cell*r,cell*r);}noFill();stroke(190,240,255,60);strokeWeight(cell*.03);ellipse(0,0,cell*5.2,cell*5.2);
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
function drawEscapeMillipede(h,model,cell,watched=true,clock=0){
  // Rounded armour and two pairs of legs per segment. Gait is driven by
  // travelled distance, so observation freezes every foot as well as the head.
  // Out of Sally's gaze it is a dim shape creeping after her; once she faces it, it is solid and still.
  drawingContext.save();if(!watched)drawingContext.globalAlpha*=h.state==='follow'?.42+.1*Math.sin(clock*6):.38;
  // Thirty-odd segments a body: drawn straight onto the canvas, without p5's per-call state
  // bookkeeping, which made a room of millipedes slow.
  const ctx=drawingContext,n=model.joints.length;ctx.lineCap='round';
  for(let i=n-2;i>=0;i--){
    const p=model.joints[i],a=model.angles[i],w=.13*(1-i/n*.35),c=Math.cos(a),sn=Math.sin(a),px=p.x*cell,py=p.y*cell;
    const at=(lx,ly)=>[px+(lx*c-ly*sn)*cell,py+(lx*sn+ly*c)*cell];
    ctx.beginPath();
    for(const side of [-1,1])for(const offset of [-.022,.022]){
      const step=Math.sin(h.distanceMoved*14-i*.8+side)*.035;
      ctx.moveTo(...at(offset,side*w));ctx.lineTo(...at(offset-.045+step,side*(w+.08)));ctx.lineTo(...at(offset-.08+step,side*(w+.14)));
    }
    ctx.strokeStyle='rgb(190,132,72)';ctx.lineWidth=cell*.024;ctx.stroke();
    ctx.beginPath();ctx.ellipse(px,py,cell*.075,w*cell,a,0,Math.PI*2);ctx.fillStyle=i%2?'rgb(94,50,30)':'rgb(111,50,30)';ctx.fill();
    ctx.strokeStyle='rgb(39,23,20)';ctx.lineWidth=cell*.023;ctx.stroke();
    const [sx,sy]=at(.018,-w*.45);ctx.beginPath();ctx.ellipse(sx,sy,cell*.02,cell*.0325,a,0,Math.PI*2);ctx.fillStyle='rgba(199,130,64,0.706)';ctx.fill();
  }
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);noStroke();fill(145,78,36);ellipse(cell*.02,0,cell*.32,cell*.3);
  stroke(225,177,106);strokeWeight(cell*.025);for(const side of [-1,1]){line(cell*.13,side*cell*.09,cell*.29,side*cell*.2);line(cell*.29,side*cell*.2,cell*.39,side*cell*.16);}pop();
  drawingContext.restore();
}
function drawEscapeCricket(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  if(['dig','buried','rise'].includes(h.state)){
    const pulse=h.state==='rise'?1+Math.sin(clock*22)*.12:1;
    noStroke();fill(115,89,54);ellipse(0,0,cell*.65*pulse,cell*.5*pulse);fill(140,110,70);ellipse(-cell*.06,-cell*.05,cell*.36*pulse,cell*.24*pulse);
    stroke(194,155,95);strokeWeight(cell*.03);for(const side of [-1,1])line(-cell*.2,side*cell*.08,cell*.18,side*cell*.16);
    if(h.state==='rise'){noFill();stroke(245,190,98);ellipse(0,0,cell*1.35,cell*1.35);}pop();return;
  }
  const stride=h.distanceMoved*12,chirp=h.state==='chirp',buzz=chirp?Math.sin(clock*60)*.04:0;noStroke();fill(0,0,0,55);ellipse(-cell*.06,cell*.06,cell*.8,cell*.42);
  // Big folded jumping legs at the back, with spurs; four small legs in front.
  stroke(96,60,28);strokeWeight(cell*.075);for(const side of [-1,1]){const s=Math.sin(stride+side)*.06;line(-cell*.1,side*cell*.12,-cell*.38,side*cell*.3);strokeWeight(cell*.04);line(-cell*.38,side*cell*.3,-cell*(.12+s),side*cell*.36);strokeWeight(cell*.075);}
  strokeWeight(cell*.035);for(const side of [-1,1]){const s=Math.sin(stride*1.3+side)*.05;line(0,side*cell*.12,-cell*(.02+s),side*cell*.28);line(cell*.14,side*cell*.1,cell*(.3+s),side*cell*.24);}
  // Body: a dark abdomen with lighter bands, wings that buzz when it chirps, a round glossy head.
  stroke(70,44,20);strokeWeight(cell*.02);fill(110,72,36);ellipse(-cell*.14,0,cell*.6,cell*.3);
  push();rotate(buzz);fill(164,116,62,230);ellipse(-cell*.1,-cell*.05,cell*.5,cell*.16);ellipse(-cell*.1,cell*.05,cell*.5,cell*.16);pop();
  for(let k=0;k<3;k++)line(-cell*(.22+k*.08),-cell*.1,-cell*(.22+k*.08),cell*.1);
  fill(150,100,50);ellipse(cell*.1,0,cell*.2,cell*.26);fill(176,124,64);ellipse(cell*.22,0,cell*.24,cell*.24);noStroke();fill(214,168,104,180);ellipse(cell*.18,-cell*.06,cell*.08,cell*.05);
  escapeCreatureEye(cell*.27,-cell*.08,cell*.07,chirp);escapeCreatureEye(cell*.27,cell*.08,cell*.07,chirp);
  stroke(212,170,111);strokeWeight(cell*.018);noFill();for(const side of [-1,1])bezier(cell*.3,side*cell*.05,cell*.5,side*cell*.08,cell*.58,side*cell*.3,cell*.48,side*cell*.42);pop();
}
function drawEscapeNestMonster(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  const stride=h.distanceMoved*11,hot=h.state==='windup';
  if(h.kind==='spider'){
    noStroke();fill(0,0,0,60);ellipse(-cell*.02,cell*.05,cell*.8,cell*.64);
    // Eight jointed legs, thick at the knee, then the round patterned abdomen, the head with fangs
    // and a cluster of eyes (two big ones) that redden as it takes aim.
    for(const side of [-1,1])for(let i=0;i<4;i++){const root=(i-1.5)*.1,step=Math.sin(stride+i*PI+side)*.04,kx=(root-.12+step+(i-1.5)*.05)*cell,ky=side*cell*.3,fx=(root+.08+step+(i-1.5)*.16)*cell,fy=side*cell*.5;
      stroke(70,50,104);strokeWeight(cell*.06);line(root*cell+cell*.04,side*cell*.08,kx,ky);strokeWeight(cell*.04);line(kx,ky,fx,fy);noStroke();fill(140,112,184);ellipse(kx,ky,cell*.06,cell*.06);}
    stroke(60,40,92);strokeWeight(cell*.02);fill(96,62,136);ellipse(-cell*.16,0,cell*.5,cell*.42);noStroke();fill(hot?232:196,hot?120:150,hot?220:226);beginShape();vertex(-cell*.3,0);vertex(-cell*.18,-cell*.07);vertex(-cell*.06,0);vertex(-cell*.18,cell*.07);endShape(CLOSE);fill(140,104,180,150);ellipse(-cell*.2,-cell*.1,cell*.14,cell*.07);
    stroke(60,40,92);strokeWeight(cell*.02);fill(hot?210:150,hot?150:108,hot?240:188);ellipse(cell*.12,0,cell*.28,cell*.27);noStroke();fill(60,30,60);for(const side of [-1,1])ellipse(cell*.27,side*cell*.04,cell*.06,cell*.04);
    escapeCreatureEye(cell*.18,-cell*.05,cell*.07,hot);escapeCreatureEye(cell*.18,cell*.05,cell*.07,hot);fill(hot?255:240,hot?120:220,hot?120:255);for(const [x,y] of [[.11,-.09],[.11,.09],[.08,-.04],[.08,.04]])ellipse(cell*x,cell*y,cell*.035,cell*.035);
  }else{
    const lift=h.state==='leap'?Math.sin(Math.max(0,Math.min(1,1-(h.phaseUntil-clock)/.5))*PI)*cell*.2:0;
    noStroke();fill(8,19,16,120);ellipse(0,cell*.06,cell*.9,cell*.64);translate(0,-lift);
    // Folded back legs with webbed feet, short front legs, a warty back and a wide pale throat.
    stroke(52,90,58);strokeWeight(cell*.12);for(const side of [-1,1]){const step=Math.sin(stride+side)*.06;line(-cell*.12,side*cell*.18,-cell*.36,side*cell*.32);strokeWeight(cell*.08);line(-cell*.36,side*cell*.32,-cell*(.18+step),side*cell*.42);strokeWeight(cell*.07);line(cell*.14,side*cell*.15,cell*.28,side*cell*.32);strokeWeight(cell*.12);}
    noStroke();fill(76,124,74);for(const side of [-1,1]){for(const a of [-.4,0,.4])ellipse(-cell*(.18+.06*Math.cos(a))+cell*.0,side*cell*(.44+.04*Math.sin(a)),cell*.07,cell*.05);ellipse(cell*.3,side*cell*.34,cell*.07,cell*.06);}
    stroke(50,84,50);strokeWeight(cell*.022);fill(hot?148:104,hot?171:136,hot?70:74);ellipse(-cell*.06,0,cell*.7,cell*.52);noStroke();fill(hot?170:128,hot?190:160,hot?90:90);ellipse(-cell*.1,0,cell*.4,cell*.26);
    fill(80,108,56);for(const [x,y,r] of [[-.26,-.12,.07],[-.16,.14,.06],[-.02,-.16,.05],[-.3,.06,.05],[.04,.1,.05]])ellipse(cell*x,cell*y,cell*r,cell*r);
    stroke(50,84,50);strokeWeight(cell*.02);fill(140,160,86);ellipse(cell*.2,0,cell*.42,cell*.42);noStroke();fill(206,214,150);ellipse(cell*.28,0,cell*.2,cell*.28);
    for(const side of [-1,1]){fill(110,138,70);ellipse(cell*.22,side*cell*.15,cell*.2,cell*.17);escapeCreatureEye(cell*.24,side*cell*.15,cell*.14,hot,[226,196,90]);}
    stroke(50,70,40);strokeWeight(cell*.025);noFill();arc(cell*.3,0,cell*.18,cell*.26,-HALF_PI*.8,HALF_PI*.8);
  }
  if(h.state==='emerge'){noFill();stroke(240,178,121,160);strokeWeight(cell*.04);ellipse(0,0,cell,cell*.7);}pop();
}
function drawEscapeScorpion(h,cell,clock){
  // A buried scorpion shows only a low sand mound and a twitching tail tip.
  if(h.state==='buried'){push();translate(h.x*cell,h.y*cell);noStroke();fill(170,140,92,170);ellipse(0,cell*.05,cell*.8,cell*.42);fill(196,166,112,160);ellipse(-cell*.08,0,cell*.45,cell*.22);fill(150,92,80,90+60*Math.sin(clock*3));triangle(cell*.18,-cell*.08,cell*.26,-cell*.2,cell*.3,-cell*.06);pop();return;}
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);
  const hot=['windup','sting','raise'].includes(h.state)||h.tailUp,stride=h.distanceMoved*11;
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
  stroke(48,38,24);strokeWeight(cell*.07);
  for(const side of [-1,1])for(let i=0;i<3;i++){
    const root=(i-1)*.18,step=Math.sin(stride+i*Math.PI+side)*.055;
    line(root*cell,side*cell*.19,(root-.11+step)*cell,side*cell*.32);strokeWeight(cell*.05);line((root-.11+step)*cell,side*cell*.32,(root+.04+step)*cell,side*cell*.44);strokeWeight(cell*.07);
  }
  noStroke();fill(8,14,18,150);ellipse(-cell*.07,cell*.04,cell*.84,cell*.64);
  // Two shining wing cases split down the back, a darker shield behind the head, and a head with
  // curved horns that glow hot on the charge.
  const base=hot?[243,155,64]:[176,132,69],dark=hot?[190,96,40]:[122,88,44];
  stroke(58,40,22);strokeWeight(cell*.03);fill(...base);for(const side of [-1,1]){beginShape();vertex(cell*.06,0);bezierVertex(cell*.06,side*cell*.26,-cell*.36,side*cell*.3,-cell*.44,side*cell*.02);vertex(-cell*.44,0);endShape(CLOSE);}
  noStroke();fill(255,240,190,hot?120:90);for(const side of [-1,1])ellipse(-cell*.14,side*cell*.12,cell*.3,cell*.06);fill(...dark,120);for(const side of [-1,1])ellipse(-cell*.3,side*cell*.12,cell*.12,cell*.1);
  stroke(58,40,22);strokeWeight(cell*.03);fill(...dark);ellipse(cell*.1,0,cell*.22,cell*.36);fill(80,72,46);ellipse(cell*.26,0,cell*.2,cell*.24);
  escapeCreatureEye(cell*.3,-cell*.09,cell*.07,hot);escapeCreatureEye(cell*.3,cell*.09,cell*.07,hot);
  noFill();stroke(hot?255:200,hot?190:176,hot?110:110);strokeWeight(cell*.035);for(const side of [-1,1])bezier(cell*.34,side*cell*.04,cell*.46,side*cell*.06,cell*.5,side*cell*.18,cell*.46,side*cell*.24);pop();
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
function drawEscapeSnake(model,cell,state,sea=false,cobra=false,skin=null){
  const hot=state==='alert'||state==='chase';
  escapeBodyShadow(model,cell);
  // The king cobra is near-black with pale bands, and flares its hood when it rears or hunts.
  if(cobra){const head=model.joints[0],up=['rear','strike','chase','alert'].includes(state);if(up){push();translate(head.x*cell,head.y*cell);rotate(model.headAngle);noStroke();fill(40,36,28);ellipse(-cell*.12,0,cell*.42,cell*(state==='rear'?.86:.66));fill(214,190,96,170);ellipse(-cell*.14,0,cell*.16,cell*(state==='rear'?.5:.36));pop();}
    stroke(18,16,12);strokeWeight(cell*.035);fill(hot||up?58:44,hot||up?52:40,hot||up?36:30);escapeBodyShape(model,cell);noStroke();
    for(let i=2;i<model.joints.length-1;i+=2){const p=model.joints[i];push();translate(p.x*cell,p.y*cell);rotate(model.angles[i]);fill(222,204,140,150);ellipse(0,0,cell*.05,model.widths[i]*cell*2);pop();}
  }else if(skin){stroke(...skin.edge);strokeWeight(cell*.035);fill(...(hot?skin.hot:skin.body));escapeBodyShape(model,cell);}
  else{stroke(66,46,36);strokeWeight(cell*.035);fill(sea?65:hot?224:188,sea?171:hot?126:152,sea?187:hot?94:102);escapeBodyShape(model,cell);}
  // Small dorsal saddles and a light edge suggest scales without losing the
  // silhouette at phone size. The body narrows all the way to the tail tip.
  noStroke();
  for(let i=2;i<model.joints.length-2&&!cobra;i+=2){
    const p=model.joints[i];push();translate(p.x*cell,p.y*cell);rotate(model.angles[i]);
    fill(...(skin?(i%4===0?skin.band:hot?skin.hotSaddle:skin.saddle):[hot?157:122,hot?78:98,hot?57:66]),135);ellipse(0,0,cell*.095,model.widths[i]*cell*1.4);
    fill(236,207,157,120);ellipse(-cell*.025,-model.widths[i]*cell*.55,cell*.06,cell*.04);pop();
  }
  const head=model.joints[0];push();translate(head.x*cell,head.y*cell);rotate(model.headAngle);
  noStroke();if(cobra)fill(62,56,40);else if(skin)fill(...(hot?skin.hotHead:skin.head));else fill(sea?104:hot?236:210,sea?213:hot?143:174,sea?215:hot?105:122);ellipse(cell*.045,0,cell*.49,cell*.36);
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
// A bonus glow bug: a soft golden halo that breathes, a bright body and flickering wings.
function drawEscapeGlowbug(bug,cell,clock){
  const pulse=.5+.5*Math.sin(clock*4+bug.phase);push();translate(bug.x*cell,bug.y*cell);noStroke();
  for(const [r,a] of [[1.1,30],[.7,55],[.4,90]]){fill(255,226,120,a*(.6+pulse*.4));ellipse(0,0,cell*r*(.85+pulse*.15),cell*r*(.85+pulse*.15));}
  const flap=Math.sin(clock*30+bug.phase)*.5+.5;fill(255,255,240,140);for(const side of [-1,1])ellipse(side*cell*.09,-cell*.04,cell*.12,cell*(.06+flap*.06));
  fill(255,240,170);ellipse(0,0,cell*.13,cell*.18);fill(255,255,255,200);ellipse(0,cell*.05,cell*.07,cell*.06);pop();
}
// The lure bobs on a thin line like a lazy glow bug; it never flaps. When it springs, jaws
// burst from the water at the aim; while it sinks, only ripples are left.
function drawEscapeAngler(h,cell,clock){
  push();noStroke();
  if(h.state==='lurking'){
    const bob=Math.sin(clock*1.7+h.lure.x)*.07,pulse=.5+.5*Math.sin(clock*2.2+h.lure.y),lx=h.lure.x*cell,ly=(h.lure.y+bob)*cell;
    stroke(180,230,200,45);strokeWeight(Math.max(1,cell*.015));noFill();bezier(h.x*cell,h.y*cell,h.x*cell,(h.y-.4)*cell,lx,ly+cell*.5,lx,ly);noStroke();
    for(const [r,a] of [[1.1,28],[.7,50],[.4,85]]){fill(225,240,140,a*(.6+pulse*.4));ellipse(lx,ly,cell*r,cell*r);}
    fill(245,255,190);ellipse(lx,ly,cell*.15,cell*.15);fill(255,255,255,210);ellipse(lx,ly-cell*.03,cell*.06,cell*.06);
    fill(10,30,40,70);ellipse(h.x*cell,h.y*cell,cell*.5,cell*.22);
  }else if(h.state==='snap'&&h.aim){
    const t=Math.min(1,.4+(clock*8%1)*.2),ax=h.aim.x*cell,ay=h.aim.y*cell;
    fill(20,40,50,150);ellipse(ax,ay,cell*1.6,cell*1.2);
    fill(38,56,62);arc(ax,ay,cell*1.2*t,cell*1.3,PI,TWO_PI,CHORD);arc(ax,ay,cell*1.2*t,cell*1.3,0,PI,CHORD);
    fill(240,240,225);for(let k=-2;k<=2;k++){triangle(ax+k*cell*.12-cell*.05,ay-cell*.05,ax+k*cell*.12+cell*.05,ay-cell*.05,ax+k*cell*.12,ay+cell*.12);triangle(ax+k*cell*.12-cell*.05,ay+cell*.08,ax+k*cell*.12+cell*.05,ay+cell*.08,ax+k*cell*.12,ay-cell*.08);}
    fill(250,230,120);ellipse(ax-cell*.25,ay-cell*.38,cell*.12,cell*.12);ellipse(ax+cell*.25,ay-cell*.38,cell*.12,cell*.12);
  }else{
    noFill();stroke(150,210,220,90);strokeWeight(Math.max(1,cell*.02));const r=(clock*1.5)%1;ellipse(h.x*cell,h.y*cell,cell*(.4+r*.8),cell*(.2+r*.4));
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
// Sally's colours. Classic green is always hers; every area mastered (all stars) adds its own.
const ESCAPE_SKINS={
  classic:{name:'Classic green',body:[108,194,119],dark:[22,66,43],light:[192,229,146],spot:[43,120,66]},
  meadow:{name:'Buttercup',body:[214,196,92],dark:[92,72,22],light:[250,238,170],spot:[168,128,40]},
  garden:{name:'Moss and rose',body:[122,168,102],dark:[48,70,40],light:[236,170,184],spot:[190,92,118]},
  river:{name:'River blue',body:[92,170,198],dark:[22,58,78],light:[190,232,240],spot:[40,110,150]},
  ruins:{name:'Old stone',body:[160,156,140],dark:[60,56,50],light:[214,208,186],spot:[108,98,84]},
  quarry:{name:'Granite',body:[132,138,150],dark:[40,44,54],light:[200,204,214],spot:[84,90,104]},
  desert:{name:'Sandstorm',body:[218,170,108],dark:[100,62,28],light:[246,222,170],spot:[176,106,52]},
  marsh:{name:'Bog bloom',body:[112,150,82],dark:[44,58,30],light:[214,186,226],spot:[132,94,150]},
  jungle:{name:'Poison dart',body:[56,170,220],dark:[14,40,70],light:[250,220,80],spot:[12,22,40]},
  glow:{name:'Glowworm',body:[62,92,120],dark:[16,26,40],light:[150,255,226],spot:[90,230,200]},
  orchard:{name:'Apple',body:[200,78,72],dark:[86,24,24],light:[250,196,150],spot:[130,170,70]},
  coast:{name:'Coral reef',body:[240,140,120],dark:[100,46,40],light:[255,226,200],spot:[60,170,180]},
  hollow:{name:'Shed skin',body:[200,190,170],dark:[96,84,70],light:[246,240,226],spot:[150,136,116]},
  lantern:{name:'Lantern glow',body:[236,170,70],dark:[96,54,16],light:[255,236,160],spot:[190,100,40]},
  rooftops:{name:'Terracotta',body:[196,110,76],dark:[86,40,26],light:[240,196,160],spot:[150,70,46]},
  ants:{name:'Fire ant',body:[188,58,42],dark:[64,16,12],light:[244,150,96],spot:[40,20,18]},
  frost:{name:'Snowdrift',body:[214,232,246],dark:[70,96,124],light:[255,255,255],spot:[140,180,214]},
  vents:{name:'Ember',body:[70,62,64],dark:[20,16,18],light:[255,150,70],spot:[240,96,40]},
  moss:{name:'Old Moss',body:[96,140,70],dark:[34,52,30],light:[214,200,120],spot:[230,190,80]},
  home:{name:'Homecoming',body:[214,150,90],dark:[70,44,40],light:[255,226,170],spot:[120,90,150]},
  tide:{name:'Rockpool',body:[200,170,120],dark:[60,46,30],light:[150,230,230],spot:[240,110,90]},
  storm:{name:'Thundercloud',body:[96,108,124],dark:[30,34,44],light:[230,236,255],spot:[255,230,120]},
  grotto:{name:'Spore',body:[110,90,140],dark:[34,24,48],light:[190,240,210],spot:[214,70,58]},
  // Earned by freeing glow bugs (EscapeProgress GLOW_GIFTS).
  firefly:{name:'Firefly',body:[58,66,52],dark:[18,22,16],light:[250,236,140],spot:[255,206,80]},
  moonbeam:{name:'Moonbeam',body:[170,188,220],dark:[48,58,92],light:[240,248,255],spot:[140,228,214]}
};
// The companion: once 100 glow bugs are freed, one stays with Sally. It is small, dim and sea-green
// (never the gold of a glow bug to free), trailing behind her and bobbing, on the map and in escapes.
let escapeCompanion=null;
function drawEscapeCompanion(p,cell,clock){
  if(!escapeProgress.companion?.())return;
  if(!escapeCompanion||Math.hypot(escapeCompanion.x-p.x,escapeCompanion.y-p.y)>6)escapeCompanion={x:p.x-.6,y:p.y-.6};
  const c=escapeCompanion,tx=p.x+Math.cos(clock*.9)*.55,ty=p.y-.45+Math.sin(clock*1.3)*.2,k=Math.min(1,(deltaTime/1000)*2.5);c.x+=(tx-c.x)*k;c.y+=(ty-c.y)*k;
  const pulse=.5+.5*Math.sin(clock*2.2);push();translate(c.x*cell,c.y*cell);noStroke();
  for(const [r,a] of [[.7,26],[.38,60]]){fill(120,230,210,a*(.7+pulse*.3));ellipse(0,0,cell*r,cell*r);}
  const flap=Math.sin(clock*26)*.5+.5;fill(220,255,248,120);for(const side of [-1,1])ellipse(side*cell*.07,-cell*.03,cell*.09,cell*(.04+flap*.05));
  fill(190,255,236,230);ellipse(0,0,cell*.1,cell*.13);pop();
}
// Mix toward white (amount>0) or black (amount<0).
const escapeShade=(c,amount)=>c.map(v=>Math.round(amount>0?v+(255-v)*amount:v*(1+amount)));
let escapeSkinCache={id:null,palette:null};
function escapeSkinPalette(){
  const seasonal=typeof seasonProgress==='function'&&seasonProgress().activeSkin();
  const id=seasonal?seasonal.id:typeof escapeProgress!=='undefined'&&typeof EscapeWorld!=='undefined'?escapeProgress.skin(EscapeWorld.chapters):'classic';
  if(escapeSkinCache.id===id)return escapeSkinCache.palette;const k=seasonal?seasonal:ESCAPE_SKINS[id]||ESCAPE_SKINS.classic;
  const palette={body:k.body,dark:k.dark,light:k.light,spot:k.spot,leg:escapeShade(k.body,-.13),elbow:escapeShade(k.body,.12),head:escapeShade(k.body,.06),patch:escapeShade(k.light,-.02),toe:escapeShade(k.body,.15),toeLift:escapeShade(k.body,.35),nostril:escapeShade(k.spot,-.1)};
  escapeSkinCache={id,palette};return palette;
}
// Dig effects: drawn only (the run never sees them), from fixed per-dig seeds so they never jitter.
let escapeDigOut=null,escapeDigLast=null;
function escapeDigWas(g){const d=g.player.dig;if(escapeDigLast?.buried&&!d)escapeDigOut={at:g.elapsed,x:g.player.x,y:g.player.y,seed:Math.floor(escapeDigLast.start*97)};escapeDigLast=d?{start:d.start,buried:d.buried}:null;}
const escapeDigRand=(seed,i)=>{const v=Math.sin(seed*12.9898+i*78.233)*43758.5453;return v-Math.floor(v);};
// A puff of dust: soft clouds spreading out and fading over dur seconds.
function drawEscapeDust(px,py,age,dur,cell,n,seed){
  if(age<0||age>dur)return;const t=age/dur;noStroke();
  for(let i=0;i<n;i++){const a=escapeDigRand(seed,i)*TAU,d=cell*(.15+.55*escapeDigRand(seed,i+40))*(.3+t),r=cell*(.25+.25*escapeDigRand(seed,i+80))*(.6+t*.9);
    fill(178,148,108,150*(1-t)*(1-t));ellipse(px*cell+Math.cos(a)*d,py*cell+Math.sin(a)*d*.7-cell*.2*t,r,r*.8);}
}
// While digging: clods, pebbles and grit thrown out in little arcs, behind and to the sides, with dust
// gathering around her; at the moment she goes under, one big poof.
function drawEscapeDigFx(g,cell){
  const dig=g.player.dig,T=EscapeAdventure.DIG_TIME,age=g.elapsed-dig.start,x=g.player.x*cell,y=g.player.y*cell,seed=Math.floor(dig.start*97);noStroke();
  const N=30;for(let i=0;i<N;i++){const born=escapeDigRand(seed,i)*T*.95,life=.38+.3*escapeDigRand(seed,i+7),t=(age-born)/life;if(t<0||t>1)continue;
    const a=(escapeDigRand(seed,i+3)-.5)*3.6+(i%2?0:Math.PI),reach=cell*(.45+.75*escapeDigRand(seed,i+11)),h=cell*(.35+.5*escapeDigRand(seed,i+19))*4*t*(1-t);
    const px=x+Math.cos(a)*reach*t,py=y+Math.sin(a)*reach*t*.7-h,size=cell*(.05+.09*escapeDigRand(seed,i+23)),stone=i%5===0;
    fill(0,0,0,40*(1-t));ellipse(x+Math.cos(a)*reach*t,y+Math.sin(a)*reach*t*.7+cell*.04,size*1.1,size*.5);
    fill(...(stone?[150,146,138]:i%3?[122,88,54]:[96,70,44]),230);ellipse(px,py,size,size*(stone?.85:.75));}
  if(!dig.buried)drawEscapeDust(g.player.x,g.player.y,Math.min(age,T)*.5,T,cell,6,seed+5);
  drawEscapeDust(g.player.x,g.player.y+.2,age-T*.92,.75,cell,14,seed+9);
}
// Fresh dirt heaped around the hole, under Sally, growing as she digs.
function drawEscapeDigPile(g,cell,k){const x=g.player.x*cell,y=(g.player.y+.25)*cell,seed=Math.floor(g.player.dig.start*97);noStroke();
  fill(70,50,32,200*k);ellipse(x,y,cell*.5*k,cell*.3*k);
  for(let i=0;i<5;i++){const a=i/5*TAU+escapeDigRand(seed,i+90),d=cell*.3*k;fill(...(i%2?[132,96,60]:[112,82,52]),230*k);ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d*.6,cell*.26*k,cell*.18*k);}}
// Buried: the mound settles and, once the dust has cleared, two eyes open and peek about.
function drawEscapeBuried(g,cell){
  const x=g.player.x*cell,y=g.player.y*cell,since=g.elapsed-g.player.dig.start-EscapeAdventure.DIG_TIME,rise=Math.min(1,Math.max(0,since/.25)),seed=Math.floor(g.player.dig.start*97);noStroke();
  const my=y+cell*.22;fill(0,0,0,50);ellipse(x,my+cell*.14,cell*.78,cell*.26);
  for(const [dx,dy,w,h,c] of [[-.16,.04,.42,.3,116],[.15,.06,.4,.28,108],[0,.12,.5,.3,124],[-.02,-.06,.34,.3*rise+.06,138]]){fill(c,c*.73,c*.47);ellipse(x+dx*cell,my+dy*cell,w*cell,h*cell);}
  fill(166,128,86,180);ellipse(x-cell*.08,my-cell*.1*rise,cell*.2,cell*.08);
  for(let i=0;i<6;i++){fill(...(i%2?[96,70,44]:[150,146,138]));ellipse(x+(escapeDigRand(seed,i+50)-.5)*cell*.8,my+cell*.06+(escapeDigRand(seed,i+60)-.5)*cell*.26,cell*.07,cell*.055);}
  const open=Math.min(1,Math.max(0,(since-.55)/.2));if(open<=0)return;
  const cycle=(g.elapsed+seed*.13)%3.4,blink=cycle<.14||(cycle>1.6&&cycle<1.72),look=Math.sin(g.elapsed*.9+seed)*cell*.025,lid=blink?.12:open;
  for(const s of [-1,1]){const ex=x+s*cell*.1,ey=my-cell*.1;fill(146,108,70);ellipse(ex,ey+cell*.03,cell*.22,cell*.16);fill(122,222,120);ellipse(ex,ey,cell*.17,cell*.16*lid);
    if(!blink){fill(24,34,20);ellipse(ex+look,ey,cell*.08,cell*.12*lid);fill(255,255,255,210);ellipse(ex+look-cell*.025,ey-cell*.035*lid,cell*.03,cell*.03);}}
}

function drawEscapeLizard(model,cell,clock,swimming=false,tailless=false,face=null){
  const skin=escapeSkinPalette();
  // A tailless Sally keeps her body and a short stump; the rig itself is unchanged.
  if(tailless)model={...model,joints:model.joints.slice(0,9),angles:model.angles.slice(0,9),widths:model.widths.slice(0,8).concat([model.widths[8]*.55])};
  if(swimming){const p=model.joints[0];noFill();stroke(151,232,223,110);strokeWeight(cell*.035);ellipse(p.x*cell,p.y*cell,cell*.9,cell*.6);for(const side of [-1,1]){const q=model.joints[4],a=model.angles[4]+side*PI/2;stroke(...skin.leg);strokeWeight(cell*.065);line(q.x*cell,q.y*cell,(q.x+Math.cos(a)*.15-Math.cos(model.angles[4])*.16)*cell,(q.y+Math.sin(a)*.15-Math.sin(model.angles[4])*.16)*cell);}}
  escapeBodyShadow(model,cell);
  for(const leg of swimming?[]:model.legs){
    const r=leg.root,e={x:leg.elbow.x,y:leg.elbow.y-leg.lift*.02},f={x:leg.foot.x,y:leg.foot.y-leg.lift*.045};
    noStroke();fill(3,12,15,leg.lift>.25?75:130);ellipse(leg.foot.x*cell,leg.foot.y*cell,cell*.085,cell*.035);
    noFill();stroke(...skin.dark);strokeWeight(cell*.082);
    bezier(r.x*cell,r.y*cell,e.x*cell,e.y*cell,e.x*cell,e.y*cell,f.x*cell,f.y*cell);
    stroke(...skin.leg);strokeWeight(cell*.052);
    bezier(r.x*cell,r.y*cell,e.x*cell,e.y*cell,e.x*cell,e.y*cell,f.x*cell,f.y*cell);
    noStroke();fill(...skin.elbow);ellipse(e.x*cell,e.y*cell,cell*.055,cell*.055);
    // The lifting toes brighten and tuck slightly during the swing phase.
    stroke(...(leg.lift>.25?skin.toeLift:skin.toe));strokeWeight(cell*.02);
    const heading=leg.footAngle;
    for(const spread of [-.55,0,.55]){
      const a=heading+spread,length=.07*(1-leg.lift*.3);
      line(f.x*cell,f.y*cell,(f.x+Math.cos(a)*length)*cell,(f.y+Math.sin(a)*length)*cell);
    }
  }
  stroke(...skin.dark);strokeWeight(cell*.03);fill(...skin.body);escapeBodyShape(model,cell);
  // A dorsal stripe follows the articulated shoulders, hips and long tail.
  noFill();stroke(...skin.light,180);strokeWeight(cell*.035);beginShape();
  for(const p of model.joints.slice(0,tailless?8:10))curveVertex(p.x*cell,p.y*cell);endShape();
  noStroke();fill(...skin.spot,150);
  for(let i=2;i<8;i++)for(const side of [-1,1]){
    const p=model.joints[i],a=model.angles[i]+side*Math.PI/2,r=model.widths[i]*.55;
    ellipse((p.x+Math.cos(a)*r)*cell,(p.y+Math.sin(a)*r)*cell,cell*.045,cell*.037);
  }
  const head=model.joints[0];push();translate(head.x*cell,head.y*cell);rotate(face?.headAngle??model.headAngle);
  fill(...skin.head);ellipse(cell*.015,0,cell*.37,cell*.27);
  const blinkTime=clock%5.3,blink=face?.blink??(blinkTime>5.12?Math.sin((blinkTime-5.12)/.18*Math.PI):0);
  const look=face?.look||0,wide=face?.wide||0,winded=face?.mood==='winded',eyeHeight=.065*(1+wide*.3)*(winded?.75:1);
  for(const side of [-1,1]){
    fill(...skin.patch);ellipse(cell*.02,side*cell*.124,cell*(.12+wide*.018),cell*(.087+wide*.012));
    fill(237,229,166);ellipse(cell*.035,side*cell*.124,cell*(.075+wide*.012),cell*eyeHeight*(1-blink*.93));
    const px=cell*(.035+Math.cos(look)*.014),py=cell*(side*.124+Math.sin(look)*.021*(1-blink));
    fill(20,49,31);ellipse(px,py,cell*(.027+wide*.009),cell*.054*(winded?.75:1)*(1-blink*.93));
    if(blink<.7){fill(245,255,218);ellipse(px-cell*.012,py+side*cell*.01,cell*.018,cell*.018);}
    if(face?.mood==='nervous'||face?.mood==='startled'){
      stroke(...skin.dark);strokeWeight(cell*.014);line(-cell*.025,side*cell*.165,cell*.035,side*cell*.18);noStroke();
    }
    fill(...skin.nostril);ellipse(cell*.155,side*cell*.035,cell*.017,cell*.015);
  }
  // A tiny mouth changes expression; the head and body colliders never move.
  noFill();stroke(...skin.dark);strokeWeight(cell*.012);
  if(face?.smile){const chew=face.chew||0;bezier(cell*.09,-cell*.065,cell*(.17+chew*.012),-cell*.045,cell*(.17+chew*.012),cell*.045,cell*.09,cell*.065);}
  else if(winded)ellipse(cell*.15,0,cell*.03,cell*.065);
  else line(cell*.12,-cell*.04,cell*.14,cell*.04);
  pop();
}







function drawEscapeFish(h,cell,clock){
  push();translate(h.x*cell,h.y*cell);rotate(h.facing);const wag=Math.sin(h.distanceMoved*14+clock*2)*.08;
  noStroke();fill(12,45,65,110);ellipse(0,cell*.07,cell*.65,cell*.32);
  fill(h.state==='chase'?240:146,184,164);triangle(-cell*.2,0,-cell*.43,cell*(.2+wag),-cell*.43,cell*(-.2+wag));
  fill(207,233,213);ellipse(0,0,cell*.55,cell*.25);fill(82,153,164);triangle(-cell*.05,0,-cell*.14,-cell*.22,cell*.08,-cell*.06);triangle(-cell*.07,0,-cell*.16,cell*.18,cell*.05,cell*.07);
  fill(17,38,46);ellipse(cell*.16,-cell*.06,cell*.045,cell*.045);pop();
}

// The ladybird: a red dome with black spots ambling on six legs. Playing dead it lies on its back,
// a pale belly with legs folded and twitching; about to fly, its shell parts and its wings blur.
// Flown off, nothing is drawn until it lands again.
function drawEscapeLadybird(h,cell,clock){
  if(h.state==='away')return;const x=h.x*cell,y=h.y*cell,r=cell*.3;push();translate(x,y);rotate((h.facing??0)+Math.PI/2);noStroke();
  fill(0,0,0,55);ellipse(0,r*.25,r*2.1,r*1.4);
  if(h.state==='dead'){fill(206,52,44);ellipse(0,0,r*2,r*2.15);fill(52,40,36);ellipse(0,r*.05,r*1.62,r*1.8);fill(84,70,62);ellipse(0,-r*.55,r*.7,r*.45);
    stroke(28,22,20);strokeWeight(cell*.045);for(const s of [-1,1])for(const k of [-.7,0,.7]){const a=s>0?k:Math.PI-k,tw=Math.sin(clock*8+k*5+s*2)*.25,len=r*(1.12+.1*Math.sin(clock*11+k*3));line(Math.cos(a)*r*.55,Math.sin(a)*r*.55,Math.cos(a+tw)*len,Math.sin(a+tw)*len);}noStroke();pop();return;}
  const warn=h.state==='warn',open=warn?.35+.15*Math.sin(clock*40):0;
  if(warn){fill(235,230,220,120);for(const s of [-1,1])ellipse(s*r*.9,r*.15,r*1.5,r*.8+Math.sin(clock*60)*r*.3);}
  stroke(30,24,22);strokeWeight(cell*.03);const walk=Math.sin(clock*14+h.x*3)*r*.15;
  for(const s of [-1,1])for(const k of [-.5,0,.5])line(s*r*.6,k*r,s*r*1.15,k*r+(k===0?walk:-walk)*s);noStroke();
  fill(36,30,28);ellipse(0,-r*.95,r*.95,r*.7);fill(250,248,240);ellipse(-r*.22,-r*1.05,r*.22,r*.2);ellipse(r*.22,-r*1.05,r*.22,r*.2);
  for(const s of [-1,1]){push();rotate(s*open);fill(214,48,40);arc(0,0,r*2,r*2.2,s>0?-Math.PI/2:Math.PI/2,s>0?Math.PI/2:Math.PI*1.5);fill(30,24,22);for(const [dx,dy,k] of [[.45,-.35,.3],[.55,.3,.26],[.25,.6,.2]])ellipse(s*dx*r,dy*r,r*k,r*k);pop();}
  stroke(30,24,22);strokeWeight(cell*.025);line(0,-r*1.05,0,r*1.05);noStroke();fill(255,255,255,90);ellipse(-r*.35,-r*.45,r*.35,r*.2);
  pop();
}
