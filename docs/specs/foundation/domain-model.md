# Domain Model

| Metadata    | Value                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------- |
| Spec ID     | DOM                                                                                                 |
| Status      | Stub                                                                                                |
| Scope       | Define the shared conceptual state model without prescribing a framework or storage implementation. |
| Conventions | [Specification conventions](../spec-conventions.md)                                                 |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define the shared conceptual state model without prescribing a framework or storage implementation.

TODO: Confirm the precise included/excluded scope and rule ownership using the [design stem](../../game-design-stem.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- [Numbers and Randomness](numbers-and-randomness.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Campaign, agency, agent, assignment, lead definition, investigation attempt, mission definition/instance, faction, actor, weapon, and report; identifiers and relationships.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Entities and relationships

TODO: Specify entity identity, reference lifetimes, ownership, cardinalities, and definition-versus-instance relationships. Distinguish agent orders from physical availability.

### Authoritative and derived state

TODO: Define which facts are stored and which are computed, including hidden state, counters, archives, and terminal entities. Link units and representation to NUM rather than choosing them here.

### Invariants

TODO: Specify valid state combinations, referential integrity, exclusive assignments, and constraints that must hold before and after commands.

TODO: Assign stable DOM-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Missing or stale references, archived and terminated entities, duplicate IDs, empty collections, and invalid assignment/state combinations.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide a small valid campaign state and invalid examples for each major invariant; identify the owning subsystem for each violation.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Resolve the entity boundaries and authoritative-versus-derived fields before implementation.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
