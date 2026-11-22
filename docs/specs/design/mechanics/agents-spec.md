# Agents

| Metadata | Value |
| --- | --- |
| Spec ID | AGENT |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | What an Agent has, the Combatant Role Type, Agent status, Assignments and the transit rule, effective skill, Training, Mission growth and Experience, work exhaustion, the start-work gate and Forced return, Agent creation and the initial roster, and the assignAgents and addAgents actions. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Agents are the player's main resource: an [Agent](domain-model.md#agency-and-agents) is an operative of the [Agency](domain-model.md#agency-and-agents) who can do only one thing at a time, and changing what it does costs time. That one thing is its [Assignment](domain-model.md#agency-and-agents), e.g. Contracting to earn money or Training to gain base skill. Standby and Training are in the Agency's base, and Contracting and Investigations away. Every trip to or from away work costs an Advance turn In transit, and only an Agent In base, unless Recovering, can be sent away or deployed to a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), so an Agent Away is not at hand.

How well an Agent works and fights is its effective skill: its base skill, lowered by lost current health and by exhaustion above a free amount. Training and Missions raise base skill; Contracting, Training, and [Combats](domain-model.md#combat) wear it down, so an Assignment trades present output against future strength. An Agent is Serving until it is Killed in a Combat or Dismissed, and it is never removed, so its record outlasts its service.

Agents builds on [Domain Model](domain-model.md): Domain Model says how an Agent connects to the Agency and its work, and Agents says what one Agent is and how it works.

# Glossary

These terms are specific to Agents. General terms are in the [Domain Model glossary](domain-model.md#glossary); terms about regaining health, [Combats](domain-model.md#combat), and the [Agency](domain-model.md#agency-and-agents)'s caps are in the [Agent Recovery](agent-recovery.md#glossary), [Combat](combat.md#glossary), and [Economy and Upgrades](economy-and-upgrades.md#glossary) glossaries.

## Combatant attributes

What makes an [Agent](domain-model.md#agency-and-agents) or an [Enemy](domain-model.md#combat) able to work and to fight, and how worn down it is. The names follow one rule:

- **Base:** Base X is a lasting stored value, e.g. base skill, which only named rules change.
- **Effective:** Effective X is base X adjusted for the situation and is never stored, e.g. effective skill; effective max health is base health adjusted in this way.
- **Current:** Current X is a value that is used up and restored, e.g. current health. It is never stored: it is what is left of the most a [Combatant](domain-model.md#combat) can have after what it has lost.
- **GDR property:** A [GDR](../foundation/core-concepts.md#game-build-and-content) property `base_x` gives the starting value of base X, e.g. `base_health`.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Base skill | How capable a [Combatant](domain-model.md#combat) is at its work and in a Combat, before its lost current health and its exhaustion reduce it. An Agent's base skill is a [Decimal quantity](../foundation/numbers.md#glossary), so Training can raise it by less than one point. | Skill, naming the stored value |
| Effective skill | A Combatant's base skill as reduced by its lost current health and its exhaustion; the value every rule uses when a Combatant works or fights. |  |
| Base health | The highest current health a Combatant can have before any [Upgrade](domain-model.md#agency-and-agents) raises it, as a stored whole number. | Maximum health; full health |
| Effective max health | The highest current health a Combatant can have now: its base health, raised for a Serving Agent by what the Agency's Upgrades add. |  |
| Health lost | The harm a Combatant has taken and not yet recovered, from zero up to its effective max health; the stored value behind current health. |  |
| Current health | How much more harm a Combatant can take now: its effective max health less its health lost, from zero up to its effective max health under [Attribute ranges](#attribute-ranges); an Agent whose current health reaches zero is dead. | Hit points; hit-point; health, naming a Combatant value. Unqualified health remains valid in its general sense, e.g. Health recovery. |
| Exhaustion | How worn down a Combatant is, as a whole number of at least zero with no upper bound; beyond a free amount it lowers effective skill. The specifications that raise or lower it own accumulation and recovery. An Agent's exhaustion is its Exact exhaustion rounded up. | Fatigue |
| Exact exhaustion | The stored value behind an Agent's exhaustion: a [Decimal quantity](../foundation/numbers.md#glossary) of at least zero, so that rest can lower it by less than one point, under [Exhaustion and Exact exhaustion](#exhaustion-and-exact-exhaustion). |  |
| Base weapon damage | The typical current health a Combatant's hit removes, as a stored whole number, before any adjustment for the situation and before the random spread. | Weapon damage, naming the stored value |
| Effective weapon damage | A Combatant's base weapon damage as adjusted for the situation; the value around which a Combat rolls the damage outcome. For a Serving Agent it adds what the Agency's [Upgrades](domain-model.md#agency-and-agents) add to weapon damage. |  |
| Base armor | How much of the damage of hits a Combatant's armor absorbs in one Combat before its current health starts to fall, as a stored whole number of at least zero, before any adjustment for the situation. | Armor, naming the stored value |
| Effective armor | A Combatant's base armor as adjusted for the situation; the current armor it starts every Combat with. For a Serving Agent it adds what the Agency's Upgrades add to armor. |  |
| Current armor | How much more of the damage of hits a Combatant's armor can absorb in the current Combat, from zero up to its effective armor. It exists only while a Combat lasts, under [Combat-only properties](combat.md#combat-only-properties) in Combat, so every Combat starts with it full; losing it lowers neither current health nor effective skill. | Armor points |

## Assignments

The [Assignments](domain-model.md#agency-and-agents) that are neither an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) nor a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions), the one that places an Agent in a Mission, and the two groups that decide whether a move between Assignments takes transit.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Standby | The Assignment of an Agent with no work. |  |
| Contracting | The Assignment of an Agent earning money for the Agency. |  |
| Training | The Assignment of an Agent gaining base skill. |  |
| Recovery | The Assignment of an Agent regaining current health. The player can neither assign an Agent to it nor assign a Recovering Agent elsewhere. |  |
| Deployed | Sent on a Mission at a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) as a member of its [Current team](domain-model.md#leads-investigations-mission-sites-and-missions), and fighting there in the next Advance turn. An Agent becomes Deployed the moment the player deploys it, without transit. That Mission and its Mission site are Deployed for as long as the Agent is, under [Mission lifecycle](missions.md#mission-lifecycle) and [Mission site lifecycle](missions.md#mission-site-lifecycle) in Missions. |  |
| Base Assignment | Standby or Training, the Assignments an Agent carries out in the Agency's base. Moving between them takes no transit, and only an Agent on one can be deployed or given an Away Assignment. |  |
| Away Assignment | Contracting or an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions), the Assignments an Agent carries out away from base. Every move to or from them starts [In transit](domain-model.md#agency-and-agents), and an Agent on one can only be recalled to Standby. |  |
| Work Assignment | Contracting, Training, or an Investigation, the Assignments on which an Agent works. An Agent starts one only when it is Fit to start work. Contracting and Training raise its exhaustion, under [Work exhaustion](#work-exhaustion); an Investigation changes neither its exhaustion nor its health lost, under [Changes to attributes](#changes-to-attributes). |  |
| Fit to start work | Of an Agent: whose exhaustion is at most `exhaustion_work_start_max` and whose health lost is 0, so that it may start a Work Assignment, under [Start-work gate](#start-work-gate). |  |
| Working Agent | In an Advance turn: an Agent whose Assignment is a Work Assignment and that is [At assignment](domain-model.md#agency-and-agents) on it when the [Turn advancement step](domain-model.md#turn-advancement-steps) of its work begins, so that it works in that Advance turn, under [Transit rule](#transit-rule). An Agent In transit to a Work Assignment is not a Working Agent; it arrives only in the Previous turn transit arrivals step, after every step of work. |  |
| Forced return | The move of a Working Agent on Contracting or Training to Standby that an Advance turn makes when its work raises its exhaustion to `exhaustion_work_limit` or more, under [Forced return](#forced-return). |  |

## Agent statuses

Where an Agent stands toward its Assignment, whether it is in the Agency's base, and whether it still serves the Agency.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Recovering | The [Agent status](domain-model.md#agency-and-agents) of an Agent whose Assignment is Recovery and that has arrived there. |  |
| Killed | The Agent status of an Agent whose current health reached zero in a Combat. It is final. |  |
| Dismissed | The Agent status of an Agent the player dismissed. It is final. |  |
| Serving | Having the Agent status [At assignment](domain-model.md#agency-and-agents), [In transit](domain-model.md#agency-and-agents), or Recovering, i.e. still employed by the Agency. |  |
| Terminated | Having the Agent status Killed or Dismissed, i.e. no longer employed by the Agency. |  |
| In base | Of a Serving Agent: At assignment on a Base Assignment, or Recovering, whatever its current health and exhaustion. Every Serving Agent is either In base or Away. | At base |
| Away | Of a Serving Agent: not In base, i.e. In transit to any Assignment, Deployed, or At assignment on an Away Assignment, whatever its current health and exhaustion. | Out of base |

## Growth

How an Agent's base skill grows. Skill gain and Experience are separate ideas: an Agent gains skill from Training and from Experience, and it gains Experience only from the Missions it survives.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Skill gain | Base skill an Agent gains. It has exactly two sources: its training skill gain, under [Training growth](#training-growth), and its Experience, of which every point it gains gives it exactly one point of base skill, under [Mission growth](#mission-growth). |  |
| Training skill gain | The base skill an Agent on Training gains in one Advance turn whose Training gain outcome is "gains": `training_skill_gain_per_turn` plus what the acquired Upgrades add, under [Training growth](#training-growth). It is not Experience. |  |
| Experience | What an Agent learns from the Missions it survives, counted in whole points, which it gains as Mission experience under [Mission growth](#mission-growth). An Agent's Experience is the sum of every Mission experience it has gained. Every point of Experience an Agent gains is also a skill gain of exactly one point of base skill; this conversion is fixed by the rules and is no GDR value. | XP; experience points |
| Combat experience | The Experience one Agent earns in one Combat from the attacks it made and the attacks made on it, under [Combat experience](combat.md#combat-experience) in Combat. The Agent gains it only if it survives the Mission, under [Mission growth](#mission-growth). | Combat skill gain |
| Survival experience | The Experience an Agent earns for surviving a Mission, which falls with the number of Missions it has survived, under [Mission growth](#mission-growth). | Survival bonus; survival skill gain |
| Mission experience | The Experience an Agent gains from one Mission it survives: its combat experience in the Mission's Combat plus its survival experience, under [Mission growth](#mission-growth). | Mission skill gain |

# Agent GDRs

The Game Data Records (GDRs) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [GDRs](../content/gdrs.md) and the YAML files it names.

## AgentArchetype

An AgentArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of every Agent. The table below is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Agent. | [Player-visible information](#player-visible-information) |
| `base_skill` | The base skill of a newly created Agent. | [Agent creation](#agent-creation) |
| `base_health` | The base health of a newly created Agent, which starts with no health lost. | [Agent creation](#agent-creation) |
| `weapon` | A reference to the Weapon GDR a newly created Agent is equipped with. | [Agent creation](#agent-creation) |
| `armor` | A reference to the Armor GDR a newly created Agent is equipped with. | [Agent creation](#agent-creation) |

## AgentParameters

AgentParameters bundles the values that the Agent rules read, and the values that [Combat](combat.md) and [Missions](missions.md) read about exhaustion and about the Experience an Agent earns in a Combat. The table below is exhaustive apart from `id` and `type`.

| Property | Meaning | Read by |
| --- | --- | --- |
| `initial_roster_size` | How many Agents the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains. | [Initial roster](#initial-roster) |
| `exhaustion_incapacitation` | The exhaustion at or above which a Combatant stops fighting in a Combat. | [Combat](combat.md), which owns its meaning |
| `exhaustion_free_points` | The exhaustion up to which effective skill is not reduced. | [Effective skill](#effective-skill) |
| `skill_penalty_pct_per_exhaustion` | A [Percent value](../foundation/numbers.md#glossary): the percent of base skill lost for each point of exhaustion above `exhaustion_free_points`. | [Effective skill](#effective-skill) |
| `exhaustion_per_attack` | The exhaustion an attacking Combatant gains. | [Combat](combat.md), which owns its meaning |
| `exhaustion_per_defense` | The exhaustion a defending Combatant gains. | [Combat](combat.md), which owns its meaning |
| `exhaustion_per_mission` | The exhaustion every surviving Agent of a Mission gains when the Mission is resolved. | [Missions](missions.md), which owns its meaning |
| `exhaustion_per_pct_killed` | The further exhaustion a surviving Agent of a Mission gains for each percent of its team that was Killed. | [Missions](missions.md), which owns its meaning |
| `exhaustion_per_contracting_turn` | The exhaustion an Agent gains in each Advance turn in which it works on Contracting. | [Work exhaustion](#work-exhaustion) |
| `exhaustion_per_training_turn` | The exhaustion an Agent gains in each Advance turn in which it works on Training. | [Work exhaustion](#work-exhaustion) |
| `exhaustion_work_start_max` | The highest exhaustion at which an Agent can be Fit to start work. | [Start-work gate](#start-work-gate) |
| `exhaustion_work_limit` | The exhaustion at or above which Contracting or Training makes an Agent return to Standby. | [Forced return](#forced-return) |
| `training_skill_gain_per_turn` | The base skill an Agent on Training gains in one Advance turn when its Training gain outcome is "gains", before any [Upgrade](domain-model.md#agency-and-agents). It is a [Decimal quantity](../foundation/numbers.md#glossary). | [Training growth](#training-growth) |
| `experience_per_attack_hit` | The combat experience an attacking Agent earns from each of its attacks that hits. | [Combat](combat.md), which owns its meaning |
| `experience_per_attack_miss` | The combat experience an attacking Agent earns from each of its attacks that misses. | [Combat](combat.md), which owns its meaning |
| `experience_per_defense_hit` | The combat experience a defending Agent earns from each attack on it that hits. | [Combat](combat.md), which owns its meaning |
| `experience_per_defense_miss` | The combat experience a defending Agent earns from each attack on it that misses. | [Combat](combat.md), which owns its meaning |
| `experience_per_mission_survived` | The survival experience of an Agent's first, second, and each later Mission survived, as a list whose last entry applies to every Mission beyond the list. | [Mission growth](#mission-growth) |

## Weapon properties this document reads

A [Weapon](combat.md#weapon) GDR describes the base weapon damage of the Combatants equipped with it. The Agent rules read only its `base_weapon_damage` property: the base weapon damage of a newly created Agent equipped with that Weapon, under [Agent creation](#agent-creation).

## Armor properties this document reads

An [Armor](combat.md#armor) GDR describes the base armor of the Combatants equipped with it. The Agent rules read only its `base_armor` property: the base armor of a newly created Agent equipped with that Armor, under [Agent creation](#agent-creation).

## Agent GDR validation

The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for AgentArchetype and AgentParameters. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **One AgentArchetype:** The Game build supplies exactly one AgentArchetype. Every Agent has it as its Archetype, so no rule selects among AgentArchetypes.
2. **One AgentParameters:** The Game build supplies exactly one AgentParameters GDR.
3. **Exact properties:** The AgentArchetype and the AgentParameters GDR each have exactly the properties their table above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
4. **Archetype values are valid:** The AgentArchetype's `base_skill` is a whole number of at least 0, its `base_health` is a whole number of at least 1, its `weapon` references a Weapon GDR the Game build supplies, and its `armor` references an Armor GDR the Game build supplies.
5. **Parameters are valid:** `training_skill_gain_per_turn` is a number of at least 0 written with at most two digits after the decimal point, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers. `experience_per_mission_survived` is a list of one or more entries, each a whole number of at least 0. Every other property of AgentParameters is a whole number of at least 0.
6. **Exhaustion thresholds are ordered:** `exhaustion_work_start_max` is less than `exhaustion_work_limit`, and `exhaustion_work_limit` is at most `exhaustion_incapacitation`. An Agent that is Fit to start work therefore starts below the exhaustion that ends its work, and work ends no later than at the exhaustion at which the Agent would stop fighting in a Combat.

[Combat GDR validation](combat.md#combat-gdr-validation) adds further rules, e.g. that the Weapon `base_weapon_damage` is a whole number of at least 1 and the Armor `base_armor` a whole number of at least 0. These rules guarantee that every newly created Agent satisfies [Attribute ranges](#attribute-ranges) and that the effective skill formula never divides by zero.

# Agent properties

An Agent is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is the AgentArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) and [State](../foundation/core-concepts.md#campaign-instances) have exactly the following properties. This table is exhaustive.

| Property | Part | Value | Classification and range |
| --- | --- | --- | --- |
| Agency | Constants | An Immutable reference to the Agency that employs the Agent. | [Authoritative value](../foundation/core-concepts.md#value-classification). Always the Campaign's one Agency. |
| Turn hired | Constants | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) in which the Agent was created. | Authoritative value. A whole number of at least 1. |
| Base skill | State | The Agent's base skill. | Authoritative value. A Decimal quantity of at least 0, with no upper bound, under [Decimal quantities](../foundation/numbers.md#decimal-quantities). |
| Experience | State | The Agent's Experience. | Authoritative value. A whole number of at least 0, with no upper bound. Only [Mission growth](#mission-growth) changes it. |
| Health lost | State | The Agent's health lost. | Authoritative value. A Decimal quantity under [Attribute ranges](#attribute-ranges). |
| Base health | State | The Agent's base health. | Authoritative value. A whole number of at least 1. No rule in scope changes it after creation. |
| Final max health | State | Present exactly when the Agent is Terminated: the effective max health the Agent had when it became Terminated. | Authoritative value. A whole number of at least 1, under [Service record](#service-record). |
| Exact exhaustion | State | The Agent's Exact exhaustion. | Authoritative value. A Decimal quantity of at least 0, with no upper bound, under [Exhaustion and Exact exhaustion](#exhaustion-and-exact-exhaustion). |
| Weapon | State | A reference to the Weapon GDR the Agent is equipped with. | Authoritative value. Always resolves to a Weapon GDR the Game build supplies. No rule in scope changes it after creation. |
| Base weapon damage | State | The Agent's base weapon damage. | Authoritative value. A whole number of at least 1. No rule in scope changes it after creation. |
| Final weapon damage | State | Present exactly when the Agent is Terminated: the effective weapon damage the Agent had when it became Terminated. | Authoritative value. A whole number of at least 1, under [Service record](#service-record). |
| Armor | State | A reference to the Armor GDR the Agent is equipped with. | Authoritative value. Always resolves to an Armor GDR the Game build supplies. No rule in scope changes it after creation. |
| Base armor | State | The Agent's base armor. | Authoritative value. A whole number of at least 0. No rule in scope changes it after creation. |
| Final armor | State | Present exactly when the Agent is Terminated: the effective armor the Agent had when it became Terminated. | Authoritative value. A whole number of at least 0, under [Service record](#service-record). |
| Assignment | State | Present exactly when the Agent is Serving: one of Standby, Contracting, Training, Recovery, an Investigation with a Mutable reference to it, or Deployed with a Mutable reference to the Mission. | Authoritative value, under [Assignment and Agent status](#assignment-and-agent-status). |
| Agent status | State | At assignment, In transit, Recovering, Killed, or Dismissed, under [Agent status](#agent-status). | Authoritative value, under [Agent status](#agent-status) and [Assignment and Agent status](#assignment-and-agent-status). |
| [Participation history](domain-model.md#agency-and-agents) | State | The Investigations and Missions the Agent took part in and has left. | Authoritative value, under [Participation history records](#participation-history-records). |
| Enemies killed | State | The number of [Enemies](domain-model.md#combat) the Agent's attacks have made dead. | Authoritative value. A whole number of at least 0, under [Service record](#service-record). |
| Turn terminated | State | Present exactly when the Agent is Terminated: the turn number of the Turn in which it became Terminated. | Authoritative value. A whole number of at least its Turn hired, under [Service record](#service-record). |
| Killed by | State | Present exactly when the Agent is Killed: an Immutable reference to the Enemy whose attack made it dead, and an Immutable reference to that Enemy's [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions). | Authoritative value, under [Service record](#service-record). |

Base skill, health lost, base health, exhaustion, Weapon, base weapon damage, Armor, and base armor are the properties the [Combatant Role Type](#combatant-role-type) requires; Weapon and base weapon damage together are the equipped weapon values, and Armor and base armor the equipped armor values. An Agent holds its exhaustion as its Exact exhaustion. An Agent also has eight [Derived values](../foundation/core-concepts.md#value-classification), which are never stored: its exhaustion, under [Exhaustion and Exact exhaustion](#exhaustion-and-exact-exhaustion); its effective max health and its current health, under [Effective max health and current health](#effective-max-health-and-current-health); its effective skill, under [Effective skill](#effective-skill); its effective weapon damage, under [Effective weapon damage](#effective-weapon-damage); its effective armor, under [Effective armor](#effective-armor); whether it can take orders, under [Agents that can take orders](#agents-that-can-take-orders); and whether it is Fit to start work, under [Start-work gate](#start-work-gate). An Agent has no [Turn series](../foundation/world-history.md#glossary).

**Retention:** An Agent keeps every property above for the whole Campaign, whatever its Agent status, so that every reference to it resolves, e.g. from a [Combat report](domain-model.md#combat) or a Participation history. An Agent becomes [Retired](../foundation/world-history.md#glossary) when it becomes Terminated, and is kept in the [Retired world state](../foundation/campaign-state.md#glossary) with its final values, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Agent is ever removed.

## Participation history records

Whenever an Agent stops belonging to the Current team of an Investigation or of a Mission, for any reason, that Investigation or Mission is added to the Agent's Participation history, unless it is already there. E.g., the reason may be that the player assigns the Agent elsewhere, that the Investigation completes, or that the Mission's Combat is fought. Nothing is ever removed from a Participation history, and recording it neither assigns nor reserves the Agent, under [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain Model.

## Service record

An Agent that leaves the Agency keeps a record of how its service ended and what it achieved, so that the player can look back on it after the [Combat reports](domain-model.md#combat) that told the story are no longer kept in full.

Enemies killed, Turn terminated, Killed by, Final max health, Final weapon damage, and Final armor change only as follows:

- **Enemies killed** is 0 when the Agent is created, under [Agent creation](#agent-creation), and rises by 1 each time an attack the Agent makes leaves its defender dead, under [Killed and Incapacitated](combat.md#killed-and-incapacitated) in Combat. No rule lowers it.
- **Turn terminated** is set when the Agent becomes Terminated, under [Agent status](#agent-status): for a Killed Agent, the turn number of the Turn that the Advance turn fighting its Combat ends; for a Dismissed Agent, the turn number of the Turn in which `dismissAgents` dismissed it.
- **Killed by** is set when the Agent becomes Killed, under [Killed and Incapacitated](combat.md#killed-and-incapacitated) in Combat, to the attacking Enemy and that Enemy's Mission site.
- **Final max health** is set when the Agent becomes Terminated, to the effective max health it had as a Serving Agent in the [World state](../foundation/engine-contract.md#player-actions-and-turns) before it became Terminated, under [Effective max health and current health](#effective-max-health-and-current-health). Its health lost is unchanged, so a Killed Agent keeps current health 0 and a Dismissed Agent keeps the current health it had.
- **Final weapon damage** is set when the Agent becomes Terminated, to the effective weapon damage it had as a Serving Agent in the [World state](../foundation/engine-contract.md#player-actions-and-turns) before it became Terminated, under [Effective weapon damage](#effective-weapon-damage). An Upgrade bought later therefore does not change what the record shows.
- **Final armor** is set when the Agent becomes Terminated, to the effective armor it had as a Serving Agent in the World state before it became Terminated, under [Effective armor](#effective-armor), and is never changed by an Upgrade bought later. It is the armor the Agent was equipped with, not the current armor it had left when a Combat ended, which no World state holds.

Once set, Turn terminated, Killed by, Final max health, Final weapon damage, and Final armor never change, and Enemies killed never changes after the Agent is Terminated, because a Terminated Agent fights no Combat. E.g., an Agent hired in Turn 3 that makes two Enemies dead in the Combat of the Advance turn ending Turn 6 and is made dead by enemy-7 at Mission site s4 in the Combat of the Advance turn ending Turn 9 ends with Enemies killed 2, Turn terminated 9, and Killed by enemy-7 at s4.

# Agent status

An Agent has exactly one Agent status: At assignment, In transit, Recovering, Killed, or Dismissed. The set is exhaustive. An Agent is Serving exactly when its Agent status is At assignment, In transit, or Recovering, and Terminated exactly when it is Killed or Dismissed. Every Agent is Serving when it is created, under [Agent creation](#agent-creation).

A Serving Agent is In base exactly when it is At assignment on Standby or Training, or Recovering, and Away otherwise, i.e. when it is In transit, whatever its Assignment, Deployed, or At assignment on Contracting or an Investigation. Neither depends on its current health or its exhaustion, and a Terminated Agent is neither. Whether an Agent is In base or Away is a Derived value, never stored.

While an Agent is Serving, its Agent status moves between At assignment, In transit, and Recovering only as its Assignment changes and as it arrives, under [Assignment changes](#assignment-changes) and [Transit rule](#transit-rule). It becomes Terminated only by the following transitions:

| Source state | Target state | Trigger | Condition |
| --- | --- | --- | --- |
| Serving | Killed | The Agent's current health reaches zero in a Combat, under [Killed and Incapacitated](combat.md#killed-and-incapacitated). | The Agent is Deployed. |
| Serving | Dismissed | The `dismissAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) dismisses the Agent. | The preconditions under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents) hold for the Agent. |

Every transition not listed is impossible; e.g., a Killed Agent never becomes Serving again, and a Dismissed Agent cannot be Killed. Killed and Dismissed are final.

The following invariants hold in every [World state](../foundation/engine-contract.md#player-actions-and-turns):

- A Serving Agent has exactly one Assignment. A Terminated Agent has none and belongs to no Current team. Killed and Dismissed are Agent statuses, not Assignments.
- An Agent is Recovering exactly when its Assignment is Recovery and it is not In transit. A Deployed Agent is At assignment.
- Within [Attribute ranges](#attribute-ranges), a Serving Agent has positive current health, a Killed Agent has zero current health, and a Dismissed Agent has positive current health.
- A Serving Agent whose Assignment is not Recovery has current health equal to its effective max health: only a Combat lowers current health, and under [Assignment changes](#assignment-changes) a survivor below its effective max health goes to Recovery and leaves it only when its current health reaches its effective max health; e.g., current health never lowers the effective skill of an Investigation member.

When an Agent becomes Killed or Dismissed, its Assignment is removed in the same Player action, the Investigation or Mission it belonged to, if any, is recorded under [Participation history records](#participation-history-records), and its Turn terminated, and for a Killed Agent its Killed by, are set under [Service record](#service-record).

# Attributes and effectiveness

An Agent's attributes say how capable it is and how worn down it is, and together they decide how well it works and fights. Agents share these attributes with Enemies, so one set of rules covers every Combatant.

## Combatant Role Type

The [Combatant Role Type](domain-model.md#combat) is a [Role Type](../foundation/campaign-instances.md#glossary) under [Role Types](../foundation/campaign-instances.md#role-types) in Campaign Instances. It states what a Campaign instance [Type](../foundation/core-concepts.md#data-modeling) must have for its Campaign instances to be Combatants, and what a Combatant gains while a Combat lasts.

- **Adoption condition:** a Campaign instance Type can adopt the Combatant Role Type if the State of its Campaign instances has all of the following properties: base skill, health lost, base health, exhaustion, equipped weapon values, and equipped armor values. This set is exhaustive. A Type may hold its exhaustion as a stored value from which the exhaustion derives, as Agent does with Exact exhaustion.
- **Adopters:** Agent and Enemy adopt the Combatant Role Type. This set is exhaustive.
- **Gained properties:** every Combatant taking part in a Combat gains properties that mean something only while that Combat lasts, e.g. whether it is [Incapacitated](combat.md#glossary). It gains them when the Combat begins and loses them when the Combat ends. The exhaustive set of gained properties is under [Combat-only properties](combat.md#combat-only-properties) in Combat.

The properties named by the adoption condition persist outside a Combat; e.g., an Agent has current health and exhaustion between Combats. What outlasts a Combat is its [Combat report](domain-model.md#combat) and every change the Combat made to those properties, e.g. lost current health.

The Combatant Role Type is not a Campaign instance Type, so a Combatant is never a Campaign instance separate from its Agent or Enemy. If it were, every Agent would be two Campaign instances with two [Instance IDs](../foundation/campaign-instances.md#glossary), and current health would belong to the second one instead of to the Agent. A Combat instead changes the participating Agent and Enemy Campaign instances themselves: the Agent changed by a Combat is the same Agent that returns to the Agency.

## Attribute ranges

In every World state, every Combatant, i.e. every Agent and every Enemy, satisfies these ranges:

- Base skill is at least 0. An Agent's is a [Decimal quantity](../foundation/numbers.md#glossary); an Enemy's is a whole number.
- Base health is a whole number of at least 1.
- Exhaustion is a whole number of at least 0, with no upper bound. An Agent's Exact exhaustion is a Decimal quantity of at least 0, with no upper bound.
- Effective max health is a whole number of at least base health.
- Health lost is from 0 to effective max health, both included. An Agent's is a Decimal quantity; an Enemy's is a whole number.
- Current health is therefore from 0 to effective max health, both included. An Agent's is a Decimal quantity; an Enemy's is a whole number.
- Base armor is a whole number of at least 0, and effective armor a whole number of at least base armor.

Each comparison of these values is exact, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers. E.g., an Agent with current health 29.99 of 30 has not reached its effective max health, and one with current health 0.67 is alive.

Any rule of any specification that would lower exhaustion below 0 lowers it to exactly 0 instead; no rule clamps exhaustion from above. Any rule that would lower current health below 0 lowers it to exactly 0 instead, and any rule that would raise current health above effective max health raises it to exactly effective max health instead. The rule that changes the value applies these clamps as part of its own change. E.g., a Combatant with exhaustion 99 that gains 3 exhaustion has exhaustion 102, and an Agent with exhaustion 3 that recovers 5 has exhaustion 0.

**Informative rationale:** Exhaustion above `exhaustion_incapacitation` has no further effect in a Combat, where the Combatant has already stopped fighting, but it lengthens the rest the Agent needs before it is Fit to start work again.

## Exhaustion and Exact exhaustion

An Agent stores its Exact exhaustion, and its exhaustion is the following Derived value:

```text
exhaustion = round up( Exact exhaustion )
```

Exact exhaustion is a Decimal quantity of at least 0, and [Round up](../foundation/numbers.md#glossary) is applied once, so exhaustion is a whole number of at least 0 and equals Exact exhaustion whenever that is whole. The following statements are complete.

1. **Every rule reads exhaustion:** Every rule of every specification that reads an Agent's exhaustion reads this whole number, e.g. [Effective skill](#effective-skill), the [Start-work gate](#start-work-gate), [Forced return](#forced-return), and the incapacitation condition of [Combat](combat.md). Whatever is shown to the player as an Agent's exhaustion is this whole number too, except where Exact exhaustion itself is shown, to tell how near the next whole number it is. Only [Exhaustion recovery](agent-recovery.md#exhaustion-recovery) in Agent Recovery reads Exact exhaustion.
2. **A rule that changes exhaustion changes Exact exhaustion:** A rule that raises an Agent's exhaustion by a whole number of points raises its Exact exhaustion by that number, so its exhaustion rises by exactly that number. A rule that sets an Agent's exhaustion sets its Exact exhaustion to the same value. Exhaustion recovery lowers Exact exhaustion by an amount that need not be whole.
3. **Clamp:** The clamp of exhaustion at 0 above applies to Exact exhaustion.

An [Enemy](domain-model.md#combat) stores its exhaustion itself, as a whole number, because no rule lowers it.

E.g., with a test exhaustion recovery of 1.6, an Agent on Standby with Exact exhaustion 5 has exhaustion 5; after one Agent recovery step, under [Exhaustion recovery](agent-recovery.md#exhaustion-recovery) in Agent Recovery, its Exact exhaustion is 3.40 and its exhaustion 4; and after the next it is 1.80 and its exhaustion 2. An attack that then raises its exhaustion by 1 gives Exact exhaustion 2.80 and exhaustion 3.

**Informative rationale:** Rest that lowers exhaustion by less than a whole point in each Turn lets an Upgrade improve it in small steps. Rounding up means an Agent counts as rested only once the whole point is gone, and keeps every threshold and every formula that reads exhaustion in whole numbers.

## Effective max health and current health

A Combatant's health is kept as what it has lost, so that raising the most it can have never wounds it.

A Combatant's effective max health and its current health are Derived values. The following table states the effective max health of every Combatant, and is exhaustive.

| Combatant | Effective max health |
| --- | --- |
| An Enemy | Its base health. |
| A Serving Agent | Its base health plus what the Agency's [Upgrades](domain-model.md#agency-and-agents) add to max health, under [Max health Upgrade](economy-and-upgrades.md#max-health-upgrade) in Economy and Upgrades. |
| A Terminated Agent | Its Final max health, under [Service record](#service-record). |

Current health is what is left of it:

```text
current health = effective max health − health lost
```

Inputs: effective max health is a whole number of at least 1, and health lost is from 0 to effective max health, a Decimal quantity for an Agent and a whole number for an Enemy, under [Attribute ranges](#attribute-ranges). No rounding occurs. The result is from 0 to effective max health.

Health lost is the stored value, and it changes only through current health: a rule of any specification that lowers a Combatant's current health by an amount raises its health lost by that amount, and a rule that raises its current health by an amount lowers its health lost by that amount. No rule changes current health in any other way.

Buying an Upgrade that adds to max health therefore raises the effective max health and the current health of every Serving Agent by the same amount at once, and rewrites no value of any Agent. E.g., with an Upgrade that adds 1, an Agent with current health 30 of 30 has 31 of 31, and an Agent that has lost 8 goes from 22 of 30 to 23 of 31.

## Effective skill

A Combatant's effective skill is a Derived value computed by this formula. It is shared by Agents and Enemies through the [Combatant Role Type](#combatant-role-type), and every rule that uses a Combatant's capability, e.g. [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) or a Combat's hit chance, reads effective skill rather than base skill.

```text
penalty factor  = max(0, 100 − p × max(0, exhaustion − f))
effective skill = round down( base skill × current health × penalty factor / (effective max health × 100) )
```

Inputs:

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| base skill | The Combatant's base skill. | Skill points; at least 0, a Decimal quantity for an Agent. |
| current health | The Combatant's current health. | Health points; from 0 to effective max health, a Decimal quantity for an Agent. |
| effective max health | The Combatant's effective max health. | Health points; a whole number of at least 1. |
| exhaustion | The Combatant's exhaustion, for an Agent under [Exhaustion and Exact exhaustion](#exhaustion-and-exact-exhaustion). | Exhaustion points; a whole number of at least 0. |
| p | `skill_penalty_pct_per_exhaustion` of AgentParameters. | Percent value per exhaustion point; a whole number of at least 0. |
| f | `exhaustion_free_points` of AgentParameters. | Exhaustion points; a whole number of at least 0. |

Evaluation and rounding: the formula is evaluated exactly, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, and is rounded exactly once, with [Round down](../foundation/numbers.md#glossary) under [Rounding](../foundation/numbers.md#rounding), at the end. The penalty factor is a whole number, so it needs no rounding; no other intermediate result is rounded. The divisor is never zero, because effective max health is at least 1.

Penalty clamp: when `p × max(0, exhaustion − f)` exceeds 100, the penalty factor is 0, not negative, and the effective skill is 0. With an exhaustion at most `f`, the penalty factor is exactly 100 and exhaustion has no effect.

Range: the result is a whole number from 0 to base skill, both included, because current health divided by effective max health and the penalty factor divided by 100 each lie from 0 to 1. A Combatant whose current health equals its effective max health and whose exhaustion is at most `f` has an effective skill equal to its base skill rounded down, e.g. 102 for a base skill of 102.75. A Combatant with zero current health, e.g. a Killed Agent, has an effective skill of 0.

Effective skill is never stored. Whenever a rule reads it, it is computed from the Combatant's values at that moment, so it follows every change of base skill, current health, or exhaustion at once, under [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract. Which moment's values a [Turn advancement step](turn-advancement.md#glossary) reads is stated under [Turn advancement steps](turn-advancement.md#turn-advancement-steps).

## Effective weapon damage

A Combatant's effective weapon damage is a Derived value. It is shared by Agents and Enemies through the [Combatant Role Type](#combatant-role-type), and it is the value around which a Combat rolls the damage outcome, under [Damage outcome](combat.md#damage-outcome) in Combat. It is kept apart from base weapon damage so that a rule can adjust weapon damage without changing the stored value, as effective skill does for base skill. The following table states it for every Combatant, and is exhaustive.

| Combatant | Effective weapon damage |
| --- | --- |
| An Enemy | Its base weapon damage. |
| A Serving Agent | Its base weapon damage plus what the Agency's [Upgrades](domain-model.md#agency-and-agents) add to weapon damage, under [Weapon damage Upgrade](economy-and-upgrades.md#weapon-damage-upgrade) in Economy and Upgrades. |
| A Terminated Agent | Its Final weapon damage, under [Service record](#service-record). |

The effective weapon damage of an Enemy and of a Serving Agent is never stored, and it follows every change of its inputs at once: buying an Upgrade that adds to weapon damage raises the effective weapon damage of every Serving Agent in the same World state, and rewrites no value of any Agent. The result is a whole number of at least 1.

## Effective armor

A Combatant's armor absorbs the damage of hits before its current health does, and it is whole again for every Combat, so it protects an Agent without the lasting wounds that lower its effective skill.

A Combatant's effective armor is a Derived value, shared by Agents and Enemies through the [Combatant Role Type](#combatant-role-type). It is the current armor the Combatant starts every Combat with, under [Combat-only properties](combat.md#combat-only-properties) in Combat. The following table states it for every Combatant, and is exhaustive.

| Combatant | Effective armor |
| --- | --- |
| An Enemy | Its base armor. |
| A Serving Agent | Its base armor plus what the Agency's [Upgrades](domain-model.md#agency-and-agents) add to armor, under [Armor Upgrade](economy-and-upgrades.md#armor-upgrade) in Economy and Upgrades. |
| A Terminated Agent | Its Final armor, under [Service record](#service-record). |

The effective armor of an Enemy and of a Serving Agent is never stored, and it follows every change of its inputs at once: buying an Upgrade that adds to armor raises the effective armor of every Serving Agent in the same World state, and rewrites no value of any Agent. The result is a whole number of at least 0. No rule reads effective armor outside a Combat except to show it; in particular, [Effective skill](#effective-skill) does not read it.

## Changes to attributes

An Agent's attributes change only through a few named rules, so the cause of every change to them can be traced.

The following table is the exhaustive list of rules that change an Agent's attributes after its creation. A rule not listed here changes none of them.

| Value | Raised by | Lowered by |
| --- | --- | --- |
| Base skill | [Training growth](#training-growth); [Mission growth](#mission-growth) | No rule |
| Health lost | [Combat](combat.md), in a Combat, which lowers current health | [Agent Recovery](agent-recovery.md), which raises current health |
| Base health | No rule | No rule |
| Exhaustion | [Combat](combat.md), in a Combat, by `exhaustion_per_attack` and `exhaustion_per_defense`; [Mission exhaustion](missions.md#mission-exhaustion) in Missions; [Work exhaustion](#work-exhaustion) | [Agent Recovery](agent-recovery.md) |
| Base weapon damage | No rule | No rule |
| Base armor | No rule | No rule |

A Combat lowers only the current armor of its Combatants, which exists only while the Combat lasts, so it changes no base armor and no effective armor, under [Effects of an attack](combat.md#effects-of-an-attack) in Combat.

An Investigation changes neither an Agent's exhaustion nor its health lost, and Contracting and Training change only its exhaustion. Standby, Recovery, and being In transit leave exhaustion unchanged except through [Agent Recovery](agent-recovery.md), which lowers it on Standby and Recovery. Each specification named in the table applies the clamps under [Attribute ranges](#attribute-ranges).

# Modifiable values

No [Upgrade](economy-and-upgrades.md#glossary) changes a stored Agent value. An Upgrade improves the Derived values of every Serving Agent instead: the [Max health Upgrade](economy-and-upgrades.md#max-health-upgrade) raises effective max health, and with it current health, under [Effective max health and current health](#effective-max-health-and-current-health), the [Weapon damage Upgrade](economy-and-upgrades.md#weapon-damage-upgrade) raises effective weapon damage, under [Effective weapon damage](#effective-weapon-damage), and the [Armor Upgrade](economy-and-upgrades.md#armor-upgrade) raises effective armor, under [Effective armor](#effective-armor). No [Upgrade](domain-model.md#agency-and-agents) changes base skill, health lost, base health, exhaustion, Weapon, base weapon damage, Armor, or base armor, and no Upgrade bought after an Agent became Terminated changes any value of that Agent, e.g. its Final max health, its Final weapon damage, and its Final armor. An Upgrade under [Rate Upgrades](economy-and-upgrades.md#rate-upgrades) changes no Agent value at once: it raises the training skill gain that [Training growth](#training-growth) reads, or a rate that [Agent Recovery](agent-recovery.md) reads.

# Assignments and transit

An Agent's Assignment says what it is doing, and transit is the price of changing it. These rules decide which Agents accept new Assignments and when an Agent starts working on a new Assignment.

## Assignment and Agent status

The Assignment of a Serving Agent is exactly one of the following, and this list is exhaustive: Standby; Contracting; Training; Recovery; an Investigation, with a reference to that Investigation; and Deployed, with a reference to the Mission the Agent is Deployed on. The Agent status of a Serving Agent says how it stands toward its Assignment: At assignment while carrying it out, In transit while still travelling to it, and Recovering when its Assignment is Recovery and it has arrived. An Agent In transit keeps the Assignment it is travelling to; transit is not a second Assignment.

Recovery is an Assignment like the others, except that the player can neither assign an Agent to it nor assign a Recovering Agent elsewhere: only the rules under [Assignment changes](#assignment-changes) move an Agent onto or off Recovery. An Agent belongs to the Current team of an Investigation or of a Mission exactly as [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain Model states, including while In transit.

A Deployed Agent is always At assignment, because deployment has no transit under [Transit rule](#transit-rule). In every World state, the Mission that a Deployed Agent's Assignment references is Deployed, and its Current team contains that Agent. A Mission is Deployed, under [Mission lifecycle](missions.md#mission-lifecycle), exactly when the Agents of its Current team are Deployed on it.

## Agents that can take orders

An Agent can take orders exactly when all of the following hold:

1. It is Serving.
2. Its Agent status is At assignment.
3. Its Assignment is Standby, Contracting, Training, or an Investigation.

A Recovering Agent, a Deployed Agent, and every Agent In transit, whatever its Assignment, therefore cannot take orders, and neither can a Terminated Agent. An Agent In transit must arrive first, under [Transit rule](#transit-rule). Whether an Agent can take orders is a Derived value. Every Player action that changes an Agent's Assignment requires that the Agent can take orders: `assignAgents` under [Assigning Agents](#assigning-agents), and the Player actions of [Investigations](investigations.md) and [Missions](missions.md) that assign Agents to an Investigation or deploy them to a Mission site.

Where an Agent that can take orders may go depends on where it is:

- **From base:** an Agent on a [Base Assignment](#assignments) can be given any Assignment the player can give: the other Base Assignment, Contracting, an Investigation, or Deployed.
- **From away:** an Agent on an [Away Assignment](#assignments) can only be recalled, i.e. assigned to Standby. It cannot be assigned to Training, Contracting, or an Investigation, or deployed, until it is [In base](#agent-statuses).

A new Work Assignment also requires that the Agent is Fit to start work, under [Start-work gate](#start-work-gate). `dismissAgents`, which ends the Assignment instead of changing it, has its own precondition, under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents).

## Start-work gate

An Agent worn down by work or by a Combat must rest, and heal, before it takes on new work, so that tiredness builds up only as far as the player lets it.

An Agent is Fit to start work exactly when both of the following hold:

1. Its exhaustion is at most `exhaustion_work_start_max`.
2. Its health lost is 0, i.e. its current health equals its effective max health.

Whether an Agent is Fit to start work is a Derived value, never stored. Every Player action that gives an Agent a Work Assignment it does not already have requires that the Agent is Fit to start work: `assignAgents` with `Contracting` or `Training` under [Assigning Agents](#assigning-agents), and `startInvestigation` and `assignAgentsToInvestigation` under [Investigations](investigations.md). No other Player action requires it; e.g., an Agent of any exhaustion can be assigned to Standby and can be deployed, under [Deploying Agents](missions.md#deploying-agents) in Missions.

The gate applies only when the work starts. An Agent already on a Work Assignment keeps working whatever its exhaustion, until it is assigned elsewhere, its Investigation ends, or its [Forced return](#forced-return). E.g., with the GDR values, an Agent on Contracting with exhaustion 45 keeps earning and can be recalled to Standby, and once In base cannot be assigned to Contracting, Training, or an Investigation until its exhaustion falls to 30. It can be deployed at once, under [Deploying Agents](missions.md#deploying-agents) in Missions.

Being Fit to start work says nothing about how well the Agent would fight. No rule relates `exhaustion_work_start_max` to `exhaustion_free_points`, and a Game build may set the former above the latter, so an Agent that is Fit to start work may have its effective skill lowered by exhaustion, and may even meet the incapacitation condition, under [Incapacitation condition](combat.md#incapacitation-condition) in Combat. E.g., with `exhaustion_free_points` 30, `skill_penalty_pct_per_exhaustion` 3, and `exhaustion_work_start_max` 60, an Agent with exhaustion 60 and no health lost is Fit to start work, and its penalty factor of 10 leaves it an effective skill of at most 10% of its base skill, at or below an `incapacitation_skill_fraction` of 0.1. [Deploying Agents](missions.md#deploying-agents) in Missions rejects such an Agent.

## Assignment changes

An Agent changes what it is doing either because the player assigns it or because an Advance turn moves it, e.g. when its Investigation completes. Each such change has one trigger and one owner, so no Agent changes what it is doing without a stated cause.

The following table lists every allowed change of a Serving Agent's Assignment or Agent status, with its trigger and the owner of the trigger. An Assignment of "Investigation" in the table means an Investigation with its reference.

| From | To | Trigger and who triggers it | Owner of the trigger and its conditions |
| --- | --- | --- | --- |
| Standby or Training; At assignment | The other of Standby and Training; At assignment | The player assigns it, through the `assignAgents` Player action. | This document, under [Assigning Agents](#assigning-agents) |
| Standby or Training; At assignment | Contracting; In transit | The player assigns it, through the `assignAgents` Player action. | This document, under [Assigning Agents](#assigning-agents) |
| Contracting or an Investigation; At assignment | Standby; In transit | The player recalls it, through the `assignAgents` Player action. | This document, under [Assigning Agents](#assigning-agents) |
| Standby or Training; At assignment | An Investigation; In transit | The player starts an Investigation with it or adds it to one, through a Player action of Investigations. | [Investigations](investigations.md) |
| Standby or Training; At assignment | Deployed on a Mission; At assignment | The player deploys it, through the `deployAgents` Player action. | [Missions](missions.md) |
| Any Assignment other than Recovery; In transit | The same Assignment; At assignment | Advance turn, in the Previous turn transit arrivals step. | This document, under [Transit rule](#transit-rule) |
| Recovery; In transit | Recovery; Recovering | Advance turn, in the Previous turn transit arrivals step. | This document, under [Transit rule](#transit-rule) |
| An Investigation; At assignment or In transit | Standby; In transit | Advance turn: the Investigation completes in the [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) step. From In transit, this is a new transit, which does not arrive in the same Advance turn. | [Investigations](investigations.md) |
| An Investigation; At assignment or In transit | Standby; In transit | Advance turn: the Investigation is interrupted at the end of the Mission resolution step, because its [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) is not available. From In transit, this is a new transit, which does not arrive in the same Advance turn. | [Investigations](investigations.md), under [Lead no longer available](investigations.md#lead-no-longer-available) |
| Contracting; At assignment | Standby; In transit | Advance turn: the Agent's work raises its exhaustion to `exhaustion_work_limit` or more, in the Agency income step. | This document, under [Forced return](#forced-return) |
| Training; At assignment | Standby; At assignment | Advance turn: the Agent's work raises its exhaustion to `exhaustion_work_limit` or more, in the Training step. | This document, under [Forced return](#forced-return) |
| Deployed; At assignment | Recovery; In transit | Advance turn: the Agent survives the Combat in the Mission resolution step with current health below its effective max health. | [Missions](missions.md) |
| Deployed; At assignment | Standby; In transit | Advance turn: the Agent survives the Combat in the Mission resolution step with current health equal to its effective max health. | [Missions](missions.md) |
| Recovery; Recovering | Standby; At assignment | Advance turn: the Agent's current health reaches its effective max health in the Agent recovery step. | [Agent Recovery](agent-recovery.md) |

Every change not listed is impossible; e.g., an Agent on Recovery cannot be assigned to Contracting, a Deployed Agent cannot be recalled, an Agent In transit cannot take orders, so it can be neither assigned anywhere nor deployed, and changes Assignment only when the Investigation it travels to completes or is interrupted, and an Agent on Contracting or an Investigation cannot be assigned to Training, Contracting, or an Investigation, or deployed. Recalling an Agent is assigning it from Contracting or an Investigation to Standby, which starts In transit; the Agent can be given new work only after it arrives.

The following diagram draws the table. Each box is one pair of Assignment and Agent status; Standby and Training form the base, and Contracting and Investigations are away. A Forced return follows the same arrow as recalling the Agent to Standby, or as moving it from Training to Standby.

![Agent Assignment transitions: Standby and Training, the Base Assignments, switch to each other at once and are the only Assignments an Agent can be deployed from; only an Agent on one can be ordered to Contracting or an Investigation, the Away Assignments, and an Agent on an Away Assignment can only be recalled to Standby; every move to or from an Away Assignment passes through In transit for one Advance turn, and an Agent In transit cannot take orders; Deployed and Recovering are left only by an Advance turn; Killed and Dismissed are final](../../../images/diagrams/agent-assignment-transitions.svg)

A Serving Agent's Assignment also ends, without a replacement, when it becomes Terminated under [Agent status](#agent-status): a Deployed Agent that is Killed in a Combat, and an Agent that is dismissed under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents). A new Agent starts on Standby: At assignment when it belongs to the [Initial roster](#initial-roster), and In transit when it is created during play under [Agent creation](#agent-creation).

## Transit rule

This rule decides when an Agent with a new Assignment starts working. Every [Turn advancement step](domain-model.md#turn-advancement-steps) under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) applies it. The following statements are complete:

1. **Starting In transit:** Every new Assignment starts In transit, with four exceptions: an Agent becomes Deployed At assignment at once; an Agent At assignment moved from one [Base Assignment](#assignments) to the other is At assignment at once; a Recovering Agent whose current health reaches effective max health becomes Standby At assignment at once; and an Agent of the [Initial roster](#initial-roster) starts At assignment.
2. **Arrival:** An Agent that is In transit in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of an Advance turn, i.e. in the World state in which that Advance turn began, and that still has the same Assignment, becomes At assignment in the Previous turn transit arrivals step of that Advance turn, or Recovering when its Assignment is Recovery. Completing its transit is all that happens to it in that Advance turn: it earns no income, trains nothing, adds no Investigation progress, fights in no Combat, and recovers neither current health nor exhaustion. This holds because the arrivals step comes after every step in which an Agent works, fights, or recovers, under [Transit across the steps](turn-advancement.md#transit-across-the-steps) in Turn Advancement.
3. **Departure:** An Agent that becomes In transit during an Advance turn, including one whose Assignment changes while it is In transit, does not arrive in that Advance turn: it is still In transit in the World state after that Advance turn and arrives in the next one. The Previous turn transit arrivals step applies only to Agents that were In transit, with the same Assignment, in the Turn-end state.
4. **No orders in transit:** An Agent In transit cannot take orders, under [Agents that can take orders](#agents-that-can-take-orders), so it can be neither assigned nor deployed, and it cannot be dismissed, under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents), so its destination and its arrival are fixed when its transit starts, unless its destination ends.

Wherever the rule of a Turn advancement step applies to Agents At assignment or Recovering, it means Agents that have that Agent status when the step begins. Two further statements complete the rule:

- **Upkeep:** An Agent In transit, including one that arrives in the same Advance turn, is still counted in the Upkeep step, because upkeep, under [Upkeep](economy-and-upgrades.md#upkeep), is a cost the Agency pays for every Serving Agent, not something the Agent does.
- **Destination ends:** When the Assignment an Agent is In transit to ends because of something other than the Agent's own work, its Assignment still changes as the owning rule states. E.g., an Agent In transit to an Investigation adds no progress, but when the other members' progress completes that Investigation, the Agent goes to Standby, In transit, with the rest of the Current team, under [Investigations](investigations.md). This starts a new transit, so under statement 3 it arrives at Standby in the next Advance turn.

**Within base:** Standby and Training are both carried out in the Agency's base, so an Agent moved between them by `assignAgents` travels nowhere: it is At assignment at once, and it can take orders again in the same Turn.

**Deployed:** Deploying to a Mission site does not start In transit, and only an Agent on a Base Assignment can be deployed, under [Deploying Agents](missions.md#deploying-agents) in Missions. The moment the player deploys, a new Mission at that Mission site is created and the selected Agents are Deployed on it At assignment, and the Combat is fought in the next Advance turn, under [Missions](missions.md). The way back does take transit: survivors become In transit during that Advance turn, so under statement 3 they are still In transit when it ends, and they arrive in the Advance turn after it.

**Informative rationale:** No GDR supplies a transit duration, so every transit takes exactly one Advance turn. Every trip to or from an [Away Assignment](#assignments) therefore costs one Advance turn before the Agent works, while moving within base and deploying from base cost none, and returning from a Mission costs one Turn during which the Agent can do nothing. Keeping Agents In base is the price of having them ready for a Mission site.

# Training growth

A worn-down Agent learns less, so Training pays off in full only for an Agent whose effective skill is not lowered.

In the Training step of every Advance turn, each Working Agent whose Assignment is Training has one named random outcome, the **Training gain** outcome. Its possible values are "gains" and "does not gain". It takes the value "gains" with the [Probability](../foundation/numbers.md#glossary):

```text
training gain Probability = current health × penalty factor / (effective max health × 100)
```

where current health, effective max health, and the penalty factor are those of [Effective skill](#effective-skill), from the Agent's [Step-start values](domain-model.md#turn-advancement-steps) of the Training step. The Probability is effective skill divided by base skill before Round down, so it reads the same health and exhaustion as effective skill and needs no base skill; it is defined even for an Agent of base skill 0. It is an exact Probability under [Probabilities](../foundation/numbers.md#probabilities) in Numbers, never rounded, from 0 to 1, both included, because each of its two factors lies from 0 to 1. When the outcome is "gains", the Agent gains base skill:

```text
base skill after = base skill before + training skill gain
```

Inputs: base skill before is the Agent's base skill at the start of the Training step, a Decimal quantity of at least 0; training skill gain is `training_skill_gain_per_turn` of AgentParameters plus what every acquired Upgrade with the effect `training_skill_gain` adds, under [Rate Upgrades](economy-and-upgrades.md#rate-upgrades) in Economy and Upgrades, a Decimal quantity of at least 0. No rounding occurs, because the sum of two Decimal quantities is a Decimal quantity, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers. The result is a Decimal quantity of at least base skill before; base skill has no upper bound. E.g., a base skill of 101.65 and a training skill gain of 1.50 give 103.15. When the outcome is "does not gain", base skill is unchanged. An Agent whose exhaustion is at most `exhaustion_free_points` and whose current health equals its effective max health has Probability 1, so it always gains; e.g., with the GDR values, an Agent with exhaustion 50 gains with Probability 80 / 100. An Agent In transit when the Training step begins has no Training gain outcome and gains nothing, under [Transit rule](#transit-rule). Training also raises the Agent's exhaustion, under [Work exhaustion](#work-exhaustion), and changes no other value of the Agent. The outcome of one Agent does not depend on any other Agent, so the result is the same whatever order an implementation processes the Agents in.

**Informative rationale:** With the Probability, the expected gain is exactly the training skill gain scaled by effective skill relative to base skill, and every gain an Agent does receive is the whole training skill gain the Agency has.

# Mission growth

An Agent learns most from the Missions it lives through: every attack it makes or takes teaches it something, and surviving the Mission teaches it more, most of all in its first Missions. A Killed Agent takes what it learned with it, so deploying a veteran improves the odds of a Mission but risks losing its Experience.

Under step 7 of [Resolving one Mission](missions.md#resolving-one-mission) in Missions, every survivor of Mission M gains Experience, whether M is Won or Lost, and every point of it gives the survivor one point of base skill:

```text
survival experience = entry n of experience_per_mission_survived, or its last entry when n exceeds the number of entries
mission experience  = combat experience + survival experience
Experience after    = Experience before + mission experience
base skill after    = base skill before + mission experience
```

The skill gain of exactly one point of base skill for each point of Experience is fixed by this rule: no GDR holds it, so no Game build can change it.

Inputs:

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| combat experience | The survivor's combat experience in M's Combat, as M's Combat report records it, under [Combat experience](combat.md#combat-experience) in Combat. | Experience; a whole number of at least 0. |
| n | The number of Missions in the survivor's Participation history, M included, which step 5 of Resolving one Mission has recorded. | Missions; a whole number of at least 1. |
| `experience_per_mission_survived` | The list of AgentParameters, its entries numbered from 1. | Experience; each entry a whole number of at least 0. |
| Experience before | The survivor's Experience after M's Combat. | Experience; a whole number of at least 0. |
| base skill before | The survivor's base skill after M's Combat, which never changes base skill. | Skill points; a Decimal quantity of at least 0. |

Evaluation: every amount of Experience is a whole number, so the sums are exact and no rounding occurs, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers. Base skill and Experience have no upper bound, and both rise by the same amount, so Experience never exceeds the base skill gained since the Agent was created. Every Mission in a Serving Agent's Participation history is one it survived, because a Killed Agent takes part in no later Mission, so n is the number of Missions the survivor has survived, M included. A Killed Agent gains nothing: its combat experience stays in M's Combat report and is never added to any value. Whether M is Won or Lost does not matter: the survivors of a Lost Mission gain as those of a Won one do. M's Combat reads the base skill before the gain, so the gain first counts in the survivor's next work or Combat. The gain of one survivor reads no other Agent, so the result does not depend on the order in which an implementation processes the survivors.

E.g., with the GDR values, a survivor of its first Mission that hit with two attacks, missed with one, was hit once, and was missed once has the combat experience `4 + 4 + 2 + 1 + 2 = 13`, the survival experience 30, and the Mission experience 43, so its Experience and its base skill each rise by 43; its second, third, and fourth Missions survived give survival experience of 25, 20, and 15, and every later one 15.

**Informative rationale:** The amounts are named Experience so that the Compendium can explain where Experience comes from apart from what it gives, and the conversion of one point of base skill for each point of Experience is fixed rather than a GDR value so that the Compendium can state it in words that no Game build can make false.

# Work exhaustion

Contracting and Training wear an Agent down a little in every Advance turn, so an Agent cannot work on them without end: it must be rotated to Standby to rest. An Investigation does not wear an Agent down.

In each Advance turn, every Working Agent on Contracting or Training gains exhaustion in the [Turn advancement step](turn-advancement.md#glossary) of its work, after that step has read the Agent's values for the work itself. The following table is exhaustive:

| Work Assignment | Its Working Agents | Step and the work read first | Exhaustion gained |
| --- | --- | --- | --- |
| Contracting | Every Agent counted in the contracting income, under [Agency income](economy-and-upgrades.md#agency-income) in Economy and Upgrades | Agency income, after the Agency's income is added | `exhaustion_per_contracting_turn` |
| Training | Every Agent that has a Training gain outcome, under [Training growth](#training-growth) | Training, after its Training gain outcome and any gain of base skill | `exhaustion_per_training_turn` |

```text
exhaustion after = exhaustion before + exhaustion gained
```

Exhaustion before is the Agent's exhaustion at the start of the step and exhaustion gained the value of AgentParameters in the table, each a whole number of at least 0; no rounding occurs and no upper clamp applies, under [Attribute ranges](#attribute-ranges). The Agent's Exact exhaustion rises by the same amount, under [Exhaustion and Exact exhaustion](#exhaustion-and-exact-exhaustion). Because the work is read first, the exhaustion an Agent gains from a work turn never lowers what that turn's work achieves: e.g., an Agent on Contracting with exhaustion 30 earns its full income in the Agency income step and then has exhaustion 31. An Agent In transit when the step of its work begins, including one that arrives in the Previous turn transit arrivals step of the same Advance turn, does not work, under [Transit rule](#transit-rule), and gains no exhaustion. The gain of one Agent reads no other Agent, so the result does not depend on the order an implementation processes the Agents in.

## Forced return

An Agent worn down too far stops working on its own, so that tiredness never reaches the point at which a Combat would find the Agent unable to fight.

In the same step, right after an Agent gains exhaustion under [Work exhaustion](#work-exhaustion), the Agent has a Forced return when its exhaustion is at least `exhaustion_work_limit`.

On a Forced return the Agent's Assignment becomes Standby. Its Agent status becomes In transit when it was on Contracting, an Away Assignment, and stays At assignment when it was on Training, a Base Assignment, under [Transit rule](#transit-rule). The work the Agent did in this step still counts: e.g., the income it earned and the base skill it gained are kept.

A Forced return makes the Agent Fit to start work again only after it has rested, under [Start-work gate](#start-work-gate) and [Agent Recovery](agent-recovery.md). E.g., with the GDR values, an Agent on Contracting that reaches exhaustion 70 is In transit to Standby, arrives in the next Advance turn, and then loses 5 exhaustion in each Advance turn on Standby, so it is Fit to start work again with exhaustion 30, after eight Advance turns of rest.

# Agent creation

Every Agent is created by this rule, whichever rule causes the creation: the [Initial roster](#initial-roster), the `hireAgents` Player action of [Economy and Upgrades](economy-and-upgrades.md), or the [Player cheat action](../foundation/engine-contract.md#player-actions-and-turns) under [Adding Agents](#adding-agents). Each new Agent has a fresh Instance ID under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

| Value | Initial value | Source |
| --- | --- | --- |
| Archetype reference | The AgentArchetype. | The one AgentArchetype GDR, under [Agent GDR validation](#agent-gdr-validation). |
| Agency | The Campaign's Agency. | Campaign state. |
| Turn hired | The turn number of the current Turn. | Campaign state. |
| Base skill | The AgentArchetype's `base_skill`. | `base_skill` of the AgentArchetype. |
| Experience | 0. | This rule. |
| Base health | The AgentArchetype's `base_health`. | `base_health` of the AgentArchetype. |
| Health lost | 0. | This rule. |
| Exhaustion | 0. | This rule. |
| Weapon | The Weapon GDR that the AgentArchetype's `weapon` references. | `weapon` of the AgentArchetype. |
| Base weapon damage | The `base_weapon_damage` of that Weapon GDR. | `base_weapon_damage` of the Weapon GDR. |
| Armor | The Armor GDR that the AgentArchetype's `armor` references. | `armor` of the AgentArchetype. |
| Base armor | The `base_armor` of that Armor GDR. | `base_armor` of the Armor GDR. |
| Assignment | Standby. | This rule. |
| Agent status | At assignment for an Agent of the initial roster; In transit for every Agent created during play. | This rule, under [Transit rule](#transit-rule). |
| Participation history | Empty. | This rule. |
| Enemies killed | 0. | This rule. |
| Turn terminated | Absent. | This rule. |
| Killed by | Absent. | This rule. |
| Final max health | Absent. | This rule. |
| Final weapon damage | Absent. | This rule. |
| Final armor | Absent. | This rule. |

No Upgrade changes an initial value above. A new Agent has no health lost, so its current health equals its effective max health, under [Effective max health and current health](#effective-max-health-and-current-health), and it has the effective weapon damage of every other Serving Agent with its Weapon, under [Effective weapon damage](#effective-weapon-damage), and the effective armor of every other Serving Agent with its Armor, under [Effective armor](#effective-armor). The new Agent joins the Agency's roster of Agents. No [Campaign configuration](../foundation/campaign-state.md#glossary) value changes any initial value above. Creating an Agent changes nothing else; e.g., any cost, and the [Agent cap](economy-and-upgrades.md#glossary), belong to the rule that causes the creation.

## Initial roster

The initial Campaign state contains exactly `initial_roster_size` Agents, the value of AgentParameters, and no other Agent, as [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model requires. Each is created under [Agent creation](#agent-creation) with Agent status At assignment and Turn hired equal to the turn number of the Campaign's first Turn. Because no Upgrade has been acquired at campaign creation, each has the Weapon `base_weapon_damage` as its effective weapon damage, the Armor `base_armor` as its effective armor, and the AgentArchetype's `base_health` as its effective max health and its current health. Every Agent of the initial roster can take orders in the first Turn. An `initial_roster_size` of 0 is valid and gives an empty roster.

# Assigning Agents

The Player action `player.actions.assignAgents(agents, assignment)` assigns Agents to Standby, Contracting, or Training.

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
5. An Agent in `agents` cannot take orders, under [Agents that can take orders](#agents-that-can-take-orders).
6. An Agent in `agents` already has `assignment` as its Assignment.
7. `assignment` is `Contracting` or `Training`, and an Agent in `agents` is not Fit to start work, under [Start-work gate](#start-work-gate).
8. `assignment` is `Contracting` or `Training`, and an Agent in `agents` is on an [Away Assignment](#assignments), which it can leave only for Standby, under [Agents that can take orders](#agents-that-can-take-orders).

Two further preconditions, on assigning Agents to Training and to Contracting, are stated under [Caps on assigning Agents](economy-and-upgrades.md#caps-on-assigning-agents). Other preconditions apply to every Player action, e.g. that the Campaign has no [Campaign ending](domain-model.md#campaign-standing), under [Panic and Endings](panic-and-endings.md) and [Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation is the Implementer's choice. A rejected action changes nothing, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract. Because every value under [Player-visible information](#player-visible-information) is Player-visible, the error reveals nothing hidden.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same Turn, to every Agent in `agents`:

- Its Assignment becomes `assignment`. Its Agent status stays At assignment when both its former Assignment and `assignment` are [Base Assignments](#assignments), and becomes In transit otherwise, under [Transit rule](#transit-rule).
- If its Assignment was an Investigation, it leaves that Investigation's Current team, and the Investigation is recorded under [Participation history records](#participation-history-records). Leaving also affects the Investigation under [Leaving an Investigation](investigations.md#leaving-an-investigation), e.g. it is Abandoned when its last member leaves.

Nothing else changes; e.g., no money is spent, and base skill, current health, and exhaustion are unchanged. An Agent In transit arrives in the next Advance turn and starts working in the Advance turn after it, and an Agent moved within base starts working in the next Advance turn, under [Transit rule](#transit-rule).

# Player cheat actions

A Player cheat action changes Campaign state in a way ordinary play does not allow. The Player cheat action for Agents adds them without the cost and the [Agent cap](economy-and-upgrades.md#glossary) that hiring has.

## Adding Agents

The Player cheat action `developer.actions.addAgents(count)` adds Agents to the Agency. It follows every rule under [Player cheat actions](../foundation/developer-access.md#player-cheat-actions) in Developer Access, including that only the [Session controller](../foundation/engine-contract.md#principals-and-access) can call it, only with [Dev mode](../foundation/engine-contract.md#principals-and-access) enabled, and that each successful call is one Player action recorded as one [Timeline entry](../foundation/timeline.md#glossary).

| Parameter | Meaning                                               |
| --------- | ----------------------------------------------------- |
| `count`   | How many Agents to add: a whole number of at least 1. |

Validation: the operation is rejected, and changes nothing, when `count` is not a whole number or is less than 1. No upper limit applies.

Effect: the operation creates `count` Agents, each under [Agent creation](#agent-creation) exactly as hiring creates one, so each is Serving, on Standby, and In transit, with Turn hired equal to the current turn number. Unlike hiring, it spends no money and ignores the [Agent cap](economy-and-upgrades.md#glossary): it succeeds even when the Agency's money is below the hiring cost or the Agency already employs as many Agents as the [Agent cap](domain-model.md#agency-and-agents) allows. Nothing else changes.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, of its Agents:

- **Arrivals:** the Agents that arrived at their Assignment in its Previous turn transit arrivals step, under [Transit rule](#transit-rule).
- **Training:** for each Agent with a Training gain outcome in it, that outcome and the Agent's base skill and exhaustion after its Training step, under [Training growth](#training-growth).
- **Forced returns:** each Agent that had a Forced return in it, with the Assignment it was returned from, under [Forced return](#forced-return).

Each lists its Agents by Instance ID, in the order of the Agents in Campaign state. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds none of these, and holds the number of Serving Agents in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the Turn-end state of that Turn. Of the Turn-end state, it also holds the number of Serving Agents In transit, the number Recovering, and the number At assignment on each of Standby, Training, Contracting, an Investigation, and Deployed, which together are every Serving Agent, the effective skill of each Serving Agent, without its Instance ID, and three counts of Serving Agents: those whose Assignment is Recovery, whether Recovering or In transit; those whose exhaustion is above `exhaustion_work_limit`; and those whose exhaustion is above `exhaustion_free_points`. All are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report.

# Player-visible information

Every value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces) under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), from the moment it exists, without a reveal condition, for every Agent whatever its Agent status. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| An Agent's Instance ID, its AgentArchetype including the AgentArchetype's `name`, its Agency, and its Turn hired | Yes |
| An Agent's base skill, Experience, current health, health lost, base health, effective max health, exhaustion, Exact exhaustion, Weapon, base weapon damage, effective weapon damage, Armor, base armor, effective armor, and, for a Terminated Agent, Final max health, Final weapon damage, and Final armor | Yes |
| An Agent's effective skill | Yes |
| An Agent's Agent status, and its Assignment, including the Investigation or Mission it references | Yes |
| Whether an Agent can take orders, whether it is Fit to start work, whether it meets the incapacitation condition of Combat with its current values, under [Incapacitation condition](combat.md#incapacitation-condition), and whether it is In base or Away | Yes |
| An Agent's Participation history | Yes |
| An Agent's Enemies killed, Turn terminated, and Killed by, including the Enemy and Mission site Killed by references | Yes |
| Every property of the AgentArchetype and of AgentParameters | Yes |

**Unknown versus absent:** No value in the table above is hidden, so Player API never reports one as unknown. A Terminated Agent has no Assignment; Player API reports it as absent, and the visible Agent status explains why. A Serving Agent has no Turn terminated, and an Agent that is not Killed has no Killed by; Player API reports each as absent. An empty Participation history is reported as empty, not as absent.

# Edge cases and failure behavior

- **Growth from a Lost Mission:** The survivors of a Lost Mission gain the same Mission experience as they would after a Won one, whatever their condition at the end of its Combat ([Mission growth](#mission-growth)).
- **A long career:** Once an Agent has survived more Missions than `experience_per_mission_survived` has entries, every further Mission survived gives the last entry, with no cap on base skill or Experience ([Mission growth](#mission-growth)).
- **Exhaustion at the free amount:** An exhaustion exactly equal to `exhaustion_free_points` gives a penalty factor of 100; the first point above it lowers the penalty factor by `skill_penalty_pct_per_exhaustion` ([Effective skill](#effective-skill)).
- **Penalty below zero:** When `skill_penalty_pct_per_exhaustion × (exhaustion − exhaustion_free_points)` exceeds 100, the penalty factor is 0 and effective skill is 0; the Combatant is still alive and keeps its base skill ([Effective skill](#effective-skill)).
- **Very high exhaustion:** Exhaustion has no upper bound and may exceed `exhaustion_incapacitation`, e.g. after a costly Mission under [Mission exhaustion](missions.md#mission-exhaustion) in Missions; the penalty factor is 0 once `skill_penalty_pct_per_exhaustion × (exhaustion − exhaustion_free_points)` reaches 100, and the Agent needs a longer rest before it is Fit to start work ([Attribute ranges](#attribute-ranges), [Start-work gate](#start-work-gate)).
- **Exact exhaustion just above a threshold:** An Agent with Exact exhaustion 30.40 has exhaustion 31, so with `exhaustion_work_start_max` 30 it is not Fit to start work; with Exact exhaustion 30 it is ([Exhaustion and Exact exhaustion](#exhaustion-and-exact-exhaustion), [Start-work gate](#start-work-gate)).
- **Current health just below effective max health:** An Agent with current health 29.99 of 30 has an effective skill below its base skill wherever the exact value falls below the next whole number, e.g. `round down(100 × 29.99 × 100 / 3000) = round down(99.96…) = 99` ([Effective skill](#effective-skill)).
- **Exhaustion exactly at a threshold:** An Agent with exhaustion equal to `exhaustion_work_start_max` and no health lost is Fit to start work, and an Agent whose Contracting or Training brings its exhaustion exactly to `exhaustion_work_limit` has a Forced return ([Start-work gate](#start-work-gate), [Forced return](#forced-return)).
- **Health lost outside Recovery:** Missions sends an Agent that survives a Combat with health lost to Recovery, which ends only once its health lost is 0, under [Agent Recovery](agent-recovery.md), so an Agent that can take orders normally has no health lost. Should one have health lost, it is not Fit to start work whatever its exhaustion ([Start-work gate](#start-work-gate)).
- **Fit to start work but not deployable:** With `exhaustion_work_start_max` above `exhaustion_free_points`, an Agent that is Fit to start work may meet the incapacitation condition of Combat; it can still start work, but it cannot be deployed ([Start-work gate](#start-work-gate)).
- **Assigning a tired Agent:** `assignAgents` to Contracting or Training, `startInvestigation`, and `assignAgentsToInvestigation` reject, as a whole, a list with an Agent that is not Fit to start work, e.g. one with exhaustion 31 with the GDR values; assigning it to Standby or deploying it is accepted ([Start-work gate](#start-work-gate)).
- **Forced return from Training:** The Agent is on Standby, At assignment, at once, so it recovers exhaustion in the Agent recovery step of the same Advance turn, under [Which Agents recover](agent-recovery.md#which-agents-recover) in Agent Recovery ([Forced return](#forced-return)).
- **Investigating without end:** An Agent on an Investigation keeps its exhaustion and health lost however long it works, so no Advance turn moves it off the Investigation for being worn down ([Changes to attributes](#changes-to-attributes)).
- **Zero current health:** A Serving Agent never has zero current health in a World state: the Combat that brings its current health to zero makes it Killed ([Agent status](#agent-status)). An Enemy with zero current health has an effective skill of 0 ([Effective skill](#effective-skill)).
- **Recovery completion:** An Agent on Recovery whose current health reaches effective max health under [Agent Recovery](agent-recovery.md) becomes Standby, At assignment, at once, without transit, under [Assignment changes](#assignment-changes).
- **Moving within base:** An Agent moved between Standby and Training is At assignment at once, so it can take orders again in the same Turn, e.g. from Training to Standby and then to Contracting, or dismissed from Standby ([Transit rule](#transit-rule)).
- **Moving an Agent that is away:** An Agent on Contracting or an Investigation cannot be deployed or given other work, e.g. moved from Contracting to an Investigation or to Training; it must first be recalled to Standby, which costs an Advance turn of transit ([Agents that can take orders](#agents-that-can-take-orders)).
- **Ordering an Agent In transit:** `assignAgents`, `startInvestigation`, `assignAgentsToInvestigation`, `deployAgents`, and `dismissAgents` reject, as a whole, a list with an Agent In transit, whatever its Assignment; the Agent must arrive first ([Transit rule](#transit-rule)).
- **Destination ends during transit:** An Agent In transit to an Investigation that the other members complete goes to Standby, In transit, without adding progress; it does not arrive in that Advance turn and arrives at Standby in the next one ([Transit rule](#transit-rule)).
- **Arrival and upkeep:** An arriving Agent does nothing else in its arrival Advance turn but is still counted for upkeep ([Transit rule](#transit-rule)).
- **Conflicting Assignments:** A Serving Agent always has exactly one Assignment; no Player action can give it a second one. An Agent listed twice in one `assignAgents` call is rejected ([Assigning Agents](#assigning-agents)).
- **Assigning to the current Assignment:** `assignAgents` with an Agent already on the target Assignment is rejected rather than restarting its transit ([Assigning Agents](#assigning-agents)).
- **Mixed valid and invalid Agents:** One invalid Agent rejects the whole `assignAgents` call; no listed Agent changes ([Assigning Agents](#assigning-agents)).
- **Deployed Agents:** A Deployed Agent is At assignment but cannot take orders, cannot be dismissed, and is not recalled by any Player action ([Agents that can take orders](#agents-that-can-take-orders)).
- **Empty roster:** A Campaign with no Serving Agent is valid; `assignAgents` then has no Agent it can order. Whether the Campaign ends is decided under [Defeat](panic-and-endings.md#defeat).
- **Invalid GDRs:** A Game build with no AgentArchetype, two AgentArchetypes, an AgentArchetype `base_health` of 0, a missing or extra property, or an unresolved `weapon` or `armor` fails [Agent GDR validation](#agent-gdr-validation), and no Campaign is created from it. A World state violating an Agent invariant, e.g. a Serving Agent with no Assignment, is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a [Campaign ending](domain-model.md#campaign-standing), `assignAgents`, `addAgents`, and Advance turn are rejected, under [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending).

# TODOs

- TODO (later): Career statistics beyond Participation history and the Service record, under [Service record](#service-record).
- TODO (later): Transit durations that differ between Assignments, under [Transit rule](#transit-rule).
- TODO (later): Selection among several AgentArchetypes, under [Agent GDR validation](#agent-gdr-validation).
