# Sally’s Escape

A standalone top-down stealth and exploration game: 78 escapes, 21 optional challenges, a walkable maze overworld, limited tools and eleven creature types.

Explore themed courtyards and branching passages along a clear main route. The world map shows your best stars under every flag, challenge badges, and lifetime totals for stars, treasure, challenges and hidden caches. Each courtyard hides two glinting treasure caches to find on foot, a friendly villager with tips, and golden flies that Sally can chase down or grab with her tongue (R). Cloud shadows drift across the trail and a slow day–night cycle passes every four minutes.

Early escapes are one-touch: any catch ends the run. From Venom Depths (escape 24) onward Sally can drop her tail once per run; it wriggles as a decoy while she escapes, but a tailless Sally is a little slower and cannot earn the third star. The Shedding Hollow adds glowing regrowth bugs that grow the tail back, and the Lantern Marsh beyond it remixes darkness, timed doors, biting plants and rival hunters, watched over by owls that see far down a narrow beam and swoop onto the spot they lock.

Some branches open in parallel and also need completed challenges: Sunbaked Rooftops opens after Canopy Crown once four challenges are done. A hawk's shadow follows Sally there; awnings, leaves and camouflage (X: stay still to vanish) keep her safe. The Ant Kingdom branches off Venom Depths once eight challenges are done: ant columns march around fixed trails and walk over anything in their way, and gecko thieves dart out to steal the last treasure Sally picked up—chase one down before it reaches its burrow. Frost Hollow follows the Lantern Marsh: only its marked rooms are cold, draining a warmth meter until Sally is slow and cannot sprint, while glowing warm stones thaw her and cold-blooded hunters crawl on the ice. Steam Vents branches off the Rooftops once twelve challenges are done: wall vents hiss, then fire jets down their lanes on a rhythm. A live jet blocks its lane and blows Sally clear, and it knocks walking hunters aside, dazed—so luring a hunter into the steam is a tactic. See `docs/ROADMAP.md` for the regions still to come. Challenges are always one-touch.

Escaping a route on your very first attempt (no catch, no quitting part-way) earns a **First try** badge: its stars turn mint and a ✓ joins the flag on the world map.

Every hunter has its own job, so each one changes the route rather than just being dodged. Strikes aim where Sally is heading:
- **Beetle:** charges down a lane and smashes cracked walls.
- **Scorpion:** a living trap with a strike ring and a rhythmic tail.
- **Toad:** fires its tongue down clear lines.
- **Spider:** leaves tripwire webs.
- **Cricket:** raises the alarm.
- **Moth:** lights Sally up.
- **Mimic:** poses as treasure.

Traps (one-use and crumbling bridges, crumbling floor, rolling logs, thorns) and text-drawn level maps are described in `docs/ENEMIES.md`. `scripts/route-solver.cjs` records winning runs for the test fixtures.

Every escape opens with a short intro card; the hunters wait until you press a key or move. **Cards** in the toolbar switches between Brief (the hint stays folded behind **Show hint [H]** except where an area teaches something new), Full and Off. A challenge opens once its escape is cleared and its area has enough stars; open challenges glow on the world map. Sound effects are synthesised in the browser with Web Audio and cached as buffers after their first play. The adaptive music is composed in code with Tone.js: each region has its own style and each escape its own tune, fading between exploring, tension and chases, with an alarm hit when something gives chase (see `docs/MUSIC.md`). Earn every star in an area to master it: Sally can then wear that area's colours (**Colours** on the world map). For testing, **Ctrl+Alt+U** (or `?unlock=all` in the address) toggles a test mode that opens every escape and challenge without changing saved records. The Quiet Vault and Leafy Crossroads are available immediately; later regions are physically gated. Choose between paired routes. Harder paths rejoin after either route; later chapters retain their progression gates. The original MazeAdventure campaign, shop, upgrades, gauntlet, leaderboard API and database are absent.

Desktop: WASD or arrows, Shift sprint, Q pebble, E burrow, R tongue, F seed, X camouflage, Space look back, G map, Escape pause. Phones use landscape orientation, a left thumbstick and right action buttons. Rotating to portrait pauses a run until resumed. Completion stays inside the playfield.

## Self hosting

Deploy `compose.yaml` from this repository in Portainer. Set `IMAGE_TAG=latest` and `NPM_NETWORK=nginx_default` (or your existing proxy network). In Nginx Proxy Manager, point your chosen hostname to `sallys-escape:8080`. No database volume, API hostname or Netlify project is required. This static game serves its own code and p5 library; progress is stored on each browser/device under this game’s own save key. MazeAdventure records do not carry into it.

For private images, use your existing GitHub Container Registry credentials in Portainer. GitHub Actions tests the game, builds the image, checks its HTTP health and publishes both amd64 and arm64 images after a successful main-branch run.

## Development

Node 24. Run `npm ci`, `npm run prepare:static`, `npm test`, then `npm start`. The only development dependency is p5; the production server uses Node’s built-in HTTP and filesystem libraries.

The music direction is mysterious folk adventure, written in code rather than shipped as audio files. Music and progression notes are in `docs/`.

