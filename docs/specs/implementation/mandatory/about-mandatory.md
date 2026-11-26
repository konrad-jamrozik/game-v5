# About the Mandatory family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The Development loop needs a few things from the Implementation that no play of the game would reveal, e.g. that its copies of game data match their originals, or that its tests survive a retune. Mandatory specifications state those repository constraints, and every change to the Implementation must keep them. They are checked against the files of an Implementation rather than through the engine API.

# Documents

## Implementation Placement

[Implementation Placement](implementation-placement.md) answers _where does an implementation live?_ It confines each implementation to its own Implementation repo beside the Spec repo, and keeps its copies of the Spec repo's files equal to their originals.

## Implementation License

[Implementation License](implementation-license.md) answers _under which license is an implementation published?_

## Rule Reuse

[Rule Reuse](rule-reuse.md) answers _how does a developer tool stay true to play?_ A Developer tool and play call one implementation of the rule they share, and a test shows that they agree.

## Campaign Tests

[Campaign Tests](campaign-tests.md) answers _how much play may a test simulate?_ A test that plays Campaigns with an Autopilot AI stays short and checks only that play runs, never balance; balance is studied in Balancing runs, which an agent makes only when the Game designer asks.

## Test Values

[Test Values](test-values.md) answers _where does a test take the values it checks against?_ A test takes every retunable value from the Game build, so that a retune changes no test.

# How they relate

Implementation Placement is the base: every other Mandatory specification constrains files or tests of the Implementation repo it defines. Each Mandatory specification otherwise draws on the Design specifications whose files or rules it concerns, e.g. Rule Reuse on Developer Access and Combat.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

![Mandatory family: references within the family](../../../images/diagrams/mandatory-family-within.svg)

## Across families

![Mandatory family: relationships with other families](../../../images/diagrams/mandatory-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Mandatory specifications are kept to constraints that a check of the repository can enforce, so that an Implementation can be updated from changes to the specifications and shared on known terms. Each covers one kind of file or test an implementation keeps, so a change to one never forces a change to the others.
