# Engine Contract

| Metadata    | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Spec ID     | ENG                                                                                      |
| Family      | Foundation                                                                               |
| Status      | Draft                                                                                    |
| Scope       | Execution, continuation, query and information boundaries, and committed-state integrity |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                           |
| Review      | Batch 1; proposed rules awaiting user review                                             |

# Purpose and boundaries

Define the guarantees the engine provides when running the game, exposing information, and restoring history.

**Draft proposal:** requirements were extracted from Domain Model and remain proposed contracts. This document owns
observable execution guarantees, not a UI framework, internal architecture, exact API signatures, turn phase order,
RNG algorithm, save encoding, or subsystem mechanics. Accepting it alone does not make those details implementable.

# Relationships

- Uses [Domain Model](./domain-model.md)
- Uses [Modeling Foundations](./modeling-foundations.md)
- Refined by [Developer API](../interfaces/developer-api.md)
- Refined by [History and Persistence](./history-and-persistence.md)
- Refined by [Numbers and Randomness](./numbers-and-randomness.md)
- Refined by [Player Information](../interfaces/player-information.md)
- Refined by [Turn Resolution](./turn-resolution.md)
- Refined by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

None.

# Concepts and contract

## Continuation and control

Campaign continuation requires gameplay facts and deterministic bookkeeping; for example, RNG state, ID-generation state,
and sampled hidden values. The current game build supplies rules and content. ENG-002 defines completeness.

AI memory, UI selections, browser state, and CLI preferences are outside campaign state (DOM-001).
Controller-state restoration is outside this contract; its owner is
[History and Persistence](history-and-persistence.md#session).

## Queries and information

Player observations are deliberately exposed information, not writable campaign references. The engine supplies
permitted decision-support calculations. Human and AI control use the same information boundary, while separate developer
capabilities expose full authoritative state (ENG-003). Hidden facts remain part of the game domain.

## Committed state

Committed state is the complete state before or after an accepted command, as defined in Modeling Foundations. Runtime
integrity covers domain invariants and modeling/reference conventions, including restoration; intermediate processing
is not a committed observation (ENG-004).

# Requirements

**ENG-001 — Derived consistency.** Derived values must be reproducible from authoritative values and the current rules/content
without consuming gameplay randomness or mutating state. Caches must be updated or invalidated when inputs change,
including after undo/redo.

**ENG-002 — Continuation state.** Campaign state and the rules/content supplied by the current game build must contain
everything required to resolve a given future command sequence: sampled hidden values, RNG state, ID-generation state,
and gameplay facts. Outcomes must not depend on a previous UI render or particular AI implementation. This does not
require AI to choose identical commands after every restart.

**ENG-003 — Information boundary.** Ordinary human and AI callers must receive the same permitted information for equal
state and queries. They must not receive writable campaign references, hidden investigation difficulty, RNG state, or
unrevealed content merely because they use TypeScript directly. Discovery, errors, and reports obey the same boundary.
The engine supplies permitted decision-support calculations; normal play must not require dev access.

A separate dev capability exposes full authoritative state. This is an API contract, not cryptographic concealment from
the owner of a browser runtime. INFO/API/DEV own exact fields, reveal conditions, estimates, and dev enablement.

**ENG-004 — Committed-state integrity.** The invariants in Domain Model, Modeling Foundations, and this contract must hold
before and after successful commands, turn advancement, and history restoration. Intermediate battle/turn states must not
be exposed as committed observations. Invalid player requests must leave campaign state, RNG/ID state, reports, and
history unchanged. Broken internal references/invariants
must be reported as engine/data defects rather than silently repaired into different gameplay outcomes.

History restoration must restore the previous ID-generation state along with campaign references. This operational
guarantee preserves the timeline-scoped identity convention in MODEL-002; a discarded future is not another live
campaign. History and Persistence specifies restoration procedures, Numbers and Randomness specifies generation,
and TypeScript Player API specifies stale client-handle behavior.

## Preliminary API capabilities

The following capabilities are all required planning coverage, not illustrative examples.

**Informative outline:** the player interface needs campaign creation/resumption, visible-state and relationship queries,
action discovery/explanations, structured management commands, Advance turn, results/reports, and undo/redo. Campaign
save/load supports continuation without adding an ordinary full-state inspection function. Dev inspection is separate.

This is not a finalized function list, wire schema, or error vocabulary. It constrains later API/INFO drafts while keeping
the three foundation drafts as the batch 1 review deliverable.

## Evidence basis (informative)

[Game Design Brief](../../game-design-brief.md) supplies the calculation, continuation, information-access, and
committed-state constraints.
Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited model file was unmodified in the source
working tree when the original Domain Model draft was prepared.

**v5 requirement:** [Campaign model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/gameStateModel.ts)
lacks RNG state. The brief requires reproducible continuation and separate player/dev access (ENG-002/003).

# Edge cases and failure behavior

| Case                                              | Result / owner                                                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Query/command names an unknown or hidden ID       | Respect visibility and non-mutation; exact public error belongs to INFO/API (ENG-003/004)                                        |
| Invalid player request                            | Leave campaign state, RNG/ID state, reports, and history unchanged (ENG-004)                                                     |
| Broken internal reference/invariant               | Report an engine/data defect rather than silently repair gameplay (ENG-004; MODEL-003)                                           |
| Undo removes an instance created later            | Restore earlier references consistently, with no dangling future-only links or stale derived caches (ENG-001/004; MODEL-002/003) |
| Intermediate battle/turn state                    | Do not expose it as a committed observation (ENG-004)                                                                            |
| Current calculation differs from historical value | Refresh current calculations under ENG-001; preserve historical facts under MODEL-004                                            |

# Acceptance examples

## Player and controller boundary

Given hidden investigation difficulty H, opaque RNG state G, and opaque ID-generation state N:

- Equal human/AI queries receive equal permitted observations without H or RNG state.
- Separate dev inspection can obtain H.
- Mutating a returned player view cannot mutate the campaign.
- Repeated queries leave G, N, progress, reports, and history unchanged.
- Switching human/AI control does not replace the agency or alter gameplay facts.
- An invalid command leaves campaign state, G, N, reports, and history unchanged.

These cover DOM-001 and ENG-001 through ENG-004. Exact field names and returned errors await INFO/API/DEV.

## Reproducible calculations and continuation

Given equal committed campaign state (including RNG and ID state), the same current rules/content, and the same future
command sequence, continuation has the same outcomes regardless of earlier UI renders or which controller supplied
those commands (ENG-001/002). This does not require AI controllers to choose identical commands.

## Restoration and integrity

- Undo restores prior facts and corresponding derived values, without future-only references or stale readiness values;
  redo also updates or invalidates affected caches (ENG-001/002/004; MODEL-002/003).
- A historical battle-start value remains preserved when current strength is recalculated (MODEL-004).
- Structural validation of [Domain Model fixture A](domain-model.md#a-valid-relationships) leaves facts, RNG state G,
  and ID state N unchanged (ENG-001/004). G and N are opaque engine bookkeeping added to that structural fixture.
- Starting from fixture A, any player command that would produce one of its
  [invalid variants](domain-model.md#b-invalid-variants) is rejected without changing campaign state, G, N, reports,
  or history (ENG-004).
- Undo after creation restores the previous ID-generation state and references; an occurrence in the discarded
  future does not constrain uniqueness in the restored timeline (ENG-004; MODEL-002/003).
- A successful command, turn advancement, or restoration exposes a state satisfying the domain and reference invariants.
  Intermediate battle/turn states are not exposed as committed observations (ENG-004).
- A broken internal reference is reported as an engine/data defect, not silently reassigned to a similarly named instance
  (ENG-004; MODEL-002/003).

Exact save/restore procedures and public errors remain owned by HIST/API/DEV.

# Open decisions

No additional design choices are introduced by this split. ENG-001–004 remain proposed rules awaiting review.
RNG algorithms, turn phase order, save encoding, observation fields, reveal conditions, estimates, public signatures,
and developer enablement remain scheduled work in their owning specs, not implicit defaults in this contract.

The [migration table](domain-model.md#appendix-a-requirement-migration-informative) records the retired DOM IDs.
