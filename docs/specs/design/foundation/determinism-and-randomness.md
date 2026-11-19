# Determinism and Randomness

| Metadata | Value |
| --- | --- |
| Spec ID | DETERM |
| Family | Foundation |
| Audience | Engine designer, AI designer, Implementer |
| Owns | The determinism guarantee, the Campaign seed, rules for every random outcome, and unique identifiers under replay. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The guiding principle is that a [Campaign](core-concepts.md#campaign-and-session) can always be replayed: given the same starting point and the same [Player actions](engine-contract.md#player-actions-and-turns), exactly the same things happen, down to every random outcome. This is what makes undo, redo, and loading a [Campaign save](engine-contract.md#persisted-data) trustworthy: going back and making the same choices always leads to the same place.

The game still has chance, e.g. whether an attack hits. Chance stays reproducible because every random outcome derives from one value fixed when the Campaign is created, its Campaign seed, and from nothing outside [Campaign state](core-concepts.md#campaign-and-session), e.g. not the clock. The same test sorts unique identifiers into those replay must reproduce, e.g. an [Instance ID](campaign-instances.md#glossary), and those it need not, e.g. a [Campaign save ID](saves.md#identifiers). The promise holds across machines, but not across different implementations or [Game builds](core-concepts.md#game-build-and-content).

# Glossary

These terms are specific to Determinism and Randomness. General terms are in the [Core Concepts glossary](core-concepts.md#glossary) and the [Engine Contract glossary](engine-contract.md#glossary).

| Term | Definition |
| --- | --- |
| Campaign seed | The value from which every random outcome of one [Campaign](core-concepts.md#campaign-and-session) derives. It is set when the Campaign is created, supplied by the [Session controller](engine-contract.md#principals-and-access) or otherwise chosen by the engine, and never changes. It is [Campaign state](core-concepts.md#campaign-and-session) and is not [Player-visible information](engine-contract.md#api-surfaces). |
| Campaign-scoped identifier | A unique identifier that replaying the same [Player actions](engine-contract.md#player-actions-and-turns) from the same Campaign state must reproduce exactly. |
| Independent identifier | A unique identifier that deterministic replay of a Campaign need not reproduce, e.g. one identifying a stored record or a runtime operation. |

# Determinism

Given the same [Game build](core-concepts.md#game-build-and-content), the same initial [Campaign configuration](campaign-state.md#glossary), the same Campaign seed, and the same ordered Player actions, with the same changes of Campaign configuration between them, exactly the same things must happen: Campaign state is equal after every Player action. This holds whenever, in whichever [Session](core-concepts.md#campaign-and-session), and on whichever machine each Campaign is created and played; e.g., a Campaign save made on one machine and loaded on another continues exactly as it would have on the first, given the same Player actions. The Game build includes its Game Data Records ([GDRs](core-concepts.md#game-build-and-content)), and the Player actions are those of the Session controller and of the [Autopilot AI](engine-contract.md#principals-and-access) alike. The Campaign seed is what makes a Campaign reproducible, and so makes undo, redo, load, and debugging possible.

The guarantee has two parts:

- **Creation:** The same Game build, initial Campaign configuration, and Campaign seed must produce equal initial Campaign state.
- **Play:** For equal Campaign state, the same Game build, and the same ordered Player actions, with the same changes of Campaign configuration between them, execution must produce equal resulting Campaign state.

When two Campaign states are equal is stated under [Derived value consistency](engine-contract.md#derived-value-consistency) in Engine Contract.

The [Game rules](core-concepts.md#game-build-and-content) read nothing outside Campaign state, e.g. no wall-clock time, under [What the Game rules read](campaign-state.md#what-the-game-rules-read) in Campaign State, so Campaign state holds every input of the Game rules, including the Campaign seed and the [History](campaign-state.md#glossary).

Queries, computing [Derived values](core-concepts.md#value-classification), and checking action preconditions change neither Campaign state nor any later outcome, and neither do undo and redo, which move only the [Timeline pointer](engine-contract.md#persisted-data). Consequently, a query, a rejected action, or an action with no effect never changes a later outcome, and outcomes after undo, redo, or load equal those of uninterrupted play while the Campaign configuration is the one uninterrupted play would have had. A change of Campaign configuration is not undone with the Player actions it followed, so it is the one exception: e.g., a Turn played again after undo under a different difficulty may unfold differently. A load takes the Campaign configuration of the [Campaign save](engine-contract.md#persisted-data) it loads, under [Loading](saves.md#loading) in Saves, while undo and redo, including [Autosave navigation](timeline.md#autosave-navigation), keep the current one.

## Scope of the guarantee

Determinism is required within one implementation and Game build, not across different implementations of the specification or different Game builds. Within one implementation and Game build it is required across machines: no outcome may depend on the machine, operating system, or runtime that executes the Game build.

Consequently, the following are the Implementer's choice, provided the guarantee under [Determinism](#determinism) holds: how random outcomes are derived from the Campaign seed, the order of random draws, the order in which [Campaign instances](core-concepts.md#campaign-instances) are created within one Player action, except where the specification owning the creating behavior fixes it, and the sequence and format of generated Campaign-scoped identifiers. Two implementations may therefore produce different outcomes from the same Campaign seed and Player actions; each must reproduce its own outcomes exactly.

# Campaign seed

The Campaign seed is what lets the Session controller recreate a Campaign: creating another Campaign with the same Campaign seed and new-Campaign setup, then making the same Player actions, gives the same Campaign. Every Campaign has exactly one Campaign seed. The following rules are complete:

- **Supplied:** The Session controller may supply the Campaign seed in `session.campaign.create(options)`. A supplied value that is not a permitted Campaign seed fails creation, under [Campaign selection](campaign-lifecycle.md#campaign-selection).
- **Permitted values:** A permitted Campaign seed is text of 1 to 64 characters, each a printable ASCII character, i.e. one with a code from 32, the space, to 126, the tilde, inclusive. Two Campaign seeds are the same exactly when their texts are equal character for character; e.g., `abc` and `ABC` are different Campaign seeds, and so are `run 3` and `run  3`. A supplied value that is empty, longer than 64 characters, or contains any other character, e.g. `é` or a tab, is not a permitted Campaign seed.
- **Chosen:** When none is supplied, the engine chooses a permitted Campaign seed of exactly 10 characters. Which one it chooses is the Implementer's choice and need not be reproducible; it is the only engine decision exempt from the guarantee under [Determinism](#determinism).
- **Fixed:** The Campaign seed never changes after creation. No action, [Timeline](engine-contract.md#persisted-data) navigation, save, or load changes it.
- **Kept:** The Campaign seed is Campaign state; [Campaign state composition](campaign-state.md#campaign-state-composition) in Campaign State places it in the [Live world state](campaign-state.md#glossary) of every [World state](engine-contract.md#player-actions-and-turns). Every [Campaign save](engine-contract.md#persisted-data) therefore holds it.
- **Readable:** `session.getStatus()` reports the Campaign seed of the [Current campaign](core-concepts.md#campaign-and-session) to the Session controller, in every [Dev mode](engine-contract.md#principals-and-access) setting and whether it was supplied or chosen, in a form `create(options)` accepts; e.g., the Session controller can share it or create another Campaign with it.
- **Not Player-visible:** The Campaign seed is not Player-visible information, because together with the Game build it determines facts hidden from the player. [Player API](engine-contract.md#api-surfaces) never exposes it, so an Autopilot AI never receives it.

# Random outcomes

Chance in a Campaign must behave like real chance to the player while staying reproducible for the engine. Every random outcome of a Campaign obeys the following rules, and this list is complete:

- **Sole source of randomness:** Every random outcome of a Campaign derives from its Campaign seed. No outcome depends on anything outside Campaign state; e.g., not on wall-clock time, on when, in which Session, or on which machine the Campaign is created, loaded, or played, on a second seed, or on a random source that differs from one run to another. This is observable: any such dependence makes two Campaigns that the guarantee under [Determinism](#determinism) requires to be equal differ.
- **Stated distributions:** Among Campaigns that differ only in their Campaign seed, every random outcome takes each of its possible values as often as the distribution in its rule states. E.g., an outcome whose rule states a 60% probability occurs in 60% of such Campaigns, not in all of them or in none.
- **Independent outcomes:** Random outcomes are independent of one another unless a rule states otherwise: the value of one says nothing about the value of any other. E.g., two attacks that each hit with probability 60% both hit with probability 36%; an implementation in which they always hit or miss together does not conform. A rule states a dependence explicitly, e.g. that a damage outcome exists only when the attack hits.
- **Different Player actions, different outcomes:** Only the same ordered Player actions guarantee the same outcomes, under [Determinism](#determinism). After a different Player action, any later random outcome may differ, even one whose rule does not involve what that Player action changed. E.g., an attack misses; the Session controller loads the earlier Campaign save, hires an [Agent](../mechanics/domain-model.md#agency-and-agents), and commits the same attack, which may now hit. Whether it does is the Implementer's choice.

# Unique identifiers

Some identifiers name things inside the simulated world and must survive replay; others name things outside it, e.g. stored records, and need not. Every specification that introduces a unique identifier must classify it as a Campaign-scoped identifier or an Independent identifier. The test is whether replaying the same Player actions from the same Campaign state, including through undo and redo, must reproduce the same identifier.

| Kind | Replay reproduces it | Examples |
| --- | --- | --- |
| Campaign-scoped identifier | Yes | E.g., [Instance IDs](campaign-instances.md#glossary). |
| Independent identifier | No | E.g., [Campaign IDs and Campaign save IDs](saves.md#identifiers). |

A Campaign-scoped identifier therefore depends on nothing outside Campaign state, e.g. wall-clock time, in the same way as a random outcome under [Random outcomes](#random-outcomes). The format of every identifier is the Implementer's choice.
