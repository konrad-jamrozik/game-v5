# Bootstrap GDRs

| Metadata | Value |
| --- | --- |
| Spec ID | BOOT |
| Family | Content |
| Audience | Engine designer, Content designer, Implementer |
| Owns | Which Game Data Records (GDRs) a Game build supplies so that a first playable Campaign can start, and how those GDRs form the Victory path. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Campaign](../foundation/core-concepts.md#campaign-and-session) cannot be played without content, e.g. Agents to hire and a [Faction](../mechanics/domain-model.md#factions) to fight. The Bootstrap GDRs are the smallest set of Game Data Records ([GDRs](../foundation/core-concepts.md#game-build-and-content)) that a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies so that a first playable Campaign can be created and played to an ending. They keep every kind of GDR that the [Domain Model](../mechanics/domain-model.md) requires and supply as few of each as will do; most values are copied from game-ts.

The content is shaped around one way to win and one way to lose. Each of the three Factions, Red Dawn, Exalt, and Black Lotus, has three [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), each creating one [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions); together they form that Faction's Victory path, and winning the last of them eliminates that Faction. Eliminating all three wins the Campaign. Meanwhile, the activity of every Faction not yet eliminated creates [Response Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). One that is Expired, or whose [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is Lost, raises [Panic](../mechanics/domain-model.md#campaign-standing), and enough Panic loses the Campaign.

# Glossary

| Term | Definition |
| --- | --- |
| Bootstrap GDRs | The [GDRs](../foundation/core-concepts.md#game-build-and-content) a [Game build](../foundation/core-concepts.md#game-build-and-content) must supply so that a first playable [Campaign](../foundation/core-concepts.md#campaign-and-session) can be created and played to an ending. |
| Victory path | The sequence of [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and [Initiative Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) by which the [Agency](../mechanics/domain-model.md#agency-and-agents) can eliminate every [Faction](../mechanics/domain-model.md#factions) and so win the Campaign with the Bootstrap GDRs. |

# Bootstrap scope

The Bootstrap GDRs keep every kind of GDR the [Game concepts](../mechanics/domain-model.md#game-concepts) of Domain Model require and reduce how many of each exist. The following table is exhaustive: it counts every Bootstrap GDR by the Domain Model concept it serves, and the [Background artwork](../ui/visual-design.md#glossary) and [Soundtrack](../ui/music.md#glossary) GDRs, which serve the user interface rather than a Domain Model concept, in rows of their own.

| Domain Model concept | Bootstrap GDRs | Count |
| --- | --- | --- |
| [Campaign configuration](../foundation/campaign-state.md#glossary) | One [Campaign configuration preset](../foundation/configuration.md#glossary) and one parameter GDR naming it as the default | 2 |
| Agency | One AgencyArchetype | 1 |
| Agent | One AgentArchetype and one parameter GDR | 2 |
| Lead and [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) | Nine Leads, three of each Faction, one InvestigationArchetype, and one parameter GDR | 11 |
| [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) | Three MissionSiteArchetypes of kind initiative and 16 of kind response | 19 |
| Mission | One MissionArchetype | 1 |
| Enemy and [Combat](../mechanics/domain-model.md#combat) | Nine EnemyArchetypes, seven Weapons, and one parameter GDR | 17 |
| Agent recovery | One parameter GDR | 1 |
| Economy and upgrades | One parameter GDR and eight [Upgrades](../mechanics/economy-and-upgrades.md#glossary) | 9 |
| Faction | Three FactionArchetypes, eight [Faction activity levels](../mechanics/factions.md#glossary), and six [Faction operation levels](../mechanics/factions.md#glossary) | 17 |
| Panic and endings | One parameter GDR | 1 |
| [Compendium article](../mechanics/compendium.md#glossary) | Six [Guide articles](../mechanics/compendium.md#glossary), 26 [Mechanics articles](../mechanics/compendium.md#glossary), and one [Subject article](../mechanics/compendium.md#glossary) about each of 56 other Bootstrap GDRs | 87 |
| [Background artwork](../ui/visual-design.md#glossary) | Three BackgroundArtworks | 3 |
| [Soundtrack](../ui/music.md#glossary) | One parameter GDR | 1 |
| **Total** |  | 172 |

A parameter GDR bundles the scalar values one Mechanics specification reads, e.g. the hire cost and upkeep of Economy and Upgrades in the GDR `economy`, instead of supplying each value as a GDR of its own.

# Bootstrap GDR catalog

The Bootstrap GDRs are grouped by the specification that owns their [Type](../foundation/core-concepts.md#data-modeling), and each group is exhaustive. GDR purposes are those defined under [Purposes of GDRs](../foundation/game-data-records.md#purposes-of-gdrs). Every GDR whose Type has a `name` property also serves the Display content purpose, which the tables do not list.

## Configuration GDRs

Type owner: [Configuration](../foundation/configuration.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `standard` | CampaignConfiguration | [Campaign configuration preset](../foundation/game-data-records.md#glossary) | The [Game build default preset](../foundation/configuration.md#game-build-default-preset) under [Campaign configuration presets](../foundation/configuration.md#campaign-configuration-presets): the Agency's starting money and starting recurring funding. |
| `configuration_parameters` | ConfigurationParameters | None of the listed purposes | Which preset is the [Game build default preset](../foundation/configuration.md#glossary), under [Game build default preset](../foundation/configuration.md#game-build-default-preset). |

## Agents GDRs

Type owner: [Agents](../mechanics/agents-spec.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `field_agent` | AgentArchetype | Archetype | Every [Agent](../mechanics/domain-model.md#agency-and-agents)'s [base skill](../mechanics/agents-spec.md#combatant-attributes), Weapon, and `base_health` when created. An Agent's [base health](../mechanics/agents-spec.md#combatant-attributes) equals `base_health`, and a new Agent has no [health lost](../mechanics/agents-spec.md#combatant-attributes). |
| `agent_parameters` | AgentParameters | [Campaign instance](../foundation/core-concepts.md#campaign-instances) initialization, Calculation parameter | The size of the initial roster; the [exhaustion](../mechanics/agents-spec.md#combatant-attributes) at which a [Combatant](../mechanics/domain-model.md#combat) is [Incapacitated](../mechanics/combat.md#combatant-condition-in-a-combat), the exhaustion without effect, and the base skill lost per further point; exhaustion per attack and per defense, per [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and per percent of a team [Killed](../mechanics/agents-spec.md#agent-statuses), and per [Turn](../foundation/engine-contract.md#player-actions-and-turns) of [Contracting](../mechanics/agents-spec.md#assignments), [Training](../mechanics/agents-spec.md#assignments), and investigating; the most exhaustion at which an Agent can start work and the exhaustion that ends its work; the base skill gained per Turn of Training; and the [Experience](../mechanics/agents-spec.md#growth) earned per attack made or taken in a Combat, by hit or miss, and per Mission survived. |

## Economy and Upgrades GDRs

Type owner: [Economy and Upgrades](../mechanics/economy-and-upgrades.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `agency` | AgencyArchetype | Archetype | The Agency's display name. |
| `economy` | EconomyParameters | Calculation parameter | Hire cost, upkeep per Agent, contracting income per Agent, and the starting [Agent cap](../mechanics/economy-and-upgrades.md#glossary), [Transport cap](../mechanics/economy-and-upgrades.md#glossary), and [Training cap](../mechanics/economy-and-upgrades.md#glossary). |
| `agent_cap` | Upgrade | Calculation parameter | Price and increment of the [Upgrade](../mechanics/domain-model.md#agency-and-agents) raising the [Agent cap](../mechanics/domain-model.md#agency-and-agents). |
| `transport_cap` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the Transport cap. |
| `training_cap` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the Training cap. |
| `weapon_damage` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the [effective weapon damage](../mechanics/agents-spec.md#combatant-attributes) of every [Serving](../mechanics/agents-spec.md#agent-statuses) Agent. |
| `max_health` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the [effective max health](../mechanics/agents-spec.md#combatant-attributes) and [current health](../mechanics/agents-spec.md#combatant-attributes) of every Serving Agent. |
| `training_skill_gain` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the base skill every Agent on Training gains. |
| `exhaustion_recovery` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the exhaustion every resting Agent loses. |
| `health_recovery` | Upgrade | Calculation parameter | Price and increment of the Upgrade raising the percentage of effective max health every Agent on [Recovery](../mechanics/agents-spec.md#assignments) regains. |

Three Upgrades raise an Agency-wide cap, two change a value of every Agent, and three raise a rate every Agent shares, so Economy and Upgrades must specify each kind of Upgrade effect.

## Leads and Progression GDRs

Type owner: [Leads and Progression](../mechanics/leads-and-progression.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `locate_red_dawn_member` | Lead | Referenced GDR, Key for campaign facts | The first Lead of the Victory path; it has no prerequisites and creates `apprehend_member`. |
| `locate_red_dawn_safehouse` | Lead | Referenced GDR, Key for campaign facts | Requires a Won [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) from `locate_red_dawn_member`; creates `raid_safehouse`. |
| `locate_red_dawn_hq` | Lead | Referenced GDR, Key for campaign facts | Requires a Won Mission from `locate_red_dawn_safehouse`; creates `raid_hq`. |
| `locate_exalt_member`, `locate_exalt_safehouse`, `locate_exalt_hq` | Lead | Referenced GDR, Key for campaign facts | The Victory path of Exalt: as the three Leads of Red Dawn, with the same `required_progress`, prerequisites, and MissionSiteArchetypes. |
| `locate_black_lotus_member`, `locate_black_lotus_safehouse`, `locate_black_lotus_hq` | Lead | Referenced GDR, Key for campaign facts | The Victory path of Black Lotus: as the three Leads of Red Dawn, with the same `required_progress`, prerequisites, and MissionSiteArchetypes. |

Each Lead references its Faction, e.g. `red_dawn`, explicitly through its `faction` property, and names its prerequisite Leads and the MissionSiteArchetype it creates by GDR identifier, so no relationship is inferred from identifier text under [References](../foundation/campaign-instances.md#references) in Campaign Instances.

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
| `apprehend_member` | MissionSiteArchetype | Archetype | An Initiative Mission site: its `expires_in_turns`, its Enemies by EnemyArchetype and count, and its rewards for a win. |
| `raid_safehouse` | MissionSiteArchetype | Archetype | An Initiative Mission site: its `expires_in_turns`, its Enemies by EnemyArchetype and count, and its rewards for a win. |
| `raid_hq` | MissionSiteArchetype | Archetype | An Initiative Mission site: its `expires_in_turns` and its Enemies by EnemyArchetype and count; a win eliminates its target Faction. |
| `foil_recruitment_push` | MissionSiteArchetype | Archetype | A [Response Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of Faction operation level 1: its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `foil_sabotage` | MissionSiteArchetype | Archetype | A Response Mission site of Faction operation level 2: its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `foil_supply_theft`, `foil_business_extortion` | MissionSiteArchetype | Archetype | Further Response Mission sites of Faction operation level 1: each its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `foil_vip_assassination`, `defend_against_office_raid` | MissionSiteArchetype | Archetype | Further Response Mission sites of Faction operation level 2: each its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `foil_financial_heist`, `intercept_arms_deal`, `defend_against_facility_raid` | MissionSiteArchetype | Archetype | Further Response Mission sites of Faction operation level 3: each its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `counter_civilian_terror`, `defend_against_city_government_assault`, `defend_against_retaliation_strike` | MissionSiteArchetype | Archetype | Further Response Mission sites of Faction operation level 4: each its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `foil_coup_attempt`, `foil_nuclear_plant_bombing`, `defend_military_installation` | MissionSiteArchetype | Archetype | Further Response Mission sites of Faction operation level 5: each its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `defend_against_hq_assault` | MissionSiteArchetype | Archetype | The one Response Mission site of Faction operation level 6: its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `standard_mission` | MissionArchetype | Archetype | The Archetype of every Mission. |

No MissionSiteArchetype references a Faction. A Mission site's target Faction is a value in its [Constants](../foundation/core-concepts.md#campaign-instances): for an Initiative Mission site it is the Faction whose Archetype is the creating Lead's `faction`, and for a Response Mission site it is the initiating Faction. The three Factions therefore share every MissionSiteArchetype, and each supplies only its own Leads. A `mission_won` [Condition](../foundation/conditions.md#glossary) of a Lead holds only for a Won Mission targeting the Lead's own Faction, under [Lead discovery](../mechanics/leads-and-progression.md#lead-discovery) in Leads and Progression, so a win against one Faction never advances the Victory path of another.

## Combat GDRs

Type owner: [Combat](../mechanics/combat.md).

| GDR | Type | GDR purpose | What it supplies |
| --- | --- | --- | --- |
| `initiate` | EnemyArchetype | Archetype | The weakest [Enemy](../mechanics/domain-model.md#combat): base skill, base health, and Weapon. |
| `operative` | EnemyArchetype | Archetype | An Enemy a little stronger than `initiate`: base skill, base health, and Weapon. |
| `handler` | EnemyArchetype | Archetype | The officer of `initiate` and `operative` Enemies: base skill, base health, and Weapon. |
| `soldier` | EnemyArchetype | Archetype | An Enemy roughly matching a newly hired Agent: base skill, base health, and Weapon. |
| `lieutenant` | EnemyArchetype | Archetype | The officer of `soldier` Enemies: base skill, base health, and Weapon. |
| `elite` | EnemyArchetype | Archetype | An Enemy about twice as skilled as `soldier`: base skill, base health, and Weapon. No Bootstrap MissionSiteArchetype has one yet. |
| `commander` | EnemyArchetype | Archetype | The officer of `elite` Enemies: base skill, base health, and Weapon. No Bootstrap MissionSiteArchetype has one yet. |
| `high_commander` | EnemyArchetype | Archetype | The strongest officer below `cult_leader`: base skill, base health, and Weapon. No Bootstrap MissionSiteArchetype has one yet. |
| `cult_leader` | EnemyArchetype | Archetype | The Enemy that leads a Faction, met only in `raid_hq`: base skill, base health, and Weapon. |
| `pistol` | Weapon | Referenced GDR | [Base weapon damage](../mechanics/agents-spec.md#combatant-attributes) of the Weapon of `initiate`. |
| `sidearm` | Weapon | Referenced GDR | Base weapon damage of the Weapon of every Agent, of `operative`, and of `handler`. |
| `rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `soldier`. |
| `battle_rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `lieutenant`. |
| `assault_rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `elite`. |
| `heavy_rifle` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `commander` and of `cult_leader`. |
| `machine_gun` | Weapon | Referenced GDR | Base weapon damage of the Weapon of `high_commander`. |
| `combat_parameters` | CombatParameters | Calculation parameter | The spread of the damage outcome around base weapon damage, the two retreat thresholds, and the incapacitation threshold. |

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
| `operation_level_2`, `operation_level_3`, `operation_level_4`, `operation_level_5` | FactionOperationLevel | Calculation parameter | As `operation_level_1`, for levels 2 to 5. |
| `operation_level_6` | FactionOperationLevel | Calculation parameter | No gain when the Mission at a Response Mission site of level 6 is Won, and the Campaign lost, with Panic unchanged, when the site is Expired or its Mission Lost. |

Each MissionSiteArchetype of kind response states its Faction operation level. A Faction selects a level by weight, and [MissionSiteArchetype selection](../mechanics/missions.md#missionsitearchetype-selection) in Missions then selects a MissionSiteArchetype of kind response with that level. The Bootstrap GDRs supply three MissionSiteArchetypes of kind response for each of levels 1 to 5, and one for level 6.

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
| `mechanics_turns`, `mechanics_agents`, `mechanics_skill`, `mechanics_skill_gain`, `mechanics_experience`, `mechanics_health`, `mechanics_recovery`, `mechanics_exhaustion`, `mechanics_assignments`, `mechanics_contracting`, `mechanics_training`, `mechanics_transit`, `mechanics_hiring_and_upkeep`, `mechanics_money_and_funding`, `mechanics_leads`, `mechanics_investigations`, `mechanics_mission_sites`, `mechanics_missions`, `mechanics_combat`, `mechanics_damage`, `mechanics_retreat`, `mechanics_factions`, `mechanics_faction_operations`, `mechanics_panic`, `mechanics_upgrades`, `mechanics_winning_and_losing` | CompendiumArticle | Display content | The 26 Mechanics articles, one for each mechanic the Player meets, each with the formulas of that mechanic. |
| One `<subject>_article` for each of `field_agent`, `initiate`, `operative`, `handler`, `soldier`, `lieutenant`, `elite`, `commander`, `high_commander`, `cult_leader`, `pistol`, `sidearm`, `rifle`, `battle_rifle`, `assault_rifle`, `heavy_rifle`, `machine_gun`, `agent_cap`, `transport_cap`, `training_cap`, `weapon_damage`, `max_health`, `training_skill_gain`, `exhaustion_recovery`, `health_recovery`, `red_dawn`, `locate_red_dawn_member`, `locate_red_dawn_safehouse`, `locate_red_dawn_hq`, `exalt`, `locate_exalt_member`, `locate_exalt_safehouse`, `locate_exalt_hq`, `black_lotus`, `locate_black_lotus_member`, `locate_black_lotus_safehouse`, `locate_black_lotus_hq`, `apprehend_member`, `raid_safehouse`, `raid_hq`, `foil_recruitment_push`, `foil_sabotage`, `foil_supply_theft`, `foil_business_extortion`, `foil_vip_assassination`, `defend_against_office_raid`, `foil_financial_heist`, `intercept_arms_deal`, `defend_against_facility_raid`, `counter_civilian_terror`, `defend_against_city_government_assault`, `defend_against_retaliation_strike`, `foil_coup_attempt`, `foil_nuclear_plant_bombing`, `defend_military_installation`, and `defend_against_hq_assault` | CompendiumArticle | Display content | A Subject article about that GDR, e.g. `soldier_article` about the EnemyArchetype `soldier`. |

Every AgentArchetype, EnemyArchetype, Weapon, Upgrade, FactionArchetype, Lead, and MissionSiteArchetype of the Bootstrap GDRs has a Subject article. The identifier of a Guide article starts with `guide_`, that of a Mechanics article with `mechanics_`, and that of a Subject article is the identifier of its subject followed by `_article`, so that no article's identifier equals that of another GDR; the identifiers carry no meaning beyond that, under [References](../foundation/campaign-instances.md#references) in Campaign Instances. Every value of a GDR that an article states is a [Placeholder](../mechanics/compendium.md#glossary), and only a number that is part of a rule itself is written out, e.g. the 100 and 500 of the contracting income formula; [Compendium coverage](#compendium-coverage) states which GDR values the articles must cover.

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

# Bootstrap GDR files

The Bootstrap GDRs are authored in YAML files under the `content/` directory at the repository root. The YAML file of a GDR is the only place its values are recorded. The layout of the files follows [GDR file layout](../foundation/game-data-records.md#gdr-file-layout) in Game Data Records.

The following table is exhaustive: it lists every Bootstrap GDR file, and the one directory that holds one file per GDR.

| File | Type | GDRs |
| --- | --- | --- |
| `content/configuration/campaign_configurations.yaml` | CampaignConfiguration | `standard` |
| `content/configuration/configuration_parameters.yaml` | ConfigurationParameters | `configuration_parameters` |
| `content/agents/agent_archetypes.yaml` | AgentArchetype | `field_agent` |
| `content/agents/agent_parameters.yaml` | AgentParameters | `agent_parameters` |
| `content/economy-and-upgrades/agency_archetypes.yaml` | AgencyArchetype | `agency` |
| `content/economy-and-upgrades/economy_parameters.yaml` | EconomyParameters | `economy` |
| `content/economy-and-upgrades/upgrades.yaml` | Upgrade | `agent_cap`, `transport_cap`, `training_cap`, `weapon_damage`, `max_health`, `training_skill_gain`, `exhaustion_recovery`, `health_recovery` |
| `content/leads-and-progression/leads.yaml` | Lead | `locate_red_dawn_member`, `locate_red_dawn_safehouse`, `locate_red_dawn_hq`, `locate_exalt_member`, `locate_exalt_safehouse`, `locate_exalt_hq`, `locate_black_lotus_member`, `locate_black_lotus_safehouse`, `locate_black_lotus_hq` |
| `content/investigations/investigation_archetypes.yaml` | InvestigationArchetype | `standard_investigation` |
| `content/investigations/investigation_parameters.yaml` | InvestigationParameters | `investigation_parameters` |
| `content/missions/mission_site_archetypes.yaml` | MissionSiteArchetype | `apprehend_member`, `raid_safehouse`, `raid_hq`, `foil_recruitment_push`, `foil_sabotage`, `foil_supply_theft`, `foil_business_extortion`, `foil_vip_assassination`, `defend_against_office_raid`, `foil_financial_heist`, `intercept_arms_deal`, `defend_against_facility_raid`, `counter_civilian_terror`, `defend_against_city_government_assault`, `defend_against_retaliation_strike`, `foil_coup_attempt`, `foil_nuclear_plant_bombing`, `defend_military_installation`, `defend_against_hq_assault` |
| `content/missions/mission_archetypes.yaml` | MissionArchetype | `standard_mission` |
| `content/combat/enemy_archetypes.yaml` | EnemyArchetype | `initiate`, `operative`, `handler`, `soldier`, `lieutenant`, `elite`, `commander`, `high_commander`, `cult_leader` |
| `content/combat/weapons.yaml` | Weapon | `pistol`, `sidearm`, `rifle`, `battle_rifle`, `assault_rifle`, `heavy_rifle`, `machine_gun` |
| `content/combat/combat_parameters.yaml` | CombatParameters | `combat_parameters` |
| `content/agent-recovery/recovery_parameters.yaml` | RecoveryParameters | `recovery` |
| `content/factions/faction_archetypes.yaml` | FactionArchetype | `red_dawn`, `exalt`, `black_lotus` |
| `content/factions/faction_activity_levels.yaml` | FactionActivityLevel | `dormant`, `faint`, `emerging`, `active`, `expanding`, `escalating`, `war`, `total_war` |
| `content/factions/faction_operation_levels.yaml` | FactionOperationLevel | `operation_level_1`, `operation_level_2`, `operation_level_3`, `operation_level_4`, `operation_level_5`, `operation_level_6` |
| `content/panic-and-endings/ending_parameters.yaml` | EndingParameters | `endings` |
| `content/compendium/compendium_articles/<id>.yaml` | CompendiumArticle | The 87 GDRs under [Compendium GDRs](#compendium-gdrs), each in a file named after its identifier, e.g. `content/compendium/compendium_articles/mechanics_combat.yaml` |
| `content/visual-design/background_artworks.yaml` | BackgroundArtwork | `missions_view_artwork`, `agents_view_artwork`, `leads_view_artwork` |
| `content/music/music_parameters.yaml` | MusicParameters | `music` |

# Compendium coverage

The Compendium is a complete reference only if every number behind a mechanic can be looked up in it, so the Compendium articles must keep up with the parameter GDRs as mechanics are added.

**Proposed rule:** Every property, other than `id` and `type`, of every parameter GDR of the Bootstrap GDRs, i.e. of every GDR whose Type name ends in "Parameters", is named by a [Placeholder](../mechanics/compendium.md#glossary) of at least one Compendium article of the Bootstrap GDRs, as [Coverage of parameter GDRs](../mechanics/compendium.md#coverage-of-parameter-gdrs) in Compendium requires. A Placeholder with an index names the list property it indexes. The following properties are exempt, because none of them is part of a mechanic the Player plays with. The table is exhaustive, and a Placeholder must not name an exempt property.

| GDR | Property | Why it is exempt |
| --- | --- | --- |
| `configuration_parameters` | `default_preset` | It names the preset that campaign creation starts from, which the Player sees while creating a Campaign. |
| `music` | `excluded_tracks` | It lists the music files left out of the [Soundtrack](../ui/music.md#glossary). |

The repository check `npm run compendium:check` enforces this rule, together with [Compendium article GDR validation](../mechanics/compendium.md#compendium-article-gdr-validation), and reads the exemptions from the table above. Adding a property to a parameter GDR therefore fails the check until an article explains the property or the table exempts it.

# Victory path

Each Faction has a Victory path of its own, and the three are alike: three Leads of that Faction, each creating one Initiative Mission site. A Won Mission there makes the next Lead of the same Faction available, and winning `raid_hq` eliminates that Faction. The Agency can pursue the three Victory paths in any order and at once. With the last of the three Factions eliminated, every Faction is eliminated, which wins the Campaign. Throughout the Campaign, the activity of each Faction not yet eliminated creates [Faction operation occurrences](../mechanics/domain-model.md#factions), each with one Response Mission site; a Response Mission site that is Expired, or whose Mission is Lost, raises Panic, and enough Panic loses the Campaign.

![Victory path of one Faction of the Bootstrap GDRs, e.g. Red Dawn: three Leads each create one Initiative Mission site, a Won Mission there makes the next Lead available, and winning raid_hq eliminates the Faction, which wins the Campaign once every Faction is eliminated; throughout the Campaign, the Faction's activity creates Response Mission sites whose expiration or loss raises Panic until the Campaign is lost](../../../images/diagrams/bootstrap-victory-path.svg)

An Initiative Mission site that is Expired, or whose Mission is Lost, records no win, so its Lead becomes available again and the Agency can obtain a new Mission site from it. A Mission site cannot be attempted twice. Every Lead of the Victory path therefore remains available until a Mission at a Mission site it created is Won.

The Victory path works through these rules:

- [Lead availability](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), under [Lead availability](../mechanics/leads-and-progression.md#lead-availability); Lead discovery, under [Lead discovery](../mechanics/leads-and-progression.md#lead-discovery); and the effect of completing a Lead, under [Completion effect](../mechanics/leads-and-progression.md#completion-effect), all in [Leads and Progression](../mechanics/leads-and-progression.md).
- Mission site creation, expiration, and the [Consequences](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of a Mission's win or loss, under [Mission site creation](../mechanics/missions.md#mission-site-creation), [Mission site expiration](../mechanics/missions.md#mission-site-expiration), and [Consequences](../mechanics/missions.md#consequences) in [Missions](../mechanics/missions.md).
- Faction activity and elimination, under [Faction activity](../mechanics/factions.md#faction-activity) and [Elimination](../mechanics/factions.md#elimination) in [Factions](../mechanics/factions.md).
- The conditions that end the Campaign, and which [Campaign ending](../mechanics/domain-model.md#campaign-standing) applies when Victory and Defeat hold together, under [Ending check step](../mechanics/panic-and-endings.md#ending-check-step) in [Panic and Endings](../mechanics/panic-and-endings.md).

# Initial Campaign state sources

For each Campaign instance Type, the following table names the section that states which initial Campaign instances exist with the Bootstrap GDRs and the source of each initial value, as [Initial Campaign state](../mechanics/domain-model.md#initial-campaign-state) requires. This table is exhaustive.

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

- TODO (later): Faction suppression after a Won Mission, under [Factions GDRs](#factions-gdrs).
- TODO (later): Initiative Mission sites of game-ts levels 3 to 7, and the interrogation Leads between them, under [Missions GDRs](#missions-gdrs).
- TODO (later): Partial success of a Lost Mission, under [Consequences](../mechanics/missions.md#consequences) in Missions.
- TODO (later): The Leads Criminal organizations, Deep state, and Peace on Earth, and Faction discovery through a profile Lead, under [Leads and Progression GDRs](#leads-and-progression-gdrs).

# Appendix: Derivation from game-ts

This appendix is informative. **Inherited behavior** evidence comes from game-ts revision `f1835a29`, in its data tables and its initial game state factory.

The items under [TODOs](#todos) list exhaustively the game-ts content that the Bootstrap GDRs exclude, in the order in which it is expected to return.

Most Bootstrap GDR values are copied from game-ts. The following table is exhaustive: it lists every Bootstrap GDR value that deliberately differs from its game-ts counterpart, and why.

| Bootstrap GDR value | game-ts | Bootstrap | Informative rationale |
| --- | --- | --- | --- |
| Weapons | A weapon damage number on each enemy kind, with no weapon of its own | Seven Weapons, each shared by the EnemyArchetypes of equal base weapon damage | A Combatant's base weapon damage comes from a Weapon GDR. |
| `cult_leader` base skill, base health, and Weapon | Cult leader: base skill 800, base health 80, weapon damage 32 | The values and the Weapon of `commander` | An 800-skill Enemy cannot be beaten after a three-step Victory path. |
| Target selection | Attacks spread over the opponents attacked least often, each attacker preferring an opponent near half its [effective skill](../mechanics/agents-spec.md#combatant-attributes), with wounded opponents dropping out at random | The opponent with the highest effective skill | The simpler rule stays until target selection is redesigned. |
| `locate_red_dawn_hq` `required_progress` | 25 | Lower | The HQ is the third step of three, not the eighth of eight. |
| `raid_hq` expiration and Enemies | Expires in 40 Turns; 111 Enemies | Shorter; ten Enemies | Winnable by six to eight trained Agents, i.e. after one or two purchases of the Transport cap Upgrade; a starting-size team rarely wins. |
| Starting transport cap | 6 | Lower, raised by `transport_cap` | Transport capacity becomes something the Agency invests in. |
| Starting training cap | 0 | Above zero, raised by `training_cap` | Training is available from the first Turn. |
| `operation_level_6` when ignored or lost | Panic is set to 100% | A `defeat` [Effect](../foundation/effect-lists.md#glossary), which loses the Campaign and leaves Panic unchanged | The Campaign ends with the Panic it had, and no Panic reduction of the same Advance turn can undo the loss. |
| First operation of a Faction that leaves `dormant` | Its countdown starts in the turn it wakes and is counted down in that same turn | Its countdown starts in the Advance turn it wakes and is first counted down in the next | An operation never happens in the Advance turn that sets its countdown. |
| Victory | Completing the Lead Peace on Earth | Every Faction eliminated | One Lead fewer, and the condition does not depend on a specially named GDR. |
| Faction discovery | Through a profile Lead | Every Faction is known from the start | Removes the profile and interrogation Leads. |
| `exhaustion_free_points` | 5 | 30 | Work now raises exhaustion every Turn, so a longer free amount lets an Agent work for many Turns before it weakens. |
| `exhaustion_work_start_max` and `exhaustion_work_limit` | A 30% "Ready" convention of the UI and AI; Agents at 100 cannot be assigned and leave an Investigation | 30 and 70, enforced by the engine | Tiredness stops at a level where a recalled Agent is still useful, and the rules no longer depend on the UI. |
| `exhaustion_per_pct_killed` | 5 per 5% of the team lost, rounded up | 1 per 1%, rounded up | The same amount at every multiple of 5%, stated more plainly. |
| Upgrades | 8, with no distinction between cap and stat upgrades | 8, in four kinds of Upgrade effect | game-ts left distinguishing the kinds of upgrade as an open item in its upgrade definitions. |
