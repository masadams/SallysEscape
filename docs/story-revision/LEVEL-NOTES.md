# Optional level notes and placement appendix

These are complete proposed texts for 42 physical collectibles inside 42 existing normal levels. They are separate from the 11 existing secret-win cards. Coordinates are zero-based grid cells in the compiled catalog at 8b97dfd642536bc242a809ea2db511f50ae2e578. Material and wall props are proposed art. No geometry changes are assumed.

## Collection and fairness

Paper props are nonblocking, found by player approach, and collected silently with an optional Read action. Finding persists even if caught. Timed/challenge play defers reading until after the run. The journal retains the complete note and its little sketch. See README for save, accessibility, interaction and performance contracts.

Two notes per area complete the two halves of a small journal sketch. At 14/28/42 notes, border decoration is the only extra reward. Missing notes never withhold the main story, a level, a star, an aid, a secret condition or the ending.

## Audit limits

All 42 anchors are ordinary unoccupied floor and initially connected to the spawn in a conservative floor graph with closed gates left closed; the graph spends no aids and does not traverse water, breaks, gaps or ice walls. It does not simulate collecting the key while crossing a route, closing gates, collision radius, live hazards or visibility. An initially reachable anchor is not a promise of a safe approach or return. Every entry remains a candidate for engine and visual playtesting.

The walk-step count is a shortest static distance from spawn, not detour length, elapsed time or difficulty. Some notes lie near a natural through-route but are hidden at a wall edge; others need a deliberate return into a side branch. None is represented as already implemented.

## Clues to existing secrets

| Note | Existing secret | What it rewards / condition retained |
| --- | --- | --- |
| level-note:garden:2 — The Dry Copy | mossy-well | cracked hedge contact after secrets revealed |
| level-note:quarry:2 — The Careful Door | gilded-burrow | perfect escape in five distinct areas; existing hiddenOpen rule |
| level-note:frost:1 — Leave This Clear | ice-cave | both frost-north and frost-south caches after secrets revealed |
| level-note:grotto:1 — The First Little Cap | fairy-ring | repeat existing three-cap tongue sequence after secrets revealed |
| level-note:storm:1 — After the Fright | struck-oak | existing lightning-timed glint interaction after secrets revealed |
| level-note:tide:2 — Things the Water Returns | sunken-wreck | master all Tide Pools stars after secrets revealed |

Most secret entrances become visible only after the existing Gilded Burrow revelation (five distinct areas with a perfect escape). These notes give attention and knowledge, not new unlock credit. Do not display a misleading “go here now” marker before prerequisites are met. The well clue reveals a search region, not a false claim that any ordinary thin wall can open. The Fairy Ring and Struck Oak retain their existing overworld interactions.

## 1. meadow

Shared journal sketch: a twig bridge. Each note contributes one half.

### level-note:meadow:1 — The Empty Hook

- Level: **The Quiet Vault** (`quiet-vault`, revision 2).
- Proposed anchor: **[15, 11]**; 24 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: A lantern bracket rubbing, beneath a proposed broken clay rim in the southeast corner.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: observation.
- Author/material: Old Moss — journal scrap.
- Live checks: moving guard sightlines and approach timing.

> The hook is sound. The glass is sound. I have cleaned both twice. What is missing is the little line of light that used to reach them. I shall check the next marker tomorrow. If that fails, I shall ask for help.

### level-note:meadow:2 — A Quiet Visitor

- Level: **Moonlit Escape** (`moonlit-escape`, revision 3).
- Proposed anchor: **[8, 1]**; 31 static walk steps from spawn; 1 traversable floor neighbours.
- Prop and placement: Folded leaf in the northern dead end; expose one pale corner around the last turn.
- Geometry evidence: adjacent solid wall on north and south and west.
- Purpose: practical.
- Author/material: F. — folded leaf.
- Live checks: moving guard sightlines and approach timing.

> I waited in the leaves while a snake passed so close that I could count the scales beneath his chin. He did not see me. Then I moved to get a better look. An experiment with a clear result.

## 2. garden

Shared journal sketch: a fallen bracket. Each note contributes one half.

### level-note:garden:1 — Not Yet Mended

- Level: **Switchback Garden** (`switchback-garden`, revision 2).
- Proposed anchor: **[1, 8]**; 35 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Work slip tucked against the west wall, in a corner of the lower room.
- Geometry evidence: adjacent solid wall on south and west.
- Purpose: character.
- Author/material: Old Moss — work list.
- Live checks: moving guard sightlines and approach timing; gate state and return access.

> Mend west wall. Find missing trowel. Mend west wall. Find out who is writing mend west wall on every page. It is my handwriting. This makes the matter harder to take up with anyone.

### level-note:garden:2 — The Dry Copy

- Level: **Buried Observatory** (`buried-observatory`, revision 3).
- Proposed anchor: **[1, 1]**; 48 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: A folded storage label at the northwest wall; proposed small wall-mounted paper sleeve.
- Geometry evidence: adjacent solid wall on north and west.
- Purpose: history.
- Author/material: Pip — storage label.
- Live checks: moving guard sightlines and approach timing; gate state and return access.

> One copy in the shelter. One with the keeper. Never leave both on the same shelf. The well keeper hid his behind the thin, cracked hedge southeast of the Garden Ruins. I hope he remembers which bit. All hedges look rather alike from down here.

## 3. river

Shared journal sketch: a reed crossing. Each note contributes one half.

### level-note:river:1 — What the River Kept

- Level: **Reed Bank** (`reed-bank`, revision 3).
- Proposed anchor: **[21, 3]**; 22 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Bark strip at the northeast room corner, above the drawn floor waterline; no new swim required.
- Geometry evidence: adjacent solid wall on east.
- Purpose: mystery.
- Author/material: Reed — bark rubbing.
- Live checks: moving guard sightlines and approach timing.

> Before the water rose, I copied the little feet on the old crossing. They point beneath the river, not along it. I cannot tell whether this is a road that drowned or a road that knew the water was coming.

### level-note:river:2 — Reach, Then Think

- Level: **Forked Fort** (`forked-fort`, revision 3).
- Proposed anchor: **[17, 6]**; 35 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Practice scrap along the inside wall of the lower east room, outside the actual key tile.
- Geometry evidence: adjacent solid wall on south.
- Purpose: practical.
- Author/material: F. — practice scrap.
- Live checks: moving guard sightlines and approach timing; gate state and return access; moving logs on approach.

> A tongue is splendid for fetching something from the far bank. Less splendid for fetching yourself after it. Before reaching for the key, I now make certain I know where my feet will go next. This is a recent improvement.

## 4. ruins

Shared journal sketch: two linked doors. Each note contributes one half.

### level-note:ruins:1 — The Return Passage

- Level: **Backlash Hall** (`backlash-hall`, revision 2).
- Proposed anchor: **[23, 9]**; 28 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Repair docket against the east wall of the lower room; collectable before touching the key.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: practical.
- Author/material: Brass — repair docket.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> The doors were built in pairs. When one closes, look for the passage its mechanism has released. Do not spend the whole afternoon arguing with the closed one. I did that yesterday. The open passage was behind me.

### level-note:ruins:2 — For the Next Small Feet

- Level: **Turning Citadel** (`turning-citadel`, revision 2).
- Proposed anchor: **[22, 7]**; 29 static walk steps from spawn; 1 traversable floor neighbours.
- Prop and placement: Small rubbing in the one-exit pocket just southeast of centre, not on a reaction trigger.
- Geometry evidence: adjacent solid wall on north and south.
- Purpose: history.
- Author/material: Unsigned — wall rubbing.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> The return route is marked on the back. If the front is damaged, turn the sheet over. If both sides are damaged, leave a fresh mark where you found the trouble. Someone smaller may be following you.

## 5. quarry

Shared journal sketch: a worn stair. Each note contributes one half.

### level-note:quarry:1 — First Lesson

- Level: **Razor Crossing** (`razor-crossing`, revision 2).
- Proposed anchor: **[8, 7]**; 20 static walk steps from spawn; 1 traversable floor neighbours.
- Prop and placement: Practice leaf in the small western dead end; only the paper edge is visible from its entrance.
- Geometry evidence: adjacent solid wall on east and west.
- Purpose: character.
- Author/material: F. — practice book leaf.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> I asked when I would be taught the secret of being a Wayfinder. My teacher told me to sit beside a snake and watch which way it turned. I asked again the next day. Same snake. Same answer.

### level-note:quarry:2 — The Careful Door

- Level: **Crown of Thorns** (`crown-of-thorns`, revision 2).
- Proposed anchor: **[29, 1]**; 40 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Trial record at the northeast corner of the upper room; proposed scuffed slate on wall edge.
- Geometry evidence: adjacent solid wall on north and east.
- Purpose: history.
- Author/material: F. — trial archive slip.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> The old burrow north of the Garden Ruins opens to care, not coins: one perfect escape in each of five different areas. I thought five perfect escapes in one area would do. The door and I have agreed to disagree. — F.

## 6. desert

Shared journal sketch: a little clay roof. Each note contributes one half.

### level-note:desert:1 — Shade for Small Things

- Level: **Sting Stair** (`sting-stair`, revision 2).
- Proposed anchor: **[27, 1]**; 83 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Roof sketch at the northeast corner of the upper chamber, away from a scorpion spawn.
- Geometry evidence: adjacent solid wall on north and east.
- Purpose: character.
- Author/material: Dusty — clay-roof sketch.
- Live checks: moving guard sightlines and approach timing.

> The first little roof was for the glow bugs. The second was for the keeper who tended them. By noon everyone wanted a roof, including the scorpion. I made his a little farther from the others.

### level-note:desert:2 — When the Tail Rises

- Level: **Split Jaw** (`split-jaw`, revision 2).
- Proposed anchor: **[8, 1]**; 55 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Sand-stained scrap at the north edge of the western room, requiring a lateral turn.
- Geometry evidence: adjacent solid wall on north.
- Purpose: practical.
- Author/material: F. — sand-stained scrap.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state; moving logs on approach.

> The raised tail is a warning, not an invitation to hurry straight past. I step out of the marked sting, wait, then move. I have underlined wait because that was the part I kept leaving out.

## 7. marsh

Shared journal sketch: a bent root. Each note contributes one half.

### level-note:marsh:1 — A Map with Roots

- Level: **Mire Mouth** (`mire-mouth`, revision 2).
- Proposed anchor: **[27, 1]**; 28 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Bark label at the northeast wall corner; a short look behind the room edge reveals it.
- Geometry evidence: adjacent solid wall on north and east.
- Purpose: history.
- Author/material: Murk — bark label.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> The roots lifted this path by half a shell-length. I changed the drawing. The next spring they lifted it again. If your map and the garden disagree, look at both before deciding which one is being difficult.

### level-note:marsh:2 — A Better Way to Listen

- Level: **Hungry Observatory** (`hungry-observatory`, revision 2).
- Proposed anchor: **[20, 2]**; 31 static walk steps from spawn; 1 traversable floor neighbours.
- Prop and placement: Rolled reed in the narrow northern pocket near the eastern half; not in a frog spawn.
- Geometry evidence: adjacent solid wall on north and south.
- Purpose: practical.
- Author/material: F. — folded reed.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> A stone makes a noise where it lands. In these halls, a frog may make the next noise somewhere else. Watch where the hunters actually go. They have not promised to follow the first sound you meant them to hear.

## 8. jungle

Shared journal sketch: a wrapped leaf. Each note contributes one half.

### level-note:jungle:1 — Wrapped on Purpose

- Level: **Fern Cloister** (`fern-cloister`, revision 2).
- Proposed anchor: **[6, 7]**; 25 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Dry relay label along the west interior wall of a lower room; proposed bark flap, no added collision.
- Geometry evidence: adjacent solid wall on south and west.
- Purpose: history.
- Author/material: Old Moss — relay label.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> These sheets belong to the path, not the shelter. If the roof falls, move them somewhere dry and leave a mark. Do not take them all home for safekeeping. A perfectly safe map that nobody can find is a very poor map.

### level-note:jungle:2 — A Small Provision

- Level: **Canopy Crown** (`canopy-crown`, revision 2).
- Proposed anchor: **[5, 13]**; 5 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Parcel label at the southwest corner near the start-side room; an easy discovery after the harder first jungle note.
- Geometry evidence: adjacent solid wall on south.
- Purpose: character.
- Author/material: F. — leaf parcel label.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> Left three berries here for the next traveller. Returned to find two berries and a thank-you scratched into the bark. I had rather expected an empty parcel. It is pleasant to be wrong about someone.

## 9. glow

Shared journal sketch: a carved footprint. Each note contributes one half.

### level-note:glow:1 — The Part That Answers

- Level: **Glowcap Grotto** (`glowcap-grotto`, revision 2).
- Proposed anchor: **[11, 1]**; 18 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Rubbing against the north wall in a central room; a faint static carved-foot motif, not a light effect.
- Geometry evidence: adjacent solid wall on north.
- Purpose: mystery.
- Author/material: Old keeper — stone rubbing.
- Live checks: moving guard sightlines and approach timing; gate state and return access.

> Ink can tell you where a path was. Feet can tell you where it is. Set the drawing beside the mark and listen with your toes. If nothing answers, leave the sheet for someone else. Copying it was still worth doing.

### level-note:glow:2 — Cold Light

- Level: **Nightbloom Reach** (`nightbloom-reach`, revision 2).
- Proposed anchor: **[7, 1]**; 16 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Keeper scrap on the north side of the western room; different ink from the Waystone rubbing.
- Geometry evidence: adjacent solid wall on north.
- Purpose: practical.
- Author/material: Glimmer — keeper scrap.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> A glow mushroom can help you see the ground. It may also help something else see you. I used to hold one directly over my head. I have since developed a more considerate relationship with the dark.

## 10. orchard

Shared journal sketch: three snail shells. Each note contributes one half.

### level-note:orchard:1 — Leave a Margin

- Level: **Sleeping Orchard** (`sleeping-orchard`, revision 2).
- Proposed anchor: **[24, 13]**; 44 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Orchard tally at the southeast corner of the lower room; proposed root-edge paper pin.
- Geometry evidence: adjacent solid wall on north and south.
- Purpose: character.
- Author/material: Briar — orchard tally.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state; living growth can change the floor route.

> Three little ones. Three appetites. One path to the feeding beds. I drew the path very carefully, then used the margin to count their meals. The margin is full now. I should have drawn a smaller path.

### level-note:orchard:2 — Nothing Straight Stays Straight

- Level: **The Heartwood** (`the-heartwood`, revision 2).
- Proposed anchor: **[28, 4]**; 36 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Corrected field copy at the southeast edge of the upper eastern room; paper follows the wall, not a moving obstacle.
- Geometry evidence: adjacent solid wall on north and east.
- Purpose: history.
- Author/material: F. — corrected field copy.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state; living growth can change the floor route.

> Old Moss says I draw the hedges too straight. The hedges agree with him. I have stopped giving them corners and started marking the gaps between their roots. Those are what a traveller needs, after all.

## 11. coast

Shared journal sketch: an oilcloth bundle. Each note contributes one half.

### level-note:coast:1 — Not for Sale

- Level: **The Sunken Caravan** (`sunken-caravan`, revision 2).
- Proposed anchor: **[19, 3]**; 26 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Cargo docket against the interior wall of the upper eastern room; proposed tied paper sleeve.
- Geometry evidence: adjacent solid wall on north and south.
- Purpose: history.
- Author/material: Coast keeper — cargo docket.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> Six oilcloths, twelve lengths of cord, two spare lantern panes. Leave one bundle at every beach shelter. The crabs are carrying it above the tide. Do not offer them coins. They have asked for a dry place to sleep.

### level-note:coast:2 — The Shelf Above the Sea

- Level: **Tideglass Lagoon** (`tideglass-lagoon`, revision 2).
- Proposed anchor: **[1, 1]**; 12 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Packing note in the northwest corner; the dry shelf is proposed wall art, not a new raised platform.
- Geometry evidence: adjacent solid wall on north and west.
- Purpose: mystery.
- Author/material: Coral — packing note.
- Live checks: moving guard sightlines and approach timing; key/treasure/entry reaction state.

> I kept a copy of their stores list. Enough for the crossing, the inspection and the return. They expected to come back. I put the list on the high shelf because expecting a thing does not keep the tide out.

## 12. hollow

Shared journal sketch: a shed tail. Each note contributes one half.

### level-note:hollow:1 — What Was Left

- Level: **Shedskin Gully** (`shedskin-gully`, revision 2).
- Proposed anchor: **[29, 8]**; 31 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Rest record against the east wall of the middle-lower room, away from the warm-stone tile.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: character.
- Author/material: Unsigned Wayfinder — rest record.
- Live checks: moving guard sightlines and approach timing.

> Tail lost. Pride injured. Rest of lizard present and hungry. Have decided to call this a successful escape. Whoever finds this shelter next: the stone near the entrance keeps its warmth after sunset.

### level-note:hollow:2 — A Patch of Sun

- Level: **The Old Shedding Tree** (`old-shedding-tree`, revision 2).
- Proposed anchor: **[25, 5]**; 32 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Shelter label at the eastern edge of an upper room; proposed folded leaf weighted with a painted pebble.
- Geometry evidence: adjacent solid wall on north and east.
- Purpose: history.
- Author/material: Husk — shelter label.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> Please leave the warm stones clear. Someone coming through may be colder than you are. If you have been lying on the best one all morning, there is probably enough warmth left for somebody else. I write this chiefly to remind myself.

## 13. lantern

Shared journal sketch: a lantern hook. Each note contributes one half.

### level-note:lantern:1 — Keep the Lid On

- Level: **Firefly Ford** (`firefly-ford`, revision 2).
- Proposed anchor: **[11, 1]**; 15 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Care slip at the north wall near the western middle room; no glow-bug collectible added.
- Geometry evidence: adjacent solid wall on north.
- Purpose: history.
- Author/material: Wick — lantern-care slip.
- Live checks: moving guard sightlines and approach timing; gate state and return access.

> If the lantern goes dark, check for living glow bugs before you throw it away. A sheltered colony can wait a long time. I check this one every morning. It makes a small light when the lid is lifted.

### level-note:lantern:2 — Three Hooks

- Level: **Moonwell Keep** (`moonwell-keep`, revision 2).
- Proposed anchor: **[25, 12]**; 34 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Maintenance tally at the inside corner of the lower eastern room, off switch and reaction cells.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: mystery.
- Author/material: Wick — maintenance tally.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state.

> Glass repaired: three. Hooks secured: three. Bugs alive: yes. Path answering: no. I have drawn the break on the back. If someone can join it, everything else is ready. I would very much like to stop writing no.

## 14. rooftops

Shared journal sketch: an awning. Each note contributes one half.

### level-note:rooftops:1 — The Lunch Route

- Level: **Sunbaked Ledge** (`sunbaked-ledge`, revision 2).
- Proposed anchor: **[1, 3]**; 32 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Roof sketch at the northwest room edge; proposed wall peg below the roofline, not a new awning.
- Geometry evidence: adjacent solid wall on south and west.
- Purpose: character.
- Author/material: Fennel — roof sketch.
- Live checks: moving guard sightlines and approach timing; hawk cover and warning timing.

> Shortest route: ridge. Safest route: beneath the awnings. Route taken: ridge. Lunch remaining: one damp berry. Please amend the first description to shortest route if you are not carrying anything you would like to keep.

### level-note:rooftops:2 — A Place to Wait

- Level: **Weathervane Spire** (`weathervane-spire`, revision 2).
- Proposed anchor: **[13, 9]**; 53 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Stair note in the western corner of the lower central room; do not claim the paper itself grants hawk cover.
- Geometry evidence: adjacent solid wall on north.
- Purpose: practical.
- Author/material: Tiles — stair note.
- Live checks: moving guard sightlines and approach timing; key/treasure/entry reaction state; hawk cover and warning timing; moving logs on approach.

> Choose your next shelter before leaving this one. When the hawk calls, an awning is worth more than a very good plan to run faster. The little diagram below shows an awning. It does not show me running faster.

## 15. ants

Shared journal sketch: a crumb and antennae. Each note contributes one half.

### level-note:ants:1 — Small Corrections

- Level: **Anthill Gate** (`anthill-gate`, revision 2).
- Proposed anchor: **[20, 1]**; 24 static walk steps from spawn; 3 traversable floor neighbours.
- Prop and placement: Punched leaf along the north edge of the eastern room; visibly separate from the ant trail.
- Geometry evidence: adjacent solid wall on north.
- Purpose: history.
- Author/material: Ant surveyor — punched leaf.
- Live checks: moving guard sightlines and approach timing; moving ant groups.

> Third bend: one antenna-width farther east. Fourth bend: unchanged. Fifth bend: cleared after roof fall. Copy sent to surface keeper. Copy retained below. The bottom is covered in tiny marks, all made with great care.

### level-note:ants:2 — Uncollected

- Level: **The Queen’s Chamber** (`queens-chamber`, revision 2).
- Proposed anchor: **[10, 11]**; 29 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Stores label at the western corner of a lower chamber; a proposed wall slot, not an extra loot chest.
- Geometry evidence: adjacent solid wall on south and west.
- Purpose: mystery.
- Author/material: Ant storekeeper — stores label.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state; moving ant groups.

> One return parcel for the travelling party. Sealed. Dry. No insects inside except authorised inspectors. Checked again today. Beneath the neat instructions, a much smaller hand has written: We have not given their place to anybody else.

## 16. frost

Shared journal sketch: a warm stone. Each note contributes one half.

### level-note:frost:1 — Leave This Clear

- Level: **Frostbite Steps** (`frostbite-steps`, revision 2).
- Proposed anchor: **[1, 3]**; 17 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Shelter scrap at the northwest room corner; keep it off ice and warm-stone cells.
- Geometry evidence: adjacent solid wall on south and west.
- Purpose: practical.
- Author/material: Flurry — shelter scrap.
- Live checks: moving guard sightlines and approach timing; cold exposure and return to warmth.

> Rest on a warm stone before trying the next crossing. The keepers also left a cache at each edge of Frost Hollow, north and south. Find both, and the old ice shelter can open. A cold traveller should not have to arrive empty-pawed.

### level-note:frost:2 — Until We Return

- Level: **Winter Heart** (`winter-heart`, revision 2).
- Proposed anchor: **[25, 1]**; 36 static walk steps from spawn; 3 traversable floor neighbours.
- Prop and placement: Frost-stiff paper near the north wall of the eastern room; this is an open-room edge, not guaranteed cover.
- Geometry evidence: adjacent solid wall on north.
- Purpose: character.
- Author/material: F. — frost-stiff paper.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state; cold exposure and return to warmth.

> I tried to tell a sentinel that we might be late. It pointed to the warm stone beside its post. There is patience, and then there is whatever they have. I checked the stone before leaving. Still warm.

## 17. vents

Shared journal sketch: a wired valve. Each note contributes one half.

### level-note:vents:1 — Held Together

- Level: **Kettle Works** (`kettle-works`, revision 2).
- Proposed anchor: **[27, 3]**; 32 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Repair docket against the east wall of the upper room, outside all authored steam lanes.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: character.
- Author/material: Rivet — repair docket.
- Live checks: moving guard sightlines and approach timing.

> Valve repaired with wire. Wire repaired with string. String replaced after beetle ate it. If you have brought more wire, I shall be pleased to see you. If you are a beetle, I should like a word.

### level-note:vents:2 — Count the Quiet

- Level: **The Great Boiler** (`great-boiler`, revision 2).
- Proposed anchor: **[26, 1]**; 31 static walk steps from spawn; 3 traversable floor neighbours.
- Prop and placement: Pipe sketch along the north edge of the eastern middle room; not at the boiler-door tile.
- Geometry evidence: adjacent solid wall on north.
- Purpose: practical.
- Author/material: Old works keeper — pipe sketch.
- Live checks: moving guard sightlines and approach timing; gate state and return access; key/treasure/entry reaction state; moving ant groups.

> The hiss tells you a jet is coming. Watch one full burst before choosing the crossing. Count the quiet as well as the noise. It is the quiet you will be walking through. These pipes have never been impressed by hurry.

## 18. grotto

Shared journal sketch: a mushroom cap. Each note contributes one half.

### level-note:grotto:1 — The First Little Cap

- Level: **Puffball Hollow** (`puffball-hollow`, revision 1).
- Proposed anchor: **[27, 3]**; 26 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Growing label at the east wall of the upper room; proposed bark tag, no extra spore source.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: character.
- Author/material: Morel — growing label.
- Live checks: moving guard sightlines and approach timing.

> The smallest cap grew by the pool. I nearly brushed it away. Its children light the shelf now. At the Fairy Ring, three caps answer one another. Watch their order, then touch them with your tongue in the same order. They prefer a polite introduction.

### level-note:grotto:2 — Many Hands

- Level: **The Sinkhole Ring** (`fairy-ring`, revision 1).
- Proposed anchor: **[33, 13]**; 36 static walk steps from spawn; 3 traversable floor neighbours.
- Prop and placement: Map-copy instruction along the east edge of a lower chamber; open-room candidate, not a safe alcove.
- Geometry evidence: adjacent solid wall on east.
- Purpose: history.
- Author/material: Unsigned — map-copy instruction.
- Live checks: moving guard sightlines and approach timing.

> A good correction needs the route, the date and the name of whoever walked it. If you cannot write your name, leave your mark. There are claw scratches, pinpricks, a shell-shaped smudge and one small print made in mud.

## 19. storm

Shared journal sketch: a shelter ledge. Each note contributes one half.

### level-note:storm:1 — After the Fright

- Level: **Gale Steps** (`gale-steps`, revision 1).
- Proposed anchor: **[29, 5]**; 31 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Shelter slip near the northeast room corner, outside any authored hazard cell; lightning still needs live testing.
- Geometry evidence: adjacent solid wall on east.
- Purpose: character.
- Author/material: Gale — folded shelter slip.
- Live checks: moving guard sightlines and approach timing; gust timing near approach.

> Sit beneath the ledge until you can feel your feet. Then choose the next ledge. Near the heights stands the struck oak. Its hollow shows a glint only when lightning comes. Look from shelter; nothing in a tree is worth forgetting where you are standing.

### level-note:storm:2 — A Dry Corner

- Level: **Eye of the Storm** (`eye-of-the-storm`, revision 1).
- Proposed anchor: **[24, 1]**; 29 static walk steps from spawn; 3 traversable floor neighbours.
- Prop and placement: Shelter record on the north side of the eastern room; exposed approach, so collect silently and read later.
- Geometry evidence: adjacent solid wall on north.
- Purpose: history.
- Author/material: F. — storm shelter record.
- Live checks: moving guard sightlines and approach timing; storm flash visibility; gust timing near approach.

> Two lizards fit here if one stops complaining. Three fit if everyone leaves their packs outside. The roof holds through a hard storm. I have marked it for whoever comes after us. Bring the packs back in before leaving.

## 20. tide

Shared journal sketch: a shell and tide line. Each note contributes one half.

### level-note:tide:1 — Tide Table

- Level: **Low Water** (`low-water`, revision 1).
- Proposed anchor: **[21, 11]**; 24 static walk steps from spawn; 3 traversable floor neighbours.
- Prop and placement: Tide slip along the south side of the eastern room; open-room edge above tide-flat cells, not safe at every phase.
- Geometry evidence: adjacent solid wall on south.
- Purpose: practical.
- Author/material: Shelly — shell-weighted slip.
- Live checks: moving guard sightlines and approach timing; tide and adjacent water state.

> The shallow route is not always a walking route. Wait and watch what the water uncovers. I once drew a perfectly good path while the tide was out, then forgot to mention the tide. This note is the correction.

### level-note:tide:2 — Things the Water Returns

- Level: **The Great Tide** (`great-tide`, revision 1).
- Proposed anchor: **[33, 6]**; 33 static walk steps from spawn; 3 traversable floor neighbours.
- Prop and placement: Salvage label at the east edge of the upper-middle room; no bottle object or arrival proof before finale.
- Geometry evidence: adjacent solid wall on east.
- Purpose: mystery.
- Author/material: Coast keeper — salvage label.
- Live checks: moving guard sightlines and approach timing; tide and adjacent water state.

> A mast shows through the reeds off Sun and Sea. The way to it waits for every star in the Tide Pools. I have kept the loose planks on shore. They tell us a boat broke. They do not tell us what happened to its travellers.

## 21. home

Shared journal sketch: a gate and warm stone. Each note contributes one half.

### level-note:home:1 — A Familiar Wall

- Level: **Dusk Meadow** (`dusk-meadow`, revision 1).
- Proposed anchor: **[21, 11]**; 30 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Old route copy near the south edge of the eastern room; no need to collect it to understand the final map.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: history.
- Author/material: Old Moss — old route copy.
- Live checks: moving guard sightlines and approach timing.

> Near end of the oldest circuit: wall, gate, warm stone. The drawing below is faded. Someone has repaired the gate twice and marked each repair. Important places do not always look important. Sometimes they look like somewhere you sit.

### level-note:home:2 — The Last Small Line

- Level: **Home** (`home`, revision 1).
- Proposed anchor: **[35, 5]**; 42 static walk steps from spawn; 2 traversable floor neighbours.
- Prop and placement: Keeper rubbing at the northeast interior corner before the final hatch; leave the last approach uncluttered.
- Geometry evidence: adjacent solid wall on east and south.
- Purpose: reflection.
- Author/material: Old keeper — rubbing, with Sally’s observation.
- Live checks: moving guard sightlines and approach timing; tide and adjacent water state.

> The old instruction says to copy every turn before going farther. Beneath it, someone has added: And when you get home, draw that too. Sally smooths the little page she has carried through the garden. There is still room beside her stone.

## Individual placement review priorities

- Quiet Vault: the first note is a real detour in a first-area escape. Keep the page corner visible without demanding a new tutorial or forcing first-run collection.
- Sting Stair and Split Jaw: long static routes from spawn (83 and 55 steps) make return-state and resource checks especially important. These are investigation candidates, not approved safe routes.
- Buried Observatory, Turning Citadel, Crown of Thorns, Moonwell Keep and Home: inspect one-way reactions before accepting a route found on the initial-state graph. Prefer moving a note to a nearby equivalent pocket over changing the escape.
- Anthill Gate, Winter Heart, Great Boiler, The Sinkhole Ring, Eye of the Storm, Low Water and The Great Tide: degree-three floor anchors are room edges, not protected dead ends. Art must be legible without pretending there is new cover.
- Frost: no reader opening while cold exposure is active unless the complete untimed simulation pauses.
- Rooftops and Storm Heights: no paper glint or illustration may resemble a hawk warning or lightning tell.
- Final Home note: off the final hatch and earlier than the ending; it must never delay an automatic exit or be the only explanation of Sally’s drawing.

Run `node docs/story-revision/validate-placements.cjs` in a full checkout for the repeatable static audit. After live testing, update coordinates and record the tested level revision and relevant states in a follow-up implementation PR.
