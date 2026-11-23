# Core Concepts

| Metadata | Value |
| --- | --- |
| Spec ID | CORE |
| Family | Foundation |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns | Shared vocabulary for modeling and engine execution, e.g. Campaign, Session, and Game build. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Every specification of the game must mean the same thing by the same word, whichever subject it covers. Core Concepts holds the words that every family relies on, and gives each one a meaning independent of the contracts that use it, e.g. [Engine Contract](./engine-contract.md) and the [Mechanics family](../mechanics/about-mechanics.md).

The words fall into groups by what they describe: how data is modeled independently of a programming language, e.g. Type and Property; what the Game build supplies, i.e. Game Data Records (GDRs) and the Game rules; and what one playthrough is, i.e. a Campaign and its Campaign state, as opposed to the Session that runs it. One classification runs across all of them: every value is either an Authoritative value, kept as a fact, or a Derived value, calculated from other values.

# Glossary

## Data modeling

Language-independent vocabulary for describing model data.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Type | A named description of the structure and permitted values of data. A Type may be composed of other Types through properties, collections, unions, or references. Similar to a type declaration in a programming language. | Schema; programming-language type; Definition, as a modeling category. API and serialization schemas, actual programming-language declarations, explanatory language analogies, and the definition of a term remain valid. |
| Property | A named component of a structured Type, with an associated Type. Similar to a property of an object type in a programming language. | Field; member; key. Unrelated uses, e.g. a lookup key, remain valid. |

## Campaign instances

The occurrences within a Campaign that make up most of its Campaign state. [Campaign Instances](campaign-instances.md) states their structure, creation, identity, and references.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Campaign instance | A particular occurrence within a Campaign of a declared Type, with an identifier, an Archetype reference, Constants, and State. | Instance; occurrence; Campaign instance kind, for which say Campaign instance Type. Explaining what an occurrence means in a definition remains valid. |
| Archetype | A GDR referenced by a Campaign instance, supplying shared characteristics and initial values. It is shared immutable data, never instantiated; the Campaign instance’s Archetype reference is set when the Campaign instance is created and never changes. | Template; EnemyType; EnemyKind, for which say EnemyArchetype |
| State | Values owned by this Campaign instance that may change under gameplay rules. State is specific to this Campaign instance and is distinct from Campaign state, which describes the whole playthrough. | MutableState; Instance state that does not separate State from Constants; Changeable reference, for which say Mutable reference |
| Constants | Values owned by this Campaign instance that remain fixed for its lifetime. A reference stored in Constants has a fixed target; it does not require the target’s State to remain fixed. | ImmutableState; Fixed reference, for which say Immutable reference |

## Game build and content

What a version of the game supplies: shared by every Campaign and unchanged during play.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Game build | A particular version of the game's data and of the executable implementation of its Game rules, supplied together. | Build. Ordinary build-tool operations keep their meaning. |
| Game rules | The rules of the game: which actions the player may take, what each action changes, what happens when the player ends a turn, and what each query reports. A Game build implements them, and the specifications state them. | Game behavior; game behaviour. Ordinary uses of "behavior", e.g. the behavior of an interface, remain valid. |
| Game Data Record (GDR) | Concrete game data supplied by a Game build, conforming to a declared Type and immutable during gameplay; a GDR is never instantiated. | Content entry; Content; entry; entries; Content definition; GDR role, for which say GDR purpose. The Content Family, document titles, and the Display content GDR purpose keep their names. |

## Campaign and Session

A playthrough, its data, and the runtime context that selects it. [Campaign State](campaign-state.md) states how Campaign state divides into components.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Campaign | A particular playthrough with its own evolving Campaign state. |  |
| Campaign state | All data describing one Campaign: its world as it stood at the start of the current turn and after each action since, what its earlier turns left behind, and its settings. | Evolving campaign facts; Continuation state; continuation data; Controller continuation data |
| Session | The runtime context of one running game, holding the selection of at most one Campaign and runtime-only access and execution state. |  |
| Current campaign | The Campaign selected in the Session by the most recent successful campaign creation or load, until replacement or closure. |  |

## Value classification

Classifications of a value, whether a GDR or Campaign state supplies it.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Authoritative value | A value that a GDR supplies, or a value of Campaign state that specifications define by its initial value and the changes the Game rules make to it, rather than by a formula over other values. | Authoritative fact |
| Derived value | A value that specifications define by a formula over the Authoritative values of one Campaign state and of GDRs. It always equals that formula applied to the Campaign state as it is at that moment. | Computed value; calculated value |

# Campaign versus Session

A Campaign and a Session differ in kind: a Session is not part of any Campaign, and selecting a Campaign does not make it part of the Session. [Campaign Lifecycle](./campaign-lifecycle.md) owns when a Session starts and ends and how it selects a Campaign, and [Data ownership](./engine-contract.md#data-ownership) in Engine Contract owns what a Session holds and what is persisted.

# Authoritative and Derived values

A Derived value's formula reads only the current Campaign state and GDRs, never an earlier Campaign state. Replaying a Campaign would reproduce every value, but that does not make a value Derived. The classification has the following consequences:

- **A Derived value follows its inputs:** when an Authoritative value its formula uses changes, the Derived value changes too, without any rule saying so.
- **An Authoritative value changes only when the Game rules change it:** the Game rules change only the Authoritative values its specification says it changes. E.g., an unlock recorded as earned stays earned after its condition stops holding.
- **Campaign state consists of Authoritative values:** two Campaign states are equal exactly when their Authoritative values are equal.

Which values are Authoritative is the Engine designer's choice, because the player can see the difference.

E.g., current health always equals base health minus damage taken, and a level-up raises base health by 5. If [base health](../mechanics/agents-spec.md#combatant-attributes) and [damage taken](../mechanics/combat.md#combat-rounds-and-results) are Authoritative, [current health](../mechanics/agents-spec.md#combatant-attributes) rises by 5. If base health and current health are Authoritative, damage taken rises by 5 instead.

The way a specification defines a value fixes its classification, so no separate label is needed. The classification is independent of mutability, of player visibility, and of what an implementation stores.

# The GDR abbreviation

Game Data Record has the approved abbreviation GDR. A document introduces it as **Game Data Record (GDR)** or **Game Data Records (GDRs)** at its first relevant mention, and uses **GDR** or **GDRs** afterward. Every other term of the game is written in full, e.g. Campaign instance rather than "instance".
