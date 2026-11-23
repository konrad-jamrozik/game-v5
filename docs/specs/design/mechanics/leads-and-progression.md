# Leads and Progression

| Metadata | Value |
| --- | --- |
| Spec ID | LEAD |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | What a Lead GDR describes, Lead discovery, Lead availability, Lead status, the effect of completing a Lead, the Initiative operation level, and the Initiative levels won that raise the Contracting cap. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Leads are how the Agency closes in on a Faction. A Lead is a Game Data Record (GDR) that describes one line of inquiry, usually into one Faction. Completing an Investigation of it can create one Initiative Mission site targeting that Faction, end that Faction for good, open Contracting to the Agency, or win the Campaign; a Lead may also do none of these and matter only because completing it uncovers the next Lead.

The player sees a Lead once it is discovered, and from then on sees whether it is available, i.e. whether it can be investigated now. The player never sees why: game data holds a Condition that discovers the Lead and a Condition for whether its Mission site can exist at all. A discovered Lead stays discovered for the rest of the Campaign.

By default a Lead that creates a Mission site can be investigated again until a Mission from it is Won, and a Lead that creates none is completed once. Its Lead status tells the player which of three things is true: it can be investigated, it cannot for now, or it never can again.

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Required progress | The [progress points](domain-model.md#leads-investigations-mission-sites-and-missions) an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) of a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) needs at least to complete, set by the Lead's `required_progress`. | Lead difficulty; resistance |
| Discovered Lead | A Lead the player has [learned of](#lead-discovery). Only a discovered Lead is Player-visible, and a Lead once discovered stays discovered. |  |
| Completed Lead | A Lead with at least one Completed Investigation, i.e. whose [completion count](#missions-from-a-lead) is at least 1. | Investigated Lead; successfully investigated Lead. An Abandoned or Active Investigation has also investigated its Lead. |
| Initiative operation level | How far into a [Faction](domain-model.md#factions)'s Initiative Missions a Lead or an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) lies: a whole number [derived](#initiative-operation-level) from the [Game build](../foundation/core-concepts.md#game-build-and-content)'s Leads. The first Initiative Mission site the [Agency](domain-model.md#agency-and-agents) can reach against a Faction has level 1, and each one reachable only after winning another has a higher level. | Initiative level; Mission site level |
| Initiative levels won | The number of [distinct Initiative operation levels](#contracting-cap-growth) at which the [Agency](domain-model.md#agency-and-agents) has Won at least one [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) at an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), against whatever Faction. |  |
| Lead status | The Player-visible summary of a discovered Lead's availability: [Available, Inactive, or Archived](#lead-status). |  |

# Lead GDRs

A Lead is one [GDR](../foundation/core-concepts.md#game-build-and-content), which never changes during a [Campaign](../foundation/core-concepts.md#campaign-and-session) and has no lifecycle states. Everything that changes about a Lead is read from the Investigations of it, the Missions from it, its Faction, and the set of discovered Leads.

## Lead

A Lead describes one line of inquiry, from when the player learns of it to what completing it does.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the Lead. | [Player-visible information](#player-visible-information) |
| `description` | The display description of the Lead. | [Player-visible information](#player-visible-information) |
| `faction` | Optional: the FactionArchetype of the [Faction](domain-model.md#factions) the Lead concerns, called the Faction of the Lead. A Lead without it concerns no Faction. A Lead must have it when its `on_completion` holds a `create_mission_site` or an `eliminate_faction` [Effect](../foundation/effect-lists.md#glossary), and when its `discovered_when` uses `mission_won` or `mission_won_with_enemy`, because each of these needs a Faction. | [Lead discovery](#lead-discovery); [Lead availability](#lead-availability); [Completion effect](#completion-effect) |
| `required_progress` | The Required progress of the Lead: a whole number of progress points of at least 1. | [Investigations](investigations.md) |
| `discovered_when` | Optional: the [Condition](../foundation/conditions.md#glossary) that discovers the Lead. It may use the [Condition kinds](../foundation/conditions.md#glossary) [`mission_won`](missions.md#mission-won-condition-kind), [`mission_won_with_enemy`](missions.md#mission-won-with-enemy-condition-kind), and [`lead_completed`](#lead-completed-condition-kind). A Lead without it is discovered from campaign creation. | [Lead discovery](#lead-discovery) |
| `investigate_again` | Optional: `never`, `until_mission_won`, or `always`, i.e. whether the Lead can be investigated again after an Investigation of it is Completed. `until_mission_won` is allowed only for a Lead that creates a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), because only such a Lead has a Mission to win. A Lead without the property has `until_mission_won` when it creates a Mission site and `never` when it creates none. | [Lead availability](#lead-availability) |
| `on_completion` | Optional: the [Effect list](../foundation/effect-lists.md#glossary) applied when an Investigation of the Lead completes. It may hold Effects of the kinds `create_mission_site`, `eliminate_faction`, `unlock_contracting`, and `win_campaign`. | [Completion effect](#completion-effect) |

A Lead creates a Mission site when its `on_completion` holds a `create_mission_site` Effect.

# Missions from a Lead

[Lead availability](domain-model.md#leads-investigations-mission-sites-and-missions) and the Initiative operation level both depend on which Mission sites and Missions came from which Lead, and on how often a Lead has been completed.

A Mission site is created by a Lead L when it is an Initiative Mission site whose [origin Investigation](domain-model.md#how-concepts-relate) is an Investigation of L, and a Mission is from L when its Mission site was created by L. The completion count of a Lead is the number of Completed Investigations of it, a [Derived value](../foundation/core-concepts.md#value-classification).

## Lead completed Condition kind

Game data asks whether a Lead has been completed through one Condition kind, so that one Lead can open the way to another.

The [Condition kind](../foundation/conditions.md#condition-kinds) `lead_completed` is defined as follows:

- **Value:** the identifier of a Lead.
- **When it holds:** when that Lead is a Completed Lead in the [World state](../foundation/engine-contract.md#player-actions-and-turns) in which the Condition is evaluated.
- **Supplied inputs:** none.

# Lead discovery

A Lead is hidden until the player has earned the knowledge of it, and what the player has learned is never taken away again.

Which Leads are discovered is a Campaign-wide [Authoritative value](../foundation/core-concepts.md#value-classification): the set of discovered Leads, held in the [Retired world state](../foundation/campaign-state.md#glossary). The `discovered_when` of every Lead not yet in the set is [evaluated](../foundation/conditions.md#evaluating-a-condition) in the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) and in the World state that every [Player action](../foundation/engine-contract.md#player-actions-and-turns) and every Advance turn produces, and a Lead joins the set in the first of these in which its `discovered_when` holds. The evaluation supplies the Faction of the Lead to every `mission_won` and `mission_won_with_enemy` Condition.

Discovery reads only `discovered_when`, and it is permanent: a discovered Lead stays discovered when its `discovered_when` stops holding, when its Faction becomes [Eliminated](domain-model.md#factions), and when it can never be investigated again. E.g., a Lead whose `discovered_when` first holds once its Faction is already Eliminated is still discovered, with the Lead status Archived.

# Initiative operation level

The Agency reaches a Faction's harder Initiative Mission sites by winning easier ones first, because a Won Mission discovers the Leads that lead on, unless a Won [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions) against an [Enemy](domain-model.md#combat) met further along gives it a shortcut. The Initiative operation level counts the steps along the Leads, so that an interface, an [Autopilot AI](../foundation/engine-contract.md#principals-and-access), and balancing tools can tell how far along a Lead or a Mission site is without reading the Conditions that discover Leads.

The Initiative operation level is a Derived value of the [Game build](../foundation/core-concepts.md#game-build-and-content): it is calculated from the Lead and MissionSiteArchetype GDRs alone and reads no Campaign state. Three things have one:

- **A Lead:** its Required level plus 1 when it creates a Mission site, and its Required level when it creates none. The Required level of a Lead L is the Required level of its `discovered_when`, or 0 for a Lead without `discovered_when`, i.e. the highest Initiative operation level of an [Initiative Mission](domain-model.md#leads-investigations-mission-sites-and-missions) that must be Won before L can be discovered without a shortcut through a Won Response Mission.
- **An Initiative Mission site:** the Initiative operation level of the Lead that [created it](#missions-from-a-lead).
- **A MissionSiteArchetype of kind initiative:** the lowest Initiative operation level among the Leads whose `create_mission_site` Effect names it, of whatever Faction, i.e. the earliest level at which a Mission site of it can be created.

The Required level of a Condition follows from its [form](../foundation/conditions.md#condition-format):

| Condition | Required level |
| --- | --- |
| `lead_completed` naming Lead M | The Required level of M. Completing M does not require winning a Mission from M, so the Mission site M creates adds nothing. |
| `mission_won` naming a MissionSiteArchetype of kind initiative | The lowest Initiative operation level among the Leads of the Faction of L whose `create_mission_site` Effect names that MissionSiteArchetype. |
| `mission_won` naming a MissionSiteArchetype of kind response | 0, because a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) needs no Initiative Mission to be Won first. |
| `mission_won_with_enemy` naming EnemyArchetype E | The lowest of the Required levels that a `mission_won` would have for each MissionSiteArchetype of kind initiative whose `enemies` has E as a key, so that the level measures where E is first met along the Faction's Leads. A MissionSiteArchetype of kind response that has E adds nothing, because a Won Response Mission there is a shortcut past the level. It is 0 when only MissionSiteArchetypes of kind response have E, and it has none when no MissionSiteArchetype has E. |
| `all` | The highest Required level of its Conditions, or 0 for an empty list. |
| `any` | The lowest Required level of its Conditions. |
| `not` | 0, because a `not` can hold before any Mission is Won. |

The values are calculated together: every Lead starts with no value, and the rules above are applied to every Lead again and again until no value changes. A value that reads a Lead or a Condition still without a value has none itself, the lowest of several values ignores those without one, and an `any` whose Conditions all have none has none. A Lead left without a value, e.g. one whose `discovered_when` requires the Lead itself, has no Initiative operation level, and neither has a MissionSiteArchetype of kind initiative that no Lead with a value creates.

E.g., a Lead `rumours` without `discovered_when` creates no Mission site, so its level is 0. A Lead `find_courier`, discovered by `lead_completed: rumours`, creates a Mission site of `catch_courier`: its Required level is 0, and it and its Mission sites have level 1. A Lead `question_courier`, discovered by `mission_won: catch_courier`, creates no Mission site, so its Required level and its level are 1. A Lead `find_depot`, discovered by `lead_completed: question_courier`, creates a Mission site of `raid_depot`, so it and its Mission sites have level 2.

**Informative rationale:** Taking the highest Required level of `all` follows the Game designer's rule that a Mission site's level is one more than the highest level among everything it requires. Taking the lowest level for `any` and for a MissionSiteArchetype that several Leads create gives the earliest point at which the Agency can reach a Lead or meet a Mission site, which is what both prioritizing Leads and balancing a Mission site's Enemies need. The level is calculated from GDRs rather than recorded in them, so a Content designer who reorders a chain cannot leave a stale level behind.

## Contracting cap growth

Each new depth the Agency reaches in its fight against the Factions opens more paid work to its Agents, but only the first time anyone reaches it, so that fighting the same tier of a second Faction adds nothing.

The Initiative levels won is a Derived value of the Agency, and it is the W in the [formula](economy-and-upgrades.md#contracting-cap) of the [Contracting cap](economy-and-upgrades.md#glossary). A second Won Mission at a level already counted adds nothing to it, whichever Faction that Mission targets.

E.g., once Missions are Won at Initiative Mission sites of level 1 against two Factions and at one of level 2 against one of them, the Initiative levels won is 2.

## Reading Initiative operation levels

A user interface and an Autopilot AI read the levels rather than derive them, and a balancing tool reads the levels that the player cannot see.

[Player API](../foundation/engine-contract.md#api-surfaces) returns every discovered Lead and every Initiative Mission site together with its level. In [Developer API](../foundation/engine-contract.md#api-surfaces), `developer.queries.getInitiativeOperationLevels()` reports the level of every Lead and of every MissionSiteArchetype of kind initiative that the Game build of the [Current campaign](../foundation/core-concepts.md#campaign-and-session) supplies, discovered or not, and names each one that has none.

# Lead availability

A Lead is available when it can be investigated now. Availability is a Derived value read from one World state: an Investigation of a Lead can be [started](investigations.md#starting-an-investigation) only while the Lead is available, and an Active one is [interrupted](investigations.md#lead-no-longer-available) once it is not.

A Lead L is available when all five of these conditions hold:

| Condition | It holds when |
| --- | --- |
| 1. Discovered | L is a [discovered Lead](#lead-discovery). |
| 2. May be investigated again | The `investigate_again` of L allows another Investigation. |
| 3. No [Unfinished Mission site](missions.md#glossary) | No Mission site [created by L](#missions-from-a-lead) is an Unfinished Mission site. |
| 4. Its Mission site can exist | L creates no Mission site, or a Mission site of the MissionSiteArchetype that the `create_mission_site` Effect of L names, targeting the Faction of L, [can exist](missions.md#whether-a-mission-site-can-exist). |
| 5. Its Faction is not Eliminated | L has no `faction`, or the Faction of L is not [Eliminated](domain-model.md#factions). |

Condition 3 makes the Agency finish with one Mission site of a Lead before it can seek the next. Condition 2 depends on the value of `investigate_again`:

| `investigate_again` | It allows another Investigation when | What it means for the player |
| --- | --- | --- |
| `never` | No Investigation of L is Completed. | The Lead is completed once. When it creates a Mission site, the player gets that one Mission site and one attempt at it, whatever becomes of it. |
| `until_mission_won` | No Mission from L is Won. | After an Expired Mission site or a Lost Mission the Lead can be investigated again for a new Mission site; after a Won Mission it never can. |
| `always` | Always. | The Lead can be completed, and its Mission Won, any number of times. |

Availability does not read whether L already has an Active Investigation, which only [starting an Investigation](investigations.md#one-active-investigation-per-lead) checks.

# Lead status

Every discovered Lead has exactly one Lead status, a Derived value that tells the player whether a Lead that cannot be investigated now is gone for good or only for now. The first row of this table that holds decides it:

| Lead status | It holds when | Meaning for the player |
| --- | --- | --- |
| Archived | Condition 2 or condition 5 of [Lead availability](#lead-availability) does not hold. | The Lead can never be investigated again, because neither cause ever ends. |
| Inactive | The Lead is not available. | The Lead cannot be investigated now, e.g. because a Mission site it created is unfinished, and it may become Available again. |
| Available | The Lead is available. | The Lead can be investigated now. |

Only the two causes of Archived count as permanent: a Lead whose Mission site cannot exist is Inactive even when that will in practice never change.

# Completion effect

Completing a Lead is what moves the Campaign on: its Effects create the next Mission site, end a Faction, open [Contracting](agents-spec.md#assignments), or win the Campaign.

When an Investigation of a Lead L [completes](investigations.md#completion), the Effect list `on_completion` of L is [applied](../foundation/effect-lists.md#applying-an-effect-list), once for each completion and whether or not L is still available at that moment. The completion supplies these inputs to its Effects:

| Effect kind | Defined by | Supplied by the completion |
| --- | --- | --- |
| `create_mission_site` | [Mission site Effect kind](missions.md#mission-site-effect-kind) | The origin Investigation, i.e. the Investigation of L that completed, and the target Faction, i.e. the Faction of L. |
| `eliminate_faction` | [Elimination](factions.md#elimination) | The Faction to make Eliminated, i.e. the Faction of L. |
| `unlock_contracting` | [Contracting Effect kind](economy-and-upgrades.md#contracting-effect-kind) | Nothing. |
| `win_campaign` | [Victory Effect kind](panic-and-endings.md#victory-effect-kind) | Nothing. |

A completion makes L a Completed Lead whatever its `on_completion` holds; e.g., completing a Lead that questions a captured Enemy creates no Mission site and discovers the Lead that locates the next Mission site.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds the Leads discovered in it, i.e. every Lead that joined the set of discovered Leads in that Advance turn, each by its GDR identifier, in the [authored order](../foundation/game-data-records.md#gdr-file-layout) of the Lead GDRs. The [History entry](../foundation/world-history.md#glossary) of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) the Advance turn ends holds the same list.

# Player-visible information

The player is told what a Lead is and whether it can be investigated, and never why.

For every discovered Lead, from the World state in which it is discovered, the following are [Player-visible information](../foundation/player-api.md#player-visible-information): its `name`, `description`, `faction`, `investigate_again`, and `on_completion`; the MissionSiteArchetype it creates, with the properties that [Missions](missions.md#player-visible-information) makes visible; whether it is available; its Lead status; its completion count; and its Initiative operation level, or that it has none. Its `required_progress` is visible only once [Assessment](investigations.md#assessment) reveals it. The Initiative operation level of every Initiative Mission site, the Initiative levels won, and the Leads discovered in an Advance turn are visible too.

The player never sees the `discovered_when` of a Lead or whether it or any part of it holds, which of the five conditions of [Lead availability](#lead-availability) hold for a Lead, or the Initiative operation level of an undiscovered Lead or of a MissionSiteArchetype as such. The rejection of a Player action for a Lead that is not available says only that the Lead is not available. An undiscovered Lead is hidden completely: Player API returns neither the Lead nor any of its values, nor whether or how many undiscovered Leads exist.

# TODOs

- TODO: Decide whether the Turn report holds the Faction that a Lead's completion made Eliminated, and the Campaign that a Lead's completion won, as it holds both for a Won Mission; today the player learns of them only from the Faction and from the [Campaign ending](domain-model.md#campaign-standing).
- TODO (later): In [Lead availability](#lead-availability), Leads that expire and appear again while they are not investigated. The Game designer's notes are in [Lead repeatability](../../../design-notes/lead-repeatability.md).
- TODO (later): Further Condition kinds that the `discovered_when` of a [Lead](#lead) may use, e.g. that the Agency holds an item.
- TODO (later): Further [Effect kinds](../foundation/effect-lists.md#glossary) for the [Completion effect](#completion-effect), e.g. a Lead completion that gives information, money, funding, Agent improvement, or a Campaign objective directly.
