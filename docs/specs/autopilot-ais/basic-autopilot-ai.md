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
the Agency solvent, lets Agents rest after a Battle before it gives them new work, deploys Agents to Mission sites only
when they have a good chance of succeeding, keeps Investigations going so that new Mission sites appear, and spends
surplus money on growing and improving the Agency.

This document owns the Basic Autopilot AI's goals and the order in which it pursues them. It describes them at the level
of intent: the exact thresholds, e.g. how large a safety margin is, are the Implementer's choice, and the informative
[Appendix: Derivation from game-ts](#appendix-derivation-from-game-ts) gives proven starting values. It does not own:

- What an Autopilot AI receives, may call, and how an Autopilot engagement ends: [Autopilot](../foundation/autopilot.md)
  and [API hierarchy](../foundation/engine-contract.md#api-hierarchy) in Engine Contract.
- The meaning of any game value it reads, e.g. exhaustion, upkeep, or the Transport cap: the Mechanics specification
  that owns that value.
- Whether an action it attempts succeeds: the engine decides, and a rejected action changes nothing.

# Relationships

- Uses [Agent Recovery](../mechanics/agent-recovery.md)
- Uses [Agents](../mechanics/agents-spec.md)
- Uses [Autopilot](../foundation/autopilot.md)
- Uses [Combat](../mechanics/combat.md)
- Uses [Domain Model](../mechanics/domain-model.md)
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Investigations](../mechanics/investigations.md)
- Uses [Leads and Progression](../mechanics/leads-and-progression.md)
- Uses [Missions](../mechanics/missions.md)
- Uses [Panic and Endings](../mechanics/panic-and-endings.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)

# Glossary

Autopilot AI, Autopilot memory, Player action, Player-visible information, and Turn are defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). Agency, Agent, Current assignment, Task phase,
Investigation, Lead, Mission site, Initiative Mission site, Response Mission site, Faction, and Enemy are defined by the
[Domain Model glossary](../mechanics/domain-model.md#glossary). Exhaustion, Standby, Contracting, Training, Recovery,
and Deployed are defined by the [Agents glossary](../mechanics/agents-spec.md#glossary), and an Agent that can be
ordered is defined under [Agents that can be ordered](../mechanics/agents-spec.md#agents-that-can-be-ordered) in Agents.
Combat rating is defined by the [Combat glossary](../mechanics/combat.md#glossary). Upgrade, Agent cap, Transport cap,
and Training cap are defined by the [Economy and Upgrades glossary](../mechanics/economy-and-upgrades.md#glossary), and
projected income and projected upkeep under
[Projected income and upkeep](../mechanics/economy-and-upgrades.md#projected-income-and-upkeep) in Economy and Upgrades.
The Mission site states Active and Expired are defined by
[Mission site lifecycle](../mechanics/missions.md#mission-site-lifecycle) in Missions, the Mission states Won and Lost by
[Mission lifecycle](../mechanics/missions.md#mission-lifecycle) in Missions, and the Investigation states
Active and Abandoned by [Investigation lifecycle](../mechanics/investigations.md#investigation-lifecycle) in
Investigations. Defeat and Money below zero are defined by the
[Panic and Endings glossary](../mechanics/panic-and-endings.md#glossary).

| Term               | Definition                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Basic Autopilot AI | The Autopilot AI described by this document.                                                                                                                                                          |
| Rested Agent       | An Agent that can be ordered, whose Current assignment is Standby or Training, and whose exhaustion is low enough for the Basic Autopilot AI to give it new work.                                     |
| Agent reserve      | The share of the roster that the Basic Autopilot AI keeps as Rested Agents rather than assigning, so that it can still react to an urgent Mission site.                                               |
| Savings floor      | The money the Basic Autopilot AI keeps unspent so that the Agency can pay several turns of upkeep even if contracting income falls short.                                                             |
| Expected income    | The projected income the Agency will have once every Agent now In transit to Contracting has arrived: its funding plus the contracting income of every Agent whose Current assignment is Contracting. |

# Goals

The Basic Autopilot AI pursues the following goals. The list is exhaustive. The goals can conflict, e.g. a Deployed
Agent earns no contracting income, so [Turn routine](#turn-routine) states which goal wins.

| Goal                         | What the Basic Autopilot AI aims for                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stay solvent                 | Expected income covers projected upkeep with a margin to spare, so that money does not run down toward a Defeat for Money below zero. When Expected income does not even cover projected upkeep, restoring income takes precedence over every other use of Agents. No purchase brings money below the Savings floor.                                                                                                                                                                                                                                       |
| Keep Agents fit              | Only a Battle raises exhaustion, and exhaustion falls only on Standby and on Recovery. An Agent whose exhaustion is too high for a Rested Agent is therefore left on Standby, or brought back to it, until it is a Rested Agent. Only Rested Agents receive new work, and the Agent reserve stays untouched, except for urgent income.                                                                                                                                                                                                                     |
| Deploy only to win           | A team is deployed to a Mission site only when its [Combat rating](../mechanics/combat.md#combat-rating) exceeds the Combat rating of the Mission site's Enemies by a safety margin, it has enough Agents for the number of Enemies, and the Transport cap allows it. Otherwise the Basic Autopilot AI deploys nobody to that Mission site rather than send a team that is likely to lose: a Mission site cannot be attempted twice, and a Lost Mission site gains nothing over an Expired one.                                                            |
| Answer the most urgent first | Mission sites are considered in order of urgency. A Response Mission site comes before an Initiative Mission site, because a Response Mission site whose Mission is not Won is penalized, while an Initiative Mission site whose Mission is not Won only has to be found again. Among Mission sites of the same kind, the one that expires soonest comes first.                                                                                                                                                                                            |
| Keep Mission sites coming    | A small share of the roster, growing with the roster, investigates Leads. Every Lead creates a Mission site when an Investigation of it completes, and progression advances only when the Mission at that Mission site is Won. A Lead is therefore investigated only if the Basic Autopilot AI could currently form a winning team for the Mission site the Lead creates. Among such Leads, one whose Won Mission site makes further Leads available or makes a Faction Defeated comes first. Effort is concentrated on few Leads rather than spread thin. |
| Leave no Agent idle          | Rested Agents on Standby that are left over after the goals above go to Training while the Training cap allows, and the rest go to Contracting, apart from those the Agent reserve keeps on Standby.                                                                                                                                                                                                                                                                                                                                                       |
| Grow with the threat         | Surplus money above the Savings floor is spent, one purchase at a time, on keeping the roster at a target size that grows with the Upgrades bought, on keeping the Agent cap, Transport cap, and Training cap in proportion to the roster, and otherwise on Upgrades that make every Agent more effective, rotating among them when there are several.                                                                                                                                                                                                     |

The Basic Autopilot AI does not try to maximize score, speed, or any other measure of the Campaign beyond these goals.
It does not try to predict Faction behavior, and it does not dismiss Agents.

# Orders and transit

Every order other than a deployment costs one Advance turn of transit before the Agent works, and an Agent In transit
cannot be ordered, under [Transit rule](../mechanics/agents-spec.md#transit-rule) in Agents. The Basic Autopilot AI
therefore plays by the following principles. The list is exhaustive.

1. **It orders only Agents that can be ordered.** It gives no order to an Agent that is In transit, on Recovery, or
   Deployed, and it waits for a hired Agent to arrive, i.e. until the next Turn.
2. **It counts an Agent In transit as already doing its destination work.** When it measures a goal, e.g. whether
   income covers upkeep or how many Agents investigate Leads, an Agent In transit to Contracting counts as contracting
   and an Agent In transit to an Investigation counts as investigating. Otherwise it would order more Agents every turn
   while the first ones are still travelling. Expected income is this principle applied to income.
3. **It does not move an Agent that is doing useful work.** It orders an Agent away from Contracting or Training only
   when a step of [Turn routine](#turn-routine) says so, because each such order costs the Agent an Advance turn in
   which it does nothing.
4. **It leaves Investigations whole.** It never orders an Agent away from an Active Investigation. Ordering the last
   member elsewhere would make the Investigation Abandoned and lose its progress, under
   [Abandonment](../mechanics/investigations.md#abandonment) in Investigations. Exhaustion is no reason to recall an
   investigating Agent either: the Agents it sends to Investigations are Rested Agents, and an Investigation raises no
   exhaustion.
5. **It deploys late without loss.** A deployment takes effect at once and the Battle is fought in the next Advance
   turn, under [Deploying Agents](../mechanics/missions.md#deploying-agents) in Missions. It can therefore deploy to a
   Mission site in the last Turn before that Mission site would expire, and it can form a team from Rested Agents that
   are on Training without first recalling them.

# Turn routine

During each turn the Basic Autopilot AI makes its Player actions in the following order, and then advances the turn.
Each step sees the Current assignments the earlier steps produced, so an earlier step has first claim on Rested Agents
and money.

1. Recall to Standby each Agent on Contracting or Training whose exhaustion is too high for a Rested Agent, so that it
   can rest. An Agent on Contracting is recalled only while Expected income still covers projected upkeep with the
   margin without it (Keep Agents fit).
2. If Expected income is below projected upkeep, order Agents to Contracting until it is not. This step may draw on the
   Agent reserve and on less rested Agents (Stay solvent).
3. Deploy to Mission sites, most urgent first, while a winning team can be formed (Deploy only to win, Answer the most
   urgent first).
4. Order Agents to Contracting until Expected income covers projected upkeep with the margin (Stay solvent).
5. Bring the number of Agents investigating Leads up to its target share, adding Agents to an Active Investigation
   before starting an Investigation of another Lead (Keep Mission sites coming).
6. Order the remaining Rested Agents on Standby to Training, then to Contracting (Leave no Agent idle).
7. While money stays above the Savings floor, make the most needed purchase, then decide again (Grow with the threat).

An Agent that returns from a Battle arrives on Standby or on Recovery and is left there until it is a Rested Agent,
under [Exhaustion recovery](../mechanics/agent-recovery.md#exhaustion-recovery) in Agent Recovery. Step 1 therefore
applies only to an Agent that was ordered to work while its exhaustion was too high for a Rested Agent: one that step 2
sent to Contracting for urgent income, or one that a human player ordered before Autopilot was engaged.

Mission sites come before routine Contracting because a Mission site expires, while contracting income can be restored
on a later turn. Investigations come after both because they only pay off later, and Training comes last because it
only improves Agents.

When choosing among Agents for any step, the Basic Autopilot AI prefers the most rested Rested Agent, and it prefers
Agents on Standby over Agents on Training. When several choices are equally good, it breaks the tie in a fixed order
derived from Player-visible information, so that the same Player-visible information always yields the same Player
actions.

# Information and memory

The Basic Autopilot AI decides each Player action from the current Player-visible information alone, which
[What an Autopilot AI receives](../foundation/autopilot.md#what-an-autopilot-ai-receives) in Autopilot bounds. It keeps
no plan across turns and writes no Autopilot memory: every fact it needs, e.g. how many Upgrades the Agency has bought
or which Agents are In transit, is Player-visible. Because it does not receive its Autopilot limit, it plays every turn
the same way whether Autopilot disengages after one Player action or after many turns.

To judge whether it could win the Mission site a Lead creates, it reads the MissionSiteArchetype the Lead
creates and the EnemyArchetypes that MissionSiteArchetype names. Both are Player-visible from campaign creation, before
any such Mission site exists, under
[Player-visible information](../mechanics/leads-and-progression.md#player-visible-information) in Leads and Progression
and [Player-visible information](../mechanics/combat.md#player-visible-information) in Combat.

# Edge cases and failure behavior

| Case                                                                                 | Behavior                                                                                                                                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No Mission site can be won with the Rested Agents available                          | It deploys nobody that turn and keeps the Agents working toward income, Investigations, and Training.                                                        |
| A Mission site is in the last Turn before it would expire                            | It deploys to it as to any other Mission site, because the Battle is fought in the next Advance turn.                                                        |
| An Investigation completes while no winning team can be formed any more              | It deploys nobody. The Mission site becomes Expired, the Lead becomes available again, and the Lead is investigated again once a winning team can be formed. |
| Money is below the Savings floor                                                     | It buys nothing that turn.                                                                                                                                   |
| Expected income is below projected upkeep and no Agent can be ordered to Contracting | It buys nothing, makes its other Player actions as usual, and advances the turn. It does not dismiss Agents to lower upkeep.                                 |
| Every Agent is exhausted or cannot be ordered, or the roster is empty                | It makes no assignment and advances the turn; buying an Agent still follows Grow with the threat.                                                            |
| A Player action it attempts is rejected                                              | It does not retry the same Player action in that turn and continues with the next step, so a rejection cannot make it repeat itself until it fails.          |
| Only Leads that create Mission sites it cannot currently win remain                  | It leaves those Leads uninvestigated until the Agency is strong enough.                                                                                      |

# Open decisions

- TODO: Decide whether the Basic Autopilot AI's thresholds, e.g. its safety margin and Savings floor, stay
  implementation constants or become values a Player can tune.

# Appendix: Derivation from game-ts

This appendix is informative. The Basic Autopilot AI follows the basic AI player of game-ts revision `f1835a29`, in
`web/src/ai/intellects/basic/` and `docs/ai/basic_intellect.md`. Its goals and Turn routine are kept as far as the
Mechanics specifications allow; the following table lists the game-ts values the Implementer can start from. game-ts
stated exhaustion in percent; the same numbers are exhaustion points here.

| Threshold                                      | game-ts value                           |
| ---------------------------------------------- | --------------------------------------- |
| Exhaustion at which an Agent is a Rested Agent | At most 5; at most 25 for urgent income |
| Agent reserve                                  | 20% of the roster                       |
| Contracting income target                      | 120% of upkeep                          |
| Savings floor                                  | Five turns of half the upkeep           |
| Combat rating safety margin                    | 120% of the Enemies' Combat rating      |
| Agents needed for the number of Enemies        | One Agent per three Enemies             |
| Agents investigating Leads                     | 1, plus 1 per 10 Agents                 |
| Target roster size                             | 8, plus 4 per Upgrade bought            |
| Transport cap and Training cap                 | 25% and 30% of the roster               |

game-ts differs from this document in the following deliberate ways. The list is exhaustive.

- game-ts broke ties at random; the Basic Autopilot AI breaks them in a fixed order so that its Player actions are
  reproducible.
- game-ts kept counts of its own purchases in AI state; the Basic Autopilot AI reads them from Player-visible
  information instead.
- In game-ts every kind of work raised exhaustion, so its AI recalled any working Agent whose exhaustion rose above
  30%. Here only a Battle raises exhaustion, so the Basic Autopilot AI recalls only the Agents it sent to work for
  urgent income, and otherwise rests Agents by leaving them on Standby.
- In game-ts an order took effect at once. Here it costs one Advance turn of transit, so the Basic Autopilot AI follows
  the principles under [Orders and transit](#orders-and-transit).
- In game-ts some Leads advanced progression directly. Here every Lead creates a Mission site, so the Basic Autopilot
  AI chooses Leads by whether it could win that Mission site.
