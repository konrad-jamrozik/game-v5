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
  INVSTG["INVSTG — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  MODEL["MODEL — Modeling Foundations (Draft)"]
  NUMRNG["NUMRNG — Numbers and Randomness (Stub)"]
  REL["REL — Artifact Relationships (Draft)"]
  SCEN["SCEN — Campaign Integration and Acceptance Tests (Stub)"]
  TURN["TURN — Turn Resolution (Stub)"]
  WEB["WEB — Web UI (Stub)"]
  AGENT --> COMBAT
  AGENT --> ECON
  AGENT --> INFO
  AGENT --> INVSTG
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
  DOM --> MODEL
  DOM --> TURN
  ECON --> INFO
  ECON --> MISSION
  ECON --> TURN
  ENG --> DOM
  ENG --> NUMRNG
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
  INFO --> INVSTG
  INFO --> WEB
  INIT --> CAMP
  INIT --> ECON
  INIT --> SCEN
  INVSTG --> INFO
  INVSTG --> TURN
  LEAD --> FACTION
  LEAD --> INFO
  LEAD --> INVSTG
  MISSION --> INFO
  MISSION --> LEAD
  MISSION --> TURN
  MODEL --> API
  MODEL --> ENG
  MODEL --> INFO
  MODEL --> INIT
  NUMRNG --> AGENT
  NUMRNG --> COMBAT
  NUMRNG --> ECON
  NUMRNG --> FACTION
  NUMRNG --> HIST
  NUMRNG --> INVSTG
  NUMRNG --> TURN
  REL --> CONV
  TURN --> CAMP
  TURN --> SCEN
  WEB --> SCEN
```
