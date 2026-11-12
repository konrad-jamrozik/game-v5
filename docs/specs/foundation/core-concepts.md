# Core Concepts

| Metadata    | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Spec ID     | CORE                                                                     |
| Family      | Foundation                                                               |
| Status      | Draft                                                                    |
| Audience    | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Conventions | [Specification conventions](../governance/spec-conventions.md)           |

# Overview

This document defines the shared language for the complete game contract, spanning campaign data and engine execution. It
owns the meanings of its glossary terms independently of the contracts that use them. It does not define API authority,
campaign-data composition, Session lifecycle, gameplay mechanics, persistence procedures, or interface behavior.

# Relationships

- Used by [Campaign](../mechanics/campaign.md)
- Used by [Campaign Modeling Contract](./campaign-modeling-contract.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Domain Model](./domain-model.md)
- Used by [Engine Contract](./engine-contract.md)
- Used by [Gameplay Dependency Direction](../guidance/gameplay-dependency-direction.md)
- Used by [History and Persistence](./history-and-persistence.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Numbers and Randomness](./numbers-and-randomness.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [Turn Resolution](./turn-resolution.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

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

A playthrough, its data, and the runtime context that selects it. Campaign Modeling Contract owns how Campaign state
divides into components.

| Term           | Definition                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Campaign       | A particular playthrough with its own evolving Campaign state and retained history.                                                 |
| Campaign state | Data describing one Campaign, including retained data describing its past Campaign state or events.                                 |
| Session        | The runtime context of one running game, holding the selection of at most one Campaign and runtime-only access and execution state. |

## Value classification

Classifications of a value, independent of where it lives in Campaign state.

| Term                | Definition                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Authoritative value | A value treated as established truth rather than recomputed from other values.                 |
| Derived value       | A value calculated deterministically from Authoritative values and the current rules and GDRs. |

# Vocabulary and contract ownership

Type and Property describe data independently of a programming language. Game build supplies shared data and the
executable implementation of game behavior; each specification describes the game behavior it owns in ordinary
specification prose. These meanings apply across the complete game contract. Glossary definitions establish vocabulary
without choosing an API, storage representation, or campaign-data composition. More detailed constraints belong to the
specifications using that vocabulary.

The term Ruleset is intentionally unused in the specifications. It is reserved for future player-facing documentation:
a game encyclopedia that explains the rules of the game to the player by highlighting and rewording important pieces of
the specifications.

# Campaign and Session

Campaign identifies a playthrough; Campaign state describes its data. A Session is the runtime context of one running
game and selects at most one Campaign at a time. The two differ in kind: a Campaign is a playthrough with its own
Campaign state, while a Session is runtime context. A Session is not part of any Campaign, and selecting a Campaign
does not make it part of the Session.
[Campaign lifecycle](./engine-contract.md#campaign-lifecycle) in Engine Contract owns what a Session holds, when it
starts and ends, and what is persisted. This distinction does not prescribe an internal class layout or save encoding.

# Authoritative and Derived values

An Authoritative value is treated as established truth. A Derived value is calculated from Authoritative values and
the current rules and GDRs. This classification is independent of mutability: e.g., shared base health can be an
Authoritative value even though it never changes during gameplay. It is also independent of player
visibility: either kind may be hidden from the player. Caching a current calculation does not change its
classification as a Derived value.

E.g., each enemy's current health is an Authoritative value and the enemies' total current health is a Derived
value. With two enemies at health 10, the total is 20; after enemy_1 takes 3 damage, it is 17. Caching the total does
not make it an Authoritative value, and hiding either the individual health or the total from the player does not
change either classification.

# Acceptance examples

- **Data and visibility:** An established resource amount is an Authoritative value, while its calculated total is a
  Derived value. Hiding either does not change its classification ([Authoritative and Derived values](#authoritative-and-derived-values)).
