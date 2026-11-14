# Investigations

| Metadata    | Value                                                                                                                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | INVSTG                                                                                                                                                                                                                      |
| Family      | Mechanics                                                                                                                                                                                                                   |
| Status      | Draft                                                                                                                                                                                                                       |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                                                                 |
| Owns        | What an Investigation has, the InvestigationArchetype GDR, the Investigation lifecycle, the startInvestigation and assignAgentsToInvestigation actions, leaving and abandonment, and Investigation progress and completion. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                                                                              |

# Overview

This document defines what an [Investigation](domain-model.md#glossary) has and what happens to it: the Game Data
Record (GDR) Type InvestigationArchetype; the Constants and State of an Investigation; the Investigation lifecycle, in
which an Investigation is Active, Completed, or Abandoned; how an Investigation is created; the Player actions
`startInvestigation` and `assignAgentsToInvestigation`; what happens when an Agent leaves an Investigation's Current
team, including abandonment; the rule of the Turn advancement step Investigation progress, i.e. how Investigation
progress grows and the named random outcome that decides completion; which of these values are Player-visible
information; and the validation rules for the GDR Type it owns.

It refines Domain Model's Investigation contract, i.e. [Leads and Investigations](domain-model.md#leads-and-investigations),
[Current versus historical teams](domain-model.md#current-versus-historical-teams), and
[Progression facts](domain-model.md#progression-facts), with the properties, lifecycle states, transitions, and formulas
listed above.

It uses [Agents](agents-spec.md) for [Effective skill](agents-spec.md#effective-skill), for which Agents can be ordered,
for the [Transit rule](agents-spec.md#transit-rule), for the Current assignment changes it triggers, and for
[Participation history records](agents-spec.md#participation-history-records); [Leads and Progression](leads-and-progression.md)
for [Lead availability](leads-and-progression.md#lead-availability), for the Lead's `difficulty`, and for the
[Completion effect](leads-and-progression.md#completion-effect) that a completed Investigation applies; [Missions](missions.md) for [Mission site creation](missions.md#mission-site-creation), which that
completion effect triggers, and for the `deployAgents` Player action through which an Agent can leave an Investigation;
and [Numbers](../foundation/numbers.md) for [Whole-number quantities](../foundation/numbers.md#whole-number-quantities),
[Probabilities](../foundation/numbers.md#probabilities), and [Exact evaluation](../foundation/numbers.md#exact-evaluation).
Among Mechanics specifications it depends only on Domain Model, Agents, Missions, and Leads and Progression.

This document does not own, e.g.:

- Which Leads exist and when a Lead is available: [Leads and Progression](leads-and-progression.md) owns the Lead GDR,
  the [Lead difficulty](leads-and-progression.md#glossary), [Lead availability](leads-and-progression.md#lead-availability),
  and the [Completion effect](leads-and-progression.md#completion-effect) `create_mission_site`.
- What the Mission site created by a completed Investigation is and what becomes of it: [Missions](missions.md) owns it.
- The order of the Turn advancement steps: [Turn Advancement](turn-advancement.md) owns it.

The following features are out of scope and are not specified here. The list is exhaustive: it names every deferred
feature that would change a rule of this document.

- **Hidden difficulty and estimates:** every input of completion is Player-visible information, so the player sees the
  true completion probability and no estimate of it exists.
- **Diminishing returns for large teams:** progress grows linearly with the team's effective skill, so concentrating
  Agents on one Investigation is never worse than splitting them.
- **Progress lost when members leave:** an Investigation keeps all its progress when a member leaves.
- **Exhaustion from investigating:** an Investigation raises no Agent's exhaustion, under
  [Changes to attributes](agents-spec.md#changes-to-attributes) in Agents.
- **Selection among several InvestigationArchetypes:** a Game build supplies exactly one.

With them out of scope, an Investigation's progress depends only on the effective skill of its working members, and its
completion depends only on its progress and its Lead's `difficulty`.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Leads and Progression](./leads-and-progression.md)
- Uses [Missions](./missions.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Domain Model](domain-model.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

Agent, Investigation, Lead, Current assignment, Task phase, Current team, Mission site, Initiative Mission site, Mission,
and Participation history are defined by the [Domain Model glossary](domain-model.md#glossary). Skill, Effective skill,
Health, Exhaustion, Standby, Contracting, Training, Recovery, and Deployed are defined by the
[Agents glossary](agents-spec.md#glossary); the Agent lifecycle state Serving is owned by
[Agent lifecycle](agents-spec.md#agent-lifecycle). Lead difficulty, Lead availability, and Blocking condition are
defined by the [Leads and Progression glossary](leads-and-progression.md#glossary). Probability is defined by the
[Numbers glossary](../foundation/numbers.md#glossary). Campaign instance, Instance ID, Archetype, Constants, State, and
World history are defined by the [Campaign State glossary](../foundation/campaign-state.md#glossary). GDR, Game build,
Authoritative value, and Derived value are defined by the [Core Concepts glossary](../foundation/core-concepts.md#glossary).
Player-visible information, Player action, Committed state, Turn, Turn-end state, and Player API are defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). Turn advancement step and Step-start value are
defined by the [Turn Advancement glossary](turn-advancement.md#glossary).

| Term                   | Definition                                                                    |
| ---------------------- | ----------------------------------------------------------------------------- |
| Investigation progress | The work a team has done on an Investigation so far, counted in skill points. |

The Investigation states Active, Completed, and Abandoned are defined by the state table under
[Investigation lifecycle](#investigation-lifecycle).

# Investigation GDRs

This document owns the GDR Type InvestigationArchetype and states which rule reads each of its properties. It also reads
one property of the Lead GDR, which [Leads and Progression](leads-and-progression.md) owns. A rule in this document names
the property it reads and never copies a GDR value; only the [Acceptance examples](#acceptance-examples) show values.
The GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md) and the
YAML files it names.

## InvestigationArchetype

An InvestigationArchetype is the Archetype of every Investigation. The following property table is exhaustive apart
from the `id` and `type` that every GDR has.

| Property | Meaning                                        | Read by                                                   |
| -------- | ---------------------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the kind of Investigation. | [Player-visible information](#player-visible-information) |

No rule of game behavior reads an InvestigationArchetype property: every Investigation behaves the same, and what
distinguishes one Investigation from another is its Lead.

## Lead properties this document reads

This document reads exactly one property of the Lead GDR: `difficulty`, the Lead difficulty, read by
[Completion probability](#completion-probability) and [Projected completion probability](#projected-completion-probability).
Leads and Progression owns its meaning and its validation; rule 3 of [Lead GDR validation](leads-and-progression.md#lead-gdr-validation)
makes it a whole number of at least 1, so the divisor of the completion probability is never zero. The Lead's other properties, e.g.
`requires` and `on_completion`, are read only by Leads and Progression.

## InvestigationArchetype validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDR Type
this document owns. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and
the violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One InvestigationArchetype:** The Game build supplies exactly one InvestigationArchetype. Every Investigation has
   it as its Archetype, so no rule selects among InvestigationArchetypes.
2. **Known properties:** The InvestigationArchetype has `name`, and no property other than `name`, `id`, and `type`. Its
   `name` is non-empty text.

# Investigation

## Investigation properties

**Proposed rule:** An Investigation is a Campaign instance whose Archetype is the InvestigationArchetype. Its Archetype
reference is set when it is created and never changes. Its Constants and State have exactly the following properties.
This table is exhaustive.

| Property               | Part      | Value                                                                                                  | Classification and range                                                                                                                                                                                       |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lead                   | Constants | An Immutable reference to the Lead GDR the Investigation investigates.                                 | Authoritative value, under [Leads and Investigations](domain-model.md#leads-and-investigations). Always resolves to a Lead GDR the Game build supplies.                                                        |
| Turn started           | Constants | The turn number of the Turn in which the `startInvestigation` Player action created the Investigation. | Authoritative value. A whole number of at least 1.                                                                                                                                                             |
| Lifecycle              | State     | Active, Completed, or Abandoned, under [Investigation lifecycle](#investigation-lifecycle).            | Authoritative value.                                                                                                                                                                                           |
| Investigation progress | State     | The Investigation progress, in skill points.                                                           | Authoritative value. A whole number of at least 0, with no upper bound, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities). Changes only under [Progress gain](#progress-gain). |
| Current team           | State     | The set of Agents whose Current assignment references the Investigation, whatever their Task phase.    | Authoritative value. It has no order. It agrees with Current assignments under [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain Model.                             |

An Investigation also has one Derived value, which is never stored: its projected completion probability, under
[Projected completion probability](#projected-completion-probability). The Agents who took part in an Investigation
remain recorded after they leave its Current team, in each Agent's Participation history, under
[Participation history records](agents-spec.md#participation-history-records) in Agents; the past participants of an
Investigation are that same relationship seen from the Investigation's side, not a separate fact. An Investigation has no
Turn series.

**Invariants:** In every Committed state, every Investigation satisfies all of the following. A Committed state that
violates one is an internal invariant violation, reported under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. Its Current team is non-empty exactly when its lifecycle state is Active, as
   [Leads and Investigations](domain-model.md#leads-and-investigations) in Domain Model requires.
2. When it is Active, its Investigation progress is less than its Lead's `difficulty` multiplied by 100. This holds
   because a completion probability of 1 always completes the Investigation, under
   [Completion probability](#completion-probability).
3. No other Active Investigation has the same Lead, as [Leads and Investigations](domain-model.md#leads-and-investigations)
   in Domain Model requires. `startInvestigation` guarantees it, under
   [One Active Investigation per Lead](#one-active-investigation-per-lead).
4. Its Investigation progress never decreases.

**Retention:** An Investigation keeps every property above for the whole Campaign, whatever its lifecycle state, so that
every reference to it resolves, e.g. from an Agent's Participation history or from the origin of an Initiative Mission
site. A Completed or Abandoned Investigation no longer participates in current gameplay and is retained in World history
with its final values, including its final Investigation progress, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation) in Campaign State. No
Investigation is ever removed.

## Investigation creation

**Proposed rule:** An Investigation is created on exactly one occasion: a successful `startInvestigation` Player action,
under [Starting an Investigation](#starting-an-investigation). The initial Campaign state contains no Investigation, and
no Turn advancement step creates one. Each new Investigation has a fresh Instance ID under
[Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following
initial values, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in
Campaign State. This table is exhaustive.

| Value                  | Initial value                        | Source                                                                                                             |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Archetype reference    | The InvestigationArchetype.          | The one InvestigationArchetype GDR, under [InvestigationArchetype validation](#investigationarchetype-validation). |
| Lead                   | The Lead GDR identified by `lead`.   | The `lead` parameter of `startInvestigation`.                                                                      |
| Turn started           | The turn number of the current Turn. | Campaign state.                                                                                                    |
| Lifecycle              | Active.                              | This rule.                                                                                                         |
| Investigation progress | 0.                                   | This rule.                                                                                                         |
| Current team           | The Agents of `agents`.              | The `agents` parameter of `startInvestigation`.                                                                    |

No Campaign configuration value changes any initial value above. A later Investigation of the same Lead is another
Campaign instance with its own Instance ID and starts again from an Investigation progress of 0, whatever became of
earlier Investigations of that Lead.

# Investigation lifecycle

**Proposed rule:** An Investigation is in exactly one of the lifecycle states Active, Completed, and Abandoned. The set
is exhaustive. Every Investigation is Active when it is created. Completed and Abandoned are the two states of an
Investigation that is not Active under [Leads and Investigations](domain-model.md#leads-and-investigations). The
transition table is:

| Source state | Target state | Trigger                                                                                                                                                                                                   | Condition                                                                           | Effects                            |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| Active       | Completed    | Advance turn, in the Turn advancement step Investigation progress.                                                                                                                                        | The Investigation completion outcome of the Investigation is "completes".           | Under [Completion](#completion).   |
| Active       | Abandoned    | A Player action changes the Current assignment of a member of the Investigation's Current team to something else: `assignAgents`, `deployAgents`, `startInvestigation`, or `assignAgentsToInvestigation`. | The Investigation's Current team is empty after every change of that Player action. | Under [Abandonment](#abandonment). |

Every transition not listed is impossible; e.g., an Abandoned Investigation never becomes Active again, a Completed
Investigation is never Abandoned, and no Turn advancement step makes an Investigation Abandoned. Completed and Abandoned
are final.

# Starting an Investigation

**Proposed rule:** The Player action `player.actions.startInvestigation(lead, agents)` starts a new Investigation of a
Lead with a team of Agents.

| Parameter | Meaning                                                                   |
| --------- | ------------------------------------------------------------------------- |
| `lead`    | A GDR identifier, meant to identify one Lead GDR the Game build supplies. |
| `agents`  | A list of Instance IDs, each meant to identify one Agent of the Campaign. |

Preconditions owned by this document. Every precondition is evaluated in the Committed state in which the action is
requested, before any of its changes. The action is rejected, as a whole, when any of the following holds:

1. `lead` identifies no Lead GDR the Game build supplies.
2. The Lead is not available, under [Lead availability](leads-and-progression.md#lead-availability) in Leads and
   Progression.
3. The Lead already has an Active Investigation, under
   [One Active Investigation per Lead](#one-active-investigation-per-lead).
4. `agents` is empty.
5. `agents` contains the same Instance ID more than once.
6. An Instance ID in `agents` identifies no Agent of the Campaign.
7. An Agent in `agents` cannot be ordered, under [Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered)
   in Agents.

Other preconditions on every Player action, e.g. that the Campaign has no Campaign ending, are owned by
[Panic and Endings](panic-and-endings.md) and [Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at
least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation
is the implementer's choice. A rejected action changes nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract. Because every
value this document owns is Player-visible information, the error reveals nothing hidden.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same
Turn:

- A new Investigation is created under [Investigation creation](#investigation-creation), with the Lead of `lead` and the
  Agents of `agents` as its Current team.
- For every Agent in `agents`: its Current assignment becomes that new Investigation, with a Mutable reference to it, and
  its Task phase becomes In transit, under [Transit rule](agents-spec.md#transit-rule) and
  [Current assignment changes](agents-spec.md#current-assignment-changes) in Agents.
- For every Agent in `agents` whose Current assignment was another Investigation: it leaves that Investigation's Current
  team under [Leaving an Investigation](#leaving-an-investigation), which may make that Investigation Abandoned in this
  same Player action.

Nothing else changes; e.g., no money is spent, and the Agents' skill, health, and exhaustion are unchanged. The Agents
arrive in the next Advance turn and add their first Investigation progress in the Advance turn after it, under
[Transit rule](agents-spec.md#transit-rule).

## One Active Investigation per Lead

**Proposed rule:** `startInvestigation` starts an Investigation of a Lead L only when both of the following hold, in the
Committed state in which the action is requested, before any of its changes; the list is exhaustive for the Lead:

1. L is available under [Lead availability](leads-and-progression.md#lead-availability) in Leads and Progression.
2. No Investigation of L is Active.

Condition 1 is precondition 2 and condition 2 is precondition 3 of [Starting an Investigation](#starting-an-investigation).
Condition 2 belongs to this document, not to Lead availability, because it reads the Investigation lifecycle. Together
they make at most one Investigation of a Lead Active in every Committed state, as
[Leads and Investigations](domain-model.md#leads-and-investigations) in Domain Model requires. Condition 2 holds again
as soon as the Active Investigation of L becomes Completed or Abandoned. **Whether a Lead can be investigated now** is a
Derived value of each Lead, never stored: yes exactly when both conditions hold, and otherwise no, with every condition
that does not hold. It is Player-visible under [Player-visible information](#player-visible-information).

# Assigning Agents to an Investigation

**Proposed rule:** The Player action `player.actions.assignAgentsToInvestigation(investigation, agents)` adds Agents to
the Current team of an Active Investigation.

| Parameter       | Meaning                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| `investigation` | An Instance ID, meant to identify one Investigation of the Campaign.      |
| `agents`        | A list of Instance IDs, each meant to identify one Agent of the Campaign. |

Preconditions owned by this document. Every precondition is evaluated in the Committed state in which the action is
requested, before any of its changes. The action is rejected, as a whole, when any of the following holds:

1. `investigation` identifies no Investigation of the Campaign.
2. The Investigation is not Active, i.e. it is Completed or Abandoned.
3. `agents` is empty.
4. `agents` contains the same Instance ID more than once.
5. An Instance ID in `agents` identifies no Agent of the Campaign.
6. An Agent in `agents` cannot be ordered, under [Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered)
   in Agents.
7. An Agent in `agents` already belongs to the Investigation's Current team.

The Lead's availability is not a precondition: an Active Investigation accepts Agents whatever its Lead's availability,
under [Lead no longer available](#lead-no-longer-available). Other preconditions on every Player action are owned as
under [Starting an Investigation](#starting-an-investigation). Rejection is as under
[Starting an Investigation](#starting-an-investigation): all-or-nothing, with an error that identifies at least one
failed precondition, and no change.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same
Turn:

- For every Agent in `agents`: its Current assignment becomes the Investigation, with a Mutable reference to it, and its
  Task phase becomes In transit, under [Transit rule](agents-spec.md#transit-rule) and
  [Current assignment changes](agents-spec.md#current-assignment-changes) in Agents. It joins the Investigation's Current
  team.
- For every Agent in `agents` whose Current assignment was another Investigation: it leaves that Investigation's Current
  team under [Leaving an Investigation](#leaving-an-investigation), which may make that Investigation Abandoned in this
  same Player action.

Nothing else changes; in particular, the Investigation's Investigation progress is unchanged. The added Agents count in
[Progress gain](#progress-gain) from the second Advance turn after the action, under
[Transit rule](agents-spec.md#transit-rule).

# Leaving an Investigation

**Proposed rule:** An Agent leaves the Current team of an Investigation on exactly the following occasions, and this
list is exhaustive:

1. **Ordered elsewhere:** A Player action changes the Agent's Current assignment from that Investigation to something
   else. The Player actions that can do so are exactly `assignAgents` under [Assigning Agents](agents-spec.md#assigning-agents)
   in Agents, `deployAgents` under [Deploying Agents](missions.md#deploying-agents) in Missions, and the two Player actions
   of this document, each with an Agent whose Current assignment is another Investigation.
2. **Completion:** The Investigation becomes Completed, under [Completion](#completion).

No other rule removes an Agent from an Investigation's Current team: an Agent on an Investigation cannot be dismissed,
because `dismissAgents` requires Standby, and it cannot be Killed, because only a Deployed Agent can be Killed, under
[Agent lifecycle](agents-spec.md#agent-lifecycle) in Agents. Whenever an Agent leaves, the Investigation is added to its
Participation history under [Participation history records](agents-spec.md#participation-history-records) in Agents.

**Progress is kept:** When a member is ordered elsewhere, the Investigation keeps its whole Investigation progress,
whichever member leaves and however much it contributed. The remaining members continue from that progress.

## Abandonment

**Proposed rule:** When a Player action leaves an Active Investigation with an empty Current team, the Investigation
becomes Abandoned in that same Player action, after all of the action's other changes. No Committed state therefore
contains an Active Investigation with an empty Current team.

Every member of the Current team counts, whatever its Task phase. A member In transit toward the Investigation belongs to
its Current team, under [Current versus historical teams](domain-model.md#current-versus-historical-teams) in Domain
Model, and cannot be ordered, under [Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered) in Agents, so
it cannot leave. An Investigation with at least one member In transit is therefore never Abandoned. An Investigation
becomes Abandoned exactly when the Player action orders elsewhere every member that remains in its Current team.

When an Investigation becomes Abandoned:

- Its lifecycle state becomes Abandoned, which is final.
- Its Current team is empty; every former member already has the Investigation in its Participation history.
- Its Investigation progress keeps its final value as a retained fact, but no rule ever reads it again for gameplay. It
  is never resumed: a later Investigation of the same Lead is a new Investigation that starts from 0, under
  [Investigation creation](#investigation-creation).

Abandonment changes no condition of [Lead availability](leads-and-progression.md#lead-availability) in Leads and
Progression. With no Active Investigation of the Lead left, condition 2 of
[One Active Investigation per Lead](#one-active-investigation-per-lead) holds again. One Player action may make several
Investigations Abandoned, e.g. an `assignAgents` action that orders the last member of each of two Investigations to
Contracting.

# Investigation progress

**Proposed rule:** In the Turn advancement step Investigation progress, under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, every Investigation that is
Active when the step begins applies [Progress gain](#progress-gain) and then [Completion probability](#completion-probability),
and, when its Investigation completion outcome is "completes", [Completion](#completion). When no Investigation is
Active, the step does nothing. No Investigation is created during Advance turn, so the step applies to exactly the
Investigations that are Active in the Turn-end state of the Advance turn.

## Progress gain

For each Active Investigation:

```text
S                         = sum of the effective skill of every working member
Investigation progress    = Investigation progress before + S
```

Inputs:

| Symbol                        | Meaning                                                                                                                                                                                                                                                                                                                            | Unit and domain                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| working member                | A member of the Investigation's Current team that was At assignment in the Turn-end state of this Advance turn, i.e. in the Committed state in which this Advance turn began. A member that arrived in the Transit step of this Advance turn is not a working member, under [Transit rule](agents-spec.md#transit-rule) in Agents. | An Agent.                                   |
| effective skill               | The working member's [Effective skill](agents-spec.md#effective-skill), computed from its Step-start values of this step.                                                                                                                                                                                                          | Skill points; a whole number of at least 0. |
| S                             | The sum over every working member; 0 when the Investigation has no working member.                                                                                                                                                                                                                                                 | Skill points; a whole number of at least 0. |
| Investigation progress before | The Investigation's Investigation progress when the step begins.                                                                                                                                                                                                                                                                   | Skill points; a whole number of at least 0. |

No rounding occurs, because every term is a whole number. The result is a whole number of at least Investigation
progress before; Investigation progress has no upper bound. Investigation progress is added even when S is 0, in which
case it is unchanged. Investigating changes no value of a member; in particular it raises no exhaustion and lowers no
health.

## Completion probability

After [Progress gain](#progress-gain), each Active Investigation has exactly one named random outcome in this step, the
**Investigation completion** outcome. Its possible values are "completes" and "does not complete". It takes the value
"completes" with the Probability:

```text
completion probability = min(1, Investigation progress / (difficulty × 100))
```

Inputs:

| Symbol                 | Meaning                                                                                                                                                               | Unit and domain                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Investigation progress | The Investigation's Investigation progress after [Progress gain](#progress-gain) of this step.                                                                        | Skill points; a whole number of at least 0.              |
| difficulty             | The `difficulty` of the Investigation's Lead, i.e. its Lead difficulty.                                                                                               | Points of Lead difficulty; a whole number of at least 1. |
| 100                    | The skill points that count as one point of Lead difficulty: Effective skill 100 counts as 1 against Lead difficulty. It is a constant of this rule, not a GDR value. | Skill points per point of Lead difficulty.               |

Evaluation: the ratio is an exact Probability under [Probabilities](../foundation/numbers.md#probabilities) and
[Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, and it is never rounded or stored. The divisor
is at least 100, so it is never zero. The clamp `min(1, …)` is exact: when Investigation progress is equal to or greater
than difficulty × 100, the Probability is exactly 1, and the Investigation completes whatever the outcome. When
Investigation progress is 0, which happens when S is 0 and the progress before was 0, the Probability is exactly 0, and
the Investigation does not complete. Range: the Probability lies from 0 to 1, both included.

The Investigation completion outcome depends only on the Investigation's Investigation progress after this step's
[Progress gain](#progress-gain) and on its Lead's `difficulty`. It does not depend on earlier outcomes of the same
Investigation or on any other Investigation. The completion probability is therefore the conditional Probability that an
Investigation still Active completes in this Advance turn. The Probability that it completes by a given Advance turn,
i.e. the cumulative Probability, follows from these conditional Probabilities; no rule reads it and this document does
not expose it. No input of the outcome is hidden.

**Informative rationale:** Lead difficulty counts the Advance turns one working Agent of effective skill 100 needs at
most: with such an Agent, Investigation progress reaches difficulty × 100 after difficulty Advance turns of work. The
completion probability rises linearly to 1 at that point. The 100 equals the `skill` of the Bootstrap AgentArchetype only
because of the current values; nothing links them, and changing either changes how long Investigations take.

## Completion

When an Investigation's Investigation completion outcome is "completes", the following changes apply in this step, and
this list is exhaustive:

1. **Lifecycle:** The Investigation becomes Completed. Its Investigation progress keeps its value, which may exceed
   difficulty × 100, e.g. after a large team's last Advance turn of work.
2. **Completion effect:** The completion effect of its Lead applies, under
   [Completion effect](leads-and-progression.md#completion-effect) in Leads and Progression, which owns it. With the effect `create_mission_site`, this creates one Initiative Mission site whose origin is this
   Investigation, under [Mission site creation](missions.md#mission-site-creation) in Missions.
3. **Members:** Every member of the Current team, whatever it contributed, gets the Current assignment Standby and the
   Task phase In transit, under [Current assignment changes](agents-spec.md#current-assignment-changes) in Agents. This
   includes every member that arrived in the Transit step of this Advance turn and added no progress, under the
   destination-ends exception of [Transit rule](agents-spec.md#transit-rule). Every member that was In transit in the
   Turn-end state arrived in the Transit step, so every member is At assignment when this change applies. Each member
   leaves the Current team, and the Investigation is added to its Participation history under
   [Participation history records](agents-spec.md#participation-history-records). Under the
   [Transit rule](agents-spec.md#transit-rule), each member is still In transit when this Advance turn ends.
4. **Current team:** The Current team is now empty.

When the outcome is "does not complete", nothing else changes: the Investigation stays Active with its new Investigation
progress and its Current team.

## Independence within the step

Every rule of this step uses Step-start values, under [Values a step uses](turn-advancement.md#values-a-step-uses) in
Turn Advancement, and the result is the same whichever order an implementation processes the Investigations in:

- An Agent belongs to at most one Current team, so no Agent counts toward two Investigations, and the members a
  completion sends to Standby belong to no other Investigation.
- Each Investigation has its own Investigation completion outcome, which reads only that Investigation's values.
- The completion of one Investigation changes no input of another. Several Investigations may complete in one step,
  each creating its own Mission site.

# Lead no longer available

**Proposed rule:** Lead availability is checked only by precondition 2 of
[Starting an Investigation](#starting-an-investigation). Once an Investigation is Active, a later change to whether its
Lead would be available, e.g. its Faction becoming Defeated under [Defeat](factions.md#defeat) in Factions, does not change the Investigation: it
stays Active, keeps its Current team and Investigation progress, still accepts Agents under
[Assigning Agents to an Investigation](#assigning-agents-to-an-investigation), still gains progress, and can still
complete and apply its Lead's completion effect.

A Mission site created that way targets a Faction that is already Defeated. It is created Active in Investigation
progress and becomes Cancelled in the Cancellation part of Mission resolution of the same Advance turn, under
[Cancellation](missions.md#cancellation) in Missions, so no Committed state shows it Active. The player can instead end
such an Investigation by ordering its members elsewhere, which makes it Abandoned under [Abandonment](#abandonment).

**Informative rationale:** Ending such an Investigation automatically would add a second trigger of Abandoned, and a
transition during Advance turn, for a case with no gameplay effect: its Mission site is Cancelled either way.

# Projected completion probability

**Proposed rule:** Every Active Investigation has, in every Committed state, a Derived value: the completion
probability its Investigation completion outcome would have in the next Advance turn if no Player action changed the
Investigation or its members before that Advance turn.

```text
S′                                = sum of the effective skill of every member of the Current team
                                    whose Task phase is At assignment in this Committed state
projected completion probability  = min(1, (Investigation progress + S′) / (difficulty × 100))
```

Inputs: Investigation progress is the Investigation's current Investigation progress; effective skill is each member's
current [Effective skill](agents-spec.md#effective-skill) in this Committed state; difficulty and 100 are as under
[Completion probability](#completion-probability). A member In transit adds nothing to S′. Evaluation, the clamp, and the
range are as under [Completion probability](#completion-probability); the value is an exact Probability, never rounded or
stored.

When no Player action changes the Investigation or its members before the next Advance turn, the projected completion
probability equals the Probability of that Advance turn's Investigation completion outcome exactly. The members At
assignment in this Committed state are exactly the working members of that Advance turn, because this Committed state is
then its Turn-end state, and their effective skill does not change in the Turn advancement steps before Investigation
progress, because none of those steps changes the skill, health, or exhaustion of an Agent on an Investigation. The
projected completion probability changes at once whenever a Player action changes its inputs, under
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract. A Completed
or Abandoned Investigation has no projected completion probability.

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Every value is Player-visible from the moment it exists, without a reveal condition, for
every Investigation whatever its lifecycle state.

| Value                                                                                                                                                                                                                                                                | Player-visible information |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| An Investigation's Instance ID and its InvestigationArchetype, including the InvestigationArchetype's `name`                                                                                                                                                         | Yes                        |
| An Investigation's Lead and Turn started                                                                                                                                                                                                                             | Yes                        |
| An Investigation's lifecycle state                                                                                                                                                                                                                                   | Yes                        |
| An Investigation's Investigation progress                                                                                                                                                                                                                            | Yes                        |
| An Investigation's Current team, with each member's Task phase, which [Player-visible information](agents-spec.md#player-visible-information) in Agents makes visible                                                                                                | Yes                        |
| An Active Investigation's projected completion probability                                                                                                                                                                                                           | Yes                        |
| For each Lead, whether it can be investigated now under [One Active Investigation per Lead](#one-active-investigation-per-lead), with each condition that does not hold, including the Instance ID of the Lead's Active Investigation when condition 2 does not hold | Yes                        |

The player can therefore see whether a Lead can be investigated now and why not: whether the Lead is available, with
its [Blocking conditions](leads-and-progression.md#glossary), which [Player-visible information](leads-and-progression.md#player-visible-information) in Leads
and Progression makes visible, and whether it already has an Active Investigation, and which one.

The outcome of an Investigation completion is Player-visible only through the Investigation's lifecycle state after
that Advance turn: Completed when the outcome was "completes", and still Active when it was "does not complete". The
Probability of the coming Advance turn's Investigation completion outcome is Player-visible as the projected completion
probability, under [Projected completion probability](#projected-completion-probability). No record of the Probability
of a past Investigation completion outcome is retained, so Player API reports none.

The Lead's `difficulty`, which the completion probability reads, is a property of the Lead GDR, which
[Player-visible information](leads-and-progression.md#player-visible-information) in Leads and Progression makes
Player-visible. No input of the completion probability is hidden, so the player
sees the true Probability; no estimate of it is defined. Player API reports a Probability as its pair of whole numbers,
under [Probabilities](../foundation/numbers.md#probabilities) in Numbers.

**Informative rationale:** A user interface may present Investigation progress divided by 100 next to the Lead
difficulty, e.g. "2.60 of 6" for an Investigation progress of 260 on a Lead of difficulty 6. That is presentation; the
stored value stays the whole number 260.

**Unknown versus absent:** No value this document owns is hidden, so Player API never reports one as unknown. A Completed
or Abandoned Investigation has an empty Current team, reported as empty, not as absent, and has no projected completion
probability, reported as absent; the visible lifecycle state explains why.

# Edge cases and failure behavior

- **Team entirely In transit in its first Advance turn:** Every member of a new Investigation is In transit in the
  Turn-end state of the first Advance turn after `startInvestigation`, so S is 0, Investigation progress stays 0, and the
  completion probability is 0 ([Progress gain](#progress-gain), [Completion probability](#completion-probability)).
- **No working member but earlier progress:** An Active Investigation whose every remaining member is In transit, e.g.
  after its only working member was ordered elsewhere while a newly added Agent travels to it, gains no progress, but its
  completion probability is computed from its unchanged Investigation progress and may be above 0. If it completes, the
  arrived members go to Standby, In transit ([Completion probability](#completion-probability), [Completion](#completion)).
- **Progress reaching or exceeding difficulty × 100:** The completion probability is exactly 1 and the Investigation
  completes in that step; its final Investigation progress may exceed difficulty × 100. No Committed state contains an
  Active Investigation with Investigation progress of at least difficulty × 100
  ([Completion probability](#completion-probability), [Investigation properties](#investigation-properties)).
- **Two Investigations of different Leads:** Each gains progress from its own working members and has its own
  Investigation completion outcome; both may complete in one step, each creating its own Mission site
  ([Independence within the step](#independence-within-the-step)).
- **Agents taken from another Investigation by `startInvestigation`:** They leave that Investigation at once. When they
  were all of its members, it becomes Abandoned in the same Player action that creates the new Investigation
  ([Starting an Investigation](#starting-an-investigation), [Abandonment](#abandonment)).
- **Restarting the Lead of an Investigation being emptied:** `startInvestigation` naming the Lead of an Active
  Investigation is rejected, even when its `agents` are all of that Investigation's members, because
  [One Active Investigation per Lead](#one-active-investigation-per-lead) is evaluated before the action's changes
  ([Starting an Investigation](#starting-an-investigation)).
- **Restarting an Abandoned Investigation's Lead:** A later `startInvestigation` of that Lead, when the Lead is available
  and has no other Active Investigation,
  creates a new Investigation with a new Instance ID and Investigation progress 0; the Abandoned Investigation keeps its
  final progress as a retained fact ([Abandonment](#abandonment), [Investigation creation](#investigation-creation)).
- **Adding an Agent already in the Current team:** Rejected by `assignAgentsToInvestigation`, whether the Agent is At
  assignment or In transit ([Assigning Agents to an Investigation](#assigning-agents-to-an-investigation)).
- **Moving Agents between two Investigations:** `assignAgentsToInvestigation` with members of another Investigation
  moves them; the other Investigation keeps its progress and becomes Abandoned when they were all of its members
  ([Assigning Agents to an Investigation](#assigning-agents-to-an-investigation), [Abandonment](#abandonment)).
- **Mixed valid and invalid Agents:** One invalid Agent rejects the whole action; no Agent and no Investigation changes
  ([Starting an Investigation](#starting-an-investigation)).
- **Completion and exhaustion:** Investigating raises no exhaustion, so completion never coincides with an exhaustion
  change; members returning to Standby, In transit, recover no exhaustion in the same Advance turn under
  [Agent Recovery](agent-recovery.md) ([Progress gain](#progress-gain), [Completion](#completion)).
- **Lead no longer available:** An Active Investigation continues; its Mission site, when its Faction is Defeated, is
  Cancelled in the same Advance turn ([Lead no longer available](#lead-no-longer-available)).
- **Mission site created in the same Advance turn:** The Mission site a completion creates does not count down in Mission
  site expiration of the same Advance turn, under [Mission site creation](missions.md#mission-site-creation) in Missions.
- **Invalid GDRs:** A Game build with no InvestigationArchetype, two InvestigationArchetypes, or an
  InvestigationArchetype without `name` fails [InvestigationArchetype validation](#investigationarchetype-validation),
  and no Campaign is created from it. A Committed state violating an invariant under
  [Investigation properties](#investigation-properties), e.g. an Active Investigation with an empty Current team, is an
  internal invariant violation.
- **Campaign ended:** Once the Campaign has a Campaign ending, `startInvestigation`, `assignAgentsToInvestigation`, and
  Advance turn are rejected; [Panic and Endings](panic-and-endings.md) owns that rejection.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/investigations/investigation_archetypes.yaml`,
`content/leads-and-progression/leads.yaml`, `content/agents/agent_archetypes.yaml`, and
`content/agents/agent_parameters.yaml`, unless an example states a test GDR. The values they read are:

| GDR                         | Values read                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| `standard_investigation`    | `name` Investigation                                             |
| `locate_red_dawn_member`    | `difficulty` 3; `create_mission_site` `apprehend_member`         |
| `locate_red_dawn_safehouse` | `difficulty` 6; `create_mission_site` `raid_safehouse`           |
| `locate_red_dawn_hq`        | `difficulty` 10; `create_mission_site` `raid_hq`                 |
| `field_agent`               | `skill` 100; `health` 30                                         |
| `agent_parameters`          | `exhaustion_free_points` 5; `skill_penalty_pct_per_exhaustion` 1 |

"The Advance turn ending turn t" is the Advance turn committed during Turn t. Unless stated otherwise, every Agent is a
`field_agent` with skill 100, health 30 of 30, exhaustion 0, and effective skill 100, on Standby, At assignment, and the
Lead named is available under [Leads and Progression](leads-and-progression.md). The injected named random outcome is
each Investigation's Investigation completion outcome, under [Completion probability](#completion-probability); a row
with a completion probability of 0 or 1 needs no injection, because its outcome is certain. Effects owned by other
specifications, e.g. the Mission site created, are named only to show when they apply.

## One Agent on a difficulty 3 Lead

This example exercises [Starting an Investigation](#starting-an-investigation),
[Investigation creation](#investigation-creation), [Progress gain](#progress-gain),
[Completion probability](#completion-probability), [Completion](#completion), and
[Projected completion probability](#projected-completion-probability). During Turn 1 the player calls
`startInvestigation(locate_red_dawn_member, [a1])`. Investigation i1 is created with Archetype `standard_investigation`,
Lead `locate_red_dawn_member`, Turn started 1, lifecycle Active, Investigation progress 0, and Current team {a1}; a1 is on
i1, In transit.

| Moment                     | Working members | S   | Investigation progress | Completion probability     | Injected outcome  | Result                                                                                    |
| -------------------------- | --------------- | --- | ---------------------- | -------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| Turn 1, after the action   |                 |     | 0                      | Projected: 0 / 300 = 0     |                   | a1 is In transit, so S′ is 0.                                                             |
| Advance turn ending turn 1 | None            | 0   | 0                      | min(1, 0 / 300) = 0        | None needed       | a1 arrives in Transit and adds nothing. i1 stays Active.                                  |
| Turn 2                     |                 |     | 0                      | Projected: 100 / 300 = 1/3 |                   | a1 is At assignment, so S′ is 100.                                                        |
| Advance turn ending turn 2 | a1              | 100 | 100                    | 100 / 300 = 1/3            | Does not complete | i1 stays Active.                                                                          |
| Advance turn ending turn 3 | a1              | 100 | 200                    | 200 / 300 = 2/3            | Does not complete | i1 stays Active.                                                                          |
| Advance turn ending turn 4 | a1              | 100 | 300                    | min(1, 300 / 300) = 1      | None needed       | i1 is Completed. Mission site from `apprehend_member` created; a1 on Standby, In transit. |

After the Advance turn ending turn 4, i1 has an empty Current team and Investigation progress 300, a1 has i1 in its
Participation history, and a1 cannot be ordered during Turn 5; it arrives in the Advance turn ending turn 5. Had the
injected outcome of the Advance turn ending turn 2 been "completes", i1 would have been Completed then, with
Investigation progress 100. The cumulative Probability that i1 completes by the Advance turn ending turn 3 is
1/3 + (2/3 × 2/3) = 7/9, and by the Advance turn ending turn 4 it is 1; no rule reads it. a1's exhaustion stays 0
throughout.

## Four Agents on a difficulty 10 Lead

This example exercises [Progress gain](#progress-gain), [Completion probability](#completion-probability), and
[Completion](#completion), including the clamp. During Turn 20 the player calls
`startInvestigation(locate_red_dawn_hq, [a1, a2, a3, a4])`, creating Investigation i3.

| Moment                      | S   | Investigation progress | Completion probability                | Injected outcome  | Result                                                                                                                  |
| --------------------------- | --- | ---------------------- | ------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Advance turn ending turn 20 | 0   | 0                      | 0                                     | None needed       | All four arrive in Transit. i3 stays Active.                                                                            |
| Advance turn ending turn 21 | 400 | 400                    | 400 / 1000 = 2/5                      | Does not complete | i3 stays Active.                                                                                                        |
| Advance turn ending turn 22 | 400 | 800                    | 800 / 1000 = 4/5                      | Does not complete | i3 stays Active.                                                                                                        |
| Advance turn ending turn 23 | 400 | 1200                   | min(1, 1200 / 1000) = min(1, 6/5) = 1 | None needed       | i3 is Completed with Investigation progress 1200. Mission site from `raid_hq` created; all four on Standby, In transit. |

The final Investigation progress 1200 exceeds `difficulty` × 100 = 1000, which is valid for a Completed Investigation.

## Trained and exhausted Agents

This example exercises [Progress gain](#progress-gain) with [Effective skill](agents-spec.md#effective-skill) and
[Completion probability](#completion-probability). Investigation i2 of `locate_red_dawn_safehouse`, difficulty 6, has
Investigation progress 0 and Current team {a5, a6}, both At assignment and both working members in every Advance turn
below. a5 has skill 100, health 30 of 30, and exhaustion 65: its effective skill is
round down(100 × 30 × max(0, 100 − 1 × (65 − 5)) / (30 × 100)) = round down(100 × 30 × 40 / 3000) = 40. a6 is a fresh
Agent with effective skill 100. S is 140.

| Advance turn | Investigation progress | Completion probability | Injected outcome  |
| ------------ | ---------------------- | ---------------------- | ----------------- |
| First        | 140                    | 140 / 600 = 7/30       | Does not complete |
| Second       | 280                    | 280 / 600 = 7/15       | Does not complete |
| Third        | 420                    | 420 / 600 = 7/10       | Does not complete |
| Fourth       | 560                    | 560 / 600 = 14/15      | Does not complete |
| Fifth        | 700                    | min(1, 700 / 600) = 1  | None needed       |

a5's exhaustion stays 65 throughout, because investigating neither raises nor lowers exhaustion, so its effective skill
stays 40. A wounded Agent cannot be a member at all, because an Agent below its maximum health is on Recovery and cannot
be ordered. Separately, one Agent with skill 130 after Training, health 30 of 30, and exhaustion 0, alone on a
difficulty 3 Lead, adds 130 per Advance turn of work, giving the completion probabilities 130 / 300 = 13/30, then
260 / 300 = 13/15, then min(1, 390 / 300) = 1.

## A member leaves and another joins

This example exercises [Leaving an Investigation](#leaving-an-investigation),
[Assigning Agents to an Investigation](#assigning-agents-to-an-investigation), [Progress gain](#progress-gain),
[Completion](#completion), and [Projected completion probability](#projected-completion-probability). Initial state:
Lead progression records a Won Mission site created by `locate_red_dawn_member`, the prerequisite of
`locate_red_dawn_safehouse`, so `locate_red_dawn_safehouse` is available under
[Lead availability](leads-and-progression.md#lead-availability), and it has no Active Investigation. During Turn 10 the
player calls `startInvestigation(locate_red_dawn_safehouse, [a1, a2])`, creating Investigation i4 (difficulty 6).

| Moment                                           | Current team (Task phase)           | S   | Investigation progress | Completion probability     | Injected outcome  |
| ------------------------------------------------ | ----------------------------------- | --- | ---------------------- | -------------------------- | ----------------- |
| Advance turn ending turn 10                      | a1, a2 (both arrive)                | 0   | 0                      | 0                          | None needed       |
| Advance turn ending turn 11                      | a1, a2 (At assignment)              | 200 | 200                    | 200 / 600 = 1/3            | Does not complete |
| Turn 12: `assignAgents([a2], Contracting)`       | a1 (At assignment)                  |     | 200                    | Projected: 300 / 600 = 1/2 |                   |
| Advance turn ending turn 12                      | a1 (At assignment)                  | 100 | 300                    | 300 / 600 = 1/2            | Does not complete |
| Turn 13: `assignAgentsToInvestigation(i4, [a3])` | a1 (At assignment), a3 (In transit) |     | 300                    | Projected: 400 / 600 = 2/3 |                   |
| Advance turn ending turn 13                      | a1 (At assignment), a3 (arrives)    | 100 | 400                    | 400 / 600 = 2/3            | Completes         |

In Turn 12, a2 leaves i4 at once and i4 keeps its Investigation progress of 200; a2 is on Contracting, In transit, and
has i4 in its Participation history. i4 is not Abandoned, because a1 remains. In Turn 13, a3 does not count toward the
projected completion probability, because it is In transit. In the Advance turn ending turn 13, a3 arrives and adds
nothing, so S is a1's 100 alone. i4 is Completed; a Mission site from `raid_safehouse` is created; a1 and a3 both get
Standby, In transit, including a3, which added no progress; both have i4 in their Participation history; i4's Current
team is empty.

## Abandoned and started again

This example exercises [Abandonment](#abandonment), [Investigation lifecycle](#investigation-lifecycle),
[One Active Investigation per Lead](#one-active-investigation-per-lead), and
[Investigation creation](#investigation-creation). Investigation i1 of `locate_red_dawn_member` is Active with Current
team {a1}, a1 At assignment, and Investigation progress 200, during Turn 7. Each call below is made in order during
Turn 7:

| Call                                               | Result                                                                                                                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `startInvestigation(locate_red_dawn_member, [a2])` | Rejected under [One Active Investigation per Lead](#one-active-investigation-per-lead): i1 is an Active Investigation of the Lead. The Lead itself is available.                                               |
| `assignAgents([a1], Standby)`                      | Succeeds. a1 is on Standby, In transit, with i1 in its Participation history. i1's Current team is empty, so i1 is Abandoned in this same Player action, with Investigation progress 200 retained.             |
| `assignAgentsToInvestigation(i1, [a2])`            | Rejected: i1 is not Active.                                                                                                                                                                                    |
| `startInvestigation(locate_red_dawn_member, [a2])` | Succeeds: the Lead is available and no Investigation of it is Active any more. Investigation i5 is created with a new Instance ID, Turn started 7, and Investigation progress 0; i1's progress is not resumed. |

No Committed state of Turn 7 contains i1 Active with an empty Current team.

## Agents taken from another Investigation

This example exercises [Starting an Investigation](#starting-an-investigation), [Abandonment](#abandonment), and
[Assigning Agents to an Investigation](#assigning-agents-to-an-investigation). It uses two test Leads, L1 with
`difficulty` 2 and L2 with `difficulty` 4, both available and without prerequisites. During Turn 30, Investigation i6 of
L1 is Active with Current team {a1, a2}, both At assignment, and Investigation progress 200.

- `startInvestigation(L2, [a1])` succeeds: Investigation i7 of L2 is created with Current team {a1}; a1 is on i7, In
  transit, and has i6 in its Participation history; i6 keeps a2 and its Investigation progress 200 and stays Active.
- Then `startInvestigation(L2, [a2])` is rejected under
  [One Active Investigation per Lead](#one-active-investigation-per-lead), because L2 now has an Active Investigation,
  although L2 is still available.
- Then `assignAgentsToInvestigation(i7, [a2])` succeeds: a2 joins i7, In transit. i6's Current team is now empty, so i6
  becomes Abandoned in that same Player action, with Investigation progress 200 retained. i7 has Current team {a1, a2},
  both In transit, and Investigation progress 0.
- Then `assignAgentsToInvestigation(i7, [a1])` is rejected, because a1 already belongs to i7's Current team (and is In
  transit).

## Two Investigations in one step

This example exercises [Independence within the step](#independence-within-the-step). It uses the test Leads L1 and L2
above. When the Advance turn ending turn 40 begins, Investigation i8 of L1 has Investigation progress 100 and working
member a1 (effective skill 100), and Investigation i9 of L2 has Investigation progress 100 and working member a2
(effective skill 100). In Investigation progress, i8 reaches 200 with completion probability min(1, 200 / 200) = 1 and
completes; i9 reaches 200 with completion probability 200 / 400 = 1/2, and its injected outcome is "does not complete".
i8 is Completed, a1 is on Standby, In transit, and L1's completion effect applies; i9 stays Active with a2 and
Investigation progress 200. Processing i9 before i8 gives the same Committed state.

## An Investigation whose Faction is Defeated

This example exercises [Lead no longer available](#lead-no-longer-available). It uses test GDRs: two Factions, F1 and
F2, and a test Lead L3 of F1 with `difficulty` 4 whose `create_mission_site` names a test MissionSiteArchetype m3 of
kind initiative. Investigation i10 of L3 has working member a1 (effective skill 100) and Investigation progress 100 when the Advance
turn ending turn 50 begins.

- Advance turn ending turn 50: in Investigation progress, i10 reaches 200, completion probability 200 / 400 = 1/2,
  injected outcome "does not complete". In Mission resolution, a Won Mission site makes F1 Defeated, under
  [Missions](missions.md). The Campaign does not end, because F2 is not Defeated.
- Turn 51: i10 is still Active, with Current team {a1} and projected completion probability (200 + 100) / 400 = 3/4. A
  `startInvestigation(L3, [a2])` is rejected, because L3 is not available, its Faction being Defeated, and also because
  i10 is an Active Investigation of L3; the error identifies at least one of the two failed preconditions.
- Advance turn ending turn 51: i10 reaches 300, completion probability 300 / 400 = 3/4, injected outcome "completes".
  i10 is Completed, a1 is on Standby, In transit, and Mission site s3 from m3 is created Active with target Faction F1.
  In the Cancellation part of Mission resolution of the same Advance turn, s3 becomes Cancelled under
  [Cancellation](missions.md#cancellation); no Committed state shows s3 Active.

## Rejections

This example exercises [Starting an Investigation](#starting-an-investigation) and
[Assigning Agents to an Investigation](#assigning-agents-to-an-investigation). During Turn 15: Investigation i11 is Active
with Current team {a7}, a7 At assignment; Investigation i12 is Completed; a1 is on Contracting, At assignment; a2 is on
Standby, In transit; a3 is on Recovery, At assignment; a4 is Deployed; and `locate_red_dawn_safehouse` is available. Each
call is made on its own from this state, and each rejected call changes nothing.

| Call                                                      | Result                                                                                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `startInvestigation(no_such_lead, [a1])`                  | Rejected: no Lead GDR has that identifier.                                                                                              |
| `startInvestigation(locate_red_dawn_safehouse, [])`       | Rejected: `agents` is empty.                                                                                                            |
| `startInvestigation(locate_red_dawn_safehouse, [a1, a1])` | Rejected: a1 is listed twice.                                                                                                           |
| `startInvestigation(locate_red_dawn_safehouse, [a1, a2])` | Rejected as a whole: a2 is In transit. a1 stays on Contracting, At assignment.                                                          |
| `startInvestigation(locate_red_dawn_safehouse, [a3])`     | Rejected: a3 is on Recovery.                                                                                                            |
| `startInvestigation(locate_red_dawn_safehouse, [a4])`     | Rejected: a4 is Deployed.                                                                                                               |
| `assignAgentsToInvestigation(i12, [a1])`                  | Rejected: i12 is not Active.                                                                                                            |
| `assignAgentsToInvestigation(i11, [a7])`                  | Rejected: a7 already belongs to i11's Current team.                                                                                     |
| `assignAgentsToInvestigation(i11, [a1])`                  | Succeeds: a1 is on i11, In transit; i11 has Current team {a7, a1} and unchanged progress.                                               |
| `startInvestigation(locate_red_dawn_safehouse, [a1, a7])` | Succeeds: a new Investigation with Current team {a1, a7}; i11 loses its only member a7 and becomes Abandoned in the same Player action. |

## GDR validation

This example exercises [InvestigationArchetype validation](#investigationarchetype-validation). The Bootstrap GDRs pass:
there is exactly one InvestigationArchetype, `standard_investigation`, whose only property besides `id` and `type` is
`name` Investigation, and every Lead's `difficulty`, 3, 6, and 10, meets the requirement under
[Lead properties this document reads](#lead-properties-this-document-reads). Each of the
following test changes independently makes the Game build defective, so no Campaign is created from it: adding a second
InvestigationArchetype; removing `standard_investigation`; setting its `name` to empty text; and adding a property
`skill_scaling_exponent` to it.
