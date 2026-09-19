# Campaign Integration and Acceptance Tests

| Metadata    | Value                                                             |
| ----------- | ----------------------------------------------------------------- |
| Spec ID     | SCEN                                                              |
| Family      | Acceptance                                                        |
| Status      | Stub                                                              |
| Scope       | Define test scenarios that verify how game systems work together. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)    |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

This document defines test scenarios that verify how game systems work together. Each scenario specifies a starting
state, player actions, and expected results derived from the game specifications. These scenarios guide automated
integration and end-to-end tests.

Most scenarios can exercise the game through the TypeScript Player API without a browser. A smaller set exercises the
CLI or web UI to verify that equivalent actions produce equivalent results and respect the same information boundary.
This document describes the test cases; the executable tests and their test framework belong to implementation work.

Individual mechanics specifications keep examples of their own rules. This document connects those rules across systems, for example, investigation completion creating a mission whose result changes agent health, agency resources, and progression.
Expected results must reference the owning rules; scenarios cannot introduce new mechanics. Strategic playtesting
assesses whether the game is interesting and balanced separately from these exact behavior checks.

This is currently a stub: the concrete test cases await the detailed rules and Content entries they will exercise.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Initial Campaign Content](../content/initial-campaign.md)
- Uses [Terminal CLI](../interfaces/cli.md)
- Uses [Turn Resolution](../foundation/turn-resolution.md)
- Uses [TypeScript Player API](../interfaces/typescript-api.md)
- Uses [Web UI](../interfaces/web-ui.md)

# Glossary

| Term             | Meaning in this document                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Test scenario    | A specified starting state, sequence of actions, and expected results                                                                                                          |
| Fixture          | The Content entries, Campaign state, and random seed or RNG state needed to reproduce a scenario                                                                               |
| Integration test | A test that exercises several game systems together, typically through the player API                                                                                          |
| End-to-end test  | A test that exercises a player flow through an interface and checks its resulting Player observations and game effects                                                         |
| Acceptance test  | A test that checks whether behavior satisfies referenced specification [requirements](../governance/spec-conventions.md#glossary); it can be an integration or end-to-end test |

# Concepts and contract

This Stub uses Initial Campaign Content for reproducible inputs, Turn Resolution for effect timing, and History and
Persistence for continuation scenarios. TypeScript Player API, Terminal CLI, and Web UI supply the action surfaces
under test. Specific checked requirements acquire implicit verifies relationships when scenarios identify them;
these document-level uses entries do not claim that tests already exist or pass.

TODO: Specify Scenario fixture, game revision when needed for reproducibility, seed or RNG state, command sequence,
expected state/view, and requirement reference.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Deterministic fixtures

TODO: Define scenario IDs, exact starting state, Content entry fixture, seed, ordered commands, expected results, and references
to owning requirements. Record the game revision when needed for reproducibility. Identify any test-only reduced scenario
explicitly.

## Integration scenarios

TODO: Cover resource allocation, transit, investigation uncertainty/abandonment, deadline pressure, transport contention, partial-success missions, faction escalation/suppression, and campaign endings.

## Interface flows and history

TODO: Cover equivalent API/CLI/web actions, player/dev visibility, invalid-action atomicity, replay, save/load, undo/redo,
and branching. Identify which cases run through the API and which need CLI or browser interaction. Keep strategic
playtesting observations separate from exact expected-result checks.

TODO: Assign stable SCEN-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Specify test cases for same-turn interactions between systems, endpoint thresholds, hidden-state restoration,
failed command batches, and attempts to load saves from incompatible earlier builds. Derive exact expected outcomes,
thresholds, and effect ordering from their owning specifications. If a required rule is missing, record that dependency
instead of choosing behavior in a test scenario.

# Acceptance examples

TODO: Write complete expected outcomes, not just test names; scenarios must reference rules rather than introduce new mechanics.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose the initial integration fixtures after their owning mechanics are resolved; record later-stage interface scenarios as pending.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
