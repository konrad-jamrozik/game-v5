# Investigations

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | INVSTG                                                         |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Agents](./agents.md) for Agent capabilities and task availability when assigning Investigation participants.
- Uses [Leads and Progression](./leads-and-progression.md) for the Lead prerequisites and completion effects pursued through Investigations.
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md) for numeric representation, rounding, and reproducible random draws.
- Uses [Player Information](../interfaces/player-information.md) for the visibility and estimate constraints on reporting uncertain Investigation outcomes.
- Refines [Domain Model](../foundation/domain-model.md) by specifying Investigation progress, stochastic completion, uncertainty, and commitment rules.
- Used by [Player Information](../interfaces/player-information.md) for Investigation progress, completion, and commitment costs.
- Used by [Turn Resolution](../foundation/turn-resolution.md) for the Investigation progress and completion transitions scheduled within a turn.

# Relationships

- Uses [Agents](./agents.md)
- Uses [Leads and Progression](./leads-and-progression.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Uses [Player Information](../interfaces/player-information.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Turn Resolution](../foundation/turn-resolution.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This specification intends to refine Domain Model's investigation contract ([Current versus historical teams](../foundation/domain-model.md#current-versus-historical-teams)/[Leads and Investigations](../foundation/domain-model.md#leads-and-investigations)/[Progression facts](../foundation/domain-model.md#progression-facts)) with start, progress, completion,
team-change, and abandonment behavior. It uses Agents' contributions, Leads and Progression's availability/effects,
and Numbers and Randomness's arithmetic/draws. Player Information supplies exposed field shapes and reveal conditions;
this document supplies estimate mathematics and the information those estimates condition on. The exact mathematics
and transitions remain TODOs below.

TODO: Specify Visible difficulty, hidden actual difficulty, effective team contribution, progress, cumulative completion probability, per-turn conditional probability, and player estimate.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Start and progress

TODO: Specify eligibility, hidden-difficulty distribution and sampling time, agent contribution, sublinear team scaling, transit treatment, and when progress is added.

TODO: Define InvestigationArchetype selection and allowed combinations with Lead Game Data Records (GDRs). Preserve the
separate Archetype and immutable Lead reference established by Domain Model; apply the at-most-one-Active-Investigation-per-Lead
constraint across archetypes. The illustrative InvestigationArchetype GDRs in Modeling Foundations do not select mechanics.

## Completion probability

TODO: Provide unambiguous formulas and evaluation order for actual completion, including guaranteed completion, random draws, and the distinction between cumulative and per-turn conditional probability.

## Player uncertainty

TODO: Define the mathematical meaning of displayed estimates/ranges, information used, rounding, and whether/how prior non-completion updates estimates. Reference INFO for exposed field shapes.

## Team changes and commitment

TODO: Specify effective-skill-weighted progress loss on removal, the weighting snapshot, exhaustion-driven removal, and abandonment when everyone leaves. Adding agents preserves progress; a new Investigation starts from zero.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Zero total effective skill, fractional progress, threshold crossing, removing all or some agents, completion and exhaustion together, and restarting abandoned leads.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide numerical worked examples and exact tests for progress, hidden difficulty, true versus estimated probability, team changes, and guaranteed completion.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose every formula and probability interpretation; explicitly resolve how history and team changes affect uncertainty.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
