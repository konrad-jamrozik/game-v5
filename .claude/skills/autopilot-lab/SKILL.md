---
name: autopilot-lab
description: Study how the Basic Autopilot AI plays and how balanced the game is by running many Autopilot Campaigns at once with the Autopilot Lab (`npm run autopilot:lab`), comparing Tuning parameters, AI code, or game data on the same seeds. Use when the Game designer asks to benchmark, compare, tune, or investigate the Autopilot AI or the game's balance, e.g. "is the new AI better?", "why does the AI lose by Turn 120?", or "find good values for the Combat margin".
---

# Autopilot Lab

The [Autopilot Lab](../../../tools/autopilot-lab/README.md) plays many Campaigns with the Basic Autopilot AI in parallel and prints one compact summary, with a column per variant on the same seeds. Read its README for every option and what each section of the summary means.

## When it may run

A run of the Lab is a Balancing run under [Campaign Tests](../../../docs/specs/implementation/mandatory/campaign-tests.md#balancing-runs). Run it only when the Game designer asks for a study of balance or of how the AI plays, never to verify a change: a Campaign test still plays at most 2 Campaigns of at most 200 Turns and checks only that play runs.

## The loop

1. **Ask a question,** e.g. "does a larger Research team size win the safehouse sooner?", and name the measure that answers it before running, e.g. the median Turn of the first win at `raid_safehouse`.
2. **Baseline first:** run the current parameters, e.g. `npm run autopilot:lab -- --campaigns 30 --turns 200`, and keep its records folder.
3. **Change one thing** and compare on the same seeds: `--vs key=value` for Tuning parameters, or `--impl-b <worktree>` for a change of the AI's code or of game data, made in a temporary worktree of the Implementation repo under the rules of `AGENTS.md` for worktrees.
4. **Read the Detectors and Errors before the averages.** A flag or an error is a defect to understand in that seed's record, `<variant>-<seed>.json`, before any balance reading counts; fix a defect of the AI through the `apply` skill.
5. **Judge with enough Campaigns:** 30 or more per variant before calling a difference real, and look at the 25th to 75th percentiles as well as the medians. Raise `--turns` to see the late game, e.g. 400.
6. **Repeat** with the next change, keeping each run's records folder.

Keep a run under about five minutes of wall-clock time; the first line of output says how long the last one took.

## Reporting

- Report what was asked, the variants, the measure, and the result with its spread, e.g. "first safehouse win: T38 (T33–T45) for A against T31 (T28–T36) for B over 30 seeds", in chat or, for a longer study, in an Artifact.
- Never write a balance result into a specification, the code, a test, a commit message, a code comment, or a TODO.
- Recommend values; change a GDR value or a Game designer value of a Tuning parameter only when the Game designer asks for it, through the `apply` skill.
