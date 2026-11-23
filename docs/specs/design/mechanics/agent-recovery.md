# Agent Recovery

| Metadata | Value |
| --- | --- |
| Spec ID | RECOVER |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Health recovery and exhaustion recovery of Agents, and the RecoveryParameters GDR. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A wounded or worn-down [Agent](domain-model.md#agency-and-agents) works and fights worse, so getting it back to full strength matters, and it takes time. An [Agent](domain-model.md#glossary) regains lost current health only on [Recovery](agents-spec.md#assignments), and sheds exhaustion only on [Standby](agents-spec.md#assignments) or Recovery, while work and Missions keep adding to it.

Recovery is gradual and cannot be rushed. In each Advance turn, a [Recovering](agents-spec.md#agent-statuses) Agent regains a share of its effective max health, a Recovering Agent or an Agent [At assignment](agents-spec.md#agent-statuses) on Standby loses a fixed amount of exhaustion, and an Agent [In transit](agents-spec.md#agent-statuses) recovers nothing. Recovery ends by itself the moment current health reaches effective max health: the Agent becomes Standby at once, without transit, and the player cannot end Recovery sooner. Both rates start from one RecoveryParameters [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR), and the Agency can raise each with an [Upgrade](economy-and-upgrades.md#glossary).

Agent Recovery builds on [Agents](agents-spec.md): Agents says what current health and exhaustion are and how they lower effective skill, and Agent Recovery says how they return over time.

# Glossary

| Term | Definition |
| --- | --- |
| Health recovery rate | The [current health](agents-spec.md#combatant-attributes), as a [Decimal quantity](../foundation/numbers.md#glossary), that one [Agent](domain-model.md#agency-and-agents) regains in each Advance turn in which it recovers; it depends on the Agent's [effective max health](agents-spec.md#combatant-attributes). |
| Recovery turns remaining | The number of further Advance turns in which an Agent on [Recovery](agents-spec.md#assignments) will regain current health before its current health reaches its effective max health, counted from the first Advance turn in which the Agent is [Recovering](agents-spec.md#agent-statuses). |

# Recovery parameters

RecoveryParameters bundles the two recovery rates. Each property is the starting value of a rate that a [Rate Upgrade](economy-and-upgrades.md#rate-upgrades) raises.

| Property | Meaning | Read by |
| --- | --- | --- |
| `health_recovery_pct_per_turn` | A [Percent value](../foundation/numbers.md#glossary): the percent of an Agent's effective max health that its current health rises by in one Advance turn, before any [Upgrade](domain-model.md#agency-and-agents). It is a Decimal quantity greater than 0, because at 0 an Agent would never leave Recovery. | [Health recovery](#health-recovery) |
| `exhaustion_recovery_per_turn` | The [Exact exhaustion](agents-spec.md#combatant-attributes) an Agent loses in one Advance turn, before any Upgrade. It is a Decimal quantity of at least 0, and at 0 [exhaustion](agents-spec.md#combatant-attributes) never falls. | [Exhaustion recovery](#exhaustion-recovery) |

# Which Agents recover

Recovery is tied to where an Agent is and what it is doing: only an Agent that has arrived at [Standby](agents-spec.md#assignments) or Recovery recovers.

In the Agent recovery step of an Advance turn, an Agent recovers when it is [Serving](agents-spec.md#agent-statuses), it is not [In transit](agents-spec.md#agent-statuses), and its [Assignment](domain-model.md#agency-and-agents) is one that recovers:

| Assignment | Current health recovers | Exhaustion recovers |
| ---------- | ----------------------- | ------------------- |
| Recovery   | Yes                     | Yes                 |
| Standby    | No                      | Yes                 |
| Any other  | No                      | No                  |

The [Agent status](domain-model.md#agency-and-agents) and the Assignment that decide this are those at the start of the step, so an Agent recovers at most once in an Advance turn: an Agent whose Recovery ends in the step has recovered exhaustion as an Agent on Recovery, and does not recover it again as an Agent on Standby.

# Health recovery

An Agent recovers a percentage of its effective max health in each Advance turn.

```text
Health recovery rate = round up to hundredths( p × effective max health / 100 )
```

Here p is the health recovery percentage: `health_recovery_pct_per_turn` plus what every acquired Upgrade with the effect `health_recovery` adds. The expression is [evaluated exactly](../foundation/numbers.md#exact-evaluation) and [rounded](../foundation/numbers.md#rounding) once, at the end.

E.g., with an effective max health of 31 and a p of 2.2, the Health recovery rate is `round up to hundredths(0.682) = 0.69`.

In the Agent recovery step, each Agent that recovers current health receives the rate, up to its effective max health:

```text
current health after = min( effective max health, current health before + Health recovery rate )
```

When current health after equals effective max health, Recovery ends in the same step: the Agent's Assignment becomes Standby and its Agent status becomes [At assignment](domain-model.md#agency-and-agents), without transit. The comparison is exact; e.g., a current health of 29.99 against an effective max health of 30 does not end Recovery.

Nothing else ends Recovery. An Agent on Recovery [cannot take orders](agents-spec.md#agents-that-can-take-orders), and no [Player action](../foundation/engine-contract.md#player-actions-and-turns) ends Recovery early.

# Exhaustion recovery

Exhaustion falls by a fixed amount in each Advance turn of rest, whatever the Agent's attributes.

```text
Exact exhaustion after = max( 0, Exact exhaustion before − exhaustion recovery )
```

Here exhaustion recovery is `exhaustion_recovery_per_turn` plus what every acquired Upgrade with the effect `exhaustion_recovery` adds. The amount is the same on Standby and on Recovery, and it does not depend on the current health recovered in the same step.

E.g., an Exact exhaustion of 5 that recovers 1.6 becomes 3.40, which is an [exhaustion](agents-spec.md#exhaustion-and-exact-exhaustion) of 4.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, for each Agent that recovers in it, in the order of the Agents in [Campaign state](../foundation/core-concepts.md#campaign-and-session), its [Instance ID](../foundation/campaign-instances.md#glossary), its current health, Exact exhaustion, and exhaustion after its recovery step, and whether its Recovery ended in it. The [History entry](../foundation/world-history.md#glossary) of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) the Advance turn ends holds none of these.

# Player-visible information

A player plans around how long an Agent will be out, so nothing about recovery is hidden. Every property of RecoveryParameters, an Agent's Health recovery rate, and its Recovery turns remaining are [Player-visible information](../foundation/engine-contract.md#api-surfaces) from the moment they exist. The two rates of an Agent are [Derived values](../foundation/core-concepts.md#value-classification).

```text
Recovery turns remaining = round up( (effective max health − current health) / Health recovery rate )
```

The Health recovery rate is reported for every Serving Agent. The Recovery turns remaining is reported for a Serving Agent whose Assignment is Recovery, whatever its Agent status, and is absent for every other Agent.

E.g., an Agent In transit to Recovery with Recovery turns remaining 8 recovers nothing in the Advance turn in which it arrives, and recovers current health in each of the 8 Advance turns after that one.

# TODOs

- TODO (later): Recovery that depends on the kind of attack that took an Agent's current health.
