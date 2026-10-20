# Sunshore Cove: what is built

The design is in [SUMMER-PLAN.md](SUMMER-PLAN.md). All eight escapes are built and recorded. The pack is `ready:true` and opens on its own on 1 June 2027 (Toronto time). Set `access:'open'` to open it early for testing, or `access:'closed'` to keep it shut.

## Escapes

| # | Id | Escape | Teaches |
| --- | --- | --- | --- |
| 1 | summer-dunes | The Dune Gate | A switch loop with a serpent on the top path, plus an optional sand slide into a cove |
| 2 | summer-crab | The Crab's Crossing | Two Shellback Crab lanes: wake a crab, step back, pass while it rests; a pebble sends it into its shell |
| 3 | summer-tide | The Turning Tide | Tidal flats that flood and drain, and two Rockpool Eels (one sleeps at low tide) |
| 4 | summer-gull | The Gull's Boardwalk | The Harbour Gull (magpie rules) turns to watch each boardwalk; pebbles send it off to steal them |
| 5 | summer-lagoon | The Reed Lagoon | A Reed Heron's beak line (swimmers are safe), a gentle current, and a Sunskimmer looping round the key; the switch lowers the footbridge home |
| 6 | summer-boatshed | Beneath the Boatshed | Rolling barrels on a cargo lane, a tongue switch across a deep slipway, and a Dune Scorpion in the optional yard |
| 7 | summer-inlet | The Sunset Inlet | A Sailfin in each of two pools (they only chase swimmers they can see), a vault switch, and a fast channel home |
| 8 | summer-lighthouse | The Lighthouse Lantern | Tidal causeway, the gull's stores, a crab lane under the lighthouse, a Sunskimmer annex and a tongue-switch bridge home |

## Rewards

Finishing all eight earns **Sunshore Sally**: a teal body, sand belly, coral crest and gold flecks. The menu keepsakes are a miniature lighthouse, plus a sailboat for finding every treasure. The collection, HUD and results use summer words (sun lens, the harbour lanterns).

Each escape has 10 treasure, field notes from Marina, finite supplies and normal retries. Real-input wins (normal and all-treasure) are recorded with `node scripts/record-season.cjs summer --write`. The tours live in `scripts/summer-tours.json`, and `tests/escape-summer.cjs` replays them, including after a builder round trip.

## Look

- `escape-summer-art.js` holds the beach palettes, the props (parasol, sandcastle, buoy, fish crate, bunting, harbour lantern, rowing boat, lighthouse) and sun glints on water. TV boxes get fewer glints, and reduced motion turns them off.
- Costumes: the Sandstripe Serpent is a recoloured snake, and the Harbour Gull is the magpie redrawn white and grey with a yellow bill. The other creatures keep their campaign bodies and tells, with small coastal touches.
- Terrain: sand ground, with rock, wood or stone walls depending on the level.
- The builder has the eight Sunshore looks and the new summer props.

## World

The summer area has a guide, Marina, by the north gate, and sand underfoot (Sally's steps hiss on it). Its centre is a lagoon with the lighthouse on a rock, its lamp brightening with each sun lens. The open sea runs along the south shore with waves rolling in, and a wooden pier Sally can walk out on (her steps knock on the boards). Eight harbour lanterns along the shore light one per escape, and a sailboat moors by the pier once all eight are done. Striped beach huts stand in the north-west corner, and three kites fly over a grassy kite lawn in the north-east (still with reduced motion).
