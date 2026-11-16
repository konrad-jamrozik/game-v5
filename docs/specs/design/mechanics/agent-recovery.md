# Agent Recovery

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | RECOVER                                                                                                                                                                    |
| Family      | Mechanics                                                                                                                                                                  |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                |
| Owns        | Health recovery and exhaustion recovery of Agents, the RecoveryParameters GDR, and the result when several rules change one of those values in the same Turn.              |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A wounded or worn-down Agent works and fights worse, so getting it back to full strength matters, and it takes time. An
[Agent](domain-model.md#glossary) regains lost current health only on Recovery, and sheds exhaustion only on Standby or
Recovery.

Recovery is gradual and cannot be rushed. In each Advance turn, an Agent At assignment on Recovery regains a share of
its base health, an Agent At assignment on Standby or Recovery loses a fixed amount of exhaustion, and an Agent In
transit recovers nothing. Recovery ends by itself the moment current health reaches base health: the Agent becomes
Standby at once, without transit, and the player cannot end Recovery sooner. Both rates come from one RecoveryParameters
Game Data Record (GDR).

Agent Recovery refines [Agents](agents-spec.md): Agents says what current health and exhaustion are and how they lower
effective skill, and Agent Recovery says how they return over time.

# Relationships

- Uses [Combat](./combat.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Missions](./missions.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Agents](./agents-spec.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

These terms are specific to Agent Recovery. General terms are in the [Agents glossary](agents-spec.md#glossary).

| Term                     | Definition                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Health recovery rate     | The current health, as a whole number, that one Agent regains in each Advance turn in which it recovers; it depends on the Agent's base health.                                                                          |
| Recovery turns remaining | The number of further Advance turns in which an Agent on Recovery will regain current health before its current health reaches its base health, counted from the first Advance turn in which the Agent is At assignment. |

# Recovery parameters

The GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md) and the
YAML files it names.

RecoveryParameters bundles the two recovery rates. This table is exhaustive apart from the `id` and `type` that every
GDR has.

| Property                       | Meaning                                                                                                      | Read by                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `health_recovery_pct_per_turn` | A Percent value: the percent of an Agent's base health that its current health rises by in one Advance turn. | [Health recovery](#health-recovery)         |
| `exhaustion_recovery_per_turn` | The exhaustion an Agent loses in one Advance turn.                                                           | [Exhaustion recovery](#exhaustion-recovery) |

The Bootstrap GDRs have no Upgrade that changes either recovery rate, so both rates are constants of the Game build.

## Recovery GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for
RecoveryParameters. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and
the violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One RecoveryParameters:** The Game build supplies exactly one RecoveryParameters GDR.
2. **Exact properties:** The RecoveryParameters GDR has exactly the properties its table above lists, apart from `id` and
   `type`: no listed property is missing and no other property is present.
3. **Health recovery always progresses:** `health_recovery_pct_per_turn` is a whole number of at least 1. Because the
   Health recovery rate is rounded up, any positive percentage gives a Health recovery rate of at least 1 for every
   base health of at least 1, so an Agent on Recovery always gains current health in every Advance turn in which it recovers
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
it does not recover. Contracting, Training, and an Investigation do not recover current health or exhaustion either, and neither
does a Killed or Dismissed Agent.

| Current assignment at step start | Current health recovers | Exhaustion recovers |
| -------------------------------- | ----------------------- | ------------------- |
| Recovery                         | Yes                     | Yes                 |
| Standby                          | No                      | Yes                 |
| Contracting                      | No                      | No                  |
| Training                         | No                      | No                  |
| An Investigation                 | No                      | No                  |
| Deployed on a Mission            | No                      | No                  |

The table applies to an Agent that satisfies statements 1 to 3 above. The list of rows is exhaustive. An Agent on Standby
does not regain current health in the Agent recovery step: only Recovery restores current health, and [Missions](missions.md) sends an
Agent to Recovery exactly when it survives a Combat with current health below its base health.

The recovery rules of the next two sections read each Agent's own values at the start of the Agent recovery step, and the
Current assignment, Task phase, current health, and exhaustion of no other Agent. Whatever order an implementation processes the
Agents in, the result is the same, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn
Advancement.

# Health recovery

**Inherited behavior:** An Agent recovers a percentage of its base health in each Advance turn. game-ts keeps the
resulting current health fractional.

**Proposed rule:** v5 keeps every current health a whole number, under
[Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers, so the amount recovered in one
Advance turn is rounded up. The Health recovery rate of an Agent is the following Derived value:

```text
Health recovery rate = round up( p × base health / 100 )
```

| Symbol      | Meaning                                               | Unit and domain                              |
| ----------- | ----------------------------------------------------- | -------------------------------------------- |
| p           | `health_recovery_pct_per_turn` of RecoveryParameters. | Percent value; a whole number of at least 1. |
| base health | The Agent's base health.                              | Health points; a whole number of at least 1. |

Evaluation and rounding: the expression is evaluated exactly, under [Percent values](../foundation/numbers.md#percent-values)
and [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers: multiply, then divide by 100, then Round up
once at the end. Range: the result is a whole number of at least 1, because p and base health are positive and so the
exact value is positive and Round up of a positive number is at least 1. The Health recovery rate may exceed base
health when p exceeds 100.

**Health recovery in the step:** For each Agent that is on Recovery and satisfies the conditions under
[Which Agents recover](#which-agents-recover), the Agent recovery step sets

```text
current health after = min( base health, current health before + Health recovery rate )
```

where current health before is the Agent's current health at the start of the step. The result is a whole number from current health before to
base health, so the clamp under [Attribute ranges](agents-spec.md#attribute-ranges) is applied by this rule and
current health never exceeds base health.

**Recovery ends:** When current health after equals base health, the Agent's Current assignment becomes Standby and its Task
phase stays At assignment, at once, in the same Agent recovery step. No transit occurs. This is the move from Recovery
to Standby that [Current assignment changes](agents-spec.md#current-assignment-changes) lists and
[Transit rule](agents-spec.md#transit-rule) excepts from starting In transit. The following transition table lists the
only transitions of a Current assignment that the recovery rules make; every transition not listed here is impossible
for them.

| Source state            | Target state           | Trigger                           | Condition                                                                                                               |
| ----------------------- | ---------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Recovery; At assignment | Standby; At assignment | Advance turn, Agent recovery step | The Agent satisfies [Which Agents recover](#which-agents-recover), and its current health after equals its base health. |

An Agent on Recovery whose current health after is below its base health stays on Recovery, At assignment, and recovers again
in the next Advance turn. Health recovery is the only way an Agent leaves Recovery.

**Recovery cannot be ended early:** An Agent on Recovery cannot be ordered, under
[Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered), and no Player action ends Recovery. The player
does not start, change, or end Recovery; it begins and ends without any Player action. The player waits until current health
reaches base health. While an Agent is on Recovery, At assignment, it earns no income and trains
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

# Several changes in one Turn

One Advance turn can change an Agent's current health and exhaustion in more than one way, e.g. through Health recovery
and Exhaustion recovery in the same step. These rules fix how such changes combine, so the result never depends on the
order in which they are applied.

**Proposed rule:** The following statements are complete.

1. **One recovery per Agent per step:** The Agent recovery step is applied once per Advance turn, and each Agent
   recovers at most once in it. An Agent that moves from Recovery to Standby in the Agent recovery step has already
   been counted as an Agent on Recovery: it recovers current health, recovers exhaustion exactly once, and then becomes Standby.
   It does not recover exhaustion a second time as an Agent on Standby in the same step, because the Current assignment
   that decides eligibility is the one at the start of the step.
2. **Current health and exhaustion are independent:** The current health of an Agent on Recovery rises by the Health recovery rate and
   its exhaustion falls by `exhaustion_recovery_per_turn` in the same step. Neither amount depends on the other, and the
   current health reaching base health does not change how much exhaustion is recovered in that step. An Agent that reaches
   base health in the step may still have exhaustion above 0 when it becomes Standby.
3. **Combat and recovery never meet in one Advance turn:** Under [Combat timing](combat.md#combat-timing), a Combat
   lowers current health and raises exhaustion within the one Turn advancement step in which it is fought, the Mission
   resolution step. An Agent that survives is In transit from that step on, so at the Agent recovery step of the same Advance turn it fails statement 3
   of [Which Agents recover](#which-agents-recover) and recovers nothing. The first Advance turn in which it can recover is
   the one after the Advance turn in which it arrives, under [Transit rule](agents-spec.md#transit-rule). The Agent's
   current health and exhaustion after the Combat are therefore exactly the values the Combat left, until that Advance turn.
4. **Order of the steps:** Within one Advance turn, the Agent recovery step follows the Mission resolution step and every
   earlier step, so it reads current health and exhaustion as they are after those steps, under
   [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. No step after the Agent recovery
   step changes an Agent's current health or exhaustion.
5. **No dependence on how current health was lost:** Health recovery reads only the Agent's base health and current health, and
   exhaustion recovery reads only its exhaustion. Neither depends on which Combat, which attacker, or how many attacks
   produced the current health lost, or on how many attacks produced the exhaustion.

# Player-visible information

**Proposed rule:** Every value below is Player-visible information under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract, from the
moment it exists, without a reveal condition. The table is exhaustive.

| Value                                                                                                   | Player-visible information |
| ------------------------------------------------------------------------------------------------------- | -------------------------- |
| Every property of RecoveryParameters: `health_recovery_pct_per_turn` and `exhaustion_recovery_per_turn` | Yes                        |
| An Agent's Health recovery rate                                                                         | Yes                        |
| An Agent's Recovery turns remaining                                                                     | Yes                        |

The Health recovery rate and the Recovery turns remaining are Derived values. They are never stored, and they follow every
change of the Agent's base health or current health at once, under
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract.

**Recovery turns remaining:** For a Serving Agent whose Current assignment is Recovery, whatever its Task phase,

```text
Recovery turns remaining = round up( (base health − current health) / Health recovery rate )
```

where base health and current health are the Agent's current values, in health points, whole numbers with current health from 0 to
base health, and the Health recovery rate is the Derived value above, a whole number of at least 1 so that the divisor
is never zero. The expression is evaluated exactly and Round up is applied once, at the end. The result is a whole number
from 0 to base health. It counts the Advance turns in which the Agent recovers, from the first Advance turn in which
the Agent is At assignment at the start: the Advance turn in which the Agent arrives is not counted, and neither is any
Advance turn in which it is In transit. The Agent's current health equals its base health, and its Current assignment is Standby, after the last
counted Advance turn. E.g., an Agent In transit to Recovery with Recovery turns remaining 8 recovers nothing in the
Advance turn in which it arrives, and recovers current health in each of the 8 Advance turns after that one.

**Unknown versus absent:** No value in the table above is hidden, so Player API never reports one as unknown. The Health
recovery rate is reported for every Serving Agent. The Recovery turns remaining is reported as absent, not as zero, for an
Agent whose Current assignment is not Recovery, and for a Killed or Dismissed Agent; the Current assignment explains why.
A reported value of 0 can only occur for an Agent on Recovery with current health equal to base health, which
[Edge cases and failure behavior](#edge-cases-and-failure-behavior) describes.

# Edge cases and failure behavior

- **Recovery reaching base health exactly:** When current health before plus the Health recovery rate equals base health, the
  Agent has current health after equal to base health and becomes Standby in the same step ([Health recovery](#health-recovery)).
- **Recovery that would overshoot:** When current health before plus the Health recovery rate exceeds base health, current health after
  is base health, not more ([Health recovery](#health-recovery)).
- **Exhaustion that would fall below 0:** An Agent with exhaustion below `exhaustion_recovery_per_turn` ends the step
  with exhaustion 0, not a negative value ([Exhaustion recovery](#exhaustion-recovery)).
- **Recovery with current health already at base health:** [Missions](missions.md) sends an Agent to Recovery only when its
  current health is below its base health, and nothing raises current health to base health without ending Recovery, so an Agent
  on Recovery with current health equal to base health cannot occur. If it did occur, the Agent recovery step would treat it like
  any Agent on Recovery: current health after equals base health, the Agent becomes Standby, At assignment, and its exhaustion
  recovers once ([Health recovery](#health-recovery), [Several changes in one Turn](#several-changes-in-one-turn)). Its
  Recovery turns remaining is 0 ([Player-visible information](#player-visible-information)).
- **Agent returning from a Combat in this Advance turn:** It is In transit at the Agent recovery step and recovers nothing
  in this Advance turn ([Several changes in one Turn](#several-changes-in-one-turn)).
- **Agent arriving in this Advance turn:** An Agent on Recovery or Standby that arrives in the Transit step recovers
  nothing in this Advance turn and recovers from the next one ([Which Agents recover](#which-agents-recover)).
- **Agent whose Investigation completed in this Advance turn:** Its team is on Standby, In transit, from the
  Investigation progress step on, so its exhaustion does not recover in this Advance turn ([Which Agents recover](#which-agents-recover)).
- **Recovery interrupted by a new Current assignment:** No Player action can give an Agent on Recovery a new Current
  assignment, because it cannot be ordered ([Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered)); the
  only change of its Current assignment is the move to Standby in the Agent recovery step. Whether an Agent on Recovery
  may be dismissed is decided under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents).
- **An Agent that is Killed:** A Killed Agent is not Serving, so it recovers nothing and has no Recovery turns remaining.
- **Base health of 1:** The Health recovery rate is at least 1, so an Agent on Recovery with base health 1 and
  current health 0 cannot exist, because a Serving Agent has positive current health ([Agent lifecycle](agents-spec.md#agent-lifecycle)).
- **Percentage above 100:** The Health recovery rate may exceed base health; current health after is still base health
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

| GDR                | Values read                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `recovery`         | `health_recovery_pct_per_turn` 2; `exhaustion_recovery_per_turn` 5      |
| `field_agent`      | `base_health` 30, i.e. the base health of every Agent in these examples |
| `agent_parameters` | `exhaustion_cap` 100, which no example reaches                          |

"The Advance turn ending Turn t" is the Advance turn committed during Turn t. No Upgrade has been acquired in any
example. The Combat values that [Combat](combat.md) produces are stipulated as inputs.

## Health recovery rate

This example exercises [Health recovery](#health-recovery) and [Recovery GDR validation](#recovery-gdr-validation). The
Health recovery rate is `round up( p × 30 / 100 )` for an Agent with base health 30.

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

## Returning from a Combat until Standby

This example exercises [Which Agents recover](#which-agents-recover), [Health recovery](#health-recovery),
[Exhaustion recovery](#exhaustion-recovery), and [Several changes in one Turn](#several-changes-in-one-turn), with
[Transit rule](agents-spec.md#transit-rule). Agent a1 is on Standby, At assignment, with current health 30 of 30, and is deployed
to Mission site s1 during Turn 5. As a stipulated input, the Combat in the Advance turn ending Turn 5 leaves a1 with
current health 22 and exhaustion 14, and a1 survives; [Missions](missions.md) therefore sends a1 to Recovery, In transit. The Health
recovery rate of a1 is 1. Its Recovery turns remaining, once it is At assignment, is `round up( (30 − 22) / 1 )` = 8.

| Moment                      | Current assignment; Task phase     | Current health | Exhaustion | What happens in the Agent recovery step                                                               |
| --------------------------- | ---------------------------------- | -------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| Turn 5, after deployment    | Deployed; At assignment            | 30             | 0          | Not applicable yet                                                                                    |
| Advance turn ending Turn 5  | Recovery; In transit afterwards    | 22             | 14         | a1 is In transit at the step: no recovery                                                             |
| Turn 6                      | Recovery; In transit               | 22             | 14         | Not applicable                                                                                        |
| Advance turn ending Turn 6  | Recovery; At assignment afterwards | 22             | 14         | a1 arrives in the Transit step, so it was In transit in the Turn-end state: no recovery               |
| Turn 7                      | Recovery; At assignment            | 22             | 14         | Not applicable; a1 cannot be ordered                                                                  |
| Advance turn ending Turn 7  | Recovery; At assignment            | 23             | 9          | First recovery: current health +1; exhaustion −5                                                      |
| Advance turn ending Turn 8  | Recovery; At assignment            | 24             | 4          | Current health +1; exhaustion −5                                                                      |
| Advance turn ending Turn 9  | Recovery; At assignment            | 25             | 0          | Current health +1; exhaustion 4 − 5 is clamped to 0                                                   |
| Advance turn ending Turn 10 | Recovery; At assignment            | 26             | 0          | Current health +1; exhaustion stays 0                                                                 |
| Advance turn ending Turn 11 | Recovery; At assignment            | 27             | 0          | Current health +1                                                                                     |
| Advance turn ending Turn 12 | Recovery; At assignment            | 28             | 0          | Current health +1                                                                                     |
| Advance turn ending Turn 13 | Recovery; At assignment            | 29             | 0          | Current health +1                                                                                     |
| Advance turn ending Turn 14 | Standby; At assignment             | 30             | 0          | Current health +1 reaches base health 30; a1 becomes Standby, At assignment, at once, with no transit |
| Turn 15                     | Standby; At assignment             | 30             | 0          | a1 can be ordered                                                                                     |

During Turns 6 and 7, `assignAgents([a1], Standby)` is rejected because a1 cannot be ordered, and no Player action ends
the Recovery early. a1 recovers in 8 Advance turns, the ones ending Turns 7 to 14, which equals its Recovery turns
remaining of 8 on Turn 7; on Turn 5 and Turn 6 the Recovery turns remaining reported is also 8, and it counts down by 1
in each Advance turn from the Advance turn ending Turn 7. The Combat's lost current health and gained exhaustion are untouched in
the Advance turn ending Turn 5 because a1 was Deployed in the Turn-end state and In transit at the step.

## Standby recovers exhaustion only

This example exercises [Which Agents recover](#which-agents-recover) and [Exhaustion recovery](#exhaustion-recovery).
Agents b1 and b2 are on Standby, At assignment, with current health 30 of 30. b1 has exhaustion 3 and b2 has exhaustion 14.

| Moment                     | b1 exhaustion | b2 exhaustion | Reason                                    |
| -------------------------- | ------------- | ------------- | ----------------------------------------- |
| Turn 3, start              | 3             | 14            |                                           |
| Advance turn ending Turn 3 | 0             | 9             | b1: 3 − 5 is clamped to 0; b2: 14 − 5 = 9 |
| Advance turn ending Turn 4 | 0             | 4             | b1 stays 0; b2: 9 − 5 = 4                 |
| Advance turn ending Turn 5 | 0             | 0             | b2: 4 − 5 is clamped to 0                 |

Current health stays 30 of 30 for both, because Standby does not recover current health.

## Assignments and phases that do not recover

This example exercises [Which Agents recover](#which-agents-recover). In one Advance turn, every Agent below starts with
exhaustion 14. Agents c1 to c4 have current health 30 of 30; the Agent recovery step finds them as follows, and the Advance turn
changes nothing else about them that this table shows.

| Agent | Current assignment and Task phase in the Turn-end state | Current assignment; Task phase at the start of the Agent recovery step | Exhaustion after the step | Reason                                                                                 |
| ----- | ------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| c1    | Contracting; At assignment                              | Contracting; At assignment                                             | 14                        | Contracting does not recover                                                           |
| c2    | Training; At assignment                                 | Training; At assignment                                                | 14                        | Training does not recover                                                              |
| c3    | Standby; In transit                                     | Standby; At assignment                                                 | 14                        | It arrived in the Transit step: In transit in the Turn-end state                       |
| c4    | An Investigation; At assignment                         | Standby; In transit                                                    | 14                        | The Investigation completed in the Investigation progress step: In transit at the step |
| c5    | Standby; At assignment                                  | Standby; At assignment                                                 | 9                         | The only Agent in this table that recovers                                             |

Agent c5 has current health 30 of 30. In the next Advance turn c3 and c4 are At assignment in the Turn-end state, so they recover
exhaustion from 14 to 9. A Deployed Agent whose Combat is fought in the Mission resolution step is not in this table: it
is In transit at the step if it survives, as in the previous example.

## Current health reaching base health and exhaustion reaching 0 in one step

This example exercises [Several changes in one Turn](#several-changes-in-one-turn), [Health recovery](#health-recovery),
and [Exhaustion recovery](#exhaustion-recovery). Agents d1 and d2 are on Recovery, At assignment, in the Turn-end state,
each with current health 29 of 30.

| Agent | Exhaustion before | Current health after | Exhaustion after | Current assignment after the step | Explanation                                                                                                           |
| ----- | ----------------- | -------------------- | ---------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| d1    | 3                 | 30                   | 0                | Standby; At assignment            | Current health 29 + 1 reaches base health; exhaustion 3 − 5 is clamped to 0                                           |
| d2    | 8                 | 30                   | 3                | Standby; At assignment            | Exhaustion recovers once: 8 − 5 = 3; a second recovery as an Agent on Standby would have given 0, and does not happen |

Both Agents are on Standby, At assignment, in the Turn-start state after the Advance turn, without any transit, and can be
ordered in the next Turn. In the following Advance turn d2 recovers exhaustion as an Agent on Standby, from 3 to 0.

## Recovery clamp with a test Health recovery rate

This example exercises [Health recovery](#health-recovery) and the Recovery turns remaining under
[Player-visible information](#player-visible-information), with the test value `health_recovery_pct_per_turn` 7 in place of
the Bootstrap value; every other value is the Bootstrap value. Agent e1 is on Recovery, At assignment, with current health 22 of
30 and exhaustion 0. The Health recovery rate is `round up( 7 × 30 / 100 )` = `round up( 2.1 )` = 3, and the Recovery turns
remaining is `round up( (30 − 22) / 3 )` = `round up( 2.67 )` = 3.

| Moment                | Current health | Recovery turns remaining                      | Current assignment     | Explanation                              |
| --------------------- | -------------- | --------------------------------------------- | ---------------------- | ---------------------------------------- |
| Before the first step | 22             | 3                                             | Recovery               |                                          |
| After the first step  | 25             | 2                                             | Recovery               | 22 + 3 = 25                              |
| After the second step | 28             | 1                                             | Recovery               | 25 + 3 = 28                              |
| After the third step  | 30             | 0 (no longer on Recovery; reported as absent) | Standby; At assignment | 28 + 3 = 31 is clamped to base health 30 |

## Recovery with current health already at base health

This example exercises the case that cannot occur under [Edge cases and failure behavior](#edge-cases-and-failure-behavior).
Agent f1 is on Recovery, At assignment, in the Turn-end state, with current health 30 of 30 and exhaustion 12. In the Agent recovery
step f1 has current health after 30, so it becomes Standby, At assignment, and its exhaustion recovers once to 7. Its Recovery
turns remaining before the step was `round up( (30 − 30) / 1 )` = 0.

## Independence between Agents

This example exercises [Which Agents recover](#which-agents-recover). Agents g1 and g2 are both on Recovery, At assignment,
in the Turn-end state. g1 has current health 29 and exhaustion 4; g2 has current health 10 and exhaustion 20. After the Agent recovery
step, g1 has current health 30, exhaustion 0, and is on Standby, At assignment; g2 has current health 11, exhaustion 15, and is on
Recovery, At assignment. Each result is the same whichever Agent an implementation processes first, because neither result
reads the other Agent.

# TODOs

- TODO (later): Recovery that depends on the kind of attack that took an Agent's current health, under
  [Several changes in one Turn](#several-changes-in-one-turn).
- TODO (later): Faster recovery from an Upgrade, under [Recovery parameters](#recovery-parameters).
- TODO (later): Exhaustion that an Agent gains from its work, under [Exhaustion recovery](#exhaustion-recovery).
