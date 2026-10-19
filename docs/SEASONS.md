# Seasonal Adventures

From the main menu, choose **Seasonal Adventures**, then walk to or select **Autumn Hollow**. It is a separate adventure with its own save records. Campaign stars, challenge gates, first-try awards, story pages, bestiary entries and Little Explorers stickers are unaffected.

## Autumn Hollow: The Lantern Festival

Eight festival lanterns have gone dark. Find the key and return to the green door in each level to light one. All eight entrances are available immediately; the numbered order introduces the creatures gradually. Every treasure is optional. Catches return Sally to a reached flag, keeping keys, switches and collected treasure. Supplied tools are unlimited, with the normal cooldowns.

| Lantern | Level | Difficulty | What to discover |
| --- | --- | --- | --- |
| 1 | The Orchard Gate | Easy | An amber switch opens the orchard; a skeletal serpent patrols the far garden. |
| 2 | The Pumpkin Patch | Easy | Broad winding garden paths; glowing pumpkins warn before a vine lash. |
| 3 | The Gardener's Yard | Easy–medium | A courtyard gardener raises his arms before charging; the key opens a shorter return route. |
| 4 | Lantern Lane | Easy–medium | A ghost's cold beam and marked swoop; leaf refuges and an entirely visible map. |
| 5 | The Harvest Store | Medium | Two permanent switch doors and twitching haunted treat baskets. |
| 6 | The Hollow Mill | Medium | A safe stream, bridges, paired rabbit mounds, a mill-loft switch and the roast turkey's noisy-footstep response. |
| 7 | The Moonlit Maze | Medium | A compact hedge maze; the ghost and gardener occupy separate gardens. |
| 8 | The Last Lantern | Medium | Orchard, courtyard and lantern house; the key opens two lower gates for a different way home. |

There are **nine short trail notes** across the pack, including a separate introduction to the roast turkey. Step onto a paper sign to read it. Creatures and timers pause while reading; leave and return to read again. Guiding dots are optional and start **off**, so these play like traditional levels. Enable them under **Levels & keepsakes** if wanted.

## Creatures

These costumes preserve the existing collision shapes and underlying behaviours. They have new procedural silhouettes, animation tells and soft synthesised sounds; no external assets are downloaded.

| Autumn creature | Existing rules | Readable tell / response |
| --- | --- | --- |
| Skeletal serpent | Snake | Articulated spine and ribs, a skull and bone rattle; hide still in leaves or break sight. |
| Zombie gardener | Beetle | Jointed arms rise before its committed charge; dodge sideways or put a hedge in its way. |
| Ghost lantern keeper | Owl | Floating sheet, carried lantern and wall-clipped cold beam; leave the marked swoop circle. |
| Jack-o'-lantern | Toad | Ribbed pumpkin, pulsing face and green vine; step out of line or behind a hedge. |
| Haunted treat basket | Mimic | Woven basket, handles, visible lid twitch and giggle; use a pebble to expose its lunge. |
| Roast turkey | Fox | Waddling platter, drumsticks, herb crest and gobble; creep quietly or distract it with a pebble. |

The turkey uses a deliberately longer warning in these seasonal levels (`foxWarn: 1.05`, scaled by cunning), while ordinary campaign foxes retain their existing timing. Campaign hard mode does not hide this family pack's warnings.

## Keepsakes

- Finish all eight levels: **Copper Lantern** copper-and-burgundy skin, a glowing main-menu pumpkin and a Lantern Festival pennant.
- Find all ten treasure in each level: an additional friendly ghost on the main menu.
- **Levels & keepsakes** has outfit and menu-display toggles. The regular world-map Colours button also cycles through the earned outfit.

Rewards are derived from validated records, never from a date or a claimed unlock flag. They remain owned after the holiday. Records retain best time and greatest treasure independently. Saves are scoped through `EscapePlayers.storage()`, with a session fallback if storage fails.

## The crossroads and future packs

The hub has short paths toward veiled snowy pines, a sleeping blossom garden and tall summer grasses. Their buttons show countdowns, but cannot launch unbuilt content.

| Path | First intended opening, Toronto time | Content readiness |
| --- | --- | --- |
| Autumn Hollow | October 1, 2026, midnight | Ready: eight levels |
| Snowy path | December 1, 2026, midnight | Not ready |
| Blossom path | March 20, 2027, midnight | Not ready |
| Sunlit path | June 1, 2027, midnight | Not ready |

Dates are explicit ISO instants with the appropriate Toronto UTC offset in `escape-seasons.js`. A pack opens only after its date **and** when `ready` is true **and** its catalog contains real levels. When a countdown expires without ready content, it says **Coming soon**. Invalid dates also fail closed. Released packs remain replayable year-round; there is no annual save reset. Countdown text updates at most once per second from the wall clock, without background timers or a server dependency.

To add another season, add its authored route module before `escape-levels.js`, build its entries into `EscapeCatalog.seasonal` with a distinct `seasonal` pack ID, and configure its title, theme, content count, readiness and opening date. `seasonNodes()`, launch/retry/leave handling and `Progress` record validation are shared. Add the new pack's rewards explicitly rather than reusing Autumn Hollow completion rewards. Keep the readiness flag false until its actual engine solutions and controls pass.

## Controls and presentation

Walk with arrows/WASD, a controller stick/d-pad or the touch stick. Enter / controller A visits a nearby entrance after walking. Labelled portal buttons are also directly clickable, tappable and keyboard accessible. **V / controller View or X** opens the level list and collection; B / Escape / Android Back closes it, then backs out through the pack, crossroads and title. Walking pauses while options or the collection is open. Phone portrait orientation blocks play as elsewhere in the game.

Five seasonal score styles use three original chord/scale sets: rustic D-dorian harvest plucks, playful A-minor lantern bells, a flute-led mill variation and the warmer festival reprise. Existing adaptive tension/chase mixing and sound/music/ambience volume controls remain in use. Ambient beds add autumn breeze, wood creaks, quiet crows, stream water and sparse chimes. Normal mechanical warning sounds remain underneath the seasonal accents.

Hedges have amber/brown foliage, ground has cached leaf litter, the mill has wood-plank walls, and pumpkins/trees/lantern flags dress the maps. Leaf litter remains ordinary quiet floor. Static decoration uses one explicitly released graphics layer; animated leaves are bounded to twelve and disappear with reduced motion or Simple lighting. All creature silhouettes and gameplay warnings remain visible in Simple mode.

## Verification and review

`node scripts/record-seasons.cjs --write` creates sixteen real-input witnesses: one ordinary win and one all-treasure tour for every level. It advances the actual engine at 120 Hz and rejects any catch. No creature is removed, no collision is disabled, and Sally is not teleported. The authored waypoint tours are development instructions; the fixture stores only movement and legal tool inputs for independent replay.

`node --test tests/escape-seasons.cjs tests/ui.cjs` checks those witnesses, 15-second safe starts, delayed departures, batched rendering, checkpoints, return gates, tools, date boundaries, invalid saves, completion/mastery rewards, player isolation and menu/render flows. The mill treasure witness uses a real pebble distraction and records the turkey's gobble. The finale treasure tour uses quiet crawling in the house garden. Existing CI runs the full regression suite, static asset preparation, image build and server restart checks.

For review, try the first two levels, the turkey note beside the mill tunnel, then the finale's key/return gates. Complete the eight lanterns to try the outfit and menu keepsakes. A physical phone/controller and listening session are still useful for judging feel and sound balance; automated checks do not establish children's subjective difficulty or physical-device performance.
