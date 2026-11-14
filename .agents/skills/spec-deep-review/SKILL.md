---
name: spec-deep-review
description: Deeply review a given list of specifications for semantic problems before acceptance, or for drift after acceptance, cross-referencing them with each other, their relationships, and the documents they link. Use when the user names specific specification files and asks for a deep, careful, or acceptance-readiness review. Not for routine lint or convention checks, which spec-correctness covers.
---

# Specification deep review

This skill reviews a small set of specifications named by the user, the Targets, as a final semantic and consistency
check. A Target that is not yet Accepted is reviewed for acceptance readiness. A Target that is Accepted is reviewed for
drift: whether it still holds against the current state of the documents around it.

This is a review only. Do not modify files unless the user asks for fixes after reading the report.

The [Specification Conventions](../../../docs/specs/governance/spec-conventions.md) are the authority for every rule this
skill applies. Read them before reviewing. Do not repeat the spec-correctness checklist or run its linter; this skill goes
deeper on the dimensions below and assumes deterministic lint is handled separately.

## Input

The user supplies a list of specification files. If the list is missing or ambiguous, ask for it. Do not guess Targets.

## Building the review set

1. **Targets:** read each Target in full.
2. **Context documents:** for each Target, collect:
   - every document in its Relationships section, in both directions;
   - every specification it links in prose, including Glossary links of the terms it uses;
   - Specification Conventions, including its Terminology replacements table;
   - the [game design brief](../../../docs/game-design-brief.md), for checking intent only.
3. Read each Dependency (Uses, Refines, Follows, Implements, Verifies) in full. For each Dependent (Used by, Refined
   by, and the other reverse phrases), read at least every passage that cites or relies on the Target.
4. Record each context document's Status from its metadata table. The Status decides finding severity below.
5. For a drift review, run `git log` on the Target and on each Dependency. Pay particular attention to Dependencies
   that changed after the Target's last change.

When the review set is large, e.g. more than ten context documents, you may give one subagent per context document
the job of extracting the terms, rules, and claims it states about the Targets' subjects. The main review still
compares them; subagents only gather.

## Review dimensions

Review every Target against each dimension. Cross-check Targets against each other as well as against context
documents.

1. **Imprecise terminology:** a formal term used loosely, shortened, replaced by a near-synonym or generic noun, or used
   with a meaning that differs from its owning Glossary; e.g. "instance" where Campaign instance is meant. Check every
   use in context, not by text search alone.
2. **Missing terms:** a concept the Target relies on repeatedly, or that a rule depends on, without a Glossary
   definition here or in an owning specification; or a term used before or without its definition.
3. **Obsolete content:** statements that describe a superseded design, cite removed or renamed sections, terms, or API
   names, or contradict what a Dependency now says; e.g. a rule that still refers to a retired history retention limit.
4. **Conflicting content:** two statements that cannot both hold, within one Target, between Targets, or between a Target
   and a context document. This includes one rule owned in two places with different wording or values.
5. **Verbosity:** text that can be shortened or removed without losing a rule, a definition, or an explanation the
   reader needs; e.g. a contract stated twice, a paragraph that restates its own heading, rationale padding inside a
   normative rule, or content that duplicates what another specification owns. Do not flag multi-angle worked examples
   of foundational or complex concepts as redundancy; the project owner wants them kept. Do flag verbosity in ordinary
   rules, prose, and examples of simple concepts.
6. **Out-of-scope content:** statements that fail the [What belongs in a specification](../../../docs/specs/governance/spec-conventions.md#what-belongs-in-a-specification)
   test, e.g. internal ordering or code structure.
7. **Open decisions and gaps:** a rule that depends on an unstated choice, an Open decisions entry that the text already
   settles, or a TODO left in a Target proposed for acceptance.

## Severity

Assign each finding one severity:

| Severity | When                                                                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Blocking | Any conflict, obsolete statement, unresolved terminology, or missing term within the Targets; any conflict between a Target and an Accepted context document; any rule a Target must resolve before acceptance.                                                                |
| Minor    | Verbosity, out-of-scope content, and imprecise wording that does not change a rule's meaning.                                                                                                                                                                                  |
| Note     | A conflict or terminology mismatch between a Target and a Draft or Stub context document. Draft and Stub content may change freely, so these do not block the Target; report which side should change on the merits, and never treat the Draft wording as a reason to keep it. |

Ignore Superseded context documents, except to flag a Target that relies on one.

For a drift review of an Accepted Target, a finding that would require changing the Target is still Blocking, and the
fix must be presented as a revision for the project owner to approve.

## Verifying findings

Before reporting, re-read the exact text at every location a finding cites, in both documents for a conflict, and
discard any finding the text does not support. Report only findings that survive this check. Prefer fewer, certain
findings to many speculative ones; label a finding "Uncertain" when it survives but depends on an interpretation.

## Report

Write the report in chat, in this order:

1. **Verdict per Target:** Ready, Ready after Minor fixes, or Not ready (has Blocking findings). For a drift review:
   No drift, or Drift found.
2. **Review set:** the context documents read, each with its Status.
3. **Findings**, grouped by severity, Blocking first. Each finding states:
   - the dimension;
   - the location, linked as required by the repository's `AGENTS.md`, and for a conflict both locations and the Status
     of the other document;
   - a short quotation of the problematic text;
   - why it is a problem;
   - a concrete proposed fix, e.g. replacement wording or which document should own the rule.
4. **Not reviewed:** anything you could not read or check.

Introduce every example in the report with "e.g.", as the repository requires.
