# Economy and Upgrades

| Metadata    | Value                                                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | ECON                                                                                                                                                                                                                       |
| Family      | Mechanics                                                                                                                                                                                                                  |
| Status      | Draft                                                                                                                                                                                                                      |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                                                                |
| Owns        | The Agency's money, funding, and Upgrade acquisitions, Agency income and upkeep, the Agent cap, Transport cap, and Training cap, Upgrade effects, and the hireAgent, dismissAgents, purchaseUpgrade, and addMoney actions. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                                                                             |

# Overview

This document defines where the Agency's money comes from and where it goes: what the
[Agency](domain-model.md#glossary) has, how the Agency is created, the Agency income and Upkeep rules applied during
Advance turn, the Agent cap, Transport cap, and Training cap, what each Upgrade does, the Player actions `hireAgent`,
`dismissAgents`, and `purchaseUpgrade`, the cheat operation `addMoney`, the two Turn series of money, the two Campaign
configuration values it owns, which of these values are Player-visible information, and the validation rules for the
Game Data Records (GDRs) it owns.

It refines Domain Model's Agency and Weapons and upgrades contracts, i.e.
[Campaign and Agency](domain-model.md#campaign-and-agency) and [Weapons and upgrades](domain-model.md#weapons-and-upgrades),
with the Agency's properties, its creation, its resource flows, the caps, and the Upgrade effects. It refines Agents
with two details about subjects that Agents owns: the Training cap precondition of the `assignAgents` Player action
under [Assigning Agents](agents-spec.md#assigning-agents), and how the weapon damage Upgrade effect changes the one
value listed under [Modifiable values](agents-spec.md#modifiable-values), including the initial weapon damage under
[Agent creation](agents-spec.md#agent-creation). It uses Agents to count Agents by lifecycle state, Current assignment,
and Task phase, and to create the Agent that hiring adds. It uses Configuration for the rules every Campaign
configuration value follows, and [Numbers](../foundation/numbers.md) for whole-number arithmetic. Among the
Mechanics specifications, this document depends only on Domain Model and Agents.

It does not own, e.g.:

- The money and funding that a Mission site's consequences add or remove, and the `deployAgents` Player action that
  the Transport cap constrains: [Missions](missions.md) owns both. Missions changes funding only through
  [Funding changes](#funding-changes) and applies the Transport cap as [Agency caps](#agency-caps) defines it.
- Whether negative money ends the Campaign: [Panic and Endings](panic-and-endings.md) owns the Campaign ending
  predicates and the rejection of every Player action after a Campaign ending. This document states only that money may
  be negative.
- The order of the Turn advancement steps: [Turn Advancement](turn-advancement.md) owns it.

These are ownership pointers; this document relies on none of them.

The following features are out of scope and are not specified here: the Upgrades raising training skill gain,
exhaustion recovery, health recovery, and maximum health; contracting income that depends on an Agent's skill; prices
that rise with each acquisition; a limit on the acquisitions of an Upgrade; selling an Upgrade or lowering a cap; a
refund on dismissal; and Campaign configuration values of this document that are adjustable during play. This list is
exhaustive. With them out
of scope, an Upgrade's price never changes, a cap never falls, and both Campaign configuration values of this document
are fixed after creation.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Configuration](../foundation/configuration.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Developer Access](../foundation/developer-access.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Agents](./agents-spec.md)
- Refines [Domain Model](domain-model.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Missions](./missions.md)
- Used by [Panic and Endings](./panic-and-endings.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

Agency, Agent, Current assignment, Task phase, Mission site, Mission, and Current team are defined by the
[Domain Model glossary](domain-model.md#glossary). Standby, Contracting, Training, Recovery, Deployed, and Weapon damage
are defined by the [Agents glossary](agents-spec.md#glossary); Serving, Killed, and Dismissed are the Agent lifecycle
states under [Agent lifecycle](agents-spec.md#agent-lifecycle). Campaign instance, Instance ID, Archetype, Constants,
State, World history, Campaign configuration, and Turn series are defined by the
[Campaign State glossary](../foundation/campaign-state.md#glossary). GDR, Game build, Authoritative value, and Derived
value are defined by the [Core Concepts glossary](../foundation/core-concepts.md#glossary). Player-visible information,
Player action, Committed state, Turn, Turn-start state, Turn-end state, Session controller, Player API, and Developer
API are defined by the [Engine Contract glossary](../foundation/engine-contract.md#glossary). Campaign configuration
preset and Preset edit are defined by the [Configuration glossary](../foundation/configuration.md#glossary). Turn
advancement step and Step-start value are defined by the [Turn Advancement glossary](turn-advancement.md#glossary).
Money, funding, upkeep, and income are plain words for the Agency's properties and their changes, as Domain Model's
Agency definition uses them; they are not glossary terms.

| Term          | Definition                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Upgrade       | A permanent improvement the Agency buys with money, any number of times.   |
| Agent cap     | The most Agents the Agency can employ when it hires another one.           |
| Transport cap | The most Agents the Agency can have Deployed at the same time.             |
| Training cap  | The most Agents the Agency can have assigned to Training at the same time. |

# Economy GDRs

This document owns the three GDR Types below and states which rule reads each property. A rule in this document names
the property it reads and never copies a GDR value; only the [Acceptance examples](#acceptance-examples) show values.
The GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md) and the
YAML files it names. Every property table below is exhaustive apart from the `id` and `type` that every GDR has.

## EconomyParameters

EconomyParameters bundles the scalar values this document's rules read.

| Property                       | Meaning                                                                | Read by                         |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------- |
| `hire_cost`                    | The money one hire costs.                                              | [Hiring Agents](#hiring-agents) |
| `upkeep_per_agent`             | The money each Serving Agent costs in one Advance turn.                | [Upkeep](#upkeep)               |
| `contracting_income_per_agent` | The money each Agent working on Contracting earns in one Advance turn. | [Agency income](#agency-income) |
| `base_agent_cap`               | The Agent cap before any Upgrade is acquired.                          | [Agency caps](#agency-caps)     |
| `base_transport_cap`           | The Transport cap before any Upgrade is acquired.                      | [Agency caps](#agency-caps)     |
| `base_training_cap`            | The Training cap before any Upgrade is acquired.                       | [Agency caps](#agency-caps)     |

## Upgrade

Each Upgrade is one GDR of Type Upgrade. The Upgrade GDRs the Game build supplies are the Upgrades the Agency can buy.

| Property    | Meaning                                                                                                                    | Read by                                                   |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `name`      | The display name of the Upgrade.                                                                                           | [Player-visible information](#player-visible-information) |
| `price`     | The money one acquisition of the Upgrade costs.                                                                            | [Purchasing Upgrades](#purchasing-upgrades)               |
| `effect`    | The identifier of what the Upgrade improves: one of the four effect identifiers under [Upgrade effects](#upgrade-effects). | [Upgrade effects](#upgrade-effects)                       |
| `increment` | How much one acquisition of the Upgrade raises the value its `effect` improves.                                            | [Upgrade effects](#upgrade-effects)                       |

An Upgrade's effect is decided only by its `effect` property, never by its `id` or `name`, under
[References](../foundation/campaign-state.md#references) in Campaign State. E.g., the Upgrade whose `id` is `agent_cap`
raises the Agent cap because its `effect` is `agent_cap`, and would raise the Transport cap if its `effect` were
`transport_cap`.

## AgencyArchetype

An AgencyArchetype is the Archetype of the Agency. It supplies no initial value; it is display content only.

| Property | Meaning                         | Read by                                                   |
| -------- | ------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the Agency. | [Player-visible information](#player-visible-information) |

## Economy GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDRs
this document owns. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it,
and the violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One AgencyArchetype:** The Game build supplies exactly one AgencyArchetype, so no rule selects among
   AgencyArchetypes.
2. **One EconomyParameters:** The Game build supplies exactly one EconomyParameters GDR.
3. **Exact properties:** Each GDR of the three Types has exactly the properties its table above lists, apart from `id`
   and `type`: no listed property is missing and no other property is present.
4. **Parameters are valid:** Each of `hire_cost`, `upkeep_per_agent`, `contracting_income_per_agent`,
   `base_agent_cap`, `base_transport_cap`, and `base_training_cap` is a whole number of at least 0.
5. **Upgrades are valid:** Each Upgrade's `price` and `increment` are whole numbers of at least 0, and its `effect` is
   exactly one of `agent_cap`, `transport_cap`, `training_cap`, and `agent_weapon_damage`.
6. **Names are present:** The `name` of the AgencyArchetype and of each Upgrade is non-empty text.

The Game build may supply any number of Upgrades, including none, and several Upgrades may share one `effect`; the rules
under [Agency caps](#agency-caps) and [Weapon damage effect](#weapon-damage-effect) add up the contributions of every
Upgrade with the same `effect`.

# Campaign configuration values

**Proposed rule:** This document owns exactly two Campaign configuration values, each stated as
[What each Campaign configuration value must state](../foundation/configuration.md#what-each-campaign-configuration-value-must-state)
in Configuration requires. Each Campaign configuration preset supplies both, as the properties named below.

| Campaign configuration value | Preset property    | Type and permitted values              | Class                | How campaign creation uses it                                                       |
| ---------------------------- | ------------------ | -------------------------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| Starting money               | `starting_money`   | A whole number of money of at least 0. | Fixed after creation | It becomes the Agency's initial money, under [Agency creation](#agency-creation).   |
| Starting funding             | `starting_funding` | A whole number of money of at least 0. | Fixed after creation | It becomes the Agency's initial funding, under [Agency creation](#agency-creation). |

Neither value is adjustable during play, so a Campaign configuration change naming either is invalid, under
[Changing Campaign configuration during play](../foundation/configuration.md#changing-campaign-configuration-during-play).
A Preset edit setting either to a value outside its permitted values is rejected, under
[Preset selection and edits](../foundation/configuration.md#preset-selection-and-edits). A Campaign configuration preset
whose own value of either is outside its permitted values makes the Game build defective, with the consequences stated
under [Economy GDR validation](#economy-gdr-validation). Campaign configuration keeps both values for the whole Campaign
as the values the Campaign started with; no rule reads them after campaign creation, and a later change of the Agency's
money or funding never changes them.

# Agency State

## Agency properties

**Proposed rule:** The Agency is a Campaign instance whose Archetype is the AgencyArchetype. Its Archetype reference is
set when it is created and never changes. Its Constants are empty. Its State has exactly the following properties. This
table is exhaustive.

| Property     | Part  | Value                                                                                                    | Classification and range                                                                                                                                                                  |
| ------------ | ----- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Money        | State | The money the Agency has.                                                                                | Authoritative value. A whole number of money with no lower and no upper bound: it may be negative, as [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) allows. |
| Funding      | State | The recurring money the Agency receives in each Agency income step.                                      | Authoritative value. A whole number of money of at least 0, under [Funding changes](#funding-changes).                                                                                    |
| Acquisitions | State | For each Upgrade GDR the Game build supplies, the number of times the Agency has purchased that Upgrade. | Authoritative value. One whole number of at least 0 per Upgrade, with no upper bound.                                                                                                     |

The Agency also has these Derived values, which are never stored: its Agent cap, Transport cap, and Training cap, under
[Agency caps](#agency-caps); its projected income and projected upkeep, under
[Projected income and upkeep](#projected-income-and-upkeep); and its roster, i.e. every Agent whose Agency reference
identifies it, whatever that Agent's lifecycle state, under [Agent properties](agents-spec.md#agent-properties) in
Agents. Its money has the two Turn series under [Turn series of money](#turn-series-of-money); funding and acquisitions
have none.

The following table is the exhaustive list of rules that change the Agency's State:

| Value        | Raised by                                                                                                                            | Lowered by                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Money        | [Agency income](#agency-income); [Adding money](#adding-money); the consequences of a Mission site, owned by [Missions](missions.md) | [Upkeep](#upkeep); [Hiring Agents](#hiring-agents); [Purchasing Upgrades](#purchasing-upgrades)                   |
| Funding      | The consequences of a Mission site, owned by [Missions](missions.md), through [Funding changes](#funding-changes)                    | The consequences of a Mission site, owned by [Missions](missions.md), through [Funding changes](#funding-changes) |
| Acquisitions | [Purchasing Upgrades](#purchasing-upgrades)                                                                                          | No rule                                                                                                           |

A rule of another specification that changes money adds a whole amount to it, positive or negative, and the result is
never clamped. The Agency is retained for the whole Campaign and never removed.

## Agency creation

**Proposed rule:** The initial Campaign state contains exactly one Agency, as
[Agency per Campaign](domain-model.md#agency-per-campaign) and
[Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model require, and no rule creates another
Agency during play. It has a fresh Instance ID under
[Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) and the following initial values,
under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in Campaign State. This
table is exhaustive.

| Value               | Initial value                                      | Source                                                                                         |
| ------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Archetype reference | The AgencyArchetype.                               | The one AgencyArchetype GDR, under [Economy GDR validation](#economy-gdr-validation).          |
| Money               | The Campaign configuration value Starting money.   | Campaign configuration, under [Campaign configuration values](#campaign-configuration-values). |
| Funding             | The Campaign configuration value Starting funding. | Campaign configuration, under [Campaign configuration values](#campaign-configuration-values). |
| Acquisitions        | 0 for every Upgrade GDR the Game build supplies.   | This rule.                                                                                     |

Campaign creation also records the Agency's initial money as the value of Money at the start of turn for the first
Turn, under [Turn series of money](#turn-series-of-money).

## Funding changes

**Proposed rule:** Funding is never below 0. This document owns funding, and every rule of another specification that
changes funding does so through this rule: it names a whole amount, positive, zero, or negative, by which funding
changes, and funding becomes:

```text
funding after = max(0, funding before + sum of the amounts)
```

Inputs: funding before is the Agency's funding as the Step-start value of the Turn advancement step that makes the
changes, a whole number of at least 0; the amounts are every funding change that rules apply in that one Turn
advancement step, each a whole number of money. When one Turn advancement step makes several funding changes, they are
added up first and the floor is applied once, to the sum, so the result does not depend on the order in which an
implementation applies them. No rounding occurs, because every term is a whole number. The result is a whole number of
at least 0.

E.g., with funding 3, one change of −10 gives 0, and two changes of +5 and −10 in the same step give
max(0, 3 + 5 − 10) = 0, whichever is applied first.

A funding change starts producing income in the first Agency income step that follows it. In scope only the
consequences of Mission sites change funding, and they apply after the Agency income step of the same Advance turn
under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), so a funding change first affects income in
the next Advance turn.

# Agency caps

**Proposed rule:** The Agent cap, Transport cap, and Training cap are Derived values of the Agency, each computed by the
same formula from a base value of EconomyParameters and the Agency's acquisitions:

```text
cap = base + sum over every Upgrade U whose effect is the cap's effect identifier of ( increment of U × acquisitions of U )
```

| Cap           | base                 | Effect identifier | What it limits                                                                                                             | Applied by                                                                              |
| ------------- | -------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Agent cap     | `base_agent_cap`     | `agent_cap`       | The number of Serving Agents, whatever their Current assignment and Task phase.                                            | [Hiring Agents](#hiring-agents), in this document                                       |
| Transport cap | `base_transport_cap` | `transport_cap`   | The number of Deployed Agents, i.e. Serving Agents whose Current assignment is Deployed, over every Mission site together. | The `deployAgents` Player action of [Missions](missions.md)                             |
| Training cap  | `base_training_cap`  | `training_cap`    | The number of Serving Agents whose Current assignment is Training, counting both those At assignment and those In transit. | [Training cap on assigning Agents](#training-cap-on-assigning-agents), in this document |

Inputs: base is a whole number of Agents of at least 0; each increment is a whole number of Agents of at least 0; each
acquisitions is a whole number of at least 0. A cap with no Upgrade of its effect identifier equals its base. No
rounding occurs, because every term is a whole number. Each cap is a whole number of at least its base, with no upper
bound.

**Counting Training:** An Agent ordered to Training occupies a place under the Training cap from the moment of the
order, while it is still In transit, and keeps it until its Current assignment stops being Training. An Agent
travelling away from Training, e.g. one ordered from Training to Standby, no longer counts.

**Counting Deployed Agents:** A Deployed Agent occupies a place under the Transport cap from the moment it is deployed
until its Current assignment stops being Deployed in the Mission resolution step, whether it returns or is Killed.

Each cap is computed from the current acquisitions whenever a rule reads it, so a purchase raises it at once, under
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract.

## Counts above a cap

A cap limits only the actions that add to the count it limits: hiring for the Agent cap, ordering to Training for the
Training cap, and deployment for the Transport cap. In scope no rule lowers a cap, because acquisitions only rise, but a
count can exceed its cap through a cheat operation, e.g. `addAgents` under [Adding Agents](agents-spec.md#adding-agents)
in Agents, which ignores the Agent cap. When a count exceeds its cap, nothing is removed and no Agent's Current
assignment changes; only further additions are rejected until the count is below the cap again. A count above a cap is
not an invariant violation.

# Agency income and upkeep

## Agency income

**Proposed rule:** In the Agency income step of every Advance turn, under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps), the Agency's money rises by its income:

```text
income      = funding + contracting_income_per_agent × C
money after = money before + income
```

Inputs:

| Symbol                         | Meaning                                                                                                                                                                                         | Unit and domain                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| funding                        | The Agency's funding, as the Step-start value of the Agency income step.                                                                                                                        | Money; a whole number of at least 0.           |
| `contracting_income_per_agent` | The value of EconomyParameters.                                                                                                                                                                 | Money per Agent; a whole number of at least 0. |
| C                              | The number of Agents that are Serving, whose Current assignment is Contracting, and that were At assignment in the Turn-end state, under [Transit rule](agents-spec.md#transit-rule) in Agents. | Agents; a whole number of at least 0.          |
| money before                   | The Agency's money as the Step-start value of the Agency income step.                                                                                                                           | Money; any whole number.                       |

An Agent that arrives at Contracting in the Transit step of the same Advance turn is not counted in C. No rounding
occurs, because every term is a whole number. Income is a whole number of at least 0, so money never falls in this step.
The Transit step changes neither funding nor any Agent's lifecycle state or Current assignment, so funding and C equal
their values in the Turn-end state.

## Upkeep

**Proposed rule:** In the Upkeep step of every Advance turn, under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps), the Agency's money falls by its upkeep:

```text
upkeep      = upkeep_per_agent × S
money after = money before − upkeep
```

Inputs:

| Symbol             | Meaning                                                                                                                  | Unit and domain                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `upkeep_per_agent` | The value of EconomyParameters.                                                                                          | Money per Agent; a whole number of at least 0. |
| S                  | The number of Serving Agents, as Step-start values of the Upkeep step, whatever their Current assignment and Task phase. | Agents; a whole number of at least 0.          |
| money before       | The Agency's money as the Step-start value of the Upkeep step, i.e. after the Agency income step.                        | Money; any whole number.                       |

S counts every Serving Agent, including one that is In transit, one that arrived in the Transit step of the same Advance
turn, one on Recovery, and one that is Deployed, under the upkeep exception of [Transit rule](agents-spec.md#transit-rule)
in Agents. A Killed or Dismissed Agent is not Serving and is not counted. An Agent Killed in the Mission resolution step
of an Advance turn was Serving in the Upkeep step of that same Advance turn, so it is counted in that Advance turn and
in no later one. No rounding occurs. Upkeep is a whole number of at least 0.

**Negative money:** Upkeep is always paid in full. Money may become negative, and it is neither clamped nor is the
Advance turn rejected; e.g., money 15 and upkeep 40 give money −25. What negative money means for the Campaign is owned
by [Panic and Endings](panic-and-endings.md). While money is negative, every Player action of this document that spends
money is rejected, because its precondition requires money of at least its cost.

## Projected income and upkeep

**Proposed rule:** The Agency has two Derived values that state what the next Advance turn will add and charge if it is
committed from the current Committed state:

```text
projected income = funding + contracting_income_per_agent × C'
projected upkeep = upkeep_per_agent × S'
```

where funding is the Agency's funding in the current Committed state; C' is the number of Agents that are Serving,
whose Current assignment is Contracting, and whose Task phase is At assignment in the current Committed state; and S'
is the number of Serving Agents in the current Committed state. Each is a whole number of money of at least 0, with no
rounding.

When Advance turn is committed from the current Committed state, that state becomes the Turn-end state, so the Agency
income step adds exactly the projected income and the Upkeep step charges exactly the projected upkeep. The Agency's
money after the Upkeep step is therefore money + projected income − projected upkeep. Later steps of the same Advance
turn, e.g. the consequences of a Mission site, may change money further; the projections do not include them. Both
values follow every Player action at once; e.g., hiring raises projected upkeep by `upkeep_per_agent`, and ordering an
Agent from Contracting to Standby lowers projected income by `contracting_income_per_agent`.

# Hiring Agents

**Proposed rule:** The Player action `player.actions.hireAgent()` hires one Agent. It has no parameters.

Preconditions owned by this document. The action is rejected when either of the following holds:

1. The Agency's money is less than `hire_cost` of EconomyParameters.
2. The number of Serving Agents is equal to or greater than the Agent cap, under [Agency caps](#agency-caps).

Other preconditions on every Player action, e.g. that the Campaign has no Campaign ending, are owned by
[Panic and Endings](panic-and-endings.md) and [Engine Contract](../foundation/engine-contract.md).

Rejection: when a precondition fails, the action is rejected with an error that identifies at least one failed
precondition; the exact error representation is the implementer's choice. A rejected action changes nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

State changes: when both preconditions hold, the action is one Player action that applies at once, within the same
Turn:

- The Agency's money falls by `hire_cost`. Because money was at least `hire_cost`, money afterwards is at least 0.
- One Agent is created under [Agent creation](agents-spec.md#agent-creation) in Agents: Serving, on Standby, In transit,
  with Turn hired equal to the current turn number, and with the initial weapon damage under
  [Weapon damage effect](#weapon-damage-effect).

Nothing else changes. The new Agent counts toward the Agent cap and in projected upkeep at once. It arrives in the next
Advance turn, under [Transit rule](agents-spec.md#transit-rule), and is counted in that Advance turn's Upkeep step.
Hiring several Agents takes one `hireAgent` action each.

# Dismissing Agents

**Proposed rule:** The Player action `player.actions.dismissAgents(agents)` dismisses Agents from the Agency.

| Parameter | Meaning                                                                   |
| --------- | ------------------------------------------------------------------------- |
| `agents`  | A list of Instance IDs, each meant to identify one Agent of the Campaign. |

Preconditions owned by this document. The action is rejected, as a whole, when any of the following holds:

1. `agents` is empty.
2. `agents` contains the same Instance ID more than once.
3. An Instance ID in `agents` identifies no Agent of the Campaign.
4. An Agent in `agents` is not Serving.
5. An Agent in `agents` is In transit.
6. An Agent in `agents` has a Current assignment other than Standby.

Together, conditions 4 to 6 mean that every listed Agent must be Serving, At assignment, and on Standby. An Agent on
Contracting, Training, Recovery, or an Investigation, and a Deployed Agent, must first reach Standby, At assignment.
Other preconditions on every Player action are owned by [Panic and Endings](panic-and-endings.md) and
[Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at
least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation
is the implementer's choice. A rejected action changes nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same
Turn, to every Agent in `agents`: the Agent becomes Dismissed under [Agent lifecycle](agents-spec.md#agent-lifecycle) in
Agents, which removes its Current assignment and Task phase. No money is refunded or spent, and nothing else changes.
A Dismissed Agent stops counting toward the Agent cap and in projected upkeep at once, and is not counted in any later
Upkeep step. It stays in the Agency's roster and in World history with its final values.

# Training cap on assigning Agents

**Proposed rule:** This section refines the Player action `assignAgents` under
[Assigning Agents](agents-spec.md#assigning-agents) in Agents with one further precondition. When its `assignment` is
`Training`, the action is also rejected, as a whole, when:

```text
T + number of Agents in agents  >  Training cap
```

where T is the number of Serving Agents whose Current assignment is Training, At assignment or In transit, in the
Committed state in which the action is requested, and the Training cap is under [Agency caps](#agency-caps). Every Agent
in `agents` adds one, because the preconditions of Agents already reject an Agent whose Current assignment is Training.
The action is accepted when the sum is equal to or less than the Training cap.

The rejection follows the rejection behavior of `assignAgents` in Agents: the whole action is rejected, no listed Agent
changes, and the error identifies this precondition. This precondition does not apply when `assignment` is `Standby` or
`Contracting`, even when T exceeds the Training cap, under [Counts above a cap](#counts-above-a-cap). Ordering an Agent
away from Training frees its place at once, within the same Turn.

# Upgrades

## Purchasing Upgrades

**Proposed rule:** The Player action `player.actions.purchaseUpgrade(upgrade)` buys one acquisition of one Upgrade.

| Parameter | Meaning                                                                |
| --------- | ---------------------------------------------------------------------- |
| `upgrade` | A GDR identifier, meant to identify one Upgrade GDR of the Game build. |

Preconditions owned by this document. The action is rejected when either of the following holds:

1. `upgrade` identifies no Upgrade GDR of the Game build.
2. The Agency's money is less than the `price` of that Upgrade.

Other preconditions on every Player action are owned by [Panic and Endings](panic-and-endings.md) and
[Engine Contract](../foundation/engine-contract.md). No limit applies to how many times an Upgrade is purchased, in one
Turn or in the whole Campaign.

Rejection: when a precondition fails, the action is rejected with an error that identifies at least one failed
precondition; the exact error representation is the implementer's choice. A rejected action changes nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

State changes: when both preconditions hold, the action is one Player action that applies at once, within the same
Turn:

- The Agency's money falls by the Upgrade's `price`. Because money was at least the price, money afterwards is at least 0.
- The Agency's acquisitions of that Upgrade rise by 1.
- The Upgrade's effect applies, under [Upgrade effects](#upgrade-effects).

Nothing else changes. The price is the GDR's `price` for every acquisition; it does not rise with acquisitions.

## Upgrade effects

**Proposed rule:** Every Upgrade has exactly one effect, named by its `effect` property. The four effect identifiers
below are exhaustive, and they form two kinds.

| Effect identifier     | Kind               | What one acquisition does                                                                                             |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `agent_cap`           | Cap effect         | Raises the Agent cap by the Upgrade's `increment`, under [Cap effects](#cap-effects).                                 |
| `transport_cap`       | Cap effect         | Raises the Transport cap by the Upgrade's `increment`, under [Cap effects](#cap-effects).                             |
| `training_cap`        | Cap effect         | Raises the Training cap by the Upgrade's `increment`, under [Cap effects](#cap-effects).                              |
| `agent_weapon_damage` | Agent value effect | Raises the weapon damage of Agents by the Upgrade's `increment`, under [Weapon damage effect](#weapon-damage-effect). |

Acquisitions of every Upgrade stack by addition, without limit, and no effect depends on the order of purchases.

### Cap effects

A cap effect changes no stored value beyond the acquisitions: the cap it raises is a Derived value under
[Agency caps](#agency-caps), so it rises by `increment` at once, within the same Turn, and every Player action after the
purchase sees the raised cap. A cap effect changes no Agent's Current assignment.

### Weapon damage effect

This section refines [Modifiable values](agents-spec.md#modifiable-values) in Agents, which makes weapon damage the
only Agent value an Upgrade may change. An acquisition of an Upgrade whose `effect` is `agent_weapon_damage` has two
consequences:

1. **Serving Agents:** When the purchase is committed, the weapon damage of every Serving Agent rises by that Upgrade's
   `increment`, whatever the Agent's Current assignment and Task phase; e.g., a Deployed Agent, an Agent In transit, and
   an Agent on Recovery are all raised. Killed and Dismissed Agents keep their weapon damage, which is retained in World
   history, under [Agent properties](agents-spec.md#agent-properties) in Agents.
2. **Agents created later:** Every Agent created after the purchase, under
   [Agent creation](agents-spec.md#agent-creation) in Agents, starts with the initial weapon damage below.

```text
initial weapon damage = damage + sum over every Upgrade U whose effect is agent_weapon_damage of ( increment of U × acquisitions of U )
```

Inputs: damage is the `damage` of the Weapon GDR that the AgentArchetype's `weapon` references, a whole number of at
least 1; each increment and each acquisitions is a whole number of at least 0, and the acquisitions are those of the
Committed state in which the Agent is created. No rounding occurs. The result is a whole number of at least damage, so of at least 1.
This formula applies to every Agent creation: hiring, `addAgents`, and the initial roster, whose Agents start with
damage because acquisitions are 0 at campaign creation.

Consequently, every Serving Agent's weapon damage equals the formula above, whichever Turn the Agent was created in,
because no other rule changes weapon damage, under [Changes to attributes](agents-spec.md#changes-to-attributes) in
Agents. The effect changes no other Agent value, no Weapon GDR, and no Enemy.

# Turn series of money

**Proposed rule:** This document declares exactly the following two Turn series, under
[Turn series](../foundation/campaign-state.md#turn-series) in Campaign State. Each records the Agency's money, a whole
number of money that may be negative.

| Turn series                | Recorded moment of each turn                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Money at the start of turn | The Turn-start state of the Turn: the Committed state in which the Turn starts, before any action of it. |
| Money at the end of turn   | The Turn-end state of the Turn: the Committed state in which the Advance turn that ends the Turn begins. |

The values are recorded as follows:

- **At campaign creation:** Money at the start of turn for the first Turn is recorded as the Agency's initial money.
- **At Turn close:** In the Turn close step of the Advance turn that ends Turn t, under
  [Turn advancement steps](turn-advancement.md#turn-advancement-steps), two values are recorded. Money at the end of turn
  for Turn t is the Agency's money in the Turn-end state, i.e. before the Agency income step of that Advance turn, so it
  includes every Player action of Turn t, e.g. hiring and purchases. Money at the start of turn for Turn t + 1 is the
  Agency's money at the Turn close step, i.e. after every earlier step of that Advance turn, which is the money in the
  Turn-start state of Turn t + 1. The Turn close step records both values even when the Campaign received a Campaign
  ending in the Ending check step of the same Advance turn.

The current Turn has a recorded value of Money at the start of turn but none of Money at the end of turn, because its
Turn-end state is not reached until its Advance turn is committed. Player actions during a Turn never change a value
already recorded. Both Turn series are Player-visible information. Funding, acquisitions, and the caps have no Turn
series.

# Cheat operations

## Adding money

**Proposed rule:** The cheat operation `developer.actions.addMoney(amount)` adds money to the Agency. It follows every
rule under [Cheat operations](../foundation/developer-access.md#cheat-operations) in Developer Access, including that
only the Session controller can call it, only with Dev mode enabled, and that each successful call is one Player action
recorded as one Timeline entry.

| Parameter | Meaning                                              |
| --------- | ---------------------------------------------------- |
| `amount`  | How much money to add: a whole number of at least 1. |

Validation: the operation is rejected, and changes nothing, when `amount` is not a whole number or is less than 1. No
upper limit applies.

Effect: the Agency's money rises by `amount`. Nothing else changes; e.g., funding, acquisitions, and the values already
recorded in the Turn series are unchanged. Money that was negative may become zero or positive.

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Every value is Player-visible from the moment it exists, without a reveal condition.

| Value                                                                                    | Player-visible information |
| ---------------------------------------------------------------------------------------- | -------------------------- |
| The Agency's Instance ID and its AgencyArchetype, including the AgencyArchetype's `name` | Yes                        |
| The Agency's money, including a negative amount                                          | Yes                        |
| The Agency's funding                                                                     | Yes                        |
| The Agency's acquisitions of each Upgrade                                                | Yes                        |
| The Agent cap, Transport cap, and Training cap, each with its current value              | Yes                        |
| The projected income and projected upkeep of the coming Advance turn                     | Yes                        |
| Money at the start of turn and Money at the end of turn, in full                         | Yes                        |
| Every property of EconomyParameters and of each Upgrade GDR                              | Yes                        |
| The Campaign configuration values Starting money and Starting funding                    | Yes                        |

**Unknown versus absent:** No value this document owns is hidden, so Player API never reports one as unknown. An
Upgrade never purchased is reported with acquisitions 0, not as absent. Money at the end of turn has no recorded value
for the current Turn, which Player API reports as absent for that Turn. Because every value this document owns is
Player-visible information, no rejection error of its actions reveals anything hidden.

# Edge cases and failure behavior

- **Exact affordability:** Money exactly equal to `hire_cost` or to an Upgrade's `price` satisfies the precondition; the
  action succeeds and leaves money 0 ([Hiring Agents](#hiring-agents), [Purchasing Upgrades](#purchasing-upgrades)).
- **Insufficient or negative money:** Money below the cost, including any negative money, rejects `hireAgent` and
  `purchaseUpgrade`; nothing changes ([Hiring Agents](#hiring-agents), [Purchasing Upgrades](#purchasing-upgrades)).
- **Agent cap reached:** With exactly as many Serving Agents as the Agent cap, `hireAgent` is rejected even with
  enough money. Serving Agents In transit, on Recovery, or Deployed count; Killed and Dismissed Agents do not
  ([Hiring Agents](#hiring-agents), [Agency caps](#agency-caps)).
- **Training cap reached:** An Agent In transit to Training occupies a place, so an order to Training that would exceed
  the cap is rejected even while some Agents on Training have not yet arrived
  ([Training cap on assigning Agents](#training-cap-on-assigning-agents)).
- **Count above a cap:** After a cheat operation, e.g. `addAgents`, a count may exceed its cap; nothing is removed and
  only further additions are rejected ([Counts above a cap](#counts-above-a-cap)).
- **Zero funding:** With funding 0 and no Agent working on Contracting, income is 0 and the Agency income step leaves
  money unchanged. A funding change that would take funding below 0 leaves it at 0 ([Agency income](#agency-income),
  [Funding changes](#funding-changes)).
- **Several funding changes in one step:** They are added up before the floor is applied, so their order does not
  matter ([Funding changes](#funding-changes)).
- **Upkeep making money negative:** Upkeep is paid in full and money may become negative; the Campaign ending it may
  cause is owned by [Panic and Endings](panic-and-endings.md) ([Upkeep](#upkeep)).
- **Agent Killed in the same Advance turn:** An Agent Killed in the Mission resolution step was counted in the Upkeep
  step before it, and is not counted in any later Advance turn ([Upkeep](#upkeep)).
- **Arriving Agents:** An Agent arriving at Contracting in the Transit step earns nothing in that Advance turn but is
  counted in Upkeep ([Agency income](#agency-income), [Upkeep](#upkeep)).
- **Dismissing an Agent that is not on Standby, At assignment:** Rejected as a whole; e.g., an Agent on Standby but In
  transit, an Agent on Contracting, and a Deployed Agent cannot be dismissed ([Dismissing Agents](#dismissing-agents)).
- **Dismissing every Agent:** Valid; an Agency with no Serving Agent pays no upkeep. Defeat conditions belong to
  [Panic and Endings](panic-and-endings.md) ([Dismissing Agents](#dismissing-agents)).
- **Unknown Upgrade:** `purchaseUpgrade` with an identifier that names no Upgrade GDR, including one naming a GDR of
  another Type, is rejected ([Purchasing Upgrades](#purchasing-upgrades)).
- **Weapon damage of Agents who are not Serving:** A Killed or Dismissed Agent keeps its weapon damage when a weapon
  damage Upgrade is purchased ([Weapon damage effect](#weapon-damage-effect)).
- **Upgrade with increment 0 or price 0:** Valid GDRs; a purchase of the first raises acquisitions but no cap or weapon
  damage, and a purchase of the second costs no money ([Economy GDR validation](#economy-gdr-validation)).
- **Large values:** Money, acquisitions, caps, and weapon damage have no upper bound, and every computation is exact,
  under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers.
- **Invalid GDRs:** A Game build with an unknown `effect`, a missing or extra property, a negative or fractional value, a
  second EconomyParameters or AgencyArchetype, or a preset `starting_money` below 0 is defective, and no Campaign is
  created from it ([Economy GDR validation](#economy-gdr-validation),
  [Campaign configuration values](#campaign-configuration-values)). A Committed state violating an invariant of this
  document, e.g. negative funding, is an internal invariant violation, reported under
  [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a Campaign ending, `hireAgent`, `dismissAgents`, `purchaseUpgrade`,
  `addMoney`, and Advance turn are rejected; [Panic and Endings](panic-and-endings.md) owns that rejection.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/configuration/campaign_configurations.yaml`,
`content/economy-and-upgrades/economy_parameters.yaml`, `content/economy-and-upgrades/upgrades.yaml`,
`content/economy-and-upgrades/agency_archetypes.yaml`, `content/agents/agent_parameters.yaml`,
`content/combat/weapons.yaml`, and `content/factions/faction_operation_levels.yaml`, unless an example states a test
value. The values they read are:

| GDR                 | Values read                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `standard`          | `starting_money` 500; `starting_funding` 20                                                                                                  |
| `agency`            | `name` The Agency                                                                                                                            |
| `economy`           | `hire_cost` 50; `upkeep_per_agent` 10; `contracting_income_per_agent` 30; `base_agent_cap` 20; `base_transport_cap` 4; `base_training_cap` 4 |
| `agent_cap`         | `price` 200; `effect` `agent_cap`; `increment` 4                                                                                             |
| `transport_cap`     | `price` 1000; `effect` `transport_cap`; `increment` 2                                                                                        |
| `training_cap`      | `price` 200; `effect` `training_cap`; `increment` 4                                                                                          |
| `weapon_damage`     | `price` 500; `effect` `agent_weapon_damage`; `increment` 1                                                                                   |
| `agent_parameters`  | `initial_roster_size` 4                                                                                                                      |
| `sidearm`           | `damage` 10                                                                                                                                  |
| `operation_level_2` | `on_win` money 30 and funding 5; `on_ignored_or_lost` funding −1                                                                             |

"The Advance turn ending turn t" is the Advance turn committed during Turn t; the Campaign starts in Turn 1. Unless an
example states otherwise, no rule of [Missions](missions.md) changes money or funding in the Advance turns it describes,
i.e. no Mission site is Won, Lost, or Expired in them.

## Campaign creation

This example exercises [Agency creation](#agency-creation),
[Campaign configuration values](#campaign-configuration-values), [Agency caps](#agency-caps),
[Projected income and upkeep](#projected-income-and-upkeep), and [Turn series of money](#turn-series-of-money). A new
Campaign is created from the preset `standard` without Preset edits. Its initial Campaign state contains exactly one
Agency, with the values below, and the 4 Agents of the initial roster, each Serving, on Standby, At assignment, with
weapon damage 10.

| Value                                  | Value in Turn 1                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| Archetype                              | `agency`, whose `name` is The Agency                                            |
| Money                                  | 500                                                                             |
| Funding                                | 20                                                                              |
| Acquisitions                           | 0 for each of `agent_cap`, `transport_cap`, `training_cap`, and `weapon_damage` |
| Agent cap, Transport cap, Training cap | 20, 4, 4                                                                        |
| Projected income                       | 20 + 30 × 0 = 20                                                                |
| Projected upkeep                       | 10 × 4 = 40                                                                     |
| Money at the start of turn             | Turn 1: 500                                                                     |
| Money at the end of turn               | No recorded value                                                               |

Campaign configuration holds Starting money 500 and Starting funding 20 for the whole Campaign. A Campaign created
with a Preset edit of Starting money 800 starts with money 800 instead; a Preset edit of Starting money −1 or 2.5 is
rejected and changes nothing.

## The first three Advance turns

This example exercises [Agency income](#agency-income), [Upkeep](#upkeep), [Hiring Agents](#hiring-agents),
[Projected income and upkeep](#projected-income-and-upkeep), and [Turn series of money](#turn-series-of-money). It
starts from the Campaign under [Campaign creation](#campaign-creation), with Agents a1, a2, a3, and a4.

**Turn 1:** The player calls `assignAgents([a1, a2], Contracting)` and `assignAgents([a3], Training)`; a4 stays on
Standby. a1, a2, and a3 are In transit, so projected income stays 20 + 30 × 0 = 20 and projected upkeep stays
10 × 4 = 40. Money is 500 when the player advances the turn.

| Step of the Advance turn ending turn 1 | What happens                                                                              | Money |
| -------------------------------------- | ----------------------------------------------------------------------------------------- | ----- |
| Transit                                | a1, a2, and a3 arrive.                                                                    | 500   |
| Agency income                          | C = 0, because a1 and a2 were In transit in the Turn-end state: 20 + 30 × 0 = 20.         | 520   |
| Upkeep                                 | S = 4: 10 × 4 = 40.                                                                       | 480   |
| Turn close                             | Money at the end of turn for Turn 1 is 500; Money at the start of turn for Turn 2 is 480. | 480   |

**Turn 2:** The player calls `hireAgent()`: money 480 is at least 50 and 4 Serving Agents are fewer than the Agent cap
20, so money becomes 430 and Agent a5 is created on Standby, In transit. Projected income is 20 + 30 × 2 = 80, from a1
and a2, and projected upkeep is 10 × 5 = 50.

| Step of the Advance turn ending turn 2 | What happens                                                                                  | Money |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | ----- |
| Transit                                | a5 arrives.                                                                                   | 430   |
| Agency income                          | C = 2: 20 + 30 × 2 = 80.                                                                      | 510   |
| Upkeep                                 | S = 5, including a5, which arrived in this Advance turn: 10 × 5 = 50.                         | 460   |
| Training                               | a3 gains skill, under [Training growth](agents-spec.md#training-growth); money is unaffected. | 460   |
| Turn close                             | Money at the end of turn for Turn 2 is 430; Money at the start of turn for Turn 3 is 460.     | 460   |

**Turn 3:** The player calls `assignAgents([a5], Contracting)` and `assignAgents([a1], Standby)`. Only a2 is on
Contracting, At assignment, so projected income is 20 + 30 × 1 = 50; projected upkeep is 10 × 5 = 50.

| Step of the Advance turn ending turn 3 | What happens                                                                                      | Money |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- | ----- |
| Transit                                | a1 and a5 arrive.                                                                                 | 460   |
| Agency income                          | C = 1, a2 only, because a5 has just arrived and a1 is no longer on Contracting: 20 + 30 × 1 = 50. | 510   |
| Upkeep                                 | S = 5: 10 × 5 = 50.                                                                               | 460   |
| Turn close                             | Money at the end of turn for Turn 3 is 460; Money at the start of turn for Turn 4 is 460.         | 460   |

In Turn 4, Money at the start of turn holds 500, 480, 460, and 460 for Turns 1 to 4, and Money at the end of turn holds
500, 430, and 460 for Turns 1 to 3. Projected income in Turn 4 is 20 + 30 × 2 = 80, from a2 and a5. In every Advance
turn above, the Agency income and Upkeep steps applied exactly the projected income and projected upkeep of the
Turn-end state.

## Upkeep counts every Serving Agent

This example exercises [Upkeep](#upkeep) and [Agency income](#agency-income). The Turn-end state of Turn 9 has money 300
and funding 20, and these Agents: a1 on Standby, At assignment; a2 on Contracting, In transit; a3 Deployed to Mission
site s1; a4 on Recovery, At assignment; a5 on Contracting, At assignment; a6 on Training, In transit; a7 Killed in an
earlier Turn; and a8 Dismissed. Projected income is 20 + 30 × 1 = 50 and projected upkeep is 10 × 6 = 60.

In the Advance turn ending turn 9, Agency income counts only a5, because a2 arrives in the Transit step: money
300 + 50 = 350. Upkeep counts the six Serving Agents a1 to a6, including the arriving a2 and a6, the Deployed a3, and
a4 on Recovery, and neither a7 nor a8: money 350 − 60 = 290. In the Mission resolution step, a3 is Killed in the Battle
at s1. In Turn 10, projected upkeep is 10 × 5 = 50: a3 paid upkeep in the Advance turn in which it was Killed and pays
none afterwards.

## Negative money

This example exercises [Upkeep](#upkeep), [Hiring Agents](#hiring-agents), [Purchasing Upgrades](#purchasing-upgrades),
and [Adding money](#adding-money). The Agency has money 15, funding 0, and 4 Serving Agents, none on Contracting. In the
next Advance turn, income is 0 + 30 × 0 = 0 and money stays 15; upkeep is 10 × 4 = 40 and money becomes −25. Money at
the start of turn for the next Turn is −25. Whether the Campaign ends is decided by
[Panic and Endings](panic-and-endings.md). If it has not ended, `hireAgent()` and `purchaseUpgrade(agent_cap)` are each
rejected, because −25 is less than 50 and less than 200. With Dev mode enabled, `developer.actions.addMoney(25)` makes
money 0, and `addMoney(75)` after it makes money 75; `hireAgent()` then succeeds and leaves money 25.

## Funding changes from Mission sites

This example exercises [Funding changes](#funding-changes) and [Agency income](#agency-income), with the amounts of
`operation_level_2`; [Missions](missions.md) owns when each applies.

- **Win:** With funding 20, a Response Mission site of Faction operation level 2 is Won in the Mission resolution step
  of the Advance turn ending turn 6. That Advance turn's Agency income step already used funding 20. Money rises by 30,
  and funding becomes max(0, 20 + 5) = 25. The Agency income step of the Advance turn ending turn 7 uses funding 25, and
  projected income in Turn 7 includes it.
- **Loss at the floor:** With funding 0, such a Mission site is Expired in the Mission site expiration step. Funding
  becomes max(0, 0 − 1) = 0.
- **Two changes in one step:** With funding 0, in one Mission resolution step one such Mission site is Won and another
  is Lost. The amounts +5 and −1 are added first: funding becomes max(0, 0 + 5 − 1) = 4, not 5, whichever Mission site
  an implementation resolves first.

## Hiring at the Agent cap

This example exercises [Hiring Agents](#hiring-agents), [Agency caps](#agency-caps), [Cap effects](#cap-effects), and
[Counts above a cap](#counts-above-a-cap). During Turn 12 the Agency has money 500 and exactly 20 Serving Agents, of
which one is In transit, two are Deployed, and one is on Recovery, plus one Killed Agent.

| Call                         | Result                                                                                                           | Money | Serving Agents | Agent cap       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----- | -------------- | --------------- |
| `hireAgent()`                | Rejected: 20 Serving Agents are not fewer than the Agent cap 20; the Killed Agent does not count, the others do. | 500   | 20             | 20              |
| `purchaseUpgrade(agent_cap)` | Succeeds: acquisitions of `agent_cap` become 1.                                                                  | 300   | 20             | 20 + 4 × 1 = 24 |
| `hireAgent()`, four times    | Each succeeds.                                                                                                   | 100   | 24             | 24              |
| `hireAgent()`                | Rejected: 24 Serving Agents are not fewer than the Agent cap 24.                                                 | 100   | 24             | 24              |

Separately, an Agency with money 50 and 4 Serving Agents hires successfully and has money 0; with money 49,
`hireAgent()` is rejected and changes nothing. An Agency with 20 Serving Agents to which the cheat operation
`developer.actions.addAgents(3)` adds 3 Agents has 23 Serving Agents and an Agent cap of 20: nothing is removed, and
`hireAgent()` is rejected until the number of Serving Agents falls below the Agent cap or the Agent cap rises above it.

## Dismissing Agents

This example exercises [Dismissing Agents](#dismissing-agents) and
[Projected income and upkeep](#projected-income-and-upkeep). During Turn 8 the Agency has money 120: a1 and a2 are on
Standby, At assignment; a3 is on Standby, In transit; a4 is on Contracting, At assignment; a5 is Deployed; a6 is
Killed. Projected upkeep is 10 × 5 = 50. Each call is made on its own from this state, and each rejected call changes
nothing:

| Call                      | Result                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `dismissAgents([])`       | Rejected: `agents` is empty.                                                                                                 |
| `dismissAgents([a1, a1])` | Rejected: a1 is listed twice.                                                                                                |
| `dismissAgents([a3])`     | Rejected: a3 is In transit.                                                                                                  |
| `dismissAgents([a4])`     | Rejected: a4 is on Contracting.                                                                                              |
| `dismissAgents([a5])`     | Rejected: a5 is Deployed.                                                                                                    |
| `dismissAgents([a6])`     | Rejected: a6 is not Serving.                                                                                                 |
| `dismissAgents([a1, a3])` | Rejected as a whole: a3 is In transit. a1 stays Serving, on Standby.                                                         |
| `dismissAgents([a1, a2])` | Succeeds: a1 and a2 are Dismissed and have no Current assignment. Money stays 120, and projected upkeep becomes 10 × 3 = 30. |

## Transport cap

This example exercises [Agency caps](#agency-caps) and [Cap effects](#cap-effects); the rejection itself belongs to the
`deployAgents` Player action of [Missions](missions.md). During Turn 15 the Agency has money 1000, three Agents
Deployed to Mission site s1, and six Agents that can be ordered. The Transport cap is 4 and the number of Deployed
Agents is 3, so deploying two Agents to Mission site s2 would make 5, more than 4, and Missions rejects it; deploying
one would make 4 and is within the Transport cap. Instead the player calls `purchaseUpgrade(transport_cap)`: money
becomes 0, acquisitions of `transport_cap` become 1, and the Transport cap becomes 4 + 2 × 1 = 6 at once, so deploying
three Agents to s2 now makes 6 and is within the Transport cap. After the Battle at s1 in the next Advance turn, its
survivors are no longer Deployed and stop counting.

## Training cap

This example exercises [Training cap on assigning Agents](#training-cap-on-assigning-agents),
[Agency caps](#agency-caps), and [Cap effects](#cap-effects). During Turn 20 the Agency has money 250. Agents t1, t2,
and t3 are on Training, At assignment; a1 to a6 are on Standby, At assignment. The Training cap is 4 and T is 3. The
calls are made in this order:

| Call                                       | Result                                                                    | T after |
| ------------------------------------------ | ------------------------------------------------------------------------- | ------- |
| `assignAgents([a1, a2], Training)`         | Rejected as a whole: 3 + 2 = 5 is more than 4. Neither a1 nor a2 changes. | 3       |
| `assignAgents([a1], Training)`             | Succeeds: 3 + 1 = 4. a1 is on Training, In transit, and already counts.   | 4       |
| `assignAgents([a2], Training)`             | Rejected: 4 + 1 = 5 is more than 4, although a1 has not yet arrived.      | 4       |
| `assignAgents([a2], Contracting)`          | Succeeds: the Training cap does not apply.                                | 4       |
| `purchaseUpgrade(training_cap)`            | Succeeds: money 50; the Training cap becomes 4 + 4 × 1 = 8.               | 4       |
| `assignAgents([a3, a4, a5, a6], Training)` | Succeeds: 4 + 4 = 8.                                                      | 8       |
| `assignAgents([t1], Standby)`              | Succeeds: t1 is no longer on Training and frees its place at once.        | 7       |

A second `purchaseUpgrade(training_cap)` in the same Turn is rejected, because money 50 is less than 200.

## Weapon damage Upgrade

This example exercises [Weapon damage effect](#weapon-damage-effect), [Purchasing Upgrades](#purchasing-upgrades), and
[Hiring Agents](#hiring-agents). During Turn 30 the Agency has money 600 and four Serving Agents, each with weapon
damage 10: a1 on Contracting, At assignment; a2 Deployed; a3 on Recovery, In transit; and a4 on Standby, In transit.
Agent a5 is Killed and a6 is Dismissed, each with weapon damage 10. The actions are taken in this order:

| Action                            | Result                         | Money | Acquisitions of `weapon_damage` | Weapon damage of a1 to a4 | Weapon damage of a5 and a6 | Agent created by the action            |
| --------------------------------- | ------------------------------ | ----- | ------------------------------- | ------------------------- | -------------------------- | -------------------------------------- |
| `purchaseUpgrade(weapon_damage)`  | Succeeds                       | 100   | 1                               | 11                        | 10                         | None                                   |
| `purchaseUpgrade(weapon_damage)`  | Rejected: 100 is less than 500 | 100   | 1                               | 11                        | 10                         | None                                   |
| `developer.actions.addMoney(900)` | Succeeds                       | 1000  | 1                               | 11                        | 10                         | None                                   |
| `purchaseUpgrade(weapon_damage)`  | Succeeds                       | 500   | 2                               | 12                        | 10                         | None                                   |
| `hireAgent()`                     | Succeeds                       | 450   | 2                               | 12                        | 10                         | a7, with weapon damage 10 + 1 × 2 = 12 |
| `developer.actions.addAgents(1)`  | Succeeds                       | 450   | 2                               | 12                        | 10                         | a8, with weapon damage 12              |

Each purchase cost the same 500. A third purchase later raises a1 to a4, a7, and a8 to 13 together, and leaves a5 and
a6 at 10. The weapon damage of every Enemy and the `damage` of `sidearm` are unchanged throughout.

## Purchase rejections and exact affordability

This example exercises [Purchasing Upgrades](#purchasing-upgrades) and [Adding money](#adding-money). During Turn 4
the Agency has money 199. Each call is made on its own from this state:

| Call                            | Result                                                                |
| ------------------------------- | --------------------------------------------------------------------- |
| `purchaseUpgrade(training_cap)` | Rejected: 199 is less than 200. Money and acquisitions are unchanged. |
| `purchaseUpgrade(agent_health)` | Rejected: no Upgrade GDR has the identifier `agent_health`.           |
| `purchaseUpgrade(sidearm)`      | Rejected: `sidearm` is a Weapon GDR, not an Upgrade GDR.              |

After `developer.actions.addMoney(1)`, money is 200 and `purchaseUpgrade(training_cap)` succeeds, leaving money 0 and
a Training cap of 8. `addMoney(0)`, `addMoney(-5)`, and `addMoney(2.5)` are each rejected and change nothing.

## GDR validation

This example exercises [Economy GDR validation](#economy-gdr-validation) and
[Campaign configuration values](#campaign-configuration-values). The Bootstrap GDRs pass every rule: there is exactly
one AgencyArchetype, `agency`, and exactly one EconomyParameters GDR, `economy`, whose six values are whole numbers of
at least 0; each of the four Upgrades has exactly `name`, `price`, `effect`, and `increment`, with a whole `price` and
`increment` of at least 0 and an `effect` among the four effect identifiers; and `standard` supplies whole values of at
least 0 for `starting_money` and `starting_funding`. Each of the following test changes independently makes the Game
build defective, so no Campaign is created from it: setting `weapon_damage`'s `effect` to `agent_health`; removing
`transport_cap`'s `increment`; adding a property `max_acquisitions` to `agent_cap`; setting `training_cap`'s `price` to
−1; setting `economy`'s `hire_cost` to 12.5; adding a second EconomyParameters GDR; and setting `standard`'s
`starting_money` to −100.
