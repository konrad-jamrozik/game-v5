# Storage Schema

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | SCHEMA                                                         |
| Family      | Implementation                                                 |
| Status      | Stub                                                           |
| Audience    | Implementer                                                    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document steers implementers toward one physical layout for everything the game persists. It is a
non-behavioural Implementation document: it owns no game behavior, observable contract, or GDR, and no acceptance test
depends on it. What is persisted, and what saving and loading observably do, remain owned by
[Data ownership](../foundation/engine-contract.md#data-ownership) in Engine Contract, [Saves](../foundation/saves.md),
and [Timeline](../foundation/timeline.md).

# Relationships

- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Saves](../foundation/saves.md)
- Uses [Timeline](../foundation/timeline.md)

# Persisted layout

TODO: Describe one physical layout covering every part of Game storage under
[Data ownership](../foundation/engine-contract.md#data-ownership): Global configuration, and for each Campaign save
its identifiers, Campaign state, Timeline, and Autopilot memory.

TODO: Suggest how Timeline positions are stored, e.g. as complete copies of Campaign state, as Timeline entries
reapplied from the Baseline, or as a mix of both.

TODO: Suggest a Campaign save encoding and how a Game build recognises a Campaign save it rejects under
[Game build compatibility](../foundation/saves.md#game-build-compatibility).

# Supported observable contract

**Informative rationale:** Any layout that satisfies [Saves](../foundation/saves.md),
[Timeline](../foundation/timeline.md), and [Determinism](../foundation/engine-contract.md#determinism) satisfies
every specification, including one that ignores this document.
