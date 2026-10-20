const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const EscapeAudio=require('../public/escape-audio.js');
function fakeContext(){const calls=[];const node=kind=>()=>{calls.push(kind);return {connect(){},disconnect(){},start(){},stop(){},frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},Q:{value:0},threshold:{value:0},ratio:{value:0}};};
  return {calls,currentTime:0,sampleRate:8000,destination:{},createDynamicsCompressor:node('compressor'),createOscillator:node('osc'),createGain:node('gain'),createBiquadFilter:node('filter'),createBufferSource:node('noise'),createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};}
test('every sound event the engine emits has its own synthesised recipe',()=>{
  const src=fs.readFileSync(path.join(__dirname,'../public/escape-engine.js'),'utf8'),events=new Set();
  for(const m of src.matchAll(/events\.push\('([a-zA-Z]+)'\)/g))events.add(m[1]);
  for(const m of src.matchAll(/notice\([^;]*?,'([a-zA-Z]+)'\)/g))events.add(m[1]);
  for(const status of ['won','caught','failed','spotted','chest','step','paddle','cache'])events.add(status);
  for(const e of events)assert.ok(EscapeAudio.recipes.includes(e),'missing sound for '+e);
});
test('recipes build real voices, and silence or unknown names play nothing',()=>{
  const ctx=fakeContext();for(const r of EscapeAudio.recipes){ctx.currentTime+=1;assert.equal(EscapeAudio.play(ctx,r,.25,{}),true,r);}assert.ok(ctx.calls.includes('osc')&&ctx.calls.includes('noise'));
  assert.equal(EscapeAudio.play(ctx,'nope',.25),false);assert.equal(EscapeAudio.play(ctx,'key',0),false);assert.equal(EscapeAudio.play(null,'key',.25),false);
});
test('each sound renders once offline, then replays from its buffer; rapid repeats and voice floods are trimmed',async()=>{
  const made=[];
  globalThis.OfflineAudioContext=class{constructor(c,n,rate){this.destination={};this.sampleRate=rate;this.currentTime=0;made.push(this);}
    createGain(){return {connect(){},gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}}};}createOscillator(){return fakeContext().createOscillator();}createBiquadFilter(){return fakeContext().createBiquadFilter();}createBufferSource(){return fakeContext().createBufferSource();}
    startRendering(){return Promise.resolve({sampleRate:this.sampleRate,getChannelData:()=>new Float32Array(16000).fill(.1)});}};
  globalThis.AudioBuffer=class{constructor(o){this.length=o.length;this.sampleRate=o.sampleRate;this.duration=o.length/o.sampleRate;}copyToChannel(){}};
  try{
    EscapeAudio.reset();const ctx=fakeContext(),sources=[];ctx.createBufferSource=()=>{const s={connect(){},disconnect(){},start(){},stop(){},playbackRate:{value:1},buffer:null};sources.push(s);return s;};
    assert.equal(EscapeAudio.play(ctx,'key',.3),true);await new Promise(r=>setTimeout(r,5));assert.equal(made.length,1,'rendered once');
    const oscillators=ctx.calls.filter(c=>c==='osc').length;ctx.currentTime=1;assert.equal(EscapeAudio.play(ctx,'key',.3),true);
    assert.equal(ctx.calls.filter(c=>c==='osc').length,oscillators,'the replay builds no oscillators');assert.ok(sources.at(-1).buffer,'it plays the rendered buffer');
    assert.equal(EscapeAudio.play(ctx,'key',.3),false,'the same sound in the same instant is dropped');
    EscapeAudio.play(ctx,'step',.3,{});await new Promise(r=>setTimeout(r,5));assert.equal(made.length,4,'footsteps keep three takes');
    for(let i=0;i<20;i++){ctx.currentTime=2+i*.05;EscapeAudio.play(ctx,'key',.3);}ctx.currentTime=3.01;assert.equal(EscapeAudio.play(ctx,'step',.3,{}),false,'footsteps give way when voices are full');
  }finally{delete globalThis.OfflineAudioContext;delete globalThis.AudioBuffer;EscapeAudio.reset();}
});

