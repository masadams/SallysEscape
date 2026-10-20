// Real Chromium rendering/integration check. CI supplies Google Chrome; no test npm package is needed.
// Locally: CHROME_PATH=/path/to/chrome node scripts/smoke-seasons-browser.cjs
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {createServer}=require('../server/index.cjs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function smoke(){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sally-iso-browser-')),profile=path.join(temp,'profile');
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

  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:base+'/isometric.html'});
  let ready=false;for(let i=0;i<100;i++){if(await run('!!window.IsometricExample')){ready=true;break;}await wait(100);}assert.ok(ready,'isometric scene initialised');
  await run('IsometricExample.state.game.paused=true;IsometricExample.render()');await frame();await screenshot('iso-whole-desktop');
  const initial=await run('({x:IsometricExample.state.game.player.x,y:IsometricExample.state.game.player.y})');
  await run('IsometricExample.state.game.paused=false');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});await wait(160);await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'});
  const moved=await run('({x:IsometricExample.state.game.player.x,y:IsometricExample.state.game.player.y})');assert.ok(moved.x>initial.x&&moved.y<initial.y,'keyboard right moves to screen right');
  await run('IsometricExample.pause()');const pausedTime=await run('IsometricExample.state.game.elapsed');await wait(100);assert.equal(await run('IsometricExample.state.game.elapsed'),pausedTime);
  // Replay verified real input frames into this exact browser engine and renderer.
  const {solve}=require('./isometric-tour.cjs'),tour=solve(true);
  await run('IsometricExample.reset();IsometricExample.state.game.paused=true');
  const half=tour.frames.findIndex((_f,i)=>i>tour.frames.length*.5);
  await run('(()=>{const g=IsometricExample.state.game;g.paused=false;for(const f of '+JSON.stringify(tour.frames.slice(0,half))+')g.advance(1/120,f);g.paused=true;IsometricExample.render();})()');
  await screenshot('iso-bridge-and-mill');
  await run('document.getElementById("view").click();IsometricExample.render()');await frame();await screenshot('iso-close-desktop');
  await run('(()=>{const g=IsometricExample.state.game;g.paused=false;for(const f of '+JSON.stringify(tour.frames.slice(half))+')g.advance(1/120,f);IsometricExample.render();})()');
  assert.equal(await run('IsometricExample.state.game.status'),'won');assert.equal(await run('IsometricExample.state.game.treasure'),10);await frame();await screenshot('iso-completed');
  // Actual touch drag, released/cancelled holds, tool tap, and no hidden hit-blocking layer.
  await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await run('IsometricExample.reset();IsometricExample.mode("touch");IsometricExample.state.close=true;dispatchEvent(new Event("resize"))');await frame();
  const b=await run('(()=>{const b=document.getElementById("stick").getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};})()'),before=await run('IsometricExample.state.game.player.x');
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x,y:b.y,id:1}]});await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+28,y:b.y,id:1}]});await wait(180);await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok(await run('IsometricExample.state.game.player.x')>before,'touch joystick moves Sally');assert.equal(await run('IsometricExample.state.stick.x'),0);
  const pebble=await run('(()=>{const b=document.querySelector("[data-tool=pebble]").getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2};})()');
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...pebble,id:2}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await run('IsometricExample.state.game.decoys'),2,'touch throw spends one finite pebble');
  await run('IsometricExample.state.game.paused=true;IsometricExample.render()');await screenshot('iso-phone-touch');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await run('document.getElementById("walls").click();IsometricExample.render()');await screenshot('iso-phone-low-walls');
  await run('window.__isoPad={connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0})),mapping:"standard",index:0,id:"Test pad"};Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>[__isoPad]});IsometricExample.state.game.paused=false;__isoPad.axes=[.8,0]');await wait(150);assert.equal(await run('IsometricExample.state.mode'),'pad');
  // A still connected pad must not win against a fresh real touch.
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x,y:b.y,id:3}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(100);assert.equal(await run('IsometricExample.state.mode'),'touch');
  await run('IsometricExample.state.game.paused=true');
  assert.deepEqual(errors,[],'no runtime errors on the example page');
  console.log('Isometric browser smoke passed: desktop/phone screenshots, real keyboard and touch movement, finite throw, pad switching, pause and all-treasure win.');
 }finally{
  for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Browser closed'));}ws?.close();browser.kill();await new Promise(r=>server.close(r));
  // Only this mkdtemp-created directory is eligible for cleanup, and only after Chrome exits.
  const target=path.resolve(temp),parent=path.resolve(os.tmpdir());if(target.startsWith(parent+path.sep)&&path.basename(target).startsWith('sally-season-browser-')){for(let i=0;i<20&&browser.exitCode===null;i++)await wait(50);try{fs.rmSync(target,{recursive:true,force:true});}catch(_){}}
 }
}
smoke().catch(e=>{console.error(e);process.exitCode=1;});




