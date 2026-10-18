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
  const element=id=>elements[id] ||= {style:{},value:'Tester',disabled:false,innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},setAttribute(){},focus(){},appendChild(){},insertBefore(){},addEventListener(type,fn){this['on'+type]=fn}};
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
  for(const n of ['push','pop','background','fill','noFill','stroke','noStroke','strokeWeight','rect','triangle','ellipse','line','bezier','beginShape','endShape','curveVertex','vertex','translate','scale','image','imageMode','text','textSize','textFont','textAlign','textStyle','colorMode','arc','setShakeThreshold','resizeCanvas','rotate','blendMode']) c[n]=noop;c.BOLD='bold';c.NORMAL='normal';
  for(const n of ['CORNER','CENTER','LEFT','RIGHT','TOP','BOTTOM','CLOSE','RGB','HSB','PIE','ADD','BLEND']) c[n]=n;
  c.UP_ARROW=38;c.DOWN_ARROW=40;c.LEFT_ARROW=37;c.RIGHT_ARROW=39;
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
