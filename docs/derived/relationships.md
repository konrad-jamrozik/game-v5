# Specification Relationships

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

Arrows run from Dependency to Dependent. The section heading supplies the relationship kind, and the arrow is read in the passive direction described under that heading. These views contain declared relationships only and do not infer relationships from citations, paths, review order, or transitive reachability.

[Back to the derived specification catalog](README.md)

## Follows

A → B means A is followed by B.

```mermaid
flowchart LR
  AGENT["AGENT — Agents (Stub)"]
  API["API — TypeScript Player API (Stub)"]
  CAMP["CAMP — Campaign (Stub)"]
  CLI["CLI — Terminal CLI (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  CONV["CONV — Specification Conventions (Accepted)"]
  DEV["DEV — Developer API (Stub)"]
  DOM["DOM — Domain Model (Draft)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  ENG["ENG — Engine Contract (Draft)"]
  FACTION["FACTION — Factions (Stub)"]
  HIST["HIST — History and Persistence (Stub)"]
  INDEX["INDEX — Game Specification Index (Draft)"]
  INFO["INFO — Player Information (Stub)"]
  INIT["INIT — Initial Campaign Content (Stub)"]
  INV["INV — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  MOD["MOD — Modeling Foundations (Draft)"]
  NUM["NUM — Numbers and Randomness (Stub)"]
  PLAN["PLAN — Specification Work Plan and Backlog (Accepted)"]
  REL["REL — Artifact Relationships (Draft)"]
  SCEN["SCEN — Campaign Integration and Acceptance Tests (Stub)"]
  TURN["TURN — Turn Resolution (Stub)"]
  WEB["WEB — Web UI (Stub)"]
  CONV --> AGENT
  CONV --> API
  CONV --> CAMP
  CONV --> CLI
  CONV --> COMBAT
  CONV --> DEV
  CONV --> DOM
  CONV --> ECON
  CONV --> ENG
  CONV --> FACTION
  CONV --> HIST
  CONV --> INDEX
  CONV --> INFO
  CONV --> INIT
  CONV --> INV
  CONV --> LEAD
  CONV --> MISSION
  CONV --> MOD
  CONV --> NUM
  CONV --> PLAN
  CONV --> REL
  CONV --> SCEN
  CONV --> TURN
  CONV --> WEB
```

## Refines

A → B means A is refined by B.

```mermaid
flowchart LR
  AGENT["AGENT — Agents (Stub)"]
  API["API — TypeScript Player API (Stub)"]
  CAMP["CAMP — Campaign (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  DEV["DEV — Developer API (Stub)"]
  DOM["DOM — Domain Model (Draft)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  ENG["ENG — Engine Contract (Draft)"]
  FACTION["FACTION — Factions (Stub)"]
  HIST["HIST — History and Persistence (Stub)"]
  INFO["INFO — Player Information (Stub)"]
  INIT["INIT — Initial Campaign Content (Stub)"]
  INV["INV — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  MOD["MOD — Modeling Foundations (Draft)"]
  NUM["NUM — Numbers and Randomness (Stub)"]
  TURN["TURN — Turn Resolution (Stub)"]
  CAMP --> INIT
  DOM --> AGENT
  DOM --> CAMP
  DOM --> COMBAT
  DOM --> ECON
  DOM --> FACTION
  DOM --> INV
  DOM --> LEAD
  DOM --> MISSION
  ECON --> INIT
  ENG --> API
  ENG --> DEV
  ENG --> HIST
  ENG --> INFO
  ENG --> TURN
  FACTION --> INIT
  LEAD --> INIT
  MISSION --> INIT
  MOD --> DOM
  MOD --> HIST
  MOD --> NUM
```

## Uses

A → B means A is used by B.

```mermaid
flowchart LR
  AGENT["AGENT — Agents (Stub)"]
  API["API — TypeScript Player API (Stub)"]
  CAMP["CAMP — Campaign (Stub)"]
  CLI["CLI — Terminal CLI (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  CONV["CONV — Specification Conventions (Accepted)"]
  DEV["DEV — Developer API (Stub)"]
  DOM["DOM — Domain Model (Draft)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  ENG["ENG — Engine Contract (Draft)"]
  FACTION["FACTION — Factions (Stub)"]
  HIST["HIST — History and Persistence (Stub)"]
  INFO["INFO — Player Information (Stub)"]
  INIT["INIT — Initial Campaign Content (Stub)"]
  INV["INV — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  MOD["MOD — Modeling Foundations (Draft)"]
  NUM["NUM — Numbers and Randomness (Stub)"]
  REL["REL — Artifact Relationships (Draft)"]
  SCEN["SCEN — Campaign Integration and Acceptance Tests (Stub)"]
  TURN["TURN — Turn Resolution (Stub)"]
  WEB["WEB — Web UI (Stub)"]
  AGENT --> COMBAT
  AGENT --> ECON
  AGENT --> INFO
  AGENT --> INV
  AGENT --> MISSION
  AGENT --> TURN
  API --> CLI
  API --> DEV
  API --> SCEN
  API --> WEB
  CAMP --> INFO
  CAMP --> TURN
  CLI --> SCEN
  COMBAT --> INFO
  COMBAT --> MISSION
  DOM --> API
  DOM --> DEV
  DOM --> ENG
  DOM --> HIST
  DOM --> INFO
  DOM --> INIT
  DOM --> MOD
  DOM --> TURN
  ECON --> INFO
  ECON --> MISSION
  ECON --> TURN
  ENG --> DOM
  ENG --> NUM
  FACTION --> INFO
  FACTION --> LEAD
  FACTION --> MISSION
  FACTION --> TURN
  HIST --> API
  HIST --> CLI
  HIST --> DEV
  HIST --> INFO
  HIST --> SCEN
  HIST --> WEB
  INFO --> API
  INFO --> CLI
  INFO --> INV
  INFO --> WEB
  INIT --> CAMP
  INIT --> ECON
  INIT --> SCEN
  INV --> INFO
  INV --> TURN
  LEAD --> FACTION
  LEAD --> INFO
  LEAD --> INV
  MISSION --> INFO
  MISSION --> LEAD
  MISSION --> TURN
  MOD --> API
  MOD --> ENG
  MOD --> INFO
  MOD --> INIT
  NUM --> AGENT
  NUM --> COMBAT
  NUM --> ECON
  NUM --> FACTION
  NUM --> HIST
  NUM --> INV
  NUM --> TURN
  REL --> CONV
  TURN --> CAMP
  TURN --> SCEN
  WEB --> SCEN
```

## Implements

A → B means A is implemented by B.

No implements relationships are declared.

## Verifies

A → B means A is verified by B.

No verifies relationships are declared.
