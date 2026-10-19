// Controllers: any pad the browser reads with the standard layout (Xbox, PlayStation, Switch Pro,
// Steam Deck). The left stick or d-pad moves Sally, the triggers sprint and crawl, the face and
// shoulder buttons are her tools, Start pauses and View/Select opens the map. Wherever a menu or
// card is showing, the stick or d-pad moves between its buttons, A presses and B goes back.
// The pad is polled once a frame from draw(); nothing here runs unless a pad is connected.
const ESCAPE_PAD={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,VIEW:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15};
// In an escape: which button does what. Held tools (pebble, glow, spores) charge while held and
// throw on release, aimed with the stick, just like holding Q.
const ESCAPE_PAD_ACTIONS={A:'look',B:'burrow',X:'pebble',Y:'tongue',LB:'glow',RB:'spore',L3:'camo',R3:'seed'};
// The labels shown on the tool buttons while a pad is in use, in place of the keyboard keys.
const ESCAPE_PAD_LABELS={Space:'A',E:'B',Q:'X',R:'Y',L:'LB',Z:'RB',X:'L3',F:'R3'};
const ESCAPE_PAD_DEAD=.22;
const escapePad={exitAt:0,holdY:null,index:null,active:false,x:0,y:0,sprint:false,crawl:false,prev:[],nav:{dir:null,at:0,repeat:false}};
const escapePadActive=()=>escapePad.active;
function escapePadLabel(key){return escapePad.active?ESCAPE_PAD_LABELS[key]||key:key;}

function pollEscapePad(){
  const pads=typeof navigator!=='undefined'&&navigator.getGamepads?[...navigator.getGamepads()]:[];
  const pad=pads.find(p=>p?.connected&&p.mapping==='standard')||pads.find(p=>p?.connected);
  if(!pad){if(escapePad.index!==null)escapePadForget();return;}
  escapePad.index=pad.index;
  const now=pad.buttons.map(b=>Boolean(b?.pressed||(b?.value||0)>.5)),was=escapePad.prev;escapePad.prev=now;
  const down=i=>now[i],pressed=i=>now[i]&&!was[i],released=i=>!now[i]&&was[i];
  // Left stick with a round dead zone, so a resting stick never drifts; then the d-pad on top.
  let ax=pad.axes[0]||0,ay=pad.axes[1]||0;const m=Math.hypot(ax,ay);
  if(m<ESCAPE_PAD_DEAD){ax=0;ay=0;}else{const k=Math.min(1,(m-ESCAPE_PAD_DEAD)/(1-ESCAPE_PAD_DEAD))/m;ax*=k;ay*=k;}
  ax+=Number(down(ESCAPE_PAD.RIGHT))-Number(down(ESCAPE_PAD.LEFT));ay+=Number(down(ESCAPE_PAD.DOWN))-Number(down(ESCAPE_PAD.UP));
  const any=now.some(Boolean)||ax||ay;
  if(any&&!escapePad.active){escapePad.active=true;document.body?.classList?.add('pad-nav');if(typeof unlockAudio==='function')unlockAudio();if(typeof renderEscapeHUD==='function'&&escapeGame)renderEscapeHUD(true);}
  // A pad press does not unlock sound everywhere, so each new press tries again until it plays.
  if(now.some((b,i)=>b&&!was[i])&&typeof unlockAudio==='function'&&typeof escapeAudio!=='undefined'&&escapeAudio?.state!=='running')unlockAudio();
  const menu=escapePadMenu();
  if(menu){escapePad.x=0;escapePad.y=0;escapePad.sprint=false;escapePad.crawl=false;escapePad.dig=false;escapePad.peekX=0;escapePad.peekY=0;if(escapePad.active)escapePadNavigate(menu,ax,ay,pressed,was.length>0);return;}
  escapePad.nav.dir=null;
  escapePad.x=Math.max(-1,Math.min(1,ax));escapePad.y=Math.max(-1,Math.min(1,ay));escapePad.sprint=down(ESCAPE_PAD.RT);escapePad.crawl=down(ESCAPE_PAD.LT);escapePad.dig=down(ESCAPE_PAD.B);
  if(!was.length)return;
  if(pressed(ESCAPE_PAD.START)){if(gameState==='escape')togglePause();else document.getElementById('menu-button')?.click();return;}
  if(gameState==='escapeSelect'){
    if(pressed(ESCAPE_PAD.A))escapeKeyPressed('enter',13);
    if(pressed(ESCAPE_PAD.B)&&typeof escapeGoBack==='function'){escapeGoBack();return;}
    // Y: a tap grabs a golden fly; held, it opens the panel (travel, Journal, Main menu) for the stick.
    if(pressed(ESCAPE_PAD.Y))escapePad.holdY=millis();
    if(escapePad.holdY!==null&&down(ESCAPE_PAD.Y)&&millis()-escapePad.holdY>450){escapePad.holdY=null;if(typeof openEscapeWorldPanel==='function')openEscapeWorldPanel();return;}
    if(released(ESCAPE_PAD.Y)&&escapePad.holdY!==null){escapePad.holdY=null;escapeKeyPressed('t',84);}
    // X tries the challenge at this entrance, when it is open. LB and RB step between open areas.
    if(pressed(ESCAPE_PAD.X)){const b=document.getElementById('world-challenge');if(b&&b.style.display!=='none'&&b.onclick)b.onclick();}
    if((pressed(ESCAPE_PAD.LB)||pressed(ESCAPE_PAD.RB))&&escapeWorld){const n=escapeWorld.chapters.length,dir=pressed(ESCAPE_PAD.RB)?1:-1;let i=escapeWorld.chapterAt();for(let k=0;k<n;k++){i=(i+dir+n)%n;if(escapeWorld.regionOpen(i))break;}if(escapeWorld.travel(i)){renderEscapeWorldHUD();escapeSound?.('hop');}}
    return;
  }
  if(gameState!=='escape')return;
  // View opens the map on a level that has one; elsewhere it steps the zoom (closer, then back out).
  if(pressed(ESCAPE_PAD.VIEW)){if(escapeGame?.level.explore)escapeKeyPressed('g',71);else if(typeof escapeZoomCycle==='function')escapeZoomCycle();return;}
  // The right stick looks around: push it to peek ahead in that direction; let go and the view
  // springs back to Sally.
  {let rx=pad.axes[2]||0,ry=pad.axes[3]||0;const m=Math.hypot(rx,ry);if(m<ESCAPE_PAD_DEAD){rx=0;ry=0;}else{const k=Math.min(1,(m-ESCAPE_PAD_DEAD)/(1-ESCAPE_PAD_DEAD))/m;rx*=k;ry*=k;}escapePad.peekX=rx;escapePad.peekY=ry;}
  // A start card or a big moment: any button moves on, as any key does.
  if(escapeIntroOpen||escapeMoment){if(now.some((b,i)=>b&&!was[i]))escapeKeyPressed(' ',32);return;}
  for(const [name,action] of Object.entries(ESCAPE_PAD_ACTIONS)){const i=ESCAPE_PAD[name];
    if(['pebble','glow','spore'].includes(action)){if(pressed(i))startEscapeCharge(action,'pad');else if(released(i)&&escapeCharge?.source==='pad'&&escapeCharge.kind===action)releaseEscapeCharge(action);continue;}
    if(!pressed(i))continue;
    ({look:useEscapeLook,burrow:useEscapeBurrow,tongue:useEscapeTongue,camo:useEscapeCamo,seed:useEscapeSeed})[action]?.();
  }
}
function escapePadForget(){escapePad.index=null;escapePad.active=false;escapePad.x=0;escapePad.y=0;escapePad.sprint=false;escapePad.crawl=false;escapePad.prev=[];document.body?.classList?.remove('pad-nav');if(escapeCharge?.source==='pad')releaseEscapeCharge();}

// The menu or card on top, if any: its buttons are what the pad moves between.
function escapePadMenu(){
  if(typeof document==='undefined')return null;const $=id=>document.getElementById(id),shown=el=>el&&el.style.display!=='none'&&el.getClientRects?.().length>0;
  for(const el of document.querySelectorAll('.game-dialog'))if(el.style.display==='flex')return el;
  for(const id of ['story-card','world-bestiary'])if(shown($(id)))return $(id);
  if(typeof escapeMapOpen!=='undefined'&&escapeMapOpen)return $('escape-map');
  if($('game-toolbar')?.classList.contains?.('toolbar-open'))return $('game-toolbar');
  if(gameState==='escapeResult')return $('escape-result');
  if(gameState==='escapeSelect'&&escapeLibraryOpen)return $('escape-select');
  if(gameState==='start')return $('start-menu-container');
  if(gameState==='kids')return $('escape-builder');
  if(gameState==='escapeSelect'&&!escapeLibraryOpen&&typeof escapeWorldPanelOpen!=='undefined'&&escapeWorldPanelOpen)return $('escape-world-ui');
  return null;
}
function escapePadFocusables(root){
  return [...root.querySelectorAll('button, [href], input, select, textarea, [tabindex]')].filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden');
}
// The stick or d-pad steps to the nearest button that way (a slider takes left and right itself);
// held, it repeats. A presses the button in focus; B goes back, as Escape does.
function escapePadNavigate(menu,ax,ay,pressed,ready){
  const items=escapePadFocusables(menu),active=document.activeElement;
  if(!items.includes(active)&&items.length){items[0].focus();escapePad.nav.dir=null;}
  if(!ready)return;
  const dir=Math.abs(ax)>.55||Math.abs(ay)>.55?(Math.abs(ax)>Math.abs(ay)?(ax>0?'right':'left'):(ay>0?'down':'up')):null,t=millis(),nav=escapePad.nav;
  if(dir&&(dir!==nav.dir||t-nav.at>(nav.repeat?140:380))){nav.repeat=dir===nav.dir;nav.dir=dir;nav.at=t;escapePadStep(items,document.activeElement,dir);}
  else if(!dir)nav.dir=null;
  const el=document.activeElement;
  if(pressed(ESCAPE_PAD.A)&&items.includes(el)){if(el.tagName==='INPUT'&&el.type!=='range'&&el.type!=='button')el.focus();else el.click();}
  if(pressed(ESCAPE_PAD.B)||pressed(ESCAPE_PAD.START)&&menu.id==='game-toolbar')escapePadBack(menu);
}
function escapePadStep(items,from,dir){
  // A drop-down (the world map's area travel) changes its choice with left and right.
  if(from?.tagName==='SELECT'&&(dir==='left'||dir==='right')){const opts=[...from.options];let i=from.selectedIndex;do{i+=dir==='right'?1:-1;}while(opts[i]?.disabled);if(opts[i]){from.selectedIndex=i;from.dispatchEvent(new Event('change',{bubbles:true}));}return;}
  if(from?.type==='range'&&(dir==='left'||dir==='right')){const step=Number(from.step)||1;from.value=String(Number(from.value)+(dir==='right'?step:-step));from.dispatchEvent(new Event('input',{bubbles:true}));return;}
  if(!from||!items.includes(from)){items[0]?.focus();return;}
  const r=from.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,v={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[dir];
  let best=null,bestScore=Infinity;
  for(const el of items){if(el===from)continue;const q=el.getBoundingClientRect(),dx=q.left+q.width/2-cx,dy=q.top+q.height/2-cy,along=dx*v[0]+dy*v[1];
    if(along<=2)continue;const across=Math.abs(dx*v[1]-dy*v[0]),score=along+across*2.2;if(score<bestScore){bestScore=score;best=el;}}
  // Nothing that way: wrap round in reading order, so every button can be reached.
  if(!best){const i=items.indexOf(from),n=items.length;best=items[(i+(dir==='down'||dir==='right'?1:-1)+n)%n];}
  best?.focus();best?.scrollIntoView?.({block:'nearest'});
}
// B goes back one step, exactly as Escape does (escapeGoBack in game.js); story and bestiary pages
// read their own Escape.
function escapePadBack(menu){
  if(menu.id==='story-card'||menu.id==='world-bestiary'){(document.activeElement||document).dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return;}
  if(typeof escapeGoBack!=='function')return;
  // At the main menu in the Android app, B twice quits.
  if(escapeGoBack()==='exit'&&typeof escapeInApp!=='undefined'&&escapeInApp){
    if(Date.now()-escapePad.exitAt<2500){location.href='/app-exit';return;}
    escapePad.exitAt=Date.now();escapeTitleToast('Press B again to quit');
  }
}
// A rumble for the moments worth feeling, where the pad can.
const ESCAPE_PAD_RUMBLE={caught:[.9,.8,320],tailDrop:[.7,.6,220],spotted:[.15,.45,120],key:[.25,.25,80],won:[.4,.6,260]};
function escapePadRumble(events){
  if(!escapePad.active||escapePad.index===null)return;const hit=Object.keys(ESCAPE_PAD_RUMBLE).find(e=>events.includes(e));if(!hit)return;
  const pad=navigator.getGamepads?.()[escapePad.index],[strong,weak,duration]=ESCAPE_PAD_RUMBLE[hit];
  try{pad?.vibrationActuator?.playEffect?.('dual-rumble',{duration,strongMagnitude:strong,weakMagnitude:weak}).catch?.(()=>{});}catch(_){}
}
if(typeof window!=='undefined')window.addEventListener('gamepaddisconnected',e=>{if(e.gamepad?.index===escapePad.index)escapePadForget();});
