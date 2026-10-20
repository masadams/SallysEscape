# Blossom Hollow (spring) — what is built

The plan is [SPRING-PLAN.md](SPRING-PLAN.md) (shared rules in [SEASONAL-AREAS-PLAN.md](SEASONAL-AREAS-PLAN.md)).
This page describes what actually exists. **The area is closed**: `spring` stays `ready:false` in
`public/escape-seasons.js` until all eight escapes are built, recorded and reviewed.

## Built so far (3 of 8)

Routes live in `public/escape-spring.js`; recorded inputs in `tests/fixtures/escape-spring.cjs`
(`node scripts/record-spring.cjs --write`, tours in `scripts/spring-tours.json`); tests in
`tests/escape-spring.cjs`.

| # | Escape | Size | Teaches | Creature |
| --- | --- | --- | --- | --- |
| 1 | The Rainy Garden Gate (`spring-gate`) | 19×13 | A hedge switch, then the key opens the garden gate home; the serpent keeps to the top path | Snake |
| 2 | Under the Potting Shed (`spring-burrows`) | 21×14 | A burrow pair into the potting shed, crawling on moss past a mole, a board pocket where you step onto a leaf and let the mole come up where it last heard you | Mole |
| 3 | Across the Lily Pond (`spring-pond`) | 21×15 | Two south-flowing streams, a footbridge switch, a toad watching up the island past a stone pot, and a lily pad that throws Sally home | Toad |

Every level: ten treasure (all optional), finite pebbles and tongue, a fifteen-second safe start,
normal retries, field notes from **Clover** (the spring guide). Each has a recorded normal win and an
all-treasure win, and both still win after opening the level in the builder and building it again.

## Look

`public/escape-spring-art.js`: five palettes (`spring-garden`, `spring-shed`, `spring-pond`,
`spring-glass`, `spring-dusk`), and props drawn once per run: blossom tree, flower pot, watering can and
a glowing flower lantern. Petals drift with Full lighting (fewer on TV boxes) and stop for reduced
motion. Creatures keep their campaign drawings and tells for now; spring costumes come later.

## Builder

The Look setting has the five Blossom Hollow looks, and the Extras prop tool has the four spring props.

## Still to do

Levels 4–8 (glasshouse with the ladybird, the mill, the gardener's shortcut, lanterns after rain, the
finale), creature costumes, the world-map garden (Clover, the blossom tree, restoration), spring music
and ambience, the Blossom Sally skin and keepsakes, the result and collection text, then opening.
