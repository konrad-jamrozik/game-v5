# Uses Relationships

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

A → B means A is used by B.

[Back to the relationship graph index](../relationships.md)

[Back to the derived specification catalog](../README.md)

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
