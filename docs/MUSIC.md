# Adaptive music

The music is composed in code with [Tone.js](https://tonejs.github.io/)
(MIT, vendored into `public/vendor/` by `npm run prepare:static`). There are
no audio files. `public/escape-music.js` holds both the score and the player:

- **Score** (plain data, tested in `tests/escape-music.cjs`): eight moods, each
  with a four-bar chord progression, bass roots and fifths, and a melody scale.
  Eight-bar tunes are generated from fixed seeds, so a tune is the same every
  time.
- **Styles**: every region has its own style (a mood, a lead instrument, a
  tempo and a groove), and every escape in a region gets its own tune, key and
  groove from that style.
- **Player**: one sixteenth-note sequencer drives six layers in lockstep. The
  game only picks a **state** and a **style**; each layer fades toward that
  state's mix.

Music and the synthesised sound effects (`escape-audio.js`) share one
AudioContext, so they share one clock.

## Layers

| Layer | Sound |
| --- | --- |
| `pad` | Soft chords, one per bar |
| `bass` | Tiptoe pizzicato: root, fifth, octave, fifth |
| `melody` | The region's lead (marimba, pluck, bell or flute), with a soft arpeggio in the second half of each phrase |
| `perc` | Shaker: straight, with a backbeat rim, or swung |
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

Danger fades in fast (0.35 s) and out slowly (2.5 s). The moment something
gives chase, a low boom and a clashing chord hit, and the tempo lifts by about
a fifth; it settles back when the chase ends. A chase holds for 2.5 s,
so a hunter flickering in and out of sight does not pump the mix. A capture,
an escape or leaving the level always cuts through. Pausing ducks the music.
**Music: On/Off** in the toolbar is saved per browser, and **Sound: Off**
silences both music and effects.

## Moods and styles

| Mood | Harmony |
| --- | --- |
| `meadow` | G major |
| `sneaky` | D dorian |
| `warm` | E mixolydian |
| `dark` | A minor |
| `river` | F lydian |
| `marsh` | E phrygian |
| `desert` | D phrygian dominant |
| `frost` | B minor, open and suspended |

`STYLES` gives each region (by theme) a mood, a lead (`melody` marimba,
`pluck`, `bell` or `flute`), a tempo and a groove. `styleFor(theme, n)` gives
escape `n` of that region its own melody seed, a key shift and a rotated
groove and tempo, so no two escapes in a region share a tune; `n = -1` is the
region's theme on the world map.

A new style starts on the next bar, from the top of its own tune, so the
harmony never lurches mid-bar. On the world map the style follows the
courtyard Sally is standing in.

## Sound effects

`public/escape-audio.js` synthesises every effect. The first time a sound
plays it is built live and also rendered once to a buffer offline; after
that it replays from the buffer, one buffer source instead of a graph of
oscillators and filters. Footsteps and other noisy sounds keep three takes
and a slight pitch drift, so repeats do not sound stamped. The same sound
twice within 45 ms is dropped, and at most 14 sounds play at once (footsteps
give way first).

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
