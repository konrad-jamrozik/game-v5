---
name: improve-autopilot-ai
description: Study the Basic Autopilot AI with the Autopilot Lab and propose improvements, either in general or for one question the Game designer names, e.g. "evaluate deploying more Agents on Missions". Works only on local branches of a Spec repo worktree and an Implementation repo worktree, never pushes, and always writes a dated study report of its performance, flaws and root causes, tried, rejected and proposed improvements, experimental results, and game balance remarks. Use when the Game designer asks to improve, strengthen, fix, or evaluate a change to the Autopilot AI, or asks how it is faring and why it loses.
---

# Improve the Autopilot AI

This skill is a study that ends in a report and proposals, never in a published change. Read [Run a study](../../../tools/autopilot-lab/README.md#run-a-study) of the Autopilot Lab README first and follow it for every measurement. Asking for this skill is the Game designer's request for Balancing runs under [Campaign Tests](../../../docs/specs/implementation/mandatory/campaign-tests.md#balancing-runs) and for a study of the [Autopilot Studies family](../../../docs/specs/implementation/autopilot-studies/about-autopilot-studies.md).

## Never push

This skill pushes nothing to any remote, from either repository, and commits nothing to `main` of either. Every change it makes is a commit on its local branches below; the Game designer lands a study's proposals later through the `apply` skill. The standing authorization of `AGENTS.md` to commit and push does not apply to it.

## 0. The question

Before anything else, state the study's question in one sentence:

- **The Game designer named one,** e.g. "evaluate deploying more Agents on Missions": the study answers only that. Its measures, experiments, and root causes are those of the question, e.g. Mission win rate, Agents Killed, and money by team size, and its experiments are variants of the named idea, e.g. teams of 1 and 2 more Agents. A flaw it notices outside the question goes into the report under "Noticed, out of scope", uninvestigated and unchanged.
- **The Game designer named none:** the question is "why does the Basic Autopilot AI lose, and what makes it win?".

## 1. Set up the worktrees

1. **Spec repo worktree:** create it under steps 1 and 2 of [Spec repo changes in a worktree](../spec-repo-worktree.md), with `improve-autopilot-ai` as the skill name. Its branch, e.g. `a3f9-improve-autopilot-ai-20261126-1400`, is the study branch, and its name is also the Implementation branch's name. Run the Lab from this worktree, so that a change of the Lab made for the study takes effect.
2. **Implementation repo:** in the main clone, `git fetch`, check it is on `main` with no uncommitted or untracked files, and fast-forward it to `origin/main`, as step 1 of the `apply` skill directs; it is the baseline the Lab plays by default. Note the commit for the report.
3. **Implementation worktree:** `git -C <Implementation clone> worktree add <Implementation clone>-<study branch> -b <study branch> origin/main`, then link its `node_modules` to the clone's, e.g. `cmd //c mklink /J <worktree>\node_modules <Implementation clone>\node_modules`. It is variant B of every experiment of the AI's code or of game data, through `--impl-b`.

## 2. How it fares now

Run a baseline of 20 Campaigns on each of two sets of seeds, with the Turns long enough to reach their endings, e.g. `npm run autopilot:lab -- --campaigns 20 --turns 400` and the same with `--seeds two`, and answer, with spreads, the questions the study's question needs, e.g. for the general question:

- Does any Campaign end in Victory?
- If not, how many Turns until Defeat, and by which Ending reasons?
- How far does the AI get, e.g. the highest kind of Initiative Mission site it ever wins and when, and which Response Mission sites it cannot answer?

## 3. Flaws and root causes

Explain the flaws before changing anything:

1. Read the Detectors and Errors first; a flagged pattern is an AI defect until shown otherwise.
2. Follow the Panic or the money to its sources in the summary, e.g. which Faction operation levels expire unanswered.
3. Open the records, `<variant>-<seed>.json`, of a few typical seeds and of the worst, and read them Turn by Turn around the moment things go wrong, e.g. when the Strike team stops keeping up with its goal.
4. When the summary lacks a value a root cause needs, add it to the Lab in the Spec repo worktree and commit it on the study branch.
5. Take the five Combats not Won, i.e. Lost or Retreated, with the highest ratio of the Agents' Combat rating to the Enemies' at Combat start, over every Campaign of the baseline, e.g. from the Lab's list of Lost Combats at 110% or more or from the `combats` of `summary.json`. Decode each Combat setup seed, e.g. to each Agent's base skill, exhaustion, Weapon, and Armor against each Enemy's, and suspect a root cause for each, e.g. Agents near exhaustion Incapacitation or a few skilled Agents against many Enemies.

State each root cause as a mechanism with its evidence, e.g. "Response Mission sites of level 4 outrate the Strike team by 3× from Turn 60, and each one that expires adds 10 Panic".

## 4. Improvements, one change at a time

For each root cause, from the most consequential, or for each variant of the named idea:

1. **Make the change in the Implementation worktree** and commit it on the study branch, its message saying what it changes and never what it measured. Prefer a change of the AI's decisions over a new Tuning parameter value; a Tuning parameter value alone is tried with `--vs` and needs no commit.
2. **Measure it against the baseline** with `--impl-b <worktree>` on the same seeds, naming beforehand the measure it should move, e.g. the median Turn of Defeat.
3. **Keep it only when it helps** on that measure beyond the spread and makes nothing else clearly worse. Otherwise reject it: `git revert` its commit, so the branch keeps it for reading, and record why. A kept change becomes the baseline of the next one, played as variant A with `--impl <worktree>`.
4. **Stop** once the question is answered: for the general question, once Campaigns are won reliably, once the remaining defeats come from the game rather than from the AI, or once further changes stop helping.

The tip of the Implementation study branch is then the proposed AI, and its diff from `origin/main` is what `apply` will land. Change no specification other than the study: a proposal that changes how the AI decides is a design decision of [Basic Autopilot AI](../../../docs/specs/design/autopilot-ais/basic-autopilot-ai.md), which `apply` settles when the Game designer accepts it.

## 5. Game balance

Remark as balance, never as AI flaws, on what the study shows no reasonable play can overcome, each with its evidence, e.g.:

- the game appears impossible to win, e.g. a kind of Response Mission site outrates every Agency the economy can pay for by the Turn it first appears;
- something is too expensive and never worth buying, or so cheap that it is always bought first;
- a rule or a value dominates every outcome, e.g. one Faction operation level causes nearly all Defeats.

Recommend values for the Game designer to try; change no GDR value or Game designer value.

## 6. The report

Always write the study as a new document of the Autopilot Studies family in the Spec repo worktree, in the form of the latest study there, named by its date and, for a named question, its subject, e.g. `basic-autopilot-ai-study-2026-11-26-team-size.md`. Add it to the family's overview and to `docs/specs/word-budgets.json`, run `npm run fix` and `npm run check`, and commit it on the study branch. Its Overview states the study's question word for word, and its Method names the Implementation commit of the baseline, the study branch, and the seeds. Its sections:

1. **Review of current performance:** the answers of step 2, with spreads.
2. **Flaws and root causes:** each mechanism with its evidence and seeds; then always a "Top losses by Combat rating ratio" table of the five Combats of step 3.5, each with its ratio, Campaign seed, Turn, Mission site, Agents against Enemies, outcome, Combat setup seed, and suspected root cause; and, for a named question, a short "Noticed, out of scope" list.
3. **Improvements:** every change tried, in the order tried, with its measure before and after on the same seeds; then the rejected ones, each with why; then the proposed ones, each with the decision it would make in Basic Autopilot AI. A study may propose nothing, e.g. when more Agents per Mission win more but cost more than they save.
4. **Experimental results:** the proposed AI against the baseline on the questions of step 2, and against the [Autopilot AI Expectations](../../../docs/specs/design/autopilot-ais/autopilot-ai-expectations.md).
5. **Game balance remarks:** each with its evidence and recommended values.

Leave both worktrees in place, e.g. outside T3 Code with `ExitWorktree` and `action: "keep"` for the Spec repo one. In chat, summarize the five sections and give the study document's absolute path, both worktrees' absolute paths, and the study branch name, with the next step: `apply` the proposals of that branch.
