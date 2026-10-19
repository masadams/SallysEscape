# Sally’s Escape

A top-down stealth and exploration game in the browser. Sally, a small garden lizard, is carried
far from home by a flood and must sneak back across the Overgrowth: 100 escapes in 21 areas, 14
hidden escapes, 21 challenges, 29 kinds of creature, and a walkable world map. Along the way she
learns she is one of the lost Wayfinders (the story is in `docs/STORY.md`).

**Playing.** The title screen shows who is playing (up to six players share a browser, each with
their own progress and settings), with Continue, Little Explorers, Players, Options and Extras
(community levels and the level builder). On the world map Sally walks between areas, talks to villagers, finds caches,
catches golden flies and enters escapes at their flags; the Journal holds the Story pages, the Great
Map and the Bestiary. In an escape the toolbar is just ☰ Menu, Pause and Full screen; pausing opens
Resume, Restart, Options, Map and Leave. Options holds sound, music and ambience volume, lighting,
start cards and full screen.

**Escapes.** Early escapes are one-touch; from Venom Depths (escape 24) Sally can drop her tail once
as a decoy, and pink regrowth bugs grow it back. Every hunter has its own job (`docs/ENEMIES.md`), and
traps, cold rooms, steam, storms and tides change the routes. Escaping on the first attempt earns a
First try badge; earning every star in an area masters it and lends Sally its colours. About one
escape in four, a few glow bugs drift about: free one for a little bonus treasure.

**Sound and light.** Effects are synthesised with Web Audio; the adaptive music is composed in code
with Tone.js; each area has its own ambience; footsteps follow the ground and caves echo
(`docs/MUSIC.md`). Lighting and per-area moods are in `docs/LIGHTING.md`.

**Builder and admin.** The level builder (under Extras, for admins signed in with a passkey) paints
maps, places creatures, doors, triggers and hazards, and has a Quick build that makes a playable
first draft; levels can be playtested, shared as text or published to Community levels
(`docs/BUILDER.md`). **Admin** manages passkeys, the community shelf, the workshop for the game's own
escapes and anonymous player data (`docs/PLAYDATA.md`). The first start prints a one-time setup code
in the server log for creating the first passkey; `PUBLIC_ORIGIN` names the address passkeys belong
to. The server keeps passkeys, published levels and player data in `DATA_DIR` (`/data` in the image;
`compose.yaml` mounts a volume there). For testing, signed-in admins can turn on a test mode in
the Admin panel that opens every escape without changing saved records.

**Controls.** WASD or arrows, Shift run, C crawl, Q pebble (hold to set the distance: the throw swings out and back while held), L glow mushroom,
Z spore pouch, E burrow (held on soft dirt: dig in), R tongue, F seed, X camouflage, Space look back, G map, H hint, M mute, Esc
goes back (pauses an escape, steps back a screen; the world map also has a Main menu button). On the world map R grabs golden flies and Enter enters an escape. Phones use landscape, a left
thumbstick and right action buttons; rotating to portrait pauses a run.

**Controllers.** Any standard pad (Xbox, PlayStation, Switch Pro, Steam Deck): left stick or d-pad
moves, RT sprints, LT crawls (held still too), A looks back, B burrows (held on soft dirt: dig in), X pebble, Y tongue, LB glow mushroom, RB spore
pouch, L3 camouflage, R3 seed; held throws aim with the stick. The right stick looks around (peeks the
view ahead, springing back when let go). Start pauses; View/Select opens the map on levels that have one
and steps the zoom on the rest. On the world map A enters an escape, X tries its challenge, a tap of Y grabs
golden flies and holding Y opens the panel (area travel, the Journal, Main menu); LB/RB jump between
areas and B goes to the main menu. While a pad is in use the screens show its buttons (A, B, X, Y) in
place of keyboard keys. In menus the stick or d-pad moves between buttons (left and right change a drop-down or a
slider), A presses and B goes back. Options → Frame rate shows frames a second in the corner, and
Options → Test sound plays two beeps to check where sound is lost on a device. The tool buttons show pad labels once a pad is used, and
big moments rumble where the pad supports it.

**Little Explorers.** Twenty gentle levels for young players (about 5 and up), from the title screen and
outside the campaign. Each teaches one thing (walking, keys, leaves, crouching, a button, a pebble,
running, a maze, swimming; then digging in, the tongue, a Sally-only crack, bounce caps, spore puffs,
camouflage, seeds, cracked walls, tunnels, and a grand tour of them all). They can't be lost: a catch is an "Oops!" that hops Sally back
to the last checkpoint flag, the creatures are slow and simple, and glowing dots lead to the key and the
door. Every level finished earns a sticker (each player's own). Levels are in `public/escape-kids.js`.

**Digging in.** A few escapes have patches of soft dirt (`d` on a text map). Holding Burrow on one, Sally
digs for 0.75 s (noisy: hunters nearby hear it), then lies buried, hidden from everything and safe even
from ants, until the button is let go. Stone, water and every other ground can't be dug.

**Android app.** `android/` holds the app for phones, tablets and Android TV (`android/README.md`).
Back goes back one step as Esc does, and at the main menu a second Back closes the app; the title also
has a Quit button inside the app.

**Hard mode.** An option that hides every drawn hint (gaze cones, ? and ! marks, aim lines, rings and
warnings), so only the creatures themselves give their plans away. Escapes won in hard mode earn a ◆ mark.
The Blind Grove, a secret spot that opens once the first four areas are cleared, is always played this way.

**The Magpie Roost.** A bonus area of five escapes that opens once the first six areas are cleared. Sally's
pouches never run out there, but magpies keep watch: one that sees her caws and every hunter nearby comes
straight for her, and any pebble or glow mushroom thrown near a magpie gets snatched away.

**Glow bugs.** Every glow bug freed (and golden fly caught) counts: 25 open the Cloud Nest, 40 and 75 earn
new colours for Sally (Firefly and Moonbeam), and at 100 a little sea-green glow bug of her own follows her.

## Self hosting

Deploy `compose.yaml` from this repository in Portainer. Set `IMAGE_TAG=latest` and `NPM_NETWORK=nginx_default` (or your existing proxy network). In Nginx Proxy Manager, point your chosen hostname to `sallys-escape:8080`. No database volume, API hostname or Netlify project is required. The game serves its own code and libraries; progress is stored in each browser, per player.

For private images, use your existing GitHub Container Registry credentials in Portainer. GitHub Actions tests the game, builds the image, checks its HTTP health and publishes both amd64 and arm64 images after a successful main-branch run.

## Development

Node 24. Run `npm ci`, `npm run prepare:static`, `npm test`, then `npm start`. The development dependencies are p5 and Tone.js (copied into `public/vendor/` by `npm run prepare:static`); the production server uses only Node’s built-in libraries.

Design notes are in `docs/`: the story, roadmap, creatures, music, lighting, builder and player data.


## License

Copyright (c) 2026 masadams. All rights reserved. The code, levels, story, art and music may be viewed here but not copied, modified, hosted or redistributed without written permission; see `LICENSE`. The bundled p5.js (LGPL 2.1) and Tone.js (MIT) keep their own licenses, in `public/vendor/`.
