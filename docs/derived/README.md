# Derived Specification Views

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

These informative views are derived from the registered Markdown specifications. The source specifications remain authoritative.

- [Alphabetical glossary](glossary.md)
- [Specification relationship graphs](relationships.md)

## Counts by status

| Status     | Specifications |
| ---------- | -------------- |
| Stub       | 13             |
| Draft      | 18             |
| Accepted   | 1              |
| Superseded | 0              |

## Counts by family

| Family         | Specifications |
| -------------- | -------------- |
| Governance     | 5              |
| Foundation     | 12             |
| Mechanics      | 11             |
| Content        | 1              |
| UI             | 1              |
| Implementation | 2              |

## Governance

| ID    | Document                                                                | Status | Owns                                                                                     |
| ----- | ----------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| CONV  | [Specification Conventions](../specs/governance/spec-conventions.md)    | Draft  | How specifications are written, reviewed, and maintained.                                |
| INDEX | [Game Specification Index](../specs/README.md)                          | Draft  | Specification registration, navigation, and ownership summaries.                         |
| PLAN  | [Specification Work Plan and Backlog](../specs/governance/work-plan.md) | Draft  | Specification authoring order, review checkpoints, and work tracking.                    |
| REL   | [Artifact Relationships](../specs/governance/artifact-relationships.md) | Draft  | Artifact relationship terminology, direction, inventories, and graph validation.         |
| TODOS | [Outstanding Work Items](../specs/governance/work-todos.md)             | Draft  | Known outstanding specification issues awaiting scheduling, with their affected batches. |

## Foundation

| ID       | Document                                                                        | Status   | Owns                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| AUTO     | [Autopilot](../specs/foundation/autopilot.md)                                   | Draft    | Autopilot limits, what an Autopilot AI receives, Autopilot engagement lifecycle, and Autopilot memory.                                   |
| CONFIG   | [Configuration](../specs/foundation/configuration.md)                           | Draft    | Kinds of setting, Global configuration, and the configuration cascade.                                                                   |
| CORE     | [Core Concepts](../specs/foundation/core-concepts.md)                           | Accepted | Shared vocabulary for modeling and engine execution, e.g. Campaign, Session, and Game build.                                             |
| CSTATE   | [Campaign State](../specs/foundation/campaign-state.md)                         | Draft    | Campaign state composition, Campaign instance creation, identity/reference integrity, value classification, and historical preservation. |
| DETERM   | [Determinism and Randomness](../specs/foundation/determinism-and-randomness.md) | Draft    | The determinism guarantee, the Campaign seed, rules for every random outcome, and unique identifiers under replay.                       |
| DEV      | [Developer Access](../specs/foundation/developer-access.md)                     | Stub     | Dev mode, full Campaign state inspection, cheat operations, and random outcome overrides.                                                |
| ENG      | [Engine Contract](../specs/foundation/engine-contract.md)                       | Draft    | API hierarchy, Principal authority, data ownership, the Engine subsystem inventory, and the guarantees shared by every engine subsystem. |
| GDR      | [Game Data Records](../specs/foundation/game-data-records.md)                   | Draft    | The purposes a GDR can serve relative to game behavior and Campaign state, with a worked example of each.                                |
| LIFE     | [Campaign Lifecycle](../specs/foundation/campaign-lifecycle.md)                 | Draft    | Session start and end, creating, loading, selecting, and closing the Current campaign, and Session status.                               |
| NUMBERS  | [Numbers](../specs/foundation/numbers.md)                                       | Stub     | Which quantities are whole numbers, the precision of those that are not, and how rounding works.                                         |
| SAVES    | [Saves](../specs/foundation/saves.md)                                           | Draft    | Campaign save contents, saving, loading, Autosaves, the Save size limit, and Game build compatibility.                                   |
| TIMELINE | [Timeline](../specs/foundation/timeline.md)                                     | Draft    | Undo and redo of the Player actions of the current Turn, undo and redo across Turns, and what a restored Committed state guarantees.     |

## Mechanics

| ID      | Document                                                             | Status | Owns                                                                                                                                          |
| ------- | -------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AGENT   | [Agents](../specs/mechanics/agents-spec.md)                          | Stub   | Define what an Agent has and can do: agent capability, task availability, development, and the meaning of health, exhaustion, and experience. |
| COMBAT  | [Combat](../specs/mechanics/combat.md)                               | Stub   | Define fully automatic battles and their reproducible results independently of campaign rewards.                                              |
| DOM     | [Domain Model](../specs/mechanics/domain-model.md)                   | Draft  | Game concepts, how they relate, and the structural invariants that span several concepts.                                                     |
| ECON    | [Economy and Upgrades](../specs/mechanics/economy-and-upgrades.md)   | Stub   | Define resource flows, personnel purchases, and agency improvements.                                                                          |
| ENDING  | [Panic and Endings](../specs/mechanics/panic-and-endings.md)         | Stub   | Define global panic, the conditions that end a Campaign, and what remains possible after an ending.                                           |
| FACTION | [Factions](../specs/mechanics/factions.md)                           | Stub   | Define escalating faction pressure, operation generation, suppression, and permanent defeat.                                                  |
| INVSTG  | [Investigations](../specs/mechanics/investigations.md)               | Stub   | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.                                         |
| LEAD    | [Leads and Progression](../specs/mechanics/leads-and-progression.md) | Stub   | Define the progression graph and the lifecycle of Leads, separately from Investigations.                                                      |
| MISSION | [Missions](../specs/mechanics/missions.md)                           | Stub   | Define mission commitments and translate combat results into campaign consequences.                                                           |
| RECOVER | [Agent Recovery](../specs/mechanics/agent-recovery.md)               | Stub   | Define how an Agent's health goes up and exhaustion goes down, and the result when several rules change one of those values in the same turn. |
| TURN    | [Turn Advancement](../specs/mechanics/turn-advancement.md)           | Draft  | The canonical order of Turn advancement steps and which values each step uses.                                                                |

## Content

| ID   | Document                                             | Status | Owns                                                                                                                                        |
| ---- | ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| BOOT | [Bootstrap GDRs](../specs/content/bootstrap-gdrs.md) | Draft  | Which Game Data Records (GDRs) a Game build supplies so that a first playable Campaign can start, and how those GDRs form the Victory path. |

## UI

| ID  | Document                        | Status | Owns                                                                                             |
| --- | ------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| WEB | [Web UI](../specs/ui/web-ui.md) | Stub   | Guidance on the screens of the browser user interface and what each shows the Player by default. |

## Implementation

| ID     | Document                                                                                  | Status | Owns                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| DEPDIR | [Gameplay Dependency Direction](../specs/implementation/gameplay-dependency-direction.md) | Draft  | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs. |
| SCHEMA | [Storage Schema](../specs/implementation/storage-schema.md)                               | Stub   | Non-behavioural guidance on the physical layout of everything the game persists.                         |
