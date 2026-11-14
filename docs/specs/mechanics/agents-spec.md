# Agents

| Metadata    | Value                                                                                                                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | AGENT                                                                                                                                                                                           |
| Family      | Mechanics                                                                                                                                                                                       |
| Status      | Draft                                                                                                                                                                                           |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                                     |
| Owns        | What an Agent has, the Agent lifecycle, Current assignments and the transit rule, effective skill, Training, Agent creation and the initial roster, and the assignAgents and addAgents actions. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                                                  |

# Overview

This document defines what an [Agent](domain-model.md#glossary) has and can do on its own: every property of an Agent,
the Agent lifecycle, the Current assignments an Agent can have and every allowed change between them, the transit rule
that decides when an Agent starts working, the effective skill formula that every Combatant uses, how Training raises
skill, how every Agent is created, the initial roster, the Player action `assignAgents`, the cheat operation
`addAgents`, which of these values are Player-visible information, and the validation rules for the Game Data Records
(GDRs) it owns.

It refines Domain Model's Agent contract, i.e. [Agent](domain-model.md#agent),
[Current versus historical teams](domain-model.md#current-versus-historical-teams),
[Combatant Role Type](domain-model.md#combatant-role-type), and [Attribute bounds](domain-model.md#attribute-bounds),
with the properties, lifecycle, Current assignment changes, exhaustion cap, and formulas listed above.
[Numbers](../foundation/numbers.md) supplies whole-number arithmetic and the rounding operations. Among the Mechanics
specifications, this document depends only on Domain Model.

This document states what each Agent value is, its range, and its effect, and it lists every rule of another
specification that may change an Agent value. It does not own, e.g.:

- When and by how much a Battle changes an Agent: [Combat](combat.md) owns how a Battle lowers health and raises
  exhaustion and when an Agent is Killed in a Battle.
- How an Agent recovers: [Agent Recovery](agent-recovery.md) owns how health rises and exhaustion falls, and the move
  from Recovery to Standby.
- Hiring, dismissal, and the Agency's caps: [Economy and Upgrades](economy-and-upgrades.md) owns the `hireAgent` and
  `dismissAgents` Player actions, the [Agent cap](economy-and-upgrades.md#glossary), [Transport cap](economy-and-upgrades.md#glossary),
  and [Training cap](economy-and-upgrades.md#glossary), and the
  [Weapon damage effect](economy-and-upgrades.md#weapon-damage-effect) of the weapon damage Upgrade.

It also does not own, e.g., deployment to a Mission site, i.e. the `deployAgents` Player action and the return of
survivors, which belongs to [Missions](missions.md); assigning Agents to Investigations, which belongs to
[Investigations](investigations.md); or the order of every Turn advancement step, which belongs to
[Turn Advancement](turn-advancement.md). These are ownership pointers; this document relies on none of them.

The following features are out of scope and are not specified here: skill gained from Missions and Battles, exhaustion
gained from any Current assignment, readiness thresholds, forced withdrawal of an exhausted Agent, career statistics
beyond Participation history, transit durations that differ between Current assignments, and selection among several
AgentArchetypes. This list is exhaustive. With them out of scope, Training is the only way an Agent gains skill, only a Battle raises
exhaustion, and every transit takes one Advance turn.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Developer Access](../foundation/developer-access.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Domain Model](domain-model.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Combat](./combat.md)
- Used by [Economy and Upgrades](./economy-and-upgrades.md)
- Used by [Investigations](./investigations.md)
- Used by [Missions](./missions.md)
- Used by [Turn Advancement](./turn-advancement.md)
- Refined by [Agent Recovery](./agent-recovery.md)
- Refined by [Combat](./combat.md)
- Refined by [Economy and Upgrades](./economy-and-upgrades.md)

# Glossary

Agency, Agent, Current assignment, Task phase, Investigation, Mission site, Mission, Current team, Combatant, Combatant
Role Type, Enemy, and Participation history are defined by the [Domain Model glossary](domain-model.md#glossary).
Campaign instance, Instance ID, Archetype, Constants, State, and World history are defined by the
[Campaign State glossary](../foundation/campaign-state.md#glossary). GDR, Game build, Authoritative value, and Derived
value are defined by the [Core Concepts glossary](../foundation/core-concepts.md#glossary). Player-visible information,
Player action, Committed state, Turn, Turn-end state, Session controller, Autopilot AI, Player API, and Developer API
are defined by the [Engine Contract glossary](../foundation/engine-contract.md#glossary). Round down, Round up, and
Percent value are defined by the [Numbers glossary](../foundation/numbers.md#glossary). Turn advancement step is
defined by the [Turn Advancement glossary](turn-advancement.md#glossary). Battle is defined by the
[Combat glossary](combat.md#glossary), and Agent cap, Transport cap, and Training cap by the
[Economy and Upgrades glossary](economy-and-upgrades.md#glossary). The Turn advancement step named Training, under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps), applies the rule under
[Training growth](#training-growth). The Mission site state named Deployed is owned by [Missions](missions.md); a
Mission site is Deployed exactly when the Agents of its Mission's Current team are Deployed to it.

## Combatant attributes

What makes an Agent or an Enemy able to work and to fight, and how worn down it is.

| Term            | Definition                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Skill           | How capable a Combatant is at its work and in a Battle, as a whole number.                                                                                                                                   |
| Effective skill | A Combatant's skill as reduced by its lost health and its exhaustion; the value every rule uses when a Combatant works or fights.                                                                            |
| Health          | How much more harm a Combatant can take, from zero up to its maximum health under [Attribute bounds](domain-model.md#attribute-bounds); an Agent whose health reaches zero is dead.                          |
| Maximum health  | The health of an unwounded Combatant.                                                                                                                                                                        |
| Exhaustion      | How worn down a Combatant is, as a whole number from zero up to the exhaustion cap; beyond a free amount it lowers effective skill. The specifications that raise or lower it own accumulation and recovery. |
| Weapon damage   | The typical health a Combatant's hit removes, before the random spread.                                                                                                                                      |

## Agent Current assignments

The Current assignments that are neither an Investigation nor a Mission, and the one that places an Agent in a Mission.

| Term        | Definition                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standby     | The Current assignment of an Agent waiting for orders.                                                                                                                                      |
| Contracting | The Current assignment of an Agent earning money for the Agency.                                                                                                                            |
| Training    | The Current assignment of an Agent gaining skill.                                                                                                                                           |
| Recovery    | The Current assignment of an Agent regaining health.                                                                                                                                        |
| Deployed    | Sent to a Mission site as a member of its Mission's Current team, and fighting there in the next Advance turn. An Agent becomes Deployed the moment the player deploys it, without transit. |

# Agent GDRs

This document owns the two GDR Types below and states which rule reads each property. A rule in this document names
the property it reads and never copies a GDR value; only the [Acceptance examples](#acceptance-examples) show values.
The GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md) and the
YAML files it names.

## AgentArchetype

An AgentArchetype is the Archetype of every Agent. The following property table is exhaustive apart from the `id` and
`type` that every GDR has.

| Property | Meaning                                                               | Read by                                                   |
| -------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the kind of Agent.                                | [Player-visible information](#player-visible-information) |
| `skill`  | The skill of a newly created Agent.                                   | [Agent creation](#agent-creation)                         |
| `health` | The maximum health of a newly created Agent, and also its health.     | [Agent creation](#agent-creation)                         |
| `weapon` | A reference to the Weapon GDR a newly created Agent is equipped with. | [Agent creation](#agent-creation)                         |

## AgentParameters

AgentParameters bundles the scalar values this document's rules read, and two values that [Combat](combat.md) reads.
The following property table is exhaustive apart from `id` and `type`.

| Property                           | Meaning                                                                                                 | Read by                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `initial_roster_size`              | How many Agents the initial Campaign state contains.                                                    | [Initial roster](#initial-roster)           |
| `exhaustion_cap`                   | The greatest exhaustion any Combatant can have.                                                         | [Attribute ranges](#attribute-ranges)       |
| `exhaustion_free_points`           | The exhaustion up to which effective skill is not reduced.                                              | [Effective skill](#effective-skill)         |
| `skill_penalty_pct_per_exhaustion` | A Percent value: the percent of skill lost for each point of exhaustion above `exhaustion_free_points`. | [Effective skill](#effective-skill)         |
| `exhaustion_per_attack`            | The exhaustion an attacking Combatant gains.                                                            | [Combat](combat.md), which owns its meaning |
| `exhaustion_per_defense`           | The exhaustion a defending Combatant gains.                                                             | [Combat](combat.md), which owns its meaning |
| `training_skill_gain_per_turn`     | The skill an Agent on Training gains in one Advance turn.                                               | [Training growth](#training-growth)         |

## Weapon properties this document reads

A Weapon GDR describes damage configuration, under [Weapons and upgrades](domain-model.md#weapons-and-upgrades) in
Domain Model; [Combat](combat.md) owns the Weapon Type. This document reads only its `damage` property, the weapon
damage of a newly created Agent equipped with that Weapon, under [Agent creation](#agent-creation).

## Agent GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDRs
this document owns. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it,
and the violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One AgentArchetype:** The Game build supplies exactly one AgentArchetype. Every Agent has it as its Archetype, so
   no rule selects among AgentArchetypes.
2. **One AgentParameters:** The Game build supplies exactly one AgentParameters GDR.
3. **Exact properties:** The AgentArchetype and the AgentParameters GDR each have exactly the properties their table
   above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
4. **Archetype values are valid:** The AgentArchetype's `skill` is a whole number of at least 0, its `health` is a
   whole number of at least 1, and its `weapon` references a Weapon GDR the Game build supplies.
5. **Parameters are valid:** Each of `initial_roster_size`, `exhaustion_cap`, `exhaustion_free_points`,
   `skill_penalty_pct_per_exhaustion`, `exhaustion_per_attack`, `exhaustion_per_defense`, and
   `training_skill_gain_per_turn` is a whole number of at least 0.

[Combat](combat.md) may state further rules on `exhaustion_per_attack` and `exhaustion_per_defense` and on the Weapon
`damage` it owns, e.g. that `damage` is a whole number of at least 1 under
[Combat GDR validation](combat.md#combat-gdr-validation). These rules guarantee that every newly created Agent satisfies
[Attribute bounds](domain-model.md#attribute-bounds) and that the effective skill formula never divides by zero.

# Agent properties

**Proposed rule:** An Agent is a Campaign instance whose Archetype is the AgentArchetype. Its Archetype reference is set
when it is created and never changes. Its Constants and State have exactly the following properties. This table is
exhaustive.

| Property              | Part      | Value                                                                                                                                                                                                  | Classification and range                                                                                                                                   |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agency                | Constants | An Immutable reference to the Agency that employs the Agent.                                                                                                                                           | Authoritative value. Always the Campaign's one Agency.                                                                                                     |
| Turn hired            | Constants | The turn number of the Turn in which the Agent was created.                                                                                                                                            | Authoritative value. A whole number of at least 1.                                                                                                         |
| Lifecycle             | State     | Serving, Killed, or Dismissed, under [Agent lifecycle](#agent-lifecycle).                                                                                                                              | Authoritative value.                                                                                                                                       |
| Skill                 | State     | The Agent's skill.                                                                                                                                                                                     | Authoritative value. A whole number of at least 0, with no upper bound, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities). |
| Health                | State     | The Agent's current health.                                                                                                                                                                            | Authoritative value. A whole number under [Attribute ranges](#attribute-ranges).                                                                           |
| Maximum health        | State     | The Agent's maximum health.                                                                                                                                                                            | Authoritative value. A whole number of at least 1. No rule in scope changes it after creation.                                                             |
| Exhaustion            | State     | The Agent's exhaustion.                                                                                                                                                                                | Authoritative value. A whole number under [Attribute ranges](#attribute-ranges).                                                                           |
| Weapon                | State     | A reference to the Weapon GDR the Agent is equipped with.                                                                                                                                              | Authoritative value. Always resolves to a Weapon GDR the Game build supplies. No rule in scope changes it after creation.                                  |
| Weapon damage         | State     | The Agent's weapon damage.                                                                                                                                                                             | Authoritative value. A whole number of at least 1. Only the rules under [Modifiable values](#modifiable-values) change it.                                 |
| Current assignment    | State     | Present exactly when the Agent is Serving: one of Standby, Contracting, Training, Recovery, an Investigation with a Mutable reference to it, or Deployed with a Mutable reference to the Mission site. | Authoritative value, under [Orders and Task phase](#orders-and-task-phase).                                                                                |
| Task phase            | State     | Present exactly when the Agent is Serving: At assignment or In transit.                                                                                                                                | Authoritative value, under [Orders and Task phase](#orders-and-task-phase).                                                                                |
| Participation history | State     | The Investigations and Missions the Agent took part in and has left.                                                                                                                                   | Authoritative value, under [Participation history records](#participation-history-records).                                                                |

Skill, health, maximum health, exhaustion, Weapon, and weapon damage are the properties the
[Combatant Role Type](domain-model.md#combatant-role-type) requires; Weapon and weapon damage together are the equipped
weapon values. An Agent also has two Derived values, which are never stored: its effective skill, under
[Effective skill](#effective-skill), and whether it can be ordered, under
[Agents that can be ordered](#agents-that-can-be-ordered). An Agent has no Turn series.

**Retention:** An Agent keeps every property above for the whole Campaign, whatever its lifecycle state, so that every
reference to it resolves, e.g. from a Battle result or a Participation history. A Killed or Dismissed Agent no longer
participates in current gameplay and is retained in World history with its final values, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation) in Campaign State. No
Agent is ever removed.

## Participation history records

**Proposed rule:** Whenever an Agent stops belonging to the Current team of an Investigation or of a Mission, for any
reason, that Investigation or Mission is added to the Agent's Participation history, unless it is already there. E.g.,
the reason may be that the player orders the Agent elsewhere, that the Investigation completes, or that the Mission's
Battle is fought. Nothing is ever removed from a Participation history, and recording it neither assigns nor
reserves the Agent, under [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain
Model. [Investigations](investigations.md) and [Missions](missions.md) own when an Agent leaves each Current team.

# Agent lifecycle

**Proposed rule:** An Agent is in exactly one of the lifecycle states Serving, Killed, and Dismissed. The set is
exhaustive. Every Agent is Serving when it is created. The transition table is:

| Source state | Target state | Trigger                                                | Condition                                                                                                             |
| ------------ | ------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Serving      | Killed       | The Agent's health reaches zero in a Battle.           | The Agent is Deployed. [Combat](combat.md) owns when health reaches zero.                                             |
| Serving      | Dismissed    | The `dismissAgents` Player action dismisses the Agent. | The preconditions of `dismissAgents`, which [Economy and Upgrades](economy-and-upgrades.md) owns, hold for the Agent. |

Every transition not listed is impossible; e.g., a Killed Agent never becomes Serving again, and a Dismissed Agent
cannot be Killed. Killed and Dismissed are final.

The following invariants hold in every Committed state:

- A Serving Agent has exactly one Current assignment and exactly one Task phase. A Killed or Dismissed Agent has
  neither, and belongs to no Current team. Killed and Dismissed are lifecycle states, not Current assignments.
- Within [Attribute bounds](domain-model.md#attribute-bounds), a Serving Agent has positive health, a Killed Agent has
  zero health, and a Dismissed Agent has positive health.

When an Agent becomes Killed or Dismissed, its Current assignment and Task phase are removed in the same Player action,
and the Investigation or Mission it belonged to, if any, is recorded under
[Participation history records](#participation-history-records).

# Attributes and effectiveness

## Attribute ranges

**Proposed rule:** In every Committed state, every Combatant, i.e. every Agent and every Enemy, satisfies these ranges
in addition to [Attribute bounds](domain-model.md#attribute-bounds) in Domain Model:

- Exhaustion is a whole number from 0 to the `exhaustion_cap` of AgentParameters, both included.
- Health is a whole number from 0 to maximum health, both included.

Any rule of any specification that would raise exhaustion above `exhaustion_cap` raises it to exactly `exhaustion_cap`
instead, and any rule that would lower it below 0 lowers it to exactly 0 instead. Any rule that would lower health
below 0 lowers it to exactly 0 instead, and any rule that would raise health above maximum health raises it to exactly
maximum health instead. These clamps are part of this document's contract; the rule that changes the value applies
them as part of its own change. E.g., a Combatant with exhaustion 99 that would gain 3 exhaustion with an
`exhaustion_cap` of 100 has exhaustion 100.

## Effective skill

**Inherited behavior:** A Combatant's effective skill is a Derived value computed by this formula. It is shared by
Agents and Enemies through the [Combatant Role Type](domain-model.md#combatant-role-type), and every rule that uses a
Combatant's capability, e.g. Investigation progress or a Battle's hit probability, reads effective skill rather than
skill.

```text
penalty factor  = max(0, 100 − p × max(0, exhaustion − f))
effective skill = round down( skill × health × penalty factor / (maximum health × 100) )
```

Inputs:

| Symbol         | Meaning                                                | Unit and domain                                                   |
| -------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| skill          | The Combatant's skill.                                 | Skill points; a whole number of at least 0.                       |
| health         | The Combatant's health.                                | Health points; a whole number from 0 to maximum health.           |
| maximum health | The Combatant's maximum health.                        | Health points; a whole number of at least 1.                      |
| exhaustion     | The Combatant's exhaustion.                            | Exhaustion points; a whole number from 0 to `exhaustion_cap`.     |
| p              | `skill_penalty_pct_per_exhaustion` of AgentParameters. | Percent value per exhaustion point; a whole number of at least 0. |
| f              | `exhaustion_free_points` of AgentParameters.           | Exhaustion points; a whole number of at least 0.                  |

Evaluation and rounding: the formula is evaluated exactly, under [Exact evaluation](../foundation/numbers.md#exact-evaluation)
in Numbers, and is rounded exactly once, with Round down under [Rounding](../foundation/numbers.md#rounding), at the
end. The penalty
factor is a whole number, so it needs no rounding; no other intermediate result is rounded. The divisor is never zero,
because maximum health is at least 1.

Penalty clamp: when `p × max(0, exhaustion − f)` exceeds 100, the penalty factor is 0, not negative, and the effective
skill is 0. With an exhaustion at most `f`, the penalty factor is exactly 100 and exhaustion has no effect.

Range: the result is a whole number from 0 to skill, both included, because health divided by maximum health and the
penalty factor divided by 100 each lie from 0 to 1. A Combatant with full health and an exhaustion at most `f` has an
effective skill equal to its skill. A Combatant with zero health, e.g. a Killed Agent, has an effective skill of 0.

Effective skill is never stored. Whenever a rule reads it, it is computed from the Combatant's values at that moment, so
it follows every change of skill, health, or exhaustion at once, under
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract. Which
moment's values a Turn advancement step reads is owned by [Turn Advancement](turn-advancement.md).

## Changes to attributes

**Proposed rule:** The following table is the exhaustive list of rules that change an Agent's attributes after its
creation. A rule not listed here changes none of them.

| Value          | Raised by                                                                                                               | Lowered by                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Skill          | [Training growth](#training-growth), in this document                                                                   | No rule                             |
| Health         | [Agent Recovery](agent-recovery.md)                                                                                     | [Combat](combat.md), in a Battle    |
| Maximum health | No rule                                                                                                                 | No rule                             |
| Exhaustion     | [Combat](combat.md), in a Battle, by `exhaustion_per_attack` and `exhaustion_per_defense`                               | [Agent Recovery](agent-recovery.md) |
| Weapon damage  | The [Weapon damage effect](economy-and-upgrades.md#weapon-damage-effect), under [Modifiable values](#modifiable-values) | No rule                             |

No Current assignment raises exhaustion: Standby, Contracting, Training, Recovery, and Investigations leave it
unchanged. Each specification named in the table applies the clamps under [Attribute ranges](#attribute-ranges).

# Modifiable values

**Proposed rule:** Weapon damage is the only Agent value that an Upgrade may change. It is an individual value of each
Agent, not an Agency value. [Economy and Upgrades](economy-and-upgrades.md) refines this section with how the
[Weapon damage effect](economy-and-upgrades.md#weapon-damage-effect) raises the weapon damage of Serving Agents and of Agents created later, under
[Agent creation](#agent-creation). No Upgrade changes skill, health, maximum health, exhaustion, or Weapon.

# Current assignments and transit

## Orders and Task phase

**Proposed rule:** The Current assignment of a Serving Agent is exactly one of the following, and this list is
exhaustive: Standby; Contracting; Training; Recovery; an Investigation, with a reference to that Investigation; and
Deployed, with a reference to the Mission site the Agent is Deployed to. Task phase is either At assignment or In
transit. An Agent In transit keeps the Current assignment it is travelling to; transit is not a second Current
assignment. An Agent belongs to the Current team of an Investigation or of a Mission exactly as
[Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain Model states, including
while In transit.

A Deployed Agent is always At assignment, because deployment has no transit under [Transit rule](#transit-rule). In
every Committed state, the Mission site that a Deployed Agent's Current assignment references has a Mission whose
Current team contains that Agent.

## Agents that can be ordered

**Proposed rule:** An Agent can be ordered exactly when all of the following hold:

1. It is Serving.
2. Its Task phase is At assignment.
3. Its Current assignment is Standby, Contracting, Training, or an Investigation.

An Agent on Recovery, an Agent In transit, and a Deployed Agent therefore cannot be ordered, and neither can a Killed or
Dismissed Agent. Whether an Agent can be ordered is a Derived value. Every Player action that changes an Agent's Current
assignment requires that the Agent can be ordered: `assignAgents` under [Assigning Agents](#assigning-agents), and the
Player actions of [Investigations](investigations.md) and [Missions](missions.md) that assign Agents to an Investigation
or deploy them to a Mission site, which link this section. `dismissAgents`, which ends the Current assignment instead of
changing it, has its own precondition, owned by [Economy and Upgrades](economy-and-upgrades.md).

## Current assignment changes

**Proposed rule:** The following table lists every allowed change of a Serving Agent's Current assignment or Task
phase, with what triggers it and which specification owns the trigger. A Current assignment of "Investigation" in the
table means an Investigation with its reference.

| From                                                               | To                                                                        | Trigger and who triggers it                                                                                         | Owner of the trigger and its conditions                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Standby, Contracting, Training, or an Investigation; At assignment | Standby, Contracting, or Training, other than the current one; In transit | The player orders it, through the `assignAgents` Player action.                                                     | This document, under [Assigning Agents](#assigning-agents) |
| Standby, Contracting, Training, or an Investigation; At assignment | An Investigation; In transit                                              | The player starts an Investigation with it or adds it to one, through a Player action of Investigations.            | [Investigations](investigations.md)                        |
| Standby, Contracting, Training, or an Investigation; At assignment | Deployed to a Mission site; At assignment                                 | The player deploys it, through the `deployAgents` Player action.                                                    | [Missions](missions.md)                                    |
| Any Current assignment; In transit                                 | The same Current assignment; At assignment                                | Advance turn, in the Transit step.                                                                                  | This document, under [Transit rule](#transit-rule)         |
| An Investigation; At assignment                                    | Standby; In transit                                                       | Advance turn: the Investigation completes in the Investigation progress step.                                       | [Investigations](investigations.md)                        |
| Deployed; At assignment                                            | Recovery; In transit                                                      | Advance turn: the Agent survives the Battle in the Mission resolution step with health below its maximum health.    | [Missions](missions.md)                                    |
| Deployed; At assignment                                            | Standby; In transit                                                       | Advance turn: the Agent survives the Battle in the Mission resolution step with health equal to its maximum health. | [Missions](missions.md)                                    |
| Recovery; At assignment                                            | Standby; At assignment                                                    | Advance turn: the Agent's health reaches its maximum health in the Agent recovery step.                             | [Agent Recovery](agent-recovery.md)                        |

Every change not listed is impossible; e.g., an Agent on Recovery cannot be ordered to Contracting, a Deployed Agent
cannot be recalled, and an Agent In transit cannot be ordered anywhere. Recalling an Agent from Contracting, Training,
or an Investigation is ordering it to Standby.

A Serving Agent's Current assignment and Task phase also end, without a replacement, when it leaves the Serving
lifecycle state under [Agent lifecycle](#agent-lifecycle): a Deployed Agent that is Killed in a Battle, and an Agent
that is dismissed under the preconditions of `dismissAgents`, which [Economy and Upgrades](economy-and-upgrades.md)
owns. A new Agent starts on Standby: At assignment when it belongs to the
[Initial roster](#initial-roster), and In transit when it is created during play under [Agent creation](#agent-creation).

## Transit rule

**Proposed rule:** This rule decides when an Agent with a new Current assignment starts working. It is owned here and
applied by every Turn advancement step under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), which
[Turn Advancement](turn-advancement.md) owns. The following statements are complete:

1. **Starting In transit:** Every new Current assignment starts In transit, with three exceptions: an Agent becomes
   Deployed At assignment at once; an Agent on Recovery whose health reaches maximum health becomes Standby At
   assignment at once; and an Agent of the [Initial roster](#initial-roster) starts At assignment.
2. **Arrival:** An Agent that is In transit in the Turn-end state of an Advance turn, i.e. in the Committed state in
   which that Advance turn began, becomes At assignment in the Transit step of that Advance turn. Completing its transit
   is all that happens to it in that Advance turn: it earns no income, trains nothing, adds no Investigation progress,
   fights in no Battle, and recovers neither health nor exhaustion.
3. **Departure:** An Agent that becomes In transit during an Advance turn is still In transit in the Committed state
   after that Advance turn. The Transit step applies only to Agents that were In transit in the Turn-end state.

Wherever the rule of a Turn advancement step after Transit applies to Agents At assignment, it means Agents that were
At assignment in the Turn-end state and that are still At assignment when the step begins. There are two exceptions to
statement 2:

- **Upkeep:** An Agent that arrives in the Transit step is still counted in the Upkeep step, because upkeep is a cost the
  Agency pays for every Serving Agent, not something the Agent does. [Economy and Upgrades](economy-and-upgrades.md) owns
  that rule.
- **Destination ends:** When the Current assignment an Agent has just arrived at ends because of something other than
  the Agent's own work, its Current assignment still changes as the owning rule states. E.g., an Agent that arrives at an
  Investigation in the Transit step adds no progress, but when the other members' progress completes that Investigation
  in the same Advance turn, the arrived Agent goes to Standby, In transit, with the rest of the Current team, under
  [Investigations](investigations.md).

**Deployed:** Deploying to a Mission site is the one order that does not start In transit. The moment the player
deploys, the selected Agents are Deployed to that Mission site At assignment, and the Battle is fought in the next
Advance turn, under [Missions](missions.md). The way back does take transit: survivors become In transit during that
Advance turn, so under statement 3 they are still In transit when it ends, and they arrive in the Advance turn after it.

**Informative rationale:** No GDR supplies a transit duration, so every transit takes exactly one Advance turn. Every
order other than deployment therefore costs one Advance turn before the Agent works, and returning from a Mission costs
one Turn during which the Agent can do nothing.

# Training growth

**Proposed rule:** In the Training step of every Advance turn, each Agent that is Serving, whose Current assignment is
Training, and that was At assignment in the Turn-end state, gains skill:

```text
skill after = skill before + training_skill_gain_per_turn
```

Inputs: skill before is the Agent's skill at the start of the Training step, a whole number of at least 0;
`training_skill_gain_per_turn` is the value of AgentParameters, a whole number of at least 0. No rounding occurs,
because every term is a whole number. The result is a whole number of at least skill before; skill has no upper bound.
An Agent that arrived at Training in the Transit step of the same Advance turn gains nothing, under
[Transit rule](#transit-rule). Training changes no other value of the Agent; in particular it raises no exhaustion.

The gain of one Agent does not depend on any other Agent, so the result is the same whatever order an implementation
processes the Agents in. The [Training cap](economy-and-upgrades.md#glossary) limits how many Agents can be on
Training, not how much skill each gains.

# Agent creation

**Proposed rule:** Every Agent is created by this rule, whichever rule causes the creation: the
[Initial roster](#initial-roster), the `hireAgent` Player action of [Economy and Upgrades](economy-and-upgrades.md), or
the cheat operation under [Adding Agents](#adding-agents). Each new Agent has a fresh Instance ID under
[Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following
initial values, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in
Campaign State. This table is exhaustive.

| Value                 | Initial value                                                                                     | Source                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Archetype reference   | The AgentArchetype.                                                                               | The one AgentArchetype GDR, under [Agent GDR validation](#agent-gdr-validation). |
| Agency                | The Campaign's Agency.                                                                            | Campaign state.                                                                  |
| Turn hired            | The turn number of the current Turn.                                                              | Campaign state.                                                                  |
| Lifecycle             | Serving.                                                                                          | This rule.                                                                       |
| Skill                 | The AgentArchetype's `skill`.                                                                     | `skill` of the AgentArchetype.                                                   |
| Maximum health        | The AgentArchetype's `health`.                                                                    | `health` of the AgentArchetype.                                                  |
| Health                | The AgentArchetype's `health`.                                                                    | `health` of the AgentArchetype.                                                  |
| Exhaustion            | 0.                                                                                                | This rule.                                                                       |
| Weapon                | The Weapon GDR that the AgentArchetype's `weapon` references.                                     | `weapon` of the AgentArchetype.                                                  |
| Weapon damage         | The `damage` of that Weapon GDR.                                                                  | `damage` of the Weapon GDR.                                                      |
| Current assignment    | Standby.                                                                                          | This rule.                                                                       |
| Task phase            | At assignment for an Agent of the initial roster; In transit for every Agent created during play. | This rule, under [Transit rule](#transit-rule).                                  |
| Participation history | Empty.                                                                                            | This rule.                                                                       |

Economy and Upgrades refines the initial weapon damage for an Agent created after an Upgrade has been acquired, under
[Weapon damage effect](economy-and-upgrades.md#weapon-damage-effect); that is an ownership pointer, and the table above
states the value before any Upgrade has been acquired. The new Agent joins the Agency's roster of Agents. No Campaign configuration value changes any initial value above.
Creating an Agent changes nothing else; e.g., any cost, and the [Agent cap](economy-and-upgrades.md#glossary), belong to the rule that causes the creation.

## Initial roster

**Proposed rule:** The initial Campaign state contains exactly `initial_roster_size` Agents, the value of
AgentParameters, and no other Agent, as [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model
requires. Each is created under [Agent creation](#agent-creation) with Task phase At assignment and Turn hired equal to
the turn number of the Campaign's first Turn. Because no Upgrade has been acquired at campaign creation, each has the
Weapon `damage` as its weapon damage. Every Agent of the initial roster can be ordered in the first Turn. An
`initial_roster_size` of 0 is valid and gives an empty roster.

# Assigning Agents

**Proposed rule:** The Player action `player.actions.assignAgents(agents, assignment)` orders Agents to Standby,
Contracting, or Training.

Parameters:

| Parameter    | Meaning                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `agents`     | A list of Instance IDs, each meant to identify one Agent of the Campaign.                          |
| `assignment` | The target Current assignment: exactly one of the values `Standby`, `Contracting`, and `Training`. |

Preconditions owned by this document. The action is rejected, as a whole, when any of the following holds:

1. `agents` is empty.
2. `agents` contains the same Instance ID more than once.
3. An Instance ID in `agents` identifies no Agent of the Campaign.
4. `assignment` is not one of `Standby`, `Contracting`, and `Training`.
5. An Agent in `agents` cannot be ordered, under [Agents that can be ordered](#agents-that-can-be-ordered).
6. An Agent in `agents` already has `assignment` as its Current assignment.

**Training cap:** [Economy and Upgrades](economy-and-upgrades.md) refines this action with one further precondition,
that ordering the Agents to Training does not raise the number of Agents whose Current assignment is Training above the
[Training cap](economy-and-upgrades.md#glossary). That document owns the precondition, the value of the cap, and which
Agents it counts. Other preconditions on every Player action, e.g. that the Campaign has no Campaign ending, are owned
by [Panic and Endings](panic-and-endings.md) and [Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at
least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation
is the implementer's choice. A rejected action changes nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract. Because
every value this document owns is Player-visible information, the error reveals nothing hidden.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same
Turn, to every Agent in `agents`:

- Its Current assignment becomes `assignment` and its Task phase becomes In transit, under
  [Transit rule](#transit-rule).
- If its Current assignment was an Investigation, it leaves that Investigation's Current team, and the Investigation is
  recorded under [Participation history records](#participation-history-records). What leaving does to the
  Investigation, e.g. that it is Abandoned when its last member leaves, is owned by [Investigations](investigations.md).

Nothing else changes; e.g., no money is spent, and skill, health, and exhaustion are unchanged. The Agents arrive in
the next Advance turn and start working in the Advance turn after it, under [Transit rule](#transit-rule).

# Cheat operations

## Adding Agents

**Proposed rule:** The cheat operation `developer.actions.addAgents(count)` adds Agents to the Agency. It follows every
rule under [Cheat operations](../foundation/developer-access.md#cheat-operations) in Developer Access, including that
only the Session controller can call it, only with Dev mode enabled, and that each successful call is one Player action
recorded as one Timeline entry.

| Parameter | Meaning                                               |
| --------- | ----------------------------------------------------- |
| `count`   | How many Agents to add: a whole number of at least 1. |

Validation: the operation is rejected, and changes nothing, when `count` is not a whole number or is less than 1. No
upper limit applies.

Effect: the operation creates `count` Agents, each under [Agent creation](#agent-creation) exactly as hiring creates
one, so each is Serving, on Standby, and In transit, with Turn hired equal to the current turn number. Unlike hiring,
it spends no money and ignores the [Agent cap](economy-and-upgrades.md#glossary): it succeeds even when the Agency's money is below the hiring cost or the
Agency already employs as many Agents as the Agent cap allows. Nothing else changes.

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Every value is Player-visible from the moment it exists, without a reveal condition, for
every Agent whatever its lifecycle state.

| Value                                                                                                            | Player-visible information |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| An Agent's Instance ID, its AgentArchetype including the AgentArchetype's `name`, its Agency, and its Turn hired | Yes                        |
| An Agent's lifecycle state                                                                                       | Yes                        |
| An Agent's skill, health, maximum health, exhaustion, Weapon, and weapon damage                                  | Yes                        |
| An Agent's effective skill                                                                                       | Yes                        |
| An Agent's Current assignment, including the Investigation or Mission site it references, and its Task phase     | Yes                        |
| Whether an Agent can be ordered                                                                                  | Yes                        |
| An Agent's Participation history                                                                                 | Yes                        |
| Every property of the AgentArchetype and of AgentParameters                                                      | Yes                        |

**Unknown versus absent:** No value this document owns is hidden, so Player API never reports one as unknown. A Killed
or Dismissed Agent has no Current assignment and no Task phase; Player API reports them as absent, and the visible
lifecycle state explains why. An empty Participation history is reported as empty, not as absent.

# Edge cases and failure behavior

- **Exhaustion at the free amount:** An exhaustion exactly equal to `exhaustion_free_points` gives a penalty factor of
  100; the first point above it lowers the penalty factor by `skill_penalty_pct_per_exhaustion`
  ([Effective skill](#effective-skill)).
- **Penalty below zero:** When `skill_penalty_pct_per_exhaustion × (exhaustion − exhaustion_free_points)` exceeds 100,
  the penalty factor is 0 and effective skill is 0; the Combatant is still alive and keeps its skill
  ([Effective skill](#effective-skill)).
- **Exhaustion at the cap:** A rule that would raise exhaustion above `exhaustion_cap` leaves it at `exhaustion_cap`
  ([Attribute ranges](#attribute-ranges)).
- **Zero health:** A Serving Agent never has zero health in a Committed state: the Battle that brings its health to zero
  makes it Killed ([Agent lifecycle](#agent-lifecycle)). An Enemy with zero health has an effective skill of 0, and what
  that means in a Battle belongs to [Combat](combat.md).
- **Recovery completion:** An Agent on Recovery whose health reaches maximum health becomes Standby, At assignment, at
  once, without transit, under [Current assignment changes](#current-assignment-changes); how and when health rises
  belongs to [Agent Recovery](agent-recovery.md).
- **Destination ends during transit:** An Agent In transit to an Investigation in the Turn-end state arrives in the
  Transit step before any Investigation can complete, so no Agent is In transit to an Investigation that ends. An Agent
  that arrives and whose Investigation then completes goes to Standby, In transit ([Transit rule](#transit-rule)).
- **Arrival and upkeep:** An arriving Agent does nothing else in its arrival Advance turn but is still counted for
  upkeep ([Transit rule](#transit-rule)).
- **Conflicting Current assignments:** A Serving Agent always has exactly one Current assignment; no Player action can
  give it a second one. An Agent listed twice in one `assignAgents` call is rejected
  ([Assigning Agents](#assigning-agents)).
- **Ordering to the current Current assignment:** `assignAgents` with an Agent already on the target Current assignment is
  rejected rather than restarting its transit ([Assigning Agents](#assigning-agents)).
- **Mixed valid and invalid Agents:** One invalid Agent rejects the whole `assignAgents` call; no listed Agent changes
  ([Assigning Agents](#assigning-agents)).
- **Deployed Agents:** A Deployed Agent is At assignment but cannot be ordered, cannot be dismissed, and is not recalled
  by any Player action ([Agents that can be ordered](#agents-that-can-be-ordered)).
- **Empty roster:** A Campaign with no Serving Agent is valid; `assignAgents` then has no Agent it can order. Defeat
  conditions belong to [Panic and Endings](panic-and-endings.md).
- **Invalid GDRs:** A Game build with no AgentArchetype, two AgentArchetypes, an AgentArchetype `health` of 0, a missing or extra property, or an
  unresolved `weapon` fails [Agent GDR validation](#agent-gdr-validation), and no Campaign is created from it. A
  Committed state violating an invariant of this document, e.g. a Serving Agent with no Current assignment, is an
  internal invariant violation, reported under
  [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a Campaign ending, `assignAgents`, `addAgents`, and Advance turn are
  rejected; [Panic and Endings](panic-and-endings.md) owns that rejection.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/agents/agent_archetypes.yaml`,
`content/agents/agent_parameters.yaml`, and `content/combat/weapons.yaml`, unless an example states a test GDR. The
values they read are:

| GDR                | Values read                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `field_agent`      | `name` Field agent; `skill` 100; `health` 30; `weapon` `sidearm`                                                                                                                                         |
| `agent_parameters` | `initial_roster_size` 4; `exhaustion_cap` 100; `exhaustion_free_points` 5; `skill_penalty_pct_per_exhaustion` 1; `exhaustion_per_attack` 1; `exhaustion_per_defense` 1; `training_skill_gain_per_turn` 1 |
| `sidearm`          | `damage` 10                                                                                                                                                                                              |

"The Advance turn ending turn t" is the Advance turn committed during Turn t; the Campaign starts in Turn 1. No
Upgrade has been acquired in any example. Effects owned by other specifications, e.g. income, are named only to show
when they apply; their amounts belong to those specifications.

## Effective skill computations

This example exercises [Effective skill](#effective-skill) and [Attribute ranges](#attribute-ranges). Each row is one
Combatant with `exhaustion_free_points` 5 and `skill_penalty_pct_per_exhaustion` 1, except the last row, which uses
the test value `skill_penalty_pct_per_exhaustion` 2.

| Skill | Health of maximum health | Exhaustion | Penalty factor                         | Computation                                            | Effective skill |
| ----- | ------------------------ | ---------- | -------------------------------------- | ------------------------------------------------------ | --------------- |
| 100   | 30 of 30                 | 0          | max(0, 100 − 1 × 0) = 100              | round down(100 × 30 × 100 / 3000) = round down(100)    | 100             |
| 100   | 15 of 30                 | 25         | max(0, 100 − 1 × 20) = 80              | round down(100 × 15 × 80 / 3000) = round down(40)      | 40              |
| 100   | 30 of 30                 | 5          | max(0, 100 − 1 × 0) = 100              | round down(100 × 30 × 100 / 3000) = round down(100)    | 100             |
| 100   | 30 of 30                 | 6          | max(0, 100 − 1 × 1) = 99               | round down(100 × 30 × 99 / 3000) = round down(99)      | 99              |
| 100   | 29 of 30                 | 0          | 100                                    | round down(100 × 29 × 100 / 3000) = round down(96.67…) | 96              |
| 130   | 22 of 30                 | 40         | max(0, 100 − 1 × 35) = 65              | round down(130 × 22 × 65 / 3000) = round down(61.97…)  | 61              |
| 100   | 30 of 30                 | 100        | max(0, 100 − 1 × 95) = 5               | round down(100 × 30 × 5 / 3000) = round down(5)        | 5               |
| 100   | 1 of 30                  | 100        | 5                                      | round down(100 × 1 × 5 / 3000) = round down(0.17…)     | 0               |
| 100   | 0 of 30                  | 0          | 100                                    | round down(0)                                          | 0               |
| 100   | 30 of 30                 | 60         | max(0, 100 − 2 × 55) = max(0, −10) = 0 | round down(0)                                          | 0               |

The second row is the rounding-once rule at work: the exact value 100 × 15/30 × 80/100 is 40. In the fifth and sixth
rows, rounding happens only at the end; rounding 29/30 or 65/100 first would be a violation of
[Exact evaluation](../foundation/numbers.md#exact-evaluation). The third and fourth rows are the boundary at
`exhaustion_free_points`. The last row shows the penalty clamp: the penalty factor is 0, never negative. Every result
lies from 0 to the Combatant's skill.

## Exhaustion and health clamps

This example exercises [Attribute ranges](#attribute-ranges). An Agent has exhaustion 99. In one Battle it attacks once
and defends once, so [Combat](combat.md) raises its exhaustion by `exhaustion_per_attack` 1 and `exhaustion_per_defense`
1; the result is 100, not 101, because `exhaustion_cap` is 100, and further attacks leave it at 100. Its effective skill
at full health is then 5, from the computations above. A second Combatant has health 3 and loses 10 health to one hit;
its health becomes 0, not −7.

## Initial roster

This example exercises [Initial roster](#initial-roster), [Agent creation](#agent-creation), and
[Agents that can be ordered](#agents-that-can-be-ordered). A new Campaign starts in Turn 1. Its initial Campaign state
contains exactly 4 Agents, each with a distinct fresh Instance ID and these values:

| Value                 | Each of the 4 Agents  |
| --------------------- | --------------------- |
| Archetype             | `field_agent`         |
| Agency                | The Campaign's Agency |
| Turn hired            | 1                     |
| Lifecycle             | Serving               |
| Skill                 | 100                   |
| Health                | 30                    |
| Maximum health        | 30                    |
| Exhaustion            | 0                     |
| Weapon                | `sidearm`             |
| Weapon damage         | 10                    |
| Current assignment    | Standby               |
| Task phase            | At assignment         |
| Participation history | Empty                 |
| Effective skill       | 100                   |
| Can be ordered        | Yes                   |

Each of them can be ordered in Turn 1, and all of these values are Player-visible information
([Player-visible information](#player-visible-information)).

## Transit: ordered to Contracting

This example exercises [Assigning Agents](#assigning-agents) and [Transit rule](#transit-rule). Agent a1 is on Standby,
At assignment, during Turn 5.

| Moment                                      | Current assignment | Task phase    | What happens to a1                                                                                            |
| ------------------------------------------- | ------------------ | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `assignAgents([a1], Contracting)` in Turn 5 | Contracting        | In transit    | The action succeeds; a1 can no longer be ordered in Turn 5.                                                   |
| Advance turn ending turn 5                  | Contracting        | At assignment | a1 arrives in the Transit step. It earns no contracting income in Agency income, and it is counted in Upkeep. |
| Turn 6                                      | Contracting        | At assignment | a1 can be ordered.                                                                                            |
| Advance turn ending turn 6                  | Contracting        | At assignment | a1 was At assignment in the Turn-end state, so Agency income counts it: its first contracting income.         |

A second `assignAgents([a1], Standby)` in Turn 5, after the first, is rejected, because a1 is In transit and cannot be
ordered; a1 stays on Contracting, In transit.

## Transit: hired Agent

This example exercises [Agent creation](#agent-creation) and [Transit rule](#transit-rule). During Turn 5 the player
hires one Agent through the `hireAgent` Player action of [Economy and Upgrades](economy-and-upgrades.md). The new Agent
a5 has Turn hired 5, skill 100, health 30 of 30, exhaustion 0, Weapon `sidearm`, weapon damage 10, and is on Standby,
In transit. During the rest of Turn 5, `assignAgents([a5], Training)` is rejected because a5 cannot be ordered. In the
Advance turn ending turn 5, a5 arrives in the Transit step and is counted in Upkeep; nothing else applies to it. In Turn
6, a5 is on Standby, At assignment, and can be ordered.

## Transit: returning survivors

This example exercises [Current assignment changes](#current-assignment-changes), [Transit rule](#transit-rule), and
[Agents that can be ordered](#agents-that-can-be-ordered). Agents a1 and a2, each on Standby, At assignment, with
health 30 of 30, are deployed to Mission site s1 during Turn 5 through the `deployAgents` Player action of
[Missions](missions.md).

| Moment                         | a1                                                                           | a2                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Right after deployment, Turn 5 | Deployed to s1, At assignment                                                | Deployed to s1, At assignment                                                 |
| Advance turn ending turn 5     | Fights in the Battle; ends with health 30 of 30; becomes Standby, In transit | Fights in the Battle; ends with health 18 of 30; becomes Recovery, In transit |
| Turn 6                         | Standby, In transit; cannot be ordered                                       | Recovery, In transit; cannot be ordered                                       |
| Advance turn ending turn 6     | Arrives in Transit; recovers no exhaustion                                   | Arrives in Transit; recovers no health                                        |
| Turn 7                         | Standby, At assignment; can be ordered                                       | Recovery, At assignment; cannot be ordered                                    |
| Advance turn ending turn 7     | Recovers exhaustion, under [Agent Recovery](agent-recovery.md)               | Recovers health for the first time, under [Agent Recovery](agent-recovery.md) |

During Turn 5, after deployment, `assignAgents([a1], Standby)` is rejected because a1 is Deployed and cannot be ordered.
In the Advance turn ending turn 5, a1 and a2 became In transit during the Advance turn, so both are still In transit
when it ends. Each has s1's Mission in its Participation history from the Advance turn ending turn 5 on.

## Transit: Deployed at once

This example exercises the Deployed exception under [Transit rule](#transit-rule). An Agent is deployed during Turn 9,
the last Turn before its Mission site would expire. It is Deployed, At assignment, immediately, so in the Turn-end state
of the Advance turn ending turn 9 it is At assignment and fights in that Advance turn's Mission resolution. Had
deployment started In transit, it would only have arrived in that Advance turn and could not have fought.

## Transit: Investigation started and completed

This example exercises [Transit rule](#transit-rule), including the destination-ends exception. During Turn 5 the
player starts an Investigation i1 with Agent a1 through a Player action of [Investigations](investigations.md); a1 is
on i1, In transit. In the Advance turn ending turn 5, a1 arrives and adds no progress; i1 gains its first progress in the
Advance turn ending turn 6. Separately, Agent a3 is added to an Active Investigation i2 during Turn 8 and arrives in the
Advance turn ending turn 8, in which the progress of the other members of i2 completes it. a3 added no progress, but
it leaves i2's Current team with the others, goes to Standby, In transit, and has i2 in its Participation history; it
arrives in the Advance turn ending turn 9.

## Training growth

This example exercises [Training growth](#training-growth), [Transit rule](#transit-rule), and
[Effective skill](#effective-skill). Agent a1 has skill 100, health 30 of 30, and exhaustion 0, on Standby, At
assignment, during Turn 5.

| Moment                                   | Current assignment, Task phase | Skill | Effective skill |
| ---------------------------------------- | ------------------------------ | ----- | --------------- |
| `assignAgents([a1], Training)` in Turn 5 | Training, In transit           | 100   | 100             |
| After the Advance turn ending turn 5     | Training, At assignment        | 100   | 100             |
| After the Advance turn ending turn 6     | Training, At assignment        | 101   | 101             |
| After the Advance turn ending turn 7     | Training, At assignment        | 102   | 102             |
| `assignAgents([a1], Standby)` in Turn 8  | Standby, In transit            | 102   | 102             |
| After the Advance turn ending turn 8     | Standby, At assignment         | 102   | 102             |

In the Advance turn ending turn 5, a1 arrives in Transit and gains nothing in Training. In each of the next two Advance
turns it gains `training_skill_gain_per_turn` 1. After it is recalled it keeps its skill of 102 and gains no more. Its
exhaustion stays 0 throughout, because Training raises no exhaustion. Two Agents on Training, At assignment, in the
same Advance turn each gain 1, independently of each other.

## Assigning Agents: rejections and recall

This example exercises [Assigning Agents](#assigning-agents) and
[Agents that can be ordered](#agents-that-can-be-ordered). During Turn 10: a1 is on Contracting, At assignment; a2 is
on Standby, In transit; a3 is on Recovery, At assignment; a4 is Deployed; a6 is Killed; a7 is on Investigation i1, At
assignment, together with a8. Each call is made on its own from this state, and each rejected call changes nothing:

| Call                               | Result                                                                                                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assignAgents([], Standby)`        | Rejected: `agents` is empty.                                                                                                                                                                       |
| `assignAgents([a1, a1], Standby)`  | Rejected: a1 is listed twice.                                                                                                                                                                      |
| `assignAgents([a1], Contracting)`  | Rejected: a1 is already on Contracting.                                                                                                                                                            |
| `assignAgents([a1, a2], Training)` | Rejected as a whole: a2 is In transit. a1 stays on Contracting, At assignment.                                                                                                                     |
| `assignAgents([a3], Standby)`      | Rejected: a3 is on Recovery.                                                                                                                                                                       |
| `assignAgents([a4], Standby)`      | Rejected: a4 is Deployed.                                                                                                                                                                          |
| `assignAgents([a6], Standby)`      | Rejected: a6 is Killed.                                                                                                                                                                            |
| `assignAgents([a1], Standby)`      | Succeeds: a1 is recalled to Standby, In transit.                                                                                                                                                   |
| `assignAgents([a7], Training)`     | Succeeds: a7 is on Training, In transit, has left i1's Current team, and has i1 in its Participation history. i1 keeps a8; what else happens to i1 belongs to [Investigations](investigations.md). |

## Adding Agents

This example exercises [Adding Agents](#adding-agents). During Turn 3, with Dev mode enabled and no Autopilot
engagement, the Session controller calls `developer.actions.addAgents(2)`. Two Agents are created, each with a fresh
Instance ID, Turn hired 3, skill 100, health 30 of 30, exhaustion 0, Weapon `sidearm`, weapon damage 10, Serving, on
Standby, In transit. The Agency's money is unchanged, and the call succeeds even when the Agency already employs as
many Agents as the Agent cap allows. It is one Player action and one Timeline entry. `addAgents(0)` and `addAgents(-1)`
are rejected and change nothing.

## Lifecycle and Current assignment structure

This example exercises [Agent lifecycle](#agent-lifecycle) and [Orders and Task phase](#orders-and-task-phase). Given
the fixture of [A. Valid relationships](domain-model.md#a-valid-relationships) in Domain Model, with a1 and a2 both
Serving, the fixture satisfies both sections: each Agent has exactly one Current assignment, an Investigation for a1 and
Deployed to s1 for a2, exactly one Task phase, In transit for a1 and At assignment for a2, and positive health.

Each row independently changes that fixture and describes an invalid state.

| Change                                                             | Violation                                                                               |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Mark a1 Killed while keeping its Current assignment and Task phase | [Agent lifecycle](#agent-lifecycle)                                                     |
| Give a1 both a Training and an Investigation Current assignment    | [Agent lifecycle](#agent-lifecycle) and [Orders and Task phase](#orders-and-task-phase) |
| Set the health of a1 to zero while a1 is Serving                   | [Agent lifecycle](#agent-lifecycle)                                                     |
| Make a2 Deployed to s1 and In transit                              | [Orders and Task phase](#orders-and-task-phase)                                         |
| Set the exhaustion of a1 above `exhaustion_cap`                    | [Attribute ranges](#attribute-ranges)                                                   |

After [C. Completion and later Participation history](domain-model.md#c-completion-and-later-participation-history)
in Domain Model, a1 and a2 are still Serving, each with one new valid Current assignment and Task phase, which
satisfies [Agent lifecycle](#agent-lifecycle).

## GDR validation

This example exercises [Agent GDR validation](#agent-gdr-validation). The Bootstrap GDRs pass every rule: there is
exactly one AgentArchetype, `field_agent`, with `skill` 100, `health` 30, and `weapon` `sidearm`, which the Game build
supplies, and exactly one AgentParameters GDR, whose seven values are whole numbers of at least 0. Each of the
following test changes independently makes the Game build defective, so no Campaign is created from it: adding a
second AgentArchetype; setting `field_agent`'s `health` to 0; setting its `weapon` to an identifier that no Weapon GDR
has; adding a property `rank` to `field_agent`; and setting `training_skill_gain_per_turn` to 0.5.
