# Sally’s Escape

A top-down stealth and exploration game in the browser. Sally, a small garden lizard, is carried
far from home by a flood and must sneak back across the Overgrowth: 100 escapes in 21 areas, 14
hidden escapes, 21 challenges, 29 kinds of creature, and a walkable world map. Along the way she
learns she is one of the lost Wayfinders (the story is in `docs/STORY.md`).

**Playing.** The title screen shows who is playing (up to six players share a browser, each with
their own progress and settings), with Continue, Players, Options and Extras (community levels and
the level builder). On the world map Sally walks between areas, talks to villagers, finds caches,
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
`compose.yaml` mounts a volume there). For testing, **Ctrl+Alt+U** (or `?unlock=all`) toggles a test
mode that opens every escape without changing saved records.

**Controls.** WASD or arrows, Shift run, C crawl, Q pebble (hold to throw further), L glow mushroom,
Z spore pouch, E burrow, R tongue, F seed, X camouflage, Space look back, G map, H hint, M mute, Esc
pause. On the world map R grabs golden flies and Enter enters an escape. Phones use landscape, a left
thumbstick and right action buttons; rotating to portrait pauses a run.

## Self hosting

Deploy `compose.yaml` from this repository in Portainer. Set `IMAGE_TAG=latest` and `NPM_NETWORK=nginx_default` (or your existing proxy network). In Nginx Proxy Manager, point your chosen hostname to `sallys-escape:8080`. No database volume, API hostname or Netlify project is required. The game serves its own code and libraries; progress is stored in each browser, per player.

For private images, use your existing GitHub Container Registry credentials in Portainer. GitHub Actions tests the game, builds the image, checks its HTTP health and publishes both amd64 and arm64 images after a successful main-branch run.

## Development

Node 24. Run `npm ci`, `npm run prepare:static`, `npm test`, then `npm start`. The development dependencies are p5 and Tone.js (copied into `public/vendor/` by `npm run prepare:static`); the production server uses only Node’s built-in libraries.

Design notes are in `docs/`: the story, roadmap, creatures, music, lighting, builder and player data.

