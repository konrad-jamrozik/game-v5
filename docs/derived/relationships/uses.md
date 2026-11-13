# Uses Relationships

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

A → B means A is used by B.

[Back to the relationship graph index](../relationships.md)

[Back to the derived specification catalog](../README.md)

## Game specifications

```mermaid
flowchart TD
  DOM["DOM — Domain Model (Draft)"]
  AGENT["AGENT — Agents (Stub)"]
  API["API — TypeScript Player API (Stub)"]
  AUTO["AUTO — Autopilot (Draft)"]
  CLI["CLI — Terminal CLI (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  CONFIG["CONFIG — Configuration (Draft)"]
  CORE["CORE — Core Concepts (Accepted)"]
  CSTATE["CSTATE — Campaign State (Accepted)"]
  DEPDIR["DEPDIR — Gameplay Dependency Direction (Draft)"]
  DEV["DEV — Developer API (Stub)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  ENDING["ENDING — Panic and Endings (Stub)"]
  ENG["ENG — Engine Contract (Draft)"]
  FACTION["FACTION — Factions (Stub)"]
  GDR["GDR — Game Data Records (Accepted)"]
  INFO["INFO — Player Information (Stub)"]
  INVSTG["INVSTG — Investigations (Stub)"]
  LEAD["LEAD — Leads and Progression (Stub)"]
  MISSION["MISSION — Missions (Stub)"]
  NUMRNG["NUMRNG — Numbers and Randomness (Stub)"]
  PLAN["PLAN — Specification Work Plan and Backlog (Accepted)"]
  SAVES["SAVES — Saves (Draft)"]
  SCEN["SCEN — Campaign Integration and Acceptance Tests (Stub)"]
  SCHEMA["SCHEMA — Storage Schema (Stub)"]
  TIMELINE["TIMELINE — Timeline (Draft)"]
  TODOS["TODOS — Outstanding Work Items (Draft)"]
  WEB["WEB — Web UI (Stub)"]
  AGENT --> COMBAT
  AGENT --> ECON
  AGENT --> INFO
  AGENT --> INVSTG
  AGENT --> MISSION
  API --> CLI
  API --> DEV
  API --> SCEN
  API --> WEB
  AUTO --> CLI
  AUTO --> INFO
  AUTO --> WEB
  CLI --> SCEN
  COMBAT --> AGENT
  COMBAT --> INFO
  COMBAT --> MISSION
  CORE --> API
  CORE --> AUTO
  CORE --> CLI
  CORE --> CONFIG
  CORE --> CSTATE
  CORE --> DEPDIR
  CORE --> DEV
  CORE --> DOM
  CORE --> ENDING
  CORE --> ENG
  CORE --> FACTION
  CORE --> GDR
  CORE --> INFO
  CORE --> INVSTG
  CORE --> LEAD
  CORE --> MISSION
  CORE --> NUMRNG
  CORE --> SAVES
  CORE --> SCEN
  CORE --> TIMELINE
  CORE --> WEB
  CSTATE --> API
  CSTATE --> CONFIG
  CSTATE --> DEPDIR
  CSTATE --> DEV
  CSTATE --> DOM
  CSTATE --> GDR
  CSTATE --> INFO
  CSTATE --> NUMRNG
  CSTATE --> TIMELINE
  DEV --> API
  DOM --> API
  DOM --> DEV
  DOM --> INFO
  ECON --> AGENT
  ECON --> INFO
  ECON --> MISSION
  ENDING --> INFO
  ENG --> AGENT
  ENG --> AUTO
  ENG --> CLI
  ENG --> CONFIG
  ENG --> DEPDIR
  ENG --> DOM
  ENG --> ECON
  ENG --> ENDING
  ENG --> FACTION
  ENG --> GDR
  ENG --> INVSTG
  ENG --> MISSION
  ENG --> SAVES
  ENG --> SCHEMA
  ENG --> TIMELINE
  ENG --> WEB
  FACTION --> INFO
  FACTION --> LEAD
  FACTION --> MISSION
  GDR --> DOM
  GDR --> INFO
  INFO --> API
  INFO --> CLI
  INFO --> INVSTG
  INFO --> WEB
  INVSTG --> INFO
  LEAD --> FACTION
  LEAD --> INFO
  LEAD --> INVSTG
  MISSION --> INFO
  MISSION --> LEAD
  NUMRNG --> AGENT
  NUMRNG --> COMBAT
  NUMRNG --> ECON
  NUMRNG --> FACTION
  NUMRNG --> INVSTG
  PLAN --> TODOS
  SAVES --> API
  SAVES --> CLI
  SAVES --> SCEN
  SAVES --> SCHEMA
  SAVES --> WEB
  TIMELINE --> API
  TIMELINE --> AUTO
  TIMELINE --> CLI
  TIMELINE --> CONFIG
  TIMELINE --> DEV
  TIMELINE --> INFO
  TIMELINE --> SAVES
  TIMELINE --> SCEN
  TIMELINE --> SCHEMA
  TIMELINE --> WEB
  WEB --> SCEN
```

## Relationship governance

```mermaid
flowchart LR
  CONV["CONV — Specification Conventions (Accepted)"]
  REL["REL — Artifact Relationships (Draft)"]
  REL --> CONV
```
