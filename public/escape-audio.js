// Procedural sound effects. Every sound is synthesised with Web Audio, so the
// game ships no audio files; music can later play through its own channel.
(function(root){
  let context=null,master=null,noiseBuffer=null;
  function setup(ctx){
    if(context===ctx&&master)return true;
    context=ctx;master=ctx.createDynamicsCompressor();master.threshold.value=-18;master.ratio.value=4;master.connect(ctx.destination);
    noiseBuffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=noiseBuffer.getChannelData(0);
    let seed=7;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741823.5-1;}
    return true;
  }
  function envelope(gain,start,peak,attack,duration){
    gain.gain.setValueAtTime(0.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(peak,0.0002),start+attack);
    gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
  }
  // One oscillator voice: frequency may glide to `to`, and `wobble` adds vibrato.
  function tone(volume,{freq=440,to=null,type='triangle',dur=.15,delay=0,gain=.5,attack=.008,wobble=0,wobbleRate=18}){
    const start=context.currentTime+delay,osc=context.createOscillator(),amp=context.createGain();
    osc.type=type;osc.frequency.setValueAtTime(freq,start);if(to)osc.frequency.exponentialRampToValueAtTime(to,start+dur);
    let lfo=null;if(wobble){lfo=context.createOscillator();const depth=context.createGain();lfo.frequency.value=wobbleRate;depth.gain.value=wobble;lfo.connect(depth);depth.connect(osc.frequency);lfo.start(start);lfo.stop(start+dur+.05);}
    envelope(amp,start,gain*volume,attack,dur);osc.connect(amp);amp.connect(master);osc.start(start);osc.stop(start+dur+.05);
    osc.onended=()=>{osc.disconnect();amp.disconnect();lfo?.disconnect();};
  }
  // Filtered noise for footsteps, digging, splashes and impacts.
  function noise(volume,{dur=.12,delay=0,gain=.5,filter='bandpass',freq=1200,to=null,q=1,attack=.004}){
    const start=context.currentTime+delay,src=context.createBufferSource(),f=context.createBiquadFilter(),amp=context.createGain();
    src.buffer=noiseBuffer;f.type=filter;f.Q.value=q;f.frequency.setValueAtTime(freq,start);if(to)f.frequency.exponentialRampToValueAtTime(to,start+dur);
    envelope(amp,start,gain*volume,attack,dur);src.connect(f);f.connect(amp);amp.connect(master);src.start(start,Math.random()*.5);src.stop(start+dur+.05);
    src.onended=()=>{src.disconnect();f.disconnect();amp.disconnect();};
  }
  const notes=(volume,list,opts={})=>list.forEach(([freq,delay,dur=.14],i)=>tone(volume,{type:'triangle',gain:.45,...opts,freq,delay,dur}));
  const recipes={
    'season-bones':v=>{for(let i=0;i<4;i++){noise(v,{dur:.06,delay:i*.045,gain:.2,filter:'bandpass',freq:1300+i*380,q:3});tone(v,{freq:630+i*240,to:560+i*190,dur:.07,delay:i*.045,type:'triangle',gain:.11});}},
    'season-zombie':v=>{tone(v,{freq:145,to:95,dur:.35,type:'triangle',gain:.12,wobble:8,wobbleRate:6});noise(v,{dur:.12,gain:.06,filter:'lowpass',freq:340});},
    'season-ghost':v=>{tone(v,{freq:520,to:780,dur:.45,type:'sine',gain:.13,wobble:14,wobbleRate:5});tone(v,{freq:1040,to:1560,dur:.4,delay:.04,type:'sine',gain:.04});},
    'season-pumpkin':v=>{noise(v,{dur:.23,gain:.1,filter:'bandpass',freq:700,to:1700,q:2});tone(v,{freq:210,to:280,dur:.2,type:'triangle',gain:.07});},
    'season-basket':v=>{notes(v,[[410,0,.08],[520,.09,.08],[440,.18,.13]],{type:'triangle',gain:.13});noise(v,{dur:.12,gain:.05,filter:'bandpass',freq:1900});},
    'season-turkey':v=>{for(let i=0;i<4;i++)tone(v,{freq:i%2?340:220,to:180,dur:.085,delay:i*.075,type:'triangle',gain:.13,wobble:12,wobbleRate:18});},
    'winter-snowball':v=>{noise(v,{dur:.11,gain:.16,filter:'lowpass',freq:1900,to:650,q:.8});tone(v,{freq:155,to:75,dur:.075,gain:.05});},
    'winter-yeti':v=>{tone(v,{freq:120,to:72,dur:.46,type:'triangle',gain:.19,wobble:7,wobbleRate:5});noise(v,{dur:.15,gain:.09,filter:'lowpass',freq:400});},
    'winter-wisp':v=>notes(v,[[1047,0,.2],[1568,.1,.35]],{type:'sine',gain:.12}),
    'winter-cane':v=>{noise(v,{dur:.08,gain:.08,freq:3500,q:4});tone(v,{freq:2200,to:1800,dur:.13,gain:.07});},
    'winter-snowman':v=>noise(v,{dur:.2,gain:.16,freq:1800,to:3600,q:2}),
    'winter-present':v=>notes(v,[[587,0,.09],[740,.09,.09],[659,.18,.14]],{gain:.12}),
    'winter-snatcher':v=>{tone(v,{freq:240,to:420,dur:.2,gain:.12,wobble:17,wobbleRate:9});noise(v,{dur:.12,gain:.08,freq:1800});},
    'winter-krampus':v=>{for(let i=0;i<3;i++){tone(v,{freq:620+i*170,to:500,dur:.12,delay:i*.09,gain:.1});noise(v,{dur:.06,delay:i*.09,gain:.07,freq:2400,q:4});}},
    'winter-watchman':v=>notes(v,[[392,0,.08],[523,.1,.17]],{type:'square',gain:.1}),
    gobble:v=>{for(let i=0;i<3;i++)tone(v,{freq:i%2?330:240,to:170,dur:.085,delay:i*.075,type:'triangle',gain:.12});},
    // Footsteps sound like the ground: a soft pad on plain floor, a crunch of gravel (loud: hunters
    // hear it), a rustle of leaves, next to nothing on moss, a squelch of mud, a hiss of sand, the
    // squeak and crunch of snow, a wet slap on the tide flats.
    step:(v,o)=>{const s=o.sprint?1.6:1,f=o.alt?1.12:1;switch(o.surface){
      case 'gravel':for(let i=0;i<3;i++)noise(v,{dur:.025,delay:i*.018,gain:.16*s,filter:'bandpass',freq:(2600+i*500)*f,q:3});noise(v,{dur:.06,gain:.08*s,filter:'lowpass',freq:700});break;
      case 'leaves':case 'tangle':noise(v,{dur:.14,gain:.11*s,filter:'bandpass',freq:2800*f,to:1800,q:.9,attack:.02});break;
      case 'moss':noise(v,{dur:.05,gain:.035*s,filter:'lowpass',freq:260});break;
      case 'mud':noise(v,{dur:.16,gain:.12*s,filter:'lowpass',freq:520*f,to:180,q:2,attack:.02});tone(v,{freq:150*f,to:90,dur:.12,type:'sine',gain:.05*s});break;
      case 'sand':noise(v,{dur:.08,gain:.07*s,filter:'highpass',freq:3400*f,attack:.01});break;
      case 'softsand':noise(v,{dur:.18,gain:.09*s,filter:'bandpass',freq:1100*f,to:600,q:.8,attack:.03});noise(v,{dur:.1,delay:.05,gain:.04*s,filter:'highpass',freq:3000});break;
      case 'ice':noise(v,{dur:.2,gain:.07*s,filter:'bandpass',freq:3200*f,to:2100,q:2,attack:.025});break;
      case 'snow':noise(v,{dur:.09,gain:.13*s,filter:'bandpass',freq:1500*f,to:900,q:1.6,attack:.01});noise(v,{dur:.02,delay:.03,gain:.06*s,filter:'highpass',freq:4200});break;
      case 'wet':noise(v,{dur:.07,gain:.12*s,filter:'bandpass',freq:1700*f,to:1100,q:1.2});break;
      default:noise(v,{dur:.05,gain:o.sprint?.22:.13,filter:'lowpass',freq:o.alt?520:420,q:.7});}},
    paddle:(v)=>noise(v,{dur:.16,gain:.16,freq:700,to:300,q:1.5}),
    treasure:(v)=>{notes(v,[[988,0,.09],[1319,.07,.22]],{type:'square',gain:.16});tone(v,{freq:2637,delay:.07,dur:.2,type:'sine',gain:.12});},
    chest:(v)=>{notes(v,[[784,0],[988,.06],[1175,.12],[1568,.18,.3]],{type:'square',gain:.14});noise(v,{dur:.3,delay:.18,gain:.1,filter:'highpass',freq:5000});},
    key:(v)=>{notes(v,[[1047,0],[1319,.07],[1568,.14],[2093,.21,.4]],{type:'sine',gain:.4});tone(v,{freq:4186,delay:.21,dur:.35,type:'sine',gain:.08});},
    won:(v)=>{notes(v,[[523,0],[659,.1],[784,.2],[1047,.3,.5]],{gain:.45});notes(v,[[392,.3,.6],[523,.3,.6]],{type:'sine',gain:.2});},
    caught:(v)=>{tone(v,{freq:330,to:92,dur:.55,type:'sawtooth',gain:.18});noise(v,{dur:.25,gain:.3,filter:'lowpass',freq:300});},
    failed:(v)=>notes(v,[[392,0,.18],[311,.18,.35]],{gain:.35}),
    warning:(v)=>notes(v,[[520,0,.07],[640,.09,.1]],{type:'sine',gain:.3}),
    // Being spotted must cut through the music: a thump, a two-note alarm and a long hiss.
    spotted:(v)=>{tone(v,{freq:140,to:55,dur:.25,type:'sine',gain:.55});notes(v,[[880,0,.09],[1245,.09,.18]],{type:'square',gain:.2});noise(v,{dur:.45,delay:.04,gain:.22,filter:'highpass',freq:3800,attack:.03});},
    lost:(v)=>tone(v,{freq:620,to:390,dur:.35,type:'sine',gain:.3}),
    decoy:(v)=>{noise(v,{dur:.04,gain:.35,freq:2600,q:4});noise(v,{dur:.03,delay:.13,gain:.22,freq:2900,q:4});noise(v,{dur:.025,delay:.22,gain:.12,freq:3100,q:4});},
    distracted:(v)=>tone(v,{freq:700,to:760,dur:.18,type:'sine',gain:.25}),
    burrow:(v)=>{noise(v,{dur:.4,gain:.4,filter:'lowpass',freq:500,to:120});tone(v,{freq:90,to:55,dur:.3,type:'sine',gain:.4,delay:.05});},
    // Sally's quiet two-note chirrup shares a voice with her pleased face.
    sallyPleased:(v)=>notes(v,[[1175,0,.055],[1568,.065,.11]],{type:'sine',gain:.09}),
    sallyGlance:(v)=>noise(v,{dur:.055,gain:.045,filter:'highpass',freq:2800}),
    tongue:(v)=>tone(v,{freq:260,to:1300,dur:.09,type:'sine',gain:.35}),
    tailDrop:(v)=>{noise(v,{dur:.05,gain:.4,freq:1800,q:2});tone(v,{freq:900,to:500,dur:.45,type:'square',gain:.1,wobble:120,wobbleRate:22,delay:.03});},
    regrow:(v)=>{tone(v,{freq:500,to:1400,dur:.5,type:'sine',gain:.3,wobble:30,wobbleRate:12});notes(v,[[1568,.35,.12],[2093,.45,.2]],{type:'sine',gain:.2});},
    gate:(v)=>{tone(v,{freq:150,to:95,dur:.3,type:'square',gain:.12});noise(v,{dur:.3,gain:.2,filter:'lowpass',freq:800,to:200});},
    plate:(v)=>notes(v,[[1200,0,.05],[800,.05,.08]],{type:'square',gain:.12}),
    creak:(v)=>tone(v,{freq:140,to:120,dur:.4,type:'sawtooth',gain:.1,wobble:12,wobbleRate:9}),
    maze:(v)=>{tone(v,{freq:70,to:45,dur:.8,type:'sine',gain:.5});noise(v,{dur:.7,gain:.25,filter:'lowpass',freq:260,to:80});},
    seal:(v)=>{tone(v,{freq:95,to:60,dur:.35,type:'square',gain:.15});noise(v,{dur:.15,gain:.3,filter:'lowpass',freq:400});},
    splash:(v)=>noise(v,{dur:.35,gain:.35,freq:1200,to:300,q:.8}),
    snap:(v)=>{noise(v,{dur:.12,gain:.4,filter:'lowpass',freq:900,q:2});tone(v,{freq:180,to:70,dur:.18,type:'square',gain:.14});},
    tail:(v)=>noise(v,{dur:.12,gain:.2,freq:900,q:3}),
    sting:(v)=>{tone(v,{freq:1400,to:400,dur:.12,type:'sawtooth',gain:.12});noise(v,{dur:.06,gain:.25,freq:4000,q:2});},
    charge:(v)=>{noise(v,{dur:.35,gain:.25,filter:'lowpass',freq:300,to:900});tone(v,{freq:110,to:180,dur:.3,type:'sawtooth',gain:.1});},
    hop:(v)=>tone(v,{freq:180,to:420,dur:.16,type:'sine',gain:.35}),
    scrape:(v)=>noise(v,{dur:.25,gain:.2,freq:1600,to:900,q:6}),
    rumble:(v)=>noise(v,{dur:.5,gain:.3,filter:'lowpass',freq:160}),
    den:(v)=>{tone(v,{freq:160,to:120,dur:.4,type:'triangle',gain:.25,wobble:20,wobbleRate:6});noise(v,{dur:.4,gain:.15,filter:'lowpass',freq:500});},
    emerge:(v)=>{noise(v,{dur:.3,gain:.25,filter:'lowpass',freq:400,to:1200});tone(v,{freq:210,to:320,dur:.25,gain:.18});},
    web:(v)=>tone(v,{freq:1800,to:900,dur:.18,type:'sine',gain:.15,wobble:200,wobbleRate:30}),
    flutter:(v)=>noise(v,{dur:.25,gain:.18,freq:2200,q:1.5,attack:.05}),
    glimmer:(v)=>notes(v,[[1760,0,.1],[2349,.06,.2]],{type:'sine',gain:.14}),
    clash:(v)=>{noise(v,{dur:.15,gain:.35,freq:700,q:2});noise(v,{dur:.12,delay:.12,gain:.3,freq:900,q:2});},
    grow:(v)=>tone(v,{freq:300,to:820,dur:.35,type:'sine',gain:.28,wobble:15,wobbleRate:8}),
    wilt:(v)=>tone(v,{freq:520,to:220,dur:.4,type:'sine',gain:.22}),
    rustle:(v)=>noise(v,{dur:.3,gain:.18,freq:3500,q:.6,attack:.04}),
    snap:(v)=>{noise(v,{dur:.05,gain:.4,freq:1500,q:3});tone(v,{freq:220,to:110,dur:.12,type:'square',gain:.12});},
    cache:(v)=>{recipes.chest(v);notes(v,[[2093,.32,.12],[2637,.4,.25]],{type:'sine',gain:.15});},
    hoot:(v)=>{tone(v,{freq:420,to:360,dur:.22,type:'sine',gain:.35,wobble:6,wobbleRate:7});tone(v,{freq:400,to:330,dur:.35,type:'sine',gain:.3,delay:.28,wobble:6,wobbleRate:7});},
    screech:(v)=>{tone(v,{freq:2400,to:1500,dur:.45,type:'sawtooth',gain:.08,wobble:90,wobbleRate:24});tone(v,{freq:1800,to:1200,dur:.35,type:'sine',gain:.12,delay:.08});},
    dive:(v)=>noise(v,{dur:.4,gain:.35,freq:600,to:2400,q:1.2,attack:.2}),
    camo:(v)=>{tone(v,{freq:900,to:520,dur:.35,type:'sine',gain:.18,wobble:40,wobbleRate:16});noise(v,{dur:.3,gain:.08,filter:'highpass',freq:4000,attack:.08});},
    skitter:(v)=>{for(let i=0;i<5;i++)noise(v,{dur:.03,delay:i*.05,gain:.18,freq:3200+i*200,q:5});},
    steal:(v)=>{tone(v,{freq:900,to:300,dur:.25,type:'square',gain:.12});noise(v,{dur:.1,gain:.2,freq:2600,q:3});},
    recover:(v)=>notes(v,[[784,0,.08],[1047,.07,.08],[1319,.14,.2]],{type:'square',gain:.14}),
    shiver:(v)=>{noise(v,{dur:.5,gain:.12,freq:5000,q:3,attack:.05});tone(v,{freq:1200,to:900,dur:.4,type:'sine',gain:.1,wobble:60,wobbleRate:20});},
    hiss:(v)=>noise(v,{dur:.7,gain:.08,filter:'highpass',freq:3500,attack:.3}),
    steam:(v)=>{noise(v,{dur:1.1,gain:.32,filter:'bandpass',freq:1800,to:900,q:.6,attack:.05});noise(v,{dur:.25,gain:.25,filter:'lowpass',freq:300});},
    gust:(v)=>noise(v,{dur:.9,gain:.12,filter:'bandpass',freq:500,to:1400,q:.7,attack:.3}),
    thunder:(v)=>{noise(v,{dur:1.4,gain:.3,filter:'lowpass',freq:400,to:80,attack:.005});noise(v,{dur:.15,gain:.2,filter:'highpass',freq:2500});},
    // A throw leaving Sally's hand, a pebble cracking off a wall, a glow mushroom lighting up.
    toss:(v)=>{noise(v,{dur:.16,gain:.09,filter:'bandpass',freq:700,to:2200,q:1.4,attack:.02});},
    clack:(v)=>{noise(v,{dur:.035,gain:.4,freq:3200,q:6});tone(v,{freq:1900,to:1500,dur:.05,type:'square',gain:.04});},
    glow:(v)=>{for(const [f,d] of [[880,0],[1320,.07],[1760,.14]])tone(v,{freq:f,to:f*1.01,dur:.5,delay:d,type:'sine',gain:.05,attack:.05});noise(v,{dur:.3,gain:.05,filter:'highpass',freq:5000,attack:.05});},
    // Little Explorers: a soft, friendly "boing" for a catch (never a fail sound) and a bright pair
    // of notes for a checkpoint.
    oops:(v)=>{tone(v,{freq:520,to:260,dur:.22,type:'sine',gain:.16});tone(v,{freq:300,to:620,dur:.2,delay:.22,type:'sine',gain:.14});},
    checkpoint:(v)=>notes(v,[[1047,0,.09],[1319,.09,.09],[1568,.18,.16]],{type:'triangle',gain:.12}),
    // Digging in: a scrabble of claws in dirt; a soft thump as she settles under; a pop back out.
    dig:(v)=>{for(let i=0;i<6;i++)noise(v,{dur:.07,delay:i*.11,gain:.14,filter:'bandpass',freq:900+i*120,q:1.4});},
    buried:(v)=>{noise(v,{dur:.25,gain:.18,filter:'lowpass',freq:420,to:140});tone(v,{freq:110,to:70,dur:.2,type:'sine',gain:.16});},
    unbury:(v)=>{noise(v,{dur:.18,gain:.12,filter:'lowpass',freq:800,to:300});tone(v,{freq:240,to:420,dur:.12,type:'sine',gain:.1});},
    // A pebble bonking a creature; clattering on gravel; Sally's tongue gulping a bug or flicking at nothing.
    bonk:(v)=>{tone(v,{freq:420,to:180,dur:.12,type:'triangle',gain:.22});noise(v,{dur:.05,gain:.14,filter:'bandpass',freq:1800,q:2});},
    clatter:(v)=>{for(let i=0;i<4;i++)noise(v,{dur:.03,delay:i*.05,gain:.2-i*.03,filter:'bandpass',freq:3000+i*400,q:3});},
    gulp:(v)=>{tone(v,{freq:300,to:140,dur:.14,type:'sine',gain:.2});tone(v,{freq:200,to:420,dur:.1,delay:.12,type:'sine',gain:.12});},
    thwip:(v)=>{noise(v,{dur:.08,gain:.08,filter:'bandpass',freq:1400,to:2600,q:4});},
    ping:(v)=>{tone(v,{freq:3400,to:4200,dur:.06,type:'sine',gain:.08});tone(v,{freq:3400,to:4200,dur:.05,delay:.12,type:'sine',gain:.04});},
    puff:(v)=>{noise(v,{dur:.45,gain:.16,filter:'lowpass',freq:900,to:300,attack:.01});tone(v,{freq:160,to:90,dur:.2,type:'sine',gain:.12});},
    buzz:(v)=>{tone(v,{freq:210,to:240,dur:.55,type:'sawtooth',gain:.07,attack:.05,wobble:18,wobbleRate:42});noise(v,{dur:.5,gain:.05,freq:1600,q:3,attack:.05});},
    chirp:(v)=>{for(let i=0;i<6;i++)tone(v,{freq:4200,to:3900,dur:.04,delay:i*.07,type:'sine',gain:.16});},
    smash:(v)=>{noise(v,{dur:.45,gain:.45,filter:'lowpass',freq:900,to:150});tone(v,{freq:120,to:50,dur:.35,type:'square',gain:.18});for(let i=0;i<4;i++)noise(v,{dur:.05,delay:.08+i*.06,gain:.15,freq:2200-i*300,q:4});},
    glowbug:(v)=>{notes(v,[[1568,0,.06],[2093,.05,.08],[2637,.1,.22]],{type:'sine',gain:.22});tone(v,{freq:3136,delay:.1,dur:.3,type:'sine',gain:.06,wobble:40,wobbleRate:14});},
    click:(v)=>tone(v,{freq:900,to:700,dur:.05,type:'sine',gain:.12}),
    // A frost sentinel's gaze: a crystal glint of warning, then the crack of ice.
    glint:(v)=>{for(const [f,d] of [[2600,0],[3900,.05],[5200,.1]])tone(v,{freq:f,to:f*1.02,dur:.25,delay:d,type:'sine',gain:.07});},
    freeze:(v)=>{noise(v,{dur:.08,gain:.4,filter:'highpass',freq:3000});noise(v,{dur:.5,delay:.04,gain:.18,freq:1600,to:600,q:2});tone(v,{freq:900,to:300,dur:.4,type:'triangle',gain:.06});},
    // A cloud ray gliding overhead: a soft, deep rush of air.
    glide:(v)=>{noise(v,{dur:1.4,gain:.12,filter:'lowpass',freq:280,to:520,attack:.5});tone(v,{freq:55,to:62,dur:1.4,type:'sine',gain:.08,attack:.5});},
    // An echo frog filling its throat, then croaking the noise back.
    ribbit:(v)=>{tone(v,{freq:180,to:240,dur:.12,type:'square',gain:.05,wobble:30,wobbleRate:40});},
    croak:(v)=>{for(let i=0;i<3;i++)tone(v,{freq:150-i*12,to:110,dur:.22,delay:i*.18,type:'square',gain:.11/(i*.6+1),wobble:22,wobbleRate:28});noise(v,{dur:.5,gain:.04,filter:'lowpass',freq:500,attack:.05});},
    // Digging into a burrow mound, and coming up again.
    tunnel:(v)=>{noise(v,{dur:.35,gain:.22,filter:'lowpass',freq:700,to:180,attack:.02});tone(v,{freq:140,to:70,dur:.3,type:'triangle',gain:.1});},
    // A sound bouncing round an echo hall.
    echo:(v)=>{for(let i=0;i<4;i++)noise(v,{dur:.06,delay:i*.14,gain:.12/(i+1),freq:1800-i*200,q:3});},
    // Small lives: a bird bursting off a wall, a bird's song, a frog dropping into water, a watcher
    // fungus pulling its eyes in.
    wingbeat:(v)=>{for(let i=0;i<5;i++)noise(v,{dur:.05,delay:i*.055,gain:.14-i*.018,filter:'bandpass',freq:1100+i*60,q:1.2,attack:.006});},
    tweet:(v)=>{for(const [f,d,u] of [[3200,0,4100],[3600,.11,4400],[3000,.24,3800]])tone(v,{freq:f,to:u,dur:.07,delay:d,type:'sine',gain:.07});},
    plop:(v)=>{tone(v,{freq:520,to:180,dur:.12,type:'sine',gain:.12});noise(v,{dur:.18,delay:.03,gain:.08,freq:900,to:400,q:1});},
    // A magpie's harsh chatter, raising the alarm.
    // A ladybird taking off in alarm: a whirring wing buzz that climbs, with a sharp click to start.
    ladybird:(v)=>{noise(v,{dur:.03,gain:.18,filter:'highpass',freq:3000});for(let i=0;i<3;i++)tone(v,{freq:180+i*40,to:420+i*60,dur:.45,delay:.04+i*.05,type:'sawtooth',gain:.035});noise(v,{dur:.5,delay:.04,gain:.08,filter:'bandpass',freq:900,q:3,attack:.05});},
    caw:(v)=>{for(let i=0;i<4;i++){noise(v,{dur:.07,delay:i*.09,gain:.22,filter:'bandpass',freq:1900-i*60,q:4,attack:.004});tone(v,{freq:900-i*30,to:700,dur:.06,delay:i*.09,type:'sawtooth',gain:.05});}},
    // Places: water lapping at a bank, a drip somewhere in a cave.
    lap:(v)=>{noise(v,{dur:.5,gain:.07,filter:'lowpass',freq:500,to:900,q:1.2,attack:.15});noise(v,{dur:.3,delay:.25,gain:.04,filter:'bandpass',freq:1400,to:700,q:1,attack:.05});},
    drip:(v)=>{tone(v,{freq:1400,to:2600,dur:.06,type:'sine',gain:.08});tone(v,{freq:900,to:1300,dur:.12,delay:.05,type:'sine',gain:.03});},
    squish:(v)=>{noise(v,{dur:.14,gain:.06,filter:'lowpass',freq:600,to:250,q:3,attack:.02});tone(v,{freq:260,to:150,dur:.1,type:'sine',gain:.04});},
    // A crawl: the faintest brush of leaves.
    crawl:(v)=>{noise(v,{dur:.12,gain:.05,filter:'bandpass',freq:2400,to:1600,q:.8,attack:.03});}
  };
  // Loudness trims, measured by rendering every sound offline (EscapeAudio.measure) and bringing
  // the loudest and quietest toward the middle; 1 leaves a sound as it is.
  // Measured in Chromium (dB RMS over the loudest 100 ms): rewards near -17, danger tells near
  // -27 so a hunter's warning is never lost under the music, footsteps and a crawl left soft.
  const TRIM={croak:1.4,freeze:1.3,maze:.62,won:.86,snap:1.41,charge:1.78,sting:2.24,buzz:1.78,hiss:1.41,dive:1.6,clash:2.5,rumble:2.5,skitter:3.16,scrape:3.16,flutter:2,rustle:1.6,clack:3.16,decoy:3.16,toss:2};
  // Each recipe is rendered once to a buffer offline and replayed from then on: one buffer
  // source instead of a fresh graph of oscillators, filters and LFOs per sound. Footsteps and
  // other noisy sounds keep three takes and a slight pitch drift so repeats never sound stamped.
  const VARIED=new Set(['step','paddle','tail','rustle','skitter','scrape','splash','flutter','clash','wingbeat','tweet','plop','lap','drip']);
  const cache=new Map(),rendering=new Set(),lastPlayed=new Map(),active=[];
  const MAX_VOICES=14,REPEAT_GAP=.045;
  const keyFor=(name,o)=>name+(o.sprint?':s':'')+(o.alt?':a':'')+(o.surface&&o.surface!=='floor'?':'+o.surface:'');
  function render(ctx,name,options,key){
    const Offline=root.OfflineAudioContext||root.webkitOfflineAudioContext;if(!Offline||rendering.has(key))return;rendering.add(key);
    const takes=VARIED.has(name)?3:1,length=Math.ceil(ctx.sampleRate*1.6),buffers=[];
    const one=i=>{const off=new Offline(1,length,ctx.sampleRate),saved=[context,master,noiseBuffer];
      try{context=off;master=off.createGain();master.connect(off.destination);noiseBuffer=saved[2];recipes[name](1,options);}finally{[context,master,noiseBuffer]=saved;}
      return off.startRendering().then(buffer=>{buffers[i]=trim(buffer);});};
    Promise.all([...Array(takes)].map((_,i)=>one(i))).then(()=>cache.set(key,buffers)).catch(()=>{}).finally(()=>rendering.delete(key));
  }
  // Cut the silent tail so short sounds free their voice quickly.
  function trim(buffer){const data=buffer.getChannelData(0);let end=data.length;while(end>1&&Math.abs(data[end-1])<1e-4)end--;
    const out=new AudioBuffer({length:Math.max(1,end),numberOfChannels:1,sampleRate:buffer.sampleRate});out.copyToChannel(data.subarray(0,Math.max(1,end)),0);return out;}
  function replay(ctx,buffers,volume,varied,pan=0){
    const src=ctx.createBufferSource(),amp=ctx.createGain();src.buffer=buffers[Math.floor(Math.random()*buffers.length)];
    if(varied)src.playbackRate.value=.94+Math.random()*.12;amp.gain.value=volume;src.connect(amp);
    // A sound from off to one side comes from that side.
    const panner=pan&&ctx.createStereoPanner?ctx.createStereoPanner():null;if(panner){panner.pan.value=Math.max(-1,Math.min(1,pan));amp.connect(panner);panner.connect(master);}else amp.connect(master);src.start();
    const voice={src,ends:ctx.currentTime+src.buffer.duration};active.push(voice);src.onended=()=>{src.disconnect();amp.disconnect();panner?.disconnect();const i=active.indexOf(voice);if(i>=0)active.splice(i,1);};
  }
  // The room: caves ring, halls a little, the open air not at all. Every sound passes through one
  // shared echo (a convolver fed a decaying-noise impulse), so the cost is the same for one sound
  // or twenty, and nothing at all outdoors.
  const SPACE={cave:{wet:.3,length:1.7,decay:2.6},hall:{wet:.16,length:.9,decay:3.4}};
  let space='open',send=null,convolver=null;
  function impulse(ctx,{length,decay}){const n=Math.ceil(ctx.sampleRate*length),b=ctx.createBuffer(2,n,ctx.sampleRate);let seed=3;
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++){seed=(seed*16807)%2147483647;d[i]=(seed/1073741823.5-1)*Math.pow(1-i/n,decay);}}return b;}
  let unhook=null;
  function setSpace(ctx,kind){
    if(!ctx?.createConvolver)return false;setup(ctx);const spec=SPACE[kind];if(kind===space&&(!spec||send?.context===ctx))return false;space=spec?kind:'open';
    // Out in the open the echo fades and then comes off the graph: a running reverb costs a phone
    // real work even when it is silent, and that is what makes sound crackle and lag.
    clearTimeout(unhook);
    if(!spec){if(send){send.gain.setTargetAtTime(0,ctx.currentTime,.3);const s=send;unhook=setTimeout(()=>{try{master.disconnect(s);}catch(_){}s.hooked=false;},1800);}return true;}
    if(!send||send.context!==ctx){send=ctx.createGain();send.gain.value=0;convolver=ctx.createConvolver();send.connect(convolver);convolver.connect(ctx.destination);}
    if(!send.hooked){master.connect(send);send.hooked=true;}
    convolver.buffer=impulse(ctx,spec);send.gain.setTargetAtTime(spec.wet,ctx.currentTime,.3);return true;
  }
  function play(ctx,name,volume=.25,options={}){
    const recipe=recipes[name];if(!recipe||!ctx||volume<=0)return false;
    try{
      setup(ctx);const key=keyFor(name,options),now=ctx.currentTime;
      // The same sound twice in a few milliseconds only adds volume and clipping.
      if(now-(lastPlayed.get(key)??-1)<REPEAT_GAP)return false;lastPlayed.set(key,now);
      // Too many voices at once: footsteps give way first, then the oldest sound stops.
      for(let i=active.length-1;i>=0;i--)if(active[i].ends<now)active.splice(i,1);
      if(active.length>=MAX_VOICES){if(name==='step'||name==='paddle')return false;const oldest=active.shift();try{oldest.src?.stop();}catch(_){}}
      const level=Math.min(1,volume*1.6*(options.gain??1)*(TRIM[name]??1)),buffers=cache.get(key);
      if(buffers&&ctx.createBufferSource)replay(ctx,buffers,level,VARIED.has(name),options.pan||0);else{recipe(level,options);active.push({src:null,ends:now+.6});render(ctx,name,options,key);}
      return true;
    }catch(_){return false;}
  }
  // Renders one sound offline and reports its loudness (RMS over the loudest 100 ms, and peak).
  function measure(name,options={}){
    const Offline=root.OfflineAudioContext||root.webkitOfflineAudioContext;if(!Offline||!recipes[name])return Promise.resolve(null);
    const rate=44100,off=new Offline(1,Math.ceil(rate*1.6),rate),saved=[context,master,noiseBuffer];
    if(!noiseBuffer){noiseBuffer=off.createBuffer(1,rate,rate);const d=noiseBuffer.getChannelData(0);let seed=7;for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=seed/1073741823.5-1;}}
    try{context=off;master=off.createGain();master.connect(off.destination);recipes[name](1,options);}finally{[context,master]=saved;}
    return off.startRendering().then(b=>{const d=b.getChannelData(0),win=Math.floor(rate*.1);let peak=0,best=0,sum=0;
      for(let i=0;i<d.length;i++){const v=d[i]*d[i];sum+=v;if(i>=win)sum-=d[i-win]*d[i-win];if(sum>best)best=sum;if(Math.abs(d[i])>peak)peak=Math.abs(d[i]);}
      return {name,rms:Math.sqrt(best/win),peak};});
  }
  root.EscapeAudio={play,measure,setSpace,space:()=>space,SPACE,TRIM,recipes:Object.keys(recipes),cached:()=>cache.size,reset:()=>{cache.clear();lastPlayed.clear();active.length=0;}};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.EscapeAudio;
})(typeof globalThis!=='undefined'?globalThis:this);


