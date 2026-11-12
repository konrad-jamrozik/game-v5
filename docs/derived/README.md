# Derived Specification Views

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

These informative views are derived from the registered Markdown specifications. The source specifications remain authoritative.

- [Alphabetical glossary](glossary.md)
- [Specification relationship graphs](relationships.md)

## Counts by status

| Status     | Specifications |
| ---------- | -------------- |
| Stub       | 18             |
| Draft      | 7              |
| Accepted   | 3              |
| Superseded | 0              |

## Counts by family

| Family     | Specifications |
| ---------- | -------------- |
| Governance | 5              |
| Foundation | 7              |
| Mechanics  | 8              |
| Content    | 1              |
| Interfaces | 5              |
| Acceptance | 1              |
| Guidance   | 1              |

## Governance

| ID    | Document                                                                | Status   | Owns                                                                                     |
| ----- | ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| CONV  | [Specification Conventions](../specs/governance/spec-conventions.md)    | Accepted | How specifications are written, reviewed, and maintained.                                |
| INDEX | [Game Specification Index](../specs/README.md)                          | Draft    | Specification registration, navigation, and ownership summaries.                         |
| PLAN  | [Specification Work Plan and Backlog](../specs/governance/work-plan.md) | Accepted | Specification authoring order, review checkpoints, and work tracking.                    |
| REL   | [Artifact Relationships](../specs/governance/artifact-relationships.md) | Draft    | Artifact relationship terminology, direction, inventories, and graph validation.         |
| TODOS | [Outstanding Work Items](../specs/governance/work-todos.md)             | Draft    | Known outstanding specification issues awaiting scheduling, with their affected batches. |

## Foundation

| ID     | Document                                                                        | Status   | Owns                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMC    | [Campaign Modeling Contract](../specs/foundation/campaign-modeling-contract.md) | Accepted | Campaign state composition, Campaign instance creation, identity/reference integrity, value classification, and historical preservation.          |
| CORE   | [Core Concepts](../specs/foundation/core-concepts.md)                           | Draft    | Shared vocabulary for modeling and engine execution, e.g. Campaign, Session, and Game build.                                                      |
| DOM    | [Domain Model](../specs/foundation/domain-model.md)                             | Draft    | Game concepts, their properties and relationships, and structural domain invariants.                                                              |
| ENG    | [Engine Contract](../specs/foundation/engine-contract.md)                       | Draft    | API hierarchy, Principal authority, Session and campaign lifecycle, bounded Autopilot AI execution, memory, and deterministic history guarantees. |
| HIST   | [History and Persistence](../specs/foundation/history-and-persistence.md)       | Stub     | Define reversible campaign history, reproducible replay, and durable save/load behavior.                                                          |
| NUMRNG | [Numbers and Randomness](../specs/foundation/numbers-and-randomness.md)         | Stub     | Make every numeric calculation and random outcome reproducible across supported runtimes.                                                         |
| TURN   | [Turn Resolution](../specs/foundation/turn-resolution.md)                       | Stub     | Define exactly when subsystem rules run and which state each phase reads.                                                                         |

## Mechanics

| ID      | Document                                                             | Status | Owns                                                                                                  |
| ------- | -------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| AGENT   | [Agents](../specs/mechanics/agents.md)                               | Stub   | Define agent capability, task availability, development, exhaustion, and recovery.                    |
| CAMP    | [Campaign](../specs/mechanics/campaign.md)                           | Stub   | Define campaign initialization, global panic, and the conditions that start and end play.             |
| COMBAT  | [Combat](../specs/mechanics/combat.md)                               | Stub   | Define fully automatic battles and their reproducible results independently of campaign rewards.      |
| ECON    | [Economy and Upgrades](../specs/mechanics/economy-and-upgrades.md)   | Stub   | Define resource flows, personnel purchases, and agency improvements.                                  |
| FACTION | [Factions](../specs/mechanics/factions.md)                           | Stub   | Define escalating faction pressure, operation generation, suppression, and permanent defeat.          |
| INVSTG  | [Investigations](../specs/mechanics/investigations.md)               | Stub   | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs. |
| LEAD    | [Leads and Progression](../specs/mechanics/leads-and-progression.md) | Stub   | Define the progression graph and the lifecycle of Leads, separately from Investigations.              |
| MISSION | [Missions](../specs/mechanics/missions.md)                           | Stub   | Define mission commitments and translate combat results into campaign consequences.                   |

## Content

| ID   | Document                                                         | Status | Owns                                                                                    |
| ---- | ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| INIT | [Initial Campaign Content](../specs/content/initial-campaign.md) | Stub   | Provide the complete, versioned numeric and GDR inputs for the first playable campaign. |

## Interfaces

| ID   | Document                                                        | Status | Owns                                                                                                  |
| ---- | --------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| API  | [TypeScript Player API](../specs/interfaces/typescript-api.md)  | Stub   | Exact TypeScript signatures for Session API, Player API, Developer API, and Autopilot memory API.     |
| CLI  | [Terminal CLI](../specs/interfaces/cli.md)                      | Stub   | Terminal adapter for the four engine API namespaces with Principal-restricted commands and output.    |
| DEV  | [Developer API](../specs/interfaces/developer-api.md)           | Stub   | Full Campaign state inspection and cheat-command details through separately authorized Developer API. |
| INFO | [Player Information](../specs/interfaces/player-information.md) | Stub   | Define complete player-facing knowledge and a consistent boundary around hidden state.                |
| WEB  | [Web UI](../specs/interfaces/web-ui.md)                         | Stub   | Specify the first functional browser interface while keeping gameplay in the shared API.              |

## Acceptance

| ID   | Document                                                                                                      | Status | Owns                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| SCEN | [Campaign Integration and Acceptance Tests](../specs/acceptance/campaign-integration-and-acceptance-tests.md) | Stub   | Define test scenarios that verify how game systems work together. |

## Guidance

| ID     | Document                                                                            | Status | Owns                                                                                                     |
| ------ | ----------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| DEPDIR | [Gameplay Dependency Direction](../specs/guidance/gameplay-dependency-direction.md) | Draft  | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs. |
