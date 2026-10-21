// Authored Winterlight Hollow routes. See docs/WINTER.md.
(function(root){const routes=[
  {
    "id": "winter-welcome",
    "name": "The Snowy Welcome",
    "index": 0,
    "revision": 1,
    "difficulty": "Easy",
    "seasonalTheme": "winter-village",
    "cunning": 0,
    "pebbles": 3,
    "tongues": 2,
    "spores": 1,
    "gates": [
      {
        "id": "candy-garden",
        "name": "candy garden",
        "tiles": [
          [
            12,
            3
          ]
        ],
        "switch": [
          3,
          2
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "welcome-home",
        "name": "welcome home",
        "tiles": [
          [
            12,
            9
          ]
        ],
        "color": [
          133,
          200,
          231
        ]
      }
    ],
    "guards": [
      {
        "kind": "snake",
        "spawn": [
          15,
          7
        ],
        "patrol": [
          [
            14,
            7
          ],
          [
            16,
            7
          ]
        ],
        "facing": 0
      }
    ],
    "fieldNotes": [
      {
        "id": "winter-welcome-note-0",
        "at": [
          2,
          8
        ],
        "title": "A letter from Pip",
        "body": "The Christmas tree has lost its star! Eight ornaments will wake it. I have marked the village trails. Snowballs distract creatures just like pebbles do elsewhere. The striped serpent is a serpent, however festive its coat. - Pip"
      },
      {
        "id": "winter-welcome-note-1",
        "at": [
          4,
          5
        ],
        "title": "Little skating feet",
        "body": "On ice, Sally needs time to speed up and slow down. Hold Crawl for more grip. The chevrons mark a downhill slide: it carries Sally south until she steps off or reaches the end. Step sideways onto snow to get out."
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
        "kind": "brazier"
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
          12,
          11
        ],
        "kind": "pine"
      }
    ],
    "slippery": [
      [
        3,
        5
      ],
      [
        4,
        5
      ],
      [
        3,
        6
      ],
      [
        4,
        6
      ],
      [
        3,
        7
      ],
      [
        4,
        7
      ]
    ],
    "brief": "A new village, one old switch and a serpent dressed for Christmas.",
    "hint": "Blue opens the candy garden. Try the little ice slope: chevrons point downhill. Step sideways onto snow to leave the slide; hold Crawl to brake. The star key opens the short way home.",
    "currents": [
      {
        "area": [
          3,
          5,
          4,
          7
        ],
        "dir": [
          0,
          1
        ],
        "speed": 0.85,
        "surface": "ground"
      }
    ],
    "reactions": [
      {
        "id": "welcome-key",
        "when": "key",
        "open": [
          "welcome-home"
        ],
        "message": "The little snowy gate opens for the return."
      }
    ],
    "map": [
      "###################",
      "#.....#.....#.....#",
      "#.1...#.1...#.1.K.#",
      "#......L..........#",
      "#..L..#...1.#L....#",
      "#.....#.....#.....#",
      "#...1.###.###...1.#",
      "#.....#.....#.....#",
      "#.....#..L1.####..#",
      "#............LL.L.#",
      "#.@.1.#.1...#.1...#",
      "#.X...#.....#.....#",
      "###################"
    ]
  },
  {
    "id": "winter-pond",
    "name": "The Skating Pond",
    "index": 1,
    "revision": 1,
    "difficulty": "Easy",
    "seasonalTheme": "winter-ice",
    "cunning": 0,
    "pebbles": 3,
    "tongues": 2,
    "spores": 1,
    "gates": [
      {
        "id": "pond-north",
        "name": "pond north",
        "tiles": [
          [
            14,
            3
          ]
        ],
        "switch": [
          3,
          11
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "pond-south",
        "name": "pond south",
        "tiles": [
          [
            14,
            11
          ]
        ],
        "color": [
          133,
          200,
          231
        ]
      }
    ],
    "guards": [
      {
        "kind": "toad",
        "spawn": [
          17,
          8
        ],
        "patrol": [
          [
            17,
            8
          ]
        ],
        "facing": 3.141592653589793
      }
    ],
    "fieldNotes": [
      {
        "id": "winter-pond-note-0",
        "at": [
          3,
          4
        ],
        "title": "Pond manners",
        "body": "Point your nose where you want to go. Your feet may still be going somewhere else. The snowy islands are good places to stop and plan."
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
        "kind": "brazier"
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
        "kind": "pine"
      }
    ],
    "slippery": [
      [
        7,
        1
      ],
      [
        8,
        1
      ],
      [
        9,
        1
      ],
      [
        10,
        1
      ],
      [
        11,
        1
      ],
      [
        12,
        1
      ],
      [
        13,
        1
      ],
      [
        7,
        2
      ],
      [
        8,
        2
      ],
      [
        9,
        2
      ],
      [
        10,
        2
      ],
      [
        11,
        2
      ],
      [
        12,
        2
      ],
      [
        13,
        2
      ],
      [
        7,
        3
      ],
      [
        8,
        3
      ],
      [
        12,
        3
      ],
      [
        13,
        3
      ],
      [
        7,
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
        7,
        5
      ],
      [
        8,
        5
      ],
      [
        9,
        5
      ],
      [
        10,
        5
      ],
      [
        11,
        5
      ],
      [
        12,
        5
      ],
      [
        13,
        5
      ],
      [
        7,
        6
      ],
      [
        8,
        6
      ],
      [
        9,
        6
      ],
      [
        10,
        6
      ],
      [
        11,
        6
      ],
      [
        12,
        6
      ],
      [
        13,
        6
      ],
      [
        7,
        7
      ],
      [
        8,
        7
      ],
      [
        9,
        7
      ],
      [
        11,
        7
      ],
      [
        12,
        7
      ],
      [
        13,
        7
      ],
      [
        7,
        8
      ],
      [
        8,
        8
      ],
      [
        9,
        8
      ],
      [
        10,
        8
      ],
      [
        11,
        8
      ],
      [
        12,
        8
      ],
      [
        13,
        8
      ],
      [
        7,
        9
      ],
      [
        8,
        9
      ],
      [
        9,
        9
      ],
      [
        10,
        9
      ],
      [
        11,
        9
      ],
      [
        12,
        9
      ],
      [
        13,
        9
      ],
      [
        7,
        10
      ],
      [
        8,
        10
      ],
      [
        13,
        10
      ],
      [
        7,
        11
      ],
      [
        8,
        11
      ],
      [
        12,
        11
      ],
      [
        13,
        11
      ],
      [
        7,
        12
      ],
      [
        8,
        12
      ],
      [
        9,
        12
      ],
      [
        10,
        12
      ],
      [
        11,
        12
      ],
      [
        12,
        12
      ],
      [
        13,
        12
      ],
      [
        7,
        13
      ],
      [
        8,
        13
      ],
      [
        9,
        13
      ],
      [
        10,
        13
      ],
      [
        11,
        13
      ],
      [
        12,
        13
      ],
      [
        13,
        13
      ]
    ],
    "brief": "Skate between little snow islands and find the gate keeper's star key.",
    "hint": "The west switch opens the north crossing. Snow islands are good places to slow down. The key opens the south crossing.",
    "reactions": [
      {
        "id": "pond-key",
        "when": "key",
        "open": [
          "pond-south"
        ]
      }
    ],
    "map": [
      "#####################",
      "#.....#.......#.....#",
      "#.@.1.#.1.....#.1.K.#",
      "#...........1.......#",
      "#.....#.L.....#.....#",
      "#.....#.......#.L...#",
      "#...L.#.1.....#.....#",
      "#.....#...#...#.....#",
      "#.....#.......#.....#",
      "#.....#.....1.#.....#",
      "#.1...#.....L.#.....#",
      "#.................L.#",
      "#.X.1.#.1.....#....1#",
      "#.....#.......#.....#",
      "#####################"
    ]
  },
  {
    "id": "winter-snowballs",
    "name": "Snowball Alley",
    "index": 2,
    "revision": 1,
    "difficulty": "Easy–medium",
    "seasonalTheme": "winter-village",
    "cunning": 1,
    "pebbles": 3,
    "tongues": 2,
    "spores": 1,
    "gates": [
      {
        "id": "alley-entry",
        "name": "alley entry",
        "tiles": [
          [
            7,
            3
          ]
        ],
        "switch": [
          3,
          11
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "alley-east",
        "name": "alley east",
        "tiles": [
          [
            16,
            3
          ]
        ],
        "switch": [
          12,
          11
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "alley-home",
        "name": "alley home",
        "tiles": [
          [
            16,
            11
          ]
        ],
        "color": [
          133,
          200,
          231
        ]
      }
    ],
    "guards": [
      {
        "kind": "toad",
        "spawn": [
          19,
          9
        ],
        "patrol": [
          [
            19,
            9
          ]
        ],
        "facing": 1.5707963267948966
      }
    ],
    "fieldNotes": [
      {
        "id": "winter-snowballs-note-0",
        "at": [
          9,
          5
        ],
        "title": "The snowball keeper",
        "body": "Listen for the rumble, watch the chute, and wait off the lane. When the snowball has passed there is time to walk across. A snowball can tumble a creature over, too."
      }
    ],
    "props": [
      {
        "at": [
          7,
          1
        ],
        "kind": "brazier"
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
          7,
          6
        ],
        "kind": "lantern"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "pine"
      },
      {
        "at": [
          16,
          8
        ],
        "kind": "brazier"
      },
      {
        "at": [
          15,
          10
        ],
        "kind": "lantern"
      },
      {
        "at": [
          6,
          13
        ],
        "kind": "lantern"
      },
      {
        "at": [
          16,
          13
        ],
        "kind": "pine"
      }
    ],
    "slippery": [
      [
        10,
        9
      ],
      [
        11,
        9
      ],
      [
        12,
        9
      ],
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
      ]
    ],
    "brief": "The snowball chute is working. Wait for a clear lane, then cross.",
    "hint": "A rolling snowball rumbles before it comes. Wait in a side pocket; the lane stays clear for several seconds after it passes.",
    "reactions": [
      {
        "id": "alley-key",
        "when": "key",
        "open": [
          "alley-home"
        ]
      }
    ],
    "logs": [
      {
        "from": [
          8,
          7
        ],
        "to": [
          14,
          7
        ],
        "period": 7,
        "speed": 3.2,
        "warn": 2,
        "skin": "snowball"
      }
    ],
    "map": [
      "#######################",
      "#.....##.......##.....#",
      "#.@.1.##.1.....##.1.K.#",
      "#.....................#",
      "#...L.##.....1.##.....#",
      "#.....##L......##L...1#",
      "#.....##.#.....##.....#",
      "#.....##.......##.....#",
      "#.....##..L..#.##.....#",
      "#.1...##.1.....##.....#",
      "#.....##......L##.....#",
      "#...................L.#",
      "#.X.1.##.....1.##....1#",
      "#.....##.......##.....#",
      "#######################"
    ]
  },
  {
    "id": "winter-presents",
    "name": "The Missing Presents",
    "index": 3,
    "revision": 1,
    "difficulty": "Medium",
    "seasonalTheme": "winter-workshop",
    "cunning": 2,
    "pebbles": 3,
    "tongues": 2,
    "wind": [{"area": [7, 4, 11, 9], "dir": [0, 1], "period": 6, "on": 2, "offset": 0, "strength": 1.4}],
    "spores": 1,
    "gates": [
      {
        "id": "workshop-blue",
        "name": "workshop blue",
        "tiles": [
          [
            6,
            10
          ]
        ],
        "switch": [
          3,
          3
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "workshop-green",
        "name": "workshop green",
        "tiles": [
          [
            12,
            4
          ]
        ],
        "switch": [
          9,
          11
        ],
        "color": [
          116,
          190,
          143
        ]
      },
      {
        "id": "workshop-red",
        "name": "workshop red",
        "tiles": [
          [
            17,
            10
          ]
        ],
        "switch": [
          15,
          3
        ],
        "color": [
          229,
          119,
          112
        ]
      },
      {
        "id": "delivery-home",
        "name": "delivery home",
        "tiles": [
          [
            6,
            3
          ],
          [
            12,
            10
          ],
          [
            17,
            3
          ]
        ],
        "color": [
          133,
          200,
          231
        ]
      }
    ],
    "guards": [
      {
        "kind": "mimic",
        "spawn": [
          9,
          7
        ],
        "patrol": [
          [
            9,
            7
          ]
        ],
        "facing": 0
      },
      {
        "kind": "fox",
        "spawn": [
          20,
          9
        ],
        "patrol": [
          [
            19,
            9
          ],
          [
            21,
            9
          ]
        ],
        "facing": 1.5707963267948966
      },
      {
        "kind": "fox",
        "spawn": [
          14,
          7
        ],
        "patrol": [
          [
            13,
            7
          ],
          [
            16,
            7
          ]
        ],
        "facing": 0
      }
    ],
    "fieldNotes": [
      {
        "id": "winter-presents-note-0",
        "at": [
          4,
          4
        ],
        "title": "An inventory problem",
        "body": "Pip counted the presents twice. One of them giggled. The green fellow with the sack would not stand still long enough to be counted."
      }
    ],
    "props": [
      {
        "at": [
          12,
          1
        ],
        "kind": "brazier"
      },
      {
        "at": [
          17,
          1
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
          17,
          6
        ],
        "kind": "pine"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "brazier"
      },
      {
        "at": [
          12,
          11
        ],
        "kind": "lantern"
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
          6,
          13
        ],
        "kind": "pine"
      }
    ],
    "slippery": [
      [
        13,
        11
      ],
      [
        14,
        11
      ],
      [
        15,
        11
      ],
      [
        16,
        11
      ],
      [
        13,
        12
      ],
      [
        14,
        12
      ],
      [
        15,
        12
      ],
      [
        16,
        12
      ]
    ],
    "brief": "Three workshop switches, a suspicious parcel and a thief with very good ears.",
    "hint": "Blue, green, then red opens the delivery route. A twitching present deserves a snowball. Two Gift Snatchers listen in the workshop: creep past them on quiet ground. The key opens the upper doors home. A flurry gusts down the middle room toward the twitching present; crawl to hold your line.",
    "foxWarn": 1.05,
    "reactions": [
      {
        "id": "present-key",
        "when": "key",
        "open": [
          "delivery-home"
        ]
      }
    ],
    "map": [
      "#######################",
      "#.....#.....#....#....#",
      "#.X.1.#....1#1...#..K1#",
      "#...........#.........#",
      "#.....#..........#.#.L#",
      "#.....#.....#.L..#.#..#",
      "#...L.#.....#....#.#..#",
      "#.....#.....#....#L...#",
      "#.1...#L....#....#....#",
      "#.....#.....#....#....#",
      "#...............L.....#",
      "#.....#....L#....#1...#",
      "#.@.1.#.1...#..1.#...1#",
      "#.....#.....#....#....#",
      "#######################"
    ]
  },
  {
    "id": "winter-mill",
    "name": "The Frozen Mill",
    "index": 4,
    "revision": 1,
    "difficulty": "Medium",
    "seasonalTheme": "winter-ice",
    "cunning": 2,
    "pebbles": 3,
    "tongues": 2,
    "spores": 1,
    "gates": [
      {
        "id": "frozen-upper",
        "name": "frozen upper",
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
        "color": [
          133,
          200,
          231
        ],
        "bridge": true
      },
      {
        "id": "frozen-loft",
        "name": "frozen loft",
        "tiles": [
          [
            22,
            4
          ]
        ],
        "switch": [
          16,
          12
        ],
        "color": [
          116,
          190,
          143
        ]
      },
      {
        "id": "frozen-lower",
        "name": "frozen lower",
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
        "color": [
          133,
          200,
          231
        ],
        "bridge": true
      }
    ],
    "guards": [
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
      },
      {
        "kind": "snake",
        "spawn": [
          18,
          8
        ],
        "patrol": [
          [
            17,
            8
          ],
          [
            20,
            8
          ]
        ],
        "facing": 0
      }
    ],
    "fieldNotes": [
      {
        "id": "winter-mill-note-0",
        "at": [
          8,
          7
        ],
        "title": "Water beneath the ice",
        "body": "The millrace never freezes. The blue switch is within Tongue reach from this bank. Please use the bridge. - The mill keeper"
      }
    ],
    "props": [
      {
        "at": [
          3,
          4
        ],
        "kind": "brazier"
      },
      {
        "at": [
          18,
          4
        ],
        "kind": "pine"
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
        "kind": "pine"
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
        "kind": "brazier"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "gift"
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
        "kind": "pine"
      }
    ],
    "slippery": [
      [
        6,
        5
      ],
      [
        7,
        5
      ],
      [
        8,
        5
      ],
      [
        6,
        6
      ],
      [
        7,
        6
      ],
      [
        8,
        6
      ],
      [
        6,
        7
      ],
      [
        7,
        7
      ],
      [
        6,
        8
      ],
      [
        7,
        8
      ],
      [
        8,
        8
      ],
      [
        15,
        6
      ],
      [
        16,
        6
      ],
      [
        15,
        7
      ],
      [
        16,
        7
      ],
      [
        15,
        8
      ],
      [
        16,
        8
      ],
      [
        15,
        9
      ],
      [
        16,
        9
      ],
      [
        15,
        10
      ],
      [
        23,
        6
      ],
      [
        22,
        7
      ],
      [
        23,
        7
      ],
      [
        22,
        8
      ],
      [
        23,
        8
      ]
    ],
    "brief": "Wake the mill bridges, cross the unfrozen channel and find the key in the loft.",
    "hint": "Tongue the blue switch from the west bank. The loft switch is in the lower mill yard. Ice is slippery; the wooden bridge ends are good braking places. A Candy Cane Serpent patrols the yard by the race.",
    "millWheel": [
      14,
      7
    ],
    "reactions": [
      {
        "id": "mill-key",
        "when": "key",
        "open": [
          "frozen-lower"
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
      "#.1......._____......LL1#",
      "#.......L1_____.........#",
      "#..###...._____.........#",
      "#..###...._____..####...#",
      "#..###..........L####...#",
      "#.......L._____..####...#",
      "#.X....1.._____......1.L#",
      "#........._____.1.......#",
      "#########################"
    ]
  },
  {
    "id": "winter-yeti",
    "name": "The Yeti's Pass",
    "index": 5,
    "revision": 1,
    "difficulty": "Medium–hard",
    "seasonalTheme": "winter-village",
    "cunning": 2,
    "pebbles": 3,
    "tongues": 2,
    "spores": 1,
    "gates": [
      {
        "id": "mountain-west",
        "name": "mountain west",
        "tiles": [
          [
            7,
            3
          ]
        ],
        "switch": [
          3,
          13
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "mountain-east",
        "name": "mountain east",
        "tiles": [
          [
            15,
            3
          ]
        ],
        "switch": [
          9,
          8
        ],
        "color": [
          116,
          190,
          143
        ]
      },
      {
        "id": "mountain-home",
        "name": "mountain home",
        "tiles": [
          [
            15,
            13
          ]
        ],
        "color": [
          133,
          200,
          231
        ]
      }
    ],
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
        "kind": "toad",
        "spawn": [
          20,
          12
        ],
        "patrol": [
          [
            20,
            11
          ],
          [
            20,
            15
          ]
        ],
        "facing": 1.5707963267948966
      }
    ],
    "fieldNotes": [
      {
        "id": "winter-yeti-note-0",
        "at": [
          4,
          12
        ],
        "title": "The old mountain path",
        "body": "You need not outrun a Yeti. Let it choose a direction, then choose a different one. Snowbanks and stone beds are rather good at stopping a charge."
      }
    ],
    "props": [
      {
        "at": [
          7,
          1
        ],
        "kind": "brazier"
      },
      {
        "at": [
          15,
          5
        ],
        "kind": "pine"
      },
      {
        "at": [
          2,
          6
        ],
        "kind": "lantern"
      },
      {
        "at": [
          7,
          6
        ],
        "kind": "pine"
      },
      {
        "at": [
          12,
          6
        ],
        "kind": "gift"
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
        "kind": "pine"
      },
      {
        "at": [
          19,
          7
        ],
        "kind": "brazier"
      },
      {
        "at": [
          1,
          8
        ],
        "kind": "gift"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "pine"
      },
      {
        "at": [
          11,
          8
        ],
        "kind": "pine"
      },
      {
        "at": [
          16,
          8
        ],
        "kind": "gift"
      },
      {
        "at": [
          21,
          8
        ],
        "kind": "pine"
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
        "kind": "pine"
      },
      {
        "at": [
          15,
          10
        ],
        "kind": "pine"
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
          7,
          11
        ],
        "kind": "gift"
      },
      {
        "at": [
          15,
          15
        ],
        "kind": "gift"
      }
    ],
    "slippery": [
      [
        8,
        1
      ],
      [
        9,
        1
      ],
      [
        10,
        1
      ],
      [
        11,
        1
      ],
      [
        12,
        1
      ],
      [
        13,
        1
      ],
      [
        14,
        1
      ],
      [
        8,
        2
      ],
      [
        9,
        2
      ],
      [
        10,
        2
      ],
      [
        11,
        2
      ],
      [
        12,
        2
      ],
      [
        13,
        2
      ],
      [
        14,
        2
      ],
      [
        8,
        3
      ],
      [
        9,
        3
      ],
      [
        10,
        3
      ],
      [
        11,
        3
      ],
      [
        12,
        3
      ],
      [
        13,
        3
      ],
      [
        14,
        3
      ],
      [
        9,
        4
      ],
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
      ],
      [
        16,
        11
      ],
      [
        16,
        12
      ],
      [
        17,
        12
      ],
      [
        16,
        13
      ],
      [
        17,
        13
      ],
      [
        16,
        14
      ],
      [
        17,
        14
      ]
    ],
    "brief": "A mountain gardener has become a very determined Yeti.",
    "hint": "Blue opens the pass; green opens the far garden. The Yeti raises its arms before charging. Step behind the stone beds, then move while it recovers. A snowman guards the far garden, and the far gate wakes a serpent in the low garden.",
    "reactions": [
      {
        "id": "yeti-key",
        "when": "key",
        "open": [
          "mountain-home"
        ],
        "spawn": [
          "yeti-serpent"
        ],
        "message": "The far gate opens, and a Candy Cane Serpent uncoils in the low garden."
      }
    ],
    "thorns": [
      {
        "tiles": [
          [
            3,
            8
          ]
        ],
        "period": 5,
        "up": 1,
        "warn": 1,
        "skin": "icicle"
      }
    ],
    "map": [
      "#######################",
      "#......#.......#......#",
      "#.@..1.#.1.....#.1..K.#",
      "#.....................#",
      "#...L..#L....1.#....1.#",
      "#.1....#.......#.L....#",
      "###.#####.########.####",
      "###.####.......###.####",
      "###.####.L.##..###.####",
      "###.####.1...L.###.####",
      "###.#######.######.####",
      "#......#.......#.L....#",
      "#....1.#.......#......#",
      "#...................L.#",
      "#.X....#.....1.#......#",
      "#......#.......#....1.#",
      "#######################"
    ],
    "reinforcements": [
      {
        "id": "yeti-serpent",
        "kind": "snake",
        "spawn": [
          11,
          12
        ],
        "patrol": [
          [
            11,
            11
          ],
          [
            11,
            15
          ]
        ],
        "facing": 1.5707963267948966
      }
    ]
  },
  {
    "id": "winter-bells",
    "name": "Bells in the Blizzard",
    "index": 6,
    "revision": 1,
    "difficulty": "Hard",
    "seasonalTheme": "winter-night",
    "cunning": 3,
    "pebbles": 2,
    "tongues": 2,
    "spores": 1,
    "gates": [
      {
        "id": "bell-west",
        "name": "bell west",
        "tiles": [
          [
            7,
            3
          ]
        ],
        "switch": [
          3,
          12
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "bell-east",
        "name": "bell east",
        "tiles": [
          [
            14,
            3
          ]
        ],
        "switch": [
          10,
          8
        ],
        "color": [
          181,
          152,
          230
        ]
      },
      {
        "id": "bell-home",
        "name": "bell home",
        "tiles": [
          [
            7,
            13
          ],
          [
            14,
            13
          ]
        ],
        "color": [
          133,
          200,
          231
        ]
      }
    ],
    "guards": [
      {
        "kind": "spider",
        "spawn": [
          11,
          12
        ],
        "patrol": [
          [
            9,
            12
          ],
          [
            12,
            12
          ]
        ],
        "facing": 0
      },
      {
        "kind": "owl",
        "spawn": [
          16,
          2
        ],
        "patrol": [
          [
            15,
            1
          ],
          [
            23,
            1
          ],
          [
            20,
            5
          ]
        ],
        "facing": 1.5707963267948966
      },
      {
        "kind": "snake",
        "spawn": [
          11,
          1
        ],
        "patrol": [
          [
            9,
            1
          ],
          [
            12,
            1
          ],
          [
            12,
            5
          ],
          [
            9,
            5
          ]
        ],
        "facing": 0
      }
    ],
    "fieldNotes": [
      {
        "id": "winter-bells-note-0",
        "at": [
          4,
          11
        ],
        "title": "Bells behind you",
        "body": "Krampus finds his way by his tangled ribbons. Your glow mushroom makes him wait beyond the light. Keep moving before it fades."
      },
      {
        "id": "winter-bells-note-1",
        "at": [
          20,
          5
        ],
        "title": "A warm place",
        "body": "The blizzard is short, but cold feet are slow feet. Warm up beside the next brazier. The ghostly keeper marks its landing before it swoops."
      }
    ],
    "props": [
      {
        "at": [
          7,
          1
        ],
        "kind": "brazier"
      },
      {
        "at": [
          14,
          2
        ],
        "kind": "pine"
      },
      {
        "at": [
          19,
          2
        ],
        "kind": "lantern"
      },
      {
        "at": [
          13,
          4
        ],
        "kind": "pine"
      },
      {
        "at": [
          7,
          6
        ],
        "kind": "pine"
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
        "kind": "pine"
      },
      {
        "at": [
          22,
          6
        ],
        "kind": "pine"
      },
      {
        "at": [
          14,
          7
        ],
        "kind": "gift"
      },
      {
        "at": [
          19,
          7
        ],
        "kind": "pine"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "brazier"
      },
      {
        "at": [
          16,
          8
        ],
        "kind": "gift"
      },
      {
        "at": [
          21,
          8
        ],
        "kind": "pine"
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
        "kind": "gift"
      },
      {
        "at": [
          23,
          9
        ],
        "kind": "pine"
      },
      {
        "at": [
          15,
          10
        ],
        "kind": "pine"
      },
      {
        "at": [
          7,
          11
        ],
        "kind": "lantern"
      },
      {
        "at": [
          14,
          12
        ],
        "kind": "pine"
      },
      {
        "at": [
          13,
          14
        ],
        "kind": "gift"
      }
    ],
    "slippery": [
      [
        15,
        12
      ],
      [
        16,
        12
      ],
      [
        17,
        12
      ],
      [
        18,
        12
      ],
      [
        15,
        13
      ],
      [
        16,
        13
      ],
      [
        17,
        13
      ],
      [
        18,
        13
      ],
      [
        15,
        14
      ],
      [
        16,
        14
      ],
      [
        17,
        14
      ],
      [
        21,
        12
      ]
    ],
    "glows": 2,
    "brief": "Follow the bells between warm shelters. Something in the snow dislikes your light.",
    "hint": "Blue then violet opens the upper trail. Krampus waits among the lower drifts; a glow mushroom makes him shrink back. The wisp shows where it means to swoop. A serpent winds along the upper trail, and the bells wake a Gift Snatcher in the west yard.",
    "reactions": [
      {
        "id": "bell-key",
        "when": "key",
        "open": [
          "bell-home"
        ],
        "spawn": [
          "bells-snatcher"
        ],
        "message": "The bells ring out. Both lower gates open, and a Gift Snatcher creeps into the west yard."
      }
    ],
    "cold": [
      [
        20,
        7,
        20,
        10
      ]
    ],
    "warm": [
      [
        20,
        5
      ],
      [
        20,
        11
      ],
      [
        19,
        11
      ],
      [
        21,
        11
      ]
    ],
    "wind": [
      {
        "area": [
          20,
          8,
          20,
          9
        ],
        "dir": [
          1,
          0
        ],
        "period": 6,
        "on": 1.1,
        "offset": 0
      }
    ],
    "map": [
      "#########################",
      "#.....##.....##.........#",
      "#.@.1.##.1...##..###..K1#",
      "#................###....#",
      "#...L.##L....##L.....1..#",
      "#.....##.....##.......L.#",
      "#.....####.#########.####",
      "#.....##.....#######.####",
      "#.....##.L...#######.####",
      "#.1...##...1.#######.####",
      "#.....####.#########.####",
      "#.....##.....##.........#",
      "#.....##.....##......c..#",
      "#.......................#",
      "#.X..1##1...L##...L...1.#",
      "#.....##....1##.........#",
      "#########################"
    ],
    "reinforcements": [
      {
        "id": "bells-snatcher",
        "kind": "fox",
        "spawn": [
          3,
          8
        ],
        "patrol": [
          [
            2,
            8
          ],
          [
            5,
            8
          ]
        ],
        "facing": 0
      }
    ]
  },
  {
    "id": "winter-star",
    "name": "The Christmas Star",
    "index": 7,
    "revision": 1,
    "difficulty": "Hard",
    "seasonalTheme": "winter-finale",
    "cunning": 3,
    "pebbles": 2,
    "tongues": 2,
    "spores": 1,
    "gates": [
      {
        "id": "star-orchard",
        "name": "star orchard",
        "tiles": [
          [
            8,
            3
          ]
        ],
        "switch": [
          3,
          13
        ],
        "color": [
          133,
          200,
          231
        ]
      },
      {
        "id": "star-courtyard",
        "name": "star courtyard",
        "tiles": [
          [
            17,
            3
          ]
        ],
        "switch": [
          14,
          8
        ],
        "color": [
          116,
          190,
          143
        ]
      },
      {
        "id": "star-home",
        "name": "star home",
        "tiles": [
          [
            8,
            13
          ],
          [
            17,
            13
          ]
        ],
        "color": [
          133,
          200,
          231
        ]
      }
    ],
    "guards": [
      {
        "kind": "sentinel",
        "spawn": [
          24,
          4
        ],
        "patrol": [
          [
            24,
            5
          ],
          [
            25,
            4
          ],
          [
            23,
            4
          ]
        ],
        "facing": 1.5707963267948966
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
        "kind": "spider",
        "spawn": [
          13,
          12
        ],
        "patrol": [
          [
            11,
            12
          ],
          [
            15,
            12
          ]
        ],
        "facing": 0
      },
      {
        "kind": "beetle",
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
    "fieldNotes": [
      {
        "id": "winter-star-note-0",
        "at": [
          2,
          12
        ],
        "title": "One star to guide us",
        "body": "Eight little journeys can make one great light. The watchman's beam glints before it freezes you. The cracks belong to Sally, and the snowy corners belong to anyone who thinks to use them."
      }
    ],
    "props": [
      {
        "at": [
          17,
          1
        ],
        "kind": "brazier"
      },
      {
        "at": [
          9,
          2
        ],
        "kind": "pine"
      },
      {
        "at": [
          8,
          4
        ],
        "kind": "gift"
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
          2,
          6
        ],
        "kind": "pine"
      },
      {
        "at": [
          7,
          6
        ],
        "kind": "pine"
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
        "kind": "pine"
      },
      {
        "at": [
          22,
          6
        ],
        "kind": "pine"
      },
      {
        "at": [
          4,
          7
        ],
        "kind": "pine"
      },
      {
        "at": [
          9,
          7
        ],
        "kind": "brazier"
      },
      {
        "at": [
          19,
          7
        ],
        "kind": "pine"
      },
      {
        "at": [
          24,
          7
        ],
        "kind": "pine"
      },
      {
        "at": [
          1,
          8
        ],
        "kind": "gift"
      },
      {
        "at": [
          6,
          8
        ],
        "kind": "pine"
      },
      {
        "at": [
          21,
          8
        ],
        "kind": "pine"
      },
      {
        "at": [
          8,
          9
        ],
        "kind": "pine"
      },
      {
        "at": [
          18,
          9
        ],
        "kind": "gift"
      },
      {
        "at": [
          5,
          10
        ],
        "kind": "gift"
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
        "kind": "pine"
      },
      {
        "at": [
          20,
          10
        ],
        "kind": "gift"
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
        "kind": "gift"
      },
      {
        "at": [
          8,
          14
        ],
        "kind": "pine"
      },
      {
        "at": [
          18,
          14
        ],
        "kind": "pine"
      }
    ],
    "slippery": [
      [
        10,
        1
      ],
      [
        11,
        1
      ],
      [
        12,
        1
      ],
      [
        13,
        1
      ],
      [
        14,
        1
      ],
      [
        15,
        1
      ],
      [
        16,
        1
      ],
      [
        10,
        2
      ],
      [
        11,
        2
      ],
      [
        12,
        2
      ],
      [
        13,
        2
      ],
      [
        14,
        2
      ],
      [
        15,
        2
      ],
      [
        16,
        2
      ],
      [
        10,
        3
      ],
      [
        11,
        3
      ],
      [
        12,
        3
      ],
      [
        13,
        3
      ],
      [
        14,
        3
      ],
      [
        15,
        3
      ],
      [
        16,
        3
      ],
      [
        19,
        11
      ],
      [
        20,
        11
      ],
      [
        21,
        11
      ],
      [
        22,
        11
      ],
      [
        23,
        11
      ],
      [
        24,
        11
      ],
      [
        19,
        12
      ],
      [
        20,
        12
      ],
      [
        21,
        12
      ],
      [
        22,
        12
      ]
    ],
    "glows": 2,
    "seeds": 1,
    "brief": "Bring the last ornament home and wake the Christmas star.",
    "hint": "Open the orchard and courtyard gates. The Nutcracker watches with a cold spotlight; use corners and leave its glint before it freezes you. The key opens the lower route home, but it wakes a serpent in the low garden and a Gift Snatcher by the hatch: crawl the last stretch.",
    "reactions": [
      {
        "id": "star-key",
        "when": "key",
        "open": [
          "star-home"
        ],
        "spawn": [
          "star-serpent",
          "star-snatcher"
        ],
        "message": "The Christmas gates open. Bring the last ornament home - but the whole hollow is awake now."
      }
    ],
    "map": [
      "###########################",
      "#.......##.......##.......#",
      "#.@...1.##.1.....##.1...K.#",
      "#.....................I...#",
      "#....L..##L....1.##L1.I...#",
      "#.......##...S...##....L..#",
      "###.######S##S#########.###",
      "###.######...S...######.###",
      "###.######.L#..#.######...#",
      "###.######.1.....######..1#",
      "###.#########.#########L#.#",
      "#.......##.......##......L#",
      "#...L1..##.......##....#L.#",
      "#..............1..........#",
      "#.X.....##...L..L##1L...L.#",
      "#.......##.......##.......#",
      "###########################"
    ],
    "reinforcements": [
      {
        "id": "star-serpent",
        "kind": "snake",
        "spawn": [
          15,
          15
        ],
        "patrol": [
          [
            16,
            15
          ],
          [
            11,
            15
          ]
        ],
        "facing": 3.141592653589793
      },
      {
        "id": "star-snatcher",
        "kind": "fox",
        "spawn": [
          3,
          12
        ],
        "patrol": [
          [
            2,
            12
          ],
          [
            6,
            12
          ]
        ],
        "facing": 0
      }
    ]
  }
];root.EscapeWinter=routes;if(typeof module!=="undefined"&&module.exports)module.exports=routes;})(typeof globalThis!=="undefined"?globalThis:this);
