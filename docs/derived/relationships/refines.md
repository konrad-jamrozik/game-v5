# Refines Relationships

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

A → B means A is refined by B.

[Back to the relationship graph index](../relationships.md)

[Back to the derived specification catalog](../README.md)

## Model and gameplay specifications

```mermaid
flowchart LR
  AGENT["AGENT — Agents (Stub)"]
  API["API — TypeScript Player API (Stub)"]
  AUTO["AUTO — Autopilot (Draft)"]
  CAMP["CAMP — Campaign (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  DOM["DOM — Domain Model (Draft)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  FACTION["FACTION — Factions (Stub)"]
  INVSTG["INVSTG — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  AUTO --> API
  DOM --> AGENT
  DOM --> CAMP
  DOM --> COMBAT
  DOM --> ECON
  DOM --> FACTION
  DOM --> INVSTG
  DOM --> LEAD
  DOM --> MISSION
```

## Engine contract

```mermaid
flowchart LR
  API["API — TypeScript Player API (Stub)"]
  CSTATE["CSTATE — Campaign State (Accepted)"]
  DEV["DEV — Developer API (Stub)"]
  ENG["ENG — Engine Contract (Draft)"]
  INFO["INFO — Player Information (Stub)"]
  NUMRNG["NUMRNG — Numbers and Randomness (Stub)"]
  TURN["TURN — Turn Resolution (Stub)"]
  ENG --> API
  ENG --> CSTATE
  ENG --> DEV
  ENG --> INFO
  ENG --> NUMRNG
  ENG --> TURN
```
