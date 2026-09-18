# Refines Relationships

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

A → B means A is refined by B.

[Back to the relationship graph index](../relationships.md)

[Back to the derived specification catalog](../README.md)

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
