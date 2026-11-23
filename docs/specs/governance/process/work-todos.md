# Outstanding Work Items

| Metadata    | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Spec ID     | TODOS                                                                                    |
| Family      | Process                                                                                  |
| Audience    | Engine designer                                                                          |
| Owns        | Known outstanding specification issues awaiting scheduling, with their affected batches. |
| Conventions | [Specification Conventions](../conventions/spec-conventions.md)                          |

# Overview

Reviewing the specifications keeps turning up problems that cannot all be fixed at once. A Work item records one such issue in the registered specifications, one that should be addressed eventually but is not yet scheduled, completely enough that a reader with no other context can act on it.

Each Work item is tied to the review that will settle it: it names the [Batch](work-plan.md#glossary) of each affected specification, so that it can be handled when that Batch is reviewed. Recording a Work item neither schedules it nor changes any Batch status, and each specification remains authoritative until it is revised. A link from a Work item to a specification is a citation, not a relationship.

# Glossary

| Term | Definition |
| --- | --- |
| Work item | One known outstanding issue in one or more [registered](../conventions/spec-conventions.md#specifications) [specifications](../conventions/spec-conventions.md#specifications), recorded in this document until it is resolved or found obsolete. |

# Adding and removing Work items

Add a Work item when an issue is found that is not fixed in the same change. Give it the next unused label, the form `TODO-NNN` with three digits, and a heading of the form `TODO-NNN: short title` under the matching category. Never reuse a label. The label is a short handle for discussion; other documents link to the Work item's heading.

Remove a Work item in the same change that resolves it, when the issue no longer exists, or when it is found to be wrong, with the reasoning in the commit message. Do not mark Work items as done or keep resolved ones; Git history is the record. When a resolution changes only part of a Work item, update the remaining wording and quotations instead. When a Work item conflicts with a later decision, the decision takes precedence and the Work item is revised or removed. A Work item whose specifications belong to several batches may be resolved in the earliest of them, or split so that each part is resolved with its own batch.

# Work item format

Every Work item states the following, in this order:

| Part | Content |
| --- | --- |
| Category and priority | One of the categories below. |
| Affected | Each affected specification's title and Spec ID, linked to the exact section. |
| Batches | The batch of each affected specification in the [Batch sequence](work-plan.md#batch-sequence), or a statement that the specification has no batch and how its review is scheduled instead. |
| Current wording | The exact current wording, quoted from the specification. Update the quotation when the wording changes without resolving the Work item. |
| Why it is an issue | The rule or recorded decision it conflicts with, linked to its section. |
| Suggested resolution | A proposed fix. It is a proposal only; the owning specification's review decides the actual change. |

The categories, in descending priority, are:

| Category | Meaning |
| --- | --- |
| Clear violation | The wording states something that [a Design specification never states](../conventions/design-spec-conventions.md#what-belongs-in-a-design-specification). |
| Contradiction with a recorded decision | The wording plans or requires something that a recorded decision in another section has already excluded. |
| Borderline | The underlying content belongs in a specification, but its wording describes a mechanism rather than the decision. |
| Other | Any other defect, e.g. a terminology or consistency error. |
