// Compact, authored autumn escapes. See docs/SEASONS.md.
(function(root){const routes=[
  {
    "id": "autumn-orchard",
    "wind": [{"area": [1, 1, 5, 3], "dir": [1, 0], "period": 5, "on": 5, "offset": 0, "strength": 1.1}],
    "name": "The Orchard Gate",
    "difficulty": "Easy",
    "seasonalTheme": "autumn",
    "brief": "An orchard switch, a patrolling serpent and a little gate home.",
    "hint": "The amber switch is in the north orchard. The key opens the lower return gate. Leaf pockets and corners break the serpent's sight. A steady breeze blows leaves east through the north-west room; a pebble thrown across it lands downwind.",
    "index": 0,
    "revision": 2,
    "cunning": 0,
    "pebbles": 2,
    "tongues": 1,
    "guards": [
      {
        "kind": "snake",
        "spawn": [
          15,
          6
        ],
        "patrol": [
          [
            13,
            6
          ],
          [
            17,
            6
          ]
        ],
        "facing": 0
      }
    ],
    "gates": [
      {
        "id": "orchard",
        "name": "orchard",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            12,
            2
          ]
        ],
        "switch": [
          3,
          2
        ]
      },
      {
        "id": "orchard-home",
        "name": "orchard home",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            12,
            10
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-orchard-note-0",
        "at": [
          4,
          10
        ],
        "title": "The orchard keeper",
        "body": "The old switch still works. The little gate at the bottom answers to the golden key. Keep your pebbles for a tight corner."
      }
    ],
    "props": [
      {
        "at": [
          12,
          1
        ],
        "kind": "lantern"
      },
      {
        "at": [
          6,
          3
        ],
        "kind": "lantern"
      },
      {
        "at": [
          13,
          4
        ],
        "kind": "tree"
      },
      {
        "at": [
          18,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          12,
          6
        ],
        "kind": "lantern"
      },
      {
        "at": [
          19,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          1,
          8
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "lantern"
      },
      {
        "at": [
          16,
          8
        ],
        "kind": "lantern"
      },
      {
        "at": [
          12,
          11
        ],
        "kind": "tree"
      }
    ],
    "spores": 1,
    "reactions": [
      {
        "id": "orchard-key",
        "when": "key",
        "open": [
          "orchard-home"
        ],
        "message": "The little return gate swings open.",
        "objective": "Return to the green door."
      }
    ],
    "map": [
      "#####################",
      "#.....#.....#.......#",
      "#.1...#.......1...K.#",
      "#.....#L1...#L....1.#",
      "###.###.....#####.###",
      "#.....#.....#.....###",
      "#...1...#.###.1...###",
      "#..L..#.....#...L.###",
      "###.###..L1.#####.###",
      "#.1...#.....#....L..#",
      "#.@...#.1.........1.#",
      "#.X...#.....#.......#",
      "#####################"
    ]
  },
  {
    "id": "autumn-pumpkins",
    "name": "The Pumpkin Patch",
    "difficulty": "Easy",
    "seasonalTheme": "autumn",
    "brief": "Two pumpkin sentries watch the garden loops. Choose where to cross.",
    "hint": "Open the north gate from the west garden. The centre switch opens a second way home. Step sideways when a pumpkin aims its vine. Don't stand about in the muddy patch: Sally sinks, and running through it splashes.",
    "index": 1,
    "revision": 2,
    "cunning": 0,
    "pebbles": 2,
    "tongues": 1,
    "guards": [
      {
        "kind": "toad",
        "spawn": [
          9,
          2
        ],
        "patrol": [
          [
            9,
            2
          ]
        ],
        "facing": 1.5707963267948966
      },
      {
        "kind": "toad",
        "spawn": [
          16,
          8
        ],
        "patrol": [
          [
            16,
            8
          ]
        ],
        "facing": -1.5707963267948966
      }
    ],
    "gates": [
      {
        "id": "north-patch",
        "name": "north patch",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            14,
            2
          ]
        ],
        "switch": [
          3,
          8
        ]
      },
      {
        "id": "south-patch",
        "name": "south patch",
        "color": [
          141,
          184,
          109
        ],
        "tiles": [
          [
            14,
            10
          ]
        ],
        "switch": [
          10,
          6
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-pumpkins-note-0",
        "at": [
          4,
          8
        ],
        "title": "Straight as a vine",
        "body": "A pumpkin can lash in a straight line. The beds leave room to step sideways. Open the south gate if you want another way back."
      }
    ],
    "props": [
      {
        "at": [
          6,
          3
        ],
        "kind": "lantern"
      },
      {
        "at": [
          8,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          13,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          12,
          6
        ],
        "kind": "lantern"
      },
      {
        "at": [
          14,
          7
        ],
        "kind": "lantern"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "lantern"
      },
      {
        "at": [
          11,
          8
        ],
        "kind": "tree"
      }
    ],
    "spores": 1,
    "map": [
      "#####################",
      "#.....#1......#.....#",
      "#.1.............1...#",
      "#.....#L...1..#...K.#",
      "#..L..###.#####.....#",
      "#...1.#.....###.L.1.#",
      "#.....#1L...#####.###",
      "#.....#.....###...L.#",
      "#.....###.#####.....#",
      "#.....#.MMMMM.#.....#",
      "#.@.1.....1..L.....1#",
      "#.X...#.......#.....#",
      "#####################"
    ]
  },
  {
    "id": "autumn-gardener",
    "name": "The Gardener’s Yard",
    "difficulty": "Easy–medium",
    "seasonalTheme": "autumn-dusk",
    "brief": "Turn the garden wheel, cross the working yard, then unlock the potting shed.",
    "hint": "The blue switch opens the yard. Find the green shed switch beyond it. A gardener commits to its charge; use the stone beds to turn aside.",
    "index": 2,
    "revision": 2,
    "cunning": 1,
    "pebbles": 2,
    "tongues": 1,
    "guards": [
      {
        "kind": "beetle",
        "spawn": [
          13,
          7
        ],
        "patrol": [
          [
            12,
            7
          ],
          [
            14,
            7
          ]
        ],
        "facing": 0
      },
      {
        "kind": "snake",
        "spawn": [
          20,
          10
        ],
        "patrol": [
          [
            19,
            10
          ],
          [
            20,
            10
          ]
        ],
        "facing": 0
      }
    ],
    "gates": [
      {
        "id": "yard",
        "name": "yard",
        "color": [
          131,
          190,
          218
        ],
        "tiles": [
          [
            7,
            3
          ]
        ],
        "switch": [
          3,
          11
        ]
      },
      {
        "id": "potting-shed",
        "name": "potting shed",
        "color": [
          141,
          184,
          109
        ],
        "tiles": [
          [
            15,
            3
          ]
        ],
        "switch": [
          10,
          8
        ]
      },
      {
        "id": "yard-home",
        "name": "yard home",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            15,
            12
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-gardener-note-0",
        "at": [
          2,
          11
        ],
        "title": "The gardener's wheel",
        "body": "Blue first, green second. A charge is very determined about its direction, even after you have stepped behind a stone bed."
      }
    ],
    "props": [
      {
        "at": [
          7,
          1
        ],
        "kind": "lantern"
      },
      {
        "at": [
          10,
          5
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          15,
          5
        ],
        "kind": "lantern"
      },
      {
        "at": [
          2,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          7,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          17,
          6
        ],
        "kind": "lantern"
      },
      {
        "at": [
          4,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          19,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          1,
          8
        ],
        "kind": "lantern"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "tree"
      },
      {
        "at": [
          11,
          8
        ],
        "kind": "tree"
      },
      {
        "at": [
          16,
          8
        ],
        "kind": "lantern"
      },
      {
        "at": [
          21,
          8
        ],
        "kind": "tree"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          10,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          15,
          10
        ],
        "kind": "tree"
      },
      {
        "at": [
          7,
          11
        ],
        "kind": "pumpkin"
      }
    ],
    "spores": 1,
    "reactions": [
      {
        "id": "yard-key",
        "when": "key",
        "open": [
          "yard-home"
        ],
        "message": "The potting-shed key opens the lower yard gate."
      }
    ],
    "map": [
      "#######################",
      "#......#.......#......#",
      "#.@..1.#.1.....#.1..K.#",
      "#.....................#",
      "#...L..#L....1.#....1.#",
      "#.1....##.#.####.L....#",
      "###.####.......###.####",
      "###.####...........####",
      "###.####.L.##..###.####",
      "#......#.1...L.#..#...#",
      "#......####.####.L#...#",
      "#....1.#.......#..#...#",
      "#.X..........1....#.L.#",
      "#......#.......#....1.#",
      "#######################"
    ]
  },
  {
    "id": "autumn-lanterns",
    "name": "Lantern Lane",
    "difficulty": "Medium",
    "seasonalTheme": "autumn-night",
    "brief": "Carry a lantern through two courtyards watched by a ghost.",
    "hint": "The centre switch opens the upper lanes. Shelter beside the hedges when the ghost glares. The southern loop offers room to break a serpent's sight, and a second serpent patrols the courtyard.",
    "index": 3,
    "revision": 2,
    "cunning": 2,
    "pebbles": 2,
    "tongues": 1,
    "guards": [
      {
        "kind": "owl",
        "spawn": [
          16,
          3
        ],
        "patrol": [
          [
            8,
            2
          ],
          [
            20,
            2
          ],
          [
            16,
            3
          ]
        ],
        "facing": 3.141592653589793
      },
      {
        "kind": "snake",
        "spawn": [
          18,
          11
        ],
        "patrol": [
          [
            17,
            11
          ],
          [
            20,
            11
          ]
        ],
        "facing": 0
      },
      {
        "id": "courtyard-snake",
        "kind": "snake",
        "spawn": [
          9,
          8
        ],
        "patrol": [
          [
            5,
            8
          ],
          [
            14,
            8
          ]
        ],
        "facing": 0
      }
    ],
    "gates": [
      {
        "id": "lantern-walk",
        "name": "lantern walk",
        "color": [
          131,
          190,
          218
        ],
        "tiles": [
          [
            1,
            4
          ],
          [
            2,
            4
          ],
          [
            3,
            4
          ],
          [
            6,
            4
          ],
          [
            7,
            4
          ],
          [
            19,
            4
          ],
          [
            20,
            4
          ],
          [
            21,
            4
          ]
        ],
        "switch": [
          12,
          7
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-lanterns-note-0",
        "at": [
          3,
          11
        ],
        "title": "Borrowed lanterns",
        "body": "Light helps you read the courtyard. It also helps the serpent read you. The ghost shows the place it means to land; leave that place before it arrives."
      }
    ],
    "props": [
      {
        "at": [
          8,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          13,
          4
        ],
        "kind": "tree"
      },
      {
        "at": [
          18,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          5,
          5
        ],
        "kind": "tree"
      },
      {
        "at": [
          10,
          5
        ],
        "kind": "lantern"
      },
      {
        "at": [
          15,
          5
        ],
        "kind": "tree"
      },
      {
        "at": [
          4,
          7
        ],
        "kind": "lantern"
      },
      {
        "at": [
          8,
          9
        ],
        "kind": "tree"
      },
      {
        "at": [
          13,
          9
        ],
        "kind": "lantern"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          5,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          10,
          10
        ],
        "kind": "tree"
      }
    ],
    "glows": 1,
    "explore": true,
    "dark": true,
    "sightRadius": 4.5,
    "spores": 1,
    "map": [
      "#######################",
      "#.......1...........1.#",
      "#.1............###..K.#",
      "#......L....1......L..#",
      "#...##..###########...#",
      "#...##..###########...#",
      "#...#..L..........#...#",
      "#...#.1...L.....1.#L.1#",
      "#..L#..........L..#...#",
      "#...#######.###..##...#",
      "#..1#######.###..##...#",
      "#.....................#",
      "#.@.......1..L........#",
      "#.X...............1...#",
      "#######################"
    ]
  },
  {
    "id": "autumn-store",
    "crates": [[17, 6], [19, 12]],
    "name": "The Harvest Store",
    "difficulty": "Medium",
    "seasonalTheme": "autumn-dusk",
    "brief": "Find three store switches among narrow shelves and suspicious treat baskets.",
    "hint": "Blue opens the first aisle, green the centre shelves, amber the pantry. A twitching basket can be exposed with a pebble. A serpent circles the pantry: slip in behind it. The key opens the lower delivery doors. Hay bales in the east room hide you from the serpent; walk into one to shove it (it scrapes loudly).",
    "index": 4,
    "revision": 2,
    "cunning": 2,
    "pebbles": 2,
    "tongues": 1,
    "guards": [
      {
        "kind": "mimic",
        "spawn": [
          9,
          3
        ],
        "patrol": [
          [
            9,
            3
          ]
        ],
        "facing": 0
      },
      {
        "kind": "mimic",
        "spawn": [
          13,
          8
        ],
        "patrol": [
          [
            13,
            8
          ]
        ],
        "facing": 0
      },
      {
        "id": "pantry-snake",
        "kind": "snake",
        "spawn": [
          18,
          2
        ],
        "patrol": [
          [
            21,
            2
          ],
          [
            21,
            5
          ],
          [
            15,
            5
          ],
          [
            15,
            2
          ]
        ],
        "facing": 0
      }
    ],
    "gates": [
      {
        "id": "blue-entry",
        "name": "blue entry",
        "color": [
          131,
          190,
          218
        ],
        "tiles": [
          [
            6,
            3
          ]
        ],
        "switch": [
          3,
          11
        ]
      },
      {
        "id": "green-shelves",
        "name": "green shelves",
        "color": [
          141,
          184,
          109
        ],
        "tiles": [
          [
            10,
            7
          ]
        ],
        "switch": [
          8,
          12
        ]
      },
      {
        "id": "amber-pantry",
        "name": "amber pantry",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            14,
            5
          ]
        ],
        "switch": [
          12,
          3
        ]
      },
      {
        "id": "store-home",
        "name": "store home",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            6,
            11
          ],
          [
            14,
            11
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-store-note-0",
        "at": [
          4,
          10
        ],
        "title": "Stocktaking",
        "body": "Three honest switches and two dishonest baskets. The key opens the delivery doors, so you need not thread every shelf twice."
      }
    ],
    "props": [
      {
        "at": [
          14,
          2
        ],
        "kind": "lantern"
      },
      {
        "at": [
          18,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          10,
          5
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          4,
          7
        ],
        "kind": "lantern"
      },
      {
        "at": [
          14,
          7
        ],
        "kind": "lantern"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "tree"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          10,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          14,
          12
        ],
        "kind": "lantern"
      },
      {
        "at": [
          6,
          13
        ],
        "kind": "tree"
      }
    ],
    "spores": 1,
    "reactions": [
      {
        "id": "store-key",
        "when": "key",
        "open": [
          "store-home"
        ],
        "message": "The delivery doors open. There is a short way home."
      }
    ],
    "map": [
      "#######################",
      "#.....#...#...#.......#",
      "#.@.1.#.1.#.1.#.1...K.#",
      "#.........#...#..###..#",
      "#...L.#...#...#..###..#",
      "#.....#...#.....L.....#",
      "#.....#...#.L.#.......#",
      "###.###1......#.......#",
      "#.....#.L.#...#..###..#",
      "#.....#...#...#..###..#",
      "#.1...#...#...#..###..#",
      "#.........#.........L.#",
      "#.X..1#...#.L.#.....1.#",
      "#.....#.1.#..1#.......#",
      "#######################"
    ]
  },
  {
    "id": "autumn-mill",
    "ropes": [{"from": [9, 13], "to": [15, 13], "period": 5}],
    "name": "The Hollow Mill",
    "difficulty": "Medium–hard",
    "seasonalTheme": "autumn-mill",
    "brief": "Flick the bridge wheel across the millrace, then slip past a very alert roast turkey.",
    "hint": "From the west bank, face the blue wheel and use Tongue. The loft switch opens the key room. Creep past the turkey, or throw a pebble away from your crossing. A rope swings across the south end of the millrace: stand on its mark and ride it over.",
    "index": 5,
    "revision": 2,
    "cunning": 2,
    "pebbles": 2,
    "tongues": 2,
    "guards": [
      {
        "kind": "fox",
        "spawn": [
          16,
          7
        ],
        "patrol": [
          [
            16,
            7
          ],
          [
            16,
            8
          ]
        ],
        "facing": 1.5707963267948966
      },
      {
        "kind": "toad",
        "spawn": [
          23,
          10
        ],
        "patrol": [
          [
            23,
            10
          ]
        ],
        "facing": 3.141592653589793
      }
    ],
    "gates": [
      {
        "id": "millrace-bridge",
        "name": "millrace bridge",
        "color": [
          131,
          190,
          218
        ],
        "tiles": [
          [
            10,
            4
          ],
          [
            11,
            4
          ],
          [
            12,
            4
          ],
          [
            13,
            4
          ],
          [
            14,
            4
          ]
        ],
        "switch": [
          11,
          7
        ],
        "bridge": true
      },
      {
        "id": "mill-loft",
        "name": "mill loft",
        "color": [
          141,
          184,
          109
        ],
        "tiles": [
          [
            22,
            4
          ]
        ],
        "switch": [
          16,
          12
        ]
      },
      {
        "id": "mill-home",
        "name": "mill home",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            10,
            10
          ],
          [
            11,
            10
          ],
          [
            12,
            10
          ],
          [
            13,
            10
          ],
          [
            14,
            10
          ]
        ],
        "bridge": true
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-mill-note-0",
        "at": [
          8,
          7
        ],
        "title": "The water wheel",
        "body": "Tongue the blue wheel from this bank. The old millrace is too wide to jump, but its upper bridge is sound."
      },
      {
        "id": "autumn-mill-note-1",
        "at": [
          16,
          4
        ],
        "title": "The roast turkey",
        "body": "It hears footsteps and gobbles before it pounces. Creep quietly, or send it after a pebble somewhere you do not mean to stand."
      }
    ],
    "props": [
      {
        "at": [
          3,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          18,
          4
        ],
        "kind": "tree"
      },
      {
        "at": [
          23,
          4
        ],
        "kind": "lantern"
      },
      {
        "at": [
          5,
          5
        ],
        "kind": "tree"
      },
      {
        "at": [
          20,
          5
        ],
        "kind": "lantern"
      },
      {
        "at": [
          3,
          9
        ],
        "kind": "lantern"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          5,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          20,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          17,
          11
        ],
        "kind": "tree"
      }
    ],
    "spores": 1,
    "foxWarn": 1.05,
    "millWheel": [
      13,
      7
    ],
    "reactions": [
      {
        "id": "mill-key",
        "when": "key",
        "open": [
          "mill-home"
        ],
        "message": "The lower mill bridge is ready, but something rattles awake by the millrace.",
        "spawn": [
          "mill-serpent"
        ]
      }
    ],
    "map": [
      "#########################",
      "#........._____.....#...#",
      "#.@...1..._____.1...#.K1#",
      "#..###.L.._____..####...#",
      "#..###...........#####.##",
      "#..###...._____L1####...#",
      "#.1......._____......L.1#",
      "#.......L1_____.........#",
      "#..###...._____.........#",
      "#..###...._____..####...#",
      "#..###..........L####...#",
      "#.......L._____..####...#",
      "#.X....1.._____......1.L#",
      "#........._____.1.......#",
      "#########################"
    ],
    "reinforcements": [
      {
        "id": "mill-serpent",
        "kind": "snake",
        "spawn": [
          21,
          9
        ],
        "patrol": [
          [
            21,
            5
          ],
          [
            21,
            12
          ]
        ],
        "facing": -1.5707963267948966
      }
    ]
  },
  {
    "id": "autumn-maze",
    "name": "The Moonlit Maze",
    "difficulty": "Hard",
    "seasonalTheme": "autumn-night",
    "brief": "Two courtyard switches open two ways past the moonlit watchers.",
    "hint": "Find the amber switch in the western loop, then the violet switch beyond it. Choose the ghost's upper lane or the gardener's lower crossing. A serpent paces beside the key, and a pumpkin watches the violet switch. The key opens the centre route home.",
    "index": 6,
    "revision": 2,
    "cunning": 3,
    "pebbles": 2,
    "tongues": 1,
    "guards": [
      {
        "kind": "owl",
        "spawn": [
          15,
          3
        ],
        "patrol": [
          [
            12,
            3
          ],
          [
            15,
            2
          ],
          [
            14,
            5
          ]
        ],
        "facing": 3.141592653589793
      },
      {
        "kind": "beetle",
        "spawn": [
          15,
          12
        ],
        "patrol": [
          [
            15,
            12
          ],
          [
            15,
            14
          ]
        ],
        "facing": 0
      },
      {
        "id": "key-snake",
        "kind": "snake",
        "spawn": [
          19,
          3
        ],
        "patrol": [
          [
            19,
            1
          ],
          [
            19,
            5
          ]
        ],
        "facing": -1.5707963267948966
      },
      {
        "id": "violet-pumpkin",
        "kind": "toad",
        "spawn": [
          13,
          11
        ],
        "patrol": [
          [
            13,
            11
          ]
        ],
        "facing": 3.141592653589793
      }
    ],
    "gates": [
      {
        "id": "amber-crossings",
        "name": "amber crossings",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            11,
            3
          ],
          [
            11,
            13
          ]
        ],
        "switch": [
          8,
          8
        ]
      },
      {
        "id": "violet-crossings",
        "name": "violet crossings",
        "color": [
          186,
          148,
          218
        ],
        "tiles": [
          [
            17,
            3
          ],
          [
            17,
            13
          ]
        ],
        "switch": [
          13,
          14
        ]
      },
      {
        "id": "maze-home",
        "name": "maze home",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            5,
            8
          ],
          [
            11,
            8
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-maze-note-0",
        "at": [
          7,
          5
        ],
        "title": "Moonlit choices",
        "body": "The upper crossing belongs to the lantern keeper. The lower one belongs to the gardener. Both reach the far garden; neither is the only way back."
      }
    ],
    "props": [
      {
        "at": [
          17,
          1
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          4,
          2
        ],
        "kind": "lantern"
      },
      {
        "at": [
          18,
          4
        ],
        "kind": "tree"
      },
      {
        "at": [
          10,
          5
        ],
        "kind": "lantern"
      },
      {
        "at": [
          7,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          12,
          6
        ],
        "kind": "lantern"
      },
      {
        "at": [
          17,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          22,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          4,
          7
        ],
        "kind": "lantern"
      },
      {
        "at": [
          19,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          16,
          8
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          23,
          9
        ],
        "kind": "tree"
      },
      {
        "at": [
          5,
          10
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          10,
          10
        ],
        "kind": "tree"
      },
      {
        "at": [
          15,
          10
        ],
        "kind": "tree"
      },
      {
        "at": [
          20,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          17,
          11
        ],
        "kind": "tree"
      },
      {
        "at": [
          4,
          12
        ],
        "kind": "tree"
      },
      {
        "at": [
          18,
          14
        ],
        "kind": "lantern"
      },
      {
        "at": [
          5,
          15
        ],
        "kind": "tree"
      },
      {
        "at": [
          10,
          15
        ],
        "kind": "tree"
      }
    ],
    "spores": 1,
    "glows": 1,
    "reactions": [
      {
        "id": "maze-key",
        "when": "key",
        "open": [
          "maze-home"
        ],
        "message": "The middle garden gates open for the return."
      }
    ],
    "map": [
      "#########################",
      "#...##....##....###.....#",
      "#.@.##.1..##1...###...K1#",
      "#.......................#",
      "#...##L...##L...###L1...#",
      "#...SS....##..L.###.....#",
      "#.L.####.#####L######.###",
      "#...##....##....#####.###",
      "#......L....L..1#####.###",
      "#...##1...##....#####.###",
      "#...####.#####.######.###",
      "#...##....##....###.....#",
      "#.1.##..L.##....###.L.1.#",
      "#.......................#",
      "#.X.##...1##L.#.###.....#",
      "#...##....##1...###.....#",
      "#########################"
    ]
  },
  {
    "id": "autumn-finale",
    "name": "The Last Lantern",
    "difficulty": "Hard",
    "seasonalTheme": "autumn-festival",
    "brief": "Bring the final lantern through orchard, courtyard and mill garden.",
    "hint": "The orchard switch opens the central hall; the courtyard switch opens the far garden. Lizard cracks offer a serpent-free shortcut. The key opens the lower gates home, but it wakes the whole hollow: a serpent in the lower garden, the turkey in the hall and a gardener in the orchard. Creep past the turkey.",
    "index": 7,
    "revision": 2,
    "cunning": 3,
    "pebbles": 2,
    "tongues": 2,
    "guards": [
      {
        "kind": "snake",
        "spawn": [
          15,
          1
        ],
        "patrol": [
          [
            14,
            1
          ],
          [
            16,
            1
          ]
        ],
        "facing": 0
      },
      {
        "kind": "beetle",
        "spawn": [
          22,
          4
        ],
        "patrol": [
          [
            22,
            4
          ],
          [
            25,
            4
          ]
        ],
        "facing": 0
      },
      {
        "kind": "toad",
        "spawn": [
          16,
          7
        ],
        "patrol": [
          [
            16,
            7
          ]
        ],
        "facing": 3.141592653589793
      },
      {
        "kind": "fox",
        "spawn": [
          22,
          13
        ],
        "patrol": [
          [
            20,
            13
          ],
          [
            24,
            13
          ]
        ],
        "facing": 0
      }
    ],
    "gates": [
      {
        "id": "festival-orchard",
        "name": "festival orchard",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            8,
            3
          ]
        ],
        "switch": [
          3,
          13
        ]
      },
      {
        "id": "festival-courtyard",
        "name": "festival courtyard",
        "color": [
          141,
          184,
          109
        ],
        "tiles": [
          [
            17,
            3
          ]
        ],
        "switch": [
          14,
          8
        ]
      },
      {
        "id": "festival-home-west",
        "name": "festival home west",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            8,
            13
          ]
        ]
      },
      {
        "id": "festival-home-east",
        "name": "festival home east",
        "color": [
          242,
          177,
          85
        ],
        "tiles": [
          [
            17,
            13
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "autumn-finale-note-0",
        "at": [
          2,
          12
        ],
        "title": "One last lantern",
        "body": "A little of every trail, and a way to think around every creature. The cracks are yours alone. Do not spend every pebble before the far garden."
      }
    ],
    "props": [
      {
        "at": [
          17,
          1
        ],
        "kind": "lantern"
      },
      {
        "at": [
          9,
          2
        ],
        "kind": "tree"
      },
      {
        "at": [
          14,
          2
        ],
        "kind": "tree"
      },
      {
        "at": [
          21,
          3
        ],
        "kind": "lantern"
      },
      {
        "at": [
          8,
          4
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          18,
          4
        ],
        "kind": "tree"
      },
      {
        "at": [
          2,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          7,
          6
        ],
        "kind": "lantern"
      },
      {
        "at": [
          12,
          6
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          17,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          22,
          6
        ],
        "kind": "tree"
      },
      {
        "at": [
          4,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          9,
          7
        ],
        "kind": "lantern"
      },
      {
        "at": [
          19,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          24,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          1,
          8
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "tree"
      },
      {
        "at": [
          21,
          8
        ],
        "kind": "tree"
      },
      {
        "at": [
          8,
          9
        ],
        "kind": "tree"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          5,
          10
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          10,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          15,
          10
        ],
        "kind": "tree"
      },
      {
        "at": [
          20,
          10
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          25,
          10
        ],
        "kind": "tree"
      },
      {
        "at": [
          17,
          11
        ],
        "kind": "lantern"
      },
      {
        "at": [
          9,
          12
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          8,
          14
        ],
        "kind": "tree"
      },
      {
        "at": [
          18,
          14
        ],
        "kind": "tree"
      }
    ],
    "spores": 1,
    "seeds": 1,
    "foxWarn": 1.05,
    "reactions": [
      {
        "id": "festival-key",
        "when": "key",
        "open": [
          "festival-home-west",
          "festival-home-east"
        ],
        "message": "The festival gates swing wide, and the whole hollow wakes. Bring the last lantern home.",
        "spawn": [
          "festival-serpent",
          "festival-turkey",
          "orchard-gardener"
        ]
      }
    ],
    "map": [
      "###########################",
      "#.......##.......##.......#",
      "#.@...1.##.1..#####.1...K.#",
      "#...................##....#",
      "#....L..##L....1.##L1.....#",
      "#.......##...S...##...L...#",
      "###.######S##S#########.###",
      "###.######...S...######.###",
      "###.######.L#....######.###",
      "###.######.1.....######.###",
      "###.#########.#########.###",
      "#.......##.......##.......#",
      "#...L1..##...L...##.L...1.#",
      "#..............1..........#",
      "#.X.....##......L##1....L.#",
      "#.......##.......##.......#",
      "###########################"
    ],
    "reinforcements": [
      {
        "id": "festival-serpent",
        "kind": "snake",
        "spawn": [
          13,
          14
        ],
        "patrol": [
          [
            10,
            14
          ],
          [
            10,
            12
          ],
          [
            16,
            12
          ],
          [
            16,
            14
          ]
        ],
        "facing": 3.141592653589793
      },
      {
        "id": "festival-turkey",
        "kind": "fox",
        "spawn": [
          15,
          9
        ],
        "patrol": [
          [
            12,
            9
          ],
          [
            16,
            9
          ]
        ],
        "facing": 3.141592653589793
      },
      {
        "id": "orchard-gardener",
        "kind": "beetle",
        "spawn": [
          4,
          4
        ],
        "patrol": [
          [
            2,
            4
          ],
          [
            6,
            4
          ]
        ],
        "facing": 0
      }
    ]
  }
];
root.EscapeAutumn=routes;if(typeof module!=="undefined"&&module.exports)module.exports=routes;
})(typeof globalThis!=="undefined"?globalThis:this);
