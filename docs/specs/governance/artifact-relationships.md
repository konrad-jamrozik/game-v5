# Artifact Relationships

| Metadata    | Value                                            |
| ----------- | ------------------------------------------------ |
| Spec ID     | REL                                              |
| Family      | Governance                                       |
| Status      | Draft                                            |
| Audience    | Engine designer, Implementer                     |
| Conventions | [Specification Conventions](spec-conventions.md) |

# Overview

This document defines how specifications, requirements, implementations, tests, and other artifacts describe their relationships.
Every relationship runs from a Dependency to a Dependent and has one of five Relationship kinds: `follows`, `refines`, `uses`,
`implements`, or `verifies`.

This specification owns the relationship model. Specification Conventions owns the required specification layout and
the implicit relationships that apply to registered specifications. A relationship does not change an artifact's
status, accept a proposed rule, prove that an implementation is correct, or report a passing test run.

Examples explain the model; they do not declare relationships for the named artifacts.

# Relationships

- Used by [Specification Conventions](./spec-conventions.md)

# Glossary

## Artifacts

The things that relationships connect.

| Term           | Definition                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artifact       | An identified [specification](spec-conventions.md#glossary), [requirement](spec-conventions.md#glossary), implementation, test, or other item that can participate in a relationship |
| Implementation | An executable artifact intended to satisfy a specification or requirement                                                                                                            |

## Relationships

Directional connections between artifacts and how they are recorded.

| Term                  | Definition                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Relationship          | A directional connection from one Dependency to one Dependent with a Relationship kind                             |
| Dependency            | The artifact on which the Dependent relies; it appears on the left of `Dependency → Dependent`                     |
| Dependent             | The artifact that relies on the Dependency; it appears on the right of `Dependency → Dependent`                    |
| Relationship kind     | Exactly one of `follows`, `refines`, `uses`, `implements`, or `verifies`                                           |
| Explicit relationship | A relationship recorded in mirrored directional list entries                                                       |
| Implicit relationship | A relationship created by an applicability rule in Specification Conventions rather than repeated artifact entries |
| Relationships section | An artifact's flat list of explicit directional relationships                                                      |

## Graphs

Structures formed by artifacts and their relationships.

| Term  | Definition                                                            |
| ----- | --------------------------------------------------------------------- |
| Graph | A collection of artifacts and relationships                           |
| Cycle | A directional relationship path that returns to its starting artifact |
| DAG   | A directed acyclic graph                                              |

# Direction

Every relationship is read as **Dependency → Dependent**.

If A depends on B, B is the Dependency and A is the Dependent. The relationship runs `B → A`. Dependency and Dependent
are the only terms for the two participating artifacts in this model.

Every relationship must run `Dependency → Dependent`. The Dependent `follows`, `refines`,
`uses`, `implements`, or `verifies` the Dependency. Do not reverse the relationship when presenting it in the other
artifact's Relationships section. Do not enumerate a transitive relationship unless it also exists directly. An
artifact must not depend on itself.

# Relationship kinds

Each Relationship kind describes how the Dependent relates to the Dependency.

| Relationship kind | Meaning                                                                                                                   | Permitted artifacts                                                                                                         | Illustrative example                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `follows`         | The Dependent conforms to the Dependency's document structure, lifecycle, or writing rules                                | Document → document governed by those rules                                                                                 | Specification Conventions → Agents                                                                                    |
| `refines`         | The Dependent adds detail to the same subject or behavior already specified by the Dependency, preserving its constraints | Specification or requirement → refining specification                                                                       | Domain Model → Agents                                                                                                 |
| `uses`            | The Dependent applies the Dependency's concepts, constraints, data, or results to describe its own subject                | Any suitable artifacts                                                                                                      | Core Concepts → Engine Contract                                                                                       |
| `implements`      | The Dependent executable artifact provides behavior intended to satisfy the Dependency                                    | Specification or requirement → implementation                                                                               | Engine Contract → identified engine implementation                                                                    |
| `verifies`        | The Dependent test or scenario specifies or performs checks of the Dependency                                             | Specification or requirement → [test scenario](../acceptance/campaign-integration-and-acceptance-tests.md#glossary) or test | [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) → identified restoration test |

Merely consuming a result is `uses`, not `refines`. An implementation can `implement` a specification; a specification
does not implement its implementation. A test can `verify` a requirement without asserting that the test currently
passes.

# Choosing uses or refines

For each proposed refinement, identify the parent contract and the additional detail about that same subject or
behavior. Record both in the owning contract prose, linking to the relevant sections by title. Obeying an invariant,
using a vocabulary, consuming a result, or supplying Game Data Record (GDR) values is insufficient by itself: those are uses.
Being more concrete or appearing later in an authoring sequence is also insufficient.

E.g., Domain Model uses Core Concepts vocabulary and Campaign State composition constraints to describe game concepts.
Campaign State refines Engine Contract campaign-data integrity; vocabulary use alone is not refinement. Timeline uses the Campaign State identity and historical-preservation conventions and Engine Contract guarantees;
obeying them while restoring Campaign state is not refinement. These classifications concern the particular contract
meaning, not a prohibition on refinement between any document families.

A refinement does not need an additional uses entry merely because it inherits the parent's constraints. Declare
both Relationship kinds for a pair only when the prose identifies separate Relationship kinds. A document may refine multiple
parents only when it identifies additional detail about each parent's subject.

A Stub may declare an intended refinement when its prose names the parent contract and the detail its TODOs will
provide. This records planned ownership, not completed detail or acceptance. Preserve unresolved decisions and
reassess the relationship when actual rules replace the TODOs. Merely referring to a future document is not enough.

# Links that create no relationship

A link to or mention of another artifact creates no relationship when the linking artifact can be interpreted without
the linked content. The test: remove the link and the text it supports; if the meaning of the artifact's rules,
definitions, and examples is unchanged, no relationship exists.

Such a link is not listed under Relationships, needs no mirror, and forms no Cycle. It may therefore point in either
direction, including from a Dependency to one of its own Dependents. E.g., Core Concepts may point to Engine Contract
for what a Session holds, although Engine Contract uses Core Concepts.

The following kinds of link create no relationship when they pass the test:

- **Ownership pointers:** say which artifact owns something the linking artifact does not define.
- **Navigation links:** help a reader find related material.
- **Migration records:** say where content moved.
- **Citations and evidence acknowledgements:** credit material inspected while drafting.
- **Examples:** name other artifacts to explain a rule; they do not declare relationships for the named artifacts.
- **Process information:** review order, work-plan rows, and folder location.

Calling a link an ownership pointer, navigation link, or informative citation must not conceal substantive reliance.
When the artifact's rules, definitions, or examples cannot be understood without the linked content, the link is a
relationship and must be recorded under Relationships. Specification Conventions may restrict such links further for
particular documents.

# Relationship graphs

Validate each Relationship kind graph separately. The `follows` graph and the `refines` graph must each be a DAG.
Writing rules must not govern each other through a cycle, and refinements must not form a cycle of increasingly
detailed definitions.

The `uses` graph may contain cycles when the owning contracts identify distinct supplied meanings and no definition
depends circularly on itself. The `implements` and `verifies` graphs are acyclic under their permitted-artifact rules.
A graph combining different Relationship kinds need not be acyclic, and such a cycle is not by itself a defect.

Every retained cycle must be documented in the informative [Specification relationship cycles](../../spec-relationship-cycles.md)
register. Review the combined explicit uses/refines graph, including cycles longer than two edges, and separately
check mixed cycles involving implicit follows relationships. Each cyclic component must enumerate its internal edges,
their independently supplied meanings, their supporting contract passages, and a future removal approach with an
exit criterion. Stub-based justifications remain provisional. The register reports relationships; it does not create
them or authorize future contract changes. Links that create no relationship are not part of any graph.

# Recording relationships

Every relationship must use the canonical terms Artifact, Relationship, Dependency, Dependent, and Relationship kind
as defined by the Glossary. Every explicit relationship identifies one Dependency, one Dependent, and exactly one of the
five Relationship kinds, and satisfies that kind's permitted-artifact rules. Exact duplicates are invalid. A document
pair may have multiple Relationship kinds when each expresses distinct reliance.

Each explicit relationship is recorded twice: once in the Dependent's Relationships section and once, as its mirror
with the reverse-facing phrase, in the Dependency's. Both entries must resolve to the same Dependency, Dependent, and
Relationship kind. Implicit relationships are defined centrally by Specification Conventions and are not listed.
[Relationship inventories](spec-conventions.md#relationship-inventories) in Specification Conventions owns the layout
of a specification's Relationships section: its phrases, order, and links.

Relationship entries have no Scope field. Substantive constraints and requirement references belong in the owning
contract prose; a link to an artifact does not imply reliance on every rule in that artifact.

Adding, changing, or removing an explicit relationship must update both entries. A missing or disagreeing entry is a
documentation defect. Changes must preserve rule ownership and requirement traceability. Update the cycle register
whenever a change introduces, alters, or removes a cycle.

# Status and evidence

A relationship must not promote a Stub or Draft to Accepted. A refinement must
identify the parent subject or behavior, the additional detail, and preservation of the Dependency's constraints.
An intended Stub refinement must explicitly identify the detail still to be specified. An `implements` or `verifies` relationship must not be presented as evidence
that implementation is complete or tests pass.

# Adoption

New and existing registered specifications must record explicit relationships as defined here and apply the
implicit relationships. Before acceptance, resolve relationship TODOs that affect the contract, verify mirrored entries,
check links, and validate the graphs. Do not invent implementation or test relationships for planned artifacts.

# Edge cases and failure behavior

| Case                                                           | Required result                                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| A depends on B                                                 | Record `B → A`; B is the Dependency and A is the Dependent                                                               |
| Two Relationship kinds connect the same artifacts              | Keep both when they express distinct Relationship kinds                                                                  |
| Only implicit relationships apply                              | Omit the Relationships section                                                                                           |
| Explicit relationships exist                                   | List all explicit relationships; omit implicit ones                                                                      |
| No explicit relationships exist                                | Omit the Relationships section                                                                                           |
| One mirrored entry is missing or disagrees                     | Treat the inventory as defective and update both entries                                                                 |
| No implementation or test has been identified                  | Do not invent an `implements` or `verifies` relationship                                                                 |
| A requirement moves                                            | Update both entries, links, and requirement references in contract prose                                                 |
| A referenced specification remains a Stub                      | Preserve its status and record concrete unresolved contract work without inferring missing rules                         |
| A Dependency links to a Dependent only to say who owns a topic | Record nothing; it is an ownership pointer under [Links that create no relationship](#links-that-create-no-relationship) |
| A work-plan row orders reviews                                 | Record nothing; it is process information under [Links that create no relationship](#links-that-create-no-relationship)  |

# Acceptance examples

## Classification cases

The following table gives the complete expected classifications for this acceptance scenario. These cases exercise
[Recording relationships](#recording-relationships), [Direction](#direction), and [Status and evidence](#status-and-evidence); they do not add relationships to the named documents.

| Case                                                                                                                          | Expected classification and reason                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Domain Model describes agents using Campaign instance and GDR                                                                 | Uses Campaign State; it applies campaign composition constraints without elaborating their meanings |
| Agents supplies transitions for the lifecycle described by [Agent lifecycle](../foundation/domain-model.md#agent-lifecycle)   | Refines Domain Model; it adds detail to the same lifecycle                                          |
| Combat rounds a damage value with a rounding operation that Numbers defines                                                   | Uses Numbers; applying a rounding operation does not elaborate its meaning                          |
| Timeline preserves references under [References](../foundation/campaign-state.md#references) while restoring Campaign state   | Uses Campaign State; satisfying the reference invariant alone is not refinement                     |
| Saves persists the Timeline whose navigation Timeline defines                                                                 | Uses Timeline; persisting it does not elaborate navigation behavior                                 |
| Terminal CLI maps commands to Player API                                                                                      | Uses TypeScript Player API; an adapter contract applies existing operations                         |
| A Stub names [Information boundary](../foundation/engine-contract.md#information-boundary) and TODOs for exact exposed fields | Intended refinement is permitted; the fields remain unspecified and status stays Stub               |
| A document merely says it must obey [Campaign instances](../foundation/campaign-state.md#campaign-instances)                  | Uses, not Refines; no added detail about the identity convention is identified                      |
| A refinement duplicates the same reliance as a Uses entry                                                                     | Keep only Refines; two Relationship kinds require distinct reliance                                 |

## Complete coverage of Relationship kinds

| Relationship kind | Dependency                                                                              | Dependent                        | Expected interpretation                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `follows`         | Specification Conventions                                                               | Agents                           | Agents follows Specification Conventions                                                                  |
| `refines`         | Domain Model                                                                            | Agents                           | Agents refines Domain Model                                                                               |
| `uses`            | Core Concepts                                                                           | Engine Contract                  | Engine Contract uses Core Concepts                                                                        |
| `implements`      | Engine Contract                                                                         | Identified engine implementation | The implementation implements Engine Contract                                                             |
| `verifies`        | [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) | Identified restoration test      | The test verifies [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) |

## Mirrored entries

Given Agents refines Domain Model for lifecycle constraints, Agents contains:

- Refines [Domain Model](../foundation/domain-model.md)

Domain Model contains the mirror:

- Refined by [Agents](../mechanics/agents-spec.md)

Both entries describe Domain Model → Agents. The lifecycle constraints belong in the contract prose.
Removing or changing either entry requires the corresponding change in the other.

## No explicit relationships

A registered specification with no explicit relationships omits the Relationships section. Its implicit
relationships still apply. It must not list implicit entries.

## Graph checks

- Specification Conventions → A and A → Specification Conventions, both `follows`: reject the cycle.
- Domain Model → Agents and Agents → Domain Model, both `refines`: reject the cycle.
- Two `uses` relationships in opposite directions are permitted only when their meanings are independently
  defined.
- Specification Conventions → Artifact Relationships through implicit `follows`, combined with Artifact Relationships →
  Specification Conventions through `uses`, is a permitted cycle combining Relationship kinds.
