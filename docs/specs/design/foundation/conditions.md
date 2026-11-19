# Conditions

| Metadata | Value |
| --- | --- |
| Spec ID | COND |
| Family | Foundation |
| Audience | Engine designer, Content designer, Implementer |
| Owns | How game data declares a yes-or-no question about a Campaign: Conditions, Condition kinds, and how Conditions combine. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A game keeps asking whether something may happen yet, e.g. whether a door can be opened or a quest offered. When the answer depends on what the player has done so far, it is content, so it is game data that the Content designer authors, and a new requirement needs no new rule.

A GDR states such a question as a Condition, which holds or does not hold in each World state. A simple Condition names one Condition kind, a single fact that can be checked, and gives it one value. Conditions also combine, with "all", "any", and "not", to any depth, because asking changes nothing: however a Condition is built, evaluating it has no effect and no order to get wrong.

The work is shared as for Effect Lists, which this stands beside. The specification that owns a fact defines the Condition kind that checks it, once. The specification that owns the GDR property says what its Condition decides and which Condition kinds it may use.

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Condition | A yes-or-no question about a [Campaign](core-concepts.md#campaign-and-session) that game data declares, e.g. whether a key was found, which holds or does not hold in each World state. |  |
| Condition kind | A named kind of single fact that a Condition can check, e.g. that a key was found, together with what its value means. |  |

# Condition format

A Condition is written in the same way in every [GDR](core-concepts.md#game-build-and-content), so that a Content designer who has written one can write any other.

A Condition is a map with exactly one key, and the key decides which of four forms it has. This table is exhaustive.

| Key | Value | The Condition holds exactly when |
| --- | --- | --- |
| The name of a Condition kind | The value that the Condition kind defines. | The fact the Condition kind checks is true for that value, as its definition states. |
| `all` | A list of Conditions, possibly empty. | Every Condition of the list holds. An empty list holds. |
| `any` | A list of Conditions, possibly empty. | At least one Condition of the list holds. An empty list does not hold. |
| `not` | One Condition. | That Condition does not hold. |

The Conditions inside `all`, `any`, and `not` have these same four forms, to any depth. The order of the Conditions in a list has no meaning. A map with no key, with more than one key, or with a key that is none of these is invalid, and so no Condition kind is named `all`, `any`, or `not`.

E.g., a Condition that holds when the bronze key was found and not lost, or when the gate was already opened, in the [GDR authoring format](game-data-records.md#gdr-authoring-format):

```yaml
opens_when:
  any:
    - all:
        - item_found: bronze_key
        - not:
            item_lost: bronze_key
    - gate_opened: north_gate
```

# Condition kinds

A Condition kind belongs with the fact it checks, so that one specification answers every question about that fact.

Each Condition kind is defined by exactly one specification: the one that owns the fact a Condition of the kind checks. The definition states all of the following, and this list is exhaustive:

1. **Name:** the name of the Condition kind as a Condition writes it, e.g. `item_found`. No two Condition kinds have the same name.
2. **Value:** the shape and range of the value a Condition of the kind may have, e.g. the identifier of an item.
3. **When it holds:** exactly when a Condition of the kind holds, as a statement about one [World state](engine-contract.md#player-actions-and-turns) and the GDRs.
4. **Supplied inputs:** anything the check needs that the Condition's value does not give, which the rule that evaluates the Condition supplies, e.g. which character must hold the item.

The Condition kinds of a [Game build](core-concepts.md#game-build-and-content) are exactly those its specifications define. Game data cannot add one.

# Evaluating a Condition

A Condition decides nothing by being authored. A rule evaluates it, and that rule belongs to the specification that owns the GDR [Property](core-concepts.md#data-modeling) holding the Condition.

The specification that owns a GDR property holding a Condition states all of the following, and this list is exhaustive:

1. **What it decides:** which rule evaluates the Condition, and what follows when it holds and when it does not, e.g. that a gate can be opened only while its Condition holds.
2. **Permitted Condition kinds:** which Condition kinds the Condition may use, at any depth.
3. **Omission:** whether a GDR may omit the property. An omitted Condition always holds.
4. **Supplied inputs:** what the evaluating rule supplies to each permitted Condition kind that needs a supplied input. One evaluation supplies the same inputs to every part of the Condition.

Evaluating a Condition has these complete properties:

- **It reads one World state:** Whether a Condition holds is a [Derived value](core-concepts.md#value-classification) of the World state in which it is evaluated, of the supplied inputs, and of the GDRs. It reads no earlier World state.
- **It changes nothing:** Evaluating a Condition changes no value, however often and in whatever order its parts are evaluated.
- **It may hold and stop holding:** A Condition that holds in one World state need not hold in a later one, unless every Condition kind it uses checks a fact that never stops being true and it uses no `not`. A rule that needs a lasting answer records it as an [Authoritative value](core-concepts.md#value-classification) when the Condition first holds.

A GDR whose Condition violates [Condition format](#condition-format), uses a Condition kind its property does not permit, or gives a Condition kind a value outside its range makes the Game build defective: no [Campaign](core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](engine-contract.md#world-state-integrity) in Engine Contract.

Whether a Condition, or any part of one, holds is not [Player-visible information](engine-contract.md#api-surfaces) unless the specification that owns its property says so.
