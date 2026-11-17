# Development Loop

| Metadata    | Value                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| Spec ID     | LOOP                                                                                                            |
| Family      | Process                                                                                                         |
| Audience    | Game designer, Implementer                                                                                      |
| Owns        | How the game is developed in a loop between specifications and Implementations, and the LLM skills that run it. |
| Conventions | [Specification Conventions](../conventions/spec-conventions.md)                                                 |

# Overview

The [Game designer](../conventions/spec-conventions.md#participants) delegates as much of the game's development to LLMs as possible, but no more: LLMs write the
specifications and the code, while the Game designer keeps every creative and design decision. That is how the game
can be developed fast and still be tightly designed and fun to play, rather than generic.

The split rests on one rule: the design lives only in the specifications, and an [Implementation](../conventions/spec-conventions.md#artifacts) is derived from them
and can be rebuilt at any time. Every change therefore enters as a change to the specifications and reaches the code
only through an Implementation update. Building and updating an Implementation teaches the [Implementer](../conventions/spec-conventions.md#participants) where the
specifications fall short, which becomes Implementer feedback; playing it shows the Game designer what to change, which
becomes Designer feedback. Both flow back into the specifications, and the loop repeats.

# Glossary

| Term                 | Definition                                                                                                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development loop     | The repeating cycle in which [specifications](../conventions/spec-conventions.md#specifications) are changed, an [Implementation](../conventions/spec-conventions.md#artifacts) is built or updated from them, and what that shows is fed back into them. |
| Implementer feedback | What an [Implementer](../conventions/spec-conventions.md#participants) learns about the specifications while building or updating an Implementation: the defects it met and the choices it made in their gaps.                                            |
| Designer feedback    | What the [Game designer](../conventions/spec-conventions.md#participants) finds wrong, or wants changed, after playing or reviewing an Implementation.                                                                                                    |
| LLM skill            | A packaged set of instructions that an LLM agent loads to carry out one recurring task of the Development loop.                                                                                                                                           |

# Durable specifications and disposable Implementations

The Development loop rests on one asymmetry: the specifications are the only durable record of the design, and an
Implementation is a product of them that can be thrown away and rebuilt. The following table of what takes part is
exhaustive.

| Artifact                                                                   | What it holds                                                                                                                                  | Who changes it                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Governance specifications                                                  | How every specification is written, under [Specification Conventions](../conventions/spec-conventions.md), and how the Development loop runs   | An LLM at the Game designer's request, or the Game designer |
| [Design specifications](../conventions/spec-conventions.md#specifications) | The game: its concepts, rules, content, user interfaces, and [Autopilot AIs](../../design/foundation/engine-contract.md#principals-and-access) | An LLM at the Game designer's request, or the Game designer |
| Implementation specifications                                              | How an Implementer turns the specifications into an Implementation in the Game designer's environment                                          | An LLM at the Game designer's request, or the Game designer |
| Implementation                                                             | Code and tests that follow the specifications, together with its Implementer feedback and tracking files                                       | The Implementer only, as derived from the specifications    |

The Implementation specifications divide into Families by how binding they are, as described in
[About Implementation specifications](../../implementation/about-implementation.md#families). Only the Mandatory
[Family](../conventions/spec-conventions.md#specifications) binds every Implementation, and it requires exactly what the Development loop needs from one: where it lives,
its Implementer feedback, and a record of which specifications it follows.

The specifications live in one repository and each Implementation in its own directory outside it. Every change to an
Implementation must be derived from the specifications: neither the Game designer nor an LLM changes an Implementation
in a way that the specifications neither require nor leave to the Implementer. A change the Game designer wants is made
to the specifications first, and the Implementation follows.

# Rounds of the Development loop

Development proceeds in rounds, each starting from the specifications and ending with feedback on them. Each round
takes these steps, in this order:

1. **Change the specifications:** the initial set, or an increment, e.g. a new feature, a fixed inconsistency, or the
   outcome of earlier feedback.
2. **Build or update the Implementation:** the first round builds it from the specifications; every later round
   applies only the difference between the specifications it last followed and the current ones.
3. **Gather feedback:** the Implementer records Implementer feedback while building or updating, and the Game designer
   forms Designer feedback by playing or reviewing the result.
4. **Turn feedback into specification changes**, and start the next round at step 2.

![The Development loop: the Game designer changes the specifications; the Implementer builds or updates the Implementation from them; Implementer feedback flows back into the specifications until none is open; the Game designer plays the Implementation and Turns Designer feedback into specification changes](../../../images/diagrams/development-loop.svg)

The loop reaches a fixed point when an update produces no new Implementer feedback and every earlier item of it is
settled, either by a specification change or by the Game designer declining it. Designer feedback can restart the loop
at any time.

## Designer feedback

Designer feedback is the Game designer's judgement of the game as played, and it enters the Development loop like
every other change: through the specifications. What the Game designer's observation changes depends on what the
specifications already say about it. The following cases are complete:

- **The specifications say otherwise:** the Implementation does not conform. The specifications stay as they are and
  the Implementation is brought back into conformance with them, which is a change derived from the specifications.
  When ambiguous wording invited the mistake, the wording is also clarified, so the next Implementer does not repeat
  it.
- **The specifications say what the Implementation does:** the Implementation is right and the design is not what the
  Game designer wants. The Game designer changes the specifications, and an update follows.
- **The specifications leave it open,** as an Implementer's choice or through a gap: the Game designer either
  specifies it, and an update follows, or accepts the Implementer's choice.

One observation usually involves several Families of the Design specifications at once, e.g. a missing [Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)
involves the rule that creates it, the [GDR](../../design/foundation/core-concepts.md#game-build-and-content) that supplies it, and the screen that shows it. The case is therefore decided
for each Family involved, and a specification change goes to the Family that falls short, not to the first one found.
The Implementation is a conformance defect only when every Family involved already specifies what the Game designer
expects, e.g. the rule and its GDR are both present and the Implementation still leaves the feature out. Otherwise the
following table, which is exhaustive, decides what changes:

| Where the specifications fall short                                                                                                                                                       | What changes                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| The feature is not specified, so no [GDR](../../design/foundation/core-concepts.md#game-build-and-content) can supply it                                                                  | Foundation or Mechanics first, then Content for the GDRs the new rule reads |
| The feature is specified, but its GDR is missing or has the wrong values                                                                                                                  | Content only                                                                |
| What a user interface shows, how it arranges it, or how it looks, while the engine API already allows it                                                                                  | UI, including its visual design                                             |
| How an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) chooses its [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns) | Autopilot AIs                                                               |

Whether a value is [Player](../conventions/spec-conventions.md#participants)-visible at all is a rule of Foundation or Mechanics, not of UI: a user interface presents
the [Player-visible information](../../design/foundation/engine-contract.md#api-surfaces) and cannot reveal what the rules hide, though it can choose how prominently to show it.
Implementer feedback is placed by the same table.

# LLM skills and workflows

Several tasks of the Development loop recur, and each needs the same few specifications and the same order of steps.
An LLM skill captures one such task, so that an LLM agent does not have to rediscover what matters for it each time. LLM skills
are kept in `.claude/skills/` of the [Spec repo](../../implementation/mandatory/implementation-placement.md#glossary), beside the specifications they serve. An LLM skill states no
rule of its own: it points to the specifications that own the rules, and the specifications win when the two
disagree.

The following table of LLM skills is exhaustive.

| LLM skill                        | Task                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `spec-review`                    | Checks specifications against Specification Conventions and against each other.                                         |
| `build-implementation`           | Builds a first Implementation from the specifications, keeping its tracking and feedback files from the start.          |
| `update-implementation`          | Applies to an Implementation only the specification changes made since it last followed them.                           |
| `absorb-implementation-feedback` | Turns open Implementer feedback into specification changes, with the Game designer deciding each one.                   |
| `apply-designer-feedback`        | Turns Designer feedback into specification changes or conformance fixes, under [Designer feedback](#designer-feedback). |

LLM skills chain into workflows that cover whole rounds. The following workflows are complete:

- **First build:** change the specifications, check them with `spec-review`, then run `build-implementation`.
- **Specification change:** change the specifications, check them with `spec-review`, then run
  `update-implementation`.
- **Implementer feedback to a fixed point:** run `absorb-implementation-feedback`, then `update-implementation`, and
  repeat while the update records new Implementer feedback.
- **Designer feedback:** run `apply-designer-feedback`, then `update-implementation`.

# Appendix: Rationale

This appendix is informative. It records why the Development loop is shaped as it is.

## How much to delegate

The Game designer faces one guiding question: how much of the work to hand to an LLM. Delegating nothing means doing
everything by hand, which is too slow and wastes what LLMs do well. Delegating everything beyond a short prompt means
the Game designer's whole contribution is that prompt: the game is whatever the LLM produces, which offers no unique
value and is no fun to make for long.

The answer lies between: delegate as much as possible, but keep the key creative and design control. The goal is a
game developed fast that is still tightly designed and a great experience, e.g. fun, challenging, and free of
boilerplate. The Development loop puts the line between the two in one place: every design decision is written in the
specifications, where the Game designer decides it, and everything that only carries a decision out is delegated.

## Why each part exists

**Why does an Implementation live outside the Spec repo?** To make the line between the design and
its product physical. Everything in an [Implementation repo](../../implementation/mandatory/implementation-placement.md#glossary) can be thrown away and rebuilt, so nothing there may
be the only record of a decision. The separation also lets several Implementations exist side by side, and keeps any
of them from depending on files of the Spec repo.

**Why is an Implementation never changed directly?** Because a direct change lives only in a disposable [artifact](../conventions/spec-conventions.md#artifacts). A
rebuild loses it, another Implementation never receives it, and the specifications still say the old thing, so the
next Implementer repeats the mistake. Even without a rebuild, an update applies only the difference in the
specifications, knows nothing of the direct change, and can undo it when it touches the same code.

**Why are there Specification Conventions?** Because the Game designer delegates writing the specifications too, and
an LLM must be taught to write them well. The same conventions serve the readers: a predictable layout, one term for
each concept, and explicit marks for what is left open make the specifications unambiguous to the LLMs that implement
them, and let a command check part of them mechanically.

**Why are there Implementation specifications?** Because the Design specifications are abstract on purpose and
describe only the game, while an Implementation is built in a concrete environment, e.g. a directory on the Game
designer's machine with a particular toolchain. These specifications bridge the two, and their Mandatory part makes
every Implementation keep what the Development loop needs from it, i.e. its Implementer feedback and a record of which
specifications it follows.

**Why are there LLM skills?** Because the specifications are many and layered, while the recurring tasks are few and each
needs only a known part of them. An LLM skill saves each run from rediscovering which part that is, which keeps the runs
consistent and spends fewer tokens.
