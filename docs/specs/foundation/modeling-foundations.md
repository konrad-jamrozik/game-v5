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

- Used by [Domain Model](./domain-model.md)
- Used by [Engine Contract](./engine-contract.md)
- Used by [History and Persistence](./history-and-persistence.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Numbers and Randomness](./numbers-and-randomness.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

| Term                | Definition                                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Definition          | An immutable declaration of a game concept. The umbrella term for entities (can be instantiated) and abstract definitions (cannot be instantiated directly).                              |
| Abstract definition | A definition that cannot be instantiated directly; it describes a shared concept rather than a kind of concrete instance.                                                                 |
| Entity              | A definition that can be instantiated; each instance has its own identity and state. For example, this is similar to a TypeScript class, without requiring classes in the implementation. |
| Instance            | A concrete instantiation of an entity, with its own identity and state.                                                                                                                   |
| Instance ID         | An identifier for an instance, unique within a declared identity scope and stable during its lifetime under MODEL-002.                                                                    |
| Became historical   | A lifecycle transition that retains an instance as history rather than deleting required facts or references.                                                                             |
| Content entry       | Immutable game data, for example, a weapon’s name, base damage, and price.                                                                                                                |
| Campaign state      | Data describing a particular campaign, for example, its instances, resources, and retained history.                                                                                       |
| Authoritative value | A value treated as established truth rather than recomputed from other values.                                                                                                            |
| Derived value       | A value calculated deterministically from authoritative values and the current rules and content entries.                                                                                 |
| Historical          | Describes retained past state or events; does not by itself imply that gameplay rules cannot consult them.                                                                                |
| Player observation  | Information deliberately exposed by the engine to an ordinary player                                                                                                                      |
| Committed state     | Complete state before or after an accepted command, not intermediate battle/turn processing                                                                                               |

# Concepts and contract

## Authoritative versus derived state

Being a property of a game concept does not make a value derived. The glossary defines the distinction;
MODEL-005 governs classification independently of storage and player visibility.

Examples of the distinction (not a complete state inventory):

| Authoritative value    | Derived value           |
| ---------------------- | ----------------------- |
| Recorded acquisitions  | Total acquired quantity |
| Recorded measurements  | Their arithmetic mean   |
| Retained event records | Event count             |

These examples illustrate the glossary distinction without prescribing particular game concepts, records, or a
serialized schema.

## Historical values

A historical value is not necessarily a current derived value. An earlier measurement cannot be reconstructed from
its current replacement alone. MODEL-004 governs preservation; it does not require every intermediate calculation or
every possible chart to be retained.

# Requirements

**MODEL-001 — Definition and content boundary.** Gameplay must not modify definitions or content entries.
Only entities may be instantiated; abstract definitions must not be instantiated directly.
Multiple instances can share content entries without sharing mutable instance state.

**MODEL-002 — Identity.** Identity-bearing campaign instances must have IDs that are unique within their declared
identity scope and stable during each instance's lifetime. A specification using this convention must declare which
instance kinds share an identity scope. Content references must identify their kind and
ID. Relationships must use explicit references; rules must not parse display names or ID text to discover relationships.

Distinct occurrences within an identity scope must have distinct IDs in the same timeline. IDs are timeline-scoped:
a discarded future is not another live campaign. This identity convention does not choose an ID-generation algorithm
or a restoration procedure.

**MODEL-003 — References.** All committed-state instance references must resolve to the required kind in the same campaign;
content references must resolve to the required kind among content entries supplied by the current game build.
References to historical instances, including those in terminal lifecycle states, must remain resolvable. Storage can be compacted
provided required facts remain available; this spec does not mandate full snapshots forever.

**MODEL-004 — Historical fact preservation.** Preserve the original inputs or historical value when a rule/report needs
it. Required historical values must not be overwritten with current calculations. This does not require retaining
every intermediate calculation or every possible chart.

**MODEL-005 — Value classification.** Each specification using these concepts must declare which of its values are
authoritative and which are derived, using the glossary definitions. Caching a current calculation must not change its classification as derived.
Classification must be independent of player visibility: either kind of value may be hidden from the player.
Retaining a past calculation as a historical fact is governed by MODEL-004.

## Evidence basis (informative)

[Game Design Brief](../../game-design-brief.md) supplies the deterministic continuation and history requirements.
Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited validation file was unmodified in the source
working tree when the original Domain Model draft was prepared.

**Proposed change:** [Invariant validation](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model_utils/validateGameStateInvariants.ts)
derives some relationships from IDs. MODEL-002 requires explicit references.

# Edge cases and failure behavior

| Case                                                           | Result / owner                                                                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Duplicate instance ID, missing reference, or wrong target kind | Invalid state under MODEL-002/003; never infer a replacement by name                                                 |
| Instance is historical, including terminal lifecycle states    | Required historical references still resolve under MODEL-003; storage may be compacted without losing required facts |
| A later occurrence belongs only to a discarded future          | IDs are timeline-scoped under MODEL-002; committed references must resolve under MODEL-003                           |
| A current value differs from the retained original value       | Retain the historical basis required by the result/report under MODEL-004                                            |

# Acceptance examples

This local fixture uses instance kinds Record and Container solely to exercise MODEL-001 through MODEL-005.
They are test-only definitions, not additional game concepts. All fixture values and checks below are explicit
acceptance conditions, not an illustrative enumeration.

Declare one shared identity scope for Record and Container. In one campaign, container c1 holds explicit references
to records r1 and r2. Both records refer to the same typed Record content entry C1, whose base value is 10. Their
independent mutable values are initially 10. Record r1 retains an original value of 10 for a historical report.
All IDs are symbolic and impose no implementation format.

## Content entries and distinct identities

Record and Container are entities. A separate abstract definition describing their shared concepts has no direct
instances; adding one would violate MODEL-001.

Changing r1's mutable value to 7 leaves r2's value and C1's base value at 10. The definitions and content entry remain
unchanged (MODEL-001). A new Record occurrence r3 in the same timeline has an ID distinct from c1, r1, and r2 (MODEL-002).

## Value classification

Declare r1's and r2's current mutable values authoritative and their sum derived. Initially the sum is 20; after r1's
value changes to 7, it is 17. Caching that sum leaves it derived. Hiding r1's value and the sum from the player leaves
both classifications unchanged (MODEL-005).

## Invalid identity and references

Each variant independently changes the local fixture:

| Change                                        | Violation |
| --------------------------------------------- | --------- |
| Give r1 the same ID as c1                     | MODEL-002 |
| Point c1's Record reference at nonexistent r9 | MODEL-003 |
| Point c1's Record reference at Container c1   | MODEL-003 |
| Omit the kind from a content reference        | MODEL-002 |

These are invalid structural fixtures. Changing a display name does not change explicit relationships (MODEL-002).

## Retained history

- After r1's current value becomes 7, its retained original value is still 10 (MODEL-004).
- When r1 becomes historical, c1's required reference still resolves to r1 (MODEL-003).
- Compacting r1 is valid only if that reference and the original value of 10 remain available (MODEL-003/004).
- If r3 belongs only to a discarded future, it is not another live campaign instance. The retained timeline's
  references still resolve within that campaign (MODEL-002/003).

# Open decisions

MODEL-001 through MODEL-005 remain proposed rules awaiting review. No additional generic modeling decision is
introduced by this separation. A consuming specification owns its game-specific identity scope and operational
details; neither is needed to interpret the conventions or the local acceptance fixture.
