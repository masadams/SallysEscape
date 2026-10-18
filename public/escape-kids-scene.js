// Little Explorers: the kids' area from the main menu (levels in escape-kids.js). A row of
// stepping stones, one per level, each showing its sticker once finished; every level is open from
// the start. Progress is each player's own and never touches the campaign's stars or unlocks.
const ESCAPE_KIDS_KEY='sallys-escape-kids';
function escapeKidsLevels(){return typeof EscapeCatalog!=='undefined'&&EscapeCatalog.kids||[];}
function escapeKidsDone(){try{const v=JSON.parse(escapeStore.getItem(ESCAPE_KIDS_KEY)||'[]');return Array.isArray(v)?escapeKidsLevels().map(l=>l.id).filter(id=>v.includes(id)):[];}catch(_){return [];}}
function escapeKidsMark(id){const done=escapeKidsDone();if(done.includes(id)||!escapeKidsLevels().some(l=>l.id===id))return false;done.push(id);try{escapeStore.setItem(ESCAPE_KIDS_KEY,JSON.stringify(done));}catch(_){}return true;}
function openLittleExplorers(focusId){
  const panel=escapeBuilderShow();gameState='kids';
  const done=escapeKidsDone(),levels=escapeKidsLevels(),next=levels.find(l=>!done.includes(l.id)),t=escapeText;
  panel.innerHTML='<div class="kids-picker"><div class="builder-head"><button id="kids-back" class="escape-secondary">← Main menu</button></div>'
    +'<h2 class="kids-title">Little Explorers</h2><p class="kids-sub">Help Sally on ten little adventures. Every one you finish gives you a sticker!</p>'
    +'<ol class="kids-stones">'+levels.map((l,i)=>{const got=done.includes(l.id);
      return '<li><button class="kids-stone'+(got?' kids-done':'')+(l===next?' kids-next':'')+'" data-id="'+t(l.id)+'" aria-label="'+(i+1)+'. '+t(l.name)+(got?', finished':'')+'">'
        +'<span class="kids-num">'+(i+1)+'</span><span class="kids-sticker" aria-hidden="true">'+(got?t(l.sticker||'⭐'):'?')+'</span><span class="kids-name">'+t(l.name)+'</span></button></li>';}).join('')+'</ol>'
    +'<p class="kids-count">Stickers: '+done.length+' of '+levels.length+(done.length===levels.length?' · You finished them all! 🎉':'')+'</p></div>';
  document.getElementById('kids-back').onclick=closeEscapeBuilder;
  for(const b of panel.querySelectorAll('.kids-stone'))b.onclick=()=>startEscape({kidsId:b.dataset.id});
  const focus=panel.querySelector('.kids-stone[data-id="'+(focusId||next?.id||levels[0]?.id)+'"]');focus?.focus();
}
// Escape (or B on a controller, or Back on a TV remote) leaves the picker for the main menu.
if(typeof document!=='undefined')document.addEventListener('keydown',e=>{if(e.key==='Escape'&&typeof gameState!=='undefined'&&gameState==='kids'){e.preventDefault();closeEscapeBuilder();}});
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
