# About the Mechanics family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Mechanics specifications own the player-facing game systems: their rules, transitions, formulas, and effects. [Domain Model](domain-model.md) defines the game's
concepts and how they relate, and each other one refines part of it with what its concepts have and the detailed
behavior of one system, using
[Numbers](../foundation/numbers.md) for arithmetic. Each one owns the distributions of its own random outcomes. Exact balance values and
catalogs are Game Data Records (GDRs); [Turn Advancement](turn-advancement.md) states when each rule applies during Advance turn,
and which values it uses.

# Documents

## Domain Model

[Domain Model](domain-model.md) answers _what exists in this game?_ It owns the game concepts and how they relate: the
Agency, Agents, Leads, Investigations, Missions, Combat, Factions, weapons, upgrades, and Reports. It applies Core
Concepts' vocabulary and Campaign State's rules to these concepts. It defines each concept briefly and states the
rules that span several concepts; each other Mechanics specification refines one concept with what that concept has,
its lifecycle, formulas, and transitions.

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

## Turn Advancement

[Turn Advancement](turn-advancement.md) answers _what happens during Advance turn, and in which order?_ It owns the
complete, ordered list of Turn advancement steps and which values each step uses, and so the Turn advancement engine
subsystem. It is the canonical order: a Mechanics specification that contradicts it is corrected to match it.

# How they relate

The family is arranged in layers with Domain Model as the base and Turn Advancement as the tip. Every Mechanics document is refined from the Foundation
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

Panic and Endings depends only on Domain Model so far, so it is drawn in layer 2; its layer is decided when its
predicates are written.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

![Mechanics family: relationships within the family](../../images/mechanics-family-within.svg)

## Across families

![Mechanics family: relationships with other families](../../images/mechanics-family-across.svg)

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
- **Domain Model versus the other Mechanics documents:** Domain Model holds each concept's definition and the rules
  relating one concept to another; what a single concept has and does on its own belongs to the Mechanics document
  that refines it. E.g., that an Agent's Current assignment places the Agent in a Current team is in Domain Model, and
  the Agent lifecycle states are in Agents.
- **Turn Advancement versus the rest:** Advance turn applies rules from many Mechanics documents, and the order in
  which they apply changes outcomes. Turn Advancement states that order canonically and depends on every document
  whose rules it orders; those documents only point to it, keep the formulas and effects of their own rules, and are
  corrected when they contradict the order. This repeats a little of each rule in Turn Advancement, which is accepted.
- **Formulas versus values:** each document owns formulas and meanings; the numbers are GDRs, so balancing does not change behavior specifications.

# Reading order

Read in layer order: [Agents](agents-spec.md) and [Factions](factions.md); then [Combat](combat.md) and
[Economy and Upgrades](economy-and-upgrades.md); then [Missions](missions.md); then
[Agent Recovery](agent-recovery.md) and [Leads and Progression](leads-and-progression.md); then
[Investigations](investigations.md). [Panic and Endings](panic-and-endings.md) can be read at any point.
