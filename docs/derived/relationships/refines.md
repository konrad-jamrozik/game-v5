# Refines Relationships

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

A → B means A is refined by B.

[Back to the relationship graph index](../relationships.md)

[Back to the derived specification catalog](../README.md)

## Model and gameplay specifications

```mermaid
flowchart LR
  AGENT["AGENT — Agents (Stub)"]
  CAMP["CAMP — Campaign (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  DOM["DOM — Domain Model (Draft)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  FACTION["FACTION — Factions (Stub)"]
  HIST["HIST — History and Persistence (Stub)"]
  INIT["INIT — Initial Campaign Content (Stub)"]
  INVSTG["INVSTG — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  MODEL["MODEL — Modeling Foundations (Draft)"]
  NUMRNG["NUMRNG — Numbers and Randomness (Stub)"]
  CAMP --> INIT
  DOM --> AGENT
  DOM --> CAMP
  DOM --> COMBAT
  DOM --> ECON
  DOM --> FACTION
  DOM --> INVSTG
  DOM --> LEAD
  DOM --> MISSION
  ECON --> INIT
  FACTION --> INIT
  LEAD --> INIT
  MISSION --> INIT
  MODEL --> DOM
  MODEL --> HIST
  MODEL --> NUMRNG
```

## Engine contract

```mermaid
flowchart LR
  API["API — TypeScript Player API (Stub)"]
  DEV["DEV — Developer API (Stub)"]
  ENG["ENG — Engine Contract (Draft)"]
  HIST["HIST — History and Persistence (Stub)"]
  INFO["INFO — Player Information (Stub)"]
  TURN["TURN — Turn Resolution (Stub)"]
  ENG --> API
  ENG --> DEV
  ENG --> HIST
  ENG --> INFO
  ENG --> TURN
```
