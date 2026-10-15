const test=require('node:test'),assert=require('node:assert/strict');
const {EscapeMusic}=require('../public/escape-music.js');
const {MOODS,MIX,FADES,LAYERS,THEME_MOOD,events,stinger,melody,midi}=EscapeMusic;

// A stand-in for Tone.js: every node connects, every voice records what it plays.
function fakeTone(){
  const played=[],params=[];let now=0;
  const param=value=>{const p={value,ramps:[],cancelAndHoldAtTime(){},linearRampToValueAtTime(v,t){p.ramps.push([v,t]);p.value=v;},rampTo(v){p.value=v;}};params.push(p);return p;};
  class Node{constructor(o){this.gain=param(typeof o==='object'?o.gain:o);this.volume={value:0};this.ready=Promise.resolve();}connect(){return this;}toDestination(){return this;}start(){return this;}
    triggerAttackRelease(...a){played.push({voice:this,args:a});}}
  const transport={bpm:{value:0},repeat:null,scheduleRepeat(fn){this.repeat=fn;},start(){}};
  const context={get currentTime(){return now;},transport};
  const T={getContext:()=>context,setContext(){},Gain:Node,Reverb:Node,Filter:Node,PolySynth:Node,Synth:Node,MonoSynth:Node,FMSynth:Node,NoiseSynth:Node,MembraneSynth:Node,Tremolo:Node,Limiter:Node};
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
test('a new mood waits for the next four-bar phrase',async()=>{
  const {T,transport}=fakeTone(),m=new EscapeMusic({Tone:T});await m.load({});m.setState('explore',0);m.start();
  for(let i=0;i<5;i++)transport.repeat(i);assert.equal(m.setMood('dark'),true);assert.equal(m.mood,'meadow');
  while(m.step%64!==0)transport.repeat(0);assert.equal(m.mood,'meadow');transport.repeat(0);assert.equal(m.mood,'dark');assert.equal(m.setMood('dark'),false);
});
test('without Tone.js the game stays silent rather than broken',async()=>{const m=new EscapeMusic({Tone:null});m.Tone=null;assert.equal(await m.load({}),false);assert.equal(m.start(),false);m.setState('chase',0);m.setVolume(.5,false);});
test('the music state follows the game: explore, tension, chase, victory and caught',()=>{
  const s=EscapeMusic.stateFor,h=state=>({state});
  assert.equal(s({screen:'menu'}),'menu');assert.equal(s({screen:'world'}),'world');
  assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('patrol')]}}),'explore');assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('alert')]}}),'tension');
  assert.equal(s({screen:'game',game:{status:'playing',hunters:[h('patrol'),h('chase')]}}),'chase');assert.equal(s({screen:'game',game:{status:'playing',hunters:[],hawk:{state:'dive'}}}),'chase');
  assert.equal(s({screen:'game',game:{status:'won',hunters:[]}}),'victory');assert.equal(s({screen:'game',game:{status:'caught',hunters:[]}}),'caught');
});
