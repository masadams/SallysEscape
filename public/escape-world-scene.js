let escapeWorld=null,escapeLibraryOpen=false,escapeWorldHudSignature='',escapeWorldToastUntil=0,escapeWorldHinted=false,escapeWorldToastArea=null;
const ESCAPE_CACHE_VALUE=5;
function escapeRegionStars(chapter){const c=escapeWorld.chapters[chapter];let stars=0;for(let i=c.start;i<c.end;i++)stars+=escapeProgress.data.levels[EscapeCatalog.levels[i].id]?.stars||0;return {stars,max:(c.end-c.start)*3};}
let escapeJournalOpen=false;
// With a controller, X opens the map's panel (area travel, the Journal, the escape card and Main menu)
// for the stick to move through; B closes it again.
let escapeWorldPanelOpen=false;
function openEscapeWorldPanel(){if(gameState!=='escapeSelect'||escapeLibraryOpen)return;escapeWorldPanelOpen=true;escapeJournalOpen=true;renderEscapeWorldTotals();document.querySelector('.world-heading')?.classList.add('world-heading-open');document.getElementById('world-travel')?.focus();}
function closeEscapeWorldPanel(){escapeWorldPanelOpen=false;escapeJournalOpen=false;renderEscapeWorldTotals();document.querySelector('.world-heading')?.classList.remove('world-heading-open');document.activeElement?.blur?.();}
function renderEscapeWorldTotals(){
  const t=escapeProgress.totals(ESCAPE_CACHE_VALUE),el=document.getElementById('world-totals');if(!el)return;
  // Stars stay in view; the rest of the tally folds away under Journal so the panel stays small.
  el.innerHTML='<span title="Best stars across every escape">★ '+t.stars+' / '+t.maxStars+'</span><button type="button" id="world-journal" class="world-journal-toggle" aria-expanded="'+escapeJournalOpen+'">Journal '+(escapeJournalOpen?'▴':'▾')+'</button><span class="world-journal-item" title="Best treasure from every escape plus hidden caches">◆ '+t.treasure+' treasure</span><span class="world-journal-item" title="Escapes won on the very first attempt">✓ '+t.firstTries+' first '+(t.firstTries===1?'try':'tries')+'</span><span class="world-journal-item" title="Extra challenges completed">⚑ '+t.challenges+' / '+t.maxChallenges+'</span><span class="world-journal-item" title="Hidden world caches found">✦ '+t.caches+' / '+escapeWorld.caches.length+' caches</span><span class="world-journal-item" title="Golden flies caught and glow bugs freed">✧ '+t.goldflies+' golden flies & glow bugs</span><button type="button" id="world-story-open" class="world-journal-item world-bestiary-button">📜 Story '+(typeof EscapeStory==='undefined'?'':EscapeStory.CARDS.filter(c=>escapeProgress.storySeen(c.id)).length+' / '+EscapeStory.CARDS.length)+'</button><button type="button" id="world-bestiary-open" class="world-journal-item world-bestiary-button">📖 Bestiary '+EscapeBestiary.entries.filter(e=>escapeProgress.data.met.includes(e.kind)).length+' / '+EscapeBestiary.entries.length+'</button>';
  if(escapeProgress.unlockAll)el.innerHTML+='<span title="Turn test mode off in Admin">🔓 Test mode</span>';
  el.classList.toggle('world-journal-open',escapeJournalOpen);
  const story=document.getElementById('world-story-open');if(story)story.onclick=()=>{openEscapeStoryBook();document.activeElement?.blur?.();};
  const book=document.getElementById('world-bestiary-open');if(book)book.onclick=()=>{openEscapeBestiary();document.activeElement?.blur?.();};
  const journal=document.getElementById('world-journal');if(journal)journal.onclick=()=>{escapeJournalOpen=!escapeJournalOpen;renderEscapeWorldTotals();document.activeElement?.blur?.();};
  const library=document.getElementById('toolbar-levels'),waiting=EscapeCatalog.challenges.filter(c=>escapeProgress.challengeUnlocked(c.id)&&!escapeProgress.data.challenges[c.id]?.cleared).length;if(library)library.textContent='Escapes & challenges'+(waiting?' · ⚑ '+waiting+' open':'');
  for(const option of document.getElementById('world-travel')?.options||[]){const i=Number(option.value),r=escapeRegionStars(i);option.textContent=(i+1)+' · '+escapeWorld.chapters[i].name+' · '+(r.stars===r.max&&r.max?'♛ ':'★')+r.stars+'/'+r.max;}
  const tskin=document.getElementById('toolbar-skin');if(tskin){const chapters=EscapeWorld.chapters,owned=escapeProgress.skins(chapters);tskin.textContent='Colours: '+ESCAPE_SKINS[escapeProgress.skin(chapters)].name+(owned.length>1?' ('+owned.length+')':'');}
}
const ESCAPE_FOLK_TIPS=['Cracked walls are shortcuts. Face one and burrow!','Blue switches open blue gates. Watch where they lead.','A tongue can grab treasure across water. Walls still block it.','When the maze changes behind you, look for the new way out.','Some hatches want treasure before they will open.','From here on you can drop your tail once if something catches you.','Toads crouch before they leap. Leave their lane.','Crickets burst up from below. When the ground heaves, step away.','Your footprints glow in the dark, and moths love them.','Seeds grow cover, or brace a root door open.','Swimming is slow, but land hunters will not follow you in.','Pink regrowth bugs grow tails back. Every lizard here knows it.','Rival hunters fight when they meet. Let them.','Hawks hunt in the sun. Awnings and leaves keep you safe, or press X and keep still.','Ant columns march on worn trails and never stop. Cross in the gaps. Geckos steal—chase them down!','Cold rooms sap your warmth. Warm stones glow orange; snakes are sluggish on the ice.','Vents hiss before they blow. A jet will toss a hunter aside—lure one into the steam!','Puffballs burst into hiding clouds. Red caps fling you over gaps. And if the ground ripples, stand still: the moles feel every step.','Up here the wind wants you off the ledge: watch the streaks. When thunder rumbles, get stone between you and every hunter. And freeze for the bats.','The tide comes and goes. Land snakes cannot swim, but eels can: keep a tile back from the pools, or wait for low water.','Nearly home, dear. Everything you have learned is on this road: leaves, pebbles, patience. The old gate wants seven treasure.'];
// The bestiary page: a card per creature. Met ones show how they hunt and how to beat them;
// the rest show only where they live, as a reason to go and look.
let escapeBestiaryOpen=false;
// Sally's Burrow, home at last: a trophy room for everything gathered on the road.
function openEscapeTrophies(){
  const ui=document.getElementById('escape-world-ui');if(!ui)return;let page=document.getElementById('world-bestiary');
  if(!page){page=document.createElement('section');page.id='world-bestiary';page.className='world-bestiary';ui.appendChild(page);}
  const t=escapeProgress.totals(ESCAPE_CACHE_VALUE),p=escapeProgress,chapters=EscapeWorld.chapters,skins=p.skins(chapters),spots=escapeWorld.secrets.filter(s=>EscapeProgress.SECRET_RULES[s.id]),
    opened=spots.filter(s=>p.secretOpen(s.id,chapters)).length,hidden=EscapeCatalog.hidden||[],bonusDone=hidden.filter(l=>p.data.hidden[l.id]?.cleared).length;
  const card=(icon,title,value,note)=>'<article class="bestiary-card"><div class="bestiary-icon">'+icon+'</div><h3>'+escapeText(title)+'</h3><span class="bestiary-job">'+escapeText(value)+'</span>'+(note?'<p>'+escapeText(note)+'</p>':'')+'</article>';
  page.innerHTML='<div class="bestiary-head"><h2>Sally\u2019s Burrow</h2><span>Home at last. Everything from the road is on the shelves.</span><button type="button" id="world-bestiary-close" class="escape-secondary">Close</button></div><div class="bestiary-grid">'+
    card('★','Stars',t.stars+' / '+t.maxStars,t.stars>=t.maxStars?'Every star on the trail.':'')+
    card('🏁','Escapes cleared',t.cleared+' / '+t.levels,t.perfect+' perfect · '+t.firstTries+' first try')+
    card('💰','Treasure found',String(t.treasure),p.data.caches.length+' of '+escapeWorld.caches.length+' hidden caches found')+
    card('⚑','Challenges',p.challengesCleared()+' / '+EscapeCatalog.challenges.length)+
    card('📖','Creatures met',EscapeBestiary.entries.filter(e=>p.data.met.includes(e.kind)).length+' / '+EscapeBestiary.entries.length)+
    card('✨','Golden flies & glow bugs',String(t.goldflies),(next=>next?'Next at '+next.at+': '+(next.skin?ESCAPE_SKINS[next.skin].name+' colours':'a glow bug of her own'):'A glow bug of her own follows Sally.')(EscapeProgress.GLOW_GIFTS.find(g=>t.goldflies<g.at)))+
    card('🎨','Colours',skins.length+' / '+(chapters.length+2+EscapeProgress.GLOW_GIFTS.filter(g=>g.skin).length),skins.map(k=>ESCAPE_SKINS[k]?.name).filter(Boolean).join(', '))+
    card('🗝','Secret spots',opened+' / '+spots.length,bonusDone+' of '+hidden.length+' hidden escapes cleared')+
    '</div>';
  escapeBestiaryOpen=true;page.style.display='block';escapeSound('cache');
  const close=()=>{escapeBestiaryOpen=false;page.style.display='none';renderEscapeWorldTotals();};
  document.getElementById('world-bestiary-close').onclick=close;page.onkeydown=e=>{if(e.key==='Escape')close();};document.getElementById('world-bestiary-close').focus?.();
}
// Old Moss's Den: his lost things back on the shelf, a story, and his colours for Sally.
function openEscapeMossDen(){
  const ui=document.getElementById('escape-world-ui');if(!ui)return;let page=document.getElementById('world-bestiary');
  if(!page){page=document.createElement('section');page.id='world-bestiary';page.className='world-bestiary';ui.appendChild(page);}
  const fresh=escapeProgress.visitMossDen();
  page.innerHTML='<div class="bestiary-head"><h2>Old Moss\u2019s Den</h2><span>Spectacles on his nose, watch on its chain, scarf round his neck.</span><button type="button" id="world-bestiary-close" class="escape-secondary">Close</button></div>'+
    '<div class="bestiary-grid"><article class="bestiary-card"><div class="bestiary-icon">🐢</div><h3>Old Moss</h3><p>\u201cI was quick once, you know. Quick as a lizard, quiet as moss. That is how I got the name. These old things were all I kept from those days, and you brought every one of them home.\u201d</p>'+
    '<p class="bestiary-tip">\u201cTake my colours. Mossy green, with a little gold where the sun used to catch me.\u201d</p><small>'+(fresh?'New colours for Sally: Old Moss.':'Sally wears Old Moss\u2019s colours whenever she likes.')+'</small></article></div>';
  escapeBestiaryOpen=true;page.style.display='block';escapeSound('cache');renderEscapeWorldTotals();
  const close=()=>{escapeBestiaryOpen=false;page.style.display='none';renderEscapeWorldTotals();};
  document.getElementById('world-bestiary-close').onclick=close;page.onkeydown=e=>{if(e.key==='Escape')close();};document.getElementById('world-bestiary-close').focus?.();
}
function openEscapeBestiary(){
  const ui=document.getElementById('escape-world-ui');if(!ui)return;let page=document.getElementById('world-bestiary');
  if(!page){page=document.createElement('section');page.id='world-bestiary';page.className='world-bestiary';ui.appendChild(page);}
  const met=escapeProgress.data.met,homes=EscapeBestiary.homes(EscapeCatalog),chapterOf=i=>EscapeWorld.chapters.find(c=>i>=c.start&&i<c.end);
  const count=EscapeBestiary.entries.filter(e=>met.includes(e.kind)).length;
  page.innerHTML='<div class="bestiary-head"><h2>Bestiary</h2><span>'+count+' of '+EscapeBestiary.entries.length+' creatures met</span><button type="button" id="world-bestiary-close" class="escape-secondary">Close</button></div><div class="bestiary-grid">'+
    EscapeBestiary.entries.map(e=>{const home=homes[e.kind],where=home===undefined?((EscapeCatalog.hidden||[]).some(l=>(l.guards||[]).some(g=>g.kind===e.kind))?'a secret spot':'a place further along'):(chapterOf(home)?.name||'The trail')+' · escape '+(home+1);
      return met.includes(e.kind)?'<article class="bestiary-card"><div class="bestiary-icon">'+e.icon+'</div><h3>'+escapeText(e.name)+'</h3><span class="bestiary-job">'+escapeText(e.job)+'</span><p>'+escapeText(e.hunts)+'</p><p class="bestiary-tip">Tip: '+escapeText(e.tip)+'</p><small>First met in '+escapeText(where)+'</small></article>'
        :'<article class="bestiary-card bestiary-unknown"><div class="bestiary-icon">?</div><h3>Not met yet</h3><p>Lives in '+escapeText(where)+'.</p></article>';}).join('')+'</div>';
  escapeBestiaryOpen=true;page.style.display='block';
  const close=()=>{escapeBestiaryOpen=false;page.style.display='none';renderEscapeWorldTotals();};
  document.getElementById('world-bestiary-close').onclick=close;page.onkeydown=e=>{if(e.key==='Escape')close();};document.getElementById('world-bestiary-close').focus?.();
}
function escapeNpcLine(npc){
  const w=escapeWorld,c=w.chapters[npc.chapter],r=escapeRegionStars(npc.chapter),here=w.caches.filter(k=>k.chapter===npc.chapter),found=here.filter(k=>w.found.has(k.id)).length;
  const lines=[ESCAPE_FOLK_TIPS[npc.chapter]||'Mind the hunters out there.'];
  // Once the secret world is revealed, Old Moss asks for help finding what he lost.
  if(npc.name==='Old Moss'&&w.revealed()){const items=EscapeProgress.SECRET_RULES['moss-den'].items,left=items.filter(i=>!escapeProgress.data.items.includes(i)).length;
    return npc.name+': '+(left?['I have lost my spectacles, my pocket watch and my scarf somewhere on the trail. Ruins, jungle and snow, I think…','If you find my things, bring them to my den, by the Shedding Hollow. '+left+' still missing.'][Math.floor(w.elapsed/4.5)%2]:escapeProgress.data.secrets.includes('moss-den')?'Thank you, Sally. Wear my colours well.':'You found them all! Come to my den, by the Shedding Hollow. The door is open.');}
  if(found<here.length)lines.push('I saw something glinting in the far corners of '+c.name+'.');
  lines.push(r.stars===r.max?'Every star in '+c.name+'! The whole Overgrowth is talking about you.':r.stars?'You have '+r.stars+' of '+r.max+' stars here. Treasure and staying unseen earn the rest.':'Welcome to '+c.name+', Sally. The flags mark the escapes.');
  lines.push('Golden flies love warm paths. '+(mobile?'Run into one to catch it.':'Run into one, or press R to grab it.'));
  return npc.name+': '+lines[Math.floor(w.elapsed/4.5)%lines.length];
}
// Mastered areas lend Sally their colours; the button steps through the ones she owns.
function cycleEscapeSkin(){const chapters=EscapeWorld.chapters,owned=escapeProgress.skins(chapters),next=owned[(owned.indexOf(escapeProgress.skin(chapters))+1)%owned.length];
  escapeProgress.setSkin(next,chapters);renderEscapeWorldTotals();escapeWorldToast(owned.length>1?'Sally is wearing '+ESCAPE_SKINS[next].name+'.':'Master an area by earning every star there, or free 40 glow bugs, and Sally can wear new colours.');escapeSound('camo');document.activeElement?.blur?.();}
function escapeWorldToast(text,ms=3500){escapeWorldToastUntil=millis()+ms;const toast=document.getElementById('world-toast');if(toast)toast.textContent=text;}
function escapeWorldCaughtFly(){const n=escapeProgress.catchGoldfly(),gift=escapeProgress.glowGift(n);escapeWorldToast(gift?gift.text:'Golden fly caught! +2 treasure ('+n+' caught so far).');escapeSound('treasure');renderEscapeWorldTotals();}
function escapeWorldAnnounceRegions(){
  const before=escapeProgress.data.regionsSeen.length,open=escapeWorld.chapters.map((_,i)=>i).filter(i=>escapeWorld.regionOpen(i)),fresh=escapeProgress.announceRegions(open);
  // A brand new save or an older save meeting this feature learns its regions silently.
  if(before&&fresh.length){escapeWorldToast('A new area has opened: '+escapeWorld.chapters[fresh.at(-1)].name+'!');escapeSound('key');escapeMusic?.cue('area');return;}
  const challenges=escapeProgress.announceChallenges();
  if(challenges.length){const c=challenges.at(-1),level=EscapeCatalog.levels.find(l=>l.id===c.levelId);escapeWorldToast(challenges.length>1?challenges.length+' new challenges are open — look for the glowing ⚑ flags.':'New challenge open: '+c.name+' at '+level.name+'. Look for the glowing ⚑.');escapeSound('glimmer');}
}
// Old Moss's lost things, and the two secret caches (fairy ring, struck oak).
function escapeWorldFoundItem(item){
  if(!escapeProgress.findItem(item.id))return;const left=EscapeProgress.SECRET_RULES['moss-den'].items.filter(i=>!escapeProgress.data.items.includes(i)).length;
  escapeWorldToast('Found '+item.name+'!'+(left?' '+left+' more to find.':' That is everything: take them back to his den.'));escapeSound('cache');escapeWorld.terrainVersion++;
}
function escapeWorldFoundSecretCache(id){
  if(!escapeProgress.findSecretCache(id))return;escapeWorldToast((id==='fairy-ring'?'The fairy ring glows bright and opens!':'Lightning lights the oak, and a hollow full of treasure!')+' +'+EscapeProgress.SECRET_RULES[id].cache+' treasure.');
  escapeSound('cache');renderEscapeWorldTotals();
}
// The first time the Gilded Burrow opens, the rest of the secret world stirs too.
function escapeWorldAnnounceSecrets(){
  if(!escapeWorld?.revealed()||escapeProgress.data.masterySeen.includes('secrets'))return;escapeProgress.read();escapeProgress.data.masterySeen.push('secrets');escapeProgress.write();
  escapeWorldToast('Somewhere a door of gold has opened, and all over the map, other hidden places stir…');escapeMusic?.cue('secret');
}
// A cracked hedge gives way when Sally pushes into it.
function escapeWorldBumpSecret(door){
  if(!escapeProgress.openSecret(door.id))return;const s=escapeWorld.secrets.find(s=>s.id===door.id);
  escapeWorldToast('The cracked hedge gives way! A hidden path leads to '+s.name+'.');escapeSound('cache');escapeMusic?.cue('secret');escapeWorld.terrainVersion++;
}
function escapeWorldFoundCache(cache){
  if(!escapeProgress.findCache(cache.id))return;escapeWorldToast('Hidden cache found! +'+ESCAPE_CACHE_VALUE+' treasure for Sally’s shelf.');
  escapeSound('cache');renderEscapeWorldTotals();
}
function escapeMovement(){
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return {x:0,y:0,sprint:false,crawl:false,dig:false};
  const pad=typeof escapePad!=='undefined'?escapePad:{x:0,y:0};
  return {x:pad.x+touchStick.x+Number(gameKeyDown(39)||gameKeyDown(68)||touchInput.right)-Number(gameKeyDown(37)||gameKeyDown(65)||touchInput.left),y:pad.y+touchStick.y+Number(gameKeyDown(40)||gameKeyDown(83)||touchInput.down)-Number(gameKeyDown(38)||gameKeyDown(87)||touchInput.up),sprint:gameKeyDown(16)||touchInput.sprint||Boolean(pad.sprint),crawl:gameKeyDown(67)||touchInput.crawl||Boolean(pad.crawl),dig:gameKeyDown(69)||Boolean(touchInput.dig)||Boolean(pad.dig)};
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
  escapeLibraryOpen=false;escapeWorldPanelOpen=false;escapeWorldHudSignature='';
  if(!escapeWorld)escapeWorld=new EscapeWorld(id=>escapeProgress.unlocked(id),focusId,()=>escapeProgress.hiddenOpen(EscapeWorld.chapters),id=>escapeProgress.bonusOpen(id,EscapeWorld.chapters),id=>escapeProgress.secretOpen(id,EscapeWorld.chapters));
  else if(focusId){const node=escapeWorld.spotFor(focusId);if(node){escapeWorld.player.x=node.x;escapeWorld.player.y=node.y+1;escapeWorld.target=null;escapeWorld.motion.resetPlayer(escapeWorld.player);}}
  escapeWorld.found=new Set(escapeProgress.data.caches);escapeWorld.onCache=escapeWorldFoundCache;escapeWorld.onSecretBump=escapeWorldBumpSecret;escapeWorld.itemsFound=new Set(escapeProgress.data.items);escapeWorld.onItem=escapeWorldFoundItem;escapeWorld.onSecretCache=escapeWorldFoundSecretCache;escapeWorld.onFly=escapeWorldCaughtFly;
  escapeWorld.refreshRegions();document.getElementById('escape-select').style.display='none';document.getElementById('game-container').style.display='block';
  document.getElementById('game-area').classList.add('escape-world-open');
  mountEscapeChrome(true);document.getElementById('escape-world-ui').style.display='block';document.getElementById('escape-world-portals').style.display='block';
  document.getElementById('escape-world-ui').innerHTML=`<button id="world-home" class="world-home" title="Back to the main menu (Esc, or B on a controller)">← Main menu</button><div class="world-heading"><h2 id="world-region-name">Sunny Meadow</h2><label class="world-travel"><select id="world-travel" aria-label="Travel to an area">${escapeWorld.chapters.map((c,i)=>'<option '+(escapeWorld.regionOpen(i)?'':'disabled')+' value="'+i+'">'+(i+1)+' · '+c.name+'</option>').join('')}</select></label><div id="world-totals" class="world-totals"></div></div><p id="world-toast" class="world-toast" role="status" aria-live="polite"></p><article id="world-route" class="world-route"><span id="world-route-number">THE TRAIL</span><h3 id="world-route-name">A new escape awaits</h3><p id="world-route-brief"></p><p id="world-route-best"></p><p id="world-route-challenge" class="world-route-challenge"></p><button id="world-enter" class="escape-primary">Enter escape <span class="key-hint">[Enter]</span></button><button id="world-challenge" class="escape-secondary" style="display:none"></button></article>`;
  document.getElementById('world-travel').onchange=e=>{if(!escapeWorld.travel(Number(e.target.value)))renderEscapeWorldHUD();clearTouchInput();suppressHeldKeys();document.activeElement?.blur?.();};
  // Levels, colours and the main menu live in ☰ Menu; the controls show once as a passing tip.
  if(!escapeWorldHinted){escapeWorldHinted=true;escapeWorldToast((typeof escapePadActive==='function'&&escapePadActive()?'Stick to walk, A enters an escape, Y grabs golden flies, X opens the Journal and travel, LB/RB change area, B for the main menu.':typeof mobile!=='undefined'&&mobile?'Tap an entrance to walk there.':'WASD or arrows to walk, Shift to run, R grabs golden flies. Click an entrance to walk there.'),8000);}
  // On a phone these live in the ☰ menu instead of a panel over the map.
  for(const [id,fn] of [['toolbar-levels',openEscapeLibrary],['toolbar-skin',cycleEscapeSkin],['toolbar-home',leaveEscape]]){const b=document.getElementById(id);if(b)b.onclick=()=>{closeToolbarMenu?.();fn();};}
  // A tap on the area name opens travel and the journal; the panel is folded otherwise.
  document.getElementById('world-region-name').onclick=()=>document.querySelector('.world-heading')?.classList.toggle('world-heading-open');document.getElementById('world-enter').onclick=enterEscapeWorld;document.getElementById('world-home').onclick=leaveEscape;
  document.getElementById('escape-world-portals').innerHTML=escapeWorld.nodes.map(n=>'<button id="world-node-'+n.id+'" class="world-node" aria-label="'+(n.index+1)+' · '+n.name+'">'+(n.index+1)+'</button>').join('');
  for(const node of escapeWorld.nodes)document.getElementById('world-node-'+node.id).onclick=()=>{escapeWorld.walkTo(node.id);document.activeElement?.blur?.();};
  const size=canvasDimensions();resizeCanvas(size.width,size.height,true);clearTouchInput();suppressHeldKeys();updateToolbar();renderEscapeWorldTotals();escapeWorldAnnounceRegions();renderEscapeWorldHUD();
}
function openEscapeLibrary(){
  escapeLibraryOpen=true;clearTouchInput();suppressHeldKeys();document.getElementById('game-area').classList.remove('escape-world-open');
  document.getElementById('game-container').style.display='none';document.getElementById('escape-select').style.display='block';document.getElementById('world-list-back').focus();updateToolbar();
}
function enterEscapeWorld(){const id=escapeWorld?.enter();if(id==='room:sallys-burrow'){openEscapeTrophies();return;}if(id==='room:moss-den'){openEscapeMossDen();return;}if(id?.startsWith('hidden:'))startEscape({hiddenId:id.slice(7)});else if(id)startEscape({levelId:id});}
// The Gilded Burrow's three escapes, shown only to those who found it.
function renderEscapeHiddenHUD(node){
  document.getElementById('world-route')?.classList.remove('world-route-idle');
  const level=EscapeCatalog.hidden[node.index],saved=escapeProgress.data.hidden[level.id],signature='hidden:'+node.id+':'+(saved?.bestTime||'');if(signature===escapeWorldHudSignature)return;escapeWorldHudSignature=signature;
  if(level.secret){const spot=escapeWorld.secrets.find(s=>s.id===level.secret),row=EscapeCatalog.hidden.filter(l=>l.secret===level.secret);document.getElementById('world-region-name').textContent=spot.name;document.getElementById('world-route-number').textContent=spot.name.toUpperCase()+(row.length>1?' · '+(row.indexOf(level)+1)+' OF '+row.length:'')+(level.stars?' · '+level.stars+'★':'');}
  else if(level.bonus){document.getElementById('world-region-name').textContent='Bonus escape';document.getElementById('world-route-number').textContent='BONUS · EVERY STAR IN THE FIRST '+level.bonus.areas+' AREAS';}
  else{document.getElementById('world-region-name').textContent='The Gilded Burrow';document.getElementById('world-route-number').textContent='THE GILDED BURROW · '+(node.index+1)+' OF 3';}
  document.getElementById('world-route-name').textContent=level.name;document.getElementById('world-route-brief').textContent=level.brief;
  document.getElementById('world-route-best').textContent=saved?'★'.repeat(saved.stars)+'☆'.repeat(3-saved.stars)+' · Best '+saved.bestTime.toFixed(1)+'s'+(escapeProgress.isHard(level.id)?' · ◆ Hard mode':''):level.secret&&!escapeProgress.hiddenLevelOpen(level.id,EscapeWorld.chapters)?'This bed blooms at '+level.stars+' stars. You have '+escapeProgress.stars()+'.':level.secret?'A secret escape. Its record is kept on its own.':level.bonus?'Your reward for every star. Its record is kept on its own.':'Few have come this far.';
  document.getElementById('world-route-challenge').textContent='';document.getElementById('world-challenge').style.display='none';
}
function renderEscapeWorldHUD(){
  const w=escapeWorld,c=w.chapters[w.chapterAt()]||w.chapters[0],node=w.nearby();if(node?.hidden){renderEscapeHiddenHUD(node);return;}const level=node&&EscapeCatalog.levels[node.index],saved=node&&escapeProgress.data.levels[node.id],unlocked=node&&escapeProgress.unlocked(node.id);
  escapeWorldAnnounceSecrets();const door=w.nearbySecretDoor?.();if(door){const t=document.getElementById('world-toast'),info=escapeProgress.secret(door.id,EscapeWorld.chapters);if(t&&info?.hint)t.textContent=info.hint+(info.need>1?' ('+Math.min(info.have,info.need)+' / '+info.need+')':'');}
  const room=w.nearbyRoom?.();if(room){const t=document.getElementById('world-toast');if(t)t.textContent=room.name+'. Press Enter to go inside.';}
  if(w.revealed()){const ring=w.secrets.find(s=>s.id==='fairy-ring');if(!escapeProgress.data.secrets.includes('fairy-ring')&&Math.hypot(ring.x+.5-w.player.x,ring.y+.5-w.player.y)<3.5){const t=document.getElementById('world-toast');if(t)t.textContent=EscapeProgress.SECRET_RULES['fairy-ring'].clue+' Press R by each one.';}}
  const lock=w.nearbyBonusLock?.();if(lock){const t=document.getElementById('world-toast');if(t)t.textContent='A thorny hedge. Earn every star in the first '+lock.bonus.areas+' areas to open '+lock.name+'.';}
  // Passing news only: a door's or room's hint while Sally stands by it, the area's caches when she
  // arrives, and nothing at all the rest of the time.
  const toast=document.getElementById('world-toast'),ci=w.chapters.indexOf(c);
  if(toast&&ci!==escapeWorldToastArea){escapeWorldToastArea=ci;const here=w.caches.filter(k=>k.chapter===ci),found=here.filter(k=>w.found.has(k.id)).length;if(millis()>escapeWorldToastUntil)escapeWorldToast(c.name+': '+(found<here.length?found+' / '+here.length+' treasure caches found.':'every treasure cache found.'));}
  else if(toast&&!door&&!room&&!lock&&!(w.revealed()&&!escapeProgress.data.secrets.includes('fairy-ring')&&Math.hypot(w.secrets.find(s=>s.id==='fairy-ring').x+.5-w.player.x,w.secrets.find(s=>s.id==='fairy-ring').y+.5-w.player.y)<3.5)&&millis()>escapeWorldToastUntil)toast.textContent='';
  const challenge=node&&EscapeCatalog.challenges.find(ch=>ch.levelId===node.id),challengeSaved=challenge&&escapeProgress.data.challenges[challenge.id];
  const signature=JSON.stringify([c.name,node?.id,saved?.bestTime,saved?.revision,unlocked,challengeSaved?.bestTime]);if(signature===escapeWorldHudSignature)return;escapeWorldHudSignature=signature;
  document.getElementById('world-region-name').textContent=c.name;for(const option of document.getElementById('world-travel').options||[])option.disabled=!w.regionOpen(Number(option.value));document.getElementById('world-travel').value=String(w.chapters.indexOf(c));
  document.getElementById('world-route-number').textContent=node?'ESCAPE '+(node.index+1)+(unlocked?'':' · LOCKED'):'EXPLORE THE WORLD';
  document.getElementById('world-route-name').textContent=level?.name||'Choose your own direction';
  document.getElementById('world-route-brief').textContent=level?.brief||'No hunters here. Hunt for glinting treasure caches, or choose your next adventure.';
  document.getElementById('world-route-best').textContent=saved?escapeRecordSummary(level,saved):node&&!unlocked?escapeUnlockHint(level):node?'A new escape awaits.':'';
  const challengeLine=document.getElementById('world-route-challenge'),challengeButton=document.getElementById('world-challenge'),challengeOpen=challenge&&escapeProgress.challengeUnlocked(challenge.id);
  challengeLine.textContent=challenge?'⚑ Challenge · '+challenge.name+' — '+(challengeSaved?escapeRecordSummary(level,challengeSaved,true):challengeOpen?challenge.brief:escapeChallengeLock(challenge)):'';challengeLine.classList.toggle('world-challenge-new',Boolean(challengeOpen&&!challengeSaved));
  challengeButton.style.display=challengeOpen?'':'none';challengeButton.textContent=challengeSaved?'Replay challenge':'Try challenge';challengeButton.onclick=challengeOpen?()=>startEscape({challengeId:challenge.id}):null;
  // Away from an entrance there is nothing to enter, so the card steps aside and the map shows.
  document.getElementById('world-route')?.classList.toggle('world-route-idle',!node);
  const enter=document.getElementById('world-enter');enter.disabled=!unlocked;enter.innerHTML=unlocked?(saved?'Play again':'Enter escape')+' <span class="key-hint">[Enter]</span>':node?'Trail locked':'Find an entrance';
}
function playEscapeWorld(){
  if(!escapeWorld||escapeLibraryOpen)return;if(typeof tickEscapeStory==='function')tickEscapeStory();if(escapeBestiaryOpen||escapeStoryOpen){drawEscapeWorld();return;}if(!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){escapeWorld.advance(deltaTime/1000,escapeMovement());escapeFootsteps(escapeWorld.player);}drawEscapeWorld();renderEscapeWorldHUD();
}
// Per-tile floor and wall colours, averaged over nearby regions so borders blend over a few tiles.
let escapeWorldShadeCache=null;
function escapeWorldShades(w,palettes){
  if(escapeWorldShadeCache?.world===w)return escapeWorldShadeCache.shades;
  const theme=Array.from({length:w.height},(_,y)=>Array.from({length:w.width},(_,x)=>palettes[w.chapters[w.chapterAt({x,y})].theme])),R=3;
  const shades=theme.map((row,y)=>row.map((_,x)=>{const sum=[[0,0,0],[0,0,0]];let n=0;
    for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const p=theme[y+dy]?.[x+dx];if(!p)continue;const wgt=1/(1+dx*dx+dy*dy);n+=wgt;for(let k=0;k<2;k++)for(let c=0;c<3;c++)sum[k][c]+=p[k][c]*wgt;}
    return sum.map(c=>c.map(v=>Math.round(v/n)));}));
  escapeWorldShadeCache={world:w,shades};return shades;
}
// Ground, tracks and walls never change, so they are drawn once into 16-tile chunks and reused.
const ESCAPE_CHUNK=16;let escapeWorldChunks={key:null,map:new Map()};
function escapeWorldTerrain(w,palettes,cell,x1,x2,y1,y2){
  const key=cell+':'+w.terrainVersion;if(escapeWorldChunks.key!==key||escapeWorldChunks.world!==w)escapeWorldChunks={key,world:w,map:new Map()};
  for(let cy=Math.floor(y1/ESCAPE_CHUNK);cy<=Math.floor(y2/ESCAPE_CHUNK);cy++)for(let cx=Math.floor(x1/ESCAPE_CHUNK);cx<=Math.floor(x2/ESCAPE_CHUNK);cx++){
    const id=cx+','+cy;let chunk=escapeWorldChunks.map.get(id);
    if(!chunk){chunk=createGraphics(ESCAPE_CHUNK*cell,ESCAPE_CHUNK*cell);chunk.pixelDensity(1);chunk.push();chunk.translate(-cx*ESCAPE_CHUNK*cell,-cy*ESCAPE_CHUNK*cell);
      // Neighbouring tiles are drawn too, so crowns that overhang a chunk edge match on both sides.
      drawEscapeWorldTerrain(chunk,w,palettes,cell,Math.max(0,cx*ESCAPE_CHUNK-1),Math.min(w.width-1,cx*ESCAPE_CHUNK+ESCAPE_CHUNK),Math.max(0,cy*ESCAPE_CHUNK-1),Math.min(w.height-1,cy*ESCAPE_CHUNK+ESCAPE_CHUNK));chunk.pop();
      escapeWorldChunks.map.set(id,chunk);
      if(escapeWorldChunks.map.size>36){const [oldest,g]=escapeWorldChunks.map.entries().next().value;g.remove();escapeWorldChunks.map.delete(oldest);}
    }else{escapeWorldChunks.map.delete(id);escapeWorldChunks.map.set(id,chunk);}
    image(chunk,cx*ESCAPE_CHUNK*cell,cy*ESCAPE_CHUNK*cell);
  }
}
// Tiles the trail, entrances, signs, villagers and caches use; ground details keep clear of them.
let escapeWorldBusyCache=null;
function escapeWorldBusy(w){
  if(escapeWorldBusyCache?.world===w&&escapeWorldBusyCache.version===w.terrainVersion)return escapeWorldBusyCache.busy;
  const busy=new Set(),mark=(x,y,r=0)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)busy.add((Math.floor(x)+dx)+','+(Math.floor(y)+dy));};
  for(const t of w.tracks)for(const p of t.points)mark(p.x,p.y);
  for(const n of [...w.nodes,...w.bonusNodes,...w.hiddenNodes])mark(n.x,n.y,1);
  for(const s of [...w.signs,...w.npcs,...w.caches])mark(s.x,s.y,1);
  escapeWorldBusyCache={world:w,version:w.terrainVersion,busy};return busy;
}
// Small, still details that make each region's ground read as its own place: flowers in the
// meadow, reeds by the river, ripples in the sand, drifts in the snow, glowing caps in the dark.
function drawEscapeWorldProp(d,theme,px,py,cell,hash,p){
  const s=cell,r=(hash%5)/5;d.noStroke();
  const flower=(c)=>{d.fill(...c);for(let k=0;k<5;k++){const a=k*1.2566+r;d.ellipse(px+Math.cos(a)*s*.09,py+Math.sin(a)*s*.09,s*.11,s*.11);}d.fill(250,226,110);d.ellipse(px,py,s*.08,s*.08);};
  const reeds=(c=[72,112,70])=>{d.stroke(...c);d.strokeWeight(s*.045);for(const o of [-.12,0,.12])d.line(px+o*s,py+s*.2,px+o*s*1.6,py-s*.25-Math.abs(o)*s);d.noStroke();d.fill(110,78,48);d.ellipse(px+s*.01,py-s*.27,s*.06,s*.14);};
  const puddle=(c=[64,128,140,170])=>{d.fill(...c);d.ellipse(px,py,s*.7,s*.36);d.fill(200,235,240,90);d.ellipse(px-s*.12,py-s*.05,s*.22,s*.06);};
  const pebbles=(c)=>{d.fill(...c);for(const [ox,oy,w] of [[-.15,.05,.18],[.1,-.05,.14],[.16,.12,.1]])d.ellipse(px+ox*s,py+oy*s,w*s,w*s*.7);};
  const ripples=(c)=>{d.noFill();d.stroke(...c);d.strokeWeight(s*.035);for(const o of [-.15,.05,.25])d.arc(px,py+o*s,s*.8,s*.25,PI*1.1,PI*1.9);d.noStroke();};
  const cap=(c,glow)=>{if(glow){d.fill(...c,50);d.ellipse(px,py-s*.05,s*.6,s*.6);}d.fill(230,220,200);d.rect(px-s*.035,py-s*.05,s*.07,s*.18);d.fill(...c);d.arc(px,py-s*.04,s*.3,s*.24,PI,TWO_PI);d.fill(255,255,255,120);d.ellipse(px-s*.05,py-s*.1,s*.05,s*.04);};
  switch(theme){
    case 'meadow':hash%3?flower(hash%2?[250,250,240]:[246,206,90]):flower([200,170,240]);break;
    case 'garden':hash%3?flower([236,150,190]):pebbles([170,170,150]);break;
    case 'orchard':if(hash%3){d.fill(200,70,50);d.ellipse(px,py,s*.18,s*.18);d.fill(80,120,50);d.ellipse(px+s*.05,py-s*.09,s*.08,s*.05);}else flower([250,250,240]);break;
    case 'river':case 'marsh':hash%3?reeds():puddle();break;
    case 'lantern':hash%3?puddle([40,90,96,190]):(d.fill(70,130,80),d.arc(px,py,s*.5,s*.4,.4,TWO_PI-.1),d.fill(240,200,220),d.ellipse(px+s*.05,py-s*.03,s*.1,s*.1));break;
    case 'tide':
    case 'coast':hash%2?ripples([230,214,160,170]):(d.fill(244,226,214),d.arc(px,py,s*.26,s*.22,PI,TWO_PI),d.stroke(210,170,150),d.strokeWeight(s*.02),d.line(px,py,px-s*.06,py-s*.1),d.line(px,py,px+s*.06,py-s*.1),d.noStroke());break;
    case 'desert':hash%3?ripples([226,190,120,170]):(d.fill(99,140,80),d.rect(px-s*.06,py-s*.3,s*.12,s*.4,s*.06),d.rect(px+s*.04,py-s*.18,s*.14,s*.06,s*.03),d.rect(px+s*.12,py-s*.28,s*.06,s*.14,s*.03));break;
    case 'rooftops':d.stroke(...p[1],90);d.strokeWeight(s*.03);for(const o of [-.2,0,.2])d.line(px-s*.3,py+o*s,px+s*.3,py+o*s);d.noStroke();break;
    case 'ruins':case 'quarry':hash%2?pebbles([...p[1],200]):(d.fill(...p[2],160),d.rect(px-s*.2,py-s*.15,s*.4,s*.3,s*.04),d.stroke(...p[1],150),d.strokeWeight(s*.025),d.line(px-s*.1,py-s*.15,px+s*.05,py+s*.15),d.noStroke());break;
    case 'jungle':d.fill(60,120,64);for(let k=0;k<5;k++){const a=-PI/2+(k-2)*.5;d.ellipse(px+Math.cos(a)*s*.16,py+Math.sin(a)*s*.16+s*.05,s*.12,s*.3);}break;
    case 'glow':cap(hash%2?[120,255,230]:[180,140,255],true);break;
    case 'grotto':hash%3?cap(hash%2?[214,70,58]:[200,150,255],hash%2===0):(d.fill(236,226,196),d.ellipse(px,py,s*.36,s*.3),d.fill(206,190,150),d.ellipse(px-s*.06,py-s*.04,s*.06,s*.06));break;
    case 'hollow':hash%2?cap([230,120,170],false):(d.noFill(),d.stroke(230,214,200,170),d.strokeWeight(s*.04),d.arc(px,py,s*.4,s*.25,0,PI*1.5),d.noStroke());break;
    case 'ants':d.fill(...p[1]);d.ellipse(px,py+s*.06,s*.5,s*.24);d.fill(...p[2]);d.ellipse(px,py,s*.36,s*.18);d.fill(40,24,14);d.ellipse(px,py-s*.02,s*.08,s*.05);break;
    case 'frost':hash%2?(d.fill(250,252,255,200),d.ellipse(px,py,s*.8,s*.3),d.fill(255,255,255),d.ellipse(px-s*.1,py-s*.05,s*.4,s*.12)):(d.fill(190,226,240,170),d.ellipse(px,py,s*.6,s*.34),d.stroke(255,255,255,170),d.strokeWeight(s*.02),d.line(px-s*.15,py-s*.05,px+s*.1,py+s*.07),d.noStroke());break;
    case 'vents':d.stroke(60,36,30);d.strokeWeight(s*.05);d.line(px-s*.25,py,px,py-s*.05);d.line(px,py-s*.05,px+s*.2,py+s*.08);d.stroke(255,140,60,180);d.strokeWeight(s*.02);d.line(px-s*.2,py,px,py-s*.05);d.noStroke();break;
    default:pebbles([...p[1],160]);
  }
}
function drawEscapeWorldTerrain(d,w,palettes,cell,x1,x2,y1,y2){
  const shades=escapeWorldShades(w,palettes);
  // The grid defines collision, but the overworld reads as continuous terrain.
  // Region colours are blended across borders once and cached, so areas fade into each other.
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const c=w.chapters[w.chapterAt({x,y})],p=palettes[c.theme],tile=w.grid[y][x],floor=['.','L'].includes(tile);d.noStroke();d.fill(...shades[y][x][floor?0:1]);d.rect(x*cell,y*cell,cell+1,cell+1);
    if(tile==='P'){d.fill(39,113,132);d.rect(x*cell,y*cell,cell+1,cell+1);d.stroke(126,193,182,130);d.strokeWeight(cell*.04);d.line((x+.15)*cell,(y+.4)*cell,(x+.82)*cell,(y+.4)*cell);}
    if(floor&&(x*13+y*7)%9===0){d.stroke(...p[2],75);d.strokeWeight(cell*.045);d.line((x+.25)*cell,(y+.7)*cell,(x+.31)*cell,(y+.54)*cell);d.line((x+.45)*cell,(y+.71)*cell,(x+.42)*cell,(y+.58)*cell);}
  }
  // Soft patches of lighter and darker ground break up each clearing, and the ground darkens
  // under the canopy along every edge, so clearings read as sunlit hollows, not flat boxes.
  const open=(x,y)=>['.','L','P'].includes(w.grid[y]?.[x]);
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(!open(x,y))continue;const hash=(x*92821+y*68917)%997,p=palettes[w.chapters[w.chapterAt({x,y})].theme];d.noStroke();
    if(hash%7===0){const light=hash%2?[255,255,230,22]:[...p[1],30];d.fill(...light);d.ellipse((x+.5)*cell,(y+.5)*cell,cell*(1.8+hash%3*.5),cell*(1.2+hash%4*.3));}
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(w.grid[y+dy]?.[x+dx]==='#')for(let k=0;k<3;k++){const depth=.18*(k+1),a=(dy<0?20:13);d.fill(8,28,22,a);if(dx)d.rect((x+(dx>0?1-depth:0))*cell,y*cell,cell*depth,cell+1);else d.rect(x*cell,(y+(dy>0?1-depth:0))*cell,cell+1,cell*depth);}
  }
  // A winding track gives the main route a readable direction through open spaces.
  for(const track of w.tracks){for(const [color,weight]of track.side?[[[157,174,117,140],.28]]:[[[45,65,45,75],.78],[[206,187,131,210],.58]]){d.noFill();d.stroke(...color);d.strokeWeight(cell*weight);d.beginShape();const first=track.points[0],last=track.points.at(-1);d.curveVertex(first.x*cell,first.y*cell);for(const p of track.points)d.curveVertex(p.x*cell,p.y*cell);d.curveVertex(last.x*cell,last.y*cell);d.endShape();}}
  const busy=escapeWorldBusy(w);
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(w.grid[y][x]!=='.'||busy.has(x+','+y))continue;const hash=(x*7919+y*104729)%211;if(hash%6)continue;const c=w.chapters[w.chapterAt({x,y})];
    drawEscapeWorldProp(d,c.theme,(x+.3+(hash%5)*.1)*cell,(y+.35+(hash%3)*.15)*cell,cell*1.3,hash,palettes[c.theme]);}
  // Bushes and boulders spill over the clearing edges, so the borders are ragged rather than ruled.
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){if(w.grid[y][x]!=='.'||busy.has(x+','+y))continue;const hash=(x*31+y*57)%13;if(hash>4)continue;
    const walls=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>w.grid[y+dy]?.[x+dx]==='#');if(!walls.length)continue;
    const c=w.chapters[w.chapterAt({x,y})],p=palettes[c.theme],rocky=['ruins','quarry','ants','vents','desert','coast','rooftops','storm','tide'].includes(c.theme),[dx,dy]=walls[0],px=(x+.5+dx*.32)*cell,py=(y+.5+dy*.32)*cell,r=cell*(.75+hash*.08);d.noStroke();
    if(rocky){d.fill(7,26,19,45);d.ellipse(px,py+r*.2,r*1.05,r*.55);d.fill(...p[2]);d.ellipse(px,py,r,r*.7);d.fill(255,255,255,35);d.ellipse(px-r*.18,py-r*.15,r*.4,r*.18);}
    else{d.fill(0,0,0,40);d.ellipse(px+cell*.05,py+cell*.12,r,r*.85);d.fill(...p[1]);d.ellipse(px,py,r,r*.9);d.fill(...p[2],60);d.ellipse(px-r*.18,py-r*.2,r*.5,r*.42);if(hash===1){d.fill(236,140,180);for(const [ox,oy] of [[-.2,0],[.15,-.15],[.1,.2]])d.ellipse(px+ox*r,py+oy*r,cell*.13,cell*.13);}}
  }
  // Border trees, dune rocks and ruined masonry echo the level art without tiling the whole map.
  for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++){const tile=w.grid[y][x],c=w.chapters[w.chapterAt({x,y})],p=palettes[c.theme];
    if(tile==='#'){
      // Walls read as solid masses: a full feature along clearing edges, a continuous canopy or rock face inside.
      const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>['.','L'].includes(w.grid[y+dy]?.[x+dx])),px=(x+.5)*cell,py=(y+.5)*cell,hash=(x*73+y*151)%17,base=shades[y][x][1];d.noStroke();
      if(['ruins','quarry','ants','vents','storm'].includes(c.theme)){
        if(edge){d.fill(7,26,19,60);d.rect(px-cell*.48,py-cell*.2,cell*.96,cell*.72,cell*.14);d.fill(...p[2]);d.rect(px-cell*.46,py-cell*.44,cell*.92,cell*.78,cell*.14);d.fill(255,255,255,40);d.rect(px-cell*.4,py-cell*.4,cell*.8,cell*.08,cell*.04);d.stroke(...p[1],150);d.strokeWeight(cell*.035);if(hash%3)d.line(px-cell*.2,py-cell*.05,px+cell*.25,py-cell*.05);else d.line(px,py-cell*.4,px,py+cell*.3);}
        else{d.fill(base[0]-10,base[1]-10,base[2]-10);if(hash%4===0)d.ellipse(px+(hash%5-2)*cell*.08,py,cell*.3,cell*.2);}
      }else if(['desert','coast','rooftops'].includes(c.theme)){
        if(edge||hash%5===0){d.fill(7,26,19,45);d.ellipse(px,py+cell*.25,cell*.9,cell*.35);d.fill(...p[2]);d.ellipse(px,py,cell*.95,cell*.6);if(hash%2){d.stroke(99,132,76);d.strokeWeight(cell*.08);d.line(px,py,px,py-cell*.42);d.line(px,py-cell*.2,px+cell*.15,py-cell*.32);}}
        else{d.fill(base[0]+8,base[1]+6,base[2]+4,120);d.ellipse(px,py,cell*1.1,cell*.5);}
      }else{
        // Each crown is nudged and sized by a hash of its tile, so the canopy never reads as a grid.
        const r=(edge?1:1.3)*(.88+(hash%5)*.06),jx=((hash%7)-3)*cell*.07,jy=((hash*3%7)-3)*cell*.06,cx=px+jx,cy=py+jy,tone=(hash%3-1)*9;
        d.fill(0,0,0,edge?50:28);d.ellipse(cx+cell*.06,cy+cell*.14,cell*r,cell*r*.9);d.fill(p[1][0]+tone,p[1][1]+tone,p[1][2]+tone);d.ellipse(cx,cy-cell*.06,cell*r,cell*r*.95);
        d.fill(...p[2],edge?70:30);d.ellipse(cx-cell*.18*r,cy-cell*.24*r,cell*.55*r,cell*.48*r);if(hash%6===0){d.fill(...p[2],45);d.ellipse(cx+cell*.2,cy+cell*.05,cell*.3,cell*.26);}
      }
    }else if(tile==='L'){d.noStroke();d.fill(46,110,67,200);for(const [dx,dy]of [[.3,.4],[.65,.3],[.5,.65]])d.ellipse((x+dx)*cell,(y+dy)*cell,cell*.5,cell*.45);}
  }
}
// The panels over the map, re-measured a few times a second rather than every frame (measuring makes
// the browser lay the page out again, which is slow on a TV box).
let escapeWorldPanelCache={at:-1e9,rects:[]};
function escapeWorldPanels(){if(millis()-escapeWorldPanelCache.at>250)escapeWorldPanelCache={at:millis(),rects:[...document.querySelectorAll('.world-heading,.world-route,.world-toast,.world-home,.world-touch #movement-stick,.world-touch .direction-pad,.world-touch .ability-pad')].map(p=>p.getBoundingClientRect())};return escapeWorldPanelCache.rects.slice();}
// Whether an escape is open, remembered for half a second: the map asks for every flag each frame.
let escapeWorldUnlockCache={at:-1e9,map:new Map()};
function escapeWorldUnlocked(id){if(millis()-escapeWorldUnlockCache.at>500)escapeWorldUnlockCache={at:millis(),map:new Map()};const m=escapeWorldUnlockCache.map;if(!m.has(id))m.set(id,escapeProgress.unlocked(id));return m.get(id);}
// Writes to an element only what changed since the last frame.
function escapeWorldSet(el,key,value,apply){if(el['_w'+key]===value)return;el['_w'+key]=value;apply(value);}
function drawEscapeWorld(){
  const w=escapeWorld,cell=width<600?23:30,clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),cx=clamp(w.player.x,width/(2*cell),w.width-width/(2*cell)),cy=clamp(w.player.y,(height-90)/(2*cell),w.height-(height-90)/(2*cell)),ox=width/2-cx*cell,oy=(width<600?height*.42:(height+30)/2)-cy*cell;
  const bounds=document.getElementById('game-container').getBoundingClientRect?.()||{left:0,top:0,width,height},panels=escapeWorldPanels();
  // Flag number buttons are DOM elements above the canvas; hide any the villager's speech bubble covers.
  const talking=w.nearbyNpc();if(talking){const b=escapeSpeechRect(talking,cell),sx=v=>bounds.left+(v+ox)/width*bounds.width,sy=v=>bounds.top+(v+oy)/height*bounds.height;panels.push({left:sx(b.x),right:sx(b.x+b.w),top:sy(b.y),bottom:sy(b.y+b.h+cell*.3)});}
  const palettes={meadow:[[134,168,106],[51,86,65],[175,190,130]],garden:[[114,153,102],[50,83,63],[161,177,123]],river:[[103,156,127],[43,90,81],[150,182,139]],ruins:[[123,147,111],[73,94,82],[171,177,139]],quarry:[[155,138,104],[99,91,75],[192,173,132]],desert:[[201,162,99],[135,112,73],[232,193,125]],marsh:[[99,141,109],[40,81,72],[143,164,120]],jungle:[[77,125,91],[27,74,54],[122,153,94]],glow:[[38,77,82],[18,44,52],[96,168,151]],orchard:[[126,153,93],[56,93,53],[180,185,119]],coast:[[179,176,121],[56,118,110],[221,201,143]],hollow:[[128,104,112],[58,40,56],[176,140,150]],lantern:[[70,104,104],[24,52,58],[120,170,150]],rooftops:[[196,150,108],[132,78,56],[226,190,140]],ants:[[150,112,76],[78,52,34],[190,150,104]],frost:[[196,214,226],[96,124,146],[236,244,250]],vents:[[150,120,100],[86,60,50],[196,160,130]],grotto:[[96,92,124],[44,36,70],[150,214,190]],storm:[[118,130,140],[54,62,76],[178,192,204]],tide:[[198,186,140],[70,124,130],[232,220,176]],home:[[150,140,110],[70,62,74],[214,180,130]]};
  background(37,66,54);push();translate(ox,oy);
  const x1=Math.max(0,Math.floor(-ox/cell)),x2=Math.min(w.width-1,Math.ceil((width-ox)/cell)),y1=Math.max(0,Math.floor(-oy/cell)),y2=Math.min(w.height-1,Math.ceil((height-oy)/cell));
  escapeWorldTerrain(w,palettes,cell,x1,x2,y1,y2);
  // Only what is on screen (or nearly) is drawn; an escape's number button is still kept in step.
  const near=(x,y,m=3)=>x*cell+ox>-m*cell&&x*cell+ox<width+m*cell&&y*cell+oy>-m*cell&&y*cell+oy<height+m*cell;
  // A trail between two cleared escapes glows gold, so progress reads at a glance.
  for(const track of w.tracks){if(track.side||!escapeProgress.data.levels[track.to]?.cleared||!escapeProgress.data.levels[track.from]?.cleared)continue;noFill();stroke(246,206,96,190);strokeWeight(cell*.22);beginShape();const first=track.points[0],last=track.points.at(-1);curveVertex(first.x*cell,first.y*cell);for(const p of track.points)curveVertex(p.x*cell,p.y*cell);curveVertex(last.x*cell,last.y*cell);endShape();}
  // The next escape to play pulses.
  const next=w.nodes.find(n=>escapeWorldUnlocked(n.id)&&!escapeProgress.data.levels[n.id]?.cleared&&w.regionOpen(n.chapter));
  if(next){const pulse=(sin(w.elapsed*3)+1)/2;noFill();stroke(255,226,120,90+pulse*130);strokeWeight(cell*.09);ellipse(next.x*cell,next.y*cell,cell*(1.9+pulse*.6),cell*(1.9+pulse*.6));}
  for(const gate of w.gates){if(w.regionOpen(gate.chapter))continue;const x=gate.x+.5,y=gate.y+.5;stroke(224,187,99);strokeWeight(cell*.1);for(const d of [-1.2,-.8,-.4,0,.4,.8,1.2]){if(gate.vertical)line((x+d)*cell,(y-.32)*cell,(x+d)*cell,(y+.32)*cell);else line((x-.32)*cell,(y+d)*cell,(x+.32)*cell,(y+d)*cell);}noStroke();fill(245,223,151);textAlign(CENTER,CENTER);const need=EscapeCatalog.levels[w.chapters[gate.chapter].start]?.unlockChallenges;textSize(cell*(need?.42:.34));text(need?'⚑'+need:'◇',x*cell,y*cell);}
  for(const s of w.secrets||[])if(Math.abs(s.x-w.player.x)<width/cell+s.rx+4&&Math.abs(s.y-w.player.y)<height/cell+s.ry+4){if(s.id!=='sallys-burrow'&&!w.revealed?.())continue;drawEscapeWorldSecret(s,cell,w.elapsed,w.secretOpen?.(s.id));}
  for(const sign of w.signs)if(w.regionOpen(sign.chapter)&&near(sign.x,sign.y,4))drawEscapeWorldSign(sign,w.chapters[sign.chapter],escapeRegionStars(sign.chapter),cell);
  for(const cache of w.caches)if(w.regionOpen(cache.chapter)&&near(cache.x,cache.y))drawEscapeWorldCache(cache,w.found.has(cache.id),cell,w.elapsed,Math.hypot(cache.x+.5-w.player.x,cache.y+.5-w.player.y));
  for(const n of w.nodes){const x=n.x*cell,y=n.y*cell,saved=escapeProgress.data.levels[n.id],unlocked=escapeWorldUnlocked(n.id);
    if(!near(n.x,n.y)){const button=document.getElementById('world-node-'+n.id);if(button)escapeWorldSet(button,'display','none',v=>{button.style.display=v;});continue;}
    noStroke();fill(48,82,62,75);ellipse(x,y+cell*.35,cell*1.5,cell*.55);fill(unlocked?189:139,unlocked?202:156,unlocked?142:131);rect(x-cell*.65,y-cell*.65,cell*1.3,cell*1.3,cell*.22);fill(unlocked?55:100,unlocked?99:117,unlocked?70:99);rect(x-cell*.38,y-cell*.45,cell*.76,cell*.95,cell*.35);stroke(101,110,79);strokeWeight(cell*.045);line(x+cell*.5,y+cell*.3,x+cell*.5,y-cell*.7);noStroke();fill(...(saved?[70,147,90]:unlocked?[221,139,69]:[118,134,115]));triangle(x+cell*.5,y-cell*.7,x+cell*1.05,y-cell*.48,x+cell*.5,y-cell*.26);
    if(saved){textSize(cell*.36);textAlign(CENTER,CENTER);noStroke();const lit=saved.perfect?[255,196,40]:saved.firstTry?[120,236,190]:[255,214,92];if(saved.perfect){const fx=x+cell*.75,fy=y-cell*.95;stroke(110,70,10);strokeWeight(cell*.05);line(fx,fy,fx,fy+cell*.6);noStroke();fill(255,206,60);triangle(fx,fy,fx+cell*.42,fy+cell*.13,fx,fy+cell*.26);fill(255,240,170,120);ellipse(fx+cell*.12,fy+cell*.12,cell*.5,cell*.5);}for(let i=0;i<3;i++){fill(...(i<saved.stars?lit:[40,58,46,160]));text('★',x+(i-1)*cell*.36,y+cell*1.02);}if(saved.firstTry){fill(120,236,190);ellipse(x+cell*.72,y+cell*.62,cell*.36,cell*.36);fill(20,60,44);textSize(cell*.26);text('✓',x+cell*.72,y+cell*.63);}}
    const challenge=EscapeCatalog.challenges.find(c=>c.levelId===n.id);if(challenge){const done=escapeProgress.data.challenges[challenge.id]?.cleared,gate=escapeProgress.challengeGate(challenge.id),open=gate.open,bx=x-cell*.72,by=y-cell*.7;noStroke();
      // An open, unbeaten challenge pulses so it is easy to spot from across the map.
      if(open&&!done){const pulse=(sin(w.elapsed*4)+1)/2,fy=by-cell*.25-pulse*cell*.12;fill(255,214,92,60+pulse*90);ellipse(bx,fy,cell*(.95+pulse*.4),cell*(.95+pulse*.4));fill(255,226,120);stroke(120,60,10);strokeWeight(cell*.05);ellipse(bx,fy,cell*.72,cell*.72);noStroke();fill(120,60,10);textSize(cell*.44);text('⚑',bx,fy+cell*.02);fill(226,74,60);ellipse(bx+cell*.36,fy-cell*.32,cell*.32,cell*.32);fill(255);textSize(cell*.26);text('!',bx+cell*.36,fy-cell*.31);}
      else{fill(...(done?[255,205,86]:[120,132,118]));ellipse(bx,by,cell*.42,cell*.42);fill(...(done?[110,70,20]:[55,70,60]));textSize(cell*.26);text('⚑',bx,by+cell*.01);if(!done&&gate.cleared){const label=gate.stars+'/'+gate.need+'★';textSize(cell*.28);fill(30,48,38,210);rect(bx-textWidth(label)/2-cell*.08,by-cell*.62,textWidth(label)+cell*.16,cell*.34,cell*.1);fill(255,236,170);text(label,bx,by-cell*.45);}}}
    const button=document.getElementById('world-node-'+n.id),sx=x+ox,sy=y+oy,px=bounds.left+sx/width*bounds.width,py=bounds.top+sy/height*bounds.height,covered=panels.some(p=>px+20>p.left&&px-20<p.right&&py+20>p.top&&py-20<p.bottom);const shown=!covered&&w.regionOpen(n.chapter)&&sx>=30&&sx<=width-30&&sy>=30&&sy<=height-30;escapeWorldSet(button,'display',shown?'block':'none',v=>{button.style.display=v;});if(shown){escapeWorldSet(button,'left',(sx/width*100).toFixed(2)+'%',v=>{button.style.left=v;});escapeWorldSet(button,'top',(sy/height*100).toFixed(2)+'%',v=>{button.style.top=v;});}const state=saved?'world-cleared':unlocked?'world-available':'world-locked';escapeWorldSet(button,'state',state,v=>{button.className='world-node '+v;button.setAttribute('aria-label',(n.index+1)+' · '+n.name+(saved?' · cleared':unlocked?' · available':' · locked'));});
  }
  for(const n of w.bonusNodes){const open=w.bonusOpen(n.id),x=n.x*cell,y=n.y*cell,saved=escapeProgress.data.hidden[n.id],pulse=(sin(w.elapsed*1.6)+1)/2;
    if(!open){const lx=n.lock.x*cell,ly=n.lock.y*cell;noStroke();fill(46,92,52);rect(lx-cell*.1,ly,cell*1.2,cell,cell*.2);fill(196,70,90);for(let k=0;k<3;k++)ellipse(lx+cell*(.2+k*.3),ly+cell*(.3+(k%2)*.4),cell*.16,cell*.16);}
    noStroke();fill(160,220,120,open?40+pulse*50:18);ellipse(x,y,cell*(1.8+pulse*.3),cell*(1.8+pulse*.3));fill(44,84,40);rect(x-cell*.5,y-cell*.5,cell,cell,cell*.2);fill(open?190:110,open?230:140,open?140:110);rect(x-cell*.38,y-cell*.38,cell*.76,cell*.76,cell*.16);fill(30,60,30);textAlign(CENTER,CENTER);textSize(cell*.42);text(open?(n.bonus.areas>5?'✹':'✣'):'🔒',x,y);
    if(saved){textSize(cell*.36);for(let i=0;i<3;i++){fill(...(i<saved.stars?[255,196,40]:[40,58,46,160]));text('★',x+(i-1)*cell*.36,y+cell*1.02);}}}
  // Secret doors: a cracked hedge to push through, or a thorny hedge until the spot opens.
  for(const d of w.secretDoors||[])if(!w.secretOpen(d.id)&&(d.id==='sallys-burrow'||w.revealed())){const x=d.x*cell,y=d.y*cell,bump=EscapeProgress.SECRET_RULES[d.id]?.bump;noStroke();fill(46,92,52);rect(x-cell*.05,y-cell*.05,cell*1.1,cell*1.1,cell*.25);
    if(bump){stroke(24,48,28);strokeWeight(cell*.06);line(x+cell*.3,y+cell*.1,x+cell*.5,y+cell*.45);line(x+cell*.5,y+cell*.45,x+cell*.35,y+cell*.8);line(x+cell*.5,y+cell*.45,x+cell*.75,y+cell*.6);noStroke();}
    else{fill(196,70,90);for(let k=0;k<3;k++)ellipse(x+cell*(.2+k*.3),y+cell*(.3+(k%2)*.4),cell*.16,cell*.16);}}
  for(const n of w.secretNodes||[]){if(!w.secretOpen(n.secret))continue;const x=n.x*cell,y=n.y*cell,saved=escapeProgress.data.hidden[n.id],open=escapeProgress.hiddenLevelOpen(n.id,EscapeWorld.chapters),pulse=(sin(w.elapsed*1.8+n.index)+1)/2;
    noStroke();fill(150,200,255,open?40+pulse*50:16);ellipse(x,y,cell*(1.8+pulse*.3),cell*(1.8+pulse*.3));fill(40,60,96);rect(x-cell*.5,y-cell*.5,cell,cell,cell*.2);fill(open?170:100,open?200:120,open?255:140);rect(x-cell*.38,y-cell*.38,cell*.76,cell*.76,cell*.16);fill(24,36,70);textAlign(CENTER,CENTER);textSize(cell*.42);text(open?'✿':'🔒',x,y);
    if(!open&&n.stars){textSize(cell*.28);fill(30,48,38,210);const label=n.stars+'★';rect(x-cell*.4,y-cell*.95,cell*.8,cell*.34,cell*.1);fill(255,236,170);text(label,x,y-cell*.78);}
    if(saved){textSize(cell*.36);for(let i=0;i<3;i++){fill(...(i<saved.stars?[255,196,40]:[40,58,46,160]));text('★',x+(i-1)*cell*.36,y+cell*1.02);}}}
  // Old Moss's lost things glint where they fell; the fairy caps glow in turn; the oak shows only in a flash.
  if(w.revealed?.()){
    for(const it of w.lostItems)if(!w.itemsFound.has(it.id)){const x=(it.x+.5)*cell,y=(it.y+.5)*cell,tw=(sin(w.elapsed*3+it.x)+1)/2;noStroke();fill(255,240,180,40+tw*60);ellipse(x,y,cell*1.1,cell*1.1);textAlign(CENTER,CENTER);textSize(cell*.6);text({spectacles:'👓','pocket-watch':'⌚',scarf:'🧣'}[it.id],x,y);}
    if(!escapeProgress.data.secrets.includes('fairy-ring')){const lit=Math.floor(w.elapsed*1.2)%(w.fairyCaps.length+1);w.fairyCaps.forEach((c,i)=>{const x=(c.x+.5)*cell,y=(c.y+.5)*cell,on=i===lit;noStroke();fill(200,170,255,on?150:30);ellipse(x,y,cell*(on?1.2:.8),cell*(on?1.2:.8));fill(240,230,210);rect(x-cell*.05,y,cell*.1,cell*.22);fill(on?250:190,on?120:90,on?255:200);arc(x,y+cell*.02,cell*.5,cell*.4,PI,TWO_PI);});}
    if(w.stormFlash()){const c=w.chapters.find(c=>c.theme==='storm');noStroke();fill(235,240,255,70);rect((c.x-8)*cell,(c.y-7)*cell,17*cell,15*cell);if(!escapeProgress.data.secrets.includes('struck-oak')){const x=(w.oak.x+.5)*cell,y=(w.oak.y+.5)*cell;fill(255,236,140,200);ellipse(x,y-cell*.2,cell*.9,cell*.9);textAlign(CENTER,CENTER);textSize(cell*.5);text('✦',x,y-cell*.2);}}
  }
  if(w.hiddenCarved)for(const n of w.hiddenNodes){const x=n.x*cell,y=n.y*cell,saved=escapeProgress.data.hidden[n.id],pulse=(sin(w.elapsed*2+n.index)+1)/2;noStroke();fill(255,206,90,40+pulse*50);ellipse(x,y,cell*(1.8+pulse*.3),cell*(1.8+pulse*.3));fill(120,86,24);rect(x-cell*.5,y-cell*.5,cell,cell,cell*.2);fill(255,214,100);rect(x-cell*.38,y-cell*.38,cell*.76,cell*.76,cell*.16);fill(90,60,10);textAlign(CENTER,CENTER);textSize(cell*.42);text('✦',x,y);
    if(saved){textSize(cell*.36);for(let i=0;i<3;i++){fill(...(i<saved.stars?[255,196,40]:[40,58,46,160]));text('★',x+(i-1)*cell*.36,y+cell*1.02);}}}
  for(const npc of w.npcs)if(w.regionOpen(npc.chapter)&&near(npc.x,npc.y,4))drawEscapeWorldNpc(npc,cell,w.elapsed);
  // Regions not yet opened sit under drifting cloud that clears when they open.
  for(const [i,c] of w.chapters.entries())if(!w.regionOpen(i)&&Math.abs(c.x-w.player.x)<width/cell+10&&Math.abs(c.y-w.player.y)<height/cell+10)drawEscapeRegionCloud(c,i,cell,w.elapsed);
  if(w.lick){const head=w.motion.lizard.joints[0];stroke(232,110,140);strokeWeight(cell*.08);line(head.x*cell,head.y*cell,w.lick.x*cell,w.lick.y*cell);}
  drawEscapeLizard(w.motion.lizard,cell,w.motion.clock);drawEscapeCompanion(w.player,cell,w.elapsed);
  for(const [i,c] of w.chapters.entries())if(w.regionOpen(i)&&Math.abs(c.x-w.player.x)<width/cell/2+14&&Math.abs(c.y-w.player.y)<height/cell/2+12)drawEscapeWorldCritters(c,i,w,cell);
  if(w.fly)drawEscapeGoldfly(w.fly,cell,w.elapsed);
  // Cloud shadows drift across the whole trail.
  noStroke();for(let i=0;i<7;i++){const cx=((i*41+w.elapsed*.35)%(w.width+24))-12,cy=(i*13+7)%w.height;fill(10,30,25,26);ellipse(cx*cell,cy*cell,cell*7,cell*3.4);ellipse((cx+2.6)*cell,(cy-.8)*cell,cell*5,cell*2.6);}
  if(talking)drawEscapeSpeech(talking,escapeNpcLine(talking),cell);
  pop();
  drawEscapeWorldWeather(w);
  // A slow day and night cycle tints the trail every four minutes.
  const night=(1-Math.cos(w.elapsed/240*Math.PI*2))/2;if(night>.02){noStroke();fill(12,22,58,110*night);rect(0,0,width,height);}
}
// Weather: each region has its own, drawn over the map in screen space. Rain comes and goes in
// fronts, snow thickens and thins, leaves and petals drift on the breeze, dust blows across the
// sand and roofs, steam rises from the vents, spores glow in the dark places. Particles keep the
// kind they were born with, so walking between regions crossfades one weather into the next.
const ESCAPE_WEATHER={meadow:'petals',garden:'petals',orchard:'blossom',ruins:'leaves',river:'rain',marsh:'rain',lantern:'rain',jungle:'rain',quarry:'dust',desert:'dust',rooftops:'dust',ants:'dust',frost:'snow',vents:'steam',glow:'spores',hollow:'spores',grotto:'spores',storm:'rain',tide:'spray',home:'leaves',coast:'spray'};
let escapeWeather={parts:[],clock:0};
function escapeWeatherStrength(kind,t){
  // Rain and snow arrive in fronts a minute or two apart; the gentle kinds never stop.
  if(kind==='rain')return Math.max(0,Math.sin(t/37)*1.4-.2);
  if(kind==='snow')return .45+.55*Math.max(0,Math.sin(t/29));
  if(kind==='dust')return .35+.65*Math.max(0,Math.sin(t/23));
  return 1;
}
function drawEscapeWorldWeather(w){
  const reduced=Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches),dt=Math.min(.1,(deltaTime||16)/1000);escapeWeather.clock+=dt;
  const kind=ESCAPE_WEATHER[w.chapters[w.chapterAt()]?.theme]||null,t=escapeWeather.clock,strength=kind?escapeWeatherStrength(kind,t):0;
  const target={rain:110,snow:70,dust:40,petals:22,blossom:26,leaves:22,steam:18,spores:30,spray:16}[kind]||0,want=Math.round(target*strength*(reduced?.35:1)*Math.min(1.2,width*height/(1280*800)+.3));
  const living=escapeWeather.parts.filter(p=>p.kind===kind).length;
  for(let i=living;i<want&&i<living+4;i++){const p={kind,x:Math.random()*width,y:Math.random()*height,age:0,life:2+Math.random()*6,seed:Math.random()*99};
    if(kind==='rain'||kind==='snow'||kind==='petals'||kind==='blossom'||kind==='leaves')p.y=-10-Math.random()*40;if(kind==='steam'||kind==='spores')p.y=height*(.25+Math.random()*.8);if(kind==='dust'||kind==='spray')p.x=-10;
    if(kind==='rain')p.life=1.2;if(kind==='steam')p.life=5+Math.random()*3;escapeWeather.parts.push(p);}
  const wind=Math.sin(t/11)*.6+.4,speed=reduced?.5:1;noStroke();
  escapeWeather.parts=escapeWeather.parts.filter(p=>{p.age+=dt;const fade=Math.min(1,p.age*2,(p.life-p.age)*2,p.kind===kind?1:Math.max(0,1-p.age/p.life));if(p.age>p.life||p.y>height+30||p.x>width+30||p.y<-60&&p.age>1)return false;
    switch(p.kind){
      case 'rain':{p.x+=(60+wind*80)*dt*speed;p.y+=620*dt*speed;stroke(190,214,236,120*fade);strokeWeight(1.3);line(p.x,p.y,p.x-(6+wind*8),p.y-16);noStroke();
        if(p.age>p.life-.08){noFill();stroke(200,224,240,100);strokeWeight(1);ellipse(p.x,p.y,10,4);noStroke();}break;}
      case 'snow':{p.x+=(Math.sin(p.age*1.7+p.seed)*18+wind*20)*dt*speed;p.y+=40*dt*speed;fill(255,255,255,210*fade);ellipse(p.x,p.y,3+p.seed%3,3+p.seed%3);break;}
      case 'petals':case 'blossom':case 'leaves':{p.x+=(30+wind*45+Math.sin(p.age*2+p.seed)*20)*dt*speed;p.y+=32*dt*speed;const c=p.kind==='petals'?(p.seed%2>1?[250,236,120]:[236,170,210]):p.kind==='blossom'?[255,240,246]:(p.seed%3>1.5?[214,140,60]:[190,90,50]);
        push();translate(p.x,p.y);rotate(p.age*2+p.seed);fill(...c,220*fade);ellipse(0,0,7,3.6);pop();break;}
      case 'dust':{p.x+=(120+wind*160)*dt*speed;p.y+=Math.sin(p.age*3+p.seed)*12*dt;fill(236,206,150,(70+p.seed%40)*fade);ellipse(p.x,p.y,2+p.seed%3,2+p.seed%3);if(p.seed<8){fill(236,206,150,18*fade);ellipse(p.x,p.y,80,14);}break;}
      case 'steam':{p.y-=26*dt*speed;p.x+=Math.sin(p.age+p.seed)*10*dt;const r=20+p.age*14;fill(240,236,230,34*fade);ellipse(p.x,p.y,r,r*.7);break;}
      case 'spores':{p.y-=14*dt*speed;p.x+=Math.sin(p.age*1.3+p.seed)*16*dt;const glow=.5+.5*Math.sin(p.age*4+p.seed);fill(160,255,220,60*fade*glow);ellipse(p.x,p.y,12,12);fill(200,255,240,200*fade);ellipse(p.x,p.y,2.6,2.6);break;}
      case 'spray':{p.x+=(70+wind*40)*dt*speed;p.y+=Math.sin(p.age*2+p.seed)*8*dt;fill(255,255,255,90*fade);ellipse(p.x,p.y,3,3);break;}
    }return true;});
  // A wash of grey under heavy rain, and a cool haze under thick snow.
  if(kind==='rain'&&strength>.2){fill(40,60,80,Math.min(60,strength*45));rect(0,0,width,height);}
  if(kind==='snow'&&strength>.6){fill(230,240,250,(strength-.6)*70);rect(0,0,width,height);}
}
// Sealed spots: a mossy standing stone with a carved question mark and a faint glow; in a
// courtyard a ring of tiny caps or a lightning-split stump; the final stretch under cloud.
function drawEscapeWorldSecret(s,cell,clock,open=false){
  const x=(s.x+.5)*cell,y=(s.y+.5)*cell,glow=.5+.5*Math.sin(clock*1.3+s.x);noStroke();
  // Once open, a spot's escapes mark it; the burrow shows its round front door with a lamp lit.
  if(open&&s.id==='sallys-burrow'){fill(0,0,0,60);ellipse(x,y+cell*.6,cell*2.2,cell*.5);fill(92,66,40);ellipse(x,y,cell*2,cell*2);fill(150,96,52);ellipse(x,y+cell*.05,cell*1.6,cell*1.6);stroke(110,70,36);strokeWeight(cell*.05);for(const o of [-.4,0,.4])line(x+o*cell,y-cell*.7,x+o*cell,y+cell*.8);noStroke();fill(230,190,90);ellipse(x+cell*.45,y+cell*.1,cell*.16,cell*.16);fill(255,214,120,60+60*glow);ellipse(x-cell*1.2,y-cell*.6,cell*.7,cell*.7);fill(255,226,150);ellipse(x-cell*1.2,y-cell*.6,cell*.26,cell*.3);return;}
  if(open&&EscapeProgress.SECRET_RULES?.[s.id])return;
  if(s.area){for(let i=0;i<4;i++)drawEscapeRegionCloud({x:s.x+[-8,8,-8,8][i],y:s.y+[-3,-3,4,4][i]},20+i,cell,clock);return;}
  if(s.id==='fairy-ring'){for(let k=0;k<7;k++){const a=k*TWO_PI/7,px=x+Math.cos(a)*cell*.9,py=y+Math.sin(a)*cell*.6;fill(240,230,210);rect(px-cell*.03,py,cell*.06,cell*.1);fill(214,70,58);arc(px,py+cell*.02,cell*.2,cell*.16,PI,TWO_PI);}fill(220,200,255,40+50*glow);ellipse(x,y,cell*1.4,cell*1);return;}
  if(s.id==='struck-oak'&&!escapeWorld?.stormFlash?.())return;
  if(s.id==='struck-oak'){fill(0,0,0,60);ellipse(x,y+cell*.3,cell*.9,cell*.25);fill(60,48,40);rect(x-cell*.22,y-cell*.4,cell*.18,cell*.7,cell*.04);rect(x+cell*.04,y-cell*.25,cell*.18,cell*.55,cell*.04);fill(30,24,22);triangle(x-cell*.04,y-cell*.4,x+cell*.04,y-cell*.4,x,y+cell*.1);fill(255,240,160,30+60*glow);ellipse(x,y-cell*.2,cell*.6,cell*.6);return;}
  fill(170,230,200,25+45*glow);ellipse(x,y,cell*1.6,cell*1.6);fill(0,0,0,60);ellipse(x,y+cell*.42,cell*.9,cell*.25);
  fill(120,128,118);beginShape();vertex(x-cell*.32,y+cell*.4);vertex(x-cell*.28,y-cell*.35);vertex(x,y-cell*.55);vertex(x+cell*.3,y-cell*.3);vertex(x+cell*.34,y+cell*.4);endShape(CLOSE);
  fill(74,120,70);ellipse(x-cell*.1,y-cell*.32,cell*.32,cell*.16);ellipse(x+cell*.2,y+cell*.25,cell*.24,cell*.12);fill(60,64,60);textAlign(CENTER,CENTER);textSize(cell*.42);text('?',x,y);
}
function drawEscapeRegionCloud(c,i,cell,clock){
  noStroke();const puffs=[[0,0,9],[-5,-3,6.5],[5,-3,7],[-6,3,6],[6,3,6.5],[0,-5,6],[0,5,6.5],[-3,1,5.5],[3,-1,5.5]];
  for(const [k,[dx,dy,r]] of puffs.entries()){const drift=Math.sin(clock*.25+i+k)*.5;fill(214,226,222,k<1?235:225);ellipse((c.x+.5+dx+drift)*cell,(c.y+.5+dy)*cell,r*cell*1.45,r*cell*1.05);}
  for(const [k,[dx,dy,r]] of puffs.entries()){const drift=Math.sin(clock*.25+i+k)*.5;fill(245,248,246,170);ellipse((c.x+.5+dx+drift-.4)*cell,(c.y+.5+dy-.5)*cell,r*cell*1.05,r*cell*.7);}
  fill(98,116,112);textAlign(CENTER,CENTER);textSize(cell*.7);text('?',(c.x+.5)*cell,(c.y+.5)*cell);
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
  const kind={meadow:'butterfly',garden:'butterfly',orchard:'butterfly',river:'dragonfly',coast:'dragonfly',ruins:'moth',quarry:'beetle',desert:'beetle',marsh:'firefly',jungle:'firefly',glow:'firefly',hollow:'firefly',lantern:'firefly',rooftops:'butterfly',ants:'beetle',frost:'snow',vents:'moth',grotto:'firefly',storm:'moth',tide:'dragonfly',home:'firefly'}[chapter.theme];
  const colors={meadow:[245,214,96],garden:[236,150,190],orchard:[250,250,240],river:[110,210,230],coast:[90,200,210],ruins:[214,200,170],quarry:[60,48,36],desert:[70,52,30],marsh:[210,255,140],jungle:[190,255,120],glow:[120,255,230],hollow:[255,140,190],lantern:[255,214,110],rooftops:[255,170,90],ants:[90,30,20],frost:[250,252,255],vents:[230,210,190],grotto:[190,150,255],storm:[210,220,235],tide:[120,210,220],home:[255,206,120]}[chapter.theme];
  for(let k=0;k<5;k++){
    const seed=index*7.31+k*2.17,t=w.elapsed*(kind==='beetle'?.18:.32)+seed;
    let px=chapter.x+.5+Math.sin(t*1.3+seed)*6.2,py=chapter.y+.5+Math.cos(t*.9+seed*1.7)*5.2;
    const d=Math.hypot(px-w.player.x,py-w.player.y);if(d<2.4&&d>0){px+=(px-w.player.x)/d*(2.4-d);py+=(py-w.player.y)/d*(2.4-d);}
    const x=px*cell,y=py*cell;noStroke();push();translate(x,y);scale(1.8);translate(-x,-y);
    if(kind==='snow'){fill(250,252,255,210);ellipse(x,y,cell*.12,cell*.12);stroke(250,252,255,150);strokeWeight(cell*.015);for(let k=0;k<3;k++){const r=k*PI/3+w.elapsed;line(x-Math.cos(r)*cell*.1,y-Math.sin(r)*cell*.1,x+Math.cos(r)*cell*.1,y+Math.sin(r)*cell*.1);}noStroke();}
    else if(kind==='firefly'){const glow=.5+.5*Math.sin(w.elapsed*4+seed*3);fill(...colors,40+80*glow);ellipse(x,y,cell*.6,cell*.6);fill(...colors,200);ellipse(x,y,cell*.12,cell*.12);}
    else if(kind==='beetle'){push();translate(x,y);rotate(Math.atan2(Math.sin(t*.9+seed*1.7)*-.9*5.2,Math.cos(t*1.3+seed)*1.3*6.2));fill(...colors);ellipse(0,0,cell*.26,cell*.18);stroke(...colors);strokeWeight(cell*.02);for(const s of [-1,1])for(const o of [-.06,0,.06])line(o*cell,0,(o-.02)*cell,s*cell*.14);pop();}
    else{const flap=Math.abs(Math.sin(w.elapsed*(kind==='dragonfly'?30:12)+seed));fill(...colors,kind==='dragonfly'?150:220);
      if(kind==='dragonfly'){for(const s of [-1,1])ellipse(x+s*cell*.13,y,cell*.24,cell*.07*(.4+flap));fill(40,80,90);rect(x-cell*.02,y-cell*.12,cell*.04,cell*.28);}
      else{for(const s of [-1,1])ellipse(x+s*cell*.08*flap,y,cell*.16*flap+cell*.02,cell*.2);fill(50,40,30);ellipse(x,y,cell*.04,cell*.14);}}
    pop();
  }
}
