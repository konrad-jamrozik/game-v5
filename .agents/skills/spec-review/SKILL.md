---
name: spec-review
description: Review repository specifications, either all of them or a named subset such as specific files or one Family. Runs the deterministic spec checks as a preflight and has failures fixed first, then performs a deep semantic review for conflicting, stale, duplicate, verbose, meta-documentation, and terminology problems, cross-referenced against related documents. Use for any request to check, lint, validate, or review specifications, or to find drift between them.
---

# Specification review

The point of a review is the semantic check: finding statements that conflict, repeat, drift out of date, or say more
than they need to. Deterministic checks come first only as a preflight, so the semantic review never spends effort on
problems a command can find.

The [Specification Conventions](../../../docs/specs/governance/conventions/spec-conventions.md) are the authority for every rule
this skill applies. Read them before reviewing. The repository commands are the single executable authority for
deterministic checks; do not copy the linter into this skill.

## Scope

A review runs in one of two modes:

- **Sweep:** every registered specification, as listed in the [derived specification catalog](../../../docs/derived/README.md).
- **Narrowed:** a set the user names, e.g. specific files, one or more Families, or "all Mechanics specifications".
  Resolve the description to an explicit list of files, the Targets, using the catalog and each file's metadata. If the description is ambiguous, ask instead of guessing.

In Sweep mode every specification is a Target. In both modes, documents outside the Targets are still read as context,
as described in [Building the review set](#building-the-review-set).

Every Target is reviewed the same way: for its own quality, and for drift, i.e. whether it still holds against the
current state of the documents around it.

## Preflight

1. Run `npm run lint:specs`, then `npm run docs:check`.
2. Exit code 1 means deterministic findings. Exit code 2 means an execution or parser failure: report it separately,
   do not describe the specifications as linted, and stop.
3. If either command reports findings, fix them before starting the semantic review, then run both commands again
   until they pass. Missing, stale, or unexpected derived views are fixed with `npm run docs:generate`.
4. Stop and ask the user instead of fixing when a fix needs a design decision, or lies in a file outside the Targets of a Narrowed review that the user may be editing elsewhere.
5. Report "preflight passed" separately from the semantic results. Passing the preflight never shows that a
   specification is correct.

## Building the review set

1. **Targets:** read each Target in full.
2. **Context documents:** for each Target, collect:
   - every document in its Relationships section, in both directions;
   - every specification it links in prose, including the owning Glossaries of the terms it uses;
   - Specification Conventions, in particular [Terminology replacements](../../../docs/specs/governance/conventions/spec-conventions.md#terminology-replacements),
     [Non-terms](../../../docs/specs/governance/conventions/spec-conventions.md#non-terms), and
     [Subject before document](../../../docs/specs/governance/conventions/spec-conventions.md#subject-before-document);
   - the [game design brief](../../../docs/game-design-brief.md), for checking intent only.
3. Read each Dependency in full. For each Dependent, read at least every passage that cites or relies on the Target.
4. Run `git log` on the Target and on each Dependency, and look closely at Dependencies that
   changed after the Target last did.

A Sweep, or any review with more than about ten documents, can be split across subagents, e.g. one per Family. Each
subagent reviews its share against the anti-patterns and returns candidate findings with exact quotations. The main
review then checks conflicts and duplicates across shares, which no single subagent can see, and verifies every
candidate as described in [Verifying findings](#verifying-findings).

## Semantic review

The semantic review looks for the anti-patterns below. Review every Target against each one, and compare Targets with
each other as well as with their context documents. Check every use in context, never by text search alone.

### Anti-patterns

1. **Conflicting information:** two statements that cannot both hold, within one document or across documents. This
   includes inconsistent information, e.g. one value or rule stated differently in two places, and stale information,
   e.g. a statement that still describes a design that has since changed, or that cites a removed or renamed section,
   term, or API name.
2. **Duplicate information:** a rule, definition, formula, parameter value, or API field stated in more than one place,
   even consistently. It has one owner, per [One owner per rule](../../../docs/specs/governance/conventions/spec-conventions.md#one-owner-per-rule);
   every other place links to the owner. Propose which document owns it.
3. **Missing terminology:** a concept with no defined term, so documents describe it with repeated ad hoc phrases. This
   makes text verbose, and different documents describe it inconsistently, e.g. one says "the turn's closing
   bookkeeping" and another "end-of-turn updates" for the same step. Propose a term and the Glossary that should own
   it. Also flag a formal term used before or without its definition.
4. **Forbidden terms:** a word from the INSTEAD OF column of Terminology replacements used for the concept it replaces,
   e.g. "entry" for a GDR; a near-synonym or shortened form of a defined term, e.g. "instance" for Campaign instance;
   or a Non-term treated as a defined term. Each causes inconsistency because readers cannot tell whether two words
   mean one concept or two. A likely synonym missing from Terminology replacements is also a finding.
5. **Meta documentation:** text about the document instead of its subject, as prohibited by Subject before document,
   e.g. "This section defines…", "X owns Y", or "This document refines Z by specifying A, B, and C". This includes
   Overviews that inventory facts instead of orienting the reader, and topic sections without a lead sentence.
6. **Verbosity:** text that can be shortened or removed without losing a rule, definition, or explanation the reader
   needs, e.g. a paragraph that restates its own heading, or rationale padding inside a normative rule. Do not flag
   multi-angle worked examples of foundational or complex concepts; the project owner wants them kept. Do flag
   verbosity in ordinary rules and in examples of simple concepts.
7. **Out-of-scope content:** statements that fail [What belongs in a specification](../../../docs/specs/governance/conventions/spec-conventions.md#what-belongs-in-a-specification),
   e.g. internal ordering or code structure.
8. **Gaps:** a rule that depends on an unstated choice, an Open decisions entry that the text already settles, or a
   `TODO:` item whose missing answer a rule in the Target already relies on.

### Structural checks

These are semantic checks the linter deliberately cannot prove:

- relationship truth: each relationship entry reflects a real reliance on content the target currently owns, with the
  right Relationship kind, and entries made obsolete by moved, renamed, or deleted content are pruned;
- refinements preserve the parent contract, and permitted `uses` cycles have a stated meaning;
- each section, rule, and term sits in the specification that should own it, and a topic that has outgrown its
  specification is split;
- each Glossary group's name and description cover its terms;
- every example is introduced with "e.g." or sits under an explicit Examples label, and every illustrative enumeration
  has at most three items;
- formulas are precise and correct, and acceptance examples prove the intended behavior.

## Severity

Assign each finding one severity:

| Severity | When                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blocking | A conflict, duplicate, forbidden term, or missing term within the Targets or between a Target and any other document; anything a Target must resolve before it can be implemented. |
| Minor    | Meta documentation, verbosity, out-of-scope content, and imprecise wording that does not change a rule's meaning.                                                                  |

Every document may change, so for a conflict between two documents, say which side should change on the merits, never
because of its current wording.

## Verifying findings

Before reporting, re-read the exact text at every location a finding cites, in both places for a conflict or duplicate,
and discard any finding the text does not support. Prefer fewer, certain findings to many speculative ones. Label a
finding "Uncertain" when it survives but depends on an interpretation.

## Report

Write the report in chat, in this order:

1. **Scope:** the mode, and for a Narrowed review the resolved list of Targets.
2. **Preflight:** passed, or what was fixed to make it pass.
3. **Verdict per Target:** Consistent, Minor issues only, or Has blocking issues. In a Sweep, list only Targets with findings, then a count of the rest.
4. **Findings,** grouped by severity, Blocking first. Each states the anti-pattern or check; the location, linked as the
   repository's `AGENTS.md` requires, and for a conflict or duplicate both locations;
   a short quotation; why it is a problem; and a concrete fix, e.g. replacement wording or the document that should own
   the rule.
5. **Not reviewed:** anything you could not read or check.

Introduce every example in the report with "e.g.".

## Fixing findings

A review changes no specification beyond the preflight fixes. Fix semantic findings only when the user asks. After
fixing, run `npm run check:commit`, and before declaring the work complete run `npm run check`, as `AGENTS.md`
requires. Follow `AGENTS.md` for committing.
