# About the Autopilot AIs family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The Autopilot AIs family describes the Autopilot AIs that a Game build offers: for each one, what it tries to achieve
when it plays a Campaign and how it prioritizes those aims. [Autopilot](../foundation/autopilot.md) in the Foundation
family defines Autopilot as a game feature, i.e. how an Autopilot engagement is bounded, what any Autopilot AI receives,
and how Autopilot memory behaves. It deliberately leaves out how an Autopilot AI decides what to do. This family fills
that gap, one specification per Autopilot AI, so that the Implementer knows what to build behind each `autopilotAiId`.

A specification in this family describes an Autopilot AI at the level of goals and priorities, e.g. that it never
deploys a team that is likely to lose. It leaves exact thresholds and algorithms to the Implementer. It adds no engine
API operation and no game behavior: an Autopilot AI plays only through Player API, and every game value it reads is
owned by its Mechanics specification.

# Documents

## Basic Autopilot AI

[Basic Autopilot AI](basic-autopilot-ai.md) answers _how does the default Autopilot AI play?_ It plays a sound,
cautious Campaign: it stays solvent, keeps Agents rested, deploys only teams likely to win, keeps Investigations going,
and spends surplus money on growing and improving the Agency.

A further specification is added for each further Autopilot AI, e.g. one that pursues Victory as fast as possible at
greater risk.

# How they relate

Basic Autopilot AI uses Autopilot and Engine Contract from the Foundation family for what it may receive and call, and
the Mechanics specifications whose values it reads, e.g. Agents, Missions, and Economy and Upgrades. Gameplay Dependency
Direction in the Implementation family uses it.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

This family has a single specification, so there are no relationships within it.

## Across families

![Autopilot AIs family: relationships with other families](../../images/autopilot-ais-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Autopilot AIs are kept apart from Foundation so that adding, changing, or removing an Autopilot AI never changes the
Autopilot feature or any other game behavior: the engine treats every Autopilot AI the same way, whichever one the
Session controller engages. They are kept apart from Mechanics because they choose among Player
actions rather than define what those actions do.
