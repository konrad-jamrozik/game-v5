# Derived Specification Views

> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.

These informative views are derived from the registered Markdown specifications. The source specifications remain authoritative.

- [Alphabetical glossary](glossary.md)
- [Specification relationship graphs](relationships.md)

## Counts by family

| Specification kind | Family        | Specifications |
| ------------------ | ------------- | -------------- |
| Governance         | Conventions   | 8              |
| Governance         | Process       | 3              |
| Design             | Foundation    | 17             |
| Design             | Mechanics     | 12             |
| Design             | Content       | 1              |
| Design             | UI            | 17             |
| Design             | Autopilot AIs | 1              |
| Implementation     | Mandatory     | 4              |
| Implementation     | Guidance      | 4              |
| Implementation     | Recipes       | 3              |

## Conventions

| ID | Document | Owns |
| --- | --- | --- |
| CONV | [Specification Conventions](../specs/governance/conventions/spec-conventions.md) | How every specification is written, whatever its Specification kind: layout, metadata, ownership, wording, and unspecified content. |
| DCONV | [Design Specification Conventions](../specs/governance/conventions/design-spec-conventions.md) | What a Design specification may state, and how exactly it states rules, formulas, game data, and examples. |
| GLOSS | [Glossary Conventions](../specs/governance/conventions/glossary-conventions.md) | How a specification's Glossary is arranged and how its definitions are written. |
| ICONV | [Implementation Specification Conventions](../specs/governance/conventions/implementation-spec-conventions.md) | What an Implementation specification may state, and how its Binding decides its wording. |
| INDEX | [Game Specification Index](../specs/README.md) | Specification registration, navigation, and ownership summaries. |
| OVW | [Overview Conventions](../specs/governance/conventions/overview-conventions.md) | How the Overview of a specification and the overviews of Specification kinds and Families orient a reader. |
| REL | [Artifact Relationships](../specs/governance/conventions/artifact-relationships.md) | Term links, the References between specifications that they make, and the Reference graph's layering. |
| TERM | [Terminology Conventions](../specs/governance/conventions/terminology-conventions.md) | Canonical terms, Non-terms, and how Prohibited synonyms are recorded. |

## Process

| ID | Document | Owns |
| --- | --- | --- |
| LOOP | [Development Loop](../specs/governance/process/development-loop.md) | How the game is developed in a loop between specifications and Implementations, and the LLM skills that run it. |
| PLAN | [Specification Work Plan and Backlog](../specs/governance/process/work-plan.md) | Specification authoring order, review checkpoints, and work tracking. |
| TODOS | [Outstanding Work Items](../specs/governance/process/work-todos.md) | Known outstanding specification issues awaiting scheduling, with their affected batches. |

## Foundation

| ID | Document | Owns |
| --- | --- | --- |
| AUTO | [Autopilot](../specs/design/foundation/autopilot.md) | Autopilot limits, what an Autopilot AI receives, and Autopilot engagement lifecycle. |
| CINST | [Campaign Instances](../specs/design/foundation/campaign-instances.md) | How every thing in a Campaign's world is modeled as a Campaign instance. |
| COND | [Conditions](../specs/design/foundation/conditions.md) | How game data declares a yes-or-no question about a Campaign: Conditions, Condition kinds, and how Conditions combine. |
| CONFIG | [Configuration](../specs/design/foundation/configuration.md) | Kinds of setting, Global configuration, and the configuration cascade. |
| CORE | [Core Concepts](../specs/design/foundation/core-concepts.md) | Shared vocabulary for modeling and engine execution, e.g. Campaign, Session, and Game build. |
| CSTATE | [Campaign State](../specs/design/foundation/campaign-state.md) | What Campaign state is made of, what the Game rules read of it, and how Campaign initialization produces it. |
| DETERM | [Determinism and Randomness](../specs/design/foundation/determinism-and-randomness.md) | The determinism guarantee, the Campaign seed, rules for every random outcome, and unique identifiers under replay. |
| DEV | [Developer Access](../specs/design/foundation/developer-access.md) | Dev mode, full Campaign state inspection, Player cheat actions, and random outcome overrides. |
| EFFECT | [Effect Lists](../specs/design/foundation/effect-lists.md) | How game data declares the changes the Game rules make on one occasion: Effects, Effect kinds, and Effect lists. |
| ENG | [Engine Contract](../specs/design/foundation/engine-contract.md) | The engine as a whole: how it divides, who may call what, and the guarantees every engine subsystem keeps. |
| GDR | [Game Data Records](../specs/design/foundation/game-data-records.md) | The purposes a GDR can serve relative to the Game rules and Campaign state, with a worked example of each. |
| LIFE | [Campaign Lifecycle](../specs/design/foundation/campaign-lifecycle.md) | Session start and end, creating, loading, selecting, and closing the Current campaign, and Session status. |
| NUMBERS | [Numbers](../specs/design/foundation/numbers.md) | That every stored quantity is held as a whole number, of units or of hundredths, the rounding operations, how percentages and probabilities are computed, and exact evaluation. |
| PAPI | [Player API](../specs/design/foundation/player-api.md) | What the player can see of a Campaign, and how gameplay actions change it. |
| SAVES | [Saves](../specs/design/foundation/saves.md) | Campaign save contents, saving, loading, Autosaves, deleting Campaign saves, the Save size limit, and Game build compatibility. |
| TIMELINE | [Timeline](../specs/design/foundation/timeline.md) | The structure of the Timeline, undo and redo of the Player actions of the current Turn, undo and redo across Turns, and what returning to a World state guarantees. |
| WHIST | [History and Turn Report](../specs/design/foundation/world-history.md) | What a Campaign remembers about its past, and for how long, including the Turn report and what Player API returns of the past. |

## Mechanics

| ID | Document | Owns |
| --- | --- | --- |
| AGENT | [Agents](../specs/design/mechanics/agents-spec.md) | What an Agent has, the Combatant Role Type, Agent status, Assignments and the transit rule, effective skill, Training, Mission growth and Experience, work exhaustion, the start-work gate and Forced return, Agent creation and the initial roster, and the assignAgents and addAgents actions. |
| COMBAT | [Combat](../specs/design/mechanics/combat.md) | Enemies and the Combat GDRs, how a Combat is fought in Combat rounds, attacks and their random outcomes, Incapacitated, Combat rating, Combat outcomes, and the Combat report. |
| COMP | [Compendium](../specs/design/mechanics/compendium.md) | The EncyclopediaArticle GDR, and when an Encyclopedia article is Player-visible. |
| DOM | [Domain Model](../specs/design/mechanics/domain-model.md) | Game concepts, how they relate, and the structural invariants that span several concepts. |
| ECON | [Economy and Upgrades](../specs/design/mechanics/economy-and-upgrades.md) | The Agency's money, funding, and Upgrade Acquisitions, Agency income and upkeep, the Agent cap, Transport cap, and Training cap, Upgrade effects, the money change in each Action record, and the hireAgent, dismissAgents, purchaseUpgrade, and addMoney actions. |
| ENDING | [Panic and Endings](../specs/design/mechanics/panic-and-endings.md) | Panic and how this Turn's changes to it are applied, the conditions that end a Campaign in Victory or Defeat, and what remains possible after a Campaign ending. |
| FACTION | [Factions](../specs/design/mechanics/factions.md) | What a Faction has, its creation, its escalation through Faction activity levels, Faction operation occurrence generation, and elimination. |
| INVSTG | [Investigations](../specs/design/mechanics/investigations.md) | What an Investigation has, the InvestigationArchetype and InvestigationParameters GDRs, the Investigation lifecycle, the startInvestigation and assignAgentsToInvestigation actions, leaving, Progress loss, and abandonment, Investigation progress, Assessment, completion, and the Team progress estimate query. |
| LEAD | [Leads and Progression](../specs/design/mechanics/leads-and-progression.md) | What a Lead GDR describes, Lead discovery, Lead availability, Lead status, and the effect of completing a Lead. |
| MISSION | [Missions](../specs/design/mechanics/missions.md) | What a Mission site and a Mission have, Mission site creation, the Mission site and Mission lifecycles, the deployAgents action, Mission resolution, expiration, and the Consequences for the Campaign. |
| RECOVER | [Agent Recovery](../specs/design/mechanics/agent-recovery.md) | Health recovery and exhaustion recovery of Agents, the RecoveryParameters GDR, and the result when several rules change one of those values in the same Turn. |
| TURN | [Turn Advancement](../specs/design/mechanics/turn-advancement.md) | The canonical order of Turn advancement steps and which values each step uses. |

## Content

| ID | Document | Owns |
| --- | --- | --- |
| BOOT | [Bootstrap GDRs](../specs/design/content/bootstrap-gdrs.md) | Which Game Data Records (GDRs) a Game build supplies so that a first playable Campaign can start, and how those GDRs form the Victory path. |

## UI

| ID | Document | Owns |
| --- | --- | --- |
| AVIEW | [Agents View](../specs/design/ui/screens/agents-view.md) | What the Agents View of the Campaign screen shows and how it hires, dismisses, and assigns Agents. |
| CLI | [Command-Line Interface](../specs/design/ui/cli.md) | Guidance on the command-line interface, the headless interface that makes the whole engine API playable from a terminal. |
| COMPV | [Compendium View](../specs/design/ui/screens/compendium-view.md) | What the Compendium View of the Campaign screen shows and how the Player finds an article in it. |
| CSCR | [Campaign Screen](../specs/design/ui/screens/campaign-screen.md) | The regions of the Campaign screen of the graphical user interface, its Side panel, its Detail views and the View trail through them, its status bar values and controls, its Autopilot controls, and its keyboard shortcuts view. |
| CVIEW | [Charts View](../specs/design/ui/screens/charts-view.md) | Which charts the Charts View of the Campaign screen shows, what each Faction chart counts, and in which order. |
| GUI | [Graphical User Interface](../specs/design/ui/gui.md) | Which screens the graphical user interface has, the progress indicators that several of them show, the warnings it gives, and how it names an Enemy. |
| HVIEW | [History View](../specs/design/ui/screens/history-view.md) | What the History View of the Campaign screen shows and in which order: its columns, the events of each Turn with the links from its Missions to their Mission sites, and the list of each Turn's Player actions. |
| LVIEW | [Leads View](../specs/design/ui/screens/leads-view.md) | What the Leads View of the Campaign screen shows, how its panes are arranged, and how it starts and staffs Investigations. |
| MENU | [Main Menu](../specs/design/ui/screens/main-menu.md) | What the Main menu screen of the graphical user interface shows and how it is laid out. |
| MUSIC | [Music](../specs/design/ui/music.md) | The music of the graphical user interface: the Soundtrack, how it is played, its settings, and the Music control. |
| MVIEW | [Missions View](../specs/design/ui/screens/missions-view.md) | What the Missions View of the Campaign screen shows, how its panes are arranged, and how it deploys Agents. |
| SITP | [Situation Panel](../specs/design/ui/screens/situation-panel.md) | What the Situation panel of the Campaign screen shows. |
| SOUNDS | [Sounds](../specs/design/ui/sounds.md) | The short sounds the graphical user interface plays in answer to the Player: the Sound set, when each Sound plays, and its settings. |
| TRVIEW | [Turn Report View](../specs/design/ui/screens/turn-report-view.md) | What the Turn Report View of the Campaign screen shows of the most recent Turn report, and how it opens a Combat report or reopens the Turn summary. |
| TSUM | [Turn Summary](../specs/design/ui/screens/turn-summary.md) | When the Turn summary dialog of the Campaign screen appears and what it shows. |
| UVIEW | [Upgrades View](../specs/design/ui/screens/upgrades-view.md) | What the Upgrades View of the Campaign screen shows and how it purchases Upgrades. |
| VIS | [Visual Design](../specs/design/ui/visual-design.md) | How the graphical user interface looks: its visual direction, Design tokens, and the styling of its components and charts. |

## Autopilot AIs

| ID | Document | Owns |
| --- | --- | --- |
| BASICAI | [Basic Autopilot AI](../specs/design/autopilot-ais/basic-autopilot-ai.md) | The goals the Basic Autopilot AI pursues, how it prioritizes them within a Turn, and what it deliberately leaves alone. |

## Mandatory

| ID | Document | Owns |
| --- | --- | --- |
| FEEDBACK | [Implementation Feedback](../specs/implementation/mandatory/implementation-feedback.md) | The feedback files of Specification problems and Implementation decisions that each Implementation keeps. |
| LICENSE | [Implementation License](../specs/implementation/mandatory/implementation-license.md) | The license under which each Implementation is published, and the files that state it. |
| PLACE | [Implementation Placement](../specs/implementation/mandatory/implementation-placement.md) | Where each implementation and everything it needs reside, relative to the Spec repo. |
| TRACK | [Specification Tracking](../specs/implementation/mandatory/specification-tracking.md) | The Specification baseline and Specification map records that tie each Implementation to the specifications it conforms to. |

## Guidance

| ID | Document | Owns |
| --- | --- | --- |
| DEPDIR | [Gameplay Dependency Direction](../specs/implementation/guidance/gameplay-dependency-direction.md) | Non-behavioural guidance keeping gameplay code from reaching Campaign state beyond its necessary inputs. |
| HEADLESS | [Headless First](../specs/implementation/guidance/headless-first.md) | Guidance that an Implementation becomes fully playable headlessly, through its Command-Line Interface, before work on its Graphical User Interface begins. |
| SCHEMA | [Storage Schema](../specs/implementation/guidance/storage-schema.md) | Non-behavioural guidance on the physical layout of everything the game persists. |
| STACK | [Tech Stack Suggestion](../specs/implementation/guidance/tech-stack-suggestion.md) | A suggested technology stack for a browser Implementation. |

## Recipes

| ID | Document | Owns |
| --- | --- | --- |
| GHPAGES | [GitHub Pages Deployment](../specs/implementation/recipes/github-pages-deployment.md) | Guidance on publishing an Implementation to a public GitHub repository that deploys every push to GitHub Pages and checks the Implementation once a day. |
| GLOBE | [Globe Integration](../specs/implementation/recipes/globe-integration.md) | Guidance on carrying the reference globe of the Spec repo into an Implementation and showing it in its graphical user interface. |
| UPDATES | [Specification Updates](../specs/implementation/recipes/specification-updates.md) | Non-behavioural guidance for bringing an Implementation from its Specification baseline to a later Specification revision. |
