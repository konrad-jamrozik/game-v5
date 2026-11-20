# Basic Autopilot AI

| Metadata | Value |
| --- | --- |
| Spec ID | BASICAI |
| Family | Autopilot AIs |
| Audience | AI designer, Implementer |
| Owns | The goals the Basic Autopilot AI pursues, how it prioritizes them within a Turn, and what it deliberately leaves alone. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Basic Autopilot AI is the [Autopilot AI](../foundation/engine-contract.md#principals-and-access) that a [Game build](../foundation/core-concepts.md#game-build-and-content) offers so that a [Campaign](../foundation/core-concepts.md#campaign-and-session) can be played without a human making every decision. It plays a sound, cautious Campaign rather than an optimal one: it never sends a team that is likely to lose, and it does not try to win quickly.

Its play follows from a few goals that can pull against each other, e.g. keeping the [Agency](../mechanics/domain-model.md#agency-and-agents) solvent, deploying Agents only where they are likely to win, and keeping Investigations going so that new [Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) appear. A fixed [Turn routine](#turn-routine) settles the conflicts: each [Turn](../foundation/engine-contract.md#player-actions-and-turns), the Basic Autopilot AI makes its [Player actions](../foundation/engine-contract.md#player-actions-and-turns) in a fixed order of priority and then ends the Turn. It decides each Player action from the current [Player-visible information](../foundation/engine-contract.md#api-surfaces) alone and keeps no plan across Turns, within what [Autopilot](../foundation/autopilot.md) lets any Autopilot AI receive.

# Glossary

These terms are specific to the Basic Autopilot AI. General terms are in the [Domain Model glossary](../mechanics/domain-model.md#glossary) and the [Engine Contract glossary](../foundation/engine-contract.md#glossary).

| Term | Definition |
| --- | --- |
| Basic Autopilot AI | The [Autopilot AI](../foundation/engine-contract.md#principals-and-access) described by this document. |
| Rested Agent | An [Agent](../mechanics/domain-model.md#agency-and-agents) that can be assigned, whose [Assignment](../mechanics/domain-model.md#agency-and-agents) is [Standby](../mechanics/agents-spec.md#assignments) or [Training](../mechanics/agents-spec.md#assignments), whose [current health](../mechanics/agents-spec.md#combatant-attributes) equals its [effective max health](../mechanics/agents-spec.md#combatant-attributes), whose [exhaustion](../mechanics/agents-spec.md#combatant-attributes) is at most `exhaustion_free_points` of [AgentParameters](../mechanics/agents-spec.md#agentparameters), so that exhaustion does not yet lower its [effective skill](../mechanics/agents-spec.md#combatant-attributes), and that is [Fit for work](../mechanics/agents-spec.md#assignments). |
| Fresh Agent | A Rested Agent whose exhaustion is 0. |
| Recall threshold | The [exhaustion](../mechanics/agents-spec.md#combatant-attributes) above which the Basic Autopilot AI brings an Agent on [Contracting](../mechanics/agents-spec.md#assignments) back to [Standby](../mechanics/agents-spec.md#assignments) to rest. |
| Agent reserve | The Rested Agents that the Basic Autopilot AI keeps on Standby or Training rather than giving them Contracting or an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), so that it can form a team for any [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). The size the Basic Autopilot AI aims to keep it at is a share of the roster. |
| Expected reserve | The size the Agent reserve will have once every Agent now resting has rested: the number of Rested Agents, plus every other Agent whose Assignment is Standby or [Recovery](../mechanics/agents-spec.md#assignments), whether it is [In transit](../mechanics/agents-spec.md#agent-statuses) or not. |
| Savings floor | The money the Basic Autopilot AI keeps unspent so that the [Agency](../mechanics/domain-model.md#agency-and-agents) can pay several [Turns](../foundation/engine-contract.md#player-actions-and-turns) of upkeep even if contracting income falls short. |
| Expected income | The projected income the Agency will have once every Agent now [In transit](../mechanics/agents-spec.md#agent-statuses) to [Contracting](../mechanics/agents-spec.md#assignments) has arrived: its funding plus the contributions of every Agent whose Assignment is Contracting, each from its current [effective skill](../mechanics/agents-spec.md#combatant-attributes) and rounded down once in total, as [Agency income](../mechanics/economy-and-upgrades.md#agency-income) computes them. |

# Goals

The Basic Autopilot AI pursues the following goals. The list is exhaustive. The goals can conflict, e.g. a [Deployed](../mechanics/agents-spec.md#assignments) Agent earns no contracting income, so [Turn routine](#turn-routine) states which goal wins. The exact thresholds of the goals, e.g. how large a safety margin is, are the Implementer's choice; the informative [Appendix: Derivation from game-ts](#appendix-derivation-from-game-ts) gives proven starting values.

| Goal | What the Basic Autopilot AI aims for |
| --- | --- |
| Stay solvent | Expected income covers projected upkeep with a margin to spare, so that money does not run down toward a [Defeat](../mechanics/panic-and-endings.md#defeat) for Money below zero. When Expected income does not even cover projected upkeep, restoring income takes precedence over every other use of Agents. No purchase brings money below the Savings floor. |
| Keep Agents fit | Every kind of work, every [Combat](../mechanics/domain-model.md#combat), and every [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) raise exhaustion, and exhaustion falls only on Standby and on [Recovery](../mechanics/agents-spec.md#assignments). An Agent on Training is brought back to Standby before one more Advance turn of Training would raise its exhaustion above `exhaustion_free_points`, so that Training never makes it stop being a Rested Agent. An Agent on Contracting is brought back to Standby once its exhaustion passes the Recall threshold, before it starts to weaken and well before the engine's [Forced return](../mechanics/agents-spec.md#forced-return). An Agent resting on Standby rests until it is a Fresh Agent, so that no exhaustion is left: only Fresh Agents receive a [Work Assignment](../mechanics/agents-spec.md#assignments), and only a deployment to a Mission site and Contracting for urgent income may take an Agent that has not yet finished resting. |
| Keep a reserve | The Expected reserve stays at its target size. Contracting and Investigations take only Fresh Agents beyond the Agent reserve, and when the Expected reserve falls short, Agents are recalled from Contracting to rest, each only while Expected income still covers projected upkeep with the margin without it. An Agent that is resting already counts toward the Expected reserve, so the Basic Autopilot AI waits for resting Agents rather than recall more, e.g. with a target of 10, 4 Rested Agents and 6 Agents resting on Standby, it recalls nobody. A deployment to any Mission site may draw on the Agent reserve, and so may Contracting when Expected income does not cover projected upkeep. |
| Deploy only to win | A team is deployed to a Mission site only when its [Combat rating](../mechanics/combat.md#combat-rating) exceeds the [Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat) of the Mission site's Enemies by a safety margin, it has enough Agents for the number of Enemies, and the [Transport cap](../mechanics/economy-and-upgrades.md#glossary) allows it. Otherwise the Basic Autopilot AI deploys nobody to that Mission site rather than send a team that is likely to lose: a Mission site cannot be attempted twice, and a Lost Mission site gains nothing over an Expired one. |
| Answer the most urgent first | Mission sites are considered in order of urgency. A [Response Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) comes before an [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), because a Response Mission site whose [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is not Won is penalized, while an Initiative Mission site whose Mission is not Won only has to be found again. Among Mission sites of the same kind, the one that expires soonest comes first. |
| Keep Mission sites coming | A small share of the roster, growing with the roster, investigates [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). A Lead that creates no Mission site advances progression by its completion alone, so it is always worth investigating. A Lead that creates a Mission site advances progression only when the Mission at that Mission site is Won, so it is investigated only if the Basic Autopilot AI could currently form a winning team for that Mission site, and, once a Mission from it is Won, only when no other Lead qualifies. Among the Leads worth investigating, one whose completion wins the [Campaign](../foundation/core-concepts.md#campaign-and-session) comes first, then one whose completion makes a [Faction](../mechanics/domain-model.md#factions) [Eliminated](../mechanics/factions.md#glossary), then the one furthest along its Faction's chain, i.e. the one with the highest [Initiative operation level](../mechanics/leads-and-progression.md#initiative-operation-level), under [Information](#information); a Lead of no Faction has no chain, and a Lead with no [Initiative operation level](../mechanics/leads-and-progression.md#glossary) comes after every Lead with one. Effort is concentrated on few Leads rather than spread thin. |
| Leave no Agent idle | Fresh Agents on Standby that are left over after the goals above go to Training while the [Training cap](../mechanics/economy-and-upgrades.md#glossary) allows, whether or not the Agent reserve needs them, and the rest go to Contracting, apart from those the Agent reserve keeps on Standby. |
| Grow with the threat | Surplus money above the Savings floor is spent, one purchase at a time, on keeping the roster at a target size that grows with the [Upgrades](../mechanics/economy-and-upgrades.md#glossary) other than [Cap Upgrades](../mechanics/economy-and-upgrades.md#glossary) bought, on keeping the [Agent cap](../mechanics/economy-and-upgrades.md#glossary), Transport cap, and Training cap in proportion to the roster, and otherwise on [Upgrades](../mechanics/domain-model.md#agency-and-agents) that make every Agent more effective, rotating among them when there are several. |

The Basic Autopilot AI does not try to maximize score, speed, or any other measure of the [Campaign](../foundation/core-concepts.md#campaign-and-session) beyond these goals. It does not try to predict Faction behavior, and it does not dismiss Agents.

# Assignments and transit

Every assignment to or from Contracting and Investigations costs one Advance turn of transit before the Agent works, while moving between Standby and Training and deploying cost none; only an Agent on Standby or Training can be deployed or given Contracting or an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), an Agent on Contracting or an Investigation can only be recalled to Standby, and an Agent [In transit](../mechanics/domain-model.md#agency-and-agents) cannot be assigned, under [Transit rule](../mechanics/agents-spec.md#transit-rule) in Agents. The Basic Autopilot AI therefore plays by the following principles. The list is exhaustive.

1. **It assigns only Agents that can be assigned.** It gives no Assignment to an Agent that is In transit, on Recovery, or [Deployed](../mechanics/agents-spec.md#assignments), and it waits for a hired Agent to arrive, i.e. until the next Turn.
2. **It counts an Agent In transit as already doing its destination work.** When it measures a goal, e.g. whether income covers upkeep or how many Agents investigate Leads, an Agent In transit to Contracting counts as contracting and an Agent In transit to an Investigation counts as investigating. Otherwise it would assign more Agents every Turn while the first ones are still travelling. Expected income is this principle applied to income.
3. **It does not move an Agent that is doing useful work.** It assigns an Agent away from Contracting or Training only when a step of [Turn routine](#turn-routine) says so, because leaving Contracting costs the Agent an Advance turn in which it does nothing, and leaving Training ends its growth.
4. **It leaves Investigations whole.** It never assigns an Agent away from an Active Investigation. Assigning the last member elsewhere would make the Investigation Abandoned and lose its progress, under [Abandonment](../mechanics/investigations.md#abandonment) in Investigations. Exhaustion is no reason to recall an investigating Agent either: the Agents it sends to Investigations are Fresh Agents, and an Investigation raises their exhaustion by only 1 per Advance turn, so a Fresh Agent works for about 70 Advance turns before its [Forced return](../mechanics/agents-spec.md#assignments), longer than any Bootstrap Lead needs.
5. **It deploys late without loss.** A deployment takes effect at once and the Combat is fought in the next Advance turn, under [Deploying Agents](../mechanics/missions.md#deploying-agents) in Missions. It can therefore deploy to a Mission site in the last Turn before that Mission site would expire, and it can form a team from Rested Agents that are on Training without first recalling them.

# Turn routine

During each Turn the Basic Autopilot AI makes its [Player actions](../foundation/engine-contract.md#player-actions-and-turns) in the following order, and then ends the Turn by requesting Advance turn, under [Autopilot limits](../foundation/autopilot.md#autopilot-limits) in [Autopilot](../foundation/engine-contract.md#autopilot). When no step has a Player action left to make, e.g. when Autopilot is engaged again in a Turn it has already played through, its first request is Advance turn. Each step sees the Assignments the earlier steps produced, so an earlier step has first claim on Rested Agents and money.

1. Recall to Standby each Agent on Training whose exhaustion plus `exhaustion_per_training_turn` of AgentParameters is above `exhaustion_free_points`, and each Agent on Contracting whose exhaustion is above the Recall threshold, so that it can rest. An Agent on Contracting is recalled only while Expected income still covers projected upkeep with the margin without it (Keep Agents fit).
2. If Expected income is below projected upkeep, assign Agents to Contracting until it is not. This step may draw on the Agent reserve and on every Agent on Standby or Training that is Fit for work, even one that has not finished resting (Stay solvent).
3. Deploy to Mission sites, most urgent first, while a winning team of Rested Agents can be formed. This step may draw on the Agent reserve (Deploy only to win, Answer the most urgent first).
4. If the Expected reserve is below its target size, recall Agents from Contracting to Standby, least exhausted first, until it is not, each only while Expected income still covers projected upkeep with the margin without it (Keep a reserve).
5. Assign Fresh Agents beyond the Agent reserve to Contracting until Expected income covers projected upkeep with the margin (Stay solvent, Keep a reserve).
6. Bring the number of Agents investigating Leads up to its target share with Fresh Agents beyond the Agent reserve, adding Agents to an Active Investigation before starting an Investigation of another Lead (Keep Mission sites coming, Keep a reserve).
7. Assign the remaining Fresh Agents on Standby to Training, then those beyond the Agent reserve to Contracting (Leave no Agent idle).
8. While money stays above the Savings floor, make the most needed purchase, then decide again (Grow with the threat).

An Agent that returns from a Combat arrives on Standby or on Recovery and is left there until it is a Fresh Agent, under [Exhaustion recovery](../mechanics/agent-recovery.md#exhaustion-recovery) in Agent Recovery, unless step 2 or step 3 takes it earlier. Step 1 applies to every Agent whose work on Contracting or Training has raised its exhaustion to its limit, and so rotates working Agents through Standby. An Agent kept on Contracting by the solvency condition of step 1 or step 4 keeps working until it is recalled or has its Forced return, under [Forced return](../mechanics/agents-spec.md#forced-return) in Agents. An Agent recalled by step 1 or step 4 counts toward the Expected reserve from the moment it is recalled, so step 4 recalls no more Agents than the shortfall.

Mission sites come before routine Contracting because a Mission site expires, while contracting income can be restored on a later Turn. Refilling the Agent reserve comes before routine Contracting so that the next Mission site finds a team. Investigations come after both because they only pay off later, and Training comes last because it only improves Agents.

When choosing among Agents for any step, the Basic Autopilot AI prefers the most rested Agent, and it prefers Agents on Standby over Agents on Training. When several choices are equally good, it breaks the tie in a fixed order derived from [Player-visible information](../foundation/engine-contract.md#api-surfaces), so that the same Player-visible information always yields the same Player actions.

# Information

The Basic Autopilot AI decides each Player action from the current Player-visible information alone, which [What an Autopilot AI receives](../foundation/autopilot.md#what-an-autopilot-ai-receives) in [Autopilot](../foundation/engine-contract.md#autopilot) bounds. It keeps no plan across Turns: every fact it needs, e.g. how many Upgrades the Agency has bought or which Agents are In transit, is Player-visible. Because it does not receive its [Autopilot limit](../foundation/autopilot.md#glossary), it plays every Turn the same way whether Autopilot disengages after one Player action or after many Turns.

To judge whether it could win the Mission site a Lead creates, it reads the MissionSiteArchetype the Lead creates and the EnemyArchetypes that MissionSiteArchetype names. Both are Player-visible from the Lead's discovery, before any such Mission site exists, under [Player-visible information](../mechanics/leads-and-progression.md#player-visible-information) in Leads and Progression and [Player-visible information](../mechanics/combat.md#player-visible-information) in Combat.

What discovers a Lead is not Player-visible, so it does not trace a Faction's chain itself. It reads how far along the chain a discovered Lead is as the Lead's Initiative operation level, which the engine derives and makes Player-visible under [Player-visible information](../mechanics/leads-and-progression.md#player-visible-information) in Leads and Progression. E.g., with the Bootstrap GDRs, `locate_red_dawn_outpost` has level 3 and `interrogate_red_dawn_handler` level 2, so the former comes first when both qualify.

# Edge cases and failure behavior

| Case | Behavior |
| --- | --- |
| No Mission site can be won with the Rested Agents available | It deploys nobody that Turn and keeps the Agents working toward income, Investigations, and Training. |
| A Mission site is in the last Turn before it would expire | It deploys to it as to any other Mission site, because the Combat is fought in the next Advance turn. |
| An Investigation completes while no winning team can be formed any more | It deploys nobody. The Mission site becomes Expired, the Lead becomes available again, and the Lead is investigated again once a winning team can be formed. |
| Money is below the Savings floor | It buys nothing that Turn. |
| Expected income is below projected upkeep and no Agent can be assigned to Contracting | It buys nothing, makes its other Player actions as usual, and ends the Turn. It does not dismiss Agents to lower upkeep. |
| Every Agent is exhausted or cannot be assigned, or the roster is empty | It makes no assignment and ends the Turn; buying an Agent still follows Grow with the threat. |
| A Player action it attempts is rejected | It does not retry the same Player action in that Turn and continues with the next step, so a rejection cannot make it repeat itself until it fails. |
| Only Leads that create Mission sites it cannot currently win remain | It leaves those Leads uninvestigated until the Agency is strong enough. |

# TODOs

- TODO: Decide whether the Basic Autopilot AI's thresholds, e.g. its safety margin and Savings floor, stay implementation constants or become values a Player can tune, under [Goals](#goals).

# Appendix: Derivation from game-ts

This appendix is informative. The Basic Autopilot AI follows the basic AI player of game-ts revision `f1835a29`, in its basic intellect code and `docs/ai/basic_intellect.md`. Its goals and Turn routine are kept as far as the Mechanics specifications allow; the following table lists the game-ts values the Implementer can start from. game-ts stated exhaustion in percent; the same numbers are exhaustion points here.

| Threshold | game-ts value |
| --- | --- |
| Recall threshold: exhaustion above which an Agent on Contracting is recalled | 30 |
| Agent reserve | 20% of the roster |
| Contracting income target | 120% of upkeep |
| Savings floor | Five Turns of half the upkeep |
| Combat rating safety margin | 120% of the Enemies' Combat rating |
| Agents needed for the number of Enemies | One Agent per three Enemies |
| Agents investigating Leads | 1, plus 1 per 10 Agents |
| Target roster size | 8, plus 4 per Upgrade other than a Cap Upgrade bought |
| Transport cap and Training cap | 25% and 30% of the roster |

game-ts differs from the Basic Autopilot AI in the following deliberate ways. The list is exhaustive.

- game-ts broke ties at random; the Basic Autopilot AI breaks them in a fixed order so that its Player actions are reproducible.
- game-ts kept counts of its own purchases in AI state; the Basic Autopilot AI reads them from Player-visible information instead.
- In game-ts an order took effect at once. Here it costs one Advance turn of transit, so the Basic Autopilot AI follows the principles under [Assignments and transit](#assignments-and-transit).
- game-ts gave new work to an Agent with exhaustion of at most 5, or at most 25 for urgent income, and kept its reserve on Standby only. The Basic Autopilot AI ties a Rested Agent to `exhaustion_free_points`, so that the Agent reserve is always at full strength, lets the Agent reserve train, lets resting Agents finish resting to exhaustion 0, and refills the Agent reserve from Contracting.
