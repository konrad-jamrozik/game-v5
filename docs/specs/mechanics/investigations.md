# Investigations

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | INVSTG                                                         |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Audience    | Engine designer, Content designer, AI designer, Implementer    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines exact investigation progress, stochastic completion, player uncertainty, and commitment costs.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification intends to refine Domain Model's investigation contract ([Current versus historical teams](../foundation/domain-model.md#current-versus-historical-teams)/[Leads and Investigations](../foundation/domain-model.md#leads-and-investigations)/[Progression facts](../foundation/domain-model.md#progression-facts)) with start, progress, completion,
team-change, and abandonment behavior. It uses Agents' contributions, Leads and Progression's availability/effects,
and Numbers and Randomness's arithmetic/draws. This document supplies estimate mathematics over inputs it names itself. Which of those inputs and results the player
sees is owned by [Player Information](../interfaces/player-information.md); this document does not rely on it. The exact mathematics
and transitions remain TODOs below.

TODO: Specify Visible difficulty, hidden actual difficulty, effective team contribution, progress, cumulative completion probability, per-turn conditional probability, and player estimate.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Leads and Progression](./leads-and-progression.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Player Information](../interfaces/player-information.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Start and progress

TODO: Specify eligibility, hidden-difficulty distribution and sampling time, agent contribution, sublinear team scaling, transit treatment, and when progress is added.

TODO: Define InvestigationArchetype selection and allowed combinations with Lead Game Data Records (GDRs). Preserve the
separate Archetype and immutable Lead reference established by Domain Model; apply the at-most-one-Active-Investigation-per-Lead
constraint across archetypes. The illustrative InvestigationArchetype GDRs in Game Data Records do not select mechanics.
Lead GDRs and InvestigationArchetype GDRs are separate catalogs; a Lead is not automatically an InvestigationArchetype.

# Completion probability

TODO: Provide unambiguous formulas and evaluation order for actual completion, including guaranteed completion, random draws, and the distinction between cumulative and per-turn conditional probability.

# Player uncertainty

TODO: Define the mathematical meaning of displayed estimates/ranges, information used, rounding, and whether/how prior non-completion updates estimates. Which estimates are shown to the player belongs to Player Information.

# Team changes and commitment

TODO: Specify effective-skill-weighted progress loss on removal, the weighting snapshot, exhaustion-driven removal, and abandonment when everyone leaves. Adding agents preserves progress; a new Investigation starts from zero.

# Edge cases and failure behavior

TODO: Define behavior for Zero total effective skill, fractional progress, threshold crossing, removing all or some agents, completion and exhaustion together, and restarting abandoned leads.
State which rules of the same Advance turn apply to a Mission that a completed Investigation creates, under [Turn advancement](../foundation/engine-contract.md#turn-advancement).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Provide numerical worked examples and exact tests for progress, hidden difficulty, true versus estimated probability, team changes, and guaranteed completion.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose every formula and probability interpretation; explicitly resolve how history and team changes affect uncertainty.
- TODO: Decide which InvestigationArchetypes exist, how one is selected when an Investigation starts, and which
  combinations with Leads are permitted.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
