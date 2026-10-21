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
| `chase` | A driving kick, sixteenth hats, a snare backbeat with a ghost note, an ostinato on the chord root, short stabs, and a tom fill into every fourth bar |

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
While nothing has noticed Sally, the tension strings creep in underneath as the nearest creature
comes within a few tiles. The music is muffled by a low-pass while Sally swims, as if heard from
under the surface, and softens a little while she hides still in leaves. Long runs do not loop
one tune: every other sixteen bars an answering tune takes over, and every thirty-two bars ends
with four bars of breath, pad and bass with only the arpeggio.
**Music: On/Off** in Options is saved per player, and **Sound: Off**
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
| `spooky` | Diminished and augmented chords that never settle |

`STYLES` gives each region (by theme) a mood, a lead (`melody` marimba,
`pluck`, `bell`, `flute` or the wavering `ghost`), a tempo and a groove
(straight, backbeat, swung, or sparse for the spooky Shedding Hollow and
Lantern Marsh). `styleFor(theme, n)` gives
escape `n` of that region its own melody seed, a key shift and a rotated
groove and tempo, so no two escapes in a region share a tune; `n = -1` is the
region's theme on the world map.

A new style starts on the next bar, from the top of its own tune, so the
harmony never lurches mid-bar. On the world map the style follows the
courtyard Sally is standing in.

## Special themes, chase flavours and cues

Every region has its own harmony now (only the two spooky regions share one). Places off the
trail have themes of their own in `STYLES`: each secret spot (`secret:<id>`), the Gilded Burrow,
the bonus maze, and `finale` for the last escape and The Long Way Home.

A chase takes its **flavour** from whatever is chasing (`flavorFor`): something heavy (beetle,
cobra, fox, crab, mole, eel, toad) stomps in half time with low toms; something small and quick
(spider, gecko, cricket, millipede, scorpion, mantis, wasp) skitters with rolling hats, rim clicks
and a chromatic riff; a flyer (owl, bat, dragonfly, moth, heron, a diving hawk) adds falling
glides. A snake keeps the standard chase.

Short **cues** on the stinger voice mark moments, built from the mood's home chord (`cue`): the
key found, the hatch opening once enough treasure is in hand, a secret uncovered, a new area
opened on the map.

## Ambience

`public/escape-ambience.js` lays a soundscape under the music for every region, secret spot and
the finale (`SCAPES`): one or two beds of shaped noise (a breeze, wind, a stream, surf, rain,
insects, a cave's rumble, steam's hiss, a machine hum) with a slow swell, and calls now and then,
panned to a side (birdsong, frogs, crickets, drips, crows, owls, gulls, creaks, ice tinkles,
clanks, bubbles, thunder, a shrine chime). Beds crossfade over two seconds when the place
changes. The world map carries the weather (wind, rain, surf, breeze, at under half their full
level); inside an escape only the place's own beds play, softer. It has its own volume slider,
plays softer on the world map and the menu, and ducks during a chase and while paused.

Inside an escape some sounds come from places: water laps at the nearest bank, drips fall from
cave walls near Sally, birds sing from their perches, burst off with a wingbeat, frogs croak and
plop in, a watcher fungus squelches as it hides. Each is quieter with distance and panned to its
side of Sally.

## Volume

**Options** has three sliders, saved per player: Sound (effects), Music and
Ambience. **Sound: Off** still silences everything.

## Sound effects

`public/escape-audio.js` synthesises every effect. The first time a sound
plays it is built live and also rendered once to a buffer offline; after
that it replays from the buffer, one buffer source instead of a graph of
oscillators and filters. Footsteps and other noisy sounds keep three takes
and a slight pitch drift, so repeats do not sound stamped. The same sound
twice within 45 ms is dropped, and at most 14 sounds play at once (footsteps
give way first).

A creature's sound carries where it happened (`game.cue(name, hunter)`), so the scene pans it
left or right of Sally and lets it fade with distance. `EscapeAudio.measure(name)` renders a
sound offline and reports its loudness; `TRIM` evens them out (rewards near -17 dB RMS, danger
tells near -27 dB so a warning is never lost under the music, footsteps and a crawl soft).

Footsteps follow the ground under Sally (`EscapeFeel.surface`): a soft pad on plain floor, a
crunch of gravel (the noisy floor, so it sounds noisy), a rustle of leaves and vines, next to
nothing on moss, a squelch of mud, a hiss of desert sand, the crunch of snow on cold ground and a
wet slap on the tide flats.

Caves and halls echo (`EscapeFeel.space`, `EscapeAudio.setSpace`): every effect passes through
one shared convolver fed a decaying-noise impulse, about 1.7 s in caves, the grotto, ant tunnels,
the Hollow, the Gilded Burrow, the Mossy Well, the Ice Cave and any dark escape, and a shorter one
in the ruins, quarry, vents, the wreck and the shrine. Open places and the world map stay dry.

## Feel

`public/escape-feel.js` holds the small touches the scene draws: footprints that fade in snow,
sand and mud; dust kicked up when sprinting; leaves flicked up from leaves and vines; sparks where
a pebble lands; and noise rings that spread as far as the hunters can hear the sound (6 tiles for a
sprint, 3.5 for gravel, 7 for a pebble). Rings stay on in Simple lighting because they tell the
player something; the rest show in Full only. On phones a short buzz marks being caught or
spotted, a dropped tail, the key and escaping (Android; iPhones do not let web pages vibrate).

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

## Light on the machine

Instruments are built the first time a tune plays them, so a region never pays for
a band it doesn't use. On a TV box (`isTvDevice()`), music skips the reverb and
the vibrato/tremolo wobbles, and chords keep to four notes at once; phones and
computers sound as before. Turning the music off pauses the transport after the
fade, so nothing is scheduled or synthesised while it is silent. Turning ambience
(or all sound) off tears its looping beds down; they are rebuilt when it comes back.
