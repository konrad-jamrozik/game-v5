# Bootstrap GDRs

| Metadata    | Value                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | BOOT                                                                                                                                        |
| Family      | Content                                                                                                                                     |
| Status      | Draft                                                                                                                                       |
| Audience    | Engine designer, Content designer, Implementer                                                                                              |
| Owns        | Which Game Data Records (GDRs) a Game build supplies so that a first playable Campaign can start, and how those GDRs form the Victory path. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                              |

# Overview

This document defines the Bootstrap GDRs: the smallest set of Game Data Records (GDRs) that a Game build supplies so
that a first playable Campaign can be created, played, won, and lost. It is a deliberately reduced selection of the
game-ts content, chosen so that every concept the [Domain Model](../mechanics/domain-model.md) declares has at least
one GDR, while each kind of GDR has as few members as a complete Campaign allows.

This document owns which GDRs exist, the identifier of each, its Type, the GDR purposes it serves, the file that holds
it, and how the GDRs reference one another, e.g. which Lead creates which Mission site. It does not own, e.g.:

- The values inside each GDR: each GDR's own YAML file is the only place its values are recorded, under
  [One owner per rule](../governance/spec-conventions.md#one-owner-per-rule).
- What a value means and the rules that read it: each Type is owned by the Mechanics specification named in its
  section under [Bootstrap GDR catalog](#bootstrap-gdr-catalog).
- The authoring format of a GDR: [GDR authoring format](../foundation/game-data-records.md#gdr-authoring-format) in
  Game Data Records.

# Relationships

- Uses [Configuration](../foundation/configuration.md)
- Uses [Domain Model](../mechanics/domain-model.md)
- Uses [Game Data Records](../foundation/game-data-records.md)
- Used by [Storage Schema](../implementation/storage-schema.md)

# Glossary

| Term           | Definition                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Bootstrap GDRs | The GDRs a Game build must supply so that a first playable Campaign can be created and played to an ending.                                      |
| Victory path   | The sequence of Leads and Initiative Mission sites by which the Agency can defeat every Faction and so win the Campaign with the Bootstrap GDRs. |

# Bootstrap scope

The Bootstrap GDRs keep every kind of GDR the [Game concepts](../mechanics/domain-model.md#game-concepts) of Domain Model
require and reduce how many of each exist. The following table is exhaustive: it counts every Bootstrap GDR by the
Domain Model concept it serves.

| Domain Model concept   | Bootstrap GDRs                                                                        | Count |
| ---------------------- | ------------------------------------------------------------------------------------- | ----- |
| Campaign configuration | One Campaign configuration preset, which is the Game build default preset             | 1     |
| Agency                 | One AgencyArchetype                                                                   | 1     |
| Agent                  | One AgentArchetype and one parameter GDR                                              | 2     |
| Lead and Investigation | Three Leads of one Faction and one InvestigationArchetype                             | 4     |
| Mission site           | Three MissionSiteArchetypes of kind initiative and two of kind response               | 5     |
| Enemy and Combat       | Three EnemyArchetypes, three Weapons, and one parameter GDR                           | 7     |
| Agent recovery         | One parameter GDR                                                                     | 1     |
| Economy and upgrades   | One parameter GDR and four Upgrades                                                   | 5     |
| Faction                | One FactionArchetype, three Faction activity levels, and two Faction operation levels | 6     |
| Panic and endings      | One parameter GDR                                                                     | 1     |
| **Total**              |                                                                                       | 33    |

A parameter GDR bundles the scalar values one Mechanics specification reads, e.g. the hire cost and upkeep of
Economy and Upgrades in the GDR `economy`, instead of supplying each value as a GDR of its own.

# Bootstrap GDR catalog

Each section below lists, exhaustively, the Bootstrap GDRs whose Type one Mechanics specification owns. GDR purposes are
those defined under [Purposes of GDRs](../foundation/game-data-records.md#purposes-of-gdrs) in Game Data Records. Every
GDR whose Type has a `name` property also serves the Display content purpose; the tables omit it.

## Configuration GDRs

Type owner: [Configuration](../foundation/configuration.md).

| GDR        | Type                  | GDR purpose                   | What it supplies                                                                                                                                                                                 |
| ---------- | --------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `standard` | CampaignConfiguration | Campaign configuration preset | The Game build default preset under [Campaign configuration presets](../foundation/configuration.md#campaign-configuration-presets): the Agency's starting money and starting recurring funding. |

## Agents GDRs

Type owner: [Agents](../mechanics/agents-spec.md).

| GDR                | Type            | GDR purpose                                             | What it supplies                                                                                                                                                                                   |
| ------------------ | --------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `field_agent`      | AgentArchetype  | Archetype                                               | Every Agent's skill, Weapon, and `health` when created. An Agent starts with both its Maximum health and its health equal to `health`.                                                             |
| `agent_parameters` | AgentParameters | Campaign instance initialization, Calculation parameter | The size of the initial roster; the exhaustion cap, the exhaustion without effect, and the skill lost per further point; exhaustion per attack and per defense; skill gained per turn of Training. |

## Economy and Upgrades GDRs

Type owner: [Economy and Upgrades](../mechanics/economy-and-upgrades.md).

| GDR             | Type              | GDR purpose           | What it supplies                                                                                                        |
| --------------- | ----------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `agency`        | AgencyArchetype   | Archetype             | The Agency's display name.                                                                                              |
| `economy`       | EconomyParameters | Calculation parameter | Hire cost, upkeep per Agent, contracting income per Agent, and the starting Agent cap, Transport cap, and Training cap. |
| `agent_cap`     | Upgrade           | Calculation parameter | Price and increment of the Upgrade raising the Agent cap.                                                               |
| `transport_cap` | Upgrade           | Calculation parameter | Price and increment of the Upgrade raising the Transport cap.                                                           |
| `training_cap`  | Upgrade           | Calculation parameter | Price and increment of the Upgrade raising the Training cap.                                                            |
| `weapon_damage` | Upgrade           | Calculation parameter | Price and increment of the Upgrade raising the weapon damage of every Agent.                                            |

Three Upgrades raise an Agency-wide cap and one changes a value of every Agent, so Economy and Upgrades must specify
both kinds of Upgrade effect.

## Leads and Progression GDRs

Type owner: [Leads and Progression](../mechanics/leads-and-progression.md).

| GDR                         | Type | GDR purpose                            | What it supplies                                                                            |
| --------------------------- | ---- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `locate_red_dawn_member`    | Lead | Referenced GDR, Key for campaign facts | The first Lead of the Victory path; it has no prerequisites and creates `apprehend_member`. |
| `locate_red_dawn_safehouse` | Lead | Referenced GDR, Key for campaign facts | Requires a Won Mission site created by `locate_red_dawn_member`; creates `raid_safehouse`.  |
| `locate_red_dawn_hq`        | Lead | Referenced GDR, Key for campaign facts | Requires a Won Mission site created by `locate_red_dawn_safehouse`; creates `raid_hq`.      |

Each Lead references its Faction, `red_dawn`, explicitly through its `faction` property, and names its prerequisite
Leads and the MissionSiteArchetype it creates by GDR identifier, so no relationship is inferred from identifier text under
[References](../foundation/campaign-state.md#references) in Campaign State.

## Investigations GDRs

Type owner: [Investigations](../mechanics/investigations.md).

| GDR                      | Type                   | GDR purpose | What it supplies                      |
| ------------------------ | ---------------------- | ----------- | ------------------------------------- |
| `standard_investigation` | InvestigationArchetype | Archetype   | The Archetype of every Investigation. |

The Lead property `difficulty` is owned by Leads and Progression; how an Investigation uses it is owned by
Investigations.

## Missions GDRs

Type owner: [Missions](../mechanics/missions.md).

| GDR                     | Type                 | GDR purpose | What it supplies                                                                                                      |
| ----------------------- | -------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| `apprehend_member`      | MissionSiteArchetype | Archetype   | An Initiative Mission site: its expiry, its Enemies by EnemyArchetype and count, and its rewards for a win.           |
| `raid_safehouse`        | MissionSiteArchetype | Archetype   | An Initiative Mission site: its expiry, its Enemies by EnemyArchetype and count, and its rewards for a win.           |
| `raid_hq`               | MissionSiteArchetype | Archetype   | An Initiative Mission site: its expiry and its Enemies by EnemyArchetype and count; a win defeats its target Faction. |
| `foil_recruitment_push` | MissionSiteArchetype | Archetype   | A Response Mission site of Faction operation level 1: its expiry and its Enemies by EnemyArchetype and count.         |
| `foil_sabotage`         | MissionSiteArchetype | Archetype   | A Response Mission site of Faction operation level 2: its expiry and its Enemies by EnemyArchetype and count.         |

No MissionSiteArchetype references a Faction. A Mission site's target Faction is a value in its Constants: for an
Initiative Mission site it is the Faction whose Archetype is the creating Lead's `faction`, and for a Response Mission
site it is the initiating Faction. Another Faction can therefore reuse every MissionSiteArchetype by supplying only its
own Leads.

## Combat GDRs

Type owner: [Combat](../mechanics/combat.md).

| GDR                 | Type             | GDR purpose           | What it supplies                                                                                              |
| ------------------- | ---------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `initiate`          | EnemyArchetype   | Archetype             | The weakest Enemy: skill, health, and Weapon.                                                                 |
| `soldier`           | EnemyArchetype   | Archetype             | An Enemy roughly matching a newly hired Agent: skill, health, and Weapon.                                     |
| `cult_leader`       | EnemyArchetype   | Archetype             | The strongest Enemy, met only in `raid_hq`: skill, health, and Weapon.                                        |
| `sidearm`           | Weapon           | Referenced GDR        | Base damage of the Weapon of every Agent and of `initiate`.                                                   |
| `rifle`             | Weapon           | Referenced GDR        | Base damage of the Weapon of `soldier`.                                                                       |
| `heavy_rifle`       | Weapon           | Referenced GDR        | Base damage of the Weapon of `cult_leader`.                                                                   |
| `combat_parameters` | CombatParameters | Calculation parameter | The spread of a damage roll around base damage, the two retreat thresholds, and the incapacitation threshold. |

## Agent Recovery GDRs

Type owner: [Agent Recovery](../mechanics/agent-recovery.md).

| GDR        | Type               | GDR purpose           | What it supplies                                                                                             |
| ---------- | ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| `recovery` | RecoveryParameters | Calculation parameter | Health recovered per turn, as a percentage of the Agent's Maximum health, and exhaustion recovered per turn. |

## Factions GDRs

Type owner: [Factions](../mechanics/factions.md).

| GDR                 | Type                  | GDR purpose           | What it supplies                                                                                                                          |
| ------------------- | --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `red_dawn`          | FactionArchetype      | Archetype             | The only Faction: its name and its initial Faction activity level, `faint`.                                                               |
| `faint`             | FactionActivityLevel  | Calculation parameter | How long the level lasts, how often an operation occurs, the weight of each Faction operation level, and the next level, `active`.        |
| `active`            | FactionActivityLevel  | Calculation parameter | As `faint`; the next level is `war`.                                                                                                      |
| `war`               | FactionActivityLevel  | Calculation parameter | As `faint`, except that it lasts indefinitely and has no next level.                                                                      |
| `operation_level_1` | FactionOperationLevel | Calculation parameter | The money and funding gained when a Response Mission site of level 1 is Won, and the Panic and funding change when it is Expired or Lost. |
| `operation_level_2` | FactionOperationLevel | Calculation parameter | As `operation_level_1`, for level 2.                                                                                                      |

Each MissionSiteArchetype of kind response states its Faction operation level. A Faction selects a level by weight, and
[MissionSiteArchetype selection](../mechanics/missions.md#missionsitearchetype-selection) in Missions then selects a MissionSiteArchetype of kind response
with that level. The Bootstrap GDRs supply exactly one MissionSiteArchetype of kind response per level.

## Panic and Endings GDRs

Type owner: [Panic and Endings](../mechanics/panic-and-endings.md).

| GDR       | Type             | GDR purpose           | What it supplies                         |
| --------- | ---------------- | --------------------- | ---------------------------------------- |
| `endings` | EndingParameters | Calculation parameter | The Panic at which the Campaign is lost. |

# Bootstrap GDR files

The Bootstrap GDRs are authored in YAML files under the `content/` directory at the repository root. Their layout
follows these rules:

- **One file per Type:** each file holds every Bootstrap GDR of one Type and no GDR of another Type.
- **Directory of the Type owner:** the file lies in the directory named after the file name of the Mechanics
  specification that owns its Type, without the `.md` extension or a `-spec` suffix, e.g. `content/combat/` for Combat.
- **File named after the Type:** the file name is the Type's name in lowercase words joined by underscores, in the
  plural, e.g. `faction_activity_levels.yaml` for FactionActivityLevel.
- **One YAML document per GDR:** documents are separated by `---`, and each states its GDR as
  [GDR authoring format](../foundation/game-data-records.md#gdr-authoring-format) shows, including its identifier and
  its Type.

The following table is exhaustive: it lists all 17 Bootstrap GDR files.

| File                                                   | Type                   | GDRs                                                                                      |
| ------------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------- |
| `content/configuration/campaign_configurations.yaml`   | CampaignConfiguration  | `standard`                                                                                |
| `content/agents/agent_archetypes.yaml`                 | AgentArchetype         | `field_agent`                                                                             |
| `content/agents/agent_parameters.yaml`                 | AgentParameters        | `agent_parameters`                                                                        |
| `content/economy-and-upgrades/agency_archetypes.yaml`  | AgencyArchetype        | `agency`                                                                                  |
| `content/economy-and-upgrades/economy_parameters.yaml` | EconomyParameters      | `economy`                                                                                 |
| `content/economy-and-upgrades/upgrades.yaml`           | Upgrade                | `agent_cap`, `transport_cap`, `training_cap`, `weapon_damage`                             |
| `content/leads-and-progression/leads.yaml`             | Lead                   | `locate_red_dawn_member`, `locate_red_dawn_safehouse`, `locate_red_dawn_hq`               |
| `content/investigations/investigation_archetypes.yaml` | InvestigationArchetype | `standard_investigation`                                                                  |
| `content/missions/mission_site_archetypes.yaml`        | MissionSiteArchetype   | `apprehend_member`, `raid_safehouse`, `raid_hq`, `foil_recruitment_push`, `foil_sabotage` |
| `content/combat/enemy_archetypes.yaml`                 | EnemyArchetype         | `initiate`, `soldier`, `cult_leader`                                                      |
| `content/combat/weapons.yaml`                          | Weapon                 | `sidearm`, `rifle`, `heavy_rifle`                                                         |
| `content/combat/combat_parameters.yaml`                | CombatParameters       | `combat_parameters`                                                                       |
| `content/agent-recovery/recovery_parameters.yaml`      | RecoveryParameters     | `recovery`                                                                                |
| `content/factions/faction_archetypes.yaml`             | FactionArchetype       | `red_dawn`                                                                                |
| `content/factions/faction_activity_levels.yaml`        | FactionActivityLevel   | `faint`, `active`, `war`                                                                  |
| `content/factions/faction_operation_levels.yaml`       | FactionOperationLevel  | `operation_level_1`, `operation_level_2`                                                  |
| `content/panic-and-endings/ending_parameters.yaml`     | EndingParameters       | `endings`                                                                                 |

A GDR added later goes into the file of its Type, and a file is added only for a new Type.

# Victory path

The Victory path consists of three Leads, each creating one Initiative Mission site. A Won Mission site makes the next
Lead available, and winning `raid_hq` defeats Red Dawn. With Red Dawn defeated, every Faction is defeated, which wins
the Campaign. Throughout the Campaign, Red Dawn's activity creates Faction operation occurrences, each with one Response
Mission site; a Response Mission site that is Expired or Lost raises Panic, and enough Panic loses the Campaign.

![Victory path of the Bootstrap GDRs: three Leads each create one Initiative Mission site, a Won Mission site makes the next Lead available, and winning raid_hq defeats Red Dawn and wins the Campaign; throughout the Campaign, Red Dawn activity creates Response Mission sites whose expiry or loss raises Panic until the Campaign is lost](../../images/bootstrap-victory-path.svg)

An Initiative Mission site that is Lost or Expired records no win, so its Lead becomes available again and the Agency
can obtain a new Mission site from it. A Mission site cannot be attempted twice. Every Lead of the Victory path
therefore remains available until a Mission site it created is Won.

The rules that make the Victory path work are owned by Mechanics specifications; this document states none of them:

- Lead availability, under [Lead availability](../mechanics/leads-and-progression.md#lead-availability); recording a
  win, under [Recording a Won Mission site](../mechanics/leads-and-progression.md#recording-a-won-mission-site); and the
  effect of completing a Lead, under [Completion effect](../mechanics/leads-and-progression.md#completion-effect), all in
  [Leads and Progression](../mechanics/leads-and-progression.md).
- Mission site creation, expiry, and the consequences of a win or a loss, under
  [Mission site creation](../mechanics/missions.md#mission-site-creation),
  [Mission site expiration](../mechanics/missions.md#mission-site-expiration), and
  [Consequences](../mechanics/missions.md#consequences) in [Missions](../mechanics/missions.md).
- Faction activity and defeat, under [Faction activity](../mechanics/factions.md#faction-activity) and
  [Defeat](../mechanics/factions.md#defeat) in [Factions](../mechanics/factions.md).
- The conditions that end the Campaign, and which Campaign ending applies when Victory and Defeat hold together, under
  [Ending check step](../mechanics/panic-and-endings.md#ending-check-step) in
  [Panic and Endings](../mechanics/panic-and-endings.md).

# Initial Campaign state sources

[Initial Campaign state](../mechanics/domain-model.md#initial-campaign-state) in Domain Model requires the Mechanics
specification refining each Campaign instance Type to state which initial Campaign instances exist and the source of
each initial value. The following table is exhaustive: it names, for each Campaign instance Type, the section that
states those facts for the Bootstrap GDRs. This document states none of them.

| Campaign instance Type | Section that states the initial Campaign instances and the source of each value                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agency                 | [Agency creation](../mechanics/economy-and-upgrades.md#agency-creation) in Economy and Upgrades                                                     |
| Agent                  | [Initial roster](../mechanics/agents-spec.md#initial-roster) in Agents                                                                              |
| Faction                | [Initial Factions](../mechanics/factions.md#initial-factions) in Factions                                                                           |
| Investigation          | [Investigation creation](../mechanics/investigations.md#investigation-creation) in Investigations                                                   |
| Mission site           | [Initial Mission sites](../mechanics/missions.md#initial-mission-sites) in Missions                                                                 |
| Enemy                  | [Enemy creation](../mechanics/combat.md#enemy-creation) in Combat, applied by [Enemy creation](../mechanics/missions.md#enemy-creation) in Missions |

The turn, Panic, and Lead progression start from values that no GDR supplies. [Turn number](../mechanics/turn-advancement.md#turn-number)
in Turn Advancement states the initial value of the turn;
[Initial values](../mechanics/panic-and-endings.md#initial-values) in Panic and Endings and
[Lead progression](../mechanics/leads-and-progression.md#lead-progression) in Leads and Progression state the others.

# GDRs deferred beyond the bootstrap

The Bootstrap GDRs exclude the following game-ts content. The list is exhaustive for game-ts content, in the order in
which it is expected to return:

- The Factions Exalt and Black Lotus, each with its own Leads reusing the existing MissionSiteArchetypes.
- Faction suppression after a Won Mission site.
- Skill gained by surviving a Mission and by attacking and defending in a Battle.
- The Upgrades raising training skill gain, exhaustion recovery, health recovery, and Agent health.
- Initiative Mission sites of game-ts levels 3 to 7, and the interrogation Leads between them.
- Faction operation levels 3 to 6, including the level whose loss ends the Campaign, and their Response Mission sites.
- The Faction activity levels Dormant, Emerging, Expanding, Escalating, and Total war.
- Partial success of a Lost Mission site, which [Combat and consequences](../mechanics/domain-model.md#combat-and-consequences)
  in Domain Model already allows for.
- The Leads Criminal organizations, Deep state, and Peace on Earth, and Faction discovery through a profile Lead.

# Appendix: Derivation from game-ts

This appendix is informative. **Inherited behavior** evidence comes from game-ts revision `f1835a29`, in
`web/src/lib/data_tables/` and `web/src/lib/factories/gameStateFactory.ts`.

Most Bootstrap GDR values are copied from game-ts. The following table is exhaustive: it lists every Bootstrap GDR
value that deliberately differs from its game-ts counterpart, and why.

| Bootstrap GDR value                                         | game-ts                                              | Bootstrap                                 | Informative rationale                                                                                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| EnemyArchetypes                                             | 9 enemy kinds                                        | 3                                         | `initiate` merges initiate and operative; `soldier` merges soldier, handler, and lieutenant; `cult_leader` replaces commander and above. |
| `cult_leader` skill and health                              | Cult leader: skill 800, health 80                    | game-ts commander values                  | An 800-skill Enemy cannot be beaten after a three-step Victory path.                                                                     |
| `initiate` Weapon                                           | Damage 8                                             | `sidearm`                                 | Sharing the Agents' Weapon saves one Weapon GDR.                                                                                         |
| `locate_red_dawn_hq` difficulty                             | 25                                                   | Lower                                     | The HQ is the third step of three, not the eighth of eight.                                                                              |
| `raid_hq` expiry and Enemies                                | Expires in 40 turns; 111 Enemies                     | Shorter; ten Enemies                      | Winnable by six to eight trained Agents, i.e. after one or two purchases of the Transport cap Upgrade; a starting-size team rarely wins. |
| Starting transport cap                                      | 6                                                    | Lower, raised by `transport_cap`          | Transport capacity becomes something the Agency invests in.                                                                              |
| Starting training cap                                       | 0                                                    | Above zero, raised by `training_cap`      | Training is available from the first turn.                                                                                               |
| Panic change of `operation_level_1` and `operation_level_2` | 0.02% and 0.1% when ignored or lost                  | 3% and 8% when ignored or lost            | At the game-ts scale, Panic cannot end a Campaign as short as the Victory path.                                                          |
| Panic reduction of Initiative Mission site wins             | 0.05% and 0.1%                                       | 1% and 2%                                 | Keeps wins and losses on the same scale.                                                                                                 |
| Victory                                                     | Completing the Lead Peace on Earth                   | Every Faction defeated                    | One Lead fewer, and the condition does not depend on a specially named GDR.                                                              |
| Faction discovery                                           | Through a profile Lead                               | Every Faction is known from the start     | Removes the profile and interrogation Leads.                                                                                             |
| Upgrades                                                    | 8, with no distinction between cap and stat upgrades | 4: three cap upgrades and `weapon_damage` | game-ts left distinguishing the two kinds of upgrade as a TODO in `upgrades.ts`.                                                         |
