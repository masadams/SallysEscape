// Authored Blossom Hollow routes (spring). See docs/SPRING-PLAN.md. The area stays closed until all
// eight are built, recorded and reviewed; these are the first three.
(function(root){const routes=[
 {
  id:'spring-gate',name:'The Rainy Garden Gate',index:0,revision:1,difficulty:'Easy',seasonalTheme:'spring-garden',cunning:0,
  pebbles:3,tongues:1,
  brief:'A wet walled garden, one hedge switch and a serpent on the top path.',
  hint:'Go up the middle to the courtyard and stand on the green switch: the hedge gate opens to the key. The key opens the garden gate home. The serpent keeps to the top path.',
  gates:[
   {id:'hedge-gate',name:'hedge gate',tiles:[[14,4]],switch:[11,4],color:[150,206,120]},
   {id:'garden-gate',name:'garden gate',tiles:[[13,8]],color:[150,206,120]}
  ],
  guards:[{kind:'snake',spawn:[7,1],patrol:[[5,1],[12,1]],facing:0}],
  reactions:[{id:'gate-key',when:'key',open:['garden-gate'],message:'The garden gate swings open. The short way home is clear.'}],
  fieldNotes:[
   {id:'spring-gate-note-0',at:[3,10],title:'A letter from Clover',body:'The blossom tree is still asleep: the mill channel is blocked and the garden never woke. Eight flower tokens will wake it. I have left the gates on the latch for you. The rain makes the paths look slippery, but they are not. - Clover'},
   {id:'spring-gate-note-1',at:[8,7],title:'On the switch',body:'Stand on a green switch and its hedge gate opens. The serpent keeps to the top path; leaves on the way hide you if you need them.'}
  ],
  props:[{at:[5,3],kind:'flowerpot'},{at:[12,5],kind:'flowerpot'},{at:[16,6],kind:'blossom'},{at:[3,7],kind:'flowerlantern'},{at:[15,10],kind:'wateringcan'},{at:[11,11],kind:'flowerpot'}],
  map:[
   '###################',
   '#...L.....1...#.1.#',
   '#.1.#####L#####...#',
   '#...#..1....L.#.K.#',
   '#...#.........#...#',
   '#.L.#..L..1...#...#',
   '#...#####.#####...#',
   '#......L....1#....#',
   '#.1..............1#',
   '#....####.####.L..#',
   '#.@..#.1...L.#....#',
   '#.X..#.......#..1.#',
   '###################'
  ]
 },
 {
  id:'spring-burrows',name:'Under the Potting Shed',index:1,revision:1,difficulty:'Easy',seasonalTheme:'spring-shed',cunning:0,
  pebbles:3,tongues:1,
  brief:'A burrow under the potting shed, a mole in the yard and moss to creep along.',
  hint:'Burrow at the flower-marked mound to reach the potting shed. In the yard the mole hunts footsteps: crawl along the moss, and do not run through the muddy bed: it splashes, and standing in it sinks you. The key is in the far shed; its switch opens the bottom path home.',
  tunnels:[[[3,2],[8,2]]],
  gates:[{id:'shed-door',name:'shed door',tiles:[[5,12]],switch:[17,11],color:[196,150,96]}],
  guards:[{kind:'mole',spawn:[10,9],patrol:[[10,9],[11,10]],facing:0}],
  reactions:[],
  fieldNotes:[
   {id:'spring-burrows-note-0',at:[3,4],title:'Under the shed',body:'Mounds with a flower beside them are the two ends of one burrow. Stand on one and burrow to come up at the other. - Clover'},
   {id:'spring-burrows-note-1',at:[9,4],title:'The mole',body:'The mole cannot see you; it hears you. Moss is quiet and crawling is quieter. The boards in the yard creak. Step off the boards onto the leaf and stand still: the mole comes up where it last heard you, not where you are.'}
  ],
  props:[{at:[10,3],kind:'flowerpot'},{at:[7,1],kind:'wateringcan'},{at:[15,7],kind:'flowerpot'},{at:[18,1],kind:'flowerlantern'},{at:[4,7],kind:'blossom'}],
  map:[
   '#####################',
   '#.1...#...1.#.......#',
   '#.....#.....#...2...#',
   '#.....#.....#.......#',
   '#..L..#.....#..1.K..#',
   '#.....###.###.......#',
   '#.....#mmmmm........#',
   '#.....#L....#.MMM...#',
   '#.....#N....#..L....#',
   '#.1...#2N...#.......#',
   '#.....#NN...#....1..#',
   '#.@...#######.......#',
   '#.X.....1...........#',
   '#####################'
  ]
 },
 {
  id:'spring-pond',name:'Across the Lily Pond',index:2,revision:1,difficulty:'Easy–medium',seasonalTheme:'spring-pond',cunning:1,
  pebbles:2,tongues:1,
  brief:'Two mill streams, a toad on the island and a lily pad that throws you home.',
  hint:'Swim the first stream (it pulls south) to the island and stand on the switch: a footbridge crosses the second, which surges every few seconds (watch the leaves speed up). Take the key, then step on the big lily pad to land back by the gate. The toad watches straight up the island; keep the stone pot between you.',
  currents:[{area:[6,1,8,13],dir:[0,1],speed:.6},{area:[12,1,14,13],dir:[0,1],speed:.6,pulse:6}],
  caps:[{at:[16,9],to:[4,9]}],
  gates:[{id:'footbridge',name:'footbridge',bridge:true,tiles:[[12,5],[13,5],[14,5]],switch:[9,3],color:[176,214,120]}],
  guards:[{kind:'toad',spawn:[10,13],patrol:[[10,13]],facing:-Math.PI/2}],
  reactions:[],
  fieldNotes:[
   {id:'spring-pond-note-0',at:[3,3],title:'The streams',body:'Both streams pull south. Swim across, not up: you will drift a little, and the island is long. Take a breath on land between them. - Clover'},
   {id:'spring-pond-note-1',at:[17,8],title:'The big lily pad',body:'Step on the big lily pad and it throws you over both streams to the gate bank. You cannot steer in the air; the landing is marked.'}
  ],
  props:[{at:[4,1],kind:'flowerpot'},{at:[18,1],kind:'blossom'},{at:[11,1],kind:'flowerlantern'},{at:[2,7],kind:'wateringcan'},{at:[18,12],kind:'flowerpot'}],
  map:[
   '#####################',
   '#.....~~~...~~~.....#',
   '#.@...~~~.1.~~~..K..#',
   '#.....~~~...~~~.....#',
   '#..1..~~~...~~~.....#',
   '#.....~~~...~~~.....#',
   '#.1...~~~..1~~~...1.#',
   '#.....~~~...~~~.....#',
   '#.....~~~.#.~~~.....#',
   '#.....~~~...~~~.....#',
   '#.....~~~.2.~~~.....#',
   '#.....~~~...~~~.....#',
   '#...1.~~~...~~~.2...#',
   '#.X...~~~...~~~.....#',
   '#####################'
  ]
 },
 {
  id:'spring-glasshouse',name:'The Glasshouse Lookout',index:3,revision:1,difficulty:'Medium',seasonalTheme:'spring-glass',cunning:2,
  pebbles:2,tongues:1,spores:1,
  brief:'Four greenhouse bays, a ladybird lookout, two serpents and a mantis by the last switch.',
  hint:'The ladybird plays dead when you come near on your feet: walk on calmly, or crawl, and do not rush past it or it buzzes the serpent over. Open the bays with their switches. Come at the mantis from behind. A second serpent slides up and down the key bay: take the key, wait until it turns back north at the bottom, then slip home behind it.',
  gates:[
   {id:'bay-door',name:'bay door',tiles:[[10,3]],switch:[8,5],color:[150,206,120]},
   {id:'key-bay',name:'key bay',tiles:[[17,7]],switch:[21,2],color:[236,170,196]},
   {id:'home-bay',name:'home bay',tiles:[[10,11]],color:[150,206,120]}
  ],
  guards:[
   {kind:'ladybird',spawn:[6,3],patrol:[[5,3],[7,3]]},
   {kind:'snake',spawn:[16,6],patrol:[[12,6],[20,6]],facing:0},
   {kind:'mantis',spawn:[19,2],patrol:[[19,2]],facing:Math.PI},
   {kind:'snake',spawn:[14,8],patrol:[[14,8],[14,13]],facing:Math.PI/2}
  ],
  reactions:[{id:'glass-key',when:'key',open:['home-bay'],message:'The home bay opens. Back to the start without the mantis.'}],
  fieldNotes:[
   {id:'spring-glasshouse-note-0',at:[2,9],title:'The ladybird',body:'It never bites. Come near on your feet and it flips over and plays dead. Rush past, or still be standing over it when it rights itself, and it flies up buzzing: everything that hunts hears where you are. Crawling past never startles it. - Clover'},
   {id:'spring-glasshouse-note-1',at:[12,1],title:'The mantis',body:'It looks like a twig until you are close. It strikes in front of itself only. Its back is safe.'}
  ],
  props:[{at:[1,1],kind:'flowerpot'},{at:[9,1],kind:'flowerlantern'},{at:[11,4],kind:'flowerpot'},{at:[21,4],kind:'blossom'},{at:[1,13],kind:'wateringcan'},{at:[21,13],kind:'flowerpot'}],
  map:[
   '#######################',
   '#.....1...#.1.........#',
   '#.........#...........#',
   '#..L.................1#',
   '#.........#..oo.......#',
   '#...1.....#.L.........#',
   '#.........#...........#',
   '###.#############.#####',
   '#.........#...........#',
   '#..1......#..L.....1..#',
   '#.........#..........1#',
   '#.@...................#',
   '#.X...L...#..1.....K..#',
   '#.........#.....2.....#',
   '#######################'
  ]
 },
 {
  id:'spring-mill',name:'The Sleeping Waterwheel',index:4,revision:1,difficulty:'Medium',seasonalTheme:'spring-garden',cunning:2,
  pebbles:2,tongues:2,millWheel:[21,8],
  brief:'A deep millrace, three bridges, a switch you can only reach with your tongue and a serpent pacing the lower yard.',
  hint:'The near switch lowers the first bridge. From the lower bank, stand opposite the far switch and flick it with your tongue: the second bridge comes down. The key lowers the middle bridge home. A serpent paces up and down the lower yard by the gate: wait above the water until it turns south, then cross behind it, both going and coming back. The toad sits in the walled bay on the lower right; creep along the leaves and take its treasure with your tongue, or leave it.',
  gates:[
   {id:'near-bridge',name:'near bridge',bridge:true,tiles:[[3,7],[3,8]],switch:[3,5],color:[176,214,120]},
   {id:'far-bridge',name:'far bridge',bridge:true,tiles:[[19,7],[19,8]],switch:[18,6],color:[236,170,196]},
   {id:'mill-bridge',name:'mill bridge',bridge:true,tiles:[[10,7],[10,8]],color:[196,150,96]}
  ],
  guards:[
   {kind:'toad',spawn:[21,12],patrol:[[21,12]],facing:Math.PI},
   {kind:'snake',spawn:[6,13],patrol:[[6,13],[6,9]],facing:-Math.PI/2}
  ],
  reactions:[{id:'mill-key',when:'key',open:['mill-bridge'],message:'The middle bridge drops into place. Straight home.'}],
  fieldNotes:[
   {id:'spring-mill-note-0',at:[1,3],title:'The millrace',body:'The race is too fast and deep to swim. Every bridge has its own switch. One switch is across the water: get within three tiles and flick it with your tongue. - Clover'}
  ],
  props:[{at:[1,1],kind:'flowerpot'},{at:[13,1],kind:'flowerlantern'},{at:[15,5],kind:'blossom'},{at:[7,12],kind:'wateringcan'},{at:[13,13],kind:'flowerpot'}],
  map:[
   '#######################',
   '#.....#.......#......1#',
   '#.@...#...K...#...1...#',
   '#..1..#...............#',
   '#.....#..L....#.....L.#',
   '#.....#......1#.......#',
   '#.....#.......#.......#',
   '#_____________________#',
   '#_____________________#',
   '#.....................#',
   '#..1....L.....#########',
   '#.............LLLL..1.#',
   '#.X..1....L...#...L...#',
   '#.......2...1.#.......#',
   '#######################'
  ]
 },
 {
  id:'spring-wall',name:'The Gardener’s Shortcut',index:5,revision:1,difficulty:'Medium–hard',seasonalTheme:'spring-shed',cunning:2,
  pebbles:3,tongues:1,
  wind:[{area:[1,1,13,3],dir:[1,0],period:5,on:2,offset:0,strength:1.2}],
  brief:'A stag beetle in an apron, a cracked shed wall, serpents in the shed and a back path home.',
  hint:'Stand in front of the cracked wall where the beetle can see you down the long row. When it lowers its head, step aside: it charges through the wall. The shed switch opens the back path home, so the wall is never your only way out. A serpent sweeps the middle of the shed, and taking the key wakes a second one by the switch: cross behind the first to the leaf by the switch, hide, and go when the lower one heads away east. A spring breeze gusts east along the top lawn; a pebble thrown across it lands downwind.',
  gates:[{id:'back-path',name:'back path',tiles:[[17,14]],switch:[17,12],color:[196,150,96]}],
  guards:[
   {kind:'beetle',spawn:[4,7],patrol:[[4,7],[10,7]],facing:0},
   {kind:'snake',spawn:[21,10],patrol:[[21,10],[15,10]],facing:Math.PI}
  ],
  reinforcements:[{id:'shed-snake',kind:'snake',spawn:[21,13],patrol:[[21,13],[15,13]],facing:Math.PI}],
  reactions:[{id:'wall-key',when:'key',spawn:['shed-snake'],message:'A second serpent slides out from under the potting bench. Two of them now guard the way to the switch.'}],
  fieldNotes:[
   {id:'spring-wall-note-0',at:[10,12],title:'The gardener',body:'It cannot stop once it charges, and it breaks whatever it hits. A cracked wall is only a wall until something heavy runs into it. Let it see you in front of the crack, then step aside. - Clover'},
   {id:'spring-wall-note-1',at:[21,6],title:'The shed',body:'Two serpents keep this shed once the key is gone: one across the middle, one along the bottom by the switch. Neither looks behind itself. The leaf by the switch is the place to wait.'}
  ],
  props:[{at:[1,1],kind:'wateringcan'},{at:[13,13],kind:'flowerpot'},{at:[21,1],kind:'flowerlantern'},{at:[21,8],kind:'flowerpot'},{at:[11,15],kind:'blossom'}],
  map:[
   '#######################',
   '#.............#......1#',
   '#.......L.....#...1...#',
   '#.............#.......#',
   '#....###......#....K..#',
   '#....###......#.......#',
   '#.............#..1....#',
   '#.............B.......#',
   '#.............#.......#',
   '#########.....#....1..#',
   '#########..L..#.......#',
   '#............1#.......#',
   '#.@......1....#.L.....#',
   '#.............#.......#',
   '#################.#####',
   '#.X..1...1.......2....#',
   '#######################'
  ]
 },
 {
  id:'spring-lanterns',name:'Lanterns After Rain',index:6,revision:1,difficulty:'Hard',seasonalTheme:'spring-dusk',cunning:3,
  pebbles:1,tongues:1,glows:2,
  brief:'Twilight in three hedge rooms: a lantern moth over the leaves, a weaver and a serpent by the key, and a toad on the way home.',
  hint:'Cross the middle room while the moth is at the far end of its loop; its light shows you even in leaves. At the bottom alley, throw a glow mushroom ahead: the weaver backs out of the light. A serpent sweeps the room above the key, and in the glow it sees you from further off: go in while it heads away east. Take the key and come back through the alley; the key opens the low gate home. A toad watches the last stretch, and crawling does not fool it. You have one pebble: toss it past the toad from the low gate and slip home while it hops after the sound.',
  gates:[{id:'home-gate',name:'home gate',tiles:[[6,12]],color:[236,170,196]}],
  guards:[
   {kind:'moth',spawn:[9,6],patrol:[[9,6],[12,9]],facing:0},
   {kind:'spider',spawn:[18,12],patrol:[[18,12],[20,10]],facing:Math.PI},
   {kind:'snake',spawn:[21,9],patrol:[[21,9],[16,9]],facing:Math.PI},
   {kind:'toad',spawn:[2,9],patrol:[[2,9]],facing:Math.PI/2}
  ],
  reactions:[{id:'lantern-key',when:'key',open:['home-gate'],message:'The low gate opens. Back through the alley and straight home.'}],
  fieldNotes:[
   {id:'spring-lanterns-note-0',at:[3,1],title:'After the rain',body:'At dusk the lantern moth comes out. Its glow finds you even in the leaves, so watch its loop and go when it is far. The weaver in the alley hates light: throw a glow mushroom past it and it backs off until the glow fades. Other hunters can still see you in that light. - Clover'},
   {id:'spring-lanterns-note-1',at:[12,13],title:'Home stretch',body:'A toad sits by the way home tonight, staring down at the way out. A toad sees a crawl as well as a walk, but it cannot resist a pebble landing near it. Save yours for this. - Clover'}
  ],
  props:[{at:[5,1],kind:'flowerlantern'},{at:[11,1],kind:'flowerlantern'},{at:[21,1],kind:'flowerlantern'},{at:[1,10],kind:'flowerpot'},{at:[21,6],kind:'blossom'}],
  map:[
   '#######################',
   '#.....#....1..#.......#',
   '#.@...........#.......#',
   '#.....#.......#.......#',
   '#..1..#..LL.1.#.......#',
   '#.....#..LL...#.......#',
   '#.....#.......#.......#',
   '#.1...#..LL...#.......#',
   '#.....#..LL...#.......#',
   '#.....#.......#.......#',
   '#..L..#....1..#.......#',
   '#.....#.......#.......#',
   '#.....#.1.............#',
   '#.X...#...2...#.11..K.#',
   '#######################'
  ]
 },
 {
  id:'spring-festival',name:'The First Blossom',index:7,revision:1,difficulty:'Hard',seasonalTheme:'spring-garden',cunning:3,
  pebbles:2,tongues:2,millWheel:[12,10],
  brief:'Three garden courts and the last flower token: a mole, a serpent at the court door, a millrace bridge, the gardener, and a garden that wakes when you take the key.',
  hint:'Crawl the moss round the mole court. A serpent sweeps the middle court along its doorway row: wait beside the door, out of its line, and go when it heads away east. Flick the bridge switch with your tongue from the near bank. In the last court stand still in front of the cracked wall and let the gardener charge it; it aims where you are heading. The key wakes a weaver by the switch and a mole under the bottom path: leave the key garden at once, wait by the path gate until the ripple is far off, walk onto the moss, and cross the rest once it has gone back east.',
  gates:[
   {id:'race-bridge',name:'race bridge',bridge:true,tiles:[[12,6],[12,7]],switch:[12,5],color:[176,214,120]},
   {id:'festival-path',name:'festival path',tiles:[[18,14]],switch:[19,12],color:[236,170,196]}
  ],
  guards:[
   {kind:'mole',spawn:[4,6],patrol:[[4,6],[5,9]],facing:0},
   {kind:'beetle',spawn:[20,2],patrol:[[20,2],[20,5]],facing:Math.PI/2},
   {kind:'snake',spawn:[15,12],patrol:[[15,12],[9,12]],facing:Math.PI}
  ],
  reinforcements:[
   {id:'garden-weaver',kind:'spider',spawn:[17,10],patrol:[[17,10],[23,10]],facing:0},
   {id:'path-mole',kind:'mole',spawn:[14,15],patrol:[[4,15],[15,15]],facing:Math.PI}
  ],
  reactions:[{id:'festival-key',when:'key',spawn:['garden-weaver','path-mole'],message:'The last token wakes the garden: a weaver drops into the key garden and something stirs under the bottom path. Keep to the moss.'}],
  fieldNotes:[
   {id:'spring-festival-note-0',at:[3,2],title:'The last token',body:'You know everything this garden can do now. Moss is quiet, the race needs its bridge, and the gardener breaks what it runs into. The path home along the bottom opens from the key garden. - Clover'},
   {id:'spring-festival-note-1',at:[22,15],title:'The bottom path',body:'A mole lives under this path and the last token always wakes it. The moss in the middle is quiet; the bare ends are not. Stand still on the moss and let it pass under you. - Clover'}
  ],
  props:[{at:[7,1],kind:'flowerlantern'},{at:[15,1],kind:'flowerlantern'},{at:[23,1],kind:'flowerlantern'},{at:[11,13],kind:'blossom'},{at:[23,10],kind:'flowerpot'},{at:[23,15],kind:'wateringcan'}],
  map:[
   '#########################',
   '#mm1....#.......#.#.....#',
   '#m@.....#..1....#1#.....#',
   '#m......#.......#.#.....#',
   '#m......#.........#.....#',
   '#m......#.......#.#.....#',
   '#m......#_______#.#.....#',
   '#m......#_______#.#.....#',
   '#m......#.......#.......#',
   '#m..N...#..1....###BBB###',
   '#m......#.......#.......#',
   '#m.NN...#.......#...1...#',
   '#mmmmmmm........#.....K.#',
   '#.....1.#....1..#.......#',
   '##################.######',
   '#.X...1mmmmmm...2.......#',
   '#########################'
  ]
 }
];root.EscapeSpring=routes;if(typeof module!=='undefined'&&module.exports)module.exports=routes;})(typeof globalThis!=='undefined'?globalThis:this);
