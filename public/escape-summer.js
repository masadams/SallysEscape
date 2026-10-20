// Authored Sunshore Cove routes (summer). See docs/SUMMER-PLAN.md.
(function(root){const routes=[
 {
  id:'summer-dunes',name:'The Dune Gate',index:0,revision:1,difficulty:'Easy',seasonalTheme:'summer-dunes',cunning:0,
  pebbles:3,tongues:1,
  brief:'A fenced dune garden, a beach-hut switch and a serpent on the top path.',
  hint:'Go up through the middle of the hut garden and stand on the yellow switch: the boardwalk gate opens to the key. The serpent keeps to the top path. The sand slide in the south cove only goes one way; walk back round.',
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
   '#.......L....#.1..#',
   '#.1..............L#',
   '#....####.##.#.L..#',
   '#.@..#........#...#',
   '#.X..#.1...2..#.1.#',
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
   '#.@..L...#.......1..#',
   '#.X......#..~~~.....#',
   '#..1.....#..~~~...K.#',
   '#...~~...#.....L....#',
   '#...~~..1#..........#',
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
  id:'summer-tide',name:'The Turning Tide',index:2,revision:1,difficulty:'Easy\u2013medium',seasonalTheme:'summer-tide',cunning:0,
  pebbles:2,tongues:1,
  brief:'Two tidal flats, a sandbar between them, and an eel that wakes when the water comes in.',
  hint:'The wet sand turns to water when the tide comes in and back to sand when it goes out. Walk the flats while the tide is out, or swim them. The eel in the far flat sleeps in the sand at low tide; at high tide swim along the top or bottom edge, well away from it. Keep a tile back from the rock pool on the sandbar.',
  tide:{period:16,high:7,offset:9},
  guards:[{kind:'eel',spawn:[10,5],patrol:[[10,5]],facing:0},{kind:'eel',spawn:[14,6],patrol:[[14,6]],facing:0}],
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
   '#.X..ttt...#.ttt....#',
   '#....ttt.1...ttt....#',
   '#..L.t2t.....ttt..1.#',
   '#....ttt#....t1t....#',
   '#####################'
  ]
 },
 {
  id:'summer-gull',name:'The Gull\u2019s Boardwalk',index:3,revision:1,difficulty:'Easy\u2013medium',seasonalTheme:'summer-harbour',cunning:0,
  pebbles:3,tongues:1,
  brief:'A harbour of crates and boardwalks, a gull on the middle post and a serpent in the fish store.',
  hint:'The gull on the middle post turns to look down each boardwalk in turn. It never bites, but if it sees you it calls, and the serpent comes running. Cross while it looks the other way, or toss a pebble: it cannot resist anything shiny and flies off to steal it. The net-store switch opens the shutter to the key; the key opens the pier shutter.',
  gates:[{id:'net-shutter',name:'net shutter',tiles:[[12,2]],switch:[2,4],color:[236,196,98]},{id:'pier-shutter',name:'pier shutter',tiles:[[17,6]],color:[236,196,98]}],
  guards:[{kind:'magpie',spawn:[11,7],patrol:[[11,1],[21,7],[11,13],[1,7]],facing:-Math.PI/2},{kind:'snake',spawn:[20,9],patrol:[[20,9],[20,13]],facing:Math.PI/2}],
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
 }
];root.EscapeSummer=routes;if(typeof module!=='undefined'&&module.exports)module.exports=routes;})(typeof globalThis!=='undefined'?globalThis:this);
