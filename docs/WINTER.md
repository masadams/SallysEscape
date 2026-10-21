# Winterlight Hollow

Winterlight Hollow is the second area on the continuous seasonal world map. It is independent of campaign unlocks, Little Explorers, upgrades and leaderboards. Its eight compact escapes use the regular Sally rig, controls, collision and retry rules. Treasure is optional; supplies are finite. All eight entrances are open for testing.

Pip's Christmas tree has lost its star. Each escape lights an ornament on the village tree; the eighth restores its star. Entrance cards, readable field notes and the collection panel explain the route and its new mechanics.

| Ornament | Escape | Difficulty | What it introduces |
| --- | --- | --- | --- |
| 1 | The Snowy Welcome | Easy | Switch, return gate, small practice ice patch, Candy Cane Serpent |
| 2 | The Skating Pond | Easy | Acceleration, braking, snowy islands, Grouchy Snowman |
| 3 | Snowball Alley | Easy–medium | Rumble warning, rolling snowball lane, switch detour |
| 4 | The Missing Presents | Medium | Three workshop switches, Suspicious Present, Gift Snatcher, quiet movement |
| 5 | The Frozen Mill | Medium | Tongue-operated bridge, genuine open millrace, loft key, return bridge |
| 6 | The Yeti's Pass | Medium–hard | Warned charge, stone cover, icicle rhythm, mountain ice |
| 7 | Bells in the Blizzard | Hard | Light-shy Krampus, Winter Wisp, warmth shelters, gusts, optional thin ice |
| 8 | The Christmas Star | Hard | Nutcracker beam, remote switch, serpent slits, combined return route, Yeti side passage |

## Difficulty

The pack runs from easy to hard. Cunning is how sharp the creatures are (0 to 3): higher means they
read where Sally is going, react sooner and search longer.

| # | Cunning | What makes it harder |
| --- | --- | --- |
| 1–2 | 0 | — |
| 3 | 1 | — |
| 4 | 2 | A second Gift Snatcher in the workshop |
| 5 | 2 | A Candy Cane Serpent in the mill yard |
| 6 | 2 | A snowman in the far garden; the far gate wakes a serpent |
| 7 | 3 | A serpent on the upper trail; the bells wake a Gift Snatcher; two snowballs |
| 8 | 3 | The key wakes a serpent and a Gift Snatcher by the hatch; two snowballs |

## Ice and hazards

`slippery: [[x,y], ...]` marks walkable ice floors. It is deliberately separate from the existing `I` reflective ice wall. The shared `escape-ice.js` steering model runs within the existing 120 Hz simulation. Ice takes time to accelerate and change direction, coasts when input is released, and supports counter-steering. Crawl gives stronger grip and braking. Snow and wooden bridge ends restore traction. Walls cancel the blocked velocity component; pause and retry cannot retain stale movement. The welcome level and village skating pond also teach a marked downhill strip: it carries Sally south without input until she steps off or reaches its end. Chevrons show the direction.

`currents` now supports `surface: 'ground'` for directional ground slopes. Without that flag it retains the existing water-only stream behaviour. Ground slopes can be combined with `slippery` floors; walkers can steer sideways to escape, while bodies still collide normally at an end wall. The level builder exposes Water stream / Ground slope, direction and strength, and preserves them through save/load. Click-to-walk compensates for flow so it can still reach entrances. Ordinary campaign ground keeps its original movement path. Walking winter creatures gain inertia on marked ice; flying creatures and committed fox/Yeti attacks keep their existing readable attack rules. Existing serpent chase momentum remains intact.

Rolling logs wear snowball art and retain the rumble and collision timing. Thorn traps wear icicle art. Existing crumble tiles become visibly cracked thin ice and collapse into real gaps. The millrace remains unfrozen, impassable water until its bridges open. Cold and gusts reuse the campaign's warmth and wind systems; warm shelters offer safe recovery. No new random hazards are added to the recorded routes.

## Creature costumes

| Winter creature | Existing behaviour |
| --- | --- |
| Candy Cane Serpent | Snake patrol and chase |
| Yeti | Beetle's announced, committed charge and wall recovery |
| Gift Snatcher | Fox's hearing and announced pounce; longer winter warning |
| Krampus | Spider, tangled ribbons, existing glow-mushroom retreat and watch behaviour |
| Grouchy Snowman | Toad's warned ranged strike |
| Suspicious Present | Mimic's reveal and pursuit |
| Winter Wisp | Owl's wall-clipped gaze, marked swoop and return |
| Nutcracker Watchman | Sentinel's glint, beam and freeze warning |

Every costume retains the original collision shape and warning geometry. Seasonal names also appear in transient warnings and catch messages. The Gift Snatcher is an original green holiday thief, rather than a borrowed character asset.

## Village, presentation and controls

Winter occupies its existing northern region on the campaign-style seasonal map. Snow-laden pines, lit cabins, Christmas lights, snowmen, braziers, frozen ponds, the ornament tree, drifting snow and a subtle aurora share the game's procedural art language. Pip stands near the southern trail. The sledding hill sits clear of entrances: Visit the sledding hill walks Sally to a real steerable sled; movement steers, Crawl brakes, Enter/A and Back dismount. Travel also dismounts. Its bounded loop has no enemies or penalties.

World terrain uses the existing bounded chunk cache. Level props and ice paint use one disposable scenery buffer per run. Full lighting adds soft firelight and snow; Simple keeps clear ice and creature silhouettes with fewer effects. Reduced motion freezes decorative sledding, snow, aurora and menu movement. No per-frame terrain graphics are allocated.

Original synthesized bell, pluck and flute arrangements vary between village, workshop, frozen mill, night and finale. Wind, creaks and bells form the ambience. Eight original creature cues, a soft snowball impact and icy footsteps use the existing audio mixer, volume controls, offline cache and voice limits. Winter throws are snowballs: white ball, matching tool icon, desktop/touch labels, tooltip and impact sound. They retain the pebble distraction, bank, daze, aiming and finite-supply rules. Other areas retain pebbles. No remote audio or art downloads are needed.

## Input consistency

Campaign, Autumn and winter share the same joystick, keyboard movement and controller mappings. Input follows the last device used: touching the screen restores touch controls after using a connected controller, and a resting/held pad cannot steal them back without fresh input. Touch prompts show tappable actions, keyboard prompts show keyboard shortcuts, and controller prompts show controller buttons. Seasonal A enters, B goes back, X opens the collection, View opens the map, LB/RB change area, RT sprints and LT crawls. Seasonal entry/collection panels no longer leave keyboard focus on an unrelated button or retain an open toolbar that blocks movement. Real Chromium checks dispatch actual touch drags and throws, keyboard events, and Gamepad API input in all three worlds.

## Rewards and saves

Completing all eight winter escapes earns Winterberry colours and a Christmas tree on the main menu. Finding all ten treasure in every escape adds a sledding snowman. The main tree displays the earned ornaments while playing. Winter and Autumn keepsakes appear together; the Colours control cycles owned seasonal outfits and campaign colours. Existing Copper Lantern saves migrate without losing their rewards. Saves remain per player, under the existing seasonal storage key, and validate content revisions, times and treasure totals.

## Access switch

In `public/escape-seasons.js`, the winter pack is currently `ready: true, access: 'open'`. Set `access: 'scheduled'` to use its explicit `opensAt` timestamp, or `access: 'closed'` to close it regardless of date. Access always requires actual ready content. Closing winter restores its blizzard and peeking Christmas lights, blocks travel and level launch, and moves an occupied walker to the gate safely. Records and rewards are retained. `opensAt` is a first release date, not an annual progress reset.

## Verification and authoring

`public/escape-winter.js` contains authored maps, creature routes, notes, tools, ice and triggers. `scripts/winter-tours.json` contains reviewable waypoint tours. `node scripts/record-winter.cjs --write` generates 16 reproducible runs with real analogue movement, actual ice, limited tools and every hunter/hazard active. It rejects catches, Oops, missing treasure and incomplete runs. The compressed fixture `tests/fixtures/escape-winter.cjs` is JSON data, decoded with Node's built-in gzip reader; compression keeps thousands of analogue input frames out of the readable PR diff.

`tests/escape-winter.cjs` independently replays all normal and all-treasure runs, checks geometry, supplies, safe starts, switch completion, rewards and batched frames. `tests/escape-ice.cjs` covers momentum, counter-steering, Crawl braking, collision, pause/retry, frame consistency, world routes, sledding and occupied-region closure. The existing Autumn, campaign, kids, music, audio, UI and server suite remains enabled.

`scripts/smoke-winter-browser.cjs`, called by the existing real-Chromium smoke, checks desktop/mobile winter rendering, Full/Simple/reduced-motion art, accessible menus, actual coast movement and sled mounting/dismounting. The combined browser check renders all sixteen seasonal levels, measures all fourteen creature cues through real Web Audio, checks keepsakes and captures review screenshots. PR CI also builds and restarts the standalone container.
