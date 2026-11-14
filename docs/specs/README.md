# Game Specification Index

| Metadata | Value                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Spec ID  | INDEX                                                                    |
| Family   | Governance                                                               |
| Status   | Draft                                                                    |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |

# Overview

This index registers every specification's stable ID, Family, title, and ownership scope. It also provides navigation and
the current specification-development status. It does not define gameplay behavior.

# Start here

- [Game Design Brief](../game-design-brief.md): strategic intent and architectural constraints.
- [Specification conventions](governance/spec-conventions.md): accepted layout, precision requirements, ownership, and lifecycle.
- [Artifact Relationships](governance/artifact-relationships.md): definitions of `follows`, `refines`, `uses`,
  `implements`, and `verifies`, with direction, inventory rules, and examples for all artifacts.
- [Specification relationship cycles](../spec-relationship-cycles.md): informative register of retained cycles,
  their contract meanings, and future removal criteria.
- [Specification work plan and backlog](governance/work-plan.md): accepted review batches, parallel tracks, checkpoints, and current work state.
- [Outstanding work items](governance/work-todos.md): known issues in the specifications awaiting scheduling, each with its affected batches.

# Family overviews

Each Family has an informative overview that explains what each of its specifications is for, how they relate, and why
the boundaries between them sit where they do. Each overview includes generated relationship diagrams.

- [About the Governance family](governance/about-governance.md)
- [About the Foundation family](foundation/about-foundation.md)
- [About the Mechanics family](mechanics/about-mechanics.md)
- [About the Content family](content/about-content.md)
- [About the Acceptance family](acceptance/about-acceptance.md)
- [About the Implementation family](implementation/about-implementation.md)

# Specification register

| ID       | Family         | Document                                                                                             | Owns                                                                                                                                          |
| -------- | -------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| INDEX    | Governance     | [Game Specification Index](README.md)                                                                | Specification registration, navigation, and ownership summaries.                                                                              |
| CONV     | Governance     | [Specification Conventions](governance/spec-conventions.md)                                          | How specifications are written, reviewed, and maintained.                                                                                     |
| REL      | Governance     | [Artifact Relationships](governance/artifact-relationships.md)                                       | Artifact relationship terminology, direction, inventories, and graph validation.                                                              |
| PLAN     | Governance     | [Specification Work Plan and Backlog](governance/work-plan.md)                                       | Specification authoring order, review checkpoints, and work tracking.                                                                         |
| TODOS    | Governance     | [Outstanding Work Items](governance/work-todos.md)                                                   | Known outstanding specification issues awaiting scheduling, with their affected batches.                                                      |
| DOM      | Foundation     | [Domain Model](foundation/domain-model.md)                                                           | Game concepts, how they relate, and the structural invariants that span several concepts.                                                     |
| CORE     | Foundation     | [Core Concepts](foundation/core-concepts.md)                                                         | Shared vocabulary for modeling and engine execution, e.g. Campaign, Session, and Game build.                                                  |
| CSTATE   | Foundation     | [Campaign State](foundation/campaign-state.md)                                                       | Campaign state composition, Campaign instance creation, identity/reference integrity, value classification, and historical preservation.      |
| GDR      | Foundation     | [Game Data Records](foundation/game-data-records.md)                                                 | The purposes a GDR can serve relative to game behavior and Campaign state, with a worked example of each.                                     |
| ENG      | Foundation     | [Engine Contract](foundation/engine-contract.md)                                                     | API hierarchy, Principal authority, data ownership, the Engine subsystem inventory, and the guarantees shared by every engine subsystem.      |
| LIFE     | Foundation     | [Campaign Lifecycle](foundation/campaign-lifecycle.md)                                               | Session start and end, creating, loading, selecting, and closing the Current campaign, and Session status.                                    |
| DEV      | Foundation     | [Developer Access](foundation/developer-access.md)                                                   | Dev mode, full Campaign state inspection, cheat operations, and random outcome overrides.                                                     |
| DETERM   | Foundation     | [Determinism and Randomness](foundation/determinism-and-randomness.md)                               | The determinism guarantee, the Campaign seed, rules for every random outcome, and unique identifiers under replay.                            |
| TURN     | Foundation     | [Turn Advancement](foundation/turn-advancement.md)                                                   | The canonical order of Turn advancement steps and which values each step uses.                                                                |
| NUMBERS  | Foundation     | [Numbers](foundation/numbers.md)                                                                     | Which quantities are whole numbers, the precision of those that are not, and how rounding works.                                              |
| TIMELINE | Foundation     | [Timeline](foundation/timeline.md)                                                                   | Undo and redo of the Player actions of the current Turn, undo and redo across Turns, and what a restored Committed state guarantees.          |
| SAVES    | Foundation     | [Saves](foundation/saves.md)                                                                         | Campaign save contents, saving, loading, Autosaves, the Save size limit, and Game build compatibility.                                        |
| CONFIG   | Foundation     | [Configuration](foundation/configuration.md)                                                         | Kinds of setting, Global configuration, and the configuration cascade.                                                                        |
| AUTO     | Foundation     | [Autopilot](foundation/autopilot.md)                                                                 | Autopilot limits, what an Autopilot AI receives, Autopilot engagement lifecycle, and Autopilot memory.                                        |
| ENDING   | Mechanics      | [Panic and Endings](mechanics/panic-and-endings.md)                                                  | Define global panic, the conditions that end a Campaign, and what remains possible after an ending.                                           |
| AGENT    | Mechanics      | [Agents](mechanics/agents-spec.md)                                                                   | Define what an Agent has and can do: agent capability, task availability, development, and the meaning of health, exhaustion, and experience. |
| ECON     | Mechanics      | [Economy and Upgrades](mechanics/economy-and-upgrades.md)                                            | Define resource flows, personnel purchases, and agency improvements.                                                                          |
| LEAD     | Mechanics      | [Leads and Progression](mechanics/leads-and-progression.md)                                          | Define the progression graph and the lifecycle of Leads, separately from Investigations.                                                      |
| INVSTG   | Mechanics      | [Investigations](mechanics/investigations.md)                                                        | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.                                         |
| COMBAT   | Mechanics      | [Combat](mechanics/combat.md)                                                                        | Define fully automatic battles and their reproducible results independently of campaign rewards.                                              |
| MISSION  | Mechanics      | [Missions](mechanics/missions.md)                                                                    | Define mission commitments and translate combat results into campaign consequences.                                                           |
| FACTION  | Mechanics      | [Factions](mechanics/factions.md)                                                                    | Define escalating faction pressure, operation generation, suppression, and permanent defeat.                                                  |
| RECOVER  | Mechanics      | [Agent Recovery](mechanics/agent-recovery.md)                                                        | Define how an Agent's health goes up and exhaustion goes down, and the result when several rules change one of those values in the same turn. |
| SCEN     | Acceptance     | [Campaign Integration and Acceptance Tests](acceptance/campaign-integration-and-acceptance-tests.md) | Define test scenarios that verify how game systems work together.                                                                             |
| DEPDIR   | Implementation | [Gameplay Dependency Direction](implementation/gameplay-dependency-direction.md)                     | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs.                                      |
| SCHEMA   | Implementation | [Storage Schema](implementation/storage-schema.md)                                                   | Non-behavioural guidance on the physical layout of everything the game persists.                                                              |

# Work plan

The [work plan and backlog](governance/work-plan.md) owns the accepted authoring sequence and review checkpoints. Start with
the batch 1 specifications; grow GDRs and acceptance scenarios alongside the reviewed mechanics. See that document for
the full sequence, current work states, and treatment of cross-specification dependencies.

# Index completion TODOs

- TODO: Link separately agreed implementation milestones once the first playable slice is selected; authoring order is tracked in the work plan.
- TODO: Update this register if a document is split, renamed, or superseded.
- TODO: Maintain links to the final requirement owners and integration scenarios as draft rules replace placeholders.
