# Gameplay Dependency Direction

| Metadata | Value |
| --- | --- |
| Spec ID | DEPDIR |
| Family | Guidance |
| Audience | Implementer |
| Owns | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

The Game rules are easiest to check when, for any one of them, one can see exactly which values it reads. The suggested way to keep that visible is to hand gameplay code what it needs, rather than let it reach for whatever else is nearby, and to keep code outside the engine further away still, so that every interface shows the same answer.

Narrow inputs let an implementation check that every value a rule reads is part of Campaign state, which supports [Determinism](../../design/foundation/determinism-and-randomness.md#determinism): execution has no hidden inputs. An implementation may also meet that guarantee by other means.

# Glossary

| Term | Definition |
| --- | --- |
| Gameplay function | Implementation code that carries out the [Game rules](../../design/foundation/core-concepts.md#game-build-and-content) while executing a committed [Player action](../../design/foundation/engine-contract.md#player-actions-and-turns), including code that creates [Campaign instances](../../design/foundation/core-concepts.md#campaign-instances). |

# Dependency direction

Gameplay functions should receive only the inputs and dependencies they need; they should not reach any other part of [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session), directly or indirectly. This includes the code that creates Campaign instances during gameplay. Campaign instances should not hold references to the Campaign state that contains them. This guidance excludes [Session API](../../design/foundation/engine-contract.md#api-surfaces) and [Developer API](../../design/foundation/engine-contract.md#api-surfaces) operations, which may access complete Campaign state.

User interface code, e.g. the code of the [Graphical User Interface](../../design/ui/gui.md), depends on the Game rules only through the engine API of the [Engine Contract](../../design/foundation/engine-contract.md): it never reads Campaign state directly and never calls a Gameplay function. [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) code, e.g. the code of the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md#glossary), is held to the same restriction more narrowly: it reaches the game only through [Player API](../../design/foundation/engine-contract.md#api-surfaces), so it cannot see beyond [Player-visible information](../../design/foundation/engine-contract.md#api-surfaces).

What [Player API](../../design/foundation/engine-contract.md#api-surfaces) returns about earlier [Turns](../../design/foundation/engine-contract.md#player-actions-and-turns) is worked out once, inside the engine, behind the queries of [Current world state, Turn report, and history](../../design/foundation/world-history.md#current-world-state-turn-report-and-history). User interface code and Autopilot AI code read those values from the queries and do not derive them again from other query results; e.g., none of them works out the Turn in which a [Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) was Expired by counting down from its creation. A change to a rule then changes that answer in one place.
