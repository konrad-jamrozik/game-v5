# Derived Specification Views

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

These informative views are derived from the registered Markdown specifications. The source specifications remain authoritative.

- [Alphabetical glossary](glossary.md)
- [Specification relationship graphs](relationships.md)

## Counts by status

| Status     | Specifications |
| ---------- | -------------- |
| Stub       | 17             |
| Draft      | 10             |
| Accepted   | 5              |
| Superseded | 0              |

## Counts by family

| Family         | Specifications |
| -------------- | -------------- |
| Governance     | 5              |
| Foundation     | 10             |
| Mechanics      | 9              |
| Content        | 0              |
| Interfaces     | 5              |
| Acceptance     | 1              |
| Implementation | 2              |

## Governance

| ID    | Document                                                                | Status   | Owns                                                                                     |
| ----- | ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| CONV  | [Specification Conventions](../specs/governance/spec-conventions.md)    | Accepted | How specifications are written, reviewed, and maintained.                                |
| INDEX | [Game Specification Index](../specs/README.md)                          | Draft    | Specification registration, navigation, and ownership summaries.                         |
| PLAN  | [Specification Work Plan and Backlog](../specs/governance/work-plan.md) | Accepted | Specification authoring order, review checkpoints, and work tracking.                    |
| REL   | [Artifact Relationships](../specs/governance/artifact-relationships.md) | Draft    | Artifact relationship terminology, direction, inventories, and graph validation.         |
| TODOS | [Outstanding Work Items](../specs/governance/work-todos.md)             | Draft    | Known outstanding specification issues awaiting scheduling, with their affected batches. |

## Foundation

| ID       | Document                                                      | Status   | Owns                                                                                                                                                  |
| -------- | ------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTO     | [Autopilot](../specs/foundation/autopilot.md)                 | Draft    | Autopilot limits, what an Autopilot AI receives, Autopilot engagement lifecycle, and Autopilot memory.                                                |
| CONFIG   | [Configuration](../specs/foundation/configuration.md)         | Draft    | Kinds of setting, Global configuration, and the configuration cascade.                                                                                |
| CORE     | [Core Concepts](../specs/foundation/core-concepts.md)         | Accepted | Shared vocabulary for modeling and engine execution, e.g. Campaign, Session, and Game build.                                                          |
| CSTATE   | [Campaign State](../specs/foundation/campaign-state.md)       | Accepted | Campaign state composition, Campaign instance creation, identity/reference integrity, value classification, and historical preservation.              |
| DOM      | [Domain Model](../specs/foundation/domain-model.md)           | Draft    | Game concepts, how they relate, and the structural invariants that span several concepts.                                                             |
| ENG      | [Engine Contract](../specs/foundation/engine-contract.md)     | Draft    | API hierarchy, Principal authority, Session and campaign lifecycle, data ownership, determinism, and the guarantees shared by every engine subsystem. |
| GDR      | [Game Data Records](../specs/foundation/game-data-records.md) | Accepted | The purposes a GDR can serve relative to game behavior and Campaign state, with a worked example of each.                                             |
| NUMBERS  | [Numbers](../specs/foundation/numbers.md)                     | Stub     | Which quantities are whole numbers, the precision of those that are not, and how rounding works.                                                      |
| SAVES    | [Saves](../specs/foundation/saves.md)                         | Draft    | Campaign save contents, saving, loading, Autosaves, the Save size limit, and Game build compatibility.                                                |
| TIMELINE | [Timeline](../specs/foundation/timeline.md)                   | Draft    | Undo and redo of the Committed actions of the current Turn, undo and redo across Turns, and what a restored Committed state guarantees.               |

## Mechanics

| ID      | Document                                                             | Status | Owns                                                                                                                                          |
| ------- | -------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AGENT   | [Agents](../specs/mechanics/agents-spec.md)                          | Stub   | Define what an Agent has and can do: agent capability, task availability, development, and the meaning of health, exhaustion, and experience. |
| COMBAT  | [Combat](../specs/mechanics/combat.md)                               | Stub   | Define fully automatic battles and their reproducible results independently of campaign rewards.                                              |
| ECON    | [Economy and Upgrades](../specs/mechanics/economy-and-upgrades.md)   | Stub   | Define resource flows, personnel purchases, and agency improvements.                                                                          |
| ENDING  | [Panic and Endings](../specs/mechanics/panic-and-endings.md)         | Stub   | Define global panic, the conditions that end a Campaign, and what remains possible after an ending.                                           |
| FACTION | [Factions](../specs/mechanics/factions.md)                           | Stub   | Define escalating faction pressure, operation generation, suppression, and permanent defeat.                                                  |
| INVSTG  | [Investigations](../specs/mechanics/investigations.md)               | Stub   | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.                                         |
| LEAD    | [Leads and Progression](../specs/mechanics/leads-and-progression.md) | Stub   | Define the progression graph and the lifecycle of Leads, separately from Investigations.                                                      |
| MISSION | [Missions](../specs/mechanics/missions.md)                           | Stub   | Define mission commitments and translate combat results into campaign consequences.                                                           |
| RECOVER | [Agent Recovery](../specs/mechanics/agent-recovery.md)               | Stub   | Define how an Agent's health goes up and exhaustion goes down, and the result when several rules change one of those values in the same turn. |

## Content

| ID  | Document | Status | Owns |
| --- | -------- | ------ | ---- |

## Interfaces

| ID   | Document                                                        | Status | Owns                                                                                                                             |
| ---- | --------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| API  | [TypeScript Player API](../specs/interfaces/typescript-api.md)  | Stub   | Exact TypeScript signatures for Session API, Player API, Developer API, and Autopilot memory API.                                |
| CLI  | [Terminal CLI](../specs/interfaces/cli.md)                      | Stub   | Terminal adapter for the four engine API namespaces with Principal-restricted commands and output.                               |
| DEV  | [Developer API](../specs/interfaces/developer-api.md)           | Stub   | Full Campaign state inspection, cheat-command details, and random outcome overrides through separately authorized Developer API. |
| INFO | [Player Information](../specs/interfaces/player-information.md) | Stub   | Define complete player-facing knowledge and a consistent boundary around hidden state.                                           |
| WEB  | [Web UI](../specs/interfaces/web-ui.md)                         | Stub   | Specify the first functional browser interface while keeping gameplay in the shared API.                                         |

## Acceptance

| ID   | Document                                                                                                      | Status | Owns                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| SCEN | [Campaign Integration and Acceptance Tests](../specs/acceptance/campaign-integration-and-acceptance-tests.md) | Stub   | Define test scenarios that verify how game systems work together. |

## Implementation

| ID     | Document                                                                                  | Status | Owns                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| DEPDIR | [Gameplay Dependency Direction](../specs/implementation/gameplay-dependency-direction.md) | Draft  | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs. |
| SCHEMA | [Storage Schema](../specs/implementation/storage-schema.md)                               | Stub   | Non-behavioural guidance on the physical layout of everything the game persists.                         |
