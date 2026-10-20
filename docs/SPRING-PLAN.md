# Blossom Hollow — spring area proposal

Status: design for review; no spring gameplay, release-date change or unlock is implemented by this document. Companion plan: [Sunshore Cove](SUMMER-PLAN.md). Shared delivery requirements: [seasonal roadmap](SEASONAL-AREAS-PLAN.md).

## Identity and story

Blossom Hollow is a rain-fed walled garden waking after winter. Its eight compact escapes follow **The First Blossom Festival**: a blocked mill channel has left the central blossom tree asleep. Sally retrieves eight carved flower tokens from garden sheds, burrows, the glasshouse and the mill. Each completion restores one part of the village garden; the last turns its little waterwheel and lights paper flower lanterns around the tree.

The tone is curious and welcoming: dripping leaves, muddy footprints, crooked potting sheds, beetles in gardening clothes and an overgrown greenhouse. Easter-like painted eggs may decorate the garden, but the core story and rewards remain useful throughout spring. No holiday deadline or calendar reset removes earned progress.

Target: eight easy-to-medium levels with the regular campaign movement, finite tools and full retry rules. The main route is approachable; optional treasure asks for sharper observation, a second crossing or a clever distraction. This is seasonal campaign content rather than another Little Explorers pack.

## Place on the shared world map

Use the existing southeast spring footprint centred near (55,55) in the 76×76 seasonal map. Keep the western approach and gate near (42,55); do not create a separate level-picker world. Retain the eight established entrance positions unless collision/path review proves a change necessary.

Layout:
- West: a little entry bridge and rain shelter, the guide **Clover** (the campaign map already has a local called Fern), and the first two garden entrances.
- Northwest and north: blossom orchard, potting shed, seed racks and a glasshouse. Clear paths connect entrances 2–4.
- East: stone mill, waterwheel and a shallow-looking but mechanically explicit mill channel. Entrances 5–6 overlook it.
- South: firefly grove, festival lawn and entrances 7–8.
- Centre: restored blossom tree, circular gravel path, flower lanterns and a bench. It must remain a useful navigation landmark at both zoom levels.
- A boardwalk over the existing central pond uses real walkable bridge geometry. Reflections and lily pads are decoration unless explicitly authored as gameplay terrain.

A continuous, readable path connects all eight flags. Side paths end in small visual scenes, never in invisible boundaries. Trees and roofs must fade or clip using the campaign conventions when they cover Sally or an entrance. Water, flowerbeds and mill walls have collision matching their art.

**Safe world activity:** a short lily-hop trail using the existing bounce-cap arc and fixed marked landing pads. It is optional, has no timer or catch state, and lands Sally back on reachable land. Use the normal movement controls to approach it; do not add a new jump button. It must not launch Sally while reading an entrance card. Decorative frog hops are separate from this activity.

This is **new world-map work**, not reuse: bounce caps exist only inside escapes, and the seasonal world model has no flight (only winter's sled). Budget it as a small world feature after the eight levels, or leave it out of the first spring release.

### Closed-area treatment and countdown

Before release, cover the garden with a slow spring rain curtain and soft low mist. The greenhouse roof, warm window, waterwheel silhouette and a few pink branches peek through. This conveys a wet garden beyond the gate instead of an opaque generic bubble. Lightning is not part of this gate effect.

Keep the countdown on a dark, readable sign anchored at the approach. The weather remains behind the sign. Simple mode uses static rain streaks/mist; reduced motion freezes decorative drops and drifting petals. Closing an occupied area returns Sally to the safe gate and cancels any lily-hop/target state.

The current first-opening timestamp is March 20, 2027, midnight America/Toronto. Preserve it unless separately changed. No open access is implied by this proposal; content must be ready before a date can unlock it.

## Creature roster

Eight readable seasonal creatures, all built around existing jobs. Costumes preserve collision size, attack timing, sight geometry and tool responses unless an explicit tuning pass documents a difference.

| Spring creature | Existing base | Appearance and sound | Route job / counterplay |
| --- | --- | --- | --- |
| Ribbon Grass Snake | Snake | Leaf-green body, pale blossom bands, tiny seedpod rattle | Patrol/chase around hedge corners. Break sight, use leaves or distract it. |
| Stag Gardener | Beetle | Rounded brown shell, small twig antlers and apron-like leaf markings; digging snort | Warned committed charge. First dodge in a safe yard; later lure into a cracked potting wall. |
| Mud Mole | Mole | Muddy paws and a little root tuft; audible soil shuffle plus visible ripple | Hunts footsteps. Crawl or stop, use moss, or lure it with a pebble. Never depend on sound alone. |
| Lily Toad | Toad | Mottled pond colours, lily-leaf cap; hollow plunk before its native tell | Watches a straight channel. Cross behind a pot or hedge; respect the tongue line. |
| Blossom Mantis | Mantis | Petal-shaped forelegs, visible twig kink, pink/cream silhouette | Short rooted ambush cone. Notice the tell and go behind it or bait the strike. Never invisible among decorative petals. |
| Ladybird Lookout | Ladybird (new in the campaign) | Glossy red shell with cream spots; soft wing buzz | Never catches. Near Sally on her feet it plays dead; rushed, startled by a pebble or crowded when it rights itself, it flies up buzzing and every hunter in earshot learns where she is. Crawling past never startles it. Makes a patrol matter, like the campaign cricket, and is the most garden-like alarm. |
| Lantern Moth | Moth | Broad translucent wings with pale flower marks; soft flutter | A moving light that exposes Sally in leaf cover. Time the crossing; friendly-looking art must still communicate its danger. |
| Garden Weaver | Spider | Dew-beaded legs and threads between stakes; soft plucked web cue | Weaves slowing webs and retreats from thrown glow light. Light buys a crossing; darkness ends that shelter. |

Mud Mole deliberately remains a recognisable mole; it does not need a novelty disguise. Moth and ladybird keep their insect silhouettes so the tongue interaction remains understandable. No harmless pollinator is made hostile merely to fill a roster slot.

First exposure is isolated and signposted. Later combinations use at most two overlapping threats on the mandatory route, generally three distinct creatures total in a level. Decorative bees, butterflies and frogs never use warning markers or enemy silhouettes.

## Terrain, tools and features

| Feature | Reuse or new work | Intended use and boundaries |
| --- | --- | --- |
| Moss, leaves, mud and gravel | Existing terrain, spring textures | Moss is quiet; leaves provide existing cover; mud retains its normal slowdown. Wet grass is ordinary ground unless marked. Rain does not silently change grip. |
| Mill streams | Existing water-only currents | Directional flecks and arrows show flow. Start with weaker flow and frequent side exits. A required crossing never needs sustained swimming against a current stronger than Sally. |
| Burrow pairs / soft dirt | Existing tunnels and dig-in | Mounds have paired flower marks; stone floors stay non-burrowable. Fixed tunnels teach a shortcut before any combination with a mole. |
| Lily hop pads | Existing bounce caps inside levels, themed art (the world-map trail is separate new work) | Show departure, arc and landing clearly. No steering in flight or new jump input. Preserve flight safety and collision rules. |
| Spore beds | Existing puffballs and spore tool | A greenhouse crossing teaches cloud concealment. Flower perfume is only presentation; it does not invent a new status effect. |
| Seed planters | Existing seed tool, implementation audit first | Use only supported seed surfaces and existing outcomes after checking the engine/builder. If they cannot support the proposed shortcut deterministically, use a remote gate instead. No required seed mechanic until this audit passes. |
| Waterwheel restoration | New presentation and progress hook | Eight tokens change world decoration. Wheel movement cannot alter a saved level’s puzzle state or trap Sally in the world. |
| Rain and petals | New themed rendering/ambience | Decorative, bounded particles and cached surfaces. Never hide attack markers, treasure, gates or narrow paths. |
| Dew-speckled glass | New scenery treatment | Greenhouse windows remain scenery. Opaque stone and actual walls keep existing sight rules; no unannounced see-through wall mechanic. |

Pebbles remain pebbles, with a smooth river-stone appearance at most. Keep throw range, banking, daze and charges unchanged. Glow mushrooms remain recognisable. Do not call the thrown tool a seed when the existing Seed tool is a different action.

No new fluid solver, rain traction model, growing maze or pollen health meter is required. Spring gains its character through the combination of water, quiet ground, burrows, plant cover and lighting.

## Eight-level layout

Dimensions below are target tile footprints, subject to real-route validation. Aim for about 60–75% of walkable space to serve the mandatory route, meaningful return route or optional challenge. Avoid vast blank rooms and decorative dead ends.

| # / proposed ID | Escape | Size target | Difficulty | Main puzzle / introduced threat |
| --- | --- | --- | --- | --- |
| 1 / spring-gate | The Rainy Garden Gate | 19×13 | Easy | Hedge loop, one switch, Ribbon Grass Snake |
| 2 / spring-burrows | Under the Potting Shed | 21×15 | Easy | Paired burrows, quiet moss, Mud Mole |
| 3 / spring-pond | Across the Lily Pond | 21×15 | Easy–medium | Safe flow crossing, Lily Toad, marked hop |
| 4 / spring-glasshouse | The Glasshouse Lookout | 23×15 | Easy–medium | Alarm and petal ambush, greenhouse switches |
| 5 / spring-mill | The Sleeping Waterwheel | 23×17 | Easy–medium | Two bridge controls, mill current, remote tongue switch |
| 6 / spring-wall | The Gardener’s Shortcut | 23×17 | Medium | Stag Gardener breaks a cracked wall, alternate return |
| 7 / spring-lanterns | Lanterns After Rain | 23×17 | Medium | Moth light, Weaver webs and temporary glow shelter |
| 8 / spring-festival | The First Blossom | 25×17 | Medium | Compact three-part garden finale and readable return |

### 1. The Rainy Garden Gate
A U-shaped hedge route wraps a potting courtyard. The start alcove contains the first field note and room to practise. Sally walks through leaf cover, flicks a reachable switch, loops past one serpent, takes the key and returns through the opened gate. A pot and hedge corner separate the switch lesson from the chase.

Treasure: ten total, with a short side loop behind the serpent’s patrol. It must not require a body contact or a tool refill. Teach that wet-looking ordinary ground has normal grip. Supplies target: three pebbles; introduce additional tools only where the route uses them.

### 2. Under the Potting Shed
Two compact rooms connect through a narrow ordinary passage and a clearly paired tunnel. A mole patrol area lies between a moss strip and noisy boards. A pebble can lead the mole away, but crawling along the moss is the simpler route. The key is in the far shed; a switch opens a straightforward return door.

Treasure: an optional noisy-board pocket with a safe place to stop and let the mole surface. Tunnel exits need a safe buffer; no enemy emerges on the landing point. Dig-in is an optional note and shelter, not a hidden mandatory control.

### 3. Across the Lily Pond
Three small land islands divide one directional water crossing. A toad watches a short central line, broken by a stone pot on the middle island. The player can pause safely between decisions. A lily hop leads to a clearly visible landing on the return bank after the bridge switch is pressed.

Treasure: a second landing and a short downstream cove with an obvious exit. Keep required swim time comfortably within the regular breath limit without upgrades. No compulsory downstream sweep into a hunter. The camera must show both launch and landing at ordinary zoom.

### 4. The Glasshouse Lookout
A 2×2 arrangement of small greenhouse bays uses fixed opaque partitions, shelves and two sequential switches. The first bay introduces one ladybird where Sally can see the nearby serpent its buzz would alert (crawl past, or creep slowly); the next introduces a mantis with a clear outline and approach from behind. The last switch opens the key alcove and the return passage.

Treasure: a spore-puff side room offering a useful alternative crossing. Do not stack an alarm trigger and mantis strike in one unavoidable choke. Glass reflections must not make an opaque collision wall appear passable.

### 5. The Sleeping Waterwheel
A short millrace divides upper and lower banks. Sally reaches the first bridge locally, then uses the tongue across the open channel to operate the second switch from safe footing. The key loft connects back via a newly opened footbridge rather than forcing a repeat of the same swim.

Treasure: a downstream mill shelf reached by an optional current ride and a marked side exit. A toad covers one bank but cannot attack both recovery platforms simultaneously. A wheel shadow must not imply moving physical platforms.

### 6. The Gardener’s Shortcut
A courtyard has a central stone block, a cracked wall leading into the shed and a wider safe dodge lane. The Gardener is introduced alone with an obvious charge warning; Sally lures a charge into the cracked wall, then goes through to the key. A remote switch opens an independent exit corridor so the player cannot destroy the only way home.

Treasure: a longer side lane using a second charge or a finite distraction. No essential treasure can be flattened, buried or made unreachable by a wall break. Keep the beetle’s base collision and warning lane even if the costume has antlers.

### 7. Lanterns After Rain
A twilight garden uses three hedge rooms and a webbed connecting alley. The moth crosses the first leaf patch on a fixed visible route. A lit mushroom gives room to pass the Weaver’s second corridor; a field note explicitly says other hunters can still see Sally in light. Include a stone alcove beyond the glow radius for safe planning.

Treasure: a longer web-side loop whose return can be completed after the supplied light expires. No mandatory race that requires a perfect twelve-second throw. Supplies must permit one sensible mistaken throw or a deliberate retry, with no hidden refill.

### 8. The First Blossom
Three connected courts revisit spring’s main lessons: quiet approach past a mole, a short bridge/tongue switch, then a Gardener lane into the final key garden. Each court has a safe viewing position and solid corner cover. The last switch opens a visible perimeter route home; the player does not repeat all three threats while carrying the key.

Treasure: a separate twilight annex with a moth or Weaver, not both on top of the mole/charge puzzle. The final flower token blooms the world tree after the result is saved. No finale introduces an untaught mechanic or a new enemy.

## Art, lighting and sound

Use the campaign’s procedural terrain, Sally rig, proportions, outlines, UI panels and rounded lighting. Spring palette: moss green, clay, pale blossom pink, warm shed amber and cool rain blue. Blossom trees should use the same canopy language as campaign trees; vary clustered flowers and falling petals instead of pasting a different illustration style over them.

Water gets bank shadows, a readable flow direction, ripples around fixed posts and restrained highlights. Full mode can add shallow reflection colour and individual raindrop rings; Simple keeps bank contrast and clear animated or static flow markings. Texture animation never changes collision.

Music: an original small ensemble of wooden plucks, soft flute, gentle bell/piano notes and light brushed rhythm. Village and early garden are bright and unhurried; glasshouse uses glassy plucks; mill adds steady wooden knocks; twilight reduces instrumentation; finale returns the main spring phrase. Keep existing mixer, looping, pause/resume and voice limits.

Ambience: light rain on leaves, drips under a shed roof, a low waterwheel creak, stream burble and occasional distant birds. Creature warnings have distinct frequencies and restrained volume. Avoid a continuous high-pitched chorus. Duck ambience enough for warnings; retain visual tells and captioned notes. Full/Simple graphics do not change the audio rules.

## Progress and rewards

Each escape restores one garden token and visibly adds a flower cluster or lantern to the world tree. Complete all eight to earn **Blossom Sally**: sage body, cream belly, coral-pink crest and subtle petal spots using the normal rig/palette system. Add a potted flowering tree to the main-menu keepsakes.

All treasure in all eight adds a tiny mechanical watering can that tips toward the pot. It is cosmetic, static under reduced motion and never changes movement, attack range or tool capacity. All four seasonal outfits and keepsakes must coexist per player. Switching outfits, hiding keepsakes and replaying a level retain the shared controls.

## Spring acceptance checks

- Record and replay eight normal and eight all-treasure solutions with actual hunters, currents, breath and finite tools.
- Verify both sides of every bridge and tunnel after every relevant switch; no permanent gate or wall action strands key, exit or treasure.
- Prove a no-upgrade completion route and safe start in each level; no unseen attacks during intro, note reading or pause.
- Check water entry/exit, current side escape, tunnel endpoints, bounce landing clearance and retry reset.
- Check moth exposure, ladybird play-dead and buzz alarm, glow retreat/watch/fade and normal warning geometry with the new costumes.
- Render all eight levels and the world in Full/Simple, desktop/phone/tablet and reduced motion; inspect petals against warnings.
- Run real touch, keyboard/mouse and controller entry, movement, tool and map-navigation checks without seasonal-only control code.
- Validate opening countdown, closed-gate weather, occupied-area closure, migrated saves, all rewards and repeat visits.
