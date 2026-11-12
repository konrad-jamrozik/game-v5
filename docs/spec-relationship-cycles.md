# Specification relationship cycles

This informative register records every remaining cyclic component after the uses/refines review. It is outside the
registered specification corpus and introduces no relationships or gameplay requirements. The owning contracts and
their mirrored inventories remain authoritative. Removal approaches below are future design work, not approved
changes to gameplay or the review sequence.

## Coverage and maintenance

The review combines all explicit uses and refines relationships and finds groups in which every document can reach
every other document by following dependency-to-dependent arrows. Such a group is a strongly connected component.
Listing every internal edge covers longer cycles as well as reciprocal pairs without enumerating every possible loop.
The review also includes implicit follows relationships in a separate pass to identify mixed governance cycles.

The complete result is one game component with 11 documents and 41 internal uses edges, one API component with two
documents and two internal uses edges, and one governance component with two documents and two internal edges of
different Relationship kinds. Neither the refines graph nor the follows graph alone
contains a cycle. Core Concepts, Engine Contract, Campaign State, Game Data Records, Timeline, Saves, Configuration, Autopilot, and
Domain Model occur in no cyclic component.
Engine Contract uses only Core Concepts; Campaign State uses Core Concepts and refines Engine Contract;
Domain Model uses Core Concepts, Campaign State, Game Data Records, and Engine Contract. Timeline, Saves, Configuration,
and Autopilot use Engine Contract and no Interfaces specification. The remaining documents do not belong to cycles.
These results were recomputed after History and Persistence was replaced by Timeline, Saves, Configuration, and Autopilot.

When a relationship changes, recompute these components from the registered inventories, check the supporting prose,
and update the diagrams, tables, counts, and removal criteria together. Include all internal edges, including edges
that close longer paths rather than a two-document loop. Remove a component from this register when it is acyclic.
The [Relationship graphs](specs/governance/artifact-relationships.md#relationship-graphs) require this maintenance;
deterministic specification lint alone does not establish the semantic justification or completeness of this report.

## Game component: coupled mechanics, Game Data Records (GDRs), timing, and player information

The justifications describe declared ownership and intended contract detail. Exact formulas, values, timing, and reveal decisions remain unresolved. Each input has a
distinct owner, so the dependencies express cooperation between contracts rather than definitions that explain only
each other. Reassess these justifications as the contracts become concrete.

Every arrow below means **supplier is used by consumer**. All arrows are uses. The table that follows lists the complete
41-edge inventory and supplies linked evidence for the meaning of each edge.

```mermaid
flowchart TD
  AGENT[Agents]
  CAMP[Campaign]
  COMBAT[Combat]
  ECON[Economy and Upgrades]
  FACTION[Factions]
  INFO[Player Information]
  INIT[Initial Campaign Content]
  INVSTG[Investigations]
  LEAD[Leads and Progression]
  MISSION[Missions]
  TURN[Turn Resolution]
  AGENT --> COMBAT & ECON & INFO & INVSTG & MISSION & TURN
  CAMP --> INFO & INIT & TURN
  COMBAT --> AGENT & INFO & MISSION
  ECON --> AGENT & INFO & INIT & MISSION & TURN
  FACTION --> INFO & INIT & LEAD & MISSION & TURN
  INFO --> INVSTG
  INIT --> AGENT & CAMP & ECON & FACTION & LEAD & MISSION
  INVSTG --> INFO & TURN
  LEAD --> FACTION & INFO & INIT & INVSTG
  MISSION --> INFO & INIT & LEAD & TURN
  TURN --> CAMP & ECON
```

The consumer links identify the prose declaring reliance; supplier links identify the owning contracts. Each row
is one direct uses relationship, written actively to avoid reversing the arrow convention.

| Consumer uses                                                                                       | Supplier                                                                                                                                                           | Independently supplied meaning                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Agents — [Overview](specs/mechanics/agents.md#overview)                                             | Combat — [Combat calculations](specs/mechanics/combat.md#combat-calculations)                                                                                      | Battle-earned experience applied to personnel growth           |
| Agents — [Overview](specs/mechanics/agents.md#overview)                                             | Economy and Upgrades — [Upgrade effects](specs/mechanics/economy-and-upgrades.md#upgrade-effects)                                                                  | Economic effects and capability changes applied to personnel   |
| Agents — [Overview](specs/mechanics/agents.md#overview)                                             | Initial Campaign Content — [Starting configuration and parameters](specs/content/initial-campaign.md#starting-configuration-and-parameters)                        | Balance values for agent rules                                 |
| Campaign — [Overview](specs/mechanics/campaign.md#overview)                                         | Initial Campaign Content — [Starting configuration and parameters](specs/content/initial-campaign.md#starting-configuration-and-parameters)                        | Concrete starting state and catalog inputs                     |
| Campaign — [Overview](specs/mechanics/campaign.md#overview)                                         | Turn Resolution — [Phase schedule](specs/foundation/turn-resolution.md#phase-schedule)                                                                             | When campaign predicates read state and are evaluated          |
| Combat — [Overview](specs/mechanics/combat.md#overview)                                             | Agents — [Attributes and effectiveness](specs/mechanics/agents.md#attributes-and-effectiveness)                                                                    | Combatant attributes and capabilities                          |
| Economy and Upgrades — [Overview](specs/mechanics/economy-and-upgrades.md#overview)                 | Agents — [Overview](specs/mechanics/agents.md#overview)                                                                                                            | Personnel state and capabilities used by economic calculations |
| Economy and Upgrades — [Overview](specs/mechanics/economy-and-upgrades.md#overview)                 | Initial Campaign Content — [Starting configuration and parameters](specs/content/initial-campaign.md#starting-configuration-and-parameters)                        | Prices and upgrade increments                                  |
| Economy and Upgrades — [Income and costs](specs/mechanics/economy-and-upgrades.md#income-and-costs) | Turn Resolution — [Phase schedule](specs/foundation/turn-resolution.md#phase-schedule)                                                                             | Evaluation snapshots and income/cost timing                    |
| Factions — [Overview](specs/mechanics/factions.md#overview)                                         | Initial Campaign Content — [GDR catalogs](specs/content/initial-campaign.md#gdr-catalogs)                                                                          | Operation catalogs and numeric values                          |
| Factions — [Overview](specs/mechanics/factions.md#overview)                                         | Leads and Progression — [Completion and unlock effects](specs/mechanics/leads-and-progression.md#completion-and-unlock-effects)                                    | Earned unlock effects and prerequisites                        |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Agents — [Overview](specs/mechanics/agents.md#overview)                                                                                                            | Personnel facts and derived capabilities to expose             |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Campaign — [Overview](specs/mechanics/campaign.md#overview)                                                                                                        | Campaign progression and outcome facts to expose               |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Combat — [Termination and results](specs/mechanics/combat.md#termination-and-results)                                                                              | Battle results used in player reports                          |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Economy and Upgrades — [Overview](specs/mechanics/economy-and-upgrades.md#overview)                                                                                | Resource and capability results to expose                      |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Factions — [Overview](specs/mechanics/factions.md#overview)                                                                                                        | Faction state and operation facts to expose                    |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Investigations — [Player uncertainty](specs/mechanics/investigations.md#player-uncertainty)                                                                        | Estimate mathematics and its conditioning information          |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Leads and Progression — [Prerequisites and lifecycle](specs/mechanics/leads-and-progression.md#prerequisites-and-lifecycle)                                        | Availability and progression results to expose                 |
| Player Information — [Overview](specs/interfaces/player-information.md#overview)                    | Missions — [Overview](specs/mechanics/missions.md#overview)                                                                                                        | Mission lifecycle and outcome facts to expose                  |
| Initial Campaign Content — [Overview](specs/content/initial-campaign.md#overview)                   | Campaign — [Initialization](specs/mechanics/campaign.md#initialization)                                                                                            | Required meaning and coverage of initial state                 |
| Initial Campaign Content — [Overview](specs/content/initial-campaign.md#overview)                   | Economy and Upgrades — [Overview](specs/mechanics/economy-and-upgrades.md#overview)                                                                                | Meaning of prices, increments, and formula parameters          |
| Initial Campaign Content — [Overview](specs/content/initial-campaign.md#overview)                   | Factions — [Faction operation occurrence generation](specs/mechanics/factions.md#faction-operation-occurrence-generation)                                          | Operation catalog requirements                                 |
| Initial Campaign Content — [Overview](specs/content/initial-campaign.md#overview)                   | Leads and Progression — [Overview](specs/mechanics/leads-and-progression.md#overview)                                                                              | Prerequisite and effect semantics for the lead graph           |
| Initial Campaign Content — [Overview](specs/content/initial-campaign.md#overview)                   | Missions — [Overview](specs/mechanics/missions.md#overview)                                                                                                        | Mission catalog requirements and value meanings                |
| Investigations — [Overview](specs/mechanics/investigations.md#overview)                             | Agents — [Attributes and effectiveness](specs/mechanics/agents.md#attributes-and-effectiveness)                                                                    | Team contribution inputs                                       |
| Investigations — [Overview](specs/mechanics/investigations.md#overview)                             | Player Information — [Player-visible information schemas and visibility](specs/interfaces/player-information.md#player-visible-information-schemas-and-visibility) | Exposed field shapes and reveal conditions                     |
| Investigations — [Overview](specs/mechanics/investigations.md#overview)                             | Leads and Progression — [Overview](specs/mechanics/leads-and-progression.md#overview)                                                                              | Lead availability and completion effects                       |
| Leads and Progression — [Overview](specs/mechanics/leads-and-progression.md#overview)               | Factions — [Suppression and defeat](specs/mechanics/factions.md#suppression-and-defeat)                                                                            | Faction state and defeat facts                                 |
| Leads and Progression — [Overview](specs/mechanics/leads-and-progression.md#overview)               | Initial Campaign Content — [GDR catalogs](specs/content/initial-campaign.md#gdr-catalogs)                                                                          | Concrete lead graph and effect GDRs                            |
| Leads and Progression — [Overview](specs/mechanics/leads-and-progression.md#overview)               | Missions — [Overview](specs/mechanics/missions.md#overview)                                                                                                        | Mission lifecycle and outcomes used by progression predicates  |
| Missions — [Overview](specs/mechanics/missions.md#overview)                                         | Agents — [Current assignments and transit](specs/mechanics/agents.md#current-assignments-and-transit)                                                              | Participant eligibility and Current assignment behavior        |
| Missions — [Overview](specs/mechanics/missions.md#overview)                                         | Combat — [Termination and results](specs/mechanics/combat.md#termination-and-results)                                                                              | Battle results converted into campaign consequences            |
| Missions — [Overview](specs/mechanics/missions.md#overview)                                         | Economy and Upgrades — [Overview](specs/mechanics/economy-and-upgrades.md#overview)                                                                                | Capacity and resource-effect semantics                         |
| Missions — [Overview](specs/mechanics/missions.md#overview)                                         | Factions — [Overview](specs/mechanics/factions.md#overview)                                                                                                        | Operation provenance and suppression semantics                 |
| Missions — [Overview](specs/mechanics/missions.md#overview)                                         | Initial Campaign Content — [GDR catalogs](specs/content/initial-campaign.md#gdr-catalogs)                                                                          | Concrete mission GDRs and values                               |
| Turn Resolution — [Overview](specs/foundation/turn-resolution.md#overview)                          | Agents — [Overview](specs/mechanics/agents.md#overview)                                                                                                            | Personnel transitions and effects to schedule                  |
| Turn Resolution — [Overview](specs/foundation/turn-resolution.md#overview)                          | Campaign — [Panic and endings](specs/mechanics/campaign.md#panic-and-endings)                                                                                      | Campaign predicates to evaluate                                |
| Turn Resolution — [Overview](specs/foundation/turn-resolution.md#overview)                          | Economy and Upgrades — [Income and costs](specs/mechanics/economy-and-upgrades.md#income-and-costs)                                                                | Income/cost effects to schedule                                |
| Turn Resolution — [Overview](specs/foundation/turn-resolution.md#overview)                          | Factions — [Overview](specs/mechanics/factions.md#overview)                                                                                                        | Faction transitions and effects to schedule                    |
| Turn Resolution — [Overview](specs/foundation/turn-resolution.md#overview)                          | Investigations — [Overview](specs/mechanics/investigations.md#overview)                                                                                            | Investigation transitions and effects to schedule              |
| Turn Resolution — [Overview](specs/foundation/turn-resolution.md#overview)                          | Missions — [Overview](specs/mechanics/missions.md#overview)                                                                                                        | Mission transitions and effects to schedule                    |

### Why retain this component now, and how to remove it

The complete set of prospective separations for this component is below. Each preserves the distinction between
supplied meanings; none chooses the still-missing gameplay rules.

| Coupling                                         | Reason for current retention                                                                                                                      | Future separation and exit criterion                                                                                                                                                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mechanics and Content specifications             | Mechanics owns parameter meaning; Content specifications own concrete values. Both directions are currently needed to author a playable campaign. | Separate shared GDR Types and parameter contracts from their concrete catalogs. Mechanics consumes typed inputs; Content specifications supply GDRs satisfying those contracts; composition selects catalogs. Exit when these subjects no longer require mechanics-to-catalog-to-mechanics paths. |
| Turn timing and subsystem effects                | Turn Resolution schedules subsystem behavior; Campaign and Economy need its evaluation timing.                                                    | Define explicit phase inputs and effect outputs, making subsystem contracts independent of the scheduler's phase decisions. Exit when Campaign and Economy no longer depend on Turn Resolution and longer return paths are gone.                                                                  |
| Personnel, combat, and economic effects          | Agents owns capability/state transitions; Combat supplies earned experience and Economy supplies capability effects.                              | Separate shared personnel inputs and effect descriptions from the contracts that calculate or apply them. Exit when Agents, Combat, and Economy can be read without reciprocal behavioral dependencies.                                                                                           |
| Faction and lead progression                     | Factions supplies state/defeat facts; Leads supplies unlock effects and prerequisites. Missions contributes outcome facts along longer paths.     | Separate progression facts and effect descriptions from predicates and effect application. Exit when faction and mission facts can be consumed without those producers relying back on the progression evaluator.                                                                                 |
| Investigation mathematics and player information | Investigations supplies estimates; Player Information supplies field shapes and reveal conditions used by the current estimate contract.          | Define estimates over explicit information inputs in Investigations, then let Player Information map permitted Player-visible information to those inputs and expose the results. Exit when Investigations no longer depends on Player Information.                                               |

The component is resolved only when recomputation finds no multi-document cyclic component among these documents.
Removing individual reciprocal pairs is insufficient if longer cycles survive. As each separation is implemented,
update this register with the remaining components and evidence rather than marking the entire group resolved early.

## API component: callable signatures and full-state inspection

```mermaid
flowchart LR
  API[TypeScript Player API] -->|uses| DEV[Developer API]
  DEV -->|uses| API
```

Every arrow means **supplier is used by consumer**. This is the complete internal-edge inventory:

| Consumer uses                                                                   | Supplier                                                                                              | Independently supplied meaning                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| TypeScript Player API — [Overview](specs/interfaces/typescript-api.md#overview) | Developer API — [Inspection contract](specs/interfaces/developer-api.md#inspection-contract)          | Full Campaign state query schemas and developer access results |
| Developer API — [Overview](specs/interfaces/developer-api.md#overview)          | TypeScript Player API — [Functions and types](specs/interfaces/typescript-api.md#functions-and-types) | Callable Dev mode controls and full-state query surface        |

Developer API owns full-state inspection and Dev mode policy; TypeScript Player API owns callable signatures. A future
removal could separate shared state-view contracts and access-mode lifecycle policy from their callable adapters. The
exit criterion is no multi-document component containing both documents.

## Governance component: relationship language and document conventions

```mermaid
flowchart LR
  CONV[Specification Conventions] -->|implicit follows| REL[Artifact Relationships]
  REL -->|uses| CONV
```

This is the complete internal-edge inventory:

| Dependency → Dependent                             | Kind             | Independently supplied meaning and evidence                                                                                                                                                                                                                      |
| -------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specification Conventions → Artifact Relationships | Implicit follows | Conventions — [Implicit relationships](specs/governance/spec-conventions.md#implicit-relationships) supplies document structure, lifecycle, and writing rules for every other registered specification.                                                          |
| Artifact Relationships → Specification Conventions | Uses             | Artifact Relationships — [Relationship kinds](specs/governance/artifact-relationships.md#relationship-kinds) supplies relationship meanings used by the conventions — [Relationship inventories](specs/governance/spec-conventions.md#relationship-inventories). |

The meanings are independently stated: writing rules govern a document that defines the relationship vocabulary.
The relationship definition does not need a missing definition supplied only by the writing rule.

A future removal could consolidate the relationship language and inventory rules into Specification Conventions and
retire the separate REL contract with explicit requirement migration. That would require a separately reviewed
governance change. The exit criterion is no multi-document component containing CONV and REL after including implicit
follows edges, with all definitions and requirement references preserved. Until then this mixed cycle stays documented.
