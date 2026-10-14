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
  const ctx=fakeContext();for(const r of EscapeAudio.recipes)assert.equal(EscapeAudio.play(ctx,r,.25,{}),true,r);assert.ok(ctx.calls.includes('osc')&&ctx.calls.includes('noise'));
  assert.equal(EscapeAudio.play(ctx,'nope',.25),false);assert.equal(EscapeAudio.play(ctx,'key',0),false);assert.equal(EscapeAudio.play(null,'key',.25),false);
});
