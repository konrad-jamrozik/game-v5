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

- Uses [Domain Model](./domain-model.md) for the Campaign state structures and identities to which execution guarantees apply.
- Uses [Modeling Foundations](./modeling-foundations.md) for Game build, Campaign state, Committed state, and Authoritative value terminology in execution guarantees.
- Refined by [Developer API](../interfaces/developer-api.md), which specifies Dev mode, full Campaign state inspection, and validated cheat operations.
- Refined by [History and Persistence](./history-and-persistence.md), which specifies the reversible session, replay, and save/load guarantees.
- Refined by [Numbers and Randomness](./numbers-and-randomness.md), which specifies the numeric and random behavior required for reproducible execution.
- Refined by [Player Information](../interfaces/player-information.md), which specifies the complete player knowledge contract and hidden-state boundary.
- Refined by [Turn Resolution](./turn-resolution.md), which specifies the precise phase order and snapshot rules for executing a turn.
- Refined by [TypeScript Player API](../interfaces/typescript-api.md), which specifies the exact TypeScript signatures for all engine API surfaces and role-restricted results.

# Relationships

- Uses [Domain Model](./domain-model.md)
- Uses [Modeling Foundations](./modeling-foundations.md)
- Refined by [Developer API](../interfaces/developer-api.md)
- Refined by [History and Persistence](./history-and-persistence.md)
- Refined by [Numbers and Randomness](./numbers-and-randomness.md)
- Refined by [Player Information](../interfaces/player-information.md)
- Refined by [Turn Resolution](./turn-resolution.md)
- Refined by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

| Term                  | Definition                                                                                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session controller    | The caller authorized to manage the Session, select the Current campaign, navigate history, change Dev mode, and start or cancel a Delegation run; this role may be held by a human or an overarching AI. |
| Delegated AI          | An AI authorized to execute Player API operations within a Delegation run, with access only to Player-visible information and its own continuation memory.                                                |
| Delegation run        | One invocation of a Delegated AI with a fixed execution scope, progress, and a terminal result.                                                                                                           |
| Session API           | The API surface for Session controller operations over campaign selection, persistence, history navigation, Dev mode, and delegation.                                                                     |
| Player API            | The API surface for ordinary gameplay queries and actions; all returned information remains Player-visible information regardless of Dev mode.                                                            |
| Developer API         | The separate API surface for full Campaign state inspection and validated cheat actions, available only to the Session controller while Dev mode is enabled.                                              |
| Delegated AI API      | The API surface for reading and writing the active Delegated AI's continuation memory.                                                                                                                    |
| Current campaign      | The Campaign selected in the Session by the most recent successful campaign creation or load, until replacement or closure.                                                                               |
| Dev mode              | A Session access setting that grants the Session controller Developer API access without changing Player API visibility or Delegated AI authority.                                                        |
| Turn-start checkpoint | A history position immediately after campaign creation or a committed Advance turn action, before subsequent actions.                                                                                     |

Session is defined by [History and Persistence](history-and-persistence.md#glossary). Agent is a game-domain
concept owned by Domain Model; it must not name a Delegated AI.

# Concepts and contract

## API hierarchy

The engine API is the source of truth for execution and access behavior. Terminal CLI and Web UI are required
adapters over the same API. Both expose the Session controller workflow; neither independently implements gameplay,
history, visibility, or delegation rules. An AI acting as Session controller has the same authority as a human
Session controller. A Delegated AI does not inherit that authority from the model or software implementing it.

The complete namespace inventory is `session`, `player`, `developer`, and `delegatedAI`. The following tree is the
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
│   └── delegation
│       ├── start(aiControllerId, scope)
│       ├── getStatus(runId)
│       └── cancel(runId)
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
└── delegatedAI
    └── memory
        ├── read()
        └── write(memory)
```

The complete namespace placement rules are:

| Namespace            | Owns                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| `session`            | Session management and execution authority; it does not implement gameplay actions.  |
| `player.queries`     | Read-only Player-visible information and ordinary action discovery.                  |
| `player.actions`     | Normal gameplay mutations, including Advance turn.                                   |
| `developer.queries`  | Read-only inspection of full Campaign state.                                         |
| `developer.actions`  | Validated, recorded cheat mutations; for example, adding money or adding Agents.     |
| `delegatedAI.memory` | Continuation memory for the active Delegated AI, independent of gameplay resolution. |

The complete role access matrix is:

| Surface          | Session controller                                                                | Active Delegated AI                                                   |
| ---------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Session API      | Available subject to lifecycle and delegation restrictions                        | Unavailable                                                           |
| Player API       | Available with a Current campaign; mutations blocked during delegation            | Available only for its Current campaign and remaining execution scope |
| Developer API    | Available with a Current campaign, Dev mode enabled, and no active Delegation run | Unavailable in every Dev mode setting                                 |
| Delegated AI API | Unavailable as a human gameplay interface                                         | Available only for its own active Delegation run                      |

Authority must be enforced by the engine at invocation time. Passing a restricted facade without enforcing its
restrictions is insufficient. Access must be revoked when a Delegation run ends or the Current campaign changes.
A Delegated AI must not receive the unrestricted engine object or an alternative CLI or Web UI path to Session API
or Developer API operations.

# Requirements

## Campaign lifecycle

A newly opened Session has no Current campaign and Dev mode is disabled. This is the main-menu state in Web UI.
`session.getStatus()` reports whether a Current campaign exists and the Session's access and delegation status.
`session.campaigns.create(options)` creates a Campaign using the current Game build, with explicit initialization
inputs sufficient for reproducibility. `session.campaigns.load(save)` restores a saved Session's campaign timeline.
Successful creation or load selects the Current campaign and disables Dev mode. Creation starts a fresh timeline
and fresh Delegated AI memory; loading restores the saved timeline and applicable memory.

`session.campaigns.close()` removes the Current campaign and disables Dev mode. Campaign-dependent operations fail
when no Current campaign exists. Creation, load, and closure invalidate prior campaign access. Failure to create or
load preserves the existing Session. Saving captures the Current campaign at a committed action boundary, even
before the player advances the turn. Closing or replacing the Current campaign does not implicitly save it.

## Player queries and actions

Player API queries always return Player-visible information. The same query at equal Campaign state returns the
same Player-visible information for the Session controller and Delegated AI, independent of Dev mode.
Queries must not mutate Campaign state or consume gameplay randomness.

A player may commit any sequence of eligible Player API actions during a turn. `player.actions.advanceTurn()` is
itself one player action; it atomically executes the turn resolution specified by Turn Resolution. Its internal
phases are not separately exposed action-history entries. Each successful state-changing Player API action commits
one action-history entry. Rejected actions and actions with no effect commit no action-history entry and consume
no gameplay randomness or generated Instance IDs.

Mechanics specifications own eligibility and gameplay effects for `assignAgents(...)` and `purchaseUpgrade(...)`.
These are examples of the extensible gameplay action inventory; future gameplay actions follow the same atomicity,
visibility, and replay contract.

## Dev mode and developer operations

Only the Session controller can call `session.developer.enable()` or `session.developer.disable()`. Enabling requires
a Current campaign and no active Delegation run. Developer API inspection returns detached, read-only full Campaign
state, with all inputs needed for continuation. It never reveals hidden facts through ordinary gameplay Rules.
`developer.actions.addMoney(amount)` and `developer.actions.addAgents(...)` are required starter cheat operations;
Developer API owns their exact inputs, validation, and effects. Future cheat operations belong in that namespace.
Cheat operations must preserve model invariants and commit atomic, replayable action-history entries.

Dev mode starts disabled and is disabled on successful creation, load, or closure. History navigation leaves the
current Dev mode setting unchanged. Dev mode is not gameplay Campaign state and is not restored as authority from
a save or action history. Disabling Dev mode revokes subsequent Developer API access. Previously returned information
cannot be erased from the Session controller's knowledge.

A Delegation run may start while Dev mode is enabled, but Developer API operations remain unavailable during the
Delegation run and the Delegated AI never receives them. Dev mode transitions are unavailable during a Delegation
run. To inspect or cheat, the Session controller cancels the Delegation run and waits for termination.

## Delegation scopes

`session.delegation.start(aiControllerId, scope)` starts one Delegation run for the Current campaign. At most one
Delegation run may be active in a Session. The complete scope inventory is:

| Scope               | Input                      | Successful completion                                                                   |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| `singleAction`      | No action count            | One Player API action successfully commits, including Advance turn if chosen.           |
| `untilTurnAdvanced` | No turn count              | The first Advance turn action successfully commits, after any preceding player actions. |
| `turnAdvancements`  | A positive integer `count` | Exactly `count` Advance turn actions successfully commit.                               |

Queries, memory operations, rejected actions, and actions with no effect consume no scope allowance. Scope measures
committed player actions or turn advancements, not model calls. The engine counts commits and terminates the
Delegation run immediately at its scope boundary; another mutation through that Delegation run is rejected.
Completion does not depend on a voluntary AI completion signal. A malformed scope or unavailable AI controller
rejects the start without changing Campaign state or creating an active Delegation run.

The Delegated AI receives only Player API access, its own Delegated AI API access, and its Delegation run scope and
progress. It chooses actions using Player-visible information and its applicable memory. Strategy and model-provider
behavior belong outside gameplay resolution. The engine must not pass developer inspection, unrestricted saves,
hidden command logs, or the Session controller's unrestricted conversation into the Delegated AI context.

## Delegation lifecycle and concurrency

`session.delegation.getStatus(runId)` reports scope, committed progress, and execution status to the Session
controller. The complete terminal reason inventory is scope completed, cancelled, campaign ended, and AI failed.
A terminal result identifies the reason, whether the requested scope was reached, and committed progress. Campaign
completion before the requested scope is reached terminates with campaign ended; reaching the scope on the same
action takes precedence as scope completed. An AI returning early without reaching its scope terminates as AI failed.
A configured finite execution budget prevents indefinitely repeated invalid actions or non-progressing model calls;
its exact limits belong to TypeScript Player API.

Campaign mutations are serialized. During a Delegation run, the Session controller may read Player API queries,
Session status, history status, and delegation status, and request cancellation. All other Session API operations,
Session controller gameplay mutations, and Developer API operations are unavailable until termination.
`session.delegation.cancel(runId)` requests termination between atomic actions. An action already executing either
commits completely or fails without effects. Cancellation never implicitly advances a turn or rolls back earlier
committed actions. Failure of the AI follows the same boundary rule. Late responses from a terminated Delegation run
cannot mutate Campaign state or write memory. History navigation remains available after termination.

## Action history and turn navigation

Action-history entries retain the ordered committed Player API and Developer API commands and sufficient inputs to
restore or reproduce their results. Save operations, queries, Dev mode transitions, and delegation lifecycle
operations are not gameplay action-history entries. Delegation contributes the same individual player action-history
entries as direct execution; it does not collapse a Delegation run into one undo unit.

`session.history.getStatus()` exposes navigation availability and cursor metadata without exposing hidden Campaign
state. `undoAction()` restores the position immediately before the preceding committed action; `redoAction()`
restores the position immediately after the next retained action. Every restored position includes the complete
continuation state and its applicable Delegated AI memory. A new committed Player API or Developer API action after
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
position. Gameplay must not depend on wall-clock time, UI rendering, model responses, or Delegated AI memory.

Undo/redo and replay restore or reproduce committed commands without invoking AI strategy again. Recorded Developer
API commands are restored under history authority without granting Developer API access or requiring Dev mode.
Internal restoration may use snapshots or replay, provided observable results are equal. Engine internals for
restoration must not become a Delegated AI path to hidden information or arbitrary mutation.

## Delegated AI memory

`delegatedAI.memory.read()` returns the active Delegated AI's applicable continuation memory, or an explicit absence
when none exists. `delegatedAI.memory.write(memory)` atomically replaces that continuation memory without changing
Campaign state, consuming gameplay randomness, or counting toward the delegation scope. The memory is produced
through the restricted Delegated AI context; the Session controller cannot inject developer knowledge through this API.

Memory is isolated by Campaign, AI controller identity, and timeline branch, and is checkpointed at its history
position. Later Delegation runs for the same AI controller read the applicable checkpoint. At a given position,
subsequent writes replace its applicable checkpoint; restoration to an earlier position must select only memory
available at that earlier position, never memory from a later cursor or discarded branch. Redo restores applicable
checkpoints along the retained future. History and Persistence owns encoding and checkpoint storage procedures.

A new branch discards all memory checkpoints from the removed future, even if that future belonged to another AI
controller. Loaded saves restore applicable checkpoints. A live Delegation run and external model conversation are
not resumed on load. The Delegated AI context must be recreated from permitted information and restored memory;
stale external conversation from an undone future must not accompany a new Delegation run.

## Save and load

`session.campaigns.save()` captures complete continuation state, the action-history cursor, retained undo/redo
continuation, and Delegated AI memory checkpoints associated with that timeline. A successful load restores those
contents atomically with no active Delegation run and Dev mode disabled. Saves contain hidden Campaign state and
must never be exposed to Delegated AI as readable gameplay information. Encoding, retention limits, validation,
and storage failure procedures belong to History and Persistence.

## Derived value consistency

Queries and Derived value calculations must neither mutate Campaign state nor consume gameplay randomness.
Caches must be updated or invalidated when their inputs change, including after restoration. Restored reports and
Player-visible information must correspond to the restored cursor rather than a discarded future.

## Information boundary

Player API always exposes only Player-visible information. Developer API adds a distinct full-state inspection path
for an authorized Session controller. The boundary applies to query results, action discovery, validation errors,
reports, subscriptions, and history metadata. Hidden identifiers and error details must follow the same boundary.
Returned views must not provide mutable references into Campaign state. The engine guarantees the information it
supplies to Delegated AI; it cannot erase information independently disclosed by a human outside the API.

## Committed state integrity

Rejected requests leave Campaign state, gameplay RNG state, Instance ID generation state, reports, action history,
and memory unchanged. Execution infrastructure may record a rejected attempt for delegation status and budgets;
that telemetry is not Campaign state. Intermediate processing must not be exposed as Committed state. Failed
history navigation or load preserves the entire prior Session. Broken references or internal invariants are reported
as engine/data defects rather than silently repaired into different gameplay outcomes.

## Game build compatibility

Backward compatibility and save migration across Game builds are not required. A Game build may reject incompatible
saves. History and Persistence owns validation and incompatible-save handling. An unsuccessful load does not discard
the Current campaign; successful restoration satisfies all continuation and integrity guarantees above.

## Gameplay dependency direction

Gameplay functions, including Campaign instance constructors, must receive only necessary inputs and dependencies,
without direct or indirect access to the top-level Campaign instance. Contained Campaign instances must not refer
back to that root. These restrictions exclude campaign creation, save/load, and external engine interfaces.

# Edge cases and failure behavior

No Current campaign, unavailable history targets, invalid scopes, stale access, and unauthorized calls reject without
Campaign state changes under [Committed state integrity](#committed-state-integrity). Delegation cancellation and AI
failure preserve committed actions under [Delegation lifecycle and concurrency](#delegation-lifecycle-and-concurrency).
Exact error representations and asynchronous operation results belong to TypeScript Player API. A Session controller
cannot erase previously inspected hidden information by disabling Dev mode, and history navigation cannot erase a
human's memory; engine-supplied Delegated AI context nevertheless follows [Delegated AI memory](#delegated-ai-memory).

# Acceptance examples

- **Lifecycle:** Open a Session with no Current campaign. A gameplay query fails without mutation. Create Campaign A,
  save after a gameplay action before Advance turn, then create Campaign B. Load the saved Campaign A and obtain the
  exact saved continuation with Dev mode disabled and no active Delegation run. A corrupt load leaves Campaign A
  unchanged ([Campaign lifecycle](#campaign-lifecycle), [Save and load](#save-and-load)).
- **Developer isolation:** Enable Dev mode and inspect hidden difficulty H through Developer API. Player API still
  hides H. Start a `untilTurnAdvanced` Delegation run; its queries and errors hide H, its developer calls fail, and
  its first committed Advance turn ends execution. A late action fails. Disable Dev mode after termination and
  verify Developer API access is revoked ([Dev mode and developer operations](#dev-mode-and-developer-operations),
  [Delegation scopes](#delegation-scopes), [Information boundary](#information-boundary)).
- **Scope accounting:** In `singleAction`, repeated queries and a rejected action do not complete the scope; one
  committed gameplay action does. In `turnAdvancements` with count 2, ordinary actions do not increment turn progress;
  the second committed Advance turn terminates the Delegation run before a third can execute
  ([Delegation scopes](#delegation-scopes)).
- **Action replay:** Starting at S, add money through Developer API, commit ordinary gameplay actions, and Advance
  turn. Undo each action and redo it with Dev mode disabled. Complete Campaign state, RNG state, generated Instance
  IDs, and retained reports equal the original results. Queries between actions do not change those results
  ([Action history and turn navigation](#action-history-and-turn-navigation), [Continuation state](#continuation-state)).
- **Turn targets:** At the start of turn 5, `undoTurn()` restores the start of turn 4 and `redoTurn()` restores the
  start of turn 5. After one action in turn 5, `undoTurn()` also restores the start of turn 4 and removes that current-turn action. Undo then commit a
  different action; the discarded future cannot be redone
  ([Action history and turn navigation](#action-history-and-turn-navigation)).
- **Memory restoration:** At position P, AI controller X saves plan M. Later at Q it observes a newly revealed
  outcome and saves M2. Undo to P and delegate to X again: memory is M, and neither M2 nor the stale conversation from
  Q is supplied. Save at P with its redo continuation, load, and redo to Q: applicable memory is M2
  ([Delegated AI memory](#delegated-ai-memory), [Save and load](#save-and-load)).
- **Cancellation and defects:** Request cancellation during an action. The action either commits completely or fails
  without effects; earlier committed actions remain. A broken internal reference reports an engine defect without
  publishing intermediate Campaign state. Returned inspection data cannot mutate the engine
  ([Delegation lifecycle and concurrency](#delegation-lifecycle-and-concurrency), [Committed state integrity](#committed-state-integrity)).
- **Gameplay dependencies:** A Campaign instance constructor receives only its necessary inputs and dependencies,
  none leading to the top-level Campaign instance, and returns no back-reference to that root
  ([Gameplay dependency direction](#gameplay-dependency-direction)).
