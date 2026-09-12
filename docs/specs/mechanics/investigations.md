# Investigations

| Metadata    | Value                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Spec ID     | INV                                                                                                   |
| Status      | Stub                                                                                                  |
| Scope       | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs. |
| Conventions | [Specification conventions](../spec-conventions.md)                                                   |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                            | Scope                                                                             |
| --------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `refines` | [Domain Model](../foundation/domain-model.md)                     | Investigation attempts, lifecycle, teams, progress facts, and abandonment         |
| `uses`    | [Numbers and Randomness](../foundation/numbers-and-randomness.md) | Progress arithmetic, hidden-difficulty sampling, probability, draws, and rounding |
| `uses`    | [Agents](agents.md)                                               | Team contribution, transit, exhaustion, withdrawal, and assignment effects        |
| `uses`    | [Leads and Progression](leads-and-progression.md)                 | Lead eligibility, repeatability, completion facts, and unlock effects             |
| `uses`    | [Player Information](../interfaces/player-information.md)         | Exposure and representation of estimates, uncertainty, and investigation results  |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Visible difficulty, hidden actual difficulty, effective team contribution, progress, cumulative completion probability, per-turn conditional probability, and player estimate.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Start and progress

TODO: Specify eligibility, hidden-difficulty distribution and sampling time, agent contribution, sublinear team scaling, transit treatment, and when progress is added.

### Completion probability

TODO: Provide unambiguous formulas and evaluation order for actual completion, including guaranteed completion, random draws, and the distinction between cumulative and per-turn conditional probability.

### Player uncertainty

TODO: Define the mathematical meaning of displayed estimates/ranges, information used, rounding, and whether/how prior non-completion updates estimates. Reference INFO for exposed field shapes.

### Team changes and commitment

TODO: Specify effective-skill-weighted progress loss on removal, the weighting snapshot, exhaustion-driven removal, and abandonment when everyone leaves. Adding agents preserves progress; a new attempt starts from zero.

TODO: Assign stable INV-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Zero total effective skill, fractional progress, threshold crossing, removing all or some agents, completion and exhaustion together, and restarting abandoned leads.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide numerical worked examples and exact tests for progress, hidden difficulty, true versus estimated probability, team changes, and guaranteed completion.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose every formula and probability interpretation; explicitly resolve how history and team changes affect uncertainty.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
