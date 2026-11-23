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

For every [Developer tool](../../design/foundation/engine-contract.md#api-surfaces), the following rules hold. A Developer tool that calls its own copy violates them even while its Agreement test passes, because a later change to one copy would make the two disagree.

- **One implementation:** The [Implementation repo](implementation-placement.md#glossary) must hold exactly one implementation of the part of the [Game rules](../../design/foundation/core-concepts.md#game-build-and-content) the Developer tool runs, e.g. one function that [fights a Combat](../../design/mechanics/combat.md#fighting-a-combat). The Developer tool and the step of play that runs that part, e.g. the Mission resolution step, must both call it.
- **No second copy:** The Developer tool must not run a copy, a re-implementation, or a simplified version of that part, and must not bypass any branch of it, e.g. by skipping its random outcomes. Recording less of the outputs is not bypassing, when the owning specification allows it, e.g. a Combat that records only its Combat summary: the one implementation then still runs every step and only leaves out building what is not returned.
- **Only inputs and outputs differ:** What the Developer tool adds around the shared implementation is limited to building its inputs from what the caller supplies, deriving its random outcomes from the caller's seed, returning its outputs instead of applying them to a [World state](../../design/foundation/engine-contract.md#player-actions-and-turns), choosing which of its outputs are recorded as the owning specification allows, and running it several times on one input, as a batch does.

# Agreement test

For every Developer tool, the Implementation repo must keep an automated test that runs the part of the Game rules once through play and once through the Developer tool, with equal inputs and equal values of every random outcome, and fails unless both produce equal outputs. E.g., for `developer.tools.fightCombat(setup)`, the test has a Combat fought in a Mission resolution step, gives `fightCombat` that Combat's starting values, GDR values, and random outcomes, and compares the two Combat reports, apart from the Mission and the identification of the participants. For `developer.tools.fightCombatBatch(setup, count, stop)`, the test also compares the [Combat summary](../../design/mechanics/combat.md#combat-rounds-and-results) of each [Combat](../../design/mechanics/domain-model.md#combat) of a batch with the [Combat report](../../design/mechanics/domain-model.md#combat) that `fightCombat` gives for the same Detached seed.

# Rules read by other rules

Some rules of the [Design specifications](../../design/about-design.md) are defined by another rule rather than stated anew, e.g. [Deploying Agents](../../design/mechanics/missions.md#deploying-agents) in Missions rejects an Agent that is not [Capable for deployment](../../design/mechanics/missions.md#glossary), i.e. that meets the [Incapacitation condition](../../design/mechanics/combat.md#incapacitation-condition), which [Combat start](../../design/mechanics/combat.md#combat-start) in Combat also evaluates. For every such pair of rules, the following rules hold:

- **One implementation:** The Implementation repo must hold exactly one implementation of the rule that is read, e.g. one function that decides whether a Combatant meets the incapacitation condition, and both the rule that reads it and the rule that owns it must call it. E.g., the precondition of `deployAgents` and Combat start both call that function, with the Agent's values as a Combatant's.
- **No second copy:** The rule that reads must not evaluate a copy, a re-implementation, or a simplified version of the rule it reads, e.g. a check of exhaustion alone that leaves out the skill clause.
- **Agreement test:** The Implementation repo must keep an automated test that gives both callers equal values and fails unless they decide alike. E.g., for the incapacitation condition, the test builds Agents on both sides of each clause, and checks that `deployAgents` rejects as not Capable for deployment exactly those that Combat start sets Incapacitated with the same values.
