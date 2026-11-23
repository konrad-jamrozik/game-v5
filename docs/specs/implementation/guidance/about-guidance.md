# About the Guidance family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The Design specifications leave technical matters open, e.g. how code is organized, and the code decides them. Guidance specifications record the few suggestions and trade-offs on those matters that the code cannot show and a later change should not undo. An Implementation that ignores them is still correct.

# Documents

## Gameplay Dependency Direction

[Gameplay Dependency Direction](gameplay-dependency-direction.md) answers _what may gameplay code read?_

## Headless First

[Headless First](headless-first.md) answers _what should stay playable without the graphical user interface?_

## Storage Schema

[Storage Schema](storage-schema.md) answers _how might everything persisted be laid out?_ It explains why a Timeline is stored by replay.

## Test Focus

[Test Focus](test-focus.md) answers _which properties are tests best spent on?_

## Autopilot Performance

[Autopilot Performance](autopilot-performance.md) answers _why does a Turn slow down as the Agency grows, and what was done about it?_ It records each performance change with its commits, so that each can be reverted once the game needs fewer Agents and Upgrades.

# How they relate

The Guidance specifications build on the Design specifications, mostly on the Foundation family's engine API, saves, and Timeline; Autopilot Performance also records changes to Basic Autopilot AI and to Economy and Upgrades. No Guidance specification relies on another.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

No specification of this family links another specification of it.

## Across families

![Guidance family: relationships with other families](../../../images/diagrams/guidance-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Each Guidance specification answers one open technical question, so a change can follow one suggestion and set another aside, e.g. change the Storage Schema without touching Gameplay Dependency Direction.
