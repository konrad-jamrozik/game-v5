# Combat

| Metadata    | Value                                                                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | COMBAT                                                                                                                                                                       |
| Family      | Mechanics                                                                                                                                                                    |
| Status      | Draft                                                                                                                                                                        |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                  |
| Owns        | Enemies and the Combat GDRs, how a Battle is fought Round by Round, attacks and their random outcomes, Incapacitated, Combat rating, Battle outcomes, and the Battle result. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                               |

# Overview

This document defines how a [Battle](#glossary) is fought and what it produces. A Battle is fully automatic: the player
chooses who is deployed, under [Missions](missions.md), and this document decides everything that happens after that.
It owns:

- What an [Enemy](domain-model.md#glossary) has, how each Enemy is created from its EnemyArchetype, and that Enemies
  never recover.
- The Game Data Record (GDR) Types EnemyArchetype, Weapon, and CombatParameters, the meaning of the two AgentParameters
  values `exhaustion_per_attack` and `exhaustion_per_defense`, and the validation rules for all of them.
- The fixed order of each side, the structure of a Round, target selection, the attack with its two named random
  outcomes, when a Combatant dies or becomes Incapacitated, Combat rating, the end-of-round checks that give the Battle
  outcome, and the guarantee that every Battle ends.
- What a Battle result holds, and which of these values are Player-visible information.

Combat is specified and testable without the rest of the Campaign. Its input is a list of Agents, a list of Enemies,
their current values, and the GDRs it reads; its output is the Battle result and the changed values of those Agents and
Enemies. What a Battle result means for the Campaign, e.g. whether the Mission site is Won or Lost, its rewards, and
where the surviving Agents go next, is owned by [Missions](missions.md). When a Battle is fought, i.e. in which Turn
advancement step and for which Mission sites, is owned by [Missions](missions.md) and
[Turn Advancement](turn-advancement.md). These are ownership pointers; this document relies on neither.

This document refines Domain Model's combatant contract: it states the exhaustive set of gained properties of the
[Combatant Role Type](domain-model.md#combatant-role-type), what an Enemy has within
[Attribute bounds](domain-model.md#attribute-bounds), and which facts a Battle result retains under
[Combat and consequences](domain-model.md#combat-and-consequences). It also refines Agents'
[Changes to attributes](agents-spec.md#changes-to-attributes) with how a Battle lowers health and raises exhaustion and
when an Agent's health reaches zero, within the ranges of [Attribute ranges](agents-spec.md#attribute-ranges). It uses
Agents' [Effective skill](agents-spec.md#effective-skill) unchanged, and [Numbers](../foundation/numbers.md) for exact
arithmetic, rounding, Probabilities, and [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes).
Among the Mechanics specifications, this document depends only on Domain Model and Agents.

The following features are out of scope and are not specified here, e.g. skill or experience gained by attacking and
defending, morale, and target selection that matches attackers to defenders by skill. With them out of scope, a Battle
changes only the health and exhaustion of its Combatants. Partial success of a Lost Mission site is also out of scope;
[Missions](missions.md) owns its deferral.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Agents](./agents-spec.md)
- Refines [Domain Model](domain-model.md)
- Used by [Agent Recovery](./agent-recovery.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Missions](./missions.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

Agent, Enemy, Combatant, Combatant Role Type, Battle result, Mission site, Mission, and Current team are defined by the
[Domain Model glossary](domain-model.md#glossary). Skill, Effective skill, Health, Maximum health, Exhaustion, Weapon
damage, and Deployed are defined by the [Agents glossary](agents-spec.md#glossary); the Agent lifecycle state Killed is
owned by [Agent lifecycle](agents-spec.md#agent-lifecycle). Campaign instance, Instance ID, Archetype, Constants,
State, and World history are defined by the [Campaign State glossary](../foundation/campaign-state.md#glossary). GDR,
Authoritative value, and Derived value are defined by the [Core Concepts glossary](../foundation/core-concepts.md#glossary).
Player-visible information and Committed state are defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). Round down, Round up, and Probability are defined
by the [Numbers glossary](../foundation/numbers.md#glossary).

## Battles

The fight itself, how it is divided, and how it ends.

| Term           | Definition                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Battle         | One armed clash between the Agents deployed to a Mission site and the Enemies there, resolved in full within one Advance turn.                            |
| Round          | One pass of a Battle in which every Combatant able to fight attacks once.                                                                                 |
| Battle outcome | How a Battle ended for the Agency's team: Prevailed, when no Enemy can fight on; Wiped, when no Agent can fight on; or Retreated, when the team withdrew. |

## Combatant condition in a Battle

Whether a Combatant still takes part in a Battle, and how strong it and its side are.

| Term          | Definition                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incapacitated | Alive but too weakened to take further part in the current Battle.                                                                                             |
| Able to fight | Alive and not Incapacitated, so still attacking and still liable to be attacked.                                                                               |
| Combat rating | How strong a Combatant or a side is in a Battle: the effective skill of one Combatant, or the sum of the effective skill of a side's Combatants able to fight. |

# Combat GDRs

This document owns the three GDR Types below and the meaning of two AgentParameters values, and states which rule reads
each property. A rule in this document names the property it reads and never copies a GDR value; only the
[Acceptance examples](#acceptance-examples) show values. The GDRs a Game build supplies, and their values, are listed by
[Bootstrap GDRs](../content/bootstrap-gdrs.md) and the YAML files it names.

## EnemyArchetype

An EnemyArchetype is the Archetype of an Enemy. The following property table is exhaustive apart from the `id` and
`type` that every GDR has.

| Property | Meaning                                                               | Read by                                                   |
| -------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the kind of Enemy.                                | [Player-visible information](#player-visible-information) |
| `skill`  | The skill of a newly created Enemy.                                   | [Enemy creation](#enemy-creation)                         |
| `health` | The maximum health of a newly created Enemy, and also its health.     | [Enemy creation](#enemy-creation)                         |
| `weapon` | A reference to the Weapon GDR a newly created Enemy is equipped with. | [Enemy creation](#enemy-creation)                         |

Which EnemyArchetypes a Mission site's Enemies have, and how many of each, is supplied by the Mission site's
MissionSiteArchetype, which [Missions](missions.md) owns.

## Weapon

A Weapon GDR describes damage configuration, under [Weapons and upgrades](domain-model.md#weapons-and-upgrades) in
Domain Model. This document owns the Weapon Type. The following property table is exhaustive apart from `id` and
`type`.

| Property | Meaning                                                                                     | Read by                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `name`   | The display name of the Weapon.                                                             | [Player-visible information](#player-visible-information)                                                |
| `damage` | The weapon damage of a newly created Combatant equipped with this Weapon, in health points. | [Enemy creation](#enemy-creation); [Agent creation](agents-spec.md#agent-creation) in Agents, for Agents |

A Combatant's weapon damage is a value of the Combatant, set from `damage` at creation; the Battle reads the
Combatant's weapon damage, never the Weapon's `damage`. An Agent's weapon damage can differ from its Weapon's `damage`
under [Modifiable values](agents-spec.md#modifiable-values) in Agents.

## CombatParameters

CombatParameters bundles the scalar values this document's rules read. The following property table is exhaustive apart
from `id` and `type`. Each value is a ratio, not a stored quantity, and is read as the exact decimal number it is
written as, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers.

| Property                              | Meaning                                                                                                                                         | Read by                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `weapon_damage_range`                 | How far a damage outcome may lie below or above the attacker's weapon damage, as a fraction of that weapon damage.                              | [Damage outcome](#damage-outcome)                     |
| `retreat_below_agent_rating_fraction` | The fraction of the Agents' side's Combat rating at Battle start below which the team considers retreating.                                     | [End-of-round checks](#end-of-round-checks)           |
| `retreat_at_enemy_to_agent_rating`    | The ratio of the Enemies' side's Combat rating to the Agents' side's Combat rating at or above which a team that considers retreating retreats. | [End-of-round checks](#end-of-round-checks)           |
| `incapacitation_skill_fraction`       | The fraction of a Combatant's skill at or below which its effective skill makes it Incapacitated.                                               | [Incapacitation condition](#incapacitation-condition) |

## AgentParameters values this document reads

[AgentParameters](agents-spec.md#agentparameters) is owned by Agents. This document owns the meaning of two of its
values and reads three more:

| Property                           | Meaning and use                                                                                     | Read by                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `exhaustion_per_attack`            | The exhaustion an attacking Combatant gains from each of its attacks, hit or miss. Owned here.      | [Effects of an attack](#effects-of-an-attack)                                                  |
| `exhaustion_per_defense`           | The exhaustion a defending Combatant gains from each attack made on it, hit or miss. Owned here.    | [Effects of an attack](#effects-of-an-attack)                                                  |
| `exhaustion_cap`                   | Owned by Agents; the clamp of exhaustion under [Attribute ranges](agents-spec.md#attribute-ranges). | [Effects of an attack](#effects-of-an-attack); [Combat GDR validation](#combat-gdr-validation) |
| `exhaustion_free_points`           | Owned by Agents; an input of [Effective skill](agents-spec.md#effective-skill).                     | [Combat GDR validation](#combat-gdr-validation)                                                |
| `skill_penalty_pct_per_exhaustion` | Owned by Agents; an input of [Effective skill](agents-spec.md#effective-skill).                     | [Combat GDR validation](#combat-gdr-validation)                                                |

## Combat GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDRs and
values this document owns, and it adds to [Agent GDR validation](agents-spec.md#agent-gdr-validation) in Agents. A Game
build whose GDRs violate one of these rules is defective: no Campaign is created from it, and the violation is reported
as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One CombatParameters:** The Game build supplies exactly one CombatParameters GDR.
2. **EnemyArchetype values are valid:** Each EnemyArchetype's `skill` is a whole number of at least 0, its `health` is a
   whole number of at least 1, and its `weapon` references a Weapon GDR the Game build supplies.
3. **Weapon values are valid:** Each Weapon's `damage` is a whole number of at least 1.
4. **Damage range is valid:** `weapon_damage_range` is a decimal number from 0 to 1, both included. This guarantees
   that both bounds of every damage outcome are whole numbers of at least 0 with the lower bound at most the upper
   bound, under [Damage outcome](#damage-outcome).
5. **Retreat thresholds are valid:** `retreat_below_agent_rating_fraction` and `retreat_at_enemy_to_agent_rating` are
   each a decimal number of at least 0.
6. **Incapacitation threshold is valid:** `incapacitation_skill_fraction` is a decimal number of at least 0 and less
   than 1.
7. **Every attack tires someone:** `exhaustion_per_attack + exhaustion_per_defense` is at least 1.
8. **Exhaustion at the cap incapacitates:** With `p` the `skill_penalty_pct_per_exhaustion`, `f` the
   `exhaustion_free_points`, and `X` the `exhaustion_cap` of AgentParameters, the penalty factor of
   [Effective skill](agents-spec.md#effective-skill) at an exhaustion of `X` is at most
   `100 × incapacitation_skill_fraction`:

   ```text
   max(0, 100 − p × max(0, X − f))  ≤  100 × incapacitation_skill_fraction
   ```

   The comparison is exact, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers.

9. **Exact properties:** Each EnemyArchetype, Weapon, and CombatParameters GDR has exactly the properties its table above
   lists, apart from `id` and `type`: no listed property is missing and no other property is present.

Rules 7 and 8 together guarantee that every Battle ends, under [Termination](#termination). Rule 8 is also necessary for
that guarantee: skill has no upper bound, and when the penalty factor at `X` exceeds `100 ×
incapacitation_skill_fraction`, a Combatant with a large enough skill and full health is still able to fight at
exhaustion `X`, so two such Combatants that keep missing would never stop.

# Enemies

## Enemy properties

**Proposed rule:** An Enemy is a Campaign instance whose Archetype is an EnemyArchetype. Its Archetype reference is set
when it is created and never changes. Its Constants and State have exactly the following properties. This table is
exhaustive.

| Property       | Part      | Value                                                                     | Classification and range                                                                                                        |
| -------------- | --------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Mission site   | Constants | An Immutable reference to the Mission site at which the Enemy is present. | Authoritative value. Always exactly one Mission site, under [Combat and consequences](domain-model.md#combat-and-consequences). |
| Skill          | State     | The Enemy's skill.                                                        | Authoritative value. A whole number of at least 0. No rule changes it after creation.                                           |
| Health         | State     | The Enemy's current health.                                               | Authoritative value. A whole number under [Attribute ranges](agents-spec.md#attribute-ranges).                                  |
| Maximum health | State     | The Enemy's maximum health.                                               | Authoritative value. A whole number of at least 1. No rule changes it after creation.                                           |
| Exhaustion     | State     | The Enemy's exhaustion.                                                   | Authoritative value. A whole number under [Attribute ranges](agents-spec.md#attribute-ranges).                                  |
| Weapon         | State     | A reference to the Weapon GDR the Enemy is equipped with.                 | Authoritative value. Always resolves to a Weapon GDR the Game build supplies. No rule changes it after creation.                |
| Weapon damage  | State     | The Enemy's weapon damage.                                                | Authoritative value. A whole number of at least 1. No rule changes it after creation.                                           |

These are exactly the properties the [Combatant Role Type](domain-model.md#combatant-role-type) requires; Weapon and
weapon damage together are the equipped weapon values. An Enemy also has two Derived values, which are never stored: its
effective skill, under [Effective skill](agents-spec.md#effective-skill) in Agents, and its Combat rating, under
[Combat rating](#combat-rating). An Enemy has no lifecycle, no Current assignment, and no Turn series. An Enemy whose
health is 0 is dead; being dead is a Derived value of its health, not a lifecycle state.

**Retention:** An Enemy keeps every property above for the whole Campaign, so that every reference to it resolves, e.g.
from a Battle result. Once its Mission site no longer participates in current gameplay, the Enemy is retained in World
history with its final values, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation) in Campaign State. No
Enemy is ever removed.

## Enemy creation

**Proposed rule:** Every Enemy is created together with the Mission site at which it is present; [Missions](missions.md)
owns when that happens, which EnemyArchetypes are used, and how many Enemies of each. Each new Enemy has a fresh
Instance ID under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model,
and the following initial values, under
[Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in Campaign State. This table is
exhaustive.

| Value               | Initial value                                                 | Source                          |
| ------------------- | ------------------------------------------------------------- | ------------------------------- |
| Archetype reference | The EnemyArchetype the Enemy is created from.                 | The creating rule of Missions.  |
| Mission site        | The Mission site being created.                               | The creating rule of Missions.  |
| Skill               | The EnemyArchetype's `skill`.                                 | `skill` of the EnemyArchetype.  |
| Maximum health      | The EnemyArchetype's `health`.                                | `health` of the EnemyArchetype. |
| Health              | The EnemyArchetype's `health`.                                | `health` of the EnemyArchetype. |
| Exhaustion          | 0.                                                            | This rule.                      |
| Weapon              | The Weapon GDR that the EnemyArchetype's `weapon` references. | `weapon` of the EnemyArchetype. |
| Weapon damage       | The `damage` of that Weapon GDR.                              | `damage` of the Weapon GDR.     |

No Upgrade and no Campaign configuration value changes any initial value above. Two Enemies created from the same
EnemyArchetype are distinct Campaign instances that share neither Instance ID nor health.

## Changes to Enemy values

**Proposed rule:** The following list is the exhaustive set of rules that change an Enemy's values after its creation:

- An attack on the Enemy in a Battle lowers its health, under [Effects of an attack](#effects-of-an-attack).
- An attack made by or on the Enemy in a Battle raises its exhaustion, under [Effects of an attack](#effects-of-an-attack).

No rule raises an Enemy's health or lowers its exhaustion: Enemies never recover. Skill, maximum health, Weapon, and
weapon damage never change. An Enemy's values after its Battle are therefore its final values, and an Enemy whose Mission
site is never fought over keeps its initial values.

# Battles

## Battle inputs and outputs

**Proposed rule:** A Battle is a function of the following inputs only. This list is exhaustive.

1. **The Agents' side:** a list of one or more distinct Agents, each Serving. This is the Mission's Current team.
2. **The Enemies' side:** a list of zero or more distinct Enemies. These are the Mission site's Enemies.
3. **Current values:** the skill, health, maximum health, exhaustion, and weapon damage of every Combatant in the two
   lists, as they are when the Battle begins.
4. **GDR values:** the four values of CombatParameters, and `exhaustion_cap`, `exhaustion_free_points`,
   `skill_penalty_pct_per_exhaustion`, `exhaustion_per_attack`, and `exhaustion_per_defense` of AgentParameters.
5. **Random outcomes:** the named random outcomes of its attacks, under [Hit outcome](#hit-outcome) and
   [Damage outcome](#damage-outcome).

The order of each list is the fixed order of its side, under [Fixed order of each side](#fixed-order-of-each-side).
Nothing else influences a Battle; e.g., the turn number, the Mission site's kind, and any other Agent or Enemy have no
effect. Its outputs are exhaustive too:

1. The Battle result, under [Battle result](#battle-result).
2. The changed health and exhaustion of the Combatants of both lists, and the Killed lifecycle state of every Agent whose
   health reached 0, under [Killed and Incapacitated](#killed-and-incapacitated).

An Agents' side that is empty, contains an Agent twice, or contains an Agent that is not Serving, and an Enemies' side
that contains an Enemy twice, are internal invariant violations under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract, not expected
cases. [Missions](missions.md) guarantees valid lists when it has a Battle fought.

## Battle-only properties

**Proposed rule:** The exhaustive set of gained properties of the
[Combatant Role Type](domain-model.md#combatant-role-type) is one property:

| Gained property | Type      | Initial value                                           | Meaning                                                                                              |
| --------------- | --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Incapacitated   | Yes or no | Set at Battle start under [Battle start](#battle-start) | Whether the Combatant is Incapacitated, under [Killed and Incapacitated](#killed-and-incapacitated). |

Every Combatant in either list gains Incapacitated when the Battle begins and loses it when the Battle ends, whatever
its value then. Its value at the end of the Battle is recorded in the Battle result, under
[Battle result](#battle-result); it affects nothing after the Battle. E.g., an Agent that was Incapacitated at the end of
a Battle is an ordinary Serving Agent afterward, with the health and exhaustion the Battle left it.

A Combatant is able to fight, during a Battle, exactly when its health is greater than 0 and it is not Incapacitated.
Being able to fight is a Derived value.

## Incapacitation condition

**Inherited behavior:** A Combatant meets the incapacitation condition exactly when its health is greater than 0 and

```text
effective skill  ≤  incapacitation_skill_fraction × skill
```

where effective skill is computed under [Effective skill](agents-spec.md#effective-skill) in Agents from the
Combatant's values at that moment, skill is its skill, and `incapacitation_skill_fraction` is the CombatParameters value.
The comparison is exact, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers; the right-hand
side is never rounded. E.g., with a fraction of 0.1 a Combatant of skill 40 meets it at an effective skill of 4 or less,
and one of skill 125 at 12 or less, since 12 ≤ 12.5 < 13.

A Combatant of skill 0 meets the condition whenever it is alive, because its effective skill is 0. A Combatant that does
not meet it has an effective skill of at least 1, because its effective skill is greater than a value of at least 0.

Outside a Battle, a Combatant is able to fight exactly when its health is greater than 0 and it does not meet the
incapacitation condition. This is the definition [Combat rating](#combat-rating) uses outside a Battle, e.g. for a Mission
site's Enemies before any team is deployed. Within a Battle the two definitions always agree, under
[Monotonicity within a Battle](#monotonicity-within-a-battle).

## Battle timing

**Proposed rule:** A Battle begins and ends within one Turn advancement step of one Advance turn, the step in which
[Missions](missions.md) has it fought; nothing else happens between its first and its last attack. No Committed state
therefore contains a Battle in progress, a Round, or the Incapacitated property. Only the Battle's outputs are ever part
of Committed state.

# Combat rating

**Proposed rule:** The Combat rating of one Combatant is its effective skill, under
[Effective skill](agents-spec.md#effective-skill) in Agents. The Combat rating of a side, i.e. of a list of Combatants,
is the sum of the effective skills of those of its Combatants that are able to fight:

```text
Combat rating of a side = Σ effective skill(c)   over every Combatant c of the side that is able to fight
```

Inputs: each effective skill is a whole number of at least 0; whether a Combatant is able to fight is decided under
[Battle-only properties](#battle-only-properties) during a Battle and under
[Incapacitation condition](#incapacitation-condition) outside one. No rounding occurs, because every term is a whole
number. The result is a whole number of at least 0; it is 0 exactly when no Combatant of the side is able to fight,
because every Combatant able to fight has an effective skill of at least 1.

Combat rating is a Derived value and is never stored, except where the Battle result records it under
[Battle result](#battle-result). It is computed from the values at the moment it is read. **Informative rationale:**
game-ts also weighted health and weapon damage; v5 uses effective skill alone, which already falls with lost health and
exhaustion.

# Battle flow

## Fixed order of each side

**Proposed rule:** Each side has a fixed order for the whole Battle: the order of its input list under
[Battle inputs and outputs](#battle-inputs-and-outputs). The Agents' side is ordered as the Current team's list is given,
and the Enemies' side as the Mission site's list of Enemies is given. [Missions](missions.md) owns the order in which it
supplies each list. The fixed order never changes during the Battle; a Combatant that dies or becomes Incapacitated
keeps its position and is skipped. The Battle result records both orders.

**Informative rationale:** The order is not derived from Instance IDs, because the format of an Instance ID is the
implementer's choice and so defines no order.

## Battle start

**Proposed rule:** When a Battle begins, before any Round:

1. Every Combatant of both sides gains Incapacitated, set to yes exactly when the Combatant meets the
   [Incapacitation condition](#incapacitation-condition) with its current values, and to no otherwise. An Enemy whose
   health is already 0 is dead and is not Incapacitated.
2. The Battle result records each Combatant's starting values and the Combat rating of each side, under
   [Battle result](#battle-result). The Combat rating of the Agents' side at this moment is its starting Combat rating,
   which the Retreated check reads.
3. If no Enemy is able to fight, the Battle ends with the Battle outcome Prevailed after 0 Rounds. Otherwise, if no
   Agent is able to fight, it ends with the Battle outcome Wiped after 0 Rounds. Otherwise the first Round begins.

A Battle that ends at its start makes no attack and changes no value of any Combatant.

## Rounds

**Proposed rule:** Rounds are numbered from 1. Each Round consists of two phases, in this order:

1. **Agents' phase:** each Agent of the Agents' side takes one turn, in the fixed order of its side.
2. **Enemies' phase:** each Enemy of the Enemies' side takes one turn, in the fixed order of its side.

On its turn, a Combatant that is not able to fight at that moment does nothing. A Combatant that is able to fight
selects a target under [Target selection](#target-selection); if no opponent is able to fight it does nothing, and
otherwise it makes exactly one attack on the target, under [Attacks](#attacks). Every effect of an attack applies
immediately, before the next turn, so every later turn, target selection, and attack in the same Round reads the
changed values. E.g., an Enemy killed in the Agents' phase does not attack in the Enemies' phase of the same Round.

After the Enemies' phase, the [End-of-round checks](#end-of-round-checks) decide whether the Battle ends or another
Round begins.

## Target selection

**Proposed rule:** An attacker's target is the opponent, i.e. the Combatant of the other side, that is able to fight at
the moment of the attacker's turn and has the highest effective skill at that moment. When several such opponents share
the highest effective skill, the target is the one that comes earliest in the fixed order of its side. An opponent that
is not able to fight is never a target, whatever its effective skill. When no opponent is able to fight, there is no
target.

**Informative rationale:** game-ts used a five-step target selection with random self-removal. Among four simple
targeting rules simulated with the Bootstrap GDR values, targeting the strongest opponent was the only one under which
the Victory path is winnable; this is evidence for the choice, not a requirement.

# Attacks

An attack is made by one attacker on one defender, its target. It has one hit outcome and, when the hit outcome is a
hit, one damage outcome. These are its only random outcomes; no other rule of this document is random. Each outcome
depends only on the values its section names, and is independent of every other random outcome, except that a damage
outcome exists only for an attack whose hit outcome is a hit. No random outcome of a Battle is hidden from the player.

## Hit outcome

**Inherited behavior:** Each attack has one named random outcome, the hit outcome, whose possible values are hit and
miss. It is a hit with the Probability

```text
hit Probability = A² / (A² + D²)
```

| Symbol | Meaning                                                                                             | Unit and domain                             |
| ------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| A      | The attacker's effective skill, read at the moment of the attack, before any effect of that attack. | Skill points; a whole number of at least 1. |
| D      | The defender's effective skill, read at the same moment.                                            | Skill points; a whole number of at least 1. |

The Probability is the exact ratio of the two whole numbers `A²` and `A² + D²`, under
[Probabilities](../foundation/numbers.md#probabilities) in Numbers: it is never rounded and never stored. Both A and D
are at least 1, because attacker and defender are both able to fight, under
[Incapacitation condition](#incapacitation-condition); so the divisor is at least 2, A = D = 0 cannot occur, and the
Probability lies strictly between 0 and 1. No clamp is needed. It is a miss with the Probability `D² / (A² + D²)`.

## Damage outcome

**Proposed rule:** Each attack whose hit outcome is a hit has one named random outcome, the damage outcome. It is a
uniform whole-number outcome, under [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes)
in Numbers, over the inclusive range from `lo` to `hi`:

```text
lo = round up( w × (1 − weapon_damage_range) )
hi = round down( w × (1 + weapon_damage_range) )
```

| Symbol                | Meaning                       | Unit and domain                                     |
| --------------------- | ----------------------------- | --------------------------------------------------- |
| w                     | The attacker's weapon damage. | Health points; a whole number of at least 1.        |
| `weapon_damage_range` | The CombatParameters value.   | An exact decimal number from 0 to 1, both included. |

Each bound is evaluated exactly and rounded once, with Round up for `lo` and Round down for `hi`, under
[Rounding](../foundation/numbers.md#rounding) in Numbers, before the range is formed. Because w is a whole number,
`w × (1 − weapon_damage_range) ≤ w ≤ w × (1 + weapon_damage_range)` gives `0 ≤ lo ≤ w ≤ hi`, so the range is never
empty. Each of the `hi − lo + 1` values has the Probability `1 / (hi − lo + 1)`. The damage outcome does not depend on
the defender. Weapon damage does not change during a Battle, so the range of one attacker is the same for all its
attacks.

## Effects of an attack

**Proposed rule:** One attack applies these effects, in this order, before the next turn begins:

1. **Read:** A and D are read, and the hit Probability is formed, under [Hit outcome](#hit-outcome).
2. **Hit outcome:** The attack has its hit outcome. The damage outcome exists only when the hit outcome is a hit.
3. **Damage:** On a hit, the defender's health falls by the damage outcome, under [Damage outcome](#damage-outcome), but
   not below 0. The health removed is the smaller of the damage outcome and the
   defender's health before this step. On a miss, health does not change and the health removed is 0.
4. **Exhaustion:** The attacker gains `exhaustion_per_attack` exhaustion and the defender gains `exhaustion_per_defense`
   exhaustion, hit or miss. Each is clamped at `exhaustion_cap` under [Attribute ranges](agents-spec.md#attribute-ranges)
   in Agents.
5. **Evaluation:** The defender and then the attacker are evaluated under
   [Killed and Incapacitated](#killed-and-incapacitated), with their values after steps 3 and 4.

The order of steps 3 and 4 affects no result, because nothing reads the values between them. No other value changes; in
particular skill, maximum health, and weapon damage are unchanged, and no Combatant other than the attacker and the
defender is affected.

## Killed and Incapacitated

**Proposed rule:** Each evaluation of a Combatant under [Effects of an attack](#effects-of-an-attack) applies the first
of these that holds:

1. **Dead:** Its health is 0. It is dead and is not Incapacitated. A dead Agent becomes Killed at this moment, under
   [Agent lifecycle](agents-spec.md#agent-lifecycle) in Agents, which owns what else becomes of a Killed Agent. A dead
   Enemy stays an Enemy with health 0.
2. **Incapacitated:** It meets the [Incapacitation condition](#incapacitation-condition). Its Incapacitated property
   becomes yes, if it was not already.
3. Otherwise nothing changes.

Only the defender can die in an attack, because only the defender loses health. Both can become Incapacitated. A dead or
Incapacitated Combatant is not able to fight: it makes no further attack and is never a target for the rest of the
Battle, so its health and exhaustion do not change again in that Battle. An Incapacitated Combatant is alive: an
Incapacitated Agent survives the Battle and is not Killed.

**Inherited behavior:** The incapacitation threshold, i.e. an effective skill at or below a fraction of skill, is taken
from game-ts.

## Monotonicity within a Battle

Within a Battle, skill and maximum health are constant, health never rises, and exhaustion never falls. Every factor of
the [Effective skill](agents-spec.md#effective-skill) formula that can change therefore never rises, so a Combatant's
effective skill never rises during a Battle. It follows that a Combatant that meets the
[Incapacitation condition](#incapacitation-condition) keeps meeting it, that no Combatant becomes able to fight again
once it is not, and that only the attacker and defender of an attack can change whether they meet the condition. The
evaluations under [Battle start](#battle-start) and [Killed and Incapacitated](#killed-and-incapacitated) therefore keep
Incapacitated equal, at every moment of a Battle, to "alive and meets the incapacitation condition".

# Battle end

## End-of-round checks

**Inherited behavior** for the two retreat thresholds; **Proposed rule** for the order. After the Enemies' phase of
each Round, these checks are made in this order, and the first that holds ends the Battle with its Battle outcome:

1. **Prevailed:** No Enemy is able to fight.
2. **Wiped:** No Agent is able to fight.
3. **Retreated:** Both of the following hold, each compared exactly under
   [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, with no rounding:

   ```text
   R_agents  <  retreat_below_agent_rating_fraction × R_start
   R_enemies ≥  retreat_at_enemy_to_agent_rating   × R_agents
   ```

   where `R_agents` and `R_enemies` are the Combat ratings of the Agents' side and the Enemies' side at the end of the
   Round, and `R_start` is the starting Combat rating of the Agents' side under [Battle start](#battle-start).

When none holds, the next Round begins. The checks are made only after the Enemies' phase; e.g., a Round whose
Agents' phase leaves no Enemy able to fight still completes its Enemies' phase, in which no Enemy attacks, before the
Battle ends as Prevailed. The number of Rounds of the Battle is the number of the Round after which a check held, or 0
when the Battle ended at its start.

## Battle outcomes

**Proposed rule:** A Battle ends with exactly one Battle outcome. The set is exhaustive:

| Battle outcome | When                                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Prevailed      | No Enemy is able to fight, at Battle start or after a Round. Checked first, so it holds even when no Agent is able to fight either.    |
| Wiped          | Some Enemy, but no Agent, is able to fight, at Battle start or after a Round.                                                          |
| Retreated      | After a Round, Agents and Enemies are both able to fight and the Retreated check of [End-of-round checks](#end-of-round-checks) holds. |

A Battle outcome is final. Every Agent of a Battle that ends as Retreated or Wiped keeps the values the Battle left it;
the Battle outcome itself changes no Combatant value. Whether a Mission site is then Won or Lost, and what becomes of
each surviving Agent, belongs to [Missions](missions.md).

## Termination

**Proposed rule:** Every Battle ends, after at most `N × X` Rounds, where `N` is the number of Combatants of both sides
and `X` is `exhaustion_cap`. This holds for every Game build that passes [Combat GDR validation](#combat-gdr-validation),
whatever the random outcomes, including when every hit outcome is a miss, and including Combatants that never attack or
are never attacked. The argument is:

1. **Exhaustion at the cap ends fighting.** For a Combatant alive with exhaustion `X`, its penalty factor is at most
   `100 × incapacitation_skill_fraction` by rule 8 of [Combat GDR validation](#combat-gdr-validation). Since health
   divided by maximum health is at most 1 and Round down never raises a value, its effective skill is at most
   `skill × penalty factor / 100 ≤ incapacitation_skill_fraction × skill`. It meets the
   [Incapacitation condition](#incapacitation-condition), so it is Incapacitated: at Battle start, or after the attack
   that raised its exhaustion to `X`. Every Combatant able to fight therefore has an exhaustion below `X`.
2. **Every attack raises total exhaustion.** Attacker and defender are both able to fight before the attack, so each has
   an exhaustion below `X`, and the attack raises the attacker's by at least `min(1, exhaustion_per_attack)` and the
   defender's by at least `min(1, exhaustion_per_defense)`. By rule 7 one of these is at least 1. The sum of the
   exhaustion of all Combatants of the Battle thus rises by at least 1 with every attack.
3. **Total exhaustion is bounded.** No rule lowers exhaustion during a Battle, and each Combatant's exhaustion is at most
   `X`, so the sum starts at 0 or more and never exceeds `N × X`. At most `N × X` attacks can therefore happen in one
   Battle.
4. **Every Round that is fought has an attack.** A Round begins only when an Agent and an Enemy are both able to fight,
   under [Battle start](#battle-start) and [End-of-round checks](#end-of-round-checks). Let `a` be the first Agent in
   the fixed order of its side that is able to fight when the Round begins. Before `a`'s turn only Agents that are not
   able to fight have had a turn, so no attack has happened, `a` is still able to fight, and an Enemy is still able to
   fight; so `a` attacks.

By 3 and 4 no Battle has more than `N × X` Rounds. A Combatant that is never attacked and never attacks plays no part in
this argument: the bound counts attacks, not the exhaustion of each Combatant.

# Battle result

**Proposed rule:** Every Battle produces exactly one Battle result. It holds exactly the following facts, and this list
is exhaustive:

1. **Battle outcome:** Prevailed, Retreated, or Wiped.
2. **Number of Rounds:** a whole number of at least 0.
3. **Participants:** the Agents' side and the Enemies' side, each as the list of Instance IDs in its fixed order.
4. **Starting values:** for each participant, its skill, health, maximum health, exhaustion, weapon damage, effective
   skill, and Incapacitated value when the Battle began, after [Battle start](#battle-start) step 1.
5. **Final values:** for each participant, its health, exhaustion, and effective skill when the Battle ended, and its
   final condition: able to fight, Incapacitated, or dead. A dead Agent is Killed.
6. **Health removed:** for each participant, the damage it dealt, i.e. the sum of the health removed by its attacks, and
   the damage it took, i.e. the sum of the health removed by attacks on it.
7. **Combat ratings:** the Combat rating of each side at Battle start and at the end of every Round.
8. **Attacks:** every attack, in the order in which it was made, each with its Round number, its attacker and defender
   by Instance ID, A and D, the hit Probability as the pair of whole numbers `A²` and `A² + D²`, the hit outcome, the
   damage outcome when there is one, the health removed, the health and exhaustion of the attacker and the defender
   after the attack, and whether the attack made the defender dead or the defender or the attacker Incapacitated.

A participant's skill, maximum health, and weapon damage do not change in a Battle, so its final values need not repeat
them. All values are whole numbers, except that each hit Probability is the pair of whole numbers named above.

The Battle result is an Authoritative value. [Combat and consequences](domain-model.md#combat-and-consequences) in Domain
Model places it in the Mission of the Mission site at which the Battle was fought. Once produced, it is never rewritten,
recomputed, or shortened, even when the values of its participants change later, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation) in Campaign State. Whatever
presents a Battle later uses the retained values.

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Every value is Player-visible from the moment it exists, without a reveal condition.

| Value                                                                                                                                            | Player-visible information |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| An Enemy's Instance ID, its EnemyArchetype including the EnemyArchetype's `name`, and its Mission site                                           | Yes                        |
| An Enemy's skill, health, maximum health, exhaustion, Weapon, and weapon damage                                                                  | Yes                        |
| An Enemy's effective skill and Combat rating, and the Combat rating of any side, e.g. of a Mission site's Enemies                                | Yes                        |
| Every fact of a Battle result, including every random outcome it records                                                                         | Yes                        |
| Every property of each EnemyArchetype, Weapon, and CombatParameters GDR, and the meaning of `exhaustion_per_attack` and `exhaustion_per_defense` | Yes                        |

Incapacitated and a Battle in progress never exist in a Committed state, under [Battle timing](#battle-timing), so the
player observes them only through the Battle result. **Unknown versus absent:** No value this document owns is hidden,
so Player API never reports one as unknown. A damage outcome is absent, not zero, for an attack whose hit outcome is a
miss; its health removed is 0. A Mission whose Battle has not been fought has no Battle result; Player API reports it as
absent.

# Edge cases and failure behavior

- **Empty Enemies' side:** No Enemy is able to fight at Battle start, so the Battle ends as Prevailed after 0 Rounds,
  with no attack and no change to any Agent ([Battle start](#battle-start)).
- **No Agent able to fight at Battle start:** When every Agent meets the incapacitation condition at Battle start, e.g.
  because of high exhaustion, and some Enemy is able to fight, the Battle ends as Wiped after 0 Rounds; every Agent
  survives unchanged ([Battle start](#battle-start)).
- **Single Combatant on a side:** A side of one Combatant is valid. Every attacker of the other side targets it while it
  is able to fight ([Target selection](#target-selection)).
- **Agent wounded or exhausted at Battle start:** The Battle starts from the Agent's current health and exhaustion. Its
  effective skill and the starting Combat rating reflect them, and it is Incapacitated from the start if it meets the
  incapacitation condition ([Battle start](#battle-start), [Combat rating](#combat-rating)).
- **Enemy with effective skill 0:** An alive Enemy whose effective skill is 0, e.g. one with skill 0, meets the
  incapacitation condition, so it is Incapacitated from Battle start, never attacks, and is never a target
  ([Incapacitation condition](#incapacitation-condition)).
- **Enemy already dead at Battle start:** An Enemy with health 0 is dead, not able to fight, and not Incapacitated
  ([Battle start](#battle-start)).
- **Attacker with no target:** An attacker able to fight with no opponent able to fight does nothing on its turn and
  gains no exhaustion ([Rounds](#rounds)).
- **Zero divisor:** The hit Probability's divisor is at least 2, because both effective skills are at least 1
  ([Hit outcome](#hit-outcome)).
- **Damage above remaining health:** Health falls to 0, not below; the health removed is the defender's remaining
  health ([Effects of an attack](#effects-of-an-attack)).
- **Damage of 0:** With a `weapon_damage_range` of 1 a damage outcome can be 0; the hit removes no health but still
  raises exhaustion ([Damage outcome](#damage-outcome)).
- **Exhaustion at the cap:** Exhaustion that would exceed `exhaustion_cap` is `exhaustion_cap`, and under rule 8 of
  [Combat GDR validation](#combat-gdr-validation) such a Combatant is Incapacitated ([Termination](#termination)).
- **Simultaneous end conditions:** When no Combatant of either side is able to fight, the outcome is Prevailed. When no
  Agent is able to fight and the Retreated check would also hold, the outcome is Wiped
  ([End-of-round checks](#end-of-round-checks)).
- **Ties in target selection:** The earliest opponent in the fixed order wins the tie ([Target selection](#target-selection)).
- **Every attack misses:** The Battle still ends, through Incapacitated or Retreated, within `N × exhaustion_cap` Rounds
  ([Termination](#termination)).
- **Invalid inputs:** An empty Agents' side, a duplicate Combatant, or an Agent that is not Serving is an internal
  invariant violation ([Battle inputs and outputs](#battle-inputs-and-outputs)).
- **Invalid GDRs:** A Game build that fails [Combat GDR validation](#combat-gdr-validation), e.g. with a Weapon `damage`
  of 0, a `weapon_damage_range` of 1.5, or `exhaustion_per_attack` and `exhaustion_per_defense` both 0, is defective and
  no Campaign is created from it.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/combat/enemy_archetypes.yaml`, `content/combat/weapons.yaml`,
`content/combat/combat_parameters.yaml`, `content/agents/agent_archetypes.yaml`, and
`content/agents/agent_parameters.yaml`, unless an example states a test value. The values they read are:

| GDR                 | Values read                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initiate`          | `name` Initiate; `skill` 40; `health` 20; `weapon` `sidearm`                                                                                      |
| `soldier`           | `name` Soldier; `skill` 120; `health` 30; `weapon` `rifle`                                                                                        |
| `cult_leader`       | `name` Cult leader; `skill` 300; `health` 40; `weapon` `heavy_rifle`                                                                              |
| `sidearm`           | `damage` 10                                                                                                                                       |
| `rifle`             | `damage` 14                                                                                                                                       |
| `heavy_rifle`       | `damage` 22                                                                                                                                       |
| `combat_parameters` | `weapon_damage_range` 0.5; `retreat_below_agent_rating_fraction` 0.5; `retreat_at_enemy_to_agent_rating` 0.8; `incapacitation_skill_fraction` 0.1 |
| `field_agent`       | `skill` 100; `health` 30; `weapon` `sidearm`                                                                                                      |
| `agent_parameters`  | `exhaustion_cap` 100; `exhaustion_free_points` 5; `skill_penalty_pct_per_exhaustion` 1; `exhaustion_per_attack` 1; `exhaustion_per_defense` 1     |

Unless stated otherwise, an Agent is a `field_agent` with skill 100, health 30 of 30, exhaustion 0, and weapon damage 10,
so its effective skill is 100; and an Enemy is newly created, at full health with exhaustion 0. Agents are named a1, a2,
and so on, and Enemies e1, e2, and so on; the order in which an example lists each side is its fixed order. The
incapacitation thresholds are 0.1 × skill: 10 for an Agent of skill 100, 4 for `initiate`, 12 for `soldier`, and 30 for
`cult_leader`. Effective skill is computed under [Effective skill](agents-spec.md#effective-skill) in Agents; e.g., an
Agent with health 23 of 30 and exhaustion 3 has effective skill `round down(100 × 23 × 100 / (30 × 100)) = 76`. In the
trace tables, "h" is health, "x" is exhaustion, and "eff" is effective skill.

## Enemy creation

This example exercises [Enemy creation](#enemy-creation), [Enemy properties](#enemy-properties), and
[Incapacitation condition](#incapacitation-condition). [Missions](missions.md) creates a Mission site s1 with one Enemy
of each EnemyArchetype. Each has a distinct fresh Instance ID, Mission site s1, and these values:

| EnemyArchetype | Skill | Health | Maximum health | Exhaustion | Weapon        | Weapon damage | Effective skill | Meets the incapacitation condition at an effective skill of |
| -------------- | ----- | ------ | -------------- | ---------- | ------------- | ------------- | --------------- | ----------------------------------------------------------- |
| `initiate`     | 40    | 20     | 20             | 0          | `sidearm`     | 10            | 40              | 4 or less                                                   |
| `soldier`      | 120   | 30     | 30             | 0          | `rifle`       | 14            | 120             | 12 or less                                                  |
| `cult_leader`  | 300   | 40     | 40             | 0          | `heavy_rifle` | 22            | 300             | 30 or less                                                  |

If s1 expires and its Battle is never fought, these values never change. All of them are Player-visible information
([Player-visible information](#player-visible-information)).

## Damage bounds for each Weapon

This example exercises [Damage outcome](#damage-outcome), with `weapon_damage_range` 0.5. The last row is the weapon
damage of an Agent after one acquisition of the `weapon_damage` Upgrade, whose `increment` is 1, under
[Modifiable values](agents-spec.md#modifiable-values) in Agents.

| Weapon damage w         | lo                      | hi                        | Possible damage outcomes | Probability of each |
| ----------------------- | ----------------------- | ------------------------- | ------------------------ | ------------------- |
| 10 (`sidearm`)          | round up(10 × 0.5) = 5  | round down(10 × 1.5) = 15 | 5 to 15, 11 values       | 1 / 11              |
| 14 (`rifle`)            | round up(14 × 0.5) = 7  | round down(14 × 1.5) = 21 | 7 to 21, 15 values       | 1 / 15              |
| 22 (`heavy_rifle`)      | round up(22 × 0.5) = 11 | round down(22 × 1.5) = 33 | 11 to 33, 23 values      | 1 / 23              |
| 11 (`sidearm` upgraded) | round up(5.5) = 6       | round down(16.5) = 16     | 6 to 16, 11 values       | 1 / 11              |

An injected damage outcome of 4 or 16 for a `sidearm` attacker of weapon damage 10 is outside the range and is invalid.

## Hit probabilities

This example exercises [Hit outcome](#hit-outcome). Each hit Probability is reported as the pair `A²` and `A² + D²`:

| A (attacker) | D (defender) | Hit Probability | Equal to | Miss Probability |
| ------------ | ------------ | --------------- | -------- | ---------------- |
| 100          | 40           | 10000 / 11600   | 25 / 29  | 1600 / 11600     |
| 40           | 100          | 1600 / 11600    | 4 / 29   | 10000 / 11600    |
| 100          | 120          | 10000 / 24400   | 25 / 61  | 14400 / 24400    |
| 300          | 100          | 90000 / 100000  | 9 / 10   | 10000 / 100000   |
| 100          | 100          | 10000 / 20000   | 1 / 2    | 10000 / 20000    |
| 1            | 1            | 1 / 2           | 1 / 2    | 1 / 2            |

## Target selection with ties

This example exercises [Target selection](#target-selection) and [Rounds](#rounds). Mid-Battle, the Agents' side is a1
with health 29 of 30 (effective skill `round down(96.67…) = 96`), a2, a3, and a4, a test Agent of skill 130 with full
health and exhaustion 100 (effective skill `round down(130 × 5 / 100) = 6`, Incapacitated since 6 ≤ 13). The Enemies'
side is e1 `initiate` (40), e2 `soldier` (120), and e3 `soldier` (120), all able to fight.

- In the Agents' phase, a1 targets e2: e2 and e3 share the highest effective skill, 120, and e2 is earlier. a1 hits for
  a damage outcome of 15, so e2 has health 15 of 30 and exhaustion 1, and effective skill
  `round down(120 × 15 × 100 / 3000) = 60`.
- a2 then targets e3, whose 120 is now the highest. a4 does nothing on its turn, because it is Incapacitated.
- In the Enemies' phase, while a2 and a3 both still have effective skill 100, an attacking Enemy targets a2, because a2
  is earlier. a4, whose skill is the highest, is never a target, because it is not able to fight.

## Complete Battle: two Agents against two initiates

This example exercises [Battle start](#battle-start), [Rounds](#rounds), [Target selection](#target-selection),
[Hit outcome](#hit-outcome), [Damage outcome](#damage-outcome), [Effects of an attack](#effects-of-an-attack),
[Killed and Incapacitated](#killed-and-incapacitated), [End-of-round checks](#end-of-round-checks), and
[Battle result](#battle-result). The Agents' side is a1, a2; the Enemies' side is e1, e2, both `initiate`.

At Battle start nobody meets the incapacitation condition. The starting Combat rating of the Agents' side is 200, and of
the Enemies' side 80. The Retreated check therefore needs a Combat rating of the Agents' side below 0.5 × 200 = 100.

| Round | Attacker → target         | A   | D   | Hit Probability | Injected outcomes | Health removed | Attacker after       | Target after         |
| ----- | ------------------------- | --- | --- | --------------- | ----------------- | -------------- | -------------------- | -------------------- |
| 1     | a1 → e1 (tie, e1 earlier) | 100 | 40  | 10000 / 11600   | hit; damage 12    | 12             | a1: h30, x1, eff 100 | e1: h8, x1, eff 16   |
| 1     | a2 → e2 (40 beats 16)     | 100 | 40  | 10000 / 11600   | hit; damage 15    | 15             | a2: h30, x1, eff 100 | e2: h5, x1, eff 10   |
| 1     | e1 → a1 (tie, a1 earlier) | 16  | 100 | 256 / 10256     | miss              | 0              | e1: h8, x2, eff 16   | a1: h30, x2, eff 100 |
| 1     | e2 → a1 (tie, a1 earlier) | 10  | 100 | 100 / 10100     | hit; damage 7     | 7              | e2: h5, x2, eff 10   | a1: h23, x3, eff 76  |
| 2     | a1 → e1 (16 beats 10)     | 76  | 16  | 5776 / 6032     | hit; damage 9     | 8              | a1: h23, x4, eff 76  | e1: h0, x3, dead     |
| 2     | a2 → e2 (only target)     | 100 | 10  | 10000 / 10100   | miss              | 0              | a2: h30, x2, eff 100 | e2: h5, x3, eff 10   |
| 2     | e2 → a2 (100 beats 76)    | 10  | 100 | 100 / 10100     | miss              | 0              | e2: h5, x4, eff 10   | a2: h30, x3, eff 100 |
| 3     | a1 → e2 (only target)     | 76  | 10  | 5776 / 5876     | hit; damage 5     | 5              | a1: h23, x5, eff 76  | e2: h0, x5, dead     |

End-of-round checks:

| After Round | Combat rating, Agents' side | Combat rating, Enemies' side | Result                                                             |
| ----------- | --------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| 1           | 76 + 100 = 176              | 16 + 10 = 26                 | Enemies and Agents able to fight; 176 is not below 100: next Round |
| 2           | 176                         | 10                           | Next Round, for the same reasons                                   |
| 3           | 176                         | 0                            | Prevailed                                                          |

In Round 2, e1 is dead before the Enemies' phase, so it does not attack. In Round 2 the damage outcome 9 exceeds e1's
remaining health 8, so e1's health is 0 and the health removed is 8. In Round 3, a2's turn comes after e2 is dead; with
no opponent able to fight, a2 does nothing and gains no exhaustion, and the Enemies' phase has no attack.

The Battle result holds: Battle outcome Prevailed; 3 Rounds; participants [a1, a2] and [e1, e2]; the starting values
above; final values a1 health 23, exhaustion 5, effective skill 76, able to fight; a2 health 30, exhaustion 3, effective
skill 100, able to fight; e1 health 0, exhaustion 3, dead; e2 health 0, exhaustion 5, dead; damage dealt a1 25, a2 15,
e1 0, e2 7, and damage taken a1 7, a2 0, e1 20, e2 20; the Combat ratings in the table; and the 8 attacks above with
their outcomes. a1 and a2 are both still Serving.

## Retreated

This example exercises [End-of-round checks](#end-of-round-checks) and [Battle outcomes](#battle-outcomes). The Agents'
side is a1; the Enemies' side is e1, a `soldier`. The starting Combat rating of the Agents' side is 100.

| Round | Attacker → target | A   | D   | Hit Probability | Injected outcomes | Attacker after       | Target after         |
| ----- | ----------------- | --- | --- | --------------- | ----------------- | -------------------- | -------------------- |
| 1     | a1 → e1           | 100 | 120 | 10000 / 24400   | miss              | a1: h30, x1, eff 100 | e1: h30, x1, eff 120 |
| 1     | e1 → a1           | 120 | 100 | 14400 / 24400   | hit; damage 21    | e1: h30, x2, eff 120 | a1: h9, x2, eff 30   |

a1's effective skill is `round down(100 × 9 × 100 / 3000) = 30`, above its threshold 10, so it is able to fight. After
Round 1, an Enemy and an Agent are able to fight, so neither Prevailed nor Wiped holds. The Retreated check holds:
30 < 0.5 × 100 = 50, and 120 ≥ 0.8 × 30 = 24. The Battle ends as Retreated after 1 Round. a1 survives with health 9 and
exhaustion 2; the damage outcome 21 is the highest value for `rifle`.

## Wiped, with the Retreated check also holding

This example exercises [End-of-round checks](#end-of-round-checks), [Killed and Incapacitated](#killed-and-incapacitated),
and an Agent already wounded at Battle start. The Agents' side is a1 with health 6 of 30, so effective skill
`round down(100 × 6 × 100 / 3000) = 20`; the Enemies' side is e1, a `cult_leader`. The starting Combat rating of the
Agents' side is 20.

| Round | Attacker → target | A   | D   | Hit Probability | Injected outcomes | Health removed | Attacker after       | Target after             |
| ----- | ----------------- | --- | --- | --------------- | ----------------- | -------------- | -------------------- | ------------------------ |
| 1     | a1 → e1           | 20  | 300 | 400 / 90400     | miss              | 0              | a1: h6, x1, eff 20   | e1: h40, x1, eff 300     |
| 1     | e1 → a1           | 300 | 20  | 90000 / 90400   | hit; damage 11    | 6              | e1: h40, x2, eff 300 | a1: h0, x2, dead, Killed |

a1 becomes Killed when its health reaches 0. After Round 1, e1 is able to fight and no Agent is, so the outcome is Wiped
after 1 Round. The Retreated check would also hold, since 0 < 0.5 × 20 and 300 ≥ 0.8 × 0, but Wiped is checked first.

## Incapacitated during a Battle

This example exercises [Killed and Incapacitated](#killed-and-incapacitated), [Target selection](#target-selection),
[Combat rating](#combat-rating), and [Battle-only properties](#battle-only-properties). The Agents' side is a1 with
exhaustion 94, so penalty factor `100 − 1 × 89 = 11` and effective skill 11, and a2; the Enemies' side is e1, an
`initiate`. At Battle start a1's 11 is above its threshold 10, so nobody is Incapacitated, and the starting Combat
rating of the Agents' side is 111.

| Round | Attacker → target | A   | D   | Hit Probability | Injected outcomes | Health removed | Attacker after                      | Target after         |
| ----- | ----------------- | --- | --- | --------------- | ----------------- | -------------- | ----------------------------------- | -------------------- |
| 1     | a1 → e1           | 11  | 40  | 121 / 1721      | miss              | 0              | a1: h30, x95, eff 10, Incapacitated | e1: h20, x1, eff 40  |
| 1     | a2 → e1           | 100 | 40  | 10000 / 11600   | hit; damage 10    | 10             | a2: h30, x1, eff 100                | e1: h10, x2, eff 20  |
| 1     | e1 → a2           | 20  | 100 | 400 / 10400     | miss              | 0              | e1: h10, x3, eff 20                 | a2: h30, x2, eff 100 |
| 2     | a2 → e1           | 100 | 20  | 10000 / 10400   | hit; damage 13    | 10             | a2: h30, x3, eff 100                | e1: h0, x4, dead     |

At exhaustion 95, a1's penalty factor is 10 and its effective skill 10 ≤ 0.1 × 100, so its own attack made it
Incapacitated. In the Enemies' phase of Round 1, e1 targets a2, not a1. After Round 1 the Combat rating of the Agents'
side is 100, because a1 no longer counts; 100 is not below 0.5 × 111 = 55.5, so the Battle continues. In Round 2, a1
does nothing. After Round 2 the outcome is Prevailed. The Battle result records a1's final condition as Incapacitated
with health 30 and exhaustion 95. After the Battle, a1 has no Incapacitated property; it is a Serving Agent with health
30 and exhaustion 95.

## Prevailed when neither side can fight on

This example exercises [End-of-round checks](#end-of-round-checks) and [Battle outcomes](#battle-outcomes). The
Agents' side is a1 with exhaustion 92, so penalty factor 13 and effective skill 13; the Enemies' side is e1, an
`initiate`. The starting Combat rating of the Agents' side is 13.

| Round | Attacker → target | A   | D   | Hit Probability | Injected outcomes | Health removed | Attacker after                      | Target after         |
| ----- | ----------------- | --- | --- | --------------- | ----------------- | -------------- | ----------------------------------- | -------------------- |
| 1     | a1 → e1           | 13  | 40  | 169 / 1769      | hit; damage 15    | 15             | a1: h30, x93, eff 12                | e1: h5, x1, eff 10   |
| 1     | e1 → a1           | 10  | 12  | 100 / 244       | miss              | 0              | e1: h5, x2, eff 10                  | a1: h30, x94, eff 11 |
| 2     | a1 → e1           | 11  | 10  | 121 / 221       | hit; damage 5     | 5              | a1: h30, x95, eff 10, Incapacitated | e1: h0, x3, dead     |

After Round 1 the Retreated check fails, because 11 is not below 0.5 × 13 = 6.5. After Round 2 no Enemy and no Agent is
able to fight; Prevailed is checked first, so the outcome is Prevailed after 2 Rounds. a1 survives.

## Battles that end at their start

This example exercises [Battle start](#battle-start) and the edge cases of
[Edge cases and failure behavior](#edge-cases-and-failure-behavior). Each row is a separate Battle; none makes an attack
or changes a value.

| Agents' side                                                  | Enemies' side                                                                       | Battle outcome and Rounds                                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| a1                                                            | Empty                                                                               | Prevailed, 0 Rounds                                                                                            |
| a1                                                            | e1, from a test EnemyArchetype with `skill` 0: effective skill 0 ≤ 0, Incapacitated | Prevailed, 0 Rounds                                                                                            |
| a1 with exhaustion 100: effective skill 5 ≤ 10, Incapacitated | e1, an `initiate`                                                                   | Wiped, 0 Rounds; a1 survives with health 30 and exhaustion 100                                                 |
| a1 with exhaustion 95, Incapacitated, and a2                  | e1, an `initiate`                                                                   | No end at start: a2 is able to fight, so Round 1 begins; the starting Combat rating of the Agents' side is 100 |

## Every attack misses

This example exercises [Termination](#termination). It injects a miss for every hit outcome, so no damage outcome exists
and no health changes; only exhaustion rises, by 2 per Round for each Combatant, from attacking and defending.

**Against an initiate:** The Agents' side is a1; the Enemies' side is e1, an `initiate`. After Round r with r ≥ 3, both
have exhaustion 2r, a1 has effective skill `105 − 2r`, and e1 has `round down(40 × (105 − 2r) / 100)`. The Retreated
check never holds, because the Enemies' Combat rating stays below 0.8 times the Agents'; e.g., after Round 28 the Agents'
side has 49 < 50, but the Enemies' side has `round down(19.6) = 19`, which is less than 0.8 × 49 = 39.2. In Round 47,
a1's attack raises e1's exhaustion to 93: penalty factor 12 and effective skill `round down(4.8) = 4 ≤ 4`, so e1 is
Incapacitated and does not attack in the Enemies' phase. a1 has exhaustion 93 and effective skill 12, above 10. The
Battle ends as Prevailed after 47 Rounds and 93 attacks, within the bound `N × X = 2 × 100 = 200`.

**Against a soldier:** The Agents' side is a1; the Enemies' side is e1, a `soldier`. After Round 27 both have exhaustion
54 and a1 has effective skill 51, which is not below 50. After Round 28 both have exhaustion 56: a1 has 49 < 50, and e1
has `round down(120 × 49 / 100) = 58 ≥ 0.8 × 49 = 39.2`. The Battle ends as Retreated after 28 Rounds.

## Combat ratings of Mission sites

This example exercises [Combat rating](#combat-rating) outside a Battle, with newly created Enemies whose counts come
from the MissionSiteArchetypes of [Bootstrap GDRs](../content/bootstrap-gdrs.md):

| Enemies                                    | Combat rating of the Enemies' side |
| ------------------------------------------ | ---------------------------------- |
| 3 `initiate`                               | 3 × 40 = 120                       |
| 5 `initiate`                               | 5 × 40 = 200                       |
| 4 `initiate`, 2 `soldier`                  | 160 + 240 = 400                    |
| 8 `initiate`, 1 `soldier`                  | 320 + 120 = 440                    |
| 6 `initiate`, 3 `soldier`, 1 `cult_leader` | 240 + 360 + 300 = 900              |

Four Agents with full health and exhaustion 0 have a Combat rating of 400. Four Agents of which one has exhaustion 100
have 300, because that Agent meets the incapacitation condition and does not count.

## GDR validation

This example exercises [Combat GDR validation](#combat-gdr-validation). The Bootstrap GDRs pass every rule: there is one
CombatParameters GDR; every EnemyArchetype has a whole `skill` of at least 0, a whole `health` of at least 1, and a
`weapon` the Game build supplies; every Weapon `damage` is at least 1; 0.5 lies from 0 to 1; 0.5 and 0.8 are at least 0;
0.1 is at least 0 and below 1; `exhaustion_per_attack + exhaustion_per_defense = 2 ≥ 1`; and the penalty factor at the
cap is `max(0, 100 − 1 × max(0, 100 − 5)) = 5`, which is at most `100 × 0.1 = 10`.

Each of the following test changes independently makes the Game build defective, so no Campaign is created from it:

| Test change                                                   | Rule violated                                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `skill_penalty_pct_per_exhaustion` 0                          | Exhaustion at the cap incapacitates: the penalty factor at the cap is 100 > 10            |
| `exhaustion_free_points` 95                                   | Exhaustion at the cap incapacitates: the penalty factor at the cap is `100 − 5 = 95 > 10` |
| `incapacitation_skill_fraction` 0.04                          | Exhaustion at the cap incapacitates: 5 > `100 × 0.04 = 4`                                 |
| `exhaustion_per_attack` 0 and `exhaustion_per_defense` 0      | Every attack tires someone                                                                |
| `sidearm` `damage` 0                                          | Weapon values are valid                                                                   |
| `weapon_damage_range` 1.5                                     | Damage range is valid                                                                     |
| `sidearm` has an added property `range`                       | Exact properties                                                                          |
| `cult_leader` `weapon` set to an identifier no Weapon GDR has | EnemyArchetype values are valid                                                           |
| A second CombatParameters GDR                                 | One CombatParameters                                                                      |

With `incapacitation_skill_fraction` 0.05 the Game build is valid, because 5 ≤ 5: a Combatant at exhaustion 100 with full
health has an effective skill of at most 0.05 × skill.
