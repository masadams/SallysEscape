const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeMusic}=require('../public/escape-music.js');
const {EscapeAmbience}=require('../public/escape-ambience.js');
const EscapeAudio=require('../public/escape-audio.js');
const {EscapeWorld}=require('../public/escape-world.js');
const {EscapeCatalog,escapeBuildCustom}=require('../public/escape-levels.js');
const {EscapeAdventure}=require('../public/escape-engine.js');
const {STYLES,MOODS,events,flavorFor,cue}=EscapeMusic;

test('nearly every region has its own harmony, and every secret spot and the finale a theme',()=>{
  const moods=EscapeWorld.chapters.map(c=>STYLES[c.theme].mood);
  assert.ok(new Set(moods).size>=moods.length-1,'only the two spooky regions share a mood: '+moods.join(','));
  for(const l of EscapeCatalog.hidden)if(l.secret)assert.ok(STYLES['secret:'+l.secret],l.secret+' has a theme');
  assert.ok(STYLES.finale&&MOODS.finale);for(const st of Object.values(STYLES))assert.ok(MOODS[st.mood],st.mood);
});

test('a chase sounds like what is chasing: heavy stomps, small things skitter, flyers swoop',()=>{
  assert.equal(flavorFor({hunters:[{kind:'beetle',state:'charge'}]}),'heavy');
  assert.equal(flavorFor({hunters:[{kind:'spider',state:'chase'}]}),'skitter');
  assert.equal(flavorFor({hunters:[{kind:'snake',state:'patrol'}],hawk:{state:'dive'}}),'swoop');
  assert.equal(flavorFor({hunters:[{kind:'snake',state:'chase'}]}),null);
  const voices=flavor=>{const v=new Set();for(let s=0;s<64;s++)for(const e of events('meadow',s,{},flavor))if(e.layer==='chase')v.add(e.voice+':'+(s%16));return v;};
  const plain=voices(null),heavy=voices('heavy'),skitter=voices('skitter'),swoop=voices('swoop');
  assert.ok(heavy.has('tom:4')&&!plain.has('tom:4'),'heavy toms on the beat');
  assert.ok([...skitter].some(v=>v.startsWith('rimshot'))&&![...plain].some(v=>v.startsWith('rimshot')));
  assert.ok([...swoop].some(v=>v.startsWith('swoop')));
});

test('musical cues are short phrases built on the home chord',()=>{
  for(const kind of ['key','hatch','secret','area']){const n=cue('meadow',kind);assert.ok(n.length>=4,kind);assert.ok(n.every(x=>x.at<1.5&&x.dur>0&&x.vel<=.5));}
  assert.deepEqual(cue('meadow','nope'),[]);
});

// A pretend audio context: enough of Web Audio for the ambience to build and play its graph.
function fakeContext(){
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
  const node=extra=>({connect(){},disconnect(){},start(){},stop(){},...extra});
  const ctx={currentTime:0,sampleRate:8000,destination:{},made:0,
    createGain(){this.made++;return node({gain:param()});},createOscillator(){this.made++;return node({frequency:param(),type:'sine'});},
    createBufferSource(){this.made++;return node({buffer:null,loop:false,playbackRate:param()});},createBiquadFilter(){this.made++;return node({type:'',frequency:param(),Q:param()});},
    createStereoPanner(){this.made++;return node({pan:param()});},createBuffer(ch,len){return {getChannelData:()=>new Float32Array(len)};}};
  return ctx;
}
test('every area and secret spot has a soundscape, and it builds, switches and plays its calls',()=>{
  const {SCAPES,BEDS}=EscapeAmbience;
  for(const c of EscapeWorld.chapters)assert.ok(SCAPES[c.theme],c.theme+' has a soundscape');
  for(const l of EscapeCatalog.hidden)if(l.secret)assert.ok(SCAPES['secret:'+l.secret],l.secret);
  for(const s of Object.values(SCAPES))for(const [kind] of s.beds)assert.ok(BEDS[kind],kind);
  const ctx=fakeContext(),a=new EscapeAmbience();assert.equal(a.start(ctx),true);a.setVolume(.3);
  const realTimeout=global.setTimeout;global.setTimeout=()=>0;
  try{for(const key of Object.keys(SCAPES)){assert.equal(a.setScape(key),true);ctx.currentTime+=30;a.tick();}
    for(const s of Object.values(SCAPES))for(const [kind] of s.calls)a.call(kind,.3,0);}finally{global.setTimeout=realTimeout;}
  assert.ok(ctx.made>200);assert.equal(a.setScape(a.key),false,'the same scape twice does nothing');
});

test('the weather stays on the world map: inside an escape only the place\'s own sounds play',()=>{
  const {SCAPES,WEATHER,scapeFor}=EscapeAmbience;
  for(const key of Object.keys(SCAPES)){const level=scapeFor(key,'level'),world=scapeFor(key,'world');
    assert.ok(level.beds.every(([k])=>!WEATHER.has(k)),key+' has no weather in an escape');
    assert.equal(level.calls.length,SCAPES[key].calls.length,key+' keeps its calls');
    for(const [k,l] of world.beds){const base=SCAPES[key].beds.find(b=>b[0]===k)[1];assert.ok(WEATHER.has(k)?l<base*.46&&l>base*.42:l===base,key+' '+k);}}
  assert.equal(scapeFor('storm','level').beds.length,0,'no rain or wind inside a storm escape');
  const a=new EscapeAmbience();a.start(fakeContext());assert.equal(a.setScape('storm','world'),true);assert.equal(a.setScape('storm','level'),true,'entering an escape switches the scape');
  assert.equal(a.setScape('storm','level'),false);
});

test('every sound trim names a real sound, and the new throws and crawl have sounds',()=>{
  for(const k of Object.keys(EscapeAudio.TRIM))assert.ok(EscapeAudio.recipes.includes(k),k);
  for(const k of ['crawl','toss','clack','glow'])assert.ok(EscapeAudio.recipes.includes(k),k);
});

test('a creature sound carries where it happened, so it can be panned and faded with distance',()=>{
  const g=new EscapeAdventure({level:escapeBuildCustom({id:'s',name:'s',brief:'',guards:[{kind:'mimic',spawn:[3,1],facing:0,patrol:[[3,1]]}],map:['##########','#@......K#','#X.......#','##########']})});
  g.player.x=2.2;for(let i=0;i<10;i++)g.advance(1/120,{x:0,y:1});
  const ev=g.drainEvents();assert.ok(ev.includes('rustle'));assert.ok(Math.abs(g.lastEventAt.rustle.x-3.5)<.01);
  g.drainEvents();assert.equal(g.lastEventAt.rustle,undefined,'positions clear with their events');
});
