# Gameplay Dependency Direction

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | DEPDIR                                                         |
| Family      | Guidance                                                       |
| Status      | Draft                                                          |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Steer implementers to keep gameplay code isolated from the Campaign state that contains it. This document is
non-behavioural Guidance: it owns no Rule, observable contract, or GDR, and no acceptance test depends on it.
Campaign data integrity and continuation guarantees remain owned by Engine Contract and Campaign Modeling Contract.

# Relationships

- Uses [Campaign Modeling Contract](../foundation/campaign-modeling-contract.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)

# Glossary

| Term              | Definition                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gameplay function | Implementation code that applies gameplay Rules while executing a committed Player API or Developer API action, including code that creates Campaign instances. |

# Concepts and contract

## Dependency direction

Gameplay functions must receive only the inputs and dependencies they need; they must not reach any other part of
Campaign state, directly or indirectly. This includes the code that creates Campaign instances during gameplay.
Campaign instances must not hold references to the Campaign state that contains them. These restrictions exclude
campaign creation, save/load, and external engine interfaces, which may access complete Campaign state.

## Supported observable contract

**Informative rationale:** Narrow inputs make it easy to see which values a Rule consults, so an implementation can
check that every such value is part of Campaign state. The observable property this supports, that execution has no
hidden inputs, is already guaranteed by [Continuation state](../foundation/engine-contract.md#continuation-state) in
Engine Contract: equal initial Campaign state, the same Game build, and the same ordered committed commands produce
equal results. An implementation that satisfies that guarantee by other means also satisfies every specification.

# Edge cases and failure behavior

Not applicable — this Guidance document defines no behavior, so no input, state, or failure can violate it
observably. Failures of the supported guarantee are defined by [Continuation state](../foundation/engine-contract.md#continuation-state).

# Acceptance examples

Not applicable — no acceptance test depends on Guidance. Acceptance examples for the supported guarantee belong to
[Continuation state](../foundation/engine-contract.md#continuation-state) in Engine Contract.
