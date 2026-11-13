# Specification relationship cycles

This informative register records every remaining cyclic component after the uses/refines review. It is outside the
registered specification corpus and introduces no relationships or gameplay requirements. The owning contracts and
their mirrored inventories remain authoritative. Removal approaches below are future design work, not approved
changes to gameplay or the review sequence.

## Coverage and maintenance

The review combines all explicit uses and refines relationships and finds groups in which every document can reach
every other document by following dependency-to-dependent arrows. Such a group is a strongly connected component.
Listing every internal edge covers longer cycles as well as reciprocal pairs without enumerating every possible loop.
The review also includes implicit follows relationships in a separate pass to identify mixed governance cycles.

The complete result is one governance component with two documents and two internal edges of different Relationship
kinds. No game specification occurs in a cyclic component: the combined explicit uses/refines graph is acyclic.
Neither the refines graph nor the follows graph alone contains a cycle. These results were recomputed after the
Mechanics family was arranged in tiers, which removed five uses relationships: Agents uses Combat, Agents uses Economy
and Upgrades, Factions uses Leads and Progression, Investigations uses Player Information, and Developer API uses
TypeScript Player API.

When a relationship changes, recompute these components from the registered inventories, check the supporting prose,
and update the diagrams, tables, counts, and removal criteria together. Include all internal edges, including edges
that close longer paths rather than a two-document loop. Remove a component from this register when it is acyclic.
The [Relationship graphs](specs/governance/artifact-relationships.md#relationship-graphs) require this maintenance;
deterministic specification lint alone does not establish the semantic justification or completeness of this report.

## Governance component: relationship language and document conventions

```mermaid
flowchart LR
  CONV[Specification Conventions] -->|implicit follows| REL[Artifact Relationships]
  REL -->|uses| CONV
```

This is the complete internal-edge inventory:

| Dependency → Dependent                             | Kind             | Independently supplied meaning and evidence                                                                                                                                                                                                                      |
| -------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specification Conventions → Artifact Relationships | Implicit follows | Conventions — [Implicit relationships](specs/governance/spec-conventions.md#implicit-relationships) supplies document structure, lifecycle, and writing rules for every other registered specification.                                                          |
| Artifact Relationships → Specification Conventions | Uses             | Artifact Relationships — [Relationship kinds](specs/governance/artifact-relationships.md#relationship-kinds) supplies relationship meanings used by the conventions — [Relationship inventories](specs/governance/spec-conventions.md#relationship-inventories). |

The meanings are independently stated: writing rules govern a document that defines the relationship vocabulary.
The relationship definition does not need a missing definition supplied only by the writing rule.

A future removal could consolidate the relationship language and inventory rules into Specification Conventions and
retire the separate REL contract with explicit requirement migration. That would require a separately reviewed
governance change. The exit criterion is no multi-document component containing CONV and REL after including implicit
follows edges, with all definitions and requirement references preserved. Until then this mixed cycle stays documented.
