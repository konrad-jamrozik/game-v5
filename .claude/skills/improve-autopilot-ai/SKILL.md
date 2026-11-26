---
name: improve-autopilot-ai
description: Find out how well the Basic Autopilot AI plays, find the root causes of its defeats, and improve it, measuring every change with the Autopilot Lab, then report the root causes, what was tried, how well each worked, and any game balance issues found. Use when the Game designer asks to improve, strengthen, or fix the Autopilot AI, or asks how it is faring and why it loses.
---

# Improve the Autopilot AI

This skill is a study followed by changes. It uses the [`autopilot-lab` skill](../autopilot-lab/SKILL.md) for every measurement and the [`apply` skill](../apply/SKILL.md) for every change it keeps. Read both first; their rules win where this skill is silent. Asking for this skill is the Game designer's request for Balancing runs under [Campaign Tests](../../../docs/specs/implementation/mandatory/campaign-tests.md#balancing-runs).

## 1. How it fares now

Run a baseline of at least 30 Campaigns with the Turns long enough to reach their endings, e.g. `npm run autopilot:lab -- --campaigns 40 --turns 400`, and answer, with spreads:

- Does any Campaign end in Victory?
- If not, how many Turns until Defeat, and by which Ending reasons?
- How far does the AI get, e.g. the highest kind of Initiative Mission site it ever wins and when, and which Response Mission sites it cannot answer?

## 2. Root causes

Explain the defeats before changing anything:

1. Read the Detectors and Errors first; a flagged pattern is an AI defect until shown otherwise.
2. Follow the Panic or the money to its sources in the summary, e.g. which Faction operation levels expire unanswered.
3. Open the records, `<variant>-<seed>.json`, of a few typical seeds and of the worst, and read them Turn by Turn around the moment things go wrong, e.g. when the Strike team stops keeping up with its goal.
4. When the summary lacks a value a root cause needs, add it to the Autopilot Lab rather than guessing, and commit that change to the Spec repo with the study's other tool changes.

State each root cause as a mechanism with its evidence, e.g. "Response Mission sites of level 4 outrate the Strike team by 3× from Turn 60, and each one that expires adds 10 Panic".

## 3. Improve, one change at a time

For each root cause, from the most consequential:

1. **Make the change in a temporary worktree of the Implementation repo,** under the rules of `AGENTS.md` for worktrees, e.g. its `node_modules` linked and unlinked before removal. Prefer a change of the AI's decisions over a new Tuning parameter value; a Tuning parameter value alone is tried with `--vs`.
2. **Measure it against the baseline** with `--impl-b <worktree>` on the same seeds and at least 30 Campaigns, naming beforehand the measure it should move, e.g. the median Turn of Defeat.
3. **Keep it only when it helps** on that measure beyond the spread and makes nothing else clearly worse; otherwise discard it and record why. A kept change becomes the baseline of the next one.
4. **Stop** once Campaigns are won reliably, once the remaining defeats come from the game rather than from the AI, or once further changes stop helping.

Then carry every kept change through the `apply` skill: a change of how the AI decides is a design decision of [Basic Autopilot AI](../../../docs/specs/design/autopilot-ais/basic-autopilot-ai.md), so the specification changes first and the Implementation follows. Never write a measured result into either repository.

## 4. Game balance

Report as balance issues, never as AI defects, what the study shows no reasonable play can overcome, each with its evidence, e.g.:

- the game appears impossible to win, e.g. a kind of Response Mission site outrates every Agency the economy can pay for by the Turn it first appears;
- something is too expensive and never worth buying, or so cheap that it is always bought first;
- a rule or a value dominates every outcome, e.g. one Faction operation level causes nearly all Defeats.

Recommend values for the Game designer to try; change no GDR value or Game designer value unless the Game designer asks.

## 5. Report

In chat, and in an Artifact for a long study:

- **How it fares:** the baseline answers of step 1, with spreads.
- **Root causes:** each mechanism with its evidence.
- **What was tried:** every change, kept or discarded, with its measure before and after over the same seeds.
- **How well it worked:** the final variant against the baseline on the step 1 questions.
- **Balance issues:** each with its evidence and a recommendation.
- The commit links of the `apply` run and of any Autopilot Lab change.
