# Agents

| Metadata    | Value                                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | AGENT                                                                                                                                                                                                                                                             |
| Family      | Mechanics                                                                                                                                                                                                                                                         |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                                                                                                       |
| Owns        | What an Agent has, the Combatant Role Type, Agent status, Assignments and the transit rule, effective skill, Training, work exhaustion, the start-work gate and Forced return, Agent creation and the initial roster, and the assignAgents and addAgents actions. |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md)                                                                                        |

# Overview

Agents are the player's main resource: an [Agent](domain-model.md#agency-and-agents) is an operative of the [Agency](domain-model.md#agency-and-agents) who can do
only one thing at a time, and changing what it does costs time. That one thing is its [Assignment](domain-model.md#agency-and-agents), e.g.
Contracting to earn money or Training to gain base skill. Standby and Training are in the Agency's base, and Contracting
and Investigations are away. Every trip to, from, or between away work costs an Advance turn In transit, and only an
Agent in base can be deployed to a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), so Agents away are not at hand when a Mission site appears.

How well an Agent works and fights is its effective skill: its base skill, lowered by lost current health and by exhaustion
above a free amount. Training raises base skill; work and [Combats](domain-model.md#combat) wear it down, so choosing an Assignment often
trades present output against future strength. An Agent is Serving until it is Killed in a Combat or Dismissed, and it is never
removed, so its record outlasts its service.

Agents builds on [Domain Model](domain-model.md): Domain Model says how an Agent connects to the Agency and its work, and
Agents says what one Agent is and how it works.

# Glossary

These terms are specific to Agents. General terms are in the [Domain Model glossary](domain-model.md#glossary); terms
about regaining health, [Combats](domain-model.md#combat), and the [Agency](domain-model.md#agency-and-agents)'s caps are in the [Agent Recovery](agent-recovery.md#glossary),
[Combat](combat.md#glossary), and [Economy and Upgrades](economy-and-upgrades.md#glossary) glossaries.

## Combatant attributes

What makes an [Agent](domain-model.md#agency-and-agents) or an [Enemy](domain-model.md#combat) able to work and to fight, and how worn down it is. The names follow one rule:

- **Base:** Base X is a lasting stored value, e.g. base skill, which only named rules change.
- **Effective:** Effective X is base X adjusted for the situation and is never stored, e.g. effective skill.
- **Current:** Current X is a value that is used up and restored, e.g. current health, and has no effective form.
- **GDR property:** A [GDR](../foundation/core-concepts.md#game-build-and-content) property `base_x` gives the starting value of base X, e.g. `base_health`.

| Term                    | Definition                                                                                                                                                                                                     | Prohibited synonyms                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Base skill              | How capable a [Combatant](domain-model.md#combat) is at its work and in a Combat, as a whole number, before its lost current health and its exhaustion reduce it.                                              | Skill, naming the stored value                                                                                                        |
| Effective skill         | A Combatant's base skill as reduced by its lost current health and its exhaustion; the value every rule uses when a Combatant works or fights.                                                                 |                                                                                                                                       |
| Base health             | The highest current health a Combatant can have.                                                                                                                                                               | Maximum health; max health; full health                                                                                               |
| Current health          | How much more harm a Combatant can take now, from zero up to its base health under [Attribute ranges](#attribute-ranges); an Agent whose current health reaches zero is dead.                                  | Hit points; hit-point; health, naming a Combatant value. Unqualified health remains valid in its general sense, e.g. Health recovery. |
| Exhaustion              | How worn down a Combatant is, as a whole number of at least zero with no upper bound; beyond a free amount it lowers effective skill. The specifications that raise or lower it own accumulation and recovery. | Fatigue                                                                                                                               |
| Base weapon damage      | The typical current health a Combatant's hit removes, as a stored whole number, before any adjustment for the situation and before the random spread.                                                          | Weapon damage, naming the stored value                                                                                                |
| Effective weapon damage | A Combatant's base weapon damage as adjusted for the situation; the value around which a Combat rolls the damage outcome. It equals base weapon damage, because no rule adjusts it yet.                        |                                                                                                                                       |

## Assignments

The [Assignments](domain-model.md#agency-and-agents) that are neither an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) nor a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions), the one that places an Agent in a Mission, and the two
groups that decide whether a move between Assignments takes transit.

| Term            | Definition                                                                                                                                                                                                                                                                                                                           | Prohibited synonyms |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| Standby         | The Assignment of an Agent with no work.                                                                                                                                                                                                                                                                                             |                     |
| Contracting     | The Assignment of an Agent earning money for the Agency.                                                                                                                                                                                                                                                                             |                     |
| Training        | The Assignment of an Agent gaining base skill.                                                                                                                                                                                                                                                                                       |                     |
| Recovery        | The Assignment of an Agent regaining current health. The player can neither assign an Agent to it nor assign a Recovering Agent elsewhere.                                                                                                                                                                                           |                     |
| Deployed        | Sent on a Mission at a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) as a member of its [Current team](domain-model.md#leads-investigations-mission-sites-and-missions), and fighting there in the next Advance turn. An Agent becomes Deployed the moment the player deploys it, without transit. |                     |
| Base Assignment | Standby or Training, the Assignments an Agent carries out in the Agency's base. Moving between them takes no transit, and only an Agent on one can be deployed.                                                                                                                                                                      |                     |
| Away Assignment | Contracting or an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions), the Assignments an Agent carries out away from base. Every move to, from, or between them starts [In transit](domain-model.md#agency-and-agents).                                                                                |                     |
| Work Assignment | Contracting, Training, or an Investigation, the Assignments on which an Agent works and so gains exhaustion, under [Work exhaustion](#work-exhaustion).                                                                                                                                                                              |                     |
| Fit for work    | Of an Agent: whose exhaustion is at most `exhaustion_work_start_max`, so that it may start a Work Assignment, under [Start-work gate](#start-work-gate).                                                                                                                                                                             |                     |
| Forced return   | The move of a working Agent to Standby that an Advance turn makes when its work raises its exhaustion to `exhaustion_work_limit` or more, under [Forced return](#forced-return).                                                                                                                                                     |                     |

## Agent statuses

Where an Agent stands toward its Assignment, and whether it still serves the Agency.

| Term       | Definition                                                                                                                                                                     | Prohibited synonyms |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| Recovering | The [Agent status](domain-model.md#agency-and-agents) of an Agent whose Assignment is Recovery and that has arrived there.                                                     |                     |
| Killed     | The Agent status of an Agent whose current health reached zero in a Combat. It is final.                                                                                       |                     |
| Dismissed  | The Agent status of an Agent the player dismissed. It is final.                                                                                                                |                     |
| Serving    | Having the Agent status [At assignment](domain-model.md#agency-and-agents), [In transit](domain-model.md#agency-and-agents), or Recovering, i.e. still employed by the Agency. |                     |
| Terminated | Having the Agent status Killed or Dismissed, i.e. no longer employed by the Agency.                                                                                            |                     |

# Agent GDRs

The Game Data Records (GDRs) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the
YAML files it names.

## AgentArchetype

An AgentArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of every Agent. The table below is exhaustive apart from the `id` and `type` that
every GDR has.

| Property      | Meaning                                                                        | Read by                                                   |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `name`        | The display name of the kind of Agent.                                         | [Player-visible information](#player-visible-information) |
| `base_skill`  | The base skill of a newly created Agent.                                       | [Agent creation](#agent-creation)                         |
| `base_health` | The base health of a newly created Agent, and also its initial current health. | [Agent creation](#agent-creation)                         |
| `weapon`      | A reference to the Weapon GDR a newly created Agent is equipped with.          | [Agent creation](#agent-creation)                         |

## AgentParameters

AgentParameters bundles the scalar values that the Agent rules read, and the values that [Combat](combat.md) and
[Missions](missions.md) read about exhaustion. The table below is exhaustive apart from `id` and `type`.

| Property                            | Meaning                                                                                                                                           | Read by                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `initial_roster_size`               | How many Agents the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains.                                       | [Initial roster](#initial-roster)               |
| `exhaustion_incapacitation`         | The exhaustion at or above which a Combatant stops fighting in a Combat.                                                                          | [Combat](combat.md), which owns its meaning     |
| `exhaustion_free_points`            | The exhaustion up to which effective skill is not reduced.                                                                                        | [Effective skill](#effective-skill)             |
| `skill_penalty_pct_per_exhaustion`  | A [Percent value](../foundation/numbers.md#glossary): the percent of base skill lost for each point of exhaustion above `exhaustion_free_points`. | [Effective skill](#effective-skill)             |
| `exhaustion_per_attack`             | The exhaustion an attacking Combatant gains.                                                                                                      | [Combat](combat.md), which owns its meaning     |
| `exhaustion_per_defense`            | The exhaustion a defending Combatant gains.                                                                                                       | [Combat](combat.md), which owns its meaning     |
| `exhaustion_per_mission`            | The exhaustion every surviving Agent of a Mission gains when the Mission is resolved.                                                             | [Missions](missions.md), which owns its meaning |
| `exhaustion_per_pct_killed`         | The further exhaustion a surviving Agent of a Mission gains for each percent of its team that was Killed.                                         | [Missions](missions.md), which owns its meaning |
| `exhaustion_per_contracting_turn`   | The exhaustion an Agent gains in each Advance turn in which it works on Contracting.                                                              | [Work exhaustion](#work-exhaustion)             |
| `exhaustion_per_training_turn`      | The exhaustion an Agent gains in each Advance turn in which it works on Training.                                                                 | [Work exhaustion](#work-exhaustion)             |
| `exhaustion_per_investigation_turn` | The exhaustion an Agent gains in each Advance turn in which it works on an Investigation.                                                         | [Work exhaustion](#work-exhaustion)             |
| `exhaustion_work_start_max`         | The highest exhaustion at which an Agent is Fit for work.                                                                                         | [Start-work gate](#start-work-gate)             |
| `exhaustion_work_limit`             | The exhaustion at or above which work makes an Agent return to Standby.                                                                           | [Forced return](#forced-return)                 |
| `training_skill_gain_per_turn`      | The base skill an Agent on Training gains in one Advance turn when its Training gain outcome is "gains".                                          | [Training growth](#training-growth)             |

## Weapon properties this document reads

A [Weapon](combat.md#weapon) GDR describes the base weapon damage of the Combatants equipped with it. The Agent rules read only its `base_weapon_damage`
property: the base weapon damage of a newly created Agent equipped with that Weapon, under [Agent creation](#agent-creation).

## Agent GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for
AgentArchetype and AgentParameters. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it,
and the violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One AgentArchetype:** The Game build supplies exactly one AgentArchetype. Every Agent has it as its Archetype, so
   no rule selects among AgentArchetypes.
2. **One AgentParameters:** The Game build supplies exactly one AgentParameters GDR.
3. **Exact properties:** The AgentArchetype and the AgentParameters GDR each have exactly the properties their table
   above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
4. **Archetype values are valid:** The AgentArchetype's `base_skill` is a whole number of at least 0, its `base_health` is a
   whole number of at least 1, and its `weapon` references a Weapon GDR the Game build supplies.
5. **Parameters are valid:** Each property of AgentParameters is a whole number of at least 0.
6. **Exhaustion thresholds are ordered:** `exhaustion_work_start_max` is less than `exhaustion_work_limit`, and
   `exhaustion_work_limit` is at most `exhaustion_incapacitation`. An Agent that is Fit for work therefore starts below
   the exhaustion that ends its work, and work ends no later than at the exhaustion at which the Agent would stop
   fighting in a Combat.

[Combat GDR validation](combat.md#combat-gdr-validation) adds further rules, e.g. that the Weapon `base_weapon_damage` is a whole
number of at least 1. These rules guarantee that every newly created Agent satisfies
[Attribute ranges](#attribute-ranges) and that the effective skill formula never divides by zero.

# Agent properties

**Proposed rule:** An Agent is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is the AgentArchetype. Its Archetype reference is set
when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) and [State](../foundation/core-concepts.md#campaign-instances) have exactly the following properties. This table is
exhaustive.

| Property                                                   | Part      | Value                                                                                                                                                                                             | Classification and range                                                                                                                                   |
| ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agency                                                     | Constants | An Immutable reference to the Agency that employs the Agent.                                                                                                                                      | [Authoritative value](../foundation/core-concepts.md#value-classification). Always the Campaign's one Agency.                                              |
| Turn hired                                                 | Constants | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) in which the Agent was created.                                                                          | Authoritative value. A whole number of at least 1.                                                                                                         |
| Base skill                                                 | State     | The Agent's base skill.                                                                                                                                                                           | Authoritative value. A whole number of at least 0, with no upper bound, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities). |
| Current health                                             | State     | The Agent's current health.                                                                                                                                                                       | Authoritative value. A whole number under [Attribute ranges](#attribute-ranges).                                                                           |
| Base health                                                | State     | The Agent's base health.                                                                                                                                                                          | Authoritative value. A whole number of at least 1. No rule in scope changes it after creation.                                                             |
| Exhaustion                                                 | State     | The Agent's exhaustion.                                                                                                                                                                           | Authoritative value. A whole number under [Attribute ranges](#attribute-ranges).                                                                           |
| Weapon                                                     | State     | A reference to the Weapon GDR the Agent is equipped with.                                                                                                                                         | Authoritative value. Always resolves to a Weapon GDR the Game build supplies. No rule in scope changes it after creation.                                  |
| Base weapon damage                                         | State     | The Agent's base weapon damage.                                                                                                                                                                   | Authoritative value. A whole number of at least 1. Only the rules under [Modifiable values](#modifiable-values) change it.                                 |
| Assignment                                                 | State     | Present exactly when the Agent is Serving: one of Standby, Contracting, Training, Recovery, an Investigation with a Mutable reference to it, or Deployed with a Mutable reference to the Mission. | Authoritative value, under [Assignment and Agent status](#assignment-and-agent-status).                                                                    |
| Agent status                                               | State     | At assignment, In transit, Recovering, Killed, or Dismissed, under [Agent status](#agent-status).                                                                                                 | Authoritative value, under [Agent status](#agent-status) and [Assignment and Agent status](#assignment-and-agent-status).                                  |
| [Participation history](domain-model.md#agency-and-agents) | State     | The Investigations and Missions the Agent took part in and has left.                                                                                                                              | Authoritative value, under [Participation history records](#participation-history-records).                                                                |

Base skill, current health, base health, exhaustion, Weapon, and base weapon damage are the properties the
[Combatant Role Type](#combatant-role-type) requires; Weapon and base weapon damage together are the equipped
weapon values. An Agent also has three [Derived values](../foundation/core-concepts.md#value-classification), which are never stored: its effective skill, under
[Effective skill](#effective-skill); whether it can be assigned, under
[Agents that can be assigned](#agents-that-can-be-assigned); and whether it is Fit for work, under
[Start-work gate](#start-work-gate). An Agent has no [Turn series](../foundation/world-history.md#glossary).

**Retention:** An Agent keeps every property above for the whole Campaign, whatever its Agent status, so that every
reference to it resolves, e.g. from a [Combat report](domain-model.md#combat) or a Participation history. A Terminated Agent no longer
participates in current gameplay and is [retained](../foundation/world-history.md#glossary) in [World history](../foundation/campaign-state.md#glossary) with its final values, under
[Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in World History. No
Agent is ever removed.

## Participation history records

**Proposed rule:** Whenever an Agent stops belonging to the Current team of an Investigation or of a Mission, for any
reason, that Investigation or Mission is added to the Agent's Participation history, unless it is already there. E.g.,
the reason may be that the player assigns the Agent elsewhere, that the Investigation completes, or that the Mission's
Combat is fought. Nothing is ever removed from a Participation history, and recording it neither assigns nor
reserves the Agent, under [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain
Model.

# Agent status

**Proposed rule:** An Agent has exactly one Agent status: At assignment, In transit, Recovering, Killed, or Dismissed.
The set is exhaustive. An Agent is Serving exactly when its Agent status is At assignment, In transit, or Recovering,
and Terminated exactly when it is Killed or Dismissed. Every Agent is Serving when it is created, under
[Agent creation](#agent-creation).

While an Agent is Serving, its Agent status moves between At assignment, In transit, and Recovering only as its
Assignment changes and as it arrives, under [Assignment changes](#assignment-changes) and
[Transit rule](#transit-rule). It becomes Terminated only by the following transitions:

| Source state | Target state | Trigger                                                                                                                    | Condition                                                                                                  |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Serving      | Killed       | The Agent's current health reaches zero in a Combat, under [Killed and Incapacitated](combat.md#killed-and-incapacitated). | The Agent is Deployed.                                                                                     |
| Serving      | Dismissed    | The `dismissAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) dismisses the Agent.        | The preconditions under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents) hold for the Agent. |

Every transition not listed is impossible; e.g., a Killed Agent never becomes Serving again, and a Dismissed Agent
cannot be Killed. Killed and Dismissed are final.

The following invariants hold in every [Committed state](../foundation/engine-contract.md#player-actions-and-turns):

- A Serving Agent has exactly one Assignment. A Terminated Agent has none and belongs to no Current team. Killed
  and Dismissed are Agent statuses, not Assignments.
- An Agent is Recovering exactly when its Assignment is Recovery and it is not In transit. A Deployed Agent is At
  assignment.
- Within [Attribute ranges](#attribute-ranges), a Serving Agent has positive current health, a Killed Agent
  has zero current health, and a Dismissed Agent has positive current health.

When an Agent becomes Killed or Dismissed, its Assignment is removed in the same Player action,
and the Investigation or Mission it belonged to, if any, is recorded under
[Participation history records](#participation-history-records).

# Attributes and effectiveness

An Agent's attributes say how capable it is and how worn down it is, and together they decide how well it works and
fights. Agents share these attributes with Enemies, so one set of rules covers every Combatant.

## Combatant Role Type

The [Combatant Role Type](domain-model.md#combat) is a [Role Type](../foundation/campaign-instances.md#glossary) under [Role Types](../foundation/campaign-instances.md#role-types) in Campaign
Instances. It states what a Campaign instance [Type](../foundation/core-concepts.md#data-modeling) must have for its Campaign instances to be Combatants, and what a
Combatant gains while a Combat lasts.

- **Adoption condition:** a Campaign instance Type can adopt the Combatant Role Type if the State of its Campaign
  instances has all of the following properties: base skill, current health, base health, exhaustion, and equipped weapon
  values. This set is exhaustive.
- **Adopters:** Agent and Enemy adopt the Combatant Role Type. This set is exhaustive.
- **Gained properties:** every Combatant taking part in a Combat gains properties that mean something only while
  that Combat lasts, e.g. whether it is [Incapacitated](combat.md#glossary). It gains them when the Combat begins and
  loses them when the Combat ends. The exhaustive set of gained properties is under
  [Combat-only properties](combat.md#combat-only-properties) in Combat.

The properties named by the adoption condition persist outside a Combat; e.g., an Agent has current health and
exhaustion between Combats. What outlasts a Combat is its [Combat report](domain-model.md#combat) and every change the Combat made to those properties,
e.g. lost current health.

The Combatant Role Type is not a Campaign instance Type, so a Combatant is never a Campaign instance separate from
its Agent or Enemy. If it were, every Agent would be two Campaign instances with two [Instance IDs](../foundation/campaign-instances.md#glossary), and current health would
belong to the second one instead of to the Agent. A Combat instead changes the participating Agent and Enemy Campaign
instances themselves: the Agent changed by a Combat is the same Agent that returns to the Agency.

## Attribute ranges

**Proposed rule:** In every Committed state, every Combatant, i.e. every Agent and every Enemy, satisfies these ranges:

- Base skill is a whole number of at least 0.
- Base health is a whole number of at least 1.
- Exhaustion is a whole number of at least 0, with no upper bound.
- Current health is a whole number from 0 to base health, both included.

Any rule of any specification that would lower exhaustion below 0 lowers it to exactly 0 instead; no rule clamps
exhaustion from above. Any rule that would lower current
health below 0 lowers it to exactly 0 instead, and any rule that would raise current health above base health raises it to exactly
base health instead. The rule that changes the value applies these clamps as part of its own change. E.g., a Combatant with exhaustion 99 that
gains 3 exhaustion has exhaustion 102, and an Agent with exhaustion 3 that recovers 5 has exhaustion 0.

**Informative rationale:** Exhaustion above `exhaustion_incapacitation` has no further effect in a Combat, where the
Combatant has already stopped fighting, but it lengthens the rest the Agent needs before it is Fit for work again.

## Effective skill

**Inherited behavior:** A Combatant's effective skill is a Derived value computed by this formula. It is shared by
Agents and Enemies through the [Combatant Role Type](#combatant-role-type), and every rule that uses a
Combatant's capability, e.g. [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) or a Combat's hit probability, reads effective skill rather than
base skill.

```text
penalty factor  = max(0, 100 − p × max(0, exhaustion − f))
effective skill = round down( base skill × current health × penalty factor / (base health × 100) )
```

Inputs:

| Symbol         | Meaning                                                | Unit and domain                                                   |
| -------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| base skill     | The Combatant's base skill.                            | Skill points; a whole number of at least 0.                       |
| current health | The Combatant's current health.                        | Health points; a whole number from 0 to base health.              |
| base health    | The Combatant's base health.                           | Health points; a whole number of at least 1.                      |
| exhaustion     | The Combatant's exhaustion.                            | Exhaustion points; a whole number of at least 0.                  |
| p              | `skill_penalty_pct_per_exhaustion` of AgentParameters. | Percent value per exhaustion point; a whole number of at least 0. |
| f              | `exhaustion_free_points` of AgentParameters.           | Exhaustion points; a whole number of at least 0.                  |

Evaluation and rounding: the formula is evaluated exactly, under [Exact evaluation](../foundation/numbers.md#exact-evaluation)
in Numbers, and is rounded exactly once, with [Round down](../foundation/numbers.md#glossary) under [Rounding](../foundation/numbers.md#rounding), at the
end. The penalty
factor is a whole number, so it needs no rounding; no other intermediate result is rounded. The divisor is never zero,
because base health is at least 1.

Penalty clamp: when `p × max(0, exhaustion − f)` exceeds 100, the penalty factor is 0, not negative, and the effective
skill is 0. With an exhaustion at most `f`, the penalty factor is exactly 100 and exhaustion has no effect.

Range: the result is a whole number from 0 to base skill, both included, because current health divided by base health and the
penalty factor divided by 100 each lie from 0 to 1. A Combatant whose current health equals its base health and whose exhaustion is at most `f` has an
effective skill equal to its base skill. A Combatant with zero current health, e.g. a Killed Agent, has an effective skill of 0.

Effective skill is never stored. Whenever a rule reads it, it is computed from the Combatant's values at that moment, so
it follows every change of base skill, current health, or exhaustion at once, under
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract. Which
moment's values a [Turn advancement step](turn-advancement.md#glossary) reads is stated under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps).

## Effective weapon damage

**Proposed rule:** A Combatant's effective weapon damage is a Derived value equal to its base weapon damage. It is
shared by Agents and Enemies through the [Combatant Role Type](#combatant-role-type), and it is the value around which a
Combat rolls the damage outcome, under [Damage outcome](combat.md#damage-outcome) in Combat. No rule adjusts it yet;
it is kept apart from base weapon damage so that a later rule can adjust weapon damage for the situation without
changing the stored value, as effective skill does for base skill. Effective weapon damage is never stored, and it
follows every change of base weapon damage at once.

## Changes to attributes

An Agent's attributes change only through a few named rules, so the cause of every change to them can be traced.

**Proposed rule:** The following table is the exhaustive list of rules that change an Agent's attributes after its
creation. A rule not listed here changes none of them.

| Value              | Raised by                                                                                                                                                                                        | Lowered by                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Base skill         | [Training growth](#training-growth)                                                                                                                                                              | No rule                             |
| Current health     | [Agent Recovery](agent-recovery.md)                                                                                                                                                              | [Combat](combat.md), in a Combat    |
| Base health        | No rule                                                                                                                                                                                          | No rule                             |
| Exhaustion         | [Combat](combat.md), in a Combat, by `exhaustion_per_attack` and `exhaustion_per_defense`; [Mission exhaustion](missions.md#mission-exhaustion) in Missions; [Work exhaustion](#work-exhaustion) | [Agent Recovery](agent-recovery.md) |
| Base weapon damage | The [Weapon damage Upgrade](economy-and-upgrades.md#weapon-damage-upgrade), under [Modifiable values](#modifiable-values)                                                                        | No rule                             |

Standby, Recovery, and being In transit leave exhaustion unchanged except through [Agent Recovery](agent-recovery.md), which
lowers it on Standby and Recovery. Each specification named in the table applies the clamps under [Attribute ranges](#attribute-ranges).

# Modifiable values

**Proposed rule:** Base weapon damage is the only Agent value that an [Upgrade](economy-and-upgrades.md#glossary) may change. It is an individual value of each
Agent, not an Agency value. The [Weapon damage Upgrade](economy-and-upgrades.md#weapon-damage-upgrade) raises the
base weapon damage of Serving Agents and of Agents created later, under [Agent creation](#agent-creation). No [Upgrade](domain-model.md#agency-and-agents) changes base skill, current health, base health, exhaustion, or Weapon.

# Assignments and transit

An Agent's Assignment says what it is doing, and transit is the price of changing it. These rules decide which
Agents accept new Assignments and when an Agent starts working on a new Assignment.

## Assignment and Agent status

**Proposed rule:** The Assignment of a Serving Agent is exactly one of the following, and this list is
exhaustive: Standby; Contracting; Training; Recovery; an Investigation, with a reference to that Investigation; and
Deployed, with a reference to the Mission the Agent is Deployed on. The Agent status of a Serving Agent says how it
stands toward its Assignment: At assignment while carrying it out, In transit while still travelling to it, and
Recovering when its Assignment is Recovery and it has arrived. An Agent In transit keeps the Assignment it is
travelling to; transit is not a second Assignment.

Recovery is an Assignment like the others, except that the player can neither assign an Agent to it nor assign a
Recovering Agent elsewhere: only the rules under [Assignment changes](#assignment-changes) move an Agent onto or off
Recovery. An Agent belongs to the Current team of an Investigation or of a Mission exactly as
[Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain Model states, including
while In transit.

A Deployed Agent is always At assignment, because deployment has no transit under [Transit rule](#transit-rule). In
every Committed state, the Mission that a Deployed Agent's Assignment references is Deployed, and its
Current team contains that Agent. A Mission is Deployed, under [Mission lifecycle](missions.md#mission-lifecycle),
exactly when the Agents of its Current team are Deployed on it.

## Agents that can be assigned

**Proposed rule:** An Agent can be assigned exactly when all of the following hold:

1. It is Serving.
2. Its Agent status is At assignment.
3. Its Assignment is Standby, Contracting, Training, or an Investigation.

A Recovering Agent, an Agent In transit, and a Deployed Agent therefore cannot be assigned, and neither can a
Terminated Agent. Whether an Agent can be assigned is a Derived value. Every Player action that changes an Agent's
Assignment requires that the Agent can be assigned: `assignAgents` under [Assigning Agents](#assigning-agents), and the
Player actions of [Investigations](investigations.md) and [Missions](missions.md) that assign Agents to an Investigation
or deploy them to a Mission site. A new Work Assignment also requires that the Agent is Fit for work, under
[Start-work gate](#start-work-gate). `dismissAgents`, which ends the Assignment instead of changing it, has its
own precondition, under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents).

## Start-work gate

An Agent worn down by work or by a Combat must rest before it takes on new work, so that tiredness builds up only as
far as the player lets it.

**Proposed rule:** An Agent is Fit for work exactly when its exhaustion is at most `exhaustion_work_start_max`. Whether an
Agent is Fit for work is a Derived value, never stored. Every Player action that gives an Agent a Work Assignment it does
not already have requires that the Agent is Fit for work: `assignAgents` with `Contracting` or `Training` under
[Assigning Agents](#assigning-agents), and `startInvestigation` and `assignAgentsToInvestigation` under
[Investigations](investigations.md). No other Player action requires it; e.g., an Agent of any exhaustion can be
assigned to Standby and can be deployed, under [Deploying Agents](missions.md#deploying-agents) in Missions.

The gate applies only when the work starts. An Agent already on a Work Assignment keeps working whatever its exhaustion,
until it is assigned elsewhere or until its [Forced return](#forced-return). E.g., with the Bootstrap values, an Agent
on Contracting with exhaustion 45 keeps earning, can be recalled to Standby, and cannot be assigned to Training or to an
Investigation until its exhaustion falls to 30.

## Assignment changes

An Agent changes what it is doing either because the player assigns it or because an Advance turn moves it, e.g. when
its Investigation completes. Each such change has one trigger and one owner, so no Agent changes what it is doing
without a stated cause.

**Proposed rule:** The following table lists every allowed change of a Serving Agent's Assignment or Agent
status, with its trigger and the owner of the trigger. An Assignment of "Investigation" in the
table means an Investigation with its reference.

| From                                                               | To                                                                        | Trigger and who triggers it                                                                                                                      | Owner of the trigger and its conditions                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Standby or Training; At assignment                                 | The other of Standby and Training; At assignment                          | The player assigns it, through the `assignAgents` Player action.                                                                                 | This document, under [Assigning Agents](#assigning-agents) |
| Standby or Training; At assignment                                 | Contracting; In transit                                                   | The player assigns it, through the `assignAgents` Player action.                                                                                 | This document, under [Assigning Agents](#assigning-agents) |
| Contracting or an Investigation; At assignment                     | Standby, Contracting, or Training, other than the current one; In transit | The player assigns it, through the `assignAgents` Player action.                                                                                 | This document, under [Assigning Agents](#assigning-agents) |
| Standby, Contracting, Training, or an Investigation; At assignment | An Investigation; In transit                                              | The player starts an Investigation with it or adds it to one, through a Player action of Investigations.                                         | [Investigations](investigations.md)                        |
| Standby or Training; At assignment                                 | Deployed on a Mission; At assignment                                      | The player deploys it, through the `deployAgents` Player action.                                                                                 | [Missions](missions.md)                                    |
| Any Assignment other than Recovery; In transit                     | The same Assignment; At assignment                                        | Advance turn, in the Transit step.                                                                                                               | This document, under [Transit rule](#transit-rule)         |
| Recovery; In transit                                               | Recovery; Recovering                                                      | Advance turn, in the Transit step.                                                                                                               | This document, under [Transit rule](#transit-rule)         |
| An Investigation; At assignment                                    | Standby; In transit                                                       | Advance turn: the Investigation completes in the [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) step. | [Investigations](investigations.md)                        |
| Contracting or an Investigation; At assignment                     | Standby; In transit                                                       | Advance turn: the Agent's work raises its exhaustion to `exhaustion_work_limit` or more, in the Agency income or Investigation progress step.    | This document, under [Forced return](#forced-return)       |
| Training; At assignment                                            | Standby; At assignment                                                    | Advance turn: the Agent's work raises its exhaustion to `exhaustion_work_limit` or more, in the Training step.                                   | This document, under [Forced return](#forced-return)       |
| Deployed; At assignment                                            | Recovery; In transit                                                      | Advance turn: the Agent survives the Combat in the Mission resolution step with current health below its base health.                            | [Missions](missions.md)                                    |
| Deployed; At assignment                                            | Standby; In transit                                                       | Advance turn: the Agent survives the Combat in the Mission resolution step with current health equal to its base health.                         | [Missions](missions.md)                                    |
| Recovery; Recovering                                               | Standby; At assignment                                                    | Advance turn: the Agent's current health reaches its base health in the Agent recovery step.                                                     | [Agent Recovery](agent-recovery.md)                        |

Every change not listed is impossible; e.g., an Agent on Recovery cannot be assigned to Contracting, a Deployed Agent
cannot be recalled, an Agent In transit cannot be assigned anywhere, and an Agent on Contracting or an Investigation
cannot be deployed. Recalling an Agent is assigning it to a [Base Assignment](#assignments): from Contracting or an
Investigation it starts In transit, and from Training it does not.

The following diagram draws the table. Each box is one pair of Assignment and Agent status; Standby and Training form the
base, and Contracting and Investigations are away. A Forced return follows the same arrow as recalling the Agent to
Standby.

![Agent Assignment transitions: Standby and Training, the Base Assignments, switch to each other at once and are the only Assignments an Agent can be deployed from; every move to, from, or between Contracting and Investigations, the Away Assignments, passes through In transit for one Advance turn; Deployed and Recovering are left only by an Advance turn; Killed and Dismissed are final](../../../images/diagrams/agent-assignment-transitions.svg)

A Serving Agent's Assignment also ends, without a replacement, when it becomes Terminated under
[Agent status](#agent-status): a Deployed Agent that is Killed in a Combat, and an Agent
that is dismissed under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents). A new Agent starts on Standby: At assignment when it belongs to the
[Initial roster](#initial-roster), and In transit when it is created during play under [Agent creation](#agent-creation).

## Transit rule

**Proposed rule:** This rule decides when an Agent with a new Assignment starts working. Every [Turn advancement
step](domain-model.md#turn-advancement-steps) under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) applies it. The following statements
are complete:

1. **Starting In transit:** Every new Assignment starts In transit, with four exceptions: an Agent becomes
   Deployed At assignment at once; an Agent moved from one [Base Assignment](#assignments) to the other is At
   assignment at once; a Recovering Agent whose current health reaches base health becomes Standby At assignment at
   once; and an Agent of the [Initial roster](#initial-roster) starts At assignment.
2. **Arrival:** An Agent that is In transit in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of an Advance turn, i.e. in the Committed state in
   which that Advance turn began, becomes At assignment in the Transit step of that Advance turn, or Recovering when
   its Assignment is Recovery. Completing its transit
   is all that happens to it in that Advance turn: it earns no income, trains nothing, adds no Investigation progress,
   fights in no Combat, and recovers neither current health nor exhaustion.
3. **Departure:** An Agent that becomes In transit during an Advance turn is still In transit in the Committed state
   after that Advance turn. The Transit step applies only to Agents that were In transit in the Turn-end state.

Wherever the rule of a Turn advancement step after Transit applies to Agents At assignment or Recovering, it means
Agents that already had that Agent status in the Turn-end state and that still have it when the step begins. There are
two exceptions to
statement 2:

- **Upkeep:** An Agent that arrives in the Transit step is still counted in the Upkeep step, because
  upkeep, under [Upkeep](economy-and-upgrades.md#upkeep), is a cost the Agency pays for every Serving Agent, not something the Agent
  does.
- **Destination ends:** When the Assignment an Agent has just arrived at ends because of something other than
  the Agent's own work, its Assignment still changes as the owning rule states. E.g., an Agent that arrives at an
  Investigation in the Transit step adds no progress, but when the other members' progress completes that Investigation
  in the same Advance turn, the arrived Agent goes to Standby, In transit, with the rest of the Current team, under
  [Investigations](investigations.md).

**Within base:** Standby and Training are both carried out in the Agency's base, so an Agent moved between them by
`assignAgents` travels nowhere: it is At assignment at once, and it can be assigned again in the same Turn.

**Deployed:** Deploying to a Mission site does not start In transit, and only an Agent on a Base Assignment can be
deployed, under [Deploying Agents](missions.md#deploying-agents) in Missions. The moment the player
deploys, a new Mission at that Mission site is created and the selected Agents are Deployed on it At assignment, and the Combat is fought in the next
Advance turn, under [Missions](missions.md). The way back does take transit: survivors become In transit during that
Advance turn, so under statement 3 they are still In transit when it ends, and they arrive in the Advance turn after it.

**Informative rationale:** No GDR supplies a transit duration, so every transit takes exactly one Advance turn. Every
trip to, from, or between [Away Assignments](#assignments) therefore costs one Advance turn before the Agent works,
while moving within base and deploying from base cost none, and returning from a Mission costs one Turn during which
the Agent can do nothing. Keeping Agents in base is the price of having them ready for a Mission site.

# Training growth

A worn-down Agent learns less, so Training pays off in full only for an Agent whose effective skill is not lowered.

**Proposed rule:** In the Training step of every Advance turn, each Agent that is Serving, whose Assignment is
Training, and that was At assignment in the Turn-end state, has one named random outcome, the **Training gain** outcome.
Its possible values are "gains" and "does not gain". It takes the value "gains" with the
[Probability](../foundation/numbers.md#glossary):

```text
training gain Probability = current health × penalty factor / (base health × 100)
```

where current health, base health, and the penalty factor are those of [Effective skill](#effective-skill), from the
Agent's [Step-start values](domain-model.md#turn-advancement-steps) of the Training step. The Probability is effective skill divided by base skill before Round
down, so it reads the same health and exhaustion as effective skill and needs no base skill; it is defined even for an Agent of base skill 0. It is an exact
Probability under [Probabilities](../foundation/numbers.md#probabilities) in Numbers, never rounded, from 0 to 1, both
included, because each of its two factors lies from 0 to 1. When the outcome is "gains", the Agent gains base skill:

```text
base skill after = base skill before + training_skill_gain_per_turn
```

Inputs: base skill before is the Agent's base skill at the start of the Training step, a whole number of at least 0;
`training_skill_gain_per_turn` is the value of AgentParameters, a whole number of at least 0. No rounding occurs,
because every term is a whole number. The result is a whole number of at least base skill before; base skill has no upper bound.
When the outcome is "does not gain", base skill is unchanged. An Agent whose exhaustion is at most `exhaustion_free_points`
and whose current health equals its base health has Probability 1, so it always gains; e.g., with the Bootstrap values, an Agent
with exhaustion 50 gains with Probability 80 / 100. An Agent that arrived at Training in the Transit step of the same
Advance turn has no Training gain outcome and gains nothing, under [Transit rule](#transit-rule). Training also raises the
Agent's exhaustion, under [Work exhaustion](#work-exhaustion), and changes no other value of the Agent.

The outcome of one Agent does not depend on any other Agent, so the result is the same whatever order an implementation
processes the Agents in.

**Informative rationale:** A Probability rather than a scaled gain keeps base skill a whole number: the Bootstrap gain of
1, scaled by 0.83 and rounded down, would be 0, so a slightly tired Agent would never learn. With the Probability, the
expected gain is exactly the gain scaled by effective skill relative to base skill.

# Work exhaustion

Work wears an Agent down a little in every Advance turn, so an Agent cannot work without end: it must be rotated to
Standby to rest.

**Proposed rule:** In each Advance turn, every Agent that works gains exhaustion in the [Turn advancement
step](turn-advancement.md#glossary) of its work, after that step has read the Agent's values for the work itself. The
following table is exhaustive:

| Work Assignment  | The Agents that work                                                                                                                                                        | Step and the work read first                                                                                                                                                    | Exhaustion gained                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Contracting      | Every Agent counted in the contracting income, under [Agency income](economy-and-upgrades.md#agency-income) in Economy and Upgrades                                         | Agency income, after the Agency's income is added                                                                                                                               | `exhaustion_per_contracting_turn`   |
| Training         | Every Agent that has a Training gain outcome, under [Training growth](#training-growth)                                                                                     | Training, after its Training gain outcome and any gain of base skill                                                                                                            | `exhaustion_per_training_turn`      |
| An Investigation | Every working member of an Investigation, under [Progress gain](investigations.md#progress-gain) in Investigations, whether or not that Investigation completes in the step | Investigation progress, after the Investigation's progress gain, Completion check, and any completion, under [Investigation progress](investigations.md#investigation-progress) | `exhaustion_per_investigation_turn` |

```text
exhaustion after = exhaustion before + exhaustion gained
```

Exhaustion before is the Agent's exhaustion at the start of the step and exhaustion gained the value of AgentParameters
in the table, each a whole number of at least 0; no rounding occurs and no upper clamp applies, under
[Attribute ranges](#attribute-ranges). Because the work is read first, the exhaustion an Agent gains from a work turn never
lowers what that turn's work achieves: e.g., an Agent on Contracting with exhaustion 30 earns its full income in the
Agency income step and then has exhaustion 31. An Agent that arrived in the Transit step of the same Advance turn does
not work, under [Transit rule](#transit-rule), and gains no exhaustion. The gain of one Agent reads no other Agent, so
the result does not depend on the order an implementation processes the Agents in.

## Forced return

An Agent worn down too far stops working on its own, so that tiredness never reaches the point at which a Combat would
find the Agent unable to fight.

**Proposed rule:** In the same step, right after an Agent gains exhaustion under [Work exhaustion](#work-exhaustion), the
Agent has a Forced return when both of the following hold:

1. Its exhaustion is at least `exhaustion_work_limit`.
2. Its Assignment is still the Work Assignment it worked on; e.g., a member of an Investigation that completed in the same
   step is already on Standby, under [Completion](investigations.md#completion) in Investigations, and has no Forced return.

On a Forced return the Agent's Assignment becomes Standby. Its Agent status becomes In transit when it was on
Contracting or an Investigation, which are Away Assignments, and stays At assignment when it was on Training, a Base
Assignment, under [Transit rule](#transit-rule). An Agent that leaves an Investigation this way leaves its Current team
under [Leaving an Investigation](investigations.md#leaving-an-investigation) in Investigations, and the Investigation
becomes Abandoned when it was the last member, under [Abandonment](investigations.md#abandonment). The work the Agent did
in this step still counts: e.g., the income it earned is kept, and the Investigation progress it added was added before
the Investigation loses progress for its leaving, under [Progress loss](investigations.md#progress-loss).

A Forced return makes the Agent Fit for work again only after it has rested, under [Start-work gate](#start-work-gate)
and [Agent Recovery](agent-recovery.md). E.g., with the Bootstrap values, an Agent on Contracting that reaches exhaustion
70 is In transit to Standby, arrives in the next Advance turn, and then loses 5 exhaustion in each Advance turn on
Standby, so it is Fit for work again with exhaustion 30, after eight Advance turns of rest.

# Agent creation

**Proposed rule:** Every Agent is created by this rule, whichever rule causes the creation: the
[Initial roster](#initial-roster), the `hireAgent` Player action of [Economy and Upgrades](economy-and-upgrades.md), or
the [Player cheat action](../foundation/engine-contract.md#player-actions-and-turns) under [Adding Agents](#adding-agents). Each new Agent has a fresh Instance ID under
[Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following
initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in
Campaign Instances. This table is exhaustive.

| Value                 | Initial value                                                                                     | Source                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Archetype reference   | The AgentArchetype.                                                                               | The one AgentArchetype GDR, under [Agent GDR validation](#agent-gdr-validation). |
| Agency                | The Campaign's Agency.                                                                            | Campaign state.                                                                  |
| Turn hired            | The turn number of the current Turn.                                                              | Campaign state.                                                                  |
| Base skill            | The AgentArchetype's `base_skill`.                                                                | `base_skill` of the AgentArchetype.                                              |
| Base health           | The AgentArchetype's `base_health`.                                                               | `base_health` of the AgentArchetype.                                             |
| Current health        | The AgentArchetype's `base_health`.                                                               | `base_health` of the AgentArchetype.                                             |
| Exhaustion            | 0.                                                                                                | This rule.                                                                       |
| Weapon                | The Weapon GDR that the AgentArchetype's `weapon` references.                                     | `weapon` of the AgentArchetype.                                                  |
| Base weapon damage    | The `base_weapon_damage` of that Weapon GDR.                                                      | `base_weapon_damage` of the Weapon GDR.                                          |
| Assignment            | Standby.                                                                                          | This rule.                                                                       |
| Agent status          | At assignment for an Agent of the initial roster; In transit for every Agent created during play. | This rule, under [Transit rule](#transit-rule).                                  |
| Participation history | Empty.                                                                                            | This rule.                                                                       |

The table above states the initial base weapon damage before any Upgrade has been acquired; for an Agent created after an
Upgrade has been acquired, the [Weapon damage Upgrade](economy-and-upgrades.md#weapon-damage-upgrade) raises it. The new Agent joins the Agency's roster of Agents. No [Campaign configuration](../foundation/campaign-state.md#glossary) value changes any initial value above.
Creating an Agent changes nothing else; e.g., any cost, and the [Agent cap](economy-and-upgrades.md#glossary), belong to the rule that causes the creation.

## Initial roster

**Proposed rule:** The initial Campaign state contains exactly `initial_roster_size` Agents, the value of
AgentParameters, and no other Agent, as [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model
requires. Each is created under [Agent creation](#agent-creation) with Agent status At assignment and Turn hired equal to
the turn number of the Campaign's first Turn. Because no Upgrade has been acquired at campaign creation, each has the
Weapon `base_weapon_damage` as its base weapon damage. Every Agent of the initial roster can be assigned in the first Turn. An
`initial_roster_size` of 0 is valid and gives an empty roster.

# Assigning Agents

**Proposed rule:** The Player action `player.actions.assignAgents(agents, assignment)` assigns Agents to Standby,
Contracting, or Training.

Parameters:

| Parameter    | Meaning                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------ |
| `agents`     | A list of Instance IDs, each meant to identify one Agent of the Campaign.                  |
| `assignment` | The target Assignment: exactly one of the values `Standby`, `Contracting`, and `Training`. |

Preconditions: the action is rejected, as a whole, when any of the following holds:

1. `agents` is empty.
2. `agents` contains the same Instance ID more than once.
3. An Instance ID in `agents` identifies no Agent of the Campaign.
4. `assignment` is not one of `Standby`, `Contracting`, and `Training`.
5. An Agent in `agents` cannot be assigned, under [Agents that can be assigned](#agents-that-can-be-assigned).
6. An Agent in `agents` already has `assignment` as its Assignment.
7. `assignment` is `Contracting` or `Training`, and an Agent in `agents` is not Fit for work, under
   [Start-work gate](#start-work-gate).

One further precondition, on assigning Agents to Training, is stated under
[Training cap on assigning Agents](economy-and-upgrades.md#training-cap-on-assigning-agents). Other preconditions apply to every Player action, e.g. that the
Campaign has no [Campaign ending](domain-model.md#campaign-standing), under [Panic and Endings](panic-and-endings.md) and
[Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at
least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation
is the Implementer's choice. A rejected action changes nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract. Because
every value under [Player-visible information](#player-visible-information) is Player-visible, the error reveals
nothing hidden.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same
Turn, to every Agent in `agents`:

- Its Assignment becomes `assignment`. Its Agent status becomes At assignment when both its former Assignment and
  `assignment` are [Base Assignments](#assignments), and In transit otherwise, under [Transit rule](#transit-rule).
- If its Assignment was an Investigation, it leaves that Investigation's Current team, and the Investigation is
  recorded under [Participation history records](#participation-history-records). Leaving also affects the
  Investigation under [Leaving an Investigation](investigations.md#leaving-an-investigation), e.g. it is Abandoned
  when its last member leaves.

Nothing else changes; e.g., no money is spent, and base skill, current health, and exhaustion are unchanged. An Agent In
transit arrives in the next Advance turn and starts working in the Advance turn after it, and an Agent moved within base
starts working in the next Advance turn, under [Transit rule](#transit-rule).

# Player cheat actions

A Player cheat action changes Campaign state in a way ordinary play does not allow. The Player cheat action for Agents adds them
without the cost and the [Agent cap](economy-and-upgrades.md#glossary) that hiring has.

## Adding Agents

**Proposed rule:** The Player cheat action `developer.actions.addAgents(count)` adds Agents to the Agency. It follows every
rule under [Player cheat actions](../foundation/developer-access.md#player-cheat-actions) in Developer Access, including that
only the [Session controller](../foundation/engine-contract.md#principals-and-access) can call it, only with [Dev mode](../foundation/engine-contract.md#principals-and-access) enabled, and that each successful call is one Player action
recorded as one [Timeline entry](../foundation/timeline.md#glossary).

| Parameter | Meaning                                               |
| --------- | ----------------------------------------------------- |
| `count`   | How many Agents to add: a whole number of at least 1. |

Validation: the operation is rejected, and changes nothing, when `count` is not a whole number or is less than 1. No
upper limit applies.

Effect: the operation creates `count` Agents, each under [Agent creation](#agent-creation) exactly as hiring creates
one, so each is Serving, on Standby, and In transit, with Turn hired equal to the current turn number. Unlike hiring,
it spends no money and ignores the [Agent cap](economy-and-upgrades.md#glossary): it succeeds even when the Agency's money is below the hiring cost or the
Agency already employs as many Agents as the [Agent cap](domain-model.md#agency-and-agents) allows. Nothing else changes.

# Player-visible information

**Proposed rule:** Every value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces) under
[Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), from the
moment it exists, without a reveal condition, for every Agent whatever its Agent status. The table is exhaustive.

| Value                                                                                                            | Player-visible information |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------- |
| An Agent's Instance ID, its AgentArchetype including the AgentArchetype's `name`, its Agency, and its Turn hired | Yes                        |
| An Agent's base skill, current health, base health, exhaustion, Weapon, and base weapon damage                   | Yes                        |
| An Agent's effective skill                                                                                       | Yes                        |
| An Agent's Agent status, and its Assignment, including the Investigation or Mission it references                | Yes                        |
| Whether an Agent can be assigned, and whether it is Fit for work                                                 | Yes                        |
| An Agent's Participation history                                                                                 | Yes                        |
| Every property of the AgentArchetype and of AgentParameters                                                      | Yes                        |

**Unknown versus absent:** No value in the table above is hidden, so Player API never reports one as unknown. A Terminated
Agent has no Assignment; Player API reports it as absent, and the visible Agent status explains why. An empty Participation history is reported as empty, not as absent.

# Edge cases and failure behavior

- **Exhaustion at the free amount:** An exhaustion exactly equal to `exhaustion_free_points` gives a penalty factor of
  100; the first point above it lowers the penalty factor by `skill_penalty_pct_per_exhaustion`
  ([Effective skill](#effective-skill)).
- **Penalty below zero:** When `skill_penalty_pct_per_exhaustion × (exhaustion − exhaustion_free_points)` exceeds 100,
  the penalty factor is 0 and effective skill is 0; the Combatant is still alive and keeps its base skill
  ([Effective skill](#effective-skill)).
- **Very high exhaustion:** Exhaustion has no upper bound and may exceed `exhaustion_incapacitation`, e.g. after a costly Mission under
  [Mission exhaustion](missions.md#mission-exhaustion) in Missions; the penalty factor is 0 once
  `skill_penalty_pct_per_exhaustion × (exhaustion − exhaustion_free_points)` reaches 100, and the Agent needs a longer
  rest before it is Fit for work ([Attribute ranges](#attribute-ranges), [Start-work gate](#start-work-gate)).
- **Exhaustion exactly at a threshold:** An Agent with exhaustion equal to `exhaustion_work_start_max` is Fit for work,
  and an Agent whose work brings its exhaustion exactly to `exhaustion_work_limit` has a Forced return
  ([Start-work gate](#start-work-gate), [Forced return](#forced-return)).
- **Assigning a tired Agent:** `assignAgents` to Contracting or Training, `startInvestigation`, and
  `assignAgentsToInvestigation` reject, as a whole, a list with an Agent that is not Fit for work; assigning it to Standby
  or deploying it is accepted ([Start-work gate](#start-work-gate)).
- **Forced return from Training:** The Agent is on Standby, At assignment, at once, so it recovers exhaustion in the Agent
  recovery step of the same Advance turn, under [Which Agents recover](agent-recovery.md#which-agents-recover) in Agent
  Recovery ([Forced return](#forced-return)).
- **Forced return of the last member of an Investigation:** The Investigation loses all its progress under
  Progress loss, although this turn's progress was added first, and becomes Abandoned ([Forced return](#forced-return)).
- **Zero current health:** A Serving Agent never has zero current health in a Committed state: the Combat that brings
  its current health to zero
  makes it Killed ([Agent status](#agent-status)). An Enemy with zero current health has an effective skill of 0
  ([Effective skill](#effective-skill)).
- **Recovery completion:** An Agent on Recovery whose current health reaches base health under
  [Agent Recovery](agent-recovery.md) becomes Standby, At assignment, at once, without transit, under
  [Assignment changes](#assignment-changes).
- **Moving within base:** An Agent moved between Standby and Training is At assignment at once, so it can be assigned
  again in the same Turn, e.g. from Training to Standby and then to Contracting, or dismissed from Standby
  ([Transit rule](#transit-rule)).
- **Deploying an Agent away:** An Agent on Contracting or an Investigation cannot be deployed; it must first be recalled
  to a Base Assignment, which costs an Advance turn of transit ([Assignment changes](#assignment-changes)).
- **Destination ends during transit:** An Agent In transit to an Investigation in the Turn-end state arrives in the
  Transit step before any Investigation can complete, so no Agent is In transit to an Investigation that ends. An Agent
  that arrives and whose Investigation then completes goes to Standby, In transit ([Transit rule](#transit-rule)).
- **Arrival and upkeep:** An arriving Agent does nothing else in its arrival Advance turn but is still counted for
  upkeep ([Transit rule](#transit-rule)).
- **Conflicting Assignments:** A Serving Agent always has exactly one Assignment; no Player action can
  give it a second one. An Agent listed twice in one `assignAgents` call is rejected
  ([Assigning Agents](#assigning-agents)).
- **Assigning to the current Assignment:** `assignAgents` with an Agent already on the target Assignment is
  rejected rather than restarting its transit ([Assigning Agents](#assigning-agents)).
- **Mixed valid and invalid Agents:** One invalid Agent rejects the whole `assignAgents` call; no listed Agent changes
  ([Assigning Agents](#assigning-agents)).
- **Deployed Agents:** A Deployed Agent is At assignment but cannot be assigned, cannot be dismissed, and is not recalled
  by any Player action ([Agents that can be assigned](#agents-that-can-be-assigned)).
- **Empty roster:** A Campaign with no Serving Agent is valid; `assignAgents` then has no Agent it can order. Whether
  the Campaign ends is decided under [Defeat](panic-and-endings.md#defeat).
- **Invalid GDRs:** A Game build with no AgentArchetype, two AgentArchetypes, an AgentArchetype `base_health` of 0, a missing or extra property, or an
  unresolved `weapon` fails [Agent GDR validation](#agent-gdr-validation), and no Campaign is created from it. A
  Committed state violating an Agent invariant, e.g. a Serving Agent with no Assignment, is an
  internal invariant violation, reported under
  [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a [Campaign ending](domain-model.md#campaign-standing), `assignAgents`, `addAgents`, and Advance turn are
  rejected, under [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending).

# Acceptance examples

All examples use the Bootstrap GDR values from `content/agents/agent_archetypes.yaml`,
`content/agents/agent_parameters.yaml`, `content/agent-recovery/recovery_parameters.yaml`, and
`content/combat/weapons.yaml`, unless an example states a test GDR. The values they read are:

| GDR                | Values read                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `field_agent`      | `name` Field agent; `base_skill` 100; `base_health` 30; `weapon` `sidearm`                                                                                                                                                                                                                                                                                                                                                                                |
| `agent_parameters` | `initial_roster_size` 4; `exhaustion_incapacitation` 100; `exhaustion_free_points` 30; `skill_penalty_pct_per_exhaustion` 1; `exhaustion_per_attack` 1; `exhaustion_per_defense` 1; `exhaustion_per_mission` 5; `exhaustion_per_pct_killed` 1; `exhaustion_per_contracting_turn` 1; `exhaustion_per_training_turn` 1; `exhaustion_per_investigation_turn` 1; `exhaustion_work_start_max` 30; `exhaustion_work_limit` 70; `training_skill_gain_per_turn` 1 |
| `recovery`         | `exhaustion_recovery_per_turn` 5, under [Agent Recovery](agent-recovery.md)                                                                                                                                                                                                                                                                                                                                                                               |
| `sidearm`          | `base_weapon_damage` 10                                                                                                                                                                                                                                                                                                                                                                                                                                   |

"The Advance turn ending Turn t" is the Advance turn committed during Turn t; the Campaign starts in Turn 1. No
Upgrade has been acquired in any example. Effects of other specifications' rules, e.g. income, appear only to show
when they apply, without their amounts.

## Effective skill computations

This example exercises [Effective skill](#effective-skill) and [Attribute ranges](#attribute-ranges). Each row is one
Combatant with `exhaustion_free_points` 30 and `skill_penalty_pct_per_exhaustion` 1, except the last row, which uses
the test value `skill_penalty_pct_per_exhaustion` 2.

| Base skill | Current health of base health | Exhaustion | Penalty factor                         | Computation                                            | Effective skill |
| ---------- | ----------------------------- | ---------- | -------------------------------------- | ------------------------------------------------------ | --------------- |
| 100        | 30 of 30                      | 0          | max(0, 100 − 1 × 0) = 100              | round down(100 × 30 × 100 / 3000) = round down(100)    | 100             |
| 100        | 15 of 30                      | 50         | max(0, 100 − 1 × 20) = 80              | round down(100 × 15 × 80 / 3000) = round down(40)      | 40              |
| 100        | 30 of 30                      | 30         | max(0, 100 − 1 × 0) = 100              | round down(100 × 30 × 100 / 3000) = round down(100)    | 100             |
| 100        | 30 of 30                      | 31         | max(0, 100 − 1 × 1) = 99               | round down(100 × 30 × 99 / 3000) = round down(99)      | 99              |
| 100        | 29 of 30                      | 0          | 100                                    | round down(100 × 29 × 100 / 3000) = round down(96.67…) | 96              |
| 130        | 22 of 30                      | 65         | max(0, 100 − 1 × 35) = 65              | round down(130 × 22 × 65 / 3000) = round down(61.97…)  | 61              |
| 100        | 30 of 30                      | 47         | max(0, 100 − 1 × 17) = 83              | round down(100 × 30 × 83 / 3000) = round down(83)      | 83              |
| 100        | 30 of 30                      | 100        | max(0, 100 − 1 × 70) = 30              | round down(100 × 30 × 30 / 3000) = round down(30)      | 30              |
| 100        | 1 of 30                       | 100        | 30                                     | round down(100 × 1 × 30 / 3000) = round down(1)        | 1               |
| 100        | 30 of 30                      | 130        | max(0, 100 − 1 × 100) = 0              | round down(0)                                          | 0               |
| 100        | 0 of 30                       | 0          | 100                                    | round down(0)                                          | 0               |
| 100        | 30 of 30                      | 85         | max(0, 100 − 2 × 55) = max(0, −10) = 0 | round down(0)                                          | 0               |

The second row is the rounding-once rule at work: the exact value 100 × 15/30 × 80/100 is 40. In the fifth and sixth
rows, rounding happens only at the end; rounding 29/30 or 65/100 first would be a violation of
[Exact evaluation](../foundation/numbers.md#exact-evaluation). The third and fourth rows are the boundary at
`exhaustion_free_points`. The seventh row is the 1% multiplicative penalty: 17 points above the free amount leave 83% of
the skill. The row with exhaustion 130 and the last row show the penalty clamp: the penalty factor is 0, never negative.
Every result lies from 0 to the Combatant's base skill.

## Exhaustion and current health clamps

This example exercises [Attribute ranges](#attribute-ranges). An Agent has exhaustion 99. In one Combat it attacks once
and defends once, so [Combat](combat.md) raises its exhaustion by `exhaustion_per_attack` 1 and `exhaustion_per_defense`
1, to 101: exhaustion has no upper clamp. Its effective skill at current health equal to its base health is then
`round down(100 × 30 × 29 / 3000) = 29`, with penalty factor `100 − 1 × 71 = 29`. An Agent on Standby with exhaustion 3
that recovers `exhaustion_recovery_per_turn` 5 has exhaustion 0, not −2. A second Combatant has current health 3 and
loses 10 health to one hit; its current health becomes 0, not −7.

## Initial roster

This example exercises [Initial roster](#initial-roster), [Agent creation](#agent-creation), and
[Agents that can be assigned](#agents-that-can-be-assigned). A new Campaign starts in Turn 1. Its initial Campaign state
contains exactly 4 Agents, each with a distinct fresh Instance ID and these values:

| Value                 | Each of the 4 Agents  |
| --------------------- | --------------------- |
| Archetype             | `field_agent`         |
| Agency                | The Campaign's Agency |
| Turn hired            | 1                     |
| Base skill            | 100                   |
| Current health        | 30                    |
| Base health           | 30                    |
| Exhaustion            | 0                     |
| Weapon                | `sidearm`             |
| Base weapon damage    | 10                    |
| Assignment            | Standby               |
| Agent status          | At assignment         |
| Participation history | Empty                 |
| Effective skill       | 100                   |
| Can be assigned       | Yes                   |

Each of them can be assigned in Turn 1, and all of these values are Player-visible information
([Player-visible information](#player-visible-information)).

## Transit: assigned to Contracting

This example exercises [Assigning Agents](#assigning-agents) and [Transit rule](#transit-rule). Agent a1 is on Standby,
At assignment, during Turn 5.

| Moment                                      | Assignment  | Agent status  | What happens to a1                                                                                            |
| ------------------------------------------- | ----------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `assignAgents([a1], Contracting)` in Turn 5 | Contracting | In transit    | The action succeeds; a1 can no longer be assigned in Turn 5.                                                  |
| Advance turn ending Turn 5                  | Contracting | At assignment | a1 arrives in the Transit step. It earns no contracting income in Agency income, and it is counted in Upkeep. |
| Turn 6                                      | Contracting | At assignment | a1 can be assigned.                                                                                           |
| Advance turn ending Turn 6                  | Contracting | At assignment | a1 was At assignment in the Turn-end state, so Agency income counts it: its first contracting income.         |

A second `assignAgents([a1], Standby)` in Turn 5, after the first, is rejected, because a1 is In transit and cannot be
assigned; a1 stays on Contracting, In transit.

## Transit: hired Agent

This example exercises [Agent creation](#agent-creation) and [Transit rule](#transit-rule). During Turn 5 the player
hires one Agent through the `hireAgent` Player action of [Economy and Upgrades](economy-and-upgrades.md). The new Agent
a5 has Turn hired 5, base skill 100, current health 30 of 30, exhaustion 0, Weapon `sidearm`, base weapon damage 10, and is on Standby,
In transit. During the rest of Turn 5, `assignAgents([a5], Training)` is rejected because a5 cannot be assigned. In the
Advance turn ending Turn 5, a5 arrives in the Transit step and is counted in Upkeep; nothing else applies to it. In Turn
6, a5 is on Standby, At assignment, and can be assigned.

## Transit: returning survivors

This example exercises [Assignment changes](#assignment-changes), [Transit rule](#transit-rule), and
[Agents that can be assigned](#agents-that-can-be-assigned). Agents a1 and a2, each on Standby, At assignment, with
current health 30 of 30, are deployed to Mission site s1 during Turn 5 through the `deployAgents` Player action of
[Missions](missions.md), which creates the Mission m1 at s1.

| Moment                         | a1                                                                                   | a2                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Right after deployment, Turn 5 | Deployed on m1, At assignment                                                        | Deployed on m1, At assignment                                                         |
| Advance turn ending Turn 5     | Fights in the Combat; ends with current health 30 of 30; becomes Standby, In transit | Fights in the Combat; ends with current health 18 of 30; becomes Recovery, In transit |
| Turn 6                         | Standby, In transit; cannot be assigned                                              | Recovery, In transit; cannot be assigned                                              |
| Advance turn ending Turn 6     | Arrives in Transit; recovers no exhaustion                                           | Arrives in Transit; recovers no current health                                        |
| Turn 7                         | Standby, At assignment; can be assigned                                              | Recovery, Recovering; cannot be assigned                                              |
| Advance turn ending Turn 7     | Recovers exhaustion, under [Agent Recovery](agent-recovery.md)                       | Recovers current health for the first time, under [Agent Recovery](agent-recovery.md) |

During Turn 5, after deployment, `assignAgents([a1], Standby)` is rejected because a1 is Deployed and cannot be assigned.
In the Advance turn ending Turn 5, a1 and a2 became In transit during the Advance turn, so both are still In transit
when it ends. Each has m1 in its Participation history from the Advance turn ending Turn 5 on.

## Transit: Deployed at once

This example exercises the Deployed exception under [Transit rule](#transit-rule). An Agent is deployed during Turn 9,
the last Turn before its Mission site would expire. It is Deployed, At assignment, immediately, so in the Turn-end state
of the Advance turn ending Turn 9 it is At assignment and fights in that Advance turn's Mission resolution. Had
deployment started In transit, it would only have arrived in that Advance turn and could not have fought.

## Transit: Investigation started and completed

This example exercises [Transit rule](#transit-rule), including the destination-ends exception. During Turn 5 the
player starts an Investigation i1 with Agent a1 through a Player action of [Investigations](investigations.md); a1 is
on i1, In transit. In the Advance turn ending Turn 5, a1 arrives and adds no progress; i1 gains its first progress in the
Advance turn ending Turn 6. Separately, Agent a3 is added to an Active Investigation i2 during Turn 8 and arrives in the
Advance turn ending Turn 8, in which the progress of the other members of i2 completes it. a3 added no progress, but
it leaves i2's Current team with the others, goes to Standby, In transit, and has i2 in its Participation history; it
arrives in the Advance turn ending Turn 9.

## Training growth

This example exercises [Training growth](#training-growth), [Transit rule](#transit-rule), and
[Effective skill](#effective-skill). Agent a1 has base skill 100, current health 30 of 30, and exhaustion 0, on Standby, At
assignment, during Turn 5.

| Moment                                   | Assignment, Agent status | Base skill | Exhaustion | Effective skill |
| ---------------------------------------- | ------------------------ | ---------- | ---------- | --------------- |
| `assignAgents([a1], Training)` in Turn 5 | Training, At assignment  | 100        | 0          | 100             |
| After the Advance turn ending Turn 5     | Training, At assignment  | 101        | 1          | 101             |
| After the Advance turn ending Turn 6     | Training, At assignment  | 102        | 2          | 102             |
| `assignAgents([a1], Standby)` in Turn 7  | Standby, At assignment   | 102        | 2          | 102             |
| After the Advance turn ending Turn 7     | Standby, At assignment   | 102        | 0          | 102             |

Moving from Standby to Training takes no transit, so a1 is At assignment in the Turn-end state of the Advance turn ending
Turn 5. In that Advance turn and the next one its Training gain Probability is `30 × 100 / (30 × 100) = 1`, because its
exhaustion is at most 30, so it gains `training_skill_gain_per_turn` 1 without any injected outcome; it then gains
`exhaustion_per_training_turn` 1 under [Work exhaustion](#work-exhaustion). After it is recalled to Standby, at once and
without transit, it keeps its base skill of 102, gains no more, and recovers its exhaustion of 2 in the Advance turn
ending Turn 7. Two Agents on Training, At assignment, in the same Advance turn each have their own Training gain outcome,
independently of each other.

Separately, Agent a2 on Training, At assignment, with base skill 100, current health 30 of 30, and exhaustion 50 has the
Training gain Probability `30 × 80 / (30 × 100) = 80 / 100`. With the injected outcome "does not gain", its base skill stays
100; with "gains", it becomes 101. Either way its exhaustion becomes 51.

## Start-work gate and Forced return

This example exercises [Start-work gate](#start-work-gate), [Work exhaustion](#work-exhaustion),
[Forced return](#forced-return), and [Assigning Agents](#assigning-agents). During Turn 20: a1 is on Contracting, At
assignment, with exhaustion 68; a2 is on Training, At assignment, with exhaustion 69; a3 is on Standby, At assignment, with
exhaustion 31; a4 is on Standby, At assignment, with exhaustion 30. Every Agent has base skill 100 and current health 30
of 30.

| Moment                                      | a1                                                                                             | a2                                                                                                | a3                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Turn 20                                     | Fit for work: no. Keeps working.                                                               | Fit for work: no. Keeps working.                                                                  | `assignAgents([a3], Contracting)` is rejected: 31 > 30. |
| Advance turn ending Turn 20, Agency income  | Earns with effective skill 62, then exhaustion 69; 69 is below 70, so it stays on Contracting. |                                                                                                   |                                                         |
| Advance turn ending Turn 20, Training       |                                                                                                | Training gain Probability 61 / 100, then exhaustion 70: Forced return, to Standby, At assignment. |                                                         |
| Advance turn ending Turn 20, Agent recovery | Does not recover.                                                                              | On Standby, At assignment, since the Turn-end state: 70 − 5 = 65.                                 | 31 − 5 = 26.                                            |
| Advance turn ending Turn 21, Agency income  | Earns with effective skill 61, then exhaustion 70: Forced return, to Standby, In transit.      | Recovers 65 − 5 = 60 in Agent recovery.                                                           | Recovers 26 − 5 = 21.                                   |
| Turn 22                                     | Standby, In transit; cannot be assigned.                                                       | Standby, At assignment; not Fit for work: `assignAgents([a2], Training)` is rejected.             | Fit for work.                                           |

In Turn 20, `assignAgents([a4], Contracting)` succeeds, because a4's exhaustion 30 equals `exhaustion_work_start_max`,
and `assignAgents([a3, a4], Contracting)` would have been rejected as a whole because of a3. Recalling a1 or a2 to Standby
in Turn 20 is accepted, because the gate applies only to Work Assignments. a1 arrives in the Advance turn ending Turn 22
and recovers from the Advance turn ending Turn 23, reaching exhaustion 30 after eight Advance turns of recovery, in the
Advance turn ending Turn 30. a2 reaches 30 in the Advance turn ending Turn 27.

## Assigning Agents: rejections and recall

This example exercises [Assigning Agents](#assigning-agents) and
[Agents that can be assigned](#agents-that-can-be-assigned). During Turn 10: a1 is on Contracting, At assignment; a2 is
on Standby, In transit; a3 is on Recovery, Recovering; a4 is Deployed; a5 is on Training, At assignment; a6 is Killed;
a7 is on Investigation i1, At assignment, together with a8. Each call is made on its own from this state, and each rejected call changes nothing:

| Call                               | Result                                                                                                                                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assignAgents([], Standby)`        | Rejected: `agents` is empty.                                                                                                                                                                    |
| `assignAgents([a1, a1], Standby)`  | Rejected: a1 is listed twice.                                                                                                                                                                   |
| `assignAgents([a1], Contracting)`  | Rejected: a1 is already on Contracting.                                                                                                                                                         |
| `assignAgents([a1, a2], Training)` | Rejected as a whole: a2 is In transit. a1 stays on Contracting, At assignment.                                                                                                                  |
| `assignAgents([a3], Standby)`      | Rejected: a3 is on Recovery.                                                                                                                                                                    |
| `assignAgents([a4], Standby)`      | Rejected: a4 is Deployed.                                                                                                                                                                       |
| `assignAgents([a6], Standby)`      | Rejected: a6 is Killed.                                                                                                                                                                         |
| `assignAgents([a5], Standby)`      | Succeeds: a5 is recalled from Training to Standby, At assignment, at once.                                                                                                                      |
| `assignAgents([a1], Standby)`      | Succeeds: a1 is recalled to Standby, In transit.                                                                                                                                                |
| `assignAgents([a7], Training)`     | Succeeds: a7 is on Training, In transit, has left i1's Current team, and has i1 in its Participation history. i1 keeps a8; what else happens to i1 follows [Investigations](investigations.md). |

## Adding Agents

This example exercises [Adding Agents](#adding-agents). During Turn 3, with Dev mode enabled and no [Autopilot
engagement](../foundation/engine-contract.md#autopilot), the Session controller calls `developer.actions.addAgents(2)`. Two Agents are created, each with a fresh
Instance ID, Turn hired 3, base skill 100, current health 30 of 30, exhaustion 0, Weapon `sidearm`, base weapon damage 10, Serving, on
Standby, In transit. The Agency's money is unchanged, and the call succeeds even when the Agency already employs as
many Agents as the Agent cap allows. It is one Player action and one Timeline entry. `addAgents(0)` and `addAgents(-1)`
are rejected and change nothing.

## Agent status and Assignment structure

This example exercises [Agent status](#agent-status) and [Assignment and Agent status](#assignment-and-agent-status). Given
the fixture of [A. Valid relationships](domain-model.md#a-valid-relationships) in Domain Model, with a1 and a2 both
Serving, the fixture satisfies both sections: each Agent has exactly one Assignment, an Investigation for a1 and
Deployed on m1 for a2, and one Agent status, In transit for a1 and At assignment for a2, and each has positive current health.

Each row independently changes that fixture and describes an invalid state.

| Change                                                      | Violation                                                                                     |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Mark a1 Killed while keeping its Assignment                 | [Agent status](#agent-status)                                                                 |
| Give a1 both a Training and an Investigation Assignment     | [Agent status](#agent-status) and [Assignment and Agent status](#assignment-and-agent-status) |
| Set the current health of a1 to zero while a1 is Serving    | [Agent status](#agent-status)                                                                 |
| Make a2 Deployed on m1 and In transit                       |
| Make a1 Recovering while its Assignment is an Investigation | [Agent status](#agent-status)                                                                 | [Assignment and Agent status](#assignment-and-agent-status) |
| Set the exhaustion of a1 to −1                              | [Attribute ranges](#attribute-ranges)                                                         |

After [C. Completion and later Participation history](domain-model.md#c-completion-and-later-participation-history)
in Domain Model, a1 and a2 are still Serving, each with one new valid Assignment and Agent status, which
satisfies [Agent status](#agent-status).

## GDR validation

This example exercises [Agent GDR validation](#agent-gdr-validation). The Bootstrap GDRs pass every rule: there is
exactly one AgentArchetype, `field_agent`, with `base_skill` 100, `base_health` 30, and `weapon` `sidearm`, which the Game build
supplies, and exactly one AgentParameters GDR, whose fourteen values are whole numbers of at least 0, with
`exhaustion_work_start_max` 30 below `exhaustion_work_limit` 70, which is at most `exhaustion_incapacitation` 100. Each of the
following test changes independently makes the Game build defective, so no Campaign is created from it: adding a
second AgentArchetype; setting `field_agent`'s `base_health` to 0; setting its `weapon` to an identifier that no Weapon GDR
has; adding a property `rank` to `field_agent`; setting `training_skill_gain_per_turn` to 0.5; setting
`exhaustion_work_start_max` to 70, which is not below `exhaustion_work_limit`; and setting `exhaustion_work_limit` to 120,
which is above `exhaustion_incapacitation`.

# TODOs

- TODO (later): Skill gained from Missions and Combats, under [Changes to attributes](#changes-to-attributes).
- TODO (later): Career statistics beyond Participation history, under
  [Participation history records](#participation-history-records).
- TODO (later): Transit durations that differ between Assignments, under [Transit rule](#transit-rule).
- TODO (later): Selection among several AgentArchetypes, under [Agent GDR validation](#agent-gdr-validation).
