# References Relationships

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

A → B means A is referenced by B: the text of B links to A. Layer 1 is drawn at the top and holds the specifications that reference no other specification in the diagram; every other specification is drawn in the layer below the lowest-drawn specification it references. Specifications that reference each other in a cycle share a layer. The table below each diagram lists the same layers and references as text, so a change to either shows in a diff.

[Back to the relationship graph index](../relationships.md)

[Back to the derived specification catalog](../README.md)

## Game specifications

![References relationships: Game specifications](../../images/diagrams/references-game.svg)

| Layer | Specification | References |
| --- | --- | --- |
| 1 | CORE Core Concepts |  |
| 2 | ENG Engine Contract | CORE |
| 3 | CLI Command-Line Interface | CORE, ENG |
| 3 | COND Conditions | CORE, ENG |
| 3 | CSTATE Campaign State | CORE, ENG |
| 3 | DEPDIR Gameplay Dependency Direction | CORE, ENG |
| 3 | EFFECT Effect Lists | CORE, ENG |
| 3 | HEADLESS Headless First | CORE, ENG |
| 4 | DETERM Determinism and Randomness | CORE, CSTATE, ENG |
| 4 | GDR Game Data Records | CORE, CSTATE, ENG |
| 5 | CINST Campaign Instances | CORE, DETERM, ENG |
| 5 | NUMBERS Numbers | CORE, DETERM, ENG |
| 5 | SAVES Saves | CORE, CSTATE, DETERM, ENG |
| 6 | AUTO Autopilot | CORE, DETERM, ENG, SAVES |
| 6 | LIFE Campaign Lifecycle | CORE, ENG, SAVES |
| 6 | TIMELINE Timeline | CINST, CORE, CSTATE, ENG, SAVES |
| 6 | TODOS Outstanding Work Items | CINST, CORE, CSTATE, DETERM, ENG |
| 7 | DEV Developer Access | CINST, CORE, DETERM, ENG, SAVES, TIMELINE |
| 7 | WHIST History and Turn Report | CINST, CORE, CSTATE, ENG, TIMELINE |
| 8 | CONFIG Configuration | CORE, CSTATE, ENG, GDR, SAVES, TIMELINE, WHIST |
| 8 | DOM Domain Model | CINST, COND, CORE, CSTATE, EFFECT, ENG, GDR, WHIST |
| 8 | SCHEMA Storage Schema | CORE, CSTATE, ENG, SAVES, TIMELINE, WHIST |
| 9 | AGENT Agents | CINST, CORE, CSTATE, DOM, ENG, NUMBERS, TIMELINE, WHIST |
| 9 | COMP Compendium | COND, CORE, DOM, ENG |
| 9 | PAPI Player API | CORE, CSTATE, DOM, ENG |
| 10 | COMBAT Combat | AGENT, CINST, CORE, CSTATE, DETERM, DOM, ENG, NUMBERS, WHIST |
| 10 | FACTION Factions | AGENT, CINST, CORE, CSTATE, DOM, EFFECT, ENG, NUMBERS, WHIST |
| 10 | PLAN Specification Work Plan and Backlog | AGENT, CINST, CORE, DOM, ENG, WHIST |
| 10 | RECOVER Agent Recovery | AGENT, CINST, CORE, CSTATE, DOM, ENG, NUMBERS, WHIST |
| 11 | ECON Economy and Upgrades | AGENT, CINST, COMBAT, CONFIG, CORE, CSTATE, DOM, EFFECT, ENG, GDR, NUMBERS, TIMELINE, WHIST |
| 11 | ENDING Panic and Endings | CINST, CORE, CSTATE, DOM, EFFECT, ENG, FACTION, NUMBERS, TIMELINE, WHIST |
| 12 | MISSION Missions | AGENT, CINST, COMBAT, COND, CORE, CSTATE, DOM, ECON, EFFECT, ENG, FACTION, NUMBERS, WHIST |
| 12 | UVIEW Upgrades View | AGENT, CORE, DOM, ECON, ENG, NUMBERS |
| 13 | LEAD Leads and Progression | AGENT, COND, CORE, CSTATE, DOM, ECON, EFFECT, ENG, MISSION, WHIST |
| 14 | BASICAI Basic Autopilot AI | AGENT, AUTO, COMBAT, CORE, DOM, ECON, ENG, LEAD, MISSION |
| 14 | INVSTG Investigations | AGENT, CINST, CORE, CSTATE, DOM, EFFECT, ENG, LEAD, NUMBERS, WHIST |
| 15 | GUI Graphical User Interface | AGENT, CINST, COMBAT, COMP, CORE, CSTATE, DOM, ECON, ENDING, ENG, INVSTG, LEAD, NUMBERS |
| 15 | TURN Turn Advancement | AGENT, CORE, DOM, ECON, EFFECT, ENDING, ENG, FACTION, INVSTG, WHIST |
| 16 | COMPV Compendium View | AGENT, COMP, CORE, DOM, ECON, EFFECT, ENG, GUI, INVSTG, LEAD, NUMBERS |
| 16 | CVIEW Charts View | AGENT, COMBAT, CORE, DOM, ECON, ENDING, ENG, GUI, MISSION, WHIST |
| 16 | HVIEW History View | AGENT, COMBAT, CORE, CSTATE, DOM, ENG, GUI, WHIST |
| 16 | LVIEW Leads View | AGENT, CINST, DOM, ECON, EFFECT, ENG, GUI, INVSTG, LEAD |
| 16 | SITP Situation Panel | AGENT, CORE, DOM, ECON, ENG, GUI |
| 16 | VIS Visual Design | AGENT, COMBAT, CORE, DOM, ECON, ENG, GUI, INVSTG, LEAD, LIFE, SAVES |
| 17 | AVIEW Agents View | AGENT, CINST, COMBAT, CORE, DOM, ECON, ENG, GUI, VIS, WHIST |
| 17 | MENU Main Menu | CONFIG, CORE, CSTATE, DETERM, ENG, GDR, GUI, LIFE, SAVES, VIS |
| 17 | MUSIC Music | CORE, ENG, GUI, VIS |
| 17 | MVIEW Missions View | AGENT, CINST, COMBAT, DOM, ECON, ENG, FACTION, GUI, MISSION, VIS, WHIST |
| 17 | TFOCUS Test Focus | VIS |
| 17 | TSUM Turn Summary | AGENT, COMBAT, CSTATE, DOM, ENG, GUI, INVSTG, SITP, VIS |
| 18 | GDRS GDRs | AGENT, COMBAT, COMP, COND, CONFIG, CORE, CSTATE, DOM, ECON, EFFECT, ENDING, ENG, FACTION, GDR, INVSTG, LEAD, MUSIC, VIS |
| 18 | SOUNDS Sounds | COMP, COMPV, CORE, ENG, GUI, LIFE, TSUM |
| 18 | TRVIEW Turn Report View | AGENT, CINST, COMBAT, CSTATE, DOM, ENG, GUI, TSUM |
| 19 | CSCR Campaign Screen | AGENT, AUTO, CORE, CSTATE, DOM, ENDING, ENG, GUI, LIFE, MUSIC, SAVES, SITP, SOUNDS, TSUM, VIS |
| 19 | PLACE Implementation Placement | CORE, MUSIC, SOUNDS, VIS |
| 20 | CTEST Campaign Tests | CORE, DOM, ENG, PLACE |
| 20 | FEEDBACK Implementation Feedback | PLACE |
| 20 | GHPAGES GitHub Pages Deployment | CORE, ENG, PLACE |
| 20 | GLOBE Globe Integration | CORE, ENG, GUI, PLACE, VIS |
| 20 | LICENSE Implementation License | PLACE |
| 20 | LOOP Development Loop | CORE, ENG, PLACE, VIS |
| 20 | TESTVAL Test Values | CORE, PLACE |
| 20 | TRACK Specification Tracking | PLACE |
| 21 | APPERF Autopilot Performance | AGENT, BASICAI, COMBAT, COND, CORE, CSTATE, DOM, ECON, ENG, FEEDBACK, PLACE, SAVES |
| 21 | REUSE Rule Reuse | COMBAT, CORE, DOM, ENG, PLACE, TRACK |
| 21 | UPDATES Specification Updates | CORE, FEEDBACK, MUSIC, PLACE, SOUNDS, TESTVAL, TRACK, VIS |

## Governance specifications

![References relationships: Governance specifications](../../images/diagrams/references-governance.svg)

| Layer | Specification                                  | References |
| ----- | ---------------------------------------------- | ---------- |
| 1     | CONV Specification Conventions                 |            |
| 2     | LOOP Development Loop                          | CONV       |
| 2     | PLAN Specification Work Plan and Backlog       | CONV       |
| 2     | REL Artifact Relationships                     | CONV       |
| 2     | TERM Terminology Conventions                   | CONV       |
| 2     | TODOS Outstanding Work Items                   | CONV       |
| 3     | DCONV Design Specification Conventions         | CONV, TERM |
| 3     | GLOSS Glossary Conventions                     | CONV, TERM |
| 3     | ICONV Implementation Specification Conventions | CONV, REL  |
| 3     | OVW Overview Conventions                       | CONV, REL  |
