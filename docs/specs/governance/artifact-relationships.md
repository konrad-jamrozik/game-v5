# Artifact Relationships

| Metadata    | Value                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| Scope       | Relationship terminology, direction, inventories, and graph validation |
| Spec ID     | REL                                                                    |
| Family      | Governance                                                             |
| Status      | Draft                                                                  |
| Conventions | [Specification Conventions](spec-conventions.md)                       |
| Review      | Proposed contract; terminology and examples awaiting review            |

# Purpose and boundaries

Define how specifications, requirements, implementations, tests, and other artifacts describe their relationships.
Every relationship runs from a Dependency to a Dependent and has one of five kinds: `follows`, `refines`, `uses`,
`implements`, or `verifies`.

This specification owns the relationship model. Specification Conventions owns the required specification layout and
the implicit relationships that apply to registered specifications. A relationship does not change an artifact's
status, accept a proposed rule, prove that an implementation is correct, or report a passing test run.

**Draft proposal:** the numbered requirements are proposed rules. Examples explain the model; they do not
declare relationships for the named artifacts.

# Relationships

- Used by [Specification Conventions](spec-conventions.md)

# Glossary

| Term                  | Definition                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artifact              | An identified [specification](spec-conventions.md#glossary), [requirement](spec-conventions.md#glossary), implementation, test, or other item that can participate in a relationship |
| Relationship          | A directional connection from one Dependency to one Dependent with a relationship kind                                                                                               |
| Dependency            | The artifact on which the Dependent relies; it appears on the left of `Dependency → Dependent`                                                                                       |
| Dependent             | The artifact that relies on the Dependency; it appears on the right of `Dependency → Dependent`                                                                                      |
| Relationship kind     | Exactly one of `follows`, `refines`, `uses`, `implements`, or `verifies`                                                                                                             |
| Explicit relationship | A relationship recorded in mirrored directional list entries                                                                                                                         |
| Implicit relationship | A relationship created by an applicability rule in Specification Conventions rather than repeated artifact entries                                                                   |
| Relationships section | An artifact's flat list of explicit directional relationships                                                                                                                        |
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

| Relationship kind | Meaning                                                                                                 | Permitted artifacts                                                                                                         | Illustrative example                               |
| ----------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `follows`         | The Dependent conforms to the Dependency's document structure, lifecycle, or writing rules              | Document → document governed by those rules                                                                                 | Specification Conventions → Agents                 |
| `refines`         | The Dependent adds detail to the Dependency while preserving its constraints                            | Specification or requirement → refining specification                                                                       | Domain Model → Agents                              |
| `uses`            | The Dependent relies on meaning or rules supplied by the Dependency as explained in the owning contract | Any suitable artifacts                                                                                                      | Modeling Foundations → Engine Contract             |
| `implements`      | The Dependent executable artifact provides behavior intended to satisfy the Dependency                  | Specification or requirement → implementation                                                                               | Engine Contract → identified engine implementation |
| `verifies`        | The Dependent test or scenario specifies or performs checks of the Dependency                           | Specification or requirement → [test scenario](../acceptance/campaign-integration-and-acceptance-tests.md#glossary) or test | ENG-004 → identified restoration test              |

Merely consuming a result is `uses`, not `refines`. An implementation can `implement` a specification; a specification
does not implement its implementation. A test can `verify` a requirement without asserting that the test currently
passes.

## Relationship graphs

The `follows` graph and the `refines` graph must each be a DAG. Writing rules must not govern each other through a
cycle, and refinements must not form a cycle of increasingly detailed definitions.

The `uses` graph may contain cycles when the owning contracts identify distinct supplied meanings and no definition
depends circularly on itself. The `implements` and `verifies` graphs are acyclic under their permitted-artifact rules.
A graph combining different relationship kinds need not be acyclic.

## Specification inventories

Every registered specification contains adjacent Relationships and Glossary H1 sections immediately after
Purpose and boundaries. Relationships contains one flat unordered list, without tables or subsections. Each bullet
describes the current document and consists of a directional phrase followed by one hyperlink whose text is the
linked document's title. Link to the registered document itself, without an anchor or a scope annotation.

Use this complete phrase order; omit groups with no entries and sort document titles alphabetically within each group:

1. Uses
2. Refines
3. Follows
4. Implements
5. Verifies
6. Used by
7. Refined by
8. Followed by
9. Implemented by
10. Verified by

Groups are contiguous entries, not headings. For example, Engine Contract contains:

- Uses [Modeling Foundations](../foundation/modeling-foundations.md)

Modeling Foundations contains the mirror:

- Used by [Engine Contract](../foundation/engine-contract.md)

Both entries describe the same relationship. The first five phrases describe the current document as Dependent;
the last five describe it as Dependency. Reverse-facing phrases are grammatical presentations of the canonical
relationship kinds, not additional kinds or glossary synonyms.

List explicit relationships only. When there are none, write exactly **No explicit relationships.** as an unformatted
paragraph. Do not repeat implicit relationships or the former implicit-only sentences. Every explicit relationship
must have its mirror with the same Dependency, Dependent, and relationship kind. A document pair may have multiple
kinds, but duplicate entries of the same kind and direction are invalid. Inventory lists are exhaustive, not example lists.

Relationship entries have no Scope field. Keep substantive constraints and requirement references in the owning
contract prose; a document link does not imply reliance on every rule in that document. Ordinary citations and evidence
acknowledgements do not create relationships.

Specification Conventions defines implicit relationships and their applicability. A citation, review order, or folder
location does not create a relationship.

# Requirements

**REL-001 — Canonical model.** Every relationship must use the canonical terms Artifact, Relationship, Dependency,
Dependent, and Relationship kind as defined by the Glossary. Each relationship must use exactly one of the five
relationship kinds and satisfy its permitted-artifact rules.

**REL-002 — Identity.** Every explicit relationship must identify one Dependency, one Dependent, and one
relationship kind. Exact duplicates are invalid. Relationship inventories have no Scope field. Substantive constraints
and requirement references belong in the owning contract prose; an artifact link alone must not imply reliance on
every rule in that artifact.

**REL-003 — Direction.** Every relationship must run `Dependency → Dependent`. The Dependent `follows`, `refines`,
`uses`, `implements`, or `verifies` the Dependency. Do not reverse the relationship when presenting it in the other
artifact's Relationships section. Do not enumerate a transitive relationship unless it also exists directly. An
artifact must not depend on itself.

**REL-004 — Flat inventories.** Every registered specification must contain one flat directional list under
Relationships, using the phrases, ordering, links, and empty-inventory sentence defined in Specification inventories.
Tables, nested lists, annotations, and Dependencies/Dependents subsections are invalid.

**REL-005 — Mirrored explicit relationships.** Every explicit entry must have one matching entry in the other artifact.
The pair must resolve to the same Dependency, Dependent, and relationship kind, with the reverse-facing phrase in
the mirror. Implicit relationships are defined centrally and are not listed.

**REL-006 — Relationship updates.** Adding, changing, or removing an explicit relationship must update both entries.
A missing or disagreeing entry is a documentation defect. Changes must preserve rule ownership and requirement
traceability.

**REL-007 — Graph validity.** Validate each relationship-kind graph separately. Reject cycles in `follows` and
`refines`, invalid artifacts, and self-relationships. The owning contracts of a `uses` cycle must identify distinct supplied meanings and must
not leave a circular definition unresolved. A cycle containing different relationship kinds is not by itself a defect.

**REL-008 — Status and evidence.** A relationship must not promote a Stub or Draft to Accepted. A refinement must
preserve the Dependency's constraints. An `implements` or `verifies` relationship must not be presented as evidence
that implementation is complete or tests pass.

**REL-009 — Adoption.** New and existing registered specifications must use the flat directional format and applicable
implicit relationships. Before acceptance, resolve relationship TODOs that affect the contract, verify mirrored entries,
check links, and validate the graphs. Do not invent implementation or test relationships for planned artifacts.

# Edge cases and failure behavior

| Case                                          | Required result                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A depends on B                                | Record `B → A`; B is the Dependency and A is the Dependent                                       |
| Two kinds connect the same artifacts          | Keep both when they express distinct kinds of reliance                                           |
| Only implicit relationships apply             | Write `No explicit relationships.`                                                               |
| Explicit relationships exist                  | List all explicit relationships; omit implicit ones                                              |
| No explicit relationships exist               | Write `No explicit relationships.`                                                               |
| One mirrored entry is missing or disagrees    | Treat the inventory as defective and update both entries                                         |
| No implementation or test has been identified | Do not invent an `implements` or `verifies` relationship                                         |
| A requirement moves                           | Update both entries, links, and requirement references in contract prose                         |
| A referenced specification remains a Stub     | Preserve its status and record concrete unresolved contract work without inferring missing rules |
| A work-plan row orders reviews                | Treat it as process information, not an artifact relationship                                    |

# Acceptance examples

## Complete coverage of relationship kinds

| Relationship kind | Dependency                | Dependent                        | Expected interpretation                       |
| ----------------- | ------------------------- | -------------------------------- | --------------------------------------------- |
| `follows`         | Specification Conventions | Agents                           | Agents follows Specification Conventions      |
| `refines`         | Domain Model              | Agents                           | Agents refines Domain Model                   |
| `uses`            | Modeling Foundations      | Engine Contract                  | Engine Contract uses Modeling Foundations     |
| `implements`      | Engine Contract           | Identified engine implementation | The implementation implements Engine Contract |
| `verifies`        | ENG-004                   | Identified restoration test      | The test verifies ENG-004                     |

## Mirrored entries

Given Agents refines Domain Model for lifecycle constraints, Agents contains:

- Refines [Domain Model](../foundation/domain-model.md)

Domain Model contains the mirror:

- Refined by [Agents](../mechanics/agents.md)

Both entries describe Domain Model → Agents. The lifecycle constraints belong in the contract prose.
Removing or changing either entry requires the corresponding change in the other.

## No explicit relationships

A registered specification with no explicit relationships writes exactly "No explicit relationships." Its implicit
relationships still apply. It must not list implicit entries or use the former implicit-only sentences.

## Graph checks

- Specification Conventions → A and A → Specification Conventions, both `follows`: reject the cycle.
- Domain Model → Agents and Agents → Domain Model, both `refines`: reject the cycle.
- Two `uses` relationships in opposite directions are permitted only when their meanings are independently
  defined.
- Specification Conventions → Artifact Relationships through implicit `follows`, combined with Artifact Relationships →
  Specification Conventions through `uses`, is a permitted mixed-kind cycle.

# Open decisions

No unresolved terminology choices are hidden in this proposal. The direction, five relationship kinds, mirrored
inventories, implicit-relationship handling, graph rules, and adoption rules are proposed for review; this specification
remains Draft.
