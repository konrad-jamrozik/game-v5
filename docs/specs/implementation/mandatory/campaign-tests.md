# Campaign Tests

| Metadata | Value |
| --- | --- |
| Spec ID | CTEST |
| Family | Mandatory |
| Audience | Engine designer, Implementer |
| Owns | How much play an automated test or a verification run of an Implementation may simulate with an Autopilot AI, and what it may check. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Playing whole [Campaigns](../../design/foundation/core-concepts.md#campaign-and-session) with an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) is slow, and what such a Campaign reaches depends on balance, which the Game designer tunes rather than the implementer. A test that asserts an outcome, e.g. that the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md) wins most Campaigns, breaks with the next change of a GDR value or a [Tuning parameter](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) without any defect in the Implementation, and a run long enough to measure balance costs many minutes of every check.

Every Implementation therefore plays Campaigns with an Autopilot AI only to show that play runs, in few short runs, and leaves balance to the Game designer's own tools.

# Glossary

| Term | Definition |
| --- | --- |
| Campaign test | An automated test of the [Implementation repo](implementation-placement.md#glossary), or a run the implementer makes to verify a change, that plays [Turns](../../design/foundation/engine-contract.md#player-actions-and-turns) of a [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) with an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) making its [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns), e.g. under [Autopilot](../../design/foundation/autopilot.md) with the Basic Autopilot AI. |

# Limits

For every Campaign test, the following rules are complete:

- **At most two Campaigns:** A Campaign test must play at most 2 Campaigns.
- **At most 200 Turns:** A Campaign test must play each Campaign for at most 200 Turns.
- **Only that play runs:** A Campaign test must check only that play does not fail, e.g. that no error is raised, that the Autopilot AI does not fail, and that every invariant of the World state holds. It must not check whether a Campaign is won or lost, its [Campaign ending](../../design/mechanics/domain-model.md#campaign-standing), the Turn it ends in, or any other measure of balance, e.g. a win rate, a final roster size, or the money left.
- **No balancing runs:** The implementer must not play Campaigns to tune or judge balance, e.g. to compare the win rates of two sets of Tuning parameters, and must not record such results anywhere, e.g. in a commit message, a code comment, or a report. Balance is the Game designer's to judge, with tools of their own.

# Edge cases and failure behavior

- **Scripted play:** A test whose Player actions the test itself makes, e.g. one that advances Turns of a Campaign it set up until Panic reaches a [Defeat](../../design/mechanics/panic-and-endings.md#defeat), is not a Campaign test, and may check the rule it tests, including a Campaign ending.
- **A Campaign that ends early:** A Campaign test whose Campaign reaches a Campaign ending before its last Turn stops there and passes, whatever the ending.
- **A failure found:** A Campaign test that fails because play failed, e.g. an Autopilot AI made a Player action that raised an error, shows a defect to fix, never a limit to raise.
