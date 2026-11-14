# Derived Specification Views

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

These informative views are derived from the registered Markdown specifications. The source specifications remain authoritative.

- [Alphabetical glossary](glossary.md)
- [Specification relationship graphs](relationships.md)

## Counts by status

| Status     | Specifications |
| ---------- | -------------- |
| Stub       | 3              |
| Draft      | 27             |
| Accepted   | 3              |
| Superseded | 0              |

## Counts by family

| Family         | Specifications |
| -------------- | -------------- |
| Governance     | 5              |
| Foundation     | 12             |
| Mechanics      | 11             |
| Content        | 1              |
| UI             | 1              |
| Autopilot AIs  | 1              |
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

| ID       | Document                                                                        | Status   | Owns                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTO     | [Autopilot](../specs/foundation/autopilot.md)                                   | Draft    | Autopilot limits, what an Autopilot AI receives, Autopilot engagement lifecycle, and Autopilot memory.                                       |
| CONFIG   | [Configuration](../specs/foundation/configuration.md)                           | Draft    | Kinds of setting, Global configuration, and the configuration cascade.                                                                       |
| CORE     | [Core Concepts](../specs/foundation/core-concepts.md)                           | Accepted | Shared vocabulary for modeling and engine execution, e.g. Campaign, Session, and Game build.                                                 |
| CSTATE   | [Campaign State](../specs/foundation/campaign-state.md)                         | Accepted | Campaign state composition, Campaign instance creation, identity/reference integrity, value classification, and historical preservation.     |
| DETERM   | [Determinism and Randomness](../specs/foundation/determinism-and-randomness.md) | Draft    | The determinism guarantee, the Campaign seed, rules for every random outcome, and unique identifiers under replay.                           |
| DEV      | [Developer Access](../specs/foundation/developer-access.md)                     | Stub     | Dev mode, full Campaign state inspection, cheat operations, and random outcome overrides.                                                    |
| ENG      | [Engine Contract](../specs/foundation/engine-contract.md)                       | Accepted | API hierarchy, Principal authority, data ownership, the Engine subsystem inventory, and the guarantees shared by every engine subsystem.     |
| GDR      | [Game Data Records](../specs/foundation/game-data-records.md)                   | Draft    | The purposes a GDR can serve relative to game behavior and Campaign state, with a worked example of each.                                    |
| LIFE     | [Campaign Lifecycle](../specs/foundation/campaign-lifecycle.md)                 | Draft    | Session start and end, creating, loading, selecting, and closing the Current campaign, and Session status.                                   |
| NUMBERS  | [Numbers](../specs/foundation/numbers.md)                                       | Draft    | That every stored quantity is a whole number, the rounding operations, how percentages and probabilities are computed, and exact evaluation. |
| SAVES    | [Saves](../specs/foundation/saves.md)                                           | Draft    | Campaign save contents, saving, loading, Autosaves, the Save size limit, and Game build compatibility.                                       |
| TIMELINE | [Timeline](../specs/foundation/timeline.md)                                     | Draft    | Undo and redo of the Player actions of the current Turn, undo and redo across Turns, and what a restored Committed state guarantees.         |

## Mechanics

| ID      | Document                                                             | Status | Owns                                                                                                                                                                                                                        |
| ------- | -------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AGENT   | [Agents](../specs/mechanics/agents-spec.md)                          | Draft  | What an Agent has, the Agent lifecycle, Current assignments and the transit rule, effective skill, Training, Agent creation and the initial roster, and the assignAgents and addAgents actions.                             |
| COMBAT  | [Combat](../specs/mechanics/combat.md)                               | Draft  | Enemies and the Combat GDRs, how a Battle is fought Round by Round, attacks and their random outcomes, Incapacitated, Combat rating, Battle outcomes, and the Battle result.                                                |
| DOM     | [Domain Model](../specs/mechanics/domain-model.md)                   | Draft  | Game concepts, how they relate, and the structural invariants that span several concepts.                                                                                                                                   |
| ECON    | [Economy and Upgrades](../specs/mechanics/economy-and-upgrades.md)   | Draft  | The Agency's money, funding, and Upgrade acquisitions, Agency income and upkeep, the Agent cap, Transport cap, and Training cap, Upgrade effects, and the hireAgent, dismissAgents, purchaseUpgrade, and addMoney actions.  |
| ENDING  | [Panic and Endings](../specs/mechanics/panic-and-endings.md)         | Draft  | Panic and how this turn's changes to it are applied, the conditions that end a Campaign in Victory or Defeat, and what remains possible after a Campaign ending.                                                            |
| FACTION | [Factions](../specs/mechanics/factions.md)                           | Draft  | What a Faction has, its creation, its escalation through Faction activity levels, Faction operation occurrence generation, and defeat.                                                                                      |
| INVSTG  | [Investigations](../specs/mechanics/investigations.md)               | Draft  | What an Investigation has, the InvestigationArchetype GDR, the Investigation lifecycle, the startInvestigation and assignAgentsToInvestigation actions, leaving and abandonment, and Investigation progress and completion. |
| LEAD    | [Leads and Progression](../specs/mechanics/leads-and-progression.md) | Draft  | What a Lead GDR describes, Lead progression and its recording, Lead availability, and the effect of completing a Lead.                                                                                                      |
| MISSION | [Missions](../specs/mechanics/missions.md)                           | Draft  | What a Mission site and its Mission have, Mission site creation, the Mission site lifecycle, the deployAgents action, Mission resolution, expiry, and the consequences for the Campaign.                                    |
| RECOVER | [Agent Recovery](../specs/mechanics/agent-recovery.md)               | Draft  | Health recovery and exhaustion recovery of Agents, the RecoveryParameters GDR, and the result when several rules change one of those values in the same turn.                                                               |
| TURN    | [Turn Advancement](../specs/mechanics/turn-advancement.md)           | Draft  | The canonical order of Turn advancement steps and which values each step uses.                                                                                                                                              |

## Content

| ID   | Document                                             | Status | Owns                                                                                                                                        |
| ---- | ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| BOOT | [Bootstrap GDRs](../specs/content/bootstrap-gdrs.md) | Draft  | Which Game Data Records (GDRs) a Game build supplies so that a first playable Campaign can start, and how those GDRs form the Victory path. |

## UI

| ID  | Document                        | Status | Owns                                                                                             |
| --- | ------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| WEB | [Web UI](../specs/ui/web-ui.md) | Stub   | Guidance on the screens of the browser user interface and what each shows the Player by default. |

## Autopilot AIs

| ID      | Document                                                           | Status | Owns                                                                                                                    |
| ------- | ------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| BASICAI | [Basic Autopilot AI](../specs/autopilot-ais/basic-autopilot-ai.md) | Draft  | The goals the Basic Autopilot AI pursues, how it prioritizes them within a turn, and what it deliberately leaves alone. |

## Implementation

| ID     | Document                                                                                  | Status | Owns                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| DEPDIR | [Gameplay Dependency Direction](../specs/implementation/gameplay-dependency-direction.md) | Draft  | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs. |
| SCHEMA | [Storage Schema](../specs/implementation/storage-schema.md)                               | Stub   | Non-behavioural guidance on the physical layout of everything the game persists.                         |
