# TODOs

| Metadata    | Value                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| Spec ID     | TODOS                                                                       |
| Family      | Process                                                                     |
| Audience    | Game designer                                                               |
| Owns        | The work the Game designer has set aside for later, and how it is recorded. |
| Conventions | [Specification Conventions](../conventions/spec-conventions.md)             |

# Overview

Work often surfaces in a T3 thread that is about something else, e.g. a question the Game designer wants to think over, or a step that has to wait a few days. A Set-aside task records such work here, completely enough that an agent or the Game designer can pick it up later without the thread's context, and names the thread where the context lives.

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Set-aside task | One piece of work the [Game designer](../conventions/spec-conventions.md#participants) has set aside for later, recorded in this document until it is done. Unlike a TODO of a [specification](../conventions/spec-conventions.md#specifications), it need not be missing content of any one specification. | Work item; backlog item |

# Recording a Set-aside task

A Set-aside task is added when the Game designer sets work aside, and removed in the change that does it, or when the Game designer drops it; Git history is the record. A task is never marked done.

- **Heading:** each Set-aside task is a top-level section of its own, after this section, whose heading names the work as an instruction, e.g. "Review the CR Sweep Bench".
- **Opening bullets:** the section opens with three bullets, in this order: `Added:` followed by when the task was added, as `YYYY-MM-DD hh:mm PST`, in Pacific time on a 24-hour clock, e.g. `Added: 2026-11-24 22:19 PST`; `T3 thread:` followed by the name of the thread where the work was set aside; and `T3 thread ID:` followed by its ID in backticks.
- **Body:** after the three bullets, the section says what to do and what a finished task looks like, completely enough to act on without reading the thread, e.g. which questions are open and which recommendations are not yet applied.

The linter checks the heading and the three bullets. A Set-aside task needs no links to the terms it mentions, and its words count toward no word budget, because tasks come and go.

# Review the CR Sweep Bench

- Added: 2026-11-24 22:19 PST
- T3 thread: Combat Rating Formula Calibration
- T3 thread ID: `6664326e-82ae-4710-b1a5-24a101803ff6`

Review the CR Sweep Bench, described in `tools/cr-sweep-bench/README.md`: read how its yardstick and its experiments work, run it with `npm run sweep:bench`, and try formulas in it, to understand what it shows about a Combat rating formula. It was built, and its first readings were discussed, in the thread. Two questions from that thread are still open: whether the safe ratio may depend on the size of the fight, and whether to build a formula from the measured curves.

# Settle the open decisions from slimming the specifications

- Added: 2026-11-24 22:21 PST
- T3 thread: Merging Spec and Code Repositories
- T3 thread ID: `82296efa-3238-472a-9f0e-8ceb41fe87d2`

Settle the open decisions left from slimming the specifications. The 14 decisions the code cannot settle are on the page "Fourteen open specification decisions", <https://claude.ai/artifact/PDobEiPRZ1Vvh3Gr6ix6Ru>, each with a recommendation. Four changes are recommended and not yet applied:

- Combat: state that an attacking Agent gains more combat experience from a hit than from a miss, and a defending Agent more from a miss than from a hit.
- Basic Autopilot AI: drop the sentence that developer tooling can build the Basic Autopilot AI with other Tuning parameter values.
- GDRs: say that each Faction operation level is served by at least three MissionSiteArchetypes of kind response, rather than exactly three.
- GDRs: rename the heading "GDR catalog" to "Content intent".

# Settle what the Compendium View shows for Equipment

- Added: 2026-11-24 22:21 PST
- T3 thread: Merging Spec and Code Repositories
- T3 thread ID: `82296efa-3238-472a-9f0e-8ceb41fe87d2`

The Compendium View's specification describes an Ammo data sheet and the "Ammo" and "Price" rows of Weapons and the "Price" row of Armors, which the game does not draw. Either the game draws them or the specification drops them.

# Generate the Screenshots again after the Reference window redesign

- Added: 2026-11-24 22:24 PST
- T3 thread: Fit Game UI to 1408x784 Screens
- T3 thread ID: `42b665aa-ff94-40b0-8819-89662f41cb0b`

Generate the Screenshots again after the redesign that fits every screen to the Reference window of 1408 × 784. The Screenshots still show the layouts from before it, e.g. the wide Side panel, and the Armory View's shows the navigation tabs that the thread later removed. They were left alone because each was captured less than 72 hours earlier; the oldest pass that age on 2026-11-26 19:47 UTC and the newest, the Armory View's, on 2026-11-27 10:21 UTC. After that, run `npm run screens:capture` in `game-v5-impl-web`, which already captures in the Reference window, and commit the images that differ with their new capture times.
