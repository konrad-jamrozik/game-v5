# Developer Access

| Metadata | Value |
| --- | --- |
| Spec ID | DEV |
| Family | Foundation |
| Audience | Engine designer, Implementer |
| Owns | Dev mode, full Campaign state inspection, Player cheat actions, and random outcome overrides. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Building and testing a game needs ways around its own rules: seeing what the player cannot, and setting up a situation by hand instead of playing toward it. Developer access gives the [Session controller](engine-contract.md#principals-and-access) these powers through [Developer API](engine-contract.md#api-surfaces), on top of the [Engine Contract](engine-contract.md).

The guiding principle is that these powers stay apart from ordinary play. They are available only while [Dev mode](engine-contract.md#principals-and-access) is enabled, a [Session](core-concepts.md#campaign-and-session) access setting that starts disabled and is disabled again whenever a [Campaign](core-concepts.md#campaign-and-session) is created, loaded, or closed. Full [Campaign state](core-concepts.md#campaign-and-session) inspection shows what [Player API](engine-contract.md#api-surfaces) hides, and a [Player cheat action](engine-contract.md#player-actions-and-turns) changes Campaign state in a way ordinary play does not allow, e.g. a random outcome override, which fixes a random outcome in advance. Player API still exposes only [Player-visible information](engine-contract.md#api-surfaces), an [Autopilot AI](engine-contract.md#principals-and-access) never reaches Developer API, and every Player cheat action is an ordinary [Player action](engine-contract.md#player-actions-and-turns) that undo and redo treat like any other.

# Dev mode

Only the [Session controller](engine-contract.md#principals-and-access) can call `session.developer.enable()` or `session.developer.disable()`. Enabling requires a [Current campaign](core-concepts.md#campaign-and-session) and no active [Autopilot engagement](engine-contract.md#autopilot). Inspection returns detached, read-only full [Campaign state](core-concepts.md#campaign-and-session). It never reveals hidden facts through [Player API](engine-contract.md#api-surfaces). Every [Player cheat action](engine-contract.md#player-actions-and-turns) belongs in `developer.actions` and follows [Player cheat actions](#player-cheat-actions).

[Dev mode](engine-contract.md#principals-and-access) starts disabled and is disabled on successful creation, load, or closure, under [Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle. Timeline navigation and [Autosave navigation](timeline.md#autosave-navigation) leave the current Dev mode setting unchanged. Dev mode is not Campaign state, so no [Campaign save](engine-contract.md#persisted-data) holds it and no [Timeline](engine-contract.md#persisted-data) navigation changes it. Disabling Dev mode revokes subsequent [Developer API](engine-contract.md#api-surfaces) access. Previously returned information cannot be erased from the Session controller's knowledge.

Autopilot may be engaged while Dev mode is enabled, but Developer API operations remain unavailable while [Autopilot](engine-contract.md#autopilot) is engaged and the [Autopilot AI](engine-contract.md#principals-and-access) never receives them. Dev mode transitions are unavailable while Autopilot is engaged. To inspect or cheat, the Session controller disengages Autopilot and waits for disengagement to complete.

# Inspection contract

Full Campaign state inspection presents each [Campaign instance](core-concepts.md#campaign-instances) as its four properties, [Instance ID](campaign-instances.md#glossary), [Archetype](core-concepts.md#campaign-instances) reference, [Constants](core-concepts.md#campaign-instances), and [State](core-concepts.md#campaign-instances), as required by [Campaign instance structure](campaign-instances.md#campaign-instance-structure). How an implementation stores Campaign instances internally is the Implementer's choice.

# Player cheat actions

A Player cheat action changes Campaign state in a way ordinary play does not allow. Each concrete Player cheat action, e.g. its inputs, validation, and effects, is specified in the Mechanics specification of the value it changes. The following rules of every Player cheat action are complete:

- **Who and when:** Only the Session controller can call a Player cheat action, only with Dev mode enabled, under [Dev mode](#dev-mode). An Autopilot AI never can.
- **Validated:** A Player cheat action rejects invalid inputs and then changes nothing, under [World state integrity](engine-contract.md#world-state-integrity) in Engine Contract.
- **Recorded:** Each successful Player cheat action is one atomic [Player action](engine-contract.md#player-actions-and-turns), recorded as one [Timeline entry](timeline.md#glossary).
- **Invariants kept:** A Player cheat action preserves every invariant that a specification states. One whose effect would leave the [Campaign](core-concepts.md#campaign-and-session) in a state that violates an invariant is rejected and changes nothing, and its error identifies the invariant; e.g., `addMoney` with an amount that would leave negative money is rejected, because money is at least 0 in every Campaign without a Campaign ending. A Player cheat action therefore never ends a Campaign.

# Random outcome overrides

Developer API must let an authorized Session controller override a random outcome: the Session controller names a random outcome and one of its possible values, and when that random outcome is next decided it takes the supplied value instead of a value derived from the [Campaign seed](determinism-and-randomness.md#glossary). E.g., the Session controller fixes the hit outcome of an [Agent](../mechanics/domain-model.md#agency-and-agents)'s next attack to "hit" and then commits Advance turn. The random outcomes that can be overridden are the named random outcomes that each Mechanics specification states for its rules. This makes every random outcome controllable by hand, without relying on a prepared acceptance test.

An override is a Player cheat action under [Player cheat actions](#player-cheat-actions): it belongs in `developer.actions`, and each successful one is one atomic Player action in the Timeline. The guarantee under [Determinism](determinism-and-randomness.md#determinism) therefore still holds, because replaying the same ordered Player actions replays the same overrides.

# Isolation and Timeline navigation

Undo and redo of a committed Player cheat action follow [Returning to a World state](timeline.md#returning-to-a-world-state): they do not require Dev mode and give an Autopilot AI no way to commit a Player cheat action.

# Edge cases and failure behavior

Invalid cheat inputs change nothing, under [World state integrity](engine-contract.md#world-state-integrity).

# TODOs

- TODO: Specify, under [Inspection contract](#inspection-contract), the complete detached, read-only Campaign state query schema through `developer.queries.getCampaignState()`. Include complete Campaign state and distinguish full-state inspection from gameplay reveal conditions. Inspection must not expose mutable [Campaign](core-concepts.md#campaign-and-session) references or change any later outcome, under [Derived value consistency](engine-contract.md#derived-value-consistency).
- TODO: Define inspection-specific terms without duplicating shared definitions, and add them to the Glossary.
- TODO: State which further Player cheat actions are needed beyond the required starter operations that Engine Contract's [API hierarchy](engine-contract.md#api-hierarchy) lists, under [Player cheat actions](#player-cheat-actions).
- TODO: Specify the override operations under [Random outcome overrides](#random-outcome-overrides): how a random outcome is identified, validation that the supplied value is one of its possible values, whether an override applies once or until cleared, what happens to an override whose random outcome is never decided, and whether a pending override is visible through inspection.
- TODO: Specify authorization failures and access revocation under [Dev mode](#dev-mode).
- TODO: Specify inspection and cheat errors with Dev mode disabled, during an Autopilot engagement, or with stale access, under [Edge cases and failure behavior](#edge-cases-and-failure-behavior).
- TODO: Choose full-state result [Types](core-concepts.md#data-modeling).
- TODO: Choose the identification, lifetime, and validation of random outcome overrides.
