# Core Concepts

| Metadata    | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Spec ID     | CORE                                                                     |
| Family      | Foundation                                                               |
| Status      | Accepted                                                                 |
| Audience    | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Conventions | [Specification conventions](../governance/spec-conventions.md)           |

# Overview

This document defines the shared language for the complete game contract, spanning campaign data and engine execution. It
owns the meanings of its glossary terms independently of the contracts that use them. The behavior and structure those
terms describe are owned by the specifications that use them, e.g. [Engine Contract](./engine-contract.md) and the
[Mechanics family](../mechanics/about-mechanics.md).

# Relationships

- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Autopilot](./autopilot.md)
- Used by [Campaign Lifecycle](./campaign-lifecycle.md)
- Used by [Campaign State](./campaign-state.md)
- Used by [Combat](../mechanics/combat.md)
- Used by [Configuration](./configuration.md)
- Used by [Determinism and Randomness](./determinism-and-randomness.md)
- Used by [Developer Access](./developer-access.md)
- Used by [Domain Model](./domain-model.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Engine Contract](./engine-contract.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)
- Used by [Investigations](../mechanics/investigations.md)
- Used by [Leads and Progression](../mechanics/leads-and-progression.md)
- Used by [Missions](../mechanics/missions.md)
- Used by [Panic and Endings](../mechanics/panic-and-endings.md)
- Used by [Saves](./saves.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Timeline](./timeline.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

## Data modeling

Language-independent vocabulary for describing model data.

| Term     | Definition                                                                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type     | A named description of the structure and permitted values of data. A Type may be composed of other Types through properties, collections, unions, or references. Similar to a TypeScript type declaration. |
| Property | A named component of a structured Type, with an associated Type. Similar to a property in a TypeScript object type.                                                                                        |

## Game build and content

What a version of the game supplies: shared by every Campaign and unchanged during play.

| Term                   | Definition                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Game build             | A particular version of the game's data and of the executable implementation of its game behavior, supplied together.                  |
| Game Data Record (GDR) | Concrete game data supplied by a Game build, conforming to a declared Type and immutable during gameplay; a GDR is never instantiated. |

## Campaign and Session

A playthrough, its data, and the runtime context that selects it. Campaign State owns how Campaign state
divides into components.

| Term           | Definition                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Campaign       | A particular playthrough with its own evolving Campaign state.                                                                      |
| Campaign state | Data describing one Campaign, including retained data describing its past Campaign state or events.                                 |
| Session        | The runtime context of one running game, holding the selection of at most one Campaign and runtime-only access and execution state. |

## Value classification

Classifications of a value, whether a GDR or Campaign state supplies it.

| Term                | Definition                                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authoritative value | A value that a GDR supplies, or a value of Campaign state that specifications define by its initial value and the changes game behavior makes to it, rather than by a formula over other values.      |
| Derived value       | A value that specifications define by a formula over the Authoritative values of one Campaign state and of GDRs. It always equals that formula applied to the Campaign state as it is at that moment. |

# Vocabulary and contract ownership

Type and Property describe data independently of a programming language. Game build supplies shared data and the
executable implementation of game behavior; each specification describes the game behavior it owns in ordinary
specification prose. These meanings apply across the complete game contract. Glossary definitions establish vocabulary
without choosing an API, storage representation, or campaign-data composition. More detailed constraints belong to the
specifications using that vocabulary.

# Campaign versus Session

Campaign identifies a playthrough; Campaign state describes its data. A Session is the runtime context of one running
game and selects at most one Campaign at a time. The two differ in kind: a Campaign is a playthrough with its own
Campaign state, while a Session is runtime context. A Session is not part of any Campaign, and selecting a Campaign
does not make it part of the Session.
[Campaign Lifecycle](./campaign-lifecycle.md) owns when a Session starts and ends and how it selects a Campaign, and
[Data ownership](./engine-contract.md#data-ownership) in Engine Contract owns what a Session holds and what is persisted. This distinction does not prescribe an internal class layout or save encoding.

# Authoritative and Derived values

The classification states how specifications define a value. An Authoritative value is a value that a GDR supplies,
or a value of Campaign state defined by its initial value and the changes game behavior makes to it. A Derived value
is defined by a formula over the Authoritative values of one Campaign state and of GDRs.

The formula of a Derived value uses only one Campaign state, as it is at one moment. It never uses an earlier
Campaign state or the commands that led to the current one. The game is deterministic, so replaying a Campaign's
commands from its start would reproduce every value; that does not make a value a Derived value. E.g., an Agent's
skill is an Authoritative value although replaying the Campaign would reproduce it, because no formula over the
current Campaign state defines it.

The classification has the following complete set of consequences:

- **A Derived value follows its inputs:** whenever an Authoritative value its formula uses changes, the Derived value
  changes with it, without any rule stating so. E.g., total upkeep is the upkeep rate times the number of serving
  Agents, so it rises as soon as an Agent is hired.
- **An Authoritative value changes only when game behavior changes it:** it does not follow the values it was once
  calculated from. E.g., an unlock recorded as earned remains earned after the condition that earned it stops
  holding. Game behavior changes only the Authoritative values that the specification describing it states it
  changes; every other Authoritative value keeps its value.
- **Campaign state consists of Authoritative values:** a Derived value adds no information to Campaign state, so two
  Campaign states are equal exactly when their Authoritative values are equal.

Which values are Authoritative values and which are Derived values is the Engine designer's decision, because the
first two consequences are observable game behavior. When several values determine one another, e.g. maximum health,
current health, and damage taken, the specification owning them chooses which are Authoritative values and defines
the others as Derived values. The choice decides what the player observes. E.g., current health always equals
maximum health minus damage taken, and a level-up raises maximum health by 5. When maximum health and damage taken
are the Authoritative values, current health rises by 5; when maximum health and current health are the
Authoritative values, current health keeps its value and damage taken rises by 5.

The way a specification defines a value determines its classification, so a specification needs no separate
statement of it: a value defined by a formula over the current Campaign state and GDRs is a Derived value, and a
value defined by its initial value and the changes game behavior makes to it is an Authoritative value. The
classification does not state what an implementation stores; e.g., an implementation may keep a calculated copy of a
Derived value, provided no observable result differs.

The classification is independent of mutability: e.g., a GDR's shared base health is an Authoritative value even
though it never changes during gameplay. It is also independent of player visibility: either kind may be hidden from
the player.

E.g., each enemy's current health is an Authoritative value and the enemies' total current health is a Derived
value. With two enemies at health 10, the total is 20; after enemy_1 takes 3 damage, it is 17. Hiding either the
individual health or the total from the player does not change either classification.

# Acceptance examples

- **Data and visibility:** An established resource amount is an Authoritative value, while its calculated total is a
  Derived value. Hiding either does not change its classification ([Authoritative and Derived values](#authoritative-and-derived-values)).
