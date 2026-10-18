# Sally's Escape: The Last Wayfinder — narrative revision proposal

Status: complete editorial and implementation specification for review; not an implemented gameplay change.

Prepared against main at `8b97dfd642536bc242a809ea2db511f50ae2e578` on 18 October 2026. Read alongside the existing `docs/STORY.md`. The current runtime story remains authoritative until this proposal is approved and implemented. This PR deliberately contains reviewable prose and design data rather than silently changing progression, saves, mechanics or level geometry.

## Read in this order

1. This document: story decisions, reasoning, player experience and implementation requirements.
2. [Narrative manuscript](NARRATIVE.md): complete opening, 21 area cards, milestone scenes, ending, sequel hook and revised legacy secret notes.
3. [Exploration notes](LEVEL-NOTES.md): 42 finished optional notes, two per area, plus exact proposed coordinates and placement descriptions.
4. [Narration production scripts](NARRATION-SCRIPTS.md): five core voice scenes, one optional hook, narrator voice prompt and delivery guidance.
5. [Build events](BUILD-EVENTS.md): exact event triggers, proposed world anchors, visuals, persistence, area-by-area work and build order.
6. [Placements](placements.json): machine-readable placement candidates and static validation evidence. Coordinates need live engine and visual playtesting before implementation.

## Creative brief

A small lizard wants to get back to her warm stone. She discovers that the paths home once connected an entire garden, and chooses to repair them for others as well as herself.

Audience: children, adults and families. Clear enough to read aloud, with concrete details and understated humour that adults can enjoy. No assumed reading level for gameplay: key, hatch, switches, hazards and objectives remain legible without story knowledge. No note, journal completion, dialogue choice or lore answer gates a normal escape, star, challenge, aid, secret unlock or ending.

Dominant impression: finding your way home can mean making a way for someone else.

Retain: the warm stone, flood, Overgrowth, Old Moss, Wayfinders, Great Map, Fennel, lanterns, creature personalities and existing 21-area order. Strengthen: Sally's agency, escalating discoveries, visible consequences, fair optional clues and the earned homecoming. No combat villain, world-ending countdown, compulsory reading or new currency.

## What changes and why

| Current weakness | Proposed change | Benefit |
| --- | --- | --- |
| Sally's change of purpose is declared at the Waystone | She helps a stranded snail first, then chooses to carry a route for a waiting family despite the delay | Character develops through specific actions |
| Her power and the world's history arrive in one explanation | Warm marks, an incomplete rubbing and an answering waystone precede the reveal | Discovery confirms player observations |
| Middle cards repeat descriptive map-page introductions | Each area adds a consequence, obstacle, testimony or changed understanding | Reading has forward momentum |
| Old Moss knows everything but withholds it | He suspects a connection and admits that suspicion early; he cannot confirm it until the stone answers | Preserves mystery without manipulating Sally |
| Map magic has no firm boundaries | Pages record routes; walking reconnects branches; home closes the circuit | Clear setup and payoff |
| Sally has supposedly carried an unintroduced final page | Her own drawing is established in the opening; she completes it at home | Earned ending, no retroactive possession |
| Most recovery happens after the last escape | Four staged overworld changes follow ordinary completion flags | Progress becomes visible to every player |
| Optional notes can spoil the whole disappearance | Independent fragments establish evidence; the final hook names the remaining question | Secrets enrich the story in any order |
| Secret notes are mostly victory rewards | Preserve those and add discoverable objects inside ordinary levels | Exploration has its own reward |

## Canon: answers the writing must obey

### The garden and its light

The Overgrowth was a connected garden, inhabited and tended by many species. Lanterns shelter living glow bugs; the old paths carry a gentle guiding light between their waymarks. Light does not create food or compel good behaviour. It lets travellers find food, shelter and one another. When routes fail, isolation and uncertainty increase; some creatures become territorial. Some remain helpful, and ordinary predators remain predators. Do not claim every attack is morally excused by darkness or that every species becomes harmless after restoration.

Wayfinders are lizards with a sensitivity to the old route marks. Others can copy a map, maintain a lantern and help a neighbour. A Wayfinder can feel whether two old marks still connect. Sally's ability is useful, not a certificate of moral superiority. She must still observe, practise and decide.

The Great Map is a collection of working sheets: local drawings, route rubbings, corrections and annotations. Its pages were held in relay shelters so local keepers could maintain their sections. These were purposeful caches, not a magical book inexplicably torn up and left as a treasure hunt. Abandonment, weather and frightened hoarding dispersed some sheets further.

Reading a page does not fix a route. Walking the broken circuit with its route understood lets Sally join surviving marks. Local sections can answer before the entire network works; lanterns need both their glow bugs and an intact return connection. Home is the near end of the garden's oldest circuit. Sally's own map of her stone establishes that missing local connection. No invented universal rule that everyone's physical home is the same electrical junction.

### The departure and the unknown

Before Sally's flood, the outer beacon across the sea stopped answering. The Wayfinders made a short planned voyage to inspect it. They left working local lanterns, field sheets and instructions with keepers, including Old Moss. Fennel checked the inland caches before joining the outward party. The party expected to return; it did not. Local keepers sustained the system for a time, but could not repair the increasingly broken routes. The last local lantern failed later. The flood begins Sally's adventure; it did not cause the original disappearance.

Known by the end: they sailed deliberately, the boat was repaired after a failed launching, their departure was meant to be temporary, a page from the far coast later reached this shore. Unknown: what delayed them, who sent that page and whether all survived. Do not answer these in incidental notes. The subtitle means Sally is the last known active Wayfinder in this garden, not a verified last survivor of her species.

No parentage reveal, lost princess, prophecy or claim that Fennel is Sally's father. Her family history can remain unspecified. Her worth rests on what she does.

### Old Moss and Fennel

Old Moss was a trail-runner who became a keeper. He is patient, funny, ashamed of the repairs he could not finish and honest about the limits of his knowledge. He recognises familiar marks answering Sally, not Sally's ancestry. He tells her what he knows when it becomes relevant. He stays in the meadow/den; later cards can quote his journal, carried messages or Sally's recollection. Do not teleport him beside her in every area or imply he watched all her actions.

Fennel is a skilled but fallible explorer: observant, occasionally overconfident, affectionate towards odd creatures. His humour belongs to a person, not a sequence of tutorial jokes. Main-story cards establish that an expedition departed; secrets supply his name, repairs, doubts and companionship. A noncollector still understands the ending and hook.

## Structure and narrative delivery

Keep three parts: Carried Away (areas 1–8), The Wayfinder (9–15), The Great Map (16–21). Area cards occur on arrival, so they must not claim Sally has already cleared that area's final level. The manuscript labels separate milestone scenes for actual outcomes.

| Event | Trigger proposed | Content / visible outcome |
| --- | --- | --- |
| First entry | Existing opening event | Opening and Sally's drawing; opening can be skipped |
| Meadow completion | Normal frontier unlock into Garden Ruins | `milestone:small-kindness`; a snail can cross a dry groove in the safe overworld |
| Arrival in Luminous Depths | Existing area:glow | Waystone reveal as a safe overworld vignette; no level win asserted |
| Access to Sun and Sea | Normal progression beyond Living Labyrinth | `milestone:carry-the-light`; Sally's decision; orchard waymark remains warm |
| Access to Sunbaked Rooftops | Normal progression beyond Lantern Marsh | `milestone:one-lantern`; one sheltered lantern wakes; wider network still incomplete |
| Access to Steam Vents | Normal progression beyond Frost Hollow | `milestone:the-wait`; sentinel acknowledgement in a safe vignette, no patrol-rule change |
| Final normal escape won | Existing finale condition, compare by stable level ID | Home ending; network connects; overworld recovery reaches final stage |
| After finale is dismissed | Voluntary unopened journal envelope / interactable at burrow | Sequel hook; avoid immediately autoqueueing over the emotional ending |

Unlock flags are evaluated idempotently, by stable chapter/level IDs and actual progression, not story read state or number of optional notes. A migrated completed save receives appropriate world-state restoration without replaying all cutscenes; new scenes appear as unread journal entries. Branch routes must not require both alternatives. Use existing region/unlock rules to determine frontier access; do not introduce a separate all-levels-complete requirement.

The small-kindness vignette and Sally's later choice are narrative consequences of normal play, not quests requiring a new escort or branching objective. The first lets her nudge an already loosened twig after reaching the next courtyard. The second gives her an understandable decision within the established route. Do not present a false UI choice between home and helping: the story chooses; the player chooses whether to read it.

### Four information layers

1. Signposts: orientation, existing star count and one short optional environmental clue. Retain existing function and visibility. Do not replace useful instructions with lore.
2. Area cards and milestone scenes: complete understandable main story, independent of pickups. Field sheets are acquired by the main progression events even if their cards are skipped; none of the 42 optional notes supplies a required map page.
3. Level notes: short objects found in side pockets, alcoves and overlooked corners; practical observation, character or local history.
4. Existing secret victory cards: richer Fennel material. Existing secret unlock requirements remain unchanged. A clue may direct attention but never promises that location alone unlocks a secret.

Players can disable automatic story cards and still collect the main journal and receive identical world changes. Default discovery notification: small page icon and title; no paragraph obscuring an active level. Optional Read action opens the reader; Back returns directly. During ordinary play, defer reading until the player asks; during timed or challenge runs, queue it for after the run. Notes should never consume movement, throw, tongue or camouflage input by proximity.

## Note collection and rewards

Author 42 level notes, two in each area, spread across 42 of the 100 normal levels. Leave the other 58 levels free of collectible prose. This gives useful discoveries without turning every escape into a checklist. Existing 11 secret cards remain a different collection; add one short optional aftercare card in Sally's unlocked burrow. No notes in Little Explorers in this first pass; those levels are a separate audience/flow and should receive their own read-aloud design later.

Each note is 25–65 words, with a title, author/material cue and unique stable ID. Most have one concrete pleasure: a useful behaviour already supported by the engine, a piece of someone's life, or evidence that adds to the mystery. No required switch colour, reaction objective or first explanation of a danger lives only in a note. Existing HUD hints and creature tells remain sufficient.

Immediate reward: the text and a distinctive sketch in the journal. Every area's two notes share a little sketch that gains its second half when both are found. Collection never awards stars, treasure needed by a hatch, aids or unlock credit. At 14/28/42 notes, decorate the journal border with leaf/lantern/path motifs and show a discreet message. No mechanical advantage, secret ending or lost story resolution behind 100% completion.

Found and read are separate states. Finding records the note immediately, even if caught or the run is abandoned; reading later marks it read. Keep discovery outside the run simulation so it cannot affect scores, seeds or replays. Collect only on an actual player-controlled approach within reach and unobstructed line of sight, not through walls or camera visibility. A small 0.4-tile approach radius to the proposed anchor is a starting point for tuning, not a fixed accessibility requirement. The page is nonblocking. A paper corner or folded leaf is drawn on existing terrain; do not carve a room simply to satisfy a candidate coordinate.

Journal shows found notes by area, offers chronological main story separately, and preserves original note text. Do not rewrite an early note after a reveal. Avoid spoiler silhouettes/titles for undiscovered content; display an unnamed slot only if collection tracking is enabled. Provide a hide-collection-count option and no repeated nagging about missing entries.

### Placement rules

Coordinates in placements.json are zero-based grid cells `(x,y)`, not pixels or overworld positions. Candidates were checked against the compiled level data including `escape-rebuilt.js`, not the obsolete original room definitions. Every candidate is ordinary floor, not loot, key, exit, spawn, gate, switch, breakable wall, environmental item or an author-declared hazard cell. Static floor reachability is recorded separately from live safety. Rooms can be watched by a turning guard or a moving hazard even when its path never enters that tile.

The six secret-location clues in the note appendix mirror existing unlock rules, including the prerequisite that most secrets become visible only after the Gilded Burrow is revealed. They do not bypass those rules.

The placement appendix proposes a paper prop and approach for each candidate. Scenery such as a pot, cracked bracket or beam is proposed small art on a wall edge; it is not claimed to exist already. All prop art must leave the floor, cover and hazard telegraphs readable. Move an anchor within its pocket if live sightlines are unfair, and revalidate; do not add permanent safe cover or alter a patrol for a note.

Prefer a deliberate lateral detour off a likely spawn–key–exit route. All candidates should be collectible without spending a unique aid, crossing an irreversible gate for prose alone, or waiting on a final hatch tile. Some are corners of open rooms rather than true dead ends; the appendix says so. Optional detours may require ordinary stealth, but collecting must never force a modal while threatened. Do not put mandatory beat triggers in the notes.

## Signposts and locals

The manuscript includes one sign addendum and one new local line per area. These are additive to existing star/progression UI and `ESCAPE_FOLK_TIPS`. Keep all mechanics advice, secret requirement hints and Old Moss's existing spectacles/watch/scarf retrieval dialogue. Those inventory quests are already real; the manuscript's map paper must not collide with them or add another required fetch quest.

Sign text should be an opt-in expandable line, not another automatic modal. Locals can rotate the new line with existing tips only when readable long enough; freeze the line while focused. After restoration, use the specific after-line supplied for that area, keyed to world state rather than whether a card was read. Friendly courtyard beetles and hostile level beetles are individuals, not a species-wide contradiction.

## Selective narration

The current source has no spoken story playback. NARRATION-SCRIPTS.md supplies the exact scripts for the opening, Waystone reveal, Sally’s choice, first lantern and homecoming, with the sequel hook as a separate optional recording. One narrator reads all five scenes, including dialogue. Remaining cards and notes stay text-only for this first pass. Narration is a later integration task; these files do not introduce live voice generation or require an online connection.

## Implementation handoff

Suggested source changes, not performed by this PR:

- `public/escape-story.js`: replace manuscript text while keeping existing `opening`, `area:*`, `finale`, `after` and `note:*` IDs; add separate milestone and level-note records. Never infer note IDs from array position.
- `public/escape-story-scene.js`: distinct found/read state, manual in-level note reader, deferred challenge reading, voluntary hook and journal grouping. Existing map-fill graphics must use restoration/progression state rather than merely read cards.
- Level-note source: a small independent catalog keyed by normal `level.id`; validate against the final built catalog. Do not paste large prose strings into level geometry.
- `public/escape-progress.js`: additive versioned `storyFoundNotes`, `storyReadNotes`, `storyMilestones` and `restorationStage`, or equivalent nested fields after inspecting the current serializer. Preserve existing story, stars, records, inventory and secret state. Decide field names during implementation; these are proposed contracts, not claims about current APIs.
- Engine/scene input and draw layers: cheap collectible detection; note rendering only for active level and discovered fog cells; no DOM generation every frame. Reuse UI icons and paper art, no point lights, particles or shader passes for pickups. This matters for the Shield APK.
- `public/escape-world-scene.js`: additive sign/local lines and four cheap restoration stages. No dynamic pathfinding or new simulation in the overworld.
- Builder/custom levels: no inherited official notes by matching an ID string alone. Official campaign identity and current revision must match; workshop geometry overrides require revalidation or suppression. Do not break custom level saves or replay determinism.

Proposed note record: `{id, levelId, areaTheme, at:[x,y], title, author, body, rewardSketch, kind}`. Discovery save stores IDs, not copies of text. Maintain a revision-to-anchor migration rule if geometry moves; already collected IDs stay collected. Missing/stale placements fail closed for that prop and report a development warning, never crash a level.

## Acceptance criteria for the implementation PR

- A player skips every card and ignores every note; all 100 normal levels, stars, challenges and the finale remain available under existing rules.
- A player follows only the shortest legal branching route; all main beats occur in order and none asserts an unplayed side escape.
- A player finds no Fennel notes; they understand the failed expedition, Sally's decision, restoration and the far-shore question.
- Secret notes found early or in reverse order remain consistent; none refers to a prior pickup as if guaranteed.
- Dying, tail-dropping, restarting, closing the app and switching players preserve the correct found/read state without duplicating rewards.
- Timers, hunters and challenge clocks cannot be exploited by opening a note; defer the reader during active timed/challenge play. For untimed campaign reading, pause the complete simulation and audio coherently, not just Sally.
- Pointer, touch, keyboard, controller/Shield Back and focus restoration work; no proximity pop-up steals an action. Reader offers large scalable text, scroll, high contrast and reduced motion.
- All note anchors pass bounds, occupancy, resource-free reachability and live hazard/LOS checks in all relevant gate/tide/reaction states. No hint falsely asserts total safety.
- Existing secret wins still award their existing card IDs once. Gilded and Bramble do not get duplicate new Fennel win cards from the same event.
- Complete/midgame migrated saves, automatic-story-off saves and multiple player profiles produce correct restoration. Read state is never required for restoring the garden.
- Home payoff rests before the sequel hook; players who leave immediately still receive a complete ending and can later find the unopened hook.
- Profile the added props and journal on Shield hardware against a baseline, including heavy-action levels. This proposal claims no runtime performance improvement.

## Review questions

1. Does the known history sufficiently justify the expedition without prematurely answering what happened across the sea?
2. Does Sally's help feel like a voluntary character choice despite a fixed campaign path?
3. Are the two map roles—recording routes and feeling their connections—clear without technical explanation in player-facing prose?
4. Does any note promise a mechanic the actual level does not support, or expose too much too early?
5. Which candidate pockets fail live sightline or return-route testing?
6. Are the lantern recovery stages legible and inexpensive enough for the Shield?

## Validation in this PR

This is a documentation/content proposal. The placement audit checks the existing compiled catalog and the proposed JSON; no gameplay tests are claimed for unimplemented systems. Run `node docs/story-revision/validate-placements.cjs` from a checkout to repeat the static audit. Exact audit results and limits are recorded in placements.json and LEVEL-NOTES.md. Review and playtest placement before coding it into the campaign.
