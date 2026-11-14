# About the Acceptance family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Acceptance specifications own cross-system fixtures, scenarios, expected outcomes, and requirement traceability. They
verify that the game systems work together and introduce no new mechanics.

# Documents

## Campaign Integration and Acceptance Tests

[Campaign Integration and Acceptance Tests](campaign-integration-and-acceptance-tests.md) answers _how do we know the
systems work together?_ It owns test scenarios, each with a starting state, Player actions, and expected results that
reference their owning rules.

# How they relate

Its scenarios use the Foundation family for timing, undo and redo, and saves, Game Data Records (GDRs) for starting data, and the
Engine API for the surfaces they exercise. Nothing depends on it in return.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

This family has a single specification, so there are no relationships within it.

## Across families

![Acceptance family: relationships with other families](../../images/acceptance-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Each Mechanics specification keeps examples of its own rules; this family covers only behavior that spans systems.
Keeping these scenarios separate stops them from becoming a second, competing owner of any rule.
