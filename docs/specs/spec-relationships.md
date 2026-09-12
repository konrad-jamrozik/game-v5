# Specification Relationships

| Metadata    | Value                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| Spec ID     | REL                                                                                  |
| Status      | Draft                                                                                |
| Scope       | Relationship terminology, edge direction, document inventories, and graph validation |
| Conventions | [Specification Conventions](spec-conventions.md)                                     |
| Review      | Proposed contract; terminology and examples awaiting review                          |

## 1. Purpose and boundaries

Define exactly how documents describe their relationships to other documents, concepts, requirements, implementations,
and test scenarios. Separate five relationship types: `follows`, `refines`, `uses`, `implements`, and `verifies`.
These types answer different questions and must not be collapsed into an unqualified dependency.

This specification owns the meaning and representation of relationships. Specification Conventions owns the requirement
to include relationship inventories in documents. A relationship does not change the status of either endpoint, accept
a proposed rule, prove that an implementation is correct, or determine review order. The work plan owns review order.

**Draft proposal:** the numbered requirements remain proposed rules. Examples labeled illustrative explain the notation;
they do not declare relationships in other documents or assert that software or tests already exist.

## 2. Dependencies and terminology

### Terminology

| Term           | Definition                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Node           | An identified document, concept, requirement, implementation, or test scenario                                          |
| Edge           | A directed relationship with a source, type, target, and scope                                                          |
| Source         | The node that performs the relationship named by the type                                                               |
| Target         | The node to which the source relates                                                                                    |
| Type           | Exactly one of `follows`, `refines`, `uses`, `implements`, or `verifies`                                                |
| Scope          | The specific subject matter covered by an edge, including requirement IDs when available                                |
| Outbound edge  | An edge whose source is the current document, a node contained in it, or an implementation whose declaration it records |
| Inbound edge   | An edge whose target is the current document or a node contained in it                                                  |
| Declaration    | The single authoritative edge record, written explicitly or determined by a defined default                             |
| Inventory      | A document's explicit outbound relationships, excluding edges supplied by defaults                                      |
| Graph          | A set of nodes and edges                                                                                                |
| Type graph     | The graph containing only edges of one type                                                                             |
| Cycle          | A directed path that returns to its starting node                                                                       |
| DAG            | A directed acyclic graph: a graph with no cycle                                                                         |
| Implementation | Code or another executable artifact intended to satisfy a specified contract or execute a test scenario                 |
| Test scenario  | Specified initial conditions, actions, and expected results that check identified requirements                          |

In edge tables and diagrams, use the exact lowercase type names. Do not use inverse names such as "refined by" or
substitute labels such as "obeys", "supports", or "depends on". Direction is expressed by Source and Target, even in an
inbound table. Status labels such as Draft belong to the endpoint document; they are not relationship types.

## 3. Concepts and contract

### The five relationship types

Read every edge as **Source → type → Target**.

| Type         | Meaning                                                                                                  | Source and target                                                                               | Illustrative example                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `follows`    | The source must conform to the target's document structure, lifecycle, or writing rules                  | Document → document containing those rules                                                      | Agents → `follows` → Specification Conventions                                             |
| `refines`    | The source adds detail to a concept or contract specified by the target while preserving its constraints | Specification or specified concept/requirement → specification or specified concept/requirement | Agents → `refines` → Domain Model, scoped to Agent behavior                                |
| `uses`       | The source relies on the meaning or rules supplied by the target within the stated scope                 | Document, concept, or requirement → document, concept, or requirement                           | Engine Contract → `uses` → Modeling Foundations, scoped to authoritative and derived facts |
| `implements` | The source is intended to provide executable behavior satisfying the target                              | Implementation → specification, requirement, or test scenario                                   | Game engine implementation → `implements` → Engine Contract                                |
| `verifies`   | The source specifies or performs checks of the target's requirements                                     | Test scenario or automated test → specification or requirement                                  | Campaign test scenario → `verifies` → mission consequence requirements                     |

`follows` concerns the document as a document. `uses` concerns the meaning of its content. `refines` adds detail;
merely consuming another specification's result is `uses`. For example, Missions uses Combat's battle result; this alone
does not make Missions a refinement of Combat.

`implements` concerns executable behavior. Engine Contract is a specification, so it cannot be the source of an
`implements` edge. The game engine implementation can be that source. Modeling Foundations specifies conventions that
an implementation can implement; the implementation does not supply the meaning of those conventions.

`verifies` describes check coverage. A Markdown test scenario can verify requirements without being executable. An
automated test can implement that scenario and verify the same requirements. Neither edge reports a passing test run.
Test-run evidence is separate from the relationship inventory.

### Graphs and direction

The `follows` type graph and the `refines` type graph must each be a DAG. Document writing rules must not govern each
other through a cycle of `follows` edges; refinements must not form a cycle of increasingly detailed definitions.

The `uses` type graph may contain cycles. Each edge must still identify the supplied meaning or rule. A cycle cannot
justify an undefined term or two competing owners of the same rule. A DAG view can group mutually reachable nodes into
one node without changing the original edges.

The `implements` and `verifies` type graphs are DAGs under the endpoint restrictions above: their targets cannot act as
sources of the same type. A test scenario is a specification of a test, distinct from its executable implementation.

The graph combining all five types need not be a DAG. For example, REL follows CONV while CONV uses REL. These edges
address different subjects: document writing rules and relationship terminology. They are not inverse declarations of
one dependency. Reading references and review order do not add edges to any type graph.

### Defaults and compact inventories

All specification documents registered in the spec index implicitly `follows` Specification Conventions for document
structure, lifecycle, and writing rules. CONV itself is the root and has no self-edge. The metadata Conventions link may
remain as navigation; no relationship row is required. Additional writing rules require an explicit `follows` edge.

The source of a relationship row is the current document unless a Source column identifies a contained concept,
requirement, test scenario, or implementation. Ordinary specification documents describe contracts, so they do not
need `implements` rows or an inventory of implementations that might eventually satisfy them.

Acceptance examples already name the requirements they check. Those references declare their `verifies` edges without
repeating them in a relationship table. This default applies only to specified checks with identified requirements;
merely linking a requirement does not declare `verifies`. Cross-document test scenarios use the same rule.

List only other actual outbound edges, usually `refines` and `uses`, in a `Relationships` subsection inside section 2.
Use three columns: **Type, Target, Scope**. Add **Source** only when the source is not the current document. Documents
exempt from the seven-section layout may place this subsection in an appropriate existing section. Omit the subsection
entirely if defaults and local test-scenario references cover every edge.

Do not add empty type categories, None rows, Not applicable rows, coverage tables, or routine Pending assessments.
An omitted type means there is no additional explicit edge of that type; it does not prove absence of implementations
or tests elsewhere. If a particular relationship is unresolved, write a concrete TODO about it rather than silently
omitting it. A mechanics document that refines Domain Model may still use other rules and contain test scenarios;
relationship types are not mutually exclusive document classifications.

Identify targets by a relative document link and a scope, adding section anchors or requirement IDs when available.
A whole-document link does not imply reliance on every rule. An implementation declaration must identify its real
repository path and symbol when applicable; never invent a path for planned work.

The source document owns each explicit declaration. Test-scenario requirement references are declarations at the
scenario. For an implementation source outside Markdown, one owning specification or implementation document records
its declaration and real source path. That arrangement does not require every specification to inspect its incoming
implementation relationships.

Inbound edges are optional navigation, obtained from declarations and defaults. They may appear in a generated index,
a graph, or a document's optional `Inbound edges` subsection. They are not separately maintained declarations. If shown,
they must preserve the original Type, Source, Target, and Scope and link to the declaration or applicable default.
Neither endpoint needs to duplicate a declaration just to make the relationship visible in both places.

Graph validation includes edges supplied by defaults and test-scenario references, even when they have no table row.
Do not infer `refines` or `uses` solely from a document's folder or from a generic Markdown link.

## 4. Requirements

**REL-001 — Exact types.** Every declared edge must use exactly one of the five types defined in section 3 and satisfy
that type's meaning and endpoint restrictions. Do not encode document status, review order, or a background reference
as a relationship type. Illustrative and planned examples must be labeled and kept outside declared edge tables.

**REL-002 — Edge identity and scope.** Every edge must identify its source, type, target, and scope. Use requirement IDs
when available; otherwise link the relevant section and describe the subject precisely. A link to a whole document must
not imply reliance on every rule in that document. Exact duplicate edges must not be declared twice.

**REL-003 — Direction.** Outbound and inbound entries must retain the same source, type, target, and scope. Inbound
entries must not reverse the edge or rename its type. Do not enumerate transitive edges unless a direct relationship
also exists. Distinct nodes in the same document may be connected; a node must not have an edge to itself.

**REL-004 — Compact inventory.** Apply the defaults in section 3 and list only additional actual outbound edges.
Do not require all five types, empty categories, inbound inventories, or duplicate rows for local test-scenario
requirement references. Use Type, Target, and Scope, adding Source only when needed. Omit the Relationships subsection
when it would be empty. Record a concrete TODO for any known unresolved relationship.

**REL-005 — Declaration ownership.** Each explicit edge must have one declaration, owned as specified in section 3.
Defaults declare their edges centrally. Inbound edges may be derived for navigation but must not become independent
sources of truth. A refinement does not suppress other applicable relationship types.

**REL-006 — Relationship updates.** Adding, changing, or removing an explicit edge must update its declaration.
Update affected derived views if they are published in the repository; no inbound view is required. A disagreement
between a derived view and its declaration is a documentation defect. Changes must preserve rule ownership and
requirement traceability.

**REL-007 — Graph validity.** Validate each type graph separately using section 3. Reject cycles in `follows` and
`refines`, invalid endpoints, and self-edges. A `uses` cycle must identify the distinct supplied rules or meanings and
must not leave a circular definition unresolved. A mixed-type cycle alone is not a defect.

**REL-008 — Status and evidence.** An edge must not promote a Stub or Draft to Accepted. A refinement must preserve
the target's constraints; a conflict requires a proposed revision of the owning rule. An `implements` or `verifies`
edge must not be presented as evidence that tests passed or that implementation work is complete.

**REL-009 — Adoption.** New documents must use the defaults and compact format. Existing documents must replace
free-form dependency classifications when their relationships are migrated. Background references may remain separately
labeled as references. Before accepting a document, resolve relationship TODOs that affect its contract, check its
explicit declarations and applicable defaults, and verify links and graph validity. Do not require an audit of every
possible inbound edge or implementation merely to accept a specification.

## 5. Edge cases and failure behavior

| Case                                                            | Required result                                                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Two types connect the same document pair                        | Keep both if they express distinct scopes; do not collapse them into "depends on" (REL-001/002)                                |
| Inbound entry says CONV follows Agents                          | Correct it to Agents follows CONV; inbound does not reverse direction (REL-003)                                                |
| No implementation has been identified                           | Omit the edge; if a specific planned implementation needs tracking, use a TODO outside the inventory (REL-001/004)             |
| The source declares an edge and the target has no inbound table | Valid; inbound navigation is optional (REL-005/006)                                                                            |
| A requirement moves to another file                             | Update the declaration, links, scope, and any published derived views while preserving requirement traceability (REL-002/006)  |
| A target is still a Stub                                        | Keep its status explicit in the target; identify unresolved rule dependencies instead of inferring missing rules (REL-008/009) |
| A diagram contains illustrative code or tests                   | Label it illustrative and keep those nodes outside the declared inventory (REL-001)                                            |
| A work-plan row says review A before B                          | Keep that sequence in the work plan; it does not establish any of the five types (REL-001)                                     |

## 6. Acceptance examples

These fixtures test this relationship contract. Named gameplay relationships below are illustrative, not declarations
for the referenced documents. They do not accept proposed mechanics or assert that example implementations exist.

### One example of each type

| Type         | Fixture                                                                                                            | Expected result                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `follows`    | Agents → CONV, scoped to document structure and lifecycle                                                          | Implicit for registered specifications; neither document needs a row (REL-001/002/003)                                                              |
| `refines`    | Agents → Domain Model, scoped to Agent transitions within its lifecycle constraints                                | Valid if the added detail preserves those constraints; a contradictory lifecycle is a proposed rule revision (REL-001/008)                          |
| `uses`       | Engine Contract → Modeling Foundations, scoped to authoritative facts, derived values, and historical preservation | Valid; the reverse reading reference alone does not create a reverse edge (REL-001/002)                                                             |
| `implements` | An identified game engine implementation → Engine Contract, scoped to ENG-001 calculations                         | Valid after identifying its real path and recording the declaration; replacing the source with Engine Contract makes the edge invalid (REL-001/005) |
| `verifies`   | A specified undo scenario → Engine Contract, scoped to ENG-001/004 restoration checks                              | Valid coverage edge; it does not assert a passing automated test (REL-001/008)                                                                      |

### A typical mechanics document

Given an illustrative Agents document with these relationships:

| Type      | Target                                                         | Scope                                   |
| --------- | -------------------------------------------------------------- | --------------------------------------- |
| `refines` | [Domain Model](foundation/domain-model.md)                     | Agent lifecycle and assignment behavior |
| `uses`    | [Numbers and Randomness](foundation/numbers-and-randomness.md) | Attribute arithmetic and rounding       |

This is a sufficient inventory for those relationships. Agents implicitly follows CONV. It needs no empty
`implements` or `verifies` rows, and Domain Model needs no inbound entry. Its acceptance examples declare their
`verifies` edges through requirement references. A graph can reconstruct these edges from the defaults, the table,
and the examples (REL-002/003/004/005).

Removing the refinement requires removing its declaration and updating any published derived views, without adding
an empty category. The explicit `uses` row remains (REL-006).

### A document with only defaults

Given a registered specification with no additional outbound relationships and no unresolved relationship, omit the
Relationships subsection. Its implicit `follows` edge remains part of the graph. It does not require an implementation
search or an inventory of future tests. This is valid under REL-004/009.

### Graph checks

- A follows B and B follows A: reject the `follows` cycle (REL-007).
- A refines B and B refines A: reject the `refines` cycle (REL-007).
- A uses B for numeric rules and B uses A for a separately defined input concept: a cycle is permitted if both
  meanings are defined without circular definitions or competing ownership (REL-007).
- REL follows CONV and CONV uses REL: permitted mixed-type cycle (REL-007).
- A scenario in section 6 verifies requirements in section 4 of the same document: distinct nodes, so permitted;
  a requirement verifying itself is invalid (REL-001/003).
- A follows B and B follows C: A does not automatically list a direct follows edge to C (REL-003).

### Missing work and evidence

Given an unresolved choice about which numeric rules a mechanics document uses, record a TODO identifying that choice.
Resolve it before accepting the affected contract. Do not create Pending cells for unrelated relationship types
(REL-004/009).

Given a declared automated test implements a specified scenario and verifies its requirements, no test-run result is
implied. A failed run does not remove the coverage edge; it provides evidence of a failure to satisfy the requirements
(REL-008). A merely planned test remains outside the declared inventory (REL-001).

## 7. Open decisions

No unresolved terminology choices are hidden in this proposal. The five types, inventory format, graph rules, and
adoption rules are proposed for review; this specification remains Draft.

Repository-wide inventory migration is complete for the current specification set and recorded in the
[work plan](work-plan.md#relationship-inventory-migration). The migration reviewed actual relationships rather than
mechanically translating former classifications. Domain Model now refines Modeling Foundations and owns the
game-specific identity scope; the proposed identity guarantees and gameplay-rule statuses did not change.
