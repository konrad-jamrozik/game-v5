# Outstanding Work Items

| Metadata    | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Spec ID     | TODOS                                                                                    |
| Family      | Governance                                                                               |
| Status      | Draft                                                                                    |
| Audience    | Engine designer                                                                          |
| Owns        | Known outstanding specification issues awaiting scheduling, with their affected batches. |
| Conventions | [Specification conventions](spec-conventions.md)                                         |

# Overview

This document is the register of known outstanding issues in the registered specifications that should be addressed
eventually but are not yet scheduled. Each Work item records one issue completely enough that a reader with no other
context can act on it.

The [Specification Work Plan and Backlog](work-plan.md) owns the authoring sequence, the review batches, and their
work states. This document owns only the list of known issues awaiting scheduling. It names the batch of each affected
specification, as listed in [Batch sequence](work-plan.md#batch-sequence), so that a Work item can be handled when that
batch is drafted or reviewed. Recording a Work item here neither schedules it nor changes any batch or document status.

This document defines no game behavior, observable contract, or GDR, and it does not change the specifications it
cites. Each owning specification remains authoritative until it is revised. Links from Work items to other
specifications are ordinary citations, not relationships.

# Relationships

- Uses [Specification Work Plan and Backlog](work-plan.md)

# Glossary

Batch is defined by the [Specification Work Plan and Backlog glossary](work-plan.md#glossary).

| Term      | Definition                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Work item | One known outstanding issue in one or more registered specifications, recorded in this document until it is resolved or found obsolete. |

# Adding and removing Work items

Add a Work item when an issue is found that is not fixed in the same change. Give it the next unused label, the form
`TODO-NNN` with three digits, and a heading of the form `TODO-NNN: short title` under the matching category. Never
reuse a label. The label is a short handle for discussion; references from other documents link to the Work item's
heading, as required by [Writing exact requirements](spec-conventions.md#writing-exact-requirements).

Remove a Work item in the same change that resolves it, or when the issue no longer exists. Do not mark Work items as
done or keep resolved ones; Git history is the record. When a resolution changes only part of a Work item, update the
remaining wording and quotations instead.

# Work item format

Every Work item states the following, in this order:

| Part                  | Content                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category and priority | One of the categories below.                                                                                                                                                              |
| Affected              | Each affected specification's title and Spec ID, linked to the exact section, with that specification's Status when it is Accepted.                                                       |
| Batches               | The batch of each affected specification under [Batch sequence](work-plan.md#batch-sequence), or a statement that the specification has no batch and how its review is scheduled instead. |
| Current wording       | The exact current wording, quoted from the specification. Update the quotation when the wording changes without resolving the Work item.                                                  |
| Why it is an issue    | The rule or recorded decision it conflicts with, linked to its section.                                                                                                                   |
| Suggested resolution  | A proposed fix. It is a proposal only; the owning specification's review decides the actual change.                                                                                       |

The complete set of categories, in descending priority, is:

| Category                               | Meaning                                                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clear violation                        | The wording specifies a matter that [What belongs in a specification](spec-conventions.md#what-belongs-in-a-specification) leaves to the implementer. |
| Contradiction with a recorded decision | The wording plans or requires something that a recorded decision in another section has already excluded.                                             |
| Borderline                             | The underlying content belongs in a specification, but its wording describes a mechanism rather than an observable or designer-authored outcome.      |
| Other                                  | Any other defect, e.g. a terminology or consistency error.                                                                                            |

# Measuring rules

The Work items below were measured against these recorded rules and decisions:

- **Scope rule:** [What belongs in a specification](spec-conventions.md#what-belongs-in-a-specification). A statement
  belongs only if it is Observable (a black-box test through the engine API, a save, or a replay could fail),
  Designer-authored (a GDR or a description of game behavior), or Vocabulary. Everything else is the implementer's choice.
- **Determinism decision:** [Determinism](../foundation/determinism-and-randomness.md#determinism) and
  [Campaign seed](../foundation/determinism-and-randomness.md#campaign-seed). Every Campaign has a Campaign seed, supplied by
  the Session controller at campaign creation or chosen by the engine, and every random outcome derives from it and
  from nothing else. The same Game build, initial Campaign configuration, Campaign seed, and ordered committed
  commands reproduce the same Campaign state and retained reports. Determinism is required only within one
  implementation and Game build. How random outcomes are derived from the Campaign seed, the order of random draws,
  the order of Campaign instance creation within one command, and the sequence and format of generated Instance IDs
  are the implementer's choice. Acceptance examples assert replay equality, including from the same Campaign seed, or
  use fixed injected random outcomes, never which outcome a particular Campaign seed produces.
- **Creation decision:** creation of Campaign instances is specified by the specification that owns the creating
  behavior, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation).
  The former Campaign instance constructor concept was removed.

# Work items

The Work items below were recorded from an audit on 2026-11-11. Quotations were checked against the specifications at
that time.

## Contradictions with the determinism decision

### TODO-009: Draw fixtures in Combat

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Combat (COMBAT), [Acceptance examples](../mechanics/combat.md#acceptance-examples).

**Batches:** COMBAT is batch 5.

**Current wording:**

> TODO: Give deterministic round-by-round fixtures with attacks, draws, damage, experience, and expected Battle results.

**Why it is an issue:** Random draws are not observable under the scope rule. Acceptance fixtures must use fixed
injected random outcomes, each identified by the name its rule gives it, under
[Determinism](../foundation/determinism-and-randomness.md#determinism) and
[Examples, conformance, and evidence](spec-conventions.md#examples-conformance-and-evidence).

**Suggested resolution:** Replace "draws" in the fixture TODO with "fixed injected random outcomes".

### TODO-010: Seeded timelines in Factions

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Factions (FACTION), [Acceptance examples](../mechanics/factions.md#acceptance-examples).

**Batches:** FACTION is batch 7.

**Current wording:**

> TODO: Give seeded escalation/spawn timelines and compare temporary suppression with permanent defeat.

**Why it is an issue:** Acceptance examples must never assert which outcome a particular Campaign seed produces,
under [Determinism](../foundation/determinism-and-randomness.md#determinism), because how outcomes derive from the Campaign seed
is the implementer's choice.

**Suggested resolution:** Replace "seeded" with timelines that use fixed injected random outcomes.

### TODO-012: Sampling time of hidden difficulty in Investigations

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Investigations (INVSTG), [Start and progress](../mechanics/investigations.md#start-and-progress).

**Batches:** INVSTG is batch 4.

**Current wording:**

> TODO: Specify eligibility, hidden-difficulty distribution and sampling time, agent contribution, sublinear team scaling, transit treatment, and when progress is added.

**Why it is an issue:** The hidden-difficulty distribution is designer-authored, but when it is sampled is not
observable, because hidden difficulty is not Player-visible information either way.

**Suggested resolution:** Replace "and sampling time" with the observable consequence, e.g. whether hidden
difficulty is fixed for the whole Investigation and which Campaign state it may depend on.

## Borderline

### TODO-013: Snapshot and read wording for turn timing

**Category and priority:** Borderline, low priority.

**Affected:** Specification Conventions (CONV, Accepted),
[Writing exact requirements](spec-conventions.md#writing-exact-requirements). Combat (COMBAT), [Battle flow](../mechanics/combat.md#battle-flow).
Investigations (INVSTG), [Team changes and commitment](../mechanics/investigations.md#team-changes-and-commitment).

**Batches:** COMBAT is batch 5; INVSTG is batch 4. CONV has no batch.

**Current wording:**

> - Which state snapshot supplies each input and when each effect becomes visible.

(CONV, Writing exact requirements checklist.)

> TODO: Specify initial snapshots, participation, round/side order, [...]

(COMBAT, Battle flow.)

> TODO: Specify effective-skill-weighted progress loss on removal, the weighting snapshot, [...]

(INVSTG, Team changes and commitment.)

**Why it is an issue:** Which values an input uses changes outcomes, so it is designer-authored and belongs in the
specifications. The wording, however, describes a mechanism (snapshots and reads) rather than the outcome.

**Suggested resolution:** Keep the content, and reword it in terms of outcomes, following
[Values a step uses](../mechanics/turn-advancement.md#values-a-step-uses), e.g. "uses the value after the Training step", rather than snapshots and reads.

## Other

### TODO-018: Must in Gameplay Dependency Direction

**Category and priority:** Other.

**Affected:** Gameplay Dependency Direction (DEPDIR), [Dependency direction](../implementation/gameplay-dependency-direction.md#dependency-direction).

**Batches:** DEPDIR has no batch; it is an Implementation document outside the batch sequence.

**Current wording:**

> Gameplay functions must receive only the inputs and dependencies they need; they must not reach any other part of
> Campaign state, directly or indirectly. This includes the code that creates Campaign instances during gameplay.
> Campaign instances must not hold references to the Campaign state that contains them.

**Why it is an issue:** [Specification families and paths](spec-conventions.md#specification-families-and-paths) says
Implementation documents are non-behavioural and [What belongs in a specification](spec-conventions.md#what-belongs-in-a-specification)
says such steering is never a requirement, while [Writing exact requirements](spec-conventions.md#writing-exact-requirements)
reserves "must" for requirements.

**Suggested resolution:** Replace "must" with "should" and label the section as guidance, or state in DEPDIR what
"must" means inside an Implementation document.

# Edge cases and failure behavior

If the quoted wording of a Work item changes without resolving it, update the quotation. If an affected section is
renamed or moved, update the link. If a Work item is found to be wrong, remove it and record the reasoning in the
commit message.

When a Work item affects an Accepted specification, its resolution is a revision presented to the project owner, under
[Status](spec-conventions.md#status); recording it here does not authorize the change. When a Work item conflicts with
a later decision, the decision prevails and the Work item is revised or removed.

If the specifications affected by one Work item belong to several batches, the Work item may be resolved in the earliest
batch, or split so that each part is resolved with its own batch.

# Acceptance examples

These are workflow checks, not gameplay tests:

- **Resolution removes the Work item ([Adding and removing Work items](#adding-and-removing-work-items)):** A change
  rewrites the Engine Contract sentence about caches. The same change removes TODO-001. TODO-006 keeps its label.
- **New issue ([Adding and removing Work items](#adding-and-removing-work-items), [Work item format](#work-item-format)):**
  A reviewer finds an out-of-scope storage statement in Missions. They add TODO-021 under Clear violations, naming
  Missions and batch 6 from [Batch sequence](work-plan.md#batch-sequence), with the exact quoted wording.
- **Accepted owner ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)):** TODO-013 affects Specification
  Conventions, which is Accepted. Its Writing exact requirements wording remains in force until the project owner
  accepts a revision.
