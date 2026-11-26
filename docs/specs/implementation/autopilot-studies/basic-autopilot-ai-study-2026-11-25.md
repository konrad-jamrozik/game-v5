# Basic Autopilot AI Study, 2026-11-25

| Metadata | Value |
| --- | --- |
| Spec ID | AISTUDY1 |
| Family | Autopilot Studies |
| Audience | Game designer, AI designer, Implementer |
| Owns | What the Autopilot Lab study of the Basic Autopilot AI of 2026-11-25 measured, the root causes of its defeats it found, the changes it tried and how each worked, and the balance issues it suggests. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

The Game designer asked how the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md) fares, why it loses, and whether it can be made to last longer or win. This study answered with [Balancing runs](../mandatory/campaign-tests.md#glossary) of the [Autopilot Lab](../../design/autopilot-ais/autopilot-lab.md), each comparing variants on the same Campaigns. It records one Implementation at one time, so every number below belongs to that Implementation and Game build and goes stale with the next change of either; its value is the mechanisms it found and the order in which they mattered.

The Basic Autopilot AI of the study won no Campaign. Four changes to its decisions and a Combat margin of 200% instead of 110% won 26 of 40. The margin carries most of that: the same changes at 110% won 3. Winning at 110% is what the [Autopilot AI Expectations](../../design/autopilot-ais/autopilot-ai-expectations.md) require, so the study leaves that work open.

# Glossary

| Term | Definition |
| --- | --- |
| Study baseline | The Basic Autopilot AI as the Implementation had it when the study began, with its Game designer values, against which every variant was measured. |
| Study variant | The Study baseline with one or more changes to its decisions or its [Tuning parameters](../../design/autopilot-ais/basic-autopilot-ai.md#glossary), played on the same [Campaigns](../../design/foundation/core-concepts.md#campaign-and-session) as the Study baseline. |

# Method

Every run played the Standard [Campaign configuration preset](../../design/foundation/game-data-records.md#glossary), 40 Campaigns of the seeds `lab-1` to `lab-40`, each for up to 400 [Turns](../../design/foundation/engine-contract.md#player-actions-and-turns) or until its [Campaign ending](../../design/mechanics/domain-model.md#campaign-standing), so that every variant met the same Campaigns. The Implementation was `game-v5-impl-web` at commit `ac352f1`; each Study variant was a temporary worktree of it with its changes. A run took 20 to 80 seconds on 31 threads. Each [Response Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is described by its [Ready rating](../../design/autopilot-ais/autopilot-lab.md#glossary) when it appeared.

The Campaigns of a run differ only in their seed, so a difference between two variants of a few Campaigns out of 40 is within chance; the study kept a change only when it moved its measure clearly, e.g. by several Victories or by tens of Turns at the median.

# How the Study baseline fares

The Study baseline lost every Campaign, in the middle of the Campaign, to the [Faction](../../design/mechanics/domain-model.md#factions) operations it could not answer.

| Question | Answer over the 40 Campaigns |
| --- | --- |
| Does any Campaign end in Victory? | No. |
| When does it lose? | At Turn 153 median, 140 to 165 between the 25th and 75th percentiles. |
| Why does it lose? | 22 by [Panic](../../design/mechanics/domain-model.md#campaign-standing) at the limit, 17 by an existential operation not stopped, 1 by money below zero. |
| How far does it get? | The logistics hub is Won in 73% of Campaigns, first at Turn 123 median; the regional stronghold in 8%; the HQ in 3%. |
| Where does its Panic come from? | About 78 of the roughly 100 points come from Response Mission sites of [Faction operation levels](../../design/mechanics/factions.md#glossary) 3 and 4 that expire unanswered. |

# Root causes

The root causes are listed from the most consequential, each with the evidence that showed it.

1. **The [Next rung](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) counted Response wins.** The Next rung of a [Faction](../../design/mechanics/domain-model.md#factions) read every Won [Mission](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) against it, Response Missions included. Winning a strong Response Mission site, e.g. one of level 5 whose Enemies rate 57,600, put the Faction past its regional stronghold and HQ, so the Lead that locates them was never investigated. Instead, the logistics hub was raided again and again, e.g. 25 times against Red Dawn and 21 against Exalt in seed `lab-6`, while the Lead to the stronghold stayed available. Counting only Initiative Missions raised Victories from 9 to 26 of 40.
2. **A team at 110% of the Enemies' [Combat rating](../../design/mechanics/combat.md#combatant-condition-in-a-combat) is not safe.** Lost Missions were met at a median Ready rating of 259% at Faction operation level 3 and 495% at level 2. A Lost Mission killed Agents, about 100 per Campaign by Turn 150, and the wounded kept about a fifth of the roster on [Recovery](../../design/mechanics/agents-spec.md#assignments) and away from the next Response Mission site. This is the open question of the Combat rating formula in [TODOs](../../governance/process/todos.md).
3. **The [Strike team](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) was sized to the last site seen.** The [Strike goal](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) followed the strongest Response Mission site of the last 20 Turns, so it met the goal until the next, stronger operation arrived, and Response Mission sites expire in one Turn. While the goal was met, money went to [Rate Upgrades](../../design/mechanics/economy-and-upgrades.md#glossary): about 49,000 per Campaign, against about 3,300 on Weapons and Armors and 4,500 on the [Transport cap](../../design/mechanics/economy-and-upgrades.md#glossary), and the Strike team wore no Armor before Turn 75.
4. **Existential operations went unanswered.** A Response Mission site whose loss is Defeat expired whenever no team reached the [Required rating share](../../design/autopilot-ais/basic-autopilot-ai.md#glossary), although letting it expire loses the Campaign for certain.

Two suspects proved not to be causes: the Agents needed per [Enemy](../../design/mechanics/domain-model.md#combat), since a looser count lost sooner, and the room for research, since research was limited by which [Leads](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) were available rather than by Agents.

# What was tried

Each row is one Study variant against the best variant before it, on the same 40 Campaigns; the kept rows add up to the final variant.

| Change | Result | Kept |
| --- | --- | --- |
| The [Threat](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) is the strongest kind of Response Mission site of the highest Faction operation level seen in the Threat window; a Rate Upgrade at most once a Turn | Defeat at Turn 156 (147–168) instead of 153 (140–165); Panic lower up to Turn 100; Rate Upgrade spending halved | Yes |
| One [Agent](../../design/mechanics/domain-model.md#agency-and-agents) per 6 Enemies instead of per 2.5 | Defeat at Turn 141 (134–148); fewer Response Mission sites Won | No |
| Combat margin 150% | 4 Victories; Defeat at Turn 176 (155–253) | No, 200% did better |
| Combat margin 200% | 7 Victories; Panic defeats from 26 to 11 | Yes |
| The Threat one Faction operation level above the highest seen, at 200% | 8 Victories, 14 Campaigns still played at Turn 400, 18 defeats instead of 31 | Yes |
| A Response Mission site whose loss is Defeat gets the strongest Deployable Agents within the free Transport cap when no team reaches the share | 9 Victories, 18 still played at Turn 400, 13 defeats | Yes |
| Three [Investigation](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) teams kept before [Contracting](../../design/mechanics/agents-spec.md#assignments) instead of one | 10 Victories, 15 defeats; research no faster | No |
| Research team size 6 instead of 3 | 10 Victories, 19 defeats; research started later | No |
| **The Next rung counts only Initiative Missions** | **26 Victories, 14 defeats, none still played at Turn 400; the ending at Turn 286 (153–315)** | **Yes** |
| A Response Mission site gets a team at 110% when none reaches 200% | 24 Victories; more Agents [Killed](../../design/mechanics/agents-spec.md#agent-statuses) and more existential defeats | No |
| Combat margin 300% or 150% with every kept change | 13 or 22 Victories | No |
| The Threat two Faction operation levels ahead | 19 Victories | No |
| A health recovery [Upgrade](../../design/mechanics/domain-model.md#agency-and-agents) above 10% of Agents on Recovery instead of 20% | 25 Victories | No |

# How well it worked

The kept changes made the Basic Autopilot AI win most Campaigns, but only together with the higher margin.

| Question                             | Study baseline | Final variant at 200% | Final variant at 110% |
| ------------------------------------ | -------------- | --------------------- | --------------------- |
| Victories of 40                      | 0              | 26                    | 3                     |
| Turn of the ending, median (p25–p75) | 153 (140–165)  | 286 (153–315)         | 154 (144–183)         |
| Defeats by Panic at the limit        | 22             | 8                     | 23                    |
| Defeats by an existential operation  | 17             | 6                     | 13                    |

Every defeat of the final variant at 200% but two came between Turns 126 and 160, when the Campaign falls behind as Faction operation levels 3 and 4 arrive; the other two came at Turns 204 and 224. A Victory came at Turn 250 to 330.

The kept changes are not in the Implementation: they were measured in a temporary worktree, and the [Combat](../../design/mechanics/domain-model.md#combat) margin of 200% is a Game designer value that the Autopilot AI Expectations rule out, since they require the 110% that the game promises the player.

# Balance issues

Some findings are about the game rather than the AI, because no change of the AI's decisions overcame them.

- **The Combat rating overrates Agent teams.** Teams sent at 110% of the Enemies' Combat rating lose often, so the share the game presents as safe is not; the Basic Autopilot AI won only with 200%. A player who trusts 110% loses as the Study baseline did. Either the Combat rating formula is recalibrated so that 110% wins nearly always, or the share the game promises is raised.
- **The middle of the Campaign decides it.** Nearly every defeat falls between Turns 126 and 160, when operations of levels 3 and 4 arrive faster than the [Agency](../../design/mechanics/domain-model.md#agency-and-agents)'s Agents rest and heal, with health recovering at 2% of max health a Turn. Faster health recovery, or Response Mission sites of those levels that stay Active for two Turns, are the levers to try first.
- **Late money has nothing worth buying.** Once Weapons and Armors are the best [Unlocked](../../design/mechanics/equipment.md#glossary), money goes to Rate Upgrades, about 37 acquisitions of each by the end of a won Campaign, which change little by then.
- **The game is winnable.** With the kept changes and the higher margin, two Campaigns in three were won, at Turn 250 to 330.

# Suggested next steps

The study points at three pieces of work, from the most consequential.

- Recalibrate the Combat rating, or the share the game promises, so that the Basic Autopilot AI meets the Autopilot AI Expectations at the promised share.
- Apply the four kept changes of decisions to the Basic Autopilot AI through the `apply` skill, since each helped at either margin.
- Study again once the Autopilot Lab gives every Campaign a [Campaign setup seed](../../design/foundation/configuration.md#glossary) and every Combat a [Combat setup seed](../../design/mechanics/combat.md#combat-rounds-and-results), so that each finding above can be replayed in the game.
