# Game Data Records

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | GDR                                                                                                                                                                        |
| Family      | Foundation                                                                                                                                                                 |
| Audience    | Engine designer, Content designer, Implementer                                                                                                                             |
| Owns        | The purposes a GDR can serve relative to game behavior and Campaign state, with a worked example of each.                                                                  |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A Game build carries a large body of fixed game data, e.g. how much health a Thug starts with, or what the
encyclopedia says about it. Each piece of it is a Game Data Record (GDR), authored as YAML, conforming to a declared
Type, and never changed during play. Whatever changes belongs to Campaign state instead, as
[Campaign State](campaign-state.md) describes it, so one GDR serves every Campaign at once.

Because a GDR never changes, what sets one use of it apart from another is how game behavior and Campaign state relate
to it. A GDR can supply starting values when a Campaign or a Campaign instance is created, be read by game behavior
whenever a calculation needs it, or be referenced from Campaign state, which may then key its own facts by that GDR's
identity. A GDR that no game behavior reads exists only for the player to see. One GDR may serve several purposes at
once, e.g. the Thug GDR is the Archetype of an Enemy and also supplies its display name.

# Relationships

- Uses [Campaign Instances](./campaign-instances.md)
- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Used by [Bootstrap GDRs](../content/bootstrap-gdrs.md)
- Used by [Domain Model](../mechanics/domain-model.md)
- Used by [Missions](../mechanics/missions.md)

# Purposes of GDRs

A GDR never changes during play, but it can matter to a Campaign in different ways, e.g. by supplying an initial value,
by being read in a calculation, or by being referenced from Campaign state.

GDRs can serve the following seven purposes. The purposes can overlap; they do not define separate Types or required
implementation interfaces. Each GDR purpose section below is a worked example of one purpose.

| Purpose                          | How the engine uses the GDR                                                                                                                                                                                  | Example                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Campaign instance initialization | [Campaign instance creation](campaign-instances.md#campaign-instance-creation) takes a GDR’s value as the initial value of a property of a new Campaign instance. The player cannot override the value.      | A newly hired Agent has skill 100, the value of the new-base-Agent-skill GDR.                                              |
| Campaign configuration preset    | Campaign creation takes the GDR’s values as the complete initial Campaign configuration. Before creation, the engine lets the player override individual values of the selected preset.                      | A Campaign created from the Hard preset with one override has starting money 80 and investigation difficulty multiplier 2. |
| Calculation parameter            | The engine reads a GDR when computing a Derived value.                                                                                                                                                       | The engine reads the rate from the Standard contracting GDR to calculate contracting income.                               |
| Archetype                        | A Campaign instance references the GDR as its Archetype; the GDR supplies shared characteristics and initial values named by [Campaign instance creation](campaign-instances.md#campaign-instance-creation). | A newly created Enemy whose Archetype is Thug has current health 10 and a fresh Instance ID.                               |
| Referenced GDR                   | A Campaign instance holds a reference to a GDR other than its Archetype.                                                                                                                                     | An Investigation holds a reference to the Lead GDR it pursues.                                                             |
| Key for campaign facts           | Campaign state holds facts keyed by a GDR’s identity while the GDR remains immutable.                                                                                                                        | The engine records completions against a Lead GDR’s identity.                                                              |
| Display content                  | No game behavior reads the GDR's value; the engine exposes it to the player through Player API, subject to Player-visible information boundaries.                                                            | The Thug GDR's display name and description appear in the enemy list and the encyclopedia.                                 |

# GDR authoring format

GDRs are authored as YAML files that the Game build supplies. YAML is the authoring format only: how a Game build
packages, loads, or represents GDRs while the game runs is the Implementer's choice.

Each of the following GDR purpose sections shows one GDR of its worked example as YAML. The snippets illustrate the
format: each states an identifier, a Type, and the values of that Type's properties. Their property names and values
are illustrative. The properties of a Type are decided where the Type is specified, and [TODOs](#todos) lists the
parts of the format that are undecided.

**v5 requirement:** The key order of a mapping in a GDR file, as authored, is significant: it is preserved when the GDR
is read, and a specification may rely on it. E.g., [Missions](../mechanics/missions.md) relies on the authored order of
the `enemies` mapping of a MissionSiteArchetype for the fixed order of the Enemies of a Combat. A decimal value in a GDR
file is read as the exact decimal number it is written as, never as a binary floating-point approximation, under
[Whole-number quantities](numbers.md#whole-number-quantities) in Numbers.

## GDR file layout

GDR files are authored under the `content/` directory at the repository root. The layout of the files follows these
rules:

- **One file per Type:** each file holds every GDR of one Type and no GDR of another Type.
- **Directory of the Type owner:** the file lies in the directory named after the file name of the specification that
  owns its Type, without the `.md` extension or a `-spec` suffix, e.g. `content/combat/` for Combat.
- **File named after the Type:** the file name is the Type's name in lowercase words joined by underscores, in the
  plural, e.g. `faction_activity_levels.yaml` for FactionActivityLevel.
- **One YAML document per GDR:** documents are separated by `---`, and each states its GDR as the snippets of the GDR
  purpose sections show, including its identifier and its Type.

A GDR added later goes into the file of its Type, and a file is added only for a new Type.

# GDR purpose: campaign instance initialization

Consider an illustrative creation of an Agent hired during play:

| Element              | Modeling role                                                                  | Meaning in this example                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Skill                | Type                                                                           | Describes a nonnegative integer skill.                                                                                              |
| New base Agent skill | GDR                                                                            | Has Type Skill and value 100.                                                                                                       |
| Agent hiring         | [Campaign instance creation](campaign-instances.md#campaign-instance-creation) | Hiring creates one Agent Campaign instance with a fresh Instance ID and skill in State equal to the new-base-Agent-skill GDR value. |
| Agent                | Campaign instance                                                              | The newly created Agent Campaign instance, with skill 100 in State.                                                                 |
| Agent skill          | Authoritative value                                                            | Initially 100 in the Agent Campaign instance’s State.                                                                               |
| New Committed state  | Committed state                                                                | Contains the Agent Campaign instance when the hiring action completes.                                                              |

E.g., the new-base-Agent-skill GDR as YAML:

```yaml
id: new_base_agent_skill
type: Skill
value: 100
```

New base Agent skill is a Campaign instance initialization GDR distinct from the Agent's Archetype so that one value applies
to newly hired Agents of every Archetype without being repeated in each Archetype.

The example shows only the skill initial value; Agent hiring also sets the Agent's other initial values. When the hiring action completes, the new Committed state contains an Agent Campaign instance
with a fresh Instance ID and skill 100 in State, the value of the new-base-Agent-skill GDR.

```mermaid
flowchart LR
    Type["Type: Skill"] -.->|describes| GDR["GDR: New base Agent skill · value 100"]
    Creation["Agent hiring<br/>skill starts at the new-base-Agent-skill value"] -->|specifies| Agent["Agent Campaign instance<br/>fresh Instance ID"]
    GDR -->|initial skill 100| Agent
    Agent -->|State contains| Skill["Authoritative value:<br/>skill 100"]
    Agent -->|included in| State["New Committed state"]
```

If training later raises the Agent's skill to 110, the engine reads 110 from the Agent Campaign instance’s State.
The new-base-Agent-skill GDR still contains the initial value of 100.

The engine exposes no way for the player to change a value this purpose supplies. That distinguishes it from the
Campaign configuration preset purpose, described next.

# GDR purpose: campaign configuration preset

When serving the Campaign configuration preset purpose, a GDR supplies one value for every Campaign configuration
value, and campaign creation takes those values as the initial Campaign configuration. The Game build can supply
several such GDRs, and the player selects one of them. Unlike every other purpose, this one comes with a built-in
engine capability: before the Campaign is created, the player may override individual values of the selected preset.

A value belongs to Campaign configuration if and only if the preset GDRs supply it. Whatever no preset can change is
not Campaign configuration. It is either a GDR serving another purpose, e.g. the new-base-Agent-skill GDR, or game behavior,
e.g. a starting turn that is the same for every Campaign.

Consider an illustrative Game build with two presets and two Campaign configuration values:

| Element                             | Modeling role                                                                  | Meaning in this example                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| CampaignConfiguration               | Type                                                                           | Describes one value for every Campaign configuration value: starting money and an investigation difficulty multiplier.        |
| Standard                            | GDR serving the Campaign configuration preset purpose                          | Has Type CampaignConfiguration, starting money 100, and investigation difficulty multiplier 1. It is the default preset.      |
| Hard                                | GDR serving the Campaign configuration preset purpose                          | Has Type CampaignConfiguration, starting money 60, and investigation difficulty multiplier 2.                                 |
| Preset selection                    | Player choice before creation                                                  | The player selects Hard instead of the default Standard.                                                                      |
| Override                            | Player choice before creation                                                  | The player overrides Hard's starting money with 80 and leaves its investigation difficulty multiplier unchanged.              |
| Campaign configuration              | Component of Campaign state                                                    | Holds starting money 80 and investigation difficulty multiplier 2 when campaign creation completes.                           |
| Starting money                      | Authoritative value, fixed after creation                                      | 80 in Campaign configuration for the whole Campaign.                                                                          |
| Investigation difficulty multiplier | Authoritative value, adjustable during play                                    | Initially 2 in Campaign configuration.                                                                                        |
| Agency creation                     | [Campaign instance creation](campaign-instances.md#campaign-instance-creation) | Campaign creation creates the Agency Campaign instance with money in State equal to starting money in Campaign configuration. |

E.g., the Hard GDR as YAML:

```yaml
id: hard
type: CampaignConfiguration
starting_money: 60
investigation_difficulty_multiplier: 2
```

Campaign creation copies the selected preset's values into the initial Campaign configuration, replacing each
overridden value with the player's override. The initial Campaign configuration therefore holds starting money 80 and
investigation difficulty multiplier 2, and the newly created Agency has money 80 in State. The Hard GDR still has
starting money 60: the override changed nothing in the GDR. Campaign state holds the resulting values and no
reference to Hard.

```mermaid
flowchart LR
    Standard["GDR: Standard · default preset<br/>starting money 100<br/>multiplier 1"]
    Hard["GDR: Hard<br/>starting money 60<br/>multiplier 2"]
    Hard -->|selected preset| Creation["Campaign creation"]
    Override["Player override:<br/>starting money 80"] -->|replaces one value| Creation
    Creation -->|copies the resulting values| Config["Campaign configuration<br/>starting money 80 · fixed after creation<br/>multiplier 2 · adjustable during play"]
    Config -->|starting money 80| Agency["Agency Campaign instance<br/>State: money 80"]
```

The preset supplies both classes of Campaign configuration value. If the player later changes the investigation
difficulty multiplier to 1 during play, the engine reads 1 from Campaign configuration, and the Hard GDR still has
multiplier 2. Starting money is fixed after creation: it stays 80 in Campaign configuration even after an expense
reduces Agency money to 70, because Agency money is a separate Authoritative value in the Agency Campaign instance's
State.

# GDR purpose: calculation parameter

Consider an illustrative contracting income calculation for one Agent. Its complete local setup is:

| Element                        | Modeling role       | Meaning in this example                                                          |
| ------------------------------ | ------------------- | -------------------------------------------------------------------------------- |
| ContractingRate                | Type                | Describes a nonnegative integer amount of money per point of skill per turn.     |
| Standard contracting           | GDR                 | Has Type ContractingRate and value 2 money per point of skill per turn.          |
| Agent skill                    | Authoritative value | Value in the Agent Campaign instance's State, currently 100.                     |
| Contracting income calculation | Formula             | Contracting income for one turn equals the rate multiplied by the Agent's skill. |
| Contracting income             | Derived value       | 2 × 100 = 200 money for this turn.                                               |
| Contracting payment            | State change        | Add contracting income to Agency money.                                          |

E.g., the Standard contracting GDR as YAML:

```yaml
id: standard_contracting
type: ContractingRate
value: 2 # money per point of skill per turn
```

During "advance turn" computation, the engine reads the rate of 2 from the Standard contracting GDR, which conforms to
Type ContractingRate, and the Agent's skill of 100, an Authoritative value in Campaign state. The engine applies the
contracting income formula to these inputs, producing contracting income of 200, a Derived value. Applying the
contracting payment, the engine adds 200 to the campaign's current money; the updated money becomes part of the new
Committed state, which is the result of turn advancement completion.

```mermaid
flowchart LR
    Type["Type: ContractingRate"] -.->|describes| GDR["GDR: Standard contracting · rate 2"]
    GDR -->|rate 2| Engine["Engine applies contracting income formula"]
    State["Campaign state"] -->|Authoritative value: Agent skill 100| Engine
    Formula["Formula: rate × Agent skill"] -->|specifies calculation| Engine
    Engine -->|calculates| Total["Derived value: contracting income 200"]
    Total -->|amount to add| Update["Engine updates campaign money"]
    State -->|current money| Update
    Update -->|included when turn advancement completes| Committed["New Committed state"]
```

# GDR purpose: archetype

Consider an illustrative creation of two Enemy Campaign instances whose Archetype is the same Thug GDR:

| Element             | Modeling role                                                                  | Meaning in this example                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enemy               | Type                                                                           | Describes the Enemy Campaign instances.                                                                                                                                                  |
| EnemyArchetype      | Type                                                                           | Describes the shared enemy characteristics and initial values.                                                                                                                           |
| Thug                | GDR serving the Archetype purpose                                              | Has Type EnemyArchetype and base health 10.                                                                                                                                              |
| Enemy creation      | [Campaign instance creation](campaign-instances.md#campaign-instance-creation) | A newly created Enemy Campaign instance has a fresh Instance ID, its EnemyArchetype as its Archetype, empty Constants, and current health in State equal to the Archetype's base health. |
| enemy_1 and enemy_2 | Campaign instances                                                             | Distinct Enemy Campaign instances sharing Thug as their Archetype, with independent State and Constants.                                                                                 |
| Current health      | Authoritative value                                                            | Initially 10 in each Enemy Campaign instance’s State.                                                                                                                                    |

E.g., the Thug GDR as YAML, with further illustrative properties that this example does not use:

```yaml
id: thug
type: EnemyArchetype
base_health: 10
skill: 40
weapon_damage: 8
is_officer: false
```

Each newly created Enemy Campaign instance whose Archetype is Thug has current health 10 in State and its own fresh
Instance ID; here the two Instance IDs are enemy_1 and enemy_2. Each belongs to a Mission site.
Both Enemy Campaign instances refer to the same GDR; damaging enemy_1 changes its current health without changing enemy_2 or Thug.

```mermaid
flowchart LR
    Creation["Enemy creation"] -->|specifies| Enemy1
    Creation -->|specifies| Enemy2
    Thug["GDR: Thug · base health 10"] -->|Archetype and initial current health| Enemy1["Enemy Campaign instance enemy_1<br/>Archetype: Thug<br/>Instance ID: enemy_1<br/>Constants: empty<br/>State: current health 10"]
    Thug -->|Archetype and initial current health| Enemy2["Enemy Campaign instance enemy_2<br/>Archetype: Thug<br/>Instance ID: enemy_2<br/>Constants: empty<br/>State: current health 10"]
```

# GDR purpose: referenced GDR

When serving the Referenced GDR purpose, a GDR is referenced by a Campaign instance other than as its Archetype.
Consider an illustrative Lead and an Investigation of that Lead. The complete comparison needed here is:

| Example concept        | Modeling role                                                                                                                                   | Question it answers                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Lead                   | GDR serving the Referenced GDR purpose, representing a Lead to pursue.                                                                          | Which Lead can be pursued?                                                 |
| Investigation          | Campaign instance for investigation of a given Lead, with its own Instance ID, progress in State, and an immutable Lead reference in Constants. | Which Investigation concerns that Lead, and how has it progressed?         |
| InvestigationArchetype | GDR used as an Investigation's Archetype, supplying shared characteristics and initial values independently of the referenced Lead.             | What shared characteristics and initial values does the Investigation use? |

E.g., lead_1 as YAML, with illustrative properties that this example does not use:

```yaml
id: lead_1
type: Lead
name: Criminal organizations
description: Investigate local criminal organizations to find cult connections.
difficulty: 3
```

Suppose Lead lead_1 is referenced by Investigation investigation_1, created with InvestigationArchetype investigation_archetype_1. Its Instance ID is investigation_1; its Constants contains the
immutable Lead reference, and its State contains lifecycle initialized to active and progress initialized to 0, as an illustrative specification of Investigation creation would state. The archetype remains the separate shared
component. Adding the Lead reference does not create a fifth property or make lead_1 the Investigation's archetype.

For this example, investigation_1 reaches progress 2 and is abandoned. A new Investigation investigation_2 at lead_1 starts at progress 0 with its own Instance ID.
Use archetype investigation_archetype_2 for investigation_2 to show that the Investigation's Lead reference and Archetype are independent relationships. These
are symbolic GDRs without selected production properties or mechanics. The example assumes both combinations are
permitted; it does not define action preconditions or invariants governing them.

```mermaid
flowchart LR
    lead_1["Lead GDR: lead_1"]
    investigation_archetype_1["InvestigationArchetype investigation_archetype_1"]
    investigation_archetype_2["InvestigationArchetype investigation_archetype_2"]
    subgraph investigation_1["Investigation investigation_1"]
        investigation_1_archetype["Archetype: investigation_archetype_1"]
        investigation_1_identity["Instance ID: investigation_1"]
        investigation_1_constants["Constants: Lead lead_1"]
        investigation_1_state["State: abandoned, progress 2"]
    end
    subgraph investigation_2["Investigation investigation_2"]
        investigation_2_archetype["Archetype: investigation_archetype_2"]
        investigation_2_identity["Instance ID: investigation_2"]
        investigation_2_constants["Constants: Lead lead_1"]
        investigation_2_state["State: active, progress 0"]
    end
    investigation_1_archetype -->|resolves to| investigation_archetype_1
    investigation_2_archetype -->|resolves to| investigation_archetype_2
    investigation_1_constants -->|immutable reference| lead_1
    investigation_2_constants -->|immutable reference| lead_1
```

Both Investigations can share lead_1 without sharing progress. Retargeting investigation_1 to another Lead or replacing investigation_archetype_1 after creation
would violate its fixed facts. Using lead_1 as its archetype would fail the expected InvestigationArchetype reference,
regardless of whether some properties match.

# GDR purpose: key for campaign facts

When serving the Key for campaign facts purpose, a GDR’s identity associates campaign-specific facts with that GDR. The facts belong to Campaign state;
the GDR remains shared and immutable.

Continuing the illustrative Investigation example, suppose investigation_2 completes after investigation_1 was abandoned.
Campaign state retains both Investigation Campaign instances, including the values of the Lead reference property
within each Campaign instance’s Constants property and the lifecycle property within its State property.

| Element                                                                        | Modeling role                                  | Meaning in this example                                                                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lead_1                                                                         | GDR serving the Key for campaign facts purpose | Its identity selects the Investigations concerning this Lead; the GDR remains unchanged.                                                                  |
| Properties of completed investigations that denote to which leads they pertain | Authoritative values                           | The Lead reference property within the Constants property of the Completed Investigation Campaign instance investigation_2 identifies lead_1.             |
| Completion count for lead_1                                                    | Derived value                                  | Count Investigation Campaign instances whose Lead reference property identifies lead_1 and whose lifecycle property has value Completed. The result is 1. |

E.g., lead_1 as YAML. The GDR holds no completion count:

```yaml
id: lead_1
type: Lead
name: Criminal organizations
difficulty: 3
# No completion count: Campaign state holds the Investigations,
# and the count is derived from them by matching this id.
```

How to determine the Derived value of the completion count for the Lead GDR lead_1 from Authoritative values:

1. **Collect Investigations:** Start with all Investigation Campaign instances in the Campaign state.
2. **Filter by Lead reference:** For each Investigation Campaign instance, read the value of the Lead reference property within its Constants property. Keep only Campaign instances whose Lead reference identifies lead_1.
3. **Filter by Completed lifecycle:** For each remaining Investigation Campaign instance, read the value of the lifecycle property within its State property. Keep only Campaign instances whose lifecycle property has the value Completed.
4. **Count matching Investigations:** Count the remaining Investigation Campaign instances. The result is the Derived value of the completion count for lead_1. In this example, investigation_1 is excluded because its lifecycle property has the value Abandoned; investigation_2 is counted, so the result is 1.

The Lead reference and lifecycle property values read in steps 2 and 3 are Authoritative values.

```mermaid
flowchart LR
    Lead["Lead GDR: lead_1<br/>Shared immutable data"]
    subgraph CampaignState["Campaign state: Authoritative property values"]
        Investigation1["Investigation Campaign instance investigation_1<br/>Constants property: Lead reference property = lead_1<br/>State property: lifecycle property = Abandoned"]
        Investigation2["Investigation Campaign instance investigation_2<br/>Constants property: Lead reference property = lead_1<br/>State property: lifecycle property = Completed"]
    end
    Lead -->|GDR identity to match| SelectLead["Engine filters by Lead reference<br/>Both Investigations match lead_1"]
    Investigation1 -->|Lead reference and lifecycle values| SelectLead
    Investigation2 -->|Lead reference and lifecycle values| SelectLead
    SelectLead --> SelectCompleted["Engine filters by Completed lifecycle<br/>Only investigation_2 matches"]
    SelectCompleted --> Count["Engine counts matching Investigation Campaign instances"]
    Count --> Result["Derived value:<br/>Completion count for lead_1 = 1"]
```

# GDR purpose: display content

When serving the Display content purpose, a GDR supplies values that exist only for the player to see, e.g. names,
descriptions, in-game encyclopedia articles, and references to images or other media. Consider an illustrative Thug
enemy and its encyclopedia article:

| Element             | Modeling role                                          | Meaning in this example                                                                                        |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| EnemyArchetype      | Type                                                   | Describes the shared enemy characteristics and initial values, including a display name and a description.     |
| Thug                | GDR serving the Archetype and Display content purposes | Has Type EnemyArchetype, base health 10, display name "Thug", and a one-sentence description.                  |
| EncyclopediaArticle | Type                                                   | Describes an encyclopedia article: a title, body text, an image reference, and a reference to its subject GDR. |
| Thug article        | GDR serving the Display content purpose                | Has Type EncyclopediaArticle, title "Thug", body text, an image reference, and a reference to the Thug GDR.    |

E.g., the Thug article as YAML. It identifies its subject by the identifier of the Thug GDR:

```yaml
id: thug_article
type: EncyclopediaArticle
title: Thug
body: A hired street enforcer with little training and less loyalty.
image: images/enemies/thug.png
subject: thug
```

The Combat specification reads Thug's base health 10 as its Archetype initial value; no game behavior reads its display name, its description,
or the Thug article. Through Player API, the engine exposes the display name and description wherever a Player-visible
view shows an Enemy whose Archetype is Thug, and exposes the Thug article in the encyclopedia once the player is
entitled to see it. The purposes overlap: Thug serves the Archetype and Display content purposes at once.

Display content follows these requirements:

- **No gameplay dependence:** No game behavior reads a value that serves the Display content purpose. Changing Display content
  in a Game build changes only what the player sees; equal initial Campaign state and the same ordered committed
  commands still produce equal Campaign state.
- **Visibility:** The engine exposes Display content only as Player-visible information. Display content describing
  something hidden from the player stays hidden until it becomes Player-visible.
  The value described states when it becomes Player-visible, under
  [Player queries and actions](engine-contract.md#player-queries-and-actions).
- **No inference:** Relationships and gameplay facts are never inferred from Display content, extending the rule under
  [References](campaign-instances.md#references). The Thug article identifies its subject through its reference to the Thug GDR, not
  through its title.
- **Media:** A reference to an image or other media is a value in the GDR; the referenced media is part of the Game
  build. Media formats and loading are left to the implementation.

```mermaid
flowchart LR
    Thug["GDR: Thug<br/>base health 10<br/>display name and description"]
    Article["GDR: Thug article<br/>title, body text, image reference"]
    Article -->|subject reference| Thug
    Thug -->|base health 10| Combat["Game behavior: Enemy creation and Combat"]
    Thug -->|display name and description| PlayerAPI["Player API:<br/>Player-visible information"]
    Article -->|article when Player-visible| PlayerAPI
    PlayerAPI --> UserInterface["A user interface renders it for the player"]
```

# TODOs

- TODO: State when encyclopedia articles become Player-visible information, under
  [GDR purpose: display content](#gdr-purpose-display-content).
- TODO: Decide the GDR identifier format: the permitted characters and casing of a GDR identifier, and the scope within
  which it is unique. Affects [GDR authoring format](#gdr-authoring-format) and every reference to a GDR.
- TODO: Decide the YAML property naming: how a GDR states its identifier and its Type, and the casing of property
  names. Affects [GDR authoring format](#gdr-authoring-format) and the snippets in every GDR purpose section.
