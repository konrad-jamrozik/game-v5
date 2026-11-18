# About the Content family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Content is the game's versioned data: Game Data Records (GDRs), e.g. named parameter values, catalogs, and Campaign configuration presets. GDRs supply values for meanings defined elsewhere and never change mechanical behavior.

# Documents

## Bootstrap GDRs

[Bootstrap GDRs](bootstrap-gdrs.md) answers _which GDRs must a Game build supply for a first playable Campaign?_ It names the required GDRs, what each is for, and how the Leads and Mission sites among them form the Victory path; the values themselves are recorded in the GDRs, not restated in a document. [Game Data Records](../foundation/game-data-records.md) states what a GDR can be used for, and each Mechanics specification states the meaning of the values it needs.

A Content specification is added only for content that needs rules of its own, e.g. a second campaign with a different scope.

# How they relate

Bootstrap GDRs uses Game Data Records and Configuration from the Foundation family and Domain Model from the Mechanics family, and Storage Schema in the Guidance family uses it.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

This family has a single specification, so there are no references within it.

## Across families

![Content family: relationships with other families](../../../images/diagrams/content-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Data is separated from behavior so that balancing a campaign changes only GDRs and no Mechanics document.
