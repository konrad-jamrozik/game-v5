# Turn Advancement

| Metadata    | Value                                                                          |
| ----------- | ------------------------------------------------------------------------------ |
| Spec ID     | TURN                                                                           |
| Family      | Mechanics                                                                      |
| Status      | Draft                                                                          |
| Audience    | Engine designer, AI designer, Implementer                                      |
| Owns        | The canonical order of Turn advancement steps and which values each step uses. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                 |

# Overview

This document defines what Advance turn does: the complete, ordered list of Turn advancement steps, which Campaign
instances each step applies to, which values each step uses, how the transit rule of Agents applies across the steps,
and how a Campaign instance created during Advance turn takes part in later steps.

It is the canonical statement of the order in which things happen during Advance turn. A Mechanics specification owns
the formulas and effects of the rules that one step applies, e.g. how much health an Agent recovers. This document owns
when each of those rules applies relative to every other rule, as stated under [Canonical order](#canonical-order).
Each step below restates in one or two sentences what its rules do and links the section that owns them, so that the
whole of Advance turn can be read in one place. It uses every Mechanics specification whose rules it orders, so it
sits above all of them; they only point to it. The examples of interactions between several game systems within one
Advance turn belong here, under [Acceptance examples](#acceptance-examples).

It does not own, e.g., that Advance turn is one atomic Player action, which
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract owns, or what
Advance turn does to the Timeline, which [Timeline entries](../foundation/timeline.md#timeline-entries) in Timeline owns.
It owns no Campaign state value and no Player action, so it states no Player-visible information of its own: only the
Committed state after Advance turn is observable, and each value in it is made Player-visible or hidden by the
specification that owns it.

# Relationships

- Uses [Agent Recovery](./agent-recovery.md)
- Uses [Agents](./agents-spec.md)
- Uses [Campaign State](../foundation/campaign-state.md)
- Uses [Combat](./combat.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Domain Model](./domain-model.md)
- Uses [Economy and Upgrades](./economy-and-upgrades.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Factions](./factions.md)
- Uses [Investigations](./investigations.md)
- Uses [Leads and Progression](./leads-and-progression.md)
- Uses [Missions](./missions.md)
- Uses [Panic and Endings](./panic-and-endings.md)

# Glossary

Campaign and Campaign state are defined by the [Core Concepts glossary](../foundation/core-concepts.md#glossary).
Campaign instance is defined by the [Campaign State glossary](../foundation/campaign-state.md#glossary). Player action,
Committed state, Turn, Turn-start state, and Turn-end state are defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). The game concepts named by the steps, e.g. Agent,
Mission site, and Mission, are defined by the [Domain Model glossary](domain-model.md#glossary). Deployed, Standby,
Contracting, Training, and Recovery are defined by the [Agents glossary](agents-spec.md#glossary); Serving and Killed are
the Agent lifecycle states under [Agent lifecycle](agents-spec.md#agent-lifecycle). Battle and Battle outcome are defined
by the [Combat glossary](combat.md#glossary). Transport cap is defined by the
[Economy and Upgrades glossary](economy-and-upgrades.md#glossary), Investigation progress by the
[Investigations glossary](investigations.md#glossary), Faction activity level by the
[Factions glossary](factions.md#glossary), and Recovery turns remaining by the
[Agent Recovery glossary](agent-recovery.md#glossary). Turn series is defined by the
[Campaign State glossary](../foundation/campaign-state.md#glossary). Panic, Pending panic change, Campaign ending, and
Ending reason are defined by the [Panic and Endings glossary](panic-and-endings.md#glossary). The Mission site states, e.g. Active and Won, are defined
under [Mission site lifecycle](missions.md#mission-site-lifecycle), and Defeated is a fact of a Faction that
[Defeat](factions.md#defeat) owns.

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
- **Restatements:** The description of each step restates rules that the owning Mechanics specification states in
  full. Where the two differ about what a rule computes or changes, rather than about when it applies, the owning
  Mechanics specification governs that content and the description is corrected.

# Turn advancement steps

**Proposed rule:** Advance turn applies the following Turn advancement steps, each exactly once, in this order. The
list is exhaustive. "At assignment" in the table has the meaning stated under
[Transit across the steps](#transit-across-the-steps). Every step applies in every Advance turn, including the one in
which the Campaign receives its Campaign ending; Advance turn itself is rejected once the Campaign has a Campaign ending,
under [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending) in Panic and Endings, so then no step
applies.

| Order | Turn advancement step   | Applies to                                                                                                                                                         | What its rules do                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | When there is nothing to apply to                                                                                                                          | Rules owned by                                                                                                  |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1     | Transit                 | Every Serving Agent that is In transit in the Turn-end state.                                                                                                      | The Agent becomes At assignment and keeps its Current assignment. Completing its transit is all it does in this Advance turn, apart from being counted in Upkeep and the destination-ends exception, under [Transit rule](agents-spec.md#transit-rule).                                                                                                                                                                                                                                                                                                                 | No Agent is In transit: nothing changes.                                                                                                                   | [Agents](agents-spec.md)                                                                                        |
| 2     | Agency income           | The Agency; every Serving Agent on Contracting that is At assignment.                                                                                              | The Agency's money rises by its funding plus `contracting_income_per_agent` for each such Agent, under [Agency income](economy-and-upgrades.md#agency-income).                                                                                                                                                                                                                                                                                                                                                                                                          | No Agent counts: money rises by funding alone, and with funding 0 it is unchanged.                                                                         | [Economy and Upgrades](economy-and-upgrades.md)                                                                 |
| 3     | Upkeep                  | The Agency; every Serving Agent, whatever its Current assignment and Task phase, including one that arrived in Transit, one on Recovery, and one that is Deployed. | The Agency's money falls by `upkeep_per_agent` for each such Agent, in full, and may become negative, under [Upkeep](economy-and-upgrades.md#upkeep).                                                                                                                                                                                                                                                                                                                                                                                                                   | No Serving Agent: upkeep is 0 and money is unchanged.                                                                                                      | [Economy and Upgrades](economy-and-upgrades.md)                                                                 |
| 4     | Training                | Every Serving Agent on Training that is At assignment.                                                                                                             | The Agent gains `training_skill_gain_per_turn` skill, under [Training growth](agents-spec.md#training-growth).                                                                                                                                                                                                                                                                                                                                                                                                                                                          | No Agent counts: nothing changes.                                                                                                                          | [Agents](agents-spec.md)                                                                                        |
| 5     | Investigation progress  | Every Investigation that is Active when the step begins, which is exactly every Investigation Active in the Turn-end state.                                        | Each gains the effective skill of its members that are At assignment as Investigation progress, then has its Investigation completion outcome. A completed Investigation becomes Completed, applies its Lead's completion effect, which creates one Initiative Mission site, and sends every member to Standby, In transit, under [Investigation progress](investigations.md#investigation-progress), [Completion effect](leads-and-progression.md#completion-effect), and [Mission site creation](missions.md#mission-site-creation).                                  | No Investigation is Active: nothing changes.                                                                                                               | [Investigations](investigations.md); [Leads and Progression](leads-and-progression.md); [Missions](missions.md) |
| 6     | Mission resolution      | Every Mission site that is Deployed when the step begins; then every Mission site that is Active.                                                                  | Each Deployed Mission site has its Battle fought, becomes Won or Lost, and applies its consequences; its Killed Agents leave play, and its survivors go to Recovery if wounded and otherwise to Standby, In transit; a Won Initiative Mission site is recorded in Lead progression, under [Mission resolution](missions.md#mission-resolution) and [Recording a Won Mission site](leads-and-progression.md#recording-a-won-mission-site). Then every Active Mission site whose target Faction is Defeated is Cancelled, under [Cancellation](missions.md#cancellation). | No Mission site is Deployed: only the cancellation part applies. No Active Mission site targets a Defeated Faction: the cancellation part changes nothing. | [Missions](missions.md); [Combat](combat.md); [Leads and Progression](leads-and-progression.md)                 |
| 7     | Mission site expiration | Every Mission site that is Active when the step begins and that already existed in the Turn-end state.                                                             | Each counts down its Turns until expiry by one; at 0 it is Expired and applies the consequences of being ignored, under [Mission site expiration](missions.md#mission-site-expiration). A Deployed Mission site never reaches this step, because its Battle was fought in step 6.                                                                                                                                                                                                                                                                                       | No Mission site qualifies: nothing changes.                                                                                                                | [Missions](missions.md)                                                                                         |
| 8     | Faction activity        | Every Faction whose Defeated is no when the step begins.                                                                                                           | Each Faction counts down to its next Faction activity level and escalates at 0, then counts down to its next operation; at 0 one Faction operation occurrence happens and creates one Response Mission site, under [Faction activity](factions.md#faction-activity), [Escalation](factions.md#escalation), [Faction operation occurrence generation](factions.md#faction-operation-occurrence-generation), and [Mission site creation](missions.md#mission-site-creation).                                                                                              | No Faction, or every Faction Defeated: nothing changes.                                                                                                    | [Factions](factions.md); [Missions](missions.md)                                                                |
| 9     | Agent recovery          | Every Serving Agent that is At assignment and whose Current assignment is Recovery or Standby when the step begins.                                                | An Agent on Recovery regains health, up to its maximum health, and becomes Standby, At assignment, at once when its health is full; an Agent on Recovery or Standby loses `exhaustion_recovery_per_turn` exhaustion, down to 0, under [Which Agents recover](agent-recovery.md#which-agents-recover), [Health recovery](agent-recovery.md#health-recovery), and [Exhaustion recovery](agent-recovery.md#exhaustion-recovery).                                                                                                                                           | No Agent counts: nothing changes.                                                                                                                          | [Agent Recovery](agent-recovery.md)                                                                             |
| 10    | Panic                   | The Campaign's Panic and the Pending panic change of this Advance turn.                                                                                            | Panic becomes `max(0, min(100, Panic + Pending panic change))`, and the Pending panic change is discarded, under [Panic step](panic-and-endings.md#panic-step) and [Pending panic change](panic-and-endings.md#pending-panic-change).                                                                                                                                                                                                                                                                                                                                   | The Pending panic change is 0: Panic is unchanged.                                                                                                         | [Panic and Endings](panic-and-endings.md)                                                                       |
| 11    | Ending check            | The Campaign.                                                                                                                                                      | The Campaign ending becomes Victory when the Campaign has at least one Faction and every Faction is Defeated; otherwise Defeat when Panic is at least `defeat_at_panic_pct` or money is below 0, with every Ending reason that holds, under [Ending check step](panic-and-endings.md#ending-check-step), [Victory](panic-and-endings.md#victory), and [Defeat](panic-and-endings.md#defeat).                                                                                                                                                                            | No condition holds: nothing changes and the Campaign continues.                                                                                            | [Panic and Endings](panic-and-endings.md)                                                                       |
| 12    | Turn close              | The Turn series and the Turn.                                                                                                                                      | Money at the end of turn records the money of the Turn-end state, Money at the start of turn records the money for the next Turn, and the turn number rises by one, so the Turn ends, under [Turn series of money](economy-and-upgrades.md#turn-series-of-money) and [Turn number](#turn-number). This step applies even when step 11 recorded a Campaign ending.                                                                                                                                                                                                       | It always applies.                                                                                                                                         | [Economy and Upgrades](economy-and-upgrades.md)                                                                 |

## Turn number

**Proposed rule:** The turn number is the number of the current [Turn](../foundation/engine-contract.md#glossary), as
a whole number of at least 1. The initial Campaign state has turn number 1, and step 12 (Turn close) raises it by 1 in
every Advance turn, so the Committed state after the Advance turn that ends Turn t has turn number t + 1. No other rule
changes the turn number. In this scope no rule creates a Report, so step 12 retains none; the facts a Report would
explain are retained as stated under [Reports](domain-model.md#reports) in Domain Model.

## Transit across the steps

**Proposed rule:** Every step applies the [Transit rule](agents-spec.md#transit-rule) of Agents, which Agents owns. The
following statements are complete, and they agree with how each owning specification states its eligibility:

1. **At assignment in a step:** Wherever the rule of a step after Transit applies to Agents that are At assignment, it
   applies to an Agent exactly when that Agent was At assignment in the Turn-end state, i.e. in the Committed state in
   which this Advance turn began, **and** is still At assignment when the step begins. The first condition excludes an
   Agent that arrived in step 1; the second excludes an Agent that became In transit in an earlier step of the same
   Advance turn, i.e. an Investigation member sent to Standby in step 5 and a survivor sent back in step 6. The
   condition on the Agent's Current assignment is read when the step begins. For steps 2 to 5 the second condition
   always holds, because no step before them makes an Agent In transit; it decides eligibility only in step 9, as
   [Which Agents recover](agent-recovery.md#which-agents-recover) states.
2. **Arrival:** An Agent that arrives in step 1 does nothing else in this Advance turn: it earns no income in step 2,
   gains no skill in step 4, adds no Investigation progress in step 5, fights no Battle in step 6, and recovers neither
   health nor exhaustion in step 9.
3. **Upkeep counts every Serving Agent:** Step 3 is not something an Agent does but a cost of the Agency, so it counts
   every Serving Agent as a Step-start value, including one that arrived in step 1, one In transit, one on Recovery, and
   one that is Deployed, under [Upkeep](economy-and-upgrades.md#upkeep).
4. **Destination ends:** When the Current assignment an Agent has just arrived at ends because of something other than
   the Agent's own work, its Current assignment still changes as the owning rule states. In scope this happens only in
   step 5: when the other members' progress completes an Investigation, a member that arrived in step 1 also goes to
   Standby, In transit, under [Completion](investigations.md#completion) in Investigations.
5. **Departure:** An Agent that becomes In transit during an Advance turn, in step 5 or step 6, is still In transit in
   the Committed state after it, and arrives in step 1 of the next Advance turn.

**Deployed Agents:** Deploying to a Mission site is the one order that does not start In transit. The `deployAgents`
Player action makes the selected Agents Deployed, At assignment, at once, under
[Deploying Agents](missions.md#deploying-agents) in Missions, so in the next Advance turn they are At assignment in the
Turn-end state and fight in step 6 of that Advance turn. Every Mission site Deployed in the Turn-end state is therefore
resolved in step 6 of the first Advance turn after the deployment, and none waits for a later one. The way back takes
transit: the survivors become In transit in step 6, are still In transit when that Advance turn ends, arrive in step 1 of
the next Advance turn, and can be ordered, or start recovering in step 9, only in the Advance turn after that one.

**Informative rationale:** With one Advance turn for every transit, an Agent given any order other than deployment
works for the first time in the second Advance turn after the order, e.g. an Agent ordered to Contracting during Turn 5
arrives in the Advance turn ending turn 5 and earns its first income in the Advance turn ending turn 6.

## Same-turn interactions

**Proposed rule:** The following statements are complete for the interactions between steps of the same Advance turn
that the owning specifications leave to this document:

- **Mission sites created during Advance turn do not count down in it:** Only Mission sites that existed in the Turn-end
  state count down in step 7. An Initiative Mission site created in step 5 did not exist in the Turn-end state, and a
  Response Mission site created in step 8 does not exist yet when step 7 applies, so neither counts down in the Advance
  turn that creates it, under [Mission site expiration](missions.md#mission-site-expiration).
- **A Mission site created for a Defeated Faction:** An Initiative Mission site created in step 5 whose target Faction
  is Defeated, already or in step 6 of the same Advance turn, is Cancelled in the cancellation part of step 6, so no
  Committed state shows it Active, under [Cancellation](missions.md#cancellation).
- **Survivors do not recover in the Advance turn of their Battle:** A survivor of step 6 is In transit at step 9 and
  recovers nothing, under [Several changes in one turn](agent-recovery.md#several-changes-in-one-turn) in Agent Recovery.
  The members of an Investigation completed in step 5 likewise recover no exhaustion in step 9.
- **An Agent Killed in step 6:** It was Serving when step 3 began, so it was counted in Upkeep of this Advance turn, and
  it is counted in no later Advance turn. It stops counting toward the Transport cap in step 6.
- **A Faction Defeated in step 6:** It neither escalates nor carries out an operation in step 8 of the same Advance
  turn, under [Faction activity](factions.md#faction-activity), and it counts toward Victory in step 11 of the same
  Advance turn, under [Victory](panic-and-endings.md#victory).
- **Funding changes affect income from the next Advance turn:** Funding changes only in steps 6 and 7, which follow step
  2, so a funding change first affects Agency income in the next Advance turn, under
  [Funding changes](economy-and-upgrades.md#funding-changes).
- **Panic changes apply once:** The Panic increases and Panic reductions of steps 6 and 7 are added to the Pending panic
  change and change Panic only in step 10, so Ending check in step 11 sees their clamped sum.
- **Turn close after a Campaign ending:** When step 11 records a Campaign ending, step 12 still applies: both Turn series
  of money are recorded and the turn number rises, so the Ending turn is one less
  than the turn number of the Committed state after that Advance turn, under
  [Recording the ending](panic-and-endings.md#recording-the-ending).

# Values a step uses

The following rules are complete:

- **Earlier steps are visible:** A Turn advancement step uses every value as it is after every earlier step of the
  same Advance turn has been applied. E.g., Mission resolution uses each Agent's skill after the Training step of
  the same Advance turn.
- **Step-start values within a step:** Every rule of one step uses Step-start values, unless this document states an
  exception for that step under [Exceptions to Step-start values](#exceptions-to-step-start-values). E.g., when two
  Agents gain skill in Training, neither gain depends on the other, whichever Agent an implementation processes first.
- **Several changes to one value:** When more than one rule changes the same value within a step, or when contributions
  of several steps combine into one change, this document states the combined result under
  [Combined results](#combined-results).
- **Campaign instances created during Advance turn:** A Campaign instance created during a step takes part in a later
  step of the same Advance turn only when this document states so for that later step, under
  [Campaign instances created during Advance turn](#campaign-instances-created-during-advance-turn).

The order in which an implementation processes the Campaign instances within one step is the implementer's choice,
because the rules above make its result the same for every order. Only the Committed state after Advance turn is
observable, under [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

## Exceptions to Step-start values

**Proposed rule:** The following list of exceptions is exhaustive. Each one keeps the result independent of the order in
which an implementation processes Campaign instances.

1. **Values of the Turn-end state:** Three rules read a value of the Turn-end state rather than a Step-start value:
   whether an Agent was At assignment, under [Transit across the steps](#transit-across-the-steps), in steps 2, 4, 5,
   and 9; whether a Mission site already existed, in step 7, under
   [Mission site expiration](missions.md#mission-site-expiration); and the money that Money at the end of turn records,
   in step 12, under [Turn series of money](economy-and-upgrades.md#turn-series-of-money).
2. **Ordered parts for one Campaign instance:** Where an owning specification states the rule of a step for one Campaign
   instance as parts applied in order, each part reads the results of the earlier parts for that same Campaign instance,
   and never the results of this step for another Campaign instance. The list of such rules is exhaustive:
   - In step 5, for one Investigation: Investigation progress gain, then the completion probability from the new
     Investigation progress, then completion, under [Investigation progress](investigations.md#investigation-progress).
   - In step 6, for one Deployed Mission site: its Battle, from the Step-start values of its Combatants, then its
     lifecycle, its Killed Agents and survivors from the health its Battle left, and its consequences, under
     [Resolving one Mission site](missions.md#resolving-one-mission-site).
   - In step 7, for one Mission site: the countdown, then expiry when it reaches 0.
   - In step 8, for one Faction: escalation, then the operation part, which uses the Faction activity level the Faction
     reached by escalating earlier in the same step, both for its `operation_level_weights` and for its
     `operation_every_turns`, under [Faction activity](factions.md#faction-activity).
   - In step 9, for one Agent: health recovery, then the move to Standby when health is full; eligibility for
     exhaustion recovery is still decided by the Current assignment when the step begins, under
     [Several changes in one turn](agent-recovery.md#several-changes-in-one-turn).
3. **Cancellation in step 6:** The cancellation part of Mission resolution reads Defeated after every Deployed Mission
   site of the step has been resolved and its consequences applied, so a Faction made Defeated by any Won Mission site of
   the step counts, under [Cancellation](missions.md#cancellation).

## Combined results

**Proposed rule:** The following combined results are complete:

- **Money:** In step 6, the money changes of all Mission sites resolved in the step add up; the sum does not depend on
  order and is never clamped, under [Consequences](missions.md#consequences). Steps 2 and 3 each make one change.
- **Funding:** The funding changes made in one step are summed and floored at 0 once, from the Step-start funding of that
  step, under [Funding changes](economy-and-upgrades.md#funding-changes). Steps 6 and 7 are separate steps, so each has
  its own sum and its own floor.
- **Panic:** Every Panic increase and Panic reduction of steps 1 to 9, which in scope come from steps 6 and 7, is added to
  the Pending panic change, and Panic changes only in step 10, by the whole sum, clamped once, under
  [Pending panic change](panic-and-endings.md#pending-panic-change).
- **Lead progression:** Several Won Mission sites in step 6 each add their own record; the result does not depend on
  order, under [Recording a Won Mission site](leads-and-progression.md#recording-a-won-mission-site).
- **Defeated:** Several Won Mission sites in step 6 that defeat the same Faction make it Defeated once, with one Defeated
  turn, under [Defeat](factions.md#defeat).
- **Created Mission sites:** Several completions in step 5 and several Faction operation occurrences in step 8 each create
  their own Mission site, a distinct Campaign instance, under [Mission site creation](missions.md#mission-site-creation).

No Agent value is changed by two rules of one step: an Agent belongs to at most one Current team, and each step's rules
for one Agent are those its owning specification states.

## Campaign instances created during Advance turn

**Proposed rule:** Mission sites and their Enemies are the only Campaign instances created during Advance turn, and the
following statements about them are complete:

- **An Initiative Mission site created in step 5** is Active from its creation. It takes part in the cancellation part of
  step 6, and in no other later step of the same Advance turn: it is not resolved in step 6, because it is not Deployed,
  and it does not count down in step 7, because it did not exist in the Turn-end state.
- **A Response Mission site created in step 8** takes part in no later step of the same Advance turn.
- **Enemies** created with a Mission site take part in no step of the Advance turn that creates them, because no Battle
  is fought at a Mission site created in that Advance turn.

# Edge cases and failure behavior

- **Campaign ended in step 11:** Step 12 still applies, and both Turn series of money are
  recorded and the turn number rises; every later Advance turn is rejected, so no step applies again
  ([Same-turn interactions](#same-turn-interactions)).
- **Victory and Defeat in the same Advance turn:** A Faction made Defeated in step 6 and a Panic or money condition that
  holds in step 11 give Victory, because Ending check tries Victory first, under
  [Ending check step](panic-and-endings.md#ending-check-step) ([Turn advancement steps](#turn-advancement-steps)).
- **Agent Killed in step 6:** It cost upkeep in step 3 of the same Advance turn and costs none from the next
  ([Same-turn interactions](#same-turn-interactions)).
- **Agent arriving in step 1:** It does nothing else in this Advance turn but is counted in Upkeep; when its Investigation
  completes in step 5 it goes to Standby, In transit, with the other members
  ([Transit across the steps](#transit-across-the-steps)).
- **Survivors of step 6:** They are In transit at step 9 and recover nothing; they arrive in the next Advance turn and
  recover from the Advance turn after it ([Same-turn interactions](#same-turn-interactions)).
- **Agent leaving Recovery in step 9:** It becomes Standby, At assignment, and no later step of the same Advance turn
  applies to it; it can be ordered in the next Turn ([Turn advancement steps](#turn-advancement-steps)).
- **Mission site created in step 5 or step 8:** It does not count down in the same Advance turn
  ([Campaign instances created during Advance turn](#campaign-instances-created-during-advance-turn)).
- **Deployed on the last Turn before expiry:** Step 6 precedes step 7, so the team fights and the Mission site is Won or
  Lost, never Expired ([Transit across the steps](#transit-across-the-steps)).
- **Money negative after step 3 and positive again after step 6:** Ending check reads money after step 6, so a Won
  Mission site's money in step 6 can prevent Defeat ([Values a step uses](#values-a-step-uses)).
- **Funding changes in steps 6 and 7 of one Advance turn:** Each step sums and floors its own changes
  ([Combined results](#combined-results)).
- **Nothing to apply to:** A Campaign with no Agent, no Investigation, no Mission site, and no Faction still applies all
  twelve steps; each does what the table states for that case, and step 12 always applies
  ([Turn advancement steps](#turn-advancement-steps)).
- **Advance turn after a Campaign ending:** Rejected; no step applies, under
  [After a Campaign ending](panic-and-endings.md#after-a-campaign-ending).

# Acceptance examples

All examples use the Bootstrap GDR values from `content/configuration/campaign_configurations.yaml`,
`content/economy-and-upgrades/economy_parameters.yaml`, `content/economy-and-upgrades/upgrades.yaml`,
`content/agents/agent_archetypes.yaml`, `content/agents/agent_parameters.yaml`,
`content/agent-recovery/recovery_parameters.yaml`, `content/leads-and-progression/leads.yaml`,
`content/missions/mission_site_archetypes.yaml`, `content/factions/faction_archetypes.yaml`,
`content/factions/faction_activity_levels.yaml`, `content/factions/faction_operation_levels.yaml`, and
`content/panic-and-endings/ending_parameters.yaml`, unless an example states otherwise. The values they read are:

| GDR                      | Values read                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `standard`               | `starting_money` 500; `starting_funding` 20                                                           |
| `economy`                | `upkeep_per_agent` 10; `contracting_income_per_agent` 30; `base_transport_cap` 4                      |
| `transport_cap`          | `effect` `transport_cap`; `increment` 2                                                               |
| `field_agent`            | `skill` 100; `health` 30                                                                              |
| `agent_parameters`       | `initial_roster_size` 4; `training_skill_gain_per_turn` 1; `exhaustion_free_points` 5                 |
| `recovery`               | `health_recovery_pct_per_turn` 2; `exhaustion_recovery_per_turn` 5                                    |
| `locate_red_dawn_member` | `difficulty` 3; `create_mission_site` `apprehend_member`                                              |
| `apprehend_member`       | `kind` initiative; `expires_in_turns` 5; `on_win` `money` 5, `funding` 0, `panic_reduction_pct` 1     |
| `raid_safehouse`         | `kind` initiative; `on_win` `money` 100, `funding` 5, `panic_reduction_pct` 2                         |
| `raid_hq`                | `kind` initiative; `on_win` `defeat_target_faction` true                                              |
| `foil_recruitment_push`  | `kind` response; `operation_level` 1; `expires_in_turns` 3                                            |
| `foil_sabotage`          | `kind` response; `operation_level` 2; `expires_in_turns` 4                                            |
| `operation_level_1`      | `on_ignored_or_lost` `panic_increase_pct` 3, `funding` 0                                              |
| `operation_level_2`      | `on_win` `money` 30, `funding` 5; `on_ignored_or_lost` `panic_increase_pct` 8, `funding` −1           |
| `red_dawn`               | `initial_activity_level` `faint`                                                                      |
| `faint`, `war`           | `operation_every_turns` [15, 25] and [8, 18]; `operation_level_weights` 1: 80, 2: 20 and 1: 20, 2: 80 |
| `endings`                | `defeat_at_panic_pct` 100                                                                             |

The Campaign has the one Faction Red Dawn, from `red_dawn`. "The Advance turn ending turn t" is the Advance turn
committed during Turn t; the Campaign starts in Turn 1. Every Agent is a `field_agent`, and no Upgrade has been acquired
unless an example says so. The injected named random outcomes are named as their owners name them: the Investigation
completion outcome under [Completion probability](investigations.md#completion-probability), the Level duration,
Operation interval, and Operation level outcomes under
[Faction random outcomes](factions.md#faction-random-outcomes), the MissionSiteArchetype selection outcome under
[MissionSiteArchetype selection](missions.md#missionsitearchetype-selection), and the hit and damage outcomes of each Battle under
[Hit outcome](combat.md#hit-outcome) and [Damage outcome](combat.md#damage-outcome). Where an example states a Battle
outcome and the values a Battle leaves, the hit and damage outcomes are injected so that Combat's rules produce exactly
those results, and the example does not repeat the Battle trace, which [Combat](combat.md) owns.

## The first two Advance turns of a Campaign

This example exercises [Turn advancement steps](#turn-advancement-steps), [Transit across the steps](#transit-across-the-steps),
and [Values a step uses](#values-a-step-uses), with [Agency income](economy-and-upgrades.md#agency-income),
[Upkeep](economy-and-upgrades.md#upkeep), [Training growth](agents-spec.md#training-growth),
[Investigation progress](investigations.md#investigation-progress), [Faction activity](factions.md#faction-activity),
[Panic step](panic-and-endings.md#panic-step), [Ending check step](panic-and-endings.md#ending-check-step), and
[Turn series of money](economy-and-upgrades.md#turn-series-of-money).

**Initial state:** A new Campaign from the preset `standard`: money 500, funding 20, Panic 0, Agents a1 to a4 on Standby,
At assignment, each with skill 100, health 30 of 30, and exhaustion 0. Red Dawn is at `faint`, with the injected initial
Level duration outcome 60 and Operation interval outcome 15. There is no Investigation and no Mission site.

**Turn 1:** The player calls `assignAgents([a1, a2], Contracting)`, `assignAgents([a3], Training)`, and
`startInvestigation(locate_red_dawn_member, [a4])`, which creates Investigation i1 with Investigation progress 0. a1 to a4
are In transit. Money is 500 when the player advances the turn.

| Step                       | Advance turn ending turn 1                                                                                                          | Money after | Advance turn ending turn 2                                                                                                                      | Money after |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1. Transit                 | a1, a2, a3, and a4 arrive and are At assignment.                                                                                    | 500         | No Agent is In transit; nothing changes.                                                                                                        | 480         |
| 2. Agency income           | No Agent on Contracting was At assignment in the Turn-end state: 20 + 30 × 0 = 20.                                                  | 520         | a1 and a2 count: 20 + 30 × 2 = 80.                                                                                                              | 560         |
| 3. Upkeep                  | All 4 Serving Agents count, including the four that have just arrived: 10 × 4 = 40.                                                 | 480         | 10 × 4 = 40.                                                                                                                                    | 520         |
| 4. Training                | a3 arrived in step 1 and gains nothing; skill 100.                                                                                  | 480         | a3 gains 1; skill 101.                                                                                                                          | 520         |
| 5. Investigation progress  | i1 has no working member, because a4 arrived in step 1: progress 0, completion probability 0, no injection needed. i1 stays Active. | 480         | a4 works with effective skill 100: progress 100, completion probability 100 / 300 = 1/3; injected outcome "does not complete". i1 stays Active. | 520         |
| 6. Mission resolution      | No Mission site exists; nothing changes.                                                                                            | 480         | Nothing changes.                                                                                                                                | 520         |
| 7. Mission site expiration | Nothing changes.                                                                                                                    | 480         | Nothing changes.                                                                                                                                | 520         |
| 8. Faction activity        | Red Dawn: Turns until the next level 60 → 59; Turns until the next operation 15 → 14; no operation.                                 | 480         | 59 → 58; 14 → 13; no operation.                                                                                                                 | 520         |
| 9. Agent recovery          | a1 to a4 were In transit in the Turn-end state; none recovers.                                                                      | 480         | None is on Standby or Recovery; none recovers.                                                                                                  | 520         |
| 10. Panic                  | The Pending panic change is 0; Panic stays 0.                                                                                       | 480         | Panic stays 0.                                                                                                                                  | 520         |
| 11. Ending check           | Red Dawn is not Defeated, Panic 0 is below 100, and money 480 is not below 0: the Campaign continues.                               | 480         | The Campaign continues.                                                                                                                         | 520         |
| 12. Turn close             | Money at the end of turn for Turn 1 is 500; Money at the start of turn for Turn 2 is 480; the turn number becomes 2.                | 480         | Money at the end of turn for Turn 2 is 480; Money at the start of turn for Turn 3 is 520; the turn number becomes 3.                            | 520         |

The Advance turn ending turn 1 does nothing but complete the four transits, apart from Agency income from funding, Upkeep,
and Faction activity, which do not depend on the Agents' work. The player makes no Player action in Turn 2; in Turn 2 the
projected income is 80, the projected upkeep is 40, and i1's projected completion probability is 1/3, each equal to what
the Advance turn ending turn 2 then applies. Both countdowns of Red Dawn are hidden from the player.

## Deployment, Battle, return, and recovery

This example exercises [Transit across the steps](#transit-across-the-steps) and
[Same-turn interactions](#same-turn-interactions), with [Deploying Agents](missions.md#deploying-agents),
[Mission resolution](missions.md#mission-resolution), [Upkeep](economy-and-upgrades.md#upkeep), and
[Which Agents recover](agent-recovery.md#which-agents-recover).

**Initial state:** During Turn 5, Mission site s1 from `apprehend_member` is Active with Turns until expiry 4, and Agents
a1 and a2 are on Standby, At assignment, with health 30 of 30 and exhaustion 0. The player calls
`deployAgents(s1, [a1, a2])`: s1 is Deployed and a1 and a2 are Deployed to s1, At assignment, at once.

| Moment                      | a1                                                                                                                                                                                                             | a2                                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Turn 5, after deployment    | Deployed, At assignment; cannot be ordered                                                                                                                                                                     | Deployed, At assignment; cannot be ordered                                                                                                     |
| Advance turn ending turn 5  | Counted in Upkeep. In step 6 the Battle outcome is Prevailed and s1 is Won; a1 ends the Battle with health 30, exhaustion 4, and becomes Standby, In transit. In step 9 it is In transit and recovers nothing. | Counted in Upkeep. In step 6 it ends the Battle with health 18, exhaustion 7, and becomes Recovery, In transit. In step 9 it recovers nothing. |
| Turn 6                      | Standby, In transit; cannot be ordered                                                                                                                                                                         | Recovery, In transit; cannot be ordered                                                                                                        |
| Advance turn ending turn 6  | Arrives in step 1; recovers nothing in step 9, because it was In transit in the Turn-end state                                                                                                                 | Arrives in step 1; recovers nothing                                                                                                            |
| Turn 7                      | Standby, At assignment; can be ordered                                                                                                                                                                         | Recovery, At assignment; cannot be ordered                                                                                                     |
| Advance turn ending turn 7  | If still on Standby: exhaustion 4 → max(0, 4 − 5) = 0                                                                                                                                                          | Health 18 + round up(2 × 30 / 100) = 19; exhaustion 7 → 2                                                                                      |
| Advance turn ending turn 8  | Exhaustion stays 0                                                                                                                                                                                             | Health 20; exhaustion 2 → 0                                                                                                                    |
| Advance turn ending turn 18 | Unaffected                                                                                                                                                                                                     | Health 30, its maximum health; becomes Standby, At assignment, at once, in step 9                                                              |
| Turn 19                     | Unaffected                                                                                                                                                                                                     | Standby, At assignment; can be ordered                                                                                                         |

In the Advance turn ending turn 5, s1's consequences add 5 to money and a Panic reduction of 1 to the Pending panic
change, and s1 is not Active in step 7, so it does not count down. a2 regains 1 health in each of the 12 Advance turns
ending turns 7 to 18, which equals its Recovery turns remaining of round up((30 − 18) / 1) = 12. Each Agent was counted
in Upkeep of every one of these Advance turns, because it stayed Serving.

## The last Faction Defeated while Panic reaches the limit

This example exercises [Turn advancement steps](#turn-advancement-steps), [Same-turn interactions](#same-turn-interactions),
[Exceptions to Step-start values](#exceptions-to-step-start-values), and [Combined results](#combined-results), with
[Mission resolution](missions.md#mission-resolution), [Cancellation](missions.md#cancellation),
[Faction activity](factions.md#faction-activity), [Panic step](panic-and-endings.md#panic-step),
[Victory](panic-and-endings.md#victory), and [Turn series of money](economy-and-upgrades.md#turn-series-of-money).

**Initial state, the Turn-end state of Turn 150:** money 1000, funding 25, Panic 95. The Agency has acquired
`transport_cap` three times, so the Transport cap is 4 + 2 × 3 = 10. Mission site s3 from `raid_hq`, created by an
Investigation of `locate_red_dawn_hq`, is Deployed with a1 to a8. Mission site s4 from `foil_sabotage`, of Faction
operation level `operation_level_2`, is Deployed with a9. Mission site s5 from `foil_recruitment_push` is Active with Turns
until expiry 1. a10, a11, and a12 are on Contracting, At assignment. Red Dawn is at `war`, not Defeated, with Turns until
the next operation 1. No Investigation is Active and no Agent is In transit.

| Step                       | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Money | Funding | Pending panic change |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------- | -------------------- |
| 1. Transit                 | Nothing changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 1000  | 25      | 0                    |
| 2. Agency income           | 25 + 30 × 3 = 115.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 1115  | 25      | 0                    |
| 3. Upkeep                  | 12 Serving Agents, including the nine Deployed: 10 × 12 = 120.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 995   | 25      | 0                    |
| 4. Training                | No Agent on Training.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 995   | 25      | 0                    |
| 5. Investigation progress  | No Investigation is Active.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 995   | 25      | 0                    |
| 6. Mission resolution      | s3's Battle outcome is Prevailed: s3 is Won, Red Dawn is made Defeated with Defeated turn 150, and the win is recorded for `locate_red_dawn_hq`; `raid_hq`'s `on_win` adds no money, funding, or Panic reduction. s4's Battle outcome is Retreated: s4 is Lost, a9 survives with health 9 and becomes Recovery, In transit, and `operation_level_2`'s `on_ignored_or_lost` adds a Panic increase of 8 and a funding change of −1: funding max(0, 25 + 0 − 1) = 24. Every survivor of s3 becomes Standby or Recovery, In transit. Then s5 is Active and Red Dawn is Defeated, so s5 is Cancelled, with no consequence. | 995   | 24      | +8                   |
| 7. Mission site expiration | No Mission site is Active: s5 was Cancelled in step 6, so it is not Expired and adds no Panic increase of 3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 995   | 24      | +8                   |
| 8. Faction activity        | Red Dawn is Defeated when the step begins, so it neither escalates nor operates; its Turns until the next operation stays 1 and no Response Mission site is created.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 995   | 24      | +8                   |
| 9. Agent recovery          | The survivors are In transit and the three Agents on Contracting do not recover.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 995   | 24      | +8                   |
| 10. Panic                  | max(0, min(100, 95 + 8)) = 100.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 995   | 24      | Discarded            |
| 11. Ending check           | The Campaign has one Faction and it is Defeated, so Victory holds; Defeat is not tried, although Panic 100 is at the limit. Campaign ending Victory, Ending reasons { Every Faction Defeated }, Ending turn 150.                                                                                                                                                                                                                                                                                                                                                                                                      | 995   | 24      | None                 |
| 12. Turn close             | Money at the end of turn for Turn 150 is 1000; Money at the start of turn for Turn 151 is 995; the turn number becomes 151.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 995   | 24      | None                 |

In Turn 151 every Player action, including `advanceTurn()`, is rejected, and queries still answer. Resolving s4 before s3
gives the same Committed state, because cancellation reads Defeated only after both resolutions.

**Variant: the raid fails.** With the same initial state, s3's Battle outcome is Retreated instead. s3 is Lost and, as an
Initiative Mission site, has no consequence; Red Dawn is not Defeated, so s5 is not Cancelled in step 6. In step 7 s5
counts down to 0 and is Expired, adding a Panic increase of 3 and a funding change of 0: funding max(0, 24 + 0) = 24. In
step 8 Red Dawn's Turns until the next operation reaches 0; with the injected Operation level outcome 2, Probability
80 / 100 at `war`, the MissionSiteArchetype selection outcome `foil_sabotage`, and the Operation interval outcome 8, it
creates a new Response Mission site s6, which does not count down. In step 10 Panic becomes max(0, min(100, 95 + 8 + 3)) = 100.
In step 11 Victory does not hold, and Panic 100 is at least 100 while money 995 is not below 0, so the Campaign ending is
Defeat with the Ending reasons { Panic at the limit } and Ending turn 150; step 12 still applies.

## Two Mission sites created in one Advance turn

This example exercises [Same-turn interactions](#same-turn-interactions) and
[Campaign instances created during Advance turn](#campaign-instances-created-during-advance-turn), with
[Mission site expiration](missions.md#mission-site-expiration), [Completion](investigations.md#completion), and
[Faction operation occurrence generation](factions.md#faction-operation-occurrence-generation).

**Initial state, the Turn-end state of Turn 30:** Panic 10 and funding 20. Investigation i2 of `locate_red_dawn_member`
has Investigation progress 200 and one member, a1, At assignment, with effective skill 100. Red Dawn is at `faint`, not
Defeated, with Turns until the next level 40 and Turns until the next operation 1. No Mission site exists.

**Advance turn ending turn 30:** In step 5, i2's progress becomes 300 and its completion probability min(1, 300 / 300) = 1,
so it is Completed with no injection needed; Mission site sA from `apprehend_member` is created, Active, with Turns until
expiry 5, and a1 becomes Standby, In transit. In step 7, sA does not count down, because it did not exist in the Turn-end
state. In step 8, Red Dawn's Turns until the next level becomes 39 and its Turns until the next operation becomes 0; with
the injected Operation level outcome 1, Probability 80 / 100 at `faint`, the MissionSiteArchetype selection outcome
`foil_recruitment_push`, Probability 1, and the Operation interval outcome 20, Probability 1 / 11, Mission site sB is
created, Active, with Turns until expiry 3 and Turn created 30. sB does not count down, because step 7 has already applied.

No team is deployed to either Mission site:

| Moment                      | Turns until expiry of sA | Turns until expiry of sB | What else happens                                                                                                    |
| --------------------------- | ------------------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Turn 31                     | 5                        | 3                        | Both can be deployed to.                                                                                             |
| Advance turn ending turn 31 | 4                        | 2                        |                                                                                                                      |
| Advance turn ending turn 32 | 3                        | 1                        |                                                                                                                      |
| Advance turn ending turn 33 | 2                        | 0: Expired               | sB adds a Panic increase of 3 and a funding change of 0: Panic max(0, min(100, 10 + 3)) = 13 in step 10; funding 20. |
| Advance turn ending turn 34 | 1                        |                          |                                                                                                                      |
| Advance turn ending turn 35 | 0: Expired               |                          | sA, an Initiative Mission site, has no consequence; `locate_red_dawn_member` is no longer blocked by it.             |

sB can be deployed to during Turns 31, 32, and 33. A team deployed during Turn 33, when its Turns until expiry is 1,
fights in step 6 of the Advance turn ending turn 33, before step 7, so sB is then Won or Lost instead of Expired.

## Money below zero, Defeat, and Turn close

This example exercises [Turn advancement steps](#turn-advancement-steps), [Same-turn interactions](#same-turn-interactions),
and [Values a step uses](#values-a-step-uses), with [Upkeep](economy-and-upgrades.md#upkeep),
[Defeat](panic-and-endings.md#defeat), and [Turn series of money](economy-and-upgrades.md#turn-series-of-money).

**Initial state, the Turn-end state of Turn 20:** money 15, funding 0, Panic 30; four Serving Agents, none on Contracting,
Training, or Recovery and none In transit; no Investigation and no Mission site; Red Dawn not Defeated, and no Faction
operation occurrence happens in this Advance turn.

| Step             | What happens                                                                                                                                                              | Money |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 2. Agency income | 0 + 30 × 0 = 0.                                                                                                                                                           | 15    |
| 3. Upkeep        | 10 × 4 = 40, paid in full.                                                                                                                                                | −25   |
| 4 to 10          | No rule changes money; Panic stays 30.                                                                                                                                    | −25   |
| 11. Ending check | Victory does not hold. Panic 30 is below 100, and money −25 is below 0, so the Campaign ending is Defeat with the Ending reasons { Money below zero } and Ending turn 20. | −25   |
| 12. Turn close   | Money at the end of turn for Turn 20 is 15, the money of the Turn-end state; Money at the start of turn for Turn 21 is −25; the turn number becomes 21.                   | −25   |

In Turn 21, `advanceTurn()` and every other Player action are rejected, and both Turn series remain readable.

- **Exactly zero:** With money 40 in the Turn-end state instead, Upkeep leaves money 0, which is not below 0, and the
  Campaign continues.
- **Money restored by a later step:** With the initial state above and Mission site s7 from `foil_sabotage` Deployed in
  the Turn-end state, money is −25 after step 3, Upkeep counting the Deployed Agents. In step 6 s7's Battle outcome is
  Prevailed, so s7 is Won and money becomes −25 + 30 = 5 and funding max(0, 0 + 5) = 5. Step 11 reads money 5, so the
  Campaign continues, and Money at the start of turn for Turn 21 is 5.

## Funding and Panic from two steps

This example exercises [Combined results](#combined-results), with [Funding changes](economy-and-upgrades.md#funding-changes),
[Consequences](missions.md#consequences), and [Pending panic change](panic-and-endings.md#pending-panic-change).

**Initial state, the Turn-end state:** funding 0 and Panic 20. Mission site s8 from `raid_safehouse` and Mission site s9
from `foil_sabotage` are Deployed. Mission site s10 from `foil_sabotage` is Active with Turns until expiry 1.

In step 6, s8's Battle outcome is Prevailed and s9's is Wiped: s8 adds money 100, a funding change of +5, and a Panic
reduction of 2; s9 adds a Panic increase of 8 and a funding change of −1. Funding becomes max(0, 0 + 5 − 1) = 4, not 5,
whichever Mission site is resolved first. In step 7, s10 is Expired and adds a Panic increase of 8 and a funding change of
−1: funding becomes max(0, 4 − 1) = 3, a separate sum and floor for step 7. The Pending panic change is
−2 + 8 + 8 = 14, and in step 10 Panic becomes max(0, min(100, 20 + 14)) = 34. Agency income of this Advance turn used
funding 0; that of the next Advance turn uses funding 3.

## Step-start values

This example exercises [Values a step uses](#values-a-step-uses). Agents a1 and a2 are on Training, At assignment, in the
Turn-end state, with skill 120 and 135. In step 4, a1 becomes 121 and a2 becomes 136. Each gain uses only that Agent's
Step-start values, so processing a2 before a1 produces the same Committed state.

## Contradiction

This example exercises [Canonical order](#canonical-order). A Mechanics specification states that Agents recover health
before Mission resolution. That contradicts the order under [Turn advancement steps](#turn-advancement-steps), so the
Mechanics specification is corrected; Agent recovery stays after Mission resolution.
