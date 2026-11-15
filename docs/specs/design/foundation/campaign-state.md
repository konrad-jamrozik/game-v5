# Campaign State

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | CSTATE                                                                                                                                                                     |
| Family      | Foundation                                                                                                                                                                 |
| Audience    | Engine designer, Content designer, Implementer                                                                                                                             |
| Owns        | What Campaign state is made of, and how Campaign initialization produces it.                                                                                               |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Each Campaign has its own world, its own past, and its own settings, e.g. its Agents, the Missions it has fought, and
its starting money. Together these are its Campaign state, and game behavior consults nothing else. Campaign State
refines [Engine Contract](engine-contract.md): Engine Contract decides which data the engine keeps and promises that
every Committed state is valid, and Campaign State looks inside one part of that data, the Campaign's own, and says
what shape it must have. That shape changes for different reasons than sessions, access, and the Engine API do.

Campaign state is organized by what changes it. Play changes the World state, which holds both the world as it is now
and the World history the game must remember. The Campaign configuration holds the settings the Campaign was created
with, of which play may adjust only a few. Every thing in the world, e.g. an Agent or a Mission site, is a
[Campaign instance](campaign-instances.md) of one common shape.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Campaign Instances](./campaign-instances.md)
- Used by [Configuration](./configuration.md)
- Used by [Determinism and Randomness](./determinism-and-randomness.md)
- Used by [Domain Model](../mechanics/domain-model.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Gameplay Dependency Direction](../../implementation/guidance/gameplay-dependency-direction.md)
- Used by [Timeline](./timeline.md)
- Used by [Turn Advancement](../mechanics/turn-advancement.md)
- Refined by [World History](./world-history.md)

# Glossary

These terms are specific to Campaign State. General terms are in the [Core Concepts glossary](core-concepts.md#glossary);
terms about Campaign instances are in the [Campaign Instances glossary](campaign-instances.md#glossary), and terms about
the retained past in the [World History glossary](world-history.md#glossary).

| Term                   | Definition                                                                                                                                                                                                                                                 | Prohibited synonyms                                                                                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World state            | The component of Campaign state describing the simulated world and its progression, composed of Current world state and World history, distinct from Campaign configuration.                                                                               |                                                                                                                                                                                                                                                                                      |
| Current world state    | The subcomponent of World state other than World history: the simulated world as it stands at the position selected by undo and redo. After undo, it is the state at that earlier position, not the furthest position reached.                             |                                                                                                                                                                                                                                                                                      |
| World history          | The subcomponent of World state containing retained data describing past Campaign state or events, including past Campaign configuration values or changes. Game behavior and Player API queries may consult World history.                                | Archived; archival; became historical; deconstructed; destroyed; History, as a component of Campaign state. Legitimate destruction mechanics, Participation history, and Git history remain valid, and retention does not replace named lifecycle states, e.g. Killed and Completed. |
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

Campaign state includes both World state and Campaign configuration. E.g., an Investigation's progress is
World state, while a campaign-wide investigation difficulty multiplier is Campaign configuration. Both belong to
the particular Campaign, regardless of which Session selects it. Campaign configuration supplies inputs to game
behavior; changing it does not modify the Game build's game behavior or immutable GDRs.

World state divides into Current world state and World history. E.g., an Agent's current health is Current world
state, while a record of the missions that Agent took part in is World history. World history is a subcomponent of World state,
including when it records past Campaign configuration values or changes.
Current Campaign configuration belongs to its own component of Campaign state; historical records about it belong
to World history within World state. This conceptual hierarchy does not require a particular storage layout. What Campaign
state excludes is stated under [Data ownership](engine-contract.md#data-ownership) in Engine Contract.
Each Campaign configuration value is either adjustable during play or fixed after creation. E.g., an investigation
difficulty multiplier can be adjustable during play, while starting money is fixed after creation and remains in
Campaign configuration as the value the Campaign started with. Mechanics specify which class each value has, the
permitted changes to adjustable values, and when their effects apply.

Every Campaign instance is part of World state, never of Campaign configuration. A Campaign instance that participates
in current gameplay is part of Current world state. When a Campaign instance no longer participates in current
gameplay, its data that must remain available is part of World history, under
[Historical fact preservation](world-history.md#historical-fact-preservation) in World History. Placing a Campaign
instance in this hierarchy does not change its four properties under
[Campaign instance structure](campaign-instances.md#campaign-instance-structure) in Campaign Instances.

# Campaign initialization

Every Campaign starts from data the Game build supplies and choices made before creation, and nothing else. Campaign
initialization receives setup inputs and immutable Game Data Records (GDRs) supplied by the Game build, and produces
the initial Campaign state from them as the specifications owning campaign creation describe. GDRs supply data;
specifications describe calculations and permitted behavior, including which Campaign instances the initial Campaign
state contains, under [Campaign instance creation](campaign-instances.md#campaign-instance-creation) in Campaign
Instances. A GDR is data, not game behavior. The engine performs every operation: it reads GDRs and carries out the
specified game behavior, and a GDR performs no operation.

# Acceptance examples

- **Configuration and world:** A Campaign's investigation difficulty multiplier is Campaign configuration; its
  Investigation progress is World state. Both are Campaign state ([Campaign state composition](#campaign-state-composition)).
- **World history within world:** A retained record of a past difficulty change belongs to World history within World state;
  the current difficulty value belongs to Campaign configuration. Both are Campaign state
  ([Campaign state composition](#campaign-state-composition)).
