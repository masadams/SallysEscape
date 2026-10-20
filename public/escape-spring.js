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
  hint:'Burrow at the flower-marked mound to reach the potting shed. In the yard the mole hunts footsteps: crawl along the moss. The key is in the far shed; its switch opens the bottom path home.',
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
   '#.....#L....#.......#',
   '#.....#N....#..L....#',
   '#.1...#2N...#.......#',
   '#.....#NN...#....1..#',
   '#.@...#######.......#',
   '#.X.....1...........#',
   '#####################'
  ]
 },
 {
  id:'spring-pond',name:'Across the Lily Pond',index:2,revision:1,difficulty:'Easy–medium',seasonalTheme:'spring-pond',cunning:0,
  pebbles:2,tongues:1,
  brief:'Two mill streams, a toad on the island and a lily pad that throws you home.',
  hint:'Swim the first stream (it pulls south) to the island and stand on the switch: a footbridge crosses the second. Take the key, then step on the big lily pad to land back by the gate. The toad watches straight up the island; keep the stone pot between you.',
  currents:[{area:[6,1,8,13],dir:[0,1],speed:.6},{area:[12,1,14,13],dir:[0,1],speed:.6}],
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
 }
];root.EscapeSpring=routes;if(typeof module!=='undefined'&&module.exports)module.exports=routes;})(typeof globalThis!=='undefined'?globalThis:this);
