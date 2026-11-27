---
name: apply
description: Carry one change to the game through end to end. Settle it in the specifications when it is a design decision, change the Implementation's code and tests, and publish both. Use for the Game designer's feedback on the Implementation, for a design change, and to bring the Implementation up to date with specification commits it has not followed yet.
---

# Apply a change to the game

Use this skill when the Game designer wants something about the game changed, e.g. "/apply the Combat report shows the wrong damage" or "/apply Missions feel too easy", and when asked to bring the Implementation up to date with the specifications.

Which artifact decides what is owned by [Sources of truth](../../../docs/specs/governance/process/development-loop.md#sources-of-truth), and how feedback is sorted by [Designer feedback](../../../docs/specs/governance/process/development-loop.md#designer-feedback), both in Development Loop. Follow them, and let them win when this skill disagrees.

First choose the mode from how the user phrased the request:

- **Go:** the user states it as an instruction, e.g. "apply feedback: this UI renders wrong due to alignment". Design the change yourself, make every judgement call with the option you would recommend, and carry it through to both repositories without waiting for approval; the user reviews your decisions afterwards, from the report.
- **Discuss:** the request shows any hint of uncertainty, e.g. it asks a question ("should Missions be harder?"), hedges ("maybe", "I'm not sure", "what do you think"), weighs options, or asks to discuss. Give your analysis and a recommendation with its alternatives, and wait. Change nothing until the user settles the design; then continue as in Go mode.

When unsure which mode applies, use Discuss.

**Landing an Autopilot AI study:** when asked to apply the proposals of a study branch of the `improve-autopilot-ai` skill, its proposals, in the study document on that branch, are the request. In step 6, first bring the study branch's own commits into the worktree with `git cherry-pick $(git merge-base origin/main <branch>)..<branch>`, then write each proposal that changes how the AI decides into [Basic Autopilot AI](../../../docs/specs/design/autopilot-ais/basic-autopilot-ai.md). In step 8, take the Implementation's code from the study branch of the Implementation repo with `git merge --squash <branch>` rather than writing it again, and follow the rest of step 8. Once both pushes are done, report the study's worktrees as no longer needed; an Implementation worktree loses its `node_modules` link before it is removed.

## Workflow

1. **Check the Implementation repo.** It is `game-v5-impl-web`, the sibling of the Spec repo's main local clone. Run `git fetch` there. It must be on `main` with no uncommitted or untracked files; otherwise another session is working in it, so tell the user which check failed and stop. Never stash, commit, or discard its changes. Then fast-forward its `main` to `origin/main`.
2. **Create the Spec repo worktree**, under step 1 of [Spec repo changes in a worktree](../spec-repo-worktree.md), before reading any specification. Every change to the Spec repo follows that file: its worktree, its self-review and escalation, and its handling of push conflicts.
3. **Find what the Implementation has not followed yet.** Each Implementation commit that follows the specifications names the Spec repo commit it follows in a `Spec:` trailer. Read the newest one with `git log -1 --grep="^Spec: " --format="%(trailers:key=Spec,valueonly)"`. When the Spec repo's `origin/main` is ahead of it, `git diff --find-renames <that commit>..origin/main -- docs/specs` shows the decisions that changed since, and carrying them into the code is part of this run. Most such differences reword text without changing a decision and need no code change.
4. **Sort the request**, for each Family of the Design specifications it involves:
   - **The specifications say otherwise:** the code is wrong. Change the code only.
   - **A decision changes, or a new one is made:** change the specifications, then the code.
   - **The specifications are silent and no decision is at stake:** the code decides. Change the code only, and write nothing into the specifications.
5. **In Discuss mode, hold the design discussion here** and wait until the user settles it. In both modes, choose the option you would recommend for every open question, e.g. which Family changes or a value the request leaves open, and record each decision with its alternatives and reason for the report.
6. **Change the specifications**, when step 4 says so, in the worktree. State each decision once, in the specification that owns its subject, under [Design Specification Conventions](../../../docs/specs/governance/conventions/design-spec-conventions.md). When the words do not fit the specification's [word budget](../../../docs/specs/governance/conventions/spec-conventions.md#word-budgets), raise it in the same change. Then self-review, commit, and push, under steps 3 and 4 of Spec repo changes in a worktree.
7. **Release the worktree and update the main local clone**, under steps 5 and 6 of Spec repo changes in a worktree, before touching the Implementation repo. Do this also when the specifications did not change.
8. **Change the Implementation.**
   - Run `npm run sync:spec` in the Implementation repo. It mirrors the game data, the assets, the globe, and the license from the Spec repo's `origin/main` as committed, so uncommitted work in the main local clone is never copied. Never edit those copies by hand.
   - Change the code and its tests.
   - Change an existing test only when the change you are making explains its failure. A failure that the change does not explain is a defect you introduced: fix the code and leave the test. Never tell a subagent that the code is right and that failing tests are to follow it.
   - A gap you meet in the specifications is closed in the code. Raise it with the user only when the Game designer would object to the code deciding it, i.e. when it is a design decision.
9. **Check and publish the Implementation.** Run `npm run check` in the Implementation repo, never the Spec repo's scripts on it. Commit with the trailer `Spec: <full hash>`, naming the Spec repo commit the Implementation now follows, which is the Spec repo's `origin/main`. Run `git fetch`, rebase onto `origin/main`, rerun the checks when the rebase brought in commits, and push; the push deploys the game. When the rebase conflicts, abort it, tell the user, and stop. Never force-push.
10. **Generate the Screenshots again**, only when the change alters how a screen looks and that screen's Screenshot was captured more than 72 hours ago, by the "Captured on" time under it in its specification; a Screenshot up to 72 hours old may lag the game. Then run `npm run screens:capture` in the Implementation repo, which writes them into `docs/images/screens` of the main local clone of the Spec repo and the capture time under each image whose content differs in `docs/specs/design/ui/screens`. Commit and push the changed images and their times there, with nothing else staged; when no image differs, commit nothing. Never edit a Screenshot by hand.

## Report

Tell the user:

- for each Family involved, which case of step 4 applied, the specification sections that govern it, and what changed and where;
- both commit links, the result of the Implementation's checks, and how any conflict was resolved;
- **Decisions to review:** every decision made on the user's behalf, each with the option chosen, the alternatives, and why, most consequential first.

A question for the Game designer that blocks nothing is written as a TODO in the specification that owns its subject, under [Kinds of unspecified content](../../../docs/specs/governance/conventions/spec-conventions.md#kinds-of-unspecified-content); no file collects such questions. Never record a balance result anywhere, under [Campaign Tests](../../../docs/specs/implementation/mandatory/campaign-tests.md).
