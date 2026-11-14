# About the Foundation family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Foundation specifications hold the cross-cutting contracts that every other part of the game builds on: shared
vocabulary, engine guarantees, campaign-data structure, the engine subsystems, and the numeric machinery. Mechanics, Content, and Implementation documents all depend on them; none of
them is about a single game system.

The family reads from abstract to concrete: words, then engine promises, then data rules, then one document per engine
subsystem. The game's own concepts and rules are in the Mechanics family, which builds on this one.

# Documents

## Core Concepts

[Core Concepts](core-concepts.md) answers _what do the shared words mean?_ It owns the vocabulary used across the whole
game contract, e.g. Campaign, Session, and Game build. It defines meanings only, not behavior, data layout, or
mechanics: Engine Contract owns what a Session holds and what is persisted, and Campaign State owns how
Campaign state divides into components. Nearly every other specification uses it, so each term has a single
definition.

## Engine Contract

[Engine Contract](engine-contract.md) answers _what does the engine guarantee, whatever subsystem is involved?_ It owns
the API hierarchy, the data the engine owns and what is persisted, player queries and actions, the information
boundary, and Committed state integrity. It owns no engine subsystem: it names the one owner of each, without stating
that subsystem's behavior.

## Campaign State

[Campaign State](campaign-state.md) answers _how must campaign data be structured?_ It owns
Campaign state composition, with its World state, Current world state, World history, and Campaign configuration terms,
Campaign instance structure, creation and identity, references, value classification, and historical fact preservation.
It refines Engine Contract's Committed state integrity requirement into concrete data rules. It stays generic: the rules
would hold for any game built on this engine.

## Game Data Records

[Game Data Records](game-data-records.md) answers _what can a Game Data Record (GDR) be used for?_ It owns the six
purposes a GDR can serve and a worked example of each.

## Campaign Lifecycle

[Campaign Lifecycle](campaign-lifecycle.md) answers _how does a Session get, change, and lose its Current campaign?_ It
owns when a Session starts and ends, creating, loading, selecting, and closing the Current campaign, what
`session.getStatus()` reports, and which Session API operations need no Current campaign.

## Developer Access

[Developer Access](developer-access.md) answers _how can the Session controller inspect and change a Campaign beyond
ordinary play?_ It owns Dev mode, full Campaign state inspection, cheat operations, and random outcome overrides.

## Determinism and Randomness

[Determinism and Randomness](determinism-and-randomness.md) answers _what makes a Campaign reproducible?_ It owns the
determinism guarantee, the Campaign seed, the rules every random outcome obeys, and how unique identifiers behave under
replay. Each Mechanics specification still owns the distributions of its own random outcomes.

## Saves

[Saves](saves.md) answers _what do saving and loading do, and what does the engine save by itself?_ It owns what a
Campaign save holds, saving, saving as new, loading, the Autosaves the engine writes, the Save size limit, and which
Campaign saves a Game build loads.

## Timeline

[Timeline](timeline.md) answers _how does the player go back and forward, within a turn and across turns?_ It owns
undo and redo of the Player actions of the current Turn, undo and redo across Turns by Autosave navigation, and
what a restored Committed state guarantees.

## Configuration

[Configuration](configuration.md) answers _where does each setting live, and which value applies?_ It owns the kinds
of setting, Global configuration, the Campaign configuration presets a Game build supplies, and the configuration
cascade.

## Autopilot

[Autopilot](autopilot.md) answers _how does an AI play on the player's behalf?_ It owns Autopilot limits, what an
Autopilot AI receives, how an Autopilot engagement ends, and Autopilot memory.

## Numbers

[Numbers](numbers.md) answers _how do the game's numbers behave?_ It owns that every stored quantity is a whole
number, the two rounding operations, how percentages and probabilities are computed, and exact evaluation. It owns nothing about randomness: Determinism and Randomness owns
[Determinism](determinism-and-randomness.md#determinism) and the [Campaign seed](determinism-and-randomness.md#campaign-seed), and each
Mechanics specification owns the distributions of its own random outcomes.

# How they relate

Core Concepts sits underneath everything. Engine Contract states the guarantees shared by every subsystem. Campaign
State refines those guarantees and Determinism and Randomness. Numbers stands alone and is used by Mechanics. Campaign
Lifecycle, Saves, Timeline, Configuration, Autopilot, Developer Access, Determinism and Randomness, and Numbers each
own one engine subsystem outright, and all but Numbers use Engine Contract; Timeline also uses Saves. Game Data
Records builds on Campaign State. No Foundation specification depends on a Mechanics specification; the
[Mechanics family](../mechanics/about-mechanics.md) builds on this one, with Domain Model as its base and Turn
Advancement, the owner of the Turn advancement engine subsystem, as its tip.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

![Foundation family: relationships within the family](../../images/foundation-family-within.svg)

## Across families

![Foundation family: relationships with other families](../../images/foundation-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Core Concepts versus the rest:** vocabulary is shared by every family, so it cannot live inside any one of its
  users.
- **Foundation versus Mechanics:** Foundation holds what would hold for any game on this engine; Mechanics holds
  this game. E.g., Factions can be redesigned without touching Campaign State, and reference integrity can be
  tightened without touching Domain Model.
- **Engine Contract versus Campaign State:** engine behavior (e.g. sessions and access) and
  data shape (e.g. identity and references) change for different reasons. Keeping data rules in their own refinement lets
  Engine Contract stay about guarantees.
- **Campaign State versus Game Data Records:** the first holds the rules for data that changes during a Campaign; the
  second holds the uses of data that never changes during one.
- **Engine Contract versus the engine subsystem specifications:** Engine Contract holds only what is true across all
  engine subsystems, and each engine subsystem has exactly one owning specification, which owns no other. E.g., the rule for which Committed state `undoAction()`
  restores is stated once, in Timeline.
- **Saves versus Timeline:** Saves holds what most games have: saving, loading, and the Autosaves the engine writes.
  It needs nothing from Timeline. Timeline holds all undo and redo and builds on Saves. Undo and redo within a Turn
  work without any Campaign save; undo and redo across Turns load Autosaves, so Timeline uses Saves rather than the
  reverse.
- **Numbers:** several Mechanics documents depend on the same arithmetic, e.g. the same rounding operations, so it
  does not belong inside a single mechanic.
- **Determinism and Randomness versus Engine Contract:** determinism, the Campaign seed, random outcomes, and unique
  identifiers share one test, whether replay must reproduce a result, and change together, so one document holds them
  in detail. Each Mechanics document owns the distributions of its own random outcomes, and how a random rule is
  written is owned by Specification Conventions.

# Reading order

1. [Core Concepts](core-concepts.md) for the vocabulary.
2. [Engine Contract](engine-contract.md) for what the engine promises and the data it owns.
3. [Campaign State](campaign-state.md) and [Game Data Records](game-data-records.md) for how campaign data is shaped.
4. [Campaign Lifecycle](campaign-lifecycle.md), [Saves](saves.md), [Timeline](timeline.md), [Configuration](configuration.md), [Autopilot](autopilot.md), [Developer Access](developer-access.md), and
   [Determinism and Randomness](determinism-and-randomness.md) for the engine subsystems.
5. [Numbers](numbers.md) as needed.
6. The [Mechanics family](../mechanics/about-mechanics.md) for the game itself.
