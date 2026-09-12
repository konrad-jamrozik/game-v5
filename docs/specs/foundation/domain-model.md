# Domain Model

| Metadata | Value |
| -------- | ----- |
| Spec ID | DOM |
| Status | Draft |
| Scope | Game concepts, their properties and relationships, and structural domain invariants |
| Conventions | [Specification conventions](../spec-conventions.md) |
| Review | Batch 1; proposed rules awaiting user review |

## 1. Purpose and boundaries

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

## 2. Dependencies and terminology


### Authority and downstream ownership

- **Normative:** [Specification conventions](../spec-conventions.md) governs this document.
- **Normative draft:** [Modeling Foundations](modeling-foundations.md) owns modeling vocabulary, identity/reference conventions, and historical fact preservation.
- **Normative draft:** [Engine Contract](engine-contract.md) owns execution, information access, and committed-state guarantees.
- **Design input:** [Game Design Brief](../../game-design-brief.md) supplies the required concepts, strategic tensions, interface
  boundary, determinism, and undo/redo.
- **Process:** [Work plan](../work-plan.md) groups Domain Model, Modeling Foundations, and Engine Contract in batch 1.

The following downstream contracts are currently stubs. They do not supply unstated rules to this draft:

| Owner                                                                                              | Details to be specified there                                                       |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [Numbers and Randomness](numbers-and-randomness.md)                                                | Representation, rounding, ID generation, and random draws                           |
| [History and Persistence](history-and-persistence.md)                                              | Timeline storage, restoration, serialization, and compatibility                     |
| [Agents](../mechanics/agents.md)                                                                   | Attribute formulas, eligibility, transitions, transit timing, fatigue, and recovery |
| [Economy and Upgrades](../mechanics/economy-and-upgrades.md)                                       | Costs, income, purchases, capacity accounting, and upgrade application              |
| [Leads and Progression](../mechanics/leads-and-progression.md)                                     | Prerequisites, discovery, availability, and unlock effects                          |
| [Investigations](../mechanics/investigations.md)                                                   | Progress, probability, uncertainty, team changes, and abandonment                   |
| [Combat](../mechanics/combat.md)                                                                   | Combat calculations, resolution, experience, and battle result details              |
| [Missions](../mechanics/missions.md)                                                               | Deployment, deadlines, rewards, and partial success                                 |
| [Factions](../mechanics/factions.md)                                                               | Escalation, operations, suppression, and defeat                                     |
| [Campaign](../mechanics/campaign.md), [Turn Resolution](turn-resolution.md)                        | Initialization, outcomes, and effect ordering                                       |
| [Initial Campaign Content](../content/initial-campaign.md)                                         | Definitions and balance values                                                      |
| [Player Information](../interfaces/player-information.md)                                          | Observation/report fields, reveal conditions, and permitted estimates               |
| [TypeScript API](../interfaces/typescript-api.md), [Developer API](../interfaces/developer-api.md) | Callable contracts and separation of player/dev access                              |

Game terms are defined under their owning concepts in section 3 rather than in a flat glossary.

## 3. Concepts and contract

These are game concepts and relationships, not a serialized schema or a required storage hierarchy. A concept can
include hidden facts; belonging to the game domain does not imply that every property is visible to the player.
Player Information owns exact visibility. Generic modeling vocabulary belongs to
[Modeling Foundations](modeling-foundations.md#2-dependencies-and-terminology).

### Campaign and agency

A campaign uses the rules and content supplied by the current game build. It contains one agency, the current turn,
panic and campaign outcome, progression facts, agents, factions, investigations, and missions. Earlier rules, content,
and incompatible saved campaigns need not remain supported.

The agency owns money, recurring funding, upgrade acquisitions/capabilities, and its roster. A player controls the agency;
switching between human and AI control does not create another agency. No separate agency ID is required.
Engine continuation bookkeeping belongs to [Engine Contract](engine-contract.md#3-concepts-and-contract).

### Agent

An agent is an individual with a campaign entity ID. Its identity persists through assignments and combat.

| Aspect | Meaning and relationships |
| ------ | ------------------------- |
| Lifecycle | Serving, Killed, or Dismissed; distinct from the agent's job |
| Attributes | Career, skill, health, exhaustion, and equipped weapon values |
| Current assignment | The agent's current orders, including the destination while travelling; an investigation or mission assignment references that activity |
| Task phase | At assignment or In transit, with the timing facts needed to describe travel |
| Career and participation history | Retained facts about the agent's past; participation records link the agent to prior investigations and missions without assigning or reserving the agent now |

An assignment is a current relationship, not merely a calculation. Career summaries may be calculated from retained
facts. Being an aspect of Agent does not determine whether information is authoritative or derived.

**Participation history** means immutable facts about past participation. The agent's history and an activity's past
participants describe the same relationship from opposite sides; this model does not require duplicate stored records.
Current teams follow current assignments (DOM-007). Agents owns detailed eligibility, transitions, transit, development,
fatigue, and recovery rules.

### Lead and investigation

| Concept | Identity and meaning |
| ------- | -------------------- |
| Lead | A content definition describing difficulty, repeatability, prerequisites, effects, and an optional explicit faction reference |
| Lead progression | Campaign facts keyed by lead definition: completions and earned facts; discovery and availability are derived |
| Investigation | A campaign entity representing one attempt at one lead; it has progress, hidden difficulty, lifecycle, timing facts, and a current team |
| Past participation | Links to agents who participated in the attempt, using the participation-history meaning defined under Agent; terminal attempts retain these links and have no current team |

Restarting an abandoned investigation creates another attempt. Leads and Progression owns discovery and unlock effects;
Investigations owns progress, probability, uncertainty, team changes, and abandonment details.

### Mission and combat

| Concept | Identity and meaning |
| ------- | -------------------- |
| Mission definition | Content describing encounter configuration and content references |
| Mission | A campaign entity referring to one mission definition, with Initiative/Response kind, origin, optional target faction, deadline facts, lifecycle/outcome, enemies, deployment, and result |
| Current and past participants | Current deployment follows agent assignments; retained past participation uses the relationship defined under Agent |
| Enemy definition | Content describing an archetype and combat configuration |
| Enemy | A campaign entity owned by one mission, with a definition reference and its own combat attributes/results |
| Battle result | Facts owned by the resolved mission: participants, outcome, combat facts, and measures needed for mission consequences |

**Actor/combatant** is the shared role of agents and enemies: skill, health, exhaustion, and weapon capability. It is not
a third entity copied alongside them. Combat changes the participating identities and produces a battle result.
Battle results are distinct from campaign consequences, so failed battles can still yield damage-related benefits.
Combat owns resolution; Missions owns deployment, deadlines, rewards, and partial success.

### Faction and operations

A faction definition supplies descriptive identity and configuration references. A faction is a campaign entity referring
to that definition, with activity, operation clocks, suppression, and defeat/progression facts.

A faction operation occurrence is the origin of one Response mission: its initiating faction, severity/type, and creation
facts are embedded in that mission. The containing mission ID identifies the occurrence. It is not a separate scheduled
entity in this proposal. Factions owns escalation, operation generation, suppression, and defeat mechanics.

### Weapons and upgrades

Weapon definitions describe damage configuration. Equipped values and campaign modifications belong to the combatant;
this scope does not track individual inventory items. Upgrade definitions describe reusable content; acquisitions and
amount/level belong to the agency. Economy and Upgrades owns acquisition costs, capacity accounting, and upgrade effects.

### Reports

A report links historical facts and explanations to commands/turns and entities in the timeline. Player Information owns
visible fields; History and Persistence owns timeline storage. Reports can explain retained results without replacing
historical values with current calculations.

### Relationship overview

```mermaid
flowchart TD
    Campaign --> Agency
    Agency --> Agents
    Campaign --> Factions
    Campaign --> Progression["Lead progression facts"]
    Campaign --> Investigations
    Campaign --> Missions
    Investigations --> Lead["One lead definition"]
    Agents --> Assignment["Current assignment and task phase"]
    Assignment --> Investigations
    Assignment --> Missions
    Agents --> Participation["Past participation"]
    Participation --> Investigations
    Participation --> Missions
    Missions --> Enemies
    Missions --> Origin["Initiative origin or faction-operation origin"]
    Missions --> Result["Battle result and consequences"]
```

Arrows show relationships, not inheritance or storage layout.

## 4. Requirements

### Campaign boundary

**DOM-001 — Campaign boundary.** A campaign must have exactly one player-controlled agency. Mutable gameplay instances
must belong to that campaign. AI memory, UI selections, browser state, and CLI preferences are not campaign facts.
Multiplayer agencies and cross-campaign trading are outside this model.

### Agents, assignments, and participation

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
Dismissal eligibility, fatigue caps, rounding, and recovery formulas belong to later mechanics.

### Opportunities and opponents

**DOM-009 — Lead versus attempt.** An investigation must refer to one lead definition and distinguish Active, Completed,
and Abandoned lifecycle states. At most one Active investigation may exist for a lead in a campaign. Active attempts
must have at least one currently assigned agent in committed state; terminal attempts must have no current team.

Terminal attempts retain identity and agent history. Restarting after abandonment creates another attempt;
prior progress is historical, not resumable. LEAD/INV own eligibility and numerical progress-loss rules.

**DOM-010 — Progression facts.** Wins, completed investigations, and earned unlocks must be explicit campaign facts with
source references where applicable. Derived completion counts must agree with supporting records. Faction defeat and
lead affiliation must not depend on specially spelled IDs. Their predicates and effects belong to mechanics owners.

**DOM-011 — Mission kind and provenance.** Missions must explicitly distinguish Initiative (agency objective) and Response
(intervention against a faction operation). Initiative missions must retain their creation source, such as an investigation
or scenario setup. Response missions must retain an operation origin identifying its initiating faction.

For the initial model, each operation occurrence creates exactly one Response mission; provenance is embedded there
rather than managed as a separately scheduled entity. Two Response missions from the same faction represent distinct
occurrences. Operations spanning multiple missions or lacking a Response mission are outside this proposal. Target
faction and initiating faction are explicit references, not inferences from a mission's name.

**DOM-012 — Combat and consequences.** An enemy instance must belong to exactly one mission. Reusing its definition must
not reuse its identity or mutable health. Agent combat changes must affect the same identity that returns to the agency.
Battle results and campaign consequences must be distinguished so failed battles can yield damage-related benefits.
The model must retain the facts required by the eventual partial-success formula without selecting that formula here.

### Source basis and proposed changes

Inspected game-ts revision: f1835a29af3678b4b7a4d17017b0ad737c3ec81a. The cited model/validation files were unmodified in
the source working tree.

| Basis                                       | Source and interpretation                                                                                                                                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inherited concept / proposed simplification | [Agent model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/agentModel.ts) separates orders and state. DOM-005/006 separates lifecycle from both.                                         |
| Inherited concept                           | [Lead model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/leadModel.ts) distinguishes definitions and attempts.                                                                          |
| Proposed clarification                      | [Mission model](https://github.com/konrad-jamrozik/game-ts/blob/f1835a29af3678b4b7a4d17017b0ad737c3ec81a/web/src/lib/model/missionModel.ts) stores operation severity on missions. DOM-011 explicitly names mission kind and origin.                   |
| Proposed scope choice                       | Weapon definitions and combatant-owned values suffice initially; individual inventory, trading, and transfers are not introduced.                                                                                                                      |

## 5. Edge cases and failure behavior

| Case                                                         | Result / owner                                                                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Agent travels toward an investigation                        | Remains assigned; arrival/progress timing belongs to AGENT/INV                                                  |
| Last investigator removed                                    | No committed Active attempt with an empty team; numerical effects belong to INV                                 |
| Investigation concludes while members travel                 | Remove current links to the terminal attempt before publication; replacement orders/transit belong to AGENT/INV |
| Concluded mission retains an agent in its history            | Does not reserve current assignment; MOD-003; DOM-007                                                                |
| Empty roster or no missions/investigations                   | Structurally valid; CAMP owns initialization and defeat conditions                                              |
| Faction defeated with outstanding missions/leads             | Preserve references; FACTION/LEAD/MISSION own resulting availability/outcomes                                   |

## 6. Acceptance examples

These are structural fixtures, not playable scenarios or API signatures. Symbolic IDs are labels, not a chosen ID format.
Numbers below are exact test-only integers, not campaign balance. RNG state G and ID state N are opaque; structural checks
consume no draws. All other rule-owned scalar values are assumed valid for purposes of these structural checks.

### A. Valid relationships

Given the current content catalog C and rules R, turn 3, RNG state G, ID state N, and:

- One agency and content definitions L1 (lead), M1 (mission), F1 (faction), E1 (enemy), W1 (weapon).
- Faction f1 referring to F1.
- Serving agent a1 assigned to investigation i1, In transit.
- Serving agent a2 assigned to mission m1, At assignment.
- Active investigation i1 referring to L1, current team {a1}.
- Initiative mission m1 referring to M1, originating from scenario setup, targeting f1, current team {a2}.
- Enemy e1 owned by m1 and referring to E1.
- Each actor has skill 100, health/max-health 10/10, exhaustion 0, and equipped values referring to W1.
- Other collections empty.

These relationships satisfy DOM-001, DOM-005 through DOM-009, DOM-011, DOM-012, and MOD-001 through MOD-003.
Team membership does not assert that a1 makes progress while travelling. Structural validation leaves all facts, G,
and N unchanged (ENG-001/004). Full mechanics validation requires the later owning specs.

### B. Invalid variants

Each row independently changes fixture A. Reject the structural variant; if attempted through a player command, preserve
the original committed state (ENG-004).

| Change                                                                           | Violation   |
| -------------------------------------------------------------------------------- | ----------- |
| Add a second player agency                                                       | DOM-001     |
| Mark a1 Killed while keeping its assignment/task phase                           | DOM-005     |
| Give a1 both Training and Investigation assignments                              | DOM-005/006 |
| List a1 in m1's current team while assigned to i1                                | DOM-007     |
| Set health to 11 with maximum health 10, or set a Serving agent's health to zero | DOM-008     |
| Add another Active attempt for L1, or leave i1 Active with no members            | DOM-009     |
| Mark m1 Response without faction-operation provenance                            | DOM-011     |
| Assign e1 a second owning mission                                                | DOM-012     |

### C. Completion and later participation

Given i1 concludes and m1 resolves under their owning rules, a structurally valid resulting state has:

- i1 Completed, with no current team, and a1 retained in its agent history.
- m1 with a retained result and a2 in its agent history, but no current assignment from a2.
- a1 and a2 Serving with one new valid assignment and task phase each.
- Explicit progression facts for i1's completion and any win of m1.

This satisfies MOD-003; DOM-005/007/009/010/012. Assigning a1 to another investigation does not rewrite i1's history. If i1
were Abandoned instead, restarting creates a new identity and does not resume i1's progress (MOD-002; DOM-009).
This fixture does not choose the replacement orders or turn timing.

## 7. Open decisions

These have explicit proposed answers, not hidden implementation defaults. Review can accept them or request changes.

| Review decision                                     | Proposed answer                                                                                      | Affected specs         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| Separate terminal lifecycle from tasks?             | Serving/Killed/Dismissed plus assignment and task phase; death/dismissal are not jobs (DOM-005/006). | AGENT, API, HIST       |
| Independent faction-operation entities?             | Initially embed each occurrence in its single Response mission (DOM-011).                            | FACTION, MISSION, INFO |
| Individually tracked equipment/inventory?           | No; definitions plus combatant-owned values for initial scope.                                       | AGENT, ECON, COMBAT    |
| Full health on dismissal as a structural invariant? | No; require positive health and let AGENT/ECON determine eligibility (DOM-008).                      | AGENT, ECON            |

Formulas, transitions, reveal conditions, and signatures listed in section 2 remain scheduled work outside this contract.
They must be specified before their features are implemented, but do not require invented answers in this model.

## Appendix A. Requirement migration (informative)

The split changes document ownership, not proposed gameplay. Retained DOM IDs keep their meanings. Retired IDs below
must not be reused; follow the replacement owners for their normative text and acceptance examples.

| Retired requirement | Replacement |
| ------------------- | ----------- |
| DOM-002 — Definition boundary | [Modeling Foundations](modeling-foundations.md#4-requirements), MOD-001 |
| DOM-003 — Identity | [Modeling Foundations](modeling-foundations.md#4-requirements), MOD-002 |
| DOM-004 — References | [Modeling Foundations](modeling-foundations.md#4-requirements), MOD-003 |
| DOM-013 — Derived consistency | [Modeling Foundations](modeling-foundations.md#4-requirements), MOD-004 for historical preservation; [Engine Contract](engine-contract.md#4-requirements), ENG-001 for calculations and caches |
| DOM-014 — Continuation state | [Engine Contract](engine-contract.md#4-requirements), ENG-002 |
| DOM-015 — Information boundary | [Engine Contract](engine-contract.md#4-requirements), ENG-003 |
| DOM-016 — Committed-state integrity | [Engine Contract](engine-contract.md#4-requirements), ENG-004 |
