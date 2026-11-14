# Domain Model

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | DOM                                                                                       |
| Family      | Mechanics                                                                                 |
| Status      | Draft                                                                                     |
| Audience    | Engine designer, Content designer, AI designer, Implementer                               |
| Owns        | Game concepts, how they relate, and the structural invariants that span several concepts. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                            |

# Overview

This document defines what exists in the game and how those concepts relate. A Campaign contains one player-controlled
Agency that allocates Agents, pursues Leads, deploys teams of Agents to Mission sites to carry out Missions, and opposes
Factions.

It applies the vocabulary of [Core Concepts](../foundation/core-concepts.md) and the rules of [Campaign State](../foundation/campaign-state.md) to
these concepts without adding to either. Each concept is classified by its modeling role under
[Game concepts](#game-concepts).

This document owns the definition of each concept and the rules that relate one concept to another, e.g. that an
Agent's Current assignment places it in a Current team. It does not own what a single concept has or does on its
own, e.g. its properties, lifecycle states, formulas, and transitions; these belong to the specification of the
[Mechanics family](about-mechanics.md) that refines the concept. It does not own which properties the
player sees, which the specification owning each value states, under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract. A concept can include facts
hidden from the player. Creating Reports is out of scope, as [Reports](#reports) states.

# Relationships

- Uses [Campaign State](../foundation/campaign-state.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Game Data Records](../foundation/game-data-records.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Bootstrap GDRs](../content/bootstrap-gdrs.md)
- Used by [Turn Advancement](./turn-advancement.md)
- Used by [Web UI](../ui/web-ui.md)
- Refined by [Agents](agents-spec.md)
- Refined by [Combat](combat.md)
- Refined by [Economy and Upgrades](economy-and-upgrades.md)
- Refined by [Factions](factions.md)
- Refined by [Investigations](investigations.md)
- Refined by [Leads and Progression](leads-and-progression.md)
- Refined by [Missions](missions.md)
- Refined by [Panic and Endings](panic-and-endings.md)

# Glossary

Campaign, Campaign state, Type, GDR, Authoritative value, and Derived value are defined by the
[Core Concepts glossary](../foundation/core-concepts.md#glossary). Campaign instance, Instance ID, Archetype, Constants, State,
Role Type, World history, and Campaign configuration are defined by the
[Campaign State glossary](../foundation/campaign-state.md#glossary). Committed state is defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). Battle is defined by the
[Combat glossary](combat.md#glossary). Deployed is defined by the [Agents glossary](agents-spec.md#glossary). Panic and Campaign ending are defined by the
[Panic and Endings glossary](panic-and-endings.md#glossary).

## Agency and Agents

The player-controlled organization, its Agents, and what each Agent is doing.

| Term               | Definition                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Agency             | The organization the player controls in a Campaign. It holds the money, funding, and upgrades, and employs the Agents. |
| Agent              | An operative employed by the Agency, whom the player assigns to Investigations and Missions.                           |
| Current assignment | What an Agent is currently ordered to do, e.g. take part in a particular Investigation or Mission.                     |
| Task phase         | Whether an Agent is carrying out its Current assignment (At assignment) or still travelling to it (In transit).        |

## Leads, Investigations, Mission sites, and Missions

The work the Agency discovers and undertakes.

| Term                    | Definition                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Lead                    | A line of inquiry the Agency can investigate. Investigating it can open further Leads and Mission sites.                    |
| Lead progression        | What the Agency has earned on each Lead so far in a Campaign: the Mission sites that Lead created which were Won.           |
| Investigation           | One effort by a team of Agents to investigate one Lead, from its start until it concludes.                                  |
| Mission site            | A place where Enemies of one Faction are present for a limited time, and to which the Agency can deploy one team of Agents. |
| Initiative Mission site | A Mission site the Agency found by completing an Investigation of a Lead.                                                   |
| Response Mission site   | A Mission site created by a Faction operation occurrence, where the Agency can stop that operation.                         |
| Mission                 | The operation carried out at one Mission site by the one team of Agents deployed to it.                                     |
| Current team            | The Agents currently assigned to a given Investigation or Mission.                                                          |

## Combat

The participants and retained results of a [Battle](combat.md#glossary).

| Term                | Definition                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Combatant           | An Agent or an Enemy as a participant in a Battle. Both can fight because both have skill, health, exhaustion, and weapon capability. |
| Combatant Role Type | What an Agent or an Enemy must have in order to be a Combatant, and what it gains while a Battle lasts.                               |
| Enemy               | An opponent present at one Mission site, whom the Agency's Agents fight in a Battle.                                                  |
| Battle result       | The record of how a Battle went, kept as part of its Mission and used to determine the consequences for the Campaign.                 |

## Factions

The opposing organizations and their operations.

| Term                         | Definition                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Faction                      | An organization that opposes the Agency and carries out operations in the world. |
| Faction operation occurrence | One operation carried out by a Faction, which creates one Response Mission site. |

## Retained records

Records kept to explain past gameplay.

| Term                  | Definition                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| Participation history | The permanent record of which Agents took part in which past Investigations and Missions.                 |
| Report                | An account of something that happened in the Campaign, e.g. a Battle, explaining its facts to the player. |

# Game concepts

The following table is the complete set of concepts this specification declares, each with its modeling role. The
[Glossary](#glossary) states what each concept is; this table states how it is modeled.

| Concept                                       | Modeling role                                                                                                                                                                                    | Multiplicity within one Campaign                                                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agency                                        | Campaign instance Type                                                                                                                                                                           | Exactly one, under [Agency per Campaign](#agency-per-campaign)                                                                                                                                                                                           |
| Agent                                         | Campaign instance Type                                                                                                                                                                           | Any number; roster limits belong to Economy and Upgrades                                                                                                                                                                                                 |
| Investigation                                 | Campaign instance Type                                                                                                                                                                           | At most one Active Investigation per Lead, under [Leads and Investigations](#leads-and-investigations)                                                                                                                                                   |
| Mission site                                  | Campaign instance Type                                                                                                                                                                           | Any number; none in the initial Campaign state, under [Initial Campaign state](#initial-campaign-state); exactly one Response Mission site per Faction operation occurrence, under [Mission site kind and provenance](#mission-site-kind-and-provenance) |
| Mission                                       | Part of the State of the Mission site that owns it, existing from deployment on, under [Mission at a Mission site](#mission-at-a-mission-site); neither a Campaign instance Type nor a Role Type | At most one per Mission site                                                                                                                                                                                                                             |
| Enemy                                         | Campaign instance Type                                                                                                                                                                           | Any number, each belonging to exactly one Mission site, under [Combat and consequences](#combat-and-consequences)                                                                                                                                        |
| Faction                                       | Campaign instance Type                                                                                                                                                                           | Exactly one per FactionArchetype supplied by the Game build, under [Initial Campaign state](#initial-campaign-state)                                                                                                                                     |
| Combatant Role Type                           | Role Type adopted by Agent and Enemy, under [Combatant Role Type](#combatant-role-type); not a Campaign instance Type                                                                            | No Campaign instances                                                                                                                                                                                                                                    |
| Lead                                          | GDR serving the Referenced GDR and Key for campaign facts purposes                                                                                                                               | Not a Campaign instance                                                                                                                                                                                                                                  |
| Weapon and upgrade GDRs                       | GDRs                                                                                                                                                                                             | Not Campaign instances                                                                                                                                                                                                                                   |
| Archetypes of the six Campaign instance Types | GDRs serving the Archetype purpose                                                                                                                                                               | Not Campaign instances; sharing an Archetype does not limit how many Campaign instances exist                                                                                                                                                            |

GDR purposes are defined under [Purposes of GDRs](../foundation/game-data-records.md#purposes-of-gdrs). Every Campaign instance of
the six Campaign instance Types has the four properties stated under
[Campaign instance structure](../foundation/campaign-state.md#campaign-instance-structure). Each concept's section below states how
the concept relates to the other concepts and names the Mechanics specification that refines it. That Mechanics
specification owns what the concept has on its own. Being a property of a concept does not determine whether a value
is an Authoritative value or a Derived value; e.g., an Agent's career statistics may be Derived values calculated from
retained facts.

```mermaid
flowchart TD
    CampaignState["Campaign state"] -->|contains one| Agency["Agency"]
    Agency -->|employs| Agents["Agents"]
    CampaignState -->|contains| Factions["Factions"]
    CampaignState -->|contains| Progression["Lead progression"]
    CampaignState -->|contains| Investigations["Investigations"]
    CampaignState -->|contains| MissionSites["Mission sites"]
    Investigations -->|each investigates| Lead["One Lead GDR"]
    Agents -->|each has| Assignment["Current assignment and Task phase"]
    Assignment -->|can reference| Investigations
    Assignment -->|when Deployed, references| MissionSites
    Agents -->|each has| Participation["Participation history"]
    Participation -->|records past| Investigations
    Participation -->|records past| Missions["Missions"]
    MissionSites -->|each owns| Enemies["Enemies"]
    MissionSites -->|each retains| Origin["Investigation origin or Faction operation occurrence origin"]
    MissionSites -->|once Agents are deployed, each owns one| Missions
    Missions -->|each holds| Team["Current team"]
    Missions -->|once the Battle is fought, each holds| Result["Battle result"]
```

Arrows show the labelled relationships, not inheritance.

# Campaign and Agency

A Campaign contains one Agency, the current turn, [Panic](panic-and-endings.md#glossary) and the
[Campaign ending](panic-and-endings.md#glossary), Lead progression, Agents, Factions,
Investigations, and Mission sites. The Agency owns money, recurring funding, upgrade acquisitions, and its roster of
Agents. Campaign-wide properties, e.g. the current turn and Panic, belong directly to Campaign state, not to the
Agency.

## Agency per Campaign

Campaign state must contain exactly one Agency, because a Campaign has exactly one player under
[Single-player scope](../foundation/engine-contract.md#single-player-scope) in Engine Contract. Trading between Campaigns is out of
scope.

## Initial Campaign state

Everything a new Campaign starts with is either game data, supplied as GDRs by the Game build, or game behavior,
stated as rules in specifications. Among GDRs, only those serving the Campaign configuration preset purpose can be
overridden by the player before creation; every other GDR is fixed, e.g. a Faction's Archetype.

Which Campaign instances the initial Campaign state contains is the same for every new Campaign. No GDR serving the Campaign configuration preset purpose, under
[GDR purpose: campaign configuration preset](../foundation/game-data-records.md#gdr-purpose-campaign-configuration-preset), adds,
removes, or selects an initial Campaign instance; e.g., no preset changes the initial roster of Agents, the initial
Factions, or the absence of initial Mission sites. A Campaign configuration value can still supply an initial value of
an initial Campaign instance, e.g. starting money becomes the Agency's initial money, and can influence which Campaign
instances come into existence during play, e.g. a multiplier of how often Mission sites appear.

The initial Campaign state contains exactly one Agency, under [Agency per Campaign](#agency-per-campaign), exactly one
Faction for each FactionArchetype the Game build supplies, and no Mission sites, and therefore no Missions and no
Enemies. For each Campaign instance Type, the Mechanics specification that refines it states the rule determining the
initial Campaign instances of that Type and the source of each of their initial values, under
[Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation); e.g.,
[Factions](factions.md) states which values each initial Faction takes from its FactionArchetype. The rule is game
behavior; the content it reads is supplied by GDRs that serve no Campaign configuration preset purpose, e.g. the
FactionArchetypes and their values.
This section states what the initial
Campaign state contains, not which code creates it.

## Campaign instance identity scope

Agency, Agent, Investigation, Mission site, Enemy, and Faction share one Instance ID scope: Instance IDs must be unique
across all six Types within one Campaign. A repeated Investigation of one Lead, or a second Mission site with the same
Archetype, is therefore a distinct Campaign instance with its own Instance ID. A Mission has no Instance ID of its own;
the Instance ID of the Mission site that owns it identifies it, under
[Mission at a Mission site](#mission-at-a-mission-site). [Campaign instance identity](../foundation/campaign-state.md#campaign-instance-identity) owns the
general identity rules; this section declares the scope those rules require.

# Agent

An Agent is a Campaign instance belonging to the Agency. Agent adopts the Combatant Role Type, under
[Combatant Role Type](#combatant-role-type). Its Current assignment gives its current orders; an Investigation
Current assignment references that Investigation, and the Current assignment of a Deployed Agent references the Mission
site it is Deployed to, so that the Agent takes part in that Mission site's Mission. Its Participation history links it
to the Investigations and Missions it previously participated in.

[Agents](agents-spec.md) owns what an Agent has, the Agent lifecycle, the Current assignments an Agent
can have, Task phase, and the formulas for the attributes. Whatever its lifecycle state, an Agent remains in World
history with its final values and Participation history, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation).

## Current versus historical teams

The Current team of an Investigation or Mission must agree with Current assignments: an Agent whose Current assignment
references Investigation I belongs to the Current team of I, including while In transit, and an Agent whose Current
assignment references Mission site S belongs to the Current team of the Mission of S. Whether an Agent In transit
contributes is owned by Agents and [Investigations](investigations.md). An Agent cannot belong to more
than one Current team. In Committed state, the Agent-side and team-side views of Current team membership agree, and
no Current assignment references a Mission site that has no Mission.

Participation history describes the same relationship for the past: an Agent's Participation history and the past
participants of an Investigation or Mission are one relationship seen from opposite sides. Agents recorded in
Participation history are not members of the Current team, and Participation history neither assigns nor reserves an
Agent; e.g., the Mission of a Mission site that is Won retains an Agent's Participation history after that Agent is
assigned elsewhere.

# Lead and Investigation

A Lead is a GDR, and an Investigation is a Campaign instance for investigation of one Lead. A Lead is a Referenced
GDR, distinct from the InvestigationArchetype that is the Investigation's Archetype, as
[GDR purpose: referenced GDR](../foundation/game-data-records.md#gdr-purpose-referenced-gdr) illustrates. Lead progression is
the part of Campaign state that records, for each Lead GDR, what the Agency has earned on that Lead; it holds only
facts that are not Derived values.

[Leads and Progression](leads-and-progression.md) owns what a Lead GDR describes, Lead progression and its recording,
Lead availability, and the effect of completing a Lead. [Investigations](investigations.md) owns what an Investigation has, the Investigation
lifecycle, progress, completion probability, Current team changes, and abandonment.

## Leads and Investigations

An Investigation must retain its reference to one Lead GDR in Constants. An Investigation is Active from its creation
until it concludes; Investigations owns the lifecycle states and what concludes an Investigation. At most one Active
Investigation may exist for a Lead in a Campaign, whatever the Archetypes of the Investigations of that Lead. In
Committed state, an Active Investigation must have at least one Agent in its Current team, and an Investigation that
is not Active must have an empty Current team.

An Investigation that is not Active retains its Instance ID and Participation history. A later Investigation of the
same Lead is another Campaign instance, under [Campaign instance identity scope](#campaign-instance-identity-scope).

## Progression facts

Wins, i.e. the Mission sites a Lead created which were Won, must be explicit Authoritative values in Campaign state
with source references. Once recorded, a win therefore remains, even when the condition that earned it no longer holds, under
[Authoritative and Derived values](../foundation/core-concepts.md#authoritative-and-derived-values) in Core Concepts.
A Lead's completion count is a Derived value, calculated from Investigation Campaign instances as
[Value classification](../foundation/campaign-state.md#value-classification) describes; Lead progression holds no completion
record. No rule of a Mechanics specification reads the completion count. Faction defeat and a Lead's Faction affiliation must not depend on specially spelled identifiers. Leads and
Progression owns the predicates and effects of progression facts.

# Mission site, Mission, Enemy, and Combat

A Mission site is a Campaign instance whose Archetype is a MissionSiteArchetype. It owns the Enemies present at it and,
once the player deploys a team of Agents to it, one Mission. A Mission holds its Current team and, once the
[Battle](combat.md#glossary) is fought, its Battle result. An Enemy is a Campaign instance owned by one Mission site;
its Archetype is an EnemyArchetype. The Agents in a Mission's Current team and the Enemies of its Mission site are the
Combatants of its Battle: Agent and Enemy both adopt the Combatant Role Type.

[Missions](missions.md) owns what a Mission site and its Mission have, the Mission site lifecycle, deployment, expiry,
and the consequences for the Campaign. [Combat](combat.md) owns Battle resolution and what a Battle result holds.

## Mission site kind and provenance

Mission site Constants must retain the Mission site's kind, its origin, and its target Faction. A Mission site is
either an Initiative Mission site or a Response Mission site; the kind is fixed when the Mission site is created. An
Initiative Mission site must retain its origin: the Investigation whose completion created it, and through that
Investigation the Lead it investigated. A Response Mission site must retain its Faction operation occurrence origin,
which identifies the initiating Faction.

Each Faction operation occurrence creates exactly one Response Mission site. Two Response Mission sites originating
from the same Faction are distinct Campaign instances. A Faction operation occurrence spanning several Mission sites,
or having no Response Mission site, is out of scope. Target Faction and initiating Faction are explicit references,
never inferred from a Mission site's name.

## Mission at a Mission site

A Mission is not a Campaign instance Type: it has no Instance ID, no lifecycle, and no Archetype of its own. It is the
part of a Mission site's State that exists from the moment the player deploys Agents to that Mission site, and the
Mission site owns it. This is the same ownership by which a Mission owns its Battle result: a Battle result is not a
Campaign instance but a part of the Mission that holds it, and a Mission is not a Campaign instance but a part of the
Mission site that holds it.

A Mission site has at most one Mission, because the Agency can deploy only one team of Agents to it, once. A Mission
site that no team is ever deployed to never has a Mission. Once a Mission site has a Mission, it keeps that Mission
permanently, and the Mission is retained in World history with its Mission site, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation).

A Mission resembles the properties a Combatant gains while a Battle lasts, under
[Combatant Role Type](#combatant-role-type), with two differences: only a Mission site ever gains a Mission, and it
keeps the Mission permanently. A Mission is therefore neither a Role Type nor a second Campaign instance.

Because a Mission does not exist before deployment, no Mission corresponds to a Mission site that no team has been
deployed to, and no state of a Mission is needed to describe one. The state of the Mission site describes its Mission
too; e.g., a Mission in progress is the Mission of a Mission site that is Deployed, and a Won Mission is the Mission of
a Mission site that is Won. Missions owns these state names and the transitions between them.

## Combatant Role Type

The Combatant Role Type is a Role Type under [Role Types](../foundation/campaign-state.md#role-types). It states what a Campaign
instance Type must have for its Campaign instances to be Combatants, and what a Combatant gains while a Battle lasts.

- **Adoption condition:** a Campaign instance Type can adopt the Combatant Role Type if the State of its Campaign
  instances has all of the following properties: skill, current health, maximum health, exhaustion, and equipped
  weapon values. This set is exhaustive.
- **Adopters:** Agent and Enemy adopt the Combatant Role Type. This set is exhaustive.
- **Gained properties:** every Combatant taking part in a Battle gains properties that mean something only while
  that Battle lasts, e.g. whether it is [Incapacitated](combat.md#glossary). It gains them when the Battle begins and
  loses them when the Battle ends. [Combat](combat.md) owns the exhaustive set of gained properties.

The properties named by the adoption condition persist outside a Battle; e.g., an Agent has health and exhaustion
between Battles. What outlasts a Battle is its Battle result and every change the Battle made to those properties,
e.g. lost health.

The Combatant Role Type is not a Campaign instance Type, so a Combatant is never a Campaign instance separate from
its Agent or Enemy. If it were, every Agent would be two Campaign instances with two Instance IDs, and health would
belong to the second one instead of to the Agent. The Agent changed by a Battle is instead the same Agent that returns
to the Agency, under [Combat and consequences](#combat-and-consequences).

## Attribute bounds

Every Campaign instance of a Campaign instance Type that adopts the Combatant Role Type, i.e. every Agent and Enemy,
must obey these bounds: maximum health must be positive; current
health must be between zero and maximum health inclusive; skill and exhaustion must be nonnegative. Agents owns the
health an Agent has in each lifecycle state, the exhaustion cap, and rounding.

## Combat and consequences

An Enemy must belong to exactly one Mission site. Enemies sharing an Archetype share neither Instance ID nor health. A
Battle changes the participating Agent and Enemy Campaign instances themselves: the Agent changed by a Battle is the
same Agent that returns to the Agency. A Battle result is distinct from the consequences for the Campaign that Missions
determines from it, so a later scope can give damage-related benefits to a Battle the team did not prevail in; in this
scope [Missions](missions.md) gives none, and a Lost Mission site yields nothing. A retained Battle
result is never rewritten, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation). Combat owns which facts a Battle
result retains.

# Faction and Faction operation occurrences

A Faction is a Campaign instance for one opposing organization. Its Archetype supplies its descriptive identity and
configuration. [Factions](factions.md) owns what a Faction has, escalation, Faction operation occurrence
generation, and defeat.

A Faction operation occurrence is the origin of one Response Mission site: its initiating Faction, severity, type, and
creation facts are values in that Mission site's Constants, and that Mission site's Instance ID identifies the Faction
operation occurrence. It is not a separate Campaign instance.

# Weapons and upgrades

Weapon GDRs describe damage configuration. Equipped weapon values and their modifications during a Campaign belong to
the State of an Agent or Enemy, among the properties the Combatant Role Type requires; individual inventory items are out of scope. Upgrade GDRs supply shared
upgrade data; acquisitions and their amount or level belong to the Agency.
[Economy and Upgrades](economy-and-upgrades.md) owns acquisition costs, capacity accounting, and upgrade
effects.

# Reports

**Proposed rule:** In this scope no Mechanics specification creates a Report, so the set of Reports of a Campaign is
empty and `getReports()` returns none. Everything a Report would explain is already retained as Player-visible
information: a Mission's Battle result, each Mission site's lifecycle state and Turn created, each Investigation's
lifecycle state and Investigation progress, each Faction's Faction activity level, the Campaign ending and its Ending
reasons, and the Turn series of money. The following rules state how a Report must behave if a later scope creates one.

A Report links historical facts and explanations in World history to commands or turns and to Campaign instances. A
Report explaining a retained Battle result uses the retained values, never current calculations, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation).

A Report is Player-visible information, and it contains only facts that are Player-visible information under the
specification that owns each fact, as [Information boundary](../foundation/engine-contract.md#information-boundary) in
Engine Contract requires; e.g., a Report of a Battle states the damage an Enemy took only if [Combat](combat.md) makes that
damage Player-visible. Reports are retained in World history, so restoring a Committed state restores exactly the
Reports of that Committed state, under
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency) in Engine Contract. A retained
Report is never rewritten, under [Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation).

A rule that creates Reports, and what each Report states, is deferred beyond this scope.

# Edge cases and failure behavior

| Case                                                                                          | Result and owner                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An Agent is In transit to an Investigation                                                    | The Agent belongs to its Current team; arrival and progress timing belong to Agents and Investigations                                                                                                                                                                                                          |
| The last Agent leaves the Current team of an Active Investigation                             | No Committed state contains an Active Investigation with an empty Current team; the resulting lifecycle and numerical effects belong to Investigations                                                                                                                                                          |
| An Investigation concludes while members of its Current team are In transit                   | In the next Committed state no Current assignment references it; the replacement Current assignments belong to Agents and Investigations                                                                                                                                                                        |
| The player deploys Agents to a Mission site                                                   | The Mission site gains its Mission, whose Current team is those Agents, and each of them is Deployed with a Current assignment that references the Mission site, under [Current versus historical teams](#current-versus-historical-teams); preconditions, rejection, and transit belong to Missions and Agents |
| A team is to be deployed to a Mission site that already has a Mission                         | Never valid: a Mission site has at most one Mission, under [Mission at a Mission site](#mission-at-a-mission-site); Missions owns the rejection                                                                                                                                                                 |
| A Mission site is never deployed to, e.g. it is Expired                                       | It never has a Mission or a Battle result, under [Mission at a Mission site](#mission-at-a-mission-site); Missions owns the consequences                                                                                                                                                                        |
| A Mission retains an Agent in its Participation history after its Mission site is Won or Lost | The Agent's Current assignment is not reserved, under [Current versus historical teams](#current-versus-historical-teams)                                                                                                                                                                                       |
| The roster is empty, or no Mission sites or Investigations exist                              | Valid; [Panic and Endings](panic-and-endings.md) owns defeat conditions                                                                                                                                                                                                                                         |
| A Faction is Defeated while Mission sites targeting it or Leads affiliated with it remain     | References remain resolvable under [References](../foundation/campaign-state.md#references); Factions, Leads and Progression, and Missions own the resulting availability and outcomes                                                                                                                          |

# Acceptance examples

These are structural fixtures, not playable scenarios or API signatures. Symbolic identifiers are labels, not a chosen
identifier format. Numbers below are exact test-only integers, not campaign balance. All other scalar values owned by
Mechanics specifications are assumed valid for these structural checks.

## A. Valid relationships

Given turn 3 and:

- Campaign state c1 with its single Agency ag1.
- Archetypes supplied by the current Game build: G1 (Agency), A1 (Agent), I1 (Investigation), S1 (Mission site),
  F1 (Faction), and E1 (Enemy), plus the GDRs L1 and L2 (Leads) and W1 (weapon). These are test GDRs with no other
  required properties in this fixture.
- Faction f1 with Archetype F1.
- Agent a1 whose Current assignment references Investigation i1, In transit.
- Agent a2, Deployed to Mission site s1, so that its Current assignment references s1, At assignment.
- Investigation i0 referring to L2, no longer Active, with an empty Current team.
- Active Investigation i1 referring to L1, Current team {a1}.
- Initiative Mission site s1 with Archetype S1, originating from Investigation i0 of L2, targeting f1, Deployed, with a
  Mission whose Current team is {a2}.
- Enemy e1 owned by s1, with Archetype E1.
- Each Agent and Enemy has skill 100, health 10 of maximum health 10, exhaustion 0, and equipped values referring to W1.
- Other collections empty.

Each Campaign instance has the following allocation of the properties this specification names; the properties that
Mechanics specifications add are assumed valid:

| Campaign instance | Instance ID         | Archetype | Constants                                                              | State                                                                                                       |
| ----------------- | ------------------- | --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ag1               | ag1                 | G1        | Empty                                                                  | Resources, upgrades, roster {a1, a2}                                                                        |
| a1, a2            | a1, a2 respectively | A1        | Agency ag1                                                             | Current assignment, Task phase, the properties the Combatant Role Type requires, and Participation history  |
| i0                | i0                  | I1        | Lead L2                                                                | Not Active, empty Current team, Participation history                                                       |
| i1                | i1                  | I1        | Lead L1                                                                | Active, Current team {a1}, Participation history                                                            |
| s1                | s1                  | S1        | Initiative kind; origin Investigation i0 of Lead L2; target Faction f1 | Deployed, Enemies {e1}, and its Mission: Current team {a2}, and no Battle result until the Battle is fought |
| e1                | e1                  | E1        | Mission site s1                                                        | The properties the Combatant Role Type requires                                                             |
| f1                | f1                  | F1        | Empty                                                                  | The values Factions owns                                                                                    |

The Mission of s1 has no row of its own, because it is not a Campaign instance: it has no Instance ID, Archetype, or
Constants, and it is part of the State of s1.

Campaign state c1 holds turn 3, Lead progression, and collections containing Agency ag1, Agents a1 and a2,
Investigations i0 and i1, Mission site s1, and Faction f1; e1 and the Mission of s1 are reached through s1. Required
references resolve in c1. Immutable affiliation, origin, and target references are assumptions of this fixture, not
lifecycle rules.

These relationships satisfy [Agency per Campaign](#agency-per-campaign),
[Campaign instance identity scope](#campaign-instance-identity-scope),
[Current versus historical teams](#current-versus-historical-teams), [Attribute bounds](#attribute-bounds),
[Leads and Investigations](#leads-and-investigations),
[Mission site kind and provenance](#mission-site-kind-and-provenance),
[Mission at a Mission site](#mission-at-a-mission-site), and [Combat and consequences](#combat-and-consequences).
Current team membership does not assert that a1 makes progress while In transit. The Mechanics specifications that
refine a concept check the rules they own against this fixture; e.g.,
[Acceptance examples](agents-spec.md#acceptance-examples) in Agents checks the Agent lifecycle.

## B. Invalid variants

Each row independently changes fixture A and describes an invalid state.

| Change                                                                                    | Violation                                                             |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Give e1 the same Instance ID as a1                                                        | [Campaign instance identity scope](#campaign-instance-identity-scope) |
| Give the Mission of s1 an Instance ID of its own                                          | [Campaign instance identity scope](#campaign-instance-identity-scope) |
| Add a second Agency                                                                       | [Agency per Campaign](#agency-per-campaign)                           |
| List a1 in the Current team of the Mission of s1 while a1 is assigned to i1               | [Current versus historical teams](#current-versus-historical-teams)   |
| Remove the Mission of s1 while the Current assignment of a2 references s1                 | [Current versus historical teams](#current-versus-historical-teams)   |
| Set the health of a1 or e1 to 11 with maximum health 10, or set its exhaustion below zero | [Attribute bounds](#attribute-bounds)                                 |
| Add another Active Investigation for L1, or leave i1 Active with an empty Current team    | [Leads and Investigations](#leads-and-investigations)                 |
| Mark s1 as a Response Mission site without a Faction operation occurrence origin          | [Mission site kind and provenance](#mission-site-kind-and-provenance) |
| Give s1 a second Mission                                                                  | [Mission at a Mission site](#mission-at-a-mission-site)               |
| Assign e1 a second owning Mission site                                                    | [Combat and consequences](#combat-and-consequences)                   |

## C. Completion and later Participation history

Given i1 is Completed and the Battle of the Mission of s1 is fought and s1 becomes Won, under their owning
specifications, a valid resulting state has:

- i1 no longer Active, with an empty Current team, and a1 retained in its Participation history.
- s1 still holding its Mission, which now holds a retained Battle result, has an empty Current team, and has a2 in its
  Participation history; no Current assignment of a2 references s1.
- a1 and a2 each with a Current assignment that references neither i1 nor s1.
- An explicit progression fact recording the win of s1 against L2, which created s1 through i0, and completion counts
  of 1 for L1 and 1 for L2, derived from i1 and i0 respectively.

This satisfies [Current versus historical teams](#current-versus-historical-teams),
[Leads and Investigations](#leads-and-investigations), [Progression facts](#progression-facts),
[Mission at a Mission site](#mission-at-a-mission-site), and [Combat and consequences](#combat-and-consequences).
Assigning a1 to another Investigation does not rewrite the Participation history of i1, and assigning a2 elsewhere
does not rewrite the Participation history of the Mission of s1. A later Investigation of L1 has a new Instance ID
([Leads and Investigations](#leads-and-investigations)). This fixture does not choose the replacement Current
assignments or turn timing.

## D. Initial Campaign state

Given a new Campaign created from a Game build that supplies exactly two FactionArchetypes, F1 and F2, the initial
Campaign state contains exactly one Agency, exactly two Factions, one with Archetype F1 and one with Archetype F2, and
no Mission sites, no Missions, and no Enemies, under [Initial Campaign state](#initial-campaign-state). An initial
Campaign state with a second Faction of Archetype F1, with no Faction of Archetype F2, or with any Mission site, is
invalid.
