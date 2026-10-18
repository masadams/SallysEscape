// The story on screen: a part's title, then a card (a page of Old Moss's journal, a page of the
// Great Map, or a note from a lost Wayfinder). Cards wait in a queue and show on the world map,
// each once; the Journal's Story page lists every card found, lets them be read again, and
// draws the Great Map filling in. While a card is open the world map holds still and the
// reading music plays (escapescene.js tickEscapeMusic).
let escapeStoryQueue=[],escapeStoryOpen=null;
// Queue a card the first time it comes up; a part's title goes in front of its first card.
function queueEscapeStory(id){
  if(typeof EscapeStory==='undefined')return false;const card=EscapeStory.byId(id);
  if(!card||escapeProgress.storySeen(id)||escapeStoryQueue.some(q=>q.id===id))return false;
  const part=card.area!==undefined?EscapeStory.PARTS.find(p=>p.from===card.area):card.id==='opening'?EscapeStory.PARTS[0]:null;
  if(part&&!escapeProgress.storySeen('part:'+part.n)&&!escapeStoryQueue.some(q=>q.id==='part:'+part.n))escapeStoryQueue.push({id:'part:'+part.n,part});
  escapeStoryQueue.push({id,card});return true;
}
// On the world map: the opening the first time in, then the card for each area as Sally first reaches it.
function tickEscapeStory(){
  if(typeof EscapeStory==='undefined'||!escapeWorld||escapeStoryOpen)return;
  if(!escapeProgress.storySeen('opening'))queueEscapeStory('opening');
  else{const i=escapeWorld.chapterAt();if(escapeWorld.regionOpen(i)){const card=EscapeStory.areaCard(i);if(card)queueEscapeStory(card.id);}}
  if(escapeStoryQueue.length&&!escapeBestiaryOpen&&!escapeLibraryOpen)showEscapeStory(escapeStoryQueue.shift(),true);
}
// A won escape can earn a card: a secret spot's note, or the finale after the last escape.
function escapeStoryForResult(level,won){
  if(!won||typeof EscapeStory==='undefined'||level.custom)return;
  const spot=EscapeStory.spotFor(level);if(spot)queueEscapeStory('note:'+spot);
  if(level===EscapeCatalog.levels.at(-1)){queueEscapeStory('finale');queueEscapeStory('after');}
}
function escapeStoryPage(){
  let page=document.getElementById('story-card');
  if(!page){page=document.createElement('div');page.id='story-card';page.className='story-overlay';page.setAttribute('role','dialog');page.setAttribute('aria-modal','true');document.getElementById('game-area')?.appendChild(page);}
  return page;
}
// A small living scene at the top of a card, from its area: a sky and a few things that drift or
// bob there (CSS only, so it costs nothing to draw). Map pages get a trail drawing itself; a note
// left behind gets a lantern's glow; the opening is the storm.
const ESCAPE_STORY_SCENES={meadow:['#bfe3a0','#e9f6c9','🌼 🐍 🌾 🦋'],garden:['#c9d9b0','#eef0d6','🧱 🪲 🌿 🐌'],river:['#9fd3d6','#dff2e6','🐸 🌊 🪷 🐟'],ruins:['#c4c8b0','#ecead8','🏛️ 🕷️ 🍂 🦗'],quarry:['#d9c7a3','#f1e6cf','🪨 🦂 🌵 🪨'],desert:['#f0cf8f','#fbefcf','🌵 🦂 ☀️ 🐍'],marsh:['#a9c8a3','#e3eedb','🐸 🪷 🦟 🌾'],jungle:['#8fc48d','#d8efcf','🌴 🦎 🦜 🍃'],glow:['#1d2d44','#3c5878','✨ 🍄 🦋 ✨'],orchard:['#cfe2a6','#f4f2d2','🍎 🌳 🐝 🍐'],coast:['#a8d8ea','#f6ecd0','🦀 🐚 🌊 ☀️'],hollow:['#c9b3a0','#efe2d4','🦎 🪶 🍂 🕯️'],lantern:['#2b3a4a','#56708a','🏮 🦉 🌙 ✨'],rooftops:['#f0b98a','#fbe3c8','🏠 🦅 ☀️ 🪟'],ants:['#b98c62','#e9d3b8','🐜 🐜 🍯 🐜'],frost:['#cfe6f5','#f4fbff','❄️ 🦊 ❄️ 🧊'],vents:['#c9a58e','#efe0d4','♨️ 🪲 ⚙️ ♨️'],grotto:['#3b2f55','#6b5a8e','🍄 ✨ 🦇 🍄'],storm:['#55657a','#9fb0c4','⛈️ 🌧️ ⚡ 🍃'],tide:['#9fd0d8','#e9f3ec','🌊 🐙 🐚 🦀'],home:['#f3d9a0','#fff4dc','🏡 🌅 🦎 🌼']};
function escapeStoryScene(c){
  const reduced=Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const theme=c.id==='opening'?'storm':c.id==='finale'||c.id==='after'?'home':c.kind==='note'?'lantern':EscapeWorld.chapters[c.area]?.theme||'meadow';
  const [a,b,items]=ESCAPE_STORY_SCENES[theme]||ESCAPE_STORY_SCENES.meadow,glyphs=items.split(' ');
  const things=glyphs.map((g,i)=>'<span class="story-thing" style="left:'+(10+i*24)+'%;animation-delay:'+(-i*1.3)+'s;font-size:'+(1.5+((i*7)%3)*.35)+'rem">'+g+'</span>').join('');
  const trail=c.kind==='map'?'<svg class="story-trail" viewBox="0 0 200 60" aria-hidden="true"><path d="M8 48 C40 10, 70 56, 100 28 S160 8, 192 22"/></svg>':'';
  return '<div class="story-scene'+(reduced?' story-still':'')+'" style="--sky1:'+a+';--sky2:'+b+'" aria-hidden="true">'+trail+things+'</div>';
}
// A page of a card, as markup: spoken lines in "quotes" stand out, a margin note or a jotted
// "Note:" is a folded scrap to open, and a map page's label is set apart.
function escapeStoryPageHtml(text){
  const t=escapeText(text);
  if(/^(In the margin|Note:)/.test(text))return '<button type="button" class="story-fold" aria-expanded="false"><span class="story-fold-label">✎ Something is scribbled here. Open it</span><span class="story-fold-text">'+t+'</span></button>';
  return '<p class="story-line">'+t.replace(/^Map page:/,'<span class="story-tag">Map page</span>').replace(/(“[^”]+”|&quot;[^&]+?&quot;|"[^"]+")/g,'<q class="story-say">$1</q>')+'</p>';
}
// Show a part title or a card. fresh: it is being found now, so it is saved and the next queued one follows.
// A card turns one page at a time: the words write themselves in (a press finishes them), the next
// press turns the page, and dots show how far through it is.
function showEscapeStory(entry,fresh){
  const page=escapeStoryPage();if(!page)return;const kindLabel={journal:'From Old Moss’s journal',map:'The Great Map',note:'A note, left behind'};
  escapeStoryOpen=entry;
  const finish=()=>{if(fresh)escapeProgress.markStory(entry.id);page.style.display='none';escapeStoryOpen=null;
    if(fresh&&escapeStoryQueue.length)showEscapeStory(escapeStoryQueue.shift(),true);else if(!fresh)openEscapeStoryBook();else renderEscapeWorldTotals?.();};
  if(entry.part){const p=entry.part;page.className='story-overlay story-part';
    page.innerHTML='<div class="story-part-inner"><span class="story-eyebrow">'+escapeText(p.title)+'</span><h2>'+[...p.name].map((ch,i)=>'<span class="story-letter" style="animation-delay:'+(.3+i*.06)+'s">'+(ch===' '?'&nbsp;':escapeText(ch))+'</span>').join('')+'</h2><p>'+escapeText(p.line)+'</p><button type="button" class="escape-primary" id="story-next">Begin</button></div>';
    page.style.display='flex';escapeSound('glimmer');const next=document.getElementById('story-next');next.focus?.();next.onclick=finish;return;}
  const c=entry.card,last=c.body.length-1,doneLabel=fresh&&escapeStoryQueue.length?'Next':fresh?'Continue':'Close';
  page.className='story-overlay story-'+c.kind;
  page.innerHTML='<article class="story-card">'+escapeStoryScene(c)+'<span class="story-eyebrow">'+escapeText(kindLabel[c.kind]||'')+(c.area!==undefined?' · '+escapeText(EscapeWorld.chapters[c.area]?.name||''):'')+'</span><h2>'+escapeText(c.title)+'</h2>'
    +'<div class="story-pages" aria-live="polite"></div><div class="story-foot"><span class="story-dots">'+c.body.map((_,i)=>'<i data-i="'+i+'"></i>').join('')+'</span><button type="button" class="escape-primary" id="story-next"></button></div></article>';
  page.style.display='flex';escapeSound('chest');
  const pages=page.querySelector('.story-pages'),next=document.getElementById('story-next'),reduced=Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  let at=-1,typing=null;
  const stopTyping=()=>{if(typing){clearInterval(typing.timer);typing.el.textContent=typing.full;typing.el.closest('p')?.classList.remove('story-typing');const html=escapeStoryPageHtml(c.body[at]);typing.el.closest('p').outerHTML=html;typing=null;}};
  const show=i=>{at=i;const html=escapeStoryPageHtml(c.body[i]);pages.insertAdjacentHTML('beforeend',html);const added=pages.lastElementChild;added.classList.add('story-arrive');
    page.querySelectorAll('.story-dots i').forEach((d,k)=>d.classList.toggle('on',k<=i));
    next.textContent=i<last?'Next ▸':doneLabel;
    if(added.classList.contains('story-fold')){added.onclick=()=>{added.setAttribute('aria-expanded','true');added.classList.add('story-open');escapeSound('flutter');};}
    else if(!reduced){const full=added.textContent;added.classList.add('story-typing');added.textContent='';const span=document.createElement('span');added.appendChild(span);let n=0;typing={el:span,full,timer:setInterval(()=>{n+=2;span.textContent=full.slice(0,n);if(n>=full.length)stopTyping();},16)};}
    added.scrollIntoView?.({block:'nearest',behavior:'smooth'});};
  next.onclick=()=>{if(typing){stopTyping();return;}if(at<last){show(at+1);escapeSound('ping');return;}finish();};
  show(0);next.focus?.();
}
// Enter or Space turn the page (as A does); Escape (or B) skips to the end of the card and closes it.
if(typeof document!=='undefined')document.addEventListener('keydown',e=>{if(!escapeStoryOpen||!['Enter',' ','Escape'].includes(e.key))return;e.preventDefault();e.stopPropagation();const next=document.getElementById('story-next');if(!next)return;
  if(e.key==='Escape'){for(let i=0;i<40&&escapeStoryOpen&&document.getElementById('story-next')===next;i++)next.click();return;}
  if(document.activeElement?.classList?.contains('story-fold')&&!document.activeElement.classList.contains('story-open')){document.activeElement.click();return;}next.click();},true);
// The Journal's Story page: each part's cards (found ones can be read again), the lost Wayfinder's
// notes, and the Great Map, an area lit for every map page found.
function openEscapeStoryBook(){
  const ui=document.getElementById('escape-world-ui');if(!ui||typeof EscapeStory==='undefined')return;let page=document.getElementById('world-bestiary');
  if(!page){page=document.createElement('section');page.id='world-bestiary';page.className='world-bestiary';ui.appendChild(page);}
  const S=EscapeStory,seen=id=>escapeProgress.storySeen(id),found=S.CARDS.filter(c=>seen(c.id)).length;
  const tile=c=>seen(c.id)?'<button type="button" class="story-tile story-tile-'+c.kind+'" data-story="'+c.id+'"><b>'+escapeText(c.title)+'</b></button>':'<span class="story-tile story-locked">???</span>';
  const parts=S.PARTS.map(p=>{const cards=S.CARDS.filter(c=>c.part===p.n&&!c.spot);return '<h3>'+escapeText(p.title+' · '+p.name)+'</h3><div class="story-tiles">'+cards.map(tile).join('')+'</div>';}).join('');
  const notes=S.CARDS.filter(c=>c.spot);
  // The Great Map: the trail's areas as a winding row of tiles; map pages light theirs.
  const mapCells=S.AREAS.map((a,i)=>{const lit=seen('area:'+a.theme)&&(a.kind==='map'),x=(i%7)*46+(Math.floor(i/7)%2?23:0)+8,y=Math.floor(i/7)*46+8;
    return '<g><rect x="'+x+'" y="'+y+'" width="40" height="40" rx="8" class="'+(lit?'map-lit':i<S.PARTS[1].from?'map-garden':'map-dark')+'"/><text x="'+(x+20)+'" y="'+(y+25)+'" text-anchor="middle">'+(i+1)+'</text></g>';}).join('');
  const mapPages=S.AREAS.filter(a=>a.kind==='map'&&seen('area:'+a.theme)).length,mapTotal=S.AREAS.filter(a=>a.kind==='map').length;
  page.innerHTML='<div class="bestiary-head"><h2>Story</h2><span>'+found+' of '+S.CARDS.length+' pages found</span><button type="button" id="world-bestiary-close" class="escape-secondary">Close</button></div>'+
    '<div class="story-book">'+parts+'<h3>Notes from a lost Wayfinder · '+notes.filter(c=>seen(c.id)).length+' / '+notes.length+'</h3><div class="story-tiles">'+notes.map(tile).join('')+'</div>'+
    '<h3>The Great Map · '+mapPages+' / '+mapTotal+' pages</h3><svg class="great-map" viewBox="0 0 360 154" role="img" aria-label="The Great Map: '+mapPages+' of '+mapTotal+' pages found">'+mapCells+'</svg></div>';
  escapeBestiaryOpen=true;page.style.display='block';
  for(const b of page.querySelectorAll('[data-story]'))b.onclick=()=>{page.style.display='none';escapeBestiaryOpen=false;showEscapeStory({id:b.dataset.story,card:S.byId(b.dataset.story)},false);};
  const close=()=>{escapeBestiaryOpen=false;page.style.display='none';renderEscapeWorldTotals();};
  document.getElementById('world-bestiary-close').onclick=close;page.onkeydown=e=>{if(e.key==='Escape')close();};document.getElementById('world-bestiary-close').focus?.();
}
