# Level lab: solving and improving maps

This developer tool searches without route hints, simulates the actual
`EscapeAdventure` engine at 120 Hz, independently replays wins, and tests input
timing variations. It never edits a map, unlocks progress, or changes game rules.
Node 24; no additional packages, API keys, network services or model training.

## Run it

From the repository root:

```sh
npm run level:lab -- list
npm run level:lab -- solve quiet-vault --out work/lab/quiet-vault
npm run level:lab -- replay work/lab/quiet-vault/replay.json
npm run level:lab -- stress work/lab/quiet-vault/replay.json --trials 20 --jitter 6 --seed 42
```

`solve` saves `report.md`, machine-readable `report.json`, and, on success,
`replay.json`. Use a separate output directory per map/revision. A failed search
removes a previous replay in that output directory so it cannot look like a new
success. The report lists the best progress and frequent failed branches with
coordinates and the engine's explanations. Those counts are search diagnostics,
not player death statistics or a difficulty score.

```sh
# Other catalog routes
npm run level:lab -- solve challenge:ghost-run --out work/lab/ghost
npm run level:lab -- solve hidden:ID --out work/lab/hidden

# Paste a builder's SALLY1/SALLY2 share code into a text file; JSON builder models also work
npm run level:lab -- solve --custom work/shared-level.txt --out work/lab/custom

# For an authored text-map route object, including mechanisms not exposed by the builder
npm run level:lab -- solve --route work/candidate-route.json --out work/lab/candidate

# Try a saved strategy against the CURRENT map, then search if it no longer wins
npm run level:lab -- solve quiet-vault --reuse work/old/replay.json --out work/new
```

`--custom` runs builder validation before simulation. `--route` expects the
authored object consumed by `escapeBuildCustom`, not a complete engine snapshot
or the JavaScript catalog module. Its schema is trusted local developer input;
the engine rejects unknown levels and malformed required data. Test an edited
catalog level by its ID, not by exporting a partial approximation of it.

## Search controls and meanings

| Option | Default | Meaning |
| --- | --- | --- |
| `--budget` | 1500 | Maximum parent states expanded |
| `--width` | 24 | States kept per search depth |
| `--depth` | 160 | Maximum decisions along a branch |
| `--seconds` | 120 | Maximum simulated time per branch |
| `--milliseconds` | 60000 | Search wall-clock budget, checked between candidates |
| `--no-tail` | off | Require no tail drops; normal legal tail recovery is otherwise allowed |
| `--trials` | 8 | Timing stress runs after a solution, up to 100; 0 disables |
| `--jitter` | 6 | Maximum input-duration change in 120 Hz frames, plus occasional input delays |
| `--seed` | 1 | Reproducible timing perturbations |

An individual candidate and final verification/stress can extend beyond the
search wall-clock budget. Timing can differ between computers; use generous
wall time and compare expansion counts when investigating reproducibility.

- **Solved:** a fresh real-engine run legally escaped using the saved inputs.
- **Unresolved:** search stopped at its expansion, depth, time or frontier limit.
  This is **not proof of impossibility**. Pruning and the action vocabulary are
  approximate. Report the exact settings before judging the map.
- **Timing stress:** replays the inputs with early/late releases and intermittent
  hesitation. A failed variation identifies sensitivity in this recorded
  strategy, not necessarily a flaw in the map. It does not simulate a human
  correcting course, learning, or discovering clues. Passing is not a fairness
  certificate. Never call its fraction a human win rate.

CLI exit codes: 0 means solved / exact replay passed; 1 means unresolved / replay
failed. `stress` returns 1 if the baseline fails or any variation fails. Invalid
arguments, malformed replays or stale artifacts return 2. `solve` still returns
0 for a verified win with failed stress variations: inspect the report before
accepting it. `--trials 0` supplies no timing evidence.

## How the solver works

Bounded beam search keeps several alternate real-engine states. It explores
walking, sprinting, short diagonal dodges, waits, directional pebble/tongue/
burrow/seed actions, camouflage and look-back. Controls use digital movement,
not coordinate teleportation or exact fractional positioning. Switching facing
uses real movement input. Tail shedding is an automatic engine response, not a
free solver action.

Optimistic map distances guide key/treasure/exit search. Reserved beam slots
also explore switches, plates, levers and treasure, allowing detours away from
the direct route. Spatial diversity retains alternate lanes. These heuristics
can suggest crossings through closed gates or gaps; **only the real engine can
actually open or cross them**. Hunters, body/tail contact geometry, stamina,
traps, timers, reactions and reinforcements run during every simulated step.

This is a full-information development planner. It has no realistic visual
discovery model, human reaction model, learned skill distribution or proof of
completeness. It may miss long strategic waits, unusual movement, complex
mechanism sequences or useful detours outside its beam. It need not solve every
existing late-game level. Keep the older hinted `scripts/route-solver.cjs` and
existing recordings as complementary tools and regression coverage.

Replays contain a fingerprint of their options and current engine/catalog/rig
sources. `replay` and `stress` reject stale fingerprints. `solve --reuse` is an
explicit exception: it tries the old **inputs** against the selected current
map and only writes a fresh replay if they still legally win. Failed reuse is
recorded and falls back to ordinary search. This is a reusable solution library,
not reinforcement learning or automatic generalisation from previous maps.

## Instructions for AI map authors

1. Read this document, `docs/ENEMIES.md` and the intended map/region before editing.
   State the skill the encounter tests and the intended recovery opportunity.
2. Run a baseline and keep its report/replay outside the authored map files.
   Compare with the same budgets, tail policy and stress settings after edits.
3. Make a focused map change. Run `level:lab solve` against that exact revision.
   Try the previous replay with `--reuse` to detect whether the old shortcut
   still bypasses the intended encounter.
4. If unresolved, inspect best progress and failure coordinates. Try a wider
   beam or larger budget, inspect legal alternative strategies, and use the
   older hinted solver when helpful. Do not remove hunters, open gates, skip
   traps or relax tests to manufacture a pass. Do not automatically nerf a map
   because a bounded solver failed.
5. If solved, inspect the saved commands and run timing stress. Investigate
   sensitivity near turns, gates and ability timing. Preserve interesting
   decisions; do not equate longer routes, more enemies or lower bot success
   with better difficulty.
6. Run relevant engine tests and existing playthrough regressions. A normal
   escape witness proves a legal win; it does **not** replace authored tests
   requiring specific reactions, rivalry encounters or other intended coverage.
7. Review readability and fun by playing the level. Look for observable clues,
   understandable failures, useful recovery and quick retries. One winning
   replay cannot establish that every reachable state avoids a softlock.
8. In the PR, report what changed, exact commands/settings, solved/unresolved
   status, stress results, and remaining limitations. Keep reports/replays as
   review artifacts. Leave merging and release approval to the maintainer.

Do not generate an entirely new level suite until this tool has been evaluated
on representative early, middle and late encounters. Later work can add a
visible-information player bot, deeper mechanism planning and calibrated human
playtest comparisons. Reinforcement learning can build on this harness later;
it is not required to run it.
