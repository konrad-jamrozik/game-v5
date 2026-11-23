# Development Loop

| Metadata | Value |
| --- | --- |
| Spec ID | LOOP |
| Family | Process |
| Audience | Game designer, Implementer |
| Owns | How the game is developed in a loop between specifications and Implementations, and the LLM skills that run it. |
| Conventions | [Specification Conventions](../conventions/spec-conventions.md) |

# Overview

The [Game designer](../conventions/spec-conventions.md#participants) delegates as much of the game's development to LLMs as possible, but no more: LLMs write the specifications and the code, while the Game designer keeps every creative and design decision. That is how the game can be developed fast and still be tightly designed and fun to play, rather than generic.

The split rests on one rule: every design decision lives in the specifications, and the [Implementation](../conventions/spec-conventions.md#artifacts) follows them. A change to a decision therefore enters as a change to the specifications and reaches the code through an Implementation update, while what the specifications do not state is decided by the code. Playing the Implementation shows the Game designer what to change next, which becomes Designer feedback, and the loop repeats.

# Glossary

| Term | Definition |
| --- | --- |
| Development loop | The repeating cycle in which the [Game designer](../conventions/spec-conventions.md#participants) says what should change, the [specifications](../conventions/spec-conventions.md#specifications) and the [Implementation](../conventions/spec-conventions.md#artifacts) are changed to match, and playing the result shows what to change next. |
| Designer feedback | What the [Game designer](../conventions/spec-conventions.md#participants) finds wrong, or wants changed, after playing or reviewing an Implementation. |
| LLM skill | A packaged set of instructions that an LLM agent loads to carry out one recurring task of the Development loop. |

# Sources of truth

Each question about the game has one source of truth, and no other artifact answers it. There is one Implementation, it is never rebuilt from the specifications, and so the specifications do not have to describe everything it does: they hold the decisions, and the code holds the rest.

| Question | Source of truth |
| --- | --- |
| What is the game meant to be, and how is it meant to work? | The specifications: design decisions, terms, concepts, and diagrams, each stated once |
| What is a value, e.g. a cost or a rate? | The game data under `content/`; a specification says what a property means and never repeats its value |
| What happens where the specifications say nothing? | The code and tests of the Implementation |
| How does a screen look? | The Implementation; a [Screenshot](../../design/ui/visual-design.md#glossary) generated from it shows the screen in its specification |
| What does a generated view say, e.g. the derived glossary or the Compendium preview? | Whatever it is generated from; a file under `docs/derived/` is never edited and never cited |
| What was the intent behind the design? | The [game design brief](../../../game-design-brief.md), which decides no rule |

When two artifacts disagree, the source of truth for the question stands and the other one changes:

| Disagreement                                                 | What changes                                        |
| ------------------------------------------------------------ | --------------------------------------------------- |
| A specification states something and the code does otherwise | The code                                            |
| A specification repeats a value and `content/` holds another | The specification, which loses the copy             |
| A Screenshot and the Implementation show different things    | The Screenshot, which is generated again            |
| The specifications are silent                                | Nothing: the code decides, and it may change freely |

The answer to a question the specifications are silent on is added to them only when it is a decision, i.e. when the Game designer would object to the code doing it differently, e.g. a rule the Player plans around. It is then stated once, in the specification that owns its subject.

These artifacts take part in the Development loop:

| Artifact | What it holds | Who changes it |
| --- | --- | --- |
| Governance specifications | How every specification is written, under [Specification Conventions](../conventions/spec-conventions.md), and how the Development loop runs | An LLM at the Game designer's request, or the Game designer |
| [Design specifications](../conventions/spec-conventions.md#specifications) | The game: its concepts, rules, content, user interfaces, and [Autopilot AIs](../../design/foundation/engine-contract.md#principals-and-access) | An LLM at the Game designer's request, or the Game designer |
| Implementation specifications | How the one Implementation is placed, tested, licensed, and published | An LLM at the Game designer's request, or the Game designer |
| Implementation | Code and tests that follow the specifications and decide what they do not state, together with its copies of the game data and assets | An LLM at the Game designer's request |

The Implementation specifications divide into Families by how binding they are, as described in [About Implementation specifications](../../implementation/about-implementation.md#families).

The specifications live in one repository and the Implementation in its own directory outside it. A change to a decision is made to the specifications first, and the Implementation follows. A change to what the specifications do not state is made in the code alone.

# Rounds of the Development loop

Development proceeds in rounds, each starting from something the Game designer wants and ending with the game changed. A round takes these steps, in this order:

1. **Say what should change:** the Game designer names a new feature, a design change, or Designer feedback on the game as played.
2. **Change the specifications**, when a decision changes or a new one is made; a change that touches no decision skips this step.
3. **Change the Implementation:** its code and tests follow the changed decisions, and its commit names the commit of the [Spec repo](../../implementation/mandatory/implementation-placement.md#glossary) that it now follows.
4. **Play and review:** the Game designer plays the Implementation, which forms the next Designer feedback.

![The Development loop: the Game designer says what should change; the apply skill changes the specifications when a design decision changes, and then the code and tests of the Implementation; the Game designer plays the Implementation, which forms the next Designer feedback](../../../images/diagrams/development-loop.svg)

A gap that an [Implementer](../conventions/spec-conventions.md#participants) meets in the specifications while changing the code is closed in the code. It becomes a specification change only when the Game designer names it a decision, so the specifications grow by decisions and never by gaps.

## Designer feedback

Designer feedback is the Game designer's judgement of the game as played, and it enters the Development loop like every other change: through the specifications. What the Game designer's observation changes depends on what the specifications already say about it:

- **The specifications say otherwise:** the Implementation does not conform. The specifications stay as they are and the Implementation is brought back into conformance with them. When ambiguous wording invited the mistake, the wording is also clarified.
- **The specifications say what the Implementation does:** the Implementation is right and the design is not what the Game designer wants. The Game designer changes the specifications, and an update follows.
- **The specifications are silent,** so the code decided: the Game designer either makes it a decision, which is written into the specifications and an update follows, or has the code changed and leaves the specifications silent.

One observation usually involves several Families of the Design specifications at once, e.g. a missing [Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) involves the rule that creates it, the [GDR](../../design/foundation/core-concepts.md#game-build-and-content) that supplies it, and the screen that shows it. The case is therefore decided for each [Family](../conventions/spec-conventions.md#specifications) involved, and a specification change goes to the Family that falls short, not to the first one found. The Implementation is a conformance defect only when every Family involved already specifies what the Game designer expects, e.g. the rule and its GDR are both present and the Implementation still leaves the feature out. Otherwise this table decides what changes:

| Where the specifications fall short | What changes |
| --- | --- |
| The feature is not specified, so no [GDR](../../design/foundation/core-concepts.md#game-build-and-content) can supply it | Foundation or Mechanics first, then Content for the GDRs the new rule reads |
| The feature is specified, but its GDR is missing or has the wrong values | Content only |
| What a user interface shows, how it arranges it, or how it looks, while the engine API already allows it | UI, including its visual design |
| How an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) chooses its [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns) | Autopilot AIs |

Whether a value is [Player](../conventions/spec-conventions.md#participants)-visible at all is a rule of Foundation or Mechanics, not of UI: a user interface presents the [Player-visible information](../../design/foundation/engine-contract.md#api-surfaces) and cannot reveal what the rules hide, though it can choose how prominently to show it.

# LLM skills and workflows

Several tasks of the Development loop recur, and each needs the same few specifications and the same order of steps. An LLM skill captures one such task, so that an LLM agent does not have to rediscover what matters for it each time. LLM skills are kept in `.claude/skills/` of the Spec repo, beside the specifications they serve. An LLM skill states no rule of its own: it points to the specifications that own the rules, and the specifications win when the two disagree.

| LLM skill | Task |
| --- | --- |
| `apply` | Carries one change through a round: sorts it under [Designer feedback](#designer-feedback), changes the specifications when a decision changes, changes the Implementation, and publishes both. |
| `spec-review` | Checks specifications against Specification Conventions and against each other. |
| `add-music` | Adds new music tracks from the Game designer's description and refreshes the Implementation's copies with them. |

A change to the game is one run of `apply`. A change to the specifications alone, e.g. a rewording that changes no decision, is checked with `spec-review` and needs no change to the Implementation; the next run of `apply` reads the commits the Implementation has not followed yet and carries over whatever they decided.

# Appendix: Rationale

This appendix is informative. It records why the Development loop is shaped as it is.

## How much to delegate

The Game designer faces one guiding question: how much of the work to hand to an LLM. Delegating nothing means doing everything by hand, which is too slow and wastes what LLMs do well. Delegating everything beyond a short prompt means the Game designer's whole contribution is that prompt: the game is whatever the LLM produces, which offers no unique value and is no fun to make for long.

The answer lies between: delegate as much as possible, but keep the key creative and design control. The goal is a game developed fast that is still tightly designed and a great experience, e.g. fun, challenging, and free of boilerplate. The Development loop puts the line between the two in one place: every design decision is written in the specifications, where the Game designer decides it, and everything that only carries a decision out is delegated.

## Why each part exists

**Why does the Implementation live outside the Spec repo?** To make the line between the decisions and the code that carries them out physical. No design decision may have its only record in an [Implementation repo](../../implementation/mandatory/implementation-placement.md#glossary): when the code holds a decision that no specification states, nobody can tell it from an accident of the code.

**Why do the specifications not describe everything the Implementation does?** Because they once did, and it cost more than it gave. Specifications complete enough to rebuild the Implementation from nothing grew larger than the code, every change had to be made twice, and the many restatements began to contradict the rules they restated. With one Implementation that is never rebuilt, a specification that holds the decisions once is enough, and a decision stated once cannot disagree with itself.

**Why are there Specification Conventions?** Because the Game designer delegates writing the specifications too, and an LLM must be taught to write them well. The same conventions serve the readers: a predictable layout, one term for each concept, and explicit marks for what is left open make the specifications unambiguous to the LLMs that implement them, and let a command check part of them mechanically.

**Why are there Implementation specifications?** Because the Design specifications are abstract on purpose and describe only the game, while an Implementation is built in a concrete environment, e.g. a directory on the Game designer's machine with a particular toolchain. These specifications bridge the two, and their Mandatory part states what the Implementation must always keep, e.g. where it lives and what its tests may do.

**Why are there LLM skills?** Because the specifications are many and layered, while the recurring tasks are few and each needs only a known part of them. An LLM skill saves each run from rediscovering which part that is, which keeps the runs consistent and spends fewer tokens.
