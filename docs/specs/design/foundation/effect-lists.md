# Effect Lists

| Metadata | Value |
| --- | --- |
| Spec ID | EFFECT |
| Family | Foundation |
| Audience | Engine designer, Content designer, Implementer |
| Owns | How game data declares the changes the Game rules make on one occasion: Effects, Effect kinds, and Effect lists. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Much of a game follows one pattern: something happens, and a few values change because of it, e.g. a battle is won and the winner gains money. Which values change, and by how much, is a matter of content and balance, so it is game data that the Content designer authors, and a new reward or penalty needs no new rule.

A GDR states such changes as an Effect list: a plain list of Effects, each naming one Effect kind and giving it one value. Two specifications share every Effect list. The specification that owns a value defines the Effect kind that changes it, once, so the value changes in the same way wherever an Effect of that kind is applied. The specification that owns the GDR property says when its Effect list is applied and which Effect kinds it may hold.

An Effect list is deliberately plain. It holds no Effect inside another and no condition, and the order of its Effects never matters, so reading one shows exactly what will change.

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Effect | One change to a [Campaign](core-concepts.md#campaign-and-session) that game data declares, e.g. a gain of money: one Effect kind together with one value. |  |
| Effect kind | A named kind of change that an Effect can declare, e.g. a change of money, together with what its value means. |  |
| Effect list | The Effects that game data declares for one occasion, e.g. for winning a battle, which are applied together. |  |

# Effect list format

An Effect list is written in the same way in every [GDR](core-concepts.md#game-build-and-content), so that a Content designer who has written one can write any other.

The following rules are complete:

- **A list of Effects:** An Effect list is the value of one [Property](core-concepts.md#data-modeling) of a GDR. It is a list, possibly empty, and each of its entries is one Effect.
- **One Effect kind and one value:** Each Effect is a map with exactly one key. The key is the name of its Effect kind, and the value of that key is the Effect's value. An entry with no key or with more than one key is invalid.
- **At most one Effect of each Effect kind:** No two Effects of one Effect list have the same Effect kind.
- **Order has no meaning:** Two Effect lists that hold the same Effects in a different order are the same Effect list.
- **Nothing else:** An Effect holds no Effect list, no other Effect, and no condition under which it applies.

E.g., an Effect list of two Effects, in the [GDR authoring format](game-data-records.md#gdr-authoring-format):

```yaml
on_victory:
  - money: 50
  - reputation: -2
```

# Effect kinds

An Effect kind belongs with the value it changes, so that one specification answers every question about how that value changes.

Each Effect kind is defined by exactly one specification: the one that owns the value, or the [Campaign instance](core-concepts.md#campaign-instances), that an Effect of the kind changes. The definition states all of the following, and this list is exhaustive:

1. **Name:** the name of the Effect kind as an Effect list writes it, e.g. `money`. No two Effect kinds have the same name.
2. **Value:** the shape and range of the value an Effect of the kind may have, e.g. a whole number that may be negative.
3. **Change:** exactly what applying one Effect of the kind changes, and when the change takes place.
4. **Supplied inputs:** anything the change needs that the Effect's value does not give, which the rule that applies the Effect supplies, e.g. which participant of a battle gains the money.
5. **Combined result:** the result when several Effects of the kind are applied to the same value within one [Player action](engine-contract.md#player-actions-and-turns), or within one of the parts into which the [Game rules](core-concepts.md#game-build-and-content) divide an Advance turn. The result must not depend on the order in which the Effects are applied.

The Effect kinds of a [Game build](core-concepts.md#game-build-and-content) are exactly those its specifications define. Game data cannot add one, and an Effect whose key is not the name of an Effect kind is invalid.

# Applying an Effect list

An Effect list changes nothing by being authored. A rule applies it, and that rule belongs to the specification that owns the GDR property holding the Effect list.

The specification that owns a GDR property holding an Effect list states all of the following, and this list is exhaustive:

1. **Occasion:** which rule applies the Effect list, and when, e.g. the rule that resolves a battle, for the winner's side.
2. **Permitted Effect kinds:** which Effect kinds the Effect list may hold, and any range of their values that is narrower than the Effect kind's own, e.g. that a reward's `money` Effect has a value of at least 0.
3. **Omission:** whether a GDR may omit the property. An omitted Effect list is an empty Effect list.
4. **Supplied inputs:** what the applying rule supplies to each permitted Effect kind that needs a supplied input.

Applying an Effect list has these complete results:

- **Each Effect once:** Each Effect of the list is applied exactly once, as its Effect kind's definition states. An empty Effect list changes nothing.
- **Nothing besides its Effects:** Applying an Effect list changes nothing except what its Effects change.
- **Order independence:** The result does not depend on the order of the Effects in the list, nor on the order in which an implementation applies several Effect lists whose combined result their Effect kinds define.

A GDR whose Effect list violates [Effect list format](#effect-list-format), holds an Effect of a kind its property does not permit, or holds an Effect whose value is outside the permitted range makes the Game build defective: no [Campaign](core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](engine-contract.md#world-state-integrity) in Engine Contract.

# TODOs

- TODO (later): Conditions that game data declares, i.e. yes-or-no questions about a Campaign that combine with "and", "or", and "not".
