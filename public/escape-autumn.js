// Authored Autumn Hollow maps. See docs/SEASONS.md.
(function(root){const routes=[
  {
    "id": "autumn-orchard",
    "name": "The Orchard Gate",
    "difficulty": "Easy",
    "seasonalTheme": "autumn",
    "brief": "The orchard is full of red leaves. Open its gate and bring a golden key home to the festival.",
    "hint": "The amber button beside the old tree opens the orchard gate. Stand still in leaf cover to hide from the bony serpent. Treasure is a bonus.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        15,
        9
      ]
    ],
    "guards": [
      {
        "kind": "snake",
        "spawn": [
          24,
          13
        ],
        "facing": 0,
        "patrol": [
          [
            24,
            10
          ],
          [
            25,
            10
          ],
          [
            25,
            16
          ],
          [
            24,
            16
          ]
        ]
      }
    ],
    "gates": [
      {
        "id": "orchard",
        "name": "Orchard gate",
        "color": [
          242,
          177,
          85
        ],
        "switch": [
          9,
          3
        ],
        "tiles": [
          [
            13,
            7
          ],
          [
            13,
            8
          ],
          [
            13,
            9
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "orchard-note",
        "at": [
          8,
          3
        ],
        "title": "Welcome to Autumn Hollow",
        "body": "Eight lost lanterns are waiting. Find each key and return to the green door. A catch brings Sally to her last flag; treasure and notes are optional."
      }
    ],
    "map": [
      "#############################",
      "#............#..............#",
      "#............#..............#",
      "#..1.........#...........K..#",
      "#........1...#..1.......1...#",
      "#...###......#..............#",
      "#...###......#....###...L...#",
      "#...###...L.......###.......#",
      "#..............L..###.......#",
      "#..1........................#",
      "#............#........1L....#",
      "#...###..L...#..1...........#",
      "#...###......#.....####.....#",
      "#...###......#.....####.....#",
      "#.........1..#.....####.....#",
      "#..@.........#..............#",
      "#..X....1....#.......1......#",
      "#............#..............#",
      "#############################"
    ],
    "gentle": 0.75,
    "cunning": 0,
    "index": 0,
    "props": [
      {
        "at": [
          4,
          7
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          5,
          7
        ],
        "kind": "tree"
      },
      {
        "at": [
          6,
          7
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          19,
          14
        ],
        "kind": "tree"
      },
      {
        "at": [
          20,
          14
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          21,
          14
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          22,
          14
        ],
        "kind": "tree"
      }
    ]
  },
  {
    "id": "autumn-pumpkins",
    "name": "The Pumpkin Patch",
    "difficulty": "Easy–medium",
    "seasonalTheme": "autumn",
    "brief": "Someone has planted pumpkins with very long vines. Follow the winding garden paths to the key.",
    "hint": "The jack-o’-lantern glows before it lashes a vine. Step behind a hedge or walk round its side. A spore cloud hides Sally even while moving.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        12,
        6
      ],
      [
        22,
        13
      ]
    ],
    "guards": [
      {
        "kind": "toad",
        "spawn": [
          16,
          4
        ],
        "facing": 1.5707963267948966,
        "patrol": [
          [
            16,
            4
          ]
        ]
      },
      {
        "kind": "toad",
        "spawn": [
          26,
          11
        ],
        "facing": 3.141592653589793,
        "patrol": [
          [
            26,
            11
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "pumpkin-note",
        "at": [
          12,
          6
        ],
        "title": "Watch the pumpkin glow",
        "body": "A bright face means a vine is coming. Step behind a hedge or move out of its line. Spore pouches can hide Sally on the move. Tools refill after their cooldown."
      }
    ],
    "map": [
      "###############################",
      "#.........#...................#",
      "#.........#...................#",
      "#..1......#.1..............K..#",
      "#.......1.#...................#",
      "#.......L...............###...#",
      "#...........L.......#...###...#",
      "#.........#......1..#...###...#",
      "#.........#.........#..L...1..#",
      "#...###...#...###...#.........#",
      "#...###...#...###...#..1......#",
      "#...###...#...###...#.........#",
      "#.........#.......L...L.......#",
      "#.............................#",
      "#......1............#.........#",
      "#..@.........1....1.#......1..#",
      "#..X................#.........#",
      "#...................#.........#",
      "###############################"
    ],
    "gentle": 0.8,
    "cunning": 0,
    "index": 1,
    "props": []
  },
  {
    "id": "autumn-gardener",
    "name": "The Gardener’s Yard",
    "difficulty": "Medium",
    "seasonalTheme": "autumn-dusk",
    "brief": "The old gardener has a very clumsy charge. Take the hedged courtyard to his little garden shed.",
    "hint": "Raised arms warn of a straight charge. Move sideways or behind a hedge. The blue button opens the shed; the key opens a shortcut home.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        12,
        16
      ],
      [
        24,
        6
      ]
    ],
    "guards": [
      {
        "kind": "beetle",
        "spawn": [
          19,
          10
        ],
        "facing": 3.141592653589793,
        "patrol": [
          [
            19,
            6
          ],
          [
            19,
            17
          ]
        ]
      }
    ],
    "gates": [
      {
        "id": "shed",
        "name": "Garden shed",
        "color": [
          113,
          192,
          225
        ],
        "switch": [
          12,
          4
        ],
        "tiles": [
          [
            22,
            4
          ],
          [
            22,
            5
          ],
          [
            22,
            6
          ]
        ]
      },
      {
        "id": "return",
        "name": "Home path",
        "color": [
          239,
          177,
          82
        ],
        "tiles": [
          [
            10,
            4
          ],
          [
            10,
            5
          ]
        ]
      }
    ],
    "reactions": [
      {
        "id": "return-key",
        "when": "key",
        "open": [
          "return"
        ],
        "message": "A gate opens beside the orchard. A shorter way home!",
        "objective": "Take either path back to the green door."
      }
    ],
    "fieldNotes": [
      {
        "id": "gardener-note",
        "at": [
          7,
          15
        ],
        "title": "Arms up? Step sideways!",
        "body": "The zombie gardener raises both arms before charging in a straight line. A hedge stops the charge. You have time to walk round while he catches his breath."
      }
    ],
    "map": [
      "###############################",
      "#.........#...........#.......#",
      "#.........#...........#.......#",
      "#..@...1..#.1.........#....K..#",
      "#.........#........1..........#",
      "#.........#.............L.....#",
      "#.........#.L......L..........#",
      "#.........#...####....#.......#",
      "#.........#...####....#.......#",
      "#.........#...####....#.......#",
      "#.........#...........#..1....#",
      "#..1......#.1.........#.......#",
      "#.........#........L..#.......#",
      "#.........#...####....#.......#",
      "#.............####....#.......#",
      "#.......L...L.####....#.......#",
      "#.....................#....1..#",
      "#.........#...........#.......#",
      "#..X...1..#..1........#..1....#",
      "#.........#...........#.......#",
      "###############################"
    ],
    "gentle": 0.9,
    "cunning": 1,
    "index": 2,
    "props": []
  },
  {
    "id": "autumn-lanterns",
    "name": "Lantern Lane",
    "difficulty": "Medium",
    "seasonalTheme": "autumn-night",
    "brief": "A ghostly lantern keeper sweeps a cold beam across the lane. Little islands of leaves offer a quiet rest.",
    "hint": "Avoid the cold lantern beam. If the ghost marks the ground, step away before it swoops. You can see the whole lane; the darkness is only decoration.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        11,
        5
      ],
      [
        20,
        13
      ],
      [
        27,
        5
      ]
    ],
    "guards": [
      {
        "kind": "owl",
        "spawn": [
          15,
          5
        ],
        "facing": 1.5707963267948966,
        "patrol": [
          [
            15,
            5
          ],
          [
            16,
            5
          ],
          [
            16,
            15
          ],
          [
            15,
            15
          ]
        ]
      }
    ],
    "glows": 2,
    "fieldNotes": [
      {
        "id": "lantern-note",
        "at": [
          7,
          4
        ],
        "title": "The cold lantern",
        "body": "The ghost sweeps a pale blue beam. If it sees Sally, a circle marks its next swoop. Leave that circle, then slip past as the ghost rests."
      }
    ],
    "map": [
      "#################################",
      "#........#...............#......#",
      "#........#...............#......#",
      "#..@..1..#..1............#...K..#",
      "#......L........................#",
      "#..........L...........L...L....#",
      "#........#........#......#......#",
      "#........#..###...#..1...#......#",
      "#........#..###...#......#...1..#",
      "#........#..###...#......#......#",
      "#..1.....#......1.#......#......#",
      "#........#........#.............#",
      "#........#......L...............#",
      "#...................L.###....1..#",
      "#.................#...###.......#",
      "#......1....1.....#...###.......#",
      "#..X..............#..1..........#",
      "#.................#.............#",
      "#################################"
    ],
    "gentle": 0.95,
    "cunning": 1,
    "index": 3,
    "props": []
  },
  {
    "id": "autumn-store",
    "name": "The Harvest Store",
    "difficulty": "Medium",
    "seasonalTheme": "autumn-dusk",
    "brief": "Three coloured switches open the old store. Work out which aisle each one reaches, then bring the lantern key home.",
    "hint": "The blue switch opens the first aisle. Inside, find the green shelf switch and amber pantry switch before heading downstairs. Baskets twitch before they spring; use cover or a pebble.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        13,
        5
      ],
      [
        24,
        15
      ]
    ],
    "guards": [
      {
        "kind": "mimic",
        "spawn": [
          18,
          12
        ],
        "facing": 0,
        "patrol": [
          [
            18,
            12
          ]
        ]
      },
      {
        "kind": "mimic",
        "spawn": [
          27,
          5
        ],
        "facing": 1.5707963267948966,
        "patrol": [
          [
            27,
            5
          ]
        ]
      }
    ],
    "gates": [
      {
        "id": "store-blue",
        "name": "Blue storeroom",
        "color": [
          110,
          190,
          235
        ],
        "switch": [
          7,
          14
        ],
        "tiles": [
          [
            11,
            4
          ],
          [
            11,
            5
          ]
        ]
      },
      {
        "id": "store-amber",
        "name": "Amber pantry",
        "color": [
          245,
          184,
          85
        ],
        "switch": [
          14,
          3
        ],
        "tiles": [
          [
            22,
            14
          ],
          [
            22,
            15
          ]
        ]
      },
      {
        "id": "store-shelves",
        "name": "Store aisle",
        "color": [
          170,
          210,
          123
        ],
        "switch": [
          19,
          4
        ],
        "tiles": [
          [
            18,
            10
          ],
          [
            19,
            10
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "store-note",
        "at": [
          8,
          5
        ],
        "title": "Treat or trick?",
        "body": "Three switches, three routes. Blue gets you inside; green opens the narrow shelf aisle, and amber opens the far pantry. Gates stay open. A basket that twitches is about to spring—step away or distract it."
      }
    ],
    "map": [
      "#################################",
      "#..........#..........#.........#",
      "#..........#..........#.........#",
      "#..@...1...#..1.......#......K..#",
      "#..................1..#.........#",
      "#.......L....L........#......1..#",
      "#..........#..........#.........#",
      "#..........#...####...#..####...#",
      "#..........#...####...#..####...#",
      "#..........#...####...#..####...#",
      "#..........#######..###.........#",
      "#..1.......#..........#......L..#",
      "#..........#..........#..1......#",
      "#..........#..........#.........#",
      "#..........#..1.....L...........#",
      "#..........#............L.......#",
      "#..........#..........#.........#",
      "#......1...#..........#......1..#",
      "#..X.......#.......1..#.........#",
      "#..........#..........#.........#",
      "#################################"
    ],
    "gentle": 1,
    "cunning": 1,
    "index": 4,
    "props": []
  },
  {
    "id": "autumn-mill",
    "name": "The Hollow Mill",
    "difficulty": "Medium",
    "seasonalTheme": "autumn-mill",
    "brief": "The mill wheel turns beside a leafy stream. A bridge and an old rabbit tunnel give Sally two ways across.",
    "hint": "The loft switch is across the lower bridge. Creep past the roast turkey, or throw a pebble away from the crossing. Its crouch and gobble warn of a rush. The paired tunnels offer another way round.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        19,
        6
      ],
      [
        19,
        17
      ]
    ],
    "guards": [
      {
        "kind": "fox",
        "spawn": [
          24,
          17
        ],
        "facing": 3.141592653589793,
        "patrol": [
          [
            22,
            16
          ],
          [
            26,
            16
          ],
          [
            26,
            18
          ],
          [
            22,
            18
          ]
        ]
      },
      {
        "kind": "toad",
        "spawn": [
          10,
          12
        ],
        "facing": 3.141592653589793,
        "patrol": [
          [
            10,
            12
          ]
        ]
      }
    ],
    "tunnels": [
      [
        [
          11,
          16
        ],
        [
          21,
          16
        ]
      ]
    ],
    "gates": [
      {
        "id": "mill",
        "name": "Mill loft",
        "color": [
          235,
          176,
          83
        ],
        "switch": [
          20,
          18
        ],
        "tiles": [
          [
            27,
            3
          ],
          [
            27,
            4
          ],
          [
            27,
            5
          ],
          [
            27,
            6
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "mill-note",
        "at": [
          12,
          5
        ],
        "title": "The old mill stream",
        "body": "You can swim safely, walk over either bridge, or step onto a rabbit mound to use its tunnel. The mill wheel is just scenery; it will never catch Sally."
      },
      {
        "id": "turkey-note",
        "at": [
          11,
          15
        ],
        "title": "A very lively dinner",
        "body": "The roast turkey listens for footsteps. Hold C, the crawl button, or the left trigger to creep quietly. It dips its drumsticks and gobbles before rushing. Move sideways, or distract it with a pebble."
      }
    ],
    "map": [
      "#################################",
      "#..............~~~.........#....#",
      "#..............~~~.........#....#",
      "#..@.......1...~~~..1........K..#",
      "#..............~~~..............#",
      "#............L..................#",
      "#..................L.........1..#",
      "#....####......~~~.........#....#",
      "#....####......~~~.....##########",
      "#....####...1..~~~.....####.....#",
      "#....####......~~~..1..####.....#",
      "#..............~~~.....####.....#",
      "#..1...........~~~..............#",
      "#..............~~~...L..........#",
      "#..............~~~...........1..#",
      "#..............~~~..............#",
      "#..........L....................#",
      "#..................L............#",
      "#..X........1..~~~...1......1...#",
      "#..............~~~..............#",
      "#################################"
    ],
    "gentle": 1,
    "cunning": 1,
    "index": 5,
    "props": [
      {
        "at": [
          5,
          10
        ],
        "kind": "tree"
      },
      {
        "at": [
          6,
          10
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          7,
          10
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          8,
          10
        ],
        "kind": "tree"
      }
    ],
    "foxWarn": 1.05
  },
  {
    "id": "autumn-maze",
    "name": "The Moonlit Maze",
    "difficulty": "Medium+",
    "seasonalTheme": "autumn-night",
    "brief": "Find the violet switch deep in the hedge maze, then choose a crossing to reach the lantern key. The upper way has a ghost; the lower way has a gardener.",
    "hint": "The violet switch opens both crossings. Wait for the ghost to turn on the upper route, or bait the gardener and use leaf cover on the lower route. The green exit is back in the first garden.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        11,
        6
      ],
      [
        22,
        17
      ]
    ],
    "guards": [
      {
        "kind": "owl",
        "spawn": [
          17,
          4
        ],
        "facing": 1.5707963267948966,
        "patrol": [
          [
            17,
            3
          ],
          [
            18,
            3
          ],
          [
            18,
            7
          ],
          [
            17,
            7
          ]
        ]
      },
      {
        "kind": "beetle",
        "spawn": [
          27,
          16
        ],
        "facing": 3.141592653589793,
        "patrol": [
          [
            23,
            16
          ],
          [
            28,
            16
          ]
        ]
      }
    ],
    "fieldNotes": [
      {
        "id": "maze-note",
        "at": [
          11,
          6
        ],
        "title": "A garden at a time",
        "body": "The violet switch is deeper in the maze, beside the old hedge at the left of the middle garden. It opens two crossings: a ghost watches the upper one and a gardener patrols the lower one. Choose your way."
      }
    ],
    "map": [
      "###############################",
      "#........#..........#.........#",
      "#........#..........#.........#",
      "#..@...1.#..1...............K.#",
      "#........#.............L......#",
      "#.......L...........#...###...#",
      "#..........L........#...###...#",
      "#........#........1.#...###...#",
      "#..###...#..........#...###.1.#",
      "#..###...#..######..#...###...#",
      "#..###...#..######..#...###...#",
      "#.1###...#..######..#...###...#",
      "#..###...#..........#...###...#",
      "#..###...#.1......L.#.........#",
      "#..###...#..........#......L..#",
      "#........#..........#..1......#",
      "#........#..####..............#",
      "#......1....####..L...L.......#",
      "#...........####....#.........#",
      "#...................#.......1.#",
      "#..X..............1.#.........#",
      "#...................#.........#",
      "###############################"
    ],
    "gentle": 1,
    "cunning": 1,
    "index": 6,
    "props": [
      {
        "at": [
          24,
          12
        ],
        "kind": "tree"
      },
      {
        "at": [
          25,
          12
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          26,
          12
        ],
        "kind": "pumpkin"
      }
    ],
    "gates": [
      {
        "id": "maze-crossings",
        "name": "Moonlit crossings",
        "color": [
          190,
          164,
          235
        ],
        "switch": [
          11,
          13
        ],
        "tiles": [
          [
            20,
            3
          ],
          [
            20,
            4
          ],
          [
            20,
            16
          ],
          [
            20,
            17
          ]
        ]
      }
    ]
  },
  {
    "id": "autumn-finale",
    "name": "The Last Lantern",
    "difficulty": "Medium+",
    "seasonalTheme": "autumn-festival",
    "brief": "One last trip through orchard, courtyard and lantern house. Open the orchard arch, outwit the gardener at the second switch, and bring the final key home.",
    "hint": "Open the orchard arch, then use the narrow lizard passage beside it to leave the serpent behind. The second switch is in the lower courtyard, watched by a gardener. Leaves and a decoy help; the key opens both low return gates.",
    "pebbles": 2,
    "spores": 2,
    "tongues": 2,
    "seeds": 2,
    "checkpoints": [
      [
        14,
        6
      ],
      [
        26,
        6
      ],
      [
        26,
        18
      ]
    ],
    "guards": [
      {
        "kind": "snake",
        "spawn": [
          8,
          6
        ],
        "facing": 1.5707963267948966,
        "patrol": [
          [
            8,
            6
          ],
          [
            9,
            6
          ],
          [
            9,
            9
          ],
          [
            8,
            9
          ]
        ]
      },
      {
        "kind": "beetle",
        "spawn": [
          21,
          15
        ],
        "facing": 3.141592653589793,
        "patrol": [
          [
            21,
            13
          ],
          [
            21,
            16
          ]
        ]
      },
      {
        "kind": "toad",
        "spawn": [
          33,
          12
        ],
        "facing": 0,
        "patrol": [
          [
            33,
            12
          ]
        ]
      },
      {
        "kind": "fox",
        "spawn": [
          34,
          20
        ],
        "facing": 3.141592653589793,
        "patrol": [
          [
            32,
            20
          ],
          [
            34,
            20
          ]
        ]
      }
    ],
    "gates": [
      {
        "id": "festival-orchard",
        "name": "Orchard arch",
        "color": [
          192,
          216,
          125
        ],
        "switch": [
          8,
          15
        ],
        "tiles": [
          [
            12,
            5
          ],
          [
            12,
            6
          ]
        ]
      },
      {
        "id": "festival-house",
        "name": "Lantern house",
        "color": [
          112,
          194,
          231
        ],
        "switch": [
          17,
          15
        ],
        "tiles": [
          [
            24,
            5
          ],
          [
            24,
            6
          ]
        ]
      },
      {
        "id": "festival-home-a",
        "name": "Orchard return",
        "color": [
          243,
          184,
          85
        ],
        "tiles": [
          [
            12,
            17
          ],
          [
            12,
            18
          ]
        ]
      },
      {
        "id": "festival-home-b",
        "name": "Courtyard return",
        "color": [
          243,
          184,
          85
        ],
        "tiles": [
          [
            24,
            17
          ],
          [
            24,
            18
          ]
        ]
      }
    ],
    "reactions": [
      {
        "id": "festival-key",
        "when": "key",
        "open": [
          "festival-home-a",
          "festival-home-b"
        ],
        "message": "The last lantern is lit! The low garden gates open for Sally.",
        "objective": "Follow the low garden path home, or explore for optional treasure."
      }
    ],
    "fieldNotes": [
      {
        "id": "finale-note",
        "at": [
          26,
          6
        ],
        "title": "A light to bring home",
        "body": "Two switches lead to the last lantern. The orchard switch opens the first arch, with a narrow lizard passage beside it that the serpent cannot follow. The courtyard switch opens the lantern house. The key opens both low return gates."
      }
    ],
    "map": [
      "#####################################",
      "#...........#...........#...........#",
      "#...........#...........#...........#",
      "#..@....1...#..1........#........K..#",
      "#...........#...........#..1........#",
      "#.........LS........................#",
      "#..........S..L...........L.........#",
      "#..........S#........1..#...........#",
      "#....###...S#...####....#........L..#",
      "#....###...S#...####....#...........#",
      "#....###....#...####....#...####....#",
      "#....###....#...####....#...####....#",
      "#....###....#...........#...####....#",
      "#...........#....L...L..#...####....#",
      "#...........#....L......#...####....#",
      "#..1........#..1........#...........#",
      "#...........#...........#...........#",
      "#...................###..........1..#",
      "#........1L...L.......L...L.........#",
      "#...........#...........#...........#",
      "#..X........#....1......#..1........#",
      "#...........#...........#...........#",
      "#####################################"
    ],
    "gentle": 1,
    "cunning": 1,
    "index": 7,
    "props": [
      {
        "at": [
          28,
          14
        ],
        "kind": "tree"
      },
      {
        "at": [
          29,
          14
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          30,
          14
        ],
        "kind": "pumpkin"
      },
      {
        "at": [
          31,
          14
        ],
        "kind": "tree"
      }
    ],
    "foxWarn": 1.05
  }
];
root.EscapeAutumn=routes;if(typeof module!=="undefined"&&module.exports)module.exports=routes;
})(typeof globalThis!=="undefined"?globalThis:this);
