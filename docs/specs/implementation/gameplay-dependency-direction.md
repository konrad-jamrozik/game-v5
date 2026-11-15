# Gameplay Dependency Direction

| Metadata    | Value                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Spec ID     | DEPDIR                                                                                                   |
| Family      | Implementation                                                                                           |
| Status      | Draft                                                                                                    |
| Audience    | Implementer                                                                                              |
| Owns        | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                           |

# Overview

Gameplay code stays isolated from the [Campaign state](../foundation/campaign-state.md) that contains it. A Gameplay
function receives only the inputs and dependencies it needs, and a Campaign instance holds no reference to the Campaign
state that contains it. User interface code and Autopilot AI code reach the game only through the engine API of the
[Engine Contract](../foundation/engine-contract.md).

# Relationships

- Uses [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Uses [Campaign State](../foundation/campaign-state.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Web UI](../ui/web-ui.md)

# Glossary

| Term              | Definition                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gameplay function | Implementation code that carries out game behavior while executing a committed Player API or Developer API action, including code that creates Campaign instances. |

# Dependency direction

Gameplay functions must receive only the inputs and dependencies they need; they must not reach any other part of
Campaign state, directly or indirectly. This includes the code that creates Campaign instances during gameplay.
Campaign instances must not hold references to the Campaign state that contains them. These restrictions exclude
Session API and Developer API operations, which may access complete Campaign state.

User interface code, e.g. the code of the [Web UI](../ui/web-ui.md), depends on game behavior only through the engine
API: it never reads Campaign state directly and never calls a Gameplay function. Autopilot AI code, e.g. the code of the
[Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md), is held to the same restriction more narrowly: it reaches
the game only through Player API and Autopilot memory API, so it cannot see beyond Player-visible information.

What Player API returns about earlier Turns is worked out once, inside the engine, behind the queries of
[Current state, Turn report, and history](../foundation/engine-contract.md#current-state-turn-report-and-history).
User interface code and Autopilot AI code read those values from the queries and do not derive them again from other
query results; e.g., none of them works out the Turn in which a Mission site was Expired by counting down from its
creation. Every interface then shows the same answer, and a change to a rule changes that answer in one place.

# Supported observable contract

**Informative rationale:** Narrow inputs make it easy to see which values a piece of game behavior consults, so an
implementation can check that every such value is part of Campaign state. The observable property this supports, that
execution has no hidden inputs, is guaranteed by [Determinism](../foundation/determinism-and-randomness.md#determinism):
equal initial Campaign state, the same Game build, and the same ordered Player actions produce equal results. An
implementation that satisfies that guarantee by other means also satisfies every specification.
