# Agents

| Metadata    | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Spec ID     | AGENT                                                                           |
| Status      | Stub                                                                            |
| Scope       | Define agent capability, task availability, development, fatigue, and recovery. |
| Conventions | [Specification conventions](../spec-conventions.md)                             |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define agent capability, task availability, development, fatigue, and recovery.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                            | Scope                                                                            |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `refines` | [Domain Model](../foundation/domain-model.md)                     | Agent lifecycle, assignments, task phases, attributes, and participation history |
| `uses`    | [Numbers and Randomness](../foundation/numbers-and-randomness.md) | Attribute arithmetic, thresholds, rounding, and reproducible random effects      |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Base/effective skill, health, exhaustion, equipment, orders, activity state, readiness, transit, and career statistics.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Attributes and effectiveness

TODO: Specify effective-skill and readiness formulas with units, floors, caps, and exact thresholds. Define which attributes are individual versus agency-derived.

### Assignments and transit

TODO: Provide a transition table for standby, contracting, training, investigation, mission, recovery, death, and dismissal. Specify eligibility and transit for each supported transition.

### Growth and recovery

TODO: Specify training, task exhaustion, fatigue recovery, injury recovery, forced withdrawal, and career tracking. Link combat experience rules to COMBAT and economic effects to ECON.

TODO: Assign stable AGENT-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Exact readiness/exhaustion thresholds, zero health, recovery completion, destination disappearing during transit, and conflicting assignments.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide effective-skill calculations and multi-turn transition examples including transit and forced withdrawal.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose transition delays, attribute formulas, and recovery rules; balance values belong to INIT.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
