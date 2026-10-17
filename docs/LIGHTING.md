# Lighting

Lighting is purely visual: what creatures see, and what Sally can see, is decided by the engine.
`public/escape-lighting.js` holds the data; `escapescene.js` draws it.

## Full and Simple

**Lighting: Full / Simple** in the toolbar is saved per browser. Simple is the plain, flat look.

## Performance

The canvas draws at most 2 device pixels per CSS pixel on a desktop and 1.5 on a phone
(`escapeDensityCap`): a phone screen's 3× would be nine times the drawing for little visible
gain. When frames run slower than about 30 fps for three seconds, quality steps down by itself:
sharpness to 1.5×, then 1×, then Simple lighting (shown as "Simple (auto)") until the player
picks again.

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
- **Water** catches rippling sunlight.
- **Lightning** throws long shadows from every wall for the length of the flash, and the white
  flash itself is gentler.
- **Danger:** during a chase the screen's edges warm and darken, pulsing slowly; it fades in
  quickly and out slowly. While Sally is hidden, a faint hush settles over the view.
