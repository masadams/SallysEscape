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
    +'<h2 class="kids-title">Little Explorers</h2><p class="kids-sub">Help Sally on '+levels.length+' little adventures. Every one you finish gives you a sticker!</p>'
    +'<ol class="kids-stones">'+levels.map((l,i)=>{const got=done.includes(l.id);
      return '<li><button class="kids-stone'+(got?' kids-done':'')+(l===next?' kids-next':'')+'" data-id="'+t(l.id)+'" aria-label="'+(i+1)+'. '+t(l.name)+(got?', finished':'')+'">'
        +'<span class="kids-num">'+(i+1)+'</span><span class="kids-sticker" aria-hidden="true">'+(got?t(l.sticker||'⭐'):'?')+'</span><span class="kids-name">'+t(l.name)+'</span></button></li>';}).join('')+'</ol>'
    +'<p class="kids-count">Stickers: '+done.length+' of '+levels.length+(done.length===levels.length?' · You finished them all! 🎉':'')+'</p></div>';
  document.getElementById('kids-back').onclick=closeEscapeBuilder;
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
// The guide trail: glowing dots from Sally along the shortest way to the key, then to the door (or
// to a gate's button first when a shut gate is in the way), plus a flag on each checkpoint.
let escapeKidsTrail={key:'',path:[]};
function escapeKidsPath(g,from,to){
  const w=g.width,id=(x,y)=>y*w+x,start=id(from[0],from[1]),goal=id(to[0],to[1]),prev=new Map([[start,-1]]),queue=[start];
  while(queue.length){const at=queue.shift();if(at===goal)break;const x=at%w,y=Math.floor(at/w);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=id(nx,ny);if(prev.has(n)||!g.floor(nx,ny))continue;prev.set(n,at);queue.push(n);}}
  if(!prev.has(goal))return null;const path=[];for(let at=goal;at!==-1;at=prev.get(at))path.push([at%w,Math.floor(at/w)]);return path.reverse();
}
function drawEscapeKidsGuide(g,cell){
  if(g.status!=='playing')return;
  const tile=p=>[Math.floor(p.x),Math.floor(p.y)],here=tile(g.player),goal=tile(g.hasKey?g.exit:g.key);
  const key=here+'|'+goal+'|'+g.gates.map(gate=>gate.open?1:0).join('');
  if(escapeKidsTrail.key!==key){let path=escapeKidsPath(g,here,goal);
    if(!path){const shut=g.gates.find(gate=>!gate.open&&gate.switch);if(shut)path=escapeKidsPath(g,here,tile(shut.switch));}
    escapeKidsTrail={key,path:path||[]};}
  const t=g.elapsed;noStroke();
  escapeKidsTrail.path.slice(1,16).forEach(([x,y],i)=>{const pulse=.5+.5*Math.sin(t*5-i*.7);fill(255,236,140,90+120*pulse);ellipse((x+.5)*cell,(y+.5)*cell,cell*(.22+.08*pulse));});
  for(const c of g.checkpoints){const x=c.x*cell,y=c.y*cell;stroke(90,70,40);strokeWeight(cell*.05);line(x-cell*.15,y+cell*.3,x-cell*.15,y-cell*.32);noStroke();
    fill(...(c.reached?[110,220,120]:[245,245,235]));triangle(x-cell*.13,y-cell*.32,x+cell*.28,y-cell*.2,x-cell*.13,y-cell*.08);}
}
