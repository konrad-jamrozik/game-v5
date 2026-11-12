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
  CAMP["CAMP — Campaign (Stub)"]
  CLI["CLI — Terminal CLI (Stub)"]
  COMBAT["COMBAT — Combat (Stub)"]
  CONFIG["CONFIG — Configuration (Draft)"]
  CORE["CORE — Core Concepts (Accepted)"]
  CSTATE["CSTATE — Campaign State (Accepted)"]
  DEPDIR["DEPDIR — Gameplay Dependency Direction (Draft)"]
  DEV["DEV — Developer API (Stub)"]
  ECON["ECON — Economy and Upgrades (Stub)"]
  ENG["ENG — Engine Contract (Draft)"]
  FACTION["FACTION — Factions (Stub)"]
  GDR["GDR — Game Data Records (Accepted)"]
  INFO["INFO — Player Information (Stub)"]
  INIT["INIT — Initial Campaign Content (Stub)"]
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
  AUTO --> CLI
  AUTO --> INFO
  AUTO --> WEB
  CAMP --> INFO
  CAMP --> INIT
  CAMP --> TURN
  CLI --> SCEN
  COMBAT --> AGENT
  COMBAT --> INFO
  COMBAT --> MISSION
  CORE --> API
  CORE --> AUTO
  CORE --> CAMP
  CORE --> CLI
  CORE --> CONFIG
  CORE --> CSTATE
  CORE --> DEPDIR
  CORE --> DEV
  CORE --> DOM
  CORE --> ENG
  CORE --> FACTION
  CORE --> GDR
  CORE --> INFO
  CORE --> INIT
  CORE --> INVSTG
  CORE --> LEAD
  CORE --> MISSION
  CORE --> NUMRNG
  CORE --> SAVES
  CORE --> SCEN
  CORE --> TIMELINE
  CORE --> WEB
  CSTATE --> API
  CSTATE --> CAMP
  CSTATE --> CONFIG
  CSTATE --> DEPDIR
  CSTATE --> DEV
  CSTATE --> DOM
  CSTATE --> GDR
  CSTATE --> INFO
  CSTATE --> INIT
  CSTATE --> NUMRNG
  CSTATE --> TIMELINE
  DEV --> API
  DOM --> API
  DOM --> CONFIG
  DOM --> DEV
  DOM --> INFO
  DOM --> INIT
  DOM --> TURN
  ECON --> AGENT
  ECON --> INFO
  ECON --> INIT
  ECON --> MISSION
  ECON --> TURN
  ENG --> AUTO
  ENG --> CAMP
  ENG --> CLI
  ENG --> CONFIG
  ENG --> DEPDIR
  ENG --> DOM
  ENG --> GDR
  ENG --> SAVES
  ENG --> SCHEMA
  ENG --> TIMELINE
  ENG --> WEB
  FACTION --> INFO
  FACTION --> INIT
  FACTION --> LEAD
  FACTION --> MISSION
  FACTION --> TURN
  GDR --> DOM
  GDR --> INFO
  GDR --> INIT
  INFO --> API
  INFO --> CLI
  INFO --> INVSTG
  INFO --> WEB
  INIT --> AGENT
  INIT --> CAMP
  INIT --> ECON
  INIT --> FACTION
  INIT --> LEAD
  INIT --> MISSION
  INIT --> SCEN
  INVSTG --> INFO
  INVSTG --> TURN
  LEAD --> FACTION
  LEAD --> INFO
  LEAD --> INIT
  LEAD --> INVSTG
  MISSION --> INFO
  MISSION --> INIT
  MISSION --> LEAD
  MISSION --> TURN
  NUMRNG --> AGENT
  NUMRNG --> COMBAT
  NUMRNG --> ECON
  NUMRNG --> FACTION
  NUMRNG --> INVSTG
  NUMRNG --> TURN
  PLAN --> TODOS
  SAVES --> API
  SAVES --> CLI
  SAVES --> SCEN
  SAVES --> SCHEMA
  SAVES --> WEB
  TIMELINE --> API
  TIMELINE --> AUTO
  TIMELINE --> CAMP
  TIMELINE --> CLI
  TIMELINE --> DEV
  TIMELINE --> INFO
  TIMELINE --> SAVES
  TIMELINE --> SCEN
  TIMELINE --> SCHEMA
  TIMELINE --> WEB
  TURN --> CAMP
  TURN --> ECON
  TURN --> SCEN
  WEB --> SCEN
```

## Relationship governance

```mermaid
flowchart LR
  CONV["CONV — Specification Conventions (Accepted)"]
  REL["REL — Artifact Relationships (Draft)"]
  REL --> CONV
```
