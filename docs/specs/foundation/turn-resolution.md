# Turn Resolution

| Metadata    | Value                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Spec ID     | TURN                                                                      |
| Status      | Stub                                                                      |
| Scope       | Define exactly when subsystem rules run and which state each phase reads. |
| Conventions | [Specification conventions](../spec-conventions.md)                       |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define exactly when subsystem rules run and which state each phase reads.

TODO: Confirm the precise included/excluded scope and rule ownership using the [design stem](../../game-design-stem.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- [Domain Model](domain-model.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Numbers and Randomness](numbers-and-randomness.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Agents](../mechanics/agents.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Investigations](../mechanics/investigations.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Missions](../mechanics/missions.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Factions](../mechanics/factions.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Economy and Upgrades](../mechanics/economy-and-upgrades.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Campaign](../mechanics/campaign.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Turn number, management command, turn advancement, phase input, produced effect, and report boundary.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Phase schedule

TODO: Specify the ordered advancement phases and reference subsystem rules without duplicating formulas. Identify start-of-turn snapshots versus updated-state reads.

### Same-turn effects

TODO: Define when arrivals can work, investigation-created missions begin aging, mission survivors recover, operations spawn, and funding changes start producing income.

### Atomic resolution

TODO: Define when reports and campaign outcomes finalize, how simultaneous effects are ordered, and what happens if resolution encounters an invariant violation.

TODO: Assign stable TURN-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Investigation completion and exhaustion together; mission creation/expiration together; reward and defeat conditions together; multiple missions affecting one faction.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide turn timelines with before/after state for arrival, completion, expiration, rewards, suppression, and terminal outcomes.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Set the phase order and simultaneous-effect precedence explicitly; source-game timing is reference material, not an automatic default.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
