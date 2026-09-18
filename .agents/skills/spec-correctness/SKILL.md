---
name: spec-correctness
description: Check, lint, validate, or review repository specifications and artifact relationships for deterministic convention compliance and semantic correctness.
---

# Specification correctness

Use this skill when a request concerns the correctness of specifications, their convention compliance, or their artifact relationships.

## Workflow

1. Run `npm run lint:specs` first.
2. Run `npm run docs:check` after specification linting. Treat missing, stale, or unexpected derived specification views as deterministic findings.
3. Treat exit code 1 as deterministic findings. Treat exit code 2 as an execution or parser failure, report it separately, and do not describe the specifications as linted.
4. For a review-only request, report diagnostics without modifying files.
5. After deterministic linting and derived-document checking, review the semantic concerns below.
6. When the user requests fixes, repair the findings and run `npm run check:commit` after editing. Run focused tests during repair when they provide useful feedback.
7. Before declaring repository changes complete, run `npm run check` as required by the repository's `AGENTS.md`.

## Semantic review

Check the concerns that the linter deliberately cannot prove:

- rule ownership;
- relationship truth and scope;
- the meaning of permitted `uses` cycles;
- whether refinements preserve the referenced contract;
- whether differently written terms represent the same concept;
- formula precision and correctness;
- whether acceptance examples prove the intended behavior.

Report “deterministic lint passed” separately from “semantic review found no issues.” Never claim that lint success accepts a specification, proves a relationship correct, or proves gameplay correctness.

The repository command is the single executable authority. Do not copy the linter into this skill and do not maintain a separate reference bundle.
