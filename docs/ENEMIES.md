# Enemies and traps

Every hunter has one job that changes the route Sally takes, rather than just being
dodged. Wherever an attack commits, it aims where Sally is heading, so walking
straight on is rarely enough: change direction, break line of sight, or hide.

## Hunters

| Hunter | Job | What it does | How to beat it |
| --- | --- | --- | --- |
| Snake | Chaser | Patrols, spots Sally, then chases, searches and gives up. Brushing the back half of a resting snake (paused, coiled or watching) wakes it; a moving tail slides away. | Break sight at a corner, use leaves, or throw a pebble. Never step on a still snake's tail. |
| King cobra | Striker and hunter | Waits coiled on its post, swaying to watch. On sight it rears (a short warning line), strikes along where Sally is heading, then chases faster than any snake. When it loses her it glides home and coils again. | Sidestep the moment it rears, then break its sight at once. Never pass in front of its post. |
| Beetle | Battering ram | Locks a lane toward where Sally is heading (shown as a striped lane), then charges up to three tiles past its aim. A charge flattens leaf cover and smashes cracked walls open for everyone. It is dazed for a moment after hitting a wall. | Step out of the lane; never stand at the end of a long corridor. Lure it into a cracked wall to open a shortcut. |
| Scorpion | Living trap | Guards a ring around itself (always shown). Its tail rises and falls on a rhythm; with the tail up, anything entering the ring is stung where it is heading. Noise keeps the tail up. A buried scorpion shows only a sand mound until Sally is close. | Cross the ring while the tail is down and change direction if it strikes. Leaves inside the ring still hide Sally. |
| Toad | Sniper | Fires its tongue down any clear straight line toward Sally, up to five tiles. | Break its line of sight behind pillars, walls or leaves. |
| Spider | Builder | Leaves lasting tripwire webs on its rounds (up to five). Touching one slows Sally and sends the spider rushing. Up close it spits a sticky shot. | Watch the floor, step around webs, or move through them only when the spider is far away. |
| Cricket | Alarm | Harmless itself. When it sees or hears Sally it chirps, and every hunter in earshot heads for the spot. | Stay quiet and out of its sight, or let it chirp somewhere useless. |
| Moth | Lantern | Its glow lights Sally up: leaves stop hiding her and every hunter sees further. It swoops on glowing footprints. | Keep out of its light; time crossings while it drifts away. |
| Mimic | Greed trap | Looks like a treasure chest, with a slow breath and an occasional blink. When Sally reaches for it, it snaps toward where she is heading. | Learn the tell, or throw a pebble to make it snap first. |
| Millipede | Lurker | Freezes while watched and follows when Sally looks away, a little slower than she walks. | Keep it in view while you back off. |
| Owl | Searchlight | Turns between look-outs with a long narrow beam, glares, then swoops; the swoop bends toward Sally. | Hide in leaves or behind cover before it lands. |
| Hawk | Sky | A shadow follows Sally and dives on a timer. | Shelter under an awning, in leaves, or blend in with camouflage. |
| Gecko | Thief | Steals the last treasure Sally picked up and runs for its burrow. | Catch it before it gets there. |
| Angler | Bait | Hides under dark water and dangles a glowing lure that looks like a glow bug. Step close, or reach for it with the tongue, and it lunges at that spot, then sinks for a few seconds before the lure lights again. A pebble landing by the lure springs it too. | Learn the slow bob and the faint line. Walk around the lure, or spring it from afar and pass while it sinks. |
| Flytrap | Rooted biter | Stands on its stem with its reach always marked. Anything that comes within reach, or a pebble landing there, makes it snap where Sally is heading; then it chews for a couple of seconds and is harmless. | Feed it a pebble and pass while it chews, or keep out of its ring. |
| Hermit crab | Lane guard | Sits in its shell like any other on the beach. When Sally comes close in plain sight it peeks out, then scuttles sideways along its lane to cut her off and pinch. It never leaves its lane. A pebble landing by it sends it back into its shell for a few seconds. | Cross its lane at a sprint, while it is tucked in, or hidden; or toss a pebble first. |
| Ants | Moving wall | A column marches a fixed loop and catches anything it walks over. | Cross in the gaps between groups. |

## Traps

Levels opt into each trap through their level data.

| Trap | Level data | Behaviour |
| --- | --- | --- |
| One-use bridge | `once: true` on a bridge gate | Rises from its plate once; when it closes it is gone for good. |
| Crumbling bridge | `crumble: true` on a bridge gate | Holds for one crossing, then falls away behind Sally. |
| Crumbling floor | `c` in a text map, or `crumble: [[x, y]]` | Cracks under Sally and collapses into a gap once she leaves it. There is no way back. |
| Rolling log | `logs: [{from, to, period, offset, speed}]` | Rumbles as a warning, then sweeps a straight lane. It flattens Sally and knocks hunters down. |
| Tangle vine | `T` in a text map | Holds Sally still for about a second and a half. If a hunter sees her while she is held, she is caught (a spare tail tears her free instead). Then the vine withers for a few seconds and regrows. |
| Crack | `S` in a text map | A narrow split in a wall. Sally slips through; no hunter can follow or see into it, so it ends a chase. |
| Heavy plate | `heavy: true` on a timed gate | Ignores Sally. Only a big hunter's weight (a beetle on its rounds) presses it, opening the gate for its duration. Wait for the beetle, then sneak through. |
| Thorns | `thorns: [{tiles, period, up, offset}]` | Tremble, then rise on a rhythm. They only catch Sally while raised. |

## Text maps

Rebuilt routes are drawn as text, one character per tile:

```
# wall   . floor   L leaf cover   N noisy gravel   B cracked wall   M mud   ~ water
_ gap    c crumbling floor   T tangle vine   S crack   @ start   K key   X exit   1-5 treasure of that value
```

Guards, gates and traps keep their own lists, with coordinates matching the map.
`scripts/route-solver.cjs solve <levelId> "<hints>"` records a winning run for
`tests/fixtures/escape-playthroughs.json`. Its hints are waypoints such as `g12,4`,
tools such as `burrow`, and waits such as `w2`.
