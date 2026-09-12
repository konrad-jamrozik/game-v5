# Campaign Acceptance Scenarios

| Metadata    | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Spec ID     | SCEN                                                                             |
| Status      | Stub                                                                             |
| Scope       | Specify cross-system conformance scenarios derived from the authoritative rules. |
| Conventions | [Specification conventions](../spec-conventions.md)                              |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Specify cross-system conformance scenarios derived from the authoritative rules.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- [Initial Campaign Content](../content/initial-campaign.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Turn Resolution](../foundation/turn-resolution.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [History and Persistence](../foundation/history-and-persistence.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [TypeScript Player API](../interfaces/typescript-api.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Terminal CLI](../interfaces/cli.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Web UI](../interfaces/web-ui.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Scenario fixture, game revision when needed for reproducibility, seed or RNG state, command sequence,
expected state/view, and requirement reference.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Deterministic fixtures

TODO: Define scenario IDs, exact starting state, content fixture, seed, ordered commands, expected results, and references
to owning requirements. Record the game revision when needed for reproducibility. Identify any test-only reduced scenario
explicitly.

### Integration scenarios

TODO: Cover resource allocation, transit, investigation uncertainty/abandonment, deadline pressure, transport contention, partial-success missions, faction escalation/suppression, and campaign endings.

### Interfaces and history

TODO: Cover equivalent API/CLI/web actions, player/dev visibility, invalid-action atomicity, replay, save/load, undo/redo, and branching. Keep strategic playtesting observations separate from exact conformance assertions.

TODO: Assign stable SCEN-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for same-turn cross-system interactions, endpoint thresholds, hidden-state restoration, failed
command batches, and attempts to load saves from incompatible earlier builds.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Write complete expected outcomes, not just test names; scenarios must reference rules rather than introduce new mechanics.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose the initial integration fixtures after their owning mechanics are resolved; record later-stage interface scenarios as pending.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
