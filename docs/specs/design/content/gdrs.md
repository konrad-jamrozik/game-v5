# GDRs

| Metadata | Value |
| --- | --- |
| Spec ID | GDRS |
| Family | Content |
| Audience | Engine designer, Content designer, Implementer |
| Owns | The intent that shapes the Game Data Records (GDRs) a Game build supplies for a complete Campaign, the files they are authored in, the properties exempt from Compendium coverage, and how those GDRs form the Victory path. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Campaign](../foundation/core-concepts.md#campaign-and-session) cannot be played without content, e.g. Agents to hire and a [Faction](../mechanics/domain-model.md#factions) to fight. The GDRs are the Game Data Records ([GDRs](../foundation/core-concepts.md#game-build-and-content)) that a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for a complete Campaign, from its creation to its ending. They supply every kind of GDR that the [Domain Model](../mechanics/domain-model.md) requires.

The content offers one way to win and three ways to lose. Each of the three Factions, Red Dawn, Exalt, and Black Lotus, has a chain of 14 [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), six of which each create one [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and the last of which makes that Faction [Eliminated](../mechanics/domain-model.md#factions). Once all three are Eliminated, completing the Lead Peace on Earth wins the Campaign. Meanwhile, every Faction not yet Eliminated creates [Response Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). One that is Expired, or whose [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is Lost, raises [Panic](../mechanics/domain-model.md#campaign-standing), and the Campaign is lost when Panic reaches its limit, when the Agency's money falls below zero, or when an existential Faction operation is not stopped.

# Glossary

| Term | Definition |
| --- | --- |
| Victory path | The chain of [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and [Initiative Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) by which the [Agency](../mechanics/domain-model.md#agency-and-agents) makes every [Faction](../mechanics/domain-model.md#factions) [Eliminated](../mechanics/domain-model.md#factions) and then completes the Lead that wins the [Campaign](../foundation/core-concepts.md#campaign-and-session) with the GDRs. |

# Scope

The GDRs supply every kind of [GDR](../foundation/core-concepts.md#game-build-and-content) the Game concepts of Domain Model require, and a GDR left out of them is kept as [Cut content](../foundation/game-data-records.md#glossary). They also supply what the user interface reads from game data: the [Background artwork](../ui/visual-design.md#glossary) of its views and the music files left out of the [Soundtrack](../ui/music.md#glossary).

A parameter GDR bundles the values that the rules of one specification read, e.g. a hire cost and an upkeep, instead of supplying each value as a GDR of its own. Its [Type](../foundation/core-concepts.md#data-modeling) name ends in "Parameters".

# Victory path

The Campaign is won by working through the Leads of all three Factions and then completing the Lead Peace on Earth. Each Faction has a Victory path of its own, the three are alike, and the Agency can pursue them in any order and at once.

Completing the Lead Criminal organizations discovers the first Lead of every Faction. From there the path of one Faction climbs six tiers. In each tier a locate Lead creates one Initiative Mission site, and a Won [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) there discovers the tier's follow-up Lead, whose completion discovers the locate Lead of the next tier. The number of a tier is the [Initiative operation level](../mechanics/leads-and-progression.md#glossary) of its locate Lead.

Every follow-up Lead questions a captured [Enemy](../mechanics/domain-model.md#combat), as a simplification of the story, whatever became of every such Enemy in the [Combat](../mechanics/domain-model.md#combat), e.g. `interrogate_red_dawn_handler`. From tier 2 on, that Enemy is the officer its tier first brings into play, and any Won Mission against the Faction where such an officer stood discovers the follow-up Lead, so a Won [Response Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) can skip the Agency ahead along the path.

Between tiers 1 and 2 stands the profile Lead of the Faction: the follow-up Lead of tier 1 discovers it, and its completion discovers the locate Lead of tier 2. The follow-up Lead of tier 6 discovers the Terminate Lead of the Faction, whose completion makes the Faction Eliminated. Once all three Terminate Leads are completed, Peace on Earth is discovered, and its completion wins the Campaign.

![Victory path of one Faction of the GDRs, e.g. Red Dawn: Criminal organizations discovers Locate Red Dawn member; in each of six tiers a locate Lead creates an Initiative Mission site and a Won Mission there discovers a follow-up Lead, with the Red Dawn profile Lead between tiers 1 and 2; after tier 6, Terminate Red Dawn makes the Faction Eliminated, and once all three Factions are Eliminated, Peace on Earth wins the Campaign; throughout the Campaign, the Faction's operations create Response Mission sites whose expiration or loss raises Panic until the Campaign is lost, and an existential operation not stopped loses it outright](../../../images/diagrams/victory-path.svg)

# GDR catalog

The specification that owns a Type says what each of its properties means, and the GDR files hold the values. What neither shows is the intent that shapes a group of GDRs, e.g. why the Enemies form a ladder.

## Economy and Upgrades GDRs

No [Upgrade](../mechanics/domain-model.md#agency-and-agents) of the GDRs is a [Max health Upgrade](../mechanics/economy-and-upgrades.md#glossary): Agents grow sturdier through armor, which costs them no [effective skill](../mechanics/agents-spec.md#combatant-attributes) when hit, rather than through more health.

## Equipment GDRs

The Agency's gear climbs the same ladder as its opponents: each [Item](../mechanics/equipment.md#glossary) is the Weapon or Armor of one rank of Enemy, and the interrogation of that rank's officer, of any Faction, [unlocks](../mechanics/equipment.md#unlocked-items) buying it, so better Armor is only ever bought, since it is never taken as spoils. The two pistols and their [Ammo](../mechanics/combat.md#ammo) are [Unlocked](../mechanics/equipment.md#glossary) from the start, and the Agency issues the combat pistol and the standard uniform to every [Agent](../mechanics/domain-model.md#agency-and-agents) of its initial roster, while an Agent it hires comes with only the knife, its [Fallback Weapon](../mechanics/combat.md#ammo), and the standard uniform, to be armed from [Storage](../mechanics/equipment.md#glossary).

## Leads and Progression GDRs

Every Lead but one lies on the Victory path. The exception is discovered from campaign creation and concerns no Faction, and its completion unlocks [Contracting](../mechanics/agents-spec.md#assignments).

Every locate Lead of tiers 1 to 5 has `investigate_again` `always`, so the Agency can win a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) from it any number of times. Every other Lead keeps the default, so a Faction's headquarters, the Mission site of tier 6, is won only once.

## Missions GDRs

The three Factions share every MissionSiteArchetype, and each supplies only its own Leads, so no MissionSiteArchetype's `name` names a Faction, e.g. Raid safehouse.

Only a Terminate Lead makes a Faction Eliminated: no `on_win` of a MissionSiteArchetype holds an `eliminate_faction` [Effect](../foundation/effect-lists.md#glossary).

## Combat GDRs

The EnemyArchetypes form a ladder, and each tier of the Victory path brings its next rungs into play. Among the rank and file, a soldier roughly matches a newly hired [Agent](../mechanics/domain-model.md#agency-and-agents), the initiate and the operative are weaker, and an elite is about twice as skilled as a soldier. Each has an officer: the handler leads initiates and operatives, the lieutenant leads soldiers, and the commander leads elites. Above them stand the high commander and the cult leader, who leads a Faction and is met only at its headquarters.

## Factions GDRs

The three Factions differ only in when they wake. Red Dawn skips the first [Faction activity level](../mechanics/factions.md#glossary), at which a Faction carries out no operations, so it threatens the Agency from the first [Turn](../foundation/engine-contract.md#player-actions-and-turns), while Exalt and Black Lotus stay at that level for a while.

Each [Faction operation level](../mechanics/factions.md#glossary), the existential one included, is served by three MissionSiteArchetypes of kind response.

## Compendium GDRs

Every AgentArchetype, EnemyArchetype, Weapon, Armor, AmmoType, Upgrade, FactionArchetype, Lead, and MissionSiteArchetype of the GDRs has a [Subject article](../mechanics/compendium.md#glossary). Each mechanic the Player meets has one Mechanics article, with the formulas of that mechanic.

Only the Subject articles about a FactionArchetype and the Mechanics article about Contracting have `visible_when`: the article of a Faction waits until its profile Lead is completed, and the Contracting article until the Lead that unlocks Contracting is.

The identifier of a [Guide article](../mechanics/compendium.md#glossary) starts with `guide_`, that of a Mechanics article with `mechanics_`, and that of a Subject article is the identifier of its subject followed by `_article`, so that no article's identifier equals that of another GDR. The identifiers carry no meaning beyond that.

Every value of a GDR that an article states is a [Placeholder](../mechanics/compendium.md#glossary). Only a number that is part of a rule itself is written out, e.g. a constant of a formula.

# GDR files

The GDRs are authored in YAML files under the `content/` directory at the repository root. The [GDR file layout](../foundation/game-data-records.md#gdr-file-layout) gives each Type owner one directory and names each file after the Type whose GDRs it holds. The file of a GDR is the only place its values are recorded, and the [Cut content](../foundation/game-data-records.md#cut-content) under `content/cut/` is not part of the GDRs.

| Directory | Type owner | Files |
| --- | --- | --- |
| `content/configuration/` | [Configuration](../foundation/configuration.md) | `campaign_configurations.yaml`, `configuration_parameters.yaml` |
| `content/agents/` | [Agents](../mechanics/agents-spec.md) | `agent_archetypes.yaml`, `agent_parameters.yaml` |
| `content/economy-and-upgrades/` | [Economy and Upgrades](../mechanics/economy-and-upgrades.md) | `agency_archetypes.yaml`, `economy_parameters.yaml`, `upgrades.yaml` |
| `content/leads-and-progression/` | [Leads and Progression](../mechanics/leads-and-progression.md) | `leads.yaml` |
| `content/investigations/` | [Investigations](../mechanics/investigations.md) | `investigation_archetypes.yaml`, `investigation_parameters.yaml` |
| `content/missions/` | [Missions](../mechanics/missions.md) | `mission_site_archetypes.yaml`, `mission_archetypes.yaml` |
| `content/combat/` | [Combat](../mechanics/combat.md) | `enemy_archetypes.yaml`, `weapons.yaml`, `armors.yaml`, `ammo_types.yaml`, `combat_parameters.yaml` |
| `content/equipment/` | [Equipment](../mechanics/equipment.md) | `equipment_parameters.yaml` |
| `content/agent-recovery/` | [Agent Recovery](../mechanics/agent-recovery.md) | `recovery_parameters.yaml` |
| `content/factions/` | [Factions](../mechanics/factions.md) | `faction_archetypes.yaml`, `faction_activity_levels.yaml`, `faction_operation_levels.yaml` |
| `content/panic-and-endings/` | [Panic and Endings](../mechanics/panic-and-endings.md) | `ending_parameters.yaml` |
| `content/compendium/` | [Compendium](../mechanics/compendium.md) | The directory `compendium_articles/`, with one file for each Compendium article |
| `content/visual-design/` | [Visual Design](../ui/visual-design.md) | `background_artworks.yaml` |
| `content/gui/` | [Graphical User Interface](../ui/gui.md) | `ranks.yaml` |

# Compendium coverage

The [coverage of parameter GDRs](../mechanics/compendium.md#coverage-of-parameter-gdrs) counts every property of a parameter GDR other than `id` and `type`, and a Placeholder with an index names the list property it indexes. The following properties are exempt, because none of them is part of a mechanic the Player plays with, and a Placeholder must not name an exempt property.

| GDR | Property | Why it is exempt |
| --- | --- | --- |
| `configuration_parameters` | `default_preset` | It names the preset that campaign creation starts from, which the Player sees while creating a Campaign. |
| `equipment` | `starting_ammo` | It is a mapping, which no Placeholder can show, and the Player sees the rounds it gives in [Storage](../mechanics/equipment.md#glossary) from the first Turn. |

The repository check `npm run compendium:check` reads the exemptions from this table, so a property added to a parameter GDR fails the check until an article explains the property or the table exempts it.

# TODOs

- TODO (later): Faction suppression after a Won Mission. Affects [Faction activity](../mechanics/factions.md#faction-activity) in Factions.
- TODO (later): Partial success of a Lost Mission. Affects [Consequences](../mechanics/missions.md#consequences) in Missions.
- TODO (later): A Lead Deep state. Affects [Leads and Progression GDRs](#leads-and-progression-gdrs).
