# Developer Access

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | DEV                                                                                       |
| Family      | Foundation                                                                                |
| Audience    | Engine designer, Implementer                                                              |
| Owns        | Dev mode, full Campaign state inspection, cheat operations, and random outcome overrides. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                            |

# Overview

Building and testing a game needs ways around its own rules: seeing what the player cannot, and setting up a situation
by hand instead of playing toward it. Developer access gives the Session controller these powers through Developer API,
on top of the [Engine Contract](engine-contract.md).

The guiding principle is that these powers stay apart from ordinary play. They are available only while Dev mode is
enabled, a Session access setting that starts disabled and is disabled again whenever a Campaign is created, loaded, or
closed. Full Campaign state inspection shows what Player API hides, and a cheat operation changes Campaign state in a
way ordinary play does not allow, e.g. a random outcome override, which fixes a random outcome in advance. Player API
still exposes only Player-visible information, an Autopilot AI never reaches Developer API, and every cheat operation
is an ordinary Player action that undo and redo treat like any other.

# Relationships

- Uses [Campaign Instances](./campaign-instances.md)
- Uses [Campaign Lifecycle](./campaign-lifecycle.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Determinism and Randomness](./determinism-and-randomness.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Timeline](./timeline.md)
- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)

# Dev mode

Only the Session controller can call `session.developer.enable()` or `session.developer.disable()`. Enabling requires
a Current campaign and no active Autopilot engagement. Inspection returns detached, read-only full
Campaign state. It never reveals hidden facts through ordinary game behavior.
Every cheat operation belongs in `developer.actions` and follows [Cheat operations](#cheat-operations).

Dev mode starts disabled and is disabled on successful creation, load, or closure, under
[Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle. Timeline
navigation and [Autosave navigation](timeline.md#autosave-navigation) leave the current Dev mode setting
unchanged. Dev mode is not Campaign state and is never restored from a Campaign save or the Timeline. Disabling Dev
mode revokes subsequent Developer API access. Previously returned information cannot be erased from the Session
controller's knowledge.

Autopilot may be engaged while Dev mode is enabled, but Developer API operations remain unavailable while Autopilot
is engaged and the Autopilot AI never receives them. Dev mode transitions are unavailable while Autopilot is engaged.
To inspect or cheat, the Session controller disengages Autopilot and waits for disengagement to complete.

# Inspection contract

Full Campaign state inspection presents each Campaign instance as its four properties, Instance ID, Archetype
reference, Constants, and State, as required by
[Campaign instance structure](campaign-instances.md#campaign-instance-structure). How an
implementation stores Campaign instances internally is the Implementer's choice.

# Cheat operations

A cheat operation changes Campaign state in a way ordinary play does not allow. Each concrete cheat operation, e.g. its
inputs, validation, and effects, is specified in the Mechanics specification of the value it changes. The following
rules of every cheat operation are complete:

- **Who and when:** Only the Session controller can call a cheat operation, only with Dev mode enabled, under
  [Dev mode](#dev-mode). An Autopilot AI never can.
- **Validated:** A cheat operation rejects invalid inputs and then changes nothing, under
  [Committed state integrity](engine-contract.md#committed-state-integrity) in Engine Contract.
- **Recorded:** Each successful cheat operation is one atomic Player action, recorded as one Timeline entry.
- **Invariants kept:** A cheat operation preserves every invariant that a specification states.

# Random outcome overrides

Developer API must let an authorized Session controller override a random outcome: the Session controller names a
random outcome and one of its possible values, and when that random outcome is next decided it takes the supplied
value instead of a value derived from the Campaign seed. E.g., the Session controller fixes the hit outcome of an
Agent's next attack to "hit" and then commits Advance turn. The random outcomes that can be overridden are the named
random outcomes that each Mechanics specification states for its rules. This makes every random outcome controllable
by hand, without relying on a prepared acceptance test.

An override is a cheat operation under [Cheat operations](#cheat-operations): it belongs in
`developer.actions`, and each successful one is one atomic Player action in the Timeline. The guarantee under
[Determinism](determinism-and-randomness.md#determinism) therefore still holds, because replaying the same ordered
Player actions replays the same overrides.

# Isolation and Timeline navigation

Undo and redo of a committed cheat action follow
[Restored Committed states](timeline.md#restored-committed-states): they do not require Dev mode and give an Autopilot AI
no way to commit a cheat action.

# Edge cases and failure behavior

Invalid cheat inputs change nothing, under
[Committed state integrity](engine-contract.md#committed-state-integrity).

# Acceptance examples

- **Developer isolation:** Enable Dev mode and inspect hidden difficulty H through Developer API. Player API still
  hides H. Engage Autopilot; its queries and errors hide H and its developer calls fail. Disable Dev mode after
  disengagement and verify Developer API access is revoked ([Dev mode](#dev-mode),
  [API hierarchy](engine-contract.md#api-hierarchy),
  [Information boundary](engine-contract.md#information-boundary)).

# TODOs

- TODO: Specify, under [Inspection contract](#inspection-contract), the complete detached, read-only Campaign state query
  schema through `developer.queries.getCampaignState()`. Include complete Campaign state and distinguish full-state
  inspection from gameplay reveal conditions. Inspection must not expose mutable Campaign references or change any later
  outcome, under [Derived value consistency](engine-contract.md#derived-value-consistency).
- TODO: Define inspection-specific terms without duplicating shared definitions, and add them to the Glossary.
- TODO: State which further cheat operations are needed beyond the required starter operations that Engine Contract's
  [API hierarchy](engine-contract.md#api-hierarchy) lists, under [Cheat operations](#cheat-operations).
- TODO: Specify the override operations under [Random outcome overrides](#random-outcome-overrides): how a random
  outcome is identified, validation that the supplied value is one of its possible values, whether an override applies
  once or until cleared, what happens to an override whose random outcome is never decided, and whether a pending
  override is visible through inspection.
- TODO: Specify authorization failures and access revocation under [Dev mode](#dev-mode).
- TODO: Specify inspection and cheat errors with Dev mode disabled, during an Autopilot engagement, or with stale access,
  under [Edge cases and failure behavior](#edge-cases-and-failure-behavior).
- TODO: Provide scenarios proving separate Developer API access, unchanged Player API visibility, Autopilot AI
  exclusion, and cheat-command undo/redo and save/load round trips, under
  [Acceptance examples](#acceptance-examples). Identify the requirement sections each scenario verifies.
- TODO: Choose full-state result Types.
- TODO: Choose the identification, lifetime, and validation of random outcome overrides.
