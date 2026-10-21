const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

class Vector {
  constructor(x=0,y=0) {this.x=x;this.y=y}
  copy(){return new Vector(this.x,this.y)}
  set(x,y){if(typeof x==='object'){this.x=x.x;this.y=x.y}else{this.x=x;this.y=y}return this}
  add(v){this.x+=v.x;this.y+=v.y;return this}
  sub(v){this.x-=v.x;this.y-=v.y;return this}
  mult(n){this.x*=n;this.y*=n;return this}
  mag(){return Math.hypot(this.x,this.y)}
  normalize(){const n=this.mag();return n ? this.mult(1/n):this}
  setMag(n){return this.normalize().mult(n)}
  limit(n){return this.mag()>n?this.setMag(n):this}
  heading(){return Math.atan2(this.y,this.x)}
  dist(v){return Math.hypot(this.x-v.x,this.y-v.y)}
  static add(a,b){return a.copy().add(b)}
  static sub(a,b){return a.copy().sub(b)}
  static mult(a,b){return a.copy().mult(b)}
  static dist(a,b){return a.dist(b)}
  static lerp(a,b,t){return new Vector(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)}
  static fromAngle(a){return new Vector(Math.cos(a),Math.sin(a))}
  static random2D(){return Vector.fromAngle(0.3)}
}
function harness() {
  let now=0,seed=12345;
  const events={},storage=new Map();
  const elements={};
  const element=id=>elements[id] ||= {id,style:{},value:'Tester',disabled:false,innerHTML:'',textContent:'',getContext(){return {...dc,createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}};},classList:{add(){},remove(){},toggle(){},contains(){return false;}},setAttribute(){},focus(){},appendChild(){},insertBefore(){},addEventListener(type,fn){this['on'+type]=fn}};
  const noop=()=>{};
  const sound=()=>({playing:false,loops:0,plays:0,volume:0,volumeChanges:0,stop(){this.playing=false},loop(){this.playing=true;this.loops++},play(){this.playing=true;this.plays++},isPlaying(){return this.playing},setVolume(value){this.volume=value;this.volumeChanges++},getVolume(){return this.volume}});
  const dc={createLinearGradient:()=>({addColorStop:noop}),fillRect:noop,save:noop,restore:noop,beginPath:noop,rect:noop,clip:noop,moveTo:noop,lineTo:noop,ellipse:noop,stroke:noop,fill:noop,globalAlpha:1};
  const c={console:{log:noop,warn:noop,error:noop},URLSearchParams,Promise,AbortSignal,crypto:{randomUUID:()=> "12345678-1234-4123-8123-123456789abc"},
    localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
    navigator:{userAgent:'test'},window:{addEventListener:(name,handler)=>{events['window:'+name]=handler}},document:{hidden:false,addEventListener:(name,handler)=>{events['document:'+name]=handler},getElementById:element,createElement:()=>element(Math.random()),querySelectorAll:()=>[]},
    millis:()=>now,deltaTime:1000/60,frameCount:1,frameRate:()=>60,width:800,height:600,
    windowWidth:800,windowHeight:600,PI:Math.PI,TWO_PI:Math.PI*2,HALF_PI:Math.PI/2,
    floor:Math.floor,ceil:Math.ceil,abs:Math.abs,sqrt:Math.sqrt,min:Math.min,max:Math.max,
    sin:Math.sin,cos:Math.cos,atan2:Math.atan2,dist:(x,y,a,b)=>Math.hypot(x-a,y-b),
    constrain:(x,a,b)=>Math.max(a,Math.min(b,x)),lerp:(a,b,t)=>a+(b-a)*t,
    map:(v,a,b,x,y)=>x+(v-a)*(y-x)/(b-a),nf:(x,_,digits)=>Number(x).toFixed(digits),
    createVector:(x,y)=>new Vector(x,y),p5:{Vector},drawingContext:dc,
    color:(...values)=>({values,setAlpha:noop}),red:()=>0,green:()=>255,blue:()=>255,hue:()=>120,saturation:()=>100,brightness:()=>100,lerpColor:a=>a,
    loadSound:sound,loadImage:()=>({}),getAudioContext:()=>({state:'running',resume:noop}),
    createCanvas:()=>({parent:noop}),pixelDensity:()=>1,displayDensity:()=>1,
    random:(a,b)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=seed/4294967296;return Array.isArray(a)?a[Math.floor(n*a.length)]:a===undefined?n:b===undefined?n*a:a+n*(b-a)},
    keyIsDown:()=>false,fetch:async()=>({ok:true,json:async()=>[]})};
  for(const n of ['push','pop','background','fill','noFill','stroke','noStroke','strokeWeight','rect','triangle','ellipse','line','bezier','beginShape','endShape','curveVertex','vertex','translate','scale','image','imageMode','text','textSize','textFont','textAlign','textStyle','colorMode','arc','setShakeThreshold','resizeCanvas','rotate','blendMode','strokeCap','quad','point','circle','square','curve','ellipseMode','rectMode','strokeJoin','erase','noErase','tint','noTint','shearX','shearY']) c[n]=noop;c.textWidth=s=>String(s).length*6;c.ROUND='round';c.BOLD='bold';c.NORMAL='normal';
  for(const n of ['CORNER','CENTER','LEFT','RIGHT','TOP','BOTTOM','CLOSE','RGB','HSB','PIE','CHORD','OPEN','ADD','BLEND','MULTIPLY','SCREEN']) c[n]=n;
  c.UP_ARROW=38;c.DOWN_ARROW=40;c.LEFT_ARROW=37;c.RIGHT_ARROW=39;
  c.bezierVertex=noop;
  c.createGraphics=()=>({...c,clear:noop,remove:noop});
  const context=vm.createContext(c);
  const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
  for(const [,name] of html.matchAll(/<script src="([^"]+)"/g)){
    if(name.startsWith('https:') || name.startsWith('vendor/'))continue;
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../public',name),'utf8'),context,{filename:name});
  }
  const run=code=>vm.runInContext(code,context);
  run('setup();');
  return {c:context,run,el:element,events,storage,setTime:value=>now=value,tick:fps=>{c.deltaTime=1000/fps;now+=c.deltaTime;c.frameCount++}};
}

test('Little Explorers groups all 26 levels, preserves old stickers and remembers the guide choice per player',()=>{
 const h=harness(),panel=h.el('escape-builder');panel.querySelectorAll=()=>[];panel.querySelector=()=>({focus(){}});
 h.run('escapeKidsMark("hello-sally");openLittleExplorers();');
 assert.equal((panel.innerHTML.match(/class="kids-stone(?: |")/g)||[]).length,26);
 assert.match(panel.innerHTML,/Little discoveries/);assert.match(panel.innerHTML,/Bigger adventures/);assert.match(panel.innerHTML,/Stickers: 1 of 26/);
 h.el('kids-guide-toggle').onclick();assert.equal(h.run('escapeKidsGuideOn()'),false);assert.equal(h.el('kids-guide-toggle').textContent,'Guiding dots: Off');
 h.run('globalThis.otherPlayer=EscapePlayers.create("Explorer Two");');
 assert.equal(h.run('EscapePlayers.storage(otherPlayer.id).getItem("sallys-escape-kids-guide")'),null);
 assert.equal(h.run('escapeKidsDone().includes("hello-sally")'),true);
});

test('the twentieth sticker leads into the adventures; the final one returns to the sticker collection',()=>{
 const h=harness();
 h.run('startEscape({kidsId:"great-explorer",skipIntro:true});escapeGame.finish("won","home");showEscapeResult();');
 assert.match(h.el('escape-next-btn').textContent,/Next adventure/);h.el('escape-next-btn').onclick();assert.equal(h.run('escapeGame.level.id'),'garden-gate');
 h.run('startEscape({kidsId:"sallys-way-home",skipIntro:true});escapeGame.finish("won","home");showEscapeResult();');
 assert.equal(h.el('escape-next-btn').textContent,'See your stickers');assert.equal(h.el('escape-menu-btn').textContent,'Little Explorers');
 assert.equal(h.run('escapeKidsDone().includes("sallys-way-home")'),true);assert.equal(h.run('Object.keys(escapeProgress.data.levels).length'),0);
});

test('every kids adventure renders on desktop and touch, and supplied tools show endless supplies',()=>{
 const h=harness();for(const id of h.run('EscapeCatalog.kids.filter(l=>l.adventure).map(l=>l.id)')){
   h.run('startEscape({kidsId:'+JSON.stringify(id)+',skipIntro:true});draw();mobile=true;windowWidth=944;windowHeight=524;updateToolbar();draw();');
   assert.equal(h.run('gameState'),'escape');assert.equal(h.el('touch-controls').style.display,'flex');assert.equal(h.run('escapeGame.level.unlimited'),true);
 }
});

test('an optional trail note waits for A/Enter, opens a card, freezes the real engine, and resumes',()=>{
 const h=harness();h.run('globalThis.readSign=null;globalThis.signDone=null;showEscapeStory=(entry,fresh,done)=>{readSign=entry;escapeStoryOpen=entry;signDone=()=>{escapeStoryOpen=null;done();};};startEscape({kidsId:"beetle-courtyard",skipIntro:true});escapeGame.player.x=11.5;escapeGame.player.y=13.5;tickEscapeKidsSign(escapeGame);');
 assert.equal(h.run('readSign'),null,'touching a sign no longer pops it up');assert.equal(h.run('escapeNearSign.title'),'Watch the horn');
 h.run('useEscapeLook()');assert.equal(h.run('readSign.card.title'),'Watch the horn','A (look) reads the sign Sally stands by');assert.match(h.run('readSign.card.body[0]'),/Step sideways/);
 const t=h.run('escapeGame.elapsed');h.run('draw();draw();');assert.equal(h.run('escapeGame.elapsed'),t,'creatures and timers wait while reading');
 h.run('signDone();readSign=null;draw();draw();tickEscapeKidsSign(escapeGame);');assert.equal(h.run('readSign'),null,'closing the card does not reopen it');
 assert.ok(h.run('escapeGame.elapsed')>t);h.run('escapeKeyPressed("enter",13)');assert.equal(h.run('readSign.card.title'),'Watch the horn','Enter rereads it');
 h.run('signDone();readSign=null;escapeGame.player.x=6.5;tickEscapeKidsSign(escapeGame)');assert.equal(h.run('escapeNearSign'),null,'walking away clears the prompt');
});
test('the standalone world enters the real engine and renders the result in its existing playfield',()=>{const h=harness();h.run('showEscapeSelect();startEscape({levelId:"quiet-vault"});draw();escapeGame.elapsed=20;escapeGame.hasKey=true;escapeGame.finish("won","escaped");draw();escapeMoment.hold=0;draw();');assert.equal(h.run('gameState'),'escapeResult');assert.equal(h.el('game-container').style.display,'block');assert.equal(h.el('escape-result').style.display,'block');assert.equal(h.el('escape-menu-btn').textContent,'World map');assert.equal(h.run('escapeProgress.unlocked("crumbling-hall")'),true);});
test('Sally celebrates the finished run, keeps retry available, and resets her expression on retry',()=>{
 const h=harness();h.run('startEscape({levelId:"quiet-vault",skipIntro:true});escapeGame.elapsed=20;escapeGame.treasure=8;escapeGame.finish("won","escaped");draw();escapeMoment.hold=0;draw();');
 assert.match(h.el('escape-character-celebration').innerHTML,/sally-proud/);assert.equal(h.el('escape-character-celebration').style.display,'');
 h.el('escape-retry-btn').onclick();assert.equal(h.run('gameState'),'escape');assert.equal(h.run('escapeCharacter.face.mood'),'calm');
 h.run('escapeGame.elapsed=2;escapeGame.finish("caught","caught");draw();escapeMoment.hold=0;draw();');assert.equal(h.el('escape-character-celebration').style.display,'none');
 assert.equal(h.el('escape-character-celebration').innerHTML,'');
});
test('arcade resources follow real pebble use, cooldown, depletion and retry on desktop and touch',()=>{
 const h=harness();h.run('escapeProgress.unlocked=()=>true;startEscape({levelId:"fern-cloister",skipIntro:true});escapeGame.player.facing={x:1,y:0};');
 const desktop=h.el('escape-decoy-action'),touch=h.el('touch-camo'),total=h.run('escapeGame.decoys');
 assert.match(desktop.innerHTML,/<svg/);assert.match(desktop.innerHTML,/<kbd>Q<\/kbd>/);
 desktop.onclick();h.run('updateToolbar();');
 assert.equal(h.run('escapeGame.decoys'),total-1);assert.equal(desktop.disabled,true);assert.equal(touch.disabled,true);
 assert.equal((desktop.innerHTML.match(/class="spent"/g)||[]).length,1);assert.match(touch.innerHTML,/<svg/);
 h.run('escapeGame.elapsed=escapeGame.decoyReadyAt+1;renderEscapeHUD(true);updateToolbar();');assert.equal(desktop.disabled,false);
 h.run('escapeGame.decoys=0;renderEscapeHUD(true);updateToolbar();');assert.equal(desktop.disabled,true);assert.equal(desktop.style.display,'');assert.equal(touch.disabled,true);
 assert.equal((desktop.innerHTML.match(/class="spent"/g)||[]).length,total);
 h.run('startEscape({levelId:"fern-cloister",skipIntro:true});');assert.equal(desktop.disabled,false);assert.doesNotMatch(desktop.innerHTML,/class="spent"/);
});
test('tail heart tracks loss and regrowth, unavailable abilities hide, and pausing locks the kit',()=>{
 const h=harness();h.run('escapeProgress.unlocked=()=>true;startEscape({levelId:"fern-cloister",skipIntro:true});');
 const tail=h.el('escape-tail');assert.match(tail.innerHTML,/Spare tail/);assert.match(tail.innerHTML,/escape-tail-heart/);
 h.run('escapeGame.hasTail=false;renderEscapeHUD(true);');assert.match(tail.innerHTML,/Tail lost/);
 h.run('escapeGame.hasTail=true;renderEscapeHUD(true);');assert.match(tail.innerHTML,/Spare tail/);
 assert.equal(h.el('escape-seed-action').style.display,'none');assert.equal(h.el('escape-look-action').style.display,'');
 h.run('togglePause();');assert.equal(h.el('escape-look-action').disabled,true);h.run('togglePause();');assert.equal(h.el('escape-look-action').disabled,false);
});
test('the stick clamps diagonal input, rejects a second pointer and releases independently of held sprint',()=>{const h=harness();h.el('movement-stick').getBoundingClientRect=()=>({left:0,top:0,width:100,height:100});h.run('showEscapeSelect();');const stick=h.el('movement-stick'),e={pointerId:3,clientX:100,clientY:100,preventDefault(){}};stick.onpointerdown(e);assert.ok(h.run('Math.abs(Math.hypot(touchStick.x,touchStick.y)-1)<1e-8'));const before=h.run('touchStick.x');stick.onpointerdown({...e,pointerId:4,clientX:0});assert.equal(h.run('touchStick.x'),before);h.run('touchInput.sprint=true;');stick.onpointerup(e);assert.equal(h.run('touchStick.x'),0);assert.equal(h.run('touchInput.sprint'),true);assert.equal(h.run('touchStick.pointer'),null);});
test('portrait rotation pauses simulation and clears the stick, and landscape preserves the pause until resumed',()=>{const h=harness();h.run('startEscape({levelId:"quiet-vault",skipIntro:true});mobile=true;windowWidth=390;windowHeight=844;touchStick.x=1;');const t=h.run('escapeGame.elapsed');h.run('draw();');assert.equal(h.run('paused'),true);assert.equal(h.run('touchStick.x'),0);assert.equal(h.run('escapeGame.elapsed'),t);h.run('windowWidth=844;windowHeight=390;draw();');assert.equal(h.run('paused'),true);h.run('togglePause();draw();draw();');assert.ok(h.run('escapeGame.elapsed')>t);});
test('the intro card holds the hunters until a key or movement, and a retry skips it',()=>{const h=harness();h.run('escapeProgress.unlocked=()=>true;startEscape({levelId:"fern-cloister"});');assert.equal(h.run('escapeIntroOpen'),true);assert.equal(h.el('escape-intro').style.display,'block');assert.match(h.el('escape-intro').innerHTML,/Fern Cloister/);assert.match(h.el('escape-intro').innerHTML,/spare tail/);
  h.run('draw();draw();');assert.equal(h.run('escapeGame.elapsed'),0);h.run('key="e";keyCode=69;keyPressed({});');assert.equal(h.run('escapeIntroOpen'),false);assert.equal(h.run('escapeGame.burrows'),h.run('escapeGame.level.burrows'),'the dismissing key does not spend a tool');h.run('draw();draw();');assert.ok(h.run('escapeGame.elapsed')>0);
  h.run('escapeGame.finish("caught","bitten");draw();escapeMoment.hold=0;draw();key="r";keyCode=82;keyPressed({});');assert.equal(h.run('escapeIntroOpen'),false);assert.equal(h.run('gameState'),'escape');
  h.run('startEscape({levelId:"fern-cloister"});touchStick.x=1;draw();');assert.equal(h.run('escapeIntroOpen'),false,'moving dismisses the card');});
test('brief cards fold the hint away except where an area teaches something; Full shows it, Off skips the card',()=>{const h=harness();h.run('escapeProgress.unlocked=()=>true;startEscape({levelId:"chimney-run"});');
  assert.match(h.el('escape-intro').innerHTML,/escape-intro-hidden/);assert.equal(h.run('escapeGame.message'),'','the in-game tip waits too');h.run('key="h";keyCode=72;keyPressed({});');assert.equal(h.run('escapeIntroOpen'),true,'H reveals rather than starting');assert.equal(h.run('escapeGame.message'),h.run('escapeGame.level.hint'));
  h.run('startEscape({levelId:"sunbaked-ledge"});');assert.doesNotMatch(h.el('escape-intro').innerHTML,/escape-intro-hidden/,'the first route of an area shows its hint');
  h.run('introMode="full";startEscape({levelId:"chimney-run"});');assert.match(h.el('escape-intro').innerHTML,/drop her tail/);assert.doesNotMatch(h.el('escape-intro').innerHTML,/escape-intro-hidden/);
  h.run('introMode="off";startEscape({levelId:"chimney-run"});');assert.equal(h.run('escapeIntroOpen'),false);});
test('leaving a route part-way uses up its first try, and a first-attempt escape shows the bonus',()=>{const h=harness();h.run('startEscape({levelId:"quiet-vault",skipIntro:true});escapeGame.elapsed=5;showEscapeSelect();');assert.equal(h.run('escapeProgress.data.attempts["quiet-vault"]'),1);
  h.run('startEscape({levelId:"leafy-crossroads",skipIntro:true});draw();escapeGame.elapsed=20;escapeGame.hasKey=true;escapeGame.finish("won","escaped");draw();escapeMoment.hold=0;draw();');assert.match(h.el('escape-result-title').textContent,/First try/);assert.match(h.el('escape-result-medals').textContent,/First try bonus/);});
test('a shared level cannot put markup on the intro card: its name, brief and hint show as text',()=>{
 const h=harness();h.run('introMode="full";const m=EscapeBuilder.blank();m.name="<h1>AUDIT</h1>";m.brief="<form action=x><button>Go</button></form>";startEscape({custom:EscapeBuilder.toRoute(m),from:"builder"});hideEscapeIntro();for(let i=0;i<30;i++)draw();');assert.equal(h.run('escapeGame.status'),'playing','a level with no enemies plays');
 const card=h.el('escape-intro').innerHTML;assert.doesNotMatch(card,/<h1>|<form/);assert.match(card,/&lt;h1&gt;AUDIT&lt;\/h1&gt;/);assert.match(card,/&lt;form action=x&gt;/);
});
test('walking the world map before any escape has run never touches a missing escape',()=>{
  const h=harness();h.run('showEscapeSelect();escapeGame=null;gameState="escapeSelect";const p={x:1,y:1,moving:true,sprinting:true,crawling:false,swimming:false};escapeFootsteps(p);p.x=3;escapeFootsteps(p);p.x=5;escapeFootsteps(p);');
  assert.equal(h.run('escapeFx.items.length'),0,'no step particles on the map');
});
test('a held throw swings out to full reach, rests, then eases back in, so a late release still has a choice',()=>{
  const h=harness();const at=s=>h.run('escapeCharge={kind:"pebble",source:"key",start:millis()-'+s*1000+'};escapeChargePower()');
  assert.equal(at(0),0);assert.ok(Math.abs(at(.375)-.5)<1e-9,'halfway out');assert.equal(at(.8),1,'rests at full reach');
  assert.ok(Math.abs(at(.95+.375)-.5)<1e-9,'halfway back');assert.ok(at(1.69)<.02,'nearly back to a short toss');assert.ok(at(1.7+.3)>.3,'and out again');
});
test('hard mode hides the drawn hints, and a hard-mode win earns its mark',()=>{
  const h=harness();h.run('escapeHardMode=true;startEscape({levelId:"quiet-vault",skipIntro:true});');
  assert.equal(h.run('escapeAidsHidden()'),true);
  h.run('escapeGame.hunters[0].state="chase";draw();');assert.equal(h.el('escape-warning').textContent,'','no creature warnings');
  h.run('escapeGame.elapsed=20;escapeGame.hasKey=true;escapeGame.finish("won","escaped");draw();escapeMoment.hold=0;draw();');
  assert.match(h.el('escape-result-medals').textContent,/Hard mode/);assert.equal(h.run('escapeProgress.isHard("quiet-vault")'),true);
  h.run('escapeHardMode=false;startEscape({levelId:"quiet-vault",skipIntro:true});');assert.equal(h.run('escapeAidsHidden()'),false,'hints come back with hard mode off');
});
test('a controller moves Sally, sprints, charges and aims a pebble, labels the tools, and pauses',()=>{
  const h=harness(),pad={index:0,connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};h.c.navigator.getGamepads=()=>[pad];h.c.drawingContext.setLineDash=()=>{};
  h.run('escapeProgress.unlocked=()=>true;startEscape({levelId:"fern-cloister",skipIntro:true});');
  const frames=n=>{for(let i=0;i<n;i++){h.tick(60);h.run('draw()');}};frames(2);
  pad.axes[1]=.1;frames(2);assert.equal(h.run('escapePad.y'),0,'a resting stick inside the dead zone does not drift');
  const x0=h.run('escapeGame.player.x');pad.axes[0]=1;pad.axes[1]=0;frames(30);const walked=h.run('escapeGame.player.x')-x0;assert.ok(walked>.5,'the stick walks Sally');
  assert.equal(h.run('escapePad.active'),true);assert.match(h.el('escape-decoy-action').innerHTML,/<kbd>X<\/kbd>/,'tool buttons show pad labels');
  const x1=h.run('escapeGame.player.x');pad.buttons[7].pressed=true;frames(30);pad.buttons[7].pressed=false;assert.ok(h.run('escapeGame.player.x')-x1>walked*1.2,'RT sprints');
  pad.axes[0]=0;const pebbles=h.run('escapeGame.decoys');h.setTime(h.run('escapeGame.decoyReadyAt')*1000+99999);h.run('escapeGame.elapsed=escapeGame.decoyReadyAt+1');
  pad.buttons[2].pressed=true;pad.axes[0]=1;frames(10);assert.equal(h.run('escapeCharge?.source'),'pad','holding X charges a throw');
  pad.buttons[2].pressed=false;frames(2);assert.equal(h.run('escapeCharge'),null);assert.equal(h.run('escapeGame.decoys'),pebbles-1,'releasing X throws');
  pad.axes[0]=0;pad.buttons[9].pressed=true;frames(1);pad.buttons[9].pressed=false;frames(1);assert.equal(h.run('paused'),true,'Start pauses');
});
test('Full lighting draws every area with terrain, water and small lives, and the creatures keep clear and react without touching the game',()=>{
  const h=harness();h.run('escapeLightingFull=()=>true;escapeProgress.unlocked=()=>true;drawEscapeFog=()=>{};');// The fog needs a real canvas; everything else draws through the stubs.
  Object.assign(h.c.drawingContext,{createRadialGradient:()=>({addColorStop(){}}),translate(){},scale(){},drawImage(){},setLineDash(){},arc(){},closePath(){}});
  const frames=n=>{for(let i=0;i<n;i++){h.tick(30);h.run('draw()');}};
  const chapters=h.run('EscapeWorld.chapters.map(c=>c.start)');
  for(const start of chapters){h.run('startEscape({levelId:EscapeCatalog.levels['+start+'].id,skipIntro:true});hideEscapeIntro?.();');frames(3);}
  for(const id of h.run('EscapeCatalog.hidden.map(l=>l.id)'))h.run('startEscape({hiddenId:"'+id+'",skipIntro:true});hideEscapeIntro?.();'),frames(2);
  h.run('startEscape({levelId:"quiet-vault",skipIntro:true});hideEscapeIntro?.();');frames(3);
  const kinds=h.run('escapeCritters.list.map(c=>c.kind)');assert.ok(kinds.includes('bird')&&kinds.includes('butterfly')&&kinds.includes('flower'),'the meadow has its birds, butterflies and flowers');
  assert.equal(h.run('escapeCritters.list.filter(c=>escapeCritterBusy(escapeGame).has(Math.floor(c.x)+","+Math.floor(c.y))).length'),0,'nothing sits on a key, treasure or switch');
  h.run('const b=escapeCritters.list.find(c=>c.kind==="bird");escapeGame.player.x=b.x;escapeGame.player.y=b.y+1;escapeGame.player.sprinting=true;tickEscapeCritters(escapeGame);');
  const state=()=>h.run('JSON.stringify([escapeGame.player,escapeGame.hunters,escapeGame.grid,escapeGame.status])'),before=state();
  h.run('escapeGame.elapsed+=.05;tickEscapeCritters(escapeGame);');
  assert.equal(h.run('escapeCritters.list.find(c=>c.kind==="bird").state'),'fly','a bird bursts off its perch when Sally runs up');
  assert.equal(state(),before,'the creatures never change the game');
  h.run('escapeGame.elapsed+=5;for(let i=0;i<80;i++){escapeGame.elapsed+=.05;tickEscapeCritters(escapeGame);}');
  assert.ok(['perch','gone','fly'].includes(h.run('escapeCritters.list.find(c=>c.kind==="bird").state')));
});


test('seasonal menu enters a continuous campaign-style map, keeps future paths locked and goes back to the title',()=>{
 const h=harness(),panel=h.el('season-hub');panel.querySelectorAll=()=>[];panel.contains=()=>false;
 h.el('seasons-button').onclick();assert.equal(h.run('gameState'),'seasonalHub');assert.match(panel.innerHTML,/SEASONAL ADVENTURES/);assert.match(panel.innerHTML,/Winterlight Hollow/);assert.match(panel.innerHTML,/data-season-clock="winter"/);assert.equal(h.el('game-container').style.display,'block');
 h.run('seasonVisit("winter")');assert.equal(h.run('seasonPack'),'winter');assert.equal(h.run('seasonWorld.areaOpen("winter")'),true);h.run('seasonVisit("spring")');if(h.run('EscapeSeasons.release(EscapeSeasons.packs.find(p=>p.id==="spring")).open'))assert.equal(h.run('seasonPack'),'spring');else assert.match(h.el('season-prompt').textContent,/rain.*blossom/);
 h.run('seasonVisit("autumn-hollow")');assert.equal(h.run('seasonPack'),'autumn-hollow');assert.equal((panel.innerHTML.match(/class="world-node season-level/g)||[]).length,h.run('EscapeCatalog.seasonal.length'));
 h.run('seasonTogglePanel(true);escapeGoBack()');assert.equal(h.run('seasonPanelOpen'),false);assert.equal(h.run('seasonPack'),'autumn-hollow');
 h.run('seasonToggleOverview();escapeGoBack()');assert.equal(h.run('seasonOverview'),false);h.run('escapeGoBack()');assert.equal(h.run('gameState'),'start');
});

test('every seasonal level renders in Full and Simple lighting on desktop and touch, including all six costumes',()=>{
 const h=harness();Object.assign(h.c.drawingContext,{createRadialGradient:()=>({addColorStop(){}}),translate(){},scale(){},drawImage(){},setLineDash(){},arc(){},closePath(){}});for(const id of h.run('EscapeCatalog.seasonal.filter(l=>EscapeSeasons.release(EscapeSeasons.packs.find(p=>p.id===l.seasonal)).open).map(l=>l.id)'))for(const lighting of ['full','simple']){
  h.run('escapeLightingMode='+JSON.stringify(lighting)+';escapeLightingAuto=false;startEscape({seasonalId:'+JSON.stringify(id)+',skipIntro:true});draw();mobile=true;windowWidth=944;windowHeight=524;updateToolbar();draw();');
  assert.equal(h.run('escapeLightingFull()'),lighting==='full');assert.equal(h.run('gameState'),'escape');assert.match(h.el('escape-mission-name').textContent,/Lantern|Ornament|Flower token|Sun lens/);assert.equal(h.el('touch-controls').style.display,'flex');assert.ok(!h.run('escapeGame.level.unlimited'));
 }
});

test('seasonal results, retry and leaving return to Autumn Hollow without changing campaign progress',()=>{
 const h=harness(),panel=h.el('season-hub');panel.querySelectorAll=()=>[];panel.contains=()=>false;
 const before=h.run('JSON.stringify(escapeProgress.data)');h.run('startEscape({seasonalId:"autumn-gardener",skipIntro:true});escapeGame.elapsed=20;escapeGame.hasKey=true;escapeGame.finish("won","home");showEscapeResult();');
 assert.equal(h.run('JSON.stringify(escapeProgress.data)'),before);assert.equal(h.run('seasonProgress().cleared()'),1);assert.match(h.el('escape-result-title').textContent,/festival lantern/);assert.equal(h.el('escape-menu-btn').textContent,'Autumn Hollow');
 h.el('escape-retry-btn').onclick();assert.equal(h.run('escapeOptions.from'),'seasonal');assert.equal(h.run('escapeGame.level.id'),'autumn-gardener');h.run('escapeGame.elapsed=10;escapeLeaveRun()');assert.equal(h.run('gameState'),'seasonalHub');assert.equal(h.run('seasonPack'),'autumn-hollow');assert.equal(h.run('JSON.stringify(escapeProgress.data)'),before);
});

test('festival completion unlocks persistent menu keepsakes and a selectable skin; mastery adds the friendly ghost',()=>{
 const h=harness();h.run('for(const l of EscapeCatalog.seasonal.filter(l=>EscapeSeasons.release(EscapeSeasons.packs.find(p=>p.id===l.seasonal)).open)){startEscape({seasonalId:l.id,skipIntro:true});escapeGame.elapsed=20;escapeGame.hasKey=true;escapeGame.treasure=escapeGame.totalTreasure;escapeGame.finish("won","home");showEscapeResult();}');
 assert.ok(h.run('seasonProgress().complete()&&seasonProgress().mastered()'));assert.match(h.el('title-keepsakes').innerHTML,/pumpkin earned/);assert.match(h.el('title-keepsakes').innerHTML,/All festival treasure found/);assert.equal(h.el('title-keepsakes').hidden,false);
 h.run('seasonProgress().set("skin",true)');assert.equal(h.run('escapeSkinPalette().body.join()'),'184,91,49');h.run('seasonProgress().set("display",false);renderSeasonKeepsakes()');assert.equal(h.el('title-keepsakes').hidden,true);
 const other=h.run('EscapePlayers.create("Festival Friend").id');assert.equal(h.run('EscapePlayers.storage('+JSON.stringify(other)+').getItem(EscapeSeasons.KEY)'),null);
});

test('seasonal walking follows the hub paths, stops on collection panels and supports touch input',()=>{
 const h=harness(),panel=h.el('season-hub');panel.querySelectorAll=()=>[];panel.contains=()=>false;h.run('openSeasonalHub();mobile=true;touchStick.x=-.5;touchStick.y=-.5');const before=h.run('JSON.stringify(seasonWorld.player)');h.run('tickSeasonHub()');assert.notEqual(h.run('JSON.stringify(seasonWorld.player)'),before);
 h.run('seasonTogglePanel(true);touchStick.x=-1');const frozen=h.run('JSON.stringify(seasonWorld.player)');h.run('tickSeasonHub()');assert.equal(h.run('JSON.stringify(seasonWorld.player)'),frozen);
 h.run('seasonTogglePanel(false);mobile=true;windowWidth=900;windowHeight=500;updateToolbar()');assert.equal(h.el('touch-controls').style.display,'flex');
});

test('seasonal notes pause the real engine, resume once and stay independent of collected campaign pages',()=>{
 const h=harness();h.run('globalThis.readSeason=null;globalThis.finishSeasonNote=null;showEscapeStory=(entry,fresh,done)=>{readSeason=entry;escapeStoryOpen=entry;finishSeasonNote=()=>{escapeStoryOpen=null;done()}};startEscape({seasonalId:"autumn-mill",skipIntro:true});escapeGame.player.x=16.5;escapeGame.player.y=4.5;tickEscapeKidsSign(escapeGame);');
 assert.equal(h.run('readSeason'),null,'the note waits to be read');h.run('readEscapeNearSign()');
 assert.equal(h.run('readSeason.card.kind'),'season-sign');assert.match(h.run('readSeason.card.title'),/roast turkey/);const time=h.run('escapeGame.elapsed');h.run('draw();draw()');assert.equal(h.run('escapeGame.elapsed'),time);h.run('finishSeasonNote();readSeason=null;tickEscapeKidsSign(escapeGame)');assert.equal(h.run('readSeason'),null);
});

test('seasonal warning aids stay visible when campaign hard mode is selected',()=>{const h=harness();h.run('escapeHardMode=true;startEscape({seasonalId:"autumn-gardener",skipIntro:true})');assert.equal(h.run('escapeAidsHidden(escapeGame)'),false);assert.equal(h.run('escapeHardMode'),true);});

test('controller A enters a nearby seasonal level; X opens its list and B closes it',()=>{
 const h=harness();for(const id of ['season-hub','season-panel']){h.el(id).querySelectorAll=()=>[];h.el(id).contains=()=>false;}
 const pad={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};h.c.navigator.getGamepads=()=>[pad];
 h.run('openSeasonalHub();pollEscapePad();renderSeasonHUD(true)');pad.buttons[0].pressed=true;h.run('pollEscapePad()');assert.equal(h.run('gameState'),'escape');assert.equal(h.run('escapeGame.level.id'),'autumn-orchard');pad.buttons[0].pressed=false;h.run('escapeLeaveRun();pollEscapePad()');
 pad.buttons[2].pressed=true;h.run('pollEscapePad()');assert.equal(h.run('seasonPanelOpen'),true);pad.buttons[2].pressed=false;h.run('pollEscapePad()');pad.buttons[1].pressed=true;h.run('pollEscapePad()');assert.equal(h.run('seasonPanelOpen'),false);assert.equal(h.run('seasonPack'),'autumn-hollow');pad.buttons[1].pressed=false;h.run('pollEscapePad()');pad.buttons[1].pressed=true;h.run('pollEscapePad()');assert.equal(h.run('gameState'),'start');
});

test('the earned autumn outfit participates in the ordinary world Colours cycle',()=>{
 const h=harness();h.run('for(const l of EscapeCatalog.seasonal)seasonProgress().record({status:"won",levelId:l.id,seasonal:l.seasonal,routeRevision:l.revision,time:20,treasure:0,totalTreasure:10});showEscapeSelect();cycleEscapeSkin();');
 assert.equal(h.run('seasonProgress().data.skin'),true);assert.match(h.el('toolbar-skin').textContent,/Copper Lantern/);h.run('cycleEscapeSkin()');assert.equal(h.run('seasonProgress().activeSkin().id'),'winterberry');h.run('cycleEscapeSkin()');assert.equal(h.run('seasonProgress().data.skin'),false);assert.match(h.el('toolbar-skin').textContent,/Colours:/);
});

test('seasonal world rendering bounds and releases terrain graphics, and leaving restores the campaign',()=>{
 const h=harness();h.el('season-hub').querySelectorAll=()=>[];const make=h.c.createGraphics;let alive=0;h.c.createGraphics=(...args)=>{const g=make(...args);alive++;g.remove=()=>{alive--;};return g;};
 h.run('openSeasonalHub();drawSeasonWorld()');assert.ok(h.run('seasonWorld.motion.lizard.joints.length')>8);const chunkCount=()=>h.run('[...seasonWorldChunks.byBase.values()].reduce((n,m)=>n+m.size,0)');assert.ok(chunkCount()>0&&chunkCount()<=22);assert.ok(alive>0);
 h.run('seasonToggleOverview();drawSeasonWorld()');assert.ok(chunkCount()<=22+55,'the close view and the overview keep their own bounded chunks');h.run('seasonToggleOverview();seasonBack()');assert.equal(alive,0);assert.equal(h.run('gameState'),'start');h.run('showEscapeSelect();draw()');assert.equal(h.run('gameState'),'escapeSelect');
});

test('switching players creates a fresh seasonal walker and loads only that player\'s lanterns',()=>{
 const h=harness();h.el('season-hub').querySelectorAll=()=>[];h.run('openSeasonalHub();globalThis.firstSeasonWorld=seasonWorld;globalThis.nextSeasonPlayer=EscapePlayers.create("Another Walker");EscapePlayers.select(nextSeasonPlayer.id);openSeasonalHub()');assert.equal(h.run('seasonWorld===firstSeasonWorld'),false);assert.equal(h.run('seasonWorldOwner===nextSeasonPlayer.id'),true);assert.equal(h.run('seasonProgress().cleared()'),0);
});

test('seasonal launch checks the requested area, including real future levels staged before release',()=>{
 const h=harness();h.el('season-hub').querySelectorAll=()=>[];h.run('EscapeSeasons={...EscapeSeasons,packs:EscapeSeasons.packs.map(p=>p.id==="spring"?{...p,access:"scheduled",opensAt:"2099-03-20T00:00:00-04:00"}:p)};EscapeCatalog={...EscapeCatalog,seasonal:[...EscapeCatalog.seasonal,{...EscapeCatalog.seasonal[0],id:"spring-staged-test",seasonal:"spring"}]};startEscape({seasonalId:"spring-staged-test",skipIntro:true})');assert.equal(h.run('gameState'),'seasonalHub');assert.equal(h.run('escapeGame'),null);h.run('startEscape({seasonalId:"missing-seasonal-level"})');assert.equal(h.run('gameState'),'seasonalHub');
});

test('autumn water and ambience respect motion preferences without allocating frame graphics',()=>{
 const h=harness();h.el('season-hub').querySelectorAll=()=>[];const reduced={matches:false};h.c.window.matchMedia=()=>reduced;
 Object.assign(h.c.drawingContext,{createRadialGradient:()=>({addColorStop(){}}),drawImage(){}});const turns=[];h.c.rotate=a=>turns.push(a);h.run('openSeasonalHub();escapeLightingMode="full";escapeLightingAuto=false;seasonWorld.elapsed=9;');
 turns.length=0;let allocations=0;const make=h.c.createGraphics;h.c.createGraphics=(...args)=>{allocations++;return make(...args);};
 h.run('drawSeasonWorldWater(seasonWorld,40,24,32,18,23)');assert.ok(Math.abs(turns[0]-1.98)<1e-8);assert.equal(allocations,0);
 reduced.matches=true;turns.length=0;h.run('drawSeasonWorldWater(seasonWorld,40,24,32,18,23)');assert.equal(turns[0],0);assert.equal(h.run('seasonWorldMotion()'),false);
 reduced.matches=false;h.run('escapeLightingMode="simple"');turns.length=0;h.run('drawSeasonWorldWater(seasonWorld,40,24,32,18,23)');assert.equal(turns[0],0);assert.equal(h.run('seasonWorldMotion()'),false);assert.equal(allocations,0);
});

test('earlier Autumn Hollow clears remain labelled and retain keepsakes without showing stale times',()=>{
 const h=harness();h.el('season-hub').querySelectorAll=()=>[];
 h.run('escapeStore.setItem(EscapeSeasons.KEY,JSON.stringify({version:1,records:Object.fromEntries(EscapeCatalog.seasonal.map(l=>[l.id,{revision:1,bestTime:3,treasure:10}])),skin:true}));escapeSeasonProgress=null;openSeasonalHub();renderSeasonKeepsakes();');
 assert.equal(h.run('seasonProgress().cleared()'),8);assert.match(h.el('season-hub').innerHTML,/Earlier route cleared; new layout unplayed/);assert.match(h.el('season-route-best').textContent,/Earlier route cleared/);assert.doesNotMatch(h.el('season-route-best').textContent,/best 3/);assert.equal(h.el('title-keepsakes').hidden,false);assert.ok(h.run('seasonProgress().data.skin'));
});

test('a seasonal catch shows retry rather than a lantern award and cannot advance or alter campaign saves',()=>{
 const h=harness();h.el('season-hub').querySelectorAll=()=>[];const campaign=h.run('JSON.stringify(escapeProgress.data)');
 h.run('startEscape({seasonalId:"autumn-mill",skipIntro:true});escapeGame.throwSpore(0);escapeGame.elapsed=12;escapeGame.finish("caught","The turkey caught Sally.");showEscapeResult();');
 assert.equal(h.run('gameState'),'escapeResult');assert.equal(h.el('escape-result-title').textContent,'Nearly. Try another way');assert.match(h.el('escape-result-summary').textContent,/turkey caught/);assert.match(h.el('escape-result-challenge').textContent,/Retry with fresh supplies/);assert.equal(h.el('escape-next-btn').style.display,'none');assert.equal(h.run('seasonProgress().cleared()'),0);assert.equal(h.run('JSON.stringify(escapeProgress.data)'),campaign);
 h.el('escape-retry-btn').onclick();assert.equal(h.run('escapeGame.level.id'),'autumn-mill');assert.equal(h.run('escapeGame.status'),'playing');assert.equal(h.run('escapeGame.spores'),1);assert.equal(h.run('escapeGame.hasKey'),false);
 h.run('escapeGame.finish("caught","caught");showEscapeResult();');h.el('escape-menu-btn').onclick();assert.equal(h.run('gameState'),'seasonalHub');assert.equal(h.run('seasonWorld.nearby().id'),'autumn-mill');assert.equal(h.run('JSON.stringify(escapeProgress.data)'),campaign);
});

test('winter intros, notes and paused exit use the winter area name and finite-supply wording',()=>{const h=harness();h.run('introMode="full";startEscape({seasonalId:"winter-welcome"});');assert.match(h.el('escape-intro').innerHTML,/WINTERLIGHT HOLLOW - ORNAMENT 1/);assert.doesNotMatch(h.el('escape-intro').innerHTML,/never run out/);assert.match(h.el('escape-intro').innerHTML,/fresh supplies/);h.run('hideEscapeIntro();paused=true;updateToolbar()');assert.equal(h.el('end-run-button').textContent,'Back to Winterlight Hollow');assert.equal(h.run('escapeStoryTheme({kind:"season-sign",theme:"winter-night"})'),'frost');});
test('active input switches from controller back to touch or keyboard without a resting pad taking over',()=>{const h=harness();h.el('season-hub').querySelectorAll=()=>[];const pad={index:0,connected:true,mapping:'standard',axes:[.8,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};h.c.navigator.getGamepads=()=>[pad];h.run('mobile=true;openSeasonalHub();pollEscapePad()');assert.equal(h.run('escapeInputMode()'),'pad');h.run('escapeUseInput("touch");pollEscapePad();updateToolbar()');assert.equal(h.run('escapeInputMode()'),'touch');assert.equal(h.el('touch-controls').style.display,'flex');assert.equal(h.run('escapeMovement().x'),0);assert.equal(h.run('escapePadActive()'),false);pad.axes[0]=0;h.run('pollEscapePad()');pad.axes[0]=.7;h.run('pollEscapePad()');assert.equal(h.run('escapeInputMode()'),'pad');h.run('escapeUseInput("keyboard");pollEscapePad()');assert.equal(h.run('escapeInputMode()'),'keyboard');assert.equal(h.run('escapeMovement().x'),0);});
test('campaign, Autumn and winter entry hints follow the active device instead of mixing keyboard and pad labels',()=>{const h=harness();h.el('season-hub').querySelectorAll=()=>[];for(const mode of ['keyboard','touch','pad']){h.run('mobile='+String(mode==='touch')+';escapeUseInput('+JSON.stringify(mode)+')');for(const pack of ['autumn-hollow','winter']){h.run('openSeasonalHub('+JSON.stringify(pack)+');renderSeasonHUD(true)');const html=h.el('season-enter').innerHTML;assert.doesNotMatch(html,/Enter \/ A/);if(mode==='touch')assert.doesNotMatch(html,/key-hint|\[Enter\]|\[A\]/);else assert.match(html,mode==='pad'?/\[A\]/:/\[Enter\]/);assert.doesNotMatch(h.el('season-collection').innerHTML,/V \/ View/);}}});
test('winter snowballs use the same finite distraction action on desktop and touch, and other levels keep Pebble',()=>{const h=harness();h.run('mobile=true;escapeUseInput("touch");startEscape({seasonalId:"winter-welcome",skipIntro:true});renderEscapeHUD(true);updateToolbar()');assert.match(h.el('escape-decoy-action').innerHTML,/Snowball/);assert.match(h.el('touch-camo').innerHTML,/Snowball/);assert.match(h.el('escape-decoy-action').title,/soft thump/);h.run('escapeGame.throwDecoy(0)');assert.equal(h.run('escapeGame.decoys'),2);assert.match(h.run('escapeGame.message'),/snowball/i);h.run('startEscape({seasonalId:"autumn-orchard",skipIntro:true});renderEscapeHUD(true);updateToolbar()');assert.match(h.el('touch-camo').innerHTML,/Pebble/);});
test('returning to campaign after a seasonal or kids run keeps the last campaign entrance and ignores stale seasonal focus',()=>{for(const seasonalId of ['autumn-orchard','winter-welcome']){const h=harness();h.run('escapeStore.setItem(ESCAPE_LAST_PLAYED_KEY,"quiet-vault");startEscape({seasonalId:'+JSON.stringify(seasonalId)+',skipIntro:true});showEscapeSelect()');assert.equal(h.run('gameState'),'escapeSelect');assert.equal(h.run('escapeWorld.nearby().id'),'quiet-vault');assert.equal(h.run('escapeStore.getItem(ESCAPE_LAST_PLAYED_KEY)'),'quiet-vault');}const h=harness();h.run('escapeStore.setItem(ESCAPE_LAST_PLAYED_KEY,"winter-welcome");showEscapeSelect()');assert.equal(h.run('escapeWorld.nearby().id'),'quiet-vault');});
test('controller A enters the campaign world even when a hidden keyboard list button still has focus',()=>{const h=harness(),pad={index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:16},()=>({pressed:false,value:0}))};h.c.navigator.getGamepads=()=>[pad];h.run('showEscapeSelect();openEscapeWorld("quiet-vault");document.getElementById("world-list-back").focus();pollEscapePad()');pad.buttons[0].pressed=true;h.run('pollEscapePad()');assert.equal(h.run('gameState'),'escape');assert.equal(h.run('escapeGame.level.id'),'quiet-vault');});
test('seasonal overview hides the movement controls and follow view restores the same touch stick',()=>{const h=harness();h.el('season-hub').querySelectorAll=()=>[];h.run('mobile=true;escapeUseInput("touch");openSeasonalHub();seasonToggleOverview()');assert.equal(h.el('touch-controls').style.display,'none');h.run('seasonEnter()');assert.equal(h.run('gameState'),'seasonalHub');assert.equal(h.run('seasonOverview'),false);assert.equal(h.el('touch-controls').style.display,'flex');});
test('Enter/A chooses the displayed winter level ahead of a nearby parked sled',()=>{const h=harness();h.el('season-hub').querySelectorAll=()=>[];h.run('openSeasonalHub("winter","winter-bells");seasonWorld.sled.at={x:seasonWorld.player.x,y:seasonWorld.player.y};seasonEnter()');assert.equal(h.run('gameState'),'escape');assert.equal(h.run('escapeGame.level.id'),'winter-bells');});
