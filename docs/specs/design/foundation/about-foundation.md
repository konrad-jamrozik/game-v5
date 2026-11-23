# About the Foundation family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Foundation specifications hold the cross-cutting contracts that every other part of the game builds on: shared vocabulary, engine guarantees, campaign-data structure, the engine subsystems, and the numeric machinery. Mechanics, Content, and Implementation specifications all depend on them; none of them is about a single game system.

The family reads from abstract to concrete: words, then engine promises, then data rules, then one document per engine subsystem. The game's own concepts and rules are in the Mechanics family, which builds on this one.

# Documents

The specifications are listed in reading order; Numbers is read as needed.

## Core Concepts

[Core Concepts](core-concepts.md) answers _what do the shared words mean?_ It defines meanings only, and nearly every other specification uses it, so each term has a single definition.

## Engine Contract

[Engine Contract](engine-contract.md) answers _what is true of the engine as a whole?_ It owns no engine subsystem: it names the one owner of each, without stating that subsystem's behavior.

## Player API

[Player API](player-api.md) answers _what can the player see, and how do gameplay actions change a Campaign?_

## Campaign State

[Campaign State](campaign-state.md) answers _what is a Campaign's data made of?_ It stays generic: the rules would hold for any game built on this engine.

## Campaign Instances

[Campaign Instances](campaign-instances.md) answers _how is one thing in a Campaign's world modeled?_

## History and Turn Report

[History and Turn Report](world-history.md) answers _what must a Campaign remember?_

## Game Data Records

[Game Data Records](game-data-records.md) answers _what can a Game Data Record (GDR) be used for?_

## Effect Lists

[Effect Lists](effect-lists.md) answers _how does game data say what changes when something happens?_ It defines no Effect kind: each Mechanics specification defines the Effect kinds that change the values it owns.

## Conditions

[Conditions](conditions.md) answers _how does game data say when something may happen?_ It defines no Condition kind: each Mechanics specification defines the Condition kinds that check the facts it owns.

## Campaign Lifecycle

[Campaign Lifecycle](campaign-lifecycle.md) answers _how does a Session get, change, and lose its Current campaign?_

## Developer Access

[Developer Access](developer-access.md) answers _how can the Session controller inspect and change a Campaign beyond ordinary play?_

## Determinism and Randomness

[Determinism and Randomness](determinism-and-randomness.md) answers _what makes a Campaign reproducible?_ Each Mechanics specification still owns the distributions of its own random outcomes.

## Saves

[Saves](saves.md) answers _what do saving and loading do, and what does the engine save by itself?_

## Timeline

[Timeline](timeline.md) answers _how does the player go back and forward, within a Turn and across Turns?_

## Configuration

[Configuration](configuration.md) answers _where does each setting live, and which value applies?_

## Autopilot

[Autopilot](autopilot.md) answers _how does an AI play on the player's behalf?_

## Numbers

[Numbers](numbers.md) answers _how do the game's numbers behave?_ It owns nothing about randomness.

# How they relate

Core Concepts sits underneath everything, and Engine Contract, which states the guarantees shared by every engine subsystem, comes next. Every other Foundation specification builds on those two and on the specifications whose terms its rules use. The diagrams below are generated from those links, so they show each specification's present layer. The [Mechanics family](../mechanics/about-mechanics.md) builds on this one, with Domain Model as its base.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

![Foundation family: references within the family](../../../images/diagrams/foundation-family-within.svg)

## Across families

![Foundation family: relationships with other families](../../../images/diagrams/foundation-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Core Concepts versus the rest:** vocabulary is shared by every family, so it cannot live inside any one of its users.
- **Foundation versus Mechanics:** Foundation holds what would hold for any game on this engine; Mechanics holds this game. E.g., Factions can be redesigned without touching Campaign State, and reference integrity can be tightened without touching Domain Model.
- **Engine Contract versus Campaign State:** engine behavior (e.g. sessions and access) and data shape (e.g. the components of Campaign state) change for different reasons. Keeping data rules in their own refinement lets Engine Contract stay about guarantees.
- **Engine Contract versus Player API:** the shape of the engine changes when a part or a kind of caller is added; what the player may see changes with every mechanic. Mechanics specifications rely mostly on the second, so it has its own document.
- **Campaign State, Campaign Instances, and History and Turn Report:** what a Campaign's data is made of, how one thing in it is modeled, and what it remembers of its past change for different reasons, so each has its own document. E.g., a new Turn series changes only History and Turn Report, and a change to how a Role Type is declared changes only Campaign Instances.
- **Campaign State versus Game Data Records:** the first holds the rules for data that changes during a Campaign; the second holds the uses of data that never changes during one.
- **Game Data Records versus Effect Lists:** the first holds the uses a GDR can serve as a whole; the second holds one shape that a property of a GDR can have, which many Types share. E.g., a new Effect kind changes one Mechanics specification and neither of these two.
- **Effect Lists versus Conditions:** an Effect changes a Campaign and a Condition only asks about one. Because asking changes nothing, Conditions may combine to any depth, while an Effect list stays a plain list, so the two have different rules and change for different reasons.
- **Engine Contract versus the engine subsystem specifications:** Engine Contract holds only what is true across all engine subsystems, and each engine subsystem has exactly one owning specification, which owns no other. E.g., the rule for which World state `undoAction()` makes current is stated once, in Timeline.
- **Saves versus Timeline:** Saves holds what most games have: saving, loading, and the Autosaves the engine writes. It needs nothing from Timeline. Timeline holds all undo and redo and builds on Saves. Undo and redo within a Turn work without any Campaign save; undo and redo across Turns load Autosaves, so Timeline uses Saves rather than the reverse.
- **Numbers:** several Mechanics documents depend on the same arithmetic, e.g. the same rounding operations, so it does not belong inside a single mechanic.
- **Determinism and Randomness versus Engine Contract:** determinism, the Campaign seed, random outcomes, and unique identifiers share one test, whether replay must reproduce a result, and change together, so one document holds them in detail. Each Mechanics document owns the distributions of its own random outcomes, and how a random rule is written is owned by Specification Conventions.
