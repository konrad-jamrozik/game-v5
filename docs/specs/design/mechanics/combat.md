# Combat

| Metadata | Value |
| --- | --- |
| Spec ID | COMBAT |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Enemies and the Combat GDRs, how a Combat is fought in Combat rounds, attacks and their random outcomes, Ammo spent in a Combat, Incapacitated, Combat rating with base Combat rating, rating factor, and team size factor, the Rested and Equipment Combat ratings, Combat outcomes, and the Combat report. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Combat](domain-model.md#combat) is where preparation is tested. The player decides which [Agents](agents-spec.md) to deploy to a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) and then has no further say: the Agents and the [Enemies](domain-model.md#glossary) there fight automatically, and the whole Combat is fought within one Advance turn. A tool that studies Combat, e.g. one that balances Enemies, can have a Combat fought on Combatants it supplies, by the very same procedure, without touching any Campaign.

Everything about a Combat follows from one rule: fighting only wears [Combatants](domain-model.md#combat) down. Every attack, hit or miss, raises exhaustion, and a hit removes what the defender's armor does not absorb from its current health, so effective skill can only fall while a Combat lasts. A Combatant whose current health reaches zero is [Killed](agents-spec.md#agent-statuses), and one whose effective skill falls too far or whose exhaustion grows too high is Incapacitated and stops fighting. The Combat is fought in Combat rounds until no [Enemy](domain-model.md#combat) can fight on, no [Agent](domain-model.md#agency-and-agents) can, or the Agents retreat, and because exhaustion keeps rising, every Combat ends. Its [Combat report](domain-model.md#combat) records every attack.

Combat builds on [Agents](agents-spec.md): Agents says what makes a Combatant strong, and Combat says how that strength is spent against an opponent.

![How a Combat fits between a Mission and the Turn report: deploying Agents to a Mission site creates a Deployed Mission; in the Mission resolution step its Combat is fought from Combat start through Combat rounds, each attack appended to the Combat log, until it ends with one Combat outcome; the Combat produces exactly one Combat report, which is part of the Turn report returned by getTurnReport() and reduced in a History entry, and the Combat outcome decides whether the Mission is Won or Lost](../../../images/diagrams/combat-terms.svg)

# Glossary

## Combat rounds and results

How a [Combat](domain-model.md#combat) is divided, and how it ends.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Fighting a Combat | Producing a Combat's outputs from its inputs: from Combat start through Combat rounds to its Combat outcome and [Combat report](domain-model.md#combat). It is [one procedure](#fighting-a-combat), whoever has the Combat fought. Its verb is "fight", e.g. "the Mission resolution step has the Combat fought". | Resolving, running, computing, executing, or simulating a Combat. A Mission, not a Combat, is resolved. |
| Combat summary | How a Combat ended, which [fighting it always produces](#fighting-a-combat), with or without its Combat report: its Combat outcome and the number of Agents that are dead when it ends. |  |
| Detached Combat | A Combat fought by `developer.tools.fightCombat(setup)` or `developer.tools.fightCombatBatch(setup, count, stop)` on [Combatants](domain-model.md#combat) and [values the caller supplies](#detached-combat), outside every [World state](../foundation/engine-contract.md#player-actions-and-turns), whose outputs are returned and applied to nothing. | Simulated Combat; test Combat |
| Combat round | One pass of a Combat in which every [Combatant](domain-model.md#combat) able to fight attacks once, unless the Combat ends first. | Round, naming a pass of a Combat |
| Agents' phase | The first part of a Combat round, in which each [Agent](domain-model.md#agency-and-agents) of the Agents' side takes one Combat turn, in the Phase order of its side. |  |
| Enemies' phase | The second part of a Combat round, in which each [Enemy](domain-model.md#combat) of the Enemies' side takes one Combat turn, in the Phase order of its side. |  |
| Phase order | The order in which the Combatants of one side take their Combat turns in one phase: from the highest to the lowest [effective skill](agents-spec.md#combatant-attributes) at the start of the phase, ties broken by the fixed order of the side. | Initiative, naming the order of Combat turns |
| Combat turn | One Combatant's part in a phase: it attacks once if it is able to fight, and otherwise does nothing. | Turn, naming a Combatant's part in a phase |
| Hit chance | The chance that one attack hits, as a whole number of thousandths from 1 to 999, which both decides its [hit outcome](#hit-outcome) and is shown to the player as a percentage with one decimal place, e.g. 996 as 99.6%. |  |
| Selection weight | How strongly an attacker is drawn to one opponent able to fight, as a whole number of at least 1; an attacker picks the opponent it attacks at random, in proportion to these weights. |  |
| Combat log | The list of every attack of one Combat, in the order in which it was made, kept in its [Combat report](domain-model.md#combat). |  |
| Armor removed | The [current armor](agents-spec.md#combatant-attributes) [one attack takes](#effects-of-an-attack) from its defender: the smaller of the damage outcome and the defender's current armor before the attack, or 0 on a miss. | Armor damage |
| Health removed | The [current health](agents-spec.md#combatant-attributes) one attack takes from its defender: the smaller of the damage outcome less the armor removed and the defender's current health before the attack, or 0 on a miss. | Damage, as a noun on its own |
| Damage dealt | The sum of the health removed by every attack one participant made in one Combat. |  |
| Damage taken | The sum of the health removed by every attack on one participant in one Combat. It is equivalent to the participant's [health lost](agents-spec.md#combatant-attributes): the current health it lost in that Combat. |  |
| Combat outcome | How a Combat ended for the [Agency](domain-model.md#agency-and-agents)'s team: Won, when no Enemy can fight on; Wiped, when no Agent can fight on; or Retreated, when the team withdrew. | Battle outcome; "Prevailed" for the Combat outcome Won, which is named Won like the Mission it decides. |

## Combatant condition in a Combat

Whether a Combatant still takes part in a Combat, and how strong it and its side are.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Incapacitated | Alive but too weakened to take further part in the current Combat. |  |
| Able to fight | Alive and not Incapacitated, so still attacking and still liable to be attacked. |  |
| Base Combat rating | How strong a Combatant or a side is by effective skill alone: the [effective skill](agents-spec.md#combatant-attributes) of one Combatant, or the [sum of the effective skill](#combat-rating) of a side's Combatants able to fight. |  |
| Rating factor | How much a Combatant's [effective weapon damage](agents-spec.md#combatant-attributes), [effective max health](agents-spec.md#combatant-attributes), and [effective armor](agents-spec.md#combatant-attributes) raise or lower its Combat rating against its effective skill: [half the sum](#combat-rating) of how hard it hits, how much harm its max health can take, and how much harm its armor absorbs, each against its rating base, as a multiplier above 0 that is 1 for a Combatant at the rating bases, with no armor. |  |
| Team size factor | How much the number of a side's Combatants able to fight raises its Combat rating above the sum of what each of them adds: that number [raised to `rating_team_size_exponent − 1`](#combat-rating). |  |
| Combat rating | How strong a Combatant or a side is in a Combat: the sum, over the Combatants of the side able to fight, of the effective skill of each times its rating factor, times the team size factor of the side, and [rounded down](#combat-rating). | Combat strength; combat power; effective Combat rating |
| Rested Combat rating | The Combat rating a [Serving](agents-spec.md#agent-statuses) Agent [would have fully rested and unhurt](#rested-and-equipment-combat-ratings). | Max Combat rating |
| Equipment Combat rating | How much a Serving Agent's equipment [adds to its Combat rating](#rested-and-equipment-combat-ratings) above the issued kit; below 0 when it wears less. | Gear rating |

## Ammo

What an Agent's Weapon spends in a Combat.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Ammo | Rounds of one [AmmoType](#ammotype), counted in whole rounds; one Agent attack with a Weapon that has an `ammo_type` [spends one round](#ammo-in-a-combat) of it. | Ammunition, naming the counted rounds |
| Fallback Weapon | The Weapon an Agent fights with when it has no other or its Ammo has run out in a Combat: `fallback_weapon` of CombatParameters, e.g. a knife. |  |

# Combat GDRs

Five [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling) configure Enemies and Combats. The [exhaustion](agents-spec.md#combatant-attributes) and the [combat experience](agents-spec.md#growth) that an attack gives are properties of [AgentParameters](agents-spec.md#agentparameters).

## EnemyArchetype

An EnemyArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of an Enemy: it says how strong a newly created Enemy of one kind is and what it is equipped with.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Enemy. | [Player-visible information](#player-visible-information) |
| `base_skill` | The [base skill](agents-spec.md#combatant-attributes) of a newly created Enemy, a whole number of at least 0. | [Enemy creation](#enemy-creation) |
| `base_health` | The [base health](agents-spec.md#combatant-attributes) of a newly created Enemy, a whole number of at least 1. | [Enemy creation](#enemy-creation) |
| `weapon` | A reference to the Weapon GDR a newly created Enemy is equipped with. | [Enemy creation](#enemy-creation) |
| `armor` | A reference to the Armor GDR a newly created Enemy is equipped with. | [Enemy creation](#enemy-creation) |

## Weapon

A Weapon GDR gives the [base weapon damage](agents-spec.md#combatant-attributes) of the Combatants equipped with it. [Equipment](equipment.md) says how the Agency keeps, equips, buys, and sells Weapons and Armors.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Weapon. | [Player-visible information](#player-visible-information) |
| `base_weapon_damage` | The base weapon damage of a Combatant equipped with this Weapon, in health points: a whole number of at least 1. | [Enemy creation](#enemy-creation); [Agent creation](agents-spec.md#agent-creation); [Equipping Agents](equipment.md#equipping-agents) |
| `price` | Optional: the money one of it costs, a whole number of at least 1. Only a Weapon with a `price` can be [bought](equipment.md#buying-items), [sold](equipment.md#selling-items), and kept in store. | [Equipment](equipment.md) |
| `ammo_type` | Present exactly when `price` is: a reference to the [AmmoType](#ammotype) one Agent attack with it spends. | [Ammo in a Combat](#ammo-in-a-combat) |
| `unlocked_by` | Optional, only with `price`: one or more references to the [Leads](domain-model.md#leads-investigations-mission-sites-and-missions) of which any one, once completed, lets the Agency [buy it](equipment.md#unlocked-items). | [Equipment](equipment.md) |

## Armor

An Armor GDR gives the [base armor](agents-spec.md#combatant-attributes) of the Combatants equipped with it. Every Combatant is equipped with exactly one Armor; a Combatant that wears none is equipped with an Armor whose `base_armor` is 0.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Armor. | [Player-visible information](#player-visible-information) |
| `base_armor` | The base armor of a Combatant equipped with this Armor, in health points: a whole number of at least 0. | [Enemy creation](#enemy-creation); [Agent creation](agents-spec.md#agent-creation); [Equipping Agents](equipment.md#equipping-agents) |
| `price` | Optional: as for a Weapon. | [Equipment](equipment.md) |
| `unlocked_by` | Optional, only with `price`: the Leads of which any one, once completed, lets the Agency buy it. | [Equipment](equipment.md) |

## AmmoType

Each kind of round a Weapon spends is one GDR of Type AmmoType.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the AmmoType. | [Player-visible information](#player-visible-information) |
| `price` | The money one round costs: a whole number of at least 1. | [Equipment](equipment.md) |
| `shot` | How firing one round looks to the Player, as Display content: `bullet` for a single projectile, `burst` for several in quick succession, or `beam` for a ray. | [Player-visible information](#player-visible-information) |

## CombatParameters

CombatParameters bundles the numbers that tune a Combat: how far damage spreads, when a Combatant stops fighting, when a team retreats, whom an Agent prefers to attack, and how a Combat rating weighs a Combatant.

| Property | Meaning | Read by |
| --- | --- | --- |
| `weapon_damage_range` | How far a damage outcome may lie below or above the attacker's effective weapon damage, as a fraction of that effective weapon damage, from 0 to 1. | [Damage outcome](#damage-outcome) |
| `retreat_below_agent_rating_fraction` | The fraction of the Agents' side's Combat rating at Combat start below which the team considers retreating, at least 0. | [Combat end checks](#combat-end-checks) |
| `retreat_at_enemy_to_agent_rating` | The ratio of the Enemies' side's Combat rating to the Agents' side's Combat rating at or above which a team that considers retreating retreats, at least 0. | [Combat end checks](#combat-end-checks) |
| `incapacitation_skill_fraction` | The fraction of a Combatant's base skill at or below which its effective skill makes it Incapacitated, at least 0 and less than 1. | [Incapacitation condition](#incapacitation-condition) |
| `target_base_weight` | The hit-chance weight of an Enemy that an attacking Agent would hit with exactly the preferred hit chance. It is a whole number of at least `100 × target_preferred_hit_chance` and of at least `100 × (1 − target_preferred_hit_chance)`, so that every hit-chance weight is at least 1. | [Target selection](#target-selection) |
| `target_preferred_hit_chance` | The hit chance, as a fraction from 0 to 1, that an attacking Agent most prefers against its target. | [Target selection](#target-selection) |
| `rating_base_health` | The effective max health that makes the health term of a Combatant's rating factor 1, a whole number of at least 1. | [Combat rating](#combat-rating) |
| `rating_base_armor` | The effective armor that makes the armor term of a Combatant's rating factor 1, a whole number of at least 1. | [Combat rating](#combat-rating) |
| `rating_base_weapon_damage` | The effective weapon damage that makes the attack term of a Combatant's rating factor 1, a whole number of at least 1. | [Combat rating](#combat-rating) |
| `rating_team_size_exponent` | The exponent of the number of Combatants able to fight in the Combat rating of a side: 1 rates a side as the sum of what its Combatants add, and above 1 rates a side of more Combatants higher than that sum. It is from 1 to 2, with at most two digits after the decimal point. | [Combat rating](#combat-rating) |
| `fallback_weapon` | A reference to the Fallback Weapon: a Weapon with no `price` and no `ammo_type`. | [Ammo in a Combat](#ammo-in-a-combat); [Equipment](equipment.md) |

# Enemies

Enemies are the opponents the Agency's Agents fight at a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions). Each is a Combatant like an Agent, but it belongs to its Mission site alone and never recovers.

## Enemy properties

An Enemy is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is an EnemyArchetype. Its [Constants](../foundation/core-concepts.md#campaign-instances) hold an Immutable reference to the Mission site at which it is present. Its [State](../foundation/core-concepts.md#campaign-instances) holds what the [Combatant Role Type](agents-spec.md#combatant-role-type) requires of a Combatant, each as an [Authoritative value](../foundation/core-concepts.md#value-classification): its base skill, its base health, its [health lost](agents-spec.md#combatant-attributes), its exhaustion, the Weapon GDR it is equipped with and its base weapon damage, and the Armor GDR it is equipped with and its base armor.

After its creation an Enemy changes only through the [attacks](#effects-of-an-attack) of a Combat, which lower its current health and raise its exhaustion. An Enemy has no lifecycle, no [Assignment](domain-model.md#agency-and-agents), and no [Turn series](../foundation/world-history.md#glossary): an Enemy whose current health is 0 is dead, which is a [Derived value](../foundation/core-concepts.md#value-classification) of its current health and not a stored state.

An Enemy becomes [Retired](../foundation/world-history.md#glossary) when its Mission site does, and is kept in the [Retired world state](../foundation/campaign-state.md#glossary) with its final values, so that every reference to it resolves, e.g. from a Combat report.

## Enemy creation

Every Enemy is created [together with the Mission site](missions.md#enemy-creation) at which it is present, from one EnemyArchetype. It starts with the `base_skill` and `base_health` of that EnemyArchetype, with the Weapon and the Armor the EnemyArchetype references and their `base_weapon_damage` and `base_armor`, with no health lost, and with exhaustion 0.

# Combats

A Combat turns a deployment into a result without any choice from the player. It is a function of its inputs alone, fought by one procedure whoever has it fought.

## Combat inputs and outputs

What a Combat reads and what it produces are fixed, so that the same Combat fought anywhere gives the same result. A Combat reads only the following:

1. **The Agents' side:** a list of one or more distinct [Serving](agents-spec.md#agent-statuses) Agents.
2. **The Enemies' side:** a list of zero or more distinct Enemies.
3. **Current values:** the base skill, current health, effective max health, exhaustion, effective weapon damage, and effective armor of every Combatant in the two lists, as they are when the Combat begins.
4. **GDR values:** the properties of CombatParameters, the properties of AgentParameters that [effective skill](agents-spec.md#effective-skill), the [Incapacitation condition](#incapacitation-condition), the [effects of an attack](#effects-of-an-attack), and [combat experience](#combat-experience) read, and the Weapon of each Agent with its `ammo_type` and the `base_weapon_damage` of the Fallback Weapon.
5. **Ammo:** for each AmmoType, the rounds at hand when the Combat begins, or no limit.
6. **Random outcomes:** the target outcome of each [target selection](#target-selection), and the [hit outcome](#hit-outcome) and [damage outcome](#damage-outcome) of each attack.

E.g., the turn number, the kind of the Mission site, and an Agent outside the Agents' side have no effect on a Combat.

A Combat produces its [Combat report](#combat-report), the changed current health and exhaustion of its Combatants, the rounds of each AmmoType left, and the [Agent status](domain-model.md#agency-and-agents) [Killed](agents-spec.md#agent-statuses) of every Agent whose current health reached 0.

## Fighting a Combat

Fighting a Combat is one procedure, so that what a balancing tool measures is exactly what play produces.

- **One procedure:** The [Mission resolution step](missions.md#resolving-one-mission), `developer.tools.fightCombat(setup)`, and `developer.tools.fightCombatBatch(setup, count, stop)` each have a Combat fought by this procedure and by no other. They differ only in where the inputs come from, which outputs are recorded, and what is done with the outputs.
- **Recording:** Building the Combat report is an option that the caller turns on or off, and the Combat summary is produced either way. The [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) resolution step and `fightCombat` turn it on, and `fightCombatBatch` turns it off. Turning it off leaves out only facts that nothing in the Combat reads: every target selection, attack, random outcome, and Combat end check happens exactly as with it on.
- **Pure in its inputs:** Given equal inputs, including equal values of every random outcome, fighting a Combat produces equal outputs, whoever has it fought.
- **Applying the outputs belongs to the caller:** Fighting a Combat changes no World state itself. The Mission resolution step applies the outputs to the Combatants, and a Detached Combat applies them to nothing.

## Combat-only properties

Two properties mean something only while a Combat lasts. They are the gained properties of the [Combatant Role Type](agents-spec.md#combatant-role-type), and both are set at [Combat start](#combat-start):

| Gained property | Value | Meaning |
| --- | --- | --- |
| Incapacitated | Yes or no | Whether the Combatant is Incapacitated. |
| [Current armor](agents-spec.md#combatant-attributes) | A whole number of at least 0 | How much more of the damage of hits the Combatant's armor absorbs in this Combat. |

The Combat report records their values at the end of the Combat, and they affect nothing after it. E.g., an Agent that was Incapacitated at the end of a Combat is an ordinary Serving Agent afterward, with the current health and exhaustion the Combat left it.

## Incapacitation condition

A Combatant stops fighting when it is too weakened to matter or too worn down to go on. It meets the incapacitation condition exactly when its current health is greater than 0 and at least one of the following holds:

```text
effective skill  ≤  incapacitation_skill_fraction × base skill        (skill clause)
exhaustion       ≥  exhaustion_incapacitation                         (exhaustion clause)
```

Here `exhaustion_incapacitation` is the AgentParameters property. Each comparison is [exact](../foundation/numbers.md#exact-evaluation), and the right-hand side of the skill clause is never rounded. E.g., with an `incapacitation_skill_fraction` of 0.15, a Combatant of base skill 50 meets the skill clause at an effective skill of 7 or less, since 7 ≤ 7.5 < 8.

Outside a Combat no Combatant has the property Incapacitated, so there a Combatant is able to fight exactly when its current health is greater than 0 and it does not meet the incapacitation condition. [Combat rating](#combat-rating) uses this, e.g. for the Enemies of a Mission site before any team is deployed.

## Combat timing

A Combat takes no game time of its own. It begins and ends within one [Turn advancement step](domain-model.md#turn-advancement-steps) of one Advance turn, the step in which [Missions](missions.md#mission-resolution) has it fought, and nothing else happens between its first and its last attack; a Detached Combat begins and ends within one call of its [Developer tool](../foundation/engine-contract.md#api-surfaces) and belongs to no Advance turn. No [World state](../foundation/engine-contract.md#player-actions-and-turns) therefore contains a Combat in progress, a Combat round, the Incapacitated property, or current armor.

# Combat rating

A Combat rating measures how strong a team is, so that the Player and the Agents' retreat can weigh it against the Enemies. Effective skill carries most of that strength; a Combatant's rating factor adjusts it for how hard the Combatant hits, how much harm its max health can take, and how much harm its armor absorbs, each against a rating base of its own. The team size factor then rates a side of more Combatants higher than the sum of what each adds, because more Combatants share the opponents' attacks.

```text
attack(c)               = effective weapon damage(c) / rating_base_weapon_damage
health(c)               = effective max health(c) / rating_base_health
armor(c)                = effective armor(c) / rating_base_armor
rating factor(c)        = (attack(c) + health(c) + armor(c)) / 2
team size factor        = n ^ (rating_team_size_exponent − 1)
base Combat rating      = Σ effective skill(c)
Combat rating of a side = round down( team size factor × Σ effective skill(c) × rating factor(c) )
```

Each sum is over every Combatant `c` of the side that is [able to fight](#incapacitation-condition), and `n` is their number; a side with no such Combatant has a base Combat rating and a Combat rating of 0. The Combat rating is [evaluated exactly](../foundation/numbers.md#exact-evaluation) and [rounded](../foundation/numbers.md#rounding) once, for the side, so it can differ from the sum of the Combat ratings of its Combatants. Every input is the Combatant's value at the moment the Combat rating is read, and the armor term reads effective armor, never current armor.

The base Combat rating and the Combat rating of one Combatant are those of a side holding that Combatant alone, except that its base Combat rating is its effective skill even when it is not able to fight. Agents and Enemies are rated alike: an Agent's [Weapon and Armor](equipment.md#equipping-agents) and the Agency's [Upgrades](domain-model.md#agency-and-agents) count only through the effective max health, effective armor, and effective weapon damage they give it. Every rule that weighs one side against another reads the Combat rating, never the base Combat rating, e.g. the [Retreated check](#combat-end-checks).

E.g., with a `rating_base_weapon_damage` of 8, a `rating_base_health` of 40, a `rating_base_armor` of 10, and a `rating_team_size_exponent` of 1.5, a Combatant of effective skill 60, effective weapon damage 12, effective max health 30, and effective armor 5 has an attack term of 12 / 8 = 1.5, a health term of 30 / 40 = 0.75, an armor term of 5 / 10 = 0.5, a rating factor of (1.5 + 0.75 + 0.5) / 2 = 1.375, and a Combat rating of `round down(60 × 1.375) = round down(82.5) = 82`. A side of four such Combatants has a team size factor of 4 ^ 0.5 = 2 and a Combat rating of `round down(2 × 4 × 82.5) = 660`, while their four Combat ratings sum to 328.

**Informative rationale:** The three terms, their rating bases, and the team size exponent were chosen with the Combat Rating Bench in `tools/combat-rating-bench/`, so that teams sized to one share of a Mission site's Combat rating win at a consistent rate whatever their skill and Upgrades; weighing armor against a base of its own, rather than adding it point for point to max health, rated armored teams more consistently, and a rating factor that weighed each point of health, armor, and weapon damage by a bonus of its own rated single kinds of Upgrade less consistently. Halving the sum of the three terms keeps a Combatant at the rating bases, e.g. an Agent without Upgrades, at its effective skill. Agent teams with few Upgrades still lose more often than better-equipped teams of the same Combat rating.

## Rested and Equipment Combat ratings

Two further Combat ratings of one Serving Agent tell the Player what rest and equipment are worth to it. Neither is read by any rule of a Combat.

- **Rested Combat rating:** the Combat rating the Agent would have with exhaustion 0 and health lost 0, with its own equipment, base skill, and effective max health.
- **Equipment Combat rating:** the Agent's Combat rating minus the Combat rating it would have wearing the `weapon` and the `armor` of its [AgentArchetype](agents-spec.md#agentarchetype), the issued kit, with every other value its own. It is below 0 when the Agent wears less than the issued kit.

Both read effective weapon damage outside a Combat, so neither depends on Ammo. E.g., with the rating bases 10 for weapon damage, 30 for health, and 20 for armor and an issued kit of weapon damage 10 and armor 0, an unhurt Agent of effective skill 100 and effective max health 30 has a Combat rating of 100 in the issued kit and an Equipment Combat rating of 0; with a Weapon of damage 14 and an Armor of armor 20 its Combat rating is `round down(100 × (1.4 + 1 + 1) / 2) = 170` and its Equipment Combat rating 70; with the Fallback Weapon of damage 5 and armor 0 they are 75 and −25.

# Combat flow

The sides take turns, and the strongest of a side act first. Who acts when follows from the Combatants' values alone; chance enters only in whom each attacker targets and in its attacks.

## Fixed order of each side

Each side has a fixed order for the whole Combat: the order of its input list, which whoever has the Combat fought supplies, i.e. [Missions](missions.md#resolving-one-mission) or the caller of a [Detached Combat](#detached-combat). A Combatant that dies or becomes Incapacitated keeps its position. The fixed order breaks ties in the Phase order, and the Combat report lists each side in it.

## Combat start

A Combat begins by settling who is fit to fight at all, which can end it before any attack. When a Combat begins, before any Combat round:

1. Every Combatant of both sides gains Incapacitated, set to yes exactly when the Combatant meets the [Incapacitation condition](#incapacitation-condition) with its current values, and gains current armor, set to its effective armor.
2. The Combat rating of the Agents' side at this moment is its starting Combat rating, which the Retreated check reads.
3. If no Enemy is able to fight, the Combat ends with the Combat outcome Won after 0 Combat rounds. Otherwise, if no Agent is able to fight, it ends with the Combat outcome Wiped after 0 Combat rounds. Otherwise the first Combat round begins.

## Combat rounds

Combat rounds are numbered from 1, and each consists of the Agents' phase followed by the Enemies' phase. The Phase order of a side is set when its phase begins and stays as set for that phase. E.g., Agents of effective skill 90, 120, and 90, in this fixed order, take their Combat turns in the order 120, then the first 90, then the second 90.

On its Combat turn, a Combatant that is able to fight at that moment [selects a target](#target-selection) and makes exactly one [attack](#attacks) on it. Every effect of an attack applies immediately, so every later Combat turn, target selection, and attack reads the changed values. E.g., an Enemy killed in the Agents' phase does not attack in the Enemies' phase of the same Combat round.

Combat rounds follow one another until a [Combat end check](#combat-end-checks) ends the Combat. Their number has no cap: a Combat ends because [every attack tires someone](#effects-of-an-attack) and enough exhaustion makes a Combatant [Incapacitated](#incapacitation-condition).

## Target selection

Enemies strike at whichever Agent is in reach. Agents pick their fights: each prefers an Enemy it is likely but not certain to hit, and is drawn less to an Enemy with so little health left that much of a hit would be wasted on it, but every Enemy able to fight can be its target.

An attacker selects its target at its Combat turn, among its candidates: the Combatants of the other side that are able to fight at that moment. Each target selection has one named random outcome, its target outcome, whose possible values are the candidates. Each candidate is the target with the [Probability](../foundation/numbers.md#glossary) of its Selection weight divided by the sum of the Selection weights of all candidates. The candidates and their Selection weights are determined anew at every target selection, from the values at that moment, and depend on the attacker's side:

- **Enemy attacker:** every candidate has Selection weight 1.
- **Agent attacker:** the Selection weight of a candidate Enemy is

  ```text
  hit-chance weight = target_base_weight − round down( | 100 × target_preferred_hit_chance − hit chance / 10 | )
  usefulness        = min(w, H) / w
  Selection weight  = round up( hit-chance weight × usefulness )
  ```

  Here hit chance is the [hit chance](#hit-outcome) the attack would have on that candidate, so `hit chance / 10` is that chance in percent; w is the attacker's effective weapon damage; and H is the candidate's current health plus its current armor. The usefulness is the fraction of a hit of w that the candidate can still take, as armor removed or health removed. The difference and the product are each evaluated exactly and rounded once.

E.g., with a `target_base_weight` of 120 and a `target_preferred_hit_chance` of 0.7, an Agent of effective skill 300 and effective weapon damage 20 faces two Enemies. It would hit the first, of effective skill 120, with the hit chance 862, so that Enemy's hit-chance weight is `120 − round down(16.2) = 104`; that Enemy has current health 9 and current armor 3, so its usefulness is 12 / 20 and its Selection weight is `round up(62.4) = 63`. It would hit the second, of effective skill 200 and current health 40, with the hit chance 692, so that Enemy's hit-chance weight is `120 − round down(0.8) = 120`, its usefulness is 1, and its Selection weight is 120. The Agent targets them with the Probabilities 63/183 and 120/183.

**Informative rationale:** An Agent that prefers an Enemy it is likely but not certain to hit neither wastes attacks on long shots nor spends them all finishing off the weakest Enemy. Discounting an Enemy by the part of a hit its remaining health and armor could not take keeps a hard-hitting Agent from spending its damage on Enemies too frail to absorb it while a stronger Enemy fights on. The discount never shuts an Enemy out, because every Selection weight is at least 1, and an Enemy wounded enough to be steeply discounted has lost effective skill in proportion to its lost health, so it is also the lesser threat. Enemies, who have no such judgement, spread their attacks evenly over the team.

# Attacks

An attack is made by one attacker on one defender, its target. It has one hit outcome and, when the hit outcome is a hit, one damage outcome. Each random outcome of a Combat is independent of every other, except that a damage outcome exists only for an attack that hits.

## Hit outcome

Each attack has one named random outcome, the hit outcome, whose possible values are hit and miss. It is a hit with the [Probability](../foundation/numbers.md#glossary) `hit chance / 1000`, and a miss otherwise:

```text
hit chance = min( 999, max( 1, round down( 1000 × A² / (A² + D²) ) ) )
```

Here A is the attacker's effective skill and D is the defender's, both read at the moment of the attack, before any effect of that attack. The ratio is evaluated exactly, and its thousandfold is rounded once. The bounds of 1 and 999 keep every attack uncertain, however far apart the two effective skills are.

E.g., A = 107 and D = 40 give `round down(877.38…) = 877`, i.e. 87.7%.

## Damage outcome

Each attack whose hit outcome is a hit has one named random outcome, the damage outcome. It is a [uniform whole-number outcome](../foundation/numbers.md#uniform-whole-number-outcomes) over the inclusive range from `lo` to `hi`:

```text
lo = round up( w × (1 − weapon_damage_range) )
hi = round down( w × (1 + weapon_damage_range) )
```

Here w is the attacker's effective weapon damage, and each bound is evaluated exactly and rounded once. The damage outcome does not depend on the defender.

E.g., with a w of 9 and a `weapon_damage_range` of 0.3, `lo = round up(6.3) = 7` and `hi = round down(11.7) = 11`, so the damage outcome is 7, 8, 9, 10, or 11, each with the Probability 1/5.

## Effects of an attack

An attack wears Combatants down: it always adds exhaustion to at least one of them, and a hit takes armor and then health from the defender. One attack applies these effects, in this order, before the next Combat turn begins:

1. **Outcomes:** The hit chance is formed, and the attack has its [hit outcome](#hit-outcome) and, on a hit, its [damage outcome](#damage-outcome).
2. **Armor and health:** On a hit, the defender's current armor falls by the armor removed, and its current health by the health removed. A miss changes neither.
3. **Exhaustion:** The attacker gains `exhaustion_per_attack` exhaustion and the defender gains `exhaustion_per_defense` exhaustion, hit or miss. The two amounts add up to at least 1, so that every attack tires someone.
4. **Evaluation:** The defender and then the attacker are [evaluated](#killed-and-incapacitated), with their values after steps 2 and 3.

An attack changes nothing else except the round an Agent's attack [spends](#ammo-in-a-combat), e.g. no base skill, no [Experience](agents-spec.md#growth), and no other Combatant.

E.g., a defender with current health 30 and current armor 25 that is hit with the damage outcomes 10 and then 20 is left with current health 30 and current armor 15, and then with 25 and 0, because its current armor absorbs 15 of the 20 and the other 5 are health removed.

## Ammo in a Combat

Agents fight with the rounds the Agency has at hand, and an Agent whose rounds run out fights on with the Fallback Weapon. Enemies never run out.

A Combat keeps, for each AmmoType, its rounds left, which start at the rounds at hand. An Agent's attack whose Weapon has an `ammo_type` with at least 1 round left spends one round of it, after its outcomes are formed at step 1 of the [effects of an attack](#effects-of-an-attack), so the attack that spends the last round still hits with the Weapon. An attack by an Agent whose Weapon has no `ammo_type`, an attack while its `ammo_type` has 0 rounds left, and every Enemy attack spend nothing; an AmmoType with no limit never runs out.

Within a Combat, an Agent's Weapon whose `ammo_type` has 0 rounds left gives the Agent the [effective weapon damage](agents-spec.md#effective-weapon-damage) of the Fallback Weapon, which every rule that reads effective weapon damage then reads, e.g. the [damage outcome](#damage-outcome) and the [Combat rating](#combat-rating). No rule adds rounds while a Combat lasts, so an Agent that runs out stays on the Fallback Weapon until the Combat ends.

E.g., two Agents with rifles and 3 rounds of their Ammo left: in the next Agents' phase the first spends 1, the second 1, and in the phase after the first spends the last round, so the second attacks with the Fallback Weapon, and so does the first from then on.

## Combat experience

Every attack an Agent makes or takes teaches it something, whether it hits or misses, but the Agent keeps the lesson only if it lives through the Mission.

The combat experience of an Agent in a Combat is the sum, over every attack of the Combat log in which it is the attacker or the defender, of the amount in this table:

| The Agent's part in the attack | Hit outcome | Amount                        |
| ------------------------------ | ----------- | ----------------------------- |
| Attacker                       | Hit         | `experience_per_attack_hit`   |
| Attacker                       | Miss        | `experience_per_attack_miss`  |
| Defender                       | Hit         | `experience_per_defense_hit`  |
| Defender                       | Miss        | `experience_per_defense_miss` |

It counts every such attack, including the one that made the Agent dead. A Combat only reports combat experience: [Mission growth](agents-spec.md#mission-growth) adds it to a survivor's [Experience](agents-spec.md#growth) after the Combat, so it does not strengthen the Agent in the Combat that earned it.

## Killed and Incapacitated

An attack can take a Combatant out of the Combat in two ways: by killing it, or by leaving it alive but Incapacitated. Each evaluation of a Combatant after an attack applies the first of these that holds:

1. **Dead:** Its current health is 0. It is dead and is not Incapacitated. A dead Agent becomes [Killed](agents-spec.md#agent-status) at this moment, and its [Service record](agents-spec.md#service-record) names the attacker; a dead Enemy stays an Enemy with current health 0, and counts toward the Enemies killed of the attacking Agent.
2. **Incapacitated:** It meets the [Incapacitation condition](#incapacitation-condition). Its Incapacitated property becomes yes.
3. Otherwise nothing changes.

An Incapacitated Combatant stays Incapacitated until the Combat ends. It is alive: an Incapacitated Agent survives the Combat and is not Killed.

# Combat end

A Combat stops the moment one side can no longer fight, and that side has lost; it also stops when the Agents are losing badly enough to withdraw.

## Combat end checks

A side that can no longer fight is noticed after every attack, and a retreat is considered only between Combat rounds. After every attack, these checks are made in this order, and the first that holds ends the Combat at once with its Combat outcome; no further Combat turn is taken, even in the middle of a phase:

1. **Won:** No Enemy is able to fight.
2. **Wiped:** No Agent is able to fight.

After the Enemies' phase of each Combat round, when the Combat has not ended, the Retreated check is made, and when it holds it ends the Combat with the Combat outcome Retreated:

3. **Retreated:** Both of the following hold, each compared [exactly](../foundation/numbers.md#exact-evaluation), with no rounding:

   ```text
   R_agents  <  retreat_below_agent_rating_fraction × R_start
   R_enemies ≥  retreat_at_enemy_to_agent_rating   × R_agents
   ```

   where `R_agents` and `R_enemies` are the Combat ratings of the Agents' side and the Enemies' side at the end of the Combat round, and `R_start` is the starting Combat rating of the Agents' side.

E.g., with a `retreat_below_agent_rating_fraction` of 0.4 and a `retreat_at_enemy_to_agent_rating` of 1.5, a team whose starting Combat rating was 500 and whose Combat rating at the end of a Combat round is 180 retreats when the Combat rating of the Enemies' side is 270 or more, and fights on when it is 269.

When one attack leaves no Combatant of either side able to fight, e.g. it kills the last Enemy able to fight while the exhaustion it adds Incapacitates the last Agent able to fight, the Combat outcome is Won, because that check comes first. The number of Combat rounds of a Combat is the number of the Combat round in which it ends, or 0 when it ended at its start.

## Combat outcomes

A Combat ends with exactly one Combat outcome, which is final. The Combat outcome itself changes no value of any Combatant: every Agent keeps the values the Combat left it, and [Missions](missions.md#resolving-one-mission) decides from the Combat outcome whether the Mission is Won or Lost and what becomes of each surviving Agent.

# Combat report

A Combat report is the full account of one Combat, from which a player can follow every attack. Every Combat fought with [recording](#fighting-a-combat) on produces exactly one, which holds these facts:

1. **Combat outcome:** Won, Retreated, or Wiped.
2. **Number of Combat rounds:** a whole number of at least 0.
3. **Participants:** the Agents' side and the Enemies' side, each as the list of [Instance IDs](../foundation/campaign-instances.md#glossary) in its fixed order.
4. **Starting values:** for each participant, its base skill, current health, effective max health, exhaustion, effective weapon damage, effective armor, effective skill, Combat rating, and Incapacitated value when the Combat began, after step 1 of [Combat start](#combat-start).
5. **Final values:** for each participant, its current health, current armor, exhaustion, and effective skill when the Combat ended, and its final condition: able to fight, Incapacitated, or dead.
6. **Damage dealt and damage taken:** for each participant, its damage dealt and its damage taken; and for each Agent, its [combat experience](#combat-experience).
7. **Combat ratings:** the Combat rating of each side at Combat start and at the end of every Combat round.
8. **Ammo:** for each AmmoType that a Weapon of the Agents' side uses, its rounds at hand at Combat start and its rounds left at Combat end.
9. **Combat log:** every attack, each with its Combat round number, its attacker and defender by Instance ID, A and D, the hit chance, the hit outcome, the damage outcome when there is one, the armor removed, the health removed, the defender's current armor after the attack, the current health and exhaustion of the attacker and the defender after the attack, and whether the attack made the defender dead or the defender or the attacker Incapacitated, and for an Agent's attack, the AmmoType of the round it spent, or that it was made with the Fallback Weapon because its Ammo had run out.
10. **Mission:** the Instance ID of the Mission whose Combat it records, which influences nothing in the Combat. The Combat report of a Detached Combat has no Mission, and identifies each participant [by its side and position](#detached-combat).

The health removed from an Agent, and the damage dealt and damage taken that sum it, are [Decimal quantities](../foundation/numbers.md#glossary), because an Agent's current health is one. E.g., a damage outcome of 10 against an Agent with current health 5.60 removes 5.60.

The [Turn report](../foundation/campaign-state.md#glossary) of the Advance turn in which a Combat was fought holds its Combat report in full. The [History entry](../foundation/world-history.md#glossary) of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) that Advance turn ends holds, of each Combat report, only its Combat outcome, its number of Combat rounds, its participants, for each participant its current health and effective skill at Combat start and at Combat end and its final condition, and the Combat rating of each side at Combat start and at Combat end. Combat end is the end of the last Combat round, or Combat start when the Combat had no Combat round. These are the values a Concluded Mission site is shown with for the rest of the [Campaign](../foundation/core-concepts.md#campaign-and-session).

# Detached Combat

Balancing a Combat needs many Combats fought on chosen teams and chosen GDR values, and its results are worth something only if they are exactly what a Campaign would produce. `developer.tools.fightCombat(setup)` is the [Developer tool](../foundation/developer-access.md#developer-tools) that fights one Detached Combat on what its caller supplies and returns its outputs. Its `setup` holds these parts:

| Part | What the caller supplies |
| --- | --- |
| Agents' side | A list of one or more entries, in the fixed order of the side. Each entry is either an Agent of the [Current campaign](../foundation/core-concepts.md#campaign-and-session) by Instance ID, which contributes that Agent's values in the [Current world state](../foundation/engine-contract.md#player-actions-and-turns), or explicit values: base skill, current health, effective max health, exhaustion, effective weapon damage, and effective armor, which is 0 when the entry leaves it out. |
| Enemies' side | A list of zero or more entries, in the fixed order of the side. Each entry is an Enemy of the Current campaign by Instance ID, an EnemyArchetype by identifier, which contributes the values of a [newly created Enemy](#enemy-creation) of it, or explicit values as for an Agent. Instead of a list, the caller may name a MissionSiteArchetype, which contributes one entry for each Enemy a new Mission site of it would have, in their [creation order](missions.md#enemy-creation). |
| GDR values | Optionally, a value for any of the GDR values a Combat reads, e.g. a different `incapacitation_skill_fraction`. A value left out is the one the [Game build](../foundation/core-concepts.md#game-build-and-content) of the Current campaign supplies. |
| Ammo | Optionally, the rounds at hand of any AmmoType. An AmmoType left out has no limit. An Agent of explicit values attacks with no `ammo_type`. |
| Detached seed | Text that is a permitted [Campaign seed](../foundation/determinism-and-randomness.md#glossary). |

Every random outcome of the Detached Combat derives from the Detached seed alone, with the distribution its rule states. The same `setup` therefore always gives the same outputs, and no [random outcome override](../foundation/developer-access.md#random-outcome-overrides) applies.

`fightCombat` returns the Combat summary, the Combat report, and each Combatant's final current health and exhaustion and whether it is dead. Each participant is identified by its side and its position in it, together with the Instance ID or identifier its entry named, if any.

## Batch of Detached Combats

A balancing tool asks the same question many times, e.g. how often one team wins at one Mission site, and needs only how each Combat ended. Building a Combat report costs most of the time of a large Combat, so `developer.tools.fightCombatBatch(setup, count, stop)` fights many Detached Combats on one setup and keeps only their Combat summaries.

`setup` is as for `fightCombat`; `count` is the number of Detached Combats to fight, a whole number from 1 to 10,000; and `stop`, which the caller may leave out, holds `won`, `notWon`, or both, each a whole number of at least 1.

- **Each Combat of the batch:** Combat number `i` of the batch, for each `i` from 1 to `count`, is the Detached Combat that `fightCombat` fights on `setup` with its Detached seed replaced by the text `<seed>#<i>`, where `<seed>` is the setup's Detached seed and `<i>` is `i` in decimal digits without leading zeros. Each Combat starts from the values `setup` names, never from the values another Combat of the batch left.
- **Stop:** Without `stop`, every Combat from 1 to `count` is fought. With `stop`, the Combats are fought in order of `i`, and the batch ends after the first Combat at which the number of Combats whose Combat outcome is Won reaches `won`, or the number whose Combat outcome is Retreated or Wiped reaches `notWon`.
- **Outputs:** It returns, in order of `i`, the Combat summary of each Combat that was fought, and the totals over them: their number, the number of Combats with each Combat outcome, and the sum of the Agents dead. It returns no Combat report and no final value of any Combatant.

E.g., to learn only whether at least 90 of 100 Combats would be Won, a balancing tool calls `fightCombatBatch` with the Detached seed `outpost|4`, a `count` of 100, and a `stop` whose `won` is 90 and whose `notWon` is 11, and the batch ends as soon as the answer is certain. Calling `fightCombat` with the same setup and the Detached seed `outpost|4#37` then gives the Combat report of the batch's thirty-seventh Combat, e.g. to see why it was lost.

## Detached Combat without a Current campaign

A Detached Combat on explicit values and on GDRs reads no Campaign, and a user interface may offer such Combats at the [Main menu](../foundation/campaign-lifecycle.md#glossary), where there is none, e.g. to try teams against each other. Two [Session API](../foundation/engine-contract.md#api-surfaces) operations therefore serve it, available to the [Session controller](../foundation/engine-contract.md#principals-and-access) whether or not the [Session](../foundation/core-concepts.md#campaign-and-session) has a Current campaign and whatever the [Dev mode](../foundation/engine-contract.md#principals-and-access) setting is, because they read only the Game build and change nothing:

- **`session.combatSimulator.fightCombat(setup)`** fights the Detached Combat that `developer.tools.fightCombat(setup)` fights on the same `setup`, and returns the same outputs. It reads no Campaign, so it rejects a setup with an entry that names an Agent or an Enemy by Instance ID, and every GDR value the setup leaves out is the one the Game build supplies.
- **`session.combatSimulator.getContent()`** returns what a setup is built from: the Player-visible properties of every Weapon, Armor, AmmoType, and EnemyArchetype and of the AgentArchetype, every MissionSiteArchetype with the EnemyArchetype of each Enemy a new Mission site of it would have, in their [creation order](missions.md#enemy-creation), and every [DetachedCombatTeam](#detachedcombatteam).

### DetachedCombatTeam

Which teams of Agents are worth having ready for such a Combat is content rather than design, so each is one GDR of Type DetachedCombatTeam, which serves the Display content purpose: no rule reads it, and `getContent()` returns them in their authored order. The Content designer keeps one that suits the Mission sites of each [Faction operation level](factions.md#glossary), and one that suits the hardest Mission site of the Game build.

| Property | Meaning                                                                               |
| -------- | ------------------------------------------------------------------------------------- |
| `name`   | The display name of the team, e.g. "Level 1 team".                                    |
| `agents` | A list of one or more groups of equal Agents, in the fixed order of the Agents' side. |

Each group of `agents` has these properties:

| Property     | Meaning                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `count`      | The number of Agents of the group, a whole number of at least 1.                                    |
| `base_skill` | The base skill of each, a whole number of at least 0.                                               |
| `max_health` | The effective max health of each, a whole number of at least 1. Each starts at full current health. |
| `exhaustion` | The exhaustion of each, a whole number of at least 0. It is 0 when the group leaves it out.         |
| `weapon`     | The Weapon of each, by identifier. Its `base_weapon_damage` is the effective weapon damage of each. |
| `armor`      | The Armor of each, by identifier. Its `base_armor` is the effective armor of each.                  |

# Player-visible information

A player decides whom to deploy by weighing a team against the Enemies it will meet, so nothing about Enemies or Combats is hidden. Every property and every Derived value of an Enemy, the base Combat rating, rating factor, team size factor, and Combat rating of any Combatant or side, every fact of a Combat report, including every random outcome it records, and every property of the Combat GDRs except the `unlocked_by` of a Weapon or an Armor, which [stays hidden](equipment.md#player-visible-information), are [Player-visible information](../foundation/engine-contract.md#api-surfaces) from the moment they exist.

# TODOs

- TODO (later): Morale.
