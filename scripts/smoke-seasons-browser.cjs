// Real Chromium rendering/integration check. CI supplies Google Chrome; no test npm package is needed.
// Locally: CHROME_PATH=/path/to/chrome node scripts/smoke-seasons-browser.cjs
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {createServer}=require('../server/index.cjs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function smoke(){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sally-season-browser-')),profile=path.join(temp,'profile');
 const server=createServer({dataDir:path.join(temp,'data'),seedFile:path.join(temp,'no-seed.json'),log:()=>{}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,chrome=process.env.CHROME_PATH||'google-chrome';
 const browser=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
 let browserError='',spawnError=null,ws;browser.stderr.on('data',d=>{browserError=(browserError+d).slice(-3000);});browser.on('error',e=>{spawnError=e;});
 const pending=new Map();let id=0;
 try{
  let port;for(let i=0;i<150;i++){if(spawnError)throw spawnError;if(browser.exitCode!==null)throw Error('Chrome exited: '+browserError);try{port=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];}catch(_){}if(port)break;await wait(100);}assert.ok(port,'Chrome debugging port did not start: '+browserError);
  const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list',{signal:AbortSignal.timeout(5000)})).json(),tab=tabs.find(t=>t.type==='page');assert.ok(tab,'Chrome page missing');
  ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  const errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error('Chrome timed out: '+method));},15000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
  const run=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  const frame=()=>run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const screenshot=async name=>{if(!process.env.SEASON_SCREENSHOTS)return;const r=await send('Page.captureScreenshot',{format:'jpeg',quality:64,captureBeyondViewport:false});console.log('SEASON_SCREENSHOT '+name+' '+r.data);};
  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:base});
  let ready=false;for(let i=0;i<150;i++){if(await run('typeof gameState!=="undefined"&&!!document.getElementById("seasons-button")?.onclick')){ready=true;break;}await wait(100);}assert.ok(ready,'Game did not initialise');
  await run('document.getElementById("seasons-button").click()');await frame();assert.equal(await run('gameState'),'seasonalHub');assert.equal(await run('document.querySelectorAll("[data-season-clock]").length'),8);
  assert.equal(await run('getComputedStyle(document.querySelector("#game-container canvas")).display'),'block');assert.equal(await run('seasonWorld.motion.lizard.joints.length>8'),true);assert.equal(await run('document.querySelectorAll(".season-level").length'),16);await screenshot('autumn-world');
  await run('escapeLightingMode="full";escapeLightingAuto=false;seasonWorld.player.x=26;seasonWorld.player.y=23.8;seasonWorld.motion.resetPlayer(seasonWorld.player);drawSeasonWorld()');await frame();await screenshot('autumn-pond-full');
  await run('escapeLightingMode="simple";drawSeasonWorld()');await frame();await screenshot('autumn-pond-simple');
  await run('escapeLightingMode="full";seasonWorld.player.x=20;seasonWorld.player.y=23.5;seasonWorld.motion.resetPlayer(seasonWorld.player);drawSeasonWorld()');await frame();await screenshot('autumn-oak');
  await run('escapeLightingMode="full";escapeLightingAuto=false;seasonToggleOverview()');await frame();await screenshot('seasonal-world-overview');assert.equal(await run('seasonOverview'),true);
  await run('escapeLightingMode="simple";drawSeasonWorld()');await frame();await screenshot('seasonal-weather-simple');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await run('escapeLightingMode="full";drawSeasonWorld()');await frame();assert.equal(await run('matchMedia("(prefers-reduced-motion: reduce)").matches'),true);await screenshot('seasonal-weather-reduced-motion');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await require('./smoke-winter-browser.cjs').checkWinterBrowser({run,frame,screenshot,send});
  for(const area of ['spring','summer']){
   await run('seasonVisit('+JSON.stringify(area)+');for(let i=0;i<120*60&&seasonWorld.target;i++)seasonWorld.advance(1/120);renderSeasonHUD(true);drawSeasonWorld()');await frame();assert.equal(await run('seasonWorld.nearbyGate()?.id'),area);await screenshot(area+'-gate');
  }
  await run('seasonVisit("autumn-hollow");seasonEnter()');assert.equal(await run('gameState'),'escape');assert.equal(await run('escapeGame.level.id'),'autumn-orchard');await run('escapeLeaveRun()');assert.equal(await run('gameState'),'seasonalHub');
  const ids=await run('EscapeCatalog.seasonal.map(l=>l.id)');
  for(const level of ids)for(const lighting of ['full','simple']){
   await run('escapeLightingMode='+JSON.stringify(lighting)+';escapeLightingAuto=false;startEscape({seasonalId:'+JSON.stringify(level)+',skipIntro:true});paused=true;drawEscapeVault()');await frame();
   assert.equal(await run('escapeLightingFull()'),lighting==='full',level+' lighting');assert.ok(await run('document.querySelector("canvas").width>0'),level+' real canvas');
   if(lighting==='full'&&['autumn-orchard','autumn-store','autumn-maze'].includes(level))await screenshot(level);
   // Exercise the new silhouettes' warning poses too. These are rendering checks, not solution runs.
   await run('for(const h of escapeGame.hunters){h.state=({owl:"glare",mimic:"reveal",fox:"crouch",toad:"windup",beetle:"windup",snake:"alert"})[h.kind]||h.state;}drawEscapeVault()');
  }
  await run('escapeLightingMode="full";escapeLightingAuto=false;startEscape({seasonalId:"autumn-mill",skipIntro:true});paused=true;drawEscapeVault()');await wait(750);await frame();await screenshot('mill');assert.equal(await run('escapeGame.grid[7][12]'),'P');assert.equal(await run('escapeGame.route(escapeGame.player,escapeGame.key).length'),0);
  await run('escapeGame.finish("caught","The turkey caught Sally.");showEscapeResult()');assert.equal(await run('document.getElementById("escape-result-title").textContent'),'Nearly. Try another way');assert.equal(await run('document.getElementById("escape-next-btn").style.display'),'none');assert.equal(await run('seasonProgress().cleared()'),0);await frame();await screenshot('seasonal-retry');await run('document.getElementById("escape-retry-btn").click();paused=true;');assert.equal(await run('escapeGame.level.id'),'autumn-mill');assert.equal(await run('escapeGame.spores'),1);
  await run('escapeGame.player.x=16.5;escapeGame.player.y=4.5;paused=false;tickEscapeKidsSign(escapeGame)');assert.equal(await run('escapeStoryOpen.card.kind'),'season-sign');await run('document.querySelector("#story-card button:last-of-type").click()');
  await run('openSeasonalHub("autumn-hollow");seasonTogglePanel(true)');assert.equal(await run('seasonPanelOpen'),true);await run('escapeGoBack()');assert.equal(await run('seasonPanelOpen'),false);
  await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'});await run('windowResized();openSeasonalHub("autumn-hollow")');await frame();assert.equal(await run('isMobileDevice()'),true,'emulated phone has a touchscreen');assert.equal(await run('getComputedStyle(document.getElementById("touch-controls")).display'),'flex');const mobileLayout=await run('(()=>{const stick=document.getElementById("movement-stick").getBoundingClientRect();return [...document.querySelectorAll(".season-level")].filter(el=>el.getClientRects().length).map(el=>{const b=el.getBoundingClientRect();return {name:el.textContent,inside:b.top>=0&&b.bottom<=innerHeight,clear:b.left>=stick.right||b.top>=stick.bottom||b.bottom<=stick.top};});})()');assert.ok(mobileLayout.length,'a nearby flag is visible in the follow camera');for(const b of mobileLayout){assert.ok(b.inside,b.name+' fits landscape screen');assert.ok(b.clear,b.name+' is clear of the stick');}await screenshot('mobile-world');await run('seasonToggleOverview()');await frame();await screenshot('mobile-world-overview');await run('seasonToggleOverview()');
  await run('startEscape({seasonalId:"autumn-finale",skipIntro:true});paused=true;drawEscapeVault()');await wait(750);await frame();await screenshot('mobile-finale');
  await run('mobile=false;for(const l of EscapeCatalog.seasonal){startEscape({seasonalId:l.id,skipIntro:true});escapeGame.elapsed=20;escapeGame.hasKey=true;escapeGame.treasure=10;escapeGame.finish("won","browser reward check");showEscapeResult();}');
  assert.equal(await run('seasonProgress().complete()&&seasonProgress().mastered()'),true);await run('openSeasonalHub();seasonBack()');assert.equal(await run('gameState'),'start');assert.equal(await run('document.getElementById("title-keepsakes").hidden'),false);
  await send('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});await send('Emulation.setTouchEmulationEnabled',{enabled:false});await send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36'});await run('windowResized()');await frame();assert.equal(await run('document.getElementById("title-keepsakes").parentElement.classList.contains("title-art")'),true,'keepsakes stay inside the art column');assert.equal(await run('(()=>{const p=document.querySelector(".title-menu").getBoundingClientRect(),b=document.getElementById("start-menu-container").getBoundingClientRect();return p.top>=b.top&&p.bottom<=b.bottom&&p.left>=b.left&&p.right<=b.right;})()'),true,'earned rewards do not push the menu outside its panel');await screenshot('menu-keepsakes');
  // Render each seasonal SFX through actual Web Audio, checking that its samples are finite and audible.
  await require('./smoke-glow-browser.cjs').checkGlowBrowser({run,frame,screenshot,send});
  const sounds=await run('(async()=>{const out=[];for(const name of ["season-bones","season-zombie","season-ghost","season-pumpkin","season-basket","season-turkey","winter-yeti","winter-wisp","winter-cane","winter-snowman","winter-present","winter-snatcher","winter-krampus","winter-watchman"])out.push(await EscapeAudio.measure(name));return out;})()');
  for(const s of sounds)assert.ok(s&&Number.isFinite(s.rms)&&Number.isFinite(s.peak)&&s.rms>.0001&&s.peak>0,s?.name+' real sound samples');console.log('Seasonal Web Audio measurements: '+JSON.stringify(sounds));
  assert.deepEqual(errors,[],'uncaught errors while loading/drawing game');console.log('Seasonal browser smoke passed: real desktop/mobile rendering, menus, notes, rewards and Web Audio.');
 }finally{
  for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Browser closed'));}ws?.close();browser.kill();await new Promise(r=>server.close(r));
  // Only this mkdtemp-created directory is eligible for cleanup, and only after Chrome exits.
  const target=path.resolve(temp),parent=path.resolve(os.tmpdir());if(target.startsWith(parent+path.sep)&&path.basename(target).startsWith('sally-season-browser-')){for(let i=0;i<20&&browser.exitCode===null;i++)await wait(50);try{fs.rmSync(target,{recursive:true,force:true});}catch(_){}}
 }
}
smoke().catch(e=>{console.error(e);process.exitCode=1;});




