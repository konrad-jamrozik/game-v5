# Campaign State

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | CSTATE                                                                                                                                                                     |
| Family      | Foundation                                                                                                                                                                 |
| Audience    | Engine designer, Content designer, Implementer                                                                                                                             |
| Owns        | What Campaign state is made of, and how Campaign initialization produces it.                                                                                               |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Each [Campaign](core-concepts.md#campaign-and-session) has its own world, its own past, and its own settings, e.g. its Agents, the Missions it has fought, and
its starting money. Together these are its [Campaign state](core-concepts.md#campaign-and-session), and game behavior consults nothing else.
Campaign State builds on Core Concepts: Core Concepts says what Campaign state is, and Campaign State says what it is
made of.

Campaign state is organized by what changes it. Play changes the World state, which holds both the world as it is now
and the World history the game must remember. The Campaign configuration holds the settings the Campaign was created
with, of which play may adjust only a few. Every thing in the world, e.g. an [Agent](../mechanics/domain-model.md#agency-and-agents) or a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), is a [Campaign instance](campaign-instances.md) of one common shape.

# Glossary

These terms are specific to Campaign State. General terms are in the [Core Concepts glossary](core-concepts.md#glossary);
terms about [Campaign instances](core-concepts.md#campaign-instances) are in the Core Concepts and [Campaign Instances](campaign-instances.md#glossary) glossaries, and terms about
the past in the [World History glossary](world-history.md#glossary).

| Term                   | Definition                                                                                                                                                                                                                                                 | Prohibited synonyms                                                                                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World state            | The component of [Campaign state](core-concepts.md#campaign-and-session) describing the simulated world and its progression, composed of Current world state and World history, distinct from Campaign configuration.                                      |                                                                                                                                                                                                                                                                                      |
| Current world state    | The subcomponent of World state other than World history: the simulated world as it stands at the position selected by undo and redo. After undo, it is the state at that earlier position, not the furthest position reached.                             |                                                                                                                                                                                                                                                                                      |
| World history          | The subcomponent of World state containing data describing past Campaign state or events, including past Campaign configuration values or changes. Game behavior and [Player API](engine-contract.md#api-surfaces) queries may consult World history.      | Archived; archival; became historical; deconstructed; destroyed; History, as a component of Campaign state. Legitimate destruction mechanics, Participation history, and Git history remain valid, and retention does not replace named lifecycle states, e.g. Killed and Completed. |
| Campaign configuration | The component of Campaign state containing the campaign-specific parameters that campaign creation sets and that select or adjust gameplay behavior. Each parameter is either adjustable during play through permitted operations or fixed after creation. | Scenario, naming campaign setup; scenario GDR; scenario setup. Unrelated uses of "configuration" remain valid.                                                                                                                                                                       |

# Campaign state composition

Campaign state is one part of the data the engine keeps, under [Data ownership](engine-contract.md#data-ownership) in
Engine Contract; inside, it divides by what changes each part. Campaign state has the following complete conceptual
hierarchy. World history is a subcomponent of World state.

```text
Campaign state
├── World state
│   ├── Current world state
│   └── World history
└── Campaign configuration
```

Every Campaign instance is part of World state, never of Campaign configuration. The hierarchy is conceptual and
requires no storage layout.

# Campaign initialization

Every [Campaign](core-concepts.md#campaign-and-session) starts from data the [Game build](core-concepts.md#game-build-and-content) supplies and choices made before creation, and nothing else. Campaign
initialization receives setup inputs and immutable Game Data Records ([GDRs](core-concepts.md#game-build-and-content)) supplied by the Game build, and produces
the initial Campaign state from them as the specifications owning campaign creation describe. GDRs supply data;
specifications describe calculations and permitted behavior, including which Campaign instances the initial Campaign
state contains, under [Campaign instance creation](campaign-instances.md#campaign-instance-creation) in Campaign
Instances. A GDR is data, not game behavior. The engine performs every operation: it reads GDRs and carries out the
specified game behavior, and a GDR performs no operation.

# Acceptance examples

- **Configuration and world:** A Campaign's investigation difficulty multiplier is Campaign configuration; its
  [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is World state. Both are Campaign state ([Campaign state composition](#campaign-state-composition)).
- **World history within world:** A retained record of a past difficulty change belongs to World history within World state;
  the current difficulty value belongs to Campaign configuration. Both are Campaign state
  ([Campaign state composition](#campaign-state-composition)).
