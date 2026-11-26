# Economy and Upgrades

| Metadata | Value |
| --- | --- |
| Spec ID | ECON |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | The Agency's money, funding, and Upgrade Acquisitions, Agency income and upkeep, the Agent cap, Transport cap, Training cap, and Contracting cap, the unlock_contracting Effect kind, Upgrade effects, the money change in each Action record, and the hireAgents, dismissAgents, purchaseUpgrade, and addMoney actions. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Money is how the [Agency](domain-model.md#agency-and-agents) turns what it earns today into strength tomorrow, and keeping the Agency running costs money every [Turn](../foundation/engine-contract.md#player-actions-and-turns). In every Advance turn the [Agency](domain-model.md#glossary) receives income, its funding plus what its Agents earn on [Contracting](agents-spec.md#assignments), and pays upkeep for every [Serving](agents-spec.md#agent-statuses) [Agent](domain-model.md#agency-and-agents), whether or not that Agent is working. Money may run negative, but funding, the recurring part of income, never falls below zero.

The player spends money in three ways: hiring grows the roster of Agents, Upgrades improve the Agency permanently, and [Items](equipment.md#glossary) equip its Agents. Four caps limit how many Agents the Agency employs, has [Deployed](agents-spec.md#assignments), has on [Training](agents-spec.md#assignments), and has on Contracting. The Contracting cap is never bought: a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) opens it and winning deeper [Initiative Missions](domain-model.md#leads-investigations-mission-sites-and-missions) raises it. Each Upgrade raises one of the other caps, one value of every Agent, or one rate at which every Agent trains or recovers, and it can be bought again at the same price.

Economy and Upgrades builds on [Domain Model](domain-model.md): Domain Model says that the Agency holds money and employs Agents, and Economy and Upgrades says how that money is earned and spent.

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Acquisitions | For one [Upgrade](domain-model.md#agency-and-agents), the number of times the [Agency](domain-model.md#agency-and-agents) has purchased it. |  |
| Increment | How much one acquisition of an Upgrade raises the value it improves: the Upgrade's `increment`. |  |
| Upgrade bonus | For one effect identifier, what every Upgrade with that effect adds to the starting value of the value they improve: the sum of each such Upgrade's Increment × its Acquisitions. |  |
| Cap Upgrade | An Upgrade that raises the [Agent cap](domain-model.md#agency-and-agents), the Transport cap, or the Training cap. | Cap effect |
| Max health Upgrade | An Upgrade that raises the [effective max health](agents-spec.md#combatant-attributes) of [Serving](agents-spec.md#agent-statuses) Agents. | Hit points upgrade |
| Rate Upgrade | An Upgrade that raises one rate every [Agent](domain-model.md#agency-and-agents) shares: the [training skill gain](agents-spec.md#growth), the [exhaustion](agents-spec.md#combatant-attributes) recovery, or the health recovery percentage. |  |
| Transport cap | The most Agents the Agency can have [Deployed](agents-spec.md#assignments) at the same time. |  |
| Training cap | The most Agents the Agency can have assigned to [Training](agents-spec.md#assignments) at the same time. |  |
| Contracting cap | The most Agents the Agency can have assigned to [Contracting](agents-spec.md#assignments) at the same time. | Contracting spots |
| Contracting unlocked | Whether Contracting is open to the Agency at all; until it is, the [Contracting cap](#contracting-cap) is 0. |  |

# Economy GDRs

The prices, rates, and starting caps of the Agency's economy are game data, held in [Game Data Records](../foundation/core-concepts.md#game-build-and-content) (GDRs) of three [Types](../foundation/core-concepts.md#data-modeling), so that they can be rebalanced without changing a rule.

## EconomyParameters

EconomyParameters bundles the values that hiring, upkeep, Agency income, and the caps read. Each is a whole number of at least 0, except `contracting_cap_per_initiative_level`, a non-empty list of them.

| Property | Meaning | Read by |
| --- | --- | --- |
| `hire_cost` | The money one hire costs. | [Hiring Agents](#hiring-agents) |
| `upkeep_per_agent` | The money each Serving Agent costs in one Advance turn. | [Upkeep](#upkeep) |
| `contracting_income_per_agent` | The money an Agent working on Contracting with [effective skill](agents-spec.md#combatant-attributes) 100 earns in one Advance turn. | [Agency income](#agency-income) |
| `contracting_skill_scale` | How strongly contracting income depends on effective skill: the points of effective skill above or below 100 that change an Agent's contribution by one whole `contracting_income_per_agent`. It is at least 100, so that no Agent's contribution is negative. | [Agency income](#agency-income) |
| `base_agent_cap` | The Agent cap before any Upgrade is acquired. | [Agency caps](#agency-caps) |
| `base_transport_cap` | The Transport cap before any Upgrade is acquired. | [Agency caps](#agency-caps) |
| `base_training_cap` | The Training cap before any Upgrade is acquired. | [Agency caps](#agency-caps) |
| `base_contracting_cap` | The Contracting cap once Contracting is unlocked, before any first win raises it. | [Contracting cap](#contracting-cap) |
| `contracting_cap_per_initiative_level` | The rises of the Contracting cap that [Contracting cap growth](leads-and-progression.md#contracting-cap-growth) counts at each level: one entry for the first, the second, and each later distinct [Faction](domain-model.md#factions) Won against there, in that order. | [Contracting cap](#contracting-cap) |

## Upgrade

Each Upgrade the Agency can buy is one [GDR](../foundation/core-concepts.md#game-build-and-content) of Type Upgrade.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Upgrade. | [Player-visible information](#player-visible-information) |
| `price` | The money one acquisition of the Upgrade costs: a whole number of at least 0. | [Purchasing Upgrades](#purchasing-upgrades) |
| `effect` | What the Upgrade improves: one of the effect identifiers. Several Upgrades may share one. | [Upgrade effects](#upgrade-effects) |
| `increment` | The Upgrade's Increment: a whole number of at least 0, or for a Rate Upgrade a [Decimal quantity](../foundation/numbers.md#glossary) of at least 0. | [Upgrade bonus](#upgrade-bonus) |

## AgencyArchetype

An AgencyArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of the Agency. It supplies no initial value and is display content only.

| Property | Meaning                         | Read by                                                   |
| -------- | ------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the Agency. | [Player-visible information](#player-visible-information) |

# Campaign configuration values

What the Agency starts with is chosen with the [Campaign configuration preset](../foundation/game-data-records.md#glossary), so that it can differ between [Campaigns](../foundation/core-concepts.md#campaign-and-session). Both of these [Campaign configuration](../foundation/campaign-state.md#glossary) values are [fixed after creation](../foundation/configuration.md#changing-campaign-configuration-during-play).

| Campaign configuration value | Preset property | Type and permitted values | How campaign creation uses it |
| --- | --- | --- | --- |
| Starting money | `starting_money` | A whole number of money of at least 0. | It becomes the Agency's initial money. |
| Starting funding | `starting_funding` | A whole number of money of at least 0. | It becomes the Agency's initial funding. |

# Agency State

The Agency's [State](../foundation/core-concepts.md#campaign-instances) holds what the Agency has built up over the Campaign: its money, its funding, the Upgrades it has bought, and whether Contracting is unlocked.

## Agency properties

The Agency is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is the AgencyArchetype and whose [Constants](../foundation/core-concepts.md#campaign-instances) are empty. Each property of its State is an [Authoritative value](../foundation/core-concepts.md#value-classification).

| Property | Value |
| --- | --- |
| Money | The money the Agency has: a whole number, which may be negative. |
| Funding | The recurring money the Agency receives in each Agency income step: a whole number of at least 0. |
| Acquisitions | For each Upgrade GDR the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, the number of times the Agency has purchased that Upgrade. |
| Contracting unlocked | Whether Contracting is unlocked: yes or no. Once yes, it stays yes for the rest of the Campaign. |
| Storage | The [Items](equipment.md#glossary) and [Ammo](combat.md#ammo) the Agency [holds in store](equipment.md#storage). |

In every [World state](../foundation/engine-contract.md#player-actions-and-turns) of a Campaign that has no [Campaign ending](domain-model.md#campaign-standing), money is at least 0: no [Player action](../foundation/engine-contract.md#player-actions-and-turns) takes money below 0, and an Advance turn that leaves it below 0 [ends the Campaign](panic-and-endings.md#defeat).

## Agency creation

The Agency of the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) has the money and the funding that its [Campaign configuration values](#campaign-configuration-values) give it, Acquisitions of 0 for every Upgrade, and Contracting unlocked no.

## Funding changes

Funding never falls below 0, however large a penalty is. A rule that changes funding names a whole amount, positive or negative, and the amounts that one [Turn advancement step](domain-model.md#turn-advancement-steps) applies are added up before the floor is applied, once:

```text
funding after = max( 0, funding before + sum of the amounts )
```

E.g., with funding 3, changes of +5 and −10 in the same step give `max(0, 3 + 5 − 10) = 0`, whichever is applied first, and not the 5 that a floor after each change could give.

## Money and funding Effect kinds

Game data changes the Agency's money and funding through two [Effect kinds](../foundation/effect-lists.md#glossary), so that every reward and every penalty changes them in the same way. Neither needs a supplied input.

| Effect kind | Value | What applying one Effect changes | Several in one Turn advancement step |
| --- | --- | --- | --- |
| `money` | A whole number of money: positive, zero, or negative. | The value is added to the Agency's money at once, and the result is never clamped. | The values add up. |
| `funding` | A whole number of money: positive, zero, or negative. | It is a [funding change](#funding-changes) of that amount. | They join the one sum of the funding changes of that step. |

## Contracting Effect kind

Game data opens Contracting to the Agency through one Effect kind, so that a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) can be the way in to it.

The Effect kind `unlock_contracting` has the value `true`. Applying one [Effect](../foundation/effect-lists.md#glossary) sets the Agency's Contracting unlocked to yes at once. It needs no supplied input, and several applied in one Turn advancement step have the result of one.

# Agency caps

The Agent cap, Transport cap, and Training cap each limit how many Agents the Agency has in one situation, and each grows only when the Agency buys a Cap Upgrade. Each is a [Derived value](../foundation/core-concepts.md#value-classification):

```text
cap = base + Upgrade bonus of the effect identifier that raises the cap
```

| Cap | base | Count it limits | Applied by |
| --- | --- | --- | --- |
| Agent cap | `base_agent_cap` | The Serving Agents, whatever their [Assignment](domain-model.md#agency-and-agents) and [Agent status](domain-model.md#agency-and-agents). | [Hiring Agents](#hiring-agents) |
| Transport cap | `base_transport_cap` | The Deployed Agents, over every [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) together. | [Deploying Agents](missions.md#deploying-agents) |
| Training cap | `base_training_cap` | The Serving Agents whose Assignment is Training, whatever their Agent status. | [Caps on assigning Agents](#caps-on-assigning-agents) |

## Contracting cap

The Agency finds work for its Agents only once it has learned where to look, and each new depth it reaches in its fight against the Factions opens more of it.

The Contracting cap is a Derived value, and no Upgrade raises it:

```text
Contracting cap = 0                          while Contracting unlocked is no
Contracting cap = base_contracting_cap + G   once Contracting unlocked is yes
```

Here G is the [Contracting cap growth](leads-and-progression.md#contracting-cap-growth). Contracting unlocked gates only the cap and not G: a win that comes while Contracting is locked counts from the moment Contracting is unlocked. E.g., with a `base_contracting_cap` of 3, a `contracting_cap_per_initiative_level` of [2, 1], and wins at level 1 against two Factions and at level 2 against one, G is `2 + 1 + 2 = 5`, so the Contracting cap is 0 until Contracting is unlocked and `3 + 5 = 8` from then on.

The Contracting cap limits the Serving Agents whose Assignment is Contracting, those [In transit](agents-spec.md#agent-statuses) included, and [assigning Agents](#caps-on-assigning-agents) applies it.

## Counts above a cap

A cap stops additions and never takes anything away. It limits only the actions that add to the count it limits. When a count exceeds its cap, e.g. after the [Player cheat action](../foundation/engine-contract.md#player-actions-and-turns) [`addAgents`](agents-spec.md#adding-agents), which ignores the Agent cap, no Agent is removed and no Assignment changes; further additions are rejected until the count is below the cap again.

# Agency income and upkeep

In every Advance turn the Agency earns money and pays for its Agents, and the difference decides whether it can afford to grow.

## Agency income

Work pays more for a skilled Agent and less for a worn-down one, but only gently, so that Contracting stays a dependable source of money.

In the Agency income step of an Advance turn, the Agency's money rises by its income, to which every [Working Agent](agents-spec.md#assignments) whose Assignment is Contracting contributes:

```text
contribution of one Agent = contracting_income_per_agent × (1 + (effective skill − 100) / contracting_skill_scale)
income                    = funding + round down( sum of the contributions )
```

Each contribution is [evaluated exactly](../foundation/numbers.md#exact-evaluation), and the sum is [rounded](../foundation/numbers.md#rounding) once; no contribution is rounded on its own.

E.g., with a `contracting_income_per_agent` of 40 and a `contracting_skill_scale` of 250, three Agents with effective skill 100, 85, and 130 contribute 40, `40 × (1 − 15 / 250) = 37.6`, and `40 × (1 + 30 / 250) = 44.8`, so with funding 20 the income is `20 + round down(122.4) = 142`.

## Upkeep

Every Serving Agent costs the same in each Advance turn, whether or not it is working.

In the Upkeep step of an Advance turn, the Agency's money falls by its upkeep:

```text
upkeep = upkeep_per_agent × number of Serving Agents
```

The number counts every Serving Agent, whatever its Assignment and Agent status. Upkeep is always paid in full, even when that makes money negative; e.g., money 15 and upkeep 40 leave money −25.

## Projected income and upkeep

The player sees what the next Advance turn will earn and cost before committing it. Projected income and projected upkeep are Derived values of the Agency: the income and the upkeep that the two formulas give for the [Current world state](../foundation/engine-contract.md#player-actions-and-turns). They leave out every other money change of that Advance turn, e.g. the [Consequences](missions.md#consequences) of a Mission site.

# Hiring Agents

The Player action `player.actions.hireAgents(count)` hires `count` Agents at once, a whole number of at least 1, so that filling the roster takes one Player action rather than one for each Agent.

It costs `count` times `hire_cost`. It requires that the Agency's money is at least that cost and that the number of Serving Agents plus `count` is at most the Agent cap; when either fails, it hires nobody, even when some of the Agents would fit. Each hired Agent is created by [Agent creation](agents-spec.md#agent-creation) and [brings rounds](equipment.md#equipment-of-new-and-departing-agents) into [Storage](equipment.md#glossary).

# Dismissing Agents

The Player action `player.actions.dismissAgents(agents)` ends the service of the Agents it lists, and with it their upkeep.

Every listed Agent must be Serving, [At assignment](agents-spec.md#agent-statuses), and on [Standby](agents-spec.md#assignments); e.g., an Agent on Contracting must first be recalled and arrive. When any listed Agent is not, the action dismisses nobody. Each listed Agent becomes [Dismissed](agents-spec.md#agent-status). No money is refunded or spent. The action may dismiss every Serving Agent: an Agency that employs no Agent is valid.

# Caps on assigning Agents

Training and Contracting each have room for a limited number of Agents, so an order that would overfill one is refused as a whole.

The Player action [`assignAgents`](agents-spec.md#assigning-agents) to Training or to Contracting is rejected when the count that the Training cap or the Contracting cap limits, plus the number of Agents the action lists, is greater than that cap. E.g., with a Training cap of 10 and 8 Agents on Training, an order for 2 more is accepted and an order for 3 more is rejected, although 2 of the 3 would fit.

# Upgrades

Upgrades let the Agency spend money on lasting improvements instead of on more Agents.

## Purchasing Upgrades

The Player action `player.actions.purchaseUpgrade(upgrade)` buys one acquisition of the Upgrade that `upgrade` identifies.

It requires that the Agency's money is at least the Upgrade's `price`. The Agency's money falls by the `price`, and its Acquisitions of the Upgrade rise by 1. The `price` is the same for every acquisition, and an Upgrade can be purchased any number of times, in one [Turn](../foundation/engine-contract.md#player-actions-and-turns) and in the whole Campaign.

## Upgrade effects

Every Upgrade improves exactly one value, which its `effect` names, and the effect identifier makes it an Upgrade of one of three kinds. No Upgrade raises an Agent's weapon damage or armor: its [equipment](equipment.md#equipping-agents) gives them.

| Effect identifier | Kind | The value one acquisition raises by the Upgrade's Increment |
| --- | --- | --- |
| `agent_cap` | Cap Upgrade | The Agent cap. |
| `transport_cap` | Cap Upgrade | The Transport cap. |
| `training_cap` | Cap Upgrade | The Training cap. |
| `agent_max_health` | Max health Upgrade | The [effective max health](agents-spec.md#effective-max-health-and-current-health) of every Serving Agent, and with it the Agent's [current health](agents-spec.md#combatant-attributes). |
| `training_skill_gain` | Rate Upgrade | The training skill gain. |
| `exhaustion_recovery` | Rate Upgrade | The exhaustion recovery. |
| `health_recovery` | Rate Upgrade | The health recovery percentage. |

An Upgrade changes no stored value except the Agency's Acquisitions. Every value it raises is a Derived value, so a purchase raises it at once, within the same Turn.

A Max health Upgrade raises its value for every Serving Agent alike, whatever its Assignment and Agent status, and for an Agent hired after the purchase as well. A Max health Upgrade raises current health by the same amount as effective max health, because an Agent stores its [health lost](agents-spec.md#combatant-attributes) and not its current health; e.g., an Agent with current health 20 of 30 has 21 of 31 after an acquisition with Increment 1.

### Upgrade bonus

Acquisitions add up: buying an Upgrade again, or buying another Upgrade with the same effect identifier, raises the same value further.

```text
upgraded value = starting value + Upgrade bonus
Upgrade bonus  = sum over every Upgrade with the effect identifier of ( Increment × Acquisitions )
```

The starting value is what the value is without any Upgrade: the base of a cap, an Agent's own [base health](agents-spec.md#combatant-attributes), and the GDR property of a rate.

E.g., with two Upgrades whose effect is `health_recovery`, one with Increment 0.2 and Acquisitions 3 and one with Increment 0.5 and Acquisitions 1, the Upgrade bonus is `0.2 × 3 + 0.5 × 1 = 1.1`, so a starting value of 2 gives a health recovery percentage of 3.1.

### Rate Upgrades

A Rate Upgrade makes every Agent train or recover faster, in steps that may be smaller than a whole point. Each rate starts from a GDR property, and the rule that reads the rate reads it in place of that property:

| Rate | Starting value | Read by |
| --- | --- | --- |
| Training skill gain | `training_skill_gain_per_turn` of AgentParameters | [Training growth](agents-spec.md#training-growth) |
| Exhaustion recovery | `exhaustion_recovery_per_turn` of RecoveryParameters | [Exhaustion recovery](agent-recovery.md#exhaustion-recovery) |
| Health recovery percentage | `health_recovery_pct_per_turn` of RecoveryParameters | [Health recovery](agent-recovery.md#health-recovery) |

A purchase changes no Agent value at once: the raised rate applies from the next Advance turn.

# Turn series of money

The Agency's money is charted over the whole Campaign, so it has two [Turn series](../foundation/world-history.md#glossary), and both are [Player-visible information](../foundation/engine-contract.md#api-surfaces).

| Turn series | Recorded moment of each Turn |
| --- | --- |
| Money at the start of turn | The [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) of the Turn. |
| Money at the end of turn | The [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of the Turn. |

## Money in the Action record

Each item of an [Action record](../foundation/world-history.md#action-record) also holds its money change, so that what the Player actions of a Turn spent can be read back after the Turn has ended.

The money change is the Agency's money right after the Player action minus its money right before it; e.g., −`count` times `hire_cost` for `hireAgents`, and 0 for `assignAgents`.

# Adding money

The [Player cheat action](../foundation/developer-access.md#player-cheat-actions) `developer.actions.addMoney(amount)` gives the Agency money that nothing in play earned, or takes money away.

It adds `amount`, a whole number other than 0, to the Agency's money; a negative `amount` removes money. It is rejected when it would leave the Agency's money below 0.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, of the Agency's money and funding: the funding that its Agency income step used, the number of Agents that contributed, the income, and the money after that step; the number of Serving Agents that its Upkeep step counted, the upkeep, and the money after that step; and the money and the funding in the Turn-end state and after the Advance turn.

The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds, of these, the funding the Agency income step used, the income, the upkeep, and the money and the funding after the Advance turn. It also holds the money and the funding in the Turn-start state and in the Turn-end state of that Turn, and the Agent cap, Transport cap, Training cap, and Contracting cap in its Turn-start state.

# Player-visible information

A player plans hires and purchases around what the Agency has and what it will earn, so nothing about its economy is hidden. The Agency's money, funding, Acquisitions, and Contracting unlocked, its four caps, its projected income and projected upkeep, the three rates that Rate Upgrades raise, every property of EconomyParameters, of each Upgrade, and of the AgencyArchetype, and the two Campaign configuration values are Player-visible information from the moment they exist.

# TODOs

- TODO (later): Upgrade prices that rise with [each acquisition](#purchasing-upgrades).
- TODO (later): A limit on the [Acquisitions of an Upgrade](#purchasing-upgrades).
- TODO (later): Selling an [Upgrade](#upgrades).
- TODO (later): Lowering a [cap](#agency-caps).
- TODO (later): A refund on [dismissal](#dismissing-agents).
- TODO (later): [Campaign configuration values](#campaign-configuration-values) of the Agency's economy that are adjustable during play.
