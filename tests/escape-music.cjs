const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeMusic}=require('../public/escape-music.js');
const {MOODS,MIX,FADES,LAYERS,THEME_MOOD,STYLES,events,stinger,melody,styleFor,midi}=EscapeMusic;

// A stand-in for Tone.js: every node connects, every voice records what it plays.
function fakeTone(){
  const played=[],params=[];let now=0;
  const param=value=>{const p={value,ramps:[],cancelAndHoldAtTime(){},linearRampToValueAtTime(v,t){p.ramps.push([v,t]);p.value=v;},rampTo(v){p.value=v;}};params.push(p);return p;};
  class Node{constructor(o){this.gain=param(typeof o==='object'?o.gain:o);this.volume={value:0};this.ready=Promise.resolve();}connect(){return this;}toDestination(){return this;}start(){return this;}
    triggerAttackRelease(...a){played.push({voice:this,args:a});}}
  const transport={bpm:{value:0},repeat:null,scheduleRepeat(fn){this.repeat=fn;},start(){}};
  const context={get currentTime(){return now;},transport};
  const T={getContext:()=>context,setContext(){},Gain:Node,Reverb:Node,Filter:Node,PolySynth:Node,Synth:Node,MonoSynth:Node,FMSynth:Node,NoiseSynth:Node,MembraneSynth:Node,Tremolo:Node,Vibrato:Node,Limiter:Node};
  return {T,played,transport,setNow:t=>now=t};
}
const pitch=n=>((n%12)+12)%12;

test('every mood has a four-bar progression and a melody that stays in its scale and resolves home',()=>{
  for(const [name,mood] of Object.entries(MOODS)){
    assert.equal(mood.chords.length,4);assert.equal(mood.bass.length,4);assert.equal(mood.fifth.length,4);
    const scale=new Set(mood.scale.map(n=>pitch(midi(n)))),tune=melody(name);assert.equal(tune.length,8);
    for(const bar of tune){assert.equal(bar.length,8);for(const n of bar)if(n!=null)assert.ok(scale.has(pitch(n)),name+' plays outside its scale');}
    assert.equal(tune[3][4],midi(mood.scale[0]),name+' phrase ends on the tonic');assert.deepEqual(melody(name),tune,'the tune is the same every time');
  }
});
test('the score keeps time: chords on the bar, a walking bass on the beat, drums on a fixed pattern',()=>{
  const bar=[...Array(16)].map((_,s)=>events('sneaky',16+s)),at=(layer,voice)=>bar.map((e,s)=>e.some(x=>x.layer===layer&&x.voice===voice)?s:-1).filter(s=>s>=0);
  assert.deepEqual(at('pad','pad'),[0]);assert.deepEqual(at('bass','bass'),[0,4,8,12]);assert.deepEqual(at('chase','kick'),[0,6,8]);assert.deepEqual(at('chase','snare'),[4,12]);
  const chord=bar[0].find(e=>e.voice==='pad').notes,second=MOODS.sneaky.chords[1].map(midi);assert.deepEqual(chord,second,'step 16 is the second chord');
  for(let step=0;step<256;step++)for(const e of events('dark',step)){assert.ok(LAYERS.includes(e.layer));assert.ok(e.vel>0&&e.vel<=1);}
});
test('each state has a mix of known layers; danger comes in fast and leaves slowly',()=>{
  for(const state of ['menu','world','explore','tension','chase','victory','caught']){assert.ok(MIX[state],state);for(const [k,v] of Object.entries(MIX[state])){assert.ok(LAYERS.includes(k),state+' uses '+k);assert.ok(v>0&&v<=1);}}
  assert.ok(MIX.chase.chase>0&&!MIX.explore.chase);assert.ok(MIX.tension.tension>0&&!MIX.explore.tension);assert.ok(FADES['*>chase']<FADES['chase>*']);
  for(const theme of Object.values(THEME_MOOD))assert.ok(MOODS[theme]);
  assert.ok(stinger('meadow','victory').at(-1).note>stinger('meadow','victory')[0].note,'victory rises');assert.ok(stinger('dark','caught').at(-1).note<stinger('dark','caught')[0].note,'caught falls');
});
test('the player fades layers to each state, holds a chase briefly, and silent layers play nothing',async()=>{
  const {T,played,transport,setNow}=fakeTone(),m=new EscapeMusic({Tone:T});assert.equal(await m.load({}),true);m.setState('explore',0);assert.equal(m.start(),true);assert.equal(transport.bpm.value,EscapeMusic.BPM);
  assert.deepEqual(m.layers.get('bass').gain.gain.ramps.at(-1)[0],MIX.explore.bass);assert.equal(m.layers.get('chase').gain.gain.ramps.at(-1)[0],0);
  setNow(10);for(let i=0;i<16;i++)transport.repeat(10+i*.15);assert.ok(played.length>0);assert.ok(played.every(p=>p.voice!==m.voices.kick),'chase drums stay silent while exploring');
  m.setState('chase',5);assert.equal(m.setState('explore',6),false,'held');assert.equal(m.state,'chase');assert.equal(m.setState('explore',8),true);
  m.setState('chase',9);assert.equal(m.setState('caught',9.1),true,'a capture cuts through');assert.ok(played.some(p=>p.voice===m.voices.sting),'caught plays a stinger');
});
test('a new mood waits for the next bar, then starts its tune from the top',async()=>{
  const {T,transport}=fakeTone(),m=new EscapeMusic({Tone:T});await m.load({});m.setState('explore',0);m.start();
  for(let i=0;i<5;i++)transport.repeat(i);assert.equal(m.setMood('dark'),true);assert.equal(m.mood,'meadow');
  while(m.step%16!==0)transport.repeat(0);assert.equal(m.mood,'meadow');transport.repeat(0);assert.equal(m.mood,'dark');assert.equal(m.step,1);assert.equal(m.setMood('dark'),false);
});
test('without Tone.js the game stays silent rather than broken',async()=>{const m=new EscapeMusic({Tone:null});m.Tone=null;assert.equal(await m.load({}),false);assert.equal(m.start(),false);m.setState('chase',0);m.setVolume(.5,false);});
test('the music state follows the game: explore, tension, chase, victory and caught',()=>{
  const s=EscapeMusic.stateFor,h=state=>({state});
  assert.equal(s({screen:'menu'}),'menu');assert.equal(s({screen:'world'}),'world');
  assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('patrol')]}}),'explore');assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('alert')]}}),'tension');
  assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('patrol'),h('chase')]}}),'chase');assert.equal(s({screen:'game',game:{status:'playing',hunters:[],hawk:{state:'dive'}}}),'chase');
  assert.equal(s({screen:'game',game:{status:'won',hunters:[]}}),'victory');assert.equal(s({screen:'game',game:{status:'caught',hunters:[]}}),'caught');
});
test('every region has its own style, and every escape in a region its own tune, key or groove',()=>{
  const {EscapeWorld}=require('../public/escape-world.js');
  for(const c of EscapeWorld.chapters){assert.ok(STYLES[c.theme],c.theme+' has a style');
    const tunes=new Set();for(let i=0;i<c.end-c.start;i++){const st=styleFor(c.theme,i);assert.ok(MOODS[st.mood]);assert.ok(Math.abs(st.transpose)<=7);assert.ok(st.bpm>=72&&st.bpm<=120);
      tunes.add(JSON.stringify([melody(st.mood,st.seed),st.transpose,st.groove]));}
    assert.equal(tunes.size,c.end-c.start,c.name+' repeats a tune');}
  const leads=new Set(Object.values(STYLES).map(s=>s.lead)),moods=new Set(Object.values(STYLES).map(s=>s.mood));assert.ok(leads.size>=4&&moods.size>=8,'regions differ in lead and harmony');
  const lifted=events('meadow',0,{transpose:2}).find(e=>e.voice==='pad').notes,plain=events('meadow',0).find(e=>e.voice==='pad').notes;assert.deepEqual(lifted,plain.map(n=>n+2),'a key shift moves the harmony');
  const lead=events('river',0,{lead:'flute'}).find(e=>e.layer==='melody');assert.ok(!lead||lead.voice==='flute');
  const swung=[...Array(16)].map((_,s)=>events('meadow',s,{groove:2})).map((e,s)=>e.some(x=>x.voice==='bass')?s:-1).filter(s=>s>=0);assert.deepEqual(swung,[0,6,8,14]);
});
test('a chase lands hard: an alarm hit and a faster tempo, which settles when it ends',async()=>{
  const {T,played,transport}=fakeTone(),m=new EscapeMusic({Tone:T});await m.load({});m.setStyle(styleFor('ruins',1));m.setState('explore',0);m.start();
  const base=transport.bpm.value;assert.equal(base,styleFor('ruins',1).bpm);m.setState('chase',1);
  assert.ok(played.some(p=>p.voice===m.voices.boom)&&played.some(p=>p.voice===m.voices.alarm),'alarm plays');assert.ok(transport.bpm.value>base*1.15,'tempo lifts');
  m.setState('explore',9);assert.equal(transport.bpm.value,base,'tempo settles');
});
test('a new escape style waits for the phrase, then takes its own tempo',async()=>{
  const {T,transport}=fakeTone(),m=new EscapeMusic({Tone:T});await m.load({});m.setState('explore',0);m.start();transport.repeat(0);
  assert.equal(m.setStyle(styleFor('frost',2)),true);assert.equal(m.setStyle(styleFor('frost',2)),false,'same style is a no-op');assert.equal(m.mood,'meadow');
  while(m.step%16!==0)transport.repeat(0);transport.repeat(0);assert.equal(m.mood,'frost');assert.equal(transport.bpm.value,styleFor('frost',2).bpm);
});
