# Rule Reuse

| Metadata | Value |
| --- | --- |
| Spec ID | REUSE |
| Family | Mandatory |
| Audience | Engine designer, Implementer |
| Owns | That each Developer tool runs the code that play runs, and the test that shows it. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A [Developer tool](../../design/foundation/engine-contract.md#api-surfaces) is worth something only while it agrees with play, e.g. a balancing tool that fights Combats through `developer.tools.fightCombat(setup)` learns about the game only if those Combats are fought exactly as a Mission resolution step fights them. [Developer tools](../../design/foundation/developer-access.md#developer-tools) in Developer Access requires that agreement of the engine's behavior. A second copy of the code would meet it on the day it is written and drift from it with the next change, so every Implementation must reach the agreement by running one implementation from both places.

# Shared implementation

For every [Developer tool](../../design/foundation/engine-contract.md#api-surfaces), the following rules are complete:

- **One implementation:** The [Implementation repo](implementation-placement.md#glossary) must hold exactly one implementation of the part of the [Game rules](../../design/foundation/core-concepts.md#game-build-and-content) the Developer tool runs, e.g. one function that fights a Combat under [Fighting a Combat](../../design/mechanics/combat.md#fighting-a-combat) in Combat. The Developer tool and the step of play that runs that part, e.g. the Mission resolution step, must both call it.
- **No second copy:** The Developer tool must not run a copy, a re-implementation, or a simplified version of that part, and must not bypass any branch of it, e.g. by skipping its random outcomes. Recording less of the outputs is not bypassing, when the owning specification allows it, e.g. a Combat that records only its Combat summary under [Fighting a Combat](../../design/mechanics/combat.md#fighting-a-combat) in Combat: the one implementation then still runs every step and only leaves out building what is not returned, and the step of play calls the same implementation with the full outputs recorded.
- **Only inputs and outputs differ:** What the Developer tool adds around the shared implementation is limited to building its inputs from what the caller supplies, deriving its random outcomes from the caller's seed, returning its outputs instead of applying them to a [World state](../../design/foundation/engine-contract.md#player-actions-and-turns), choosing which of its outputs are recorded as the owning specification allows, and running it several times on one input, as a batch does.
- **Mapped:** The [Specification map](specification-tracking.md#glossary) entry of the Developer tool's owning specification must name the shared implementation, so that a reader finds the one place that both callers use.

# Agreement test

For every Developer tool, the Implementation repo must keep an automated test that runs the part of the Game rules once through play and once through the Developer tool, with equal inputs and equal values of every random outcome, and fails unless both produce equal outputs. E.g., for `developer.tools.fightCombat(setup)`, the test has a Combat fought in a Mission resolution step, gives `fightCombat` that Combat's starting values, GDR values, and random outcomes, and compares the two Combat reports, apart from the Mission and the identification of the participants. For `developer.tools.fightCombatBatch(setup, count)`, the test also compares the [Combat summary](../../design/mechanics/combat.md#combat-rounds-and-results) of each [Combat](../../design/mechanics/domain-model.md#combat) of a batch with the [Combat report](../../design/mechanics/domain-model.md#combat) that `fightCombat` gives for the same Detached seed.

How the test supplies equal random outcomes to both calls, e.g. by giving the shared implementation its random source as an argument, is the Implementer's choice.

# Edge cases and failure behavior

- **A change to the shared part of the Game rules:** It changes play and the Developer tool together, because both call the one implementation; the Agreement test still passes without a change of its own.
- **A Developer tool that records less, e.g. only a Combat summary:** It calls the one implementation with less of the outputs recorded, which Shared implementation allows; a separate faster version of the rules that, e.g., skips building the Combat report by being a second copy violates it.
- **A Developer tool whose results look right but that calls its own copy:** The Implementation violates [Shared implementation](#shared-implementation) even when the Agreement test passes, because a later change to one copy would make them disagree.
