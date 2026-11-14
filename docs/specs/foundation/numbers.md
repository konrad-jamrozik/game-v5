# Numbers

| Metadata    | Value                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | NUMBERS                                                                                                                                      |
| Family      | Foundation                                                                                                                                   |
| Status      | Draft                                                                                                                                        |
| Audience    | Engine designer, Implementer                                                                                                                 |
| Owns        | That every stored quantity is a whole number, the rounding operations, how percentages and probabilities are computed, and exact evaluation. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                               |

# Overview

This document defines how the game's numbers behave: every stored quantity is a whole number, a formula that produces
a fraction names the rounding operation that turns it into a whole number, and a probability is an exact ratio of whole
numbers that is never stored and never rounded. Together these make every computed value, and every comparison of a
random outcome against a probability, identical on every machine.

These rules are observable, e.g. through the amounts the engine API reports and a Campaign save holds, so they are
requirements on every implementation. They are **v5 requirements**: the inherited game stored some quantities as
fixed-point decimals and rounded at several different places, and v5 replaces that with the single scheme below so that
every acceptance example is exact.

This document is a Foundation specification and depends on no Mechanics specification. It therefore describes kinds of
quantity generically; each Mechanics specification states the range of each quantity it owns and the rounding of each
formula it owns, and links this document for the operations. Game quantities appear here only inside examples.

This document owns nothing about randomness beyond the arithmetic of probabilities. [Determinism](determinism-and-randomness.md#determinism)
and [Campaign seed](determinism-and-randomness.md#campaign-seed) in Determinism and Randomness own reproducibility and
the Campaign seed, and each Mechanics specification owns the distributions of its own random outcomes. This document
owns what a probability is as a number, and the one distribution that other specifications reference by name, the
[Uniform whole-number outcomes](#uniform-whole-number-outcomes).

# Relationships

- Uses [Determinism and Randomness](determinism-and-randomness.md)
- Used by [Agent Recovery](../mechanics/agent-recovery.md)
- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Combat](../mechanics/combat.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Investigations](../mechanics/investigations.md)
- Used by [Missions](../mechanics/missions.md)
- Used by [Panic and Endings](../mechanics/panic-and-endings.md)

# Glossary

Campaign state, GDR, and Derived value are defined by the [Core Concepts glossary](core-concepts.md#glossary). Campaign
save and Player action are defined by the [Engine Contract glossary](engine-contract.md#glossary). Campaign seed is
defined by the [Determinism and Randomness glossary](determinism-and-randomness.md#glossary).

| Term          | Definition                                                                                                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Round down    | The operation that turns a number into the greatest whole number that is less than or equal to it. A number that is already whole is unchanged. It moves toward lower numbers, not toward zero.     |
| Round up      | The operation that turns a number into the least whole number that is greater than or equal to it. A number that is already whole is unchanged. It moves toward higher numbers, not away from zero. |
| Percent value | A number of percent, i.e. hundredths, expressed as a whole number. A Percent value of 40 stands for 40 hundredths.                                                                                  |
| Probability   | The chance that a random outcome takes a stated value, expressed as an exact ratio of two whole numbers whose divisor is greater than zero. It is never stored and never rounded.                   |

# Whole-number quantities

**v5 requirement:** Every stored quantity is a whole number, with no exception. A stored quantity is any value that
Campaign state holds or that a Campaign save keeps, whatever it measures, e.g. an amount of money, a count, or a number
of percent. E.g., a stored quantity of 12 percent is stored as the whole number 12, never as 0.12 or 12.0 with a
fractional part. A whole number is an integer: it has no
fractional part and no limit on its size is set by this document.

No Campaign state, Campaign save, or engine API value that represents a stored quantity may hold a fractional part, and
no implementation may hold one in an unrounded form between Player actions. A value that is not stored may have a
fractional part only as an intermediate result inside a single formula, under [Exact evaluation](#exact-evaluation).

**Ranges.** This document sets one general rule: unless the Mechanics specification that owns a quantity states
otherwise, a stored quantity is a nonnegative whole number. A Mechanics specification that allows a quantity to be
negative, or bounds it above, states so where it owns the quantity. E.g., one quantity may be allowed to be negative,
another may be capped at 100, and another may count from 1. Arithmetic that would take a stored quantity outside its stated range is handled by the owning
specification's rule, e.g. by clamping or by rejecting a Player action; this document never silently clamps.

**Fractional GDR values.** A GDR value that is a ratio rather than a quantity, e.g. a damage range of 0.5, is not a
stored quantity. It is read as the exact decimal number it is written as, i.e. as the ratio of whole numbers it denotes
(0.5 is 1 over 2), never as a binary floating-point approximation. **Proposed rule:** a formula that reads such a
value computes with it exactly, under [Exact evaluation](#exact-evaluation).

# Rounding

Exactly two rounding operations exist: Round down and Round up. They are defined for every rational number, including
negative ones:

| Operation  | Result for a number x                              | e.g. x = 2.4 | e.g. x = 2 | e.g. x = 0.6 | e.g. x = 0 | e.g. x = -0.5 | e.g. x = -2.4 |
| ---------- | -------------------------------------------------- | ------------ | ---------- | ------------ | ---------- | ------------- | ------------- |
| Round down | The greatest whole number less than or equal to x. | 2            | 2          | 0            | 0          | -1            | -3            |
| Round up   | The least whole number greater than or equal to x. | 3            | 2          | 1            | 0          | 0             | -2            |

Both operations leave an exact whole value unchanged: Round down of 2 is 2, and Round up of 2 is 2. Neither operation
rounds toward zero, to the nearest whole number, or to even; a value exactly halfway between two whole numbers has no
special case, because each operation is defined by direction alone. E.g., Round down of 7.5 is 7 and Round up of 7.5
is 8.

**Every formula names its rounding.** **v5 requirement:** A formula that can produce a fraction must state which
operation it applies and at which point of the expression. A formula that omits the rounding of a possible fraction is
incomplete and must not be implemented by guessing. A formula whose every possible result is a whole number states
that no rounding occurs. E.g., `round down((8 × 2) / 3)` is 5, but rounding 8 / 3 first and then multiplying by 2 gives 4, so the formula's own
wording decides where rounding occurs.

In this document and in every specification that links it, the notation `round down( … )` and `round up( … )` names
these operations, and the rounding is applied exactly once at the point where the notation encloses the expression, to
the exact value of that expression.

# Exact evaluation

**v5 requirement:** A formula is evaluated exactly, as if with unlimited-precision rational arithmetic, and is rounded
only where the formula names a rounding. The result must equal the result of that exact evaluation. In particular:

- No intermediate result is rounded, truncated, or converted to a binary floating-point number. E.g., computing
  `10 × (1 − 0.5)` through a floating-point number is not permitted, even where it happens to give the same result.
- Multiplication happens before division within a term, so that no precision is lost, and the order in which the
  formula states its terms does not change the result, because exact arithmetic is associative and commutative for the
  operations used.
- The size of a result is not limited by this document. An implementation must compute exactly for every value that can
  arise in a Campaign. It must not wrap around, saturate, or approximate; a stored quantity and an intermediate result
  that exceed what its machine representation holds must be handled with a wider exact representation.
- A division whose divisor is zero has no value. A formula whose divisor can be zero states what happens in that case;
  if it does not, a zero divisor is an internal invariant violation under
  [Edge cases and failure behavior](#edge-cases-and-failure-behavior), not an expected case.

# Percent values

**v5 requirement:** A percentage is a Percent value: a whole number of percent. A fraction of percent does not exist.
A Percent value may exceed 100 or be negative only where the owning specification states so.

**p percent of x** means `(p × x) / 100`, evaluated exactly: multiply first, then divide by 100, then apply the
rounding the formula names. E.g., 2 percent of 30 is `(2 × 30) / 100 = 0.6`; with Round up it is 1, and with Round down
it is 0. When x is itself a whole number the exact result is a fraction with at most two decimal digits, so rounding is
the only source of imprecision.

**A Percent value is not always a multiplier.** "p percent of x" is multiplicative: the Percent value p scales another
quantity x. A quantity that is itself measured in percentage points is different: it is a whole number of percentage
points, and a rule changes it by adding or subtracting a whole number of percentage points, never by multiplying it.
E.g., a quantity from 0 to 100 that rises by 3 goes from 40 to 43, and does not become 3 percent of 40. A Game Data
Record (GDR) property that holds percentage points is a Percent value only in this additive sense, and the rule that
reads it states which of the two meanings it has.

A formula never divides by 100 first and rounds the result before multiplying, unless it states so; the order above is
the default meaning of "p percent of x".

# Probabilities

**v5 requirement:** A Probability is an exact ratio `n / d` of two whole numbers with `d` greater than zero, as the
glossary defines. The following rules are complete:

- **Never stored:** A Probability is a Derived value computed when needed. No Campaign state, Campaign save, or
  engine API value holds a Probability as a stored quantity; where the engine API reports one, e.g. in a
  query, it reports the pair `n` and `d` of whole numbers, not a rounded decimal. A Mechanics specification that
  shows a Probability to the player states its presentation under its Player-visible information.
- **Never rounded:** No rounding is applied to a Probability, neither Round down nor Round up, unless a formula states a
  rounding explicitly for a displayed value. Two ratios are the same Probability when their cross products are equal;
  e.g., 10000 / 11600 and 25 / 29 are the same Probability.
- **Clamping:** A Probability must lie from 0 to 1 inclusive. A formula whose ratio can fall outside that range states
  a clamp, i.e. a minimum with 1 or a maximum with 0, and clamping is exact. E.g., a ratio of 12 / 10 that is clamped
  to at most 1 is 1, and a ratio of -3 / 10 that is clamped to at least 0 is 0. A ratio outside 0 to 1 that no formula
  clamps is an internal invariant violation.
- **Comparison:** Deciding whether a random outcome with a Probability `n / d` takes the stated value must give the same
  result on every machine for the same random outcome. The decision is exact: a Probability of 0 never takes the value,
  a Probability of 1 always takes the value, and no floating-point intermediate may change which side of the comparison
  a random outcome falls on. Among Campaigns that differ only in their Campaign seed, the value is taken in exactly
  `n / d` of them, as [Random outcomes](determinism-and-randomness.md#random-outcomes) requires.

# Uniform whole-number outcomes

A uniform whole-number outcome over the inclusive range from `lo` to `hi` is a random outcome defined as follows, for
other specifications to reference. It states a distribution only; when the outcome is drawn, in which order, and from
which source are the implementer's choice under [Scope of the guarantee](determinism-and-randomness.md#scope-of-the-guarantee).

- `lo` and `hi` are whole numbers with `lo` less than or equal to `hi`. A range with `hi` less than `lo` is an internal
  invariant violation.
- The outcome is a whole number from `lo` to `hi`, both included.
- Each of the `hi − lo + 1` possible values has the same Probability, `1 / (hi − lo + 1)`.
- When `lo` equals `hi` there is exactly one possible value, and the outcome is that value with Probability 1. It is
  still a distinct named random outcome for the specification that names it.

E.g., a uniform whole-number outcome over 5 to 15 has 11 possible values, each with Probability 1 / 11, and one over 7
to 7 is always 7.

A specification that derives the bounds from a formula applies the rounding the formula names to each bound before the
range is formed. E.g., a base of 10 and a ratio of 0.5 give the lower bound `round up(10 × (1 − 0.5)) = 5` and the
upper bound `round down(10 × (1 + 0.5)) = 15`, so an outcome with those bounds is a uniform whole-number outcome over 5
to 15.

# Edge cases and failure behavior

- **Exact whole values:** Round down and Round up of a whole number are that number. E.g., 2 percent of 50 is exactly 1,
  so Round up gives 1, not 2.
- **Negative values:** Round down of a negative fraction moves to the more negative whole number, and Round up moves to
  the less negative one. E.g., Round down of -0.5 is -1 and Round up of -0.5 is 0.
- **Zero:** Zero is a whole number; Round down and Round up of zero are zero, and a percent of zero is zero.
- **Halfway values:** A value exactly halfway between two whole numbers has no special case; each operation applies by
  direction. E.g., Round up of 7.5 is 8 and Round down of 7.5 is 7.
- **Zero divisor:** A formula that divides by a value that can be zero must state the result in that case. A formula
  that does not and meets a zero divisor is an internal invariant violation, not an expected rejection of a Player
  action.
- **Result outside its range:** An exact result that falls outside the stated range of its quantity is handled only by
  the owning specification's rule. This document does not clamp it.
- **Probability outside 0 to 1:** Handled by a clamp that the formula states; otherwise an internal invariant violation.
- **Degenerate range:** A uniform whole-number outcome with `lo` equal to `hi` is valid and has one possible value.
- **Large values:** Results larger than a machine word are valid. Wrapping, saturating, or approximating them is a
  violation of [Exact evaluation](#exact-evaluation).
- **Floating-point drift:** An implementation whose outcome differs from the exact result because of binary
  floating-point arithmetic does not conform, even when the difference is only visible for some inputs.

# Acceptance examples

- **Round up a fraction:** 2 percent of 30, rounded up, is `round up((2 × 30) / 100) = round up(0.6) = 1`. The same
  formula rounded down gives 0 ([Percent values](#percent-values), [Rounding](#rounding)).
- **Round up an exact whole value:** 2 percent of 50 rounded up is `round up(100 / 100) = 1`, and 2 percent of 100
  rounded up is 2 ([Rounding](#rounding), [Percent values](#percent-values)).
- **Bounds from a base and a ratio, even base:** A base of 10 and a ratio of 0.5 give the lower bound
  `round up(10 × (1 − 0.5)) = round up(5) = 5` and the upper bound `round down(10 × (1 + 0.5)) = round down(15) = 15`.
  The outcome is a uniform whole-number outcome over 5 to 15, i.e. 11 possible values, each with Probability 1 / 11
  ([Exact evaluation](#exact-evaluation), [Uniform whole-number outcomes](#uniform-whole-number-outcomes)).
- **Bounds from a base and a ratio, other bases:** A base of 22 gives `round up(22 × 0.5) = 11` and
  `round down(22 × 1.5) = 33`, i.e. 11 to 33. A base of 14 gives `round up(7) = 7` and `round down(21) = 21`, i.e. 7 to
  21 ([Uniform whole-number outcomes](#uniform-whole-number-outcomes)).
- **Bounds from a base and a ratio, odd base:** A base of 15 gives `round up(7.5) = 8` and `round down(22.5) = 22`, i.e.
  8 to 22. The two bounds round in opposite directions, so the range is narrower than 7.5 to 22.5
  ([Rounding](#rounding)).
- **Degenerate range:** A uniform whole-number outcome over 1 to 1 is always 1, with Probability 1
  ([Uniform whole-number outcomes](#uniform-whole-number-outcomes)).
- **Negative rounding:** Round down of -0.5 is -1, Round up of -0.5 is 0, Round down of -2.4 is -3, and Round up of
  -2.4 is -2 ([Rounding](#rounding), [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **Exact ratio, same Probability:** The ratios 10000 / 11600 and 25 / 29 are the same Probability, because the cross
  products are equal: 10000 × 29 = 290000 = 25 × 11600. The Probability is never rounded or stored as a decimal
  ([Probabilities](#probabilities), [Exact evaluation](#exact-evaluation)).
- **Probability comparison:** A random outcome takes a stated value with the Probability 25 / 29. Among Campaigns that
  differ only in their Campaign seed, it takes the value in exactly 25 / 29 of them, and for one Campaign seed it takes
  the value or not identically on every machine; no floating-point value may change that result
  ([Probabilities](#probabilities)).
- **Clamping:** A ratio of 6 / 5 that a formula clamps to at most 1 is exactly 1, and a ratio of 2 / 5 under the same
  clamp stays 2 / 5. A ratio of -3 / 10 that a formula clamps to at least 0 is 0 ([Probabilities](#probabilities)).
- **Rounding point:** `round down((8 × 2) / 3)` is `round down(5.333…) = 5`, whereas rounding 8 / 3 down to 2 first and
  then multiplying by 2 gives 4. The formula's own wording decides, so a formula states its rounding point
  ([Rounding](#rounding), [Exact evaluation](#exact-evaluation)).
- **Percentage points are added, not multiplied:** A quantity of 40 percentage points that a rule raises by 3 is 43,
  whereas 3 percent of 40 is `(3 × 40) / 100 = 1.2`, a different meaning that applies only where a rule says "percent
  of" ([Percent values](#percent-values)).
- **Whole-number storage:** After adding 1 to a stored quantity of 7, the stored quantity is 8 in Campaign state, in the
  Campaign save, and in every engine API result, with no fractional part
  ([Whole-number quantities](#whole-number-quantities)).
