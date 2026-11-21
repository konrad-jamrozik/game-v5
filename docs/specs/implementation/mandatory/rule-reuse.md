# Rule Reuse

| Metadata | Value |
| --- | --- |
| Spec ID | REUSE |
| Family | Mandatory |
| Audience | Engine designer, Implementer |
| Owns | That each Developer tool runs the code that play runs, that a rule which another rule reads runs as one implementation, and the tests that show it. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A [Developer tool](../../design/foundation/engine-contract.md#api-surfaces) is worth something only while it agrees with play, e.g. a balancing tool that fights Combats through `developer.tools.fightCombat(setup)` learns about the game only if those Combats are fought exactly as a Mission resolution step fights them. [Developer tools](../../design/foundation/developer-access.md#developer-tools) in Developer Access requires that agreement of the engine's behavior. A second copy of the code would meet it on the day it is written and drift from it with the next change, so every Implementation must reach the agreement by running one implementation from both places.

The same holds within play wherever one rule is defined by another, e.g. when a precondition asks whether a Combat would treat an Agent a certain way: the precondition is right only while it asks exactly what the Combat does.

# Shared implementation

For every [Developer tool](../../design/foundation/engine-contract.md#api-surfaces), the following rules are complete:

- **One implementation:** The [Implementation repo](implementation-placement.md#glossary) must hold exactly one implementation of the part of the [Game rules](../../design/foundation/core-concepts.md#game-build-and-content) the Developer tool runs, e.g. one function that fights a Combat under [Fighting a Combat](../../design/mechanics/combat.md#fighting-a-combat) in Combat. The Developer tool and the step of play that runs that part, e.g. the Mission resolution step, must both call it.
- **No second copy:** The Developer tool must not run a copy, a re-implementation, or a simplified version of that part, and must not bypass any branch of it, e.g. by skipping its random outcomes. Recording less of the outputs is not bypassing, when the owning specification allows it, e.g. a Combat that records only its Combat summary under [Fighting a Combat](../../design/mechanics/combat.md#fighting-a-combat) in Combat: the one implementation then still runs every step and only leaves out building what is not returned, and the step of play calls the same implementation with the full outputs recorded.
- **Only inputs and outputs differ:** What the Developer tool adds around the shared implementation is limited to building its inputs from what the caller supplies, deriving its random outcomes from the caller's seed, returning its outputs instead of applying them to a [World state](../../design/foundation/engine-contract.md#player-actions-and-turns), choosing which of its outputs are recorded as the owning specification allows, and running it several times on one input, as a batch does.
- **Mapped:** The [Specification map](specification-tracking.md#glossary) entry of the Developer tool's owning specification must name the shared implementation, so that a reader finds the one place that both callers use.

# Agreement test

For every Developer tool, the Implementation repo must keep an automated test that runs the part of the Game rules once through play and once through the Developer tool, with equal inputs and equal values of every random outcome, and fails unless both produce equal outputs. E.g., for `developer.tools.fightCombat(setup)`, the test has a Combat fought in a Mission resolution step, gives `fightCombat` that Combat's starting values, GDR values, and random outcomes, and compares the two Combat reports, apart from the Mission and the identification of the participants. For `developer.tools.fightCombatBatch(setup, count, stop)`, the test also compares the [Combat summary](../../design/mechanics/combat.md#combat-rounds-and-results) of each [Combat](../../design/mechanics/domain-model.md#combat) of a batch with the [Combat report](../../design/mechanics/domain-model.md#combat) that `fightCombat` gives for the same Detached seed.

How the test supplies equal random outcomes to both calls, e.g. by giving the shared implementation its random source as an argument, is the Implementer's choice.

# Rules read by other rules

Some rules of the [Design specifications](../../design/about-design.md) are defined by another rule rather than stated anew, e.g. precondition 9 of [Deploying Agents](../../design/mechanics/missions.md#deploying-agents) in Missions rejects an Agent that meets the incapacitation condition, under [Incapacitation condition](../../design/mechanics/combat.md#incapacitation-condition) in Combat, which [Combat start](../../design/mechanics/combat.md#combat-start) in Combat also evaluates. For every such pair of rules, the following rules are complete:

- **One implementation:** The Implementation repo must hold exactly one implementation of the rule that is read, e.g. one function that decides whether a Combatant meets the incapacitation condition, and both the rule that reads it and the rule that owns it must call it. E.g., the precondition of `deployAgents` and Combat start both call that function, with the Agent's values as a Combatant's.
- **No second copy:** The rule that reads must not evaluate a copy, a re-implementation, or a simplified version of the rule it reads, e.g. a check of exhaustion alone that leaves out the skill clause.
- **Mapped:** The Specification map entry of the reading rule's owning specification must name the shared implementation.
- **Agreement test:** The Implementation repo must keep an automated test that gives both callers equal values and fails unless they decide alike. E.g., for the incapacitation condition, the test builds Agents on both sides of each clause, and checks that `deployAgents` rejects under precondition 9 exactly those that Combat start sets Incapacitated with the same values.

# Edge cases and failure behavior

- **A change to the shared part of the Game rules:** It changes play and the Developer tool together, because both call the one implementation; the Agreement test still passes without a change of its own.
- **A Developer tool that records less, e.g. only a Combat summary:** It calls the one implementation with less of the outputs recorded, which Shared implementation allows; a separate faster version of the rules that, e.g., skips building the Combat report by being a second copy violates it.
- **A change to a rule that another rule reads:** It changes both rules together, e.g. a new clause of the incapacitation condition rejects the same Agents from deployment that it makes Incapacitated at Combat start, because both call the one implementation ([Rules read by other rules](#rules-read-by-other-rules)).
- **A Developer tool whose results look right but that calls its own copy:** The Implementation violates [Shared implementation](#shared-implementation) even when the Agreement test passes, because a later change to one copy would make them disagree.
