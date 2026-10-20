# Blossom Hollow (spring) — what is built

The plan is [SPRING-PLAN.md](SPRING-PLAN.md) (shared rules in [SEASONAL-AREAS-PLAN.md](SEASONAL-AREAS-PLAN.md)).
This page describes what actually exists. **The area is closed**: `spring` stays `ready:false` in
`public/escape-seasons.js` until all eight escapes are built, recorded and reviewed.

## Built (8 of 8)

Routes live in `public/escape-spring.js`; recorded inputs in `tests/fixtures/escape-spring.cjs`
(`node scripts/record-spring.cjs --write`, tours in `scripts/spring-tours.json`); tests in
`tests/escape-spring.cjs`.

| # | Escape | Size | Teaches | Creatures |
| --- | --- | --- | --- | --- |
| 1 | The Rainy Garden Gate (`spring-gate`) | 19×13 | A hedge switch, then the key opens the garden gate home | Snake |
| 2 | Under the Potting Shed (`spring-burrows`) | 21×14 | A burrow pair, crawling on moss past a mole, a board pocket where you step onto a leaf and let it surface where it last heard you | Mole |
| 3 | Across the Lily Pond (`spring-pond`) | 21×15 | Two south-flowing streams, a footbridge switch, a lily pad that throws Sally home | Toad |
| 4 | The Glasshouse Lookout (`spring-glasshouse`) | 23×15 | Four bays and two switches; walk calmly or crawl past a ladybird so it never buzzes the serpent; come at the mantis from behind | Ladybird, snake, mantis |
| 5 | The Sleeping Waterwheel (`spring-mill`) | 23×15 | A millrace too deep to swim, three bridges, a switch flicked with the tongue from across the race; a walled toad bay with a leaf strip and a tongue-reach treasure | Toad |
| 6 | The Gardener’s Shortcut (`spring-wall`) | 23×17 | Let the beetle see you in front of the cracked wall and step aside; the shed switch opens the back path, so the wall is never the only way home | Beetle |
| 7 | Lanterns After Rain (`spring-lanterns`) | 23×15 | Cross under the moth when it is far; throw a glow mushroom and the weaver backs out of the light; the key opens the low gate home | Moth, spider |
| 8 | The First Blossom (`spring-festival`) | 25×17 | Moss round the mole court, a tongue-switched bridge over the race, the gardener charging the key garden wall from a vestibule, the bottom path home | Mole, beetle |

Every level: ten treasure (all optional), finite tools, a fifteen-second safe start, normal retries, field
notes from **Clover** (the spring guide). Each has a recorded normal win and an all-treasure win made
of real inputs (the recorder waits on what a player would watch: a mole well away, the moth at the far
end of its loop, a beetle's wind-up and then its stun before stepping through the hole), and both still
win after opening the level in the builder and building it again.

## Look

`public/escape-spring-art.js`: five palettes (`spring-garden`, `spring-shed`, `spring-pond`,
`spring-glass`, `spring-dusk`), and props drawn once per run: blossom tree, flower pot, watering can and
a glowing flower lantern, and the turning waterwheel. Petals drift with Full lighting (fewer on TV boxes) and stop for reduced
motion. Creatures keep their campaign drawings and tells for now; spring costumes come later.

## Costumes

`drawSpringCreature` in `public/escape-spring-art.js`: the **Ribbon Grass Snake** is the campaign
serpent in leaf green with blossom bands (the same body, eyes and tongue, through a colour scheme for
`drawEscapeSnake`); the **Stag Gardener** (beetle) gets twig antlers and a leaf apron, the **Mud Mole** a
root tuft and soil specks, the **Lily Toad** a lily-leaf cap, the **Garden Weaver** dew beads, the
**Blossom Mantis** petal forelegs. The **Ladybird Lookout** and **Lantern Moth** keep their campaign
drawings. Every tell, red-eye warning and collision shape is the campaign's own. Names are
`EscapeSeasons.springCreatures`.

## World garden

On the seasonal world map (`paintSpringWorldDetails`, `drawSpringWorld`): little blossom trees and
flower beds baked into the terrain; a central blossom tree that flowers one cluster per flower token
home; eight flower lanterns round it, one lit per token; a waterwheel by the pond that turns once all
eight are home; drifting petals (fewer on TV, none with reduced motion). **Clover**, a garden snail,
stands by the entrance. Locals are drawn only once their area is open.

## Builder

The Look setting has the five Blossom Hollow looks, and the Extras prop tool has the four spring props.

## Rewards, text and music

- Finishing all eight spring escapes earns **Blossom Sally**, a spring-green outfit with pink spots. It can be worn from the seasonal collection, next to Copper Lantern and Winterberry.
- The collection, HUD, results and keepsakes use spring words: flower tokens, the blossom tree, and the watering can for finding every treasure.
- There are two music moods: `blossom`, a bright garden waltz for the outdoor routes, and `rainshed`, a softer one for the shed, glasshouse and lantern dusk routes.

## Release

The pack is `ready:true` with 8 levels. It opens on its own on 20 March 2027 (Toronto time). Until then it shows its rain and blossom weather and a countdown. Set `access:'open'` to open it early for testing, or `access:'closed'` to keep it shut.
