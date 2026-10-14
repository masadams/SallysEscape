# Sally’s Escape

A standalone top-down stealth and exploration game: 58 escapes, 16 optional challenges, a walkable maze overworld, limited tools and eleven creature types.

Explore themed courtyards and branching passages along a clear main route. The world map shows your best stars under every flag, challenge badges, and lifetime totals for stars, treasure, challenges and hidden caches. Each courtyard hides two glinting treasure caches to find on foot, a friendly villager with tips, and golden flies that Sally can chase down or grab with her tongue (R). Cloud shadows drift across the trail and a slow day–night cycle passes every four minutes.

Early escapes are one-touch: any catch ends the run. From Venom Depths (escape 24) onward Sally can drop her tail once per run; it wriggles as a decoy while she escapes, but a tailless Sally is a little slower and cannot earn the third star. The Shedding Hollow adds glowing regrowth bugs that grow the tail back, and the Lantern Marsh beyond it remixes darkness, timed doors, biting plants and rival hunters. Challenges are always one-touch.

Every escape opens with a short intro card (name, hint and tools); the hunters wait until you press a key or move. Sound effects are synthesised in the browser with Web Audio, so no audio files are bundled. The Quiet Vault and Leafy Crossroads are available immediately; later regions are physically gated. Choose between paired routes. Harder paths rejoin after either route; later chapters retain their progression gates. The original MazeAdventure campaign, shop, upgrades, gauntlet, leaderboard API and database are absent.

Desktop: WASD or arrows, Shift sprint, Q pebble, E burrow, R tongue, F seed, Space look back, G map, Escape pause. Phones use landscape orientation, a left thumbstick and right action buttons. Rotating to portrait pauses a run until resumed. Completion stays inside the playfield.

## Self hosting

Deploy `compose.yaml` from this repository in Portainer. Set `IMAGE_TAG=latest` and `NPM_NETWORK=nginx_default` (or your existing proxy network). In Nginx Proxy Manager, point your chosen hostname to `sallys-escape:8080`. No database volume, API hostname or Netlify project is required. This static game serves its own code and p5 library; progress is stored on each browser/device under this game’s own save key. MazeAdventure records do not carry into it.

For private images, use your existing GitHub Container Registry credentials in Portainer. GitHub Actions tests the game, builds the image, checks its HTTP health and publishes both amd64 and arm64 images after a successful main-branch run.

## Development

Node 24. Run `npm ci`, `npm run prepare:static`, `npm test`, then `npm start`. The only development dependency is p5; the production server uses Node’s built-in HTTP and filesystem libraries.

The new main-theme direction is mysterious folk adventure. No generated music has been bundled yet. Music and progression notes are in `docs/`.

