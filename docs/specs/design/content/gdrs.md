# GDRs

| Metadata | Value |
| --- | --- |
| Spec ID | GDRS |
| Family | Content |
| Audience | Engine designer, Content designer, Implementer |
| Owns | Which Game Data Records (GDRs) a Game build supplies so that a complete Campaign can be played from creation to an ending, and how those GDRs form the Victory path. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Campaign](../foundation/core-concepts.md#campaign-and-session) cannot be played without content, e.g. Agents to hire and a [Faction](../mechanics/domain-model.md#factions) to fight. The GDRs are the Game Data Records ([GDRs](../foundation/core-concepts.md#game-build-and-content)) that a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for a complete Campaign, from its creation to its ending. They supply every kind of GDR that the [Domain Model](../mechanics/domain-model.md) requires.

The content offers one way to win and three ways to lose. Each of the three Factions, Red Dawn, Exalt, and Black Lotus, has a chain of 14 [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), six of which each create one [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and the last of which makes that Faction [Eliminated](../mechanics/domain-model.md#factions). Once all three are Eliminated, completing the Lead Peace on Earth wins the Campaign. Meanwhile, every Faction not yet Eliminated creates [Response Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). One that is Expired, or whose [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is Lost, raises [Panic](../mechanics/domain-model.md#campaign-standing), and the Campaign is lost when Panic reaches its limit, when the Agency's money falls below zero, or when an existential Faction operation is not stopped.

# Glossary

| Term | Definition |
| --- | --- |
| Victory path | The chain of [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and [Initiative Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) by which the [Agency](../mechanics/domain-model.md#agency-and-agents) makes every [Faction](../mechanics/domain-model.md#factions) [Eliminated](../mechanics/domain-model.md#factions) and then completes the Lead that wins the [Campaign](../foundation/core-concepts.md#campaign-and-session) with the GDRs. |

# Scope

The GDRs supply every kind of [GDR](../foundation/core-concepts.md#game-build-and-content) the [Game concepts](../mechanics/domain-model.md#game-concepts) of Domain Model require. A GDR left out of them is kept as [Cut content](../foundation/game-data-records.md#cut-content). The following table is exhaustive: it counts every GDR by the Domain Model concept it serves, and the [Background artwork](../ui/visual-design.md#glossary) and [Soundtrack](../ui/music.md#glossary) GDRs, which serve the user interface rather than a Domain Model concept, in rows of their own.

| Domain Model concept | GDRs | Count |
| --- | --- | --- |
| [Campaign configuration](../foundation/campaign-state.md#glossary) | One [Campaign configuration preset](../foundation/configuration.md#glossary) and one parameter GDR naming it as the default | 2 |
| Agency | One AgencyArchetype | 1 |
| Agent | One AgentArchetype and one parameter GDR | 2 |
| Lead and [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) | 44 Leads, i.e. `criminal_organizations`, 14 of each Faction, and `peace_on_earth`; one InvestigationArchetype; and one parameter GDR | 46 |
| [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) | Six MissionSiteArchetypes of kind initiative and 15 of kind response | 21 |
| Mission | One MissionArchetype | 1 |
| Enemy and [Combat](../mechanics/domain-model.md#combat) | Nine EnemyArchetypes, nine Weapons, nine Armors, and one parameter GDR | 28 |
| Agent recovery | One parameter GDR | 1 |
| Economy and upgrades | One parameter GDR and eight [Upgrades](../mechanics/economy-and-upgrades.md#glossary) | 9 |
| Faction | Three FactionArchetypes, eight [Faction activity levels](../mechanics/factions.md#glossary), and five [Faction operation levels](../mechanics/factions.md#glossary) | 16 |
| Panic and endings | One parameter GDR | 1 |
| [Compendium article](../mechanics/compendium.md#glossary) | Six [Guide articles](../mechanics/compendium.md#glossary), 26 [Mechanics articles](../mechanics/compendium.md#glossary), and one [Subject article](../mechanics/compendium.md#glossary) about each of 103 other GDRs | 135 |
| [Background artwork](../ui/visual-design.md#glossary) | Three BackgroundArtworks | 3 |
| [Soundtrack](../ui/music.md#glossary) | One parameter GDR | 1 |
| **Total** |  | 267 |

A parameter GDR bundles the scalar values one Mechanics specification reads, e.g. the hire cost and upkeep of Economy and Upgrades in the GDR `economy`, instead of supplying each value as a GDR of its own.

# GDR catalog

The GDRs are grouped by the specification that owns their [Type](../foundation/core-concepts.md#data-modeling), and each group is exhaustive. GDR purposes are those defined under [Purposes of GDRs](../foundation/game-data-records.md#purposes-of-gdrs). Every GDR whose Type has a `name` property also serves the Display content purpose, which the tables do not list.

## Configuration GDRs

Type owner: [Configuration](../foundation/configuration.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `standard` | CampaignConfiguration | [Campaign configuration preset](../foundation/game-data-records.md#glossary) | The [Game build default preset](../foundation/configuration.md#game-build-default-preset) under [Campaign configuration presets](../foundation/configuration.md#campaign-configuration-presets), named Standard: the Agency's starting money and starting recurring funding. |
| `configuration_parameters` | ConfigurationParameters | None of the listed purposes | Which preset is the [Game build default preset](../foundation/configuration.md#glossary), under [Game build default preset](../foundation/configuration.md#game-build-default-preset). |

## Agents GDRs

Type owner: [Agents](../mechanics/agents-spec.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `field_agent` | AgentArchetype | Archetype | Every [Agent](../mechanics/domain-model.md#agency-and-agents)'s [base skill](../mechanics/agents-spec.md#combatant-attributes), Weapon `service_weapon`, Armor `service_armor`, and `base_health` when created. An Agent's [base health](../mechanics/agents-spec.md#combatant-attributes) equals `base_health`, and a new Agent has no [health lost](../mechanics/agents-spec.md#combatant-attributes). |
| `agent_parameters` | AgentParameters | [Campaign instance](../foundation/core-concepts.md#campaign-instances) initialization, Calculation parameter | The size of the initial roster; the [exhaustion](../mechanics/agents-spec.md#combatant-attributes) at which a [Combatant](../mechanics/domain-model.md#combat) is [Incapacitated](../mechanics/combat.md#combatant-condition-in-a-combat), the exhaustion without effect, and the base skill lost per further point; exhaustion per attack and per defense, and per [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and per percent of a team [Killed](../mechanics/agents-spec.md#agent-statuses); the base skill gained per [Turn](../foundation/engine-contract.md#player-actions-and-turns) of [Training](../mechanics/agents-spec.md#assignments); and the [Experience](../mechanics/agents-spec.md#growth) earned per attack made or taken in a Combat, by hit or miss, and per Mission survived. |

## Economy and Upgrades GDRs

Type owner: [Economy and Upgrades](../mechanics/economy-and-upgrades.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `agency` | AgencyArchetype | Archetype | The Agency's display name. |
| `economy` | EconomyParameters | Calculation parameter | Hire cost, upkeep per Agent, contracting income per Agent and how strongly it depends on [effective skill](../mechanics/agents-spec.md#combatant-attributes), and the starting [Agent cap](../mechanics/economy-and-upgrades.md#glossary), [Transport cap](../mechanics/economy-and-upgrades.md#glossary), and [Training cap](../mechanics/economy-and-upgrades.md#glossary). |
| `agent_cap` | Upgrade | Calculation parameter | Price and increment of the [Upgrade](../mechanics/domain-model.md#agency-and-agents) raising the [Agent cap](../mechanics/domain-model.md#agency-and-agents). |
| `transport_cap` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the Transport cap. |
| `training_cap` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the Training cap. |
| `weapon_damage` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the [effective weapon damage](../mechanics/agents-spec.md#combatant-attributes) of every [Serving](../mechanics/agents-spec.md#agent-statuses) Agent, i.e. how hard the Service weapon hits in Agent hands. |
| `armor` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the [effective armor](../mechanics/agents-spec.md#combatant-attributes) of every Serving Agent, i.e. how much of the damage of hits the Service armor absorbs in each Combat. |
| `training_skill_gain` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the base skill every Agent on Training gains. |
| `exhaustion_recovery` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the exhaustion every resting Agent loses. |
| `health_recovery` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the percentage of [effective max health](../mechanics/agents-spec.md#combatant-attributes) every Agent on [Recovery](../mechanics/agents-spec.md#assignments) regains. |

Three Upgrades raise an Agency-wide cap, two change a value of every Agent, and three raise a rate every Agent shares. No Upgrade is a [Max health Upgrade](../mechanics/economy-and-upgrades.md#glossary): Agents grow sturdier through armor, which costs them no [effective skill](../mechanics/agents-spec.md#combatant-attributes) when hit, rather than through more health.

## Leads and Progression GDRs

Type owner: [Leads and Progression](../mechanics/leads-and-progression.md).

The Leads of each Faction form one chain of six tiers. In each tier a locate Lead creates one Initiative Mission site, and a Won [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) there discovers the tier's follow-up Lead, which creates no Mission site. The number of a tier is the [Initiative operation level](../mechanics/leads-and-progression.md#initiative-operation-level) of its locate Lead and of the Initiative Mission site it creates, and its follow-up Lead has the same level, as has the profile Lead, at level 1; `criminal_organizations` has level 0, and each Terminate Lead and `peace_on_earth` have level 6. The table lists the Leads of Red Dawn one per row, in the order of the chain, and describes those of Exalt and Black Lotus by the same 14 rows.

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `criminal_organizations` | Lead | Referenced GDR, Key for campaign facts | The first Lead: it has no Faction, is discovered from campaign creation, and creates no Mission site. Its completion discovers `locate_red_dawn_member`, `locate_exalt_member`, and `locate_black_lotus_member`. |
| `locate_red_dawn_member` | Lead | Referenced GDR, Key for campaign facts | Tier 1: discovered once `criminal_organizations` is completed; creates `apprehend_member`. |
| `interrogate_red_dawn_member` | Lead | Referenced GDR, Key for campaign facts | Follow-up of tier 1: discovered by a Won Mission at `apprehend_member`. |
| `red_dawn_profile` | Lead | Referenced GDR, Key for campaign facts | Discovered once `interrogate_red_dawn_member` is completed; creates no Mission site. Its completion also makes `red_dawn_article` Player-visible, under [Compendium GDRs](#compendium-gdrs). |
| `locate_red_dawn_safehouse` | Lead | Referenced GDR, Key for campaign facts | Tier 2: discovered once `red_dawn_profile` is completed; creates `raid_safehouse`. |
| `interrogate_red_dawn_handler` | Lead | Referenced GDR, Key for campaign facts | Follow-up of tier 2: discovered by a Won Mission at `raid_safehouse`. |
| `locate_red_dawn_outpost` | Lead | Referenced GDR, Key for campaign facts | Tier 3: discovered once `interrogate_red_dawn_handler` is completed; creates `raid_outpost`. |
| `interrogate_red_dawn_soldier` | Lead | Referenced GDR, Key for campaign facts | Follow-up of tier 3: discovered by a Won Mission at `raid_outpost`. |
| `locate_red_dawn_logistics_hub` | Lead | Referenced GDR, Key for campaign facts | Tier 4: discovered once `interrogate_red_dawn_soldier` is completed; creates `raid_logistics_hub`. |
| `interrogate_red_dawn_commander` | Lead | Referenced GDR, Key for campaign facts | Follow-up of tier 4: discovered by a Won Mission at `raid_logistics_hub`. |
| `locate_red_dawn_regional_stronghold` | Lead | Referenced GDR, Key for campaign facts | Tier 5: discovered once `interrogate_red_dawn_commander` is completed; creates `raid_regional_stronghold`. |
| `interrogate_red_dawn_high_commander` | Lead | Referenced GDR, Key for campaign facts | Follow-up of tier 5: discovered by a Won Mission at `raid_regional_stronghold`. |
| `locate_red_dawn_hq` | Lead | Referenced GDR, Key for campaign facts | Tier 6: discovered once `interrogate_red_dawn_high_commander` is completed; creates `raid_hq`. |
| `interrogate_red_dawn_cult_leader` | Lead | Referenced GDR, Key for campaign facts | Follow-up of tier 6: discovered by a Won Mission at `raid_hq`. |
| `terminate_red_dawn` | Lead | Referenced GDR, Key for campaign facts | Discovered once `interrogate_red_dawn_cult_leader` is completed; creates no Mission site. Its completion applies an `eliminate_faction` [Effect](../foundation/effect-lists.md#glossary), which makes Red Dawn Eliminated. |
| The 14 Leads of Exalt, e.g. `locate_exalt_member` and `exalt_profile` | Lead | Referenced GDR, Key for campaign facts | As the 14 Leads of Red Dawn, each with `exalt` in place of `red_dawn` in its own identifier and in every Lead identifier it names, with `faction` `exalt`, and with the same `required_progress`, `investigate_again`, and MissionSiteArchetypes. |
| The 14 Leads of Black Lotus, e.g. `locate_black_lotus_member` and `black_lotus_profile` | Lead | Referenced GDR, Key for campaign facts | As the 14 Leads of Red Dawn, each with `black_lotus` in place of `red_dawn` in its own identifier and in every Lead identifier it names, with `faction` `black_lotus`, and with the same `required_progress`, `investigate_again`, and MissionSiteArchetypes. |
| `peace_on_earth` | Lead | Referenced GDR, Key for campaign facts | The last Lead: it has no Faction and creates no Mission site. It is discovered once `terminate_red_dawn`, `terminate_exalt`, and `terminate_black_lotus` are all completed, and its completion applies a `win_campaign` Effect, which wins the Campaign. |

Every locate Lead of tiers 1 to 5 has `investigate_again` `always`; `locate_<faction>_hq` has the default for a Lead that creates a Mission site, `until_mission_won`; and every Lead that creates no Mission site has the default `never`, under [Lead availability](../mechanics/leads-and-progression.md#lead-availability).

Each Lead of a Faction references that Faction, e.g. `red_dawn`, explicitly through its `faction` property, and every Lead names every GDR its `discovered_when` reads, and the MissionSiteArchetype it creates, if any, by GDR identifier, so no relationship is inferred from identifier text under [References](../foundation/campaign-instances.md#references) in Campaign Instances.

## Investigations GDRs

Type owner: [Investigations](../mechanics/investigations.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `standard_investigation` | InvestigationArchetype | Archetype | The [Archetype](../foundation/core-concepts.md#campaign-instances) of every Investigation. |
| `investigation_parameters` | InvestigationParameters | Calculation parameter | The team efficiency exponent 0.8, the greatest [Actual required progress](../mechanics/investigations.md#glossary) of 150% of a Lead's [Required progress](../mechanics/leads-and-progression.md#glossary), and the assessment threshold of 25%. |

An Investigation reads the `required_progress` of its Lead, under [Lead properties this document reads](../mechanics/investigations.md#lead-properties-this-document-reads).

## Missions GDRs

Type owner: [Missions](../mechanics/missions.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `apprehend_member` | MissionSiteArchetype | Archetype | The Initiative Mission site of tier 1, created by `locate_<faction>_member`: its `expires_in_turns`, its Enemies by EnemyArchetype and count, and its rewards for a win. |
| `raid_safehouse` | MissionSiteArchetype | Archetype | The Initiative Mission site of tier 2, created by `locate_<faction>_safehouse`: as `apprehend_member`. |
| `raid_outpost` | MissionSiteArchetype | Archetype | The Initiative Mission site of tier 3, created by `locate_<faction>_outpost`: as `apprehend_member`. |
| `raid_logistics_hub` | MissionSiteArchetype | Archetype | The Initiative Mission site of tier 4, created by `locate_<faction>_logistics_hub`: as `apprehend_member`. |
| `raid_regional_stronghold` | MissionSiteArchetype | Archetype | The Initiative Mission site of tier 5, created by `locate_<faction>_regional_stronghold`: as `apprehend_member`. |
| `raid_hq` | MissionSiteArchetype | Archetype | The Initiative Mission site of tier 6, created by `locate_<faction>_hq`: as `apprehend_member`. |
| `foil_recruitment_push`, `foil_supply_theft`, `foil_business_extortion` | MissionSiteArchetype | Archetype | The [Response Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of Faction operation level 1: each its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `foil_sabotage`, `foil_vip_assassination`, `defend_against_office_raid` | MissionSiteArchetype | Archetype | The Response Mission sites of Faction operation level 2, each as those of level 1. |
| `foil_financial_heist`, `intercept_arms_deal`, `foil_infrastructure_attack` | MissionSiteArchetype | Archetype | The Response Mission sites of Faction operation level 3, each as those of level 1. |
| `counter_civilian_terror`, `foil_nuclear_plant_bombing`, `foil_prison_break` | MissionSiteArchetype | Archetype | The Response Mission sites of Faction operation level 4, each as those of level 1. |
| `foil_bioweapon_release`, `foil_warhead_launch`, `defend_against_hq_assault` | MissionSiteArchetype | Archetype | The Response Mission sites of Faction operation level 5, the existential level, each as those of level 1. |
| `standard_mission` | MissionArchetype | Archetype | The Archetype of every Mission. |

The rewards of an Initiative Mission site are its `on_win`, which holds money, and for every MissionSiteArchetype but `apprehend_member` also funding and a [Panic](../mechanics/domain-model.md#campaign-standing) reduction. No `on_win` holds an `eliminate_faction` Effect: only a Terminate Lead makes a Faction Eliminated.

No MissionSiteArchetype references a Faction, and no MissionSiteArchetype's `name` names one, e.g. Raid safehouse. A Mission site's target Faction is a value in its [Constants](../foundation/core-concepts.md#campaign-instances): for an Initiative Mission site it is the Faction whose Archetype is the creating Lead's `faction`, and for a Response Mission site it is the initiating Faction. The three Factions therefore share every MissionSiteArchetype, and each supplies only its own Leads. A `mission_won` [Condition](../foundation/conditions.md#glossary) of a Lead holds only for a Won Mission targeting the Lead's own Faction, under [Lead discovery](../mechanics/leads-and-progression.md#lead-discovery) in Leads and Progression, so a win against one Faction never advances the Victory path of another.

## Combat GDRs

Type owner: [Combat](../mechanics/combat.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `initiate` | EnemyArchetype | Archetype | The weakest [Enemy](../mechanics/domain-model.md#combat): base skill, base health, Weapon, and Armor. |
| `operative` | EnemyArchetype | Archetype | An Enemy a little stronger than `initiate`: base skill, base health, Weapon, and Armor. |
| `handler` | EnemyArchetype | Archetype | The officer of `initiate` and `operative` Enemies: base skill, base health, Weapon, and Armor. |
| `soldier` | EnemyArchetype | Archetype | An Enemy roughly matching a newly hired Agent: base skill, base health, Weapon, and Armor. |
| `lieutenant` | EnemyArchetype | Archetype | The officer of `soldier` Enemies: base skill, base health, Weapon, and Armor. |
| `elite` | EnemyArchetype | Archetype | An Enemy about twice as skilled as `soldier`: base skill, base health, Weapon, and Armor. |
| `commander` | EnemyArchetype | Archetype | The officer of `elite` Enemies: base skill, base health, Weapon, and Armor. |
| `high_commander` | EnemyArchetype | Archetype | The strongest officer below `cult_leader`: base skill, base health, Weapon, and Armor. |
| `cult_leader` | EnemyArchetype | Archetype | The Enemy that leads a Faction, met only in `raid_hq`: base skill, base health, Weapon, and Armor. |
| `basic_pistol` | Weapon | Referenced GDR | [Base weapon damage](../mechanics/agents-spec.md#combatant-attributes) of the Weapon of `initiate`. |
| `service_weapon` | Weapon | Referenced GDR | Base weapon damage of the Weapon of every Agent, named Service weapon: the weapon the Agency issues, which the `weapon_damage` Upgrade makes hit harder in Agent hands. Its `base_weapon_damage` equals that of `combat_pistol`. |
| `combat_pistol` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `operative` and of `handler`. |
| `rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `soldier`. |
| `battle_rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `lieutenant`. |
| `assault_rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `elite`. |
| `heavy_rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `commander`. |
| `machine_gun` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `high_commander`. |
| `anti_materiel_rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `cult_leader`. |
| `service_armor` | Armor | Referenced GDR | [Base armor](../mechanics/agents-spec.md#combatant-attributes) of the Armor of every Agent, named Service armor: the armor the Agency issues, 0 until the `armor` Upgrade raises every Agent's effective armor. |
| `no_armor` | Armor | Referenced GDR | Base armor of the Armor of `initiate` and of `operative`, named None, 0, so that every hit on one of them removes [current health](../mechanics/agents-spec.md#combatant-attributes). |
| `padded_jacket` | Armor | Referenced GDR | Base armor of the Armor of `handler`. |
| `ballistic_vest` | Armor | Referenced GDR | Base armor of the Armor of `soldier`. |
| `plate_carrier` | Armor | Referenced GDR | Base armor of the Armor of `lieutenant`. |
| `tactical_armor` | Armor | Referenced GDR | Base armor of the Armor of `elite`. |
| `heavy_armor` | Armor | Referenced GDR | Base armor of the Armor of `commander`. |
| `assault_armor` | Armor | Referenced GDR | Base armor of the Armor of `high_commander`. |
| `juggernaut_suit` | Armor | Referenced GDR | Base armor of the Armor of `cult_leader`. |
| `combat_parameters` | CombatParameters | Calculation parameter | The spread of the damage outcome around base weapon damage, the two retreat thresholds, the incapacitation threshold, the two values from which an attacking Agent's [Selection weights](../mechanics/combat.md#combat-rounds-and-results) follow, and the four values of the [Combat rating](../mechanics/combat.md#combat-rating): the rating bases of 30 effective max health, 20 effective armor, and 10 effective weapon damage, against which a Combatant's [rating factor](../mechanics/combat.md#combatant-condition-in-a-combat) weighs its health, armor, and attack terms, so that it is 1 for a Combatant of 30 effective max health, no armor, and 10 effective weapon damage; and the team size exponent of 1.2. |

## Agent Recovery GDRs

Type owner: [Agent Recovery](../mechanics/agent-recovery.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `recovery` | RecoveryParameters | Calculation parameter | Health recovered per Turn, as a percentage of the Agent's effective max health, and exhaustion recovered per Turn. |

## Factions GDRs

Type owner: [Factions](../mechanics/factions.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `red_dawn` | FactionArchetype | Archetype | The Faction Red Dawn: its name and its initial Faction activity level, `faint`. |
| `exalt` | FactionArchetype | Archetype | The Faction Exalt: its name and its initial Faction activity level, `dormant`. |
| `black_lotus` | FactionArchetype | Archetype | The Faction Black Lotus: its name and its initial Faction activity level, `dormant`. |
| `dormant` | FactionActivityLevel | Calculation parameter | A level without operations: how long it lasts and the next level, `faint`. |
| `faint` | FactionActivityLevel | Calculation parameter | How long the level lasts, how often an operation occurs, the weight of each Faction operation level, and the next level, `emerging`. |
| `emerging`, `active`, `expanding`, `escalating`, `war` | FactionActivityLevel | Calculation parameter | As `faint`; each is the next level of the one before it, and the next level of `war` is `total_war`. |
| `total_war` | FactionActivityLevel | Calculation parameter | As `faint`, except that it lasts indefinitely and has no next level. |
| `operation_level_1` | FactionOperationLevel | Calculation parameter | The money and funding gained when the Mission at a Response Mission site of level 1 is Won, and the [Panic](../mechanics/domain-model.md#campaign-standing) and funding change when the site is Expired or its Mission Lost. |
| `operation_level_2`, `operation_level_3`, `operation_level_4` | FactionOperationLevel | Calculation parameter | As `operation_level_1`, for levels 2 to 4. |
| `operation_level_5` | FactionOperationLevel | Calculation parameter | The existential level, named Existential: the money and funding gained when the Mission at a Response Mission site of level 5 is Won, and the Campaign lost, with Panic unchanged, when the site is Expired or its Mission Lost. |

Each MissionSiteArchetype of kind response states its Faction operation level. A Faction selects a level by weight, and [MissionSiteArchetype selection](../mechanics/missions.md#missionsitearchetype-selection) in Missions then selects a MissionSiteArchetype of kind response with that level. The GDRs supply three MissionSiteArchetypes of kind response for each of levels 1 to 5.

## Panic and Endings GDRs

Type owner: [Panic and Endings](../mechanics/panic-and-endings.md).

| GDR       | Type             | GDR purpose           | What it supplies                         |
| --------- | ---------------- | --------------------- | ---------------------------------------- |
| `endings` | EndingParameters | Calculation parameter | The Panic at which the Campaign is lost. |

## Compendium GDRs

Type owner: [Compendium](../mechanics/compendium.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `guide_agency`, `guide_agents`, `guide_investigations`, `guide_missions`, `guide_panic`, `guide_upgrades` | CompendiumArticle | Display content | The six Guide articles, each a short orientation on one part of playing the game. |
| `mechanics_turns`, `mechanics_agents`, `mechanics_skill`, `mechanics_skill_gain`, `mechanics_experience`, `mechanics_health`, `mechanics_recovery`, `mechanics_exhaustion`, `mechanics_assignments`, `mechanics_contracting`, `mechanics_training`, `mechanics_transit`, `mechanics_hiring_and_upkeep`, `mechanics_money_and_funding`, `mechanics_leads`, `mechanics_investigations`, `mechanics_mission_sites`, `mechanics_missions`, `mechanics_combat`, `mechanics_combat_rating`, `mechanics_damage`, `mechanics_retreat`, `mechanics_factions`, `mechanics_faction_operations`, `mechanics_panic`, `mechanics_upgrades`, `mechanics_winning_and_losing` | CompendiumArticle | Display content | The 27 Mechanics articles, one for each mechanic the Player meets, each with the formulas of that mechanic. |
| One `<subject>_article` for each of `field_agent`, `initiate`, `operative`, `handler`, `soldier`, `lieutenant`, `elite`, `commander`, `high_commander`, `cult_leader`, `service_weapon`, `basic_pistol`, `combat_pistol`, `rifle`, `battle_rifle`, `assault_rifle`, `heavy_rifle`, `machine_gun`, `anti_materiel_rifle`, `service_armor`, `padded_jacket`, `ballistic_vest`, `plate_carrier`, `tactical_armor`, `heavy_armor`, `assault_armor`, `juggernaut_suit`, `agent_cap`, `transport_cap`, `training_cap`, `weapon_damage`, `armor`, `training_skill_gain`, `exhaustion_recovery`, and `health_recovery` | CompendiumArticle | Display content | A Subject article about that GDR, e.g. `soldier_article` about the EnemyArchetype `soldier`. |
| `red_dawn_article`, `exalt_article`, `black_lotus_article` | CompendiumArticle | Display content | A Subject article about each FactionArchetype, whose `visible_when` is a `lead_completed` Condition naming the profile Lead of that Faction, i.e. `red_dawn_profile`, `exalt_profile`, and `black_lotus_profile` respectively. |
| One `<subject>_article` for each of `criminal_organizations`, `locate_red_dawn_member`, `interrogate_red_dawn_member`, `red_dawn_profile`, `locate_red_dawn_safehouse`, `interrogate_red_dawn_handler`, `locate_red_dawn_outpost`, `interrogate_red_dawn_soldier`, `locate_red_dawn_logistics_hub`, `interrogate_red_dawn_commander`, `locate_red_dawn_regional_stronghold`, `interrogate_red_dawn_high_commander`, `locate_red_dawn_hq`, `interrogate_red_dawn_cult_leader`, `terminate_red_dawn`, `locate_exalt_member`, `interrogate_exalt_member`, `exalt_profile`, `locate_exalt_safehouse`, `interrogate_exalt_handler`, `locate_exalt_outpost`, `interrogate_exalt_soldier`, `locate_exalt_logistics_hub`, `interrogate_exalt_commander`, `locate_exalt_regional_stronghold`, `interrogate_exalt_high_commander`, `locate_exalt_hq`, `interrogate_exalt_cult_leader`, `terminate_exalt`, `locate_black_lotus_member`, `interrogate_black_lotus_member`, `black_lotus_profile`, `locate_black_lotus_safehouse`, `interrogate_black_lotus_handler`, `locate_black_lotus_outpost`, `interrogate_black_lotus_soldier`, `locate_black_lotus_logistics_hub`, `interrogate_black_lotus_commander`, `locate_black_lotus_regional_stronghold`, `interrogate_black_lotus_high_commander`, `locate_black_lotus_hq`, `interrogate_black_lotus_cult_leader`, `terminate_black_lotus`, and `peace_on_earth` | CompendiumArticle | Display content | A Subject article about that Lead, e.g. `red_dawn_profile_article` about the Lead `red_dawn_profile`. |
| One `<subject>_article` for each of `apprehend_member`, `raid_safehouse`, `raid_outpost`, `raid_logistics_hub`, `raid_regional_stronghold`, `raid_hq`, `foil_recruitment_push`, `foil_sabotage`, `foil_supply_theft`, `foil_business_extortion`, `foil_vip_assassination`, `defend_against_office_raid`, `foil_financial_heist`, `intercept_arms_deal`, `foil_infrastructure_attack`, `counter_civilian_terror`, `foil_nuclear_plant_bombing`, `foil_prison_break`, `foil_bioweapon_release`, `foil_warhead_launch`, and `defend_against_hq_assault` | CompendiumArticle | Display content | A Subject article about that MissionSiteArchetype, e.g. `raid_hq_article` about the MissionSiteArchetype `raid_hq`. |

Every AgentArchetype, EnemyArchetype, Weapon, Upgrade, FactionArchetype, Lead, and MissionSiteArchetype of the GDRs has a Subject article, and so does every Armor but `no_armor`, which has none, because "None" names no thing to look up. Only the three Subject articles about a FactionArchetype have `visible_when`, so a Faction's article becomes Player-visible once its profile Lead is completed, under [Article visibility](../mechanics/compendium.md#article-visibility), while every other Subject article is Player-visible whenever its subject is, and, for an EnemyArchetype, a Weapon, or an Armor, once its subject is a [Met subject](../mechanics/compendium.md#glossary). With these GDRs the first [World state](../foundation/engine-contract.md#player-actions-and-turns) of a Campaign therefore shows, of the Subject articles, only those about `field_agent`, `service_weapon`, `service_armor`, the eight Upgrades, and `criminal_organizations`; the articles about the other Enemies, Weapons, and Armors follow the Mission sites, e.g. the articles about `cult_leader`, `anti_materiel_rifle`, and `juggernaut_suit` become Player-visible once a `locate_<faction>_hq` Lead is discovered. The identifier of a Guide article starts with `guide_`, that of a Mechanics article with `mechanics_`, and that of a Subject article is the identifier of its subject followed by `_article`, so that no article's identifier equals that of another GDR; the identifiers carry no meaning beyond that, under [References](../foundation/campaign-instances.md#references) in Campaign Instances. Every value of a GDR that an article states is a [Placeholder](../mechanics/compendium.md#glossary), and only a number that is part of a rule itself is written out, e.g. the 100 and 500 of the contracting income formula; [Compendium coverage](#compendium-coverage) states which GDR values the articles must cover.

## Visual Design GDRs

Type owner: [Visual Design](../ui/visual-design.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `missions_view_artwork` | BackgroundArtwork | Display content | The [Background artwork](../ui/visual-design.md#background-artwork) of the [Missions View](../ui/screens/missions-view.md), a command center, and its opacity. |
| `agents_view_artwork` | BackgroundArtwork | Display content | The Background artwork of the [Agents View](../ui/screens/agents-view.md), Agents in an equipment room, and its opacity. |
| `leads_view_artwork` | BackgroundArtwork | Display content | The Background artwork of the [Leads View](../ui/screens/leads-view.md), an agent watching a crowded street in the rain, and its opacity. |

## Music GDRs

Type owner: [Music](../ui/music.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `music` | MusicParameters | Display content | The files of `assets/music/tracks/` excluded from the [Soundtrack](../ui/music.md#soundtrack). |

# GDR files

The GDRs are authored in YAML files under the `content/` directory at the repository root. The YAML file of a GDR is the only place its values are recorded. The [Cut content](../foundation/game-data-records.md#cut-content) under `content/cut/` is not part of the GDRs. The layout of the files follows [GDR file layout](../foundation/game-data-records.md#gdr-file-layout) in Game Data Records.

The following table is exhaustive: it lists every GDR file, and the one directory that holds one file per GDR.

| File | Type | GDRs |
| --- | --- | --- |
| `content/configuration/campaign_configurations.yaml` | CampaignConfiguration | `standard` |
| `content/configuration/configuration_parameters.yaml` | ConfigurationParameters | `configuration_parameters` |
| `content/agents/agent_archetypes.yaml` | AgentArchetype | `field_agent` |
| `content/agents/agent_parameters.yaml` | AgentParameters | `agent_parameters` |
| `content/economy-and-upgrades/agency_archetypes.yaml` | AgencyArchetype | `agency` |
| `content/economy-and-upgrades/economy_parameters.yaml` | EconomyParameters | `economy` |
| `content/economy-and-upgrades/upgrades.yaml` | Upgrade | `agent_cap`, `transport_cap`, `training_cap`, `weapon_damage`, `armor`, `training_skill_gain`, `exhaustion_recovery`, `health_recovery` |
| `content/leads-and-progression/leads.yaml` | Lead | The 44 Leads under [Leads and Progression GDRs](#leads-and-progression-gdrs): `criminal_organizations`, the 14 Leads of Red Dawn, of Exalt, and of Black Lotus, and `peace_on_earth`, in that order |
| `content/investigations/investigation_archetypes.yaml` | InvestigationArchetype | `standard_investigation` |
| `content/investigations/investigation_parameters.yaml` | InvestigationParameters | `investigation_parameters` |
| `content/missions/mission_site_archetypes.yaml` | MissionSiteArchetype | `apprehend_member`, `raid_safehouse`, `raid_outpost`, `raid_logistics_hub`, `raid_regional_stronghold`, `raid_hq`, `foil_recruitment_push`, `foil_sabotage`, `foil_supply_theft`, `foil_business_extortion`, `foil_vip_assassination`, `defend_against_office_raid`, `foil_financial_heist`, `intercept_arms_deal`, `foil_infrastructure_attack`, `counter_civilian_terror`, `foil_nuclear_plant_bombing`, `foil_prison_break`, `foil_bioweapon_release`, `foil_warhead_launch`, `defend_against_hq_assault` |
| `content/missions/mission_archetypes.yaml` | MissionArchetype | `standard_mission` |
| `content/combat/enemy_archetypes.yaml` | EnemyArchetype | `initiate`, `operative`, `handler`, `soldier`, `lieutenant`, `elite`, `commander`, `high_commander`, `cult_leader` |
| `content/combat/armors.yaml` | Armor | `service_armor`, `no_armor`, `padded_jacket`, `ballistic_vest`, `plate_carrier`, `tactical_armor`, `heavy_armor`, `assault_armor`, `juggernaut_suit` |
| `content/combat/weapons.yaml` | Weapon | `service_weapon`, `basic_pistol`, `combat_pistol`, `rifle`, `battle_rifle`, `assault_rifle`, `heavy_rifle`, `machine_gun`, `anti_materiel_rifle` |
| `content/combat/combat_parameters.yaml` | CombatParameters | `combat_parameters` |
| `content/agent-recovery/recovery_parameters.yaml` | RecoveryParameters | `recovery` |
| `content/factions/faction_archetypes.yaml` | FactionArchetype | `red_dawn`, `exalt`, `black_lotus` |
| `content/factions/faction_activity_levels.yaml` | FactionActivityLevel | `dormant`, `faint`, `emerging`, `active`, `expanding`, `escalating`, `war`, `total_war` |
| `content/factions/faction_operation_levels.yaml` | FactionOperationLevel | `operation_level_1`, `operation_level_2`, `operation_level_3`, `operation_level_4`, `operation_level_5` |
| `content/panic-and-endings/ending_parameters.yaml` | EndingParameters | `endings` |
| `content/compendium/compendium_articles/<id>.yaml` | CompendiumArticle | The 128 GDRs under [Compendium GDRs](#compendium-gdrs), each in a file named after its identifier, e.g. `content/compendium/compendium_articles/mechanics_combat.yaml` |
| `content/visual-design/background_artworks.yaml` | BackgroundArtwork | `missions_view_artwork`, `agents_view_artwork`, `leads_view_artwork` |
| `content/music/music_parameters.yaml` | MusicParameters | `music` |

# Compendium coverage

The Compendium is a complete reference only if every number behind a mechanic can be looked up in it, so the Compendium articles must keep up with the parameter GDRs as mechanics are added.

Every property, other than `id` and `type`, of every parameter GDR of the GDRs, i.e. of every GDR whose Type name ends in "Parameters", is named by a [Placeholder](../mechanics/compendium.md#glossary) of at least one Compendium article of the GDRs, as [Coverage of parameter GDRs](../mechanics/compendium.md#coverage-of-parameter-gdrs) in Compendium requires. A Placeholder with an index names the list property it indexes. The following properties are exempt, because none of them is part of a mechanic the Player plays with. The table is exhaustive, and a Placeholder must not name an exempt property.

| GDR | Property | Why it is exempt |
| --- | --- | --- |
| `configuration_parameters` | `default_preset` | It names the preset that campaign creation starts from, which the Player sees while creating a Campaign. |
| `music` | `excluded_tracks` | It lists the music files left out of the [Soundtrack](../ui/music.md#glossary). |

The repository check `npm run compendium:check` enforces this rule, together with [Compendium article GDR validation](../mechanics/compendium.md#compendium-article-gdr-validation), and reads the exemptions from the table above. Adding a property to a parameter GDR therefore fails the check until an article explains the property or the table exempts it.

# Victory path

The Campaign is won by working through the Leads of all three Factions and then completing `peace_on_earth`. Each Faction has a Victory path of its own, the three are alike, and the Agency can pursue them in any order and at once.

Completing `criminal_organizations` discovers the first Lead of every Faction, `locate_<faction>_member`. From there the path of one Faction climbs six tiers. In each tier a locate Lead creates one Initiative Mission site, and a Won Mission there discovers the tier's follow-up Lead, whose completion discovers the locate Lead of the next tier. Every follow-up Lead questions a captured Enemy, e.g. `interrogate_red_dawn_handler`. Between tiers 1 and 2 stands the profile Lead `<faction>_profile`: `interrogate_<faction>_member` discovers it, its completion discovers `locate_<faction>_safehouse`, and it makes the Faction's Subject article Player-visible. The follow-up Lead of tier 6, `interrogate_<faction>_cult_leader`, discovers `terminate_<faction>`, whose completion makes the Faction Eliminated. Once all three Terminate Leads are completed, `peace_on_earth` is discovered, and its completion wins the Campaign.

Throughout the Campaign, each Faction not yet Eliminated carries out [Faction operation occurrences](../mechanics/domain-model.md#factions), each with one Response Mission site. A Response Mission site that is Expired, or whose Mission is Lost, raises Panic, and the Campaign is lost once Panic reaches the [Panic limit](../mechanics/panic-and-endings.md#glossary); one of Faction operation level 5, the existential level, instead loses the Campaign outright. The Campaign is also lost when the Agency's money falls below zero.

![Victory path of one Faction of the GDRs, e.g. Red Dawn: Criminal organizations discovers Locate Red Dawn member; in each of six tiers a locate Lead creates an Initiative Mission site and a Won Mission there discovers a follow-up Lead, with the Red Dawn profile Lead between tiers 1 and 2; after tier 6, Terminate Red Dawn makes the Faction Eliminated, and once all three Factions are Eliminated, Peace on Earth wins the Campaign; throughout the Campaign, the Faction's operations create Response Mission sites whose expiration or loss raises Panic until the Campaign is lost, and an existential operation not stopped loses it outright](../../../images/diagrams/victory-path.svg)

An Initiative Mission site that is Expired, or whose Mission is Lost, records no win, so its locate Lead stays available and the Agency can obtain a new Mission site from it. A Mission site cannot be attempted twice. The locate Leads of tiers 1 to 5 stay available after a win too, because their `investigate_again` is `always`, while `locate_<faction>_hq` stays available only until a Mission at a Mission site it created is Won. No Lead of a Faction can be investigated again once that Faction is Eliminated.

The Victory path works through these rules:

- [Lead availability](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), under [Lead availability](../mechanics/leads-and-progression.md#lead-availability); Lead discovery, under [Lead discovery](../mechanics/leads-and-progression.md#lead-discovery); and the effect of completing a Lead, including the `eliminate_faction` Effect of a Terminate Lead and the `win_campaign` Effect of `peace_on_earth`, under [Completion effect](../mechanics/leads-and-progression.md#completion-effect), all in [Leads and Progression](../mechanics/leads-and-progression.md).
- Mission site creation, expiration, and the [Consequences](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of a Mission's win or loss, under [Mission site creation](../mechanics/missions.md#mission-site-creation), [Mission site expiration](../mechanics/missions.md#mission-site-expiration), and [Consequences](../mechanics/missions.md#consequences) in [Missions](../mechanics/missions.md).
- Faction activity and elimination, under [Faction activity](../mechanics/factions.md#faction-activity) and [Elimination](../mechanics/factions.md#elimination) in [Factions](../mechanics/factions.md).
- When a Faction's Subject article becomes Player-visible, under [Article visibility](../mechanics/compendium.md#article-visibility) in [Compendium](../mechanics/compendium.md).
- The conditions that end the Campaign, under [Victory](../mechanics/panic-and-endings.md#victory) and [Defeat](../mechanics/panic-and-endings.md#defeat), and which [Campaign ending](../mechanics/domain-model.md#campaign-standing) applies when both hold, under [Ending check step](../mechanics/panic-and-endings.md#ending-check-step), all in [Panic and Endings](../mechanics/panic-and-endings.md).

# Initial Campaign state sources

For each Campaign instance Type, the following table names the section that states which initial Campaign instances exist with the GDRs and the source of each initial value, as [Initial Campaign state](../mechanics/domain-model.md#initial-campaign-state) requires. This table is exhaustive.

| Campaign instance Type | Section that states the initial Campaign instances and the source of each value |
| --- | --- |
| Agency | [Agency creation](../mechanics/economy-and-upgrades.md#agency-creation) in Economy and Upgrades |
| Agent | [Initial roster](../mechanics/agents-spec.md#initial-roster) in Agents |
| Faction | [Initial Factions](../mechanics/factions.md#initial-factions) in Factions |
| Investigation | [Investigation creation](../mechanics/investigations.md#investigation-creation) in Investigations |
| Mission site | [Initial Mission sites](../mechanics/missions.md#initial-mission-sites) in Missions |
| Mission | [Initial Mission sites](../mechanics/missions.md#initial-mission-sites) in Missions, which states that no Mission exists initially |
| Enemy | [Enemy creation](../mechanics/combat.md#enemy-creation) in Combat, applied by [Enemy creation](../mechanics/missions.md#enemy-creation) in Missions |

The Turn and Panic start from values that no GDR supplies: the Turn under [Turn number](../mechanics/turn-advancement.md#turn-number), and Panic under [Initial values](../mechanics/panic-and-endings.md#initial-values).

# TODOs

- TODO (later): Faction suppression after a Won Mission, under [Faction activity](../mechanics/factions.md#faction-activity) in Factions.
- TODO (later): Partial success of a Lost Mission, under [Consequences](../mechanics/missions.md#consequences) in Missions.
- TODO (later): A Lead Deep state, under [Leads and Progression GDRs](#leads-and-progression-gdrs).
