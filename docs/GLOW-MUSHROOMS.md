# Glow mushroom shelter

Hold **L** (or the touch Glow action), aim, then release. Throw strength and wall bounces work as before. A landed mushroom now lights a **four-tile radius**, increased from 2.5 tiles: 60% farther, covering about 2.56 times the open-ground area. Full lighting keeps its radial gradient; Simple lighting uses six faint, overlapping layers, brighter at the centre and softer toward the edge.

The mushroom lasts **12 seconds of active play**. Its final three seconds visibly fade. Its protection remains effective until it actually goes out, so a nearly spent light does not silently lose its safe boundary. Pausing freezes the timer.

| Creature | Response to a thrown glow mushroom |
| --- | --- |
| Spider | Scurries into reachable shade and waits outside the glow. If it sees Sally sheltering, it faces her and watches. When shelter ends, it rushes her last seen position while that memory is fresh. |
| Millipede | Retreats into shade and waits. Once the light goes out, its usual rules resume: it freezes while Sally watches it, and follows after she looks away. |
| Magpie | Still flies off to steal the mushroom. Stealing it ends that mushroom's protection immediately. |
| Other creatures | Keep their existing behaviors. Ordinary hunters can spot a lit Sally farther away, and leafy cover does not conceal her in the glow. |

This is temporary breathing room, not a place to wait indefinitely. A spider can pursue a Sally who steps out into its view before the light expires. If she slips away unseen, it does not learn her new position. Without a recent sighting, it resumes its original patrol. A creature trapped in a fully lit pocket cowers there instead of teleporting or attacking a sheltered Sally.

Only **thrown mushrooms** repel these two creatures. Decorative glow plants, the companion bug, moths, lightning and warm stones retain their own roles. Spiders still leave webs; old webs still slow Sally, but touching one cannot override the spider's fear while Sally is sheltered.

## Rules and performance

- Walls, closed gates and Sally-only cracks block mushroom illumination and fear. Pathfinding respects each creature's ordinary floor restrictions.
- Patrols find a route around the light where one exists. Retreat searches use reachable tiles and stop after 512 explored cells / twelve steps. A failed search or blocked patrol retries at most twice a second.
- Overlapping mushrooms form one protected space. A creature retreats again if a new mushroom lands on its waiting spot. Expired or stolen sources invalidate cached routes and are removed from its remembered sources.
- Creatures keep a small margin outside the illuminated radius, avoiding boundary jitter. Timers use the engine's fixed simulation steps, including in gentle levels.
- An armed spider spit is interrupted by the light. Existing pebble stuns and creature clashes finish normally.
- No level layouts, saved-progress formats, inventories, throw controls, native Android code, dependencies or audio assets change.

## Review

Use a level with glow mushrooms and spiders or millipedes, or the Workshop. Throw the light near a creature, walk into the glow and watch it retreat. Try moving out early, slipping behind a wall, throwing a second mushroom, or waiting for the fade. Full and Simple lighting should both communicate the larger, soft-edged pool of light.

`tests/escape-glow-shelter.cjs` checks the shelter rules, retreat paths, sight memory, overlap, theft, trapped creatures, pause/retry, ordinary hunters, webs, millipede observation and frame batching. Existing creature, throw, lighting, bestiary and UI tests also run. The real-Chrome smoke suite calls `scripts/smoke-glow-browser.cjs` to exercise an actual throw and capture Full/Simple, touch, fog, fading and rush scenes.

Physical Shield performance still needs a device check; bounded pathfinding and the existing Simple-mode fallback are retained for it.
