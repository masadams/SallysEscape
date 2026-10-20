# Remaining seasonal areas — design and delivery plan

Status: proposal for review. This PR adds documentation only. It does not enable spring/summer, change opening dates, edit game controls or implement the proposed levels.

## Recommended direction

| Area | Spring: Blossom Hollow | Summer: Sunshore Cove |
| --- | --- | --- |
| Story | The First Blossom Festival: restore a rain-fed garden | The Last Light of Summer: restore a harbour lighthouse |
| Existing map position | Southeast, garden region | Southwest, coast region |
| Levels | Eight compact easy-to-medium escapes | Eight compact easy-to-medium escapes |
| Core play | Quiet ground, burrows, plant cover, mill streams | Tide timing, safe swims, shore lanes, distractions |
| Signature feature | Waterwheel/tree restoration and safe lily-hop trail | Restored lighthouse and safe decorative kite lawn |
| New ground art | Wet paths, moss, mud, petals, greenhouse floors | Sand, shell gravel, driftwood boards, tide flats |
| Main reward | Blossom Sally colours + potted flowering tree | Sunshore Sally colours + miniature lighthouse |
| All-treasure reward | Mechanical watering can keepsake | Anchored sailboat keepsake |
| Gate concealment | Rain curtain, low mist, greenhouse lights | Marine haze, dune grass, lighthouse/bunting glimpses |

Detailed proposals:
- [Spring: world layout, eight enemies, eight level briefs, art, sound and rewards](SPRING-PLAN.md)
- [Summer: world layout, eight enemies, eight level briefs, art, sound and rewards](SUMMER-PLAN.md)

Names, dimensions, supply counts and palettes are proposed targets. Final tile layouts, coordinates and tuning require authored maps and solution replay. These documents are not a claim that the planned levels already exist or have been solved.

## Design rules carried forward from Autumn and winter

1. **One continuous seasonal world.** Fill the existing garden and coast regions; use the campaign-style walking map, flag entrances, shared travel/overview and collection panel. No separate disconnected mini-game menu.
2. **Campaign feel.** Keep Sally’s rig, movement, camera, collision, tool aiming and controls. Local surfaces may opt into existing flow/traction; ordinary ground remains ordinary.
3. **Compact, interesting rooms.** Teach one new job early, then combine familiar jobs. Use loops, sight breaks, remote switches and changed return paths. Optional treasure adds challenge without blocking an easy clear.
4. **Normal rules.** Finite supplies, normal catches/retries, optional treasure, no campaign upgrade requirement and no mandatory speedrun. Seasonal progress does not replace the saved campaign location.
5. **Readable danger.** Existing creature tells, collision shapes and warning geometry survive reskinning. Decorative wildlife is harmless and visibly different.
6. **Consistent input.** Use the same touch joystick/buttons, keyboard/mouse and controller actions as the campaign. Last active device chooses prompts. Overview panels suppress walking controls; returning restores them. No area-specific input handler.
7. **Art that belongs.** Build on current procedural terrain, tree/cabin shapes, soft lighting and costume rigs. Water, particles and texture detail support navigation rather than covering it.
8. **Independent, lasting rewards.** Complete eight levels for a skin and menu keepsake; all treasure adds a cosmetic extra. No reward grants combat power. Access dates never erase progress.

## Scope: reuse versus new work

**Reuse:** season IDs/progression/release states; eight entrance anchors per area; regular creature behaviours; current, wind, tide, tunnels, bounce caps, native ground/cover, bridge/switch and tool systems; shared audio mixer; Full/Simple graphics; per-player outfit ownership; real-browser smoke and recorded-solution approach.

**New content:** sixteen authored levels and their notes, sixteen seasonal creature appearances/cues across the two packs, spring/summer terrain/scenery/music, eight-token world restoration per area, two skins and four menu keepsakes.

**Small presentation features:** spring lily-hop world interaction using the existing flight model; summer kite lawn; waterwheel/lighthouse restoration; improved themed water and gate weather. Keep these bounded and disposable with the scene.

**Explicitly outside the first delivery:** new combat, bosses, health/heat/pollen meters, random procedural levels, fluid simulation, boat controls, a new jump action, custom seasonal control schemes, new upgrade economy or annual save wipes.

## Suggested implementation sequence

Ship spring and summer as **separate implementation PRs**, each complete and reviewable. This design PR should remain a design decision; merging it must not release either area.

### Phase 1 — source audit and route blockouts
- Audit current tide/breath/flow, native fish, seed planter, tunnel and bounce-cap APIs against actual engine/builder behaviour.
- Confirm the main branch’s merged winter input and save fixes are present; preserve them.
- Block out spring 1–3 and summer 1–3 in plain campaign art before polishing. Prove the garden gate/burrow/pond and dune/crab/tide lessons are fair.
- Select final enemy parameters only after seeing warning windows at touch/controller speeds.
- Keep pack IDs `spring` and `summer`; proposed file/level names can change before release. Give newly published routes stable IDs and revision 1.

### Phase 2 — spring gameplay, then spring presentation
- Author spring 1–8, notes, finite supplies, optional treasure and alternate returns.
- Produce real-input normal/all-treasure routes as levels are built, not at the end.
- Add creature costumes, village collision/paths, restoration visuals, spring water/rain/petals and original music/cues.
- Complete skins/keepsakes/access states, performance and browser verification.
- Open spring for review only if explicitly requested; otherwise keep unreleased content scheduled/closed and use test-only access overrides.

### Phase 3 — summer gameplay, then summer presentation
- Build on the accepted spring/shared infrastructure without duplicating progression or controls.
- Author and validate tide/refuge/water routes before decorative water effects.
- Finish all eight level routes, enemy costumes, harbour geometry, lighthouse restoration and summer sound.
- Audit the complete seasonal map with all four areas populated, including phone-size keepsakes and world travel.
- Keep summer gated until its own content and verification are complete.

### Phase 4 — release review for each area
- Document exact access configuration, release date, route IDs, known limitations and rewards.
- Supply a level-by-level reviewer guide with screenshots and the solved tours.
- Run full CI and standalone image start/restart checks for implementation changes.
- Leave the implementation PR ready for review. Do not merge or deploy as part of authoring.

## Authoring and implementation targets

Follow the existing winter structure rather than requiring an engine rewrite:

| Concern | Proposed location / approach |
| --- | --- |
| Level maps, notes, tools and routes | New `public/escape-spring.js` and `public/escape-summer.js`; register in the existing catalog |
| Creature costumes and themed scenery | Separate spring/summer art modules called by the current scene painters |
| Region geometry and safe activities | Existing seasonal world model; explicit floors, banks and props |
| Access, names, palettes and rewards | Existing seasons registry/progress system and shared keepsake renderer |
| Music, ambience and effects | Extend current banks/recipes, honour mixer and voice limits |
| Shared physics, if genuinely required | Small opt-in changes with ordinary campaign regression proof |
| Builder | Expose any newly supported data; preserve current/water/ground defaults through save/load |
| Solutions | Readable waypoint tours plus generated compressed real-input fixtures |
| Documentation | Final SPRING.md and SUMMER.md describing actual authored content, replacing proposal assumptions |

Potentially expensive work is mostly **level design and verification**, not reskinning. Keep the first implementation to existing hazard rules; treat any request for a new behaviour as a separately stated design change. Avoid promising calendar estimates before the blockout routes pass.

## Fairness and solvability contract

For each of the sixteen levels:
- Safe start: no forced catch during at least the first fifteen seconds when Sally stays in the intended start alcove.
- Mandatory route works without upgrades and without collecting optional treasure. Ten treasure total is the authoring target, consistent with winter.
- Intro, notes, pause and background/resume do not advance hazards into an immediate unavoidable catch.
- Every required tool is taught, supplied finitely and reachable before use. A missed throw may require a normal retry; it must not leave a falsely winnable saved run.
- At least one real-input normal solution and one all-treasure solution pass with every enemy, current, tide, collision and breath rule enabled. No teleport, hunter disable or unlimited-tool solver.
- Permanent gate, crumble or cracked-wall actions cannot strand mandatory items or essential treasure. Retries restore tools and all dynamic state.
- Tidal/current routes have safe refuges, side exits and generous no-upgrade breath margins. Verify alternate entry timing, not just one lucky phase.
- Avoid overlapping mandatory threats without a safe observation point. Finales combine taught mechanics rather than revealing a new rule at the exit.

## Verification and performance plan

**Automated:** 32 recorded wins across the two areas; geometry/loot totals; gate and irreversible-state checks; safe starts; supplies; native creature responses; pause/retry/batched frames; tide phase variants; world connectivity; countdown/open/closed behaviour; reward migration and per-player isolation.

**Real browser:** render all sixteen levels and both populated regions on desktop, phone and tablet; Full/Simple and reduced motion; actual touch drags/entry/tool throws, keyboard movement and Gamepad API navigation; controller-to-touch switching; map/collection/back/return-to-campaign; readable title, countdowns, notes and touch targets.

**Audio:** actual Web Audio output for both music banks and creature cues; finite sample values, audible non-clipping levels, mixer/mute, pause/resume and concurrent-voice limits. No remote art/music fetches; verify the existing offline/static preparation pipeline includes all new code/data.

**Performance:** use existing bounded terrain caches and per-scene disposable buffers. Set explicit particle caps, cull offscreen props and avoid allocating terrain graphics per frame. Compare representative populated regions against the current winter baseline at the same viewport/device. Preserve the selected frame-rate budget; reduce decorative density before sacrificing warning clarity.

**Regression:** keep campaign, Little Explorers, Autumn, winter, glow shelter, builder, save, UI and hosting suites enabled. Verify ordinary ground and unchanged tools retain prior behaviour. Final implementation CI builds and restarts the real standalone container.

## Decisions proposed for review

- Names: Blossom Hollow / Sunshore Cove.
- Eight easy-to-medium campaign-style levels each, with optional harder treasure.
- Eight native-behaviour creature themes each, as detailed in the companion documents.
- Spring feature focus: quiet garden routes, burrows and streams.
- Summer feature focus: tide rhythm and short safe swimming routes.
- Cosmetics: Blossom Sally + flowering tree/watering can; Sunshore Sally + lighthouse/sailboat.
- Existing first-opening dates remain March 20 and June 1, 2027 in America/Toronto; no access changes in this PR.

This is a complete proposed direction for implementation review. Detailed tile maps, exact enemy tuning and recorded solutions belong to the subsequent gameplay PRs.
