const assert=require('node:assert/strict');
// Release check in real Chromium: one pause panel driven only by a controller (Start, the d-pad,
// A and B), Options opening over it and handing back, and Leave returning to the map.
async function checkReleaseBrowser({run,frame}){
 const frames=n=>run('new Promise(resolve=>{let k=0;(function tick(){if(++k>=('+n+'))resolve();else requestAnimationFrame(tick)})();})');
 const B={A:0,B:1,START:9,UP:12,DOWN:13};
 const press=async name=>{await run('releasePad.buttons['+B[name]+']={pressed:true,value:1}');await frames(4);await run('releasePad.buttons['+B[name]+']={pressed:false,value:0}');await frames(4);};
 const state=()=>run('({state:gameState,paused,focus:document.activeElement?.id||"",open:[...document.querySelectorAll(".game-dialog")].filter(d=>d.style.display==="flex").map(d=>d.id)})');
 await run('globalThis.savedReleasePadGetter=Object.getOwnPropertyDescriptor(navigator,"getGamepads");globalThis.releasePad={index:0,connected:true,mapping:"standard",axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>[releasePad]});startEscape({id:EscapeCatalog.levels[0].id,skipIntro:true});');
 await frames(6);await press('A');await frames(4);
 await press('START');let s=await state();assert.equal(s.paused,true,'Start pauses');assert.deepEqual(s.open,['pause-panel']);assert.equal(s.focus,'pause-resume');
 await press('B');s=await state();assert.equal(s.paused,false,'B resumes');assert.deepEqual(s.open,[]);
 await press('START');await press('DOWN');await press('DOWN');s=await state();assert.equal(s.focus,'pause-options');
 await press('A');s=await state();assert.deepEqual(s.open,['options-panel'],'Options opens over the pause panel');
 await press('B');s=await state();assert.deepEqual(s.open,['pause-panel'],'closing Options returns to the pause panel');assert.equal(s.paused,true);
 await press('UP');s=await state();assert.equal(s.focus,'pause-leave','up from Resume wraps to Leave');
 await press('A');s=await state();assert.notEqual(s.state,'escape','Leave returns to the map');assert.deepEqual(s.open,[]);
 await run('releasePad.connected=false;pollEscapePad();if(savedReleasePadGetter)Object.defineProperty(navigator,"getGamepads",savedReleasePadGetter);else delete navigator.getGamepads;escapeUseInput("keyboard");');
 console.log('Release browser smoke passed: controller-only pause, Options and leave.');
}
module.exports={checkReleaseBrowser};
