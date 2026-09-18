# Modeling Foundations

| Metadata    | Value                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Spec ID     | MODEL                                                                                                            |
| Family      | Foundation                                                                                                       |
| Status      | Draft                                                                                                            |
| Scope       | Modeling vocabulary, definitions/content entries/instances, identity and references, and historical preservation |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                   |
| Review      | Batch 1; proposed rules awaiting user review                                                                     |

# Purpose and boundaries

Define the conventions used to describe the game model. These concepts organize game facts; they are not an additional
set of in-world objects or a required implementation architecture.

**Draft proposal:** requirements were extracted from Domain Model and remain proposed contracts. This document owns
definition/content entry/instance boundaries, identity and reference semantics, and the distinction between current calculations and
historical facts. It does not prescribe storage layout, ID-generation algorithms, serialization, or cache implementation.

# Relationships

- Uses [Domain Model](./domain-model.md)
- Used by [Engine Contract](./engine-contract.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Refined by [Domain Model](./domain-model.md)
- Refined by [History and Persistence](./history-and-persistence.md)
- Refined by [Numbers and Randomness](./numbers-and-randomness.md)

# Glossary

| Term                | Definition                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Definition          | Declares a game concept, for example, analogous to a TypeScript interface. Definitions are immutable during gameplay.   |
| Entity              | A definition that can be instantiated.                                                                                  |
| Instance            | A concrete instantiation of an entity, with its own identity and state.                                                 |
| Instance ID         | An identifier for an instance, stable during its lifetime under MODEL-002. DOM-017 defines the campaign identity scope. |
| Became historical   | A lifecycle transition that retains an instance as history rather than deleting required facts or references.           |
| Content entry       | Immutable game data, for example, a weapon’s name, base damage, and price.                                              |
| Campaign state      | Data describing a particular campaign, for example, its instances, resources, and retained history.                     |
| Authoritative value | A value treated as established truth rather than recomputed from other values.                                          |
| Derived value       | A value calculated deterministically from authoritative values and the current rules and content entries.               |
| Historical          | Describes retained past state or events; does not by itself imply that gameplay rules cannot consult them.              |
| Player observation  | Information deliberately exposed by the engine to an ordinary player                                                    |
| Committed state     | Complete state before or after an accepted command, not intermediate battle/turn processing                             |

# Concepts and contract

## Content and campaign state

Definitions declare concepts; content entries supply game data. The TypeScript analogy does not require classes or constructors
in the implementation. An abstract definition cannot be instantiated directly.

Content references resolve against content entries supplied by the current game build (MODEL-001/003).
Earlier rules, content entries, and incompatible saved campaigns need not remain supported.

Being a property of a game concept does not make a value derived. Orders are authoritative values; effective skill is a
derived value. Visibility is independent: either can be hidden from the player.

## Authoritative versus derived state

Examples of the distinction (not a complete state inventory):

| Authoritative value    | Derived value          |
| ---------------------- | ---------------------- |
| Upgrade acquisitions   | Effective capacity     |
| Agent orders           | Readiness              |
| Investigation progress | Completion probability |

The owning [Domain Model](domain-model.md#concepts-and-contract) and [Engine Contract](engine-contract.md#concepts-and-contract)
define the contract. These examples do not mandate records or a serialized schema.

## Historical values

A historical value is not necessarily a current derived value. Initial mission strength cannot be reconstructed from
post-battle enemy health alone. MODEL-004 governs preservation; it does not require every intermediate calculation or
every possible chart to be retained.

# Requirements

**MODEL-001 — Definition and content boundary.** Gameplay must not modify definitions or content entries.
Campaigns must resolve content references against content entries supplied by the current game build.
Multiple instances can share content entries without sharing mutable instance state.

**MODEL-002 — Identity.** Identity-bearing campaign instances must have IDs that are unique within the identity scope
defined by the Domain Model and stable during each instance's lifetime. Content references must identify their kind and
ID. Relationships must use explicit references; rules must not parse display names or ID text to discover relationships.

Repeated missions/investigations must have distinct IDs from earlier occurrences. IDs are timeline-scoped: undo restores
the previous ID-generation state, and a discarded future is not another live campaign. NUMRNG owns generation; API owns
stale client-handle behavior.

**MODEL-003 — References.** All committed-state instance references must resolve to the required kind in the same campaign;
content references must resolve to the required kind among content entries supplied by the current game build.
References to historical instances, including those in terminal lifecycle states, must remain resolvable. Storage can be compacted
provided required facts remain available; this spec does not mandate full snapshots forever.

**MODEL-004 — Historical fact preservation.** Preserve the original inputs or historical value when a rule/report needs
it. Required historical values must not be overwritten with current calculations. This does not require retaining
every intermediate calculation or every possible chart.

## Evidence basis (informative)

[Game Design Brief](../../game-design-brief.md) supplies the deterministic continuation and history requirements.
Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited validation file was unmodified in the source
working tree when the original Domain Model draft was prepared.

**Proposed change:** [Invariant validation](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model_utils/validateGameStateInvariants.ts)
derives some relationships from IDs. MODEL-002 and DOM-010 require explicit references.

# Edge cases and failure behavior

| Case                                                           | Result / owner                                                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Duplicate instance ID, missing reference, or wrong target kind | Invalid state under MODEL-002/003; ENG-004 owns rejection and defect reporting; never infer a replacement by name        |
| Instance is historical, including terminal lifecycle states    | Required historical references still resolve under MODEL-003; storage may be compacted without losing required facts     |
| Undo discards a later occurrence                               | IDs are timeline-scoped under MODEL-002; restored references must resolve under MODEL-003; HIST owns restoration details |
| Current strength differs from battle-start strength            | Retain the historical basis required by the result/report under MODEL-004                                                |

# Acceptance examples

These examples use the symbolic content/instance IDs from
[Domain Model fixture A](domain-model.md#a-valid-relationships), not a chosen ID format or balance values.

## Content entries and distinct identities

Given two mission instances referring to M1, each contains distinct enemies referring to E1. Damage to one enemy changes
that instance, not E1 or the other enemy (MODEL-001/002; DOM-012/017). A repeated mission or investigation receives a
distinct identity from an earlier occurrence in the same timeline (MODEL-002; DOM-017).

## Invalid identity and references

Each variant independently changes Domain Model fixture A:

| Change                                               | Violation          |
| ---------------------------------------------------- | ------------------ |
| Give e1 the same ID as a1                            | MODEL-002; DOM-017 |
| Point a1's investigation reference at nonexistent i9 | MODEL-003          |
| Point a1's investigation reference at mission m1     | MODEL-003          |
| Omit the kind from a content reference               | MODEL-002          |

These are invalid structural fixtures. If attempted through a player command, ENG-004 preserves the original state.
Changing a display name does not change explicit relationships (MODEL-002).

## Retained history

- Current strength can change while a report's historical starting basis remains preserved (MODEL-004).
- Removing a terminated agent from the active roster does not break required historical references (MODEL-003).
- Compaction is valid only if required historical facts and resolvable references remain available (MODEL-003/004).
- Undo restores earlier identity-generation state and references; an instance in the discarded future is not another
  live campaign instance (MODEL-002/003). HIST specifies storage and restoration details.

# Open decisions

| Review decision                                     | Proposed answer                                                                              | Affected specs    |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------- |
| Unique IDs across all five campaign instance kinds? | Yes; DOM-017 owns the game-specific scope and MODEL-002 owns the general identity semantics. | NUMRNG, HIST, API |

ID generation, storage, serialization, and stale client-handle behavior remain scheduled work in their owning specs.
The [migration table](domain-model.md#appendix-a-requirement-migration-informative) records the retired DOM IDs.
