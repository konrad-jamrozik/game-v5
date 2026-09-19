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

| Term                         | Definition                                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Combatant                    | A shared schema for combat-related Agent and Enemy state, describing skill, health, exhaustion, and weapon capability; it is not a campaign instance kind. |
| Campaign                     | The campaign instance kind whose occurrences contain one player-controlled agency and the campaign instances governed by DOM-001.                          |
| Agency                       | The player-controlled campaign instance kind whose occurrence owns resources, upgrades, and the roster within a campaign.                                  |
| Agent                        | A campaign instance kind whose occurrences have identity, attributes, assignments, and participation history.                                              |
| Lead                         | A content entry describing an investigation opportunity and its progression rules.                                                                         |
| Lead progression             | Campaign state keyed by lead content entry, recording completions and earned facts.                                                                        |
| Investigation                | A campaign instance kind whose occurrences each represent one attempt at one lead.                                                                         |
| Mission                      | A campaign instance kind whose occurrences refer to mission content and have their own origin, participants, and result.                                   |
| Enemy                        | A campaign instance kind whose occurrences are each owned by one mission and refer to enemy content.                                                       |
| Battle result                | Retained combat facts owned by a resolved mission and used to determine campaign consequences.                                                             |
| Faction                      | A campaign instance kind whose occurrences refer to faction content and record their activity and progression.                                             |
| Faction operation occurrence | The origin of one Response mission, identified by that mission rather than a separate campaign instance.                                                   |
| Participation history        | Immutable records linking agents to investigations and missions in which they previously participated.                                                     |
| Current assignment           | An agent's current orders, with activity references and a destination when travelling.                                                                     |
| Task phase                   | The distinction between At assignment and In transit, including travel timing facts.                                                                       |
| Report                       | Historical facts and explanations linked to commands or turns and campaign instances in the timeline.                                                      |

This document uses MODEL-001 through MODEL-006 to describe game concepts. It applies the modeling vocabulary and
constraints; it does not add detail to the modeling language itself.

Generic modeling terms are owned by the [Modeling Foundations glossary](modeling-foundations.md#glossary).

# Concepts and contract

These are game concepts and relationships, not a serialized schema or a required storage hierarchy. A concept can
include hidden facts; belonging to the game domain does not imply that every property is visible to the player.
Player Information owns exact visibility. Generic modeling vocabulary belongs to
[Modeling Foundations](modeling-foundations.md#glossary).

## Modeling dimensions

Concept names in the first table identify campaign instance kinds unless the table explicitly assigns another modeling
role. A particular occurrence is a campaign instance of its declared kind. Use the
[Modeling Foundations glossary](modeling-foundations.md#glossary) for the generic terms. These classifications do not
prescribe implementation classes or storage records. Content entries are immutable, schema-conforming game data rather
than separately identified campaign instances.

## Kinds, multiplicity, and lifecycle

The following table enumerates the complete concept classifications declared by this draft.

| Concept                                                            | Kind and multiplicity                                                                                                                                                                  | Construction and historical transition / owner                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign; Agency                                                   | Campaign instance kinds. Exactly one Agency campaign instance per Campaign campaign instance (DOM-001); no separate agency ID is required.                                             | Campaign initialization and ongoing/won/lost transitions belong to [Campaign](../mechanics/campaign.md); detailed construction and historical retention rules remain unresolved there and in [History and Persistence](history-and-persistence.md).                                                                                                                 |
| Agent                                                              | Campaign instance kind. Multiple campaign instances can belong to a campaign; roster limits belong to [Economy and Upgrades](../mechanics/economy-and-upgrades.md).                    | Initial roster and recruitment details belong to [Initial Campaign Content](../content/initial-campaign.md) and Economy and Upgrades. Serving, Killed, and Dismissed are distinct states; Killed/Dismissed campaign instances retain final attributes and career without current assignments (DOM-005). [Agents](../mechanics/agents.md) owns detailed transitions. |
| Investigation                                                      | Campaign instance kind. At most one Active campaign instance per lead content entry per campaign; repeated attempts have distinct campaign instances (DOM-009/017).                    | Starting an attempt constructs a campaign instance; restarting after abandonment constructs another. Completed/Abandoned campaign instances retain identity and participation history without a current team. [Investigations](../mechanics/investigations.md) owns eligibility and transition details.                                                             |
| Mission                                                            | Campaign instance kind. A campaign can contain multiple campaign instances with distinct identities; each faction operation occurrence has exactly one Response mission (DOM-011/017). | Initiative construction retains its investigation or scenario source; Response construction retains its operation origin. Exact construction timing, lifecycle, reattempt, and historical-transition rules remain with [Missions](../mechanics/missions.md).                                                                                                        |
| Enemy                                                              | Campaign instance kind. Each campaign instance belongs to exactly one mission; multiple campaign instances may share an enemy content entry (DOM-012).                                 | Construction and combat transitions belong to Missions and [Combat](../mechanics/combat.md); exact timing and historical retention details remain unresolved with those owners and History and Persistence.                                                                                                                                                         |
| Faction                                                            | Campaign instance kind. Campaign instances refer to faction content entries; the allowed count per content entry is unresolved.                                                        | Initial setup belongs to Initial Campaign Content; activity, suppression, defeat, and lifecycle details belong to [Factions](../mechanics/factions.md). Historical-transition details remain unresolved.                                                                                                                                                            |
| Combatant                                                          | Shared schema for combat-related Agent and Enemy state; it is not a campaign instance kind and has no campaign instances.                                                              | Combat operates on the participating Agent and Enemy campaign instances (DOM-012).                                                                                                                                                                                                                                                                                  |
| Lead, mission, enemy, faction, weapon, and upgrade content entries | Schema-conforming content entries, not campaign instances. Sharing an entry does not constrain campaign instance multiplicity.                                                         | Supplied by the current game build; fields and values belong to Initial Campaign Content. Individual weapon inventory campaign instances are outside this model; upgrade acquisitions belong to the Agency campaign instance.                                                                                                                                       |

Agent, Faction, Investigation, Mission, and Enemy campaign instances share the explicit ID scope in DOM-017. Declaring
Campaign and Agency as campaign instance kinds does not extend that scope or introduce new ID requirements. A faction operation's provenance is
embedded in its Response mission, not represented by a separate campaign instance (DOM-011).

Each campaign instance has conceptual identity even when no separate ID field is required. The Campaign occurrence
provides the campaign boundary, and its single Agency occurrence is identified within that boundary. DOM-017 requires
explicit IDs for its five listed kinds; it does not require separate Campaign or Agency IDs. Changing an agency's money
does not create a different agency.

Kinds and state schemas have distinct roles: a kind names the domain category, while its state schema describes data
structure. Combatant supplies reusable structure for Agent and Enemy state without being a separate campaign instance
kind. The creation owners named above specify constructors and their result kinds under MODEL-006; production
constructor details remain with those owners.

## Mutability, authority, and gameplay relevance

The following table states the required modeling classifications; example values are explicitly marked.

| Values                                                                            | Mutability during gameplay                                                                     | Authority and gameplay relevance                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schemas and content entries                                                       | Immutable during gameplay (MODEL-001).                                                         | Schemas declare structure and constraints; content entries supply authoritative game values used by rules. Neither is campaign history.                                                                                                  |
| Instance IDs                                                                      | Stable for the lifetime of the campaign instance within its timeline (MODEL-002).              | Authoritative identity; historical references remain resolvable (MODEL-003).                                                                                                                                                             |
| Retained origin references                                                        | Preserve the creation source required by DOM-011.                                              | Authoritative provenance used by rules and historical explanations.                                                                                                                                                                      |
| Current campaign instance state; for example, money, orders, and health           | Mutable under the owning mechanics; a campaign instance can also contain immutable properties. | Authoritative values used to resolve current gameplay. See [Modeling Foundations](modeling-foundations.md#authoritative-versus-derived-state) for the existing classification.                                                           |
| Derived values; for example, effective skill, availability, and completion counts | Calculated from authoritative values and the current rules/content.                            | Derived values under the Modeling Foundations glossary. Gameplay relevance depends on the owning rule or report.                                                                                                                         |
| Completed investigations, mission wins, and earned unlocks                        | Retained outcomes must not be overwritten by current calculations (MODEL-004).                 | Authoritative historical values can still affect current progression; [Leads and Progression](../mechanics/leads-and-progression.md) owns predicates and effects (DOM-010).                                                              |
| Final attributes of Killed/Dismissed agents and participation history             | Retained historical values; undo may restore earlier state (DOM-005/007).                      | Authoritative history. These records do not constitute current assignments or team membership.                                                                                                                                           |
| Original inputs or values retained only to explain a past result                  | Preserve the historical basis (MODEL-004).                                                     | Used for historical explanation; retaining such values does not make them current combat inputs. Retention details belong to History and Persistence and report visibility to [Player Information](../interfaces/player-information.md). |

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
switching between human and AI control does not create another agency. No separate agency ID is required.
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
Current teams follow current assignments (DOM-007). Agents owns detailed eligibility, transitions, transit, development,
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

The [Combatant schema](#glossary) does not introduce a third campaign instance alongside agents and enemies. Combat
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

**DOM-001 — Campaign boundary.** A Campaign occurrence must have exactly one player-controlled agency. Every other
mutable campaign instance in that campaign must belong to that Campaign occurrence. AI memory, UI selections, browser
state, and CLI preferences are not campaign state.
Multiplayer agencies and cross-campaign trading are outside this model.

**DOM-017 — Campaign instance identity scope.** Agent, faction, investigation, mission, and enemy IDs must be unique across
those five campaign instance kinds within one committed campaign state. Repeated mission and investigation occurrences must have
identities distinct from earlier occurrences in the same timeline. Modeling Foundations owns the general identity and
explicit-reference semantics (MODEL-002); this requirement owns which campaign instances share that identity scope.

## Agents, assignments, and participation

**DOM-005 — Agent lifecycle.** An agent's lifecycle must distinguish Serving, Killed, and Dismissed. A Serving agent must
have exactly one assignment and task phase. Killed/Dismissed agents must have neither; their final attributes and career
remain historical facts. Death and dismissal are not jobs. Undo can restore an earlier lifecycle.

**DOM-006 — Orders and task phase.** Serving-agent assignments must distinguish Standby, Contracting, Training,
Investigation with a reference, Mission with a reference, and Recovery. Task phase must distinguish At assignment from
In transit. Transit retains destination orders and timing facts required by Agents; it is not a second simultaneous job.

At assignment does not itself imply readiness. Agents will define which transitions/phase combinations are allowed,
which tasks require transit, and travel duration. This spec does not select a one-turn or two-turn transit rule.

**DOM-007 — Current versus historical teams.** Current investigation/mission membership must agree with assignments.
An agent assigned to investigation I belongs to its current team even while travelling; contribution eligibility is an
Agents/Investigations rule. An agent cannot be assigned to multiple investigations/missions at once.

If both agent-side and team-side links are stored, they must agree in committed state. Agents recorded in history are not
current team members: a concluded mission can retain an agent's participation after that agent is assigned elsewhere.

**DOM-008 — Attribute bounds.** For agents and enemies, maximum health must be positive; current health must be between
zero and maximum health inclusive; skill and exhaustion must be nonnegative. Serving agents must have positive health,
Killed agents zero health, and Dismissed agents positive health. Full health on dismissal is not a structural requirement.
Dismissal eligibility, exhaustion caps, rounding, and recovery formulas belong to later mechanics.

## Opportunities and opponents

**DOM-009 — Lead versus attempt.** An investigation must refer to one lead content entry and distinguish Active, Completed,
and Abandoned lifecycle states. At most one Active investigation may exist for a lead in a campaign. Active attempts
must have at least one currently assigned agent in committed state; terminal attempts must have no current team.

Terminal attempts retain identity and agent history. Restarting after abandonment creates another attempt;
prior progress is historical, not resumable. LEAD/INVSTG own eligibility and numerical progress-loss rules.

**DOM-010 — Progression facts.** Wins, completed investigations, and earned unlocks must be explicit authoritative values in campaign state with
source references where applicable. Derived completion counts must agree with supporting records. Faction defeat and
lead affiliation must not depend on specially spelled IDs. Their predicates and effects belong to mechanics owners.

**DOM-011 — Mission kind and provenance.** Missions must explicitly distinguish Initiative (agency objective) and Response
(intervention against a faction operation). Initiative missions must retain their creation source; for example, an investigation
or scenario setup. Response missions must retain an operation origin identifying its initiating faction.

For the initial model, each operation occurrence creates exactly one Response mission; provenance is embedded there
rather than managed as a separately scheduled instance. Two Response missions from the same faction represent distinct
occurrences. Operations spanning multiple missions or lacking a Response mission are outside this proposal. Target
faction and initiating faction are explicit references, not inferences from a mission's name.

**DOM-012 — Combat and consequences.** An enemy instance must belong to exactly one mission. Reusing its content entry must
not reuse its identity or mutable health. Agent combat changes must affect the same identity that returns to the agency.
Battle results and campaign consequences must be distinguished so failed battles can yield damage-related benefits.
The model must retain the facts required by the eventual partial-success formula without selecting that formula here.

## Evidence basis and proposed changes

[Game Design Brief](../../game-design-brief.md) supplies the intended campaign concepts and strategic constraints.
Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited model/validation files were unmodified in
the source working tree.

| Basis                                       | Source and interpretation                                                                                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inherited concept / proposed simplification | [Agent model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/agentModel.ts) separates orders and state. DOM-005/006 separates lifecycle from both.                       |
| Inherited concept                           | [Lead model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/leadModel.ts) distinguishes content entries and attempts.                                                    |
| Proposed clarification                      | [Mission model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/missionModel.ts) stores operation severity on missions. DOM-011 explicitly names mission kind and origin. |
| Proposed scope choice                       | Weapon content entries and combatant-owned values suffice initially; individual inventory, trading, and transfers are not introduced.                                                                                                |

# Edge cases and failure behavior

| Case                                              | Result / owner                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Agent travels toward an investigation             | Remains assigned; arrival/progress timing belongs to AGENT/INVSTG                                                  |
| Last investigator removed                         | No committed Active attempt with an empty team; numerical effects belong to INVSTG                                 |
| Investigation concludes while members travel      | Remove current links to the terminal attempt before publication; replacement orders/transit belong to AGENT/INVSTG |
| Concluded mission retains an agent in its history | Does not reserve current assignment; MODEL-003; DOM-007                                                            |
| Empty roster or no missions/investigations        | Structurally valid; CAMP owns initialization and defeat conditions                                                 |
| Faction defeated with outstanding missions/leads  | Preserve references; FACTION/LEAD/MISSION own resulting availability/outcomes                                      |

# Acceptance examples

These are structural fixtures, not playable scenarios or API signatures. Symbolic IDs are labels, not a chosen ID format.
Numbers below are exact test-only integers, not campaign balance. All other rule-owned scalar values are assumed valid
for purposes of these structural checks. Runtime validation behavior is tested by Engine Contract.

## A. Valid relationships

Given the content entries C supplied by the current game build and rules R, turn 3, and:

- One agency and content entries L1 (lead), M1 (mission), F1 (faction), E1 (enemy), W1 (weapon).
- Faction f1 referring to F1.
- Serving agent a1 assigned to investigation i1, In transit.
- Serving agent a2 assigned to mission m1, At assignment.
- Active investigation i1 referring to L1, current team {a1}.
- Initiative mission m1 referring to M1, originating from scenario setup, targeting f1, current team {a2}.
- Enemy e1 owned by m1 and referring to E1.
- Each agent and enemy instance has skill 100, health/max-health 10/10, exhaustion 0, and equipped values referring to W1.
- Other collections empty.

These relationships satisfy DOM-001, DOM-005 through DOM-009, DOM-011, DOM-012, DOM-017, and MODEL-001 through MODEL-003.
Team membership does not assert that a1 makes progress while travelling. Full mechanics validation requires the later
owning specs.

## B. Invalid variants

Each row independently changes fixture A and describes a structurally invalid state.

| Change                                                                           | Violation          |
| -------------------------------------------------------------------------------- | ------------------ |
| Add a second player agency                                                       | DOM-001            |
| Mark a1 Killed while keeping its assignment/task phase                           | DOM-005            |
| Give a1 both Training and Investigation assignments                              | DOM-005/006        |
| List a1 in m1's current team while assigned to i1                                | DOM-007            |
| Set health to 11 with maximum health 10, or set a Serving agent's health to zero | DOM-008            |
| Add another Active attempt for L1, or leave i1 Active with no members            | DOM-009            |
| Mark m1 Response without faction-operation provenance                            | DOM-011            |
| Assign e1 a second owning mission                                                | DOM-012            |
| Give e1 the same instance ID as a1                                               | DOM-017; MODEL-002 |

## C. Completion and later participation

Given i1 concludes and m1 resolves under their owning rules, a structurally valid resulting state has:

- i1 Completed, with no current team, and a1 retained in its agent history.
- m1 with a retained result and a2 in its agent history, but no current assignment from a2.
- a1 and a2 Serving with one new valid assignment and task phase each.
- Explicit progression facts for i1's completion and any win of m1.

This satisfies MODEL-003; DOM-005/007/009/010/012. Assigning a1 to another investigation does not rewrite i1's history. If i1
were Abandoned instead, restarting creates a new identity and does not resume i1's progress (MODEL-002; DOM-009).
This fixture does not choose the replacement orders or turn timing.

# Open decisions

These have explicit proposed answers, not hidden implementation defaults. Review can accept them or request changes.

| Review decision                                     | Proposed answer                                                                                      | Affected specs         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| Separate terminal lifecycle from tasks?             | Serving/Killed/Dismissed plus assignment and task phase; death/dismissal are not jobs (DOM-005/006). | AGENT, API, HIST       |
| Unique IDs across all five campaign instance kinds? | Yes; DOM-017 declares the shared scope using MODEL-002.                                              | NUMRNG, HIST, API      |
| Independent faction-operation instances?            | Initially embed each occurrence in its single Response mission (DOM-011).                            | FACTION, MISSION, INFO |
| Individually tracked equipment/inventory?           | No; content entries plus combatant-owned values for initial scope.                                   | AGENT, ECON, COMBAT    |
| Full health on dismissal as a structural invariant? | No; require positive health and let AGENT/ECON determine eligibility (DOM-008).                      | AGENT, ECON            |

Formulas, transitions, reveal conditions, and signatures assigned to other specifications remain scheduled work outside
this contract. They must be specified before their features are implemented, but do not require invented answers in
this model.

# Appendix A. Requirement migration (informative)

The split changes document ownership, not proposed gameplay. Retained DOM IDs keep their meanings. Retired IDs below
must not be reused; follow the replacement owners for their normative text and acceptance examples.

| Retired requirement                 | Replacement                                                                                                                                                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOM-002 — Definition boundary       | [Modeling Foundations](modeling-foundations.md#requirements), MODEL-001                                                                                                                                                                             |
| DOM-003 — Identity                  | [Modeling Foundations](modeling-foundations.md#requirements), MODEL-002 for general identity semantics; DOM-017 for the game-specific identity scope; [Engine Contract](engine-contract.md#requirements), ENG-004 for restoring ID-generation state |
| DOM-004 — References                | [Modeling Foundations](modeling-foundations.md#requirements), MODEL-003                                                                                                                                                                             |
| DOM-013 — Derived consistency       | [Modeling Foundations](modeling-foundations.md#requirements), MODEL-004 for historical preservation; [Engine Contract](engine-contract.md#requirements), ENG-001 for calculations and caches                                                        |
| DOM-014 — Continuation state        | [Engine Contract](engine-contract.md#requirements), ENG-002                                                                                                                                                                                         |
| DOM-015 — Information boundary      | [Engine Contract](engine-contract.md#requirements), ENG-003                                                                                                                                                                                         |
| DOM-016 — Committed-state integrity | [Engine Contract](engine-contract.md#requirements), ENG-004                                                                                                                                                                                         |
