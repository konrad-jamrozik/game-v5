# Domain Model

| Metadata    | Value                                                                               |
| ----------- | ----------------------------------------------------------------------------------- |
| Spec ID     | DOM                                                                                 |
| Family      | Foundation                                                                          |
| Status      | Draft                                                                               |
| Scope       | Game concepts, their properties and relationships, and structural domain invariants |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                      |
| Review      | Batch 1; proposed rules awaiting user review                                        |

# Purpose and boundaries

Define what exists in the game and how those concepts relate. A campaign contains one player-controlled agency that
allocates agents, pursues leads, undertakes missions, and opposes factions.

**Draft proposal:** the numbered requirements are proposed contracts, not accepted rules. Conceptual records may be
embedded, separately stored, or reconstructed provided their identity and meaning are preserved. This document does
not prescribe classes, database tables, a UI framework, or source-file layout.

[Modeling Foundations](modeling-foundations.md) owns the underpinning vocabulary and identity/reference conventions.
[Engine Contract](engine-contract.md) owns runtime guarantees. This document owns the game concepts and structural
relationships; mechanics own formulas and detailed transitions. Accepting this model alone does not make those mechanics
implementable. Numeric representation, RNG algorithms, phase order, content values, API/report schemas, and save encoding
remain in their owning specs.

# Relationships

- Uses [Modeling Foundations](./modeling-foundations.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Engine Contract](./engine-contract.md)
- Used by [History and Persistence](./history-and-persistence.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Turn Resolution](./turn-resolution.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Refined by [Agents](../mechanics/agents.md)
- Refined by [Campaign](../mechanics/campaign.md)
- Refined by [Combat](../mechanics/combat.md)
- Refined by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Refined by [Factions](../mechanics/factions.md)
- Refined by [Investigations](../mechanics/investigations.md)
- Refined by [Leads and Progression](../mechanics/leads-and-progression.md)
- Refined by [Missions](../mechanics/missions.md)

# Glossary

| Term                         | Definition                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Combatant                    | Reusable structure described by a TypeScript type for combat-related Agent and Enemy state, describing skill, health, exhaustion, and weapon capability; it is not a campaign-instance TypeScript type. |
| Campaign                     | The campaign-instance TypeScript type whose occurrences contain one player-controlled agency and the campaign instances governed by [DOM-001](#dom-001--campaign-boundary).                             |
| Agency                       | The player-controlled campaign-instance TypeScript type whose occurrence owns resources, upgrades, and the roster within a campaign.                                                                    |
| Agent                        | A campaign-instance TypeScript type whose occurrences have identity, attributes, assignments, and participation history.                                                                                |
| Lead                         | A content entry describing an investigation opportunity and its progression rules.                                                                                                                      |
| Lead progression             | Campaign state keyed by lead content entry, recording completions and earned facts.                                                                                                                     |
| Investigation                | A campaign-instance TypeScript type whose occurrences each represent one attempt at one lead.                                                                                                           |
| Mission                      | A campaign-instance TypeScript type whose occurrences refer to mission content and have their own origin, participants, and result.                                                                     |
| Enemy                        | A campaign-instance TypeScript type whose occurrences are each owned by one mission and refer to enemy content.                                                                                         |
| Battle result                | Retained combat facts owned by a resolved mission and used to determine campaign consequences.                                                                                                          |
| Faction                      | A campaign-instance TypeScript type whose occurrences refer to faction content and record their activity and progression.                                                                               |
| Faction operation occurrence | The origin of one Response mission, identified by that mission rather than a separate campaign instance.                                                                                                |
| Participation history        | Immutable records linking agents to investigations and missions in which they previously participated.                                                                                                  |
| Current assignment           | An agent's current orders, with activity references and a destination when travelling.                                                                                                                  |
| Task phase                   | The distinction between At assignment and In transit, including travel timing facts.                                                                                                                    |
| Report                       | Historical facts and explanations linked to commands or turns and campaign instances in the timeline.                                                                                                   |

This document uses [MODEL-001](modeling-foundations.md#model-001--campaign-instance-composition), [MODEL-002](modeling-foundations.md#model-002--identity), [MODEL-003](modeling-foundations.md#model-003--references), [MODEL-004](modeling-foundations.md#model-004--historical-fact-preservation), [MODEL-005](modeling-foundations.md#model-005--value-classification), and [MODEL-006](modeling-foundations.md#model-006--campaign-instance-construction) to describe game concepts. It applies the modeling vocabulary and
constraints; it does not add detail to the modeling language itself.

Generic modeling terms are owned by the [Modeling Foundations glossary](modeling-foundations.md#glossary).

# Concepts and contract

These are game concepts and relationships, not a serialized schema or a required storage hierarchy. A concept can
include hidden facts; belonging to the game domain does not imply that every property is visible to the player.
Player Information owns exact visibility. Generic modeling vocabulary belongs to
[Modeling Foundations](modeling-foundations.md#glossary).

## Modeling dimensions

Concept names in the first table identify campaign-instance TypeScript types unless the table explicitly assigns another modeling
role. A particular occurrence is a campaign instance of its declared TypeScript type. Use the
[Modeling Foundations glossary](modeling-foundations.md#glossary) for the generic terms. These classifications do not
prescribe implementation classes or storage records. Content entries are immutable, typed game data rather
than separately identified campaign instances.

## Types, multiplicity, and lifecycle

The following table enumerates the complete concept classifications declared by this draft.

| Concept                                                                                                       | Modeling role and multiplicity                                                                                                                                                                                                                                                               | Construction and historical transition / owner                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Campaign; Agency                                                                                              | Campaign-instance TypeScript types. Exactly one Agency campaign instance per Campaign campaign instance ([DOM-001](#dom-001--campaign-boundary)); each has its own Instance ID and archetype.                                                                                                | Campaign initialization and ongoing/won/lost transitions belong to [Campaign](../mechanics/campaign.md); detailed construction and historical retention rules remain unresolved there and in [History and Persistence](history-and-persistence.md).                                                                                                                                              |
| Agent                                                                                                         | Campaign-instance TypeScript type. Multiple campaign instances can belong to a campaign; roster limits belong to [Economy and Upgrades](../mechanics/economy-and-upgrades.md).                                                                                                               | Initial roster and recruitment details belong to [Initial Campaign Content](../content/initial-campaign.md) and Economy and Upgrades. Serving, Killed, and Dismissed are distinct states; Killed/Dismissed campaign instances retain final attributes and career without current assignments ([DOM-005](#dom-005--agent-lifecycle)). [Agents](../mechanics/agents.md) owns detailed transitions. |
| Investigation                                                                                                 | Campaign-instance TypeScript type. At most one Active campaign instance per lead content entry per campaign; repeated attempts have distinct campaign instances ([DOM-009](#dom-009--lead-versus-attempt)/[DOM-017](#dom-017--campaign-instance-identity-scope)).                            | Starting an attempt constructs a campaign instance; restarting after abandonment constructs another. Completed/Abandoned campaign instances retain identity and participation history without a current team. [Investigations](../mechanics/investigations.md) owns eligibility and transition details.                                                                                          |
| Mission                                                                                                       | Campaign-instance TypeScript type. A campaign can contain multiple campaign instances with distinct identities; each faction operation occurrence has exactly one Response mission ([DOM-011](#dom-011--mission-kind-and-provenance)/[DOM-017](#dom-017--campaign-instance-identity-scope)). | Initiative construction retains its investigation or scenario source; Response construction retains its operation origin. Exact construction timing, lifecycle, reattempt, and historical-transition rules remain with [Missions](../mechanics/missions.md).                                                                                                                                     |
| Enemy                                                                                                         | Campaign-instance TypeScript type. Each campaign instance belongs to exactly one mission; multiple campaign instances may share an enemy content entry ([DOM-012](#dom-012--combat-and-consequences)).                                                                                       | Construction and combat transitions belong to Missions and [Combat](../mechanics/combat.md); exact timing and historical retention details remain unresolved with those owners and History and Persistence.                                                                                                                                                                                      |
| Faction                                                                                                       | Campaign-instance TypeScript type. Campaign instances refer to faction content entries; the allowed count per content entry is unresolved.                                                                                                                                                   | Initial setup belongs to Initial Campaign Content; activity, suppression, defeat, and lifecycle details belong to [Factions](../mechanics/factions.md). Historical-transition details remain unresolved.                                                                                                                                                                                         |
| Combatant                                                                                                     | Reusable TypeScript-described structure for combat-related Agent and Enemy state; it is not a campaign-instance TypeScript type and has no campaign instances.                                                                                                                               | Combat operates on the participating Agent and Enemy campaign instances ([DOM-012](#dom-012--combat-and-consequences)).                                                                                                                                                                                                                                                                          |
| Archetypes for the seven declared campaign-instance types; lead, weapon, upgrade, and balance content entries | Typed content entries, not campaign instances. Sharing an entry does not constrain campaign instance multiplicity.                                                                                                                                                                           | Supplied by the current game build; fields and values belong to Initial Campaign Content. Individual weapon inventory campaign instances are outside this model; upgrade acquisitions belong to the Agency campaign instance.                                                                                                                                                                    |

Every occurrence of Campaign, Agency, Agent, Investigation, Mission, Enemy, and Faction has an Archetype,
MutableState, and ImmutableState containing its Instance ID under
[MODEL-001](modeling-foundations.md#model-001--campaign-instance-composition).
All seven types share the explicit ID scope in [DOM-017](#dom-017--campaign-instance-identity-scope), including the
Campaign occurrence itself. Singleton status does not exempt Campaign or Agency from an ID or an archetype.

Combatant supplies reusable TypeScript-described structure, not a separate campaign instance. A faction operation's
provenance is fixed occurrence data in its Response mission's ImmutableState, not a separate campaign instance
([DOM-011](#dom-011--mission-kind-and-provenance)). Nested values and historical records need not be campaign instances.

The creation owners named above specify constructor inputs, dependencies, result TypeScript types, and initialization
of all three components under [MODEL-006](modeling-foundations.md#model-006--campaign-instance-construction).
Production constructor details remain unresolved with those owners; [Initial Campaign Content](../content/initial-campaign.md)
owns the archetype catalogs for all seven types. Required archetypes do not settle their fields or balance values.
Type aliases describe structure; gameplay validity and runtime constraints remain prose contracts.

## Mutability, authority, and gameplay relevance

The following table states the required modeling classifications; example values are explicitly marked.

| Values                                                                            | Mutability during gameplay                                                                                                                                                     | Authority and gameplay relevance                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content entries, including archetypes                                             | Immutable during gameplay ([MODEL-001](modeling-foundations.md#model-001--campaign-instance-composition)).                                                                     | TypeScript types describe structure; content entries supply authoritative game values used by rules. Content is not campaign history.                                                                                                    |
| ImmutableState, including Instance IDs                                            | Fixed at construction, including nested data; stable for the lifetime of the campaign instance within its timeline ([MODEL-002](modeling-foundations.md#model-002--identity)). | Authoritative identity; historical references remain resolvable ([MODEL-003](modeling-foundations.md#model-003--references)).                                                                                                            |
| Retained origin references                                                        | Stored in ImmutableState; preserve the creation source required by [DOM-011](#dom-011--mission-kind-and-provenance).                                                           | Authoritative provenance used by rules and historical explanations.                                                                                                                                                                      |
| MutableState; for example, money, orders, and health                              | Mutable under the owning mechanics; fixed occurrence facts belong in ImmutableState.                                                                                           | Authoritative values used to resolve current gameplay. See [Modeling Foundations](modeling-foundations.md#authoritative-versus-derived-state) for the existing classification.                                                           |
| Derived values; for example, effective skill, availability, and completion counts | Calculated from authoritative values and the current rules/content.                                                                                                            | Derived values under the Modeling Foundations glossary. Gameplay relevance depends on the owning rule or report.                                                                                                                         |
| Completed investigations, mission wins, and earned unlocks                        | Retained outcomes must not be overwritten by current calculations ([MODEL-004](modeling-foundations.md#model-004--historical-fact-preservation)).                              | Authoritative historical values can still affect current progression; [Leads and Progression](../mechanics/leads-and-progression.md) owns predicates and effects ([DOM-010](#dom-010--progression-facts)).                               |
| Final attributes of Killed/Dismissed agents and participation history             | Retained historical values; undo may restore earlier state ([DOM-005](#dom-005--agent-lifecycle)/[DOM-007](#dom-007--current-versus-historical-teams)).                        | Authoritative history. These records do not constitute current assignments or team membership.                                                                                                                                           |
| Original inputs or values retained only to explain a past result                  | Preserve the historical basis ([MODEL-004](modeling-foundations.md#model-004--historical-fact-preservation)).                                                                  | Used for historical explanation; retaining such values does not make them current combat inputs. Retention details belong to History and Persistence and report visibility to [Player Information](../interfaces/player-information.md). |

Examples of authoritative versus derived game values (not a complete state inventory):

| Authoritative value    | Derived value          |
| ---------------------- | ---------------------- |
| Upgrade acquisitions   | Effective capacity     |
| Agent orders           | Readiness              |
| Investigation progress | Completion probability |

Becoming historical is a lifecycle transition, not a requirement to destroy an object or choose a storage representation.
Historical status and current gameplay relevance are independent; each owning mechanic must state whether it consults retained history.

## Campaign and agency

A campaign uses the rules and content supplied by the current game build. It contains one agency, the current turn,
panic and campaign outcome, progression facts, agents, factions, investigations, and missions.

The agency owns money, recurring funding, upgrade acquisitions/capabilities, and its roster. A player controls the agency;
switching between human and AI control does not create another agency. Both campaign and agency have their own IDs in
ImmutableState and required archetypes, even though there is exactly one agency per campaign.
Engine continuation bookkeeping belongs to [Engine Contract](engine-contract.md#concepts-and-contract).

## Agent

An Agent campaign instance has an Instance ID. Its identity persists through assignments and combat.

| Aspect                           | Meaning and relationships                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle                        | Serving, Killed, or Dismissed; distinct from the agent's job                                                                                                  |
| Attributes                       | Career, skill, health, exhaustion, and equipped weapon values                                                                                                 |
| Current assignment               | The agent's current orders, including the destination while travelling; an investigation or mission assignment references that activity                       |
| Task phase                       | At assignment or In transit, with the timing facts needed to describe travel                                                                                  |
| Career and participation history | Retained facts about the agent's past; participation records link the agent to prior investigations and missions without assigning or reserving the agent now |

An assignment is a current relationship, not merely a calculation. Career summaries may be calculated from retained
facts. Being an aspect of Agent does not determine whether information is authoritative or derived.

The [Participation history definition](#glossary) governs retained participation. The agent's history and an activity's past
participants describe the same relationship from opposite sides; this model does not require duplicate stored records.
Current teams follow current assignments ([DOM-007](#dom-007--current-versus-historical-teams)). Agents owns detailed eligibility, transitions, transit, development,
exhaustion, and recovery rules.

## Lead and investigation

| Concept               | Identity and meaning                                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lead                  | A content entry describing difficulty, repeatability, prerequisites, effects, and an optional explicit faction reference                                                    |
| Lead progression      | Campaign state keyed by lead content entry: completions and earned facts; discovery and availability are derived                                                            |
| Investigation         | A campaign instance representing one attempt at one lead; it has progress, hidden difficulty, lifecycle, timing facts, and a current team                                   |
| Participation history | Links to agents who participated in the attempt, using the participation-history meaning defined under Agent; terminal attempts retain these links and have no current team |

Restarting an abandoned investigation creates another attempt. Leads and Progression owns discovery and unlock effects;
Investigations owns progress, probability, uncertainty, team changes, and abandonment details.

## Mission and combat

| Concept                       | Identity and meaning                                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mission content entry         | Content describing encounter configuration and content references                                                                                                                              |
| Mission                       | A campaign instance referring to one mission content entry, with Initiative/Response kind, origin, optional target faction, deadline facts, lifecycle/outcome, enemies, deployment, and result |
| Current and past participants | Current deployment follows agent assignments; retained participation history uses the relationship defined under Agent                                                                         |
| Enemy content entry           | Content describing an archetype and combat configuration                                                                                                                                       |
| Enemy                         | A campaign instance owned by one mission, with a content reference and its own combat attributes/results                                                                                       |
| Battle result                 | Facts owned by the resolved mission: participants, outcome, combat facts, and measures needed for mission consequences                                                                         |

The [Combatant structure](#glossary) does not introduce a third campaign instance alongside agents and enemies. Combat
changes the participating identities and produces a battle result.
Battle results are distinct from campaign consequences, so failed battles can still yield damage-related benefits.
Combat owns resolution; Missions owns deployment, deadlines, rewards, and partial success.

## Faction and operations

A faction content entry supplies descriptive identity and configuration references. A faction is a campaign instance referring
to that content entry, with activity, operation clocks, suppression, and defeat/progression facts.

A faction operation occurrence is the origin of one Response mission: its initiating faction, severity/type, and creation
facts are embedded in that mission. The containing mission ID identifies the occurrence. It is not a separate scheduled
campaign instance in this proposal. Factions owns escalation, operation generation, suppression, and defeat mechanics.

## Weapons and upgrades

Weapon content entries describe damage configuration. Equipped values and campaign modifications belong to the combatant;
this scope does not track individual inventory items. Upgrade content entries describe reusable content; acquisitions and
amount/level belong to the agency. Economy and Upgrades owns acquisition costs, capacity accounting, and upgrade effects.

## Reports

A report links historical facts and explanations to commands/turns and campaign instances in the timeline. Player Information owns
visible fields; History and Persistence owns timeline storage. Reports can explain retained results without replacing
historical values with current calculations.

## Relationship overview

```mermaid
flowchart TD
    Campaign --> Agency
    Agency --> Agents
    Campaign --> Factions
    Campaign --> Progression["Lead progression facts"]
    Campaign --> Investigations
    Campaign --> Missions
    Investigations --> Lead["One lead content entry"]
    Agents --> Assignment["Current assignment and task phase"]
    Assignment --> Investigations
    Assignment --> Missions
    Agents --> Participation["Participation history"]
    Participation --> Investigations
    Participation --> Missions
    Missions --> Enemies
    Missions --> Origin["Initiative origin or faction-operation origin"]
    Missions --> Result["Battle result and consequences"]
```

Arrows show relationships, not inheritance or storage layout.

# Requirements

## Campaign boundary

### DOM-001 — Campaign boundary

A Campaign occurrence must have exactly one player-controlled agency. Every other
campaign instance in that campaign must belong to that Campaign occurrence. AI memory, UI selections, browser
state, and CLI preferences are not campaign state.
Multiplayer agencies and cross-campaign trading are outside this model.

### DOM-017 — Campaign instance identity scope

Campaign, Agency, Agent, Investigation, Mission, Enemy, and Faction must each have an Instance ID in ImmutableState.
IDs must be unique across all seven TypeScript types within one committed campaign state, including the Campaign
occurrence itself. Repeated mission and investigation occurrences must have
identities distinct from earlier occurrences in the same timeline. Modeling Foundations owns the general identity and
explicit-reference semantics ([MODEL-002](modeling-foundations.md#model-002--identity)); this requirement owns which campaign instances share that identity scope.

## Agents, assignments, and participation

### DOM-005 — Agent lifecycle

An agent's lifecycle must distinguish Serving, Killed, and Dismissed. A Serving agent must
have exactly one assignment and task phase. Killed/Dismissed agents must have neither; their final attributes and career
remain historical facts. Death and dismissal are not jobs. Undo can restore an earlier lifecycle.

### DOM-006 — Orders and task phase

Serving-agent assignments must distinguish Standby, Contracting, Training,
Investigation with a reference, Mission with a reference, and Recovery. Task phase must distinguish At assignment from
In transit. Transit retains destination orders and timing facts required by Agents; it is not a second simultaneous job.

At assignment does not itself imply readiness. Agents will define which transitions/phase combinations are allowed,
which tasks require transit, and travel duration. This spec does not select a one-turn or two-turn transit rule.

### DOM-007 — Current versus historical teams

Current investigation/mission membership must agree with assignments.
An agent assigned to investigation I belongs to its current team even while travelling; contribution eligibility is an
Agents/Investigations rule. An agent cannot be assigned to multiple investigations/missions at once.

If both agent-side and team-side links are stored, they must agree in committed state. Agents recorded in history are not
current team members: a concluded mission can retain an agent's participation after that agent is assigned elsewhere.

### DOM-008 — Attribute bounds

For agents and enemies, maximum health must be positive; current health must be between
zero and maximum health inclusive; skill and exhaustion must be nonnegative. Serving agents must have positive health,
Killed agents zero health, and Dismissed agents positive health. Full health on dismissal is not a structural requirement.
Dismissal eligibility, exhaustion caps, rounding, and recovery formulas belong to later mechanics.

## Opportunities and opponents

### DOM-009 — Lead versus attempt

An investigation must refer to one lead content entry and distinguish Active, Completed,
and Abandoned lifecycle states. At most one Active investigation may exist for a lead in a campaign. Active attempts
must have at least one currently assigned agent in committed state; terminal attempts must have no current team.

Terminal attempts retain identity and agent history. Restarting after abandonment creates another attempt;
prior progress is historical, not resumable. LEAD/INVSTG own eligibility and numerical progress-loss rules.

### DOM-010 — Progression facts

Wins, completed investigations, and earned unlocks must be explicit authoritative values in campaign state with
source references where applicable. Derived completion counts must agree with supporting records. Faction defeat and
lead affiliation must not depend on specially spelled IDs. Their predicates and effects belong to mechanics owners.

### DOM-011 — Mission kind and provenance

Mission ImmutableState must retain mission kind and provenance. Missions must explicitly distinguish Initiative (agency objective) and Response
(intervention against a faction operation). Initiative missions must retain their creation source; for example, an investigation
or scenario setup. Response missions must retain an operation origin identifying its initiating faction.

For the initial model, each operation occurrence creates exactly one Response mission; provenance is embedded there
rather than managed as a separately scheduled instance. Two Response missions from the same faction represent distinct
occurrences. Operations spanning multiple missions or lacking a Response mission are outside this proposal. Target
faction and initiating faction are explicit references, not inferences from a mission's name.

### DOM-012 — Combat and consequences

An enemy instance must belong to exactly one mission. Reusing its content entry must
not reuse its identity or mutable health. Agent combat changes must affect the same identity that returns to the agency.
Battle results and campaign consequences must be distinguished so failed battles can yield damage-related benefits.
The model must retain the facts required by the eventual partial-success formula without selecting that formula here.

## Evidence basis and proposed changes

[Game Design Brief](../../game-design-brief.md) supplies the intended campaign concepts and strategic constraints.
Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited model/validation files were unmodified in
the source working tree.

| Basis                                       | Source and interpretation                                                                                                                                                                                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inherited concept / proposed simplification | [Agent model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/agentModel.ts) separates orders and state. [DOM-005](#dom-005--agent-lifecycle)/[DOM-006](#dom-006--orders-and-task-phase) separates lifecycle from both. |
| Inherited concept                           | [Lead model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/leadModel.ts) distinguishes content entries and attempts.                                                                                                  |
| Proposed clarification                      | [Mission model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/missionModel.ts) stores operation severity on missions. [DOM-011](#dom-011--mission-kind-and-provenance) explicitly names mission kind and origin.      |
| Proposed scope choice                       | Weapon content entries and combatant-owned values suffice initially; individual inventory, trading, and transfers are not introduced.                                                                                                                                              |

# Edge cases and failure behavior

| Case                                              | Result / owner                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent travels toward an investigation             | Remains assigned; arrival/progress timing belongs to AGENT/INVSTG                                                                                     |
| Last investigator removed                         | No committed Active attempt with an empty team; numerical effects belong to INVSTG                                                                    |
| Investigation concludes while members travel      | Remove current links to the terminal attempt before publication; replacement orders/transit belong to AGENT/INVSTG                                    |
| Concluded mission retains an agent in its history | Does not reserve current assignment; [MODEL-003](modeling-foundations.md#model-003--references); [DOM-007](#dom-007--current-versus-historical-teams) |
| Empty roster or no missions/investigations        | Structurally valid; CAMP owns initialization and defeat conditions                                                                                    |
| Faction defeated with outstanding missions/leads  | Preserve references; FACTION/LEAD/MISSION own resulting availability/outcomes                                                                         |

# Acceptance examples

These are structural fixtures, not playable scenarios or API signatures. Symbolic IDs are labels, not a chosen ID format.
Numbers below are exact test-only integers, not campaign balance. All other rule-owned scalar values are assumed valid
for purposes of these structural checks. Runtime validation behavior is tested by Engine Contract.

## A. Valid relationships

Given the content entries C supplied by the current game build and rules R, turn 3, and:

- Campaign c1 and its single agency ag1, with all seven declared campaign-instance types sharing the ID scope.
- Current-build archetypes C1 (Campaign), G1 (Agency), A1 (Agent), I1 (Investigation), M1 (Mission),
  F1 (Faction), and E1 (Enemy), plus non-archetype content entries L1 (lead) and W1 (weapon).
  These are explicit test entries with the names shown, unique content IDs within their expected types, and no other
  required fields in this fixture; rule-owned production defaults remain deferred.
- Faction f1 referring to F1.
- Serving agent a1 assigned to investigation i1, In transit.
- Serving agent a2 assigned to mission m1, At assignment.
- Active investigation i1 referring to L1, current team {a1}.
- Initiative mission m1 referring to M1, originating from scenario setup, targeting f1, current team {a2}.
- Enemy e1 owned by m1 and referring to E1.
- Each agent and enemy instance has skill 100, health/max-health 10/10, exhaustion 0, and equipped values referring to W1.
- Other collections empty.

Each occurrence has the following complete conceptual component allocation for this fixture. Archetypes are shared
immutable entries; all Instance IDs and fixed references are in ImmutableState. MutableState fields below can evolve
under their owning mechanics; their concrete transitions remain deferred. The health bounds and other test values
above still apply.

| Occurrence | Archetype | ImmutableState                                                       | MutableState                                                                            |
| ---------- | --------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| c1         | C1        | ID c1                                                                | Turn 3; campaign collections and progression facts                                      |
| ag1        | G1        | ID ag1; campaign c1                                                  | Resources, upgrades, roster {a1, a2}                                                    |
| a1, a2     | A1        | Respective ID; agency ag1                                            | Lifecycle, assignments, task phase, combat attributes, career and participation records |
| i1         | I1        | ID i1; lead L1                                                       | Active lifecycle, progress, current team {a1}, participation records                    |
| m1         | M1        | ID m1; Initiative kind; scenario-setup provenance; target faction f1 | Current team {a2}, enemies {e1}, resolution status and retained results                 |
| e1         | E1        | ID e1; mission m1                                                    | Combat attributes                                                                       |
| f1         | F1        | ID f1                                                                | Activity and progression                                                                |

Campaign collections contain agency ag1, agents a1/a2, investigation i1, mission m1, and faction f1; e1 is reached through
m1. Required references resolve in c1. Resource scalars are zero and other collections empty unless specified above.
Fixed affiliation and target references are assumptions of this fixture, not new production lifecycle rules.
Growing participation or result collections does not permit rewriting retained historical elements.

These relationships satisfy [DOM-001](#dom-001--campaign-boundary), [DOM-005](#dom-005--agent-lifecycle), [DOM-006](#dom-006--orders-and-task-phase), [DOM-007](#dom-007--current-versus-historical-teams), [DOM-008](#dom-008--attribute-bounds), and [DOM-009](#dom-009--lead-versus-attempt), [DOM-011](#dom-011--mission-kind-and-provenance), [DOM-012](#dom-012--combat-and-consequences), [DOM-017](#dom-017--campaign-instance-identity-scope), and [MODEL-001](modeling-foundations.md#model-001--campaign-instance-composition), [MODEL-002](modeling-foundations.md#model-002--identity), and [MODEL-003](modeling-foundations.md#model-003--references).
Team membership does not assert that a1 makes progress while travelling. Full mechanics validation requires the later
owning specs.

## B. Invalid variants

Each row independently changes fixture A and describes a structurally invalid state.

| Change                                                                           | Violation                                                                                                       |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Omit a component from c1 or ag1                                                  | [MODEL-001](modeling-foundations.md#model-001--campaign-instance-composition)                                   |
| Omit c1's or ag1's ID                                                            | [MODEL-002](modeling-foundations.md#model-002--identity); [DOM-017](#dom-017--campaign-instance-identity-scope) |
| Give ag1 ID c1, or e1 ID ag1                                                     | [DOM-017](#dom-017--campaign-instance-identity-scope)                                                           |
| Resolve e1's archetype as M1 instead of E1                                       | [MODEL-003](modeling-foundations.md#model-003--references)                                                      |
| Mutate A1 or m1's retained provenance                                            | [MODEL-001](modeling-foundations.md#model-001--campaign-instance-composition)                                   |
| Add a second player agency                                                       | [DOM-001](#dom-001--campaign-boundary)                                                                          |
| Mark a1 Killed while keeping its assignment/task phase                           | [DOM-005](#dom-005--agent-lifecycle)                                                                            |
| Give a1 both Training and Investigation assignments                              | [DOM-005](#dom-005--agent-lifecycle)/[DOM-006](#dom-006--orders-and-task-phase)                                 |
| List a1 in m1's current team while assigned to i1                                | [DOM-007](#dom-007--current-versus-historical-teams)                                                            |
| Set health to 11 with maximum health 10, or set a Serving agent's health to zero | [DOM-008](#dom-008--attribute-bounds)                                                                           |
| Add another Active attempt for L1, or leave i1 Active with no members            | [DOM-009](#dom-009--lead-versus-attempt)                                                                        |
| Mark m1 Response without faction-operation provenance                            | [DOM-011](#dom-011--mission-kind-and-provenance)                                                                |
| Assign e1 a second owning mission                                                | [DOM-012](#dom-012--combat-and-consequences)                                                                    |
| Give e1 the same instance ID as a1                                               | [DOM-017](#dom-017--campaign-instance-identity-scope); [MODEL-002](modeling-foundations.md#model-002--identity) |

## C. Completion and later participation

Given i1 concludes and m1 resolves under their owning rules, a structurally valid resulting state has:

- i1 Completed, with no current team, and a1 retained in its agent history.
- m1 with a retained result and a2 in its agent history, but no current assignment from a2.
- a1 and a2 Serving with one new valid assignment and task phase each.
- Explicit progression facts for i1's completion and any win of m1.

This satisfies [MODEL-003](modeling-foundations.md#model-003--references); [DOM-005](#dom-005--agent-lifecycle)/[DOM-007](#dom-007--current-versus-historical-teams)/[DOM-009](#dom-009--lead-versus-attempt)/[DOM-010](#dom-010--progression-facts)/[DOM-012](#dom-012--combat-and-consequences). Assigning a1 to another investigation does not rewrite i1's history. If i1
were Abandoned instead, restarting creates a new identity and does not resume i1's progress ([MODEL-002](modeling-foundations.md#model-002--identity); [DOM-009](#dom-009--lead-versus-attempt)).
This fixture does not choose the replacement orders or turn timing.

# Open decisions

These have explicit proposed answers, not hidden implementation defaults. Review can accept them or request changes.

| Review decision                                                 | Proposed answer                                                                                                                                                          | Affected specs         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| Separate terminal lifecycle from tasks?                         | Serving/Killed/Dismissed plus assignment and task phase; death/dismissal are not jobs ([DOM-005](#dom-005--agent-lifecycle)/[DOM-006](#dom-006--orders-and-task-phase)). | AGENT, API, HIST       |
| Unique IDs across all seven campaign-instance TypeScript types? | Yes; [DOM-017](#dom-017--campaign-instance-identity-scope) declares the shared scope using [MODEL-002](modeling-foundations.md#model-002--identity).                     | NUMRNG, HIST, API      |
| Independent faction-operation instances?                        | Initially embed each occurrence in its single Response mission ([DOM-011](#dom-011--mission-kind-and-provenance)).                                                       | FACTION, MISSION, INFO |
| Individually tracked equipment/inventory?                       | No; content entries plus combatant-owned values for initial scope.                                                                                                       | AGENT, ECON, COMBAT    |
| Full health on dismissal as a structural invariant?             | No; require positive health and let AGENT/ECON determine eligibility ([DOM-008](#dom-008--attribute-bounds)).                                                            | AGENT, ECON            |

Formulas, transitions, reveal conditions, and signatures assigned to other specifications remain scheduled work outside
this contract. They must be specified before their features are implemented, but do not require invented answers in
this model.
