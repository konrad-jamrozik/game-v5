# About the Mechanics family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Mechanics specifications own the player-facing game systems: their rules, transitions, formulas, and effects. Each one
refines part of the [Domain Model](../foundation/domain-model.md) with the detailed behavior of one system, using
[Numbers and Randomness](../foundation/numbers-and-randomness.md) for arithmetic and draws. Exact balance values and
catalogs are Game Data Records (GDRs); which values a rule uses during Advance turn follows
[Turn advancement](../foundation/engine-contract.md#turn-advancement).

# Documents

## Panic and Endings

[Panic and Endings](panic-and-endings.md) answers _how does a campaign end?_ It owns global panic, the victory and defeat
predicates, and what remains possible after an ending.

## Agents

[Agents](agents-spec.md) answers _what can an agent do, and how does an agent change over time?_ It owns agent capability,
task availability, development, and the meaning of health, exhaustion, and experience.

## Agent Recovery

[Agent Recovery](agent-recovery.md) answers _how does an agent get back to full strength?_ It owns how health goes up
and exhaustion goes down, and the result when several rules change one of those values in the same turn.

## Economy and Upgrades

[Economy and Upgrades](economy-and-upgrades.md) answers _where does the agency's money come from and go?_ It owns
resource flows, personnel purchases, and agency improvements.

## Leads and Progression

[Leads and Progression](leads-and-progression.md) answers _what becomes available, and when?_ It owns the progression
graph and the lifecycle of Leads, separately from the Investigations that pursue them.

## Investigations

[Investigations](investigations.md) answers _how does pursuing a Lead progress and complete?_ It owns investigation
progress, stochastic completion, player uncertainty, and commitment costs.

## Combat

[Combat](combat.md) answers _how does a battle play out?_ It owns fully automatic battles and their reproducible
results, independently of what those results mean for the campaign.

## Missions

[Missions](missions.md) answers _what does committing agents to a mission cost, and what follows from its result?_ It
owns mission commitments and turns Battle results into campaign consequences.

## Factions

[Factions](factions.md) answers _how do the opponents push back?_ It owns escalating faction pressure, Faction
operation occurrence generation, suppression, and permanent defeat.

# How they relate

The family is arranged in tiers with Agents as the base. Every Mechanics document is refined from the Foundation
family and supplies the meanings that Game Data Records (GDRs) fill with values.

## The tier rule

A lower document states what its things are and what can happen to them. A higher document states when it happens and
by how much. A lower document may point up to those details with an ownership pointer, but never depends on them.

E.g., Agents states what health is and that it can go down and up. Combat states how a Battle lowers it, and Agent
Recovery states how it goes back up.

| Tier | Documents                              | Depends on                                     |
| ---- | -------------------------------------- | ---------------------------------------------- |
| 1    | Agents                                 | Foundation only                                |
| 2    | Combat, Economy and Upgrades, Factions | Agents                                         |
| 3    | Missions                               | Agents, Combat, Economy and Upgrades, Factions |
| 4    | Agent Recovery, Leads and Progression  | Agents, Factions, Missions                     |
| 5    | Investigations                         | Agents, Leads and Progression                  |

Panic and Endings declares no relationship to another Mechanics document yet; its tier is decided when its predicates
are written.

A document refines a lower one when it adds detail to the same subject, e.g. Combat refines Agents with how health
goes down. It uses a lower one when it reads that subject to describe its own, e.g. Combat uses Agent skill to resolve
a Battle.

The following hand-drawn diagram is a trial of SVG diagrams. It shows the tiers together with the five relationships
removed when the tiers were introduced; the generated diagrams below show the current relationships.

![Planned Mechanics tiers](./mechanics-tiers.svg)

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; dashed boxes stand for whole other Families._

## Within the family

```mermaid
flowchart TD
  AGENT["AGENT — Agents (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  ENDING["ENDING — Panic and Endings (Stub)"]
  FACTION["FACTION — Factions (Stub)"]
  INVSTG["INVSTG — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  RECOVER["RECOVER — Agent Recovery (Stub)"]
  AGENT -->|refined by, used by| COMBAT
  AGENT -->|refined by, used by| ECON
  AGENT -->|used by| INVSTG
  AGENT -->|used by| MISSION
  AGENT -->|refined by| RECOVER
  COMBAT -->|used by| MISSION
  ECON -->|used by| MISSION
  FACTION -->|refined by, used by| LEAD
  FACTION -->|refined by, used by| MISSION
  LEAD -->|used by| INVSTG
  MISSION -->|used by| LEAD
  MISSION -->|used by| RECOVER
```

## Across families

```mermaid
flowchart LR
  AGENT["AGENT — Agents (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  ENDING["ENDING — Panic and Endings (Stub)"]
  FACTION["FACTION — Factions (Stub)"]
  INVSTG["INVSTG — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  RECOVER["RECOVER — Agent Recovery (Stub)"]
  family_foundation["Foundation family"]:::external
  family_interfaces["Interfaces family"]:::external
  AGENT -->|used by| family_interfaces
  COMBAT -->|used by| family_interfaces
  ECON -->|used by| family_interfaces
  ENDING -->|used by| family_interfaces
  FACTION -->|used by| family_interfaces
  INVSTG -->|used by| family_interfaces
  LEAD -->|used by| family_interfaces
  MISSION -->|used by| family_interfaces
  RECOVER -->|used by| family_interfaces
  family_foundation -->|refined by, used by| AGENT
  family_foundation -->|refined by, used by| COMBAT
  family_foundation -->|refined by, used by| ECON
  family_foundation -->|refined by, used by| ENDING
  family_foundation -->|refined by, used by| FACTION
  family_foundation -->|refined by, used by| INVSTG
  family_foundation -->|refined by, used by| LEAD
  family_foundation -->|refined by, used by| MISSION
  family_foundation -->|used by| RECOVER
  classDef external stroke-dasharray: 5 5
```

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Agents versus the documents that change an Agent:** Agents is the complete list of what an Agent has and which
  values can be modified, so no Agent property is introduced by a higher document.
- **Combat versus Missions:** a battle's resolution is kept separate from its campaign consequences, so combat can be
  tested and tuned without the campaign around it.
- **Leads and Progression versus Investigations:** what is available is separated from how the player pursues it, so
  the progression graph can change without touching investigation mathematics.
- **Panic and Endings versus the rest:** campaign-wide state (panic and the ending predicates) belongs to no
  single system.
- **Formulas versus values:** each document owns formulas and meanings; the numbers are GDRs, so balancing does not change behavior specifications.

# Reading order

Read in tier order: [Agents](agents-spec.md); then [Combat](combat.md), [Economy and Upgrades](economy-and-upgrades.md),
and [Factions](factions.md); then [Missions](missions.md); then [Agent Recovery](agent-recovery.md) and
[Leads and Progression](leads-and-progression.md); then [Investigations](investigations.md).
[Panic and Endings](panic-and-endings.md) can be read at any point.
