# Level review: repetition and hunter difficulty (historical)

A snapshot of the first 78 escapes, taken before the text-map rebuild and the difficulty pass.
Every escape has since been redrawn; this is kept as the record of what that pass set out to fix.

## Why the layouts feel the same

All 78 escapes fall into four templates and two one-offs. In 62 of them, the
floor fills its whole bounding rectangle. Start and key positions are almost
fixed.

| Template | Escapes | Shape | Start → key → exit |
| --- | --- | --- | --- |
| Starter boxes | 1–5 | 17×13, 3–6 small rooms, 1-tile links | bottom-left → top → bottom-right |
| Four corners + hub | 6–23 | 2×2 grid of 8–10×6–7 rooms around a hub, one ring of corridors. 14, 17 and 19–23 are near clones | bottom-left → top-right → bottom-right |
| Serpentine bands | 24–48 | 4-tall horizontal bands with 4-wide connectors, in a zig-zag or spiral | mostly bottom-left → top-right |
| Tic-tac-toe | 50–78 | A full rectangle cut into 3×3 or 3×4 cells, with 1-tile doors | all start top-left; key top-right in 28 of 29 |
| One-offs | 32 (round observatory), 49 (lagoon) | The only non-rectangular outlines | |

Every escape is one outer ring plus at most one shortcut. Rooms are 6–10
tiles wide, and hunters see 4.5 tiles, so Sally can always skirt them.

## Why hunters are easy to run past

Sally walks at 2.45 tiles/s and sprints at 4.0 for about 4 s. Almost every
lethal hunter **commits to a fixed point** after a telegraph of 1.5 s or more,
so any movement dodges it.

| Hunter | What happens |
| --- | --- |
| Snake | The only real chaser, at 2.75 (slower than a sprint). Gives up 1.5 s after losing sight. |
| Beetle | Stands still while aiming, then charges a fixed point and stops. |
| Scorpion | Approaches at 1.15, slower than walking. Its sting hits a fixed spot of radius 0.65. |
| Toad, spider, cricket, moth | Leap, web, tunnel or swoop to a fixed aim point. |
| Millipede | 1.7, slower than walking. |
| Hawk | Its shadow is slower than walking in a straight line. |

In simulated duels, passing any hunter 1.5 tiles away is never a catch. After
Sally is spotted, sprinting away is always safe.

Escapes 1–23 use only snakes and beetles, at about one hunter per 100 floor
tiles. Escapes 1–5, 7 and 10–12 are trivially easy.

## Recommendations

**Layouts.** Add an ASCII `map:` field so new shapes are quick to author: the
engine already handles any floor shape. Introduce one or two shapes per
region:

- L-rooms and dead-end pockets holding loot.
- Rings and donuts around a pillar core, so a hunter circles and line of sight
  matters.
- Pillar plazas for scorpions.
- Long winding corridors and diagonal staircases.
- Islands linked by tongue or bridge.
- Circular arenas for finales.

Also:
- Vary start and exit corners.
- Narrow the lanes a hunter guards to 1–2 tiles.
- Never repeat a template more than about six times in a row.

**Hunters.** Keep sprint at 4.0 so stealth stays fair.
- **Snake:** chase 2.75 → 3.3; it remembers Sally for 2.5 s and searches for 4 s.
- **Stamina:** drains faster (about 3.3 s of sprint).
- **Beetle:** aims where Sally is heading, winds up faster (0.55 s), and
  overshoots its aim.
- **Scorpion:** larger sting (radius 1.0), faster windup (0.65 s), leads its
  aim, approaches at 2.0.
- **Toad, spider:** shorter windups and longer reach.
- **Cricket:** re-aims as it surfaces.
- **Moth:** faster swoop.
- **Millipede:** 2.3.
- **Hawk:** shadow 2.6.

Keep every telegraph visible, so harder hunters stay readable.
