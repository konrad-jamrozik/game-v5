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

Language-independent vocabulary for describing and identifying model data.

| Term        | Definition                                                                                                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type        | A named description of the structure and permitted values of data. A Type may be composed of other Types through properties, collections, unions, or references. Similar to a TypeScript type declaration. |
| Property    | A named component of a structured Type, with an associated Type. Similar to a property in a TypeScript object type.                                                                                        |
| Instance ID | An identifier for one occurrence within a Campaign, unique within a declared identity scope and stable for its lifetime.                                                                                   |

## Game build and Rules

What a version of the game supplies: shared by every Campaign and unchanged during play.

| Term                   | Definition                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rule                   | A declared statement governing game behavior, belonging to exactly one Rule kind; for example, a formula producing a Derived value, a condition permitting a player action, or a statement of when new data is created in a Campaign and with which initial values. |
| Rule kind              | The classification of a Rule by its relationship to Campaign state, determining what a specification stating that Rule must state. The exhaustive Rule kinds are Calculation, Eligibility, Effect, Creation, and Invariant.                                         |
| Ruleset                | The collection of Rules governing a Campaign.                                                                                                                                                                                                                       |
| Game build             | A particular version of the game's data, Ruleset, and executable implementation supplied together.                                                                                                                                                                  |
| Game Data Record (GDR) | Concrete game data supplied by a Game build, conforming to a declared Type and immutable during gameplay; a GDR is never instantiated.                                                                                                                              |

## Campaign and Session contexts

A playthrough, and the runtime context that selects it.

| Term     | Definition                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Campaign | A particular playthrough with its own evolving Campaign state and retained history.                                                                                                        |
| Session  | The runtime context of one running game, from start to exit, holding the selection of at most one Campaign and runtime-only access and execution state. Nothing in a Session is persisted. |

## Campaign state composition

How one Campaign's data divides into components, and which snapshots of it are authoritative.

| Term                   | Definition                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign state         | Data describing one Campaign, including World state and Campaign configuration. History is a subcomponent of World state.                                                                                       |
| World state            | The component of Campaign state describing the simulated world and its progression, composed of Current world state and History, distinct from Campaign configuration.                                          |
| Current world state    | The subcomponent of World state other than History: the simulated world as it stands at the selected history position. After undo, it is the state at that earlier position, not the furthest position reached. |
| Campaign configuration | The component of Campaign state containing campaign-specific parameters that select or adjust gameplay behavior and may be changed through permitted operations during play.                                    |
| History                | The subcomponent of World state containing retained data describing past Campaign state or events. Rules and reports may consult History.                                                                       |

## Campaign state timing

Terms describing when Campaign state is observed, not which part of it.

| Term            | Definition                                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Committed state | Complete Campaign state, including Campaign configuration and all of World state, at an accepted-command boundary rather than during intermediate processing. It describes completeness and timing, not a component; every retained history position is a Committed state. |

## Data and information qualities

Classifications of a value or piece of information, independent of where it lives in Campaign state.

| Term                       | Definition                                                                                                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authoritative value        | A value treated as established truth rather than recomputed from other values.                                                                                                                                                                           |
| Derived value              | A value calculated deterministically from Authoritative values and the current rules and GDRs.                                                                                                                                                           |
| Retained                   | Describes model data kept available for rules, reports, reference resolution, or restoration. Retained describes availability; History describes data about past Campaign state or events. Retention does not establish mutability or a lifecycle state. |
| Player-visible information | Information deliberately exposed by the engine to an ordinary player.                                                                                                                                                                                    |

# Concepts and contract

## Vocabulary and contract ownership

Type and Property describe data independently of a programming language. Rule and Ruleset describe permitted behavior;
Game build supplies shared data and executable implementation. These meanings apply across the complete game contract.
Glossary definitions establish vocabulary without choosing an API, storage representation, or campaign-data composition.
More detailed constraints belong to the specifications using that vocabulary.

## Rule kinds

Every Rule has exactly one Rule kind. Rule kinds exist only because each carries a different contract: the kind
determines what a specification stating the Rule must state. The following table is the exhaustive set of Rule kinds.

| Rule kind   | Relationship to Campaign state                                                | What a specification must state                                                                                                                                | Example                                                                                            |
| ----------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Calculation | Changes nothing; produces a Derived value from Authoritative values and GDRs. | Its inputs and formula. A Calculation Rule never changes Campaign state and never consumes gameplay randomness.                                                | Upkeep for one turn equals the rate multiplied by the serving-agent count.                         |
| Eligibility | Changes nothing; decides whether a player action is permitted.                | The condition, and what the player observes when it fails. A rejected action changes nothing.                                                                  | Illustratively, not a selected gameplay rule: an Agent In transit cannot be assigned to a Mission. |
| Effect      | Changes existing Campaign state.                                              | When it applies, which values change, and by how much.                                                                                                         | Deduct upkeep from Agency money.                                                                   |
| Creation    | Adds new data to Campaign state, identified by a fresh Instance ID.           | When it applies, the Type of the new data, the initial value of each of its properties and the source of each value, and that it receives a fresh Instance ID. | Starting an Investigation creates one with progress 0.                                             |
| Invariant   | Changes nothing; constrains every Committed state.                            | The condition and its scope. A violation is an engine or data defect, not a gameplay outcome.                                                                  | At most one Active Investigation per Lead.                                                         |

A Rule is named after its kind, for example a Calculation Rule or a Creation Rule. One mechanic usually combines
several Rules of different kinds. For example, starting an Investigation combines an Eligibility Rule deciding whether
it may start, a Creation Rule adding the Investigation, and an Effect Rule changing the participating agents' Current
assignments.

Creating data also changes Campaign state, but Creation is separate from Effect because a Creation Rule carries
obligations an Effect Rule does not: a fresh Instance ID, and an initial value with its source for every property of
the new data. [Campaign instance creation](./campaign-modeling-contract.md#campaign-instance-creation) in Campaign
Modeling Contract applies these obligations to all four properties of each new Campaign instance.

### Properties that are not Rule kinds

The following are properties that a Rule of any kind can have, or concerns owned elsewhere. Making any of them a Rule
kind would break the classification of each Rule into exactly one kind. This list is exhaustive for the concerns
deliberately excluded from Rule kinds:

- **Randomness:** whether a Rule consumes gameplay randomness. It is a property, not a kind: only Effect Rules and
  Creation Rules may consume gameplay randomness; Calculation, Eligibility, and Invariant Rules never do.
  [Numbers and Randomness](./numbers-and-randomness.md) owns numeric and random behavior.
- **Timing:** when a Rule applies within a turn. [Turn Resolution](./turn-resolution.md) owns it; a Rule keeps its
  kind whichever phase applies it.
- **Visibility:** what the player may observe about a Rule's inputs and results. [Player Information](../interfaces/player-information.md)
  owns it; it cuts across all kinds.
- **Retention:** which past values must be kept. It is a requirement on data, not a kind of Rule, and is covered by
  [Historical fact preservation](./campaign-modeling-contract.md#historical-fact-preservation) in Campaign Modeling
  Contract.

These links identify owners only; the meanings in this document do not depend on them.

The classification is also deliberately limited in two ways:

- **No finer subdivision:** the five kinds are not subdivided further, for example into random and non-random
  Effects, because a kind exists only where the statements a specification must make differ.
- **No implementation prescription:** Rule kinds do not imply functions, classes, modules, or call order, as
  required by [What belongs in a specification](../governance/spec-conventions.md#what-belongs-in-a-specification).
  They classify what the Engine designer writes down.

## Campaign and Session

Campaign identifies a playthrough; Campaign state describes its data. Session is the runtime context of one running
game: it starts with no selected Campaign when the game starts and ends when the game exits. A Session selects at most
one Campaign at a time and holds runtime-only access and execution state. Nothing in a Session is persisted, and
loading saved data never restores a Session.

Continuation data associated with a Campaign's history, such as its undo and redo positions, belongs with that
Campaign's saved data rather than with the Session. Campaign state excludes interface preferences and controller
continuation data that gameplay Rules do not consult. Session access settings are not gameplay Campaign state: they are runtime-only, while Campaign configuration belongs
to one Campaign and application-wide preferences belong to neither.
Specifications using this vocabulary define the Session's exact contents and the storage of continuation data. This
distinction does not prescribe an internal class layout or save encoding.

## World state and Campaign configuration

Campaign state includes both World state and Campaign configuration. For example, an Investigation's progress is
World state, while a campaign-wide investigation difficulty multiplier is Campaign configuration. Both belong to
the particular Campaign, regardless of which Session selects it. Campaign configuration supplies inputs to Rules;
changing it does not modify the Game build's Ruleset or immutable GDRs.

World state divides into Current world state and History. For example, an Agent's current health is Current world
state, while a record of the missions that Agent took part in is History. History is a subcomponent of World state,
including when it records past Campaign configuration values or changes.
Current Campaign configuration belongs to its own component of Campaign state; historical records about it belong
to History within World state. This conceptual hierarchy does not require a particular storage layout.
Interface preferences that gameplay Rules do not consult remain
outside Campaign state. Mechanics specify permitted configuration changes and when their effects apply.

## Committed state and information

Committed state distinguishes complete Campaign state at accepted-command boundaries from intermediate processing. For
example, the position restored by undo is a Committed state, while values computed partway through Advance turn
processing are not.
Player-visible information describes deliberate ordinary-player exposure. Neither term specifies a particular command,
query schema, or reveal condition.

## Authoritative and Derived values

An Authoritative value is treated as established truth. A Derived value is calculated from Authoritative values and
the current Rules and GDRs. This classification is independent of mutability: shared base health and a recorded
Instance ID can be Authoritative values even though neither changes during gameplay. It is also independent of player
visibility: either kind may be hidden from the player. Caching a current calculation does not change its
classification as a Derived value.

For example, each enemy's current health is an Authoritative value and the enemies' total current health is a Derived
value. With two enemies at health 10, the total is 20; after enemy_1 takes 3 damage, it is 17. Caching the total does
not make it an Authoritative value, and hiding either the individual health or the total from the player does not
change either classification.

# Edge cases and failure behavior

Not applicable — this document defines shared meanings rather than executable operations. Rejection, authorization,
restoration, and storage failures belong to the contracts that specify those operations.

# Acceptance examples

- **Configuration and world:** A Campaign's investigation difficulty multiplier is Campaign configuration; its
  Investigation progress is World state. Both are Campaign state ([World state and Campaign configuration](#world-state-and-campaign-configuration)).
- **History within world:** A retained record of a past difficulty change belongs to History within World state;
  the current difficulty value belongs to Campaign configuration. Both are Campaign state
  ([World state and Campaign configuration](#world-state-and-campaign-configuration)).
- **Session without a Campaign:** Start the game before selecting a playthrough. It is a Session with no selected
  Campaign, not an empty Campaign ([Campaign and Session](#campaign-and-session)).
- **Session not persisted:** Select a Campaign, save it, exit, and start the game again. The new Session has no
  selected Campaign until the save is loaded, and loading restores the Campaign's saved data but none of the earlier
  Session's runtime state ([Campaign and Session](#campaign-and-session)).
- **One mechanic, several Rule kinds:** Starting an Investigation is specified by an Eligibility Rule, a Creation
  Rule, and an Effect Rule on the participating agents' Current assignments; each of these Rules has exactly one Rule
  kind ([Rule kinds](#rule-kinds)).
- **Data and visibility:** An established resource amount is an Authoritative value, while its calculated total is a
  Derived value. Hiding either does not change its classification ([Authoritative and Derived values](#authoritative-and-derived-values)).
