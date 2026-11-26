# Autopilot AI Expectations

| Metadata | Value |
| --- | --- |
| Spec ID | AIEXPECT |
| Family | Autopilot AIs |
| Audience | Game designer, AI designer, Implementer |
| Owns | How well the Basic Autopilot AI must play, the Required rating share it must decide by, and the Expectations run that checks both. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The [Basic Autopilot AI](basic-autopilot-ai.md) shows what the game asks of a player, so it must win as a sound player would, under the same rules of thumb the game teaches the player, and not by an edge a player cannot see. Three Expectations state this: it wins at least half of its Campaigns; it can still win while losing up to a fifth of its Missions, as a human player is expected to; and it judges a Mission site by the Required rating share the game promises the player.

The Expectations are checked by an Expectations run of the [Autopilot Lab](autopilot-lab.md). An Expectation that is not met shows a defect of the Basic Autopilot AI, or a balance issue of the game, to be fixed; it is never met by changing the share the game promises.

# Glossary

| Term | Definition |
| --- | --- |
| Expectation | One of the three things the Basic Autopilot AI must do, as [Expectations](#expectations) states them. |
| Promised rating share | The [Required rating share](basic-autopilot-ai.md#glossary) the game promises the player: a team whose [Combat rating](../mechanics/combat.md#combat-rating) is at least 110% of the [Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat) of a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s Enemies, plus 5 percentage points for each Lost [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) at Mission sites of the same [MissionSiteArchetype](../mechanics/missions.md#missionsitearchetype), is one a player may expect to win. |
| Expectations run | A run of the Autopilot Lab that plays, with the Basic Autopilot AI and its Game designer values, at least 40 [Campaigns](../foundation/core-concepts.md#campaign-and-session) of the [Game build default preset](../foundation/configuration.md#glossary) on different seeds, each until its [Campaign ending](../mechanics/domain-model.md#campaign-standing) or for 400 [Turns](../foundation/engine-contract.md#player-actions-and-turns). |

# Expectations

The Basic Autopilot AI meets every Expectation in the same Expectations runs, so none is bought at the cost of another.

1. **Wins half:** At least half of the Campaigns of an Expectations run end in Victory.
2. **Wins through losses:** At least one Campaign of an Expectations run with a [Forced loss share](autopilot-lab.md#glossary) of 20% ends in Victory, because a human player is expected to win a Campaign while losing up to a fifth of its Missions.
3. **Decides by the Promised rating share:** The Basic Autopilot AI meets Expectations 1 and 2 with a [Combat](../mechanics/domain-model.md#combat) margin of 110% and a Loss margin step of 5 percentage points, so that its Required rating share is the Promised rating share. It deploys a team whenever one reaches that share and waits for no stronger one, and it sizes its team by that share, never by a higher one, because a player who sees it win only with stronger teams cannot learn from it how to win.

Expectation 3 fixes the [Game designer values](basic-autopilot-ai.md#game-designer-values) of the Combat margin and the Loss margin step; every other [Tuning parameter](basic-autopilot-ai.md#glossary) is free to tune toward Expectations 1 and 2. A team stronger than the Promised rating share is still deployed when no smaller one can be formed, e.g. when the fewest Agents the Enemies ask for already rate higher.

# Checking the Expectations

The Game designer judges the Expectations from Expectations runs, which an agent makes only when the Game designer asks for one. Each Expectation is read from the run's summary: Expectation 1 from the Campaign endings, Expectation 2 from a second run with the Forced loss share, and Expectation 3 from the Basic Autopilot AI's Tuning parameters and the [Ready ratings](autopilot-lab.md#glossary) of the Mission sites it deployed to and left. A failed Expectation is reported with the [Campaign setup seed](../foundation/configuration.md#glossary) of Campaigns that show it, so that the Game designer can play them again.
