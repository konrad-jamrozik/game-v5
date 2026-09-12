# Artifact Relationships

| Metadata    | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Spec ID     | REL                                                                             |
| Status      | Draft                                                                           |
| Scope       | Relationship terminology, direction, artifact inventories, and graph validation |
| Conventions | [Specification Conventions](spec-conventions.md)                                |
| Review      | Proposed contract; terminology and examples awaiting review                     |

# Purpose and boundaries

Define how specifications, requirements, implementations, tests, and other artifacts describe their relationships.
Every relationship runs from a Dependency to a Dependent and has one of five kinds: `follows`, `refines`, `uses`,
`implements`, or `verifies`.

This specification owns the relationship model. Specification Conventions owns the required specification layout and
the implicit relationships that apply to registered specifications. A relationship does not change an artifact's
status, accept a proposed rule, prove that an implementation is correct, or report a passing test run.

**Draft proposal:** the numbered requirements are proposed rules. Illustrative examples explain the model; they do not
declare relationships for the named artifacts.

# Relationships

## Dependencies

Only [implicit dependencies](spec-conventions.md#implicit-relationships).

## Dependents

| Dependent                                        | Relationship | Scope                                         |
| ------------------------------------------------ | ------------ | --------------------------------------------- |
| [Specification Conventions](spec-conventions.md) | `uses`       | Relationship terminology and inventory format |

# Glossary

| Term                  | Definition                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artifact              | An identified [specification](spec-conventions.md#glossary), [requirement](spec-conventions.md#glossary), implementation, test, or other item that can participate in a relationship |
| Relationship          | A directional connection from one Dependency to one Dependent with a relationship kind and scope                                                                                     |
| Dependency            | The artifact on which the Dependent relies; it appears on the left of `Dependency → Dependent`                                                                                       |
| Dependent             | The artifact that relies on the Dependency; it appears on the right of `Dependency → Dependent`                                                                                      |
| Relationship kind     | Exactly one of `follows`, `refines`, `uses`, `implements`, or `verifies`                                                                                                             |
| Scope                 | The specific subject covered by a relationship, including requirement IDs when available                                                                                             |
| Explicit relationship | A relationship recorded in mirrored Dependencies and Dependents entries                                                                                                              |
| Implicit relationship | A relationship created by an applicability rule in Specification Conventions rather than repeated artifact entries                                                                   |
| Relationships section | An artifact's Dependencies and Dependents entries                                                                                                                                    |
| Graph                 | A collection of artifacts and relationships                                                                                                                                          |
| Cycle                 | A directional relationship path that returns to its starting artifact                                                                                                                |
| DAG                   | A directed acyclic graph                                                                                                                                                             |
| Implementation        | An executable artifact intended to satisfy a specification or requirement                                                                                                            |

# Concepts and contract

## Direction

Every relationship is read as **Dependency → Dependent**.

If A depends on B, B is the Dependency and A is the Dependent. The relationship runs `B → A`. Dependency and Dependent
are the only terms for the two participating artifacts in this model.

## Relationship kinds

Each kind describes how the Dependent relates to the Dependency.

| Relationship kind | Meaning                                                                                     | Permitted artifacts                                                                                                   | Illustrative example                               |
| ----------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `follows`         | The Dependent conforms to the Dependency's document structure, lifecycle, or writing rules  | Document → document governed by those rules                                                                           | Specification Conventions → Agents                 |
| `refines`         | The Dependent adds detail to the Dependency while preserving its constraints                | Specification or requirement → refining specification                                                                 | Domain Model → Agents                              |
| `uses`            | The Dependent relies on meaning or rules supplied by the Dependency within the stated scope | Any suitable artifacts                                                                                                | Modeling Foundations → Engine Contract             |
| `implements`      | The Dependent executable artifact provides behavior intended to satisfy the Dependency      | Specification or requirement → implementation                                                                         | Engine Contract → identified engine implementation |
| `verifies`        | The Dependent test or scenario specifies or performs checks of the Dependency               | Specification or requirement → [test scenario](testing/campaign-integration-and-acceptance-tests.md#glossary) or test | ENG-004 → identified restoration test              |

Merely consuming a result is `uses`, not `refines`. An implementation can `implement` a specification; a specification
does not implement its implementation. A test can `verify` a requirement without asserting that the test currently
passes.

## Relationship graphs

The `follows` graph and the `refines` graph must each be a DAG. Writing rules must not govern each other through a
cycle, and refinements must not form a cycle of increasingly detailed definitions.

The `uses` graph may contain cycles when each relationship identifies a distinct supplied meaning and no definition
depends circularly on itself. The `implements` and `verifies` graphs are acyclic under their permitted-artifact rules.
A graph combining different relationship kinds need not be acyclic.

## Specification inventories

Every registered specification has a top-level Relationships section containing exactly two directional categories:
Dependencies and Dependents.

Dependencies use this format:

| Dependency | Relationship | Scope |
| ---------- | ------------ | ----- |

Dependents use this format:

| Dependent | Relationship | Scope |
| --------- | ------------ | ----- |

The specification containing a Dependencies entry is the Dependent. The specification containing the matching
Dependents entry is the Dependency. Each explicit relationship must appear in both places with the same relationship
kind and scope. Relative links may differ while resolving to the same artifacts.

When a Dependencies section has no explicit entries, it must contain exactly:

> Only [implicit dependencies](spec-conventions.md#implicit-relationships).

When explicit Dependencies entries exist, show only their table. When a Dependents section has no explicit entries but
implicit dependents apply, it must contain exactly:

> Only [implicit dependents](spec-conventions.md#implicit-relationships).

Otherwise an empty Dependents section contains `None.`. Do not mention implicit relationships alongside explicit
entries.

Specification Conventions defines every implicit relationship and its applicability. Implicit relationships are not
repeated as mirrored entries. A link, citation, review order, or folder location does not create a relationship.

# Requirements

**REL-001 — Canonical model.** Every relationship must use the canonical terms Artifact, Relationship, Dependency,
Dependent, Relationship kind, and Scope as defined by the Glossary. Each relationship must use exactly one of the five
relationship kinds and satisfy its permitted-artifact rules.

**REL-002 — Identity and scope.** Every explicit relationship must identify one Dependency, one Dependent, one
relationship kind, and a precise scope. Use requirement IDs when available. An artifact link alone must not imply
reliance on every rule in that artifact. Exact duplicates are invalid.

**REL-003 — Direction.** Every relationship must run `Dependency → Dependent`. The Dependent `follows`, `refines`,
`uses`, `implements`, or `verifies` the Dependency. Do not reverse the relationship when presenting it in the other
artifact's Relationships section. Do not enumerate a transitive relationship unless it also exists directly. An
artifact must not depend on itself.

**REL-004 — Two-category inventories.** Every registered specification must contain Dependencies and Dependents under
its top-level Relationships section. Use the required columns, exact implicit-only sentences, and `None.` only where
permitted. Do not add other directional categories.

**REL-005 — Mirrored explicit relationships.** Every explicit Dependencies entry must have one matching Dependents
entry. The pair must resolve to the same artifacts and preserve the relationship kind and scope. Implicit relationships
are defined centrally and are not mirrored.

**REL-006 — Relationship updates.** Adding, changing, or removing an explicit relationship must update both entries.
A missing or disagreeing entry is a documentation defect. Changes must preserve rule ownership and requirement
traceability.

**REL-007 — Graph validity.** Validate each relationship-kind graph separately. Reject cycles in `follows` and
`refines`, invalid artifacts, and self-relationships. A `uses` cycle must identify distinct supplied meanings and must
not leave a circular definition unresolved. A cycle containing different relationship kinds is not by itself a defect.

**REL-008 — Status and evidence.** A relationship must not promote a Stub or Draft to Accepted. A refinement must
preserve the Dependency's constraints. An `implements` or `verifies` relationship must not be presented as evidence
that implementation is complete or tests pass.

**REL-009 — Adoption.** New and existing registered specifications must use the two-category format and applicable
implicit relationships. Before acceptance, resolve relationship TODOs that affect the contract, verify mirrored entries,
check links, and validate the graphs. Do not invent implementation or test relationships for planned artifacts.

# Edge cases and failure behavior

| Case                                          | Required result                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A depends on B                                | Record `B → A`; B is the Dependency and A is the Dependent                                       |
| Two kinds connect the same artifacts          | Keep both when their scopes are distinct                                                         |
| Only implicit dependencies apply              | Link the applicable implicit dependencies; do not write `None.`                                  |
| Explicit dependencies exist                   | Show only the explicit table; do not mention implicit dependencies beside it                     |
| No explicit or implicit dependents exist      | Write `None.` under Dependents                                                                   |
| One mirrored entry is missing or disagrees    | Treat the inventory as defective and update both entries                                         |
| No implementation or test has been identified | Do not invent an `implements` or `verifies` relationship                                         |
| A requirement moves                           | Update both entries, links, scope, and requirement references                                    |
| A referenced specification remains a Stub     | Preserve its status and record concrete unresolved contract work without inferring missing rules |
| A work-plan row orders reviews                | Treat it as process information, not an artifact relationship                                    |

# Acceptance examples

## One example of each kind

| Relationship kind | Dependency                | Dependent                        | Expected interpretation                       |
| ----------------- | ------------------------- | -------------------------------- | --------------------------------------------- |
| `follows`         | Specification Conventions | Agents                           | Agents follows Specification Conventions      |
| `refines`         | Domain Model              | Agents                           | Agents refines Domain Model                   |
| `uses`            | Modeling Foundations      | Engine Contract                  | Engine Contract uses Modeling Foundations     |
| `implements`      | Engine Contract           | Identified engine implementation | The implementation implements Engine Contract |
| `verifies`        | ENG-004                   | Identified restoration test      | The test verifies ENG-004                     |

## Mirrored entries

Given Agents depends on Domain Model for lifecycle constraints, Agents contains:

| Dependency                                 | Relationship | Scope                                   |
| ------------------------------------------ | ------------ | --------------------------------------- |
| [Domain Model](foundation/domain-model.md) | `refines`    | Agent lifecycle and assignment behavior |

Domain Model contains the mirror:

| Dependent                     | Relationship | Scope                                   |
| ----------------------------- | ------------ | --------------------------------------- |
| [Agents](mechanics/agents.md) | `refines`    | Agent lifecycle and assignment behavior |

Both entries describe `Domain Model → Agents`. Removing or changing either entry requires the same change in the other.

## Implicit-only dependencies

A registered specification with no explicit Dependencies entries uses the exact implicit-only link defined in
Specification inventories. It does not write `None.` and does not reproduce implicit relationships as table entries.

## Graph checks

- Specification Conventions → A and A → Specification Conventions, both `follows`: reject the cycle.
- Domain Model → Agents and Agents → Domain Model, both `refines`: reject the cycle.
- Two scoped `uses` relationships in opposite directions are permitted only when their meanings are independently
  defined.
- Specification Conventions → Artifact Relationships through implicit `follows`, combined with Artifact Relationships →
  Specification Conventions through `uses`, is a permitted mixed-kind cycle.

# Open decisions

No unresolved terminology choices are hidden in this proposal. The direction, five relationship kinds, mirrored
inventories, implicit-relationship handling, graph rules, and adoption rules are proposed for review; this specification
remains Draft.
