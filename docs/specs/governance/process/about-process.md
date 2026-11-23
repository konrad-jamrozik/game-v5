# About the Process family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The game is developed in rounds: the Game designer says what should change, the specifications and the Implementation change to match, and playing the result shows what to change next. Process specifications own how those rounds run and how the work on the specifications is planned and tracked.

# Documents

## Development Loop

[Development Loop](development-loop.md) answers _how is the game developed?_ It explains how the Game designer keeps design control while LLMs write the specifications and the Implementation, and which artifact is the truth for which question.

## Specification Work Plan and Backlog

[Specification Work Plan and Backlog](work-plan.md) answers _in what order are specifications reviewed?_

## Outstanding Work Items

[Outstanding Work Items](work-todos.md) answers _what known issues are waiting to be scheduled?_

# How they relate

Outstanding Work Items uses the Specification Work Plan and Backlog for the batches it assigns each Work item to. The Development Loop stands apart from both: it describes the whole cycle, while the plan and the register track the work within it.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

No specification of this family links another specification of it.

## Across families

![Process family: relationships with other families](../../../images/diagrams/process-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Work plan versus work items:** the plan owns the schedule; the work-item register only records issues, so adding an issue never changes the schedule.
- **Development Loop versus the plan:** the Development Loop says how the specifications and the Implementation change together, which holds however the work is scheduled.
