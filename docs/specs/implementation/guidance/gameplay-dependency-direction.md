# Gameplay Dependency Direction

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | DEPDIR                                                                                                                                                                                     |
| Family      | Guidance                                                                                                                                                                                   |
| Audience    | Implementer                                                                                                                                                                                |
| Owns        | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs.                                                                                   |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Game behavior is easiest to check when, for any piece of it, one can see exactly which values it consults. The
suggested way to keep that visible is to hand gameplay code what it needs, rather than let it reach for whatever else is
nearby.

So a Gameplay function should receive only the inputs and dependencies it needs, and a Campaign instance should hold no
reference to the [Campaign state](../../design/foundation/campaign-state.md) that contains it. Code outside the engine should
stay further away still: user interface code and Autopilot AI code should reach the game only through the engine API of
the [Engine Contract](../../design/foundation/engine-contract.md), so that every interface shows the same answer.

This guidance supports [Determinism](../../design/foundation/determinism-and-randomness.md#determinism), which guarantees that
execution has no hidden inputs; an implementation may also meet that guarantee by other means.

# Relationships

- Uses [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md)
- Uses [Campaign State](../../design/foundation/campaign-state.md)
- Uses [Core Concepts](../../design/foundation/core-concepts.md)
- Uses [Engine Contract](../../design/foundation/engine-contract.md)
- Uses [Web UI](../../design/ui/web-ui.md)

# Glossary

| Term              | Definition                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Gameplay function | Implementation code that carries out game behavior while executing a committed Player action, including code that creates Campaign instances. |

# Dependency direction

Gameplay functions should receive only the inputs and dependencies they need; they should not reach any other part of
Campaign state, directly or indirectly. This includes the code that creates Campaign instances during gameplay.
Campaign instances should not hold references to the Campaign state that contains them. This guidance excludes
Session API and Developer API operations, which may access complete Campaign state.

User interface code, e.g. the code of the [Web UI](../../design/ui/web-ui.md), depends on game behavior only through the engine
API: it never reads Campaign state directly and never calls a Gameplay function. Autopilot AI code, e.g. the code of the
[Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md), is held to the same restriction more narrowly: it reaches
the game only through Player API and Autopilot memory API, so it cannot see beyond Player-visible information.

What Player API returns about earlier Turns is worked out once, inside the engine, behind the queries of
[Current state, Turn report, and history](../../design/foundation/world-history.md#current-state-turn-report-and-history).
User interface code and Autopilot AI code read those values from the queries and do not derive them again from other
query results; e.g., none of them works out the Turn in which a Mission site was Expired by counting down from its
creation. Every interface then shows the same answer, and a change to a rule changes that answer in one place.

# Supported observable contract

**Informative rationale:** Narrow inputs make it easy to see which values a piece of game behavior consults, so an
implementation can check that every such value is part of Campaign state. The observable property this supports, that
execution has no hidden inputs, is guaranteed by [Determinism](../../design/foundation/determinism-and-randomness.md#determinism):
equal initial Campaign state, the same Game build, and the same ordered Player actions produce equal results. An
implementation that satisfies that guarantee by other means also satisfies every specification.
