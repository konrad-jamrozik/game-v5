# About the Process family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The game is developed in rounds: the specifications change, an Implementation follows them, and what that shows flows
back into the specifications. Process specifications own how those rounds run and how the work on the specifications is
planned and tracked.

# Documents

## Development Loop

[Development Loop](development-loop.md) answers _how is the game developed?_ It explains how the Game designer keeps
design control while LLMs write the specifications and Implementations, and how feedback from each Implementation flows
back into the specifications.

## Specification Work Plan and Backlog

[Specification Work Plan and Backlog](work-plan.md) answers _in what order are specifications written and reviewed?_
It owns review batches, checkpoints, and work states.

## Outstanding Work Items

[Outstanding Work Items](work-todos.md) answers _what known issues are waiting to be scheduled?_ It owns the register of
unscheduled issues and the batches they affect.

# How they relate

Outstanding Work Items uses the Specification Work Plan and Backlog for the batches it assigns each Work item to. The
Development Loop stands apart from both: it describes the whole cycle, while the plan and the register track the work
within it.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

![Process family: uses relationships within the family](../../../images/diagrams/process-family-within-uses.svg)

### Refines

No refines relationships are declared within this family.

## Across families

No relationships are declared with specifications in other families.

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Work plan versus work items:** the plan owns the schedule; the work-item register only records issues, so adding an
  issue never changes the schedule.
- **Development Loop versus the plan:** the Development Loop says how specifications and Implementations change
  together, which holds however the work is scheduled.
