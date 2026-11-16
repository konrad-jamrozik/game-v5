# About the Mandatory family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The Development loop needs a few things from every Implementation, whatever its platform: that it lives where it can be
found and rebuilt, that it writes down what it learned about the specifications, and that it records which
specifications it follows. Mandatory specifications state those repository constraints. They are checked against the
files of an Implementation rather than through the engine API.

# Documents

## Implementation Placement

[Implementation Placement](implementation-placement.md) answers _where does an implementation live?_ It confines each
implementation to its own Implementation repo beside the Spec repo, e.g. `game-v5-impl-a/`, which the
implementation treats as its repository root.

## Implementation Feedback

[Implementation Feedback](implementation-feedback.md) answers _what must an implementer write down?_ It requires each
implementation to keep feedback on the specifications: the problems it met in them and the decisions it made.

## Specification Tracking

[Specification Tracking](specification-tracking.md) answers _which specifications does an implementation follow, and
where?_ It requires each implementation to name the commit of the specifications it conforms to and to map every
specification to the files that implement it.

# How they relate

Implementation Feedback and Specification Tracking use Implementation Placement: their files are kept in its
Implementation repo. Specification Tracking also uses Implementation Feedback, whose Specification problems are
the only exceptions to conformance it allows. Implementation Placement uses Bootstrap GDRs from the Content family,
whose files each implementation copies.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

![Mandatory family: uses relationships within the family](../../../images/mandatory-family-within-uses.svg)

### Refines

No refines relationships are declared within this family.

## Across families

![Mandatory family: relationships with other families](../../../images/mandatory-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Mandatory specifications are kept to placement, feedback, and tracking, so that several independent implementations
can coexist beside the specifications and each can be updated from their changes. Each covers one kind of file an
implementation keeps, so a change to one never forces a change to the others.
