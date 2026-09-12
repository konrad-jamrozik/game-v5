# Modeling Foundations

| Metadata | Value |
| -------- | ----- |
| Spec ID | MOD |
| Status | Draft |
| Scope | Modeling vocabulary, definitions, identity and references, and historical fact preservation |
| Conventions | [Specification conventions](../spec-conventions.md) |
| Review | Batch 1; proposed rules awaiting user review |

## 1. Purpose and boundaries

Define the conventions used to describe the game model. These concepts organize game facts; they are not an additional
set of in-world objects or a required implementation architecture.

**Draft proposal:** requirements were extracted from Domain Model and remain proposed contracts. This document owns
definition/instance boundaries, identity and reference semantics, and the distinction between current calculations and
historical facts. It does not prescribe storage layout, ID-generation algorithms, serialization, or cache implementation.

## 2. Dependencies and terminology

- **Normative:** [Specification conventions](../spec-conventions.md) governs this document.
- **Normative draft:** [Domain Model](domain-model.md) identifies game entities and their structural relationships.
- **Normative draft:** [Engine Contract](engine-contract.md) defines runtime calculation and committed-state guarantees.
- **Design input:** [Game Design Brief](../../game-design-brief.md) supplies deterministic continuation and history requirements.
- **Process:** [Work plan](../work-plan.md) includes this draft in batch 1.
- **Downstream stubs:** [Numbers and Randomness](numbers-and-randomness.md) owns ID generation;
  [History and Persistence](history-and-persistence.md) owns storage/restoration;
  [TypeScript API](../interfaces/typescript-api.md) owns stale client-handle behavior;
  [Player Information](../interfaces/player-information.md) owns visible fields and estimates.
  These stubs do not supply unstated rules.

### Modeling vocabulary

| Term                     | Meaning                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Definition               | Immutable content describing a reusable game concept, such as a lead, mission, faction, enemy, weapon, or upgrade |
| Instance                 | An occurrence or individual with its own identity and evolving campaign facts                    |
| Authoritative fact       | Information needed to resolve play or preserve history, rather than merely a current calculation |
| Derived value            | A deterministic calculation from authoritative facts and the current rules/content               |
| Player observation       | Information deliberately exposed by the engine to an ordinary player                             |
| Committed state          | Complete state before or after an accepted command, not intermediate battle/turn processing      |

## 3. Concepts and contract

### Content and campaign facts

Definitions are shared within the current content catalog; campaign instances refer to them. A purchase or injury
changes campaign facts, not the immutable definition used by other instances. Definition references are resolved against
the current game build; earlier rules, content, and incompatible saved campaigns need not remain supported.

Being a property of a game concept does not make a value derived. Orders are authoritative facts; effective skill is a
calculation. Visibility is independent: an authoritative fact or a calculation can be hidden from the player.

### Authoritative versus derived state

| Authoritative facts to preserve                                    | Derived values                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Turn, RNG state, ID-generation state                               | Labels and presentation formatting                                  |
| Money, funding, upgrade acquisitions                               | Effective capacities and upgrade effects                            |
| Agent attributes, health/fatigue, orders, transit timing facts     | Effective skill, readiness, eligibility, current combat rating      |
| Investigation progress and sampled hidden difficulty               | Team contribution, true completion probability, permitted estimates |
| Investigation completions, mission wins, earned unlock facts       | Discovery, availability, progression summaries                      |
| Faction activity, clocks, suppression, defeat facts                | Visible faction summaries and opportunities                         |
| Mission origin, deadline facts, deployment, outcome, battle result | Current deployment usage and available transport                    |
| Historical inputs/values needed to explain past results            | Charts and aggregates over retained history                         |

The table illustrates the distinction using Domain Model concepts and engine bookkeeping; their owning specs define
their detailed meaning. It does not mandate particular records or a complete serialized schema.

### Historical facts

A historical value is not necessarily a current derived value. Initial mission strength cannot be reconstructed from
post-battle enemy health alone. MOD-004 governs preservation; it does not require every intermediate calculation or
every possible chart to be retained.

## 4. Requirements

**MOD-001 — Definition boundary.** Campaigns must resolve definition references against the current content catalog.
Ordinary gameplay must not mutate definitions. Multiple instances can share a definition without sharing mutable state.

**MOD-002 — Identity.** Entity IDs must be unique across agents, factions, investigations, missions, and enemies in one
committed campaign state and stable during each entity's lifetime. Content references must identify their kind and ID.
Relationships must use explicit references; rules must not parse display names or ID text to discover relationships.

Repeated missions/investigations must have distinct IDs from earlier occurrences. IDs are timeline-scoped: undo restores
the previous ID-generation state, and a discarded future is not another live campaign. NUM owns generation; API owns
stale client-handle behavior.

**MOD-003 — References.** All committed-state references must resolve to the required kind in the same campaign or current
content catalog. Historical references to terminal/archived subjects must remain resolvable. Storage can be compacted
provided required facts remain available; this spec does not mandate full snapshots forever.

**MOD-004 — Historical fact preservation.** Preserve the original inputs or historical value when a rule/report needs
it. Required historical values must not be overwritten with current calculations. This does not require retaining
every intermediate calculation or every possible chart.

### Source basis (informative)

Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited validation file was unmodified in the source
working tree when the original Domain Model draft was prepared.

**Proposed change:** [Invariant validation](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model_utils/validateGameStateInvariants.ts)
derives some relationships from IDs. MOD-002 and DOM-010 require explicit references.

## 5. Edge cases and failure behavior

| Case | Result / owner |
| ---- | -------------- |
| Duplicate entity ID, missing reference, or wrong target kind | Invalid state under MOD-002/003; ENG-004 owns rejection and defect reporting; never infer a replacement by name |
| Subject is terminal or archived | Required historical references still resolve under MOD-003; storage may be compacted without losing required facts |
| Undo discards a later occurrence | IDs are timeline-scoped under MOD-002; restored references must resolve under MOD-003; HIST owns restoration details |
| Current strength differs from battle-start strength | Retain the historical basis required by the result/report under MOD-004 |

## 6. Acceptance examples

These examples use the symbolic content/entity IDs from
[Domain Model fixture A](domain-model.md#a-valid-relationships), not a chosen ID format or balance values.

### Definitions and distinct identities

Given two mission instances referring to M1, each contains distinct enemies referring to E1. Damage to one enemy changes
that instance, not E1 or the other enemy (MOD-001/002; DOM-012). A repeated mission or investigation receives a distinct
identity from an earlier occurrence in the same timeline (MOD-002).

### Invalid identity and references

Each variant independently changes Domain Model fixture A:

| Change | Violation |
| ------ | --------- |
| Give e1 the same ID as a1 | MOD-002 |
| Point a1's investigation reference at nonexistent i9 | MOD-003 |
| Point a1's investigation reference at mission m1 | MOD-003 |
| Omit the kind from a content reference | MOD-002 |

These are invalid structural fixtures. If attempted through a player command, ENG-004 preserves the original state.
Changing a display name does not change explicit relationships (MOD-002).

### Retained history

- Current strength can change while a report's historical starting basis remains preserved (MOD-004).
- Removing a terminated agent from the active roster does not break required historical references (MOD-003).
- Compaction is valid only if required historical facts and resolvable references remain available (MOD-003/004).
- Undo restores earlier identity-generation state and references; an entity in the discarded future is not another
  live campaign entity (MOD-002/003). HIST specifies storage and restoration details.

## 7. Open decisions

| Review decision | Proposed answer | Affected specs |
| --------------- | --------------- | -------------- |
| Unique IDs across all five campaign entity kinds? | Yes; separately identify content references by kind and ID (MOD-002). | NUM, HIST, API |

ID generation, storage, serialization, and stale client-handle behavior remain scheduled work in their owning specs.
The [migration table](domain-model.md#appendix-a-requirement-migration-informative) records the retired DOM IDs.
