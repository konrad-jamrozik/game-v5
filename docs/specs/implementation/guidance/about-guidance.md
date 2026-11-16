# About the Guidance family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The Design specifications deliberately leave many technical matters open, e.g. the toolchain or how code is organized.
Guidance specifications suggest answers that make an Implementation easier to maintain and to check. An Implementation
that ignores them is still correct.

# Documents

## Tech Stack Suggestion

[Tech Stack Suggestion](tech-stack-suggestion.md) answers _what technologies can a browser implementation use?_ It
suggests a technology stack for an implementation that uses a browser as its GUI.

## Gameplay Dependency Direction

[Gameplay Dependency Direction](gameplay-dependency-direction.md) answers _what may gameplay code read?_ It steers
gameplay code away from Campaign state beyond its necessary inputs.

## Headless First

[Headless First](headless-first.md) answers _what should an implementation build before its graphical user interface?_
It suggests making the whole game playable through the Command-Line Interface first.

## Storage Schema

[Storage Schema](storage-schema.md) answers _how might everything persisted be laid out?_ It steers implementers toward
one physical layout for Game storage.

# How they relate

The Guidance specifications do not depend on one another; each builds only on Design specifications. Gameplay
Dependency Direction uses the vocabulary and determinism guarantees of the Foundation family, together with the Graphical
User Interface and Basic Autopilot AI, whose code it keeps behind the engine API. Headless First uses Engine Contract and
both user interfaces of the UI family, whose order of construction it suggests. Storage Schema uses the data ownership, Campaign save,
and Timeline contracts of the Foundation family.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

No uses relationships are declared within this family.

### Refines

No refines relationships are declared within this family.

## Across families

![Guidance family: relationships with other families](../../../images/guidance-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Each Guidance specification answers one open technical question, so an Implementation can adopt one suggestion and
ignore another: e.g., an Implementation in a game engine can ignore Tech Stack Suggestion and still follow Gameplay
Dependency Direction.
