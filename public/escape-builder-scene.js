// The level builder screen: paint a map, place Sally, the key, the hatch, treasure, enemies,
// doors and bridges with their triggers, hazards and cold ground; link triggers to what they
// open or wake; then playtest, save in this browser, share as text, or publish to the
// community shelf. The builder needs an admin signed in with a passkey; the community shelf is
// open to every player.
let escapeBuilderModel=null,escapeBuilderTool='#',escapeBuilderColor=0,escapeBuilderPick=null,escapeBuilderPainting=false,escapeBuilderNote='',escapeBuilderAnchor=null;
const ESCAPE_BUILDER_STORE=(()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})();
const ESCAPE_BUILDER_LOOK={'#':['#2d4a43',''],'.':['#183029',''],'L':['#2f6b45','❀'],'N':['#3b3a32','∴'],'B':['#3c5a5e','⟋'],'M':['#4a3a26','≈'],'~':['#1f5a76','~'],'_':['#07120f',''],'c':['#3d3424','⁘'],'T':['#24452a','෴'],'o':['#2a3a2a','●'],'t':['#5a5040','≋'],'S':['#2d4a43','⦚'],'@':['#183029','🦎'],'K':['#183029','🔑'],'X':['#1d5a4f','⇩'],'1':['#183029','◆'],'2':['#183029','◆◆'],'3':['#183029','▣']};
const ESCAPE_BUILDER_ENEMY={snake:'🐍',beetle:'🪲',scorpion:'🦂',toad:'🐸',spider:'🕷',cricket:'🦗',moth:'🦋',mimic:'🎁',millipede:'🐛',cobra:'👑',flytrap:'🌺',crab:'🦀',fox:'🦊',heron:'🦩',mantis:'🌿',wasp:'🐝',dragonfly:'🪰',mole:'🐹',bat:'🦇',eel:'🪱',angler:'🎣',fish:'🐟','sea-snake':'🌊',owl:'🦉',gecko:'🐾'};
const ESCAPE_BUILDER_TRIGGER={plate:'◉',heavy:'⬛',lever:'⚲',switch:'▣'},ESCAPE_BUILDER_HAZARD={vent:'♨',thorns:'⋀',log:'●'};
const ESCAPE_BUILDER_ARROW=['→','↓','←','↑'];
// The extras placed on top of the map: what each tool is called and how it looks on the grid.
const ESCAPE_BUILDER_EXTRAS={'layer:shade':['⛱','Awning: shade where the hawk cannot dive'],'layer:glowPlants':['✺','Glow plant: light in a dark level'],'layer:regrowth':['✿','Regrowth bug: grows back a lost tail'],
  cap:['🍄','Bounce cap: click the cap, then where it throws Sally'],wind:['≋','Wind lane: click two opposite corners'],area:['▢','Trigger area: click two corners; walking in can open doors or wake enemies'],
  ants:['🐜','Ant column: click the points of its loop in order'],seedbed:['🌱','Seed bed: click the two banks either side of a gap; a planted seed grows a crossing'],wheel:['✣','Root wheel'],rival:['⚔','Rivals: click two enemies who fight when they meet']};

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
function closeEscapeBuilder(){escapeLeaveWorkshop();document.getElementById('escape-builder').style.display='none';document.getElementById('start-menu-container').style.display='';gameState='start';resetGameState();}

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
    '<h3>Game levels</h3><p>Edit the game’s own escapes behind the scenes: drafts stay in this browser and never reach players. '+(Object.keys(EscapeEdits.all()).length?Object.keys(EscapeEdits.all()).length+' draft'+(Object.keys(EscapeEdits.all()).length===1?'':'s')+' saved'+(EscapeEdits.active()?', testing in game':'')+'. ':'')+'<button id="admin-workshop" class="escape-secondary">Open the level workshop</button></p>'+
    '<h3>Community shelf</h3><p>'+levels.length+' published level'+(levels.length===1?'':'s')+'. <button id="admin-community" class="escape-secondary">Open the shelf</button> to play, copy or take levels down.</p>';
  const $=id=>document.getElementById(id);
  $('builder-back').onclick=closeEscapeBuilder;$('admin-builder').onclick=()=>{escapeLeaveWorkshop();openEscapeBuilder();};$('admin-workshop').onclick=()=>openEscapeWorkshop();$('admin-community').onclick=()=>openEscapeCommunity();
  $('admin-signout').onclick=async()=>{try{await escapeBuilderApi('admin/logout',{method:'POST',body:'{}'});}catch(_){}escapeAdminSignedIn=false;closeEscapeBuilder();};
  $('admin-invite').onclick=async()=>{const out=$('admin-invite-out');try{const r=await escapeBuilderApi('admin/invite',{method:'POST',body:'{}'});const b=await r.json();
    out.innerHTML=r.ok?'Invite code: <b class="admin-code">'+escapeHtml(b.code)+'</b> — on the other device open Admin, choose “Add this device with an invite code” and enter it within '+b.minutes+' minutes. It works once.':'<span class="builder-bad">'+escapeHtml(b.error||'Could not make an invite.')+'</span>';}catch(_){out.textContent='Could not reach the server.';}};
  $('admin-here').onclick=async()=>{try{await escapePasskeyCreate('',prompt('Name for this passkey','Another passkey')||'');openEscapeAdmin('Passkey added.');}catch(e){openEscapeAdmin(escapePasskeyError(e));}};
  for(const b of document.querySelectorAll('[data-premove]'))b.onclick=async()=>{if(!confirm('Remove this passkey? It will no longer sign in.'))return;
    let note='Passkey removed.';try{const r=await escapeBuilderApi('admin/passkeys/'+encodeURIComponent(b.dataset.premove),{method:'DELETE'});if(!r.ok)note=(await r.json().catch(()=>({}))).error||'Could not remove it.';}catch(_){note='Could not reach the server.';}openEscapeAdmin(note);};
}

// The level workshop: every escape in the game, opened in the builder for behind-the-scenes
// edits. A draft is saved per escape in this browser (escape-edits.js), never published; the
// test-in-game switch swaps drafts in for their escapes here, and Export hands them over to be
// brought into the game with scripts/apply-level-edits.cjs.
let escapeBuilderWorkshop=null,escapeBuilderOwnModel=null;
function escapeLeaveWorkshop(){if(!escapeBuilderWorkshop)return;escapeBuilderWorkshop=null;escapeBuilderModel=escapeBuilderOwnModel;escapeBuilderOwnModel=null;escapeBuilderPick=null;}
function escapeWorkshopLabel(key){const [kind,id]=key.split(':'),l=escapeGameLevel(key);if(!l)return key;return (kind==='hidden'?'★ ':(EscapeCatalog.levels.findIndex(x=>x.id===id)+1)+' · ')+l.name;}
function escapeWorkshopEdit(key){
  const draft=EscapeEdits.get(key),model=draft?.model&&EscapeBuilder.sanitize(draft.model);
  if(!escapeBuilderWorkshop)escapeBuilderOwnModel=escapeBuilderModel;
  escapeBuilderWorkshop={key};escapeBuilderModel=model||EscapeBuilder.fromRoute(escapeGameLevel(key));escapeBuilderPick=null;escapeBuilderNote=draft?'Opened your saved draft.':'Opened the game’s version.';openEscapeBuilder();
}
// Download the drafts as a file and show the same text to copy (phones may not keep downloads).
function escapeWorkshopExport(keys,out){
  const data=EscapeEdits.exportFile(keys),text=JSON.stringify(data);if(!data.edits.length)return;
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download='sally-level-edits-'+data.exportedAt.slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}catch(_){}
  if(out){out.style.display='block';out.value=text;out.select?.();}try{navigator.clipboard?.writeText(text);}catch(_){}
}
async function openEscapeWorkshop(message=''){
  const panel=escapeBuilderShow();escapeLeaveWorkshop();
  if(!escapeAdminSignedIn){panel.innerHTML='<p>Checking…</p>';const s=await escapeAdminStatus();if(!s?.signedIn){renderEscapeAdminLock({title:'Admin',next:()=>openEscapeWorkshop(),status:s});return;}}
  const drafts=EscapeEdits.all(),on=EscapeEdits.active(),live=[...EscapeCatalog.levels,...EscapeCatalog.hidden].filter(l=>l.draft).length,day=t=>String(t||'').slice(0,16).replace('T',' ');
  const row=key=>{const d=drafts[key];return '<div class="builder-saved"><b>'+escapeHtml(escapeWorkshopLabel(key))+'</b> <span>'+(d?'✎ draft saved '+day(d.savedAt)+(d.route?'':' · has problems, not playable in game'):'')+'</span><button data-wedit="'+key+'">Edit</button>'+
    (d?'<button data-wexport="'+key+'">Export</button><button data-wdiscard="'+key+'">Discard</button>':'')+'</div>';};
  let list='';EscapeCatalog.levels.forEach((l,i)=>{const chapter=EscapeWorld?.chapters?.find(c=>c.start===i);if(chapter)list+='<h4>'+escapeHtml(chapter.name)+'</h4>';list+=row('level:'+l.id);});
  list+='<h4>The Gilded Burrow and bonus escapes</h4>'+EscapeCatalog.hidden.map(l=>row('hidden:'+l.id)).join('');
  const count=Object.keys(drafts).length;
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Admin</button><h2>Level workshop</h2></div>'+(message?'<p class="builder-status">'+escapeHtml(message)+'</p>':'')+
    '<p>Edit any escape behind the scenes. Drafts stay in this browser: they never reach the community shelf and change nothing for players until you export them and they are brought into the game.</p>'+
    '<label class="builder-check"><input type="checkbox" id="workshop-live"'+(on?' checked':'')+'> <b>Test drafts in game</b> (this browser only): each draft replaces its escape on the map and in the level list, marked ✎. Runs on a draft never count toward stars or progress.</label>'+
    '<p class="builder-hint">'+(on?live+' draft'+(live===1?'':'s')+' in game now.':'Drafts are not in the game right now.')+(on&&live!==Object.values(drafts).filter(d=>d.route).length?' <button id="workshop-reload" class="escape-secondary">Reload to apply your latest drafts</button>':'')+'</p>'+
    '<p><button id="workshop-export" class="escape-secondary"'+(count?'':' disabled')+'>Export all drafts ('+count+')</button></p><textarea id="workshop-text" class="builder-text" style="display:none" readonly></textarea>'+
    '<div class="builder-list">'+list+'</div>';
  const $=id=>document.getElementById(id),out=$('workshop-text');
  $('builder-back').onclick=()=>openEscapeAdmin();
  $('workshop-live').onchange=e=>{EscapeEdits.setActive(e.target.checked);location.reload();};
  if($('workshop-reload'))$('workshop-reload').onclick=()=>location.reload();
  $('workshop-export').onclick=()=>escapeWorkshopExport(null,out);
  for(const b of document.querySelectorAll('[data-wedit]'))b.onclick=()=>escapeWorkshopEdit(b.dataset.wedit);
  for(const b of document.querySelectorAll('[data-wexport]'))b.onclick=()=>escapeWorkshopExport([b.dataset.wexport],out);
  for(const b of document.querySelectorAll('[data-wdiscard]'))b.onclick=()=>{if(!confirm('Discard your draft of '+escapeWorkshopLabel(b.dataset.wdiscard)+'?'))return;EscapeEdits.remove(b.dataset.wdiscard);openEscapeWorkshop('Draft discarded.');};
}

const escapeBuilderGuardIndex=id=>escapeBuilderModel.guards.findIndex(g=>g.id===id);
function escapeBuilderLabel(id){
  const m=escapeBuilderModel,B=EscapeBuilder;
  if(id==='key')return 'the key';if(id.startsWith('chest:'))return 'the chest at '+id.slice(6);
  if(id.startsWith('enter:')){const r=(m.regions||[]).find(q=>'enter:'+q.id===id);return r?'walking into the area '+r.area.slice(0,2).join(',')+'–'+r.area.slice(2).join(','):id;}
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
  // Extras: layers, caps, wind, areas, ant trails, seed beds, the root wheel.
  const hasAt=list=>(list||[]).some(q=>q[0]===x&&q[1]===y),inRect=a=>x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3];let shadow='';
  if(hasAt(m.shade))shadow+='inset 0 -5px 0 #c96a48aa,';if(hasAt(m.glowPlants)&&!glyph)glyph='✺';if(hasAt(m.regrowth)&&!glyph)glyph='✿';
  const wind=(m.wind||[]).find(z=>inRect(z.area));if(wind){bg='linear-gradient(#9ec4e033,#9ec4e033),'+bg;if(!glyph)glyph='<span style="opacity:.55">'+ESCAPE_BUILDER_ARROW[EscapeBuilder.DIRS.findIndex(([dx,dy])=>dx===wind.dir[0]&&dy===wind.dir[1])]+'</span>';}
  if((m.regions||[]).some(r=>inRect(r.area)))shadow+='inset 0 0 0 2px #e8c45a88,';
  const cap=(m.caps||[]).find(c=>c.at[0]===x&&c.at[1]===y);if(cap)glyph='🍄';else if((m.caps||[]).some(c=>c.to&&c.to[0]===x&&c.to[1]===y))glyph='◎';
  const ant=(m.antTrails||[]).findIndex(t=>hasAt(t.path));if(ant>=0&&!glyph)glyph='<span style="color:#d79a60">∙</span>';
  if((m.seedCrossings||[]).some(c=>hasAt(c.banks)))glyph='🌱';else if((m.seedCrossings||[]).some(c=>hasAt(c.tiles)))shadow+='inset 0 0 0 2px #8fc86a88,';
  if(m.rootWheel&&m.rootWheel[0]===x&&m.rootWheel[1]===y)glyph='✣';
  if(g&&(m.rivalries||[]).some(r=>r.includes(g.id)))glyph+='<i class="builder-zz">⚔</i>';
  const lureOf=m.guards.find(q=>q.lure&&q.lure[0]===x&&q.lure[1]===y);if(lureOf&&!g)glyph='<span style="color:#9ff">✦</span>';
  if(escapeBuilderAnchor&&escapeBuilderAnchor[0]===x&&escapeBuilderAnchor[1]===y)shadow+='inset 0 0 0 3px #fff,';
  const picked=p&&((p.kind==='guard'&&g?.id===p.id)||(p.kind==='door'&&d?.id===p.id)||(p.kind==='trigger'&&t?.id===p.id)||(p.kind==='hazard'&&h?.id===p.id)||(p.kind==='source'&&source===p.id&&!t));
  if(picked)cls+=' builder-selected';
  if((g&&linked.has(g.id))||(d&&linked.has(d.id))||(source&&linked.has(source)))cls+=' builder-linked';
  const patrolGuard=p?.kind==='guard'?m.guards.find(q=>q.id===p.id):null,step=patrolGuard?patrolGuard.patrol.findIndex(q=>q[0]===x&&q[1]===y):-1;
  return '<div class="'+cls+'" data-x="'+x+'" data-y="'+y+'" style="background:'+bg+(shadow?';box-shadow:'+shadow.slice(0,-1):'')+'">'+glyph+(step>=0?'<i>'+(step+1)+'</i>':'')+'</div>';
}
// The settings only some enemies have.
function escapeBuilderGuardExtras(g){
  const n=(key,label,step=.1)=>' <label>'+label+' <input type="number" step="'+step+'" data-ginsp="'+key+'" value="'+(g[key]??'')+'"></label>';
  if(g.kind==='angler')return '<br>Lure: '+(g.lure?g.lure.join(','):'not set')+' <button data-insp="set-lure">Pick the lure tile</button>';
  if(g.kind==='crab')return '<br>Runs along <select data-ginsp="axis"><option value="">its facing</option><option value="x"'+(g.axis==='x'?' selected':'')+'>the row</option><option value="y"'+(g.axis==='y'?' selected':'')+'>the column</option></select>'+n('range','up to tiles',1);
  if(g.kind==='heron')return '<br>Looks: '+ESCAPE_BUILDER_ARROW.map((a,i)=>'<label class="builder-check"><input type="checkbox" data-look="'+i+'"'+((g.looks||[]).some(v=>Math.abs((((Math.round(v/(Math.PI/2))%4)+4)%4)-i)<.1)?' checked':'')+'> '+a+'</label>').join('')+n('every','turns every s');
  if(g.kind==='bat')return '<br>'+n('every','pings every s')+n('range','ring reaches tiles');
  if(g.kind==='dragonfly')return '<br>'+n('speed','speed');
  if(g.kind==='scorpion')return '<br><label class="builder-check"><input type="checkbox" data-ginsp="buried"'+(g.buried?' checked':'')+'> Buried until Sally is close</label>'+n('offset','tail rhythm delay s');
  if(g.kind==='owl')return '<br>Its patrol points are its look-outs.';
  return '';
}
function escapeBuilderInspector(){
  const m=escapeBuilderModel,B=EscapeBuilder,p=escapeBuilderPick;
  if(!p)return '<div class="builder-inspector"><b>Nothing selected.</b> Use ☝ Select to pick an enemy, door, trigger or hazard and change its settings. Use 🔗 Link to tie triggers (plates, levers, the key, a chest) to doors, bridges or sleeping enemies.</div>';
  const links=ids=>ids.length?ids.map(id=>escapeHtml(escapeBuilderLabel(id))).join(', '):'nothing yet';
  let html='';
  if(p.kind==='guard'){const g=m.guards.find(q=>q.id===p.id);if(!g)return '';
    html='<b>'+ESCAPE_BUILDER_ENEMY[g.kind]+' '+B.ENEMIES[g.kind]+'</b> at '+g.spawn.join(',')+' · faces '+ESCAPE_BUILDER_ARROW[((Math.round((g.facing??Math.PI)/(Math.PI/2))%4)+4)%4]+
      (B.POSTED.has(g.kind)?' · keeps its post':' · walks '+g.patrol.length+' patrol point'+(g.patrol.length===1?'':'s')+' <button data-insp="clear-patrol">Clear patrol</button>')+
      '<label class="builder-check"><input type="checkbox" data-insp="sleep"'+(g.sleep?' checked':'')+'> Asleep until woken</label>'+(g.sleep?' Woken by: '+links(B.linksTo(m,g.id)):'')+
      escapeBuilderGuardExtras(g)+(m.rivalries||[]).filter(r=>r.includes(g.id)).map(r=>'<br>Rival of '+escapeHtml(escapeBuilderLabel(r[0]===g.id?r[1]:r[0]))).join('');}
  else if(p.kind==='door'){const d=m.doors.find(q=>q.id===p.id);if(!d)return '';
    html='<b>'+B.doorName(d)+'</b> ('+d.tiles.length+' tile'+(d.tiles.length===1?'':'s')+') <select data-insp="mode">'+Object.entries(B.MODES).filter(([k])=>k!=='crumble'||d.bridge).map(([k,v])=>'<option value="'+k+'"'+(d.mode===k?' selected':'')+'>'+v+'</option>').join('')+'</select>'+
      (['timed','once'].includes(d.mode)?' <label>Seconds <input type="number" min="1" max="30" data-insp="seconds" value="'+d.seconds+'"></label>':'')+
      ' <label class="builder-check"><input type="checkbox" data-insp="root"'+(d.root?' checked':'')+'> Roots (seeds can brace them)</label> <label>Name <input data-insp="dname" maxlength="30" value="'+escapeHtml(d.name||'')+'" placeholder="'+B.COLORS[d.color][0]+'"></label>'+
      '<br>Triggered by: '+links(B.linksTo(m,d.id));}
  else if(p.kind==='trigger'){const t=m.triggers.find(q=>q.id===p.id);if(!t)return '';
    html='<b>'+ESCAPE_BUILDER_TRIGGER[t.type]+' '+B.TRIGGERS[t.type]+'</b> at '+t.at.join(',')+'<br>Opens or shuts: '+links(B.linksFrom(m,t.id));}
  else if(p.kind==='source'){const note=m.messages?.[p.id]||{},region=p.id.startsWith('enter:')&&(m.regions||[]).find(r=>'enter:'+r.id===p.id);
    html='<b>'+escapeHtml(escapeBuilderLabel(p.id))+'</b>'+(region?' <label class="builder-check"><input type="checkbox" data-insp="needkey"'+(region.requiresKey?' checked':'')+'> Only once Sally has the key</label>':'')+
      '<br>'+(region?'Walking in':'Taking it')+' affects: '+(B.linksFrom(m,p.id).map(id=>{const d=m.doors.find(q=>q.id===id);return escapeHtml(escapeBuilderLabel(id))+(d&&d.mode!=='shut'?' <label class="builder-check"><input type="checkbox" data-insp-close="'+id+'"'+(m.links.some(l=>l[0]===p.id&&l[1]===id&&l[2]==='close')?' checked':'')+'> closes it</label>':'');}).join(', ')||'nothing yet')+
      '<br><label>Message <input data-insp="message" maxlength="160" size="50" value="'+escapeHtml(note.message||'')+'" placeholder="Somewhere, a passage changes."></label> <label>Objective <input data-insp="objective" maxlength="100" size="30" value="'+escapeHtml(note.objective||'')+'" placeholder="Find the hatch."></label>';}
  else if(p.kind==='hazard'){const h=m.hazards.find(q=>q.id===p.id);if(!h)return '';
    html='<b>'+ESCAPE_BUILDER_HAZARD[h.type]+' '+B.HAZARDS[h.type]+'</b> at '+h.at.join(',')+' <select data-insp="speed">'+Object.entries(B.SPEEDS).map(([k,v])=>'<option value="'+k+'"'+(h.speed===k?' selected':'')+'>'+v+'</option>').join('')+'</select>'+
      '<label class="builder-check"><input type="checkbox" data-insp="offset"'+(h.offset?' checked':'')+'> Half a beat later</label>'+
      (h.type==='vent'?' <label>Reach <input type="number" min="1" max="6" data-insp="length" value="'+h.length+'"></label> · ↻ Turn sets its direction':'')+
      (h.type==='log'?' · '+(h.to?'rolls to '+h.to.join(','):'<b>click a tile in the same row or column to set where it rolls to</b>'):'')+
      '<br>Exact timing (seconds, overrides the speed): <label>every <input type="number" step="0.1" min="0" max="30" data-insp="hperiod" value="'+(h.period??'')+'"></label><label>'+(h.type==='log'?'roll speed':h.type==='vent'?'blowing for':'up for')+' <input type="number" step="0.1" min="0" max="30" data-insp="hon" value="'+(h.on??'')+'"></label><label>delay <input type="number" step="0.1" min="0" max="30" data-insp="hdelay" value="'+(h.delay??'')+'"></label>';}
  else if(p.kind==='wind'){const z=m.wind[p.index];if(!z)return '';const dir=B.DIRS.findIndex(([dx,dy])=>dx===z.dir[0]&&dy===z.dir[1]);
    html='<b>≋ Wind lane</b> '+z.area.slice(0,2).join(',')+'–'+z.area.slice(2).join(',')+' blows <select data-insp="wdir">'+ESCAPE_BUILDER_ARROW.map((a,i)=>'<option value="'+i+'"'+(i===dir?' selected':'')+'>'+a+'</option>').join('')+'</select>'+
      '<label>gust every <input type="number" step="0.1" data-insp="wperiod" value="'+z.period+'"></label><label>lasting <input type="number" step="0.1" data-insp="won" value="'+z.on+'"></label><label>delay <input type="number" step="0.1" data-insp="woffset" value="'+z.offset+'"></label>';}
  else if(p.kind==='ants'){const t=m.antTrails[p.index];if(!t)return '';
    html='<b>🐜 Ant column</b> marching '+t.path.length+' points <label>groups <input type="number" min="1" max="8" data-insp="agroups" value="'+t.groups+'"></label><label>ants per group <input type="number" min="1" max="8" data-insp="asize" value="'+t.size+'"></label><label>speed <input type="number" step="0.1" min="0.3" max="4" data-insp="aspeed" value="'+t.speed+'"></label> <button data-insp="anew">Start a new column</button>';}
  else if(p.kind==='cap'){const c=m.caps[p.index];if(!c)return '';html='<b>🍄 Bounce cap</b> at '+c.at.join(',')+' · '+(c.to?'throws Sally to '+c.to.join(','):'<b>click where it throws Sally</b>');}
  return '<div class="builder-inspector">'+html+'</div>';
}
// Whole-level settings: tools, time, darkness, and the sky and weather.
function escapeBuilderSettings(){
  const m=escapeBuilderModel,num=(k,label,max=600,step=1)=>'<label>'+label+' <input type="number" min="0" max="'+max+'" step="'+step+'" data-set="'+k+'" value="'+(m[k]||0)+'"></label>',
    check=(k,label)=>'<label class="builder-check"><input type="checkbox" data-set="'+k+'"'+(m[k]?' checked':'')+'> '+label+'</label>',
    sky=(k,label,fields)=>'<div class="builder-sky"><label class="builder-check"><input type="checkbox" data-sky="'+k+'"'+(m[k]?' checked':'')+'> '+label+'</label>'+(m[k]?fields.map(([f,l])=>'<label>'+l+' <input type="number" step="0.1" min="0" max="120" data-skyf="'+k+'.'+f+'" value="'+m[k][f]+'"></label>').join(''):'')+'</div>';
  return '<details class="builder-more"'+(escapeBuilderSettings.open?' open':'')+'><summary>Level settings and weather</summary><div class="builder-settings">'+
    num('camos','Camouflage',5)+num('seeds','Seeds',5)+num('glows','Glow mushrooms',5)+num('timeLimit','Time limit (s, 0 = none)')+num('sightRadius','Sight (tiles, 0 = default)',12)+
    check('tailDrop','Spare tail (one catch forgiven)')+check('dark','Dark (glow plants light it)')+check('gaze','Sally sees only ahead')+check('living','Living garden')+check('abyss','Bottomless gaps')+
    '<label class="builder-check"><input type="checkbox" data-set="biome"'+(m.biome==='desert'?' checked':'')+'> Desert sand</label></div>'+
    sky('hawk','Hawk overhead',[['every','dives every s'],['warn','warning s'],['first','first dive at s']])+
    sky('storm','Lightning storm',[['every','flash every s'],['warn','rumble warning s'],['first','first flash at s']])+
    sky('tide','Tide on the flats',[['period','cycle s'],['high','high tide lasts s'],['offset','delay s']])+
    '<label class="builder-hint">Hint <textarea data-set="hint" maxlength="400" rows="2">'+escapeHtml(m.hint||'')+'</textarea></label></details>';
}
function renderEscapeBuilder(){
  const m=escapeBuilderModel,B=EscapeBuilder,panel=document.getElementById('escape-builder'),w=m.map[0].length,h=m.map.length;
  const tool=(id,label,title)=>'<button class="builder-tool'+(escapeBuilderTool===id?' builder-tool-on':'')+'" data-tool="'+id+'" title="'+escapeHtml(title)+'">'+label+'</button>';
  const problems=B.validate(m),linked=escapeBuilderLinked();
  const ws=escapeBuilderWorkshop;
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">'+(ws?'← Workshop':'← Menu')+'</button><h2>'+(ws?'✎ '+escapeHtml(escapeWorkshopLabel(ws.key)):'Level builder')+'</h2>'+
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
    '<div class="builder-palette"><span>Extras</span>'+Object.entries(ESCAPE_BUILDER_EXTRAS).map(([k,[icon,title]])=>tool(k,icon+' '+title.split(':')[0],title)).join('')+'</div>'+
    escapeBuilderSettings()+
    '<div class="builder-palette"><span>Tools</span>'+tool('select','☝ Select','Pick something to see and change its settings')+tool('link','🔗 Link','Click a trigger, the key or a chest, then click doors, bridges or enemies to link or unlink them')+
    tool('patrol','➜ Patrol','Click an enemy, then click the tiles it should walk to, in order')+tool('turn','↻ Turn','Turn an enemy or a vent a quarter turn')+tool('remove','✕ Remove','Remove an enemy, trigger, hazard, door tile or ground mark')+'</div>'+
    escapeBuilderInspector()+
    '<div id="builder-grid" class="builder-grid" style="grid-template-columns:repeat('+w+',1fr)">'+m.map.map((row,y)=>[...row].map((ch,x)=>escapeBuilderCell(x,y,ch,linked)).join('')).join('')+'</div>'+
    (escapeBuilderNote?'<p class="builder-note">'+escapeHtml(escapeBuilderNote)+'</p>':'')+
    '<p class="builder-status'+(problems.length?' builder-bad':'')+'">'+(problems.length?'⚠ '+problems.map(escapeHtml).join(' '):'✓ Ready to play. Treasure in level: '+B.treasureTotal(m)+'.')+'</p>'+
    (ws?'<div class="builder-actions"><button id="builder-play" class="escape-primary"'+(problems.length?' disabled':'')+'>▶ Playtest</button><button id="workshop-save" class="escape-secondary">Save draft</button><button id="workshop-export1" class="escape-secondary"'+(EscapeEdits.get(ws.key)?'':' disabled')+'>Export draft</button>'+
      '<button id="workshop-revert" class="escape-secondary">Back to the game’s version</button>'+(EscapeEdits.get(ws.key)?'<button id="workshop-discard" class="escape-secondary">Discard draft</button>':'')+'</div><textarea id="builder-text" class="builder-text" style="display:none" readonly></textarea>'+
      '<p class="builder-hint">Workshop draft: saved only in this browser, never published. '+(EscapeEdits.active()?'Test drafts in game is on: reload after saving to play it from the map.':'Turn on “Test drafts in game” in the workshop to play it from the map.')+'</p>':
    '<div class="builder-actions"><button id="builder-play" class="escape-primary"'+(problems.length?' disabled':'')+'>▶ Playtest</button><button id="builder-save" class="escape-secondary">Save</button><button id="builder-publish" class="escape-secondary"'+(problems.length?' disabled':'')+'>⇪ Publish to community</button>'+
    '<button id="builder-new" class="escape-secondary">New</button><button id="builder-share" class="escape-secondary">Share</button><button id="builder-import" class="escape-secondary">Import</button><button id="builder-community" class="escape-secondary">Community levels</button><button id="builder-admin" class="escape-secondary">Admin</button></div>'+
    '<textarea id="builder-text" class="builder-text" style="display:none" placeholder="Paste a shared level here, then press Import again."></textarea>'+
    (ws?'':'<h3>My levels</h3><div class="builder-list">'+(B.loadAll(ESCAPE_BUILDER_STORE).map(l=>'<div class="builder-saved"><b>'+escapeHtml(l.name)+'</b> <span>'+l.map[0].length+'×'+l.map.length+' · '+l.guards.length+' enemies</span><button data-play="'+l.id+'">Play</button><button data-edit="'+l.id+'">Edit</button><button data-delete="'+l.id+'">Delete</button></div>').join('')||'<p>No saved levels yet. Saved levels stay in this browser; publish one to share it with every player.</p>')+'</div>'));
  wireEscapeBuilder();
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// The topmost thing on a tile, for Select and Link.
function escapeBuilderPickAt(x,y){
  const m=escapeBuilderModel,B=EscapeBuilder,g=B.guardAt(m,x,y),t=B.triggerAt(m,x,y),h=B.hazardAt(m,x,y),d=B.doorAt(m,x,y),s=B.sourceAt(m,x,y);
  if(g)return {kind:'guard',id:g.id};if(t)return {kind:'trigger',id:t.id};
  const cap=(m.caps||[]).findIndex(c=>c.at[0]===x&&c.at[1]===y);if(cap>=0)return {kind:'cap',index:cap};
  const ant=(m.antTrails||[]).findIndex(q=>q.path.some(p=>p[0]===x&&p[1]===y));if(ant>=0)return {kind:'ants',index:ant};
  if(s&&!s.startsWith('enter:'))return {kind:'source',id:s};if(h)return {kind:'hazard',id:h.id};if(d)return {kind:'door',id:d.id};
  const wind=(m.wind||[]).findIndex(z=>x>=z.area[0]&&x<=z.area[2]&&y>=z.area[1]&&y<=z.area[3]);if(wind>=0&&!s)return {kind:'wind',index:wind};
  return s?{kind:'source',id:s}:null;
}
function escapeBuilderApply(x,y){
  const m=escapeBuilderModel,B=EscapeBuilder,t=escapeBuilderTool,p=escapeBuilderPick;escapeBuilderNote='';
  // Picking an angler's lure tile.
  if(p?.kind==='lure'){B.setGuard(m,p.id,{lure:[x,y]});escapeBuilderPick={kind:'guard',id:p.id};return true;}
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
  if(t==='remove'){const ok=B.removeAt(m,x,y)||B.removeExtraAt(m,x,y);if(ok)escapeBuilderPick=null;return ok;}
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
  if(t.startsWith('layer:'))return B.toggleLayer(m,t.slice(6),x,y);
  if(t==='cap'){if((m.caps||[]).some(c=>!c.to)){if(!B.setCapEnd(m,x,y))escapeBuilderNote='Pick open floor for the landing.';else escapeBuilderPick={kind:'cap',index:m.caps.length-1};return true;}
    if(!B.addCap(m,x,y)){escapeBuilderNote='Caps go on open floor.';return true;}escapeBuilderNote='Now click where the cap throws Sally.';return true;}
  if(t==='wind'||t==='area'||t==='seedbed'){
    if(!escapeBuilderAnchor){escapeBuilderAnchor=[x,y];escapeBuilderNote=t==='seedbed'?'Now click the other bank, in the same row or column.':'Now click the opposite corner.';return true;}
    const [ax,ay]=escapeBuilderAnchor;escapeBuilderAnchor=null;
    if(t==='wind'){B.addWind(m,ax,ay,x,y);escapeBuilderPick={kind:'wind',index:m.wind.length-1};escapeBuilderNote='Set which way it blows and how often below.';}
    else if(t==='area'){const id=B.addRegion(m,ax,ay,x,y);if(id){escapeBuilderPick={kind:'source',id:'enter:'+id};escapeBuilderTool='link';escapeBuilderNote='Now click the doors or sleeping enemies walking in should affect.';}}
    else if(!B.addSeedCrossing(m,[ax,ay],[x,y]))escapeBuilderNote='The two banks must be in the same row or column with a gap between.';
    return true;}
  if(t==='ants'){const ok=B.addAntPoint(m,x,y,escapeBuilderAnchor==='new');escapeBuilderAnchor=null;if(ok)escapeBuilderPick={kind:'ants',index:m.antTrails.length-1};return ok;}
  if(t==='wheel')return B.setRootWheel(m,x,y);
  if(t==='rival'){const g=B.guardAt(m,x,y);if(!g){escapeBuilderNote='Click an enemy.';return true;}
    if(p?.kind==='guard'&&p.id!==g.id){B.toggleRival(m,p.id,g.id);escapeBuilderNote='Rivals: '+escapeBuilderLabel(p.id)+' and '+escapeBuilderLabel(g.id)+' (click the pair again to undo).';escapeBuilderPick=null;return true;}
    escapeBuilderPick={kind:'guard',id:g.id};escapeBuilderNote='Now click its rival.';return true;}
  return B.paint(m,x,y,t);
}
const escapeBuilderDrags=t=>Object.keys(EscapeBuilder.TILES).includes(t)||['1','2','3','door','bridge','cold','warm'].includes(t)||t.startsWith('layer:');
function wireEscapeBuilder(){
  const m=escapeBuilderModel,B=EscapeBuilder,$=id=>document.getElementById(id),rerender=()=>renderEscapeBuilder(),ws=escapeBuilderWorkshop;
  $('builder-back').onclick=ws?()=>openEscapeWorkshop():closeEscapeBuilder;
  $('builder-name').onchange=e=>{m.name=e.target.value;};$('builder-brief').onchange=e=>{m.brief=e.target.value;};$('builder-author').onchange=e=>{m.author=e.target.value;};
  $('builder-w').onchange=$('builder-h').onchange=()=>{escapeBuilderModel=B.resize(m,Number($('builder-w').value),Number($('builder-h').value));escapeBuilderPick=null;rerender();};
  for(const input of document.querySelectorAll('[data-count]'))input.onchange=e=>{m[e.target.dataset.count]=Math.max(0,Math.min(5,Number(e.target.value)||0));rerender();};
  $('builder-toll').onchange=e=>{m.requiredTreasure=Math.max(0,Math.min(99,Number(e.target.value)||0));rerender();};
  $('builder-dark').onchange=e=>{m.explore=e.target.checked;};
  for(const b of document.querySelectorAll('[data-tool]'))b.onclick=()=>{escapeBuilderTool=b.dataset.tool;escapeBuilderNote='';escapeBuilderAnchor=null;if(!['patrol','link','select','turn'].includes(escapeBuilderTool))escapeBuilderPick=null;rerender();};
  for(const b of document.querySelectorAll('[data-color]'))b.onclick=()=>{escapeBuilderColor=Number(b.dataset.color);if(!['door','bridge'].includes(escapeBuilderTool))escapeBuilderTool='door';rerender();};
  const p=escapeBuilderPick,insp=name=>document.querySelector('[data-insp="'+name+'"]');
  if(insp('clear-patrol'))insp('clear-patrol').onclick=()=>{B.clearPatrol(m,escapeBuilderGuardIndex(p.id));rerender();};
  if(insp('sleep'))insp('sleep').onchange=e=>{B.setSleep(m,p.id,e.target.checked);rerender();};
  if(insp('mode'))insp('mode').onchange=e=>{B.setDoor(m,p.id,{mode:e.target.value});rerender();};
  if(insp('seconds'))insp('seconds').onchange=e=>{B.setDoor(m,p.id,{seconds:e.target.value});rerender();};
  if(insp('speed'))insp('speed').onchange=e=>{B.setHazard(m,p.id,{speed:e.target.value});rerender();};
  if(insp('offset'))insp('offset').onchange=e=>{B.setHazard(m,p.id,{offset:e.target.checked});rerender();};
  if(insp('length'))insp('length').onchange=e=>{B.setHazard(m,p.id,{length:e.target.value});rerender();};
  const val=e=>e.target.value===''?null:Number(e.target.value);
  for(const [k,f] of [['hperiod','period'],['hon','on'],['hdelay','delay']])if(insp(k))insp(k).onchange=e=>{const h=m.hazards.find(q=>q.id===p.id);B.setHazard(m,p.id,{[f]:val(e)});
    if(h.period!==undefined&&(h.on===undefined||h.delay===undefined)){h.on=h.on??1;h.delay=h.delay??0;}if(val(e)===null&&f==='period'){delete h.on;delete h.delay;}rerender();};
  if(insp('root'))insp('root').onchange=e=>{B.setDoor(m,p.id,{root:e.target.checked});rerender();};
  if(insp('dname'))insp('dname').onchange=e=>{B.setDoor(m,p.id,{name:e.target.value});rerender();};
  if(insp('needkey'))insp('needkey').onchange=e=>{B.setRegion(m,p.id.slice(6),{requiresKey:e.target.checked});rerender();};
  for(const box of document.querySelectorAll('[data-insp-close]'))box.onchange=e=>{B.setLinkAction(m,p.id,box.dataset.inspClose,e.target.checked?'close':'open');rerender();};
  if(insp('message'))insp('message').onchange=insp('objective').onchange=()=>{B.setMessage(m,p.id,insp('message').value,insp('objective').value);};
  if(insp('set-lure'))insp('set-lure').onclick=()=>{escapeBuilderPick={kind:'lure',id:p.id};escapeBuilderTool='select';escapeBuilderNote='Click the tile where the lure dangles.';rerender();};
  for(const el of document.querySelectorAll('[data-ginsp]'))el.onchange=e=>{const k=el.dataset.ginsp;B.setGuard(m,p.id,{[k]:k==='buried'?e.target.checked:k==='axis'?e.target.value:val(e)});rerender();};
  const looks=document.querySelectorAll('[data-look]');for(const el of looks)el.onchange=()=>{B.setGuard(m,p.id,{looks:[...looks].filter(q=>q.checked).map(q=>Number(q.dataset.look)*Math.PI/2)});rerender();};
  for(const [k,f] of [['wdir','dir'],['wperiod','period'],['won','on'],['woffset','offset']])if(insp(k))insp(k).onchange=e=>{B.setWind(m,p.index,{[f]:Number(e.target.value)});rerender();};
  for(const [k,f] of [['agroups','groups'],['asize','size'],['aspeed','speed']])if(insp(k))insp(k).onchange=e=>{B.setAnts(m,p.index,{[f]:Number(e.target.value)});rerender();};
  if(insp('anew'))insp('anew').onclick=()=>{escapeBuilderTool='ants';escapeBuilderAnchor='new';escapeBuilderNote='Click the first point of the new column.';rerender();};
  const more=document.querySelector('.builder-more');if(more)more.ontoggle=()=>{escapeBuilderSettings.open=more.open;};
  for(const el of document.querySelectorAll('[data-set]'))el.onchange=e=>{const k=el.dataset.set;B.setSettings(m,{[k]:el.type==='checkbox'?(k==='biome'?(e.target.checked?'desert':''):e.target.checked):el.tagName==='TEXTAREA'?e.target.value:Number(e.target.value)});rerender();};
  const skyDefault={hawk:{every:9,warn:2.2,first:12},storm:{every:9,warn:1.6,first:8},tide:{period:14,high:6,offset:0}};
  for(const el of document.querySelectorAll('[data-sky]'))el.onchange=e=>{B.setSettings(m,{[el.dataset.sky]:e.target.checked?skyDefault[el.dataset.sky]:null});rerender();};
  for(const el of document.querySelectorAll('[data-skyf]'))el.onchange=e=>{const [k,f]=el.dataset.skyf.split('.');B.setSettings(m,{[k]:{...m[k],[f]:Number(e.target.value)}});rerender();};
  const grid=$('builder-grid'),cellAt=e=>{const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.builder-cell');return el?[Number(el.dataset.x),Number(el.dataset.y)]:null;};
  grid.onpointerdown=e=>{e.preventDefault();const c=cellAt(e);if(!c)return;escapeBuilderPainting=escapeBuilderDrags(escapeBuilderTool);if(escapeBuilderApply(...c))rerender();};
  grid.onpointermove=e=>{if(!escapeBuilderPainting||!e.buttons)return;const c=cellAt(e);if(c&&escapeBuilderModel.map[c[1]][c[0]]!==escapeBuilderTool&&escapeBuilderApply(...c))rerender();};
  document.onpointerup=()=>{escapeBuilderPainting=false;};
  $('builder-play').onclick=()=>{if(!B.validate(m).length)startEscape({custom:B.toRoute(m),from:'builder'});};
  if(ws){
    $('workshop-save').onclick=()=>{const model=B.sanitize(m),ok=model&&EscapeEdits.save(ws.key,model,B.validate(model).length?null:B.toRoute(model));
      escapeBuilderNote=!ok?'Could not save the draft.':B.validate(model).length?'Draft saved. Fix the problems below before it can be played in game.':'Draft saved'+(EscapeEdits.active()?'. Reload to play it from the map.':'.');rerender();};
    $('workshop-export1').onclick=()=>escapeWorkshopExport([ws.key],$('builder-text'));
    $('workshop-revert').onclick=()=>{if(!confirm('Load the game’s version into the builder? Your saved draft stays until you save over it or discard it.'))return;escapeBuilderModel=B.fromRoute(escapeGameLevel(ws.key));escapeBuilderPick=null;escapeBuilderNote='Loaded the game’s version.';rerender();};
    if($('workshop-discard'))$('workshop-discard').onclick=()=>{if(!confirm('Discard your saved draft?'))return;EscapeEdits.remove(ws.key);escapeBuilderModel=B.fromRoute(escapeGameLevel(ws.key));escapeBuilderPick=null;escapeBuilderNote='Draft discarded; this is the game’s version.';rerender();};
    return;
  }
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
