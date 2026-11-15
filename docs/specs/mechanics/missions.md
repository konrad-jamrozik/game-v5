# Missions

| Metadata    | Value                                                                                                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | MISSION                                                                                                                                                                                             |
| Family      | Mechanics                                                                                                                                                                                           |
| Status      | Draft                                                                                                                                                                                               |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                                                         |
| Owns        | What a Mission site and a Mission have, Mission site creation, the Mission site and Mission lifecycles, the deployAgents action, Mission resolution, expiry, and the consequences for the Campaign. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                                                      |

# Overview

Missions are where the Agency confronts a Faction directly. Some it seeks out: an Initiative
[Mission site](domain-model.md#glossary) comes from a completed Investigation. Others are forced on it: a Response
Mission site comes from a Faction operation occurrence, and ignoring one has a price.

A Mission site is an opportunity that does not wait. It stays Active for a number of Advance turns, and the player may
deploy one team of Agents to it, only once, which immediately creates its one [Mission](domain-model.md#glossary). The
Mission's Combat is fought in the next Advance turn: the Mission is Won when the Combat outcome is Prevailed, and Lost
otherwise. What follows depends on the kind of Mission site. A Won Initiative Mission rewards the Agency and can defeat
its target Faction. A Lost Response Mission, like an Expired Response Mission site, raises Panic and changes funding.

Missions refines [Factions](./factions.md): Factions says when a Faction operation occurs, and Missions says how the
Agency can answer it.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Combat](./combat.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Economy and Upgrades](./economy-and-upgrades.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Factions](./factions.md)
- Uses [Game Data Records](../foundation/game-data-records.md)
- Uses [Numbers](../foundation/numbers.md)
- Uses [Panic and Endings](./panic-and-endings.md)
- Refines [Domain Model](domain-model.md)
- Refines [Factions](./factions.md)
- Used by [Agent Recovery](./agent-recovery.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)
- Used by [Investigations](./investigations.md)
- Used by [Leads and Progression](./leads-and-progression.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Mission GDRs

A Mission site has a MissionSiteArchetype and a Mission a MissionArchetype as its Archetype; both are Game Data Record
(GDR) Types. Two properties of the FactionOperationLevel Type, `on_win` and `on_ignored_or_lost`, give the consequences
of a Response Mission site and its Mission. The GDRs a Game build supplies, and their values, are listed by
[Bootstrap GDRs](../content/bootstrap-gdrs.md) and the YAML files it names.

## MissionSiteArchetype

A MissionSiteArchetype is the Archetype of a Mission site. It describes the site: its kind, its expiry, its Enemies, and,
for an Initiative Mission, its rewards. No MissionSiteArchetype references a Faction; the target Faction of a Mission
site comes from its origin, under [Mission site creation](#mission-site-creation). The following property table is
exhaustive apart from the `id` and `type` that every GDR has.

| Property           | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Read by                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | The display name of the kind of Mission site.                                                                                                                                                                                                                                                                                                                                                                                                                                          | [Player-visible information](#player-visible-information)                                                                              |
| `kind`             | `initiative` for an Initiative Mission site, or `response` for a Response Mission site.                                                                                                                                                                                                                                                                                                                                                                                                | [Mission site creation](#mission-site-creation); [MissionSiteArchetype selection](#missionsitearchetype-selection)                     |
| `expires_in_turns` | The number of Advance turns a newly created Mission site stays Active before it is Expired, if no team is deployed to it.                                                                                                                                                                                                                                                                                                                                                              | [Mission site creation](#mission-site-creation)                                                                                        |
| `enemies`          | An ordered map from the identifier of an EnemyArchetype to a count: which Enemies are present at the Mission site, and how many of each. The order of its keys, as authored, is part of the GDR; [GDR authoring format](../foundation/game-data-records.md#gdr-authoring-format) in Game Data Records guarantees that this order is preserved.                                                                                                                                         | [Mission site creation](#mission-site-creation)                                                                                        |
| `on_win`           | Only for the `initiative` kind, and optional: what a Won Mission gives. It may hold `money`, the money the Agency gains; `funding`, the funding change; `panic_reduction_pct`, the Panic reduction, a whole number of Panic percentage points subtracted from Panic, never a percent of the current Panic; and `defeat_target_faction`, whether a win makes the target Faction Defeated. A missing `on_win` or a missing property of it means 0, or false for `defeat_target_faction`. | [Consequences](#consequences)                                                                                                          |
| `operation_level`  | Only for the `response` kind, and required: the `level` of the Faction operation level the MissionSiteArchetype serves.                                                                                                                                                                                                                                                                                                                                                                | [MissionSiteArchetype selection](#missionsitearchetype-selection); [MissionSiteArchetype validation](#missionsitearchetype-validation) |

Of an [EnemyArchetype](combat.md#enemyarchetype), only its identifier is read, through `enemies`.

## MissionArchetype

A MissionArchetype is the Archetype of every Mission. The following property table is exhaustive apart from the `id` and
`type` that every GDR has.

| Property | Meaning                                  | Read by                                                   |
| -------- | ---------------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the kind of Mission. | [Player-visible information](#player-visible-information) |

No rule of game behavior reads a MissionArchetype property: every Mission behaves the same, and what distinguishes one
Mission from another is its Mission site and its team.

## FactionOperationLevel properties used by Missions

Two properties of [FactionOperationLevel](factions.md#factionoperationlevel) apply to a Response Mission site, and to its
Mission, whose Faction operation level is that FactionOperationLevel, under [Consequences](#consequences).

| Property             | Meaning                                                                                                                                                                                                                                                                                                                      | Read by                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `on_win`             | What the Agency gains when such a Response Mission is Won: exactly the two properties `money`, the money the Agency gains, and `funding`, the funding change.                                                                                                                                                                | [Consequences](#consequences) |
| `on_ignored_or_lost` | What changes when such a Response Mission is Lost or such a Response Mission site is Expired: exactly the two properties `panic_increase_pct`, the Panic increase, a whole number of Panic percentage points added to Panic, never a percent of the current Panic, and `funding`, the funding change, which may be negative. | [Consequences](#consequences) |

## MissionSiteArchetype validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDR Type
MissionSiteArchetype and the FactionOperationLevel properties `on_win` and `on_ignored_or_lost`, and it adds to
[Faction GDR validation](factions.md#faction-gdr-validation) in Factions and
[Combat GDR validation](combat.md#combat-gdr-validation) in Combat. A Game build whose GDRs violate one of these rules
is defective: no Campaign is created from it, and the violation is reported as a data defect, never repaired into
different gameplay, under [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in
Engine Contract.

1. **Known properties:** Each MissionSiteArchetype has `name`, `kind`, `expires_in_turns`, and `enemies`, and no
   property other than those listed in its table above, apart from `id` and `type`. Its `name` is non-empty text.
2. **Kind is valid:** `kind` is exactly `initiative` or `response`.
3. **Expiry is valid:** `expires_in_turns` is a whole number of at least 1.
4. **Enemies are valid:** `enemies` has at least one key. Each key is the identifier of an EnemyArchetype the Game build
   supplies, and each count is a whole number of at least 1.
5. **Rewards only for Initiative:** A MissionSiteArchetype whose `kind` is `response` has no `on_win`. When a
   MissionSiteArchetype whose `kind` is `initiative` has `on_win`, it holds no property other than `money`, `funding`,
   `panic_reduction_pct`, and `defeat_target_faction`; each of `money`, `funding`, and `panic_reduction_pct` that is
   present is a whole number of at least 0, and `defeat_target_faction`, when present, is true or false.
6. **Operation level only for Response:** A MissionSiteArchetype whose `kind` is `response` has `operation_level`, and
   it equals the `level` of a FactionOperationLevel the Game build supplies. A MissionSiteArchetype whose `kind` is
   `initiative` has no `operation_level`.
7. **Operation level consequences are valid:** Every FactionOperationLevel's `on_win` has exactly the properties `money`
   and `funding`, each a whole number of at least 0. Its `on_ignored_or_lost` has exactly the properties
   `panic_increase_pct`, a whole number of at least 0, and `funding`, a whole number that may be negative.
8. **Every Faction operation level can be served:** For every key of every FactionActivityLevel's
   `operation_level_weights`, under [FactionActivityLevel](factions.md#factionactivitylevel) in Factions, the Game build
   supplies at least one MissionSiteArchetype whose `kind` is `response` and whose `operation_level` equals that key.

These rules guarantee that every Mission site has at least one Enemy and an expiry of at least one Advance turn, that
every Enemy it names can be created, that every consequence under [Consequences](#consequences) is a whole number, and
that [MissionSiteArchetype selection](#missionsitearchetype-selection) has at least one possible value for every
Faction operation occurrence. That every MissionSiteArchetype the creating rule of an Initiative Mission site supplies
has the `kind` `initiative` is validated under [Lead GDR validation](leads-and-progression.md#lead-gdr-validation).

## MissionArchetype validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the
MissionArchetype Type. A Game build whose GDRs violate one of these rules is defective, under the same handling as
[MissionSiteArchetype validation](#missionsitearchetype-validation).

1. **One MissionArchetype:** The Game build supplies exactly one MissionArchetype. Every Mission has it as its
   Archetype, so no rule selects among MissionArchetypes.
2. **Known properties:** The MissionArchetype has `name`, and no property other than `name`, `id`, and `type`. Its
   `name` is non-empty text.

# Mission site

A Mission site is the Campaign instance that holds one opportunity to confront a Faction: whose Enemies are present,
where it came from, and how long it stays Active.

## Mission site properties

**Proposed rule:** A Mission site is a Campaign instance whose Archetype is a MissionSiteArchetype. Its Archetype
reference is set when it is created and never changes. Its Constants and State have exactly the following properties.
This table is exhaustive.

| Property           | Part      | Value                                                                                                                                                                                                                                                                                               | Classification and range                                                                                                                                                                                                      |
| ------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kind               | Constants | Initiative or Response.                                                                                                                                                                                                                                                                             | Authoritative value. Equals the MissionSiteArchetype's `kind`.                                                                                                                                                                |
| Origin             | Constants | For an Initiative Mission site, an Immutable reference to the Investigation whose completion created it. For a Response Mission site, its Faction operation occurrence: an Immutable reference to the initiating Faction and an Immutable reference to the FactionOperationLevel of the occurrence. | Authoritative value, under [Mission site kind and provenance](#mission-site-kind-and-provenance).                                                                                                                             |
| Target Faction     | Constants | An Immutable reference to the Faction whose Enemies are present at the Mission site.                                                                                                                                                                                                                | Authoritative value. Always exactly one Faction of the Campaign.                                                                                                                                                              |
| Turn created       | Constants | The turn number of the Turn whose Advance turn created the Mission site.                                                                                                                                                                                                                            | Authoritative value. A whole number of at least 1.                                                                                                                                                                            |
| Lifecycle          | State     | Active, Attempted, Expired, or Cancelled, under [Mission site lifecycle](#mission-site-lifecycle).                                                                                                                                                                                                  | Authoritative value.                                                                                                                                                                                                          |
| Turns until expiry | State     | The number of Advance turns after which an Active Mission site is Expired.                                                                                                                                                                                                                          | Authoritative value. A whole number, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities), from 0 to `expires_in_turns`. Changes only under [Mission site expiration](#mission-site-expiration). |
| Enemies            | State     | The ordered list of the Enemies present at the Mission site, in their creation order.                                                                                                                                                                                                               | Authoritative value. No rule changes the list after creation; each Enemy has its own values under [Combat](combat.md).                                                                                                        |

A Mission site also has Derived values, which are never stored: its Mission, i.e. the Mission whose Mission site
reference identifies it, when one exists, under [Mission at a Mission site](#mission-at-a-mission-site);
and its rewards and penalties, i.e. the amounts the [Consequences](#consequences) table would apply when its Mission is
Won and when its Mission is Lost or it is Expired, read from its
MissionSiteArchetype and, for a Response Mission site, from the FactionOperationLevel of its origin; and the Combat
rating of its Enemies, under [Combat rating](combat.md#combat-rating) in Combat. A Mission site has no Turn series.

**Invariants:** In every Committed state, every Mission site satisfies all of the following. A Committed state that
violates one is an internal invariant violation, reported under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. Turns until expiry is 0 exactly when the lifecycle state is Expired, and from 1 to `expires_in_turns` otherwise.
2. A Mission whose Mission site reference identifies this Mission site exists exactly when the lifecycle state is
   Attempted, and at most one such Mission exists.
3. The Enemies list has one Enemy for each unit of each count of the MissionSiteArchetype's `enemies`, and each of those
   Enemies references this Mission site.

**Retention:** A Mission site keeps every property above for the whole Campaign, whatever its lifecycle state, so that
every reference to it resolves, e.g. from an Enemy or a Mission. A Mission site in a final state no longer participates
in current gameplay and is retained in World history with its final values, under [Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation) in Campaign
State. No Mission site is ever removed.

## Mission site kind and provenance

A Mission site is either an Initiative Mission site or a Response Mission site; its kind is fixed when it is created.
An Initiative Mission site retains its origin: the Investigation whose completion created it, and through that
Investigation the Lead it investigated. A Response Mission site retains its Faction operation occurrence origin, which
identifies the initiating Faction. Both hold under [How concepts relate](domain-model.md#how-concepts-relate) in Domain
Model.

Two Response Mission sites originating from the same Faction are distinct Campaign instances. Target Faction and
initiating Faction are explicit references, never inferred from a Mission site's name.

A Mission has the kind of its Mission site: a Mission at an Initiative Mission site is an Initiative Mission, and a
Mission at a Response Mission site is a Response Mission. The kind of a Mission is a Derived value read through its
Mission site reference; a Mission stores no kind of its own.

## Initial Mission sites

**Proposed rule:** The initial Campaign state contains no Mission site, and therefore no Mission and no Enemy, as
[Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model requires. No Campaign configuration value
adds a Mission site to it. Every Mission site comes into existence during an Advance turn, under
[Mission site creation](#mission-site-creation).

# Mission site creation

**Proposed rule:** A Mission site is created on exactly two occasions, and this list is exhaustive:

1. **From a completed Investigation:** in the Turn advancement step Investigation progress, when a creating rule
   supplies the following three inputs, and this list is exhaustive: a MissionSiteArchetype whose `kind` is
   `initiative`; the origin Investigation, i.e. the Investigation whose completion created the Mission site; and the
   target Faction, a Faction of the Campaign. The Mission site created is an Initiative Mission site. Nothing else
   about the creating rule is read. The creating rule is the completion effect under
   [Leads and Progression](leads-and-progression.md), and the completion that triggers it is under
   [Investigations](investigations.md).
2. **From a Faction operation occurrence:** in the Turn advancement step Faction activity, under item 2 of
   [Faction operation occurrence generation](factions.md#faction-operation-occurrence-generation) in Factions, which
   supplies the initiating Faction, the Faction operation level, and the turn number. The MissionSiteArchetype is the
   value of the occurrence's [MissionSiteArchetype selection](#missionsitearchetype-selection) outcome. The Mission site
   created is a Response Mission site.

Each new Mission site has a fresh Instance ID under
[Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following
initial values, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in
Campaign State. This table is exhaustive.

| Value               | Initial value                                                                                                                                                                                     | Source                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archetype reference | The MissionSiteArchetype of the occasion.                                                                                                                                                         | From a completed Investigation: the MissionSiteArchetype the creating rule supplies. From a Faction operation occurrence: the value of its MissionSiteArchetype selection outcome. |
| Kind                | Initiative from a completed Investigation; Response from a Faction operation occurrence. It always equals the MissionSiteArchetype's `kind`.                                                      | The occasion; the equality holds because the creating rule supplies a MissionSiteArchetype of kind `initiative` and the selection outcome has only values of kind `response`.      |
| Origin              | From a completed Investigation: the origin Investigation the creating rule supplies. From a Faction operation occurrence: the initiating Faction and the FactionOperationLevel of the occurrence. | The occasion.                                                                                                                                                                      |
| Target Faction      | From a completed Investigation: the target Faction the creating rule supplies. From a Faction operation occurrence: the initiating Faction.                                                       | The creating rule; or the occurrence.                                                                                                                                              |
| Turn created        | The turn number of the Turn whose Advance turn creates the Mission site.                                                                                                                          | Campaign state; for a Faction operation occurrence, also the turn number Factions supplies, which is the same.                                                                     |
| Lifecycle           | Active.                                                                                                                                                                                           | This rule.                                                                                                                                                                         |
| Turns until expiry  | The MissionSiteArchetype's `expires_in_turns`.                                                                                                                                                    | `expires_in_turns` of the MissionSiteArchetype.                                                                                                                                    |
| Enemies             | Newly created Enemies, under [Enemy creation](#enemy-creation).                                                                                                                                   | `enemies` of the MissionSiteArchetype.                                                                                                                                             |

Creating a Mission site changes nothing else; e.g., it creates no Mission, spends no money, changes no Panic, and
changes no Agent. A Mission
site created during an Advance turn does not count down in that same Advance turn, under
[Mission site expiration](#mission-site-expiration), whichever of the two occasions creates it. Several Mission sites
may be created in one Advance turn, each a distinct Campaign instance, including several with the same
MissionSiteArchetype.

## MissionSiteArchetype selection

**Proposed rule:** Each Faction operation occurrence has exactly one **MissionSiteArchetype selection** outcome, a
named random outcome. Its possible values are the MissionSiteArchetypes the Game build supplies
whose `kind` is `response` and whose `operation_level` equals the `level` of the occurrence's Faction operation level;
let `n` be their number, which is at least 1 under rule 8 of
[MissionSiteArchetype validation](#missionsitearchetype-validation). Its distribution is uniform: each of the `n`
MissionSiteArchetypes has Probability `1 / n`, exact and never rounded, under
[Probabilities](../foundation/numbers.md#probabilities) in Numbers. When `n` is 1, the outcome is that
MissionSiteArchetype with Probability 1 and is still a distinct named random outcome.

The outcome depends on the occurrence's Faction operation level, i.e. on the value of the Faction's Operation level
outcome under [Operation level](factions.md#operation-level) in Factions, and on the MissionSiteArchetypes the Game build
supplies; given that Faction operation level, it depends on no other outcome, on no Mission site, and on no earlier
selection, so consecutive occurrences may select the same MissionSiteArchetype. It is Player-visible once it has a value,
as the Response Mission site's MissionSiteArchetype under [Player-visible information](#player-visible-information).

## Enemy creation

**Proposed rule:** The Enemies of a new Mission site are created together with it, each under
[Enemy creation](combat.md#enemy-creation) in Combat, which takes from this rule the EnemyArchetype and the Mission site
being created. They are created in this order, which is the order of the Mission site's Enemies list: the keys of the
MissionSiteArchetype's `enemies` in their authored order, and for each key as many Enemies of that EnemyArchetype as its
count, one after another. E.g., a MissionSiteArchetype whose `enemies` is `initiate: 8` followed by `soldier: 1` has the
Enemies list of eight Enemies of `initiate` and then one of `soldier`.

# Mission site lifecycle

**Proposed rule:** A Mission site is in exactly one of the lifecycle states Active, Attempted, Expired, and Cancelled.
The set is exhaustive. Every Mission site is Active when it is created. The transition table is:

| Source state | Target state | Trigger                                                                                                    | Condition                                                                    | Effects                                                                                                                                                                      |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active       | Attempted    | The `deployAgents` Player action names the Mission site.                                                   | Every precondition under [Deploying Agents](#deploying-agents) holds.        | A new Mission at the Mission site comes into existence, Deployed, with its Current team, and those Agents are Deployed at once, under [Deploying Agents](#deploying-agents). |
| Active       | Expired      | Advance turn, in the Turn advancement step Mission site expiration: its Turns until expiry reaches 0.      | The Mission site already existed in the Turn-end state of this Advance turn. | The Expired consequences apply, under [Mission site expiration](#mission-site-expiration) and [Consequences](#consequences). It never has a Mission.                         |
| Active       | Cancelled    | Advance turn, at the end of the Turn advancement step Mission resolution, after every Combat of that step. | Its target Faction is Defeated.                                              | None, under [Consequences](#consequences). It never has a Mission.                                                                                                           |

Every transition not listed is impossible; e.g., an Attempted Mission site is never Cancelled or Expired, and nothing
leaves Attempted, Expired, or Cancelled. Attempted, Expired, and Cancelled are final. A Mission site cannot be attempted
twice: once it is Attempted, no Player action deploys Agents to it again. A second Mission site from the same Lead is a
new Mission site, under [Leads and Progression](leads-and-progression.md). An Attempted Mission site has no consequence of
its own; the consequences of the attempt are those of its Mission's final state, under [Consequences](#consequences).

# Mission

A Mission is the Campaign instance that holds one attempt at a Mission site: the team the player sent and what became of
it.

## Mission properties

**Proposed rule:** A Mission is a Campaign instance whose Archetype is the MissionArchetype. Its Archetype reference is
set when it is created and never changes. It is created only by the `deployAgents` Player action, under
[Deploying Agents](#deploying-agents), and always at a Mission site, under
[Mission at a Mission site](#mission-at-a-mission-site). Its Constants and State have
exactly the following properties. This table is exhaustive.

| Property      | Part      | Value                                                                                                                         | Classification and range                                                                                                                       |
| ------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Mission site  | Constants | An Immutable reference to the Mission site at which the Mission takes place.                                                  | Authoritative value. Always exactly one Mission site of the Campaign.                                                                          |
| Turn deployed | Constants | The turn number of the Turn in which the `deployAgents` Player action created the Mission.                                    | Authoritative value. A whole number of at least 1.                                                                                             |
| Team sent     | Constants | The ordered list of Immutable references to the Agents of the `agents` parameter of `deployAgents`, in that order.            | Authoritative value. Non-empty. No rule changes it after creation.                                                                             |
| Lifecycle     | State     | Deployed, Won, or Lost, under [Mission lifecycle](#mission-lifecycle).                                                        | Authoritative value.                                                                                                                           |
| Current team  | State     | The ordered list of the Agents deployed on the Mission, in the order of Team sent, while they are Deployed; afterwards empty. | Authoritative value. Agrees with Current assignments under [Current versus historical teams](domain-model.md#current-versus-historical-teams). |

A Mission also has Derived values, which are never stored: its kind, which is the kind of its Mission site, so that it is
an Initiative Mission or a Response Mission under [Mission site kind and provenance](#mission-site-kind-and-provenance);
and its rewards and penalties, which are those of its Mission site.

**Invariants:** In every Committed state, every Mission satisfies all of the following. A Committed state that violates
one is an internal invariant violation, reported under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. Its Mission site is Attempted, and no other Mission references that Mission site.
2. Its Current team equals its Team sent exactly when the lifecycle state is Deployed, and is empty when it is Won or
   Lost.

**Retention:** A Mission keeps every property above for the whole Campaign, whatever its lifecycle state, so that every
reference to it resolves, e.g. from a Participation history or Lead progression. A Won or Lost Mission no longer
participates in current gameplay and is retained in World history with its final values, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation) in Campaign State. No
Mission is ever removed.

The Agents who took part in a Mission remain recorded after its Current team is empty: in its Team sent and in each
Agent's Participation history, under
[Participation history records](agents-spec.md#participation-history-records) in Agents.

## Mission at a Mission site

A Mission takes place at exactly one Mission site, and a Mission site has at most one Mission, under
[How concepts relate](domain-model.md#how-concepts-relate) in Domain Model, because the Agency can deploy only one team
of Agents to a Mission site, once. No Mission exists without a Mission site, and a Mission site that no team is ever
deployed to never has a Mission. Both are retained for the whole Campaign, so the Mission's reference to its Mission
site always resolves.

A Mission is its own Campaign instance, not a part of its Mission site's State, because it carries facts the Mission
site does not have, e.g. the Turn it was deployed in, the team sent, its own lifecycle from deployment to its outcome;
and because Current assignments, Participation history, and Lead progression reference it
directly. The Combat report of its Combat, by contrast, is not part of the Mission: it is part of the Turn report of the
Advance turn that fought the Combat, under [Combat report](combat.md#combat-report) in Combat.

The Mission site and its Mission have separate lifecycles, under [Mission site lifecycle](#mission-site-lifecycle) and
[Mission lifecycle](#mission-lifecycle). The Mission site's lifecycle describes the opportunity, e.g. whether a team
can still be deployed to it or whether it expired unattended; the Mission's lifecycle describes the attempt, e.g.
whether its Combat is still to be fought and whether it was Won or Lost.

# Mission lifecycle

**Proposed rule:** A Mission is in exactly one of the lifecycle states Deployed, Won, and Lost. The set is exhaustive.
Every Mission is Deployed when it is created, under [Deploying Agents](#deploying-agents). The transition table is:

| Source state | Target state | Trigger                                                                                        | Condition                                 | Effects                                                                                                                                                                                   |
| ------------ | ------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deployed     | Won          | Advance turn, in the Turn advancement step Mission resolution: the Mission's Combat is fought. | The Combat outcome is Prevailed.          | Its Combat report joins the Turn report; its Agents return or are Killed; the Won consequences apply, under [Mission resolution](#mission-resolution) and [Consequences](#consequences).  |
| Deployed     | Lost         | Advance turn, in the Turn advancement step Mission resolution: the Mission's Combat is fought. | The Combat outcome is Retreated or Wiped. | Its Combat report joins the Turn report; its Agents return or are Killed; the Lost consequences apply, under [Mission resolution](#mission-resolution) and [Consequences](#consequences). |

Every transition not listed is impossible; e.g., nothing leaves Won or Lost. Won and Lost are final, and a Lost Mission
stays Lost.

"Deployed" names both the lifecycle state of a Mission that has a non-empty Current team and the Current assignment of
each Agent in that Current team; the two always hold together, under [Orders and Task phase](agents-spec.md#orders-and-task-phase)
in Agents. A Mission is Deployed from the `deployAgents` Player action that creates it until the next Advance turn,
because every Deployed Mission is resolved in the first Mission resolution step after the action.

# Deploying Agents

**Proposed rule:** The Player action `player.actions.deployAgents(missionSite, agents)` deploys a team of Agents to a
Mission site.

| Parameter     | Meaning                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `missionSite` | An Instance ID, meant to identify one Mission site of the Campaign.                                                                                                                           |
| `agents`      | A list of Instance IDs, each meant to identify one Agent of the Campaign. Its order becomes the order of the Mission's Current team and so the fixed order of the Agents' side of the Combat. |

Preconditions: the action is rejected, as a whole, when any of the following holds:

1. `missionSite` identifies no Mission site of the Campaign.
2. The Mission site is not Active, e.g. because it is already Attempted, or is Expired or Cancelled.
3. `agents` is empty.
4. `agents` contains the same Instance ID more than once.
5. An Instance ID in `agents` identifies no Agent of the Campaign.
6. An Agent in `agents` cannot be ordered, under [Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered)
   in Agents.
7. The Agents would exceed the Transport cap:

   ```text
   D + number of Agents in agents  >  Transport cap
   ```

   where D is the number of Serving Agents whose Current assignment is Deployed, over every Mission together, in
   the Committed state in which the action is requested, and the Transport cap is computed under
   [Agency caps](economy-and-upgrades.md#agency-caps) in Economy and Upgrades. Every Agent in `agents` adds one, because
   precondition 6 already rejects an Agent that is Deployed. The action is accepted when the sum is equal to or less than
   the Transport cap. No rounding occurs; every term is a whole number of Agents.

The preconditions on every Player action, e.g. that the Campaign has no Campaign ending, also apply, under
[Panic and Endings](panic-and-endings.md) and [Engine Contract](../foundation/engine-contract.md).

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at
least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation
is the Implementer's choice. A rejected action changes nothing, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract. Because every
value of a Mission site and of a Mission is Player-visible information, under
[Player-visible information](#player-visible-information), the error reveals nothing hidden.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same
Turn:

- The Mission site's lifecycle state becomes Attempted.
- A new Mission comes into existence, with a fresh Instance ID under
  [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and with these
  initial values, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in
  Campaign State: the MissionArchetype as its Archetype reference; the Mission site as its Mission site; the current
  turn number as its Turn deployed; the Agents of `agents`, in that order, as its Team sent and as its Current team;
  and lifecycle state Deployed.
- For every Agent in `agents`: its Current assignment becomes Deployed with a Mutable reference to the new Mission, and
  its Task phase is At assignment at once, without transit, under [Transit rule](agents-spec.md#transit-rule) and
  [Current assignment changes](agents-spec.md#current-assignment-changes) in Agents.
- For every Agent in `agents` whose Current assignment was an Investigation: it leaves that Investigation's Current team,
  and the Investigation is recorded in its Participation history under
  [Participation history records](agents-spec.md#participation-history-records). Leaving has the effects on the
  Investigation under [Investigations](investigations.md), e.g. the Investigation is Abandoned when its last member
  leaves.

Nothing else changes; e.g., no money is spent, the Mission site's Turns until expiry is unchanged, and the Agents' skill,
current health, and exhaustion are unchanged. The Agents count toward the Transport cap at once and until the Mission resolution
step of the next Advance turn, under [Agency caps](economy-and-upgrades.md#agency-caps). The Combat is fought in that
step.

**No recall:** No Player action removes an Agent from a Mission's Current team or returns an Attempted Mission site to
Active. A Deployed Agent cannot be ordered or dismissed, under
[Agents that can be ordered](agents-spec.md#agents-that-can-be-ordered) in Agents. Several `deployAgents` actions in one
Turn may each deploy a team to a different Active Mission site, as long as each satisfies the Transport cap with the
Agents the earlier ones deployed.

# Mission resolution

**Proposed rule:** In the Turn advancement step Mission resolution, under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, every Mission that is
Deployed when the step begins is resolved, and then Mission sites are cancelled. Because a team is Deployed at once and
resolved in the next Advance turn, the Missions resolved are exactly those the player created by deploying Agents since
the previous Advance turn. When no Mission is Deployed, the resolution part does nothing and only the cancellation part
applies.

## Resolving one Mission

For each Deployed Mission M, at Mission site S:

1. **Combat:** A Combat is fought under [Combat](combat.md). Its Agents' side is M's Current team, in its order; its
   Enemies' side is S's Enemies list, in its order, under [Fixed order of each side](combat.md#fixed-order-of-each-side).
   The current values of every Combatant are their Step-start values of this step, under
   [Combat inputs and outputs](combat.md#combat-inputs-and-outputs). Every Agent of M's Current team is Serving,
   Deployed on M, and At assignment, because no Player action or earlier step can change a Deployed Agent's lifecycle
   state or Current assignment, so the lists are valid Combat inputs.
2. **Combat report:** The Combat's Combat report, which names M as its Mission, becomes part of the Turn report of this
   Advance turn, under [Combat report](combat.md#combat-report) in Combat.
3. **Lifecycle:** M becomes Won when the Combat outcome is Prevailed, and Lost when it is Retreated or Wiped, under
   [Combat outcomes](combat.md#combat-outcomes).
4. **Killed Agents:** Every Agent whose current health reached 0 in the Combat is Killed under
   [Killed and Incapacitated](combat.md#killed-and-incapacitated) in Combat; [Agent lifecycle](agents-spec.md#agent-lifecycle)
   in Agents removes its Current assignment and Task phase and records M in its Participation history.
5. **Survivors:** Every other Agent of M's Current team survives, including an Agent that ended the Combat
   Incapacitated. Its Current assignment becomes Recovery when its current health is below its base health, and Standby when
   its current health equals its base health; in both cases its Task phase becomes In transit, under
   [Current assignment changes](agents-spec.md#current-assignment-changes) in Agents. It leaves M's Current team, and M
   is recorded in its Participation history under [Participation history records](agents-spec.md#participation-history-records).
   Under [Transit rule](agents-spec.md#transit-rule), it is still In transit when this Advance turn ends. It then
   regains current health and exhaustion under [Agent Recovery](agent-recovery.md).
6. **Current team:** M's Current team is now empty.
7. **Consequences:** The consequences of M's new lifecycle state apply, under [Consequences](#consequences).

S stays Attempted. A Won Mission is also recorded in Lead progression against the Lead that created its Mission site,
under [Leads and Progression](leads-and-progression.md). A Mission raises an Agent's exhaustion only through its Combat,
under [Combat](combat.md), and changes an Agent's skill in no way, under
[Changes to attributes](agents-spec.md#changes-to-attributes) in Agents.

## Cancellation

After every Deployed Mission of the step has been resolved and its consequences applied, every Mission site that is
Active and whose target Faction is Defeated becomes Cancelled. Defeated is read at that moment, so a Faction made Defeated
by any Won Mission of this step counts, whichever Mission an implementation resolved first. This is the one
rule of this step that does not read Step-start values: it reads Defeated after the step's own consequences. A Cancelled
Mission site has no consequences, and its Enemies keep their values.

Only Active Mission sites are cancelled. An Attempted Mission site whose target Faction becomes Defeated in the same
step is not cancelled: its Mission is resolved like every other Deployed Mission, and its consequences apply in full.

## Order independence

The result of the step is the same whichever order an implementation resolves the Deployed Missions in, under
[Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement:

- **Combats are independent:** An Agent belongs to at most one Current team and an Enemy to exactly one Mission site, so
  no Combatant takes part in two Combats. A Combat depends only on its own inputs and its own named random outcomes,
  under [Combat inputs and outputs](combat.md#combat-inputs-and-outputs), so no Combat reads a value another Combat of
  the step changes.
- **Consequences are sums:** Money changes are added to money, and addition does not depend on order. Funding changes
  are summed and floored once for the step, under [Funding changes](economy-and-upgrades.md#funding-changes). Panic
  increases and Panic reductions are added to the Pending panic change, whose sum does not depend on order, under
  [Pending panic change](panic-and-endings.md#pending-panic-change).
- **Defeat is idempotent:** Applying [Defeat](factions.md#defeat) to a Faction that is already Defeated changes nothing,
  and every application in one step sets the same Defeated turn, so two Won Missions that defeat the same Faction
  give the same result in either order.
- **Cancellation comes last:** Cancellation reads Defeated only after every resolution, under
  [Cancellation](#cancellation), so it does not depend on which Won Mission was resolved first.

# Mission site expiration

**Proposed rule:** In the Turn advancement step Mission site expiration, under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, each Mission site that is
Active when the step begins and that already existed in the Turn-end state of this Advance turn counts down:

```text
Turns until expiry after = Turns until expiry before − 1
```

Turns until expiry before is a whole number of at least 1, by the invariants under
[Mission site properties](#mission-site-properties), so the result is a whole number of at least 0 and no rounding
occurs. When the result is 0, the Mission site becomes Expired and the Expired consequences apply, under
[Consequences](#consequences). When no Mission site qualifies, the step does nothing.

The following Mission sites do not count down in this step, and the list is exhaustive:

- A Mission site created earlier in the same Advance turn, in the Investigation progress step, because it did not exist
  in the Turn-end state. A Response Mission site created later in the same Advance turn, in the Faction activity step,
  does not exist yet when this step applies.
- A Mission site that is not Active: Attempted, Expired, and Cancelled Mission sites never count down. An Attempted
  Mission site keeps the Turns until expiry it had when its Mission was created.

Each Mission site counts down independently of every other, and the funding changes of all Mission sites Expired in this
step are summed and floored once, under [Funding changes](economy-and-upgrades.md#funding-changes), so the result does
not depend on processing order.

**Timing consequence:** A Mission site created during the Advance turn ending turn t with `expires_in_turns` E has Turns
until expiry E during Turn t + 1, can be deployed to in each of Turns t + 1 to t + E, and is Expired in the Advance turn
ending turn t + E if no team is deployed to it. A team deployed during Turn t + E, when Turns until expiry is 1, still
fights, because Mission resolution precedes Mission site expiration, and the Mission site is then Attempted, not Active.

# Consequences

Consequences are what a Mission site and its Mission change in the Campaign once they reach a final state, e.g. the
money a Won Mission brings or the Panic an ignored Response Mission site raises.

**Proposed rule:** The following table states the complete consequences for the Campaign of each final state of a
Mission and of a Mission site, by the kind of the Mission site. It is exhaustive: no other rule of any specification adds
a consequence of these final states, apart from the Lead progression record and Lead availability under
[Leads and Progression](leads-and-progression.md) and the changes to Agents under
[Resolving one Mission](#resolving-one-mission). The final state Attempted of a Mission site has no consequence of its
own. "The operation level" is the FactionOperationLevel in the Response Mission site's origin.

| Final state            | Initiative                                                                                                                                                                                                                                                             | Response                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Mission Won            | Its MissionSiteArchetype's `on_win`: money rises by `money`; a funding change of `funding`; a Panic reduction of `panic_reduction_pct`; and, when `defeat_target_faction` is true, its target Faction is made Defeated under [Defeat](factions.md#defeat) in Factions. | The operation level's `on_win`: money rises by `money`, and a funding change of `funding`. Applied exactly once.         |
| Mission Lost           | None.                                                                                                                                                                                                                                                                  | The operation level's `on_ignored_or_lost`: a Panic increase of `panic_increase_pct`, and a funding change of `funding`. |
| Mission site Expired   | None.                                                                                                                                                                                                                                                                  | As Lost: the operation level's `on_ignored_or_lost`.                                                                     |
| Mission site Cancelled | None.                                                                                                                                                                                                                                                                  | None.                                                                                                                    |

How each kind of change applies:

- **Money:** The amount is added to the Agency's money at once, in the step of the transition, and the result is never
  clamped, under [Agency properties](economy-and-upgrades.md#agency-properties) in Economy and Upgrades.
- **Funding:** Each funding change is applied only through [Funding changes](economy-and-upgrades.md#funding-changes) in
  Economy and Upgrades: every funding change of one Turn advancement step, i.e. all of Mission resolution or all of
  Mission site expiration, is summed and then floored at 0 once. A funding change first affects Agency income in the
  next Advance turn, because the Agency income step precedes both steps.
- **Panic:** Each Panic increase and Panic reduction is added to the Pending panic change under
  [Pending panic change](panic-and-endings.md#pending-panic-change) in Panic and Endings, never applied to Panic
  directly; the Panic step of the same Advance turn applies the sum. Each amount is a whole number of Panic percentage
  points that is added to or subtracted from Panic, never a percent of the current Panic, under
  [Percent values](../foundation/numbers.md#percent-values) in Numbers; e.g., a Panic increase of 8 raises a Panic of 10
  to 18, not to 10.8. No rounding occurs, and an amount of 0 changes nothing.
- **Defeat:** Making a Faction Defeated has the effects under [Defeat](factions.md#defeat) in Factions. This is the
  only rule that makes a Faction Defeated.

Every amount a consequence applies is read from GDRs when the transition happens; a missing `on_win` property of a
MissionSiteArchetype of kind initiative contributes 0, or no defeat. The consequences of a Mission site and its Mission
depend only on the Mission site's kind, the final state of the Mission site or its Mission, and the GDRs they read. A
Lost Mission yields no benefit from the damage its team inflicted, and no consequence of a Mission or a Mission site
slows a Faction's escalation or its operations.

**Informative rationale:** game-ts paid the reward for stopping a Faction operation twice; here a Won Response Mission
applies the operation level's `on_win` once, and no rule of [Factions](factions.md) pays it again. A Lost Response
Mission has the same consequences as an Expired Response Mission site because the GDR property `on_ignored_or_lost`
names both, and a Lost Mission yields no benefit from the damage its team inflicted.

# Player-visible information

**Proposed rule:** Every value below is Player-visible information under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract, from the
moment it exists, without a reveal condition, for every Mission site and every Mission whatever its lifecycle state.
The table is exhaustive.

| Value                                                                                                                                                                                     | Player-visible information |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| A Mission site's Instance ID and its MissionSiteArchetype, including every property of that GDR                                                                                           | Yes                        |
| A Mission site's kind, origin, target Faction, and Turn created, including the FactionOperationLevel of a Response Mission site's origin and that GDR's `on_win` and `on_ignored_or_lost` | Yes                        |
| A Mission site's lifecycle state                                                                                                                                                          | Yes                        |
| A Mission site's Turns until expiry                                                                                                                                                       | Yes                        |
| A Mission site's Enemies list, in its order; the values of each Enemy are Player-visible under [Player-visible information](combat.md#player-visible-information) in Combat               | Yes                        |
| A Mission site's rewards and penalties, i.e. the amounts under [Consequences](#consequences) for each final state                                                                         | Yes                        |
| A Mission's Instance ID, its MissionArchetype, its Mission site, its Turn deployed, and its Team sent, in its order                                                                       | Yes                        |
| A Mission's lifecycle state                                                                                                                                                               | Yes                        |
| A Mission's Current team, in its order                                                                                                                                                    | Yes                        |

A Response Mission site's MissionSiteArchetype is the value of its
[MissionSiteArchetype selection](#missionsitearchetype-selection) outcome, so that value is Player-visible through the
Mission site from the Committed state in which the Mission site exists. **Unknown versus absent:** No value in the table is hidden, so
Player API never reports one as unknown. A Mission site that no team has been deployed to has no Mission; Player API
reports its Mission as absent, and the visible lifecycle state of the Mission site explains why. Turns until expiry is always present; a value of 0 appears only on an Expired
Mission site. An empty Current team of a Won or Lost Mission is reported as empty, not as absent.

# Edge cases and failure behavior

- **Deploying on the last Turn before expiry:** A team deployed when Turns until expiry is 1 fights in the next Advance
  turn, because Mission resolution precedes Mission site expiration; its Mission is Won or Lost, and the Mission site is
  Attempted, never Expired
  ([Mission site expiration](#mission-site-expiration)).
- **Creation and expiration in one Advance turn:** A Mission site created in Investigation progress or Faction activity
  does not count down in the same Advance turn ([Mission site expiration](#mission-site-expiration)).
- **Several Missions resolved in one step:** Each has its own Combat; money, funding, and Panic changes add up, and
  funding is floored once for the step ([Order independence](#order-independence)).
- **Win that defeats a Faction while other Mission sites target it:** Every Active Mission site targeting that Faction
  is Cancelled at the end of the step. A Deployed Mission at a Mission site targeting it in the same step still has its
  Combat, and is Won or Lost with its full consequences, e.g. a Won Response Mission still pays the operation level's `on_win`
  ([Cancellation](#cancellation)).
- **Two wins that defeat the same Faction in one step:** The Faction is Defeated once, with one Defeated turn
  ([Order independence](#order-independence)).
- **Mission site created for a Faction that is already Defeated:** A Mission site created in Investigation progress whose
  target Faction is already Defeated is Active only until the Cancellation part of Mission resolution in the same
  Advance turn, which cancels it; no Committed state shows it Active. A Defeated Faction creates no Response Mission site,
  under [Defeat](factions.md#defeat) ([Cancellation](#cancellation)).
- **All Agents Killed:** The Combat outcome is Wiped, so the Mission is Lost with its Lost consequences. The Mission
  keeps its Team sent, its Current team is empty, and the Killed Agents no longer count toward the
  Transport cap ([Resolving one Mission](#resolving-one-mission)).
- **Incapacitated survivors:** An Agent that ends the Combat Incapacitated is alive and returns like any survivor:
  Recovery if its current health is below its base health, Standby if its current health equals its base health ([Resolving one Mission](#resolving-one-mission)).
- **Transport cap exactly reached:** Deploying Agents so that the number of Deployed Agents equals the Transport cap is
  accepted; one more is rejected ([Deploying Agents](#deploying-agents)).
- **Response reward not doubled:** A Won Response Mission applies the operation level's `on_win` once
  ([Consequences](#consequences)).
- **Lost versus Expired:** A Lost Response Mission and an Expired Response Mission site have identical consequences, and
  a Lost Initiative Mission and an Expired Initiative Mission site have none; a Lost Mission yields no benefit from the
  damage its team inflicted ([Consequences](#consequences)).
- **Deploying to a Mission site that is not Active:** Rejected, e.g. to an Attempted Mission site that already has its
  Mission, or to an Expired one ([Deploying Agents](#deploying-agents)).
- **Mixed valid and invalid Agents:** One invalid Agent rejects the whole action; no Agent and no Mission site changes, and no Mission is created
  ([Deploying Agents](#deploying-agents)).
- **Agents taken from an Investigation:** They leave its Current team at once, with the effects on the Investigation
  under [Investigations](investigations.md) ([Deploying Agents](#deploying-agents)).
- **Defeat on a Faction already Defeated:** A Won Initiative Mission whose MissionSiteArchetype has
  `defeat_target_faction` true and whose target Faction is already Defeated changes nothing about that Faction; its other `on_win` amounts still apply
  ([Consequences](#consequences)).
- **Negative or zero funding change at the floor:** Funding never falls below 0, under
  [Funding changes](economy-and-upgrades.md#funding-changes) ([Consequences](#consequences)).
- **Invalid GDRs:** A Game build that fails [MissionSiteArchetype validation](#missionsitearchetype-validation), e.g.
  with an `expires_in_turns` of 0, an empty `enemies`, an `on_win` on a MissionSiteArchetype of kind response, or an
  `operation_level` that no FactionOperationLevel has, is defective and no Campaign is created from it. A Committed state
  violating an invariant under [Mission site properties](#mission-site-properties) or
  [Mission properties](#mission-properties), e.g. an Active Mission site with a Mission, is an internal invariant
  violation.
- **Campaign ended:** Once the Campaign has a Campaign ending, `deployAgents` and Advance turn are rejected, under
  [Panic and Endings](panic-and-endings.md).

# Acceptance examples

All examples use the Bootstrap GDR values from `content/missions/mission_site_archetypes.yaml`,
`content/missions/mission_archetypes.yaml`,
`content/factions/faction_operation_levels.yaml`, `content/leads-and-progression/leads.yaml`,
`content/combat/enemy_archetypes.yaml`, `content/combat/weapons.yaml`, `content/combat/combat_parameters.yaml`,
`content/agents/agent_archetypes.yaml`, `content/agents/agent_parameters.yaml`, and
`content/economy-and-upgrades/economy_parameters.yaml`, unless an example states a test value. The values they read are:

| GDR                      | Values read                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `apprehend_member`       | `kind` initiative; `expires_in_turns` 5; `enemies` `initiate` 3; `on_win` `money` 5, `funding` 0, `panic_reduction_pct` 1                |
| `raid_safehouse`         | `kind` initiative; `expires_in_turns` 8; `enemies` `initiate` 8, `soldier` 1; `on_win` `money` 100, `funding` 5, `panic_reduction_pct` 2 |
| `raid_hq`                | `kind` initiative; `expires_in_turns` 20; `enemies` `initiate` 6, `soldier` 3, `cult_leader` 1; `on_win` `defeat_target_faction` true    |
| `foil_recruitment_push`  | `kind` response; `operation_level` 1; `expires_in_turns` 3; `enemies` `initiate` 5                                                       |
| `foil_sabotage`          | `kind` response; `operation_level` 2; `expires_in_turns` 4; `enemies` `initiate` 4, `soldier` 2                                          |
| `operation_level_1`      | `level` 1; `on_win` `money` 10, `funding` 0; `on_ignored_or_lost` `panic_increase_pct` 3, `funding` 0                                    |
| `operation_level_2`      | `level` 2; `on_win` `money` 30, `funding` 5; `on_ignored_or_lost` `panic_increase_pct` 8, `funding` −1                                   |
| `locate_red_dawn_member` | `faction` `red_dawn`; `create_mission_site` `apprehend_member`                                                                           |
| `locate_red_dawn_hq`     | `faction` `red_dawn`; `create_mission_site` `raid_hq`                                                                                    |
| `initiate`, `soldier`    | `skill` 40 and 120; `base_health` 20 and 30; Weapon damage 10 and 14                                                                     |
| `field_agent`            | `skill` 100; `base_health` 30; Weapon damage 10                                                                                          |
| `economy`                | `base_transport_cap` 4                                                                                                                   |
| `standard_mission`       | The MissionArchetype; no rule reads its properties                                                                                       |

The Campaign has one Faction, Red Dawn, from `red_dawn`, which is not Defeated unless an example says otherwise. "The
Advance turn ending turn t" is the Advance turn committed during Turn t. Unless stated otherwise, every Agent is a
`field_agent` with skill 100, current health 30 of 30, exhaustion 0, weapon damage 10, and effective skill 100, and no Upgrade
has been acquired, so the Transport cap is 4. In the Combat traces, Combat's rules decide every target and every value;
the injected named random outcomes are each attack's hit outcome and, for a hit, its damage outcome, under
[Hit outcome](combat.md#hit-outcome) and [Damage outcome](combat.md#damage-outcome) in Combat; "h" is current health and "x" is
exhaustion. Money, funding, and Panic before each example are stated in it; Panic changes only in the Panic step, from
the Pending panic change. [The full life of an apprehend_member Mission site](#the-full-life-of-an-apprehend_member-mission-site)
states the whole Agency and follows money through every step of the Advance turn. Every other example states the money
when the step that settles its Missions or Mission sites begins, i.e. after the Agency income and Upkeep steps of that Advance turn,
and shows only the change that Mission resolution or Mission site expiration makes to it.

## The full life of an apprehend_member Mission site

This example exercises [Mission site creation](#mission-site-creation), [Enemy creation](#enemy-creation),
[Mission site expiration](#mission-site-expiration), [Deploying Agents](#deploying-agents),
[Mission site lifecycle](#mission-site-lifecycle), [Mission properties](#mission-properties),
[Mission lifecycle](#mission-lifecycle), [Resolving one Mission](#resolving-one-mission), and
[Consequences](#consequences).

**Creation, Advance turn ending turn 4.** In Investigation progress, Investigation i1 completes, under
[Investigations](investigations.md), and its creating rule supplies the MissionSiteArchetype `apprehend_member`, the
origin Investigation i1, and the target Faction Red Dawn; e.g., the creating rule is the completion effect of
`locate_red_dawn_member` under [Leads and Progression](leads-and-progression.md). Mission site s1 is created:

| Value              | s1 after the Advance turn ending turn 4                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| Archetype          | `apprehend_member`, as supplied                                                  |
| Kind               | Initiative                                                                       |
| Origin             | Investigation i1, as supplied                                                    |
| Target Faction     | Red Dawn, as supplied                                                            |
| Turn created       | 4                                                                                |
| Lifecycle          | Active                                                                           |
| Turns until expiry | 5: s1 did not exist in the Turn-end state, so Mission site expiration skipped it |
| Enemies            | e1, e2, e3, each of `initiate`: skill 40, current health 20 of 20, exhaustion 0  |

The Combat rating of s1's Enemies is 3 × 40 = 120, and its rewards are money 5, funding change 0, and Panic reduction 1.

**Countdown.** In the Advance turn ending turn 5, s1 counts down to 4.

**Deploying, Turn 6.** The Agency's roster is exactly the four Serving Agents a1, a2, a3, and a4; each is on Standby,
At assignment, so no Agent is on Contracting and no Agent is Deployed. s1 is the only Mission site. The player
calls `deployAgents(s1, [a1, a2, a3, a4])`. 0 + 4 = 4 is not more than the Transport cap 4, so the action succeeds: s1 is
Attempted, and Mission m1 is created with Archetype `standard_mission`, Mission site s1, Turn deployed 6, Team sent and
Current team [a1, a2, a3, a4], and lifecycle Deployed. Each Agent is Deployed on m1, At assignment.
s1's Turns until expiry stays 4. A further `deployAgents` of any Agent to any Mission site in Turn 6 is
rejected, because 4 + 1 is more than 4.

**Resolution, Advance turn ending turn 6.** Money is 400, funding 20, and Panic 10 when the Advance turn begins, and the
Pending panic change is 0. In Agency income, under [Agency income](economy-and-upgrades.md#agency-income) in Economy and
Upgrades, money rises by funding 20 plus 30 × 0 for no Agent on Contracting, to 420. In Upkeep, under
[Upkeep](economy-and-upgrades.md#upkeep), money falls by 10 × 4 for the four Serving Agents, all Deployed, to 380. No
Investigation is Active, so Investigation progress changes nothing. In Mission resolution, the Combat of m1 has the Agents' side [a1, a2, a3, a4] and the Enemies' side [e1, e2, e3]:

| Combat round | Attacker → target              | Injected outcomes | Result                         |
| ------------ | ------------------------------ | ----------------- | ------------------------------ |
| 1            | a1 → e1 (tie at 40, earliest)  | hit; damage 15    | e1: h5, x1, effective skill 10 |
| 1            | a2 → e2 (40 beats 10)          | hit; damage 15    | e2: h5, x1, effective skill 10 |
| 1            | a3 → e3 (40 beats 10)          | hit; damage 15    | e3: h5, x1, effective skill 10 |
| 1            | a4 → e1 (tie at 10, earliest)  | hit; damage 5     | e1: h0, dead                   |
| 1            | e2 → a1 (tie at 100, earliest) | miss              | a1: x2 after this attack       |
| 1            | e3 → a1 (tie at 100, earliest) | miss              | a1: x3 after this attack       |
| 2            | a1 → e2 (tie at 10, earliest)  | hit; damage 5     | e2: h0, dead                   |
| 2            | a2 → e3 (only target)          | hit; damage 5     | e3: h0, dead                   |

a3 and a4 have no target in Combat round 2, and no Enemy attacks in its Enemies' phase. After Combat round 1 the Agents' Combat rating
is 400, so the Combat continues; after Combat round 2 no Enemy is able to fight, and the Combat outcome is Prevailed after 2
Combat rounds. Every Agent ends with current health 30 of 30; a1 has exhaustion 4, a2 2, a3 1, and a4 1.

| Value after the Advance turn ending turn 6 | Result                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| s1                                         | Attempted; Turns until expiry 4                                                                                           |
| m1                                         | Won; an empty Current team and its unchanged Team sent [a1, a2, a3, a4]; the Turn report holds the Combat report above    |
| a1, a2, a3, a4                             | Serving; Standby, In transit, because each has current health equal to its base health; m1 in each Participation history  |
| Money                                      | 380 + 5 = 385 after Mission resolution; no later step of this Advance turn changes money, so the turn ends with money 385 |
| Funding                                    | max(0, 20 + 0) = 20                                                                                                       |
| Pending panic change                       | −1 from m1, the only contribution, so the Panic step gives Panic max(0, min(100, 10 − 1)) = 9                             |
| Lead progression                           | A win of m1 against `locate_red_dawn_member`, recorded by [Leads and Progression](leads-and-progression.md)               |

s1 is not Active in Mission site expiration, so it does not count down. The four Agents arrive in the Advance turn ending
turn 7 and can be ordered in Turn 8. No later Player action can deploy Agents to s1.

## foil_sabotage ignored, Lost, and Won

This example exercises [Consequences](#consequences), [Mission site expiration](#mission-site-expiration),
[Resolving one Mission](#resolving-one-mission), [Mission site lifecycle](#mission-site-lifecycle), and
[Mission lifecycle](#mission-lifecycle), and compares the three outcomes of the same Mission site. In the Advance turn ending turn 40, a Faction operation occurrence
of Red Dawn with Faction operation level `operation_level_2` creates Mission site s2 from `foil_sabotage`, under
[Faction operation occurrence generation](factions.md#faction-operation-occurrence-generation): Response, origin Red Dawn
and `operation_level_2`, target Faction Red Dawn, Turn created 40, Active, Turns until expiry 4, and the Enemies list
e1, e2, e3, e4 of `initiate` followed by e5, e6 of `soldier`, with a Combat rating of 160 + 240 = 400. Its rewards are
money 30 and funding change 5, and its penalties are Panic increase 8 and funding change −1. In each variant, when the
step that settles s2 or its Mission begins, money is 300, funding is 20, Panic is 10, and nothing else contributes to the Pending panic
change.

| Turn | s2's Turns until expiry during that Turn, while Active |
| ---- | ------------------------------------------------------ |
| 41   | 4                                                      |
| 42   | 3                                                      |
| 43   | 2                                                      |
| 44   | 1                                                      |

**Ignored.** No team is deployed. s2 counts down to 3, 2, and 1 in the Advance turns ending turns 41, 42, and 43. In
Mission site expiration of the Advance turn ending turn 44 it reaches 0 and is Expired: a Panic increase of 8 is added to
the Pending panic change, so Panic becomes 18 when nothing else contributes, and funding becomes max(0, 20 − 1) = 19.
Money is not changed by s2. The Agency income step of the Advance turn ending turn 44 had already used funding 20; that
of the Advance turn ending turn 45 uses 19. s2 never has a Mission, and its Enemies keep their initial values.

**Lost.** During Turn 42, with Turns until expiry 3, the player calls `deployAgents(s2, [a1])`, so s2 is Attempted and
Mission m2 is created with the Current team [a1]. In Mission resolution of
the Advance turn ending turn 42:

| Combat round | Attacker → target              | Injected outcomes | Result                                                             |
| ------------ | ------------------------------ | ----------------- | ------------------------------------------------------------------ |
| 1            | a1 → e5 (tie at 120, earliest) | miss              | a1: x1; e5: x1                                                     |
| 1            | e1 → a1                        | miss              | a1: x2                                                             |
| 1            | e2 → a1                        | miss              | a1: x3                                                             |
| 1            | e3 → a1                        | miss              | a1: x4                                                             |
| 1            | e4 → a1                        | miss              | a1: x5                                                             |
| 1            | e5 → a1                        | hit; damage 21    | a1: h9, x6, effective skill `round down(100 × 9 × 99 / 3000) = 29` |
| 1            | e6 → a1                        | miss              | a1: h9, x7, effective skill `round down(100 × 9 × 98 / 3000) = 29` |

After Combat round 1, an Enemy and an Agent are able to fight, and the Retreated check holds: 29 < 0.5 × 100 = 50, and the
Enemies' Combat rating 400 ≥ 0.8 × 29. The Combat outcome is Retreated, so m2 is Lost. a1 survives with current health 9 of 30,
so its Current assignment becomes Recovery, In transit. A Panic increase of 8 is added and funding becomes
max(0, 20 − 1) = 19, the same consequences as the Ignored variant, two Advance turns earlier; money is unchanged. s2 does
not count down in Mission site expiration, because it is Attempted, not Active.

**Won.** During Turn 41, with Turns until expiry 4, the player calls `deployAgents(s2, [a1, a2, a3, a4])`, so s2 is
Attempted and Mission m2 is created with the Current team [a1, a2, a3, a4]. In Mission
resolution of the Advance turn ending turn 41:

| Combat round | Attacker → target                  | Injected outcomes   | Result                                                                                                                                                                   |
| ------------ | ---------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1            | a1 → e5 (tie at 120, earliest)     | hit; damage 15      | e5: h15, effective skill 60                                                                                                                                              |
| 1            | a2 → e6 (120 beats 60)             | hit; damage 15      | e6: h15, effective skill 60                                                                                                                                              |
| 1            | a3 → e5 (tie at 60, earliest)      | hit; damage 15      | e5: h0, dead                                                                                                                                                             |
| 1            | a4 → e6 (60 beats 40)              | hit; damage 15      | e6: h0, dead                                                                                                                                                             |
| 1            | e1, e2, e3, e4 → a1, each          | miss, each          | a1: x5                                                                                                                                                                   |
| 2            | a1 → e1 (tie at 40, earliest)      | hit; damage 15      | e1: h5, effective skill 10                                                                                                                                               |
| 2            | a2 → e2 (40 beats 10)              | hit; damage 15      | e2: h5, effective skill 10                                                                                                                                               |
| 2            | a3 → e3 (40 beats 10)              | hit; damage 15      | e3: h5, effective skill 10                                                                                                                                               |
| 2            | a4 → e4 (40 beats 10)              | hit; damage 15      | e4: h5, effective skill 10                                                                                                                                               |
| 2            | e1, e2, e3, e4 → a2, each          | miss, each          | a2: x6. a1, at x6, has effective skill 99, so each initiate targets a2, whose exhaustion is at most 5, and so whose effective skill is 100, before each of these attacks |
| 3            | a1 → e1, a2 → e2, a3 → e3, a4 → e4 | hit; damage 5, each | e1, e2, e3, e4: h0, dead                                                                                                                                                 |

After Combat round 3 no Enemy is able to fight, so the Combat outcome is Prevailed and m2 is Won. Every Agent ends with current health
30 of 30 and becomes Standby, In transit. Money becomes 300 + 30 = 330 and funding becomes max(0, 20 + 5) = 25; no Panic
change is added. The Agency income step of the Advance turn ending turn 42 uses funding 25. The operation level's
`on_win` is applied once: money rises by 30, not 60, and no rule of Factions adds a second reward.

| Variant | Final states                                        | Money change | Funding after the step | Panic contribution |
| ------- | --------------------------------------------------- | ------------ | ---------------------- | ------------------ |
| Ignored | s2 Expired, Advance turn ending turn 44; no Mission | 0            | 19                     | +8                 |
| Lost    | s2 Attempted; m2 Lost, Advance turn ending turn 42  | 0            | 19                     | +8                 |
| Won     | s2 Attempted; m2 Won, Advance turn ending turn 41   | +30          | 25                     | 0                  |

## A Won raid_hq Mission defeats Red Dawn and cancels an Active Mission site

This example exercises [Consequences](#consequences), [Cancellation](#cancellation),
[Order independence](#order-independence), and [Mission site lifecycle](#mission-site-lifecycle). During Turn 150:

- Mission site s3, from `raid_hq`, created by an Investigation of `locate_red_dawn_hq`, target Faction Red Dawn, is
  Attempted; its Mission m3 is Deployed with a team of eight Agents.
- Mission site s4, from `foil_sabotage`, target Faction Red Dawn, is Attempted; its Mission m4 is Deployed with a team of
  four other Agents. The
  Agency has acquired the Upgrade `transport_cap` four times, so the Transport cap is 4 + 2 × 4 = 12 and both teams fit.
- Mission site s5, from `foil_recruitment_push`, target Faction Red Dawn, is Active with Turns until expiry 2.

Money is 1000, funding 25, and Panic 40. In Mission resolution of the Advance turn ending turn 150, both Combats are
fought. Their injected hit and damage outcomes are chosen so that the Combat of m3 has the Combat outcome Prevailed and
the Combat of m4 the Combat outcome Prevailed; this example does not repeat the two traces, which Combat's rules decide,
and checks only what follows from the two Combat outcomes.

| Effect  | Result                                                                                                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| m3      | Won. `on_win` of `raid_hq` has `defeat_target_faction` true and no `money`, `funding`, or `panic_reduction_pct`, which therefore contribute 0. Red Dawn is made Defeated under [Defeat](factions.md#defeat), with Defeated turn 150. |
| m4      | Won, although Red Dawn is Defeated in the same step: it was Deployed, so it is resolved in full. Money rises by 30 and a funding change of 5 applies.                                                                                |
| Funding | max(0, 25 + 0 + 5) = 30, one floor for the step                                                                                                                                                                                      |
| Money   | 1000 + 0 + 30 = 1030                                                                                                                                                                                                                 |
| s5      | Cancelled at the end of the step, because it is Active and Red Dawn is Defeated. No consequence: no Panic increase, no funding change.                                                                                               |

Resolving m4 before m3 gives the same Committed state: s5 is cancelled only after both resolutions. s5 does not count down
in Mission site expiration, and it never has a Mission. Whether the Campaign now ends in Victory is decided under
[Panic and Endings](panic-and-endings.md). Had s5 been left Active without a defeat, it would have been Expired in the
Advance turn ending turn 151 with a Panic increase of 3 and a funding change of 0.

## Transport cap and other rejections of deployAgents

This example exercises [Deploying Agents](#deploying-agents). During Turn 15, a1, a2, and a3 are Deployed on Mission m6 at
Mission site s6, from `foil_recruitment_push`, which is therefore Attempted. Mission site s7, from `apprehend_member`, is Active, and Mission site s8 is Expired. a4
and a5 are on Standby, At assignment; a6 is on Training, In transit; a7 is on Recovery, At assignment; a8 is on
Contracting, At assignment. Each call is made on its own from this state, and each rejected call changes nothing:

| Call                         | Result                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `deployAgents(s7, [a4, a5])` | Rejected: 3 + 2 = 5 is more than the Transport cap 4. Neither a4 nor a5 changes, and s7 stays Active.         |
| `deployAgents(s7, [])`       | Rejected: `agents` is empty.                                                                                  |
| `deployAgents(s7, [a4, a4])` | Rejected: a4 is listed twice.                                                                                 |
| `deployAgents(s7, [a6])`     | Rejected: a6 is In transit and cannot be ordered.                                                             |
| `deployAgents(s7, [a7])`     | Rejected: a7 is on Recovery and cannot be ordered.                                                            |
| `deployAgents(s7, [a1])`     | Rejected: a1 is Deployed and cannot be ordered.                                                               |
| `deployAgents(s6, [a4])`     | Rejected: s6 is Attempted, not Active; it already has its Mission m6.                                         |
| `deployAgents(s8, [a4])`     | Rejected: s8 is Expired.                                                                                      |
| `deployAgents(s7, [a4])`     | Succeeds: 3 + 1 = 4 equals the Transport cap. s7 is Attempted, and its new Mission has the Current team [a4]. |

After the last call, `deployAgents` of a5 to any Active Mission site in Turn 15 is rejected, because 4 + 1 is more than 4.
If the player instead first purchases the Upgrade `transport_cap`, the Transport cap is 6, under
[Agency caps](economy-and-upgrades.md#agency-caps), and `deployAgents(s7, [a4, a8])` succeeds with 3 + 2 = 5; a8 leaves
Contracting at once. In the Advance turn ending turn 15, the Combats of m6 and of the Mission at s7 are fought, and their survivors stop
counting toward the Transport cap.

## Deploying on the last Turn

This example exercises [Mission site expiration](#mission-site-expiration) and
[Mission resolution](#mission-resolution). Mission site s1 from `apprehend_member` is created in the Advance turn ending
turn 4, as in [The full life of an apprehend_member Mission site](#the-full-life-of-an-apprehend_member-mission-site). It
counts down to 4, 3, 2, and 1 in the Advance turns ending turns 5 to 8, so during Turn 9 its Turns until expiry is 1.

- **Deployed in Turn 9:** The player calls `deployAgents(s1, [a1, a2, a3, a4])`, so s1 is Attempted and its Mission is
  Deployed. In the Advance turn ending turn 9, the Combat is fought in Mission resolution and the Mission becomes Won or
  Lost; with the injected outcomes of the full-life example it is Won, with money +5 and a Panic reduction of 1. s1 is
  not Active in Mission site expiration, so it is not Expired, and its Turns until expiry stays 1.
- **Not deployed:** In Mission site expiration of the Advance turn ending turn 9, s1 counts down to 0 and is Expired. As
  an Initiative Mission site it has no consequence: money, funding, and Panic are unchanged by it. Whether
  `locate_red_dawn_member` is available again is decided under [Leads and Progression](leads-and-progression.md).

## A Response Mission site from Faction activity

This example exercises [Mission site creation](#mission-site-creation),
[MissionSiteArchetype selection](#missionsitearchetype-selection), [Enemy creation](#enemy-creation), and
[Mission site expiration](#mission-site-expiration). In the Faction activity step of the Advance turn ending turn 15, a
Faction operation occurrence of Red Dawn has the Faction operation level `operation_level_1`. The MissionSiteArchetypes
of kind response whose `operation_level` is 1 are exactly `foil_recruitment_push`, so `n` is 1 and the injected
MissionSiteArchetype selection outcome is `foil_recruitment_push`, with Probability 1. With a test MissionSiteArchetype
`test_foil_level_1` of kind response and `operation_level` 1 supplied as well, `n` would be 2, and each of the two
values would have Probability 1 / 2. Mission site s9 is
created: Response; origin Red Dawn and `operation_level_1`; target Faction Red Dawn; Turn created 15; Active; Turns until
expiry 3; Enemies e1 to e5, each of `initiate`, in that order; no Mission. Mission site expiration came before Faction
activity in that Advance turn, so s9 has Turns until expiry 3 during Turn 16. It counts down to 2 and 1 in the Advance
turns ending turns 16 and 17 and, if no team is deployed, is Expired in the Advance turn ending turn 18, adding a Panic
increase of 3 and a funding change of 0. If a team were deployed to it and its Mission Won instead, it would add money
10 and a funding change of 0.

## Several Mission sites in one step

This example exercises [Order independence](#order-independence) and [Consequences](#consequences). Funding is 0, money
200, and Panic 50. In Mission resolution of one Advance turn, Mission m10 at Mission site s10 from `apprehend_member` is
Won, Mission m11 at Mission site s11 from `foil_sabotage` is Won, and Mission m12 at Mission site s12 from
`foil_recruitment_push` is Lost, each by the outcome of its own Combat. The changes are money +5 + 30 = +35, so money is 235; funding changes 0, +5, and 0, so funding is
max(0, 0 + 0 + 5 + 0) = 5; and Panic contributions of −1 and +3, so the Pending panic change is 2 from this step. In a
second variant, m11 is Lost instead: money is 200 + 5 = 205; the funding changes are 0, −1, and 0, so funding is
max(0, 0 + 0 − 1 + 0) = 0; and the Panic contributions are −1, +8, and +3, a Pending panic change of 10 from this step. Every processing order of m10, m11, and m12 gives the same Committed state.

## Structure of an Attempted Mission site and its Mission

This example exercises [Mission site properties](#mission-site-properties) and [Mission properties](#mission-properties).
The fixture of [A. Valid relationships](domain-model.md#a-valid-relationships) in Domain Model, in which Mission site s1
is Attempted and its Mission m1 is Deployed with the Team sent and Current team {a2}, satisfies
every invariant under [Mission site properties](#mission-site-properties) and [Mission properties](#mission-properties).
Each row independently changes that fixture and describes an invalid state.

| Change                                       | Invariant violated                                                 |
| -------------------------------------------- | ------------------------------------------------------------------ |
| s1 is Active while m1 references it          | A Mission references the Mission site exactly when it is Attempted |
| A second Mission m2 also references s1       | At most one Mission references a Mission site                      |
| m1 is Won and its Current team is still {a2} | The Current team is empty when Won or Lost                         |
| m1 is Deployed with an empty Current team    | The Current team equals the Team sent exactly when Deployed        |
| s1 is Expired with Turns until expiry 1      | Turns until expiry is 0 exactly when Expired                       |

## GDR validation

This example exercises [MissionSiteArchetype validation](#missionsitearchetype-validation). The Bootstrap GDRs pass every
rule: the one MissionArchetype, `standard_mission`, has a non-empty `name` and no other property; each of the five
MissionSiteArchetypes has a non-empty `name`, a `kind` of `initiative` or `response`, an
`expires_in_turns` of at least 1, and a non-empty `enemies` whose keys are EnemyArchetypes the Game build supplies with
counts of at least 1; only the three of the `initiative` kind have `on_win`, whose properties are whole numbers of at
least 0 or `defeat_target_faction` true; only the two of the `response` kind have `operation_level`, 1 and 2, each the
`level` of a FactionOperationLevel, so each key of every FactionActivityLevel's `operation_level_weights`, 1 or 2, can
be served; and both FactionOperationLevels have `on_win` with whole `money` and `funding` of at
least 0 and `on_ignored_or_lost` with a whole `panic_increase_pct` of at least 0 and a whole `funding`. Each of the
following test changes independently makes the Game build defective, so no Campaign is created from it:

| Test change                                                                            | Rule violated                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------- |
| `apprehend_member`'s `expires_in_turns` is 0                                           | Expiry is valid                             |
| `foil_sabotage`'s `enemies` is empty                                                   | Enemies are valid                           |
| `raid_safehouse`'s `enemies` gains `commander: 1`, an identifier no EnemyArchetype has | Enemies are valid                           |
| `foil_recruitment_push`'s `enemies` count of `initiate` is 0                           | Enemies are valid                           |
| `foil_sabotage` gains `on_win` with `money` 30                                         | Rewards only for Initiative                 |
| `raid_hq`'s `on_win` `money` is −5                                                     | Rewards only for Initiative                 |
| `foil_sabotage`'s `operation_level` is 3                                               | Operation level only for Response           |
| `apprehend_member` gains `operation_level` 1                                           | Operation level only for Response           |
| `apprehend_member`'s `kind` is `offensive`                                             | Kind is valid                               |
| `operation_level_2`'s `on_ignored_or_lost` lacks `funding`                             | Operation level consequences are valid      |
| `foil_sabotage` is removed, while `faint` weights Faction operation level 2            | Every Faction operation level can be served |
| `raid_hq` has a property `faction`                                                     | Known properties                            |
| A second MissionArchetype `elite_mission` is supplied                                  | One MissionArchetype                        |

# TODOs

- TODO (later): Partial success, so that attempting and failing a Mission differs materially from ignoring its Mission
  site, as
  [F. Mission commitment: force concentration, casualties, and partial success](../../game-design-brief.md#f-mission-commitment-force-concentration-casualties-and-partial-success)
  in the game design brief requires; under [Consequences](#consequences).
- TODO (later): Faction suppression by a consequence of a Mission or a Mission site, under [Consequences](#consequences).
- TODO (later): Exhaustion gained after a Mission beyond its Combat, under [Resolving one Mission](#resolving-one-mission).
- TODO (later): Skill gained by surviving a Mission, under [Resolving one Mission](#resolving-one-mission).
- TODO (later): A second attempt at a Mission site, under [Mission site lifecycle](#mission-site-lifecycle).
