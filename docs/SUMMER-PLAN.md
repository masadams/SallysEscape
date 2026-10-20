# Sunshore Cove — summer area proposal

Status: design for review; no summer gameplay, release-date change or unlock is implemented by this document. Companion plan: [Blossom Hollow](SPRING-PLAN.md). Shared delivery requirements: [seasonal roadmap](SEASONAL-AREAS-PLAN.md).

## Identity and story

Sunshore Cove is a warm coastal village with dunes, a working harbour, rock pools and a small lighthouse. Its eight compact escapes follow **The Last Light of Summer**: Sally helps the keeper recover eight sun-shaped lens pieces before the evening boat parade. Each completion restores part of the harbour’s lantern line; the final lens brings the lighthouse back to life.

The area moves visually from a bright beach to sunset and a warm evening harbour. Weather and time are authored per level, not tied to the device clock. The story has no gameplay deadline. Beach toys and festival bunting give children a clear summer theme without turning every enemy into a joke or making the layouts empty.

Target: eight easy-to-medium levels, regular campaign controls and retry rules, finite supplies and optional treasure. The challenge comes from readable crossings, timing, sight lines and alternate routes. Water must feel like a meaningful part of Sally’s existing game rather than a separate boat game.

## Place on the shared world map

Use the existing southwest summer footprint centred near (20,55), keeping the northern gate near (20,42) and the approach from the shared seasonal crossroads. Retain the eight established entrance anchors unless route testing requires a documented change.

Layout:
- North: dune entry, weathered sign, shaded picnic shelter and guide **Marina**, a coastal tortoise in the existing NPC style.
- Northwest: sandy garden and first entrance, driftwood fences and the beach hut.
- West and south: beach path, little tide pools and the first clear view of the lighthouse.
- East: a compact harbour/boardwalk cluster, fish crates, mooring posts and a boatshed.
- Centre: the lighthouse and its circular path, using the existing pond footprint as a small harbour basin with explicit bridges.
- The numbered flags form a visible loop around the harbour. Short cross-paths make replays quick; boardwalks should not route across an unmarked gap.
- The sea continues visually beyond the playable coast. Rope fences, rocks and banks provide readable boundaries; no apparently open beach ends at an invisible wall.

The world is safe. Passing gulls, crabs, anchored boats, kite flyers and distant swimmers are decorative; they do not catch Sally. No dynamic tide may cut off an entrance in the overworld. Use a fixed accessible waterline there.

**Safe world activity:** a kite lawn. Walking across it pulls a small decorative kite behind Sally, without changing acceleration or adding a tool button. Leaving the lawn or travelling puts it away. An optional interaction can raise a fixed festival kite using the shared Enter/A/tap action; level entry takes priority nearby. This is presentation work, not a new steering or flight system.

### Closed-area treatment and countdown

Before release, obscure the coast with sunlit marine haze, tall swaying dune grass and a soft sea-mist bank. Let a striped lighthouse roof, small bunting triangles and its low warm window peek through. Keep readable hints of coast rather than exposing a fully playable-looking beach behind a generic circle.

Countdown text sits on a fixed weathered gate sign with a dark backing and clear contrast. Simple mode uses fewer static grass layers; reduced motion freezes shimmer, grass and bunting. Avoid high-frequency heat distortion, flashing lighthouse beams or sound played from a locked area.

Preserve the current first-opening timestamp of June 1, 2027, midnight America/Toronto unless separately changed. Readiness still gates access. Future closure safely returns Sally to the northern approach, cancels click-to-walk and clears any kite visual.

## Creature roster

The coast can reuse more native campaign species than winter. Give them a coherent summer appearance rather than disguising their behaviour. Every creature needs its normal tell, collision, tool responses and warning geometry.

| Summer creature | Existing base | Appearance and sound | Route job / counterplay |
| --- | --- | --- | --- |
| Sandstripe Serpent | Snake | Sandy gold bands and dark eyes; dry grass rustle | Patrol/chase through dune fences. Corners, leaves and distractions work normally. |
| Shellback Crab | Hermit crab | Weathered spiral shell, bright claws, sand puffs; hollow shell tap | Guards a fixed sideways lane. Read its peek, cross while tucked in, or use a pebble. |
| Rockpool Eel | Eel | Turquoise body, bright visible eyes and ripple outline | Lurks at water edges and lunges after its native tell. Wide bank clearance and low-tide timing matter. |
| Dune Scorpion | Scorpion | Ochre shell, clear dark tail silhouette; dry rattle | A visibly marked danger ring. Cross while the tail is down; do not bury the first one. |
| Harbour Gull | Magpie | White/grey gull shape with a yellow bill; short caw-like gull call | Harmless lookout and shiny-tool thief. A pebble or mushroom sends it away; it must not look like a swooping attacker. |
| Reed Heron | Bog heron | Tall pale coastal bird and long dark beak; reed creak before its tell | Rooted strike line beside a lagoon. Pass behind, bait the stab, or use the existing submerged-swim rule. |
| Sunskimmer | Dragonfly | Copper-blue wings, dotted fixed route and visible corner hover | A timing obstacle. Cross behind it or swim beneath; pebbles and leaves do not fool it. |
| Sailfin Hunter | Fish | Bright dorsal fin and a clear moving wake, with a sharp splash cue | Existing fish water patrol/chase, introduced in a roomy lagoon. Break water sight and reach a safe bank; audit native fish behaviour before choosing exact parameters. |

Costume-only changes: serpent, crab, eel, scorpion, gull, heron and dragonfly. Sailfin is also planned as a fish reskin, but its route and pursuit parameters require a source audit and recorded proof before level authoring. If the fish cannot make a fair small lagoon, substitute the existing sea snake rather than inventing a new aquatic AI.

Do not turn the gull into an owl while keeping magpie theft logic: silhouette, animation and notes must teach the actual job. No damaging jellyfish, sharks, pirate boss or new health system is needed for this pack.

First encounters show one creature’s rule at a time. Combine at most two live threat zones on required crossings. A crab lane and an eel pool must not jointly remove every safe exit.

## Terrain, tools and features

| Feature | Reuse or new work | Intended use and boundaries |
| --- | --- | --- |
| Sand and driftwood boards | Existing ordinary/noisy ground, new art and audio | Sand has ordinary traction. Some shell-gravel/loose boards are visibly noisy using existing sound rules. Do not silently slow every beach tile. |
| Tidal flats | Existing tide tiles/system | Wet sand becomes swim water on the native cycle. Use obvious wet edges, fixed high-ground islands and a clear warning. No new continuous wave collision. |
| Stream and inlet flow | Existing water-only currents | Directional foam and reeds show flow; early practice channel has frequent side exits. Mandatory routes never require outswimming a stronger current. |
| Dune slide | Existing ground-current surface | A short chevron-marked sandy slope carries Sally one way until she steps off or reaches its end. Use normal ground grip unless deliberately marked otherwise; summer does not inherit global winter ice. |
| Breeze lanes | Existing periodic wind | Bunting and streaks show direction and buildup. Safe pockets allow a full-cycle wait. Wind cannot push a beginner straight from spawn into danger. |
| Boardwalk gates | Existing switches/bridges | Fixed structural crossings with clear raised/open state. Any one-use plank is optional until a deterministic safe return is proved. |
| Driftwood roller | Existing rolling-log trap | Harbour cargo/log with the existing warning lane and recovery. Prefer clear rolling wood to an oversized beach ball that looks harmless. |
| Lighthouse restoration | New presentation/progress hook | Eight lens pieces brighten world lanterns. Decorative beam remains distinct from an enemy gaze and does not affect detection. |
| Water and shore rendering | New themed procedural rendering | Foam, bank shadows, shallow/deep colour and restrained glints. Water collision and breath rules remain those of the engine. |
| Kite lawn | New safe presentation interaction | Reuses walking and shared interaction; no airborne Sally or new input mapping. |

Keep thrown distractions labelled **Pebble**; draw a pale beach pebble and use the ordinary bank/daze/finite-charge rules. A shell could be a future cosmetic option, but the first summer implementation should avoid confusing it with shell-shaped treasure or the crab enemy.

Avoid a mandatory diving upgrade, sunscreen/heat meter, random storm, player-controlled boat or new swimming controls. Summer’s two primary lessons are reading the shore’s rhythm and planning a short safe water route.

## Eight-level layout

These dimensions are design targets, not final authored maps. Keep rooms small enough to read the next safe place; prefer a purposeful loop and changed return over a large empty arena.

| # / proposed ID | Escape | Size target | Difficulty | Main puzzle / introduced threat |
| --- | --- | --- | --- | --- |
| 1 / summer-dunes | The Dune Gate | 19×13 | Easy | Switch loop, serpent and optional teaching slide |
| 2 / summer-crab | The Crab’s Crossing | 21×15 | Easy | Two separated crab lanes, tide-pool cover |
| 3 / summer-tide | The Turning Tide | 21×15 | Easy–medium | Native tide rhythm, fixed safe islands, one eel |
| 4 / summer-gull | The Gull’s Boardwalk | 23×15 | Easy–medium | Shiny distraction, lookout and harbour switches |
| 5 / summer-lagoon | The Reed Lagoon | 23×17 | Easy–medium | Heron bank line, gentle current and Sunskimmer |
| 6 / summer-boatshed | Beneath the Boatshed | 23×17 | Medium | Cargo roller, tongue bridge control and dune scorpion |
| 7 / summer-inlet | The Sunset Inlet | 23×17 | Medium | Sailfin pursuit, shore exits, optional flow shortcut |
| 8 / summer-lighthouse | The Lighthouse Lantern | 25×17 | Medium | Tide, gull and crab courts; final lens and alternate return |

### 1. The Dune Gate
A short fenced path curls around a beach hut into a small dune garden. A switch opens the key alcove; a single serpent patrols a loop with two sight-breaking corners. The return gate leads directly toward the start exit. Ordinary walking should be enough to understand and finish it.

Treasure: a short marked sand slide into a sheltered cove. A side staircase/path returns to the main route, so the lesson cannot strand Sally. Put clear directional chevrons in the sand and safe floor at the end. No water threat in this first level. Three pebbles are a starting supply target, not unlimited refills.

### 2. The Crab’s Crossing
A boardwalk separates two small shallow-looking pools. The first crab guards a single lane with a wide viewing platform before it; its shell and sideways movement teach the rule. A second lane lies beyond a key-and-switch loop, separated enough that the two crabs cannot catch Sally in the same move.

Treasure: a shorter but more exposed crossing where a pebble buys a safe interval. Keep the mandatory route possible by timing alone. Scenery shells must look less animated and less prominent than the crab; neither the key nor exit can be hidden behind its body.

### 3. The Turning Tide
A three-island causeway gives a safe place to wait at every stage. The first crossing has no hunter and teaches that wet sand becomes water. An eel lives beside the second crossing with a marked ripple and enough bank clearance to walk around at low tide. The key sits on permanent high ground.

Treasure: a low-tide side pocket reached and exited within a generous cycle, with a high-ground refuge if Sally waits too long. All mandatory islands remain safe at high tide. Prove completion from every tide phase at entry, not only the recorder’s preferred start offset. No race to cross an entire map before flooding.

### 4. The Gull’s Boardwalk
A square harbour loop has stacked crates, two shutters and a gull perched above the central junction. An early sign explains that it watches and steals shiny throws. Sally sends it to a visible side perch/item, crosses behind the crates, then opens a shutter to the key.

A serpent occupies one branch so the gull’s call has a meaningful consequence, but hearing that call never makes a catch unavoidable. Treasure: a separate pier requiring one more distraction or a well-timed covered approach. Finite charges must not assume that a stolen mushroom remains usable shelter.

### 5. The Reed Lagoon
Two dry reed courts surround a small lagoon with a weak directional current. A heron covers one straight bank, while the opposite bank has safe stone cover. A Sunskimmer crosses a clearly dotted loop above a separate water stretch. Introduce those jobs in successive chambers.

The key loop can be completed by a short swim and bridge switch. Treasure: a reed island crossed just after the dragonfly passes; include a visible landing bank. Keep required swimming within breath without upgrades. A sign explains that reeds only hide Sally where the actual cover terrain exists.

### 6. Beneath the Boatshed
Three compact storage bays form a loop around one rolling-cargo lane. A warning platform shows the roller before Sally crosses; an alcove between crossings lets her wait without being hit. A tongue switch across the harbour channel opens a normal bridge to the key loft. A scorpion guards the optional shed yard rather than the roller’s only escape square.

Treasure: a short timing route in the yard while the tail is down. No need to hear a roller behind an opaque wall with no visual warning. The mandatory bridge must remain open for the return; any crumbling plank belongs to a bonus shortcut with a second exit.

### 7. The Sunset Inlet
Two short swims connect three permanent shore platforms. The Sailfin’s first pool has a broad escape bank and a stone pier that breaks pursuit sight using the actual engine rules. A walking route between the next pools prevents one uninterrupted chase across the whole level.

A remote switch opens the final shore gate. Treasure: a side current channel that is faster downstream but has two obvious landing pockets and a land route home. If the fish’s native pursuit cannot give a reliable easy-to-medium route, swap to sea snake and retune the lesson before recording. No aquatic enemy is allowed to spawn in the player’s safe landing pocket.

### 8. The Lighthouse Lantern
The finale has three small linked courts: read the tide at a short causeway, distract the gull at the stores, then time a crab lane below the lighthouse. Each court has a place to stop and look. A final tongue switch from the tower platform opens a perimeter bridge home with the lens.

Treasure: a sunset annex with a scorpion or Sunskimmer, away from the required tide/crab crossing. Do not combine the fish, eel, current and tide in a single closing gauntlet. The last lens completes the lighthouse after the result is saved; the beam is a reward, not a new timed boss hazard.

## Art, lighting and sound

Match the campaign’s procedural art, character rigs, terrain scale and UI. Summer palette: warm sand, teal shallows, deep blue channels, sea-green reeds, weathered wood and coral bunting. Give the lighthouse the same simple shapes and material treatment as the game’s existing cabins and towers.

Better water should add depth cues rather than visual noise: darker banks, a soft shallow gradient, post reflections, stable flow streaks and sparse foam at edges. Treasure and eel tells must remain legible on bright water. Avoid screen-wide glare and dense sparkle particles. Tide changes need an unambiguous floor/water state in both graphics modes.

Full mode adds low-cost water glints, long sunset shadows, warm harbour windows and restrained floating dust. Simple mode keeps the same geometry, safe-bank contrast and warning visibility. Reduced motion freezes decorative flags, kite sway and glints; actual currents, hazards, tide warnings and creature tells remain readable and functional.

Music: original mellow plucked strings, wooden marimba-like notes, soft flute and occasional hand percussion. Beach music is warm, not frantic; tide levels leave room for warning sounds; the boatshed gets a measured wooden pulse; sunset uses a gentler phrase; the lighthouse completes the area’s melody. Use the existing synthesizer/mixer and offline asset pipeline, with no remote licensed tracks.

Ambience: quiet surf, buoy knocks, rope creaks, distant gulls and light grass rustle. Random distant gull calls must sound distinct from the lookout’s actionable call. Shoreline audio should not imply a dangerous current where none exists. Water entry, tide warning, roller and enemy cues retain visual equivalents and current volume controls.

## Progress and rewards

Each escape restores one sun lens and adds a warm lantern to the world harbour. Completing all eight earns **Sunshore Sally**: sea-glass teal body, warm sand belly, coral crest and gold flecks on the regular rig. Add a miniature lighthouse to the main-menu keepsakes.

All treasure in all eight adds a small anchored sailboat beside that lighthouse. Its bob and the lighthouse’s slow light sweep stop under reduced motion; no flashing beam. Rewards remain cosmetic, owned per player and compatible with Copper Lantern, Winterberry and Blossom Sally.

The waterwheel, Christmas tree, autumn lantern and lighthouse should compose into the existing keepsake space at phone sizes. If they do not fit, use a tidy shared shelf or paging within the existing panel rather than shrinking the main title or covering controls.

## Summer acceptance checks

- Record eight normal and eight all-treasure wins with real tides, breath, currents, hunters and finite tools.
- Verify mandatory routes from several tide phases, including high-water arrival and a player who waits a full cycle.
- Check every high-ground refuge and swimming exit at every tide state; no phase strands the key, exit or treasure.
- Confirm native crab lanes, eel ripples, scorpion rings, gull theft/alarm, heron strikes, dragonfly loops and audited fish pursuit match the costumes and notes.
- Test underwater safety rules explicitly; do not assume every aquatic or flying enemy ignores a swimmer.
- Check ground-slope side exit/end collision and prove ordinary summer sand retains campaign traction.
- Test lighthouse reward persistence, gate closure, safe world routes, kite cleanup and all-season outfit/keepsake combinations.
- Render all levels/world at desktop, phone and tablet sizes with Full/Simple/reduced motion; inspect bright-water contrast and warning occlusion.
- Run shared real-browser touch, keyboard/mouse and controller paths, plus sound/mute/pause/visibility-resume and container checks.
