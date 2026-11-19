# Campaign State

| Metadata | Value |
| --- | --- |
| Spec ID | CSTATE |
| Family | Foundation |
| Audience | Engine designer, Content designer, Implementer |
| Owns | What Campaign state is made of, what the Game rules read of it, and how Campaign initialization produces it. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Each [Campaign](core-concepts.md#campaign-and-session) has its own world, its own past, and its own settings, e.g. its Agents, the Missions it has fought, and its starting money. Together with what undo needs, these are its [Campaign state](core-concepts.md#campaign-and-session), and a Campaign save holds exactly that. Campaign State builds on Core Concepts: Core Concepts says what Campaign state is, and Campaign State says what it is made of.

Campaign state is organized by what changes it. Each Player action of the current Turn adds a World state to the Timeline, and undo and redo only choose which World state is current; a thing that leaves play stays in the World state, set apart from what is still in play. Ending a Turn writes the History, which nothing within a Turn can change. The Campaign configuration holds the settings, of which play may adjust only a few, and no change to it rewrites a World state that already exists.

# Glossary

These terms are specific to Campaign State. General terms are in the [Core Concepts glossary](core-concepts.md#glossary) and the [Engine Contract glossary](engine-contract.md#glossary); terms about the past are in the [History and Turn Report glossary](world-history.md#glossary).

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| World state | The data describing the [Campaign](core-concepts.md#campaign-and-session)'s simulated world at one [Committed state](engine-contract.md#player-actions-and-turns): its Live world state and its Retired world state. The [Timeline](engine-contract.md#persisted-data) holds one World state for each Committed state it holds. |  |
| Live world state | The part of a World state other than its Retired world state: every [Campaign instance](core-concepts.md#campaign-instances) still in play, and every other value of the world, e.g. the turn number. | Active world state |
| Retired world state | The part of a World state holding every Campaign instance that has left play, e.g. a Killed Agent or an Expired Mission site, each with every property at its final value. | Archived; archival; became historical; deconstructed; destroyed. Legitimate destruction mechanics remain valid, and leaving play does not replace named lifecycle states, e.g. Killed and Completed. |
| History | The component of [Campaign state](core-concepts.md#campaign-and-session) that keeps the ended [Turns](engine-contract.md#player-actions-and-turns) of the Campaign, from its start: a record of each ended Turn and the past values that charts show. | World history. Participation history and Git history remain valid. |
| Campaign configuration | The component of Campaign state containing the campaign-specific parameters that campaign creation sets and that the [Game rules](core-concepts.md#game-build-and-content) read to select or adjust how the game plays. Each parameter is either adjustable during play, under [Changing Campaign configuration during play](configuration.md#changing-campaign-configuration-during-play) in Configuration, or fixed after creation. | Scenario, naming campaign setup; scenario GDR; scenario setup. Unrelated uses of "configuration" remain valid. |
| Turn report | The component of Campaign state describing what the most recent committed Advance turn did, i.e. the Turn advancement from the previous Turn to the current one, e.g. each Combat it fought and how that Combat went. The first Turn of a Campaign has no Turn report. |  |

# Campaign state composition

Campaign state is one part of the data the engine keeps, under [Data ownership](engine-contract.md#data-ownership) in Engine Contract, and a [Campaign save](engine-contract.md#persisted-data) holds exactly the Campaign state, under [Campaign save contents](saves.md#campaign-save-contents) in Saves. Campaign state has the following complete conceptual hierarchy.

```text
Campaign state
├── Timeline (of the current Turn)
│   ├── Turn-start state (a World state)
│   └── Timeline entries (zero or more)
│       └── Timeline entry
│           ├── Player action
│           └── World state that Player action produced
├── Timeline pointer
├── History
│   ├── History entries (one for each ended Turn)
│   └── Turn series
├── Campaign configuration
└── Turn report (none in the first Turn)

World state
├── Live world state
└── Retired world state
```

The following table states where each component is specified. It is complete.

| Component | Specified in |
| --- | --- |
| Timeline and [Timeline pointer](engine-contract.md#persisted-data) | [Timeline structure](timeline.md#timeline-structure) and [Action navigation](timeline.md#action-navigation) in Timeline |
| History | [Turn series](world-history.md#turn-series) and [Turn report and history](world-history.md#turn-report-and-history) in History and Turn Report |
| Campaign configuration | [Configuration](configuration.md) |
| Turn report | [Turn report and history](world-history.md#turn-report-and-history) in History and Turn Report |

Every Campaign instance is part of a World state, never of the History or of Campaign configuration. Every other value of the simulated world is part of the Live world state too, e.g. the [Campaign seed](determinism-and-randomness.md#campaign-seed). The hierarchy is conceptual and requires no storage layout; e.g., an implementation need not store a full copy of each World state the Timeline holds.

# What the Game rules read

Every outcome of the Game rules, i.e. whether a [Player action](engine-contract.md#player-actions-and-turns) is permitted, what it changes, and what Advance turn does, depends only on the current Committed state, the History, the Campaign configuration, and the [GDRs](core-concepts.md#game-build-and-content) of the [Game build](core-concepts.md#game-build-and-content). The Game rules read no other World state the Timeline holds, and neither the Timeline pointer nor the Turn report affects an outcome. Queries read the same data, and also report the Turn report and what the Timeline holds of the current Turn, under [Current state, Turn report, and history](world-history.md#current-state-turn-report-and-history) in History and Turn Report.

# World state and History

A World state and the History divide the Campaign's world by when it can change. The following rules are complete:

- **Leaving play:** A Campaign instance that leaves play moves from the Live world state to the Retired world state of the World state that its Player action or Advance turn produces, and it stays in the Retired world state of every later World state. It never moves into the History. Undo therefore brings back a Campaign instance that a Player action of the current Turn took out of play, e.g. a Dismissed Agent, because the World state before that Player action still holds it in the Live world state. The specification owning each Campaign instance [Type](core-concepts.md#data-modeling) states when its Campaign instances leave play.
- **Facts that change during a Turn:** A value that the Game rules read and that can change during a Turn is part of the World state, not of the History, so that undo returns it to its earlier value; e.g., an Agent's Participation history, which grows when the player recalls the Agent from an Investigation.
- **The History changes only at the end of a Turn:** The History holds only what the end of a Turn writes. Only Advance turn changes it, under [Turn report and history](world-history.md#turn-report-and-history) in History and Turn Report, so undo and redo within a Turn never reach it, and the History needs no pointer of its own.

# Campaign initialization

Every [Campaign](core-concepts.md#campaign-and-session) starts from data the [Game build](core-concepts.md#game-build-and-content) supplies and choices made before creation, and nothing else. Campaign initialization receives setup inputs and immutable Game Data Records ([GDRs](core-concepts.md#game-build-and-content)) supplied by the Game build, and produces the initial Campaign state from them as the specifications owning campaign creation describe. GDRs supply data; specifications describe calculations and permitted behavior, including which Campaign instances the initial World state contains, under [Campaign instance creation](campaign-instances.md#campaign-instance-creation) in Campaign Instances. A GDR is data, not Game rules. The engine performs every operation: it reads GDRs and carries out the specified Game rules, and a GDR performs no operation.

The initial Campaign state has a Timeline holding only the [Turn-start state](engine-contract.md#player-actions-and-turns) of the first Turn, with the Timeline pointer on it, an empty History, the Campaign configuration that campaign creation resolved, and no Turn report.

# Acceptance examples

- **Configuration and world:** A Campaign's investigation difficulty multiplier is Campaign configuration; its [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is World state. Both are Campaign state ([Campaign state composition](#campaign-state-composition)).
