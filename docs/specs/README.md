# Game Specification Index

| Metadata | Value                                                      |
| -------- | ---------------------------------------------------------- |
| Spec ID  | INDEX                                                      |
| Status   | Draft                                                      |
| Scope    | Navigation, document ownership, and spec-development order |

## Start here

- [Game Design Brief](../game-design-brief.md): strategic intent and architectural constraints.
- [Specification conventions](spec-conventions.md): accepted layout, precision requirements, ownership, and lifecycle.
- [Specification Relationships](specification-relationships.md): Draft definitions of `follows`, `refines`, `uses`,
  `implements`, and `verifies`, with implicit defaults, compact relationship listings, and examples.
- [Specification work plan and backlog](work-plan.md): accepted review batches, parallel tracks, checkpoints, and current work state.

[Domain Model](foundation/domain-model.md), [Modeling Foundations](foundation/modeling-foundations.md), and
[Engine Contract](foundation/engine-contract.md) are **Draft**, in review for batch 1. The other 18 subject documents remain
**Stub** documents. No subject specification has been accepted yet.
The conventions are **Accepted**; their acceptance reference is recorded in that document. Exact formulas, content values,
public signatures, and frameworks have not been chosen.
Specification Relationships is a separate governance Draft. The requested simplified relationship listings are recorded in the
conventions; existing inventory migration is tracked in the work plan.
The work plan is **Accepted**; its acceptance reference is recorded in that document. This does not accept or implement the subject specifications.

## Specification register

| ID      | Document                                                          | Owns                                                                                                          |
| ------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| CONV    | [Specification conventions](spec-conventions.md)                  | How specifications are written, reviewed, and maintained.                                                     |
| REL     | [Specification Relationships](specification-relationships.md) | Relationship terminology, edge direction, document inventories, and graph validation. |
| PLAN    | [Specification work plan and backlog](work-plan.md)               | Specification authoring order, review checkpoints, and work tracking.                                         |
| DOM     | [Domain Model](foundation/domain-model.md)                        | Game concepts, their properties and relationships, and structural domain invariants.           |
| MOD     | [Modeling Foundations](foundation/modeling-foundations.md) | Modeling vocabulary, definition boundaries, identity/references, and historical fact preservation. |
| ENG     | [Engine Contract](foundation/engine-contract.md) | Calculation, continuation, information access, and committed-state guarantees. |
| NUM     | [Numbers and Randomness](foundation/numbers-and-randomness.md)    | Make every numeric calculation and random outcome reproducible across supported runtimes.                     |
| TURN    | [Turn Resolution](foundation/turn-resolution.md)                  | Define exactly when subsystem rules run and which state each phase reads.                                     |
| HIST    | [History and Persistence](foundation/history-and-persistence.md)  | Define reversible sessions, reproducible replay, and durable save/load behavior.                              |
| CAMP    | [Campaign](mechanics/campaign.md)                                 | Define campaign initialization, global panic, and the conditions that start and end play.                     |
| AGENT   | [Agents](mechanics/agents.md)                                     | Define agent capability, task availability, development, fatigue, and recovery.                               |
| ECON    | [Economy and Upgrades](mechanics/economy-and-upgrades.md)         | Define resource flows, personnel purchases, and agency improvements.                                          |
| LEAD    | [Leads and Progression](mechanics/leads-and-progression.md)       | Define the progression graph and the lifecycle of lead opportunities, separately from investigation attempts. |
| INV     | [Investigations](mechanics/investigations.md)                     | Define exact investigation progress, stochastic completion, player uncertainty, and commitment costs.         |
| COMBAT  | [Combat](mechanics/combat.md)                                     | Define fully automatic battles and their reproducible results independently of campaign rewards.              |
| MISSION | [Missions](mechanics/missions.md)                                 | Define mission commitments and translate combat results into campaign consequences.                           |
| FACTION | [Factions](mechanics/factions.md)                                 | Define escalating faction pressure, operation generation, suppression, and permanent defeat.                  |
| INIT    | [Initial Campaign Content](content/initial-campaign.md)           | Provide the complete, versioned numeric and content inputs for the first playable campaign.                   |
| INFO    | [Player Information](interfaces/player-information.md)            | Define complete player-facing knowledge and a consistent boundary around hidden state.                        |
| API     | [TypeScript Player API](interfaces/typescript-api.md)             | Define the callable TypeScript contract through which humans and AI can fully play the game.                  |
| DEV     | [Developer API](interfaces/developer-api.md)                      | Expose full authoritative state for debugging through a separate, explicit API surface.                       |
| CLI     | [Terminal CLI](interfaces/cli.md)                                 | Provide a complete terminal adapter usable by humans and AI over the same player API.                         |
| WEB     | [Web UI](interfaces/web-ui.md)                                    | Specify the first functional browser interface while keeping gameplay in the shared API.                      |
| SCEN    | [Campaign Integration and Acceptance Tests](testing/campaign-integration-and-acceptance-tests.md) | Define test scenarios that verify how game systems work together.                              |

## Work plan

The [work plan and backlog](work-plan.md) owns the accepted authoring sequence and review checkpoints. Start with
the three batch 1 drafts; grow content and acceptance scenarios alongside the reviewed mechanics. See that document for
the full sequence, current work states, and treatment of cross-spec dependencies.

## Index completion TODOs

The three-document split of the former Domain Model was approved by the project owner with "I love it. Do it."
This approves the organization, not the proposed rules. Read Domain Model for game concepts, Modeling Foundations for
modeling conventions, and Engine Contract for execution guarantees.

- TODO: Link separately agreed implementation milestones once the first playable slice is selected; authoring order is tracked in the work plan.
- TODO: Track acceptance references and update this register if a document is split, renamed, or superseded.
- TODO: Maintain links to the final requirement owners and integration scenarios as draft rules replace placeholders.
