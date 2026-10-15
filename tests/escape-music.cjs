const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EscapeMusic}=require('../public/escape-music.js');const {verify,plan,readWav}=require('../scripts/build-music.cjs');
function param(){return {value:0,events:[],cancelScheduledValues(){this.events=[]},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v,t){this.events.push([v,t]);this.value=v;}};}
function fakeContext(){const sources=[];return {sources,currentTime:10,destination:{},createGain:()=>({gain:param(),connect(){}}),createBufferSource:()=>{const s={connect(){},start(t){s.startedAt=t;}};sources.push(s);return s;},decodeAudioData:async b=>({duration:8,length:b.byteLength})};}
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/audio/music/manifest.json'),'utf8'));
function fakeFetch(missing=[]){return async url=>url.endsWith('manifest.json')?{ok:true,json:async()=>({...manifest,tracks:{lurking:{...manifest.tracks.lurking,loopSeconds:8}}})}:missing.some(m=>url.includes(m))?{ok:false}:{ok:true,arrayBuffer:async()=>new ArrayBuffer(16)};}
test('the manifest maps every game state onto known layers and gives each a fade',()=>{
  const layers=Object.keys(manifest.tracks[manifest.defaultTrack].layers);
  for(const state of ['menu','world','explore','tension','chase','victory','caught']){assert.ok(manifest.states[state],state);for(const k of Object.keys(manifest.states[state]))assert.ok(layers.includes(k),state+' uses '+k);}
  assert.ok(manifest.states.chase.danger>(manifest.states.explore.danger||0));assert.ok(manifest.fades['*>chase']<manifest.fades['chase>*'],'danger arrives fast and leaves slowly');
});
test('all stems start on the same sample, loop, and fade toward each state mix',async()=>{
  const ctx=fakeContext(),m=new EscapeMusic({fetch:fakeFetch(),canPlay:t=>t.includes('ogg')});assert.equal(await m.load(ctx),true);assert.equal(m.layers.size,5);
  m.setState('explore',0);assert.equal(m.start(),true);assert.equal(new Set(ctx.sources.map(s=>s.startedAt)).size,1,'one shared start time');assert.ok(ctx.sources.every(s=>s.loop&&s.loopEnd===8));
  assert.equal(m.layers.get('mystery').gain.gain.value,manifest.states.explore.mystery);assert.equal(m.layers.get('danger').gain.gain.value,0);
  m.setState('chase',1);const ramp=m.layers.get('danger').gain.gain.events.at(-1);assert.equal(ramp[0],1);assert.ok(Math.abs(ramp[1]-ctx.currentTime-manifest.fades['*>chase'])<1e-9);
});
test('chase music holds briefly instead of pumping, but a capture or escape cuts through',async()=>{
  const m=new EscapeMusic({fetch:fakeFetch(),canPlay:()=>true});await m.load(fakeContext());m.start();m.setState('chase',5);
  assert.equal(m.setState('explore',6),false,'held');assert.equal(m.state,'chase');assert.equal(m.setState('explore',8),true);
  m.setState('chase',9);assert.equal(m.setState('caught',9.1),true);
});
test('missing stems or a missing manifest leave the game silent rather than broken',async()=>{
  const partial=new EscapeMusic({fetch:fakeFetch(['danger']),canPlay:()=>true});assert.equal(await partial.load(fakeContext()),true);assert.equal(partial.layers.has('danger'),false);partial.start();partial.setState('chase',0);
  const none=new EscapeMusic({fetch:async()=>({ok:false})});assert.equal(await none.load(fakeContext()),false);assert.equal(none.start(),false);none.setState('chase',0);
});
test('the music state follows the game: explore, tension, chase, victory and caught',()=>{
  const s=EscapeMusic.stateFor,h=state=>({state});
  assert.equal(s({screen:'menu'}),'menu');assert.equal(s({screen:'world'}),'world');
  assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('patrol')]}}),'explore');assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('alert')]}}),'tension');
  assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('patrol'),h('chase')]}}),'chase');assert.equal(s({screen:'game',game:{status:'playing',hunters:[],hawk:{state:'dive'}}}),'chase');
  assert.equal(s({screen:'game',game:{status:'won',hunters:[]}}),'victory');assert.equal(s({screen:'game',game:{status:'caught',hunters:[]}}),'caught');
});
function wav(file,frames,{rate=44100,channels=2,fn=i=>Math.sin(2*Math.PI*i/100)*.4}={}){const data=Buffer.alloc(frames*channels*2);for(let i=0;i<frames;i++)for(let c=0;c<channels;c++)data.writeInt16LE(Math.round(fn(i)*32767),(i*channels+c)*2);
  const h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(36+data.length,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(channels,22);h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*channels*2,28);h.writeUInt16LE(channels*2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(data.length,40);fs.writeFileSync(file,Buffer.concat([h,data]));}
test('the stem checker finds loop versions, demands sample-exact lengths and whole bars, and flags clicks',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'stems-')),bar=44100*2;// 2 s bars at 120 BPM in 4/4
  for(const n of ['Ambient','Mysterious','Intrigue','Danger','Melodic']){wav(path.join(dir,'Find_Him_'+n+'_Loop.wav'),bar*2);wav(path.join(dir,'Find_Him_'+n+'.wav'),1000);}
  fs.writeFileSync(path.join(dir,'License.txt'),'CC0');
  const config={match:'find_him',prefer:'loop',layers:{ambient:'ambient',mystery:'myster',intrigue:'intrigue',danger:'danger',melodic:'melodic'}};
  const {layers,licence}=plan(dir,config);assert.equal(Object.keys(layers).length,5);assert.ok(Object.values(layers).every(f=>/_Loop\.wav$/.test(f)));assert.match(licence,/License/);
  const good=verify(layers,{bpm:120,beatsPerBar:4});assert.deepEqual(good.problems,[]);assert.equal(good.bars,2);assert.equal(readWav(layers.ambient).frames,bar*2);
  wav(layers.danger,bar*2+441);assert.ok(verify(layers,{}).problems.some(p=>/danger is 441 samples off/.test(p)));
  wav(layers.danger,bar*2,{fn:i=>i<bar*2-1?0:.9});assert.ok(verify(layers,{}).problems.some(p=>/seam/.test(p)));
  wav(layers.danger,bar*2);assert.ok(verify(layers,{bpm:100}).problems.some(p=>/not a whole number/.test(p)));
});
test('an unbuilt manifest (no loop length yet) loads nothing and requests no stems',async()=>{const asked=[];const m=new EscapeMusic({fetch:async url=>{asked.push(url);return {ok:true,json:async()=>manifest};}});assert.equal(await m.load(fakeContext()),false);assert.deepEqual(asked,['audio/music/manifest.json']);});
