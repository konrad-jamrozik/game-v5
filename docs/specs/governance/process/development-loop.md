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

The split rests on one rule: every design decision lives in the specifications, and the [Implementation](../conventions/spec-conventions.md#artifacts) follows them. A change to a decision therefore enters as a change to the specifications and reaches the code through an Implementation update, while what the specifications do not state is decided by the code. Building and updating an Implementation teaches the [Implementer](../conventions/spec-conventions.md#participants) where the specifications fall short, which becomes Implementer feedback; playing it shows the Game designer what to change, which becomes Designer feedback. Both flow back into the specifications, and the loop repeats.

# Glossary

| Term | Definition |
| --- | --- |
| Development loop | The repeating cycle in which [specifications](../conventions/spec-conventions.md#specifications) are changed, an [Implementation](../conventions/spec-conventions.md#artifacts) is built or updated from them, and what that shows is fed back into them. |
| Implementer feedback | What an [Implementer](../conventions/spec-conventions.md#participants) learns about the specifications while building or updating an Implementation: the defects it met and the choices it made in their gaps. |
| Designer feedback | What the [Game designer](../conventions/spec-conventions.md#participants) finds wrong, or wants changed, after playing or reviewing an Implementation. |
| LLM skill | A packaged set of instructions that an LLM agent loads to carry out one recurring task of the Development loop. |

# Sources of truth

Each question about the game has one source of truth, and no other artifact answers it. There is one Implementation, it is never rebuilt from the specifications, and so the specifications do not have to describe everything it does: they hold the decisions, and the code holds the rest.

| Question | Source of truth |
| --- | --- |
| What is the game meant to be, and how is it meant to work? | The specifications: design decisions, terms, concepts, and diagrams, each stated once |
| What is a value, e.g. a cost or a rate? | The game data under `content/`; a specification says what a property means and never repeats its value |
| What happens where the specifications say nothing? | The code and tests of the Implementation |
| How does a screen look? | Its [Artboard](../../design/ui/visual-design.md#glossary); how it behaves is stated by its specification |
| What does a generated view say, e.g. the derived glossary or the Compendium preview? | Whatever it is generated from; a file under `docs/derived/` is never edited and never cited |
| What was the intent behind the design? | The [game design brief](../../../game-design-brief.md), which decides no rule |

When two artifacts disagree, the source of truth for the question stands and the other one changes:

| Disagreement                                                 | What changes                                        |
| ------------------------------------------------------------ | --------------------------------------------------- |
| A specification states something and the code does otherwise | The code                                            |
| A specification repeats a value and `content/` holds another | The specification, which loses the copy             |
| A specification and an Artboard show different things        | The Artboard, which is redrawn in the same change   |
| The specifications are silent                                | Nothing: the code decides, and it may change freely |

The answer to a question the specifications are silent on is added to them only when it is a decision, i.e. when the Game designer would object to the code doing it differently, e.g. a rule the Player plans around. It is then stated once, in the specification that owns its subject.

These artifacts take part in the Development loop:

| Artifact | What it holds | Who changes it |
| --- | --- | --- |
| Governance specifications | How every specification is written, under [Specification Conventions](../conventions/spec-conventions.md), and how the Development loop runs | An LLM at the Game designer's request, or the Game designer |
| [Design specifications](../conventions/spec-conventions.md#specifications) | The game: its concepts, rules, content, user interfaces, and [Autopilot AIs](../../design/foundation/engine-contract.md#principals-and-access) | An LLM at the Game designer's request, or the Game designer |
| Implementation specifications | How an Implementer turns the specifications into an Implementation in the Game designer's environment | An LLM at the Game designer's request, or the Game designer |
| Implementation | Code and tests that follow the specifications and decide what they do not state, together with its Implementer feedback and tracking files | The Implementer |

The Implementation specifications divide into Families by how binding they are, as described in [About Implementation specifications](../../implementation/about-implementation.md#families). Only the Mandatory [Family](../conventions/spec-conventions.md#specifications) binds every Implementation, and it requires exactly what the Development loop needs from one: where it lives, its Implementer feedback, and a record of which specifications it follows.

The specifications live in one repository and the Implementation in its own directory outside it. A change to a decision is made to the specifications first, and the Implementation follows. A change to what the specifications do not state is made in the code alone.

# Rounds of the Development loop

Development proceeds in rounds, each starting from the specifications and ending with feedback on them. Each round takes these steps, in this order:

1. **Change the specifications:** the initial set, or an increment, e.g. a new feature, a fixed inconsistency, or the outcome of earlier feedback.
2. **Build or update the Implementation:** the first round builds it from the specifications; every later round applies only the difference between the specifications it last followed and the current ones.
3. **Gather feedback:** the Implementer records Implementer feedback while building or updating, and the Game designer forms Designer feedback by playing or reviewing the result.
4. **Turn feedback into specification changes**, and start the next round at step 2.

![The Development loop: the Game designer changes the specifications; the Implementer builds or updates the Implementation from them; Implementer feedback flows back into the specifications until none is open; the Game designer plays the Implementation and Turns Designer feedback into specification changes](../../../images/diagrams/development-loop.svg)

The loop reaches a fixed point when an update produces no new Implementer feedback and every earlier item of it is settled, either by a specification change or by the Game designer declining it. Designer feedback can restart the loop at any time.

## Designer feedback

Designer feedback is the Game designer's judgement of the game as played, and it enters the Development loop like every other change: through the specifications. What the Game designer's observation changes depends on what the specifications already say about it:

- **The specifications say otherwise:** the Implementation does not conform. The specifications stay as they are and the Implementation is brought back into conformance with them. When ambiguous wording invited the mistake, the wording is also clarified.
- **The specifications say what the Implementation does:** the Implementation is right and the design is not what the Game designer wants. The Game designer changes the specifications, and an update follows.
- **The specifications are silent,** so the code decided: the Game designer either makes it a decision, which is written into the specifications and an update follows, or has the code changed and leaves the specifications silent.

One observation usually involves several Families of the Design specifications at once, e.g. a missing [Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) involves the rule that creates it, the [GDR](../../design/foundation/core-concepts.md#game-build-and-content) that supplies it, and the screen that shows it. The case is therefore decided for each Family involved, and a specification change goes to the Family that falls short, not to the first one found. The Implementation is a conformance defect only when every Family involved already specifies what the Game designer expects, e.g. the rule and its GDR are both present and the Implementation still leaves the feature out. Otherwise this table decides what changes:

| Where the specifications fall short | What changes |
| --- | --- |
| The feature is not specified, so no [GDR](../../design/foundation/core-concepts.md#game-build-and-content) can supply it | Foundation or Mechanics first, then Content for the GDRs the new rule reads |
| The feature is specified, but its GDR is missing or has the wrong values | Content only |
| What a user interface shows, how it arranges it, or how it looks, while the engine API already allows it | UI, including its visual design |
| How an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) chooses its [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns) | Autopilot AIs |

Whether a value is [Player](../conventions/spec-conventions.md#participants)-visible at all is a rule of Foundation or Mechanics, not of UI: a user interface presents the [Player-visible information](../../design/foundation/engine-contract.md#api-surfaces) and cannot reveal what the rules hide, though it can choose how prominently to show it. Implementer feedback is placed by the same table.

# LLM skills and workflows

Several tasks of the Development loop recur, and each needs the same few specifications and the same order of steps. An LLM skill captures one such task, so that an LLM agent does not have to rediscover what matters for it each time. LLM skills are kept in `.claude/skills/` of the [Spec repo](../../implementation/mandatory/implementation-placement.md#glossary), beside the specifications they serve. An LLM skill states no rule of its own: it points to the specifications that own the rules, and the specifications win when the two disagree.

The following table of LLM skills is exhaustive.

| LLM skill | Task |
| --- | --- |
| `spec-review` | Checks specifications against Specification Conventions and against each other. |
| `build-implementation` | Builds a first Implementation from the specifications, keeping its tracking and feedback files from the start. |
| `update-implementation` | Applies to an Implementation only the specification changes made since it last followed them. |
| `absorb-implementation-feedback` | Turns open Implementer feedback into specification changes, with the Game designer deciding each one. |
| `apply-designer-feedback` | Turns Designer feedback into specification changes or conformance fixes, under [Designer feedback](#designer-feedback). |
| `apply` | Runs `apply-designer-feedback` and then `update-implementation`, completing the Designer feedback workflow in one request. |
| `add-music` | Adds new music tracks from the Game designer's description and refreshes the Implementation's content with them. |

LLM skills chain into workflows that cover whole rounds. The following workflows are complete:

- **First build:** change the specifications, check them with `spec-review`, then run `build-implementation`.
- **Specification change:** change the specifications, check them with `spec-review`, then run `update-implementation`.
- **Implementer feedback to a fixed point:** run `absorb-implementation-feedback`, then `update-implementation`, and repeat while the update records new Implementer feedback.
- **Designer feedback:** run `apply-designer-feedback`, then `update-implementation`, or run `apply`, which does both.

# Appendix: Rationale

This appendix is informative. It records why the Development loop is shaped as it is.

## How much to delegate

The Game designer faces one guiding question: how much of the work to hand to an LLM. Delegating nothing means doing everything by hand, which is too slow and wastes what LLMs do well. Delegating everything beyond a short prompt means the Game designer's whole contribution is that prompt: the game is whatever the LLM produces, which offers no unique value and is no fun to make for long.

The answer lies between: delegate as much as possible, but keep the key creative and design control. The goal is a game developed fast that is still tightly designed and a great experience, e.g. fun, challenging, and free of boilerplate. The Development loop puts the line between the two in one place: every design decision is written in the specifications, where the Game designer decides it, and everything that only carries a decision out is delegated.

## Why each part exists

**Why does the Implementation live outside the Spec repo?** To make the line between the decisions and the code that carries them out physical. No design decision may have its only record in an [Implementation repo](../../implementation/mandatory/implementation-placement.md#glossary): when the code holds a decision that no specification states, nobody can tell it from an accident of the code.

**Why do the specifications not describe everything the Implementation does?** Because they once did, and it cost more than it gave. Specifications complete enough to rebuild the Implementation from nothing grew larger than the code, every change had to be made twice, and the many restatements began to contradict the rules they restated. With one Implementation that is never rebuilt, a specification that holds the decisions once is enough, and a decision stated once cannot disagree with itself.

**Why are there Specification Conventions?** Because the Game designer delegates writing the specifications too, and an LLM must be taught to write them well. The same conventions serve the readers: a predictable layout, one term for each concept, and explicit marks for what is left open make the specifications unambiguous to the LLMs that implement them, and let a command check part of them mechanically.

**Why are there Implementation specifications?** Because the Design specifications are abstract on purpose and describe only the game, while an Implementation is built in a concrete environment, e.g. a directory on the Game designer's machine with a particular toolchain. These specifications bridge the two, and their Mandatory part makes every Implementation keep what the Development loop needs from it, i.e. its Implementer feedback and a record of which specifications it follows.

**Why are there LLM skills?** Because the specifications are many and layered, while the recurring tasks are few and each needs only a known part of them. An LLM skill saves each run from rediscovering which part that is, which keeps the runs consistent and spends fewer tokens.
