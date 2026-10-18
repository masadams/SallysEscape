# Narration production script — Sally’s Escape: The Last Wayfinder

Status: proposed revision voice script, ready for editorial review and external voice generation. These are not recordings of the current shipped text. Reconcile any review edits to NARRATIVE.md before buying final takes. No audio files or voice playback implementation are included in this PR.

## Current-game check

At the PR baseline, the game has procedural sound effects, creature chirrups, ambience and music, including reading music for the story overlay. I found no recorded dialogue/narration assets, browser speech-synthesis calls, ElevenLabs integration or Android TextToSpeech implementation. The media-element output and generated WAV in game.js are an audio-output bridge and a sound-test tone, not spoken narration. Inspected: the repository asset tree, all public JavaScript/HTML and both Android Java sources.

## What to record now

Use **one narrator for five important scenes**. That narrator reads the quoted character dialogue as part of the storytelling. Sally, Old Moss and Wick do not need separate actors or separate voice IDs for this first pass. This avoids a large cast and gives the opening and ending one consistent voice.

Leave the remaining area cards, 42 collectible notes, 11 secret-win notes, signposts, incidental NPC tips, the small-kindness vignette and the sentinel vignette as text for now. They remain fully readable in the journal. Do not automatically read every discovery. The optional sixth recording is the separate sequel hook. No part-title stings need spoken voice.

## Voice design prompt — Narrator

Copy this description into the voice-design or casting step as appropriate for your ElevenLabs workflow. It describes the performance; it is not dialogue to be spoken.

> A warm, mature male storyteller with a natural mid-to-low register and a clear neutral North American accent. Calm, companionable and quietly observant, as if reading a well-loved adventure aloud to a family. Gentle dry humour; sincere tenderness without sentimentality. Natural breath and varied sentence rhythm. Clear consonants without over-enunciation. Give small concrete details their weight. Use subtle shifts for dialogue: Old Moss slightly slower and more weathered, Sally lighter and direct, Wick practical and steady. All remain recognisably the same narrator. No exaggerated cartoon voices, baby talk, booming fantasy authority, gravelly villain sound, trailer delivery or theatrical whisper. Dry studio recording, no music, sound effects or added reverberation.

Performance note for every take: aim initially around 140–150 words per minute, allowing the writing’s pauses. Do not stretch every sentence. A marked pause means a short natural beat, not long silence. Generate only the spoken-script text below; omit IDs, headings, filenames, stage directions and voice prompts. Pronunciation: Sally = SAL-ee; Fennel = FEN-ul; Wayfinder = WAY-fine-der; Overgrowth = OH-ver-grohth; Wick rhymes with quick.

## Clip manifest

| Clip | Scene ID | Reader | Proposed master filename | Words | Approx. spoken duration | Priority |
| --- | --- | --- | --- | ---: | --- | --- |
| 01 | `opening` | Narrator, all dialogue included | `sally_narration_01_opening.wav` | 190 | ~1m 19s | Required first batch |
| 02 | `area:glow` | Narrator, all dialogue included | `sally_narration_02_glow.wav` | 114 | ~0m 47s | Required first batch |
| 03 | `milestone:carry-the-light` | Narrator, all dialogue included | `sally_narration_03_carry-the-light.wav` | 122 | ~0m 50s | Required first batch |
| 04 | `milestone:one-lantern` | Narrator, all dialogue included | `sally_narration_04_one-lantern.wav` | 68 | ~0m 28s | Required first batch |
| 05 | `finale` | Narrator, all dialogue included | `sally_narration_05_finale.wav` | 168 | ~1m 10s | Required first batch |
| 06 | `after` | Narrator, all dialogue included | `sally_narration_06_after.wav` | 91 | ~0m 38s | Optional second batch |

First batch total: **662 words**, approximately **4.6 minutes** before longer pauses. Timing is an estimate, not a synchronization requirement. Each clip can be generated as one take; if the tool needs smaller chunks, split only at paragraph boundaries and retain the same narrator and performance.

## 01 — The Night of the Flood

Scene: `opening` · Reader: **Narrator, including all dialogue** · Master: `sally_narration_01_opening.wav`

Why voice matters: Introduce Sally, home and the flood; establish the drawing used at the ending.

Direction, not spoken: Warm and unhurried at first. Let the flood briefly gather pace. Old Moss brings calm and dry humour; finish with quiet practical hope.

### Spoken script

Sally's stone held the sun longer than any other stone in the garden.

Beneath it was her burrow. Beside it stood the old gate, with a hole just large enough for a lizard who knew how to turn sideways. Sally knew. She had worn the earth smooth going through it.

Then the rain came.

By midnight the flower beds were streams. By morning the streams had joined. Sally climbed onto her stone, but the water climbed higher.

The current took her over the wall.

She woke tangled in grass beside an old tortoise. There was mud in her ears and a leaf stuck to her nose.

"Don't get up too quickly," he said. "You might frighten the leaf."

Sally shook it off. "Where's the gate?"

The tortoise looked beyond the meadow.

"A long way off. I'm Old Moss. I used to carry messages through these gardens."

He gave her his small journal. On a blank leaf at the back, Sally drew her stone, the gate and the little hole beneath it.

"There," she said. "That's where I'm going."

Old Moss folded the paper carefully.

"Then we'd better keep that dry."

## 02 — The Answering Stone

Scene: `area:glow` · Reader: **Narrator, including all dialogue** · Master: `sally_narration_02_glow.wav`

Why voice matters: Make the identity reveal land; the first major story turn.

Direction, not spoken: Wonder through discovery, with restraint. Pause after the light appears. Give “Sally could feel them too” space; do not announce a chosen-one destiny.

### Spoken script

The stone beneath the jungle bore a lizard, carved in mid-stride.

Sally set one foot beside its little stone foot.

Light ran into the floor.

It spread through old marks in three directions. One thread reached a broken edge and stopped. Sally felt the missing connection as clearly as a gap beneath her toes.

She laid the journal's rubbing beside it. The broken circle was a map of this very place.

The Wayfinders had not merely known the paths. They could feel when the paths joined.

Sally could feel them too.

She was still muddy. She was still a long way from home.

But now she knew what the warm stones had been asking.

## 03 — The Longer Way

Scene: `milestone:carry-the-light` · Reader: **Narrator, including all dialogue** · Master: `sally_narration_03_carry-the-light.wav`

Why voice matters: Sally chooses to help, rather than merely learning her identity.

Direction, not spoken: Intimate and observant. Let the hesitation over her home drawing register. No inspirational speech. The final two sentences should feel like a small, settled decision.

### Spoken script

Near the broken mark, a snail family had gathered beneath a leaf. Their feeding beds lay beyond the dark orchard. They would not risk their young on a path they could no longer follow.

Sally unfolded her drawing. The road towards her gate was plain enough now.

Then she looked at the little shells on the field sheet.

She turned back through the orchard, following the old marks until the broken thread met its neighbour.

A low light held between them. It did not travel far. It was enough to show the next bend.

When Sally returned, the leaf shelter was empty. A trail of silver crossed the roots.

She put the field sheet beside her drawing.

There was room for both.

## 04 — A Light That Stays

Scene: `milestone:one-lantern` · Reader: **Narrator, including all dialogue** · Master: `sally_narration_04_one-lantern.wav`

Why voice matters: The first visible success makes the long repair worthwhile.

Direction, not spoken: Keep Sally’s disappointment small and honest. Wick is matter-of-fact. Hold a short beat before the final sentence, with relief rather than triumph.

### Spoken script

The final mark was under a root.

When Sally stepped beyond it, the thread behind her stopped flickering.

Wick lifted the lid of the lantern. Light gathered in the glass and reached the first hook, then the next. At the third it faded.

"It didn't go all the way," said Sally.

"No," said Wick.

He set the lantern on its bracket.

They watched it together.

It stayed alight.

## 05 — Home

Scene: `finale` · Reader: **Narrator, including all dialogue** · Master: `sally_narration_05_finale.wav`

Why voice matters: Resolve Sally’s original desire and the wider promise of the garden.

Direction, not spoken: Return to the opening’s warmth. Let the light spreading widen the feeling without raising the volume. Old Moss is fond, never pompous. Finish with stillness and belonging.

### Spoken script

Sally turned sideways and slipped through the hole beneath the gate.

Her stone was still there.

She spread the map beside it and drew the last small line: from the path, beneath the gate, to the lantern bracket.

Then she walked it.

Light gathered in the old marks. It passed beneath her feet, through the gate and out beyond the wall.

Across the garden, lanterns began to answer.

Some had keepers waiting beside them. Others would need new glass or a handful of glow bugs. But the paths between them held.

Old Moss arrived as the sun reached the stone.

"You took the long way," he said.

Sally looked at the crowded map.

"Somebody needed it."

At the wall, a little snail crossed a twig laid over the drainage groove. Beyond her, the next lantern shone.

Sally climbed onto her stone. There was room at the edge for the map, weighted down against the wind.

This time, when she closed her eyes, she knew where the paths went.

## 06 — Beyond the Last Line

Scene: `after` · Reader: **Narrator, including all dialogue** · Master: `sally_narration_06_after.wav`

Why voice matters: An invitation to the next adventure, available separately after homecoming.

Direction, not spoken: Curiosity after a peaceful ending. Keep the bottle and page tangible. No sinister whisper, trailer suspense or cliffhanger shout. The last line is a chapter closing.

### Spoken script

A few mornings later, Shelly brought something the tide had left in a bottle.

It was a map page.

The coast on it was unfamiliar. Beyond the shore stood a lantern, drawn in ink that had run a little. Beside it were small lizard footprints.

Someone had marked the route after arriving.

Old Moss laid the page beside the others.

"That isn't one of ours," he said.

Sally looked towards the sea.

For now, her stone was warm. The new page could dry beside it.

The end of the first journey.

## Delivery and integration handoff

- Keep a clean, unprocessed WAV master for each clip at a consistent available sample rate. Do not add music, chimes, creature sounds or room reverb. The game already supplies music and ambience. Final runtime encoding can be chosen when integrating, after testing Android/WebView playback. No settings here assume a specific ElevenLabs model or plan.
- Use these filenames when saving/exporting, or preserve this scene-to-file mapping in the asset manifest. Keep takes under a proposed `public/audio/narration/` folder only in the later audio integration PR; that folder is not present in this proposal.
- The script is the caption transcript. Use NARRATIVE.md paragraphs as caption/page boundaries, not an independently shortened subtitle version. If the actor changes words, update the transcript or regenerate the take.
- A single scene may span multiple journal pages. Later integration must choose between continuous scene playback with manually scrollable complete text, or paragraph-level clips/markers. Do not restart a one-minute clip every time the player advances a text page. Do not invent timestamps before recordings exist.
- Narration plays only while the player has chosen to view the relevant safe story scene. Provide skip, mute, replay and independent voice volume. Stopping or closing the card stops the voice. Back works on Shield. Returning to the journal never autoplays an entire queue.
- Playback should follow an audio-unlock user gesture; a blocked/failed/missing recording leaves the full text usable. Voice preferences do not affect any unlock, restore flag, star or completion record.
- Duck reading music gently under voice and avoid stacking scene clips. Load one requested clip at a time; release it when done. No live online speech generation in the APK. Profile decode memory and playback on Shield hardware; narration does not run during action levels.
- The sequel hook is played only if the player opens the new page after the finale. Do not attach it to the end of Home’s WAV. Let Home end.

## Production check

Listen to the opening and finale together before generating all takes. The stone, gate, drawing and Old Moss should feel like the same world and the same voice. Check Sally’s name, clear quiet dialogue, consistent volume and absence of exaggerated emotion. Then record the three turning-point clips. If the story reviewer changes a voiced paragraph, regenerate only its scene and update the script/transcript together.
