// The level builder screen: paint a map, place Sally, the key, the hatch, treasure, enemies,
// doors and bridges with their triggers, hazards and cold ground; link triggers to what they
// open or wake; then playtest, save in this browser, share as text, or publish to the
// community shelf. The builder needs an admin signed in with a passkey; the community shelf is
// open to every player.
let escapeBuilderModel=null,escapeBuilderTool='#',escapeBuilderColor=0,escapeBuilderPick=null,escapeBuilderPainting=false,escapeBuilderNote='';
const ESCAPE_BUILDER_STORE=(()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})();
const ESCAPE_BUILDER_LOOK={'#':['#2d4a43',''],'.':['#183029',''],'L':['#2f6b45','❀'],'N':['#3b3a32','∴'],'B':['#3c5a5e','⟋'],'M':['#4a3a26','≈'],'~':['#1f5a76','~'],'_':['#07120f',''],'c':['#3d3424','⁘'],'T':['#24452a','෴'],'S':['#2d4a43','⦚'],'@':['#183029','🦎'],'K':['#183029','🔑'],'X':['#1d5a4f','⇩'],'1':['#183029','◆'],'2':['#183029','◆◆'],'3':['#183029','▣']};
const ESCAPE_BUILDER_ENEMY={snake:'🐍',beetle:'🪲',scorpion:'🦂',toad:'🐸',spider:'🕷',cricket:'🦗',moth:'🦋',mimic:'🎁',millipede:'🐛',cobra:'👑',flytrap:'🌺',crab:'🦀',fox:'🦊',heron:'🦩'};
const ESCAPE_BUILDER_TRIGGER={plate:'◉',heavy:'⬛',lever:'⚲'},ESCAPE_BUILDER_HAZARD={vent:'♨',thorns:'⋀',log:'●'};
const ESCAPE_BUILDER_ARROW=['→','↓','←','↑'];

function escapeBuilderApi(path,options={}){return fetch('/api/'+path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});}
function escapeBuilderShow(){
  escapeAbandonRun?.();resetGameState();gameState='builder';
  for(const id of ['start-menu-container','game-container','escape-select'])document.getElementById(id).style.display='none';
  document.getElementById('escape-result').style.display='none';document.getElementById('game-area').classList.remove('escape-results-open');
  const panel=document.getElementById('escape-builder');panel.style.display='block';updateToolbar();window.scrollTo?.(0,0);return panel;
}
// Whether this browser holds an admin session (the server's cookie), asked fresh each time a
// locked screen opens, and remembered for the community shelf's admin buttons.
let escapeAdminSignedIn=false;
async function escapeAdminStatus(){try{const r=await escapeBuilderApi('admin/status');if(r.ok){const s=await r.json();escapeAdminSignedIn=Boolean(s.signedIn);return s;}}catch(_){}escapeAdminSignedIn=false;return null;}
async function openEscapeBuilder(model){
  const panel=escapeBuilderShow();if(model)escapeBuilderModel=model;
  if(!escapeAdminSignedIn){panel.innerHTML='<p>Checking…</p>';const s=await escapeAdminStatus();if(!s?.signedIn){renderEscapeAdminLock({title:'Level builder',next:()=>openEscapeBuilder(),status:s});return;}}
  escapeBuilderModel=escapeBuilderModel||EscapeBuilder.blank();escapeBuilderPick=null;renderEscapeBuilder();
}
function closeEscapeBuilder(){document.getElementById('escape-builder').style.display='none';document.getElementById('start-menu-container').style.display='';gameState='start';resetGameState();}

// Passkeys: the browser's own sign-in (Face ID, a fingerprint, a PIN or a security key). The
// server sends options with binary fields as base64url text; the browser wants them as bytes.
const escapeFromB64url=s=>{s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer;};
const escapeToB64url=b=>{let s='';for(const c of new Uint8Array(b))s+=String.fromCharCode(c);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const escapePasskeysWork=()=>typeof window!=='undefined'&&Boolean(window.PublicKeyCredential&&navigator.credentials)&&window.isSecureContext!==false;
async function escapePasskeyCreate(code,name){
  const begin=await escapeBuilderApi('admin/register/begin',{method:'POST',body:JSON.stringify({code})});const options=await begin.json().catch(()=>({}));
  if(!begin.ok)throw new Error(options.error||'The server refused.');
  const pk=options.publicKey;pk.challenge=escapeFromB64url(pk.challenge);pk.user.id=escapeFromB64url(pk.user.id);pk.excludeCredentials=(pk.excludeCredentials||[]).map(c=>({...c,id:escapeFromB64url(c.id)}));
  const cred=await navigator.credentials.create({publicKey:pk});
  const credential={id:cred.id,rawId:escapeToB64url(cred.rawId),type:cred.type,response:{clientDataJSON:escapeToB64url(cred.response.clientDataJSON),attestationObject:escapeToB64url(cred.response.attestationObject)}};
  const finish=await escapeBuilderApi('admin/register/finish',{method:'POST',body:JSON.stringify({credential,name})});const body=await finish.json().catch(()=>({}));
  if(!finish.ok)throw new Error(body.error||'The passkey was not saved.');escapeAdminSignedIn=true;
}
async function escapePasskeySignIn(){
  const begin=await escapeBuilderApi('admin/login/begin',{method:'POST',body:'{}'});const options=await begin.json().catch(()=>({}));
  if(!begin.ok)throw new Error(options.error||'The server refused.');
  const pk=options.publicKey;pk.challenge=escapeFromB64url(pk.challenge);pk.allowCredentials=(pk.allowCredentials||[]).map(c=>({...c,id:escapeFromB64url(c.id)}));
  const cred=await navigator.credentials.get({publicKey:pk});
  const credential={id:cred.id,rawId:escapeToB64url(cred.rawId),type:cred.type,response:{clientDataJSON:escapeToB64url(cred.response.clientDataJSON),authenticatorData:escapeToB64url(cred.response.authenticatorData),signature:escapeToB64url(cred.response.signature),userHandle:cred.response.userHandle?escapeToB64url(cred.response.userHandle):null}};
  const finish=await escapeBuilderApi('admin/login/finish',{method:'POST',body:JSON.stringify({credential})});
  if(!finish.ok){const body=await finish.json().catch(()=>({}));throw new Error(body.error||'That passkey was not accepted.');}escapeAdminSignedIn=true;
}
const escapePasskeyError=e=>e?.name==='NotAllowedError'?'The passkey prompt was closed or timed out. Try again.':e?.name==='InvalidStateError'?'This device already has a passkey here. Use Sign in instead.':e?.message||'Something went wrong.';

// The locked screen for the builder and the admin area: sign in with a passkey, or create one
// with the server's one-time setup code (first time) or an invite code from a signed-in admin.
function renderEscapeAdminLock({title='Admin',next=()=>openEscapeAdmin(),status=null,message=''}={}){
  const panel=document.getElementById('escape-builder'),setup=Boolean(status?.setupNeeded),works=escapePasskeysWork();
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Menu</button><h2>'+escapeHtml(title)+'</h2></div><div id="builder-lock" class="builder-lock">'+
    (title==='Level builder'?'<p>The builder is for level makers. Sign in with your admin passkey to start building.</p>':'<p>Admins manage passkeys and the community shelf here.</p>')+
    (!works?'<p class="builder-bad">Passkeys need the game opened over https (or on localhost) in a current browser.</p>':'')+
    (status===null?'<p class="builder-bad">Could not reach the server.</p>':setup?'<p><b>First time:</b> no admin passkey exists yet. Enter the one-time setup code printed in the server log, then create a passkey on this device.</p>':'<button id="admin-signin" class="escape-primary">Sign in with passkey</button>')+
    '<details'+(setup?' open':'')+'><summary>'+(setup?'Set up the first passkey':'Add this device with an invite code')+'</summary><div class="builder-lock">'+
    '<input id="admin-code" autocomplete="one-time-code" autocapitalize="characters" maxlength="20" placeholder="'+(setup?'Setup code from the server log':'Invite code')+'">'+
    '<input id="admin-name" maxlength="40" placeholder="Name for this device (e.g. My phone)"><button id="admin-create" class="escape-'+(setup?'primary':'secondary')+'">Create passkey</button></div></details>'+
    (message?'<p class="builder-bad">'+escapeHtml(message)+'</p>':'')+'<p>Want to play levels others have made? Open <button type="button" id="builder-to-community" class="escape-secondary">Community levels</button></p></div>';
  const $=id=>document.getElementById(id),again=m=>renderEscapeAdminLock({title,next,status,message:m});
  $('builder-back').onclick=closeEscapeBuilder;$('builder-to-community').onclick=()=>openEscapeCommunity();
  if($('admin-signin'))$('admin-signin').onclick=async()=>{try{await escapePasskeySignIn();next();}catch(e){again(escapePasskeyError(e));}};
  $('admin-create').onclick=async()=>{const code=$('admin-code').value.trim();if(!code){$('admin-code').focus?.();return;}
    try{await escapePasskeyCreate(code,$('admin-name').value.trim());next();}catch(e){again(escapePasskeyError(e));}};
}

// The admin area: passkeys (list, add another device, remove one), the community shelf, sign out.
async function openEscapeAdmin(message=''){
  const panel=escapeBuilderShow();panel.innerHTML='<p>Checking…</p>';
  let list=null;try{const r=await escapeBuilderApi('admin/passkeys');if(r.ok){list=await r.json();escapeAdminSignedIn=true;}}catch(_){}
  if(!list){const s=await escapeAdminStatus();renderEscapeAdminLock({title:'Admin',status:s});return;}
  let levels=[];try{const r=await fetch('/api/levels');if(r.ok)levels=(await r.json()).levels||[];}catch(_){}
  const day=t=>t?String(t).slice(0,10):'—';
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Menu</button><h2>Admin</h2><button id="admin-builder" class="escape-secondary">Level builder</button><button id="admin-signout" class="escape-secondary">Sign out</button></div>'+
    (message?'<p class="builder-status">'+escapeHtml(message)+'</p>':'')+
    '<h3>Passkeys</h3><div class="builder-list">'+list.passkeys.map(p=>'<div class="builder-saved"><b>'+escapeHtml(p.name)+'</b> <span>added '+day(p.createdAt)+' · last used '+day(p.lastUsedAt)+(p.id===list.current?' · this session':'')+'</span>'+
      (list.passkeys.length>1?'<button data-premove="'+escapeHtml(p.id)+'">Remove</button>':'')+'</div>').join('')+'</div>'+
    '<p><button id="admin-invite" class="escape-secondary">Invite another device</button> <button id="admin-here" class="escape-secondary">Add a passkey on this device</button></p><p id="admin-invite-out"></p>'+
    '<h3>Community shelf</h3><p>'+levels.length+' published level'+(levels.length===1?'':'s')+'. <button id="admin-community" class="escape-secondary">Open the shelf</button> to play, copy or take levels down.</p>';
  const $=id=>document.getElementById(id);
  $('builder-back').onclick=closeEscapeBuilder;$('admin-builder').onclick=()=>openEscapeBuilder();$('admin-community').onclick=()=>openEscapeCommunity();
  $('admin-signout').onclick=async()=>{try{await escapeBuilderApi('admin/logout',{method:'POST',body:'{}'});}catch(_){}escapeAdminSignedIn=false;closeEscapeBuilder();};
  $('admin-invite').onclick=async()=>{const out=$('admin-invite-out');try{const r=await escapeBuilderApi('admin/invite',{method:'POST',body:'{}'});const b=await r.json();
    out.innerHTML=r.ok?'Invite code: <b class="admin-code">'+escapeHtml(b.code)+'</b> — on the other device open Admin, choose “Add this device with an invite code” and enter it within '+b.minutes+' minutes. It works once.':'<span class="builder-bad">'+escapeHtml(b.error||'Could not make an invite.')+'</span>';}catch(_){out.textContent='Could not reach the server.';}};
  $('admin-here').onclick=async()=>{try{await escapePasskeyCreate('',prompt('Name for this passkey','Another passkey')||'');openEscapeAdmin('Passkey added.');}catch(e){openEscapeAdmin(escapePasskeyError(e));}};
  for(const b of document.querySelectorAll('[data-premove]'))b.onclick=async()=>{if(!confirm('Remove this passkey? It will no longer sign in.'))return;
    let note='Passkey removed.';try{const r=await escapeBuilderApi('admin/passkeys/'+encodeURIComponent(b.dataset.premove),{method:'DELETE'});if(!r.ok)note=(await r.json().catch(()=>({}))).error||'Could not remove it.';}catch(_){note='Could not reach the server.';}openEscapeAdmin(note);};
}

const escapeBuilderGuardIndex=id=>escapeBuilderModel.guards.findIndex(g=>g.id===id);
function escapeBuilderLabel(id){
  const m=escapeBuilderModel,B=EscapeBuilder;
  if(id==='key')return 'the key';if(id.startsWith('chest:'))return 'the chest at '+id.slice(6);
  const t=m.triggers.find(q=>q.id===id);if(t)return 'a '+B.TRIGGERS[t.type].toLowerCase()+' at '+t.at.join(',');
  const d=m.doors.find(q=>q.id===id);if(d)return 'the '+B.doorName(d).toLowerCase();
  const g=m.guards.find(q=>q.id===id);if(g)return 'the '+B.ENEMIES[g.kind].toLowerCase()+' at '+g.spawn.join(',');return id;
}
// What the selection is linked with, both ways, for highlighting and the settings panel.
function escapeBuilderLinked(){
  const m=escapeBuilderModel,B=EscapeBuilder,p=escapeBuilderPick;if(!p)return new Set();
  return new Set(p.kind==='source'||p.kind==='trigger'?B.linksFrom(m,p.id):p.kind==='door'||p.kind==='guard'?B.linksTo(m,p.id):[]);
}
function escapeBuilderCell(x,y,ch,linked){
  const m=escapeBuilderModel,B=EscapeBuilder,p=escapeBuilderPick,g=B.guardAt(m,x,y),t=B.triggerAt(m,x,y),h=B.hazardAt(m,x,y),d=B.doorAt(m,x,y);
  const source=B.sourceAt(m,x,y),cold=m.cold.some(q=>q[0]===x&&q[1]===y),warm=m.warm.some(q=>q[0]===x&&q[1]===y);
  let bg=ESCAPE_BUILDER_LOOK[ch][0],glyph=ESCAPE_BUILDER_LOOK[ch][1],cls='builder-cell';
  if(d){const [r,gr,b]=B.COLORS[d.color][1];bg=d.bridge?'repeating-linear-gradient(90deg,rgb('+r+','+gr+','+b+') 0 3px,#5a4630 3px 8px)':'rgb('+Math.round(r*.55)+','+Math.round(gr*.55)+','+Math.round(b*.55)+')';glyph=d.bridge?'═':'▮';cls+=' builder-door';}
  if(warm&&!glyph)glyph='◍';
  if(h){glyph=ESCAPE_BUILDER_HAZARD[h.type]+(h.type==='vent'?'<b class="builder-facing">'+ESCAPE_BUILDER_ARROW[h.dir]+'</b>':'');if(h.type==='log'&&h.to&&h.to[0]===x&&h.to[1]===y)glyph='○';}
  if(t){const color=B.linksFrom(m,t.id).map(id=>m.doors.find(q=>q.id===id)).find(Boolean);glyph='<span style="color:'+(color?'rgb('+B.COLORS[color.color][1].join(',')+')':'#c9c9b8')+'">'+ESCAPE_BUILDER_TRIGGER[t.type]+'</span>';}
  if(g)glyph=ESCAPE_BUILDER_ENEMY[g.kind]+'<b class="builder-facing">'+ESCAPE_BUILDER_ARROW[((Math.round((g.facing??Math.PI)/(Math.PI/2))%4)+4)%4]+'</b>'+(g.sleep?'<i class="builder-zz">z</i>':'');
  if(cold)cls+=' builder-cold';
  const picked=p&&((p.kind==='guard'&&g?.id===p.id)||(p.kind==='door'&&d?.id===p.id)||(p.kind==='trigger'&&t?.id===p.id)||(p.kind==='hazard'&&h?.id===p.id)||(p.kind==='source'&&source===p.id&&!t));
  if(picked)cls+=' builder-selected';
  if((g&&linked.has(g.id))||(d&&linked.has(d.id))||(source&&linked.has(source)))cls+=' builder-linked';
  const patrolGuard=p?.kind==='guard'?m.guards.find(q=>q.id===p.id):null,step=patrolGuard?patrolGuard.patrol.findIndex(q=>q[0]===x&&q[1]===y):-1;
  return '<div class="'+cls+'" data-x="'+x+'" data-y="'+y+'" style="background:'+bg+'">'+glyph+(step>=0?'<i>'+(step+1)+'</i>':'')+'</div>';
}
function escapeBuilderInspector(){
  const m=escapeBuilderModel,B=EscapeBuilder,p=escapeBuilderPick;
  if(!p)return '<div class="builder-inspector"><b>Nothing selected.</b> Use ☝ Select to pick an enemy, door, trigger or hazard and change its settings. Use 🔗 Link to tie triggers (plates, levers, the key, a chest) to doors, bridges or sleeping enemies.</div>';
  const links=ids=>ids.length?ids.map(id=>escapeHtml(escapeBuilderLabel(id))).join(', '):'nothing yet';
  let html='';
  if(p.kind==='guard'){const g=m.guards.find(q=>q.id===p.id);if(!g)return '';
    html='<b>'+ESCAPE_BUILDER_ENEMY[g.kind]+' '+B.ENEMIES[g.kind]+'</b> at '+g.spawn.join(',')+' · faces '+ESCAPE_BUILDER_ARROW[((Math.round((g.facing??Math.PI)/(Math.PI/2))%4)+4)%4]+
      (B.POSTED.has(g.kind)?' · keeps its post':' · walks '+g.patrol.length+' patrol point'+(g.patrol.length===1?'':'s')+' <button data-insp="clear-patrol">Clear patrol</button>')+
      '<label class="builder-check"><input type="checkbox" data-insp="sleep"'+(g.sleep?' checked':'')+'> Asleep until woken</label>'+(g.sleep?' Woken by: '+links(B.linksTo(m,g.id)):'');}
  else if(p.kind==='door'){const d=m.doors.find(q=>q.id===p.id);if(!d)return '';
    html='<b>'+B.doorName(d)+'</b> ('+d.tiles.length+' tile'+(d.tiles.length===1?'':'s')+') <select data-insp="mode">'+Object.entries(B.MODES).filter(([k])=>k!=='crumble'||d.bridge).map(([k,v])=>'<option value="'+k+'"'+(d.mode===k?' selected':'')+'>'+v+'</option>').join('')+'</select>'+
      (['timed','once'].includes(d.mode)?' <label>Seconds <input type="number" min="2" max="20" data-insp="seconds" value="'+d.seconds+'"></label>':'')+'<br>Triggered by: '+links(B.linksTo(m,d.id));}
  else if(p.kind==='trigger'){const t=m.triggers.find(q=>q.id===p.id);if(!t)return '';
    html='<b>'+ESCAPE_BUILDER_TRIGGER[t.type]+' '+B.TRIGGERS[t.type]+'</b> at '+t.at.join(',')+'<br>Opens or shuts: '+links(B.linksFrom(m,t.id));}
  else if(p.kind==='source')html='<b>'+escapeHtml(escapeBuilderLabel(p.id))+'</b><br>Taking it affects: '+links(B.linksFrom(m,p.id));
  else if(p.kind==='hazard'){const h=m.hazards.find(q=>q.id===p.id);if(!h)return '';
    html='<b>'+ESCAPE_BUILDER_HAZARD[h.type]+' '+B.HAZARDS[h.type]+'</b> at '+h.at.join(',')+' <select data-insp="speed">'+Object.entries(B.SPEEDS).map(([k,v])=>'<option value="'+k+'"'+(h.speed===k?' selected':'')+'>'+v+'</option>').join('')+'</select>'+
      '<label class="builder-check"><input type="checkbox" data-insp="offset"'+(h.offset?' checked':'')+'> Half a beat later</label>'+
      (h.type==='vent'?' <label>Reach <input type="number" min="1" max="6" data-insp="length" value="'+h.length+'"></label> · ↻ Turn sets its direction':'')+
      (h.type==='log'?' · '+(h.to?'rolls to '+h.to.join(','):'<b>click a tile in the same row or column to set where it rolls to</b>'):'');}
  return '<div class="builder-inspector">'+html+'</div>';
}
function renderEscapeBuilder(){
  const m=escapeBuilderModel,B=EscapeBuilder,panel=document.getElementById('escape-builder'),w=m.map[0].length,h=m.map.length;
  const tool=(id,label,title)=>'<button class="builder-tool'+(escapeBuilderTool===id?' builder-tool-on':'')+'" data-tool="'+id+'" title="'+escapeHtml(title)+'">'+label+'</button>';
  const problems=B.validate(m),linked=escapeBuilderLinked();
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Menu</button><h2>Level builder</h2>'+
    '<label>Name <input id="builder-name" maxlength="40" value="'+escapeHtml(m.name)+'"></label><label>Brief <input id="builder-brief" maxlength="140" value="'+escapeHtml(m.brief)+'"></label><label>Made by <input id="builder-author" maxlength="30" value="'+escapeHtml(m.author||'')+'"></label></div>'+
    '<div class="builder-settings"><label>Width <input id="builder-w" type="number" min="'+B.LIMITS.minW+'" max="'+B.LIMITS.maxW+'" value="'+w+'"></label><label>Height <input id="builder-h" type="number" min="'+B.LIMITS.minH+'" max="'+B.LIMITS.maxH+'" value="'+h+'"></label>'+
    ['burrows','pebbles','tongues'].map(k=>'<label>'+k[0].toUpperCase()+k.slice(1)+' <input data-count="'+k+'" type="number" min="0" max="5" value="'+m[k]+'"></label>').join('')+
    '<label>Hatch toll <input id="builder-toll" type="number" min="0" max="99" value="'+m.requiredTreasure+'"></label><label class="builder-check"><input id="builder-dark" type="checkbox"'+(m.explore?' checked':'')+'> Dark (explore)</label></div>'+
    '<div class="builder-palette"><span>Tiles</span>'+Object.entries(B.TILES).map(([k,v])=>tool(k,ESCAPE_BUILDER_LOOK[k][1]||v[0],v)).join('')+
    '<span>Places</span>'+Object.entries(B.MARKS).map(([k,v])=>tool(k,ESCAPE_BUILDER_LOOK[k][1],v)).join('')+'</div>'+
    '<div class="builder-palette"><span>Enemies</span>'+Object.entries(B.ENEMIES).map(([k,v])=>tool('enemy:'+k,ESCAPE_BUILDER_ENEMY[k],v)).join('')+'</div>'+
    '<div class="builder-palette"><span>Doors</span>'+B.COLORS.map(([name,rgb],i)=>'<button class="builder-swatch'+(escapeBuilderColor===i?' builder-tool-on':'')+'" data-color="'+i+'" title="'+name+'" style="background:rgb('+rgb.join(',')+')"></button>').join('')+
    tool('door','▮ Door','Paint door tiles in the chosen colour')+tool('bridge','═ Bridge','Paint bridge tiles in the chosen colour (over a gap or water)')+
    '<span>Triggers</span>'+Object.entries(B.TRIGGERS).map(([k,v])=>tool('trig:'+k,ESCAPE_BUILDER_TRIGGER[k]+' '+v.split(' ')[0],v)).join('')+
    '<span>Hazards</span>'+Object.entries(B.HAZARDS).map(([k,v])=>tool('haz:'+k,ESCAPE_BUILDER_HAZARD[k]+' '+v.split(' ').at(-1),v+(k==='vent'?' (place it in a wall)':k==='log'?' (click its start, then where it rolls to)':''))).join('')+
    '<span>Ground</span>'+tool('cold','❄ Cold','Cold ground chills Sally')+tool('warm','◍ Warm stone','A warm stone thaws Sally')+'</div>'+
    '<div class="builder-palette"><span>Tools</span>'+tool('select','☝ Select','Pick something to see and change its settings')+tool('link','🔗 Link','Click a trigger, the key or a chest, then click doors, bridges or enemies to link or unlink them')+
    tool('patrol','➜ Patrol','Click an enemy, then click the tiles it should walk to, in order')+tool('turn','↻ Turn','Turn an enemy or a vent a quarter turn')+tool('remove','✕ Remove','Remove an enemy, trigger, hazard, door tile or ground mark')+'</div>'+
    escapeBuilderInspector()+
    '<div id="builder-grid" class="builder-grid" style="grid-template-columns:repeat('+w+',1fr)">'+m.map.map((row,y)=>[...row].map((ch,x)=>escapeBuilderCell(x,y,ch,linked)).join('')).join('')+'</div>'+
    (escapeBuilderNote?'<p class="builder-note">'+escapeHtml(escapeBuilderNote)+'</p>':'')+
    '<p class="builder-status'+(problems.length?' builder-bad':'')+'">'+(problems.length?'⚠ '+problems.map(escapeHtml).join(' '):'✓ Ready to play. Treasure in level: '+B.treasureTotal(m)+'.')+'</p>'+
    '<div class="builder-actions"><button id="builder-play" class="escape-primary"'+(problems.length?' disabled':'')+'>▶ Playtest</button><button id="builder-save" class="escape-secondary">Save</button><button id="builder-publish" class="escape-secondary"'+(problems.length?' disabled':'')+'>⇪ Publish to community</button>'+
    '<button id="builder-new" class="escape-secondary">New</button><button id="builder-share" class="escape-secondary">Share</button><button id="builder-import" class="escape-secondary">Import</button><button id="builder-community" class="escape-secondary">Community levels</button><button id="builder-admin" class="escape-secondary">Admin</button></div>'+
    '<textarea id="builder-text" class="builder-text" style="display:none" placeholder="Paste a shared level here, then press Import again."></textarea>'+
    '<h3>My levels</h3><div class="builder-list">'+(B.loadAll(ESCAPE_BUILDER_STORE).map(l=>'<div class="builder-saved"><b>'+escapeHtml(l.name)+'</b> <span>'+l.map[0].length+'×'+l.map.length+' · '+l.guards.length+' enemies</span><button data-play="'+l.id+'">Play</button><button data-edit="'+l.id+'">Edit</button><button data-delete="'+l.id+'">Delete</button></div>').join('')||'<p>No saved levels yet. Saved levels stay in this browser; publish one to share it with every player.</p>')+'</div>';
  wireEscapeBuilder();
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// The topmost thing on a tile, for Select and Link.
function escapeBuilderPickAt(x,y){
  const m=escapeBuilderModel,B=EscapeBuilder,g=B.guardAt(m,x,y),t=B.triggerAt(m,x,y),h=B.hazardAt(m,x,y),d=B.doorAt(m,x,y),s=B.sourceAt(m,x,y);
  return g?{kind:'guard',id:g.id}:t?{kind:'trigger',id:t.id}:s?{kind:'source',id:s}:h?{kind:'hazard',id:h.id}:d?{kind:'door',id:d.id}:null;
}
function escapeBuilderApply(x,y){
  const m=escapeBuilderModel,B=EscapeBuilder,t=escapeBuilderTool,p=escapeBuilderPick;escapeBuilderNote='';
  if(t==='select'){escapeBuilderPick=escapeBuilderPickAt(x,y);return true;}
  if(t==='link'){
    const log=p?.kind==='hazard'&&m.hazards.find(q=>q.id===p.id&&q.type==='log');
    if(log&&!log.to){if(!B.setLogEnd(m,log.id,x,y))escapeBuilderNote='A log rolls along a clear straight line in the same row or column.';return true;}
    const here=escapeBuilderPickAt(x,y);if(!here){escapeBuilderPick=null;return true;}
    if(['source','trigger'].includes(here.kind)){escapeBuilderPick=here;escapeBuilderNote='Now click the doors, bridges or enemies it should affect. Click them again to unlink.';return true;}
    if(['door','guard'].includes(here.kind)&&p&&['source','trigger'].includes(p.kind)){const r=B.toggleLink(m,p.id,here.id);escapeBuilderNote=r.ok?(r.linked?'Linked ':'Unlinked ')+escapeBuilderLabel(p.id)+(r.linked?' to ':' from ')+escapeBuilderLabel(here.id)+'.':r.reason;return true;}
    escapeBuilderPick=here;escapeBuilderNote='First click a trigger, the key or a chest, then the doors or enemies it should affect.';return true;
  }
  if(t==='patrol'){const g=B.guardAt(m,x,y);if(g){escapeBuilderPick={kind:'guard',id:g.id};return true;}const i=p?.kind==='guard'?escapeBuilderGuardIndex(p.id):-1;if(i<0){escapeBuilderNote='Click an enemy first.';return true;}return B.addPatrol(m,i,x,y);}
  if(t==='remove'){const ok=B.removeAt(m,x,y);if(ok)escapeBuilderPick=null;return ok;}
  if(t==='turn')return B.turnEnemy(m,x,y);
  if(t.startsWith('enemy:')){const ok=B.addEnemy(m,t.slice(6),x,y);if(ok)escapeBuilderPick={kind:'guard',id:B.guardAt(m,x,y).id};return ok;}
  if(t==='door'||t==='bridge'){const ok=B.paintDoor(m,x,y,escapeBuilderColor,t==='bridge');if(ok)escapeBuilderPick={kind:'door',id:(t==='bridge'?'b':'d')+escapeBuilderColor};return ok;}
  if(t.startsWith('trig:')){const ok=B.addTrigger(m,t.slice(5),x,y);if(ok){escapeBuilderPick={kind:'trigger',id:B.triggerAt(m,x,y).id};escapeBuilderNote='Now use 🔗 Link: click this trigger, then the doors or bridges it should work.';}else escapeBuilderNote='Triggers go on plain floor, leaves, gravel or mud.';return true;}
  if(t.startsWith('haz:')){
    const type=t.slice(4),log=p?.kind==='hazard'&&m.hazards.find(q=>q.id===p.id&&q.type==='log'&&!q.to);
    if(type==='log'&&log){if(!B.setLogEnd(m,log.id,x,y))escapeBuilderNote='A log rolls along a clear straight line in the same row or column.';return true;}
    const ok=B.addHazard(m,type,x,y);if(ok){escapeBuilderPick={kind:'hazard',id:B.hazardAt(m,x,y).id};if(type==='log')escapeBuilderNote='Now click where the log rolls to, in the same row or column.';}
    else escapeBuilderNote=type==='vent'?'A vent sits in a wall tile next to open floor.':'Hazards go on open floor.';return true;
  }
  if(t==='cold'||t==='warm')return B.paintClimate(m,t,x,y);
  return B.paint(m,x,y,t);
}
const escapeBuilderDrags=t=>Object.keys(EscapeBuilder.TILES).includes(t)||['1','2','3','door','bridge','cold','warm'].includes(t);
function wireEscapeBuilder(){
  const m=escapeBuilderModel,B=EscapeBuilder,$=id=>document.getElementById(id),rerender=()=>renderEscapeBuilder();
  $('builder-back').onclick=closeEscapeBuilder;
  $('builder-name').onchange=e=>{m.name=e.target.value;};$('builder-brief').onchange=e=>{m.brief=e.target.value;};$('builder-author').onchange=e=>{m.author=e.target.value;};
  $('builder-w').onchange=$('builder-h').onchange=()=>{escapeBuilderModel=B.resize(m,Number($('builder-w').value),Number($('builder-h').value));escapeBuilderPick=null;rerender();};
  for(const input of document.querySelectorAll('[data-count]'))input.onchange=e=>{m[e.target.dataset.count]=Math.max(0,Math.min(5,Number(e.target.value)||0));rerender();};
  $('builder-toll').onchange=e=>{m.requiredTreasure=Math.max(0,Math.min(99,Number(e.target.value)||0));rerender();};
  $('builder-dark').onchange=e=>{m.explore=e.target.checked;};
  for(const b of document.querySelectorAll('[data-tool]'))b.onclick=()=>{escapeBuilderTool=b.dataset.tool;escapeBuilderNote='';if(!['patrol','link','select','turn'].includes(escapeBuilderTool))escapeBuilderPick=null;rerender();};
  for(const b of document.querySelectorAll('[data-color]'))b.onclick=()=>{escapeBuilderColor=Number(b.dataset.color);if(!['door','bridge'].includes(escapeBuilderTool))escapeBuilderTool='door';rerender();};
  const p=escapeBuilderPick,insp=name=>document.querySelector('[data-insp="'+name+'"]');
  if(insp('clear-patrol'))insp('clear-patrol').onclick=()=>{B.clearPatrol(m,escapeBuilderGuardIndex(p.id));rerender();};
  if(insp('sleep'))insp('sleep').onchange=e=>{B.setSleep(m,p.id,e.target.checked);rerender();};
  if(insp('mode'))insp('mode').onchange=e=>{B.setDoor(m,p.id,{mode:e.target.value});rerender();};
  if(insp('seconds'))insp('seconds').onchange=e=>{B.setDoor(m,p.id,{seconds:e.target.value});rerender();};
  if(insp('speed'))insp('speed').onchange=e=>{B.setHazard(m,p.id,{speed:e.target.value});rerender();};
  if(insp('offset'))insp('offset').onchange=e=>{B.setHazard(m,p.id,{offset:e.target.checked});rerender();};
  if(insp('length'))insp('length').onchange=e=>{B.setHazard(m,p.id,{length:e.target.value});rerender();};
  const grid=$('builder-grid'),cellAt=e=>{const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.builder-cell');return el?[Number(el.dataset.x),Number(el.dataset.y)]:null;};
  grid.onpointerdown=e=>{e.preventDefault();const c=cellAt(e);if(!c)return;escapeBuilderPainting=escapeBuilderDrags(escapeBuilderTool);if(escapeBuilderApply(...c))rerender();};
  grid.onpointermove=e=>{if(!escapeBuilderPainting||!e.buttons)return;const c=cellAt(e);if(c&&escapeBuilderModel.map[c[1]][c[0]]!==escapeBuilderTool&&escapeBuilderApply(...c))rerender();};
  document.onpointerup=()=>{escapeBuilderPainting=false;};
  $('builder-play').onclick=()=>{if(!B.validate(m).length)startEscape({custom:B.toRoute(m),from:'builder'});};
  $('builder-save').onclick=()=>{const ok=B.saveOne(ESCAPE_BUILDER_STORE,m);rerender();$('builder-save').textContent=ok?'Saved ✓':'Could not save';};
  $('builder-publish').onclick=async()=>{const b=$('builder-publish');b.disabled=true;b.textContent='Publishing…';
    try{const r=await escapeBuilderApi('levels',{method:'POST',body:JSON.stringify({level:B.sanitize(m)})});const body=await r.json().catch(()=>({}));
      if(r.status===401){escapeAdminSignedIn=false;renderEscapeAdminLock({title:'Level builder',next:()=>openEscapeBuilder(),status:await escapeAdminStatus(),message:'Your admin session ended. Sign in again to publish; your level is kept.'});return;}
      b.textContent=r.ok?'Published ✓':'Could not publish';if(!r.ok&&body.error){escapeBuilderNote=body.error;rerender();}}
    catch(_){b.textContent='Could not reach the server';}};
  $('builder-new').onclick=()=>{escapeBuilderModel=B.blank();escapeBuilderPick=null;rerender();};
  $('builder-share').onclick=()=>{const t=$('builder-text');t.style.display='block';t.value=B.exportText(m);t.select();try{navigator.clipboard?.writeText(t.value);}catch(_){}};
  $('builder-import').onclick=()=>{const t=$('builder-text');if(t.style.display!=='block'||!t.value.trim()){t.style.display='block';t.value='';t.focus();return;}const level=B.importText(t.value);if(!level){t.value='';t.placeholder='That text is not a Sally level. Paste the whole line that starts with SALLY';return;}escapeBuilderModel=level;escapeBuilderPick=null;rerender();};
  $('builder-community').onclick=()=>openEscapeCommunity();
  $('builder-admin').onclick=()=>openEscapeAdmin();
  const saved=B.loadAll(ESCAPE_BUILDER_STORE),byId=id=>saved.find(l=>l.id===id);
  for(const b of document.querySelectorAll('[data-play]'))b.onclick=()=>{const l=byId(b.dataset.play);if(l&&!B.validate(l).length){escapeBuilderModel=l;startEscape({custom:B.toRoute(l),from:'builder'});}};
  for(const b of document.querySelectorAll('[data-edit]'))b.onclick=()=>{const l=byId(b.dataset.edit);if(l){escapeBuilderModel=l;escapeBuilderPick=null;rerender();}};
  for(const b of document.querySelectorAll('[data-delete]'))b.onclick=()=>{B.removeOne(ESCAPE_BUILDER_STORE,b.dataset.delete);rerender();};
}

// The community shelf: every published level, open to every player. A signed-in admin can also
// copy a level into the builder or take it down.
const ESCAPE_COMMUNITY_BEST='sally-escape-community-best';
function escapeCommunityBest(){try{return JSON.parse(ESCAPE_BUILDER_STORE?.getItem(ESCAPE_COMMUNITY_BEST)||'{}')||{};}catch(_){return {};}}
function escapeCommunityRecord(id,seconds){const best=escapeCommunityBest();if(!(best[id]<=seconds))best[id]=+seconds.toFixed(1);try{ESCAPE_BUILDER_STORE?.setItem(ESCAPE_COMMUNITY_BEST,JSON.stringify(best));}catch(_){}}
async function openEscapeCommunity(){
  const panel=escapeBuilderShow();panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Menu</button><h2>Community levels</h2></div><p>Loading…</p>';
  document.getElementById('builder-back').onclick=closeEscapeBuilder;
  let levels=null;try{const r=await fetch('/api/levels');if(r.ok)levels=(await r.json()).levels;}catch(_){}
  await escapeAdminStatus();const maker=escapeAdminSignedIn,best=escapeCommunityBest(),B=EscapeBuilder;
  const clean=Array.isArray(levels)?levels.map(l=>({...B.sanitize(l),publishedAt:l.publishedAt})).filter(l=>l.id&&!B.validate(l).length):null;
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Menu</button><h2>Community levels</h2>'+(maker?'<button id="community-builder" class="escape-secondary">Level builder</button>':'')+'</div>'+
    (clean===null?'<p class="builder-bad">Could not reach the community shelf. Try again in a moment.</p>':!clean.length?'<p>No community levels yet. Level makers publish them from the level builder.</p>':
    '<div class="builder-list community-list">'+clean.map(l=>'<div class="builder-saved"><b>'+escapeHtml(l.name)+'</b> <span>'+(l.author?'by '+escapeHtml(l.author)+' · ':'')+l.map[0].length+'×'+l.map.length+' · '+l.guards.length+' enemies'+(best[l.id]?' · your best '+best[l.id]+'s':'')+'</span>'+
      (l.brief?'<em>'+escapeHtml(l.brief)+'</em>':'')+'<button data-cplay="'+l.id+'" class="escape-primary">Play</button>'+(maker?'<button data-cedit="'+l.id+'">Copy to builder</button><button data-cremove="'+l.id+'">Take down</button>':'')+'</div>').join('')+'</div>');
  document.getElementById('builder-back').onclick=closeEscapeBuilder;
  if(maker)document.getElementById('community-builder').onclick=()=>openEscapeBuilder();
  const byId=id=>clean?.find(l=>l.id===id);
  for(const b of document.querySelectorAll('[data-cplay]'))b.onclick=()=>{const l=byId(b.dataset.cplay);if(l)startEscape({custom:B.toRoute(l),from:'community'});};
  for(const b of document.querySelectorAll('[data-cedit]'))b.onclick=()=>{const l=byId(b.dataset.cedit);if(l)openEscapeBuilder({...l,id:'custom-'+Date.now().toString(36)});};
  for(const b of document.querySelectorAll('[data-cremove]'))b.onclick=async()=>{if(!confirm('Take this level off the community shelf for everyone?'))return;
    try{await escapeBuilderApi('levels/'+encodeURIComponent(b.dataset.cremove),{method:'DELETE'});}catch(_){}openEscapeCommunity();};
}
