# About the Implementation family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Implementation documents steer implementers and constrain where implementations reside in the repository. They are
non-behavioural: they own no game behavior, observable contract, or GDR, and no acceptance test through the engine API
depends on them. Each document's Binding metadata row says whether it is Guidance, which an implementation may ignore,
or Mandatory, which every implementation must follow, as described in
[Implementation binding](../governance/spec-conventions.md#implementation-binding).

# Documents

## Implementation Placement

[Implementation Placement](implementation-placement.md), Mandatory, answers _where does an implementation live?_ It
confines each implementation to its own directory under `implementations/`, which the implementation treats as its
repository root.

## Implementation Records

[Implementation Records](implementation-records.md), Mandatory, answers _what must an implementer write down?_ It
requires each implementation to keep a record of the problems met in the specifications and of the decisions made.

## Implementation Scaffold

[Implementation Scaffold](implementation-scaffold.md), Guidance, answers _what can a new implementation start from?_ It
lists the files of a minimal Vite and TypeScript browser page.

## Gameplay Dependency Direction

[Gameplay Dependency Direction](gameplay-dependency-direction.md), Guidance, answers _what may gameplay code read?_ It
steers gameplay code away from Campaign state beyond its necessary inputs.

## Storage Schema

[Storage Schema](storage-schema.md), Guidance, answers _how might everything persisted be laid out?_ It steers
implementers toward one physical layout for Game storage.

# How they relate

Implementation Records and Implementation Scaffold use Implementation Placement: the records are kept in its
Implementation directory, and the scaffold fills it. Implementation
Placement uses Bootstrap GDRs from the Content family, whose files each implementation copies. Gameplay Dependency
Direction and Storage Schema use the Foundation family: Gameplay Dependency Direction uses its vocabulary and
determinism guarantees, and Storage Schema uses its data ownership, Campaign save, and Timeline contracts. Gameplay
Dependency Direction also uses Web UI from the UI family and Basic Autopilot AI from the Autopilot AIs family, whose
code it keeps behind the engine API. No specification outside the family depends on any of them.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

![Implementation family: relationships within the family](../../images/implementation-family-within.svg)

## Across families

![Implementation family: relationships with other families](../../images/implementation-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

The Implementation family is kept apart so that advice to implementers never becomes an observable contract. An
implementation that ignores its Guidance documents can still satisfy every other specification. Mandatory documents
are kept to repository constraints, which are checked against the repository rather than through the engine API, so
that several independent implementations can coexist in one repository.
