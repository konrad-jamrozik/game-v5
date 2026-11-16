# About the Recipes family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Some implementation tasks recur and are easy to get subtly wrong, e.g. publishing an Implementation or bringing it up
to date with changed specifications. Recipes specifications suggest the steps for carrying out one such task. Like
Guidance, they bind no Implementation.

# Documents

## Specification Updates

[Specification Updates](specification-updates.md) answers _how does an implementation catch up with changed
specifications?_ It steers implementers to apply only the difference since the recorded commit, reaching the affected
files through the Specification map instead of rebuilding the implementation.

## GitHub Pages Deployment

[GitHub Pages Deployment](github-pages-deployment.md) answers _how does an implementation get published once the
Engine designer asks for it?_ It takes an implementation whose Game build a browser runs from static files to a public
GitHub repository, whose CI workflow checks every push and deploys the passing ones to GitHub Pages.

# How they relate

Both Recipes specifications carry out a task on files that the Mandatory family requires. GitHub Pages Deployment uses
Implementation Placement, because the published repository is the Implementation repo. Specification Updates uses
all three Mandatory specifications, because an update reads the tracking files and settles feedback entries.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

No uses relationships are declared within this family.

### Refines

No refines relationships are declared within this family.

## Across families

![Recipes family: relationships with other families](../../../images/diagrams/recipes-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Specification Tracking and Specification Updates are split for the same reason that Mandatory and Recipes are: the
files an implementation keeps can be checked in its files, so they are Mandatory, while the way an implementer uses
them to catch up is advice that an implementation can ignore and still be correct.
