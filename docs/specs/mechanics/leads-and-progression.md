# Leads and Progression

| Metadata    | Value                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | LEAD                                                                                                                   |
| Family      | Mechanics                                                                                                              |
| Status      | Draft                                                                                                                  |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                            |
| Owns        | What a Lead GDR describes, Lead progression and its recording, Lead availability, and the effect of completing a Lead. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                         |

# Overview

This document defines the Game Data Record (GDR) Type Lead: its properties, its one kind of prerequisite, its one kind of
completion effect, and the validation rules a Game build's Leads must satisfy. It defines [Lead progression](domain-model.md#glossary),
the part of Campaign state that records, for each Lead, the Mission sites it created which were Won, and when a Won
Mission site is recorded. It defines when a Lead is available, i.e. may be investigated, as a Derived value; what happens
when an Investigation of a Lead completes; and which of these values are Player-visible information.

It refines Domain Model's progression contract, i.e. [Lead and Investigation](domain-model.md#lead-and-investigation),
[Leads and Investigations](domain-model.md#leads-and-investigations), and
[Progression facts](domain-model.md#progression-facts), with what a Lead GDR describes, what Lead progression holds, the
meaning of a prerequisite, the conditions of availability, and the completion effect. It uses
[Factions](factions.md) for the [Defeat](factions.md#defeat) fact that blocks the Leads of a Defeated Faction, and
[Missions](missions.md) for the Mission site lifecycle states, for Mission site creation, and for the Mission site
resolution in which a Won Mission site becomes known. Among Mechanics specifications it depends only on Domain Model,
Factions, and Missions.

This document does not own, e.g.:

- When an Investigation completes, what an Investigation has, its lifecycle, its progress, how a Lead's `difficulty` is
  used, and whether an Investigation of a Lead can be started now: [Investigations](investigations.md) owns them,
  including the Player action that starts an Investigation and its rule
  [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead).
- The Mission site a completed Investigation creates, its lifecycle, and its consequences: [Missions](missions.md) owns
  them, including the one consequence that makes a Faction Defeated.
- The order of the Turn advancement steps: [Turn Advancement](turn-advancement.md) owns it.

These are ownership pointers; this document relies on none of them. Two rules cross the boundary with Missions, and
this document owns both: the validation rule that a Lead's `create_mission_site` names a MissionSiteArchetype of kind
initiative, and recording a Won Mission site against the Lead that created it, which [Missions](missions.md) points to.

The following features are out of scope and are not specified here. The list is exhaustive: it names every deferred
feature that would change a rule of this document.

- **Discovery:** no Lead is hidden. Every Lead the Game build supplies is Player-visible information from campaign
  creation, whether or not it is available. A Lead that the player has not yet found, and a Lead discovered through
  another Lead, do not exist in this scope.
- **Repeatable Leads:** a Lead whose Mission site was Won is never available again. No Lead property makes a Lead
  repeatable.
- **Further prerequisite and effect kinds:** `mission_won_from_lead` is the only prerequisite kind and
  `create_mission_site` is the only effect kind. A Lead's completion gives no information, money, funding, Agent
  improvement, or Campaign objective directly.
- **Leads that defeat a Faction directly:** no Lead completion makes a Faction Defeated. A Faction becomes Defeated only
  through a Won Mission site, under [Defeat](factions.md#defeat), so no Lead discovers or defeats a Faction.

With them out of scope, a Lead's availability depends only on its prerequisites, Lead progression, the Mission sites
the Lead created, and whether its Faction is Defeated.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Factions](./factions.md)
- Uses [Missions](./missions.md)
- Refines [Domain Model](domain-model.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Investigations](./investigations.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

Lead, Lead progression, Investigation, Current team, Mission site, Initiative Mission site, Response Mission site,
Mission, and Faction are defined by the [Domain Model glossary](domain-model.md#glossary). Campaign instance, Instance ID,
Archetype, Constants, and State are defined by the [Campaign State glossary](../foundation/campaign-state.md#glossary).
GDR, Game build, Campaign state, Authoritative value, and Derived value are defined by the
[Core Concepts glossary](../foundation/core-concepts.md#glossary). Player-visible information, Player action, Committed
state, and Turn are defined by the [Engine Contract glossary](../foundation/engine-contract.md#glossary). Turn
advancement step is defined by the [Turn Advancement glossary](turn-advancement.md#glossary). The Mission site states
Active, Deployed, Won, Lost, Expired, and Cancelled are defined by
[Mission site lifecycle](missions.md#mission-site-lifecycle), the Investigation states Active, Completed, and Abandoned
are owned by [Investigations](investigations.md), and Defeated is a fact of a Faction that
[Defeat](factions.md#defeat) owns.

| Term               | Definition                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Lead difficulty    | How hard a Lead is to investigate.                                                                                 |
| Lead availability  | Whether a Lead may be investigated, as far as its prerequisites, its own earlier results, and its Faction allow.   |
| Recorded win       | A Mission site created by a Lead and Won, which Lead progression keeps for that Lead for the rest of the Campaign. |
| Blocking condition | A condition of Lead availability that does not hold for a Lead and so makes the Lead not available.                |

This document defines no further terms. A Lead has no lifecycle states. Lead availability is a Derived value under
[Lead availability](#lead-availability), not a state; "available" is the plain word for a Lead whose Lead availability
holds. "Prerequisite" and "completion effect" are plain words for the `requires` and `on_completion` properties of a
Lead.

# Lead GDRs

This document owns the GDR Type Lead and states which rule reads each property. A rule in this document names the
property it reads and never copies a GDR value; only the [Acceptance examples](#acceptance-examples) show values. The
GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md) and the YAML
files it names.

## Lead

A Lead describes one line of inquiry. A Lead is a GDR serving the Referenced GDR and Key for campaign facts purposes
under [Game concepts](domain-model.md#game-concepts) in Domain Model; it is not a Campaign instance, and a Lead's GDR
never changes during a Campaign. The following property table is exhaustive apart from the `id` and `type` that every GDR
has.

| Property        | Shape                                                                                                                                       | Meaning                                                                                                                                                                                                     | Read by                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `name`          | Non-empty text.                                                                                                                             | The display name of the Lead.                                                                                                                                                                               | [Player-visible information](#player-visible-information)                        |
| `description`   | Non-empty text.                                                                                                                             | The display description of the Lead.                                                                                                                                                                        | [Player-visible information](#player-visible-information)                        |
| `faction`       | The identifier of a FactionArchetype.                                                                                                       | The Faction the Lead concerns: the Faction whose Archetype is this FactionArchetype. It decides the target Faction of the Mission site the Lead creates, and blocks the Lead once that Faction is Defeated. | [Lead availability](#lead-availability); [Completion effect](#completion-effect) |
| `difficulty`    | A whole number of at least 1.                                                                                                               | The Lead difficulty of the Lead.                                                                                                                                                                            | [Investigations](investigations.md), which owns how an Investigation uses it     |
| `requires`      | A list, possibly empty, of prerequisites. Each prerequisite is a map with exactly one key, the prerequisite kind, and a value for that key. | The prerequisites that must all hold before the Lead is available, under [Prerequisites](#prerequisites).                                                                                                   | [Prerequisites](#prerequisites)                                                  |
| `on_completion` | A map with exactly one key, the effect kind, and a value for that key.                                                                      | What happens when an Investigation of the Lead completes, under [Completion effect](#completion-effect).                                                                                                    | [Completion effect](#completion-effect)                                          |

Exactly one prerequisite kind and exactly one effect kind exist, and these two tables are exhaustive:

| Prerequisite kind       | Value                     | Meaning                                                                        |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `mission_won_from_lead` | The identifier of a Lead. | Holds under [Prerequisites](#prerequisites) when that Lead has a Recorded win. |

| Effect kind           | Value                                     | Meaning                                                                            |
| --------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `create_mission_site` | The identifier of a MissionSiteArchetype. | Creates one Initiative Mission site under [Completion effect](#completion-effect). |

A Lead names its prerequisite Leads, its Faction, and the MissionSiteArchetype it creates by GDR identifier, never by
inference from identifier text, under [References](../foundation/campaign-state.md#references) in Campaign State.

## Lead GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the Lead Type,
and it adds to [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation) in Missions and
[Faction GDR validation](factions.md#faction-gdr-validation) in Factions. A Game build whose GDRs violate one of these
rules is defective: no Campaign is created from it, and the violation is reported as a data defect, never repaired into
different gameplay, under [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in
Engine Contract.

1. **Known properties:** Each Lead has `name`, `description`, `faction`, `difficulty`, `requires`, and `on_completion`,
   and no property other than those listed in its table above, apart from `id` and `type`. Its `name` and `description`
   are non-empty text.
2. **Faction resolves:** `faction` is the identifier of a FactionArchetype the Game build supplies.
3. **Difficulty is valid:** `difficulty` is a whole number of at least 1.
4. **Prerequisite kinds are known:** `requires` is a list, and each of its entries is a map with exactly one key, which is
   `mission_won_from_lead`. An entry with any other key, or with more than one key, is invalid.
5. **Prerequisite references resolve:** The value of each `mission_won_from_lead` entry is the identifier of a Lead the
   Game build supplies, and no two entries of one `requires` name the same Lead.
6. **Prerequisites form no cycle:** Consider the relation in which each Lead points to every Lead its `requires` names.
   Following it from any Lead never visits a Lead twice. A cycle, including a Lead whose `requires` names itself, is
   invalid.
7. **Completion effect is valid:** `on_completion` is a map with exactly one key, which is `create_mission_site`. A map
   with no key, with more than one key, or with any other key is invalid. The value of `create_mission_site` is the
   identifier of a MissionSiteArchetype the Game build supplies whose `kind` is `initiative`; naming a MissionSiteArchetype
   of kind response is invalid.

These rules guarantee that the prerequisite relation is a finite acyclic graph, that every Lead has exactly one Faction
and exactly one MissionSiteArchetype to create, and that the [Completion effect](#completion-effect) supplies a
MissionSiteArchetype of kind initiative, as [Mission site creation](missions.md#mission-site-creation) requires of its
creating rule. A Lead that no other Lead
requires, and a Lead whose prerequisite chain starts at a Lead with an empty `requires`, are valid; a Lead whose
prerequisites can never hold in practice is also valid, because the rules do not examine Mission site outcomes.

# Lead progression

**Proposed rule:** Lead progression is the Campaign-wide part of Campaign state that records, for each Lead the Game build
supplies, the Mission sites created by that Lead which were Won. It belongs to the Campaign, not to any Campaign
instance, under [Progression facts](domain-model.md#progression-facts) in Domain Model. It is an Authoritative value, and
it has exactly the following content.

| Part                  | Value                                                                                                                                            | Classification and range                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recorded wins of Lead | For each Lead the Game build supplies, an unordered set of Immutable references, each to one Mission site that the Lead created and that is Won. | Authoritative value. A set of any size from 0; a Mission site appears in at most one set and at most once. A reference never changes or is removed. |

A Mission site is created by a Lead L exactly when it is an Initiative Mission site whose origin Investigation, under
[Mission site properties](missions.md#mission-site-properties) in Missions, is an Investigation of L, i.e. retains a
reference to L under [Leads and Investigations](domain-model.md#leads-and-investigations) in Domain Model. A Response
Mission site is created by no Lead. A Lead L has a Recorded win exactly when L's set in Lead progression is not empty.

**Initial Lead progression:** The initial Campaign state has, for every Lead the Game build supplies, an empty set of
Recorded wins. No GDR and no Campaign configuration value supplies or changes it, under
[Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model. A Game build that supplies no Lead has an
empty Lead progression.

## Recording a Won Mission site

**Proposed rule:** When a Mission site becomes Won in the Turn advancement step Mission resolution, under
[Mission resolution](missions.md#mission-resolution) in Missions, and it is an Initiative Mission site, a reference to it
is added to the set of Recorded wins of the Lead that created it. The record is made in the same step and the same
Advance turn as the transition, as part of the consequences of the Won Mission site, and every later step of that Advance
turn sees it. This is the only way an entry is added. A Mission site that becomes Lost, Expired, or Cancelled is recorded
nowhere, and a Response Mission site is recorded nowhere. Recording does nothing else; e.g., it changes no Faction, no
Investigation, and no Mission site.

The record is permanent: once recorded, a win remains recorded even if the Faction of the Lead later becomes Defeated, as
[Progression facts](domain-model.md#progression-facts) in Domain Model requires. Adding the references of several Mission
sites in one step, to the same set or to different sets, gives the same Lead progression whichever order an
implementation uses.

# Prerequisites

**Proposed rule:** A prerequisite `mission_won_from_lead` with the value X holds exactly when Lead progression records at
least one Mission site in the set of Recorded wins of Lead X, i.e. when X has a Recorded win. Otherwise it does not hold.
The identifier X refers to the Lead GDR itself, never to text parsed from an identifier.

- **Direct only:** A prerequisite concerns exactly the Lead it names. It does not hold because a Lead further along the
  prerequisite relation has a Recorded win, and it does not read the Investigations, the Mission sites, or the Faction
  of X.
- **Permanent:** Because a Recorded win is permanent, a prerequisite that holds holds for the rest of the Campaign. It
  does not stop holding when its Faction becomes Defeated.
- **All must hold:** The prerequisites of a Lead are all of the entries of its `requires`. They hold together exactly
  when each of them holds. An empty `requires` holds together, because no prerequisite fails.

# Lead availability

**Proposed rule:** Whether a Lead is available is a Derived value, calculated from the Committed state in which it is
read; it is never stored. A Lead L is available exactly when all of the following four conditions hold. The list is
exhaustive.

| Condition                             | It holds exactly when                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1. Prerequisites hold                 | Every prerequisite in the `requires` of L holds, under [Prerequisites](#prerequisites).                         |
| 2. No win recorded                    | Lead progression records no Won Mission site for L, i.e. L has no Recorded win.                                 |
| 3. No Active or Deployed Mission site | No Mission site created by L is Active or Deployed.                                                             |
| 4. Faction not Defeated               | The Faction whose Archetype is the FactionArchetype named by the `faction` of L exists, and its Defeated is no. |

The Lead is available exactly when conditions 1 to 4 all hold. When it is not available, its **Blocking conditions** are
all of the conditions that do not hold; there may be several. No condition reads an Investigation: whether a Lead that
already has an Active Investigation can be investigated again is not part of Lead availability, and is owned by
[Investigations](investigations.md). The availability of a Lead is read, e.g., by the Player action that starts an
Investigation of the Lead, which Investigations owns; this document owns the Derived value and no Player action.
Availability has no timing of its own: it is true or false in every Committed state, and it can change only when a
Committed state changes one of the values the four conditions read.

By [Initial Factions](factions.md#initial-factions), the initial Campaign state contains exactly one Faction for each
FactionArchetype, and no Faction is created or removed afterwards. Condition 4 therefore names exactly one Faction for
every Lead that passes [Lead GDR validation](#lead-gdr-validation).

## What changes availability

The following table states, for each situation, what happens to the conditions and whether the Lead is available
afterwards. It assumes that the conditions the row does not mention keep the values they had. The table is
exhaustive for what changes a condition.

| Situation                                                                 | Conditions that change                                       | Result for L                                                                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| The [Completion effect](#completion-effect) of L creates a Mission site   | 3 stops holding.                                             | Not available while that Mission site is Active or Deployed.                                                                  |
| That Mission site becomes Lost                                            | 3 holds again.                                               | Available again, if the other conditions hold; Lead progression is unchanged. A new Investigation creates a new Mission site. |
| That Mission site becomes Expired                                         | 3 holds again.                                               | Available again, as for Lost.                                                                                                 |
| That Mission site becomes Won                                             | 3 holds again; 2 stops holding, because the win is recorded. | Never available again, for the rest of the Campaign, under [Recording a Won Mission site](#recording-a-won-mission-site).     |
| That Mission site becomes Cancelled, because the Faction of L is Defeated | 3 holds again; 4 has stopped holding.                        | Not available, because 4 does not hold. Cancellation does not make L available.                                               |
| A Lead X that L requires has its first win recorded                       | 1 can start holding, once every prerequisite of L holds.     | L can become available, if conditions 2 to 4 hold; it does so in the same Committed state in which the win is recorded.       |
| The Faction of L becomes Defeated                                         | 4 stops holding, for good.                                   | Not available for the rest of the Campaign, whatever the other conditions are.                                                |

A situation not listed changes none of the conditions. In particular, the outcome of a Mission site that was created by a
Lead other than L, a Response Mission site, and any change to an Investigation of L that creates no Mission site change
no condition of L.

**Consequences.** Together the rules make the following hold, and no rule needs to state them again:

- A Mission site that is Lost or Expired never blocks its Lead for ever: the Lead is available again and the Agency obtains
  a new Mission site from it by a new Investigation. A Mission site cannot be attempted twice, under
  [Mission site lifecycle](missions.md#mission-site-lifecycle).
- A Lead whose prerequisites hold and whose Faction is not Defeated stays available until a Mission site it created is
  Won, apart from the Advance turns in which a Mission site it created is Active or Deployed.

**Informative rationale:** A Lead holds at most one Recorded win. A second Recorded win would need a second Mission site
created by the Lead and Won, but no Mission site of the Lead is created while one is Active or Deployed if Investigations
starts an Investigation only for an available Lead and allows only one Active Investigation per Lead, which
[One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations owns; and once
a win is recorded, condition 2 never holds again.

# Completion effect

**Proposed rule:** When an Investigation of a Lead L completes, the effect named by the `on_completion` of L applies. The
completion itself, i.e. in which Advance turn an Investigation becomes Completed, is owned by
[Investigations](investigations.md); it happens in the Turn advancement step Investigation progress. The effect kind
`create_mission_site` has the following complete effect, applied once for that completion, in the same step:

1. It is the creating rule of an Initiative Mission site under
   [Mission site creation](missions.md#mission-site-creation) in Missions, and supplies to it exactly these three inputs:
   - the MissionSiteArchetype: the one whose identifier is the value of `create_mission_site`, which is of kind
     initiative under [Lead GDR validation](#lead-gdr-validation);
   - the origin Investigation: the Investigation of L that completed;
   - the target Faction: the Faction whose Archetype is the FactionArchetype named by the `faction` of L, which exists
     and is exactly one under [Initial Factions](factions.md#initial-factions) in Factions.
2. Missions then creates exactly one Initiative Mission site from these inputs. The initial values of the Mission site,
   its Enemies, and its expiry are owned by Missions.

The effect creates one Mission site per completion, never more and never none. It does not depend on the availability of
L at the moment of completion, and it does not depend on whether the Faction of L is Defeated: if the Faction became
Defeated before the completion, [Missions](missions.md) cancels the new Mission site at the end of the Turn advancement
step Mission resolution of the same Advance turn, under [Cancellation](missions.md#cancellation). The effect changes
nothing else: it records nothing in Lead progression, because a Mission site becomes recorded only when Won, and it spends
nothing.

The effect applies once for each completion of an Investigation of L; how often an Investigation completes is owned by
[Investigations](investigations.md). Another completion of an Investigation of the same Lead, e.g. after an earlier
Mission site of the Lead was Lost or Expired, applies the effect again and creates another Mission site.

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Every value is Player-visible from campaign creation, without a reveal condition, for every
Lead the Game build supplies, whether or not the Lead is available. Nothing in this document is hidden, because discovery
is out of scope.

| Value                                                                                                                                                                               | Player-visible information |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Every Lead of the Game build, with every property: `name`, `description`, `faction`, `difficulty`, `requires`, and `on_completion`                                                  | Yes                        |
| The MissionSiteArchetype that each Lead creates, including every property of that GDR, which [Missions](missions.md) states is Player-visible                                       | Yes                        |
| Lead progression: for each Lead, its set of Recorded wins                                                                                                                           | Yes                        |
| For each prerequisite of each Lead, whether it holds                                                                                                                                | Yes                        |
| For each Lead, whether it is available, and for each of the four conditions of [Lead availability](#lead-availability), whether it holds, so that the Blocking conditions are known | Yes                        |

The player can therefore see why a Lead is not available: every Blocking condition is reported, not only the first, and
for condition 1 each prerequisite is reported with whether it holds. Whether an Investigation of a Lead can be started
now, which also depends on whether the Lead already has an Active Investigation, is Player-visible under
[Investigations](investigations.md). **Unknown versus absent:** No value this document owns is unknown to the player, so
Player API never reports one as unknown. A Lead with an empty `requires` is reported with an empty list of
prerequisites, and condition 1 is reported as holding. A Lead with no Recorded win is reported with an empty set, never
as absent. The availability of a Lead of a Defeated Faction is reported as not available with condition 4 as a Blocking
condition.

# Edge cases and failure behavior

- **Lead with no prerequisites:** Condition 1 holds in every Committed state. The Lead is available at campaign creation
  unless conditions 2 to 4 fail ([Prerequisites](#prerequisites)).
- **Lead whose Faction does not exist in the Campaign:** This cannot occur for a Game build that passes
  [Lead GDR validation](#lead-gdr-validation), because every `faction` names a FactionArchetype and the initial Campaign
  state has one Faction for each FactionArchetype ([Lead availability](#lead-availability)). A Committed state in which it
  occurred would be an internal invariant violation, reported under
  [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract; condition 4
  would not hold, so the Lead would not be available.
- **Investigation completes in the same Advance turn in which the Faction is Defeated:** The Turn advancement step
  Investigation progress precedes Mission resolution, under [Turn Advancement](turn-advancement.md). The Faction is not yet Defeated in the earlier step, so the effect
  creates its Initiative Mission site, which is Active. In Mission resolution, a Won Mission site then defeats the
  Faction, and at the end of the step [Missions](missions.md) cancels every Active Mission site targeting that Faction,
  including the new one. The new Mission site is Cancelled, no record is made, and the Lead is not available afterwards
  because its Faction is Defeated ([Completion effect](#completion-effect), [Cancellation](missions.md#cancellation)).
- **Investigation completes when the Faction is already Defeated:** What becomes of an Investigation whose Lead's
  Faction becomes Defeated is owned by [Investigations](investigations.md). When it completes, the effect creates the Mission site, and [Missions](missions.md)
  cancels it in the same Advance turn; no Committed state shows it Active ([Completion effect](#completion-effect)).
- **Two Leads require the same Lead:** Each of them holds its prerequisite from the Committed state in which the required
  Lead's first win is recorded. Both can then become available together, can be investigated at the same time, and
  influence each other in no other way ([Prerequisites](#prerequisites)).
- **One win unlocks several Leads at once:** All Leads whose prerequisites all hold after the record become available in
  that same Committed state, if their other conditions hold ([What changes availability](#what-changes-availability)).
- **Prerequisite holds, Lead unavailable:** A Lead can have every prerequisite holding and still be unavailable, because
  its Faction is Defeated or because it has a Recorded win itself ([Lead availability](#lead-availability)).
- **Active or Abandoned Investigation:** Neither changes any condition of its Lead; nothing is recorded and no Mission
  site is created. Whether a second Investigation of a Lead may start while one is Active, and whether an Abandoned
  Investigation's progress is resumed, are owned by [Investigations](investigations.md)
  ([What changes availability](#what-changes-availability)).
- **Cancelled Mission site:** The Lead stays unavailable, because a Mission site is Cancelled only when its Faction is
  Defeated ([What changes availability](#what-changes-availability)).
- **Lost then Won:** A Lead whose Mission site was Lost and that is investigated again creates another Mission site. When
  that one is Won, the record is made for the Lead as for any other Won Mission site; the earlier Lost Mission site stays
  Lost and is not recorded ([Recording a Won Mission site](#recording-a-won-mission-site)).
- **Won Response Mission site:** It is recorded nowhere, because no Lead created it ([Lead progression](#lead-progression)).
- **Several Won Mission sites in one Advance turn:** Each is recorded against the Lead that created it; the result does
  not depend on the order ([Recording a Won Mission site](#recording-a-won-mission-site)).
- **Game build without a Lead:** It passes [Lead GDR validation](#lead-gdr-validation). No Lead exists to be available
  and no Initiative Mission site is ever created; Lead progression is empty.
- **Invalid GDRs:** A Game build that fails [Lead GDR validation](#lead-gdr-validation), e.g. with a cycle in its
  prerequisites, a `create_mission_site` of a MissionSiteArchetype of kind response, or two effects in `on_completion`, is
  defective and no Campaign is created from it.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/leads-and-progression/leads.yaml` and
`content/missions/mission_site_archetypes.yaml`, and the Campaign has the one Faction Red Dawn, from `red_dawn`, unless an
example states a test GDR. The values they read are:

| GDR                         | Values read                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `locate_red_dawn_member`    | `faction` `red_dawn`; `difficulty` 3; `requires` empty; `on_completion` `create_mission_site` `apprehend_member`                          |
| `locate_red_dawn_safehouse` | `faction` `red_dawn`; `difficulty` 6; `requires` `mission_won_from_lead` `locate_red_dawn_member`; `create_mission_site` `raid_safehouse` |
| `locate_red_dawn_hq`        | `faction` `red_dawn`; `difficulty` 10; `requires` `mission_won_from_lead` `locate_red_dawn_safehouse`; `create_mission_site` `raid_hq`    |
| `apprehend_member`          | `kind` initiative; `expires_in_turns` 5                                                                                                   |
| `raid_safehouse`            | `kind` initiative; `expires_in_turns` 8                                                                                                   |
| `raid_hq`                   | `kind` initiative; `expires_in_turns` 20; `on_win` `defeat_target_faction` true                                                           |
| `foil_sabotage`             | `kind` response                                                                                                                           |

In the examples, the three Leads are called by their identifiers, "member", "safehouse", and "hq" for
`locate_red_dawn_member`, `locate_red_dawn_safehouse`, and `locate_red_dawn_hq`. "The Advance turn ending turn t" is the
Advance turn committed during Turn t; the Campaign starts in Turn 1. Investigations decides when an Investigation
completes, and Combat decides a Battle outcome; the examples fix those results as inputs, named as their owners name them,
and rely on none of their formulas. Instance IDs i1, i2, ... name Investigations and s1, s2, ... name Mission sites.

## Campaign creation

This example exercises [Lead progression](#lead-progression), [Prerequisites](#prerequisites), and
[Lead availability](#lead-availability).

In the initial Campaign state, Lead progression has an empty set of Recorded wins for member, safehouse, and hq, and there
are no Investigations and no Mission sites. Red Dawn is not Defeated.

| Lead      | 1. Prerequisites hold                        | 2. No win recorded | 3. No Active or Deployed Mission site | 4. Faction not Defeated | Available | Blocking conditions |
| --------- | -------------------------------------------- | ------------------ | ------------------------------------- | ----------------------- | --------- | ------------------- |
| member    | Holds: `requires` is empty                   | Holds              | Holds                                 | Holds                   | Yes       | None                |
| safehouse | Does not hold: member has no Recorded win    | Holds              | Holds                                 | Holds                   | No        | 1                   |
| hq        | Does not hold: safehouse has no Recorded win | Holds              | Holds                                 | Holds                   | No        | 1                   |

A Player-visible query of the Leads returns all three, each with its properties, its availability, and the four
conditions, so the player sees that hq is blocked by condition 1 only and that its one prerequisite concerns safehouse,
not member ([Player-visible information](#player-visible-information)).

## The first Mission site Won

This example exercises [Completion effect](#completion-effect), [Recording a Won Mission site](#recording-a-won-mission-site),
[Prerequisites](#prerequisites), and [What changes availability](#what-changes-availability).

Initial state: the state above, in Turn 1. The player starts Investigation i1 of member, under
[Investigations](investigations.md).

- **During Turn 1, after the start:** i1 is Active. No condition of member reads Investigations, so member is still
  available with no Blocking condition; a second Investigation of member is nevertheless rejected while i1 is Active,
  under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations.
  Safehouse and hq are blocked by 1.
- **Advance turn ending turn 4:** Investigation i1 completes (input from Investigations). The effect `create_mission_site`
  supplies `apprehend_member`, i1, and Red Dawn to Missions, which creates exactly one Initiative Mission site s1, Active,
  with target Faction Red Dawn. Member is not available; its Blocking condition is 3, because s1 is Active. Lead
  progression is unchanged, and safehouse stays blocked by 1.
- **Turn 5:** The player deploys a team to s1, so s1 is Deployed. Member is still blocked by 3.
- **Advance turn ending turn 5:** The Battle outcome is Prevailed (input from Combat), so s1 becomes Won. In the same step,
  Lead progression records s1 in member's set, which is now {s1}. Safehouse's condition 1 now holds.

| Lead      | Available after the Advance turn ending turn 5 | Blocking conditions | Why                                                              |
| --------- | ---------------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| member    | No                                             | 2                   | It has a Recorded win. Condition 3 holds, because s1 is Won.     |
| safehouse | Yes                                            | None                | Its prerequisite holds: member has a Recorded win.               |
| hq        | No                                             | 1                   | Safehouse has no Recorded win; member's win does not satisfy it. |

Member never becomes available again, in any later Committed state.

## A Lost and an Expired Mission site, then a Won one

This example exercises [What changes availability](#what-changes-availability), [Completion effect](#completion-effect),
and [Recording a Won Mission site](#recording-a-won-mission-site).

Initial state: member's set is {s1}, in Turn 6, and safehouse is available (the state at the end of the previous example).
Investigations i2, i3, and i4 of safehouse are started in turns 6, 11, and 25 respectively.

- **Advance turn ending turn 9:** i2 completes; a Mission site s2 from `raid_safehouse` is created, Active, with 8 Advance
  turns until expiry. Safehouse is blocked by 3. In Turn 10 a team is deployed, and in the Advance turn ending turn 10 the
  Battle outcome is Retreated, so s2 is Lost. Nothing is recorded: safehouse's set is empty. Safehouse is available
  again, because conditions 1 to 4 all hold; hq stays blocked by 1.
- **Advance turn ending turn 16:** i3 completes (started in Turn 11); a new Mission site s3 from `raid_safehouse` is
  created, Active. Safehouse is blocked by 3. No team is deployed to s3. s3 does not count down in the Advance turn that
  created it, so it is Expired in the Advance turn ending turn 24. Safehouse is available again after that Advance turn.
- **Advance turn ending turn 28:** i4 completes; Mission site s4 from `raid_safehouse` is created, Active. In Turn 29 a
  team is deployed, and in the Advance turn ending turn 29 the Battle outcome is Prevailed, so s4 is Won. Lead progression
  records s4 in safehouse's set, which becomes {s4}. s2 and s3 are not recorded. Safehouse is never available again; hq's
  condition 1 now holds, so hq is available.

## The last Lead and the defeat of Red Dawn

This example exercises [Recording a Won Mission site](#recording-a-won-mission-site),
[Lead availability](#lead-availability), and [Prerequisites](#prerequisites).

Initial state: safehouse's set is {s4}, member's set is {s1}, hq is available, in Turn 30. Investigation i5 of hq is
started in Turn 30 and completes in the Advance turn ending turn 40; Mission site s5 from `raid_hq` is created, Active. In
Turn 41 a team is deployed, and in the Advance turn ending turn 41 the Battle outcome is Prevailed. s5 becomes Won, and
Lead progression records s5 in hq's set; Missions applies the `on_win` of `raid_hq`, which defeats Red Dawn.

| Lead      | Available after the Advance turn ending turn 41 | Blocking conditions |
| --------- | ----------------------------------------------- | ------------------- |
| member    | No                                              | 2, 4                |
| safehouse | No                                              | 2, 4                |
| hq        | No                                              | 2, 4                |

Every prerequisite still holds, because the three wins are permanent. Whether the Campaign has ended is owned by
[Panic and Endings](panic-and-endings.md).

## An Abandoned Investigation

This example exercises [What changes availability](#what-changes-availability) and
[Lead availability](#lead-availability).

Initial state: the initial Campaign state, in Turn 1. The player starts Investigation i1 of member in Turn 1, and in
Turn 2 orders every Agent of its Current team elsewhere, so that i1 is Abandoned in the same Player action, under
[Investigations](investigations.md).

Result: member is available with no Blocking condition in every Committed state of this example, before and after the
order, because no condition reads Investigations; no Mission site exists and Lead progression is unchanged. While i1 is
Active, a second Investigation of member is rejected under
[One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations; after i1 is
Abandoned, starting another Investigation i2 of member succeeds and creates a new Campaign instance, whose progress, under
Investigations, does not resume the progress of i1.

## A Mission site Cancelled by the defeat of its Faction

This example exercises [Completion effect](#completion-effect), [What changes availability](#what-changes-availability),
and [Edge cases and failure behavior](#edge-cases-and-failure-behavior). It uses a test Lead `test_lead` with `faction`
`red_dawn`, `difficulty` 1, `requires` empty, and `on_completion` `create_mission_site` `apprehend_member`, supplied
alongside the Bootstrap GDRs.

Initial state: Turn 60. A Mission site s6 from `raid_hq` is Deployed, created by an Investigation i6 of hq that completed
earlier; `test_lead` has an Active Investigation i7. The following happens in the Advance turn ending turn 60.

1. **Investigation progress:** i7 completes (input from Investigations). The effect creates Mission site s7 from
   `apprehend_member`, Active, with target Faction Red Dawn, which is not yet Defeated.
2. **Mission resolution:** The Battle of s6 has the outcome Prevailed, so s6 becomes Won. Lead progression records s6 in
   hq's set, and Red Dawn becomes Defeated. After every Battle of the step, s7 is Active and its target Faction is Defeated,
   so s7 becomes Cancelled, under [Cancellation](missions.md#cancellation).

Result: `test_lead` has no Recorded win and no Mission site that is Active or Deployed. It is not available, because
condition 4 does not hold; its only Blocking condition is 4. No Committed state shows s7 Active
after that Advance turn.

## Two Leads requiring the same Lead

This example exercises [Prerequisites](#prerequisites) and [What changes availability](#what-changes-availability). It uses
two test Leads `test_lead_a` and `test_lead_b`, each with `faction` `red_dawn`, `difficulty` 1, `requires`
`mission_won_from_lead` `locate_red_dawn_member`, and `on_completion` `create_mission_site` `apprehend_member`.

Initial state: the initial Campaign state. Both test Leads are blocked by condition 1 only. When the Advance turn in which
s1 from member becomes Won ends, Lead progression records s1 in member's set, and both prerequisites hold in that same
Committed state. Both test Leads, and safehouse, are available at once and can have Active Investigations at the same
time. An Investigation of `test_lead_a` that is Active does not change any condition of `test_lead_b`.

## GDR validation

This example exercises [Lead GDR validation](#lead-gdr-validation). Each row independently changes the Bootstrap GDRs;
the result is that the Game build is defective and no Campaign is created from it.

| Change                                                                                          | Rule violated                   |
| ----------------------------------------------------------------------------------------------- | ------------------------------- |
| member's `requires` gains `mission_won_from_lead` `locate_red_dawn_hq`                          | Prerequisites form no cycle     |
| safehouse's `requires` names `locate_red_dawn_safehouse`                                        | Prerequisites form no cycle     |
| hq's `requires` names `no_such_lead`                                                            | Prerequisite references resolve |
| hq's `requires` names `locate_red_dawn_safehouse` twice                                         | Prerequisite references resolve |
| member's `faction` is `apprehend_member`, which is not a FactionArchetype                       | Faction resolves                |
| member's `difficulty` is 0                                                                      | Difficulty is valid             |
| member's `difficulty` is 2.5                                                                    | Difficulty is valid             |
| member's `create_mission_site` is `foil_sabotage`, a MissionSiteArchetype of kind response      | Completion effect is valid      |
| member's `on_completion` holds `create_mission_site` and a second effect                        | Completion effect is valid      |
| member's `on_completion` is `create_mission` `apprehend_member`, an effect kind that is unknown | Completion effect is valid      |
| safehouse's `requires` entry is `mission_lost_from_lead` `locate_red_dawn_member`               | Prerequisite kinds are known    |
| member has a property `repeatable`                                                              | Known properties                |

The unchanged Bootstrap GDRs satisfy every rule: the prerequisite relation leads from hq to safehouse to member and ends
there; every `faction` is `red_dawn`; the difficulties 3, 6, and 10 are whole numbers of at least 1; and each Lead creates
a MissionSiteArchetype of kind initiative.

## Player-visible information

This example exercises [Player-visible information](#player-visible-information).

In the Committed state after the Advance turn ending turn 5 in
[The first Mission site Won](#the-first-mission-site-won), a Player API query of the Leads returns, for hq: its name,
description, `faction` `red_dawn`, `difficulty` 10, `requires` as a list of one prerequisite, `mission_won_from_lead`
`locate_red_dawn_safehouse`, with the state that it does not hold; `on_completion` `create_mission_site` `raid_hq`
together with every property of `raid_hq`; an empty set of Recorded wins; availability No; and the four conditions, with
condition 1 not holding and conditions 2 to 4 holding. It returns for member a set of Recorded wins {s1}, availability No,
and condition 2 as the only condition not holding. The result is the same
for the Session controller and an Autopilot AI, and nothing is reported as unknown.
