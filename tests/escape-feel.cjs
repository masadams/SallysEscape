const test=require('node:test'),assert=require('node:assert/strict');
const F=require('../public/escape-feel.js'),EscapeAudio=require('../public/escape-audio.js');
const {EscapeAdventure}=require('../public/escape-engine.js');const {escapeBuildCustom}=require('../public/escape-levels.js');const B=require('../public/escape-builder.js');
// A little level with one tile of each ground in a row, Sally standing on the first.
function game(extra={}){const m=B.blank(15,9);'NLmMTt'.split('').forEach((c,i)=>B.paint(m,2+i,4,c));B.paint(m,1,4,'@');Object.assign(m,extra);return new EscapeAdventure({level:escapeBuildCustom(B.toRoute(m))});}

test('Sally’s footsteps follow the ground under her, sand in the desert and snow on cold ground',()=>{
  const g=game();const at=x=>F.surface(g,x+.5,4.5);
  assert.deepEqual([1,2,3,4,5,6,7].map(at),['floor','gravel','leaves','moss','mud','tangle','wet']);
  const desert=game({biome:'desert'});assert.equal(F.surface(desert,1.5,4.5),'sand');assert.equal(F.surface(desert,2.5,4.5),'gravel','a tile beats the sand');
  const cold=game();cold.cold.add('1,4');assert.equal(F.surface(cold,1.5,4.5),'snow');
});

test('every ground has its own footstep, and they play',()=>{
  const calls=[],node=()=>({threshold:{value:0},ratio:{value:0},connect(){},disconnect(){},start(){},stop(){},frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}},Q:{value:0},playbackRate:{value:1},type:''});
  const ctx={currentTime:0,sampleRate:8000,destination:{},createDynamicsCompressor:node,createOscillator:()=>{calls.push('osc');return node();},createGain:node,createBiquadFilter:node,createBufferSource:()=>{calls.push('noise');return node();},createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};
  EscapeAudio.reset();for(const surface of ['floor','gravel','leaves','moss','mud','sand','snow','wet','tangle']){ctx.currentTime+=1;assert.equal(EscapeAudio.play(ctx,'step',.3,{surface}),true,surface);}
  assert.ok(calls.filter(c=>c==='noise').length>=12);EscapeAudio.reset();
});

test('caves and halls echo, the open air does not, and the echo is one shared send',()=>{
  assert.equal(F.space('grotto'),'cave');assert.equal(F.space('ruins'),'hall');assert.equal(F.space('meadow'),'open');assert.equal(F.space('meadow',{dark:true}),'cave');assert.equal(F.space('secret:ice-cave'),'cave');
  let convolvers=0;const node=()=>({threshold:{value:0},ratio:{value:0},connect(){},disconnect(){},gain:{value:0,setTargetAtTime(){}},buffer:null});
  const ctx={currentTime:0,sampleRate:8000,destination:{},createDynamicsCompressor:node,createGain:()=>({...node(),context:ctx}),createConvolver:()=>{convolvers++;return node();},createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};
  assert.equal(EscapeAudio.setSpace(ctx,'cave'),true);assert.equal(EscapeAudio.space(),'cave');assert.equal(EscapeAudio.setSpace(ctx,'cave'),false,'no change, no work');
  EscapeAudio.setSpace(ctx,'hall');EscapeAudio.setSpace(ctx,'open');assert.equal(EscapeAudio.space(),'open');assert.equal(convolvers,1);
});

test('steps leave prints on soft ground, dust when sprinting, leaves from leaves, and a ring as far as the noise carries',()=>{
  const g=game(),fx=new F.Particles();
  g.player.x=2.5;g.player.noisy=true;g.player.loud=false;let made=F.step(fx,g,{t:0,sprint:false,rand:()=>.5});
  const ring=made.find(p=>p.kind==='ring');assert.equal(ring.r,F.RINGS.gravel);
  g.player.x=1.5;g.player.noisy=false;g.player.loud=true;made=F.step(fx,g,{t:0,sprint:true,rand:()=>.5});
  assert.ok(made.some(p=>p.kind==='dust'));assert.equal(made.find(p=>p.kind==='ring').r,F.RINGS.sprint);
  g.player.x=3.5;g.player.loud=false;made=F.step(fx,g,{t:0,sprint:false,rand:()=>.5});assert.ok(made.some(p=>p.kind==='leaf'));assert.ok(!made.some(p=>p.kind==='ring'),'a quiet step makes no ring');
  g.player.x=5.5;made=F.step(fx,g,{t:0,sprint:false,rand:()=>.5});assert.ok(made.some(p=>p.kind==='print'),'mud keeps a print');
  F.land(fx,{x:5,y:5},0);assert.ok(fx.items.some(p=>p.kind==='ring'&&p.r===F.RINGS.pebble));
  fx.update(10,1/60);assert.equal(fx.items.length,0,'old particles fade away');
  const small=new F.Particles(5);for(let i=0;i<20;i++)small.add('dust',0,0);assert.equal(small.items.length,5,'the pool never grows');
});

test('a phone buzzes for being caught, spotted, a dropped tail and the key, and nothing else',()=>{
  const got=[],nav={vibrate:p=>got.push(p)};
  assert.equal(F.buzz(['step','caught','key'],nav),'caught');assert.equal(F.buzz(['key'],nav),'key');assert.equal(F.buzz(['treasure','step'],nav),null);
  assert.deepEqual(got,[F.BUZZ.caught,F.BUZZ.key]);assert.equal(F.buzz(['caught'],{}),null,'no vibration support, no buzz');
});
