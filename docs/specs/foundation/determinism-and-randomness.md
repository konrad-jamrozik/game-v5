# Determinism and Randomness

| Metadata    | Value                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | DETERM                                                                                                             |
| Family      | Foundation                                                                                                         |
| Status      | Draft                                                                                                              |
| Audience    | Engine designer, AI designer, Implementer                                                                          |
| Owns        | The determinism guarantee, the Campaign seed, rules for every random outcome, and unique identifiers under replay. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                     |

# Overview

This document defines what makes a Campaign reproducible: the determinism guarantee, the Campaign seed from which every
random outcome derives, the rules every random outcome obeys, and how unique identifiers behave under replay. These
subjects share one test, whether replaying the same Player actions must reproduce the same result, so they are stated
together.

It does not own, e.g., the distribution of any one random outcome, which the Mechanics specification stating that
outcome owns, or how a random rule is written, which
[Formulas and uncertainty](../governance/spec-conventions.md#formulas-and-uncertainty) in Specification Conventions
owns. [Numbers](numbers.md) owns rounding and precision.

# Relationships

- Uses [Campaign Lifecycle](./campaign-lifecycle.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Used by [Autopilot](./autopilot.md)
- Used by [Configuration](./configuration.md)
- Used by [Developer Access](./developer-access.md)
- Used by [Saves](./saves.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Timeline](./timeline.md)
- Refined by [Campaign State](./campaign-state.md)

# Glossary

Campaign, Campaign state, Game build, GDR, Session, and Derived value are defined by the
[Core Concepts glossary](core-concepts.md#glossary). Player action, Committed state, Campaign save, Session controller, and Player-visible information are defined by the
[Engine Contract glossary](engine-contract.md#glossary).

| Term                       | Definition                                                                                                                                                                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign seed              | The value from which every random outcome of one Campaign derives. It is set when the Campaign is created, supplied by the Session controller or otherwise chosen by the engine, and never changes. It is Campaign state and is not Player-visible information. |
| Campaign-scoped identifier | A unique identifier that replaying the same Player actions from the same Campaign state must reproduce exactly.                                                                                                                                                 |
| Independent identifier     | A unique identifier that deterministic replay of a Campaign need not reproduce, e.g. one identifying a stored record or a runtime operation.                                                                                                                    |

# Determinism

Given the same Game build, the same initial Campaign configuration, the same Campaign seed, and the same ordered
Player actions, exactly the same things must happen: Campaign state and retained reports are equal after every
Player action. This holds whenever, in whichever Session, and on whichever machine each Campaign is created and
played; e.g., a Campaign save made on one machine and loaded on another continues exactly as it would have on the
first, given the same Player actions. The Game build includes its GDRs, and the Player actions are those of the
Session controller and of the Autopilot AI alike. The Campaign seed is what makes a Campaign reproducible, and so makes
undo, redo, load, and debugging possible.

The guarantee has two parts:

- **Creation:** The same Game build, initial Campaign configuration, and Campaign seed must produce equal initial
  Campaign state.
- **Play:** For equal Campaign state, the same Game build, and the same ordered Player actions, execution must
  produce equal resulting Campaign state and retained reports.

When two Campaign states are equal is stated under
[Derived value consistency](engine-contract.md#derived-value-consistency) in Engine Contract.

Gameplay consults nothing outside Campaign state, e.g. wall-clock time or Autopilot memory, so Campaign state holds
every input consulted by game behavior, including the Campaign seed and relevant retained data about past Campaign
state or events.

Queries, computing Derived values, and checking action preconditions change neither Campaign state nor any later
outcome. Consequently, outcomes after undo, redo, or load equal those of uninterrupted play, and a query, a rejected
action, or an action with no effect never changes a later outcome.

## Scope of the guarantee

Determinism is required within one implementation and Game build, not across different implementations of the
specification or different Game builds. Within one implementation and Game build it is required across machines:
no outcome may depend on the machine, operating system, or runtime that executes the Game build.

Consequently, the following are the implementer's choice, provided the guarantee under [Determinism](#determinism)
holds: how random outcomes are derived from the Campaign seed, the order of random draws, the order in which Campaign
instances are created within one Player action, and the sequence and format of generated Campaign-scoped identifiers.
Two implementations may therefore produce different outcomes from the same Campaign seed and Player actions; each must
reproduce its own outcomes exactly.

# Campaign seed

Every Campaign has exactly one Campaign seed. The following rules are complete:

- **Supplied:** The Session controller may supply the Campaign seed in `session.campaign.create(options)`. A
  supplied value that is not a permitted Campaign seed fails creation, under
  [Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle.
- **Permitted values:** A permitted Campaign seed is text of 1 to 64 characters, each a printable ASCII character,
  i.e. one with a code from 32, the space, to 126, the tilde, inclusive. Two Campaign seeds are the same exactly
  when their texts are equal character for character; e.g., `abc` and `ABC` are different Campaign seeds, and so
  are `run 3` and `run  3`. A supplied value that is empty, longer than 64 characters, or contains any other
  character, e.g. `é` or a tab, is not a permitted Campaign seed.
- **Chosen:** When none is supplied, the engine chooses a permitted Campaign seed of exactly 10 characters. Which one it chooses is
  unspecified and need not be reproducible; it is the only engine decision exempt from the guarantee under
  [Determinism](#determinism).
- **Fixed:** The Campaign seed never changes after creation. No action, Timeline navigation, save, or load changes it.
- **Kept:** The Campaign seed is Campaign state; [Campaign state composition](campaign-state.md#campaign-state-composition)
  in Campaign State places it in Current world state. It is not Campaign configuration, because no Campaign
  configuration preset supplies it, and it is not part of the new-Campaign setup. Every Campaign save therefore holds
  it.
- **Readable:** `session.getStatus()` reports the Campaign seed of the Current campaign to the Session controller,
  in every Dev mode setting and whether it was supplied or chosen, in a form `create(options)` accepts; e.g., the
  Session controller can share it or create another Campaign with it.
- **Not Player-visible:** The Campaign seed is not Player-visible information, because together with the Game build
  it determines facts hidden from the player. Player API never exposes it, so an Autopilot AI never receives it.

# Random outcomes

Every random outcome of a Campaign obeys the following rules, and this list is complete:

- **Sole source of randomness:** Every random outcome of a Campaign derives from its Campaign seed. No outcome
  depends on anything outside Campaign state; e.g., not on wall-clock time, on when, in which Session, or on which
  machine the Campaign is created, loaded, or played, on a second seed, or on a random source that differs from one
  run to another. This is observable: any such dependence makes two Campaigns that the guarantee under
  [Determinism](#determinism) requires to be equal differ.
- **Stated distributions:** Among Campaigns that differ only in their Campaign seed, every random outcome takes
  each of its possible values as often as the distribution in its rule states. E.g., an outcome whose rule states a
  60% probability occurs in 60% of such Campaigns, not in all of them or in none.
- **Independent outcomes:** Random outcomes are independent of one another unless a rule states otherwise: the
  value of one says nothing about the value of any other. E.g., two attacks that each hit with probability 60% both
  hit with probability 36%; an implementation in which they always hit or miss together does not conform. A rule
  states a dependence explicitly, e.g. that a damage outcome exists only when the attack hits.
- **Different Player actions, different outcomes:** Only the same ordered Player actions guarantee the same
  outcomes, under [Determinism](#determinism). After a different Player action, any later random outcome may differ,
  even one whose rule does not involve what that Player action changed. E.g., an attack misses; the Session controller
  loads the earlier Campaign save, hires an Agent, and commits the same attack, which may now hit. Whether it does is
  the implementer's choice.

# Unique identifiers

Every specification that introduces a unique identifier must classify it as a Campaign-scoped identifier or an
Independent identifier. The test is whether replaying the same Player actions from the same Campaign state,
including through undo and redo, must reproduce the same identifier.

| Kind                       | Replay reproduces it | Examples                                                       |
| -------------------------- | -------------------- | -------------------------------------------------------------- |
| Campaign-scoped identifier | Yes                  | E.g., [Instance IDs](campaign-state.md#glossary).              |
| Independent identifier     | No                   | E.g., [Campaign IDs and Campaign save IDs](saves.md#glossary). |

A Campaign-scoped identifier therefore depends on nothing outside Campaign state, e.g. wall-clock time, in the same way
as a random outcome under [Random outcomes](#random-outcomes). The format of every identifier is the implementer's
choice.

# Acceptance examples

- **Equal outcomes:** Starting at Campaign state S, add money through Developer API, commit ordinary gameplay actions,
  and Advance turn. Repeat the same Player actions from S with queries and a rejected action interleaved. Complete
  Campaign state and retained reports equal the original results ([Determinism](#determinism)).
- **Same seed, same Campaign:** Create Campaign A supplying Campaign seed K, commit gameplay actions including
  Advance turn, and record Campaign state and retained reports after each Player action. End the Session. In a new
  Session, create Campaign B with the same new-Campaign setup and K, and commit the same Player actions. B equals A at
  every Player action ([Determinism](#determinism), [Campaign seed](#campaign-seed)).
- **Same save, another machine:** Save Campaign A on one machine, then commit gameplay actions including Advance
  turn and record Campaign state and retained reports after each Player action. On another machine running the same
  Game build, load that Campaign save and commit the same Player actions. The results equal those recorded on the first
  machine after every Player action ([Scope of the guarantee](#scope-of-the-guarantee)).
- **Seed chosen by the engine:** Create Campaign C supplying no Campaign seed. `session.getStatus()` reports its
  Campaign seed K2, which is 10 printable ASCII characters long. Create Campaign D with the same new-Campaign setup supplying K2, and commit the same Player actions
  in both. D equals C after every Player action ([Campaign seed](#campaign-seed)).
- **Seed fixed and hidden:** After Player actions, undo, redo, save, and load, `session.getStatus()` reports the
  same Campaign seed. No Player API query returns it, with Dev mode enabled or disabled
  ([Campaign seed](#campaign-seed)).
- **Identifiers under replay:** Hire an Agent, undo, and redo. The redone Agent has the same Instance ID as before the
  undo. Save the Campaign twice with `saveAsNew()`; the two Campaign saves have different Campaign save IDs
  ([Unique identifiers](#unique-identifiers)).
- **Seed length limits:** Creating a Campaign with a 64-character seed of printable ASCII characters succeeds;
  creating one with a 65-character seed, an empty seed, or a seed containing `é` fails and leaves the Session as it
  was ([Campaign seed](#campaign-seed)).
