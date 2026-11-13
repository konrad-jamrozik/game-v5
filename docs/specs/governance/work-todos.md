# Outstanding Work Items

| Metadata    | Value                                            |
| ----------- | ------------------------------------------------ |
| Spec ID     | TODOS                                            |
| Family      | Governance                                       |
| Status      | Draft                                            |
| Audience    | Engine designer                                  |
| Conventions | [Specification conventions](spec-conventions.md) |

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
- **Determinism decision:** [Determinism](../foundation/engine-contract.md#determinism). Determinism is
  required only within one implementation and Game build. The order of random draws, the order of Campaign instance
  creation within one command, and the sequence and format of generated Instance IDs are the implementer's choice.
  Acceptance tests assert replay equality or use fixed injected random outcomes, never outcomes that depend on a
  particular seed.
- **Creation decision:** creation of Campaign instances is specified by the specification that owns the creating
  behavior, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation).
  The former Campaign instance constructor concept was removed.

# Work items

The Work items below were recorded from an audit on 2026-11-11. Quotations were checked against the specifications at
that time.

## Clear violations

### TODO-004: Random generator state required as a thing

**Category and priority:** Clear violation.

**Affected:** Developer API (DEV), [Edge cases and failure behavior](../interfaces/developer-api.md#edge-cases-and-failure-behavior).
Related wording question: Numbers and Randomness (NUMRNG), [Randomness contract](../foundation/numbers-and-randomness.md#randomness-contract).

**Batches:** NUMRNG is batch 2; DEV is batch 8.

**Current wording:**

> Invalid cheat inputs preserve Campaign state, RNG state, generated Instance IDs, reports, and history.

(DEV, Edge cases and failure behavior.)

> Only state changes, including Campaign instance creation, may consume gameplay randomness.

(NUMRNG, Randomness contract.)

**Why it is an issue:** These passages require a stored random generator and its state, but an implementation could
derive randomness without one. The scope rule admits only the observable requirement, which
[Determinism](../foundation/engine-contract.md#determinism) in Engine Contract now states: outcomes after undo, redo,
or load equal those of uninterrupted play, and rejected actions, actions with no effect, and queries do not change
later outcomes.

**Suggested resolution:** Reword the DEV sentence to say that invalid cheat inputs change nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity). Decide whether a seed is a
campaign creation input at all. Keep "consume gameplay randomness" in NUMRNG only if it is defined as designer
vocabulary meaning that the outcome of a state change depends on chance, and define it that way.

### TODO-006: Campaign instance constructor leftover in TypeScript Player API

**Category and priority:** Clear violation; also contradicts the creation decision.

**Affected:** TypeScript Player API (API), [Overview](../interfaces/typescript-api.md#overview).

**Batches:** API is batch 8.

**Current wording:**

> An operation creating a Campaign instance must satisfy
> [Campaign instances](../foundation/campaign-state.md#campaign-instances), with a declared return Type and
> initialization of Instance ID, Archetype, Constants, and State. Returning an existing Campaign instance or restoring
> its earlier State does not itself create a new Campaign instance.

**Why it is an issue:** This is the removed Campaign instance constructor concept without the word: it specifies code
that creates Campaign instances and that code's return Type. Creation is specified by the specification that owns the
creating behavior, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation), and
[Canonical terminology](spec-conventions.md#canonical-terminology) says not to specify which code creates a Campaign
instance or that code's signature.

**Suggested resolution:** Delete both sentences, or replace them with a reference stating that public operations whose
effects create Campaign instances do so as their owning specifications state under Campaign instance creation.

## Contradictions with the determinism decision

### TODO-007: Generator-state and draw planning in Numbers and Randomness

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Numbers and Randomness (NUMRNG): [Overview](../foundation/numbers-and-randomness.md#overview),
[Deterministic boundaries](../foundation/numbers-and-randomness.md#deterministic-boundaries),
[Edge cases and failure behavior](../foundation/numbers-and-randomness.md#edge-cases-and-failure-behavior), and
[Open decisions](../foundation/numbers-and-randomness.md#open-decisions).

**Batches:** NUMRNG is batch 2.

**Current wording:**

> Deterministic identity generation must preserve [Campaign instances](../foundation/campaign-state.md#campaign-instances); [...]

> This specification intends to refine [...] with numeric operations, reproducible generator-state evolution, and
> draw-consumption rules at query, command, and restoration boundaries.

> TODO: Specify Numeric units, integer/fractional quantities, percentages, probabilities, seeds, generator state, draws, and deterministic IDs.

(NUMRNG, Overview.)

> Decide whether no-op commands consume draws.

(NUMRNG, Deterministic boundaries.)

> TODO: Define behavior for Zero and one probabilities, inclusive/exclusive bounds, ties, extreme values, fractional thresholds, seed equivalence, and floating-point pitfalls.

(NUMRNG, Edge cases and failure behavior.)

> - TODO: Choose numeric representation and supported-runtime guarantees; gameplay randomness must still come from preserved generator state rather than Math.random().

(NUMRNG, Open decisions.)

**Why it is an issue:** [Determinism](../foundation/engine-contract.md#determinism) and NUMRNG's own
[Randomness contract](../foundation/numbers-and-randomness.md#randomness-contract) make the generator algorithm, the
order of draws, and Instance ID generation the implementer's choice. Generator state, draw consumption, and seeds are
not observable; the Open decision also names a JavaScript API and a mechanism. Whether no-op commands consume draws is
both unobservable and already settled observably by [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions):
actions with no effect consume no gameplay randomness.

**Suggested resolution:** Remove the planned generator-state, draw-consumption, seed, and deterministic-identifier
content and the "no-op commands" decision. Re-scope NUMRNG's randomness content to designer-authored distributions,
interval boundaries, and comparisons, plus the observable reproducibility requirement in TODO-004. Reword the Open
decision to cover only numeric representation, without naming an API.

### TODO-008: Draw ordering in Formulas and uncertainty

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Specification Conventions (CONV, Accepted), [Formulas and uncertainty](spec-conventions.md#formulas-and-uncertainty).

**Batches:** CONV has no batch; a change is a revision of an Accepted governance specification.

**Current wording:**

> For random rules, specify the distribution, draw timing and order, interval boundaries, success comparison, and which information is hidden.

(CONV, Formulas and uncertainty.)

**Why it is an issue:** The order of random draws is the implementer's choice under
[Determinism](../foundation/engine-contract.md#determinism), and
[What belongs in a specification](spec-conventions.md#what-belongs-in-a-specification) names it as an out-of-scope
example.

**Suggested resolution:** In CONV, replace "draw timing and order" with which Campaign state a random outcome depends on, stated as
an outcome rather than a draw order.

### TODO-009: Draw sites and draw fixtures in Combat

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Combat (COMBAT), [Combat calculations](../mechanics/combat.md#combat-calculations) and
[Acceptance examples](../mechanics/combat.md#acceptance-examples).

**Batches:** COMBAT is batch 5.

**Current wording:**

> Define random draw sites and reference NUMRNG conventions.

(COMBAT, Combat calculations TODO.)

> TODO: Give deterministic round-by-round fixtures with attacks, draws, damage, experience, and expected Battle results.

(COMBAT, Acceptance examples.)

**Why it is an issue:** Where random draws happen is not observable under the scope rule. Acceptance fixtures must use
fixed injected random outcomes under [Determinism](../foundation/engine-contract.md#determinism) and
[Examples, conformance, and evidence](spec-conventions.md#examples-conformance-and-evidence).

**Suggested resolution:** Replace "random draw sites" with the designer-authored random outcomes of each combat
calculation and their distributions. Replace "draws" in the fixture TODO with "fixed injected random outcomes".

### TODO-010: Seeded timelines in Factions

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Factions (FACTION), [Acceptance examples](../mechanics/factions.md#acceptance-examples).

**Batches:** FACTION is batch 7.

**Current wording:**

> TODO: Give seeded escalation/spawn timelines and compare temporary suppression with permanent defeat.

**Why it is an issue:** Acceptance tests must never assert outcomes that depend on a particular seed under
[Determinism](../foundation/engine-contract.md#determinism).

**Suggested resolution:** Replace "seeded" with timelines that use fixed injected random outcomes.

### TODO-011: Seed or RNG state in Campaign Integration and Acceptance Tests

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Campaign Integration and Acceptance Tests (SCEN), [Overview](../acceptance/campaign-integration-and-acceptance-tests.md#overview)
and [Glossary](../acceptance/campaign-integration-and-acceptance-tests.md#glossary).

**Batches:** SCEN has no batch; it is the Acceptance parallel track in
[Parallel GDR and acceptance work](work-plan.md#parallel-gdr-and-acceptance-work), grown with each batch.

**Current wording:**

> TODO: Specify Scenario fixture, game revision when needed for reproducibility, seed or RNG state, command sequence,
> expected state/view, and requirement reference.

(SCEN, Overview.)

> | Fixture | The GDRs, Campaign state, and fixed injected random outcomes or RNG state needed to reproduce a scenario |

(SCEN, Glossary.)

**Why it is an issue:** Seeds and RNG state are not fixture inputs under
[Determinism](../foundation/engine-contract.md#determinism) and SCEN's own
[Deterministic fixtures](../acceptance/campaign-integration-and-acceptance-tests.md#deterministic-fixtures); a fixture
uses fixed injected random outcomes, or a replay baseline for replay-equality checks.

**Suggested resolution:** Replace "seed or RNG state" with "injected random outcomes or replay baseline", matching the
Deterministic fixtures TODO, and drop "or RNG state" from the Fixture definition.

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
[Turn advancement](../foundation/engine-contract.md#turn-advancement), e.g. "uses values as of turn start" or
"uses the value after training", rather than snapshots and reads.

### TODO-015: Authoritative versus Derived as a storage decision

**Category and priority:** Borderline, low priority.

**Affected:** Domain Model (DOM), [Progression facts](../foundation/domain-model.md#progression-facts); Campaign State
Modeling Contract (CSTATE, Accepted), [Value classification](../foundation/campaign-state.md#value-classification).

**Batches:** DOM and CSTATE are batch 1.

**Current wording:**

> Wins and earned unlocks must be explicit Authoritative values in Campaign state with source references where applicable.

(DOM, Progression facts.)

> Each specification using these
> concepts must declare which of its values are Authoritative values and which are Derived values.

(CSTATE, Value classification.)

**Why it is an issue:** What is stored versus computed is normally the implementer's choice. The classification is in
scope only because Developer API full Campaign state inspection exposes Authoritative values, which makes it
observable; neither passage says so.

**Suggested resolution:** State that justification explicitly in CSTATE Value classification, as
[Campaign instance structure](../foundation/campaign-state.md#campaign-instance-structure) does for the
four-property shape, or drop the requirement if that justification is not wanted. This is a revision of an Accepted
specification.

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
  rewrites the Engine Contract sentence about caches. The same change removes TODO-001. TODO-004 keeps its label.
- **New issue ([Adding and removing Work items](#adding-and-removing-work-items), [Work item format](#work-item-format)):**
  A reviewer finds an out-of-scope storage statement in Missions. They add TODO-021 under Clear violations, naming
  Missions and batch 6 from [Batch sequence](work-plan.md#batch-sequence), with the exact quoted wording.
- **Accepted owner ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)):** TODO-015 affects Campaign State,
  which is Accepted. Its Value classification wording remains in force until the project owner
  accepts a revision.
