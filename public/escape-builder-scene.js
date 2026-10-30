// The level builder screen: paint a map, place Sally, the key, the hatch, treasure, enemies,
// doors and bridges with their triggers, hazards and cold ground; link triggers to what they
// open or wake; then playtest, save in this browser, share as text, or publish to the
// community shelf. The builder needs an admin signed in with a passkey; the community shelf is
// open to every player.
let escapeBuilderModel=null,escapeBuilderTool='#',escapeBuilderColor=0,escapeBuilderPick=null,escapeBuilderPainting=false,escapeBuilderNote='',escapeBuilderAnchor=null;
const ESCAPE_BUILDER_STORE=(()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch(_){return null;}})();
const ESCAPE_BUILDER_LOOK={'#':['#2d4a43',''],'.':['#183029',''],'L':['#2f6b45','❀'],'N':['#3b3a32','∴'],'B':['#3c5a5e','⟋'],'M':['#4a3a26','≈'],'~':['#1f5a76','~'],'_':['#07120f',''],'c':['#3d3424','⁘'],'T':['#24452a','෴'],'o':['#2a3a2a','●'],'t':['#5a5040','≋'],'m':['#3f6b3a','ʬ'],'d':['#5a4128','∵'],'s':['#8a7550','⁖'],'I':['#8fc4dc','❄'],'S':['#2d4a43','⦚'],'@':['#183029','🦎'],'K':['#183029','🔑'],'X':['#1d5a4f','⇩'],'1':['#183029','◆'],'2':['#183029','◆◆'],'3':['#183029','▣']};
const ESCAPE_BUILDER_ENEMY={snake:'🐍',ladybird:'🐞',beetle:'🪲',scorpion:'🦂',toad:'🐸',spider:'🕷',cricket:'🦗',moth:'🦋',mimic:'🎁',millipede:'🐛',cobra:'👑',flytrap:'🌺',crab:'🦀',fox:'🦊',heron:'🦩',mantis:'🌿',wasp:'🐝',dragonfly:'🪰',mole:'🐹',bat:'🦇',eel:'🪱',angler:'🎣',fish:'🐟','sea-snake':'🌊',owl:'🦉',gecko:'🐾',echofrog:'🔊',chameleon:'🦎',sentinel:'💎',cloudray:'☁',magpie:'🐦',boogoo:'👾',cavefolk:'👥'};
const ESCAPE_BUILDER_TRIGGER={plate:'◉',heavy:'⬛',lever:'⚲',switch:'▣'},ESCAPE_BUILDER_HAZARD={vent:'♨',thorns:'⋀',log:'●'};
const ESCAPE_BUILDER_ARROW=['→','↓','←','↑'];
// The extras placed on top of the map: what each tool is called and how it looks on the grid.
const ESCAPE_BUILDER_EXTRAS={'layer:shade':['⛱','Awning: shade where the hawk cannot dive'],'layer:glowPlants':['✺','Glow plant: light in a dark level'],'layer:regrowth':['✿','Regrowth bug: grows back a lost tail'],'layer:shrubs':['❀','Decoy shrub: looks just like a sleeping mimic but is harmless, so players must tell the real one apart'],'layer:wet':['💧','Wet ground: slick but gentler than ice. On a ground slope it carries Sally on down past its foot; Crawl grips'],'layer:thinIce':['◌','Thin ice: cracks under Sally, faster if she stands or runs, and breaks into water; crawling spreads her weight. Paint it over water for a frozen pond she can fall through. A crate pushed onto it breaks through'],'layer:slippery':['❄','Glide ice: Sally keeps her speed, then slides faster; Crawl brakes'],
  cap:['🍄','Bounce cap: click the cap, then where it throws Sally'],wind:['≋','Wind lane: click two opposite corners'],current:['⇶','Current or slope: click two corners; choose Water or Ground in the inspector'],echo:['◎','Echo hall: click two corners; sound carries further inside'],tunnel:['⛏','Burrow pair: click one mound, then its partner'],area:['▢','Trigger area: click two corners; walking in can open doors or wake enemies'],
  ants:['🐜','Ant column: click the points of its loop in order'],seedbed:['🌱','Seed bed: click the two banks either side of a gap; a planted seed grows a crossing'],wheel:['✣','Root wheel'],rival:['⚔','Rivals: click two enemies who fight when they meet'],page:['📜','Page: a note lying on the floor for players to find and read after the run (up to 3)'],
  sign:['🪧','Trail sign: a short note Sally reads when she stands by it and presses Read (up to 4)'],rope:['➰','Rope or vine: click one end, then the other. It swings between them; Sally grabs it standing on an end as it arrives, and nothing can follow her'],crate:['📦','Crate: Sally shoves it a tile by walking into it (noisy). It blocks sight and creatures, and one pushed into a gap fills it'],checkpoint:['⚐','Checkpoint: in a gentle level a catch sends Sally back to the last one reached'],
  'prop:lantern':['🏮','Lantern post: autumn scenery'],'prop:tree':['🍂','Autumn tree: scenery'],'prop:pumpkin':['🎃','Pumpkin: scenery'],'prop:brazier':['🔥','Brazier: winter scenery that glows'],'prop:pine':['🌲','Pine tree: winter scenery'],'prop:gift':['🎁','Gift: winter scenery'],'prop:blossom':['🌸','Blossom tree: spring scenery'],'prop:flowerpot':['🪴','Flower pot: spring scenery'],'prop:wateringcan':['🚿','Watering can: spring scenery'],'prop:flowerlantern':['🏵','Flower lantern: spring scenery that glows'],'prop:parasol':['⛱','Beach parasol: summer scenery'],'prop:sandcastle':['🏰','Sandcastle: summer scenery'],'prop:buoy':['🛟','Buoy: summer scenery'],'prop:crate':['📦','Fish crate: summer scenery'],'prop:bunting':['🎏','Bunting: summer scenery'],'prop:harbourlantern':['🪔','Harbour lantern: summer scenery that glows'],'prop:rowboat':['🛶','Rowing boat: summer scenery'],'prop:lighthouse':['🗼','Lighthouse: summer scenery'],millwheel:['☸','Mill wheel: scenery']};

// Hints: with Hints on (the menu bar toggle, remembered per browser), resting the pointer on a tool
// or a map tile shows what it is and how it plays, in a little card by the pointer.
const ESCAPE_BUILDER_HINT_KEY='sally-builder-hints';
const ESCAPE_BUILDER_DETAILS={
  '#':'Solid wall. Blocks Sally, creatures, sight and throws.','.':'Plain open floor.',
  'L':'Leaves: standing still in them hides Sally. Moving through them rustles.','N':'Gravel: crunches loudly underfoot, so hunters hear Sally walk on it. Crawl or go round.',
  'B':'Cracked wall: a charging beetle smashes it open, making a new way through.','M':'Mud slows Sally. If she stands still for a second she starts to sink and gets slower; sprinting through it splashes loudly.',
  '~':'Water: Sally swims slowly. Pebbles thrown in splash. Fish and eels live here.','_':'Gap: a drop nobody can cross on foot. Bridges, caps, ropes, seed beds or a pushed crate get Sally over.',
  'c':'Crumbling floor: it gives way a moment after Sally steps on it, so keep moving.','T':'Tangle vine: grabs Sally for a moment when she walks into it, then withers and regrows.',
  'S':'Crack: a slit only Sally fits through. No creature can follow or see in.','o':'Spore puffball: stepping on it (or a pebble nearby) bursts a cloud that hides Sally and blinds hunters inside it.',
  't':'Tide flat: sand at low tide, water at high tide.','m':'Moss: silent ground. Even a sprint makes no sound on it.',
  'd':'Soft dirt: hold Burrow on it and Sally digs in and hides underground.','s':'Soft sand: slows Sally and keeps her footprints for a while.',
  'I':'Ice wall: a frost sentinel’s gaze glances off it, so it is safe cover from sentinels (bank a pebble off it too).',
  'cold':'Cold ground: Sally loses warmth here. Too cold and she slows, then freezes. Pair it with warm stones.','warm':'Warm stone: standing on it thaws Sally back to full warmth.',
  '@':'Where Sally starts.','K':'The key. Sally must carry it to the hatch.','X':'The hatch: the way out once Sally has the key (and any treasure the level asks for).',
  '1':'Treasure worth 1.','2':'Treasure worth 2.','3':'A chest worth 3.',
  'door':'A door in the chosen colour. Link it to a switch, plate, lever, area or the key to open it.','bridge':'A bridge in the chosen colour, over a gap or water. Linked triggers open (lay) it.',
  'trig:plate':'Pressure plate: Sally standing on it opens its linked doors (set it to close them again after a time).','trig:heavy':'Heavy plate: ignores Sally. Only a beetle’s weight presses it, so lure one on.',
  'trig:lever':'Lever: Sally walks into it to flip it; it stays flipped.','trig:switch':'Switch: Sally steps on it, or hits it from range with her tongue.',
  'haz:vent':'Steam vent: sits in a wall and blasts steam across the floor in front of it on a rhythm. It stuns hunters too.','haz:thorns':'Thorn bed: rises and sinks on a rhythm. Cross while it is down.','haz:log':'Rolling log (a snowball in winter): rumbles a warning, then rolls along its line.',
  'select':'Select: click anything to see and change its settings on the right, or drag it to move it.','link':'Link: click a trigger, the key or a chest, then the doors, bridges or creatures it should affect.',
  'patrol':'Patrol: click a creature, then the tiles it walks to, in order.','turn':'Turn: turns a creature or a vent a quarter turn.','remove':'Remove: clears a creature, trigger, hazard, door tile or extra from a tile.'
};
function escapeBuilderHintsOn(){try{return escapeStore.getItem(ESCAPE_BUILDER_HINT_KEY)!=='0';}catch(_){return true;}}
// [title, body] for a palette tool, a mode or a tab.
function escapeBuilderToolHint(id){
  const B=EscapeBuilder;
  if(id.startsWith('enemy:')){const kind=id.slice(6),e=typeof EscapeBestiary!=='undefined'?EscapeBestiary.byKind(kind):null,name=B.ENEMIES[kind]||kind;return e?[name+' · '+e.job,e.hunts+(e.tip?' Tip: '+e.tip:'')]:[name,'A creature. Select it to set its patrol, facing and cunning.'];}
  if(ESCAPE_BUILDER_DETAILS[id]){const tool=ESCAPE_BUILDER_TABS.map(t=>escapeBuilderToolsIn(t[0])).flat().find(t=>t[0]===id),mode=ESCAPE_BUILDER_MODES.find(m=>m[0]===id);return [tool?tool[2]:mode?mode[2]:id,ESCAPE_BUILDER_DETAILS[id]];}
  const extra=ESCAPE_BUILDER_EXTRAS[id];if(extra){const i=extra[1].indexOf(':');return i<0?[extra[1],'']:[extra[1].slice(0,i),extra[1].slice(i+1).trim()];}
  return null;
}
// Everything on one map tile, one line each: the ground, then whatever is placed on it.
function escapeBuilderCellHint(x,y){
  const m=escapeBuilderModel,B=EscapeBuilder,ch=m.map[y]?.[x];if(ch===undefined)return null;
  const has=list=>(list||[]).some(q=>q[0]===x&&q[1]===y),inRect=a=>x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3],first=t=>String(t).split('. ')[0].replace(/\.$/,'')+'.',lines=[];
  const ground=B.TILES[ch]?B.TILES[ch].split(' (')[0]:B.MARKS[ch]||ch;lines.push(['Ground: '+ground,first(ESCAPE_BUILDER_DETAILS[ch]||'')]);
  const g=B.guardAt(m,x,y);if(g){const e=typeof EscapeBestiary!=='undefined'?EscapeBestiary.byKind(g.kind):null;lines.push([(B.ENEMIES[g.kind]||g.kind)+(g.sleep?' (asleep)':''),e?first(e.hunts):'']);}
  const d=B.doorAt(m,x,y);if(d)lines.push([(d.bridge?'Bridge':'Door')+' · '+B.COLORS[d.color][0],'Opened by the triggers linked to it.']);
  const t=B.triggerAt(m,x,y);if(t)lines.push([B.TRIGGERS[t.type],first(ESCAPE_BUILDER_DETAILS['trig:'+t.type]||'')]);
  const h=B.hazardAt(m,x,y);if(h)lines.push([B.HAZARDS[h.type],first(ESCAPE_BUILDER_DETAILS['haz:'+h.type]||'')]);
  if(has(m.cold))lines.push(['Cold ground',first(ESCAPE_BUILDER_DETAILS.cold)]);if(has(m.warm))lines.push(['Warm stone',first(ESCAPE_BUILDER_DETAILS.warm)]);
  for(const k of Object.keys(B.LAYERS))if(has(m[k])){const hint=escapeBuilderToolHint('layer:'+k);if(hint)lines.push([hint[0],first(hint[1])]);}
  const extra=(key,test)=>{const hint=escapeBuilderToolHint(key);if(test&&hint)lines.push([hint[0],first(hint[1])]);};
  extra('wind',(m.wind||[]).some(z=>inRect(z.area)));extra('current',(m.currents||[]).some(z=>inRect(z.area)));extra('echo',(m.echoes||[]).some(inRect));
  extra('cap',(m.caps||[]).some(c=>c.at[0]===x&&c.at[1]===y));if((m.caps||[]).some(c=>c.to&&c.to[0]===x&&c.to[1]===y))lines.push(['Cap landing','Where a bounce cap throws Sally.']);
  extra('rope',(m.ropes||[]).some(r=>(r.from[0]===x&&r.from[1]===y)||(r.to&&r.to[0]===x&&r.to[1]===y)));extra('crate',has(m.crates));extra('checkpoint',has(m.checkpoints));
  extra('tunnel',(m.tunnels||[]).some(t=>has(t)));extra('ants',(m.antTrails||[]).some(t=>has(t.path)));extra('area',(m.regions||[]).some(r=>inRect(r.area)));
  extra('sign',B.signAt(m,x,y)>=0);extra('page',B.pageAt(m,x,y)>=0);
  const prop=(m.props||[]).find(q=>q.at[0]===x&&q.at[1]===y);if(prop)extra('prop:'+prop.kind,true);
  return ['Tile '+x+','+y,lines];
}
function escapeBuilderTipHtml(hint){
  if(!hint)return '';const [title,body]=hint;
  if(Array.isArray(body))return '<b>'+escapeHtml(title)+'</b>'+body.map(([a,b])=>'<div><b>'+escapeHtml(a)+'</b>'+(b?' '+escapeHtml(b):'')+'</div>').join('');
  return '<b>'+escapeHtml(title)+'</b>'+(body?'<div>'+escapeHtml(body)+'</div>':'');
}
// One delegated listener on the builder panel shows the card for whatever the pointer rests on.
function wireEscapeBuilderHints(panel){
  if(!panel||panel.dataset?.hintsWired||typeof panel.addEventListener!=='function')return;panel.dataset.hintsWired='1';
  const tip=()=>{let el=document.getElementById('builder-tip');if(!el){el=document.createElement('div');el.id='builder-tip';el.className='builder-tip';el.setAttribute('role','tooltip');document.body.appendChild(el);}return el;};
  const hide=()=>{const el=document.getElementById('builder-tip');if(el)el.hidden=true;};
  panel.addEventListener('mousemove',e=>{
    if(!escapeBuilderHintsOn())return hide();
    const target=e.target.closest?.('[data-tool],[data-tab],[data-x]');if(!target)return hide();
    let hint=null;if(target.dataset.x!==undefined)hint=escapeBuilderCellHint(Number(target.dataset.x),Number(target.dataset.y));
    else if(target.dataset.tool)hint=escapeBuilderToolHint(target.dataset.tool);
    else if(target.dataset.tab){const tab=ESCAPE_BUILDER_TABS.find(t=>t[0]===target.dataset.tab);hint=tab?[tab[1],'Opens the '+tab[1].toLowerCase()+' tools. Rest on any of them for what it does.']:null;}
    if(!hint)return hide();
    if(target.title){target.dataset.title=target.title;target.removeAttribute('title');}
    const el=tip();el.innerHTML=escapeBuilderTipHtml(hint);el.hidden=false;
    const w=el.offsetWidth||260,h=el.offsetHeight||80,vw=window.innerWidth||1024,vh=window.innerHeight||768;
    el.style.left=Math.max(8,Math.min(vw-w-8,e.clientX+16))+'px';el.style.top=Math.max(8,Math.min(vh-h-8,e.clientY+18))+'px';
  });
  panel.addEventListener('mouseleave',hide);
}
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
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Main menu</button><h2>'+escapeHtml(title)+'</h2></div><div id="builder-lock" class="builder-lock">'+
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
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Main menu</button><h2>Admin</h2><button id="admin-builder" class="escape-secondary">Level builder</button><button id="admin-signout" class="escape-secondary">Sign out</button></div>'+
    (message?'<p class="builder-status">'+escapeHtml(message)+'</p>':'')+
    '<h3>Passkeys</h3><div class="builder-list">'+list.passkeys.map(p=>'<div class="builder-saved"><b>'+escapeHtml(p.name)+'</b> <span>added '+day(p.createdAt)+' · last used '+day(p.lastUsedAt)+(p.id===list.current?' · this session':'')+'</span>'+
      (list.passkeys.length>1?'<button data-premove="'+escapeHtml(p.id)+'">Remove</button>':'')+'</div>').join('')+'</div>'+
    '<p><button id="admin-invite" class="escape-secondary">Invite another device</button> <button id="admin-here" class="escape-secondary">Add a passkey on this device</button></p><p id="admin-invite-out"></p>'+
    '<h3>Game levels</h3><p>Edit the game’s own escapes behind the scenes: drafts stay in this browser and never reach players. '+(Object.keys(EscapeEdits.all()).length?Object.keys(EscapeEdits.all()).length+' draft'+(Object.keys(EscapeEdits.all()).length===1?'':'s')+' saved'+(EscapeEdits.active()?', testing in game':'')+'. ':'')+'<button id="admin-workshop" class="escape-secondary">Open the level workshop</button></p>'+
    '<h3>Test mode</h3><p>Open every escape, challenge and secret spot in this browser, for testing. Saved records are never changed. Test mode is '+(escapeProgress.unlockAll?'<b>on</b>':'off')+'. <button id="admin-test" class="escape-secondary">'+(escapeProgress.unlockAll?'Turn test mode off':'Turn test mode on')+'</button></p>'+
    '<h3>Player data</h3><p>Anonymous run summaries from players: how each escape ends, how long wins take, what catches Sally and where. <button id="admin-playdata" class="escape-secondary">Open player data</button></p>'+
    '<h3>Community shelf</h3><p>'+levels.length+' published level'+(levels.length===1?'':'s')+'. <button id="admin-community" class="escape-secondary">Open the shelf</button> to play, copy or take levels down.</p>';
  const $=id=>document.getElementById(id);
  $('builder-back').onclick=closeEscapeBuilder;$('admin-builder').onclick=()=>{escapeLeaveWorkshop();openEscapeBuilder();};$('admin-workshop').onclick=()=>openEscapeWorkshop();$('admin-community').onclick=()=>openEscapeCommunity();$('admin-playdata').onclick=()=>openEscapePlayData();
  $('admin-test').onclick=()=>openEscapeAdmin(toggleEscapeTestUnlock()?'Test mode is on: every escape and challenge is open.':'Test mode is off.');
  $('admin-signout').onclick=async()=>{try{await escapeBuilderApi('admin/logout',{method:'POST',body:'{}'});}catch(_){}escapeAdminSignedIn=false;closeEscapeBuilder();};
  $('admin-invite').onclick=async()=>{const out=$('admin-invite-out');try{const r=await escapeBuilderApi('admin/invite',{method:'POST',body:'{}'});const b=await r.json();
    out.innerHTML=r.ok?'Invite code: <b class="admin-code">'+escapeHtml(b.code)+'</b> — on the other device open Admin, choose “Add this device with an invite code” and enter it within '+b.minutes+' minutes. It works once.':'<span class="builder-bad">'+escapeHtml(b.error||'Could not make an invite.')+'</span>';}catch(_){out.textContent='Could not reach the server.';}};
  $('admin-here').onclick=async()=>{try{await escapePasskeyCreate('',prompt('Name for this passkey','Another passkey')||'');openEscapeAdmin('Passkey added.');}catch(e){openEscapeAdmin(escapePasskeyError(e));}};
  for(const b of document.querySelectorAll('[data-premove]'))b.onclick=async()=>{if(!confirm('Remove this passkey? It will no longer sign in.'))return;
    let note='Passkey removed.';try{const r=await escapeBuilderApi('admin/passkeys/'+encodeURIComponent(b.dataset.premove),{method:'DELETE'});if(!r.ok)note=(await r.json().catch(()=>({}))).error||'Could not remove it.';}catch(_){note='Could not reach the server.';}openEscapeAdmin(note);};
}

// Player data: a row per escape (and per challenge), and an export of every run for tuning.
async function openEscapePlayData(){
  const panel=escapeBuilderShow();panel.innerHTML='<p>Loading…</p>';
  let data=null;try{const r=await escapeBuilderApi('playdata/summary');if(r.ok)data=await r.json();else if(r.status===401){openEscapeAdmin();return;}}catch(_){}
  const head='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Admin</button><h2>Player data</h2>'+(data?.runs?'<a class="escape-secondary admin-export" href="/api/playdata/export" download>Export all runs</a>':'')+'</div>';
  if(!data){panel.innerHTML=head+'<p class="builder-bad">Could not reach the server.</p>';}
  else{const pct=n=>Math.round(n*100)+'%',num=id=>{const i=EscapeCatalog.levels.findIndex(l=>l.id===id);return i>=0?i+1+' · ':'★ ';};
    panel.innerHTML=head+'<p>'+data.runs+' run'+(data.runs===1?'':'s')+' over '+data.days+' day'+(data.days===1?'':'s')+(data.from?' since '+data.from:'')+' · '+Math.ceil(data.bytes/1024)+' KB stored. Export hands every run over as one file for tuning.</p>'+
      (data.levels.length?'<div class="playdata-wrap"><table class="playdata"><thead><tr><th>Escape</th><th>Plays</th><th>Won</th><th>Median win</th><th>Caught</th><th>Quit</th><th>Failed</th><th>Caught most by</th><th>Catch spots (x,y ×n)</th></tr></thead><tbody>'+
        data.levels.map(l=>'<tr><td>'+escapeHtml(num(l.id)+l.name+(l.ch?' (challenge)':''))+'</td><td>'+l.plays+'</td><td>'+pct(l.winRate)+'</td><td>'+(l.medianWin===null?'—':l.medianWin+'s')+'</td><td>'+l.caught+'</td><td>'+l.quit+'</td><td>'+l.failed+'</td><td>'+
          escapeHtml(l.catchers.map(([k,n])=>(EscapeBuilder.ENEMIES[k]||k)+' ×'+n).join(', ')||'—')+'</td><td>'+escapeHtml(l.hotspots.map(([x,y,n])=>x+','+y+' ×'+n).join('  ')||'—')+'</td></tr>').join('')+'</tbody></table></div>':'<p>No runs yet. They arrive a few at a time as people play.</p>');}
  document.getElementById('builder-back').onclick=()=>openEscapeAdmin();
}

// The level workshop: every escape in the game, opened in the builder for behind-the-scenes
// edits. A draft is saved per escape in this browser (escape-edits.js), never published; the
// test-in-game switch swaps drafts in for their escapes here, and Export hands them over to be
// brought into the game with scripts/apply-level-edits.cjs.
let escapeBuilderWorkshop=null,escapeBuilderOwnModel=null;
// Quick build: the settings stay put between builds, and the panel stays open while it is in use.
let escapeQuickOptions={size:'medium',theme:'meadow',difficulty:2,feature:'',seed:0},escapeQuickOpen=false;
function escapeQuickPanel(){
  if(typeof EscapeQuickBuild==='undefined')return '';
  const Q=EscapeQuickBuild,o=escapeQuickOptions,sel=(k,entries)=>'<select data-quick="'+k+'">'+entries.map(([v,l])=>'<option value="'+v+'"'+(String(o[k])===String(v)?' selected':'')+'>'+escapeHtml(l)+'</option>').join('')+'</select>';
  return '<div class="builder-settings" id="quick-panel">'+
    '<label>Size '+sel('size',Object.entries(Q.SIZES).map(([k,v])=>[k,v.name+' ('+v.w+'×'+v.h+')']))+'</label>'+
    '<label>Theme '+sel('theme',Object.entries(Q.THEMES).map(([k,v])=>[k,v.name]))+'</label>'+
    '<label>Difficulty '+sel('difficulty',Object.entries(Q.DIFFICULTY).map(([k,v])=>[k,v.name]))+'</label>'+
    '<label>Featured creature '+sel('feature',[['','Any'],...Q.FEATURES.map(k=>[k,EscapeBuilder.ENEMIES[k]])])+'</label>'+
    '<label>Seed <input type="number" min="1" max="999999" data-quick="seed" style="width:84px" value="'+(o.seed||'')+'" placeholder="any"></label>'+
    '<button id="quick-build" class="escape-primary">Build</button><button id="quick-reroll" class="escape-secondary" title="Same settings, a new seed">🎲 Another one</button></div>'+
    '<p class="builder-hint">Rooms, corridors with more than one way round, the key and hatch far from the start, ten treasure, leaves never far away and hunters to match. The same seed always builds the same level. It replaces what is in the builder; then move, add or remove anything.</p>';
}
function escapeQuickBuild(fresh){
  const o=escapeQuickOptions,m=escapeBuilderModel,blank=EscapeBuilder.blank(m.map[0].length,m.map.length);
  const edited=m.guards.length||m.doors.length||m.triggers.length||m.map.join('')!==blank.map.join('');
  if(edited&&!escapeQuickBuild.ok&&typeof confirm==='function'&&!confirm('Replace the level in the builder with a quick build? Save it first if you want to keep it.'))return;
  escapeQuickBuild.ok=true;if(fresh||!o.seed)o.seed=EscapeQuickBuild.newSeed();
  const r=EscapeQuickBuild.generate(o);o.seed=r.seed;escapeQuickOpen=true;
  escapeBuilderModel=r.model;escapeBuilderPick=null;escapeBuilderAnchor=null;
  escapeBuilderNote=r.problems.length?'This draft has problems to fix: '+r.problems.join(' '):'Quick build, seed '+r.seed+': '+r.model.guards.length+' hunter'+(r.model.guards.length===1?'':'s')+'. Playtest it, then make it yours.';
  renderEscapeBuilder();
}
function escapeLeaveWorkshop(){if(!escapeBuilderWorkshop)return;escapeBuilderWorkshop=null;escapeBuilderModel=escapeBuilderOwnModel;escapeBuilderOwnModel=null;escapeBuilderPick=null;}
function escapeWorkshopLabel(key){const [kind,id]=key.split(':'),l=escapeGameLevel(key);if(!l)return key;return (kind==='hidden'?'★ ':kind==='kids'?'🌼 ':kind==='seasonal'?'✦ ':(EscapeCatalog.levels.findIndex(x=>x.id===id)+1)+' · ')+l.name;}
// The route a draft plays: a seasonal or Little Explorers escape keeps what the builder doesn't handle.
function escapeWorkshopRoute(key,model){const route=EscapeBuilder.toRoute(model);return /^(kids|seasonal):/.test(key)?EscapeBuilder.mergeInto(escapeSourceRoute(key),escapeGameLevel(key),route):route;}
// The workshop's winning runs: the recorded runs that prove an escape can be won (admin only, from
// the server), traced on the level as it stands in the builder. The route is drawn over the map, and
// the trace says whether the run still wins on the edit or where it now goes wrong. Tracing replays
// the whole run, so it happens when asked (turning it on, picking a run, Re-check), not on every edit.
let escapeBuilderRun={key:null,on:false,runs:null,pick:0,trace:null,sig:'',busy:false,error:'',commands:null,steps:null,sel:-1,editing:false,picking:false,dirty:false};
const ESCAPE_RUN_NAMES={main:'Winning run',treasure:'Treasure run'};
const ESCAPE_RUN_TOOLS={pebble:'🪨',glow:'✨',spore:'☁',tongue:'👅',burrow:'⤓',seed:'🌱',camo:'🍃'};
// The run shown is for a workshop escape (its key) or for your own level in the builder ('own').
function escapeBuilderRunKey(){return escapeBuilderWorkshop?.key||'own';}
function escapeBuilderRunLevel(key,m){if(key==='own')return escapeBuildCustom(EscapeBuilder.toRoute(m));const route=escapeWorkshopRoute(key,m);return /^(kids|seasonal):/.test(key)?escapeBuildAs(key,route):escapeBuildCustom(route);}
function escapeBuilderRunSig(){return JSON.stringify(escapeBuilderModel)+'#'+escapeBuilderRun.pick+'#'+(escapeBuilderRun.commands?.length||0);}
// The run being shown: the one edited in the step list (or saved with the draft), else the recorded one.
function escapeBuilderRunCommands(){const r=escapeBuilderRun;return r.commands||r.runs?.[r.pick]?.commands||null;}
function escapeBuilderRunVariant(){return escapeBuilderRun.runs?.[escapeBuilderRun.pick]?.variant||'main';}
function escapeBuilderRunLoadSaved(){const r=escapeBuilderRun;r.commands=EscapeEdits.get(r.key)?.runs?.[escapeBuilderRunVariant()]||null;r.steps=null;r.sel=-1;r.picking=false;r.dirty=false;}
function escapeBuilderRunReset(key){const r=escapeBuilderRun;if(r.key!==key)Object.assign(r,{key,on:false,runs:null,pick:0,trace:null,sig:'',error:'',commands:null,steps:null,sel:-1,editing:false,picking:false,dirty:false,solved:null});}
// The recorded runs come from the server (admin only); your own level has none.
async function escapeBuilderRunFetch(){
  const r=escapeBuilderRun,key=r.key;if(r.runs)return;
  if(key==='own'){r.runs=[];return;}
  try{const res=await escapeBuilderApi('admin/runs?key='+encodeURIComponent(key),{method:'GET'});const body=await res.json().catch(()=>({}));
    if(res.ok)r.runs=Array.isArray(body.runs)?body.runs:[];else r.error=body.error||'Could not load the recorded runs.';}
  catch(_){r.error='Could not reach the server for the recorded runs.';}
  if(!r.commands)escapeBuilderRunLoadSaved();
}
async function escapeBuilderRunToggle(){
  const r=escapeBuilderRun,key=escapeBuilderRunKey();escapeBuilderRunReset(key);
  r.on=!r.on;if(!r.on){r.picking=false;renderEscapeBuilder();return;}
  if(!r.runs){r.busy=true;renderEscapeBuilder();await escapeBuilderRunFetch();r.busy=false;}
  escapeBuilderRunTrace();
}
// 🤖 Try to solve: the route planner (escape-planner.js) plays the level as it stands, in a worker so
// the page stays responsive, for up to about a minute. What it finds becomes the run shown: watch it,
// edit its steps, save it with a draft. If it gets stuck, the run shows how far it got.
let escapeBuilderSolver=null;
const ESCAPE_SOLVE_BUDGET=60;
function escapeBuilderSolve(){
  if(escapeBuilderSolver){escapeBuilderSolver.worker.terminate();clearInterval(escapeBuilderSolver.tick);escapeBuilderSolver=null;escapeBuilderNote='Stopped the planner.';renderEscapeBuilder();return;}
  const m=escapeBuilderModel,problems=EscapeBuilder.validate(m);if(problems.length){escapeBuilderNote='Fix the level’s problems first: '+problems[0];renderEscapeBuilder();return;}
  const key=escapeBuilderRunKey(),r=escapeBuilderRun;escapeBuilderRunReset(key);
  let level;try{level=escapeBuilderRunLevel(key,m);}catch(e){escapeBuilderNote='This level does not build yet: '+e.message;renderEscapeBuilder();return;}
  let worker;try{worker=new Worker('escape-planner-worker.js');}catch(e){escapeBuilderNote='The planner cannot run here: '+e.message;renderEscapeBuilder();return;}
  const started=Date.now(),sig=JSON.stringify(m);
  const tick=setInterval(()=>{const b=document.getElementById('builder-solve');if(b)b.textContent='■ Stop · '+Math.round((Date.now()-started)/1000)+'s';},500);
  escapeBuilderSolver={worker,tick};
  const done=()=>{clearInterval(tick);worker.terminate();escapeBuilderSolver=null;};
  worker.onmessage=async e=>{done();const res=e.data||{};
    if(!res.ok){escapeBuilderNote='The planner hit a problem: '+(res.error||'unknown');renderEscapeBuilder();return;}
    if(JSON.stringify(escapeBuilderModel)!==sig||escapeBuilderRunKey()!==key){escapeBuilderNote='The level changed while the planner was thinking; try again.';renderEscapeBuilder();return;}
    r.on=true;r.commands=res.commands;r.steps=null;r.sel=-1;r.solved={won:res.won,seconds:Math.round((Date.now()-started)/100)/10,tries:res.tries};
    escapeBuilderNote=res.won?'🤖 The planner found a way out. ▶ Watch it, or ✎ Edit steps.':'🤖 The planner got stuck. The ✗ shows how far it got.';
    if(!r.runs)await escapeBuilderRunFetch();
    escapeBuilderRunTrace();};
  worker.onerror=e=>{done();escapeBuilderNote='The planner hit a problem: '+(e.message||'unknown');renderEscapeBuilder();};
  worker.postMessage({level,budget:ESCAPE_SOLVE_BUDGET*1000});
  escapeBuilderNote='🤖 The planner is trying your level (up to about a minute).';renderEscapeBuilder();
}
// Replays the shown run on the builder's level (after a frame, so "Tracing…" shows first).
function escapeBuilderRunTrace(){
  const r=escapeBuilderRun,commands=escapeBuilderRunCommands(),key=r.key;if(!commands||key!==escapeBuilderRunKey()){renderEscapeBuilder();return;}
  r.busy=true;renderEscapeBuilder();
  setTimeout(()=>{try{const level=escapeBuilderRunLevel(key,escapeBuilderModel);r.trace=EscapeAdventure.trace({level},commands);if(r.editing)r.steps=EscapeSteps.toSteps({level},commands);r.dirty=false;r.error='';}
    catch(e){r.trace=null;r.error='This level does not build yet: '+e.message;}
    r.sig=escapeBuilderRunSig();r.busy=false;renderEscapeBuilder();},30);
}
// The step list: the run as steps to change, then ▶ Re-run plays them on the level as it stands.
// Steps before the first change replay exactly as recorded; a changed go walks (or sprints) to its
// new end, along the level's paths when a wall is in the way.
function escapeBuilderStepsRun(){
  const r=escapeBuilderRun;if(!r.steps)return;r.busy=true;renderEscapeBuilder();
  setTimeout(()=>{try{const level=escapeBuilderRunLevel(r.key,escapeBuilderModel),res=EscapeSteps.play({level},r.steps);r.commands=res.commands;
      r.trace=EscapeAdventure.trace({level},res.commands);r.solved=null;r.steps=EscapeSteps.toSteps({level},res.commands);r.sel=Math.min(r.sel,r.steps.length-1);r.dirty=false;r.error='';
      escapeBuilderNote=res.status==='won'?'The edited run wins. Save it with the draft to keep it.':'The edited run does not win yet: see the ✗ on the map.';}
    catch(e){r.error='Could not play the steps: '+e.message;}
    r.sig=escapeBuilderRunSig();r.busy=false;renderEscapeBuilder();},30);
}
function escapeBuilderStepsHtml(){
  const r=escapeBuilderRun;if(!r.editing||!r.steps)return '';
  const way=a=>!a?'':a.x>0?'right':a.x<0?'left':a.y>0?'down':'up';
  const row=(s,i)=>{const sel=i===r.sel;let ctl='';
    if(sel&&s.type==='go')ctl='<label><input type="checkbox" data-step-sprint'+(s.sprint?' checked':'')+'> Sprint</label><button data-step-move class="escape-secondary'+(r.picking?' on':'')+'">'+(r.picking?'Click a tile…':'⌖ Move its end')+'</button>';
    if(sel&&s.type==='wait')ctl='<label>Seconds <input type="number" min="0" max="60" step="0.25" value="'+s.t+'" data-step-wait></label>';
    if(sel&&s.type==='act')ctl='<label>Facing <select data-step-aim>'+['right','left','up','down'].map(d=>'<option'+(way(s.aim)===d?' selected':'')+'>'+d+'</option>').join('')+'</select></label>';
    if(sel&&s.type!=='end')ctl+='<button data-step-del class="escape-secondary" title="Remove this step">✕</button>';
    return '<li class="'+(sel?'on':'')+(s.edited?' edited':'')+'"><button data-step="'+i+'">'+(i+1)+'. '+escapeHtml(EscapeSteps.describe(s))+(s.edited?' ✎':'')+'</button>'+(ctl?'<span class="builder-step-ctl">'+ctl+'</span>':'')+'</li>';};
  return '<div class="builder-steps"><div class="builder-steps-bar"><b>Steps</b>'+
    '<select id="builder-step-add" aria-label="Add a step after the picked one"><option value="">＋ Add after '+(r.sel>=0?r.sel+1:'start')+'…</option><option value="go">Go to a tile</option><option value="wait">Wait</option>'+
    ['pebble','tongue','camo','glow','spore','burrow','seed'].map(k=>'<option value="'+k+'">'+escapeHtml(EscapeSteps.describe({type:'act',kind:k}))+'</option>').join('')+'</select>'+
    '<button id="builder-steps-run" class="'+(r.dirty?'':'escape-secondary')+'">▶ Re-run steps</button>'+
    (r.commands&&r.key!=='own'?'<button id="builder-steps-save" class="escape-secondary" title="Keep this run with the draft; Export carries it into the game’s recordings">💾 Save run</button>':'')+
    (r.commands&&r.runs?.length?'<button id="builder-steps-reset" class="escape-secondary" title="Go back to the recorded run">↺ Recorded run</button>':'')+
    '</div><ol>'+r.steps.map(row).join('')+'</ol></div>';
}
function escapeBuilderRunBar(){
  const r=escapeBuilderRun;if(!r.on||r.key!==escapeBuilderRunKey())return '';
  const t=r.trace,stale=t&&r.sig!==escapeBuilderRunSig(),has=Boolean(escapeBuilderRunCommands()),own=r.key==='own';
  const status=r.busy?'Tracing the run…':r.error?'⚠ '+escapeHtml(r.error):!has?(own?'No run yet: 🤖 Try to solve finds one.':'No recorded run for this escape yet.'):!t?'':
    t.status==='won'?'✓ '+(r.solved?'The planner’s run wins':r.commands?'Your edited run wins':'Still wins on this version')+', in '+t.time+'s'+(t.waits.length?' · '+t.waits.length+' wait'+(t.waits.length>1?'s':''):'')+(t.tools.length?' · '+t.tools.length+' tool use'+(t.tools.length>1?'s':''):''):
    '✗ '+(t.status==='playing'?'The run ends at '+t.time+'s without escaping':'At '+t.time+'s: '+escapeHtml(t.message||t.status))+' (the ✗ on the map)';
  return '<div class="builder-runside"><div class="builder-runbar'+(t&&t.status!=='won'?' bad':'')+'">'+
    (r.runs?.length>1?'<select id="builder-run-pick" aria-label="Which recorded run">'+r.runs.map((x,i)=>'<option value="'+i+'"'+(i===r.pick?' selected':'')+'>'+escapeHtml(ESCAPE_RUN_NAMES[x.variant]||x.variant)+'</option>').join('')+'</select>':'<b>'+escapeHtml(own?'Your level':ESCAPE_RUN_NAMES[r.runs?.[0]?.variant]||'Winning run')+'</b>')+
    (r.solved?'<em>🤖 planner'+(r.solved.won?', found in '+r.solved.seconds+'s':'')+'</em>':r.commands?'<em>edited</em>':'')+'<span>'+status+'</span>'+(stale?'<button id="builder-run-recheck" class="escape-secondary">↻ Re-check on your edit</button>':'')+
    (has?'<button id="builder-run-edit" class="escape-secondary'+(r.editing?' on':'')+'" title="Show the run as steps you can change">✎ Edit steps</button><button id="builder-run-watch" class="escape-secondary" title="Play the level with the run driving Sally">▶ Watch</button>':'')+'</div>'+escapeBuilderStepsHtml()+'</div>';
}
// Where a step happens on the map, for its numbered marker.
function escapeBuilderStepAt(s){return s.type==='go'?s.to:s.at||null;}
// The route over the map, in tile units: the path, waits (rings with seconds), tools used, the end;
// while editing, each step's number where it ends.
function escapeBuilderRunSvg(w,h){
  const r=escapeBuilderRun,t=r.trace;if(!r.on||!t||r.key!==escapeBuilderRunKey())return '';
  const pts=t.points.map(p=>p.x+','+p.y).join(' '),won=t.status==='won';
  const order=r.editing&&r.steps?[...r.steps.keys()].sort((a,b)=>(a===r.sel)-(b===r.sel)):[];
  const marks=order.map(i=>{const s=r.steps[i],p=escapeBuilderStepAt(s);if(!p||s.type==='end')return '';const on=i===r.sel;
    return '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(on?.34:.24)+'" fill="'+(on?'#ffd25a':'#1b1206')+'" fill-opacity="'+(on?1:.7)+'" stroke="#ffd25a" stroke-width=".05"/><text x="'+p.x+'" y="'+(p.y+.1)+'" font-size="'+(on?.34:.26)+'" text-anchor="middle" fill="'+(on?'#1b1206':'#ffe9a8')+'">'+(i+1)+'</text>';}).join('');
  return '<svg class="builder-route" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true">'+
    '<polyline points="'+pts+'" fill="none" stroke="#1b1206" stroke-opacity=".55" stroke-width=".26" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<polyline points="'+pts+'" fill="none" stroke="#ffd25a" stroke-width=".13" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray=".35 .18"/>'+
    t.waits.map(q=>'<circle cx="'+q.x+'" cy="'+q.y+'" r="'+Math.min(.7,.25+q.s*.06)+'" fill="#7fd3ff" fill-opacity=".25" stroke="#7fd3ff" stroke-width=".06"/><text x="'+q.x+'" y="'+(q.y-.45)+'" font-size=".42" text-anchor="middle" fill="#dff4ff" stroke="#0b1714" stroke-width=".08" paint-order="stroke">'+q.s+'s</text>').join('')+
    t.tools.map(q=>'<text x="'+q.x+'" y="'+(q.y+.18)+'" font-size=".55" text-anchor="middle">'+(ESCAPE_RUN_TOOLS[q.kind]||'•')+'</text>').join('')+
    '<circle cx="'+t.points[0].x+'" cy="'+t.points[0].y+'" r=".22" fill="#9be38f"/>'+marks+
    '<text x="'+t.end.x+'" y="'+(t.end.y+.22)+'" font-size=".7" text-anchor="middle" fill="'+(won?'#9be38f':'#ff6b5a')+'" stroke="#0b1714" stroke-width=".08" paint-order="stroke">'+(won?'✓':'✗')+'</text></svg>';
}
// The step list's buttons and fields.
function wireEscapeBuilderSteps(rerender){
  const r=escapeBuilderRun,$=id=>document.getElementById(id),q=sel=>document.querySelector(sel),step=()=>r.steps?.[r.sel];
  const changed=s=>{s.edited=true;r.dirty=true;rerender();};
  if($('builder-run-edit'))$('builder-run-edit').onclick=()=>{r.editing=!r.editing;r.picking=false;if(r.editing&&!r.steps)escapeBuilderRunTrace();else rerender();};
  for(const b of document.querySelectorAll('[data-step]'))b.onclick=()=>{r.sel=Number(b.dataset.step);r.picking=false;rerender();};
  if(q('[data-step-sprint]'))q('[data-step-sprint]').onchange=e=>{const s=step();s.sprint=e.target.checked;changed(s);};
  if(q('[data-step-wait]'))q('[data-step-wait]').onchange=e=>{const s=step();s.t=Math.max(0,Math.min(60,Number(e.target.value)||0));changed(s);};
  if(q('[data-step-aim]'))q('[data-step-aim]').onchange=e=>{const s=step();s.aim={right:{x:1,y:0},left:{x:-1,y:0},up:{x:0,y:-1},down:{x:0,y:1}}[e.target.value];changed(s);};
  if(q('[data-step-move]'))q('[data-step-move]').onclick=()=>{r.picking=!r.picking;escapeBuilderNote=r.picking?'Click the tile where step '+(r.sel+1)+' should end.':'';rerender();};
  if(q('[data-step-del]'))q('[data-step-del]').onclick=()=>{r.steps.splice(r.sel,1);const next=r.steps[r.sel];if(next)next.edited=true;r.sel=Math.min(r.sel,r.steps.length-1);r.dirty=true;rerender();};
  if($('builder-step-add'))$('builder-step-add').onchange=e=>{const kind=e.target.value;if(!kind)return;
    const at=Math.max(0,r.sel+1),before=r.steps[at-1],pos=(before&&escapeBuilderStepAt(before))||r.trace?.points?.[0]||{x:1,y:1};
    const s=kind==='go'?{type:'go',to:{...pos},sprint:false,points:[]}:kind==='wait'?{type:'wait',t:2}:{type:'act',kind,aim:before?.aim||{x:1,y:0},at:{...pos}};
    s.edited=true;r.steps.splice(at,0,s);r.sel=at;r.dirty=true;r.picking=kind==='go';escapeBuilderNote=kind==='go'?'Click the tile where the new step should end.':'';rerender();};
  if($('builder-steps-run'))$('builder-steps-run').onclick=()=>{r.picking=false;escapeBuilderStepsRun();};
  if($('builder-steps-reset'))$('builder-steps-reset').onclick=()=>{if(!confirm('Go back to the recorded run? Changes to the steps are lost, and a run saved with the draft is dropped.'))return;
    EscapeEdits.saveRun(r.key,escapeBuilderRunVariant(),null);r.commands=null;r.solved=null;r.steps=null;r.sel=-1;r.picking=false;r.dirty=false;escapeBuilderRunTrace();};
  if($('builder-steps-save'))$('builder-steps-save').onclick=()=>{const key=r.key,B=EscapeBuilder,m=escapeBuilderModel;
    if(!EscapeEdits.get(key)){const model=B.sanitize(m);if(model)EscapeEdits.save(key,model,B.validate(model).length?null:escapeWorkshopRoute(key,model));}
    const ok=EscapeEdits.saveRun(key,escapeBuilderRunVariant(),r.commands);
    escapeBuilderNote=!ok?'Could not save the run.':r.dirty?'Saved the run as it last played; ▶ Re-run to include your newest changes.':r.trace?.status==='won'?'Run saved with the draft. Export carries it into the game’s recordings.':'Run saved with the draft, but it does not win yet.';rerender();};
}
// A tile click while a step's end is being picked moves it there instead of painting.
function escapeBuilderStepPick(x,y){const r=escapeBuilderRun,s=r.on&&r.editing&&r.picking&&r.key===escapeBuilderRunKey()&&r.steps?.[r.sel];if(!s)return false;
  s.to={x:x+.5,y:y+.5};s.edited=true;r.picking=false;r.dirty=true;escapeBuilderNote='Step '+(r.sel+1)+' now ends at '+x+','+y+'. ▶ Re-run steps to see it play.';return true;}
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
  const drafts=EscapeEdits.all(),on=EscapeEdits.active(),live=[...EscapeCatalog.levels,...EscapeCatalog.hidden,...EscapeCatalog.kids,...EscapeCatalog.seasonal].filter(l=>l.draft).length,day=t=>String(t||'').slice(0,16).replace('T',' ');
  const row=key=>{const d=drafts[key];return '<div class="builder-saved"><b>'+escapeHtml(escapeWorkshopLabel(key))+'</b> <span>'+(d?'✎ draft saved '+day(d.savedAt)+(d.route?'':' · has problems, not playable in game'):'')+'</span><button data-wedit="'+key+'">Edit</button>'+
    (d?'<button data-wexport="'+key+'">Export</button><button data-wdiscard="'+key+'">Discard</button>':'')+'</div>';};
  let list='';EscapeCatalog.levels.forEach((l,i)=>{const chapter=EscapeWorld?.chapters?.find(c=>c.start===i);if(chapter)list+='<h4>'+escapeHtml(chapter.name)+'</h4>';list+=row('level:'+l.id);});
  list+='<h4>The Gilded Burrow and bonus escapes</h4>'+EscapeCatalog.hidden.map(l=>row('hidden:'+l.id)).join('');
  for(const pack of (typeof EscapeSeasons!=='undefined'?EscapeSeasons.packs:[]))list+='<h4>Seasonal · '+escapeHtml(pack.name)+'</h4>'+EscapeCatalog.seasonal.filter(l=>l.seasonal===pack.id).map(l=>row('seasonal:'+l.id)).join('');
  list+='<h4>Little Explorers</h4>'+EscapeCatalog.kids.map(l=>row('kids:'+l.id)).join('');
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
  if(hasAt(m.shade))shadow+='inset 0 -5px 0 #c96a48aa,';if(hasAt(m.slippery))bg='linear-gradient(#8fd0eccc,#bfe6f5aa),'+bg;if(hasAt(m.shrubs)&&!glyph)glyph='❀';if(hasAt(m.wet))bg='linear-gradient(#5a7a9455,#5a7a9433),'+bg;if(hasAt(m.thinIce)){bg='linear-gradient(#e2f2fbcc,#cfe8f5aa),'+bg;if(!glyph)glyph='<span style="opacity:.6">◌</span>';}if(hasAt(m.glowPlants)&&!glyph)glyph='✺';if(hasAt(m.regrowth)&&!glyph)glyph='✿';
  const wind=(m.wind||[]).find(z=>inRect(z.area));if(wind){bg='linear-gradient(#9ec4e033,#9ec4e033),'+bg;if(!glyph)glyph='<span style="opacity:.55">'+ESCAPE_BUILDER_ARROW[EscapeBuilder.DIRS.findIndex(([dx,dy])=>dx===wind.dir[0]&&dy===wind.dir[1])]+'</span>';}
  const current=(m.currents||[]).find(z=>inRect(z.area));if(current){bg='linear-gradient(#5ac8e044,#5ac8e044),'+bg;if(!glyph)glyph='<span style="opacity:.7">'+['⇒','⇓','⇐','⇑'][EscapeBuilder.DIRS.findIndex(([dx,dy])=>dx===current.dir[0]&&dy===current.dir[1])]+'</span>';}
  if((m.echoes||[]).some(a=>inRect(a)))shadow+='inset 0 0 0 2px #b9a6e888,';
  if((m.tunnels||[]).some(t=>hasAt(t)))glyph='⛏';
  if((m.regions||[]).some(r=>inRect(r.area)))shadow+='inset 0 0 0 2px #e8c45a88,';
  const cap=(m.caps||[]).find(c=>c.at[0]===x&&c.at[1]===y);if(cap)glyph='🍄';else if((m.caps||[]).some(c=>c.to&&c.to[0]===x&&c.to[1]===y))glyph='◎';
  const ant=(m.antTrails||[]).findIndex(t=>hasAt(t.path));if(ant>=0&&!glyph)glyph='<span style="color:#d79a60">∙</span>';
  if((m.seedCrossings||[]).some(c=>hasAt(c.banks)))glyph='🌱';else if((m.seedCrossings||[]).some(c=>hasAt(c.tiles)))shadow+='inset 0 0 0 2px #8fc86a88,';
  if(m.rootWheel&&m.rootWheel[0]===x&&m.rootWheel[1]===y)glyph='✣';
  if((m.crates||[]).some(q=>q[0]===x&&q[1]===y))glyph='📦';
  if((m.ropes||[]).some(r=>(r.from[0]===x&&r.from[1]===y)||(r.to&&r.to[0]===x&&r.to[1]===y)))glyph='➰';
  if((m.checkpoints||[]).some(q=>q[0]===x&&q[1]===y)&&!glyph)glyph='⚐';
  const prop=(m.props||[]).find(q=>q.at[0]===x&&q.at[1]===y);if(prop&&!glyph)glyph={lantern:'🏮',tree:'🍂',pumpkin:'🎃',brazier:'🔥',pine:'🌲',gift:'🎁'}[prop.kind];
  if(m.millWheel&&m.millWheel[0]===x&&m.millWheel[1]===y)glyph='☸';
  if(B.signAt(m,x,y)>=0){glyph='🪧';if(p?.kind==='sign'&&p.index===B.signAt(m,x,y))cls+=' builder-selected';}
  if(B.pageAt(m,x,y)>=0){glyph='📜';if(p?.kind==='page'&&p.index===B.pageAt(m,x,y))cls+=' builder-selected';}
  if(g&&(m.rivalries||[]).some(r=>r.includes(g.id)))glyph+='<i class="builder-zz">⚔</i>';
  const lureOf=m.guards.find(q=>q.lure&&q.lure[0]===x&&q.lure[1]===y);if(lureOf&&!g)glyph='<span style="color:#9ff">✦</span>';
  if(escapeBuilderAnchor&&escapeBuilderAnchor[0]===x&&escapeBuilderAnchor[1]===y)shadow+='inset 0 0 0 3px #fff,';
  const picked=p&&((p.kind==='guard'&&g?.id===p.id)||(p.kind==='door'&&d?.id===p.id)||(p.kind==='trigger'&&t?.id===p.id)||(p.kind==='hazard'&&h?.id===p.id)||(p.kind==='source'&&source===p.id&&!t));
  if(picked)cls+=' builder-selected';
  if((g&&linked.has(g.id))||(d&&linked.has(d.id))||(source&&linked.has(source)))cls+=' builder-linked';
  const patrolGuard=p?.kind==='guard'?m.guards.find(q=>q.id===p.id):null,step=patrolGuard?patrolGuard.patrol.findIndex(q=>q[0]===x&&q[1]===y):-1;
  return '<div class="'+cls+'" data-x="'+x+'" data-y="'+y+'" style="background:'+bg+(shadow?';box-shadow:'+shadow.slice(0,-1):'')+'">'+glyph+(step>=0?'<i>'+(step+1)+'</i>':'')+'</div>';
}
// How hard this one creature is: its own cunning (or the level's) and how quick it is on its feet.
const ESCAPE_BUILDER_CUNNING=['0, simple','1, sharpening','2, sharp','3, wise'],ESCAPE_BUILDER_PACE=[[.75,'Slow'],[.9,'Steady'],[1,'Normal'],[1.15,'Quick'],[1.3,'Fast']];
function escapeBuilderGuardDifficulty(g,level){
  const pace=g.pace??1,near=ESCAPE_BUILDER_PACE.reduce((a,b)=>Math.abs(b[0]-pace)<Math.abs(a[0]-pace)?b:a);
  return '<div class="builder-difficulty"><b>Difficulty</b> <label title="How quickly it reacts, how long it remembers Sally, how far ahead it reads her and how short its warnings are">Cunning <select data-ginsp="cunning"><option value="">Level\u2019s ('+ESCAPE_BUILDER_CUNNING[level]+')</option>'+
    ESCAPE_BUILDER_CUNNING.map((l,i)=>'<option value="'+i+'"'+(g.cunning===i?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
    '<label title="How fast it walks and chases">Pace <select data-ginsp="pace">'+ESCAPE_BUILDER_PACE.map(([v,l])=>'<option value="'+v+'"'+(near[0]===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label></div>';
}
// The settings only some enemies have.
function escapeBuilderGuardExtras(g){
  const n=(key,label,step=.1)=>' <label>'+label+' <input type="number" step="'+step+'" data-ginsp="'+key+'" value="'+(g[key]??'')+'"></label>';
  if(g.kind==='angler')return '<br>Lure: '+(g.lure?g.lure.join(','):'not set')+' <button data-insp="set-lure">Pick the lure tile</button>';
  if(g.kind==='crab')return '<br>Runs along <select data-ginsp="axis"><option value="">its facing</option><option value="x"'+(g.axis==='x'?' selected':'')+'>the row</option><option value="y"'+(g.axis==='y'?' selected':'')+'>the column</option></select>'+n('range','up to tiles',1);
  if(g.kind==='sentinel')return '<br>Gazes: '+ESCAPE_BUILDER_ARROW.map((a,i)=>'<label class="builder-check"><input type="checkbox" data-look="'+i+'"'+((g.looks||[]).some(v=>Math.abs((((Math.round(v/(Math.PI/2))%4)+4)%4)-i)<.1)?' checked':'')+'> '+a+'</label>').join('')+n('every','turns every s')+n('range','gaze reaches tiles',1)+' · its gaze glances off ice walls';
  if(g.kind==='ladybird')return '<br>Ambles along its patrol points and never catches Sally. Near her it plays dead; rushed, startled by a pebble or still crowded when it rights itself, it flies up and buzzes every hunter nearby to her. Crawling Sally never startles it.';
  if(g.kind==='magpie')return '<br>Sits on its perch and turns to look at each patrol point. Seen, it caws and every hunter nearby comes for Sally; it flies off to steal any pebble or glow thrown near it, and sees nothing while away.';
  if(g.kind==='cloudray')return '<br>Glides over everything along its patrol points, in a loop.'+n('speed','speed')+n('range','shadow radius');
  if(g.kind==='heron')return '<br>Looks: '+ESCAPE_BUILDER_ARROW.map((a,i)=>'<label class="builder-check"><input type="checkbox" data-look="'+i+'"'+((g.looks||[]).some(v=>Math.abs((((Math.round(v/(Math.PI/2))%4)+4)%4)-i)<.1)?' checked':'')+'> '+a+'</label>').join('')+n('every','turns every s');
  if(g.kind==='bat')return '<br>'+n('every','pings every s')+n('range','ring reaches tiles');
  if(g.kind==='dragonfly')return '<br>'+n('speed','speed');
  if(g.kind==='scorpion')return '<br><label class="builder-check"><input type="checkbox" data-ginsp="buried"'+(g.buried?' checked':'')+'> Buried until Sally is close</label>'+n('offset','tail rhythm delay s');
  if(g.kind==='owl')return '<br>Its patrol points are its look-outs.';
  if(g.kind==='cavefolk')return '<br>Colour <select data-ginsp="tint"><option value="">Take turns</option>'+Object.entries(EscapeBuilder.TINTS).map(([k,v])=>'<option value="'+k+'"'+(g.tint===k?' selected':'')+'>'+v+'</option>').join('')+'</select><br>Hunts as a pack: place two or three. When one spots Sally it shouts, and the rest within earshot fan out to her sides and ahead of her, then close in. They run from snakes, spiders, scorpions, wasp nests, mantises and the boogoo, and wait at a safe distance.';
  if(g.kind==='boogoo')return '<br>Walks its patrol points, whistling. Spotting Sally far off it whistles high and rams down a lane; up close it swings its arms forward and swipes with its claws.';
  return '';
}
function escapeBuilderInspector(){
  const m=escapeBuilderModel,B=EscapeBuilder,p=escapeBuilderPick;
  if(!p)return '<div class="builder-inspector"><b>Nothing selected.</b> Use ☝ Select to pick an enemy, door, trigger or hazard and change its settings, or drag anything that isn’t wall or floor to move it. Use 🔗 Link to tie triggers (plates, levers, the key, a chest) to doors, bridges or sleeping enemies.</div>';
  const links=ids=>ids.length?ids.map(id=>escapeHtml(escapeBuilderLabel(id))).join(', '):'nothing yet';
  let html='';
  if(p.kind==='guard'){const g=m.guards.find(q=>q.id===p.id);if(!g)return '';
    html='<b>'+ESCAPE_BUILDER_ENEMY[g.kind]+' '+B.ENEMIES[g.kind]+'</b> at '+g.spawn.join(',')+' · faces '+ESCAPE_BUILDER_ARROW[((Math.round((g.facing??Math.PI)/(Math.PI/2))%4)+4)%4]+
      (B.POSTED.has(g.kind)?' · keeps its post':' · walks '+g.patrol.length+' patrol point'+(g.patrol.length===1?'':'s')+' <button data-insp="clear-patrol">Clear patrol</button>')+
      '<label class="builder-check"><input type="checkbox" data-insp="sleep"'+(g.sleep?' checked':'')+'> Asleep until woken</label>'+(g.sleep?' Woken by: '+links(B.linksTo(m,g.id)):'')+
      escapeBuilderGuardDifficulty(g,m.cunning??2)+escapeBuilderGuardExtras(g)+(m.rivalries||[]).filter(r=>r.includes(g.id)).map(r=>'<br>Rival of '+escapeHtml(escapeBuilderLabel(r[0]===g.id?r[1]:r[0]))).join('');}
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
      (h.type!=='thorns'?' <label>Warning <input type="number" step="0.1" min="0" max="10" data-insp="hwarn" value="'+(h.warn??'')+'" title="Seconds it '+(h.type==='vent'?'hisses':'rumbles')+' before it goes; empty for the usual"> s</label>':'')+
      (h.type==='log'?'<label class="builder-check"><input type="checkbox" data-insp="hsnow"'+(h.skin==='snowball'?' checked':'')+'> Rolling snowball</label>':'')+
      '<br>Exact timing (seconds, overrides the speed): <label>every <input type="number" step="0.1" min="0" max="30" data-insp="hperiod" value="'+(h.period??'')+'"></label><label>'+(h.type==='log'?'roll speed':h.type==='vent'?'blowing for':'up for')+' <input type="number" step="0.1" min="0" max="30" data-insp="hon" value="'+(h.on??'')+'"></label><label>delay <input type="number" step="0.1" min="0" max="30" data-insp="hdelay" value="'+(h.delay??'')+'"></label>';}
  else if(p.kind==='wind'){const z=m.wind[p.index];if(!z)return '';const dir=B.DIRS.findIndex(([dx,dy])=>dx===z.dir[0]&&dy===z.dir[1]);
    html='<b>≋ Wind lane</b> '+z.area.slice(0,2).join(',')+'–'+z.area.slice(2).join(',')+' blows <select data-insp="wdir">'+ESCAPE_BUILDER_ARROW.map((a,i)=>'<option value="'+i+'"'+(i===dir?' selected':'')+'>'+a+'</option>').join('')+'</select>'+
      '<label>gust every <input type="number" step="0.1" data-insp="wperiod" value="'+z.period+'"></label><label>lasting <input type="number" step="0.1" data-insp="won" value="'+z.on+'"></label><label>delay <input type="number" step="0.1" data-insp="woffset" value="'+z.offset+'"></label><label>strength <input type="number" step="0.1" min="0.5" max="4" data-insp="wstrength" value="'+(z.strength||2.3)+'" title="1 is a breeze, 2.3 a gale, 3.5 nearly too strong to walk against"></label>';}
  else if(p.kind==='current'){const z=m.currents[p.index];if(!z)return '';const dir=B.DIRS.findIndex(([dx,dy])=>dx===z.dir[0]&&dy===z.dir[1]);
    html='<b>Current / slope</b> '+z.area.slice(0,2).join(',')+'–'+z.area.slice(2).join(',')+' flows <select data-insp="cdir">'+ESCAPE_BUILDER_ARROW.map((a,i)=>'<option value="'+i+'"'+(i===dir?' selected':'')+'>'+a+'</option>').join('')+'</select>'+
      '<label>surface <select data-insp="csurface"><option value="water"'+(z.surface!=='ground'?' selected':'')+'>Water stream</option><option value="ground"'+(z.surface==='ground'?' selected':'')+'>Ground slope</option></select></label><label>strength <input type="number" step="0.1" min="0.4" max="3" data-insp="cspeed" value="'+z.speed+'"></label> '+(z.surface!=='ground'?'<label title="Every few seconds the stream surges to half again its strength, then eases to half. Empty or 0 keeps it steady.">surges every <input type="number" step="0.5" min="0" max="20" data-insp="cpulse" value="'+(z.pulse??'')+'"> s</label>'+(z.pulse?'<label>offset <input type="number" step="0.05" min="0" max="0.95" data-insp="cphase" value="'+(z.phase??0)+'"></label>':''):'')+' Water builds a swimmer up to its speed and lets her drift on after she leaves it, and a thrown pebble floats away on it; a ground slope carries a walker at a steady pace to its end.';}
  else if(p.kind==='ants'){const t=m.antTrails[p.index];if(!t)return '';
    html='<b>🐜 Ant column</b> marching '+t.path.length+' points <label>groups <input type="number" min="1" max="8" data-insp="agroups" value="'+t.groups+'"></label><label>ants per group <input type="number" min="1" max="8" data-insp="asize" value="'+t.size+'"></label><label>speed <input type="number" step="0.1" min="0.3" max="4" data-insp="aspeed" value="'+t.speed+'"></label> <button data-insp="anew">Start a new column</button>';}
  else if(p.kind==='page'){const pg=(m.pages||[])[p.index];if(!pg)return '';
    html='<b>📜 Page</b> at '+pg.at.join(',')+(pg.id?' · this escape’s story page':'')+'<br><label>Title <input data-insp="ptitle" maxlength="40" value="'+escapeHtml(pg.title||'')+'"></label> <label>Signed <input data-insp="pauthor" maxlength="30" placeholder="(unsigned)" value="'+escapeHtml(pg.author||'')+'"></label>'
      +'<br><label class="builder-hint">Words <textarea data-insp="pbody" maxlength="320" rows="3" placeholder="What does the note say? Players read it after the run.">'+escapeHtml(pg.body||'')+'</textarea></label>'+(pg.body?'':'<br><i>A page with no words is left out of the level.</i>');}
  else if(p.kind==='sign'){const q=(m.signs||[])[p.index];if(!q)return '';
    html='<b>🪧 Trail sign</b> at '+q.at.join(',')+'<br><label>Title <input data-insp="stitle" maxlength="40" value="'+escapeHtml(q.title||'')+'"></label>'
      +'<br><label class="builder-hint">Words <textarea data-insp="sbody" maxlength="320" rows="3" placeholder="What does the sign say? Sally reads it when she stands by it and presses Read (A or Enter).">'+escapeHtml(q.body||'')+'</textarea></label>';}
  else if(p.kind==='rope'){const r=m.ropes[p.index];if(!r)return '';html='<b>➰ Rope</b> '+r.from.join(',')+' – '+(r.to?r.to.join(','):'<b>click the other end</b>')+'<label>swings every <input type="number" step="0.5" min="2" max="12" data-insp="rperiod" value="'+r.period+'"> s</label><label>offset <input type="number" step="0.05" min="0" max="0.99" data-insp="rphase" value="'+(r.phase||0)+'"></label>';}
  else if(p.kind==='cap'){const c=m.caps[p.index];if(!c)return '';html='<b>🍄 Bounce cap</b> at '+c.at.join(',')+' · '+(c.to?'throws Sally to '+c.to.join(','):'<b>click where it throws Sally</b>')+'<label title="A springy cap throws a sprinting Sally this many tiles further along the same line">springy <select data-insp="capspring">'+[0,1,2,3].map(n=>'<option value="'+n+'"'+((c.spring||0)===n?' selected':'')+'>'+(n?'+'+n+' when sprinting':'no')+'</option>').join('')+'</select></label>';}
  return '<div class="builder-inspector">'+html+'</div>';
}
// Whole-level settings: tools, time, darkness, and the sky and weather.
function escapeBuilderSettings(){
  const m=escapeBuilderModel,num=(k,label,max=600,step=1)=>'<label>'+label+' <input type="number" min="0" max="'+max+'" step="'+step+'" data-set="'+k+'" value="'+(m[k]||0)+'"></label>',
    check=(k,label)=>'<label class="builder-check"><input type="checkbox" data-set="'+k+'"'+(m[k]?' checked':'')+'> '+label+'</label>',
    sky=(k,label,fields)=>'<div class="builder-sky"><label class="builder-check"><input type="checkbox" data-sky="'+k+'"'+(m[k]?' checked':'')+'> '+label+'</label>'+(m[k]?fields.map(([f,l])=>'<label>'+l+' <input type="number" step="0.1" min="0" max="120" data-skyf="'+k+'.'+f+'" value="'+m[k][f]+'"></label>').join(''):'')+'</div>';
  return '<div class="builder-settings">'+
    num('camos','Camouflage',5)+num('seeds','Seeds',5)+num('diggers','Tunnel kits (dig your own burrow pair)',5)+num('glows','Glow mushrooms',5)+num('spores','Spore pouches',5)+num('timeLimit','Time limit (s, 0 = none)')+num('sightRadius','Sight (tiles, 0 = default)',12)+
    '<label>Cunning <select data-set="cunning">'+['0, simple: chases where Sally is','1, sharpening','2, sharp: reads where she is going','3, wise: reads loops fast'].map((l,i)=>'<option value="'+i+'"'+((m.cunning??2)===i?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
    check('tailDrop','Spare tail (one catch forgiven)')+check('slowIce','Slow thin ice (the gentler pace of the first winter levels)')+check('unlimited','Unlimited pouches (tools never run out)')+check('dark','Dark (glow plants light it)')+check('gaze','Sally sees only ahead')+check('living','Living garden')+check('abyss','Bottomless gaps')+
    '<label class="builder-check"><input type="checkbox" data-set="gentle"'+(m.gentle>0?' checked':'')+'> Gentle (Little Explorers: slower hunters, a catch is an Oops back to a checkpoint)</label>'+
    (m.guards.some(g=>g.kind==='fox')?num('foxWarn','Fox warning (s, 0 = usual)',3,.05):'')+
    '<label>Look <select data-set="look">'+Object.entries(EscapeBuilder.LOOKS).map(([k,v])=>'<option value="'+k+'"'+((m.look||'')===k?' selected':'')+'>'+escapeHtml(v)+(/^(autumn|winter)/.test(k)?' (creatures in costume)':/^spring/.test(k)?' (spring scenery)':/^summer/.test(k)?' (summer scenery)':'')+'</option>').join('')+'</select></label>'+
    '<label class="builder-check"><input type="checkbox" data-set="biome"'+(m.biome==='desert'?' checked':'')+'> Desert sand</label></div>'+
    sky('hawk','Hawk overhead',[['every','dives every s'],['warn','warning s'],['first','first dive at s']])+
    sky('storm','Lightning storm',[['every','flash every s'],['warn','rumble warning s'],['first','first flash at s']])+
    sky('tide','Tide on the flats',[['period','cycle s'],['high','high tide lasts s'],['offset','delay s']])+
    '<label class="builder-hint">Hint <textarea data-set="hint" maxlength="400" rows="2">'+escapeHtml(m.hint||'')+'</textarea></label>';
}
// The builder is laid out like an app: a menu bar (File, Edit, Level, Help) with the level's name,
// its problems and Playtest; the tools on the left, in tabs; the map in the middle; what is
// selected on the right. Level details, weather, quick build, sharing and My levels open as
// dialogs; right-click on the map opens a menu for whatever is under the pointer; every change
// can be undone (Ctrl+Z) and redone (Ctrl+Shift+Z).
let escapeBuilderDialog=null,escapeBuilderGrab=null,escapeBuilderMenu=null,escapeBuilderUndo=[],escapeBuilderRedo=[],escapeBuilderState=null,escapeBuilderStroke=null;
const ESCAPE_BUILDER_TABS=[['tiles','Ground'],['places','Places'],['creatures','Creatures'],['doors','Doors & switches'],['hazards','Hazards'],['extras','Extras']];
const ESCAPE_BUILDER_MODES=[['select','☝','Select','V','Pick something to see and change its settings'],['link','🔗','Link','L','Click a trigger, the key or a chest, then the doors, bridges or enemies to link or unlink'],
  ['patrol','➜','Patrol','P','Click an enemy, then the tiles it should walk to, in order'],['turn','↻','Turn','T','Turn an enemy or a vent a quarter turn'],['remove','✕','Remove','X','Remove an enemy, trigger, hazard, door tile or mark']];
// Keep a copy of the level before each change, so it can be undone. A drag of paint is one change.
function escapeBuilderRemember(){
  const snap=JSON.stringify(escapeBuilderModel);if(escapeBuilderState!==null&&snap!==escapeBuilderState&&!escapeBuilderStroke?.pushed){escapeBuilderUndo.push(escapeBuilderState);if(escapeBuilderUndo.length>100)escapeBuilderUndo.shift();escapeBuilderRedo=[];if(escapeBuilderStroke)escapeBuilderStroke.pushed=true;}
  escapeBuilderState=snap;
}
function escapeBuilderStep(back){
  const from=back?escapeBuilderUndo:escapeBuilderRedo,to=back?escapeBuilderRedo:escapeBuilderUndo;if(!from.length)return false;
  to.push(escapeBuilderState);escapeBuilderState=from.pop();escapeBuilderModel=JSON.parse(escapeBuilderState);escapeBuilderPick=null;escapeBuilderAnchor=null;escapeBuilderNote=back?'Undone.':'Redone.';renderEscapeBuilder();return true;
}
// The tools: a slim strip of icons down the left (the five modes, then one icon per group).
// A group opens a pop-out of compact tiles over the map; picking one closes it, and the brush in
// hand shows in the menu bar.
let escapeBuilderFlyout=null,escapeBuilderToastTimer=null;
const ESCAPE_BUILDER_TAB_ICON={tiles:'▦',places:'⚑',creatures:'🐍',doors:'▮',hazards:'♨',extras:'✦'};
function escapeBuilderToolsIn(tab){
  const B=EscapeBuilder,short=v=>v.split(' (')[0];
  if(tab==='tiles')return [...Object.entries(B.TILES).map(([k,v])=>[k,ESCAPE_BUILDER_LOOK[k][1]||'■',short(v),v]),['cold','❄','Cold ground','Cold ground chills Sally'],['warm','◍','Warm stone','A warm stone thaws Sally']];
  if(tab==='places')return Object.entries(B.MARKS).map(([k,v])=>[k,ESCAPE_BUILDER_LOOK[k][1],short(v),v]);
  if(tab==='creatures')return Object.entries(B.ENEMIES).map(([k,v])=>['enemy:'+k,ESCAPE_BUILDER_ENEMY[k],short(v),v]);
  if(tab==='doors')return [['door','▮','Door','Paint door tiles in the chosen colour'],['bridge','═','Bridge','Paint bridge tiles in the chosen colour (over a gap or water)'],...Object.entries(B.TRIGGERS).map(([k,v])=>['trig:'+k,ESCAPE_BUILDER_TRIGGER[k],short(v),v])];
  if(tab==='hazards')return Object.entries(B.HAZARDS).map(([k,v])=>['haz:'+k,ESCAPE_BUILDER_HAZARD[k],short(v),v+(k==='vent'?' (place it in a wall)':k==='log'?' (click its start, then where it rolls to)':'')]);
  return Object.entries(ESCAPE_BUILDER_EXTRAS).map(([k,[icon,title]])=>[k,icon,title.split(':')[0],title]);
}
function escapeBuilderTabOf(tool){return ESCAPE_BUILDER_TABS.map(t=>t[0]).find(t=>escapeBuilderToolsIn(t).some(x=>x[0]===tool))||null;}
// What is in hand, for the brush chip: [icon, name].
function escapeBuilderBrush(){
  const mode=ESCAPE_BUILDER_MODES.find(x=>x[0]===escapeBuilderTool);if(mode)return [mode[1],mode[2]];
  const tab=escapeBuilderTabOf(escapeBuilderTool),t=tab&&escapeBuilderToolsIn(tab).find(x=>x[0]===escapeBuilderTool);return t?[t[1],t[2]]:['■',escapeBuilderTool];
}
function escapeBuilderRail(){
  const on=escapeBuilderTabOf(escapeBuilderTool);
  return '<nav class="builder-rail" aria-label="Tools">'+ESCAPE_BUILDER_MODES.map(([id,icon,label,key,title])=>'<button class="builder-railbtn'+(escapeBuilderTool===id?' builder-tool-on':'')+'" data-tool="'+id+'" title="'+escapeHtml(label+' ('+key+'): '+title)+'" aria-label="'+label+'">'+icon+'</button>').join('')+
    '<hr>'+ESCAPE_BUILDER_TABS.map(([id,label],i)=>'<button class="builder-railbtn'+(on===id?' builder-rail-on':'')+(escapeBuilderFlyout===id?' builder-rail-open':'')+'" data-tab="'+id+'" title="'+escapeHtml(label+' ('+(i+1)+')')+'" aria-label="'+label+'" aria-expanded="'+(escapeBuilderFlyout===id)+'">'+ESCAPE_BUILDER_TAB_ICON[id]+'</button>').join('')+'</nav>';
}
function escapeBuilderFlyoutHtml(){
  const tab=escapeBuilderFlyout;if(!tab)return '';const B=EscapeBuilder,label=ESCAPE_BUILDER_TABS.find(t=>t[0]===tab)[1];
  const tiles=escapeBuilderToolsIn(tab).map(([id,icon,name,title])=>'<button class="builder-tile'+(escapeBuilderTool===id?' builder-tool-on':'')+'" data-tool="'+id+'" title="'+escapeHtml(title)+'"><b>'+icon+'</b><span>'+escapeHtml(name)+'</span></button>').join('');
  return '<div class="builder-scrim" data-close-fly="1"></div><div class="builder-flyout" role="dialog" aria-label="'+escapeHtml(label)+'"><h4>'+escapeHtml(label)+'</h4>'+
    (tab==='doors'?'<div class="builder-swatches" aria-label="Door colour">'+B.COLORS.map(([name,rgb],i)=>'<button class="builder-swatch'+(escapeBuilderColor===i?' builder-tool-on':'')+'" data-color="'+i+'" title="'+name+'" style="background:rgb('+rgb.join(',')+')"></button>').join('')+'</div>':'')+
    '<div class="builder-tiles">'+tiles+'</div></div>';
}
function escapeBuilderMenuBar(problems){
  const ws=escapeBuilderWorkshop,open=escapeBuilderMenu?.kind==='menu'?escapeBuilderMenu.id:null,B=EscapeBuilder;
  const item=(id,label,key='',disabled=false)=>'<button id="'+id+'"'+(disabled?' disabled':'')+'>'+label+(key?'<kbd>'+key+'</kbd>':'')+'</button>';
  const menus={file:ws?item('workshop-save','Save draft','Ctrl+S')+item('workshop-export1','Export draft','',!EscapeEdits.get(ws.key))+'<hr>'+item('workshop-revert','Back to the game’s version')+(EscapeEdits.get(ws.key)?item('workshop-discard','Discard draft'):''):
      item('builder-new','New level')+item('builder-quick','⚡ Quick build…')+item('builder-levels','My levels…')+'<hr>'+item('builder-save','Save','Ctrl+S')+item('builder-share','Share as text…')+item('builder-import','Import from text…')+'<hr>'+
      item('builder-publish','⇪ Publish to community','',problems.length>0)+item('builder-community','Community levels')+item('builder-admin','Admin'),
    edit:item('builder-undo','Undo','Ctrl+Z',!escapeBuilderUndo.length)+item('builder-redo','Redo','Ctrl+Shift+Z',!escapeBuilderRedo.length)+'<hr>'+item('builder-deselect','Deselect','Esc',!escapeBuilderPick),
    level:item('builder-details','Size, tools and details…')+item('builder-settings','Settings and weather…'),
    help:item('builder-keys','Keyboard shortcuts…')};
  const menu=(id,label)=>'<div class="builder-menu"><button class="builder-menubtn" data-menu="'+id+'" aria-expanded="'+(open===id)+'">'+label+'</button>'+(open===id?'<div class="builder-dropdown" role="menu">'+menus[id]+'</div>':'')+'</div>';
  return '<div class="builder-bar"><button id="builder-back" class="builder-back" title="'+(ws?'Back to the workshop':'Back to the main menu')+'">←</button>'+
    '<span class="builder-title">'+(ws?'✎ '+escapeHtml(escapeWorkshopLabel(ws.key)):'Level builder')+'</span>'+
    menu('file','File')+menu('edit','Edit')+menu('level','Level')+menu('help','Help')+
    '<input id="builder-name" class="builder-name-inline" maxlength="40" aria-label="Level name" value="'+escapeHtml(escapeBuilderModel.name)+'">'+
    (([icon,name])=>'<span class="builder-brush" title="The brush in hand">'+icon+' '+escapeHtml(name)+'</span>')(escapeBuilderBrush())+
    '<button id="builder-hints" class="builder-chip'+(escapeBuilderHintsOn()?' on':'')+'" title="Show what a tool or tile is when you rest the pointer on it" aria-pressed="'+escapeBuilderHintsOn()+'">💬 Hints '+(escapeBuilderHintsOn()?'on':'off')+'</button>'+
    (ws?'<button id="builder-route" class="builder-chip'+(escapeBuilderRun.on&&escapeBuilderRun.key===ws.key?' on':'')+'" title="Show the recorded winning run over the map and check it still wins on your edit">🏁 Winning run</button>':'')+
    '<button id="builder-solve" class="builder-chip'+(escapeBuilderSolver?' on':'')+'" title="Let the route planner try to escape this level as it stands (up to about a minute)">'+(escapeBuilderSolver?'■ Stop':'🤖 Solve')+'</button>'+
    '<button id="builder-problems" class="builder-chip'+(problems.length?' bad':'')+'" title="'+escapeHtml(problems.join(' '))+'">'+(problems.length?'⚠ '+problems.length+' to fix':'✓ Ready')+'</button>'+
    '<button id="builder-play" class="escape-primary"'+(problems.length?' disabled':'')+'>▶ Playtest</button></div>';
}
function escapeBuilderDialogHtml(){
  const m=escapeBuilderModel,B=EscapeBuilder,d=escapeBuilderDialog,w=m.map[0].length,h=m.map.length;if(!d)return '';
  let title='',body='';
  if(d==='details'){title='Size, tools and details';body='<div class="builder-settings"><label>Brief <input id="builder-brief" maxlength="140" value="'+escapeHtml(m.brief)+'"></label><label>Made by <input id="builder-author" maxlength="30" value="'+escapeHtml(m.author||'')+'"></label></div>'+
    '<div class="builder-settings"><label>Width <input id="builder-w" type="number" min="'+B.LIMITS.minW+'" max="'+B.LIMITS.maxW+'" value="'+w+'"></label><label>Height <input id="builder-h" type="number" min="'+B.LIMITS.minH+'" max="'+B.LIMITS.maxH+'" value="'+h+'"></label>'+
    ['burrows','pebbles','tongues'].map(k=>'<label>'+k[0].toUpperCase()+k.slice(1)+' <input data-count="'+k+'" type="number" min="0" max="5" value="'+m[k]+'"></label>').join('')+
    '<label>Hatch toll <input id="builder-toll" type="number" min="0" max="99" value="'+m.requiredTreasure+'"></label><label class="builder-check"><input id="builder-dark" type="checkbox"'+(m.explore?' checked':'')+'> Dark (explore)</label></div>';}
  else if(d==='settings'){title='Settings and weather';body=escapeBuilderSettings();}
  else if(d==='quick'){title='⚡ Quick build';body=escapeQuickPanel();}
  else if(d==='share'){title='Share as text';body='<p class="builder-hint">Copy this line and send it. Anyone can paste it into Import to play or edit your level.</p><textarea id="builder-text" class="builder-text" readonly>'+escapeHtml(B.exportText(m))+'</textarea>';}
  else if(d==='import'){title='Import from text';body='<textarea id="builder-text" class="builder-text" placeholder="Paste a shared level here: the whole line that starts with SALLY"></textarea><button id="builder-import-go" class="escape-primary">Import</button>';}
  else if(d==='levels'){title='My levels';body='<div class="builder-list">'+(B.loadAll(ESCAPE_BUILDER_STORE).map(l=>'<div class="builder-saved"><b>'+escapeHtml(l.name)+'</b> <span>'+l.map[0].length+'×'+l.map.length+' · '+l.guards.length+' enemies</span><button data-play="'+l.id+'">Play</button><button data-edit="'+l.id+'">Edit</button><button data-delete="'+l.id+'">Delete</button></div>').join('')||'<p>No saved levels yet. Saved levels stay in this browser; publish one to share it with every player.</p>')+'</div>';}
  else if(d==='problems'){title='Before it can be played';const p=B.validate(m);body=p.length?'<ul class="builder-problems">'+p.map(t=>'<li>'+escapeHtml(t)+'</li>').join('')+'</ul>':'<p>✓ Ready to play. Treasure in level: '+B.treasureTotal(m)+'.</p>';}
  else if(d==='keys'){title='Keyboard shortcuts';body='<ul class="builder-keys">'+[['V','Select'],['L','Link'],['P','Patrol'],['T','Turn'],['X','Remove'],['W / F','Wall / floor'],['1 – 6','Open a tool group'],['Right-click','Menu for that tile'],['Ctrl+Z','Undo'],['Ctrl+Shift+Z or Ctrl+Y','Redo'],['Ctrl+S','Save'],['Esc','Close, or deselect']].map(([k,t])=>'<li><kbd>'+k+'</kbd>'+t+'</li>').join('')+'</ul>';}
  return '<div class="builder-dialog-wrap" data-close-dialog="1"><div class="builder-dialog" role="dialog" aria-modal="true" aria-label="'+escapeHtml(title)+'"><h3>'+escapeHtml(title)+'</h3>'+body+'<div class="builder-dialog-foot"><button class="escape-secondary" data-close-dialog="1">Done</button></div></div></div>';
}
// Right-click on the map: what can be done to what is under the pointer, and a few quick places.
function escapeBuilderContextHtml(){
  const c=escapeBuilderMenu;if(c?.kind!=='context')return '';const [x,y]=c.cell,here=escapeBuilderPickAt(x,y),m=escapeBuilderModel,B=EscapeBuilder,g=B.guardAt(m,x,y),vent=B.hazardAt(m,x,y)?.type==='vent';
  const item=(act,label)=>'<button data-ctx="'+act+'">'+label+'</button>';
  let html=here?'<span class="builder-context-title">'+escapeHtml(escapeBuilderLabel(here.id||here.kind))+'</span>'+item('select','☝ Select')+(g||vent?item('turn','↻ Turn'):'')+(g?item('patrol','➜ Set its patrol'):'')+(['source','trigger'].includes(here.kind)?item('link','🔗 Link to…'):'')+item('remove','✕ Remove')+'<hr>':'';
  html+=item('floor','Floor here')+item('wall','Wall here')+item('leaves','Leaves here')+'<hr>'+item('sally','Put Sally here')+item('key','Put the key here')+item('hatch','Put the hatch here')+'<hr>'+item('pick','Use this tile’s brush');
  return '<div class="builder-scrim" data-close-menu="1"></div><div class="builder-context" role="menu" style="left:'+c.left+'px;top:'+c.top+'px">'+html+'</div>';
}
function renderEscapeBuilder(){
  escapeBuilderRemember();
  const m=escapeBuilderModel,B=EscapeBuilder,panel=document.getElementById('escape-builder'),w=m.map[0].length,problems=B.validate(m),linked=escapeBuilderLinked();
  const side=escapeBuilderPick?'<aside class="builder-side-right">'+escapeBuilderInspector()+'</aside>':'';
  panel.innerHTML='<div class="builder-app">'+escapeBuilderMenuBar(problems)+(escapeBuilderMenu?.kind==='menu'?'<div class="builder-scrim" data-close-menu="1"></div>':'')+
    '<div class="builder-body'+(side?' builder-body-inspect':'')+'">'+escapeBuilderRail()+
    '<main class="builder-canvas">'+escapeBuilderFlyoutHtml()+'<div id="builder-grid" class="builder-grid" style="grid-template-columns:repeat('+w+',1fr);--w:'+w+'">'+m.map.map((row,y)=>[...row].map((ch,x)=>escapeBuilderCell(x,y,ch,linked)).join('')).join('')+escapeBuilderRunSvg(w,m.map.length)+'</div>'+escapeBuilderRunBar()+
    (escapeBuilderNote?'<p class="builder-toast" role="status">'+escapeHtml(escapeBuilderNote)+'</p>':'')+
    (escapeBuilderWorkshop?'<p class="builder-badge">Workshop draft · saved only in this browser</p>':'')+'</main>'+side+'</div></div>'+escapeBuilderDialogHtml()+escapeBuilderContextHtml();
  // A message shows for a few seconds, then clears.
  if(escapeBuilderNote&&typeof setTimeout==='function'){clearTimeout(escapeBuilderToastTimer);const note=escapeBuilderNote;escapeBuilderToastTimer=setTimeout(()=>{if(escapeBuilderNote===note){escapeBuilderNote='';document.querySelector?.('.builder-toast')?.remove();}},5000);}
  wireEscapeBuilder();
}
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// The topmost thing on a tile, for Select and Link.
function escapeBuilderPickAt(x,y){
  const m=escapeBuilderModel,B=EscapeBuilder,g=B.guardAt(m,x,y),t=B.triggerAt(m,x,y),h=B.hazardAt(m,x,y),d=B.doorAt(m,x,y),s=B.sourceAt(m,x,y);
  if(g)return {kind:'guard',id:g.id};if(t)return {kind:'trigger',id:t.id};
  const rope=(m.ropes||[]).findIndex(r=>(r.from[0]===x&&r.from[1]===y)||(r.to&&r.to[0]===x&&r.to[1]===y));if(rope>=0)return {kind:'rope',index:rope};
  const cap=(m.caps||[]).findIndex(c=>c.at[0]===x&&c.at[1]===y);if(cap>=0)return {kind:'cap',index:cap};
  const page=B.pageAt(m,x,y);if(page>=0)return {kind:'page',index:page};
  const sign=B.signAt(m,x,y);if(sign>=0)return {kind:'sign',index:sign};
  const ant=(m.antTrails||[]).findIndex(q=>q.path.some(p=>p[0]===x&&p[1]===y));if(ant>=0)return {kind:'ants',index:ant};
  if(s&&!s.startsWith('enter:'))return {kind:'source',id:s};if(h)return {kind:'hazard',id:h.id};if(d)return {kind:'door',id:d.id};
  const wind=(m.wind||[]).findIndex(z=>x>=z.area[0]&&x<=z.area[2]&&y>=z.area[1]&&y<=z.area[3]);if(wind>=0&&!s)return {kind:'wind',index:wind};
  const current=(m.currents||[]).findIndex(z=>x>=z.area[0]&&x<=z.area[2]&&y>=z.area[1]&&y<=z.area[3]);if(current>=0&&!s)return {kind:'current',index:current};
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
  if(t==='rope'){if((m.ropes||[]).some(r=>!r.to)){if(!B.setRopeEnd(m,x,y))escapeBuilderNote='Pick open floor for the other end.';else escapeBuilderPick={kind:'rope',index:m.ropes.length-1};return true;}
    if(!B.addRope(m,x,y)){escapeBuilderNote='Ropes start on open floor (up to 8).';return true;}escapeBuilderNote='Now click the other end of the swing.';return true;}
  if(t==='cap'){if((m.caps||[]).some(c=>!c.to)){if(!B.setCapEnd(m,x,y))escapeBuilderNote='Pick open floor for the landing.';else escapeBuilderPick={kind:'cap',index:m.caps.length-1};return true;}
    if(!B.addCap(m,x,y)){escapeBuilderNote='Caps go on open floor.';return true;}escapeBuilderNote='Now click where the cap throws Sally.';return true;}
  if(t==='wind'||t==='area'||t==='seedbed'||t==='current'||t==='echo'||t==='tunnel'){
    if(!escapeBuilderAnchor){escapeBuilderAnchor=[x,y];escapeBuilderNote=t==='seedbed'?'Now click the other bank, in the same row or column.':t==='tunnel'?'Now click the partner mound.':'Now click the opposite corner.';return true;}
    const [ax,ay]=escapeBuilderAnchor;escapeBuilderAnchor=null;
    if(t==='current'){if(B.addCurrent(m,ax,ay,x,y)){escapeBuilderPick={kind:'current',index:m.currents.length-1};escapeBuilderNote='Set which way it flows and how strong below.';}}
    else if(t==='echo'){if(!B.addEcho(m,ax,ay,x,y))escapeBuilderNote='That is as many echo halls as a level can hold.';}
    else if(t==='tunnel'){if(!B.addTunnel(m,[ax,ay],[x,y]))escapeBuilderNote='Both mounds go on open ground, apart from each other.';}
    else if(t==='wind'){B.addWind(m,ax,ay,x,y);escapeBuilderPick={kind:'wind',index:m.wind.length-1};escapeBuilderNote='Set which way it blows and how often below.';}
    else if(t==='area'){const id=B.addRegion(m,ax,ay,x,y);if(id){escapeBuilderPick={kind:'source',id:'enter:'+id};escapeBuilderTool='link';escapeBuilderNote='Now click the doors or sleeping enemies walking in should affect.';}}
    else if(!B.addSeedCrossing(m,[ax,ay],[x,y]))escapeBuilderNote='The two banks must be in the same row or column with a gap between.';
    return true;}
  if(t==='ants'){const ok=B.addAntPoint(m,x,y,escapeBuilderAnchor==='new');escapeBuilderAnchor=null;if(ok)escapeBuilderPick={kind:'ants',index:m.antTrails.length-1};return ok;}
  if(t==='wheel')return B.setRootWheel(m,x,y);
  if(t==='crate'){if(!B.toggleCrate(m,x,y))escapeBuilderNote='Crates go on open floor (up to 24).';return true;}
  if(t==='checkpoint'){if(!B.toggleCheckpoint(m,x,y))escapeBuilderNote='Checkpoints go on open floor (up to 6).';return true;}
  if(t.startsWith('prop:'))return B.toggleProp(m,t.slice(5),x,y);
  if(t==='millwheel')return B.setMillWheel(m,x,y);
  if(t==='sign'){const i=B.signAt(m,x,y);if(i>=0){escapeBuilderPick={kind:'sign',index:i};return true;}
    if(!B.addSign(m,x,y)){escapeBuilderNote=(m.signs||[]).length>=4?'A level holds up to 4 trail signs.':'Signs go on open floor.';return true;}
    escapeBuilderPick={kind:'sign',index:m.signs.length-1};escapeBuilderNote='Write what the sign says below.';return true;}
  if(t==='page'){const i=B.pageAt(m,x,y);if(i>=0){escapeBuilderPick={kind:'page',index:i};return true;}
    if(!B.addPage(m,x,y)){escapeBuilderNote=(m.pages||[]).length>=B.PAGE_LIMIT?'A level holds up to '+B.PAGE_LIMIT+' pages.':'Pages go on open floor.';return true;}
    escapeBuilderPick={kind:'page',index:m.pages.length-1};escapeBuilderNote='Write what the page says below.';return true;}
  if(t==='rival'){const g=B.guardAt(m,x,y);if(!g){escapeBuilderNote='Click an enemy.';return true;}
    if(p?.kind==='guard'&&p.id!==g.id){B.toggleRival(m,p.id,g.id);escapeBuilderNote='Rivals: '+escapeBuilderLabel(p.id)+' and '+escapeBuilderLabel(g.id)+' (click the pair again to undo).';escapeBuilderPick=null;return true;}
    escapeBuilderPick={kind:'guard',id:g.id};escapeBuilderNote='Now click its rival.';return true;}
  return B.paint(m,x,y,t);
}
const escapeBuilderDrags=t=>Object.keys(EscapeBuilder.TILES).includes(t)||['1','2','3','door','bridge','cold','warm'].includes(t)||t.startsWith('layer:');
function wireEscapeBuilder(){
  const m=escapeBuilderModel,B=EscapeBuilder,$=id=>document.getElementById(id),rerender=()=>renderEscapeBuilder(),ws=escapeBuilderWorkshop,on=(id,fn)=>{const el=$(id);if(el)el.onclick=fn;};
  const dialog=d=>{escapeBuilderDialog=d;escapeBuilderMenu=null;rerender();},act=fn=>()=>{escapeBuilderMenu=null;fn();};
  on('builder-back',ws?()=>openEscapeWorkshop():closeEscapeBuilder);
  on('builder-hints',()=>{try{escapeStore.setItem(ESCAPE_BUILDER_HINT_KEY,escapeBuilderHintsOn()?'0':'1');}catch(_){}const tipEl=document.getElementById('builder-tip');if(tipEl)tipEl.hidden=true;rerender();});
  wireEscapeBuilderHints(document.getElementById('escape-builder'));
  if($('builder-name'))$('builder-name').onchange=e=>{m.name=e.target.value;rerender();};
  if($('builder-brief'))$('builder-brief').onchange=e=>{m.brief=e.target.value;};if($('builder-author'))$('builder-author').onchange=e=>{m.author=e.target.value;};
  if($('builder-w'))$('builder-w').onchange=$('builder-h').onchange=()=>{escapeBuilderModel=B.resize(m,Number($('builder-w').value),Number($('builder-h').value));escapeBuilderPick=null;rerender();};
  for(const input of document.querySelectorAll('[data-count]'))input.onchange=e=>{m[e.target.dataset.count]=Math.max(0,Math.min(5,Number(e.target.value)||0));rerender();};
  if($('builder-toll'))$('builder-toll').onchange=e=>{m.requiredTreasure=Math.max(0,Math.min(99,Number(e.target.value)||0));rerender();};
  if($('builder-dark'))$('builder-dark').onchange=e=>{m.explore=e.target.checked;rerender();};
  // The menu bar, dialogs and the right-click menu.
  for(const b of document.querySelectorAll('[data-menu]'))b.onclick=()=>{const id=b.dataset.menu;escapeBuilderMenu=escapeBuilderMenu?.id===id?null:{kind:'menu',id};rerender();};
  for(const b of document.querySelectorAll('[data-menu]'))b.onpointerenter=()=>{if(escapeBuilderMenu?.kind==='menu'&&escapeBuilderMenu.id!==b.dataset.menu){escapeBuilderMenu={kind:'menu',id:b.dataset.menu};rerender();}};
  for(const el of document.querySelectorAll('[data-close-menu]'))el.onpointerdown=e=>{e.preventDefault();escapeBuilderMenu=null;rerender();};
  for(const el of document.querySelectorAll('[data-close-dialog]'))el.onclick=e=>{if(e.target!==el)return;escapeBuilderDialog=null;rerender();};
  for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>{escapeBuilderFlyout=escapeBuilderFlyout===b.dataset.tab?null:b.dataset.tab;rerender();};
  for(const el of document.querySelectorAll('[data-close-fly]'))el.onpointerdown=e=>{e.preventDefault();escapeBuilderFlyout=null;rerender();};
  on('builder-undo',act(()=>escapeBuilderStep(true)));on('builder-redo',act(()=>escapeBuilderStep(false)));on('builder-deselect',act(()=>{escapeBuilderPick=null;rerender();}));
  on('builder-details',()=>dialog('details'));on('builder-settings',()=>dialog('settings'));on('builder-keys',()=>dialog('keys'));on('builder-problems',()=>dialog('problems'));
  on('builder-quick',()=>dialog('quick'));on('builder-levels',()=>dialog('levels'));on('builder-share',()=>{dialog('share');const t=$('builder-text');if(t){t.select?.();try{navigator.clipboard?.writeText(t.value);}catch(_){}}});on('builder-import',()=>{dialog('import');$('builder-text')?.focus?.();});
  on('builder-import-go',()=>{const t=$('builder-text'),level=B.importText(t.value);if(!level){t.value='';t.placeholder='That text is not a Sally level. Paste the whole line that starts with SALLY';return;}escapeBuilderModel=level;escapeBuilderPick=null;escapeBuilderDialog=null;rerender();});
  for(const b of document.querySelectorAll('[data-ctx]'))b.onclick=()=>escapeBuilderContext(b.dataset.ctx);
  for(const b of document.querySelectorAll('[data-tool]'))b.onclick=()=>{escapeBuilderTool=b.dataset.tool;escapeBuilderFlyout=null;escapeBuilderNote='';escapeBuilderAnchor=null;if(!['patrol','link','select','turn'].includes(escapeBuilderTool))escapeBuilderPick=null;rerender();};
  for(const b of document.querySelectorAll('[data-color]'))b.onclick=()=>{escapeBuilderColor=Number(b.dataset.color);if(!['door','bridge'].includes(escapeBuilderTool))escapeBuilderTool='door';rerender();};
  const p=escapeBuilderPick,insp=name=>document.querySelector('[data-insp="'+name+'"]');
  if(insp('clear-patrol'))insp('clear-patrol').onclick=()=>{B.clearPatrol(m,escapeBuilderGuardIndex(p.id));rerender();};
  if(insp('sleep'))insp('sleep').onchange=e=>{B.setSleep(m,p.id,e.target.checked);rerender();};
  if(insp('mode'))insp('mode').onchange=e=>{B.setDoor(m,p.id,{mode:e.target.value});rerender();};
  if(insp('seconds'))insp('seconds').onchange=e=>{B.setDoor(m,p.id,{seconds:e.target.value});rerender();};
  if(insp('speed'))insp('speed').onchange=e=>{B.setHazard(m,p.id,{speed:e.target.value});rerender();};
  if(insp('offset'))insp('offset').onchange=e=>{B.setHazard(m,p.id,{offset:e.target.checked});rerender();};
  if(insp('hwarn'))insp('hwarn').onchange=e=>{B.setHazard(m,p.id,{warn:e.target.value===''?0:Number(e.target.value)});rerender();};
  if(insp('hsnow'))insp('hsnow').onchange=e=>{B.setHazard(m,p.id,{skin:e.target.checked?'snowball':''});rerender();};
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
  for(const el of document.querySelectorAll('[data-ginsp]'))el.onchange=e=>{const k=el.dataset.ginsp;B.setGuard(m,p.id,{[k]:k==='buried'?e.target.checked:k==='axis'||k==='tint'?e.target.value:val(e)});rerender();};
  const looks=document.querySelectorAll('[data-look]');for(const el of looks)el.onchange=()=>{B.setGuard(m,p.id,{looks:[...looks].filter(q=>q.checked).map(q=>Number(q.dataset.look)*Math.PI/2)});rerender();};
  for(const [k,f] of [['wdir','dir'],['wperiod','period'],['won','on'],['woffset','offset'],['wstrength','strength']])if(insp(k))insp(k).onchange=e=>{B.setWind(m,p.index,{[f]:Number(e.target.value)});rerender();};
  for(const [k,f] of [['rperiod','period'],['rphase','phase']])if(insp(k))insp(k).onchange=e=>{B.setRope(m,p.index,{[f]:Number(e.target.value)});rerender();};
  if(insp('capspring'))insp('capspring').onchange=e=>{B.setCap(m,p.index,{spring:Number(e.target.value)});rerender();};
  if(insp('csurface'))insp('csurface').onchange=e=>{B.setCurrent(m,p.index,{surface:e.target.value});rerender();};
  for(const [k,f] of [['cpulse','pulse'],['cphase','phase']])if(insp(k))insp(k).onchange=e=>{B.setCurrent(m,p.index,{[f]:e.target.value===''?0:Number(e.target.value)});rerender();};
  for(const [k,f] of [['cdir','dir'],['cspeed','speed']])if(insp(k))insp(k).onchange=e=>{B.setCurrent(m,p.index,{[f]:Number(e.target.value)});rerender();};
  for(const [k,f] of [['agroups','groups'],['asize','size'],['aspeed','speed']])if(insp(k))insp(k).onchange=e=>{B.setAnts(m,p.index,{[f]:Number(e.target.value)});rerender();};
  for(const [k,f] of [['stitle','title'],['sbody','body']])if(insp(k))insp(k).onchange=e=>{B.setSign(m,p.index,{[f]:e.target.value});};
  for(const [k,f] of [['ptitle','title'],['pauthor','author'],['pbody','body']])if(insp(k))insp(k).onchange=e=>{B.setPage(m,p.index,{[f]:e.target.value});};
  if(insp('anew'))insp('anew').onclick=()=>{escapeBuilderTool='ants';escapeBuilderAnchor='new';escapeBuilderNote='Click the first point of the new column.';rerender();};
  for(const el of document.querySelectorAll('[data-set]'))el.onchange=e=>{const k=el.dataset.set;B.setSettings(m,{[k]:el.type==='checkbox'?(k==='biome'?(e.target.checked?'desert':''):e.target.checked):el.tagName==='TEXTAREA'||k==='look'?e.target.value:Number(e.target.value)});rerender();};
  const skyDefault={hawk:{every:9,warn:2.2,first:12},storm:{every:9,warn:1.6,first:8},tide:{period:14,high:6,offset:0}};
  for(const el of document.querySelectorAll('[data-sky]'))el.onchange=e=>{B.setSettings(m,{[el.dataset.sky]:e.target.checked?skyDefault[el.dataset.sky]:null});rerender();};
  for(const el of document.querySelectorAll('[data-skyf]'))el.onchange=e=>{const [k,f]=el.dataset.skyf.split('.');B.setSettings(m,{[k]:{...m[k],[f]:Number(e.target.value)}});rerender();};
  const grid=$('builder-grid'),cellAt=e=>{const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.builder-cell');return el?[Number(el.dataset.x),Number(el.dataset.y)]:null;};
  grid.onpointerdown=e=>{if(e.button===2)return;e.preventDefault();const c=cellAt(e);if(!c)return;if(escapeBuilderStepPick(...c))return rerender();escapeBuilderStroke={pushed:false};escapeBuilderPainting=escapeBuilderDrags(escapeBuilderTool);escapeBuilderGrab=escapeBuilderTool==='select'?{from:c}:null;if(escapeBuilderApply(...c))rerender();};
  // With Select, dragging picks up what was clicked and carries it tile by tile; one drag is one undo.
  grid.onpointermove=e=>{const grab=escapeBuilderGrab;if(grab&&e.buttons){const c=cellAt(e);if(c&&!(c[0]===grab.from[0]&&c[1]===grab.from[1])&&B.moveThing(escapeBuilderModel,grab.from,c)){grab.from=c;grab.moved=true;escapeBuilderPick=escapeBuilderPickAt(...c);escapeBuilderNote='Moved to '+c.join(',')+'.';rerender();}return;}
    if(!escapeBuilderPainting||!e.buttons)return;const c=cellAt(e);if(c&&escapeBuilderModel.map[c[1]][c[0]]!==escapeBuilderTool&&escapeBuilderApply(...c))rerender();};
  grid.oncontextmenu=e=>{e.preventDefault();const c=cellAt(e);if(!c)return;escapeBuilderMenu={kind:'context',cell:c,left:Math.min(e.clientX,(window.innerWidth||1e4)-230),top:Math.min(e.clientY,(window.innerHeight||1e4)-380)};rerender();};
  document.onpointerup=()=>{escapeBuilderPainting=false;escapeBuilderStroke=null;escapeBuilderGrab=null;};
  on('builder-play',()=>{if(!B.validate(m).length)startEscape({custom:B.toRoute(m),from:'builder'});});
  on('builder-route',()=>escapeBuilderRunToggle());on('builder-run-recheck',()=>escapeBuilderRunTrace());on('builder-solve',()=>escapeBuilderSolve());
  if($('builder-run-pick'))$('builder-run-pick').onchange=e=>{escapeBuilderRun.pick=Number(e.target.value)||0;escapeBuilderRun.solved=null;escapeBuilderRunLoadSaved();escapeBuilderRunTrace();};
  on('builder-run-watch',()=>{const commands=escapeBuilderRunCommands();if(commands&&!B.validate(m).length)startEscape({custom:ws?escapeWorkshopRoute(ws.key,m):B.toRoute(m),from:'builder',skipIntro:true,autoplay:commands});});
  wireEscapeBuilderSteps(rerender);
  if(ws){
    on('workshop-save',act(()=>{const model=B.sanitize(m),ok=model&&EscapeEdits.save(ws.key,model,B.validate(model).length?null:escapeWorkshopRoute(ws.key,model));
      escapeBuilderNote=!ok?'Could not save the draft.':B.validate(model).length?'Draft saved. Fix the problems before it can be played in game.':'Draft saved'+(EscapeEdits.active()?'. Reload to play it from the map.':'.');rerender();}));
    on('workshop-export1',act(()=>{escapeBuilderDialog='share';rerender();const t=$('builder-text');if(t)escapeWorkshopExport([ws.key],t);}));
    on('workshop-revert',act(()=>{if(!confirm('Load the game’s version into the builder? Your saved draft stays until you save over it or discard it.'))return rerender();escapeBuilderModel=B.fromRoute(escapeGameLevel(ws.key));escapeBuilderPick=null;escapeBuilderNote='Loaded the game’s version.';rerender();}));
    on('workshop-discard',act(()=>{if(!confirm('Discard your saved draft?'))return rerender();EscapeEdits.remove(ws.key);escapeBuilderModel=B.fromRoute(escapeGameLevel(ws.key));escapeBuilderPick=null;escapeBuilderNote='Draft discarded; this is the game’s version.';rerender();}));
    return;
  }
  on('builder-save',act(()=>{const ok=B.saveOne(ESCAPE_BUILDER_STORE,m);escapeBuilderNote=ok?'Saved in this browser ✓':'Could not save.';rerender();}));
  on('builder-publish',act(async()=>{escapeBuilderNote='Publishing…';rerender();
    try{const r=await escapeBuilderApi('levels',{method:'POST',body:JSON.stringify({level:B.sanitize(m)})});const body=await r.json().catch(()=>({}));
      if(r.status===401){escapeAdminSignedIn=false;renderEscapeAdminLock({title:'Level builder',next:()=>openEscapeBuilder(),status:await escapeAdminStatus(),message:'Your admin session ended. Sign in again to publish; your level is kept.'});return;}
      escapeBuilderNote=r.ok?'Published to the community shelf ✓':(body.error||'Could not publish.');}
    catch(_){escapeBuilderNote='Could not reach the server.';}rerender();}));
  for(const input of document.querySelectorAll('[data-quick]'))input.onchange=e=>{const k=e.target.dataset.quick;escapeQuickOptions[k]=k==='difficulty'||k==='seed'?Number(e.target.value)||0:e.target.value;};
  on('quick-build',()=>{escapeBuilderDialog=null;escapeQuickBuild(false);});
  on('quick-reroll',()=>{escapeBuilderDialog=null;escapeQuickBuild(true);});
  on('builder-new',act(()=>{escapeBuilderModel=B.blank();escapeBuilderPick=null;escapeBuilderNote='A new level. Ctrl+Z brings the last one back.';rerender();}));
  on('builder-community',act(()=>openEscapeCommunity()));
  on('builder-admin',act(()=>openEscapeAdmin()));
  const saved=B.loadAll(ESCAPE_BUILDER_STORE),byId=id=>saved.find(l=>l.id===id);
  for(const b of document.querySelectorAll('[data-play]'))b.onclick=()=>{const l=byId(b.dataset.play);if(l&&!B.validate(l).length){escapeBuilderModel=l;escapeBuilderDialog=null;startEscape({custom:B.toRoute(l),from:'builder'});}};
  for(const b of document.querySelectorAll('[data-edit]'))b.onclick=()=>{const l=byId(b.dataset.edit);if(l){escapeBuilderModel=l;escapeBuilderPick=null;escapeBuilderDialog=null;rerender();}};
  for(const b of document.querySelectorAll('[data-delete]'))b.onclick=()=>{if(confirm('Delete this saved level?')){B.removeOne(ESCAPE_BUILDER_STORE,b.dataset.delete);rerender();}};
}
// What the right-click menu's items do.
function escapeBuilderContext(action){
  const m=escapeBuilderModel,B=EscapeBuilder,[x,y]=escapeBuilderMenu.cell,here=escapeBuilderPickAt(x,y);escapeBuilderMenu=null;escapeBuilderNote='';
  if(action==='select')escapeBuilderPick=here;
  else if(action==='turn')B.turnEnemy(m,x,y);
  else if(action==='patrol'){escapeBuilderPick=here;escapeBuilderTool='patrol';escapeBuilderNote='Click the tiles it should walk to, in order.';}
  else if(action==='link'){escapeBuilderPick=here;escapeBuilderTool='link';escapeBuilderNote='Now click the doors, bridges or enemies it should affect.';}
  else if(action==='remove'){if(B.removeAt(m,x,y)||B.removeExtraAt(m,x,y))escapeBuilderPick=null;}
  else if(action==='pick'){escapeBuilderTool=m.map[y][x];}
  else B.paint(m,x,y,{floor:'.',wall:'#',leaves:'L',sally:'@',key:'K',hatch:'X'}[action]);
  renderEscapeBuilder();
}
// Builder shortcuts. Typing in a field is left alone, apart from undo and save.
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('keydown',e=>{
  if(typeof gameState==='undefined'||gameState!=='builder'||!escapeBuilderModel||!document.getElementById('builder-grid'))return;
  const k=String(e.key||'').toLowerCase(),mod=e.ctrlKey||e.metaKey,typing=['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName);
  if(mod&&k==='z'&&!typing){e.preventDefault();escapeBuilderStep(!e.shiftKey);return;}
  if(mod&&k==='y'&&!typing){e.preventDefault();escapeBuilderStep(false);return;}
  if(mod&&k==='s'){e.preventDefault();document.getElementById(escapeBuilderWorkshop?'workshop-save':'builder-save')?.click()||(escapeBuilderWorkshop?null:(EscapeBuilder.saveOne(ESCAPE_BUILDER_STORE,escapeBuilderModel),escapeBuilderNote='Saved in this browser ✓',renderEscapeBuilder()));return;}
  if(k==='escape'){if(escapeBuilderMenu||escapeBuilderDialog||escapeBuilderFlyout){escapeBuilderMenu=null;escapeBuilderDialog=null;escapeBuilderFlyout=null;}else{escapeBuilderPick=null;escapeBuilderAnchor=null;}renderEscapeBuilder();return;}
  if(typing||mod||escapeBuilderDialog)return;
  const tools={v:'select',l:'link',p:'patrol',t:'turn',x:'remove',w:'#',f:'.'};
  if(tools[k]){escapeBuilderTool=tools[k];escapeBuilderAnchor=null;if(!['patrol','link','select','turn'].includes(escapeBuilderTool))escapeBuilderPick=null;renderEscapeBuilder();return;}
  const tab=ESCAPE_BUILDER_TABS[Number(k)-1];if(tab){escapeBuilderFlyout=escapeBuilderFlyout===tab[0]?null:tab[0];renderEscapeBuilder();}
});

// The community shelf: every published level, open to every player. A signed-in admin can also
// copy a level into the builder or take it down.
const ESCAPE_COMMUNITY_BEST='sally-escape-community-best';
function escapeCommunityBest(){try{return JSON.parse(ESCAPE_BUILDER_STORE?.getItem(ESCAPE_COMMUNITY_BEST)||'{}')||{};}catch(_){return {};}}
function escapeCommunityRecord(id,seconds){const best=escapeCommunityBest();if(!(best[id]<=seconds))best[id]=+seconds.toFixed(1);try{ESCAPE_BUILDER_STORE?.setItem(ESCAPE_COMMUNITY_BEST,JSON.stringify(best));}catch(_){}}
async function openEscapeCommunity(){
  const panel=escapeBuilderShow();panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Main menu</button><h2>Community levels</h2></div><p>Loading…</p>';
  document.getElementById('builder-back').onclick=closeEscapeBuilder;
  let levels=null;try{const r=await fetch('/api/levels');if(r.ok)levels=(await r.json()).levels;}catch(_){}
  await escapeAdminStatus();const maker=escapeAdminSignedIn,best=escapeCommunityBest(),B=EscapeBuilder;
  const clean=Array.isArray(levels)?levels.map(l=>({...B.sanitize(l),publishedAt:l.publishedAt})).filter(l=>l.id&&!B.validate(l).length):null;
  panel.innerHTML='<div class="builder-head"><button id="builder-back" class="escape-secondary">← Main menu</button><h2>Community levels</h2>'+(maker?'<button id="community-builder" class="escape-secondary">Level builder</button>':'')+'</div>'+
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

