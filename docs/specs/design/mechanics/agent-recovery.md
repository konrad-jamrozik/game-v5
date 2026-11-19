# Agent Recovery

| Metadata | Value |
| --- | --- |
| Spec ID | RECOVER |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Health recovery and exhaustion recovery of Agents, the RecoveryParameters GDR, and the result when several rules change one of those values in the same Turn. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A wounded or worn-down [Agent](domain-model.md#agency-and-agents) works and fights worse, so getting it back to full strength matters, and it takes time. An [Agent](domain-model.md#glossary) regains lost current health only on [Recovery](agents-spec.md#assignments), and sheds exhaustion only on [Standby](agents-spec.md#assignments) or Recovery, while work and Missions keep adding to it.

Recovery is gradual and cannot be rushed. In each Advance turn, a [Recovering](agents-spec.md#agent-statuses) Agent regains a share of its base health, a Recovering Agent or an Agent [At assignment](agents-spec.md#agent-statuses) on Standby loses a fixed amount of exhaustion, and an Agent [In transit](agents-spec.md#agent-statuses) recovers nothing. Recovery ends by itself the moment current health reaches base health: the Agent becomes Standby at once, without transit, and the player cannot end Recovery sooner. Both rates start from one RecoveryParameters [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR), and the Agency can raise each with an [Upgrade](economy-and-upgrades.md#glossary).

Agent Recovery builds on [Agents](agents-spec.md): Agents says what current health and exhaustion are and how they lower effective skill, and Agent Recovery says how they return over time.

# Glossary

These terms are specific to Agent Recovery. General terms are in the [Agents glossary](agents-spec.md#glossary).

| Term | Definition |
| --- | --- |
| Health recovery rate | The [current health](agents-spec.md#combatant-attributes), as a [Decimal quantity](../foundation/numbers.md#glossary), that one [Agent](domain-model.md#agency-and-agents) regains in each Advance turn in which it recovers; it depends on the Agent's [base health](agents-spec.md#combatant-attributes). |
| Recovery turns remaining | The number of further Advance turns in which an Agent on [Recovery](agents-spec.md#assignments) will regain current health before its current health reaches its base health, counted from the first Advance turn in which the Agent is [Recovering](agents-spec.md#agent-statuses). |

# Recovery parameters

The [GDRs](../foundation/core-concepts.md#game-build-and-content) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

RecoveryParameters bundles the two recovery rates. This table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `health_recovery_pct_per_turn` | A [Percent value](../foundation/numbers.md#glossary): the percent of an Agent's base health that its current health rises by in one Advance turn, before any [Upgrade](domain-model.md#agency-and-agents). It is a [Decimal quantity](../foundation/numbers.md#glossary), e.g. 2.2. | [Health recovery](#health-recovery) |
| `exhaustion_recovery_per_turn` | The [Exact exhaustion](agents-spec.md#combatant-attributes) an Agent loses in one Advance turn, before any Upgrade. It is a Decimal quantity, e.g. 5.5. | [Exhaustion recovery](#exhaustion-recovery) |

Each property is the starting value of a rate that [Rate Upgrades](economy-and-upgrades.md#rate-upgrades) in Economy and Upgrades raises: `health_recovery_pct_per_turn` of the health recovery percentage, and `exhaustion_recovery_per_turn` of the [exhaustion](agents-spec.md#combatant-attributes) recovery. The rules below read those rates, which equal the properties while no such [Upgrade](economy-and-upgrades.md#glossary) has been acquired.

## Recovery GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for RecoveryParameters. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **One RecoveryParameters:** The Game build supplies exactly one RecoveryParameters GDR.
2. **Exact properties:** The RecoveryParameters GDR has exactly the properties its table above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
3. **Health recovery always progresses:** `health_recovery_pct_per_turn` is a number greater than 0 written with at most two digits after the decimal point, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers, so it is at least 0.01. Because the Health recovery rate is rounded up to hundredths, any positive percentage gives a Health recovery rate of at least 0.01 for every base health of at least 1, so an Agent on Recovery always gains current health in every Advance turn in which it recovers and its Recovery ends after a finite number of Advance turns. A percentage of 0 is invalid because an Agent would stay on Recovery forever. A percentage above 100 is valid; the clamp under [Health recovery](#health-recovery) then ends Recovery in one Advance turn.
4. **Exhaustion recovery is a Decimal quantity:** `exhaustion_recovery_per_turn` is a number of at least 0 written with at most two digits after the decimal point. A value of 0 is valid and means that exhaustion never falls.

# Which Agents recover

**Proposed rule:** In the Agent recovery step of every Advance turn, the recovery rules below apply to an Agent exactly when all of the following hold:

1. It is [Serving](agents-spec.md#agent-statuses).
2. It is not [In transit](agents-spec.md#agent-statuses) in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns), i.e. in the [World state](../foundation/engine-contract.md#player-actions-and-turns) in which this Advance turn began: its [Agent status](domain-model.md#agency-and-agents) there is [At assignment](agents-spec.md#agent-statuses) or Recovering.
3. It is not [In transit](domain-model.md#agency-and-agents) at the start of the Agent recovery step.
4. Its [Assignment](domain-model.md#agency-and-agents) at the start of the Agent recovery step is the Assignment the rule names.

Statements 2 and 3 are both needed: statement 2 excludes an Agent that arrived in the Transit step of this Advance turn, and statement 3 excludes an Agent that became In transit in an earlier step of this Advance turn, e.g. a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) survivor or the team of an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) that completed. Together they apply the [Transit rule](agents-spec.md#transit-rule): an Agent that is In transit when the Advance turn begins, and an Agent that becomes In transit during it, recover nothing in this Advance turn. A [Deployed](agents-spec.md#assignments) Agent is never on [Standby](agents-spec.md#assignments) or Recovery, so it does not recover. Contracting, [Training](agents-spec.md#assignments), and an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) do not recover current health or exhaustion either, and neither does a [Killed](agents-spec.md#agent-statuses) or [Dismissed](agents-spec.md#agent-statuses) Agent.

| Assignment at step start | Current health recovers | Exhaustion recovers |
| --- | --- | --- |
| Recovery | Yes | Yes |
| Standby | No | Yes |
| Contracting | No | No |
| Training | No | No |
| An Investigation | No | No |
| Deployed on a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) | No | No |

The table applies to an Agent that satisfies statements 1 to 3 above. The list of rows is exhaustive. An Agent on Standby does not regain current health in the Agent recovery step: only Recovery restores current health, and [Missions](missions.md) sends an Agent to Recovery exactly when it survives a [Combat](domain-model.md#combat) with current health below its base health.

The recovery rules of the next two sections read each Agent's own values at the start of the Agent recovery step, and the Assignment, Agent status, current health, and exhaustion of no other Agent. Whatever order an implementation processes the Agents in, the result is the same, under [Values a step uses](turn-advancement.md#values-a-step-uses) in [Turn](../foundation/engine-contract.md#player-actions-and-turns) Advancement.

# Health recovery

**Inherited behavior:** An Agent recovers a percentage of its base health in each Advance turn. game-ts keeps the resulting current health fractional.

**Proposed rule:** v5 keeps an Agent's current health as a Decimal quantity, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers, so the amount recovered in one Advance turn is rounded up to hundredths. The Health recovery rate of an Agent is the following [Derived value](../foundation/core-concepts.md#value-classification):

```text
Health recovery rate = round up to hundredths( p × base health / 100 )
```

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| p | The health recovery percentage: `health_recovery_pct_per_turn` of RecoveryParameters plus what every acquired Upgrade with the effect `health_recovery` adds, under [Rate Upgrades](economy-and-upgrades.md#rate-upgrades). | Percent value; a Decimal quantity of at least 0.01. |
| base health | The Agent's base health. | Health points; a whole number of at least 1. |

Evaluation and rounding: the expression is evaluated exactly, under [Percent values](../foundation/numbers.md#percent-values) and [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers: multiply, then divide by 100, then [Round up](../foundation/numbers.md#glossary) to hundredths once at the end, under [Rounding](../foundation/numbers.md#rounding). Range: the result is a Decimal quantity of at least 0.01, because p and base health are positive and so the exact value is positive and Round up to hundredths of a positive number is at least 0.01. The Health recovery rate may exceed base health when p exceeds 100. E.g., with base health 30, a p of 2 gives exactly 0.60, and with base health 31, a p of 2.2 gives `round up to hundredths(0.682) = 0.69`. The rounded rate is the amount every recovery adds, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers.

**Health recovery in the step:** For each Agent that is on Recovery and satisfies the conditions under [Which Agents recover](#which-agents-recover), the Agent recovery step sets

```text
current health after = min( base health, current health before + Health recovery rate )
```

where current health before is the Agent's current health at the start of the step. No rounding occurs, because every term is a Decimal quantity or a whole number. The result is a Decimal quantity from current health before to base health, so the clamp under [Attribute ranges](agents-spec.md#attribute-ranges) is applied by this rule and current health never exceeds base health.

**Recovery ends:** When current health after equals base health, the Agent's Assignment becomes Standby and its Agent status becomes [At assignment](domain-model.md#agency-and-agents), at once, in the same Agent recovery step. The comparison is exact: e.g., current health 29.99 of 30 does not end Recovery, and 29.40 + 0.60 does. No transit occurs. This is the move from Recovery to Standby that [Assignment changes](agents-spec.md#assignment-changes) lists and [Transit rule](agents-spec.md#transit-rule) excepts from starting In transit. The following transition table lists the only transitions of an Assignment that the recovery rules make; every transition not listed here is impossible for them.

| Source state | Target state | Trigger | Condition |
| --- | --- | --- | --- |
| Recovery; Recovering | Standby; At assignment | Advance turn, Agent recovery step | The Agent satisfies [Which Agents recover](#which-agents-recover), and its current health after equals its base health. |

An Agent on Recovery whose current health after is below its base health stays on Recovery, Recovering, and recovers again in the next Advance turn. Health recovery is the only way an Agent leaves Recovery.

**Recovery cannot be ended early:** An Agent on Recovery cannot be assigned, under [Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned), and no [Player action](../foundation/engine-contract.md#player-actions-and-turns) ends Recovery. The player does not start, change, or end Recovery; it begins and ends without any Player action. The player waits until current health reaches base health. While an Agent is on Recovery, Recovering, it earns no income and trains nothing, and it adds no [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions), because its Assignment is Recovery.

# Exhaustion recovery

**Proposed rule:** For each Agent that is on Standby or on Recovery and satisfies the conditions under [Which Agents recover](#which-agents-recover), the Agent recovery step sets

```text
Exact exhaustion after = max( 0, Exact exhaustion before − exhaustion recovery )
```

where [Exact exhaustion](agents-spec.md#combatant-attributes) before is the Agent's [Exact exhaustion](agents-spec.md#combatant-attributes) at the start of the step and exhaustion recovery is `exhaustion_recovery_per_turn` of RecoveryParameters plus what every acquired Upgrade with the effect `exhaustion_recovery` adds, under [Rate Upgrades](economy-and-upgrades.md#rate-upgrades) in Economy and Upgrades, in exhaustion points, a Decimal quantity of at least 0. No rounding occurs, because every term is a Decimal quantity. The result is a Decimal quantity from 0 to Exact exhaustion before, so the clamp under [Attribute ranges](agents-spec.md#attribute-ranges) is applied by this rule and Exact exhaustion never falls below 0. The Agent's exhaustion after the step is `round up( Exact exhaustion after )`, under [Exhaustion and Exact exhaustion](agents-spec.md#exhaustion-and-exact-exhaustion) in Agents; e.g., an Exact exhaustion of 5 that recovers 1.6 becomes 3.40, an exhaustion of 4. While the exhaustion recovery is a whole number, as with the Bootstrap value, Exact exhaustion and exhaustion are equal.

Exhaustion recovers on Standby and on Recovery alone. It does not recover on [Contracting](agents-spec.md#assignments), Training, or an Investigation, nor while the Agent is In transit or Deployed, under [Which Agents recover](#which-agents-recover). The rate is the same on Standby and on Recovery.

# Several changes in one Turn

One Advance turn can change an Agent's current health and exhaustion in more than one way, e.g. through Health recovery and [Exhaustion](agents-spec.md#combatant-attributes) recovery in the same step. These rules fix how such changes combine, so the result never depends on the order in which they are applied.

**Proposed rule:** The following statements are complete.

1. **One recovery per Agent per step:** The Agent recovery step is applied once per Advance turn, and each Agent recovers at most once in it. An Agent that moves from Recovery to Standby in the Agent recovery step has already been counted as an Agent on Recovery: it recovers current health, recovers exhaustion exactly once, and then becomes Standby. It does not recover exhaustion a second time as an Agent on Standby in the same step, because the Assignment that decides eligibility is the one at the start of the step.
2. **[Current health](agents-spec.md#combatant-attributes) and exhaustion are independent:** The current health of an Agent on Recovery rises by the Health recovery rate and its Exact exhaustion falls by the exhaustion recovery in the same step. Neither amount depends on the other, and the current health reaching base health does not change how much exhaustion is recovered in that step. An Agent that reaches base health in the step may still have exhaustion above 0 when it becomes Standby.
3. **Combat and recovery never meet in one Advance turn:** Under [Combat timing](combat.md#combat-timing), a Combat lowers current health and raises exhaustion within the one [Turn advancement step](turn-advancement.md#glossary) in which it is fought, the Mission resolution step, and [Mission exhaustion](missions.md#mission-exhaustion) raises exhaustion further in the same step. An Agent that survives is In transit from that step on, so at the Agent recovery step of the same Advance turn it fails statement 3 of [Which Agents recover](#which-agents-recover) and recovers nothing. The first Advance turn in which it can recover is the one after the Advance turn in which it arrives, under [Transit rule](agents-spec.md#transit-rule). The Agent's current health and exhaustion after the Mission are therefore exactly the values its resolution left, until that Advance turn.
4. **Order of the steps:** Within one Advance turn, the Agent recovery step follows the Mission resolution step and every earlier step, so it reads current health and exhaustion as they are after those steps, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. No step after the Agent recovery step changes an Agent's current health or exhaustion.
5. **No dependence on how current health was lost:** Health recovery reads only the Agent's base health and current health, and exhaustion recovery reads only its exhaustion. Neither depends on which Combat, which attacker, or how many attacks produced the current health lost, or on whether Combat, a Mission, or work produced the exhaustion.
6. **Work and recovery:** An Agent on a [Work Assignment](agents-spec.md#assignments) when the Agent recovery step begins does not recover, so the exhaustion it gained from work in an earlier step of the Advance turn stays. An Agent that had a [Forced return](agents-spec.md#forced-return) in an earlier step of the same Advance turn recovers in this step exactly when it satisfies [Which Agents recover](#which-agents-recover): from Contracting or an Investigation it is In transit and recovers nothing; from Training it is on Standby, At assignment, since the Turn-end state, and recovers exhaustion once.

# Turn report

**Proposed rule:** The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, for each Agent that recovers in it under [Which Agents recover](#which-agents-recover), in the order of the Agents in [Campaign state](../foundation/core-concepts.md#campaign-and-session), its [Instance ID](../foundation/campaign-instances.md#glossary), its current health, Exact exhaustion, and exhaustion after its recovery step, and whether its Recovery ended in it. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds none of these. All are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report.

# Player-visible information

**Proposed rule:** Every value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces) under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), from the moment it exists, without a reveal condition. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| Every property of RecoveryParameters: `health_recovery_pct_per_turn` and `exhaustion_recovery_per_turn` | Yes |
| An Agent's Health recovery rate | Yes |
| An Agent's Recovery turns remaining | Yes |

The Health recovery rate and the Recovery turns remaining are Derived values. They are never stored, and they follow every change of the Agent's base health or current health at once, under [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract.

**Recovery turns remaining:** For a Serving Agent whose Assignment is Recovery, whatever its Agent status,

```text
Recovery turns remaining = round up( (base health − current health) / Health recovery rate )
```

where base health and current health are the Agent's current values, in health points, with current health a Decimal quantity from 0 to base health, and the Health recovery rate is the Derived value above, a Decimal quantity of at least 0.01 so that the divisor is never zero. The expression is evaluated exactly and Round up is applied once, at the end. The result is a whole number of at least 0. It counts the Advance turns in which the Agent recovers, from the first Advance turn in which the Agent is Recovering at the start: the Advance turn in which the Agent arrives is not counted, and neither is any Advance turn in which it is In transit. The Agent's current health equals its base health, and its Assignment is Standby, after the last counted Advance turn. E.g., an Agent In transit to Recovery with Recovery turns remaining 8 recovers nothing in the Advance turn in which it arrives, and recovers current health in each of the 8 Advance turns after that one.

**Unknown versus absent:** No value in the table above is hidden, so Player API never reports one as unknown. The Health recovery rate is reported for every Serving Agent. The Recovery turns remaining is reported as absent, not as zero, for an Agent whose Assignment is not Recovery, and for a Killed or Dismissed Agent; the Assignment explains why. A reported value of 0 can only occur for an Agent on Recovery with current health equal to base health, which [Edge cases and failure behavior](#edge-cases-and-failure-behavior) describes.

# Edge cases and failure behavior

- **Recovery reaching base health exactly:** When current health before plus the Health recovery rate equals base health, the Agent has current health after equal to base health and becomes Standby in the same step ([Health recovery](#health-recovery)).
- **Recovery that would overshoot:** When current health before plus the Health recovery rate exceeds base health, current health after is base health, not more ([Health recovery](#health-recovery)).
- **Exhaustion that would fall below 0:** An Agent with Exact exhaustion below the exhaustion recovery ends the step with Exact exhaustion 0, and so exhaustion 0, not a negative value ([Exhaustion recovery](#exhaustion-recovery)).
- **Exhaustion recovery that is not whole:** Exact exhaustion keeps its decimal places from one Advance turn to the next, and exhaustion is its value rounded up; e.g., Exact exhaustion 5 with a test exhaustion recovery of 1.6 gives exhaustion 5, 4, 2, 1, and 0 over four Advance turns ([Exhaustion recovery](#exhaustion-recovery)).
- **Recovery with current health already at base health:** [Missions](missions.md) sends an Agent to Recovery only when its current health is below its base health, and nothing raises current health to base health without ending Recovery, so an Agent on Recovery with current health equal to base health cannot occur. If it did occur, the Agent recovery step would treat it like any Agent on Recovery: current health after equals base health, the Agent becomes Standby, At assignment, and its exhaustion recovers once ([Health recovery](#health-recovery), [Several changes in one Turn](#several-changes-in-one-turn)). Its Recovery turns remaining is 0 ([Player-visible information](#player-visible-information)).
- **Agent returning from a Combat in this Advance turn:** It is In transit at the Agent recovery step and recovers nothing in this Advance turn ([Several changes in one Turn](#several-changes-in-one-turn)).
- **Agent arriving in this Advance turn:** An Agent on Recovery or Standby that arrives in the Transit step recovers nothing in this Advance turn and recovers from the next one ([Which Agents recover](#which-agents-recover)).
- **Agent whose Investigation completed in this Advance turn:** Its team is on Standby, In transit, from the Investigation progress step on, so its exhaustion does not recover in this Advance turn ([Which Agents recover](#which-agents-recover)).
- **Recovery interrupted by a new Assignment:** No Player action can give a Recovering Agent a new Assignment, because it cannot be assigned ([Agents that can be assigned](agents-spec.md#agents-that-can-be-assigned)); the only change of its Assignment is the move to Standby in the Agent recovery step. Whether an Agent on Recovery may be dismissed is decided under [Dismissing Agents](economy-and-upgrades.md#dismissing-agents).
- **An Agent that is Killed:** A Killed Agent is not Serving, so it recovers nothing and has no Recovery turns remaining.
- **Small Health recovery rate:** The Health recovery rate is at least 0.01, so every Agent on Recovery gains current health in every Advance turn in which it recovers; e.g., a test [base health](agents-spec.md#combatant-attributes) of 1 with the Bootstrap percentage gives `round up to hundredths(0.02) = 0.02` ([Health recovery](#health-recovery)).
- **Percentage above 100:** The Health recovery rate may exceed base health; current health after is still base health ([Recovery GDR validation](#recovery-gdr-validation)).
- **Exhaustion recovery rate of 0:** Exhaustion never falls on Standby or Recovery; health recovery and the move to Standby are unaffected ([Recovery GDR validation](#recovery-gdr-validation)).
- **Invalid GDRs:** A Game build with no RecoveryParameters, two RecoveryParameters, a missing or extra property, a `health_recovery_pct_per_turn` of 0, a negative `exhaustion_recovery_per_turn`, or either value written with more than two digits after the decimal point fails [Recovery GDR validation](#recovery-gdr-validation), and no Campaign is created from it.

# TODOs

- TODO (later): Recovery that depends on the kind of attack that took an Agent's current health, under [Several changes in one Turn](#several-changes-in-one-turn).
