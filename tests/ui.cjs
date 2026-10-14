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
  const dc={createLinearGradient:()=>({addColorStop:noop}),fillRect:noop,save:noop,restore:noop,beginPath:noop,rect:noop,clip:noop,globalAlpha:1};
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
    createCanvas:()=>({parent:noop}),
    random:(a,b)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=seed/4294967296;return Array.isArray(a)?a[Math.floor(n*a.length)]:a===undefined?n:b===undefined?n*a:a+n*(b-a)},
    keyIsDown:()=>false,fetch:async()=>({ok:true,json:async()=>[]})};
  for(const n of ['push','pop','background','fill','noFill','stroke','noStroke','strokeWeight','rect','triangle','ellipse','line','bezier','beginShape','endShape','curveVertex','vertex','translate','scale','image','imageMode','text','textSize','textFont','textAlign','colorMode','arc','setShakeThreshold','resizeCanvas','rotate','blendMode']) c[n]=noop;
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
test('the standalone world enters the real engine and renders the result in its existing playfield',()=>{const h=harness();h.run('showEscapeSelect();startEscape({levelId:"quiet-vault"});draw();escapeGame.elapsed=20;escapeGame.hasKey=true;escapeGame.finish("won","escaped");draw();');assert.equal(h.run('gameState'),'escapeResult');assert.equal(h.el('game-container').style.display,'block');assert.equal(h.el('escape-result').style.display,'block');assert.equal(h.el('escape-menu-btn').textContent,'Explore the world');assert.equal(h.run('escapeProgress.unlocked("crumbling-hall")'),true);});
test('the stick clamps diagonal input, rejects a second pointer and releases independently of held sprint',()=>{const h=harness();h.el('movement-stick').getBoundingClientRect=()=>({left:0,top:0,width:100,height:100});h.run('showEscapeSelect();');const stick=h.el('movement-stick'),e={pointerId:3,clientX:100,clientY:100,preventDefault(){}};stick.onpointerdown(e);assert.ok(h.run('Math.abs(Math.hypot(touchStick.x,touchStick.y)-1)<1e-8'));const before=h.run('touchStick.x');stick.onpointerdown({...e,pointerId:4,clientX:0});assert.equal(h.run('touchStick.x'),before);h.run('touchInput.sprint=true;');stick.onpointerup(e);assert.equal(h.run('touchStick.x'),0);assert.equal(h.run('touchInput.sprint'),true);assert.equal(h.run('touchStick.pointer'),null);});
test('portrait rotation pauses simulation and clears the stick, and landscape preserves the pause until resumed',()=>{const h=harness();h.run('startEscape({levelId:"quiet-vault"});mobile=true;windowWidth=390;windowHeight=844;touchStick.x=1;');const t=h.run('escapeGame.elapsed');h.run('draw();');assert.equal(h.run('paused'),true);assert.equal(h.run('touchStick.x'),0);assert.equal(h.run('escapeGame.elapsed'),t);h.run('windowWidth=844;windowHeight=390;draw();');assert.equal(h.run('paused'),true);h.run('togglePause();draw();draw();');assert.ok(h.run('escapeGame.elapsed')>t);});
