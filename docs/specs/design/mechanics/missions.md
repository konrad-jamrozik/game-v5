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

| Term | Definition |
| --- | --- |
| Final Mission site state | A [lifecycle state](#mission-site-lifecycle) of a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) that no transition leaves: Concluded, Expired, or Cancelled. A Mission site reaches one once its outcome is settled; its [Consequences](domain-model.md#leads-investigations-mission-sites-and-missions) then apply and it is [Retired](../foundation/world-history.md#glossary). |
| Unfinished Mission site | A Mission site whose lifecycle state is not a Final Mission site state, i.e. Active or [Deployed](agents-spec.md#assignments). |
| Capable for deployment | Of an [Agent](domain-model.md#agency-and-agents): not meeting the [incapacitation condition](combat.md#incapacitation-condition) of [Combat](domain-model.md#combat) with its current values, so that it would not be [Incapacitated](combat.md#combatant-condition-in-a-combat) as soon as it is deployed. |
| Deployable Agent | A [Serving](agents-spec.md#agent-statuses) Agent that is [In base](agents-spec.md#agent-statuses), [can take orders](agents-spec.md#agents-that-can-take-orders), and is Capable for deployment, i.e. one [At assignment](domain-model.md#agency-and-agents) on a [Base Assignment](agents-spec.md#assignments) that [`deployAgents` accepts](#deploying-agents) while the [Transport cap](economy-and-upgrades.md#glossary) has a place left. A [Recovering](agents-spec.md#agent-statuses) Agent is In base but cannot take orders, so it is never a Deployable Agent. |

# Mission GDRs

A Mission site has a MissionSiteArchetype and a [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) a MissionArchetype as its [Archetype](../foundation/core-concepts.md#campaign-instances); both are [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling). Two properties of the FactionOperationLevel Type give the Consequences of a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) and its Mission.

## MissionSiteArchetype

A MissionSiteArchetype describes one kind of Mission site: its kind, its expiration, its Enemies, and, for an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), its rewards. It references no [Faction](domain-model.md#factions): the target Faction of a Mission site comes from [its origin](#mission-site-creation).

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The display name of the kind of Mission site. | [Player-visible information](#player-visible-information) |
| `kind` | `initiative` for an Initiative Mission site, or `response` for a Response Mission site. | [Mission site creation](#mission-site-creation) |
| `expires_in_turns` | The number of Advance turns a newly created Mission site stays Active before it is Expired, if no team is deployed to it. It is a whole number of at least 1. | [Mission site expiration](#mission-site-expiration) |
| `enemies` | An ordered map from the identifier of an [EnemyArchetype](combat.md#enemyarchetype) to a count of at least 1: which Enemies are present at the Mission site, and how many of each. It has at least one key, so every Mission site has an [Enemy](domain-model.md#combat). | [Enemy creation](#enemy-creation) |
| `on_win` | Only for the `initiative` kind, and optional: an [Effect list](../foundation/effect-lists.md#glossary) that says what a Won Mission gives. It may hold one [Effect](../foundation/effect-lists.md#glossary) of each of these [Effect kinds](../foundation/effect-lists.md#glossary): `money`, the money the [Agency](domain-model.md#agency-and-agents) gains, of at least 0; `funding`, the funding change, of at least 0; `panic`, the [Panic](domain-model.md#campaign-standing) reduction, written as a number of at most 0; and `eliminate_faction`, which makes the target Faction [Eliminated](domain-model.md#factions). | [Consequences](#consequences) |
| `first_win_phrase` | Only for the `initiative` kind, and required: the words that name the first Won Mission at a Mission site of this MissionSiteArchetype, e.g. "first apprehension", which the Player reads when that win [raises the Contracting cap](leads-and-progression.md#turn-report). | [Player-visible information](#player-visible-information) |
| `can_exist_when` | Only for the `initiative` kind, and optional: a [Condition](../foundation/conditions.md#glossary) that must hold for a Mission site of this MissionSiteArchetype to exist. It may use the [Condition kinds](../foundation/conditions.md#glossary) [`mission_won`](#mission-won-condition-kind) and [`lead_completed`](leads-and-progression.md#lead-completed-condition-kind). | [Whether a Mission site can exist](#whether-a-mission-site-can-exist) |
| `operation_level` | Only for the `response` kind, and required: the `level` of the [FactionOperationLevel](factions.md#factionoperationlevel) the MissionSiteArchetype serves. Every `level` that the `operation_level_weights` of a [FactionActivityLevel](factions.md#factionactivitylevel) names is served by at least one MissionSiteArchetype, so that every [Faction operation occurrence](domain-model.md#factions) can create its Response Mission site. | [MissionSiteArchetype selection](#missionsitearchetype-selection) |

## MissionArchetype

Every Mission has the one MissionArchetype as its Archetype. None of the [Game rules](../foundation/core-concepts.md#game-build-and-content) reads a property of it: every Mission behaves the same, and what distinguishes one Mission from another is its Mission site and its team.

| Property | Meaning                                  | Read by                                                   |
| -------- | ---------------------------------------- | --------------------------------------------------------- |
| `name`   | The display name of the kind of Mission. | [Player-visible information](#player-visible-information) |

## FactionOperationLevel properties used by Missions

Two Effect lists of the [FactionOperationLevel](factions.md#factionoperationlevel) in a Response Mission site's origin are the [Consequences](#consequences) of that Mission site and its Mission. Each may hold one Effect of each of the Effect kinds its row names.

| Property | Effect kinds it may hold |
| --- | --- |
| `on_win` | `money`, the money the Agency gains, and `funding`, the funding change, each of at least 0. |
| `on_ignored_or_lost` | `panic`, the Panic increase, written as a number of at least 0; `funding`, the funding change, which may be negative; and `defeat`, which loses the [Campaign](../foundation/core-concepts.md#campaign-and-session). |

# Mission site

A Mission site is the [Campaign instance](../foundation/core-concepts.md#campaign-instances) that holds one opportunity to confront a Faction: whose Enemies are present, where it came from, and how long it stays Active.

## Mission site properties

A Mission site is a Campaign instance whose Archetype is a MissionSiteArchetype. Each property below is an [Authoritative value](../foundation/core-concepts.md#value-classification), and its [Constants](../foundation/core-concepts.md#campaign-instances) are set when it is created.

| Property | Part | Value |
| --- | --- | --- |
| Kind | Constants | Initiative or Response, as the `kind` of its MissionSiteArchetype says. |
| Origin | Constants | For an Initiative Mission site, an Immutable reference to the [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions) whose completion created it. For a Response Mission site, its Faction operation occurrence: an Immutable reference to the initiating Faction and an Immutable reference to the FactionOperationLevel of the occurrence. |
| Target Faction | Constants | An Immutable reference to the Faction whose Enemies are present at the Mission site. |
| Turn created | Constants | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) whose Advance turn created the Mission site. |
| Creation [Combat rating](combat.md#combatant-condition-in-a-combat) | Constants | The [Combat rating](combat.md#combat-rating) of its Enemies taken as one side when the Mission site was created, so that how strong it was stays known after a Combat has changed its Enemies. |
| Lifecycle | State | Its [lifecycle state](#mission-site-lifecycle): Active, Deployed, Concluded, Expired, or Cancelled. |
| Turns until expiration | State | The number of Advance turns after which an Active Mission site is Expired. |
| Enemies | State | The ordered list of the Enemies present at the Mission site, in their creation order. No rule changes the list after creation. |

A Mission site also has [Derived values](../foundation/core-concepts.md#value-classification): its Mission, when one exists; its Consequences for each final state, i.e. what the [Consequences](#consequences) would change when its Mission is Won and when its Mission is Lost or it is Expired; and the Combat rating of its Enemies.

In every [World state](../foundation/engine-contract.md#player-actions-and-turns), every Mission site satisfies these invariants:

1. Turns until expiration is 0 exactly when the lifecycle state is Expired, and from 1 to `expires_in_turns` otherwise.
2. A Mission at the Mission site exists exactly when the lifecycle state is Deployed or Concluded.
3. The Enemies list has one Enemy for each unit of each count of the MissionSiteArchetype's `enemies`, and each of those Enemies references this Mission site.

# Mission site creation

A Mission site comes into existence only during an Advance turn, on one of two occasions; the [initial Campaign state](domain-model.md#initial-campaign-state) contains none.

1. **From a completed Investigation:** the [completion effect](leads-and-progression.md#completion-effect) of a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) applies an Effect of the kind [`create_mission_site`](#mission-site-effect-kind). The Mission site is an Initiative Mission site, with the origin Investigation and the target Faction that the completion effect supplies.
2. **From a Faction operation occurrence:** each [Faction operation occurrence](factions.md#faction-operation-occurrence-generation) creates one Response Mission site. Its MissionSiteArchetype is the value of the occurrence's [MissionSiteArchetype selection](#missionsitearchetype-selection) outcome, its origin is the occurrence, and its target Faction is the initiating Faction.

A new Mission site is Active, its Turns until expiration is the `expires_in_turns` of its MissionSiteArchetype, and its Enemies are [created with it](#enemy-creation).

## Mission site Effect kind

Game data creates an Initiative Mission site through one Effect kind, so that what creating it means is stated once, whichever rule applies the Effect.

The [Effect kind](../foundation/effect-lists.md#effect-kinds) `create_mission_site` has this definition:

- **Value:** the identifier of a MissionSiteArchetype whose `kind` is `initiative`.
- **Change:** applying one Effect creates one Initiative Mission site of the MissionSiteArchetype the value names, in the [Turn advancement step](domain-model.md#turn-advancement-steps) that applies the Effect.
- **Supplied inputs:** the origin Investigation and the target Faction, which the rule that applies the Effect supplies.
- **Combined result:** several Effects applied in one Turn advancement step each create their own Mission site.

## MissionSiteArchetype selection

A Faction operation occurrence fixes how severe the operation is, not which operation it is: that is selected at random among the operations of that severity, and a Faction does not carry out the same operation twice in a row when another exists.

Each Faction operation occurrence has one **MissionSiteArchetype selection** outcome, a named random outcome. Its candidates are the MissionSiteArchetypes whose `kind` is `response` and whose `operation_level` equals the `level` of the occurrence's [Faction operation level](factions.md#glossary). Its possible values are the candidates, except that when there are two or more candidates, the initiating Faction's previous operation is not a possible value. The previous operation is the MissionSiteArchetype of the Response Mission site that the Faction's latest earlier Faction operation occurrence created; a Faction with no earlier occurrence has none, and the previous operation of another Faction plays no part. The distribution is uniform: every possible value has the same [Probability](../foundation/numbers.md#glossary).

E.g., when three MissionSiteArchetypes serve level 2 and a Faction's previous operation is one of them, its next occurrence of level 2 selects one of the other two, each with Probability 1/2, while its next occurrence of level 1 selects any MissionSiteArchetype that serves level 1.

## Enemy creation

The Enemies of a new Mission site are [created](combat.md#enemy-creation) together with it, and the order of their creation is the order of the Mission site's Enemies list: the keys of the MissionSiteArchetype's `enemies` in their authored order, and for each key as many Enemies of that EnemyArchetype as its count, one after another.

E.g., a MissionSiteArchetype whose `enemies` is `initiate: 8` followed by `soldier: 1` gives an Enemies list of eight Enemies of `initiate` and then one of `soldier`.

# Whether a Mission site can exist

A Mission site is a place worth going to only while there is something there to act on, so the game can say that a Mission site of some kind has no reason to exist, e.g. because the Faction it targets is gone.

Whether a Mission site of a MissionSiteArchetype A targeting a Faction F can exist is a Derived value of a World state. It is defined whether or not such a Mission site exists, so that [Lead availability](leads-and-progression.md#lead-availability) can read it. It can exist exactly when both of the following hold:

1. F is not Eliminated.
2. A has no `can_exist_when`, or its `can_exist_when` [holds](../foundation/conditions.md#evaluating-a-condition), with F supplied to every `mission_won` Condition.

An Active Mission site that cannot exist is [Cancelled](#cancellation). The value does not gate creation: a Mission site is created whether or not it can exist.

## Mission won Condition kind

Game data asks whether a Mission of some kind has been Won through one Condition kind, so that a win can open the way to what comes next.

The [Condition kind](../foundation/conditions.md#condition-kinds) `mission_won` has this definition:

- **Value:** the identifier of a MissionSiteArchetype, of either kind.
- **Supplied inputs:** a Faction, which the rule that evaluates the Condition supplies.
- **When it holds:** exactly when at least one Mission is Won whose Mission site has that MissionSiteArchetype and has the supplied Faction as its target Faction.

It reads neither an Investigation nor a Lead, so a Won [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions) makes it hold as a Won [Initiative Mission](domain-model.md#leads-investigations-mission-sites-and-missions) does.

## Mission won with Enemy Condition kind

Game data asks whether the Agency has won a Mission against a Faction where one kind of Enemy stood, so that what follows from facing that Enemy, e.g. questioning what it knew, opens wherever the Agency faced it, whether at a Mission site it sought out or at one a Faction operation brought.

The Condition kind `mission_won_with_enemy` has this definition:

- **Value:** the identifier of an EnemyArchetype.
- **Supplied inputs:** a Faction, as for `mission_won`.
- **When it holds:** exactly when at least one Mission is Won whose Mission site has the supplied Faction as its target Faction and has, in its Enemies list, at least one Enemy whose Archetype is that EnemyArchetype.

What became of the Enemy in the Combat plays no part: a Won Mission whose Enemy of that EnemyArchetype was killed, Incapacitated, or never hit makes the Condition hold alike. E.g., winning a Response Mission at a Mission site where a commander stood makes the Condition that names the commander's EnemyArchetype hold before any Initiative Mission against that Faction is Won.

# Mission site lifecycle

A Mission site is Active from its creation and leaves that state once: when a team is deployed to it, when it expires, or when it loses its reason to exist.

| Source state | Target state | Trigger | Condition |
| --- | --- | --- | --- |
| Active | Deployed | The `deployAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) names the Mission site. | Every [requirement of the action](#deploying-agents) holds. |
| Deployed | Concluded | Its Mission is [resolved](#resolving-one-mission) and becomes Won or Lost. | Always. |
| Active | Expired | Its Turns until expiration [reaches 0](#mission-site-expiration). | Always. |
| Active | Cancelled | [Cancellation](#cancellation) applies. | It [cannot exist](#whether-a-mission-site-can-exist). |

A Mission site becomes Retired when it reaches a Final Mission site state.

# Mission

A Mission is the Campaign instance that holds one attempt at a Mission site: the team the player sent and what became of it.

## Mission properties

A Mission is a Campaign instance whose Archetype is the MissionArchetype, and only [deploying Agents](#deploying-agents) creates one. Its properties are Authoritative values.

| Property | Part | Value |
| --- | --- | --- |
| Mission site | Constants | An Immutable reference to the Mission site at which the Mission takes place. |
| Turn deployed | Constants | The turn number of the Turn in which the `deployAgents` Player action created the Mission. |
| Team sent | Constants | The ordered list of Immutable references to the Agents the action deployed, so that who took part stays known once the [Current team](domain-model.md#leads-investigations-mission-sites-and-missions) is empty. |
| Lifecycle | State | Its [lifecycle state](#mission-lifecycle): Deployed, Won, or Lost. |
| Current team | State | The Agents of the Team sent, in its order, while the Mission is Deployed; empty once it is Won or Lost. |

The kind of a Mission and its Consequences for each final state are those of its Mission site. They are Derived values, and a Mission stores neither.

## Mission at a Mission site

The Agency deploys one team to a Mission site, once, so a Mission site [has at most one Mission](domain-model.md#how-concepts-relate), and a Mission site that no team is deployed to never has one.

A Mission is its own Campaign instance, not a part of its Mission site's [State](../foundation/core-concepts.md#campaign-instances), because it carries facts the Mission site does not have, e.g. the Turn it was deployed in and the team sent, and because Assignments and Participation history reference it directly. The two have separate lifecycles: the Mission site's lifecycle describes the opportunity, e.g. whether a team can still be deployed to it, and the Mission's lifecycle describes the attempt, e.g. whether it was Won or Lost.

# Mission lifecycle

A Mission is Deployed from the moment its team is deployed until its Combat is fought, and Won or Lost from then on.

| Source state | Target state | Trigger | Condition |
| --- | --- | --- | --- |
| Deployed | Won | Its Combat is fought, in [Mission resolution](#resolving-one-mission). | The [Combat outcome](combat.md#combat-rounds-and-results) is Won. |
| Deployed | Lost | Its Combat is fought. | The Combat outcome is Retreated or Wiped. |

A Mission becomes Retired when it becomes Won or Lost.

"Deployed" names three states that always hold together: the lifecycle state of a Mission that has a non-empty Current team, the [Assignment](agents-spec.md#assignment-and-agent-status) of each Agent in that Current team, and the lifecycle state of that Mission's Mission site.

# Deploying Agents

The Player action `player.actions.deployAgents(missionSite, agents)` deploys a team of Agents to a Mission site. `missionSite` identifies the Mission site, and `agents` lists the Agents of the team, in the order that becomes the order of the Team sent.

The action requires all of the following:

1. The Mission site is Active.
2. `agents` names at least one Agent.
3. Every Agent in `agents` [can take orders](agents-spec.md#agents-that-can-take-orders) and has a Base Assignment, i.e. Standby or [Training](agents-spec.md#assignments). An Agent on [Contracting](agents-spec.md#assignments) or an Investigation must first be recalled to base.
4. The team fits under the [Transport cap](economy-and-upgrades.md#agency-caps), which counts the Agents Deployed on every Mission together:

   ```text
   number of Deployed Agents + number of Agents in agents  ≤  Transport cap
   ```

5. Every Agent in `agents` is Capable for deployment.

Only the last requirement reads an Agent's [exhaustion](agents-spec.md#combatant-attributes). An Agent that is not [Fit to start work](agents-spec.md#start-work-gate) can still be deployed, because sending a tired team may be the only way to answer a Mission site, but an Agent that would take no part in the Combat is never sent; e.g., an Agent whose exhaustion has reached `exhaustion_incapacitation` after a costly Mission cannot be deployed until it has rested.

The action applies at once, within the same Turn:

- The Mission site becomes Deployed.
- A new Mission comes into existence at the Mission site. It is Deployed, its Turn deployed is the current turn number, and its Team sent and its Current team are the Agents of `agents`, in that order.
- The [Assignment](domain-model.md#agency-and-agents) of every Agent in `agents` becomes Deployed on the new Mission, and the Agent is [At assignment at once](agents-spec.md#transit-rule).

**No recall:** No Player action removes an Agent from a Mission's Current team or returns a Deployed Mission site to Active.

# Mission resolution

Mission resolution settles every deployment and then closes the Mission sites that have lost their reason to exist. In the [Mission resolution](turn-advancement.md#turn-advancement-steps) step, every Mission that is Deployed when the step begins is resolved, and then [Cancellation](#cancellation) applies.

The Missions are resolved one at a time, in the order in which they were deployed, i.e. in ascending order of the number of their [Instance IDs](../foundation/campaign-instances.md#glossary), because their Combats draw on one [Storage](equipment.md#glossary). The [Ammo](combat.md#ammo) of each Mission's Combat is the rounds of each [AmmoType](combat.md#ammotype) in the Agency's [Storage](equipment.md#storage) as the Missions resolved before it left them, and the rounds its Combat leaves become the count in Storage. E.g., with 300 rounds in Storage, a first Mission whose Agents spend 170 leaves 130 for the second, whose Agents attack with the [Fallback Weapon](combat.md#ammo) once those are spent.

## Resolving one Mission

Resolving a Mission has its Combat fought and then settles what the Combat left: the outcome, the team, and the Consequences. For each Deployed Mission M, at Mission site S, the following parts apply in order:

1. **Combat:** A [Combat](combat.md#combat-inputs-and-outputs) is fought. Its Agents' side is M's Current team and its Enemies' side is S's Enemies, each in ascending order of the number of its [Instance IDs](../foundation/campaign-instances.md#glossary), which is the [fixed order](combat.md#fixed-order-of-each-side) of the side; e.g., a Current team of agent-12, agent-3, and agent-7 fights in the order agent-3, agent-7, agent-12.
2. **Outcome:** M becomes Won when the Combat outcome is Won, and Lost when it is Retreated or Wiped. S becomes Concluded.
3. **Survivors:** Every Agent of the Current team that the Combat did not leave [Killed](agents-spec.md#agent-statuses) is a survivor, and leaves the Current team. Its Assignment becomes [Recovery](agents-spec.md#assignments) when its [current health](agents-spec.md#combatant-attributes) is below its [effective max health](agents-spec.md#combatant-attributes), and [Standby](agents-spec.md#assignments) when the two are equal, and in both cases it starts [In transit](agents-spec.md#transit-rule).
4. **Equipment:** The [Items](equipment.md#glossary) of M's Team sent are settled by [Mission equipment losses](equipment.md#mission-equipment-losses), and a Won M brings its [Spoils of war](equipment.md#spoils-of-war).
5. **Mission exhaustion:** Every survivor gains [Mission exhaustion](#mission-exhaustion).
6. **Mission growth:** Every survivor gains [base skill](agents-spec.md#combatant-attributes) and [Experience](agents-spec.md#growth), by [Mission growth](agents-spec.md#mission-growth).
7. **Consequences:** The [Consequences](#consequences) of M's new lifecycle state apply.

## Mission exhaustion

A Mission wears out its survivors beyond the attacks of its Combat, and a Mission that costs lives wears them out much more, so that a bloody Mission takes its survivors out of action for a long rest.

Every survivor of a Mission M gains the same exhaustion, added to the exhaustion M's Combat left it, whatever the Combat outcome, so that retreating is never a way to spare exhaustion:

```text
exhaustion gained = exhaustion_per_mission + round up( exhaustion_per_pct_killed × 100 × K / D )
```

Here `exhaustion_per_mission`, the exhaustion every Mission costs a survivor, and `exhaustion_per_pct_killed`, the further exhaustion for each percent of the team that was Killed, are whole numbers of at least 0 of [AgentParameters](agents-spec.md#agentparameters); K is the number of Agents of M's Team sent that were Killed in M's Combat, and D is the number of Agents of M's Team sent. The expression is [evaluated exactly](../foundation/numbers.md#exact-evaluation), and [Round up](../foundation/numbers.md#glossary) applies once, to the whole product.

E.g., with an `exhaustion_per_mission` of 4 and an `exhaustion_per_pct_killed` of 2, each of the two survivors of a team of three that lost one Agent gains `4 + round up(2 × 100 × 1 / 3) = 4 + 67 = 71`.

## Cancellation

Cancellation closes the Mission sites that no longer have a reason to exist, without reward or penalty.

After every Deployed Mission of the step has been resolved and its Consequences applied, every Active Mission site that [cannot exist](#whether-a-mission-site-can-exist) becomes Cancelled. Only an Active Mission site is cancelled: a Deployed Mission is [never cancelled](turn-advancement.md#same-turn-interactions), and neither is its Mission site.

# Mission site expiration

An opportunity the Agency leaves unanswered runs out. In the [Mission site expiration](turn-advancement.md#turn-advancement-steps) step, each Mission site that is Active when the step begins, and that already existed in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) of the Advance turn, counts down:

```text
Turns until expiration after = Turns until expiration before − 1
```

When the result is 0, the Mission site becomes Expired and its [Consequences](#consequences) apply.

E.g., a Mission site created in the Advance turn that ends Turn 4, with an `expires_in_turns` of 3, has Turns until expiration 3 during Turn 5, can be deployed to in each of Turns 5, 6, and 7, and is Expired in the Advance turn that ends Turn 7 when no team was deployed to it.

# Consequences

What a final state changes depends on the kind of the Mission site: an Initiative Mission site only rewards a win, while a Response Mission site rewards a win and punishes a loss and neglect alike.

"The operation level" in the table is the FactionOperationLevel in the Response Mission site's origin.

| Final state | Initiative | Response |
| --- | --- | --- |
| Mission Won | The Effect list `on_win` of its MissionSiteArchetype is applied. | The Effect list `on_win` of the operation level is applied. |
| Mission Lost | Nothing. | The Effect list `on_ignored_or_lost` of the operation level is applied. |
| Mission site Expired | Nothing. | As Lost: the Effect list `on_ignored_or_lost` of the operation level is applied. |
| Mission site Cancelled | Nothing. | Nothing. |

Each Effect list is [applied](../foundation/effect-lists.md#applying-an-effect-list) once, when the transition happens. Its Effects are of the Effect kinds [`money` and `funding`](economy-and-upgrades.md#money-and-funding-effect-kinds), [`panic`](panic-and-endings.md#panic-effect-kind), [`eliminate_faction`](factions.md#elimination), and [`defeat`](panic-and-endings.md#defeat-effect-kind), and the Mission site's target Faction is supplied to an `eliminate_faction` Effect.

The Consequences apply in full whether or not the target Faction is Eliminated by then, e.g. a Won Response Mission still brings its money when another Mission resolved in the same step eliminated its Faction.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, of Mission sites and Missions:

- **Mission sites created, Expired, and Cancelled:** three lists of the Mission sites that were created, that became Expired, and that became Cancelled in it, each by Instance ID.
- **Each Mission resolved:** in the order of the [Combat reports](domain-model.md#combat), the Mission and its Mission site by Instance ID, whether it is Won or Lost, the Agents of its Team sent that were Killed, the survivors sent to Recovery, the survivors sent to Standby, and the Consequences that applied: the money, the funding change, the Panic increase, the Panic reduction, the Faction made Eliminated, and the Defeat, if any. For each survivor it also holds its [survival experience](agents-spec.md#growth), its [Mission experience](agents-spec.md#growth), and its base skill and Experience after them.
- **Each Mission site Expired:** the Consequences that applied, in the same form.

The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds all of these except the values of each survivor's growth; it keeps the Consequences so that a Mission site in a final state can show what it changed for the rest of the Campaign. It also holds the number of Active Mission sites in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the Turn-end state of that Turn, and two Combat ratings of the Turn-end state: that of every Serving Agent taken as one side, and that of every Deployable Agent taken as one side.

# Player-visible information

A player decides where to send a team from what stands at a Mission site and what its outcome would change, so nothing about a Mission site or a Mission is hidden except why one cannot exist.

Every value of a Mission site and of a Mission, and every property of a MissionSiteArchetype and of the MissionArchetype, is [Player-visible information](../foundation/engine-contract.md#api-surfaces) from the moment it exists, whatever the lifecycle state. The one exception is the `can_exist_when` of a MissionSiteArchetype: neither it nor whether it or any part of it holds is Player-visible information.

A MissionSiteArchetype also has a Derived value that is Player-visible information, so that a player or an [Autopilot AI](../foundation/engine-contract.md#principals-and-access) can weigh a Mission site before one exists: the [Combat rating](combat.md#combat-rating) of its Enemies, i.e. the Creation Combat rating that [Mission site creation](#mission-site-creation) gives every Mission site of that MissionSiteArchetype. It is never rated another way, e.g. by summing the Enemies' skill.

# TODOs

- TODO (later): Partial success among the [Consequences](#consequences), so that attempting and failing a Mission differs materially from ignoring its Mission site, as [F. Mission commitment: force concentration, casualties, and partial success](../../../game-design-brief.md#f-mission-commitment-force-concentration-casualties-and-partial-success) in the game design brief requires.
- TODO (later): Faction suppression as one of the [Consequences](#consequences) of a Mission or a Mission site.
- TODO (later): A second attempt at a Mission site, as a transition of the [Mission site lifecycle](#mission-site-lifecycle).
