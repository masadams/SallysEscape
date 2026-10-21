# Lighting

Lighting is purely visual: what creatures see, and what Sally can see, is decided by the engine.
`public/escape-lighting.js` holds the data; `escapescene.js` draws it.

## Full and Simple

**Lighting: Full / Simple** in Options is saved per player. Simple is the plain, flat look.

## Performance

The canvas draws at most 2 device pixels per CSS pixel on a desktop and 1.5 on a phone
(`escapeDensityCap`): a phone screen's 3× would be nine times the drawing for little visible
gain. When frames run slower than about 30 fps for three seconds, quality steps down by itself:
sharpness to 1.5×, then 1×, then Simple lighting (shown as "Simple (auto)") until the player
picks again. The automatic step keeps the terrain art (ground, water edges and walls are one still
layer drawn once, so they cost almost nothing); it drops lighting, weather, sway and critters. Only
choosing Simple yourself brings back the plain tiles.

**Start-up.** Measured in Chromium with the CPU slowed four times (roughly a TV box), the first
frames arrive about 1.3 s after the page is opened. p5.js takes about 350 ms of that, building the
level catalogue about 110 ms (it was about 210 ms before each text map was read in a single pass
instead of once per tile kind) and Tone.js about 100 ms. The game's own fifty-odd scripts cost
almost nothing up front, because the browser only compiles a function when it first runs, so
bundling them would not make a noticeable difference; on the Android app they are read from the
device, not the network.

## Darkness

In fogged and dark levels, what Sally cannot see is darkened through a one-pixel-per-tile
canvas scaled up smoothly, so darkness fades across tile edges instead of stepping. Remembered
ground shows its layout, dimmed; creatures and objects out of sight are never drawn.

## Light sources

`lightSources(game)` lists what glows, each with a colour, a radius and a gentle flicker: glow
plants and thrown glow mushrooms (cyan), moths (warm), anglers' lures, glow bugs, warm stones,
active steam vents, the hatch once it is open, and in the dark a soft glow round Sally. Only
sources the player can see glow. They are drawn additively before the darkness, full strength
in fogged, dark and night areas and softer elsewhere.

## Moods

`MOODS` gives every area, secret spot, the Gilded Burrow, the bonus maze and the finale a mood:
a soft-light colour **grade**, a time-of-day **wash** from one side (morning from the top in the
meadow, an orange glow from below in the vents, a golden sunset over the Road Home that warms
escape by escape), a **vignette**, and whether it is a **night** area (light sources glow
brighter). Grades stay subtle (alpha under 0.4) so the play area always reads clearly.

## Depth, weather and danger

- **Wall shadows:** soft shadows where floor meets a wall above or to the left, drawn into the
  cached tile layer, so they cost nothing per frame.
- **Light shafts** slant down through the canopy and cave roofs (`shafts` in a mood: the jungle,
  the grotto, Luminous Depths, the Bestiary Grove and the Sunken Wreck), swaying slowly.
- **Water** is drawn as one body (see Terrain below), with highlights and foam moving each frame.
- **Lightning** throws long shadows from every wall for the length of the flash, and the white
  flash itself is gentler.
- **Danger:** during a chase the screen's edges warm and darken, pulsing slowly; it fades in
  quickly and out slowly. While Sally is hidden, a faint hush settles over the view.

## Terrain

In Full lighting `public/escape-terrain.js` replaces the plain tiles, so escapes read as places
rather than grids. It changes only the look; where Sally can walk is untouched.

- **Ground** fills every open tile edge to edge, with big faint patches that wander across tile
  edges and a material per area, scattered in world space: grass, earth with roots, staggered
  flagstones, cave stone with seams, wind-rippled sand, snow drifts, clay roof tiles.
- **Walls** are solid masses: tiles join without gaps, corners that stick out are rounded, a wall
  with open ground below shows a darker front face, and each area has its own material with an
  edge of its own (leafy hedges, cut stone courses, faceted rock, layered sandstone, ice). Each
  material leans the area's palette toward its colour but keeps its brightness, so dark places stay
  dark.
- **Water:** shallows and deep channels are one body. Depth darkens in soft pools away from the
  bank, shallows fall off softly into deep water, banks and islets are rounded, the land side is
  damp with a pale wet lip, and foam breathes along the banks and round the curves.
- **Zones** that matter to play (cold floor, moss, tide flats, ice) are one sheet with an edge
  only where the zone ends.
- **Cost:** the terrain is drawn into its own cached layer, rebuilt only when walls or water
  change (about 50 ms on the largest map, at load). Gates do not count, so a gate opening redraws
  only the light tile layer above it (about 5 ms).

## Small lives

`public/escape-critters.js` adds creatures that share each escape but play no part in it; the
engine never reads them, and they keep clear of keys, treasure, switches and hatches. Each area
has its own set. Birds perch on walls and burst into the air when Sally comes close, runs nearby,
makes noise or a hunter passes, flying to a perch away from her with a shadow below. Butterflies
drift round flowers and scatter. Fish shadows glide in the water and dart off. Frogs croak on
the banks and plop in. Skinks flick away along the walls. Watchers only watch: cave fungus
follows Sally with eyes on stalks, blinks, and pulls them in when she comes near; flowers turn
their heads after her; anemones close as she passes. Full lighting only.
