// Little Explorers: twenty-six gentle levels for young children (about 5 and up), away from the campaign.
// Each teaches one thing. They can't be lost: a catch is an "Oops!" that hops Sally back to the last
// checkpoint (`checkpoints`), the creatures are slow and simple, and a glowing trail shows the way.
// Text maps use the same legend as the rebuilt routes (see docs/ENEMIES.md); a gate's switch and tiles
// are plain floor on the map.
(function(root){
  const PI=Math.PI;
  const routes=[
{id:'hello-sally',name:'Hello, Sally!',sticker:'🌼',brief:'Walk to the golden key, then to the green door.',hint:'Move with the stick, the arrows or WASD. Follow the glowing dots!',
 map:[
 '###########',
 '#@..1..K..#',
 '#.........#',
 '#..2...1..#',
 '#.........#',
 '#X..1.....#',
 '###########'],
 guards:[]},
{id:'winding-way',name:'The Winding Way',sticker:'🐞',brief:'The key is round the corners. Can you find it?',hint:'Follow the glowing dots round the walls. Shiny treasure is a bonus.',
 map:[
 '###############',
 '#@....#.....1.#',
 '#.###.#.###.#.#',
 '#.#1..#...#.#.#',
 '#.#####.#.#.#.#',
 '#.......#.#..K#',
 '#######.#.#####',
 '#X..2...#.....#',
 '###############'],
 guards:[]},
{id:'leafy-hide',name:'Hide in the Leaves',sticker:'🍃',brief:'A sleepy snake slides up and down. Wait in the leaves until it passes.',hint:'Standing still in leaves hides Sally. Go when the snake has passed.',
 checkpoints:[[8,3]],
 map:[
 '#################',
 '#@..L.....L....K#',
 '#...L.....L.....#',
 '#...............#',
 '#...L.....L.....#',
 '#X..L.....L..1..#',
 '#################'],
 guards:[{spawn:[7,1],facing:PI/2,patrol:[[7,1],[7,5]]},{spawn:[13,5],facing:-PI/2,patrol:[[13,5],[13,1]]}]},
{id:'tiptoe',name:'Tiptoe',sticker:'🐾',brief:'Crunchy stones are noisy! Crouch to creep across them quietly.',hint:'Hold crouch (C, or the left trigger) to creep. Crouching makes no sound.',
 checkpoints:[[5,2]],
 map:[
 '###############',
 '#@....NNN....K#',
 '#.....NNN.....#',
 '#.....NNN..2..#',
 '#X....NNN.....#',
 '###############'],
 guards:[{spawn:[11,1],facing:0,patrol:[[11,1],[12,1],[12,4],[11,4]]}]},
{id:'magic-button',name:'The Magic Button',sticker:'🔵',brief:'A blue door is shut. Step on the blue button to open it.',hint:'Walk onto the round button. Then the blue door opens.',
 map:[
 '#############',
 '#@....#..K..#',
 '#..........1#',
 '#.....#..1..#',
 '#.....#.....#',
 '#X....#.....#',
 '#############'],
 gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[2,4],tiles:[[6,2]]}],
 guards:[]},
{id:'pebble-toss',name:'Pebble Toss',sticker:'🪨',brief:'A snake guards the key. Throw a pebble so it goes to look!',hint:'Press Q (or X on a controller) to throw a pebble. The snake goes to see. Then sneak in!',
 pebbles:3,checkpoints:[[7,4]],
 map:[
 '#################',
 '#@......#.......#',
 '#.......#...K...#',
 '#.......#.......#',
 '#...........L...#',
 '#X......#....1..#',
 '#################'],
 guards:[{spawn:[10,1],facing:0,patrol:[[10,1],[14,1],[14,3],[10,3]]}]},
{id:'run-sally-run',name:'Run, Sally, Run!',sticker:'💨',brief:'Two snakes slide up and down. Dash past them!',hint:'Hold Shift (or the right trigger) to run fast. Rest in the leaves.',
 checkpoints:[[9,3]],
 map:[
 '###################',
 '#@..L.........L..K#',
 '#.................#',
 '#.................#',
 '#.................#',
 '#X..L.........L.2.#',
 '###################'],
 guards:[{spawn:[7,1],facing:PI/2,patrol:[[7,1],[7,5]]},{spawn:[12,5],facing:-PI/2,patrol:[[12,5],[12,1]]}]},
{id:'treasure-maze',name:'Treasure Maze',sticker:'💎',brief:'A maze full of treasure. How much can you find?',hint:'The glowing dots lead to the key. Wander off them for treasure!',
 checkpoints:[[9,5]],
 map:[
 '###################',
 '#@..1.#.....#..1.K#',
 '#.###.#.###.#.###.#',
 '#.#1..#.#2#...#...#',
 '#.#.###.#.#####.#.#',
 '#...#...#.....1.#.#',
 '###.#.#####.###.#.#',
 '#X..1.#2..........#',
 '###################'],
 guards:[{spawn:[16,7],facing:PI,patrol:[[16,7],[8,7]]}]},
{id:'splash-pond',name:'Splash Pond',sticker:'🐸',brief:'The key is on a little island. Swim to it!',hint:'Walk into the water to swim. Snakes cannot swim!',
 checkpoints:[[9,3]],
 map:[
 '#################',
 '#@......~~~~~...#',
 '#......~~~~~~~..#',
 '#.....~~~.K.~~..#',
 '#......~~~~~~~..#',
 '#X.......~~~~~..#',
 '#################'],
 guards:[{spawn:[15,1],facing:PI/2,patrol:[[15,1],[15,5]]}]},
{id:'big-adventure',name:'The Big Adventure',sticker:'🏆',brief:'Everything you have learned! Button, leaves, swimming and snakes.',hint:'Step on the blue button, hide in leaves, swim to the key, then go home.',
 pebbles:2,checkpoints:[[11,3],[15,4]],
 map:[
 '#########################',
 '#@...L.......#...~~~....#',
 '#....L.......#..~~K~~...#',
 '#................~~~....#',
 '#............#..........#',
 '#....L...L...#....L.....#',
 '#............#.........1#',
 '#X...L...L...#....3.....#',
 '#########################'],
 gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,4],tiles:[[13,3]]}],
 guards:[{spawn:[2,6],facing:0,patrol:[[2,6],[11,6]]},{spawn:[15,6],facing:0,patrol:[[15,6],[22,6],[22,5],[15,5]]}]},
// Part two: ten more, each showing off one more of Sally's tricks.
{id:'dig-and-hide',name:'Dig and Hide',sticker:'🐛',brief:'Soft brown dirt! Hold Burrow on it and Sally digs in, safe and hidden.',hint:'Stand on the dirt and hold E (or B on a controller). Let go to pop back out.',
 checkpoints:[[7,3]],
 map:[
 '###############',
 '#@.....d.....K#',
 '#......d......#',
 '#..d.......d..#',
 '#......d......#',
 '#X.....d....2.#',
 '###############'],
 guards:[{spawn:[10,1],facing:Math.PI/2,patrol:[[10,1],[10,5]]},{spawn:[4,5],facing:-Math.PI/2,patrol:[[4,5],[4,1]]}]},
{id:'tongue-snatch',name:'Tongue Snatch',sticker:'👅',brief:'The key is stuck behind a little gap. Sally can grab it with her long tongue!',hint:'Walk up to the gap, face the key and press R (or Y on a controller).',
 tongues:2,
 map:[
 '#############',
 '#@....._K####',
 '#.......#####',
 '#..1....#####',
 '#...........#',
 '#X.......2..#',
 '#############'],
 guards:[]},
{id:'secret-crack',name:'The Secret Crack',sticker:'🔍',brief:'A tiny crack in the wall. Only Sally is small enough to squeeze through!',hint:'Walk into the crack. The snake can\'t follow you in there.',
 checkpoints:[[7,4]],
 map:[
 '###############',
 '#@......#.....#',
 '#.......#..K..#',
 '#.......S.....#',
 '#.......#..1..#',
 '#X......#.....#',
 '###############'],
 guards:[{spawn:[3,3],facing:0,patrol:[[3,2],[6,2],[6,4],[3,4]]}]},
{id:'bounce-bounce',name:'Bounce, Bounce!',sticker:'🍄',brief:'Bouncy mushrooms fling Sally across the water. Wheee!',hint:'Step on the bouncy mushroom to fly over. There is one to bring you back too.',
 caps:[{at:[4,3],to:[10,3]},{at:[12,4],to:[3,5]}],
 map:[
 '###############',
 '#@....~~~~....#',
 '#.....~~~~....#',
 '#.....~~~~..K.#',
 '#.....~~~~....#',
 '#X....~~~~..1.#',
 '###############'],
 guards:[]},
{id:'puff-puff',name:'Puff Puff',sticker:'🌫️',brief:'Step on a spore puff and a cloud hides Sally, even while she moves!',hint:'Walk onto a round puff. Inside the cloud nobody can see you.',
 checkpoints:[[8,3]],
 map:[
 '#################',
 '#@..o.......o..K#',
 '#...............#',
 '#.......o.......#',
 '#...............#',
 '#X..o.......o.2.#',
 '#################'],
 guards:[{spawn:[6,1],facing:Math.PI/2,patrol:[[6,1],[6,5]]},{spawn:[11,5],facing:-Math.PI/2,patrol:[[11,5],[11,1]]}]},
{id:'plain-sight',name:'Hide in Plain Sight',sticker:'🦎',brief:'No leaves here! Sally can change colour to match the ground.',hint:'Press X (or click L3 on a controller) and keep still. Moving breaks the disguise.',
 camos:4,checkpoints:[[8,3]],
 map:[
 '#################',
 '#@.............K#',
 '#...............#',
 '#...............#',
 '#...............#',
 '#X...........2..#',
 '#################'],
 guards:[{spawn:[5,3],facing:0,patrol:[[5,1],[5,5]]},{spawn:[11,3],facing:Math.PI,patrol:[[11,5],[11,1]]}]},
{id:'grow-a-bush',name:'Grow a Bush',sticker:'🌱',brief:'Magic seeds grow a bush in a blink. Plant one and hide in it!',hint:'Press F (or R3 on a controller) to plant a seed, then stand in the bush.',
 seeds:3,checkpoints:[[8,3]],
 map:[
 '#################',
 '#@..............#',
 '#..............K#',
 '#...............#',
 '#...............#',
 '#X.........1....#',
 '#################'],
 guards:[{spawn:[8,1],facing:Math.PI/2,patrol:[[8,1],[8,5]]}]},
{id:'push-through',name:'Push Through',sticker:'🧱',brief:'Some walls are cracked. Sally can burrow right through them!',hint:'Face the cracked wall and press E (or B on a controller).',
 burrows:2,
 map:[
 '###############',
 '#@....B......K#',
 '#.....#.......#',
 '#.....#...2...#',
 '#######B#######',
 '#X............#',
 '###############'],
 guards:[]},
{id:'tunnel-hop',name:'Tunnel Hop',sticker:'🐇',brief:'Two holes are joined by a tunnel. Hop in one and pop out of the other!',hint:'Stand on a hole and press E (or B) to go underground.',
 tunnels:[[[3,3],[13,3]],[[13,5],[3,5]]],checkpoints:[[13,3]],
 map:[
 '#################',
 '#@.....#.....K..#',
 '#......#........#',
 '#......#........#',
 '#......#........#',
 '#X.....#..1.....#',
 '#################'],
 guards:[{spawn:[11,2],facing:0,patrol:[[10,2],[15,2],[15,4],[10,4]]}]},
{id:'great-explorer',name:'The Great Explorer',sticker:'👑',brief:'A bigger adventure with bouncing, hiding and a tiny secret passage!',hint:'Bounce over the pond, dig in or hide in a puff, squeeze through the crack, then run home.',
 pebbles:2,caps:[{at:[5,2],to:[11,2]}],checkpoints:[[11,2],[17,5]],
 map:[
 '#########################',
 '#@.....~~~~.....#.......#',
 '#....L~~~~~.d...#....K..#',
 '#.....~~~~..d...S.......#',
 '#.....~~~~..o...#...2...#',
 '#..o..........d.#.......#',
 '#X.....L........#.......#',
 '#########################'],
 guards:[{spawn:[13,1],facing:Math.PI/2,patrol:[[13,1],[13,6]]},{spawn:[20,5],facing:Math.PI,patrol:[[18,5],[23,5],[23,2],[18,2]]}]}
,
// Part three: six small adventures. Treasure is optional; the key never seals the way back.
{
  "id": "garden-gate",
  "fieldNotes": [
    {
      "id": "garden-gate-sign-1",
      "at": [3,4],
      "title": "The blue button",
      "body": "Step on the blue button to open the blue gate. The gate stays open, so there is no need to rush."
    },
    {
      "id": "garden-gate-sign-2",
      "at": [18,16],
      "title": "A little way home",
      "body": "When Sally finds the key, the little garden gate opens. Look for the new way home!"
    }
  ],
  "name": "The Garden Gate",
  "sticker": "🌷",
  "adventure": true,
  "kidsTheme": "garden",
  "brief": "The garden gate is shut, and Sally has left her key beyond the hedges. Find a way in, then bring it home.",
  "hint": "The blue button opens the garden. Watch the snake from the leaves. Finding the key opens a little path home. Treasure is just for fun!",
  "pebbles": 3,
  "seeds": 2,
  "checkpoints": [
    [12,9],
    [27,5]
  ],
  "gates": [
    {
      "id": "garden-blue",
      "name": "Garden",
      "color": [106,195,236],
      "switch": [4,3],
      "tiles": [
        [15,8],
        [15,9],
        [15,10]
      ]
    },
    {
      "id": "garden-home",
      "name": "Home path",
      "color": [244,192,93],
      "tiles": [
        [15,15],
        [15,16]
      ]
    }
  ],
  "reactions": [
    {
      "id": "garden-key",
      "when": "key",
      "open": [
        "garden-home"
      ],
      "message": "The little garden gate swings open. A shorter way home!",
      "objective": "Bring the key back to the green door."
    }
  ],
  "guards": [
    {
      "spawn": [21,13],
      "patrol": [
        [19,12],
        [27,12],
        [27,15],
        [19,15]
      ],
      "facing": 3.141592653589793
    }
  ],
  "map": [
    "###############################",
    "#.............###.............#",
    "#.1.........1.###.............#",
    "#.............###..1.......K..#",
    "#..........L..###....L........#",
    "#.............###..........L..#",
    "#..L..........###.............#",
    "#....######...###.....####....#",
    "#....######...........####.3..#",
    "#..1.######.L......L..####....#",
    "#....######...........####....#",
    "#....######...###.............#",
    "#.............###...NNN.......#",
    "#..L..........###..........L..#",
    "#..........1..###.............#",
    "#..@..........................#",
    "#..X..............L.1.......1.#",
    "#.............###.............#",
    "###############################"
  ]
},
{
  "id": "beetle-courtyard",
  "fieldNotes": [
    {
      "id": "beetle-courtyard-sign-1",
      "at": [11,13],
      "title": "Watch the horn",
      "body": "The beetle lowers its horn before charging. Step sideways out of its lane. It cannot turn during a charge."
    },
    {
      "id": "beetle-courtyard-sign-2",
      "at": [26,13],
      "title": "Small enough for Sally",
      "body": "The tiny crack is a safe way into the treasure room. Sally fits through; the beetle does not."
    }
  ],
  "name": "Beetle Courtyard",
  "sticker": "🪲",
  "adventure": true,
  "kidsTheme": "ruins",
  "brief": "A beetle has made the old courtyard its playground. Sally can go round the planter, or try slipping past its charging lane.",
  "hint": "When the beetle lowers its horn, step sideways. The south path has room to go round. A tiny crack leads to the treasure room.",
  "pebbles": 3,
  "spores": 2,
  "checkpoints": [
    [10,14],
    [27,5]
  ],
  "guards": [
    {
      "kind": "beetle",
      "spawn": [17,4],
      "facing": 0,
      "patrol": [
        [12,4],
        [22,4]
      ]
    }
  ],
  "map": [
    "#################################",
    "#########################.......#",
    "#########.1.............#..1....#",
    "#########....................K..#",
    "#########............L..........#",
    "#########..L....3..........L....#",
    "#########...............#.....1.#",
    "#########.....#####...o.#.......#",
    "#########.....#####.....#########",
    "#########..d..#####.....#########",
    "#########.....#####.d.1.#########",
    "#.......#.....#####.....#.......#",
    "#....1..#...o...........#.......#",
    "#...L................L..#.......#",
    "#.........L.............S..L....#",
    "#..@........1...........#....1..#",
    "#..X....#...............#.......#",
    "#.......#################.......#",
    "#################################"
  ]
},
{
  "id": "lily-pond",
  "fieldNotes": [
    {
      "id": "lily-pond-sign-1",
      "at": [6,8],
      "title": "A bouncy shortcut",
      "body": "Step onto a bouncy mushroom and Sally flies to the landing spot. You can swim across this pond, too."
    },
    {
      "id": "lily-pond-sign-2",
      "at": [16,7],
      "title": "The toad takes aim",
      "body": "The toad puffs its throat before firing its tongue. Hide behind leaves or turn a corner. Its little treasure island is optional."
    }
  ],
  "name": "Across the Lily Pond",
  "sticker": "🪷",
  "adventure": true,
  "kidsTheme": "river",
  "brief": "The key is on the far bank. Bounce between the islands, paddle through the pond, and see what the little island in the north is hiding.",
  "hint": "The pond is safe to swim in. Mushrooms make the trip quicker! A toad watches the little treasure island; hide behind leaves or change direction when it aims.",
  "pebbles": 3,
  "tongues": 2,
  "checkpoints": [
    [14,8],
    [28,12]
  ],
  "caps": [
    {
      "at": [7,7],
      "to": [14,8]
    },
    {
      "at": [20,13],
      "to": [28,12]
    },
    {
      "at": [27,15],
      "to": [7,16]
    }
  ],
  "guards": [
    {
      "kind": "toad",
      "spawn": [18,2],
      "facing": 1.5707963267948966,
      "patrol": [
        [18,2]
      ]
    }
  ],
  "map": [
    "###################################",
    "#~~~~~~~~~~~~~~.......~~~~~~~~~~~~#",
    "#........~~~~~~.......~~~~........#",
    "#.1......~~~~~~.L...3.~~~~........#",
    "#........~~~~~~.......~~~~....K...#",
    "#........~~~~~~~~~~~~~~~~~........#",
    "#......L.~~~~~~~~~~~~~~~~~....L...#",
    "#........~~~~.........~~~~........#",
    "#........~~~~.L....o1.~~~~........#",
    "#........~~~~.........~~~~......1.#",
    "#......1.~~~~....##...~~~~........#",
    "#...###..~~~~....##...~~~~........#",
    "#...###..~~~~....##...~~~~..L.....#",
    "#...###..~~~~.1.....L.~~~~........#",
    "#........~~~~.........~~~~........#",
    "#..L.....~~~~.........~~~~........#",
    "#........~~~~~~~~~~~~~~~~~........#",
    "#..@.....~~~~~~~~~~~~~~~~~.....1..#",
    "#..X....1~~~~~~~~~~~~~~~~~........#",
    "#........~~~~~~~~~~~~~~~~~~~~~~~~~#",
    "###################################"
  ]
},
{
  "id": "lantern-house",
  "fieldNotes": [
    {
      "id": "lantern-house-sign-1",
      "at": [10,4],
      "title": "A button out of reach",
      "body": "Face the blue button across the gap and use Tongue. Sally can flick buttons as well as grab keys."
    },
    {
      "id": "lantern-house-sign-2",
      "at": [15,18],
      "title": "Borrow a little light",
      "body": "Throw a glow mushroom to light a dark corner. Its light can show Sally to a creature, too."
    }
  ],
  "name": "The Old Lantern House",
  "sticker": "🏮",
  "adventure": true,
  "kidsTheme": "ruins",
  "brief": "There is a warm glow in the old house. Its blue button is across a gap, just within reach of Sally's tongue.",
  "hint": "At the little gap, face the blue button and use Tongue. Throw a glow mushroom to look round dark corners. The key is in the north of the far wing.",
  "tongues": 2,
  "glows": 2,
  "pebbles": 2,
  "explore": true,
  "dark": true,
  "sightRadius": 5,
  "glowPlants": [
    [3,19],
    [3,5],
    [11,4],
    [11,17],
    [15,18],
    [20,11],
    [24,11],
    [28,4],
    [29,18]
  ],
  "checkpoints": [
    [11,5],
    [20,11],
    [29,5]
  ],
  "gates": [
    {
      "id": "lantern-blue",
      "name": "Lantern wing",
      "color": [106,195,236],
      "switch": [15,4],
      "tiles": [
        [22,11],
        [22,12]
      ]
    }
  ],
  "guards": [
    {
      "spawn": [28,18],
      "patrol": [
        [24,18],
        [30,18],
        [30,20],
        [24,20]
      ],
      "facing": 3.141592653589793
    }
  ],
  "map": [
    "#################################",
    "#............##########.........#",
    "#.1..........##########.........#",
    "#............##########..1..K...#",
    "#............__.#######.........#",
    "#.........L..##########..L...L..#",
    "#............##########.........#",
    "#............##########.........#",
    "#....#####...##########.........#",
    "#....#####...#........#...###...#",
    "#....#####.1.#.1......#...###...#",
    "#....#####...#......L.....###.1.#",
    "#....#####...#............###...#",
    "#....#####...#...###..#...###...#",
    "#............#...###..#.........#",
    "#.1........L.#...###..#.........#",
    "#............#...###..#......d..#",
    "#..L..................#..L......#",
    "#.....................#.........#",
    "#..@.........#.L......#.........#",
    "#...X........#......1.#.......3.#",
    "#............#........#.........#",
    "#################################"
  ]
},
{
  "id": "sleepy-steamworks",
  "fieldNotes": [
    {
      "id": "sleepy-steamworks-sign-1",
      "at": [12,13],
      "title": "Listen for the hiss",
      "body": "The vent hisses before it puffs. Wait for quiet before crossing, or take the longer path round."
    },
    {
      "id": "sleepy-steamworks-sign-2",
      "at": [27,14],
      "title": "The ticking door",
      "body": "Step on a round plate to open this treasure door. It closes after a while. A plate on each side opens it again."
    }
  ],
  "name": "The Sleepy Steamworks",
  "sticker": "⚙️",
  "adventure": true,
  "kidsTheme": "vents",
  "brief": "The sleepy works puffs once in a while. Two buttons open the key room. A ticking treasure door waits in a side room.",
  "hint": "Blue opens the workshop, amber opens the key room. The vent hisses before it puffs; wait, or go round. The treasure door can always be opened again from either side.",
  "pebbles": 2,
  "seeds": 2,
  "checkpoints": [
    [11,14],
    [20,12],
    [28,7]
  ],
  "vents": [
    {
      "at": [14,5],
      "dir": [0,1],
      "length": 7,
      "period": 8,
      "on": 1.3,
      "offset": 0,
      "warn": 1.8
    }
  ],
  "gates": [
    {
      "id": "works-blue",
      "name": "Workshop",
      "color": [106,195,236],
      "switch": [12,3],
      "tiles": [
        [18,8],
        [18,9],
        [18,10]
      ]
    },
    {
      "id": "works-amber",
      "name": "Key room",
      "color": [244,192,93],
      "switch": [22,17],
      "tiles": [
        [25,5],
        [26,5]
      ]
    },
    {
      "id": "works-treasure",
      "name": "Ticking treasure",
      "color": [191,154,230],
      "plates": [
        [28,16],
        [32,16]
      ],
      "tiles": [
        [29,16]
      ],
      "duration": 7
    }
  ],
  "guards": [],
  "map": [
    "###################################",
    "##########........#......##.......#",
    "##########.1......#......##.......#",
    "##########........#..1...##....K..#",
    "##########......L.#......##.......#",
    "##########.L......#...............#",
    "##########........#......##.......#",
    "##########........#......##.L.....#",
    "##########.....NN........##.....1.#",
    "##########......3...L....##.......#",
    "##########...............##########",
    "##########........#......##########",
    "##########........#......##..#....#",
    "#........#........#......##.1#....#",
    "#.....1..#.L......#......##..#....#",
    "#...L.............#...L..##..#..1.#",
    "#.................#...............#",
    "#..@.....#......1.#......##.L#..L.#",
    "#..X.....#........#......##..#....#",
    "#........#........#......##..#....#",
    "###################################"
  ]
},
{
  "id": "sallys-way-home",
  "fieldNotes": [
    {
      "id": "sallys-way-home-sign-1",
      "at": [9,4],
      "title": "Home by the pond",
      "body": "The key opens a second gate beside the pond. Try that way back. All the treasure is just for fun."
    },
    {
      "id": "sallys-way-home-sign-2",
      "at": [28,14],
      "title": "A cloud to hide in",
      "body": "Throw a spore pouch. Its cloud hides Sally even while she moves. Creatures inside the cloud cannot see her."
    }
  ],
  "name": "Sally's Way Home",
  "sticker": "🏡",
  "adventure": true,
  "kidsTheme": "garden",
  "brief": "One last little journey: through the garden, across the courtyard, and back by the pond. Home is waiting under the warm stone.",
  "hint": "The garden button opens the far wing. Find the key there, then take the new pond path home. Mushrooms and tunnels make lovely shortcuts. Every treasure is optional.",
  "pebbles": 3,
  "seeds": 2,
  "spores": 2,
  "checkpoints": [
    [14,3],
    [34,6],
    [23,18]
  ],
  "tunnels": [
    [
      [6,7],
      [6,18]
    ]
  ],
  "caps": [
    {
      "at": [23,18],
      "to": [14,18]
    },
    {
      "at": [14,14],
      "to": [23,14]
    }
  ],
  "gates": [
    {
      "id": "home-blue",
      "name": "Far wing",
      "color": [106,195,236],
      "switch": [7,4],
      "tiles": [
        [25,5],
        [26,5],
        [25,6],
        [26,6]
      ]
    },
    {
      "id": "home-pond",
      "name": "Pond path",
      "color": [244,192,93],
      "tiles": [
        [25,18],
        [26,18],
        [25,19],
        [26,19]
      ]
    }
  ],
  "reactions": [
    {
      "id": "home-key",
      "when": "key",
      "open": [
        "home-pond"
      ],
      "message": "The pond gate opens. Sally can see the way home!",
      "objective": "Follow the pond path back to the green door."
    }
  ],
  "guards": [
    {
      "spawn": [8,16],
      "patrol": [
        [7,14],
        [10,14],
        [10,17],
        [7,17]
      ],
      "facing": 3.141592653589793
    },
    {
      "kind": "beetle",
      "spawn": [19,9],
      "facing": 0,
      "patrol": [
        [15,9],
        [23,9]
      ]
    },
    {
      "kind": "toad",
      "spawn": [34,17],
      "facing": 1.5707963267948966,
      "patrol": [
        [34,17]
      ]
    }
  ],
  "map": [
    "#######################################",
    "#...........#............##...........#",
    "#...........#.........1..##...........#",
    "#..@........#.L........L.##..1....K...#",
    "#...........#....####....##...........#",
    "#..L......L......####.......L.........#",
    "#................####.............L...#",
    "#...........#............##...........#",
    "#.1...L.....#..1......o..##...........#",
    "#...........#..........L.##....####...#",
    "#....####...#............##....####...#",
    "#....####...##..#######..##....####...#",
    "#....####...#............##....####...#",
    "#...........#..~~~~~~~...##...........#",
    "#...........#.1~~~~~~~...##...........#",
    "#...L.....d.#..~~~~~~~...##..o........#",
    "#........1..#..~~~~~~~...##.L.........#",
    "#..............~~~~~~~...##...d.......#",
    "#.............L~~~~~~~..............L.#",
    "#..X......L.#..~~~~~~~..............3.#",
    "#...........#..~~~~~~~1..##...........#",
    "#...........#............##...........#",
    "#######################################"
  ]
},
// Part four: five braver adventures. Each is a step harder: more creatures, longer trails, a second area.
{
  "id": "seashell-beach",
  "fieldNotes": [
    {
      "id": "seashell-beach-sign-1",
      "at": [5,3],
      "title": "Sandy feet",
      "body": "Soft sand is slow to walk on. Snakes are slow on it too. Wait in the beach grass until the snake slides away."
    },
    {
      "id": "seashell-beach-sign-2",
      "at": [25,12],
      "title": "Snakes cannot swim",
      "body": "The lagoon is safe for Sally. Swim home, or follow the boardwalk. The crab only pinches near its rock pool."
    }
  ],
  "name": "Seashell Beach",
  "sticker": "🐚",
  "adventure": true,
  "kidsTheme": "coast",
  "gentle": 0.64,
  "brief": "A sunny beach day! Sally's key is in the sandcastle. A button by the lagoon opens its door.",
  "hint": "Press the blue button by the water, then slip into the sandcastle. The key opens its back door. Swim home: snakes cannot swim! Treasure is just for fun.",
  "pebbles": 3,
  "spores": 2,
  "checkpoints": [
    [10,4],
    [26,5],
    [28,12]
  ],
  "caps": [
    {
      "at": [12,12],
      "to": [16,14]
    },
    {
      "at": [17,16],
      "to": [20,12]
    }
  ],
  "gates": [
    {
      "id": "beach-blue",
      "name": "Sandcastle",
      "color": [106,195,236],
      "switch": [22,11],
      "tiles": [
        [24,4],
        [24,5]
      ]
    },
    {
      "id": "beach-back",
      "name": "Back door",
      "color": [244,192,93],
      "tiles": [
        [29,11]
      ]
    }
  ],
  "reactions": [
    {
      "id": "beach-key",
      "when": "key",
      "open": [
        "beach-back"
      ],
      "message": "The sandcastle's back door opens onto the beach!",
      "objective": "Swim or walk the boardwalk back to the green door."
    }
  ],
  "guards": [
    {
      "spawn": [14,6],
      "patrol": [
        [10,6],
        [23,6]
      ],
      "facing": 0
    },
    {
      "spawn": [30,14],
      "patrol": [
        [26,14],
        [32,14]
      ],
      "facing": 3.141592653589793
    },
    {
      "kind": "crab",
      "spawn": [32,16],
      "axis": "y",
      "range": 2,
      "patrol": [
        [32,16]
      ],
      "facing": 3.141592653589793
    }
  ],
  "map": [
    "###################################",
    "#.......#..........1....###########",
    "#.1.....#..............L#...#....##",
    "#..............L........#.L.#..2.##",
    "#...........ss..............#....##",
    "#.........L.ss......L............##",
    "#...L...#.......o.......#...#..K.##",
    "#.......#..##....ss.....#...#....##",
    "#.......#..##....ss.....#........##",
    "#..ss...#.......##....L.#.L....L.##",
    "#..ss...#.....L.##......#........##",
    "#.......#.1.............#####.#####",
    "#.......#.........................#",
    "#.L.....#~~~~~~~~~~~~~~~~..L......#",
    "#.......#~~~~~~...~~~~~~~.........#",
    "#.......#~~~~~~.3.~~~~~~~.........#",
    "#.......#~~~~~~...~~~~~~~..o......#",
    "#..@....#~~~~~~~~~~~~~~~~.......2.#",
    "#..X........L......L.sss..L.......#",
    "#..............................L..#",
    "###################################"
  ]
},
{
  "id": "snowy-hilltop",
  "fieldNotes": [
    {
      "id": "snowy-hilltop-sign-1",
      "at": [33,16],
      "title": "Behind the snowy rocks",
      "body": "The snake slides along the top of this slope. Walk along the bottom, behind the rocks, and wait in a bush when it comes back."
    },
    {
      "id": "snowy-hilltop-sign-2",
      "at": [9,12],
      "title": "An icy gap",
      "body": "The blue switch is across the icy gap. Stand here, face the switch and use Tongue to flick it."
    }
  ],
  "name": "The Snowy Hilltop",
  "sticker": "⛄",
  "adventure": true,
  "kidsTheme": "frost",
  "gentle": 0.66,
  "brief": "Snow on the hill! Sally's key is in the hut at the very top. Climb the slopes past a snake and a beetle.",
  "hint": "Tongue the blue switch across the icy gap. Step out of the beetle's lane. The amber button opens the hut. The key opens a sled run home. Wheee!",
  "tongues": 2,
  "pebbles": 3,
  "checkpoints": [
    [33,17],
    [4,13],
    [27,8],
    [25,5]
  ],
  "tunnels": [
    [
      [12,22],
      [16,20]
    ]
  ],
  "caps": [
    {
      "at": [35,1],
      "to": [6,22]
    }
  ],
  "gates": [
    {
      "id": "snow-blue",
      "name": "Upper slope",
      "color": [106,195,236],
      "switch": [7,9],
      "tiles": [
        [1,11],
        [2,11],
        [3,11]
      ]
    },
    {
      "id": "snow-amber",
      "name": "Hut door",
      "color": [244,192,93],
      "switch": [2,2],
      "tiles": [
        [17,3]
      ]
    },
    {
      "id": "snow-sled",
      "name": "Sled run",
      "color": [191,154,230],
      "tiles": [
        [34,1]
      ]
    }
  ],
  "reactions": [
    {
      "id": "snow-key",
      "when": "key",
      "open": [
        "snow-sled"
      ],
      "message": "The sled run is open! A quick way home.",
      "objective": "Ride the sled run, or walk down, to the green door."
    }
  ],
  "guards": [
    {
      "spawn": [18,13],
      "patrol": [
        [4,13],
        [33,13]
      ],
      "facing": 3.141592653589793
    },
    {
      "kind": "beetle",
      "spawn": [17,10],
      "facing": 0,
      "patrol": [
        [24,10],
        [11,10]
      ]
    },
    {
      "spawn": [7,3],
      "patrol": [
        [7,1],
        [7,5]
      ],
      "facing": -1.5707963267948966
    }
  ],
  "map": [
    "#####################################",
    "#.........L..#...K..2#..............#",
    "#............#.......#........L...###",
    "#............####.####..............#",
    "#..L................................#",
    "#...........L.......................#",
    "##########################...########",
    "#....L.......L........L.......#...2.#",
    "#.......##......##............#.....#",
    "#.......##......##............S.....#",
    "#......_............L.........#..1..#",
    "#...###_#############################",
    "#..................2................#",
    "#.................................L.#",
    "#.....###....###....###....###......#",
    "#...L.###....###....###....###......#",
    "#...................................#",
    "#.........L......L......L......L....#",
    "################################....#",
    "#..........L...#####................#",
    "#..............#.2.#.....L..........#",
    "#..@..L........#####................#",
    "#..X................................#",
    "#.................1.................#",
    "#####################################"
  ]
}
  ];
  root.EscapeKids=routes;
  if(typeof module!=='undefined'&&module.exports)module.exports=routes;
})(typeof globalThis!=='undefined'?globalThis:this);
