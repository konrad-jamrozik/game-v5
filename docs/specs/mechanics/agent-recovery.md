# Agent Recovery

| Metadata    | Value                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | RECOVER                                                                                                                                                       |
| Family      | Mechanics                                                                                                                                                     |
| Status      | Draft                                                                                                                                                         |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                   |
| Owns        | Health recovery and exhaustion recovery of Agents, the RecoveryParameters GDR, and the result when several rules change one of those values in the same turn. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                |

# Overview

This document defines how an [Agent's](domain-model.md#glossary) health goes up and its exhaustion goes down: the
amount recovered in each Advance turn, which Agents recover, when Recovery ends, what an Agent on Recovery can do, and
the result when several rules change one of those values in the same Advance turn. It also owns the Game Data Record
(GDR) Type RecoveryParameters, the two Derived values that tell the player how fast an Agent recovers, and the
validation rules for that GDR.

It refines Agents' contract for health and exhaustion, i.e. [Attribute ranges](agents-spec.md#attribute-ranges),
[Changes to attributes](agents-spec.md#changes-to-attributes), and
[Current assignment changes](agents-spec.md#current-assignment-changes), with the rules that raise health, that lower
exhaustion, and that move an Agent from Recovery to Standby. The meaning and bounds of health and exhaustion, the
[Transit rule](agents-spec.md#transit-rule), and which Agents can be ordered belong to [Agents](agents-spec.md). This
document applies its rules in the Agent recovery step under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps), the position of which [Turn Advancement](turn-advancement.md)
owns. [Numbers](../foundation/numbers.md) supplies Round up and the Percent value. [Missions](missions.md) owns when a
surviving Agent is sent to Recovery, i.e. the Agent recovery step only ever finds an Agent already on Recovery.

This document does not own, e.g.:

- How a Battle lowers health and raises exhaustion: [Combat](combat.md) owns both.
- Sending an Agent to Recovery after a Battle: [Missions](missions.md) owns it.
- Ordering an Agent: [Agents](agents-spec.md) owns the `assignAgents` Player action and the list of Agents that can be
  ordered.

This document owns no Player action. The player does not start, change, or end Recovery; it begins and ends by the rules
below alone.

The following features are out of scope and are not specified here: recovery that depends on the kind of damage an Agent
took, faster recovery from an Upgrade, and exhaustion that an Agent gains from its work. This list is exhaustive. The Bootstrap GDRs have no
Upgrade that changes either recovery rate, so with these features out of scope both rates are constants of the Game
build, and recovery never depends on how an Agent was hurt.

# Relationships

- Uses [Combat](./combat.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Missions](./missions.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Agents](./agents-spec.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

Health, Maximum health, Exhaustion, Standby, and Recovery are defined by the [Agents glossary](agents-spec.md#glossary).
Agent, Current assignment, and Task phase are defined by the [Domain Model glossary](domain-model.md#glossary).
Derived value and GDR are defined by the [Core Concepts glossary](../foundation/core-concepts.md#glossary).
Player-visible information is defined by the [Engine Contract glossary](../foundation/engine-contract.md#glossary).
Round up and Percent value are defined by the [Numbers glossary](../foundation/numbers.md#glossary). Turn advancement
step is defined by the [Turn Advancement glossary](turn-advancement.md#glossary).

| Term                     | Definition                                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health recovery rate     | The health, as a whole number, that one Agent regains in each Advance turn in which it recovers; it depends on the Agent's Maximum health.                                               |
| Recovery turns remaining | The number of further Advance turns in which an Agent on Recovery will regain health before its health is full, counted from the first Advance turn in which the Agent is At assignment. |

# Recovery parameters

This document owns the GDR Type RecoveryParameters and states which rule reads each property. A rule here names the
property it reads and never copies a GDR value; only the [Acceptance examples](#acceptance-examples) show values. The
GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md) and the YAML
files it names.

RecoveryParameters bundles the two recovery rates. The following property table is exhaustive apart from the `id` and
`type` that every GDR has.

| Property                       | Meaning                                                                                                 | Read by                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `health_recovery_pct_per_turn` | A Percent value: the percent of an Agent's Maximum health that its health rises by in one Advance turn. | [Health recovery](#health-recovery)         |
| `exhaustion_recovery_per_turn` | The exhaustion an Agent loses in one Advance turn.                                                      | [Exhaustion recovery](#exhaustion-recovery) |

## Recovery GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDRs
this document owns. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and
the violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One RecoveryParameters:** The Game build supplies exactly one RecoveryParameters GDR.
2. **Exact properties:** The RecoveryParameters GDR has exactly the properties its table above lists, apart from `id` and
   `type`: no listed property is missing and no other property is present.
3. **Health recovery always progresses:** `health_recovery_pct_per_turn` is a whole number of at least 1. Because the
   Health recovery rate is rounded up, any positive percentage gives a Health recovery rate of at least 1 for every
   Maximum health of at least 1, so an Agent on Recovery always gains health in every Advance turn in which it recovers
   and its Recovery ends after a finite number of Advance turns. A percentage of 0 is invalid because an Agent would
   stay on Recovery forever. A percentage above 100 is valid; the clamp under [Health recovery](#health-recovery) then
   ends Recovery in one Advance turn.
4. **Exhaustion recovery is a whole number:** `exhaustion_recovery_per_turn` is a whole number of at least 0. A value of
   0 is valid and means that exhaustion never falls.

# Which Agents recover

**Proposed rule:** In the Agent recovery step of every Advance turn, the recovery rules below apply to an Agent exactly
when all of the following hold:

1. It is Serving.
2. Its Task phase is At assignment in the Turn-end state, i.e. in the Committed state in which this Advance turn began.
3. Its Task phase is At assignment at the start of the Agent recovery step.
4. Its Current assignment at the start of the Agent recovery step is the Current assignment the rule names.

Statements 2 and 3 are both needed: statement 2 excludes an Agent that arrived in the Transit step of this Advance turn,
and statement 3 excludes an Agent that became In transit in an earlier step of this Advance turn, e.g. a Mission survivor
or the team of an Investigation that completed. Together they apply the
[Transit rule](agents-spec.md#transit-rule): an Agent that is In transit when the Advance turn begins, and an Agent that
becomes In transit during it, recover nothing in this Advance turn. A Deployed Agent is never on Standby or Recovery, so
it does not recover. Contracting, Training, and an Investigation do not recover health or exhaustion either, and neither
does a Killed or Dismissed Agent.

| Current assignment at step start | Health recovers | Exhaustion recovers |
| -------------------------------- | --------------- | ------------------- |
| Recovery                         | Yes             | Yes                 |
| Standby                          | No              | Yes                 |
| Contracting                      | No              | No                  |
| Training                         | No              | No                  |
| An Investigation                 | No              | No                  |
| Deployed to a Mission site       | No              | No                  |

The table applies to an Agent that satisfies statements 1 to 3 above. The list of rows is exhaustive. An Agent on Standby
does not regain health in the Agent recovery step: only Recovery restores health, and [Missions](missions.md) sends an
Agent to Recovery exactly when it survives a Battle with health below its Maximum health.

The recovery rules of the next two sections read each Agent's own values at the start of the Agent recovery step, and the
Current assignment, Task phase, health, and exhaustion of no other Agent. Whatever order an implementation processes the
Agents in, the result is the same, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn
Advancement.

# Health recovery

**Inherited behavior:** An Agent recovers a percentage of its Maximum health in each Advance turn. game-ts keeps the
resulting health fractional.

**Proposed rule:** v5 keeps every health a whole number, under
[Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers, so the amount recovered in one
Advance turn is rounded up. The Health recovery rate of an Agent is the following Derived value:

```text
Health recovery rate = round up( p × maximum health / 100 )
```

| Symbol         | Meaning                                               | Unit and domain                              |
| -------------- | ----------------------------------------------------- | -------------------------------------------- |
| p              | `health_recovery_pct_per_turn` of RecoveryParameters. | Percent value; a whole number of at least 1. |
| maximum health | The Agent's Maximum health.                           | Health points; a whole number of at least 1. |

Evaluation and rounding: the expression is evaluated exactly, under [Percent values](../foundation/numbers.md#percent-values)
and [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers: multiply, then divide by 100, then Round up
once at the end. Range: the result is a whole number of at least 1, because p and maximum health are positive and so the
exact value is positive and Round up of a positive number is at least 1. The Health recovery rate may exceed maximum
health when p exceeds 100.

**Health recovery in the step:** For each Agent that is on Recovery and satisfies the conditions under
[Which Agents recover](#which-agents-recover), the Agent recovery step sets

```text
health after = min( maximum health, health before + Health recovery rate )
```

where health before is the Agent's health at the start of the step. The result is a whole number from health before to
maximum health, so the clamp under [Attribute ranges](agents-spec.md#attribute-ranges) is applied by this rule and
health never exceeds Maximum health.

**Recovery ends:** When health after equals Maximum health, the Agent's Current assignment becomes Standby and its Task
phase stays At assignment, at once, in the same Agent recovery step. No transit occurs. This is the move from Recovery
to Standby that [Current assignment changes](agents-spec.md#current-assignment-changes) lists and
[Transit rule](agents-spec.md#transit-rule) excepts from starting In transit. The following transition table lists the
only transitions of a Current assignment that this document makes; every transition not listed here is impossible for
this document.

| Source state            | Target state           | Trigger                           | Condition                                                                                                          |
| ----------------------- | ---------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Recovery; At assignment | Standby; At assignment | Advance turn, Agent recovery step | The Agent satisfies [Which Agents recover](#which-agents-recover), and its health after equals its Maximum health. |

An Agent on Recovery whose health after is below its Maximum health stays on Recovery, At assignment, and recovers again
in the next Advance turn. Health recovery is the only way an Agent leaves Recovery.

**Recovery cannot be ended early:** An Agent on Recovery cannot be ordered, under
[Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered), and no Player action ends Recovery. The player
waits until health reaches Maximum health. While an Agent is on Recovery, At assignment, it earns no income and trains
nothing, and it adds no Investigation progress, because its Current assignment is Recovery.

# Exhaustion recovery

**Proposed rule:** For each Agent that is on Standby or on Recovery and satisfies the conditions under
[Which Agents recover](#which-agents-recover), the Agent recovery step sets

```text
exhaustion after = max( 0, exhaustion before − exhaustion_recovery_per_turn )
```

where exhaustion before is the Agent's exhaustion at the start of the step and `exhaustion_recovery_per_turn` is that
property of RecoveryParameters, in exhaustion points, a whole number of at least 0. All values are whole numbers, so no
rounding occurs. The result is a whole number from 0 to exhaustion before, so the clamp under
[Attribute ranges](agents-spec.md#attribute-ranges) is applied by this rule and exhaustion never falls below 0.

Exhaustion recovers on Standby and on Recovery alone. It does not recover on Contracting, Training, or an Investigation,
nor while the Agent is In transit or Deployed, under [Which Agents recover](#which-agents-recover). The rate is the same
on Standby and on Recovery.

# Several changes in one turn

**Proposed rule:** The following statements are complete.

1. **One recovery per Agent per step:** The Agent recovery step is applied once per Advance turn, and each Agent
   recovers at most once in it. An Agent that moves from Recovery to Standby in the Agent recovery step has already
   been counted as an Agent on Recovery: it recovers health, recovers exhaustion exactly once, and then becomes Standby.
   It does not recover exhaustion a second time as an Agent on Standby in the same step, because the Current assignment
   that decides eligibility is the one at the start of the step.
2. **Health and exhaustion are independent:** The health of an Agent on Recovery rises by the Health recovery rate and
   its exhaustion falls by `exhaustion_recovery_per_turn` in the same step. Neither amount depends on the other, and the
   health reaching Maximum health does not change how much exhaustion is recovered in that step. An Agent that reaches
   Maximum health in the step may still have exhaustion above 0 when it becomes Standby.
3. **Battle and recovery never meet in one Advance turn:** This statement relies on
   [Battle timing](combat.md#battle-timing) in [Combat](combat.md): a Battle lowers health and raises exhaustion within
   the one Turn advancement step in which it is fought, the Mission resolution step. An Agent that
   survives is In transit from that step on, so at the Agent recovery step of the same Advance turn it fails statement 3
   of [Which Agents recover](#which-agents-recover) and recovers nothing. The first Advance turn in which it can recover is
   the one after the Advance turn in which it arrives, under [Transit rule](agents-spec.md#transit-rule). The Agent's
   health and exhaustion after the Battle are therefore exactly the values the Battle left, until that Advance turn.
4. **Order of the steps:** Within one Advance turn, the Agent recovery step follows the Mission resolution step and every
   earlier step, so it reads health and exhaustion as they are after those steps, under
   [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. No step after the Agent recovery
   step changes an Agent's health or exhaustion.
5. **No dependence on how damage was taken:** Health recovery reads only the Agent's Maximum health and health, and
   exhaustion recovery reads only its exhaustion. Neither depends on which Battle, which attacker, or how much damage
   produced the health lost, or on how many attacks produced the exhaustion.

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Every value is Player-visible from the moment it exists, without a reveal condition.

| Value                                                                                                   | Player-visible information |
| ------------------------------------------------------------------------------------------------------- | -------------------------- |
| Every property of RecoveryParameters: `health_recovery_pct_per_turn` and `exhaustion_recovery_per_turn` | Yes                        |
| An Agent's Health recovery rate                                                                         | Yes                        |
| An Agent's Recovery turns remaining                                                                     | Yes                        |

The Health recovery rate and the Recovery turns remaining are Derived values. They are never stored, and they follow every
change of the Agent's Maximum health or health at once, under
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract.

**Recovery turns remaining:** For a Serving Agent whose Current assignment is Recovery, whatever its Task phase,

```text
Recovery turns remaining = round up( (maximum health − health) / Health recovery rate )
```

where maximum health and health are the Agent's current values, in health points, whole numbers with health from 0 to
maximum health, and the Health recovery rate is the Derived value above, a whole number of at least 1 so that the divisor
is never zero. The expression is evaluated exactly and Round up is applied once, at the end. The result is a whole number
from 0 to maximum health. It counts the Advance turns in which the Agent recovers, from the first Advance turn in which
the Agent is At assignment at the start: the Advance turn in which the Agent arrives is not counted, and neither is any
Advance turn in which it is In transit. The Agent's health is full, and its Current assignment is Standby, after the last
counted Advance turn. E.g., an Agent In transit to Recovery with Recovery turns remaining 8 recovers nothing in the
Advance turn in which it arrives, and recovers health in each of the 8 Advance turns after that one.

**Unknown versus absent:** No value this document owns is hidden, so Player API never reports one as unknown. The Health
recovery rate is reported for every Serving Agent. The Recovery turns remaining is reported as absent, not as zero, for an
Agent whose Current assignment is not Recovery, and for a Killed or Dismissed Agent; the Current assignment explains why.
A reported value of 0 can only occur for an Agent on Recovery with health equal to Maximum health, which
[Edge cases and failure behavior](#edge-cases-and-failure-behavior) describes.

# Edge cases and failure behavior

- **Recovery reaching Maximum health exactly:** When health before plus the Health recovery rate equals Maximum health, the
  Agent has health after equal to Maximum health and becomes Standby in the same step ([Health recovery](#health-recovery)).
- **Recovery that would overshoot:** When health before plus the Health recovery rate exceeds Maximum health, health after
  is Maximum health, not more ([Health recovery](#health-recovery)).
- **Exhaustion that would fall below 0:** An Agent with exhaustion below `exhaustion_recovery_per_turn` ends the step
  with exhaustion 0, not a negative value ([Exhaustion recovery](#exhaustion-recovery)).
- **Recovery with health already at Maximum health:** [Missions](missions.md) sends an Agent to Recovery only when its
  health is below its Maximum health, and nothing raises health to Maximum health without ending Recovery, so an Agent
  on Recovery with health equal to Maximum health cannot occur. If it did occur, the Agent recovery step would treat it like
  any Agent on Recovery: health after equals Maximum health, the Agent becomes Standby, At assignment, and its exhaustion
  recovers once ([Health recovery](#health-recovery), [Several changes in one turn](#several-changes-in-one-turn)). Its
  Recovery turns remaining is 0 ([Player-visible information](#player-visible-information)).
- **Agent returning from a Battle in this Advance turn:** It is In transit at the Agent recovery step and recovers nothing
  in this Advance turn ([Several changes in one turn](#several-changes-in-one-turn)).
- **Agent arriving in this Advance turn:** An Agent on Recovery or Standby that arrives in the Transit step recovers
  nothing in this Advance turn and recovers from the next one ([Which Agents recover](#which-agents-recover)).
- **Agent whose Investigation completed in this Advance turn:** Its team is on Standby, In transit, from the
  Investigation progress step on, so its exhaustion does not recover in this Advance turn ([Which Agents recover](#which-agents-recover)).
- **Recovery interrupted by a new Current assignment:** No Player action can give an Agent on Recovery a new Current
  assignment, because it cannot be ordered ([Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered)); the
  only change of its Current assignment is the move to Standby in the Agent recovery step. Whether an Agent on Recovery
  may be dismissed belongs to [Economy and Upgrades](economy-and-upgrades.md) and is not changed here.
- **An Agent that is Killed:** A Killed Agent is not Serving, so it recovers nothing and has no Recovery turns remaining.
- **Maximum health of 1:** The Health recovery rate is at least 1, so an Agent on Recovery with Maximum health 1 and
  health 0 cannot exist, because a Serving Agent has positive health ([Agent lifecycle](agents-spec.md#agent-lifecycle)).
- **Percentage above 100:** The Health recovery rate may exceed Maximum health; health after is still Maximum health
  ([Recovery GDR validation](#recovery-gdr-validation)).
- **Exhaustion recovery rate of 0:** Exhaustion never falls on Standby or Recovery; health recovery and the move to
  Standby are unaffected ([Recovery GDR validation](#recovery-gdr-validation)).
- **Invalid GDRs:** A Game build with no RecoveryParameters, two RecoveryParameters, a missing or extra property, a
  `health_recovery_pct_per_turn` of 0, or a negative `exhaustion_recovery_per_turn` fails [Recovery GDR validation](#recovery-gdr-validation), and no Campaign
  is created from it.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/agent-recovery/recovery_parameters.yaml`,
`content/agents/agent_archetypes.yaml`, and `content/agents/agent_parameters.yaml`, unless an example states a test GDR.
The values they read are:

| GDR                | Values read                                                           |
| ------------------ | --------------------------------------------------------------------- |
| `recovery`         | `health_recovery_pct_per_turn` 2; `exhaustion_recovery_per_turn` 5    |
| `field_agent`      | `health` 30, i.e. the Maximum health of every Agent in these examples |
| `agent_parameters` | `exhaustion_cap` 100, which no example reaches                        |

"The Advance turn ending turn t" is the Advance turn committed during Turn t. No Upgrade has been acquired in any
example. The Battle values that Combat produces are stipulated as inputs, because [Combat](combat.md) owns how they
arise.

## Health recovery rate

This example exercises [Health recovery](#health-recovery) and [Recovery GDR validation](#recovery-gdr-validation). The
Health recovery rate is `round up( p × 30 / 100 )` for an Agent with Maximum health 30.

| Source of the percentage p | p   | Exact value of p × 30 / 100 | Health recovery rate                                                        |
| -------------------------- | --- | --------------------------- | --------------------------------------------------------------------------- |
| Bootstrap `recovery`       | 2   | 0.6                         | 1                                                                           |
| Test value                 | 1   | 0.3                         | 1                                                                           |
| Test value                 | 7   | 2.1                         | 3                                                                           |
| Test value                 | 50  | 15                          | 15                                                                          |
| Test value                 | 100 | 30                          | 30                                                                          |
| Test value                 | 0   | 0                           | Rejected: the percentage must be at least 1, so the Game build is defective |

Rounding down would give 0 for the first two rows, so the Agent would never recover; Round up gives at least 1 for every
valid percentage.

## Returning from a Battle until Standby

This example exercises [Which Agents recover](#which-agents-recover), [Health recovery](#health-recovery),
[Exhaustion recovery](#exhaustion-recovery), and [Several changes in one turn](#several-changes-in-one-turn), with
[Transit rule](agents-spec.md#transit-rule). Agent a1 is on Standby, At assignment, with health 30 of 30, and is deployed
to Mission site s1 during Turn 5. As a stipulated input, the Battle in the Advance turn ending turn 5 leaves a1 with
health 22 and exhaustion 14, and a1 survives; [Missions](missions.md) therefore sends a1 to Recovery, In transit. The Health
recovery rate of a1 is 1. Its Recovery turns remaining, once it is At assignment, is `round up( (30 − 22) / 1 )` = 8.

| Moment                      | Current assignment; Task phase     | Health | Exhaustion | What happens in the Agent recovery step                                                          |
| --------------------------- | ---------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------ |
| Turn 5, after deployment    | Deployed; At assignment            | 30     | 0          | Not applicable yet                                                                               |
| Advance turn ending turn 5  | Recovery; In transit afterwards    | 22     | 14         | a1 is In transit at the step: no recovery                                                        |
| Turn 6                      | Recovery; In transit               | 22     | 14         | Not applicable                                                                                   |
| Advance turn ending turn 6  | Recovery; At assignment afterwards | 22     | 14         | a1 arrives in the Transit step, so it was In transit in the Turn-end state: no recovery          |
| Turn 7                      | Recovery; At assignment            | 22     | 14         | Not applicable; a1 cannot be ordered                                                             |
| Advance turn ending turn 7  | Recovery; At assignment            | 23     | 9          | First recovery: health +1; exhaustion −5                                                         |
| Advance turn ending turn 8  | Recovery; At assignment            | 24     | 4          | Health +1; exhaustion −5                                                                         |
| Advance turn ending turn 9  | Recovery; At assignment            | 25     | 0          | Health +1; exhaustion 4 − 5 is clamped to 0                                                      |
| Advance turn ending turn 10 | Recovery; At assignment            | 26     | 0          | Health +1; exhaustion stays 0                                                                    |
| Advance turn ending turn 11 | Recovery; At assignment            | 27     | 0          | Health +1                                                                                        |
| Advance turn ending turn 12 | Recovery; At assignment            | 28     | 0          | Health +1                                                                                        |
| Advance turn ending turn 13 | Recovery; At assignment            | 29     | 0          | Health +1                                                                                        |
| Advance turn ending turn 14 | Standby; At assignment             | 30     | 0          | Health +1 reaches Maximum health 30; a1 becomes Standby, At assignment, at once, with no transit |
| Turn 15                     | Standby; At assignment             | 30     | 0          | a1 can be ordered                                                                                |

During Turns 6 and 7, `assignAgents([a1], Standby)` is rejected because a1 cannot be ordered, and no Player action ends
the Recovery early. a1 recovers in 8 Advance turns, the ones ending turns 7 to 14, which equals its Recovery turns
remaining of 8 on turn 7; on turn 5 and turn 6 the Recovery turns remaining reported is also 8, and it counts down by 1
in each Advance turn from the Advance turn ending turn 7. The Battle's lost health and gained exhaustion are untouched in
the Advance turn ending turn 5 because a1 was Deployed in the Turn-end state and In transit at the step.

## Standby recovers exhaustion only

This example exercises [Which Agents recover](#which-agents-recover) and [Exhaustion recovery](#exhaustion-recovery).
Agents b1 and b2 are on Standby, At assignment, with health 30 of 30. b1 has exhaustion 3 and b2 has exhaustion 14.

| Moment                     | b1 exhaustion | b2 exhaustion | Reason                                    |
| -------------------------- | ------------- | ------------- | ----------------------------------------- |
| Turn 3, start              | 3             | 14            |                                           |
| Advance turn ending turn 3 | 0             | 9             | b1: 3 − 5 is clamped to 0; b2: 14 − 5 = 9 |
| Advance turn ending turn 4 | 0             | 4             | b1 stays 0; b2: 9 − 5 = 4                 |
| Advance turn ending turn 5 | 0             | 0             | b2: 4 − 5 is clamped to 0                 |

Health stays 30 of 30 for both, because Standby does not recover health.

## Assignments and phases that do not recover

This example exercises [Which Agents recover](#which-agents-recover). In one Advance turn, every Agent below starts with
exhaustion 14. Agents c1 to c4 have health 30 of 30; the Agent recovery step finds them as follows, and the Advance turn
changes nothing else about them that this table shows.

| Agent | Current assignment and Task phase in the Turn-end state | Current assignment; Task phase at the start of the Agent recovery step | Exhaustion after the step | Reason                                                                                 |
| ----- | ------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| c1    | Contracting; At assignment                              | Contracting; At assignment                                             | 14                        | Contracting does not recover                                                           |
| c2    | Training; At assignment                                 | Training; At assignment                                                | 14                        | Training does not recover                                                              |
| c3    | Standby; In transit                                     | Standby; At assignment                                                 | 14                        | It arrived in the Transit step: In transit in the Turn-end state                       |
| c4    | An Investigation; At assignment                         | Standby; In transit                                                    | 14                        | The Investigation completed in the Investigation progress step: In transit at the step |
| c5    | Standby; At assignment                                  | Standby; At assignment                                                 | 9                         | The only Agent in this table that recovers                                             |

Agent c5 has health 30 of 30. In the next Advance turn c3 and c4 are At assignment in the Turn-end state, so they recover
exhaustion from 14 to 9. A Deployed Agent whose Battle is fought in the Mission resolution step is not in this table: it
is In transit at the step if it survives, as in the previous example.

## Reaching full health and no exhaustion in one step

This example exercises [Several changes in one turn](#several-changes-in-one-turn), [Health recovery](#health-recovery),
and [Exhaustion recovery](#exhaustion-recovery). Agents d1 and d2 are on Recovery, At assignment, in the Turn-end state,
each with health 29 of 30.

| Agent | Exhaustion before | Health after | Exhaustion after | Current assignment after the step | Explanation                                                                                                           |
| ----- | ----------------- | ------------ | ---------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| d1    | 3                 | 30           | 0                | Standby; At assignment            | Health 29 + 1 reaches Maximum health; exhaustion 3 − 5 is clamped to 0                                                |
| d2    | 8                 | 30           | 3                | Standby; At assignment            | Exhaustion recovers once: 8 − 5 = 3; a second recovery as an Agent on Standby would have given 0, and does not happen |

Both Agents are on Standby, At assignment, in the Turn-start state after the Advance turn, without any transit, and can be
ordered in the next Turn. In the following Advance turn d2 recovers exhaustion as an Agent on Standby, from 3 to 0.

## Recovery clamp with a test Health recovery rate

This example exercises [Health recovery](#health-recovery) and the Recovery turns remaining under
[Player-visible information](#player-visible-information), with the test value `health_recovery_pct_per_turn` 7 in place of
the Bootstrap value; every other value is the Bootstrap value. Agent e1 is on Recovery, At assignment, with health 22 of
30 and exhaustion 0. The Health recovery rate is `round up( 7 × 30 / 100 )` = `round up( 2.1 )` = 3, and the Recovery turns
remaining is `round up( (30 − 22) / 3 )` = `round up( 2.67 )` = 3.

| Moment                | Health | Recovery turns remaining                      | Current assignment     | Explanation                                 |
| --------------------- | ------ | --------------------------------------------- | ---------------------- | ------------------------------------------- |
| Before the first step | 22     | 3                                             | Recovery               |                                             |
| After the first step  | 25     | 2                                             | Recovery               | 22 + 3 = 25                                 |
| After the second step | 28     | 1                                             | Recovery               | 25 + 3 = 28                                 |
| After the third step  | 30     | 0 (no longer on Recovery; reported as absent) | Standby; At assignment | 28 + 3 = 31 is clamped to Maximum health 30 |

## Recovery with health already at Maximum health

This example exercises the case that cannot occur under [Edge cases and failure behavior](#edge-cases-and-failure-behavior).
Agent f1 is on Recovery, At assignment, in the Turn-end state, with health 30 of 30 and exhaustion 12. In the Agent recovery
step f1 has health after 30, so it becomes Standby, At assignment, and its exhaustion recovers once to 7. Its Recovery
turns remaining before the step was `round up( (30 − 30) / 1 )` = 0.

## Independence between Agents

This example exercises [Which Agents recover](#which-agents-recover). Agents g1 and g2 are both on Recovery, At assignment,
in the Turn-end state. g1 has health 29 and exhaustion 4; g2 has health 10 and exhaustion 20. After the Agent recovery
step, g1 has health 30, exhaustion 0, and is on Standby, At assignment; g2 has health 11, exhaustion 15, and is on
Recovery, At assignment. Each result is the same whichever Agent an implementation processes first, because neither result
reads the other Agent.
