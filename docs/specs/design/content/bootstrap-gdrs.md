# Bootstrap GDRs

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | BOOT                                                                                                                                                                       |
| Family      | Content                                                                                                                                                                    |
| Audience    | Engine designer, Content designer, Implementer                                                                                                                             |
| Owns        | Which Game Data Records (GDRs) a Game build supplies so that a first playable Campaign can start, and how those GDRs form the Victory path.                                |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Campaign](../foundation/core-concepts.md#campaign-and-session) cannot be played without content, e.g. Agents to hire and a [Faction](../mechanics/domain-model.md#factions) to fight. The Bootstrap GDRs are the
smallest set of Game Data Records ([GDRs](../foundation/core-concepts.md#game-build-and-content)) that a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies so that a first playable Campaign can be created
and played to an ending. They keep every kind of GDR that the [Domain Model](../mechanics/domain-model.md) requires and
supply as few of each as will do; most values are copied from game-ts.

The content is shaped around one way to win and one way to lose. The only Faction, Red Dawn, has three [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), each
creating one [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions); together they form the Victory path, and winning the last of them eliminates Red
Dawn and wins the Campaign. Meanwhile, Red Dawn's activity creates [Response Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). One that is Expired, or whose
[Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is Lost, raises [Panic](../mechanics/domain-model.md#campaign-standing), and enough Panic loses the Campaign.

# Glossary

| Term           | Definition                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bootstrap GDRs | The [GDRs](../foundation/core-concepts.md#game-build-and-content) a [Game build](../foundation/core-concepts.md#game-build-and-content) must supply so that a first playable [Campaign](../foundation/core-concepts.md#campaign-and-session) can be created and played to an ending.                                                                                                                           |
| Victory path   | The sequence of [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and [Initiative Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) by which the [Agency](../mechanics/domain-model.md#agency-and-agents) can eliminate every [Faction](../mechanics/domain-model.md#factions) and so win the Campaign with the Bootstrap GDRs. |

# Bootstrap scope

The Bootstrap GDRs keep every kind of GDR the [Game concepts](../mechanics/domain-model.md#game-concepts) of Domain Model
require and reduce how many of each exist. The following table is exhaustive: it counts every Bootstrap GDR by the
Domain Model concept it serves, and the [Background artwork](../ui/visual-design.md#glossary) and [Soundtrack](../ui/music.md#glossary) GDRs, which serve the user interface
rather than a Domain Model concept, in rows of their own.

| Domain Model concept                                                                                   | Bootstrap GDRs                                                                                                                                                  | Count |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| [Campaign configuration](../foundation/campaign-state.md#glossary)                                     | One [Campaign configuration preset](../foundation/configuration.md#glossary) and one parameter GDR naming it as the default                                     | 2     |
| Agency                                                                                                 | One AgencyArchetype                                                                                                                                             | 1     |
| Agent                                                                                                  | One AgentArchetype and one parameter GDR                                                                                                                        | 2     |
| Lead and [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) | Three Leads of one Faction, one InvestigationArchetype, and one parameter GDR                                                                                   | 5     |
| [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)           | Three MissionSiteArchetypes of kind initiative and two of kind response                                                                                         | 5     |
| Mission                                                                                                | One MissionArchetype                                                                                                                                            | 1     |
| Enemy and [Combat](../mechanics/domain-model.md#combat)                                                | Three EnemyArchetypes, three Weapons, and one parameter GDR                                                                                                     | 7     |
| Agent recovery                                                                                         | One parameter GDR                                                                                                                                               | 1     |
| Economy and upgrades                                                                                   | One parameter GDR and four [Upgrades](../mechanics/economy-and-upgrades.md#glossary)                                                                            | 5     |
| Faction                                                                                                | One FactionArchetype, three [Faction activity levels](../mechanics/factions.md#glossary), and two [Faction operation levels](../mechanics/factions.md#glossary) | 6     |
| Panic and endings                                                                                      | One parameter GDR                                                                                                                                               | 1     |
| [Encyclopedia article](../mechanics/compendium.md#glossary)                                            | Six [Guide articles](../mechanics/compendium.md#glossary) and one article about each of 20 other Bootstrap GDRs                                                 | 26    |
| [Background artwork](../ui/visual-design.md#glossary)                                                  | Three BackgroundArtworks                                                                                                                                        | 3     |
| [Soundtrack](../ui/music.md#glossary)                                                                  | One parameter GDR                                                                                                                                               | 1     |
| **Total**                                                                                              |                                                                                                                                                                 | 66    |

A parameter GDR bundles the scalar values one Mechanics specification reads, e.g. the hire cost and upkeep of
Economy and Upgrades in the GDR `economy`, instead of supplying each value as a GDR of its own.

# Bootstrap GDR catalog

The Bootstrap GDRs are grouped by the specification that owns their [Type](../foundation/core-concepts.md#data-modeling), and each group is exhaustive. GDR purposes
are those defined under [Purposes of GDRs](../foundation/game-data-records.md#purposes-of-gdrs). Every GDR whose Type
has a `name` property also serves the Display content purpose, which the tables do not list.

## Configuration GDRs

Type owner: [Configuration](../foundation/configuration.md).

| GDR                        | Type                    | GDR purpose                                                                  | What it supplies                                                                                                                                                                                                                                             |
| -------------------------- | ----------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `standard`                 | CampaignConfiguration   | [Campaign configuration preset](../foundation/game-data-records.md#glossary) | The [Game build default preset](../foundation/configuration.md#game-build-default-preset) under [Campaign configuration presets](../foundation/configuration.md#campaign-configuration-presets): the Agency's starting money and starting recurring funding. |
| `configuration_parameters` | ConfigurationParameters | None of the listed purposes                                                  | Which preset is the [Game build default preset](../foundation/configuration.md#glossary), under [Game build default preset](../foundation/configuration.md#game-build-default-preset).                                                                       |

## Agents GDRs

Type owner: [Agents](../mechanics/agents-spec.md).

| GDR                | Type            | GDR purpose                                                                                                  | What it supplies                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `field_agent`      | AgentArchetype  | Archetype                                                                                                    | Every [Agent](../mechanics/domain-model.md#agency-and-agents)'s [base skill](../mechanics/agents-spec.md#combatant-attributes), Weapon, and `base_health` when created. An Agent starts with both its [base health](../mechanics/agents-spec.md#combatant-attributes) and its [current health](../mechanics/agents-spec.md#combatant-attributes) equal to `base_health`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `agent_parameters` | AgentParameters | [Campaign instance](../foundation/core-concepts.md#campaign-instances) initialization, Calculation parameter | The size of the initial roster; the [exhaustion](../mechanics/agents-spec.md#combatant-attributes) at which a [Combatant](../mechanics/domain-model.md#combat) is [Incapacitated](../mechanics/combat.md#combatant-condition-in-a-combat), the exhaustion without effect, and the base skill lost per further point; exhaustion per attack and per defense, per [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and per percent of a team [Killed](../mechanics/agents-spec.md#agent-statuses), and per [Turn](../foundation/engine-contract.md#player-actions-and-turns) of [Contracting](../mechanics/agents-spec.md#assignments), [Training](../mechanics/agents-spec.md#assignments), and investigating; the most exhaustion at which an Agent can start work and the exhaustion that ends its work; base skill gained per Turn of Training. |

## Economy and Upgrades GDRs

Type owner: [Economy and Upgrades](../mechanics/economy-and-upgrades.md).

| GDR             | Type              | GDR purpose           | What it supplies                                                                                                                                                                                                                                                           |
| --------------- | ----------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agency`        | AgencyArchetype   | Archetype             | The Agency's display name.                                                                                                                                                                                                                                                 |
| `economy`       | EconomyParameters | Calculation parameter | Hire cost, upkeep per Agent, contracting income per Agent, and the starting [Agent cap](../mechanics/economy-and-upgrades.md#glossary), [Transport cap](../mechanics/economy-and-upgrades.md#glossary), and [Training cap](../mechanics/economy-and-upgrades.md#glossary). |
| `agent_cap`     | Upgrade           | Calculation parameter | Price and increment of the [Upgrade](../mechanics/domain-model.md#agency-and-agents) raising the [Agent cap](../mechanics/domain-model.md#agency-and-agents).                                                                                                              |
| `transport_cap` | Upgrade           | Calculation parameter | Price and increment of the Upgrade raising the Transport cap.                                                                                                                                                                                                              |
| `training_cap`  | Upgrade           | Calculation parameter | Price and increment of the Upgrade raising the Training cap.                                                                                                                                                                                                               |
| `weapon_damage` | Upgrade           | Calculation parameter | Price and increment of the Upgrade raising the [base weapon damage](../mechanics/agents-spec.md#combatant-attributes) of every Agent.                                                                                                                                      |

Three Upgrades raise an Agency-wide cap and one changes a value of every Agent, so Economy and Upgrades must specify
both kinds of Upgrade effect.

## Leads and Progression GDRs

Type owner: [Leads and Progression](../mechanics/leads-and-progression.md).

| GDR                         | Type | GDR purpose                            | What it supplies                                                                                                                                                |
| --------------------------- | ---- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locate_red_dawn_member`    | Lead | Referenced GDR, Key for campaign facts | The first Lead of the Victory path; it has no prerequisites and creates `apprehend_member`.                                                                     |
| `locate_red_dawn_safehouse` | Lead | Referenced GDR, Key for campaign facts | Requires a Won [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) from `locate_red_dawn_member`; creates `raid_safehouse`. |
| `locate_red_dawn_hq`        | Lead | Referenced GDR, Key for campaign facts | Requires a Won Mission from `locate_red_dawn_safehouse`; creates `raid_hq`.                                                                                     |

Each Lead references its Faction, `red_dawn`, explicitly through its `faction` property, and names its prerequisite
Leads and the MissionSiteArchetype it creates by GDR identifier, so no relationship is inferred from identifier text under
[References](../foundation/campaign-instances.md#references) in Campaign Instances.

## Investigations GDRs

Type owner: [Investigations](../mechanics/investigations.md).

| GDR                        | Type                    | GDR purpose           | What it supplies                                                                                                                                                                                                                                 |
| -------------------------- | ----------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `standard_investigation`   | InvestigationArchetype  | Archetype             | The [Archetype](../foundation/core-concepts.md#campaign-instances) of every Investigation.                                                                                                                                                       |
| `investigation_parameters` | InvestigationParameters | Calculation parameter | The team efficiency exponent 0.8, the greatest [Actual required progress](../mechanics/investigations.md#glossary) of 150% of a Lead's [Required progress](../mechanics/leads-and-progression.md#glossary), and the assessment threshold of 25%. |

An Investigation reads the `required_progress` of its Lead, under
[Lead properties this document reads](../mechanics/investigations.md#lead-properties-this-document-reads).

## Missions GDRs

Type owner: [Missions](../mechanics/missions.md).

| GDR                     | Type                 | GDR purpose | What it supplies                                                                                                                                                                                          |
| ----------------------- | -------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apprehend_member`      | MissionSiteArchetype | Archetype   | An Initiative Mission site: its `expires_in_turns`, its Enemies by EnemyArchetype and count, and its rewards for a win.                                                                                   |
| `raid_safehouse`        | MissionSiteArchetype | Archetype   | An Initiative Mission site: its `expires_in_turns`, its Enemies by EnemyArchetype and count, and its rewards for a win.                                                                                   |
| `raid_hq`               | MissionSiteArchetype | Archetype   | An Initiative Mission site: its `expires_in_turns` and its Enemies by EnemyArchetype and count; a win eliminates its target Faction.                                                                      |
| `foil_recruitment_push` | MissionSiteArchetype | Archetype   | A [Response Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of Faction operation level 1: its `expires_in_turns` and its Enemies by EnemyArchetype and count. |
| `foil_sabotage`         | MissionSiteArchetype | Archetype   | A Response Mission site of Faction operation level 2: its `expires_in_turns` and its Enemies by EnemyArchetype and count.                                                                                 |
| `standard_mission`      | MissionArchetype     | Archetype   | The Archetype of every Mission.                                                                                                                                                                           |

No MissionSiteArchetype references a Faction. A Mission site's target Faction is a value in its [Constants](../foundation/core-concepts.md#campaign-instances): for an
Initiative Mission site it is the Faction whose Archetype is the creating Lead's `faction`, and for a Response Mission
site it is the initiating Faction. Another Faction can therefore reuse every MissionSiteArchetype by supplying only its
own Leads.

## Combat GDRs

Type owner: [Combat](../mechanics/combat.md).

| GDR                 | Type             | GDR purpose           | What it supplies                                                                                                          |
| ------------------- | ---------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `initiate`          | EnemyArchetype   | Archetype             | The weakest [Enemy](../mechanics/domain-model.md#combat): base skill, base health, and Weapon.                            |
| `soldier`           | EnemyArchetype   | Archetype             | An Enemy roughly matching a newly hired Agent: base skill, base health, and Weapon.                                       |
| `cult_leader`       | EnemyArchetype   | Archetype             | The strongest Enemy, met only in `raid_hq`: base skill, base health, and Weapon.                                          |
| `sidearm`           | Weapon           | Referenced GDR        | [Base weapon damage](../mechanics/agents-spec.md#combatant-attributes) of the Weapon of every Agent and of `initiate`.    |
| `rifle`             | Weapon           | Referenced GDR        | Base weapon damage of the Weapon of `soldier`.                                                                            |
| `heavy_rifle`       | Weapon           | Referenced GDR        | Base weapon damage of the Weapon of `cult_leader`.                                                                        |
| `combat_parameters` | CombatParameters | Calculation parameter | The spread of the damage outcome around base weapon damage, the two retreat thresholds, and the incapacitation threshold. |

## Agent Recovery GDRs

Type owner: [Agent Recovery](../mechanics/agent-recovery.md).

| GDR        | Type               | GDR purpose           | What it supplies                                                                                          |
| ---------- | ------------------ | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `recovery` | RecoveryParameters | Calculation parameter | Health recovered per Turn, as a percentage of the Agent's base health, and exhaustion recovered per Turn. |

## Factions GDRs

Type owner: [Factions](../mechanics/factions.md).

| GDR                 | Type                  | GDR purpose           | What it supplies                                                                                                                                                                                                             |
| ------------------- | --------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `red_dawn`          | FactionArchetype      | Archetype             | The only Faction: its name and its initial Faction activity level, `faint`.                                                                                                                                                  |
| `faint`             | FactionActivityLevel  | Calculation parameter | How long the level lasts, how often an operation occurs, the weight of each Faction operation level, and the next level, `active`.                                                                                           |
| `active`            | FactionActivityLevel  | Calculation parameter | As `faint`; the next level is `war`.                                                                                                                                                                                         |
| `war`               | FactionActivityLevel  | Calculation parameter | As `faint`, except that it lasts indefinitely and has no next level.                                                                                                                                                         |
| `operation_level_1` | FactionOperationLevel | Calculation parameter | The money and funding gained when the Mission at a Response Mission site of level 1 is Won, and the [Panic](../mechanics/domain-model.md#campaign-standing) and funding change when the site is Expired or its Mission Lost. |
| `operation_level_2` | FactionOperationLevel | Calculation parameter | As `operation_level_1`, for level 2.                                                                                                                                                                                         |

Each MissionSiteArchetype of kind response states its Faction operation level. A Faction selects a level by weight, and
[MissionSiteArchetype selection](../mechanics/missions.md#missionsitearchetype-selection) in Missions then selects a MissionSiteArchetype of kind response
with that level. The Bootstrap GDRs supply exactly one MissionSiteArchetype of kind response per level.

## Panic and Endings GDRs

Type owner: [Panic and Endings](../mechanics/panic-and-endings.md).

| GDR       | Type             | GDR purpose           | What it supplies                         |
| --------- | ---------------- | --------------------- | ---------------------------------------- |
| `endings` | EndingParameters | Calculation parameter | The Panic at which the Campaign is lost. |

## Compendium GDRs

Type owner: [Compendium](../mechanics/compendium.md).

| GDR                                                                                                                                                                                                                                                                                                                                                                               | Type                | GDR purpose     | What it supplies                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------- | ------------------------------------------------------------------------------------- |
| `guide_agency`, `guide_agents`, `guide_investigations`, `guide_missions`, `guide_panic`, `guide_upgrades`                                                                                                                                                                                                                                                                         | EncyclopediaArticle | Display content | The six Guide articles, each explaining one part of the game in general.              |
| One `<subject>_article` for each of `field_agent`, `initiate`, `soldier`, `cult_leader`, `sidearm`, `rifle`, `heavy_rifle`, `agent_cap`, `transport_cap`, `training_cap`, `weapon_damage`, `red_dawn`, `locate_red_dawn_member`, `locate_red_dawn_safehouse`, `locate_red_dawn_hq`, `apprehend_member`, `raid_safehouse`, `raid_hq`, `foil_recruitment_push`, and `foil_sabotage` | EncyclopediaArticle | Display content | An article about that GDR, e.g. `soldier_article` about the EnemyArchetype `soldier`. |

Every Bootstrap GDR with a `name` that the Player can see has an article, except the AgencyArchetype `agency` and the
MissionArchetype `standard_mission`, which only name the Player's own Agency and every Mission.

## Visual Design GDRs

Type owner: [Visual Design](../ui/visual-design.md).

| GDR                     | Type              | GDR purpose     | What it supplies                                                                                                                                               |
| ----------------------- | ----------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `missions_view_artwork` | BackgroundArtwork | Display content | The [Background artwork](../ui/visual-design.md#background-artwork) of the [Missions View](../ui/screens/missions-view.md), a command center, and its opacity. |
| `agents_view_artwork`   | BackgroundArtwork | Display content | The Background artwork of the [Agents View](../ui/screens/agents-view.md), Agents in an equipment room, and its opacity.                                       |
| `leads_view_artwork`    | BackgroundArtwork | Display content | The Background artwork of the [Leads View](../ui/screens/leads-view.md), an agent watching a crowded street in the rain, and its opacity.                      |

## Music GDRs

Type owner: [Music](../ui/music.md).

| GDR     | Type            | GDR purpose     | What it supplies                                                                        |
| ------- | --------------- | --------------- | --------------------------------------------------------------------------------------- |
| `music` | MusicParameters | Display content | The files of `assets/music/` excluded from the [Soundtrack](../ui/music.md#soundtrack). |

# Bootstrap GDR files

The Bootstrap GDRs are authored in YAML files under the `content/` directory at the repository root. The YAML file of a
GDR is the only place its values are recorded. The layout of the files follows
[GDR file layout](../foundation/game-data-records.md#gdr-file-layout) in Game Data Records.

The following table is exhaustive: it lists every Bootstrap GDR file.

| File                                                   | Type                    | GDRs                                                                                      |
| ------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------- |
| `content/configuration/campaign_configurations.yaml`   | CampaignConfiguration   | `standard`                                                                                |
| `content/configuration/configuration_parameters.yaml`  | ConfigurationParameters | `configuration_parameters`                                                                |
| `content/agents/agent_archetypes.yaml`                 | AgentArchetype          | `field_agent`                                                                             |
| `content/agents/agent_parameters.yaml`                 | AgentParameters         | `agent_parameters`                                                                        |
| `content/economy-and-upgrades/agency_archetypes.yaml`  | AgencyArchetype         | `agency`                                                                                  |
| `content/economy-and-upgrades/economy_parameters.yaml` | EconomyParameters       | `economy`                                                                                 |
| `content/economy-and-upgrades/upgrades.yaml`           | Upgrade                 | `agent_cap`, `transport_cap`, `training_cap`, `weapon_damage`                             |
| `content/leads-and-progression/leads.yaml`             | Lead                    | `locate_red_dawn_member`, `locate_red_dawn_safehouse`, `locate_red_dawn_hq`               |
| `content/investigations/investigation_archetypes.yaml` | InvestigationArchetype  | `standard_investigation`                                                                  |
| `content/investigations/investigation_parameters.yaml` | InvestigationParameters | `investigation_parameters`                                                                |
| `content/missions/mission_site_archetypes.yaml`        | MissionSiteArchetype    | `apprehend_member`, `raid_safehouse`, `raid_hq`, `foil_recruitment_push`, `foil_sabotage` |
| `content/missions/mission_archetypes.yaml`             | MissionArchetype        | `standard_mission`                                                                        |
| `content/combat/enemy_archetypes.yaml`                 | EnemyArchetype          | `initiate`, `soldier`, `cult_leader`                                                      |
| `content/combat/weapons.yaml`                          | Weapon                  | `sidearm`, `rifle`, `heavy_rifle`                                                         |
| `content/combat/combat_parameters.yaml`                | CombatParameters        | `combat_parameters`                                                                       |
| `content/agent-recovery/recovery_parameters.yaml`      | RecoveryParameters      | `recovery`                                                                                |
| `content/factions/faction_archetypes.yaml`             | FactionArchetype        | `red_dawn`                                                                                |
| `content/factions/faction_activity_levels.yaml`        | FactionActivityLevel    | `faint`, `active`, `war`                                                                  |
| `content/factions/faction_operation_levels.yaml`       | FactionOperationLevel   | `operation_level_1`, `operation_level_2`                                                  |
| `content/panic-and-endings/ending_parameters.yaml`     | EndingParameters        | `endings`                                                                                 |
| `content/compendium/encyclopedia_articles.yaml`        | EncyclopediaArticle     | The 26 GDRs under [Compendium GDRs](#compendium-gdrs)                                     |
| `content/visual-design/background_artworks.yaml`       | BackgroundArtwork       | `missions_view_artwork`, `agents_view_artwork`, `leads_view_artwork`                      |
| `content/music/music_parameters.yaml`                  | MusicParameters         | `music`                                                                                   |

# Victory path

The Victory path consists of three Leads, each creating one Initiative Mission site. A Won Mission there makes the next
Lead available, and winning `raid_hq` eliminates Red Dawn. With Red Dawn eliminated, every Faction is eliminated, which wins
the Campaign. Throughout the Campaign, Red Dawn's activity creates [Faction operation occurrences](../mechanics/domain-model.md#factions), each with one Response
Mission site; a Response Mission site that is Expired, or whose Mission is Lost, raises Panic, and enough Panic loses the Campaign.

![Victory path of the Bootstrap GDRs: three Leads each create one Initiative Mission site, a Won Mission there makes the next Lead available, and winning raid_hq eliminates Red Dawn and wins the Campaign; throughout the Campaign, Red Dawn activity creates Response Mission sites whose expiration or loss raises Panic until the Campaign is lost](../../../images/diagrams/bootstrap-victory-path.svg)

An Initiative Mission site that is Expired, or whose Mission is Lost, records no win, so its Lead becomes available again and the Agency
can obtain a new Mission site from it. A Mission site cannot be attempted twice. Every Lead of the Victory path
therefore remains available until a Mission at a Mission site it created is Won.

The Victory path works through these rules:

- [Lead availability](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), under [Lead availability](../mechanics/leads-and-progression.md#lead-availability); Lead
  prerequisites, under [Prerequisites](../mechanics/leads-and-progression.md#prerequisites); and the
  effect of completing a Lead, under [Completion effect](../mechanics/leads-and-progression.md#completion-effect), all in
  [Leads and Progression](../mechanics/leads-and-progression.md).
- Mission site creation, expiration, and the [Consequences](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of a Mission's win or loss, under
  [Mission site creation](../mechanics/missions.md#mission-site-creation),
  [Mission site expiration](../mechanics/missions.md#mission-site-expiration), and
  [Consequences](../mechanics/missions.md#consequences) in [Missions](../mechanics/missions.md).
- Faction activity and elimination, under [Faction activity](../mechanics/factions.md#faction-activity) and
  [Elimination](../mechanics/factions.md#elimination) in [Factions](../mechanics/factions.md).
- The conditions that end the Campaign, and which [Campaign ending](../mechanics/domain-model.md#campaign-standing) applies when Victory and Defeat hold together, under
  [Ending check step](../mechanics/panic-and-endings.md#ending-check-step) in
  [Panic and Endings](../mechanics/panic-and-endings.md).

# Initial Campaign state sources

For each Campaign instance Type, the following table names the section that states which initial Campaign instances
exist with the Bootstrap GDRs and the source of each initial value, as
[Initial Campaign state](../mechanics/domain-model.md#initial-campaign-state) requires. This table is exhaustive.

| Campaign instance Type | Section that states the initial Campaign instances and the source of each value                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agency                 | [Agency creation](../mechanics/economy-and-upgrades.md#agency-creation) in Economy and Upgrades                                                     |
| Agent                  | [Initial roster](../mechanics/agents-spec.md#initial-roster) in Agents                                                                              |
| Faction                | [Initial Factions](../mechanics/factions.md#initial-factions) in Factions                                                                           |
| Investigation          | [Investigation creation](../mechanics/investigations.md#investigation-creation) in Investigations                                                   |
| Mission site           | [Initial Mission sites](../mechanics/missions.md#initial-mission-sites) in Missions                                                                 |
| Mission                | [Initial Mission sites](../mechanics/missions.md#initial-mission-sites) in Missions, which states that no Mission exists initially                  |
| Enemy                  | [Enemy creation](../mechanics/combat.md#enemy-creation) in Combat, applied by [Enemy creation](../mechanics/missions.md#enemy-creation) in Missions |

The Turn and Panic start from values that no GDR supplies: the Turn under
[Turn number](../mechanics/turn-advancement.md#turn-number), and Panic under
[Initial values](../mechanics/panic-and-endings.md#initial-values).

# TODOs

- TODO (later): The Factions Exalt and Black Lotus, each with its own Leads reusing the existing MissionSiteArchetypes,
  under [Factions GDRs](#factions-gdrs).
- TODO (later): Faction suppression after a Won Mission, under [Factions GDRs](#factions-gdrs).
- TODO (later): [Base skill](../mechanics/agents-spec.md#combatant-attributes) gained by surviving a Mission and by attacking and defending in a Combat, under
  [Agents GDRs](#agents-gdrs).
- TODO (later): The Upgrades raising training skill gain, exhaustion recovery, health recovery, and Agent base health, under
  [Economy and Upgrades GDRs](#economy-and-upgrades-gdrs).
- TODO (later): Initiative Mission sites of game-ts levels 3 to 7, and the interrogation Leads between them, under
  [Missions GDRs](#missions-gdrs).
- TODO (later): Faction operation levels 3 to 6, including the level whose loss ends the Campaign, and their Response
  Mission sites, under [Factions GDRs](#factions-gdrs).
- TODO (later): The Faction activity levels Dormant, Emerging, Expanding, Escalating, and Total war, under
  [Factions GDRs](#factions-gdrs).
- TODO (later): Partial success of a Lost Mission, under [Consequences](../mechanics/missions.md#consequences) in
  Missions.
- TODO (later): The Leads Criminal organizations, Deep state, and Peace on Earth, and Faction discovery through a
  profile Lead, under [Leads and Progression GDRs](#leads-and-progression-gdrs).

# Appendix: Derivation from game-ts

This appendix is informative. **Inherited behavior** evidence comes from game-ts revision `f1835a29`, in
its data tables and its initial game state factory.

The items under [TODOs](#todos) list exhaustively the game-ts content that the Bootstrap GDRs exclude, in the order in
which it is expected to return.

Most Bootstrap GDR values are copied from game-ts. The following table is exhaustive: it lists every Bootstrap GDR
value that deliberately differs from its game-ts counterpart, and why.

| Bootstrap GDR value                                         | game-ts                                                                                                | Bootstrap                                 | Informative rationale                                                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| EnemyArchetypes                                             | 9 enemy kinds                                                                                          | 3                                         | `initiate` merges initiate and operative; `soldier` merges soldier, handler, and lieutenant; `cult_leader` replaces commander and above. |
| `cult_leader` base skill and base health                    | Cult leader: base skill 800, base health 80                                                            | game-ts commander values                  | An 800-skill Enemy cannot be beaten after a three-step Victory path.                                                                     |
| `initiate` Weapon                                           | Base weapon damage 8                                                                                   | `sidearm`                                 | Sharing the Agents' Weapon saves one Weapon GDR.                                                                                         |
| `locate_red_dawn_hq` `required_progress`                    | 25                                                                                                     | Lower                                     | The HQ is the third step of three, not the eighth of eight.                                                                              |
| `raid_hq` expiration and Enemies                            | Expires in 40 Turns; 111 Enemies                                                                       | Shorter; ten Enemies                      | Winnable by six to eight trained Agents, i.e. after one or two purchases of the Transport cap Upgrade; a starting-size team rarely wins. |
| Starting transport cap                                      | 6                                                                                                      | Lower, raised by `transport_cap`          | Transport capacity becomes something the Agency invests in.                                                                              |
| Starting training cap                                       | 0                                                                                                      | Above zero, raised by `training_cap`      | Training is available from the first Turn.                                                                                               |
| Panic change of `operation_level_1` and `operation_level_2` | 0.02% and 0.1% when ignored or lost                                                                    | 3% and 8% when ignored or lost            | At the game-ts scale, Panic cannot end a Campaign as short as the Victory path.                                                          |
| Panic reduction of Initiative Mission site wins             | 0.05% and 0.1%                                                                                         | 1% and 2%                                 | Keeps wins and losses on the same scale.                                                                                                 |
| Victory                                                     | Completing the Lead Peace on Earth                                                                     | Every Faction eliminated                  | One Lead fewer, and the condition does not depend on a specially named GDR.                                                              |
| Faction discovery                                           | Through a profile Lead                                                                                 | Every Faction is known from the start     | Removes the profile and interrogation Leads.                                                                                             |
| `exhaustion_free_points`                                    | 5                                                                                                      | 30                                        | Work now raises exhaustion every Turn, so a longer free amount lets an Agent work for many Turns before it weakens.                      |
| `exhaustion_work_start_max` and `exhaustion_work_limit`     | A 30% "Ready" convention of the UI and AI; Agents at 100 cannot be assigned and leave an Investigation | 30 and 70, enforced by the engine         | Tiredness stops at a level where a recalled Agent is still useful, and the rules no longer depend on the UI.                             |
| `exhaustion_per_pct_killed`                                 | 5 per 5% of the team lost, rounded up                                                                  | 1 per 1%, rounded up                      | The same amount at every multiple of 5%, stated more plainly.                                                                            |
| Upgrades                                                    | 8, with no distinction between cap and stat upgrades                                                   | 4: three cap upgrades and `weapon_damage` | game-ts left distinguishing the two kinds of upgrade as an open item in its upgrade definitions.                                         |
