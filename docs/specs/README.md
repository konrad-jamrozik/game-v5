# Game Specification Index

| Metadata | Value      |
| -------- | ---------- |
| Spec ID  | INDEX      |
| Family   | Governance |
| Status   | Draft      |

# Purpose and boundaries

This index registers every specification's stable ID, Family, title, and ownership scope. It also provides navigation and
the current specification-development status. It does not define gameplay behavior.

# Relationships

No explicit relationships.

# Glossary

None.

# Start here

- [Game Design Brief](../game-design-brief.md): strategic intent and architectural constraints.
- [Specification conventions](governance/spec-conventions.md): accepted layout, precision requirements, ownership, and lifecycle.
- [Artifact Relationships](governance/artifact-relationships.md): definitions of `follows`, `refines`, `uses`,
  `implements`, and `verifies`, with direction, inventory rules, and examples for all artifacts.
- [Specification relationship cycles](../spec-relationship-cycles.md): informative register of retained cycles,
  their contract meanings, and future removal criteria.
- [Specification work plan and backlog](governance/work-plan.md): accepted review batches, parallel tracks, checkpoints, and current work state.

# Specification register

| ID      | Family     | Document                                                                                             | Owns                                                                                                                                      |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| INDEX   | Governance | [Game Specification Index](README.md)                                                                | Specification registration, navigation, and ownership summaries.                                                                          |
| CONV    | Governance | [Specification Conventions](governance/spec-conventions.md)                                          | How specifications are written, reviewed, and maintained.                                                                                 |
| REL     | Governance | [Artifact Relationships](governance/artifact-relationships.md)                                       | Artifact relationship terminology, direction, inventories, and graph validation.                                                          |
| PLAN    | Governance | [Specification Work Plan and Backlog](governance/work-plan.md)                                       | Specification authoring order, review checkpoints, and work tracking.                                                                     |
| DOM     | Foundation | [Domain Model](foundation/domain-model.md)                                                           | Game concepts, their properties and relationships, and structural domain invariants.                                                      |
| MODEL   | Foundation | [Modeling Foundations](foundation/modeling-foundations.md)                                           | Modeling vocabulary, Types, archetypes, four-property Campaign instances, construction, identity/references, and historical preservation. |
| ENG     | Foundation | [Engine Contract](foundation/engine-contract.md)                                                     | API hierarchy, role authority, campaign lifecycle, bounded Delegated AI execution, memory, and deterministic history guarantees.          |
| NUMRNG  | Foundation | [Numbers and Randomness](foundation/numbers-and-randomness.md)                                       | Make every numeric calculation and random outcome reproducible across supported runtimes.                                                 |
| TURN    | Foundation | [Turn Resolution](foundation/turn-resolution.md)                                                     | Define exactly when subsystem rules run and which state each phase reads.                                                                 |
| HIST    | Foundation | [History and Persistence](foundation/history-and-persistence.md)                                     | Define reversible sessions, reproducible replay, and durable save/load behavior.                                                          |
| CAMP    | Mechanics  | [Campaign](mechanics/campaign.md)                                                                    | Define campaign initialization, global panic, and the conditions that start and end play.                                                 |
| AGENT   | Mechanics  | [Agents](mechanics/agents.md)                                                                        | Define agent capability, task availability, development, exhaustion, and recovery.                                                        |
| ECON    | Mechanics  | [Economy and Upgrades](mechanics/economy-and-upgrades.md)                                            | Define resource flows, personnel purchases, and agency improvements.                                                                      |
| LEAD    | Mechanics  | [Leads and Progression](mechanics/leads-and-progression.md)                                          | Define the progression graph and the lifecycle of Leads, separately from Investigations.                                                  |
| INVSTG  | Mechanics  | [Investigations](mechanics/investigations.md)                                                        | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.                                     |
| COMBAT  | Mechanics  | [Combat](mechanics/combat.md)                                                                        | Define fully automatic battles and their reproducible results independently of campaign rewards.                                          |
| MISSION | Mechanics  | [Missions](mechanics/missions.md)                                                                    | Define mission commitments and translate combat results into campaign consequences.                                                       |
| FACTION | Mechanics  | [Factions](mechanics/factions.md)                                                                    | Define escalating faction pressure, operation generation, suppression, and permanent defeat.                                              |
| INIT    | Content    | [Initial Campaign Content](content/initial-campaign.md)                                              | Provide the complete, versioned numeric and GDR inputs for the first playable campaign.                                                   |
| INFO    | Interfaces | [Player Information](interfaces/player-information.md)                                               | Define complete player-facing knowledge and a consistent boundary around hidden state.                                                    |
| API     | Interfaces | [TypeScript Player API](interfaces/typescript-api.md)                                                | Exact TypeScript signatures for Session API, Player API, Developer API, and Delegated AI API.                                             |
| DEV     | Interfaces | [Developer API](interfaces/developer-api.md)                                                         | Full Campaign state inspection and cheat-command details through separately authorized Developer API.                                     |
| CLI     | Interfaces | [Terminal CLI](interfaces/cli.md)                                                                    | Terminal adapter for the four engine API namespaces with role-restricted commands and output.                                             |
| WEB     | Interfaces | [Web UI](interfaces/web-ui.md)                                                                       | Specify the first functional browser interface while keeping gameplay in the shared API.                                                  |
| SCEN    | Acceptance | [Campaign Integration and Acceptance Tests](acceptance/campaign-integration-and-acceptance-tests.md) | Define test scenarios that verify how game systems work together.                                                                         |

# Work plan

The [work plan and backlog](governance/work-plan.md) owns the accepted authoring sequence and review checkpoints. Start with
the three batch 1 specifications; grow GDRs and acceptance scenarios alongside the reviewed mechanics. See that document for
the full sequence, current work states, and treatment of cross-specification dependencies.

# Index completion TODOs

- TODO: Link separately agreed implementation milestones once the first playable slice is selected; authoring order is tracked in the work plan.
- TODO: Track acceptance references and update this register if a document is split, renamed, or superseded.
- TODO: Maintain links to the final requirement owners and integration scenarios as draft rules replace placeholders.
