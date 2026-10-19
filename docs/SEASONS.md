# Seasonal Adventures

From the main menu, choose **Seasonal Adventures**. Sally steps onto the Autumn Hollow trail in a continuous seasonal world, with winter, spring and summer as other areas of that same map. It uses the campaign terrain painter, articulated Sally rig, 120 Hz movement, walk/sprint speeds and following camera. Seasonal save records remain separate. Campaign stars, challenge gates, first-try awards, story pages, bestiary entries and Little Explorers stickers are unaffected.

## Autumn Hollow: The Lantern Festival

Eight festival lanterns have gone dark. Find the key and return to the green door in each level to light one. All eight entrances are available immediately; the numbered order introduces the creatures gradually. Every treasure is optional. Catches return Sally to a reached flag, keeping keys, switches and collected treasure. Supplied tools are unlimited, with the normal cooldowns.

| Lantern | Level | Difficulty | What to discover |
| --- | --- | --- | --- |
| 1 | The Orchard Gate | Easy | An amber switch opens the orchard; a skeletal serpent patrols the far garden. |
| 2 | The Pumpkin Patch | Easy-medium | Winding garden paths and faster glowing pumpkins that warn before a vine lash. |
| 3 | The Gardener's Yard | Medium | A quicker courtyard gardener; the key opens a shorter return route. |
| 4 | Lantern Lane | Medium | A ghost's cold beam and marked swoop; leaf refuges and a visible map. |
| 5 | The Harvest Store | Medium | Blue entry, green shelf and amber pantry switches; a narrow aisle and twitching treat baskets. |
| 6 | The Hollow Mill | Medium | Bridges, paired tunnels, a loft switch and a roast turkey on the required lower crossing. Creep or distract it. |
| 7 | The Moonlit Maze | Medium+ | A deep violet switch opens two crossings: the upper ghost route or the lower gardener route. |
| 8 | The Last Lantern | Medium+ | Two switches across orchard and courtyard, a serpent-proof lizard passage and a watched second switch; the key opens both lower return gates. |

Enemy pace now rises from 75% in the orchard to normal pace in the final four levels (previously 65–80%). Awareness steps up from lantern three. The last four maps add route decisions and required interactions rather than relying only on faster enemies. Existing level IDs, lantern records, outfits and keepsakes are retained; this balance update does not reset earned rewards.

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

## One seasonal world and future areas

Autumn Hollow is a full courtyard with eight numbered flags, an amber oak, lanterns, pumpkins, a mill pond and Wick the tortoise. Winding paths join it to a central clearing and three other regions. Each future region has its own weather veil: winter has windblown snow, frosted pines and steady Christmas lights; spring has rain, mist and blossom glimpses; summer has warm haze, grasses and flowers. These use the campaign's painted shapes and weather strokes. Full mode adds a bounded number of moving snow/rain strokes and gentle meadow sway; Simple mode and reduced-motion preferences keep the weather still. The veils keep future interiors mysterious without presenting unfinished levels. Their countdown gates can be approached on foot but cannot be crossed or fast-travelled into until real content is released. These are regions on the same map, not a second set of portal screens.

**World map [G / controller Y]** zooms out to show all four areas. Select Autumn Hollow to return to its trail; select a future area to walk to its closed gate. **Levels & keepsakes** offers the same choices as an accessible list. Selecting a numbered flag walks Sally to it; **Enter / A** starts the level when she arrives. All eight autumn flags are available immediately.

| Path | First intended opening, Toronto time | Content readiness |
| --- | --- | --- |
| Autumn Hollow | October 1, 2026, midnight | Ready: eight levels |
| Snowy path | December 1, 2026, midnight | Not ready |
| Blossom path | March 20, 2027, midnight | Not ready |
| Sunlit path | June 1, 2027, midnight | Not ready |

Dates are explicit ISO instants with the appropriate Toronto UTC offset in `escape-seasons.js`. A pack opens only after its date **and** when `ready` is true **and** its catalog contains real levels. When a countdown expires without ready content, it says **Coming soon**. Invalid dates also fail closed. Released packs remain replayable year-round; there is no annual save reset. Countdown text updates at most once per second from the wall clock, without background timers or a server dependency.

To add another season, add its authored route module before `escape-levels.js`, build its entries into `EscapeCatalog.seasonal` with the area's distinct pack ID, and configure its title, theme, content count, readiness and opening date. `EscapeSeasonWorld.areas` contains the area geometry, entry and gate; up to eight level flags are placed inside each area. Release checks also require real level data. Launch/retry/leave handling and `Progress` record validation remain shared. Add the new pack's rewards explicitly rather than reusing Autumn Hollow completion rewards. Keep readiness false until engine solutions and controls pass.

## Controls and presentation

Walk with arrows/WASD, a controller stick/d-pad or the touch stick. Shift / right trigger sprints at the campaign's speed. Click/tap a numbered flag to walk there; Enter / controller A enters the nearby level. **V / controller View or X** opens the level list and collection; **G / controller Y** toggles the overview, and LB/RB travel between released areas. B / Escape / Android Back closes the collection or overview first, then returns to the title. Walking pauses while options, the collection, overview or portrait rotation covers the world.

World terrain is rendered by the campaign's existing `drawEscapeWorldTerrain`, with regional palettes and cached seasonal landmarks. Sally uses `EscapeCreatureMotion` and `drawEscapeLizard`, not a DOM picture or separate movement animation. Movement and pathfinding share the campaign's fixed-step advance and route methods. Follow-camera chunks are bounded to sixteen and explicitly released on screen changes; overview chunks are drawn at 12 pixels per tile to keep the whole-world view small. There are no DOM measurements per tile and HUD bounds are cached. This is not a physical Shield benchmark.

Five seasonal score styles use three original chord/scale sets: rustic D-dorian harvest plucks, playful A-minor lantern bells, a flute-led mill variation and the warmer festival reprise. Existing adaptive tension/chase mixing and sound/music/ambience volume controls remain in use. Ambient beds add autumn breeze, wood creaks, quiet crows, stream water and sparse chimes. Normal mechanical warning sounds remain underneath the seasonal accents.

Hedges have amber/brown foliage, ground has cached leaf litter, the mill has wood-plank walls, and pumpkins/trees/lantern flags dress the maps. Leaf litter remains ordinary quiet floor. Static decoration uses one explicitly released graphics layer; animated leaves are bounded to twelve and disappear with reduced motion or Simple lighting. All creature silhouettes and gameplay warnings remain visible in Simple mode.

## Verification and review

`node scripts/record-seasons.cjs --write` creates sixteen real-input witnesses: one ordinary win and one all-treasure tour for every level. It advances the actual engine at 120 Hz and rejects any catch. No creature is removed, no collision is disabled, and Sally is not teleported. The authored waypoint tours are development instructions; the fixture stores only movement and legal tool inputs for independent replay.

`node --test tests/escape-season-world.cjs tests/escape-seasons.cjs tests/ui.cjs` checks all 64 entrance-to-entrance walks, all future gate approaches, collision boundaries, campaign-equivalent speeds, release gates, and the level witnesses. It also covers 15-second safe starts, delayed departures, batched rendering, checkpoints, return gates, tools, invalid saves, completion/mastery rewards, player isolation and menu/render flows. Mill witnesses use a real pebble distraction and record the turkey's gobble. Existing CI runs the full suite, real-browser desktop/mobile world and level rendering, static asset preparation, image build and server restart checks.

For review, try the first two levels, the turkey note beside the mill tunnel, then the finale's key/return gates. Complete the eight lanterns to try the outfit and menu keepsakes. A physical phone/controller and listening session are still useful for judging feel and sound balance; automated checks do not establish children's subjective difficulty or physical-device performance.
