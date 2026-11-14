# Gameplay Dependency Direction

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | DEPDIR                                                         |
| Family      | Implementation                                                 |
| Status      | Draft                                                          |
| Audience    | Implementer                                                    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document steers implementers to keep gameplay code isolated from the Campaign state that contains it. It is
a non-behavioural Implementation document: it owns no game behavior, observable contract, or GDR, and no acceptance test depends on it.
Committed state integrity and determinism guarantees remain owned by Engine Contract and Campaign State.

# Relationships

- Uses [Campaign State](../foundation/campaign-state.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)

# Glossary

| Term              | Definition                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gameplay function | Implementation code that carries out game behavior while executing a committed Player API or Developer API action, including code that creates Campaign instances. |

# Dependency direction

Gameplay functions must receive only the inputs and dependencies they need; they must not reach any other part of
Campaign state, directly or indirectly. This includes the code that creates Campaign instances during gameplay.
Campaign instances must not hold references to the Campaign state that contains them. These restrictions exclude Session API and Developer API operations, which may access complete Campaign state.

# Supported observable contract

**Informative rationale:** Narrow inputs make it easy to see which values a piece of game behavior consults, so an implementation can
check that every such value is part of Campaign state. The observable property this supports, that execution has no
hidden inputs, is already guaranteed by [Determinism](../foundation/engine-contract.md#determinism) in
Engine Contract: equal initial Campaign state, the same Game build, and the same ordered Player actions produce
equal results. An implementation that satisfies that guarantee by other means also satisfies every specification.
