# Campaign State

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CSTATE                                                         |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, Content designer, Implementer                 |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines campaign-data composition, Campaign instance creation, identity, reference integrity, value classification, and historical preservation. These constraints apply to Campaign state; the engine API is owned elsewhere, e.g. by [Engine Contract](engine-contract.md) and [TypeScript Player API](../interfaces/typescript-api.md).

The Game Design Brief supplies strategic intent; mechanics specifications own detailed gameplay behavior.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Refines [Determinism and Randomness](./determinism-and-randomness.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Configuration](./configuration.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Domain Model](./domain-model.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Timeline](./timeline.md)
- Used by [Turn Advancement](./turn-advancement.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

Shared modeling and execution vocabulary is owned by [Core Concepts](core-concepts.md#glossary), including Campaign
state. The terms below add campaign-specific composition; Instance ID identity constraints are specified under
[Campaign instance identity](#campaign-instance-identity).

## Campaign state components

The components into which Campaign state divides, and whether model data stays available.

| Term                   | Definition                                                                                                                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| World state            | The component of Campaign state describing the simulated world and its progression, composed of Current world state and World history, distinct from Campaign configuration.                                                                                   |
| Current world state    | The subcomponent of World state other than World history: the simulated world as it stands at the position selected by undo and redo. After undo, it is the state at that earlier position, not the furthest position reached.                                 |
| World history          | The subcomponent of World state containing retained data describing past Campaign state or events, including past Campaign configuration values or changes. Game behavior and reports may consult World history.                                               |
| Campaign configuration | The component of Campaign state containing the campaign-specific parameters that campaign creation sets and that select or adjust gameplay behavior. Each parameter is either adjustable during play through permitted operations or fixed after creation.     |
| Retained               | Describes model data kept available for rules, reports, reference resolution, or restoration. Retained describes availability; World history describes data about past Campaign state or events. Retention does not establish mutability or a lifecycle state. |
| Turn series            | Retained data in World history recording one value at stated moments of every turn of the Campaign, from campaign creation onward, under [Turn series](#turn-series). The specification owning the value declares it.                                          |

## Campaign instances

The composition of each Campaign instance, and Types that Campaign instance Types adopt.

| Term              | Definition                                                                                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign instance | A particular occurrence within a Campaign of a declared Type, with Instance ID, an Archetype reference, Constants, and State.                                                                                                                              |
| Instance ID       | The identifier of one Campaign instance, unique within a declared identity scope and stable for the Campaign instance's lifetime. It is a [Campaign-scoped identifier](determinism-and-randomness.md#glossary).                                            |
| Archetype         | A GDR referenced by a Campaign instance, supplying shared characteristics and initial values. It is shared immutable data, never instantiated; the Campaign instance’s Archetype reference is set when the Campaign instance is created and never changes. |
| State             | Values owned by this Campaign instance that may change under gameplay rules. State is specific to this Campaign instance and is distinct from Campaign state, which describes the whole playthrough.                                                       |
| Constants         | Values owned by this Campaign instance that remain fixed for its lifetime. A reference stored in Constants has a fixed target; it does not require the target’s State to remain fixed.                                                                     |
| Role Type         | A Type that Campaign instance Types can adopt. It states the properties a Campaign instance Type must have to adopt it, and the properties its Campaign instances gain for a stated duration.                                                              |

# Campaign data integrity refinement

This document refines [Determinism](determinism-and-randomness.md#determinism) and
[Unique identifiers](determinism-and-randomness.md#unique-identifiers) in Determinism and Randomness, and
[Committed state integrity](engine-contract.md#committed-state-integrity) in Engine Contract, by specifying the
composition, initialization, identity, reference, and historical-preservation constraints that campaign creation,
committed mutations, and restoration must preserve. It supplies campaign modeling detail without defining API authority
or execution sequencing. Core Concepts supplies the shared vocabulary used to express these constraints.

# Campaign state composition

Campaign state has the following complete conceptual hierarchy. World history is a subcomponent of World state.

```text
Campaign state
├── World state
│   ├── Current world state
│   └── World history
└── Campaign configuration
```

Campaign state includes both World state and Campaign configuration. E.g., an Investigation's progress is
World state, while a campaign-wide investigation difficulty multiplier is Campaign configuration. Both belong to
the particular Campaign, regardless of which Session selects it. Campaign configuration supplies inputs to game
behavior; changing it does not modify the Game build's game behavior or immutable GDRs.

World state divides into Current world state and World history. E.g., an Agent's current health is Current world
state, while a record of the missions that Agent took part in is World history. World history is a subcomponent of World state,
including when it records past Campaign configuration values or changes.
Current Campaign configuration belongs to its own component of Campaign state; historical records about it belong
to World history within World state. This conceptual hierarchy does not require a particular storage layout. What Campaign
state excludes is stated under [Data ownership](engine-contract.md#data-ownership) in Engine Contract.
Each Campaign configuration value is either adjustable during play or fixed after creation. E.g., an investigation
difficulty multiplier can be adjustable during play, while starting money is fixed after creation and remains in
Campaign configuration as the value the Campaign started with. Mechanics specify which class each value has, the
permitted changes to adjustable values, and when their effects apply.

Every Campaign instance is part of World state, never of Campaign configuration. A Campaign instance that participates
in current gameplay is part of Current world state. When a Campaign instance no longer participates in current
gameplay, its data that must remain available is part of World history, under
[Historical fact preservation](#historical-fact-preservation). Placing a Campaign instance in this hierarchy does not
change its four properties under [Campaign instance structure](#campaign-instance-structure).

# Campaign initialization

Campaign initialization receives setup inputs and immutable Game Data Records (GDRs) supplied by the Game build, and
produces the initial Campaign state from them as the specifications owning campaign creation describe. GDRs supply
data; specifications describe calculations and permitted behavior, including which Campaign instances the initial
Campaign state contains, under [Campaign instance creation](#campaign-instance-creation). A GDR is data, not game
behavior. The engine performs every operation: it reads GDRs and carries out the specified game behavior, and a GDR
performs no operation. Exact starting data and balance
values are outside this document's ownership. Session lifecycle and publication of Committed state belong to Engine Contract.

# Campaign instances

## Campaign instance structure

A Campaign instance Type always has exactly four properties: Instance ID, an Archetype reference, Constants, and State.
Every Campaign instance has exactly these four properties. The singleton Agency is not exempt: its Archetype reference
is required like that of any other Campaign instance.

The four-property shape is the ubiquitous language for Campaign instances. It is chosen for uniformity and ease of
reasoning: every Campaign instance is described, compared, and inspected in the same terms. The shape therefore
belongs in this specification under the vocabulary criterion of
[What belongs in a specification](../governance/spec-conventions.md#what-belongs-in-a-specification) and must not be
removed or weakened as an implementation detail.

Developer API full Campaign state inspection presents each Campaign instance as its Instance ID, Archetype reference,
Constants, and State. How an implementation stores Campaign instances internally is the implementer's choice.

## Campaign instance creation

Creation of a Campaign instance, during campaign initialization or gameplay, is specified by the specification that
owns the creating behavior. That specification states when the Campaign instance is created, its Type, and the initial
values of its Archetype reference, Constants, and State, together with the source of each value; e.g., a named GDR or a
value in Campaign state. The initial values need not all come from the Campaign instance's Archetype: the creating
specification may take some of them from another GDR, e.g. one serving the Campaign instance initialization purpose under [Purposes of GDRs](game-data-records.md#purposes-of-gdrs) or a
Referenced GDR (e.g., the Lead GDR supplying an Investigation's hidden difficulty), or from a value in Campaign
state. Every newly created Campaign instance has a fresh Instance ID under
[Campaign instance identity](#campaign-instance-identity). Which code creates Campaign instances, and what that code
receives, is left to the implementer: the creating specification does not state that code, its signature, or its
dependencies. It states the resulting facts instead, e.g. which Campaign instance owns the new one.

## Campaign instance identity

Instance IDs are unique within their explicitly declared scope and stable for the Campaign instance’s lifetime.
Restoration, including undo/redo, preserves identity and immutable facts; uniqueness applies within the Campaign’s current timeline, excluding discarded futures.

## Role Types

A Role Type describes a capability that several Campaign instance Types share; e.g., a Role Type for taking part in
combat, adopted by every Campaign instance Type whose Campaign instances can fight. The specification declaring a
Role Type states all of the following:

- **Adoption condition:** the exhaustive set of properties a Campaign instance Type must have to adopt the Role Type.
- **Adopters:** the exhaustive set of Campaign instance Types that adopt it.
- **Gained properties:** the properties that every Campaign instance of an adopting Campaign instance Type gains for
  a stated duration, when the Role Type has any, and when that duration begins and ends.

Adopting a Role Type creates no Campaign instance and no Instance ID, and adds no fifth property under
[Campaign instance structure](#campaign-instance-structure). The properties named by the adoption condition are
ordinary properties of the adopting Campaign instance Type and persist like any other. Gained properties belong to
the Campaign instance that gains them and exist only for the stated duration. A Role Type has no Campaign instances
of its own, so nothing references a Role Type's occurrence; references target the adopting Campaign instance.

# References

References identify a particular target and its expected Type. In Committed state, Campaign instance references must resolve
within the same Campaign; GDR references identify the GDR ID and must resolve against the current Game build.
Required historical references remain resolvable. Relationships must not be inferred from display names or identifier text.

References that can change belong in State; fixed references belong in Constants. Instance ID and the Archetype reference
are separate immutable properties. Reference mutability is independent of the target’s mutability.

# Value classification

Authoritative value and Derived value, including their independence from mutability and player visibility,
are defined in [Authoritative and Derived values](core-concepts.md#authoritative-and-derived-values) in Core Concepts. The way a specification
defines a value determines its classification, as Core Concepts states; a specification makes no separate
declaration of it. The classification states game behavior, not storage: a Derived value follows the Authoritative
values its formula uses, while an Authoritative value changes only when game behavior changes it. What an
implementation stores is the implementer's choice. A past calculation retained as a historical fact is an Authoritative value and
follows [Historical fact preservation](#historical-fact-preservation).

E.g., each Investigation Campaign instance has a Lead reference property within its Constants property and a lifecycle property
within its State property. The values of these two properties are Authoritative values. The completion count for a
Lead is a Derived value: count the Investigation Campaign instances whose Lead reference property identifies
that Lead GDR and whose lifecycle property has the value Completed. The count for lead_1 is 1 after investigation_2 completes; investigation_1’s Abandoned lifecycle
excludes it. Campaign state has no separate completion record and no Authoritative completion count.

# Historical fact preservation

A past value cannot always be recovered from its current replacement. E.g., a report that needs enemy_1's original
health must retain that value of 10 or the original inputs needed to reconstruct it. Current health of 7 is not a
replacement for that historical fact. When a rule or report needs the historical basis, the original inputs or historical
value must be preserved; required historical values must not be overwritten with current calculations. This does not
require retaining every intermediate calculation or every possible chart. The values that a chart or a comparison
across turns needs are retained exactly where a specification declares a Turn series, under
[Turn series](#turn-series).

When a Campaign instance no longer participates in current gameplay, data required by rules, reports, or retained
references must remain in World history rather than being deleted. E.g., if enemy_1 no longer participates in a Mission,
a retained reference to enemy_1 must still resolve. Retention does not introduce a separate lifecycle state or transition
name or require moving data into a separate storage location. Consuming specifications must declare which lifecycle
changes require retention and which data must remain available. The Instance ID and relationships needed to resolve
retained references must be preserved under [Campaign instances](#campaign-instances) and [References](#references).
An evolving collection can contain immutable historical records: e.g., adding a Battle result does not permit rewriting
an earlier retained Battle result.

# Turn series

A Turn series keeps the past values of one value available for the whole Campaign, so that game behavior and reports
can use them long after the value has changed; e.g., a chart of money over the last 200 turns. Such past values cannot
be recovered from the current value, so they are retained in World history under
[Historical fact preservation](#historical-fact-preservation).

A Turn series follows these complete rules:

- **Declared by the owner of the value:** A value has a Turn series only when the specification owning that value
  declares one. The declaration states the value and the moments of each turn at which it is recorded; e.g., at the
  start of each turn and at the end of each turn. No other specification declares a Turn series for that value.
- **One recorded value for each moment:** For every turn of the Campaign and every declared moment of it that the
  Campaign has reached, the Turn series holds exactly one recorded value: the value as it was at that moment.
- **Kept from campaign creation:** A Turn series starts at campaign creation and is never shortened. It has no limit on
  the number of turns it covers, and its recorded values are never removed, merged, or replaced by a summary.
- **Recorded values are historical facts:** A recorded value is an Authoritative value, including when the value it
  records is a Derived value. It is never recomputed from current Campaign state.
- **Moments within the current turn:** A declaration may name a moment that is not yet final while the turn is in
  progress; e.g., the number of upgrades purchased during the turn so far. The recorded value for the current turn is
  then the value in the current Committed state, and it becomes final when the turn ends.
- **Part of Campaign state:** A Turn series is World history, so every Campaign save holds it in full, and restoration
  restores it together with the rest of Campaign state. After undo, redo, or load, each Turn series holds exactly the
  recorded values of the restored Committed state.

Which Turn series are Player-visible information, and how the Player API returns them, is owned by
[Player Information](../interfaces/player-information.md). A specification describing a chart names the Turn series
the chart shows and declares none itself.

# Acceptance examples

- **Configuration and world:** A Campaign's investigation difficulty multiplier is Campaign configuration; its
  Investigation progress is World state. Both are Campaign state ([Campaign state composition](#campaign-state-composition)).
- **World history within world:** A retained record of a past difficulty change belongs to World history within World state;
  the current difficulty value belongs to Campaign configuration. Both are Campaign state
  ([Campaign state composition](#campaign-state-composition)).
- **A Turn series covers the whole Campaign:** A specification declares a Turn series of money at the end of each
  turn. In turn 205 the Turn series holds 204 recorded values, one for each of turn 1 to turn 204, and each equals the
  money the Campaign had when that turn ended. Saving and loading the Campaign keeps all 204
  ([Turn series](#turn-series)).
- **Undo restores a Turn series:** A specification declares a Turn series of the upgrades purchased during each turn.
  In one turn the player purchases 7 upgrades, and the recorded value for that turn is 7. The player undoes 2 of the
  purchases: the recorded value is 5, and the recorded values of earlier turns are unchanged. Redoing both purchases
  makes it 7 again ([Turn series](#turn-series)).
