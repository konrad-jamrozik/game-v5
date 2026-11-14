# Engine Contract

| Metadata    | Value                                                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | ENG                                                                                                                                      |
| Family      | Foundation                                                                                                                               |
| Status      | Accepted                                                                                                                                 |
| Audience    | Engine designer, UI designer, AI designer, Implementer                                                                                   |
| Owns        | API hierarchy, Principal authority, data ownership, the Engine subsystem inventory, and the guarantees shared by every engine subsystem. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                           |

# Overview

This document defines the engine's API hierarchy, the data the engine owns, and the guarantees that hold across every engine subsystem when running the game and exposing information.

It owns only cross-cutting guarantees and owns no engine subsystem. The behavior of each subsystem belongs to the one specification that [Engine subsystems](#engine-subsystems) names, e.g. [Campaign Lifecycle](./campaign-lifecycle.md) or [Turn Advancement](../mechanics/turn-advancement.md), and refinements of these guarantees belong to their refining specifications, e.g. [Campaign State](./campaign-state.md).

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Used by [Agent Recovery](../mechanics/agent-recovery.md)
- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Autopilot](./autopilot.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Campaign Lifecycle](./campaign-lifecycle.md)
- Used by [Combat](../mechanics/combat.md)
- Used by [Configuration](./configuration.md)
- Used by [Determinism and Randomness](./determinism-and-randomness.md)
- Used by [Developer Access](./developer-access.md)
- Used by [Domain Model](../mechanics/domain-model.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)
- Used by [Investigations](../mechanics/investigations.md)
- Used by [Leads and Progression](../mechanics/leads-and-progression.md)
- Used by [Missions](../mechanics/missions.md)
- Used by [Panic and Endings](../mechanics/panic-and-endings.md)
- Used by [Saves](./saves.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Timeline](./timeline.md)
- Used by [Turn Advancement](../mechanics/turn-advancement.md)
- Used by [Web UI](../ui/web-ui.md)
- Refined by [Campaign State](./campaign-state.md)

# Glossary

Shared vocabulary, including Session, is defined by [Core Concepts](core-concepts.md#glossary).

## Engine subsystems

The parts of the engine that each have one owning specification, listed under [Engine subsystems](#engine-subsystems).

| Term                 | Definition                                                                                                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine subsystem     | A part of the engine whose behavior exactly one specification owns, where that specification owns no other engine subsystem; e.g., Saves. Every engine subsystem is an API subsystem or a Supporting subsystem. |
| API subsystem        | An engine subsystem that callers reach through Engine API operations no other engine subsystem owns; e.g., Timeline, reached through `session.timeline`.                                                        |
| Supporting subsystem | An engine subsystem with no Engine API operations of its own, which other engine subsystems and gameplay rely on; e.g., Numbers.                                                                                |

## Principals and access

Kinds of engine API caller and the Session access settings that govern them.

| Term               | Definition                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Principal          | A kind of engine API caller, defined by the API authority it holds rather than by what kind of caller it is. The Principals are Session controller and Autopilot AI.                                                                                                                                                                                                                                          |
| Session controller | The Principal holding Session authority: managing the Session, changing Global configuration, selecting the Current campaign, navigating the Timeline, changing Dev mode, and engaging or disengaging Autopilot. Typical callers are, e.g., a human using a terminal or browser interface, or an LLM-based agent driving the API; the Principal's authority does not depend on which kind of caller holds it. |
| Autopilot AI       | The Principal that plays through Player API while Autopilot is engaged, with access only to Player-visible information and Autopilot memory. The name avoids using Agent for a Principal.                                                                                                                                                                                                                     |
| Dev mode           | A Session access setting that grants the Session controller Developer API access without changing Player API visibility or Autopilot AI authority.                                                                                                                                                                                                                                                            |

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

The engine API is the source of truth for execution and access behavior. Every user interface, e.g. a terminal or
browser interface, is an adapter over the same API: it exposes the Session controller workflow and independently
implements no gameplay, Timeline, visibility, or Autopilot rules. The engine grants Session controller authority by Principal, never by the kind of
caller holding it. An Autopilot AI never inherits that authority, whatever model or software implements it.

Every user interface is equivalent to the engine API it adapts: an action taken through any user interface has exactly
the result that the same operation called directly through the engine API has, and every user interface respects the
same [Information boundary](#information-boundary). E.g., assigning the same Agents to the same mission through the
terminal interface, the browser interface, and the engine API produces equal Campaign state and equal reports.

The complete namespace inventory is `session`, `player`, `developer`, and `autopilotMemory`. The following tree is the
required starter operation inventory. Additional gameplay and developer operations may be added under the same
ownership rules; the two gameplay operations and two cheat operations shown here do not exhaust future functionality.
Names declare conceptual API operations; exact signatures, argument Types, and results are the implementer's choice.

```text
Engine API
├── session
│   ├── getStatus()
│   ├── globalConfiguration
│   │   ├── get()
│   │   ├── set(setting, value)
│   │   └── reset(setting)
│   ├── campaign
│   │   ├── create(options)
│   │   └── close()
│   ├── saves
│   │   ├── list()
│   │   ├── load(save)
│   │   ├── save()
│   │   └── saveAsNew()
│   ├── newCampaignSetup
│   │   ├── listPresets()
│   │   ├── getPreset(preset)
│   │   ├── getSetup()
│   │   ├── selectPreset(preset)
│   │   ├── setPresetEdit(preset, value)
│   │   └── removePresetEdit(preset, value)
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
owns and where the behavior of its operations is specified. Every namespace below `session` belongs to exactly one
Engine subsystem, under [Engine subsystems](#engine-subsystems).

| Namespace                     | Owns                                                                                                                                                                                               | Specified in                                                                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session`                     | Session management and execution authority; it does not implement gameplay actions. Its own `getStatus()` reports the Session's Current campaign, access, and Autopilot status.                    | [Session lifecycle](campaign-lifecycle.md#session-lifecycle) in Campaign Lifecycle                                                                                                            |
| `session.globalConfiguration` | Reading, setting, and resetting Global configuration settings.                                                                                                                                     | [Global configuration](configuration.md#global-configuration) in Configuration                                                                                                                |
| `session.campaign`            | Creating a Campaign from the new-Campaign setup as the Current campaign, and closing the Current campaign.                                                                                         | [Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle                                                                                                          |
| `session.saves`               | Listing the Campaign saves in Game storage, loading a Campaign save as the Current campaign, and saving the Current campaign.                                                                      | [Listing Campaign saves](saves.md#listing-campaign-saves), [Saving](saves.md#saving), and [Loading](saves.md#loading) in Saves                                                                |
| `session.newCampaignSetup`    | Listing the Campaign configuration presets and the values of each, the new-Campaign setup, i.e. the selected preset and its Preset edits, and creating a Campaign from it as the Current campaign. | [Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle for `create`; [Preset selection and edits](configuration.md#preset-selection-and-edits) in Configuration |
| `session.timeline`            | Timeline status, undo and redo of Player actions within the current turn, and undo and redo across turns.                                                                                          | [Action navigation](timeline.md#action-navigation) and [Autosave navigation](timeline.md#autosave-navigation) in Timeline                                                                     |
| `session.developer`           | Enabling and disabling Dev mode.                                                                                                                                                                   | [Dev mode](developer-access.md#dev-mode) in Developer Access                                                                                                                                  |
| `session.autopilot`           | Listing the Autopilot AIs available for engagement, engaging Autopilot, reporting an Autopilot engagement's status, and disengaging it.                                                            | [Available Autopilot AIs](autopilot.md#available-autopilot-ais) and [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency) in Autopilot                      |
| `player.queries`              | Read-only Player-visible information and ordinary action discovery. Its `getCampaignState()` returns only the Player-visible information of Campaign state.                                        | [Player queries and actions](#player-queries-and-actions), and the specification owning each value                                                                                            |
| `player.actions`              | Normal gameplay mutations, including Advance turn.                                                                                                                                                 | The mechanics specification owning each action, under [Player queries and actions](#player-queries-and-actions); [Turn Advancement](../mechanics/turn-advancement.md) for Advance turn        |
| `developer.queries`           | Read-only inspection of full Campaign state. Its `getCampaignState()` returns Campaign state in full, unlike the Player API query of the same name.                                                | [Inspection contract](developer-access.md#inspection-contract) in Developer Access                                                                                                            |
| `developer.actions`           | Validated, recorded cheat mutations; e.g., adding money or adding Agents.                                                                                                                          | [Cheat operations](developer-access.md#cheat-operations) in Developer Access, and the Mechanics specification owning each cheat operation                                                     |
| `autopilotMemory`             | Autopilot memory for the active Autopilot AI, independent of gameplay resolution.                                                                                                                  | [Autopilot memory](autopilot.md#autopilot-memory) in Autopilot                                                                                                                                |

The complete Principal access matrix is:

| Surface              | Session controller                                                                      | Active Autopilot AI                                                     |
| -------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Session API          | Available subject to lifecycle and Autopilot restrictions                               | Unavailable                                                             |
| Player API           | Available with a Current campaign; mutations blocked during Autopilot                   | Available only for its Current campaign during its Autopilot engagement |
| Developer API        | Available with a Current campaign, Dev mode enabled, and no active Autopilot engagement | Unavailable in every Dev mode setting                                   |
| Autopilot memory API | Unavailable                                                                             | Available only during its own active Autopilot engagement               |

The engine enforces this matrix on every invocation. No operation available to an Autopilot AI reaches a Session API
or Developer API operation, including through any user interface. An Autopilot AI's access ends when its Autopilot
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
| Session                     | [Campaign Lifecycle](campaign-lifecycle.md), for when it starts and ends and its Campaign selection              |
| Dev mode                    | [Dev mode](developer-access.md#dev-mode) in Developer Access                                                     |
| Active Autopilot engagement | [What an Autopilot engagement holds](autopilot.md#what-an-autopilot-engagement-holds) in Autopilot               |
| New-Campaign setup          | [Preset selection and edits](configuration.md#preset-selection-and-edits) in Configuration                       |

Campaign state holds everything game behavior consults and nothing else, e.g. the Campaign seed, under
[Campaign seed](determinism-and-randomness.md#campaign-seed) in Determinism and Randomness. It excludes everything a Session holds,
e.g. Dev mode; Global configuration, e.g. interface preferences; and the Timeline and Autopilot memory, which a
Campaign save keeps beside Campaign state because continuing to control a Campaign needs them although game behavior
never consults them.

Nothing a Session holds is persisted, and loading a Campaign save never restores a Session.

# Engine subsystems

Each Engine subsystem has exactly one owning specification, and each of those specifications owns exactly one Engine
subsystem. This document owns none; it states only the guarantees that hold across all of them. The following table is
the complete Engine subsystem inventory.

| Engine subsystem           | Kind                 | Owner                                                       | What it provides                                                                                         |
| -------------------------- | -------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Campaign lifecycle         | API subsystem        | [Campaign Lifecycle](campaign-lifecycle.md)                 | Starting and ending a Session, and creating, loading, selecting, and closing the Current campaign.       |
| Saves                      | API subsystem        | [Saves](saves.md)                                           | Saving a Campaign and loading it back at its saved Committed state, and the Autosaves the engine writes. |
| Timeline                   | API subsystem        | [Timeline](timeline.md)                                     | Undo and redo of the Player actions of the current turn, and undo and redo across turns.                 |
| Configuration              | API subsystem        | [Configuration](configuration.md)                           | Settings shared by all Campaigns, and how a new Campaign obtains its Campaign configuration.             |
| Autopilot                  | API subsystem        | [Autopilot](autopilot.md)                                   | Bounded play by an Autopilot AI, and its Autopilot memory.                                               |
| Developer access           | API subsystem        | [Developer Access](developer-access.md)                     | Dev mode, full Campaign state inspection, and validated cheat actions for the Session controller.        |
| Turn advancement           | API subsystem        | [Turn Advancement](../mechanics/turn-advancement.md)        | The canonical order of everything Advance turn applies, and which values each part uses.                 |
| Determinism and randomness | Supporting subsystem | [Determinism and Randomness](determinism-and-randomness.md) | Reproducible Campaigns, the Campaign seed, random outcomes, and unique identifiers.                      |
| Numbers                    | Supporting subsystem | [Numbers](numbers.md)                                       | Which quantities are whole numbers, the precision of the rest, and rounding.                             |

Every Engine API operation belongs to exactly one API subsystem, except gameplay queries, gameplay actions other
than Advance turn, and cheat operations: `player.queries` returns the Player-visible information that the
specifications owning each value declare, the Mechanics specification owning each gameplay action owns that action,
under [Player queries and actions](#player-queries-and-actions), and the Mechanics specification owning the value a
cheat operation changes owns that operation, under the rules that
[Cheat operations](developer-access.md#cheat-operations) in Developer Access states for every cheat operation.
Gameplay is not an Engine subsystem. Specifications of vocabulary and data rules, e.g.
[Core Concepts](core-concepts.md) and [Campaign State](campaign-state.md), are not Engine subsystems either.

# Single-player scope

The game is single-player; multiplayer in any form is out of scope. A Campaign has exactly one player, whether that
player's Player actions are issued by the Session controller or by an Autopilot AI on the player's behalf. No engine
API operation lets a second player join, observe, or share a Session or a Campaign.

# Player queries and actions

Player-visible information describes deliberate ordinary-player exposure. The specification that owns a value states
whether it is Player-visible information and under which reveal conditions, e.g. each Mechanics specification for the
values it owns. A value that no specification declares Player-visible is not Player-visible information.

Player API queries always return Player-visible information. The same query at equal Campaign state returns the
same Player-visible information for the Session controller and Autopilot AI, independent of Dev mode.

A player may commit any sequence of eligible Player API actions during a turn. `player.actions.advanceTurn()` is
itself one Player action, applied atomically: no intermediate result is separately committed.
[Turn Advancement](../mechanics/turn-advancement.md) owns what it applies and in which order. Each successful state-changing Player API action is one Player action.
[Timeline entries](timeline.md#timeline-entries) in Timeline states which Player actions the Timeline records; Advance
turn is a Player action that the Timeline does not record. A rejected action or an action with no effect is not a
Player action and changes nothing, under [Committed state integrity](#committed-state-integrity).

The mechanics specification owning each gameplay action, e.g. `assignAgents(...)` or `purchaseUpgrade(...)`, states
the action's preconditions, what the player observes when a precondition fails, and the action's state changes: when
they apply, which values change, and by how much. A rejected action changes nothing, under
[Committed state integrity](#committed-state-integrity). The gameplay action inventory is extensible; future gameplay
actions follow the same atomicity, visibility, and replay contract.

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

No user interface shows gameplay information that Player API does not return; e.g., graphics never add information
that Player API withholds.

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
Exact error representations and asynchronous operation results are the implementer's choice.

# Acceptance examples

- **Defects:** A broken internal reference reports an engine defect without publishing intermediate Campaign state.
  Returned inspection data cannot mutate the engine ([Committed state integrity](#committed-state-integrity),
  [Information boundary](#information-boundary)).
- **Campaign integrity:** A Player action and its undo and redo preserve declared campaign-data composition and identity,
  and required historical references remain resolvable ([Committed state integrity](#committed-state-integrity)).
