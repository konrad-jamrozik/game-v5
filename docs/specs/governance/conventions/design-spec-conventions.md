# Design Specification Conventions

| Metadata | Value |
| --- | --- |
| Spec ID | DCONV |
| Family | Conventions |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns | What a Design specification may state, and how exactly it states rules, formulas, game data, and examples. |
| Conventions | [Specification Conventions](spec-conventions.md) |

# Overview

A [Design specification](spec-conventions.md#specifications) records what the [Game designer](spec-conventions.md#participants) decided about the game: its terms, its concepts, its rules, and the diagrams that explain them. It states each decision once. It does not describe everything the game does: where it is silent, the code and tests of the [Implementation](spec-conventions.md#artifacts) decide, and they may change without any specification changing.

One test decides what belongs: would the Game designer object if the code did this differently? What passes is stated exactly, with its formula, its thresholds, and its rounding. What fails is left out, however easy it is to observe. Design Specification Conventions builds on Specification Conventions: Specification Conventions says how any specification is written, and Design Specification Conventions says what a Design specification states and how precisely.

# What belongs in a Design specification

A [Design specification](spec-conventions.md#specifications) holds the decisions about the game and what is needed to state them; the code of the [Implementation](spec-conventions.md#artifacts) holds everything else. A statement belongs in a Design specification only when it is one of these:

1. **A decision:** a rule, a behaviour, or the meaning of a piece of game data that the [Game designer](spec-conventions.md#participants) chose. The test is whether the Game designer would object if the code did it differently; e.g., a threshold a player plans around passes the test, and the order of two effects that no player can tell apart fails it.
2. **Vocabulary:** a term, a concept, or a structure needed to state decisions.
3. **An explanation:** a diagram or an example that shows what a decision or a concept means.

That a test could observe a behaviour does not make it a decision. Where the Design specifications are silent, the code and its tests decide, and they may change without a [specification](spec-conventions.md#specifications) changing. A Design specification therefore never states any of the following:

- **What the code does on its own account**, e.g. internal ordering, code structure, storage layout, and how a malformed call or malformed game data is rejected.
- **A proof.** A specification states rules and does not argue that they hold: it does not show that a value stays within a range, that a process ends, or that a state cannot be reached, and it does not describe a case that its rules make impossible.
- **A consequence of another rule.** What follows from a rule is not written down, neither in the specification that owns the rule nor in one that relies on it.
- **A value of game data.** A specification says what a property means; its value lives only in the game data files.

A rule about game data that expresses meaning, e.g. that one property is allowed only together with another, is a decision and is stated with the property. Steering for implementers, e.g. architecture or code-quality advice, belongs only in an [Implementation specification](implementation-spec-conventions.md#what-belongs-in-an-implementation-specification).

## Non-behavioural Design specifications

Some Design specifications describe how the engine API is used rather than how the game behaves, so that a user interface or an AI that plays the game can be designed without changing any rule.

UI specifications are non-behavioural. They guide how a user interface presents the engine API to the [Player](spec-conventions.md#participants), e.g. which screens exist, what each shows by default, and how the graphical user interface looks, but they add no gameplay information, engine API operation, or game data. What a user interface may show and call remains owned by the Foundation specifications that define the engine API and by the specification that owns each value. Where a picture of a screen accompanies its specification, the text does not list what the picture shows: it states what a picture cannot, e.g. behaviour, the states a screen passes through, and the values several screens share.

Autopilot AIs specifications describe how an AI that plays the game chooses its actions, e.g. which goals it pursues and in what order, but they add no engine API operation, rule of the game, or game data. What every such AI receives and may call remains owned by the Foundation specifications that define the engine API.

# Specifying a game concept

A game concept is read by everyone who designs or implements the game, so its description must leave no structural question open.

When specifying a game concept, state its applicable modeling role and mutability. Use prose, property tables, and diagrams for conceptual descriptions; a programming-language declaration is not required. State multiplicity with an explicit scope, the conditions under which it comes into existence, its lifecycle states when it has any, which of its values are stored and which are computed from others, and which values affect current gameplay versus serve only historical explanation. Classify properties separately when these dimensions differ within one modeled thing. Link to the owning specification for details; explicitly retain unresolved decisions rather than filling them with assumptions.

# Writing exact rules

A decision is stated exactly, so that nobody has to guess what was decided, and once, so that it cannot come to disagree with itself.

A rule states its trigger, its inputs, and its outcome. It states the thresholds, inclusivity, caps, floors, and tie-breaks that were decided, in the topic section of the rule they bound. Use a transition table or pseudocode where prose would conceal ordering. A rule names the point at which it applies and nothing more about timing: the one specification that owns the order in which rules apply states that order and what follows from it.

## Formula and state machine notations

A specification may use either of the following notations where it fits the behavior being described. They are notations, not a classification: a specification is not required to label its statements, and behavior that fits neither is described in ordinary prose.

A **formula** computes one value from other values. It states its expression, and where rounding occurs with which rounding operation. A cap or a floor is part of the expression. Each input is named by the term or the game data property that defines it; an input that nothing else defines is defined at the formula, with its unit. A formula does not restate the definition of an input, and it states neither the range of its result nor the absence of rounding.

E.g., "The total price equals the unit price multiplied by the quantity, rounded down to a whole number of cents."

A **state machine** describes something that is in exactly one of a fixed set of states at a time. It is described once: as a transition table that gives each transition its source state, target state, trigger, and condition, or as prose, and never as both. A diagram may accompany either. A transition table holds every transition, so a transition it does not hold cannot happen.

E.g., a door is Open, Closed, or Locked, and these are its transitions:

| Source state | Target state | Trigger | Condition                   |
| ------------ | ------------ | ------- | --------------------------- |
| Open         | Closed       | Close   | Nothing blocks the doorway. |
| Closed       | Open         | Open    | Always permitted.           |
| Closed       | Locked       | Lock    | The opener holds the key.   |
| Locked       | Closed       | Unlock  | The opener holds the key.   |

## Formulas and uncertainty

A formula is evaluated by a machine and a random rule is tested by fixing its outcomes, so both state what a reader could otherwise only assume.

Show evaluation order and rounding points; link common numeric rules rather than assuming real-number arithmetic equals runtime arithmetic.

For random rules, state every random outcome as a distinct, named outcome: what it belongs to, its possible values, and its distribution, including interval boundaries and the success comparison. E.g., "each delivery has one delay outcome, late or on time, and each late delivery has one lateness outcome, a whole number of days from 1 to 10". A reader must be able to tell how many distinct random outcomes a rule has, because a named random outcome is what an example or a test fixes when it relies on a random result. Also state which state each random outcome may depend on and which information is hidden. Do not state when or in which order random values are drawn.

Distinguish the true probability, conditional probability, cumulative probability, and displayed estimate whenever relevant. Define what information an estimate conditions on, including previous outcomes.

Give a formula one worked numerical example, with invented numbers rather than the present values of game data, which change. A specification of the Foundation [Family](spec-conventions.md#specifications) may show one rule through several examples, each from a different angle, because other specifications build on its concepts. Equations, prose, pseudocode, and examples must agree. An unexplained "chance increases over time" or "diminishing returns" is not a complete rule.

## Contracts and game data

Game data and the engine API both exist twice, as a design and as files or code, and a specification holds only the design.

A specification says what each property of game data means, its unit, and which rule reads it. It never states the value of a property, a count of records, or a list of record identifiers: those live only in the game data files, where they change without the specification changing. A name or a number appearing only inside an example is not implied game data.

A specification describes the engine API by its operations, who may call them, and what they guarantee. Exact names, types, argument shapes, and error representations are stated only where the [Game designer](spec-conventions.md#participants) decided them. Conceptual domain specifications need not mirror implementation storage layouts.

# Scope exclusions

Something is out of scope when it is not part of the game and there is no plan to specify it. State it only where a reader would otherwise expect the missing rule, in the topic section where they would look for it, as one sentence. Do not collect exclusions in Overview or in a list. Something that will be specified later is not out of scope; it is a [TODO](spec-conventions.md#kinds-of-unspecified-content).

Name each exclusion with its [canonical term](terminology-conventions.md#glossary), or with the title of the specification or section that owns it. Do not [coin a descriptive phrase](terminology-conventions.md#canonical-terminology) for an exclusion; an exclusion that no defined term or owning section names is rarely worth stating.

E.g., the section on placing an Order says in one sentence that gift wrapping is out of scope. The Overview of that specification says nothing about what the specification does not cover.

# Examples, conformance, and evidence

An example shows that a rule means what its author intended; the rule alone decides what is required. A specification may explain its rules through worked examples alongside the concepts they illustrate. Worked examples introduce no rules and need not be organized as test fixtures or command sequences. An example that relies on a random result fixes each random outcome it relies on by the name its rule gives it, and never states a result that depends on a particular seed.

Examples of one specification's rules stay in that specification. An example of an interaction between several game systems belongs to the specification that owns that interaction, e.g. the specification that owns the order of same-turn effects, and links the rules of the other specifications it exercises.

When the code or a test disagrees with a decision a specification states, the code or the test is wrong. Do not rewrite a specification merely to bless existing behavior. Where the specifications are silent there is nothing to disagree with: a test of such behaviour records what the code does, so that a change to it is noticed, and the test changes when the behaviour is changed on purpose.

Every statement of a Design specification is normative unless it is labelled **Informative rationale** or stands in a section or appendix that declares itself informative. A rule carries no label of its own, and in particular none that records where it came from or whether it has been reviewed.

## Consistency of rules and examples

A rule and its examples are written together and must stay together. When a decision changes, its examples, the game data that it reads, and the specifications that link to it change in the same change.
