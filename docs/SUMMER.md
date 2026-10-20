# Sunshore Cove: what is built

The design is in [SUMMER-PLAN.md](SUMMER-PLAN.md). The area stays closed until all eight escapes are built and recorded.

## Escapes so far

| # | Id | Escape | Teaches |
| --- | --- | --- | --- |
| 1 | summer-dunes | The Dune Gate | A switch loop with a serpent on the top path, plus an optional sand slide into a cove |
| 2 | summer-crab | The Crab's Crossing | Two Shellback Crab lanes: wake a crab, step back, pass while it rests; a pebble sends it into its shell |
| 3 | summer-tide | The Turning Tide | Tidal flats that flood and drain, and two Rockpool Eels (one sleeps at low tide) |
| 4 | summer-gull | The Gull's Boardwalk | The Harbour Gull (magpie rules) turns to watch each boardwalk; pebbles send it off to steal them |

Each escape has 10 treasure, field notes from Marina, finite supplies and normal retries. Real-input wins (normal and all-treasure) are recorded with `node scripts/record-season.cjs summer --write`. The tours live in `scripts/summer-tours.json`, and `tests/escape-summer.cjs` replays them, including after a builder round trip.

## Look

- `escape-summer-art.js` holds the beach palettes, the props (parasol, sandcastle, buoy, fish crate, bunting, harbour lantern, rowing boat, lighthouse) and sun glints on water. TV boxes get fewer glints, and reduced motion turns them off.
- Costumes: the Sandstripe Serpent is a recoloured snake, and the Harbour Gull is the magpie redrawn white and grey with a yellow bill. The other creatures keep their campaign bodies and tells, with small coastal touches.
- Terrain: sand ground, with rock, wood or stone walls depending on the level.
- The builder has the eight Sunshore looks and the new summer props.

## World

The summer area has a guide, Marina, by the north gate. Its centre is a lighthouse whose lamp brightens with each sun lens. Eight harbour lanterns light one per escape, and a sailboat moors once all eight are done.
