# About the Mechanics family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Mechanics specifications own the player-facing game systems: their rules, transitions, formulas, and effects. [Domain Model](domain-model.md) defines the game's concepts and how they relate, and each other one details part of it with what its concepts have and the detailed behavior of one system, using [Numbers](../foundation/numbers.md) for arithmetic. Each one owns the distributions of its own random outcomes. Exact balance values and catalogs are Game Data Records (GDRs); [Turn Advancement](turn-advancement.md) states when each rule applies during Advance turn, and which values it uses.

# Documents

## Domain Model

[Domain Model](domain-model.md) answers _what exists in this game?_ It defines each concept briefly and states the rules that span several concepts; each other Mechanics specification details one concept.

## Panic and Endings

[Panic and Endings](panic-and-endings.md) answers _how does a Campaign end?_

## Agents

[Agents](agents-spec.md) answers _what does an Agent have, and what can it be assigned to do?_

## Agent Recovery

[Agent Recovery](agent-recovery.md) answers _how does an Agent get back to full strength?_

## Economy and Upgrades

[Economy and Upgrades](economy-and-upgrades.md) answers _where does the Agency's money come from and go?_

## Equipment

[Equipment](equipment.md) answers _what does each Agent carry into a Combat, and where does it come from?_

## Leads and Progression

[Leads and Progression](leads-and-progression.md) answers _what becomes available, and when?_

## Investigations

[Investigations](investigations.md) answers _how does pursuing a Lead progress and complete?_

## Combat

[Combat](combat.md) answers _how does a Combat play out?_ A Combat is fully automatic, and its result is reproducible.

## Missions

[Missions](missions.md) answers _what happens at a place where Enemies are present, and what follows from its result?_ Its subjects are the Mission site and the Mission that deploying Agents to it creates.

## Factions

[Factions](factions.md) answers _how do the opponents push back?_

## Compendium

[Compendium](compendium.md) answers _what can the player look up about the game?_ Its articles are Display content that no rule reads.

## Turn Advancement

[Turn Advancement](turn-advancement.md) answers _what happens during Advance turn, and in which order?_

# How they relate

The family is arranged in layers with Domain Model as the base. Every Mechanics document builds on the Foundation family and supplies the meanings that Game Data Records (GDRs) fill with values.

## The layer rule

A document's layer is one after the latest layer among the Mechanics documents it references, i.e. whose terms its rules use; a document that references no Mechanics document is in layer 1. The first diagram below shows each document's layer, and the layers are also the order in which to read the documents.

A document in an earlier layer states what its things are and what can happen to them. A document in a later layer states when it happens and by how much. A document may link to those later details, but never depends on them.

E.g., Agents states what current health and base health are and that current health can go down and up. The Combat specification states how a Combat lowers current health, and Agent Recovery states how it goes back up.

A document therefore uses only the terms it owns and terms owned in earlier layers. A term that documents of several layers use belongs in Domain Model, e.g. Agent status or Upgrade.

E.g., Missions uses terms of Combat, which is in layer 3, so Missions is in layer 4.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

![Mechanics family: references within the family](../../../images/diagrams/mechanics-family-within.svg)

## Across families

![Mechanics family: relationships with other families](../../../images/diagrams/mechanics-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Agents versus the documents that change an Agent:** Agents is the complete list of what an Agent has and which values can be modified, so no Agent property is introduced by a higher document.
- **Combat versus Missions:** a Combat's resolution is kept separate from its Consequences, so Combat can be tested and tuned without the Campaign around it.
- **Leads and Progression versus Investigations:** what is available is separated from how the player pursues it, so the progression graph can change without touching investigation mathematics.
- **Panic and Endings versus the rest:** campaign-wide state (panic and the ending predicates) belongs to no single system.
- **Domain Model versus the other Mechanics documents:** Domain Model holds each concept's definition and the rules relating one concept to another; what a single concept has and does on its own belongs to the Mechanics document that details it. E.g., that an Agent's Assignment places the Agent in a Current team is in Domain Model, and the Agent statuses are in Agents. A statement belongs where the first of these questions that answers yes places it:
  1. Does it say what a word means? It is a Glossary definition in Domain Model, unless the word is about a single concept only.
  2. Does it say how a concept is modeled, or how many exist? It is a row of the Game concepts table in Domain Model.
  3. Does it say which concept references which, how many, and whether the reference can change? It is a row of the How concepts relate table in Domain Model.
  4. Is it about the Campaign as a whole, with no single concept to own it? It is a short section of Domain Model, e.g. Campaign instance identity scope.
  5. Anything else describes one concept on its own and belongs to the Mechanics document that details that concept.
- **Turn Advancement versus the rest:** Advance turn applies rules from many Mechanics documents, and the order in which they apply changes outcomes. Turn Advancement states that order canonically and depends on every document whose rules it orders; those documents only point to it, keep the formulas and effects of their own rules, and are corrected when they contradict the order.
- **Formulas versus values:** each document owns formulas and meanings; the numbers are GDRs, so balancing does not change behavior specifications.
