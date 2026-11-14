# Developer Access

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | DEV                                                                                       |
| Family      | Foundation                                                                                |
| Status      | Stub                                                                                      |
| Audience    | Engine designer, Implementer                                                              |
| Owns        | Dev mode, full Campaign state inspection, cheat operations, and random outcome overrides. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                            |

# Overview

This document defines the Developer access engine subsystem: Dev mode, full Campaign state inspection through
`developer.queries`, cheat operations through `developer.actions`, and random outcome overrides. It gives the Session
controller a way to inspect and change a Campaign beyond what ordinary play allows, without changing what Player API
exposes or what an Autopilot AI receives.

It does not own, e.g., which Principal may reach Developer API, which the access matrix under
[API hierarchy](engine-contract.md#api-hierarchy) in Engine Contract owns, or how a committed cheat is undone, which
[Timeline](timeline.md) owns.

# Relationships

- Uses [Campaign Lifecycle](./campaign-lifecycle.md)
- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Determinism and Randomness](./determinism-and-randomness.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Timeline](./timeline.md)
- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)

# Glossary

Developer API, Dev mode, Session controller, Autopilot AI, and Player action are defined by the
[Engine Contract glossary](engine-contract.md#glossary).

TODO: Define inspection-specific terms without duplicating shared definitions.

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
[Campaign instance structure](campaign-state.md#campaign-instance-structure). How an
implementation stores Campaign instances internally is the implementer's choice.

TODO: Specify the complete detached, read-only Campaign state query schema through `developer.queries.getCampaignState()`.
Include complete Campaign state and distinguish full-state inspection from gameplay reveal conditions. Inspection
must not expose mutable Campaign references or change any later outcome, under
[Derived value consistency](engine-contract.md#derived-value-consistency).

# Cheat operations

A cheat operation changes Campaign state in a way ordinary play does not allow. This document states the rules every
cheat operation follows; the Mechanics specification that owns the changed value owns each concrete cheat operation,
e.g. its inputs, validation, and effects. The following rules are complete:

- **Who and when:** Only the Session controller can call a cheat operation, only with Dev mode enabled, under
  [Dev mode](#dev-mode). An Autopilot AI never can.
- **Validated:** A cheat operation rejects invalid inputs and then changes nothing, under
  [Committed state integrity](engine-contract.md#committed-state-integrity) in Engine Contract.
- **Recorded:** Each successful cheat operation is one atomic Player action, recorded as one Timeline entry.
- **Invariants kept:** A cheat operation preserves every invariant that a specification states.

TODO: State which further cheat operations are needed beyond the required starter operations that Engine Contract's
[API hierarchy](engine-contract.md#api-hierarchy) lists.

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

TODO: Specify the override operations: how a random outcome is identified, validation that the supplied value is one
of its possible values, whether an override applies once or until cleared, what happens to an override whose random
outcome is never decided, and whether a pending override is visible through inspection.

# Isolation and Timeline navigation

TODO: Specify authorization failures and access revocation under [Dev mode](#dev-mode). Undo and redo of a committed cheat action follow
[Restored Committed states](timeline.md#restored-committed-states): they do not require Dev mode and give an Autopilot AI no
way to commit a cheat action.

# Edge cases and failure behavior

TODO: Specify inspection and cheat errors with Dev mode disabled, during an Autopilot engagement, or with stale access.
Invalid cheat inputs change nothing, under
[Committed state integrity](engine-contract.md#committed-state-integrity).

# Acceptance examples

TODO: Provide scenarios proving separate Developer API access, unchanged Player API visibility, Autopilot AI exclusion,
and cheat-command undo/redo and save/load round trips. Identify the requirement sections each scenario verifies.

- **Developer isolation:** Enable Dev mode and inspect hidden difficulty H through Developer API. Player API still
  hides H. Engage Autopilot; its queries and errors hide H and its developer calls fail. Disable Dev mode after
  disengagement and verify Developer API access is revoked ([Dev mode](#dev-mode),
  [API hierarchy](engine-contract.md#api-hierarchy),
  [Information boundary](engine-contract.md#information-boundary)).

# Open decisions

- TODO: Choose full-state result Types.
- TODO: Choose the identification, lifetime, and validation of random outcome overrides.
