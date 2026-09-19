# Derived Specification Views

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

These informative views are derived from the registered Markdown specifications. The source specifications remain authoritative.

- [Alphabetical glossary](glossary.md)
- [Specification relationship graphs](relationships.md)

## Counts by status

| Status     | Specifications |
| ---------- | -------------- |
| Stub       | 18             |
| Draft      | 5              |
| Accepted   | 2              |
| Superseded | 0              |

## Counts by family

| Family     | Specifications |
| ---------- | -------------- |
| Governance | 4              |
| Foundation | 6              |
| Mechanics  | 8              |
| Content    | 1              |
| Interfaces | 5              |
| Acceptance | 1              |

## Governance

| ID    | Document                                                                | Status   | Scope                                                                   | Owns                                                                             |
| ----- | ----------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| CONV  | [Specification Conventions](../specs/governance/spec-conventions.md)    | Accepted | Writing, reviewing, and maintaining game-v5 specifications              | How specifications are written, reviewed, and maintained.                        |
| INDEX | [Game Specification Index](../specs/README.md)                          | Draft    | Navigation, document ownership, and spec-development order              | Specification registration, navigation, and ownership summaries.                 |
| PLAN  | [Specification Work Plan and Backlog](../specs/governance/work-plan.md) | Accepted | Specification authoring order, review checkpoints, and backlog tracking | Specification authoring order, review checkpoints, and work tracking.            |
| REL   | [Artifact Relationships](../specs/governance/artifact-relationships.md) | Draft    | Relationship terminology, direction, inventories, and graph validation  | Artifact relationship terminology, direction, inventories, and graph validation. |

## Foundation

| ID     | Document                                                                  | Status | Scope                                                                                                                          | Owns                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DOM    | [Domain Model](../specs/foundation/domain-model.md)                       | Draft  | Game concepts, their properties and relationships, and structural domain invariants                                            | Game concepts, their properties and relationships, and structural domain invariants.                                                                   |
| ENG    | [Engine Contract](../specs/foundation/engine-contract.md)                 | Draft  | Execution, continuation, compatibility, query and information boundaries, and committed-state integrity                        | Calculation, continuation, build compatibility, information access, and committed-state guarantees.                                                    |
| HIST   | [History and Persistence](../specs/foundation/history-and-persistence.md) | Stub   | Define reversible sessions, reproducible replay, and durable save/load behavior.                                               | Define reversible sessions, reproducible replay, and durable save/load behavior.                                                                       |
| MODEL  | [Modeling Foundations](../specs/foundation/modeling-foundations.md)       | Draft  | Modeling vocabulary, TypeScript types/content entries/campaign instances, identity and references, and historical preservation | Modeling vocabulary, TypeScript types, archetypes, three-component campaign instances, construction, identity/references, and historical preservation. |
| NUMRNG | [Numbers and Randomness](../specs/foundation/numbers-and-randomness.md)   | Stub   | Make every numeric calculation and random outcome reproducible across supported runtimes.                                      | Make every numeric calculation and random outcome reproducible across supported runtimes.                                                              |
| TURN   | [Turn Resolution](../specs/foundation/turn-resolution.md)                 | Stub   | Define exactly when subsystem rules run and which state each phase reads.                                                      | Define exactly when subsystem rules run and which state each phase reads.                                                                              |

## Mechanics

| ID      | Document                                                             | Status | Scope                                                                                                         | Owns                                                                                                          |
| ------- | -------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| AGENT   | [Agents](../specs/mechanics/agents.md)                               | Stub   | Define agent capability, task availability, development, exhaustion, and recovery.                            | Define agent capability, task availability, development, exhaustion, and recovery.                            |
| CAMP    | [Campaign](../specs/mechanics/campaign.md)                           | Stub   | Define campaign initialization, global panic, and the conditions that start and end play.                     | Define campaign initialization, global panic, and the conditions that start and end play.                     |
| COMBAT  | [Combat](../specs/mechanics/combat.md)                               | Stub   | Define fully automatic battles and their reproducible results independently of campaign rewards.              | Define fully automatic battles and their reproducible results independently of campaign rewards.              |
| ECON    | [Economy and Upgrades](../specs/mechanics/economy-and-upgrades.md)   | Stub   | Define resource flows, personnel purchases, and agency improvements.                                          | Define resource flows, personnel purchases, and agency improvements.                                          |
| FACTION | [Factions](../specs/mechanics/factions.md)                           | Stub   | Define escalating faction pressure, operation generation, suppression, and permanent defeat.                  | Define escalating faction pressure, operation generation, suppression, and permanent defeat.                  |
| INVSTG  | [Investigations](../specs/mechanics/investigations.md)               | Stub   | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.         | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.         |
| LEAD    | [Leads and Progression](../specs/mechanics/leads-and-progression.md) | Stub   | Define the progression graph and the lifecycle of lead opportunities, separately from investigation attempts. | Define the progression graph and the lifecycle of lead opportunities, separately from investigation attempts. |
| MISSION | [Missions](../specs/mechanics/missions.md)                           | Stub   | Define mission commitments and translate combat results into campaign consequences.                           | Define mission commitments and translate combat results into campaign consequences.                           |

## Content

| ID   | Document                                                         | Status | Scope                                                                                       | Owns                                                                                        |
| ---- | ---------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| INIT | [Initial Campaign Content](../specs/content/initial-campaign.md) | Stub   | Provide the complete, versioned numeric and content inputs for the first playable campaign. | Provide the complete, versioned numeric and content inputs for the first playable campaign. |

## Interfaces

| ID   | Document                                                        | Status | Scope                                                                                        | Owns                                                                                         |
| ---- | --------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| API  | [TypeScript Player API](../specs/interfaces/typescript-api.md)  | Stub   | Define the callable TypeScript contract through which humans and AI can fully play the game. | Define the callable TypeScript contract through which humans and AI can fully play the game. |
| CLI  | [Terminal CLI](../specs/interfaces/cli.md)                      | Stub   | Provide a complete terminal adapter usable by humans and AI over the same player API.        | Provide a complete terminal adapter usable by humans and AI over the same player API.        |
| DEV  | [Developer API](../specs/interfaces/developer-api.md)           | Stub   | Expose full authoritative state for debugging through a separate, explicit API surface.      | Expose full authoritative state for debugging through a separate, explicit API surface.      |
| INFO | [Player Information](../specs/interfaces/player-information.md) | Stub   | Define complete player-facing knowledge and a consistent boundary around hidden state.       | Define complete player-facing knowledge and a consistent boundary around hidden state.       |
| WEB  | [Web UI](../specs/interfaces/web-ui.md)                         | Stub   | Specify the first functional browser interface while keeping gameplay in the shared API.     | Specify the first functional browser interface while keeping gameplay in the shared API.     |

## Acceptance

| ID   | Document                                                                                                      | Status | Scope                                                             | Owns                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| SCEN | [Campaign Integration and Acceptance Tests](../specs/acceptance/campaign-integration-and-acceptance-tests.md) | Stub   | Define test scenarios that verify how game systems work together. | Define test scenarios that verify how game systems work together. |
