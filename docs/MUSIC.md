# Adaptive music

The game plays synchronised loop **stems** and fades each one up or down to
match what is happening (vertical layering). The engine
(`public/escape-music.js`) knows nothing about any particular song: the
stems, the mix for each game state and the fade times all live in
`public/audio/music/manifest.json`.

## Game states

| State | When | Default mix |
| --- | --- | --- |
| `menu` | Start screen | ambient + melodic |
| `world` | World map | ambient + melodic |
| `explore` | In an escape, nothing has noticed Sally | ambient + mystery |
| `tension` | A hunter is alert or searching, an owl glares, the hawk's shadow circles, Sally is freezing | mystery + intrigue, a little danger |
| `chase` | A hunter is chasing or striking, the hawk dives, a gecko dashes, a tail was just dropped | danger up, everything else down |
| `victory` / `caught` | The results card | melodic swell / ambient only |

Danger fades in fast (0.35 s) and out slowly (3 s), and a chase holds for
2.5 s so a hunter flickering in and out of sight does not pump the mix. A
capture, an escape or leaving the level always cuts through. Pausing ducks
the music; **Music: On/Off** in the toolbar is saved per browser, and
**Sound: Off** silences both music and effects.

## Adding the Lurking Layers pack (Imperial Dawn Audio)

1. Download the free pack from https://imperial-dawn-audio.itch.io/lurking-layers
   and unzip it anywhere, e.g. `~/Downloads/lurking-layers`.
2. **Read the licence file in the pack.** The store page lists it as CC0; the
   build copies the pack's own licence into `public/audio/music/` and refuses to
   run if there isn't one.
3. Run `npm run music:build -- ~/Downloads/lurking-layers --bpm <tempo>`
   (ffmpeg required). It:
   - picks the *Find Him* loop stems named in `scripts/music-sources.json`;
   - checks every stem has exactly the same number of samples, that the loop is a
     whole number of bars at the given tempo, and that no loop seam jumps hard
     enough to click — any failure stops the build;
   - encodes `.ogg` (Chrome, Firefox, Edge) and `.m4a` (Safari) copies into
     `public/audio/music/lurking/`;
   - writes the exact loop length into the manifest, which switches the music on.
4. Commit `public/audio/music/` and play.

Until step 3 has run, the manifest has no loop length and the game simply
plays without music.

## Replacing the music later

Point `scripts/music-sources.json` at new stems (change `track`, `match` and
the layer name patterns), rebuild, and adjust the `states` mixes or `fades`
in the manifest. Layer names are free-form: any layer a state does not list
fades to silence. No code changes are needed.
