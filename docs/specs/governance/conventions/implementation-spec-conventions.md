# Implementation Specification Conventions

| Metadata    | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Spec ID     | ICONV                                                                                    |
| Family      | Conventions                                                                              |
| Audience    | Engine designer, Implementer                                                             |
| Owns        | What an Implementation specification may state, and how its Binding decides its wording. |
| Conventions | [Specification Conventions](spec-conventions.md)                                         |

# Overview

The [Design specifications](spec-conventions.md#specifications) are abstract on purpose, while an [Implementation](spec-conventions.md#artifacts) is built in a concrete environment, e.g. a directory on the [Game designer](spec-conventions.md#participants)'s machine with a particular toolchain. Implementation specifications bridge the two, and they must do it without ever becoming part of the design: an Implementation that ignores their advice must still be a correct Implementation of the game.

What decides how far one binds is its Binding. A Mandatory specification states the few constraints that the [Development loop](../process/development-loop.md#glossary) needs from every Implementation, and a Guidance specification only suggests. Implementation Specification Conventions builds on Specification Conventions: Specification Conventions says how any specification is written, and Implementation Specification Conventions says what an Implementation specification states and how strongly.

# Glossary

Terms about [specifications](spec-conventions.md#specifications) in general are in the Specification Conventions glossary.

| Term | Definition |
| --- | --- |
| Binding | Whether an [Implementation](spec-conventions.md#artifacts) specification is Guidance, which implementations may ignore, or Mandatory, which every implementation must follow; it follows from the specification's [Family](spec-conventions.md#specifications). |

# What belongs in an Implementation specification

An Implementation specification steers how an Implementation is built, never what the game does. A statement belongs in an Implementation specification only if it meets at least one of the following criteria. This list is exhaustive:

1. **Repository constraint:** the statement is in a Mandatory specification, and it constrains where in this repository an implementation resides, which files outside that place it may touch, or which records or license it keeps there, or that two of its code paths which a specification requires to agree share one implementation, or how much play its tests and verification runs may simulate and what they may check, so that a check of the repository could fail when the statement is violated.
2. **Implementation steering:** the statement is in a Guidance specification, and it suggests how to build or maintain an Implementation, e.g. architecture or code-quality advice, or the steps of one recurring task.

Implementation specifications are non-behavioural. They own no rule of the game, observable contract, or game data, and no acceptance test through the engine API depends on them. Each one is either Guidance or Mandatory, as described in [Implementation binding](#implementation-binding). An Implementation specification may explain which observable contract its guidance supports; that contract remains owned and guaranteed by its own specification. Implementation specifications are [registered](spec-conventions.md#specifications) so that they appear in the generated views and the [Reference graph](artifact-relationships.md#graphs).

# Implementation binding

Not every Implementation specification binds every Implementation. No specification has a Binding metadata row: the Binding of an Implementation specification follows from its Family. The Binding of an Implementation specification states how strictly an implementation follows it. It follows from the Family: a specification of the Mandatory Family is Mandatory, and a specification of the Guidance or Recipes Family is Guidance. The following table is exhaustive.

| Binding | Meaning | Wording of the document's own statements |
| --- | --- | --- |
| Guidance | Suggestions that steer implementers toward code that is easier to maintain and to check. An implementation that ignores the document is still correct. | "should" or "is suggested"; never **must** or **must not** |
| Mandatory | Repository constraints that every implementation must meet. An implementation that violates one is incorrect even when it satisfies every other specification. | **Must** and **must not**, as in [Requirement wording](spec-conventions.md#requirement-wording) |

Binding applies to the whole document. A topic that has both suggestions and repository constraints is split into a Mandatory document and a Guidance or Recipes document. A Guidance document may restate, with a link, a [requirement](spec-conventions.md#specifications) that another specification owns, e.g. an undo rule of a Design specification; the restated requirement keeps the wording of its owner. A Mandatory document states only Repository constraints, as defined in [What belongs in an Implementation specification](#what-belongs-in-an-implementation-specification); they are checked against the repository rather than through the engine API.

Every Mandatory document applies to every implementation, whatever its platform, language, or engine and whatever the instructions it is built under; e.g., it applies equally to a browser implementation and to an implementation in a third-party game engine. Instructions given to an implementer do not waive it.
