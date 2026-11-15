# Implementation Records

| Metadata    | Value                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Spec ID     | RECORDS                                                                                            |
| Family      | Implementation                                                                                     |
| Status      | Draft                                                                                              |
| Binding     | Mandatory                                                                                          |
| Audience    | Engine designer, Implementer                                                                       |
| Owns        | The records of Specification problems and Implementation decisions that each Implementation keeps. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                     |

# Overview

While an [Implementation](../governance/artifact-relationships.md#glossary) is built, its implementer meets problems in
the specifications and makes decisions the specifications leave open or fail to settle. Every Implementation keeps two
records of them inside its [Implementation directory](implementation-placement.md#glossary): the Specification problems
it met and the Implementation decisions it made. The Engine designer reads the records to improve the specifications
and to compare Implementations.

# Relationships

- Uses [Implementation Placement](implementation-placement.md)

# Glossary

| Term                    | Definition                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Specification problem   | A defect in the specifications that the implementer met while implementing them, in one of the Specification problem categories.       |
| Implementation decision | A choice the implementer made about what the Implementation does or how it is built, in one of the Implementation decision categories. |

# Record files

Every Implementation must keep these two Markdown files in its Implementation directory:

| Path                                  | Contents                                           |
| ------------------------------------- | -------------------------------------------------- |
| `records/specification-problems.md`   | Every Specification problem the implementer met    |
| `records/implementation-decisions.md` | Every Implementation decision the implementer made |

The records must be kept current while the Implementation is built: a change to the Implementation that meets a
Specification problem or makes an Implementation decision must add or update its entry in the same change. An entry
must not be deleted when the specifications or the Implementation later change; it is updated to say what changed,
e.g. that a later revision of the specifications resolved the problem.

These records are required whatever the platform, language, or engine of the Implementation and whatever the
instructions it is built under.

## Entry format

Each entry is an H2 section whose heading is a stable identifier followed by a short title, e.g.
`## PROB-004: Two definitions of Panic`. Specification problem identifiers have the form `PROB-<number>` and
Implementation decision identifiers the form `DEC-<number>`, numbered from 1 in the order the entries are added. Each
entry states:

- **Category:** one category from the tables below.
- **Affected specifications:** each affected specification by Spec ID and section heading, e.g. `DEPDIR, Dependency
direction`, with the relevant wording quoted. Specifications are named rather than linked, because the
  Implementation refers to no file outside its Implementation directory, as
  [Implementation Placement](implementation-placement.md) requires.
- **Description:** what the problem or decision is.
- **Links:** for a Specification problem, the identifiers of the Implementation decisions that settle it; for an
  Implementation decision, the identifiers of the Specification problems it settles.

An Implementation decision must also state the options considered, the option chosen, and why it was chosen.

# Specification problems

Each Specification problem belongs to exactly one category. The following table is exhaustive.

| Category     | The implementer met                                                                                                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conflict     | Statements that cannot all hold at once, e.g. two glossary definitions of one term, a formula that contradicts a rule stated in words, or two rules that require different outcomes for one situation.                                                                                         |
| Implicit gap | Information the implementer needed that no specification gives and that no specification marks as unspecified.                                                                                                                                                                                 |
| Needed TODO  | Information the implementer needed that a specification marks as a `TODO:` or `TODO (later):` item, under [Kinds of unspecified content](../governance/spec-conventions.md#kinds-of-unspecified-content).                                                                                      |
| Duplicate    | One rule, definition, or formula stated in more than one place, e.g. a formula stated both in the specification that owns it and in a specification that uses it. A duplicate whose copies disagree, even slightly, is recorded once, in this category, and its entry states the disagreement. |

Something a specification marks as the Implementer's choice, as left to the implementer in other words, or as out of
scope, as defined under [Kinds of unspecified content](../governance/spec-conventions.md#kinds-of-unspecified-content),
is not an Implicit gap. The implementer records how it was settled as an Implementation decision of the Asked by the
specifications category instead.

# Implementation decisions

Each Implementation decision belongs to exactly one category. The following table is exhaustive.

| Category                    | The implementer decided                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Asked by the specifications | How to settle something a specification leaves to the implementer, e.g. an Implementer's choice.                                                         |
| Conflict resolution         | Which of the conflicting or disagreeing statements of a Conflict or Duplicate Specification problem the Implementation follows, or what it does instead. |
| Gap resolution              | What the Implementation does where an Implicit gap or Needed TODO Specification problem leaves it unspecified.                                           |
| Treatment of guidance       | How the Implementation treated a Guidance Implementation family specification, or a suggestion stated in any other specification.                        |

Every Conflict, Duplicate, Implicit gap, and Needed TODO Specification problem must be linked to at least one Conflict
resolution or Gap resolution Implementation decision.

## Treatment of guidance

Every Guidance Implementation family specification must have at least one Treatment of guidance Implementation
decision. Each such decision states which of the following the Implementation did:

- **Used as is:** the Implementation follows the guidance unchanged.
- **Used with modifications:** the Implementation follows the guidance with changes, and the decision states each
  change.
- **Used a different approach:** the Implementation does not follow the guidance, and the decision states the
  approach it uses instead and why.

A specification whose suggestions the Implementation treated differently from one another has one decision for each
group of suggestions treated alike.

# Edge cases and failure behavior

An Implementation that has met no Specification problem and made no Implementation decision yet still keeps both record
files, each holding only its H1 title.
