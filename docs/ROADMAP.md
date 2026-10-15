# Sally's Escape roadmap

The trail is no longer a single line. Several branches can open at once, and
some regions also need a number of completed challenges. Each chunk below is
built, playtested with recorded winning runs, and pushed on its own.

## Done

| Chunk | What it added |
| --- | --- |
| Tail drop | One spare catch per run from Venom Depths (escape 24) onward; challenges stay one-touch. |
| The Shedding Hollow | Four hard routes with glowing regrowth bugs. |
| The Lantern Marsh | Five routes remixing darkness, plates, mimics and rivals, plus **owl sentries**. |
| World map | Stars, totals, caches, villagers, golden flies, clouds, day/night. |
| Sound and intro cards | Synthesised effects for every event; a start card for every escape. |
| Challenge-gated branches | Regions can require completed challenges; the gate shows ⚑ and the count on the map. |
| Sunbaked Rooftops | Five routes with the **hawk**, shaded awnings and the new **camouflage** action, plus the Hot Plates challenge. |
| Ant Kingdom | Five routes with **ant columns** and **gecko thieves**, plus the Ant Dash and Sticky Fingers challenges. |
| First-try bonus | A first-attempt escape earns mint stars and a ✓ badge. |
| Adaptive music | Composed in code with Tone.js: four region moods, with layers that fade between explore, tension and chase; see `docs/MUSIC.md`. |
| Challenge markers and star gates | Open challenges glow on the map and are announced; each one also needs two stars per route in its area. |
| Enemy rebuild | Every hunter has its own job: beetle battering ram, scorpion strike ring, toad sniper, spider tripwires, cricket alarm, moth lantern and mimic chests. Strikes aim where Sally is heading. See `docs/ENEMIES.md`. |
| Trap toolkit | One-use and crumbling bridges, crumbling floor, rolling logs and thorns, ready for the level rebuild. |
| World map polish | Region colours blend across borders, walls read as solid forest and rock, and terrain is cached so the map draws about ten times faster. |
| Shorter intro cards | Brief, Full or Off; hints fold away unless an area is teaching something new. |
| Frost Hollow | Five routes with cold rooms, a **warmth** meter, warm stones, sluggish cold-blooded hunters and frost owls, plus the Keep Warm challenge. |
| Steam Vents | Five routes with **timed steam jets** that block lanes, blow Sally clear and daze hunters, mixed with the hawk, owls and ants, plus the Steam Trap challenge. |

## Branch map

```
Meadow → Garden → Reedbanks → Ruins → Deep Trials → Venom Depths → Waking Maze → Hollow Jungle → Luminous → Living Labyrinth → Shedding Hollow → Lantern Marsh
                         ↘ Sun and Sea (after Forked Fort)      ↘ Ant Kingdom          ↘ Sunbaked Rooftops          ↘ Frost Hollow
                                                                  (8 challenges)        (4 challenges)  ↘ Steam Vents (12 challenges)
```

A region's gate shows its challenge count (⚑) on the world map; the unlock
hint names both the escape to clear and the challenges still needed. New
regions each add two or three challenges so later gates stay reachable.

## Next regions

### 1. Sunbaked Rooftops — hawk and camouflage (done)
- Opens after Canopy Crown (Hollow Jungle) **and 4 completed challenges**, in parallel with Luminous Depths.
- **Hawk**: a shadow circles above and slowly follows Sally, then dives on the spot. Awnings, leaves and camouflage are safe.
- **Camouflage** (new action, X / Camo button): Sally blends into the ground and stays hidden while she keeps still.
- Five routes and the Hot Plates challenge. Sally always starts in shade.

### 2. Ant Kingdom — ant columns and the gecko thief (done)
- Opens after Split Jaw (Venom Depths) **and 8 completed challenges**.
- **Ant column**: a marching line follows a fixed trail in waves. It blocks corridors on a rhythm and catches anything it walks over; it ignores noise and pebbles.
- **Gecko thief**: darts in, steals the last treasure Sally picked up and runs for its burrow. Catch it before it gets there to take the treasure back.
- Underground tunnels, with burrowing as the main tool. Hiding never stops ants; geckos ignore Sally while her pockets are empty.

### 3. Frost Hollow — warm and cold (done)
- Opens after Moonwell Keep (Lantern Marsh).
- Only some rooms are cold, as agreed: cold ground slowly drains a **warmth** meter and slows Sally when it runs low; sun patches and warm stones refill it.
- Owls return as daytime frost owls; snakes are sluggish in the cold.

### 4. Steam Vents — timed jets (done)
- Opens after the Sunbaked Rooftops finale **and 12 completed challenges**.
- Vents puff on a rhythm. A jet blocks its lane and can toss hunters back, so timing a jet can save Sally.
- Mixes the hawk, owls and ant columns learned in earlier branches.

### Level rebuild (in progress)
Escapes are being redrawn as text maps, region by region, with:
- **Varied shapes:** L-rooms, crossroads, rings, pillar halls, staircases, switchbacks and islands.
- **Hidden-map fog** only where it suits the place.
- **The trap toolkit,** used where it makes a route harder.

Every rebuilt route keeps its id, bumps its revision, and gets a recorded winning run.

Done so far: Sunny Meadow, Garden Ruins, Reedbanks, Restless Ruins, Deep Trials, Venom Depths, The Waking Maze and Hollow Jungle (escapes 1–37). Recorded runs never rely on the forgiving tail drop. In Deep Trials:
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
- Nightbloom Reach: a crescent of islands that closes the area. Its new layout is drawn but still needs a recorded winning run, so the old layout stays live for now (on the fix list).

Living Labyrinth keeps its living garden (seeds, root doors, vine crossings) and adds the flytrap, the tangle vine, Sally-only cracks and a heavy plate only a beetle can press:
- Sleeping Orchard: tree rows along a stream, root doors that swap when the key is taken, and a seed-grown crossing.
- False Garden or Rootwheel Ruins: hedged beds whose chest shifts the doors, with flytraps fed by pebbles; or a living wheel that turns which root arms are open.
- Hungry Greenhouse: a seed vault that opens only while the beetle presses its slab, and cracks that shake off a chase.
- The Heartwood: a king cobra watching the richest chest, a heart door that shuts behind the key, and a crack as the only way out.

Sun and Sea brings in the hermit crab:
- The Sunken Caravan: a canyon yard where the snake and the scorpion fight if they meet. Taking the key collapses the arch, so Sally runs home along the rim and slips through a crack only she fits.
- Tideglass Lagoon: three islands where fish rule the channels, a sea snake takes both water and land, and hermit crabs guard the beaches.

Next: the Shedding Hollow onward.

### Area mastery (done)
Earning every star in an area masters it. Mastery puts a crown on the area's sign and gives Sally that area's colours to wear (17 sets, chosen on the world map).

### Later
- A **Home** region and ending once the branches above are done.

## Rules every new route follows
- Standing still at the start is safe for at least 15 seconds.
- Every route has a recorded winning playthrough in `tests/fixtures`.
- No reachable state can strand Sally, including after burrows and timers.
- Ten treasure per route; a new region's first route teaches one new idea at a time.
