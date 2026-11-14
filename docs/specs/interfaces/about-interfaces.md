# About the Interfaces family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Interfaces specifications own the observable contracts through which players, developers, and Autopilot AI reach the
engine: what information is exposed, the exact API signatures, and the adapters built on them. They refine
[Engine Contract](../foundation/engine-contract.md) and never implement gameplay themselves; gameplay stays behind the
shared API.

# Documents

## Player Information

[Player Information](player-information.md) answers _what may the player know?_ It owns the complete player-facing
knowledge contract, reveal conditions, and the boundary around hidden state.

## TypeScript Player API

[TypeScript Player API](typescript-api.md) answers _what exactly can a caller invoke?_ It owns the exact TypeScript
signatures for Session API, Player API, Developer API, and Autopilot memory API.

## Developer API

[Developer API](developer-api.md) answers _what can an authorized developer inspect or change?_ It owns the Developer access engine subsystem: Dev mode, full Campaign
state inspection, and cheat-command details.

## Terminal CLI

[Terminal CLI](cli.md) answers _how is the API reached from a terminal?_ It owns a complete terminal adapter over the
engine API namespaces, usable by humans and AI.

## Web UI

[Web UI](web-ui.md) answers _how is the API reached from a browser?_ It owns the first functional browser interface
over the same API.

# How they relate

The family is layered. Player Information decides what can be shown, TypeScript Player API turns the engine contract
into callable signatures, and Developer API adds the privileged inspection surface. Terminal CLI and Web UI are
adapters that use TypeScript Player API and Player Information without adding behavior of their own.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

![Interfaces family: relationships within the family](../../images/interfaces-family-within.svg)

## Across families

![Interfaces family: relationships with other families](../../images/interfaces-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Player Information versus TypeScript Player API:** what may be known is separated from how it is called, so the
  information boundary is defined once for every surface.
- **Developer API versus Player API:** privileged inspection and cheats are isolated so they can never leak into
  player views or Autopilot AI.
- **Adapters versus the API:** Terminal CLI and Web UI only present the API, so both stay consistent with each other
  and with automated play.

# Reading order

Read [Player Information](player-information.md) and [TypeScript Player API](typescript-api.md) first, then
[Developer API](developer-api.md), then the adapters [Terminal CLI](cli.md) and [Web UI](web-ui.md).
