# Level builder

The builder is under **Extras** on the start menu.

## Signing in with a passkey
The builder and the **Admin** area (a link under the start menu buttons) need an admin signed in
with a passkey: Face ID, a fingerprint, the device PIN or a security key. There is no password.
Playing **Community levels** needs nothing.

**First passkey (once):**
1. Start the server with no passkeys. Its log prints a one-time code:
   `Admin setup: no passkey yet. ... enter this one-time setup code: ABCD-EF23`
   (`docker compose logs sallys-escape`, or the container's Logs tab in Portainer).
2. Open the game over https, choose **Level builder** or **Admin**, enter the code and a name for the
   device, and press **Create passkey**. The code then stops working.

**More devices:** signed in, open **Admin → Invite another device**. It shows a code that works once
within 15 minutes; on the other device open **Admin → Add this device with an invite code**.
**Add a passkey on this device** adds a second passkey (say, a security key) with no code.

**Removing:** Admin lists every passkey with when it was added and last used. **Remove** one you
have lost; the last one cannot be removed, so you are never locked out. If every passkey is lost,
delete `admin-passkeys.json` from the data volume and restart: a new setup code is printed.

A sign-in lasts 12 hours (**Sign out** in Admin ends it). Passkeys belong to one web address. Set
`PUBLIC_ORIGIN` to the address players use (for example `https://mazebackend.masonrobert.com`) so
they keep working whatever headers the proxy sends; without it the server uses the address each
request came in on. Passkeys need https (or `localhost`).

## Using the builder
Signed in, the builder opens straight away. **Admin** in its toolbar goes to the admin area.

## Painting
- **Tiles**: wall, floor, leaves (hide), gravel (noisy), cracked wall, mud, water, gap, crumbling
  floor, tangle vine, and a crack only Sally fits through. Drag to paint.
- **Places**: Sally, the key, the hatch and treasure (1, 2, or a 3 chest).
- **Enemies**: click to place. **➜ Patrol**: click an enemy, then the tiles it walks to, in order
  (up to six). Posted enemies (scorpion, toad, mimic, millipede, cobra, flytrap, crab, heron) keep
  their spot. **↻ Turn** sets where an enemy faces (a heron's beak, a cobra's gaze, a crab's run).

## Doors, bridges and triggers
Pick a colour, then paint **▮ Door** or **═ Bridge** tiles. Each colour is one door and one bridge.
Place triggers: **◉ Plate** (Sally stands on it), **⬛ Heavy plate** (only a beetle's weight; give a
beetle a patrol point on it) and **⚲ Lever**. The key and every chest are triggers too.

**🔗 Link**: click a trigger, the key or a chest, then click the doors, bridges or enemies it should
affect. Click again to unlink. A door can have as many triggers as you like, so three ways to open
one door is three links. Linked things light up when you select either end.

**☝ Select** a door to choose how it behaves:
- Opens for a few seconds (set the seconds)
- Opens and stays open
- Opens once for a few seconds, then is gone
- Starts open, slams shut for good
- Starts open, crumbles after Sally crosses (bridges only; needs no trigger)

## Sleeping enemies
Select an enemy and tick **Asleep until woken**, then link the key or a chest to it: it appears when
Sally takes that. (Plates and levers work doors; only the key and chests wake enemies.)

## Hazards and ground
- **♨ Steam vent**: place it in a wall next to open floor; ↻ Turn sets which way it blows; Select
  sets its reach.
- **⋀ Thorns**: rise and fall on a tile.
- **● Rolling log**: click its start, then where it rolls to (same row or column).
- Select a hazard to set **slow / medium / fast**, or **half a beat later** to stagger two of them.
- **❄ Cold** ground chills Sally; a **◍ Warm stone** thaws her.

**Level settings** also set how many **glow mushrooms** Sally carries (0–5). Each one, thrown,
lights the ground around where it lands for about twelve seconds; give them to fogged or dark
levels.

**Moss** is a tile (silent ground). Under Extras: **Water current** (two corners over water; Select
it to set the direction and strength), **Echo hall** (two corners) and **Burrow pair** (click one
mound, then its partner). Level settings set **Spore pouches** (0–5).

## Quick build

Open **⚡ Quick build** above the level settings, choose a size, theme (meadow, marsh, desert, frost,
glow grotto, jungle, ruins), difficulty and, if you like, a creature to feature, then press **Build**.
It replaces what is in the builder with a first draft that follows the game's rules: rooms joined by
corridors with loops, the key and hatch far from the start, ten treasure with the best in dead ends,
leaves never more than a few steps away, nothing near the start and nothing posted on the only way
through. Each theme adds its extras (cold rooms and warm stones, darkness and glow plants, desert sand
and a hawk with awnings, an echo hall). Every draft is checked before you see it: the builder's checks,
and fifteen seconds standing still at the start without being seen.

The same settings and seed always build the same level; **🎲 Another one** keeps the settings and picks
a new seed. The draft is an ordinary level: move, add or remove anything, playtest, save or publish.
The generator is `public/escape-quickbuild.js`.

## Playing, saving and sharing
The status line explains anything that stops a level being playable (no way to the key, a door
with nothing linked, a heavy plate with no beetle…). **▶ Playtest** runs it. **Save** keeps it in
this browser. **Share** gives one line of text (`SALLY2:…`) to paste into **Import** anywhere.
**⇪ Publish to community** puts it on the shared shelf.

**Community levels** (Extras on the start menu) lists every published level for every player, with each
player's best time. Level makers can copy a community level into the builder or take it down.

## The level workshop (game levels)
**Admin → Open the level workshop** lists every escape in the game, the Gilded Burrow and the bonus
escapes. **Edit** opens one in the builder with everything it has. **Save draft** keeps the draft in
this browser only: drafts never go to the community shelf and change nothing for players.
**Back to the game's version** reloads the original; **Discard draft** deletes the draft.

**Test drafts in game** (in the workshop) swaps each draft in for its escape in this browser, so it
plays from the map with its unlocks and ties unchanged, marked ✎. Runs on a draft never count
toward stars or progress. Turning it on or off reloads the page.

**Export** (one draft or all) downloads a `sally-level-edits-<date>.json` file and shows the same
text to copy. To bring an export into the game:

    node scripts/apply-level-edits.cjs edits.json           # check: builds, lint, recorded run
    node scripts/apply-level-edits.cjs edits.json --write   # write into escape-rebuilt.js / escape-hidden.js

An edited escape keeps its id and revision, so players' records stand. If the check says the
recorded winning run no longer wins, record a new one before the tests pass again.
