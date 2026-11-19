# Combat

| Metadata | Value |
| --- | --- |
| Spec ID | COMBAT |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Enemies and the Combat GDRs, how a Combat is fought in Combat rounds, attacks and their random outcomes, Incapacitated, Combat rating, Combat outcomes, and the Combat report. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Combat](domain-model.md#combat) is where preparation is tested. The player decides which [Agents](agents-spec.md) to deploy to a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) and then has no further say: the Agents and the [Enemies](domain-model.md#glossary) there fight automatically, and the whole Combat is resolved within one Advance turn.

Everything about a Combat follows from one rule: fighting only wears [Combatants](domain-model.md#combat) down. Every attack, hit or miss, raises exhaustion, and a hit removes current health, so effective skill can only fall while a Combat lasts. A Combatant whose current health reaches zero is [Killed](agents-spec.md#agent-statuses), and one whose effective skill falls too far or whose exhaustion grows too high is Incapacitated and stops fighting. The Combat is fought in Combat rounds until no [Enemy](domain-model.md#combat) can fight on, no [Agent](domain-model.md#agency-and-agents) can, or the Agents retreat, and because exhaustion keeps rising, every Combat ends. Its [Combat report](domain-model.md#combat) records every attack.

Combat builds on [Agents](agents-spec.md): Agents says what makes a Combatant strong, and Combat says how that strength is spent against an opponent.

![How a Combat fits between a Mission and the Turn report: deploying Agents to a Mission site creates a Deployed Mission; in the Mission resolution step its Combat is fought from Combat start through Combat rounds, each attack appended to the Combat log, until it ends with one Combat outcome; the Combat produces exactly one Combat report, which is part of the Turn report returned by getTurnReport() and reduced in a History entry, and the Combat outcome decides whether the Mission is Won or Lost](../../../images/diagrams/combat-terms.svg)

# Glossary

These terms are specific to [Combat](domain-model.md#combat). General terms are in the [Domain Model glossary](domain-model.md#glossary); terms about [base skill](agents-spec.md#combatant-attributes), [current health](agents-spec.md#combatant-attributes), [exhaustion](agents-spec.md#combatant-attributes), and [base weapon damage](agents-spec.md#combatant-attributes) are in the [Agents glossary](agents-spec.md#glossary).

## Combat rounds and results

How a Combat is divided, and how it ends.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Combat round | One pass of a Combat in which every [Combatant](domain-model.md#combat) able to fight attacks once. | Round, naming a pass of a Combat |
| Agents' phase | The first part of a Combat round, in which each [Agent](domain-model.md#agency-and-agents) of the Agents' side takes one Combat turn, in the fixed order of its side. |  |
| Enemies' phase | The second part of a Combat round, in which each [Enemy](domain-model.md#combat) of the Enemies' side takes one Combat turn, in the fixed order of its side. |  |
| Combat turn | One Combatant's part in a phase: it attacks once if it is able to fight, and otherwise does nothing. | Turn, naming a Combatant's part in a phase |
| Combat log | The list of every attack of one Combat, in the order in which it was made, kept in its [Combat report](domain-model.md#combat). |  |
| Health removed | The current health one attack takes from its defender: the smaller of the damage outcome and the defender's current health before the attack, or 0 on a miss. | Damage, as a noun on its own |
| Damage dealt | The sum of the health removed by every attack one participant made in one Combat. |  |
| Damage taken | The sum of the health removed by every attack on one participant in one Combat. It is equivalent to the participant's [health lost](agents-spec.md#combatant-attributes): the current health it lost in that Combat. |  |
| Combat outcome | How a Combat ended for the [Agency](domain-model.md#agency-and-agents)'s team: Prevailed, when no Enemy can fight on; Wiped, when no Agent can fight on; or Retreated, when the team withdrew. | Battle outcome |

## Combatant condition in a Combat

Whether a Combatant still takes part in a Combat, and how strong it and its side are.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Incapacitated | Alive but too weakened to take further part in the current Combat. |  |
| Able to fight | Alive and not Incapacitated, so still attacking and still liable to be attacked. |  |
| Combat rating | How strong a Combatant or a side is in a Combat: the [effective skill](agents-spec.md#combatant-attributes) of one Combatant, or the sum of the effective skill of a side's Combatants able to fight. | Combat strength; combat power |
| Round-start effective skill | A Combatant's effective skill at the moment the current Combat round began. An attacker compares it when choosing whom to attack, so that a Combatant does not become a different kind of opponent as it is worn down within the Combat round. |  |
| Attacks received | The number of attacks made on a Combatant so far in the current Combat round. |  |
| Taking cover | A Combatant with health lost staying out of reach of one attacker while that attacker chooses whom to attack, decided by a cover outcome. It lasts for that one choice only. | Self-removal |

# Combat GDRs

Enemies and Combats are configured by the three [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling) below and by three AgentParameters values. The GDRs a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## EnemyArchetype

An EnemyArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of an Enemy. The table below is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Enemy. | [Player-visible information](#player-visible-information) |
| `base_skill` | The base skill of a newly created Enemy. | [Enemy creation](#enemy-creation) |
| `base_health` | The [base health](agents-spec.md#combatant-attributes) of a newly created Enemy, which starts with no health lost. | [Enemy creation](#enemy-creation) |
| `weapon` | A reference to the Weapon GDR a newly created Enemy is equipped with. | [Enemy creation](#enemy-creation) |

Which EnemyArchetypes a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions)'s Enemies have, and how many of each, is supplied by the Mission site's MissionSiteArchetype, under [Missions](missions.md).

## Weapon

A Weapon GDR describes the base weapon damage of the Combatants equipped with it. The table below is exhaustive apart from `id` and `type`.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Weapon. | [Player-visible information](#player-visible-information) |
| `base_weapon_damage` | The base weapon damage of a newly created Combatant equipped with this Weapon, in health points. | [Enemy creation](#enemy-creation); [Agent creation](agents-spec.md#agent-creation) in Agents, for Agents |

A Combatant's base weapon damage is a value of the Combatant, set from `base_weapon_damage` at creation; a Combat reads the Combatant's [effective weapon damage](agents-spec.md#combatant-attributes), never the Weapon's `base_weapon_damage`. An Agent's effective weapon damage can exceed its Weapon's `base_weapon_damage`, under [Effective weapon damage](agents-spec.md#effective-weapon-damage) in Agents. Individual inventory items are out of scope.

## CombatParameters

CombatParameters bundles the scalar values that Combats read. The table below is exhaustive apart from `id` and `type`. Each value is a ratio, not a stored quantity, and is read as the exact decimal number it is written as, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers.

| Property | Meaning | Read by |
| --- | --- | --- |
| `weapon_damage_range` | How far a damage outcome may lie below or above the attacker's effective weapon damage, as a fraction of that effective weapon damage. | [Damage outcome](#damage-outcome) |
| `retreat_below_agent_rating_fraction` | The fraction of the Agents' side's Combat rating at Combat start below which the team considers retreating. | [End-of-Combat-round checks](#end-of-combat-round-checks) |
| `retreat_at_enemy_to_agent_rating` | The ratio of the Enemies' side's Combat rating to the Agents' side's Combat rating at or above which a team that considers retreating retreats. | [End-of-Combat-round checks](#end-of-combat-round-checks) |
| `incapacitation_skill_fraction` | The fraction of a Combatant's base skill at or below which its effective skill makes it Incapacitated. | [Incapacitation condition](#incapacitation-condition) |
| `target_skill_min_fraction` | The lowest Round-start effective skill an attacker prefers in a target, as a fraction of the attacker's own Round-start effective skill. | [Target selection](#target-selection) |
| `target_skill_preferred_fraction` | The Round-start effective skill an attacker most prefers in a target, as a fraction of the attacker's own Round-start effective skill. | [Target selection](#target-selection) |
| `target_skill_max_fraction` | The highest Round-start effective skill an attacker prefers in a target, as a fraction of the attacker's own Round-start effective skill. | [Target selection](#target-selection) |

## AgentParameters values this document reads

Combats read seven values of [AgentParameters](agents-spec.md#agentparameters), and read exhaustion's effect on effective skill only through [Effective skill](agents-spec.md#effective-skill):

| Property | Meaning and use | Read by |
| --- | --- | --- |
| `exhaustion_per_attack` | The exhaustion an attacking Combatant gains from each of its attacks, hit or miss. | [Effects of an attack](#effects-of-an-attack) |
| `exhaustion_per_defense` | The exhaustion a defending Combatant gains from each attack made on it, hit or miss. | [Effects of an attack](#effects-of-an-attack) |
| `exhaustion_incapacitation` | The exhaustion at or above which a Combatant meets the incapacitation condition. | [Incapacitation condition](#incapacitation-condition); [Termination](#termination) |
| `experience_per_attack_hit` | The [combat experience](agents-spec.md#growth) an attacking Agent earns from each of its attacks that hits. | [Combat experience](#combat-experience) |
| `experience_per_attack_miss` | The combat experience an attacking Agent earns from each of its attacks that misses. | [Combat experience](#combat-experience) |
| `experience_per_defense_hit` | The combat experience a defending Agent earns from each attack on it that hits. | [Combat experience](#combat-experience) |
| `experience_per_defense_miss` | The combat experience a defending Agent earns from each attack on it that misses. | [Combat experience](#combat-experience) |

## Combat GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for EnemyArchetype, Weapon, CombatParameters, `exhaustion_per_attack`, and `exhaustion_per_defense`, and it adds to [Agent GDR validation](agents-spec.md#agent-gdr-validation) in Agents. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **One CombatParameters:** The Game build supplies exactly one CombatParameters GDR.
2. **EnemyArchetype values are valid:** Each EnemyArchetype's `base_skill` is a whole number of at least 0, its `base_health` is a whole number of at least 1, and its `weapon` references a Weapon GDR the Game build supplies.
3. **Weapon values are valid:** Each Weapon's `base_weapon_damage` is a whole number of at least 1.
4. **Damage range is valid:** `weapon_damage_range` is a decimal number from 0 to 1, both included. This guarantees that both bounds of every damage outcome are whole numbers of at least 0 with the lower bound at most the upper bound, under [Damage outcome](#damage-outcome).
5. **Retreat thresholds are valid:** `retreat_below_agent_rating_fraction` and `retreat_at_enemy_to_agent_rating` are each a decimal number of at least 0.
6. **Incapacitation threshold is valid:** `incapacitation_skill_fraction` is a decimal number of at least 0 and less than 1.
7. **Every attack tires someone:** `exhaustion_per_attack + exhaustion_per_defense` is at least 1.
8. **Exact properties:** Each EnemyArchetype, Weapon, and CombatParameters GDR has exactly the properties its table above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
9. **Target skill fractions are valid:** `target_skill_min_fraction`, `target_skill_preferred_fraction`, and `target_skill_max_fraction` are each a decimal number of at least 0, and `target_skill_min_fraction ≤ target_skill_preferred_fraction ≤ target_skill_max_fraction`.

Rule 7, together with the exhaustion clause of the [Incapacitation condition](#incapacitation-condition), guarantees that every Combat ends, under [Termination](#termination). [Agent GDR validation](agents-spec.md#agent-gdr-validation) in Agents makes `exhaustion_incapacitation` a whole number of at least 1.

# Enemies

Enemies are the opponents the Agency's Agents fight at a Mission site. Each is a Combatant like an Agent, but it belongs to its Mission site alone and never recovers.

## Enemy properties

**Proposed rule:** An Enemy is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is an EnemyArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) and [State](../foundation/core-concepts.md#campaign-instances) have exactly the following properties. This table is exhaustive.

| Property | Part | Value | Classification and range |
| --- | --- | --- | --- |
| Mission site | Constants | An Immutable reference to the Mission site at which the Enemy is present. | [Authoritative value](../foundation/core-concepts.md#value-classification). Always exactly one Mission site, under [How concepts relate](domain-model.md#how-concepts-relate). |
| [Base skill](agents-spec.md#combatant-attributes) | State | The Enemy's base skill. | Authoritative value. A whole number of at least 0. No rule changes it after creation. |
| [Health lost](agents-spec.md#combatant-attributes) | State | The Enemy's health lost. | Authoritative value. A whole number under [Attribute ranges](agents-spec.md#attribute-ranges). |
| [Base health](agents-spec.md#combatant-attributes) | State | The Enemy's base health. | Authoritative value. A whole number of at least 1. No rule changes it after creation. |
| Exhaustion | State | The Enemy's exhaustion. | Authoritative value. A whole number under [Attribute ranges](agents-spec.md#attribute-ranges). |
| Weapon | State | A reference to the Weapon GDR the Enemy is equipped with. | Authoritative value. Always resolves to a Weapon GDR the Game build supplies. No rule changes it after creation. |
| [Base weapon damage](agents-spec.md#combatant-attributes) | State | The Enemy's base weapon damage. | Authoritative value. A whole number of at least 1. No rule changes it after creation. |

These are exactly the properties the [Combatant Role Type](agents-spec.md#combatant-role-type) requires; Weapon and base weapon damage together are the equipped weapon values. An Enemy also has four [Derived values](../foundation/core-concepts.md#value-classification), which are never stored: its [effective max health](agents-spec.md#combatant-attributes), which equals its base health, and its current health, under [Effective max health and current health](agents-spec.md#effective-max-health-and-current-health) in Agents; its effective skill, under [Effective skill](agents-spec.md#effective-skill) in Agents, and its Combat rating, under [Combat rating](#combat-rating). An Enemy has no lifecycle, no [Assignment](domain-model.md#agency-and-agents), and no [Turn series](../foundation/world-history.md#glossary). An Enemy whose current health is 0 is dead; being dead is a Derived value of its current health, not a stored state.

**Retention:** An Enemy keeps every property above for the whole Campaign, so that every reference to it resolves, e.g. from a Combat report. An Enemy becomes [Retired](../foundation/world-history.md#glossary) when its Mission site becomes Retired, and is kept in the [Retired world state](../foundation/campaign-state.md#glossary) with its final values, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Enemy is ever removed.

## Enemy creation

**Proposed rule:** Every Enemy is created together with the Mission site at which it is present, under [Missions](missions.md). Each new Enemy has a fresh [Instance ID](../foundation/campaign-instances.md#glossary) under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

| Value | Initial value | Source |
| --- | --- | --- |
| Archetype reference | The EnemyArchetype the Enemy is created from. | The creating rule of Missions. |
| Mission site | The Mission site being created. | The creating rule of Missions. |
| Base skill | The EnemyArchetype's `base_skill`. | `base_skill` of the EnemyArchetype. |
| Base health | The EnemyArchetype's `base_health`. | `base_health` of the EnemyArchetype. |
| Health lost | 0. | This rule. |
| Exhaustion | 0. | This rule. |
| Weapon | The Weapon GDR that the EnemyArchetype's `weapon` references. | `weapon` of the EnemyArchetype. |
| Base weapon damage | The `base_weapon_damage` of that Weapon GDR. | `base_weapon_damage` of the Weapon GDR. |

No [Upgrade](economy-and-upgrades.md#glossary) and no [Campaign configuration](../foundation/campaign-state.md#glossary) value changes any initial value above. Two Enemies created from the same EnemyArchetype are distinct Campaign instances that share neither Instance ID nor current health.

## Changes to Enemy values

An Enemy changes only while it is fought, so an Enemy that no Combat reaches keeps the values it was created with.

**Proposed rule:** The following list is the exhaustive set of rules that change an Enemy's values after its creation:

- An attack on the Enemy in a Combat lowers its current health, under [Effects of an attack](#effects-of-an-attack).
- An attack made by or on the Enemy in a Combat raises its exhaustion, under [Effects of an attack](#effects-of-an-attack).

No rule raises an Enemy's current health or lowers its exhaustion: Enemies never recover. Base skill, base health, Weapon, and base weapon damage never change. An Enemy's values after its Combat are therefore its final values, and an Enemy whose Mission site is never fought over keeps its initial values.

# Combats

A Combat turns a deployment into a result without any choice from the player. These rules fix what a Combat reads, what it produces, and when it happens.

## Combat inputs and outputs

**Proposed rule:** A Combat is fully automatic: the player chooses who is deployed, under [Missions](missions.md), and makes no choice during the Combat. A Combat is a function of the following inputs only. This list is exhaustive.

1. **The Agents' side:** a list of one or more distinct Agents, each [Serving](agents-spec.md#agent-statuses). This is the [Mission](domain-model.md#leads-investigations-mission-sites-and-missions)'s [Current team](domain-model.md#leads-investigations-mission-sites-and-missions).
2. **The Enemies' side:** a list of zero or more distinct Enemies. These are the Mission site's Enemies.
3. **Current values:** the base skill, current health, effective max health, exhaustion, and effective weapon damage of every Combatant in the two lists, as they are when the Combat begins.
4. **GDR values:** the four values of CombatParameters, and `exhaustion_incapacitation`, `exhaustion_free_points`, `skill_penalty_pct_per_exhaustion`, `exhaustion_per_attack`, `exhaustion_per_defense`, `experience_per_attack_hit`, `experience_per_attack_miss`, `experience_per_defense_hit`, and `experience_per_defense_miss` of AgentParameters.
5. **Random outcomes:** the named random outcomes of its attacks, under [Hit outcome](#hit-outcome) and [Damage outcome](#damage-outcome).

The order of each list is the fixed order of its side, under [Fixed order of each side](#fixed-order-of-each-side). Nothing else influences a Combat; e.g., the turn number, the Mission site's kind, and any other Agent or Enemy have no effect. Its outputs are exhaustive too:

1. The Combat report, under [Combat report](#combat-report), which also holds the combat experience of every Agent, under [Combat experience](#combat-experience).
2. The changed current health and exhaustion of the Combatants of both lists, and the [Agent status](domain-model.md#agency-and-agents) [Killed](agents-spec.md#agent-statuses) of every Agent whose current health reached 0, under [Killed and Incapacitated](#killed-and-incapacitated).

An Agents' side that is empty, contains an Agent twice, or contains an Agent that is not Serving, and an Enemies' side that contains an Enemy twice, are internal invariant violations under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract, not expected cases. [Missions](missions.md) guarantees valid lists when it has a Combat fought.

## Combat-only properties

**Proposed rule:** The exhaustive set of gained properties of the [Combatant Role Type](agents-spec.md#combatant-role-type) is one property:

| Gained property | Type | Initial value | Meaning |
| --- | --- | --- | --- |
| Incapacitated | Yes or no | Set at Combat start under [Combat start](#combat-start) | Whether the Combatant is Incapacitated, under [Killed and Incapacitated](#killed-and-incapacitated). |

Every Combatant in either list gains Incapacitated when the Combat begins and loses it when the Combat ends, whatever its value then. Its value at the end of the Combat is recorded in the Combat report, under [Combat report](#combat-report); it affects nothing after the Combat. E.g., an Agent that was Incapacitated at the end of a Combat is an ordinary Serving Agent afterward, with the current health and exhaustion the Combat left it.

A Combatant is able to fight, during a Combat, exactly when its current health is greater than 0 and it is not Incapacitated. Being able to fight is a Derived value.

## Incapacitation condition

**Inherited behavior** for the skill clause; **Proposed rule** for the exhaustion clause. A Combatant meets the incapacitation condition exactly when its current health is greater than 0 and at least one of the following holds:

```text
effective skill  ≤  incapacitation_skill_fraction × base skill        (skill clause)
exhaustion       ≥  exhaustion_incapacitation                         (exhaustion clause)
```

where effective skill is computed under [Effective skill](agents-spec.md#effective-skill) in Agents from the Combatant's values at that moment, base skill and exhaustion are its own values at that moment, `incapacitation_skill_fraction` is the CombatParameters value, and `exhaustion_incapacitation` is the AgentParameters value. Each comparison is exact, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers; the right-hand side of the skill clause is never rounded. E.g., with a fraction of 0.1 a Combatant of base skill 40 meets it at an effective skill of 4 or less, and one of base skill 125 at 12 or less, since 12 ≤ 12.5 < 13. E.g., with the Bootstrap values, a Combatant at full current health with exhaustion 100 has effective skill 30% of its base skill, above the skill clause, and meets the condition through the exhaustion clause alone.

A Combatant of base skill 0 meets the condition whenever it is alive, because its effective skill is 0. A Combatant that does not meet it has an effective skill of at least 1, because its effective skill is greater than a value of at least 0.

Outside a Combat, a Combatant is able to fight exactly when its current health is greater than 0 and it does not meet the incapacitation condition. This is the definition [Combat rating](#combat-rating) uses outside a Combat, e.g. for a Mission site's Enemies before any team is deployed. Within a Combat the two definitions always agree, under [Monotonicity within a Combat](#monotonicity-within-a-combat).

## Combat timing

**Proposed rule:** A Combat begins and ends within one [Turn advancement step](turn-advancement.md#glossary) of one Advance turn, the step in which [Missions](missions.md) has it fought; nothing else happens between its first and its last attack. No [World state](../foundation/engine-contract.md#player-actions-and-turns) therefore contains a Combat in progress, a Combat round, or the Incapacitated property. Only the Combat's outputs are ever part of a World state.

# Combat rating

**Proposed rule:** The Combat rating of one Combatant is its effective skill, under [Effective skill](agents-spec.md#effective-skill) in Agents. The Combat rating of a side, i.e. of a list of Combatants, is the sum of the effective skills of those of its Combatants that are able to fight:

```text
Combat rating of a side = Σ effective skill(c)   over every Combatant c of the side that is able to fight
```

Inputs: each effective skill is a whole number of at least 0; whether a Combatant is able to fight is decided under [Combat-only properties](#combat-only-properties) during a Combat and under [Incapacitation condition](#incapacitation-condition) outside one. No rounding occurs, because every term is a whole number. The result is a whole number of at least 0; it is 0 exactly when no Combatant of the side is able to fight, because every Combatant able to fight has an effective skill of at least 1.

Combat rating is a Derived value and is never stored, except where the Combat report records it under [Combat report](#combat-report). It is computed from the values at the moment it is read. **Informative rationale:** game-ts also weighted current health and base weapon damage; v5 uses effective skill alone, which already falls with lost current health and exhaustion.

# Combat flow

A Combat proceeds in a fixed order, so the only chance in it comes from which wounded opponents take cover from an attacker and from the attacks themselves. These rules decide who acts when, and whom each Combatant attacks.

## Fixed order of each side

**Proposed rule:** Each side has a fixed order for the whole Combat: the order of its input list under [Combat inputs and outputs](#combat-inputs-and-outputs). The Agents' side is ordered as the Current team's list is given, and the Enemies' side as the Mission site's list of Enemies is given. The fixed order never changes during the Combat; a Combatant that dies or becomes Incapacitated keeps its position and is skipped. The Combat report records both orders.

**Informative rationale:** The order is not derived from Instance IDs, because the format of an Instance ID is the Implementer's choice and so defines no order.

## Combat start

**Proposed rule:** When a Combat begins, before any Combat round:

1. Every Combatant of both sides gains Incapacitated, set to yes exactly when the Combatant meets the [Incapacitation condition](#incapacitation-condition) with its current values, and to no otherwise. An Enemy whose current health is already 0 is dead and is not Incapacitated.
2. The Combat report records each Combatant's starting values and the Combat rating of each side, under [Combat report](#combat-report). The Combat rating of the Agents' side at this moment is its starting Combat rating, which the Retreated check reads.
3. If no Enemy is able to fight, the Combat ends with the Combat outcome Prevailed after 0 Combat rounds. Otherwise, if no Agent is able to fight, it ends with the Combat outcome Wiped after 0 Combat rounds. Otherwise the first Combat round begins.

A Combat that ends at its start makes no attack and changes no value of any Combatant.

## Combat rounds

**Proposed rule:** Combat rounds are numbered from 1. Each Combat round consists of two phases, in this order:

1. **Agents' phase:** each Agent of the Agents' side takes one Combat turn, in the fixed order of its side.
2. **Enemies' phase:** each Enemy of the Enemies' side takes one Combat turn, in the fixed order of its side.

On its Combat turn, a Combatant that is not able to fight at that moment does nothing. A Combatant that is able to fight selects a target under [Target selection](#target-selection); if no opponent is able to fight it does nothing, and otherwise it makes exactly one attack on the target, under [Attacks](#attacks). Every effect of an attack applies immediately, before the next Combat turn, so every later Combat turn, target selection, and attack in the same Combat round reads the changed values; the one exception is the Round-start effective skill that [Target selection](#target-selection) compares. E.g., an Enemy killed in the Agents' phase does not attack in the Enemies' phase of the same Combat round.

When a Combat round begins, before its Agents' phase, the Round-start effective skill of every Combatant of both sides is set to its effective skill at that moment, and the Attacks received of every Combatant is set to 0. Each attack raises the Attacks received of its defender by 1.

After the Enemies' phase, the [End-of-Combat-round checks](#end-of-combat-round-checks) decide whether the Combat ends or another Combat round begins.

## Target selection

An attacker spreads its side's attacks over the opponents and prefers an opponent it clearly outclasses, while a wounded opponent may take cover.

**Inherited behavior** for the three steps; **Proposed rule** for the tie-breaks and for the fallback of step 3. An attacker selects its target at the moment of its Combat turn, in these steps. An opponent is a Combatant of the other side.

1. **Reachable opponents:** The reachable opponents are the opponents able to fight at that moment. When there is none, there is no target and no later step applies. An opponent that is not able to fight is never a target.
2. **Taking cover:** Each reachable opponent whose current health is below its effective max health has one named random outcome, its cover outcome for this target selection, whose possible values are takes cover and stays. It takes cover with the [Probability](../foundation/numbers.md#glossary)

   ```text
   cover Probability = (H − h) / H
   ```

   where `h` is the opponent's current health and `H` its effective max health, both read at that moment. A reachable opponent with no health lost has no cover outcome and stays. The candidates are the reachable opponents that stay. When every reachable opponent takes cover, the candidates are all reachable opponents instead.

3. **Choice:** Let `a` be the attacker's Round-start effective skill and `s(o)` that of a candidate `o`. A candidate is preferred exactly when

   ```text
   target_skill_min_fraction × a  ≤  s(o)  ≤  target_skill_max_fraction × a
   ```

   The candidates are considered in groups of equal Attacks received, from the lowest Attacks received upward. The target is taken from the first group that holds a preferred candidate: the preferred candidate of that group whose distance `| s(o) − target_skill_preferred_fraction × a |` is smallest. Among several at the smallest distance, the target is the one with the lowest `s(o)`, and among those the one that comes earliest in the fixed order of its side. When no group holds a preferred candidate, the target is the candidate with the lowest Attacks received, and among several the one that comes earliest in the fixed order of its side.

| Symbol | Meaning                                               | Unit and domain                                  |
| ------ | ----------------------------------------------------- | ------------------------------------------------ |
| `h`    | The opponent's current health.                        | Health points; greater than 0 and less than `H`. |
| `H`    | The opponent's effective max health.                  | Health points; at least 1.                       |
| `a`    | The attacker's Round-start effective skill.           | Skill points; a whole number of at least 1.      |
| `s(o)` | The Round-start effective skill of the candidate `o`. | Skill points; a whole number of at least 1.      |

The cover Probability is the exact ratio of `H − h` to `H`, under [Probabilities](../foundation/numbers.md#probabilities) in Numbers: it is never rounded and never stored, and it lies strictly between 0 and 1 because `0 < h < H`. Every comparison of step 3 is exact, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, and no product is rounded. Each cover outcome is independent of every other random outcome. The cover outcomes of one target selection are decided in the fixed order of the opponents' side, and a Combatant that takes cover from one attacker is a reachable opponent again in the next target selection, with a new cover outcome.

The attacker and every candidate were able to fight when the Combat round began, because no Combatant becomes able to fight during a Combat, under [Monotonicity within a Combat](#monotonicity-within-a-combat); each therefore has a Round-start effective skill of at least 1, under [Incapacitation condition](#incapacitation-condition). Whenever a reachable opponent exists, the steps select exactly one target.

E.g., with the Bootstrap values, an attacker whose Round-start effective skill is 100 prefers candidates from 20 to 80 and most prefers 50. Against candidates of Round-start effective skill 40, 60, and 120, all with Attacks received 0, both 40 and 60 are preferred and are equally far from 50, so the target is the one of 40. Once that candidate has Attacks received 1, the next attacker of 100 targets the one of 60. Once that one has Attacks received 1 too, a further attacker of 100 finds no preferred candidate in the group with Attacks received 0, which holds only the candidate of 120, and so targets the candidate of 40 again, the nearest to 50 in the group with Attacks received 1; the candidate of 120 is targeted only when no group holds a preferred candidate.

**Informative rationale:** This is the game-ts target selection. It spreads attacks, so that a large side cannot bring every attack to bear on one opponent in one Combat round, and it lets strong Combatants cut down the weak before they face each other. game-ts chose at random where no candidate was preferred; here the fixed order decides, so that the cover outcomes are the only chance in target selection. An earlier v5 rule targeted the opponent with the highest effective skill.

# Attacks

An attack is made by one attacker on one defender, its target. It has one hit outcome and, when the hit outcome is a hit, one damage outcome. These are the attack's own random outcomes; the only other random outcomes of a Combat are the cover outcomes of [Target selection](#target-selection). Each outcome depends only on the values its section names, and is independent of every other random outcome, except that a damage outcome exists only for an attack whose hit outcome is a hit. No random outcome of a Combat is hidden from the player.

## Hit outcome

**Inherited behavior:** Each attack has one named random outcome, the hit outcome, whose possible values are hit and miss. It is a hit with the [Probability](../foundation/numbers.md#glossary)

```text
hit Probability = A² / (A² + D²)
```

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| A | The attacker's effective skill, read at the moment of the attack, before any effect of that attack. | Skill points; a whole number of at least 1. |
| D | The defender's effective skill, read at the same moment. | Skill points; a whole number of at least 1. |

The Probability is the exact ratio of the two whole numbers `A²` and `A² + D²`, under [Probabilities](../foundation/numbers.md#probabilities) in Numbers: it is never rounded and never stored. Both A and D are at least 1, because attacker and defender are both able to fight, under [Incapacitation condition](#incapacitation-condition); so the divisor is at least 2, A = D = 0 cannot occur, and the Probability lies strictly between 0 and 1. No clamp is needed. It is a miss with the Probability `D² / (A² + D²)`.

## Damage outcome

**Proposed rule:** Each attack whose hit outcome is a hit has one named random outcome, the damage outcome. It is a uniform whole-number outcome, under [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes) in Numbers, over the inclusive range from `lo` to `hi`:

```text
lo = round up( w × (1 − weapon_damage_range) )
hi = round down( w × (1 + weapon_damage_range) )
```

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| w | The attacker's effective weapon damage. | Health points; a whole number of at least 1. |
| `weapon_damage_range` | The CombatParameters value. | An exact decimal number from 0 to 1, both included. |

Each bound is evaluated exactly and rounded once, with [Round up](../foundation/numbers.md#glossary) for `lo` and [Round down](../foundation/numbers.md#glossary) for `hi`, under [Rounding](../foundation/numbers.md#rounding) in Numbers, before the range is formed. Because w is a whole number, `w × (1 − weapon_damage_range) ≤ w ≤ w × (1 + weapon_damage_range)` gives `0 ≤ lo ≤ w ≤ hi`, so the range is never empty. Each of the `hi − lo + 1` values has the Probability `1 / (hi − lo + 1)`. The damage outcome does not depend on the defender. [Effective weapon damage](agents-spec.md#combatant-attributes) does not change during a Combat, so the range of one attacker is the same for all its attacks.

**Proposed rule:** A damage outcome supplied from outside the Combat, e.g. by a random outcome override under [Random outcome overrides](../foundation/developer-access.md#random-outcome-overrides) in Developer Access, must be one of the whole numbers from `lo` to `hi`; any other value is rejected and never applied.

## Effects of an attack

**Proposed rule:** One attack applies these effects, in this order, before the next Combat turn begins:

1. **Read:** A and D are read, and the hit Probability is formed, under [Hit outcome](#hit-outcome).
2. **Hit outcome:** The attack has its hit outcome. The damage outcome exists only when the hit outcome is a hit.
3. **Health removed:** On a hit, the defender's current health falls by the damage outcome, under [Damage outcome](#damage-outcome), but not below 0. The health removed is the smaller of the damage outcome and the defender's current health before this step. On a miss, current health does not change and the health removed is 0.
4. **Exhaustion:** The attacker gains `exhaustion_per_attack` exhaustion and the defender gains `exhaustion_per_defense` exhaustion, hit or miss. No upper clamp applies, under [Attribute ranges](agents-spec.md#attribute-ranges) in Agents.
5. **Evaluation:** The defender and then the attacker are evaluated under [Killed and Incapacitated](#killed-and-incapacitated), with their values after steps 3 and 4.

The order of steps 3 and 4 affects no result, because nothing reads the values between them. No other value changes; in particular base skill, [Experience](agents-spec.md#growth), base health, and base weapon damage are unchanged, and no Combatant other than the attacker and the defender is affected.

## Combat experience

Every attack an Agent makes or takes teaches it something, a hit more than a miss when it attacks and a miss more than a hit when it defends, but the Agent keeps the lesson only if it lives through the Mission.

**Proposed rule:** Every Agent of the Agents' side has a combat experience in each Combat: the sum, over every attack of the Combat log in which it is the attacker or the defender, of the amount in this table. The table is exhaustive.

| The Agent's part in the attack | Hit outcome | Amount                        |
| ------------------------------ | ----------- | ----------------------------- |
| Attacker                       | Hit         | `experience_per_attack_hit`   |
| Attacker                       | Miss        | `experience_per_attack_miss`  |
| Defender                       | Hit         | `experience_per_defense_hit`  |
| Defender                       | Miss        | `experience_per_defense_miss` |

Each amount is a whole number of at least 0 of AgentParameters, so the combat experience is a whole number of at least 0, and 0 for an Agent that neither attacked nor was attacked. It counts every attack whatever the health removed, the damage outcome, or whether the attack made someone dead, and an attack that made the Agent dead counts too. An Enemy has no combat experience. A Combat changes no base skill or Experience, under [Effects of an attack](#effects-of-an-attack), so combat experience earned early in a Combat does not strengthen the Agent later in the same Combat: the Combat reports it, and [Mission growth](agents-spec.md#mission-growth) in Agents adds it to a survivor's Experience, and with it to its base skill, after the Combat.

**Inherited behavior:** The four amounts and the rule that only survivors keep them are taken from game-ts.

## Killed and Incapacitated

**Proposed rule:** Each evaluation of a Combatant under [Effects of an attack](#effects-of-an-attack) applies the first of these that holds:

1. **Dead:** Its current health is 0. It is dead and is not Incapacitated. A dead Agent becomes Killed at this moment, under [Agent status](agents-spec.md#agent-status) in Agents, and its Killed by references the attacker and the attacker's Mission site. A dead Enemy stays an Enemy with current health 0, and the Enemies killed of the attacking Agent rises by 1, under [Service record](agents-spec.md#service-record) in Agents.
2. **Incapacitated:** It meets the [Incapacitation condition](#incapacitation-condition). Its Incapacitated property becomes yes, if it was not already.
3. Otherwise nothing changes.

Only the defender can die in an attack, because only the defender loses current health. Both can become Incapacitated. A dead or Incapacitated Combatant is not able to fight: it makes no further attack and is never a target for the rest of the Combat, so its current health and exhaustion do not change again in that Combat. An Incapacitated Combatant is alive: an Incapacitated Agent survives the Combat and is not Killed.

**Inherited behavior:** The incapacitation threshold, i.e. an effective skill at or below a fraction of base skill, is taken from game-ts.

## Monotonicity within a Combat

Within a Combat, base skill and effective max health are constant, current health never rises, and exhaustion never falls. Every factor of the [Effective skill](agents-spec.md#effective-skill) formula that can change therefore never rises, so a Combatant's effective skill never rises during a Combat. It follows that a Combatant that meets the [Incapacitation condition](#incapacitation-condition) keeps meeting it, that no Combatant becomes able to fight again once it is not, and that only the attacker and defender of an attack can change whether they meet the condition. The evaluations under [Combat start](#combat-start) and [Killed and Incapacitated](#killed-and-incapacitated) therefore keep Incapacitated equal, at every moment of a Combat, to "alive and meets the incapacitation condition".

# Combat end

A Combat stops when one side can no longer fight, or when the Agents are losing badly enough to withdraw. These rules decide when that happens and how the Combat ended, and show that every Combat ends.

## End-of-Combat-round checks

**Inherited behavior** for the two retreat thresholds; **Proposed rule** for the order. After the Enemies' phase of each Combat round, these checks are made in this order, and the first that holds ends the Combat with its Combat outcome:

1. **Prevailed:** No Enemy is able to fight.
2. **Wiped:** No Agent is able to fight.
3. **Retreated:** Both of the following hold, each compared exactly under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, with no rounding:

   ```text
   R_agents  <  retreat_below_agent_rating_fraction × R_start
   R_enemies ≥  retreat_at_enemy_to_agent_rating   × R_agents
   ```

   where `R_agents` and `R_enemies` are the Combat ratings of the Agents' side and the Enemies' side at the end of the Combat round, and `R_start` is the starting Combat rating of the Agents' side under [Combat start](#combat-start).

When none holds, the next Combat round begins. The checks are made only after the Enemies' phase; e.g., a Combat round whose Agents' phase leaves no Enemy able to fight still completes its Enemies' phase, in which no Enemy attacks, before the Combat ends as Prevailed. The number of Combat rounds of the Combat is the number of the Combat round after which a check held, or 0 when the Combat ended at its start.

## Combat outcomes

**Proposed rule:** A Combat ends with exactly one Combat outcome. The set is exhaustive:

| Combat outcome | When |
| --- | --- |
| Prevailed | No Enemy is able to fight, at Combat start or after a Combat round. Checked first, so it holds even when no Agent is able to fight either. |
| Wiped | Some Enemy, but no Agent, is able to fight, at Combat start or after a Combat round. |
| Retreated | After a Combat round, Agents and Enemies are both able to fight and the Retreated check of [End-of-Combat-round checks](#end-of-combat-round-checks) holds. |

A Combat outcome is final. Every Agent of a Combat that ends as Retreated or Wiped keeps the values the Combat left it; the Combat outcome itself changes no Combatant value. Whether the Mission is then Won or Lost, and what becomes of each surviving Agent, follows from the Combat outcome under [Missions](missions.md).

## Termination

**Proposed rule:** Every Combat ends, after at most `N × X` Combat rounds, where `N` is the number of Combatants of both sides and `X` is `exhaustion_incapacitation`. This holds for every Game build that passes [Combat GDR validation](#combat-gdr-validation) and [Agent GDR validation](agents-spec.md#agent-gdr-validation), whatever the random outcomes, including when every hit outcome is a miss, and including Combatants that never attack or are never attacked. The argument counts the capped total exhaustion `T`, the sum over every Combatant of the Combat of `min(exhaustion, X)`:

1. **Exhaustion of `X` or more ends fighting.** A Combatant alive with exhaustion of at least `X` meets the exhaustion clause of the [Incapacitation condition](#incapacitation-condition), so it is Incapacitated: at Combat start, or after the attack that raised its exhaustion to `X` or more. Every Combatant able to fight therefore has an exhaustion below `X`.
2. **Every attack raises `T`.** Attacker and defender are both able to fight before the attack, so each has an exhaustion below `X`, and the attack raises the attacker's `min(exhaustion, X)` by at least `min(1, exhaustion_per_attack)` and the defender's by at least `min(1, exhaustion_per_defense)`. By rule 7 of [Combat GDR validation](#combat-gdr-validation) one of these is at least 1, so `T` rises by at least 1 with every attack.
3. **`T` is bounded.** No rule lowers exhaustion during a Combat, and each Combatant adds at most `X` to `T`, so `T` starts at 0 or more and never exceeds `N × X`. At most `N × X` attacks can therefore happen in one Combat.
4. **Every Combat round that is fought has an attack.** A Combat round begins only when an Agent and an Enemy are both able to fight, under [Combat start](#combat-start) and [End-of-Combat-round checks](#end-of-combat-round-checks). Let `a` be the first Agent in the fixed order of its side that is able to fight when the Combat round begins. Before `a`'s Combat turn only Agents that are not able to fight have had a Combat turn, so no attack has happened, `a` is still able to fight, and an Enemy is still able to fight; so `a` attacks.

By 3 and 4 no Combat has more than `N × X` Combat rounds. A Combatant that is never attacked and never attacks plays no part in this argument: the bound counts attacks, not the exhaustion of each Combatant.

# Combat report

**Proposed rule:** Every Combat produces exactly one Combat report. It holds exactly the following facts, and this list is exhaustive:

1. **Combat outcome:** Prevailed, Retreated, or Wiped.
2. **Number of Combat rounds:** a whole number of at least 0.
3. **Participants:** the Agents' side and the Enemies' side, each as the list of Instance IDs in its fixed order.
4. **Starting values:** for each participant, its base skill, current health, effective max health, exhaustion, effective weapon damage, effective skill, and Incapacitated value when the Combat began, after [Combat start](#combat-start) step 1.
5. **Final values:** for each participant, its current health, exhaustion, and effective skill when the Combat ended, and its final condition: able to fight, Incapacitated, or dead. A dead Agent is Killed.
6. **Damage dealt and damage taken:** for each participant, its damage dealt, i.e. the sum of the health removed by its attacks, and its damage taken, i.e. the sum of the health removed by attacks on it; and for each Agent, its combat experience, under [Combat experience](#combat-experience).
7. **Combat ratings:** the Combat rating of each side at Combat start and at the end of every Combat round.
8. **Combat log:** every attack, in the order in which it was made, each with its Combat round number, its attacker and defender by Instance ID, the opponents that took cover in its target selection by Instance ID, A and D, the hit Probability as the pair of whole numbers `A²` and `A² + D²`, the hit outcome, the damage outcome when there is one, the health removed, the current health and exhaustion of the attacker and the defender after the attack, and whether the attack made the defender dead or the defender or the attacker Incapacitated.
9. **Mission:** the Instance ID of the Mission whose Combat it records, which [Missions](missions.md) supplies when it has the Combat fought. It influences nothing in the Combat.

A participant's base skill, effective max health, and effective weapon damage do not change in a Combat, so its final values need not repeat them. All values are whole numbers, except that each hit Probability is the pair of whole numbers named above, and that an Agent's base skill and current health, and so the health removed from an Agent and the damage dealt and damage taken that sum it, are [Decimal quantities](../foundation/numbers.md#glossary), under [Attribute ranges](agents-spec.md#attribute-ranges) in Agents. E.g., a damage outcome of 10 against an Agent with current health 5.60 removes 5.60.

The Combat report is an Authoritative value. It is part of the [Turn report](../foundation/campaign-state.md#glossary) of the Advance turn in which its Combat was fought, and no Mission or other Campaign instance holds it. `player.queries.getTurnReport()` returns every fact above until the next Advance turn replaces that Turn report, under [Current state, Turn report, and history](../foundation/world-history.md#current-state-turn-report-and-history) in Engine Contract. How the Turn report organizes its Combat reports is left to the implementation. Once produced, a Combat report is never rewritten or recomputed, even when the values of its participants change later, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. Whatever presents a Combat later uses the [retained](../foundation/world-history.md#glossary) values. After the next Advance turn, only the facts that its [History entry](../foundation/world-history.md#glossary) holds need to remain available, under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report. The History entry of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) the Advance turn ends holds, of each Combat report, only its Combat outcome, its number of Combat rounds, its participants, for each participant its current health and effective skill at Combat start and at Combat end and its final condition, and the Combat rating of each side at Combat start and at Combat end, beside what [Turn report](missions.md#turn-report) in Missions states it holds of that Combat's Mission. Combat end is the end of the last Combat round, or Combat start when the Combat had no Combat round. These are the values a Concluded Mission site is shown with for the rest of the Campaign, so the [History](../foundation/campaign-state.md#glossary) keeps what each participant came in with and left with, but not the Combat log, the damage dealt and taken, or the other starting values.

# Player-visible information

**Proposed rule:** Every value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces) under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces) from the moment it exists, without a reveal condition. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| An Enemy's Instance ID, its EnemyArchetype including the EnemyArchetype's `name`, and its Mission site | Yes |
| An Enemy's base skill, current health, base health, exhaustion, Weapon, and base weapon damage | Yes |
| An Enemy's effective skill and Combat rating, and the Combat rating of any side, e.g. of a Mission site's Enemies | Yes |
| Every fact of a Combat report, including every random outcome it records | Yes |
| Every property of each EnemyArchetype, Weapon, and CombatParameters GDR, and the meaning of `exhaustion_per_attack`, `exhaustion_per_defense`, and the four combat experience amounts of AgentParameters | Yes |

Incapacitated and a Combat in progress never exist in a World state, under [Combat timing](#combat-timing), so the player observes them only through the Combat report. **Unknown versus absent:** No value in the table above is hidden, so Player API never reports one as unknown. A damage outcome is absent, not zero, for an attack whose hit outcome is a miss; its health removed is 0. A Turn report holds a Combat report only for each Combat its Advance turn fought; a Mission whose Combat has not been fought has no Combat report anywhere.

# Edge cases and failure behavior

- **Empty Enemies' side:** No Enemy is able to fight at Combat start, so the Combat ends as Prevailed after 0 Combat rounds, with no attack and no change to any Agent ([Combat start](#combat-start)).
- **No Agent able to fight at Combat start:** When every Agent meets the incapacitation condition at Combat start, e.g. because of high exhaustion, and some Enemy is able to fight, the Combat ends as Wiped after 0 Combat rounds; every Agent survives unchanged ([Combat start](#combat-start)).
- **Single Combatant on a side:** A side of one Combatant is valid. Every attacker of the other side targets it while it is able to fight ([Target selection](#target-selection)).
- **Agent with lost current health or with exhaustion at Combat start:** The Combat starts from the Agent's current health and exhaustion. Its effective skill and the starting Combat rating reflect them, and it is Incapacitated from the start if it meets the incapacitation condition ([Combat start](#combat-start), [Combat rating](#combat-rating)).
- **Enemy with effective skill 0:** An alive Enemy whose effective skill is 0, e.g. one with base skill 0, meets the incapacitation condition, so it is Incapacitated from Combat start, never attacks, and is never a target ([Incapacitation condition](#incapacitation-condition)).
- **Enemy already dead at Combat start:** An Enemy with current health 0 is dead, not able to fight, and not Incapacitated ([Combat start](#combat-start)).
- **Attacker with no target:** An attacker able to fight with no opponent able to fight does nothing on its Combat turn and gains no exhaustion and no combat experience ([Combat rounds](#combat-rounds), [Combat experience](#combat-experience)).
- **Combat experience of a Killed Agent:** The Combat report records it like any other Agent's, but it is never added to Experience or base skill ([Combat experience](#combat-experience)).
- **Zero divisor:** The hit Probability's divisor is at least 2, because both effective skills are at least 1 ([Hit outcome](#hit-outcome)).
- **Damage outcome above remaining current health:** Current health falls to 0, not below; the health removed is the defender's remaining current health ([Effects of an attack](#effects-of-an-attack)).
- **Damage outcome of 0:** With a `weapon_damage_range` of 1 a damage outcome can be 0; the hit removes no current health but still raises exhaustion ([Damage outcome](#damage-outcome)).
- **Exhaustion of `exhaustion_incapacitation` or more:** A Combatant reaching it is Incapacitated whatever its effective skill, and its exhaustion is not clamped; an Agent may start a Combat with exhaustion above it and is then Incapacitated from the start ([Incapacitation condition](#incapacitation-condition), [Termination](#termination)).
- **Simultaneous end conditions:** When no Combatant of either side is able to fight, the outcome is Prevailed. When no Agent is able to fight and the Retreated check would also hold, the outcome is Wiped ([End-of-Combat-round checks](#end-of-combat-round-checks)).
- **Ties in target selection:** Among preferred candidates equally far from the most preferred skill, the one with the lowest Round-start effective skill is the target, and among those the earliest in the fixed order ([Target selection](#target-selection)).
- **Every reachable opponent takes cover:** The candidates are then all reachable opponents, so an attacker with a reachable opponent always has a target ([Target selection](#target-selection)).
- **No preferred candidate:** When no candidate's Round-start effective skill lies within the preferred range, e.g. every opponent is stronger than the attacker, the target is the candidate with the lowest Attacks received, the earliest in the fixed order among several ([Target selection](#target-selection)).
- **Every attack misses:** The Combat still ends, through Incapacitated or Retreated, within `N × exhaustion_incapacitation` Combat rounds ([Termination](#termination)).
- **Invalid inputs:** An empty Agents' side, a duplicate Combatant, or an Agent that is not Serving is an internal invariant violation ([Combat inputs and outputs](#combat-inputs-and-outputs)).
- **Invalid GDRs:** A Game build that fails [Combat GDR validation](#combat-gdr-validation), e.g. with a Weapon `base_weapon_damage` of 0, a `weapon_damage_range` of 1.5, or `exhaustion_per_attack` and `exhaustion_per_defense` both 0, is defective and no Campaign is created from it.

# TODOs

- TODO (later): Morale.
