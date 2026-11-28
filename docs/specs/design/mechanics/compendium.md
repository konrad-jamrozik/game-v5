# Compendium

| Metadata | Value |
| --- | --- |
| Spec ID | COMP |
| Family | Mechanics |
| Audience | Engine designer, Content designer, UI designer, Implementer |
| Owns | The CompendiumArticle GDR, how the Placeholders and Article links of a Compendium article are resolved, when a Compendium article is Player-visible, including which EnemyArchetypes, Weapons, Armors, and AmmoTypes are Met subjects, what Player API reports of it, and the Revealed Compendium. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Player learns the game by playing it, but needs somewhere to look things up: what to do first, how a hit is decided, or what an Enemy is. The Compendium is that reference, written by the Game designer as game data. It is a set of Compendium articles, each a [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) that serves only the [Display content purpose](../foundation/game-data-records.md#gdr-purpose-display-content): the Game rules never read an article, so adding, removing, or rewriting one never changes gameplay.

Two principles shape every article. An article never states a value of the game itself: where its text needs one, a Placeholder names the GDR property that holds it, so no article can disagree with the game data. And an article never tells the Player more than the Player may know: an article about one GDR, its subject, becomes Player-visible exactly when its subject does, e.g. once a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) is discovered, and a link to an article the Player cannot see stays plain text. The links are not authored either: each article lists the Article terms that name it, and the first mention of one in another article becomes an Article link.

# Glossary

| Term | Definition |
| --- | --- |
| Compendium article | One entry of the Compendium, a [GDR](../foundation/core-concepts.md#game-build-and-content) of [Type](../foundation/core-concepts.md#data-modeling) CompendiumArticle: a Guide article, a Mechanics article, or a Subject article. |
| Guide article | A Compendium article that gives a new Player short orientation on how to play. |
| Mechanics article | A Compendium article that explains one mechanic of the game: a short introduction followed by its formulas. |
| Subject article | A Compendium article that describes one GDR of the game, its subject, e.g. one kind of Enemy. |
| Placeholder | A marker in the text of a Compendium article that names a GDR property and is replaced by the value of that property. |
| Article term | A word or phrase that names a Compendium article, so that its first mention in another article links to that article. |
| Article link | A link from a mention of an Article term, or from a See also entry, to the Compendium article it names. |
| Met subject | An EnemyArchetype, Weapon, or Armor that the Player [has faced or can foresee facing](#met-subjects) in a [World state](../foundation/engine-contract.md#player-actions-and-turns). |
| Revealed Compendium | Every Compendium article of the [Game build](../foundation/core-concepts.md#game-build-and-content), each [resolved as though every article were Player-visible](#revealed-compendium). |

# Compendium article GDRs

An article is authored once, as a GDR, and everything the Player sees of it is computed from that GDR and the rest of the game data.

## CompendiumArticle

Each Compendium article is one GDR of [Type](../foundation/core-concepts.md#game-build-and-content) CompendiumArticle. A Game build may supply any number of them, including none, and a GDR need not have an article.

| Property | Meaning | Read by |
| --- | --- | --- |
| `category` | `guide`, `mechanics`, or `subject`: whether the article is a Guide article, a Mechanics article, or a Subject article. | [Article categories](#article-categories) |
| `title` | Only for a Guide article or a Mechanics article, and required: the title the Player sees. | [Displayed title](#displayed-title) |
| `body` | The introduction of a Guide article or a Mechanics article, or the description of a Subject article, as templated text. Every article has one. | [Article resolution](#article-resolution) |
| `subject` | Only for a Subject article, and required: the [identifier](../foundation/campaign-instances.md#references) of the GDR the article is about. That GDR is not a Compendium article and has a `name`, and no two articles have the same subject. | [Article visibility](#article-visibility) |
| `formulas` | Only for a Mechanics article, and required: an ordered list of one or more rows. Each row has exactly two properties, `label` and `text`, each templated text: what the row is about, and its formula or effect. | [Article resolution](#article-resolution) |
| `terms` | Optional: a list of the Article terms of the article, each a word or phrase without a brace and without white space at its start or end. An article without it has no Article term. No two Article terms of a Game build, whether of one article or of two, are equal ignoring case. | [Article links](#article-links) |
| `see_also` | Optional: an ordered list of identifiers of other Compendium articles that the article points the Player to, each at most once. | [See also](#see-also) |
| `listed_under` | Optional, only for a Guide article or a Mechanics article: the name of a Type that the subject of at least one Subject article of the Game build has, e.g. `AgentArchetype`. A user interface lists the article with the Subject articles about GDRs of that Type, e.g. an article on Deployable Agents with the article about each kind of Agent, instead of with the other articles of its `category`. It may instead be the topic `combat`, for an article on how a [Combat](domain-model.md#combat) is fought, which a user interface lists with the other articles of that topic. The article keeps the shape of its `category`. | [Article categories](#article-categories) |
| `section` | Optional, only for a Mechanics article without `listed_under` or listed under a Type: the name of the group of related mechanics that a user interface lists the article in, among the articles of its `category` or of that Type, e.g. `Campaign`. A user interface defines which names it accepts. | Article categories |
| `visible_when` | Optional: a [Condition](../foundation/conditions.md#glossary) that must hold for the article to be Player-visible, e.g. that the Lead which profiles a Faction is a Completed Lead. It uses no [Condition kind](../foundation/conditions.md#glossary) other than [`lead_completed`](leads-and-progression.md#lead-completed-condition-kind). | [Article visibility](#article-visibility) |

Templated text is plain text that may contain [Placeholders](#placeholders). The templated texts of an article are its `body` and the `label` and `text` of each row of its `formulas`. An article contains no other markup: no headings, lists, emphasis, or authored links.

E.g., a Mechanics article and a Subject article as YAML, with illustrative text:

```yaml
id: mechanics_exhaustion
type: CompendiumArticle
category: mechanics
title: Exhaustion
terms: [exhaustion, exhausted]
body: Exhaustion measures how tired an Agent is. Work and fighting raise it, and rest lowers it.
formulas:
  - label: Each Mission survived
    text: '+{agent_parameters.exhaustion_per_mission}'
  - label: Skill penalty
    text: '−{agent_parameters.skill_penalty_pct_per_exhaustion}% of skill for each point above {agent_parameters.exhaustion_free_points}'
see_also: [mechanics_recovery]
---
id: soldier_article
type: CompendiumArticle
category: subject
subject: soldier
terms: [Soldier, Soldiers]
body: A seasoned fighter, roughly a match for a newly hired Agent.
```

## Article categories

The three categories serve three readers: a new Player who wants to know what to do, a Player who wants to know exactly how a mechanic works, and a Player who has met something in the game and wants to know what it is. The category decides the shape of the article.

| `category` | Article | What the Player sees after the title |
| --- | --- | --- |
| `guide` | Guide article | The `body`, as an introduction. |
| `mechanics` | Mechanics article | The `body`, as an introduction, and then the rows of `formulas`. |
| `subject` | Subject article | The `body`, as a description, and then the Player-visible values of the subject, which a user interface presents. |

A Subject article states no value of its subject in authored text: the values the Player sees of the subject are read from the subject GDR, either by a Placeholder or by the user interface that presents the subject.

## Displayed title

Every article is shown, listed, and linked under one title, and a Subject article takes it from its subject, so that the name of a GDR is authored once.

The displayed title of a Guide article or a Mechanics article is its `title`, and that of a Subject article is the `name` of its subject. No two Compendium articles of a Game build have displayed titles that are equal ignoring case, so a displayed title identifies one article to the Player.

Two texts are equal ignoring case exactly when they are equal after each is converted to lower case. This definition applies wherever a Compendium rule ignores case.

## Placeholders

A Placeholder keeps a value of the game out of authored text: the article says where the value lives, and the Game build supplies it. It is written in templated text in one of these forms:

| Form | It is replaced by |
| --- | --- |
| `{gdr_id.property}` | The value of the property `property` of the GDR whose identifier is `gdr_id`. |
| `{gdr_id.property.N}` | Entry N of the list that is the value of that property, where N is a whole number of at least 1 written without leading zeros, and entry 1 is the first entry. |
| `{subject.property}` and `{subject.property.N}` | The same, read from the subject of the Subject article that contains the Placeholder. `subject` here never names a GDR whose identifier is `subject`. |

A Placeholder is pure substitution: it performs no arithmetic, has no conditions, and adds no unit. The author writes every unit and operator around it, e.g. `{recovery.health_recovery_pct_per_turn}%`, and writes a value that the article needs in another form as it is stored, e.g. `{combat_parameters.incapacitation_skill_fraction} × skill` for a fraction.

In templated text, `{{` stands for one literal `{` and `}}` for one literal `}`. Every other `{` begins a Placeholder, which ends at the next `}`. No part of a Placeholder contains a full stop, a brace, or white space.

A Placeholder is replaced by a value of the Game build, never by a value of [Campaign state](../foundation/core-concepts.md#campaign-and-session): it shows the same text in every [Campaign](../foundation/core-concepts.md#campaign-and-session) and in every [World state](../foundation/engine-contract.md#player-actions-and-turns). E.g., `{recovery.health_recovery_pct_per_turn}` shows the health recovery percentage before any Upgrade, whatever Upgrades the Agency has acquired.

Every Placeholder of a Game build names a property that a GDR of the Game build has, so a renamed or removed property is a data defect of every article that still names it, and no article is ever shown with an unreplaced Placeholder or an outdated value.

### Placeholder sources

A Placeholder may show only what the Player may know wherever the article is shown, so it may name only GDR properties that are Player-visible in every World state in which the article is. A Placeholder of any form may name the properties of a Type whose Forms cell is Any; the properties of the other Types may be named only by `{subject.…}` in a Subject article whose subject is the GDR.

| Type                    | Properties a Placeholder may name                  | Forms              |
| ----------------------- | -------------------------------------------------- | ------------------ |
| AgentArchetype          | Every property                                     | Any                |
| AgentParameters         | Every property                                     | Any                |
| RecoveryParameters      | Every property                                     | Any                |
| EnemyArchetype          | Every property                                     | Any                |
| Weapon                  | `name`, `base_weapon_damage`, `price`, `ammo_type` | Any                |
| Armor                   | `name`, `base_armor`, `price`                      | Any                |
| AmmoType                | Every property                                     | Any                |
| EquipmentParameters     | Every property                                     | Any                |
| CombatParameters        | Every property                                     | Any                |
| EconomyParameters       | Every property                                     | Any                |
| Upgrade                 | Every property                                     | Any                |
| InvestigationParameters | Every property                                     | Any                |
| EndingParameters        | Every property                                     | Any                |
| FactionArchetype        | `name`                                             | `{subject.…}` only |
| Lead                    | `name`, `description`                              | `{subject.…}` only |
| MissionSiteArchetype    | `name`, `expires_in_turns`                         | `{subject.…}` only |

The properties of the last three Types are Player-visible only while the GDR itself is, i.e. while a Subject article about it is, which is why only that article may name them. A property that its owner reveals later than the GDR itself is in no row, e.g. the `required_progress` of a Lead, and neither is one that its owner never reveals, e.g. the [`unlocked_by`](equipment.md#player-visible-information) of a Weapon.

### Value formatting

A Placeholder shows a value as plain text in one fixed form, so that every user interface shows the same characters. A number is shown as the [exact decimal number the GDR file states](../foundation/game-data-records.md#gdr-authoring-format). A whole number is a whole number also where its property holds a decimal number, e.g. a `retreat_below_agent_rating_fraction` authored as `0` is shown as `0`.

| Value | Shown as |
| --- | --- |
| A whole number | Its decimal digits, without a sign when it is zero or positive, without leading zeros, and with a comma between each group of three digits counted from the right, as the GUI [groups digits](../ui/gui.md#digit-grouping), e.g. `1,000` and `250`. |
| A number with a fractional part | Its whole part as above, a full stop, and its fractional digits without trailing zeros, e.g. `0.5` for a value authored as `0.50`. A number authored with only zeros after the full stop is shown as a whole number. |
| A negative number | The minus sign `−` (U+2212) followed by the number without its sign, as above. |
| Text | The text, unchanged. |
| A reference to a GDR, as the property table of the Type defines the property, e.g. the `weapon` of an EnemyArchetype | The `name` of the referenced GDR. |

A Placeholder cannot name a value of any other shape, e.g. a mapping, an absent value, or a whole list.

# Article visibility

Which articles the Player can read depends on what the Player has learned so far, so visibility is decided anew in each World state.

In each [World state](../foundation/engine-contract.md#player-actions-and-turns), a Compendium article is Player-visible exactly when its `visible_when`, if it has one, [holds](../foundation/conditions.md#evaluating-a-condition) in that World state, and one of the following holds:

1. It is a Guide article or a Mechanics article.
2. It is a Subject article and its subject is Player-visible in that World state: the specification that owns the subject's Type declares, as [Player-visible information](../foundation/engine-contract.md#api-surfaces) in that World state, a value that includes the subject GDR, e.g. a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) from the World state in which it is [discovered](leads-and-progression.md#player-visible-information). When the subject is an EnemyArchetype, a Weapon, an Armor, or an [AmmoType](combat.md#ammotype), it must also be a [Met subject](#met-subjects) in that World state.

Whether an article is Player-visible is a [Derived value](../foundation/core-concepts.md#value-classification) of the World state in which it is read; it is never stored.

## Met subjects

Every EnemyArchetype, Weapon, Armor, and AmmoType is [Player-visible in every World state](combat.md#player-visible-information), so that a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) or a [Combat report](domain-model.md#combat) can always name the Enemies in it. An article about each of them from the first [Turn](../foundation/engine-contract.md#player-actions-and-turns) would still tell the Player more than the Player may know, e.g. which Enemy, with which Weapon and Armor, waits at the end of the Campaign.

The article about one therefore waits until the Player meets its subject, i.e. until a Mission site the Player knows of, or can foresee, brings it into play. In a World state:

- **EnemyArchetype:** an EnemyArchetype is a Met subject when the `enemies` of a MissionSiteArchetype that is [Player-visible in that World state](missions.md#player-visible-information) include it.
- **Weapon:** a Weapon is a Met subject when it is the `weapon` of an AgentArchetype or of an EnemyArchetype that is a Met subject in that World state, the [Fallback Weapon](combat.md#ammo), or an [Item](equipment.md#glossary) that is [Unlocked](equipment.md#unlocked-items) or has an [Owned count](equipment.md#glossary) of at least 1 in that World state.
- **Armor:** an Armor is a Met subject when it is the `armor` of an AgentArchetype or of an EnemyArchetype that is a Met subject in that World state, the [Fallback Armor](equipment.md#glossary), or an Item that is [Unlocked](equipment.md#glossary) or has an Owned count of at least 1 in that World state.
- **AmmoType:** an AmmoType is a Met subject when it is the `ammo_type` of a Weapon that is a Met subject in that World state.

Whether a GDR is a Met subject is a Derived value of the World state, never stored. E.g., discovering a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) that creates a Mission site makes the articles about that Mission site's [Enemies](domain-model.md#combat), their Weapons, and their Armors Player-visible, while the article about a Weapon that every Agent carries is Player-visible from the start.

# Article resolution

What the Player reads is the resolved article: its templated texts with every Placeholder replaced and every Article link found. The engine resolves it, so that every user interface, graphical or command-line, shows the same words, values, and links.

The resolved form of a Player-visible article in a World state consists of its resolved `body`, its resolved formula rows in authored order, each a resolved `label` and a resolved `text`, and its [See also entries](#see-also). A resolved templated text is an ordered sequence of segments, each of exactly one of the following kinds:

| Segment | It holds | It comes from |
| --- | --- | --- |
| Plain text | Text. | Authored text outside every Placeholder, with `{{` and `}}` already replaced by the brace each stands for. |
| Inserted value | Text. | One Placeholder, replaced by its value [as plain text](#value-formatting). |
| Article link | Text, and the identifier of the Player-visible article it links to. | A mention of an Article term in authored text that [becomes an Article link](#article-links). |

A resolved article is a [Derived value](../foundation/core-concepts.md#value-classification), never stored.

## Article links

Links between articles are found by rule, as in a reference work in which the first mention of a topic links to its page: an author writes no link, and a new article is linked from every article that mentions it.

In a World state, let V be the Compendium articles that are Player-visible in it. The Article links of an article A in V are found by scanning the authored text of A, i.e. each run of text between Placeholders after `{{` and `}}` are replaced, in this order: the `body`, then each row of `formulas` in authored order, its `label` before its `text`. Each run is scanned from its first character to its last.

1. **Match:** An Article term of an article in V, A included, matches at a position when the text starting there equals the Article term ignoring case, the character before the position is neither a letter nor a digit or the position is the start of the run, and the character after the matched text is neither a letter nor a digit or the matched text ends the run. Letters and digits are those of every script.
2. **Longest match:** When several Article terms match at one position, the longest one matches, e.g. "Mission site" rather than "Mission".
3. **No overlap:** After a match, the scan continues with the character after the matched text. Where no Article term matches, it continues with the next character.
4. **First mention links:** A match becomes an Article link to the article T that the Article term names when T is not A and no earlier match in A, in scan order, became an Article link to T. Every other match stays plain text.
5. **Authored text only:** The text an Article link shows is the matched text as authored, in its authored case. The text that a Placeholder inserts is never scanned, and no match extends across a Placeholder.

**Hidden articles:** Only the Article terms of the articles in V take part. An article that is not Player-visible contributes no match, so the resolved form of every article is exactly what it would be if the Game build did not supply the hidden article, and no link, and no missing link, reveals that it exists.

E.g., with an `exhaustion_per_mission` of 5, a `skill_penalty_pct_per_exhaustion` of 1, and an `exhaustion_free_points` of 30, in a World state in which a Mechanics article with the Article terms `Agent` and `Agents` and another with the Article term `skill` are Player-visible, the Mechanics article of the [YAML example](#compendiumarticle) resolves as follows, with each Article link in square brackets and each inserted value in angle brackets:

| Templated text | Resolved segments |
| --- | --- |
| `body` | `Exhaustion measures how tired an `, `[Agent]`, ` is. Work and fighting raise it, and rest lowers it.` |
| `label` of row 1 | `Each Mission survived` |
| `text` of row 1 | `+`, `<5>` |
| `label` of row 2 | `[Skill]`, ` penalty` |
| `text` of row 2 | `−`, `<1>`, `% of skill for each point above `, `<30>` |

The word `Exhaustion` in the `body` matches the article's own Article term and stays plain text. The word `Skill` in the `label` of row 2 is the first mention of that Article term in scan order, so it links, and `skill` in the `text` of row 2 stays plain text. The word `Mission` stays plain text because no Player-visible article in this example has it as an Article term.

## See also

An author can also point from one article to others that the text does not mention.

The See also entries of a Player-visible article in a World state are the articles its `see_also` names that are Player-visible in that World state, in authored order. Each entry is an Article link whose text is the displayed title of the article it names.

# Coverage of parameter GDRs

A reference is only useful if it is complete: a Player who wants to know how a mechanic works must find every number behind it.

The Compendium articles of the GDRs name, in a Placeholder of at least one article, every property of every parameter GDR, i.e. every GDR whose Type name ends in "Parameters", except the properties that [GDRs exempts](../content/gdrs.md#compendium-coverage) because they describe no mechanic of the game. This is a requirement on the GDRs as authored, which the repository check `npm run compendium:check` enforces; a Game build whose articles leave a property out is not defective.

# Revealed Compendium

A Game designer who writes or checks articles needs to read every one of them, without playing until each is revealed. The Revealed Compendium serves [Revealed presentation](../foundation/developer-access.md#revealed-presentation) in Developer Access: it is the Compendium as it would be if every article were Player-visible.

`developer.queries.getRevealedCompendium()`, a query of [Developer API](../foundation/engine-contract.md#api-surfaces), reports every Compendium article of the Game build in its resolved form, with V in [Article links](#article-links) being every Compendium article, so that every Article term takes part, every See also entry is kept, and the Article term lookup reports the article of any Article term. It also reports, for each article, whether it is Player-visible in the [Current world state](../foundation/engine-contract.md#player-actions-and-turns).

# Player-visible information

[Player API](../foundation/engine-contract.md#api-surfaces) reports an article only as the Player may read it: resolved, and only while it is Player-visible.

In each World state, the identifier, `category`, `listed_under`, displayed title, `subject`, and resolved form of every Player-visible article are [Player-visible information](../foundation/player-api.md#player-visible-information). A user interface receives the segments of the resolved form and neither replaces a Placeholder nor finds an Article link itself. The `body`, `formulas`, `terms`, and `see_also` as authored are never reported, because the `terms` and the `see_also` of a Player-visible article may name an article that is not.

**Article term lookup:** For a given text, Player API reports the Player-visible article that has an Article term equal to the text ignoring case, or that there is none. It lets a user interface link a word of its own to the article that explains it, e.g. the label "Skill" of a table.

A Compendium article that is not Player-visible is absent, never unknown: Player API leaves it out of every result, so the Player cannot learn that it exists, and the Article term lookup of one of its Article terms reports that there is none, exactly as for a text that is no Article term.

# TODOs

- TODO (later): Values of the current Campaign in an article, e.g. a rate after the Agency's Upgrades. Affects [Placeholders](#placeholders).
- TODO (later): A way to keep one mention of an Article term from becoming an Article link. Affects [Article links](#article-links).
