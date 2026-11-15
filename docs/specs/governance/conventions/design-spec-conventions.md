# Design Specification Conventions

| Metadata    | Value                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Spec ID     | DCONV                                                                                                 |
| Family      | Conventions                                                                                           |
| Audience    | Engine designer, Content designer, UI designer, AI designer, Implementer                              |
| Owns        | What a Design specification may state, and how exactly it states rules, formulas, GDRs, and examples. |
| Conventions | [Specification Conventions](spec-conventions.md)                                                      |

# Overview

A Design specification is the only durable record of a design decision: an Implementation is built from it and can be
rebuilt from it at any time. So it must say everything that matters to the game and nothing that does not. What
matters is what a player, a save, or a replay could notice, together with the GDRs that the Game designer authors;
everything else is left to the Implementer, who decides it differently in every Implementation.

What it says must also be exact enough to test. Every rule names its inputs, its boundaries, and its outcome, and an
acceptance example shows it at work. Design Specification Conventions refines Specification Conventions: Specification Conventions says
how any specification is written, and Design Specification Conventions says what a Design specification states and how precisely.

# Relationships

- Refines [Specification Conventions](spec-conventions.md)

# Glossary

Terms about specifications in general are in the Specification Conventions glossary.

| Term               | Definition                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acceptance example | A worked example that identifies the requirements it checks and states testable expected results.                                                                             |
| Evidence basis     | Informative material inspected when drafting a specification; it is not a formal [relationship](artifact-relationships.md#glossary) unless also declared under Relationships. |

# What belongs in a Design specification

Design specifications describe the design of the game; any implementation that obeys them is acceptable. A statement
belongs in a Design specification only if it meets at least one of the following criteria. This list is exhaustive:

1. **Observable:** a black-box test through the engine API, a save, or a replay could fail when the statement is
   violated.
2. **Designer-authored:** the statement is a GDR or a description of game behavior that the Engine designer must write down.
3. **Vocabulary:** the statement defines a term or structure needed to state observable or designer-authored statements.

Everything else is left to the implementer's discretion and must not be specified. E.g., the following are out
of scope:

- Internal ordering, e.g. call order and the order of random draws.
- Code structure, e.g. which code creates which objects, internal function signatures, and dependency injection.
- Internal storage layout.

A statement about one of these matters belongs in a specification only when it states an observable consequence, and
then the specification states the consequence rather than the mechanism. Non-observable steering for implementers,
e.g. architecture or code-quality advice, never belongs in a Design specification. Record it, when it is worth
recording, only in an Implementation specification, under
[What belongs in an Implementation specification](implementation-spec-conventions.md#what-belongs-in-an-implementation-specification).

## Non-behavioural Design specifications

Some Design specifications describe how the engine API is used rather than how the game behaves, so that a user
interface or an Autopilot AI can be designed without changing any rule.

UI specifications are non-behavioural. They guide how a user interface presents the engine API to the
Player, e.g. which screens exist and what each shows by default, but they add no gameplay information, engine API
operation, or GDR. What a user interface may show and call remains owned by the Foundation specifications that define
the engine API and by the specification that owns each value.

Autopilot AIs specifications describe how an Autopilot AI chooses its Player actions, e.g. which goals it pursues and in
what order, but they add no engine API operation, game behavior, or GDR. What every Autopilot AI receives and may call
remains owned by the Foundation specifications that define the engine API.

# Specifying a game concept

A game concept is read by everyone who designs or implements the game, so its description must leave no structural
question open.

When specifying a game concept, state its applicable modeling role and mutability. Use prose,
property tables, and diagrams for conceptual descriptions; a programming-language declaration is not required. State
multiplicity with an explicit scope, the conditions under which it comes into existence, its lifecycle states when it
has any, Authoritative values versus Derived values, and
which values affect current gameplay versus serve only historical explanation. Classify properties separately when
these dimensions differ within one Campaign instance. Link to the owning specification for details; explicitly retain
unresolved decisions rather than filling them with assumptions.

# Writing exact rules

An Implementer reads a rule once and implements exactly what it says, so a rule leaves nothing to be guessed.

A rule should make its trigger, inputs, preconditions, outcome, and state changes clear. Use a transition table or pseudocode where prose would conceal ordering. Define:

- Valid and invalid inputs, including empty and duplicate collections.
- Exact thresholds, inclusivity, caps, floors, and tie-breaking.
- Which state snapshot supplies each input and when each effect becomes visible.
- Atomicity and whether rejection changes state, history, or randomness.
- Expected rejection of a player's action separately from an internal invariant violation.

## Formula and state machine notations

A specification may use either of the following notations where it fits the behavior being described. They are
notations, not a classification: a specification is not required to label its statements, and behavior that fits
neither is described in ordinary prose. A statement written in one of these notations is complete only when it states
every item in that notation's checklist.

A **formula** computes one value from other values. It states:

- Its inputs, each with its unit and domain.
- The expression.
- Rounding: where rounding occurs and which rounding operation applies, or that no rounding occurs.
- The valid range of the result.

E.g., "The total price equals the unit price multiplied by the quantity, rounded down to a whole number. The unit
price is a nonnegative whole number of cents and the quantity is a positive whole number, so the total price is a
nonnegative whole number of cents." [Formulas and uncertainty](#formulas-and-uncertainty) adds the requirements for
symbols, evaluation order, random outcomes, and worked numerical examples.

A **state machine** describes something that is in exactly one of a fixed set of states at a time. It states:

- The exhaustive set of states.
- A transition table listing, for each transition, its source state, target state, trigger, and condition.
- That every transition not listed in the table is impossible.

E.g., a door has the exhaustive states Open, Closed, and Locked, and this transition table:

| Source state | Target state | Trigger | Condition                   |
| ------------ | ------------ | ------- | --------------------------- |
| Open         | Closed       | Close   | Nothing blocks the doorway. |
| Closed       | Open         | Open    | Always permitted.           |
| Closed       | Locked       | Lock    | The opener holds the key.   |
| Locked       | Closed       | Unlock  | The opener holds the key.   |

Every transition not listed, e.g. from Open directly to Locked, is impossible.

## Formulas and uncertainty

Define every symbol, unit, domain, and referenced parameter. Show evaluation order and rounding points; link common numeric rules rather than assuming real-number arithmetic equals runtime arithmetic.

For random rules, state every random outcome as a distinct, named outcome: what it belongs to, its possible values,
and its distribution, including interval boundaries and the success comparison. E.g., "each delivery has one delay
outcome, late or on time, and each late delivery has one lateness outcome, a whole number of days from 1 to 10". A
reader must be able to tell how many distinct random outcomes a rule has, because a named random outcome is what an
acceptance example fixes when it uses fixed injected random outcomes under
[Examples, conformance, and evidence](#examples-conformance-and-evidence). Also state which state each random outcome
may depend on and which information is hidden. Do not state when or in which order random values are drawn.

Distinguish the true probability, conditional probability, cumulative probability, and displayed estimate whenever relevant. Define what information an estimate conditions on, including previous outcomes.

Include worked numerical examples for normal cases and boundaries. Equations, prose, pseudocode, and examples must agree. An unexplained "chance increases over time" or "diminishing returns" is not a complete rule.

## Contracts and GDRs

Public API specifications define exact names, types, argument shapes, outputs, and errors when they are complete. Conceptual domain specifications need not mirror implementation storage layouts.

GDR tables define stable GDR identifiers, units, values, references, and their owning formulas. A name or a number appearing only inside an example is not an implicit GDR. Use parameter references instead of copying balance values throughout mechanics specifications.

## Specialized material

Some subjects recur across Design specifications and have settled shapes. Give each specialized subject its own topic section, or a subsection of the closest topic. The following shapes are common within a Family; they are not additional metadata categories or directories.

| Specialized material | Examples of subsections                    |
| -------------------- | ------------------------------------------ |
| Mechanics rules      | State transitions; formulas; effect timing |
| Numeric contracts    | Representation; rounding; test vectors     |
| API contracts        | Functions; preconditions; results          |

Long supporting tables may use descriptive appendices after the closing sections. State whether an appendix is normative or informative. If a topic repeatedly outgrows its specification, split it into an indexed specification with clear ownership.

# Scope exclusions

Something is out of scope when it is not part of the game and there is no plan to specify it. State it only where a
reader would otherwise expect the missing rule, in the topic section where they would look for it, as one sentence.
Do not collect exclusions in Overview or in a list. Something that will be specified later is not out of scope; it is
a TODO under [Kinds of unspecified content](spec-conventions.md#kinds-of-unspecified-content).

Name each exclusion with its canonical term, or with the title of the specification or section that owns it. Do not
coin a descriptive phrase for an exclusion under [Canonical terminology](terminology-conventions.md#canonical-terminology); an exclusion that no
defined term or owning section names is rarely worth stating.

E.g., the section on placing an Order says in one sentence that gift wrapping is out of scope. The Overview of that
specification says nothing about what the specification does not cover.

# Examples, conformance, and evidence

An example shows that a rule means what its author intended, and an acceptance example makes that checkable. Every substantial rule must be covered by an acceptance example. Foundation specifications
using embedded examples may instead explain their modeling contracts through self-contained illustrations alongside
the concepts, linking to the applicable requirements. These illustrations introduce no production gameplay rules and
need not be organized as test fixtures or command sequences. Every acceptance example must identify all applicable
items in this checklist:

- Hyperlinks to the requirement sections exercised and, when needed for reproducibility, the game revision and GDR fixture.
- Initial state and inputs, including fixed injected random outcomes for stochastic results, each
  identified by the name its rule gives it under [Formulas and uncertainty](#formulas-and-uncertainty); never assert outcomes
  that depend on a particular seed, and otherwise compare replayed results for equality.
- The command or event sequence.
- Expected state, output, visibility, history, and random behavior where relevant.
- Exact comparisons or explicitly specified numeric tolerances.

Examples of one specification's rules stay in that specification. An example of an interaction between several game systems belongs to the specification that owns that interaction, e.g. the specification that owns the order of same-turn effects, and links the rules of the other specifications it exercises. How the implementation verifies conformance, e.g. its integration or end-to-end tests, is the implementer's choice.

Test derivation must follow the specification; current code output is not an independent oracle. If code, tests, and the specification disagree, identify the discrepancy and resolve it explicitly. Do not rewrite a specification merely to bless existing behavior. Do not silently replace an accepted rule to match a newer brief passage; record the design conflict and proposed revision.

For inherited-game evidence, identify relevant paths and, when a behavioral claim is carried into a drafted specification, the inspected revision where practical.

Label evidence or proposals as **Inherited behavior**, **v5 requirement**, **Proposed rule**, or **Informative rationale** when the distinction could be unclear. Legacy bugs and undocumented implementation quirks are not requirements. A legacy formula can become a proposed rule only by being stated explicitly.

## Consistency of rules and examples

A rule and its examples are written together and must stay together. Boundary cases and failures must be defined for
every rule, worked examples and acceptance examples must agree with the rules they illustrate, and related contracts and
GDR tables must agree with each other.

When specified behavior changes, link to affected requirement sections by title and dependent specifications, revise their examples together, and record any save, replay, or API compatibility impact. Git history and review records provide change history; avoid duplicating every edit in per-document changelogs.
