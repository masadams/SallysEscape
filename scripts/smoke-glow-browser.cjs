const assert=require('node:assert/strict');
function glowBrowserRoute(explore=false){
 const map=Array.from({length:17},(_,y)=>Array.from({length:25},(_,x)=>!x||!y||x===24||y===16?'#':'.'));
 map[8][8]='@';map[2][22]='K';map[14][2]='X';
 for(const [x,y]of[[5,3],[5,4],[18,11],[18,12]])map[y][x]='#';
 return {id:'glow-browser',name:'Glow mushroom shelter',brief:'The light buys time. Leave before it fades.',hint:'Spiders wait for the dark. Watch the mushroom fade.',map:map.map(r=>r.join('')),glows:3,explore,dark:true,sightRadius:2,guards:[{kind:'spider',spawn:[12,8],facing:Math.PI,patrol:[[20,8]]},{kind:'millipede',spawn:[12,5],facing:Math.PI/2,patrol:[[20,5]]}]};
}
async function checkGlowBrowser({run,frame,screenshot,send}){
 const start=async explore=>{
  await run('startEscape({custom:'+JSON.stringify(glowBrowserRoute(explore))+',skipIntro:true});paused=true;escapeCurtain=null;escapeGame.player.throwAim={x:1,y:0};escapeGame.throwGlow(0);for(let i=0;i<120;i++)escapeGame.advance(1/120,{x:1});for(let i=0;i<120;i++)escapeGame.advance(1/120,{});renderEscapeHUD();drawEscapeVault()');await frame();
  assert.equal(await run('escapeGame.status'),'playing');assert.equal(await run('escapeGame.lights[0].r'),4);
  assert.equal(await run('escapeGame.hunters[0].state'),'light-watch');assert.equal(await run('escapeGame.inLight()'),true);
 };
 await start(false);
 for(const mode of ['full','simple']){
  await run('escapeLightingMode='+JSON.stringify(mode)+';escapeLightingAuto=false;drawEscapeVault()');await frame();assert.equal(await run('escapeLightingFull()'),mode==='full');await screenshot('glow-watch-'+mode);
 }
 await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36'});
 await run('windowResized();drawEscapeVault()');await frame();await screenshot('glow-mobile-simple');
 await send('Emulation.setDeviceMetricsOverride',{width:1200,height:850,deviceScaleFactor:1,mobile:false});await send('Emulation.setTouchEmulationEnabled',{enabled:false});
 await send('Emulation.setUserAgentOverride',{userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36'});await run('windowResized();escapeLightingMode="full"');
 await start(true);await screenshot('glow-fog');
 await run('escapeGame.paused=false;for(let i=0;i<120*12&&escapeGame.lights[0]&&escapeGame.lights[0].until-escapeGame.elapsed>.6;i++)escapeGame.advance(1/120,{});renderEscapeHUD();drawEscapeVault()');await frame();assert.equal(await run('escapeGame.hunters[0].state'),'light-watch');assert.ok(await run('escapeGame.lights[0].until-escapeGame.elapsed<.61'),'the fade screenshot is near actual expiry');await screenshot('glow-fading');
 await run('escapeGame.paused=false;for(let i=0;i<120*.9;i++)escapeGame.advance(1/120,{});renderEscapeHUD();drawEscapeVault()');await frame();assert.equal(await run('escapeGame.lights.length'),0);assert.equal(await run('escapeGame.hunters[0].state'),'rush');await screenshot('glow-rush');
 console.log('Glow browser smoke passed: real throw, wider light, Full/Simple falloff, touch layout, fog, waiting, fade and rush.');
}
module.exports={glowBrowserRoute,checkGlowBrowser};
