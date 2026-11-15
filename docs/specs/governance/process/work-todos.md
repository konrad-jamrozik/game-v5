# Outstanding Work Items

| Metadata    | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Spec ID     | TODOS                                                                                    |
| Family      | Process                                                                                  |
| Audience    | Engine designer                                                                          |
| Owns        | Known outstanding specification issues awaiting scheduling, with their affected batches. |
| Conventions | [Specification conventions](../conventions/spec-conventions.md)                          |

# Overview

Reviewing the specifications keeps turning up problems that cannot all be fixed at once. A Work item records one such
issue in the registered specifications, one that should be addressed eventually but is not yet scheduled, completely
enough that a reader with no other context can act on it.

Each Work item is tied to the review that will settle it: it names the Batch of each affected specification, as listed
in [Batch sequence](work-plan.md#batch-sequence) in the [Specification Work Plan and Backlog](work-plan.md), so that it
can be handled when that Batch is drafted or reviewed. Recording a Work item neither schedules it nor changes any Batch
status, and each specification remains authoritative until it is revised. A link from a Work item to a
specification is a citation, not a relationship.

# Relationships

- Uses [Specification Work Plan and Backlog](work-plan.md)

# Glossary

Batch is defined in the [Specification Work Plan and Backlog glossary](work-plan.md#glossary).

| Term      | Definition                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Work item | One known outstanding issue in one or more registered specifications, recorded in this document until it is resolved or found obsolete. |

# Adding and removing Work items

Add a Work item when an issue is found that is not fixed in the same change. Give it the next unused label, the form
`TODO-NNN` with three digits, and a heading of the form `TODO-NNN: short title` under the matching category. Never
reuse a label. The label is a short handle for discussion; references from other documents link to the Work item's
heading, as required by [Requirement wording](../conventions/spec-conventions.md#requirement-wording).

Remove a Work item in the same change that resolves it, or when the issue no longer exists. Do not mark Work items as
done or keep resolved ones; Git history is the record. When a resolution changes only part of a Work item, update the
remaining wording and quotations instead.

# Work item format

Every Work item states the following, in this order:

| Part                  | Content                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category and priority | One of the categories below.                                                                                                                                                              |
| Affected              | Each affected specification's title and Spec ID, linked to the exact section.                                                                                                             |
| Batches               | The batch of each affected specification under [Batch sequence](work-plan.md#batch-sequence), or a statement that the specification has no batch and how its review is scheduled instead. |
| Current wording       | The exact current wording, quoted from the specification. Update the quotation when the wording changes without resolving the Work item.                                                  |
| Why it is an issue    | The rule or recorded decision it conflicts with, linked to its section.                                                                                                                   |
| Suggested resolution  | A proposed fix. It is a proposal only; the owning specification's review decides the actual change.                                                                                       |

The complete set of categories, in descending priority, is:

| Category                               | Meaning                                                                                                                                                                                   |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clear violation                        | The wording specifies a matter that [What belongs in a Design specification](../conventions/design-spec-conventions.md#what-belongs-in-a-design-specification) leaves to the implementer. |
| Contradiction with a recorded decision | The wording plans or requires something that a recorded decision in another section has already excluded.                                                                                 |
| Borderline                             | The underlying content belongs in a specification, but its wording describes a mechanism rather than an observable or designer-authored outcome.                                          |
| Other                                  | Any other defect, e.g. a terminology or consistency error.                                                                                                                                |

# Measuring rules

The Work items below were measured against these recorded rules and decisions:

- **Scope rule:** [What belongs in a Design specification](../conventions/design-spec-conventions.md#what-belongs-in-a-design-specification). A statement
  belongs only if it is Observable (a black-box test through the engine API, a save, or a replay could fail),
  Designer-authored (a GDR or a description of game behavior), or Vocabulary. Everything else is the implementer's choice.
- **Determinism decision:** [Determinism](../../design/foundation/determinism-and-randomness.md#determinism) and
  [Campaign seed](../../design/foundation/determinism-and-randomness.md#campaign-seed). Every Campaign has a Campaign seed, supplied by
  the Session controller at campaign creation or chosen by the engine, and every random outcome derives from it and
  from nothing else. The same Game build, initial Campaign configuration, Campaign seed, and ordered committed
  commands reproduce the same Campaign state. Determinism is required only within one
  implementation and Game build. How random outcomes are derived from the Campaign seed, the order of random draws,
  the order of Campaign instance creation within one command, and the sequence and format of generated Instance IDs
  are the implementer's choice. Acceptance examples assert replay equality, including from the same Campaign seed, or
  use fixed injected random outcomes, never which outcome a particular Campaign seed produces.
- **Creation decision:** creation of Campaign instances is specified by the specification of the creating
  behavior, under [Campaign instance creation](../../design/foundation/campaign-instances.md#campaign-instance-creation).
  The former Campaign instance constructor concept was removed.

# Work items

The Work items below were recorded from an audit on 2026-11-11. Quotations were checked against the specifications at
that time.

## Borderline

Borderline Work items concern content that belongs in a specification but is worded as a mechanism rather than as an
observable or designer-authored outcome.

### TODO-013: Snapshot and read wording for turn timing

**Category and priority:** Borderline, low priority.

**Affected:** Design Specification Conventions (DCONV),
[Writing exact rules](../conventions/design-spec-conventions.md#writing-exact-rules).

**Batches:** DCONV has no batch.

**Current wording:**

> - Which state snapshot supplies each input and when each effect becomes visible.

(CONV, Writing exact requirements checklist.)

**Why it is an issue:** Which values an input uses changes outcomes, so it is designer-authored and belongs in the
specifications. The wording, however, describes a mechanism (snapshots and reads) rather than the outcome.

**Suggested resolution:** Keep the content, and reword it in terms of outcomes, following
[Values a step uses](../../design/mechanics/turn-advancement.md#values-a-step-uses), e.g. "uses the value after the Training step", rather than snapshots and reads.

# Edge cases and failure behavior

If the quoted wording of a Work item changes without resolving it, update the quotation. If an affected section is
renamed or moved, update the link. If a Work item is found to be wrong, remove it and record the reasoning in the
commit message.

Recording a Work item does not authorize the change it suggests. When a Work item conflicts with a later decision, the
decision prevails and the Work item is revised or removed.

If the specifications affected by one Work item belong to several batches, the Work item may be resolved in the earliest
batch, or split so that each part is resolved with its own batch.

# Acceptance examples

These are workflow checks, not gameplay tests:

- **Resolution removes the Work item ([Adding and removing Work items](#adding-and-removing-work-items)):** A change
  rewrites the Engine Contract sentence about caches. The same change removes TODO-001. TODO-006 keeps its label.
- **New issue ([Adding and removing Work items](#adding-and-removing-work-items), [Work item format](#work-item-format)):**
  A reviewer finds an out-of-scope storage statement in Missions. They add TODO-021 under Clear violations, naming
  Missions and batch 6 from [Batch sequence](work-plan.md#batch-sequence), with the exact quoted wording.
