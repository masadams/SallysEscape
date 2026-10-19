(function(root){
  // Authored loops always have a walking route. Burrows are tempting shortcuts,
  // never a key that can be accidentally spent and make an escape impossible.
  const levels=[
    {id:'quiet-vault',name:'The Quiet Vault',brief:'A guarded key. Two shortcuts. Your first escape.',hint:'Cracked walls are shortcuts. Stand still in leaves to hide.',
      rooms:[[1,8,4,11],[1,1,4,4],[6,1,9,3],[6,6,9,9],[11,1,15,5],[11,8,15,11],[4,9,6,9],[2,4,2,8],[4,2,6,2],[9,3,11,3],[7,3,7,6],[9,4,9,6],[9,4,11,4],[9,8,11,8],[13,5,13,8]],
      cracks:[[5,8],[10,2]],cover:[[3,3],[8,7],[12,10]],gravel:[],spawn:[2,10],exit:[2,2],key:[14,2],burrows:2,pebbles:2,
      loot:[[3,10,1],[4,11,1],[8,2,1],[8,8,1],[12,9,1],[14,10,3],[15,11,1],[14,4,1]],
      guards:[{spawn:[13,4],facing:Math.PI,patrol:[[11,4],[11,2],[15,2],[15,4]]}]},
    {id:'leafy-crossroads',name:'Leafy Crossroads',brief:'Wait in the leaves, pocket the key, and cross to the far hatch.',hint:'Leaves hide you while still. Wait for a gap in the patrol.',
      rooms:[[1,1,4,4],[6,1,9,4],[11,1,15,4],[1,6,4,11],[6,6,9,11],[11,6,15,11],[4,2,6,2],[9,2,11,2],[4,8,6,8],[9,8,11,8],[2,4,2,6],[7,4,7,6],[13,4,13,6]],
      cracks:[[5,7],[10,7]],cover:[[2,7],[7,4],[8,7],[12,7],[14,3]],gravel:[],spawn:[2,10],exit:[14,10],key:[7,2],burrows:2,pebbles:2,
      loot:[[3,10,1],[2,2,1],[8,3,1],[8,8,1],[12,2,1],[14,9,3],[15,11,1],[12,8,1]],
      guards:[{spawn:[9,2],facing:Math.PI,patrol:[[6,2],[6,3],[9,3],[9,2]]}]},
    {
  "id": "crumbling-hall",
  "name": "Crumbling Hall",
  "brief": "A broken hall with a quiet outside route and a noisy central shortcut.",
  "hint": "Loose stones make noise. Watch the central patrol, or take the wider outside path.",
  "rooms": [
    [
      1,
      8,
      6,
      12
    ],
    [
      1,
      1,
      6,
      4
    ],
    [
      8,
      1,
      11,
      3
    ],
    [
      7,
      5,
      11,
      9
    ],
    [
      13,
      1,
      17,
      4
    ],
    [
      12,
      8,
      17,
      12
    ],
    [
      3,
      4,
      5,
      8
    ],
    [
      5,
      7,
      13,
      7
    ],
    [
      8,
      3,
      8,
      5
    ],
    [
      15,
      4,
      15,
      8
    ],
    [
      6,
      2,
      8,
      2
    ]
  ],
  "cracks": [
    [
      6,
      2
    ],
    [
      11,
      2
    ]
  ],
  "cover": [
    [
      3,
      6
    ],
    [
      8,
      3
    ],
    [
      9,
      5
    ],
    [
      13,
      8
    ],
    [
      4,
      10
    ]
  ],
  "gravel": [
    [
      5,
      7
    ],
    [
      6,
      7
    ],
    [
      11,
      7
    ],
    [
      12,
      7
    ]
  ],
  "spawn": [
    2,
    10
  ],
  "exit": [
    2,
    2
  ],
  "key": [
    14,
    10
  ],
  "burrows": 1,
  "pebbles": 2,
  "loot": [
    [
      4,
      10,
      1
    ],
    [
      4,
      2,
      1
    ],
    [
      9,
      2,
      1
    ],
    [
      7,
      6,
      1
    ],
    [
      9,
      8,
      3
    ],
    [
      14,
      2,
      1
    ],
    [
      15,
      10,
      1
    ],
    [
      12,
      9,
      1
    ]
  ],
  "guards": [
    {
      "spawn": [
        10,
        6
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          7,
          6
        ],
        [
          7,
          8
        ],
        [
          10,
          8
        ],
        [
          10,
          6
        ]
      ]
    }
  ],
  "width": 19,
  "height": 15,
  "revision": 2
},
    {id:'twin-watch',name:'Twin Watch',brief:'Two patrols, two tempting rooms. Pick your moment to pass.',hint:'Each guard has its own patrol. One pebble can distract nearby guards.',
      rooms:[[1,1,6,5],[10,1,15,5],[1,8,15,11],[4,5,4,8],[12,5,12,8],[6,4,10,4],[7,2,7,4],[9,2,9,4]],
      cracks:[[8,2],[8,4]],cover:[[4,6],[12,6],[3,3],[13,3],[8,10]],gravel:[],spawn:[3,10],exit:[13,10],key:[12,2],burrows:2,pebbles:2,
      loot:[[2,2,3],[5,4,1],[11,4,1],[14,2,1],[3,9,1],[8,9,1],[14,9,1],[12,11,1]],
      guards:[{spawn:[5,2],facing:Math.PI,patrol:[[2,2],[2,4],[5,4],[5,2]]},{spawn:[14,4],facing:-Math.PI/2,patrol:[[14,2],[11,2],[11,4],[14,4]]}]},
    {
  "id": "moonlit-escape",
  "name": "Moonlit Escape",
  "brief": "Two patrols and a moonlit return. One seed can grow a hiding place.",
  "hint": "Press F on bare ground to grow leaves. Stop inside them to hide. Keep your pebble for a tight crossing.",
  "rooms": [
    [
      1,
      1,
      15,
      3
    ],
    [
      1,
      5,
      5,
      7
    ],
    [
      11,
      5,
      15,
      7
    ],
    [
      1,
      9,
      15,
      11
    ],
    [
      3,
      3,
      3,
      5
    ],
    [
      13,
      3,
      13,
      5
    ],
    [
      3,
      7,
      3,
      9
    ],
    [
      13,
      7,
      13,
      9
    ],
    [
      5,
      6,
      11,
      6
    ]
  ],
  "cracks": [
    [
      8,
      6
    ]
  ],
  "cover": [
    [
      3,
      7
    ],
    [
      13,
      5
    ],
    [
      10,
      3
    ],
    [
      4,
      11
    ],
    [
      12,
      11
    ]
  ],
  "gravel": [
    [
      6,
      10
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
      9,
      10
    ],
    [
      6,
      2
    ],
    [
      7,
      2
    ]
  ],
  "spawn": [
    2,
    10
  ],
  "exit": [
    14,
    10
  ],
  "key": [
    8,
    2
  ],
  "burrows": 2,
  "pebbles": 2,
  "loot": [
    [
      4,
      6,
      1
    ],
    [
      2,
      2,
      1
    ],
    [
      12,
      2,
      1
    ],
    [
      14,
      6,
      1
    ],
    [
      5,
      11,
      1
    ],
    [
      10,
      11,
      1
    ],
    [
      14,
      1,
      3
    ],
    [
      1,
      10,
      1
    ]
  ],
  "guards": [
    {
      "spawn": [
        12,
        2
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          3,
          2
        ],
        [
          3,
          1
        ],
        [
          12,
          1
        ],
        [
          12,
          2
        ]
      ]
    },
    {
      "spawn": [
        12,
        10
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          8,
          10
        ],
        [
          8,
          9
        ],
        [
          12,
          9
        ],
        [
          12,
          10
        ]
      ]
    }
  ],
  "seeds": 1,
  "revision": 2
},
    {id:'switchback-garden',name:'Switchback Garden',brief:'A bigger garden. Find the blue switch to open the key room.',hint:'Stand on the blue switch. Its matching gates stay open.',width:21,height:17,explore:true,
      rooms:[[1,1,7,6],[13,1,19,6],[1,10,19,15],[4,6,4,10],[16,6,16,10],[7,4,13,4]],
      cracks:[],cover:[[4,6],[6,3],[14,4],[16,10],[10,13]],gravel:[],spawn:[3,13],exit:[17,13],key:[17,3],burrows:2,pebbles:3,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[4,3],tiles:[[10,4],[16,8]]}],
      loot:[[2,2,1],[6,5,1],[14,2,1],[18,5,3],[7,11,1],[11,14,1],[18,14,1],[3,14,1]],
      guards:[{spawn:[6,2],facing:Math.PI,patrol:[[2,2],[6,2],[6,5],[2,5]]},{spawn:[18,5],facing:Math.PI,patrol:[[15,2],[18,2],[18,5],[15,5]]}]},
    {id:'lantern-courtyard',name:'Lantern Courtyard',brief:'The beetle aims before it charges. Dodge sideways and slip through.',hint:'Amber light means the beetle is aiming. Its charge cannot turn.',width:21,height:17,explore:true,
      rooms:[[1,1,19,3],[1,13,19,15],[1,3,4,13],[16,3,19,13],[7,5,13,11],[4,8,7,8],[13,8,16,8]],
      cracks:[],cover:[[3,7],[8,8],[12,8],[17,11]],gravel:[[17,8],[18,8]],spawn:[2,14],exit:[18,14],key:[10,8],burrows:2,pebbles:3,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[2,2],tiles:[[6,8],[14,8]]}],
      loot:[[3,14,1],[8,2,1],[18,2,1],[8,6,1],[12,10,3],[17,6,1],[10,14,1],[8,10,1]],
      guards:[{kind:'beetle',spawn:[12,10],facing:-Math.PI/2,patrol:[[8,6],[12,6],[12,10],[8,10]]},{spawn:[18,3],facing:Math.PI,patrol:[[16,2],[18,2],[18,5],[16,5]]}]},
    {id:'echo-cistern',name:'Echo Cistern',brief:'Follow two switches into the cistern. Listen for danger beyond the next room.',hint:'Blue opens the middle chamber. Amber opens the key chamber.',width:25,height:19,explore:true,
      rooms:[[1,13,23,17],[1,1,7,6],[10,1,15,6],[18,1,23,7],[4,6,4,13],[12,6,12,13],[20,7,20,13],[7,3,10,3],[15,4,18,4],[4,10,20,10]],
      cracks:[],cover:[[4,7],[6,4],[11,4],[20,8],[17,14],[8,15]],gravel:[[8,10],[9,10],[17,10],[18,10]],spawn:[3,15],exit:[21,15],key:[21,3],burrows:2,pebbles:3,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[8,3],[12,8]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[12,3],tiles:[[16,4],[20,9]]}],
      loot:[[2,2,1],[6,5,1],[11,2,1],[14,5,1],[19,2,3],[22,6,1],[7,16,1],[18,16,1]],
      guards:[{spawn:[6,2],facing:Math.PI,patrol:[[2,2],[6,2],[6,5],[2,5]]},{kind:'beetle',spawn:[14,5],facing:Math.PI,patrol:[[11,2],[14,2],[14,5],[11,5]]},{spawn:[22,6],facing:-Math.PI/2,patrol:[[19,2],[22,2],[22,6],[19,6]]}]},
    {
  "id": "buried-observatory",
  "name": "Buried Observatory",
  "brief": "A short plate crossing leads to the central switch. Either bank can raise it again.",
  "hint": "The turquoise plate raises the crossing for eight seconds. There is another plate on the far bank.",
  "width": 25,
  "height": 19,
  "explore": true,
  "rooms": [
    [
      1,
      1,
      9,
      6
    ],
    [
      15,
      1,
      23,
      6
    ],
    [
      1,
      12,
      9,
      17
    ],
    [
      15,
      12,
      23,
      17
    ],
    [
      9,
      4,
      15,
      4
    ],
    [
      9,
      14,
      15,
      14
    ],
    [
      4,
      6,
      4,
      12
    ],
    [
      20,
      6,
      20,
      12
    ],
    [
      10,
      8,
      14,
      10
    ],
    [
      4,
      9,
      10,
      9
    ],
    [
      14,
      9,
      20,
      9
    ]
  ],
  "cracks": [],
  "cover": [
    [
      4,
      7
    ],
    [
      16,
      4
    ],
    [
      12,
      10
    ],
    [
      19,
      13
    ],
    [
      8,
      15
    ]
  ],
  "gravel": [
    [
      4,
      8
    ],
    [
      20,
      10
    ],
    [
      14,
      4
    ]
  ],
  "spawn": [
    3,
    15
  ],
  "exit": [
    21,
    15
  ],
  "key": [
    21,
    3
  ],
  "burrows": 2,
  "pebbles": 3,
  "gates": [
    {
      "id": "blue",
      "name": "Blue",
      "color": [
        106,
        195,
        236
      ],
      "switch": [
        3,
        3
      ],
      "tiles": [
        [
          12,
          4
        ],
        [
          20,
          7
        ]
      ]
    },
    {
      "id": "amber",
      "name": "Amber",
      "color": [
        239,
        181,
        83
      ],
      "switch": [
        12,
        9
      ],
      "tiles": [
        [
          18,
          9
        ],
        [
          12,
          14
        ],
        [
          20,
          11
        ]
      ]
    },
    {
      "id": "practice-span",
      "name": "Cistern",
      "color": [
        105,
        208,
        185
      ],
      "bridge": true,
      "duration": 8,
      "plates": [
        [
          5,
          9
        ],
        [
          7,
          9
        ]
      ],
      "tiles": [
        [
          6,
          9
        ]
      ]
    }
  ],
  "loot": [
    [
      2,
      2,
      1
    ],
    [
      8,
      5,
      1
    ],
    [
      16,
      2,
      1
    ],
    [
      22,
      5,
      3
    ],
    [
      11,
      10,
      1
    ],
    [
      7,
      16,
      1
    ],
    [
      17,
      16,
      1
    ],
    [
      22,
      13,
      1
    ]
  ],
  "guards": [
    {
      "spawn": [
        7,
        2
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          2,
          2
        ],
        [
          7,
          2
        ],
        [
          7,
          5
        ],
        [
          2,
          5
        ]
      ]
    },
    {
      "kind": "beetle",
      "spawn": [
        22,
        5
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          16,
          2
        ],
        [
          22,
          2
        ],
        [
          22,
          5
        ],
        [
          16,
          5
        ]
      ]
    },
    {
      "spawn": [
        22,
        16
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          16,
          13
        ],
        [
          22,
          13
        ],
        [
          22,
          16
        ],
        [
          16,
          16
        ]
      ]
    }
  ],
  "revision": 2
},
    {
  "id": "reed-bank",
  "name": "Reed Bank",
  "brief": "A forked river, three tongue grabs, and two different bank routes.",
  "hint": "Face the key from the bank and press R. The southern shallows are swimmable, but slow your feet.",
  "width": 23,
  "height": 19,
  "explore": true,
  "rooms": [
    [
      1,
      2,
      4,
      16
    ],
    [
      4,
      2,
      20,
      4
    ],
    [
      8,
      4,
      14,
      11
    ],
    [
      7,
      7,
      8,
      9
    ],
    [
      14,
      6,
      20,
      9
    ],
    [
      16,
      9,
      20,
      16
    ],
    [
      4,
      14,
      16,
      16
    ],
    [
      19,
      4,
      20,
      6
    ],
    [
      4,
      12,
      8,
      12
    ]
  ],
  "cracks": [],
  "cover": [
    [
      4,
      8
    ],
    [
      8,
      5
    ],
    [
      12,
      11
    ],
    [
      16,
      12
    ]
  ],
  "gravel": [],
  "gaps": [
    [
      14,
      8
    ],
    [
      5,
      5
    ],
    [
      6,
      5
    ],
    [
      7,
      5
    ],
    [
      5,
      6
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
      5,
      7
    ],
    [
      6,
      7
    ],
    [
      5,
      8
    ],
    [
      6,
      8
    ],
    [
      5,
      9
    ],
    [
      6,
      9
    ],
    [
      5,
      10
    ],
    [
      6,
      10
    ],
    [
      7,
      10
    ],
    [
      5,
      11
    ],
    [
      6,
      11
    ],
    [
      7,
      11
    ]
  ],
  "spawn": [
    3,
    8
  ],
  "exit": [
    18,
    14
  ],
  "key": [
    7,
    8
  ],
  "burrows": 0,
  "pebbles": 1,
  "tongues": 3,
  "loot": [
    [
      3,
      14,
      1
    ],
    [
      8,
      2,
      1
    ],
    [
      18,
      2,
      1
    ],
    [
      8,
      6,
      1
    ],
    [
      11,
      9,
      3
    ],
    [
      17,
      6,
      1
    ],
    [
      10,
      14,
      1
    ],
    [
      8,
      10,
      1
    ]
  ],
  "guards": [
    {
      "spawn": [
        12,
        6
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          8,
          6
        ],
        [
          12,
          6
        ],
        [
          12,
          10
        ],
        [
          8,
          10
        ]
      ]
    },
    {
      "kind": "beetle",
      "spawn": [
        18,
        12
      ],
      "facing": -1.5707963267948966,
      "patrol": [
        [
          16,
          10
        ],
        [
          18,
          10
        ],
        [
          18,
          14
        ],
        [
          16,
          14
        ]
      ]
    }
  ],
  "water": [
    [
      5,
      12
    ],
    [
      6,
      12
    ],
    [
      7,
      12
    ]
  ],
  "revision": 2
},
    {
  "id": "split-shelves",
  "name": "Split Shelves",
  "brief": "Staggered shelves climb past a central switch. One tongue grab can spare a guarded detour.",
  "hint": "Open blue from the central shelf. Save your single tongue grab for a risky shelf; burrows are shortcuts.",
  "width": 27,
  "height": 21,
  "explore": true,
  "rooms": [
    [
      1,
      13,
      5,
      18
    ],
    [
      1,
      1,
      7,
      9
    ],
    [
      4,
      8,
      12,
      10
    ],
    [
      10,
      2,
      14,
      8
    ],
    [
      16,
      2,
      23,
      5
    ],
    [
      14,
      3,
      16,
      3
    ],
    [
      17,
      8,
      23,
      11
    ],
    [
      17,
      12,
      23,
      18
    ],
    [
      5,
      15,
      17,
      17
    ],
    [
      10,
      8,
      14,
      11
    ],
    [
      14,
      9,
      17,
      9
    ],
    [
      20,
      5,
      20,
      8
    ],
    [
      20,
      11,
      20,
      14
    ],
    [
      3,
      9,
      3,
      13
    ],
    [
      5,
      5,
      10,
      5
    ],
    [
      7,
      6,
      10,
      6
    ],
    [
      16,
      11,
      17,
      11
    ],
    [
      9,
      3,
      10,
      3
    ]
  ],
  "cracks": [
    [
      9,
      6
    ],
    [
      15,
      11
    ],
    [
      8,
      3
    ]
  ],
  "cover": [
    [
      4,
      7
    ],
    [
      11,
      9
    ],
    [
      20,
      7
    ],
    [
      8,
      16
    ]
  ],
  "gravel": [
    [
      20,
      10
    ]
  ],
  "gaps": [
    [
      12,
      3
    ],
    [
      12,
      14
    ]
  ],
  "spawn": [
    3,
    15
  ],
  "exit": [
    3,
    15
  ],
  "key": [
    21,
    3
  ],
  "burrows": 2,
  "pebbles": 0,
  "tongues": 1,
  "gates": [
    {
      "id": "blue",
      "name": "Blue",
      "color": [
        106,
        195,
        236
      ],
      "switch": [
        12,
        9
      ],
      "tiles": [
        [
          15,
          3
        ],
        [
          20,
          6
        ]
      ]
    }
  ],
  "loot": [
    [
      2,
      2,
      1
    ],
    [
      7,
      5,
      1
    ],
    [
      17,
      2,
      1
    ],
    [
      22,
      3,
      3
    ],
    [
      11,
      10,
      1
    ],
    [
      7,
      16,
      1
    ],
    [
      17,
      16,
      1
    ],
    [
      22,
      13,
      1
    ]
  ],
  "guards": [
    {
      "spawn": [
        6,
        2
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          2,
          2
        ],
        [
          6,
          2
        ],
        [
          6,
          5
        ],
        [
          2,
          5
        ]
      ]
    },
    {
      "kind": "beetle",
      "spawn": [
        22,
        5
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          18,
          2
        ],
        [
          22,
          2
        ],
        [
          22,
          5
        ],
        [
          18,
          5
        ]
      ]
    }
  ],
  "revision": 2
},
    {id:'stillwater-vault',name:'Stillwater Vault',brief:'Only two tongue grabs. Quiet feet and leaf cover are your other tools.',hint:'Reach from the north bank, or take the longer walking route from below.',width:25,height:19,explore:true,
      rooms:[[1,1,23,4],[1,14,23,17],[1,4,5,14],[19,4,23,14],[8,7,16,11],[5,9,8,9],[16,9,19,9],[12,4,12,7],[12,11,12,14]],
      cracks:[],cover:[[4,7],[12,5],[12,13],[8,16],[18,3]],gravel:[[19,10]],gaps:[[7,9],[17,9],[12,6]],spawn:[3,15],exit:[3,2],key:[12,8],burrows:0,pebbles:0,tongues:2,
      loot:[[2,2,1],[8,3,1],[21,3,1],[9,8,1],[9,10,3],[15,10,1],[8,15,1],[21,16,1]],
      guards:[{spawn:[20,2],facing:Math.PI,patrol:[[9,2],[20,2],[20,3],[9,3]]},{kind:'beetle',spawn:[15,10],facing:Math.PI,patrol:[[9,8],[15,8],[15,10],[9,10]]},{spawn:[20,15],facing:Math.PI,patrol:[[10,15],[20,15],[20,16],[10,16]]}]},
    {
  "id": "forked-fort",
  "name": "Forked Fort",
  "brief": "Uneven terraces branch around a central hub. Two switches open the far fork.",
  "hint": "Blue opens the upper fork. Amber opens the lower return. Burrowing is an optional shortcut.",
  "width": 25,
  "height": 21,
  "explore": true,
  "rooms": [
    [
      1,
      12,
      7,
      18
    ],
    [
      2,
      1,
      7,
      5
    ],
    [
      10,
      1,
      14,
      4
    ],
    [
      17,
      1,
      23,
      6
    ],
    [
      16,
      12,
      23,
      18
    ],
    [
      9,
      7,
      15,
      11
    ],
    [
      4,
      5,
      6,
      12
    ],
    [
      6,
      3,
      11,
      3
    ],
    [
      14,
      9,
      20,
      9
    ],
    [
      20,
      6,
      20,
      12
    ],
    [
      7,
      15,
      18,
      15
    ],
    [
      10,
      4,
      10,
      7
    ],
    [
      7,
      6,
      10,
      6
    ],
    [
      11,
      11,
      13,
      15
    ]
  ],
  "cracks": [
    [
      9,
      6
    ]
  ],
  "cover": [
    [
      4,
      7
    ],
    [
      11,
      9
    ],
    [
      21,
      6
    ],
    [
      17,
      13
    ],
    [
      7,
      15
    ]
  ],
  "gravel": [
    [
      20,
      10
    ]
  ],
  "gaps": [
    [
      11,
      3
    ],
    [
      13,
      3
    ]
  ],
  "spawn": [
    3,
    15
  ],
  "exit": [
    21,
    15
  ],
  "key": [
    21,
    3
  ],
  "burrows": 1,
  "pebbles": 2,
  "tongues": 0,
  "gates": [
    {
      "id": "blue",
      "name": "Blue",
      "color": [
        106,
        195,
        236
      ],
      "switch": [
        3,
        3
      ],
      "tiles": [
        [
          18,
          9
        ],
        [
          20,
          7
        ]
      ]
    },
    {
      "id": "amber",
      "name": "Amber",
      "color": [
        239,
        181,
        83
      ],
      "switch": [
        12,
        9
      ],
      "tiles": [
        [
          16,
          15
        ],
        [
          20,
          11
        ]
      ]
    }
  ],
  "loot": [
    [
      2,
      2,
      1
    ],
    [
      7,
      5,
      1
    ],
    [
      17,
      2,
      1
    ],
    [
      22,
      3,
      3
    ],
    [
      11,
      10,
      1
    ],
    [
      7,
      16,
      1
    ],
    [
      17,
      16,
      1
    ],
    [
      22,
      13,
      1
    ]
  ],
  "guards": [
    {
      "spawn": [
        6,
        2
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          2,
          2
        ],
        [
          6,
          2
        ],
        [
          6,
          5
        ],
        [
          2,
          5
        ]
      ]
    },
    {
      "kind": "beetle",
      "spawn": [
        22,
        5
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          18,
          2
        ],
        [
          22,
          2
        ],
        [
          22,
          5
        ],
        [
          18,
          5
        ]
      ]
    },
    {
      "spawn": [
        22,
        16
      ],
      "facing": 3.141592653589793,
      "patrol": [
        [
          17,
          13
        ],
        [
          22,
          13
        ],
        [
          22,
          16
        ],
        [
          17,
          16
        ]
      ]
    }
  ],
  "revision": 2
},
    {id:'backlash-hall',name:'Backlash Hall',brief:'The ruins start pushing back. Bringing a key home may need a different route.',hint:'Open blue to reach the key. Listen when the old mechanisms stir.',width:25,height:19,explore:true,
      rooms:[[1,1,8,6],[16,1,23,6],[1,12,8,17],[16,12,23,17],[8,3,16,3],[8,14,16,14],[4,6,4,12],[20,6,20,12]],
      cracks:[],cover:[[4,7],[8,3],[18,3],[20,6],[20,12],[8,15]],gravel:[[20,9]],spawn:[3,15],exit:[3,15],key:[21,3],burrows:0,pebbles:3,tongues:2,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[12,3]]},{id:'return',name:'South passage',color:[150,220,166],tiles:[[12,14]]}],
      reactions:[{id:'key-reversal',when:'key',close:['blue'],open:['return'],message:'Stone grinds behind you. Blue is sealing; the south passage has opened.',objective:'The entrance is sealed. Return through the south passage.'}],
      loot:[[2,2,1],[7,5,1],[17,2,1],[22,4,3],[3,16,1],[7,16,1],[17,16,1],[22,13,1]],
      guards:[{spawn:[6,2],facing:Math.PI,patrol:[[2,2],[6,2],[6,5],[2,5]]},{spawn:[22,5],facing:Math.PI,patrol:[[17,2],[22,2],[22,5],[17,5]]},{kind:'beetle',spawn:[22,16],facing:Math.PI,patrol:[[17,13],[22,13],[22,16],[17,16]]}]},
    {id:'false-refuge',name:'False Refuge',brief:'A quiet chamber, a closing entrance. Look for another way through.',hint:'Blue opens the middle chamber. Leave room to dodge its beetle.',width:25,height:19,explore:true,
      rooms:[[1,1,7,6],[1,12,7,17],[18,1,23,6],[18,12,23,17],[4,6,4,12],[20,6,20,12],[10,7,14,11],[4,9,10,9],[14,9,20,9],[4,3,20,3],[4,14,20,14],[7,11,8,11],[7,11,7,12]],
      cracks:[[9,11]],cover:[[4,7],[11,9],[14,8],[20,6],[7,14]],gravel:[[20,10]],gaps:[],spawn:[3,15],exit:[3,3],key:[21,3],burrows:1,pebbles:2,tongues:2,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,13],tiles:[[8,9]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[12,9],tiles:[[16,9]]},{id:'return',name:'North passage',color:[150,220,166],tiles:[[12,3]]},{id:'south',name:'South passage',color:[150,220,166],tiles:[[12,14]]}],
      reactions:[{id:'chamber-seal',when:'enter',region:[11,7,14,11],requiresOpen:['blue'],close:['blue'],open:['south'],message:'The entrance is sealing. Amber leads onward; a south passage has opened.',objective:'Blue is sealed. Find the amber switch in this chamber.',untilGate:'amber'},{id:'key-return',when:'key',open:['return'],message:'The key releases the north passage. Blue stays sealed.',objective:'The north passage is open. Reach the hatch in the west.'}],
      loot:[[2,2,1],[6,5,1],[11,8,1],[13,10,3],[19,2,1],[22,5,1],[6,16,1],[22,16,1]],
      guards:[{kind:'beetle',spawn:[13,10],facing:-Math.PI/2,patrol:[[11,8],[13,8],[13,10],[11,10]]},{spawn:[22,5],facing:Math.PI,patrol:[[19,2],[22,2],[22,5],[19,5]]},{spawn:[6,2],facing:Math.PI,patrol:[[2,2],[6,2],[6,5],[2,5]]}]},
    {id:'greedy-gallery',name:'Greedy Gallery',brief:'A tempting chest and a maze with its own plans. Is the detour worth it?',hint:'Blue leads into the gallery. A chest can change more than your treasure count.',width:29,height:21,explore:true,
      rooms:[[1,1,8,7],[1,13,8,19],[20,1,27,3],[20,6,27,7],[20,3,22,6],[25,3,27,6],[20,13,27,19],[4,7,4,13],[24,7,24,13],[8,4,20,4],[8,16,20,16],[11,8,17,12],[4,10,11,10],[17,10,24,10]],
      cracks:[],cover:[[4,8],[11,10],[17,10],[20,7],[21,3],[24,7],[24,13],[8,16]],gravel:[[24,11],[22,16]],spawn:[3,16],exit:[3,16],key:[24,3],burrows:0,pebbles:3,tongues:1,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[14,4],[8,10]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[14,10],tiles:[[20,10]]},{id:'return',name:'South passage',color:[150,220,166],tiles:[[14,16]]}],
      reactions:[{id:'chest-trap',when:'treasure',at:[15,10],close:['blue'],open:['amber'],message:'The chest clicks. Blue is sealing; an amber way east has opened.',objective:'The gallery entrance is sealed. Take the amber passage east.'},{id:'key-reversal',when:'key',close:['blue'],open:['return'],message:'The key seals blue and releases the south passage. Find the new way home.',objective:'Return through the south passage. Blue will not reopen.'}],
      loot:[[2,2,1],[7,6,1],[12,9,1],[15,10,3],[22,2,1],[26,6,1],[7,18,1],[26,18,1]],
      guards:[{spawn:[6,2],facing:Math.PI,patrol:[[2,2],[6,2],[6,6],[2,6]]},{kind:'beetle',spawn:[16,11],facing:Math.PI,patrol:[[12,9],[16,9],[16,11],[12,11]]},{spawn:[26,6],facing:Math.PI,patrol:[[22,2],[26,2],[26,6],[22,6]]},{kind:'beetle',spawn:[26,18],facing:Math.PI,patrol:[[22,14],[26,14],[26,18],[22,18]]}]},
    {id:'turning-citadel',name:'Turning Citadel',brief:'Two reversals. Four patrols. The way in will not be the way out.',hint:'Open blue and take the key. Look for lit passages when the citadel changes.',width:29,height:23,explore:true,
      rooms:[[1,1,9,7],[19,1,27,7],[1,15,9,21],[19,15,27,21],[9,4,19,4],[9,18,19,18],[5,7,5,15],[23,7,23,15],[12,9,16,13],[5,11,12,11],[16,11,23,11],[11,16,13,16],[13,16,13,18]],
      cracks:[[10,16]],cover:[[5,8],[9,4],[21,3],[23,7],[24,6],[16,11],[12,11],[9,16],[23,15]],gravel:[[23,10],[22,18]],spawn:[3,18],exit:[24,19],key:[24,3],burrows:1,pebbles:3,tongues:1,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[14,4]]},{id:'descent',name:'Inner passage',color:[201,161,230],tiles:[[23,8],[19,11]]},{id:'escape',name:'West passage',color:[150,220,166],tiles:[[8,11]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[14,12],tiles:[[14,18],[23,14]]}],
      reactions:[{id:'key-descent',when:'key',close:['blue'],open:['descent'],message:'Blue is sealing. The inner passage has opened below the key room.',objective:'Follow the inner passage into the central chamber.'},{id:'inner-reversal',when:'enter',region:[12,9,16,13],requiresKey:true,close:['descent'],open:['escape'],message:'The inner passage is sealing. West is open; amber unlocks the final crossing.',objective:'Leave west. Amber opens the southern crossing.'}],
      loot:[[2,2,1],[8,6,1],[20,2,1],[26,6,3],[13,10,1],[7,20,1],[20,20,1],[26,18,1]],
      guards:[{spawn:[7,2],facing:Math.PI,patrol:[[2,2],[7,2],[7,6],[2,6]]},{kind:'beetle',spawn:[26,6],facing:Math.PI,patrol:[[20,2],[26,2],[26,6],[20,6]]},{spawn:[15,10],facing:Math.PI,patrol:[[13,10],[15,10],[15,12],[13,12]]},{kind:'beetle',spawn:[26,20],facing:Math.PI,patrol:[[20,16],[26,16],[26,20],[20,20]]}]},
    {id:'razor-crossing',name:'Razor Crossing',brief:'One pebble. Two snakes share the key room. Make the opening count.',hint:'The stone divider breaks sight. Save your pebble for the two key-room patrols.',width:29,height:23,explore:true,
      rooms:[[1,1,9,7],[19,1,27,3],[19,6,27,7],[19,3,21,6],[25,3,27,6],[1,15,9,21],[19,15,27,21],[9,4,19,4],[9,18,19,18],[5,7,5,15],[23,7,23,15],[12,9,16,13],[5,11,12,11],[16,11,23,11],[11,16,13,16],[13,16,13,18]],
      cracks:[[10,16]],cover:[[5,8],[9,4],[21,3],[16,11],[14,11],[9,16],[23,15]],gravel:[[23,10],[22,18]],spawn:[3,18],exit:[24,19],key:[24,3],burrows:1,pebbles:1,tongues:0,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[14,4]]},{id:'descent',name:'Inner passage',color:[201,161,230],tiles:[[23,8]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[14,11],tiles:[[14,18],[23,14]]}],
      reactions:[{id:'key-reversal',when:'key',close:['blue'],open:['descent'],message:'Blue is sealing. Take the inner passage and find amber.',objective:'Find amber in the centre, then cross the southern bridge.'}],
      loot:[[2,2,1],[8,6,1],[20,2,1],[26,6,3],[13,10,1],[7,20,1],[20,20,1],[26,18,1]],
      guards:[{spawn:[7,2],facing:Math.PI,patrol:[[2,2],[7,2],[7,6],[2,6]]},{spawn:[26,6],facing:Math.PI,patrol:[[20,2],[26,2],[26,6],[20,6]]},{spawn:[23,2],facing:0,patrol:[[25,2],[25,6],[21,6],[21,2]]},{kind:'beetle',spawn:[15,10],facing:Math.PI,patrol:[[13,10],[15,10],[15,12],[13,12]]}]},
    {id:'needle-vault',name:'Needle Vault',brief:'One tongue grab, no decoys. A guarded vault below the stream.',hint:'Reach the north bank. Spend your only grab on the key, or brave the vault.',width:33,height:25,explore:true,sightRadius:5.5,
      rooms:[[1,1,10,7],[22,1,31,7],[1,17,10,23],[22,17,31,23],[10,4,22,4],[10,20,22,20],[5,7,5,17],[27,7,27,17],[13,10,19,14],[5,12,13,12],[19,12,27,12],[16,4,16,10],[16,14,16,20]],
      cracks:[],cover:[[5,8],[10,4],[16,8],[13,12],[19,12],[27,17]],gravel:[[27,10]],gaps:[[16,9]],spawn:[3,21],exit:[29,21],key:[16,11],burrows:0,pebbles:0,tongues:1,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[10,12],[22,12]]},{id:'south',name:'Vault descent',color:[150,220,166],tiles:[[16,16]]}],
      reactions:[{id:'vault-seal',when:'key',close:['blue'],open:['south'],message:'The vault doors are sealing. A passage has opened beneath the chamber.',objective:'The vault descent is open. Reach the eastern hatch.'}],
      loot:[[2,2,1],[9,6,1],[24,2,1],[30,6,1],[14,11,1],[18,13,3],[8,22,1],[30,22,1]],
      guards:[{spawn:[8,2],facing:Math.PI,patrol:[[2,2],[8,2],[8,6],[2,6]]},{kind:'beetle',spawn:[29,6],facing:Math.PI,patrol:[[24,2],[29,2],[29,6],[24,6]]},{spawn:[18,13],facing:Math.PI,patrol:[[14,11],[18,11],[18,13],[14,13]]},{kind:'beetle',spawn:[14,13],facing:0,patrol:[[14,11],[18,11],[18,13],[14,13]]}]},
    {id:'toll-of-ash',name:'Toll of Ash',brief:'The hatch demands four treasure. Five enemies make every detour a decision.',hint:'The hatch needs the key and four treasure. A chest is worth three.',width:33,height:25,explore:true,requiredTreasure:4,
      rooms:[[1,1,9,7],[13,1,19,7],[23,1,31,7],[1,17,9,23],[13,17,19,23],[23,17,31,23],[9,4,13,4],[19,4,23,4],[5,7,5,17],[16,7,16,17],[27,7,27,17],[5,12,27,12],[9,20,13,20],[19,20,23,20]],
      cracks:[],cover:[[5,8],[9,4],[18,3],[19,4],[27,7],[27,17]],gravel:[[16,10],[27,10],[25,20]],spawn:[3,21],exit:[29,21],key:[29,3],burrows:0,pebbles:2,tongues:1,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[11,4],[16,8],[11,12]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[16,3],tiles:[[21,4],[27,8],[21,12],[21,20]]}],
      loot:[[2,2,1],[8,6,1],[14,2,1],[18,6,3],[26,2,1],[30,6,1],[8,21,1],[26,21,1]],
      guards:[{spawn:[7,2],facing:Math.PI,patrol:[[2,2],[7,2],[7,6],[2,6]]},{kind:'beetle',spawn:[18,6],facing:Math.PI,patrol:[[14,2],[18,2],[18,6],[14,6]]},{spawn:[30,6],facing:Math.PI,patrol:[[25,2],[30,2],[30,6],[25,6]]},{kind:'beetle',spawn:[25,2],facing:0,patrol:[[25,2],[30,2],[30,6],[25,6]]},{spawn:[29,22],facing:Math.PI,patrol:[[24,19],[30,19],[30,22],[24,22]]}]},
    {id:'threefold-keep',name:'Threefold Keep',brief:'Three reversals. Five enemies. The last door answers to a chest.',hint:'The key opens the descent. Watch for new paths after each reversal.',width:33,height:25,explore:true,sightRadius:5,
      rooms:[[1,1,10,7],[22,1,31,3],[22,6,31,7],[22,3,24,6],[28,3,31,6],[1,17,10,23],[22,17,31,23],[10,4,22,4],[10,20,22,20],[5,7,5,17],[27,7,27,17],[13,10,19,14],[5,12,13,12],[19,12,27,12],[16,14,16,20]],
      cracks:[],cover:[[5,8],[10,4],[24,3],[19,12],[17,14],[27,17]],gravel:[[27,10],[25,20]],spawn:[3,21],exit:[28,21],key:[28,3],burrows:0,pebbles:2,tongues:1,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[16,4]]},{id:'descent',name:'Inner passage',color:[201,161,230],tiles:[[27,8],[22,12]]},{id:'west',name:'West passage',color:[150,220,166],tiles:[[10,12]]},{id:'escape',name:'Vault descent',color:[150,220,166],tiles:[[16,16]]},{id:'final',name:'Final crossing',color:[239,181,83],tiles:[[16,20],[27,16]]}],
      reactions:[{id:'key-descent',when:'key',close:['blue'],open:['descent'],message:'Blue is sealing. The inner passage has opened.',objective:'Follow the inner passage into the central vault.'},{id:'inner-seal',when:'enter',region:[18,10,19,14],requiresKey:true,close:['descent'],open:['west'],message:'The inner passage is sealing. West is open, but the chest holds the final mechanism.',objective:'Find the chest in this vault. It releases the final crossing.'},{id:'chest-release',when:'treasure',at:[14,12],close:['west'],open:['escape','final'],message:'The chest seals west. The vault descent and final crossing are open.',objective:'Descend from the vault, then cross east to the hatch.'}],
      loot:[[2,2,1],[9,6,1],[24,2,1],[30,6,1],[14,12,3],[18,13,1],[8,22,1],[30,22,1]],
      guards:[{spawn:[8,2],facing:Math.PI,patrol:[[2,2],[8,2],[8,6],[2,6]]},{spawn:[30,6],facing:Math.PI,patrol:[[23,2],[30,2],[30,6],[23,6]]},{kind:'beetle',spawn:[18,13],facing:Math.PI,patrol:[[15,11],[18,11],[18,13],[15,13]]},{spawn:[14,11],facing:0,patrol:[[14,11],[17,11],[17,13],[14,13]]},{kind:'beetle',spawn:[30,22],facing:Math.PI,patrol:[[24,18],[30,18],[30,22],[24,22]]}]},
    {id:'last-light',name:'Last Light',brief:'Fifty seconds. Five patrols. The key changes the return route.',hint:'Find a switch route to the key. Save your grab and keep the clock in mind.',width:33,height:25,explore:true,sightRadius:5,timeLimit:50,
      rooms:[[1,1,10,6],[22,1,31,6],[1,10,10,15],[22,10,31,15],[1,19,10,23],[22,19,31,23],[10,3,22,3],[10,12,22,12],[10,21,22,21],[5,6,5,10],[27,6,27,10],[5,15,5,19],[27,15,27,19],[13,8,19,16]],
      cracks:[],cover:[[5,9],[10,3],[13,12],[19,12],[28,6],[27,19]],gravel:[[5,16],[27,8]],spawn:[3,21],exit:[29,21],key:[28,3],burrows:0,pebbles:1,tongues:1,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[16,3]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[16,12],tiles:[[20,12],[27,17]]},{id:'return',name:'South passage',color:[150,220,166],tiles:[[16,21]]}],
      reactions:[{id:'key-reversal',when:'key',close:['blue'],open:['return','amber'],message:'Blue is sealing. Amber and south are open; the clock is still running.',objective:'Return south and reach the eastern hatch before the light fades.'}],
      loot:[[2,2,1],[9,5,1],[24,2,1],[30,5,1],[14,9,1],[18,15,3],[8,22,1],[30,22,1]],
      guards:[{spawn:[8,2],facing:Math.PI,patrol:[[2,2],[8,2],[8,5],[2,5]]},{kind:'beetle',spawn:[29,5],facing:Math.PI,patrol:[[24,2],[29,2],[29,5],[24,5]]},{spawn:[18,15],facing:Math.PI,patrol:[[14,9],[18,9],[18,15],[14,15]]},{kind:'beetle',spawn:[29,14],facing:Math.PI,patrol:[[24,11],[29,11],[29,14],[24,14]]},{spawn:[8,14],facing:Math.PI,patrol:[[2,11],[8,11],[8,14],[2,14]]}]},
    {id:'crown-of-thorns',name:'Crown of Thorns',brief:'Six enemies, three reversals, and a hatch that demands six treasure.',hint:'Amber releases the descent. The central chest is worth the risk.',width:35,height:27,explore:true,sightRadius:5,requiredTreasure:6,
      rooms:[[1,1,10,7],[14,1,20,7],[24,1,33,3],[24,6,33,7],[24,3,27,6],[30,3,33,6],[1,19,10,25],[14,19,20,25],[24,19,33,25],[6,7,6,19],[17,7,17,19],[29,7,29,19],[10,4,14,4],[20,4,24,4],[10,22,14,22],[20,22,24,22],[6,13,29,13],[14,10,20,16],[22,24,24,24]],
      cracks:[[21,24]],cover:[[6,8],[10,4],[18,3],[17,7],[27,3],[20,13],[14,15],[29,19],[20,24]],gravel:[[29,10],[17,18],[27,22]],spawn:[3,22],exit:[31,23],key:[30,3],burrows:1,pebbles:2,tongues:0,
      gates:[{id:'blue',name:'Blue',color:[106,195,236],switch:[3,3],tiles:[[12,4]]},{id:'amber',name:'Amber',color:[239,181,83],switch:[17,3],tiles:[[22,4],[29,8],[22,13]]},{id:'drop',name:'Inner descent',color:[201,161,230],tiles:[[17,8]]},{id:'west',name:'West passage',color:[150,220,166],tiles:[[12,13]]},{id:'southwest',name:'West bridge',color:[150,220,166],tiles:[[12,22]]},{id:'southeast',name:'East bridge',color:[150,220,166],tiles:[[22,22]]},{id:'right-return',name:'Eastern stair',color:[150,220,166],tiles:[[29,17]]}],
      reactions:[{id:'amber-reversal',when:'enter',region:[16,3,18,3],requiresOpen:['amber'],close:['blue'],open:['drop','right-return'],message:'Blue is sealing. Amber releases the descent and eastern stair.',objective:'Take the descent or amber route. The hatch needs six treasure.'},{id:'key-return',when:'key',open:['southeast'],message:'The key releases the east bridge. Treasure is still the price of escape.',objective:'The east bridge is open. Bring six treasure to the eastern hatch.'},{id:'chest-reversal',when:'treasure',at:[17,12],close:['drop'],open:['west','southwest'],message:'The chest seals the descent and opens the western passages.',objective:'Use the western passages and east bridge. The hatch needs six treasure.'}],
      loot:[[2,2,1],[18,6,1],[26,7,1],[32,6,1],[17,12,3],[8,24,1],[18,24,1],[31,24,1]],
      guards:[{spawn:[8,2],facing:Math.PI,patrol:[[2,2],[8,2],[8,6],[2,6]]},{kind:'beetle',spawn:[19,6],facing:Math.PI,patrol:[[15,2],[19,2],[19,6],[15,6]]},{spawn:[32,6],facing:Math.PI,patrol:[[25,2],[32,2],[32,6],[25,6]]},{kind:'beetle',spawn:[26,6],facing:0,patrol:[[26,2],[31,2],[31,6],[26,6]]},{spawn:[19,14],facing:Math.PI,patrol:[[15,11],[19,11],[19,14],[15,14]]},{kind:'beetle',spawn:[32,24],facing:Math.PI,patrol:[[25,20],[32,20],[32,24],[25,24]]}]},
    {
      id:"sting-stair",
      name:"Sting Stair",
      brief:"Seven guards on a winding ascent. Raised tails mark the ground they will strike.",
      hint:"Move away from the amber circle. A scorpion cannot change its aim once its tail rises.",
      width:35,
      height:33,
      explore:true,
      sightRadius:5,
      burrows:0,
      pebbles:2,
      tongues:1,
      rooms:[[1,2,31,5],[28,5,31,11],[3,9,31,12],[3,12,6,18],[3,16,29,19],[26,19,29,25],[1,23,29,26],[1,26,4,30],[1,28,32,31]],
      cover:[[8,4],[29,8],[6,11],[4,15],[24,18],[27,22],[4,25],[8,30]],
      cracks:[],
      gravel:[[15,10],[18,24]],
      spawn:[3,4],
      key:[3,29],
      exit:[30,30],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[20,4],"tiles":[[28,7],[29,7],[30,7],[31,7]]},{"id":"amber","name":"Amber","color":[239,181,83],"switch":[15,18],"tiles":[[26,21],[27,21],[28,21],[29,21]]}],
      loot:[[10,3,1],[30,10,1],[7,10,1],[12,17,1],[27,24,1],[4,24,1],[15,29,3],[31,29,1]],
      guards:[{"spawn":[14,3],"facing":3.141592653589793,"patrol":[[12,3],[17,3],[17,4],[12,4]],"kind":"scorpion"},{"spawn":[30,10],"facing":3.141592653589793,"patrol":[[28,10],[30,10],[30,11],[28,11]]},{"spawn":[13,10],"facing":3.141592653589793,"patrol":[[10,10],[16,10],[16,11],[10,11]],"kind":"scorpion"},{"spawn":[24,17],"facing":3.141592653589793,"patrol":[[21,17],[27,17],[27,18],[21,18]],"kind":"beetle"},{"spawn":[20,24],"facing":3.141592653589793,"patrol":[[17,24],[23,24],[23,25],[17,25]]},{"spawn":[9,29],"facing":3.141592653589793,"patrol":[[7,29],[12,29],[12,30],[7,30]],"kind":"scorpion"},{"spawn":[25,29],"facing":3.141592653589793,"patrol":[[22,29],[28,29],[28,30],[22,30]],"kind":"scorpion"}]
    },
    {
      id:"broken-delta",
      name:"Broken Delta",
      brief:"Split waterways, seven hunters and one remote key. The northern bridges seal behind you.",
      hint:"The key opens the southern river crossing. Keep one tongue grab for the bank.",
      width:37,
      height:29,
      explore:true,
      sightRadius:4.8,
      burrows:1,
      pebbles:2,
      tongues:1,
      requiredTreasure:5,
      rooms:[[1,11,9,17],[6,3,9,11],[6,3,19,6],[16,6,19,13],[16,11,28,14],[25,3,28,11],[25,3,35,6],[32,6,35,22],[23,19,35,22],[20,19,23,25],[8,23,23,26],[8,17,11,23],[8,17,17,20],[14,14,17,20]],
      gaps:[[29,4],[29,5],[29,6]],
      cover:[[3,14],[8,10],[14,4],[18,10],[26,8],[32,8],[27,20],[21,24],[10,21],[15,17]],
      cracks:[[12,19]],
      gravel:[[20,12],[30,20]],
      spawn:[3,14],
      key:[31,4],
      exit:[10,25],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[7,4],"tiles":[[16,8],[17,8],[18,8],[19,8]]},{"id":"north","name":"Amber","color":[239,181,83],"tiles":[[25,8],[26,8],[27,8],[28,8]],"initialOpen":true},{"id":"south","name":"Amber","color":[239,181,83],"tiles":[[8,20],[9,20],[10,20],[11,20]]}],
      reactions:[{"id":"delta-key","when":"key","close":["blue","north"],"open":["south"],"message":"The north bridges seal. The southern bank opens.","objective":"Follow the eastern bank south. Bring five treasure to the lower hatch."}],
      loot:[[7,14,1],[11,4,1],[18,12,1],[26,4,1],[34,20,1],[22,24,3],[9,24,1],[15,18,1]],
      guards:[{"spawn":[8,15],"facing":3.141592653589793,"patrol":[[6,12],[8,12],[8,16],[6,16]]},{"spawn":[16,4],"facing":3.141592653589793,"patrol":[[12,4],[17,4],[17,5],[12,5]],"kind":"scorpion"},{"spawn":[22,12],"facing":3.141592653589793,"patrol":[[20,12],[26,12],[26,13],[20,13]],"kind":"scorpion"},{"spawn":[26,5],"facing":3.141592653589793,"patrol":[[26,4],[27,4],[27,6],[26,6]]},{"spawn":[34,12],"facing":3.141592653589793,"patrol":[[33,9],[34,9],[34,15],[33,15]],"kind":"beetle"},{"spawn":[29,20],"facing":3.141592653589793,"patrol":[[26,20],[32,20],[32,21],[26,21]],"kind":"scorpion"},{"spawn":[17,24],"facing":3.141592653589793,"patrol":[[13,24],[19,24],[19,25],[13,25]]}]
    },
    {
      id:"coiled-catacomb",
      name:"Coiled Catacomb",
      brief:"An inward spiral with eight guards. The vault opens a different way back out.",
      hint:"The chest opens the spine passage. Leaves break sight, but a committed sting still lands.",
      width:35,
      height:31,
      explore:true,
      sightRadius:4.8,
      burrows:1,
      pebbles:2,
      tongues:0,
      requiredTreasure:6,
      rooms:[[1,2,32,5],[29,5,32,27],[4,24,29,27],[4,9,7,24],[7,9,24,12],[21,12,24,21],[10,18,21,21],[10,14,13,18],[13,14,18,16],[16,16,18,20],[16,21,18,27],[14,27,20,29]],
      cover:[[9,4],[30,8],[30,20],[9,25],[5,15],[18,10],[22,16],[14,19],[17,16],[17,23]],
      cracks:[[14,16]],
      gravel:[[30,17],[5,19],[22,14]],
      spawn:[3,4],
      key:[16,15],
      exit:[17,28],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[17,4],"tiles":[[29,7],[30,7],[31,7],[32,7]]},{"id":"amber","name":"Amber","color":[239,181,83],"switch":[6,14],"tiles":[[21,14],[22,14],[23,14],[24,14]]},{"id":"spine","name":"Amber","color":[239,181,83],"tiles":[[16,22],[17,22],[18,22]]}],
      reactions:[{"id":"spiral-chest","when":"treasure","at":[17,19],"close":["amber"],"open":["spine"],"message":"The vault seals the inner coil and opens the spine.","objective":"Take the new spine passage to the lower hatch. Bring six treasure."}],
      loot:[[12,3,1],[31,12,1],[26,25,1],[6,20,1],[15,10,1],[22,18,1],[17,19,3],[16,15,1]],
      guards:[{"spawn":[13,3],"facing":3.141592653589793,"patrol":[[10,3],[15,3],[15,4],[10,4]],"kind":"scorpion"},{"spawn":[30,12],"facing":3.141592653589793,"patrol":[[30,10],[31,10],[31,16],[30,16]],"kind":"beetle"},{"spawn":[30,22],"facing":3.141592653589793,"patrol":[[30,19],[31,19],[31,24],[30,24]]},{"spawn":[18,25],"facing":3.141592653589793,"patrol":[[15,25],[21,25],[21,26],[15,26]],"kind":"scorpion"},{"spawn":[5,17],"facing":3.141592653589793,"patrol":[[5,14],[6,14],[6,19],[5,19]],"kind":"scorpion"},{"spawn":[15,10],"facing":3.141592653589793,"patrol":[[10,10],[18,10],[18,11],[10,11]]},{"spawn":[22,17],"facing":3.141592653589793,"patrol":[[22,15],[23,15],[23,20],[22,20]],"kind":"scorpion"},{"spawn":[16,19],"facing":3.141592653589793,"patrol":[[14,19],[19,19],[19,20],[14,20]],"kind":"scorpion"}]
    },
    {
      id:"split-jaw",
      name:"Split Jaw",
      brief:"Eight enemies guard an uneven network of vaults. Two treasures change the map.",
      hint:"The western chest opens the high road. The eastern chest opens the final hatch passage.",
      width:39,
      height:31,
      explore:true,
      sightRadius:4.5,
      burrows:1,
      pebbles:2,
      tongues:1,
      requiredTreasure:7,
      rooms:[[1,20,9,28],[3,13,6,20],[3,13,17,16],[14,4,17,13],[5,4,17,7],[17,4,32,7],[29,7,32,16],[23,13,32,16],[23,16,26,25],[14,22,26,25],[11,16,14,25],[32,10,37,13],[34,13,37,27],[26,25,34,28]],
      cover:[[3,26],[5,19],[10,14],[15,9],[9,5],[22,5],[30,10],[26,14],[24,19],[15,23],[12,19],[35,17],[31,27]],
      cracks:[[10,23]],
      gravel:[[16,11],[24,18],[35,22]],
      spawn:[3,26],
      key:[35,11],
      exit:[30,27],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[6,14],"tiles":[[14,8],[15,8],[16,8],[17,8]]},{"id":"high","name":"Amber","color":[239,181,83],"tiles":[[20,4],[20,5],[20,6],[20,7]]},{"id":"east","name":"Amber","color":[239,181,83],"tiles":[[34,15],[35,15],[36,15],[37,15]]},{"id":"return","name":"Amber","color":[239,181,83],"tiles":[[23,20],[24,20],[25,20],[26,20]]}],
      reactions:[{"id":"west-vault","when":"treasure","at":[7,5],"open":["high"],"message":"The western chest opens the high road.","objective":"Cross the high road to find the key and eastern vault."},{"id":"east-vault","when":"treasure","at":[29,13],"open":["east","return","high"],"close":["blue"],"message":"The eastern chest seals blue and opens both lower passages.","objective":"Bring seven treasure and the key to the southern hatch."}],
      loot:[[6,15,1],[7,5,3],[25,5,1],[29,13,3],[17,23,1],[33,27,1]],
      guards:[{"spawn":[7,24],"facing":3.141592653589793,"patrol":[[5,22],[8,22],[8,26],[5,26]]},{"spawn":[11,14],"facing":3.141592653589793,"patrol":[[8,14],[14,14],[14,15],[8,15]],"kind":"scorpion"},{"spawn":[10,5],"facing":3.141592653589793,"patrol":[[6,5],[12,5],[12,6],[6,6]],"kind":"scorpion"},{"spawn":[25,5],"facing":3.141592653589793,"patrol":[[22,5],[28,5],[28,6],[22,6]],"kind":"beetle"},{"spawn":[30,11],"facing":3.141592653589793,"patrol":[[30,8],[31,8],[31,13],[30,13]]},{"spawn":[27,14],"facing":3.141592653589793,"patrol":[[25,14],[30,14],[30,15],[25,15]],"kind":"scorpion"},{"spawn":[35,20],"facing":3.141592653589793,"patrol":[[35,18],[36,18],[36,24],[35,24]],"kind":"scorpion"},{"spawn":[19,23],"facing":3.141592653589793,"patrol":[[16,23],[22,23],[22,24],[16,24]]}]
    },
    {
      id:"mire-mouth",
      name:"Mire Mouth",
      brief:"Slow bog banks, crouching toads, and something stirring after the key.",
      hint:"Mud slows feet. A toad crouches before a short leap. Dodge its lane.",
      width:33,
      height:29,
      explore:true,
      sightRadius:5,
      burrows:1,
      pebbles:2,
      tongues:2,
      rooms:[[1,18,8,26],[4,9,7,18],[4,9,20,12],[17,4,20,9],[17,4,30,7],[27,7,30,24],[18,21,30,25],[10,21,18,24],[10,14,13,21],[7,14,17,17],[14,12,17,14]],
      spawn:[3,23],
      key:[29,5],
      exit:[20,24],
      cracks:[[9,22]],
      cover:[[3,23],[5,15],[11,10],[18,8],[25,6],[28,10],[28,20],[16,23]],
      gravel:[[19,22]],
      mud:[[6,13],[6,14],[10,10],[11,11],[12,11],[13,11],[18,7],[19,7],[28,13],[29,13],[28,14],[29,14],[20,23]],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[18,6],"initialOpen":false,"tiles":[[27,9],[28,9],[29,9],[30,9]]},{"id":"south-bank","name":"south bank","color":[202,164,105],"initialOpen":false,"tiles":[[27,18],[28,18],[29,18],[30,18]]}],
      reactions:[{"id":"mire-key","when":"key","close":["blue"],"open":["south-bank"],"spawn":["mire-toad","mire-spider"],"message":"The upper bank seals. Reeds shake behind you; the southern bank opens.","objective":"Go down the eastern bank to the southern hatch. Leave the shaking reeds."}],
      loot:[[6,23,1],[11,10,1],[19,5,1],[29,6,1],[29,22,1],[18,23,3],[11,22,1],[12,15,1]],
      guards:[{"kind":"snake","spawn":[7,22],"facing":3.141592653589793,"patrol":[[4,20],[7,20],[7,22],[4,22]]},{"kind":"toad","spawn":[13,11],"facing":3.141592653589793,"patrol":[[10,9],[13,9],[13,11],[10,11]]},{"kind":"scorpion","spawn":[24,7],"facing":3.141592653589793,"patrol":[[21,5],[24,5],[24,7],[21,7]]},{"kind":"toad","spawn":[29,15],"facing":3.141592653589793,"patrol":[[28,11],[29,11],[29,15],[28,15]]},{"kind":"spider","spawn":[23,24],"facing":3.141592653589793,"patrol":[[20,22],[23,22],[23,24],[20,24]]}],
      reinforcements:[{"kind":"toad","spawn":[29,6],"facing":3.141592653589793,"patrol":[[27,4],[29,4],[29,6],[27,6]],"id":"mire-toad"},{"kind":"spider","spawn":[14,16],"facing":3.141592653589793,"patrol":[[11,14],[14,14],[14,16],[11,16]],"id":"mire-spider"}]
    },
    {
      id:"silk-galleries",
      name:"Silk Galleries",
      brief:"Offset shelves, silk traps and a gallery that seals behind you.",
      hint:"Spiders mark the ground before laying silk. Keep moving; webs fade.",
      width:38,
      height:29,
      explore:true,
      sightRadius:5,
      burrows:1,
      pebbles:2,
      tongues:1,
      rooms:[[1,2,5,27],[5,2,32,5],[5,8,20,11],[17,11,20,15],[5,12,31,15],[29,5,32,10],[31,10,35,27],[5,23,31,26],[25,15,28,23],[9,15,12,23]],
      spawn:[3,25],
      key:[31,3],
      exit:[33,25],
      cracks:[[13,24]],
      cover:[[3,25],[4,18],[12,14],[18,13],[27,14],[32,11],[32,18],[27,24],[18,4]],
      gravel:[[25,18]],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"initialOpen":true,"tiles":[[15,2],[15,3],[15,4],[15,5]]},{"id":"north-stair","name":"north stair","color":[202,164,105],"initialOpen":false,"tiles":[[29,7],[30,7],[31,7],[32,7]]},{"id":"hatch-stair","name":"hatch stair","color":[202,164,105],"initialOpen":false,"tiles":[[31,20],[32,20],[33,20],[34,20],[35,20]]}],
      reactions:[{"id":"gallery-entry","when":"enter","region":[17,12,20,15],"close":["blue"],"open":["north-stair"],"spawn":["shelf-spider"],"message":"The top gallery seals. A shelf cracks open behind you; the eastern stair opens.","objective":"Take the eastern stair to the key. Keep clear of the cracked shelf."},{"id":"gallery-key","when":"key","open":["hatch-stair"],"spawn":["hatch-toad"],"message":"The hatch stair opens. Something climbs out of the southern shelves.","objective":"Follow the eastern stair down. Watch the emerging den."}],
      loot:[[3,3,1],[12,3,1],[25,3,1],[31,4,1],[23,13,3],[6,24,1],[18,24,1],[34,24,1]],
      guards:[{"kind":"snake","spawn":[3,16],"facing":3.141592653589793,"patrol":[[2,13],[3,13],[3,16],[2,16]]},{"kind":"spider","spawn":[12,14],"facing":3.141592653589793,"patrol":[[9,13],[12,13],[12,14],[9,14]]},{"kind":"scorpion","spawn":[19,10],"facing":3.141592653589793,"patrol":[[17,9],[19,9],[19,10],[17,10]]},{"kind":"spider","spawn":[29,14],"facing":3.141592653589793,"patrol":[[26,13],[29,13],[29,14],[26,14]]},{"kind":"toad","spawn":[34,16],"facing":3.141592653589793,"patrol":[[32,12],[34,12],[34,16],[32,16]]}],
      reinforcements:[{"kind":"spider","spawn":[9,10],"facing":3.141592653589793,"patrol":[[6,9],[9,9],[9,10],[6,10]],"id":"shelf-spider"},{"kind":"toad","spawn":[28,25],"facing":3.141592653589793,"patrol":[[25,24],[28,24],[28,25],[25,25]],"id":"hatch-toad"}]
    },
    {
      id:"falling-span",
      abyss:true,
      name:"Falling Span",
      brief:"High bridges over dark water. The first crossing will not stay open.",
      hint:"The middle chest releases the lower crossing. Listen for a den opening.",
      width:35,
      height:30,
      explore:true,
      sightRadius:5,
      burrows:0,
      pebbles:2,
      tongues:2,
      rooms:[[1,2,9,8],[9,3,25,5],[25,1,33,8],[25,8,28,23],[7,21,25,23],[1,18,8,27],[8,25,16,27],[13,14,16,25],[13,12,20,16],[16,13,25,15],[4,8,6,18]],
      spawn:[3,5],
      key:[29,3],
      exit:[3,23],
      cracks:[],
      cover:[[3,5],[8,4],[20,4],[26,8],[27,12],[18,14],[15,19],[9,22],[5,17]],
      gravel:[[26,17],[11,22]],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[8,4],"initialOpen":false,"tiles":[[18,3],[18,4],[18,5]]},{"id":"descent","name":"descent","color":[202,164,105],"initialOpen":false,"tiles":[[25,10],[26,10],[27,10],[28,10]]},{"id":"middle-seal","name":"middle seal","color":[202,164,105],"initialOpen":true,"tiles":[[22,13],[22,14],[22,15]]},{"id":"lower-span","name":"lower span","color":[202,164,105],"initialOpen":false,"tiles":[[18,21],[18,22],[18,23]]},{"id":"west-stair","name":"west stair","color":[202,164,105],"initialOpen":false,"tiles":[[4,12],[5,12],[6,12]]}],
      reactions:[{"id":"span-entry","when":"enter","region":[25,2,33,7],"requiresOpen":["blue"],"close":["blue"],"open":["descent"],"spawn":["span-toad"],"message":"The bridge seals behind you. A toad emerges on the old crossing; the eastern descent opens.","objective":"Take the eastern descent. Find the central chest for a lower crossing."},{"id":"span-chest","when":"treasure","at":[17,14],"close":["middle-seal"],"open":["lower-span","west-stair"],"spawn":["lower-spider"],"message":"The chest seals the middle bridge and releases the lower crossing. A den opens below.","objective":"Use the lower crossing to reach the western hatch."}],
      loot:[[5,3,1],[12,4,1],[27,2,1],[31,6,1],[17,14,3],[6,22,1],[14,26,1],[26,21,1]],
      guards:[{"kind":"scorpion","spawn":[9,8],"facing":3.141592653589793,"patrol":[[5,7],[9,7],[9,8],[5,8]]},{"kind":"toad","spawn":[15,4],"facing":3.141592653589793,"patrol":[[11,3],[15,3],[15,4],[11,4]]},{"kind":"snake","spawn":[31,6],"facing":3.141592653589793,"patrol":[[27,2],[31,2],[31,6],[27,6]]},{"kind":"beetle","spawn":[27,18],"facing":3.141592653589793,"patrol":[[26,14],[27,14],[27,18],[26,18]]},{"kind":"spider","spawn":[18,15],"facing":3.141592653589793,"patrol":[[14,13],[18,13],[18,15],[14,15]]},{"kind":"snake","spawn":[6,24],"facing":3.141592653589793,"patrol":[[3,20],[6,20],[6,24],[3,24]]}],
      reinforcements:[{"kind":"toad","spawn":[21,4],"facing":3.141592653589793,"patrol":[[18,3],[21,3],[21,4],[18,4]],"id":"span-toad"},{"kind":"spider","spawn":[24,22],"facing":3.141592653589793,"patrol":[[21,21],[24,21],[24,22],[21,22]],"id":"lower-spider"}]
    },
    {
      id:"echo-fan",
      name:"Echo Fan",
      brief:"A branching cavern. Every prize wakes another side of the nest.",
      hint:"The central chest opens the north arm. The key releases a western return.",
      width:38,
      height:30,
      explore:true,
      sightRadius:4.8,
      burrows:1,
      pebbles:2,
      tongues:1,
      requiredTreasure:6,
      rooms:[[18,12,24,18],[20,2,23,12],[5,5,20,8],[5,8,8,25],[1,2,8,8],[5,22,21,25],[18,18,21,25],[24,14,35,17],[31,4,35,14],[30,17,35,27],[8,9,14,12],[14,10,18,14],[23,5,31,8]],
      spawn:[20,24],
      key:[33,6],
      exit:[3,5],
      cracks:[[17,23]],
      cover:[[20,24],[19,19],[20,13],[27,15],[32,10],[23,7],[11,7],[7,13],[10,23],[32,23]],
      gravel:[[32,18]],
      gates:[{"id":"south-seal","name":"south seal","color":[202,164,105],"initialOpen":true,"tiles":[[18,20],[19,20],[20,20],[21,20]]},{"id":"north-arm","name":"north arm","color":[202,164,105],"initialOpen":false,"tiles":[[20,10],[21,10],[22,10],[23,10]]},{"id":"east-seal","name":"east seal","color":[202,164,105],"initialOpen":true,"tiles":[[27,14],[27,15],[27,16],[27,17]]},{"id":"west-arm","name":"west arm","color":[202,164,105],"initialOpen":false,"tiles":[[14,10],[14,11],[14,12],[14,13],[14,14]]},{"id":"north-return","name":"High return","color":[202,164,105],"tiles":[[27,5],[27,6],[27,7],[27,8]]}],
      reactions:[{"id":"echo-vault","when":"treasure","at":[21,14],"close":["south-seal"],"open":["north-arm"],"spawn":["echo-spider"],"message":"The southern arm seals. The north arm opens—and the nest stirs behind you.","objective":"Explore the north and east arms. The hatch needs six treasure."},{"id":"echo-key","when":"key","close":["east-seal"],"open":["west-arm","north-return"],"spawn":["echo-toad"],"message":"The east arm seals. A western passage opens as a toad wakes in its den.","objective":"Go north around the east arm, then follow the west passage to the hatch."}],
      loot:[[19,24,1],[21,14,3],[22,3,1],[33,6,1],[34,23,1],[6,24,1],[6,5,1],[12,10,1]],
      guards:[{"kind":"scorpion","spawn":[23,17],"facing":3.141592653589793,"patrol":[[20,15],[23,15],[23,17],[20,17]]},{"kind":"spider","spawn":[22,7],"facing":3.141592653589793,"patrol":[[21,4],[22,4],[22,7],[21,7]]},{"kind":"toad","spawn":[34,9],"facing":3.141592653589793,"patrol":[[31,6],[34,6],[34,9],[31,9]]},{"kind":"snake","spawn":[34,24],"facing":3.141592653589793,"patrol":[[32,20],[34,20],[34,24],[32,24]]},{"kind":"beetle","spawn":[7,21],"facing":3.141592653589793,"patrol":[[5,17],[7,17],[7,21],[5,21]]},{"kind":"spider","spawn":[6,6],"facing":3.141592653589793,"patrol":[[3,4],[6,4],[6,6],[3,6]]}],
      reinforcements:[{"kind":"spider","spawn":[20,24],"facing":3.141592653589793,"patrol":[[18,23],[20,23],[20,24],[18,24]],"id":"echo-spider"},{"kind":"toad","spawn":[12,11],"facing":3.141592653589793,"patrol":[[9,10],[12,10],[12,11],[9,11]],"id":"echo-toad"}]
    },
    {
      id:"hungry-observatory",
      name:"Hungry Observatory",
      brief:"Four round chambers, nine hunters, and three awakenings. The vault is listening.",
      hint:"The north chest releases the western shutters. Taking the key seals the east approaches.",
      width:43,
      height:39,
      explore:true,
      sightRadius:4.8,
      burrows:1,
      pebbles:3,
      tongues:1,
      requiredTreasure:7,
      rooms:[[21,29,21,29],[19,30,23,30],[18,31,24,31],[18,32,24,32],[17,33,25,33],[18,34,24,34],[18,35,24,35],[19,36,23,36],[21,37,21,37],[21,14,21,14],[18,15,24,15],[17,16,25,16],[17,17,25,17],[17,18,25,18],[16,19,26,19],[17,20,25,20],[17,21,25,21],[17,22,25,22],[18,23,24,23],[21,24,21,24],[21,1,21,1],[19,2,23,2],[18,3,24,3],[18,4,24,4],[17,5,25,5],[18,6,24,6],[18,7,24,7],[19,8,23,8],[21,9,21,9],[37,15,37,15],[35,16,39,16],[34,17,40,17],[34,18,40,18],[33,19,41,19],[34,20,40,20],[34,21,40,21],[35,22,39,22],[37,23,37,23],[5,15,5,15],[3,16,7,16],[2,17,8,17],[2,18,8,18],[1,19,9,19],[2,20,8,20],[2,21,8,21],[3,22,7,22],[5,23,5,23],[20,32,23,35],[20,31,23,34],[20,30,23,33],[20,29,23,32],[20,28,23,31],[20,27,23,30],[20,26,23,29],[20,25,23,28],[20,24,23,27],[20,23,23,26],[20,22,23,25],[20,21,23,24],[20,20,23,23],[20,19,23,22],[20,18,23,21],[20,18,23,21],[20,17,23,20],[20,16,23,19],[20,15,23,18],[20,14,23,17],[20,13,23,16],[20,12,23,15],[20,11,23,14],[20,10,23,13],[20,9,23,12],[20,8,23,11],[20,7,23,10],[20,6,23,9],[20,5,23,8],[20,4,23,7],[20,4,23,7],[21,5,24,8],[22,6,25,9],[23,7,26,10],[24,8,27,11],[25,8,28,11],[26,9,29,12],[27,10,30,13],[28,11,31,14],[29,12,32,15],[30,13,33,16],[31,14,34,17],[32,15,35,18],[33,15,36,18],[34,16,37,19],[35,17,38,20],[36,18,39,21],[36,18,39,21],[35,19,38,22],[34,20,37,23],[33,21,36,24],[32,22,35,25],[31,22,34,25],[30,23,33,26],[29,24,32,27],[28,25,31,28],[27,26,30,29],[26,27,29,30],[25,28,28,31],[24,29,27,32],[23,29,26,32],[22,30,25,33],[21,31,24,34],[20,32,23,35],[20,32,23,35],[19,31,22,34],[18,30,21,33],[17,29,20,32],[16,29,19,32],[15,28,18,31],[14,27,17,30],[13,26,16,29],[12,25,15,28],[11,24,14,27],[10,23,13,26],[9,22,12,25],[8,22,11,25],[7,21,10,24],[6,20,9,23],[5,19,8,22],[4,18,7,21],[4,18,7,21],[5,17,8,20],[6,16,9,19],[7,15,10,18],[8,15,11,18],[9,14,12,17],[10,13,13,16],[11,12,14,15],[12,11,15,14],[13,10,16,13],[14,9,17,12],[15,8,18,11],[16,8,19,11],[17,7,20,10],[18,6,21,9],[19,5,22,8],[20,4,23,7],[20,18,23,21],[21,18,24,21],[22,18,25,21],[23,18,26,21],[24,18,27,21],[25,18,28,21],[26,18,29,21],[27,18,30,21],[28,18,31,21],[29,18,32,21],[30,18,33,21],[31,18,34,21],[32,18,35,21],[33,18,36,21],[34,18,37,21],[35,18,38,21],[36,18,39,21],[20,18,23,21],[19,18,22,21],[18,18,21,21],[17,18,20,21],[16,18,19,21],[15,18,18,21],[14,18,17,21],[13,18,16,21],[12,18,15,21],[11,18,14,21],[10,18,13,21],[9,18,12,21],[8,18,11,21],[7,18,10,21],[6,18,9,21],[5,18,8,21],[4,18,7,21],[21,3,37,6],[35,6,38,19],[10,25,14,29],[30,25,34,29],[33,23,36,25]],
      spawn:[21,33],
      key:[37,18],
      exit:[4,19],
      cracks:[],
      cover:[[21,33],[20,25],[21,18],[20,9],[30,5],[34,15],[34,24],[10,14],[10,24]],
      gravel:[[28,27]],
      gates:[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[21,18],"initialOpen":false,"tiles":[[29,9],[29,10],[29,11],[29,12],[29,13],[29,14],[29,15],[29,18],[29,19],[29,20],[29,21],[29,24],[29,25],[29,26],[29,27],[29,28],[29,29],[29,30]]},{"id":"western-shutters","name":"western shutters","color":[202,164,105],"initialOpen":false,"tiles":[[12,11],[12,12],[12,13],[12,14],[12,15],[12,16],[12,17],[12,18],[12,19],[12,20],[12,21],[12,22],[12,23],[12,24],[12,25],[12,26],[12,27],[12,28]]},{"id":"north-return","name":"north return","color":[202,164,105],"initialOpen":false,"tiles":[[29,3],[29,4],[29,5],[29,6]]}],
      loot:[[21,33,1],[21,5,3],[23,4,1],[37,18,1],[38,20,1],[4,19,1],[5,21,1],[21,18,1]],
      guards:[{"kind":"toad","spawn":[22,31],"facing":3.141592653589793,"patrol":[[19,30],[22,30],[22,31],[19,31]]},{"kind":"spider","spawn":[23,19],"facing":3.141592653589793,"patrol":[[20,16],[23,16],[23,19],[20,19]]},{"kind":"scorpion","spawn":[22,6],"facing":3.141592653589793,"patrol":[[18,3],[22,3],[22,6],[18,6]]},{"kind":"beetle","spawn":[38,19],"facing":3.141592653589793,"patrol":[[35,16],[38,16],[38,19],[35,19]]},{"kind":"snake","spawn":[6,21],"facing":3.141592653589793,"patrol":[[2,17],[6,17],[6,21],[2,21]]},{"kind":"scorpion","spawn":[36,25],"facing":3.141592653589793,"patrol":[[33,23],[36,23],[36,25],[33,25]]}],
      reinforcements:[{"kind":"spider","spawn":[29,11],"facing":3.141592653589793,"patrol":[[27,9],[29,9],[29,11],[27,11]],"id":"north-spider"},{"kind":"toad","spawn":[13,28],"facing":3.141592653589793,"patrol":[[11,26],[13,26],[13,28],[11,28]],"id":"west-toad"},{"kind":"snake","spawn":[33,28],"facing":3.141592653589793,"patrol":[[31,26],[33,26],[33,28],[31,28]],"id":"east-snake"}],
      reactions:[{"id":"north-awakening","when":"treasure","at":[21,5],"open":["western-shutters"],"spawn":["north-spider","west-toad"],"message":"The vault releases the western shutters. Two sleeping dens stir.","objective":"Take the eastern key, then bring seven treasure to the western hatch."},{"id":"east-awakening","when":"key","close":["blue"],"open":["north-return"],"spawn":["east-snake"],"message":"The east approaches seal. The high return opens—and a snake emerges below.","objective":"Return by the high northern crossing, then take the western shutters."}]
    },
    {"explore":true,"gaze":true,"sightRadius":6,"burrows":0,"pebbles":2,"tongues":2,"cracks":[],"gravel":[],"cover":[[3,21],[5,16],[8,4],[14,7],[22,11],[24,16]],"mud":[],"id":"fern-cloister","name":"Fern Cloister","brief":"An abandoned courtyard. The leaves sound closer than they should.","hint":"The fern paths meet at the old courtyard. The eastern stair leads home.","width":29,"height":25,"rooms":[[1,18,8,23],[3,3,6,18],[6,2,26,5],[23,5,26,22],[6,20,23,23],[6,10,23,13],[12,5,15,20],[9,8,19,16]],"walls":[[10,9],[10,10],[10,11],[18,13],[18,14],[18,15]],"spawn":[3,21],"key":[25,3],"exit":[25,21],"loot":[[6,21,1],[5,12,1],[10,4,1],[25,3,1],[15,11,3],[24,12,1],[19,22,1],[12,18,1]],"guards":[{"kind":"millipede","spawn":[14,14],"facing":3.141592653589793,"patrol":[[14,14]]},{"kind":"cricket","spawn":[25,18],"facing":3.141592653589793,"patrol":[[25,18],[25,20]]},{"kind":"snake","spawn":[17,3],"facing":3.141592653589793,"patrol":[[17,3],[20,3],[20,4],[17,4]]},{"kind":"toad","spawn":[5,8],"facing":3.141592653589793,"patrol":[[4,7],[5,7],[5,8],[4,8]]}],"gates":[{"id":"fern-shutter","name":"fern shutter","color":[186,164,96],"tiles":[[23,10],[23,11],[23,12],[23,13]],"initialOpen":true},{"id":"east-stair","name":"east stair","color":[186,164,96],"tiles":[[23,15],[24,15],[25,15],[26,15]],"initialOpen":false}],"reactions":[{"id":"fern-key","when":"key","close":["fern-shutter"],"open":["east-stair"],"message":"Stone grinds below the courtyard. The eastern stair opens.","objective":"Carry the key down the eastern stair."}]},
    {"explore":true,"gaze":true,"sightRadius":6,"burrows":0,"pebbles":2,"tongues":2,"cracks":[],"gravel":[[28,18],[29,18]],"cover":[[3,24],[7,18],[14,14],[8,7],[13,5],[25,5],[29,10],[26,22],[19,18]],"mud":[],"id":"drowned-steps","name":"Drowned Steps","brief":"Flooded terraces linked by narrow, uneven crossings.","hint":"The western chest lowers the high crossing. The key opens the descent.","width":35,"height":29,"abyss":true,"rooms":[[1,20,8,26],[5,16,16,20],[13,10,17,16],[8,7,17,10],[2,3,10,8],[10,4,28,6],[25,2,32,9],[27,9,30,23],[17,21,30,25],[17,17,21,21],[6,23,17,25],[17,13,28,15],[18,10,21,17]],"spawn":[3,24],"key":[30,4],"exit":[19,23],"loot":[[6,24,1],[13,18,1],[6,5,3],[16,5,1],[30,4,1],[28,22,1],[19,18,1],[23,14,1]],"guards":[{"kind":"millipede","spawn":[15,11],"facing":3.141592653589793,"patrol":[[15,11]]},{"kind":"millipede","spawn":[28,13],"facing":3.141592653589793,"patrol":[[28,13]]},{"kind":"cricket","spawn":[29,21],"facing":3.141592653589793,"patrol":[[29,21],[29,19]]},{"kind":"scorpion","spawn":[6,4],"facing":3.141592653589793,"patrol":[[3,4],[6,4],[6,5],[3,5]]},{"kind":"spider","spawn":[20,15],"facing":3.141592653589793,"patrol":[[19,14],[20,14],[20,15],[19,15]]}],"gates":[{"id":"high-crossing","name":"high crossing","color":[186,164,96],"tiles":[[20,4],[20,5],[20,6]],"initialOpen":false},{"id":"old-crossing","name":"old crossing","color":[186,164,96],"tiles":[[11,16],[11,17],[11,18],[11,19],[11,20]],"initialOpen":true},{"id":"descent","name":"descent","color":[186,164,96],"tiles":[[27,17],[28,17],[29,17],[30,17]],"initialOpen":false}],"reactions":[{"id":"steps-chest","when":"treasure","at":[6,5],"open":["high-crossing"],"message":"The chest lowers a crossing over the northern water.","objective":"Cross north to find the terrace key."},{"id":"steps-key","when":"key","close":["old-crossing"],"open":["descent"],"message":"The old crossing folds away. The eastern descent settles into place.","objective":"Take the eastern descent to the lower hatch."}]},
    {"explore":true,"gaze":true,"sightRadius":6,"burrows":0,"pebbles":3,"tongues":2,"cracks":[],"gravel":[[18,17],[19,17],[18,18]],"cover":[[18,27],[17,22],[12,19],[7,12],[10,7],[18,8],[24,6],[30,10],[28,23]],"mud":[],"id":"root-cathedral","name":"Root Cathedral","brief":"Roots split a vaulted nave into crooked side aisles. Two vaults demand a return.","hint":"The east chest releases the northern vault. Roots shift after the key is taken.","width":37,"height":31,"requiredTreasure":5,"rooms":[[15,24,22,29],[16,3,20,24],[6,18,16,21],[3,14,8,24],[20,16,32,19],[29,12,34,24],[5,5,16,8],[3,2,9,12],[20,4,30,7],[27,2,34,11],[8,10,16,13],[20,10,29,13],[7,23,29,26],[10,13,13,23]],"walls":[[18,11],[18,12],[18,13]],"spawn":[18,27],"key":[31,4],"exit":[5,4],"loot":[[18,27,1],[31,17,3],[31,4,1],[18,6,1],[6,6,1],[6,20,1],[24,25,1],[12,11,1]],"guards":[{"kind":"millipede","spawn":[18,20],"facing":3.141592653589793,"patrol":[[18,20]]},{"kind":"millipede","spawn":[24,12],"facing":3.141592653589793,"patrol":[[24,12]]},{"kind":"cricket","spawn":[18,15],"facing":3.141592653589793,"patrol":[[18,15],[19,15]]},{"kind":"toad","spawn":[32,21],"facing":3.141592653589793,"patrol":[[31,20],[32,20],[32,21],[31,21]]},{"kind":"scorpion","spawn":[7,7],"facing":3.141592653589793,"patrol":[[4,5],[7,5],[7,7],[4,7]]}],"gates":[{"id":"northern-vault","name":"northern vault","color":[186,164,96],"tiles":[[26,4],[26,5],[26,6],[26,7]],"initialOpen":false},{"id":"east-aisle","name":"east aisle","color":[186,164,96],"tiles":[[25,16],[25,17],[25,18],[25,19]],"initialOpen":true},{"id":"root-return","name":"root return","color":[186,164,96],"tiles":[[25,23],[25,24],[25,25],[25,26]],"initialOpen":false},{"id":"west-vault","name":"west vault","color":[186,164,96],"tiles":[[10,5],[10,6],[10,7],[10,8]],"initialOpen":false}],"reactions":[{"id":"cathedral-chest","when":"treasure","at":[31,17],"open":["northern-vault","root-return"],"message":"A root tears free. Two distant vaults echo.","objective":"Find the key in the northern vault."},{"id":"cathedral-key","when":"key","close":["east-aisle"],"open":["west-vault"],"spawn":["root-cricket"],"message":"The eastern aisle seals. Soil shifts in the nave; the western vault opens.","objective":"Bring five treasure and the key to the western vault."}],"reinforcements":[{"kind":"cricket","spawn":[30,17],"facing":3.141592653589793,"patrol":[[30,17],[32,17]],"id":"root-cricket"}]},
    {"explore":true,"gaze":true,"sightRadius":6,"burrows":0,"pebbles":3,"tongues":1,"cracks":[],"gravel":[[23,19],[24,19]],"cover":[[3,28],[5,19],[6,5],[15,3],[29,7],[30,22],[18,29],[10,20],[14,9],[23,15]],"mud":[],"id":"ember-quarry","name":"Ember Quarry","brief":"A cut-stone spiral, blind ledges, and a descent that changes underfoot.","hint":"The upper cache releases the inner ledge. Follow its descent toward the hatch.","width":35,"height":33,"rooms":[[1,25,8,31],[3,3,6,25],[6,2,31,5],[28,5,31,28],[8,27,28,30],[8,9,11,27],[11,8,24,11],[21,11,24,23],[11,21,21,24],[13,13,16,21],[16,13,21,16]],"spawn":[3,28],"key":[19,14],"exit":[13,23],"loot":[[5,28,1],[5,12,1],[18,3,3],[29,9,1],[19,29,1],[10,17,1],[19,14,1],[15,23,1]],"guards":[{"kind":"millipede","spawn":[5,10],"facing":3.141592653589793,"patrol":[[5,10]]},{"kind":"millipede","spawn":[22,13],"facing":3.141592653589793,"patrol":[[22,13]]},{"kind":"cricket","spawn":[23,22],"facing":3.141592653589793,"patrol":[[22,22],[23,22]]},{"kind":"beetle","spawn":[30,15],"facing":3.141592653589793,"patrol":[[29,12],[30,12],[30,15],[29,15]]},{"kind":"snake","spawn":[11,28],"facing":3.141592653589793,"patrol":[[11,28],[14,28],[14,29],[11,29]]},{"kind":"spider","spawn":[18,10],"facing":3.141592653589793,"patrol":[[15,9],[18,9],[18,10],[15,10]]}],"gates":[{"id":"inner-ledge","name":"inner ledge","color":[186,164,96],"tiles":[[19,8],[19,9],[19,10],[19,11]],"initialOpen":false},{"id":"quarry-neck","name":"quarry neck","color":[186,164,96],"tiles":[[21,18],[22,18],[23,18],[24,18]],"initialOpen":true},{"id":"inner-descent","name":"inner descent","color":[186,164,96],"tiles":[[13,18],[14,18],[15,18],[16,18]],"initialOpen":false}],"reactions":[{"id":"quarry-cache","when":"treasure","at":[18,3],"open":["inner-ledge"],"message":"The cache releases a ledge deep inside the quarry.","objective":"Circle the quarry to reach the inner key."},{"id":"quarry-key","when":"key","close":["quarry-neck"],"open":["inner-descent"],"message":"The ledge above folds shut. A stair opens beneath the inner chamber.","objective":"Take the inner descent to the hatch."}]},
    {"explore":true,"gaze":true,"sightRadius":6,"burrows":0,"pebbles":3,"tongues":2,"cracks":[],"gravel":[[30,18],[31,18]],"cover":[[4,27],[8,21],[14,19],[17,12],[15,6],[25,6],[31,12],[30,20],[25,24],[8,28]],"mud":[],"id":"canopy-crown","name":"Canopy Crown","brief":"Island shrines above the canopy. Three offerings wake the roots beneath them.","hint":"Each shrine opens another crossing. Bring six treasure to the crown hatch.","width":39,"height":33,"abyss":true,"requiredTreasure":6,"rooms":[[1,23,9,30],[6,18,9,23],[9,17,19,20],[16,10,19,17],[12,3,22,10],[22,5,33,7],[29,2,36,12],[29,12,32,24],[21,22,32,25],[18,25,24,30],[7,27,18,29],[3,5,7,18],[7,5,12,7],[7,15,16,17],[19,14,29,16],[9,10,12,15]],"spawn":[4,27],"key":[34,5],"exit":[21,28],"loot":[[5,27,1],[17,5,3],[34,5,1],[30,23,3],[10,16,1],[20,28,1]],"guards":[{"kind":"millipede","spawn":[17,15],"facing":3.141592653589793,"patrol":[[17,15]]},{"kind":"millipede","spawn":[31,13],"facing":3.141592653589793,"patrol":[[31,13]]},{"kind":"millipede","spawn":[11,28],"facing":3.141592653589793,"patrol":[[11,28]]},{"kind":"cricket","spawn":[30,21],"facing":3.141592653589793,"patrol":[[30,21],[31,21]]},{"kind":"scorpion","spawn":[20,7],"facing":3.141592653589793,"patrol":[[18,6],[20,6],[20,7],[18,7]]},{"kind":"toad","spawn":[33,9],"facing":3.141592653589793,"patrol":[[32,8],[33,8],[33,9],[32,9]]}],"gates":[{"id":"shrine-crossing","name":"shrine crossing","color":[186,164,96],"tiles":[[25,5],[25,6],[25,7]],"initialOpen":false},{"id":"south-root","name":"south root","color":[186,164,96],"tiles":[[6,21],[7,21],[8,21],[9,21]],"initialOpen":true},{"id":"eastern-root","name":"eastern root","color":[186,164,96],"tiles":[[29,18],[30,18],[31,18],[32,18]],"initialOpen":false},{"id":"old-east","name":"old east","color":[186,164,96],"tiles":[[25,14],[25,15],[25,16]],"initialOpen":true},{"id":"crown-bridge","name":"crown bridge","color":[186,164,96],"tiles":[[25,22],[25,23],[25,24],[25,25]],"initialOpen":false},{"id":"low-return","name":"low return","color":[186,164,96],"tiles":[[13,27],[13,28],[13,29]],"initialOpen":false}],"reactions":[{"id":"canopy-offering","when":"treasure","at":[17,5],"close":["south-root"],"open":["shrine-crossing","low-return"],"message":"The south root twists shut. The high shrine crossing unfurls.","objective":"Take the high crossing to the key."},{"id":"canopy-key","when":"key","close":["old-east"],"open":["eastern-root","shrine-crossing"],"spawn":["canopy-cricket"],"message":"The old eastern root snaps shut. A lower root stretches toward the last shrine.","objective":"Follow the eastern root to the lower shrine."},{"id":"canopy-last","when":"treasure","at":[30,23],"open":["crown-bridge"],"spawn":["canopy-spider"],"message":"The last offering releases the crown bridge. Branches shiver behind you.","objective":"Bring six treasure and the key across the crown bridge."}],"reinforcements":[{"kind":"cricket","spawn":[33,6],"facing":3.141592653589793,"patrol":[[33,6]],"id":"canopy-cricket"},{"kind":"spider","spawn":[30,22],"facing":3.141592653589793,"patrol":[[30,22]],"id":"canopy-spider"}]},
    {
      "dark": true,
      "explore": true,
      "sightRadius": 3.1,
      "burrows": 0,
      "pebbles": 2,
      "tongues": 2,
      "cracks": [],
      "cover": [
        [
          3,
          20
        ],
        [
          7,
          12
        ],
        [
          12,
          8
        ],
        [
          22,
          9
        ],
        [
          23,
          17
        ],
        [
          11,
          21
        ]
      ],
      "gravel": [],
      "glowPlants": [
        [
          5,
          20
        ],
        [
          5,
          15
        ],
        [
          9,
          9
        ],
        [
          13,
          5
        ],
        [
          20,
          5
        ],
        [
          23,
          12
        ],
        [
          20,
          19
        ],
        [
          12,
          21
        ]
      ],
      "id": "glowcap-grotto",
      "name": "Glowcap Grotto",
      "brief": "Blue fungi trace a flooded cavern. The wooden crossing will not last.",
      "hint": "Stand on the turquoise plate. The crossing stays up briefly after you leave.",
      "width": 29,
      "height": 25,
      "rooms": [
        [
          1,
          16,
          9,
          23
        ],
        [
          3,
          11,
          8,
          16
        ],
        [
          7,
          7,
          13,
          11
        ],
        [
          11,
          3,
          23,
          7
        ],
        [
          21,
          7,
          26,
          18
        ],
        [
          12,
          17,
          24,
          22
        ],
        [
          9,
          20,
          12,
          22
        ],
        [
          8,
          13,
          14,
          16
        ],
        [
          14,
          13,
          21,
          15
        ]
      ],
      "gaps": [
        [
          17,
          3
        ],
        [
          17,
          4
        ],
        [
          17,
          5
        ],
        [
          17,
          6
        ],
        [
          17,
          7
        ]
      ],
      "spawn": [
        3,
        20
      ],
      "key": [
        23,
        4
      ],
      "exit": [
        14,
        20
      ],
      "gates": [
        {
          "id": "glowcap",
          "name": "glowcap",
          "color": [
            91,
            225,
            207
          ],
          "tiles": [
            [
              17,
              5
            ]
          ],
          "plates": [
            [
              14,
              5
            ],
            [
              20,
              5
            ]
          ],
          "duration": 7,
          "bridge": true
        }
      ],
      "loot": [
        [
          5,
          20,
          1
        ],
        [
          8,
          10,
          1
        ],
        [
          12,
          5,
          1
        ],
        [
          23,
          4,
          1
        ],
        [
          24,
          13,
          1
        ],
        [
          21,
          19,
          3
        ],
        [
          12,
          21,
          1
        ],
        [
          11,
          14,
          1
        ]
      ],
      "guards": [
        {
          "kind": "moth",
          "spawn": [
            12,
            6
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              12,
              6
            ],
            [
              15,
              6
            ]
          ]
        },
        {
          "kind": "moth",
          "spawn": [
            23,
            14
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              22,
              12
            ],
            [
              24,
              12
            ],
            [
              24,
              14
            ],
            [
              22,
              14
            ]
          ]
        },
        {
          "kind": "spider",
          "spawn": [
            11,
            15
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              9,
              14
            ],
            [
              11,
              14
            ],
            [
              11,
              15
            ],
            [
              9,
              15
            ]
          ]
        }
      ]
    },
    {
      "dark": true,
      "explore": true,
      "sightRadius": 3.1,
      "burrows": 0,
      "pebbles": 2,
      "tongues": 2,
      "cracks": [],
      "cover": [
        [
          3,
          24
        ],
        [
          6,
          15
        ],
        [
          9,
          10
        ],
        [
          20,
          10
        ],
        [
          24,
          5
        ],
        [
          30,
          12
        ],
        [
          23,
          22
        ]
      ],
      "gravel": [],
      "glowPlants": [
        [
          5,
          24
        ],
        [
          6,
          18
        ],
        [
          7,
          10
        ],
        [
          18,
          10
        ],
        [
          22,
          7
        ],
        [
          29,
          5
        ],
        [
          30,
          16
        ],
        [
          25,
          22
        ],
        [
          15,
          23
        ]
      ],
      "id": "tideglass-causeway",
      "name": "Tideglass Causeway",
      "brief": "Three luminous islands. Cross before the planks fold beneath the tide.",
      "hint": "Both banks have a plate. Wake a bridge again if its light fades.",
      "width": 35,
      "height": 29,
      "abyss": true,
      "rooms": [
        [
          1,
          20,
          8,
          26
        ],
        [
          5,
          12,
          8,
          20
        ],
        [
          4,
          8,
          12,
          12
        ],
        [
          12,
          9,
          18,
          10
        ],
        [
          18,
          6,
          24,
          13
        ],
        [
          23,
          3,
          30,
          7
        ],
        [
          28,
          7,
          31,
          21
        ],
        [
          17,
          20,
          31,
          24
        ],
        [
          13,
          15,
          18,
          22
        ],
        [
          8,
          23,
          17,
          25
        ]
      ],
      "gaps": [
        [
          14,
          9
        ],
        [
          14,
          10
        ],
        [
          26,
          3
        ],
        [
          26,
          4
        ],
        [
          26,
          5
        ],
        [
          26,
          6
        ],
        [
          26,
          7
        ]
      ],
      "spawn": [
        3,
        24
      ],
      "key": [
        29,
        4
      ],
      "exit": [
        19,
        22
      ],
      "gates": [
        {
          "id": "west-tide",
          "name": "west tide",
          "color": [
            91,
            225,
            207
          ],
          "tiles": [
            [
              14,
              10
            ]
          ],
          "plates": [
            [
              11,
              10
            ],
            [
              18,
              10
            ]
          ],
          "duration": 6,
          "bridge": true
        },
        {
          "id": "high-tide",
          "name": "high tide",
          "color": [
            91,
            225,
            207
          ],
          "tiles": [
            [
              26,
              5
            ]
          ],
          "plates": [
            [
              23,
              5
            ],
            [
              29,
              5
            ]
          ],
          "duration": 6,
          "bridge": true
        },
        {
          "id": "eastern-descent",
          "name": "eastern descent",
          "color": [
            177,
            137,
            239
          ],
          "tiles": [
            [
              28,
              17
            ],
            [
              29,
              17
            ],
            [
              30,
              17
            ],
            [
              31,
              17
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          5,
          24,
          1
        ],
        [
          7,
          10,
          1
        ],
        [
          20,
          9,
          3
        ],
        [
          29,
          4,
          1
        ],
        [
          30,
          12,
          1
        ],
        [
          24,
          22,
          1
        ],
        [
          18,
          21,
          1
        ],
        [
          13,
          24,
          1
        ]
      ],
      "guards": [
        {
          "kind": "moth",
          "spawn": [
            9,
            10
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              9,
              10
            ],
            [
              11,
              10
            ]
          ]
        },
        {
          "kind": "toad",
          "spawn": [
            22,
            12
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              22,
              11
            ],
            [
              23,
              11
            ],
            [
              23,
              12
            ],
            [
              22,
              12
            ]
          ]
        },
        {
          "kind": "moth",
          "spawn": [
            29,
            11
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              29,
              10
            ],
            [
              30,
              10
            ],
            [
              30,
              12
            ],
            [
              29,
              12
            ]
          ]
        },
        {
          "kind": "cricket",
          "spawn": [
            25,
            22
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              24,
              22
            ],
            [
              26,
              22
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "tide-key",
          "when": "key",
          "open": [
            "eastern-descent"
          ],
          "message": "The tide draws back from the eastern descent. Something flutters below.",
          "objective": "Follow the eastern descent to the lower hatch.",
          "spawn": [
            "tide-moth"
          ]
        }
      ],
      "reinforcements": [
        {
          "kind": "moth",
          "spawn": [
            22,
            22
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              21,
              21
            ],
            [
              23,
              21
            ],
            [
              23,
              22
            ],
            [
              21,
              22
            ]
          ],
          "id": "tide-moth"
        }
      ]
    },
    {
      "dark": true,
      "explore": true,
      "sightRadius": 3.1,
      "burrows": 0,
      "pebbles": 2,
      "tongues": 2,
      "cracks": [],
      "cover": [
        [
          3,
          23
        ],
        [
          8,
          17
        ],
        [
          8,
          8
        ],
        [
          14,
          5
        ],
        [
          24,
          8
        ],
        [
          25,
          17
        ],
        [
          13,
          23
        ]
      ],
      "gravel": [],
      "glowPlants": [
        [
          5,
          24
        ],
        [
          8,
          19
        ],
        [
          8,
          11
        ],
        [
          10,
          5
        ],
        [
          18,
          5
        ],
        [
          25,
          10
        ],
        [
          24,
          19
        ],
        [
          19,
          24
        ],
        [
          13,
          18
        ]
      ],
      "id": "pulse-garden",
      "name": "Pulse Garden",
      "brief": "Glowing root loops surround a vault with a fading entrance.",
      "hint": "The vault plate opens its stone block briefly. Another plate waits inside.",
      "width": 33,
      "height": 29,
      "rooms": [
        [
          1,
          20,
          9,
          26
        ],
        [
          6,
          3,
          9,
          20
        ],
        [
          9,
          3,
          25,
          6
        ],
        [
          23,
          6,
          27,
          23
        ],
        [
          9,
          22,
          23,
          25
        ],
        [
          13,
          6,
          16,
          22
        ],
        [
          9,
          11,
          23,
          14
        ],
        [
          9,
          17,
          23,
          20
        ],
        [
          17,
          8,
          22,
          11
        ],
        [
          18,
          14,
          21,
          17
        ],
        [
          21,
          18,
          25,
          21
        ]
      ],
      "walls": [
        [
          14,
          12
        ],
        [
          15,
          12
        ],
        [
          14,
          18
        ],
        [
          15,
          18
        ],
        [
          17,
          8
        ],
        [
          22,
          8
        ],
        [
          17,
          9
        ],
        [
          22,
          9
        ],
        [
          17,
          10
        ],
        [
          22,
          10
        ]
      ],
      "spawn": [
        3,
        23
      ],
      "key": [
        20,
        9
      ],
      "exit": [
        25,
        23
      ],
      "gates": [
        {
          "id": "pulse-vault",
          "name": "pulse vault",
          "color": [
            91,
            225,
            207
          ],
          "tiles": [
            [
              17,
              11
            ],
            [
              18,
              11
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
            ]
          ],
          "plates": [
            [
              19,
              13
            ],
            [
              20,
              9
            ]
          ],
          "duration": 5,
          "bridge": false
        },
        {
          "id": "garden-return",
          "name": "garden return",
          "color": [
            177,
            137,
            239
          ],
          "tiles": [
            [
              23,
              22
            ],
            [
              23,
              23
            ],
            [
              23,
              24
            ],
            [
              23,
              25
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "west-return",
          "name": "west return",
          "color": [
            177,
            137,
            239
          ],
          "tiles": [
            [
              23,
              18
            ],
            [
              23,
              19
            ],
            [
              23,
              20
            ],
            [
              23,
              21
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          6,
          24,
          1
        ],
        [
          8,
          6,
          1
        ],
        [
          18,
          5,
          1
        ],
        [
          25,
          9,
          1
        ],
        [
          20,
          9,
          3
        ],
        [
          25,
          21,
          1
        ],
        [
          17,
          24,
          1
        ],
        [
          12,
          13,
          1
        ]
      ],
      "guards": [
        {
          "kind": "moth",
          "spawn": [
            15,
            5
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              13,
              4
            ],
            [
              15,
              4
            ],
            [
              15,
              5
            ],
            [
              13,
              5
            ]
          ]
        },
        {
          "kind": "spider",
          "spawn": [
            25,
            14
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              24,
              13
            ],
            [
              25,
              13
            ],
            [
              25,
              14
            ],
            [
              24,
              14
            ]
          ]
        },
        {
          "kind": "moth",
          "spawn": [
            20,
            18
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              19,
              18
            ],
            [
              21,
              18
            ]
          ]
        },
        {
          "kind": "scorpion",
          "spawn": [
            11,
            24
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              10,
              23
            ],
            [
              11,
              23
            ],
            [
              11,
              24
            ],
            [
              10,
              24
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "pulse-key",
          "when": "key",
          "close": [
            "garden-return"
          ],
          "open": [
            "west-return"
          ],
          "message": "The eastern root shutters close. The garden releases a western loop.",
          "objective": "Return through the central root loop to reach the hatch."
        }
      ]
    },
    {
      "dark": true,
      "explore": true,
      "sightRadius": 3.1,
      "burrows": 0,
      "pebbles": 3,
      "tongues": 2,
      "cracks": [],
      "cover": [
        [
          3,
          26
        ],
        [
          7,
          19
        ],
        [
          12,
          14
        ],
        [
          16,
          8
        ],
        [
          21,
          5
        ],
        [
          30,
          11
        ],
        [
          30,
          20
        ],
        [
          20,
          23
        ]
      ],
      "gravel": [
        [
          30,
          18
        ],
        [
          31,
          18
        ]
      ],
      "glowPlants": [
        [
          5,
          26
        ],
        [
          7,
          21
        ],
        [
          8,
          14
        ],
        [
          16,
          11
        ],
        [
          13,
          4
        ],
        [
          23,
          5
        ],
        [
          30,
          13
        ],
        [
          28,
          24
        ],
        [
          19,
          27
        ]
      ],
      "id": "spore-engine",
      "name": "Spore Engine",
      "brief": "Offset pump chambers breathe in the dark. Two plates lift two heavy blocks.",
      "hint": "Let each plate light up before leaving. Each block has a plate on both sides.",
      "width": 36,
      "height": 31,
      "rooms": [
        [
          1,
          23,
          8,
          28
        ],
        [
          5,
          15,
          8,
          23
        ],
        [
          5,
          12,
          17,
          16
        ],
        [
          14,
          4,
          17,
          12
        ],
        [
          9,
          2,
          22,
          6
        ],
        [
          22,
          4,
          32,
          7
        ],
        [
          29,
          7,
          32,
          24
        ],
        [
          20,
          22,
          32,
          27
        ],
        [
          17,
          17,
          21,
          24
        ],
        [
          11,
          18,
          17,
          21
        ],
        [
          8,
          25,
          20,
          28
        ]
      ],
      "spawn": [
        3,
        26
      ],
      "key": [
        30,
        5
      ],
      "exit": [
        21,
        25
      ],
      "gates": [
        {
          "id": "pump-block",
          "name": "pump block",
          "color": [
            91,
            225,
            207
          ],
          "tiles": [
            [
              14,
              9
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
              17,
              9
            ]
          ],
          "plates": [
            [
              16,
              12
            ],
            [
              16,
              6
            ]
          ],
          "duration": 6,
          "bridge": false
        },
        {
          "id": "spore-block",
          "name": "spore block",
          "color": [
            91,
            225,
            207
          ],
          "tiles": [
            [
              25,
              4
            ],
            [
              25,
              5
            ],
            [
              25,
              6
            ],
            [
              25,
              7
            ]
          ],
          "plates": [
            [
              22,
              5
            ],
            [
              29,
              5
            ]
          ],
          "duration": 6,
          "bridge": false
        },
        {
          "id": "pump-return",
          "name": "pump return",
          "color": [
            177,
            137,
            239
          ],
          "tiles": [
            [
              29,
              17
            ],
            [
              30,
              17
            ],
            [
              31,
              17
            ],
            [
              32,
              17
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          6,
          26,
          1
        ],
        [
          9,
          14,
          1
        ],
        [
          13,
          4,
          1
        ],
        [
          20,
          5,
          1
        ],
        [
          30,
          5,
          1
        ],
        [
          30,
          22,
          3
        ],
        [
          19,
          27,
          1
        ],
        [
          13,
          20,
          1
        ]
      ],
      "guards": [
        {
          "kind": "moth",
          "spawn": [
            12,
            14
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              10,
              13
            ],
            [
              12,
              13
            ],
            [
              12,
              14
            ],
            [
              10,
              14
            ]
          ]
        },
        {
          "kind": "cricket",
          "spawn": [
            16,
            10
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              15,
              10
            ],
            [
              16,
              10
            ]
          ]
        },
        {
          "kind": "moth",
          "spawn": [
            27,
            6
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              27,
              5
            ],
            [
              28,
              5
            ],
            [
              28,
              6
            ],
            [
              27,
              6
            ]
          ]
        },
        {
          "kind": "spider",
          "spawn": [
            30,
            20
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              29,
              19
            ],
            [
              30,
              19
            ],
            [
              30,
              20
            ],
            [
              29,
              20
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "engine-key",
          "when": "key",
          "open": [
            "pump-return"
          ],
          "spawn": [
            "pump-moth"
          ],
          "message": "The lower pump releases its shutter. Pale wings stir in a pipe behind you.",
          "objective": "Take the lower pump path toward the hatch."
        }
      ],
      "reinforcements": [
        {
          "kind": "moth",
          "spawn": [
            16,
            12
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              15,
              11
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
              15,
              12
            ]
          ],
          "id": "pump-moth"
        }
      ]
    },
    {
      "dark": true,
      "explore": true,
      "sightRadius": 3.1,
      "burrows": 0,
      "pebbles": 3,
      "tongues": 2,
      "cracks": [],
      "cover": [
        [
          4,
          27
        ],
        [
          8,
          21
        ],
        [
          14,
          17
        ],
        [
          17,
          10
        ],
        [
          22,
          5
        ],
        [
          32,
          11
        ],
        [
          32,
          20
        ],
        [
          24,
          25
        ],
        [
          15,
          28
        ]
      ],
      "gravel": [
        [
          31,
          18
        ],
        [
          32,
          18
        ]
      ],
      "glowPlants": [
        [
          5,
          27
        ],
        [
          8,
          20
        ],
        [
          13,
          17
        ],
        [
          17,
          12
        ],
        [
          15,
          5
        ],
        [
          23,
          5
        ],
        [
          33,
          8
        ],
        [
          32,
          17
        ],
        [
          30,
          25
        ],
        [
          19,
          28
        ]
      ],
      "id": "nightbloom-reach",
      "name": "Nightbloom Reach",
      "brief": "A broken crescent above black water. The last chest wakes the far bank.",
      "hint": "The high plate releases a short-lived crossing. The lower shrine opens the final bridge.",
      "width": 39,
      "height": 33,
      "abyss": true,
      "requiredTreasure": 6,
      "rooms": [
        [
          1,
          23,
          9,
          30
        ],
        [
          5,
          17,
          9,
          23
        ],
        [
          9,
          15,
          17,
          19
        ],
        [
          15,
          7,
          18,
          15
        ],
        [
          12,
          2,
          23,
          8
        ],
        [
          23,
          4,
          32,
          6
        ],
        [
          29,
          2,
          36,
          12
        ],
        [
          30,
          12,
          33,
          25
        ],
        [
          20,
          23,
          33,
          27
        ],
        [
          16,
          26,
          23,
          30
        ],
        [
          9,
          27,
          16,
          29
        ],
        [
          18,
          11,
          28,
          14
        ],
        [
          25,
          14,
          28,
          23
        ]
      ],
      "gaps": [
        [
          26,
          4
        ],
        [
          26,
          5
        ],
        [
          26,
          6
        ]
      ],
      "spawn": [
        4,
        27
      ],
      "key": [
        34,
        5
      ],
      "exit": [
        19,
        28
      ],
      "gates": [
        {
          "id": "nightbloom",
          "name": "nightbloom",
          "color": [
            91,
            225,
            207
          ],
          "tiles": [
            [
              26,
              5
            ]
          ],
          "plates": [
            [
              23,
              5
            ],
            [
              29,
              5
            ]
          ],
          "duration": 5,
          "bridge": true
        },
        {
          "id": "lower-shutter",
          "name": "lower shutter",
          "color": [
            177,
            137,
            239
          ],
          "tiles": [
            [
              30,
              20
            ],
            [
              31,
              20
            ],
            [
              32,
              20
            ],
            [
              33,
              20
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "crown-planks",
          "name": "crown planks",
          "color": [
            177,
            137,
            239
          ],
          "tiles": [
            [
              25,
              23
            ],
            [
              25,
              24
            ],
            [
              25,
              25
            ],
            [
              25,
              26
            ],
            [
              25,
              27
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "root-neck",
          "name": "root neck",
          "color": [
            177,
            137,
            239
          ],
          "tiles": [
            [
              27,
              11
            ],
            [
              27,
              12
            ],
            [
              27,
              13
            ],
            [
              27,
              14
            ]
          ],
          "initialOpen": true
        }
      ],
      "loot": [
        [
          5,
          27,
          1
        ],
        [
          17,
          5,
          3
        ],
        [
          34,
          5,
          1
        ],
        [
          30,
          25,
          3
        ],
        [
          13,
          17,
          1
        ],
        [
          19,
          28,
          1
        ]
      ],
      "guards": [
        {
          "kind": "moth",
          "spawn": [
            16,
            13
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              16,
              11
            ],
            [
              17,
              11
            ],
            [
              17,
              13
            ],
            [
              16,
              13
            ]
          ]
        },
        {
          "kind": "moth",
          "spawn": [
            21,
            5
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              20,
              4
            ],
            [
              21,
              4
            ],
            [
              21,
              5
            ],
            [
              20,
              5
            ]
          ]
        },
        {
          "kind": "toad",
          "spawn": [
            34,
            10
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              32,
              9
            ],
            [
              34,
              9
            ],
            [
              34,
              10
            ],
            [
              32,
              10
            ]
          ]
        },
        {
          "kind": "moth",
          "spawn": [
            31,
            16
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              31,
              15
            ],
            [
              32,
              15
            ],
            [
              32,
              16
            ],
            [
              31,
              16
            ]
          ]
        },
        {
          "kind": "cricket",
          "spawn": [
            28,
            25
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              27,
              25
            ],
            [
              29,
              25
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "reach-key",
          "when": "key",
          "close": [
            "root-neck"
          ],
          "open": [
            "lower-shutter"
          ],
          "message": "The middle neck twists shut. A lower shutter opens over the black water.",
          "objective": "Follow the eastern bank to the lower shrine."
        },
        {
          "id": "reach-chest",
          "when": "treasure",
          "at": [
            30,
            25
          ],
          "open": [
            "crown-planks"
          ],
          "spawn": [
            "reach-moth"
          ],
          "message": "The chest unfurls the final crossing. A lantern wakes behind you.",
          "objective": "Bring six treasure and the key across the lower crossing."
        }
      ],
      "reinforcements": [
        {
          "kind": "moth",
          "spawn": [
            32,
            13
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              31,
              12
            ],
            [
              32,
              12
            ],
            [
              32,
              13
            ],
            [
              31,
              13
            ]
          ],
          "id": "reach-moth"
        }
      ]
    },
    {
      "living": true,
      "explore": true,
      "sightRadius": 5,
      "burrows": 0,
      "pebbles": 2,
      "tongues": 1,
      "seeds": 3,
      "cracks": [],
      "cover": [
        [
          6,
          16
        ],
        [
          9,
          4
        ],
        [
          18,
          8
        ],
        [
          23,
          14
        ]
      ],
      "gravel": [],
      "shrubs": [
        [
          5,
          10
        ],
        [
          7,
          22
        ],
        [
          14,
          12
        ],
        [
          19,
          15
        ],
        [
          26,
          18
        ]
      ],
      "seedCrossings": [
        {
          "id": "orchard-vine",
          "banks": [
            [
              15,
              22
            ],
            [
              17,
              22
            ]
          ],
          "tiles": [
            [
              16,
              22
            ]
          ]
        }
      ],
      "id": "sleeping-orchard",
      "name": "Sleeping Orchard",
      "brief": "The orchard is waking. Grow cover, brace a root door, or weave a vine crossing.",
      "hint": "C plants a seed: face an open doorway to brace it, or plant on bare ground for cover. Marked banks grow vines.",
      "width": 31,
      "height": 27,
      "rooms": [
        [
          1,
          18,
          8,
          25
        ],
        [
          4,
          5,
          7,
          18
        ],
        [
          4,
          2,
          28,
          5
        ],
        [
          24,
          5,
          28,
          24
        ],
        [
          8,
          21,
          24,
          24
        ],
        [
          10,
          9,
          20,
          17
        ],
        [
          7,
          12,
          10,
          15
        ],
        [
          17,
          5,
          20,
          9
        ],
        [
          20,
          13,
          24,
          16
        ]
      ],
      "gaps": [
        [
          16,
          21
        ],
        [
          16,
          22
        ],
        [
          16,
          23
        ]
      ],
      "spawn": [
        3,
        23
      ],
      "key": [
        25,
        4
      ],
      "exit": [
        25,
        23
      ],
      "gates": [
        {
          "id": "old-key-stair",
          "name": "old key stair",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              24,
              7
            ],
            [
              25,
              7
            ],
            [
              26,
              7
            ],
            [
              27,
              7
            ],
            [
              28,
              7
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "middle-root",
          "name": "middle root",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              22,
              13
            ],
            [
              22,
              14
            ],
            [
              22,
              15
            ],
            [
              22,
              16
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          5,
          23,
          1
        ],
        [
          6,
          12,
          1
        ],
        [
          11,
          3,
          1
        ],
        [
          25,
          4,
          1
        ],
        [
          26,
          20,
          1
        ],
        [
          13,
          12,
          3
        ],
        [
          19,
          23,
          1
        ],
        [
          18,
          9,
          1
        ]
      ],
      "guards": [
        {
          "kind": "mimic",
          "spawn": [
            15,
            13
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              15,
              13
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            26,
            15
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              26,
              15
            ]
          ]
        },
        {
          "kind": "snake",
          "spawn": [
            13,
            4
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              11,
              3
            ],
            [
              13,
              3
            ],
            [
              13,
              4
            ],
            [
              11,
              4
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "orchard-key",
          "when": "key",
          "close": [
            "old-key-stair"
          ],
          "open": [
            "middle-root"
          ],
          "message": "The upper stair coils shut. A root draws back in the middle orchard.",
          "objective": "Take the central orchard around the closing stair—or brace an opening before it closes."
        }
      ]
    },
    {
      "living": true,
      "explore": true,
      "sightRadius": 5,
      "burrows": 0,
      "pebbles": 2,
      "tongues": 1,
      "seeds": 3,
      "cracks": [],
      "cover": [
        [
          3,
          26
        ],
        [
          7,
          16
        ],
        [
          10,
          4
        ],
        [
          17,
          10
        ],
        [
          24,
          13
        ],
        [
          31,
          19
        ]
      ],
      "gravel": [],
      "shrubs": [
        [
          7,
          8
        ],
        [
          12,
          4
        ],
        [
          23,
          4
        ],
        [
          10,
          18
        ],
        [
          23,
          17
        ],
        [
          30,
          11
        ],
        [
          19,
          27
        ]
      ],
      "seedCrossings": [],
      "id": "false-garden",
      "name": "False Garden",
      "brief": "Some plants twitch. Others stand perfectly still. Two prizes rearrange the hedges.",
      "hint": "A pebble can stir a suspicious plant from a safe distance. Watch for a moving shadow.",
      "width": 35,
      "height": 31,
      "rooms": [
        [
          1,
          21,
          9,
          28
        ],
        [
          5,
          3,
          8,
          21
        ],
        [
          8,
          2,
          31,
          5
        ],
        [
          28,
          5,
          32,
          27
        ],
        [
          9,
          25,
          28,
          28
        ],
        [
          9,
          16,
          25,
          20
        ],
        [
          13,
          8,
          17,
          16
        ],
        [
          17,
          8,
          28,
          11
        ],
        [
          9,
          12,
          13,
          15
        ],
        [
          21,
          11,
          25,
          25
        ],
        [
          8,
          18,
          9,
          22
        ]
      ],
      "spawn": [
        3,
        26
      ],
      "key": [
        30,
        3
      ],
      "exit": [
        29,
        26
      ],
      "gates": [
        {
          "id": "garden-entry",
          "name": "garden entry",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              10,
              16
            ],
            [
              10,
              17
            ],
            [
              10,
              18
            ],
            [
              10,
              19
            ],
            [
              10,
              20
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "north-hedge",
          "name": "north hedge",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              19,
              2
            ],
            [
              19,
              3
            ],
            [
              19,
              4
            ],
            [
              19,
              5
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "key-descent",
          "name": "key descent",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              28,
              13
            ],
            [
              29,
              13
            ],
            [
              30,
              13
            ],
            [
              31,
              13
            ],
            [
              32,
              13
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "west-loop",
          "name": "west loop",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
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
              17,
              11
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          6,
          26,
          1
        ],
        [
          7,
          12,
          1
        ],
        [
          15,
          17,
          3
        ],
        [
          15,
          9,
          1
        ],
        [
          24,
          3,
          1
        ],
        [
          30,
          3,
          1
        ],
        [
          30,
          23,
          1
        ],
        [
          18,
          27,
          1
        ]
      ],
      "guards": [
        {
          "kind": "mimic",
          "spawn": [
            8,
            19
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              8,
              19
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            17,
            17
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              17,
              17
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            24,
            9
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              24,
              9
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            30,
            20
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              30,
              20
            ]
          ]
        },
        {
          "kind": "spider",
          "spawn": [
            15,
            4
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              13,
              3
            ],
            [
              15,
              3
            ],
            [
              15,
              4
            ],
            [
              13,
              4
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "false-entry",
          "when": "enter",
          "region": [
            13,
            16,
            18,
            20
          ],
          "close": [
            "garden-entry"
          ],
          "open": [
            "west-loop"
          ],
          "message": "The entrance thickens behind you. A western hedge parts above the chest.",
          "objective": "Find the central chest to release the north hedge."
        },
        {
          "id": "false-chest",
          "when": "treasure",
          "at": [
            15,
            17
          ],
          "open": [
            "north-hedge"
          ],
          "message": "The chest loosens the northern hedge. Leaves twitch near the path.",
          "objective": "Follow the northern hedge to the key."
        },
        {
          "id": "false-key",
          "when": "key",
          "open": [
            "key-descent"
          ],
          "message": "The key releases the eastern descent through the garden.",
          "objective": "Take the eastern descent to the hatch."
        }
      ]
    },
    {
      "living": true,
      "explore": true,
      "sightRadius": 5,
      "burrows": 0,
      "pebbles": 2,
      "tongues": 1,
      "seeds": 2,
      "cracks": [],
      "cover": [
        [
          4,
          17
        ],
        [
          13,
          17
        ],
        [
          19,
          13
        ],
        [
          21,
          7
        ],
        [
          30,
          5
        ],
        [
          34,
          11
        ],
        [
          30,
          26
        ],
        [
          19,
          28
        ],
        [
          8,
          26
        ]
      ],
      "gravel": [],
      "shrubs": [
        [
          7,
          15
        ],
        [
          18,
          17
        ],
        [
          22,
          19
        ],
        [
          24,
          4
        ],
        [
          33,
          15
        ],
        [
          20,
          26
        ]
      ],
      "seedCrossings": [],
      "id": "rootwheel-ruins",
      "name": "Rootwheel Ruins",
      "brief": "A living wheel changes which chamber its root passages reach.",
      "hint": "The wheel turns as you reach its chambers. Alternate roots open before the old ones close.",
      "width": 41,
      "height": 33,
      "rooms": [
        [
          1,
          12,
          8,
          22
        ],
        [
          8,
          15,
          16,
          18
        ],
        [
          16,
          12,
          24,
          21
        ],
        [
          18,
          2,
          22,
          12
        ],
        [
          14,
          1,
          26,
          6
        ],
        [
          24,
          15,
          34,
          18
        ],
        [
          32,
          11,
          38,
          22
        ],
        [
          18,
          21,
          22,
          29
        ],
        [
          11,
          27,
          30,
          30
        ],
        [
          3,
          23,
          11,
          30
        ],
        [
          5,
          20,
          8,
          23
        ],
        [
          26,
          3,
          35,
          6
        ],
        [
          33,
          6,
          36,
          11
        ],
        [
          30,
          22,
          35,
          29
        ]
      ],
      "spawn": [
        4,
        17
      ],
      "key": [
        36,
        16
      ],
      "exit": [
        5,
        27
      ],
      "rootWheel": [
        20,
        17
      ],
      "gates": [
        {
          "id": "west-arm",
          "name": "west arm",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              12,
              15
            ],
            [
              12,
              16
            ],
            [
              12,
              17
            ],
            [
              12,
              18
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "north-arm",
          "name": "north arm",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              18,
              9
            ],
            [
              19,
              9
            ],
            [
              20,
              9
            ],
            [
              21,
              9
            ],
            [
              22,
              9
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "east-arm",
          "name": "east arm",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              28,
              15
            ],
            [
              28,
              16
            ],
            [
              28,
              17
            ],
            [
              28,
              18
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "south-arm",
          "name": "south arm",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              18,
              24
            ],
            [
              19,
              24
            ],
            [
              20,
              24
            ],
            [
              21,
              24
            ],
            [
              22,
              24
            ]
          ],
          "initialOpen": false,
          "switch": [
            19,
            28
          ]
        },
        {
          "id": "upper-return",
          "name": "upper return",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              29,
              3
            ],
            [
              29,
              4
            ],
            [
              29,
              5
            ],
            [
              29,
              6
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "low-return",
          "name": "low return",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              30,
              25
            ],
            [
              31,
              25
            ],
            [
              32,
              25
            ],
            [
              33,
              25
            ],
            [
              34,
              25
            ],
            [
              35,
              25
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          5,
          17,
          1
        ],
        [
          19,
          4,
          3
        ],
        [
          24,
          3,
          1
        ],
        [
          20,
          16,
          1
        ],
        [
          36,
          16,
          1
        ],
        [
          34,
          20,
          1
        ],
        [
          20,
          28,
          1
        ],
        [
          7,
          27,
          1
        ]
      ],
      "guards": [
        {
          "kind": "mimic",
          "spawn": [
            19,
            19
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              19,
              19
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            22,
            4
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              22,
              4
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            34,
            17
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              34,
              17
            ]
          ]
        },
        {
          "kind": "toad",
          "spawn": [
            19,
            28
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              19,
              27
            ],
            [
              20,
              27
            ],
            [
              20,
              28
            ],
            [
              19,
              28
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "wheel-entry",
          "when": "enter",
          "region": [
            17,
            13,
            23,
            20
          ],
          "close": [
            "west-arm"
          ],
          "open": [
            "north-arm"
          ],
          "message": "The wheel turns north. The western arm folds behind you.",
          "objective": "Reach the northern chest for another turn."
        },
        {
          "id": "wheel-chest",
          "when": "treasure",
          "at": [
            19,
            4
          ],
          "close": [
            "north-arm"
          ],
          "open": [
            "south-arm",
            "upper-return"
          ],
          "message": "The wheel turns south. A high return opens beyond the northern chamber.",
          "objective": "Take the high return to the eastern key."
        },
        {
          "id": "wheel-key",
          "when": "key",
          "close": [
            "east-arm"
          ],
          "open": [
            "low-return",
            "south-arm"
          ],
          "message": "The eastern arm curls shut. The low return unfurls beneath it.",
          "objective": "Take the eastern low return, then the southern roots to the western hatch."
        }
      ]
    },
    {
      "living": true,
      "explore": true,
      "sightRadius": 5,
      "burrows": 0,
      "pebbles": 3,
      "tongues": 1,
      "seeds": 3,
      "cracks": [],
      "cover": [
        [
          3,
          27
        ],
        [
          7,
          19
        ],
        [
          13,
          4
        ],
        [
          18,
          7
        ],
        [
          29,
          4
        ],
        [
          34,
          15
        ],
        [
          28,
          28
        ],
        [
          12,
          23
        ]
      ],
      "gravel": [],
      "shrubs": [
        [
          7,
          11
        ],
        [
          16,
          4
        ],
        [
          14,
          13
        ],
        [
          18,
          20
        ],
        [
          24,
          16
        ],
        [
          34,
          22
        ],
        [
          17,
          29
        ]
      ],
      "seedCrossings": [
        {
          "id": "glasshouse-vine",
          "banks": [
            [
              23,
              21
            ],
            [
              25,
              21
            ]
          ],
          "tiles": [
            [
              24,
              21
            ]
          ]
        }
      ],
      "id": "hungry-greenhouse",
      "name": "Hungry Greenhouse",
      "brief": "The vault feeds on treasure. Every valuable detour wakes another root.",
      "hint": "Taking the central chest reshapes the glasshouse paths. Keep a seed for a doorway worth saving.",
      "width": 39,
      "height": 33,
      "rooms": [
        [
          1,
          23,
          9,
          30
        ],
        [
          5,
          4,
          8,
          23
        ],
        [
          8,
          2,
          34,
          5
        ],
        [
          31,
          5,
          35,
          27
        ],
        [
          9,
          27,
          31,
          30
        ],
        [
          10,
          11,
          19,
          15
        ],
        [
          8,
          13,
          10,
          16
        ],
        [
          16,
          5,
          19,
          11
        ],
        [
          19,
          12,
          31,
          15
        ],
        [
          21,
          15,
          25,
          27
        ],
        [
          11,
          18,
          21,
          21
        ],
        [
          11,
          21,
          14,
          27
        ],
        [
          25,
          20,
          31,
          23
        ]
      ],
      "gaps": [
        [
          24,
          20
        ],
        [
          24,
          21
        ],
        [
          24,
          22
        ],
        [
          24,
          23
        ]
      ],
      "spawn": [
        3,
        27
      ],
      "key": [
        33,
        3
      ],
      "exit": [
        22,
        28
      ],
      "gates": [
        {
          "id": "glass-entry",
          "name": "glass entry",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              9,
              13
            ],
            [
              9,
              14
            ],
            [
              9,
              15
            ],
            [
              9,
              16
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "upper-vault",
          "name": "upper vault",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              26,
              2
            ],
            [
              26,
              3
            ],
            [
              26,
              4
            ],
            [
              26,
              5
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "central-return",
          "name": "central return",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              22,
              12
            ],
            [
              22,
              13
            ],
            [
              22,
              14
            ],
            [
              22,
              15
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "old-descent",
          "name": "old descent",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              31,
              10
            ],
            [
              32,
              10
            ],
            [
              33,
              10
            ],
            [
              34,
              10
            ],
            [
              35,
              10
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "low-crossing",
          "name": "low crossing",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              31,
              24
            ],
            [
              32,
              24
            ],
            [
              33,
              24
            ],
            [
              34,
              24
            ],
            [
              35,
              24
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          6,
          27,
          1
        ],
        [
          7,
          7,
          1
        ],
        [
          17,
          12,
          3
        ],
        [
          22,
          3,
          1
        ],
        [
          33,
          3,
          1
        ],
        [
          34,
          25,
          1
        ],
        [
          22,
          28,
          1
        ],
        [
          13,
          20,
          1
        ]
      ],
      "guards": [
        {
          "kind": "mimic",
          "spawn": [
            7,
            15
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              7,
              15
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            16,
            13
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              16,
              13
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            30,
            4
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              30,
              4
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            23,
            19
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              23,
              19
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            33,
            19
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              33,
              19
            ]
          ]
        },
        {
          "kind": "beetle",
          "spawn": [
            12,
            28
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              10,
              28
            ],
            [
              12,
              28
            ],
            [
              12,
              29
            ],
            [
              10,
              29
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "greenhouse-chest",
          "when": "treasure",
          "at": [
            17,
            12
          ],
          "close": [
            "glass-entry"
          ],
          "open": [
            "upper-vault",
            "central-return"
          ],
          "spawn": [
            "glass-mimic"
          ],
          "message": "The chest feeds the roots. The entrance closes, and two northern paths part.",
          "objective": "Take the northern vault to the key."
        },
        {
          "id": "greenhouse-key",
          "when": "key",
          "close": [
            "old-descent"
          ],
          "open": [
            "low-crossing"
          ],
          "message": "Roots claim the old descent. The lower crossing opens beneath the glass.",
          "objective": "Return through the central glasshouse or brace the descending root."
        }
      ],
      "reinforcements": [
        {
          "kind": "mimic",
          "spawn": [
            12,
            14
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              12,
              14
            ]
          ],
          "id": "glass-mimic"
        }
      ]
    },
    {
      "living": true,
      "explore": true,
      "sightRadius": 5,
      "burrows": 0,
      "pebbles": 3,
      "tongues": 2,
      "seeds": 4,
      "cracks": [],
      "cover": [
        [
          5,
          29
        ],
        [
          8,
          19
        ],
        [
          11,
          5
        ],
        [
          21,
          10
        ],
        [
          31,
          5
        ],
        [
          36,
          14
        ],
        [
          32,
          24
        ],
        [
          22,
          30
        ],
        [
          15,
          25
        ]
      ],
      "gravel": [],
      "shrubs": [
        [
          8,
          11
        ],
        [
          12,
          3
        ],
        [
          20,
          18
        ],
        [
          27,
          5
        ],
        [
          35,
          9
        ],
        [
          27,
          27
        ],
        [
          14,
          30
        ]
      ],
      "seedCrossings": [
        {
          "id": "heart-vine",
          "banks": [
            [
              22,
              30
            ],
            [
              24,
              30
            ]
          ],
          "tiles": [
            [
              23,
              30
            ]
          ]
        }
      ],
      "id": "the-heartwood",
      "name": "The Heartwood",
      "brief": "The heart of the ruin closes around you. Choose which openings deserve your seeds.",
      "hint": "The western chest opens the crown. The lower offering releases the final hatch path.",
      "width": 43,
      "height": 35,
      "requiredTreasure": 6,
      "rooms": [
        [
          1,
          24,
          10,
          32
        ],
        [
          6,
          6,
          9,
          24
        ],
        [
          5,
          2,
          14,
          6
        ],
        [
          14,
          3,
          35,
          6
        ],
        [
          32,
          2,
          39,
          10
        ],
        [
          34,
          10,
          38,
          28
        ],
        [
          24,
          25,
          35,
          30
        ],
        [
          15,
          28,
          24,
          32
        ],
        [
          10,
          29,
          15,
          32
        ],
        [
          10,
          16,
          22,
          20
        ],
        [
          9,
          16,
          10,
          20
        ],
        [
          18,
          6,
          22,
          16
        ],
        [
          22,
          17,
          34,
          20
        ],
        [
          25,
          20,
          28,
          25
        ],
        [
          12,
          22,
          18,
          28
        ],
        [
          28,
          22,
          34,
          24
        ]
      ],
      "gaps": [
        [
          19,
          3
        ],
        [
          19,
          4
        ],
        [
          19,
          5
        ],
        [
          19,
          6
        ],
        [
          23,
          29
        ],
        [
          23,
          30
        ]
      ],
      "spawn": [
        5,
        29
      ],
      "key": [
        36,
        4
      ],
      "exit": [
        18,
        30
      ],
      "gates": [
        {
          "id": "heart-entry",
          "name": "heart entry",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              12,
              16
            ],
            [
              12,
              17
            ],
            [
              12,
              18
            ],
            [
              12,
              19
            ],
            [
              12,
              20
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "crown-root",
          "name": "crown root",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              19,
              3
            ],
            [
              19,
              4
            ],
            [
              19,
              5
            ],
            [
              19,
              6
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "heart-loop",
          "name": "heart loop",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              18,
              12
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
          "initialOpen": false
        },
        {
          "id": "old-crown",
          "name": "old crown",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              34,
              12
            ],
            [
              35,
              12
            ],
            [
              36,
              12
            ],
            [
              37,
              12
            ],
            [
              38,
              12
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "east-descent",
          "name": "east descent",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              34,
              23
            ],
            [
              35,
              23
            ],
            [
              36,
              23
            ],
            [
              37,
              23
            ],
            [
              38,
              23
            ]
          ],
          "initialOpen": false
        },
        {
          "id": "last-return",
          "name": "last return",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              30,
              25
            ],
            [
              30,
              26
            ],
            [
              30,
              27
            ],
            [
              30,
              28
            ],
            [
              30,
              29
            ],
            [
              30,
              30
            ]
          ],
          "initialOpen": true
        },
        {
          "id": "hatch-root",
          "name": "hatch root",
          "color": [
            159,
            200,
            106
          ],
          "root": true,
          "tiles": [
            [
              20,
              28
            ],
            [
              20,
              29
            ],
            [
              20,
              30
            ],
            [
              20,
              31
            ],
            [
              20,
              32
            ]
          ],
          "initialOpen": false
        }
      ],
      "loot": [
        [
          5,
          29,
          1
        ],
        [
          10,
          4,
          3
        ],
        [
          36,
          4,
          1
        ],
        [
          32,
          27,
          3
        ],
        [
          18,
          18,
          1
        ],
        [
          18,
          30,
          1
        ]
      ],
      "guards": [
        {
          "kind": "mimic",
          "spawn": [
            8,
            16
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              8,
              16
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            13,
            4
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              13,
              4
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            26,
            4
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              26,
              4
            ]
          ]
        },
        {
          "kind": "scorpion",
          "spawn": [
            36,
            8
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              35,
              7
            ],
            [
              36,
              7
            ],
            [
              36,
              8
            ],
            [
              35,
              8
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            36,
            18
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              36,
              18
            ]
          ]
        },
        {
          "kind": "mimic",
          "spawn": [
            25,
            29
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              25,
              29
            ]
          ]
        },
        {
          "kind": "spider",
          "spawn": [
            17,
            30
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              16,
              29
            ],
            [
              17,
              29
            ],
            [
              17,
              30
            ],
            [
              16,
              30
            ]
          ]
        }
      ],
      "reactions": [
        {
          "id": "heart-offering",
          "when": "treasure",
          "at": [
            10,
            4
          ],
          "close": [
            "heart-entry"
          ],
          "open": [
            "crown-root",
            "heart-loop"
          ],
          "message": "The western offering feeds the heart. Its entry closes as the crown unfolds.",
          "objective": "Reach the crown key. Save a seed for a passage you want to hold."
        },
        {
          "id": "heart-key",
          "when": "key",
          "close": [
            "old-crown"
          ],
          "open": [
            "east-descent"
          ],
          "spawn": [
            "heart-mimic"
          ],
          "message": "The high crown draws shut. Roots unfurl into an eastern descent.",
          "objective": "Find the lower offering to release the hatch."
        },
        {
          "id": "heart-last",
          "when": "treasure",
          "at": [
            32,
            27
          ],
          "close": [
            "last-return"
          ],
          "open": [
            "hatch-root"
          ],
          "message": "The final offering seals the old return and opens the heartwood hatch path.",
          "objective": "Bring six treasure through the southern root loop to the hatch."
        }
      ],
      "reinforcements": [
        {
          "kind": "mimic",
          "spawn": [
            36,
            11
          ],
          "facing": 3.141592653589793,
          "patrol": [
            [
              36,
              11
            ]
          ],
          "id": "heart-mimic"
        }
      ]
    }
,
{
  "id": "sunken-caravan",
  "name": "The Sunken Caravan",
  "biome": "desert",
  "width": 35,
  "height": 25,
  "explore": true,
  "sightRadius": 6,
  "brief": "Cross a broken caravan canyon. Its hunters do not share their territory.",
  "hint": "Find the oasis key. The high canyon path stays open when the caravan gate falls.",
  "spawn": [
    3,
    21
  ],
  "exit": [
    29,
    21
  ],
  "key": [
    29,
    3
  ],
  "burrows": 0,
  "pebbles": 4,
  "tongues": 2,
  "requiredTreasure": 4,
  "rooms": [
    [
      2,
      18,
      8,
      22
    ],
    [
      6,
      6,
      8,
      19
    ],
    [
      6,
      3,
      16,
      6
    ],
    [
      14,
      5,
      16,
      13
    ],
    [
      14,
      11,
      25,
      13
    ],
    [
      23,
      3,
      25,
      12
    ],
    [
      23,
      2,
      32,
      5
    ],
    [
      29,
      4,
      32,
      22
    ],
    [
      20,
      19,
      31,
      22
    ],
    [
      20,
      15,
      22,
      20
    ],
    [
      7,
      15,
      21,
      17
    ],
    [
      18,
      12,
      20,
      16
    ]
  ],
  "walls": [
    [
      15,
      6
    ],
    [
      15,
      7
    ],
    [
      15,
      8
    ],
    [
      15,
      9
    ]
  ],
  "mud": [],
  "cover": [
    [
      7,
      18
    ],
    [
      7,
      6
    ],
    [
      16,
      12
    ],
    [
      24,
      5
    ],
    [
      30,
      13
    ],
    [
      22,
      20
    ]
  ],
  "gravel": [
    [
      7,
      14
    ],
    [
      7,
      13
    ],
    [
      7,
      12
    ],
    [
      7,
      11
    ]
  ],
  "cracks": [],
  "loot": [
    [
      7,
      4,
      2
    ],
    [
      17,
      12,
      2
    ],
    [
      25,
      3,
      2
    ],
    [
      30,
      16,
      2
    ],
    [
      21,
      20,
      2
    ]
  ],
  "guards": [
    {
      "id": "dune-snake",
      "kind": "snake",
      "spawn": [
        17,
        12
      ],
      "patrol": [
        [
          17,
          12
        ],
        [
          19,
          12
        ],
        [
          19,
          16
        ],
        [
          17,
          16
        ]
      ],
      "facing": 0
    },
    {
      "id": "canyon-scorpion",
      "kind": "scorpion",
      "spawn": [
        22,
        12
      ],
      "patrol": [
        [
          22,
          12
        ],
        [
          18,
          12
        ],
        [
          18,
          16
        ],
        [
          22,
          16
        ]
      ],
      "facing": 3.14159
    },
    {
      "id": "oasis-scorpion",
      "kind": "scorpion",
      "spawn": [
        31,
        7
      ],
      "patrol": [
        [
          31,
          7
        ],
        [
          31,
          10
        ]
      ],
      "facing": 1.5708
    }
  ],
  "rivalries": [
    [
      "dune-snake",
      "canyon-scorpion"
    ]
  ],
  "gates": [
    {
      "id": "caravan-gate",
      "color": [
        230,
        169,
        91
      ],
      "name": "Caravan",
      "tiles": [
        [
          15,
          15
        ],
        [
          15,
          16
        ],
        [
          15,
          17
        ]
      ],
      "initialOpen": true
    },
    {
      "id": "high-return",
      "color": [
        230,
        169,
        91
      ],
      "name": "High canyon",
      "tiles": [
        [
          21,
          16
        ]
      ],
      "initialOpen": true
    }
  ],
  "reactions": [
    {
      "id": "sandfall",
      "when": "key",
      "close": [
        "caravan-gate"
      ],
      "message": "The caravan arch collapses behind you. The high canyon still leads to the hatch.",
      "objective": "Return along the eastern canyon. Bring four treasure."
    }
  ]
},
{
  "id": "tideglass-lagoon",
  "name": "Tideglass Lagoon",
  "biome": "lagoon",
  "width": 33,
  "height": 25,
  "explore": true,
  "sightRadius": 6,
  "brief": "Island paths cross a living lagoon. Sea snakes take the water shortcut; fish cannot follow you ashore.",
  "hint": "Water slows Sally. Use islands for breath and a pebble to draw a hunter away from a crossing.",
  "spawn": [
    3,
    20
  ],
  "exit": [
    28,
    21
  ],
  "key": [
    27,
    3
  ],
  "burrows": 0,
  "pebbles": 5,
  "tongues": 3,
  "requiredTreasure": 4,
  "rooms": [
    [
      2,
      2,
      30,
      22
    ]
  ],
  "water": [
    [
      2,
      2
    ],
    [
      3,
      2
    ],
    [
      4,
      2
    ],
    [
      5,
      2
    ],
    [
      6,
      2
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
      17,
      2
    ],
    [
      18,
      2
    ],
    [
      19,
      2
    ],
    [
      20,
      2
    ],
    [
      21,
      2
    ],
    [
      30,
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
      15,
      3
    ],
    [
      16,
      3
    ],
    [
      17,
      3
    ],
    [
      18,
      3
    ],
    [
      30,
      3
    ],
    [
      7,
      4
    ],
    [
      8,
      4
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
      15,
      4
    ],
    [
      16,
      4
    ],
    [
      17,
      4
    ],
    [
      18,
      4
    ],
    [
      30,
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
      14,
      5
    ],
    [
      15,
      5
    ],
    [
      16,
      5
    ],
    [
      17,
      5
    ],
    [
      18,
      5
    ],
    [
      24,
      5
    ],
    [
      25,
      5
    ],
    [
      26,
      5
    ],
    [
      30,
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
      14,
      6
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
      17,
      6
    ],
    [
      18,
      6
    ],
    [
      24,
      6
    ],
    [
      25,
      6
    ],
    [
      26,
      6
    ],
    [
      30,
      6
    ],
    [
      2,
      7
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
      8,
      7
    ],
    [
      9,
      7
    ],
    [
      10,
      7
    ],
    [
      11,
      7
    ],
    [
      24,
      7
    ],
    [
      25,
      7
    ],
    [
      26,
      7
    ],
    [
      30,
      7
    ],
    [
      2,
      8
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
      24,
      8
    ],
    [
      25,
      8
    ],
    [
      26,
      8
    ],
    [
      30,
      8
    ],
    [
      2,
      9
    ],
    [
      6,
      9
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
      24,
      9
    ],
    [
      25,
      9
    ],
    [
      26,
      9
    ],
    [
      30,
      9
    ],
    [
      2,
      10
    ],
    [
      6,
      10
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
      9,
      10
    ],
    [
      10,
      10
    ],
    [
      21,
      10
    ],
    [
      22,
      10
    ],
    [
      30,
      10
    ],
    [
      2,
      11
    ],
    [
      6,
      11
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
      9,
      11
    ],
    [
      10,
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
      17,
      11
    ],
    [
      18,
      11
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
      30,
      11
    ],
    [
      2,
      12
    ],
    [
      10,
      12
    ],
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
    ],
    [
      30,
      12
    ],
    [
      2,
      13
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
      19,
      13
    ],
    [
      20,
      13
    ],
    [
      21,
      13
    ],
    [
      22,
      13
    ],
    [
      30,
      13
    ],
    [
      2,
      14
    ],
    [
      3,
      14
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
      18,
      14
    ],
    [
      19,
      14
    ],
    [
      20,
      14
    ],
    [
      21,
      14
    ],
    [
      22,
      14
    ],
    [
      23,
      14
    ],
    [
      24,
      14
    ],
    [
      28,
      14
    ],
    [
      29,
      14
    ],
    [
      30,
      14
    ],
    [
      2,
      15
    ],
    [
      3,
      15
    ],
    [
      4,
      15
    ],
    [
      5,
      15
    ],
    [
      6,
      15
    ],
    [
      7,
      15
    ],
    [
      15,
      15
    ],
    [
      16,
      15
    ],
    [
      17,
      15
    ],
    [
      18,
      15
    ],
    [
      19,
      15
    ],
    [
      20,
      15
    ],
    [
      21,
      15
    ],
    [
      22,
      15
    ],
    [
      23,
      15
    ],
    [
      24,
      15
    ],
    [
      28,
      15
    ],
    [
      29,
      15
    ],
    [
      30,
      15
    ],
    [
      2,
      16
    ],
    [
      3,
      16
    ],
    [
      4,
      16
    ],
    [
      5,
      16
    ],
    [
      6,
      16
    ],
    [
      7,
      16
    ],
    [
      15,
      16
    ],
    [
      16,
      16
    ],
    [
      17,
      16
    ],
    [
      18,
      16
    ],
    [
      19,
      16
    ],
    [
      20,
      16
    ],
    [
      21,
      16
    ],
    [
      22,
      16
    ],
    [
      23,
      16
    ],
    [
      24,
      16
    ],
    [
      28,
      16
    ],
    [
      29,
      16
    ],
    [
      30,
      16
    ],
    [
      2,
      17
    ],
    [
      3,
      17
    ],
    [
      4,
      17
    ],
    [
      5,
      17
    ],
    [
      15,
      17
    ],
    [
      16,
      17
    ],
    [
      17,
      17
    ],
    [
      18,
      17
    ],
    [
      19,
      17
    ],
    [
      20,
      17
    ],
    [
      21,
      17
    ],
    [
      22,
      17
    ],
    [
      23,
      17
    ],
    [
      24,
      17
    ],
    [
      28,
      17
    ],
    [
      29,
      17
    ],
    [
      30,
      17
    ],
    [
      15,
      18
    ],
    [
      16,
      18
    ],
    [
      17,
      18
    ],
    [
      18,
      18
    ],
    [
      19,
      18
    ],
    [
      20,
      18
    ],
    [
      21,
      18
    ],
    [
      22,
      18
    ],
    [
      23,
      18
    ],
    [
      24,
      18
    ],
    [
      28,
      18
    ],
    [
      29,
      18
    ],
    [
      30,
      18
    ],
    [
      13,
      19
    ],
    [
      14,
      19
    ],
    [
      15,
      19
    ],
    [
      16,
      19
    ],
    [
      17,
      19
    ],
    [
      18,
      19
    ],
    [
      19,
      19
    ],
    [
      20,
      19
    ],
    [
      21,
      19
    ],
    [
      22,
      19
    ],
    [
      23,
      19
    ],
    [
      24,
      19
    ],
    [
      8,
      20
    ],
    [
      9,
      20
    ],
    [
      10,
      20
    ],
    [
      11,
      20
    ],
    [
      12,
      20
    ],
    [
      13,
      20
    ],
    [
      14,
      20
    ],
    [
      15,
      20
    ],
    [
      16,
      20
    ],
    [
      17,
      20
    ],
    [
      18,
      20
    ],
    [
      19,
      20
    ],
    [
      20,
      20
    ],
    [
      21,
      20
    ],
    [
      22,
      20
    ],
    [
      23,
      20
    ],
    [
      24,
      20
    ],
    [
      8,
      21
    ],
    [
      9,
      21
    ],
    [
      10,
      21
    ],
    [
      11,
      21
    ],
    [
      12,
      21
    ],
    [
      13,
      21
    ],
    [
      14,
      21
    ],
    [
      15,
      21
    ],
    [
      16,
      21
    ],
    [
      17,
      21
    ],
    [
      18,
      21
    ],
    [
      19,
      21
    ],
    [
      20,
      21
    ],
    [
      21,
      21
    ],
    [
      22,
      21
    ],
    [
      23,
      21
    ],
    [
      24,
      21
    ],
    [
      8,
      22
    ],
    [
      9,
      22
    ],
    [
      10,
      22
    ],
    [
      11,
      22
    ],
    [
      12,
      22
    ],
    [
      13,
      22
    ],
    [
      14,
      22
    ],
    [
      15,
      22
    ],
    [
      16,
      22
    ],
    [
      17,
      22
    ],
    [
      18,
      22
    ],
    [
      19,
      22
    ],
    [
      20,
      22
    ],
    [
      21,
      22
    ],
    [
      22,
      22
    ],
    [
      23,
      22
    ],
    [
      24,
      22
    ]
  ],
  "walls": [
    [
      15,
      12
    ],
    [
      15,
      13
    ],
    [
      15,
      14
    ],
    [
      15,
      15
    ],
    [
      15,
      16
    ],
    [
      16,
      12
    ],
    [
      16,
      13
    ],
    [
      16,
      14
    ],
    [
      16,
      15
    ],
    [
      16,
      16
    ]
  ],
  "mud": [],
  "cover": [
    [
      5,
      20
    ],
    [
      13,
      15
    ],
    [
      20,
      7
    ],
    [
      28,
      10
    ],
    [
      26,
      20
    ]
  ],
  "gravel": [],
  "cracks": [],
  "loot": [
    [
      5,
      4,
      2
    ],
    [
      9,
      14,
      2
    ],
    [
      18,
      8,
      2
    ],
    [
      27,
      11,
      2
    ],
    [
      29,
      18,
      2
    ]
  ],
  "guards": [
    {
      "id": "reef-snake",
      "kind": "sea-snake",
      "spawn": [
        20,
        17
      ],
      "patrol": [
        [
          20,
          17
        ],
        [
          24,
          17
        ],
        [
          26,
          15
        ],
        [
          26,
          11
        ],
        [
          23,
          11
        ],
        [
          21,
          15
        ]
      ],
      "facing": 3.14159
    },
    {
      "id": "silver-fish",
      "kind": "fish",
      "spawn": [
        7,
        8
      ],
      "patrol": [
        [
          7,
          8
        ],
        [
          10,
          8
        ],
        [
          10,
          10
        ],
        [
          7,
          10
        ]
      ],
      "facing": 0
    },
    {
      "id": "deep-fish",
      "kind": "fish",
      "spawn": [
        19,
        12
      ],
      "patrol": [
        [
          19,
          12
        ],
        [
          22,
          12
        ],
        [
          22,
          16
        ],
        [
          19,
          16
        ]
      ],
      "facing": 1.5708
    }
  ],
  "gates": [],
  "reactions": [
    {
      "id": "tide-den",
      "when": "key",
      "spawn": [
        "tide-snake"
      ],
      "message": "Ripples gather by the southern reef. Something is surfacing there.",
      "objective": "Cross between islands to reach the southern hatch."
    }
  ],
  "reinforcements": [
    {
      "id": "tide-snake",
      "kind": "sea-snake",
      "spawn": [
        20,
        21
      ],
      "patrol": [
        [
          20,
          21
        ],
        [
          23,
          21
        ],
        [
          23,
          18
        ],
        [
          20,
          18
        ]
      ],
      "facing": 3.14159
    }
  ]
}
,
// The Shedding Hollow: hard tail-drop routes with regrowth bugs.
{"width":25,"height":19,"rooms":[[1,1,8,1],[10,1,23,1],[1,2,8,2],[10,2,15,2],[17,2,23,2],[1,3,5,3],[10,3,15,3],[17,3,18,3],[22,3,23,3],[1,4,5,4],[7,4,15,4],[17,4,18,4],[20,4,23,4],[1,5,5,5],[7,5,15,5],[17,5,18,5],[20,5,23,5],[3,6,3,6],[7,6,9,6],[13,6,13,6],[17,6,18,6],[20,6,21,6],[1,7,9,7],[11,7,15,7],[17,7,23,7],[1,8,9,8],[11,8,15,8],[17,8,23,8],[1,9,15,9],[17,9,23,9],[4,10,4,10],[11,10,11,10],[15,10,15,10],[20,10,20,10],[1,11,9,11],[11,11,23,11],[1,12,9,12],[11,12,23,12],[1,13,9,13],[11,13,23,13],[1,14,5,14],[9,14,9,14],[11,14,14,14],[18,14,23,14],[1,15,5,15],[7,15,7,15],[9,15,9,15],[11,15,14,15],[16,15,23,15],[1,16,9,16],[11,16,23,16],[1,17,9,17],[11,17,23,17]],"cracks":[[16,4],[10,13]],"cover":[[4,1],[12,2],[3,8],[20,8],[6,12],[20,14]],"gravel":[[10,9]],"loot":[[16,1,1],[3,3,1],[20,4,1],[6,7,1],[3,12,3],[18,13,1],[3,15,1],[23,15,1]],"regrowth":[[9,4],[15,11],[8,17]],"spawn":[1,1],"key":[21,1],"exit":[7,15],"id":"shedskin-gully","name":"Shedskin Gully","tailDrop":true,"brief":"Sally can spare one tail here, and the gully remembers it.","hint":"A catch costs your tail. Eat a glowing pink bug to grow it back.","explore":true,"sightRadius":6,"burrows":1,"pebbles":2,"tongues":1,"guards":[{"kind":"snake","spawn":[13,3],"facing":3.141592653589793,"patrol":[[11,2],[15,2],[15,5],[11,5]]},{"kind":"beetle","spawn":[20,8],"facing":3.141592653589793,"patrol":[[18,7],[22,7],[22,9],[18,9]]},{"kind":"snake","spawn":[5,12],"facing":3.141592653589793,"patrol":[[2,11],[8,11],[8,16],[2,16]]},{"kind":"scorpion","spawn":[16,16],"facing":3.141592653589793,"patrol":[[12,16],[20,16],[20,12],[12,12]]}]},
{"width":31,"height":23,"rooms":[[1,1,6,1],[8,1,22,1],[24,1,29,1],[1,2,6,2],[8,2,22,2],[24,2,29,2],[1,3,6,3],[8,3,11,3],[19,3,22,3],[24,3,29,3],[1,4,6,4],[8,4,11,4],[13,4,29,4],[1,5,6,5],[8,5,11,5],[13,5,17,5],[19,5,29,5],[3,6,3,6],[8,6,11,6],[13,6,17,6],[19,6,29,6],[1,7,11,7],[13,7,17,7],[19,7,29,7],[1,8,11,8],[14,8,14,8],[19,8,29,8],[1,9,29,9],[4,10,4,10],[11,10,15,10],[21,10,21,10],[1,11,9,11],[11,11,15,11],[17,11,19,11],[21,11,29,11],[1,12,9,12],[11,12,15,12],[17,12,19,12],[21,12,29,12],[1,13,9,13],[11,13,15,13],[17,13,19,13],[21,13,29,13],[1,14,5,14],[11,14,15,14],[18,14,18,14],[21,14,24,14],[28,14,29,14],[1,15,5,15],[7,15,24,15],[26,15,26,15],[28,15,29,15],[1,16,5,16],[7,16,24,16],[26,16,26,16],[28,16,29,16],[1,17,5,17],[7,17,24,17],[26,17,29,17],[2,18,2,18],[7,18,7,18],[12,18,13,18],[20,18,21,18],[25,18,29,18],[1,19,29,19],[1,20,29,20],[1,21,29,21]],"cracks":[[7,3],[10,13],[20,13]],"cover":[[15,1],[3,3],[23,6],[6,8],[13,12],[26,12],[18,16],[26,19]],"gravel":[[10,7]],"loot":[[26,2,1],[2,5,1],[24,8,1],[28,9,3],[3,12,1],[24,15,1],[9,16,1],[4,20,1]],"regrowth":[[15,4],[18,12],[3,16]],"spawn":[1,1],"key":[15,6],"exit":[26,15],"id":"thornback-warren","name":"Thornback Warren","tailDrop":true,"brief":"The key vault seals behind you and the warren wakes.","hint":"Taking the key opens the east door. Something stirs near the hatch.","explore":true,"sightRadius":5,"burrows":1,"pebbles":2,"tongues":1,"gates":[{"id":"south","name":"South door","color":[202,164,105],"initialOpen":true,"tiles":[[14,8]]},{"id":"east","name":"East door","color":[230,137,148],"initialOpen":false,"tiles":[[18,4]]}],"reactions":[{"id":"warren-key","when":"key","close":["south"],"open":["east"],"spawn":["warren-toad","warren-spider"],"message":"The south door slams. The east door grinds open, and the warren wakes.","objective":"Slip out the east door and circle down to the hatch."}],"guards":[{"kind":"snake","spawn":[9,9],"facing":3.141592653589793,"patrol":[[1,7],[9,7],[9,9],[1,9]]},{"kind":"scorpion","spawn":[20,9],"facing":3.141592653589793,"patrol":[[11,9],[21,9],[21,7],[11,7]]},{"kind":"toad","spawn":[29,5],"facing":3.141592653589793,"patrol":[[24,2],[29,2],[29,5],[24,5]]},{"kind":"spider","spawn":[17,16],"facing":3.141592653589793,"patrol":[[7,16],[17,16],[17,19],[7,19]]},{"kind":"beetle","spawn":[29,13],"facing":3.141592653589793,"patrol":[[22,11],[29,11],[29,13],[22,13]]}],"reinforcements":[{"kind":"toad","spawn":[21,6],"facing":3.141592653589793,"patrol":[[20,4],[22,4],[22,7],[20,7]],"id":"warren-toad"},{"kind":"spider","spawn":[28,19],"facing":3.141592653589793,"patrol":[[27,17],[29,17],[29,20],[27,20]],"id":"warren-spider"}]},
{"width":33,"height":21,"rooms":[[1,1,5,1],[7,1,31,1],[1,2,5,2],[7,2,31,2],[1,3,5,3],[7,3,23,3],[27,3,31,3],[1,4,5,4],[7,4,8,4],[13,4,23,4],[25,4,25,4],[27,4,31,4],[3,5,3,5],[7,5,8,5],[10,5,11,5],[13,5,23,5],[25,5,25,5],[27,5,31,5],[1,6,8,6],[10,6,11,6],[13,6,23,6],[25,6,25,6],[27,6,31,6],[1,7,8,7],[10,7,11,7],[13,7,29,7],[1,8,11,8],[13,8,31,8],[5,9,5,9],[13,9,23,9],[1,10,31,10],[1,11,31,11],[1,12,31,12],[5,13,5,13],[10,13,22,13],[28,13,28,13],[1,14,22,14],[24,14,26,14],[28,14,31,14],[1,15,22,15],[24,15,26,15],[28,15,31,15],[1,16,7,16],[11,16,22,16],[24,16,26,16],[28,16,31,16],[1,17,7,17],[9,17,9,17],[11,17,31,17],[1,18,7,18],[9,18,9,18],[11,18,31,18],[1,19,31,19]],"cracks":[[6,3]],"cover":[[11,2],[29,6],[3,7],[26,11],[3,15],[24,17]],"gravel":[[9,8]],"mud":[[12,10],[13,10],[14,10],[15,10],[12,11],[13,11],[14,11],[15,11],[12,12],[13,12],[14,12],[15,12]],"loot":[[3,3,1],[29,4,1],[10,6,1],[22,8,1],[3,11,3],[30,16,1],[3,18,1],[24,19,1]],"regrowth":[[25,4],[7,12],[9,17]],"spawn":[1,1],"water":[[16,1],[17,1],[18,1],[19,1],[16,2],[17,2],[18,2],[19,2],[16,3],[17,3],[18,3],[19,3],[16,4],[17,4],[18,4],[19,4],[16,5],[17,5],[18,5],[19,5],[16,7],[17,7],[18,7],[19,7],[16,8],[17,8],[18,8],[19,8],[16,9],[17,9],[18,9],[19,9],[16,10],[17,10],[18,10],[19,10],[16,11],[17,11],[18,11],[19,11],[16,12],[17,12],[18,12],[19,12],[16,13],[17,13],[18,13],[19,13],[16,14],[17,14],[18,14],[19,14],[16,15],[17,15],[18,15],[19,15],[16,16],[17,16],[18,16],[19,16],[16,18],[17,18],[18,18],[19,18],[16,19],[17,19],[18,19],[19,19]],"key":[29,1],"exit":[25,15],"id":"moltwater-steps","name":"Moltwater Steps","tailDrop":true,"requiredTreasure":5,"brief":"A slow channel splits the steps. Bring five treasure through it.","hint":"Swimming slows Sally but land hunters will not follow. Sea snakes will.","explore":true,"sightRadius":6,"burrows":1,"pebbles":2,"tongues":2,"guards":[{"kind":"snake","spawn":[4,8],"facing":3.141592653589793,"patrol":[[1,6],[8,6],[8,8],[1,8]]},{"kind":"sea-snake","spawn":[17,4],"facing":3.141592653589793,"patrol":[[17,1],[18,1],[18,12],[17,12]]},{"kind":"scorpion","spawn":[27,2],"facing":3.141592653589793,"patrol":[[21,1],[31,1],[31,3],[21,3]]},{"kind":"cricket","spawn":[26,11],"facing":3.141592653589793,"patrol":[[21,10],[31,10],[31,12],[21,12]]},{"kind":"toad","spawn":[5,15],"facing":3.141592653589793,"patrol":[[1,14],[7,14],[7,16],[1,16]]},{"kind":"spider","spawn":[28,18],"facing":3.141592653589793,"patrol":[[21,18],[31,18],[31,15],[28,15]]}]},
{"width":37,"height":27,"rooms":[[1,1,6,1],[8,1,27,1],[29,1,35,1],[1,2,6,2],[8,2,35,2],[1,3,6,3],[8,3,14,3],[19,3,27,3],[29,3,35,3],[1,4,6,4],[8,4,14,4],[16,4,17,4],[19,4,27,4],[29,4,35,4],[3,5,3,5],[8,5,14,5],[16,5,17,5],[19,5,27,5],[29,5,35,5],[1,6,14,6],[16,6,17,6],[19,6,27,6],[31,6,31,6],[1,7,14,7],[17,7,17,7],[21,7,35,7],[1,8,5,8],[12,8,35,8],[1,9,5,9],[7,9,10,9],[12,9,16,9],[24,9,28,9],[33,9,33,9],[1,10,5,10],[7,10,10,10],[12,10,16,10],[18,10,22,10],[24,10,28,10],[30,10,35,10],[1,11,5,11],[7,11,10,11],[12,11,16,11],[18,11,22,11],[24,11,28,11],[30,11,35,11],[1,12,5,12],[8,12,8,12],[12,12,16,12],[18,12,22,12],[24,12,28,12],[30,12,35,12],[1,13,17,13],[20,13,20,13],[23,13,28,13],[33,13,33,13],[4,14,4,14],[10,14,35,14],[1,15,8,15],[10,15,27,15],[33,15,35,15],[1,16,8,16],[10,16,12,16],[19,16,27,16],[29,16,31,16],[33,16,35,16],[1,17,8,17],[10,17,12,17],[14,17,17,17],[19,17,27,17],[29,17,31,17],[33,17,35,17],[1,18,8,18],[10,18,12,18],[14,18,17,18],[19,18,27,18],[29,18,31,18],[33,18,35,18],[1,19,8,19],[10,19,12,19],[14,19,17,19],[19,19,35,19],[3,20,3,20],[10,20,12,20],[15,20,15,20],[19,20,35,20],[1,21,21,21],[26,21,35,21],[1,22,21,22],[23,22,24,22],[26,22,35,22],[1,23,21,23],[23,23,24,23],[26,23,35,23],[1,24,21,24],[23,24,24,24],[26,24,35,24],[1,25,35,25]],"cracks":[[7,3],[11,10],[23,12],[9,17]],"cover":[[18,1],[3,7],[22,8],[15,14],[26,14],[3,18],[33,19],[6,23],[18,25]],"gravel":[[11,6],[30,22]],"loot":[[3,3,1],[32,4,1],[23,5,1],[3,10,3],[32,10,1],[4,16,1],[23,17,1],[34,18,1]],"regrowth":[[16,4],[8,10],[15,18],[23,23]],"spawn":[1,1],"key":[32,2],"exit":[30,17],"id":"old-shedding-tree","name":"The Old Shedding Tree","tailDrop":true,"requiredTreasure":6,"brief":"Every lizard leaves a tail here once. Bring six treasure out from under the old tree.","hint":"Find the blue switch to reach the key. Glowing bugs hide in the roots.","explore":true,"sightRadius":5,"burrows":2,"pebbles":3,"tongues":2,"gates":[{"id":"blue","name":"Blue","color":[106,195,236],"switch":[3,22],"initialOpen":false,"tiles":[[28,2]]},{"id":"roots","name":"Root door","color":[202,164,105],"initialOpen":false,"tiles":[[31,6]]}],"reactions":[{"id":"tree-key","when":"key","close":["blue"],"open":["roots"],"spawn":["tree-toad","tree-scorpion"],"message":"The blue door seals. Roots tear open to the south, and the old tree stirs.","objective":"Take the root door south, then bring six treasure to the hatch."}],"guards":[{"kind":"snake","spawn":[14,5],"facing":3.141592653589793,"patrol":[[8,1],[14,1],[14,5],[8,5]]},{"kind":"scorpion","spawn":[26,6],"facing":3.141592653589793,"patrol":[[20,2],[26,2],[26,6],[20,6]]},{"kind":"beetle","spawn":[35,8],"facing":3.141592653589793,"patrol":[[24,7],[35,7],[35,8],[24,8]]},{"kind":"toad","spawn":[5,12],"facing":3.141592653589793,"patrol":[[1,9],[5,9],[5,12],[1,12]]},{"kind":"spider","spawn":[8,25],"facing":3.141592653589793,"patrol":[[1,21],[8,21],[8,25],[1,25]]},{"kind":"cricket","spawn":[26,15],"facing":3.141592653589793,"patrol":[[10,14],[26,14],[26,15],[10,15]]},{"kind":"snake","spawn":[35,12],"facing":3.141592653589793,"patrol":[[30,10],[35,10],[35,12],[30,12]]}],"reinforcements":[{"kind":"toad","spawn":[30,8],"facing":3.141592653589793,"patrol":[[29,7],[33,7],[33,8],[29,8]],"id":"tree-toad"},{"kind":"scorpion","spawn":[34,17],"facing":3.141592653589793,"patrol":[[33,15],[35,15],[35,19],[33,19]],"id":"tree-scorpion"}]}
// End of the Shedding Hollow.
,
// The Lantern Marsh: night routes that mix earlier mechanics.
{"width":29,"height":21,"rooms":[[1,1,6,1],[8,1,21,1],[23,1,27,1],[1,2,6,2],[8,2,21,2],[23,2,27,2],[1,3,6,3],[8,3,21,3],[23,3,27,3],[1,4,6,4],[8,4,21,4],[23,4,27,4],[1,5,6,5],[8,5,27,5],[3,6,3,6],[8,6,21,6],[26,6,26,6],[1,7,27,7],[1,8,27,8],[1,9,27,9],[1,10,27,10],[1,11,27,11],[1,12,27,12],[4,13,4,13],[11,13,18,13],[26,13,26,13],[1,14,9,14],[11,14,18,14],[20,14,27,14],[1,15,9,15],[11,15,18,15],[20,15,27,15],[1,16,9,16],[11,16,18,16],[20,16,27,16],[1,17,9,17],[11,17,18,17],[20,17,27,17],[1,18,9,18],[11,18,18,18],[20,18,27,18],[1,19,9,19],[11,19,18,19],[20,19,27,19]],"cracks":[[7,3],[22,4],[10,15],[19,15]],"cover":[[5,8],[21,9],[3,17],[24,18]],"gravel":[],"loot":[[20,1,1],[2,5,1],[26,5,1],[8,7,1],[3,11,3],[21,11,1],[8,17,1],[22,17,1]],"regrowth":[[2,15],[26,15]],"spawn":[1,1],"key":[25,2],"exit":[6,18],"gaps":[[14,1],[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[14,10],[14,11],[14,12],[14,13],[14,14],[14,15],[14,16],[14,17],[14,18],[14,19]],"glowPlants":[[3,3],[18,3],[24,7],[10,9],[6,15],[23,15]],"id":"firefly-ford","name":"Firefly Ford","unlockAfter":"old-shedding-tree","dark":true,"explore":true,"sightRadius":3.1,"brief":"A black river and one floating plank. Moths follow every glowing footprint.","hint":"Stand on a lantern plate to raise the plank. Moths follow glowing footprints; the owl watches the whole ford.","burrows":1,"pebbles":2,"tongues":2,"gates":[{"id":"ford","name":"ford","color":[240,196,96],"tiles":[[14,9]],"plates":[[12,9],[16,9]],"duration":7,"bridge":true}],"guards":[{"kind":"moth","spawn":[19,3],"facing":3.141592653589793,"patrol":[[17,2],[20,2],[20,5],[17,5]]},{"kind":"moth","spawn":[23,10],"facing":3.141592653589793,"patrol":[[21,8],[26,8],[26,11],[21,11]]},{"kind":"spider","spawn":[5,10],"facing":3.141592653589793,"patrol":[[3,8],[9,8],[9,11],[3,11]]},{"kind":"moth","spawn":[24,16],"facing":3.141592653589793,"patrol":[[21,15],[27,15],[27,18],[21,18]]},{"kind":"owl","spawn":[20,9],"facing":3.141592653589793,"patrol":[[16,9],[24,9],[20,4]]}],"tailDrop":true},
{"width":31,"height":19,"rooms":[[1,1,6,1],[8,1,14,1],[16,1,22,1],[24,1,29,1],[1,2,6,2],[8,2,14,2],[16,2,22,2],[24,2,29,2],[1,3,6,3],[8,3,14,3],[16,3,22,3],[24,3,29,3],[1,4,29,4],[1,5,6,5],[8,5,14,5],[16,5,22,5],[24,5,29,5],[1,6,6,6],[8,6,14,6],[16,6,22,6],[24,6,29,6],[4,7,4,7],[10,7,10,7],[18,7,18,7],[24,7,24,7],[1,8,29,8],[1,9,29,9],[1,10,29,10],[5,11,5,11],[15,11,15,11],[21,11,21,11],[27,11,27,11],[1,12,7,12],[9,12,15,12],[17,12,23,12],[25,12,29,12],[1,13,7,13],[9,13,15,13],[17,13,23,13],[25,13,29,13],[1,14,7,14],[9,14,15,14],[17,14,23,14],[25,14,29,14],[1,15,7,15],[9,15,15,15],[17,15,23,15],[25,15,29,15],[1,16,7,16],[9,16,15,16],[17,16,23,16],[25,16,29,16],[1,17,23,17],[25,17,29,17]],"cracks":[[8,13],[24,13]],"cover":[[19,2],[3,3],[15,9],[3,15],[12,15]],"gravel":[[9,9],[23,9]],"loot":[[11,2,1],[27,6,1],[4,9,1],[28,9,3],[12,13,1],[28,13,1],[20,15,1],[12,17,1]],"regrowth":[[4,13],[20,13]],"spawn":[1,1],"key":[26,2],"exit":[27,16],"id":"bramble-switchyard","name":"Bramble Switchyard","explore":true,"sightRadius":5,"brief":"Three bramble doors, each held open by a plate. Hunters wait in every yard.","hint":"Step on a plate to open its door for six seconds. Every door has a plate on both sides.","burrows":1,"pebbles":3,"tongues":1,"gates":[{"id":"west-door","name":"west","color":[214,160,92],"tiles":[[7,4]],"plates":[[5,5],[9,5]],"duration":6},{"id":"middle-door","name":"middle","color":[214,160,92],"tiles":[[15,4]],"plates":[[13,5],[17,5]],"duration":6},{"id":"east-door","name":"east","color":[214,160,92],"tiles":[[23,4]],"plates":[[21,5],[25,5]],"duration":6}],"guards":[{"kind":"toad","spawn":[13,3],"facing":3.141592653589793,"patrol":[[9,1],[13,1],[13,6],[9,6]]},{"kind":"spider","spawn":[21,2],"facing":3.141592653589793,"patrol":[[17,1],[21,1],[21,6],[17,6]]},{"kind":"beetle","spawn":[28,9],"facing":3.141592653589793,"patrol":[[1,8],[29,8],[29,10],[1,10]]},{"kind":"snake","spawn":[14,12],"facing":3.141592653589793,"patrol":[[9,12],[15,12],[15,17],[9,17]]},{"kind":"toad","spawn":[27,12],"facing":3.141592653589793,"patrol":[[25,12],[29,12],[29,15],[25,15]]},{"kind":"owl","spawn":[15,10],"facing":3.141592653589793,"patrol":[[4,9],[10,7],[27,9]]}],"tailDrop":true},
{"width":29,"height":19,"rooms":[[1,1,7,1],[9,1,17,1],[19,1,27,1],[1,2,7,2],[9,2,17,2],[19,2,27,2],[1,3,7,3],[9,3,17,3],[19,3,27,3],[1,4,7,4],[9,4,17,4],[19,4,27,4],[1,5,7,5],[9,5,17,5],[19,5,27,5],[3,6,3,6],[11,6,11,6],[21,6,21,6],[25,6,25,6],[1,7,27,7],[1,8,27,8],[1,9,27,9],[6,10,6,10],[14,10,14,10],[25,10,25,10],[1,11,11,11],[13,11,21,11],[23,11,27,11],[1,12,11,12],[13,12,21,12],[23,12,27,12],[1,13,11,13],[13,13,21,13],[23,13,27,13],[1,14,11,14],[13,14,21,14],[23,14,27,14],[1,15,11,15],[13,15,21,15],[23,15,27,15],[1,16,11,16],[13,16,27,16],[1,17,11,17],[13,17,21,17],[23,17,27,17]],"cracks":[[8,4],[12,14]],"cover":[[7,8],[23,8],[6,14]],"gravel":[],"loot":[[12,2,1],[14,2,1],[25,4,1],[3,8,1],[26,8,1],[17,12,1],[3,16,3],[10,16,1]],"regrowth":[[2,12],[25,12]],"spawn":[1,1],"key":[23,2],"exit":[25,15],"id":"snapdragon-terrace","name":"Snapdragon Terrace","living":true,"explore":true,"sightRadius":5,"brief":"Some of these flowers bite. When the key moves, the terrace roots move too.","hint":"Biting plants open before they lunge. Seeds grow cover or brace a root door open.","burrows":1,"pebbles":2,"tongues":1,"seeds":2,"shrubs":[[3,3],[22,4],[6,12]],"gates":[{"id":"key-root","name":"key root","color":[159,200,106],"root":true,"tiles":[[25,6]],"initialOpen":true},{"id":"hatch-root","name":"hatch root","color":[159,200,106],"root":true,"tiles":[[25,10]],"initialOpen":false}],"reactions":[{"id":"terrace-key","when":"key","close":["key-root"],"open":["hatch-root"],"message":"The key root coils shut. Below, the hatch root draws back.","objective":"Head down to the hatch: through the hatch root, or round by the middle terrace."}],"guards":[{"kind":"mimic","spawn":[13,4],"facing":3.141592653589793,"patrol":[[13,4]]},{"kind":"mimic","spawn":[15,8],"facing":3.141592653589793,"patrol":[[15,8]]},{"kind":"mimic","spawn":[18,14],"facing":3.141592653589793,"patrol":[[18,14]]},{"kind":"snake","spawn":[20,8],"facing":3.141592653589793,"patrol":[[17,7],[27,7],[27,9],[17,9]]},{"kind":"spider","spawn":[4,14],"facing":3.141592653589793,"patrol":[[2,12],[9,12],[9,16],[2,16]]}],"tailDrop":true},
{"width":31,"height":19,"rooms":[[1,1,6,1],[8,1,18,1],[20,1,24,1],[26,1,29,1],[1,2,6,2],[8,2,18,2],[20,2,24,2],[26,2,29,2],[1,3,6,3],[8,3,18,3],[20,3,24,3],[26,3,29,3],[1,4,6,4],[12,4,12,4],[20,4,24,4],[26,4,29,4],[1,5,17,5],[19,5,29,5],[1,6,17,6],[19,6,29,6],[4,7,4,7],[12,7,12,7],[17,7,17,7],[24,7,24,7],[1,8,29,8],[1,9,29,9],[1,10,29,10],[4,11,4,11],[15,11,15,11],[23,11,23,11],[1,12,9,12],[11,12,19,12],[21,12,29,12],[1,13,9,13],[11,13,19,13],[21,13,29,13],[1,14,9,14],[11,14,19,14],[21,14,29,14],[1,15,9,15],[11,15,19,15],[21,15,29,15],[1,16,9,16],[11,16,19,16],[21,16,29,16],[1,17,9,17],[11,17,19,17],[21,17,29,17]],"cracks":[[25,4],[10,14],[20,15]],"cover":[[3,3],[25,5],[14,9],[4,15],[15,15],[25,17]],"gravel":[[4,9],[24,9]],"loot":[[13,2,1],[28,3,1],[6,6,1],[27,12,1],[6,13,3],[15,13,1],[26,15,1],[5,17,1]],"regrowth":[[3,13],[24,13]],"spawn":[1,1],"key":[22,2],"exit":[13,17],"id":"rival-rooftops","name":"Rival Rooftops","explore":true,"sightRadius":6,"brief":"Two pairs of hunters share their roads and hate it. Let them fight.","hint":"When rival hunters meet they clash for a few seconds. Slip past while they are busy.","burrows":1,"pebbles":2,"tongues":1,"guards":[{"kind":"snake","spawn":[2,8],"facing":3.141592653589793,"patrol":[[1,8],[29,8],[29,10],[1,10]],"id":"roof-snake"},{"kind":"scorpion","spawn":[28,10],"facing":3.141592653589793,"patrol":[[29,10],[29,8],[1,8],[1,10]],"id":"roof-scorpion"},{"kind":"toad","spawn":[14,13],"facing":3.141592653589793,"patrol":[[11,12],[19,12],[19,16],[11,16]],"id":"yard-toad"},{"kind":"beetle","spawn":[19,16],"facing":3.141592653589793,"patrol":[[19,16],[19,12],[11,12],[11,16]],"id":"yard-beetle"},{"kind":"spider","spawn":[22,2],"facing":3.141592653589793,"patrol":[[20,1],[24,1],[24,6],[20,6]]}],"rivalries":[["roof-snake","roof-scorpion"],["yard-toad","yard-beetle"]],"tailDrop":true},
{"width":37,"height":25,"rooms":[[1,1,6,1],[8,1,16,1],[18,1,24,1],[26,1,35,1],[1,2,6,2],[8,2,16,2],[18,2,24,2],[26,2,35,2],[1,3,6,3],[8,3,24,3],[26,3,35,3],[1,4,6,4],[8,4,16,4],[18,4,24,4],[26,4,35,4],[1,5,6,5],[11,5,11,5],[18,5,24,5],[28,5,28,5],[1,6,35,6],[1,7,35,7],[9,8,9,8],[20,8,20,8],[25,8,25,8],[1,9,8,9],[10,9,18,9],[20,9,23,9],[25,9,35,9],[1,10,8,10],[10,10,18,10],[20,10,23,10],[25,10,35,10],[1,11,8,11],[10,11,23,11],[25,11,35,11],[1,12,8,12],[10,12,18,12],[20,12,23,12],[25,12,35,12],[1,13,8,13],[10,13,18,13],[20,13,23,13],[25,13,35,13],[2,14,2,14],[10,14,10,14],[20,14,20,14],[30,14,30,14],[1,15,35,15],[1,16,35,16],[1,17,35,17],[4,18,4,18],[20,18,20,18],[33,18,33,18],[1,19,10,19],[12,19,20,19],[22,19,35,19],[1,20,10,20],[12,20,20,20],[22,20,35,20],[1,21,10,21],[12,21,20,21],[22,21,35,21],[1,22,10,22],[12,22,20,22],[22,22,35,22],[1,23,10,23],[12,23,20,23],[22,23,35,23]],"cracks":[[7,3],[24,11],[11,22],[21,22]],"cover":[[21,2],[3,3],[25,6],[30,10],[4,12],[14,13],[13,16],[27,20],[5,22]],"gravel":[[11,7],[29,7],[24,16]],"loot":[[12,2,1],[2,5,1],[14,10,3],[32,12,1],[5,16,1],[32,16,1],[32,20,1],[16,22,1]],"regrowth":[[3,10],[21,10],[16,20]],"spawn":[1,1],"key":[30,2],"exit":[4,20],"id":"moonwell-keep","name":"Moonwell Keep","explore":true,"sightRadius":5,"requiredTreasure":7,"brief":"The marsh keeps its oldest well behind two doors. Bring seven treasure home.","hint":"The east gate holds while the key sleeps. The well chest opens the old cellar.","burrows":2,"pebbles":3,"tongues":2,"gates":[{"id":"east-gate","name":"east gate","color":[106,195,236],"tiles":[[17,3]],"initialOpen":true},{"id":"cellar","name":"cellar","color":[202,164,105],"tiles":[[19,11]],"initialOpen":false}],"reactions":[{"id":"keep-key","when":"key","close":["east-gate"],"spawn":["keep-toad"],"message":"The east gate drops behind you. A toad wakes in the courtyard.","objective":"Go down through the courtyard. The well chest opens the cellar."},{"id":"keep-chest","when":"treasure","at":[14,10],"open":["cellar"],"spawn":["keep-spider"],"message":"The well chest clicks. The cellar door grinds open, and silk stirs below.","objective":"Bring seven treasure to the hatch in the south-west."}],"guards":[{"kind":"snake","spawn":[12,3],"facing":3.141592653589793,"patrol":[[9,1],[15,1],[15,4],[9,4]]},{"kind":"scorpion","spawn":[28,7],"facing":3.141592653589793,"patrol":[[19,6],[34,6],[34,7],[19,7]]},{"kind":"beetle","spawn":[18,16],"facing":3.141592653589793,"patrol":[[2,15],[34,15],[34,17],[2,17]]},{"kind":"toad","spawn":[30,11],"facing":3.141592653589793,"patrol":[[27,9],[34,9],[34,12],[27,12]]},{"kind":"spider","spawn":[6,11],"facing":3.141592653589793,"patrol":[[1,9],[8,9],[8,12],[1,12]]},{"kind":"snake","spawn":[30,21],"facing":3.141592653589793,"patrol":[[24,19],[35,19],[35,22],[24,22]]},{"kind":"cricket","spawn":[16,21],"facing":3.141592653589793,"patrol":[[13,19],[19,19],[19,22],[13,22]]},{"kind":"owl","spawn":[18,16],"facing":3.141592653589793,"patrol":[[2,16],[20,14],[34,16]]}],"reinforcements":[{"kind":"toad","spawn":[22,6],"facing":3.141592653589793,"patrol":[[20,5],[24,5],[24,7],[20,7]],"id":"keep-toad"},{"kind":"spider","spawn":[8,20],"facing":3.141592653589793,"patrol":[[6,19],[10,19],[10,22],[6,22]],"id":"keep-spider"}],"tailDrop":true}
// End of the Lantern Marsh.
,
// Sunbaked Rooftops: hawks overhead and camouflage underfoot.
{"width":25,"height":17,"rooms":[[1,1,6,1],[8,1,23,1],[1,2,6,2],[8,2,23,2],[1,3,6,3],[8,3,14,3],[16,3,23,3],[1,4,6,4],[8,4,14,4],[16,4,23,4],[3,5,3,5],[9,5,9,5],[20,5,20,5],[1,6,23,6],[1,7,23,7],[1,8,23,8],[4,9,4,9],[14,9,14,9],[20,9,20,9],[1,10,7,10],[9,10,15,10],[17,10,23,10],[1,11,23,11],[1,12,7,12],[9,12,15,12],[17,12,23,12],[1,13,7,13],[9,13,15,13],[17,13,23,13],[1,14,7,14],[9,14,15,14],[17,14,23,14],[1,15,7,15],[9,15,15,15],[17,15,23,15]],"cracks":[[7,3],[8,14],[16,14]],"cover":[[19,3],[3,7],[12,13]],"gravel":[],"loot":[[11,3,1],[3,4,1],[16,7,1],[22,8,1],[2,11,3],[12,11,1],[21,11,1],[20,15,1]],"regrowth":[],"spawn":[1,1],"key":[23,1],"exit":[4,14],"id":"sunbaked-ledge","name":"Sunbaked Ledge","unlockAfter":"canopy-crown","unlockChallenges":4,"explore":true,"sightRadius":6,"brief":"Hot tiles, striped awnings and a shadow in the sky.","hint":"When the hawk\u2019s shadow circles you, keep moving, get under an awning, or press X and keep still.","burrows":1,"pebbles":2,"tongues":1,"camos":2,"hawk":{"every":9,"warn":2.2,"first":16},"guards":[{"kind":"snake","spawn":[12,2],"facing":3.141592653589793,"patrol":[[9,1],[13,1],[13,4],[9,4]]},{"kind":"snake","spawn":[12,7],"facing":3.141592653589793,"patrol":[[3,7],[21,7]]},{"kind":"beetle","spawn":[12,11],"facing":3.141592653589793,"patrol":[[9,10],[15,10],[15,14],[9,14]]}],"tailDrop":true,"shade":[[1,1],[15,1],[1,2],[15,2],[8,6],[17,6],[8,8],[17,8],[8,11],[16,11],[4,13],[20,13]]},
{"width":29,"height":17,"rooms":[[1,1,7,1],[9,1,17,1],[19,1,27,1],[1,2,7,2],[9,2,17,2],[19,2,27,2],[1,3,7,3],[9,3,17,3],[19,3,27,3],[1,4,7,4],[9,4,17,4],[19,4,27,4],[1,5,7,5],[9,5,17,5],[19,5,27,5],[4,6,4,6],[12,6,12,6],[22,6,22,6],[1,7,27,7],[1,8,27,8],[1,9,27,9],[4,10,4,10],[9,10,9,10],[21,10,21,10],[1,11,7,11],[9,11,15,11],[17,11,27,11],[1,12,7,12],[9,12,15,12],[17,12,27,12],[1,13,7,13],[9,13,15,13],[17,13,27,13],[1,14,7,14],[9,14,15,14],[17,14,27,14],[1,15,7,15],[9,15,15,15],[17,15,27,15]],"cracks":[[18,3],[8,4],[8,13],[16,14]],"cover":[[4,4],[13,8],[21,12]],"gravel":[],"loot":[[13,2,1],[23,5,1],[3,8,1],[24,8,3],[26,11,1],[12,12,1],[4,14,1],[23,15,1]],"regrowth":[],"spawn":[1,1],"key":[27,1],"exit":[3,15],"id":"laundry-lines","name":"Laundry Lines","explore":true,"sightRadius":6,"brief":"Washing lines throw stripes of shade across the long yard.","hint":"Awnings hide you from the hawk but not from hunters on the ground.","burrows":1,"pebbles":2,"tongues":1,"camos":2,"hawk":{"every":8,"warn":2,"first":16},"guards":[{"kind":"beetle","spawn":[14,8],"facing":3.141592653589793,"patrol":[[1,8],[27,8]]},{"kind":"snake","spawn":[13,2],"facing":3.141592653589793,"patrol":[[10,1],[16,1],[16,5],[10,5]]},{"kind":"snake","spawn":[24,12],"facing":3.141592653589793,"patrol":[[18,11],[27,11],[27,15],[18,15]]},{"kind":"spider","spawn":[12,13],"facing":3.141592653589793,"patrol":[[10,11],[14,11],[14,15],[10,15]]}],"tailDrop":true,"shade":[[1,1],[1,2],[23,3],[13,4],[8,7],[16,7],[24,7],[8,9],[16,9],[24,9],[3,12],[12,14],[22,14]]},
{"width":31,"height":17,"rooms":[[1,1,7,1],[9,1,15,1],[17,1,23,1],[25,1,29,1],[1,2,29,2],[1,3,7,3],[9,3,15,3],[17,3,23,3],[25,3,29,3],[1,4,7,4],[9,4,15,4],[17,4,23,4],[25,4,29,4],[1,5,7,5],[9,5,15,5],[17,5,23,5],[25,5,29,5],[4,6,4,6],[12,6,12,6],[20,6,20,6],[1,7,29,7],[1,8,29,8],[1,9,29,9],[5,10,5,10],[15,10,15,10],[23,10,23,10],[1,11,9,11],[11,11,21,11],[23,11,29,11],[1,12,9,12],[11,12,21,12],[23,12,29,12],[1,13,9,13],[11,13,21,13],[23,13,29,13],[1,14,9,14],[11,14,21,14],[23,14,29,14],[1,15,9,15],[11,15,21,15],[23,15,29,15]],"cracks":[[10,12],[22,12]],"cover":[[20,3],[3,4],[5,14]],"gravel":[[15,8]],"loot":[[12,3,1],[27,4,1],[3,8,1],[27,8,3],[6,12,1],[26,12,1],[12,13,1],[16,14,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[3,15],"id":"chimney-run","name":"Chimney Run","explore":true,"sightRadius":6,"brief":"Three chimney doors, each held open by a hot plate, under an open sky.","hint":"A plate holds its door for six seconds. Standing on a plate leaves you exposed to the hawk.","burrows":1,"pebbles":2,"tongues":1,"camos":3,"hawk":{"every":7,"warn":2,"first":16},"gates":[{"id":"west","name":"west","color":[214,120,80],"tiles":[[8,2]],"plates":[[6,3],[10,3]],"duration":6},{"id":"middle","name":"middle","color":[214,120,80],"tiles":[[16,2]],"plates":[[14,3],[18,3]],"duration":6},{"id":"east","name":"east","color":[214,120,80],"tiles":[[24,2]],"plates":[[22,3],[26,3]],"duration":6}],"guards":[{"kind":"snake","spawn":[27,13],"facing":3.141592653589793,"patrol":[[24,11],[29,11],[29,15],[24,15]]},{"kind":"beetle","spawn":[15,8],"facing":3.141592653589793,"patrol":[[1,8],[29,8]]},{"kind":"scorpion","spawn":[16,13],"facing":3.141592653589793,"patrol":[[12,11],[20,11],[20,15],[12,15]]}],"tailDrop":true,"shade":[[1,1],[1,2],[12,5],[20,5],[8,8],[22,8],[3,12],[16,12],[26,14]]},
{"width":31,"height":17,"rooms":[[1,1,6,1],[8,1,24,1],[26,1,29,1],[1,2,6,2],[8,2,29,2],[1,3,6,3],[8,3,24,3],[26,3,29,3],[1,4,6,4],[8,4,24,4],[26,4,29,4],[1,5,6,5],[8,5,24,5],[26,5,29,5],[3,6,3,6],[12,6,12,6],[18,6,18,6],[27,6,27,6],[1,7,29,7],[1,8,29,8],[1,9,29,9],[7,10,7,10],[15,10,15,10],[23,10,23,10],[1,11,7,11],[9,11,21,11],[23,11,29,11],[1,12,7,12],[9,12,21,12],[23,12,29,12],[1,13,7,13],[9,13,21,13],[23,13,29,13],[1,14,7,14],[9,14,21,14],[23,14,29,14],[1,15,7,15],[9,15,21,15],[23,15,29,15]],"cracks":[[7,3],[8,12],[22,12]],"cover":[[17,3],[13,14]],"gravel":[[15,8]],"loot":[[3,4,1],[13,4,1],[28,4,1],[3,8,3],[26,8,1],[4,13,1],[17,14,1],[24,15,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[25,14],"id":"pigeon-court","name":"Pigeon Court","explore":true,"sightRadius":6,"brief":"Take the key and the roof door slams. Something wakes on the court.","hint":"The key closes the west door of the roost and opens its south hatch.","burrows":1,"pebbles":2,"tongues":1,"camos":2,"hawk":{"every":7,"warn":1.9,"first":16},"gates":[{"id":"roost-west","name":"roost west","color":[214,120,80],"tiles":[[25,2]],"initialOpen":true},{"id":"roost-south","name":"roost south","color":[214,120,80],"tiles":[[27,6]],"initialOpen":false}],"reactions":[{"id":"roost-key","when":"key","close":["roost-west"],"open":["roost-south"],"spawn":["court-toad"],"message":"The roost door slams. The south hatch swings open and a toad lands on the court.","objective":"Drop through the south hatch and cross the court to the hatch."}],"guards":[{"kind":"snake","spawn":[13,3],"facing":3.141592653589793,"patrol":[[9,1],[17,1],[17,5],[9,5]]},{"kind":"beetle","spawn":[15,8],"facing":3.141592653589793,"patrol":[[1,8],[29,8]]},{"kind":"scorpion","spawn":[15,12],"facing":3.141592653589793,"patrol":[[10,11],[20,11],[20,15],[10,15]]},{"kind":"spider","spawn":[20,3],"facing":3.141592653589793,"patrol":[[19,1],[24,1],[24,5],[19,5]]}],"reinforcements":[{"kind":"toad","spawn":[24,8],"facing":3.141592653589793,"patrol":[[21,7],[28,7],[28,9],[21,9]],"id":"court-toad"}],"tailDrop":true,"shade":[[1,1],[1,2],[11,2],[19,2],[11,5],[19,5],[9,8],[21,8],[3,12],[15,12],[26,12]]},
{"width":35,"height":21,"rooms":[[1,1,7,1],[9,1,19,1],[21,1,26,1],[28,1,33,1],[1,2,7,2],[9,2,19,2],[21,2,33,2],[1,3,7,3],[9,3,19,3],[21,3,26,3],[28,3,33,3],[1,4,7,4],[9,4,19,4],[21,4,26,4],[28,4,33,4],[1,5,7,5],[9,5,19,5],[21,5,26,5],[28,5,33,5],[4,6,4,6],[14,6,14,6],[25,6,25,6],[31,6,31,6],[1,7,33,7],[1,8,33,8],[1,9,33,9],[7,10,7,10],[19,10,19,10],[28,10,28,10],[1,11,9,11],[11,11,19,11],[21,11,33,11],[1,12,9,12],[11,12,19,12],[21,12,33,12],[1,13,9,13],[11,13,19,13],[21,13,33,13],[1,14,9,14],[11,14,19,14],[21,14,33,14],[1,15,9,15],[11,15,19,15],[21,15,33,15],[4,16,4,16],[26,16,26,16],[1,17,33,17],[1,18,33,18],[1,19,33,19]],"cracks":[[8,3],[20,4],[10,13],[20,14]],"cover":[[23,2],[6,14],[19,18]],"gravel":[[21,8]],"loot":[[3,4,1],[14,4,1],[30,4,1],[9,8,1],[15,12,3],[3,14,1],[28,14,1],[31,18,1]],"regrowth":[],"spawn":[1,1],"key":[33,1],"exit":[3,18],"id":"weathervane-spire","name":"Weathervane Spire","explore":true,"sightRadius":6,"requiredTreasure":6,"brief":"The highest roof in the marsh, and the hawk\u2019s favourite perch. Bring six treasure down.","hint":"The hawk dives often here. Plan your stops under awnings and save camouflage for the long runs.","burrows":2,"pebbles":3,"tongues":2,"camos":3,"hawk":{"every":6,"warn":1.7,"first":16},"gates":[{"id":"spire-door","name":"spire door","color":[214,120,80],"tiles":[[27,2]],"initialOpen":true},{"id":"spire-stair","name":"spire stair","color":[214,120,80],"tiles":[[31,6]],"initialOpen":false}],"reactions":[{"id":"spire-key","when":"key","close":["spire-door"],"open":["spire-stair"],"spawn":["spire-scorpion","spire-toad"],"message":"The spire door locks behind you. A stair drops open, and the roof wakes.","objective":"Take the stair down, gather six treasure and reach the hatch."}],"guards":[{"kind":"snake","spawn":[14,3],"facing":3.141592653589793,"patrol":[[10,1],[18,1],[18,5],[10,5]]},{"kind":"beetle","spawn":[17,8],"facing":3.141592653589793,"patrol":[[1,8],[33,8]]},{"kind":"spider","spawn":[24,2],"facing":3.141592653589793,"patrol":[[22,1],[26,1],[26,5],[22,5]]},{"kind":"scorpion","spawn":[15,13],"facing":3.141592653589793,"patrol":[[12,11],[18,11],[18,15],[12,15]]},{"kind":"snake","spawn":[27,12],"facing":3.141592653589793,"patrol":[[22,11],[33,11],[33,15],[22,15]]},{"kind":"beetle","spawn":[17,18],"facing":3.141592653589793,"patrol":[[1,18],[33,18]]}],"reinforcements":[{"kind":"scorpion","spawn":[21,8],"facing":3.141592653589793,"patrol":[[19,7],[23,7],[23,9],[19,9]],"id":"spire-scorpion"},{"kind":"toad","spawn":[6,12],"facing":3.141592653589793,"patrol":[[2,11],[8,11],[8,15],[2,15]],"id":"spire-toad"}],"tailDrop":true,"shade":[[1,1],[1,2],[13,2],[13,5],[3,8],[15,8],[27,8],[4,12],[26,12],[15,14],[11,18],[28,18]]}
// End of Sunbaked Rooftops.
,
// Ant Kingdom: marching columns and gecko thieves.
{"width":27,"height":17,"rooms":[[1,1,5,1],[7,1,17,1],[19,1,25,1],[1,2,17,2],[19,2,25,2],[1,3,5,3],[7,3,17,3],[19,3,25,3],[14,4,14,4],[22,4,22,4],[1,5,25,5],[1,6,2,6],[14,6,14,6],[24,6,25,6],[1,7,2,7],[4,7,10,7],[12,7,16,7],[18,7,22,7],[24,7,25,7],[1,8,2,8],[4,8,10,8],[12,8,16,8],[18,8,22,8],[24,8,25,8],[1,9,2,9],[4,9,10,9],[12,9,16,9],[18,9,22,9],[24,9,25,9],[1,10,2,10],[4,10,10,10],[12,10,16,10],[18,10,22,10],[24,10,25,10],[1,11,2,11],[9,11,9,11],[19,11,19,11],[24,11,25,11],[1,12,25,12],[9,13,9,13],[19,13,19,13],[1,14,10,14],[12,14,25,14],[1,15,10,15],[12,15,25,15]],"cracks":[[11,9],[17,10]],"cover":[[3,3],[14,3],[20,8],[16,15]],"gravel":[],"loot":[[12,2,1],[22,2,1],[6,8,1],[20,9,1],[3,15,3],[14,15,1],[21,15,1],[24,15,1]],"regrowth":[],"spawn":[1,1],"key":[14,8],"exit":[8,15],"id":"anthill-gate","name":"Anthill Gate","unlockAfter":"split-jaw","unlockChallenges":8,"explore":true,"sightRadius":6,"brief":"A ring of marching ants circles the key. Nothing stops them.","hint":"Ants follow the worn trail and walk over anything, hidden or not. Cross in the gaps between groups.","burrows":2,"pebbles":2,"tongues":1,"antTrails":[{"path":[[2,5],[24,5],[24,12],[2,12]],"groups":4,"size":4,"speed":1.6}],"guards":[{"kind":"snake","spawn":[12,1],"facing":3.141592653589793,"patrol":[[10,1],[16,1]]},{"kind":"beetle","spawn":[18,14],"facing":3.141592653589793,"patrol":[[13,14],[25,14]]}],"tailDrop":true},
{"width":29,"height":17,"rooms":[[1,1,6,1],[8,1,16,1],[18,1,27,1],[1,2,6,2],[8,2,16,2],[18,2,27,2],[1,3,6,3],[8,3,16,3],[18,3,27,3],[1,4,6,4],[8,4,27,4],[1,5,6,5],[8,5,16,5],[18,5,27,5],[3,6,3,6],[11,6,11,6],[21,6,21,6],[1,7,27,7],[1,8,27,8],[1,9,27,9],[5,10,5,10],[17,10,17,10],[24,10,24,10],[1,11,9,11],[11,11,19,11],[21,11,27,11],[1,12,9,12],[11,12,19,12],[21,12,27,12],[1,13,9,13],[11,13,19,13],[21,13,27,13],[1,14,9,14],[11,14,19,14],[21,14,27,14],[1,15,9,15],[11,15,19,15],[21,15,27,15]],"cracks":[[7,3],[20,12],[10,14]],"cover":[[3,3],[22,5],[5,14],[15,14]],"gravel":[[11,8],[19,8]],"loot":[[10,2,1],[14,2,1],[12,4,1],[3,8,1],[25,8,1],[3,12,3],[14,12,1],[24,12,1]],"regrowth":[],"spawn":[1,1],"key":[22,2],"exit":[24,14],"id":"sugar-store","name":"Sugar Store","explore":true,"sightRadius":6,"requiredTreasure":4,"brief":"The store room glitters, and something with quick feet lives under the floor.","hint":"A gecko darts at Sally while she carries treasure and steals the last piece. Touch it before it gets home.","burrows":2,"pebbles":2,"tongues":2,"gates":[{"id":"store-door","name":"store door","color":[214,150,80],"tiles":[[17,4]],"initialOpen":true}],"guards":[{"kind":"gecko","spawn":[12,1],"facing":3.141592653589793,"patrol":[[12,1]]},{"kind":"beetle","spawn":[14,8],"facing":3.141592653589793,"patrol":[[1,8],[27,8]]},{"kind":"snake","spawn":[24,4],"facing":3.141592653589793,"patrol":[[19,1],[27,1],[27,5],[19,5]]},{"kind":"gecko","spawn":[15,14],"facing":3.141592653589793,"patrol":[[15,14]]}],"tailDrop":true},
{"width":31,"height":17,"rooms":[[1,1,6,1],[8,1,24,1],[26,1,29,1],[1,2,6,2],[8,2,24,2],[26,2,29,2],[1,3,6,3],[8,3,24,3],[26,3,29,3],[1,4,6,4],[8,4,24,4],[26,4,29,4],[3,5,3,5],[8,5,24,5],[29,5,29,5],[1,6,29,6],[1,7,7,7],[13,7,19,7],[25,7,29,7],[1,8,7,8],[9,8,11,8],[13,8,19,8],[21,8,23,8],[25,8,29,8],[1,9,7,9],[9,9,11,9],[13,9,19,9],[21,9,23,9],[25,9,29,9],[1,10,7,10],[9,10,11,10],[13,10,19,10],[21,10,23,10],[25,10,29,10],[1,11,7,11],[10,11,10,11],[13,11,19,11],[22,11,22,11],[25,11,29,11],[1,12,29,12],[4,13,4,13],[24,13,24,13],[1,14,13,14],[15,14,29,14],[1,15,13,15],[15,15,29,15]],"cracks":[[7,3],[25,3],[14,15]],"cover":[[3,3],[16,9],[3,11],[27,11],[8,15],[26,15]],"gravel":[],"loot":[[13,2,1],[21,2,1],[28,4,1],[3,7,1],[28,7,3],[10,9,1],[22,9,1],[21,15,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[3,15],"id":"marching-tunnels","name":"Marching Tunnels","explore":true,"sightRadius":6,"brief":"Two columns march through the same hall in opposite loops.","hint":"Watch both columns at the crossings. A gap in one can be a wall of ants in the other.","burrows":2,"pebbles":2,"tongues":1,"antTrails":[{"path":[[13,2],[19,2],[19,12],[13,12]],"groups":2,"size":4,"speed":1.5},{"path":[[2,6],[28,6],[28,12],[2,12]],"groups":3,"size":4,"speed":1.7,"offset":9}],"guards":[{"kind":"spider","spawn":[16,9],"facing":3.141592653589793,"patrol":[[14,8],[18,8],[18,10],[14,10]]},{"kind":"snake","spawn":[6,14],"facing":3.141592653589793,"patrol":[[1,14],[13,14]]},{"kind":"spider","spawn":[28,3],"facing":3.141592653589793,"patrol":[[27,1],[29,1],[29,4],[27,4]]}],"tailDrop":true},
{"width":31,"height":16,"rooms":[[1,1,6,1],[8,1,16,1],[18,1,22,1],[24,1,29,1],[1,2,6,2],[8,2,16,2],[18,2,29,2],[1,3,6,3],[8,3,16,3],[18,3,22,3],[24,3,29,3],[1,4,6,4],[8,4,16,4],[18,4,22,4],[24,4,29,4],[1,5,6,5],[8,5,16,5],[18,5,22,5],[24,5,29,5],[3,6,3,6],[10,6,10,6],[19,6,19,6],[25,6,25,6],[28,6,28,6],[1,7,29,7],[1,8,29,8],[1,9,29,9],[7,10,7,10],[17,10,17,10],[27,10,27,10],[1,11,9,11],[11,11,19,11],[21,11,29,11],[1,12,9,12],[11,12,19,12],[21,12,29,12],[1,13,9,13],[11,13,19,13],[21,13,29,13],[1,14,9,14],[11,14,19,14],[21,14,29,14]],"cracks":[[7,3],[17,4],[20,12],[10,13]],"cover":[[3,3],[18,8],[4,12],[15,14]],"gravel":[[8,8],[25,8]],"loot":[[11,2,1],[20,2,1],[13,4,1],[3,8,1],[28,8,3],[15,12,1],[25,12,1],[26,14,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[3,14],"id":"thieves-gallery","name":"Thieves' Gallery","explore":true,"sightRadius":6,"brief":"Two geckos share this gallery, and the vault door only opens one way.","hint":"The key shuts the vault\u2019s west door and opens its south hatch. Guard your treasure on the way out.","burrows":2,"pebbles":2,"tongues":2,"gates":[{"id":"vault-west","name":"vault west","color":[214,150,80],"tiles":[[23,2]],"initialOpen":true},{"id":"vault-south","name":"vault south","color":[214,150,80],"tiles":[[28,6]],"initialOpen":false}],"reactions":[{"id":"vault-key","when":"key","close":["vault-west"],"open":["vault-south"],"message":"The vault west door slams. The south hatch drops open.","objective":"Drop through the south hatch and bring the key home."}],"antTrails":[{"path":[[1,7],[29,7],[29,9],[1,9]],"groups":3,"size":4,"speed":1.6}],"guards":[{"kind":"gecko","spawn":[12,1],"facing":3.141592653589793,"patrol":[[12,1]]},{"kind":"gecko","spawn":[15,13],"facing":3.141592653589793,"patrol":[[15,13]]},{"kind":"scorpion","spawn":[5,12],"facing":3.141592653589793,"patrol":[[2,11],[8,11],[8,13],[2,13]]}],"tailDrop":true},
{"width":35,"height":19,"rooms":[[1,1,7,1],[9,1,21,1],[23,1,33,1],[1,2,7,2],[9,2,21,2],[23,2,33,2],[1,3,7,3],[9,3,33,3],[1,4,7,4],[9,4,21,4],[23,4,33,4],[1,5,7,5],[9,5,21,5],[23,5,33,5],[4,6,4,6],[13,6,13,6],[25,6,25,6],[30,6,30,6],[1,7,33,7],[1,8,33,8],[1,9,33,9],[6,10,6,10],[18,10,18,10],[28,10,28,10],[1,11,10,11],[12,11,22,11],[24,11,33,11],[1,12,10,12],[12,12,22,12],[24,12,33,12],[1,13,10,13],[12,13,22,13],[24,13,33,13],[1,14,10,14],[12,14,22,14],[24,14,33,14],[5,15,5,15],[19,15,19,15],[29,15,29,15],[1,16,33,16],[1,17,33,17]],"cracks":[[8,3],[11,12],[23,12]],"cover":[[3,3],[13,4],[27,5],[4,12],[17,14],[13,17]],"gravel":[[10,8],[26,8]],"loot":[[14,2,1],[18,4,1],[3,8,1],[31,8,3],[17,12,1],[30,12,1],[3,14,1],[25,17,1]],"regrowth":[],"spawn":[1,1],"key":[33,1],"exit":[3,17],"id":"queens-chamber","name":"The Queen's Chamber","explore":true,"sightRadius":6,"requiredTreasure":6,"brief":"The heart of the kingdom. Columns everywhere, a thief in the walls, and the queen\u2019s guard waking.","hint":"The key wakes the guard below. Time the columns, guard your pockets, and bring six treasure.","burrows":3,"pebbles":3,"tongues":2,"gates":[{"id":"throne-west","name":"throne west","color":[214,150,80],"tiles":[[22,3]],"initialOpen":true},{"id":"throne-stair","name":"throne stair","color":[214,150,80],"tiles":[[30,6]],"initialOpen":false}],"reactions":[{"id":"queen-key","when":"key","close":["throne-west"],"open":["throne-stair"],"spawn":["queen-guard","queen-spider"],"message":"The throne door seals. The stair opens, and the queen\u2019s guard wakes.","objective":"Take the stair down, gather six treasure and reach the hatch."}],"antTrails":[{"path":[[1,7],[33,7],[33,9],[1,9]],"groups":4,"size":4,"speed":1.7},{"path":[[1,16],[33,16]],"groups":2,"size":5,"speed":1.5}],"guards":[{"kind":"gecko","spawn":[17,4],"facing":3.141592653589793,"patrol":[[17,4]]},{"kind":"snake","spawn":[12,2],"facing":3.141592653589793,"patrol":[[9,1],[16,1],[16,5],[9,5]]},{"kind":"scorpion","spawn":[17,13],"facing":3.141592653589793,"patrol":[[13,11],[21,11],[21,14],[13,14]]},{"kind":"beetle","spawn":[28,12],"facing":3.141592653589793,"patrol":[[25,11],[33,11],[33,14],[25,14]]},{"kind":"gecko","spawn":[8,13],"facing":3.141592653589793,"patrol":[[8,13]]}],"reinforcements":[{"kind":"scorpion","spawn":[6,12],"facing":3.141592653589793,"patrol":[[2,11],[9,11],[9,13],[2,13]],"id":"queen-guard"},{"kind":"spider","spawn":[28,3],"facing":3.141592653589793,"patrol":[[25,2],[31,2],[31,4],[25,4]],"id":"queen-spider"}],"tailDrop":true}
// End of the Ant Kingdom.
,
// Frost Hollow: cold rooms, warm stones and frost owls.
{"width":27,"height":16,"rooms":[[1,1,6,1],[8,1,22,1],[24,1,25,1],[1,2,6,2],[8,2,22,2],[24,2,25,2],[1,3,6,3],[8,3,22,3],[24,3,25,3],[1,4,6,4],[8,4,25,4],[1,5,6,5],[8,5,22,5],[24,5,25,5],[3,6,3,6],[8,6,22,6],[1,7,25,7],[1,8,25,8],[1,9,25,9],[4,10,4,10],[14,10,14,10],[20,10,20,10],[1,11,9,11],[11,11,17,11],[19,11,25,11],[1,12,9,12],[11,12,17,12],[19,12,25,12],[1,13,9,13],[11,13,17,13],[19,13,25,13],[1,14,9,14],[11,14,17,14],[19,14,25,14]],"cracks":[[7,3],[10,12],[18,13]],"cover":[[3,3],[10,8],[22,12],[14,14]],"gravel":[],"loot":[[13,4,1],[17,4,1],[3,5,1],[3,8,1],[18,8,1],[3,12,3],[14,12,1],[22,14,1]],"regrowth":[],"spawn":[1,1],"key":[25,2],"exit":[3,14],"id":"frostbite-steps","name":"Frostbite Steps","unlockAfter":"moonwell-keep","explore":true,"sightRadius":6,"brief":"One frozen hall between Sally and the key. Warm stones glow in the ice.","hint":"The pale room drains your warmth. Cold Sally is slow and cannot sprint; warm stones thaw her fast.","burrows":1,"pebbles":2,"tongues":1,"cold":[[8,1,22,6]],"gates":[{"id":"ice-door","name":"ice door","color":[150,200,240],"tiles":[[23,4]],"initialOpen":true}],"guards":[{"kind":"snake","spawn":[15,3],"facing":3.141592653589793,"patrol":[[9,1],[21,1],[21,5],[9,5]]},{"kind":"beetle","spawn":[13,8],"facing":3.141592653589793,"patrol":[[1,8],[25,8]]},{"kind":"snake","spawn":[22,12],"facing":3.141592653589793,"patrol":[[19,11],[25,11],[25,14],[19,14]]}],"tailDrop":true,"warm":[[11,2],[19,2],[11,6],[19,6]]},
{"width":29,"height":15,"rooms":[[1,1,6,1],[8,1,17,1],[19,1,27,1],[1,2,6,2],[8,2,17,2],[19,2,27,2],[1,3,6,3],[8,3,17,3],[19,3,27,3],[1,4,6,4],[8,4,17,4],[19,4,27,4],[3,5,3,5],[12,5,12,5],[24,5,24,5],[1,6,27,6],[1,7,27,7],[1,8,27,8],[5,9,5,9],[17,9,17,9],[24,9,24,9],[1,10,9,10],[11,10,19,10],[21,10,27,10],[1,11,9,11],[11,11,19,11],[21,11,27,11],[1,12,9,12],[11,12,19,12],[21,12,27,12],[1,13,9,13],[11,13,19,13],[21,13,27,13]],"cracks":[[7,3],[18,3],[10,11],[20,12]],"cover":[[3,3],[15,13],[24,13]],"gravel":[],"loot":[[12,4,1],[23,4,1],[3,7,1],[25,7,3],[14,8,1],[15,11,1],[24,11,1],[6,13,1]],"regrowth":[],"spawn":[1,1],"key":[26,2],"exit":[3,13],"id":"icicle-gallery","name":"Icicle Gallery","explore":true,"sightRadius":6,"brief":"A long frozen gallery watched by frost owls.","hint":"Owls see far down a narrow beam. The cold hall slows you, so plan warm stops out of their sight.","burrows":1,"pebbles":3,"tongues":1,"cold":[[1,6,27,8],[19,1,27,4]],"guards":[{"kind":"owl","spawn":[14,7],"facing":3.141592653589793,"patrol":[[2,7],[12,5],[26,7]]},{"kind":"snake","spawn":[12,2],"facing":3.141592653589793,"patrol":[[9,1],[16,1],[16,4],[9,4]]},{"kind":"owl","spawn":[22,1],"facing":3.141592653589793,"patrol":[[20,4],[26,4]]},{"kind":"scorpion","spawn":[15,12],"facing":3.141592653589793,"patrol":[[12,10],[18,10],[18,13],[12,13]]}],"tailDrop":true,"warm":[[12,2],[23,2],[9,7],[19,7],[4,11]]},
{"width":31,"height":16,"rooms":[[1,1,7,1],[9,1,15,1],[17,1,23,1],[25,1,29,1],[1,2,29,2],[1,3,7,3],[9,3,15,3],[17,3,23,3],[25,3,29,3],[1,4,7,4],[9,4,15,4],[17,4,23,4],[25,4,29,4],[1,5,7,5],[9,5,15,5],[17,5,23,5],[25,5,29,5],[4,6,4,6],[1,7,29,7],[1,8,29,8],[1,9,29,9],[5,10,5,10],[15,10,15,10],[23,10,23,10],[1,11,9,11],[11,11,21,11],[23,11,29,11],[1,12,9,12],[11,12,21,12],[23,12,29,12],[1,13,9,13],[11,13,21,13],[23,13,29,13],[1,14,9,14],[11,14,21,14],[23,14,29,14]],"cracks":[[10,12],[22,12]],"cover":[[3,3],[18,8],[16,14]],"gravel":[],"loot":[[5,4,1],[12,4,1],[27,4,1],[3,8,1],[26,8,3],[6,12,1],[16,12,1],[26,12,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[3,14],"id":"frozen-plates","name":"Frozen Plates","explore":true,"sightRadius":6,"brief":"Three ice doors, each held by a plate in a freezing room.","hint":"Waiting on a plate in the cold costs warmth. Thaw on the stones between doors.","burrows":1,"pebbles":2,"tongues":1,"cold":[[9,1,23,5],[1,7,29,9]],"gates":[{"id":"west","name":"west","color":[150,200,240],"tiles":[[8,2]],"plates":[[6,3],[10,3]],"duration":6},{"id":"middle","name":"middle","color":[150,200,240],"tiles":[[16,2]],"plates":[[14,3],[18,3]],"duration":6},{"id":"east","name":"east","color":[150,200,240],"tiles":[[24,2]],"plates":[[22,3],[26,3]],"duration":6}],"guards":[{"kind":"snake","spawn":[12,5],"facing":3.141592653589793,"patrol":[[10,5],[14,5]]},{"kind":"beetle","spawn":[15,8],"facing":3.141592653589793,"patrol":[[1,8],[29,8]]},{"kind":"scorpion","spawn":[16,12],"facing":3.141592653589793,"patrol":[[12,11],[20,11],[20,14],[12,14]]}],"tailDrop":true,"warm":[[12,3],[20,3],[8,8],[3,12],[26,14]]},
{"width":31,"height":16,"rooms":[[1,1,6,1],[8,1,24,1],[26,1,29,1],[1,2,6,2],[8,2,29,2],[1,3,6,3],[8,3,24,3],[26,3,29,3],[1,4,6,4],[8,4,24,4],[26,4,29,4],[1,5,6,5],[8,5,24,5],[26,5,29,5],[3,6,3,6],[11,6,11,6],[18,6,18,6],[26,6,26,6],[1,7,29,7],[1,8,29,8],[1,9,29,9],[7,10,7,10],[17,10,17,10],[27,10,27,10],[1,11,9,11],[11,11,19,11],[21,11,29,11],[1,12,9,12],[11,12,19,12],[21,12,29,12],[1,13,9,13],[11,13,19,13],[21,13,29,13],[1,14,9,14],[11,14,19,14],[21,14,29,14]],"cracks":[[7,3],[10,12],[20,12]],"cover":[[3,3],[15,3],[15,14]],"gravel":[],"loot":[[3,4,1],[13,4,1],[19,4,1],[28,4,1],[3,8,3],[26,8,1],[15,12,1],[25,12,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[3,14],"id":"snowdrift-vault","name":"Snowdrift Vault","explore":true,"sightRadius":6,"brief":"The vault door freezes shut behind the key. The way out is colder still.","hint":"The key seals the vault\u2019s west door and opens a south hatch into the frozen hall.","burrows":1,"pebbles":2,"tongues":2,"cold":[[8,1,24,5],[1,7,29,9]],"gates":[{"id":"vault-west","name":"vault west","color":[150,200,240],"tiles":[[25,2]],"initialOpen":true},{"id":"vault-hatch","name":"vault hatch","color":[150,200,240],"tiles":[[26,6]],"initialOpen":false}],"reactions":[{"id":"snow-key","when":"key","close":["vault-west"],"open":["vault-hatch"],"spawn":["vault-owl"],"message":"The vault door freezes shut. A hatch cracks open, and an owl settles over the hall.","objective":"Drop through the hatch and cross the frozen hall."}],"guards":[{"kind":"snake","spawn":[16,3],"facing":3.141592653589793,"patrol":[[9,1],[23,1],[23,5],[9,5]]},{"kind":"beetle","spawn":[15,8],"facing":3.141592653589793,"patrol":[[1,8],[29,8]]},{"kind":"scorpion","spawn":[15,12],"facing":3.141592653589793,"patrol":[[12,11],[18,11],[18,13],[12,13]]},{"kind":"snake","spawn":[25,12],"facing":3.141592653589793,"patrol":[[22,11],[28,11],[28,14],[22,14]]}],"reinforcements":[{"kind":"owl","spawn":[15,9],"facing":3.141592653589793,"patrol":[[3,8],[15,7],[27,8]],"id":"vault-owl"}],"tailDrop":true,"warm":[[11,2],[19,2],[9,8],[19,8],[4,12],[26,14]]},
{"width":35,"height":19,"rooms":[[1,1,7,1],[9,1,19,1],[21,1,33,1],[1,2,7,2],[9,2,19,2],[21,2,33,2],[1,3,7,3],[9,3,33,3],[1,4,7,4],[9,4,19,4],[21,4,33,4],[1,5,7,5],[9,5,19,5],[21,5,33,5],[4,6,4,6],[14,6,14,6],[25,6,25,6],[30,6,30,6],[1,7,33,7],[1,8,33,8],[1,9,33,9],[6,10,6,10],[18,10,18,10],[28,10,28,10],[1,11,10,11],[12,11,22,11],[24,11,33,11],[1,12,10,12],[12,12,22,12],[24,12,33,12],[1,13,10,13],[12,13,22,13],[24,13,33,13],[1,14,10,14],[12,14,22,14],[24,14,33,14],[5,15,5,15],[19,15,19,15],[29,15,29,15],[1,16,33,16],[1,17,33,17]],"cracks":[[8,3],[11,12],[23,12]],"cover":[[3,3],[13,5],[17,14]],"gravel":[],"loot":[[3,4,1],[14,4,1],[26,4,1],[3,8,1],[30,8,3],[17,12,1],[30,12,1],[25,17,1]],"regrowth":[],"spawn":[1,1],"key":[33,1],"exit":[3,17],"id":"winter-heart","name":"Winter Heart","explore":true,"sightRadius":6,"requiredTreasure":6,"brief":"The coldest place on the trail. Six treasure lie between the frozen halls.","hint":"Every hall is cold. Hop between warm stones, and let the snakes crawl while you sprint warm.","burrows":2,"pebbles":3,"tongues":2,"cold":[[9,1,19,5],[1,7,33,9],[1,16,33,17]],"gates":[{"id":"heart-west","name":"heart west","color":[150,200,240],"tiles":[[20,3]],"initialOpen":true},{"id":"heart-stair","name":"heart stair","color":[150,200,240],"tiles":[[30,6]],"initialOpen":false}],"reactions":[{"id":"heart-key","when":"key","close":["heart-west"],"open":["heart-stair"],"spawn":["heart-owl","heart-scorpion"],"message":"The heart door freezes shut. The stair cracks open, and the cold wakes.","objective":"Take the stair down, gather six treasure and reach the hatch."}],"guards":[{"kind":"snake","spawn":[14,3],"facing":3.141592653589793,"patrol":[[10,1],[18,1],[18,5],[10,5]]},{"kind":"owl","spawn":[18,8],"facing":3.141592653589793,"patrol":[[2,8],[18,7],[32,8]]},{"kind":"scorpion","spawn":[17,13],"facing":3.141592653589793,"patrol":[[13,11],[21,11],[21,14],[13,14]]},{"kind":"beetle","spawn":[28,12],"facing":3.141592653589793,"patrol":[[25,11],[33,11],[33,14],[25,14]]},{"kind":"snake","spawn":[17,16],"facing":3.141592653589793,"patrol":[[1,16],[33,16]]}],"reinforcements":[{"kind":"owl","spawn":[26,4],"facing":3.141592653589793,"patrol":[[22,2],[32,2],[27,5]],"id":"heart-owl"},{"kind":"scorpion","spawn":[6,12],"facing":3.141592653589793,"patrol":[[2,11],[9,11],[9,13],[2,13]],"id":"heart-scorpion"}],"tailDrop":true,"warm":[[13,2],[28,2],[10,8],[20,8],[4,12],[28,14],[13,17]]}
// End of Frost Hollow.
,
// Steam Vents: timed jets that block lanes and daze hunters.
{"width":27,"height":13,"rooms":[[1,1,6,1],[8,1,10,1],[12,1,16,1],[18,1,22,1],[24,1,25,1],[1,2,6,2],[8,2,22,2],[24,2,25,2],[1,3,6,3],[8,3,25,3],[1,4,6,4],[8,4,22,4],[24,4,25,4],[3,5,3,5],[8,5,10,5],[12,5,16,5],[18,5,22,5],[1,6,25,6],[1,7,25,7],[5,8,5,8],[11,8,11,8],[17,8,17,8],[22,8,22,8],[1,9,9,9],[11,9,17,9],[19,9,25,9],[1,10,9,10],[11,10,17,10],[19,10,25,10],[1,11,9,11],[11,11,17,11],[19,11,25,11]],"cracks":[[7,3],[10,10],[18,10]],"cover":[[3,3],[10,7],[14,11]],"gravel":[],"loot":[[10,4,1],[16,4,1],[21,4,1],[3,7,1],[18,7,1],[3,10,3],[14,10,1],[22,10,1]],"regrowth":[],"spawn":[1,1],"key":[25,2],"exit":[3,11],"id":"kettle-works","name":"Kettle Works","unlockAfter":"weathervane-spire","unlockChallenges":12,"explore":true,"sightRadius":6,"brief":"Brass vents hiss across the boiler hall. Learn their rhythm.","hint":"A vent hisses, then fires steam down its lane. Steam blows Sally clear and dazes any hunter it hits.","burrows":1,"pebbles":2,"tongues":1,"vents":[{"at":[11,1],"dir":[0,1],"length":4,"period":5,"on":1.6,"offset":0.0},{"at":[17,1],"dir":[0,1],"length":4,"period":5,"on":1.6,"offset":1.25},{"at":[11,5],"dir":[0,-1],"length":4,"period":5,"on":1.6,"offset":2.5},{"at":[17,5],"dir":[0,-1],"length":4,"period":5,"on":1.6,"offset":3.75}],"gates":[{"id":"boiler-door","name":"boiler door","color":[214,150,96],"tiles":[[23,3]],"initialOpen":true}],"guards":[{"kind":"snake","spawn":[14,3],"facing":3.141592653589793,"patrol":[[9,2],[21,2],[21,3],[9,3]]},{"kind":"beetle","spawn":[12,7],"facing":3.141592653589793,"patrol":[[1,7],[25,7]]},{"kind":"snake","spawn":[22,10],"facing":3.141592653589793,"patrol":[[19,9],[25,9],[25,11],[19,11]]}],"tailDrop":true},
{"width":29,"height":13,"rooms":[[1,1,6,1],[8,1,12,1],[14,1,20,1],[22,1,27,1],[1,2,6,2],[8,2,27,2],[1,3,6,3],[8,3,27,3],[1,4,6,4],[8,4,27,4],[3,5,3,5],[8,5,12,5],[14,5,20,5],[22,5,27,5],[1,6,27,6],[1,7,27,7],[7,8,7,8],[19,8,19,8],[25,8,25,8],[1,9,9,9],[11,9,19,9],[21,9,27,9],[1,10,9,10],[11,10,19,10],[21,10,27,10],[1,11,9,11],[11,11,19,11],[21,11,27,11]],"cracks":[[7,3],[10,10],[20,10]],"cover":[[14,7]],"gravel":[],"loot":[[15,2,1],[3,4,1],[15,4,1],[25,4,1],[3,7,1],[24,7,3],[15,10,1],[26,11,1]],"regrowth":[],"spawn":[1,1],"key":[25,3],"exit":[3,11],"shade":[[1,1],[1,2],[12,3],[20,3],[12,6],[20,6],[4,10],[24,10],[15,11]],"id":"pressure-pipes","name":"Pressure Pipes","explore":true,"sightRadius":6,"brief":"Steam below, a hawk above. Shade, steam and timing.","hint":"Steam jets and the hawk both force you to move. Awnings keep the hawk off; nothing stops the steam.","burrows":1,"pebbles":2,"tongues":1,"camos":2,"vents":[{"at":[13,1],"dir":[0,1],"length":4,"period":5.5,"on":1.8,"offset":0.0},{"at":[21,1],"dir":[0,1],"length":4,"period":5.5,"on":1.8,"offset":1.4},{"at":[13,5],"dir":[0,-1],"length":4,"period":5.5,"on":1.8,"offset":2.8},{"at":[21,5],"dir":[0,-1],"length":4,"period":5.5,"on":1.8,"offset":4.2}],"hawk":{"every":9,"warn":2.2,"first":16},"guards":[{"kind":"snake","spawn":[16,3],"facing":3.141592653589793,"patrol":[[9,2],[24,2],[24,4],[9,4]]},{"kind":"beetle","spawn":[20,7],"facing":3.141592653589793,"patrol":[[14,7],[27,7]]},{"kind":"scorpion","spawn":[15,10],"facing":3.141592653589793,"patrol":[[12,9],[18,9],[18,11],[12,11]]}],"tailDrop":true},
{"width":31,"height":14,"rooms":[[1,1,7,1],[9,1,13,1],[15,1,21,1],[23,1,29,1],[1,2,7,2],[9,2,29,2],[1,3,7,3],[9,3,29,3],[1,4,7,4],[9,4,29,4],[4,5,4,5],[9,5,13,5],[15,5,21,5],[23,5,27,5],[1,6,29,6],[1,7,10,7],[12,7,20,7],[22,7,29,7],[1,8,29,8],[6,9,6,9],[20,9,20,9],[26,9,26,9],[1,10,9,10],[11,10,20,10],[22,10,29,10],[1,11,9,11],[11,11,20,11],[22,11,29,11],[1,12,9,12],[11,12,20,12],[22,12,29,12]],"cracks":[[8,3],[10,11],[21,11]],"cover":[[3,3],[18,3],[4,11],[15,12]],"gravel":[],"loot":[[3,4,1],[13,4,1],[23,4,1],[3,7,1],[26,7,3],[15,11,1],[26,11,1],[24,12,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[3,12],"id":"boiler-owls","name":"Boiler Owls","explore":true,"sightRadius":6,"brief":"Owls nest on the warm pipes, watching the vents for prey.","hint":"A pebble draws an owl\u2019s glare. Steam does not trouble owls, but it does trouble everything else.","burrows":1,"pebbles":3,"tongues":1,"vents":[{"at":[14,1],"dir":[0,1],"length":4,"period":5,"on":1.6,"offset":0.0},{"at":[22,1],"dir":[0,1],"length":4,"period":5,"on":1.6,"offset":1.1},{"at":[14,5],"dir":[0,-1],"length":4,"period":5,"on":1.6,"offset":2.2},{"at":[22,5],"dir":[0,-1],"length":4,"period":5,"on":1.6,"offset":3.3},{"at":[11,7],"dir":[1,0],"length":6,"period":5,"on":1.6,"offset":4.4},{"at":[21,7],"dir":[-1,0],"length":6,"period":5,"on":1.6,"offset":5.5}],"guards":[{"kind":"owl","spawn":[18,3],"facing":3.141592653589793,"patrol":[[10,2],[18,1],[28,2]]},{"kind":"owl","spawn":[16,6],"facing":3.141592653589793,"patrol":[[2,7],[16,8],[28,7]]},{"kind":"snake","spawn":[26,4],"facing":3.141592653589793,"patrol":[[26,2],[29,2],[29,4],[26,4]]},{"kind":"scorpion","spawn":[15,11],"facing":3.141592653589793,"patrol":[[12,10],[19,10],[19,12],[12,12]]}],"tailDrop":true},
{"width":31,"height":14,"rooms":[[1,1,6,1],[8,1,13,1],[15,1,22,1],[24,1,29,1],[1,2,6,2],[8,2,29,2],[1,3,6,3],[8,3,29,3],[1,4,6,4],[8,4,29,4],[3,5,3,5],[8,5,13,5],[15,5,22,5],[24,5,29,5],[1,6,29,6],[1,7,29,7],[1,8,29,8],[4,9,4,9],[15,9,15,9],[23,9,23,9],[1,10,9,10],[11,10,19,10],[21,10,29,10],[1,11,9,11],[11,11,19,11],[21,11,29,11],[1,12,9,12],[11,12,19,12],[21,12,29,12]],"cracks":[[7,3],[10,11],[20,11]],"cover":[[3,3],[10,7],[22,7],[15,12]],"gravel":[],"loot":[[12,4,1],[19,4,1],[26,4,1],[3,7,1],[27,7,3],[4,11,1],[15,11,1],[25,11,1]],"regrowth":[],"spawn":[1,1],"key":[29,1],"exit":[3,12],"id":"ant-furnace","name":"Ant Furnace","explore":true,"sightRadius":6,"brief":"The ants march through the furnace hall, steam or not.","hint":"Steam blocks a lane but ants walk straight through it. Watch both rhythms at once.","burrows":1,"pebbles":2,"tongues":1,"vents":[{"at":[14,1],"dir":[0,1],"length":4,"period":5.5,"on":1.8,"offset":0.0},{"at":[23,1],"dir":[0,1],"length":4,"period":5.5,"on":1.8,"offset":1.6},{"at":[14,5],"dir":[0,-1],"length":4,"period":5.5,"on":1.8,"offset":3.2},{"at":[23,5],"dir":[0,-1],"length":4,"period":5.5,"on":1.8,"offset":4.8}],"antTrails":[{"path":[[1,6],[29,6],[29,8],[1,8]],"groups":3,"size":4,"speed":1.5}],"guards":[{"kind":"snake","spawn":[18,3],"facing":3.141592653589793,"patrol":[[9,2],[27,2],[27,4],[9,4]]},{"kind":"beetle","spawn":[15,11],"facing":3.141592653589793,"patrol":[[11,11],[19,11]]},{"kind":"spider","spawn":[25,11],"facing":3.141592653589793,"patrol":[[22,10],[28,10],[28,12],[22,12]]}],"tailDrop":true},
{"width":35,"height":18,"rooms":[[1,1,7,1],[9,1,13,1],[15,1,22,1],[24,1,25,1],[27,1,33,1],[1,2,7,2],[9,2,25,2],[27,2,33,2],[1,3,7,3],[9,3,33,3],[1,4,7,4],[9,4,25,4],[27,4,33,4],[4,5,4,5],[9,5,13,5],[15,5,22,5],[24,5,25,5],[29,5,29,5],[1,6,33,6],[1,7,8,7],[10,7,28,7],[30,7,33,7],[1,8,33,8],[6,9,6,9],[18,9,18,9],[28,9,28,9],[1,10,10,10],[12,10,22,10],[24,10,33,10],[1,11,10,11],[12,11,22,11],[24,11,33,11],[1,12,10,12],[12,12,22,12],[24,12,33,12],[1,13,10,13],[12,13,22,13],[24,13,33,13],[5,14,5,14],[19,14,19,14],[29,14,29,14],[1,15,33,15],[1,16,33,16]],"cracks":[[8,3],[11,11],[23,11]],"cover":[[3,3],[18,3],[21,7],[4,11],[17,13],[14,16]],"gravel":[],"loot":[[3,4,1],[13,4,1],[20,4,1],[3,7,1],[17,11,3],[30,11,1],[3,13,1],[25,16,1]],"regrowth":[],"spawn":[1,1],"key":[32,1],"exit":[3,16],"id":"great-boiler","name":"The Great Boiler","explore":true,"sightRadius":6,"requiredTreasure":6,"brief":"The heart of the works. Every pipe is hissing, and the boiler wakes when the key moves.","hint":"The key seals the boiler door and opens the stair. Use the steam to clear hunters from your path.","burrows":2,"pebbles":3,"tongues":2,"vents":[{"at":[14,1],"dir":[0,1],"length":4,"period":5,"on":1.7,"offset":0.0},{"at":[23,1],"dir":[0,1],"length":4,"period":5,"on":1.7,"offset":1.3},{"at":[14,5],"dir":[0,-1],"length":4,"period":5,"on":1.7,"offset":2.6},{"at":[23,5],"dir":[0,-1],"length":4,"period":5,"on":1.7,"offset":3.9},{"at":[9,7],"dir":[1,0],"length":7,"period":5,"on":1.7,"offset":5.2},{"at":[29,7],"dir":[-1,0],"length":7,"period":5,"on":1.7,"offset":6.5}],"gates":[{"id":"boiler-west","name":"boiler west","color":[214,150,96],"tiles":[[26,3]],"initialOpen":true},{"id":"boiler-stair","name":"boiler stair","color":[214,150,96],"tiles":[[30,5]],"initialOpen":false}],"reactions":[{"id":"boiler-key","when":"key","close":["boiler-west"],"open":["boiler-stair"],"spawn":["boiler-owl","boiler-scorpion"],"message":"The boiler door seals with a bang. The stair opens, and the works wake.","objective":"Take the stair down, gather six treasure and reach the hatch."}],"guards":[{"kind":"snake","spawn":[16,3],"facing":3.141592653589793,"patrol":[[9,2],[24,2],[24,4],[9,4]]},{"kind":"beetle","spawn":[17,6],"facing":3.141592653589793,"patrol":[[1,6],[33,6]]},{"kind":"scorpion","spawn":[17,12],"facing":3.141592653589793,"patrol":[[13,10],[21,10],[21,13],[13,13]]},{"kind":"snake","spawn":[32,12],"facing":3.141592653589793,"patrol":[[31,10],[33,10],[33,13],[31,13]]},{"kind":"beetle","spawn":[18,15],"facing":3.141592653589793,"patrol":[[1,15],[33,15]]}],"reinforcements":[{"kind":"owl","spawn":[17,8],"facing":3.141592653589793,"patrol":[[3,7],[17,6],[31,7]],"id":"boiler-owl"},{"kind":"scorpion","spawn":[6,12],"facing":3.141592653589793,"patrol":[[2,10],[9,10],[9,13],[2,13]],"id":"boiler-scorpion"}],"tailDrop":true}
// End of Steam Vents.
  ];
  const challenges=[
    {id:'ghost-run',name:'Ghost Run',levelId:'leafy-crossroads',brief:'Reach the hatch without letting a guard give chase.',noChase:true},
    {id:'treasure-sweep',name:'Treasure Sweep',levelId:'crumbling-hall',brief:'Bring every piece of treasure to the hatch.',allTreasure:true},
    {id:'quick-getaway',name:'Quick Getaway',levelId:'moonlit-escape',brief:'Get the key and reach the hatch within 45 seconds.',timeLimit:45},
    {id:'garden-dash',name:'Garden Dash',levelId:'switchback-garden',brief:'Open the blue gates, grab the key and escape within 60 seconds.',timeLimit:60},
    {id:'deep-sweep',name:'Deep Sweep',levelId:'buried-observatory',brief:'Bring every treasure out of the observatory. The bridge rises only once.',allTreasure:true},
    {id:'long-reach',name:'Long Reach',levelId:'reed-bank',brief:'Use a tongue grab for the key. Save at least one grab for it.',keyByTongue:true},
    {id:'pocket-change',name:'Pocket Change',levelId:'split-shelves',brief:'Gather every treasure with one tongue grab and two burrows.',allTreasure:true},
    {id:'greeds-price',name:'Greed’s Price',levelId:'greedy-gallery',brief:'Empty the gallery and escape after both of its reversals.',allTreasure:true},
    {id:'no-turning-back',name:'No Turning Back',levelId:'turning-citadel',brief:'Outwit both reversals and escape within 100 seconds.',timeLimit:100},
    {id:'bare-teeth',name:'Bare Teeth',levelId:'razor-crossing',brief:'Pass the paired snakes and escape without a full alarm.',noChase:true},
    {id:'needle-dash',name:'Needle Dash',levelId:'needle-vault',brief:'Use your only grab wisely and reach the hatch within 60 seconds.',timeLimit:60},
    {id:'royal-sweep',name:'Royal Sweep',levelId:'crown-of-thorns',brief:'Empty the final keep through all three reversals. Every treasure counts.',allTreasure:true},
    {"id":"mire-reach","name":"Mire Reach","levelId":"mire-mouth","brief":"Retrieve the bog key by tongue, then escape the awakening reeds.","keyByTongue":true},
    {"id":"silk-sweep","name":"Silk Sweep","levelId":"silk-galleries","brief":"Empty every shelf while both sleeping dens wake.","allTreasure":true},
    {"id":"span-dash","name":"Span Dash","levelId":"falling-span","brief":"Outrun two awakenings and both sealing bridges within 45 seconds.","timeLimit":45},
    {id:'no-spare-tail',name:'No Spare Tail',levelId:'thornback-warren',brief:'Escape the warren with no tail to spare. One catch ends the run.'},
    {id:'hot-plates',name:'Hot Plates',levelId:'chimney-run',brief:'Work all three chimney doors and escape within 40 seconds, under the hawk.',timeLimit:40},
    {id:'ant-dash',name:'Ant Dash',levelId:'anthill-gate',brief:'Slip through the ring of ants and escape within 30 seconds.',timeLimit:30},
    {id:'sticky-fingers',name:'Sticky Fingers',levelId:'sugar-store',brief:'Escape the store without a gecko keeping a single treasure.',noTheft:true},
    {id:'keep-warm',name:'Keep Warm',levelId:'frozen-plates',brief:'Work the ice doors without Sally ever getting chilled.',noChill:true},
    {id:'steam-trap',name:'Steam Trap',levelId:'kettle-works',brief:'Lure hunters into the jets: daze three with steam before the hatch will open.',steamTraps:3}
  ];
  function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
  function gridFor(level){
    const grid=Array.from({length:level.height||13},()=>Array(level.width||17).fill('#'));
    if(level.abyss)for(let y=1;y<grid.length-1;y++)for(let x=1;x<grid[0].length-1;x++)grid[y][x]='P';
    for(const [x1,y1,x2,y2] of level.rooms)for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)grid[y][x]='.';
    for(const [x,y] of level.walls||[])grid[y][x]='#';
    for(const [x,y] of level.ice||[])grid[y][x]='#';
    for(const [x,y] of level.mud||[])grid[y][x]='M';
    for(const [kind,tiles] of [['B',level.cracks],['L',level.cover],['N',level.gravel]])for(const [x,y] of tiles)grid[y][x]=kind;
    for(const [x,y] of level.gaps||[])grid[y][x]='P';
    for(const [x,y] of level.crumble||[])grid[y][x]='c';
    for(const [x,y] of level.slits||[])grid[y][x]='Y';
    for(const [x,y] of level.water||[])if(grid[y][x]==='.')grid[y][x]='U';
    for(const gate of level.gates||[]){for(const [x,y] of gate.tiles)grid[y][x]=gate.bridge?(gate.initialOpen?'W':'P'):gate.initialOpen?'g':'G';if(gate.switch){const [x,y]=gate.switch;if(grid[y][x]!=='L')grid[y][x]='S';}for(const [x,y]of gate.plates||[])if(grid[y][x]!=='L')grid[y][x]='S';}
    return grid;
  }
  // Rebuilt routes are drawn as text maps, one character per tile, so any shape is
  // easy to author. The map fills in the same fields older routes list by hand:
  //   # wall  . floor  L leaf cover  N noisy gravel  B cracked wall  M mud  ~ water
  //   _ gap   c crumbling floor  @ start  K key  X exit  1-5 treasure of that value
  //   o spore puffball  t tide flat (dry at low tide, water at high tide)  m moss (silent)  I ice wall (reflects a sentinel's gaze)
  // What an edited escape keeps from the game's own copy: its place on the trail and its ties.
  const EDIT_KEEP=['unlockAfter','unlockChallenges','unlockAny','hidden','bonus','secret','stars','noAids','revision'];
  function fromMap(level){
    const rows=level.map,tiles=(chars)=>{const out=[];rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(chars.includes(ch))out.push([x,y]);}));return out;};
    const one=ch=>{const found=tiles(ch);if(found.length!==1)throw new Error(level.id+' needs exactly one '+ch);return found[0];};
    level.width=Math.max(...rows.map(r=>r.length));level.height=rows.length;level.rooms=[];
    rows.forEach((row,y)=>{let start=null;[...row,'#'].forEach((ch,x)=>{const open=ch!=='#'&&ch!==' ';if(open&&start===null)start=x;if(!open&&start!==null){level.rooms.push([start,y,x-1,y]);start=null;}});});
    level.cover=tiles('L');level.gravel=tiles('N');level.cracks=tiles('B');level.mud=tiles('M');level.water=tiles('~');level.gaps=tiles('_');level.crumble=tiles('c');level.vines=tiles('T');level.slits=tiles('S');level.puffballs=tiles('o');level.moss=tiles('m');level.ice=tiles('I');level.tideFlats=tiles('t');level.soil=tiles('d');
    level.spawn=one('@');level.key=one('K');level.exit=one('X');
    level.loot=[];rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(/[1-5]/.test(ch))level.loot.push([x,y,Number(ch)]);}));
    return level;
  }
  // Rebuilt routes replace the originals by id. They keep their place on the trail and
  // their unlock rules, and a bumped revision retires any old record for that route.
  const rebuilt=typeof module!=='undefined'&&module.exports?require('./escape-rebuilt.js'):root.EscapeRebuilt||[];
  for(const route of rebuilt){
    // New areas add their escapes to the end of the trail.
    if(route.append){if(levels.some(l=>l.id===route.id))throw new Error('Duplicate route '+route.id);const {append,...rest}=route;levels.push({burrows:0,pebbles:0,tongues:0,...rest,revision:1});continue;}
    const i=levels.findIndex(l=>l.id===route.id);if(i<0)throw new Error('Unknown rebuilt route '+route.id);
    const old=levels[i],keep={};for(const k of ['unlockAfter','unlockChallenges'])if(old[k]!==undefined)keep[k]=old[k];
    levels[i]={burrows:0,pebbles:0,tongues:0,...keep,...route,revision:(old.revision||1)+1};
  }
  for(const level of levels)if(level.map)fromMap(level);
  // Paired escapes let players choose a way before rejoining the harder path.
  for(const [entry,a,b,join] of [[1,2,3,4],[6,7,8,9],[10,11,12,13],[14,15,16,17],[18,19,20,21],[24,25,26,27],[28,29,30,31],[33,34,35,36],[38,39,40,41],[43,44,45,46]]){
    levels[b-1].unlockAny=entry===1?[levels[0].id,levels[1].id]:[levels[entry-1].id];levels[join-1].unlockAny=[levels[a-1].id,levels[b-1].id];
  }
  // Later chapters forgive one catch with a tail drop; early routes keep one-touch tension.
  for(const level of levels.slice(23,47))level.tailDrop=true;
  // Glow mushrooms light the fogged mazes: none in the early, easier ones, one in most later
  // ones, two in the darkest and the biggest. A route that sets its own count keeps it.
  const glowsFor=(level,i)=>level.glows!==undefined||!level.explore||i<19?level.glows:level.dark||level.width>=33?2:1;
  levels.forEach((level,i)=>{const n=glowsFor(level,i);if(n!==undefined)level.glows=n;});
  // How sharp the hunters are (see CUNNING in the engine): slow and simple in the first two areas,
  // sharper through the middle of the trail, at their wisest from the Steam Vents on.
  levels.forEach((level,i)=>{if(level.cunning===undefined)level.cunning=i<9?0:i<27?1:i<73?2:3;});
  // Each challenge also waits for stars in its area: two per route on the
  // shortest way from the area's first escape to the challenge's escape.
  // Stars from any route in the area count, so an alternative route helps too.
  const regions=[0,5,9,13,17,23,27,32,37,42,47,49,53,58,63,68,73,...[78,83,88,93].filter(n=>n<levels.length),levels.length];
  const alternatives=new Set([[1,3],[6,8],[10,12],[14,16],[18,20],[24,26],[28,30],[33,35],[38,40],[43,45]].map(([entry,b])=>b-1));
  for(const challenge of challenges){
    const index=levels.findIndex(l=>l.id===challenge.levelId),r=regions.findLastIndex(start=>start<=index);
    let routes=0;for(let i=regions[r];i<=index;i++)if(!alternatives.has(i)||i===index)routes++;
    challenge.starGate={from:regions[r],to:regions[r+1],stars:2*routes};
  }
  // The Gilded Burrow sits outside the trail: its escapes never count toward stars or unlocks.
  const hiddenRoutes=typeof module!=='undefined'&&module.exports?require('./escape-hidden.js'):root.EscapeHidden||[];
  const hidden=hiddenRoutes.map(route=>fromMap({burrows:0,pebbles:0,tongues:0,...route,hidden:true,revision:1}));
  hidden.forEach(level=>{const n=glowsFor(level,99);if(n!==undefined)level.glows=n;});
  // Little Explorers (escape-kids.js): gentle levels for young children, outside the trail like the
  // Gilded Burrow. Slow, simple creatures (cunning 0, moving at 60%) and catches that can't end a run.
  const kidsRoutes=typeof module!=='undefined'&&module.exports?require('./escape-kids.js'):root.EscapeKids||[];
  const kids=kidsRoutes.map(route=>fromMap({burrows:0,pebbles:0,tongues:0,cunning:0,gentle:.6,...route,kids:true,unlimited:true,revision:1}));
  // Workshop drafts (escape-edits.js), only while its test-in-game switch is on in this browser.
  // A draft keeps its escape's place: id, unlock rules, secret and bonus ties stay the game's.
  // A draft that fails to build is skipped, so a bad edit can never stop the game loading.
  const edits=root.EscapeEdits?.overrides?.()||{},originals={};
  for(const [list,prefix] of [[levels,'level:'],[hidden,'hidden:']])list.forEach((old,i)=>{const route=edits[prefix+old.id];if(!route)return;
    try{list[i]=applyEdit(old,route);originals[prefix+old.id]=freeze(old);}catch(e){if(typeof console!=='undefined')console.warn('Workshop draft for '+old.id+' skipped: '+e.message);}});
  // Seasonal content has its own catalog and saves. It never joins the campaign trail.
  const autumn=typeof module!=='undefined'&&module.exports?require('./escape-autumn.js'):root.EscapeAutumn||[];
  const winter=typeof module!=='undefined'&&module.exports?require('./escape-winter.js'):root.EscapeWinter||[];
  const seasonal=[...autumn.map(route=>fromMap({burrows:0,pebbles:0,tongues:0,cunning:0,...route,seasonal:'autumn-hollow'})),...winter.map(route=>fromMap({burrows:0,pebbles:0,tongues:0,cunning:0,...route,seasonal:'winter'}))];
  const catalog=freeze({levels,challenges,regions,hidden,kids,seasonal});
  // Custom levels from the builder go through the same text-map path as every rebuilt route.
  function applyEdit(old,route){const keep={};for(const k of EDIT_KEEP)if(old[k]!==undefined)keep[k]=old[k];
    return fromMap({burrows:0,pebbles:0,tongues:0,...JSON.parse(JSON.stringify(route)),...keep,id:old.id,draft:true});}
  const buildCustom=route=>freeze(fromMap({burrows:0,pebbles:0,tongues:0,...JSON.parse(JSON.stringify(route)),custom:true,revision:1}));
  root.EscapeCatalog=catalog;root.escapeGridFor=gridFor;root.escapeBuildCustom=buildCustom;
  // The game's own copy of an escape, even while a workshop draft stands in for it.
  const gameLevel=key=>{const [kind,id]=key.split(':');return originals[key]||(kind==='hidden'?hidden:levels).find(l=>l.id===id)||null;};root.escapeGameLevel=gameLevel;
  if(typeof module!=='undefined'&&module.exports)module.exports={EscapeCatalog:catalog,escapeGridFor:gridFor,escapeBuildCustom:buildCustom,escapeGameLevel:gameLevel,EDIT_KEEP};
})(typeof globalThis!=='undefined'?globalThis:this);

