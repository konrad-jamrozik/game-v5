# About the Mandatory family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The Development loop needs a few things from the Implementation: that it lives where it can be found, that its copies of game data and assets match their originals, that its developer tools run the same code as play, that its tests of whole Campaigns stay short and check only that play runs, that its tests take retunable values from the Game build instead of copying them, and that it is published on the same terms as the specifications. Mandatory specifications state those repository constraints. They are checked against the files of an Implementation rather than through the engine API.

# Documents

## Implementation Placement

[Implementation Placement](implementation-placement.md) answers _where does an implementation live?_ It confines each implementation to its own Implementation repo beside the Spec repo, e.g. `game-v5-impl-a/`, which the implementation treats as its repository root.

## Implementation License

[Implementation License](implementation-license.md) answers _under which license is an implementation published?_ It requires each implementation to be published under the license of the specifications, CC BY-NC 4.0, and to state it in its `LICENSE` file, its README, and its project metadata.

## Rule Reuse

[Rule Reuse](rule-reuse.md) answers _how does a developer tool stay true to play?_ It requires each Developer tool to call the very code that play runs for the same rule, e.g. one function that fights a Combat for both the Mission resolution step and `fightCombat`, and a test that shows the two agree.

## Campaign Tests

[Campaign Tests](campaign-tests.md) answers _how much play may a test simulate?_ It limits each test that plays Campaigns with an Autopilot AI to at most two Campaigns of at most 200 Turns each, and to checking that play does not fail, never balance, e.g. never whether the Basic Autopilot AI wins.

## Test Values

[Test Values](test-values.md) answers _where does a test take the values it checks against?_ It requires each test to take every retunable value, e.g. the hire cost of an Agent, from the Game build or set it itself, and to derive what it expects from the rule it checks, never from the output of the code, so that a retune changes no test.

# How they relate

Implementation Placement uses GDRs from the Content family and Music and Visual Design from the UI family, whose files the Implementation copies. Implementation License uses Implementation Placement for the Implementation repo whose files state the license. Rule Reuse uses Developer Access and Combat from the Design families, which define the Developer tools it constrains. Campaign Tests uses Implementation Placement for the Implementation repo whose tests it limits, and Autopilot and the Basic Autopilot AI from the Design families, whose play its tests run. Test Values uses Implementation Placement for the Implementation repo whose tests it constrains, and GDRs from the Foundation family and the Tuning parameters of the Basic Autopilot AI, whose values its tests take from the Game build.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

![Mandatory family: references within the family](../../../images/diagrams/mandatory-family-within.svg)

## Across families

![Mandatory family: relationships with other families](../../../images/diagrams/mandatory-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Mandatory specifications are kept to placement, feedback, tracking, and licensing, so that several independent implementations can coexist beside the specifications, each can be updated from their changes, and each can be shared on known terms. Each covers one kind of file an implementation keeps, so a change to one never forces a change to the others.
