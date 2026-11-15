# About the Implementation family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Implementation documents steer implementers and constrain where implementations reside. They are
non-behavioural: they own no game behavior, observable contract, or GDR, and no acceptance test through the engine API
depends on them. Each document's Binding metadata row says whether it is Guidance, which an implementation may ignore,
or Mandatory, which every implementation must follow, as described in
[Implementation binding](../governance/spec-conventions.md#implementation-binding).

# Documents

## Implementation Placement

[Implementation Placement](implementation-placement.md), Mandatory, answers _where does an implementation live?_ It
confines each implementation to its own directory beside this repository's local clone, e.g. `game-v5-impl-web/`,
which the implementation treats as its repository root.

## Implementation Records

[Implementation Records](implementation-records.md), Mandatory, answers _what must an implementer write down?_ It
requires each implementation to keep a record of the problems met in the specifications and of the decisions made.

## Specification Tracking

[Specification Tracking](specification-tracking.md), Mandatory, answers _which specifications does an implementation
follow, and where?_ It requires each implementation to name the commit of the specifications it conforms to and to map
every specification to the files that implement it.

## Specification Updates

[Specification Updates](specification-updates.md), Guidance, answers _how does an implementation catch up with changed
specifications?_ It steers implementers to apply only the difference since the recorded commit, reaching the affected
files through that map instead of rebuilding the implementation.

## GitHub Pages Deployment

[GitHub Pages Deployment](github-pages-deployment.md), Guidance, answers _how does an implementation get published
once the Engine designer asks for it?_ It takes an implementation whose Game build a browser runs from static files to a
public GitHub repository, whose CI workflow checks every push and deploys the passing ones to GitHub Pages.

## Tech Stack Suggestion

[Tech Stack Suggestion](tech-stack-suggestion.md), Guidance, answers _what technologies can a browser
implementation use?_ It suggests a technology stack for an implementation that uses a browser as its GUI.

## Gameplay Dependency Direction

[Gameplay Dependency Direction](gameplay-dependency-direction.md), Guidance, answers _what may gameplay code read?_ It
steers gameplay code away from Campaign state beyond its necessary inputs.

## Storage Schema

[Storage Schema](storage-schema.md), Guidance, answers _how might everything persisted be laid out?_ It steers
implementers toward one physical layout for Game storage.

# How they relate

Implementation Records, Specification Tracking, and GitHub Pages Deployment use Implementation Placement: the records are
kept in its Implementation directory, and the published repository is that directory, published only once the Engine
designer decides where. Specification Tracking also uses Implementation Records, keeping its two records beside theirs,
and Specification Updates uses all three, because an update reads the tracking records and settles entries of the
other records.
Implementation Placement uses Bootstrap GDRs from the Content family, whose files each implementation copies. Gameplay Dependency
Direction and Storage Schema use the Foundation family: Gameplay Dependency Direction uses its vocabulary and
determinism guarantees, and Storage Schema uses its data ownership, Campaign save, and Timeline contracts. Gameplay
Dependency Direction also uses Web UI from the UI family and Basic Autopilot AI from the Autopilot AIs family, whose
code it keeps behind the engine API. No specification outside the family depends on any of them.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

![Implementation family: uses relationships within the family](../../images/implementation-family-within-uses.svg)

### Refines

No refines relationships are declared within this family.

## Across families

![Implementation family: relationships with other families](../../images/implementation-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

The Implementation family is kept apart so that advice to implementers never becomes an observable contract. An
implementation that ignores its Guidance documents can still satisfy every other specification. Mandatory documents
are kept to placement and record-keeping constraints, which are checked against the files rather than through the
engine API, so that several independent implementations can coexist beside the specifications.

Specification Tracking and Specification Updates are split for the same reason: the records an implementation keeps
can be checked in its files, so they are Mandatory, while the way an implementer uses them to catch up is advice that
an implementation can ignore and still be correct.
