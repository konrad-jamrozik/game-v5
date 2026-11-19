# Compendium

| Metadata | Value |
| --- | --- |
| Spec ID | COMP |
| Family | Mechanics |
| Audience | Engine designer, Content designer, UI designer, Implementer |
| Owns | The EncyclopediaArticle GDR, and when an Encyclopedia article is Player-visible. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Player learns the game by playing it, but needs somewhere to look things up: what an Enemy is, what an Upgrade does, or how an Investigation progresses. The Compendium is that reference, written by the Game designer as game data. It is a set of Encyclopedia articles, each a [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) that serves only the Display content purpose, under [GDR purpose: display content](../foundation/game-data-records.md#gdr-purpose-display-content) in Game Data Records: the Game rules never read an article, so adding, removing, or rewriting one never changes gameplay.

An article can describe one GDR of the game, its subject, or explain the game in general. An article must never tell the Player more than the Player may know, so an article about a subject becomes Player-visible exactly when its subject does, e.g. an article about a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) appears once the Lead is discovered.

# Glossary

These terms are specific to the Compendium.

| Term | Definition |
| --- | --- |
| Encyclopedia article | A [GDR](../foundation/core-concepts.md#game-build-and-content) of [Type](../foundation/core-concepts.md#data-modeling) EncyclopediaArticle: a title and a body of text, about one subject GDR or about the game in general. |
| Guide article | An Encyclopedia article without a subject, which explains the game in general. |

# Encyclopedia article GDRs

The [GDRs](../foundation/core-concepts.md#game-build-and-content) a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## EncyclopediaArticle

Each Encyclopedia article is one GDR of [Type](../foundation/core-concepts.md#game-build-and-content) EncyclopediaArticle. This table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `title` | The title the Player sees. | [Player-visible information](#player-visible-information) |
| `body` | The text of the article, as plain text. | [Player-visible information](#player-visible-information) |
| `subject` | Optional. The identifier of the GDR the article is about, under [References](../foundation/campaign-instances.md#references) in Campaign Instances. An article without a `subject` is a Guide article. | [Article visibility](#article-visibility) |

An article identifies its subject only through `subject`, never through its `title`, under [GDR purpose: display content](../foundation/game-data-records.md#gdr-purpose-display-content) in Game Data Records. E.g., the article whose `subject` is `soldier` is about the EnemyArchetype `soldier` whatever its title says.

## Encyclopedia article GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for EncyclopediaArticle GDRs. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different content, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **Exact properties:** Each EncyclopediaArticle has `title` and `body` and may have `subject`, apart from `id` and `type`; no other property is present.
2. **Text is present:** The `title` and the `body` are each non-empty text.
3. **Unique titles:** No two EncyclopediaArticles have the same `title`.
4. **Subject exists:** A `subject` identifies a GDR of the Game build whose Type is not EncyclopediaArticle.
5. **One article per subject:** No two EncyclopediaArticles have the same `subject`.

The Game build may supply any number of EncyclopediaArticles, including none, and a GDR may have no article.

# Article visibility

**Proposed rule:** In each [World state](../foundation/engine-contract.md#player-actions-and-turns), an Encyclopedia article is Player-visible exactly when one of the following holds:

1. It is a Guide article.
2. Its subject is Player-visible in that World state: the specification that owns the subject's Type declares, as [Player-visible information](../foundation/engine-contract.md#api-surfaces) in that World state, a value that includes the subject GDR.

Whether an article is Player-visible is a [Derived value](../foundation/core-concepts.md#value-classification) of the World state in which it is read; it is never stored. It changes only when the visibility of its subject changes, so an article becomes Player-visible in the same World state as its subject, e.g. in the World state after the Advance turn whose Mission resolution step discovers its Lead.

The following table restates, for the Types the [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) supply articles for, when the specification that owns each Type makes one of its GDRs Player-visible. It is informative; each owning specification's Player-visible information section governs.

| Subject Type | Owning specification | The subject is Player-visible |
| --- | --- | --- |
| AgentArchetype | [Player-visible information](agents-spec.md#player-visible-information) in Agents | In every World state. |
| EnemyArchetype | [Player-visible information](combat.md#player-visible-information) in [Combat](domain-model.md#combat) | In every World state. |
| Weapon | [Player-visible information](combat.md#player-visible-information) in Combat | In every World state. |
| Upgrade | [Player-visible information](economy-and-upgrades.md#player-visible-information) in Economy and Upgrades | In every World state. |
| FactionArchetype | [Player-visible information](factions.md#player-visible-information) in Factions | While a [Faction](domain-model.md#factions) whose [Archetype](../foundation/core-concepts.md#campaign-instances) it is exists, i.e. in every World state for an initial Faction's Archetype. |
| Lead | [Player-visible information](leads-and-progression.md#player-visible-information) in Leads and Progression | Once the [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) is discovered, which is permanent, under [Lead discovery](leads-and-progression.md#lead-discovery). |
| MissionSiteArchetype | [Player-visible information](missions.md#player-visible-information) in Missions | While a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) whose Archetype it is exists, or a discovered Lead creates a Mission site from it. |

# Player-visible information

**Proposed rule:** Every value below is Player-visible information under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), with the reveal condition the table states. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| An Encyclopedia article's identifier, `title`, `body`, and `subject` | Yes, in each World state in which the article is Player-visible, under [Article visibility](#article-visibility) |

**Unknown versus absent:** An Encyclopedia article that is not Player-visible is absent: Player API leaves it out of every result and never reports it as unknown, so the Player cannot learn that it exists. A Guide article is reported without a subject, not with an unknown one.

# Edge cases and failure behavior

- **Subject that is never Player-visible:** An article whose subject no specification ever declares Player-visible, e.g. an article about an undiscovered Lead in a Campaign that never discovers it, is never Player-visible. This is not a defect ([Article visibility](#article-visibility)).
- **Subject visible, then hidden:** An article follows its subject in every World state, so it is no longer Player-visible after undo, redo, or load restores a World state in which its subject is not Player-visible ([Article visibility](#article-visibility)).
- **Article about another article:** A `subject` that identifies an EncyclopediaArticle fails [Encyclopedia article GDR validation](#encyclopedia-article-gdr-validation), so visibility never depends on another article.
- **Missing or duplicate data:** A `subject` that identifies no GDR, two articles with one `title`, two articles with one `subject`, an empty `title` or `body`, or an extra property fails [Encyclopedia article GDR validation](#encyclopedia-article-gdr-validation), and no Campaign is created.
- **No gameplay effect:** No rule reads an Encyclopedia article, so equal initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) and the same ordered committed [Player actions](../foundation/engine-contract.md#player-actions-and-turns) produce equal Campaign state with any set of articles, or none.

# Acceptance examples

All examples use the Bootstrap GDRs, including `content/compendium/encyclopedia_articles.yaml`, unless an example states a test GDR.

## Campaign creation

This example exercises [Article visibility](#article-visibility) and [Player-visible information](#player-visible-information).

In the initial Campaign state, `locate_red_dawn_member` is the only discovered Lead, under [Campaign creation](leads-and-progression.md#campaign-creation) in Leads and Progression, and no Mission site exists.

| Article | Subject | Player-visible | Why |
| --- | --- | --- | --- |
| `guide_missions` | None | Yes | A Guide article. |
| `soldier_article` | `soldier` (EnemyArchetype) | Yes | Every EnemyArchetype is Player-visible. |
| `transport_cap_article` | `transport_cap` (Upgrade) | Yes | Every Upgrade is Player-visible. |
| `locate_red_dawn_member_article` | `locate_red_dawn_member` | Yes | The Lead is discovered. |
| `apprehend_member_article` | `apprehend_member` | Yes | The discovered Lead `locate_red_dawn_member` creates its Mission sites. |
| `locate_red_dawn_safehouse_article` | `locate_red_dawn_safehouse` | No | The Lead is undiscovered. |
| `raid_safehouse_article` | `raid_safehouse` | No | No Mission site from it exists and no discovered Lead creates one. |
| `foil_sabotage_article` | `foil_sabotage` | No | No Mission site from it exists and no Lead creates one. |

A Player-visible query of the Encyclopedia articles returns the visible articles alone; it returns nothing about `locate_red_dawn_safehouse_article`, `raid_safehouse_article`, or `foil_sabotage_article`.

## The first Mission Won

This example exercises [Article visibility](#article-visibility).

During Turn t, a Mission at an `apprehend_member` Mission site is Won in the Mission resolution step of the Advance turn ending Turn t, which discovers `locate_red_dawn_safehouse`, under [The first Mission Won](leads-and-progression.md#the-first-mission-won) in Leads and Progression. In the World state that Advance turn commits, `locate_red_dawn_safehouse_article` and `raid_safehouse_article` are Player-visible, because the Lead is discovered and creates `raid_safehouse` Mission sites. `locate_red_dawn_hq_article` and `raid_hq_article` stay absent. After undo to the autosave before that Advance turn, the two articles are absent again.

## A Response Mission site

This example exercises [Article visibility](#article-visibility).

The first Faction operation occurrence of Red Dawn at Faction operation level 2 creates a `foil_sabotage` Mission site. In the World state in which that Mission site exists, `foil_sabotage_article` is Player-visible. `foil_recruitment_push_article` stays absent while no `foil_recruitment_push` Mission site exists.

## GDR validation

This example exercises [Encyclopedia article GDR validation](#encyclopedia-article-gdr-validation). Each row adds one test GDR to the Bootstrap GDRs; no Campaign is created from any of them.

| Test GDR                                 | Rule violated              |
| ---------------------------------------- | -------------------------- |
| An article with `subject: no_such_gdr`   | 4. Subject exists          |
| An article with `subject: guide_panic`   | 4. Subject exists          |
| A second article with `subject: soldier` | 5. One article per subject |
| A Guide article with `title: Panic`      | 3. Unique titles           |
| An article with `body: ""`               | 2. Text is present         |
| An article with an `image` property      | 1. Exact properties        |

A test Game build that supplies no EncyclopediaArticle at all is valid, and every Campaign created from it reports no articles.
