# Engine Contract

| Metadata    | Value                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Spec ID     | ENG                                                                                                     |
| Family      | Foundation                                                                                              |
| Status      | Draft                                                                                                   |
| Scope       | Execution, continuation, compatibility, query and information boundaries, and Committed state integrity |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                          |
| Review      | Batch 1; proposed rules awaiting user review                                                            |

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

Campaign continuation requires gameplay facts and deterministic bookkeeping; for example, RNG state, Instance ID generation state,
and sampled hidden values. The current game build supplies rules and Content entries. [ENG-002](#eng-002--continuation-state) defines completeness.

AI memory, UI selections, browser state, and CLI preferences are outside Campaign state ([DOM-001](domain-model.md#dom-001--campaign-boundary)).
Controller-state restoration is outside this contract; its owner is
[History and Persistence](history-and-persistence.md#session).

## Queries and information

Player observations are deliberately exposed information, not writable campaign references. The engine supplies
permitted decision-support calculations. Human and AI control use the same information boundary, while separate developer
capabilities expose all Authoritative values in Campaign state ([ENG-003](#eng-003--information-boundary)). Hidden facts remain part of the game domain.

## Committed state

Committed state is the complete state before or after an accepted command, as defined in Modeling Foundations. Runtime
integrity covers domain invariants and modeling/reference conventions, including restoration; intermediate processing
is not a Player observation of Committed state ([ENG-004](#eng-004--committed-state-integrity)).
Integrity includes three-component composition, valid typed references, and stable Instance IDs and immutable facts under
[MODEL-001](modeling-foundations.md#model-001--campaign-instance-composition),
[MODEL-002](modeling-foundations.md#model-002--identity), and [MODEL-003](modeling-foundations.md#model-003--references).
Undo/redo restores Campaign instances rather than creating new identities or authorizing immutable-fact changes.

# Requirements

## ENG-001 — Derived value consistency

Derived values must be reproducible from Authoritative values and the current rules and Content entries
without consuming gameplay randomness or mutating state. Caches must be updated or invalidated when inputs change,
including after undo/redo.

## ENG-002 — Continuation state

Campaign state and the rules and Content entries supplied by the current game build must contain
everything required to resolve a given future command sequence: sampled hidden values, RNG state, Instance ID generation state,
and gameplay facts. Outcomes must not depend on a previous UI render or particular AI implementation. This does not
require AI to choose identical commands after every restart.

## ENG-003 — Information boundary

Ordinary human and AI callers must receive the same permitted information for equal
state and queries. They must not receive writable campaign references, hidden investigation difficulty, RNG state, or
unrevealed Content entries merely because they use TypeScript directly. Discovery, errors, and reports obey the same boundary.
The engine supplies permitted decision-support calculations; normal play must not require dev access.

A separate dev capability exposes all Authoritative values in Campaign state. This is an API contract, not cryptographic concealment from
the owner of a browser runtime. INFO/API/DEV own exact fields, reveal conditions, estimates, and dev enablement.

## ENG-004 — Committed state integrity

The invariants in Domain Model, Modeling Foundations, and this contract must hold
before and after successful commands, turn advancement, and history restoration. Intermediate battle/turn states must not
be exposed as Player observations of Committed state. Invalid player requests must leave Campaign state, RNG state and Instance ID allocation state, reports, and
history unchanged. Broken internal references/invariants
must be reported as engine/data defects rather than silently repaired into different gameplay outcomes.

History restoration must restore the previous Instance ID generation state along with campaign references. This operational
guarantee preserves the timeline-scoped identity convention in [MODEL-002](modeling-foundations.md#model-002--identity); a discarded future is not another live
campaign. History and Persistence specifies restoration procedures, Numbers and Randomness specifies generation,
and TypeScript Player API specifies stale client-handle behavior.

## ENG-005 — Build compatibility

Backward compatibility across game builds is out of scope. A build may replace earlier
rules and Content entries without retaining support for them, and may reject or discard incompatible saved campaigns; migration
is not required. [ENG-001](#eng-001--derived-value-consistency)/[ENG-002](#eng-002--continuation-state) continuation guarantees apply to the rules and Content entries supplied by the current build.
History and Persistence owns save validation and incompatible-save handling under this policy.

## Preliminary API capabilities

The following capabilities are all required planning coverage, not illustrative examples.

**Informative outline:** the player interface needs campaign creation/resumption, visible-state and relationship queries,
action discovery/explanations, structured management commands, Advance turn, results/reports, and undo/redo. Campaign
save/load supports continuation without adding an ordinary full-state inspection function. Dev inspection is separate.

This is not a finalized function list, wire schema, or error vocabulary. It constrains later API/INFO drafts while keeping
the three foundation drafts as the batch 1 review deliverable.

## Evidence basis (informative)

[Game Design Brief](../../game-design-brief.md) supplies the calculation, continuation, information-access, and
Committed state constraints.
Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited model file was unmodified in the source
working tree when the original Domain Model draft was prepared.

**v5 requirement:** [Campaign model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/gameStateModel.ts)
lacks RNG state. The brief requires reproducible continuation and separate player/dev access ([ENG-002](#eng-002--continuation-state)/[ENG-003](#eng-003--information-boundary)).

# Edge cases and failure behavior

| Case                                                | Result / owner                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Query/command names an unknown or hidden identifier | Respect visibility and non-mutation; exact public error belongs to INFO/API ([ENG-003](#eng-003--information-boundary)/[ENG-004](#eng-004--committed-state-integrity))                                                                                                                                                          |
| Invalid player request                              | Leave Campaign state, RNG/Instance ID allocation state, reports, and history unchanged ([ENG-004](#eng-004--committed-state-integrity))                                                                                                                                                                                         |
| Broken internal reference/invariant                 | Report an engine/data defect rather than silently repair gameplay ([ENG-004](#eng-004--committed-state-integrity); [MODEL-003](modeling-foundations.md#model-003--references))                                                                                                                                                  |
| Undo removes a Campaign instance created later      | Restore earlier references consistently, with no dangling future-only links or stale cached Derived values ([ENG-001](#eng-001--derived-value-consistency)/[ENG-004](#eng-004--committed-state-integrity); [MODEL-002](modeling-foundations.md#model-002--identity)/[MODEL-003](modeling-foundations.md#model-003--references)) |
| Intermediate battle/turn state                      | Do not expose it as a committed Player observation ([ENG-004](#eng-004--committed-state-integrity))                                                                                                                                                                                                                             |
| Current calculation differs from historical value   | Refresh current calculations under [ENG-001](#eng-001--derived-value-consistency); preserve historical facts under [MODEL-004](modeling-foundations.md#model-004--historical-fact-preservation)                                                                                                                                 |

# Acceptance examples

## Player and controller boundary

Given hidden investigation difficulty H, opaque RNG state G, and opaque Instance ID generation state N:

- Equal human/AI queries receive equal permitted Player observations without H or RNG state.
- Separate dev inspection can obtain H.
- Mutating a returned player view cannot mutate the campaign.
- Repeated queries leave G, N, progress, reports, and history unchanged.
- Switching human/AI control does not replace the agency or alter gameplay facts.
- An invalid command leaves Campaign state, G, N, reports, and history unchanged.

These cover [DOM-001](domain-model.md#dom-001--campaign-boundary) and [ENG-001](#eng-001--derived-value-consistency), [ENG-002](#eng-002--continuation-state), [ENG-003](#eng-003--information-boundary), and [ENG-004](#eng-004--committed-state-integrity). Exact field names and returned errors await INFO/API/DEV.

## Reproducible calculations and continuation

Given equal Campaign state at a Committed state (including RNG state and Instance ID allocation state), the same current rules and Content entries, and the same future
command sequence, continuation has the same outcomes regardless of earlier UI renders or which controller supplied
those commands ([ENG-001](#eng-001--derived-value-consistency)/[ENG-002](#eng-002--continuation-state)). This does not require AI controllers to choose identical commands.

## Restoration and integrity

- Undo restores prior facts and corresponding Derived values, without future-only references or stale readiness values;
  redo also updates or invalidates affected caches ([ENG-001](#eng-001--derived-value-consistency)/[ENG-002](#eng-002--continuation-state)/[ENG-004](#eng-004--committed-state-integrity); [MODEL-002](modeling-foundations.md#model-002--identity)/[MODEL-003](modeling-foundations.md#model-003--references)).
- A historical battle-start value remains preserved when current strength is recalculated ([MODEL-004](modeling-foundations.md#model-004--historical-fact-preservation)).
- Structural validation of [Domain Model fixture A](domain-model.md#a-valid-relationships) leaves facts, RNG state G,
  and Instance ID allocation state N unchanged ([ENG-001](#eng-001--derived-value-consistency)/[ENG-004](#eng-004--committed-state-integrity)). G and N are opaque engine bookkeeping added to that structural fixture.
- Starting from fixture A, any player command that would produce one of its
  [invalid variants](domain-model.md#b-invalid-variants) is rejected without changing Campaign state, G, N, reports,
  or history ([ENG-004](#eng-004--committed-state-integrity)).
- Undo after creation restores the previous Instance ID generation state and references; a Campaign instance in the discarded
  future does not constrain uniqueness in the restored timeline ([ENG-004](#eng-004--committed-state-integrity); [MODEL-002](modeling-foundations.md#model-002--identity)/[MODEL-003](modeling-foundations.md#model-003--references)).
- A successful command, turn advancement, or restoration exposes a state satisfying the domain and reference invariants.
  Intermediate battle/turn states are not exposed as committed Player observations ([ENG-004](#eng-004--committed-state-integrity)).
- A broken internal reference is reported as an engine/data defect, not silently reassigned to a similarly named Campaign instance
  ([ENG-004](#eng-004--committed-state-integrity); [MODEL-002](modeling-foundations.md#model-002--identity)/[MODEL-003](modeling-foundations.md#model-003--references)).

Exact save/restore procedures and public errors remain owned by HIST/API/DEV.

## Build compatibility

Given a save from build A that references Content entries removed in build B, rejecting that save in build B is permitted
under [ENG-005](#eng-005--build-compatibility). The build need not restore the removed Content entries or migrate the save. Exact rejection behavior belongs
to History and Persistence; successful restoration must still satisfy [ENG-004](#eng-004--committed-state-integrity).

# Open decisions

[ENG-001](#eng-001--derived-value-consistency), [ENG-002](#eng-002--continuation-state), [ENG-003](#eng-003--information-boundary), [ENG-004](#eng-004--committed-state-integrity), and [ENG-005](#eng-005--build-compatibility) remain proposed rules awaiting review.
RNG algorithms, turn phase order, save encoding, Player observation fields, reveal conditions, estimates, public signatures,
and developer enablement remain scheduled work in their owning specifications, not implicit defaults in this contract.
