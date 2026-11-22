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

These terms are specific to [Leads](domain-model.md#leads-investigations-mission-sites-and-missions). [Lead availability](domain-model.md#leads-investigations-mission-sites-and-missions) and other general terms are in the [Domain Model glossary](domain-model.md#glossary).

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Required progress | The [progress points](domain-model.md#leads-investigations-mission-sites-and-missions) an [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) of a Lead needs at least to complete, set by the Lead's `required_progress`. | Lead difficulty; resistance |
| Discovered Lead | A Lead the player has learned of, under [Lead discovery](#lead-discovery). Only a discovered Lead is Player-visible, and a Lead once discovered stays discovered. |  |
| Completed Lead | A Lead with at least one Completed Investigation, i.e. whose completion count is at least 1, under [Missions from a Lead](#missions-from-a-lead). | Investigated Lead; successfully investigated Lead. An Abandoned or Active Investigation has also investigated its Lead. |
| Initiative operation level | How far into a [Faction](domain-model.md#factions)'s Initiative Missions a Lead or an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) lies: a whole number derived from the [Game build](../foundation/core-concepts.md#game-build-and-content)'s Leads, under [Initiative operation level](#initiative-operation-level). The first Initiative Mission site the [Agency](domain-model.md#agency-and-agents) can reach against a Faction has level 1, and each one reachable only after winning another has a higher level. | Initiative level; Mission site level |
| Initiative levels won | The number of distinct Initiative operation levels at which the [Agency](domain-model.md#agency-and-agents) has Won at least one [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) at an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), against whatever Faction, under [Contracting cap growth](#contracting-cap-growth). |  |
| Lead status | The Player-visible summary of a discovered Lead's availability: Available, Inactive, or Archived, under [Lead status](#lead-status). |  |

# Lead GDRs

The [GDRs](../foundation/core-concepts.md#game-build-and-content) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [GDRs](../content/gdrs.md) and the YAML files it names.

## Lead

A Lead describes one line of inquiry. A Lead is a [GDR](../foundation/core-concepts.md#game-build-and-content) serving the Referenced GDR and Key for campaign facts purposes under [Game concepts](domain-model.md#game-concepts) in Domain Model; it is not a [Campaign instance](../foundation/core-concepts.md#campaign-instances), and a Lead's GDR never changes during a [Campaign](../foundation/core-concepts.md#campaign-and-session). A Lead has no lifecycle states. The table below is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Shape | Meaning | Read by |
| --- | --- | --- | --- |
| `name` | Non-empty text. | The display name of the Lead. | [Player-visible information](#player-visible-information) |
| `description` | Non-empty text. | The display description of the Lead. | [Player-visible information](#player-visible-information) |
| `faction` | Optional: the identifier of a FactionArchetype. | The [Faction](domain-model.md#factions) the Lead concerns: the Faction whose [Archetype](../foundation/core-concepts.md#campaign-instances) is this FactionArchetype. It is the target Faction of a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) the Lead creates and the Faction that an `eliminate_faction` [Effect](../foundation/effect-lists.md#glossary) of the Lead makes [Eliminated](domain-model.md#factions), and the Lead can never be investigated again once that Faction is Eliminated. A Lead without it concerns no Faction. | [Lead availability](#lead-availability); [Completion effect](#completion-effect) |
| `required_progress` | A whole number of at least 1. | The Required progress of the Lead, in progress points. | [Investigations](investigations.md) |
| `discovered_when` | Optional: a [Condition](../foundation/conditions.md#glossary). | The Condition that discovers the Lead, under [Lead discovery](#lead-discovery). A Lead without it is discovered from campaign creation. | [Lead discovery](#lead-discovery) |
| `investigate_again` | Optional: `never`, `until_mission_won`, or `always`. A Lead without it has `until_mission_won` when its `on_completion` creates a Mission site, and `never` when it does not. | Whether the Lead can be investigated again after an Investigation of it is Completed, under [Lead availability](#lead-availability). | [Lead availability](#lead-availability) |
| `on_completion` | Optional: an [Effect list](../foundation/effect-lists.md#glossary) that may hold one [Effect](../foundation/effect-lists.md#glossary) of each of the [Effect kinds](../foundation/effect-lists.md#glossary) `create_mission_site`, `eliminate_faction`, `unlock_contracting`, and `win_campaign`. A Lead without it has an empty Effect list. | What happens when an Investigation of the Lead completes, under [Completion effect](#completion-effect). | [Completion effect](#completion-effect) |

`discovered_when` may use the [Condition kinds](../foundation/conditions.md#glossary) `mission_won`, under [Mission won Condition kind](missions.md#mission-won-condition-kind) in Missions, and `lead_completed`, under [Lead completed Condition kind](#lead-completed-condition-kind). The value of a `create_mission_site` Effect is the identifier of a MissionSiteArchetype of kind initiative, and applying it creates one [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), under [Mission site Effect kind](missions.md#mission-site-effect-kind) in Missions. `eliminate_faction` is defined under [Elimination](factions.md#elimination) in Factions, `unlock_contracting` under [Contracting Effect kind](economy-and-upgrades.md#contracting-effect-kind) in Economy and Upgrades, and `win_campaign` under [Victory Effect kind](panic-and-endings.md#victory-effect-kind) in Panic and Endings.

A Lead names its Faction, a MissionSiteArchetype it creates, and every GDR its Condition names by GDR identifier, never by inference from identifier text, under [References](../foundation/campaign-instances.md#references) in Campaign Instances.

## Lead GDR validation

The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the Lead [Type](../foundation/core-concepts.md#data-modeling), and it adds to [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation) in Missions and [Faction GDR validation](factions.md#faction-gdr-validation) in Factions. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **Known properties:** Each Lead has `name`, `description`, and `required_progress`, may have `faction`, `discovered_when`, `investigate_again`, and `on_completion`, and has no other property, apart from `id` and `type`. Its `name` and `description` are non-empty text.
2. **Faction resolves:** `faction`, when present, is the identifier of a FactionArchetype the Game build supplies.
3. **Required progress is valid:** `required_progress` is a whole number of at least 1.
4. **Discovery Condition is valid:** `discovered_when`, when present, is a valid Condition, under [Condition format](../foundation/conditions.md#condition-format) in Conditions, that uses no Condition kind other than `mission_won` and `lead_completed`, each with a value its Condition kind permits. The `discovered_when` of a Lead without `faction` uses no `mission_won` Condition, because that Condition kind needs the Faction of the Lead as its supplied input.
5. **Completion effect is valid:** `on_completion`, when present, is a valid Effect list, under [Effect list format](../foundation/effect-lists.md#effect-list-format) in Effect Lists, that holds no Effect of a kind other than `create_mission_site`, `eliminate_faction`, `unlock_contracting`, and `win_campaign`, and at most one Effect of each. The value of a `create_mission_site` Effect is the identifier of a MissionSiteArchetype the Game build supplies whose `kind` is `initiative`, as its Effect kind requires; naming a MissionSiteArchetype of kind response is invalid. A Lead whose `on_completion` holds a `create_mission_site` Effect or an `eliminate_faction` Effect has `faction`.
6. **Investigate again is valid:** `investigate_again`, when present, is exactly `never`, `until_mission_won`, or `always`. It is `until_mission_won` only for a Lead whose `on_completion` holds a `create_mission_site` Effect, because only such a Lead has a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) to win.

These rules guarantee that every Lead that creates a Mission site or eliminates a Faction has exactly one Faction, and that the [Completion effect](#completion-effect) supplies a MissionSiteArchetype of kind initiative, as [Mission site creation](missions.md#mission-site-creation) requires of its creating rule. No rule examines whether a Condition can ever hold: a Lead whose `discovered_when` never holds is valid and is never discovered, e.g. a Lead whose Condition requires the Lead itself to be a Completed Lead. A Lead whose `on_completion` is empty is valid: completing it changes nothing by itself, and it matters through the `lead_completed` Conditions that name it.

# Missions from a Lead

A Mission site is created by a Lead L exactly when it is an Initiative Mission site whose origin Investigation, under [Mission site properties](missions.md#mission-site-properties) in Missions, is an Investigation of L, i.e. retains a reference to L under [How concepts relate](domain-model.md#how-concepts-relate) in Domain Model. A [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) is created by no Lead. A [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) is from Lead L exactly when its Mission site was created by L.

[Lead availability](#lead-availability) reads the Investigations, the Missions, and their Mission sites, which are [retained](../foundation/world-history.md#glossary) for the whole Campaign with their final lifecycle states, under [Mission properties](missions.md#mission-properties) in Missions. A Won Mission stays Won and a Completed Investigation stays Completed for the rest of the Campaign, even if the Faction of the Lead later becomes Eliminated.

A Lead's completion count, i.e. the number of Completed Investigations of the Lead, is a [Derived value](../foundation/core-concepts.md#value-classification) calculated from Investigation Campaign instances. A Lead whose completion count is at least 1 is a Completed Lead. Whether a Lead is a Completed Lead is a Derived value too, and once true it stays true for the rest of the Campaign, because Completed Investigations are retained.

## Lead completed Condition kind

Game data asks whether a Lead has been completed through one Condition kind, so that one Lead can open the way to another.

The Condition kind `lead_completed` is defined as follows, under [Condition kinds](../foundation/conditions.md#condition-kinds) in Conditions:

- **Value:** the identifier of a Lead the Game build supplies. The identifier of no Lead is invalid.
- **When it holds:** exactly when that Lead is a Completed Lead in the [World state](../foundation/engine-contract.md#player-actions-and-turns) in which the Condition is evaluated. Once it holds it holds for the rest of the Campaign.
- **Supplied inputs:** none.

# Lead discovery

A Lead is hidden until the player has earned the knowledge of it, and what the player has learned is never taken away again.

Which Leads are discovered is a Campaign-wide [Authoritative value](../foundation/core-concepts.md#value-classification): the set of discovered Leads, each by its GDR identifier. The set has no order of its own, and no rule reads one, so an Implementation that stores it as a list may keep it in any order. It belongs to the [Retired world state](../foundation/campaign-state.md#glossary) of every World state, because a Lead in it never leaves it. The following rules are complete:

- **Becoming discovered:** A Lead L joins the set in the first World state in which its `discovered_when` holds, under [Evaluating a Condition](../foundation/conditions.md#evaluating-a-condition) in Conditions. The evaluating rule supplies the Faction whose Archetype is the FactionArchetype named by the `faction` of L to every `mission_won` Condition; a Lead without `faction` has no such Condition, under [Lead GDR validation](#lead-gdr-validation). A Lead without `discovered_when` is in the set of the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session).
- **When it is evaluated:** `discovered_when` is evaluated for every Lead not yet in the set in the initial Campaign state and in the World state that every [Player action](../foundation/engine-contract.md#player-actions-and-turns) and every Advance turn produces. Within an Advance turn only the World state it produces counts.
- **Permanent:** No rule removes a Lead from the set. A discovered Lead stays discovered when its `discovered_when` stops holding, when its Faction becomes Eliminated, and when it can never be investigated again.
- **Hidden until then:** An undiscovered Lead is not Player-visible, under [Player-visible information](#player-visible-information), and is never available.

In scope only a Won Mission and a Completed Investigation can make a Condition hold that did not, and both happen during Advance turn, so a Lead becomes discovered only at campaign creation or in an Advance turn.

# Initiative operation level

The Agency reaches a Faction's harder Initiative Mission sites only by winning easier ones first, because a Won Mission discovers the Leads that lead on. The Initiative operation level counts those steps, so that an interface, an [Autopilot AI](../foundation/engine-contract.md#principals-and-access), and balancing tools can tell how far along a Lead or a Mission site is without reading the Conditions that discover Leads.

The Initiative operation level is a [Derived value](../foundation/core-concepts.md#value-classification) of the [Game build](../foundation/core-concepts.md#game-build-and-content): it is calculated from the Lead and MissionSiteArchetype GDRs alone, reads no Campaign state, and so never changes during a [Campaign](../foundation/core-concepts.md#campaign-and-session). It is defined for the following three things, and this list is exhaustive:

- **A Lead:** for a Lead L that creates a Mission site, its Required level plus 1; for a Lead that creates none, its Required level. The Required level of L is the Required level of its `discovered_when`, under the table below, or 0 for a Lead without `discovered_when`. It is the highest Initiative operation level of an [Initiative Mission](domain-model.md#leads-investigations-mission-sites-and-missions) that must be Won before L can be discovered, and it counts only Initiative Missions against the Faction of L.
- **An Initiative Mission site:** the Initiative operation level of the Lead that created it, under [Missions from a Lead](#missions-from-a-lead).
- **A MissionSiteArchetype of kind initiative:** the lowest Initiative operation level among the Leads whose `create_mission_site` Effect names it, of whatever Faction, i.e. the earliest level at which a Mission site of it can be created.

The Required level of a Condition is calculated from its form, under [Condition format](../foundation/conditions.md#condition-format) in Conditions. This table is exhaustive for the Condition kinds a `discovered_when` may use.

| Condition | Required level |
| --- | --- |
| `lead_completed` naming Lead M | The Required level of M. Completing M does not require winning a Mission from M, so the Mission site M creates adds nothing. |
| `mission_won` naming a MissionSiteArchetype of kind initiative | The lowest Initiative operation level among the Leads of the Faction of L whose `create_mission_site` Effect names that MissionSiteArchetype. |
| `mission_won` naming a MissionSiteArchetype of kind response | 0, because a Response Mission site needs no Initiative Mission to be Won first. |
| `all` | The highest Required level of its Conditions, or 0 for an empty list. |
| `any` | The lowest Required level of its Conditions. |
| `not` | 0, because a `not` can hold before any Mission is Won. |

The values are calculated together: every Lead starts with no value, and the equations above are applied to every Lead again and again until no value changes. A value that reads a Lead or Condition still without a value has none itself, the lowest of several values ignores those without one, and an `any` whose Conditions all have none has none. Values only fall while they are calculated, so the calculation ends. A Lead left without a value, e.g. one whose `discovered_when` requires the Lead itself, or one that needs a Won Mission at a MissionSiteArchetype no Lead of its Faction creates, has no Initiative operation level, and neither has a MissionSiteArchetype of kind initiative that no Lead with a value creates. The Initiative operation level depends on no random outcome and on no [Campaign configuration](../foundation/core-concepts.md#campaign-and-session) setting.

These rules guarantee that the Initiative operation level of a Lead that creates a Mission site, of every Initiative Mission site, and of every MissionSiteArchetype that has one is at least 1, and that of a Lead that creates none is at least 0. They also guarantee that a Lead or Initiative Mission site of level N, for N of at least 2, cannot be discovered or created before a Mission at an Initiative Mission site of level N − 1 against the same Faction is Won. A `not` and a `mission_won` naming a MissionSiteArchetype of kind response add nothing to the level, so the guarantee holds however a `discovered_when` is written.

E.g., with the GDRs, `locate_red_dawn_member` is discovered once `criminal_organizations`, which needs no Won Mission, is completed, so its Required level is 0 and it and its `apprehend_member` Mission sites have level 1. `interrogate_red_dawn_member` is discovered by a Won Mission at `apprehend_member` and has level 1, as has `red_dawn_profile`, discovered by its completion. `locate_red_dawn_safehouse` is discovered by the completion of `red_dawn_profile`, so its Required level is 1 and it and its `raid_safehouse` Mission sites have level 2.

**Informative rationale:** Taking the highest Required level of `all` follows the Game designer's rule that a Mission site's level is one more than the highest level among everything it requires. Taking the lowest level for `any` and for a MissionSiteArchetype that several Leads create gives the earliest point at which the Agency can reach a Lead or meet a Mission site, which is what both prioritizing Leads and balancing a Mission site's Enemies need. The level is calculated from GDRs rather than recorded in them, so a Content designer who reorders a chain cannot leave a stale level behind.

## Contracting cap growth

Each new depth the Agency reaches in its fight against the Factions opens more paid work to its Agents, but only the first time anyone reaches it, so that fighting the same tier of a second Faction adds nothing.

The Initiative levels won is a Derived value of the Agency, never stored, calculated from the retained Missions, under [Mission properties](missions.md#mission-properties) in Missions: the number of distinct whole numbers N such that at least one Mission is Won at an Initiative Mission site whose Initiative operation level is N. A Mission at a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) does not count, and neither does a second Won Mission at a level already counted, whichever Faction it targets, so the first win at each level counts once for the whole Campaign. A Won Mission stays Won, so the Initiative levels won never falls. It is the W of the formula under [Contracting cap](economy-and-upgrades.md#contracting-cap) in Economy and Upgrades, which raises the [Contracting cap](economy-and-upgrades.md#glossary) by `contracting_cap_per_initiative_level` for each level counted, but only once [Contracting](agents-spec.md#assignments) is unlocked: a level won before then counts from the moment Contracting is unlocked.

E.g., with the GDRs, once Missions are Won at `apprehend_member` against Red Dawn and against Exalt, which both have level 1, and at `raid_safehouse` against Red Dawn, which has level 2, the Initiative levels won is 2, so the Contracting cap is `4 + 4 × 2 = 12` once Contracting is unlocked and 0 before.

The value changes only in the Mission resolution step, the only step in which a Mission becomes Won, and every later step and Player action reads it as that step leaves it.

## Reading Initiative operation levels

The Initiative operation level reaches its readers through two API surfaces, under [API hierarchy](../foundation/engine-contract.md#api-hierarchy) in Engine Contract, and through no other:

- **[Player API](../foundation/engine-contract.md#api-surfaces):** the level of every discovered Lead and of every Initiative Mission site, under [Player-visible information](#player-visible-information), so that a user interface and an Autopilot AI read it rather than derive it. Each level is returned with the Lead or Mission site it belongs to, under [Current world state, Turn report, and history](../foundation/world-history.md#current-world-state-turn-report-and-history) in History and Turn Report: `player.queries.getCurrentRetiredWorldState()` returns the set of discovered Leads, because a Lead once discovered stays discovered, each Lead with its level; an Initiative Mission site is returned with its level by `player.queries.getCurrentLiveWorldState()` while it is in play and by `getCurrentRetiredWorldState()` once it is [Retired](../foundation/world-history.md#glossary).
- **[Developer API](../foundation/engine-contract.md#api-surfaces):** `developer.queries.getInitiativeOperationLevels()` reports the level of every Lead and of every MissionSiteArchetype of kind initiative the Game build of the [Current campaign](../foundation/core-concepts.md#campaign-and-session) supplies, discovered or not, and names each one that has none. It reads no Campaign state, so a balancing tool reads the levels of a Game build from any Campaign created from it. It is a query: it changes no Campaign state and is not a [Player action](../foundation/engine-contract.md#player-actions-and-turns).

# Lead availability

Whether a Lead is available, i.e. can be investigated now, is a Derived value, calculated from the World state in which it is read; it is never stored, and it is not a state. A Lead L creates a Mission site exactly when its `on_completion` holds a `create_mission_site` Effect. L is available exactly when all of the following five conditions hold. The list is exhaustive.

| Condition | It holds exactly when |
| --- | --- |
| 1. Discovered | L is a discovered Lead, under [Lead discovery](#lead-discovery). |
| 2. May be investigated again | The `investigate_again` of L allows another Investigation, under the table below. |
| 3. No [Unfinished Mission site](missions.md#glossary) | No Mission site created by L is an [Unfinished Mission site](missions.md#glossary). It always holds for a Lead that creates no Mission site. |
| 4. Its Mission site can exist | L creates no Mission site, or a Mission site of the MissionSiteArchetype that the `create_mission_site` Effect of L names, targeting the Faction of L, can exist, under [Whether a Mission site can exist](missions.md#whether-a-mission-site-can-exist) in Missions. |
| 5. Its Faction is not Eliminated | L has no `faction`, or the Faction of L is not Eliminated. |

For a Lead that creates a Mission site, condition 4 already requires that its Faction is not Eliminated; condition 5 states the same for every Lead that has a Faction.

`investigate_again` allows another Investigation as follows. This table is exhaustive.

| `investigate_again` | It allows another Investigation exactly when | What it means for the player |
| --- | --- | --- |
| `never` | No Investigation of L is Completed. | One completed Investigation. For a Lead that creates a Mission site, that is one Mission site, whatever becomes of it: the player gets one attempt. |
| `until_mission_won` | No Mission from L is Won. | After an Expired Mission site or a Lost Mission the Lead can be investigated again; after a Won Mission it never can. Only a Lead that creates a Mission site has it. |
| `always` | Always. | The Lead can be completed any number of times; for a Lead that creates a Mission site, its Mission can be Won any number of times. |

No condition reads whether L has an Active Investigation: whether a Lead that already has one can be investigated again is decided under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead). The availability of a Lead is read by the Player action that starts an Investigation of the Lead, under [Starting an Investigation](investigations.md#starting-an-investigation), and by the rule that ends an Investigation whose Lead stops being available, under [Lead no longer available](investigations.md#lead-no-longer-available). Availability has no timing of its own: it is true or false in every World state.

## What changes availability

A Lead's availability changes over a Campaign as its Investigations complete, as the Mission sites it created resolve, as its Faction is Eliminated, and as the Mission site it leads to becomes able or unable to exist.

The following table states what each situation does to a discovered Lead L. It assumes that the conditions a row does not mention keep the values they had. The table is exhaustive for what changes a condition of a discovered Lead.

| Situation | Conditions that change | Result for L |
| --- | --- | --- |
| An Investigation of L becomes Completed, and L creates no Mission site | With `never`, 2 stops holding for good. | Never available again with `never`. Still available with `always`, if condition 5 holds. |
| An Investigation of L becomes Completed, and its [Completion effect](#completion-effect) creates a Mission site | 3 stops holding. With `never`, 2 stops holding for good. | Not available while that Mission site is Active or its Mission is [Deployed](agents-spec.md#assignments). |
| The Mission at that Mission site becomes Lost, or that Mission site becomes Expired | 3 holds again. | Available again with `until_mission_won` or `always`, if condition 4 holds. Never available again with `never`. |
| The Mission at that Mission site becomes Won | 3 holds again. With `until_mission_won`, 2 stops holding for good. | Available again only with `always`, if condition 4 holds. |
| That Mission site becomes Cancelled | 3 holds again; 4 does not hold, because a Mission site is Cancelled only when it cannot exist. | Not available. |
| The Faction of L becomes Eliminated | 5 stops holding, for good, and so does 4 when L creates a Mission site. | Not available for the rest of the Campaign. |
| The `can_exist_when` of the MissionSiteArchetype starts or stops holding | 4 starts or stops holding, if the Faction of L is not Eliminated. | Available or not available accordingly. |

A situation not listed changes none of the conditions of a discovered Lead. In particular, an Investigation of L that is abandoned changes no condition of L.

**Consequences.** Together the rules make the following hold:

- With `until_mission_won`, a Lost Mission or an Expired Mission site never blocks its Lead for ever: the Lead is available again and the [Agency](domain-model.md#agency-and-agents) obtains a new Mission site from it by a new Investigation. A Mission site cannot be attempted twice, under [Mission site lifecycle](missions.md#mission-site-lifecycle).
- With `until_mission_won`, at most one Mission from a Lead is ever Won, and with `never`, a Lead is completed at most once, so at most one Mission site is ever created by it.
- At most one Mission site created by a Lead is an Unfinished Mission site in any World state, because an Investigation is started only for an available Lead and only one Investigation of a Lead is Active at a time.

# Lead status

Every discovered Lead has exactly one Lead status, a Derived value decided in the order of the following table, which is exhaustive. It tells the player whether a Lead that cannot be investigated now is gone for good or only for now.

| Lead status | It holds exactly when | Meaning for the player |
| --- | --- | --- |
| Archived | Condition 2 or condition 5 of [Lead availability](#lead-availability) does not hold, i.e. `investigate_again` no longer allows an Investigation or the Faction of L is Eliminated. | The Lead can never be investigated again. Neither cause ever ends. |
| Inactive | The Lead is not Archived and is not available. | The Lead cannot be investigated now, e.g. because a Mission site it created is unfinished. It may become Available again. |
| Available | The Lead is available. | The Lead can be investigated now, unless it already has an Active Investigation. |

An undiscovered Lead has no Lead status. A Lead that is Inactive because its Mission site cannot exist is Inactive even when that will in practice never change: only the two causes of Archived are known to be permanent. Lead status reads no Investigation: whether an Investigation of an Available Lead can be started now is decided under [One Active Investigation per Lead](investigations.md#one-active-investigation-per-lead) in Investigations.

# Completion effect

When an Investigation of a Lead L completes, the Effect list `on_completion` of L is applied, under [Applying an Effect list](../foundation/effect-lists.md#applying-an-effect-list) in Effect Lists. The completion itself, i.e. in which Advance turn an Investigation becomes Completed, is decided under [Completion](investigations.md#completion); it happens in the [Turn advancement step](domain-model.md#turn-advancement-steps) [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions), and every Effect of `on_completion` is applied once for that completion, in the same step. The following table states the complete effect of each Effect kind that `on_completion` may hold, and what this rule supplies to it. It is exhaustive.

| Effect kind | Complete effect | Supplied by this rule |
| --- | --- | --- |
| `create_mission_site` | It is the creating rule of an Initiative Mission site under [Mission site creation](missions.md#mission-site-creation) in Missions, which creates exactly one Initiative Mission site of the MissionSiteArchetype the Effect names, with the initial values, Enemies, and expiration that [Missions](missions.md) gives it. | The origin Investigation, i.e. the Investigation of L that completed, and the target Faction, i.e. the Faction of L. |
| `eliminate_faction` | The Faction of L is made Eliminated, under [Elimination](factions.md#elimination) in Factions. | The Faction to make Eliminated, i.e. the Faction of L. |
| `unlock_contracting` | The Agency's [Contracting unlocked](economy-and-upgrades.md#glossary) becomes yes, so its [Contracting cap](economy-and-upgrades.md#contracting-cap) is no longer 0, under [Contracting Effect kind](economy-and-upgrades.md#contracting-effect-kind) in Economy and Upgrades. | Nothing. |
| `win_campaign` | The Campaign is won in the Ending check step of the same Advance turn, under [Victory Effect kind](panic-and-endings.md#victory-effect-kind) in Panic and Endings. | Nothing. |

The Faction of L is the Faction whose Archetype is the FactionArchetype named by the `faction` of L, which exists and is exactly one under [Initial Factions](factions.md#initial-factions) in Factions; [Lead GDR validation](#lead-gdr-validation) guarantees that a Lead with either of the first two Effects has `faction`.

An empty `on_completion` changes nothing. The completion still makes L a Completed Lead, under [Missions from a Lead](#missions-from-a-lead), and that is what a `lead_completed` Condition of another Lead reads; e.g., completing a Lead that questions a captured Enemy creates no Mission site and discovers the Lead that locates the next Mission site.

No Effect depends on the availability of L at the moment of completion. A `create_mission_site` Effect creates one Mission site per completion, never more and never none; if the new Mission site cannot exist, [Missions](missions.md) cancels it at the end of the Turn advancement step Mission resolution of the same Advance turn, under [Cancellation](missions.md#cancellation), so no World state shows it Active. A Faction made Eliminated in this step is Eliminated for every later step of the same Advance turn: its Active Mission sites are Cancelled at the end of Mission resolution, under [Cancellation](missions.md#cancellation), it neither escalates nor operates in the Faction activity step, under [Faction activity](factions.md#faction-activity), and every Lead of it is Archived in the World state the Advance turn produces. The completion effect changes nothing else, and it spends nothing.

The Effect list applies once for each completion of an Investigation of L. Another completion of an Investigation of the same Lead applies it again, e.g. creates another Mission site.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds the Leads discovered in it: every Lead that is in the set of discovered Leads of the World state that Advance turn produces and not in that of the World state before it, each by its GDR identifier, in the authored order of the Lead GDRs, under [GDR file layout](../foundation/game-data-records.md#gdr-file-layout) in Game Data Records. E.g., with the GDRs, the Advance turn in which `criminal_organizations` completes lists `locate_red_dawn_member`, `locate_exalt_member`, and `locate_black_lotus_member`, in that order. The [History entry](../foundation/world-history.md#glossary) of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) the Advance turn ends holds the same list, unreduced. Both are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report. An Advance turn that discovers no Lead holds an empty list.

# Player-visible information

The player is told what a Lead is and whether it can be investigated, and never why.

Every value below is Player-visible information under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), for every discovered Lead, from the World state in which it is discovered, whether or not the Lead is available. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| Every discovered Lead, with these properties: `name`, `description`, `faction`, `investigate_again`, and `on_completion` | Yes |
| The `required_progress` of every discovered Lead | Yes once an Investigation of the Lead has reached the threshold under [Assessment](investigations.md#assessment) in Investigations; otherwise no |
| The MissionSiteArchetype that a discovered Lead creates, when it creates one, with the properties of that GDR that [Missions](missions.md) states are Player-visible | Yes |
| For each discovered Lead, whether it is available | Yes |
| For each discovered Lead, its [Lead status](#lead-status) | Yes |
| For each discovered Lead, its completion count | Yes |
| For each discovered Lead, its [Initiative operation level](#initiative-operation-level), or that it has none | Yes |
| For each [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), its Initiative operation level | Yes |
| The Initiative levels won | Yes |
| The Initiative operation level of an undiscovered Lead, and of a MissionSiteArchetype as such | No; Developer API reports them, under [Reading Initiative operation levels](#reading-initiative-operation-levels) |
| The Leads discovered in an Advance turn, under [Turn report](#turn-report) | Yes |
| The `discovered_when` of any Lead, and whether it or any part of it holds | No |
| Which of the five conditions of [Lead availability](#lead-availability) hold for a Lead | No |

The player therefore knows of each discovered Lead that it is Available, Inactive, or Archived, and is never told the cause. The player can still see facts that are Player-visible on their own, e.g. that a Mission site the Lead created is Active, under [Missions](missions.md), or that its Faction is Eliminated, under [Factions](factions.md). Whether an Investigation of a Lead can be started now, which also depends on whether the Lead already has an Active Investigation, is Player-visible under [Investigations](investigations.md).

An undiscovered Lead is hidden completely: Player API returns neither the Lead nor any of its values, nor whether or how many undiscovered Leads exist, and no other channel under [Information boundary](../foundation/player-api.md#information-boundary) in Player API reveals it, e.g. the rejection of a Player action naming it, under [Starting an Investigation](investigations.md#starting-an-investigation) in Investigations. The rejection of a Player action for a Lead that is not available says only that the Lead is not available.

**Unknown versus absent:** Apart from a `required_progress` that [Assessment](investigations.md#assessment) has not yet revealed, which is reported as unknown, no value the table above makes Player-visible is unknown to the player. An undiscovered Lead is absent, not unknown: it is left out of every result.

# Edge cases and failure behavior

- **Lead without `discovered_when`:** It is discovered from campaign creation, and available then if conditions 2 to 5 hold ([Lead discovery](#lead-discovery)).
- **Lead without `faction`:** It concerns no Faction, so condition 5 always holds for it and no Faction becoming Eliminated archives it. It creates no Mission site and eliminates no Faction, but it may unlock [Contracting](agents-spec.md#assignments) or win the Campaign ([Lead GDR validation](#lead-gdr-validation)).
- **Unlocking Contracting again:** A Lead that holds `unlock_contracting` and can be completed again changes nothing more on a later completion, because Contracting unlocked is already yes ([Completion effect](#completion-effect)).
- **Lead completed that creates no Mission site:** With `never`, which is its default, it is Archived at once and for good; the Leads whose `discovered_when` required it are discovered in the same World state ([Completion effect](#completion-effect), [Lead discovery](#lead-discovery)).
- **Lead that eliminates its own Faction:** Its completion makes the Faction Eliminated, so the Lead itself and every other Lead of that Faction are Archived in the World state that Advance turn produces ([Completion effect](#completion-effect), [Lead status](#lead-status)).
- **Lead whose Faction does not exist in the Campaign:** This cannot occur for a Game build that passes [Lead GDR validation](#lead-gdr-validation), because every `faction` names a FactionArchetype and the initial Campaign state has one Faction for each FactionArchetype. A World state in which it occurred would be an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.
- **Discovery Condition stops holding:** The Lead stays discovered, with the Lead status its availability gives it ([Lead discovery](#lead-discovery)).
- **Investigation completes in the same Advance turn in which the Faction is Eliminated:** The Turn advancement step Investigation progress precedes Mission resolution, under [Turn Advancement](turn-advancement.md). The Faction is not yet Eliminated in the earlier step, so the effect creates its Initiative Mission site, which is Active. In Mission resolution, a Won Mission then eliminates the Faction, and at the end of the step Missions cancels every Active Mission site that cannot exist, including the new one ([Completion effect](#completion-effect), [Cancellation](missions.md#cancellation)).
- **Lead stops being available while it is investigated:** Its Active Investigation is ended at the end of the Mission resolution step of the same Advance turn, under [Lead no longer available](investigations.md#lead-no-longer-available) in Investigations, so it never completes ([Lead availability](#lead-availability)).
- **One win discovers several Leads at once:** All Leads whose `discovered_when` holds after that win become discovered in that same World state, and the Turn report lists every one of them ([Lead discovery](#lead-discovery), [Turn report](#turn-report)).
- **Faction Eliminated before a Lead is discovered:** The `discovered_when` of the Lead can still come to hold, e.g. through a Won Mission in the same Advance turn that eliminates the Faction; the Lead is then discovered with Lead status Archived ([Lead discovery](#lead-discovery), [Lead status](#lead-status)).
- **Faction Eliminated after discovery:** The Lead stays Player-visible for the rest of the Campaign, with Lead status Archived ([Lead status](#lead-status)).
- **Undiscovered Lead named by a Player action:** The action is rejected as if no Lead had that identifier, under [Starting an Investigation](investigations.md#starting-an-investigation) in Investigations ([Player-visible information](#player-visible-information)).
- **Active or Abandoned Investigation:** Neither changes any condition of its Lead, and no Mission site is created ([What changes availability](#what-changes-availability)).
- **Lost then Won, with `until_mission_won`:** A Lead whose Mission was Lost and that is investigated again creates another Mission site. When the Mission there is Won, condition 2 stops holding; the earlier Lost Mission stays Lost and blocks nothing ([What changes availability](#what-changes-availability)).
- **One attempt, with `never`:** Once an Investigation of the Lead is Completed, the Lead is Archived at once, while the Mission site it created is still Active; the Mission site is unaffected ([Lead status](#lead-status)).
- **Won [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions):** It is from no Lead, because no Lead created its Mission site, so it changes condition 2 of no Lead; it can make a `mission_won` Condition hold, and so can discover a Lead ([Missions from a Lead](#missions-from-a-lead), [Lead discovery](#lead-discovery)).
- **A second win at one level:** A Mission Won at an Initiative Mission site of a level at which a Mission is already Won, against the same or another Faction, leaves the Initiative levels won, and so the Contracting cap, unchanged ([Contracting cap growth](#contracting-cap-growth)).
- **Mission site that several Leads create:** Each Initiative Mission site has the Initiative operation level of the Lead that created it, so two Mission sites of one MissionSiteArchetype may have different levels; the MissionSiteArchetype has the lowest of them ([Initiative operation level](#initiative-operation-level)).
- **Lead whose discovery no chain of Leads reaches,** e.g. one whose `discovered_when` requires the Lead itself: It has no Initiative operation level, and it adds nothing to the level of a MissionSiteArchetype it would create ([Initiative operation level](#initiative-operation-level)).
- **Game build without a Lead:** It passes [Lead GDR validation](#lead-gdr-validation). No Lead exists to be available, no Initiative Mission site is ever created, and no Lead can win the Campaign.
- **Invalid GDRs:** A Game build that fails [Lead GDR validation](#lead-gdr-validation), e.g. with a `discovered_when` that names no Condition kind, a `create_mission_site` of a MissionSiteArchetype of kind response, two `create_mission_site` Effects in `on_completion`, or an `eliminate_faction` Effect in a Lead without `faction`, is defective and no Campaign is created from it.

# TODOs

- TODO (later): Leads that expire and appear again while they are not investigated, under [Lead availability](#lead-availability). The Game designer's notes are in [Lead repeatability](../../../design-notes/lead-repeatability.md).
- TODO (later): Further Condition kinds for Lead discovery, e.g. that the Agency holds an item, under [Lead](#lead).
- TODO (later): Further completion effect kinds, e.g. a Lead completion that gives information, money, funding, Agent improvement, or a Campaign objective directly, under [Completion effect](#completion-effect).
