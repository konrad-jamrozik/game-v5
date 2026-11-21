# Compendium

| Metadata | Value |
| --- | --- |
| Spec ID | COMP |
| Family | Mechanics |
| Audience | Engine designer, Content designer, UI designer, Implementer |
| Owns | The CompendiumArticle GDR, how the Placeholders and Article links of a Compendium article are resolved, when a Compendium article is Player-visible, including which EnemyArchetypes, Weapons, and Armors are Met subjects, what Player API reports of it, and the Revealed Compendium. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Player learns the game by playing it, but needs somewhere to look things up: what to do first, how a hit is decided, or what an Enemy is. The Compendium is that reference, written by the Game designer as game data. It is a set of Compendium articles, each a [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) that serves only the Display content purpose, under [GDR purpose: display content](../foundation/game-data-records.md#gdr-purpose-display-content) in Game Data Records: the Game rules never read an article, so adding, removing, or rewriting one never changes gameplay.

Two principles shape every article. An article never states a value of the game itself: where its text needs one, a Placeholder names the GDR property that holds it, so no article can disagree with the game data. And an article never tells the Player more than the Player may know: an article about one GDR, its subject, becomes Player-visible exactly when its subject does, e.g. once a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) is discovered, and a link to an article the Player cannot see stays plain text. The links are not authored either: each article lists the Article terms that name it, and the first mention of one in another article becomes an Article link.

# Glossary

These terms are specific to the Compendium.

| Term | Definition |
| --- | --- |
| Compendium article | One entry of the Compendium, a [GDR](../foundation/core-concepts.md#game-build-and-content) of [Type](../foundation/core-concepts.md#data-modeling) CompendiumArticle: a Guide article, a Mechanics article, or a Subject article. |
| Guide article | A Compendium article that gives a new Player short orientation on how to play. |
| Mechanics article | A Compendium article that explains one mechanic of the game: a short introduction followed by its formulas. |
| Subject article | A Compendium article that describes one GDR of the game, its subject, e.g. one kind of Enemy. |
| Placeholder | A marker in the text of a Compendium article that names a GDR property and is replaced by the value of that property. |
| Article term | A word or phrase that names a Compendium article, so that its first mention in another article links to that article. |
| Article link | A link from a mention of an Article term, or from a See also entry, to the Compendium article it names. |
| Met subject | An EnemyArchetype, Weapon, or Armor that the Player has faced or can foresee facing in a [World state](../foundation/engine-contract.md#player-actions-and-turns), under [Met subjects](#met-subjects). |
| Revealed Compendium | Every Compendium article of the [Game build](../foundation/core-concepts.md#game-build-and-content), each resolved as though every article were Player-visible, under [Revealed Compendium](#revealed-compendium). |

# Compendium article GDRs

An article is authored once, as a GDR, and everything the Player sees of it is computed from that GDR and the rest of the game data. The [GDRs](../foundation/core-concepts.md#game-build-and-content) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## CompendiumArticle

Each Compendium article is one GDR of [Type](../foundation/core-concepts.md#game-build-and-content) CompendiumArticle. This table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `category` | `guide`, `mechanics`, or `subject`: whether the article is a Guide article, a Mechanics article, or a Subject article. | [Article categories](#article-categories) |
| `title` | Only for a Guide article or a Mechanics article, and required: the title the Player sees. | [Displayed title](#displayed-title) |
| `body` | The introduction of a Guide article or a Mechanics article, or the description of a Subject article, as templated text. | [Article resolution](#article-resolution) |
| `subject` | Only for a Subject article, and required: the identifier of the GDR the article is about, under [References](../foundation/campaign-instances.md#references) in Campaign Instances. | [Article visibility](#article-visibility) |
| `formulas` | Only for a Mechanics article, and required: an ordered list of one or more rows. Each row has exactly two properties, `label` and `text`, each templated text: what the row is about, and its formula or effect. | [Article resolution](#article-resolution) |
| `terms` | Optional: a list of the Article terms of the article, each a word or phrase. An article without it has no Article term. | [Article links](#article-links) |
| `see_also` | Optional: an ordered list of identifiers of other Compendium articles that the article points the Player to. | [See also](#see-also) |
| `visible_when` | Optional: a [Condition](../foundation/conditions.md#glossary) that must hold for the article to be Player-visible, e.g. that the Lead which profiles a Faction is a Completed Lead. An article without it sets no such Condition. | [Article visibility](#article-visibility) |

Templated text is plain text that may contain Placeholders, under [Placeholders](#placeholders). The templated texts of an article are its `body` and the `label` and `text` of each row of its `formulas`. An article contains no other markup: no headings, lists, emphasis, or authored links.

A Subject article identifies its subject only through `subject`, never through its text or its identifier, under [GDR purpose: display content](../foundation/game-data-records.md#gdr-purpose-display-content) in Game Data Records. E.g., the article whose `subject` is `soldier` is about the EnemyArchetype `soldier` whatever its identifier is.

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

The three categories serve three readers: a new Player who wants to know what to do, a Player who wants to know exactly how a mechanic works, and a Player who has met something in the game and wants to know what it is. The category decides the shape of the article. This table is exhaustive.

| `category` | Article | `title` | `subject` | `formulas` | What the Player sees after the title |
| --- | --- | --- | --- | --- | --- |
| `guide` | Guide article | Required | Absent | Absent | The `body`, as an introduction. |
| `mechanics` | Mechanics article | Required | Absent | Required | The `body`, as an introduction, and then the rows of `formulas`. |
| `subject` | Subject article | Absent | Required | Absent | The `body`, as a description, and then the Player-visible values of the subject, which a user interface presents. |

A Subject article states no value of its subject in authored text: the values the Player sees of the subject are read from the subject GDR, either by a Placeholder or by the user interface that presents the subject, e.g. as a table of the subject's Player-visible values below the description.

## Displayed title

Every article is shown, listed, and linked under one title, and a Subject article takes it from its subject, so that the name of a GDR is authored once.

The displayed title of a Guide article or a Mechanics article is its `title`. The displayed title of a Subject article is the `name` of its subject. No two Compendium articles of a Game build have displayed titles that are equal ignoring case, under [Compendium article GDR validation](#compendium-article-gdr-validation), so a displayed title identifies one article to the Player.

Two texts are equal ignoring case exactly when they are equal after each is converted to lower case. This definition applies wherever a Compendium rule ignores case.

## Placeholders

A Placeholder keeps a value of the game out of authored text: the article says where the value lives, and the Game build supplies it.

A Placeholder is written in templated text in one of the following forms. This table is exhaustive.

| Form | It is replaced by |
| --- | --- |
| `{gdr_id.property}` | The value of the property `property` of the GDR whose identifier is `gdr_id`. |
| `{gdr_id.property.N}` | Entry N of the list that is the value of that property, where N is a whole number of at least 1 written without leading zeros, and entry 1 is the first entry. |
| `{subject.property}` and `{subject.property.N}` | The same, read from the subject of the Subject article that contains the Placeholder. `subject` here never names a GDR whose identifier is `subject`. |

A Placeholder is pure substitution: it performs no arithmetic, has no conditions, and adds no unit, so the author writes every unit and operator around it, e.g. `{recovery.health_recovery_pct_per_turn}%`. A value that an article needs in another form, e.g. a fraction as a percentage, is written with the value as it is stored, e.g. `{combat_parameters.incapacitation_skill_fraction} × skill`.

In templated text, `{{` stands for one literal `{` and `}}` for one literal `}`. Every other `{` begins a Placeholder, which ends at the next `}`, and every other `}` is invalid. Neither part of a Placeholder contains a full stop, a brace, or white space.

A Placeholder is replaced by a value of the Game build, never by a value of [Campaign state](../foundation/core-concepts.md#campaign-and-session): it shows the same text in every [Campaign](../foundation/core-concepts.md#campaign-and-session) and in every [World state](../foundation/engine-contract.md#player-actions-and-turns). E.g., `{recovery.health_recovery_pct_per_turn}` shows the health recovery percentage before any Upgrade, whatever Upgrades the Agency has acquired.

### Placeholder sources

A Placeholder may show only what the Player may know wherever the article is shown, so it may name only GDR properties that are Player-visible in every World state in which the article is.

A Placeholder may name exactly the properties in the following table, which is exhaustive. The middle column lists the properties of a GDR of that Type that a Placeholder may name. The last column says which forms may name them: any form, or only `{subject.…}` in a Subject article whose subject is the GDR.

| Type                    | Properties a Placeholder may name | Forms              |
| ----------------------- | --------------------------------- | ------------------ |
| AgentArchetype          | Every property                    | Any                |
| AgentParameters         | Every property                    | Any                |
| RecoveryParameters      | Every property                    | Any                |
| EnemyArchetype          | Every property                    | Any                |
| Weapon                  | Every property                    | Any                |
| Armor                   | Every property                    | Any                |
| CombatParameters        | Every property                    | Any                |
| EconomyParameters       | Every property                    | Any                |
| Upgrade                 | Every property                    | Any                |
| InvestigationParameters | Every property                    | Any                |
| EndingParameters        | Every property                    | Any                |
| FactionArchetype        | `name`                            | `{subject.…}` only |
| Lead                    | `name`, `description`             | `{subject.…}` only |
| MissionSiteArchetype    | `name`, `expires_in_turns`        | `{subject.…}` only |

Each Type whose Forms are Any has every property declared [Player-visible information](../foundation/engine-contract.md#api-surfaces) in every World state, without a reveal condition, by the specification that owns it: under [Player-visible information](agents-spec.md#player-visible-information) in Agents, [Player-visible information](agent-recovery.md#player-visible-information) in Agent Recovery, [Player-visible information](combat.md#player-visible-information) in [Combat](domain-model.md#combat), [Player-visible information](economy-and-upgrades.md#player-visible-information) in Economy and Upgrades, [Player-visible information](investigations.md#player-visible-information) in Investigations, and [Player-visible information](panic-and-endings.md#player-visible-information) in Panic and Endings. The properties of the other three Types are Player-visible whenever the GDR itself is, i.e. whenever a Subject article about it is Player-visible under [Article visibility](#article-visibility), which is why only that article may name them. A property that its owner reveals later than the GDR itself is in no row, e.g. the `required_progress` of a Lead, which is hidden until an Investigation is Assessed.

A specification that adds a GDR Type, or changes when a property is Player-visible, adds or removes its row here in the same change.

### Value formatting

A Placeholder shows a value as plain text in one fixed form, so that every user interface shows the same characters.

The value a Placeholder names is shown as follows. This table is exhaustive; a Placeholder that names a value of any other shape, e.g. a mapping, an absent value, or a whole list, is invalid.

| Value | Shown as |
| --- | --- |
| A whole number | Its decimal digits, without a sign when it is zero or positive, without leading zeros, and without separators between groups of digits, e.g. `1000`. |
| A number with a fractional part | Its whole part as above, a full stop, and its fractional digits without trailing zeros, e.g. `0.5` for a value authored as `0.50`. A number authored with only zeros after the full stop is shown as a whole number. |
| A negative number | The minus sign `−` (U+2212) followed by the number without its sign, as above. |
| Text | The text, unchanged. |
| A reference to a GDR, as the property table of the Type defines the property, e.g. the `weapon` of an EnemyArchetype | The `name` of the referenced GDR. A reference to a GDR without a `name` is invalid. |

The value is read as the exact decimal number the GDR file states, under [GDR authoring format](../foundation/game-data-records.md#gdr-authoring-format) in Game Data Records, and no rounding occurs.

## Compendium article GDR validation

The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for CompendiumArticle GDRs. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different content, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **Category is valid:** Each CompendiumArticle has a `category` that is exactly `guide`, `mechanics`, or `subject`.
2. **Exact properties:** Each CompendiumArticle has `body`, has `title`, `subject`, and `formulas` exactly as the table under [Article categories](#article-categories) requires for its `category`, and may have `terms`, `see_also`, and `visible_when`. Apart from `id` and `type`, no other property is present.
3. **Text is present:** The `title` and the `body` are each non-empty text. `formulas` is a list of one or more rows, and each row has exactly a `label` and a `text`, each non-empty text.
4. **Subject exists:** A `subject` identifies a GDR of the Game build whose Type is not CompendiumArticle and that has a `name` that is non-empty text.
5. **One article per subject:** No two CompendiumArticles have the same `subject`.
6. **Unique displayed titles:** No two CompendiumArticles have displayed titles that are equal ignoring case, under [Displayed title](#displayed-title).
7. **Article terms are valid:** `terms`, when present, is a list of texts, each non-empty, without a brace, and without white space at its start or end. No two Article terms of the Game build, whether of one article or of two, are equal ignoring case.
8. **See also is valid:** `see_also`, when present, is a list of identifiers, each identifying a CompendiumArticle of the Game build other than the article itself, and none appears twice.
9. **Placeholders are valid:** Every templated text follows the brace rules under [Placeholders](#placeholders). Every Placeholder names a GDR the Game build supplies, or `subject` in a Subject article; names a property that GDR has and that [Placeholder sources](#placeholder-sources) allows in that form; has an index exactly when the value of the property is a list, and then one from 1 to the number of entries; and names a value that [Value formatting](#value-formatting) can show.
10. **Visibility Condition is valid:** `visible_when`, when present, is a valid Condition, under [Condition format](../foundation/conditions.md#condition-format) in Conditions, that uses no [Condition kind](../foundation/conditions.md#glossary) other than `lead_completed`, under [Lead completed Condition kind](leads-and-progression.md#lead-completed-condition-kind) in Leads and Progression.

Rule 9 makes a renamed or removed GDR property a data defect of every article that still names it, so an article cannot silently keep an outdated value. The Game build may supply any number of CompendiumArticles, including none, and a GDR may have no article. An Article term need not occur in any article.

# Article visibility

In each [World state](../foundation/engine-contract.md#player-actions-and-turns), a Compendium article is Player-visible exactly when its `visible_when`, if it has one, holds in that World state, under [Evaluating a Condition](../foundation/conditions.md#evaluating-a-condition) in Conditions, and one of the following holds:

1. It is a Guide article or a Mechanics article.
2. It is a Subject article and its subject is Player-visible in that World state: the specification that owns the subject's Type declares, as [Player-visible information](../foundation/engine-contract.md#api-surfaces) in that World state, a value that includes the subject GDR. When the subject is an EnemyArchetype, a Weapon, or an Armor, it must also be a Met subject in that World state, under Met subjects.

Whether an article is Player-visible is a [Derived value](../foundation/core-concepts.md#value-classification) of the World state in which it is read; it is never stored. It changes only when the visibility of its subject changes, its subject becomes a Met subject, or its `visible_when` starts to hold, so a Subject article without `visible_when` about a subject of another Type becomes Player-visible in the same World state as its subject, e.g. in the World state after the Advance turn whose Mission resolution step discovers its Lead.

The following table restates, for the Types the [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) supply Subject articles for, when the specification that owns each Type makes one of its GDRs Player-visible. It is informative; each owning specification's Player-visible information section governs.

| Subject Type | Owning specification | The subject is Player-visible |
| --- | --- | --- |
| AgentArchetype | [Player-visible information](agents-spec.md#player-visible-information) in Agents | In every World state. |
| EnemyArchetype | [Player-visible information](combat.md#player-visible-information) in [Combat](domain-model.md#combat) | In every World state; its article also needs it to be a Met subject. |
| Weapon | [Player-visible information](combat.md#player-visible-information) in Combat | In every World state; its article also needs it to be a Met subject. |
| Armor | [Player-visible information](combat.md#player-visible-information) in Combat | In every World state; its article also needs it to be a Met subject. |
| Upgrade | [Player-visible information](economy-and-upgrades.md#player-visible-information) in Economy and Upgrades | In every World state. |
| FactionArchetype | [Player-visible information](factions.md#player-visible-information) in Factions | While a [Faction](domain-model.md#factions) whose [Archetype](../foundation/core-concepts.md#campaign-instances) it is exists, i.e. in every World state for an initial Faction's Archetype. |
| Lead | [Player-visible information](leads-and-progression.md#player-visible-information) in Leads and Progression | Once the [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) is discovered, which is permanent, under [Lead discovery](leads-and-progression.md#lead-discovery). |
| MissionSiteArchetype | [Player-visible information](missions.md#player-visible-information) in Missions | While a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) whose Archetype it is exists, or a discovered Lead creates a Mission site from it. |

## Met subjects

Every EnemyArchetype, Weapon, and Armor is Player-visible in every World state, so that a Mission site or a [Combat report](domain-model.md#combat) can always name the Enemies in it. An article about each of them from the first [Turn](../foundation/engine-contract.md#player-actions-and-turns) would still tell the Player more than the Player may know, e.g. that a Cult leader with an anti-materiel rifle and a juggernaut suit waits at the end of the Campaign. The article about one therefore waits until the Player meets its subject, i.e. until a Mission site the Player knows of, or can foresee, brings it into play. The following rules are complete. In a World state:

- **EnemyArchetype:** an EnemyArchetype is a Met subject when the `enemies` of a MissionSiteArchetype that is Player-visible in that World state include it, under [Player-visible information](missions.md#player-visible-information) in Missions.
- **Weapon:** a Weapon is a Met subject when it is the `weapon` of an AgentArchetype, or of an EnemyArchetype that is a Met subject in that World state.
- **Armor:** an Armor is a Met subject when it is the `armor` of an AgentArchetype, or of an EnemyArchetype that is a Met subject in that World state.

Whether a GDR is a Met subject is a Derived value of the World state, never stored. It follows the visibility of the MissionSiteArchetypes, so the article about an [Enemy](domain-model.md#combat) becomes Player-visible when a Lead is discovered that creates a Mission site holding that Enemy, or when a Mission site holding it is created, whichever comes first, e.g. with the Bootstrap GDRs, discovering a Lead that creates an Apprehend member Mission site makes the articles about the initiate, the operative, the basic pistol, and the combat pistol Player-visible, while the article about the service weapon is Player-visible from the start because every Agent carries one.

# Article resolution

What the Player reads is the resolved article: its templated texts with every Placeholder replaced and every Article link found. The engine resolves it, so that every user interface, graphical or command-line, shows the same words, values, and links.

The resolved form of a Player-visible article in a World state consists of its resolved `body`, its resolved formula rows in authored order, each a resolved `label` and a resolved `text`, and its See also entries under [See also](#see-also). A resolved templated text is an ordered sequence of segments, each of exactly one of the following kinds. This table is exhaustive.

| Segment | It holds | It comes from |
| --- | --- | --- |
| Plain text | Text. | Authored text outside every Placeholder, with `{{` and `}}` already replaced by the brace each stands for. |
| Inserted value | Text. | One Placeholder, replaced under [Placeholders](#placeholders) and [Value formatting](#value-formatting). |
| Article link | Text, and the identifier of the Player-visible article it links to. | A mention of an Article term in authored text, under [Article links](#article-links). |

Joined in order, the texts of the segments are the templated text with every Placeholder replaced. A resolved article is a [Derived value](../foundation/core-concepts.md#value-classification), never stored. Of the World state it depends only on which articles are Player-visible, so two World states with the same Player-visible articles resolve every article alike.

## Article links

Links between articles are found by rule, as in a reference work in which the first mention of a topic links to its page: an author writes no link, and a new article is linked from every article that mentions it.

In a World state, let V be the Compendium articles that are Player-visible in it. The Article links of an article A in V are found by scanning the authored text of A, i.e. each run of text between Placeholders after `{{` and `}}` are replaced, in this order: the `body`, then each row of `formulas` in authored order, its `label` before its `text`. Each run is scanned from its first character to its last. The following statements are complete.

1. **Match:** An Article term of an article in V, A included, matches at a position when the text starting there equals the Article term ignoring case, the character before the position is neither a letter nor a digit or the position is the start of the run, and the character after the matched text is neither a letter nor a digit or the matched text ends the run. Letters and digits are those of every script.
2. **Longest match:** When several Article terms match at one position, the longest one matches, e.g. "Mission site" rather than "Mission". Rule 7 of [Compendium article GDR validation](#compendium-article-gdr-validation) makes the longest one unique.
3. **No overlap:** After a match, the scan continues with the character after the matched text. Where no Article term matches, it continues with the next character.
4. **First mention links:** A match becomes an Article link to the article T that the Article term names when T is not A and no earlier match in A, in scan order, became an Article link to T. Every other match stays plain text. An article therefore never links to itself and links to each other article at most once.
5. **Authored text only:** The text an Article link shows is the matched text as authored, in its authored case. The text that a Placeholder inserts is never scanned, and no match extends across a Placeholder.

**Hidden articles:** Only the Article terms of the articles in V take part. An article that is not Player-visible contributes no match, so the resolved form of every article is exactly what it would be if the Game build did not supply the hidden article, and no link, and no missing link, reveals that it exists.

E.g., with the Bootstrap values, in a World state in which a Mechanics article with the Article terms `Agent` and `Agents` and another with the Article term `skill` are Player-visible, the Mechanics article of the YAML example under [CompendiumArticle](#compendiumarticle) resolves as follows, with each Article link in square brackets and each inserted value in angle brackets:

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

The See also entries of a Player-visible article in a World state are the articles its `see_also` names that are Player-visible in that World state, in authored order. Each entry is an Article link whose text is the displayed title of the article it names. An article that `see_also` names and that is not Player-visible is left out, under [Player-visible information](#player-visible-information).

# Coverage of parameter GDRs

A reference is only useful if it is complete: a Player who wants to know how a mechanic works must find every number behind it.

The Compendium articles of the Bootstrap GDRs name, in a Placeholder of at least one article, every property of every parameter GDR, i.e. every GDR whose Type name ends in "Parameters", except the properties that the [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) specification exempts because they describe no mechanic of the game. A new property of a parameter GDR therefore comes with the Mechanics article text that explains it. This is a requirement on the Bootstrap GDRs as authored, which the repository check `npm run compendium:check` enforces; it is not a rule of [Compendium article GDR validation](#compendium-article-gdr-validation), so a Game build whose articles leave a property out is not defective.

# Revealed Compendium

A Game designer who writes or checks articles needs to read every one of them, without playing until each is revealed. The Revealed Compendium serves [Revealed presentation](../foundation/developer-access.md#revealed-presentation) in Developer Access: it is the Compendium as it would be if every article were Player-visible.

`developer.queries.getRevealedCompendium()` reports every Compendium article of the Game build in its resolved form, under Article resolution, with V in [Article links](#article-links) being every Compendium article, so that every Article term takes part, every See also entry is kept, and the Article term lookup reports the article of any Article term. It also reports, for each article, whether it is Player-visible in the [Current world state](../foundation/engine-contract.md#player-actions-and-turns). Placeholders resolve as in every other resolved form, from the same GDR properties. It is a query of [Developer API](../foundation/engine-contract.md#api-surfaces), available only under [Dev mode](../foundation/developer-access.md#dev-mode): it changes no [Campaign state](../foundation/core-concepts.md#campaign-and-session), is not a [Player action](../foundation/engine-contract.md#player-actions-and-turns), and reports nothing through [Player API](../foundation/engine-contract.md#api-surfaces).

# Player-visible information

Every value below is Player-visible information under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), with the reveal condition the table states. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| A Compendium article's identifier, `category`, displayed title, and `subject` | Yes, in each World state in which the article is Player-visible, under [Article visibility](#article-visibility) |
| A Compendium article's resolved form in a World state, under [Article resolution](#article-resolution) | Yes, in each World state in which the article is Player-visible |
| For a text, the Player-visible article that has an Article term equal to the text ignoring case | Yes, in each World state |
| A Compendium article's `body`, `formulas`, `terms`, and `see_also` as authored | No |

Player API reports every Player-visible article in its resolved form, never as authored: a user interface receives the segments under [Article resolution](#article-resolution) and neither replaces a Placeholder nor finds an Article link itself. How a result represents the segments is the Implementer's choice. The authored properties are not reported, because the `terms` and the `see_also` of a Player-visible article may name an article that is not.

**Article term lookup:** For a given text, Player API reports the Player-visible article that has an Article term equal to the text ignoring case, or that there is none. It lets a user interface link a word of its own to the article that explains it, e.g. the label "Skill" of a table.

**Unknown versus absent:** A Compendium article that is not Player-visible is absent: Player API leaves it out of every result and never reports it as unknown, so the Player cannot learn that it exists. Its See also entries in other articles are left out, mentions of its Article terms are plain text, and the Article term lookup of one of its Article terms reports that there is none, exactly as for a text that is no Article term. A Guide article or a Mechanics article is reported without a subject, not with an unknown one.

# Edge cases and failure behavior

- **Subject that is never Player-visible:** A Subject article whose subject no specification ever declares Player-visible, e.g. an article about an undiscovered Lead in a Campaign that never discovers it, is never Player-visible. This is not a defect ([Article visibility](#article-visibility)).
- **Subject visible, then hidden:** A Subject article follows its subject in every World state, so it is no longer Player-visible after undo, redo, or load restores a World state in which its subject is not Player-visible. Article links to it in other articles are plain text again in that World state ([Article visibility](#article-visibility), [Article links](#article-links)).
- **Enemy seen at a Mission site, then the site expires:** The article about the Enemy stays Player-visible, because a Mission site exists in every lifecycle state, so its MissionSiteArchetype stays Player-visible ([Met subjects](#met-subjects)).
- **Enemy named before its article is visible:** Every Enemy belongs to a Mission site whose MissionSiteArchetype lists the Enemy's EnemyArchetype, so the EnemyArchetype of every Enemy in a Player-visible value, e.g. in a Combat report, is a Met subject, and a user interface that links the Enemy's name to its article finds that article Player-visible ([Met subjects](#met-subjects)).
- **A link appears where another was:** When a hidden article becomes Player-visible, a longer Article term of it can match where a shorter Article term of another article matched before, e.g. "Raid safehouse" where "Raid" linked. The resolved form then has the new Article link, and the first later mention of the shorter Article term links instead ([Article links](#article-links)).
- **Article about another article:** A `subject` that identifies a CompendiumArticle fails [Compendium article GDR validation](#compendium-article-gdr-validation), so visibility never depends on another article.
- **Subject without a name:** A `subject` that identifies a GDR without a `name`, e.g. a parameter GDR, fails rule 4 of [Compendium article GDR validation](#compendium-article-gdr-validation), because the article would have no displayed title.
- **Missing or duplicate data:** A `subject` that identifies no GDR, two articles with one displayed title, two articles with one `subject`, two equal Article terms, an empty `title` or `body`, a Mechanics article without `formulas`, or an extra property fails [Compendium article GDR validation](#compendium-article-gdr-validation), and no Campaign is created.
- **Placeholder that names nothing:** A Placeholder that names no GDR, a property the GDR does not have, a property that [Placeholder sources](#placeholder-sources) does not allow, or an entry beyond the end of a list fails rule 9 of [Compendium article GDR validation](#compendium-article-gdr-validation), and no Campaign is created. No article is ever shown with an unreplaced Placeholder.
- **Subject with a displayed title that is an Article term of another article:** This is valid. Displayed titles are unique among displayed titles and Article terms among Article terms; a displayed title is not an Article term unless `terms` lists it ([Displayed title](#displayed-title), [Article links](#article-links)).
- **No gameplay effect:** No rule reads a Compendium article, so equal initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) and the same ordered committed [Player actions](../foundation/engine-contract.md#player-actions-and-turns) produce equal Campaign state with any set of articles, or none.

# TODOs

- TODO (later): Values of the current Campaign in an article, e.g. a rate after the Agency's Upgrades, under [Placeholders](#placeholders).
- TODO (later): A way to keep one mention of an Article term from becoming an Article link, under [Article links](#article-links).
