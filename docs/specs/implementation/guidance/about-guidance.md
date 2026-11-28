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

## Implementation Performance

[Implementation Performance](implementation-performance.md) answers _why does play slow down as a Campaign grows, how fast should it be, and how is a speed-up measured and recorded?_

## Performance Log

[Performance Log](performance-log.md) answers _which speed-ups were considered, which were applied, postponed, or rejected, why, and what did they save?_ It records each with its commits, so that each can be reverted once the game needs fewer Agents and Upgrades.

# How they relate

The Guidance specifications build on the Design specifications, mostly on the Foundation family's engine API, saves, and Timeline; the Performance Log also records changes to Basic Autopilot AI and to Economy and Upgrades. The Performance Log relies on Implementation Performance for how a Performance change is measured and recorded; no other Guidance specification relies on another.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

![Guidance family: references within the family](../../../images/diagrams/guidance-family-within.svg)

## Across families

![Guidance family: relationships with other families](../../../images/diagrams/guidance-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Each Guidance specification answers one open technical question, so a change can follow one suggestion and set another aside, e.g. change the Storage Schema without touching Gameplay Dependency Direction.
