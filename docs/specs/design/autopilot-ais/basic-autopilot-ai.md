# Basic Autopilot AI

| Metadata | Value |
| --- | --- |
| Spec ID | BASICAI |
| Family | Autopilot AIs |
| Audience | AI designer, Implementer |
| Owns | How the Basic Autopilot AI divides the roster among the Agent reserve, Investigations, and Contracting, how it deploys and musters teams, which Leads it investigates, what it buys and in which order, and the Tuning parameters it is built with. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Basic Autopilot AI is the [Autopilot AI](../foundation/engine-contract.md#principals-and-access) that a [Game build](../foundation/core-concepts.md#game-build-and-content) offers so that a [Campaign](../foundation/core-concepts.md#campaign-and-session) can be played without a human making every decision. It plays a sound, cautious Campaign rather than an optimal one: it never sends a team that is likely to lose, and it does not try to win quickly.

Its play follows from one idea: the roster is split into three fixed shares. The Agent reserve stays in base, or on its way back to base, ready for any [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions); a small share investigates [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) so that new Mission sites appear; and everyone else earns money on [Contracting](../mechanics/agents-spec.md#assignments), as far as the [Contracting cap](../mechanics/economy-and-upgrades.md#glossary) allows, and trains in the Agent reserve beyond it. Work tires an [Agent](../mechanics/domain-model.md#agency-and-agents) until a [Forced return](../mechanics/agents-spec.md#forced-return) sends it to Standby, so a Contractor or an Investigator rests in the Agent reserve before it goes back. A fixed [Turn routine](#turn-routine) applies the shares: each [Turn](../foundation/engine-contract.md#player-actions-and-turns), the Basic Autopilot AI deploys first, then restores the shares, then buys, and then ends the Turn. It decides each [Player action](../foundation/engine-contract.md#player-actions-and-turns) from the current [Player-visible information](../foundation/engine-contract.md#api-surfaces) alone and keeps no plan across Turns, within what [Autopilot](../foundation/autopilot.md) lets any Autopilot AI receive.

# Glossary

| Term | Definition |
| --- | --- |
| Basic Autopilot AI | The [Autopilot AI](../foundation/engine-contract.md#principals-and-access) described by this document. |
| Roster size | The number of [Serving](../mechanics/agents-spec.md#agent-statuses) Agents of the [Agency](../mechanics/domain-model.md#agency-and-agents), whatever their [Assignment](../mechanics/domain-model.md#agency-and-agents) and [Agent status](../mechanics/agents-spec.md#agent-statuses). |
| Agent reserve | Every Serving [Agent](../mechanics/domain-model.md#agency-and-agents) whose Assignment is [Standby](../mechanics/agents-spec.md#assignments), [Training](../mechanics/agents-spec.md#assignments), [Recovery](../mechanics/agents-spec.md#assignments), or [Deployed](../mechanics/agents-spec.md#assignments), whether it is [In transit](../mechanics/agents-spec.md#agent-statuses) or not: the Agents in base, deployed, or travelling between them, including a hired Agent on its way to Standby. |
| Investigators | Every Serving Agent whose Assignment is an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), whether it is [In transit](../mechanics/domain-model.md#agency-and-agents) or not. |
| Contractors | Every Serving Agent whose Assignment is [Contracting](../mechanics/agents-spec.md#assignments), whether it is In transit or not. |
| Reserve quota | The size the Basic Autopilot AI keeps the Agent reserve at: the Reserve share of the Roster size, rounded down. |
| Investigator quota | The number of Investigators the Basic Autopilot AI aims for: the Investigator share of the Roster size, rounded down, but at least 1 while the Roster size is at least 1, so that a small roster still investigates the [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that unlocks Contracting. |
| Spare Agent | An Agent of the Agent reserve that is [Fit to start work](../mechanics/agents-spec.md#assignments), [At assignment](../mechanics/domain-model.md#agency-and-agents) on Standby or Training, and not a member of the Muster, while the Agent reserve is larger than the Reserve quota. Only as many Agents are Spare Agents as the Agent reserve exceeds the Reserve quota, [chosen by preference](#choosing-agents). |
| Projected Agent | An Agent of the Agent reserve as it would be after the Recovery lookahead, i.e. after that many Advance turns of [Agent Recovery](../mechanics/agent-recovery.md) at the Agency's current rates, recovering only in the Advance turns in which [it would recover](../mechanics/agent-recovery.md#which-agents-recover). Its [effective skill](../mechanics/agents-spec.md#combatant-attributes) and whether it would be a [Deployable Agent](../mechanics/missions.md#glossary) are read from those projected values. |
| Required rating share | The least share of the [Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat) of a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s Enemies that a team's Combat rating must reach for the Basic Autopilot AI to deploy it there: the [Combat](../mechanics/domain-model.md#combat) margin plus the Loss margin step times the number of Lost Missions at Mission sites of the same [MissionSiteArchetype](../mechanics/missions.md#missionsitearchetype). E.g., with the Game designer values, 110% before any such Lost Mission and 120% after two. |
| Winning team | A set of Agents whose [Combat rating](../mechanics/combat.md#combat-rating) is at least the Required rating share of the Combat rating of a Mission site's Enemies, whose number is at least the number of those Enemies divided by Enemies per Agent, rounded up, and that the [Transport cap](../mechanics/economy-and-upgrades.md#glossary) [allows to deploy](../mechanics/missions.md#deploying-agents). The team's Combat rating weighs each Agent's effective skill by its [rating factor](../mechanics/combat.md#combatant-condition-in-a-combat), which counts what the Agency's [Weapon damage Upgrades](../mechanics/economy-and-upgrades.md#glossary), [Max health Upgrades](../mechanics/economy-and-upgrades.md#glossary), and [Armor Upgrades](../mechanics/economy-and-upgrades.md#glossary) add, never its [base Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat). |
| Muster | The team that the Basic Autopilot AI [gathers](#deploying-and-mustering) for an [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that Deployable Agents alone cannot win yet, from Projected Agents and Contractors. |
| Musterable Agents | The Agents a Muster may draw on: every Agent of the Agent reserve as a Projected Agent, and every Contractor At assignment as it is now, because a recall brings it to Standby, At assignment, after one Advance turn of transit in which it neither works nor rests. No Investigator is ever a Musterable Agent. |
| Tuning parameter | One of [the values that the Basic Autopilot AI is built with](#tuning-parameters), e.g. the Reserve share. |
| Other Upgrade | An [Upgrade](../mechanics/domain-model.md#agency-and-agents) other than a [Cap Upgrade](../mechanics/economy-and-upgrades.md#glossary), i.e. one that raises neither the [Agent cap](../mechanics/domain-model.md#agency-and-agents), the Transport cap, nor the [Training cap](../mechanics/economy-and-upgrades.md#glossary). |
| Upgrade budget | The money the Basic Autopilot AI may have spent on Other Upgrades: the `price` of the Agent cap Upgrade times the number of Agent cap Upgrades the Agency has acquired. |
| Savings floor | The money the Basic Autopilot AI keeps unspent: the Savings floor Tuning parameter times the [projected upkeep](../mechanics/economy-and-upgrades.md#projected-income-and-upkeep) the Agency would have after the purchase. |

# Agent groups

Every Serving Agent belongs to exactly one of the Agent reserve, the Investigators, and the Contractors, by its Assignment; an Agent In transit belongs to the group of the Assignment it travels to. Every Serving Agent beyond the Reserve quota and the Investigator quota is a Contractor, up to the [Contracting cap](../mechanics/economy-and-upgrades.md#glossary); an Agent beyond that cap stays in the Agent reserve, which is then larger than the Reserve quota.

The Agent reserve counts every Agent in it toward the Reserve quota, whether Fit to start work or not: Agents resting on Standby, Agents on Recovery, and Deployed Agents all fill it. Every Agent of the Agent reserve that is Fit to start work and not Deployed is on Training while the Training cap allows.

E.g., with the Game designer values, a Roster size of 100, and a Contracting cap of at least 60, the Reserve quota is 35 and the Investigator quota 5, so 60 Agents are Contractors. When 11 of the Agents are on Recovery, 5 rest on Standby with some exhaustion, and 6 are Deployed, the Agent reserve of 35 holds those 22 and 13 Agents on Training.

The Basic Autopilot AI moves an Agent from one group to another only as follows:

1. **Into the Agent reserve:** it recalls a Contractor to Standby, for a Muster or when the Agent reserve is below the Reserve quota.
2. **Out of the Agent reserve:** it assigns a Spare Agent to an Investigation or to Contracting.
3. **Never out of an Investigation:** it never assigns an Investigator elsewhere, so no Investigation it runs [loses progress](../mechanics/investigations.md#progress-loss) by its choice.

# Turn routine

During each [Turn](../foundation/engine-contract.md#player-actions-and-turns) the Basic Autopilot AI makes its [Player actions](../foundation/engine-contract.md#player-actions-and-turns) in the following order, and then ends the Turn by [requesting Advance turn](../foundation/autopilot.md#autopilot-limits). When no step has a Player action left to make, e.g. when Autopilot is engaged again in a Turn it has already played through, its first request is Advance turn. Each step sees the Assignments and the money the earlier steps left.

1. **Deploy and muster:** [deploy Winning teams of Deployable Agents to Mission sites and form at most one Muster](#deploying-and-mustering).
2. **Refill the Agent reserve:** while the Agent reserve is below the Reserve quota, recall [the preferred Contractor](#choosing-agents) At assignment to Standby, one at a time.
3. **Investigate:** while the Investigators are fewer than the Investigator quota and a Spare Agent remains, assign a Spare Agent to an Investigation of [a Lead worth investigating](#choosing-leads), adding it to an Active Investigation before starting an Investigation of another [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), so that effort is concentrated on few Leads rather than spread thin.
4. **Contract and train:** assign remaining Spare Agents to Contracting while the Contracting cap has a place left. Then assign every Agent of the Agent reserve that is Fit to start work and At assignment on Standby to Training while the Training cap has a place left.
5. **Buy and equip:** make every [purchase that is due](#purchases), then [equip the Agents](#equipping).

Deploying comes first because a Mission site expires, while every share can be restored on a later Turn. Refilling the Agent reserve comes before Investigations and Contracting, so that the next Mission site finds a team. Investigations come before Contracting because they are the smaller share and the one that brings new Mission sites.

When a Player action the Basic Autopilot AI attempts is rejected, it does not retry the same Player action in that Turn and continues with the next step, so a rejection cannot make it repeat itself until it fails.

## Deploying and mustering

Step 1 considers every Active Mission site to which no team is deployed, in order of urgency: a [Response Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) before an Initiative Mission site, because a Response Mission site that is not Won is penalized, while an Initiative Mission site only has to be found again; and among Mission sites of the same kind, the one that expires soonest first.

1. **Deploy now:** when a Winning team of Deployable Agents can be formed for the Mission site from their current values, the Basic Autopilot AI deploys it, with [the members it prefers](#choosing-agents). A team may draw on any Agent of the Agent reserve that is a Deployable Agent, including Agents on Training and Agents still resting. Otherwise it deploys nobody to that Mission site rather than send a team that is likely to lose. The Required rating share rises with each Lost [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) so that a kind of Mission site the Combat rating underrates is attempted only with ever stronger teams.
2. **Muster:** for the most urgent Initiative Mission site to which no team can be deployed now, the Basic Autopilot AI forms a Muster when a Winning team of Musterable Agents can be formed whose last member becomes a Deployable Agent within the Recovery lookahead and in fewer Advance turns than the Mission site's Turns until expiration. It forms the team from the Deployable Agents first, then from the Agents of the Agent reserve that become Deployable Agents soonest, and only then from Contractors, so that it recalls as few Contractors as it can. A Response Mission site is never mustered for.
3. **Recall at the last moment:** the Basic Autopilot AI recalls the Contractors of the Muster to Standby only when every other member of the Muster is a Deployable Agent now or becomes one within one Advance turn, so that the recalled Agents arrive when the team is ready and earn until then. Otherwise it recalls nobody for the Muster this Turn, and judges again on the next one.

An Agent of the Muster keeps the Assignment it has: no later step gives it another one, e.g. a member on Training stays there. Step 1 forms the Muster anew in every Turn.

## Choosing Leads

The Basic Autopilot AI investigates only the Leads whose completion can advance progression, and the most decisive of them first.

A Lead that creates no Mission site advances progression, or unlocks Contracting, by its completion alone, so it is always worth investigating. A Lead that creates a Mission site advances progression only when the Mission at that Mission site is Won, so it is investigated only when a Winning team of Musterable Agents could be formed for that Mission site at the moment its Investigation would start, with the whole Transport cap and no regard to timing; and, once a Mission from the Lead is Won, only when no other Lead qualifies. The Basic Autopilot AI judges this when it starts the Investigation and does not judge it again while the Investigation is Active.

Among the Leads worth investigating, one whose completion wins the [Campaign](../foundation/core-concepts.md#campaign-and-session) comes first, then one whose completion unlocks Contracting, because every later Turn of Contracting income depends on it, then one whose completion makes a [Faction](../mechanics/domain-model.md#factions) [Eliminated](../mechanics/factions.md#glossary), then the one furthest along its Faction's chain, i.e. the one with the highest [Initiative operation level](../mechanics/leads-and-progression.md#initiative-operation-level). A Lead with no [Initiative operation level](../mechanics/leads-and-progression.md#glossary) comes after every Lead with one.

## Choosing Agents

When a step chooses among Agents, the Basic Autopilot AI prefers:

| Choice | Preferred Agent |
| --- | --- |
| A member of a Winning team or a Muster | The Agent with the lowest [exhaustion](../mechanics/agents-spec.md#combatant-attributes) first, and among Agents of equal exhaustion the one with the highest effective skill, so that rested Agents go first. For a Muster, exhaustion and effective skill are those of the Projected Agent, and of a Contractor its own. |
| A Contractor to recall in step 2 | The Contractor with the highest effective skill, because the Agent reserve exists to win Missions. |
| A Spare Agent | The Agent with the lowest effective skill, so that the strongest Agents stay in the Agent reserve. |
| An Agent to put on Training in step 4 | The Agent with the lowest [base skill](../mechanics/agents-spec.md#combatant-attributes). |

When several choices are equally good, it breaks the tie in a fixed order derived from [Player-visible information](../foundation/engine-contract.md#api-surfaces), so that the same Player-visible information always yields the same Player actions.

# Purchases

The Basic Autopilot AI spends money in a fixed cycle: it fills the Agent cap, raises it, spends up to the price of that raise on Other Upgrades, and brings the Transport cap and the Training cap up to their share of the new Agent cap. Each purchase in step 5 is the first one that is due in the following list, read again after every purchase:

1. **Ammo:** for each [AmmoType](../mechanics/combat.md#ammotype) that the Weapon of a Serving Agent uses and that holds fewer rounds in [Storage](../mechanics/equipment.md#glossary) than twice what [Ammo short](../mechanics/equipment.md#ammo-short) asks for, buy the rounds that bring it to twice that, all in one `buyItems`.
2. **Other Upgrades:** while the money spent on Other Upgrades, i.e. the sum over the Other Upgrades of each one's `price` times its acquisitions, is below the Upgrade budget, buy the Other Upgrade chosen by the rotation among those whose `price` still fits within the Upgrade budget. The rotation buys the one with the fewest acquisitions per unit of its [Upgrade weight](#tuning-parameters), counting the acquisition it would make, and never one of weight 0.
3. **Supporting caps:** while the Transport cap is below the Cap share of the Agent cap, buy a Transport cap Upgrade; then, while the Training cap is below the Cap share of the Agent cap, buy a Training cap Upgrade.
4. **Hire:** while the Roster size is below the Agent cap, hire Agents, all in one `hireAgents`: as many as both fit below the Agent cap and keep money at or above the Savings floor, which counts the upkeep of every Agent it hires.
5. **Agent cap:** when the Roster size has reached the Agent cap, buy an Agent cap Upgrade.

A purchase is made only when money stays at or above the Savings floor after it, and a hire only when at least one Agent fits; when the first purchase due does not fit, the Basic Autopilot AI buys nothing more that Turn, rather than a later item of the list.

E.g., with a Cap share of 25%, an Agency starts with an Agent cap of 12, a Transport cap of 3, and a Training cap of 6, both at least 25% of 12, and an Upgrade budget of 0. The Basic Autopilot AI therefore hires up to 12 Agents first, then buys an Agent cap Upgrade, here to 24 at a `price` of 900, then up to 900 of Other Upgrades, then a Transport cap Upgrade, because the Transport cap of 3 is below 25% of 24, i.e. 6, and no Training cap Upgrade, because the Training cap of 6 already reaches it, and then hires toward 24.

## Equipping

The Basic Autopilot AI puts the best gear on the strongest Agents and never sells an [Item](../mechanics/equipment.md#glossary). For Weapons and then for Armors, it takes every Item of that kind that a Serving Agent wears or Storage holds, from the highest `base_weapon_damage` or `base_armor` down, and gives them out in that order to the Serving Agents from the highest effective skill down, among equal effective skill the lower [Instance ID](../foundation/campaign-instances.md#glossary) first, with one [`equipAgent`](../mechanics/equipment.md#equipping-agents) for each Agent whose share differs from what it wears. Agents beyond the Items keep the [Fallback Weapon](../mechanics/combat.md#ammo) or the [Fallback Armor](../mechanics/equipment.md#glossary).

# Information

The Basic Autopilot AI decides each Player action from the current Player-visible information alone, within [what an Autopilot AI receives](../foundation/autopilot.md#what-an-autopilot-ai-receives), and keeps no plan across Turns. It counts the Lost Missions of the Required rating share from the Missions the Campaign keeps, so it counts every Lost Mission alike, whoever deployed its team.

# Tuning parameters

The [Game build](../foundation/core-concepts.md#game-build-and-content) offers the Basic Autopilot AI with one fixed set of Tuning parameters, and a player cannot change them. Developer tooling can build the Basic Autopilot AI with other values, e.g. to compare several sets of values over whole Campaigns, and the Game build never offers such a build.

| Tuning parameter | What it sets |
| --- | --- |
| Reserve share | The Reserve quota, as a share of the Roster size. |
| Investigator share | The Investigator quota, as a share of the Roster size. |
| Cap share | The least Transport cap and Training cap that the Basic Autopilot AI keeps, each as a share of the Agent cap. |
| Savings floor | The Savings floor, as a number of Turns of projected upkeep. |
| Combat margin | The Required rating share while no Mission at a Mission site of the same MissionSiteArchetype is Lost. |
| Loss margin step | What each such Lost Mission adds to the Required rating share. |
| Enemies per Agent | How many Enemies one Agent of a Winning team answers for; it may be fractional. |
| Recovery lookahead | The number of Advance turns over which a Projected Agent is projected. |
| Upgrade weights | A non-negative weight of each Other Upgrade in the rotation of [Purchases](#purchases). E.g., an Upgrade of weight 2 is bought about twice as often as one of weight 1. |

## Game designer values

The Game designer sets the following values of the Game build.

| Tuning parameter | Value in the Game build |
| --- | --- |
| Reserve share | 35% of the Roster size. |
| Investigator share | 5% of the Roster size. |
| Cap share | 25% of the Agent cap, for each of the Transport cap and the Training cap, because at least a tenth of the roster is expected to be on Recovery or resting rather than on Training or Deployed. |
| Savings floor | 5 Turns of projected upkeep. |
| Combat margin | 110%. |
| Loss margin step | 5 percentage points. |
| Enemies per Agent | 2.5, e.g. a team of at least 4 Agents for 10 Enemies. |
| Recovery lookahead | 2 Advance turns. |
| Upgrade weights | 2 for `training_skill_gain`, `exhaustion_recovery`, and `health_recovery`. |
