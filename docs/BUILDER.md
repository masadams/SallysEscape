# Level builder

The builder is on the start menu.

## Setting the password on the server
1. Put the password in a `.env` file next to `compose.yaml` (or export it in the shell that runs
   `docker compose`): `BUILDER_PASSWORD='your password'`. Use single quotes. Compose treats `$` as
   the start of a variable, so a password with `$` in it arrives changed unless it is quoted like
   that (or each `$` is doubled to `$$`).
2. Recreate the container so it picks the password up: `docker compose pull && docker compose up -d`.
   A plain restart keeps the old settings.
3. Check the container log (`docker compose logs sallys-escape`). It says
   `Level builder: password set (N characters).` If N is not the length you expect, the password was
   changed on the way in; if it says no password is set, the container did not get it.

Spaces around the password are ignored. Too many wrong tries make that visitor wait a minute.

## Using the builder It asks for the **builder password**: the value of
`BUILDER_PASSWORD` on the server (`compose.yaml` passes it through from your environment). With no
password set the builder stays locked and nothing can be published. The password is remembered
for the browser tab; **Lock** forgets it.

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

## Playing, saving and sharing
The status line explains anything that stops a level being playable (no way to the key, a door
with nothing linked, a heavy plate with no beetle…). **▶ Playtest** runs it. **Save** keeps it in
this browser. **Share** gives one line of text (`SALLY2:…`) to paste into **Import** anywhere.
**⇪ Publish to community** puts it on the shared shelf.

**Community levels** (start menu) lists every published level for every player, with each
player's best time. Level makers can copy a community level into the builder or take it down.
