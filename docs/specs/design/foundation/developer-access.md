# Developer Access

| Metadata | Value |
| --- | --- |
| Spec ID | DEV |
| Family | Foundation |
| Audience | Engine designer, Implementer |
| Owns | Dev mode, full Campaign state inspection, Player cheat actions, random outcome overrides, the rules every Developer tool follows, and Reveal hidden content. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Building and testing a game needs ways around its own rules: seeing what the player cannot, and setting up a situation by hand instead of playing toward it. Developer access gives the [Session controller](engine-contract.md#principals-and-access) these powers through [Developer API](engine-contract.md#api-surfaces), on top of the [Engine Contract](engine-contract.md).

The guiding principle is that these powers stay apart from ordinary play. They are available only while [Dev mode](engine-contract.md#principals-and-access) is enabled, a [Session](core-concepts.md#campaign-and-session) access setting that starts disabled and is disabled again whenever a [Campaign](core-concepts.md#campaign-and-session) is created, loaded, or closed. Full [Campaign state](core-concepts.md#campaign-and-session) inspection shows what [Player API](engine-contract.md#api-surfaces) hides, and a [Player cheat action](engine-contract.md#player-actions-and-turns) changes Campaign state in a way ordinary play does not allow, e.g. a random outcome override, which fixes a random outcome in advance. A [Developer tool](engine-contract.md#api-surfaces) runs part of the game's rules on inputs of the Session controller's choosing and changes nothing, and Reveal hidden content lets a user interface present everything that waits to be revealed, without changing anything either. Player API still exposes only [Player-visible information](engine-contract.md#api-surfaces), an [Autopilot AI](engine-contract.md#principals-and-access) never reaches Developer API, and every Player cheat action is an ordinary [Player action](engine-contract.md#player-actions-and-turns) that undo and redo treat like any other.

# Dev mode

[Dev mode](engine-contract.md#principals-and-access) is the switch that keeps [Developer API](engine-contract.md#api-surfaces) apart from ordinary play: the [Session controller](engine-contract.md#principals-and-access) enables it with `session.developer.enable()` and disables it with `session.developer.disable()`.

Enabling requires a [Current campaign](core-concepts.md#campaign-and-session). Autopilot may be engaged while Dev mode is enabled, although neither operation nor any Developer API operation is [available during an Autopilot engagement](autopilot.md#autopilot-lifecycle-and-concurrency). Timeline navigation and [Autosave navigation](timeline.md#autosave-navigation) leave the Dev mode setting unchanged, unlike a change of the [Campaign selection](campaign-lifecycle.md#campaign-selection). Disabling Dev mode revokes subsequent Developer API access; information already returned cannot be erased from the Session controller's knowledge.

# Inspection contract

Full [Campaign state](core-concepts.md#campaign-and-session) inspection shows the Session controller what [Player API](engine-contract.md#api-surfaces) hides. `developer.queries.getCampaignState()` returns the full [Campaign state](core-concepts.md#campaign-and-session), read-only, and presents each [Campaign instance](core-concepts.md#campaign-instances) as its [four properties](campaign-instances.md#campaign-instance-structure): [Instance ID](campaign-instances.md#glossary), [Archetype](core-concepts.md#campaign-instances) reference, [Constants](core-concepts.md#campaign-instances), and [State](core-concepts.md#campaign-instances).

# Player cheat actions

A [Player cheat action](engine-contract.md#player-actions-and-turns) changes Campaign state in a way ordinary play does not allow, e.g. to set up a situation by hand instead of playing toward it. Each concrete Player cheat action, e.g. its inputs, validation, and effects, is specified in the Mechanics specification of the value it changes.

- **Recorded:** Each successful Player cheat action is one atomic [Player action](engine-contract.md#player-actions-and-turns), recorded as one [Timeline entry](timeline.md#glossary).
- **Invariants kept:** A Player cheat action preserves every invariant that a specification states. One whose effect would leave the [Campaign](core-concepts.md#campaign-and-session) in a state that violates an invariant is rejected and changes nothing, and its error identifies the invariant; e.g., `addMoney` with an amount that would leave negative money is rejected, because money is at least 0 in every Campaign without a Campaign ending. A Player cheat action therefore never ends a Campaign.

# Random outcome overrides

A random outcome override fixes a random outcome in advance. This makes every random outcome controllable by hand, without relying on a prepared acceptance test.

Developer API must let an authorized Session controller override a random outcome: the Session controller names a random outcome and one of its possible values, and when that random outcome is next decided it takes the supplied value instead of a value derived from the [Campaign seed](determinism-and-randomness.md#glossary). E.g., the Session controller fixes the hit outcome of an [Agent](../mechanics/domain-model.md#agency-and-agents)'s next attack to "hit" and then commits Advance turn. The random outcomes that can be overridden are the named random outcomes that each Mechanics specification states for its rules.

An override is a [Player cheat action](#player-cheat-actions), so the guarantee of [Determinism](determinism-and-randomness.md#determinism) still holds: replaying the same ordered Player actions replays the same overrides.

# Developer tools

A tool that studies the game, e.g. one that balances GDR values, is only as good as its agreement with play: a result computed by different code than the Campaign runs says nothing about the Campaign. A [Developer tool](engine-contract.md#api-surfaces) therefore runs a part of the [Game rules](core-concepts.md#game-build-and-content) itself on inputs its caller supplies.

- **Same rules as play:** It runs the part of the Game rules it names by the very procedure that play uses for that part, never by a copy or an approximation of it. Given the inputs that play gave that part, including the values of its random outcomes, it produces what play produced.
- **Changes nothing:** It is not a [Player action](engine-contract.md#player-actions-and-turns) and changes no [Campaign state](core-concepts.md#campaign-and-session). It draws no random outcome of the Current campaign; the random outcomes it needs derive from a seed its caller supplies.
- **Validated:** It rejects inputs that the part of the Game rules it runs does not accept, and then runs nothing.
- **Reads the Current campaign only when asked:** It may read [Game build](core-concepts.md#game-build-and-content) values and Campaign instances of the [Current campaign](core-concepts.md#campaign-and-session) as inputs, when its caller names them, and reads nothing else of it.

The Mechanics specification owning each part of the Game rules states each Developer tool that runs it: its inputs, its rejections, and its result.

# Revealed presentation

Checking game data in play needs seeing all of it at once, e.g. reading every Compendium article or every Lead without playing until each is revealed. A user interface therefore offers Reveal hidden content, a setting of the Session controller under which it presents the Current campaign as though every reveal condition held.

A reveal condition is the condition under which the specification that owns a value makes it [Player-visible information](player-api.md#player-visible-information), e.g. that a Lead is discovered. While Reveal hidden content is on, the user interface shows every value that only an unmet reveal condition hides, in the place and manner in which it shows that value once revealed, e.g. an undiscovered Lead in the list of Leads, or every Compendium article. A value that its owning specification never makes Player-visible, e.g. the `can_exist_when` of a MissionSiteArchetype, stays hidden.

- **Dev mode only:** It can be turned on only while Dev mode is enabled, and it is turned off whenever Dev mode is disabled. While [Autopilot](engine-contract.md#autopilot) is engaged, the user interface presents only [Player-visible information](engine-contract.md#api-surfaces), because Developer API is unavailable, and it presents revealed values again once Autopilot is disengaged.
- **Read through Developer API:** The user interface reads every revealed value through `developer.queries`, never through Player API. The Mechanics specification owning a revealed value states the query that reports it when `getCampaignState()` alone does not.
- **Presentation only:** It changes no Campaign state and is not a Player action. Every Player action is validated as without it, so a control that would act on something only Reveal hidden content shows, e.g. investigating an undiscovered Lead, is disabled.
- **Session setting:** It belongs to the [Session](core-concepts.md#campaign-and-session), not to Campaign state, and starts off. Timeline navigation and [Autosave](saves.md#autosave-kinds) navigation leave it unchanged; the user interface then presents the [World state](engine-contract.md#player-actions-and-turns) they restore under the same setting.

# TODOs

- TODO: Define the terms of the [Inspection contract](#inspection-contract) without duplicating shared definitions, and add them to the Glossary.
- TODO: State which further [Player cheat actions](#player-cheat-actions) are needed beyond the operations that Engine Contract's [API hierarchy](engine-contract.md#api-hierarchy) lists.
- TODO: Specify the override operations of [Random outcome overrides](#random-outcome-overrides): how a random outcome is identified, validation that the supplied value is one of its possible values, whether an override applies once or until cleared, what happens to an override whose random outcome is never decided, and whether a pending override is visible through inspection.
