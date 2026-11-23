# Missions

| Metadata | Value |
| --- | --- |
| Spec ID | MISSION |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | What a Mission site and a Mission have, Mission site creation, the Mission site and Mission lifecycles, the deployAgents action, Mission resolution, expiration, and the Consequences for the Campaign. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Missions are where the [Agency](domain-model.md#agency-and-agents) confronts a [Faction](domain-model.md#factions) directly. Some it seeks out: an Initiative [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) comes from a completed [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions). Others are forced on it: a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) comes from a [Faction operation occurrence](domain-model.md#factions), and ignoring one has a price.

A Mission site is an opportunity that does not wait. It stays Active for a number of Advance turns, and the player may deploy one team of Agents to it, only once, which immediately creates its one [Mission](domain-model.md#leads-investigations-mission-sites-and-missions). The Mission's [Combat](domain-model.md#combat) is fought in the next Advance turn: the Mission is Won when the [Combat outcome](combat.md#combat-rounds-and-results) is Won, and Lost otherwise. What follows depends on the kind of Mission site. A Won [Initiative Mission](domain-model.md#leads-investigations-mission-sites-and-missions) rewards the Agency and can eliminate its target Faction. A Lost [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions), like an Expired Response Mission site, raises [Panic](domain-model.md#campaign-standing) and changes funding.

Missions builds on [Factions](./factions.md): Factions says when a Faction operation occurs, and Missions says how the Agency can answer it.

# Glossary

[Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), [Consequences](domain-model.md#leads-investigations-mission-sites-and-missions), and other general terms are in the [Domain Model glossary](domain-model.md#glossary).

| Term | Definition |
| --- | --- |
| Final Mission site state | A lifecycle state of a Mission site that no transition leaves: Concluded, Expired, or Cancelled, under [Mission site lifecycle](#mission-site-lifecycle). A Mission site reaches one once its outcome is settled; its Consequences then apply and it is [Retired](../foundation/world-history.md#glossary). |
| Unfinished Mission site | A Mission site whose lifecycle state is not a Final Mission site state, i.e. Active or [Deployed](agents-spec.md#assignments). |
| Capable for deployment | Of an [Agent](domain-model.md#agency-and-agents): not meeting the incapacitation condition with its current values, under [Incapacitation condition](combat.md#incapacitation-condition) in [Combat](domain-model.md#combat), so that it would not be [Incapacitated](combat.md#combatant-condition-in-a-combat) as soon as it is deployed. |
| Deployable Agent | A [Serving](agents-spec.md#agent-statuses) Agent that is [In base](agents-spec.md#agent-statuses), can take orders, under [Agents that can take orders](agents-spec.md#agents-that-can-take-orders) in Agents, and is Capable for deployment, i.e. one [At assignment](domain-model.md#agency-and-agents) on a [Base Assignment](agents-spec.md#assignments) that `deployAgents` accepts while the [Transport cap](economy-and-upgrades.md#glossary) has a place left, under [Deploying Agents](#deploying-agents). A [Recovering](agents-spec.md#agent-statuses) Agent is In base but cannot take orders, so it is never a Deployable Agent. |

# Mission GDRs

A [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) has a MissionSiteArchetype and a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) a MissionArchetype as its [Archetype](../foundation/core-concepts.md#campaign-instances); both are [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling). Two properties of the FactionOperationLevel Type, `on_win` and `on_ignored_or_lost`, give the [Consequences](domain-model.md#leads-investigations-mission-sites-and-missions) of a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) and its Mission. The GDRs a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [GDRs](../content/gdrs.md) and the YAML files it names.

## MissionSiteArchetype

A MissionSiteArchetype is the Archetype of a Mission site. It describes the site: its kind, its expiration, its Enemies, and, for an [Initiative Mission](domain-model.md#leads-investigations-mission-sites-and-missions), its rewards. No MissionSiteArchetype references a [Faction](domain-model.md#factions); the target Faction of a Mission site comes from its origin, under [Mission site creation](#mission-site-creation). The following property table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Mission site. | [Player-visible information](#player-visible-information) |
| `kind` | `initiative` for an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), or `response` for a Response Mission site. | [Mission site creation](#mission-site-creation); [MissionSiteArchetype selection](#missionsitearchetype-selection) |
| `expires_in_turns` | The number of Advance turns a newly created Mission site stays Active before it is Expired, if no team is deployed to it. | [Mission site creation](#mission-site-creation) |
| `enemies` | An ordered map from the identifier of an EnemyArchetype to a count: which Enemies are present at the Mission site, and how many of each. The order of its keys, as authored, is part of the GDR; [GDR authoring format](../foundation/game-data-records.md#gdr-authoring-format) in Game Data Records guarantees that this order is preserved. | [Mission site creation](#mission-site-creation) |
| `on_win` | Only for the `initiative` kind, and optional: an [Effect list](../foundation/effect-lists.md#glossary) that says what a Won Mission gives. It may hold one [Effect](../foundation/effect-lists.md#glossary) of each of these [Effect kinds](../foundation/effect-lists.md#glossary): `money`, the money the [Agency](domain-model.md#agency-and-agents) gains; `funding`, the funding change; `panic`, the [Panic](domain-model.md#campaign-standing) reduction, written as a negative number; and `eliminate_faction`, which makes the target Faction [Eliminated](factions.md#glossary). A missing `on_win` is an empty Effect list. | [Consequences](#consequences) |
| `can_exist_when` | Only for the `initiative` kind, and optional: a [Condition](../foundation/conditions.md#glossary) that must hold for a Mission site of this MissionSiteArchetype to exist. A MissionSiteArchetype without it sets no such Condition. | [Whether a Mission site can exist](#whether-a-mission-site-can-exist) |
| `operation_level` | Only for the `response` kind, and required: the `level` of the [Faction operation level](factions.md#glossary) the MissionSiteArchetype serves. | [MissionSiteArchetype selection](#missionsitearchetype-selection); [MissionSiteArchetype validation](#missionsitearchetype-validation) |

Of an [EnemyArchetype](combat.md#enemyarchetype), only its identifier is read, through `enemies`.

## MissionArchetype

A MissionArchetype is the Archetype of every Mission. The following property table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning                                  | Read by                                                   |
| -------- | ---------------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the kind of Mission. | [Player-visible information](#player-visible-information) |

None of the [Game rules](../foundation/core-concepts.md#game-build-and-content) reads a MissionArchetype property: every Mission behaves the same, and what distinguishes one Mission from another is its Mission site and its team.

## FactionOperationLevel properties used by Missions

Two properties of [FactionOperationLevel](factions.md#factionoperationlevel) apply to a Response Mission site, and to its Mission, whose Faction operation level is that FactionOperationLevel, under [Consequences](#consequences).

| Property | Meaning | Read by |
| --- | --- | --- |
| `on_win` | An Effect list that says what the Agency gains when such a [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions) is Won. It may hold one Effect of each of these Effect kinds: `money`, the money the Agency gains, and `funding`, the funding change. | [Consequences](#consequences) |
| `on_ignored_or_lost` | An Effect list that says what changes when such a Response Mission is Lost or such a Response Mission site is Expired. It may hold one Effect of each of these Effect kinds: `panic`, the Panic increase, written as a positive number; `funding`, the funding change, which may be negative; and `defeat`, which loses the [Campaign](../foundation/core-concepts.md#campaign-and-session). | [Consequences](#consequences) |

## MissionSiteArchetype validation

The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDR Type MissionSiteArchetype and the FactionOperationLevel properties `on_win` and `on_ignored_or_lost`, and it adds to [Faction GDR validation](factions.md#faction-gdr-validation) in Factions and [Combat GDR validation](combat.md#combat-gdr-validation) in [Combat](domain-model.md#combat). A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **Known properties:** Each MissionSiteArchetype has `name`, `kind`, `expires_in_turns`, and `enemies`, and no property other than those listed in its table above, apart from `id` and `type`. Its `name` is non-empty text.
2. **Kind is valid:** `kind` is exactly `initiative` or `response`.
3. **Expiration is valid:** `expires_in_turns` is a whole number of at least 1.
4. **Enemies are valid:** `enemies` has at least one key. Each key is the identifier of an EnemyArchetype the Game build supplies, and each count is a whole number of at least 1.
5. **Rewards only for Initiative:** A MissionSiteArchetype whose `kind` is `response` has no `on_win`. When a MissionSiteArchetype whose `kind` is `initiative` has `on_win`, it is a valid Effect list, under [Effect list format](../foundation/effect-lists.md#effect-list-format) in Effect Lists, that holds no Effect of a kind other than `money`, `funding`, `panic`, and `eliminate_faction`. The value of its `money` Effect and of its `funding` Effect is at least 0, and the value of its `panic` Effect is at most 0, i.e. a Panic reduction or nothing.
6. **Operation level only for Response:** A MissionSiteArchetype whose `kind` is `response` has `operation_level`, and it equals the `level` of a FactionOperationLevel the Game build supplies. A MissionSiteArchetype whose `kind` is `initiative` has no `operation_level`.
7. **Operation level Consequences are valid:** Every FactionOperationLevel's `on_win` is a valid Effect list that holds no Effect of a kind other than `money` and `funding`, each with a value of at least 0. Its `on_ignored_or_lost` is a valid Effect list that holds no Effect of a kind other than `panic`, with a value of at least 0, i.e. a Panic increase or nothing, `funding`, whose value may be negative, and `defeat`.
8. **Every Faction operation level can be served:** For every key of every FactionActivityLevel's `operation_level_weights`, under [FactionActivityLevel](factions.md#factionactivitylevel) in Factions, the Game build supplies at least one MissionSiteArchetype whose `kind` is `response` and whose `operation_level` equals that key.
9. **Existence Condition only for Initiative:** A MissionSiteArchetype whose `kind` is `response` has no `can_exist_when`. When a MissionSiteArchetype whose `kind` is `initiative` has `can_exist_when`, it is a valid Condition, under [Condition format](../foundation/conditions.md#condition-format) in Conditions, that uses no [Condition kind](../foundation/conditions.md#glossary) other than `mission_won` and `lead_completed`, each with a value its Condition kind permits.

These rules guarantee that every Mission site has at least one [Enemy](domain-model.md#combat) and an expiration of at least one Advance turn, that every Enemy it names can be created, that every Consequence under [Consequences](#consequences) has a valid amount, and that [MissionSiteArchetype selection](#missionsitearchetype-selection) has at least one possible value for every [Faction operation occurrence](domain-model.md#factions). That every MissionSiteArchetype the creating rule of an Initiative Mission site supplies has the `kind` `initiative` follows from the value of the `create_mission_site` Effect kind, under [Mission site Effect kind](#mission-site-effect-kind), and is validated under [Lead GDR validation](leads-and-progression.md#lead-gdr-validation).

## MissionArchetype validation

The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the MissionArchetype Type. A Game build whose GDRs violate one of these rules is defective, under the same handling as [MissionSiteArchetype validation](#missionsitearchetype-validation).

1. **One MissionArchetype:** The Game build supplies exactly one MissionArchetype. Every Mission has it as its Archetype, so no rule selects among MissionArchetypes.
2. **Known properties:** The MissionArchetype has `name`, and no property other than `name`, `id`, and `type`. Its `name` is non-empty text.

# Mission site

A Mission site is the [Campaign instance](../foundation/core-concepts.md#campaign-instances) that holds one opportunity to confront a Faction: whose Enemies are present, where it came from, and how long it stays Active.

## Mission site properties

A Mission site is a Campaign instance whose Archetype is a MissionSiteArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) and [State](../foundation/core-concepts.md#campaign-instances) have exactly the following properties. This table is exhaustive.

| Property | Part | Value | Classification and range |
| --- | --- | --- | --- |
| Kind | Constants | Initiative or Response. | [Authoritative value](../foundation/core-concepts.md#value-classification). Equals the MissionSiteArchetype's `kind`. |
| Origin | Constants | For an Initiative Mission site, an Immutable reference to the [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) whose completion created it. For a Response Mission site, its Faction operation occurrence: an Immutable reference to the initiating Faction and an Immutable reference to the FactionOperationLevel of the occurrence. | Authoritative value, under [Mission site kind and provenance](#mission-site-kind-and-provenance). |
| Target Faction | Constants | An Immutable reference to the Faction whose Enemies are present at the Mission site. | Authoritative value. Always exactly one Faction of the Campaign. |
| Turn created | Constants | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) whose Advance turn created the Mission site. | Authoritative value. A whole number of at least 1. |
| Creation [Combat rating](combat.md#combatant-condition-in-a-combat) | Constants | The [Combat rating](combat.md#combatant-condition-in-a-combat) of its Enemies taken as one side when the Mission site was created, so that how strong it was stays known after a Combat has changed its Enemies. | Authoritative value. A whole number of at least 0. |
| Lifecycle | State | Active, Deployed, Concluded, Expired, or Cancelled, under [Mission site lifecycle](#mission-site-lifecycle). | Authoritative value. |
| Turns until expiration | State | The number of Advance turns after which an Active Mission site is Expired. | Authoritative value. A whole number, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities), from 0 to `expires_in_turns`. Changes only under [Mission site expiration](#mission-site-expiration). |
| Enemies | State | The ordered list of the Enemies present at the Mission site, in their creation order. | Authoritative value. No rule changes the list after creation; each Enemy has its own values under [Combat](combat.md). |

A Mission site also has [Derived values](../foundation/core-concepts.md#value-classification), which are never stored: its Mission, i.e. the Mission whose Mission site reference identifies it, when one exists, under [Mission at a Mission site](#mission-at-a-mission-site); and its Consequences for each final state, i.e. the amounts the [Consequences](#consequences) table would apply when its Mission is Won and when its Mission is Lost or it is Expired, read from its MissionSiteArchetype and, for a Response Mission site, from the FactionOperationLevel of its origin; and the [Combat rating](combat.md#combatant-condition-in-a-combat) of its Enemies, under [Combat rating](combat.md#combat-rating) in Combat. A Mission site has no [Turn series](../foundation/world-history.md#glossary).

**Invariants:** In every [World state](../foundation/engine-contract.md#player-actions-and-turns), every Mission site satisfies all of the following. A World state that violates one is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. Turns until expiration is 0 exactly when the lifecycle state is Expired, and from 1 to `expires_in_turns` otherwise.
2. A Mission whose Mission site reference identifies this Mission site exists exactly when the lifecycle state is Deployed or Concluded, and at most one such Mission exists.
3. The Enemies list has one Enemy for each unit of each count of the MissionSiteArchetype's `enemies`, and each of those Enemies references this Mission site.

**Retention:** A Mission site keeps every property above for the whole Campaign, whatever its lifecycle state, so that every reference to it resolves, e.g. from an Enemy or a Mission. A Mission site becomes [Retired](../foundation/world-history.md#glossary) when it reaches a [Final Mission site state](#glossary), and is kept in the [Retired world state](../foundation/campaign-state.md#glossary) with its final values, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Mission site is ever removed.

## Mission site kind and provenance

A Mission site is either an Initiative Mission site or a Response Mission site; its kind is fixed when it is created. An Initiative Mission site retains its origin: the Investigation whose completion created it, and through that Investigation the [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) it investigated. A Response Mission site retains its Faction operation occurrence origin, which identifies the initiating Faction. Both hold under [How concepts relate](domain-model.md#how-concepts-relate) in Domain Model.

Two Response Mission sites originating from the same Faction are distinct Campaign instances. Target Faction and initiating Faction are explicit references, never inferred from a Mission site's name.

A Mission has the kind of its Mission site: a Mission at an Initiative Mission site is an Initiative Mission, and a Mission at a Response Mission site is a Response Mission. The kind of a Mission is a Derived value read through its Mission site reference; a Mission stores no kind of its own.

## Initial Mission sites

The initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains no Mission site, and therefore no Mission and no Enemy, as [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model requires. No [Campaign configuration](../foundation/campaign-state.md#glossary) value adds a Mission site to it. Every Mission site comes into existence during an Advance turn, under [Mission site creation](#mission-site-creation).

# Mission site creation

A Mission site is created on exactly two occasions, and this list is exhaustive:

1. **From a completed Investigation:** in the [Turn advancement step](turn-advancement.md#glossary) [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions), when a creating rule supplies the following three inputs, and this list is exhaustive: a MissionSiteArchetype whose `kind` is `initiative`; the origin Investigation, i.e. the Investigation whose completion created the Mission site; and the target Faction, a Faction of the Campaign. The Mission site created is an Initiative Mission site. Nothing else about the creating rule is read. The creating rule is an Effect of the kind `create_mission_site`, under [Mission site Effect kind](#mission-site-effect-kind); the completion effect under [Leads and Progression](leads-and-progression.md) applies it, and the completion that triggers it is under [Investigations](investigations.md).
2. **From a Faction operation occurrence:** in the [Turn advancement step](domain-model.md#turn-advancement-steps) Faction activity, under item 2 of [Faction operation occurrence generation](factions.md#faction-operation-occurrence-generation) in Factions, which supplies the initiating Faction, the Faction operation level, and the turn number. The MissionSiteArchetype is the value of the occurrence's [MissionSiteArchetype selection](#missionsitearchetype-selection) outcome. The Mission site created is a Response Mission site.

Each new Mission site has a fresh [Instance ID](../foundation/campaign-instances.md#glossary) under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

| Value | Initial value | Source |
| --- | --- | --- |
| Archetype reference | The MissionSiteArchetype of the occasion. | From a completed Investigation: the MissionSiteArchetype the creating rule supplies. From a Faction operation occurrence: the value of its MissionSiteArchetype selection outcome. |
| Kind | Initiative from a completed Investigation; Response from a Faction operation occurrence. It always equals the MissionSiteArchetype's `kind`. | The occasion; the equality holds because the creating rule supplies a MissionSiteArchetype of kind `initiative` and the selection outcome has only values of kind `response`. |
| Origin | From a completed Investigation: the origin Investigation the creating rule supplies. From a Faction operation occurrence: the initiating Faction and the FactionOperationLevel of the occurrence. | The occasion. |
| Target Faction | From a completed Investigation: the target Faction the creating rule supplies. From a Faction operation occurrence: the initiating Faction. | The creating rule; or the occurrence. |
| Turn created | The turn number of the Turn whose Advance turn creates the Mission site. | Campaign state; for a Faction operation occurrence, also the turn number Factions supplies, which is the same. |
| Lifecycle | Active. | This rule. |
| Turns until expiration | The MissionSiteArchetype's `expires_in_turns`. | `expires_in_turns` of the MissionSiteArchetype. |
| Enemies | Newly created Enemies, under [Enemy creation](#enemy-creation). | `enemies` of the MissionSiteArchetype. |
| Creation Combat rating | The Combat rating of those Enemies taken as one side, from their values as created, under Combat rating in Combat. | The Enemies as created. |

Each Mission site created by an Advance turn is listed in its [Turn report](../foundation/campaign-state.md#glossary), under [Turn report](#turn-report). Creating a Mission site changes nothing else; e.g., it creates no Mission, spends no money, changes no Panic, and changes no [Agent](domain-model.md#agency-and-agents). A Mission site created during an Advance turn does not count down in that same Advance turn, under [Mission site expiration](#mission-site-expiration), whichever of the two occasions creates it. Several Mission sites may be created in one Advance turn, each a distinct Campaign instance, including several with the same MissionSiteArchetype.

## Mission site Effect kind

Game data creates an Initiative Mission site through one Effect kind, so that what creating it means is stated once, whichever rule applies the Effect.

The Effect kind `create_mission_site` is defined as follows, under [Effect kinds](../foundation/effect-lists.md#effect-kinds) in Effect Lists:

- **Value:** the identifier of a MissionSiteArchetype the Game build supplies whose `kind` is `initiative`. The identifier of a MissionSiteArchetype of kind `response`, or of no MissionSiteArchetype, is invalid.
- **Change:** applying one Effect is the creating rule of the first occasion under [Mission site creation](#mission-site-creation): it creates exactly one Initiative Mission site, from the MissionSiteArchetype the value names, in the Turn advancement step that applies the Effect.
- **Supplied inputs:** the origin Investigation and the target Faction, which the rule that applies the Effect supplies.
- **Combined result:** several Effects applied in one Turn advancement step each create their own Mission site, a distinct Campaign instance. The Mission sites are created in the order of their origin Investigations' Instance IDs, under [Independence within the step](investigations.md#independence-within-the-step) in Investigations, so the result does not depend on the order in which an implementation applies the Effects.

## MissionSiteArchetype selection

Each Faction operation occurrence has exactly one **MissionSiteArchetype selection** outcome, a named random outcome. Its candidates are the MissionSiteArchetypes the Game build supplies whose `kind` is `response` and whose `operation_level` equals the `level` of the occurrence's Faction operation level; there is at least one under rule 8 of [MissionSiteArchetype validation](#missionsitearchetype-validation). Its possible values are the candidates, except that when there are two or more candidates, the initiating Faction's previous operation is not a possible value. The initiating Faction's previous operation is the MissionSiteArchetype of the Response Mission site that the Faction's latest earlier Faction operation occurrence created, read from that Mission site, which is [retained](../foundation/world-history.md#glossary) for the whole Campaign under [Mission site properties](#mission-site-properties); a Faction with no earlier occurrence has none. Let `n` be the number of possible values, which is at least 1. The distribution is uniform: each of the `n` MissionSiteArchetypes has [Probability](../foundation/numbers.md#glossary) `1 / n`, exact and never rounded, under [Probabilities](../foundation/numbers.md#probabilities) in Numbers. When `n` is 1, the outcome is that MissionSiteArchetype with Probability 1 and is still a distinct named random outcome.

The outcome depends on the occurrence's Faction operation level, i.e. on the value of the Faction's Operation level outcome under [Operation level](factions.md#operation-level) in Factions, and on the MissionSiteArchetypes the Game build supplies; given that Faction operation level, it depends on nothing else but the initiating Faction's previous operation, i.e. on that Faction's previous MissionSiteArchetype selection outcome. A Faction therefore never carries out the same operation twice in a row when its Faction operation level offers another, and it may repeat an operation after a different one, or at once when the level offers no other; the previous operation of another Faction plays no part. E.g., with the GDR values, a Faction whose previous operation is `foil_sabotage` and whose next occurrence has level 2 selects `foil_vip_assassination` or `defend_against_office_raid`, each with Probability 1/2, while a next occurrence of level 1 selects any of the three MissionSiteArchetypes of level 1, each with Probability 1/3. It is Player-visible once it has a value, as the Response Mission site's MissionSiteArchetype under [Player-visible information](#player-visible-information).

## Enemy creation

The Enemies of a new Mission site are created together with it, each under [Enemy creation](combat.md#enemy-creation) in Combat, which takes from this rule the EnemyArchetype and the Mission site being created. They are created in this order, which is the order of the Mission site's Enemies list: the keys of the MissionSiteArchetype's `enemies` in their authored order, and for each key as many Enemies of that EnemyArchetype as its count, one after another. E.g., a MissionSiteArchetype whose `enemies` is `initiate: 8` followed by `soldier: 1` has the Enemies list of eight Enemies of `initiate` and then one of `soldier`.

# Whether a Mission site can exist

A Mission site is a place worth going to only while there is something there to act on, so the game can say that a Mission site of some kind has no reason to exist, e.g. because the Faction it targets is gone.

Whether a Mission site of a MissionSiteArchetype A targeting a Faction F can exist is a Derived value, calculated from the World state in which it is read. It can exist exactly when both of the following hold. The list is exhaustive.

1. **Its target Faction is not [Eliminated](domain-model.md#factions):** F is not Eliminated.
2. **Its existence Condition holds:** A has no `can_exist_when`, or its `can_exist_when` holds, under [Evaluating a Condition](../foundation/conditions.md#evaluating-a-condition) in Conditions. The evaluating rule supplies F to every `mission_won` Condition. `can_exist_when` may use the Condition kinds `mission_won`, under [Mission won Condition kind](#mission-won-condition-kind), and `lead_completed`, under [Lead completed Condition kind](leads-and-progression.md#lead-completed-condition-kind) in Leads and Progression.

A MissionSiteArchetype of kind `response` has no `can_exist_when`, so a Response Mission site can exist exactly when its target Faction is not Eliminated. The value decides two things, and this list is exhaustive:

- **[Lead availability](domain-model.md#leads-investigations-mission-sites-and-missions):** a Lead that creates a Mission site is available only while that Mission site can exist, under [Lead availability](leads-and-progression.md#lead-availability) in Leads and Progression.
- **Cancellation:** an Active Mission site that cannot exist is Cancelled, under [Cancellation](#cancellation).

It does not decide whether a Mission site is created: a rule that creates a Mission site creates it whether or not it can exist, and Cancellation then removes it from play in the same Advance turn. `can_exist_when`, and whether it or any part of it holds, is not [Player-visible information](../foundation/engine-contract.md#api-surfaces).

## Mission won Condition kind

Game data asks whether a Mission of some kind has been Won through one Condition kind, so that a win can open the way to what comes next.

The Condition kind `mission_won` is defined as follows, under [Condition kinds](../foundation/conditions.md#condition-kinds) in Conditions:

- **Value:** the identifier of a MissionSiteArchetype the Game build supplies, of either kind. The identifier of no MissionSiteArchetype is invalid.
- **Supplied inputs:** a Faction, which the rule that evaluates the Condition supplies.
- **When it holds:** exactly when, in the World state in which the Condition is evaluated, at least one Mission is Won whose Mission site has that MissionSiteArchetype and has the supplied Faction as its target Faction. Once it holds it holds for the rest of the Campaign, because a Won Mission stays Won and is [retained](../foundation/world-history.md#glossary).

The Condition concerns exactly the MissionSiteArchetype it names and exactly the supplied Faction: a Won Mission at a Mission site of another MissionSiteArchetype, or targeting another Faction, does not make it hold. It reads no Investigation and not which Lead, if any, created the Mission site, so a Won Response Mission makes it hold as a Won Initiative Mission does.

# Mission site lifecycle

A Mission site is in exactly one of the lifecycle states Active, Deployed, Concluded, Expired, and Cancelled. The set is exhaustive. Every Mission site is Active when it is created. The transition table is:

| Source state | Target state | Trigger | Condition | Effects |
| --- | --- | --- | --- | --- |
| Active | Deployed | The `deployAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) names the Mission site. | Every precondition under [Deploying Agents](#deploying-agents) holds. | A new Mission at the Mission site comes into existence, [Deployed](agents-spec.md#assignments), with its [Current team](domain-model.md#leads-investigations-mission-sites-and-missions), and those Agents are Deployed at once, under [Deploying Agents](#deploying-agents). |
| Deployed | Concluded | Advance turn, in the Turn advancement step Mission resolution: its Mission becomes Won or Lost. | Its Mission is resolved under [Resolving one Mission](#resolving-one-mission). | None of its own; the Consequences of its Mission's final state apply, under [Consequences](#consequences). |
| Active | Expired | Advance turn, in the Turn advancement step Mission site expiration: its Turns until expiration reaches 0. | The Mission site already existed in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of this Advance turn. | The Expired Consequences apply, under [Mission site expiration](#mission-site-expiration) and [Consequences](#consequences). It never has a Mission. |
| Active | Cancelled | Advance turn, at the end of the Turn advancement step Mission resolution, after every Combat of that step. | It cannot exist, under [Whether a Mission site can exist](#whether-a-mission-site-can-exist), e.g. because its target Faction is [Eliminated](domain-model.md#factions). | None, under [Consequences](#consequences). It never has a Mission. |

Every transition not listed is impossible; e.g., a Deployed Mission site is never Cancelled or Expired. Concluded, Expired, and Cancelled are the Final Mission site states, and nothing leaves them. Deployed is not final: it lasts from the `deployAgents` Player action to the next Mission resolution. A Mission site cannot be attempted twice: once it is Deployed, no Player action deploys Agents to it again. A second Mission site from the same Lead is a new Mission site, under [Leads and Progression](leads-and-progression.md). A Concluded Mission site has no Consequence of its own; the Consequences of the attempt are those of its Mission's final state, under [Consequences](#consequences).

# Mission

A Mission is the Campaign instance that holds one attempt at a Mission site: the team the player sent and what became of it.

## Mission properties

A Mission is a Campaign instance whose Archetype is the MissionArchetype. Its Archetype reference is set when it is created and never changes. It is created only by the `deployAgents` Player action, under [Deploying Agents](#deploying-agents), and always at a Mission site, under [Mission at a Mission site](#mission-at-a-mission-site). Its Constants and State have exactly the following properties. This table is exhaustive.

| Property | Part | Value | Classification and range |
| --- | --- | --- | --- |
| Mission site | Constants | An Immutable reference to the Mission site at which the Mission takes place. | Authoritative value. Always exactly one Mission site of the Campaign. |
| Turn deployed | Constants | The turn number of the Turn in which the `deployAgents` Player action created the Mission. | Authoritative value. A whole number of at least 1. |
| Team sent | Constants | The ordered list of Immutable references to the Agents of the `agents` parameter of `deployAgents`, in that order. | Authoritative value. Non-empty. No rule changes it after creation. |
| Lifecycle | State | Deployed, Won, or Lost, under [Mission lifecycle](#mission-lifecycle). | Authoritative value. |
| Current team | State | The ordered list of the Agents deployed on the Mission, in the order of Team sent, while they are Deployed; afterwards empty. | Authoritative value. Agrees with [Assignments](domain-model.md#agency-and-agents) under [Current versus historical teams](domain-model.md#current-versus-historical-teams). |

A Mission also has Derived values, which are never stored: its kind, which is the kind of its Mission site, so that it is an Initiative Mission or a Response Mission under [Mission site kind and provenance](#mission-site-kind-and-provenance); and its Consequences for each final state, which are those of its Mission site.

**Invariants:** In every World state, every Mission satisfies all of the following. A World state that violates one is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. Its Mission site is Deployed or Concluded, and no other Mission references that Mission site.
2. Its Current team equals its Team sent exactly when the lifecycle state is Deployed, and is empty when it is Won or Lost.

**Retention:** A Mission keeps every property above for the whole Campaign, whatever its lifecycle state, so that every reference to it resolves, e.g. from a [Participation history](domain-model.md#agency-and-agents), and so that Lead discovery and [Lead availability](domain-model.md#leads-investigations-mission-sites-and-missions) can read which Missions are Won, under [Leads and Progression](leads-and-progression.md). A Mission becomes Retired when it becomes Won or Lost, and is kept in the Retired world state with its final values, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Mission is ever removed.

The Agents who took part in a Mission remain recorded after its Current team is empty: in its Team sent and in each [Agent](domain-model.md#agency-and-agents)'s [Participation history](domain-model.md#agency-and-agents), under [Participation history records](agents-spec.md#participation-history-records) in Agents.

## Mission at a Mission site

A Mission takes place at exactly one Mission site, and a Mission site has at most one Mission, under [How concepts relate](domain-model.md#how-concepts-relate) in Domain Model, because the Agency can deploy only one team of Agents to a Mission site, once. No Mission exists without a Mission site, and a Mission site that no team is ever deployed to never has a Mission. Both are [retained](../foundation/world-history.md#glossary) for the whole Campaign, so the Mission's reference to its Mission site always resolves.

A Mission is its own Campaign instance, not a part of its Mission site's State, because it carries facts the Mission site does not have, e.g. the Turn it was deployed in, the team sent, its own lifecycle from deployment to its outcome; and because Assignments and Participation history reference it directly. The [Combat report](domain-model.md#combat) of its Combat, by contrast, is not part of the Mission: it is part of the [Turn report](../foundation/campaign-state.md#glossary) of the Advance turn that fought the Combat, under [Combat report](combat.md#combat-report) in Combat.

The Mission site and its Mission have separate lifecycles, under [Mission site lifecycle](#mission-site-lifecycle) and [Mission lifecycle](#mission-lifecycle). The Mission site's lifecycle describes the opportunity, e.g. whether a team can still be deployed to it or whether it expired unattended; the Mission's lifecycle describes the attempt, e.g. whether its Combat is still to be fought and whether it was Won or Lost.

# Mission lifecycle

A Mission is in exactly one of the lifecycle states Deployed, Won, and Lost. The set is exhaustive. Every Mission is Deployed when it is created, under [Deploying Agents](#deploying-agents). The transition table is:

| Source state | Target state | Trigger | Condition | Effects |
| --- | --- | --- | --- | --- |
| Deployed | Won | Advance turn, in the Turn advancement step Mission resolution: the Mission's Combat is fought. | The [Combat outcome](combat.md#combat-rounds-and-results) is Won. | Its Combat report joins the Turn report; its Agents return or are [Killed](agents-spec.md#agent-statuses); the Won Consequences apply, under [Mission resolution](#mission-resolution) and [Consequences](#consequences). |
| Deployed | Lost | Advance turn, in the Turn advancement step Mission resolution: the Mission's Combat is fought. | The Combat outcome is Retreated or Wiped. | Its Combat report joins the Turn report; its Agents return or are Killed; the Lost Consequences apply, under [Mission resolution](#mission-resolution) and [Consequences](#consequences). |

Every transition not listed is impossible; e.g., nothing leaves Won or Lost. Won and Lost are final, and a Lost Mission stays Lost.

"Deployed" names three states that always hold together: the lifecycle state of a Mission that has a non-empty Current team, the Assignment of each Agent in that Current team, under [Assignment and Agent status](agents-spec.md#assignment-and-agent-status) in Agents, and the lifecycle state of that Mission's Mission site, under [Mission site lifecycle](#mission-site-lifecycle). Where two of them could be confused, the text names the thing that is Deployed, e.g. "the Mission site is Deployed". A Mission is Deployed from the `deployAgents` Player action that creates it until the next Advance turn, because every Deployed Mission is resolved in the first Mission resolution step after the action.

# Deploying Agents

The Player action `player.actions.deployAgents(missionSite, agents)` deploys a team of Agents to a Mission site.

| Parameter | Meaning |
| --- | --- |
| `missionSite` | An Instance ID, meant to identify one Mission site of the Campaign. |
| `agents` | A list of Instance IDs, each meant to identify one Agent of the Campaign. Its order becomes the order of the Mission's Current team; it does not decide the fixed order of the Agents' side of the Combat, under [Resolving one Mission](#resolving-one-mission). |

Preconditions: the action is rejected, as a whole, when any of the following holds:

1. `missionSite` identifies no Mission site of the Campaign.
2. The Mission site is not Active, e.g. because it is already Deployed, or is Expired or Cancelled.
3. `agents` is empty.
4. `agents` contains the same Instance ID more than once.
5. An Instance ID in `agents` identifies no Agent of the Campaign.
6. An Agent in `agents` cannot take orders, under [Agents that can take orders](agents-spec.md#agents-that-can-take-orders) in Agents, e.g. because it is [In transit](domain-model.md#agency-and-agents) or on Recovery.
7. An Agent in `agents` has an Assignment other than a [Base Assignment](agents-spec.md#assignments), i.e. other than [Standby](agents-spec.md#assignments) or [Training](agents-spec.md#assignments). An Agent on [Contracting](agents-spec.md#assignments) or an Investigation must first be recalled to base.
8. The Agents would exceed the [Transport cap](economy-and-upgrades.md#glossary):

   ```text
   D + number of Agents in agents  >  Transport cap
   ```

   where D is the number of [Serving](agents-spec.md#agent-statuses) Agents whose Assignment is Deployed, over every Mission together, in the World state in which the action is requested, and the Transport cap is computed under [Agency caps](economy-and-upgrades.md#agency-caps) in Economy and Upgrades. Every Agent in `agents` adds one, because precondition 6 already rejects an Agent that is Deployed. The action is accepted when the sum is equal to or less than the Transport cap. No rounding occurs; every term is a whole number of Agents.

9. An Agent in `agents` meets the incapacitation condition with its current values, under [Incapacitation condition](combat.md#incapacitation-condition) in Combat, i.e. it would be [Incapacitated](combat.md#combatant-condition-in-a-combat) at [Combat start](combat.md#combat-start) if its Combat began now, and so would never attack in it.

The preconditions on every Player action, e.g. that the Campaign has no [Campaign ending](domain-model.md#campaign-standing), also apply, under [Panic and Endings](panic-and-endings.md) and [Engine Contract](../foundation/engine-contract.md). Only precondition 9 reads an Agent's [exhaustion](agents-spec.md#combatant-attributes), and only through the incapacitation condition: an Agent that is not [Fit to start work](agents-spec.md#assignments) can still be deployed, under [Start-work gate](agents-spec.md#start-work-gate) in Agents, because sending a tired team may be the only way to answer a Mission site, but an Agent that would take no part in the Combat is never sent. E.g., with the GDR values, an Agent on Standby with exhaustion 100 after a costly Mission cannot be deployed until it has rested below 100.

Rejection: the action is all-or-nothing. When any precondition fails, it is rejected with an error that identifies at least one failed precondition and, where the precondition concerns Agents, those Agents; the exact error representation is the Implementer's choice. A rejected action changes nothing, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract. Because every value of a Mission site and of a Mission is [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Player-visible information](#player-visible-information), the error reveals nothing hidden.

State changes: when every precondition holds, the action is one Player action that applies at once, within the same Turn:

- The Mission site's lifecycle state becomes Deployed.
- A new Mission comes into existence, with a fresh Instance ID under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and with these initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances: the MissionArchetype as its Archetype reference; the Mission site as its Mission site; the current turn number as its Turn deployed; the Agents of `agents`, in that order, as its Team sent and as its Current team; and lifecycle state Deployed.
- For every Agent in `agents`: its Assignment becomes Deployed with a Mutable reference to the new Mission, and its [Agent status](domain-model.md#agency-and-agents) is [At assignment](agents-spec.md#agent-statuses) at once, without transit, under [Transit rule](agents-spec.md#transit-rule) and [Assignment changes](agents-spec.md#assignment-changes) in Agents.

Nothing else changes; e.g., no money is spent, the Mission site's Turns until expiration is unchanged, and the Agents' base skill, current health, and exhaustion are unchanged. The Agents count toward the Transport cap at once and until the Mission resolution step of the next Advance turn, under [Agency caps](economy-and-upgrades.md#agency-caps). The Combat is fought in that step.

**No recall:** No Player action removes an Agent from a Mission's Current team or returns a Deployed Mission site to Active. A Deployed Agent cannot take orders and cannot be dismissed, under [Agents that can take orders](agents-spec.md#agents-that-can-take-orders) in Agents. Several `deployAgents` actions in one Turn may each deploy a team to a different Active Mission site, as long as each satisfies the Transport cap with the Agents the earlier ones deployed.

# Mission resolution

In the Turn advancement step Mission resolution, under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, every Mission that is Deployed when the step begins is resolved, and then Mission sites are cancelled. Because a team is Deployed at once and resolved in the next Advance turn, the Missions resolved are exactly those the player created by deploying Agents since the previous Advance turn. When no Mission is Deployed, the resolution part does nothing and only the cancellation part applies.

## Resolving one Mission

For each Deployed Mission M, at Mission site S:

1. **Combat:** A Combat is fought under [Combat](combat.md). Its Agents' side is M's Current team and its Enemies' side is S's Enemies, each in ascending order of the number of its [Instance IDs](../foundation/campaign-instances.md#glossary), which becomes the fixed order of the side under [Fixed order of each side](combat.md#fixed-order-of-each-side). E.g., a Current team of agent-12, agent-3, and agent-7 fights in the fixed order agent-3, agent-7, agent-12. The current values of every [Combatant](domain-model.md#combat) are their [Step-start values](turn-advancement.md#glossary) of this step, under [Combat inputs and outputs](combat.md#combat-inputs-and-outputs). Every Agent of M's Current team is Serving, Deployed on M, and [At assignment](domain-model.md#agency-and-agents), because no Player action or earlier step can change a Deployed Agent's lifecycle state or Assignment, so the lists are valid Combat inputs.
2. **Combat report:** The Combat's Combat report, which names M as its Mission, becomes part of the Turn report of this Advance turn, under [Combat report](combat.md#combat-report) in Combat.
3. **Lifecycle:** M becomes Won when the Combat outcome is Won, and Lost when it is Retreated or Wiped, under [Combat outcomes](combat.md#combat-outcomes).
4. **Killed Agents:** Every Agent whose [current health](agents-spec.md#combatant-attributes) reached 0 in the Combat is Killed under [Killed and Incapacitated](combat.md#killed-and-incapacitated) in Combat; [Agent status](agents-spec.md#agent-status) in Agents removes its Assignment and Agent status and records M in its Participation history.
5. **Survivors:** Every other Agent of M's Current team survives, including an Agent that ended the Combat [Incapacitated](combat.md#combatant-condition-in-a-combat). Its Assignment becomes [Recovery](agents-spec.md#assignments) when its current health is below its [effective max health](agents-spec.md#combatant-attributes), and [Standby](agents-spec.md#assignments) when its current health equals its effective max health; in both cases its Agent status becomes [In transit](agents-spec.md#agent-statuses), under [Assignment changes](agents-spec.md#assignment-changes) in Agents. It leaves M's Current team, and M is recorded in its Participation history under [Participation history records](agents-spec.md#participation-history-records). Under [Transit rule](agents-spec.md#transit-rule), it is still [In transit](domain-model.md#agency-and-agents) when this Advance turn ends. It then regains current health and [exhaustion](agents-spec.md#combatant-attributes) under [Agent Recovery](agent-recovery.md).
6. **Mission exhaustion:** Every survivor gains exhaustion under [Mission exhaustion](#mission-exhaustion).
7. **Mission growth:** Every survivor gains [base skill](agents-spec.md#combatant-attributes) and [Experience](agents-spec.md#growth) from its [combat experience](agents-spec.md#growth) in M's Combat report and its [survival experience](agents-spec.md#growth), under [Mission growth](agents-spec.md#mission-growth) in Agents.
8. **Current team:** M's Current team is now empty.
9. **Consequences:** The Consequences of M's new lifecycle state apply, under [Consequences](#consequences).

S becomes Concluded. A Won Mission can also change Lead discovery and [Lead availability](domain-model.md#leads-investigations-mission-sites-and-missions), under [Leads and Progression](leads-and-progression.md). A Mission raises an Agent's exhaustion only through its Combat, under [Combat](combat.md), and through Mission exhaustion, and raises an Agent's [base skill](agents-spec.md#combatant-attributes) only through Mission growth, under [Changes to attributes](agents-spec.md#changes-to-attributes) in Agents.

## Mission exhaustion

A Mission wears out its survivors beyond the attacks of its Combat, and a Mission that costs lives wears them out much more, so that a bloody Mission takes its survivors out of action for a long rest.

Under step 6 of [Resolving one Mission](#resolving-one-mission), every survivor of Mission M gains exhaustion, whatever M's Combat outcome:

```text
exhaustion gained = exhaustion_per_mission + round up( exhaustion_per_pct_killed × 100 × K / D )
exhaustion after  = exhaustion before + exhaustion gained
```

Inputs:

| Symbol | Meaning | Unit and domain |
| --- | --- | --- |
| `exhaustion_per_mission` | The value of [AgentParameters](agents-spec.md#agentparameters). | Exhaustion points; a whole number of at least 0. |
| `exhaustion_per_pct_killed` | The value of AgentParameters. | Exhaustion points per percent; a whole number of at least 0. |
| K | The number of Agents of M's Current team that were [Killed](agents-spec.md#agent-statuses) in M's Combat. | Agents; a whole number from 0 to D − 1 when M has a survivor. |
| D | The number of Agents of M's Current team when its Combat began, i.e. of its Team sent. | Agents; a whole number of at least 1. |
| exhaustion before | The survivor's exhaustion after M's Combat. | Exhaustion points; a whole number of at least 0. |

Evaluation: the expression is evaluated exactly, under [Exact evaluation](../foundation/numbers.md#exact-evaluation) in Numbers, and [Round up](../foundation/numbers.md#glossary) is applied once, to the share of the team Killed; the divisor D is never zero. Every survivor of M gains the same amount, and no upper clamp applies, under [Attribute ranges](agents-spec.md#attribute-ranges) in Agents, so the result may exceed `exhaustion_incapacitation`. A Killed Agent gains nothing. The Combat outcome does not matter: a Retreated or Wiped team's survivors gain as much as a Won team's, so retreating is never a way to spare exhaustion. E.g., with the GDR values, a team of four with no Agent Killed gains 5 each; a team of four with one Agent Killed gains `5 + round up(100 × 1 / 4) = 30` each; a team of three with one Agent Killed gains `5 + round up(33.33…) = 39` each; and a survivor that leaves the Combat with exhaustion 80 after 73% of its team was Killed ends with `80 + 5 + 73 = 158`.

## Cancellation

After every Deployed Mission of the step has been resolved and its Consequences applied, every Mission site that is Active and cannot exist, under [Whether a Mission site can exist](#whether-a-mission-site-can-exist), becomes Cancelled. Whether it can exist is read at that moment, so a Faction made Eliminated, and a Condition changed, by any Won Mission of this step counts, whichever Mission an implementation resolved first. This is the one rule of this step that does not read [Step-start values](domain-model.md#turn-advancement-steps): it reads whether each Mission site can exist after the step's own Consequences. A Cancelled Mission site has no Consequences, and its Enemies keep their values. Each Mission site that becomes Cancelled is listed in the Turn report, under [Turn report](#turn-report).

Only Active Mission sites are cancelled. A Deployed Mission is never cancelled, and neither is its Mission site, whatever else happens in the Campaign: every Deployed Mission is resolved in the Mission resolution step of the next Advance turn and becomes Won or Lost. E.g., when five Missions are Deployed against one Faction and one of them is Won and makes that Faction Eliminated, the other four are resolved in the same step all the same, whichever of the five an implementation resolves first, and each becomes Won or Lost. A Mission site whose Mission was resolved in the same step is Concluded by then and is not cancelled, even when that resolution made its target Faction Eliminated: its Consequences apply as [Consequences](#consequences) states for a target Faction that is Eliminated.

## Order independence

The result of the step is the same whichever order an implementation resolves the Deployed Missions in, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement:

- **Combats are independent:** An Agent belongs to at most one Current team and an Enemy to exactly one Mission site, so no Combatant takes part in two Combats. A Combat depends only on its own inputs and its own named random outcomes, under [Combat inputs and outputs](combat.md#combat-inputs-and-outputs), so no Combat reads a value another Combat of the step changes.
- **Consequences are sums:** Money changes are added to money, and addition does not depend on order. Funding changes are summed and floored once for the step, under [Funding changes](economy-and-upgrades.md#funding-changes). Panic increases and Panic reductions are added to the [Pending panic change](panic-and-endings.md#pending-panic-change), whose sum does not depend on order, under [Pending panic change](panic-and-endings.md#pending-panic-change).
- **Elimination is idempotent:** Applying [Elimination](factions.md#elimination) to a Faction that is already Eliminated changes nothing, and every application in one step sets the same Eliminated turn, so two Won Missions that eliminate the same Faction give the same result in either order.
- **Cancellation comes last:** Cancellation reads whether a Mission site can exist only after every resolution, under [Cancellation](#cancellation), so it does not depend on which Won Mission was resolved first.

# Mission site expiration

In the Turn advancement step Mission site expiration, under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, each Mission site that is Active when the step begins and that already existed in the Turn-end state of this Advance turn counts down:

```text
Turns until expiration after = Turns until expiration before − 1
```

Turns until expiration before is a whole number of at least 1, by the invariants under [Mission site properties](#mission-site-properties), so the result is a whole number of at least 0 and no rounding occurs. When the result is 0, the Mission site becomes Expired, the Expired Consequences apply, under [Consequences](#consequences), and the Mission site is listed in the Turn report, under [Turn report](#turn-report). When no Mission site qualifies, the step does nothing.

The following Mission sites do not count down in this step, and the list is exhaustive:

- A Mission site created earlier in the same Advance turn, in the Investigation progress step, because it did not exist in the Turn-end state. A Response Mission site created later in the same Advance turn, in the Faction activity step, does not exist yet when this step applies.
- A Mission site that is not Active: Deployed, Concluded, Expired, and Cancelled Mission sites never count down. An Deployed or Concluded Mission site keeps the Turns until expiration it had when its Mission was created.

Each Mission site counts down independently of every other, and the funding changes of all Mission sites Expired in this step are summed and floored once, under [Funding changes](economy-and-upgrades.md#funding-changes), so the result does not depend on processing order.

**Timing consequence:** A Mission site created during the Advance turn ending Turn t with `expires_in_turns` E has Turns until expiration E during Turn t + 1, can be deployed to in each of Turns t + 1 to t + E, and is Expired in the Advance turn ending Turn t + E if no team is deployed to it. A team deployed during Turn t + E, when Turns until expiration is 1, still fights, because Mission resolution precedes Mission site expiration, and the Mission site is then Concluded, not Active.

# Consequences

Consequences are what a Mission site and its Mission change in the Campaign once they reach a final state, e.g. the money a Won Mission brings or the Panic an ignored Response Mission site raises.

The following table states the complete Consequences for the Campaign of each final state of a Mission and of a Mission site, by the kind of the Mission site. It is exhaustive: no other rule of any specification adds a Consequence of these final states, apart from Lead discovery and Lead availability under [Leads and Progression](leads-and-progression.md) and the changes to Agents under [Resolving one Mission](#resolving-one-mission). The Final Mission site state Concluded has no Consequence of its own. "The operation level" is the FactionOperationLevel in the Response Mission site's origin.

| Final state | Initiative | Response |
| --- | --- | --- |
| Mission Won | The Effect list `on_win` of its MissionSiteArchetype is applied. | The Effect list `on_win` of the operation level is applied, exactly once. |
| Mission Lost | None. | The Effect list `on_ignored_or_lost` of the operation level is applied. |
| Mission site Expired | None. | As Lost: the Effect list `on_ignored_or_lost` of the operation level is applied. |
| Mission site Cancelled | None. | None. |

Each Effect list is applied under [Applying an Effect list](../foundation/effect-lists.md#applying-an-effect-list) in Effect Lists, in the Turn advancement step of the transition: Mission resolution for a Won or Lost Mission, and Mission site expiration for an Expired Mission site. The applying rule supplies the Mission site's target Faction to an `eliminate_faction` Effect, and no other Effect kind these Effect lists may hold needs a supplied input. Each Effect changes the Campaign as the definition of its Effect kind states. This table is exhaustive for the Effect kinds these Effect lists may hold:

| Effect kind | A Consequence that is | Defined under |
| --- | --- | --- |
| `money` | Money the Agency gains. | [Money and funding Effect kinds](economy-and-upgrades.md#money-and-funding-effect-kinds) in Economy and Upgrades |
| `funding` | A funding change, summed with the other funding changes of the same step, i.e. all of Mission resolution or all of Mission site expiration. | [Money and funding Effect kinds](economy-and-upgrades.md#money-and-funding-effect-kinds) in Economy and Upgrades |
| `panic` | A Panic increase when its value is positive, and a Panic reduction when it is negative, which the Panic step of the same Advance turn applies. | [Panic Effect kind](panic-and-endings.md#panic-effect-kind) in Panic and Endings |
| `eliminate_faction` | The target Faction made Eliminated. | [Elimination](factions.md#elimination) in Factions |
| `defeat` | The Campaign lost in the Ending check step of the same Advance turn, with Panic unchanged. | [Defeat Effect kind](panic-and-endings.md#defeat-effect-kind) in Panic and Endings |

Among these Effect lists, only the `on_win` of a MissionSiteArchetype of kind initiative may hold an `eliminate_faction` Effect, so a Won Initiative Mission is the only Mission consequence that makes a Faction Eliminated. The completion of a Lead can do so too, under [Completion effect](leads-and-progression.md#completion-effect) in Leads and Progression.

**Consequences for an Eliminated Faction:** A Consequence that changes a Faction, whether to its benefit or to its harm, changes nothing when that Faction is Eliminated at the moment the Consequence applies, including when another Mission resolved in the same step made it Eliminated. In scope the only such Consequence is making the target Faction Eliminated. Every other Consequence, i.e. the money, the funding change, the Panic increase, the Panic reduction, and the Defeat, changes the Agency or the Campaign, not a Faction, and applies in full whether or not the target Faction is Eliminated.

Every amount a Consequence applies is read from GDRs when the transition happens; a missing `on_win` of a MissionSiteArchetype of kind initiative, and an Effect kind that an Effect list does not hold, change nothing. The Consequences of a Mission site and its Mission depend only on the Mission site's kind, the final state of the Mission site or its Mission, and the GDRs they read. A Lost Mission yields no benefit from the [damage dealt](combat.md#combat-rounds-and-results) by its team, and no Consequence of a Mission or a Mission site slows a Faction's escalation or its operations.

**Informative rationale:** A Won Response Mission applies the operation level's `on_win` once, and no rule of [Factions](factions.md) pays it again. A Lost Response Mission has the same Consequences as an Expired Response Mission site because the GDR property `on_ignored_or_lost` names both, and a Lost Mission yields no benefit from the damage dealt by its team.

# Turn report

Besides the [Combat report](domain-model.md#combat) of each Mission it resolves, under [Resolving one Mission](#resolving-one-mission), the [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds three lists of Mission sites, each by Instance ID: the Mission sites created in it, under [Mission site creation](#mission-site-creation); the Mission sites that became Expired in it, under [Mission site expiration](#mission-site-expiration); and the Mission sites that became Cancelled in it, under [Cancellation](#cancellation). The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds the same three lists, unreduced. Both are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report. A list with no Mission site is empty. The [Initial Mission sites](#initial-mission-sites) are created with the Campaign, not by an Advance turn, so no Turn report lists them.

The Turn report also holds:

- **Each Mission resolved:** in the order of its Combat reports, the Mission and its Mission site by Instance ID, whether it is Won or Lost, the Agents of its Team sent that were Killed, the surviving Agents sent to Recovery, and the surviving Agents sent to Standby, under [Resolving one Mission](#resolving-one-mission), for each surviving Agent its survival experience, its [Mission experience](agents-spec.md#growth), and its base skill and Experience after it, under [Mission growth](agents-spec.md#mission-growth) in Agents, and the [Consequences](#consequences) that applied: the money, the funding change, the Panic increase, the Panic reduction, the Faction made Eliminated, and the Defeat, if any.
- **Each Mission site Expired:** besides its Instance ID in the list above, the Consequences that applied, in the same form.

The History entry holds, for each Mission resolved, in the same order, the Mission and its Mission site by Instance ID, whether it is Won or Lost, the Agents Killed, the surviving Agents sent to Recovery, and the surviving Agents sent to Standby, together with what [Combat report](combat.md#combat-report) in Combat states it holds of that Mission's Combat report; and the number of Active Mission sites in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the Turn-end state of that Turn. Of the Turn-end state, it also holds two Combat ratings, under [Combat rating](combat.md#combat-rating) in Combat: that of every Serving Agent taken as one side, and that of every Deployable Agent taken as one side. It also holds, for each Mission resolved and each Mission site Expired, the Consequences that applied, in the same form as the Turn report, so that a Mission site in a final state can show what it changed for the rest of the Campaign. All are Player-visible information, under the same rule.

# Player-visible information

Every value below is Player-visible information under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces), from the moment it exists, without a reveal condition, for every Mission site and every Mission whatever its lifecycle state. The table is exhaustive.

| Value | Player-visible information |
| --- | --- |
| A Mission site's Instance ID and its MissionSiteArchetype, including every property of that GDR other than `can_exist_when` | Yes |
| The `can_exist_when` of any MissionSiteArchetype, and whether it or any part of it holds | No |
| A Mission site's kind, origin, target Faction, Turn created, and Creation Combat rating, including the FactionOperationLevel of a Response Mission site's origin and that GDR's `on_win` and `on_ignored_or_lost` | Yes |
| A Mission site's lifecycle state | Yes |
| A Mission site's Turns until expiration | Yes |
| A Mission site's Enemies list, in its order; the values of each Enemy are Player-visible under [Player-visible information](combat.md#player-visible-information) in Combat | Yes |
| A Mission site's Consequences for each final state, under [Consequences](#consequences) | Yes |
| A Mission's Instance ID, its MissionArchetype, its Mission site, its Turn deployed, and its Team sent, in its order | Yes |
| A Mission's lifecycle state | Yes |
| A Mission's Current team, in its order | Yes |
| The Mission sites created, Expired, and Cancelled in an Advance turn, under [Turn report](#turn-report) | Yes |

A Response Mission site's MissionSiteArchetype is the value of its [MissionSiteArchetype selection](#missionsitearchetype-selection) outcome, so that value is Player-visible through the Mission site from the World state in which the Mission site exists. **Unknown versus absent:** No value in the table is hidden, so Player API never reports one as unknown. A Mission site that no team has been deployed to has no Mission; Player API reports its Mission as absent, and the visible lifecycle state of the Mission site explains why. Turns until expiration is always present; a value of 0 appears only on an Expired Mission site. An empty Current team of a Won or Lost Mission is reported as empty, not as absent.

# Edge cases and failure behavior

- **Deploying on the last Turn before expiration:** A team deployed when Turns until expiration is 1 fights in the next Advance turn, because Mission resolution precedes Mission site expiration; its Mission is Won or Lost, and the Mission site is Concluded, never Expired ([Mission site expiration](#mission-site-expiration)).
- **Creation and expiration in one Advance turn:** A Mission site created in Investigation progress or Faction activity does not count down in the same Advance turn ([Mission site expiration](#mission-site-expiration)).
- **Several Missions resolved in one step:** Each has its own Combat; money, funding, and Panic changes add up, and funding is floored once for the step ([Order independence](#order-independence)).
- **Win that eliminates a Faction while other Mission sites target it:** Every Active Mission site targeting that Faction is Cancelled at the end of the step. A Deployed Mission at a Mission site targeting it in the same step still has its Combat, and is Won or Lost with its full Consequences, e.g. a Won Response Mission still pays the operation level's `on_win` ([Cancellation](#cancellation)).
- **Two wins that eliminate the same Faction in one step:** The Faction is Eliminated once, with one Eliminated turn ([Order independence](#order-independence)).
- **Mission site created for a Faction that is already Eliminated:** A Mission site created in Investigation progress whose target Faction is already Eliminated is Active only until the Cancellation part of Mission resolution in the same Advance turn, which cancels it; no World state shows it Active. A Eliminated Faction creates no Response Mission site, under [Elimination](factions.md#elimination) ([Cancellation](#cancellation)).
- **All Agents Killed:** The Combat outcome is Wiped, so the Mission is Lost with its Lost Consequences. The Mission keeps its Team sent, its Current team is empty, and the Killed Agents no longer count toward the Transport cap ([Resolving one Mission](#resolving-one-mission)).
- **Incapacitated survivors:** An Agent that ends the Combat Incapacitated is alive and returns like any survivor: Recovery if its current health is below its effective max health, Standby if its current health equals its effective max health ([Resolving one Mission](#resolving-one-mission)).
- **Growth after a Lost Mission:** Every survivor gains its Mission experience whatever the Combat outcome, so a Retreated team's survivors grow as a Won team's do, while a Killed Agent's [combat experience](agents-spec.md#growth) is lost (Resolving one Mission).
- **Exhaustion after a costly Mission:** Every survivor gains Mission exhaustion whatever the Combat outcome, and its exhaustion may exceed 100; e.g., the lone survivor of a team of two with one Agent Killed gains `5 + 50 = 55` ([Mission exhaustion](#mission-exhaustion)).
- **Transport cap exactly reached:** Deploying Agents so that the number of Deployed Agents equals the Transport cap is accepted; one more is rejected ([Deploying Agents](#deploying-agents)).
- **Response reward not doubled:** A Won Response Mission applies the operation level's `on_win` once ([Consequences](#consequences)).
- **Lost versus Expired:** A Lost Response Mission and an Expired Response Mission site have identical Consequences, and a Lost Initiative Mission and an Expired Initiative Mission site have none; a Lost Mission yields no benefit from the damage dealt by its team ([Consequences](#consequences)).
- **Deploying to a Mission site that is not Active:** Rejected, e.g. to a Deployed Mission site that already has its Mission, or to an Expired one ([Deploying Agents](#deploying-agents)).
- **Mixed valid and invalid Agents:** One invalid Agent rejects the whole action; no Agent and no Mission site changes, and no Mission is created ([Deploying Agents](#deploying-agents)).
- **An Agent that would be Incapacitated:** Rejected, with the whole action, e.g. an Agent with exhaustion at or above `exhaustion_incapacitation`, or one of base skill 0; it is judged with the Agent's values when the action is requested ([Deploying Agents](#deploying-agents)).
- **Agents away:** An Agent on Contracting or an Investigation is rejected; it must first be recalled to a [Base Assignment](agents-spec.md#assignments), which costs an Advance turn of transit, so deploying never takes an Agent off an Investigation ([Deploying Agents](#deploying-agents)).
- **Elimination of a Faction already Eliminated:** A Won Initiative Mission whose MissionSiteArchetype's `on_win` holds an `eliminate_faction` Effect and whose target Faction is already Eliminated changes nothing about that Faction; the other Effects of its `on_win` still apply ([Consequences](#consequences)).
- **Negative or zero funding change at the floor:** Funding never falls below 0, under [Funding changes](economy-and-upgrades.md#funding-changes) ([Consequences](#consequences)).
- **Invalid GDRs:** A Game build that fails [MissionSiteArchetype validation](#missionsitearchetype-validation), e.g. with an `expires_in_turns` of 0, an empty `enemies`, an `on_win` on a MissionSiteArchetype of kind response, or an `operation_level` that no FactionOperationLevel has, is defective and no Campaign is created from it. A World state violating an invariant under [Mission site properties](#mission-site-properties) or [Mission properties](#mission-properties), e.g. an Active Mission site with a Mission, is an internal invariant violation.
- **Campaign ended:** Once the Campaign has a [Campaign ending](domain-model.md#campaign-standing), `deployAgents` and Advance turn are rejected, under [Panic and Endings](panic-and-endings.md).

# TODOs

- TODO (later): Partial success, so that attempting and failing a Mission differs materially from ignoring its Mission site, as [F. Mission commitment: force concentration, casualties, and partial success](../../../game-design-brief.md#f-mission-commitment-force-concentration-casualties-and-partial-success) in the game design brief requires; under [Consequences](#consequences).
- TODO (later): Faction suppression by a Consequence of a Mission or a Mission site, under [Consequences](#consequences).
- TODO (later): A second attempt at a Mission site, under [Mission site lifecycle](#mission-site-lifecycle).
