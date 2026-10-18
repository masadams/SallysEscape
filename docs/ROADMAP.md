# Sally's Escape roadmap

What the game has now, how its areas open, and the rules every escape follows. The story is in
`docs/STORY.md`.

## Done

| Part | What it is |
| --- | --- |
| The trail | 100 escapes in 21 areas, from Sunny Meadow to The Road Home, every one drawn as a text map with a recorded winning run (`tests/fixtures`). |
| Hidden escapes | 20 more: the Gilded Burrow's three, the Bramble Maze and The Long Way Home bonus escapes, the secret spots (Star Garden, Mossy Well, Cloud Nest, Shrine, Bestiary Grove, Ice Cave, Sunken Wreck, Blind Grove), and the Magpie Roost's five. |
| Challenges | 21 one-touch challenges; each opens once its escape is cleared and its area has enough stars, and some areas need a number of them. |
| Hunters | 29 creature kinds, each with its own job (`docs/ENEMIES.md`), plus the hawk and ant columns; the Bestiary in the Journal. |
| Tools and tricks | Pebbles, burrows, tongue, seeds, camouflage, glow mushrooms, spore pouches, crawling; burrow pairs, moss, echo halls, currents, traps, cold rooms, steam, storms and tides. |
| World map | Areas, villagers, caches, golden flies, Old Moss's lost things and den, Sally's Burrow, weather and day/night; area mastery lends Sally its colours. |
| Story | Three parts with collectable cards, the Great Map and a lost Wayfinder's notes (`docs/STORY.md`). |
| Sound and light | Synthesised effects, adaptive music in code, ambience, footsteps by ground, cave echo (`docs/MUSIC.md`); lighting and moods (`docs/LIGHTING.md`). |
| Feel | Noise rings, particles, catch and escape moments, camera lead, quick retry, phone buzz. |
| Players and menus | Up to six players per browser; a title screen, Options and a pause menu. |
| Builder | Level builder with Quick build, the community shelf, the admin workshop for the game's own escapes (`docs/BUILDER.md`). |
| Player data | Anonymous run summaries for tuning (`docs/PLAYDATA.md`). |

## Branch map

```
Meadow → Garden → Reedbanks → Ruins → Deep Trials → Venom Depths → Waking Maze → Hollow Jungle → Luminous → Living Labyrinth → Sun and Sea → Shedding Hollow → Lantern Marsh → Frost Hollow (side path)
                                                   ↘ Ant Kingdom (side path, 8 challenges)
                                                                                 ↘ Sunbaked Rooftops (4 challenges) → Steam Vents (12 challenges) → Mushroom Grotto → Storm Heights → Tide Pools → The Road Home
```

A region's gate shows its challenge count (⚑) on the world map; the unlock hint names both the
escape to clear and the challenges still needed.

## Ideas for later

- The sequel the story points to: the missing page of the Great Map, past the edge of the sea.
- Tuning from player data: smooth escapes that are much harder than their neighbours.
- An off switch for player data in Options; controller support; an assist mode.

## Escape notes by region

### Text maps
Every escape is drawn as a text map, with:
- **Varied shapes:** L-rooms, crossroads, rings, pillar halls, staircases, switchbacks and islands.
- **Hidden-map fog** only where it suits the place.
- **The trap toolkit,** used where it makes a route harder.

Every rebuilt route keeps its id, bumps its revision, and gets a recorded winning run.

Recorded runs never rely on the forgiving tail drop. In Deep Trials:
- Razor Crossing has a one-way crumbling causeway and two snakes passing in a narrow hall.
- Needle Vault's key hangs over a pit and can only be grabbed from one ledge.
- Toll of Ash hides mimics among its chests.
- Threefold Keep has three floors whose doors shut behind Sally.
- Last Light chains three plate bridges against a 50-second clock.
- Crown of Thorns rings a throne room with thorns.

In Venom Depths:
- Sting Stair is a switchback climb with scorpions at every turn.
- In Broken Delta, a tongue-grab key drops the north bridges and raises south fords.
- In Coiled Catacomb, a vault chest seals the coil and opens a spine passage.
- In Split Jaw, boulders roll down a canyon between two vaults.

In The Waking Maze, every prize wakes a den:
- Mire Mouth has a bog of mud causeways and a tongue-grab key.
- Silk Galleries stacks three dark shelves.
- Falling Span is a set of platforms over the void, linked by a sprint-only bridge.
- Echo Fan is a branching cavern.
- Hungry Observatory has four chambers around a hub.

Hollow Jungle pits Sally against millipedes and crickets in five places:
- a fern cloister;
- flooded terraces;
- a dark root cathedral;
- a dark quarry ringed by ledges;
- canopy islands joined by root bridges.

Luminous Depths stays dark, lit by glow plants, and brings in the angler, whose lure looks just like a glow bug:
- Glowcap Grotto: a grotto split by a chasm, with a timed bridge.
- Tideglass Causeway or Pulse Garden: three islands whose swim lanes weave between lures, or hedged beds round a vault whose door will not stay open.
- Spore Engine: a pump hall with a timed block and a flooded shaft.
- Nightbloom Reach: three islands above black water, a swim under an angler's lure and a timed bridge; taking the key raises a bloom bridge home and wakes a moth.

Living Labyrinth keeps its living garden (seeds, root doors, vine crossings) and adds the flytrap, the tangle vine, Sally-only cracks and a heavy plate only a beetle can press:
- Sleeping Orchard: tree rows along a stream, root doors that swap when the key is taken, and a seed-grown crossing.
- False Garden or Rootwheel Ruins: hedged beds whose chest shifts the doors, with flytraps fed by pebbles; or a living wheel that turns which root arms are open.
- Hungry Greenhouse: a seed vault that opens only while the beetle presses its slab, and cracks that shake off a chase.
- The Heartwood: a king cobra watching the richest chest, a heart door that shuts behind the key, and a crack as the only way out.

Sun and Sea brings in the hermit crab:
- The Sunken Caravan: a canyon yard where the snake and the scorpion fight if they meet. Taking the key collapses the arch, so Sally runs home along the rim and slips through a crack only she fits.
- Tideglass Lagoon: three islands where fish rule the channels, a sea snake takes both water and land, and hermit crabs guard the beaches.

The Shedding Hollow lets Sally spare a tail and regrow it by eating a glowing bug:
- Shedskin Gully: a beetle's charging lane between two shelves, with cracks to shake off a chase.
- Thornback Warren: the key vault seals behind Sally; the way out is a slab door that opens only while the beetle presses its heavy plate.
- Moltwater Steps: a sea snake owns the channel and its causeways, and tangle vines grip the steps.
- The Old Shedding Tree: a king cobra lies coiled across the heart over the richest chest; taking the key shuts the heart, and cracks are the ways out.

### Bonus escapes
Bonus escapes sit on the map behind a hedge that opens once the areas before them are mastered (every star, not just a clear). They keep their own records.
- The Bramble Maze (north of the Deep Trials, opens with the first five areas mastered): a true, dark maze with loops, a hunting snake, tangle vines and flytraps at the dead ends.
- The Long Way Home (above the Living Labyrinth, opens with the first ten areas mastered): the mega escape. Eight wide rooms wind through three bands with no checkpoints: meadow snakes, a chasm bridge, a steam hall, a frozen room where a fox listens, rolling logs, a scorpion garden, a swim under a heron's gaze and a king cobra's vault. Taking the key wakes hunters for the way home.

The Lantern Marsh brings owls, whose beams sweep the yards from their look-outs:
- Firefly Ford: a dark black river with a plank ford, moths that follow glowing footprints, and an owl on the far bank.
- Bramble Switchyard: three bramble doors held open by plates on both sides, under an owl's sweep.
- Snapdragon Terrace: flytraps guard the stairs and mimics hide among the treasure; the key turns which stair is open.
- Rival Rooftops: two rival pairs share the roof roads, and an owl watches it all.
- Moonwell Keep: a king cobra lies across the moonwell, the inner door opens only under the beetle's weight, and cracks let Sally slip the chase home.

Sunbaked Rooftops keeps the hawk, awnings and camouflage, and adds crumbling roof tiles and rolling barrels:
- Sunbaked Ledge: striped awnings and a crumbling shortcut under the hawk.
- Laundry Lines: sheets throw stripes of shade while barrels roll down the gaps between the lines.
- Chimney Run: three chimney doors held open by hot plates on either side, with scorpions by the stacks.
- Pigeon Court: the key slams the roof door; cracks in the court wall are the way out.
- Weathervane Spire: a stepped spire of barrels and crumbling tiles, a king cobra over the richest chest, and a hawk that dives often.

Ant Kingdom keeps its marching columns and gecko thieves:
- Anthill Gate: a ring of ants circles the key mound; cross in the gaps.
- Sugar Store: shelves of treasure and two geckos that steal the last thing Sally picked up.
- Marching Tunnels: two columns loop the same hall in opposite directions.
- Thieves' Gallery: a vault bridge that rises once, and a low bridge back that the key raises.
- The Queen's Chamber: a column loops the outer hall, the queen's guard (a king cobra) coils in the great hall, and a crack is the way out of the sealed throne room.

Frost Hollow keeps its cold rooms and warm stones and brings in the snow fox, which hunts by ear:
- Frostbite Steps: a freezing hall with warm stones and a fox circling a patch of crunchy snow.
- Icicle Gallery: a frost owl sweeps the gallery; the crunchy middle walk carries every step.
- Frozen Plates: three ice doors, each with a plate on both sides, in a freezing yard.
- Snowdrift Vault: the vault door freezes shut behind the key; a crack leads out into the coldest passage, where a fox listens.
- Winter Heart: a king cobra slowed by the cold, two foxes, an owl, and a crack out of the sealed heart.

Steam Vents is the steepest climb, with king cobras in its hardest boilers:
- Kettle Works: brass vents hiss across the boiler hall; learn their rhythm and lead hunters into the jets (the Steam Trap challenge needs three dazed).
- Pressure Pipes: steam below and a hawk above; awnings and camouflage cover the pipe runs.
- Boiler Owls: two owls sweep the boiler floor, and a king cobra coils over the richest chest.
- Ant Furnace: an ant column that steam does not stop, and a furnace door that opens only while the beetle presses its slab.
- The Great Boiler: two king cobras in the boiler hall, an owl, a fox and the ants outside; the key seals the boiler room and a crack is the way out.

Every region now has text maps. The Lantern Marsh's Firefly Ford gained a bog heron, a rooted striker that stabs along its beak line and never sees a swimmer. 

### Area mastery
Earning every star in an area masters it. Mastery puts a crown on the area's sign and gives Sally that area's colours to wear (21 sets, plus classic green, chosen on the world map).

## Rules every new route follows
- Standing still at the start is safe for at least 15 seconds.
- Every route has a recorded winning playthrough in `tests/fixtures`.
- No reachable state can strand Sally, including after burrows and timers.
- Ten treasure per route; a new region's first route teaches one new idea at a time.
