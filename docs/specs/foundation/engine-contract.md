# Engine Contract

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | ENG                                                            |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define the engine's API hierarchy and the guarantees it provides when running the game, exposing information, and restoring history.

This document owns observable execution guarantees, not a UI framework, internal architecture, exact API signatures, turn phase order,
RNG algorithm, save encoding, or subsystem mechanics.

- Uses [Core Concepts](./core-concepts.md) for shared Campaign, Session, Game build, Rule kind, committed-data, identity, and information vocabulary in execution guarantees.
- Used by [Campaign](../mechanics/campaign.md) for atomic command commitment and action-history guarantees applied to Campaign configuration changes.
- Used by [Gameplay Dependency Direction](../guidance/gameplay-dependency-direction.md) for the continuation-state guarantee that its non-behavioural guidance helps implementations satisfy.
- Refined by [Campaign Modeling Contract](./campaign-modeling-contract.md), which specifies campaign composition, identity, references, and historical preservation under engine integrity guarantees.
- Refined by [Developer API](../interfaces/developer-api.md), which specifies Dev mode, full Campaign state inspection, and validated cheat operations.
- Refined by [History and Persistence](./history-and-persistence.md), which specifies the reversible campaign history, replay, and save/load guarantees.
- Refined by [Numbers and Randomness](./numbers-and-randomness.md), which specifies the numeric and random behavior required for reproducible execution.
- Refined by [Player Information](../interfaces/player-information.md), which specifies the complete player knowledge contract and hidden-state boundary.
- Refined by [Turn Resolution](./turn-resolution.md), which specifies the precise phase order and snapshot rules for executing a turn.
- Refined by [TypeScript Player API](../interfaces/typescript-api.md), which specifies the exact TypeScript signatures for all engine API surfaces and role-restricted results.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Used by [Campaign](../mechanics/campaign.md)
- Used by [Gameplay Dependency Direction](../guidance/gameplay-dependency-direction.md)
- Refined by [Campaign Modeling Contract](./campaign-modeling-contract.md)
- Refined by [Developer API](../interfaces/developer-api.md)
- Refined by [History and Persistence](./history-and-persistence.md)
- Refined by [Numbers and Randomness](./numbers-and-randomness.md)
- Refined by [Player Information](../interfaces/player-information.md)
- Refined by [Turn Resolution](./turn-resolution.md)
- Refined by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

| Term                  | Definition                                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session controller    | The caller holding Session authority: managing the Session, selecting the Current campaign, navigating history, changing Dev mode, and engaging or disengaging Autopilot. Typical callers are a human using CLI or Web UI, or an LLM-based agent driving the API or CLI; the role's authority does not depend on which kind of caller holds it. |
| Autopilot             | The game feature through which the Session controller lends Player API control of the Current campaign to an Autopilot AI within an Autopilot limit, then regains it.                                                                                                                                                                           |
| Autopilot AI          | The AI that plays through Player API while Autopilot is engaged, with access only to Player-visible information and its own Autopilot memory.                                                                                                                                                                                                   |
| Autopilot limit       | The bound on an Autopilot engagement, measured in committed player actions or turn advancements.                                                                                                                                                                                                                                                |
| Autopilot engagement  | One period from engaging to disengaging Autopilot, with a fixed Autopilot limit, Autopilot progress, and a disengagement reason.                                                                                                                                                                                                                |
| Autopilot progress    | The committed player actions and turn advancements counted toward the Autopilot limit in the current Autopilot engagement, reported to the Session controller. The Autopilot AI does not receive it.                                                                                                                                            |
| Autopilot memory      | Data an Autopilot AI writes through Autopilot memory API to carry its plans across Autopilot engagements. It is checkpointed at history positions, isolated by Campaign, Autopilot AI identity, and timeline branch, and saved with the campaign timeline. It is not Campaign state, and gameplay never depends on it.                          |
| Session API           | The API surface for Session controller operations over campaign selection, persistence, history navigation, Dev mode, and Autopilot.                                                                                                                                                                                                            |
| Player API            | The API surface for ordinary gameplay queries and actions; all returned information remains Player-visible information regardless of Dev mode.                                                                                                                                                                                                  |
| Developer API         | The separate API surface for full Campaign state inspection and validated cheat actions, available only to the Session controller while Dev mode is enabled.                                                                                                                                                                                    |
| Autopilot memory API  | The API surface through which the active Autopilot AI reads and writes its Autopilot memory.                                                                                                                                                                                                                                                    |
| Current campaign      | The Campaign selected in the Session by the most recent successful campaign creation or load, until replacement or closure.                                                                                                                                                                                                                     |
| Current save          | The save that the Current campaign was most recently loaded from or written to, if any; it is Session state and is cleared when the Current campaign is closed or replaced.                                                                                                                                                                     |
| Dev mode              | A Session access setting that grants the Session controller Developer API access without changing Player API visibility or Autopilot AI authority.                                                                                                                                                                                              |
| Turn-start checkpoint | A history position immediately after campaign creation or a committed Advance turn action, before subsequent actions.                                                                                                                                                                                                                           |

Shared vocabulary, including Session, is defined by [Core Concepts](core-concepts.md#glossary).
The name Autopilot AI avoids using Agent for an execution role.

# Concepts and contract

## API hierarchy

The engine API is the source of truth for execution and access behavior. Terminal CLI and Web UI are required
adapters over the same API. Both expose the Session controller workflow; neither independently implements gameplay,
history, visibility, or Autopilot rules. The engine grants Session controller authority by role, never by the kind of
caller holding it. An Autopilot AI never inherits that authority, whatever model or software implements it.

The complete namespace inventory is `session`, `player`, `developer`, and `autopilotMemory`. The following tree is the
required starter operation inventory. Additional gameplay and developer operations may be added under the same
ownership rules; the two gameplay operations and two cheat operations shown here do not exhaust future functionality.
Names declare conceptual API operations; TypeScript Player API owns exact signatures, argument Types, and results.

```text
Engine API
├── session
│   ├── getStatus()
│   ├── campaigns
│   │   ├── create(options)
│   │   ├── load(save)
│   │   ├── save()
│   │   ├── saveAsNew()
│   │   └── close()
│   ├── history
│   │   ├── getStatus()
│   │   ├── undoAction()
│   │   ├── redoAction()
│   │   ├── undoTurn()
│   │   └── redoTurn()
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

The complete namespace placement rules are:

| Namespace           | Owns                                                                                |
| ------------------- | ----------------------------------------------------------------------------------- |
| `session`           | Session management and execution authority; it does not implement gameplay actions. |
| `player.queries`    | Read-only Player-visible information and ordinary action discovery.                 |
| `player.actions`    | Normal gameplay mutations, including Advance turn.                                  |
| `developer.queries` | Read-only inspection of full Campaign state.                                        |
| `developer.actions` | Validated, recorded cheat mutations; for example, adding money or adding Agents.    |
| `autopilotMemory`   | Autopilot memory for the active Autopilot AI, independent of gameplay resolution.   |

The complete role access matrix is:

| Surface              | Session controller                                                                      | Active Autopilot AI                                                   |
| -------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Session API          | Available subject to lifecycle and Autopilot restrictions                               | Unavailable                                                           |
| Player API           | Available with a Current campaign; mutations blocked during Autopilot                   | Available only for its Current campaign and remaining Autopilot limit |
| Developer API        | Available with a Current campaign, Dev mode enabled, and no active Autopilot engagement | Unavailable in every Dev mode setting                                 |
| Autopilot memory API | Unavailable                                                                             | Available only for its own active Autopilot engagement                |

Authority must be enforced by the engine at invocation time. Passing a restricted facade without enforcing its
restrictions is insufficient. Access must be revoked when an Autopilot engagement ends or the Current campaign changes.
An Autopilot AI must not receive the unrestricted engine object or an alternative CLI or Web UI path to Session API
or Developer API operations.

# Requirements

## Campaign lifecycle

The Session holds the Current campaign selection, its Current save, Dev mode, and the active Autopilot engagement, if
any; none of these is persisted. A newly opened Session has no Current campaign and Dev mode is disabled. This is the main-menu state in
Web UI.
`session.getStatus()` reports whether a Current campaign exists and the Session's access and Autopilot status.
`session.campaigns.create(options)` creates a Campaign using the current Game build, with explicit initialization
inputs sufficient for reproducibility. `session.campaigns.load(save)` restores a saved campaign timeline and selects it as the Current campaign.
Successful creation or load selects the Current campaign and disables Dev mode. Creation starts a fresh timeline
and fresh Autopilot memory; loading restores the saved timeline and applicable memory.

`session.campaigns.close()` removes the Current campaign and disables Dev mode. Campaign-dependent operations fail
when no Current campaign exists. Creation, load, and closure invalidate prior campaign access. Failure to create or
load preserves the existing Session. Saving captures the Current campaign at a committed action boundary, even
before the player advances the turn. Closing or replacing the Current campaign does not implicitly save it.

## Campaign data integrity

Campaign creation, committed Player API and Developer API actions, and restoration must preserve the declared
campaign-data composition, identity, reference, and historical-fact invariants.
Detailed campaign-data structures and the constraints preserving them belong to refining specifications.

## Player queries and actions

Player API queries always return Player-visible information. The same query at equal Campaign state returns the
same Player-visible information for the Session controller and Autopilot AI, independent of Dev mode.
Queries must not mutate Campaign state or consume gameplay randomness.

A player may commit any sequence of eligible Player API actions during a turn. `player.actions.advanceTurn()` is
itself one player action; it atomically executes the turn resolution specified by Turn Resolution. Its internal
phases are not separately exposed action-history entries. Each successful state-changing Player API action commits
one action-history entry. Rejected actions and actions with no effect commit no action-history entry and consume
no gameplay randomness or generated Instance IDs.

Mechanics specifications own the Eligibility Rules and Effect Rules, under [Rule kinds](core-concepts.md#rule-kinds),
for `assignAgents(...)` and `purchaseUpgrade(...)`.
These are examples of the extensible gameplay action inventory; future gameplay actions follow the same atomicity,
visibility, and replay contract.

## Dev mode and developer operations

Only the Session controller can call `session.developer.enable()` or `session.developer.disable()`. Enabling requires
a Current campaign and no active Autopilot engagement. Developer API inspection returns detached, read-only full Campaign
state, with all inputs needed for continuation. It never reveals hidden facts through ordinary gameplay Rules.
`developer.actions.addMoney(amount)` and `developer.actions.addAgents(...)` are required starter cheat operations;
Developer API owns their exact inputs, validation, and effects. Future cheat operations belong in that namespace.
Cheat operations must preserve model invariants and commit atomic, replayable action-history entries.

Dev mode starts disabled and is disabled on successful creation, load, or closure. History navigation leaves the
current Dev mode setting unchanged. Dev mode is not gameplay Campaign state and is not restored as authority from
a save or action history. Disabling Dev mode revokes subsequent Developer API access. Previously returned information
cannot be erased from the Session controller's knowledge.

Autopilot may be engaged while Dev mode is enabled, but Developer API operations remain unavailable while Autopilot
is engaged and the Autopilot AI never receives them. Dev mode transitions are unavailable while Autopilot is engaged. To inspect or cheat, the Session controller disengages Autopilot and waits for disengagement to complete.

## Autopilot limits

`session.autopilot.engage(autopilotAiId, limit)` engages Autopilot for the Current campaign. At most one
Autopilot engagement may be active in a Session. The complete Autopilot limit inventory is:

| Autopilot limit     | Input                      | Successful completion                                                                   |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| `singleAction`      | No action count            | One Player API action successfully commits, including Advance turn if chosen.           |
| `untilTurnAdvanced` | No turn count              | The first Advance turn action successfully commits, after any preceding player actions. |
| `turnAdvancements`  | A positive integer `count` | Exactly `count` Advance turn actions successfully commit.                               |

Queries, memory operations, rejected actions, and actions with no effect count toward no Autopilot limit. The limit measures
committed player actions or turn advancements, not model calls. The engine counts commits and disengages
Autopilot immediately at its limit; another mutation through that Autopilot engagement is rejected.
The engine drives each Autopilot engagement: it repeatedly invokes the Autopilot AI to choose its next Player API
action, during which the AI may make Player API queries and Autopilot memory operations, until Autopilot disengages.
The Autopilot AI never decides when an engagement ends. A malformed limit or unavailable Autopilot AI
rejects engagement without changing Campaign state or creating an active Autopilot engagement.

The Autopilot AI receives only Player API access and its own Autopilot memory API access. It does not receive its
Autopilot limit or Autopilot progress, so it plays for the campaign as a whole rather than toward the end of the
engagement; a plan extending beyond the limit is carried forward in Autopilot memory. It chooses actions using Player-visible information and its applicable memory. Strategy and model-provider
behavior belong outside gameplay resolution. The engine must not pass developer inspection, unrestricted saves,
hidden command logs, or the Session controller's unrestricted conversation into the Autopilot AI context.

## Autopilot lifecycle and concurrency

`session.autopilot.getStatus(engagementId)` reports the Autopilot limit, Autopilot progress, and execution status to the Session
controller. The complete disengagement reason inventory is limit reached, disengaged by controller, campaign ended, and AI
failed. A disengagement result identifies the reason, whether the Autopilot limit was reached, and Autopilot progress.
Campaign completion before the limit is reached disengages with campaign ended; reaching the limit on the same
action takes precedence as limit reached. Autopilot disengages as AI failed when the Autopilot AI reports an error,
produces no valid action, or exhausts its configured finite execution budget. That budget prevents indefinitely
repeated invalid actions or non-progressing model calls; its exact limits belong to TypeScript Player API.

Campaign mutations are serialized. During an Autopilot engagement, the Session controller may read Player API queries,
Session status, history status, and Autopilot status, and disengage Autopilot. All other Session API operations,
Session controller gameplay mutations, and Developer API operations are unavailable until disengagement completes.
`session.autopilot.disengage(engagementId)` requests disengagement between atomic actions. An action already executing either
commits completely or fails without effects. Disengagement never implicitly advances a turn or rolls back earlier
committed actions. Failure of the AI follows the same boundary rule. Late responses from a completed Autopilot engagement
cannot mutate Campaign state or write memory. History navigation remains available after disengagement.

## Action history and turn navigation

Action-history entries retain the ordered committed Player API and Developer API commands and sufficient inputs to
restore or reproduce their results. Save operations, queries, Dev mode transitions, and Autopilot lifecycle
operations are not gameplay action-history entries. Autopilot contributes the same individual player action-history
entries as direct execution; it does not collapse an Autopilot engagement into one undo unit.

`session.history.getStatus()` exposes navigation availability and cursor metadata without exposing hidden Campaign
state. `undoAction()` restores the position immediately before the preceding committed action; `redoAction()`
restores the position immediately after the next retained action. Every restored position includes the complete
continuation state and its applicable Autopilot memory. A new committed Player API or Developer API action after
undo discards the redo continuation and its memory, establishing a new timeline branch.

Turn-start checkpoints exist immediately after creation and after every committed Advance turn. The current turn's
start is the most recent Turn-start checkpoint at or before the current cursor. `undoTurn()` restores the preceding
Turn-start checkpoint before that current turn's start. It therefore reverses the previous completed turn together
with any actions already committed in the current turn. `redoTurn()` restores the nearest retained Turn-start
checkpoint strictly after the current cursor. This is the complete target-selection rule.

From the start of turn 5 or partway through turn 5, `undoTurn()` returns to the start of turn 4. To reverse only
current-turn edits, use `undoAction()`. At a Turn-start checkpoint, one `redoTurn()` replays the next complete turn;
remaining current-turn edits are individually accessible through `redoAction()`. Partial retained futures without
a following Turn-start checkpoint remain accessible through `redoAction()`. An unavailable target rejects navigation
without changing the Session; no rewind penalty is added.

History and Persistence owns restoration procedures and representation, not alternative navigation targets.

## Continuation state

For equal initial Campaign state, the same Game build, and the same ordered committed commands, execution must
produce equal resulting Campaign state, generated Instance IDs, gameplay RNG state, and retained reports. Campaign
state must preserve every input consulted by Rules, including relevant History, current RNG state, and Instance ID
generation state. An initial random seed alone is insufficient unless it determines the complete restored generator
position. Gameplay must not depend on wall-clock time, UI rendering, model responses, or Autopilot memory.

Determinism is required within one implementation and Game build, not across different implementations of the
specification. Consequently, the order of random draws, the order in which Campaign instances are created within one
command, and the sequence and format of generated Instance IDs are the implementer's choice, provided the equality
guarantee above holds. Two implementations may therefore produce different outcomes from the same initial Campaign
state and commands; each must reproduce its own outcomes exactly.

Undo/redo and replay restore or reproduce committed commands without invoking AI strategy again. Recorded Developer
API commands are restored under history authority without granting Developer API access or requiring Dev mode.
Internal restoration may use snapshots or replay, provided observable results are equal. Engine internals for
restoration must not become an Autopilot AI path to hidden information or arbitrary mutation.

## Autopilot memory

`autopilotMemory.read()` returns the active Autopilot AI's applicable Autopilot memory, or an explicit absence
when none exists. `autopilotMemory.write(memory)` atomically replaces that Autopilot memory without changing
Campaign state, consuming gameplay randomness, or counting toward the Autopilot limit. The memory is produced
through the restricted Autopilot AI context; the Session controller cannot inject developer knowledge through this API.

Memory is isolated by Campaign, Autopilot AI identity, and timeline branch, and is checkpointed at its history
position. Later Autopilot engagements for the same Autopilot AI read the applicable checkpoint. At a given position,
subsequent writes replace its applicable checkpoint; restoration to an earlier position must select only memory
available at that earlier position, never memory from a later cursor or discarded branch. Redo restores applicable
checkpoints along the retained future. History and Persistence owns encoding and checkpoint storage procedures.

A new branch discards all memory checkpoints from the removed future, even if that future belonged to another AI
controller. Loaded saves restore applicable checkpoints. A live Autopilot engagement and external model conversation are
not resumed on load. The Autopilot AI context must be recreated from permitted information and restored memory;
stale external conversation from an undone future must not accompany a new Autopilot engagement.

## Save and load

`session.campaigns.save()` writes the Current campaign to its Current save, replacing that save's contents. When the
Current campaign has no Current save, it creates a new save and makes that the Current save.
`session.campaigns.saveAsNew()` always creates a new save of the same Campaign and makes that the Current save; every
earlier save is unchanged. Forking a timeline uses `saveAsNew()`: there is no separate fork operation, and a fork
keeps the Campaign's identity.

A save captures complete continuation state, the action-history cursor, retained undo/redo
continuation, and Autopilot memory checkpoints associated with that timeline, unless the save size limit in History
and Persistence requires dropping that history; such a save reports the loss and restores only its saved position. A successful load restores those
contents atomically with no active Autopilot engagement and Dev mode disabled. Saves contain hidden Campaign state and
must never be exposed to Autopilot AI as readable gameplay information. Encoding, the save size limit, validation,
and storage failure procedures belong to History and Persistence.

## Derived value consistency

Queries, Derived value calculations under Calculation Rules, and evaluation of Eligibility Rules must neither mutate
Campaign state nor consume gameplay randomness.
Caches must be updated or invalidated when their inputs change, including after restoration. Restored reports and
Player-visible information must correspond to the restored cursor rather than a discarded future.

## Information boundary

Player API always exposes only Player-visible information. Developer API adds a distinct full-state inspection path
for an authorized Session controller. The boundary applies to query results, action discovery, validation errors,
reports, subscriptions, and history metadata. Hidden identifiers and error details must follow the same boundary.
Returned views must not provide mutable references into Campaign state. The engine guarantees the information it
supplies to Autopilot AI; it cannot erase information independently disclosed by a human outside the API.

## Committed state integrity

Rejected requests leave Campaign state, gameplay RNG state, Instance ID generation state, reports, action history,
and memory unchanged. Execution infrastructure may record a rejected attempt for Autopilot status and budgets;
that telemetry is not Campaign state. Intermediate processing must not be exposed as Committed state. Failed
history navigation or load preserves the entire prior Session. Broken references or internal invariants are reported
as engine/data defects rather than silently repaired into different gameplay outcomes.

## Game build compatibility

Backward compatibility and save migration across Game builds are not required. A Game build may reject incompatible
saves. History and Persistence owns validation and incompatible-save handling. An unsuccessful load does not discard
the Current campaign; successful restoration satisfies all continuation and integrity guarantees above.

# Edge cases and failure behavior

No Current campaign, unavailable history targets, invalid Autopilot limits, stale access, and unauthorized calls reject without
Campaign state changes under [Committed state integrity](#committed-state-integrity). Autopilot disengagement and AI
failure preserve committed actions under [Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency).
Exact error representations and asynchronous operation results belong to TypeScript Player API. A Session controller
cannot erase previously inspected hidden information by disabling Dev mode, and history navigation cannot erase a
human's memory; engine-supplied Autopilot AI context nevertheless follows [Autopilot memory](#autopilot-memory).

# Acceptance examples

- **Lifecycle:** Open a Session with no Current campaign. A gameplay query fails without mutation. Create Campaign A,
  save after a gameplay action before Advance turn, then create Campaign B. Load the saved Campaign A and obtain the
  exact saved continuation with Dev mode disabled and no active Autopilot engagement. A corrupt load leaves Campaign A
  unchanged ([Campaign lifecycle](#campaign-lifecycle), [Save and load](#save-and-load)).
- **Fork by saving as new:** Load save S1 and commit actions. `saveAsNew()` creates S2 and makes it the Current save.
  Undo two actions and commit a different action, then `save()`. S2 contains the new branch; S1 still contains the
  original future. Both belong to the same Campaign ([Save and load](#save-and-load)).
- **Developer isolation:** Enable Dev mode and inspect hidden difficulty H through Developer API. Player API still
  hides H. Engage Autopilot with `untilTurnAdvanced`; its queries and errors hide H, its developer calls fail, and
  its first committed Advance turn ends execution. A late action fails. Disable Dev mode after disengagement and
  verify Developer API access is revoked ([Dev mode and developer operations](#dev-mode-and-developer-operations),
  [Autopilot limits](#autopilot-limits), [Information boundary](#information-boundary)).
- **Limit accounting:** In `singleAction`, repeated queries and a rejected action do not reach the limit; one
  committed gameplay action does. In `turnAdvancements` with count 2, ordinary actions do not increase Autopilot progress toward the limit;
  the second committed Advance turn disengages Autopilot before a third can execute
  ([Autopilot limits](#autopilot-limits)).
- **Action replay:** Starting at S, add money through Developer API, commit ordinary gameplay actions, and Advance
  turn. Undo each action and redo it with Dev mode disabled. Complete Campaign state, RNG state, generated Instance
  IDs, and retained reports equal the original results. Queries between actions do not change those results
  ([Action history and turn navigation](#action-history-and-turn-navigation), [Continuation state](#continuation-state)).
- **Turn targets:** At the start of turn 5, `undoTurn()` restores the start of turn 4 and `redoTurn()` restores the
  start of turn 5. After one action in turn 5, `undoTurn()` also restores the start of turn 4 and removes that current-turn action. Undo then commit a
  different action; the discarded future cannot be redone
  ([Action history and turn navigation](#action-history-and-turn-navigation)).
- **Memory restoration:** At position P, Autopilot AI X saves plan M. Later at Q it observes a newly revealed
  outcome and saves M2. Undo to P and engage Autopilot with X again: memory is M, and neither M2 nor the stale conversation from
  Q is supplied. Save at P with its redo continuation, load, and redo to Q: applicable memory is M2
  ([Autopilot memory](#autopilot-memory), [Save and load](#save-and-load)).
- **Disengagement and defects:** Disengage Autopilot during an action. The action either commits completely or fails
  without effects; earlier committed actions remain. A broken internal reference reports an engine defect without
  publishing intermediate Campaign state. Returned inspection data cannot mutate the engine
  ([Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency), [Committed state integrity](#committed-state-integrity)).
- **Campaign integrity:** A committed action and its undo/redo preserve declared campaign-data composition and identity,
  and required historical references remain resolvable ([Campaign data integrity](#campaign-data-integrity)).
