# Turn Advancement

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | TURN                                                           |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, AI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines what Advance turn does: the complete, ordered list of Turn advancement steps, which values each
step uses, and how a Campaign instance created during Advance turn takes part in later steps.

It is the canonical statement of the order in which things happen during Advance turn. A Mechanics specification owns
the formulas and effects of the rules that one step applies, e.g. how much health an Agent recovers. This document owns
when each of those rules applies relative to every other rule, as stated under [Canonical order](#canonical-order).
Each step below restates in one sentence what its rules do, so that the whole of Advance turn can be read in one place.

It does not own, e.g., that Advance turn is one atomic Player action, which
[Player queries and actions](engine-contract.md#player-queries-and-actions) in Engine Contract owns, or what Advance
turn does to the Timeline, which [Timeline entries](timeline.md#timeline-entries) in Timeline owns.

# Relationships

- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Domain Model](./domain-model.md)
- Uses [Engine Contract](./engine-contract.md)
- Used by [Agent Recovery](../mechanics/agent-recovery.md)
- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Investigations](../mechanics/investigations.md)
- Used by [Missions](../mechanics/missions.md)
- Used by [Panic and Endings](../mechanics/panic-and-endings.md)

# Glossary

Campaign and Campaign state are defined by the [Core Concepts glossary](core-concepts.md#glossary). Player action, Committed state, Turn, and Turn-start state are defined by the
[Engine Contract glossary](engine-contract.md#glossary). The game concepts named by the steps, e.g. Agent and Mission,
are defined by the [Domain Model glossary](domain-model.md#glossary).

| Term                  | Definition                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Turn advancement step | One stage of Advance turn, in which the rules of one subject are applied, e.g. paying upkeep. Advance turn applies every step once, in order. |
| Step-start value      | A value as it is when a Turn advancement step begins: after every earlier step of the same Advance turn, and before any rule of that step.    |

# Canonical order

This document is the canonical statement of which Turn advancement step each rule applied during Advance turn belongs
to, the order of the steps, and which values each step uses. The following rules are complete:

- **One step per rule:** Every rule that a specification states is applied during Advance turn belongs to exactly one
  Turn advancement step under [Turn advancement steps](#turn-advancement-steps). A rule that belongs to no step is not
  applied during Advance turn.
- **This document prevails:** When another specification contradicts this document about which step a rule belongs
  to, the order of steps, or which values a rule uses, that specification is defective and must be corrected to match
  this document. Until it is corrected, this document governs.
- **New rules:** A specification that adds a rule applied during Advance turn is complete only when this document
  places the rule in an existing step or adds a step for it.
- **Restatements:** The one-sentence description of each step restates rules that the owning Mechanics specification
  states in full. Where the two differ about what a rule computes or changes, rather than about when it applies, the
  owning Mechanics specification governs that content and the description is corrected.

# Turn advancement steps

**Proposed rule:** Advance turn applies the following Turn advancement steps, each exactly once, in this order. The
list is exhaustive.

| Order | Turn advancement step  | What its rules do                                                                                                                                             | Rules owned by                                                                                                   |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1     | Transit                | Agents In transit advance toward their destination; an Agent that arrives changes its Task phase to At assignment.                                            | [Agents](../mechanics/agents-spec.md)                                                                            |
| 2     | Agency income          | The Agency gains money from contracting and from recurring funding.                                                                                           | [Economy and Upgrades](../mechanics/economy-and-upgrades.md)                                                     |
| 3     | Upkeep                 | The Agency pays upkeep for its Agents.                                                                                                                        | [Economy and Upgrades](../mechanics/economy-and-upgrades.md)                                                     |
| 4     | Training               | Agents in training, At assignment, gain skill.                                                                                                                | [Agents](../mechanics/agents-spec.md)                                                                            |
| 5     | Investigation progress | Active Investigations progress and may complete; a completed Investigation applies its Lead's completion effects, which may unlock Leads and create Missions. | [Investigations](../mechanics/investigations.md); [Leads and Progression](../mechanics/leads-and-progression.md) |
| 6     | Mission resolution     | Each Mission whose Current team is At assignment resolves its battle and applies its consequences; surviving Agents start returning.                          | [Missions](../mechanics/missions.md); [Combat](../mechanics/combat.md)                                           |
| 7     | Mission expiration     | Missions that were not resolved age, and a Mission that expires applies the consequences of being ignored.                                                    | [Missions](../mechanics/missions.md)                                                                             |
| 8     | Faction activity       | Factions escalate and generate Faction operation occurrences, each with its Response Mission.                                                                 | [Factions](../mechanics/factions.md)                                                                             |
| 9     | Agent recovery         | Agents recover health and exhaustion.                                                                                                                         | [Agent Recovery](../mechanics/agent-recovery.md)                                                                 |
| 10    | Panic                  | Panic changes according to this turn's outcomes.                                                                                                              | [Panic and Endings](../mechanics/panic-and-endings.md)                                                           |
| 11    | Ending check           | The Campaign ends when an ending condition holds.                                                                                                             | [Panic and Endings](../mechanics/panic-and-endings.md)                                                           |
| 12    | Turn close             | Each [Turn series](campaign-state.md#turn-series) records its value for the Turn, the Reports of the Turn are retained, and the Turn ends.                    | [Economy and Upgrades](../mechanics/economy-and-upgrades.md); [Reports](domain-model.md#reports)                 |

TODO: For each step, state its exact rules once the owning Mechanics specification defines them, including which
Campaign instances the step applies to and what the step does when it has nothing to apply to, e.g. no Active
Investigation.

# Values a step uses

The following rules are complete:

- **Earlier steps are visible:** A Turn advancement step uses every value as it is after every earlier step of the
  same Advance turn has been applied. E.g., Mission resolution uses each Agent's skill after the Training step of
  the same Advance turn.
- **Step-start values within a step:** Every rule of one step uses Step-start values, unless this document states an
  exception for that step. E.g., when two Agents gain skill in Training, neither gain depends on the other, whichever
  Agent an implementation processes first.
- **Several changes to one value within a step:** When more than one rule of the same step changes the same value,
  this document states the combined result for that step, e.g. that the changes add up, or which one prevails.
- **Campaign instances created during Advance turn:** A Campaign instance created during a step takes part in a later
  step of the same Advance turn only when this document states so for that later step. E.g., a Mission that
  Investigation progress creates does not age in Mission expiration of the same Advance turn unless that step states
  so.

The order in which an implementation processes the Campaign instances within one step is the implementer's choice,
because the rules above make its result the same for every order. Only the Committed state after Advance turn is
observable, under [Committed state integrity](engine-contract.md#committed-state-integrity) in Engine Contract.

# Edge cases and failure behavior

TODO: State whether the steps after Ending check apply when the Campaign ends in that step, and which steps apply to
an Agent that is Killed in Mission resolution, e.g. whether Upkeep of the next Advance turn still counts it.

TODO: State whether Agents who return from a Mission in Mission resolution recover in Agent recovery of the same
Advance turn, and whether an Agent that arrives in Transit works in a later step of the same Advance turn.

# Acceptance examples

- **Earlier step visible:** Agency money is 100 when Advance turn begins. Agency income adds 30 and Upkeep then
  charges 50. Upkeep uses the money after Agency income, 130, so the money after Upkeep is 80, and a rule of Upkeep
  that checks whether the Agency can pay sees 130, not 100 ([Values a step uses](#values-a-step-uses)).
- **Step-start values:** Agents a1 and a2 both gain skill in Training. Each gain uses the Step-start values of
  Training, so swapping the order in which the implementation processes a1 and a2 produces the same Committed state
  ([Values a step uses](#values-a-step-uses)).
- **Created Mission:** An Investigation completes in Investigation progress and creates Mission m1. Mission expiration
  of the same Advance turn does not age m1, because no rule of this document states that it does
  ([Values a step uses](#values-a-step-uses)).
- **Contradiction:** A Mechanics specification states that Agents recover health before Mission resolution. That
  contradicts the order under [Turn advancement steps](#turn-advancement-steps), so the Mechanics specification is
  corrected; Agent recovery stays after Mission resolution ([Canonical order](#canonical-order)).

# Open decisions

- **Step order:** The order under [Turn advancement steps](#turn-advancement-steps) is proposed from the Domain Model
  concepts and the Game Design Brief, before the Mechanics specifications define their rules. Confirm or change the
  order, especially whether Agency income precedes Upkeep and whether Agent recovery follows Mission resolution.
