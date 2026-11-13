# Campaign State

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CSTATE                                                         |
| Family      | Foundation                                                     |
| Status      | Accepted                                                       |
| Audience    | Engine designer, Content designer, Implementer                 |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines campaign-data composition, Campaign instance creation, identity, reference integrity, value classification, and historical preservation. These constraints apply to Campaign state; the engine API is owned elsewhere, e.g. by [Engine Contract](engine-contract.md) and [TypeScript Player API](../interfaces/typescript-api.md).

The Game Design Brief supplies strategic intent; mechanics specifications own detailed gameplay behavior.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Configuration](./configuration.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Domain Model](./domain-model.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Timeline](./timeline.md)
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

## Campaign instances

The composition of each Campaign instance.

| Term              | Definition                                                                                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign instance | A particular occurrence within a Campaign of a declared Type, with Instance ID, an Archetype reference, Constants, and State.                                                                                                                              |
| Instance ID       | The identifier of one Campaign instance, unique within a declared identity scope and stable for the Campaign instance's lifetime. It is a [Campaign-scoped identifier](engine-contract.md#glossary).                                                       |
| Archetype         | A GDR referenced by a Campaign instance, supplying shared characteristics and initial values. It is shared immutable data, never instantiated; the Campaign instance’s Archetype reference is set when the Campaign instance is created and never changes. |
| State             | Values owned by this Campaign instance that may change under gameplay rules. State is specific to this Campaign instance and is distinct from Campaign state, which describes the whole playthrough.                                                       |
| Constants         | Values owned by this Campaign instance that remain fixed for its lifetime. A reference stored in Constants has a fixed target; it does not require the target’s State to remain fixed.                                                                     |

# Campaign data integrity refinement

This document refines [Campaign data integrity](engine-contract.md#campaign-data-integrity),
[Determinism](engine-contract.md#determinism), and
[Committed state integrity](engine-contract.md#committed-state-integrity) in Engine Contract by specifying the
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

# References

References identify a particular target and its expected Type. In Committed state, Campaign instance references must resolve
within the same Campaign; GDR references identify the GDR ID and must resolve against the current Game build.
Required historical references remain resolvable. Relationships must not be inferred from display names or identifier text.

References that can change belong in State; fixed references belong in Constants. Instance ID and the Archetype reference
are separate immutable properties. Reference mutability is independent of the target’s mutability.

# Value classification

Authoritative value and Derived value, including their independence from mutability and player visibility,
are defined in [Authoritative and Derived values](core-concepts.md#authoritative-and-derived-values) in Core Concepts. Each specification using these
concepts must declare which of its values are Authoritative values and which are Derived values. Retaining a past
calculation as a historical fact follows [Historical fact preservation](#historical-fact-preservation).

E.g., each Investigation Campaign instance has a Lead reference property within its Constants property and a lifecycle property
within its State property. The values of these two properties are Authoritative values. The completion count for a
Lead is a Derived value: count the Investigation Campaign instances whose Lead reference property identifies
that Lead GDR and whose lifecycle property has the value Completed. The count for lead_1 is 1 after investigation_2 completes; investigation_1’s Abandoned lifecycle
excludes it. No separate completion record or stored Authoritative completion count is required.

# Historical fact preservation

A past value cannot always be recovered from its current replacement. E.g., a report that needs enemy_1's original
health must retain that value of 10 or the original inputs needed to reconstruct it. Current health of 7 is not a
replacement for that historical fact. When a rule or report needs the historical basis, the original inputs or historical
value must be preserved; required historical values must not be overwritten with current calculations. This does not
require retaining every intermediate calculation or every possible chart.

When a Campaign instance no longer participates in current gameplay, data required by rules, reports, or retained
references must remain in World history rather than being deleted. E.g., if enemy_1 no longer participates in a Mission,
a retained reference to enemy_1 must still resolve. Retention does not introduce a separate lifecycle state or transition
name or require moving data into a separate storage location. Consuming specifications must declare which lifecycle
changes require retention and which data must remain available. The Instance ID and relationships needed to resolve
retained references must be preserved under [Campaign instances](#campaign-instances) and [References](#references).
An evolving collection can contain immutable historical records: e.g., adding a Battle result does not permit rewriting
an earlier retained Battle result.

# Acceptance examples

- **Configuration and world:** A Campaign's investigation difficulty multiplier is Campaign configuration; its
  Investigation progress is World state. Both are Campaign state ([Campaign state composition](#campaign-state-composition)).
- **World history within world:** A retained record of a past difficulty change belongs to World history within World state;
  the current difficulty value belongs to Campaign configuration. Both are Campaign state
  ([Campaign state composition](#campaign-state-composition)).
