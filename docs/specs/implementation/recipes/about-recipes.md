# About the Recipes family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Some implementation tasks recur and are easy to get subtly wrong, e.g. publishing an Implementation or bringing it up to date with changed specifications. Recipes specifications suggest the steps for carrying out one such task. Like Guidance, they bind no Implementation.

# Documents

## Specification Updates

[Specification Updates](specification-updates.md) answers _how does an implementation catch up with changed specifications?_ It steers implementers to apply only the difference since the recorded commit, reaching the affected files through the Specification map instead of rebuilding the implementation.

## GitHub Pages Deployment

[GitHub Pages Deployment](github-pages-deployment.md) answers _how does an implementation get published once the Engine designer asks for it?_ It takes an implementation whose Game build a browser runs from static files to a public GitHub repository, whose CI workflow checks every push and deploys the passing ones to GitHub Pages.

## Globe Integration

[Globe Integration](globe-integration.md) answers _how does an implementation show the rotating Earth that the Spec repo keeps?_ It has the implementer copy the reference globe's maps and scene into the Implementation repo and mount them as a decoration that reads no game state and costs nothing until the Player opens it.

# How they relate

Every Recipes specification carries out a task on files that the Mandatory family constrains. GitHub Pages Deployment uses Implementation Placement, because the published repository is the Implementation repo. Specification Updates uses all three Mandatory specifications, because an update reads the tracking files and settles feedback entries. Globe Integration uses Implementation Placement and Specification Tracking, because the globe is copied into the Implementation repo and its files are recorded there; it also uses the other two Recipes specifications, for keeping the copy current and for serving the maps once published.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

No specification of this family links another specification of it.

## Across families

![Recipes family: relationships with other families](../../../images/diagrams/recipes-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Specification Tracking and Specification Updates are split for the same reason that Mandatory and Recipes are: the files an implementation keeps can be checked in its files, so they are Mandatory, while the way an implementer uses them to catch up is advice that an implementation can ignore and still be correct.
