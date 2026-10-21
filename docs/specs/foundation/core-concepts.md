# Core Concepts

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CORE                                                           |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define the shared language for the complete game contract, spanning campaign data and engine execution. This document
owns the meanings of its glossary terms independently of the contracts that use them. It does not define API authority,
campaign-data composition, gameplay mechanics, persistence procedures, or interface behavior.

- Used by [Campaign](../mechanics/campaign.md) for Campaign state, World state, and Campaign configuration meanings applied to adjustable campaign parameters.
- Used by [Campaign Modeling Contract](./campaign-modeling-contract.md) for shared modeling vocabulary and value meanings applied to campaign-data constraints.
- Used by [Developer API](../interfaces/developer-api.md) for Campaign state and Authoritative value meanings used in full-state inspection.
- Used by [Domain Model](./domain-model.md) for Type, Campaign state, Instance ID, and immutable-data meanings used to describe game concepts.
- Used by [Engine Contract](./engine-contract.md) for Campaign, Session, Game build, identity, and information meanings used in execution guarantees.
- Used by [History and Persistence](./history-and-persistence.md) for Session, Campaign state, History, and Committed state meanings used in storage and restoration.
- Used by [Initial Campaign Content](../content/initial-campaign.md) for Type, GDR, and Game build meanings used to describe starting data.
- Used by [Numbers and Randomness](./numbers-and-randomness.md) for Rule, numeric value classification, and Instance ID meanings used in numeric contracts.
- Used by [Player Information](../interfaces/player-information.md) for Player-visible information and value meanings used in query schemas.
- Used by [Terminal CLI](../interfaces/cli.md) for Session and shared execution meanings used in terminal workflows.
- Used by [Turn Resolution](./turn-resolution.md) for Rule, Campaign state, and Committed state meanings used in phase scheduling.
- Used by [TypeScript Player API](../interfaces/typescript-api.md) for Type, Instance ID, Session, and committed-data meanings used in public signatures.
- Used by [Web UI](../interfaces/web-ui.md) for Session and shared execution meanings used in browser workflows.

# Relationships

- Used by [Campaign](../mechanics/campaign.md)
- Used by [Campaign Modeling Contract](./campaign-modeling-contract.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Domain Model](./domain-model.md)
- Used by [Engine Contract](./engine-contract.md)
- Used by [History and Persistence](./history-and-persistence.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Numbers and Randomness](./numbers-and-randomness.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [Turn Resolution](./turn-resolution.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

| Term                       | Definition                                                                                                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type                       | A named description of the structure and permitted values of data. A Type may be composed of other Types through properties, collections, unions, or references. Similar to a TypeScript type declaration.                                               |
| Property                   | A named component of a structured Type, with an associated Type. Similar to a property in a TypeScript object type.                                                                                                                                      |
| Campaign                   | A particular playthrough with its own evolving Campaign state and retained history.                                                                                                                                                                      |
| Session                    | An execution context that owns selection of a Campaign, its Campaign state, history navigation, and controller continuation data associated with that history.                                                                                           |
| Rule                       | A declared statement governing a calculation or valid game behavior; for example, a formula or constraint.                                                                                                                                               |
| Ruleset                    | The collection of Rules governing a Campaign.                                                                                                                                                                                                            |
| Game build                 | A particular version of the game's data, Ruleset, and executable implementation supplied together.                                                                                                                                                       |
| Game Data Record (GDR)     | Concrete game data supplied by a Game build, conforming to a declared Type and immutable during gameplay; a GDR is never instantiated.                                                                                                                   |
| Campaign state             | Data describing one Campaign, including World state and Campaign configuration. History is a subcomponent of World state.                                                                                                                                |
| World state                | The component of Campaign state describing the simulated world and its progression, including History as a subcomponent, distinct from Campaign configuration.                                                                                           |
| Campaign configuration     | The component of Campaign state containing campaign-specific parameters that select or adjust gameplay behavior and may be changed through permitted operations during play.                                                                             |
| Instance ID                | An identifier for one occurrence within a Campaign, unique within a declared identity scope and stable for its lifetime.                                                                                                                                 |
| Authoritative value        | A value treated as established truth rather than recomputed from other values.                                                                                                                                                                           |
| Derived value              | A value calculated deterministically from Authoritative values and the current rules and GDRs.                                                                                                                                                           |
| History                    | The subcomponent of World state containing retained data describing past Campaign state or events. Rules and reports may consult History.                                                                                                                |
| Retained                   | Describes model data kept available for rules, reports, reference resolution, or restoration. Retained describes availability; History describes data about past Campaign state or events. Retention does not establish mutability or a lifecycle state. |
| Committed state            | Complete Campaign state before or after an accepted command, not intermediate processing.                                                                                                                                                                |
| Player-visible information | Information deliberately exposed by the engine to an ordinary player.                                                                                                                                                                                    |

# Concepts and contract

## Vocabulary and contract ownership

Type and Property describe data independently of a programming language. Rule and Ruleset describe permitted behavior;
Game build supplies shared data and executable implementation. These meanings apply across the complete game contract.
Glossary definitions establish vocabulary without choosing an API, storage representation, or campaign-data composition.
More detailed constraints belong to the specifications using that vocabulary.

## Campaign and Session

Campaign identifies a playthrough; Campaign state describes its data. Session identifies the execution context that
selects a Campaign and retains the continuation data associated with its history. A Session can exist with no selected
Campaign. Campaign state excludes interface preferences and controller continuation data that gameplay Rules do not
consult. Session access settings are not gameplay Campaign state. This distinction does not prescribe an internal class
layout or save encoding.

## World state and Campaign configuration

Campaign state includes both World state and Campaign configuration. For example, an Investigation's progress is
World state, while a campaign-wide investigation difficulty multiplier is Campaign configuration. Both belong to
the particular Campaign, regardless of which Session selects it. Campaign configuration supplies inputs to Rules;
changing it does not modify the Game build's Ruleset or immutable GDRs.

History is a subcomponent of World state, including when it records past Campaign configuration values or changes.
Current Campaign configuration belongs to its own component of Campaign state; historical records about it belong
to History within World state. This conceptual hierarchy does not require a particular storage layout.
Interface preferences that gameplay Rules do not consult remain
outside Campaign state. Mechanics specify permitted configuration changes and when their effects apply.

## Committed state and information

Committed state distinguishes complete Campaign state at accepted-command boundaries from intermediate processing.
Player-visible information describes deliberate ordinary-player exposure. Neither term specifies a particular command,
query schema, or reveal condition. Authoritative value and Derived value distinguish established facts from calculations;
that distinction is independent of mutability and visibility.

# Edge cases and failure behavior

Not applicable — this document defines shared meanings rather than executable operations. Rejection, authorization,
restoration, and storage failures belong to the contracts that specify those operations.

# Acceptance examples

- **Configuration and world:** A Campaign's investigation difficulty multiplier is Campaign configuration; its
  Investigation progress is World state. Both are Campaign state ([World state and Campaign configuration](#world-state-and-campaign-configuration)).
- **History within world:** A retained record of a past difficulty change belongs to History within World state;
  the current difficulty value belongs to Campaign configuration. Both are Campaign state
  ([World state and Campaign configuration](#world-state-and-campaign-configuration)).
- **Session without a Campaign:** Open an execution context before selecting a playthrough. It is a Session with no
  selected Campaign, not an empty Campaign ([Campaign and Session](#campaign-and-session)).
- **Data and visibility:** An established resource amount is an Authoritative value, while its calculated total is a
  Derived value. Hiding either does not change its classification ([Committed state and information](#committed-state-and-information)).
