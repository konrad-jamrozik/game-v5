# TODOs

| Metadata    | Value                                                           |
| ----------- | --------------------------------------------------------------- |
| Spec ID     | TODOS                                                           |
| Family      | Process                                                         |
| Audience    | Game designer                                                   |
| Owns        | The work the Game designer has set aside for later.             |
| Conventions | [Specification Conventions](../conventions/spec-conventions.md) |

# Overview

Each topic section below is one [Set-aside task](../conventions/spec-conventions.md#set-aside-tasks): work the Game designer has set aside for later, with the T3 thread it came from.

# Settle the open decisions from slimming the specifications

- Added: 2026-11-24 22:21 PST
- T3 thread: Merging Spec and Code Repositories
- T3 thread ID: `82296efa-3238-472a-9f0e-8ceb41fe87d2`

Settle the open decisions left from slimming the specifications. The 14 decisions the code cannot settle are on the page "Fourteen open specification decisions", <https://claude.ai/artifact/PDobEiPRZ1Vvh3Gr6ix6Ru>, each with a recommendation. Three changes are recommended and not yet applied:

- Combat: state that an attacking Agent gains more combat experience from a hit than from a miss, and a defending Agent more from a miss than from a hit.
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

Generate the Screenshots again after the redesign that fits every screen to the Reference window of 1408 × 784. The Screenshots still show the layouts from before it, e.g. the wide Side panel. They were left alone because each was captured less than 72 hours earlier; the oldest pass that age on 2026-11-26 19:47 UTC and the newest on 2026-11-27 00:10 UTC. After that, run `npm run screens:capture` in `game-v5-impl-web`, which already captures in the Reference window, and commit the images that differ with their new capture times.

# Design a Faction suppression mechanic

- Added: 2026-11-27 07:21 PST
- T3 thread: Autopilot Full Team Share Impact
- T3 thread ID: `3261ab9d-3d64-43b7-a059-cdfe14153942`

Design and add a Faction suppression mechanic, so that a player who presses a Faction early is not overrun by its first existential operation. The Autopilot studies of 2026-11-27 found that every existential defeat came from a level 5 operation at about Turn 150, when no Agency the AI could field rated more than about 100% of its 99 Enemies.

The Game designer's design: winning an Initiative Mission against a Faction delays that Faction's next escalation of its Faction activity level, e.g. by 1 Turn for `raid_safehouse`, 3 for `raid_outpost`, 10 for `raid_logistics_hub`, and 20 for `raid_regional_stronghold`. Each further win of the same MissionSiteArchetype against the same Faction delays less, so that a player cannot suppress a Faction indefinitely.

Open questions for the specification:

- How the delay shrinks with each repeated win, e.g. halving, and whether a delay of less than one Turn rounds to none.
- Whether the delays are GDR values of each MissionSiteArchetype of kind `initiative`, as the Game designer's numbers suggest.
- What the player sees, e.g. a Faction's "escalates no sooner than Turn N", since a delay the player cannot see is not one they can plan around.
- How it interacts with the Basic Autopilot AI, which already farms Won rungs to lower Panic, and with Operation level spacing, which already keeps level 5 operations 20 Turns apart.

Finished when Factions specifies the mechanic with its GDR values, the Implementation follows it, and an Autopilot Lab run shows whether existential defeats near Turn 150 fall.
