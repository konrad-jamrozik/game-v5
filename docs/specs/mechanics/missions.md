# Missions

| Metadata    | Value                                                                               |
| ----------- | ----------------------------------------------------------------------------------- |
| Spec ID     | MISSION                                                                             |
| Status      | Stub                                                                                |
| Scope       | Define mission commitments and translate combat results into campaign consequences. |
| Conventions | [Specification conventions](../spec-conventions.md)                                 |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define mission commitments and translate combat results into campaign consequences.

TODO: Confirm the precise included/excluded scope and rule ownership using the [design stem](../../game-design-stem.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- [Domain Model](../foundation/domain-model.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Agents](agents.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Combat](combat.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Economy and Upgrades](economy-and-upgrades.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Factions](factions.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Initiative mission, Response mission, faction operation, deadline, deployment, battle result, mission outcome, and partial success.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Creation and lifecycle

TODO: Specify mission creation, states, deadlines, deployment/recall eligibility, transport use, resolution, and expiration. Distinguish mission purpose from combat tactics.

### Outcomes and partial success

TODO: Provide exact rewards and penalties for victory, retreat, wipe, and expiration. Define how damage inflicted benefits the player after failure, with units, normalization, bounds, and interaction with operation severity.

### Consequences and return

TODO: Specify survivor return, casualty effects, resource changes, suppression, unlocks, and reports. Reference owning rules to prevent duplicate application.

TODO: Assign stable MISSION-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Last-turn deployment, failed attempts versus expiration, negligible damage, overkill, multiple missions against one faction, and simultaneous rewards/penalties.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Compare ignored, failed-with-damage, and successful versions of the same mission; include shared-transport contention.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose the partial-success formula and mission lifecycle rules, including whether reattempts exist; do not copy victory-only rewards as the v5 contract.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
