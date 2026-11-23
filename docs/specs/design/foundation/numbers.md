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

| Term | Definition |
| --- | --- |
| Whole quantity | A stored quantity that is a whole number of its unit, e.g. an amount of money or a count. Every stored quantity is one unless the specification that defines it names it a Decimal quantity. |
| Decimal quantity | A stored quantity with exactly two decimal places, i.e. a whole multiple of 0.01 of its unit, held as its whole number of hundredths. E.g., 1.33 health points are held as 133. |
| Round down | The operation that turns a number into the greatest whole number that is less than or equal to it. A number that is already whole is unchanged. It moves toward lower numbers, not toward zero. Round down to hundredths gives the greatest whole multiple of 0.01 instead. |
| Round up | The operation that turns a number into the least whole number that is greater than or equal to it. A number that is already whole is unchanged. It moves toward higher numbers, not away from zero. Round up to hundredths gives the least whole multiple of 0.01 instead. |
| Percent value | A number of percent, i.e. hundredths, expressed as a whole number unless the specification that defines it names it a Decimal quantity. A Percent value of 40 stands for 40 hundredths. |
| Probability | The chance that a random outcome takes a stated value, expressed as an exact ratio of two whole numbers whose divisor is greater than zero. It is never stored and never rounded. |

# Whole-number quantities

Every stored quantity is held as a whole number, with no exception. A stored quantity is any value that [Campaign state](core-concepts.md#campaign-and-session) holds or that a [Campaign save](engine-contract.md#persisted-data) keeps, whatever it measures, e.g. an amount of money, a count, or a number of percent. E.g., a Whole quantity of 12 percent is stored as the whole number 12, never as 0.12 or 12.0 with a fractional part.

A whole number is an integer: it has no fractional part, and its size is limited only by a range stated for its quantity. A fraction finer than hundredths appears only as an intermediate result inside a single formula, which is [evaluated exactly](#exact-evaluation).

**Informative rationale:** The inherited game stored some quantities as numbers of differing precision and rounded at several different places. v5 replaces that with a single scheme: whole numbers that count either units or hundredths, named rounding, and exact evaluation, so that every result is exact. Whole quantities alone proved too coarse: a rate rounded to a whole unit in every Turn cannot rise by less than one unit, e.g. a health recovery of 0.6 and one of 0.9 both became 1, so an Upgrade between them changed nothing.

**Ranges.** Unless the Mechanics specification that defines a quantity states otherwise, a stored quantity is nonnegative. A Mechanics specification that allows a quantity to be negative, or bounds it above, states so where it defines the quantity. E.g., one quantity may be allowed to be negative, another may be capped at 100, and another may count from 1. Arithmetic that would take a stored quantity outside its stated range is handled by a rule of the specification that defines the quantity, e.g. by clamping or by rejecting a Player action; it is never silently clamped.

**Fractional [GDR](core-concepts.md#game-build-and-content) values.** A Game Data Record (GDR) value that is a ratio rather than a quantity, e.g. a damage range of 0.5, is not a stored quantity. It is read as the exact decimal number it is written as, i.e. as the ratio of whole numbers it denotes, e.g. 0.5 as 1 over 2, and a formula that reads it computes with that ratio.

# Decimal quantities

A Decimal quantity lets a quantity change by less than one unit while every number stays exact. Two decimal places is the only precision: no quantity has one, three, or more.

- **Held as hundredths:** Campaign state, a Campaign save, and every engine API value hold a Decimal quantity as its whole number of hundredths, e.g. 2.75 as 275 and 30 as 3000.
- **Written in units:** A specification writes a Decimal quantity in its unit, with a decimal point where it has a fractional part, e.g. 1.33 health points; 30 and 30.00 are the same Decimal quantity. A specification that states a value in hundredths says so.
- **Exact comparison:** Two quantities are compared by their exact values, with no tolerance. E.g., 29.99 is less than 30, 30.00 equals 30, and 0.10 + 0.20 equals 0.30. A rule that applies when a Decimal quantity reaches a threshold applies at exactly that value and never one hundredth earlier or later; e.g., 29.99 has not reached 30, and 29.40 + 0.60 has.
- **One rounding for what is shown and what is applied:** A [Derived value](core-concepts.md#value-classification) that a rule adds repeatedly, e.g. an amount regained in every Turn, is rounded once into a Decimal quantity, and that Decimal quantity is both what the engine API reports and what each application adds. E.g., a rate of 2 / 3 rounded up to hundredths is 0.67, and three applications add exactly 2.01, not 2.
- **Decimal GDR values:** A GDR value that is a Decimal quantity is written with at most two digits after the decimal point, e.g. `0.1`, `2.75`, or `3`, and is read as the exact decimal number it is written as. A value with more digits, e.g. `0.125`, is a data defect; it is never rounded into a valid value.

# Rounding

Exactly two rounding operations exist: Round down and Round up. They are defined for every rational number, including negative ones:

| Operation | Result for a number x | e.g. x = 2.4 | e.g. x = 2 | e.g. x = 0.6 | e.g. x = 0 | e.g. x = -0.5 | e.g. x = -2.4 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Round down | The greatest whole number less than or equal to x. | 2 | 2 | 0 | 0 | -1 | -3 |
| Round up | The least whole number greater than or equal to x. | 3 | 2 | 1 | 0 | 0 | -2 |

Neither operation rounds toward zero, to the nearest whole number, or to even; a value exactly halfway between two whole numbers has no special case, because each operation is defined by direction alone. E.g., Round down of 7.5 is 7 and Round up of 7.5 is 8.

**Rounding to hundredths.** Each operation also has a form that gives a whole multiple of 0.01, for a result that is a [Decimal quantity](#glossary): Round down to hundredths of x is `round down(x × 100) / 100`, and Round up to hundredths of x is `round up(x × 100) / 100`.

| Operation                | e.g. x = 2 / 3 | e.g. x = 1.3299 | e.g. x = 0.6 | e.g. x = 2 | e.g. x = -0.005 |
| ------------------------ | -------------- | --------------- | ------------ | ---------- | --------------- |
| Round down to hundredths | 0.66           | 1.32            | 0.60         | 2.00       | -0.01           |
| Round up to hundredths   | 0.67           | 1.33            | 0.60         | 2.00       | 0.00            |

**Every formula names its rounding.** A formula that can produce a finer fraction than its result holds states which operation it applies and at which point of the expression: Round down or Round up for a result that is a whole number, and Round down to hundredths or Round up to hundredths for a result that is a Decimal quantity. A Decimal quantity needs one wherever an operation can give more than two decimal places, e.g. a division, a percent of a Decimal quantity, or the product of two Decimal quantities. E.g., `round down((8 × 2) / 3)` is 5, but rounding 8 / 3 first and then multiplying by 2 gives 4, so the formula's own wording decides where rounding occurs.

In every specification, the notation `round down( … )` and `round up( … )` names these operations, `round down to hundredths( … )` and `round up to hundredths( … )` name their forms for hundredths, and the rounding is applied exactly once at the point where the notation encloses the expression, to the exact value of that expression.

# Exact evaluation

A formula is evaluated exactly, as if with unlimited-precision rational arithmetic, and is rounded only where the formula names a rounding. No intermediate result is rounded, truncated, or approximated, and the size of a result has no limit: a result never wraps around or saturates.

A division whose divisor is zero has no value. A formula whose divisor can be zero states what happens in that case.

# Percent values

A percentage is a Percent value: a whole number of percent, or a [Decimal quantity](#glossary) of percent where the specification that defines it names it one, e.g. 2.20 percent. No finer fraction of percent exists. A Percent value may exceed 100 or be negative only where the specification that defines it states so.

**p percent of x** means `(p × x) / 100`, evaluated exactly: multiply first, then divide by 100, then apply the rounding the formula names. E.g., 2 percent of 30 is `(2 × 30) / 100 = 0.6`; with Round up it is 1, and with Round down it is 0. E.g., 2 percent of 50 is exactly 1, so Round up gives 1, not 2.

**A Percent value is not always a multiplier.** "p percent of x" is multiplicative: the Percent value p scales another quantity x. A quantity that is itself measured in percentage points is different: it is a whole number of percentage points, and a rule changes it by adding or subtracting a whole number of percentage points, never by multiplying it. E.g., a quantity from 0 to 100 that rises by 3 goes from 40 to 43, and does not become 3 percent of 40. A GDR property that holds percentage points is a Percent value only in this additive sense, and the rule that reads it states which of the two meanings it has.

# Probabilities

A chance that is shown to the player must be exactly the chance that decides the random outcome, on every machine. A Probability therefore stays an exact ratio `n / d` of two whole numbers from the formula that forms it to the outcome it decides.

- **Whole numbers throughout:** A formula that forms a Probability from [Decimal quantities](#decimal-quantities) is evaluated exactly, so the Probability is the ratio of two whole numbers that the exact value denotes, e.g. 28.67 / 30 is 2867 / 3000. No Probability depends on a rounded value, e.g. a rounded Decimal quantity, unless its formula names that rounding. A formula names one where the chance shown to the player must be exactly the chance drawn: it rounds the exact ratio to a whole number of a stated fraction, and the Probability is that whole number over its divisor, e.g. a ratio of 2867 / 3000 rounded down to thousandths gives the Probability 955 / 1000, shown as 95.5%.
- **Reported as a pair:** A Probability is a [Derived value](core-concepts.md#value-classification) computed when needed. Where the engine API reports one, e.g. in a query, it reports the pair `n` and `d` of whole numbers, not a rounded decimal.
- **Equality:** Two ratios are the same Probability when their cross products are equal; e.g., 10000 / 11600 and 25 / 29 are the same Probability.
- **Clamping:** A Probability lies from 0 to 1 inclusive. A formula whose ratio can fall outside that range states a clamp, i.e. a minimum with 1 or a maximum with 0, and clamping is exact. E.g., a ratio of 12 / 10 that is clamped to at most 1 is 1, and a ratio of -3 / 10 that is clamped to at least 0 is 0.
- **Comparison:** Whether a random outcome with a Probability `n / d` takes the stated value is decided exactly: a Probability of 0 never takes the value, and a Probability of 1 always takes it.

# Uniform whole-number outcomes

A uniform whole-number outcome is the one distribution that rules share for a random whole number, e.g. an amount of damage. Over the inclusive range from `lo` to `hi`, it is a random outcome defined as follows:

- `lo` and `hi` are whole numbers with `lo` less than or equal to `hi`.
- The outcome is a whole number from `lo` to `hi`, both included.
- Each of the `hi − lo + 1` possible values has the same Probability, `1 / (hi − lo + 1)`.
- When `lo` equals `hi`, the outcome is always that value, and it is still a distinct named random outcome for the specification that names it.

E.g., a uniform whole-number outcome over 5 to 15 has 11 possible values, each with Probability 1 / 11, and one over 7 to 7 is always 7.

A specification that derives the bounds from a formula applies the rounding the formula names to each bound before the range is formed. E.g., a base of 10 and a ratio of 0.5 give the lower bound `round up(10 × (1 − 0.5)) = 5` and the upper bound `round down(10 × (1 + 0.5)) = 15`, so an outcome with those bounds is a uniform whole-number outcome over 5 to 15.
