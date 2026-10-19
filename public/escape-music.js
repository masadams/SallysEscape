// Adaptive music, composed in code with Tone.js. One sixteenth-note sequencer
// plays every layer in lockstep; the game only chooses a state (explore,
// tension, chase…) and a mood (per region), and each layer's volume fades
// toward that state's mix. The score below is plain data, so it is easy to
// test and to rewrite without touching the playback code.
(function(root){
  const midi=name=>{const m=/^([A-G])(#|b)?(-?\d)$/.exec(name);return 12*(Number(m[3])+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);};
  const hz=note=>440*2**((note-69)/12);
  // Every mood shares one structure: a four-bar progression, bass roots and fifths, and a melody scale.
  const MOODS={
    harvest:{chords:[['D3','F3','A3','E4'],['G3','B3','D4'],['C3','E3','G3'],['A2','C3','E3','G3']],bass:['D2','G2','C2','A1'],fifth:['A2','D3','G2','E2'],scale:['D4','E4','F4','A4','B4','D5'],seed:127},
    lanternfair:{chords:[['A3','C4','E4','B4'],['D3','F#3','A3'],['F3','A3','C4'],['E3','G#3','B3']],bass:['A2','D2','F2','E2'],fifth:['E3','A2','C3','B2'],scale:['A4','B4','C5','D5','E5','G#5'],seed:131},
    festival:{chords:[['D3','F#3','A3'],['G3','B3','D4','E4'],['B2','D3','F#3'],['A2','C#3','E3']],bass:['D2','G2','B1','A1'],fifth:['A2','D3','F#2','E2'],scale:['D4','E4','F#4','A4','B4','D5'],seed:137},
    meadow:{chords:[['G3','B3','D4'],['E3','G3','B3'],['C3','E3','G3'],['D3','F#3','A3']],bass:['G2','E2','C2','D2'],fifth:['D3','B2','G2','A2'],scale:['G4','A4','B4','D5','E5','G5'],seed:3},
    sneaky:{chords:[['D3','F3','A3','C4'],['G3','B3','D4'],['A3','C4','E4'],['C3','E3','G3']],bass:['D2','G2','A2','C2'],fifth:['A2','D3','E3','G2'],scale:['D4','F4','G4','A4','C5','D5'],seed:7},
    warm:{chords:[['E3','G#3','B3'],['D3','F#3','A3'],['A3','C#4','E4'],['E3','G#3','B3']],bass:['E2','D2','A2','E2'],fifth:['B2','A2','E3','B2'],scale:['E4','F#4','G#4','B4','C#5','E5'],seed:11},
    dark:{chords:[['A3','C4','E4'],['F3','A3','C4'],['D3','F3','A3'],['E3','G#3','B3']],bass:['A2','F2','D2','E2'],fifth:['E3','C3','A2','B2'],scale:['A4','C5','D5','E5','G5','A5'],seed:5},
    // Lydian river, Phrygian marsh, a Phrygian-dominant desert and a cold suspended frost.
    river:{chords:[['F3','A3','C4','E4'],['G3','B3','D4'],['E3','G3','B3'],['F3','A3','C4']],bass:['F2','G2','E2','F2'],fifth:['C3','D3','B2','C3'],scale:['F4','G4','A4','B4','C5','E5'],seed:13},
    marsh:{chords:[['E3','G3','B3'],['F3','A3','C4'],['D3','F3','A3'],['E3','G3','B3']],bass:['E2','F2','D2','E2'],fifth:['B2','C3','A2','B2'],scale:['E4','F4','G4','A4','B4','D5'],seed:17},
    desert:{chords:[['D3','F#3','A3'],['Eb3','G3','Bb3'],['C3','Eb3','G3'],['D3','F#3','A3']],bass:['D2','Eb2','C2','D2'],fifth:['A2','Bb2','G2','A2'],scale:['D4','Eb4','F#4','G4','A4','C5'],seed:19},
    // Spooky: diminished and augmented chords that never quite settle.
    spooky:{chords:[['A3','C4','Eb4'],['F3','A3','C#4'],['D3','F3','Ab3'],['E3','G#3','C4']],bass:['A2','F2','D2','E2'],fifth:['Eb3','C#3','Ab2','C3'],scale:['A4','Bb4','C5','Eb5','E5','G5'],seed:29},
    frost:{chords:[['B3','E4','F#4'],['G3','B3','D4'],['E3','A3','B3'],['F#3','B3','C#4']],bass:['B1','G2','E2','F#2'],fifth:['F#2','D3','B2','C#3'],scale:['B4','C#5','D5','F#5','A5','B5'],seed:23},
    // Every later region has its own harmony too, so no two areas sound alike.
    garden:{chords:[['C3','E3','G3'],['E3','G3','B3'],['F3','A3','C4'],['G3','B3','D4']],bass:['C2','E2','F2','G2'],fifth:['G2','B2','C3','D3'],scale:['C4','D4','E4','G4','A4','C5'],seed:31},
    quarry:{chords:[['G3','Bb3','D4'],['C3','E3','G3'],['Bb2','D3','F3'],['F3','A3','C4']],bass:['G2','C2','Bb1','F2'],fifth:['D3','G2','F2','C3'],scale:['G4','A4','Bb4','C5','D5','F5'],seed:37},
    jungle:{chords:[['A3','C4','E4'],['G3','B3','D4'],['A3','C4','E4'],['E3','G3','B3']],bass:['A2','G2','A2','E2'],fifth:['E3','D3','E3','B2'],scale:['A4','C5','D5','E5','G5','A5'],seed:41},
    glow:{chords:[['Eb3','G3','Bb3','D4'],['F3','A3','C4'],['C3','Eb3','G3'],['Eb3','G3','Bb3','D4']],bass:['Eb2','F2','C2','Eb2'],fifth:['Bb2','C3','G2','Bb2'],scale:['Eb4','F4','G4','A4','Bb4','D5'],seed:43},
    orchard:{chords:[['F3','A3','C4'],['D3','F3','A3'],['Bb2','D3','F3'],['C3','E3','G3']],bass:['F2','D2','Bb1','C2'],fifth:['C3','A2','F2','G2'],scale:['F4','G4','A4','C5','D5','F5'],seed:47},
    coast:{chords:[['D3','F#3','A3'],['C3','E3','G3'],['G3','B3','D4'],['D3','F#3','A3']],bass:['D2','C2','G2','D2'],fifth:['A2','G2','D3','A2'],scale:['D4','E4','F#4','A4','B4','C5'],seed:53},
    rooftops:{chords:[['Bb2','D3','F3','A3'],['G3','Bb3','D4','F4'],['C3','Eb3','G3','Bb3'],['F3','A3','C4','Eb4']],bass:['Bb1','G2','C2','F2'],fifth:['F2','D3','G2','C3'],scale:['Bb4','C5','D5','F5','G5','Bb5'],seed:59},
    ants:{chords:[['E3','G3','B3'],['C3','E3','G3'],['D3','F#3','A3'],['B2','D#3','F#3']],bass:['E2','C2','D2','B1'],fifth:['B2','G2','A2','F#2'],scale:['E4','G4','A4','B4','D5','E5'],seed:61},
    vents:{chords:[['C#3','E3','G#3'],['D3','F#3','A3'],['B2','D3','F#3'],['C#3','E3','G#3']],bass:['C#2','D2','B1','C#2'],fifth:['G#2','A2','F#2','G#2'],scale:['C#4','D4','E4','F#4','G#4','B4'],seed:67},
    grotto:{chords:[['C3','E3','G#3'],['D3','F#3','A#3'],['Bb2','D3','F#3'],['C3','E3','G#3']],bass:['C2','D2','Bb1','C2'],fifth:['G#2','A#2','F#2','G#2'],scale:['C4','D4','E4','F#4','G#4','A#4'],seed:71},
    tide:{chords:[['A3','C#4','E4'],['G3','B3','D4'],['D3','F#3','A3'],['A3','C#4','E4']],bass:['A2','G2','D2','A2'],fifth:['E3','D3','A2','E3'],scale:['A4','B4','C#5','E5','F#5','G5'],seed:73},
    home:{chords:[['D3','F#3','A3'],['B2','D3','F#3'],['G3','B3','D4'],['G3','Bb3','D4']],bass:['D2','B1','G2','G2'],fifth:['A2','F#2','D3','D3'],scale:['D4','E4','F#4','A4','B4','D5'],seed:79},
    storm:{chords:[['C3','Eb3','G3'],['Ab2','C3','Eb3'],['Bb2','D3','F3'],['G2','B2','D3']],bass:['C2','Ab1','Bb1','G1'],fifth:['G2','Eb2','F2','D2'],scale:['C4','D4','Eb4','G4','Ab4','Bb4'],seed:83},
    gilded:{chords:[['E3','G#3','B3'],['E3','G#3','C4'],['A3','C#4','E4'],['B2','D#3','F#3']],bass:['E2','E2','A2','B1'],fifth:['B2','C3','E3','F#2'],scale:['E4','F#4','G#4','B4','C#5','E5'],seed:89},
    // The last escapes, the secret spots: themes of their own.
    finale:{chords:[['D3','F#3','A3'],['B2','D3','F#3'],['Bb2','D3','F3'],['A2','C#3','E3']],bass:['D2','B1','Bb1','A1'],fifth:['A2','F#2','F2','E2'],scale:['D4','E4','F#4','A4','B4','D5'],seed:97},
    stars:{chords:[['G3','B3','D4','F#4'],['A3','C#4','E4'],['E3','G3','B3'],['G3','B3','D4','F#4']],bass:['G2','A2','E2','G2'],fifth:['D3','E3','B2','D3'],scale:['G4','A4','B4','C#5','D5','F#5'],seed:101},
    shrine:{chords:[['D3','G3','A3'],['Eb3','G3','Bb3'],['C3','Eb3','G3'],['D3','G3','A3']],bass:['D2','Eb2','C2','D2'],fifth:['A2','Bb2','G2','A2'],scale:['D4','Eb4','G4','A4','C5','D5'],seed:103},
    // Story cards: a slow music box for Old Moss's journal, a warmer theme once Sally is a Wayfinder.
    tale:{chords:[['C3','E3','G3','B3'],['A2','C3','E3','G3'],['F2','A2','C3','E3'],['G2','B2','D3','F3']],bass:['C2','A1','F1','G1'],fifth:['G2','E2','C2','D2'],scale:['C5','D5','E5','G5','A5','C6'],seed:109},
    wayfinder:{chords:[['D3','F#3','A3','C#4'],['B2','D3','F#3','A3'],['G2','B2','D3','F#3'],['A2','C#3','E3','G3']],bass:['D2','B1','G1','A1'],fifth:['A2','F#2','D2','E2'],scale:['D5','E5','F#5','A5','B5','D6'],seed:113},
    wreck:{chords:[['B2','D3','F#3'],['G3','B3','D4'],['A3','C#4','E4'],['F#3','A#3','C#4']],bass:['B1','G2','A2','F#2'],fifth:['F#2','D3','E3','C#3'],scale:['B4','C#5','D5','E5','F#5','A5'],seed:107},
    // The Blind Grove: hushed and watchful, a minor key lifted by a dreamy major seventh, ending on an unresolved sus chord.
    blind:{chords:[['E3','B3','F#4'],['C3','G3','B3','E4'],['A2','E3','B3','C4'],['B2','E3','F#3','A3']],bass:['E2','C2','A1','B1'],fifth:['B2','G2','E2','F#2'],scale:['E4','F#4','G4','B4','C5','D5'],seed:109}
  };
  // Each region has its own style: a mood, a lead instrument, a tempo and a groove.
  const STYLES={
    autumn:{mood:'harvest',lead:'pluck',bpm:86,groove:2},
    'autumn-dusk':{mood:'lanternfair',lead:'pluck',bpm:82,groove:1},
    'autumn-night':{mood:'lanternfair',lead:'bell',bpm:76,groove:3},
    'autumn-mill':{mood:'harvest',lead:'flute',bpm:88,groove:2,transpose:-2},
    'autumn-festival':{mood:'festival',lead:'bell',bpm:90,groove:2},
    meadow:{mood:'meadow',lead:'melody',bpm:96,groove:0},garden:{mood:'garden',lead:'pluck',bpm:100,groove:1},
    river:{mood:'river',lead:'flute',bpm:88,groove:2},ruins:{mood:'sneaky',lead:'pluck',bpm:92,groove:1},
    quarry:{mood:'quarry',lead:'bell',bpm:100,groove:0},desert:{mood:'desert',lead:'pluck',bpm:98,groove:1},
    marsh:{mood:'marsh',lead:'flute',bpm:84,groove:2},jungle:{mood:'jungle',lead:'pluck',bpm:108,groove:1},
    glow:{mood:'glow',lead:'bell',bpm:84,groove:2},orchard:{mood:'orchard',lead:'melody',bpm:94,groove:2},
    coast:{mood:'coast',lead:'flute',bpm:90,groove:2},hollow:{mood:'spooky',lead:'ghost',bpm:76,groove:3,transpose:-2},
    lantern:{mood:'spooky',lead:'bell',bpm:82,groove:3,transpose:2},rooftops:{mood:'rooftops',lead:'melody',bpm:110,groove:1},
    ants:{mood:'ants',lead:'pluck',bpm:104,groove:0},frost:{mood:'frost',lead:'bell',bpm:88,groove:2},
    vents:{mood:'vents',lead:'pluck',bpm:96,groove:0},
    grotto:{mood:'grotto',lead:'bell',bpm:90,groove:3},
    tide:{mood:'tide',lead:'flute',bpm:88,groove:2},
    home:{mood:'home',lead:'flute',bpm:80,groove:1},
    storm:{mood:'storm',lead:'ghost',bpm:102,groove:1},
    gilded:{mood:'gilded',lead:'bell',bpm:92,groove:2},
    // Places off the trail: the last escape and the long bonus run home, and each secret spot.
    finale:{mood:'finale',lead:'flute',bpm:92,groove:1},
    tale:{mood:'tale',lead:'bell',bpm:66,groove:3},wayfinder:{mood:'wayfinder',lead:'flute',bpm:72,groove:3},
    'secret:star-garden':{mood:'stars',lead:'bell',bpm:76,groove:2},
    'secret:mossy-well':{mood:'river',lead:'flute',bpm:72,groove:3,transpose:-3},
    'secret:cloud-nest':{mood:'stars',lead:'flute',bpm:88,groove:2,transpose:3},
    'secret:challenge-shrine':{mood:'shrine',lead:'pluck',bpm:84,groove:3},
    'secret:bestiary-grove':{mood:'jungle',lead:'flute',bpm:90,groove:2,transpose:-2},
    'secret:ice-cave':{mood:'frost',lead:'ghost',bpm:72,groove:3,transpose:-2},
    'secret:sunken-wreck':{mood:'wreck',lead:'ghost',bpm:78,groove:2},
    'secret:blind-grove':{mood:'blind',lead:'bell',bpm:70,groove:3},
    // The Magpie Roost: a bright, bouncy bonus tune, like the shrine's but quicker and higher.
    'secret:magpie-roost':{mood:'shrine',lead:'pluck',bpm:100,groove:2,transpose:2}
  };
  const THEME_MOOD=Object.fromEntries(Object.entries(STYLES).map(([theme,style])=>[theme,style.mood]));
  // Every escape in a region gets its own tune and key: the region's style, a new melody seed,
  // a shifted key and a rotated groove. Escape -1 is the region's theme on the world map.
  const SHIFTS=[0,2,-3,4,-2,3,-4];
  function styleFor(theme,escape=-1){
    const base=STYLES[theme]||STYLES.meadow,n=Math.max(0,escape+1),shift=escape<0?0:SHIFTS[escape%SHIFTS.length];
    return {...base,theme:theme in STYLES?theme:'meadow',seed:n,transpose:(base.transpose||0)+shift,groove:base.groove===3?3:(base.groove+Math.max(0,escape))%3,bpm:base.bpm+(escape<0?0:[0,4,-3,6,-5][escape%5]),id:(theme in STYLES?theme:'meadow')+':'+escape};
  }
  // How loud each layer is in each state (0–1), and how long the fades take.
  const MIX={
    menu:{pad:.7,melody:.55},
    story:{pad:.5,melody:.6},
    world:{pad:.55,melody:.6,bass:.35,perc:.3},
    explore:{pad:.4,bass:.65,melody:.3,perc:.35},
    tension:{pad:.3,bass:.6,perc:.15,tension:.75},
    chase:{bass:.5,tension:.35,chase:.9},
    victory:{pad:.55},
    caught:{pad:.25}
  };
  const FADES={'*>chase':.35,'chase>*':2.5,'*>tension':.8,default:1.6},CHASE_HOLD=2.5,BPM=96;
  const LAYERS=['pad','bass','melody','perc','tension','chase'];
  // A small seeded generator keeps every mood's tune the same on every play.
  function rng(seed){let s=seed*9301+49297;return ()=>(s=(s*16807)%2147483647)/2147483647;}
  // An eight-bar tune: a four-bar phrase, then an answer that shares its opening and ends home.
  function melody(mood,offset=0){
    const m={...MOODS[mood],seed:MOODS[mood].seed+offset*31},scale=m.scale.map(midi),phrase=seed=>{const r=rng(seed),bars=[];let at=2;
      for(let b=0;b<4;b++){const bar=[];for(let e=0;e<8;e++){const strong=e%4===0;if(!strong&&r()<.38){bar.push(null);continue;}at=Math.max(0,Math.min(scale.length-1,at+Math.round((r()-.5)*(strong?2:3))));bar.push(scale[at]);}bars.push(bar);}
      bars[3][6]=null;bars[3][7]=null;bars[3][4]=scale[0];return bars;};
    const a=phrase(m.seed),b=phrase(m.seed+1);b[0]=a[0].slice();b[3]=a[3].slice();b[3][0]=scale[2];return a.concat(b);
  }
  const tunes={};const tuneFor=(mood,offset=0)=>tunes[mood+':'+offset]||(tunes[mood+':'+offset]=melody(mood,offset));
  // Everything that sounds on one sixteenth step. Pure, so tests can read the score.
  // A style may shift the key, pick a lead voice and a groove (0 straight, 1 backbeat, 2 swung, 3 sparse).
  function events(mood,step,style={},flavor=null){
    const m=MOODS[mood]||MOODS.meadow,t=style.transpose||0,groove=style.groove||0,bar=Math.floor(step/16),s=step%16,c=bar%4,root=midi(m.bass[c])+t,fifth=midi(m.fifth[c])+t,chord=m.chords[c].map(n=>midi(n)+t),out=[];
    const add=(layer,voice,notes,dur,vel)=>out.push({layer,voice,notes:[].concat(notes),dur,vel});
    if(s===0)add('pad','pad',chord,'1m',.32);
    const bassSteps=groove===3?[0,8]:groove===2?[0,6,8,14]:[0,4,8,12],bassNotes=groove===1?[root,root,fifth,root+12]:[root,fifth,root+12,fifth];
    if(bassSteps.includes(s))add('bass','bass',bassNotes[bassSteps.indexOf(s)],'8n',s===0?.8:.6);
    // Long runs do not loop one tune: every other sixteen bars an answering tune takes over, and the
    // last four bars of each thirty-two leave the lead out for a breath of pad and bass.
    const section=Math.floor(bar/16)%2,breath=bar%32>=28;
    if(s%2===0&&!breath){const n=tuneFor(mood,(style.seed||0)+section*7)[bar%8][s/2];if(n!=null)add('melody',style.lead||'melody',n+t,'8n',s%8===0?.55:.42);}
    // A soft arpeggio answers the tune on off-beats in the second half of each phrase, and carries the breath.
    if((bar%8>=4||breath)&&s%4===2)add('melody','arp',chord[(s/4|0)%chord.length]+12,'16n',breath?.18:.22);
    const shaker=groove===3?[0,10]:groove===2?[0,3,4,7,8,11,12,15]:[0,2,4,6,8,10,12,14];
    if(shaker.includes(s))add('perc','shaker',null,'32n',s%4===2||s%4===3?.5:.22);
    if(groove===1&&(s===4||s===12))add('perc','rim',null,'32n',.45);
    if(groove===3&&s===6)add('perc','rim',null,'32n',.25);
    if(s===0){add('tension','strings',chord.map(n=>n+12),'1m',.3);add('tension','heart',midi('A1'),'8n',.9);}
    if(s===3)add('tension','heart',midi('A1'),'16n',.55);
    // The chase: a driving kick, sixteenth hats, a backbeat with a ghost note, a riff on the
    // chord root, and a tom fill that tumbles into every fourth bar.
    // Who is chasing flavours it: something heavy (a beetle, a cobra, a fox) stomps in half time
    // with low toms; something small and quick (a spider, a gecko, a scorpion) skitters with
    // rolling hats and a crawling chromatic riff; something in the air swoops with falling glides.
    const fill=c===3&&s>=12,heavy=flavor==='heavy',skitter=flavor==='skitter',swoop=flavor==='swoop';
    if(!fill&&(heavy?[0,10]:[0,3,6,8,11,14]).includes(s))add('chase','kick',midi('C1'),'8n',s%8===0?.95:.75);
    if(!fill&&(heavy?s===8:s===4||s===12))add('chase','snare',null,'16n',heavy?.8:.65);
    if(!fill&&s===15)add('chase','snare',null,'32n',.22);
    if(heavy&&!fill&&(s===4||s===12))add('chase','tom',root-12,'8n',.7);
    add('chase','hat',null,'32n',skitter?(s%2?.32:.42):heavy?(s%4===2?.4:s%4===0?.2:0):s%4===2?.5:s%2?.16:.3);
    if(skitter&&!fill&&s%4===1)add('chase','rimshot',null,'32n',.35);
    if(fill)add('chase','tom',root-12+[7,5,3,0][s-12],'16n',.85);
    const riff=skitter?[0,1,0,12,0,1,7,6]:heavy?[0,0,0,-5,0,0,3,-2]:[0,0,12,0,7,0,12,10];
    if(s%2===0)add('chase','ostinato',root+(heavy?0:12)+riff[s/2],'16n',heavy?.65:.55);
    if(!fill&&[0,6,12].includes(s))add('chase','stab',chord.map(n=>n+12),'16n',.45);
    if(swoop&&(s===0||s===8))add('chase','swoop',root+31,'4n',.5);
    if(swoop&&(s===2||s===10))add('chase','swoop',root+19,'8n',.45);
    return out;
  }
  function stinger(mood,kind){const m=MOODS[mood]||MOODS.meadow,tonic=m.chords[0].map(midi);
    return kind==='victory'?[...tonic,tonic[0]+12,tonic[1]+12,tonic[0]+24].map((n,i)=>({note:n,at:i*.09,dur:i===5?1.2:.3,vel:.5})):[tonic[2],tonic[1],tonic[0]-1,tonic[0]-12].map((n,i)=>({note:n,at:i*.16,dur:i===3?1:.25,vel:.45}));}
  // The flavour of a chase, from whatever is chasing. Pure, so it is easy to test.
  const FLAVORS={heavy:['beetle','cobra','fox','crab','mole','eel','toad'],skitter:['spider','gecko','cricket','millipede','scorpion','mantis','wasp'],swoop:['owl','magpie','bat','dragonfly','moth','heron']};
  function flavorFor(game){
    const chasing=['chase','charge','sting','leap','swoop','lunge','dash','flee','rush','tongue','pounce','dive','scuttle'];
    if(game?.hawk?.state==='dive')return 'swoop';
    const h=(game?.hunters||[]).find(q=>chasing.includes(q.state));if(!h)return null;
    for(const [name,kinds] of Object.entries(FLAVORS))if(kinds.includes(h.kind))return name;
    return null;
  }
  // Short musical cues on the stinger voice, built from the mood's home chord: the key found, the
  // hatch open, a secret uncovered, a new area reached.
  function cue(mood,kind,transpose=0){
    const m=MOODS[mood]||MOODS.meadow,tonic=m.chords[0].map(n=>midi(n)+transpose+12),scale=m.scale.map(n=>midi(n)+transpose);
    if(kind==='key')return [tonic[0],tonic[1],tonic[2],tonic[0]+12].map((n,i)=>({note:n,at:i*.07,dur:i===3?.6:.18,vel:.42}));
    if(kind==='hatch')return [...tonic.map(n=>({note:n,at:0,dur:.5,vel:.32})),...tonic.map(n=>({note:n+7,at:.22,dur:.9,vel:.36}))];
    if(kind==='secret')return scale.concat(scale.slice(0,2).map(n=>n+12)).map((n,i)=>({note:n+12,at:i*.06,dur:i===7?1:.16,vel:.3}));
    if(kind==='area')return [...tonic.map((n,i)=>({note:n,at:i*.1,dur:.3,vel:.4})),...tonic.map(n=>({note:n+12,at:.36,dur:1.4,vel:.4}))];
    return [];
  }
  // Pick the music state for what is happening right now. Pure, so it is easy to test.
  function stateFor({screen,game}={}){
    if(screen==='menu')return 'menu';
    if(screen==='world')return 'world';
    if(!game)return 'world';
    if(game.status==='won')return 'victory';
    if(game.status&&game.status!=='playing')return 'caught';
    const chasing=['chase','charge','sting','leap','swoop','lunge','dash','flee','rush','tongue'],wary=['alert','search','windup','glimmer','glare','reveal','decoy','raise','caw'];
    const hunters=game.hunters||[];
    if(hunters.some(h=>chasing.includes(h.state))||game.hawk&&game.hawk.state==='dive'||game.droppedTail)return 'chase';
    if(hunters.some(h=>wary.includes(h.state))||game.hawk&&game.hawk.state==='stalk'||game.player?.chilled)return 'tension';
    return 'explore';
  }
  class EscapeMusic{
    constructor(options={}){this.Tone=options.Tone||root.Tone;this.state=null;this.mood='meadow';this.nextMood=null;this.style=styleFor('meadow');this.nextStyle=null;this.volume=options.volume??.6;this.muted=false;this.ready=false;this.started=false;this.holdUntil=0;this.step=0;this.layers=new Map();this.voices={};}
    // Build the instruments on the game's own audio context, so music and effects share one clock.
    async load(context){
      const T=this.Tone;if(!T||this.ready)return this.ready;
      try{
        if(context&&context!==T.getContext()&&context!==T.getContext().rawContext)T.setContext(context);
        this.context=T.getContext(); // Remember it: callbacks may run while another context is current.
        // Notes are scheduled a quarter second ahead, so a slow frame (a busy phone) never makes the music stutter.
        try{this.context.lookAhead=.25;}catch(_){}
        // Everything passes a low-pass that stays wide open until Sally swims (muffled, as if heard
        // underwater) or hides in leaves (a little softened).
        this.muffleFilter=new T.Filter({frequency:18000,type:'lowpass',rolloff:-12}).connect(new T.Limiter(-6).toDestination());
        this.master=new T.Gain({gain:this.muted?0:this.volume}).connect(this.muffleFilter);
        const reverb=new T.Reverb({decay:3.2,wet:.28}).connect(this.master);await reverb.ready;
        // Tone treats new Gain(0) as the default gain of 1, so silent gains are passed as options.
        for(const name of LAYERS){const gain=new T.Gain({gain:0}).connect(['pad','melody','tension'].includes(name)?reverb:this.master);this.layers.set(name,{gain,target:0,quietAt:0});}
        const out=name=>this.layers.get(name).gain;
        const v=this.voices;
        v.pad=new T.PolySynth(T.Synth,{oscillator:{type:'fattriangle',spread:18,count:2},envelope:{attack:.9,decay:.5,sustain:.7,release:2}}).connect(new T.Filter(1400,'lowpass').connect(out('pad')));
        v.bass=new T.MonoSynth({oscillator:{type:'triangle'},filter:{Q:1,type:'lowpass'},envelope:{attack:.005,decay:.18,sustain:.1,release:.15},filterEnvelope:{attack:.005,decay:.12,sustain:.2,baseFrequency:220,octaves:2.5}}).connect(out('bass'));
        v.melody=new T.FMSynth({harmonicity:3.01,modulationIndex:2,oscillator:{type:'sine'},envelope:{attack:.004,decay:.35,sustain:.05,release:.4},modulationEnvelope:{attack:.002,decay:.2,sustain:0,release:.2}}).connect(out('melody'));
        // Region leads: a soft pluck, a glassy bell and a breathy flute, plus an arpeggio voice.
        v.pluck=new T.Synth({oscillator:{type:'triangle'},envelope:{attack:.002,decay:.22,sustain:0,release:.2}}).connect(new T.Filter(2600,'lowpass').connect(out('melody')));
        v.bell=new T.FMSynth({harmonicity:5.07,modulationIndex:6,oscillator:{type:'sine'},envelope:{attack:.002,decay:.9,sustain:0,release:.9},modulationEnvelope:{attack:.002,decay:.5,sustain:0,release:.4}}).connect(out('melody'));
        v.flute=new T.Synth({oscillator:{type:'sine'},envelope:{attack:.06,decay:.2,sustain:.6,release:.35}}).connect(new T.Vibrato(5.5,.08).connect(out('melody')));
        v.arp=new T.Synth({oscillator:{type:'triangle'},envelope:{attack:.004,decay:.15,sustain:0,release:.15}}).connect(out('melody'));
        v.ghost=new T.Synth({portamento:.12,oscillator:{type:'sine'},envelope:{attack:.15,decay:.3,sustain:.7,release:.8}}).connect(new T.Vibrato(3.5,.35).connect(out('melody')));
        v.hat=new T.NoiseSynth({noise:{type:'white'},envelope:{attack:.001,decay:.025,sustain:0}}).connect(new T.Filter(8000,'highpass').connect(out('chase')));
        v.tom=new T.MembraneSynth({pitchDecay:.05,octaves:2.5,envelope:{attack:.001,decay:.22,sustain:0}}).connect(out('chase'));
        v.rimshot=new T.NoiseSynth({noise:{type:'white'},envelope:{attack:.001,decay:.02,sustain:0}}).connect(new T.Filter(4200,'bandpass').connect(out('chase')));
        v.swoop=new T.Synth({portamento:.18,oscillator:{type:'sine'},envelope:{attack:.02,decay:.3,sustain:.4,release:.4}}).connect(out('chase'));
        v.rim=new T.NoiseSynth({noise:{type:'white'},envelope:{attack:.001,decay:.03,sustain:0}}).connect(new T.Filter(3200,'bandpass').connect(out('perc')));
        // The alarm: a low boom and a clashing stab the moment something gives chase.
        v.boom=new T.MembraneSynth({pitchDecay:.08,octaves:6,envelope:{attack:.001,decay:.7,sustain:0}}).connect(this.master);
        v.alarm=new T.PolySynth(T.Synth,{oscillator:{type:'sawtooth'},envelope:{attack:.003,decay:.5,sustain:0,release:.3}}).connect(new T.Filter(2400,'lowpass').connect(this.master));
        v.shaker=new T.NoiseSynth({noise:{type:'white'},envelope:{attack:.002,decay:.05,sustain:0}}).connect(new T.Filter(6500,'highpass').connect(out('perc')));
        v.strings=new T.PolySynth(T.Synth,{oscillator:{type:'sawtooth'},envelope:{attack:.6,decay:.3,sustain:.8,release:1.2}}).connect(new T.Tremolo(7,.55).start().connect(new T.Filter(950,'lowpass').connect(out('tension'))));
        v.heart=new T.MembraneSynth({pitchDecay:.03,octaves:3,envelope:{attack:.001,decay:.25,sustain:0,release:.1}}).connect(out('tension'));
        v.kick=new T.MembraneSynth({pitchDecay:.04,octaves:5,envelope:{attack:.001,decay:.3,sustain:0}}).connect(out('chase'));
        v.snare=new T.NoiseSynth({noise:{type:'pink'},envelope:{attack:.001,decay:.13,sustain:0}}).connect(new T.Filter(1800,'bandpass').connect(out('chase')));
        v.ostinato=new T.MonoSynth({oscillator:{type:'square'},filter:{Q:2,type:'lowpass'},envelope:{attack:.003,decay:.08,sustain:.2,release:.05},filterEnvelope:{attack:.002,decay:.08,sustain:.1,baseFrequency:300,octaves:2}}).connect(new T.Gain(.5).connect(out('chase')));
        v.stab=new T.PolySynth(T.Synth,{oscillator:{type:'sawtooth'},envelope:{attack:.004,decay:.12,sustain:0,release:.08}}).connect(new T.Filter(2200,'lowpass').connect(out('chase')));
        v.sting=new T.PolySynth(T.Synth,{oscillator:{type:'triangle'},envelope:{attack:.005,decay:.3,sustain:.3,release:.8}}).connect(reverb);
        // Levels measured offline so every layer sits at a similar loudness at full mix.
        for(const [name,voice] of Object.entries(v))if(voice.volume)voice.volume.value={pad:-5,strings:-16,stab:-17,sting:-6,shaker:-1,snare:-15,ostinato:-11,bass:-1,melody:7,heart:-4,kick:-7,pluck:-4,bell:-9,flute:-6,arp:-14,rim:-12,boom:-4,alarm:-14,ghost:-8,hat:-20,tom:-6,rimshot:-16,swoop:-14}[name]??-10;
        this.ready=true;
      }catch(_){this.ready=false;}
      return this.ready;
    }
    start(){
      const T=this.Tone;if(!this.ready||this.started)return false;const transport=this.context.transport;transport.bpm.value=this.style.bpm||BPM;
      transport.scheduleRepeat(time=>this.tick(time),'16n');transport.start('+0.1');this.started=true;if(this.state)this.apply(this.state,2);return true; // Fade in rather than starting at full mix.
    }
    tick(time){
      // A new style starts on the next bar, from the top of its own tune.
      if(this.nextStyle&&this.step%16===0){this.style=this.nextStyle;this.nextStyle=null;this.mood=this.style.mood;this.nextMood=null;this.step=0;this.tempo(.5);}
      this.glideTempo();
      const now=this.context.currentTime;
      for(const e of events(this.mood,this.step,this.style,this.flavor)){const layer=this.layers.get(e.layer);if(!layer||layer.target===0&&now>layer.quietAt)continue;this.play(this.voices[e.voice],e,time);}
      this.step++;
    }
    play(voice,e,time){if(!voice)return;try{if(!e.notes.length||e.notes[0]==null)voice.triggerAttackRelease(e.dur,time,e.vel);else voice.triggerAttackRelease(e.notes.length>1?e.notes.map(hz):hz(e.notes[0]),e.dur,time,e.vel);}catch(_){/* A dropped note is never worth an error. */}}
    setFlavor(flavor){if(flavor)this.flavor=flavor;else if(this.state!=='chase')this.flavor=null;}
    cue(kind){if(!this.ready||!this.started||this.muted)return false;const t=this.context.currentTime+.03;
      try{for(const n of cue(this.mood,kind,this.style.transpose||0))this.voices.sting.triggerAttackRelease(hz(n.note),n.dur,t+n.at,n.vel);}catch(_){}return true;}
    setMood(mood){if(!MOODS[mood]||mood===(this.nextMood||this.mood))return false;return this.setStyle({...this.style,mood,id:mood},true);}
    // A new style (region or escape) waits for the next bar so the harmony never lurches.
    setStyle(style,force=false){
      if(!style||!MOODS[style.mood]||!force&&style.id===(this.nextStyle||this.style).id)return false;
      if(!this.started){this.style=style;this.mood=style.mood;return true;}
      this.nextStyle=style;this.nextMood=style.mood;return true;
    }
    // Chases push the tempo up; it settles back when the danger passes.
        tempo(seconds){const bpm=this.context?.transport?.bpm;if(!bpm)return;this.bpmTarget=(this.style.bpm||BPM)*(this.state==='chase'?1.22:1);this.bpmGlide=Math.max(.05,seconds);}
    // Each sixteenth eases the tempo toward its target. Tone's own tempo ramps break its transport
    // clock (a 'reading time' crash) when they overlap, so the glide is done here, a step at a time.
    glideTempo(){const bpm=this.context?.transport?.bpm;if(!bpm||this.bpmTarget===undefined)return;const now=bpm.value,diff=this.bpmTarget-now;if(Math.abs(diff)<.05)return;
      const step=60/now/4;bpm.value=Math.abs(diff)<.5?this.bpmTarget:now+diff*Math.min(1,step/this.bpmGlide*2);}
    // Fade each layer toward the mix for this state; danger arrives fast and leaves slowly.
    setState(state,now=0){
      if(state===this.state)return false;
      // Chase music holds briefly so a hunter flickering in and out of sight does not pump the mix.
      if(this.state==='chase'&&!['victory','caught','world','menu'].includes(state)&&now<this.holdUntil)return false;
      const previous=this.state;this.state=state;if(state==='chase')this.holdUntil=now+CHASE_HOLD;
      this.apply(state,FADES[previous+'>'+state]??FADES['*>'+state]??FADES[previous+'>*']??FADES.default);
      if(this.ready&&this.started&&(state==='chase'||previous==='chase')){this.tempo(state==='chase'?.4:2.5);if(state==='chase')this.alarm();}
      if((state==='victory'||state==='caught')&&this.ready&&this.started){const t=this.context.currentTime+.05;for(const n of stinger(this.mood,state))this.voices.sting.triggerAttackRelease(hz(n.note),n.dur,t+n.at,n.vel);}
      return true;
    }
    // A low boom under a clashing chord: impossible to miss, and over in a second.
    alarm(){const t=this.context.currentTime+.02,root=midi((MOODS[this.mood]||MOODS.meadow).bass[0])+(this.style.transpose||0);
      try{this.voices.boom.triggerAttackRelease(hz(root-12),'4n',t,1);this.voices.alarm.triggerAttackRelease([root+12,root+18,root+25].map(hz),'8n',t,.7);this.voices.alarm.triggerAttackRelease([root+13,root+19,root+24].map(hz),'8n',t+.18,.6);}catch(_){}}
    apply(state,seconds){
      if(!this.ready)return;const mix=MIX[state]||{},t=this.context.currentTime;
      for(const [name,layer] of this.layers){const target=mix[name]||0;layer.target=target;layer.quietAt=t+seconds+.1;const g=layer.gain.gain;g.cancelAndHoldAtTime(t);g.linearRampToValueAtTime(target,t+Math.max(.02,seconds));/* Holding keeps the current level; a plain cancel would jump back to 1. */}
    }
    // 'water' muffles the music as if heard from under the surface, 'hide' softens it a little, null clears it.
    setMuffle(kind){if(kind===this.muffled||!this.muffleFilter)return false;this.muffled=kind;const f=kind==='water'?650:kind==='hide'?2400:18000;
      try{this.muffleFilter.frequency.rampTo(f,kind?.35:.8);}catch(_){}return true;}
    // How near the closest creature is (0 far, 1 close), while nothing has noticed Sally yet: the
    // tension strings creep in underneath, so danger is felt before it is seen.
    setNearness(k){if(!this.ready||this.state!=='explore')return false;const layer=this.layers.get('tension'),target=Math.round(Math.max(0,Math.min(1,k))*.3*20)/20;if(Math.abs(target-layer.target)<.04)return false;
      const t=this.context.currentTime,g=layer.gain.gain;layer.target=target;layer.quietAt=t+1;g.cancelAndHoldAtTime(t);g.linearRampToValueAtTime(target,t+1.2);return true;}
    setVolume(volume,muted=this.muted){if(volume===this.volume&&muted===this.muted&&this.volumeSet)return;this.volume=volume;this.muted=muted;if(!this.master)return;this.volumeSet=true;this.master.gain.rampTo(muted?0:volume,.25);}
  }
  Object.assign(EscapeMusic,{flavorFor,cue,FLAVORS,stateFor,events,stinger,melody:tuneFor,styleFor,STYLES,MOODS,MIX,FADES,LAYERS,THEME_MOOD,BPM,midi});
  root.EscapeMusic=EscapeMusic;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeMusic};
})(typeof globalThis!=='undefined'?globalThis:this);

