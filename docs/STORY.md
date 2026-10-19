# The story

**Sally's Escape: The Last Wayfinder**, in three parts. The words are the reviewed manuscript in
`docs/story-revision/NARRATIVE.md`; the game's copy lives in `public/escape-story.js` (plain data,
tested in `tests/escape-story.cjs`, which checks every line against the manuscript) and
`public/escape-story-scene.js` shows it. The full design, including the parts still to build, is in
`docs/story-revision/` (start with its README).

The idea in one line: finding your way home can mean making a way for someone else.

## Parts

| Part | Areas | What happens |
| --- | --- | --- |
| One · Carried Away | 1–8, Sunny Meadow to Hollow Jungle | A flood carries Sally from her warm stone by the old gate. Old Moss, once a messenger, gives her his journal; she draws her stone, gate and hole on its back leaf. Warm carved footmarks answer her; a pale thread runs between two markers she straightens. Old Moss admits what he suspects: she may feel the old paths, as the Wayfinders did. Cards are pages of his journal. |
| Two · The Wayfinder | 9–15, Luminous Depths to Ant Kingdom | The Answering Stone confirms it. Field sheets of the Great Map show the Wayfinders sailed to inspect a silent outer beacon and never came back. Sally turns back to repair a route for a snail family, and with Wick wakes the first lantern that stays lit. |
| Three · The Great Map | 16–21, Frost Hollow to The Road Home | The sentinels still wait. Sally keeps repairing as she goes, and at the Tide Pools sees the oldest circuit runs to her own gate: her first drawing is its missing end. At Home she draws the last line and walks it, and the lanterns answer. |

## Moments along the way

Four short scenes come with progress, as soon as the area they lead into opens: **The Other Bank**
(Garden Ruins), **The Longer Way** (Sun and Sea), **A Light That Stays** (Sunbaked Rooftops) and
**Still Here** (Steam Vents). They need nothing extra from the player.

## After the ending

**Home** shows when escape 100 is won. Two cards then wait, unopened, in Sally's Burrow and in the
Journal so the ending can rest first: **Beyond the Last Line** (a map page from a coast no one knows,
the sequel hook) and **Tomorrow's Work**.

## Fennel's notes

Fennel, a Wayfinder who sailed with the expedition, left a note in every secret spot (Star Garden,
Mossy Well, Cloud Nest, Shrine, Bestiary Grove, Ice Cave, Sunken Wreck, Magpie Roost, Blind Grove),
in the Gilded Burrow and in the Bramble Maze. A note is found by clearing an escape there. Each stands
alone, in any order; none says what happened across the sea.

## The garden recovers

The garden recovers from progress alone, never from reading (`EscapeStory.stage`): 1 once Sun and Sea
opens, 2 at Sunbaked Rooftops, 3 at Steam Vents, 4 once Sally is home. Each courtyard's local has a new
line and, once their area has recovered, a line about it; each signpost shows one extra line when Sally
stands beside it. The Journal's Great Map joins an area once the trail past it opens.

## On screen

- The opening shows the first time a player enters the world; an area's card shows the first time
  Sally reaches it on the world map; a part's title comes before its first card.
- A card turns a page at a time; a page in *italics* in the manuscript is something written down and
  shows as a scrap of paper.
- Cards are saved per player (`progress.data.story`) and can be read again from **Journal → Story**.
- While a card is open the world map holds still, ambience fades and the reading music plays: a slow
  music box (`tale`) in Part One, a warmer theme (`wayfinder`) from Part Two on.
- The new story began with a fresh start: the first load of save era 2 cleared every player's
  progress, stickers and tips (names, settings and built levels stayed).

## Still to build

Notes hidden in levels (42, two per area, in `docs/story-revision/LEVEL-NOTES.md`), the world map's
recovery art, and narration for five scenes (`NARRATION-SCRIPTS.md`).
