// Ambience: a soundscape under the music for every area. Each one is a bed or two of shaped noise
// (a breeze, a stream, surf, rain, a cave's low rumble, steam's hiss) and calls that come now and
// then (birdsong, frogs, drips, thunder, ice creaking), all synthesised, so there are no files.
// The scene picks a scape and a level; beds crossfade when the scape changes. The world map
// carries the weather (wind, rain, surf); inside an escape the weather drops away and only the
// place's own sounds stay, softer and sparser, so they never compete with sneaking.
(function(root){
  // beds: [kind, level]; calls: [kind, [min s, max s] between, level].
  const SCAPES={
    // Winter keeps a hush of falling snow even inside an escape, with the village's own sounds:
    // fires crackling, snow sliding off branches, a sleigh passing, a carol far away, the pond's ice.
    'winter-village':{beds:[['breeze',.2],['snowhush',.32],['hearth',.18]],calls:[['jingle',[8,15],.18],['crackle',[4,8],.16],['snowslide',[9,16],.2],['carol',[22,36],.14],['sleighpass',[26,40],.16]]},
    'winter-ice':{beds:[['icewind',.18],['snowhush',.3]],calls:[['tinkle',[6,11],.14],['icegroan',[9,16],.24],['creak',[12,20],.16],['windchime',[14,24],.12]]},
    'winter-workshop':{beds:[['breeze',.1],['hearth',.3]],calls:[['clank',[6,11],.14],['crackle',[3,6],.18],['jingle',[12,20],.14],['carol',[24,38],.12]]},
    'winter-night':{beds:[['icewind',.24],['snowhush',.36]],calls:[['owl',[12,20],.14],['snowslide',[8,14],.18],['jingle',[16,26],.1],['windchime',[12,22],.12]]},
    'winter-finale':{beds:[['breeze',.17],['snowhush',.3],['hearth',.12]],calls:[['jingle',[6,12],.18],['tinkle',[10,18],.1],['carol',[16,26],.16],['sleighpass',[20,32],.16],['crackle',[5,9],.12]]},
    // Spring: rain on the glass, birds and bees in the garden, frogs at the pond, a cuckoo at dusk.
    'spring-garden':{beds:[['breeze',.3],['drizzle',.12]],calls:[['bird',[3,6],.4],['bee',[8,14],.26],['cuckoo',[16,26],.16],['drip',[6,11],.18]]},
    'spring-shed':{beds:[['drizzle',.26]],calls:[['drip',[3,6],.3],['creak',[9,16],.16],['bird',[8,14],.24],['clank',[18,28],.08]]},
    'spring-pond':{beds:[['stream',.35],['drizzle',.1]],calls:[['frog',[3,7],.4],['bird',[6,11],.3],['plip',[4,8],.24]]},
    'spring-glass':{beds:[['drizzle',.32]],calls:[['drip',[2,5],.3],['windchime',[10,18],.12],['bird',[9,15],.2]]},
    'spring-dusk':{beds:[['insects',.18],['drizzle',.14]],calls:[['cuckoo',[10,18],.18],['owl',[14,22],.14],['frog',[6,11],.24],['drip',[5,9],.2]]},
    // Summer: the shore never quite stops, gulls, a buoy bell, rigging, splashes, cicadas in the dunes.
    'summer-dunes':{beds:[['hotwind',.28],['shore',.28],['cicada',.14]],calls:[['gull',[6,12],.26],['bird',[8,14],.2]]},
    'summer-pools':{beds:[['shore',.34]],calls:[['plip',[3,6],.26],['gull',[7,13],.24],['click',[6,11],.18]]},
    'summer-tide':{beds:[['surf',.4],['shore',.3]],calls:[['gull',[6,12],.26],['plip',[4,8],.22],['buoy',[12,20],.16]]},
    'summer-harbour':{beds:[['breeze',.25],['shore',.26]],calls:[['buoy',[8,14],.2],['rigging',[6,11],.18],['gull',[5,10],.26],['clank',[14,22],.1]]},
    'summer-lagoon':{beds:[['stream',.28],['cicada',.16]],calls:[['frog',[5,9],.3],['bird',[5,10],.3],['plip',[6,10],.2]]},
    'summer-boatshed':{beds:[['shore',.22]],calls:[['rigging',[5,9],.2],['creak',[8,14],.16],['clank',[10,16],.12],['gull',[12,20],.16]]},
    'summer-sunset':{beds:[['shore',.3],['insects',.12]],calls:[['gull',[10,18],.18],['buoy',[10,18],.16],['cricket',[6,11],.18]]},
    'summer-lighthouse':{beds:[['surf',.35],['shore',.3]],calls:[['buoy',[7,13],.2],['gull',[5,10],.26],['rigging',[9,15],.14]]},
    autumn:{beds:[['breeze',.4]],calls:[['crow',[12,20],.18],['creak',[8,15],.16]]},
    'autumn-dusk':{beds:[['breeze',.25],['insects',.14]],calls:[['creak',[10,17],.18],['chime',[14,22],.14]]},
    'autumn-night':{beds:[['wind',.2],['insects',.15]],calls:[['owl',[12,20],.17],['chime',[13,21],.15]]},
    'autumn-mill':{beds:[['stream',.4],['breeze',.2]],calls:[['creak',[8,13],.2],['crow',[15,23],.13]]},
    'autumn-festival':{beds:[['breeze',.3]],calls:[['chime',[7,14],.18],['cricket',[12,20],.15]]},
    meadow:{beds:[['breeze',.5]],calls:[['bird',[3,7],.5],['cricket',[7,13],.22]]},
    garden:{beds:[['breeze',.4]],calls:[['bird',[3,6],.45],['bee',[8,14],.3]]},
    river:{beds:[['stream',.6]],calls:[['frog',[3,7],.5],['bird',[8,14],.3]]},
    ruins:{beds:[['wind',.4]],calls:[['drip',[4,9],.35],['crow',[10,18],.3]]},
    quarry:{beds:[['wind',.5]],calls:[['pebbles',[5,10],.4],['drip',[6,12],.3]]},
    desert:{beds:[['hotwind',.5]],calls:[['rattle',[8,15],.3],['hawkcry',[12,22],.25]]},
    marsh:{beds:[['stream',.35],['insects',.25]],calls:[['frog',[2,5],.55],['owl',[12,20],.3]]},
    jungle:{beds:[['insects',.4],['rain',.18]],calls:[['bird',[2,5],.45],['frog',[6,11],.3]]},
    glow:{beds:[['cave',.5]],calls:[['drip',[2,5],.45],['shimmer',[6,12],.3]]},
    orchard:{beds:[['breeze',.45]],calls:[['bird',[3,6],.45],['bee',[6,12],.35]]},
    coast:{beds:[['surf',.6]],calls:[['gull',[5,10],.4]]},
    hollow:{beds:[['wind',.35]],calls:[['creak',[5,10],.4],['owl',[10,18],.35]]},
    lantern:{beds:[['insects',.25],['stream',.25]],calls:[['owl',[6,12],.4],['frog',[5,9],.35]]},
    rooftops:{beds:[['hotwind',.35]],calls:[['bird',[5,10],.35],['hawkcry',[10,18],.3]]},
    ants:{beds:[['hotwind',.3],['scuttle',.3]],calls:[['click',[2,5],.3]]},
    frost:{beds:[['icewind',.5]],calls:[['creak',[6,12],.35],['tinkle',[4,8],.35]]},
    vents:{beds:[['hiss',.4],['hum',.35]],calls:[['clank',[4,9],.4],['bubble',[5,10],.3]]},
    grotto:{beds:[['cave',.55]],calls:[['drip',[2,4],.45],['bubble',[6,12],.3]]},
    storm:{beds:[['rain',.5],['wind',.35]],calls:[['thunder',[9,18],.6]]},
    tide:{beds:[['surf',.5]],calls:[['bubble',[4,8],.3],['gull',[8,16],.3]]},
    home:{beds:[['breeze',.45]],calls:[['bird',[3,6],.5],['cricket',[8,14],.25]]},
    gilded:{beds:[['cave',.35]],calls:[['tinkle',[3,6],.4],['shimmer',[6,10],.35]]},
    finale:{beds:[['breeze',.4]],calls:[['bird',[2,5],.5],['shimmer',[10,16],.25]]},
    'secret:star-garden':{beds:[['breeze',.25]],calls:[['shimmer',[2,5],.45],['cricket',[6,10],.2]]},
    'secret:cloud-nest':{beds:[['icewind',.25]],calls:[['shimmer',[3,6],.35],['bird',[5,9],.35]]},
    'secret:mossy-well':{beds:[['cave',.45]],calls:[['drip',[1.5,4],.5]]},
    'secret:challenge-shrine':{beds:[['wind',.3]],calls:[['chime',[5,9],.4]]},
    'secret:bestiary-grove':{beds:[['insects',.3],['breeze',.3]],calls:[['bird',[2,5],.45],['frog',[6,10],.3]]},
    'secret:ice-cave':{beds:[['icewind',.4]],calls:[['tinkle',[2,5],.4],['creak',[7,12],.3]]},
    'secret:sunken-wreck':{beds:[['surf',.35],['cave',.3]],calls:[['creak',[4,8],.4],['bubble',[3,6],.35]]},
    'secret:blind-grove':{beds:[['breeze',.2],['insects',.15]],calls:[['cricket',[5,9],.2],['shimmer',[6,11],.3]]},
    'secret:magpie-roost':{beds:[['wind',.3]],calls:[['bird',[2,5],.45],['tinkle',[4,8],.35]]},
    'secret:far-coast':{beds:[['surf',.4],['wind',.25]],calls:[['bird',[3,7],.35],['creak',[6,10],.25]]}
  };
  // How each bed is shaped: a noise filter, and a slow swell (rate in Hz, depth 0–1).
  const BEDS={
    breeze:{filter:'bandpass',freq:600,q:.5,rate:.12,depth:.5,gain:.5},
    wind:{filter:'bandpass',freq:380,q:.8,rate:.08,depth:.7,gain:.7},
    hotwind:{filter:'bandpass',freq:900,q:.4,rate:.1,depth:.5,gain:.4},
    icewind:{filter:'bandpass',freq:1800,q:2.2,rate:.15,depth:.6,gain:.45},
    stream:{filter:'bandpass',freq:2600,q:.35,rate:1.3,depth:.15,gain:.35},
    surf:{filter:'lowpass',freq:700,q:.5,rate:.09,depth:.9,gain:.9},
    rain:{filter:'highpass',freq:3000,q:.5,rate:.05,depth:.1,gain:.3},
    insects:{filter:'bandpass',freq:5600,q:6,rate:7,depth:.4,gain:.35},
    cave:{filter:'lowpass',freq:240,q:.7,rate:.06,depth:.3,gain:1.2},
    hiss:{filter:'highpass',freq:4200,q:.5,rate:.3,depth:.5,gain:.25},
    scuttle:{filter:'bandpass',freq:3000,q:3,rate:11,depth:.6,gain:.35},
    hum:{tone:[55,110],gain:.25},
    // Beds that stay on inside an escape: the hush of snow, a hearth's flicker, light rain, soft waves, cicadas.
    snowhush:{filter:'lowpass',freq:900,q:.4,rate:.05,depth:.4,gain:.35},
    hearth:{filter:'bandpass',freq:1300,q:.6,rate:9,depth:.7,gain:.12},
    drizzle:{filter:'highpass',freq:4500,q:.4,rate:.2,depth:.3,gain:.2},
    shore:{filter:'lowpass',freq:520,q:.5,rate:.11,depth:.85,gain:.5},
    cicada:{filter:'bandpass',freq:4200,q:9,rate:14,depth:.5,gain:.22}
  };
  // Weather beds: heard on the world map (at under half their full level), never inside an escape.
  const WEATHER=new Set(['breeze','wind','hotwind','icewind','rain','surf']),WEATHER_TRIM=.44;
  // What a scape sounds like on the map ('world') or inside an escape ('level').
  function scapeFor(key,place='world'){
    const s=SCAPES[key];if(!s)return null;
    if(place!=='level')return {beds:s.beds.map(([k,l])=>[k,WEATHER.has(k)?+(l*WEATHER_TRIM).toFixed(3):l]),calls:s.calls};
    return {beds:s.beds.filter(([k])=>!WEATHER.has(k)).map(([k,l])=>[k,+(l*.75).toFixed(3)]),calls:s.calls.map(([k,[a,b],l])=>[k,[a*1.3,b*1.3],+(l*.85).toFixed(3)])};
  }
  const rand=(a,b)=>a+Math.random()*(b-a);
  class EscapeAmbience{
    constructor(){this.ctx=null;this.master=null;this.beds=[];this.calls=[];this.key=null;this.place='world';this.volume=0;this.noise=null;}
    start(ctx){
      if(this.ctx||!ctx?.createGain)return Boolean(this.ctx);
      this.ctx=ctx;this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);
      const n=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),d=n.getChannelData(0);let seed=11;for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=seed/1073741823.5-1;}
      this.noise=n;return true;
    }
    // Switch soundscapes: the old beds fade out over two seconds as the new ones fade in.
    setScape(key,place='world'){
      this.wanted=[key,place];if(this.silent)return false; // Silenced: nothing runs until the volume comes back.
      if(!this.ctx||(key===this.key&&place===this.place))return false;this.key=key;this.place=place;const scape=scapeFor(key,place),t=this.ctx.currentTime;
      for(const b of this.beds){b.gain.gain.cancelScheduledValues(t);b.gain.gain.setValueAtTime(b.gain.gain.value,t);b.gain.gain.linearRampToValueAtTime(0,t+2);for(const s of b.sources)try{s.stop(t+2.1);}catch(_){}}
      this.beds=[];this.calls=(scape?.calls||[]).map(([kind,every,level])=>({kind,every,level,next:t+rand(1,every[1])}));
      for(const [kind,level] of scape?.beds||[])this.beds.push(this.bed(kind,level,t));
      return true;
    }
    bed(kind,level,t){
      const spec=BEDS[kind],ctx=this.ctx,gain=ctx.createGain(),sources=[];gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level*spec.gain,t+2);gain.connect(this.master);
      if(spec.tone){for(const f of spec.tone){const o=ctx.createOscillator();o.frequency.value=f;o.connect(gain);o.start(t);sources.push(o);}return {gain,sources};}
      const src=ctx.createBufferSource();src.buffer=this.noise;src.loop=true;src.playbackRate.value=rand(.97,1.03);
      const filter=ctx.createBiquadFilter();filter.type=spec.filter;filter.frequency.value=spec.freq;filter.Q.value=spec.q;
      // The swell: a slow oscillator nudging the level up and down around its middle.
      const swell=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();swell.gain.value=1-spec.depth/2;lfo.frequency.value=spec.rate*rand(.85,1.15);depth.gain.value=spec.depth/2;
      lfo.connect(depth);depth.connect(swell.gain);src.connect(filter);filter.connect(swell);swell.connect(gain);src.start(t,Math.random()*3);lfo.start(t);sources.push(src,lfo);
      return {gain,sources};
    }
    // Level 0–1 (the game's sound volume, ducked during chases and when paused).
    // Level 0 really stops the soundscape: its looping beds and swells are torn down, not left playing
    // silently, and they are rebuilt when the volume comes back.
    setVolume(volume){if(!this.master)return;const t=this.ctx.currentTime,g=this.master.gain;
      if(volume<=.001){if(!this.silent){this.silent=true;for(const b of this.beds)for(const s of b.sources)try{s.stop(t+1.5);}catch(_){}this.beds=[];this.calls=[];this.key=null;}if(this.volume!==0){this.volume=0;g.cancelScheduledValues(t);g.setTargetAtTime(0,t,.4);}return;}
      if(Math.abs(volume-this.volume)<.005&&!this.silent)return;const wake=this.silent;this.silent=false;this.volume=volume;g.cancelScheduledValues(t);g.setTargetAtTime(volume,t,.4);
      if(wake&&this.wanted)this.setScape(...this.wanted);}
    // Calls due now play, each panned a little to one side.
    tick(){
      if(!this.ctx||this.volume<=0.001)return;const t=this.ctx.currentTime;
      for(const c of this.calls)if(t>=c.next){c.next=t+rand(...c.every);this.call(c.kind,c.level,rand(-.7,.7));}
    }
    call(kind,level,pan){
      const ctx=this.ctx,t=ctx.currentTime+.02,out=ctx.createGain(),panner=ctx.createStereoPanner?ctx.createStereoPanner():null;out.gain.value=level;
      if(panner){panner.pan.value=pan;out.connect(panner);panner.connect(this.master);}else out.connect(this.master);
      const tone=(freq,to,start,dur,{type='sine',gain=.3,attack=.01,vib=0}={})=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t+start);if(to)o.frequency.exponentialRampToValueAtTime(to,t+start+dur);
        if(vib){const l=ctx.createOscillator(),d=ctx.createGain();l.frequency.value=vib;d.gain.value=freq*.03;l.connect(d);d.connect(o.frequency);l.start(t+start);l.stop(t+start+dur+.05);}
        g.gain.setValueAtTime(.0001,t+start);g.gain.exponentialRampToValueAtTime(gain,t+start+attack);g.gain.exponentialRampToValueAtTime(.0001,t+start+dur);o.connect(g);g.connect(out);o.start(t+start);o.stop(t+start+dur+.05);};
      const hush=(freq,start,dur,{filter='bandpass',q=1,gain=.3,to=null,attack=.005}={})=>{const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=this.noise;f.type=filter;f.Q.value=q;f.frequency.setValueAtTime(freq,t+start);if(to)f.frequency.exponentialRampToValueAtTime(to,t+start+dur);
        g.gain.setValueAtTime(.0001,t+start);g.gain.exponentialRampToValueAtTime(gain,t+start+attack);g.gain.exponentialRampToValueAtTime(.0001,t+start+dur);s.connect(f);f.connect(g);g.connect(out);s.start(t+start,Math.random()*3);s.stop(t+start+dur+.05);};
      const R=Math.random;
      switch(kind){
        case 'bird':{const n=2+Math.floor(R()*3),base=rand(2300,3200);for(let i=0;i<n;i++)tone(base*rand(.9,1.15),base*rand(1.2,1.5),i*.13,.09,{gain:.18});break;}
        case 'cricket':for(let k=0;k<2;k++)for(let i=0;i<4;i++)tone(4500,4300,k*.45+i*.05,.035,{gain:.08});break;
        case 'frog':for(let i=0;i<2;i++)tone(rand(95,130),80,i*.32,.22,{type:'square',gain:.07,vib:24});break;
        case 'drip':tone(rand(1500,2100),700,0,.09,{gain:.22});hush(4000,0,.03,{gain:.04});break;
        case 'crow':for(let i=0;i<2;i++)tone(620,430,i*.32,.24,{type:'sawtooth',gain:.05});break;
        case 'pebbles':for(let i=0;i<3+Math.floor(R()*3);i++)hush(rand(2500,4000),i*rand(.06,.12),.03,{q:5,gain:.18});break;
        case 'rattle':hush(5200,0,.6,{q:4,gain:.08,attack:.05});break;
        case 'hawkcry':tone(2300,1500,0,.65,{gain:.08,vib:9,attack:.03});break;
        case 'owl':tone(410,390,0,.32,{gain:.18,attack:.05});tone(360,330,.45,.5,{gain:.16,attack:.06});break;
        case 'shimmer':{const scale=[1568,1760,2093,2349,2637,3136];for(let i=0;i<4;i++)tone(scale[Math.floor(R()*scale.length)],null,i*.12,.5,{gain:.05,attack:.02});break;}
        case 'gull':for(let i=0;i<3;i++)tone(1350,950,i*.18,.14,{type:'sawtooth',gain:.035});break;
        case 'creak':tone(rand(80,100),rand(130,160),0,.7,{type:'sawtooth',gain:.05,attack:.1});break;
        case 'click':for(let i=0;i<3;i++)hush(6000,i*.05,.015,{q:8,gain:.12});break;
        case 'tinkle':for(let i=0;i<3;i++)tone(rand(3000,5200),null,i*rand(.08,.18),.25,{gain:.05});break;
        case 'clank':tone(300,290,0,.25,{type:'square',gain:.05});tone(437,420,0,.2,{type:'square',gain:.04});hush(1800,0,.08,{q:3,gain:.08});break;
        case 'bubble':for(let i=0;i<3;i++)tone(rand(250,400),rand(700,1000),i*rand(.06,.12),.06,{gain:.12});break;
        case 'thunder':hush(300,0,2.6,{filter:'lowpass',to:70,gain:.6,attack:.12});hush(900,.05,.4,{filter:'lowpass',to:200,gain:.25});break;
        case 'bee':tone(220,240,0,.7,{type:'sawtooth',gain:.03,vib:30,attack:.08});break;
        case 'jingle':for(let i=0;i<6;i++){tone(1900+i%3*370,null,i*.065,.12,{gain:.035});hush(6200,i*.065,.055,{gain:.025});}break;
        case 'crackle':for(let i=0;i<3+Math.floor(R()*4);i++)hush(rand(1800,4200),i*rand(.04,.14),.02,{q:4,gain:rand(.08,.18)});break;
        case 'icegroan':tone(rand(140,190),rand(48,60),0,1.4,{type:'sawtooth',gain:.05,attack:.2});tone(rand(900,1300),rand(300,400),.05,.5,{gain:.03});hush(300,0,1.2,{filter:'lowpass',to:90,gain:.12,attack:.1});break;
        case 'snowslide':hush(1200,0,.7,{filter:'lowpass',to:220,gain:.22,attack:.04});hush(3000,.02,.25,{q:1,gain:.05});break;
        case 'windchime':{const pent=[1568,1760,2093,2349,2637];for(let i=0;i<3+Math.floor(R()*3);i++)tone(pent[Math.floor(R()*pent.length)],null,i*rand(.12,.3),1.4,{gain:.04,attack:.005});break;}
        case 'carol':{const chord=R()<.5?[392,494,587]:[349,440,523];for(const [i,f] of chord.entries())tone(f,f*1.003,i*.04,2.6,{gain:.025,attack:.6,vib:4.5});break;}
        case 'sleighpass':for(let i=0;i<14;i++){const g=Math.sin(i/13*Math.PI)*.04+.005;tone(1900+i%3*370,null,i*.12,.12,{gain:g});hush(6200,i*.12,.05,{gain:g*.7});}break;
        case 'cuckoo':tone(660,640,0,.28,{gain:.08,attack:.03});tone(550,530,.36,.38,{gain:.07,attack:.03});break;
        case 'plip':tone(rand(500,800),rand(1200,1700),0,.07,{gain:.1});break;
        case 'buoy':tone(rand(420,470),null,0,2.4,{gain:.06,attack:.005});tone(rand(1100,1200),null,0,1.2,{gain:.02});break;
        case 'rigging':tone(rand(150,200),rand(170,230),0,.5,{type:'triangle',gain:.04,attack:.08});hush(2600,.1,.12,{q:6,gain:.05});break;
        case 'chime':tone(880,null,0,2.2,{gain:.08,attack:.01});tone(1320,null,.02,1.8,{gain:.05});tone(1760,null,.04,1.2,{gain:.03});break;
      }
      setTimeout(()=>{try{out.disconnect();panner?.disconnect();}catch(_){}},4000);
    }
  }
  Object.assign(EscapeAmbience,{SCAPES,BEDS,WEATHER,scapeFor});
  root.EscapeAmbience=EscapeAmbience;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeAmbience};
})(typeof globalThis!=='undefined'?globalThis:this);

