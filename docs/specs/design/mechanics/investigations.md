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

[Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) and other general terms are in the [Domain Model glossary](domain-model.md#glossary).

| Term | Definition |
| --- | --- |
| Required progress range | The whole numbers of [progress points](domain-model.md#leads-investigations-mission-sites-and-missions) from a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions)'s [Required progress](leads-and-progression.md#glossary) up to the maximum that InvestigationParameters allow, from which an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions)'s Actual required progress is drawn. |
| Actual required progress | The progress points an Investigation must reach to complete, drawn when it starts. It is hidden from the player. |
| Assessed | Whether an Investigation's progress has ever reached the assessment threshold of its Lead, under [Assessment](#assessment). |
| Assessed Lead | A Lead with at least one Assessed Investigation. Its Required progress and Required progress range are Player-visible. |
| Working member | In an Advance turn: a member of an Investigation's [Current team](domain-model.md#leads-investigations-mission-sites-and-missions) that is a [Working Agent](agents-spec.md#assignments), i.e. that was [At assignment](domain-model.md#agency-and-agents) on the Investigation in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns). A member that arrives in the Transit step of that Advance turn is not a Working member in it. |

The [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) states Active, Completed, and Abandoned are defined by the state table under [Investigation lifecycle](#investigation-lifecycle).

# Investigation GDRs

Investigations read the [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling) InvestigationArchetype and InvestigationParameters and one property of the [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) GDR. The GDRs a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## InvestigationArchetype

An InvestigationArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of every Investigation. This property table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Investigation. | [Player-visible information](#player-visible-information) |

None of the [Game rules](../foundation/core-concepts.md#game-build-and-content) reads an InvestigationArchetype property: every Investigation behaves the same, and what distinguishes one Investigation from another is its Lead.

## InvestigationParameters

InvestigationParameters bundles the values that shape how Investigation progress grows and what the player knows of its target. This table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `team_efficiency_exponent` | The exponent e of the team efficiency n^e / n of n working members. It is a fractional GDR value, read exactly under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers, e.g. 0.8 is 4 over 5. | [Progress gain](#progress-gain); [Projected progress gain](#projected-progress-gain) |
| `required_progress_max_pct` | A [Percent value](../foundation/numbers.md#glossary): the greatest Actual required progress an Investigation can draw, as a percent of its Lead's Required progress. | [Required progress range and outcome](#required-progress-range-and-outcome) |
| `assessment_threshold_pct` | A Percent value: the share of its Lead's Required progress that an Investigation's progress must reach to become Assessed. | [Assessment](#assessment) |

## Lead properties this document reads

Investigations read exactly one property of the Lead GDR: `required_progress`, the Required progress, read by [Required progress range and outcome](#required-progress-range-and-outcome) and [Assessment](#assessment). Rule 3 of [Lead GDR validation](leads-and-progression.md#lead-gdr-validation) makes it a whole number of at least 1, so every Required progress range is non-empty. No Investigation rule reads the Lead's other properties, e.g. `requires` and `on_completion`.

## Investigation GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the InvestigationArchetype and InvestigationParameters. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **One InvestigationArchetype:** The Game build supplies exactly one InvestigationArchetype. Every Investigation has it as its Archetype, so no rule selects among InvestigationArchetypes.
2. **Known properties:** The InvestigationArchetype has `name`, and no property other than `name`, `id`, and `type`. Its `name` is non-empty text.
3. **One InvestigationParameters:** The Game build supplies exactly one InvestigationParameters GDR, and it has exactly the properties its table above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
4. **Team efficiency exponent is valid:** `team_efficiency_exponent` is a decimal number with at most two digits after the decimal point, greater than 0 and at most 1. Above 1 a larger team would gain more than the sum of its members' [effective skill](agents-spec.md#combatant-attributes); at 1 there are no diminishing returns.
5. **Required progress maximum is valid:** `required_progress_max_pct` is a whole number of at least 100, so every Required progress range contains the Required progress itself.
6. **Assessment threshold is valid:** `assessment_threshold_pct` is a whole number from 1 to 100. At most 100 makes every Completed Investigation Assessed, under [Assessment](#assessment).

# Investigation

An Investigation is the [Campaign instance](../foundation/core-concepts.md#campaign-instances) that holds one team's effort on one Lead: which Lead it investigates, who is on its team now, and how much progress the team has made.

## Investigation properties

**Proposed rule:** An Investigation is a Campaign instance whose Archetype is the InvestigationArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) and [State](../foundation/core-concepts.md#campaign-instances) have exactly the following properties. This table is exhaustive.

| Property | Part | Value | Classification and range |
| --- | --- | --- | --- |
| Lead | Constants | An Immutable reference to the Lead GDR the Investigation investigates. | [Authoritative value](../foundation/core-concepts.md#value-classification), under [How concepts relate](domain-model.md#how-concepts-relate). Always resolves to a Lead GDR the Game build supplies. |
| Turn started | Constants | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) in which the `startInvestigation` [Player action](../foundation/engine-contract.md#player-actions-and-turns) created the Investigation. | Authoritative value. A whole number of at least 1. |
| Actual required progress | Constants | The Actual required progress, in progress points, drawn under [Required progress range and outcome](#required-progress-range-and-outcome). | Authoritative value. A whole number within the Required progress range of its Lead. Hidden from the player, under [Player-visible information](#player-visible-information). |
| Lifecycle | State | Active, Completed, or Abandoned, under [Investigation lifecycle](#investigation-lifecycle). | Authoritative value. |
| Investigation progress | State | The Investigation progress, a [Decimal quantity](../foundation/numbers.md#glossary) of progress points, given in hundredths of a progress point, e.g. 449 for 4.49 progress points. | Authoritative value. A whole number of hundredths of at least 0, with no upper bound, under [Decimal quantities](../foundation/numbers.md#decimal-quantities). Changes only under [Progress gain](#progress-gain) and [Progress loss](#progress-loss). |
| Assessed | State | Yes or no, under [Assessment](#assessment). | Authoritative value. Changes only from no to yes. |
| [Current team](domain-model.md#leads-investigations-mission-sites-and-missions) | State | The set of Agents whose [Assignment](domain-model.md#agency-and-agents) references the Investigation, whatever their [Agent status](domain-model.md#agency-and-agents). | Authoritative value. It has no order. It agrees with Assignments under [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain Model. |

An Investigation also has one [Derived value](../foundation/core-concepts.md#value-classification), which is never stored: its projected progress gain, under [Projected progress gain](#projected-progress-gain). The Agents who took part in an Investigation remain recorded after they leave its Current team, in each [Agent](domain-model.md#agency-and-agents)'s [Participation history](domain-model.md#agency-and-agents), under [Participation history records](agents-spec.md#participation-history-records) in Agents; the past participants of an Investigation are that same relationship seen from the Investigation's side, not a separate fact. An Investigation has no [Turn series](../foundation/world-history.md#glossary).

**Invariants:** In every [World state](../foundation/engine-contract.md#player-actions-and-turns), every Investigation satisfies all of the following. A World state that violates one is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. Its Current team is non-empty exactly when its lifecycle state is Active.
2. When it is Active, its Investigation progress is less than its Actual required progress multiplied by 100. This holds because reaching it always completes the Investigation, under [Completion check](#completion-check), and [Progress loss](#progress-loss) never raises progress.
3. No other Active Investigation has the same Lead. `startInvestigation` guarantees it, under [One Active Investigation per Lead](#one-active-investigation-per-lead).
4. Its Actual required progress lies within the Required progress range of its Lead.
5. When it is Completed, it is Assessed, under [Assessment](#assessment).

**Retention:** An Investigation keeps every property above for the whole Campaign, whatever its lifecycle state, so that every reference to it resolves, e.g. from an Agent's Participation history or from the origin of an Initiative Mission site. An Investigation becomes [Retired](../foundation/world-history.md#glossary) when it becomes Completed or Abandoned, and is kept in the [Retired world state](../foundation/campaign-state.md#glossary) with its final values, including its final Investigation progress, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Investigation is ever removed.

## Investigation creation

**Proposed rule:** An Investigation is created on exactly one occasion: a successful `startInvestigation` Player action, under [Starting an Investigation](#starting-an-investigation). The initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains no Investigation, and no [Turn advancement step](turn-advancement.md#glossary) creates one. Each new Investigation has a fresh [Instance ID](../foundation/campaign-instances.md#glossary) under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

| Value | Initial value | Source |
| --- | --- | --- |
| Archetype reference | The InvestigationArchetype. | The one InvestigationArchetype GDR, under [Investigation GDR validation](#investigation-gdr-validation). |
| Lead | The Lead GDR identified by `lead`. | The `lead` parameter of `startInvestigation`. |
| Turn started | The turn number of the current Turn. | Campaign state. |
| Lifecycle | Active. | This rule. |
| Actual required progress | The value of the Required progress outcome. | [Required progress range and outcome](#required-progress-range-and-outcome). |
| Investigation progress | 0. | This rule. |
| Assessed | No. | This rule. |
| Current team | The Agents of `agents`. | The `agents` parameter of `startInvestigation`. |

No [Campaign configuration](../foundation/campaign-state.md#glossary) value changes any initial value above. A later Investigation of the same Lead is another Campaign instance with its own Instance ID, its own Actual required progress, and Assessed no, and starts again from an Investigation progress of 0, whatever became of earlier Investigations of that Lead. Its Lead may nevertheless be an Assessed Lead from the start, under [Assessment](#assessment).

## Required progress range and outcome

**Proposed rule:** The Required progress range of a Lead with Required progress R is every whole number from R to `round down(R × required_progress_max_pct / 100)`, both included. E.g., with `required_progress_max_pct` 150, a Required progress of 30 gives the range 30 to 45, and a Required progress of 3 gives 3 to 4, because round down(4.5) is 4.

Each successful `startInvestigation` has exactly one named random outcome, the **Required progress outcome** of the new Investigation: a uniform whole-number outcome over the Required progress range of its Lead, under [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes) in Numbers. Its value becomes the Investigation's Actual required progress, which never changes afterwards. A rejected `startInvestigation` draws none.

# Investigation lifecycle

**Proposed rule:** An Investigation is in exactly one of the lifecycle states Active, Completed, and Abandoned. The set is exhaustive. Every Investigation is Active when it is created. It stays Active until it becomes Completed or Abandoned. The transition table is:

| Source state | Target state | Trigger | Condition | Effects |
| --- | --- | --- | --- | --- |
| Active | Completed | Advance turn, in the [Turn advancement step](domain-model.md#turn-advancement-steps) Investigation progress. | Its Investigation progress has reached its Actual required progress, under [Completion check](#completion-check). | Under [Completion](#completion). |
| Active | Abandoned | A Player action changes the Assignment of a member of the Investigation's Current team to something else: `assignAgents`, `startInvestigation`, or `assignAgentsToInvestigation`. | The Investigation's Current team is empty after every change of that Player action. | Under [Abandonment](#abandonment). |
| Active | Abandoned | Advance turn, in the Turn advancement step Investigation progress: a member has a [Forced return](agents-spec.md#forced-return). | The Investigation's Current team is empty after every [Forced return](agents-spec.md#assignments) of that step. | Under [Abandonment](#abandonment). |

Every transition not listed is impossible; e.g., an Abandoned Investigation never becomes Active again, a Completed Investigation is never Abandoned, and no Turn advancement step other than Investigation progress makes an Investigation Abandoned. Completed and Abandoned are final.

# Starting an Investigation

**Proposed rule:** The Player action `player.actions.startInvestigation(lead, agents)` starts a new Investigation of a Lead with a team of Agents.

| Parameter | Meaning                                                                   |
| --------- | ------------------------------------------------------------------------- |
| `lead`    | A GDR identifier, meant to identify one Lead GDR the Game build supplies. |
| `agents`  | A list of Instance IDs, each meant to identify one Agent of the Campaign. |

Preconditions: every precondition is evaluated in the World state in which the action is requested, before any of its changes. The action is rejected, as a whole, when any of the following holds:

1. `lead` identifies no discovered Lead, under [Lead discovery](leads-and-progression.md#lead-discovery) in Leads and Progression, i.e. it identifies no Lead GDR the Game build supplies, or a Lead that is not discovered. Both are rejected with the same error, so the rejection does not reveal whether an undiscovered Lead exists.
2. The Lead is not available, under [Lead availability](leads-and-progression.md#lead-availability) in Leads and Progression.
3. The Lead already has an Active Investigation, under [One Active Investigation per Lead](#one-active-investigation-per-lead).
4. `agents` is empty.
5. `agents` contains the same Instance ID more than once.
6. An Instance ID in `agents` identifies no Agent of the Campaign.
7. An Agent in `agents` cannot be assigned, under [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned) in Agents.
8. An Agent in `agents` is not [Fit for work](agents-spec.md#assignments), under [Start-work gate](agents-spec.md#start-work-gate) in Agents.
9. An Agent in `agents` is not on a [Base Assignment](agents-spec.md#assignments), i.e. it is on [Contracting](agents-spec.md#assignments) or another Investigation, which it can leave only for [Standby](agents-spec.md#assignments), under [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned) in Agents.

Other preconditions apply to every Player action, e.g. that the Campaign has no [Campaign ending](domain-model.md#campaign-standing), under [Panic and Endings](panic-and-endings.md) and [Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation is the Implementer's choice. A rejected action changes nothing, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract. Because every value of an Investigation is [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Player-visible information](#player-visible-information), the error reveals nothing hidden.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same Turn:

- A new Investigation is created under [Investigation creation](#investigation-creation), with the Lead of `lead`, the Agents of `agents` as its Current team, and the value of its Required progress outcome as its Actual required progress, under [Required progress range and outcome](#required-progress-range-and-outcome).
- For every Agent in `agents`: its Assignment becomes that new Investigation, with a Mutable reference to it, and its Agent status becomes [In transit](agents-spec.md#agent-statuses), under [Transit rule](agents-spec.md#transit-rule) and [Assignment changes](agents-spec.md#assignment-changes) in Agents.

Nothing else changes; e.g., no money is spent, and the Agents' base skill, current health, and exhaustion are unchanged. The Agents arrive in the next Advance turn and add their first Investigation progress in the Advance turn after it, under [Transit rule](agents-spec.md#transit-rule).

## One Active Investigation per Lead

**Proposed rule:** `startInvestigation` starts an Investigation of a Lead L only when both of the following hold, in the World state in which the action is requested, before any of its changes; the list is exhaustive for the Lead:

1. L is available under [Lead availability](leads-and-progression.md#lead-availability) in Leads and Progression.
2. No Investigation of L is Active.

Condition 1 is precondition 2 and condition 2 is precondition 3 of [Starting an Investigation](#starting-an-investigation). Condition 2 is not part of [Lead availability](domain-model.md#leads-investigations-mission-sites-and-missions), because it reads the Investigation lifecycle. Together they make at most one Investigation of a Lead Active in every World state. Condition 2 holds again as soon as the Active Investigation of L becomes Completed or Abandoned. **Whether a Lead can be investigated now** is a Derived value of each Lead, never stored: yes exactly when both conditions hold, and otherwise no, with every condition that does not hold. It is Player-visible under [Player-visible information](#player-visible-information).

# Assigning Agents to an Investigation

**Proposed rule:** The Player action `player.actions.assignAgentsToInvestigation(investigation, agents)` adds Agents to the Current team of an Active Investigation.

| Parameter       | Meaning                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `investigation` | An Instance ID, meant to identify one Investigation of the Campaign.      |
| `agents`        | A list of Instance IDs, each meant to identify one Agent of the Campaign. |

Preconditions: every precondition is evaluated in the World state in which the action is requested, before any of its changes. The action is rejected, as a whole, when any of the following holds:

1. `investigation` identifies no Investigation of the Campaign.
2. The Investigation is not Active, i.e. it is Completed or Abandoned.
3. `agents` is empty.
4. `agents` contains the same Instance ID more than once.
5. An Instance ID in `agents` identifies no Agent of the Campaign.
6. An Agent in `agents` cannot be assigned, under [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned) in Agents.
7. An Agent in `agents` already belongs to the Investigation's Current team.
8. An Agent in `agents` is not Fit for work, under [Start-work gate](agents-spec.md#start-work-gate) in Agents.
9. An Agent in `agents` is not on a [Base Assignment](agents-spec.md#assignments), as under [Starting an Investigation](#starting-an-investigation).

The Lead's availability is not a precondition: an Active Investigation accepts Agents whatever its Lead's availability, under [Lead no longer available](#lead-no-longer-available). Other preconditions on every Player action apply as under [Starting an Investigation](#starting-an-investigation). Rejection is as under [Starting an Investigation](#starting-an-investigation): all-or-nothing, with an error that identifies at least one failed precondition, and no change.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same Turn:

- For every Agent in `agents`: its Assignment becomes the Investigation, with a Mutable reference to it, and its Agent status becomes [In transit](domain-model.md#agency-and-agents), under [Transit rule](agents-spec.md#transit-rule) and [Assignment changes](agents-spec.md#assignment-changes) in Agents. It joins the Investigation's Current team.

Nothing else changes; in particular, the Investigation's Investigation progress is unchanged, because the added Agents are In transit and Agents joining cause no [Progress loss](#progress-loss). The added Agents count in [Progress gain](#progress-gain) from the second Advance turn after the action, under [Transit rule](agents-spec.md#transit-rule).

# Leaving an Investigation

**Proposed rule:** An Agent leaves the Current team of an Investigation on exactly the following occasions, and this list is exhaustive:

1. **Assigned elsewhere:** A Player action changes the Agent's Assignment from that Investigation to something else. The only Player action that can do so is `assignAgents` to Standby, under [Assigning Agents](agents-spec.md#assigning-agents) in Agents, because an Agent on an Investigation can be assigned only to Standby, under [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned). Neither `startInvestigation`, `assignAgentsToInvestigation`, nor `deployAgents` takes an Agent off an Investigation, because each requires a [Base Assignment](agents-spec.md#assignments).
2. **Completion:** The Investigation becomes Completed, under [Completion](#completion).
3. **Forced return:** The Agent's work on the Investigation raises its [exhaustion](agents-spec.md#combatant-attributes) to `exhaustion_work_limit` or more in the Investigation progress step, under [Forced return](agents-spec.md#forced-return) in Agents.

No other rule removes an Agent from an Investigation's Current team: an Agent on an Investigation cannot be dismissed, because `dismissAgents` requires [Standby](agents-spec.md#assignments), and it cannot be [Killed](agents-spec.md#agent-statuses), because only a [Deployed](agents-spec.md#assignments) Agent can be Killed, under [Agent status](agents-spec.md#agent-status) in Agents. Whenever an Agent leaves, the Investigation is added to its Participation history under [Participation history records](agents-spec.md#participation-history-records) in Agents.

## Progress loss

**Proposed rule:** When members leave an Active Investigation by being assigned elsewhere or by a Forced return, the Investigation loses Investigation progress in proportion to the effective skill that leaves with them. The change applies once for each such Investigation and occasion, before [Abandonment](#abandonment):

- **Assigned elsewhere:** once for each Player action that assigns at least one member elsewhere, after all of the action's other changes.
- **Forced return:** once for each Investigation progress step in which at least one member has a Forced return, after every Forced return of that step.

```text
Investigation progress = round down(Investigation progress before × S_after / S_before)
```

Inputs:

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| Investigation progress before | For a Player action, the Investigation's Investigation progress in the World state in which the action is requested; for Forced returns, its Investigation progress after this step's [Progress gain](#progress-gain). | Hundredths of a progress point; a whole number of at least 0. |
| S_before | For a Player action, the sum of the current [Effective skill](agents-spec.md#effective-skill) of every member of the Current team whose Agent status is [At assignment](agents-spec.md#agent-statuses), in the World state in which the action is requested. For Forced returns, the sum of the effective skill of every working member of this step, as [Progress gain](#progress-gain) read it. | Skill points; a whole number of at least 0. |
| S_after | The same sum over the members of that set that are still members of the Current team after all of the Player action's changes, or after every Forced return of the step. | Skill points; a whole number from 0 to S_before. |

Evaluation: the product is formed before the division, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, and rounded down once. When S_before is 0, the divisor would be zero, and the Investigation progress is unchanged instead. A member In transit adds nothing to either sum: the progress it will add has not started, and it cannot be assigned elsewhere until it arrives, under [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned) in Agents. The result lies from 0 to Investigation progress before, so Progress loss never raises progress. When the action leaves the Current team without a member [At assignment](domain-model.md#agency-and-agents), S_after is 0 and the Investigation progress becomes 0.

Progress loss leaves Assessed unchanged: an Investigation that was Assessed stays Assessed, whatever progress remains. Progress loss applies to the "Assigned elsewhere" and "Forced return" occasions above; members leaving on Completion cost nothing, because the Investigation is then final. A Forced return happens only after the [Completion check](#completion-check) of the step, so it never costs the progress that completes an Investigation.

**Informative rationale:** The members carry the current context of the work, and the most skilled carry the most, so removing a highly skilled Agent costs more than removing a rookie. This matches game-ts revision `f1835a29`, `removeAgentsFromInvestigation` in `web/src/redux/reducers/agentReducers.ts`, which also applies to the Agents its `unassignExhaustedAgents` sends back.

## Abandonment

**Proposed rule:** When a Player action, or the Forced returns of one Investigation progress step, leave an Active Investigation with an empty Current team, the Investigation becomes Abandoned in that same Player action or step, after all of its other changes. No World state therefore contains an Active Investigation with an empty Current team.

Every member of the Current team counts, whatever its Agent status. A member In transit toward the Investigation belongs to its Current team, under [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain Model, and does not work, so it has no Forced return, and it cannot be assigned, under [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned) in Agents, so it stays in the Current team at least until it arrives. An Investigation becomes Abandoned exactly when a Player action assigns elsewhere, or Forced returns send back, every member that remains in its Current team.

When an Investigation becomes Abandoned:

- Its lifecycle state becomes Abandoned, which is final.
- Its Current team is empty; every former member already has the Investigation in its Participation history.
- Its Investigation progress is 0, because [Progress loss](#progress-loss) applied with no member left, unless every member that left had effective skill 0. It keeps that final value as a [retained](../foundation/world-history.md#glossary) fact, but no rule reads it again for gameplay. It is never resumed: a later Investigation of the same Lead is a new Investigation that starts from 0, under [Investigation creation](#investigation-creation).
- Its Assessed keeps its value, so a Lead whose Abandoned Investigation was Assessed remains an Assessed Lead, under [Assessment](#assessment).

Abandonment changes no condition of [Lead availability](leads-and-progression.md#lead-availability) in Leads and Progression. With no Active Investigation of the Lead left, condition 2 of [One Active Investigation per Lead](#one-active-investigation-per-lead) holds again. One Player action may make several Investigations Abandoned, e.g. an `assignAgents` action that assigns the last member of each of two Investigations to [Contracting](agents-spec.md#assignments).

# Investigation progress

**Proposed rule:** In the Turn advancement step Investigation progress, under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, every Investigation that is Active when the step begins applies [Progress gain](#progress-gain), then [Assessment](#assessment), then [Completion check](#completion-check), and, when the check is met, [Completion](#completion). Then every working member of the Investigation gains exhaustion under [Work exhaustion](agents-spec.md#work-exhaustion) in Agents, and each that is still a member has a [Forced return](agents-spec.md#forced-return) when that exhaustion reaches `exhaustion_work_limit`; the Forced returns cost progress under [Progress loss](#progress-loss) and make the Investigation Abandoned under [Abandonment](#abandonment) when no member remains. A completion is therefore decided before any member's exhaustion rises. When no Investigation is Active, the step does nothing. No Investigation is created during Advance turn, so the step applies to exactly the Investigations that are Active in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of the Advance turn. The step has no random outcome.

## Progress gain

For each Active Investigation:

```text
gain                      = the greatest whole number k such that k^q × n^(q − p) ≤ S^q, when n is at least 1
                          = 0, when n is 0
Investigation progress    = Investigation progress before + gain
```

Inputs:

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| working member | A Working member of the Investigation in this Advance turn, under [Glossary](#glossary). | An Agent. |
| n | The number of working members. | A whole number of at least 0. |
| [effective skill](agents-spec.md#combatant-attributes) | A working member's [Effective skill](agents-spec.md#effective-skill), computed from its [Step-start values](turn-advancement.md#glossary) of this step. | Skill points; a whole number of at least 0. |
| S | The sum of the effective skill of every working member; 0 when n is 0. | Skill points; a whole number of at least 0. |
| p and q | The `team_efficiency_exponent` of InvestigationParameters as the fraction p / q in lowest terms, e.g. 4 and 5 for 0.8. | Whole numbers with 1 ≤ p ≤ q ≤ 100. |
| Investigation progress before | The Investigation's Investigation progress when the step begins. | Hundredths of a progress point; a whole number of at least 0. |

Meaning: gain is `round down(S × n^e / n)` hundredths of a progress point, where e is `team_efficiency_exponent` and n^e / n is the team efficiency. S / 100 is the team's effective skill in progress points, so one working member of effective skill 100 adds 1 progress point, i.e. 100 hundredths. The team efficiency is 1 for one working member and falls as the team grows, e.g. about 0.87 for two and about 0.72 for five with e = 0.8, so a larger team adds more progress, but less per member.

Evaluation: n^e is usually not a rational number, so the formula is stated as the inequality above, which uses only whole numbers and is evaluated exactly under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers; its greatest k equals `round down(S × n^e / n)` exactly. E.g., with e = 0.8, 5 working members whose effective skill sums to 620 gain 449, because 449^5 × 5 ≤ 620^5 < 450^5 × 5; that is 4.49 progress points. The gain lies from 0 to S, because n^(q − p) is at least 1, and it is 0 exactly when S is 0. Investigation progress has no upper bound. Investigating lowers no [current health](agents-spec.md#combatant-attributes), and it raises a working member's [exhaustion](agents-spec.md#combatant-attributes) only after the progress and the completion of this step, under [Investigation progress](#investigation-progress), so the gain reads the effective skill of the working members at the start of the step.

The following table gives the gain of working members of effective skill 100 each with the Bootstrap `team_efficiency_exponent` 0.8:

| Working members | S    | Gain, in hundredths | Gain per member |
| --------------- | ---- | ------------------- | --------------- |
| 1               | 100  | 100                 | 1.00            |
| 2               | 200  | 174                 | 0.87            |
| 3               | 300  | 240                 | 0.80            |
| 4               | 400  | 303                 | 0.75            |
| 5               | 500  | 362                 | 0.72            |
| 10              | 1000 | 630                 | 0.63            |

## Assessment

After [Progress gain](#progress-gain), an Investigation whose Assessed is no becomes Assessed exactly when:

```text
Investigation progress ≥ assessment_threshold_pct × Required progress
```

Investigation progress is in hundredths of a progress point, so the right-hand side is `assessment_threshold_pct` percent of the Lead's Required progress, in hundredths, and no rounding occurs. E.g., with `assessment_threshold_pct` 25 and a Required progress of 30, the threshold is 750, i.e. 7.50 progress points. Assessed never changes back to no, whatever later happens to the Investigation's progress.

A Lead is an **Assessed Lead** exactly when at least one Investigation of it, whatever its lifecycle state, is Assessed. It is a Derived value of the Lead, never stored, and once true it stays true for the rest of the Campaign, because every Investigation is retained with its Assessed. The Actual required progress is at least the Required progress and `assessment_threshold_pct` is at most 100, so an Investigation is always Assessed by the time it reaches its Actual required progress, and every [Completed Lead](leads-and-progression.md#glossary) is an Assessed Lead. A later Investigation of an Assessed Lead therefore starts with the Lead's Required progress range known, although its own Assessed is no until its own progress reaches the threshold.

## Completion check

After [Assessment](#assessment), an Active Investigation completes in this step exactly when:

```text
Investigation progress ≥ Actual required progress × 100
```

No rounding occurs. When the check is met, [Completion](#completion) applies; otherwise the Investigation stays Active with its new Investigation progress. The check is certain: it has no random outcome, and the Investigation completes in the first Advance turn in which its progress reaches its Actual required progress. E.g., an Investigation with an Actual required progress of 37 that gains 449 in every Advance turn has 3592 after eight Advance turns of work and completes in the ninth, with 4041.

## Completion

When the [Completion check](#completion-check) is met, the following changes apply in this step, and this list is exhaustive:

1. **Lifecycle:** The Investigation becomes Completed. Its Investigation progress keeps its value, which may exceed its Actual required progress × 100, e.g. after a large team's last Advance turn of work.
2. **Completion effect:** The completion effect of its Lead applies, under [Completion effect](leads-and-progression.md#completion-effect) in Leads and Progression. With the effect `create_mission_site`, this creates one [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) whose origin is this Investigation, under [Mission site creation](missions.md#mission-site-creation) in Missions.
3. **Members:** Every member of the Current team, whatever it contributed, gets the Assignment Standby and the Agent status In transit, under [Assignment changes](agents-spec.md#assignment-changes) in Agents. This includes every member that arrived in the Transit step of this Advance turn and added no progress, under the destination-ends exception of [Transit rule](agents-spec.md#transit-rule). Every member that was In transit in the Turn-end state arrived in the Transit step, so every member is [At assignment](domain-model.md#agency-and-agents) when this change applies. Each member leaves the Current team, and the Investigation is added to its Participation history under [Participation history records](agents-spec.md#participation-history-records). Under the [Transit rule](agents-spec.md#transit-rule), each member is still In transit when this Advance turn ends. No [Progress loss](#progress-loss) applies.
4. **Current team:** The Current team is now empty.
5. **[Turn report](../foundation/campaign-state.md#glossary):** The Investigation joins the Investigations completed that the Turn report lists, with the gain of this step's [Progress gain](#progress-gain), under [Turn report](#turn-report).

## Independence within the step

Every rule of this step uses [Step-start values](domain-model.md#turn-advancement-steps), under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement, and the result is the same whichever order an implementation processes the Investigations in:

- An Agent belongs to at most one Current team, so no Agent counts toward two Investigations, and the members a completion sends to Standby belong to no other Investigation.
- Each Investigation's Progress gain, Assessment, and Completion check read only that Investigation's values, its Lead, and InvestigationParameters. Whether its Lead is an Assessed Lead does not enter any of them.
- The completion of one Investigation changes no input of another. Several Investigations may complete in one step, each creating its own [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions).

# Lead no longer available

**Proposed rule:** Lead availability is checked only by precondition 2 of [Starting an Investigation](#starting-an-investigation). Once an Investigation is Active, a later change to whether its Lead would be available, e.g. its [Faction](domain-model.md#factions) becoming [Eliminated](factions.md#glossary) under [Elimination](factions.md#elimination) in Factions, does not change the Investigation: it stays Active, keeps its Current team and Investigation progress, still accepts Agents under [Assigning Agents to an Investigation](#assigning-agents-to-an-investigation), still gains progress, and can still complete and apply its Lead's completion effect.

A Mission site created that way targets a [Faction](domain-model.md#factions) that is already [Eliminated](factions.md#glossary). It is created Active in Investigation progress and becomes Cancelled in the Cancellation part of [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) resolution of the same Advance turn, under [Cancellation](missions.md#cancellation) in Missions, so no World state shows it Active. The player can instead end such an Investigation by assigning its members elsewhere, which makes it Abandoned under [Abandonment](#abandonment).

**Informative rationale:** Ending such an Investigation automatically would add a second trigger of Abandoned, and a transition during Advance turn, for a case with no gameplay effect: its Mission site is Cancelled either way.

# Projected progress gain

**Proposed rule:** Every Active Investigation has, in every World state, a Derived value: the gain its [Progress gain](#progress-gain) would add in the next Advance turn if no Player action changed the Investigation or its members before that Advance turn. It is computed by the formula of [Progress gain](#progress-gain), with n and S taken over the members of the Current team whose Agent status is At assignment in this World state, and each member's current [Effective skill](agents-spec.md#effective-skill). A member In transit counts in neither n nor S. The value is a whole number of hundredths of a progress point, never stored.

When no Player action changes the Investigation or its members before the next Advance turn, the projected progress gain equals that Advance turn's gain exactly. The members At assignment in this World state are exactly the working members of that Advance turn, because this World state is then its Turn-end state, and their effective skill does not change in the Turn advancement steps before Investigation progress, because none of those steps changes the [base skill](agents-spec.md#combatant-attributes), current health, or exhaustion of an Agent on an Investigation. The projected progress gain changes at once whenever a Player action changes its inputs, under [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract. A Completed or Abandoned Investigation has no projected progress gain.

No Derived value states whether the next Advance turn completes an Investigation, because that depends on the hidden Actual required progress.

# Team progress estimate

**Proposed rule:** The [Player API](../foundation/engine-contract.md#api-surfaces) query `estimateTeamProgressGain(agents)` returns, for a set of Agents given by their Instance IDs, the gain that [Progress gain](#progress-gain) would add if exactly those Agents were the working members of an Investigation: the formula of Progress gain with n the number of distinct Agents in the set and S the sum of their current [Effective skill](agents-spec.md#effective-skill). An empty set gives 0. The value is a whole number of hundredths of a progress point. The query reads no Investigation and changes no Campaign state, so it answers for a team that does not exist yet, e.g. the Agents the player is about to start an Investigation with, or an Active Investigation's Current team together with the Agents the player may add to it. It rejects a set that names an Instance ID that is not of a [Serving](agents-spec.md#agent-statuses) Agent.

The estimate takes every Agent in the set as working, whatever its Agent status and Assignment, so it leaves out the Advance turn an Agent spends [In transit](agents-spec.md#agent-statuses) before it works, under [Transit rule](agents-spec.md#transit-rule), and the exhaustion that work adds, under [Work exhaustion](agents-spec.md#work-exhaustion). It is therefore the gain per Advance turn once the team works, not the gain of the next Advance turn: for an Active Investigation whose members are all At assignment, the estimate of its Current team equals its projected progress gain, under [Projected progress gain](#projected-progress-gain), and otherwise it can be greater. E.g., with the Bootstrap `team_efficiency_exponent` 0.8, two Agents of effective skill 100 on Standby give 174, as in the table under Progress gain, while the Investigation they start has a projected progress gain of 0 until they arrive.

# Turn report

**Proposed rule:** The Turn report of an Advance turn holds the Investigations completed in it: every Investigation whose [Completion check](#completion-check) is met in that Advance turn, each by its Instance ID together with the gain its [Progress gain](#progress-gain) added in that Advance turn, in hundredths of a progress point. The Investigation's Investigation progress before that Advance turn is therefore its retained final Investigation progress minus that gain. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds the same list, unreduced. Both are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report. An Advance turn that completes no Investigation holds an empty list. Neither reveals the Actual required progress: the player already knows from the Completed lifecycle state that the final Investigation progress has reached it.

The Turn report also holds, for each Investigation that is Active when its Investigation progress step begins, in the order of the Investigations in Campaign state, its Instance ID, its Lead, the gain its Progress gain added, whether it became Assessed, whether it completed, the progress it lost to the Forced returns of that step, its Investigation progress after that step, whether it was abandoned in that step, and the Mission site its completion created, if any, each progress value in hundredths of a progress point. The History entry holds none of these, and holds the number of Active Investigations in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the Turn-end state of that Turn. All are Player-visible information, under the same rule.

# Player-visible information

**Proposed rule:** Every value below is Player-visible information under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), exactly as the table states, for every Investigation whatever its lifecycle state. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| An Investigation's Instance ID and its InvestigationArchetype, including the InvestigationArchetype's `name` | Yes |
| An Investigation's Lead and Turn started | Yes |
| An Investigation's lifecycle state | Yes |
| An Investigation's Investigation progress | Yes |
| An Investigation's Assessed | Yes |
| An Investigation's Actual required progress | No |
| An Investigation's Current team, with each member's Agent status, which [Player-visible information](agents-spec.md#player-visible-information) in Agents makes visible | Yes |
| An Active Investigation's projected progress gain | Yes |
| The Team progress estimate of any set of Serving Agents, under [Team progress estimate](#team-progress-estimate) | Yes |
| The Investigations completed in an Advance turn, each with the gain of its last Progress gain, under [Turn report](#turn-report) | Yes |
| Every property of InvestigationParameters | Yes |
| For each discovered Lead, whether it is an Assessed Lead | Yes |
| For each discovered Lead, its Required progress and its Required progress range | Yes when it is an Assessed Lead; otherwise no |
| For each discovered Lead, whether it can be investigated now under [One Active Investigation per Lead](#one-active-investigation-per-lead), with each condition that does not hold, including the Instance ID of the Lead's Active Investigation when condition 2 does not hold | Yes |

The player can therefore see whether a Lead can be investigated now and why not: whether the Lead is available, with its [Blocking conditions](leads-and-progression.md#glossary), which [Player-visible information](leads-and-progression.md#player-visible-information) in Leads and Progression makes visible, and whether it already has an Active Investigation, and which one.

The Actual required progress is hidden: the player knows only its Required progress range, once the Lead is an Assessed Lead, and learns that it has been reached when the Investigation becomes Completed. [Developer API](../foundation/engine-contract.md#api-surfaces) is the only path to it, under [Information boundary](../foundation/player-api.md#information-boundary) in Player API; no rejection, [Turn report](../foundation/campaign-state.md#glossary), or other channel of Player API reveals it. Before a Lead is an Assessed Lead, its Required progress is hidden too, although the player can infer from an Investigation that is not Assessed that the threshold has not been reached yet. That inference is permitted; it is presentation of visible values, not a reveal.

**Informative rationale:** A user interface may present Investigation progress divided by 100 next to the Required progress range, e.g. "4.49 of at least 30, up to 45" for an Investigation progress of 449 on an Assessed Lead whose Required progress is 30, and "4.49 of unknown" before. That is presentation; the stored value stays the whole number 449.

**Unknown versus absent:** The Actual required progress of every Investigation, and the Required progress and Required progress range of a discovered Lead that is not an Assessed Lead, are reported as unknown, not as absent, because the values exist. A Completed or Abandoned Investigation has an empty Current team, reported as empty, not as absent, and has no projected progress gain, reported as absent; the visible lifecycle state explains why.

# Edge cases and failure behavior

- **Team entirely In transit in its first Advance turn:** Every member of a new Investigation is In transit in the Turn-end state of the first Advance turn after `startInvestigation`, so n and S are 0, the gain is 0, and Investigation progress stays 0 ([Progress gain](#progress-gain)).
- **No working member but earlier progress:** An Active Investigation whose every remaining member is In transit, e.g. after its only working member was recalled to Standby while a newly added Agent travels to it, lost all its progress when that member left and gains none in the next Advance turn ([Progress loss](#progress-loss), [Progress gain](#progress-gain)).
- **Progress reaching or exceeding the Actual required progress:** The Investigation completes in that step; its final Investigation progress may exceed its Actual required progress × 100. No World state contains an Active Investigation with Investigation progress of at least its Actual required progress × 100 ([Completion check](#completion-check), [Investigation properties](#investigation-properties)).
- **Larger team, less per member:** Adding a working member always raises S, and never lowers the gain, but each member adds less, e.g. two members of effective skill 100 gain 174, not 200 ([Progress gain](#progress-gain)).
- **Members of effective skill 0:** Working members whose effective skill is 0 count in n but add nothing to S, so they lower the gain of the others. When every member At assignment has effective skill 0, assigning members elsewhere costs no progress, because S_before is 0 ([Progress gain](#progress-gain), [Progress loss](#progress-loss)).
- **Assessed, then losing progress:** An Assessed Investigation that falls below the assessment threshold through [Progress loss](#progress-loss) stays Assessed, and its Lead stays an Assessed Lead ([Assessment](#assessment)).
- **Repeated Investigation of an Assessed Lead:** A later Investigation of the Lead draws its own Actual required progress and starts with Assessed no, but its Lead's Required progress range is visible from the start ([Assessment](#assessment), [Player-visible information](#player-visible-information)).
- **Two Investigations of different Leads:** Each gains progress from its own working members and has its own Completion check; both may complete in one step, each creating its own Mission site ([Independence within the step](#independence-within-the-step)).
- **Agents of another Investigation:** `startInvestigation` and `assignAgentsToInvestigation` reject, as a whole, a list with an Agent on Contracting or another Investigation, or In transit. To move members from one Investigation to another, the player recalls them to Standby, which costs the first Investigation progress under Progress loss, and adds them to the other after they arrive ([Starting an Investigation](#starting-an-investigation), [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned) in Agents).
- **Restarting the Lead of an Active Investigation:** `startInvestigation` naming the Lead of an Active Investigation is rejected under [One Active Investigation per Lead](#one-active-investigation-per-lead), which is evaluated before the action's changes ([Starting an Investigation](#starting-an-investigation)).
- **Restarting an Abandoned Investigation's Lead:** A later `startInvestigation` of that Lead, when the Lead is available and has no other Active Investigation, creates a new Investigation with a new Instance ID, a new Actual required progress, and Investigation progress 0; the Abandoned Investigation keeps its final progress as a retained fact ([Abandonment](#abandonment), [Investigation creation](#investigation-creation)).
- **Adding an Agent already in the Current team:** Rejected by `assignAgentsToInvestigation`, whether the Agent is At assignment or In transit ([Assigning Agents to an Investigation](#assigning-agents-to-an-investigation)).
- **Mixed valid and invalid Agents:** One invalid Agent rejects the whole action; no Agent and no Investigation changes, and no Required progress outcome is drawn ([Starting an Investigation](#starting-an-investigation)).
- **Completion and exhaustion:** The working members of an Investigation that completes still gain their work exhaustion in the same step, after the completion, and have no Forced return, because they are already on Standby; they recover no exhaustion in the same Advance turn under [Agent Recovery](agent-recovery.md) ([Investigation progress](#investigation-progress), [Completion](#completion)).
- **Forced return of a member:** When a working member's exhaustion reaches `exhaustion_work_limit` and the Investigation does not complete in that step, the member goes back to Standby and the Investigation loses progress in proportion to its effective skill. When it was the only working member, the progress becomes 0, even when a member that arrived in the Transit step of this Advance turn remains, and the Investigation becomes Abandoned unless such a member remains in its Current team ([Progress loss](#progress-loss), [Abandonment](#abandonment)).
- **Tired Agents:** `startInvestigation` and `assignAgentsToInvestigation` reject, as a whole, a list with an Agent that is not Fit for work ([Starting an Investigation](#starting-an-investigation), [Assigning Agents to an Investigation](#assigning-agents-to-an-investigation)).
- **Lead no longer available:** An Active Investigation continues; its Mission site, when its Faction is [Eliminated](domain-model.md#factions), is Cancelled in the same Advance turn ([Lead no longer available](#lead-no-longer-available)).
- **Mission site created in the same Advance turn:** The Mission site a completion creates does not count down in Mission site expiration of the same Advance turn, under [Mission site creation](missions.md#mission-site-creation) in Missions.
- **Invalid GDRs:** A Game build with no InvestigationArchetype, two InvestigationArchetypes, an InvestigationArchetype without `name`, no InvestigationParameters, or an InvestigationParameters value out of range fails [Investigation GDR validation](#investigation-gdr-validation), and no Campaign is created from it. A World state violating an invariant under [Investigation properties](#investigation-properties), e.g. an Active Investigation with an empty Current team, is an internal invariant violation.
- **Campaign ended:** Once the Campaign has a [Campaign ending](domain-model.md#campaign-standing), `startInvestigation`, `assignAgentsToInvestigation`, and Advance turn are rejected under [Panic and Endings](panic-and-endings.md).

# Acceptance examples

All examples use the Bootstrap GDR values from `content/investigations/investigation_archetypes.yaml`, `content/investigations/investigation_parameters.yaml`, `content/leads-and-progression/leads.yaml`, `content/agents/agent_archetypes.yaml`, and `content/agents/agent_parameters.yaml`, unless an example states a test GDR. The values they read are:

| GDR | Values read |
| --- | --- |
| `standard_investigation` | `name` Investigation |
| `investigation_parameters` | `team_efficiency_exponent` 0.8; `required_progress_max_pct` 150; `assessment_threshold_pct` 25 |
| `locate_red_dawn_member` | `required_progress` 3; `create_mission_site` `apprehend_member` |
| `locate_red_dawn_safehouse` | `required_progress` 6; `create_mission_site` `raid_safehouse` |
| `locate_red_dawn_hq` | `required_progress` 10; `create_mission_site` `raid_hq` |
| `field_agent` | `base_skill` 100; `base_health` 30 |
| `agent_parameters` | `exhaustion_free_points` 30; `skill_penalty_pct_per_exhaustion` 1; `exhaustion_per_investigation_turn` 1; `exhaustion_work_start_max` 30; `exhaustion_work_limit` 70 |

So the Required progress ranges are 3 to 4, 6 to 9, and 10 to 15, and the assessment thresholds are 75, 150, and 250. "The Advance turn ending Turn t" is the Advance turn committed during Turn t. Unless stated otherwise, every Agent is a `field_agent` with base skill 100, current health 30 of 30, exhaustion 0, and effective skill 100, on Standby, At assignment, the Lead named is available under [Leads and Progression](leads-and-progression.md), and no earlier Investigation of it exists. The injected named random outcome is each new Investigation's Required progress outcome, under [Required progress range and outcome](#required-progress-range-and-outcome). Progress is given in hundredths of a progress point. Effects that other rules apply, e.g. the Mission site created, are named only to show when they apply.

## Five trained Agents on a Required progress of 30

This example exercises [Progress gain](#progress-gain) with team efficiency, [Assessment](#assessment), and [Completion check](#completion-check). It uses a test Lead L4 with `required_progress` 30, so its Required progress range is 30 to 45 and its assessment threshold is 25 × 30 = 750. Investigation i3 of L4 has Actual required progress 37, from the injected Required progress outcome, Investigation progress 0, and five working members after [Training](agents-spec.md#assignments) with effective skill 140, 130, 120, 120, and 110, so n is 5 and S is 620. The gain is 449 in every Advance turn of work, because 449^5 × 5 ≤ 620^5 < 450^5 × 5; that is round down(620 × 5^0.8 / 5) = round down(449.36…).

| Advance turn of work | Investigation progress | Assessed | Lead's Required progress shown | Result |
| --- | --- | --- | --- | --- |
| First | 449 | No | Unknown | 449 < 3700; stays Active. |
| Second | 898 | Yes | At least 30, up to 45 | 898 ≥ 750; stays Active. |
| Third to seventh | 1347 to 3143 | Yes | At least 30, up to 45 | Stays Active. |
| Eighth | 3592 | Yes | At least 30, up to 45 | 3592 < 3700; stays Active. |
| Ninth | 4041 | Yes | At least 30, up to 45 | 4041 ≥ 3700: Completed. |

Without diminishing returns the team would gain 620; with them, five members gain about 72% of that. Each member starts with exhaustion 0 and gains 1 per Advance turn of work, so no member's exhaustion passes `exhaustion_free_points` 30 and the effective skill, and so the gain, stays the same in all nine Advance turns.

## Trained and exhausted Agents

This example exercises [Progress gain](#progress-gain) with [Effective skill](agents-spec.md#effective-skill), [Investigation progress](#investigation-progress), and [Progress loss](#progress-loss) on a Forced return. Investigation i2 of `locate_red_dawn_safehouse`, with Actual required progress 8 and assessment threshold 150, has Investigation progress 0 and Current team {a5, a6}, both At assignment and both working members in every Advance turn below. a5 has base skill 100, current health 30 of 30, and exhaustion 65, having started work Fit for work and grown tired on i2: its effective skill is round down(100 × 30 × max(0, 100 − 1 × (65 − 30)) / (30 × 100)) = round down(100 × 30 × 65 / 3000) = 65. a6 has exhaustion 0 and effective skill 100.

| Advance turn | a5's exhaustion at the start of the step | a5's effective skill | S | Gain | Investigation progress | a5's exhaustion after the step |
| --- | --- | --- | --- | --- | --- | --- |
| First | 65 | 65 | 165 | 143 | 143 | 66 |
| Second | 66 | 64 | 164 | 142 | 285: Assessed | 67 |
| Third | 67 | 63 | 163 | 141 | 426 | 68 |
| Fourth | 68 | 62 | 162 | 141 | 567 | 69 |
| Fifth | 69 | 61 | 161 | 140 | 707, then 439 | 70: Forced return |

Each step reads a5's effective skill before raising its exhaustion by `exhaustion_per_investigation_turn` 1. In the fifth Advance turn, 707 is less than 800, so i2 does not complete; a5 then reaches 70, which is `exhaustion_work_limit`, and has a Forced return to Standby, In transit. Progress loss gives round down(707 × 100 / 161) = 439, because a6's effective skill 100 of the 161 stays. i2 stays Active with a6 alone, which gains 100 in each later Advance turn and completes i2 in the fourth of them, at 839. Had the Actual required progress been 7, i2 would have completed in the fifth Advance turn at 707, before a5's exhaustion rose, and a5 would have gone to Standby with the others and no Forced return. An Agent whose current health is below its base health cannot be a member at all, because such an Agent is on [Recovery](agents-spec.md#assignments) and cannot be assigned. Separately, one Agent with base skill 130 after [Training](agents-spec.md#assignments), current health 30 of 30, and exhaustion 0, alone on `locate_red_dawn_member` with Actual required progress 3, gains 130 in each Advance turn of work and completes in the third, with 390.

## A Forced return abandons an Investigation

This example exercises [Leaving an Investigation](#leaving-an-investigation), [Progress loss](#progress-loss), [Abandonment](#abandonment), and [Investigation progress](#investigation-progress), with [Forced return](agents-spec.md#forced-return) in Agents. Investigation i13 of `locate_red_dawn_hq` has Actual required progress 12, Investigation progress 300, and Current team {a1}, a1 At assignment with base skill 100, current health 30 of 30, and exhaustion 69, when an Advance turn begins. In the Investigation progress step, a1 works with effective skill `100 − (69 − 30) = 61`, so the gain is 61 and i13 reaches 361, less than 1200, and does not complete. a1 then gains 1 exhaustion, to 70, which is `exhaustion_work_limit`, so it has a Forced return: it is on Standby, In transit, and has i13 in its Participation history. Progress loss gives round down(361 × 0 / 61) = 0, and i13's Current team is empty, so i13 becomes Abandoned in the same step with Investigation progress 0. Had a2 been added to i13 in the Turn before, it would have been In transit to i13 in the Turn-end state, so i13 would have kept a2 and stayed Active, but with progress 0, because a2 was not At assignment and so carried none of it.

## A member leaves and another joins

This example exercises [Leaving an Investigation](#leaving-an-investigation), [Progress loss](#progress-loss), [Assigning Agents to an Investigation](#assigning-agents-to-an-investigation), [Progress gain](#progress-gain), [Completion](#completion), and [Projected progress gain](#projected-progress-gain). Initial state: a Mission at an `apprehend_member` Mission site targeting Red Dawn is Won, the prerequisite of `locate_red_dawn_safehouse`, so `locate_red_dawn_safehouse` is available under [Lead availability](leads-and-progression.md#lead-availability), and it has no Active Investigation. During Turn 10 the player calls `startInvestigation(locate_red_dawn_safehouse, [a1, a2])`, creating Investigation i4 with the injected Required progress outcome 6.

| Moment | Current team (Agent status) | Gain or loss | Investigation progress | Projected progress gain | Result |
| --- | --- | --- | --- | --- | --- |
| Advance turn ending Turn 10 | a1, a2 (both arrive) | Gain 0 | 0 |  | Stays Active. |
| Advance turn ending Turn 11 | a1, a2 (At assignment) | Gain 174 | 174 |  | Assessed: 174 ≥ 150. |
| Turn 12: `assignAgents([a2], Standby)` | a1 (At assignment) | Loss: round down(174 × 100 / 200) | 87 | 100 | Stays Active and Assessed. |
| Advance turn ending Turn 12 | a1 (At assignment) | Gain 100 | 187 |  | Stays Active. |
| Turn 13: `assignAgentsToInvestigation(i4, [a3])` | a1 (At assignment), a3 (In transit) | None | 187 | 100 | Stays Active. |
| Advance turn ending Turn 13 | a1 (At assignment), a3 (arrives) | Gain 100 | 287 |  | Stays Active. |
| Turn 14 | a1, a3 (At assignment) |  | 287 | 174 |  |
| Advance turn ending Turn 14 | a1, a3 (At assignment) | Gain 174 | 461 |  | Stays Active. |
| Advance turn ending Turn 15 | a1, a3 (At assignment) | Gain 174 | 635 |  | 635 ≥ 600: Completed. |

In Turn 12, a2 leaves i4 at once and takes half of the effective skill At assignment with it, so i4 keeps half of its progress; a2 is on Standby, In transit, and has i4 in its Participation history. i4 is not Abandoned, because a1 remains. In Turn 13, a3 joins without loss and does not count toward the projected progress gain, because it is In transit. In the Advance turn ending Turn 15, i4 is Completed; a Mission site from `raid_safehouse` is created; a1 and a3 both get Standby, In transit; both have i4 in their Participation history; i4's Current team is empty.

## Abandoned and started again

This example exercises [Progress loss](#progress-loss), [Abandonment](#abandonment), [Investigation lifecycle](#investigation-lifecycle), [Assessment](#assessment), [One Active Investigation per Lead](#one-active-investigation-per-lead), and [Investigation creation](#investigation-creation). Investigation i1 of `locate_red_dawn_member` is Active with Current team {a1}, a1 At assignment, Investigation progress 200, and Assessed yes, during Turn 7. Each call below is made in order during Turn 7:

| Call | Result |
| --- | --- |
| `startInvestigation(locate_red_dawn_member, [a2])` | Rejected under [One Active Investigation per Lead](#one-active-investigation-per-lead): i1 is an Active Investigation of the Lead. The Lead itself is available. |
| `assignAgents([a1], Standby)` | Succeeds. a1 is on Standby, In transit, with i1 in its Participation history. Progress loss gives round down(200 × 0 / 100) = 0. i1's Current team is empty, so i1 is Abandoned in this same Player action, with Investigation progress 0 and Assessed yes retained. |
| `assignAgentsToInvestigation(i1, [a2])` | Rejected: i1 is not Active. |
| `startInvestigation(locate_red_dawn_member, [a2])` | Succeeds: the Lead is available and no Investigation of it is Active any more. Investigation i5 is created with a new Instance ID, Turn started 7, its own Actual required progress, Investigation progress 0, and Assessed no; i1's progress is not resumed. |

No World state of Turn 7 contains i1 Active with an empty Current team. The Lead stays an Assessed Lead throughout, because i1 is Assessed, so its range 3 to 4 stays visible while i5 has no progress yet.

## Moving a member to another Investigation

This example exercises [Starting an Investigation](#starting-an-investigation), [Progress loss](#progress-loss), [Leaving an Investigation](#leaving-an-investigation), and [Assigning Agents to an Investigation](#assigning-agents-to-an-investigation). It uses two test Leads, L1 with `required_progress` 2 and L2 with `required_progress` 4, both available and without prerequisites. During Turn 30, Investigation i6 of L1 is Active with Current team {a1, a2}, both At assignment, and Investigation progress 150. Every Agent is Fit for work throughout.

- `startInvestigation(L2, [a1])` is rejected, because a1 is on i6, an Away Assignment, which it can leave only for Standby.
- Then `assignAgents([a1], Standby)` succeeds: a1 is on Standby, In transit, and has i6 in its Participation history; i6 keeps a2, stays Active, and has Investigation progress round down(150 × 100 / 200) = 75.
- Then `startInvestigation(L2, [a1])` is rejected again, because a1 is In transit and cannot be assigned.
- In the Advance turn ending Turn 30, a1 arrives on Standby. In Turn 31, `startInvestigation(L2, [a1])` succeeds: Investigation i7 of L2 is created with Current team {a1}, and a1 is on i7, In transit.
- Then `startInvestigation(L2, [a2])` is rejected, because L2 now has an Active Investigation, under [One Active Investigation per Lead](#one-active-investigation-per-lead), and because a2 is on i6; the error identifies at least one of the two failed preconditions.
- Then `assignAgentsToInvestigation(i7, [a1])` is rejected, because a1 already belongs to i7's Current team and is In transit.

## Two Investigations in one step

This example exercises [Independence within the step](#independence-within-the-step). It uses the test Leads L1 and L2 above. When the Advance turn ending Turn 40 begins, Investigation i8 of L1 has Actual required progress 2, Investigation progress 100, and working member a1 (effective skill 100), and Investigation i9 of L2 has Actual required progress 5, Investigation progress 100, and working member a2 (effective skill 100). In Investigation progress, i8 reaches 200, which is at least 200, and completes; i9 reaches 200, which is less than 500, and stays Active. Both are Assessed, because 200 is at least 25 × 2 = 50 and 25 × 4 = 100. i8 is Completed, a1 is on Standby, In transit, and L1's completion effect applies; i9 stays Active with a2 and Investigation progress 200. Processing i9 before i8 gives the same World state.

## An Investigation whose Faction is Eliminated

This example exercises [Lead no longer available](#lead-no-longer-available). It uses test GDRs: two Factions, F1 and F2, and a test Lead L3 of F1 with `required_progress` 4 whose `create_mission_site` names a test MissionSiteArchetype m3 of kind initiative. Investigation i10 of L3 has Actual required progress 4, working member a1 (effective skill 100), and Investigation progress 200 when the Advance turn ending Turn 50 begins.

- Advance turn ending Turn 50: in Investigation progress, i10 reaches 300, less than 400, and stays Active. In Mission resolution, a Won Mission makes F1 Eliminated, under [Missions](missions.md). The Campaign does not end, because F2 is not Eliminated.
- Turn 51: i10 is still Active, with Current team {a1} and projected progress gain 100. A `startInvestigation(L3, [a2])` is rejected, because L3 is not available, its Faction being Eliminated, and also because i10 is an Active Investigation of L3; the error identifies at least one of the two failed preconditions.
- Advance turn ending Turn 51: i10 reaches 400, at least 400, and is Completed; a1 is on Standby, In transit, and Mission site s3 from m3 is created Active with target Faction F1. In the Cancellation part of Mission resolution of the same Advance turn, s3 becomes Cancelled under [Cancellation](missions.md#cancellation); no World state shows s3 Active.

## Rejections

This example exercises [Starting an Investigation](#starting-an-investigation) and [Assigning Agents to an Investigation](#assigning-agents-to-an-investigation). During Turn 15: Investigation i11 is Active with Current team {a7}, a7 At assignment, and Investigation progress 100; Investigation i12 is Completed; a1 is on Contracting, At assignment; a2 is on Standby, In transit; a3 is on Recovery, [Recovering](agents-spec.md#agent-statuses); a4 is Deployed; a5 is on Standby, At assignment, with exhaustion 31; a6 is on Training, At assignment; `locate_red_dawn_safehouse` is available; and no Mission at a `raid_safehouse` Mission site is Won. Every other Agent has exhaustion at most 30. Each call is made on its own from this state, and each rejected call changes nothing and draws no Required progress outcome.

| Call | Result |
| --- | --- |
| `startInvestigation(no_such_lead, [a1])` | Rejected: no Lead GDR has that identifier. |
| `startInvestigation(locate_red_dawn_hq, [a1])` | Rejected with the same error as the row above: hq is not discovered, because no Mission at a `raid_safehouse` Mission site is Won, so the rejection does not reveal that hq exists. |
| `startInvestigation(locate_red_dawn_safehouse, [])` | Rejected: `agents` is empty. |
| `startInvestigation(locate_red_dawn_safehouse, [a1, a1])` | Rejected: a1 is listed twice. |
| `startInvestigation(locate_red_dawn_safehouse, [a1])` | Rejected: a1 is on Contracting, an Away Assignment, which it can leave only for Standby. |
| `startInvestigation(locate_red_dawn_safehouse, [a2])` | Rejected: a2 is In transit and cannot be assigned until it arrives. |
| `startInvestigation(locate_red_dawn_safehouse, [a3])` | Rejected: a3 is on Recovery. |
| `startInvestigation(locate_red_dawn_safehouse, [a5])` | Rejected: a5 is not Fit for work, because its exhaustion 31 is above 30. |
| `assignAgentsToInvestigation(i11, [a5])` | Rejected: a5 is not Fit for work. |
| `startInvestigation(locate_red_dawn_safehouse, [a4])` | Rejected: a4 is Deployed. |
| `assignAgentsToInvestigation(i12, [a1])` | Rejected: i12 is not Active. |
| `assignAgentsToInvestigation(i11, [a7])` | Rejected: a7 already belongs to i11's Current team. |
| `assignAgentsToInvestigation(i11, [a1])` | Rejected: a1 is on Contracting. |
| `startInvestigation(locate_red_dawn_safehouse, [a7])` | Rejected: a7 is on i11, an Away Assignment; i11 keeps a7 and its progress 100. |
| `assignAgentsToInvestigation(i11, [a6])` | Succeeds: a6 is on i11, In transit; i11 has Current team {a7, a6} and unchanged progress 100. |
| `startInvestigation(locate_red_dawn_safehouse, [a6])` | Succeeds: a new Investigation with Current team {a6} and its own Actual required progress; a6 is on it, In transit. |

## GDR validation

This example exercises [Investigation GDR validation](#investigation-gdr-validation). The Bootstrap GDRs pass: there is exactly one InvestigationArchetype, `standard_investigation`, whose only property besides `id` and `type` is `name` Investigation; exactly one InvestigationParameters, `investigation_parameters`, with `team_efficiency_exponent` 0.8, `required_progress_max_pct` 150, and `assessment_threshold_pct` 25; and every Lead's `required_progress`, 3, 6, and 10, meets the requirement under [Lead properties this document reads](#lead-properties-this-document-reads). Each of the following test changes independently makes the Game build defective, so no Campaign is created from it: adding a second InvestigationArchetype; removing `standard_investigation`; setting its `name` to empty text; adding a property `skill_scaling_exponent` to it; removing `investigation_parameters`; setting `team_efficiency_exponent` to 0, to 1.2, or to 0.875; setting `required_progress_max_pct` to 90; and setting `assessment_threshold_pct` to 0 or to 101. Setting `team_efficiency_exponent` to 1 is valid and removes the diminishing returns.

# TODOs

- TODO (later): Selection among several InvestigationArchetypes, under [Investigation GDR validation](#investigation-gdr-validation).
