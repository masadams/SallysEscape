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
// Show a part title or a card. fresh: it is being found now, so it is saved and the next queued one follows.
function showEscapeStory(entry,fresh){
  const page=escapeStoryPage();if(!page)return;const kindLabel={journal:'From Old Moss’s journal',map:'The Great Map',note:'A note, left behind'};
  escapeStoryOpen=entry;
  if(entry.part){const p=entry.part;page.className='story-overlay story-part';
    page.innerHTML='<div class="story-part-inner"><span class="story-eyebrow">'+escapeText(p.title)+'</span><h2>'+escapeText(p.name)+'</h2><p>'+escapeText(p.line)+'</p><button type="button" class="escape-primary" id="story-next">Begin</button></div>';}
  else{const c=entry.card;page.className='story-overlay story-'+c.kind;
    page.innerHTML='<article class="story-card"><span class="story-eyebrow">'+escapeText(kindLabel[c.kind]||'')+(c.area!==undefined?' · '+escapeText(EscapeWorld.chapters[c.area]?.name||''):'')+'</span><h2>'+escapeText(c.title)+'</h2>'+
      c.body.map(t=>'<p>'+escapeText(t)+'</p>').join('')+'<button type="button" class="escape-primary" id="story-next">'+(fresh&&escapeStoryQueue.length?'Next':fresh?'Continue':'Close')+'</button></article>';}
  page.style.display='flex';escapeSound(entry.part?'glimmer':'chest');
  const next=document.getElementById('story-next');next.focus?.();
  next.onclick=()=>{if(fresh)escapeProgress.markStory(entry.id);page.style.display='none';escapeStoryOpen=null;
    if(fresh&&escapeStoryQueue.length)showEscapeStory(escapeStoryQueue.shift(),true);else if(!fresh)openEscapeStoryBook();else renderEscapeWorldTotals?.();};
}
if(typeof document!=='undefined')document.addEventListener('keydown',e=>{if(!escapeStoryOpen||!['Enter',' ','Escape'].includes(e.key))return;e.preventDefault();e.stopPropagation();document.getElementById('story-next')?.click();},true);
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
