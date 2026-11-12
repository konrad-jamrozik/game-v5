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

This document defines no gameplay Rule, observable contract, or GDR, and it does not change the specifications it
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
| Other                                  | Any other defect, for example a terminology or consistency error.                                                                                     |

# Measuring rules

The Work items below were measured against these recorded rules and decisions:

- **Scope rule:** [What belongs in a specification](spec-conventions.md#what-belongs-in-a-specification). A statement
  belongs only if it is Observable (a black-box test through the engine API, a save, or a replay could fail),
  Designer-authored (a GDR or Rule), or Vocabulary. Everything else is the implementer's choice.
- **Determinism decision:** [Continuation state](../foundation/engine-contract.md#continuation-state). Determinism is
  required only within one implementation and Game build. The order of random draws, the order of Campaign instance
  creation within one command, and the sequence and format of generated Instance IDs are the implementer's choice.
  Acceptance tests assert replay equality or use fixed injected random outcomes, never outcomes that depend on a
  particular seed.
- **Creation decision:** creation of Campaign instances is specified as Creation Rules under
  [Rule kinds](../foundation/core-concepts.md#rule-kinds) and
  [Campaign instance creation](../foundation/campaign-modeling-contract.md#campaign-instance-creation). The former
  Campaign instance constructor concept was removed.

# Work items

The Work items below were recorded from an audit on 2026-11-11. Quotations were checked against the specifications at
that time.

## Clear violations

### TODO-001: Cache wording in Derived value consistency

**Category and priority:** Clear violation.

**Affected:** Engine Contract (ENG), [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency);
History and Persistence (HIST), [Refined Engine Contract guarantees](../foundation/history-and-persistence.md#refined-engine-contract-guarantees)
and [Campaign configuration persistence](../foundation/history-and-persistence.md#campaign-configuration-persistence).
Related, lower priority: Campaign Modeling Contract (CMC, Accepted),
[Value classification](../foundation/campaign-modeling-contract.md#value-classification); Core Concepts (CORE),
[Authoritative and Derived values](../foundation/core-concepts.md#authoritative-and-derived-values).

**Batches:** ENG, CMC, and CORE are batch 1; HIST is batch 2.

**Current wording:**

> Caches must be updated or invalidated when their inputs change, including after restoration. Restored reports and
> Player-visible information must correspond to the restored cursor rather than a discarded future.

(ENG, Derived value consistency.)

> [...] with cache invalidation, restoration of complete continuation state, and atomic undo/redo and load procedures.

(HIST, Refined Engine Contract guarantees.)

> Detail checkpoint replacement at the same position, discarded-future removal across Autopilot AIs, late-result
> rejection, and cache invalidation.

(HIST, a TODO under Campaign configuration persistence.)

Related permissive clarifications:

> Authoritative value and Derived value, including their independence from mutability, caching, and player visibility,

(CMC, Value classification.)

> Caching a current calculation does not change its classification as a Derived value.

(CORE, Authoritative and Derived values, which also says "Caching the total does not make it an Authoritative value".)

**Why it is an issue:** Whether caches exist is the implementer's choice under the scope rule; only the consistency of
returned values is observable. The second ENG sentence already states the observable part.

**Suggested resolution:** In ENG, delete the cache sentence and state only the observable consistency, for example
that every query result, report, and Player-visible information after any action or restoration equals what would be
computed from the current Campaign state. Remove "cache invalidation" from both HIST passages. The CMC and CORE
sentences are permissive and do not prescribe caches; consider dropping them for consistency, which for CMC is a
revision of an Accepted specification.

### TODO-002: Replay prescribed as the restore mechanism in Save size limit

**Category and priority:** Clear violation.

**Affected:** History and Persistence (HIST), [Save size limit](../foundation/history-and-persistence.md#save-size-limit)
and its example in [Acceptance examples](../foundation/history-and-persistence.md#acceptance-examples).

**Batches:** HIST is batch 2.

**Current wording:**

> Every Campaign save has a Baseline and the action history after it. Restoring any position replays action history
> from the Baseline. A save written with its full history has the initial Campaign state as its Baseline.

> After such a save is loaded, the Baseline is the earliest position: undo before it is unavailable, and replay of
> later actions starts from it.

The acceptance example "History dropped at the size limit" also ends "and new actions replay from it".

**Why it is an issue:** It prescribes replay as the restoration mechanism, which conflicts with
[Continuation state](../foundation/engine-contract.md#continuation-state): "Internal restoration may use snapshots or
replay, provided observable results are equal."

**Suggested resolution:** Keep Baseline as the earliest position a Campaign save can restore, as its glossary
definition already says, and state only the observable effects: positions before the Baseline are unavailable to
undo, and positions after it are restored with results equal to uninterrupted play. Reword the acceptance example
accordingly.

### TODO-003: History and Persistence remit is mostly implementation

**Category and priority:** Clear violation.

**Affected:** History and Persistence (HIST): [Refined Engine Contract guarantees](../foundation/history-and-persistence.md#refined-engine-contract-guarantees),
[Undo and redo](../foundation/history-and-persistence.md#undo-and-redo),
[Replay and persistence](../foundation/history-and-persistence.md#replay-and-persistence),
[Campaign configuration persistence](../foundation/history-and-persistence.md#campaign-configuration-persistence),
[Edge cases and failure behavior](../foundation/history-and-persistence.md#edge-cases-and-failure-behavior), and
[Open decisions](../foundation/history-and-persistence.md#open-decisions). Engine Contract (ENG):
[Action history and turn navigation](../foundation/engine-contract.md#action-history-and-turn-navigation),
[Autopilot memory](../foundation/engine-contract.md#autopilot-memory), and
[Save and load](../foundation/engine-contract.md#save-and-load). Related: TypeScript Player API (API),
[Overview](../interfaces/typescript-api.md#overview).

**Batches:** HIST is batch 2; ENG is batch 1; API is batch 8.

**Current wording:** HIST plans implementation content in these places:

> [...] with restoration procedures, checkpoint storage, the Save size limit, and encoding.

(HIST, Refined Engine Contract guarantees.)

> TODO: Specify storage and restoration procedures for atomic Player API and Developer API action-history entries,
> complete continuation state, memory checkpoints, and retained redo continuation under Engine Contract.
> Represent Turn-start checkpoints using
> Engine Contract navigation targets; [...]

(HIST, Undo and redo.)

> TODO: Specify save encoding, load validation, and replay procedures under [...]

(HIST, Replay and persistence.)

> TODO: Specify storage separation between Campaign state and Controller continuation data within a Campaign save.

(HIST, Campaign configuration persistence.)

> Define representation of partially retained futures without changing Engine Contract navigation targets.

(HIST, Edge cases and failure behavior.)

> - TODO: Choose checkpoint storage, save encoding, and storage versioning.

(HIST, Open decisions.)

ENG delegates the same matters to HIST:

> History and Persistence owns restoration procedures and representation, not alternative navigation targets.

(ENG, Action history and turn navigation.)

> History and Persistence owns encoding and checkpoint storage procedures.

(ENG, Autopilot memory.)

> Encoding, the save size limit, validation, and storage failure procedures belong to History and Persistence.

(ENG, Save and load.)

API also says "History and Persistence supplies storage and restoration procedures."

**Why it is an issue:** [Game build compatibility](../foundation/engine-contract.md#game-build-compatibility) does not
require saves to be compatible across Game builds, so save encoding, checkpoint storage, storage versioning, and
storage and restoration procedures are not observable through a black-box test and are the implementer's choice under
the scope rule. The observable content HIST owns is the configuration cascade, the Save size limit, load validation
and failure behavior, and what a Campaign save restores.

**Suggested resolution:** Re-scope HIST to its observable content: [Configuration cascade](../foundation/history-and-persistence.md#configuration-cascade),
[Save size limit](../foundation/history-and-persistence.md#save-size-limit), which saves load or are rejected and the
resulting Session, and what a Campaign save restores. Delete or rewrite the TODOs and Open decisions above. Reword the
three ENG sentences and the API sentence to delegate only the observable save and load behavior to HIST.

### TODO-004: Random generator state required as a thing

**Category and priority:** Clear violation.

**Affected:** Engine Contract (ENG): [Continuation state](../foundation/engine-contract.md#continuation-state),
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions),
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity), and
[Acceptance examples](../foundation/engine-contract.md#acceptance-examples). Developer API (DEV),
[Edge cases and failure behavior](../interfaces/developer-api.md#edge-cases-and-failure-behavior). History and
Persistence (HIST), [Refined Engine Contract guarantees](../foundation/history-and-persistence.md#refined-engine-contract-guarantees),
[Storage containers](../foundation/history-and-persistence.md#storage-containers), and
[Acceptance examples](../foundation/history-and-persistence.md#acceptance-examples). Related wording question: Core
Concepts (CORE), [Properties that are not Rule kinds](../foundation/core-concepts.md#properties-that-are-not-rule-kinds).

**Batches:** ENG and CORE are batch 1; HIST is batch 2; DEV is batch 8.

**Current wording:**

> For equal initial Campaign state, the same Game build, and the same ordered committed commands, execution must
> produce equal resulting Campaign state, generated Instance IDs, gameplay RNG state, and retained reports. Campaign
> state must preserve every input consulted by Rules, including relevant History, current RNG state, and Instance ID
> generation state. An initial random seed alone is insufficient unless it determines the complete restored generator
> position.

(ENG, Continuation state.)

> Rejected actions and actions with no effect commit no action-history entry and consume
> no gameplay randomness or generated Instance IDs.

(ENG, Player queries and actions.)

> Rejected requests leave Campaign state, gameplay RNG state, Instance ID generation state, reports, action history,
> and memory unchanged.

(ENG, Committed state integrity.)

> Complete Campaign state, RNG state, generated Instance IDs, and retained reports equal the original results.

(ENG, Acceptance examples, "Action replay".)

> Invalid cheat inputs preserve Campaign state, RNG state, generated Instance IDs, reports, and history.

(DEV, Edge cases and failure behavior.)

> [...] Numbers and Randomness supplies numeric and generator-state contracts.

(HIST, Refined Engine Contract guarantees.)

> TODO: Specify action-level and turn-level restoration and save/load scenarios comparing complete Campaign state,
> generated Instance IDs, RNG state, reports, and applicable Autopilot memory.

(HIST, Acceptance examples.)

HIST Storage containers also says "Two Campaigns created with equal Campaign configuration and seed and given equal
commands have equal Campaign state".

> - **Randomness:** whether a Rule consumes gameplay randomness.

(CORE, Properties that are not Rule kinds.)

**Why it is an issue:** These passages require a stored random generator and its state, but an implementation could
derive randomness without one. The scope rule admits only the observable requirement: outcomes after replay, undo,
redo, or load equal those of uninterrupted play, and rejected actions, actions with no effect, and queries do not change
later outcomes.

**Suggested resolution:** Replace the generator-state requirements with that observable requirement, and compare
complete Campaign state, Player-visible information, and reports rather than RNG state in acceptance examples. Decide
whether a seed is a campaign creation input at all. Keep "consumes gameplay randomness" in CORE only if it is defined
as designer vocabulary meaning that the Rule's outcome depends on chance, and define it that way.

### TODO-005: Mandated identifier format in Unique identifiers

**Category and priority:** Clear violation.

**Affected:** Engine Contract (ENG), [Unique identifiers](../foundation/engine-contract.md#unique-identifiers);
History and Persistence (HIST), [Glossary](../foundation/history-and-persistence.md#glossary).

**Batches:** ENG is batch 1; HIST is batch 2.

**Current wording:**

> Generated deterministically from Campaign state under its owning contract; never a ULID or any other format that
> consults wall-clock time or fresh randomness.

(ENG, Unique identifiers, "Required format" cell for Campaign-scoped identifier.)

> A [ULID](https://github.com/ulid/spec) (Universally Unique Lexicographically Sortable Identifier).

(ENG, Unique identifiers, "Required format" cell for Independent identifier, whose examples are Campaign IDs and
Campaign save IDs. The following paragraph adds "Do not specify a GUID, UUID, or other format for an Independent
identifier unless a ULID cannot satisfy a stated technical requirement".)

> The ULID identifying one Campaign, assigned when the Campaign is created and recorded in every Campaign save of that
> Campaign.

> The ULID identifying one Campaign save, assigned when that Campaign save is created.

(HIST, Glossary definitions of Campaign ID and Campaign save ID.)

**Why it is an issue:** The determinism decision in [Continuation state](../foundation/engine-contract.md#continuation-state)
made the sequence and format of Instance IDs the implementer's choice; the same reasoning applies to Campaign IDs and
Campaign save IDs. Only uniqueness, stability, and whether replay must reproduce the identifier are observable.

**Suggested resolution:** Keep the two-way classification of Campaign-scoped identifiers and Independent identifiers,
defined by whether replay must reproduce the identifier. Drop the "Required format" column and the ULID mandate,
unless a player-facing reason is stated, for example save lists sortable by creation time. Change the HIST glossary
definitions to "The Independent identifier identifying [...]".

### TODO-006: Campaign instance constructor leftover in TypeScript Player API

**Category and priority:** Clear violation; also contradicts the creation decision.

**Affected:** TypeScript Player API (API), [Overview](../interfaces/typescript-api.md#overview).

**Batches:** API is batch 8.

**Current wording:**

> An operation creating a Campaign instance must satisfy
> [Campaign instances](../foundation/campaign-modeling-contract.md#campaign-instances), with a declared return Type and
> initialization of Instance ID, Archetype, Constants, and State. Returning an existing Campaign instance or restoring
> its earlier State does not itself create a new Campaign instance.

**Why it is an issue:** This is the removed Campaign instance constructor concept without the word: it specifies code
that creates Campaign instances and that code's return Type. Creation is specified as Creation Rules under
[Campaign instance creation](../foundation/campaign-modeling-contract.md#campaign-instance-creation), and
[Canonical terminology](spec-conventions.md#canonical-terminology) says not to specify which code creates a Campaign
instance or that code's signature.

**Suggested resolution:** Delete both sentences, or replace them with a reference stating that public operations whose
effects create Campaign instances do so under the applicable Creation Rules.

## Contradictions with the determinism decision

### TODO-007: Generator-state and draw planning in Numbers and Randomness

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Numbers and Randomness (NUMRNG): [Overview](../foundation/numbers-and-randomness.md#overview),
[Deterministic boundaries](../foundation/numbers-and-randomness.md#deterministic-boundaries),
[Edge cases and failure behavior](../foundation/numbers-and-randomness.md#edge-cases-and-failure-behavior), and
[Open decisions](../foundation/numbers-and-randomness.md#open-decisions).

**Batches:** NUMRNG is batch 2.

**Current wording:**

> Deterministic identity generation must preserve [Campaign instances](../foundation/campaign-modeling-contract.md#campaign-instances); [...]

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

**Why it is an issue:** [Continuation state](../foundation/engine-contract.md#continuation-state) and NUMRNG's own
[Randomness contract](../foundation/numbers-and-randomness.md#randomness-contract) make the generator algorithm, the
order of draws, and Instance ID generation the implementer's choice. Generator state, draw consumption, and seeds are
not observable; the Open decision also names a JavaScript API and a mechanism. Whether no-op commands consume draws is
both unobservable and already settled observably by [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions):
actions with no effect consume no gameplay randomness.

**Suggested resolution:** Remove the planned generator-state, draw-consumption, seed, and deterministic-identifier
content and the "no-op commands" decision. Re-scope NUMRNG's randomness content to designer-authored distributions,
interval boundaries, and comparisons, plus the observable reproducibility requirement in TODO-004. Reword the Open
decision to cover only numeric representation, without naming an API.

### TODO-008: Draw ordering in Turn Resolution and Formulas and uncertainty

**Category and priority:** Contradiction with a recorded decision.

**Affected:** Turn Resolution (TURN), [Overview](../foundation/turn-resolution.md#overview).
Related: Specification Conventions (CONV, Accepted), [Formulas and uncertainty](spec-conventions.md#formulas-and-uncertainty).

**Batches:** TURN is batch 7. CONV has no batch; a change is a revision of an Accepted governance specification.

**Current wording:**

> It uses Domain Model's valid-state constraints and Numbers and Randomness's arithmetic and draw ordering.

(TURN, Overview.)

> For random rules, specify the distribution, draw timing and order, interval boundaries, success comparison, and which information is hidden.

(CONV, Formulas and uncertainty.)

**Why it is an issue:** The order of random draws is the implementer's choice under
[Continuation state](../foundation/engine-contract.md#continuation-state), and
[What belongs in a specification](spec-conventions.md#what-belongs-in-a-specification) names it as an out-of-scope
example. The CONV sentence was not in the original audit finding; it was noticed while recording this Work item.

**Suggested resolution:** In TURN, replace "arithmetic and draw ordering" with "arithmetic and random-outcome
contracts". In CONV, replace "draw timing and order" with which Campaign state a random outcome depends on, stated as
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
fixed injected random outcomes under [Continuation state](../foundation/engine-contract.md#continuation-state) and
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
[Continuation state](../foundation/engine-contract.md#continuation-state).

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
[Continuation state](../foundation/engine-contract.md#continuation-state) and SCEN's own
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

**Suggested resolution:** Replace "and sampling time" with the observable consequence, for example whether hidden
difficulty is fixed for the whole Investigation and which Campaign state it may depend on.

## Borderline

### TODO-013: Snapshot and read wording for turn timing

**Category and priority:** Borderline, low priority.

**Affected:** Turn Resolution (TURN), [Overview](../foundation/turn-resolution.md#overview),
[Overview](../foundation/turn-resolution.md#overview), and
[Phase schedule](../foundation/turn-resolution.md#phase-schedule). Specification Conventions (CONV, Accepted),
[Writing exact requirements](spec-conventions.md#writing-exact-requirements). Combat (COMBAT), [Battle flow](../mechanics/combat.md#battle-flow).
Economy and Upgrades (ECON), [Income and costs](../mechanics/economy-and-upgrades.md#income-and-costs).
Investigations (INVSTG), [Team changes and commitment](../mechanics/investigations.md#team-changes-and-commitment).

**Batches:** TURN is batch 7; COMBAT is batch 5; ECON is batch 3; INVSTG is batch 4. CONV has no batch.

**Current wording:**

> Define exactly when subsystem rules run and which state each phase reads.

(TURN, Overview; the register's Owns column for TURN repeats "which state each phase reads".)

> [...] by specifying calculation snapshots, ordered phases, and the atomic publication boundary.

(TURN, Overview.)

> Identify start-of-turn snapshots versus updated-state reads.

(TURN, Phase schedule TODO.)

> - Which state snapshot supplies each input and when each effect becomes visible.

(CONV, Writing exact requirements checklist.)

> TODO: Specify initial snapshots, participation, round/side order, [...]

(COMBAT, Battle flow.)

> [...] identify evaluation snapshots through TURN and distinguish cash from income rate.

(ECON, Income and costs TODO.)

> TODO: Specify effective-skill-weighted progress loss on removal, the weighting snapshot, [...]

(INVSTG, Team changes and commitment.)

**Why it is an issue:** Which values an input uses changes outcomes, so it is designer-authored and belongs in the
specifications. The wording, however, describes a mechanism (snapshots and reads) rather than the outcome.

**Suggested resolution:** Keep the content, and reword it in terms of outcomes, for example "uses values as of turn
start" or "uses values after the preceding phase's effects", rather than snapshots and reads.

### TODO-014: Mechanism wording in API hierarchy and Autopilot limits

**Category and priority:** Borderline, low priority.

**Affected:** Engine Contract (ENG), [API hierarchy](../foundation/engine-contract.md#api-hierarchy) and
[Autopilot limits](../foundation/engine-contract.md#autopilot-limits).

**Batches:** ENG is batch 1.

**Current wording:**

> Passing a restricted facade without enforcing its
> restrictions is insufficient.

> An Autopilot AI must not receive the unrestricted engine object or an alternative CLI or Web UI path to Session API
> or Developer API operations.

(ENG, API hierarchy.)

> The engine drives each Autopilot engagement: it repeatedly invokes the Autopilot AI to choose its next Player API
> action, during which the AI may make Player API queries and Autopilot memory operations, until Autopilot disengages.

(ENG, Autopilot limits.)

**Why it is an issue:** The underlying rules are observable: an Autopilot AI cannot reach Session API or Developer API
operations, and it does not decide when an Autopilot engagement ends. The wording names mechanisms (facades, the
engine object, the invocation loop) instead.

**Suggested resolution:** Keep the rules and state them as observable outcomes, for example "No operation available to
an Autopilot AI reaches a Session API or Developer API operation", and "An Autopilot engagement ends only under the
disengagement reasons in Autopilot lifecycle and concurrency".

### TODO-015: Authoritative versus Derived as a storage decision

**Category and priority:** Borderline, low priority.

**Affected:** Domain Model (DOM), [Progression facts](../foundation/domain-model.md#progression-facts); Campaign
Modeling Contract (CMC, Accepted), [Value classification](../foundation/campaign-modeling-contract.md#value-classification).

**Batches:** DOM and CMC are batch 1.

**Current wording:**

> Wins and earned unlocks must be explicit Authoritative values in Campaign state with source references where applicable.

(DOM, Progression facts.)

> Each specification using these
> concepts must declare which of its values are Authoritative values and which are Derived values.

(CMC, Value classification.)

**Why it is an issue:** What is stored versus computed is normally the implementer's choice. The classification is in
scope only because Developer API full Campaign state inspection exposes Authoritative values, which makes it
observable; neither passage says so.

**Suggested resolution:** State that justification explicitly in CMC Value classification, as
[Campaign instance structure](../foundation/campaign-modeling-contract.md#campaign-instance-structure) does for the
four-property shape, or drop the requirement if that justification is not wanted. This is a revision of an Accepted
specification.

### TODO-016: Storage disclaimers in Domain Model

**Category and priority:** Borderline, low priority.

**Affected:** Domain Model (DOM), [Overview](../foundation/domain-model.md#overview),
[Agent](../foundation/domain-model.md#agent), and
[Current versus historical teams](../foundation/domain-model.md#current-versus-historical-teams).

**Batches:** DOM is batch 1.

**Current wording:**

> Conceptual records may be embedded, separately stored, or reconstructed provided their identity and meaning are preserved.

(DOM, Overview.)

> [...] this model does not require duplicate stored records.

(DOM, Agent.)

> If both agent-side and team-side links are stored, they must agree in Committed state.

(DOM, Current versus historical teams.)

**Why it is an issue:** These sentences are permissive rather than prescriptive, but they discuss storage, which the
scope rule now leaves to the implementer without any need for disclaimers. The third sentence is conditional on a
storage choice; its observable content is that every view of the relationship agrees.

**Suggested resolution:** Drop the first two sentences. Reword the third as an observable consistency requirement, for
example that Agent-side and team-side views of current membership agree, or drop it if Current versus historical
teams already implies it.

### TODO-017: Autopilot memory checkpoints as mechanism wording

**Category and priority:** Borderline, low priority.

**Affected:** Engine Contract (ENG), [Autopilot memory](../foundation/engine-contract.md#autopilot-memory) and the
Autopilot memory row of the [Glossary](../foundation/engine-contract.md#glossary); History and Persistence (HIST),
[Storage containers](../foundation/history-and-persistence.md#storage-containers),
[Controller state](../foundation/history-and-persistence.md#controller-state), and the
[Glossary](../foundation/history-and-persistence.md#glossary).

**Batches:** ENG is batch 1; HIST is batch 2.

**Current wording:**

> Memory is isolated by Campaign, Autopilot AI identity, and timeline branch, and is checkpointed at its history
> position. Later Autopilot engagements for the same Autopilot AI read the applicable checkpoint. At a given position,
> subsequent writes replace its applicable checkpoint; [...]

(ENG, Autopilot memory. The ENG glossary says Autopilot memory "is checkpointed at history positions", and HIST lists
"Autopilot memory checkpoints" in Storage containers and in the Controller continuation data definition.)

**Why it is an issue:** The observable rule is which Autopilot memory `autopilotMemory.read()` returns at a history
position on a timeline branch. "Checkpoints" describes a storage mechanism for it.

**Suggested resolution:** State the rule as an outcome: at each history position, read returns the most recent memory
written by that Autopilot AI at or before that position on the current timeline branch, or explicit absence. Keep
"checkpoint" only if it is defined as vocabulary for that outcome.

## Other

### TODO-018: Must in Gameplay Dependency Direction

**Category and priority:** Other.

**Affected:** Gameplay Dependency Direction (DEPDIR), [Dependency direction](../guidance/gameplay-dependency-direction.md#dependency-direction).

**Batches:** DEPDIR has no batch; it is a Guidance document outside the batch sequence.

**Current wording:**

> Gameplay functions must receive only the inputs and dependencies they need; they must not reach any other part of
> Campaign state, directly or indirectly. This includes the code that creates Campaign instances during gameplay.
> Campaign instances must not hold references to the Campaign state that contains them.

**Why it is an issue:** [Specification families and paths](spec-conventions.md#specification-families-and-paths) says
Guidance documents are non-behavioural and [What belongs in a specification](spec-conventions.md#what-belongs-in-a-specification)
says such steering is never a requirement, while [Writing exact requirements](spec-conventions.md#writing-exact-requirements)
reserves "must" for requirements.

**Suggested resolution:** Replace "must" with "should" and label the section as guidance, or state in DEPDIR what
"must" means inside a Guidance document.

### TODO-019: Campaign treated as a Campaign instance in Initial Campaign Content

**Category and priority:** Other.

**Affected:** Initial Campaign Content (INIT), [Acceptance examples](../content/initial-campaign.md#acceptance-examples).

**Batches:** INIT has no batch; it is the Content parallel track in
[Parallel GDR and acceptance work](work-plan.md#parallel-gdr-and-acceptance-work), with the playable campaign reviewed
after batch 7.

**Current wording:**

> TODO: Include the required archetypes, all four properties, and Instance IDs for every Campaign instance, including Campaign
> and Agency, in initial-state validation.

**Why it is an issue:** Campaign state is not a Campaign instance and has no Instance ID or Archetype, under
[Types, multiplicity, and lifecycle](../foundation/domain-model.md#types-multiplicity-and-lifecycle) in Domain Model.
Also, because the sequence and format of Instance IDs are the implementer's choice under
[Continuation state](../foundation/engine-contract.md#continuation-state), fixtures cannot state concrete Instance IDs.

**Suggested resolution:** Remove "Campaign and" from the list, and say that fixtures use symbolic Instance IDs, for
example `agency_1`, that tests bind to whatever Instance IDs the implementation generates.

### TODO-020: Glossary coverage of kind-named Rule forms

**Category and priority:** Other, low priority.

**Affected:** Core Concepts (CORE), [Rule kinds](../foundation/core-concepts.md#rule-kinds) and
[Glossary](../foundation/core-concepts.md#glossary); used throughout Campaign Modeling Contract (CMC, Accepted) and
Domain Model (DOM).

**Batches:** CORE, CMC, and DOM are batch 1.

**Current wording:**

> A Rule is named after its kind, for example a Calculation Rule or a Creation Rule.

(CORE, Rule kinds. The CORE glossary defines only "Rule kind"; "Creation Rule" and the other kind-named forms have no
glossary row.)

**Why it is an issue:** [Canonical terminology](spec-conventions.md#canonical-terminology) requires formal terms to be
defined in an owning Glossary. The Rule kinds sentence may already be enough, because each kind-named form is the Rule
kind's name followed by "Rule".

**Suggested resolution:** Confirm that the Rule kinds sentence and the "Rule kind" glossary row suffice. Otherwise add
one glossary row stating that "X Rule" names a Rule of Rule kind X.

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
  rewrites the Engine Contract sentence about caches. The same change removes TODO-001. TODO-002 keeps its label.
- **New issue ([Adding and removing Work items](#adding-and-removing-work-items), [Work item format](#work-item-format)):**
  A reviewer finds an out-of-scope storage statement in Missions. They add TODO-021 under Clear violations, naming
  Missions and batch 6 from [Batch sequence](work-plan.md#batch-sequence), with the exact quoted wording.
- **Accepted owner ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)):** TODO-015 affects Campaign
  Modeling Contract, which is Accepted. Its Value classification wording remains in force until the project owner
  accepts a revision.
