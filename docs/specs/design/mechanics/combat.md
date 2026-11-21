# Combat

| Metadata | Value |
| --- | --- |
| Spec ID | COMBAT |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Enemies and the Combat GDRs, how a Combat is fought in Combat rounds, attacks and their random outcomes, Incapacitated, Combat rating with base Combat rating and Rating Upgrades, Combat outcomes, and the Combat report. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Combat](domain-model.md#combat) is where preparation is tested. The player decides which [Agents](agents-spec.md) to deploy to a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) and then has no further say: the Agents and the [Enemies](domain-model.md#glossary) there fight automatically, and the whole Combat is fought within one Advance turn. A tool that studies Combat, e.g. one that balances Enemies, can have a Combat fought on Combatants it supplies, by the very same procedure, without touching any Campaign.

Everything about a Combat follows from one rule: fighting only wears [Combatants](domain-model.md#combat) down. Every attack, hit or miss, raises exhaustion, and a hit removes what the defender's armor does not absorb from its current health, so effective skill can only fall while a Combat lasts. A Combatant whose current health reaches zero is [Killed](agents-spec.md#agent-statuses), and one whose effective skill falls too far or whose exhaustion grows too high is Incapacitated and stops fighting. The Combat is fought in Combat rounds until no [Enemy](domain-model.md#combat) can fight on, no [Agent](domain-model.md#agency-and-agents) can, or the Agents retreat, and because exhaustion keeps rising, every Combat ends. Its [Combat report](domain-model.md#combat) records every attack.

Combat builds on [Agents](agents-spec.md): Agents says what makes a Combatant strong, and Combat says how that strength is spent against an opponent.

![How a Combat fits between a Mission and the Turn report: deploying Agents to a Mission site creates a Deployed Mission; in the Mission resolution step its Combat is fought from Combat start through Combat rounds, each attack appended to the Combat log, until it ends with one Combat outcome; the Combat produces exactly one Combat report, which is part of the Turn report returned by getTurnReport() and reduced in a History entry, and the Combat outcome decides whether the Mission is Won or Lost](../../../images/diagrams/combat-terms.svg)

# Glossary

These terms are specific to [Combat](domain-model.md#combat). General terms are in the [Domain Model glossary](domain-model.md#glossary); terms about [base skill](agents-spec.md#combatant-attributes), [current health](agents-spec.md#combatant-attributes), [exhaustion](agents-spec.md#combatant-attributes), and [base weapon damage](agents-spec.md#combatant-attributes) are in the [Agents glossary](agents-spec.md#glossary).

## Combat rounds and results

How a Combat is divided, and how it ends.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Fighting a Combat | Producing a Combat's outputs from its inputs, under [Fighting a Combat](#fighting-a-combat): from Combat start through Combat rounds to its Combat outcome and [Combat report](domain-model.md#combat). It is one procedure, whoever has the Combat fought. Its verb is "fight", e.g. "the Mission resolution step has the Combat fought". | Resolving, running, computing, executing, or simulating a Combat. A Mission, not a Combat, is resolved. |
| Combat summary | How a Combat ended, which fighting it always produces, with or without its Combat report: its Combat outcome and the number of Agents that are dead when it ends, under [Fighting a Combat](#fighting-a-combat). |  |
| Detached Combat | A Combat fought by `developer.tools.fightCombat(setup)` or `developer.tools.fightCombatBatch(setup, count, stop)` on [Combatants](domain-model.md#combat) and values the caller supplies, outside every [World state](../foundation/engine-contract.md#player-actions-and-turns), whose outputs are returned and applied to nothing, under [Detached Combat](#detached-combat). | Simulated Combat; test Combat |
| Combat round | One pass of a Combat in which every [Combatant](domain-model.md#combat) able to fight attacks once, unless the Combat ends first. | Round, naming a pass of a Combat |
| Agents' phase | The first part of a Combat round, in which each [Agent](domain-model.md#agency-and-agents) of the Agents' side takes one Combat turn, in the Phase order of its side. |  |
| Enemies' phase | The second part of a Combat round, in which each [Enemy](domain-model.md#combat) of the Enemies' side takes one Combat turn, in the Phase order of its side. |  |
| Phase order | The order in which the Combatants of one side take their Combat turns in one phase: from the highest to the lowest [effective skill](agents-spec.md#combatant-attributes) at the start of the phase, ties broken by the fixed order of the side. | Initiative, naming the order of Combat turns |
| Combat turn | One Combatant's part in a phase: it attacks once if it is able to fight, and otherwise does nothing. | Turn, naming a Combatant's part in a phase |
| Hit chance | The chance that one attack hits, as a whole number of thousandths from 1 to 999, which both decides its hit outcome and is shown to the player as a percentage with one decimal place, under [Hit outcome](#hit-outcome), e.g. 996 as 99.6%. |  |
| Selection weight | How strongly an attacker is drawn to one opponent able to fight, as a whole number of at least 1; an attacker picks the opponent it attacks at random, in proportion to these weights. |  |
| Combat log | The list of every attack of one Combat, in the order in which it was made, kept in its [Combat report](domain-model.md#combat). |  |
| Armor removed | The [current armor](agents-spec.md#combatant-attributes) one attack takes from its defender: the smaller of the damage outcome and the defender's current armor before the attack, or 0 on a miss, under [Effects of an attack](#effects-of-an-attack). | Armor damage |
| Health removed | The current health one attack takes from its defender: the smaller of the damage outcome less the armor removed and the defender's current health before the attack, or 0 on a miss. | Damage, as a noun on its own |
| Damage dealt | The sum of the health removed by every attack one participant made in one Combat. |  |
| Damage taken | The sum of the health removed by every attack on one participant in one Combat. It is equivalent to the participant's [health lost](agents-spec.md#combatant-attributes): the current health it lost in that Combat. |  |
| Combat outcome | How a Combat ended for the [Agency](domain-model.md#agency-and-agents)'s team: Prevailed, when no Enemy can fight on; Wiped, when no Agent can fight on; or Retreated, when the team withdrew. | Battle outcome |

## Combatant condition in a Combat

Whether a Combatant still takes part in a Combat, and how strong it and its side are.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Incapacitated | Alive but too weakened to take further part in the current Combat. |  |
| Able to fight | Alive and not Incapacitated, so still attacking and still liable to be attacked. |  |
| Base Combat rating | How strong a Combatant or a side is by effective skill alone: the [effective skill](agents-spec.md#combatant-attributes) of one Combatant, or the sum of the effective skill of a side's Combatants able to fight, under [Combat rating](#combat-rating). |  |
| Rating Upgrades | How many purchases of the Agency's [Upgrades](domain-model.md#agency-and-agents) raise the Combat rating of a side above its base Combat rating: for the Agents' side, a whole number of at least 0 that the Upgrades counting toward it set, under [Combat rating](#combat-rating); for the Enemies' side, 0. |  |
| Combat rating | How strong a Combatant or a side is in a Combat: its base Combat rating, raised by `rating_bonus_per_upgrade` for each of its side's Rating Upgrades and rounded down, under [Combat rating](#combat-rating). | Combat strength; combat power; effective Combat rating |

# Combat GDRs

Enemies and Combats are configured by the four [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling) below and by three AgentParameters values. The GDRs a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## EnemyArchetype

An EnemyArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of an Enemy. The table below is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Enemy. | [Player-visible information](#player-visible-information) |
| `base_skill` | The base skill of a newly created Enemy. | [Enemy creation](#enemy-creation) |
| `base_health` | The [base health](agents-spec.md#combatant-attributes) of a newly created Enemy, which starts with no health lost. | [Enemy creation](#enemy-creation) |
| `weapon` | A reference to the Weapon GDR a newly created Enemy is equipped with. | [Enemy creation](#enemy-creation) |
| `armor` | A reference to the Armor GDR a newly created Enemy is equipped with. | [Enemy creation](#enemy-creation) |

Which EnemyArchetypes a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions)'s Enemies have, and how many of each, is supplied by the Mission site's MissionSiteArchetype, under [Missions](missions.md).

## Weapon

A Weapon GDR describes the base weapon damage of the Combatants equipped with it. The table below is exhaustive apart from `id` and `type`.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Weapon. | [Player-visible information](#player-visible-information) |
| `base_weapon_damage` | The base weapon damage of a newly created Combatant equipped with this Weapon, in health points. | [Enemy creation](#enemy-creation); [Agent creation](agents-spec.md#agent-creation) in Agents, for Agents |

A Combatant's base weapon damage is a value of the Combatant, set from `base_weapon_damage` at creation; a Combat reads the Combatant's [effective weapon damage](agents-spec.md#combatant-attributes), never the Weapon's `base_weapon_damage`. An Agent's effective weapon damage can exceed its Weapon's `base_weapon_damage`, under [Effective weapon damage](agents-spec.md#effective-weapon-damage) in Agents. Individual inventory items are out of scope.

## Armor

An Armor GDR describes the [base armor](agents-spec.md#combatant-attributes) of the Combatants equipped with it. Every Combatant is equipped with exactly one Armor; a Combatant that wears none is equipped with an Armor whose `base_armor` is 0. The table below is exhaustive apart from `id` and `type`.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Armor. | [Player-visible information](#player-visible-information) |
| `base_armor` | The base armor of a newly created Combatant equipped with this Armor, in health points. | [Enemy creation](#enemy-creation); [Agent creation](agents-spec.md#agent-creation) in Agents, for Agents |

A Combatant's base armor is a value of the Combatant, set from `base_armor` at creation; a Combat reads the Combatant's [effective armor](agents-spec.md#combatant-attributes), never the Armor's `base_armor`. An Agent's effective armor can exceed its Armor's `base_armor`, under [Effective armor](agents-spec.md#effective-armor) in Agents.

## CombatParameters

CombatParameters bundles the scalar values that Combats read. The table below is exhaustive apart from `id` and `type`. Each value is a ratio, not a stored quantity, and is read as the exact decimal number it is written as, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers.

| Property | Meaning | Read by |
| --- | --- | --- |
| `weapon_damage_range` | How far a damage outcome may lie below or above the attacker's effective weapon damage, as a fraction of that effective weapon damage. | [Damage outcome](#damage-outcome) |
| `retreat_below_agent_rating_fraction` | The fraction of the Agents' side's Combat rating at Combat start below which the team considers retreating. | [Combat end checks](#combat-end-checks) |
| `retreat_at_enemy_to_agent_rating` | The ratio of the Enemies' side's Combat rating to the Agents' side's Combat rating at or above which a team that considers retreating retreats. | [Combat end checks](#combat-end-checks) |
| `incapacitation_skill_fraction` | The fraction of a Combatant's base skill at or below which its effective skill makes it Incapacitated. | [Incapacitation condition](#incapacitation-condition) |
| `target_base_weight` | The hit-chance weight of an Enemy that an attacking Agent would hit with exactly the preferred hit chance. | [Target selection](#target-selection) |
| `target_preferred_hit_chance` | The hit chance, as a fraction from 0 to 1, that an attacking Agent most prefers against its target. | [Target selection](#target-selection) |
| `rating_bonus_per_upgrade` | The fraction of its base Combat rating by which each Rating Upgrade raises the Combat rating of a side. | [Combat rating](#combat-rating) |

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

The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for EnemyArchetype, Weapon, Armor, CombatParameters, `exhaustion_per_attack`, and `exhaustion_per_defense`, and it adds to [Agent GDR validation](agents-spec.md#agent-gdr-validation) in Agents. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **One CombatParameters:** The Game build supplies exactly one CombatParameters GDR.
2. **EnemyArchetype values are valid:** Each EnemyArchetype's `base_skill` is a whole number of at least 0, its `base_health` is a whole number of at least 1, its `weapon` references a Weapon GDR the Game build supplies, and its `armor` references an Armor GDR the Game build supplies.
3. **Weapon and Armor values are valid:** Each Weapon's `base_weapon_damage` is a whole number of at least 1, and each Armor's `base_armor` is a whole number of at least 0.
4. **Damage range is valid:** `weapon_damage_range` is a decimal number from 0 to 1, both included. This guarantees that both bounds of every damage outcome are whole numbers of at least 0 with the lower bound at most the upper bound, under [Damage outcome](#damage-outcome).
5. **Retreat thresholds and rating bonus are valid:** `retreat_below_agent_rating_fraction`, `retreat_at_enemy_to_agent_rating`, and `rating_bonus_per_upgrade` are each a decimal number of at least 0.
6. **Incapacitation threshold is valid:** `incapacitation_skill_fraction` is a decimal number of at least 0 and less than 1.
7. **Every attack tires someone:** `exhaustion_per_attack + exhaustion_per_defense` is at least 1.
8. **Exact properties:** Each EnemyArchetype, Weapon, Armor, and CombatParameters GDR has exactly the properties its table above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
9. **Selection weights are valid:** `target_preferred_hit_chance` is a decimal number from 0 to 1, both included, and `target_base_weight` is a whole number of at least `100 × target_preferred_hit_chance` and of at least `100 × (1 − target_preferred_hit_chance)`. This guarantees that every Selection weight is at least 1, under [Target selection](#target-selection).

Rule 7, together with the exhaustion clause of the [Incapacitation condition](#incapacitation-condition), guarantees that every Combat ends, under [Termination](#termination). [Agent GDR validation](agents-spec.md#agent-gdr-validation) in Agents makes `exhaustion_incapacitation` a whole number of at least 1.

# Enemies

Enemies are the opponents the Agency's Agents fight at a Mission site. Each is a Combatant like an Agent, but it belongs to its Mission site alone and never recovers.

## Enemy properties

An Enemy is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is an EnemyArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) and [State](../foundation/core-concepts.md#campaign-instances) have exactly the following properties. This table is exhaustive.

| Property | Part | Value | Classification and range |
| --- | --- | --- | --- |
| Mission site | Constants | An Immutable reference to the Mission site at which the Enemy is present. | [Authoritative value](../foundation/core-concepts.md#value-classification). Always exactly one Mission site, under [How concepts relate](domain-model.md#how-concepts-relate). |
| [Base skill](agents-spec.md#combatant-attributes) | State | The Enemy's base skill. | Authoritative value. A whole number of at least 0. No rule changes it after creation. |
| [Health lost](agents-spec.md#combatant-attributes) | State | The Enemy's health lost. | Authoritative value. A whole number under [Attribute ranges](agents-spec.md#attribute-ranges). |
| [Base health](agents-spec.md#combatant-attributes) | State | The Enemy's base health. | Authoritative value. A whole number of at least 1. No rule changes it after creation. |
| Exhaustion | State | The Enemy's exhaustion. | Authoritative value. A whole number under [Attribute ranges](agents-spec.md#attribute-ranges). |
| Weapon | State | A reference to the Weapon GDR the Enemy is equipped with. | Authoritative value. Always resolves to a Weapon GDR the Game build supplies. No rule changes it after creation. |
| [Base weapon damage](agents-spec.md#combatant-attributes) | State | The Enemy's base weapon damage. | Authoritative value. A whole number of at least 1. No rule changes it after creation. |
| Armor | State | A reference to the Armor GDR the Enemy is equipped with. | Authoritative value. Always resolves to an Armor GDR the Game build supplies. No rule changes it after creation. |
| [Base armor](agents-spec.md#combatant-attributes) | State | The Enemy's base armor. | Authoritative value. A whole number of at least 0. No rule changes it after creation. |

These are exactly the properties the [Combatant Role Type](agents-spec.md#combatant-role-type) requires; Weapon and base weapon damage together are the equipped weapon values, and Armor and base armor the equipped armor values. An Enemy also has five [Derived values](../foundation/core-concepts.md#value-classification), which are never stored: its [effective max health](agents-spec.md#combatant-attributes), which equals its base health, and its current health, under [Effective max health and current health](agents-spec.md#effective-max-health-and-current-health) in Agents; its effective skill, under [Effective skill](agents-spec.md#effective-skill) in Agents; its [effective armor](agents-spec.md#combatant-attributes), which equals its base armor, under [Effective armor](agents-spec.md#effective-armor) in Agents; and its Combat rating, under [Combat rating](#combat-rating). An Enemy has no lifecycle, no [Assignment](domain-model.md#agency-and-agents), and no [Turn series](../foundation/world-history.md#glossary). An Enemy whose current health is 0 is dead; being dead is a Derived value of its current health, not a stored state.

**Retention:** An Enemy keeps every property above for the whole Campaign, so that every reference to it resolves, e.g. from a Combat report. An Enemy becomes [Retired](../foundation/world-history.md#glossary) when its Mission site becomes Retired, and is kept in the [Retired world state](../foundation/campaign-state.md#glossary) with its final values, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Enemy is ever removed.

## Enemy creation

Every Enemy is created together with the Mission site at which it is present, under [Missions](missions.md). Each new Enemy has a fresh [Instance ID](../foundation/campaign-instances.md#glossary) under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

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
| Armor | The Armor GDR that the EnemyArchetype's `armor` references. | `armor` of the EnemyArchetype. |
| Base armor | The `base_armor` of that Armor GDR. | `base_armor` of the Armor GDR. |

No [Upgrade](economy-and-upgrades.md#glossary) and no [Campaign configuration](../foundation/campaign-state.md#glossary) value changes any initial value above. Two Enemies created from the same EnemyArchetype are distinct Campaign instances that share neither Instance ID nor current health.

## Changes to Enemy values

An Enemy changes only while it is fought, so an Enemy that no Combat reaches keeps the values it was created with.

The following list is the exhaustive set of rules that change an Enemy's values after its creation:

- An attack on the Enemy in a Combat lowers its current health, under [Effects of an attack](#effects-of-an-attack).
- An attack made by or on the Enemy in a Combat raises its exhaustion, under [Effects of an attack](#effects-of-an-attack).

No rule raises an Enemy's current health or lowers its exhaustion: Enemies never recover. Base skill, base health, Weapon, base weapon damage, Armor, and base armor never change; an attack lowers only the Enemy's current armor, which no World state holds. An Enemy's values after its Combat are therefore its final values, and an Enemy whose Mission site is never fought over keeps its initial values.

# Combats

A Combat turns a deployment into a result without any choice from the player. These rules fix what a Combat reads, what it produces, and when it happens.

## Combat inputs and outputs

A Combat is fully automatic: the player chooses who is deployed, under [Missions](missions.md), and makes no choice during the Combat. A Combat is a function of the following inputs only. This list is exhaustive.

1. **The Agents' side:** a list of one or more distinct Agents, each [Serving](agents-spec.md#agent-statuses). This is the [Mission](domain-model.md#leads-investigations-mission-sites-and-missions)'s [Current team](domain-model.md#leads-investigations-mission-sites-and-missions).
2. **The Enemies' side:** a list of zero or more distinct Enemies. These are the Mission site's Enemies.
3. **Current values:** the base skill, current health, effective max health, exhaustion, effective weapon damage, and effective armor of every Combatant in the two lists, as they are when the Combat begins.
4. **Rating Upgrades:** the Rating Upgrades of the Agents' side, as they are when the Combat begins, under [Combat rating](#combat-rating).
5. **GDR values:** the seven values of CombatParameters, and `exhaustion_incapacitation`, `exhaustion_free_points`, `skill_penalty_pct_per_exhaustion`, `exhaustion_per_attack`, `exhaustion_per_defense`, `experience_per_attack_hit`, `experience_per_attack_miss`, `experience_per_defense_hit`, and `experience_per_defense_miss` of AgentParameters.
6. **Random outcomes:** the named random outcomes of its target selections, under [Target selection](#target-selection), and of its attacks, under [Hit outcome](#hit-outcome) and [Damage outcome](#damage-outcome).

The order of each list is the fixed order of its side, under [Fixed order of each side](#fixed-order-of-each-side). Nothing else influences a Combat; e.g., the turn number, the Mission site's kind, and any other Agent or Enemy have no effect. Its outputs are exhaustive too:

1. The Combat report, under [Combat report](#combat-report), which also holds the combat experience of every Agent, under [Combat experience](#combat-experience).
2. The changed current health and exhaustion of the Combatants of both lists, and the [Agent status](domain-model.md#agency-and-agents) [Killed](agents-spec.md#agent-statuses) of every Agent whose current health reached 0, under [Killed and Incapacitated](#killed-and-incapacitated).

An Agents' side that is empty, contains an Agent twice, or contains an Agent that is not Serving, and an Enemies' side that contains an Enemy twice, are internal invariant violations under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract, not expected cases. [Missions](missions.md) guarantees valid lists when it has a Combat fought. A [Detached Combat](#detached-combat) takes its inputs from its caller instead and rejects invalid ones, under [Detached Combat](#detached-combat).

## Fighting a Combat

Fighting a Combat is the one procedure that turns the inputs above into the outputs above, by [Combat flow](#combat-flow), [Attacks](#attacks), [Combat end](#combat-end), and [Combat report](#combat-report). The following rules are complete:

- **One procedure:** Exactly three things have a Combat fought, and all use this procedure and no other: the Mission resolution step, under [Missions](missions.md), and `developer.tools.fightCombat(setup)` and `developer.tools.fightCombatBatch(setup, count, stop)`, under [Detached Combat](#detached-combat). What differs between them is only where the inputs come from, which outputs are recorded, and what is done with the outputs.
- **Recording:** Building the Combat report is an option of the one procedure, which its caller turns on or off; the procedure always produces the Combat summary: the Combat outcome and the number of Agents that are dead when the Combat ends. With the option on, it also records the full outputs, i.e. the Combat report and each Combatant's final values. The Mission resolution step and `fightCombat` always turn it on, so that `fightCombat` shows a Combat exactly as play records it; `fightCombatBatch` never does. Turning it off leaves out only facts that nothing in the Combat reads: every target selection, attack, random outcome, and Combat end check happens exactly as with it on, so the Combat summary of a Combat always equals what its Combat report states.
- **Pure in its inputs:** Given equal inputs, including equal values of every random outcome, fighting a Combat produces equal outputs, whoever has it fought. E.g., a Detached Combat given the starting values, Rating Upgrades, GDR values, and random outcomes of a Combat fought in a Mission resolution step produces the same Combat report, apart from the Mission and the identification of its participants.
- **Applying the outputs belongs to the caller:** Fighting a Combat changes no World state itself. The Mission resolution step applies the outputs to the Combatants, under [Missions](missions.md); a Detached Combat applies them to nothing.

## Combat-only properties

The exhaustive set of gained properties of the [Combatant Role Type](agents-spec.md#combatant-role-type) is two properties:

| Gained property | Type | Initial value | Meaning |
| --- | --- | --- | --- |
| Incapacitated | Yes or no | Set at Combat start under [Combat start](#combat-start) | Whether the Combatant is Incapacitated, under [Killed and Incapacitated](#killed-and-incapacitated). |
| [Current armor](agents-spec.md#combatant-attributes) | A whole number of at least 0 | The Combatant's effective armor, set under [Combat start](#combat-start) | How much more of the damage of hits the Combatant's armor absorbs in this Combat, under [Effects of an attack](#effects-of-an-attack). |

Every Combatant in either list gains both when the Combat begins and loses both when the Combat ends, whatever their values then. Their values at the end of the Combat are recorded in the Combat report, under [Combat report](#combat-report); they affect nothing after the Combat. E.g., an Agent that was Incapacitated at the end of a Combat is an ordinary Serving Agent afterward, with the current health and exhaustion the Combat left it, and an Agent whose current armor a Combat lowered to 0 starts its next Combat with its full effective armor again.

A Combatant is able to fight, during a Combat, exactly when its current health is greater than 0 and it is not Incapacitated. Being able to fight is a Derived value.

## Incapacitation condition

A Combatant meets the incapacitation condition exactly when its current health is greater than 0 and at least one of the following holds:

```text
effective skill  ≤  incapacitation_skill_fraction × base skill        (skill clause)
exhaustion       ≥  exhaustion_incapacitation                         (exhaustion clause)
```

where effective skill is computed under [Effective skill](agents-spec.md#effective-skill) in Agents from the Combatant's values at that moment, base skill and exhaustion are its own values at that moment, `incapacitation_skill_fraction` is the CombatParameters value, and `exhaustion_incapacitation` is the AgentParameters value. Each comparison is exact, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers; the right-hand side of the skill clause is never rounded. E.g., with a fraction of 0.1 a Combatant of base skill 40 meets it at an effective skill of 4 or less, and one of base skill 125 at 12 or less, since 12 ≤ 12.5 < 13. E.g., with the Bootstrap values, a Combatant at full current health with exhaustion 100 has effective skill 30% of its base skill, above the skill clause, and meets the condition through the exhaustion clause alone.

A Combatant of base skill 0 meets the condition whenever it is alive, because its effective skill is 0. A Combatant that does not meet it has an effective skill of at least 1, because its effective skill is greater than a value of at least 0.

**Informative rationale:** The skill clause is taken from game-ts; the exhaustion clause is new in v5.

Outside a Combat, a Combatant is able to fight exactly when its current health is greater than 0 and it does not meet the incapacitation condition. This is the definition [Combat rating](#combat-rating) uses outside a Combat, e.g. for a Mission site's Enemies before any team is deployed. Within a Combat the two definitions always agree, under [Monotonicity within a Combat](#monotonicity-within-a-combat).

## Combat timing

A Combat begins and ends within one [Turn advancement step](turn-advancement.md#glossary) of one Advance turn, the step in which [Missions](missions.md) has it fought; nothing else happens between its first and its last attack. A Detached Combat is the one exception: it begins and ends within one call of `developer.tools.fightCombat(setup)` or `developer.tools.fightCombatBatch(setup, count, stop)` and belongs to no Advance turn. No [World state](../foundation/engine-contract.md#player-actions-and-turns) therefore contains a Combat in progress, a Combat round, the Incapacitated property, or current armor. Only the Combat's outputs are ever part of a World state.

# Combat rating

A Combat rating measures how strong a team is, so that the Player and the Agents' retreat can weigh it against the Enemies. Effective skill carries most of that strength, and the Agency's Upgrades that strengthen every Agent in ways effective skill does not reflect carry the rest. The base Combat rating of one Combatant is its effective skill, under [Effective skill](agents-spec.md#effective-skill) in Agents, and the base Combat rating of a side, i.e. of a list of Combatants, is the sum of the effective skills of those of its Combatants that are able to fight. The Combat rating of a side raises its base Combat rating by `rating_bonus_per_upgrade` for each of its Rating Upgrades:

```text
base Combat rating of a side = Σ effective skill(c)   over every Combatant c of the side that is able to fight
Combat rating of a side      = ⌊ base Combat rating of the side × (1 + rating_bonus_per_upgrade × Rating Upgrades of the side) ⌋
Rating Upgrades of the Enemies' side = 0
```

The Rating Upgrades of the Agents' side count the purchases of every Upgrade whose effect states that it counts toward them, each purchase once; which Upgrades count is stated with their effects, and no rule of Combat adds to it.

The base Combat rating and the Combat rating of one Combatant are those of a side holding that Combatant alone, except that its base Combat rating is its effective skill even when it is not able to fight; an Agent counts the Rating Upgrades of the Agents' side, and an Enemy counts none, so an Enemy's Combat rating always equals its base Combat rating. The Combat rating of a side is rounded once, for the side, so it can exceed the sum of the Combat ratings of its Combatants.

Inputs: each effective skill is a whole number of at least 0; whether a Combatant is able to fight is decided under [Combat-only properties](#combat-only-properties) during a Combat and under [Incapacitation condition](#incapacitation-condition) outside one. The Rating Upgrades are a whole number of at least 0, those of the World state in which the value is read; within a Combat, the Rating Upgrades are its input under [Combat inputs and outputs](#combat-inputs-and-outputs). `rating_bonus_per_upgrade` is the CombatParameters value, a decimal number of at least 0. The base Combat rating needs no rounding, because every term is a whole number. The Combat rating is computed exactly, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, and rounded down once to a whole number. Both results are whole numbers of at least 0, and each is 0 exactly when no Combatant of the side is able to fight, because every Combatant able to fight has an effective skill of at least 1 and the factor is at least 1.

E.g., with the Bootstrap value `rating_bonus_per_upgrade` 0.02, a team whose base Combat rating is 5,000, with 19 Rating Upgrades, e.g. 8 purchases of one counting Upgrade and 11 of another, has a Combat rating of 5,000 × 1.38 = 6,900. E.g., a single Agent of effective skill 101 with 3 Rating Upgrades has a Combat rating of ⌊101 × 1.06⌋ = ⌊107.06⌋ = 107.

Both are Derived values and are never stored, except where the Combat report records the Combat rating under [Combat report](#combat-report). They are computed from the values at the moment they are read. Every rule that weighs one side against another reads the Combat rating, never the base Combat rating, e.g. the Retreated check under [Combat end checks](#combat-end-checks). **Informative rationale:** game-ts also weighted current health and base weapon damage; v5 uses effective skill, which already falls with lost current health and exhaustion, and adds the Upgrades that strengthen every Agent in other ways, because effective skill does not reflect them.

# Combat flow

The sides take turns, and the strongest of a side act first. Who acts when follows from the Combatants' values alone; chance enters only in whom each attacker targets and in its attacks. These rules decide who acts when, and whom each Combatant attacks.

## Fixed order of each side

Each side has a fixed order for the whole Combat: the order of its input list under [Combat inputs and outputs](#combat-inputs-and-outputs). For a Combat fought in a Mission resolution step, each list is in ascending order of the number of its Instance IDs, under [Resolving one Mission](missions.md#resolving-one-mission) in Missions; for a [Detached Combat](#detached-combat), it is the order its caller gives. The fixed order never changes during the Combat; a Combatant that dies or becomes Incapacitated keeps its position. It breaks ties in the Phase order of [Combat rounds](#combat-rounds), and the Combat report records both orders.

## Combat start

When a Combat begins, before any Combat round:

1. Every Combatant of both sides gains Incapacitated, set to yes exactly when the Combatant meets the [Incapacitation condition](#incapacitation-condition) with its current values, and to no otherwise. An Enemy whose current health is already 0 is dead and is not Incapacitated. Every Combatant also gains current armor, set to its effective armor.
2. The Combat report records each Combatant's starting values and the Combat rating of each side, under [Combat report](#combat-report). The Combat rating of the Agents' side at this moment is its starting Combat rating, which the Retreated check reads.
3. If no Enemy is able to fight, the Combat ends with the Combat outcome Prevailed after 0 Combat rounds. Otherwise, if no Agent is able to fight, it ends with the Combat outcome Wiped after 0 Combat rounds. Otherwise the first Combat round begins.

A Combat that ends at its start makes no attack and changes no value of any Combatant.

## Combat rounds

Combat rounds are numbered from 1. Each Combat round consists of two phases, in this order:

1. **Agents' phase:** each Agent of the Agents' side takes one Combat turn, in the Phase order of its side.
2. **Enemies' phase:** each Enemy of the Enemies' side takes one Combat turn, in the Phase order of its side.

The Phase order of a side is set when its phase begins: its Combatants from the highest to the lowest effective skill at that moment, and among Combatants of equal effective skill, the one earlier in the fixed order of the side first. No attack in a phase changes the order of the Combatants still to take their Combat turns in it: an attack changes only its attacker, who has just taken its Combat turn, and its defender, who belongs to the other side, so the effective skill of a Combatant still waiting for its Combat turn does not change during its side's phase. E.g., Agents of effective skill 90, 120, and 90, in this fixed order, take their Combat turns in the order 120, then the first 90, then the second 90.

On its Combat turn, a Combatant that is not able to fight at that moment does nothing. A Combatant that is able to fight selects a target under [Target selection](#target-selection) and makes exactly one attack on it, under [Attacks](#attacks). Every effect of an attack applies immediately, before the next Combat turn, so every later Combat turn, target selection, and attack in the same Combat round reads the changed values. E.g., an Enemy killed in the Agents' phase does not attack in the Enemies' phase of the same Combat round.

After every attack, and after the Enemies' phase, the [Combat end checks](#combat-end-checks) decide whether the Combat ends at once; when none holds after the Enemies' phase, another Combat round begins.

## Target selection

Enemies strike at whichever Agent is in reach. Agents pick their fights: each prefers an Enemy it can hit about four times in five, so a sure hit on a weakened Enemy and a long shot at a strong one both draw it less, and it is drawn less to an Enemy with so little health left that much of a hit would be wasted on it, but every Enemy able to fight can be its target.

An attacker selects its target at its Combat turn. Its candidates are the opponents, i.e. the Combatants of the other side, that are able to fight at that moment; an opponent that is not able to fight is never a target. An attacker always has at least one candidate, because the Combat ends as soon as a side has no Combatant able to fight, under [Combat end checks](#combat-end-checks). Each target selection has one named random outcome, its target outcome, whose possible values are the candidates. Each candidate is the target with the [Probability](../foundation/numbers.md#glossary) of its Selection weight divided by the sum of the Selection weights of all candidates, an exact ratio of whole numbers that is never rounded, under [Probabilities](../foundation/numbers.md#probabilities) in Numbers. Each target outcome is independent of every other random outcome. The Selection weight of a candidate depends on the attacker's side:

- **Enemy attacker:** every candidate has Selection weight 1, so each Agent able to fight is equally likely, whatever its effective skill, current health, or the number of attacks it has already received.
- **Agent attacker:** the Selection weight of a candidate Enemy is

  ```text
  hit-chance weight = target_base_weight − round down( | 100 × target_preferred_hit_chance − hit chance / 10 | )
  usefulness        = min(w, H) / w
  Selection weight  = round up( hit-chance weight × usefulness )
  ```

  | Symbol | Meaning | Unit and domain |
  | --- | --- | --- |
  | hit chance | The hit chance the attack would have on that candidate, under [Hit outcome](#hit-outcome), from the attacker's and the candidate's effective skill at the moment of the target selection. | Thousandths; a whole number from 1 to 999. |
  | w | The attacker's effective weapon damage. | Health points; a whole number of at least 1. |
  | H | The candidate's current health plus its current armor at the same moment. | Health points; a whole number of at least 1. |
  | `target_base_weight` | The CombatParameters value. | A whole number of at least 1. |
  | `target_preferred_hit_chance` | The CombatParameters value. | An exact decimal number from 0 to 1, both included. |

  `hit chance / 10` is that hit chance in percent, so the hit-chance weight falls by one for each whole percentage point by which the hit chance lies from `target_preferred_hit_chance`, above or below it. The attacker is drawn by the same hit chance that the attack then has and that the player reads, not by an unrounded ratio. The difference is evaluated exactly and rounded once, with [Round down](../foundation/numbers.md#glossary), under [Rounding](../foundation/numbers.md#rounding) in Numbers. The hit chance lies strictly between 0% and 100%, so rule 9 of [Combat GDR validation](#combat-gdr-validation) makes every hit-chance weight a whole number of at least 1.

  The usefulness is the fraction of a hit of the attacker's effective weapon damage that the candidate can still take, as the armor it removes or the health it removes under [Effects of an attack](#effects-of-an-attack): it is 1 when H is at least w, and below 1 when part of such a hit would be wasted beyond the candidate's current health and current armor. It is an exact ratio of whole numbers, never rounded on its own. The product is evaluated exactly and rounded once, with [Round up](../foundation/numbers.md#glossary), under Rounding in Numbers. H is at least 1, because the candidate is able to fight, so the product is greater than 0 and every Selection weight is a whole number of at least 1. A candidate's Selection weight depends on nothing else, e.g. not on the number of attacks it has already received, except as they lower its effective skill, current health, or current armor.

E.g., with the Bootstrap values `target_base_weight` 100 and `target_preferred_hit_chance` 0.8, and with every Enemy's current health plus current armor at least the Agent's effective weapon damage, so that every usefulness is 1 and every Selection weight equals its hit-chance weight: an Agent of effective skill 200 hits an Enemy of effective skill 100 with the hit chance 800, i.e. 80.0%, so that Enemy's Selection weight is 100. A hit chance of 54.5% gives `100 − round down(25.5)`, i.e. 75; one of 98.1% gives `100 − round down(18.1)`, i.e. 82; one of 60.0% gives 80; and hit-chance weights therefore range from 21, for the least hit chance of 0.1%, to 100. E.g., an Agent of effective skill 100 facing Enemies of effective skill 40, 50, and 100 hits them with the hit chances 86.2%, 80.0%, and 50.0%, so their Selection weights are 94, 100, and 70, and it targets them with the Probabilities 94/264, 100/264, and 70/264. E.g., five Enemies that all have Selection weight 100 are each the target with the Probability 1/5.

E.g., with the same Bootstrap values, an Agent of effective skill 1000 and effective weapon damage 25 faces an Enemy of effective skill 250 with current health 50 and an Enemy of effective skill 100 with current health 20, both with current armor 0. It hits them with the hit chances `round down(941.17…)` and `round down(990.09…)`, i.e. 94.1% and 99.0%, so their hit-chance weights are `100 − round down(14.1)`, i.e. 86, and `100 − round down(19.0)`, i.e. 81. A hit of 25 on the first takes no more than its 50 health, so its usefulness is 1 and its Selection weight is 86. Only 20 of such a hit lands on the second, so its usefulness is 20 / 25 and its Selection weight is `round up(81 × 20 / 25)`, i.e. `round up(64.8)`, i.e. 65. The Agent targets them with the Probabilities 86/151 and 65/151.

The candidates and their Selection weights are determined anew at every target selection, from the values at the moment of that attacker's Combat turn, and are never carried over from an earlier Combat turn or set when the phase begins, unlike the Phase order. An earlier attack in the same phase can lower a candidate's effective skill, current health, or current armor, and so change its Selection weight, or leave it unable to fight, and so remove it from the candidates. E.g., with the Bootstrap values, two Agents of effective skill 100, whose effective weapon damage is at most every Enemy's current health throughout, face Enemies of effective skill 100 and 40: for the first Agent their Selection weights are 70 and 94; when its hit lowers the Enemy of 100 to effective skill 50, the second Agent, attacking next in the same phase, hits that Enemy with the hit chance 80.0%, so its Selection weights are 100 and 94.

**Informative rationale:** An Agent that prefers an Enemy it is likely but not certain to hit neither wastes attacks on long shots nor spends them all finishing off the weakest Enemy. Discounting an Enemy by the part of a hit its remaining health and armor could not take keeps a hard-hitting Agent from spending its damage on Enemies too frail to absorb it while a stronger Enemy fights on. The discount never shuts an Enemy out, because every Selection weight is at least 1, and an Enemy wounded enough to be steeply discounted has lost effective skill in proportion to its lost health, so it is also the lesser threat. Enemies, who have no such judgement, spread their attacks evenly over the team.

# Attacks

An attack is made by one attacker on one defender, its target. It has one hit outcome and, when the hit outcome is a hit, one damage outcome. These are the attack's own random outcomes; the only other random outcome of a Combat is the target outcome of each target selection, under [Target selection](#target-selection). Each outcome depends only on the values its section names, and is independent of every other random outcome, except that a damage outcome exists only for an attack whose hit outcome is a hit. No random outcome of a Combat is hidden from the player.

## Hit outcome

Each attack has one named random outcome, the hit outcome, whose possible values are hit and miss. It is a hit with the [Probability](../foundation/numbers.md#glossary) `hit chance / 1000`, where the hit chance is

```text
hit chance = min( 999, max( 1, round down( 1000 × A² / (A² + D²) ) ) )
```

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| A | The attacker's effective skill, read at the moment of the attack, before any effect of that attack. | Skill points; a whole number of at least 1. |
| D | The defender's effective skill, read at the same moment. | Skill points; a whole number of at least 1. |
| hit chance | The chance that the attack hits, in thousandths. | A whole number from 1 to 999, i.e. from 0.1% to 99.9%. |

The ratio `A² / (A² + D²)` is evaluated exactly and rounded once, with [Round down](../foundation/numbers.md#glossary) of its thousandfold, under [Rounding](../foundation/numbers.md#rounding) in Numbers, and then clamped from 1 to 999. Both A and D are at least 1, because attacker and defender are both able to fight, under [Incapacitation condition](#incapacitation-condition), so the divisor is at least 2 and A = D = 0 cannot occur. The hit chance is a Derived value, computed at each attack and never stored. It is a miss with the Probability `(1000 − hit chance) / 1000`.

The hit chance is the one value that both decides the hit outcome and is shown to the player, so the chance the player reads is exactly the chance drawn, never a rounding of it. The clamp keeps every attack uncertain: no attack hits surely and none misses surely, however far apart the two effective skills are. E.g., A = 200 and D = 100 give exactly 800, i.e. 80.0%; A = 973 and D = 60 give `round down(996.21…)`, i.e. 996 or 99.6%, never 100%; A = 107 and D = 40 give 877, i.e. 87.7%; and A = 1 and D = 50 give `round down(0.39…)`, i.e. 0, which the clamp raises to 1, i.e. 0.1%.

## Damage outcome

Each attack whose hit outcome is a hit has one named random outcome, the damage outcome. It is a uniform whole-number outcome, under [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes) in Numbers, over the inclusive range from `lo` to `hi`:

```text
lo = round up( w × (1 − weapon_damage_range) )
hi = round down( w × (1 + weapon_damage_range) )
```

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| w | The attacker's effective weapon damage. | Health points; a whole number of at least 1. |
| `weapon_damage_range` | The CombatParameters value. | An exact decimal number from 0 to 1, both included. |

Each bound is evaluated exactly and rounded once, with [Round up](../foundation/numbers.md#glossary) for `lo` and [Round down](../foundation/numbers.md#glossary) for `hi`, under [Rounding](../foundation/numbers.md#rounding) in Numbers, before the range is formed. Because w is a whole number, `w × (1 − weapon_damage_range) ≤ w ≤ w × (1 + weapon_damage_range)` gives `0 ≤ lo ≤ w ≤ hi`, so the range is never empty. Each of the `hi − lo + 1` values has the Probability `1 / (hi − lo + 1)`. The damage outcome does not depend on the defender. [Effective weapon damage](agents-spec.md#combatant-attributes) does not change during a Combat, so the range of one attacker is the same for all its attacks.

A damage outcome supplied from outside the Combat, e.g. by a random outcome override under [Random outcome overrides](../foundation/developer-access.md#random-outcome-overrides) in Developer Access, must be one of the whole numbers from `lo` to `hi`; any other value is rejected and never applied.

## Effects of an attack

One attack applies these effects, in this order, before the next Combat turn begins:

1. **Read:** A and D are read, and the hit chance is formed, under [Hit outcome](#hit-outcome).
2. **Hit outcome:** The attack has its hit outcome. The damage outcome exists only when the hit outcome is a hit.
3. **Armor removed:** On a hit, the defender's current armor falls by the damage outcome, under [Damage outcome](#damage-outcome), but not below 0. The armor removed is the smaller of the damage outcome and the defender's current armor before this step.
4. **Health removed:** On a hit, the defender's current health falls by the damage outcome less the armor removed, but not below 0. The health removed is the smaller of that remainder and the defender's current health before this step. On a miss, neither current armor nor current health changes, and the armor removed and the health removed are both 0.
5. **Exhaustion:** The attacker gains `exhaustion_per_attack` exhaustion and the defender gains `exhaustion_per_defense` exhaustion, hit or miss. No upper clamp applies, under [Attribute ranges](agents-spec.md#attribute-ranges) in Agents.
6. **Evaluation:** The defender and then the attacker are evaluated under [Killed and Incapacitated](#killed-and-incapacitated), with their values after steps 3 to 5.

The order of steps 4 and 5 affects no result, because nothing reads the values between them. No other value changes; in particular base skill, [Experience](agents-spec.md#growth), base health, base weapon damage, and base armor are unchanged, and no Combatant other than the attacker and the defender is affected.

Armor removed lowers no current health, so it raises no health lost and lowers no effective skill: a hit that its defender's current armor absorbs whole changes the defender's effective skill only through the exhaustion of step 5. The armor removed and the health removed always add up to the damage outcome, except when the defender's current health falls to 0. E.g., a defender with current health 30 and current armor 25 that is hit four times, with damage outcomes 7, 10, 15, and 4, is left with current health 30 and current armor 18, then 30 and 8, then 23 and 0, because its current armor absorbs 8 of the 15 and the other 7 are health removed, and then 19 and 0.

## Combat experience

Every attack an Agent makes or takes teaches it something, a hit more than a miss when it attacks and a miss more than a hit when it defends, but the Agent keeps the lesson only if it lives through the Mission.

Every Agent of the Agents' side has a combat experience in each Combat: the sum, over every attack of the Combat log in which it is the attacker or the defender, of the amount in this table. The table is exhaustive.

| The Agent's part in the attack | Hit outcome | Amount                        |
| ------------------------------ | ----------- | ----------------------------- |
| Attacker                       | Hit         | `experience_per_attack_hit`   |
| Attacker                       | Miss        | `experience_per_attack_miss`  |
| Defender                       | Hit         | `experience_per_defense_hit`  |
| Defender                       | Miss        | `experience_per_defense_miss` |

Each amount is a whole number of at least 0 of AgentParameters, so the combat experience is a whole number of at least 0, and 0 for an Agent that neither attacked nor was attacked. It counts every attack whatever the health removed, the damage outcome, or whether the attack made someone dead, and an attack that made the Agent dead counts too. An Enemy has no combat experience. A Combat changes no base skill or Experience, under [Effects of an attack](#effects-of-an-attack), so combat experience earned early in a Combat does not strengthen the Agent later in the same Combat: the Combat reports it, and [Mission growth](agents-spec.md#mission-growth) in Agents adds it to a survivor's Experience, and with it to its base skill, after the Combat.

**Informative rationale:** The four amounts and the rule that only survivors keep them are taken from game-ts.

## Killed and Incapacitated

Each evaluation of a Combatant under [Effects of an attack](#effects-of-an-attack) applies the first of these that holds:

1. **Dead:** Its current health is 0. It is dead and is not Incapacitated. A dead Agent becomes Killed at this moment, under [Agent status](agents-spec.md#agent-status) in Agents, and its Killed by references the attacker and the attacker's Mission site. A dead Enemy stays an Enemy with current health 0, and the Enemies killed of the attacking Agent rises by 1, under [Service record](agents-spec.md#service-record) in Agents.
2. **Incapacitated:** It meets the [Incapacitation condition](#incapacitation-condition). Its Incapacitated property becomes yes, if it was not already.
3. Otherwise nothing changes.

Only the defender can die in an attack, because only the defender loses current health. Both can become Incapacitated. A dead or Incapacitated Combatant is not able to fight: it makes no further attack and is never a target for the rest of the Combat, so its current health and exhaustion do not change again in that Combat. An Incapacitated Combatant is alive: an Incapacitated Agent survives the Combat and is not Killed.

**Informative rationale:** The incapacitation threshold, i.e. an effective skill at or below a fraction of base skill, is taken from game-ts.

## Monotonicity within a Combat

Within a Combat, base skill and effective max health are constant, current health and current armor never rise, and exhaustion never falls. Effective skill does not read current armor. Every factor of the [Effective skill](agents-spec.md#effective-skill) formula that can change therefore never rises, so a Combatant's effective skill never rises during a Combat. It follows that a Combatant that meets the [Incapacitation condition](#incapacitation-condition) keeps meeting it, that no Combatant becomes able to fight again once it is not, and that only the attacker and defender of an attack can change whether they meet the condition. The evaluations under [Combat start](#combat-start) and [Killed and Incapacitated](#killed-and-incapacitated) therefore keep Incapacitated equal, at every moment of a Combat, to "alive and meets the incapacitation condition".

# Combat end

A Combat stops the moment one side can no longer fight, and that side has lost; it also stops when the Agents are losing badly enough to withdraw. These rules decide when that happens and how the Combat ended, and show that every Combat ends.

## Combat end checks

After every attack, these checks are made in this order, and the first that holds ends the Combat at once with its Combat outcome; no further Combat turn is taken, even in the middle of a phase:

1. **Prevailed:** No Enemy is able to fight.
2. **Wiped:** No Agent is able to fight.

After the Enemies' phase of each Combat round, when the Combat has not ended, the Retreated check is made, and when it holds it ends the Combat with the Combat outcome Retreated:

3. **Retreated:** Both of the following hold, each compared exactly under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, with no rounding:

   ```text
   R_agents  <  retreat_below_agent_rating_fraction × R_start
   R_enemies ≥  retreat_at_enemy_to_agent_rating   × R_agents
   ```

   where `R_agents` and `R_enemies` are the Combat ratings of the Agents' side and the Enemies' side at the end of the Combat round, and `R_start` is the starting Combat rating of the Agents' side under [Combat start](#combat-start).

When the Retreated check does not hold, the next Combat round begins. Only an attack changes whether a Combatant is able to fight, so a side is left with no Combatant able to fight only by an attack, and the checks after it end the Combat before any Combatant could find no target. E.g., an attack in the Agents' phase that kills the last Enemy able to fight ends the Combat as Prevailed at once: no later Agent of that phase attacks, and no Enemies' phase follows. When one attack leaves no Combatant of either side able to fight, e.g. it kills the last Enemy able to fight while the exhaustion it adds Incapacitates the last Agent able to fight, the outcome is Prevailed, because that check comes first.

The Combat round in which the Combat ends ends with it. The number of Combat rounds of the Combat is the number of that Combat round, or 0 when the Combat ended at its start.

**Informative rationale:** The two retreat thresholds are taken from game-ts; the order of the checks is new in v5.

## Combat outcomes

A Combat ends with exactly one Combat outcome. The set is exhaustive:

| Combat outcome | When |
| --- | --- |
| Prevailed | No Enemy is able to fight, at Combat start or after an attack. Checked first, so it holds even when no Agent is able to fight either. |
| Wiped | Some Enemy, but no Agent, is able to fight, at Combat start or after an attack. |
| Retreated | After a Combat round, Agents and Enemies are both able to fight and the Retreated check of [Combat end checks](#combat-end-checks) holds. |

A Combat outcome is final. Every Agent of a Combat that ends as Retreated or Wiped keeps the values the Combat left it; the Combat outcome itself changes no Combatant value. Whether the Mission is then Won or Lost, and what becomes of each surviving Agent, follows from the Combat outcome under [Missions](missions.md).

## Termination

Every Combat ends, after at most `N × X` Combat rounds, where `N` is the number of Combatants of both sides and `X` is `exhaustion_incapacitation`. This holds for every Game build that passes [Combat GDR validation](#combat-gdr-validation) and [Agent GDR validation](agents-spec.md#agent-gdr-validation), whatever the random outcomes, including when every hit outcome is a miss, and including Combatants that never attack or are never attacked. The argument counts the capped total exhaustion `T`, the sum over every Combatant of the Combat of `min(exhaustion, X)`:

1. **Exhaustion of `X` or more ends fighting.** A Combatant alive with exhaustion of at least `X` meets the exhaustion clause of the [Incapacitation condition](#incapacitation-condition), so it is Incapacitated: at Combat start, or after the attack that raised its exhaustion to `X` or more. Every Combatant able to fight therefore has an exhaustion below `X`.
2. **Every attack raises `T`.** Attacker and defender are both able to fight before the attack, so each has an exhaustion below `X`, and the attack raises the attacker's `min(exhaustion, X)` by at least `min(1, exhaustion_per_attack)` and the defender's by at least `min(1, exhaustion_per_defense)`. By rule 7 of [Combat GDR validation](#combat-gdr-validation) one of these is at least 1, so `T` rises by at least 1 with every attack.
3. **`T` is bounded.** No rule lowers exhaustion during a Combat, and each Combatant adds at most `X` to `T`, so `T` starts at 0 or more and never exceeds `N × X`. At most `N × X` attacks can therefore happen in one Combat.
4. **Every Combat round that is fought has an attack.** A Combat round begins only when an Agent and an Enemy are both able to fight, under [Combat start](#combat-start) and [Combat end checks](#combat-end-checks). Let `a` be the first Agent in the Phase order of its side that is able to fight when the Combat round begins. Before `a`'s Combat turn only Agents that are not able to fight have had a Combat turn, so no attack has happened, `a` is still able to fight, and an Enemy is still able to fight; so `a` attacks.

By 3 and 4 no Combat has more than `N × X` Combat rounds. A Combatant that is never attacked and never attacks plays no part in this argument: the bound counts attacks, not the exhaustion of each Combatant.

# Combat report

Every Combat produces exactly one Combat report. It holds exactly the following facts, and this list is exhaustive:

1. **Combat outcome:** Prevailed, Retreated, or Wiped.
2. **Number of Combat rounds:** a whole number of at least 0.
3. **Participants:** the Agents' side and the Enemies' side, each as the list of Instance IDs in its fixed order.
4. **Starting values:** for each participant, its base skill, current health, effective max health, exhaustion, effective weapon damage, effective armor, effective skill, and Incapacitated value when the Combat began, after [Combat start](#combat-start) step 1. Its effective armor is also its current armor at that moment.
5. **Final values:** for each participant, its current health, current armor, exhaustion, and effective skill when the Combat ended, and its final condition: able to fight, Incapacitated, or dead. A dead Agent is Killed.
6. **Damage dealt and damage taken:** for each participant, its damage dealt, i.e. the sum of the health removed by its attacks, and its damage taken, i.e. the sum of the health removed by attacks on it; and for each Agent, its combat experience, under [Combat experience](#combat-experience). Neither counts armor removed.
7. **Combat ratings:** the Combat rating of each side at Combat start and at the end of every Combat round.
8. **Combat log:** every attack, in the order in which it was made, each with its Combat round number, its attacker and defender by Instance ID, A and D, the hit chance, the hit outcome, the damage outcome when there is one, the armor removed, the health removed, the defender's current armor after the attack, the current health and exhaustion of the attacker and the defender after the attack, and whether the attack made the defender dead or the defender or the attacker Incapacitated.
9. **Mission:** the Instance ID of the Mission whose Combat it records, which [Missions](missions.md) supplies when it has the Combat fought. It influences nothing in the Combat. The Combat report of a Detached Combat has no Mission, and identifies each participant as [Detached Combat](#detached-combat) states rather than only by Instance ID.

A participant's base skill, effective max health, effective weapon damage, and effective armor do not change in a Combat, so its final values need not repeat them. All values are whole numbers, the hit chance among them as its thousandths, except that an Agent's base skill and current health, and so the health removed from an Agent and the damage dealt and damage taken that sum it, are [Decimal quantities](../foundation/numbers.md#glossary), under [Attribute ranges](agents-spec.md#attribute-ranges) in Agents. E.g., a damage outcome of 10 against an Agent with current health 5.60 removes 5.60.

The Combat report is an Authoritative value. It is part of the [Turn report](../foundation/campaign-state.md#glossary) of the Advance turn in which its Combat was fought, and no Mission or other Campaign instance holds it. `player.queries.getTurnReport()` returns every fact above until the next Advance turn replaces that Turn report, under [Current world state, Turn report, and history](../foundation/world-history.md#current-world-state-turn-report-and-history) in History and Turn Report. How the Turn report organizes its Combat reports is left to the implementation. Once produced, a Combat report is never rewritten or recomputed, even when the values of its participants change later, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. Whatever presents a Combat later uses the [retained](../foundation/world-history.md#glossary) values. After the next Advance turn, only the facts that its [History entry](../foundation/world-history.md#glossary) holds need to remain available, under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report. The History entry of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) the Advance turn ends holds, of each Combat report, only its Combat outcome, its number of Combat rounds, its participants, for each participant its current health and effective skill at Combat start and at Combat end and its final condition, and the Combat rating of each side at Combat start and at Combat end, beside what [Turn report](missions.md#turn-report) in Missions states it holds of that Combat's Mission. Combat end is the end of the last Combat round, or Combat start when the Combat had no Combat round. These are the values a Concluded Mission site is shown with for the rest of the Campaign, so the [History](../foundation/campaign-state.md#glossary) keeps what each participant came in with and left with, but not the Combat log, the damage dealt and taken, or the other starting values.

# Detached Combat

Balancing a Combat needs many Combats fought on chosen teams and chosen GDR values, and its results are worth something only if they are exactly what a Campaign would produce. `developer.tools.fightCombat(setup)` therefore has a Combat fought on what its caller supplies, by the same procedure as the Mission resolution step, and changes nothing.

`developer.tools.fightCombat(setup)` is a [Developer tool](../foundation/engine-contract.md#api-surfaces), available as [Developer API](../foundation/engine-contract.md#api-surfaces) is, under [API hierarchy](../foundation/engine-contract.md#api-hierarchy) in Engine Contract. It fights one Detached Combat under [Fighting a Combat](#fighting-a-combat) and returns its outputs. `setup` holds the following, and this list is exhaustive:

| Part | What the caller supplies | Default |
| --- | --- | --- |
| Agents' side | A list of one or more entries, in the fixed order of the side. Each entry is either an Agent of the [Current campaign](../foundation/core-concepts.md#campaign-and-session) by Instance ID, which contributes that Agent's values in the [Current world state](../foundation/engine-contract.md#player-actions-and-turns), or explicit values: base skill, current health, effective max health, exhaustion, effective weapon damage, and effective armor, which is 0 when the entry leaves it out. | None; it is required. |
| Enemies' side | A list of zero or more entries, in the fixed order of the side. Each entry is an Enemy of the Current campaign by Instance ID, an EnemyArchetype by identifier, which contributes the values [Enemy creation](#enemy-creation) gives a new Enemy of it, or explicit values as for an Agent. Instead of a list, the caller may name a MissionSiteArchetype, which contributes one entry for each Enemy a new Mission site of it would have, in their creation order under [Missions](missions.md). | None; it is required. |
| Rating Upgrades | The Rating Upgrades of the Agents' side, a whole number of at least 0, under [Combat rating](#combat-rating). | The Rating Upgrades of the Agents' side in the Current world state. |
| GDR values | A value for any of the GDR values that [Combat inputs and outputs](#combat-inputs-and-outputs) lists, e.g. a different `incapacitation_skill_fraction`. | The value the [Game build](../foundation/core-concepts.md#game-build-and-content) of the Current campaign supplies. |
| Detached seed | Text that is a permitted [Campaign seed](../foundation/determinism-and-randomness.md#glossary), from which every random outcome of the Detached Combat derives. | None; it is required. |

The following rules are complete:

- **Valid setup:** The operation is rejected, and fights nothing, when an Agents' side is empty, when one Agent or one Enemy of the Current campaign appears twice, when an Agent named by Instance ID is not [Serving](agents-spec.md#agent-statuses), when an Instance ID or identifier names nothing of its kind, when an explicit value lies outside [Attribute ranges](agents-spec.md#attribute-ranges) in Agents for its side, when the Rating Upgrades are not a whole number of at least 0, when a GDR value fails [Combat GDR validation](#combat-gdr-validation) or [Agent GDR validation](agents-spec.md#agent-gdr-validation) in Agents, or when the Detached seed is not a permitted Campaign seed. The rejection names the first such fault.
- **Random outcomes:** Each target selection has its target outcome and each attack its hit outcome and damage outcome, with the distributions [Target selection](#target-selection), [Hit outcome](#hit-outcome), and [Damage outcome](#damage-outcome) state, derived from the Detached seed alone. The same `setup` therefore always gives the same outputs, and two Detached seeds give independent outcomes. No random outcome of the Current campaign is drawn, and no override under [Random outcome overrides](../foundation/developer-access.md#random-outcome-overrides) in Developer Access applies.
- **Outputs:** It returns the Combat summary, the Combat report under [Combat report](#combat-report), which records every attack, and the outputs under [Combat inputs and outputs](#combat-inputs-and-outputs): each Combatant's final current health and exhaustion and whether it is dead. Each participant is identified by its side and position in it, together with the Instance ID or identifier its entry named, if any.
- **Changes nothing:** It is a Developer tool, not a [Player action](../foundation/engine-contract.md#player-actions-and-turns). No [Campaign state](../foundation/core-concepts.md#campaign-and-session) changes, including the Agents and Enemies it read, the [Timeline](../foundation/engine-contract.md#persisted-data), and the [Turn report](../foundation/campaign-state.md#glossary); a Killed participant is Killed only in the returned Combat report.

## Batch of Detached Combats

A balancing tool asks the same question many times, e.g. how often four Agents of base skill 100 win at `raid_outpost`, and needs only how each Combat ended. Building a Combat report, with every attack in its Combat log, costs most of the time of a large Combat, so a batch fights many Detached Combats on one setup and keeps only their Combat summaries.

`developer.tools.fightCombatBatch(setup, count, stop)` is a Developer tool, available as `fightCombat` is. `setup` is as for `fightCombat`; `count` is the number of Detached Combats to fight, a whole number from 1 to 10,000; and `stop`, which the caller may leave out, holds `prevailed`, `notPrevailed`, or both, each a whole number of at least 1. The following rules are complete:

- **Each Combat of the batch:** Combat number `i` of the batch, for each `i` from 1 to `count`, is the Detached Combat that `fightCombat` fights on `setup` with its Detached seed replaced by the text `<seed>#<i>`, where `<seed>` is the setup's Detached seed and `<i>` is `i` in decimal digits without leading zeros, e.g. `raid_outpost#7` for the seventh Combat of a batch with Detached seed `raid_outpost`. Its random outcomes therefore derive from that text alone, and its Combat summary equals the Combat summary of that `fightCombat` call.
- **Stop:** Without `stop`, every Combat from 1 to `count` is fought. With `stop`, the Combats are fought in order of `i`, and the batch ends after the first Combat at which the number of Combats of the batch whose Combat outcome is Prevailed reaches `prevailed`, or the number whose Combat outcome is Retreated or Wiped reaches `notPrevailed`; the Combats after it are not fought. Which Combats are fought therefore depends only on `setup`, `count`, and `stop`, and the first `k` Combats fought are the same with or without `stop`.
- **Valid batch:** The operation is rejected, and fights nothing, when `setup` would be rejected by `fightCombat` under Valid setup, when `count` is not a whole number from 1 to 10,000, when `stop` is given and holds anything other than `prevailed` and `notPrevailed` as whole numbers of at least 1, or when `<seed>#<count>` is not a permitted [Campaign seed](../foundation/determinism-and-randomness.md#glossary), e.g. because it is longer than a Campaign seed may be. The rejection names the first such fault.
- **Outputs:** It returns, in order of `i`, the Combat summary of each Combat of the batch that was fought, under Recording in [Fighting a Combat](#fighting-a-combat): its Combat outcome and the number of Agents that are dead when it ends. It also returns the totals over the Combats fought: their number, the number of Combats with each Combat outcome, and the sum of the Agents dead. It returns no Combat report and no final value of any Combatant.
- **Changes nothing:** As for `fightCombat`. Each Combat of the batch starts from the values `setup` names, never from the values another Combat of the batch left, because a Detached Combat applies its outputs to nothing.

E.g., a balancing tool calls `fightCombatBatch` once with four explicit Agents of base skill 100, the Enemies of `raid_outpost`, the Detached seed `raid_outpost|4`, and a `count` of 100, and reads the number of Combats Prevailed from the totals. To learn only whether at least 90 of the 100 would be Prevailed, it gives `stop` with `prevailed` 90 and `notPrevailed` 11, and the batch ends as soon as the answer is certain, e.g. after the eleventh Combat not Prevailed. Calling `fightCombat` with the Detached seed `raid_outpost|4#37` gives the Combat report of the batch's thirty-seventh Combat, e.g. to see why it was lost.

# Player-visible information

Every value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces) under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces) from the moment it exists, without a reveal condition. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| An Enemy's Instance ID, its EnemyArchetype including the EnemyArchetype's `name`, and its Mission site | Yes |
| An Enemy's base skill, current health, base health, exhaustion, Weapon, base weapon damage, Armor, base armor, and effective armor | Yes |
| An Enemy's effective skill and Combat rating, and the Combat rating of any side, e.g. of a Mission site's Enemies | Yes |
| An Agent's base Combat rating and Combat rating, the base Combat rating of any side, and the Rating Upgrades of the Agents' side | Yes |
| Every fact of a Combat report, including every random outcome it records | Yes |
| Every property of each EnemyArchetype, Weapon, Armor, and CombatParameters GDR, and the meaning of `exhaustion_per_attack`, `exhaustion_per_defense`, and the four combat experience amounts of AgentParameters | Yes |

Wherever a hit chance is shown to the player, it is shown as a percentage with exactly one decimal place, i.e. its thousandths divided by 10, exactly and never rounded again, e.g. 996 as "99.6%" and 800 as "80.0%", so that it never reads "100%" or "0%".

Incapacitated, current armor, and a Combat in progress never exist in a World state, under [Combat timing](#combat-timing), so the player observes them only through the Combat report. **Unknown versus absent:** No value in the table above is hidden, so Player API never reports one as unknown. A damage outcome is absent, not zero, for an attack whose hit outcome is a miss; its health removed is 0. A Turn report holds a Combat report only for each Combat its Advance turn fought; a Mission whose Combat has not been fought has no Combat report anywhere.

# Edge cases and failure behavior

- **Empty Enemies' side:** No Enemy is able to fight at Combat start, so the Combat ends as Prevailed after 0 Combat rounds, with no attack and no change to any Agent ([Combat start](#combat-start)).
- **No Agent able to fight at Combat start:** When every Agent meets the incapacitation condition at Combat start, e.g. because of high exhaustion, and some Enemy is able to fight, the Combat ends as Wiped after 0 Combat rounds; every Agent survives unchanged ([Combat start](#combat-start)).
- **Single Combatant on a side:** A side of one Combatant is valid. Every attacker of the other side targets it while it is able to fight ([Target selection](#target-selection)).
- **Agent with lost current health or with exhaustion at Combat start:** The Combat starts from the Agent's current health and exhaustion. Its effective skill and the starting Combat rating reflect them, and it is Incapacitated from the start if it meets the incapacitation condition ([Combat start](#combat-start), [Combat rating](#combat-rating)).
- **Enemy with effective skill 0:** An alive Enemy whose effective skill is 0, e.g. one with base skill 0, meets the incapacitation condition, so it is Incapacitated from Combat start, never attacks, and is never a target ([Incapacitation condition](#incapacitation-condition)).
- **Rating Upgrades and retreat:** Rating Upgrades raise the Agents' starting Combat rating and their Combat rating after each Combat round by the same factor, so the first condition of the Retreated check barely changes, apart from rounding, while the second holds only against a stronger Enemies' side: an upgraded team retreats later against the same Enemies ([Combat rating](#combat-rating), [Combat end checks](#combat-end-checks)).
- **No Rating Upgrades:** With no purchase of an Upgrade that counts toward the Rating Upgrades, or with `rating_bonus_per_upgrade` 0, every Combat rating equals its base Combat rating ([Combat rating](#combat-rating)).
- **Enemy already dead at Combat start:** An Enemy with current health 0 is dead, not able to fight, and not Incapacitated ([Combat start](#combat-start)).
- **No attacker without a target:** The attack that leaves a side with no Combatant able to fight ends the Combat at once, so no Combatant ever takes a Combat turn with no opponent able to fight; the Combatants after it in the Phase order take no Combat turn and gain no exhaustion from one ([Combat end checks](#combat-end-checks)).
- **Last Combatants fall in one attack:** When one attack leaves neither side with a Combatant able to fight, the outcome is Prevailed ([Combat end checks](#combat-end-checks)).
- **Combat experience of a Killed Agent:** The Combat report records it like any other Agent's, but it is never added to Experience or base skill ([Combat experience](#combat-experience)).
- **Zero divisor:** The divisor of the hit chance's ratio is at least 2, because both effective skills are at least 1 ([Hit outcome](#hit-outcome)).
- **Damage outcome above remaining current health:** Current health falls to 0, not below; the health removed is the defender's remaining current health ([Effects of an attack](#effects-of-an-attack)).
- **Hit absorbed by armor:** A damage outcome no greater than the defender's current armor lowers only its current armor; its current health and effective skill do not change, and the health removed is 0 ([Effects of an attack](#effects-of-an-attack)).
- **Hit that breaks through armor:** A damage outcome greater than the defender's current armor lowers current armor to 0 and current health by the rest, e.g. 15 against current armor 8 removes 8 armor and 7 health ([Effects of an attack](#effects-of-an-attack)).
- **No armor:** A Combatant with effective armor 0 starts with current armor 0, so every hit on it removes health as if armor did not exist ([Combat start](#combat-start), [Effects of an attack](#effects-of-an-attack)).
- **Armor after a Combat:** Current armor is lost when the Combat ends, and the next Combat starts it at the Combatant's effective armor again, however much the last one removed ([Combat-only properties](#combat-only-properties)).
- **Damage outcome of 0:** With a `weapon_damage_range` of 1 a damage outcome can be 0; the hit removes no current health but still raises exhaustion ([Damage outcome](#damage-outcome)).
- **Exhaustion of `exhaustion_incapacitation` or more:** A Combatant reaching it is Incapacitated whatever its effective skill, and its exhaustion is not clamped; an Agent may start a Combat with exhaustion above it and is then Incapacitated from the start ([Incapacitation condition](#incapacitation-condition), [Termination](#termination)).
- **Ties in Phase order:** Among Combatants of a side with equal effective skill at the start of a phase, the one earlier in the fixed order takes its Combat turn first ([Combat rounds](#combat-rounds)).
- **Candidates with equal Selection weights:** Two candidates with equal Selection weights are equally likely targets, e.g. every Agent for an attacking Enemy ([Target selection](#target-selection)).
- **Every attack misses:** The Combat still ends, through Incapacitated or Retreated, within `N × exhaustion_incapacitation` Combat rounds ([Termination](#termination)).
- **Invalid inputs:** An empty Agents' side, a duplicate Combatant, or an Agent that is not Serving is an internal invariant violation in a Mission resolution step ([Combat inputs and outputs](#combat-inputs-and-outputs)), and a rejection of `developer.tools.fightCombat(setup)` and `developer.tools.fightCombatBatch(setup, count, stop)` ([Detached Combat](#detached-combat), [Batch of Detached Combats](#batch-of-detached-combats)).
- **A batch whose Detached seed is too long:** `fightCombatBatch` is rejected when `<seed>#<count>` is longer than a Campaign seed may be, even when the seed itself is permitted, because its last Combat would have no permitted Detached seed (Batch of Detached Combats).
- **A batch that stops early:** With `stop`, the batch may fight fewer than `count` Combats, and its totals count only those; a `stop` that `count` cannot reach, e.g. `prevailed` above `count`, changes nothing, and every Combat is fought (Batch of Detached Combats).
- **A batch Combat looked at in full:** `fightCombat` with the Detached seed `<seed>#<i>` and the same setup gives the Combat report of Combat `i` of the batch, whose Combat outcome and dead Agents equal its Combat summary (Batch of Detached Combats).
- **Detached Combat on Combatants of the Current campaign:** The Agents and Enemies it names keep their values; only the returned Combat report shows what the Combat did to them ([Detached Combat](#detached-combat)).
- **Invalid GDRs:** A Game build that fails [Combat GDR validation](#combat-gdr-validation), e.g. with a Weapon `base_weapon_damage` of 0, a `weapon_damage_range` of 1.5, `exhaustion_per_attack` and `exhaustion_per_defense` both 0, or a `target_base_weight` of 50 with a `target_preferred_hit_chance` of 0.8, is defective and no Campaign is created from it.

# TODOs

- TODO (later): Morale.
