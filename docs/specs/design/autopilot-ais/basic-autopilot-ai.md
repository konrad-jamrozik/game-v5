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
| Spare Agent | An Agent of the Agent reserve that is [Fit to start work](../mechanics/agents-spec.md#assignments), [At assignment](../mechanics/domain-model.md#agency-and-agents) on Standby or Training, and not a member of the Muster, while the Agent reserve is larger than the Reserve quota. Only as many Agents are Spare Agents as the Agent reserve exceeds the Reserve quota, chosen under [Choosing Agents](#choosing-agents). |
| Projected Agent | An Agent of the Agent reserve as it would be after the Recovery lookahead, i.e. after that many Advance turns of [Agent Recovery](../mechanics/agent-recovery.md) at the Agency's current rates, recovering only in the Advance turns in which it would recover under [Which Agents recover](../mechanics/agent-recovery.md#which-agents-recover). Its [effective skill](../mechanics/agents-spec.md#combatant-attributes) and whether it would be a [Deployable Agent](../mechanics/missions.md#glossary) are read from those projected values. |
| Required rating share | The least share of the [Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat) of a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s Enemies that a team's Combat rating must reach for the Basic Autopilot AI to deploy it there: the [Combat](../mechanics/domain-model.md#combat) margin plus the Loss margin step times the number of Lost Missions at Mission sites of the same [MissionSiteArchetype](../mechanics/missions.md#missionsitearchetype). E.g., with the Game designer values, 110% before any such Lost Mission and 120% after two. |
| Winning team | A set of Agents whose [Combat rating](../mechanics/combat.md#combat-rating) is at least the Required rating share of the Combat rating of a Mission site's Enemies, whose number is at least the number of those Enemies divided by Enemies per Agent, rounded up, and that the [Transport cap](../mechanics/economy-and-upgrades.md#glossary) allows to deploy, under [Deploying Agents](../mechanics/missions.md#deploying-agents) in Missions. The team's Combat rating weighs each Agent's effective skill by its [rating factor](../mechanics/combat.md#combatant-condition-in-a-combat), which counts what the Agency's [Weapon damage Upgrades](../mechanics/economy-and-upgrades.md#glossary), [Max health Upgrades](../mechanics/economy-and-upgrades.md#glossary), and [Armor Upgrades](../mechanics/economy-and-upgrades.md#glossary) add, never its [base Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat). |
| Muster | The team that the Basic Autopilot AI gathers for an [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that Deployable Agents alone cannot win yet, from Projected Agents and Contractors, under [Deploying and mustering](#deploying-and-mustering). |
| Musterable Agents | The Agents a Muster may draw on: every Agent of the Agent reserve as a Projected Agent, and every Contractor At assignment as it is now, because a recall brings it to Standby, At assignment, after one Advance turn of transit in which it neither works nor rests. No Investigator is ever a Musterable Agent. |
| Tuning parameter | One of the values that the Basic Autopilot AI is built with, e.g. the Reserve share, under [Tuning parameters](#tuning-parameters). |
| Other Upgrade | An [Upgrade](../mechanics/domain-model.md#agency-and-agents) other than a [Cap Upgrade](../mechanics/economy-and-upgrades.md#glossary), i.e. one that raises neither the [Agent cap](../mechanics/domain-model.md#agency-and-agents), the Transport cap, nor the [Training cap](../mechanics/economy-and-upgrades.md#glossary). |
| Upgrade budget | The money the Basic Autopilot AI may have spent on Other Upgrades: the `price` of the Agent cap Upgrade times the number of Agent cap Upgrades the Agency has acquired. |
| Savings floor | The money the Basic Autopilot AI keeps unspent: the Savings floor Tuning parameter times the projected upkeep the Agency would have after the purchase, under [Projected income and upkeep](../mechanics/economy-and-upgrades.md#projected-income-and-upkeep) in Economy and Upgrades. |

# Agent groups

Every Serving Agent belongs to exactly one of the Agent reserve, the Investigators, and the Contractors, by its Assignment; an Agent In transit belongs to the group of the Assignment it travels to. The Basic Autopilot AI aims for:

| Group | Target |
| --- | --- |
| Agent reserve | The Reserve quota. It counts every Agent in it, whether Fit to start work or not: Agents resting on Standby, Agents on Recovery, and Deployed Agents all fill it. Every Agent of the Agent reserve that is Fit to start work and not Deployed is on Training while the Training cap allows. |
| Investigators | The Investigator quota. |
| Contractors | Every other Serving Agent, up to the [Contracting cap](../mechanics/economy-and-upgrades.md#glossary). Every Agent beyond it stays in the Agent reserve, which is then larger than the Reserve quota. |

E.g., with the Game designer values, a Roster size of 100, and a Contracting cap of at least 60, the Reserve quota is 35 and the Investigator quota 5, so 60 Agents are Contractors. When 11 of the Agents are on Recovery, 5 rest on Standby with some exhaustion, and 6 are Deployed, the Agent reserve of 35 holds those 22 and 13 Agents on Training. With the initial roster of 8 Agents, the Reserve quota is 2 and the Investigator quota 1, and the Contracting cap is 0, so 1 Agent investigates, under [Choosing Leads](#choosing-leads), and 7 stay in the Agent reserve, on Training while the Training cap allows; once the Lead that unlocks Contracting is completed, 4 of them go to Contracting.

The Basic Autopilot AI moves an Agent from one group to another only as follows, and this list is exhaustive:

1. **Into the Agent reserve:** it recalls a Contractor to Standby, for a Muster or when the Agent reserve is below the Reserve quota. Hiring, a completed Investigation, a [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s survivors, and a Contractor's [Forced return](../mechanics/agents-spec.md#assignments) add to the Agent reserve without any choice of the Basic Autopilot AI.
2. **Out of the Agent reserve:** it assigns a Spare Agent to an Investigation or to Contracting.
3. **Never out of an Investigation:** it never assigns an Investigator elsewhere, so no Investigation it runs loses progress by its choice, under [Progress loss](../mechanics/investigations.md#progress-loss) in Investigations. Investigators return to the Agent reserve when their Investigation completes or is interrupted, or when their own work tires them into a Forced return.

Every move to or from Contracting and Investigations costs one Advance turn of transit, under [Transit rule](../mechanics/agents-spec.md#transit-rule) in Agents, and an Agent In transit cannot take orders, so the Basic Autopilot AI counts an Agent In transit as already in the group it travels to, and waits for it to arrive before giving it another order.

# Turn routine

During each [Turn](../foundation/engine-contract.md#player-actions-and-turns) the Basic Autopilot AI makes its [Player actions](../foundation/engine-contract.md#player-actions-and-turns) in the following order, and then ends the Turn by requesting Advance turn, under [Autopilot limits](../foundation/autopilot.md#autopilot-limits) in [Autopilot](../foundation/engine-contract.md#autopilot). When no step has a Player action left to make, e.g. when Autopilot is engaged again in a Turn it has already played through, its first request is Advance turn. Each step sees the Assignments and the money the earlier steps left.

1. **Deploy and muster:** deploy Winning teams of Deployable Agents to Mission sites and form at most one Muster, under [Deploying and mustering](#deploying-and-mustering).
2. **Refill the Agent reserve:** while the Agent reserve is below the Reserve quota, recall a Contractor At assignment to Standby, one at a time, chosen under [Choosing Agents](#choosing-agents).
3. **Investigate:** while the Investigators are fewer than the Investigator quota and a Spare Agent remains, assign a Spare Agent to an Investigation, adding it to an Active Investigation before starting an Investigation of another [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), under [Choosing Leads](#choosing-leads).
4. **Contract and train:** assign remaining Spare Agents to Contracting while the Contracting cap has a place left, all in one `assignAgents`. Then assign every Agent of the Agent reserve that is Fit to start work and At assignment on Standby to Training while the Training cap has a place left.
5. **Buy:** make the purchases of [Purchases](#purchases), one at a time, hiring all the Agents due at once, until none is due or the next one due would bring money below the Savings floor.

Deploying comes first because a Mission site expires, while every share can be restored on a later Turn. Refilling the Agent reserve comes before Investigations and Contracting, so that the next Mission site finds a team. Investigations come before Contracting because they are the smaller share and the one that brings new Mission sites.

## Deploying and mustering

Step 1 considers every Active Mission site to which no team is deployed, in order of urgency: a [Response Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) before an Initiative Mission site, because a Response Mission site whose Mission is not Won is penalized, while an Initiative Mission site whose Mission is not Won only has to be found again; and among Mission sites of the same kind, the one that expires soonest first.

1. **Deploy now:** when a Winning team of Deployable Agents can be formed for the Mission site from their current values, the Basic Autopilot AI deploys it, under [Choosing Agents](#choosing-agents). A team may draw on any Agent of the Agent reserve that is a Deployable Agent, including Agents on Training and Agents still resting. Otherwise it deploys nobody to that Mission site rather than send a team that is likely to lose: a Mission site cannot be attempted twice, and a Lost Mission site gains nothing over an Expired one. Each Lost Mission raises the Required rating share for every later Mission site of the same MissionSiteArchetype, so that a kind of Mission site the Combat rating underrates is attempted only with ever stronger teams.
2. **Muster:** for the most urgent Initiative Mission site to which no team can be deployed now, the Basic Autopilot AI forms a Muster when a Winning team of Musterable Agents can be formed whose last member becomes a Deployable Agent within the Recovery lookahead and in fewer Advance turns than the Mission site's Turns until expiration. It forms the team from the Deployable Agents first, then from the Agents of the Agent reserve that become Deployable Agents soonest, and only then from Contractors, so that it recalls as few Contractors as it can. A Response Mission site is never mustered for.
3. **Recall at the last moment:** the Basic Autopilot AI recalls the Contractors of the Muster to Standby only when every other member of the Muster is a Deployable Agent now or becomes one within one Advance turn, so that the recalled Agents arrive when the team is ready and earn until then. Otherwise it recalls nobody for the Muster this Turn, and judges again on the next one.

An Agent of the Muster keeps the Assignment it has: no later step gives it another one, e.g. a member on Training stays there, because an Agent on Training can be deployed. Every step reads the Muster as step 1 forms it from the current [Player-visible information](../foundation/engine-contract.md#api-surfaces), so in a later Turn the recalled Agents are Deployable Agents on Standby and step 1 deploys the team as soon as it is a Winning team of Deployable Agents.

## Choosing Leads

A small share of the roster, the Investigators, investigates Leads. A Lead that creates no Mission site advances progression, or unlocks Contracting, by its completion alone, so it is always worth investigating. A Lead that creates a Mission site advances progression only when the Mission at that Mission site is Won, so it is investigated only when a Winning team of Musterable Agents could be formed for that Mission site at the moment its Investigation would start, with the whole Transport cap and no regard to timing; and, once a Mission from the Lead is Won, only when no other Lead qualifies. The Basic Autopilot AI judges this when it starts the Investigation and does not judge it again while the Investigation is Active.

Among the Leads worth investigating, one whose completion wins the [Campaign](../foundation/core-concepts.md#campaign-and-session) comes first, then one whose completion unlocks Contracting, because every later Turn of Contracting income depends on it, then one whose completion makes a [Faction](../mechanics/domain-model.md#factions) [Eliminated](../mechanics/factions.md#glossary), then the one furthest along its Faction's chain, i.e. the one with the highest [Initiative operation level](../mechanics/leads-and-progression.md#initiative-operation-level), under [Information](#information); a Lead of no Faction has no chain, and a Lead with no [Initiative operation level](../mechanics/leads-and-progression.md#glossary) comes after every Lead with one. Effort is concentrated on few Leads rather than spread thin: step 3 adds an Agent to an Active Investigation before it starts another one.

## Choosing Agents

When a step chooses among Agents, the Basic Autopilot AI prefers:

| Choice | Preferred Agent |
| --- | --- |
| A member of a Winning team or a Muster | The Agent with the lowest [exhaustion](../mechanics/agents-spec.md#combatant-attributes) first, and among Agents of equal exhaustion the one with the highest effective skill, so that rested Agents go first: an Agent of the Agent reserve on Standby is there either because it is still resting or because the Training cap is full. For a Muster, exhaustion and effective skill are those of the Projected Agent, and of a Contractor its own. |
| A Contractor to recall in step 2 | The Contractor with the highest effective skill, because the Agent reserve exists to win Missions. |
| A Spare Agent | The Agent with the lowest effective skill, so that the strongest Agents stay in the Agent reserve. |
| An Agent to put on Training in step 4 | The Agent with the lowest [base skill](../mechanics/agents-spec.md#combatant-attributes). |

When several choices are equally good, it breaks the tie in a fixed order derived from [Player-visible information](../foundation/engine-contract.md#api-surfaces), so that the same Player-visible information always yields the same Player actions.

# Purchases

The Basic Autopilot AI spends money in a fixed cycle: it fills the Agent cap, raises it, spends up to the price of that raise on Other Upgrades, and brings the Transport cap and the Training cap up to their share of the new Agent cap. Each purchase in step 5 is the first one that is due in the following list, read again after every purchase:

1. **Other Upgrades:** while the money spent on Other Upgrades, i.e. the sum over the Other Upgrades of each one's `price` times its acquisitions, is below the Upgrade budget, buy the Other Upgrade chosen by the rotation among those whose `price` still fits within the Upgrade budget. The rotation buys the one with the fewest acquisitions per unit of its weight, counting the acquisition it would make, and never one of weight 0, under Upgrade weights in [Tuning parameters](#tuning-parameters). E.g., with the Game designer values and 1000 of the Upgrade budget left, the rotation chooses between `armor`, `training_skill_gain`, `exhaustion_recovery`, and `health_recovery`, and never `weapon_damage` at 2000.
2. **Supporting caps:** while the Transport cap is below the Cap share of the Agent cap, buy a Transport cap Upgrade; then, while the Training cap is below the Cap share of the Agent cap, buy a Training cap Upgrade.
3. **Hire:** while the Roster size is below the Agent cap, hire Agents, all in one `hireAgents`: as many as both fit below the Agent cap and keep money at or above the Savings floor, which counts the upkeep of every Agent it hires, under [Hiring Agents](../mechanics/economy-and-upgrades.md#hiring-agents) in Economy and Upgrades. It hires as many Agents as hiring one at a time, each judged against the Savings floor, would hire within this step, in one Player action instead of one each. The earlier steps of Turn routine therefore see the new Agents only once all of them are hired, e.g. a Reserve quota or an Investigator quota that the larger Roster size raises, rather than after each hire.
4. **Agent cap:** when the Roster size has reached the Agent cap, buy an Agent cap Upgrade.

A purchase is made only when money stays at or above the Savings floor after it, and a hire only when at least one Agent fits; when the first purchase due does not fit, the Basic Autopilot AI buys nothing more that Turn, rather than a later item of the list. Every value the list reads, e.g. the acquisitions of each Upgrade and each cap, is Player-visible, so the cycle needs no plan across Turns.

E.g., with the GDR values, a new Campaign starts with an Agent cap of 20, a Transport cap of 8, and a Training cap of 10, both at least 25% of 20, and an Upgrade budget of 0. The Basic Autopilot AI therefore hires up to 20 Agents first, then buys an Agent cap Upgrade to 40, then up to 2000 of Other Upgrades, then a Transport cap Upgrade to 16, because the Transport cap of 8 is below 25% of 40, i.e. 10, and no Training cap Upgrade, because the Training cap of 10 already reaches it, and then hires toward 40.

# Information

The Basic Autopilot AI decides each Player action from the current Player-visible information alone, which [What an Autopilot AI receives](../foundation/autopilot.md#what-an-autopilot-ai-receives) in [Autopilot](../foundation/engine-contract.md#autopilot) bounds. It keeps no plan across Turns: every fact it needs, e.g. how many Upgrades of each kind the Agency has acquired, which Agents are In transit, or how many Missions at Mission sites of one MissionSiteArchetype are Lost, is Player-visible. It counts those Lost Missions from the Missions the Campaign keeps, with each Mission site's MissionSiteArchetype, under [Player-visible information](../mechanics/missions.md#player-visible-information) in Missions, so it counts every Lost Mission alike, whoever deployed its team. Because it does not receive its [Autopilot limit](../foundation/autopilot.md#glossary), it plays every Turn the same way whether Autopilot disengages after one Player action or after many Turns.

It reads the [Current world state](../foundation/engine-contract.md#player-actions-and-turns) with `getCurrentLiveWorldState()` and `getCurrentRetiredWorldState()` once at the start of each step of [Turn routine](#turn-routine), and within the step keeps what they returned current by applying the changes each of its Player actions returns, under [Action results](../foundation/player-api.md#action-results) in [Player API](../foundation/engine-contract.md#api-surfaces), rather than querying again after every Player action. Applying those changes leaves exactly what the queries would return, so every Player action it makes is the one it would make by querying again, and the cost of a step grows with what its Player actions change rather than with the size of the Campaign. A rejected Player action changes nothing, so it leaves what the Basic Autopilot AI holds as it was.

To project an Agent of the Agent reserve over the Recovery lookahead, it reads the Agent's [Exact exhaustion](../mechanics/agents-spec.md#combatant-attributes) and [health lost](../mechanics/agents-spec.md#combatant-attributes) and the Agency's [exhaustion](../mechanics/agents-spec.md#combatant-attributes) and health recovery rates, all Player-visible under [Player-visible information](../mechanics/agent-recovery.md#player-visible-information) in Agent Recovery.

To judge whether it could win the Mission site a Lead creates, it reads the MissionSiteArchetype the Lead creates and the EnemyArchetypes that MissionSiteArchetype names. Both are Player-visible from the Lead's discovery, before any such Mission site exists, under [Player-visible information](../mechanics/leads-and-progression.md#player-visible-information) in Leads and Progression and [Player-visible information](../mechanics/combat.md#player-visible-information) in Combat.

What discovers a Lead is not Player-visible, so it does not trace a Faction's chain itself. It reads how far along the chain a discovered Lead is as the Lead's Initiative operation level, which the engine derives and makes Player-visible under [Player-visible information](../mechanics/leads-and-progression.md#player-visible-information) in Leads and Progression. E.g., with the GDRs, `locate_red_dawn_outpost` has level 3 and `interrogate_red_dawn_handler` level 2, so the former comes first when both qualify.

# Tuning parameters

The [Game build](../foundation/core-concepts.md#game-build-and-content) offers the Basic Autopilot AI with one fixed set of Tuning parameters, the Game designer values below, and a player cannot change them. So that the thresholds can be tuned against whole Campaigns, an Implementation builds the Basic Autopilot AI from a given set of Tuning parameters, and lets developer tooling build it with values other than the Game build's, e.g. a tool that plays many Campaigns with each of several sets of values and compares them. How developer tooling reaches that build, e.g. a function of the Implementation's own code, is the Implementer's choice; it is not part of any API of the engine, and a Basic Autopilot AI built with other values is not offered by the Game build.

The following list of Tuning parameters is exhaustive.

| Tuning parameter | What it sets |
| --- | --- |
| Reserve share | The Reserve quota, as a share of the Roster size, rounded down. |
| Investigator share | The Investigator quota, as a share of the Roster size, rounded down. |
| Cap share | The least Transport cap and Training cap that the Basic Autopilot AI keeps, each as a share of the Agent cap. |
| Savings floor | The Savings floor, as a number of Turns of projected upkeep, e.g. 5 Turns of a projected upkeep of 200 is 1000 money. |
| Combat margin | The least share of the Enemies' Combat rating that a Winning team's Combat rating must reach while no Mission at a Mission site of the same MissionSiteArchetype is Lost. |
| Loss margin step | How much each Lost Mission at a Mission site of one MissionSiteArchetype raises the Required rating share of later Mission sites of that MissionSiteArchetype. |
| Enemies per Agent | How many Enemies one Agent of a team answers for, so that a Winning team has at least the number of Enemies divided by it, rounded up; it may be fractional. |
| Recovery lookahead | The number of Advance turns of recovery over which an Agent of the Agent reserve is projected, for a Muster and for choosing Leads. |
| Upgrade weights | A non-negative weight of each Other Upgrade in the rotation of [Purchases](#purchases). E.g., an Upgrade of weight 2 is bought about twice as often as one of weight 1. |

## Game designer values

The Game designer sets the following values of the Game build, so that an Implementation rebuilt from the specifications keeps them.

| Tuning parameter | Value in the Game build |
| --- | --- |
| Reserve share | 35% of the Roster size, rounded down. |
| Investigator share | 5% of the Roster size, rounded down. |
| Cap share | 25% of the Agent cap, for each of the Transport cap and the Training cap, because at least a tenth of the roster is expected to be on Recovery or resting rather than on Training or Deployed. |
| Savings floor | 5 Turns of projected upkeep. |
| Combat margin | 110%: a team qualifies only when its Combat rating is at least 10% above the Enemies'. |
| Loss margin step | 5 percentage points, e.g. 115% after one Lost Mission and 120% after two. |
| Enemies per Agent | 2.5, e.g. a team of at least 4 Agents for 10 Enemies. |
| Recovery lookahead | 2 Advance turns. |
| Upgrade weights | 2 for `armor`, `training_skill_gain`, `exhaustion_recovery`, and `health_recovery`, and 1 for `weapon_damage`. |

# Edge cases and failure behavior

| Case | Behavior |
| --- | --- |
| No Mission site can be won with the Deployable Agents available | It deploys nobody that Turn and forms a Muster for the most urgent Initiative Mission site that one can win in time; the other Agents keep their groups. |
| The Mission site of a Muster becomes winnable with Deployable Agents, stops being Active, or can no longer be reached in time | Nothing more is held for it: step 1 deploys as usual or forms no Muster for it, and a Contractor the Muster recalled stays in the Agent reserve until it is a Spare Agent. |
| A Muster needs Agents that are still resting | It recalls no Contractor until those Agents become Deployable Agents within one Advance turn, so the Contractors keep earning. |
| A Mission site is in the last Turn before it would expire | It deploys to it as to any other Mission site, because the Combat is fought in the next Advance turn. |
| An Investigation completes while no Winning team can be formed any more | It deploys nobody. The Mission site becomes Expired, the Lead becomes available again, and the Lead is investigated again once it qualifies under [Choosing Leads](#choosing-leads). |
| The Agent reserve is above the Reserve quota, e.g. after the survivors of a Mission, the Agents of a Muster, or Contractors with a Forced return come back | The Agents beyond the Reserve quota become Spare Agents once they are Fit to start work, and steps 3 and 4 send them to Investigations and Contracting. |
| The Contracting cap has no place left, e.g. 0 before Contracting is unlocked | Spare Agents that step 3 does not send to an Investigation stay in the Agent reserve, and step 4 puts them on Training while the Training cap allows. |
| The Agent reserve is below the Reserve quota and no Contractor can be recalled, e.g. every Contractor is In transit | It recalls nobody that Turn and recalls again on the next. It never recalls an Investigator. |
| Fewer Investigators than the Investigator quota but no Spare Agent | It starts no Investigation that Turn and never recalls a Contractor for one. |
| Money is below the Savings floor, or the first purchase due does not fit above it | It buys nothing that Turn. |
| Every Agent cannot take orders, or the roster is empty | It makes no assignment and ends the Turn; hiring still follows [Purchases](#purchases). |
| A Player action it attempts is rejected | It does not retry the same Player action in that Turn and continues with the next step, so a rejection cannot make it repeat itself until it fails. |
| Only Leads that create Mission sites it cannot win remain | It leaves those Leads uninvestigated until the Agency is strong enough. |
