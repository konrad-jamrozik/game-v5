# About the Governance family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Governance specifications own how the specifications themselves are written, related, registered, and scheduled. They
define no gameplay. Every other registered specification implicitly follows
[Specification Conventions](spec-conventions.md).

# Documents

## Game Specification Index

[Game Specification Index](../README.md) answers _which specifications exist, and what does each own?_ It is the
navigation entry point and points to the generated catalog of every specification's ID, Family, title, and Owns
summary. It lives at the root
of the specifications directory rather than in this one.

## Specification Conventions

[Specification Conventions](spec-conventions.md) answers _how is a specification written?_ It owns layout, metadata,
Families and paths, ownership rules, terminology, and lifecycle.

## Artifact Relationships

[Artifact Relationships](artifact-relationships.md) answers _how do artifacts declare their dependencies?_ It owns the
five Relationship kinds, their direction, inventories, and graph validation.

## Specification Work Plan and Backlog

[Specification Work Plan and Backlog](work-plan.md) answers _in what order are specifications written and reviewed?_
It owns review batches, checkpoints, and work states.

## Outstanding Work Items

[Outstanding Work Items](work-todos.md) answers _what known issues are waiting to be scheduled?_ It owns the register of
unscheduled issues and the batches they affect.

# How they relate

Specification Conventions uses Artifact Relationships for the relationship model it requires every specification to
declare. Outstanding Work Items uses the Specification Work Plan and Backlog for the batches it assigns each Work item
to. The index is tied to the rest of the corpus by links rather than declared relationships.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

![Governance family: relationships within the family](../../images/governance-family-within.svg)

## Across families

No relationships are declared with specifications in other families.

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Conventions versus Artifact Relationships:** the relationship model also covers implementations and tests, not
  only specifications, so it is owned separately from specification layout.
- **Work plan versus work items:** the plan owns the schedule; the work-item register only records issues, so adding an
  issue never changes the schedule.
- **Index versus everything else:** the index only navigates; ownership stays with each registered
  document.

# Reading order

Start with the [Game Specification Index](../README.md) and [Specification Conventions](spec-conventions.md), then
[Artifact Relationships](artifact-relationships.md). Consult the [work plan](work-plan.md) and
[outstanding work items](work-todos.md) when planning work.
