# Domain Model

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | DOM                                                                                                                                                                        |
| Family      | Mechanics                                                                                                                                                                  |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                |
| Owns        | Game concepts, how they relate, and the structural invariants that span several concepts.                                                                                  |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The game is a [Campaign](../foundation/core-concepts.md#glossary) in which the player runs one Agency against the
Factions that oppose it. Everything the Agency does, its Agents do: each Agent is an operative who does one thing at a
time, so sending it to one task always means taking it from another.

The concepts are arranged around where the Agency's work comes from and where it leads. The Agency finds work by
investigating Leads, and the Factions create work through their operations. Either can lead to a Mission site, a place
where Enemies are present for a limited time. Deploying a team of Agents to a Mission site creates a Mission, in which
they fight those Enemies.

Every concept is modeled with the vocabulary of [Campaign State](../foundation/campaign-state.md). Domain Model says how
the concepts connect, which every concept must agree on; how each one behaves is refined separately, e.g. by
[Agents](agents-spec.md), so that one concept's rules can change without touching the others.

# Relationships

- Uses [Campaign Instances](../foundation/campaign-instances.md)
- Uses [Campaign State](../foundation/campaign-state.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Game Data Records](../foundation/game-data-records.md)
- Uses [World History](../foundation/world-history.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Bootstrap GDRs](../content/bootstrap-gdrs.md)
- Used by [Graphical User Interface](../ui/gui.md)
- Used by [Turn Advancement](./turn-advancement.md)
- Refined by [Agents](agents-spec.md)
- Refined by [Combat](combat.md)
- Refined by [Economy and Upgrades](economy-and-upgrades.md)
- Refined by [Factions](factions.md)
- Refined by [Investigations](investigations.md)
- Refined by [Leads and Progression](leads-and-progression.md)
- Refined by [Missions](missions.md)
- Refined by [Panic and Endings](panic-and-endings.md)

# Glossary

These terms name the concepts of the game. Modeling terms are in the
[Core Concepts](../foundation/core-concepts.md#glossary), [Campaign State](../foundation/campaign-state.md#glossary),
and [Campaign Instances](../foundation/campaign-instances.md#glossary) glossaries; terms about a single concept are in the Glossary of the Mechanics specification that refines it, e.g. the
[Agents](agents-spec.md#glossary) and [Combat](combat.md#glossary) glossaries.

## Agency and Agents

The player-controlled organization, its Agents, what each Agent is doing, and what each has taken part in.

| Term                  | Definition                                                                                                                                                                                              | Prohibited synonyms                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Agency                | The organization the player controls in a Campaign. It holds the money, funding, and upgrades, and employs the Agents.                                                                                  |                                                  |
| Agent                 | An operative employed by the Agency, whom the player assigns to Investigations and Missions.                                                                                                            |                                                  |
| Assignment            | What an Agent is currently assigned to do, e.g. take part in a particular Investigation or Mission.                                                                                                     | Current assignment                               |
| Agent status          | Where an Agent stands: carrying out its Assignment (At assignment), still travelling to it (In transit), regaining current health at Recovery (Recovering), or no longer serving (Killed or Dismissed). | Task phase; Agent lifecycle state                |
| Participation history | The permanent record of which Agents took part in which past Investigations and Missions.                                                                                                               | Participation; agent history; past participation |

## Leads, Investigations, Mission sites, and Missions

The work the Agency discovers and undertakes. [Investigations](investigations.md) states how Investigation progress
grows, and [Leads and Progression](leads-and-progression.md) states when a Lead is available.

| Term                    | Definition                                                                                                                                                                          | Prohibited synonyms                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lead                    | A line of inquiry the Agency can investigate. Investigating it can open further Leads and Mission sites.                                                                            | Opportunity. Ordinary uses, e.g. opportunity cost, remain valid.                                                                                                                                              |
| Investigation           | One effort by a team of Agents to investigate one Lead, from its start until it concludes.                                                                                          | Attempt. Attempts to execute commands or undertake Missions remain distinct.                                                                                                                                  |
| Mission site            | A place where Enemies of one Faction are present for a limited time, and to which the Agency can deploy one team of Agents.                                                         | Open Mission; available Mission; pending Mission, for which say Active Mission site; Mission template, for which say MissionSiteArchetype; expiry, for which say expiration; expiry, for which say expiration |
| Initiative Mission site | A Mission site the Agency found by completing an Investigation of a Lead.                                                                                                           | Offensive mission                                                                                                                                                                                             |
| Response Mission site   | A Mission site created by a Faction operation occurrence, where the Agency can stop that operation.                                                                                 | Defensive mission                                                                                                                                                                                             |
| Mission                 | One deployment of a team of Agents to one Mission site, together with its outcome.                                                                                                  | Mission deployment; deployment, as a thing; Mission definition, for which say MissionArchetype. Deployment as the ordinary act of deploying remains valid.                                                    |
| Initiative Mission      | A Mission at an Initiative Mission site.                                                                                                                                            |                                                                                                                                                                                                               |
| Response Mission        | A Mission at a Response Mission site.                                                                                                                                               |                                                                                                                                                                                                               |
| Consequences            | What a Mission site and its Mission change in the Campaign once they reach a final state, e.g. the money a Won Mission brings or the Panic an ignored Response Mission site raises. | Rewards and penalties                                                                                                                                                                                         |
| Current team            | The Agents currently assigned to a given Investigation or Mission.                                                                                                                  |                                                                                                                                                                                                               |
| Investigation progress  | The work a team has done on an Investigation so far, counted in skill points.                                                                                                       |                                                                                                                                                                                                               |
| Lead availability       | Whether a Lead may be investigated, as far as its prerequisites, its own earlier results, and its Faction allow.                                                                    |                                                                                                                                                                                                               |

## Combat

A Combat, its participants, and its retained results.

| Term                | Definition                                                                                                                                                      | Prohibited synonyms                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Combat              | One armed clash between the Agents deployed to a Mission site and the Enemies there, resolved in full within one Advance turn.                                  | Battle; skirmish; fight, as a noun. Ordinary verbs, e.g. "Agents fight Enemies", remain valid. |
| Combatant           | An Agent or an Enemy as a participant in a Combat. Both can fight because both have base skill, current health, base health, exhaustion, and weapon capability. |                                                                                                |
| Combatant Role Type | What an Agent or an Enemy must have in order to be a Combatant, and what it gains while a Combat lasts.                                                         |                                                                                                |
| Enemy               | An opponent present at one Mission site, whom the Agency's Agents fight in a Combat.                                                                            |                                                                                                |
| Combat report       | The record of how a Combat went, kept as part of the Turn report of the Advance turn that fought it and used to determine its Mission's Consequences.           | Battle result                                                                                  |

## Factions

The opposing organizations and their operations.

| Term                         | Definition                                                                       | Prohibited synonyms |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------- |
| Faction                      | An organization that opposes the Agency and carries out operations in the world. |                     |
| Faction operation occurrence | One operation carried out by a Faction, which creates one Response Mission site. |                     |

## Campaign standing

How the Campaign as a whole stands, which no single concept owns. [Panic and Endings](panic-and-endings.md) states how
each changes.

| Term            | Definition                                                                                 | Prohibited synonyms |
| --------------- | ------------------------------------------------------------------------------------------ | ------------------- |
| Panic           | How alarmed the public is, from 0% to 100%; the Campaign is lost when it gets high enough. |                     |
| Campaign ending | How a Campaign finished: Victory or Defeat. A Campaign without one is still being played.  |                     |

# Game concepts

Each game concept has the following modeling role and multiplicity. This table is exhaustive.

| Concept                                         | Modeling role                                                                                                                   | Multiplicity within one Campaign                                                                                                                                                                                               | Detailed in                                                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Agency                                          | Campaign instance Type                                                                                                          | Exactly one, under [Agency per Campaign](#agency-per-campaign)                                                                                                                                                                 | [Economy and Upgrades](economy-and-upgrades.md)                                                            |
| Agent                                           | Campaign instance Type                                                                                                          | Any number; the roster is limited under [Agency caps](economy-and-upgrades.md#agency-caps)                                                                                                                                     | [Agents](agents-spec.md)                                                                                   |
| Investigation                                   | Campaign instance Type                                                                                                          | Any number; at most one Active Investigation per Lead, under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead)                                                                          | [Investigations](investigations.md)                                                                        |
| Mission site                                    | Campaign instance Type                                                                                                          | Any number; none in the initial Campaign state, under [Initial Campaign state](#initial-campaign-state); exactly one Response Mission site per Faction operation occurrence, under [How concepts relate](#how-concepts-relate) | [Missions](missions.md)                                                                                    |
| Mission                                         | Campaign instance Type                                                                                                          | Any number; at most one per Mission site, under [How concepts relate](#how-concepts-relate)                                                                                                                                    | [Missions](missions.md)                                                                                    |
| Enemy                                           | Campaign instance Type                                                                                                          | Any number, each belonging to exactly one Mission site, under [How concepts relate](#how-concepts-relate)                                                                                                                      | [Combat](combat.md)                                                                                        |
| Faction                                         | Campaign instance Type                                                                                                          | Exactly one per FactionArchetype supplied by the Game build, under [Initial Campaign state](#initial-campaign-state)                                                                                                           | [Factions](factions.md)                                                                                    |
| Combatant Role Type                             | Role Type adopted by Agent and Enemy; not a Campaign instance Type                                                              | No Campaign instances                                                                                                                                                                                                          | [Combatant Role Type](agents-spec.md#combatant-role-type) in Agents                                        |
| Lead                                            | GDR serving the Referenced GDR and Key for campaign facts purposes                                                              | Not a Campaign instance                                                                                                                                                                                                        | [Leads and Progression](leads-and-progression.md)                                                          |
| Combat report                                   | Part of the Turn report of the Advance turn in which its Combat was fought; not a Campaign instance and not part of any Mission | Exactly one per fought Combat, so at most one per Mission                                                                                                                                                                      | [Combat report](combat.md#combat-report) in Combat                                                         |
| Faction operation occurrence                    | Values in the Constants of the Response Mission site it creates, whose Instance ID identifies it; not a Campaign instance       | Exactly one per Response Mission site                                                                                                                                                                                          | [Faction operation occurrence generation](factions.md#faction-operation-occurrence-generation) in Factions |
| Weapon GDRs                                     | GDRs                                                                                                                            | Not Campaign instances                                                                                                                                                                                                         | [Weapon](combat.md#weapon) in Combat                                                                       |
| Upgrade GDRs                                    | GDRs                                                                                                                            | Not Campaign instances                                                                                                                                                                                                         | [Upgrades](economy-and-upgrades.md#upgrades) in Economy and Upgrades                                       |
| Archetypes of the seven Campaign instance Types | GDRs serving the Archetype purpose                                                                                              | Not Campaign instances; sharing an Archetype does not limit how many Campaign instances exist                                                                                                                                  | The specification that details each Campaign instance Type                                                 |

GDR purposes are defined under [Purposes of GDRs](../foundation/game-data-records.md#purposes-of-gdrs). Every Campaign instance of
the seven Campaign instance Types has the four properties stated under
[Campaign instance structure](../foundation/campaign-instances.md#campaign-instance-structure). A concept can include facts
hidden from the player. Being a property of a concept does not determine whether a value
is an Authoritative value or a Derived value; e.g., an Agent's career statistics may be Derived values calculated from
retained facts.

```mermaid
flowchart TD
    CampaignState["Campaign state"] -->|contains one| Agency["Agency"]
    Agency -->|employs| Agents["Agents"]
    CampaignState -->|contains| Factions["Factions"]
    CampaignState -->|contains| Investigations["Investigations"]
    CampaignState -->|contains| MissionSites["Mission sites"]
    CampaignState -->|contains| Missions["Missions"]
    Investigations -->|each investigates| Lead["One Lead GDR"]
    Agents -->|each has| Assignment["Assignment and Agent status"]
    Assignment -->|can reference| Investigations
    Assignment -->|when Deployed, references| Missions
    Agents -->|each has| Participation["Participation history"]
    Participation -->|records past| Investigations
    Participation -->|records past| Missions
    MissionSites -->|each owns| Enemies["Enemies"]
    MissionSites -->|each retains| Origin["Investigation origin or Faction operation occurrence origin"]
    Missions -->|each takes place at one| MissionSites
    Missions -->|each holds| Team["Current team"]
    CampaignState -->|Turn report holds one per Combat fought in the latest Advance turn| Result["Combat reports"]
    Result -->|each names its| Missions
```

Arrows show the labelled relationships, not inheritance.

## How concepts relate

Campaign instances reference each other as follows. Every row holds in every Committed state. Each concept has further
references, listed with its properties.

| From                          | To                                                                                                    | How many                                                                                 | Reference           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------- |
| Agent                         | The Agency                                                                                            | Exactly one                                                                              | Immutable reference |
| Agent, through its Assignment | An Investigation, or the Mission the Agent is Deployed on                                             | At most one                                                                              | Mutable reference   |
| Investigation                 | The Lead GDR it investigates                                                                          | Exactly one                                                                              | Immutable reference |
| Mission site                  | The Faction it targets                                                                                | Exactly one                                                                              | Immutable reference |
| Initiative Mission site       | Its origin: the Investigation whose completion created it                                             | Exactly one                                                                              | Immutable reference |
| Response Mission site         | Its origin: the Faction operation occurrence that created it, which identifies the initiating Faction | Exactly one; each Faction operation occurrence creates exactly one Response Mission site | Immutable reference |
| Mission                       | The Mission site at which it takes place                                                              | Exactly one; a Mission site has at most one Mission                                      | Immutable reference |
| Enemy                         | The Mission site at which it is present                                                               | Exactly one                                                                              | Immutable reference |

A Mission site is either an Initiative Mission site or a Response Mission site, so every Mission site has exactly one
origin. An Initiative Mission site identifies, through its origin Investigation, the Lead that created it. A Faction
operation occurrence that spans several Mission sites, or that has no Response Mission site, is out of scope.

# Campaign and Agency

A Campaign contains one Agency, the current Turn, Panic and the Campaign ending, Agents, Factions,
Investigations, Mission sites, and Missions. Campaign-wide properties, e.g. the current Turn and Panic, belong directly to Campaign state, not to the
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
Enemies. For each Campaign instance Type, the rule determining the initial Campaign instances of that Type and the
source of each of their initial values, under
[Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation), is in the Mechanics
specification that refines it; e.g., [Initial Factions](factions.md#initial-factions) gives which values each initial
Faction takes from its FactionArchetype. The rule is game behavior; the content it reads is supplied by GDRs that serve
no Campaign configuration preset purpose, e.g. the FactionArchetypes and their values.

## Campaign instance identity scope

Agency, Agent, Investigation, Mission site, Mission, Enemy, and Faction share one Instance ID scope, as
[Campaign instance identity](../foundation/campaign-instances.md#campaign-instance-identity) requires: Instance IDs must
be unique across all seven Types within one Campaign. A repeated Investigation of one Lead, or a second Mission site
with the same Archetype, is therefore a distinct Campaign instance with its own Instance ID. A Mission and its Mission
site have different Instance IDs.

# Current versus historical teams

The Current team of an Investigation or Mission must agree with Assignments: an Agent whose Assignment
references Investigation I belongs to the Current team of I, including while In transit, and an Agent whose
Assignment references Mission M belongs to the Current team of M. Whether an Agent In transit contributes is decided
under [Transit rule](agents-spec.md#transit-rule) and [Progress gain](investigations.md#progress-gain). An Agent cannot belong to more
than one Current team. In Committed state, the Agent-side and team-side views of Current team membership agree, and
no Assignment references an Investigation that is no longer Active or a Mission that is no longer Deployed.

Participation history describes the same relationship for the past: an Agent's Participation history and the past
participants of an Investigation or Mission are one relationship seen from opposite sides. Agents recorded in
Participation history are not members of the Current team, and Participation history neither assigns nor reserves an
Agent; e.g., a Won Mission retains an Agent's Participation history after that Agent is assigned elsewhere.

# Edge cases and failure behavior

| Case                                                                                        | Result and owner                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| An Agent is In transit to an Investigation                                                  | The Agent belongs to its Current team; arrival and progress timing belong to Agents and Investigations                                                                                                                                                                                                                   |
| An Investigation concludes while members of its Current team are In transit                 | In the next Committed state no Assignment references it; the replacement Assignments belong to Agents and Investigations                                                                                                                                                                                                 |
| The player deploys Agents to a Mission site                                                 | A new Mission at that Mission site comes into existence, whose Current team is those Agents, and each of them is Deployed with an Assignment that references the Mission, under [Current versus historical teams](#current-versus-historical-teams); preconditions, rejection, and transit belong to Missions and Agents |
| A team is to be deployed to a Mission site that already has a Mission                       | Never valid: a Mission site has at most one Mission, under [How concepts relate](#how-concepts-relate); Missions owns the rejection                                                                                                                                                                                      |
| A Mission retains an Agent in its Participation history after it is Won or Lost             | The Agent's Assignment is not reserved, under [Current versus historical teams](#current-versus-historical-teams)                                                                                                                                                                                                        |
| The roster is empty, or no Mission sites or Investigations exist                            | Valid; [Panic and Endings](panic-and-endings.md) owns Defeat conditions                                                                                                                                                                                                                                                  |
| A Faction is Eliminated while Mission sites targeting it or Leads affiliated with it remain | References remain resolvable under [References](../foundation/campaign-instances.md#references); Factions, Leads and Progression, and Missions own the resulting availability and outcomes                                                                                                                               |

# Acceptance examples

These are structural fixtures, not playable scenarios or API signatures. Symbolic identifiers are labels, not a chosen
identifier format. Numbers below are exact test-only integers, not campaign balance. All other scalar values of
Mechanics specifications are assumed valid for these structural checks.

## A. Valid relationships

Given Turn 3 and:

- Campaign state c1 with its single Agency ag1.
- Archetypes supplied by the current Game build: G1 (Agency), A1 (Agent), I1 (Investigation), S1 (Mission site),
  M1 (Mission), F1 (Faction), and E1 (Enemy), plus the GDRs L1 and L2 (Leads) and W1 (weapon). These are test GDRs with no other
  required properties in this fixture.
- Faction f1 with Archetype F1.
- Agent a1 whose Assignment references Investigation i1, In transit.
- Agent a2, Deployed on Mission m1, so that its Assignment references m1, At assignment.
- Investigation i0 referring to L2, no longer Active, with an empty Current team.
- Active Investigation i1 referring to L1, Current team {a1}.
- Initiative Mission site s1 with Archetype S1, originating from Investigation i0 of L2, targeting f1, Attempted.
- Mission m1 with Archetype M1 at Mission site s1, deployed in Turn 3, Deployed, with Current team {a2}.
- Enemy e1 owned by s1, with Archetype E1.
- Each Agent and Enemy has base skill 100, current health 10 of base health 10, exhaustion 0, and equipped values referring to W1.
- Other collections empty.

Each Campaign instance has the following allocation of the properties named in the sections above; the properties
that Mechanics specifications add are assumed valid:

| Campaign instance | Instance ID         | Archetype | Constants                                                              | State                                                                                                |
| ----------------- | ------------------- | --------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ag1               | ag1                 | G1        | Empty                                                                  | Resources, upgrades, roster {a1, a2}                                                                 |
| a1, a2            | a1, a2 respectively | A1        | Agency ag1                                                             | Assignment, Agent status, the properties the Combatant Role Type requires, and Participation history |
| i0                | i0                  | I1        | Lead L2                                                                | Not Active, empty Current team, Participation history                                                |
| i1                | i1                  | I1        | Lead L1                                                                | Active, Current team {a1}, Participation history                                                     |
| s1                | s1                  | S1        | Initiative kind; origin Investigation i0 of Lead L2; target Faction f1 | Attempted, Enemies {e1}                                                                              |
| m1                | m1                  | M1        | Mission site s1; Turn deployed 3; team sent {a2}                       | Deployed, Current team {a2}                                                                          |
| e1                | e1                  | E1        | Mission site s1                                                        | The properties the Combatant Role Type requires                                                      |
| f1                | f1                  | F1        | Empty                                                                  | The values under [Faction State](factions.md#faction-state)                                          |

Campaign state c1 holds Turn 3 and collections containing Agency ag1, Agents a1 and a2,
Investigations i0 and i1, Mission site s1, Mission m1, and Faction f1; e1 is reached through s1, and the Mission of
s1 is m1, the Mission whose Mission site reference identifies s1. Required
references resolve in c1. Immutable affiliation, origin, and target references are assumptions of this fixture, not
lifecycle rules.

These relationships satisfy [Agency per Campaign](#agency-per-campaign),
[Campaign instance identity scope](#campaign-instance-identity-scope),
[Current versus historical teams](#current-versus-historical-teams), and [How concepts relate](#how-concepts-relate).
Current team membership does not assert that a1 makes progress while In transit. The rules of a single concept are
checked against this fixture by the Mechanics specification that refines it; e.g.,
[Acceptance examples](agents-spec.md#acceptance-examples) in Agents checks Agent status.

## B. Invalid variants

Each row independently changes fixture A and describes an invalid state.

| Change                                                                           | Violation                                                             |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Give e1 the same Instance ID as a1                                               | [Campaign instance identity scope](#campaign-instance-identity-scope) |
| Give m1 the same Instance ID as s1                                               | [Campaign instance identity scope](#campaign-instance-identity-scope) |
| Add a second Agency                                                              | [Agency per Campaign](#agency-per-campaign)                           |
| List a1 in the Current team of m1 while a1 is assigned to i1                     | [Current versus historical teams](#current-versus-historical-teams)   |
| Make m1 Won while the Assignment of a2 still references m1                       | [Current versus historical teams](#current-versus-historical-teams)   |
| Mark s1 as a Response Mission site without a Faction operation occurrence origin | [How concepts relate](#how-concepts-relate)                           |
| Add a second Mission whose Mission site reference identifies s1                  | [How concepts relate](#how-concepts-relate)                           |
| Remove the Mission site reference of m1                                          | [How concepts relate](#how-concepts-relate)                           |
| Assign e1 a second owning Mission site                                           | [How concepts relate](#how-concepts-relate)                           |

## C. Completion and later Participation history

Given i1 is Completed and the Combat of m1 is fought and m1 becomes Won, a valid resulting state has:

- i1 no longer Active, with an empty Current team, and a1 retained in its Participation history.
- s1 still Attempted, and m1 still its Mission; m1 now has an empty Current team, and a2 has m1 in its Participation
  history; the Turn report holds the Combat report of m1's Combat; no Assignment of a2 references m1.
- a1 and a2 each with an Assignment that references neither i1 nor m1.

This satisfies [Current versus historical teams](#current-versus-historical-teams) and
[How concepts relate](#how-concepts-relate).
Assigning a1 to another Investigation does not rewrite the Participation history of i1, and assigning a2 elsewhere
does not rewrite the Participation history of m1. A later Investigation of L1 has a new Instance ID
([Campaign instance identity scope](#campaign-instance-identity-scope)). This fixture does not choose the replacement
Assignments or Turn timing.

## D. Initial Campaign state

Given a new Campaign created from a Game build that supplies exactly two FactionArchetypes, F1 and F2, the initial
Campaign state contains exactly one Agency, exactly two Factions, one with Archetype F1 and one with Archetype F2, and
no Mission sites, no Missions, and no Enemies, under [Initial Campaign state](#initial-campaign-state). An initial
Campaign state with a second Faction of Archetype F1, with no Faction of Archetype F2, or with any Mission site, is
invalid.

# TODOs

- TODO: State what the Turn report and each History entry hold of each value the Mechanics specifications own, including the reduced form of a Combat report that a History entry keeps, e.g. which Agents survived, lost current health, or were Killed, under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in World History.
