# Little Explorers: six bigger adventures

The original twenty levels introduce individual tricks. Adventures 21–26 give children longer journeys with connected rooms, optional detours and a return home. Every level is available immediately. Each completion earns its own sticker, and the existing Next adventure button links all twenty-six.

The goal is always the key and the green exit. Treasure is optional. Main routes never seal behind Sally, use a one-way crumbling crossing, require a treasure quota, or run against a clock. Hunters use cunning 0 and the existing 60% movement pace. A catch returns Sally to a checkpoint, with the existing protection period, keeping her key and collected treasure.

## Play these first

| No. | Adventure | Main journey | Optional exploration | Checkpoints |
| --- | --- | --- | --- | --- |
| 21 | The Garden Gate | Find the west button, cross the blue gate and reach the key in the east garden. The key opens the little southern return gate. | A noisy courtyard chest, sheltered corners and a choice of return routes. Pebbles and seeds are available. | 12,9; 27,5 |
| 22 | Beetle Courtyard | Cross a courtyard around a large planter and retrieve the key from a sheltered room. | Step into the beetle's charging lane for a chest, or squeeze through a Sally-only crack into the side room. Dirt, ground puffs and throwable spores offer different hiding options. | 10,14; 27,5 |
| 23 | Across the Lily Pond | Use bounce mushrooms or swim between the islands and far bank. A third mushroom brings Sally back. | The north island's toad watches a chest. Sally can approach carefully or use her tongue from the water. All pond water is safe; there are no fish or eels. | 14,8; 28,12 |
| 24 | The Old Lantern House | Flick a remote blue button with the tongue to open the far wing. Search its north room for the key and retrace the open rooms. | Illuminate dark corners, collect treasure in the side rooms and distract the snake guarding the south chest. Fixed glow plants mark useful resting places. | 11,5; 20,11; 29,5 |
| 25 | The Sleepy Steamworks | Blue opens the workshop; amber opens the key room. One slow vent has an always-available route around it. | A separate timed treasure door opens repeatedly from plates on both sides. Seeds can brace it. No enemy also covers the steam crossing. | 11,14; 20,12; 28,7 |
| 26 | Sally's Way Home | Open the far wing from the garden, pass the courtyard, find the key and return through the newly opened pond gate. | Three separated encounters, a garden tunnel, bounce shortcuts and treasure that rewards using spore cover. The main route can avoid the toad's side of the far wing. | 14,3; 34,6; 23,18 |

Coordinates above are zero-based text-map tiles. [The exact map atlas](LEVELS.svg) shows starts, keys, exits, creatures, doors, checkpoints, bounce flights and notes. It is a layout diagram, not a screenshot of the game. Regenerate it with `node scripts/kids-level-atlas.cjs`.

## Reading and guidance

Each new adventure has two short, optional trail notes explaining nearby objects. Stand by a paper sign and press A, Enter or Space (or tap Read) to read it; signs no longer pop up on their own. The existing story-card controls work with keyboard, mouse, touch, controller and Android Back. All simulation, including timers and hunters, waits while the card is open. Close it, leave the spot, and return to reread it. [All twelve texts and placements](TRAIL-NOTES.md) are listed separately.

These notes do not join the campaign's collection of 42 story pages or change campaign unlocks. They are local reading spots rather than a second collection requirement. Opening hints remain available even when the guiding dots are off.

The picker has a per-player Guiding dots toggle. Dots remain on by default for both the original lessons and the new adventures. The guide now ends at a required action instead of disappearing at an obstacle: burrow through an authored cracked wall, enter a paired tunnel, bounce, or tongue-grab a key/button. It labels the action and facing direction. Routes use current door and ground state, and their cache belongs to one run. It does not predict hunters or choose safe crossing times; children still watch and decide.

## Supplies and recovery

All twenty-six kids levels use the existing unlimited-supply mode. Only tools supplied by that level appear; their HUD shows endless supplies, and cooldowns and effect durations still apply. Wasting a tongue grab or burrow cannot make a lesson impossible. Ordinary campaign supplies are unchanged. Existing player names, stickers and level IDs remain intact; no save-era reset is added.

## Reproducible verification

`tests/fixtures/escape-kids-adventures.json` contains twelve legal input recordings: a main escape and an all-treasure tour for each adventure. `tests/escape-kids-adventures.cjs` replays them against fresh instances of the real engine, with every authored creature, trap and timer active. All twelve finish without an Oops. Tests also check changed starting phases for the main runs, two-frame simulation batches, fifteen-second start safety, repeatable treasure plates, endless supplies with cooldowns, recovery after the key, and guide actions.

The UI checks cover the twenty-to-twenty-one transition, the final sticker screen, preservation of earlier stickers, per-player guidance preference, desktop/touch rendering, endless-tool HUD and reading-card pause/resume. Level data checks include rectangular maps, valid checkpoint/patrol/note tiles, optional treasure totals and short note text.

```sh
node --test tests/escape-kids.cjs tests/escape-kids-adventures.cjs tests/ui.cjs
node scripts/record-kids-adventures.cjs
node scripts/record-kids-adventures.cjs --write
```

The recorder uses authored waypoints and the engine's walking route, producing ordinary analogue movement and tool inputs. It never disables a creature, edits the player position or grants a key. Tests replay saved inputs independently; they do not call the recorder. Practised main runs take about 26–52 seconds, treasure tours about 43–78 seconds. These are reproducible witnesses, not estimates of children's play time or success rates.

## Review with children

Try the new adventures with dots on, then off. Watch whether a child can recognise the button/door colours, read the trail notes, dodge a beetle, choose to swim instead of bounce, flick the lantern-house button and find the steam bypass. Check the touch layout on the actual phone/TV device. The original 20 levels, every new main route and every treasure remain available without a parent selecting a difficulty setting.

Automated wins establish solvability and catch regressions. Device performance, readability from a sofa and whether a child enjoys repeating a treasure detour still need hands-on feedback.
