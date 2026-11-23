# Compendium View

| Metadata | Value |
| --- | --- |
| Spec ID | COMPV |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Compendium View of the Campaign screen shows of a Compendium article, the data sheet of each kind of subject, and how the Player finds an article and follows the links between articles. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Compendium View is where the Player looks something up without leaving the [Campaign](../../foundation/core-concepts.md#campaign-and-session), e.g. how a hit is decided or what a Soldier is armed with. It is one of the Records [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md), and it shows the Player-visible [Compendium articles](../../mechanics/compendium.md#glossary), under [Article visibility](../../mechanics/compendium.md#article-visibility) in Compendium, so it never shows an article about something the Player may not know yet.

It reads like a small reference work. The Player narrows from a category to an article, or searches by title, and then moves on through [Article links](../../mechanics/compendium.md#glossary) from one article to the next, with an Article history to return by. The engine supplies each article with its values and links already in place, under [Article resolution](../../mechanics/compendium.md#article-resolution), and the Compendium View adds one thing of its own: for a [Subject article](../../mechanics/compendium.md#glossary), a data sheet of its subject, laid out for that kind of subject.

# Glossary

| Term | Definition |
| --- | --- |
| Article history | The articles the Player has shown one after another in the Compendium View, with the place among them of the one shown now, through which the Previous article and Next article buttons move. |
| Data sheet | The table of a subject's Player-visible values that the Compendium View shows below the description of a [Subject article](../../mechanics/compendium.md#glossary). |

# Panes

The three panes narrow the Compendium from a category to one article, left to right:

1. **Categories:** Guide first, for the [Guide articles](../../mechanics/compendium.md#glossary), then Mechanics, for the [Mechanics articles](../../mechanics/compendium.md#glossary), then one category for each [Type](../../foundation/core-concepts.md#data-modeling) of the subjects of the Player-visible Subject articles, named as [Subject data sheets](#subject-data-sheets) names it and sorted by that name, e.g. Enemies before Leads. Each category shows the number of its Player-visible articles, and a category with none is left out.
2. **Articles:** the displayed title of each Player-visible article of the selected category, sorted by displayed title ignoring case, under [Displayed title](../../mechanics/compendium.md#displayed-title) in Compendium.
3. **Article:** the selected article, under [Article pane](#article-pane).

When the Compendium View opens, the Guide category and its first article are selected. A search field above the panes filters the articles of every category to those whose displayed title contains the search text, ignoring case; while it holds text, the categories show the numbers of matching articles, and a category with none is left out. An article that a new [World state](../../foundation/engine-contract.md#player-actions-and-turns) makes Player-visible appears without reopening the Compendium View.

While Reveal hidden content is on, under [Revealed presentation](../../foundation/developer-access.md#revealed-presentation) in Developer Access, the Compendium View shows the [Revealed Compendium](../../mechanics/compendium.md#revealed-compendium): every article counts as Player-visible throughout this specification, in the panes, the [Article links](../../mechanics/compendium.md#glossary), the See also entries, the Article history, and the Data sheets alike, and each article is shown in the form the Revealed Compendium reports. When Reveal hidden content is turned off, every article that is not Player-visible leaves the Compendium View as under No longer Player-visible in [Following links](#following-links).

The Player finds an article without the mouse by pressing S, typing part of its title, and pressing Enter, so the search field is one key away and says so itself. It is labelled "Search", and while it is empty it shows the placeholder "Title (press S)", where the Player looks when they want to search. While the Compendium View is open and the search field does not have the keyboard focus, the S key gives it the keyboard focus and selects its whole text, so that what the Player types next replaces the earlier search, and the S key is not typed into it. While the search field has the keyboard focus, the Enter key shows the first article the panes list under the search text, i.e. the first article of the first category listed, by selecting that category in the Categories pane and that article in the Articles pane, and moves the keyboard focus out of the search field, keeping its text, so that the Q, W, and S keys work again. When no article matches, the Enter key does nothing.

# Article pane

The Article pane shows one article from top to bottom in a fixed order, so that every article of a category reads alike. The parts are, in this order; the list is exhaustive, and a part an article does not have is left out with its heading:

1. **Title row:** the displayed title, in the Group heading style, and at the right end of the row the two buttons of the Article history, under [Following links](#following-links).
2. **Body:** the resolved `body`, as one paragraph of Body text in Text secondary.
3. **Formulas,** for a Mechanics article: the heading "Formulas" and a table of two columns without a header row, one row for each resolved formula row in order, its `label` in the first column in Text muted and its `text` in the second. The first column is as wide as its longest label, and the second takes the rest of the pane and wraps.
4. **Data sheet,** for a Subject article: under [Subject data sheets](#subject-data-sheets).
5. **See also:** the heading "See also" and the See also entries of the article in order, on one wrapping line, separated by "·", under [See also](../../mechanics/compendium.md#see-also) in Compendium.

The headings "Formulas" and "See also" and the heading of a Data sheet are in the Group heading style, as every heading inside a pane is, under [Detail views and navigation](../visual-design.md#detail-views-and-navigation) in Visual Design. Every resolved text is shown segment by segment: plain text and inserted values as they are, with nothing that sets an inserted value apart, and each [Article link](../../mechanics/compendium.md#glossary) under [Following links](#following-links). The Compendium View never replaces a [Placeholder](../../mechanics/compendium.md#glossary) or looks for an [Article term](../../mechanics/compendium.md#glossary) in a resolved text itself.

# Following links

Reading about one thing raises a question about the next, so every mention the engine has linked is one click from its article, and the way back is as short.

An Article link, whether in a resolved text, in a See also entry, or in a Data sheet, is drawn as the text around it with an underline, and shows a pointer cursor. Selecting it shows the article it links to: the Compendium View selects that article's category in the Categories pane and the article in the Articles pane, and clears the search field when the article would not be listed under its text. Following an Article link is selecting an item within the same place, not a Follow under [View trail](campaign-screen.md#view-trail) in Campaign Screen, so it adds nothing to the [View trail](../gui.md#glossary).

The Article history remembers the articles shown, so that the Player can go back to the article they came from and forward again. It is a list of articles with one of them current, the article shown. It changes only as follows; the list is exhaustive:

1. **Open:** when the Compendium View opens, the Article history holds only the article selected, which is current.
2. **Show another article:** when the Player shows an article other than the current one, by an Article link, the Articles pane, selecting a category, which shows the first article of that category, or the Enter key in the search field, every article after the current one is removed from the Article history, and the article shown is added at its end and becomes current. Typing in the search field shows no other article by itself: the article shown stays until the Player selects one or presses Enter.
3. **Previous article:** the article before the current one becomes current and is shown.
4. **Next article:** the article after the current one becomes current and is shown.
5. **No longer Player-visible:** an article that is no longer Player-visible, e.g. after an undo, is removed from the Article history. When it was the current one, the article before it becomes current, or else the article after it, or else the first article of the Guide category is shown as in Open.

The two buttons are neutral icon buttons, a left arrow with the accessible name "Previous article" and a right arrow with the accessible name "Next article". Each is disabled while the Article history has no article in its direction. While the Compendium View is open, the Q key presses the Previous article button and the W key presses the Next article button, so that the Player steps through the Article history with the hand that stays on the keyboard; while the search field has the keyboard focus, the Q and W keys type into it instead. The Article history is part of the place of the Compendium View under [View trail](campaign-screen.md#view-trail), so going back to the Compendium View shows the article and the Article history the Player left, and closing the Compendium View discards it.

# Subject data sheets

A Subject article describes its subject in words, and every value of the subject comes from the subject [GDR](../../foundation/core-concepts.md#game-build-and-content) itself, so that the Compendium never repeats a number that could go stale. The Data sheet shows those values, chosen and worded for each kind of subject instead of listed as raw properties.

A Data sheet follows the body of a Subject article. It has a heading and a table of two columns without a header row: a label in Text muted, and a value. The following rules hold for every Data sheet:

- **Rows:** the rows are those of the table for the subject's Type below, in that order. A row whose value is absent or empty is left out, and a Data sheet without a row is left out with its heading.
- **Labels:** a label is an Article link to the article that the Article term lookup reports for the label's text, under [Player-visible information](../../mechanics/compendium.md#player-visible-information) in Compendium, and plain text when it reports none, e.g. "Skill" links to the article that has the Article term "skill".
- **Numbers:** a number is in the Figure style, and a [Decimal quantity](../../foundation/numbers.md#glossary) is shown under [Decimal quantities shown](../gui.md#decimal-quantities-shown) in Graphical User Interface.
- **Referenced GDRs:** a GDR that a value references is shown by its `name`, as an Article link to the Subject article about it when that article is Player-visible, and as plain text otherwise.
- **Subject articles listed:** a row that lists Subject articles shows the displayed title of each as an Article link, sorted by displayed title ignoring case and separated by "·". It lists only Player-visible articles, so it reveals nothing the Player cannot see yet.
- **[Effect lists](../../foundation/effect-lists.md#glossary):** an [Effect list](../../foundation/effect-lists.md#glossary) is shown as its [Effects](../../foundation/effect-lists.md#glossary) in order, separated by "·", each as the table under [Effects shown](#effects-shown) words it, or as "None" when it holds no Effect.

The following table gives the category name and the Data sheet heading of each subject Type. It is exhaustive for the Types the [GDRs](../../content/gdrs.md) supply Subject articles for; a Subject article whose subject has any other Type is listed under the category Other and has no Data sheet.

| Subject Type | Category | Data sheet heading |
| --- | --- | --- |
| AgentArchetype | Agents | New [Agent](../../mechanics/domain-model.md#agency-and-agents) |
| EnemyArchetype | Enemies | Enemy |
| Weapon | Weapons | Weapon |
| Armor | Armor | Armor |
| Upgrade | Upgrades | Upgrade |
| FactionArchetype | Factions | Faction |
| Lead | Leads | Lead |
| MissionSiteArchetype | [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) | Mission site |

Every value a Data sheet shows is [Player-visible information](../../foundation/engine-contract.md#api-surfaces) whenever the Subject article is Player-visible, under the Player-visible information section of the specification that owns the subject's Type, or the row states when it is shown.

## Agent data sheet

The Data sheet of an AgentArchetype shows what a newly hired Agent starts with, under [Agent creation](../../mechanics/agents-spec.md#agent-creation) in Agents, before any [Upgrade](../../mechanics/domain-model.md#agency-and-agents).

| Label | Value |
| --- | --- |
| Skill | `base_skill`. |
| Health | `base_health`. |
| Weapon | The Weapon that `weapon` references, followed by "· damage" and its `base_weapon_damage`, e.g. "Combat pistol · damage 10". |
| Armor | The Armor that `armor` references, followed by "· armor" and its `base_armor`, e.g. "Standard uniform · armor 0". |

## Enemy data sheet

The Data sheet of an EnemyArchetype shows what every [Enemy](../../mechanics/domain-model.md#combat) of that kind has when its Mission site is created, under [Enemy creation](../../mechanics/combat.md#enemy-creation) in [Combat](../../mechanics/domain-model.md#combat).

| Label | Value |
| --- | --- |
| Skill | `base_skill`. |
| Health | `base_health`. |
| Weapon | The Weapon that `weapon` references, followed by "· damage" and its `base_weapon_damage`, e.g. "Rifle · damage 14". |
| Armor | The Armor that `armor` references, followed by "· armor" and its `base_armor`, e.g. "None · armor 0". |
| Appears at | The Player-visible Subject articles whose subject is a MissionSiteArchetype whose `enemies` names this EnemyArchetype. |

## Weapon data sheet

The Data sheet of a Weapon shows how hard it hits in the hands of a [Combatant](../../mechanics/domain-model.md#combat) without an Upgrade, under [Damage outcome](../../mechanics/combat.md#damage-outcome) in Combat.

| Label | Value |
| --- | --- |
| Damage | `base_weapon_damage`. |
| Damage of a hit | The range of the damage outcome for an [effective weapon damage](../../mechanics/agents-spec.md#combatant-attributes) equal to `base_weapon_damage`, as its two bounds joined by an en dash, e.g. "5–15" for a `base_weapon_damage` of 10 and a `weapon_damage_range` of 0.5. |
| Carried by | The Player-visible Subject articles whose subject is an AgentArchetype or an EnemyArchetype whose `weapon` references this Weapon. |

## Armor data sheet

The Data sheet of an Armor shows how much of the damage of hits it absorbs in each [Combat](../../mechanics/domain-model.md#combat) on a Combatant without an Upgrade, under [Effects of an attack](../../mechanics/combat.md#effects-of-an-attack) in Combat.

| Label | Value |
| --- | --- |
| Armor | `base_armor`. |
| Worn by | The Player-visible Subject articles whose subject is an AgentArchetype or an EnemyArchetype whose `armor` references this Armor. |

## Upgrade data sheet

The Data sheet of an Upgrade shows what one acquisition costs and adds, under [Upgrade effects](../../mechanics/economy-and-upgrades.md#upgrade-effects) in Economy and Upgrades. What the [Agency](../../mechanics/domain-model.md#agency-and-agents) has acquired so far is shown by the [Upgrades View](upgrades-view.md), not here.

| Label         | Value                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| Price         | `price`, followed by "money", e.g. "500 money".                                         |
| Each purchase | The `increment` with a plus sign, worded by the `effect` as the following table states. |

| `effect` | Wording, e.g. |
| --- | --- |
| `agent_cap` | "+20 to the [Agent cap](../../mechanics/domain-model.md#agency-and-agents)" |
| `transport_cap` | "+8 to the [Transport cap](../../mechanics/economy-and-upgrades.md#glossary)" |
| `training_cap` | "+10 to the [Training cap](../../mechanics/economy-and-upgrades.md#glossary)" |
| `agent_weapon_damage` | "+1 weapon damage for every Agent" |
| `agent_max_health` | "+1 max health for every Agent" |
| `agent_armor` | "+1 armor for every Agent" |
| `training_skill_gain` | "+0.50 skill for each turn of [Training](../../mechanics/agents-spec.md#assignments)" |
| `exhaustion_recovery` | "+1.00 [exhaustion](../../mechanics/agents-spec.md#combatant-attributes) recovered each turn" |
| `health_recovery` | "+1.00% of max health recovered each turn" |

## Faction data sheet

A FactionArchetype has no Player-visible value beyond its `name`, so its Data sheet only leads on to what the Player has learned of the [Faction](../../mechanics/domain-model.md#factions).

| Label | Value |
| --- | --- |
| Leads | The Player-visible Subject articles whose subject is a [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose `faction` references this FactionArchetype. |

## Lead data sheet

The Data sheet of a Lead shows where the Lead belongs and what it leads to, under [Player-visible information](../../mechanics/leads-and-progression.md#player-visible-information) in Leads and Progression.

| Label | Value |
| --- | --- |
| Faction | The FactionArchetype that `faction` references. A Lead without `faction` has no such row. |
| [Required progress](../../mechanics/leads-and-progression.md#glossary) | `required_progress` when the Lead is an [Assessed Lead](../../mechanics/investigations.md#glossary); otherwise "Unknown", in Text muted. |
| Reveals | The MissionSiteArchetype that the `create_mission_site` Effect of `on_completion` names. A Lead without that Effect has no such row. |
| On completion | "Eliminates the Faction" for an `eliminate_faction` Effect of `on_completion`, "Unlocks [Contracting](../../mechanics/agents-spec.md#assignments)" for an `unlock_contracting` Effect, and "Wins the [Campaign](../../foundation/core-concepts.md#campaign-and-session)" for a `win_campaign` Effect, each in Positive. A Lead with none of these Effects has no such row. |
| Can be investigated again | By the `investigate_again` the Lead has, under [Lead](../../mechanics/leads-and-progression.md#lead) in Leads and Progression: "Never" for `never`, "Until its [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is won" for `until_mission_won`, and "Always" for `always`. |

## Mission site data sheet

The Data sheet of a MissionSiteArchetype shows what awaits a team there and what is at stake, under [Consequences](../../mechanics/missions.md#consequences) in Missions. The operation level of a MissionSiteArchetype of kind response is the FactionOperationLevel whose `level` equals its `operation_level`.

| Label | Value |
| --- | --- |
| Appears | For the kind initiative: "When an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) completes". For the kind response: "When a Faction carries out an operation of level", the `level` of the operation level, and its `name` in parentheses, e.g. "When a Faction carries out an operation of level 1 (Soft operations)". |
| Expires in | `expires_in_turns`, followed by "turn" when it is 1 and "turns" otherwise, e.g. "1 turn" or "3 turns". |
| Enemies | Each entry of `enemies` in authored order, separated by "·", as its count, "×", and the EnemyArchetype, e.g. "8 × Initiate · 1 × Soldier". |
| Reward for a win | For the kind initiative, the Effect list `on_win`. For the kind response, the Effect list `on_win` of the operation level. |
| If lost or expired | For the kind response only, the Effect list `on_ignored_or_lost` of the operation level. |
| Revealed by | For the kind initiative only, the Player-visible Subject articles whose subject is a Lead whose `on_completion` names this MissionSiteArchetype. |

The Effect lists of the operation level are Player-visible whenever the article is, because a MissionSiteArchetype of kind response is Player-visible only while a [Response Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of it exists, and that Mission site makes its operation level's Effect lists Player-visible, under [Player-visible information](../../mechanics/missions.md#player-visible-information) in Missions.

## Effects shown

An Effect of a Data sheet is worded so that the Player reads at once whether it helps or harms. This table is exhaustive for the [Effect kinds](../../foundation/effect-lists.md#glossary) a Mission site Data sheet shows.

| Effect kind | Wording | E.g. |
| --- | --- | --- |
| `money` | The value with a plus or minus sign, followed by "money". | "+100 money" |
| `funding` | The value with a plus or minus sign, followed by "funding". | "−1 funding" |
| `panic` | The value with two decimals, a plus or minus sign, and a percent sign, followed by "[Panic](../../mechanics/domain-model.md#campaign-standing)". | "−0.10% Panic" |
| `eliminate_faction` | "Eliminates the Faction". | "Eliminates the Faction" |
| `defeat` | "Loses the [Campaign](../../foundation/core-concepts.md#campaign-and-session)". | "Loses the Campaign" |

The minus sign is "−" (U+2212). A gain for the Player, i.e. positive money or funding, a negative `panic` value, and `eliminate_faction`, is in Positive, and a loss is in Danger.

# Artboard

![Compendium View panel Artboard with a Mechanics article: a search field above three panes, the categories Guide, Mechanics, and one for each kind of subject with their counts, the articles of the Mechanics category, and the selected article with the Previous article and Next article buttons, its body with underlined Article links, its Formulas table, and its See also line](../../../../images/artboards/compendium-view.png)

![Compendium View panel Artboard with a Subject article: the Enemies category selected, and the article of one Enemy with its description, its Data sheet with linked labels, a linked Weapon, its Armor, and the Mission sites it appears at, after an Article link was followed, so that the Previous article button is enabled](../../../../images/artboards/compendium-view-subject.png)

The sample values, e.g. the article titles, texts, counts, and Data sheet values, appear only on the Artboards, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.

# TODOs

- TODO (later): Opening an article from elsewhere in the graphical user interface, e.g. from the word "exhaustion" in the Agents View.
- TODO (later): Searching the text of articles as well as their displayed titles, under [Panes](#panes).
- TODO (later): Values of the current [Campaign](../../foundation/core-concepts.md#campaign-and-session) in a Data sheet, e.g. whether a Faction is Eliminated or how often an Upgrade was acquired, under [Subject data sheets](#subject-data-sheets).
