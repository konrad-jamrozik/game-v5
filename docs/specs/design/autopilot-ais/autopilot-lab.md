# Autopilot Lab

| Metadata | Value |
| --- | --- |
| Spec ID | ALAB |
| Family | Autopilot AIs |
| Audience | Game designer, AI designer, Implementer |
| Owns | What the Autopilot Lab plays and reports, its time limit, and what it records so that every Campaign and Combat it reports can be played again in the game. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Autopilot Lab lets an agent study how an [Autopilot AI](../foundation/engine-contract.md#principals-and-access) plays and how balanced the game is, quickly enough that the Game designer waits for the answer rather than for the run. It plays many Campaigns with the [Basic Autopilot AI](basic-autopilot-ai.md) at once, compares variants on the same Campaigns, and returns one compact summary.

Two rules shape it. A run never takes more than three minutes, so the agent sizes each experiment to fit and the Game designer never waits long. And every Campaign and every Combat it reports carries a setup seed, so that the Game designer can play any finding again in the game, e.g. a Mission lost at Turn 53 with a team at 150% of the Enemies' Combat rating, either by playing that Campaign for 53 Turns with the same Autopilot AI or by fighting that one Combat in the [Combat simulator](../ui/screens/combat-simulator.md).

# Glossary

| Term | Definition |
| --- | --- |
| Autopilot Lab | The command-line tool `npm run autopilot:lab` of the specification repository, `tools/autopilot-lab/`, that makes Lab runs. |
| Lab run | One invocation of the Autopilot Lab: one or more Lab variants, each playing the same [Campaigns](../foundation/core-concepts.md#campaign-and-session), and the summary of them. |
| Lab variant | What plays the Campaigns of a Lab run: an Implementation clone, the [Autopilot AI](../foundation/engine-contract.md#principals-and-access) it offers, and the [Tuning parameters](basic-autopilot-ai.md#glossary) that differ from that Autopilot AI's Game designer values. |
| Ready rating | Of a [Response Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) when it appears: the [Combat rating](../mechanics/combat.md#combat-rating) of the strongest [Deployable Agents](../mechanics/missions.md#glossary) within the free [Transport cap](../mechanics/economy-and-upgrades.md#glossary), as a share of the [Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat) of its Enemies. |
| Run time limit | The most wall-clock time a Lab run may take: three minutes from its start. |

# What a Lab run plays

Every Lab variant of a Lab run plays the same Campaigns, so that a difference between variants comes from the variants and not from chance. A Lab run is given the number of Campaigns, the last [Turn](../foundation/engine-contract.md#player-actions-and-turns), the seeds, the [Campaign configuration preset](../foundation/game-data-records.md#glossary) and [Preset edits](../foundation/configuration.md#glossary), and its Lab variants; each Campaign of it is the one its [Campaign setup seed](../foundation/configuration.md#glossary) creates. Each Turn of a Campaign is played with [Autopilot engaged](../foundation/autopilot.md) by the Lab variant's Autopilot AI, as a player would engage it, and the Lab reads the Campaign only through [Player API](../foundation/engine-contract.md#api-surfaces).

# Run time limit

A Lab run stops at its Run time limit, whatever it was asked to play, because the Game designer waits for each run:

1. At the Run time limit, the Lab stops every Campaign still being played and starts no other.
2. It returns the summary of the Campaigns that reached their [Campaign ending](../mechanics/domain-model.md#campaign-standing) or their last Turn before then, and says how many it stopped and how many it never started.
3. The agent sizes each Lab run to end within the Run time limit, from the time per Campaign that the Lab reports, e.g. fewer Campaigns or fewer Turns for a variant whose Campaigns last longer, and runs a larger experiment as several Lab runs. A comparison of two Lab variants plays 20 Campaigns each.

# What a Lab run reports

The summary answers the questions of a study at a glance, with one column for each Lab variant:

- how the Campaigns ended, and when, and for the Campaigns that end in Victory the share of their [Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that Expired or whose [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is Lost, among those that Expired or whose Mission is Won or Lost;
- values over time, e.g. Panic, money, Agents, and the Strike team against its Strike goal, as the median and the 25th to 75th percentiles over the Campaigns still being played;
- for each MissionSiteArchetype, the Missions Won and Lost and the [Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) Expired, and when the first was Won;
- where [Panic](../mechanics/domain-model.md#campaign-standing) came from, by [Faction operation level](../mechanics/factions.md#glossary);
- what the money was spent on;
- for every Response Mission site when it appeared, its Ready rating and its outcome;
- the Campaigns that show a pattern of an Autopilot AI defect, e.g. the same Upgrade bought many times in one Turn, each with its Campaign setup seed;
- every error, with the Campaign setup seed of the Campaign that raised it.

Each Campaign also has a record of its own, with its Campaign setup seed, its values at the start of every Turn, and every [Combat](../mechanics/domain-model.md#combat) its Missions fought, each with its Turn, its Mission site, the Ready rating of the team, its [Combat outcome](../mechanics/combat.md#combat-rounds-and-results), and its [Combat setup seed](../mechanics/combat.md#combat-rounds-and-results). A finding quoted from a Lab run names the Campaign setup seed, and for a Combat also the Combat setup seed, so that the Game designer can reproduce it.

# Reproducing a finding

A Campaign of a Lab run is reproduced in the game by creating a Campaign from its Campaign setup seed and playing it with [Autopilot engaged](../foundation/engine-contract.md#autopilot) with the same Implementation and the same Autopilot AI and Tuning parameters, one Turn advancement at a time or all at once: it plays exactly as in the Lab run, because [the same Player actions give the same Campaign](../foundation/determinism-and-randomness.md#determinism). A Combat of it is reproduced either by playing the Campaign up to that Combat's Turn, or by entering its Combat setup seed in the [Combat simulator](../ui/screens/combat-simulator.md#glossary), which fights the same Combat, [Combatant](../mechanics/domain-model.md#combat) for Combatant and attack for attack.
