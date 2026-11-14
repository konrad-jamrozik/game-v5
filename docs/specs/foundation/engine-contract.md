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

It owns cross-cutting guarantees, not the behavior of one subsystem or their refinements, e.g. [Timeline](./timeline.md), [Saves](./saves.md), or [TypeScript Player API](../interfaces/typescript-api.md). [Engine subsystems](#engine-subsystems) names the owner of each subsystem. Reproducibility, the Campaign seed, and unique identifiers belong to [Determinism and Randomness](./determinism-and-randomness.md); what Advance turn does belongs to [Turn Advancement](./turn-advancement.md).

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Used by [Autopilot](./autopilot.md)
- Used by [Configuration](./configuration.md)
- Used by [Determinism and Randomness](./determinism-and-randomness.md)
- Used by [Domain Model](./domain-model.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)
- Used by [Saves](./saves.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [Timeline](./timeline.md)
- Used by [Turn Advancement](./turn-advancement.md)
- Used by [Web UI](../interfaces/web-ui.md)
- Refined by [Campaign State](./campaign-state.md)
- Refined by [Developer API](../interfaces/developer-api.md)
- Refined by [Player Information](../interfaces/player-information.md)
- Refined by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

Shared vocabulary, including Session, is defined by [Core Concepts](core-concepts.md#glossary).

## Principals and access

Kinds of engine API caller and the Session access settings that govern them.

| Term               | Definition                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Principal          | A kind of engine API caller, defined by the API authority it holds rather than by what kind of caller it is. The Principals are Session controller and Autopilot AI.                                                                                                                                                                                                                               |
| Session controller | The Principal holding Session authority: managing the Session, changing Global configuration, selecting the Current campaign, navigating the Timeline, changing Dev mode, and engaging or disengaging Autopilot. Typical callers are, e.g., a human using CLI or Web UI, or an LLM-based agent driving the API or CLI; the Principal's authority does not depend on which kind of caller holds it. |
| Autopilot AI       | The Principal that plays through Player API while Autopilot is engaged, with access only to Player-visible information and Autopilot memory. The name avoids using Agent for a Principal.                                                                                                                                                                                                          |
| Dev mode           | A Session access setting that grants the Session controller Developer API access without changing Player API visibility or Autopilot AI authority.                                                                                                                                                                                                                                                 |

## Autopilot

Lending Player API control to an Autopilot AI for a bounded period.

| Term                 | Definition                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autopilot            | The game feature through which the Session controller lends Player API control of the Current campaign to an Autopilot AI for a bounded period, then regains it. |
| Autopilot engagement | One period from engaging to disengaging Autopilot. [Autopilot](autopilot.md) owns what bounds an Autopilot engagement and why it ends.                           |

## API surfaces

The separately authorized parts of the engine API, detailed in [API hierarchy](#api-hierarchy) together with which Principal can access each and when, and the information Player API exposes.

| Term                       | Definition                                                                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session API                | The API surface for Session controller operations over Global configuration, campaign selection, new-Campaign setup, Campaign saves, Timeline navigation, Dev mode, and Autopilot. |
| Player API                 | The API surface for ordinary gameplay queries and actions; all returned information remains Player-visible information regardless of Dev mode.                                     |
| Player-visible information | Information deliberately exposed by the engine to an ordinary player.                                                                                                              |
| Developer API              | The separate API surface for full Campaign state inspection and validated cheat actions, available only to the Session controller while Dev mode is enabled.                       |
| Autopilot memory API       | The API surface through which the active Autopilot AI reads and writes Autopilot memory.                                                                                           |

## Persisted data

The data that survives the end of a Session. [Data ownership](#data-ownership) shows how these terms nest.

| Term                 | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Game storage         | The persisted root of all data that survives the end of a Session: one Global configuration and zero or more Campaign saves.                                                                                                                                                                                                                                                                                                                                                                                          |
| Global configuration | The one persisted set of application-wide settings, shared by all Campaigns and available before any Campaign is selected. It never contains Campaign state.                                                                                                                                                                                                                                                                                                                                                          |
| Campaign save        | A persisted copy of one Campaign at one Committed state, together with its Timeline and Autopilot memory. One Campaign may have several Campaign saves.                                                                                                                                                                                                                                                                                                                                                               |
| Timeline             | The undo and redo record of the current turn of one Campaign: the Committed state the turn started in and the Player actions committed since, some of which may be undone. Game behavior never consults it. [Timeline](timeline.md) owns its structure and navigation.                                                                                                                                                                                                                                                |
| Autopilot memory     | Data an Autopilot AI writes through Autopilot memory API to carry its plans across Autopilot engagements. It belongs to one Campaign, is not Campaign state, and game behavior never consults it. A Campaign has at most one Autopilot memory at each Committed state: the one most recently written at or before that Committed state. Undo, redo, and load therefore restore the Autopilot memory of the Committed state they restore, as [Autopilot memory](autopilot.md#autopilot-memory) in Autopilot specifies. |

## Campaign selection

What a Session has selected, the complete Campaign state the engine commits, and the Turns it divides into.

| Term             | Definition                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Player action    | One successful state-changing action made through Player API or Developer API, whichever Principal makes it; e.g., an Autopilot AI assigning Agents, or the Session controller adding money through Developer API. It takes the Campaign from one Committed state to the next. A rejected action, an action with no effect, and a query are not Player actions. |
| Committed state  | Complete Campaign state, including every part of it, as it is before or after a Player action rather than during the processing of one. It describes completeness and timing, not a part of Campaign state; the Campaign state that undo, redo, or load restores is always a Committed state.                                                                   |
| Turn             | The part of a Campaign from one Turn-start state up to the next committed Advance turn. Every Committed state belongs to exactly one Turn, and Advance turn ends it.                                                                                                                                                                                            |
| Turn-start state | The Committed state immediately after campaign creation or immediately after a committed Advance turn. No other Player action of its Turn has happened yet.                                                                                                                                                                                                     |
| Turn-end state   | The Committed state in which a committed Advance turn began.                                                                                                                                                                                                                                                                                                    |
| Current campaign | The Campaign selected in the Session by the most recent successful campaign creation or load, until replacement or closure.                                                                                                                                                                                                                                     |
| Current save     | The Campaign save that the Current campaign was most recently loaded from or written to, if any; it is Session state and is cleared when the Current campaign is closed or replaced.                                                                                                                                                                            |

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
│   ├── globalConfiguration
│   │   ├── get()
│   │   ├── set(setting, value)
│   │   └── reset(setting)
│   ├── campaign
│   │   ├── listSaves()
│   │   ├── load(save)
│   │   ├── save()
│   │   ├── saveAsNew()
│   │   └── close()
│   ├── newCampaign
│   │   ├── listPresets()
│   │   ├── getPreset(preset)
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
│   │   ├── redoAllActions()
│   │   ├── getAutosaveStatus()
│   │   ├── undoToAutosave()
│   │   └── redoToAutosave()
│   ├── developer
│   │   ├── enable()
│   │   └── disable()
│   └── autopilot
│       ├── listAutopilotAis()
│       ├── engage(autopilotAiId, limit)
│       ├── getStatus(engagementId)
│       └── disengage(engagementId)
├── player
│   ├── queries
│   │   ├── getCampaignState()
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

| Namespace                     | Owns                                                                                                                                                                                               | Specified in                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session`                     | Session management and execution authority; it does not implement gameplay actions. Its own `getStatus()` reports the Session's Current campaign, access, and Autopilot status.                    | [Campaign lifecycle](#campaign-lifecycle)                                                                                                                                 |
| `session.globalConfiguration` | Reading, setting, and resetting Global configuration settings.                                                                                                                                     | [Global configuration](configuration.md#global-configuration) in Configuration                                                                                            |
| `session.campaign`            | Listing the Campaign saves in Game storage, loading a Campaign save as the Current campaign, saving the Current campaign, and closing the Current campaign.                                        | [Campaign lifecycle](#campaign-lifecycle); [Listing Campaign saves](saves.md#listing-campaign-saves), [Saving](saves.md#saving), and [Loading](saves.md#loading) in Saves |
| `session.newCampaign`         | Listing the Campaign configuration presets and the values of each, the new-Campaign setup, i.e. the selected preset and its Preset edits, and creating a Campaign from it as the Current campaign. | [Campaign lifecycle](#campaign-lifecycle); [Preset selection and edits](configuration.md#preset-selection-and-edits) in Configuration                                     |
| `session.timeline`            | Timeline status, undo and redo of Player actions within the current turn, and undo and redo across turns.                                                                                          | [Action navigation](timeline.md#action-navigation) and [Autosave navigation](timeline.md#autosave-navigation) in Timeline                                                 |
| `session.developer`           | Enabling and disabling Dev mode.                                                                                                                                                                   | [Dev mode and developer operations](#dev-mode-and-developer-operations)                                                                                                   |
| `session.autopilot`           | Listing the Autopilot AIs available for engagement, engaging Autopilot, reporting an Autopilot engagement's status, and disengaging it.                                                            | [Available Autopilot AIs](autopilot.md#available-autopilot-ais) and [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency) in Autopilot  |
| `player.queries`              | Read-only Player-visible information and ordinary action discovery. Its `getCampaignState()` returns only the Player-visible information of Campaign state.                                        | [Player Information](../interfaces/player-information.md)                                                                                                                 |
| `player.actions`              | Normal gameplay mutations, including Advance turn.                                                                                                                                                 | The mechanics specification owning each action, under [Player queries and actions](#player-queries-and-actions); [Turn Advancement](turn-advancement.md) for Advance turn |
| `developer.queries`           | Read-only inspection of full Campaign state. Its `getCampaignState()` returns Campaign state in full, unlike the Player API query of the same name.                                                | [Inspection contract](../interfaces/developer-api.md#inspection-contract) in Developer API                                                                                |
| `developer.actions`           | Validated, recorded cheat mutations; e.g., adding money or adding Agents.                                                                                                                          | [Cheat command details](../interfaces/developer-api.md#cheat-command-details) in Developer API                                                                            |
| `autopilotMemory`             | Autopilot memory for the active Autopilot AI, independent of gameplay resolution.                                                                                                                  | [Autopilot memory](autopilot.md#autopilot-memory) in Autopilot                                                                                                            |

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
├── Current campaign selection
├── Current save
├── Dev mode
├── Active Autopilot engagement (at most one)
│   ├── Autopilot engagement ID
│   ├── Autopilot AI
│   ├── Autopilot limit
│   └── Autopilot progress
└── New-Campaign setup
    ├── Selected preset
    └── Preset edits
```

| Part                        | Owner                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Global configuration        | [Configuration](configuration.md)                                                                                |
| Campaign save               | [Saves](saves.md), including its identifiers and the Campaign saves the engine writes itself                     |
| Campaign state              | [Campaign state composition](campaign-state.md#campaign-state-composition) in Campaign State, for its components |
| Timeline                    | [Timeline](timeline.md)                                                                                          |
| Autopilot memory            | [Autopilot memory](autopilot.md#autopilot-memory) in Autopilot                                                   |
| Session                     | [Campaign lifecycle](#campaign-lifecycle)                                                                        |
| Active Autopilot engagement | [What an Autopilot engagement holds](autopilot.md#what-an-autopilot-engagement-holds) in Autopilot               |
| New-Campaign setup          | [Preset selection and edits](configuration.md#preset-selection-and-edits) in Configuration                       |

Campaign state holds everything game behavior consults and nothing else, e.g. the Campaign seed, under
[Campaign seed](determinism-and-randomness.md#campaign-seed) in Determinism and Randomness. It excludes everything a Session holds,
e.g. Dev mode; Global configuration, e.g. interface preferences; and the Timeline and Autopilot memory, which a
Campaign save keeps beside Campaign state because continuing to control a Campaign needs them although game behavior
never consults them.

Nothing a Session holds is persisted, and loading a Campaign save never restores a Session.

# Engine subsystems

Each engine subsystem has one owning specification. This document states only the guarantees that hold across all of
them. The following table is the complete subsystem inventory.

| Subsystem                  | Owner                                                       | What it provides                                                                                         |
| -------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Saves                      | [Saves](saves.md)                                           | Saving a Campaign and loading it back at its saved Committed state, and the Autosaves the engine writes. |
| Timeline                   | [Timeline](timeline.md)                                     | Undo and redo of the Player actions of the current turn, and undo and redo across turns.                 |
| Configuration              | [Configuration](configuration.md)                           | Settings shared by all Campaigns, and how a new Campaign obtains its Campaign configuration.             |
| Autopilot                  | [Autopilot](autopilot.md)                                   | Bounded play by an Autopilot AI, and its Autopilot memory.                                               |
| Determinism and randomness | [Determinism and Randomness](determinism-and-randomness.md) | Reproducible Campaigns, the Campaign seed, random outcomes, and unique identifiers.                      |
| Turn advancement           | [Turn Advancement](turn-advancement.md)                     | The canonical order of everything Advance turn applies, and which values each part uses.                 |

# Single-player scope

The game is single-player; multiplayer in any form is out of scope. A Campaign has exactly one player, whether that
player's Player actions are issued by the Session controller or by an Autopilot AI on the player's behalf. No engine
API operation lets a second player join, observe, or share a Session or a Campaign.

# Campaign lifecycle

A Session starts when the game starts and ends when the game exits. A newly opened Session has no Current campaign
and Dev mode is disabled. This is the main-menu state in Web UI. What a Session holds is stated under
[Data ownership](#data-ownership).

![Campaign lifecycle: a Session starts with no Current campaign, create or load selects one, close removes it, and the Session ends when the game exits](../../images/campaign-lifecycle.svg)

`session.getStatus()` reports whether a Current campaign exists and the Session's access and Autopilot status.
`session.newCampaign.create(options)` creates a Campaign using the current Game build and the Session's new-Campaign
setup. [Campaign seed](determinism-and-randomness.md#campaign-seed) in Determinism and Randomness owns what
`getStatus()` reports and what `options` carries about randomness. The new-Campaign setup is the selected preset and
its Preset edits, read and changed through `session.newCampaign` as
[Preset selection and edits](configuration.md#preset-selection-and-edits) specifies; the Session holds it and it is
never persisted. `session.campaign.load(save)` restores a Campaign save and selects its Campaign
as the Current campaign, as [Saves](saves.md) specifies. Successful creation or load selects the Current campaign and
disables Dev mode. A newly created Campaign has a Timeline with no Player actions, no Autopilot memory, and no Campaign save.

`session.campaign.close()` removes the Current campaign and disables Dev mode. Campaign-dependent operations fail
when no Current campaign exists. The following Session API operations need no Current campaign: `session.getStatus()`,
every `session.globalConfiguration` operation, `session.campaign.listSaves()`, `session.campaign.load(save)`,
every `session.newCampaign` operation, and `session.autopilot.listAutopilotAis()`. Creation, load, and closure invalidate prior campaign access. Failure to create or
load preserves the existing Session. Closing or replacing the Current campaign does not implicitly save it.

# Player queries and actions

Player-visible information describes deliberate ordinary-player exposure. The term does not specify a particular query
schema or reveal condition; [Player Information](../interfaces/player-information.md) owns those conditions.

Player API queries always return Player-visible information. The same query at equal Campaign state returns the
same Player-visible information for the Session controller and Autopilot AI, independent of Dev mode.

A player may commit any sequence of eligible Player API actions during a turn. `player.actions.advanceTurn()` is
itself one Player action, applied atomically: no intermediate result is separately committed.
[Turn Advancement](turn-advancement.md) owns what it applies and in which order. Each successful state-changing Player API action is one Player action.
[Timeline entries](timeline.md#timeline-entries) in Timeline states which Player actions the Timeline records; Advance
turn is a Player action that the Timeline does not record. A rejected action or an action with no effect is not a
Player action and changes nothing, under [Committed state integrity](#committed-state-integrity).

The mechanics specification owning each gameplay action, e.g. `assignAgents(...)` or `purchaseUpgrade(...)`, states
the action's preconditions, what the player observes when a precondition fails, and the action's state changes: when
they apply, which values change, and by how much. A rejected action changes nothing, under
[Committed state integrity](#committed-state-integrity). The gameplay action inventory is extensible; future gameplay
actions follow the same atomicity, visibility, and replay contract.

# Dev mode and developer operations

Only the Session controller can call `session.developer.enable()` or `session.developer.disable()`. Enabling requires
a Current campaign and no active Autopilot engagement. Developer API inspection returns detached, read-only full Campaign
state. It never reveals hidden facts through ordinary game behavior.
`developer.actions.addMoney(amount)` and `developer.actions.addAgents(...)` are required starter cheat operations;
Developer API owns their exact inputs, validation, and effects. Future cheat operations belong in that namespace.
Cheat operations must preserve model invariants, and each successful one is one atomic Player action in the Timeline.

Dev mode starts disabled and is disabled on successful creation, load, or closure. Timeline navigation and
[Autosave navigation](timeline.md#autosave-navigation) leave the current Dev mode setting unchanged. Dev mode is not Campaign state and is never restored from a Campaign save or the
Timeline. Disabling Dev mode revokes subsequent Developer API access. Previously returned information
cannot be erased from the Session controller's knowledge.

Autopilot may be engaged while Dev mode is enabled, but Developer API operations remain unavailable while Autopilot
is engaged and the Autopilot AI never receives them. Dev mode transitions are unavailable while Autopilot is engaged. To inspect or cheat, the Session controller disengages Autopilot and waits for disengagement to complete.

# Derived value consistency

After any action or restoration, every query result, report, and Player-visible information equals what would be
computed from the current Campaign state. After restoration, that is the restored Committed state rather than one
that was undone; e.g., no result may come from a value computed before an undo.

Two Campaign states are equal exactly when their Authoritative values are equal, under
[Authoritative and Derived values](core-concepts.md#authoritative-and-derived-values) in Core Concepts. Equal Campaign
states under the same Game build therefore have equal Derived values.

# Information boundary

The boundary of Player-visible information applies to every channel through which Player API returns information,
not only query results: action discovery, validation errors, reports, Timeline status, and identifiers. E.g., the
error for a rejected action must not reveal a hidden value that the matching query hides. Developer API is the only
path to information that is not Player-visible information, under [API hierarchy](#api-hierarchy).

Returned views are detached: no returned value is a mutable reference into Campaign state.

A Campaign save contains information that is not Player-visible information, so no operation available to an
Autopilot AI returns a Campaign save or its contents. The engine guarantees only the information it supplies to an
Autopilot AI; it cannot erase information a human discloses outside the engine API.

# Committed state integrity

Every Committed state satisfies every invariant that a specification states. A specification stating an invariant
states its condition and its scope; [Campaign State](campaign-state.md) states the campaign-data invariants, e.g.
composition, identity, reference, and historical-fact constraints. Campaign creation, committed Player API and
Developer API actions, and restoration therefore each produce a Committed state that satisfies them.

Rejected requests leave Campaign state, reports, the Timeline, and Autopilot memory unchanged. This covers every
rejection, e.g. no Current campaign, an unavailable Timeline navigation target, or an unauthorized call.
Intermediate processing must not be exposed as Committed state; e.g., values computed partway through Advance turn
are never returned. Failed
Timeline navigation or load preserves the entire prior Session. Broken references or internal invariants are reported
as engine/data defects rather than silently repaired into different gameplay outcomes.
Exact error representations and asynchronous operation results belong to TypeScript Player API.

# Acceptance examples

- **Session without a Campaign:** Start the game before selecting a playthrough. It is a Session with no selected
  Campaign, not an empty Campaign, and a gameplay query fails without mutation ([Campaign lifecycle](#campaign-lifecycle)).
- **Session not persisted:** Select a Campaign, save it, exit, and start the game again. The new Session has no
  selected Campaign until the Campaign save is loaded, and loading restores the Campaign's saved data but none of the earlier
  Session's runtime state ([Campaign lifecycle](#campaign-lifecycle), [Data ownership](#data-ownership)).
- **Developer isolation:** Enable Dev mode and inspect hidden difficulty H through Developer API. Player API still
  hides H. Engage Autopilot; its queries and errors hide H and its developer calls fail. Disable Dev mode after
  disengagement and verify Developer API access is revoked
  ([Dev mode and developer operations](#dev-mode-and-developer-operations), [API hierarchy](#api-hierarchy),
  [Information boundary](#information-boundary)).
- **Defects:** A broken internal reference reports an engine defect without publishing intermediate Campaign state.
  Returned inspection data cannot mutate the engine ([Committed state integrity](#committed-state-integrity),
  [Information boundary](#information-boundary)).
- **Campaign integrity:** A Player action and its undo and redo preserve declared campaign-data composition and identity,
  and required historical references remain resolvable ([Committed state integrity](#committed-state-integrity)).
