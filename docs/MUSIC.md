# Adaptive music

The music is composed in code with [Tone.js](https://tonejs.github.io/)
(MIT, vendored into `public/vendor/` by `npm run prepare:static`). There are
no audio files. `public/escape-music.js` holds both the score and the player:

- **Score** (plain data, tested in `tests/escape-music.cjs`): four moods, each
  with a four-bar chord progression, bass roots and fifths, and a melody scale.
  An eight-bar tune per mood is generated from a fixed seed, so it is the same
  every time.
- **Player**: one sixteenth-note sequencer drives six layers in lockstep. The
  game only picks a **state** and a **mood**; each layer fades toward that
  state's mix.

Music and the synthesised sound effects (`escape-audio.js`) share one
AudioContext, so they share one clock.

## Layers

| Layer | Sound |
| --- | --- |
| `pad` | Soft chords, one per bar |
| `bass` | Tiptoe pizzicato: root, fifth, octave, fifth |
| `melody` | Marimba-like tune |
| `perc` | Light shaker on the eighths |
| `tension` | Tremolo strings and a heartbeat |
| `chase` | Kick and snare, a driving ostinato and short stabs |

## States

| State | When | Mix |
| --- | --- | --- |
| `menu` | Start screen | pad + melody |
| `world` | World map | pad, melody, light bass and shaker |
| `explore` | In an escape, nothing has noticed Sally | bass leads; pad, melody and shaker |
| `tension` | A hunter is alert or searching, an owl glares, the hawk's shadow circles, Sally is freezing | bass, strings and heartbeat |
| `chase` | A hunter is chasing or striking, the hawk dives, a tail was just dropped | drums, ostinato and stabs |
| `victory` / `caught` | The results card | a rising or falling stinger over a quiet pad |

Danger fades in fast (0.35 s) and out slowly (2.5 s). A chase holds for 2.5 s,
so a hunter flickering in and out of sight does not pump the mix. A capture,
an escape or leaving the level always cuts through. Pausing ducks the music.
**Music: On/Off** in the toolbar is saved per browser, and **Sound: Off**
silences both music and effects.

## Moods

| Mood | Regions | Harmony |
| --- | --- | --- |
| `meadow` | Sunny Meadow, Garden Ruins, Reedbanks | G major |
| `sneaky` | Restless Ruins, Deep Trials, Waking Maze, Hollow Jungle, Living Labyrinth | D dorian |
| `warm` | Venom Depths, Sun and Sea, Sunbaked Rooftops, Ant Kingdom, Steam Vents | E mixolydian |
| `dark` | Luminous Depths, Shedding Hollow, Lantern Marsh, Frost Hollow | A minor |

A new mood waits for the start of a four-bar phrase, so the harmony never
lurches mid-bar. On the world map the mood follows the courtyard Sally is
standing in.

## Changing the music

- **A new tune or harmony:** edit a mood in `MOODS` (chords, bass, fifth, scale,
  seed), or add a mood and map regions to it in `THEME_MOOD`.
- **A different arrangement:** edit `events()`, which lists everything that
  plays on each sixteenth step.
- **Mixes and fades:** edit `MIX` and `FADES`.
- **Instrument sounds:** edit the synth settings in `load()`. The voice volumes
  were balanced by rendering each layer offline, so every layer sits near the
  same loudness at full mix. Re-check after big changes.

The site's Content Security Policy allows `worker-src blob:` because Tone keeps
its timing clock in a small worker. A background tab would otherwise throttle
the music.
