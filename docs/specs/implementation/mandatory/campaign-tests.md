# Campaign Tests

| Metadata | Value |
| --- | --- |
| Spec ID | CTEST |
| Family | Mandatory |
| Audience | Engine designer, Implementer |
| Owns | How much play an automated test or a verification run of an Implementation may simulate with an Autopilot AI, what it may check, and when Campaigns may be played to study balance. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Playing whole [Campaigns](../../design/foundation/core-concepts.md#campaign-and-session) with an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) is slow, and what such a Campaign reaches depends on balance, which the Game designer tunes rather than the implementer. A test that asserts an outcome, e.g. that the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md) wins most Campaigns, breaks with the next change of a GDR value or a [Tuning parameter](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) without any defect in the Implementation, and a run long enough to measure balance costs many minutes of every check. Every Implementation therefore plays Campaigns with an Autopilot AI only to show that play runs, in few short runs, and balance is studied apart, in Balancing runs the Game designer asks for.

# Glossary

| Term | Definition |
| --- | --- |
| Campaign test | An automated test of the [Implementation repo](implementation-placement.md#glossary), or a run the implementer makes to verify a change, that plays [Turns](../../design/foundation/engine-contract.md#player-actions-and-turns) of a [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) with an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) making its [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns), e.g. under [Autopilot](../../design/foundation/autopilot.md) with the Basic Autopilot AI. |
| Balancing run | A run that plays Campaigns with an Autopilot AI to measure balance or how the Autopilot AI plays, e.g. to compare the win rates or the Turns of the first win of two sets of Tuning parameters. It is never a Campaign test. |

# Limits

The limits bind every Campaign test. A test whose Player actions the test itself makes, e.g. one that advances Turns of a Campaign it set up until Panic reaches a [Defeat](../../design/mechanics/panic-and-endings.md#defeat), is not a Campaign test, and may check the rule it tests, including a Campaign ending.

- **At most two Campaigns:** A Campaign test must play at most 2 Campaigns.
- **At most 200 Turns:** A Campaign test must play each Campaign for at most 200 Turns. A Campaign that reaches a [Campaign ending](../../design/mechanics/domain-model.md#campaign-standing) earlier stops there, and the test passes whatever the ending.
- **Only that play runs:** A Campaign test must check only that play does not fail, e.g. that no error is raised, that the Autopilot AI does not fail, and that every invariant of the World state holds. It must not check whether a Campaign is won or lost, its [Campaign ending](../../design/mechanics/domain-model.md#campaign-standing), the Turn it ends in, or any other measure of balance, e.g. a win rate, a final roster size, or the money left. A Campaign test that fails because play failed shows a defect to fix, never a limit to raise.
- **No balancing in a Campaign test:** A Campaign test, and every run that verifies a change, must not be used as a Balancing run.

# Balancing runs

Balance is the Game designer's to judge, and an agent's Balancing run informs that judgement rather than replacing it.

- **Only when asked:** An agent makes a Balancing run only when the Game designer asks for one, e.g. to compare two sets of Tuning parameters or to find why the Autopilot AI loses, and makes it with the Autopilot Lab in `tools/autopilot-lab/`, as many Campaigns and Turns as the question needs.
- **Results outside the repositories:** Its results go to the Game designer in chat or in an Artifact, and never into a specification, the code, a test, a commit message, a code comment, or a TODO, because a result recorded there goes stale with the next change of a [GDR](../../design/foundation/core-concepts.md#game-build-and-content) value or a [Tuning parameter](../../design/autopilot-ais/basic-autopilot-ai.md#glossary).
- **Values are the Game designer's:** The agent recommends values, and changes a GDR value or a Game designer value of a Tuning parameter only when the Game designer asks it to.
