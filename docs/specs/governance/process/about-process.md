# About the Process family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The game is developed in rounds: the Game designer says what should change, the specifications and the Implementation change to match, and playing the result shows what to change next. The Process specification owns how those rounds run.

# Documents

## Development Loop

[Development Loop](development-loop.md) answers _how is the game developed?_ It explains how the Game designer keeps design control while LLMs write the specifications and the Implementation, and which artifact is the truth for which question.

# How they relate

The Development Loop is the one Process specification. It relies on the Design and Implementation specifications for what each artifact owns, and on the `apply` skill for the steps of a change.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

This family has a single specification, so there are no references within it.

## Across families

![Process family: relationships with other families](../../../images/diagrams/process-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

How a change reaches the game is one subject, so it has one specification. The steps an agent runs live in skills, which change more often than the principles they follow.
