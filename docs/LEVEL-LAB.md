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
`replay.json` plus a `policy.json` containing the discovered decisions. A run
that only reuses raw inputs does not invent a policy for them. Use a separate output directory per map/revision. A failed search
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
| `--frames` | 1000000 | Total search simulation frames across all branches, checked every tick |
| `--no-tail` | off | Require no tail drops; normal legal tail recovery is otherwise allowed |
| `--no-planning` | off | Use the previous optimistic distance guidance for comparison |
| `--trace` | off | Save the best diagnostic input trace as `attempt.json`, including gate/reaction state |
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

## Feedback policies and latency testing

An exact replay repeats button durations. A feedback policy instead follows
the search's saved decisions and steers from Sally's current position toward
the saved waypoints. It uses full game state, makes no model calls, and does not
run a new search. Tools and waits are preserved. Existing gates, traps, hunters
and collision rules remain active. It cannot choose a different strategy when
a hunter blocks the saved route.

```sh
node scripts/level-lab.cjs policy-replay work/lab/quiet-vault/policy.json
node scripts/level-lab.cjs policy-stress work/lab/quiet-vault/policy.json --trials 8 --jitter 6 --seed 1 --frames 50000 --milliseconds 10000 --out work/policy-check
```

`policy-stress` first verifies an unperturbed baseline. Each seeded trial samples
a control interval from 1 to `jitter + 1` frames and an idle delay from 0 to
`jitter` frames before **each decision**. The controller checks position less
often, refining its steps near waypoints. It tests sampled steering and delayed
decisions, not the independent duration jitter used by `stress`. Results from
these two models are not interchangeable. Neither estimates human success.

Every winning policy execution is independently replayed as raw engine inputs.
The frame and wall-clock allowances are shared by baseline execution, every
trial, and all fresh verification. If either allowance runs out, incomplete
trials are reported separately with `budgetExhausted`, `attemptedTrials` and
`completedTrials`; the CLI returns 1. A failed baseline starts no variations and
also returns 1, including with zero requested trials. Report requested and
completed counts alongside wins. Default batch limits are 100,000 frames and
10 seconds; explicit `--frames` and `--milliseconds` override them.

`policy-replay` uses the normal lab frame/time defaults. Both commands reject
stale engine/map fingerprints and malformed plans before execution, preserve a
saved no-tail restriction, and can save details in `policy-result.json` using
`--out`. Failed or reused-only solves remove a previous `policy.json` from their
output directory, so an old plan cannot look like a newly discovered one.

## Working within a small compute budget

### Persistent experience and bounded practice

Run `npm run level:practice` for a CPU-only practice session capped at five
minutes and 300,000 total simulation frames, whichever runs out first. It uses
`work/experience/library.json` automatically. Defaults practice Kettle Works,
Fern Cloister and Frozen Plates, and reserve Great Boiler and
Eye of the Storm as held-out maps. Reports go to `work/practice`.

```sh
node scripts/level-practice.cjs --only fern-cloister,frozen-plates,great-boiler --holdout eye-of-the-storm --search-milliseconds 15000 --search-budget 600 --out work/hard-practice
node scripts/level-practice.cjs --only leafy-crossroads --holdout none --test-seed 2027 --out work/continued-practice
```

Memory stores one verified policy per exact engine/map fingerprint and tail
policy, along with training results and a bounded history of attempted changes.
Retrieval is automatic **inside practice**; ordinary `level:lab solve` remains
independent unless `--reuse` is explicitly provided. A retrieved policy is
evaluated again. If its baseline genuinely fails, practice rejects it and tries
independent discovery again. Changed fingerprints cause a cache miss. Corrupt
libraries fail explicitly rather than silently replacing stored work.

Practice refines only policies that already win. It can propose waits, sprint
changes, short detours near failed decisions, and tools supplied by the level.
Every proposal runs with the actual hunters, mechanisms, resources and collision
rules. It retains only fully evaluated, baseline-verified improvements under the
same training protocol: more successful trials, then shorter baseline duration
as a tie-break. It stops experimenting when all training trials pass. This is
per-level strategy search and experience reuse, **not trained transferable
skills**, and a perfect training sample is not a fairness certificate.

Finished experiments with matching policy, evaluator source fingerprint, seed,
jitter and trial count are skipped on later sessions, including candidates whose
baseline failed. Partial evaluations are not promoted or treated as finished.
The last 256 attempts are retained; old attempts may be retried after eviction.
Libraries allow up to 256 entries and 16 MiB. Saves use atomic replacement, and
a lock prevents two practice sessions from writing the same library. After a
forced process termination, check that no writer remains before removing a
leftover `.lock` file.

Training defaults to eight latency trials, jitter 6 and seed 1. Only after
selection is frozen does practice evaluate initial and final strategies with a
different test seed (1009 by default). These results never select the winner or
update memory. If the policy did not change, one evaluation is shared in the
before/after report, not counted as independent evidence twice. Held-out maps
use independent discovery without reading or writing their solution memory.
Vary the test seed between sessions to reduce repeated-test overfitting.

One session ledger counts **all actual simulated frames** in discovery, memory
verification, training trials, candidate checks and held-out tests, including
fresh raw-input verification. Shared limits may interrupt a would-be winning
search during verification; no replay or policy is accepted in that case.
Individual discovery attempts also have a 10-second/200-expansion limit by
default, configurable with `--search-milliseconds` and `--search-budget`. The
practice beam defaults to width 4 so a mechanism detour can retain a slot.
Wall time is checked at simulation boundaries and can overrun slightly during
initialization, cloning or output work. Reports expose incomplete evaluations,
budget use, cached retrieval, skipped attempts and unresolved discoveries.

If discovery cannot solve a hard map, practice records that outcome but has no
winning policy to refine. More runs do not automatically teach mechanism
planning or improve unseen-map discovery. Treat these cases as evidence of the
next planner limitation, never as proof that the maps are impossible. Ordinary
completed sessions exit 0 even with unresolved cases; exhausting the overall
session allowance exits 1 and invalid inputs exit 2.

Start with `node --test tests/level-lab.cjs`, then
`npm run level:smoke`. Reports go to `work/smoke`. The smoke benchmark checks three
early encounters at width 2, at most 200 expansions and 10 seconds of search
per case, without timing stress. These are development samples, not coverage
of late-game mechanics. A single candidate and reference/verification work can
extend past the search time limit.
Use `--frames` to cap simulated work reproducibly across computers; the cap
also interrupts long route segments and waits. Reference, reuse, verification
and stress are separate workloads outside this search cap. There is no claim
that one frame has a constant CPU cost across levels.

Use `level:benchmark -- --only quiet-vault,challenge:ghost-run --out work/focused`
to investigate specific mechanics. Unknown IDs fail before search starts.
Increase budgets only for cases whose reports justify further investigation;
run the full catalog before accepting a substantial solver or engine change.
Exact replay and `solve --reuse` are cheaper than rediscovering a known route.

Compare with `--no-macro` using the same levels, width, expansion and wall-clock
limits. Run comparisons sequentially on an otherwise idle machine when measuring
time; expansion counts also help explain differences. Benchmark summaries save
Node version, a solver source fingerprint, per-case engine/map fingerprints,
total expansions, generated candidates and search milliseconds. Per-level
`search.simulatedFrames` counts search simulation, including rejected tool
attempts; it excludes reference, fresh verification and stress runs. Wall-clock
totals include fresh winning verification, but exclude reference and stress.
Search status is separate from reference validity: a narrow beam can exhaust
its frontier even on a map with a verified reference.

This planner runs on CPU with no model calls, paid services, GPU or training.
It is a development instrument for finding legal strategies and diagnosing
failures; good level design still needs playtesting and encounter-specific tests.

## How the solver works

### Whole-catalog benchmark

Run `npm run level:benchmark -- --out work/benchmark` to evaluate every campaign
level, challenge and hidden route. For each, it checks the existing recording
when present, then runs independent discovery **without supplying that recording
as a hint**. It saves per-level reports/replays and a summary table tagged by
mechanics. Known replay failures fail the command; unresolved searches are
reported as solver coverage gaps, not impossible maps. Missing reference
recordings are reported separately.

Defaults are 600 expanded states, width 8, a 20-second search budget and three
timing variations per solved case. Options can increase those budgets. Split
work reproducibly with `--shard 1 --shards 8` through shard 8. On relevant pull
requests, the dedicated GitHub Actions workflow runs the solver tests and the
three-level smoke sample. Run that workflow manually to opt into the full eight
catalog shards; this avoids repeating 114 independent searches on every push.
Both modes upload their reports and replays. The summary distinguishes reference verification from new search
success. Compare equal settings across revisions; this is a measured baseline,
not a required 100% solver success threshold.

### Search implementation

Bounded beam search keeps several alternate real-engine states. It explores
walking, sprinting, short diagonal dodges, waits, directional pebble/tongue/
burrow/seed actions, camouflage and look-back. Controls use digital movement,
not coordinate teleportation or exact fractional positioning. Switching facing
uses real movement input. Tail shedding is an automatic engine response, not a
free solver action.

Goal-directed route segments also target the key, unlocked exit, required loot,
and reachable switches, plates and levers. Each segment follows at most six
waypoints computed from the current branch's actual walkable geometry. Every
frame uses the same digital movement and collision rules as local steps. A
blocked segment stops rather than skipping to its next waypoint, and reaching
an unlocked exit includes the real finishing hold. Local movements, waits and
tools remain available when a direct route is unsafe. These segments reduce
decision depth; they do not predict a safe route through hunters or authorize
crossing a closed gate. `--no-macro` disables them for controlled comparisons.

### Current geometry and trigger dependencies

The default guidance uses distances through the current branch's walkable map.
It does not prefer a nearby closed door over an existing longer route. A cached
flood fill is invalidated by changed geometry; the cache has at most 256 entries
per search. Keys, outstanding required treasure and the exit are separate goal
phases. Target-directed macro candidates are ordered toward the current subgoal.

If none of the current goal targets is reachable, guidance considers a reachable
human-operated switch, plate or lever whose gate would connect to a target.
The dependency estimate permits that gate's tiles only in a separate flood fill;
it never changes simulator geometry. Sealed, closing-only and heavy-only gates
are not offered as human-openable shortcuts. The engine must actually activate
the trigger, open the passage and survive any timer before a replay can win.

After the key, when at most ten untaken treasure items remain, the planner
uses a bounded subset search to estimate the shortest collection tour that
meets the required value and reaches the exit. It may skip nearby low-value
items when a different collection order gives a shorter complete route.
The beam score uses this remaining tour distance. Larger sets, insufficient
reachable treasure, or an unreachable exit fall back to the nearest reachable
objective and existing gate guidance. Treasure values and geometry come from
the current engine state; this estimate does not predict hunters, timers,
future reactions, or incidental pickups along the route. It does not learn
from recordings or change the game state.

Before wider search, two route-first proposals try the current objective with
sprinting and walking. Together they receive at most 10% of the frame limit
(capped at 6,000 frames), 40% of the time limit, and 24 decisions per proposal;
the ordinary expansion and depth limits still apply. Useful surviving prefixes
seed the beam alongside the starting state when width permits. This is a cheap
search proposal, not a saved solution or learned tactic. All its simulation
counts against the original allowance, and wins require fresh input replay.

This is a bounded one-gate dependency heuristic. It does not solve arbitrary
chains of gates, model hunter lures, plan cold recovery or predict every maze
reaction. When a dependency cannot be represented, it falls back to optimistic
guidance and retains local movements and abilities. `--no-planning` restores
the former distance/landmark guidance for comparison; it does not disable
goal-route macros.

Exit-directed route segments may finish a remaining actual route of at most
three waypoints once the exit is unlocked, then perform the engine's exit hold.
These extra frames count against the same work allowance. Saved feedback plans
record this terminal-completion choice, and fresh raw-input verification still
checks the whole run. Ordinary key/treasure route segments cannot trigger it.

With `--trace`, `attempt.json` contains the best candidate's actual commands,
selected objective, gate states and fired reactions. It is explicitly labeled
`diagnostic-attempt`, not a winning replay. Inspect it to distinguish a poor
goal estimate from a catch or insufficient search. Runs without trace remove
old attempt files, so stale diagnostics cannot look current.

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
