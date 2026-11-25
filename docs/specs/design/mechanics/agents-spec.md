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

How well an Agent works and fights is its effective skill: its base skill, lowered by lost current health and by exhaustion above a free amount. Training and Missions raise base skill; work and [Combats](domain-model.md#combat) wear it down, so an Assignment trades present output against future strength. An Agent is Serving until it is Killed in a Combat or Dismissed, and it is never removed, so its record outlasts its service.

Agents builds on [Domain Model](domain-model.md): Domain Model says how an Agent connects to the Agency and its work, and Agents says what one Agent is and how it works.

# Glossary

## Combatant attributes

What makes an [Agent](domain-model.md#agency-and-agents) or an [Enemy](domain-model.md#combat) able to work and to fight, and how worn down it is. The names follow one rule:

- **Base:** Base X is a lasting stored value, e.g. base skill, which only named rules change.
- **Effective:** Effective X is base X adjusted for the situation and is never stored, e.g. effective skill; effective max health is base health adjusted in this way.
- **Current:** Current X is a value that is used up and restored, e.g. current health. It is never stored: it is what is left of the most a [Combatant](domain-model.md#combat) can have after what it has lost.
- **GDR property:** A [GDR](../foundation/core-concepts.md#game-build-and-content) property `base_x` gives the starting value of base X, e.g. `base_health`.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Base skill | How capable a [Combatant](domain-model.md#combat) is at its work and in a [Combat](domain-model.md#combat), before its lost current health and its exhaustion reduce it. An Agent's base skill is a [Decimal quantity](../foundation/numbers.md#glossary), so Training can raise it by less than one point. | Skill, naming the stored value |
| Effective skill | A Combatant's base skill as reduced by its lost current health and its exhaustion; the value every rule uses when a Combatant works or fights. |  |
| Base health | The highest current health a Combatant can have before any [Upgrade](domain-model.md#agency-and-agents) raises it, as a stored whole number. | Maximum health; full health |
| Effective max health | The highest current health a Combatant can have now: its base health, raised for a Serving Agent by what the [Agency](domain-model.md#agency-and-agents)'s Upgrades add. |  |
| Health lost | The harm a Combatant has taken and not yet recovered, from zero up to its effective max health; the stored value behind current health. |  |
| Current health | How much more harm a Combatant can take now: its effective max health less its health lost, [from zero up to its effective max health](#attribute-ranges); an Agent whose current health reaches zero is dead. | Hit points; hit-point; health, naming a Combatant value. Unqualified health remains valid in its general sense, e.g. Health recovery. |
| Exhaustion | How worn down a Combatant is, as a whole number of at least zero with no upper bound; beyond a free amount it lowers effective skill. The specifications that raise or lower it own accumulation and recovery. An Agent's exhaustion is its Exact exhaustion rounded up. | Fatigue |
| Exact exhaustion | The [stored value behind an Agent's exhaustion](#exhaustion-and-exact-exhaustion): a [Decimal quantity](../foundation/numbers.md#glossary) of at least zero, so that rest can lower it by less than one point. |  |
| Fully rested | Of an Agent: whose exhaustion is 0, so that rest can lower it no further, whatever its current health. |  |
| Base weapon damage | The typical current health a Combatant's hit removes, as a stored whole number, before any adjustment for the situation and before the random spread. | Weapon damage, naming the stored value |
| Effective weapon damage | A Combatant's base weapon damage as adjusted for the situation; the value around which a Combat rolls the damage outcome. A Combat [can replace it](combat.md#ammo-in-a-combat) for an Agent whose rounds run out. |  |
| Base armor | How much of the damage of hits a Combatant's armor absorbs in one Combat before its current health starts to fall, as a stored whole number of at least zero, before any adjustment for the situation. | Armor, naming the stored value |
| Effective armor | A Combatant's base armor as adjusted for the situation; the current armor it starts every Combat with. |  |
| Current armor | How much more of the damage of hits a Combatant's armor can absorb in the current Combat, from zero up to its effective armor. It [exists only while a Combat lasts](combat.md#combat-only-properties), so every Combat starts with it full; losing it lowers neither current health nor effective skill. | Armor points |

## Assignments

The [Assignments](domain-model.md#agency-and-agents) that are neither an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) nor a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions), the one that places an Agent in a Mission, and the two groups that decide whether a move between Assignments takes transit.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Standby | The Assignment of an Agent with no work. |  |
| Contracting | The Assignment of an Agent earning money for the Agency. |  |
| Training | The Assignment of an Agent gaining base skill. |  |
| Recovery | The Assignment of an Agent regaining current health. The player can neither assign an Agent to it nor assign a Recovering Agent elsewhere. |  |
| Deployed | Sent on a Mission at a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) as a member of its [Current team](domain-model.md#leads-investigations-mission-sites-and-missions), and fighting there in the next Advance turn. An Agent becomes Deployed the moment the player deploys it, without transit. That [Mission](missions.md#mission-lifecycle) and its [Mission site](missions.md#mission-site-lifecycle) are Deployed for as long as the Agent is. |  |
| Base Assignment | Standby or Training, the Assignments an Agent carries out in the Agency's base. Moving between them takes no transit, and only an Agent on one can be deployed or given an Away Assignment. |  |
| Away Assignment | Contracting or an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions), the Assignments an Agent carries out away from base. Every move to or from them starts [In transit](domain-model.md#agency-and-agents), and an Agent on one can only be recalled to Standby. |  |
| Work Assignment | Contracting, Training, or an Investigation, the Assignments on which an Agent works and so [gains exhaustion](#work-exhaustion). |  |
| Fit to start work | Of an Agent: whose exhaustion is at most `exhaustion_work_start_max` and whose health lost is 0, so that it [may start a Work Assignment](#start-work-gate). |  |
| Working Agent | In an Advance turn: an Agent whose Assignment is a Work Assignment and that is [At assignment](domain-model.md#agency-and-agents) on it when the [Turn advancement step](domain-model.md#turn-advancement-steps) of its work begins, so that it works in that Advance turn. An Agent [In transit to a Work Assignment](#transit-rule) is not a Working Agent; it arrives only in the Previous turn transit arrivals step, after every step of work. |  |
| Forced return | The [move of a Working Agent to Standby](#forced-return) that an Advance turn makes when its work raises its exhaustion to `exhaustion_work_limit` or more. |  |

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
| Skill gain | Base skill an Agent gains. It has exactly two sources: its [training skill gain](#training-growth), and its Experience, of which every point it gains [gives it exactly one point of base skill](#mission-growth). |  |
| Training skill gain | The base skill an Agent on Training [gains in one Advance turn](#training-growth) whose Training gain outcome is "gains": `training_skill_gain_per_turn` plus what the acquired Upgrades add. It is not Experience. |  |
| Experience | What an Agent learns from the Missions it survives, counted in whole points, which it [gains as Mission experience](#mission-growth). An Agent's Experience is the sum of every Mission experience it has gained. Every point of Experience an Agent gains is also a skill gain of exactly one point of base skill; this conversion is fixed by the rules and is no GDR value. | XP; experience points |
| Combat experience | The Experience one Agent [earns in one Combat](combat.md#combat-experience) from the attacks it made and the attacks made on it. The Agent [gains it only if it survives the Mission](#mission-growth). | Combat skill gain |
| Survival experience | The Experience an Agent earns for surviving a Mission, which [falls with the number of Missions it has survived](#mission-growth). | Survival bonus; survival skill gain |
| Mission experience | The Experience an Agent [gains from one Mission it survives](#mission-growth): its combat experience in the Mission's Combat plus its survival experience. | Mission skill gain |

# Agent GDRs

One AgentArchetype gives every new Agent its starting values, and AgentParameters holds the thresholds and amounts that the rules about Agents read.

## AgentArchetype

An AgentArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of every Agent. A [Game build](../foundation/core-concepts.md#game-build-and-content) supplies exactly one, so no rule selects among AgentArchetypes.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Agent. | [Player-visible information](#player-visible-information) |
| `base_skill` | The base skill of a newly created Agent. | [Agent creation](#agent-creation) |
| `base_health` | The base health of a newly created Agent. | [Agent creation](#agent-creation) |
| `weapon` | A reference to the [Weapon](combat.md#weapon) GDR a newly created Agent is equipped with. | [Agent creation](#agent-creation) |
| `armor` | A reference to the [Armor](combat.md#armor) GDR a newly created Agent is equipped with. | [Agent creation](#agent-creation) |

## AgentParameters

AgentParameters bundles the values that the Agent rules read, and the values that [Combat](combat.md) and [Missions](missions.md) read about exhaustion and about the Experience an Agent earns in a Combat. Each value is a whole number of at least 0 unless its row says otherwise.

| Property | Meaning | Read by |
| --- | --- | --- |
| `initial_roster_size` | How many Agents the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains. It may be 0. | [Initial roster](#initial-roster) |
| `exhaustion_incapacitation` | The exhaustion at or above which a Combatant stops fighting in a Combat. It is a whole number of at least 1. | [Incapacitation condition](combat.md#incapacitation-condition) |
| `exhaustion_free_points` | The exhaustion up to which effective skill is not reduced. | [Effective skill](#effective-skill) |
| `skill_penalty_pct_per_exhaustion` | A [Percent value](../foundation/numbers.md#glossary): the percent of base skill lost for each point of exhaustion above `exhaustion_free_points`. | [Effective skill](#effective-skill) |
| `exhaustion_per_attack` | The exhaustion an attacking Combatant gains. | [Effects of an attack](combat.md#effects-of-an-attack) |
| `exhaustion_per_defense` | The exhaustion a defending Combatant gains. | [Effects of an attack](combat.md#effects-of-an-attack) |
| `exhaustion_per_mission` | The exhaustion every surviving Agent of a Mission gains when the Mission is resolved. | [Mission exhaustion](missions.md#mission-exhaustion) |
| `exhaustion_per_pct_killed` | The further exhaustion a surviving Agent of a Mission gains for each percent of its team that was Killed. | [Mission exhaustion](missions.md#mission-exhaustion) |
| `exhaustion_per_contracting_turn` | The exhaustion an Agent gains in each Advance turn in which it works on Contracting. | [Work exhaustion](#work-exhaustion) |
| `exhaustion_per_training_turn` | The exhaustion an Agent gains in each Advance turn in which it works on Training. | [Work exhaustion](#work-exhaustion) |
| `exhaustion_per_investigation_turn` | The exhaustion an Agent gains in each Advance turn in which it works on an Investigation. | [Work exhaustion](#work-exhaustion) |
| `exhaustion_work_start_max` | The highest exhaustion at which an Agent can be Fit to start work. It is less than `exhaustion_work_limit`, so an Agent that starts work starts below the exhaustion that ends it. | [Start-work gate](#start-work-gate) |
| `exhaustion_work_limit` | The exhaustion at or above which work makes an Agent return to Standby. It is at most `exhaustion_incapacitation`, so work ends no later than at the exhaustion at which the Agent would stop fighting in a Combat. | [Forced return](#forced-return) |
| `training_skill_gain_per_turn` | The base skill an Agent on Training gains in one Advance turn when its Training gain outcome is "gains", before any [Upgrade](domain-model.md#agency-and-agents). It is a [Decimal quantity](../foundation/numbers.md#glossary) of at least 0. | [Training growth](#training-growth) |
| `experience_per_attack_hit` | The combat experience an attacking Agent earns from each of its attacks that hits. | [Combat experience](combat.md#combat-experience) |
| `experience_per_attack_miss` | The combat experience an attacking Agent earns from each of its attacks that misses. | [Combat experience](combat.md#combat-experience) |
| `experience_per_defense_hit` | The combat experience a defending Agent earns from each attack on it that hits. | [Combat experience](combat.md#combat-experience) |
| `experience_per_defense_miss` | The combat experience a defending Agent earns from each attack on it that misses. | [Combat experience](combat.md#combat-experience) |
| `experience_per_mission_survived` | The survival experience of an Agent's first, second, and each later Mission survived, as a list of one or more whole numbers whose last entry applies to every Mission beyond the list. | [Mission growth](#mission-growth) |

# Agent properties

An Agent is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is the AgentArchetype. The properties below are its stored [Authoritative values](../foundation/core-concepts.md#value-classification); everything else said of an Agent, e.g. its effective skill or whether it can take orders, is a [Derived value](../foundation/core-concepts.md#value-classification), computed from them whenever it is read.

| Property | Part | Meaning |
| --- | --- | --- |
| Agency | [Constants](../foundation/core-concepts.md#campaign-instances) | An Immutable reference to the Agency that employs the Agent. |
| Turn hired | Constants | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) in which the Agent was created. |
| Base skill, Experience, health lost, and base health | [State](../foundation/core-concepts.md#campaign-instances) | The Agent's values of these names. |
| Exact exhaustion | State | The value that holds the Agent's [exhaustion](#exhaustion-and-exact-exhaustion). |
| Weapon and base weapon damage | State | A reference to the Weapon GDR the Agent is [equipped](equipment.md#equipping-agents) with, and the Agent's base weapon damage. |
| Armor and base armor | State | A reference to the Armor GDR the Agent is equipped with, and the Agent's base armor. |
| Assignment | State | Present exactly when the Agent is Serving: its [Assignment](#assignment-and-agent-status). |
| Agent status | State | The Agent's [Agent status](#agent-status). |
| [Participation history](domain-model.md#agency-and-agents) | State | The Investigations and Missions the Agent [took part in and has left](#participation-history-records). |
| Enemies killed, Turn terminated, Killed by, Final max health, Final weapon damage, and Final armor | State | The Agent's [Service record](#service-record). |

No Agent is ever removed. An Agent that becomes Terminated becomes [Retired](../foundation/world-history.md#glossary) and keeps every property, so every reference to it still resolves, e.g. from a [Combat report](domain-model.md#combat).

## Participation history records

An Agent's Participation history grows whenever the Agent leaves a team, however it leaves. Whenever an Agent stops belonging to the Current team of an Investigation or of a Mission, for any reason, that Investigation or Mission is added to the Agent's Participation history, unless it is already there. Nothing is ever removed from a Participation history.

## Service record

An Agent that leaves the Agency keeps a record of how its service ended and what it achieved, so that the player can look back on it after the [Combat reports](domain-model.md#combat) that told the story are no longer kept in full.

| Property | Meaning |
| --- | --- |
| Enemies killed | The number of [Enemies](domain-model.md#combat) the Agent's attacks have made dead: it rises by 1 each time an attack the Agent makes [leaves its defender dead](combat.md#killed-and-incapacitated). |
| Turn terminated | Present exactly when the Agent is Terminated: the turn number of the Turn in which it became Terminated. For a Killed Agent, that is the Turn that the Advance turn fighting its Combat ends. |
| Killed by | Present exactly when the Agent is Killed: an Immutable reference to the Enemy whose attack made it dead, and one to that Enemy's [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions). |
| Final max health | Present exactly when the Agent is Terminated: the effective max health it had as a Serving Agent in the [World state](../foundation/engine-contract.md#player-actions-and-turns) before it became Terminated. |
| Final weapon damage | Present exactly when the Agent is Terminated: the effective weapon damage it had in that World state. |
| Final armor | Present exactly when the Agent is Terminated: the effective armor it had in that World state. It is the armor the Agent was equipped with, not the current armor it had left when a Combat ended. |

Enemies killed never falls, and every other value of the Service record never changes once it is set, so neither an Upgrade bought later nor what [becomes of its Weapon and Armor](equipment.md#mission-equipment-losses) changes what the record shows. Becoming Terminated leaves health lost unchanged: a Killed Agent keeps current health 0, and a Dismissed Agent keeps the current health it had.

# Agent status

An Agent's Agent status says where it stands toward its Assignment and whether it still serves the Agency. It is exactly one of At assignment, In transit, Recovering, Killed, and Dismissed, and [Assignment changes](#assignment-changes) holds every move between them.

An Agent that becomes Terminated loses its Assignment, and its [Service record](#service-record) receives its final values. The following invariants hold in every World state:

- A Serving Agent has exactly one Assignment. A Terminated Agent has none and belongs to no Current team.
- An Agent is Recovering exactly when its Assignment is Recovery and it is not In transit. A Deployed Agent is At assignment.
- A Serving Agent and a Dismissed Agent have positive current health, and a Killed Agent has zero current health.
- A Serving Agent whose Assignment is not Recovery has current health equal to its effective max health; e.g., current health never lowers the effective skill of an Investigation member.

# Attributes and effectiveness

An Agent's attributes say how capable it is and how worn down it is, and together they decide how well it works and fights. Agents share these attributes with Enemies, so one set of rules covers every Combatant.

## Combatant Role Type

The [Combatant Role Type](domain-model.md#combat) is a [Role Type](../foundation/campaign-instances.md#role-types). It states what a Campaign instance [Type](../foundation/core-concepts.md#data-modeling) must have for its Campaign instances to be Combatants, and what a Combatant gains while a Combat lasts.

- **Adoption condition:** a Campaign instance Type can adopt the Combatant Role Type if the State of its Campaign instances has all of the following properties: base skill, health lost, base health, exhaustion, equipped weapon values, i.e. a Weapon and a base weapon damage, and equipped armor values, i.e. an Armor and a base armor. A Type may hold its exhaustion as a stored value from which the exhaustion derives, as Agent does with Exact exhaustion.
- **Adopters:** Agent and Enemy adopt the Combatant Role Type.
- **Gained properties:** every Combatant taking part in a Combat gains [properties that mean something only while that Combat lasts](combat.md#combat-only-properties), e.g. whether it is [Incapacitated](combat.md#glossary). It gains them when the Combat begins and loses them when the Combat ends.

The properties named by the adoption condition persist outside a Combat; e.g., an Agent has current health and exhaustion between Combats. What outlasts a Combat is its [Combat report](domain-model.md#combat) and every change the Combat made to those properties, e.g. lost current health.

The Combatant Role Type is not a Campaign instance Type, so a Combatant is never a Campaign instance separate from its Agent or Enemy. If it were, every Agent would be two Campaign instances with two [Instance IDs](../foundation/campaign-instances.md#glossary), and current health would belong to the second one instead of to the Agent. A Combat instead changes the participating Agent and Enemy Campaign instances themselves: the Agent changed by a Combat is the same Agent that returns to the Agency.

## Attribute ranges

Every Combatant's attributes stay within fixed ranges, and the rule that changes a value keeps it there. In every World state, every Combatant satisfies these ranges:

- Base skill is at least 0, and health lost is from 0 to effective max health, both included. An Agent's value of each is a [Decimal quantity](../foundation/numbers.md#glossary), and an Enemy's is a whole number.
- Base health and base weapon damage are whole numbers of at least 1, and base armor is a whole number of at least 0.
- Exhaustion is a whole number of at least 0, with no upper bound.

Each comparison of these values is exact; e.g., an Agent with current health 0.67 is alive.

Any rule of any specification that would lower exhaustion below 0 lowers it to exactly 0 instead, and no rule clamps exhaustion from above. Any rule that would lower current health below 0 lowers it to exactly 0 instead, and any rule that would raise current health above effective max health raises it to exactly effective max health instead. E.g., a Combatant with exhaustion 99 that gains 3 exhaustion has exhaustion 102, and an Agent with exhaustion 3 that recovers 5 has exhaustion 0.

## Exhaustion and Exact exhaustion

An Agent's exhaustion is stored exactly, so that rest can lower it by less than a whole point in each Advance turn, and it is read rounded up, so that every threshold and formula works in whole numbers and an Agent counts as rested only once the whole point is gone.

```text
exhaustion = round up( Exact exhaustion )
```

Every rule that reads an Agent's exhaustion reads this whole number, and so does whatever shows the player an Agent's exhaustion, except where Exact exhaustion itself is shown, to tell how near the next whole number it is. Only [Exhaustion recovery](agent-recovery.md#exhaustion-recovery) reads Exact exhaustion.

A rule that raises an Agent's exhaustion by a whole number of points raises its Exact exhaustion by that number, a rule that sets an Agent's exhaustion sets its Exact exhaustion to the same value, and the clamp at 0 applies to Exact exhaustion. An [Enemy](domain-model.md#combat) stores its exhaustion itself, as a whole number, because no rule lowers it.

E.g., an Agent with Exact exhaustion 20.40 has exhaustion 21, so against an `exhaustion_work_start_max` of 20 it is not Fit to start work; an attack that raises its exhaustion by 1 gives it Exact exhaustion 21.40 and exhaustion 22.

## Effective max health and current health

A Combatant's health is kept as what it has lost, so that raising the most it can have never wounds it.

| Combatant | Effective max health |
| --- | --- |
| An Enemy | Its base health. |
| A Serving Agent | Its base health plus what the Agency's [Upgrades](economy-and-upgrades.md#glossary) [add to max health](economy-and-upgrades.md#upgrade-effects). |
| A Terminated Agent | Its Final max health. |

Current health is what is left of it:

```text
current health = effective max health − health lost
```

Health lost changes only through current health: a rule that lowers a Combatant's current health by an amount raises its health lost by that amount, and a rule that raises its current health by an amount lowers its health lost by that amount.

E.g., when the Agency buys an Upgrade that adds 1 to max health, an Agent that has lost 8 goes from current health 22 of 30 to 23 of 31, and an unhurt Agent from 30 of 30 to 31 of 31.

## Effective skill

A Combatant works and fights at its effective skill: its base skill, scaled down by the share of its current health it has lost and by a penalty for each point of exhaustion above a free amount.

```text
penalty factor  = max(0, 100 − p × max(0, exhaustion − f))
effective skill = round down( base skill × current health × penalty factor / (effective max health × 100) )
```

Here p is `skill_penalty_pct_per_exhaustion` and f is `exhaustion_free_points`. The expression is [evaluated exactly](../foundation/numbers.md#exact-evaluation) and [rounded](../foundation/numbers.md#rounding) once, at the end.

E.g., with a p of 2 and an f of 25, a Combatant with base skill 80.5, current health 18 of an effective max health of 24, and exhaustion 45 has the penalty factor `100 − 2 × 20 = 60` and the effective skill `round down(80.5 × 18 × 60 / 2400) = round down(36.225) = 36`.

## Effective weapon damage

A Combatant's effective weapon damage is kept apart from its base weapon damage so that a rule can adjust weapon damage without changing the stored value, as effective skill does for base skill. It is the value around which a Combat rolls the [damage outcome](combat.md#damage-outcome).

| Combatant | Effective weapon damage |
| --- | --- |
| An Enemy | Its base weapon damage. |
| A Serving Agent | Its base weapon damage, except within a Combat in which its Weapon's `ammo_type` [has no round left](combat.md#ammo-in-a-combat). |
| A Terminated Agent | Its Final weapon damage. |

## Effective armor

A Combatant's armor absorbs the damage of hits before its current health does, and it is whole again for every Combat, so it protects an Agent without the lasting wounds that lower its effective skill. Effective armor is the current armor a Combatant [starts every Combat with](combat.md#combat-only-properties).

| Combatant          | Effective armor  |
| ------------------ | ---------------- |
| An Enemy           | Its base armor.  |
| A Serving Agent    | Its base armor.  |
| A Terminated Agent | Its Final armor. |

## Changes to attributes

An Agent's attributes change only through a few named rules, so the cause of every change to them can be traced.

Base skill only rises, through [Training growth](#training-growth) and [Mission growth](#mission-growth). Health lost rises only in a [Combat](combat.md#effects-of-an-attack) and falls only through [Health recovery](agent-recovery.md#health-recovery). Exhaustion rises in a Combat, through [Mission exhaustion](missions.md#mission-exhaustion), and through [Work exhaustion](#work-exhaustion), and falls only through [Exhaustion recovery](agent-recovery.md#exhaustion-recovery). No rule changes an Agent's base health after its creation; its Weapon, base weapon damage, Armor, and base armor change only through [Equipment](equipment.md), e.g. by [equipping](equipment.md#equipping-agents) it. An Upgrade changes no stored value of an Agent.

# Assignments and transit

An Agent's Assignment says what it is doing, and transit is the price of changing it. These rules decide which Agents accept new Assignments and when an Agent starts working on a new Assignment.

## Assignment and Agent status

An Assignment is what a Serving Agent is doing, and its Agent status says how it stands toward that Assignment. The Assignment of a Serving Agent is one of Standby; Contracting; Training; Recovery; an Investigation, with a Mutable reference to that Investigation; and Deployed, with a Mutable reference to the Mission the Agent is Deployed on.

An Agent In transit keeps the Assignment it is travelling to, so transit is not a second Assignment, and an Agent In transit to an Investigation already belongs to its Current team.

## Agents that can take orders

The player can change what an Agent does only once it has arrived at work it is free to leave. An Agent can take orders exactly when all of the following hold:

1. It is Serving.
2. Its Agent status is At assignment.
3. Its Assignment is Standby, Contracting, Training, or an Investigation.

Every [Player action](../foundation/engine-contract.md#player-actions-and-turns) that changes an Agent's Assignment requires that the Agent can take orders. Where such an Agent may go depends on where it is:

- **From base:** an Agent on a [Base Assignment](#assignments) can be given any Assignment the player can give: the other Base Assignment, Contracting, an Investigation, or Deployed.
- **From away:** an Agent on an [Away Assignment](#assignments) can only be recalled, i.e. assigned to Standby.

## Start-work gate

An Agent worn down by work or by a Combat must rest, and heal, before it takes on new work, so that tiredness builds up only as far as the player lets it.

An Agent is Fit to start work exactly when both of the following hold:

1. Its exhaustion is at most `exhaustion_work_start_max`.
2. Its health lost is 0.

Every Player action that gives an Agent a Work Assignment it does not already have requires that the Agent is Fit to start work. No other Player action requires it; e.g., [deploying](missions.md#deploying-agents) an Agent does not.

The gate applies only when the work starts: an Agent already on a Work Assignment keeps working whatever its exhaustion, until it is assigned elsewhere, its Investigation ends, or its [Forced return](#forced-return). E.g., with an `exhaustion_work_start_max` of 20, an Agent on Contracting with exhaustion 35 keeps earning, and once recalled it cannot be given new work until its exhaustion has fallen to 20.

## Assignment changes

An Agent changes what it is doing either because the player assigns it or because an Advance turn moves it, e.g. when its Investigation completes. Each change has one trigger, so no Agent changes what it is doing without a stated cause.

Each state in the table is an Assignment with an Agent status.

| From | To | Trigger |
| --- | --- | --- |
| Standby or Training; At assignment | The other of Standby and Training; At assignment | The player [assigns](#assigning-agents) it. |
| Standby or Training; At assignment | Contracting; In transit | The player [assigns](#assigning-agents) it. |
| Standby or Training; At assignment | An Investigation; In transit | The player [starts an Investigation](investigations.md#starting-an-investigation) with it or [adds it to one](investigations.md#assigning-agents-to-an-investigation). |
| Standby or Training; At assignment | Deployed on a Mission; At assignment | The player [deploys](missions.md#deploying-agents) it. |
| Contracting or an Investigation; At assignment | Standby; In transit | The player recalls it, or it has a [Forced return](#forced-return). |
| Training; At assignment | Standby; At assignment | It has a [Forced return](#forced-return). |
| Any Assignment; In transit | The same Assignment; At assignment, or Recovering when the Assignment is Recovery | It [arrives](#transit-rule). |
| An Investigation; At assignment or In transit | Standby; In transit | The Investigation [completes](investigations.md#completion) or is [interrupted](investigations.md#lead-no-longer-available). |
| Deployed; At assignment | Recovery; In transit | It [survives the Combat](missions.md#resolving-one-mission) of its Mission with current health below its effective max health. |
| Deployed; At assignment | Standby; In transit | It survives the Combat of its Mission with current health equal to its effective max health. |
| Recovery; Recovering | Standby; At assignment | Its current health [reaches its effective max health](agent-recovery.md#health-recovery). |
| Deployed; At assignment | No Assignment; Killed | Its current health [reaches zero](combat.md#killed-and-incapacitated) in the Combat of its Mission. |
| Standby; At assignment | No Assignment; Dismissed | The player [dismisses](economy-and-upgrades.md#dismissing-agents) it. |

Each box of the following diagram is one pair of Assignment and Agent status; Standby and Training form the base, and Contracting and Investigations are away. A Forced return follows the same arrow as recalling the Agent to Standby, or as moving it from Training to Standby.

![Agent Assignment transitions: Standby and Training, the Base Assignments, switch to each other at once and are the only Assignments an Agent can be deployed from; only an Agent on one can be ordered to Contracting or an Investigation, the Away Assignments, and an Agent on an Away Assignment can only be recalled to Standby; every move to or from an Away Assignment passes through In transit for one Advance turn, and an Agent In transit cannot take orders; Deployed and Recovering are left only by an Advance turn; Killed and Dismissed are final](../../../images/diagrams/agent-assignment-transitions.svg)

## Transit rule

Transit is the time an Agent spends travelling to a new Assignment before it starts on it. No GDR supplies a transit duration: every transit takes exactly one Advance turn.

1. **Starting In transit:** Every new Assignment starts In transit, except that an Agent is At assignment at once when it becomes Deployed, when it moves from one [Base Assignment](#assignments) to the other, and when its [Recovery ends](agent-recovery.md#health-recovery) in Standby.
2. **Arrival:** An Agent that is In transit in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of an Advance turn, and that still has the same Assignment, arrives in the Previous turn transit arrivals step of that Advance turn: it becomes At assignment, or Recovering when its Assignment is Recovery. Until then it does not work, fight, or recover, and [arriving is all it does](turn-advancement.md#transit-across-the-steps) in that Advance turn.
3. **Departure:** An Agent that becomes In transit during an Advance turn, including one whose Assignment changes while it is In transit, arrives in the next Advance turn.
4. **Destination ends:** When the Assignment an Agent is In transit to ends, the Agent's Assignment changes as the rule that ends it states, which starts a new transit. E.g., an Agent In transit to an Investigation that the other members complete goes to Standby, In transit, with the rest of the Current team.

# Training growth

A worn-down Agent learns less, so Training pays off in full only for an Agent whose effective skill is not lowered.

In the Training step of every Advance turn, each Working Agent whose Assignment is Training has one named random outcome, the **Training gain** outcome. Its possible values are "gains" and "does not gain". It takes the value "gains" with the [Probability](../foundation/numbers.md#glossary):

```text
training gain Probability = current health × penalty factor / (effective max health × 100)
```

The penalty factor is that of [Effective skill](#effective-skill), so the Probability is the Agent's effective skill divided by its base skill, before rounding. When the outcome is "gains", the Agent gains its [training skill gain](#growth) in base skill:

```text
base skill after = base skill before + training skill gain
```

E.g., an unhurt Agent with a penalty factor of 80 gains with Probability 0.8, and with a base skill of 101.65 and a training skill gain of 1.50 it then has a base skill of 103.15.

# Mission growth

An Agent learns most from the Missions it lives through: every attack it makes or takes teaches it something, and surviving the Mission teaches it more, most of all in its first Missions. A Killed Agent takes what it learned with it, so deploying a veteran improves the odds of a Mission but risks losing its Experience.

When a Mission is [resolved](missions.md#resolving-one-mission), every survivor gains Experience, whether the Mission is Won or Lost, and every point of it gives the survivor one point of base skill:

```text
survival experience = entry n of experience_per_mission_survived, or its last entry when n exceeds the number of entries
Mission experience  = combat experience + survival experience
Experience after    = Experience before + Mission experience
base skill after    = base skill before + Mission experience
```

Here n is the number of Missions in the survivor's Participation history, the resolved Mission included, and the entries of `experience_per_mission_survived` are numbered from 1.

E.g., with the entries 12, 8, and 5, a survivor of its second Mission with a combat experience of 9 has the survival experience 8 and the Mission experience 17, so its Experience and its base skill each rise by 17; its fifth Mission survived gives the survival experience 5.

# Work exhaustion

Work wears an Agent down a little in every Advance turn, so an Agent cannot work without end: it must be rotated to Standby to rest.

In each Advance turn, every Working Agent gains exhaustion in the [Turn advancement step](domain-model.md#turn-advancement-steps) of its work: `exhaustion_per_contracting_turn` in the Agency income step, `exhaustion_per_training_turn` in the Training step, or `exhaustion_per_investigation_turn` in the [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) step. A member of an Investigation that completes in the step gains it too.

The Agent gains it after the step has read the Agent's values for the work itself, so the exhaustion of a work turn never lowers what that turn's work achieves. E.g., an Agent on Contracting with exhaustion 30 earns its full income in the Agency income step and then has exhaustion 31.

## Forced return

An Agent worn down too far stops working on its own, so that tiredness never reaches the point at which a Combat would find the Agent unable to fight.

In the same step, right after an Agent gains exhaustion from its work, the Agent has a Forced return when both of the following hold:

1. Its exhaustion is at least `exhaustion_work_limit`.
2. Its Assignment is still the Work Assignment it worked on; e.g., a member of an Investigation that [completed](investigations.md#completion) in the same step is already on Standby and has no Forced return.

A Forced return [moves the Agent to Standby](#assignment-changes), and an Agent that was on an Investigation [leaves it](investigations.md#leaving-an-investigation).

# Agent creation

Every Agent is created by one rule, whichever rule causes the creation: the [Initial roster](#initial-roster), [hiring](economy-and-upgrades.md#hiring-agents), or [adding Agents](#adding-agents). Any cost, and the [Agent cap](economy-and-upgrades.md#glossary), belong to the rule that causes the creation.

A new Agent has the AgentArchetype as its Archetype, which gives it its [starting values](#agentarchetype), its equipment included; its base weapon damage is the `base_weapon_damage` of its Weapon, and its base armor the `base_armor` of its Armor. Its Agency is the [Campaign](../foundation/core-concepts.md#campaign-and-session)'s Agency, and its Turn hired is the turn number of the current Turn. It starts on Standby, In transit, with Experience 0, health lost 0, Exact exhaustion 0, Enemies killed 0, and an empty Participation history.

## Initial roster

The Agents a Campaign starts with are at hand from its first Turn. The [initial Campaign state](domain-model.md#initial-campaign-state) contains `initial_roster_size` Agents, each [created](#agent-creation) At assignment instead of In transit.

# Assigning Agents

The Player action `player.actions.assignAgents(agents, assignment)` gives every Agent in the list `agents` the Assignment `assignment`, which is `Standby`, `Contracting`, or `Training`.

The action is all-or-nothing. It is rejected as a whole when any listed Agent [cannot take orders or may not go to `assignment` from where it is](#agents-that-can-take-orders), already has `assignment` as its Assignment, or is not [Fit to start work](#start-work-gate) that `assignment` would start, and when the listed Agents would bring the Agency [above a cap](economy-and-upgrades.md#caps-on-assigning-agents).

When the action is accepted, every listed Agent [changes its Assignment](#assignment-changes) at once, within the same Turn, and an Agent that was on an Investigation [leaves it](investigations.md#leaving-an-investigation).

# Adding Agents

The [Player cheat action](../foundation/developer-access.md#player-cheat-actions) `developer.actions.addAgents(count)` adds `count` Agents to the Agency, each [created](#agent-creation) as hiring creates one. Unlike hiring, it spends no money and ignores the [Agent cap](economy-and-upgrades.md#glossary).

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds the following of its Agents, each listed by Instance ID in the order of the Agents in Campaign state:

- **Arrivals:** the Agents that [arrived](#transit-rule) at their Assignment in it.
- **Training:** for each Agent with a Training gain outcome in it, that outcome and the Agent's base skill and exhaustion after its Training step.
- **Forced returns:** each Agent that had a Forced return in it, with the Assignment it was returned from.

The [History entry](../foundation/world-history.md#glossary) of the Turn that the Advance turn ends holds counts instead: the number of Serving Agents in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the Turn-end state of that Turn. Of the Turn-end state, it also holds the number of Serving Agents In transit, the number Recovering, and the number At assignment on each of Standby, Training, Contracting, an Investigation, and Deployed; the effective skill of each Serving Agent, without its Instance ID; and the numbers of Serving Agents whose Assignment is Recovery, whether Recovering or In transit, whose exhaustion is above `exhaustion_work_limit`, and whose exhaustion is above `exhaustion_free_points`.

# Player-visible information

A player plans around what each Agent can do and how worn down it is, so nothing about an Agent is hidden. Every property and every [Derived value](../foundation/core-concepts.md#value-classification) of every Agent, whatever its Agent status, and every property of the AgentArchetype and of AgentParameters, are [Player-visible information](../foundation/engine-contract.md#api-surfaces) from the moment they exist. The Derived values include whether an Agent is In base or Away and whether it meets the [incapacitation condition](combat.md#incapacitation-condition) with its current values.

# TODOs

- TODO (later): Career statistics beyond Participation history and the [Service record](#service-record).
- TODO (later): [Transit](#transit-rule) durations that differ between Assignments.
- TODO (later): Selection among several [AgentArchetypes](#agentarchetype).
