# Investigations

| Metadata | Value |
| --- | --- |
| Spec ID | INVSTG |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | What an Investigation has, the InvestigationArchetype and InvestigationParameters GDRs, the Investigation lifecycle, the startInvestigation and assignAgentsToInvestigation actions, leaving, Progress loss, and abandonment, Investigation progress, Assessment, completion, and the Team progress estimate query. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Investigating a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) takes Agents and time, and how much work it takes is known only roughly. An [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) is one team's effort on one Lead: the player starts it, adds Agents to it, and may assign them elsewhere. A Lead has at most one Active Investigation at a time.

The work accumulates. In every Advance turn, [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) grows by the effective skill of the working members, with diminishing returns for a larger team, and the Investigation completes once it reaches a hidden target drawn at its start from a range its Lead's [Required progress](leads-and-progression.md#glossary) sets, e.g. 30 to 45 progress points for 30. The player learns the range once some Investigation of the Lead has made a set share of the Required progress, e.g. a quarter. A completed Investigation applies its Lead's completion effect, e.g. creating an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), and sends its members to [Standby](agents-spec.md#assignments). Taking members away costs progress in proportion to the effective skill they take: an Investigation whose last member leaves becomes Abandoned with no progress left.

# Glossary

| Term | Definition |
| --- | --- |
| Required progress range | The whole numbers of [progress points](domain-model.md#leads-investigations-mission-sites-and-missions) from a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions)'s [Required progress](leads-and-progression.md#glossary) up to the maximum that InvestigationParameters allow, from which an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions)'s Actual required progress is drawn. |
| Actual required progress | The progress points an Investigation must reach to complete, drawn when it starts. It is hidden from the player. |
| Assessed | Whether an Investigation's progress has ever reached the [assessment threshold](#assessment) of its Lead. |
| Assessed Lead | A Lead with at least one Assessed Investigation. Its Required progress and Required progress range are Player-visible. |
| Working member | In an Advance turn: a member of an Investigation's [Current team](domain-model.md#leads-investigations-mission-sites-and-missions) that is a [Working Agent](agents-spec.md#assignments), i.e. that is [At assignment](domain-model.md#agency-and-agents) on the Investigation when the [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) step begins. A member [In transit](domain-model.md#agency-and-agents) to the Investigation is not a Working member, including one that arrives in the Previous turn transit arrivals step of that Advance turn. |

# Investigation GDRs

Two [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling) shape Investigations: the InvestigationArchetype names them, and InvestigationParameters sets how their progress grows and when the player learns how much work a Lead takes.

## InvestigationArchetype

The InvestigationArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of every Investigation, and a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies one. Every Investigation behaves the same: what distinguishes one Investigation from another is its Lead.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Investigation. | [Player-visible information](#player-visible-information) |

## InvestigationParameters

InvestigationParameters bundles the values that shape how Investigation progress grows and what the player knows of its target.

| Property | Meaning | Read by |
| --- | --- | --- |
| `team_efficiency_exponent` | The exponent e of the team efficiency n^e / n of n working members, a [fractional GDR value](../foundation/numbers.md#whole-number-quantities). It is greater than 0 and at most 1: at 1 a larger team has no diminishing returns, and above 1 it would gain more than the sum of its members' [effective skill](agents-spec.md#combatant-attributes). | [Progress gain](#progress-gain) |
| `required_progress_max_pct` | A [Percent value](../foundation/numbers.md#glossary): the greatest Actual required progress an Investigation can draw, as a percent of its Lead's Required progress. It is at least 100, so every Required progress range contains the Required progress itself. | [Required progress range and outcome](#required-progress-range-and-outcome) |
| `assessment_threshold_pct` | A Percent value: the share of its Lead's Required progress that an Investigation's progress must reach to become Assessed. It is from 1 to 100, and at most 100 so that every Completed Investigation is Assessed. | [Assessment](#assessment) |

# Investigation

An Investigation is the [Campaign instance](../foundation/core-concepts.md#campaign-instances) that holds one team's effort on one Lead: which Lead it investigates, who is on its team now, and how much progress the team has made.

## Investigation properties

An Investigation's [Constants](../foundation/core-concepts.md#campaign-instances) record what it investigates and how much work that takes, and its [State](../foundation/core-concepts.md#campaign-instances) records how far its team has come. Each property is an [Authoritative value](../foundation/core-concepts.md#value-classification).

| Property | Part | Meaning |
| --- | --- | --- |
| Lead | Constants | The Lead the Investigation investigates. |
| Turn started | Constants | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) in which the Investigation was started. |
| Actual required progress | Constants | Its Actual required progress, a whole number of progress points. |
| Lifecycle | State | Active, Completed, or Abandoned. |
| Investigation progress | State | Its Investigation progress, a [Decimal quantity](../foundation/numbers.md#glossary) of progress points. |
| Assessed | State | Whether it is Assessed. |
| [Current team](domain-model.md#leads-investigations-mission-sites-and-missions) | State | Its Current team. |

In every [World state](../foundation/engine-contract.md#player-actions-and-turns), an Investigation's Current team is non-empty exactly when the Investigation is Active, and the Investigation progress of an Active Investigation is less than its Actual required progress. An Investigation becomes [Retired](../foundation/world-history.md#glossary) when it becomes Completed or Abandoned, and keeps its final Investigation progress.

## Investigation creation

An Investigation exists only because the player started it: a new [Campaign](../foundation/core-concepts.md#campaign-and-session) has none, and only [`startInvestigation`](#starting-an-investigation) creates one.

A new Investigation is Active, has an Investigation progress of 0, is not Assessed, and has the Agents it was started with as its Current team. A later Investigation of the same Lead is another Investigation: it draws its own Actual required progress and starts again from 0 and not Assessed, whatever became of the earlier Investigations of that Lead.

## Required progress range and outcome

How much work an Investigation takes is drawn when it starts, so the player cannot know it in advance: the Lead sets only the least it can be.

The Required progress range of a Lead with Required progress R is every whole number from R to `round up(R × required_progress_max_pct / 100)`, both included, with [Round up](../foundation/numbers.md#glossary). E.g., with a `required_progress_max_pct` of 140 and a Required progress of 12, `round up(16.8)` is 17, so the range is 12 to 17.

Each new Investigation has one named random outcome, its **Required progress outcome**: a [uniform whole-number outcome](../foundation/numbers.md#uniform-whole-number-outcomes) over the Required progress range of its Lead. Its value becomes the Investigation's Actual required progress, which never changes afterwards.

# Investigation lifecycle

An Investigation is Active while it has a team, and it ends either Completed, when its progress reaches its Actual required progress, or Abandoned, when it loses its team or its Lead can no longer be investigated.

| Source state | Target state | Trigger | Condition |
| --- | --- | --- | --- |
| Active | Completed | Advance turn, in the [Turn advancement step](domain-model.md#turn-advancement-steps) Investigation progress. | Its [Completion check](#completion-check) is met. |
| Active | Abandoned | A [Player action](../foundation/engine-contract.md#player-actions-and-turns) recalls members of its Current team. | The Player action leaves its [Current team empty](#abandonment). |
| Active | Abandoned | Advance turn, in the Turn advancement step Investigation progress: members have a [Forced return](agents-spec.md#forced-return). | The [Forced returns](agents-spec.md#assignments) of that step leave its [Current team empty](#abandonment). |
| Active | Abandoned | Advance turn, at the end of the Turn advancement step [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) resolution. | Its [Lead is not available](#lead-no-longer-available). |

# Starting an Investigation

The Player action `startInvestigation(lead, agents)` starts a new Investigation of one Lead with a team of at least one [Agent](domain-model.md#agency-and-agents): it [creates the Investigation](#investigation-creation), and the Agents become its Current team, [In transit](agents-spec.md#agent-statuses) to it.

The action requires all of the following:

1. `lead` names a [discovered Lead](leads-and-progression.md#lead-discovery). A `lead` that names an undiscovered Lead is rejected exactly as one that names no Lead, so the rejection does not reveal that an undiscovered Lead exists.
2. The Lead is [available](leads-and-progression.md#lead-availability).
3. The Lead has [no Active Investigation](#one-active-investigation-per-lead).
4. Each Agent [can take orders](agents-spec.md#agents-that-can-take-orders), is on a [Base Assignment](agents-spec.md#assignments), and is [Fit to start work](agents-spec.md#start-work-gate).

## One Active Investigation per Lead

No two Active Investigations have the same Lead in any World state, so the work on a Lead is never split between two teams.

**Whether a Lead can be investigated now** is a [Derived value](../foundation/core-concepts.md#value-classification) of each Lead: yes exactly when the Lead is available and has no Active Investigation.

# Assigning Agents to an Investigation

The Player action `assignAgentsToInvestigation(investigation, agents)` adds Agents to the Current team of an Active Investigation, so the player can strengthen a team without starting its work again. The Agents become In transit to the Investigation, and adding them costs no Investigation progress.

The action requires that the Investigation is Active and that each Agent meets what [`startInvestigation` requires of an Agent](#starting-an-investigation). Whether the Investigation's Lead is available is not a condition.

# Leaving an Investigation

The members carry the current context of the work, and the most skilled carry the most, so taking members away from an Active Investigation costs progress. Before an Investigation ends, a member leaves it in two ways: the player [recalls it to Standby](agents-spec.md#agents-that-can-take-orders), or its work gives it a [Forced return](agents-spec.md#forced-return).

## Progress loss

When members leave an Active Investigation, the Investigation loses Investigation progress in proportion to the effective skill that leaves with them.

```text
Investigation progress after = round down to hundredths( Investigation progress before × S_after / S_before )
```

S_before is the sum of the [Effective skill](agents-spec.md#effective-skill) of the members that are [At assignment](agents-spec.md#agent-statuses) before the members leave, and S_after is the same sum over those of them that remain. A member In transit counts in neither sum. When S_before is 0, the Investigation progress is unchanged. The expression is [evaluated exactly](../foundation/numbers.md#exact-evaluation) and rounded once, at the end.

The loss applies once for each Player action that recalls members, and once for all the Forced returns of one Investigation progress step. For Forced returns, Investigation progress before is the progress after that step's [Progress gain](#progress-gain), and both sums use the effective skill that the Progress gain read.

E.g., an Investigation with an Investigation progress of 10 has three members At assignment, of effective skill 150, 100, and 50. Recalling the member of 100 leaves `round down to hundredths(10 × 200 / 300) = 6.66` progress points.

## Abandonment

An Investigation that has lost its whole team has nobody left who knows the work, so it ends.

When a Player action, or the Forced returns of one Investigation progress step, leave an Active Investigation with an empty Current team, the Investigation becomes Abandoned in that same Player action or step, after its [Progress loss](#progress-loss). A member In transit to the Investigation keeps it Active; e.g., an Investigation whose only working member is recalled while a newly added Agent travels to it loses all its progress and stays Active.

# Investigation progress

In each Advance turn, the working members of every Active Investigation add progress, and the Investigation completes when its progress reaches its hidden target. The work of an Advance turn counts in full before the [exhaustion](agents-spec.md#combatant-attributes) it causes.

In the Turn advancement step Investigation progress, every Active Investigation applies its [Progress gain](#progress-gain), then its [Assessment](#assessment), then its [Completion check](#completion-check) and, when the check is met, its [Completion](#completion). Then every working member gains its [work exhaustion](agents-spec.md#work-exhaustion), and the Forced returns that follow cost [Progress loss](#progress-loss) and may end in [Abandonment](#abandonment).

## Progress gain

A team adds the effective skill of its working members, with diminishing returns as it grows.

```text
Progress gain = round down to hundredths( (S / 100) × n^e / n )
```

Here n is the number of Working members of the Investigation, S is the sum of their Effective skill, and e is `team_efficiency_exponent`. With no working member, the Progress gain is 0. The expression is evaluated exactly and rounded once, at the end.

One working member of effective skill 100 adds 1 progress point. The factor n^e / n is the team efficiency: it is 1 for one working member and falls as the team grows, so a larger team adds more progress, but less per member.

E.g., with an e of 0.5, four working members whose effective skill sums to 625 have a team efficiency of 0.5 and gain `round down to hundredths(6.25 × 0.5) = 3.12` progress points.

## Assessment

Assessment is how the player learns how much work a Lead takes: once an Investigation has made a set share of the Lead's Required progress, the Lead becomes an Assessed Lead.

An Investigation that is not Assessed becomes Assessed in the Investigation progress step when, after its Progress gain:

```text
Investigation progress ≥ assessment_threshold_pct × Required progress / 100
```

E.g., with an `assessment_threshold_pct` of 20 and a Required progress of 40, the threshold is 8 progress points.

Assessed never changes back to no, whatever later happens to the Investigation's progress. A Lead stays an Assessed Lead whatever becomes of the Investigation that made it one, so a later Investigation of that Lead starts with the Lead's Required progress range known, although it is not yet Assessed itself.

## Completion check

Completion is certain, not a chance: the player does not know the target, but reaching it always completes the Investigation.

An Active Investigation completes in the Investigation progress step in which its Investigation progress, after that step's Progress gain, is at least its Actual required progress. E.g., an Investigation with an Actual required progress of 20 that gains 3.12 in every Advance turn has 18.72 after six Advance turns of work and completes in the seventh, with 21.84.

## Completion

A completed Investigation delivers what its Lead promises and gives its Agents back.

When the Completion check is met, the following apply in the same step:

1. **Lifecycle:** The Investigation becomes Completed. Its Investigation progress keeps its value, which may exceed its Actual required progress.
2. **Completion effect:** The [completion effect](leads-and-progression.md#completion-effect) of its Lead applies. When several Investigations complete in one step, the [Mission sites](domain-model.md#leads-investigations-mission-sites-and-missions) their completion effects create are created in the order of the Investigations' [Instance IDs](../foundation/campaign-instances.md#glossary).
3. **Members:** Every member of its Current team, including one still In transit to the Investigation, gets the [Assignment](domain-model.md#agency-and-agents) [Standby](agents-spec.md#assignments) and the [Agent status](domain-model.md#agency-and-agents) In transit.

# Lead no longer available

An Investigation of a Lead that can no longer be investigated is wasted work, so the game ends it at once and gives the Agents back.

At the end of the Turn advancement step Mission resolution, after its [Cancellation](missions.md#cancellation) part, every Active Investigation whose Lead is not [available](leads-and-progression.md#lead-availability) is interrupted. Every member of its Current team, including one still In transit to it, gets the Assignment Standby and the Agent status In transit, and the Investigation becomes Abandoned with an Investigation progress of 0.

# Projected progress gain

The player plans around what a team will add next, so every Active Investigation has a projected progress gain: the Progress gain it would add in the next Advance turn if no Player action changed the Investigation or its members first.

The projected progress gain is a Derived value, computed by the formula of [Progress gain](#progress-gain) with n and S taken over the members of the Current team that are At assignment now, each with its current Effective skill. A member In transit counts in neither. A Completed or Abandoned Investigation has no projected progress gain.

# Team progress estimate

The [Player API](../foundation/engine-contract.md#api-surfaces) query `estimateTeamProgressGain(agents)` tells the player what a team would add before that team exists, e.g. for the Agents the player is about to start an Investigation with, or for an Active Investigation's Current team together with the Agents the player may add to it.

For a set of [Serving](agents-spec.md#agent-statuses) Agents, the query returns the Progress gain those Agents would add if exactly they were the working members of an Investigation: the formula of [Progress gain](#progress-gain) with n the number of Agents in the set and S the sum of their current Effective skill. It takes every Agent in the set as working, whatever its Agent status and Assignment, so it is the gain per Advance turn once the team works, not the gain of the next Advance turn.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, for each Investigation that is Active when the Investigation progress step begins, in the order of the Investigations' Instance IDs: its Instance ID, its Lead, its Progress gain, whether it became Assessed, whether it completed, the progress it lost to Forced returns, its Investigation progress after the step, whether it was abandoned, and the Mission site its completion created. It also holds the Investigations completed in that Advance turn, each with its Progress gain of that Advance turn, and the Investigations interrupted in it, each with its Lead, in the order of their Instance IDs.

The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds the same two lists of Investigations completed and interrupted, and the number of Active Investigations in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of that Turn.

# Player-visible information

The player sees everything about an Investigation except how much work it will take.

Every property of an Investigation is [Player-visible information](../foundation/engine-contract.md#api-surfaces), whatever its lifecycle state, except its Actual required progress. So are the `name` of the InvestigationArchetype, every property of InvestigationParameters, an Active Investigation's projected progress gain, and every Team progress estimate.

The Actual required progress stays hidden for the whole Campaign. The player learns only that it has been reached, when the Investigation becomes Completed, and no rejection, Turn report, or other answer of the Player API reveals it.

For each discovered Lead, the player sees whether it is an Assessed Lead, and sees its Required progress and its Required progress range exactly when it is one. The hidden values exist, so they are reported as unknown, not as absent: the Actual required progress of every Investigation, and the Required progress and Required progress range of a discovered Lead that is not an Assessed Lead. The player may infer from an Investigation that is not Assessed that its progress has not reached the threshold; that reads visible values and reveals nothing.

For each discovered Lead, the player also sees [whether it can be investigated now](#one-active-investigation-per-lead) and, when it cannot, which of the two conditions fails: that the Lead is not available, without the cause, or that the Lead has an Active Investigation, with that Investigation's Instance ID.

# TODOs

- TODO (later): Selection among several [InvestigationArchetypes](#investigationarchetype).
