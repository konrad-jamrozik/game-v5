# Economy and Upgrades

| Metadata | Value |
| --- | --- |
| Spec ID | ECON |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | The Agency's money, funding, and Upgrade Acquisitions, Agency income and upkeep, the Agent cap, Transport cap, and Training cap, Upgrade effects, the money change in each Action record, and the hireAgent, dismissAgents, purchaseUpgrade, and addMoney actions. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Money is how the [Agency](domain-model.md#agency-and-agents) turns what it earns today into strength tomorrow, and keeping the Agency running costs money every [Turn](../foundation/engine-contract.md#player-actions-and-turns). In every Advance turn the [Agency](domain-model.md#glossary) receives income, its funding plus what its Agents earn on [Contracting](agents-spec.md#assignments), and pays upkeep for every [Serving](agents-spec.md#agent-statuses) [Agent](domain-model.md#agency-and-agents), whether or not that Agent is working. Money may run negative, but funding, the recurring part of income, never falls below zero.

The player spends money in two ways: hiring grows the roster of Agents, and Upgrades improve the Agency permanently. Three caps limit what the Agency can do at once: the Agent cap on the Agents it employs, the Transport cap on the Agents it has [Deployed](agents-spec.md#assignments), and the Training cap on the Agents on [Training](agents-spec.md#assignments). Each Upgrade raises one cap, one value of every Agent, or one rate at which every Agent trains or recovers, and it can be bought again at the same price.

Economy and Upgrades builds on [Domain Model](domain-model.md): Domain Model says that the Agency holds money and employs Agents, and Economy and Upgrades says how that money is earned and spent.

# Glossary

These terms are specific to the [Agency](domain-model.md#agency-and-agents)'s economy. General terms are in the [Domain Model glossary](domain-model.md#glossary); terms about Agents are in the [Agents glossary](agents-spec.md#glossary).

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Acquisitions | For one [Upgrade](domain-model.md#agency-and-agents), the number of times the Agency has purchased it. |  |
| Increment | How much one acquisition of an Upgrade raises the value it improves: the Upgrade's `increment`. |  |
| Upgrade bonus | For one effect identifier, what every Upgrade with that effect adds to the starting value of the value they improve: the sum of each such Upgrade's Increment × its Acquisitions. |  |
| Cap Upgrade | An Upgrade that raises the [Agent cap](domain-model.md#agency-and-agents), the Transport cap, or the Training cap. | Cap effect |
| Weapon damage Upgrade | An Upgrade that raises the [effective weapon damage](agents-spec.md#combatant-attributes) of [Serving](agents-spec.md#agent-statuses) Agents. | Base weapon damage effect; Agent value effect |
| Max health Upgrade | An Upgrade that raises the [effective max health](agents-spec.md#combatant-attributes) of Serving Agents. | Hit points upgrade |
| Rate Upgrade | An Upgrade that raises one rate every [Agent](domain-model.md#agency-and-agents) shares: the [training skill gain](agents-spec.md#growth), the [exhaustion](agents-spec.md#combatant-attributes) recovery, or the health recovery percentage. |  |
| Transport cap | The most Agents the Agency can have [Deployed](agents-spec.md#assignments) at the same time. |  |
| Training cap | The most Agents the Agency can have assigned to [Training](agents-spec.md#assignments) at the same time. |  |

# Economy GDRs

The Game Data Records ([GDRs](../foundation/core-concepts.md#game-build-and-content)) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names. Every property table below is exhaustive apart from the `id` and `type` that every GDR has.

## EconomyParameters

EconomyParameters bundles the scalar values that hiring, upkeep, Agency income, and the caps read.

| Property | Meaning | Read by |
| --- | --- | --- |
| `hire_cost` | The money one hire costs. | [Hiring Agents](#hiring-agents) |
| `upkeep_per_agent` | The money each [Serving](agents-spec.md#agent-statuses) [Agent](domain-model.md#agency-and-agents) costs in one Advance turn. | [Upkeep](#upkeep) |
| `contracting_income_per_agent` | The money each Agent working on [Contracting](agents-spec.md#assignments) with [effective skill](agents-spec.md#combatant-attributes) 100 earns in one Advance turn. | [Agency income](#agency-income) |
| `base_agent_cap` | The Agent cap before any Upgrade is acquired. | [Agency caps](#agency-caps) |
| `base_transport_cap` | The Transport cap before any Upgrade is acquired. | [Agency caps](#agency-caps) |
| `base_training_cap` | The Training cap before any Upgrade is acquired. | [Agency caps](#agency-caps) |

## Upgrade

Each Upgrade is one GDR of [Type](../foundation/core-concepts.md#data-modeling) Upgrade. The Upgrade GDRs the Game build supplies are the Upgrades the Agency can buy.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Upgrade. | [Player-visible information](#player-visible-information) |
| `price` | The money one acquisition of the Upgrade costs. | [Purchasing Upgrades](#purchasing-upgrades) |
| `effect` | The identifier of what the Upgrade improves: one of the eight effect identifiers under [Upgrade effects](#upgrade-effects). | [Upgrade effects](#upgrade-effects) |
| `increment` | How much one acquisition of the Upgrade raises the value its `effect` improves. | [Upgrade effects](#upgrade-effects) |

An Upgrade's effect is decided only by its `effect` property, never by its `id` or `name`, under [References](../foundation/campaign-instances.md#references) in Campaign Instances. E.g., the Upgrade whose `id` is `agent_cap` raises the Agent cap because its `effect` is `agent_cap`, and would raise the Transport cap if its `effect` were `transport_cap`.

## AgencyArchetype

An AgencyArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of the Agency. It supplies no initial value; it is display content only.

| Property | Meaning                         | Read by                                                   |
| -------- | ------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the Agency. | [Player-visible information](#player-visible-information) |

## Economy GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for EconomyParameters, Upgrade, and AgencyArchetype GDRs. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **One AgencyArchetype:** The Game build supplies exactly one AgencyArchetype, so no rule selects among AgencyArchetypes.
2. **One EconomyParameters:** The Game build supplies exactly one EconomyParameters GDR.
3. **Exact properties:** Each GDR of the three Types has exactly the properties its table above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
4. **Parameters are valid:** Each of `hire_cost`, `upkeep_per_agent`, `contracting_income_per_agent`, `base_agent_cap`, `base_transport_cap`, and `base_training_cap` is a whole number of at least 0.
5. **Upgrades are valid:** Each Upgrade's `price` is a whole number of at least 0. Its `increment` is a whole number of at least 0, except that the `increment` of a Rate Upgrade is a number of at least 0 written with at most two digits after the decimal point, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers. Its `effect` is exactly one of `agent_cap`, `transport_cap`, `training_cap`, `agent_weapon_damage`, `agent_max_health`, `training_skill_gain`, `exhaustion_recovery`, and `health_recovery`.
6. **Names are present:** The `name` of the AgencyArchetype and of each Upgrade is non-empty text.

The Game build may supply any number of Upgrades, including none, and several Upgrades may share one `effect`; the rules under [Upgrade bonus](#upgrade-bonus) add up the contributions of every Upgrade with the same `effect`.

# Campaign configuration values

**Proposed rule:** The Agency's economy has exactly two [Campaign configuration](../foundation/campaign-state.md#glossary) values, Starting money and Starting funding, each stated as [What each Campaign configuration value must state](../foundation/configuration.md#what-each-campaign-configuration-value-must-state) in Configuration requires. Each [Campaign configuration preset](../foundation/configuration.md#glossary) supplies both, as the properties named below.

| Campaign configuration value | Preset property | Type and permitted values | Class | How campaign creation uses it |
| --- | --- | --- | --- | --- |
| Starting money | `starting_money` | A whole number of money of at least 0. | Fixed after creation | It becomes the Agency's initial money, under [Agency creation](#agency-creation). |
| Starting funding | `starting_funding` | A whole number of money of at least 0. | Fixed after creation | It becomes the Agency's initial funding, under [Agency creation](#agency-creation). |

Neither value is adjustable during play, so a Campaign configuration change naming either is invalid, under [Changing Campaign configuration during play](../foundation/configuration.md#changing-campaign-configuration-during-play). A [Preset edit](../foundation/configuration.md#glossary) setting either to a value outside its permitted values is rejected, under [Preset selection and edits](../foundation/configuration.md#preset-selection-and-edits). A [Campaign configuration preset](../foundation/game-data-records.md#glossary) whose own value of either is outside its permitted values makes the Game build defective, with the consequences stated under [Economy GDR validation](#economy-gdr-validation). Campaign configuration keeps both values for the whole Campaign as the values the Campaign started with; no rule reads them after campaign creation, and a later change of the Agency's money or funding never changes them.

# Agency State

The Agency's [State](../foundation/core-concepts.md#campaign-instances) holds what the Agency has built up over the Campaign: its money, its funding, and the Upgrades it has bought. These rules say what each value is, how the Agency starts, and how funding may change.

## Agency properties

**Proposed rule:** The Agency is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is the AgencyArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) are empty. Its State has exactly the following properties. This table is exhaustive.

| Property | Part | Value | Classification and range |
| --- | --- | --- | --- |
| Money | State | The money the Agency has. | [Authoritative value](../foundation/core-concepts.md#value-classification). A whole number of money with no lower and no upper bound: it may be negative, as [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) allows. |
| Funding | State | The recurring money the Agency receives in each Agency income step. | Authoritative value. A whole number of money of at least 0, under [Funding changes](#funding-changes). |
| Acquisitions | State | For each Upgrade GDR the Game build supplies, the number of times the Agency has purchased that Upgrade. | Authoritative value. One whole number of at least 0 per Upgrade, with no upper bound. |

The Agency also has these [Derived values](../foundation/core-concepts.md#value-classification), which are never stored: its Agent cap, Transport cap, and Training cap, under [Agency caps](#agency-caps); its projected income and projected upkeep, under [Projected income and upkeep](#projected-income-and-upkeep); and its roster, i.e. every Agent whose Agency reference identifies it, whatever that Agent's [Agent status](domain-model.md#agency-and-agents), under [Agent properties](agents-spec.md#agent-properties) in Agents. Its money has the two [Turn series](../foundation/world-history.md#turn-series) under [Turn series of money](#turn-series-of-money); funding and Acquisitions have none.

The following table is the exhaustive list of rules that change the Agency's State:

| Value | Raised by | Lowered by |
| --- | --- | --- |
| Money | [Agency income](#agency-income); [Adding money](#adding-money); the [Consequences](missions.md#consequences) of a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) | [Upkeep](#upkeep); [Hiring Agents](#hiring-agents); [Purchasing Upgrades](#purchasing-upgrades); [Adding money](#adding-money), with a negative `amount` |
| Funding | The [Consequences](missions.md#consequences) of a Mission site, through [Funding changes](#funding-changes) | The [Consequences](missions.md#consequences) of a Mission site, through [Funding changes](#funding-changes) |
| Acquisitions | [Purchasing Upgrades](#purchasing-upgrades) | No rule |

A rule of another specification that changes money adds a whole amount to it, positive or negative, and the result is never clamped.

**Proposed rule:** In every [World state](../foundation/engine-contract.md#player-actions-and-turns) of a Campaign that has no [Campaign ending](domain-model.md#campaign-standing), money is at least 0. No [Player action](../foundation/engine-contract.md#player-actions-and-turns) takes money below 0: `hireAgent` and `purchaseUpgrade` require money of at least their cost, and `addMoney` is rejected when it would, under [Adding money](#adding-money). An Advance turn that leaves money below 0 records a Campaign ending, under [Upkeep](#upkeep). Money is therefore negative only within an Advance turn and in a Campaign that has a Campaign ending.

The Agency is [retained](../foundation/world-history.md#glossary) for the whole Campaign and never removed.

## Agency creation

**Proposed rule:** The initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains exactly one Agency, as [Agency per Campaign](domain-model.md#agency-per-campaign) and [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model require, and no rule creates another Agency during play. It has a fresh [Instance ID](../foundation/campaign-instances.md#glossary) under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

| Value | Initial value | Source |
| --- | --- | --- |
| Archetype reference | The AgencyArchetype. | The one AgencyArchetype GDR, under [Economy GDR validation](#economy-gdr-validation). |
| Money | The Campaign configuration value Starting money. | Campaign configuration, under [Campaign configuration values](#campaign-configuration-values). |
| Funding | The Campaign configuration value Starting funding. | Campaign configuration, under [Campaign configuration values](#campaign-configuration-values). |
| Acquisitions | 0 for every Upgrade GDR the Game build supplies. | This rule. |

Campaign creation also records the Agency's initial money as the value of Money at the start of turn for the first [Turn](../foundation/engine-contract.md#player-actions-and-turns), under [Turn series of money](#turn-series-of-money).

## Funding changes

**Proposed rule:** Funding is never below 0. Every rule of another specification that changes funding does so through this rule: it names a whole amount, positive, zero, or negative, by which funding changes, and funding becomes:

```text
funding after = max(0, funding before + sum of the amounts)
```

Inputs: funding before is the Agency's funding as the [Step-start value](turn-advancement.md#glossary) of the [Turn advancement step](turn-advancement.md#glossary) that makes the changes, a whole number of at least 0; the amounts are every funding change that rules apply in that one [Turn advancement step](domain-model.md#turn-advancement-steps), each a whole number of money. When one Turn advancement step makes several funding changes, they are added up first and the floor is applied once, to the sum, so the result does not depend on the order in which an implementation applies them. No rounding occurs, because every term is a whole number. The result is a whole number of at least 0.

E.g., with funding 3, one change of −10 gives 0, and two changes of +5 and −10 in the same step give max(0, 3 + 5 − 10) = 0, whichever is applied first.

A funding change starts producing income in the first Agency income step that follows it. Only the [Consequences](missions.md#consequences) of Mission sites change funding, and they apply after the Agency income step of the same Advance turn under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), so a funding change first affects income in the next Advance turn.

## Money and funding Effect kinds

Game data changes the Agency's money and funding through two [Effect kinds](../foundation/effect-lists.md#glossary), so that every reward and every penalty changes them in the same way.

**Proposed rule:** The following table defines both Effect kinds, under [Effect kinds](../foundation/effect-lists.md#effect-kinds) in Effect Lists. It is exhaustive for the Effect kinds that change the Agency.

| Effect kind | Value | What applying one Effect changes | Several in one Turn advancement step |
| --- | --- | --- | --- |
| `money` | A whole number of money: positive, zero, or negative. | The value is added to the Agency's money at once, in the Turn advancement step that applies the [Effect](../foundation/effect-lists.md#glossary), and the result is never clamped, under [Agency properties](#agency-properties). | The values add up, and a sum does not depend on order. |
| `funding` | A whole number of money: positive, zero, or negative. | It is a funding change of that amount, under [Funding changes](#funding-changes). | They are summed with every other funding change of that step and floored at 0 once, under [Funding changes](#funding-changes). |

Neither Effect kind needs a supplied input, because a Campaign has exactly one Agency. An Effect whose value is 0 changes nothing.

# Agency caps

**Proposed rule:** The Agent cap, Transport cap, and Training cap are Derived values of the Agency, each computed by the same formula from a base value of EconomyParameters and the Upgrade bonus of the cap's effect identifier, under [Upgrade bonus](#upgrade-bonus):

```text
cap = base + Upgrade bonus of the cap's effect identifier
```

| Cap | base | Effect identifier | What it limits | Applied by |
| --- | --- | --- | --- | --- |
| Agent cap | `base_agent_cap` | `agent_cap` | The number of Serving Agents, whatever their [Assignment](domain-model.md#agency-and-agents) and Agent status. | [Hiring Agents](#hiring-agents) |
| Transport cap | `base_transport_cap` | `transport_cap` | The number of Deployed Agents, i.e. Serving Agents whose Assignment is Deployed, over every [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) together. | The `deployAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) under [Deploying Agents](missions.md#deploying-agents) |
| Training cap | `base_training_cap` | `training_cap` | The number of Serving Agents whose Assignment is Training, whatever their Agent status. | [Training cap on assigning Agents](#training-cap-on-assigning-agents) |

Inputs: base is a whole number of Agents of at least 0, and the Upgrade bonus is a whole number of Agents of at least 0. A cap with no Upgrade of its effect identifier equals its base. No rounding occurs, because every term is a whole number. Each cap is a whole number of at least its base, with no upper bound.

**Counting Training:** An Agent assigned to Training occupies a place under the Training cap from the moment of the assignment, and keeps it until its Assignment stops being Training. An Agent assigned away from Training, e.g. to [Standby](agents-spec.md#assignments), no longer counts from that moment.

**Counting Deployed Agents:** A Deployed Agent occupies a place under the Transport cap from the moment it is deployed until its Assignment stops being Deployed in the Mission resolution step, whether it returns or is [Killed](agents-spec.md#agent-statuses).

Each cap is computed from the current Acquisitions whenever a rule reads it, so a purchase raises it at once, under [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract.

## Counts above a cap

A cap limits only the actions that add to the count it limits: hiring for the Agent cap, assigning to Training for the Training cap, and deployment for the Transport cap. No rule lowers a cap, because Acquisitions only rise, but a count can exceed its cap through a [Player cheat action](../foundation/engine-contract.md#player-actions-and-turns), e.g. `addAgents` under [Adding Agents](agents-spec.md#adding-agents) in Agents, which ignores the Agent cap. When a count exceeds its cap, nothing is removed and no Agent's Assignment changes; only further additions are rejected until the count is below the cap again. A count above a cap is not an invariant violation.

# Agency income and upkeep

In every Advance turn the Agency earns money and pays for its Agents, and the difference decides whether it can afford to grow. These rules fix how much it earns, how much it pays, and how the player can see both in advance.

## Agency income

**Proposed rule:** In the Agency income step of every Advance turn, under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), the Agency's money rises by its income:

```text
contribution of one Agent = contracting_income_per_agent × (1 + (effective skill − 100) / 500)
income                    = funding + round down( sum of the contributions of the Agents in C )
money after               = money before + income
```

Inputs:

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| funding | The Agency's funding, as the [Step-start value](domain-model.md#turn-advancement-steps) of the Agency income step. | Money; a whole number of at least 0. |
| `contracting_income_per_agent` | The value of EconomyParameters. | Money per Agent; a whole number of at least 0. |
| C | The Working Agents whose Assignment is Contracting, i.e. the Agents on Contracting that are [At assignment](domain-model.md#agency-and-agents) as Step-start values of the Agency income step, under [Transit rule](agents-spec.md#transit-rule) in Agents. | A set of Agents, possibly empty. |
| effective skill | The Agent's [Effective skill](agents-spec.md#effective-skill), from its Step-start values of the Agency income step. | Skill points; a whole number of at least 0. |
| 100 and 500 | Constants of this rule, not GDR values: effective skill 100 earns exactly `contracting_income_per_agent`, and each 100 points of effective skill above or below it change the contribution by one fifth of it. | Skill points. |
| money before | The Agency's money as the Step-start value of the Agency income step. | Money; any whole number. |

Evaluation: each contribution is evaluated exactly, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, the contributions are summed exactly, and the sum is rounded once, with [Round down](../foundation/numbers.md#glossary); no contribution is rounded on its own. Because effective skill is at least 0, each contribution is at least `0.8 × contracting_income_per_agent`, so income is a whole number of at least 0 and money never falls in this step. E.g., an Agent with effective skill 100 contributes exactly 30 with the Bootstrap value 30; one with effective skill 83 contributes `30 × (1 − 17 / 500) = 28.98`; and one trained to effective skill 150 contributes `30 × (1 + 50 / 500) = 33`, so the three together give `round down(91.98) = 91`.

An Agent [In transit](domain-model.md#agency-and-agents) to Contracting is not in C, including one that arrives in the Previous turn transit arrivals step of the same Advance turn, because that step comes after the Agency income step. The Agency income step is the first step, so funding, C, and each effective skill equal their values in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns). After the income is added, every Agent in C gains [exhaustion](agents-spec.md#combatant-attributes) and may have a [Forced return](agents-spec.md#assignments), under [Work exhaustion](agents-spec.md#work-exhaustion) and [Forced return](agents-spec.md#forced-return) in Agents; the income already added is kept.

**Inherited behavior:** The contribution formula is the game-ts contracting income: work pays more for a skilled Agent and less for a worn-down one, but only gently, so that Contracting stays a dependable source of money.

## Upkeep

**Proposed rule:** In the Upkeep step of every Advance turn, under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), the Agency's money falls by its upkeep:

```text
upkeep      = upkeep_per_agent × S
money after = money before − upkeep
```

Inputs:

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| `upkeep_per_agent` | The value of EconomyParameters. | Money per Agent; a whole number of at least 0. |
| S | The number of Serving Agents, as Step-start values of the Upkeep step, whatever their Assignment and Agent status. | Agents; a whole number of at least 0. |
| money before | The Agency's money as the Step-start value of the Upkeep step, i.e. after the Agency income step. | Money; any whole number. |

S counts every Serving Agent, including one that is [In transit](domain-model.md#agency-and-agents), one that arrives in the Previous turn transit arrivals step of the same Advance turn, one on [Recovery](agents-spec.md#assignments), and one that is Deployed, under the upkeep exception of [Transit rule](agents-spec.md#transit-rule) in Agents. A Killed or [Dismissed](agents-spec.md#agent-statuses) Agent is not Serving and is not counted. An Agent Killed in the Mission resolution step of an Advance turn was Serving in the Upkeep step of that same Advance turn, so it is counted in that Advance turn and in no later one. No rounding occurs. Upkeep is a whole number of at least 0.

**Negative money:** Upkeep is always paid in full. Money may become negative, and it is neither clamped nor is the Advance turn rejected; e.g., money 15 and upkeep 40 give money −25. A later step of the same Advance turn may raise it again. Whether negative money ends the Campaign is decided only by the Ending check step, under [Defeat](panic-and-endings.md#defeat).

## Projected income and upkeep

**Proposed rule:** The Agency has two Derived values that state what the next Advance turn will add and charge if it is committed from the [Current world state](../foundation/engine-contract.md#player-actions-and-turns):

```text
projected income = funding + round down( sum of the contributions of the Agents in C' )
projected upkeep = upkeep_per_agent × S'
```

where funding is the Agency's funding in the Current world state; C' is the Agents that are Serving, whose Assignment is Contracting, and whose Agent status is At assignment in the Current world state; the contribution of each is computed as under [Agency income](#agency-income), from its effective skill in the Current world state; and S' is the number of Serving Agents in the Current world state. Each is a whole number of money of at least 0, evaluated and rounded as under [Agency income](#agency-income).

When Advance turn is committed from the Current world state, that state becomes the Turn-end state, so the Agency income step adds exactly the projected income and the Upkeep step charges exactly the projected upkeep. The Agency's money after the Upkeep step is therefore money + projected income − projected upkeep. Later steps of the same Advance turn, e.g. the consequences of a Mission site, may change money further; the projections do not include them. Both values follow every Player action at once; e.g., hiring raises projected upkeep by `upkeep_per_agent`, and assigning an Agent with effective skill 100 from Contracting to Standby lowers projected income by `contracting_income_per_agent`.

# Hiring Agents

**Proposed rule:** The Player action `player.actions.hireAgent()` hires one Agent. It has no parameters.

Preconditions: the action is rejected when either of the following holds:

1. The Agency's money is less than `hire_cost` of EconomyParameters.
2. The number of Serving Agents is equal to or greater than the Agent cap, under [Agency caps](#agency-caps).

Other preconditions apply to every Player action, e.g. that the Campaign has no [Campaign ending](domain-model.md#campaign-standing), under [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending) and [Engine Contract](../foundation/engine-contract.md).

Rejection: when a precondition fails, the action is rejected with an error that identifies at least one failed precondition; the exact error representation is the Implementer's choice. A rejected action changes nothing, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

State changes: when both preconditions hold, the action is one Player action that applies at once, within the same Turn:

- The Agency's money falls by `hire_cost`. Because money was at least `hire_cost`, money afterwards is at least 0.
- One Agent is created under [Agent creation](agents-spec.md#agent-creation) in Agents: Serving, on [Standby](agents-spec.md#assignments), In transit, with Turn hired equal to the current turn number.

Nothing else changes. The new Agent counts toward the Agent cap and in projected upkeep at once. It arrives in the next Advance turn, under [Transit rule](agents-spec.md#transit-rule), and is counted in that Advance turn's Upkeep step. Hiring several Agents takes one `hireAgent` action each.

# Dismissing Agents

**Proposed rule:** The Player action `player.actions.dismissAgents(agents)` dismisses Agents from the Agency.

| Parameter | Meaning                                                                   |
| --------- | ------------------------------------------------------------------------- |
| `agents`  | A list of Instance IDs, each meant to identify one Agent of the Campaign. |

Preconditions: the action is rejected, as a whole, when any of the following holds:

1. `agents` is empty.
2. `agents` contains the same Instance ID more than once.
3. An Instance ID in `agents` identifies no Agent of the Campaign.
4. An Agent in `agents` is not Serving.
5. An Agent in `agents` is In transit.
6. An Agent in `agents` has an Assignment other than Standby.

Together, conditions 4 to 6 mean that every listed Agent must be Serving, At assignment, and on Standby. An Agent on Contracting, Training, Recovery, or an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions), and a Deployed Agent, must first reach Standby, At assignment. Other preconditions apply to every Player action, under [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending) and [Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation is the Implementer's choice. A rejected action changes nothing, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same Turn, to every Agent in `agents`: the Agent becomes Dismissed under [Agent status](agents-spec.md#agent-status) in Agents, which removes its Assignment and Agent status and sets its Turn terminated to the current turn number, under [Service record](agents-spec.md#service-record). No money is refunded or spent, and nothing else changes. A Dismissed Agent stops counting toward the Agent cap and in projected upkeep at once, and is not counted in any later Upkeep step. It stays in the Agency's roster and is kept in the [Retired world state](../foundation/campaign-state.md#glossary) with its final values.

# Training cap on assigning Agents

**Proposed rule:** The Player action `assignAgents` under [Assigning Agents](agents-spec.md#assigning-agents) in Agents has one further precondition. When its `assignment` is `Training`, the action is also rejected, as a whole, when:

```text
T + number of Agents in agents  >  Training cap
```

where T is the number of Serving Agents whose Assignment is Training, whatever their Agent status, in the World state in which the action is requested, and the Training cap is under [Agency caps](#agency-caps). Every Agent in `agents` adds one, because the preconditions under [Assigning Agents](agents-spec.md#assigning-agents) already reject an Agent whose Assignment is Training. The action is accepted when the sum is equal to or less than the Training cap.

The rejection follows the rejection behavior of `assignAgents` in Agents: the whole action is rejected, no listed Agent changes, and the error identifies this precondition. This precondition does not apply when `assignment` is `Standby` or `Contracting`, even when T exceeds the Training cap, under [Counts above a cap](#counts-above-a-cap). Assigning an Agent away from Training frees its place at once, within the same Turn.

# Upgrades

Upgrades let the Agency spend money on lasting improvements instead of on more Agents. These rules say how an Upgrade is bought and what each acquisition does.

## Purchasing Upgrades

**Proposed rule:** The Player action `player.actions.purchaseUpgrade(upgrade)` buys one acquisition of one Upgrade.

| Parameter | Meaning                                                                |
| --------- | ---------------------------------------------------------------------- |
| `upgrade` | A GDR identifier, meant to identify one Upgrade GDR of the Game build. |

Preconditions: the action is rejected when either of the following holds:

1. `upgrade` identifies no Upgrade GDR of the Game build.
2. The Agency's money is less than the `price` of that Upgrade.

Other preconditions apply to every Player action, under [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending) and [Engine Contract](../foundation/engine-contract.md). No limit applies to how many times an Upgrade is purchased, in one Turn or in the whole Campaign.

Rejection: when a precondition fails, the action is rejected with an error that identifies at least one failed precondition; the exact error representation is the Implementer's choice. A rejected action changes nothing, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

State changes: when both preconditions hold, the action is one Player action that applies at once, within the same Turn:

- The Agency's money falls by the Upgrade's `price`. Because money was at least the price, money afterwards is at least 0.
- The Agency's Acquisitions of that Upgrade rise by 1.
- The Upgrade's effect applies, under [Upgrade effects](#upgrade-effects).

Nothing else changes. The price is the GDR's `price` for every acquisition; it does not rise with Acquisitions.

## Upgrade effects

**Proposed rule:** Every Upgrade has exactly one effect, named by its `effect` property. The eight effect identifiers below are exhaustive, and they make an Upgrade one of four kinds.

| Effect identifier | Kind | What one acquisition does |
| --- | --- | --- |
| `agent_cap` | Cap Upgrade | Raises the Agent cap by the Upgrade's Increment, under [Cap Upgrades](#cap-upgrades). |
| `transport_cap` | Cap Upgrade | Raises the Transport cap by the Upgrade's Increment, under [Cap Upgrades](#cap-upgrades). |
| `training_cap` | Cap Upgrade | Raises the Training cap by the Upgrade's Increment, under [Cap Upgrades](#cap-upgrades). |
| `agent_weapon_damage` | Weapon damage Upgrade | Raises the effective weapon damage of every Serving Agent by the Upgrade's Increment, under [Weapon damage Upgrade](#weapon-damage-upgrade). |
| `agent_max_health` | Max health Upgrade | Raises the effective max health and the [current health](agents-spec.md#combatant-attributes) of every Serving Agent by the Upgrade's Increment, under [Max health Upgrade](#max-health-upgrade). |
| `training_skill_gain` | Rate Upgrade | Raises the training skill gain by the Upgrade's Increment, under [Rate Upgrades](#rate-upgrades). |
| `exhaustion_recovery` | Rate Upgrade | Raises the exhaustion recovery by the Upgrade's Increment, under [Rate Upgrades](#rate-upgrades). |
| `health_recovery` | Rate Upgrade | Raises the health recovery percentage by the Upgrade's Increment, under [Rate Upgrades](#rate-upgrades). |

Acquisitions of every Upgrade stack by addition, without limit, and no effect depends on the order of purchases.

### Upgrade bonus

**Proposed rule:** Every value an Upgrade improves is computed by one formula, from the starting value that the value would have without any Upgrade and the Upgrade bonus of the effect identifier that improves it:

```text
upgraded value = starting value + Upgrade bonus
Upgrade bonus  = sum over every Upgrade U whose effect is the effect identifier of ( Increment of U × Acquisitions of U )
```

Inputs: each Acquisitions is a whole number of at least 0, each Increment is a whole number of at least 0 or, for a Rate Upgrade, a [Decimal quantity](../foundation/numbers.md#glossary) of at least 0, and the Acquisitions are those of the World state in which the value is read or set. The Upgrade bonus of an effect identifier that no Upgrade has is 0. No rounding occurs, because the product of a Decimal quantity and a whole number is a Decimal quantity, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers. The starting value and where the upgraded value applies are stated for each kind: [Agency caps](#agency-caps) for a Cap Upgrade, [Weapon damage Upgrade](#weapon-damage-upgrade) for a Weapon damage Upgrade, [Max health Upgrade](#max-health-upgrade) for a Max health Upgrade, and [Rate Upgrades](#rate-upgrades) for a Rate Upgrade.

### Cap Upgrades

A Cap Upgrade changes no stored value beyond the Acquisitions: the cap it raises is a Derived value under [Agency caps](#agency-caps), so it rises by the Increment at once, within the same Turn, and every Player action after the purchase sees the raised cap. A Cap Upgrade changes no Agent's Assignment.

### Weapon damage Upgrade

A Weapon damage Upgrade, i.e. an Upgrade whose `effect` is `agent_weapon_damage`, changes no stored value beyond the Acquisitions. The [effective weapon damage](agents-spec.md#combatant-attributes) of every Serving Agent is a Derived value, computed by [Upgrade bonus](#upgrade-bonus), under [Effective weapon damage](agents-spec.md#effective-weapon-damage) in Agents:

```text
effective weapon damage = base weapon damage + Upgrade bonus of agent_weapon_damage
```

Inputs: [base weapon damage](agents-spec.md#combatant-attributes) is the Agent's own, a whole number of at least 1, which no Upgrade changes, and is the starting value under [Upgrade bonus](#upgrade-bonus); the Upgrade bonus is that of the World state in which the value is read. The result is a whole number of at least the Agent's base weapon damage, so of at least 1.

The formula holds for every Serving Agent alike, whatever its Assignment and Agent status and whichever Turn it was created in; e.g., a Deployed Agent, an Agent In transit, an Agent on Recovery, and an Agent hired after the purchase all have it. It rises by the Increment at once, within the same Turn, so the first [Combat](domain-model.md#combat) fought after a purchase already uses the raised value. A [Terminated](agents-spec.md#agent-statuses) Agent is not affected: it keeps the Final weapon damage recorded when it became Terminated, under [Service record](agents-spec.md#service-record) in Agents. The effect changes no stored Agent value, no Weapon GDR, and no [Enemy](domain-model.md#combat).

### Max health Upgrade

A Max health Upgrade, i.e. an Upgrade whose `effect` is `agent_max_health`, changes no stored value beyond the Acquisitions. The [effective max health](agents-spec.md#combatant-attributes) of every Serving Agent is a Derived value, computed by [Upgrade bonus](#upgrade-bonus), under [Effective max health and current health](agents-spec.md#effective-max-health-and-current-health) in Agents:

```text
effective max health = base health + Upgrade bonus of agent_max_health
```

Inputs: [base health](agents-spec.md#combatant-attributes) is the Agent's own, a whole number of at least 1, which no Upgrade changes, and is the starting value under [Upgrade bonus](#upgrade-bonus); the Upgrade bonus is that of the World state in which the value is read. The result is a whole number of at least the Agent's base health, so of at least 1.

The formula holds for every Serving Agent alike, whatever its Assignment and Agent status and whichever Turn it was created in, and it rises by the Increment at once, within the same Turn. An Agent stores its [health lost](agents-spec.md#combatant-attributes), not its [current health](agents-spec.md#combatant-attributes), so its current health rises by the same Increment and its health lost is unchanged: an Agent at full current health stays at full current health, and an Agent on Recovery still has the same current health to regain. [Attribute ranges](agents-spec.md#attribute-ranges) therefore hold after every purchase. A Terminated Agent is not affected: it keeps the Final max health recorded when it became Terminated, under [Service record](agents-spec.md#service-record) in Agents.

A higher effective max health changes no effective skill of an Agent at full current health, because effective skill reads current health relative to effective max health, under [Effective skill](agents-spec.md#effective-skill); it lets an Agent take more harm in a [Combat](domain-model.md#combat), and it raises the current health the Agent regains in each Advance turn on Recovery when the rounding of [Health recovery](agent-recovery.md#health-recovery) allows. The effect changes no stored Agent value, no AgentArchetype, and no Enemy.

### Rate Upgrades

A Rate Upgrade changes no stored value beyond the Acquisitions. Each rate it raises is a Derived value, computed by [Upgrade bonus](#upgrade-bonus) from the GDR property that is its starting value, and the rule named below reads the rate in place of that property:

| Rate | Formula | Read by |
| --- | --- | --- |
| Training skill gain | `training_skill_gain_per_turn` + Upgrade bonus of `training_skill_gain` | [Training growth](agents-spec.md#training-growth) in Agents |
| Exhaustion recovery | `exhaustion_recovery_per_turn` + Upgrade bonus of `exhaustion_recovery` | [Exhaustion recovery](agent-recovery.md#exhaustion-recovery) |
| Health recovery percentage | `health_recovery_pct_per_turn` + Upgrade bonus of `health_recovery` | [Health recovery](agent-recovery.md#health-recovery) |

Inputs: `training_skill_gain_per_turn` is that of AgentParameters, and `exhaustion_recovery_per_turn` and `health_recovery_pct_per_turn` are those of RecoveryParameters. Each result is a Decimal quantity of at least its starting value, and the health recovery percentage is a [Percent value](../foundation/numbers.md#glossary). E.g., three Acquisitions of an Upgrade with Increment 0.2 raise a health recovery percentage of 2 to exactly 2.60. A Turn advancement step reads the Acquisitions of the Turn-end state of its Advance turn, because no Player action is made during an Advance turn. A purchase therefore takes effect in the next Advance turn, for every Agent the rule applies to, and changes no Agent value at once.

# Turn series of money

**Proposed rule:** The Agency's money has exactly the following two [Turn series](../foundation/world-history.md#glossary), under [Turn series](../foundation/world-history.md#turn-series) in History and Turn Report. Each records the Agency's money, a whole number of money that may be negative.

| Turn series | Recorded moment of each Turn |
| --- | --- |
| Money at the start of turn | The [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) of the Turn: the World state in which the Turn starts, before any action of it. |
| Money at the end of turn | The Turn-end state of the Turn: the World state in which the Advance turn that ends the Turn begins. |

The values are recorded as follows:

- **At campaign creation:** Money at the start of turn for the first Turn is recorded as the Agency's initial money.
- **At Turn close:** In the Turn close step of the Advance turn that ends Turn t, under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), two values are recorded. Money at the end of turn for Turn t is the Agency's money in the Turn-end state, i.e. before the Agency income step of that Advance turn, so it includes every Player action of Turn t, e.g. hiring and purchases. Money at the start of turn for Turn t + 1 is the Agency's money at the Turn close step, i.e. after every earlier step of that Advance turn, which is the money in the Turn-start state of Turn t + 1. The Turn close step records both values even when the Campaign received a [Campaign ending](domain-model.md#campaign-standing) in the Ending check step of the same Advance turn.

The current Turn has a recorded value of Money at the start of turn but none of Money at the end of turn, because its Turn-end state is not reached until its Advance turn is committed. Player actions during a Turn never change a value already recorded. Both Turn series are [Player-visible information](../foundation/engine-contract.md#api-surfaces). Funding, Acquisitions, and the caps have no Turn series.

## Money in the Action record

**Proposed rule:** Every item of an [Action record](../foundation/world-history.md#glossary), under [Action record](../foundation/world-history.md#action-record) in History and Turn Report, also holds its money change: the Agency's money right after its Player action minus the Agency's money right before it. It is a whole number, negative for money spent and positive for money added; e.g., −`hire_cost` for `hireAgent`, minus the Upgrade's `price` for `purchaseUpgrade`, `amount` for `addMoney`, and 0 for a Player action that changes no money, e.g. `assignAgents`. The money changes are Player-visible information, so the money a Turn's Player actions spent can be read back after the Turn has ended.

# Player cheat actions

A Player cheat action changes Campaign state in a way ordinary play does not allow. The Player cheat action for money gives the Agency money that nothing in play earned.

## Adding money

**Proposed rule:** The Player cheat action `developer.actions.addMoney(amount)` adds money to the Agency, or with a negative `amount` removes it. It follows every rule under [Player cheat actions](../foundation/developer-access.md#player-cheat-actions) in Developer Access, including that only the [Session controller](../foundation/engine-contract.md#principals-and-access) can call it, only with [Dev mode](../foundation/engine-contract.md#principals-and-access) enabled, and that each successful call is one Player action recorded as one [Timeline entry](../foundation/timeline.md#glossary).

| Parameter | Meaning                                                                                |
| --------- | -------------------------------------------------------------------------------------- |
| `amount`  | How much money to add: a whole number other than 0. A negative `amount` removes money. |

Validation: the operation is rejected, and changes nothing, when `amount` is not a whole number, when it is 0, or when the Agency's money plus `amount` is less than 0. The last rejection keeps money at least 0, under [Agency properties](#agency-properties), so `addMoney` cannot bring about the Money below zero condition of [Defeat](panic-and-endings.md#defeat); its error identifies that the result would be negative money. No upper limit applies.

Effect: `amount` is added to the Agency's money. Nothing else changes; e.g., funding, Acquisitions, and the values already recorded in the Turn series are unchanged.

# Turn report

**Proposed rule:** The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, of the Agency's money and funding:

- **Agency income step:** the funding it used, the number of Agents in C, the income it added, and the Agency's money after it, under [Agency income](#agency-income).
- **Upkeep step:** S, the upkeep it charged, and the Agency's money after it, under [Upkeep](#upkeep).
- **Funding:** the Agency's funding in the Turn-end state and after the Advance turn.
- **Money:** the Agency's money in the Turn-end state and after the Advance turn.

The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds, of these, the income, the upkeep, and the Agency's money and funding after the Advance turn, and holds the Agency's money and funding in the Turn-start state and in the Turn-end state of that Turn. All are Player-visible information, under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report.

# Player-visible information

**Proposed rule:** Every value below is Player-visible information under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), from the moment it exists, without a reveal condition. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| The Agency's Instance ID and its AgencyArchetype, including the AgencyArchetype's `name` | Yes |
| The Agency's money, including a negative amount | Yes |
| The Agency's funding | Yes |
| The Agency's Acquisitions of each Upgrade | Yes |
| The Agent cap, Transport cap, and Training cap, each with its current value | Yes |
| The training skill gain, exhaustion recovery, and health recovery percentage, each with its current value | Yes |
| The projected income and projected upkeep of the coming Advance turn | Yes |
| Money at the start of turn and Money at the end of turn, in full | Yes |
| The money change of every item of every Action record in a [History entry](../foundation/world-history.md#glossary) | Yes |
| Every property of EconomyParameters and of each Upgrade GDR | Yes |
| The Campaign configuration values Starting money and Starting funding | Yes |

**Unknown versus absent:** No value in the table above is hidden, so Player API never reports one as unknown. An Upgrade never purchased is reported with Acquisitions 0, not as absent. Money at the end of turn has no recorded value for the current Turn, which Player API reports as absent for that Turn. Because every value in the table above is Player-visible information, no rejection error of `hireAgent`, `dismissAgents`, `purchaseUpgrade`, or `addMoney` reveals anything hidden.

# Edge cases and failure behavior

- **Exact affordability:** Money exactly equal to `hire_cost` or to an Upgrade's `price` satisfies the precondition; the action succeeds and leaves money 0 ([Hiring Agents](#hiring-agents), [Purchasing Upgrades](#purchasing-upgrades)).
- **Insufficient money:** Money below the cost rejects `hireAgent` and `purchaseUpgrade`; nothing changes ([Hiring Agents](#hiring-agents), [Purchasing Upgrades](#purchasing-upgrades)).
- **Agent cap reached:** With exactly as many Serving Agents as the Agent cap, `hireAgent` is rejected even with enough money. Serving Agents In transit, on Recovery, or Deployed count; Killed and Dismissed Agents do not ([Hiring Agents](#hiring-agents), [Agency caps](#agency-caps)).
- **Training cap reached:** An order to Training that would exceed the cap is rejected as a whole, even when only one of its Agents does not fit ([Training cap on assigning Agents](#training-cap-on-assigning-agents)).
- **Count above a cap:** After a Player cheat action, e.g. `addAgents`, a count may exceed its cap; nothing is removed and only further additions are rejected ([Counts above a cap](#counts-above-a-cap)).
- **Zero funding:** With funding 0 and no Agent working on Contracting, income is 0 and the Agency income step leaves money unchanged. A funding change that would take funding below 0 leaves it at 0 ([Agency income](#agency-income), [Funding changes](#funding-changes)).
- **Several funding changes in one step:** They are added up before the floor is applied, so their order does not matter ([Funding changes](#funding-changes)).
- **Upkeep making money negative:** Upkeep is paid in full and money may become negative ([Upkeep](#upkeep)).
- **Agent Killed in the same Advance turn:** An Agent Killed in the Mission resolution step was counted in the Upkeep step before it, and is not counted in any later Advance turn ([Upkeep](#upkeep)).
- **Arriving Agents:** An Agent arriving at Contracting in the Previous turn transit arrivals step earns nothing in that Advance turn but is counted in Upkeep ([Agency income](#agency-income), [Upkeep](#upkeep)).
- **Tired or untrained Agents on Contracting:** An Agent with effective skill 0 still contributes four fifths of `contracting_income_per_agent`, and an Agent whose work brings it to `exhaustion_work_limit` keeps the income of that Advance turn ([Agency income](#agency-income)).
- **Dismissing an Agent that is not on Standby, At assignment:** Rejected as a whole; e.g., an Agent on Standby but In transit, an Agent on Contracting, and a Deployed Agent cannot be dismissed ([Dismissing Agents](#dismissing-agents)).
- **Dismissing every Agent:** Valid; an Agency with no Serving Agent pays no upkeep. Whether the Campaign ends is decided under [Defeat](panic-and-endings.md#defeat) ([Dismissing Agents](#dismissing-agents)).
- **Unknown Upgrade:** `purchaseUpgrade` with an identifier that names no Upgrade GDR, including one naming a GDR of another Type, is rejected ([Purchasing Upgrades](#purchasing-upgrades)).
- **Weapon damage of Agents who are not Serving:** A Killed or Dismissed Agent keeps its Final weapon damage when a Weapon damage Upgrade is purchased ([Weapon damage Upgrade](#weapon-damage-upgrade)). Likewise, a Killed or Dismissed Agent keeps its Final max health and its current health when a Max health Upgrade is purchased ([Max health Upgrade](#max-health-upgrade)).
- **Damaged Agent and a Max health Upgrade:** An Agent on Recovery with current health 20 of 30 has 21 of 31 after a purchase with Increment 1, and stays on Recovery; the purchase never ends Recovery and never puts an Agent below full current health ([Max health Upgrade](#max-health-upgrade)).
- **Rate Upgrade purchased during a Turn:** The raised rate applies from the next Advance turn and changes no Agent value at once ([Rate Upgrades](#rate-upgrades)).
- **Upgrade with increment 0 or price 0:** Valid GDRs; a purchase of the first raises Acquisitions but no value it improves, and a purchase of the second costs no money ([Economy GDR validation](#economy-gdr-validation)).
- **Large values:** Money, Acquisitions, caps, effective weapon damage, effective max health, and the rates a Rate Upgrade raises have no upper bound, and every computation is exact, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers.
- **Invalid GDRs:** A Game build with an unknown `effect`, a missing or extra property, a negative or fractional value, a second EconomyParameters or AgencyArchetype, or a preset `starting_money` below 0 is defective, and no Campaign is created from it ([Economy GDR validation](#economy-gdr-validation), [Campaign configuration values](#campaign-configuration-values)). A World state violating an invariant of the Agency, e.g. negative funding, is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a Campaign ending, `hireAgent`, `dismissAgents`, `purchaseUpgrade`, `addMoney`, and Advance turn are rejected, under [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending).

# TODOs

- TODO (later): Upgrade prices that rise with each acquisition, under [Purchasing Upgrades](#purchasing-upgrades).
- TODO (later): A limit on the Acquisitions of an Upgrade, under [Purchasing Upgrades](#purchasing-upgrades).
- TODO (later): Selling an Upgrade, under [Upgrades](#upgrades).
- TODO (later): Lowering a cap, under [Agency caps](#agency-caps).
- TODO (later): A refund on dismissal, under [Dismissing Agents](#dismissing-agents).
- TODO (later): Campaign configuration values of the Agency's economy that are adjustable during play, under [Campaign configuration values](#campaign-configuration-values).
