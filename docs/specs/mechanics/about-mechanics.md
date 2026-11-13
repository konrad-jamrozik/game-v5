# About the Mechanics family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Mechanics specifications own the player-facing game systems: their rules, transitions, formulas, and effects. Each one
refines part of the [Domain Model](../foundation/domain-model.md) with what its concepts have and the detailed
behavior of one system, using
[Numbers](../foundation/numbers.md) for arithmetic. Each one owns the distributions of its own random outcomes. Exact balance values and
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

The family is arranged in layers with Agents as the base. Every Mechanics document is refined from the Foundation
family and supplies the meanings that Game Data Records (GDRs) fill with values.

## The layer rule

A document's layer is one after the latest layer among the Mechanics documents it uses or refines; a document that
depends on no Mechanics document is in layer 1. The first diagram below shows each document's layer.

A document in an earlier layer states what its things are and what can happen to them. A document in a later layer
states when it happens and by how much. A document may point to those later details with an ownership pointer, but
never depends on them.

E.g., Agents states what health is and that it can go down and up. Combat states how a Battle lowers it, and Agent
Recovery states how it goes back up.

A document refines an earlier one when it adds detail to the same subject, e.g. Combat refines Agents with how health
goes down. It uses an earlier one when it reads that subject to describe its own, e.g. Combat uses Agent skill to
resolve a Battle.

Panic and Endings declares no relationship to another Mechanics document yet, so it is drawn in layer 1; its layer is
decided when its predicates are written.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

![Mechanics family: relationships within the family](./mechanics-family-within.svg)

## Across families

![Mechanics family: relationships with other families](./mechanics-family-across.svg)

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

Read in layer order: [Agents](agents-spec.md) and [Factions](factions.md); then [Combat](combat.md) and
[Economy and Upgrades](economy-and-upgrades.md); then [Missions](missions.md); then
[Agent Recovery](agent-recovery.md) and [Leads and Progression](leads-and-progression.md); then
[Investigations](investigations.md). [Panic and Endings](panic-and-endings.md) can be read at any point.
