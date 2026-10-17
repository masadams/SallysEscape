# The story

**Sally's Escape: The Last Wayfinder**, in three parts. The text lives in `public/escape-story.js`
(plain data, tested in `tests/escape-story.cjs`); `public/escape-story-scene.js` shows it.

## Parts

| Part | Areas | What happens |
| --- | --- | --- |
| One · Carried Away | 1–8, Sunny Meadow to Hollow Jungle | A flood carries Sally from her warm stone by the old gate into the Overgrowth. Old Moss, who kept the gardens and their glow-bug lanterns, tells her the creatures grew frightened when the last lantern went dark: to get home she must sneak. Cards are pages of his garden journal, with odd margin notes about "the Wayfinders". |
| Two · The Wayfinder | 9–15, Luminous Depths to Ant Kingdom | A waystone in the glowing caves lights the old paths under Sally's feet. The Wayfinders, small lizards who felt the paths and kept the Great Map, vanished; the map scattered, the paths drifted and the lanterns failed. Sally is one of them, perhaps the last. Going home is no longer enough. Old Moss admits he was the Wayfinders' trail-runner. Cards are Great Map pages. |
| Three · The Great Map | 16–21, Frost Hollow to The Road Home | The frost sentinels, the Wayfinders' frozen guardians, still wait at their posts; the last Wayfinder entry breaks off mid-word. The map pages lead home, where the first page of every Wayfinder's map is their own home. |

After the last escape: **Home** (the first lantern wakes and the light runs across the Overgrowth)
and **One Page Missing**, the sequel hook: a coastline no one has seen and lizard footprints walking
off the page.

## Fennel's notes

Fennel, a Wayfinder who went ahead and was never seen again, left a note in every secret spot (Star
Garden, Mossy Well, Cloud Nest, Shrine, Bestiary Grove, Ice Cave, Sunken Wreck), in the Gilded
Burrow and in the Bramble Maze. A note is found by clearing an escape there.

## On screen

- The opening shows the first time a player enters the world; an area's card shows the first time
  Sally reaches it on the world map; a part's title comes before its first card.
- Cards are saved per player (`progress.data.story`) and can be read again from **Journal → Story**,
  which also draws the Great Map: an area lights up for every map page found.
- While a card is open the world map holds still, ambience fades and the reading music plays: a slow
  music box (`tale`) in Part One, a warmer theme (`wayfinder`) from Part Two on.
