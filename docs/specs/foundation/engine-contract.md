# Engine Contract

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | ENG                                                            |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define the guarantees the engine provides when running the game, exposing information, and restoring history.

This document owns observable execution guarantees, not a UI framework, internal architecture, exact API signatures, turn phase order,
RNG algorithm, save encoding, or subsystem mechanics.

- Uses [Domain Model](./domain-model.md) for the Campaign state structures and identities to which execution guarantees apply.
- Uses [Modeling Foundations](./modeling-foundations.md) for Game build, Campaign state, Committed state, and Authoritative value terminology in execution guarantees.
- Refined by [Developer API](../interfaces/developer-api.md), which specifies the separate debugging API contract for access to all Authoritative values in Campaign state.
- Refined by [History and Persistence](./history-and-persistence.md), which specifies the reversible session, replay, and save/load guarantees.
- Refined by [Numbers and Randomness](./numbers-and-randomness.md), which specifies the numeric and random behavior required for reproducible execution.
- Refined by [Player Information](../interfaces/player-information.md), which specifies the complete player knowledge contract and hidden-state boundary.
- Refined by [Turn Resolution](./turn-resolution.md), which specifies the precise phase order and snapshot rules for executing a turn.
- Refined by [TypeScript Player API](../interfaces/typescript-api.md), which specifies the exact TypeScript player command, report, and error signatures.

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

Continuing a Campaign means executing further gameplay commands from its current Committed state; for example,
advancing a turn or starting an Investigation. This applies during uninterrupted play and when play resumes after
undo/redo or loading a save. Loading a save restores Campaign state; the commands executed afterward continue play.

Campaign state contains the values already established in that Campaign; for example, Agency money, Enemy health,
and an Investigation difficulty sampled earlier. It also contains RNG state, which determines the next random draws,
and Instance ID generation state, which is used to assign new Instance IDs. History consulted by Rules must remain
available. The current [Game build](modeling-foundations.md#glossary) supplies the Game Data Records (GDRs), Ruleset,
code implementing its Rules, Campaign instance constructor implementations, and overall engine logic used to execute commands.
[Continuation state](#continuation-state) requires these inputs to be sufficient; History and Persistence owns the
procedures for undo/redo and save/load.

AI memory, UI selections, browser state, and CLI preferences are outside Campaign state ([Campaign boundary](domain-model.md#campaign-boundary-1)).
Controller-state restoration is outside this contract; its owner is
[Session](history-and-persistence.md#session).

## Queries and information

Player-visible information is deliberately exposed by the engine and contains no writable campaign references. The engine supplies
permitted decision-support calculations. Human and AI control use the same information boundary, while separate developer
capabilities expose all Authoritative values in Campaign state ([Information boundary](#information-boundary)). Hidden facts remain part of the game domain.

## Committed state

Committed state is the complete state before or after an accepted command, as defined in Modeling Foundations. Runtime
integrity covers domain invariants and modeling/reference conventions, including restoration; intermediate processing
is not Player-visible information of Committed state ([Committed state integrity](#committed-state-integrity)).
Integrity includes four-property composition, valid typed references, and stable Instance IDs and immutable facts under
[Campaign instances](modeling-foundations.md#campaign-instances) and [References](modeling-foundations.md#references).
Undo/redo restores Campaign instances rather than creating new identities or authorizing immutable-fact changes.

# Requirements

## Derived value consistency

Derived values must be reproducible from Authoritative values and the current rules and GDRs
without consuming gameplay randomness or mutating state. Caches must be updated or invalidated when inputs change,
including after undo/redo.

## Continuation state

From any Committed state, the current Game build's engine and Campaign instance constructor implementations must be
able to execute a given sequence of subsequent gameplay commands using only Campaign state and that Game build's
Ruleset and GDRs. Campaign state must retain the Authoritative values and History needed by those Rules, together with RNG state and Instance ID generation state;
Derived values are calculated under [Derived value consistency](#derived-value-consistency).

Equal Campaign state, the same Game build, and equal command sequences must produce equal results during uninterrupted
play and after restoring that state through undo/redo or save/load. Outcomes must not depend on a previous UI render
or particular AI implementation. This guarantee compares execution of the same commands; it does not require an AI
to choose identical commands after every restart.

## Information boundary

Ordinary human and AI callers must receive the same permitted information for equal
state and queries. They must not receive writable campaign references, hidden investigation difficulty, RNG state, or
unrevealed GDRs merely because they use TypeScript directly. Discovery, errors, and reports obey the same boundary.
The engine supplies permitted decision-support calculations; normal play must not require dev access.

A separate dev capability exposes all Authoritative values in Campaign state. This is an API contract, not cryptographic concealment from
the owner of a browser runtime. INFO/API/DEV own exact fields, reveal conditions, estimates, and dev enablement.

## Committed state integrity

The invariants in Domain Model, Modeling Foundations, and this contract must hold
before and after successful commands, turn advancement, and history restoration. Intermediate battle/turn states must not
be exposed as Player-visible information of Committed state. Invalid player requests must leave Campaign state, RNG state and Instance ID allocation state, reports, and
history unchanged. Broken internal references/invariants
must be reported as engine/data defects rather than silently repaired into different gameplay outcomes.

History restoration must restore the previous Instance ID generation state along with campaign references. This operational
guarantee preserves the timeline-scoped identity convention in [Campaign instances](modeling-foundations.md#campaign-instances); a discarded future is not another live
campaign. History and Persistence specifies restoration procedures, Numbers and Randomness specifies generation,
and TypeScript Player API specifies stale client-handle behavior.

## Game build compatibility

Backward compatibility across Game builds is out of scope. A Game build may replace earlier
GDRs, the Ruleset, Campaign instance constructor implementations, and overall engine logic without retaining support
for earlier versions, and may reject or discard incompatible saved Campaigns; migration is not required.
[Derived value consistency](#derived-value-consistency)/[Continuation state](#continuation-state) guarantees apply
when executing commands with the current Game build.
History and Persistence owns save validation and incompatible-save handling under this policy.

## Gameplay dependency direction

During gameplay, functions, including Campaign instance constructors, must receive only the inputs and dependencies
needed for their operation, without direct or indirect access to the top-level Campaign instance.
Contained Campaign instances must not refer back to that root. These restrictions do not apply to campaign creation,
save/load, or external engine interfaces.

## Preliminary API capabilities

The following capabilities are all required planning coverage, not illustrative examples.

**Informative outline:** the player interface needs campaign creation/resumption, visible-state and relationship queries,
action discovery/explanations, structured management commands, Advance turn, results/reports, and undo/redo. Campaign
save/load supports continuation without adding an ordinary full-state inspection function. Dev inspection is separate.

Exact function lists, wire schemas, and error vocabulary belong to TypeScript Player API and Player Information.

## Evidence basis (informative)

[Game Design Brief](../../game-design-brief.md) supplies the calculation, continuation, information-access, and
Committed state constraints.
Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited model file was unmodified in the source
working tree when the original Domain Model draft was prepared.

**v5 requirement:** [Campaign model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/gameStateModel.ts)
lacks RNG state. The brief requires reproducible continuation and separate player/dev access ([Continuation state](#continuation-state)/[Information boundary](#information-boundary)).

# Edge cases and failure behavior

| Case                                                | Result / owner                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Query/command names an unknown or hidden identifier | Respect visibility and non-mutation; exact public error belongs to INFO/API ([Information boundary](#information-boundary)/[Committed state integrity](#committed-state-integrity))                                                                                                                                                             |
| Invalid player request                              | Leave Campaign state, RNG/Instance ID allocation state, reports, and history unchanged ([Committed state integrity](#committed-state-integrity))                                                                                                                                                                                                |
| Broken internal reference/invariant                 | Report an engine/data defect rather than silently repair gameplay ([Committed state integrity](#committed-state-integrity); [References](modeling-foundations.md#references))                                                                                                                                                                   |
| Undo removes a Campaign instance created later      | Restore earlier references consistently, with no dangling future-only links or stale cached Derived values ([Derived value consistency](#derived-value-consistency)/[Committed state integrity](#committed-state-integrity); [Campaign instances](modeling-foundations.md#campaign-instances)/[References](modeling-foundations.md#references)) |
| Intermediate battle/turn state                      | Do not expose it as committed Player-visible information ([Committed state integrity](#committed-state-integrity))                                                                                                                                                                                                                              |
| Current calculation differs from historical value   | Refresh current calculations under [Derived value consistency](#derived-value-consistency); preserve historical facts under [Historical fact preservation](modeling-foundations.md#historical-fact-preservation)                                                                                                                                |

# Acceptance examples

## Player and controller boundary

Given hidden investigation difficulty H, opaque RNG state G, and opaque Instance ID generation state N:

- Equal human/AI queries receive equal permitted Player-visible information without H or RNG state.
- Separate dev inspection can obtain H.
- Mutating a returned player view cannot mutate the campaign.
- Repeated queries leave G, N, progress, reports, and history unchanged.
- Switching human/AI control does not replace the Agency or change Campaign state.
- An invalid command leaves Campaign state, G, N, reports, and history unchanged.

These cover [Campaign boundary](domain-model.md#campaign-boundary-1) and [Derived value consistency](#derived-value-consistency), [Continuation state](#continuation-state), [Information boundary](#information-boundary), and [Committed state integrity](#committed-state-integrity). Exact field names and returned errors await INFO/API/DEV.

## Reproducible calculations and continuation

Given equal Campaign state at a Committed state (including RNG state and Instance ID allocation state), the same Game build, and the same future
command sequence, executing those commands has the same outcomes regardless of earlier UI renders or which controller supplied
those commands ([Derived value consistency](#derived-value-consistency)/[Continuation state](#continuation-state)). This does not require AI controllers to choose identical commands.

## Restoration and integrity

- Undo restores prior facts and corresponding Derived values, without future-only references or stale readiness values;
  redo also updates or invalidates affected caches ([Derived value consistency](#derived-value-consistency)/[Continuation state](#continuation-state)/[Committed state integrity](#committed-state-integrity); [Campaign instances](modeling-foundations.md#campaign-instances)/[References](modeling-foundations.md#references)).
- A historical battle-start value remains preserved when current strength is recalculated ([Historical fact preservation](modeling-foundations.md#historical-fact-preservation)).
- Structural validation of [A. Valid relationships](domain-model.md#a-valid-relationships) leaves facts, RNG state G,
  and Instance ID allocation state N unchanged ([Derived value consistency](#derived-value-consistency)/[Committed state integrity](#committed-state-integrity)). G and N are opaque engine bookkeeping added to that structural fixture.
- Starting from fixture A, any player command that would produce one of its
  [B. Invalid variants](domain-model.md#b-invalid-variants) is rejected without changing Campaign state, G, N, reports,
  or history ([Committed state integrity](#committed-state-integrity)).
- Undo after creation restores the previous Instance ID generation state and references; a Campaign instance in the discarded
  future does not constrain uniqueness in the restored timeline ([Committed state integrity](#committed-state-integrity); [Campaign instances](modeling-foundations.md#campaign-instances)/[References](modeling-foundations.md#references)).
- A successful command, turn advancement, or restoration exposes a state satisfying the domain and reference invariants.
  Intermediate battle/turn states are not exposed as committed Player-visible information ([Committed state integrity](#committed-state-integrity)).
- A broken internal reference is reported as an engine/data defect, not silently reassigned to a similarly named Campaign instance
  ([Committed state integrity](#committed-state-integrity); [Campaign instances](modeling-foundations.md#campaign-instances)/[References](modeling-foundations.md#references)).

Exact save/restore procedures and public errors remain owned by HIST/API/DEV.

## Game build compatibility

Given a save from Game build A that references GDRs removed in Game build B, rejecting that save in Game build B is permitted
under [Game build compatibility](#game-build-compatibility). The Game build need not restore the removed GDRs or migrate the save. Exact rejection behavior belongs
to History and Persistence; successful restoration must still satisfy [Committed state integrity](#committed-state-integrity).
