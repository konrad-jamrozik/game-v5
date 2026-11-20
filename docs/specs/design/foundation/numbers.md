# Numbers

| Metadata | Value |
| --- | --- |
| Spec ID | NUMBERS |
| Family | Foundation |
| Audience | Engine designer, Implementer |
| Owns | That every stored quantity is held as a whole number, of units or of hundredths, the rounding operations, how percentages and probabilities are computed, and exact evaluation. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Every number in the game must come out exactly the same everywhere, e.g. on every machine and in every test. Nothing may depend on how a computer happens to approximate a fraction.

The guiding principle is that only whole numbers last. Every stored quantity is held as a whole number: a Whole quantity counts units, e.g. an amount of money or a count, and a Decimal quantity counts hundredths of a unit, e.g. 1.33 health points held as 133, so that a quantity can grow by less than one unit without any number being approximated. Any finer fraction may appear only inside one formula, which is evaluated exactly and names where it applies Round down or Round up, the only two rounding operations, and whether to a whole number or to hundredths. A percentage is a Percent value, a number of percent.

A Probability is kept exact instead: it is a ratio of two whole numbers, never stored and never rounded, so whether a random outcome takes a stated value is decided identically on every machine. How random outcomes are drawn is stated in [Determinism and Randomness](determinism-and-randomness.md).

# Glossary

These terms are specific to numbers. General terms are in the [Core Concepts glossary](core-concepts.md#glossary); terms about saves, actions, and the seed are in the [Engine Contract](engine-contract.md#glossary) and [Determinism and Randomness](determinism-and-randomness.md#glossary) glossaries.

| Term | Definition |
| --- | --- |
| Whole quantity | A stored quantity that is a whole number of its unit, e.g. an amount of money or a count. Every stored quantity is one unless the specification that defines it names it a Decimal quantity. |
| Decimal quantity | A stored quantity with exactly two decimal places, i.e. a whole multiple of 0.01 of its unit, held as its whole number of hundredths. E.g., 1.33 health points are held as 133. |
| Round down | The operation that turns a number into the greatest whole number that is less than or equal to it. A number that is already whole is unchanged. It moves toward lower numbers, not toward zero. Round down to hundredths gives the greatest whole multiple of 0.01 instead. |
| Round up | The operation that turns a number into the least whole number that is greater than or equal to it. A number that is already whole is unchanged. It moves toward higher numbers, not away from zero. Round up to hundredths gives the least whole multiple of 0.01 instead. |
| Percent value | A number of percent, i.e. hundredths, expressed as a whole number unless the specification that defines it names it a Decimal quantity. A Percent value of 40 stands for 40 hundredths. |
| Probability | The chance that a random outcome takes a stated value, expressed as an exact ratio of two whole numbers whose divisor is greater than zero. It is never stored and never rounded. |

# Whole-number quantities

Every stored quantity is held as a whole number, with no exception. A stored quantity is any value that [Campaign state](core-concepts.md#campaign-and-session) holds or that a [Campaign save](engine-contract.md#persisted-data) keeps, whatever it measures, e.g. an amount of money, a count, or a number of percent. It is one of two kinds: a Whole quantity, whose whole number counts its units, or a Decimal quantity, whose whole number counts hundredths of a unit, under [Decimal quantities](#decimal-quantities). The specification that defines a quantity names it a Decimal quantity where it is one; every other stored quantity is a Whole quantity. E.g., a Whole quantity of 12 percent is stored as the whole number 12, never as 0.12 or 12.0 with a fractional part. A whole number is an integer: it has no fractional part, and its size is limited only by a range stated for its quantity.

**Informative rationale:** The inherited game stored some quantities as numbers of differing precision and rounded at several different places. v5 replaces that with a single scheme: whole numbers that count either units or hundredths, named rounding, and exact evaluation, so that every result is exact. Whole quantities alone proved too coarse: a rate rounded to a whole unit in every Turn cannot rise by less than one unit, e.g. a health recovery of 0.6 and one of 0.9 both became 1, so an Upgrade between them changed nothing.

No Campaign state, Campaign save, or engine API value that represents a stored quantity may hold a fractional part, and no implementation may hold a stored quantity in an unrounded form between [Player actions](engine-contract.md#player-actions-and-turns). A value that is not stored may have a fractional part that is not a whole number of hundredths only as an intermediate result inside a single formula, under [Exact evaluation](#exact-evaluation).

**Ranges.** Unless the Mechanics specification that defines a quantity states otherwise, a stored quantity is nonnegative. A Mechanics specification that allows a quantity to be negative, or bounds it above, states so where it defines the quantity. E.g., one quantity may be allowed to be negative, another may be capped at 100, and another may count from 1. Arithmetic that would take a stored quantity outside its stated range is handled by a rule of the specification that defines the quantity, e.g. by clamping or by rejecting a Player action; it is never silently clamped.

**Fractional [GDR](core-concepts.md#game-build-and-content) values.** A Game Data Record (GDR) value that is a ratio rather than a quantity, e.g. a damage range of 0.5, is not a stored quantity. It is read as the exact decimal number it is written as, i.e. as the ratio of whole numbers it denotes (0.5 is 1 over 2), never as a binary floating-point approximation. a formula that reads such a value computes with it exactly, under [Exact evaluation](#exact-evaluation).

# Decimal quantities

A Decimal quantity is a number with exactly two decimal places, i.e. a whole multiple of 0.01 of its unit. Two decimal places is the only precision: no quantity has one, three, or more. The following rules are complete.

- **Held as hundredths:** Campaign state, a Campaign save, and every engine API value hold a Decimal quantity as its whole number of hundredths, e.g. 1.33 as 133, 2.75 as 275, and 30 as 3000. No binary floating-point number ever represents one.
- **Written in units:** A specification writes a Decimal quantity in its unit, with a decimal point where it has a fractional part, e.g. 1.33 health points; 30 and 30.00 are the same Decimal quantity. A specification that states a value in hundredths says so.
- **Exact operations:** The sum, the difference, the minimum, and the maximum of Decimal quantities and Whole quantities, and the product of a Decimal quantity and a whole number, are whole multiples of 0.01. A formula made only of these operations states that no rounding occurs.
- **Operations that round:** Every other operation can give more than two decimal places, e.g. a division, a percent of a Decimal quantity, or the product of two Decimal quantities. A formula that stores such a result as a Decimal quantity names Round down to hundredths or Round up to hundredths, under [Rounding](#rounding), and one that stores it as a Whole quantity names Round down or Round up.
- **Exact comparison:** Two quantities are compared by their exact values, with no tolerance. A Decimal quantity equals a whole number exactly when its hundredths equal 100 times that number. E.g., 29.99 is less than 30, 30.00 equals 30, and 0.10 + 0.20 equals 0.30. A rule that applies when a Decimal quantity reaches a threshold therefore applies at exactly that value and never one hundredth earlier or later.
- **One rounding for what is shown and what is applied:** A [Derived value](core-concepts.md#value-classification) that a rule adds repeatedly, e.g. an amount regained in every Turn, is rounded once into a Decimal quantity, and that Decimal quantity is both what the engine API reports and what each application adds. E.g., a rate of 2 / 3 rounded up to hundredths is 0.67, and three applications add exactly 2.01, not 2.
- **Decimal GDR values:** A GDR value that is a Decimal quantity is written with at most two digits after the decimal point, e.g. `0.1`, `2.75`, or `3`, and is read as the exact decimal number it is written as. The specification that owns the GDR's [Type](core-concepts.md#data-modeling) makes a value with more digits a data defect; it is never rounded into a valid value.

**Informative rationale:** Because every stored value is a whole number of hundredths and every formula is evaluated exactly, no value can differ from the intended one by a rounding error, e.g. be 0.99999 where 1 is meant, so a threshold is never missed by an error of representation. More decimal places are not needed for that: an intermediate result keeps unlimited precision under [Exact evaluation](#exact-evaluation), and only the stored result is rounded, once, by less than 0.01.

# Rounding

Exactly two rounding operations exist: Round down and Round up. They are defined for every rational number, including negative ones:

| Operation | Result for a number x | e.g. x = 2.4 | e.g. x = 2 | e.g. x = 0.6 | e.g. x = 0 | e.g. x = -0.5 | e.g. x = -2.4 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Round down | The greatest whole number less than or equal to x. | 2 | 2 | 0 | 0 | -1 | -3 |
| Round up | The least whole number greater than or equal to x. | 3 | 2 | 1 | 0 | 0 | -2 |

Both operations leave an exact whole value unchanged: Round down of 2 is 2, and Round up of 2 is 2. Neither operation rounds toward zero, to the nearest whole number, or to even; a value exactly halfway between two whole numbers has no special case, because each operation is defined by direction alone. E.g., Round down of 7.5 is 7 and Round up of 7.5 is 8.

**Rounding to hundredths.** Each operation also has a form that gives a whole multiple of 0.01, for a result that is a [Decimal quantity](#glossary): Round down to hundredths of x is `round down(x × 100) / 100`, and Round up to hundredths of x is `round up(x × 100) / 100`. Each is defined by direction alone, as above, and leaves a whole multiple of 0.01 unchanged. No operation rounds to the nearest hundredth.

| Operation                | e.g. x = 2 / 3 | e.g. x = 1.3299 | e.g. x = 0.6 | e.g. x = 2 | e.g. x = -0.005 |
| ------------------------ | -------------- | --------------- | ------------ | ---------- | --------------- |
| Round down to hundredths | 0.66           | 1.32            | 0.60         | 2.00       | -0.01           |
| Round up to hundredths   | 0.67           | 1.33            | 0.60         | 2.00       | 0.00            |

**Every formula names its rounding.** A formula that can produce a fraction must state which operation it applies and at which point of the expression. A formula that omits the rounding of a possible fraction is incomplete and must not be implemented by guessing. A formula whose every possible result is a whole number states that no rounding occurs. E.g., `round down((8 × 2) / 3)` is 5, but rounding 8 / 3 first and then multiplying by 2 gives 4, so the formula's own wording decides where rounding occurs.

In every specification, the notation `round down( … )` and `round up( … )` names these operations, `round down to hundredths( … )` and `round up to hundredths( … )` name their forms for hundredths, and the rounding is applied exactly once at the point where the notation encloses the expression, to the exact value of that expression.

# Exact evaluation

A formula is evaluated exactly, as if with unlimited-precision rational arithmetic, and is rounded only where the formula names a rounding. The result must equal the result of that exact evaluation. In particular:

- No intermediate result is rounded, truncated, or converted to a binary floating-point number. E.g., computing `10 × (1 − 0.5)` through a floating-point number is not permitted, even where it happens to give the same result.
- Multiplication happens before division within a term, so that no precision is lost, and the order in which the formula states its terms does not change the result, because exact arithmetic is associative and commutative for the operations used.
- The size of a result has no limit. An implementation must compute exactly for every value that can arise in a [Campaign](core-concepts.md#campaign-and-session). It must not wrap around, saturate, or approximate; a stored quantity and an intermediate result that exceed what its machine representation holds must be handled with a wider exact representation.
- A division whose divisor is zero has no value. A formula whose divisor can be zero states what happens in that case; if it does not, a zero divisor is an internal invariant violation under [Edge cases and failure behavior](#edge-cases-and-failure-behavior), not an expected case.

# Percent values

A percentage is a Percent value: a whole number of percent, or a [Decimal quantity](#glossary) of percent where the specification that defines it names it one, e.g. 2.20 percent. No finer fraction of percent exists. A Percent value may exceed 100 or be negative only where the specification that defines it states so.

**p percent of x** means `(p × x) / 100`, evaluated exactly: multiply first, then divide by 100, then apply the rounding the formula names. E.g., 2 percent of 30 is `(2 × 30) / 100 = 0.6`; with Round up it is 1, and with Round down it is 0. When p and x are both whole numbers the exact result has at most two decimal digits, so it is a whole multiple of 0.01; in every case the named rounding is the only source of imprecision.

**A Percent value is not always a multiplier.** "p percent of x" is multiplicative: the Percent value p scales another quantity x. A quantity that is itself measured in percentage points is different: it is a whole number of percentage points, and a rule changes it by adding or subtracting a whole number of percentage points, never by multiplying it. E.g., a quantity from 0 to 100 that rises by 3 goes from 40 to 43, and does not become 3 percent of 40. A GDR property that holds percentage points is a Percent value only in this additive sense, and the rule that reads it states which of the two meanings it has.

A formula never divides by 100 first and rounds the result before multiplying, unless it states so; the order above is the default meaning of "p percent of x".

# Probabilities

A Probability is an exact ratio `n / d` of two whole numbers with `d` greater than zero, as the glossary defines. The following rules are complete:

- **Whole numbers throughout:** A formula that forms a Probability from [Decimal quantities](#decimal-quantities) is evaluated exactly, so the Probability is the ratio of two whole numbers that the exact value denotes, e.g. 28.67 / 30 is 2867 / 3000. No Probability depends on a rounded Decimal quantity unless its formula names that rounding.
- **Never stored:** A Probability is a [Derived value](core-concepts.md#value-classification) computed when needed. No Campaign state, Campaign save, or engine API value holds a Probability as a stored quantity; where the engine API reports one, e.g. in a query, it reports the pair `n` and `d` of whole numbers, not a rounded decimal. A Mechanics specification that shows a Probability to the player states its presentation under its [Player-visible information](engine-contract.md#api-surfaces).
- **Never rounded:** No rounding is applied to a Probability, neither Round down nor Round up, unless a formula states a rounding explicitly for a displayed value. Two ratios are the same Probability when their cross products are equal; e.g., 10000 / 11600 and 25 / 29 are the same Probability.
- **Clamping:** A Probability must lie from 0 to 1 inclusive. A formula whose ratio can fall outside that range states a clamp, i.e. a minimum with 1 or a maximum with 0, and clamping is exact. E.g., a ratio of 12 / 10 that is clamped to at most 1 is 1, and a ratio of -3 / 10 that is clamped to at least 0 is 0. A ratio outside 0 to 1 that no formula clamps is an internal invariant violation.
- **Comparison:** Deciding whether a random outcome with a Probability `n / d` takes the stated value must give the same result on every machine for the same random outcome. The decision is exact: a Probability of 0 never takes the value, a Probability of 1 always takes the value, and no floating-point intermediate may change which side of the comparison a random outcome falls on. Among Campaigns that differ only in their [Campaign seed](determinism-and-randomness.md#glossary), the value is taken in exactly `n / d` of them, as [Random outcomes](determinism-and-randomness.md#random-outcomes) requires.

# Uniform whole-number outcomes

A uniform whole-number outcome over the inclusive range from `lo` to `hi` is a random outcome defined as follows. It is a distribution only; when the outcome is drawn, in which order, and from which source are the Implementer's choice under [Scope of the guarantee](determinism-and-randomness.md#scope-of-the-guarantee).

- `lo` and `hi` are whole numbers with `lo` less than or equal to `hi`. A range with `hi` less than `lo` is an internal invariant violation.
- The outcome is a whole number from `lo` to `hi`, both included.
- Each of the `hi − lo + 1` possible values has the same Probability, `1 / (hi − lo + 1)`.
- When `lo` equals `hi` there is exactly one possible value, and the outcome is that value with Probability 1. It is still a distinct named random outcome for the specification that names it.

E.g., a uniform whole-number outcome over 5 to 15 has 11 possible values, each with Probability 1 / 11, and one over 7 to 7 is always 7.

A specification that derives the bounds from a formula applies the rounding the formula names to each bound before the range is formed. E.g., a base of 10 and a ratio of 0.5 give the lower bound `round up(10 × (1 − 0.5)) = 5` and the upper bound `round down(10 × (1 + 0.5)) = 15`, so an outcome with those bounds is a uniform whole-number outcome over 5 to 15.

# Edge cases and failure behavior

- **Exact whole values:** Round down and Round up of a whole number are that number. E.g., 2 percent of 50 is exactly 1, so Round up gives 1, not 2.
- **Negative values:** Round down of a negative fraction moves to the more negative whole number, and Round up moves to the less negative one. E.g., Round down of -0.5 is -1 and Round up of -0.5 is 0.
- **Zero:** Zero is a whole number; Round down and Round up of zero are zero, and a percent of zero is zero.
- **Halfway values:** A value exactly halfway between two whole numbers has no special case; each operation applies by direction. E.g., Round up of 7.5 is 8 and Round down of 7.5 is 7.
- **Zero divisor:** A formula that divides by a value that can be zero must state the result in that case. A formula that does not and meets a zero divisor is an internal invariant violation, not an expected rejection of a Player action.
- **Result outside its range:** An exact result that falls outside the stated range of its quantity is handled only by a rule of the specification that defines the quantity; it is not clamped otherwise.
- **Probability outside 0 to 1:** Handled by a clamp that the formula states; otherwise an internal invariant violation.
- **Degenerate range:** A uniform whole-number outcome with `lo` equal to `hi` is valid and has one possible value.
- **Large values:** Results larger than a machine word are valid. Wrapping, saturating, or approximating them is a violation of [Exact evaluation](#exact-evaluation).
- **Decimal quantity at a threshold:** A Decimal quantity is compared exactly, so it reaches a threshold exactly when its value is at least the threshold. E.g., 29.99 has not reached 30, and 29.40 + 0.60 has.
- **Decimal GDR value with too many digits:** A GDR value that is a Decimal quantity and is written with more than two digits after the decimal point, e.g. `0.125`, is a data defect under the validation of the specification that owns its Type; it is not rounded.
- **Floating-point drift:** An implementation whose outcome differs from the exact result because of binary floating-point arithmetic does not conform, even when the difference is only visible for some inputs.
