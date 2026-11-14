# Basic Autopilot AI

| Metadata    | Value                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | BASICAI                                                                                                                 |
| Family      | Autopilot AIs                                                                                                           |
| Status      | Draft                                                                                                                   |
| Audience    | AI designer, Implementer                                                                                                |
| Owns        | The goals the Basic Autopilot AI pursues, how it prioritizes them within a turn, and what it deliberately leaves alone. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                          |

# Overview

This document describes the Basic Autopilot AI: the Autopilot AI that a Game build offers so that a Campaign can be
played without a human making every decision. It plays a sound, cautious Campaign rather than an optimal one. It keeps
the Agency solvent, keeps enough rested Agents, deploys Agents on Missions only when they have a good chance of
succeeding, keeps Investigations going so that new Missions appear, and spends surplus money on growing and improving
the Agency.

This document owns the Basic Autopilot AI's goals and the order in which it pursues them. It describes them at the level
of intent: the exact thresholds, e.g. how large a safety margin is, are the Implementer's choice, and the informative
[Appendix: Derivation from game-ts](#appendix-derivation-from-game-ts) gives proven starting values. It does not own:

- What an Autopilot AI receives, may call, and how an Autopilot engagement ends: [Autopilot](../foundation/autopilot.md)
  and [API hierarchy](../foundation/engine-contract.md#api-hierarchy) in Engine Contract.
- The meaning of any game value it reads, e.g. exhaustion, upkeep, or transport capacity: the Mechanics specification
  that owns that value.
- Whether an action it attempts succeeds: the engine decides, and a rejected action changes nothing.

# Relationships

- Uses [Agents](../mechanics/agents-spec.md)
- Uses [Autopilot](../foundation/autopilot.md)
- Uses [Domain Model](../mechanics/domain-model.md)
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Investigations](../mechanics/investigations.md)
- Uses [Leads and Progression](../mechanics/leads-and-progression.md)
- Uses [Missions](../mechanics/missions.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)

# Glossary

Autopilot AI, Autopilot memory, Player action, and Player-visible information are defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). Agency, Agent, Current assignment,
Investigation, Lead, and Mission are defined by the [Domain Model glossary](../mechanics/domain-model.md#glossary).
Exhaustion is defined by the [Agents glossary](../mechanics/agents-spec.md#glossary).

| Term               | Definition                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Basic Autopilot AI | The Autopilot AI described by this document.                                                                                                       |
| Rested Agent       | A Serving Agent whose Current assignment is Standby or Training and whose exhaustion is low enough for the Basic Autopilot AI to give it new work. |
| Agent reserve      | The share of the roster that the Basic Autopilot AI keeps as Rested Agents rather than assigning, so that it can still react to an urgent Mission. |
| Savings floor      | The money the Basic Autopilot AI keeps unspent so that the Agency can pay several turns of upkeep even if contracting income falls short.          |

# Goals

The Basic Autopilot AI pursues the following goals. The list is exhaustive. The goals can conflict, e.g. an Agent
deployed on a Mission earns no contracting income, so [Turn routine](#turn-routine) states which goal wins.

| Goal                         | What the Basic Autopilot AI aims for                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stay solvent                 | Contracting income covers upkeep with a margin to spare, so that money does not run down. When the projected money for the coming turn is falling, restoring income takes precedence over every other use of Agents. No purchase brings money below the Savings floor.                                                                                                 |
| Keep Agents fit              | Agents whose exhaustion has grown high are recalled to rest before they are given work again. Only Rested Agents receive new work, and the Agent reserve stays untouched except for urgent income.                                                                                                                                                                     |
| Deploy only to win           | A team is deployed on a Mission only when its combined combat strength exceeds that of the Mission's Enemies by a safety margin, it has enough Agents for the number of Enemies, and transport capacity allows it. Otherwise the Basic Autopilot AI deploys nobody on that Mission rather than send a team that is likely to lose.                                     |
| Answer the most urgent first | Missions are considered in order of urgency: a Response Mission against an operation that directly threatens the Agency comes first, then Missions in order of how soon they expire.                                                                                                                                                                                   |
| Keep Missions coming         | A small share of the roster, growing with the roster, investigates Leads. Leads that advance progression, i.e. that unlock further Leads or end a Faction, come first. A Lead whose purpose is to reveal a Mission is investigated only if the Basic Autopilot AI could currently deploy on that Mission. Effort is concentrated on few Leads rather than spread thin. |
| Leave no Agent idle          | Rested Agents left over after the goals above go to Training while training capacity allows, and the rest go to contracting.                                                                                                                                                                                                                                           |
| Grow with the threat         | Surplus money above the Savings floor is spent, one purchase at a time, on keeping the roster at a target size that grows with the upgrades bought, on keeping agent, transport, and training capacity in proportion to the roster, and otherwise on upgrades that make every Agent more effective, rotating among them.                                               |

The Basic Autopilot AI does not try to maximize score, speed, or any other measure of the Campaign beyond these goals.
It does not try to predict Faction behavior, and it does not dismiss Agents.

# Turn routine

During each turn the Basic Autopilot AI makes its Player actions in the following order, and then advances the turn.
Each step sees the Current assignments the earlier steps produced, so an earlier step has first claim on Rested Agents
and money.

1. Recall assigned Agents whose exhaustion has grown high, so that they can rest (Keep Agents fit).
2. If the projected money for the coming turn is falling, assign Agents to contracting until it no longer falls. This
   step may draw on the Agent reserve and on less rested Agents (Stay solvent).
3. Deploy on Missions, most urgent first, while a winning team can be formed (Deploy only to win, Answer the most urgent
   first).
4. Assign Agents to contracting until contracting income covers upkeep with the margin (Stay solvent).
5. Bring the number of Agents investigating Leads up to its target share (Keep Missions coming).
6. Assign remaining Rested Agents to Training, then to contracting (Leave no Agent idle).
7. While money stays above the Savings floor, make the most needed purchase, then decide again (Grow with the threat).

Missions come before routine contracting because a Mission expires, while contracting income can be restored on a later
turn. Investigations come after both because they only pay off later, and Training comes last because it only improves
Agents.

When choosing among Agents for any step, the Basic Autopilot AI prefers the most rested Rested Agent, and it prefers
Agents on Standby over Agents in Training. When several choices are equally good, it breaks the tie in a fixed order
derived from Player-visible information, so that the same Player-visible information always yields the same Player
actions.

# Information and memory

The Basic Autopilot AI decides each Player action from the current Player-visible information alone, which
[What an Autopilot AI receives](../foundation/autopilot.md#what-an-autopilot-ai-receives) in Autopilot bounds. It keeps
no plan across turns and writes no Autopilot memory: every fact it needs, e.g. how many upgrades the Agency has bought,
is Player-visible. Because it does not receive its Autopilot limit, it plays every turn the same way whether Autopilot
disengages after one Player action or after many turns.

# Edge cases and failure behavior

| Case                                                                 | Behavior                                                                                                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| No Mission can be won with the Rested Agents available               | It deploys nobody that turn and keeps the Agents working toward income, Investigations, and Training.                                               |
| Money is below the Savings floor                                     | It buys nothing that turn.                                                                                                                          |
| Every Agent is exhausted or the roster is empty                      | It makes no assignment and advances the turn; buying an Agent still follows Grow with the threat.                                                   |
| A Player action it attempts is rejected                              | It does not retry the same Player action in that turn and continues with the next step, so a rejection cannot make it repeat itself until it fails. |
| Only Leads that reveal Missions it cannot currently deploy on remain | It leaves those Leads uninvestigated until the Agency is strong enough.                                                                             |

# Open decisions

- TODO: Decide whether the Basic Autopilot AI's thresholds, e.g. its safety margin and Savings floor, stay
  implementation constants or become values a Player can tune.

# Appendix: Derivation from game-ts

This appendix is informative. The Basic Autopilot AI follows the basic AI player of game-ts revision `f1835a29`, in
`web/src/ai/intellects/basic/` and `docs/ai/basic_intellect.md`. Its goals and Turn routine are kept; the following
table lists the game-ts values the Implementer can start from.

| Threshold                                         | game-ts value                             |
| ------------------------------------------------- | ----------------------------------------- |
| Exhaustion at which an assigned Agent is recalled | Above 30%                                 |
| Exhaustion at which an Agent is a Rested Agent    | At most 5%; at most 25% for urgent income |
| Agent reserve                                     | 20% of the roster                         |
| Contracting income target                         | 120% of upkeep                            |
| Savings floor                                     | Five turns of half the upkeep             |
| Combat strength safety margin                     | 120% of the Enemies' combat rating        |
| Agents needed for the number of Enemies           | One Agent per three Enemies               |
| Agents investigating Leads                        | 1, plus 1 per 10 Agents                   |
| Target roster size                                | 8, plus 4 per upgrade bought              |
| Transport and training capacity                   | 25% and 30% of the roster                 |

game-ts differs from this document in two deliberate ways. game-ts broke ties at random; the Basic Autopilot AI breaks
them in a fixed order so that its Player actions are reproducible. game-ts kept counts of its own purchases in AI state;
the Basic Autopilot AI reads them from Player-visible information instead.
