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
| 2 | GHPAGES GitHub Pages Deployment | CORE |
| 3 | CLI Command-Line Interface | ENG |
| 3 | COND Conditions | CORE, ENG |
| 3 | CSTATE Campaign State | CORE, ENG |
| 3 | DEPDIR Gameplay Dependency Direction | CORE, ENG |
| 3 | EFFECT Effect Lists | CORE, ENG |
| 3 | HEADLESS Headless First | CORE, ENG |
| 3 | NUMBERS Numbers | CORE, ENG |
| 4 | DETERM Determinism and Randomness | CORE, CSTATE, ENG |
| 4 | GDR Game Data Records | CORE, CSTATE, ENG |
| 5 | AUTO Autopilot | CORE, DETERM, ENG |
| 5 | CINST Campaign Instances | CORE, DETERM, ENG |
| 5 | SAVES Saves | CORE, CSTATE, DETERM, ENG |
| 6 | LIFE Campaign Lifecycle | CORE, ENG, SAVES |
| 6 | TIMELINE Timeline | CORE, CSTATE, ENG, SAVES |
| 7 | DEV Developer Access | CINST, CORE, DETERM, ENG, SAVES, TIMELINE |
| 7 | WHIST History and Turn Report | CINST, CORE, CSTATE, ENG, TIMELINE |
| 8 | DOM Domain Model | CINST, COND, CORE, CSTATE, EFFECT, ENG, GDR, WHIST |
| 8 | SCHEMA Storage Schema | CORE, CSTATE, ENG, SAVES, TIMELINE, WHIST |
| 9 | AGENT Agents | CINST, CORE, CSTATE, DETERM, DOM, ENG, NUMBERS, WHIST |
| 9 | ENDING Panic and Endings | CORE, CSTATE, DOM, EFFECT, ENG, NUMBERS, WHIST |
| 9 | FACTION Factions | CINST, CORE, CSTATE, DOM, EFFECT, ENG, NUMBERS, WHIST |
| 9 | PAPI Player API | CORE, CSTATE, DOM, ENG |
| 10 | COMBAT Combat | AGENT, CINST, CORE, CSTATE, DETERM, DOM, ENG, FACTION, LIFE, NUMBERS, WHIST |
| 10 | HVIEW History View | AGENT, CORE, CSTATE, DOM, ENG, WHIST |
| 10 | RECOVER Agent Recovery | AGENT, CINST, CORE, CSTATE, DOM, ENG, NUMBERS, WHIST |
| 11 | EQUIP Equipment | AGENT, CINST, COMBAT, COND, CORE, CSTATE, DOM, ENG, WHIST |
| 12 | COMP Compendium | COMBAT, COND, CORE, DOM, ENG, EQUIP |
| 12 | ECON Economy and Upgrades | AGENT, COMBAT, CORE, CSTATE, DOM, EFFECT, ENG, EQUIP, GDR, NUMBERS, WHIST |
| 13 | MISSION Missions | AGENT, CINST, COMBAT, COND, CORE, CSTATE, DOM, ECON, EFFECT, ENG, EQUIP, FACTION, NUMBERS, WHIST |
| 13 | UVIEW Upgrades View | AGENT, CORE, DOM, ECON |
| 14 | LEAD Leads and Progression | AGENT, COND, CORE, CSTATE, DOM, ECON, EFFECT, ENG, MISSION, WHIST |
| 15 | BASICAI Basic Autopilot AI | AGENT, CINST, COMBAT, CORE, DOM, ECON, ENG, EQUIP, FACTION, LEAD, MISSION |
| 15 | INVSTG Investigations | AGENT, CINST, CORE, CSTATE, DOM, ENG, LEAD, NUMBERS, WHIST |
| 16 | GUI Graphical User Interface | AGENT, CINST, COMP, CORE, CSTATE, DOM, ECON, ENG, INVSTG, LEAD, NUMBERS |
| 16 | TURN Turn Advancement | AGENT, COMBAT, CORE, CSTATE, DETERM, DOM, ECON, ENDING, ENG, EQUIP, FACTION, INVSTG, WHIST |
| 17 | COMPV Compendium View | AGENT, COMP, CORE, DOM, ECON, EFFECT, ENG, GUI, INVSTG, LEAD, MISSION |
| 17 | CRPLAY Combat Replay | AGENT, COMBAT, CORE, DOM, GUI |
| 17 | CVIEW Charts View | AGENT, COMBAT, CORE, DOM, ECON, ENDING, ENG, GUI, MISSION, WHIST |
| 17 | LVIEW Leads View | AGENT, CINST, DOM, ECON, EFFECT, ENG, GUI, INVSTG, LEAD |
| 17 | MUSIC Music | CORE, ENG, GUI |
| 17 | MVIEW Missions View | AGENT, CINST, COMBAT, DOM, ECON, ENG, FACTION, GUI, MISSION, WHIST |
| 17 | SITP Situation Panel | AGENT, CORE, DOM, ECON, ENG, GUI |
| 17 | STVIEW Storage View | COMBAT, CORE, DOM, ENG, EQUIP, GUI |
| 18 | CSIM Combat Simulator | AGENT, COMBAT, CORE, CRPLAY, DOM, ENG, GUI, LIFE |
| 18 | TSUM Turn Summary | AGENT, COMBAT, CORE, CRPLAY, CSTATE, DOM, ECON, ENG, EQUIP, GUI, INVSTG, SITP |
| 19 | SOUNDS Sounds | COMBAT, COMP, COMPV, CORE, CRPLAY, ENG, GUI, TSUM |
| 19 | TRVIEW Turn Report View | AGENT, COMBAT, CSTATE, DOM, ENG, EQUIP, GUI, TSUM |
| 19 | TUTOR Tutorials | AGENT, COMP, COND, CORE, CSTATE, DOM, ENG, GUI, TSUM |
| 19 | VIS Visual Design | AGENT, COMBAT, CORE, CRPLAY, DOM, ECON, ENG, GUI, INVSTG, LEAD, LIFE, TSUM |
| 20 | AVIEW Agents View | AGENT, CINST, COMBAT, CORE, DOM, ECON, ENG, EQUIP, GUI, RECOVER, VIS |
| 20 | CONFIG Configuration | CORE, CRPLAY, CSIM, CSTATE, DETERM, ENG, GDR, GUI, SAVES, TIMELINE, TUTOR, VIS, WHIST |
| 20 | CSCR Campaign Screen | AGENT, AUTO, CORE, CSTATE, DOM, ENDING, ENG, GUI, LIFE, SAVES, SITP, SOUNDS, TSUM |
| 20 | PLACE Implementation Placement | CORE, MUSIC, SOUNDS, VIS |
| 21 | ALAB Autopilot Lab | BASICAI, COMBAT, CONFIG, CORE, CSIM, DOM, ECON, ENG, FACTION, GDR |
| 21 | APPERF Autopilot Performance | AGENT, BASICAI, COMBAT, COND, CORE, CSTATE, DOM, ECON, ENG, PLACE, SAVES |
| 21 | CTEST Campaign Tests | BASICAI, CORE, DOM, ENG, PLACE |
| 21 | GLOBE Globe Integration | CORE, ENG, GUI, PLACE |
| 21 | LICENSE Implementation License | PLACE |
| 21 | LOOP Development Loop | CORE, ENG, PLACE, VIS |
| 21 | MENU Main Menu | CONFIG, CORE, CSIM, CSTATE, DETERM, ENG, GDR, GUI, LIFE, SAVES |
| 21 | REUSE Rule Reuse | COMBAT, CORE, DOM, ENG, PLACE |
| 21 | TESTVAL Test Values | CORE, PLACE |
| 22 | AIEXPECT Autopilot AI Expectations | ALAB, BASICAI, COMBAT, CONFIG, CORE, DOM, ENG |
| 22 | AISTUDY1 Basic Autopilot AI Study, 2026-11-25 | AGENT, ALAB, BASICAI, COMBAT, CONFIG, CORE, DOM, ECON, ENG, EQUIP, FACTION, GDR |
| 22 | GDRS GDRs | AGENT, COMBAT, COMP, CORE, DOM, ECON, EFFECT, ENG, EQUIP, FACTION, GDR, LEAD, LICENSE, MUSIC, TSUM, VIS |
| 23 | AISTUDY4 Basic Autopilot AI Study, 2026-11-27, current AI | AGENT, AIEXPECT, BASICAI, COMBAT, CORE, DOM, ECON, ENG, GDR |

## Governance specifications

![References relationships: Governance specifications](../../images/diagrams/references-governance.svg)

| Layer | Specification                                  | References |
| ----- | ---------------------------------------------- | ---------- |
| 1     | CONV Specification Conventions                 |            |
| 2     | LOOP Development Loop                          | CONV       |
| 2     | REL Artifact Relationships                     | CONV       |
| 2     | TERM Terminology Conventions                   | CONV       |
| 3     | DCONV Design Specification Conventions         | CONV, TERM |
| 3     | GLOSS Glossary Conventions                     | CONV, TERM |
| 3     | ICONV Implementation Specification Conventions | CONV, REL  |
| 3     | OVW Overview Conventions                       | CONV, REL  |
