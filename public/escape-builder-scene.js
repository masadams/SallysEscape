// The level builder screen: paint a map, place Sally, the key, the hatch, treasure and enemies,
// then playtest it, save it in this browser, or share it as a line of text.
let escapeBuilderModel=null,escapeBuilderTool='#',escapeBuilderSelected=-1,escapeBuilderPainting=false;
const ESCAPE_BUILDER_STORE=(()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})();
const ESCAPE_BUILDER_LOOK={'#':['#2d4a43',''],'.':['#183029',''],'L':['#2f6b45','❀'],'N':['#3b3a32','∴'],'B':['#3c5a5e','⟋'],'M':['#4a3a26','≈'],'~':['#1f5a76','~'],'_':['#07120f',''],'c':['#3d3424','⁘'],'T':['#24452a','෴'],'S':['#2d4a43','⦚'],'@':['#183029','🦎'],'K':['#183029','🔑'],'X':['#1d5a4f','⇩'],'1':['#183029','◆'],'2':['#183029','◆◆'],'3':['#183029','▣']};
const ESCAPE_BUILDER_ENEMY={snake:'🐍',beetle:'🪲',scorpion:'🦂',toad:'🐸',spider:'🕷',cricket:'🦗',moth:'🦋',mimic:'🎁',millipede:'🐛',cobra:'👑',flytrap:'🌺',crab:'🦀',fox:'🦊',heron:'🦩'};
const ESCAPE_BUILDER_ARROW=['→','↓','←','↑'];

function openEscapeBuilder(model){
  escapeAbandonRun?.();resetGameState();gameState='builder';
  escapeBuilderModel=model||escapeBuilderModel||EscapeBuilder.blank();escapeBuilderSelected=-1;
  for(const id of ['start-menu-container','game-container','escape-select'])document.getElementById(id).style.display='none';
  document.getElementById('escape-result').style.display='none';document.getElementById('game-area').classList.remove('escape-results-open');
  const panel=document.getElementById('escape-builder');panel.style.display='block';renderEscapeBuilder();updateToolbar();window.scrollTo?.(0,0);
}
function closeEscapeBuilder(){document.getElementById('escape-builder').style.display='none';gameState='start';resetGameState();}

function renderEscapeBuilder(){
  const m=escapeBuilderModel,B=EscapeBuilder,panel=document.getElementById('escape-builder'),w=m.map[0].length,h=m.map.length;
  const tool=(id,label,title)=>'<button class="builder-tool'+(escapeBuilderTool===id?' builder-tool-on':'')+'" data-tool="'+id+'" title="'+title+'">'+label+'</button>';
  const problems=B.validate(m);
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Menu</button><h2>Level builder</h2>'+
    '<label>Name <input id="builder-name" maxlength="40" value="'+escapeHtml(m.name)+'"></label><label>Brief <input id="builder-brief" maxlength="140" value="'+escapeHtml(m.brief)+'"></label></div>'+
    '<div class="builder-settings"><label>Width <input id="builder-w" type="number" min="'+B.LIMITS.minW+'" max="'+B.LIMITS.maxW+'" value="'+w+'"></label><label>Height <input id="builder-h" type="number" min="'+B.LIMITS.minH+'" max="'+B.LIMITS.maxH+'" value="'+h+'"></label>'+
    ['burrows','pebbles','tongues'].map(k=>'<label>'+k[0].toUpperCase()+k.slice(1)+' <input data-count="'+k+'" type="number" min="0" max="5" value="'+m[k]+'"></label>').join('')+
    '<label>Hatch toll <input id="builder-toll" type="number" min="0" max="99" value="'+m.requiredTreasure+'"></label><label class="builder-check"><input id="builder-dark" type="checkbox"'+(m.explore?' checked':'')+'> Dark (explore)</label></div>'+
    '<div class="builder-palette"><span>Tiles</span>'+Object.entries(B.TILES).map(([k,v])=>tool(k,ESCAPE_BUILDER_LOOK[k][1]||v[0],v)).join('')+
    '<span>Places</span>'+Object.entries(B.MARKS).map(([k,v])=>tool(k,ESCAPE_BUILDER_LOOK[k][1],v)).join('')+
    '<span>Enemies</span>'+Object.entries(B.ENEMIES).map(([k,v])=>tool('enemy:'+k,ESCAPE_BUILDER_ENEMY[k],v)).join('')+tool('patrol','➜ Patrol','Click an enemy, then click the tiles it should walk to')+tool('turn','↻ Turn','Click an enemy to turn it a quarter: where a heron stabs, a cobra looks, a crab runs')+tool('erase','✕ Enemy','Remove an enemy')+'</div>'+
    '<div id="builder-grid" class="builder-grid" style="grid-template-columns:repeat('+w+',1fr)">'+m.map.map((row,y)=>[...row].map((ch,x)=>{
      const g=m.guards.findIndex(q=>q.spawn[0]===x&&q.spawn[1]===y),patrol=escapeBuilderSelected>=0?m.guards[escapeBuilderSelected]?.patrol.findIndex(([px,py])=>px===x&&py===y)??-1:-1;
      return '<div class="builder-cell'+(g>=0&&g===escapeBuilderSelected?' builder-selected':'')+'" data-x="'+x+'" data-y="'+y+'" style="background:'+ESCAPE_BUILDER_LOOK[ch][0]+'">'+(g>=0?ESCAPE_BUILDER_ENEMY[m.guards[g].kind]+'<b class="builder-facing">'+ESCAPE_BUILDER_ARROW[((Math.round((m.guards[g].facing??Math.PI)/(Math.PI/2))%4)+4)%4]+'</b>':ESCAPE_BUILDER_LOOK[ch][1])+(patrol>=0?'<i>'+(patrol+1)+'</i>':'')+'</div>';}).join('')).join('')+'</div>'+
    '<p class="builder-status'+(problems.length?' builder-bad':'')+'">'+(problems.length?'⚠ '+problems.map(escapeHtml).join(' '):'✓ Ready to play. Treasure in level: '+B.treasureTotal(m)+'.')+'</p>'+
    '<div class="builder-actions"><button id="builder-play" class="escape-primary"'+(problems.length?' disabled':'')+'>▶ Playtest</button><button id="builder-save" class="escape-secondary">Save</button><button id="builder-new" class="escape-secondary">New</button><button id="builder-share" class="escape-secondary">Share</button><button id="builder-import" class="escape-secondary">Import</button></div>'+
    '<textarea id="builder-text" class="builder-text" style="display:none" placeholder="Paste a shared level here, then press Import again."></textarea>'+
    '<h3>My levels</h3><div class="builder-list">'+(B.loadAll(ESCAPE_BUILDER_STORE).map(l=>'<div class="builder-saved"><b>'+escapeHtml(l.name)+'</b> <span>'+l.map[0].length+'×'+l.map.length+' · '+l.guards.length+' enemies</span><button data-play="'+l.id+'">Play</button><button data-edit="'+l.id+'">Edit</button><button data-delete="'+l.id+'">Delete</button></div>').join('')||'<p>No saved levels yet. Saved levels stay in this browser.</p>')+'</div>';
  wireEscapeBuilder();
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function escapeBuilderApply(x,y){
  const m=escapeBuilderModel,B=EscapeBuilder,t=escapeBuilderTool,g=m.guards.findIndex(q=>q.spawn[0]===x&&q.spawn[1]===y);
  if(t==='patrol'){if(g>=0){escapeBuilderSelected=g;return true;}return escapeBuilderSelected>=0&&B.addPatrol(m,escapeBuilderSelected,x,y);}
  if(t==='erase')return B.removeEnemy(m,x,y);
  if(t==='turn')return B.turnEnemy(m,x,y);
  if(t.startsWith('enemy:')){const ok=B.addEnemy(m,t.slice(6),x,y);if(ok)escapeBuilderSelected=m.guards.length-1;return ok;}
  return B.paint(m,x,y,t);
}
function wireEscapeBuilder(){
  const m=escapeBuilderModel,B=EscapeBuilder,$=id=>document.getElementById(id);
  $('builder-back').onclick=closeEscapeBuilder;
  $('builder-name').onchange=e=>{m.name=e.target.value;};$('builder-brief').onchange=e=>{m.brief=e.target.value;};
  $('builder-w').onchange=$('builder-h').onchange=()=>{escapeBuilderModel=B.resize(m,Number($('builder-w').value),Number($('builder-h').value));escapeBuilderSelected=-1;renderEscapeBuilder();};
  for(const input of document.querySelectorAll('[data-count]'))input.onchange=e=>{m[e.target.dataset.count]=Math.max(0,Math.min(5,Number(e.target.value)||0));renderEscapeBuilder();};
  $('builder-toll').onchange=e=>{m.requiredTreasure=Math.max(0,Math.min(99,Number(e.target.value)||0));renderEscapeBuilder();};
  $('builder-dark').onchange=e=>{m.explore=e.target.checked;};
  for(const b of document.querySelectorAll('[data-tool]'))b.onclick=()=>{escapeBuilderTool=b.dataset.tool;if(!['patrol'].includes(escapeBuilderTool))escapeBuilderSelected=-1;renderEscapeBuilder();};
  const grid=$('builder-grid'),cellAt=e=>{const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.builder-cell');return el?[Number(el.dataset.x),Number(el.dataset.y)]:null;};
  grid.onpointerdown=e=>{e.preventDefault();const c=cellAt(e);if(!c)return;escapeBuilderPainting=!escapeBuilderTool.startsWith('enemy:')&&!['patrol','erase','turn'].includes(escapeBuilderTool)&&!/[@KX]/.test(escapeBuilderTool);if(escapeBuilderApply(...c))renderEscapeBuilder();};
  grid.onpointermove=e=>{if(!escapeBuilderPainting||!e.buttons)return;const c=cellAt(e);if(c&&escapeBuilderModel.map[c[1]][c[0]]!==escapeBuilderTool&&escapeBuilderApply(...c))renderEscapeBuilder();};
  document.onpointerup=()=>{escapeBuilderPainting=false;};
  $('builder-play').onclick=()=>{if(!B.validate(m).length)startEscape({custom:B.toRoute(m)});};
  $('builder-save').onclick=()=>{const ok=B.saveOne(ESCAPE_BUILDER_STORE,m);renderEscapeBuilder();$('builder-save').textContent=ok?'Saved ✓':'Could not save';};
  $('builder-new').onclick=()=>{escapeBuilderModel=B.blank();escapeBuilderSelected=-1;renderEscapeBuilder();};
  $('builder-share').onclick=()=>{const t=$('builder-text');t.style.display='block';t.value=B.exportText(m);t.select();try{navigator.clipboard?.writeText(t.value);}catch(_){}};
  $('builder-import').onclick=()=>{const t=$('builder-text');if(t.style.display!=='block'||!t.value.trim()){t.style.display='block';t.value='';t.focus();return;}const level=B.importText(t.value);if(!level){t.value='';t.placeholder='That text is not a Sally level. Paste the whole line that starts with SALLY1:';return;}escapeBuilderModel=level;renderEscapeBuilder();};
  const saved=B.loadAll(ESCAPE_BUILDER_STORE),byId=id=>saved.find(l=>l.id===id);
  for(const b of document.querySelectorAll('[data-play]'))b.onclick=()=>{const l=byId(b.dataset.play);if(l&&!B.validate(l).length){escapeBuilderModel=l;startEscape({custom:B.toRoute(l)});}};
  for(const b of document.querySelectorAll('[data-edit]'))b.onclick=()=>{const l=byId(b.dataset.edit);if(l){escapeBuilderModel=l;escapeBuilderSelected=-1;renderEscapeBuilder();}};
  for(const b of document.querySelectorAll('[data-delete]'))b.onclick=()=>{B.removeOne(ESCAPE_BUILDER_STORE,b.dataset.delete);renderEscapeBuilder();};
}
