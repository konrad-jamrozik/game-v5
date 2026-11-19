# About the Foundation family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Foundation specifications hold the cross-cutting contracts that every other part of the game builds on: shared vocabulary, engine guarantees, campaign-data structure, the engine subsystems, and the numeric machinery. Mechanics, Content, and Implementation specifications all depend on them; none of them is about a single game system.

The family reads from abstract to concrete: words, then engine promises, then data rules, then one document per engine subsystem. The game's own concepts and rules are in the Mechanics family, which builds on this one.

# Documents

## Core Concepts

[Core Concepts](core-concepts.md) answers _what do the shared words mean?_ It owns the vocabulary used across the whole game contract, e.g. Campaign, Session, and Game build. It defines meanings only, not behavior, data layout, or mechanics: Engine Contract owns what a Session holds and what is persisted, and Campaign State owns how Campaign state divides into components. Nearly every other specification uses it, so each term has a single definition.

## Engine Contract

[Engine Contract](engine-contract.md) answers _what is true of the engine as a whole?_ It owns how the engine divides, into engine subsystems, API operations, and data, which callers may use which operations, and the guarantees every engine subsystem keeps, e.g. World state integrity. It owns no engine subsystem: it names the one owner of each, without stating that subsystem's behavior.

## Player API

[Player API](player-api.md) answers _what can the player see, and how do gameplay actions change a Campaign?_ It owns how a specification declares a value Player-visible, the contract every gameplay action follows, and the information boundary that keeps every channel of Player API from revealing what its queries hide.

## Campaign State

[Campaign State](campaign-state.md) answers _what is a Campaign's data made of?_ It divides Campaign state into the Timeline of World states with its Timeline pointer, the History, the Campaign configuration, and the Turn report, says what the Game rules read of it, and says how Campaign initialization produces the first Campaign state. It builds on Core Concepts, which names Campaign state and leaves its components to Campaign State. It stays generic: the rules would hold for any game built on this engine.

## Campaign Instances

[Campaign Instances](campaign-instances.md) answers _how is one thing in a Campaign's world modeled?_ Every such thing is a Campaign instance with the same four properties, created with a fresh Instance ID, referenced only through valid references, and able to adopt Role Types. It builds on Core Concepts, which names the Campaign instance, and on Campaign State, which places every Campaign instance in World state.

## History and Turn Report

[History and Turn Report](world-history.md) answers _what must a Campaign remember?_ It keeps the historical facts that the Game rules and queries need, the Turn series that charts use, and the Turn report and History entries, and what Player API returns of them. It details Campaign State's History and Turn report components.

## Game Data Records

[Game Data Records](game-data-records.md) answers _what can a Game Data Record (GDR) be used for?_ It owns the six purposes a GDR can serve and a worked example of each.

## Campaign Lifecycle

[Campaign Lifecycle](campaign-lifecycle.md) answers _how does a Session get, change, and lose its Current campaign?_ It owns when a Session starts and ends, creating, loading, selecting, and closing the Current campaign, what `session.getStatus()` reports, and which Session API operations need no Current campaign.

## Developer Access

[Developer Access](developer-access.md) answers _how can the Session controller inspect and change a Campaign beyond ordinary play?_ It owns Dev mode, full Campaign state inspection, Player cheat actions, and random outcome overrides.

## Determinism and Randomness

[Determinism and Randomness](determinism-and-randomness.md) answers _what makes a Campaign reproducible?_ It owns the determinism guarantee, the Campaign seed, the rules every random outcome obeys, and how unique identifiers behave under replay. Each Mechanics specification still owns the distributions of its own random outcomes.

## Saves

[Saves](saves.md) answers _what do saving and loading do, and what does the engine save by itself?_ It owns what a Campaign save holds, saving, loading, the Autosaves the engine writes, the Save size limit, and which Campaign saves a Game build loads.

## Timeline

[Timeline](timeline.md) answers _how does the player go back and forward, within a Turn and across Turns?_ It owns the structure of the Timeline, undo and redo of the Player actions of the current Turn by moving the Timeline pointer, undo and redo across Turns by Autosave navigation, and what returning to a World state guarantees.

## Configuration

[Configuration](configuration.md) answers _where does each setting live, and which value applies?_ It owns the kinds of setting, Global configuration, the Campaign configuration presets a Game build supplies, the configuration cascade, and changing Campaign configuration during play.

## Autopilot

[Autopilot](autopilot.md) answers _how does an AI play on the player's behalf?_ It owns Autopilot limits, what an Autopilot AI receives, and how an Autopilot engagement ends.

## Numbers

[Numbers](numbers.md) answers _how do the game's numbers behave?_ It owns that every stored quantity is held as a whole number, of units or of hundredths, the two rounding operations, how percentages and probabilities are computed, and exact evaluation. It owns nothing about randomness: Determinism and Randomness owns [Determinism](determinism-and-randomness.md#determinism) and the [Campaign seed](determinism-and-randomness.md#campaign-seed), and each Mechanics specification owns the distributions of its own random outcomes.

# How they relate

Core Concepts sits underneath everything, and Engine Contract, which states the guarantees shared by every subsystem, comes next. Campaign State and Player API build directly on those two. Determinism and Randomness and Game Data Records build on Campaign State; Campaign Instances, Numbers, and Saves build on Determinism and Randomness; Timeline and Campaign Lifecycle build on Saves; History and Turn Report, Autopilot, and Developer Access build on Timeline; and Configuration, which uses History and Turn Report for the Turn series of a Campaign configuration value, is the top layer. No Foundation specification references a Mechanics specification; the [Mechanics family](../mechanics/about-mechanics.md) builds on this one, with Domain Model as its base.

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
- **Engine Contract versus the engine subsystem specifications:** Engine Contract holds only what is true across all engine subsystems, and each engine subsystem has exactly one owning specification, which owns no other. E.g., the rule for which World state `undoAction()` makes current is stated once, in Timeline.
- **Saves versus Timeline:** Saves holds what most games have: saving, loading, and the Autosaves the engine writes. It needs nothing from Timeline. Timeline holds all undo and redo and builds on Saves. Undo and redo within a Turn work without any Campaign save; undo and redo across Turns load Autosaves, so Timeline uses Saves rather than the reverse.
- **Numbers:** several Mechanics documents depend on the same arithmetic, e.g. the same rounding operations, so it does not belong inside a single mechanic.
- **Determinism and Randomness versus Engine Contract:** determinism, the Campaign seed, random outcomes, and unique identifiers share one test, whether replay must reproduce a result, and change together, so one document holds them in detail. Each Mechanics document owns the distributions of its own random outcomes, and how a random rule is written is owned by Specification Conventions.

# Reading order

1. [Core Concepts](core-concepts.md) for the vocabulary.
2. [Engine Contract](engine-contract.md) for what the engine promises and the data it owns, then [Player API](player-api.md) for what the player sees and does.
3. [Campaign State](campaign-state.md), [Campaign Instances](campaign-instances.md), [History and Turn Report](world-history.md), and [Game Data Records](game-data-records.md) for how campaign data is shaped.
4. [Campaign Lifecycle](campaign-lifecycle.md), [Saves](saves.md), [Timeline](timeline.md), [Configuration](configuration.md), [Autopilot](autopilot.md), [Developer Access](developer-access.md), and [Determinism and Randomness](determinism-and-randomness.md) for the engine subsystems.
5. [Numbers](numbers.md) as needed.
6. The [Mechanics family](../mechanics/about-mechanics.md) for the game itself.
