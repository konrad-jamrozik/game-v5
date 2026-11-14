# Engine Contract

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | ENG                                                            |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, AI designer, Implementer         |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines the engine's API hierarchy, the data the engine owns, and the guarantees that hold across every engine subsystem when running the game and exposing information.

It owns cross-cutting guarantees, not the behavior of one subsystem or their refinements, e.g. [Timeline](./timeline.md), [Saves](./saves.md), or [TypeScript Player API](../interfaces/typescript-api.md). [Engine subsystems](#engine-subsystems) names the owner of each subsystem.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Used by [Agent Recovery](../mechanics/agent-recovery.md)
- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Autopilot](./autopilot.md)
- Used by [Configuration](./configuration.md)
- Used by [Domain Model](./domain-model.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)
- Used by [Investigations](../mechanics/investigations.md)
- Used by [Missions](../mechanics/missions.md)
- Used by [Panic and Endings](../mechanics/panic-and-endings.md)
- Used by [Saves](./saves.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [Timeline](./timeline.md)
- Used by [Web UI](../interfaces/web-ui.md)
- Refined by [Campaign State](./campaign-state.md)
- Refined by [Developer API](../interfaces/developer-api.md)
- Refined by [Player Information](../interfaces/player-information.md)
- Refined by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

Shared vocabulary, including Session, is defined by [Core Concepts](core-concepts.md#glossary).

## Principals and access

Kinds of engine API caller and the Session access settings that govern them.

| Term               | Definition                                                                                                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Principal          | A kind of engine API caller, defined by the API authority it holds rather than by what kind of caller it is. The Principals are Session controller and Autopilot AI.                                                                                                                                                                                                |
| Session controller | The Principal holding Session authority: managing the Session, selecting the Current campaign, navigating the Timeline, changing Dev mode, and engaging or disengaging Autopilot. Typical callers are, e.g., a human using CLI or Web UI, or an LLM-based agent driving the API or CLI; the Principal's authority does not depend on which kind of caller holds it. |
| Autopilot AI       | The Principal that plays through Player API while Autopilot is engaged, with access only to Player-visible information and Autopilot memory. The name avoids using Agent for a Principal.                                                                                                                                                                           |
| Dev mode           | A Session access setting that grants the Session controller Developer API access without changing Player API visibility or Autopilot AI authority.                                                                                                                                                                                                                  |

## Autopilot

Lending Player API control to an Autopilot AI for a bounded period.

| Term                 | Definition                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autopilot            | The game feature through which the Session controller lends Player API control of the Current campaign to an Autopilot AI for a bounded period, then regains it. |
| Autopilot engagement | One period from engaging to disengaging Autopilot. [Autopilot](autopilot.md) owns what bounds an Autopilot engagement and why it ends.                           |

## API surfaces

The separately authorized parts of the engine API, detailed in [API hierarchy](#api-hierarchy) together with which Principal can access each and when, and the information Player API exposes.

| Term                       | Definition                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Session API                | The API surface for Session controller operations over campaign selection, new-Campaign setup, Campaign saves, Timeline navigation, Dev mode, and Autopilot. |
| Player API                 | The API surface for ordinary gameplay queries and actions; all returned information remains Player-visible information regardless of Dev mode.               |
| Player-visible information | Information deliberately exposed by the engine to an ordinary player.                                                                                        |
| Developer API              | The separate API surface for full Campaign state inspection and validated cheat actions, available only to the Session controller while Dev mode is enabled. |
| Autopilot memory API       | The API surface through which the active Autopilot AI reads and writes Autopilot memory.                                                                     |

## Persisted data

The data that survives the end of a Session. [Data ownership](#data-ownership) shows how these terms nest.

| Term                 | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Game storage         | The persisted root of all data that survives the end of a Session: one Global configuration and zero or more Campaign saves.                                                                                                                                                                                                                                                                                                                                                                                          |
| Global configuration | The one persisted set of application-wide settings, shared by all Campaigns and available before any Campaign is selected. It never contains Campaign state.                                                                                                                                                                                                                                                                                                                                                          |
| Campaign save        | A persisted copy of one Campaign at one Committed state, together with its Timeline and Autopilot memory. One Campaign may have several Campaign saves.                                                                                                                                                                                                                                                                                                                                                               |
| Timeline             | The undo and redo record of the current turn of one Campaign: the Committed state the turn started in and the Committed actions committed since, some of which may be undone. Game behavior never consults it. [Timeline](timeline.md) owns its structure and navigation.                                                                                                                                                                                                                                             |
| Autopilot memory     | Data an Autopilot AI writes through Autopilot memory API to carry its plans across Autopilot engagements. It belongs to one Campaign, is not Campaign state, and game behavior never consults it. A Campaign has at most one Autopilot memory at each Committed state: the one most recently written at or before that Committed state. Undo, redo, and load therefore restore the Autopilot memory of the Committed state they restore, as [Autopilot memory](autopilot.md#autopilot-memory) in Autopilot specifies. |

## Campaign selection

What a Session has selected, and the complete Campaign state the engine commits.

| Term             | Definition                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Committed action | One successful state-changing Player API or Developer API action. It takes the Campaign from one Committed state to the next. A rejected action, an action with no effect, and a query are not Committed actions.                                                                                |
| Committed state  | Complete Campaign state, including every part of it, as it is before or after a Committed action rather than during the processing of one. It describes completeness and timing, not a part of Campaign state; the Campaign state that undo, redo, or load restores is always a Committed state. |
| Current campaign | The Campaign selected in the Session by the most recent successful campaign creation or load, until replacement or closure.                                                                                                                                                                      |
| Current save     | The Campaign save that the Current campaign was most recently loaded from or written to, if any; it is Session state and is cleared when the Current campaign is closed or replaced.                                                                                                             |

## Reproducibility

What makes a Campaign reproducible, and how the engine scopes unique identifiers.

| Term                       | Definition                                                                                                                                                                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign seed              | The value from which every random outcome of one Campaign derives. It is set when the Campaign is created, supplied by the Session controller or otherwise chosen by the engine, and never changes. It is Campaign state and is not Player-visible information. |
| Campaign-scoped identifier | A unique identifier that replaying the same Committed actions from the same Campaign state must reproduce exactly.                                                                                                                                              |
| Independent identifier     | A unique identifier that deterministic replay of a Campaign need not reproduce, e.g. one identifying a stored record or a runtime operation.                                                                                                                    |

# API hierarchy

The engine API is the source of truth for execution and access behavior. Terminal CLI and Web UI are required
adapters over the same API. Both expose the Session controller workflow; neither independently implements gameplay,
Timeline, visibility, or Autopilot rules. The engine grants Session controller authority by Principal, never by the kind of
caller holding it. An Autopilot AI never inherits that authority, whatever model or software implements it.

The complete namespace inventory is `session`, `player`, `developer`, and `autopilotMemory`. The following tree is the
required starter operation inventory. Additional gameplay and developer operations may be added under the same
ownership rules; the two gameplay operations and two cheat operations shown here do not exhaust future functionality.
Names declare conceptual API operations; TypeScript Player API owns exact signatures, argument Types, and results.

```text
Engine API
├── session
│   ├── getStatus()
│   ├── campaign
│   │   ├── load(save)
│   │   ├── save()
│   │   ├── saveAsNew()
│   │   ├── getAutosaveStatus()
│   │   ├── undoToAutosave()
│   │   ├── redoToAutosave()
│   │   └── close()
│   ├── newCampaign
│   │   ├── getSetup()
│   │   ├── selectPreset(preset)
│   │   ├── setPresetEdit(preset, value)
│   │   ├── removePresetEdit(preset, value)
│   │   └── create(options)
│   ├── timeline
│   │   ├── getStatus()
│   │   ├── undoAction()
│   │   ├── redoAction()
│   │   ├── undoAllActions()
│   │   └── redoAllActions()
│   ├── developer
│   │   ├── enable()
│   │   └── disable()
│   └── autopilot
│       ├── engage(autopilotAiId, limit)
│       ├── getStatus(engagementId)
│       └── disengage(engagementId)
├── player
│   ├── queries
│   │   ├── getCampaignStatus()
│   │   ├── getReports()
│   │   └── getAvailableActions()
│   └── actions
│       ├── assignAgents(...)
│       ├── purchaseUpgrade(...)
│       └── advanceTurn()
├── developer
│   ├── queries
│   │   └── getCampaignState()
│   └── actions
│       ├── addMoney(amount)
│       └── addAgents(...)
└── autopilotMemory
    ├── read()
    └── write(memory)
```

The following table is the complete set of namespace placement rules. For each namespace it names what the namespace
owns and where the behavior of its operations is specified.

| Namespace             | Owns                                                                                                                                                                                           | Specified in                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session`             | Session management and execution authority; it does not implement gameplay actions. Its own `getStatus()` reports the Session's Current campaign, Campaign seed, access, and Autopilot status. | [Campaign lifecycle](#campaign-lifecycle)                                                                                                                               |
| `session.campaign`    | Loading a Campaign save as the Current campaign, saving the Current campaign, undo and redo across turns, and closing the Current campaign.                                                    | [Campaign lifecycle](#campaign-lifecycle); [Saving](saves.md#saving), [Loading](saves.md#loading), and [Autosave navigation](saves.md#autosave-navigation) in Saves     |
| `session.newCampaign` | The new-Campaign setup, i.e. the selected preset and its Preset edits, and creating a Campaign from it as the Current campaign.                                                                | [Campaign lifecycle](#campaign-lifecycle); [Preset selection and edits](configuration.md#preset-selection-and-edits) in Configuration                                   |
| `session.timeline`    | Timeline status, and undo and redo of Committed actions within the current turn.                                                                                                               | [Action navigation](timeline.md#action-navigation) in Timeline                                                                                                          |
| `session.developer`   | Enabling and disabling Dev mode.                                                                                                                                                               | [Dev mode and developer operations](#dev-mode-and-developer-operations)                                                                                                 |
| `session.autopilot`   | Engaging Autopilot, reporting an Autopilot engagement's status, and disengaging it.                                                                                                            | [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency) in Autopilot                                                                    |
| `player.queries`      | Read-only Player-visible information and ordinary action discovery.                                                                                                                            | [Player Information](../interfaces/player-information.md)                                                                                                               |
| `player.actions`      | Normal gameplay mutations, including Advance turn.                                                                                                                                             | The mechanics specification owning each action, under [Player queries and actions](#player-queries-and-actions); [Turn advancement](#turn-advancement) for Advance turn |
| `developer.queries`   | Read-only inspection of full Campaign state.                                                                                                                                                   | [Inspection contract](../interfaces/developer-api.md#inspection-contract) in Developer API                                                                              |
| `developer.actions`   | Validated, recorded cheat mutations; e.g., adding money or adding Agents.                                                                                                                      | [Cheat command details](../interfaces/developer-api.md#cheat-command-details) in Developer API                                                                          |
| `autopilotMemory`     | Autopilot memory for the active Autopilot AI, independent of gameplay resolution.                                                                                                              | [Autopilot memory](autopilot.md#autopilot-memory) in Autopilot                                                                                                          |

The complete Principal access matrix is:

| Surface              | Session controller                                                                      | Active Autopilot AI                                                     |
| -------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Session API          | Available subject to lifecycle and Autopilot restrictions                               | Unavailable                                                             |
| Player API           | Available with a Current campaign; mutations blocked during Autopilot                   | Available only for its Current campaign during its Autopilot engagement |
| Developer API        | Available with a Current campaign, Dev mode enabled, and no active Autopilot engagement | Unavailable in every Dev mode setting                                   |
| Autopilot memory API | Unavailable                                                                             | Available only during its own active Autopilot engagement               |

The engine enforces this matrix on every invocation. No operation available to an Autopilot AI reaches a Session API
or Developer API operation, including through Terminal CLI or Web UI. An Autopilot AI's access ends when its Autopilot
engagement ends or the Current campaign changes.

# Data ownership

The following complete conceptual hierarchy shows which data the engine owns, what is persisted, and which
specification owns each part.

```text
Game storage (persisted)
├── Global configuration
└── Campaign saves (zero or more)
    └── Campaign save
        ├── Campaign save ID and Campaign ID
        ├── Campaign state (at the saved Committed state)
        ├── Timeline (of the turn that Committed state belongs to)
        └── Autopilot memory

Session (runtime, never persisted)
    Current campaign selection · Current save · Dev mode · active Autopilot engagement
    new-Campaign setup: selected preset · Preset edits
```

| Part                 | Owner                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Global configuration | [Configuration](configuration.md)                                                                                |
| Campaign save        | [Saves](saves.md), including its identifiers and the Campaign saves the engine writes itself                     |
| Campaign state       | [Campaign state composition](campaign-state.md#campaign-state-composition) in Campaign State, for its components |
| Timeline             | [Timeline](timeline.md)                                                                                          |
| Autopilot memory     | [Autopilot memory](autopilot.md#autopilot-memory) in Autopilot                                                   |
| Session              | [Campaign lifecycle](#campaign-lifecycle)                                                                        |
| New-Campaign setup   | [Preset selection and edits](configuration.md#preset-selection-and-edits) in Configuration                       |

Campaign state holds everything game behavior consults and nothing else. It includes the Campaign seed, under
[Campaign seed](#campaign-seed). It excludes everything a Session holds,
e.g. Dev mode; Global configuration, e.g. interface preferences; and the Timeline and Autopilot memory, which a
Campaign save keeps beside Campaign state because continuing to control a Campaign needs them although game behavior
never consults them.

Nothing a Session holds is persisted, and loading a Campaign save never restores a Session.

# Engine subsystems

Each engine subsystem has one owning specification. This document states only the guarantees that hold across all of
them. The following table is the complete subsystem inventory.

| Subsystem     | Owner                             | What it provides                                                                                    |
| ------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Timeline      | [Timeline](timeline.md)           | Undo and redo of the Committed actions of the current turn.                                         |
| Saves         | [Saves](saves.md)                 | Saving a Campaign and loading it back at its saved Committed state, and undo and redo across turns. |
| Configuration | [Configuration](configuration.md) | Settings shared by all Campaigns, and how a new Campaign obtains its Campaign configuration.        |
| Autopilot     | [Autopilot](autopilot.md)         | Bounded play by an Autopilot AI, and its Autopilot memory.                                          |

# Campaign lifecycle

A Session starts when the game starts and ends when the game exits. A newly opened Session has no Current campaign
and Dev mode is disabled. This is the main-menu state in Web UI. What a Session holds is stated under
[Data ownership](#data-ownership).

`session.getStatus()` reports whether a Current campaign exists, the Campaign seed of the Current campaign, and the
Session's access and Autopilot status.
`session.newCampaign.create(options)` creates a Campaign using the current Game build, the Session's new-Campaign setup,
and a Campaign seed. `options` carries the Campaign seed when the Session controller supplies one; otherwise the
engine chooses it, under [Campaign seed](#campaign-seed). The new-Campaign setup is the selected preset and
its Preset edits, read and changed through `session.newCampaign` as
[Preset selection and edits](configuration.md#preset-selection-and-edits) specifies; the Session holds it and it is
never persisted. The Campaign seed is not part of the new-Campaign setup. `session.campaign.load(save)` restores a Campaign save and selects its Campaign
as the Current campaign, as [Saves](saves.md) specifies. Successful creation or load selects the Current campaign and
disables Dev mode. A newly created Campaign has a Timeline with no Committed actions, no Autopilot memory, and no Campaign save.

`session.campaign.close()` removes the Current campaign and disables Dev mode. Campaign-dependent operations fail
when no Current campaign exists. Creation, load, and closure invalidate prior campaign access. Failure to create or
load preserves the existing Session. Closing or replacing the Current campaign does not implicitly save it.

# Campaign data integrity

Campaign creation, committed Player API and Developer API actions, and restoration must preserve the declared
campaign-data composition, identity, reference, and historical-fact invariants.
Detailed campaign-data structures and the constraints preserving them belong to refining specifications.
A specification stating an invariant states its condition and its scope; every Committed state satisfies it, and
[Committed state integrity](#committed-state-integrity) states how a violation is reported.

# Player queries and actions

Player-visible information describes deliberate ordinary-player exposure. The term does not specify a particular query
schema or reveal condition; [Player Information](../interfaces/player-information.md) owns those conditions.

Player API queries always return Player-visible information. The same query at equal Campaign state returns the
same Player-visible information for the Session controller and Autopilot AI, independent of Dev mode.

A player may commit any sequence of eligible Player API actions during a turn. `player.actions.advanceTurn()` is
itself one player action; it atomically applies the rules stated for turn advancement, under
[Turn advancement](#turn-advancement), and no intermediate result is separately committed. Each successful state-changing Player API action is one Committed action.
[Timeline entries](timeline.md#timeline-entries) in Timeline states which Committed actions the Timeline records; Advance
turn is a Committed action that the Timeline does not record. A rejected action or an action with no effect is not a Committed action and changes no later outcome, under
[Determinism](#determinism).

The mechanics specification owning each gameplay action, e.g. `assignAgents(...)` or `purchaseUpgrade(...)`, states
the action's preconditions, what the player observes when a precondition fails, and the action's state changes: when
they apply, which values change, and by how much. A rejected action changes nothing, under
[Committed state integrity](#committed-state-integrity). The gameplay action inventory is extensible; future gameplay
actions follow the same atomicity, visibility, and replay contract.

# Turn advancement

Advance turn applies every rule that a specification states is applied during turn advancement, e.g. paying upkeep
or completing training. No specification lists the order in which those rules are applied. Each rule instead states
which values it uses, following this complete rule set:

- **Turn-start default:** A rule applied during Advance turn uses every value as it was in the Committed state in
  which Advance turn began, unless the rule states an exception.
- **Stated exception:** A rule may state that it uses a value as it is after another named rule of the same Advance
  turn has been applied; e.g., "upkeep uses each Agent's rank after this turn's training". The specification owning
  the rule that uses the value states the exception.
- **Several changes to one value:** When more than one rule of the same Advance turn changes the same value, the
  specifications owning those rules state the combined result, e.g. that the changes add up, or which one prevails.
- **Campaign instances created during Advance turn:** A Campaign instance created during Advance turn has no
  turn-start values. A rule of the same Advance turn applies to it only when the rule states so.
- **No circular exceptions:** Stated exceptions must not form a cycle; e.g., rule A using a value after rule B while
  rule B uses a value after rule A is a defect in the specifications.

Any order of applying the rules that produces the stated results is the implementer's choice. Only the Committed
state after Advance turn is observable, under [Committed state integrity](#committed-state-integrity).

# Dev mode and developer operations

Only the Session controller can call `session.developer.enable()` or `session.developer.disable()`. Enabling requires
a Current campaign and no active Autopilot engagement. Developer API inspection returns detached, read-only full Campaign
state. It never reveals hidden facts through ordinary game behavior.
`developer.actions.addMoney(amount)` and `developer.actions.addAgents(...)` are required starter cheat operations;
Developer API owns their exact inputs, validation, and effects. Future cheat operations belong in that namespace.
Cheat operations must preserve model invariants, and each successful one is one atomic Committed action in the Timeline.

Dev mode starts disabled and is disabled on successful creation, load, or closure. Timeline navigation and
[Autosave navigation](saves.md#autosave-navigation) leave the current Dev mode setting unchanged. Dev mode is not Campaign state and is never restored from a Campaign save or the
Timeline. Disabling Dev mode revokes subsequent Developer API access. Previously returned information
cannot be erased from the Session controller's knowledge.

Autopilot may be engaged while Dev mode is enabled, but Developer API operations remain unavailable while Autopilot
is engaged and the Autopilot AI never receives them. Dev mode transitions are unavailable while Autopilot is engaged. To inspect or cheat, the Session controller disengages Autopilot and waits for disengagement to complete.

# Determinism

Given the same Game build, the same initial Campaign configuration, the same Campaign seed, and the same ordered
Committed actions, exactly the same things must happen: Campaign state and retained reports are equal after every
Committed action. This holds whenever, in whichever Session, and on whichever machine each Campaign is created and
played; e.g., a Campaign save made on one machine and loaded on another continues exactly as it would have on the
first, given the same Committed actions. The Game
build includes its GDRs, and the Committed actions are those of the Session controller and of the
Autopilot AI alike. The Campaign seed is what makes a Campaign reproducible, and so makes undo, redo, load, and debugging
possible.

The guarantee has two parts:

- **Creation:** The same Game build, initial Campaign configuration, and Campaign seed must produce equal initial
  Campaign state.
- **Play:** For equal Campaign state, the same Game build, and the same ordered Committed actions, execution must
  produce equal resulting Campaign state and retained reports.

Gameplay consults nothing outside Campaign state, e.g. wall-clock time or Autopilot memory, so Campaign state holds
every input consulted by game behavior, including the Campaign seed and relevant retained data about past Campaign
state or events.

Consequently, outcomes after undo, redo, or load equal those of uninterrupted play, and a query, a rejected action,
or an action with no effect never changes a later outcome.

Determinism is required within one implementation and Game build, not across different implementations of the
specification or different Game builds. Within one implementation and Game build it is required across machines:
no outcome may depend on the machine, operating system, or runtime that executes the Game build. Consequently, how random outcomes are derived from the Campaign seed, the
order of random draws, the order in which Campaign instances are created within one command, and the sequence and
format of generated Campaign-scoped identifiers are the implementer's choice, provided the equality guarantee above
holds. Two implementations may therefore produce different outcomes from the same Campaign seed and commands; each
must reproduce its own outcomes exactly.

## Campaign seed

Every Campaign has exactly one Campaign seed. The following rules are complete:

- **Supplied:** The Session controller may supply the Campaign seed in `session.newCampaign.create(options)`. A
  supplied value that is not a permitted Campaign seed fails creation, under
  [Campaign lifecycle](#campaign-lifecycle).
- **Permitted values:** A permitted Campaign seed is any non-empty text. Two Campaign seeds are the same exactly
  when their texts are equal character for character; e.g., `abc` and `ABC` are different Campaign seeds.
  TypeScript Player API owns the exact Type and the maximum length.
- **Chosen:** When none is supplied, the engine chooses a permitted Campaign seed. Which one it chooses is
  unspecified and need not be reproducible; it is the only engine decision exempt from the guarantee under
  [Determinism](#determinism).
- **Fixed:** The Campaign seed never changes after creation. No action, Timeline navigation, save, or load changes it.
- **Kept:** The Campaign seed is Campaign state, part of Current world state under
  [Campaign state composition](campaign-state.md#campaign-state-composition). It is not Campaign configuration,
  because no Campaign configuration preset supplies it. Every Campaign save therefore holds it.
- **Readable:** `session.getStatus()` reports the Campaign seed of the Current campaign to the Session controller,
  in every Dev mode setting and whether it was supplied or chosen, in a form `create(options)` accepts; e.g., the
  Session controller can share it or create another Campaign with it.
- **Not Player-visible:** The Campaign seed is not Player-visible information, because together with the Game build
  it determines facts hidden from the player. Player API never exposes it, so an Autopilot AI never receives it.
- **Sole source of randomness:** Every random outcome of a Campaign derives from its Campaign seed. No outcome
  depends on anything outside Campaign state; e.g., not on wall-clock time, on when, in which Session, or on which
  machine the Campaign is created, loaded, or played, on a second seed, or on a random source that differs from one run to another. This
  is observable: any such dependence makes two Campaigns that the guarantee under [Determinism](#determinism)
  requires to be equal differ.
- **Stated distributions:** Among Campaigns that differ only in their Campaign seed, every random outcome takes
  each of its possible values as often as the distribution in its rule states. E.g., an outcome whose rule states a
  60% probability occurs in 60% of such Campaigns, not in all of them or in none.
- **Independent outcomes:** Random outcomes are independent of one another unless a rule states otherwise: the
  value of one says nothing about the value of any other. E.g., two attacks that each hit with probability 60% both
  hit with probability 36%; an implementation in which they always hit or miss together does not conform. A rule
  states a dependence explicitly, e.g. that a damage outcome exists only when the attack hits.
- **Different commands, different outcomes:** Only the same ordered Committed actions guarantee the same outcomes,
  under [Determinism](#determinism). After a different Committed action, any later random outcome may differ, even
  one whose rule does not involve what that command changed. E.g., an attack misses; the Session controller loads
  the earlier Campaign save, hires an Agent, and commits the same attack, which may now hit. Whether it does is the
  implementer's choice.

## Unique identifiers

Every specification that introduces a unique identifier must classify it as a Campaign-scoped identifier or an
Independent identifier. The test is whether replaying the same Committed actions from the same Campaign state,
including through undo and redo, must reproduce the same identifier.

| Kind                       | Replay reproduces it | Examples                                                       |
| -------------------------- | -------------------- | -------------------------------------------------------------- |
| Campaign-scoped identifier | Yes                  | E.g., [Instance IDs](campaign-state.md#glossary).              |
| Independent identifier     | No                   | E.g., [Campaign IDs and Campaign save IDs](saves.md#glossary). |

A Campaign-scoped identifier therefore depends on nothing outside Campaign state, e.g. wall-clock time. The format of
every identifier is the implementer's choice.

# Derived value consistency

Queries, computing Derived values, and checking action preconditions must neither change Campaign state nor change
any later outcome.
After any action or restoration, every query result, report, and Player-visible information equals what would be
computed from the current Campaign state. After restoration, that is the restored Committed state
rather than one that was undone.

Two Campaign states are equal exactly when their Authoritative values are equal, under
[Authoritative and Derived values](core-concepts.md#authoritative-and-derived-values) in Core Concepts. Equal Campaign
states under the same Game build therefore have equal Derived values.

# Information boundary

Player API always exposes only Player-visible information. Developer API adds a distinct full-state inspection path
for an authorized Session controller. The boundary applies to query results, action discovery, validation errors,
reports, and Timeline status. Hidden identifiers and error details must follow the same boundary.
Returned views must not provide mutable references into Campaign state. The engine guarantees the information it
supplies to Autopilot AI; it cannot erase information independently disclosed by a human outside the API.
A Campaign save contains information that is not Player-visible information and is never exposed to an Autopilot AI.

# Committed state integrity

Committed state distinguishes complete Campaign state before or after a Committed action from intermediate processing.
E.g., the Campaign state restored by undo is a Committed state, while values computed partway through Advance turn
processing are not.

Rejected requests leave Campaign state, reports, the Timeline, and Autopilot memory unchanged. This covers every
rejection, e.g. no Current campaign, an unavailable Timeline navigation target, or an unauthorized call.
Intermediate processing must not be exposed as Committed state. Failed
Timeline navigation or load preserves the entire prior Session. Broken references or internal invariants are reported
as engine/data defects rather than silently repaired into different gameplay outcomes.
Exact error representations and asynchronous operation results belong to TypeScript Player API.

# Acceptance examples

- **Session without a Campaign:** Start the game before selecting a playthrough. It is a Session with no selected
  Campaign, not an empty Campaign, and a gameplay query fails without mutation ([Campaign lifecycle](#campaign-lifecycle)).
- **Session not persisted:** Select a Campaign, save it, exit, and start the game again. The new Session has no
  selected Campaign until the Campaign save is loaded, and loading restores the Campaign's saved data but none of the earlier
  Session's runtime state ([Campaign lifecycle](#campaign-lifecycle), [Data ownership](#data-ownership)).
- **Turn-start default:** Rule R1 of Advance turn changes value V, and rule R2 of the same Advance turn uses V and
  states no exception. R2 uses V as it was when Advance turn began. If R2 instead states that it uses V after R1, it
  uses the value R1 produced ([Turn advancement](#turn-advancement)).
- **Developer isolation:** Enable Dev mode and inspect hidden difficulty H through Developer API. Player API still
  hides H. Engage Autopilot; its queries and errors hide H and its developer calls fail. Disable Dev mode after
  disengagement and verify Developer API access is revoked
  ([Dev mode and developer operations](#dev-mode-and-developer-operations), [API hierarchy](#api-hierarchy),
  [Information boundary](#information-boundary)).
- **Equal outcomes:** Starting at Campaign state S, add money through Developer API, commit ordinary gameplay actions,
  and Advance turn. Repeat the same commands from S with queries and a rejected action interleaved. Complete Campaign
  state and retained reports equal the original results ([Determinism](#determinism),
  [Derived value consistency](#derived-value-consistency)).
- **Same seed, same Campaign:** Create Campaign A supplying Campaign seed K, commit gameplay actions including
  Advance turn, and record Campaign state and retained reports after each Committed action. End the Session. In a new
  Session, create Campaign B with the same new-Campaign setup and K, and commit the same actions. B equals A at
  every Committed action ([Determinism](#determinism), [Campaign seed](#campaign-seed)).
- **Same save, another machine:** Save Campaign A on one machine, then commit gameplay actions including Advance
  turn and record Campaign state and retained reports after each Committed action. On another machine running the same
  Game build, load that Campaign save and commit the same actions. The results equal those recorded on the first
  machine after every Committed action ([Determinism](#determinism)).
- **Seed chosen by the engine:** Create Campaign C supplying no Campaign seed. `session.getStatus()` reports its
  Campaign seed K2. Create Campaign D with the same new-Campaign setup supplying K2, and commit the same actions in
  both. D equals C after every Committed action ([Campaign seed](#campaign-seed)).
- **Seed fixed and hidden:** After Committed actions, undo, redo, save, and load, `session.getStatus()` reports the
  same Campaign seed. No Player API query returns it, with Dev mode enabled or disabled
  ([Campaign seed](#campaign-seed), [Information boundary](#information-boundary)).
- **Defects:** A broken internal reference reports an engine defect without publishing intermediate Campaign state.
  Returned inspection data cannot mutate the engine ([Committed state integrity](#committed-state-integrity),
  [Information boundary](#information-boundary)).
- **Campaign integrity:** A Committed action and its undo and redo preserve declared campaign-data composition and identity,
  and required historical references remain resolvable ([Campaign data integrity](#campaign-data-integrity)).
