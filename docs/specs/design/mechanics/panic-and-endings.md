# Panic and Endings

| Metadata | Value |
| --- | --- |
| Spec ID | ENDING |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Panic and how this Turn's changes to it are applied, the conditions that end a Campaign in Victory or Defeat, and what remains possible after a Campaign ending. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The [Agency](domain-model.md#agency-and-agents) wins by completing the [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) that game data makes the objective of the Campaign, and it loses when the public's alarm or its own debts get out of hand. [Panic](#glossary) measures that alarm: one [Campaign](../foundation/core-concepts.md#campaign-and-session)-wide value from 0% to 100% that [belongs directly](domain-model.md#campaign-and-agency) to [Campaign state](../foundation/core-concepts.md#campaign-and-session). It can rise, e.g. when a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) is ignored, and fall, e.g. after a Won [Initiative Mission](domain-model.md#leads-investigations-mission-sites-and-missions).

Within an Advance turn, [Panic](domain-model.md#campaign-standing) does not move with each event. Every Panic increase and Panic reduction joins the Pending panic change, and the Panic step applies their sum once, clamped to the range 0 to 100, so the order of events never changes the result. Right after it, the Ending check step decides whether the Campaign has a [Campaign ending](domain-model.md#campaign-standing): Victory when a `win_campaign` Effect was applied in the Advance turn, and otherwise Defeat when Panic reaches the Panic limit, the Agency's money is below zero, or an existential Faction operation was not stopped. A Campaign ending is final: every [Player action](../foundation/engine-contract.md#player-actions-and-turns) is then rejected, while every query keeps answering.

# Glossary

| Term | Definition |
| --- | --- |
| Panic limit | The [Panic](domain-model.md#campaign-standing) at which the [Campaign](../foundation/core-concepts.md#campaign-and-session) is lost: the value of `defeat_at_panic_pct` in the EndingParameters [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR). |
| Pending panic change | The sum of every Panic increase minus every Panic reduction that the rules of the earlier [Turn advancement steps](turn-advancement.md#turn-advancement-steps) of one Advance turn have added so far, which the [Turn advancement step](domain-model.md#turn-advancement-steps) Panic then applies. |
| Ending reason | A [condition](#ending-reasons) that held when a [Campaign ending](domain-model.md#campaign-standing) was recorded and caused it: Campaign objective achieved, Panic at the limit, Money below zero, or Existential operation not stopped. |
| Pending victory | Whether a `win_campaign` [Effect](../foundation/effect-lists.md#glossary) has been applied so far in one Advance turn, which the Ending check step then reads. |
| Pending defeat | Whether a `defeat` [Effect](../foundation/effect-lists.md#glossary) has been applied so far in one Advance turn; the Ending check step then reads it. |

# Panic and Campaign ending state

Panic and the Campaign ending describe the Campaign as a whole. They [belong directly to Campaign state](domain-model.md#campaign-and-agency) and not to the [Agency](domain-model.md#agency-and-agents), because the public's alarm is a property of the world the Agency acts in, not of the organization. Each of the following values is an [Authoritative value](../foundation/core-concepts.md#value-classification).

| Value | Meaning |
| --- | --- |
| Panic | The current Panic, a [Percent value](../foundation/numbers.md#glossary) from 0 to 100. It is a [Decimal quantity](../foundation/numbers.md#glossary), so that one event can change it by less than one percentage point, and it changes only in the [Panic step](#panic-step). |
| Campaign ending | Absent while the Campaign is being played; Victory or Defeat once the Campaign has finished. |
| Ending reasons | The set of [Ending reasons](#ending-reasons) that held when the Campaign ending was recorded; empty while the Campaign ending is absent. |
| Ending turn | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) whose Advance turn recorded the Campaign ending; absent while the Campaign ending is absent. |

## Initial values

A new Campaign starts with Panic 0 and without a Campaign ending. No GDR and no [Campaign configuration](../foundation/campaign-state.md#glossary) value supplies or changes either.

## Campaign ending lifecycle

The Campaign ending is in exactly one of the states No Campaign ending, Victory, and Defeat. It leaves No Campaign ending only in the [Ending check step](#ending-check-step), and Victory and Defeat are final within a [Timeline](../foundation/engine-contract.md#persisted-data): nothing clears or changes either.

Only [returning to a World state](../foundation/timeline.md#returning-to-a-world-state) from before the Advance turn that recorded the Campaign ending makes the Campaign one without a Campaign ending again, e.g. loading the [Turn-end Autosave](../foundation/saves.md#autosave-kinds) of the Turn that Advance turn ended. Play from there is ordinary play.

# EndingParameters

EndingParameters holds the one value that the ending rules read from game data.

| Property | Meaning | Read by |
| --- | --- | --- |
| `defeat_at_panic_pct` | A Percent value: the Panic limit. It is a whole number from 1 to 100, because below 1 every Campaign would be lost in its first Advance turn and above 100 Panic could never reach it. | [Ending reasons](#ending-reasons) |

# Pending panic change

The Pending panic change is how every other rule changes Panic, so that the order of the events of one Advance turn never changes the Panic they leave.

A rule that raises Panic adds a Panic increase to the Pending panic change, and a rule that lowers Panic adds a Panic reduction. Each is a Decimal quantity of at least 0 in Panic percentage points, never a percentage of the current Panic; e.g., a Panic increase of 0.30 raises a Panic of 40 to 40.30. Only rules of Turn advancement steps before the Panic step add one.

Panic itself does not change while contributions are added, and nothing is clamped before the [Panic step](#panic-step): a contribution that on its own would take Panic above 100 or below 0 counts in full.

## Panic Effect kind

Game data changes Panic through one [Effect kind](../foundation/effect-lists.md#glossary), whose sign says whether Panic rises or falls.

The [definition of the Effect kind](../foundation/effect-lists.md#effect-kinds) `panic` is:

- **Value:** a number of Panic percentage points, as a Decimal quantity: positive, zero, or negative.
- **Change:** applying one [Effect](../foundation/effect-lists.md#glossary) with a positive value `v` adds a Panic increase of `v` to the Pending panic change, one with a negative value `−v` adds a Panic reduction of `v`, and one with the value 0 adds nothing. It never changes Panic directly.
- **Supplied inputs:** none.
- **Combined result:** the contributions of several Effects add up in the Pending panic change.

# Panic step

In the Turn advancement step Panic, Panic changes by the whole Pending panic change at once and is then kept within its range.

```text
Panic after = max( 0, min( 100, Panic before + Pending panic change ) )
```

The clamp is applied once, to the sum, and it never reads the Panic limit: Panic is clamped to 100 whatever `defeat_at_panic_pct` is. A change that the clamp discards is not remembered.

E.g., with a Panic of 97, Panic increases of 4 and 2.50, and a Panic reduction of 0.50, the Pending panic change is 6 and Panic becomes 100. A Panic reduction of 3 in the next Advance turn then takes Panic to 97, not to 100.

# Victory Effect kind

Game data wins the Campaign through one Effect kind, so that completing a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) can be the objective of the Campaign.

The [definition of the Effect kind](../foundation/effect-lists.md#effect-kinds) `win_campaign` is:

- **Value:** `true`.
- **Change:** applying one Effect makes the Pending victory yes for the rest of the Advance turn. It changes no other value.
- **Supplied inputs:** none.
- **Combined result:** several `win_campaign` Effects applied in one Advance turn have the result of one.

# Defeat Effect kind

Some losses end the Campaign outright, whatever Panic is, e.g. a Faction operation that destroys the Agency's headquarters. Such a loss does not move Panic: the Campaign ends with the Panic it had.

The [definition of the Effect kind](../foundation/effect-lists.md#effect-kinds) `defeat` is:

- **Value:** `true`.
- **Change:** applying one Effect makes the Pending defeat yes for the rest of the Advance turn. It changes no other value, and it adds nothing to the Pending panic change.
- **Supplied inputs:** none.
- **Combined result:** the Pending defeat is yes however many `defeat` Effects one Advance turn applies.

# Ending check step

In the Turn advancement step Ending check, the Campaign receives its Campaign ending when an Ending reason holds. [Victory](#victory) is tried first and [Defeat](#defeat) only when Victory does not hold; when neither holds, the Campaign continues. A rule may apply a `win_campaign` Effect or a `defeat` Effect only in a Turn advancement step before this one.

## Ending reasons

An Ending reason records why a Campaign ended, which matters for Defeat, whose three Ending reasons can hold separately or together.

| Ending reason | Recorded with | Holds when |
| --- | --- | --- |
| Campaign objective achieved | Victory | The Pending victory is yes. |
| Panic at the limit | Defeat | Panic is greater than or equal to the Panic limit; e.g., against a Panic limit of 80, a Panic of 80 is Defeat and a Panic of 79.99 is not. |
| Money below zero | Defeat | The Agency's money is less than 0; money of exactly 0 is not Defeat. |
| Existential operation not stopped | Defeat | The Pending defeat is yes. |

## Victory

Victory holds exactly when Campaign objective achieved holds. The Campaign ending then becomes Victory with that one Ending reason, and no Ending reason of Defeat is recorded, whatever Panic and money are.

Nothing else wins the Campaign; e.g., every Faction being [Eliminated](domain-model.md#factions) does not. Game data need not hold a `win_campaign` Effect, and a Campaign without one can end only in Defeat.

## Defeat

Defeat holds when Victory does not hold and at least one of Panic at the limit, Money below zero, and Existential operation not stopped holds. The Campaign ending then becomes Defeat, and its Ending reasons are every one of the three that holds.

# After a Campaign ending

A Campaign ending stops play and leaves everything readable.

Every state-changing action of [Player API](../foundation/engine-contract.md#api-surfaces) and of [Developer API](../foundation/engine-contract.md#api-surfaces) is rejected, including Advance turn and every [Player cheat action](../foundation/engine-contract.md#player-actions-and-turns): that the Campaign has no Campaign ending is a precondition of each. Every query answers as it does at any other [World state](../foundation/engine-contract.md#player-actions-and-turns), e.g. `getTurnReport()` and `getHistory()`.

The operations of [Session API](../foundation/engine-contract.md#api-surfaces) are not [Player actions](../foundation/engine-contract.md#player-actions-and-turns), and a Campaign ending rejects none of them, e.g. saving, Timeline navigation, and closing the [Current campaign](../foundation/core-concepts.md#campaign-and-session).

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds Panic in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) and after the Advance turn, and the Campaign ending it recorded with its Ending reasons, or none. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds Panic after the Advance turn and the Campaign ending it recorded, without its Ending reasons, or none, and holds Panic in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the Turn-end state of that Turn.

# Player-visible information

A player plans around how close the Campaign is to Defeat, so nothing a World state holds about Panic or the Campaign ending is hidden. Panic, the Panic limit, the Campaign ending, the Ending reasons, and the Ending turn are [Player-visible information](../foundation/engine-contract.md#api-surfaces) from campaign creation. The Pending panic change, the Pending victory, and the Pending defeat are not.

# TODOs

- TODO (later): Effects of Panic other than Defeat, e.g. an effect on funding, in [Panic and Campaign ending state](#panic-and-campaign-ending-state).
