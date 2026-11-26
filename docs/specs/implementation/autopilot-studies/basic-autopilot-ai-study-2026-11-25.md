# Basic Autopilot AI Study, 2026-11-25

| Metadata | Value |
| --- | --- |
| Spec ID | AISTUDY1 |
| Family | Autopilot Studies |
| Audience | Game designer, AI designer, Implementer |
| Owns | What the Autopilot Lab study of the Basic Autopilot AI of 2026-11-25 measured, the root causes of its defeats it found, the changes it tried and how each worked, and the balance issues it suggests, with retreat and in a follow-up without it. |
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

# Follow-up without retreat

The Game designer asked for the study again with two rules fixed: Agents never retreat, and every team is deployed at the promised 110% plus the Loss margin step of 5% for each Lost Mission at a [Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of its MissionSiteArchetype. The Combat Rating Bench, which fights without retreat, had found that 110% wins far more often than the first study's Campaigns did.

## Method of the follow-up

Retreat was turned off by setting `retreat_below_agent_rating_fraction` of the CombatParameters to 0, authored as `0.0` because Value formatting then rejected a decimal property authored as `0`, only in two temporary worktrees of `game-v5-impl-web` at commit `ec8d48c`; the [Game build](../../design/foundation/core-concepts.md#game-build-and-content) kept its value. Every variant deployed at the Required rating share and never below it. Each variant played 40 Campaigns of up to 400 Turns on two sets of seeds, `lab-1` to `lab-40` and `two-1` to `two-40`, since a change that moved one set by 8 Victories moved the other by 2: between two sets, a difference of about 3 Victories in 40 is within chance. Every Campaign it names can be created again from its Campaign setup seed in its record, with the same retreat value.

## How it fared without retreat

Without retreat the Basic Autopilot AI of the Implementation still lost nearly every Campaign: no Victory of 40 on `lab`, at Turn 154 median (139–175), and 2 of 40 on `two`. Lost Combats at 110% to 150% of the Enemies' Combat rating fell from 29% with retreat to about 10%, so retreat explains most of the gap to the Combat Rating Bench, but a Lost Combat now killed more Agents.

The best variant won 17 of 40 on each set of seeds, 34 of 80, at Turn 307 median (285–330) and never before Turn 257. That is short of the half the [Autopilot AI Expectations](../../design/autopilot-ais/autopilot-ai-expectations.md) require. No Campaign it won lost or let expire more than 18% of its Missions, so no natural Campaign showed the Victory at a quarter of Missions lost that they also require; the [Forced loss share](../../design/autopilot-ais/autopilot-lab.md#glossary) of the [Autopilot Lab](../../design/autopilot-ais/autopilot-lab.md) is not built, so it was not measured directly.

| Question                            | Study baseline, no retreat | Best variant, no retreat |
| ----------------------------------- | -------------------------- | ------------------------ |
| Victories of 80                     | 2                          | 34                       |
| Defeats by an existential operation | 41                         | 37                       |
| Defeats by Panic at the limit       | 37                         | 9                        |
| The HQ raided, share of Campaigns   | 4%                         | 44%                      |

## Root causes without retreat

Without retreat, four mechanisms explained the defeats, from the most consequential.

1. **Existential operations outrate the Agency when they first come.** The first Response Mission site of Faction operation level 5 came at Turn 130 to 170, rated 44,000 to 58,000, and was Expired at the end of the Turn it was seen. Then the strongest Deployable Agents within a Transport cap of 56 rated a median of about 70% of it, from 40% to 100%, with about 95 Agents serving and 50 to 60 Deployable. Each such site that expired was a Defeat, and they caused about half of all defeats of every variant.
2. **The smallest [Winning team](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) went to sites whose loss is a Defeat.** Without retreat, such teams were wiped at 115% to 146%, e.g. in `lab-10` at Turn 146 and `lab-19` at Turn 175, each a Defeat.
3. **Small Agencies stalled on the planned net income.** The Basic Autopilot AI hires, and buys an [Agent cap](../../design/mechanics/domain-model.md#agency-and-agents) Upgrade, only while the planned net income of the larger roster, i.e. Funding plus the Contracting income of the [Contractors](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) it would have, less every Agent's upkeep, stays at least the Least net income of 25. With few Contracting places, an extra Agent brings upkeep and no income, so the roster stopped at the Agent cap of 20, e.g. in `two-21` from Turn 20 to 130, and the Campaign ended at the Panic limit. Mission rewards never enter the planned net income, yet late [Initiative Mission sites](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) pay 4,000 to 100,000, so the same Agencies that stalled early held 5,000 to 60,000 unspent late.
4. **The Combat rating of a MissionSiteArchetype's Enemies was wrong.** [Player API](../../design/foundation/engine-contract.md#api-surfaces) reported it as the sum of the Enemies' skill, the Combat rating as it was before the [rating factor](../../design/mechanics/combat.md#combatant-condition-in-a-combat) and the [team size factor](../../design/mechanics/combat.md#combatant-condition-in-a-combat), e.g. 12,160 for the HQ assault, whose Mission sites rate 57,623. The Next rung, the Threat by level, and whether the Strike team can win a Lead's Mission site all read it, so the Strike goal was a fifth to a half of the Enemies it stands for, and Leads were investigated whose Mission sites outrated the Strike team. Rating it correctly made the Basic Autopilot AI worse, 8 Victories instead of 17 on each set, because a Strike goal at its true size is short for most of the Campaign and takes the money and Agents that hiring and Contracting need.

## What was tried without retreat

Each row is a variant against the best variant before it; the numbers are Victories of 40 on `lab`, and on `two` where measured.

| Change | lab | two | Kept |
| --- | --- | --- | --- |
| The three kept changes of decisions of the first study, without the 200% margin | 0 to 9 | — | Yes |
| A Strike goal at 150% or 200% of the Threat, deploying still at 110% | 9 or 4 | — | No |
| A site whose loss is a Defeat gets the strongest Deployable Agents that fit, once a Winning team exists | 11 | — | Yes |
| Each Response team grows, strongest first, to 150% of the Enemies when it can, else the Winning team goes | 19 | 8 to 10 | Yes |
| The same to 200% | 16 | — | No |
| The same growth for Initiative teams | 19 | 10 | No |
| Least net income −150, so that Agencies grow on Mission rewards | 17 | 17 | Yes |
| Least net income −300 | — | 16 | No |
| Up to four Rate Upgrades a Turn | 17 | 17 | No |
| The true Combat rating of a MissionSiteArchetype's Enemies | 8 | 8 | No |
| The true Combat rating with a Strike goal at 25% or 50% of the Threat | — | 15 or 14 | No |

The kept changes are not in the Implementation: the Game designer asked to see the conclusions before any is applied.

## Balance issues without retreat

These findings are about the game rather than the AI, and the Game designer has already acted on two of them.

- **Large Combats are costly even when Won.** At 110% to 150%, teams of 21 or more Agents lost 10% of their Combats and about 12.5 Agents in each, Won or not; teams of 4 to 8 lost 7% and 1.3 Agents. A won Campaign Killed 100 to 500 Agents. The Combat Rating Bench at 20 to 50 Agents a side would show whether the team size factor overrates large sides.
- **Existential operations come before an Agency can answer them,** as root cause 1 shows. Since this follow-up the Game designer has given those sites 3 Turns before they expire, made the [Faction activity levels](../../design/mechanics/factions.md#glossary) last 20 to 30 Turns instead of 15 to 30, and made the HQ assault easier.
- **Contracting places are too few for a growing roster.** At 4 places plus 4 for the first Initiative win at each level, an Agency beyond about 20 Agents earns less than its upkeep before Mission rewards. Since this follow-up the Game designer has added places for winning a level against a second and a third Faction.

## How to improve the Basic Autopilot AI next

These are the next changes to try, from the most consequential; none has been measured yet.

- **Size the Strike team again.** The Strike goal only worked because the rating it read was too small. Once that rating is correct, a goal at the true Threat must not starve hiring and Contracting, e.g. a Strike goal that grows with the Agency's income rather than jumping to the next Faction operation level, or one aimed at the Next rung while the Threat is met by mustering Contractors.
- **Farm Initiative Mission sites for money.** The Basic Autopilot AI investigates again a Lead whose Mission it has Won only when no Next rung remains or Panic is at least 30%, and one Lead that creates a Mission site at a time, so it Won each kind of Initiative Mission site about 3 times a Campaign. Raiding the strongest Initiative Mission site it can win whenever Agents are idle, e.g. an outpost for 4,000, would pay for growth that the planned net income now refuses, and the expected income from such raids should then count in the planned net income instead of a negative Least net income.
- **Win more Factions at each level,** now that a second and a third Faction Won at a level raise the [Contracting cap](../../design/mechanics/economy-and-upgrades.md#glossary).
- **Buy the [Training cap](../../design/mechanics/economy-and-upgrades.md#glossary) at most once a Turn,** like Rate Upgrades: it was bought four or five times in one Turn in about half of the Campaigns.
- **Keep the three changes that helped:** the strongest team for a site whose loss is a Defeat, Response teams grown to 150% when they can be, and the three kept changes of the first study.

# Second follow-up on the new balance

On 2026-11-26 the Game designer asked for the Strike goal to be redesigned around the true Combat rating of a MissionSiteArchetype's Enemies and for farming for money to be tried, measured on the balance changed since the follow-up.

## Method of the second follow-up

The Implementation was `game-v5-impl-web` at commit `dccd50c`, with retreat on at a `retreat_below_agent_rating_fraction` of 0.4 and a `retreat_at_enemy_to_agent_rating` of 0.9, existential Response Mission sites that stay Active for 3 Turns, Faction activity levels of 20 to 30 Turns, an easier HQ assault, Contracting places for a second and a third Faction Won at a level, and the true Combat rating of a MissionSiteArchetype's Enemies. Every variant deployed at the Required rating share or above. Each played 40 Campaigns of up to 400 Turns on both sets of seeds, `lab` and `two`. A comparison of two variants took up to 3.5 minutes, beyond the two-minute [Run time limit](../../design/autopilot-ais/autopilot-lab.md#glossary), because Campaigns now last past Turn 300; the [Autopilot Lab](../../design/autopilot-ais/autopilot-lab.md) does not yet stop at that limit.

## How it fared on the new balance

The kept changes of both studies, with the Least net income back at 25, met the first of the [Autopilot AI Expectations](../../design/autopilot-ais/autopilot-ai-expectations.md): they won 65 of 80 Campaigns, where the Basic Autopilot AI of the Implementation won 5. A Victory came at Turn 320 median (300–340), never before Turn 273, and the HQ was raided in 73% to 93% of Campaigns, against 5% to 8%. No Campaign won lost or let expire more than 22% of its Missions, so the Victory at a quarter of Missions lost was again not shown. With retreat on, teams of 21 or more Agents at 110% to 150% lost 28% of their Combats.

## What was tried on the new balance

Each row is a variant against the kept changes on both sets of seeds, in Victories of 80.

| Change | Victories | Kept |
| --- | --- | --- |
| The kept changes of both studies | 65, against 5 for the Implementation | Yes |
| A Strike goal at 50% of the Threat | 52 | No |
| The Threat at the highest Faction operation level seen, not one above | 33 | No |
| Farming whenever no Next rung qualifies, Farming Panic 0% | 65 | No |
| A second Lead that creates a Mission site at a time, farms only | 11 of 40 on `lab`, against 29 | No |
| Least net income 25 instead of −150 | 65 | Yes, the Game designer value stays |

The Strike goal needed no redesign. With the Contracting places and the longer existential Response Mission sites, a Strike goal at the Combat margin of the true Threat one Faction operation level ahead is what wins, and both smaller goals lost. Farming alongside the climb delayed it: the logistics hub was raided 21 times a Campaign and the regional stronghold first won at Turn 291 instead of 186, while the Contracting places now pay for the growth that farming was meant to fund.

The kept changes were applied to the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md): the Next rung counts only Initiative Missions, the Threat looks one Faction operation level ahead, at most one Rate Upgrade a Turn, the strongest team for a Response Mission site whose loss is a Defeat, and the Full team share of 150% for other Response Mission sites.
