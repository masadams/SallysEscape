# Events and world changes to build

This is the implementation backlog for the proposed narrative. Everything marked NEW is requested future work; none is already functional merely because its prose appears in this PR. Existing story cards, signpost star counts and NPC tips are real. In-level paper pickups, the new vignettes, restoration, selective narration and their new save state must be built.

Use together with README.md (contracts), NARRATIVE.md (exact story/sign/NPC copy), LEVEL-NOTES.md and placements.json (42 collectible objects), and NARRATION-SCRIPTS.md (six production scripts, five core). Source and level revisions are recorded in the placement manifest. No implementation should create a second, contradictory narrative source.

## Build inventory

| Item | Existing foundation | NEW work required | Scope |
| --- | --- | --- | --- |
| Revised main cards | Story data and world-map card reader | Replace copy, preserve IDs; acquire main map sheets through ordinary progression | Opening, 21 areas, finale, hook |
| Main milestone vignettes | Existing story overlay with small illustrative scenes | New scene records, art/state sequences and progression triggers | Four scenes |
| Physical notes | Secret victory cards only; no physical note system | Props, approach collection, persistence, read action, journal grouping | 42 existing normal levels |
| Signpost prose | Star-count signs, drawn in world scene | An opt-in text interaction/addendum that does not remove stars | 21 signs |
| Local reactions | NPC tips and existing item quest | Add one pre/post line per local; preserve existing lines and quests | 21 locals |
| Recovery | Map-filling art based on read cards | Progression-driven restoration model, cheap permanent map art changes | Four stages |
| Narration | Procedural music/ambience/SFX; no speech system found | Local clip playback, captions, ducking, controls and lazy loading | Five scenes plus optional hook |
| Ending aftercare | Sally's Burrow unlocks after Home | Inspectable work-list paper and voluntary new-coast envelope | Two optional objects/cards |

## Event lifecycle and ordering

Evaluate progression events after a normal campaign result has been committed and when entering/loading the world map. Recheck idempotently on load. Do not evaluate while a level simulation is running. Use the same unlock predicate as normal campaign progression; never substitute all-stars/all-levels completion for ordinary frontier access.

Separate three things: world outcome achieved, journal entry available, player has read/seen the presentation. Outcomes do not wait for reading. A skipped scene still makes its world change; an unread entry stays available. A migrated save can receive the outcome and unread entry without being forced through old scenes.

Suggested event ordering at a new frontier: commit the prior area's outcome; present its optional milestone scene; show the next part title if applicable; offer the next area's arrival card. All can be skipped. If several frontiers are already passed on load, apply all outcomes, list new journal entries, and do not play a backlog of automatic scenes or voices.

The first narrative arrival at the Waystone must precede Sally's later choice in the journal sequence even if a testing save unlocks every area. Do not derive narrative history from the current camera position alone. Developer unlock-all mode should offer explicit preview events and never persist campaign outcomes accidentally.

Use stable event IDs. A suggested persisted event has `{id, earned:true, presentationSeen:false}`; derive restoration from earned milestones rather than a competing independently mutable counter. If caching a restoration stage, reconcile it from canonical progression on load. Use additive migrations compatible with current version-1 saves; inspect current merging rules before implementing.

## Main event specifications

### E00 — Arrive after the flood

- NEW/REVISED event ID: existing `opening`.
- Trigger: first normal world entry for a new player; revised opening offered once. Existing players retain their read flag and can replay revised copy from the journal.
- Presentation: existing story scene, with three simple visual states: warm stone and gate; rising water; muddy Sally beside Old Moss. These are illustrations, not a playable flood level.
- Required story prop: Old Moss gives Sally the small journal; its blank back leaf receives her drawing of stone/gate/hole. Show this drawing again at the reveal/ending. No extra inventory quest or collectable requirement.
- Location: story overlay, associated with Sunny Meadow courtyard `[14,18]`; not a new physical level node.
- Voice: clip 01, `opening`. Text remains complete if audio is absent.
- Outcome: starting drawing exists in story state, independently of whether the player reads every page.

### E01 — The Other Bank

- NEW ID: `milestone:small-kindness`.
- Trigger: ordinary access to the Garden Ruins frontier after meadow progression. Do not require both optional meadow routes or meadow mastery.
- Build: safe illustrative vignette. A small snail waits on one side of a shallow groove; Sally nudges an already loose twig; snail crosses; Sally waits. No escort AI, bridge physics, bonus condition or interact-to-progress requirement.
- World echo: a small twig-and-silver-trail decoration near the meadow courtyard, proposed anchor `[12,22]`. New art only, nonblocking. If this falls off the actual walkable/decorative margin, relocate within the courtyard after visual inspection.
- Text: NARRATIVE.md, The Other Bank.
- Voice: none in the first batch.
- Persistence: event earned once; never replay the waiting animation on routine passes. Twig remains after earning.
- Purpose: first concrete kindness; pays off Sally's later decision without prematurely announcing a quest.

### E02 — The Answering Stone

- REVISED ID: existing `area:glow`, associated with arrival in accessible Luminous Depths.
- Build: a small Waystone illustration in the safe courtyard/card. Sally's foot aligns with the carving; three line segments appear; one stops at a break. Provide a static equivalent for reduced motion. No level-room geometry or special button sequence required.
- Location: courtyard centre vicinity `[35,43]`, preferably represented in the card art rather than a new collider. Any permanent decorative stone must be checked against node paths.
- Voice: clip 02, `area:glow`.
- Outcome: confirmed Wayfinder identity in narrative; the full text explains it. Acquiring/reading either optional glow-area note is irrelevant.
- Important: narration/reading does not unlock or grant new movement powers. The ordinary level kit remains as designed.

### E03 — The Longer Way

- NEW ID: `milestone:carry-the-light`.
- Trigger: ordinary access to Sun and Sea after Living Labyrinth progression.
- Build: brief illustration/vignette of the snail family, Sally checking her own home drawing, following a curved line back to a broken mark, and a silver trail leaving the shelter. The player does not receive an extra mandatory fetch quest or fake choice button.
- World echo: orchard waymark warms at proposed `[16,45]`, near courtyard `[14,43]`. Use a fixed warm-colour decal, not a dynamic light.
- Voice: clip 03.
- Outcome: restoration stage 1. Old paths begin answering locally; no global lantern wave yet. Add Sally's corrected route to the journal map regardless of reading state.
- Continuity: the family illustration is not claimed to be an actual NPC escort in `the-heartwood`; the event follows campaign progress instead of altering that escape.

### E04 — A Light That Stays

- NEW ID: `milestone:one-lantern`.
- Trigger: ordinary access to Sunbaked Rooftops after Lantern Marsh progression.
- Build: Wick lifts a lantern lid. Two nearby hooks answer; the third remains dark. End on the first lantern holding a steady light. No real-time lantern puzzle is required.
- World echo: one sheltered lantern at proposed `[38,94]` near Lantern Marsh courtyard `[36,93]`. Two small connected path marks can share the same static art. Keep clear of Wick at `[39,98]` and level nodes.
- Voice: clip 04.
- Outcome: restoration stage 2. Persist one local lantern and a warmer reading/overworld music choice if inexpensive. Do not illuminate every marsh lantern or remove owls from replayed escapes.
- Audio: a soft existing success cue is optional, not new spoken dialogue during action.

### E05 — Still Here

- NEW ID: `milestone:the-wait`.
- Trigger: ordinary access to Steam Vents after Frost Hollow progression.
- Build: one sentinel illustration lowers its head towards a restored line beneath the ice; Sally admits she does not know where the others are. The sentinel looks along the repaired path.
- Location: safe Frost Hollow vignette/courtyard near `[14,93]`. Proposed decorative sentinel base `[16,95]`, subject to visual inspection. No additional enemy or interactable obstacle.
- Voice: none in the first batch.
- Outcome: restoration stage 3. Courtyard sentinel's resting pose changes; a thin path decal remains. Hostile sentinels in level simulations retain all existing gaze/reflection mechanics.
- Meaning: the sentinels recognise restored passage, not proof that all Wayfinders survived. Never make them announce the mystery's solution.

### E06 — Home

- REVISED ID: existing `finale`.
- Trigger: normal campaign level with stable ID `home` won, not object reference equality, last-array position or reading all map cards.
- Build: ending illustration with the familiar gate/hole/stone, Sally's original drawing beside the assembled route sheets, one final pencilled line, then a restrained lantern response across the map. A static map change must serve reduced motion; no performance-heavy full-map lighting simulation.
- Old Moss: temporary cameo in the ending illustration. Keep his normal meadow/den NPC and item quest intact; no permanent NPC relocation required. Granny Sedge remains the home courtyard local.
- Voice: clip 05.
- Outcome: restoration stage 4; existing Home completion and burrow unlock retained. A few lanterns are still physically in need of repair, matching the prose. No required gold, note count or voice playback before the credits/ending can complete.
- End resting state: warm stone. Do not append the sequel-hook audio. Leave enough user-controlled time for this scene to land.

### E07 — Tomorrow's Work

- NEW ID suggested: `burrow:tomorrows-work`; separate from 42 collectible note IDs.
- Trigger: Home complete and Sally's existing Burrow accessible.
- Build: nonblocking work-list prop in the burrow clearing; proposed anchor `[29,118]` near existing burrow centre `[31,118]`, after checking actual terrain. Inspect opens the exact optional burrow card in NARRATIVE.md.
- Voice: none.
- Outcome: optional read flag only. No repairs quest, new resource economy or required postgame tasks. The list expresses continuing care, not unfinished obligations imposed on the player.

### E08 — Beyond the Last Line

- REVISED ID: existing `after`.
- Trigger: Home complete; make the envelope available after the finale is dismissed. Journal and burrow entry are both valid ways to open it later. The prose's “a few mornings later” is narrative time, not a requirement to wait real-world days.
- Build: one unopened envelope/bottle-page marker in the burrow clearing, proposed `[33,118]`; provide the same action in the journal. Shelly's corresponding postgame line is enabled only when this hook is available. No online delivery/check or scheduled event.
- Voice: optional clip 06, separate file.
- Outcome: optional hook-read flag. Main ending already complete. Do not require the Sunken Wreck, all notes or every star.
- Mystery limit: the new page proves someone drew the far shore, not that every expedition member is alive.

## Area-by-area work checklist

Coordinates below are existing world courtyard centres, not final new-object anchors. Every area also receives its two exact note placements in placements.json, its revised arrival card, sign addendum and local pre/post lines in NARRATIVE.md. “No bespoke scene” still requires integrating those common features; it does not mean leaving the old prose unchanged.

| Area | Existing world centre | Event/environment work beyond shared cards/notes/sign/local | Restoration rule |
| --- | --- | --- | --- |
| Sunny Meadow | `[14,18]` | Opening art and drawing prop; E01 twig crossing echo | Twig after E01; garden lantern stage 4 |
| Garden Ruins | `[36,18]` | No bespoke scene; one cleaned bracket variant for Pip's after-line | Stage 4 |
| Reedbanks | `[58,18]` | No bespoke scene; existing post gains a small static path mark | Stage 4 |
| Restless Ruins | `[80,18]` | Return-mark decorative variant, no gate change | Stage 4 |
| Deep Trials | `[101,18]` | Clearer worn-footprint decal; no new compulsory trial | Stage 4 |
| Venom Depths | `[101,43]` | Repaired lantern-roof art, no extra usable shade | Stage 4 |
| The Waking Maze | `[79,43]` | A thin safe-world route decal, no frozen living-level layout | Stage 4 |
| Hollow Jungle | `[57,43]` | Relay-sheet shelter illustration; no physical required journal pickup | Stage 4 |
| Luminous Depths | `[35,43]` | E02 answering stone illustration | Reveal on arrival; network stage 4 |
| Living Labyrinth | `[14,43]` | E03 snail shelter illustration and warm waymark | Stage 1 onward |
| Sun and Sea | `[14,68]` | Dry keeper bundle/clean bracket variant | Stage 4 |
| The Shedding Hollow | `[36,68]` | Tidy rest-place variant; preserve access to Old Moss's Den | Stage 4 |
| The Lantern Marsh | `[36,93]` | E04 lantern vignette and one persistently lit lantern | Stage 2 onward |
| Sunbaked Rooftops | `[57,68]` | Small courtyard stair-light decal, no level awning changes | Stage 4 |
| Ant Kingdom | `[101,68]` | Tidy route-mark/map graphic, no ant AI changes | Stage 4 |
| Frost Hollow | `[14,93]` | E05 sentinel illustration and resting-pose variant | Stage 3 onward |
| Steam Vents | `[57,93]` | Repaired courtyard valve art, no steam pattern nerf | Stage 4 |
| Mushroom Grotto | `[79,93]` | Expanded dry-shelf illustration, existing mushrooms remain luminous | Stage 4 |
| Storm Heights | `[101,93]` | Distant low lantern marks visible in world/card art, no lightning changes | Stage 4 |
| Tide Pools | `[101,118]` | Small salvaged-material bundle variant | Stage 4 |
| The Road Home | `[57,118]` | E06 ending art; E07/E08 objects in separate burrow clearing `[31,118]` | Stage 4 |

World-map decorators must treat proposed anchors as candidates. Existing `escapeWorld.signs`, `npcs`, caches, nodes, secret bounds and terrain remain authoritative. Check any new art against the same reserved-tile mechanism already used by world decoration. No listed visual requires changing collision, unlock topology, hunter behaviour or secret boundaries.

## Physical-level event system

### P01 — Discover a page

NEW. In an official normal campaign escape with matching built revision, create the note prop from placements.json. It is revealed with ordinary fog visibility and picked up only when Sally actually approaches the reachable cell. A slight paper corner can hint at it; never show through walls. Do not auto-walk Sally or take focus.

On first approach: append stable note ID to found state and persist immediately; show a compact title/page icon once; add it to the journal. On subsequent approaches: optionally show the already-found paper in a muted appearance, no repeated reward. Death, tail drop, retry and abandoning the run cannot duplicate or remove discovery. This event does not grant run treasure or alter existing level events.

### P02 — Read a page

NEW. Explicit Read from discovery notification, pause menu or journal. Full pause for untimed campaign simulation, including hazards and timers; defer opening during active timed/challenge play until results. Preserve movement focus and audio state on close. Use controller input through existing action dispatch; never borrow a gameplay button without checking mappings. Mark read separately from found. No narration for the 42 pages in this pass.

### P03 — Complete an area's sketch

NEW. When both note IDs for one area are found, fill the second half of that area's journal sketch once. This is UI art only. Do not queue a modal or require viewing the sketch to unlock anything. At totals 14, 28 and 42, update journal border motif once. Missing text never withholds the ending.

### P04 — Existing secret escape win

EXISTING trigger, REVISED text. Preserve current `note:<spot>` rewards and once-only behaviour for Star Garden, Mossy Well, Cloud Nest, Shrine, Bestiary Grove, Ice Cave, Sunken Wreck, Magpie Roost, Blind Grove, Gilded Burrow and Bramble Maze. They are separate from P01. No new physical pickup is required to earn these victory cards. The Long Way Home bonus receives no invented Fennel win card in this proposal.

### P05 — Secret clue knowledge

NEW text only, EXISTING unlocks. Six normal-level notes point towards the cracked well hedge, Gilded Burrow, ice caches, Fairy Ring, struck oak and wreck. Reading them must not call unlock functions or write secret flags. They explain actions the current systems already support; secret visibility and prerequisites remain unchanged.

## Audio events

NEW voice subsystem. Map `opening`, `area:glow`, `milestone:carry-the-light`, `milestone:one-lantern`, `finale` and optional `after` to the filenames in NARRATION-SCRIPTS.md. Playback belongs to the safe presentation state, never to an active escape trigger. Stop voice on closing/skipping or switching players. Offer independent voice mute/volume and replay. Missing files, decode failures and blocked autoplay must leave readable text and completion intact. Do not queue voice because a milestone was silently reconciled on save load.

Use one narrator, including quoted dialogue. Do not build live AI voice, ElevenLabs API calls or a read-every-note feature for this pass. Five core recordings total about 4.6 minutes. Keep full captions in sync with final recordings; page navigation must not restart a full scene clip. See the production file for the transcript and proposed integration options.

## Technical dependencies and acceptance passes

Recommended build order:

1. Add stable content IDs/catalog and additive save migration; preserve all existing records and legacy story IDs.
2. Build note props/collection/journal and validate 42 candidate anchors against actual game simulation and visuals.
3. Wire main milestone conditions and restoration derivation; test shortest legal routes and migrated saves before art polish.
4. Add cheap vignette/decorator art and sign/local interactions; verify all reserved map tiles and collision paths.
5. Integrate externally produced recordings, caption behaviour and controls. Profile Shield APK, muted and voiced, with audio files loaded lazily.

Do not implement all world changes by reading a card: test story-off mode. Do not accept the static placement audit as live playtesting. Run the existing appropriate game/progression/story tests after implementation, add focused tests for additive migration and event once-only behaviour, then manually verify controller/touch focus, cold/tide/closure candidates and APK audio interruption/restart.

Before merging a later implementation PR, its description must distinguish completed events from placeholders, list any relocated note anchors with built level revision, and identify missing audio assets. This proposal has no implied completed gameplay or voiced recordings.
