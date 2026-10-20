// Authored Sunshore Cove routes (summer). See docs/SUMMER-PLAN.md.
(function(root){const routes=[
 {
  id:'summer-dunes',name:'The Dune Gate',index:0,revision:1,difficulty:'Easy',seasonalTheme:'summer-dunes',cunning:0,
  pebbles:3,tongues:1,
  brief:'A fenced dune garden, a beach-hut switch and a serpent on the top path.',
  hint:'Go up through the middle of the hut garden and stand on the yellow switch: the boardwalk gate opens to the key. The serpent keeps to the top path. The sand slide in the south cove only goes one way; walk back round. Deep, pale sand slows you down and keeps your footprints.',
  gates:[{id:'dune-gate',name:'boardwalk gate',tiles:[[13,8]],switch:[8,4],color:[236,196,98]}],
  currents:[{area:[9,9,9,10],dir:[0,1],speed:.85,surface:'ground'}],
  guards:[{kind:'snake',spawn:[8,1],patrol:[[5,1],[12,1]],facing:0}],
  reactions:[],
  fieldNotes:[
   {id:'summer-dunes-note-0',at:[3,8],title:'A letter from Marina',body:'The lighthouse lens broke into eight sun pieces in the spring gales. Bring them home before the boat parade and the light will shine again. The beach is warm and the sand is firm: walk as you always do. - Marina'},
   {id:'summer-dunes-note-1',at:[8,8],title:'The sand slide',body:'Arrows in the sand mean a slide. It carries you one way, to the cove. Step off sideways, or walk back round by the hut.'}
  ],
  props:[{at:[3,3],kind:'parasol'},{at:[9,7],kind:'sandcastle'},{at:[16,10],kind:'buoy'},{at:[1,5],kind:'crate'},{at:[17,1],kind:'bunting'},{at:[11,11],kind:'parasol'}],
  map:[
   '###################',
   '#...L.........#.1.#',
   '#.1.###.#######...#',
   '#...#......1#...K.#',
   '#...#..1.L..#.....#',
   '#.L.#.......#.....#',
   '#...###.#####.....#',
   '#..sssssL....#.1..#',
   '#.1sssss.........L#',
   '#....####.##.#.Lss#',
   '#.@..#....ssss#sss#',
   '#.X..#.1..s2ss#s1s#',
   '###################'
  ]
 },
 {
  id:'summer-crab',name:'The Crab\u2019s Crossing',index:1,revision:1,difficulty:'Easy',seasonalTheme:'summer-pools',cunning:0,
  pebbles:3,tongues:1,
  brief:'A boardwalk between the rock pools, and a hermit crab in every lane.',
  hint:'A crab only pinches while it scuttles. Step close enough for it to peek, step back, and pass while it rests. A pebble beside it sends it into its shell for a moment. The switch past the second crab opens the gate up to the key.',
  gates:[{id:'pier-gate',name:'pier gate',tiles:[[17,6]],switch:[18,13],color:[236,196,98]}],
  guards:[{kind:'crab',spawn:[10,7],patrol:[[10,7]],facing:0,axis:'x',range:3},{kind:'crab',spawn:[14,11],patrol:[[14,11]],facing:0,axis:'x',range:3}],
  reactions:[],
  fieldNotes:[
   {id:'summer-crab-note-0',at:[3,5],title:'Shellbacks',body:'Hermit crabs keep to one lane of the boardwalk. When one peeks out, it scuttles to where you are going, then it is tired for a moment. Pass it then. - Marina'},
   {id:'summer-crab-note-1',at:[7,9],title:'A pebble trick',body:'A pebble that lands right beside a crab sends it into its shell for a few seconds. It is a good way to fetch the shells under the far boardwalk.'}
  ],
  props:[{at:[6,1],kind:'parasol'},{at:[1,4],kind:'crate'},{at:[19,4],kind:'buoy'},{at:[7,12],kind:'sandcastle'},{at:[19,9],kind:'crate'},{at:[11,1],kind:'bunting'}],
  map:[
   '#####################',
   '#.@..L...#.....ss1ss#',
   '#.X......#..~~~sssss#',
   '#ss1s....#..~~~...K.#',
   '#sss~~...#.....L....#',
   '#sss~~..1#..........#',
   '###.#############.###',
   '#.1.................#',
   '#####.###############',
   '#...~~~..#..........#',
   '#.1.~~~.L........1..#',
   '#........#..........#',
   '#....1...#####.######',
   '#........#..2...1...#',
   '#####################'
  ]
 },
 {
  id:'summer-tide',name:'The Turning Tide',index:2,revision:1,difficulty:'Easy\u2013medium',seasonalTheme:'summer-tide',cunning:1,
  pebbles:2,tongues:1,
  brief:'Two tidal flats, a sandbar between them with a crab on it, and an eel that wakes when the water comes in.',
  hint:'The wet sand turns to water when the tide comes in and back to sand when it goes out. Walk the flats while the tide is out, or swim them. The eel in the far flat sleeps in the sand at low tide; at high tide swim along the top or bottom edge, well away from it. Keep a tile back from the rock pool on the sandbar, and mind the hermit crab in the sandbar\u2019s middle lane: let it peek and scuttle, then cross while it rests.',
  tide:{period:16,high:7,offset:9},
  guards:[{kind:'eel',spawn:[10,5],patrol:[[10,5]],facing:0},{kind:'eel',spawn:[14,6],patrol:[[14,6]],facing:0},{kind:'crab',spawn:[11,4],patrol:[[11,4]],facing:Math.PI/2,axis:'y',range:3}],
  reactions:[],
  fieldNotes:[
   {id:'summer-tide-note-0',at:[3,3],title:'Reading the tide',body:'The flats are sand while the tide is out and water while it is in. Little waves lap at the edge just before it turns. The sandbar and both beaches stay dry at every tide. - Marina'},
   {id:'summer-tide-note-1',at:[11,9],title:'Eels',body:'An eel lunges at anyone right by its water. The one in the far flat lies buried while the tide is out, so cross then, or swim wide of it.'}
  ],
  props:[{at:[1,1],kind:'parasol'},{at:[8,1],kind:'buoy'},{at:[11,11],kind:'crate'},{at:[19,8],kind:'sandcastle'},{at:[17,1],kind:'bunting'},{at:[1,11],kind:'crate'}],
  map:[
   '#####################',
   '#..1.ttt..1.#ttt..1.#',
   '#.@..ttt.....ttt....#',
   '#....ttt...1.ttt..K.#',
   '#....ttt.....ttt....#',
   '#.1..ttt.L~..ttt....#',
   '#....ttt..~..ttt.L..#',
   '#....ttt.....ttt....#',
   '#.X..ttt...#.ttt.sss#',
   '#....ttt.1...ttt.sss#',
   '#..L.t2t.....ttt.s1s#',
   '#....ttt#....t1t.sss#',
   '#####################'
  ]
 },
 {
  id:'summer-gull',name:'The Gull\u2019s Boardwalk',index:3,revision:1,difficulty:'Medium',seasonalTheme:'summer-harbour',cunning:1,
  pebbles:2,tongues:1,
  brief:'A harbour of crates and boardwalks, a gull on the middle post, and serpents in the net store and the fish store.',
  hint:'The gull on the middle post turns to look down each boardwalk in turn. It never bites, but if it sees you it calls, and the serpents come running. Cross while it looks the other way, or toss a pebble: it cannot resist anything shiny and flies off to steal it. A second serpent circles the net store: slip in behind it to reach the switch, and follow it out. The net-store switch opens the shutter to the key; the key opens the pier shutter.',
  gates:[{id:'net-shutter',name:'net shutter',tiles:[[12,2]],switch:[2,4],color:[236,196,98]},{id:'pier-shutter',name:'pier shutter',tiles:[[17,6]],color:[236,196,98]}],
  guards:[{kind:'magpie',spawn:[11,7],patrol:[[11,1],[21,7],[11,13],[1,7]],facing:-Math.PI/2},{kind:'snake',spawn:[20,9],patrol:[[20,9],[20,13]],facing:Math.PI/2},{kind:'snake',spawn:[8,1],patrol:[[8,1],[8,5],[2,5],[2,1]],facing:Math.PI/2}],
  reactions:[{id:'gull-key',when:'key',open:['pier-shutter'],message:'The pier shutter rattles up. The fish store is the quick way home.'}],
  fieldNotes:[
   {id:'summer-gull-note-0',at:[7,12],title:'The harbour gull',body:'The gull on the middle post is a terrible tell-tale. It looks down each boardwalk in turn, and if it sees you it calls, and the serpent in the fish store comes running. It never bites. - Marina'},
   {id:'summer-gull-note-1',at:[7,4],title:'Shiny things',body:'Toss a pebble and the gull flies off to steal it. While it is away, it is watching nothing.'}
  ],
  props:[{at:[1,5],kind:'crate'},{at:[21,1],kind:'buoy'},{at:[13,13],kind:'crate'},{at:[1,9],kind:'parasol'},{at:[9,1],kind:'bunting'},{at:[21,9],kind:'crate'}],
  map:[
   '#######################',
   '#.1.......#.#.........#',
   '#......L...........K..#',
   '#...##....#.#...#.....#',
   '#.......1.#1#.......1.#',
   '#.........#.#.........#',
   '#####.#####.#####.#####',
   '#..L...........1...L.2#',
   '#####.#####.#####.#####',
   '#.........#.#.........#',
   '#.......1.#L#.1.......#',
   '#...#.....#.#....##...#',
   '#.@............L......#',
   '#.X.......#.#...1.....#',
   '#######################'
  ]
 },
 {
  id:'summer-lagoon',name:'The Reed Lagoon',index:4,revision:1,difficulty:'Medium',seasonalTheme:'summer-lagoon',cunning:2,
  pebbles:2,tongues:1,
  brief:'A reed lagoon with a lazy current, a heron on the bank, a Sunskimmer over the meadow and a serpent below the key.',
  hint:'The heron stabs straight along its beak. Step onto the bank while it looks out over the water, then swim: it never strikes a swimmer. The lagoon drifts south. The Sunskimmer flies a square round the key; cross just behind it. A serpent paces up and down the meadow below the key and watches it from the top of its walk: take the key while it heads away. The switch past the reeds lowers the footbridge home, or swim back the way you came.',
  currents:[{area:[9,1,13,13],dir:[0,1],speed:.45}],
  gates:[{id:'reed-bridge',name:'reed footbridge',bridge:true,tiles:[[9,12],[10,12],[11,12],[12,12],[13,12]],switch:[21,11],color:[236,196,98]}],
  guards:[{kind:'heron',spawn:[8,8],patrol:[[8,8]],facing:-Math.PI/2,looks:[-Math.PI/2,0],every:3},{kind:'dragonfly',spawn:[15,4],patrol:[[15,4],[21,4],[21,10],[15,10]],facing:0,speed:1.6},{kind:'snake',spawn:[17,13],patrol:[[17,13],[17,9]],facing:-Math.PI/2}],
  reactions:[],
  fieldNotes:[
   {id:'summer-lagoon-note-0',at:[5,7],title:'The reed heron',body:'The heron looks up the bank, then out over the water, then up the bank again. Its beak only reaches straight ahead. It never strikes at a swimmer. - Marina'},
   {id:'summer-lagoon-note-1',at:[16,12],title:'The Sunskimmer',body:'It flies the same square all day. Count it round, then cross just behind it. Reeds hide you only where they grow, and only while you keep still.'}
  ],
  props:[{at:[1,1],kind:'parasol'},{at:[6,13],kind:'crate'},{at:[21,1],kind:'bunting'},{at:[14,1],kind:'rowboat'},{at:[1,6],kind:'buoy'},{at:[20,13],kind:'sandcastle'}],
  map:[
   '#######################',
   '#...1..#1~~~~~........#',
   '#.@....#.~~~~~........#',
   '#......#L~~2~~........#',
   '#......#.~~~~~......1.#',
   '#...L..#.~~~~~........#',
   '#........~~~~~..1.#...#',
   '#......#.~~~~~....K...#',
   '#.1....#.~~~~~....#...#',
   '#......#.~~~~~........#',
   '#..L...#.~~~~~........#',
   '#......#.~~~~~........#',
   '#.X......~~~~~.....L1.#',
   '#......#1~~~~~.L.....1#',
   '#######################'
  ]
 },
 {
  id:'summer-boatshed',name:'Beneath the Boatshed',index:5,revision:1,difficulty:'Medium\u2013hard',seasonalTheme:'summer-boatshed',cunning:2,
  pebbles:2,tongues:2,
  brief:'A cargo lane where barrels roll, a deep slipway, a crab by the key, and a serpent that wakes when you take it.',
  hint:'A barrel rolls down the cargo lane every few seconds; the rumble warns you. Cross just after one goes by. In the store, stand opposite the bridge switch across the slipway and flick it with your tongue. The key is in the loft, in a hermit crab\u2019s lane: let it scuttle and tire before you grab it. Taking the key wakes a serpent under the store, right on the way home. It paces up and down the middle of the store; slip past behind it and keep still in the cover beside its path until a barrel goes by. The scorpion in the yard only stings when its tail is up.',
  logs:[{from:[7,1],to:[7,13],period:6,offset:0,speed:6}],
  gates:[{id:'slip-bridge',name:'slipway bridge',bridge:true,tiles:[[14,6],[15,6]],switch:[16,3],color:[236,196,98]}],
  guards:[{kind:'scorpion',spawn:[19,12],patrol:[[19,12]],facing:Math.PI},{kind:'crab',spawn:[19,2],patrol:[[19,2]],facing:0,axis:'x',range:2}],
  reinforcements:[{id:'store-serpent',kind:'snake',spawn:[11,13],patrol:[[11,13],[11,4]],facing:-Math.PI/2}],
  reactions:[{id:'boatshed-key',when:'key',spawn:['store-serpent'],message:'Something stirs under the store floor. A serpent is watching the way home.'}],
  fieldNotes:[
   {id:'summer-boatshed-note-0',at:[4,3],title:'The cargo lane',body:'Barrels roll down the cargo lane from the loading door, one after another. Listen for the rumble, watch one go by, then cross. Never stop in the lane. - Marina'},
   {id:'summer-boatshed-note-1',at:[12,5],title:'The slipway',body:'The slipway is too deep to swim. Its bridge switch is on the far side: stand right opposite it and flick it with your tongue.'}
  ],
  props:[{at:[1,1],kind:'crate'},{at:[5,13],kind:'rowboat'},{at:[12,1],kind:'crate'},{at:[21,1],kind:'harbourlantern'},{at:[16,13],kind:'buoy'},{at:[9,7],kind:'harbourlantern'}],
  map:[
   '#######################',
   '#...1.#1#....1__......#',
   '#.@...#.#.NN..__....K.#',
   '#.....#.#..#..__..L...#',
   '#.............__......#',
   '#..L..#.#.....__.#...1#',
   '#.....#.#.L...__......#',
   '#1....#.#.....__.....2#',
   '#.....#.#.#...__......#',
   '#.....#.#....1__##.####',
   '#.............__......#',
   '#.....#.#...#.__1.....#',
   '#.X...#.#1....__......#',
   '#.....#.#..L..__......#',
   '#######################'
  ]
 },
 {
  id:'summer-inlet',name:'The Sunset Inlet',index:6,revision:1,difficulty:'Hard',seasonalTheme:'summer-sunset',cunning:3,
  pebbles:1,tongues:1,
  brief:'Three sandbanks with a serpent on two of them, two deep pools with a Sailfin in each, and a fast channel home.',
  hint:'A Sailfin only hunts swimmers it can see, and it is quicker than you in the water. Wait until it is at the far end of its pool, then swim straight across; it can never follow you onto sand. Serpents pace the middle and far banks and cannot swim, but they see you in the water. Land behind one as it walks away. The switch on the middle bank opens the lens vault; the vault walls hide you while the far serpent goes by. The bottom channel runs fast to the west: drop into it from the far pool for a quick ride home.',
  currents:[{area:[6,13,16,13],dir:[-1,0],speed:.9}],
  gates:[{id:'lens-vault',name:'lens vault',tiles:[[19,7]],switch:[11,2],color:[236,196,98]}],
  guards:[{kind:'fish',spawn:[7,9],patrol:[[7,2],[7,11]],facing:-Math.PI/2},{kind:'fish',spawn:[14,3],patrol:[[15,11],[14,2]],facing:Math.PI/2},{kind:'snake',spawn:[11,11],patrol:[[11,11],[11,1]],facing:-Math.PI/2},{kind:'snake',spawn:[18,1],patrol:[[18,1],[18,11]],facing:Math.PI/2}],
  reactions:[],
  fieldNotes:[
   {id:'summer-inlet-note-0',at:[4,6],title:'Sailfins',body:'A Sailfin patrols each pool. It only chases swimmers it can see, and it cannot follow you onto the sand. Watch it turn at the far end, then swim straight across. - Marina'},
   {id:'summer-inlet-note-1',at:[11,10],title:'The sunset channel',body:'The channel along the bottom runs fast to the west. You can ride it home from the far pool, and the little sandbar in the middle is a safe place to stop.'}
  ],
  props:[{at:[1,1],kind:'parasol'},{at:[5,10],kind:'harbourlantern'},{at:[12,1],kind:'buoy'},{at:[18,13],kind:'rowboat'},{at:[21,10],kind:'harbourlantern'},{at:[10,11],kind:'crate'}],
  map:[
   '#######################',
   '#.....~~~~...~~~~.....#',
   '#.@...~~~~...~~~~1...1#',
   '#.....~~~~...~~~~.....#',
   '#..1..~~~~...~~~~.....#',
   '#.....~~~~1..~~~~..####',
   '#.....~~#~...~~~~..#..#',
   '#.....~~~~...~~~~...K.#',
   '#.....~~~~...~#~~..#..#',
   '#1....~~~~..1~~~~..####',
   '#.....~~~~...~~~~.....#',
   '#.....~~~~...~~~~.....#',
   '#.X...####.1.###~....1#',
   '#.....~~~~~2~~~~~#....#',
   '#######################'
  ]
 },
 {
  id:'summer-lighthouse',name:'The Lighthouse Lantern',index:7,revision:1,difficulty:'Medium',seasonalTheme:'summer-lighthouse',cunning:3,
  pebbles:3,tongues:1,
  brief:'The last lens: a tidal causeway, the gull\\u2019s stores, a crab under the lighthouse and the bridge home.',
  hint:'Cross the flats while the tide is out. In the stores the gull turns to watch each wall; slip along the top while it looks away, or toss it a pebble. Under the lighthouse a crab guards the lane: wake it, step back, and pass while it rests. From the lighthouse step, flick the bridge switch with your tongue and walk home along the harbour wall.',
  tide:{period:16,high:7,offset:9},
  gates:[{id:'harbour-bridge',name:'harbour bridge',bridge:true,tiles:[[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],[14,14],[15,14],[16,14],[17,14]],switch:[15,12],color:[236,196,98]}],
  guards:[{kind:'magpie',spawn:[13,4],patrol:[[13,1],[16,4],[13,7],[10,4]],facing:-Math.PI/2},{kind:'crab',spawn:[21,9],patrol:[[21,9]],facing:0,axis:'x',range:2},{kind:'dragonfly',spawn:[10,9],patrol:[[10,9],[16,9],[16,10],[10,10]],facing:0,speed:1.4}],
  reactions:[{id:'lighthouse-key',when:'key',message:'The last sun lens! Flick the bridge switch from the lighthouse step and walk home along the harbour wall.'}],
  fieldNotes:[
   {id:'summer-lighthouse-note-0',at:[4,6],title:'The last lens',body:'The final sun lens is on the lighthouse step. The tide, the gull and the crab are all between here and there. Take your time; every one of them has a rhythm. - Marina'},
   {id:'summer-lighthouse-note-1',at:[11,9],title:'The sunset annex',body:'A Sunskimmer loops the sunset annex all evening. Wait by the door, watch it go round, and fetch each shell just behind it.'}
  ],
  props:[{at:[1,1],kind:'parasol'},{at:[23,12],kind:'lighthouse'},{at:[5,13],kind:'harbourlantern'},{at:[18,1],kind:'bunting'},{at:[12,3],kind:'crate'},{at:[1,15],kind:'buoy'},{at:[20,15],kind:'harbourlantern'}],
  map:[
   '#########################',
   '#......ttt......1#sssss1#',
   '#.@....ttt.#...#.#sssss.#',
   '#......ttt.......#sssss.#',
   '#...1..ttt..............#',
   '#sssss.ttt.......#......#',
   '#sssss.ttt.#...#.#......#',
   '#sssss.ttt1......#......#',
   '#sssss.######.#####.#####',
   '#sssss.###.......#......#',
   '#1.....###1.....2######.#',
   '#......###########......#',
   '#......________.__......#',
   '#......___________....K.#',
   '#.X....___________......#',
   '#......___________.1...1#',
   '#########################'
  ]
 }
];root.EscapeSummer=routes;if(typeof module!=='undefined'&&module.exports)module.exports=routes;})(typeof globalThis!=='undefined'?globalThis:this);
