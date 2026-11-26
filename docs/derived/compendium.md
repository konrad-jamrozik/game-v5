# Compendium Preview

> **Generated — do not edit.** Run `npm run docs:generate` after changing a file under `content/`.

Every Compendium article of the game data, as the game shows it when every article is Player-visible: each Placeholder is replaced by the value of the GDR property it names, and the first mention of an Article term of another article is an Article link to that article. Each article is edited in its source file. A Subject article is followed here by the properties of its subject as authored; the Data sheet that the game shows in their place is specified in Compendium View.

[Back to the derived specification catalog](README.md)

## Guide articles

### A turn at the Agency

Source: `content/compendium/compendium_articles/guide_agency.yaml`

You run a covert Agency that hunts the [Factions](#factions) threatening the world. Each [turn](#turns) you [hire](#hiring-and-upkeep) and assign [Agents](#agents), follow [Leads](#leads), [deploy](#missions) teams to [Mission sites](#mission-sites), and buy [Upgrades](#upgrades), then advance the turn to see what your orders achieved. [Funding](#money-and-funding) and [Contracting](#contracting) pay for it all, and every Agent you keep costs upkeep.

See also: [Turns](#turns) · [Money and funding](#money-and-funding) · [Winning and losing](#winning-and-losing)

### Buying Upgrades

Source: `content/compendium/compendium_articles/guide_upgrades.yaml`

[Upgrades](#upgrades) are permanent improvements bought with [money](#money-and-funding). Each purchase raises one cap of the Agency or how fast every [Agent](#agents) trains, rests, or heals. An Upgrade can be bought again and again at the same price.

See also: [Upgrades](#upgrades) · [Money and funding](#money-and-funding)

### Fighting Missions

Source: `content/compendium/compendium_articles/guide_missions.yaml`

A [Mission site](#mission-sites) is a place where Enemies wait, and it expires after a few [turns](#turns). [Deploy](#missions) a team to it and the [Combat](#combat) is fought when the turn advances. A won Mission brings its rewards; a lost or ignored one can raise [Panic](#panic). [Tired](#exhaustion) [Agents](#agents) fight worse, so check exhaustion before you deploy, and compare your team's [Combat rating](#combat-rating) with the Enemies'. Agents who survive a Mission gain [skill](#skill), win or lose.

See also: [Mission sites](#mission-sites) · [Missions](#missions) · [Combat](#combat) · [Retreat](#retreat)

### Following Leads

Source: `content/compendium/compendium_articles/guide_investigations.yaml`

Send [Agents](#agents) after a [Lead](#leads) and they form an [Investigation](#investigations), which gains progress each [turn](#turns). Partway through you learn roughly how much progress it needs. A completed Investigation may reveal a [Mission site](#mission-sites) or open the way to further Leads. Taking Agents away loses progress, and taking them all away abandons the Investigation.

See also: [Leads](#leads) · [Investigations](#investigations)

### Keeping Panic down

Source: `content/compendium/compendium_articles/guide_panic.yaml`

[Panic](#panic) measures how frightened the world is. [Faction operations](#faction-operations) left unanswered raise it, and some won [Missions](#missions) bring it down. If Panic reaches its limit, the Campaign is lost, so answer the operations you can win. Terminate every [Faction](#factions) and complete Peace on Earth to win.

See also: [Panic](#panic) · [Faction operations](#faction-operations) · [Winning and losing](#winning-and-losing)

### Putting Agents to work

Source: `content/compendium/compendium_articles/guide_agents.yaml`

Every [Agent](#agents) has one [Assignment](#assignments) at a time. On Standby it rests and waits for orders, [Contracting](#contracting) earns [money](#money-and-funding), [Training](#training) raises [skill](#skill), an [Investigation](#investigations) follows a [Lead](#leads), and a [Mission](#missions) fights at a [Mission site](#mission-sites). [Wounded](#recovery) Agents go to Recovery until they have healed. Sending an Agent away from base or calling it back costs a [turn](#turns) [in transit](#transit), so change Assignments with care, and let Agents rest before their [exhaustion](#exhaustion) builds up.

See also: [Assignments](#assignments) · [Transit](#transit) · [Exhaustion](#exhaustion)

## Mechanics articles

### Agents

Source: `content/compendium/compendium_articles/mechanics_agents.yaml`

Agents are the people of your Agency. Each one has [skill](#skill), [health](#health), and [exhaustion](#exhaustion), carries a weapon, and has one [Assignment](#assignments) at a time. You start with a small team and [hire](#hiring-and-upkeep) more as your [money](#money-and-funding) allows.

| Formulas            |                                                                 |
| ------------------- | --------------------------------------------------------------- |
| Starting team       | 8 Agents, ready for orders on the first [turn](#turns)          |
| A new Agent         | Skill 100, health 30, no exhaustion, armed with a Combat pistol |
| A hired Agent       | Starts on Standby and arrives next turn                         |
| Killed or dismissed | The Agent is gone for good, and its skill with it               |

See also: [Skill](#skill) · [Health](#health) · [Exhaustion](#exhaustion) · [Assignments](#assignments) · [Hiring and upkeep](#hiring-and-upkeep) · [Deployable Agent](#deployable-agent) · [Fit to start work](#fit-to-start-work) · [In base Agent](#in-base-agent) · [Away Agent](#away-agent) · [Fully rested Agent](#fully-rested-agent) · [Recovering Agent](#recovering-agent) · [Incapacitated Agent](#incapacitated-agent) · [Field agent](#field-agent)

### Assignments

Source: `content/compendium/compendium_articles/mechanics_assignments.yaml`

Every [Agent](#agents) has exactly one Assignment: Standby, [Contracting](#contracting), [Training](#training), an [Investigation](#investigations), a [Mission](#missions), or [Recovery](#recovery). Standby and Training happen at your base; Contracting and Investigations happen away from it. Moving an Agent away from base or back costs a [turn](#turns) [in transit](#transit), so plan changes ahead.

| Formulas |  |
| --- | --- |
| Standby | The Agent rests and waits for orders |
| From Standby or Training | Switch to the other at once, go to Contracting or an Investigation, or deploy to a [Mission site](#mission-sites) |
| From Contracting or an Investigation | Can only be recalled to Standby |
| In transit, deployed, or on Recovery | Cannot be given orders |
| Starting Contracting, Training, or an Investigation | Needs full [health](#health) and [exhaustion](#exhaustion) of at most 30 |
| Dismissing | Only an Agent on Standby that is not in transit |

See also: [Contracting](#contracting) · [Training](#training) · [Investigations](#investigations) · [Missions](#missions) · [Recovery](#recovery) · [Transit](#transit)

### Away Agent

Source: `content/compendium/compendium_articles/mechanics_away_agent.yaml`

An Away Agent is not at your Agency's base, whatever its [health](#health) and [exhaustion](#exhaustion). Every serving [Agent](#agents) is either an Away Agent or an [In base Agent](#in-base-agent).

| Formulas |  |
| --- | --- |
| Away | [In transit](#transit) to any [Assignment](#assignments), [deployed](#missions) to a [Mission site](#mission-sites), or arrived on [Contracting](#contracting) or an [Investigation](#investigations) |
| From away | An Agent on Contracting or an Investigation can only be recalled to Standby, which takes a [turn](#turns) in transit |

See also: [In base Agent](#in-base-agent) · [Assignments](#assignments) · [Transit](#transit)

### Combat

Source: `content/compendium/compendium_articles/mechanics_combat.yaml`

A Combat is fought in [rounds](#equipment-and-storage). In each round every [Agent](#agents) attacks once, then every Enemy still able to fight attacks once, the most skilled of each side first. Enemies attack any Agent able to fight, at random. Agents choose at random too, but favour an Enemy they are likely but not certain to hit, and one with enough [health](#health) left to take a full hit. The Combat ends the moment one side can no longer fight, or after a round in which your team [retreats](#retreat).

| Formulas |  |
| --- | --- |
| Chance to hit | A² ÷ (A² + D²), rounded down to a tenth of a percent and kept from 0.1% to 99.9%, where A is the [effective skill](#skill) of the attacker and D that of the defender |
| Order | Within a side, from the highest to the lowest effective skill at the start of its part of the round |
| Enemy target | Any Agent able to fight, each equally likely |
| Agent target | Any Enemy able to fight, with a weight of 100 minus one for each whole hundredth by which the chance to hit it lies above or below 0.8, times the share of the Agent's [weapon damage](#damage) that the Enemy's health and armor can still take, rounded up |
| Each attack | +1 [exhaustion](#exhaustion) for the attacker and +0 for the defender, hit or miss |
| [Incapacitated](#incapacitated-agent) | Alive but unable to fight: effective skill at or below 0.1 × skill, or exhaustion of 100 or more |
| End of the Combat | As soon as no Enemy or no Agent is able to fight, or after a round in which the team retreats |

See also: [Combat rating](#combat-rating) · [Damage](#damage) · [Retreat](#retreat) · [Skill](#skill) · [Missions](#missions)

### Combat rating

Source: `content/compendium/compendium_articles/mechanics_combat_rating.yaml`

A Combat rating measures how strong a side is in a [Combat](#combat), so that you can weigh your team against the Enemies before you [deploy](#missions) it. [Effective skill](#skill) carries most of it, and a rating factor adjusts it for how hard a Combatant hits, how much harm it can take, and how much its [armor](#damage) absorbs. Your team also weighs it during a Combat, to decide whether to [retreat](#retreat).

| Formulas |  |
| --- | --- |
| Rating factor | Half the sum of weapon damage ÷ 10, [max health](#health) ÷ 30, and armor ÷ 20 |
| At the rating bases | A Combatant with weapon damage 10, max health 30, and no armor has a rating factor of 1 |
| One Combatant | Its effective skill × its rating factor, rounded down |
| A side | The sum of effective skill × rating factor over its Combatants able to fight, × n ^ (1.2 − 1), where n is their number, rounded down once, so that a larger side counts for more than its sum |
| [Incapacitated](#incapacitated-agent) Combatants | Add nothing to the Combat rating of their side |
| Base Combat rating | An [Agent](#agents)'s effective skill alone, shown beside its Combat rating so that you can see how much its [equipment](#equipment-and-storage) and [Upgrades](#upgrades) add |

See also: [Combat](#combat) · [Retreat](#retreat) · [Damage](#damage) · [Skill](#skill) · [Missions](#missions)

### Contracting

Source: `content/compendium/compendium_articles/mechanics_contracting.yaml`

Contracting sends an [Agent](#agents) out to work for [money](#money-and-funding). It is your steady income beside funding, and it pays a little more for a skilled Agent and a little less for a [tired](#exhaustion) one. An Agent on Contracting is away from base, so getting it back for a [Mission](#missions) takes a [turn](#turns). Only as many Agents can contract at once as the Contracting cap allows.

| Formulas |  |
| --- | --- |
| Income of one Agent each turn | 30 × (1 + ([effective skill](#skill) − 100) ÷ 200) |
| Total | The income of every Agent on Contracting is added up, then rounded down |
| Exhaustion | +1 each turn, after the income is paid |
| Contracting cap | 0 until a [Lead](#leads) unlocks Contracting; then 4 Agents |
| Raising the Contracting cap | +4 the first time you win a Mission at an Initiative [Mission site](#mission-sites) of each [operation](#faction-operations) level, against any [Faction](#factions) |
| Getting there and back | One turn [in transit](#transit) each way, with no income |

See also: [Money and funding](#money-and-funding) · [Exhaustion](#exhaustion) · [Transit](#transit) · [Contracting opportunities](#contracting-opportunities)

### Damage

Source: `content/compendium/compendium_articles/mechanics_damage.yaml`

A hit deals damage to its target. How much depends on the weapon of the attacker, with some luck either way. The armor of the target absorbs the damage first, and only what armor does not absorb removes [health](#health). The weapon and the armor an [Agent](#agents) wears decide both, and an Agent whose [rounds](#equipment-and-storage) run out hits with its [knife](#knife).

| Formulas |  |
| --- | --- |
| Damage of a hit | A whole number from weapon damage × (1 − 0.5), rounded up, to weapon damage × (1 + 0.5), rounded down; each is equally likely |
| Weapon damage of an Agent | That of the weapon it wears, or of its knife once its rounds run out |
| Armor of an Agent | That of the armor it wears |
| Armor of an Enemy | That of the armor it wears |
| Armor in a hit | The damage first lowers armor, down to zero; only the rest removes health |
| Lost armor | Costs no health and no [effective skill](#skill), and is whole again at the start of the next [Combat](#combat) |
| A miss | No damage |

See also: [Combat](#combat) · [Health](#health) · [Equipment and Storage](#equipment-and-storage) · [Knife](#knife) · [Combat pistol](#combat-pistol) · [Standard uniform](#standard-uniform) · [Basic pistol](#basic-pistol) · [Rifle](#rifle) · [Augmented rifle](#augmented-rifle) · [Machine gun](#machine-gun) · [Laser pistol](#laser-pistol) · [Laser rifle](#laser-rifle)

### Deployable Agent

Source: `content/compendium/compendium_articles/mechanics_deployable_agent.yaml`

A Deployable Agent is one you can send to a [Mission site](#mission-sites) right now. The [Missions](#missions) View lists only Deployable Agents, however [tired](#exhaustion) they are.

| Formulas |  |
| --- | --- |
| Where it is | [In base](#in-base-agent), on [Standby](#assignments) or [Training](#training), and not [in transit](#transit) |
| How worn down it may be | Not so worn down that it would be [incapacitated](#incapacitated-agent) the moment the [Combat](#combat) starts |
| Never deployable | An [Agent](#agents) in transit, deployed, [recovering](#recovery), on [Contracting](#contracting), or on an [Investigation](#investigations) |

See also: [In base Agent](#in-base-agent) · [Incapacitated Agent](#incapacitated-agent) · [Missions](#missions)

### Equipment and Storage

Source: `content/compendium/compendium_articles/mechanics_equipment.yaml`

The Agency keeps its weapons, [armor](#damage), and rounds in Storage. Each [Agent](#agents) wears one weapon and one armor from it, and you can swap them at any time. Every attack an Agent makes with a gun spends one round from Storage, and every [Mission](#missions) of a [turn](#turns) draws on the same rounds, in the order you deployed them. An Agent whose rounds run out fights on with its [knife](#knife). A won Mission brings back the weapons of the Enemies and a few of their rounds; a lost one can cost your Agents their gear.

| Formulas |  |
| --- | --- |
| Selling | Brings 0.5 of the price, rounded down for the whole sale |
| Buying | At the full price, once an interrogation has shown where to get it |
| Running out | An Agent with no round left attacks with its Knife until the [Combat](#combat) ends |
| No gear | An Agent with no other weapon fights with its Knife, and one with no other armor wears its Standard uniform |
| Low on rounds | Fewer than 10 rounds in Storage for each Agent whose weapon uses them |
| Spoils of war | Every weapon of the Enemies of a won Mission, each with 0 to 4 rounds |
| [Retreat](#retreat) | The gear of the Agents killed is lost |
| Wiped | The gear of the whole team is lost |

See also: [Knife](#knife) · [Standard uniform](#standard-uniform) · [Combat pistol](#combat-pistol) · [Damage](#damage) · [Missions](#missions)

### Exhaustion

Source: `content/compendium/compendium_articles/mechanics_exhaustion.yaml`

Exhaustion measures how tired an [Agent](#agents) is. Work and fighting raise it, and only rest on [Standby](#assignments) or [Recovery](#recovery) lowers it. A tired Agent works and fights worse, one that is too tired cannot start new work, and one that works on regardless is sent back to rest.

| Formulas |  |
| --- | --- |
| Each [turn](#turns) of [Contracting](#contracting) | +1 |
| Each turn of [Training](#training) | +1 |
| Each turn on an [Investigation](#investigations) | +1 |
| Each attack made in a [Combat](#combat) | +1, hit or miss |
| Each attack defended against | +0, hit or miss |
| Each [Mission](#missions) survived | +5, and +1 for each 1% of the team that was killed, rounded up |
| Each turn on Standby or Recovery | −5, plus [Upgrades](#upgrades), never below 0 |
| [In transit](#transit) or deployed | No rest |
| [Skill](#skill) penalty | −1% of skill for each point above 30 |
| New work can start at most at | 30; deploying to a [Mission site](#mission-sites) needs only that the Agent could still fight |
| Work ends at | 70 or more: after that turn's work the Agent is sent to Standby |
| Unable to fight at | 100 or more |

See also: [Recovery](#recovery) · [Skill](#skill) · [Assignments](#assignments) · [Exhaustion recovery](#exhaustion-recovery)

### Experience

Source: `content/compendium/compendium_articles/mechanics_experience.yaml`

[Agents](#agents) gain Experience by living through [Missions](#missions). In a [Combat](#combat) an Agent earns Experience from every attack it makes and from every attack made on it, and it earns more for surviving the Mission, most of all the first few times. An Agent killed in the Combat keeps nothing. Every point of Experience an Agent gains raises its [skill](#skill) by one point; see [Skill gain](#skill-gain).

| Formulas                      |                                                                        |
| ----------------------------- | ---------------------------------------------------------------------- |
| Each attack made that hits    | +4                                                                     |
| Each attack made that misses  | +2                                                                     |
| Each time the Agent is hit    | +1                                                                     |
| Each time the Agent is missed | +2                                                                     |
| First Mission survived        | +30                                                                    |
| Second Mission survived       | +25                                                                    |
| Third Mission survived        | +20                                                                    |
| Every later Mission survived  | +15                                                                    |
| Won or lost                   | Survivors gain the same either way                                     |
| Skill gained                  | +1 skill for each point of Experience                                  |
| When it counts                | Experience is added after the Combat, so it helps from the next job on |

See also: [Skill gain](#skill-gain) · [Missions](#missions) · [Combat](#combat)

### Faction operations

Source: `content/compendium/compendium_articles/mechanics_faction_operations.yaml`

From time to time a [Faction](#factions) carries out an operation. Each operation opens a [Mission site](#mission-sites) where you can stop it, for a few [turns](#turns) only. Stop it and you are rewarded; lose the [Mission](#missions) or let the Mission site expire and [Panic](#panic) rises.

| Formulas |  |
| --- | --- |
| Level | Each operation has a level, which sets the reward for stopping it and the penalty for failing |
| Stopped: the Mission is won | The reward of the level, e.g. [money](#money-and-funding) or funding |
| Not stopped: the Mission is lost or the Mission site expires | The penalty of the level, e.g. more Panic or less funding |
| Never twice in a row | A Faction does not repeat its previous operation when its level offers another |
| Several at once | A new operation can begin while the Mission site of an earlier one is still open |

See also: [Factions](#factions) · [Mission sites](#mission-sites) · [Panic](#panic)

### Factions

Source: `content/compendium/compendium_articles/mechanics_factions.yaml`

Factions are the hostile groups you are fighting. Each acts on its own, grows more active the longer it survives, and carries out [operations](#faction-operations) that raise [Panic](#panic) if you do not stop them. Terminate every Faction to open the way to winning the Campaign.

| Formulas |  |
| --- | --- |
| Activity level | Sets how often a Faction carries out operations and how severe they are; it rises over time and never falls |
| Dormant | A Faction at a level without operations carries out none until it grows more active |
| Timing | When a Faction will next grow more active or carry out an operation is hidden |
| Eliminating a Faction | Complete the Terminate [Lead](#leads) of the Faction, which follows the interrogation of its [Cult leader](#cult-leader) |
| Once eliminated | No more operations; its open [Mission sites](#mission-sites) are cancelled and its Leads are archived |
| Slowing a Faction | Nothing slows a Faction except eliminating it |

See also: [Faction operations](#faction-operations) · [Panic](#panic) · [Winning and losing](#winning-and-losing)

### Fit to start work

Source: `content/compendium/compendium_articles/mechanics_fit_to_start_work.yaml`

An [Agent](#agents) that is Fit to start work is rested and healthy enough to begin [Contracting](#contracting), [Training](#training), or an [Investigation](#investigations). An Agent already at work keeps working until it is too [tired](#exhaustion), even once it is no longer fit to start.

| Formulas |  |
| --- | --- |
| Exhaustion | At most 30 |
| [Health](#health) | Full: no health lost |
| Deploying to a [Mission site](#mission-sites) | Needs no fitness to start work, only that the Agent could still fight |

See also: [Exhaustion](#exhaustion) · [Health](#health) · [Assignments](#assignments) · [Fully rested Agent](#fully-rested-agent)

### Fully rested Agent

Source: `content/compendium/compendium_articles/mechanics_fully_rested_agent.yaml`

A Fully rested Agent has no [exhaustion](#exhaustion) left, so more rest cannot make it any fresher. Its [health](#health) may still be low.

| Formulas |  |
| --- | --- |
| Exhaustion | 0 |
| Getting there | Each [turn](#turns) on [Standby](#assignments) or [Recovery](#recovery) lowers exhaustion by 5, plus [Upgrades](#upgrades) |
| Max [combat rating](#combat-rating) | The combat rating the [Agent](#agents) would have if it were fully rested and had lost no health |

See also: [Exhaustion](#exhaustion) · [Fit to start work](#fit-to-start-work) · [Combat rating](#combat-rating)

### Health

Source: `content/compendium/compendium_articles/mechanics_health.yaml`

Health is how much harm an [Agent](#agents) or an Enemy can still take. Hits in a [Combat](#combat) remove it once [armor](#damage) stops absorbing them, and an Agent whose health reaches zero is killed for good. An Agent that has lost health also fights worse until it has healed.

| Formulas |  |
| --- | --- |
| Max health of an Agent | 30 |
| Health at zero | An Agent is killed; an Enemy is dead |
| Lost health | Lowers [effective skill](#skill) in proportion: half the health, half the skill |
| Healing | Only on [Recovery](#recovery), where every Agent that survives a [Mission](#missions) below max health is sent |

See also: [Recovery](#recovery) · [Damage](#damage) · [Skill](#skill) · [Equipment and Storage](#equipment-and-storage)

### Hiring and upkeep

Source: `content/compendium/compendium_articles/mechanics_hiring_and_upkeep.yaml`

Hiring adds an [Agent](#agents) to your Agency for a one-time cost, and every Agent you keep costs upkeep each [turn](#turns), whatever it is doing. The Agent cap limits how many Agents you can have. Dismissing an Agent ends its upkeep and frees its place, with no refund.

| Formulas |  |
| --- | --- |
| Hire cost | 50 [money](#money-and-funding) |
| Upkeep | 10 money for each Agent each turn, including Agents [in transit](#transit), [deployed](#missions), or on [Recovery](#recovery) |
| Agent cap | 20 Agents, plus [Upgrades](#upgrades) |
| A hired Agent | Counts toward the cap and upkeep at once, and arrives on [Standby](#assignments) next turn |
| Dismissing | Only an Agent on Standby that is not in transit; it never returns |

See also: [Agents](#agents) · [Money and funding](#money-and-funding) · [Agent cap](#agent-cap)

### In base Agent

Source: `content/compendium/compendium_articles/mechanics_in_base_agent.yaml`

An In base Agent is at your Agency's base, whatever its [health](#health) and [exhaustion](#exhaustion). Every serving [Agent](#agents) is either an In base Agent or an [Away Agent](#away-agent).

| Formulas |  |
| --- | --- |
| In base | Arrived on [Standby](#assignments) or [Training](#training), or [recovering](#recovery) |
| From base | An Agent on Standby or Training can be given any order: [deployed](#missions), sent away, or switched between the two |

See also: [Away Agent](#away-agent) · [Assignments](#assignments) · [Transit](#transit)

### Incapacitated Agent

Source: `content/compendium/compendium_articles/mechanics_incapacitated_agent.yaml`

An Incapacitated Agent is alive but too weakened or too worn down to fight on in a [Combat](#combat). It takes no further part in it and is no longer attacked. An [Agent](#agents) that would be incapacitated the moment a Combat starts cannot be [deployed](#missions).

| Formulas      |                                                                         |
| ------------- | ----------------------------------------------------------------------- |
| Too weakened  | [Effective skill](#skill) at or below 0.1 × skill                       |
| Too worn down | [Exhaustion](#exhaustion) of 100 or more                                |
| Alive         | An Agent whose [health](#health) reaches 0 is killed, not incapacitated |

See also: [Combat](#combat) · [Deployable Agent](#deployable-agent) · [Exhaustion](#exhaustion)

### Investigations

Source: `content/compendium/compendium_articles/mechanics_investigations.yaml`

An Investigation is a team of [Agents](#agents) following a [Lead](#leads). Each [turn](#turns) the team adds progress from its [skill](#skill), and when the progress reaches a hidden target the Investigation completes and takes effect, e.g. by revealing a [Mission site](#mission-sites). Pulling Agents out loses progress, and pulling them all out abandons the Investigation.

| Formulas |  |
| --- | --- |
| Progress each turn | (Effective skill of the whole team ÷ 100) × team efficiency, rounded down to hundredths |
| Team efficiency | n^0.8 ÷ n for n Agents at work: 1 for one Agent, and less for each Agent as the team grows |
| Target | From the required progress of the Lead up to 150% of it, set at the start and hidden |
| Assessment | At 25% of the required progress you learn the required progress and the range of the target |
| Removing Agents | Progress × (effective skill that stays ÷ effective skill before), rounded down |
| Removing every Agent | The Investigation is abandoned; a new one starts from zero |
| Completion | The effect of the Lead takes place, e.g. a Mission site appears, and the team goes to [Standby](#assignments), [in transit](#transit) |
| [Exhaustion](#exhaustion) | +1 for each Agent each turn of work |
| Joining | Agents are in transit for a turn before they add progress |

See also: [Leads](#leads) · [Mission sites](#mission-sites) · [Exhaustion](#exhaustion) · [Following Leads](#following-leads)

### Leads

Source: `content/compendium/compendium_articles/mechanics_leads.yaml`

A Lead is a trail your [Agents](#agents) can follow. An [Investigation](#investigations) that follows it to the end may reveal a [Mission site](#mission-sites), and winning the [Mission](#missions) there or completing the Lead can uncover the next Lead. You see only the Leads you have discovered.

| Formulas          |                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------- |
| Discovery         | A Lead appears when its hidden condition is met, e.g. by a won Mission, and stays known |
| Available         | Can be investigated now                                                                 |
| Inactive          | Cannot be investigated now, e.g. while the Mission site it revealed is still open       |
| Archived          | Can never be investigated again, e.g. once its [Faction](#factions) is eliminated       |
| Required progress | Hidden until an Investigation reaches 25% of it                                         |
| One at a time     | A Lead has at most one Investigation under way                                          |

See also: [Investigations](#investigations) · [Mission sites](#mission-sites) · [Following Leads](#following-leads)

### Mission sites

Source: `content/compendium/compendium_articles/mechanics_mission_sites.yaml`

A Mission site is a place where Enemies wait for a fight. Some appear when an [Investigation](#investigations) completes, others when a [Faction](#factions) carries out an [operation](#faction-operations). Each stays open for a limited number of [turns](#turns), and you get one attempt at it.

| Formulas |  |
| --- | --- |
| Time limit | Each kind of Mission site stays open for its own number of turns, then expires |
| Last turn | A team [deployed](#missions) on the last turn still fights |
| One attempt | Once a team is deployed, no other team can be sent, and the team cannot be called back |
| Expired, from an Investigation | No penalty |
| Expired, from a Faction operation | The same penalty as a lost Mission |
| Faction eliminated | Its open Mission sites are cancelled, with no reward and no penalty |
| Enemies | Listed at the Mission site before you deploy, with their [Combat rating](#combat-rating) |

See also: [Missions](#missions) · [Faction operations](#faction-operations) · [Leads](#leads)

### Missions

Source: `content/compendium/compendium_articles/mechanics_missions.yaml`

A Mission is your team's one attempt at a [Mission site](#mission-sites). You deploy [Agents](#agents) from base, the [Combat](#combat) is fought when the [turn](#turns) advances, and the Mission is won if no Enemy is left able to fight. Win or lose, the survivors come home [tired](#exhaustion) and a little more skilled.

| Formulas |  |
| --- | --- |
| Who can deploy | Agents on [Standby](#assignments) or [Training](#training), however tired, unless too worn down to fight |
| Transport cap | 8 Agents deployed at one time, over all Missions, plus [Upgrades](#upgrades) |
| Won | No Enemy is able to fight; the rewards of the Mission site apply |
| Lost | The team [retreats](#retreat), or no Agent is able to fight; no reward, and a [Faction operation](#faction-operations) that was not stopped applies its penalty |
| Exhaustion of survivors | +5, and +1 for each 1% of the team that was killed, rounded up |
| After the Combat | Survivors below [max health](#health) go to [Recovery](#recovery), the others to Standby; all are [in transit](#transit) for a turn |

See also: [Mission sites](#mission-sites) · [Combat](#combat) · [Retreat](#retreat) · [Experience](#experience) · [Transport cap](#transport-cap)

### Money and funding

Source: `content/compendium/compendium_articles/mechanics_money_and_funding.yaml`

Money pays for [hiring](#hiring-and-upkeep), upkeep, and [Upgrades](#upgrades). Each [turn](#turns) you receive your funding and what your [Agents](#agents) earn by [Contracting](#contracting), and then pay upkeep. Won [Missions](#missions) add money and can raise funding, and [Faction operations](#faction-operations) you fail to stop can cut it. If your money is below zero when a turn ends, the Campaign is lost.

| Formulas                          |                                                                |
| --------------------------------- | -------------------------------------------------------------- |
| Income each turn                  | Funding + Contracting income                                   |
| Upkeep each turn                  | Paid in full after income, even when it takes money below zero |
| Hiring and Upgrades               | Need the whole price in hand                                   |
| Funding                           | Never below 0; a change counts from the next turn's income     |
| Money below zero when a turn ends | [Defeat](#winning-and-losing); exactly 0 is safe               |

See also: [Contracting](#contracting) · [Hiring and upkeep](#hiring-and-upkeep) · [Upgrades](#upgrades) · [Winning and losing](#winning-and-losing)

### Panic

Source: `content/compendium/compendium_articles/mechanics_panic.yaml`

Panic measures how frightened the world is, from 0% to 100%. [Faction operations](#faction-operations) you fail to stop raise it, and some won [Missions](#missions) lower it. If Panic reaches its limit, the Campaign is lost.

| Formulas |  |
| --- | --- |
| At the start | 0% |
| [Defeat](#winning-and-losing) at | 100% or more |
| Raised by | A lost Mission against a Faction operation, or its [Mission site](#mission-sites) expiring |
| Lowered by | Winning a Mission whose reward lowers Panic |
| Changes | Counted in hundredths of a percentage point, added up once each [turn](#turns), and kept between 0% and 100% |

See also: [Faction operations](#faction-operations) · [Winning and losing](#winning-and-losing) · [Keeping Panic down](#keeping-panic-down)

### Recovering Agent

Source: `content/compendium/compendium_articles/mechanics_recovering_agent.yaml`

A Recovering Agent has come home [wounded](#recovery) from a [Mission](#missions) and has arrived on Recovery, where it heals and rests. It is [in base](#in-base-agent), but it cannot be given orders until it is back at [max health](#health).

| Formulas   |                                                                                     |
| ---------- | ----------------------------------------------------------------------------------- |
| Recovering | On Recovery and no longer [in transit](#transit)                                    |
| Orders     | None: it cannot be deployed, sent away, trained, or [dismissed](#hiring-and-upkeep) |
| Leaving    | Back on [Standby](#assignments) at once when its health is full                     |

See also: [Recovery](#recovery) · [In base Agent](#in-base-agent) · [Health](#health)

### Recovery

Source: `content/compendium/compendium_articles/mechanics_recovery.yaml`

An [Agent](#agents) that comes back from a [Mission](#missions) with lost [health](#health) goes to Recovery and stays there until it is back at max health. You cannot send an Agent to Recovery or take it off early. A [recovering Agent](#recovering-agent) also rests, so its [exhaustion](#exhaustion) falls.

| Formulas |  |
| --- | --- |
| Health regained each [turn](#turns) | 2% of max health, plus [Upgrades](#upgrades), rounded up to hundredths |
| Exhaustion lost each turn | 5, plus Upgrades, as on [Standby](#assignments) |
| First healing | A survivor arrives the turn after the [Combat](#combat) and starts to heal the turn after that |
| At max health | The Agent returns to Standby at once, without [transit](#transit) |
| While on Recovery | No orders, no [income](#money-and-funding), no [Training](#training), no dismissal; [upkeep](#hiring-and-upkeep) is still paid |

See also: [Health](#health) · [Exhaustion](#exhaustion) · [Health recovery](#health-recovery) · [Exhaustion recovery](#exhaustion-recovery)

### Retreat

Source: `content/compendium/compendium_articles/mechanics_retreat.yaml`

Your team does not fight to the last [Agent](#agents). After each round of a [Combat](#combat) it weighs how the fight is going, and it retreats when it has lost much of its strength while the Enemies keep enough of theirs. A retreat loses the [Mission](#missions) but saves the survivors.

| Formulas |  |
| --- | --- |
| The team retreats when both hold | Its [Combat rating](#combat-rating) is below 0.01 × what it was at the start, and the Combat rating of the Enemies is at least 0.99 × that of the team now |
| Checked | After each round, once both sides have attacked |
| Result | The Mission is lost |
| [Exhaustion](#exhaustion) | Survivors gain as much as after any other Mission |

See also: [Combat](#combat) · [Missions](#missions)

### Skill

Source: `content/compendium/compendium_articles/mechanics_skill.yaml`

Skill is how good an [Agent](#agents) is at everything it does: earning [money](#money-and-funding), investigating, and fighting. [Training](#training) and [Missions](#missions) raise it for good, and nothing lowers it. Lost [health](#health) and [exhaustion](#exhaustion) reduce how much of its skill an Agent can use, until it has healed and rested; what is left is its effective skill.

| Formulas |  |
| --- | --- |
| Effective skill | Skill × (health ÷ max health) × exhaustion factor, rounded down |
| Exhaustion factor | 100% up to 30 exhaustion, then 1% less for each point above it, down to 0% |
| Used for | [Contracting](#contracting) income, [Investigation](#investigations) progress, and every attack and defense in a [Combat](#combat) |
| Enemies | The same rule applies to every Enemy |

See also: [Skill gain](#skill-gain) · [Health](#health) · [Exhaustion](#exhaustion)

### Skill gain

Source: `content/compendium/compendium_articles/mechanics_skill_gain.yaml`

An [Agent](#agents)'s [skill](#skill) rises in two ways: by [Training](#training), and by the [Experience](#experience) it gains from the [Missions](#missions) it survives. Every point of Experience becomes one point of skill.

| Formulas                        |                                |
| ------------------------------- | ------------------------------ |
| Each [turn](#turns) of Training | +1, plus [Upgrades](#upgrades) |
| Each point of Experience        | +1                             |

See also: [Skill](#skill) · [Training](#training) · [Experience](#experience) · [Training skill gain](#training-skill-gain)

### Training

Source: `content/compendium/compendium_articles/mechanics_training.yaml`

Training raises an [Agent](#agents)'s [skill](#skill) a little every [turn](#turns). It happens at base, so an Agent on Training can be [deployed](#missions) to a [Mission site](#mission-sites) at once. Only as many Agents can train at one time as the Training cap allows, and a [tired](#exhaustion) Agent may learn nothing in a turn.

| Formulas |  |
| --- | --- |
| Skill gained each turn | +1, plus [Upgrades](#upgrades) |
| Chance to gain it | Certain up to 30 exhaustion; above it, 1% less likely for each further point |
| Exhaustion | +1 each turn |
| Training cap | 10 Agents, plus Upgrades |
| Moving between [Standby](#assignments) and Training | At once, without [transit](#transit) |

See also: [Skill gain](#skill-gain) · [Exhaustion](#exhaustion) · [Training cap](#training-cap) · [Training skill gain](#training-skill-gain)

### Transit

Source: `content/compendium/compendium_articles/mechanics_transit.yaml`

[Agents](#agents) need time to travel. An Agent sent away from base, recalled to it, newly [hired](#hiring-and-upkeep), or returning from a [Mission](#missions) is in transit for one [turn](#turns). In transit it does nothing and cannot be given orders, but it still costs upkeep.

| Formulas |  |
| --- | --- |
| Length | Always one turn |
| To or from [Contracting](#contracting) or an [Investigation](#investigations) | In transit |
| Between [Standby](#assignments) and [Training](#training) | No transit |
| Deploying to a [Mission site](#mission-sites) | No transit on the way there; survivors are in transit on the way back |
| A hired Agent | In transit to Standby |
| Leaving [Recovery](#recovery) | No transit |
| While in transit | No [income](#money-and-funding), no [skill gain](#skill-gain), no progress, no healing, and no rest |

See also: [Assignments](#assignments)

### Turns

Source: `content/compendium/compendium_articles/mechanics_turns.yaml`

The game is played in turns. During a turn you give orders, and each takes effect at once. When you advance the turn, the game works through everything that happens in a fixed order, so that, e.g., this turn's [income](#money-and-funding) arrives before [upkeep](#hiring-and-upkeep) is paid.

| Formulas |  |
| --- | --- |
| 1. Income | Funding and [Contracting](#contracting) income are added to your money |
| 2. Upkeep | Upkeep is paid for every [Agent](#agents) |
| 3. [Training](#training) | Agents on Training gain [skill](#skill) |
| 4. [Investigations](#investigations) | Investigations gain progress, and those that reach their target complete |
| 5. [Missions](#missions) | Every [Combat](#combat) is fought, and the rewards and penalties of each Mission apply |
| 6. [Mission sites](#mission-sites) | Open Mission sites count down, and those out of time expire |
| 7. [Factions](#factions) | Factions grow more active and carry out [operations](#faction-operations) |
| 8. Rest | Agents on [Recovery](#recovery) heal, and Agents on [Standby](#assignments) or Recovery lose [exhaustion](#exhaustion) |
| 9. Arrivals | Agents that were [in transit](#transit) when the turn was advanced arrive |
| 10. [Panic](#panic) | Every change to Panic of this turn is applied at once |
| 11. Ending | [Victory](#winning-and-losing) and defeat are checked |

See also: [A turn at the Agency](#a-turn-at-the-agency) · [Winning and losing](#winning-and-losing)

### Upgrades

Source: `content/compendium/compendium_articles/mechanics_upgrades.yaml`

Upgrades are permanent improvements bought with [money](#money-and-funding). Each purchase adds a fixed amount to one thing: a cap of the Agency or how fast every [Agent](#agents) trains, rests, or heals. An Upgrade can be bought any number of times.

| Formulas                                 |                                                                |
| ---------------------------------------- | -------------------------------------------------------------- |
| Price                                    | Fixed for each Upgrade; it never rises                         |
| Buying again                             | Every purchase adds the same amount, without limit             |
| Caps                                     | Raised at once                                                 |
| [Training](#training), rest, and healing | Faster from the next [turn](#turns)                            |
| Who benefits                             | Every Agent, including those [hired](#hiring-and-upkeep) later |

See also: [Agent cap](#agent-cap) · [Transport cap](#transport-cap) · [Training cap](#training-cap) · [Training skill gain](#training-skill-gain) · [Exhaustion recovery](#exhaustion-recovery) · [Health recovery](#health-recovery)

### Winning and losing

Source: `content/compendium/compendium_articles/mechanics_winning_and_losing.yaml`

You win the Campaign by completing the [Lead](#leads) Peace on Earth, which appears once every [Faction](#factions) is terminated. You lose it if [Panic](#panic) reaches its limit, your [money](#money-and-funding) falls below zero, or you fail to stop an existential [Faction operation](#faction-operations). All are checked at the end of every [turn](#turns), and a win counts first.

| Formulas |  |
| --- | --- |
| Victory | The Lead Peace on Earth is completed |
| Defeat by Panic | Panic of 100% or more |
| Defeat by money | Money below 0 when a turn ends |
| Defeat by an existential operation | A Faction operation of the highest level is not stopped; Panic plays no part and does not change |
| Victory and defeat in the same turn | Victory |

See also: [Factions](#factions) · [Panic](#panic) · [Money and funding](#money-and-funding)

## Subject articles: AgentArchetype

### Field agent

Source: `content/compendium/compendium_articles/field_agent_article.yaml`

The backbone of the Agency: a trained [operative](#operative) who can investigate, earn [money](#money-and-funding) on contract, train, or fight. Every [Agent](#agents) you [hire](#hiring-and-upkeep) starts as a Field agent and grows through [Training](#training) and the [Missions](#missions) it survives.

| `field_agent` | AgentArchetype     |
| ------------- | ------------------ |
| `name`        | `Field agent`      |
| `base_skill`  | `100`              |
| `base_health` | `30`               |
| `weapon`      | `combat_pistol`    |
| `armor`       | `standard_uniform` |

## Subject articles: AmmoType

### Laser pistol battery

Source: `content/compendium/compendium_articles/laser_pistol_battery_article.yaml`

Power cells for the [laser pistol](#laser-pistol). Each attack an [Agent](#agents) makes with such a weapon spends one.

| `laser_pistol_battery` | AmmoType               |
| ---------------------- | ---------------------- |
| `name`                 | `Laser pistol battery` |
| `price`                | `10`                   |

See also: [Equipment and Storage](#equipment-and-storage)

### Laser rifle battery

Source: `content/compendium/compendium_articles/laser_rifle_battery_article.yaml`

Power cells for the [laser rifle](#laser-rifle) and the [augmented laser rifle](#augmented-laser-rifle). Each attack an [Agent](#agents) makes with such a weapon spends one.

| `laser_rifle_battery` | AmmoType              |
| --------------------- | --------------------- |
| `name`                | `Laser rifle battery` |
| `price`               | `15`                  |

See also: [Equipment and Storage](#equipment-and-storage)

### Machine gun ammo

Source: `content/compendium/compendium_articles/machine_gun_ammo_article.yaml`

Belts of [rounds](#equipment-and-storage) for the [machine gun](#machine-gun). Each attack an [Agent](#agents) makes with such a weapon spends one.

| `machine_gun_ammo` | AmmoType           |
| ------------------ | ------------------ |
| `name`             | `Machine gun ammo` |
| `price`            | `5`                |

See also: [Equipment and Storage](#equipment-and-storage)

### Pistol ammo

Source: `content/compendium/compendium_articles/pistol_ammo_article.yaml`

[Rounds](#equipment-and-storage) for the [basic pistol](#basic-pistol) and the [combat pistol](#combat-pistol). Each attack an [Agent](#agents) makes with such a weapon spends one.

| `pistol_ammo` | AmmoType      |
| ------------- | ------------- |
| `name`        | `Pistol ammo` |
| `price`       | `1`           |

See also: [Equipment and Storage](#equipment-and-storage)

### Rifle ammo

Source: `content/compendium/compendium_articles/rifle_ammo_article.yaml`

[Rounds](#equipment-and-storage) for the [rifle](#rifle) and the [augmented rifle](#augmented-rifle). Each attack an [Agent](#agents) makes with such a weapon spends one.

| `rifle_ammo` | AmmoType     |
| ------------ | ------------ |
| `name`       | `Rifle ammo` |
| `price`      | `3`          |

See also: [Equipment and Storage](#equipment-and-storage)

## Subject articles: Armor

### Augmented battle suit

Source: `content/compendium/compendium_articles/augmented_battle_suit_article.yaml`

A powered [battle suit](#battle-suit) that shrugs off what would kill anyone else. Only a cult's leader is guarded this well.

| `augmented_battle_suit` | Armor |
| --- | --- |
| `name` | `Augmented battle suit` |
| `base_armor` | `80` |
| `price` | `4000` |
| `unlocked_by` | `["interrogate_red_dawn_cult_leader","interrogate_exalt_cult_leader","interrogate_black_lotus_cult_leader"]` |

### Ballistic vest

Source: `content/compendium/compendium_articles/ballistic_vest_article.yaml`

Soft body [armor](#damage) that stops most handgun [rounds](#equipment-and-storage), the standard protection of trained fighters.

| `ballistic_vest` | Armor |
| --- | --- |
| `name` | `Ballistic vest` |
| `base_armor` | `20` |
| `price` | `200` |
| `unlocked_by` | `["interrogate_red_dawn_lieutenant","interrogate_exalt_lieutenant","interrogate_black_lotus_lieutenant"]` |

### Basic clothing

Source: `content/compendium/compendium_articles/basic_clothing_article.yaml`

Everyday clothes that stop nothing, worn by the lowest ranks of a cult.

| `basic_clothing` | Armor            |
| ---------------- | ---------------- |
| `name`           | `Basic clothing` |
| `base_armor`     | `0`              |

### Battle suit

Source: `content/compendium/compendium_articles/battle_suit_article.yaml`

Plates over most of the body, heavy enough that only those who command from the front bother with it.

| `battle_suit` | Armor |
| --- | --- |
| `name` | `Battle suit` |
| `base_armor` | `50` |
| `price` | `1200` |
| `unlocked_by` | `["interrogate_red_dawn_commander","interrogate_exalt_commander","interrogate_black_lotus_commander"]` |

### Padded jacket

Source: `content/compendium/compendium_articles/padded_jacket_article.yaml`

A thick coat lined against [knives](#knife) and stray [rounds](#equipment-and-storage), worn by those who direct a cult's first recruits.

| `padded_jacket` | Armor                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `name`          | `Padded jacket`                                                                                  |
| `base_armor`    | `5`                                                                                              |
| `price`         | `50`                                                                                             |
| `unlocked_by`   | `["interrogate_red_dawn_handler","interrogate_exalt_handler","interrogate_black_lotus_handler"]` |

### Reinforced ballistic vest

Source: `content/compendium/compendium_articles/reinforced_ballistic_vest_article.yaml`

A [ballistic vest](#ballistic-vest) with hard plates added over the chest and back, worn by those who [lead](#leads) [soldiers](#soldier).

| `reinforced_ballistic_vest` | Armor |
| --- | --- |
| `name` | `Reinforced ballistic vest` |
| `base_armor` | `25` |
| `price` | `270` |
| `unlocked_by` | `["interrogate_red_dawn_lieutenant","interrogate_exalt_lieutenant","interrogate_black_lotus_lieutenant"]` |

### Reinforced battle suit

Source: `content/compendium/compendium_articles/reinforced_battle_suit_article.yaml`

A [battle suit](#battle-suit) with extra plating, built to breach a defended position under fire.

| `reinforced_battle_suit` | Armor |
| --- | --- |
| `name` | `Reinforced battle suit` |
| `base_armor` | `60` |
| `price` | `2100` |
| `unlocked_by` | `["interrogate_red_dawn_high_commander","interrogate_exalt_high_commander","interrogate_black_lotus_high_commander"]` |

### Standard uniform

Source: `content/compendium/compendium_articles/standard_uniform_article.yaml`

The uniform the Agency issues to every [Agent](#agents), with an [armor](#damage) of 0. An Agent wears it whenever it wears no other armor, and nobody can take it away. In a [Combat](#combat), a hit wears down armor before it removes any [health](#health), and armor is whole again for the next Combat.

| `standard_uniform` | Armor              |
| ------------------ | ------------------ |
| `name`             | `Standard uniform` |
| `base_armor`       | `0`                |

### Tactical armor

Source: `content/compendium/compendium_articles/tactical_armor_article.yaml`

Plates, a helmet, and guards for the limbs, made for fighters who expect to be shot at.

| `tactical_armor` | Armor |
| --- | --- |
| `name` | `Tactical armor` |
| `base_armor` | `40` |
| `price` | `500` |
| `unlocked_by` | `["interrogate_red_dawn_commander","interrogate_exalt_commander","interrogate_black_lotus_commander"]` |

## Subject articles: EnemyArchetype

### Commander

Source: `content/compendium/compendium_articles/commander_article.yaml`

A senior officer who directs the larger [operations](#faction-operations) of a cult, and fights as well as several [Soldiers](#soldier).

| `commander`    | EnemyArchetype |
| -------------- | -------------- |
| `name`         | `Commander`    |
| `abbreviation` | `cmdr`         |
| `base_skill`   | `300`          |
| `base_health`  | `40`           |
| `weapon`       | `laser_pistol` |
| `armor`        | `battle_suit`  |

### Cult leader

Source: `content/compendium/compendium_articles/cult_leader_article.yaml`

The heart of a cult, guarded in its headquarters. Only a strong, rested team should face the Cult leader, who must be captured and interrogated before the cult can be ended.

| `cult_leader`  | EnemyArchetype          |
| -------------- | ----------------------- |
| `name`         | `Cult leader`           |
| `abbreviation` | `cldr`                  |
| `base_skill`   | `800`                   |
| `base_health`  | `80`                    |
| `weapon`       | `augmented_laser_rifle` |
| `armor`        | `augmented_battle_suit` |

### Elite

Source: `content/compendium/compendium_articles/elite_article.yaml`

A hand-picked veteran, far more dangerous than a [Soldier](#soldier). Only well-trained [Agents](#agents) meet an Elite on even terms.

| `elite`        | EnemyArchetype   |
| -------------- | ---------------- |
| `name`         | `Elite`          |
| `abbreviation` | `elit`           |
| `base_skill`   | `250`            |
| `base_health`  | `40`             |
| `weapon`       | `machine_gun`    |
| `armor`        | `tactical_armor` |

### Handler

Source: `content/compendium/compendium_articles/handler_article.yaml`

A junior officer who runs a cell of [Initiates](#initiate) and [Operatives](#operative).

| `handler`      | EnemyArchetype  |
| -------------- | --------------- |
| `name`         | `Handler`       |
| `abbreviation` | `hndl`          |
| `base_skill`   | `80`            |
| `base_health`  | `25`            |
| `weapon`       | `combat_pistol` |
| `armor`        | `padded_jacket` |

### High commander

Source: `content/compendium/compendium_articles/high_commander_article.yaml`

One of the few who answer only to the [Cult leader](#cult-leader). A High commander is a match for a whole team of new [Agents](#agents).

| `high_commander` | EnemyArchetype           |
| ---------------- | ------------------------ |
| `name`           | `High commander`         |
| `abbreviation`   | `hcmd`                   |
| `base_skill`     | `500`                    |
| `base_health`    | `50`                     |
| `weapon`         | `laser_rifle`            |
| `armor`          | `reinforced_battle_suit` |

### Initiate

Source: `content/compendium/compendium_articles/initiate_article.yaml`

A new recruit of a hostile cult, with more zeal than [skill](#skill). Initiates are dangerous mainly in numbers.

| `initiate`     | EnemyArchetype   |
| -------------- | ---------------- |
| `name`         | `Initiate`       |
| `abbreviation` | `init`           |
| `base_skill`   | `40`             |
| `base_health`  | `20`             |
| `weapon`       | `basic_pistol`   |
| `armor`        | `basic_clothing` |

### Lieutenant

Source: `content/compendium/compendium_articles/lieutenant_article.yaml`

An officer who [leads](#leads) [Soldiers](#soldier) in the field, and fights a little better than those under command.

| `lieutenant`   | EnemyArchetype              |
| -------------- | --------------------------- |
| `name`         | `Lieutenant`                |
| `abbreviation` | `ltnt`                      |
| `base_skill`   | `140`                       |
| `base_health`  | `30`                        |
| `weapon`       | `augmented_rifle`           |
| `armor`        | `reinforced_ballistic_vest` |

### Operative

Source: `content/compendium/compendium_articles/operative_article.yaml`

A cult member trusted with real work. Operatives shoot straighter than [Initiates](#initiate) and stand beside them in most fights.

| `operative`    | EnemyArchetype   |
| -------------- | ---------------- |
| `name`         | `Operative`      |
| `abbreviation` | `oper`           |
| `base_skill`   | `60`             |
| `base_health`  | `25`             |
| `weapon`       | `combat_pistol`  |
| `armor`        | `basic_clothing` |

### Soldier

Source: `content/compendium/compendium_articles/soldier_article.yaml`

A seasoned fighter, roughly a match for a newly [hired](#hiring-and-upkeep) [Agent](#agents). Soldiers guard the places a [Faction](#factions) cannot afford to lose.

| `soldier`      | EnemyArchetype   |
| -------------- | ---------------- |
| `name`         | `Soldier`        |
| `abbreviation` | `sold`           |
| `base_skill`   | `120`            |
| `base_health`  | `30`             |
| `weapon`       | `rifle`          |
| `armor`        | `ballistic_vest` |

## Subject articles: FactionArchetype

### Black Lotus

Source: `content/compendium/compendium_articles/black_lotus_article.yaml`

A ruthless cult that trades in fear and silence. Follow its members up the chain to its headquarters and its leader, and a final [operation](#faction-operations) ends Black Lotus for good.

| `black_lotus`         | FactionArchetype |
| --------------------- | ---------------- |
| `name`                | `Black Lotus`    |
| `initial_lasts_turns` | `[10,20]`        |

### Exalt

Source: `content/compendium/compendium_articles/exalt_article.yaml`

A secretive cult that hides behind charity and patronage while it buys influence. Follow its members up the chain to its headquarters and its leader, and a final [operation](#faction-operations) ends Exalt for good.

| `exalt`               | FactionArchetype |
| --------------------- | ---------------- |
| `name`                | `Exalt`          |
| `initial_lasts_turns` | `[5,15]`         |

### Red Dawn

Source: `content/compendium/compendium_articles/red_dawn_article.yaml`

A violent cult that recruits in the shadows and grows bolder the longer it is left alone. Follow its members up the chain to its headquarters and its leader, and a final [operation](#faction-operations) ends Red Dawn for good.

| `red_dawn`            | FactionArchetype |
| --------------------- | ---------------- |
| `name`                | `Red Dawn`       |
| `initial_lasts_turns` | `[0,0]`          |

## Subject articles: Lead

### Black Lotus profile

Source: `content/compendium/compendium_articles/black_lotus_profile_article.yaml`

Scraps of testimony and surveillance come together into a picture of how [Black Lotus](#black-lotus) is organized and where it hides.

| `black_lotus_profile` | Lead                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| `name`                | `Black Lotus profile`                                                |
| `description`         | `Compile what is known of Black Lotus into an intelligence profile.` |
| `faction`             | `black_lotus`                                                        |
| `required_progress`   | `5`                                                                  |
| `discovered_when`     | `{"lead_completed":"interrogate_black_lotus_member"}`                |

### Contracting opportunities

Source: `content/compendium/compendium_articles/contracting_opportunities_article.yaml`

Before your [Agents](#agents) can earn their keep, someone has to find out who will pay for their skills, and who can be trusted to keep quiet.

| `contracting_opportunities` | Lead                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| `name`                      | `Contracting opportunities`                                               |
| `description`               | `Find clients who will pay for the Agency's skills and ask no questions.` |
| `required_progress`         | `3`                                                                       |
| `on_completion`             | `[{"unlock_contracting":true}]`                                           |

### Criminal organizations

Source: `content/compendium/compendium_articles/criminal_organizations_article.yaml`

Crime and cults feed on each other. Follow the criminals and they will [lead](#leads) you to the cults.

| `criminal_organizations` | Lead                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `name`                   | `Criminal organizations`                                                           |
| `description`            | `Investigate local criminal organizations to find their connections to the cults.` |
| `required_progress`      | `5`                                                                                |

### Exalt profile

Source: `content/compendium/compendium_articles/exalt_profile_article.yaml`

Scraps of testimony and surveillance come together into a picture of how [Exalt](#exalt) is organized and where it hides.

| `exalt_profile`     | Lead                                                           |
| ------------------- | -------------------------------------------------------------- |
| `name`              | `Exalt profile`                                                |
| `description`       | `Compile what is known of Exalt into an intelligence profile.` |
| `faction`           | `exalt`                                                        |
| `required_progress` | `5`                                                            |
| `discovered_when`   | `{"lead_completed":"interrogate_exalt_member"}`                |

### Interrogate Black Lotus commander

Source: `content/compendium/compendium_articles/interrogate_black_lotus_commander_article.yaml`

A [commander](#commander) commands whole cells and knows where the cult's regional stronghold lies.

| `interrogate_black_lotus_commander` | Lead                                                     |
| ----------------------------------- | -------------------------------------------------------- |
| `name`                              | `Interrogate Black Lotus commander`                      |
| `description`                       | `Extract what the captured Black Lotus commander knows.` |
| `faction`                           | `black_lotus`                                            |
| `required_progress`                 | `20`                                                     |
| `discovered_when`                   | `{"mission_won_with_enemy":"commander"}`                 |

### Interrogate Black Lotus cult leader

Source: `content/compendium/compendium_articles/interrogate_black_lotus_cult_leader_article.yaml`

The leader is finally in your hands. What the leader knows is enough to bring the whole cult down.

| `interrogate_black_lotus_cult_leader` | Lead                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `name`                                | `Interrogate Black Lotus cult leader`                      |
| `description`                         | `Extract what the captured Black Lotus cult leader knows.` |
| `faction`                             | `black_lotus`                                              |
| `required_progress`                   | `40`                                                       |
| `discovered_when`                     | `{"mission_won_with_enemy":"cult_leader"}`                 |

### Interrogate Black Lotus handler

Source: `content/compendium/compendium_articles/interrogate_black_lotus_handler_article.yaml`

[Handlers](#handler) run the members in the field. This one knows where the cult keeps its next base.

| `interrogate_black_lotus_handler` | Lead                                                   |
| --------------------------------- | ------------------------------------------------------ |
| `name`                            | `Interrogate Black Lotus handler`                      |
| `description`                     | `Extract what the captured Black Lotus handler knows.` |
| `faction`                         | `black_lotus`                                          |
| `required_progress`               | `5`                                                    |
| `discovered_when`                 | `{"mission_won_with_enemy":"handler"}`                 |

### Interrogate Black Lotus high commander

Source: `content/compendium/compendium_articles/interrogate_black_lotus_high_commander_article.yaml`

Only the [cult leader](#cult-leader) outranks a [high commander](#high-commander). This one knows where the leader hides.

| `interrogate_black_lotus_high_commander` | Lead                                                          |
| ---------------------------------------- | ------------------------------------------------------------- |
| `name`                                   | `Interrogate Black Lotus high commander`                      |
| `description`                            | `Extract what the captured Black Lotus high commander knows.` |
| `faction`                                | `black_lotus`                                                 |
| `required_progress`                      | `30`                                                          |
| `discovered_when`                        | `{"mission_won_with_enemy":"high_commander"}`                 |

### Interrogate Black Lotus lieutenant

Source: `content/compendium/compendium_articles/interrogate_black_lotus_lieutenant_article.yaml`

A [Lieutenant](#lieutenant) taken alive. This officer knows where the cult moves its arms and [money](#money-and-funding).

| `interrogate_black_lotus_lieutenant` | Lead                                                      |
| ------------------------------------ | --------------------------------------------------------- |
| `name`                               | `Interrogate Black Lotus lieutenant`                      |
| `description`                        | `Extract what the captured Black Lotus lieutenant knows.` |
| `faction`                            | `black_lotus`                                             |
| `required_progress`                  | `10`                                                      |
| `discovered_when`                    | `{"mission_won_with_enemy":"lieutenant"}`                 |

### Interrogate Black Lotus member

Source: `content/compendium/compendium_articles/interrogate_black_lotus_member_article.yaml`

The captured member is in custody and frightened. Patient questioning may reveal who gives the orders.

| `interrogate_black_lotus_member` | Lead                                                  |
| -------------------------------- | ----------------------------------------------------- |
| `name`                           | `Interrogate Black Lotus member`                      |
| `description`                    | `Extract what the captured Black Lotus member knows.` |
| `faction`                        | `black_lotus`                                         |
| `required_progress`              | `3`                                                   |
| `discovered_when`                | `{"mission_won":"apprehend_member"}`                  |

### Interrogate Exalt commander

Source: `content/compendium/compendium_articles/interrogate_exalt_commander_article.yaml`

A [commander](#commander) commands whole cells and knows where the cult's regional stronghold lies.

| `interrogate_exalt_commander` | Lead                                               |
| ----------------------------- | -------------------------------------------------- |
| `name`                        | `Interrogate Exalt commander`                      |
| `description`                 | `Extract what the captured Exalt commander knows.` |
| `faction`                     | `exalt`                                            |
| `required_progress`           | `20`                                               |
| `discovered_when`             | `{"mission_won_with_enemy":"commander"}`           |

### Interrogate Exalt cult leader

Source: `content/compendium/compendium_articles/interrogate_exalt_cult_leader_article.yaml`

The leader is finally in your hands. What the leader knows is enough to bring the whole cult down.

| `interrogate_exalt_cult_leader` | Lead                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `name`                          | `Interrogate Exalt cult leader`                      |
| `description`                   | `Extract what the captured Exalt cult leader knows.` |
| `faction`                       | `exalt`                                              |
| `required_progress`             | `40`                                                 |
| `discovered_when`               | `{"mission_won_with_enemy":"cult_leader"}`           |

### Interrogate Exalt handler

Source: `content/compendium/compendium_articles/interrogate_exalt_handler_article.yaml`

[Handlers](#handler) run the members in the field. This one knows where the cult keeps its next base.

| `interrogate_exalt_handler` | Lead                                             |
| --------------------------- | ------------------------------------------------ |
| `name`                      | `Interrogate Exalt handler`                      |
| `description`               | `Extract what the captured Exalt handler knows.` |
| `faction`                   | `exalt`                                          |
| `required_progress`         | `5`                                              |
| `discovered_when`           | `{"mission_won_with_enemy":"handler"}`           |

### Interrogate Exalt high commander

Source: `content/compendium/compendium_articles/interrogate_exalt_high_commander_article.yaml`

Only the [cult leader](#cult-leader) outranks a [high commander](#high-commander). This one knows where the leader hides.

| `interrogate_exalt_high_commander` | Lead                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| `name`                             | `Interrogate Exalt high commander`                      |
| `description`                      | `Extract what the captured Exalt high commander knows.` |
| `faction`                          | `exalt`                                                 |
| `required_progress`                | `30`                                                    |
| `discovered_when`                  | `{"mission_won_with_enemy":"high_commander"}`           |

### Interrogate Exalt lieutenant

Source: `content/compendium/compendium_articles/interrogate_exalt_lieutenant_article.yaml`

A [Lieutenant](#lieutenant) taken alive. This officer knows where the cult moves its arms and [money](#money-and-funding).

| `interrogate_exalt_lieutenant` | Lead                                                |
| ------------------------------ | --------------------------------------------------- |
| `name`                         | `Interrogate Exalt lieutenant`                      |
| `description`                  | `Extract what the captured Exalt lieutenant knows.` |
| `faction`                      | `exalt`                                             |
| `required_progress`            | `10`                                                |
| `discovered_when`              | `{"mission_won_with_enemy":"lieutenant"}`           |

### Interrogate Exalt member

Source: `content/compendium/compendium_articles/interrogate_exalt_member_article.yaml`

The captured member is in custody and frightened. Patient questioning may reveal who gives the orders.

| `interrogate_exalt_member` | Lead                                            |
| -------------------------- | ----------------------------------------------- |
| `name`                     | `Interrogate Exalt member`                      |
| `description`              | `Extract what the captured Exalt member knows.` |
| `faction`                  | `exalt`                                         |
| `required_progress`        | `3`                                             |
| `discovered_when`          | `{"mission_won":"apprehend_member"}`            |

### Interrogate Red Dawn commander

Source: `content/compendium/compendium_articles/interrogate_red_dawn_commander_article.yaml`

A [commander](#commander) commands whole cells and knows where the cult's regional stronghold lies.

| `interrogate_red_dawn_commander` | Lead                                                  |
| -------------------------------- | ----------------------------------------------------- |
| `name`                           | `Interrogate Red Dawn commander`                      |
| `description`                    | `Extract what the captured Red Dawn commander knows.` |
| `faction`                        | `red_dawn`                                            |
| `required_progress`              | `20`                                                  |
| `discovered_when`                | `{"mission_won_with_enemy":"commander"}`              |

### Interrogate Red Dawn cult leader

Source: `content/compendium/compendium_articles/interrogate_red_dawn_cult_leader_article.yaml`

The leader is finally in your hands. What the leader knows is enough to bring the whole cult down.

| `interrogate_red_dawn_cult_leader` | Lead                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| `name`                             | `Interrogate Red Dawn cult leader`                      |
| `description`                      | `Extract what the captured Red Dawn cult leader knows.` |
| `faction`                          | `red_dawn`                                              |
| `required_progress`                | `40`                                                    |
| `discovered_when`                  | `{"mission_won_with_enemy":"cult_leader"}`              |

### Interrogate Red Dawn handler

Source: `content/compendium/compendium_articles/interrogate_red_dawn_handler_article.yaml`

[Handlers](#handler) run the members in the field. This one knows where the cult keeps its next base.

| `interrogate_red_dawn_handler` | Lead                                                |
| ------------------------------ | --------------------------------------------------- |
| `name`                         | `Interrogate Red Dawn handler`                      |
| `description`                  | `Extract what the captured Red Dawn handler knows.` |
| `faction`                      | `red_dawn`                                          |
| `required_progress`            | `5`                                                 |
| `discovered_when`              | `{"mission_won_with_enemy":"handler"}`              |

### Interrogate Red Dawn high commander

Source: `content/compendium/compendium_articles/interrogate_red_dawn_high_commander_article.yaml`

Only the [cult leader](#cult-leader) outranks a [high commander](#high-commander). This one knows where the leader hides.

| `interrogate_red_dawn_high_commander` | Lead                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `name`                                | `Interrogate Red Dawn high commander`                      |
| `description`                         | `Extract what the captured Red Dawn high commander knows.` |
| `faction`                             | `red_dawn`                                                 |
| `required_progress`                   | `30`                                                       |
| `discovered_when`                     | `{"mission_won_with_enemy":"high_commander"}`              |

### Interrogate Red Dawn lieutenant

Source: `content/compendium/compendium_articles/interrogate_red_dawn_lieutenant_article.yaml`

A [Lieutenant](#lieutenant) taken alive. This officer knows where the cult moves its arms and [money](#money-and-funding).

| `interrogate_red_dawn_lieutenant` | Lead                                                   |
| --------------------------------- | ------------------------------------------------------ |
| `name`                            | `Interrogate Red Dawn lieutenant`                      |
| `description`                     | `Extract what the captured Red Dawn lieutenant knows.` |
| `faction`                         | `red_dawn`                                             |
| `required_progress`               | `10`                                                   |
| `discovered_when`                 | `{"mission_won_with_enemy":"lieutenant"}`              |

### Interrogate Red Dawn member

Source: `content/compendium/compendium_articles/interrogate_red_dawn_member_article.yaml`

The captured member is in custody and frightened. Patient questioning may reveal who gives the orders.

| `interrogate_red_dawn_member` | Lead                                               |
| ----------------------------- | -------------------------------------------------- |
| `name`                        | `Interrogate Red Dawn member`                      |
| `description`                 | `Extract what the captured Red Dawn member knows.` |
| `faction`                     | `red_dawn`                                         |
| `required_progress`           | `3`                                                |
| `discovered_when`             | `{"mission_won":"apprehend_member"}`               |

### Locate Black Lotus HQ

Source: `content/compendium/compendium_articles/locate_black_lotus_hq_article.yaml`

Everything the [high commander](#high-commander) revealed points to the headquarters of [Black Lotus](#black-lotus) itself.

| `locate_black_lotus_hq` | Lead                                                          |
| ----------------------- | ------------------------------------------------------------- |
| `name`                  | `Locate Black Lotus HQ`                                       |
| `description`           | `Learn where the leader of Black Lotus hides.`                |
| `faction`               | `black_lotus`                                                 |
| `required_progress`     | `80`                                                          |
| `discovered_when`       | `{"lead_completed":"interrogate_black_lotus_high_commander"}` |
| `on_completion`         | `[{"create_mission_site":"raid_hq"}]`                         |

### Locate Black Lotus logistics hub

Source: `content/compendium/compendium_articles/locate_black_lotus_logistics_hub_article.yaml`

Arms, [money](#money-and-funding) and people all pass through one hub. Cut it and the cult will starve.

| `locate_black_lotus_logistics_hub` | Lead                                                           |
| ---------------------------------- | -------------------------------------------------------------- |
| `name`                             | `Locate Black Lotus logistics hub`                             |
| `description`                      | `Find the hub through which Black Lotus moves arms and money.` |
| `faction`                          | `black_lotus`                                                  |
| `required_progress`                | `30`                                                           |
| `discovered_when`                  | `{"lead_completed":"interrogate_black_lotus_lieutenant"}`      |
| `investigate_again`                | `always`                                                       |
| `on_completion`                    | `[{"create_mission_site":"raid_logistics_hub"}]`               |

### Locate Black Lotus member

Source: `content/compendium/compendium_articles/locate_black_lotus_member_article.yaml`

The first thread to pull: find a [Black Lotus](#black-lotus) member who can be brought in for questioning.

| `locate_black_lotus_member` | Lead                                                |
| --------------------------- | --------------------------------------------------- |
| `name`                      | `Locate Black Lotus member`                         |
| `description`               | `Track down a Black Lotus member for apprehension.` |
| `faction`                   | `black_lotus`                                       |
| `required_progress`         | `5`                                                 |
| `discovered_when`           | `{"lead_completed":"criminal_organizations"}`       |
| `investigate_again`         | `always`                                            |
| `on_completion`             | `[{"create_mission_site":"apprehend_member"}]`      |

### Locate Black Lotus outpost

Source: `content/compendium/compendium_articles/locate_black_lotus_outpost_article.yaml`

The [handler](#handler)'s reports [lead](#leads) to a small fortified base where the cult gathers its people.

| `locate_black_lotus_outpost` | Lead                                                    |
| ---------------------------- | ------------------------------------------------------- |
| `name`                       | `Locate Black Lotus outpost`                            |
| `description`                | `Trace the handler's reports to a Black Lotus outpost.` |
| `faction`                    | `black_lotus`                                           |
| `required_progress`          | `20`                                                    |
| `discovered_when`            | `{"lead_completed":"interrogate_black_lotus_handler"}`  |
| `investigate_again`          | `always`                                                |
| `on_completion`              | `[{"create_mission_site":"raid_outpost"}]`              |

### Locate Black Lotus regional stronghold

Source: `content/compendium/compendium_articles/locate_black_lotus_regional_stronghold_article.yaml`

The [commander](#commander) has given up a fortress where a [high commander](#high-commander) rules a whole region.

| `locate_black_lotus_regional_stronghold` | Lead                                                               |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `name`                                   | `Locate Black Lotus regional stronghold`                           |
| `description`                            | `Find the stronghold from which Black Lotus holds a whole region.` |
| `faction`                                | `black_lotus`                                                      |
| `required_progress`                      | `50`                                                               |
| `discovered_when`                        | `{"lead_completed":"interrogate_black_lotus_commander"}`           |
| `investigate_again`                      | `always`                                                           |
| `on_completion`                          | `[{"create_mission_site":"raid_regional_stronghold"}]`             |

### Locate Black Lotus safehouse

Source: `content/compendium/compendium_articles/locate_black_lotus_safehouse_article.yaml`

The profile of [Black Lotus](#black-lotus) points to a place it uses to hide people and supplies. Somewhere in the city, Black Lotus keeps a safehouse.

| `locate_black_lotus_safehouse` | Lead                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `name`                         | `Locate Black Lotus safehouse`                               |
| `description`                  | `Use the Black Lotus profile to find one of its safehouses.` |
| `faction`                      | `black_lotus`                                                |
| `required_progress`            | `10`                                                         |
| `discovered_when`              | `{"lead_completed":"black_lotus_profile"}`                   |
| `investigate_again`            | `always`                                                     |
| `on_completion`                | `[{"create_mission_site":"raid_safehouse"}]`                 |

### Locate Exalt HQ

Source: `content/compendium/compendium_articles/locate_exalt_hq_article.yaml`

Everything the [high commander](#high-commander) revealed points to the headquarters of [Exalt](#exalt) itself.

| `locate_exalt_hq`   | Lead                                                    |
| ------------------- | ------------------------------------------------------- |
| `name`              | `Locate Exalt HQ`                                       |
| `description`       | `Learn where the leader of Exalt hides.`                |
| `faction`           | `exalt`                                                 |
| `required_progress` | `80`                                                    |
| `discovered_when`   | `{"lead_completed":"interrogate_exalt_high_commander"}` |
| `on_completion`     | `[{"create_mission_site":"raid_hq"}]`                   |

### Locate Exalt logistics hub

Source: `content/compendium/compendium_articles/locate_exalt_logistics_hub_article.yaml`

Arms, [money](#money-and-funding) and people all pass through one hub. Cut it and the cult will starve.

| `locate_exalt_logistics_hub` | Lead                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `name`                       | `Locate Exalt logistics hub`                             |
| `description`                | `Find the hub through which Exalt moves arms and money.` |
| `faction`                    | `exalt`                                                  |
| `required_progress`          | `30`                                                     |
| `discovered_when`            | `{"lead_completed":"interrogate_exalt_lieutenant"}`      |
| `investigate_again`          | `always`                                                 |
| `on_completion`              | `[{"create_mission_site":"raid_logistics_hub"}]`         |

### Locate Exalt member

Source: `content/compendium/compendium_articles/locate_exalt_member_article.yaml`

The first thread to pull: find an [Exalt](#exalt) member who can be brought in for questioning.

| `locate_exalt_member` | Lead                                           |
| --------------------- | ---------------------------------------------- |
| `name`                | `Locate Exalt member`                          |
| `description`         | `Track down an Exalt member for apprehension.` |
| `faction`             | `exalt`                                        |
| `required_progress`   | `5`                                            |
| `discovered_when`     | `{"lead_completed":"criminal_organizations"}`  |
| `investigate_again`   | `always`                                       |
| `on_completion`       | `[{"create_mission_site":"apprehend_member"}]` |

### Locate Exalt outpost

Source: `content/compendium/compendium_articles/locate_exalt_outpost_article.yaml`

The [handler](#handler)'s reports [lead](#leads) to a small fortified base where the cult gathers its people.

| `locate_exalt_outpost` | Lead                                               |
| ---------------------- | -------------------------------------------------- |
| `name`                 | `Locate Exalt outpost`                             |
| `description`          | `Trace the handler's reports to an Exalt outpost.` |
| `faction`              | `exalt`                                            |
| `required_progress`    | `20`                                               |
| `discovered_when`      | `{"lead_completed":"interrogate_exalt_handler"}`   |
| `investigate_again`    | `always`                                           |
| `on_completion`        | `[{"create_mission_site":"raid_outpost"}]`         |

### Locate Exalt regional stronghold

Source: `content/compendium/compendium_articles/locate_exalt_regional_stronghold_article.yaml`

The [commander](#commander) has given up a fortress where a [high commander](#high-commander) rules a whole region.

| `locate_exalt_regional_stronghold` | Lead                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `name`                             | `Locate Exalt regional stronghold`                           |
| `description`                      | `Find the stronghold from which Exalt holds a whole region.` |
| `faction`                          | `exalt`                                                      |
| `required_progress`                | `50`                                                         |
| `discovered_when`                  | `{"lead_completed":"interrogate_exalt_commander"}`           |
| `investigate_again`                | `always`                                                     |
| `on_completion`                    | `[{"create_mission_site":"raid_regional_stronghold"}]`       |

### Locate Exalt safehouse

Source: `content/compendium/compendium_articles/locate_exalt_safehouse_article.yaml`

The profile of [Exalt](#exalt) points to a place it uses to hide people and supplies. Somewhere in the city, Exalt keeps a safehouse.

| `locate_exalt_safehouse` | Lead                                                   |
| ------------------------ | ------------------------------------------------------ |
| `name`                   | `Locate Exalt safehouse`                               |
| `description`            | `Use the Exalt profile to find one of its safehouses.` |
| `faction`                | `exalt`                                                |
| `required_progress`      | `10`                                                   |
| `discovered_when`        | `{"lead_completed":"exalt_profile"}`                   |
| `investigate_again`      | `always`                                               |
| `on_completion`          | `[{"create_mission_site":"raid_safehouse"}]`           |

### Locate Red Dawn HQ

Source: `content/compendium/compendium_articles/locate_red_dawn_hq_article.yaml`

Everything the [high commander](#high-commander) revealed points to the headquarters of [Red Dawn](#red-dawn) itself.

| `locate_red_dawn_hq` | Lead                                                       |
| -------------------- | ---------------------------------------------------------- |
| `name`               | `Locate Red Dawn HQ`                                       |
| `description`        | `Learn where the leader of Red Dawn hides.`                |
| `faction`            | `red_dawn`                                                 |
| `required_progress`  | `80`                                                       |
| `discovered_when`    | `{"lead_completed":"interrogate_red_dawn_high_commander"}` |
| `on_completion`      | `[{"create_mission_site":"raid_hq"}]`                      |

### Locate Red Dawn logistics hub

Source: `content/compendium/compendium_articles/locate_red_dawn_logistics_hub_article.yaml`

Arms, [money](#money-and-funding) and people all pass through one hub. Cut it and the cult will starve.

| `locate_red_dawn_logistics_hub` | Lead                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `name`                          | `Locate Red Dawn logistics hub`                             |
| `description`                   | `Find the hub through which Red Dawn moves arms and money.` |
| `faction`                       | `red_dawn`                                                  |
| `required_progress`             | `30`                                                        |
| `discovered_when`               | `{"lead_completed":"interrogate_red_dawn_lieutenant"}`      |
| `investigate_again`             | `always`                                                    |
| `on_completion`                 | `[{"create_mission_site":"raid_logistics_hub"}]`            |

### Locate Red Dawn member

Source: `content/compendium/compendium_articles/locate_red_dawn_member_article.yaml`

The first thread to pull: find a [Red Dawn](#red-dawn) member who can be brought in for questioning.

| `locate_red_dawn_member` | Lead                                             |
| ------------------------ | ------------------------------------------------ |
| `name`                   | `Locate Red Dawn member`                         |
| `description`            | `Track down a Red Dawn member for apprehension.` |
| `faction`                | `red_dawn`                                       |
| `required_progress`      | `5`                                              |
| `discovered_when`        | `{"lead_completed":"criminal_organizations"}`    |
| `investigate_again`      | `always`                                         |
| `on_completion`          | `[{"create_mission_site":"apprehend_member"}]`   |

### Locate Red Dawn outpost

Source: `content/compendium/compendium_articles/locate_red_dawn_outpost_article.yaml`

The [handler](#handler)'s reports [lead](#leads) to a small fortified base where the cult gathers its people.

| `locate_red_dawn_outpost` | Lead                                                 |
| ------------------------- | ---------------------------------------------------- |
| `name`                    | `Locate Red Dawn outpost`                            |
| `description`             | `Trace the handler's reports to a Red Dawn outpost.` |
| `faction`                 | `red_dawn`                                           |
| `required_progress`       | `20`                                                 |
| `discovered_when`         | `{"lead_completed":"interrogate_red_dawn_handler"}`  |
| `investigate_again`       | `always`                                             |
| `on_completion`           | `[{"create_mission_site":"raid_outpost"}]`           |

### Locate Red Dawn regional stronghold

Source: `content/compendium/compendium_articles/locate_red_dawn_regional_stronghold_article.yaml`

The [commander](#commander) has given up a fortress where a [high commander](#high-commander) rules a whole region.

| `locate_red_dawn_regional_stronghold` | Lead                                                            |
| ------------------------------------- | --------------------------------------------------------------- |
| `name`                                | `Locate Red Dawn regional stronghold`                           |
| `description`                         | `Find the stronghold from which Red Dawn holds a whole region.` |
| `faction`                             | `red_dawn`                                                      |
| `required_progress`                   | `50`                                                            |
| `discovered_when`                     | `{"lead_completed":"interrogate_red_dawn_commander"}`           |
| `investigate_again`                   | `always`                                                        |
| `on_completion`                       | `[{"create_mission_site":"raid_regional_stronghold"}]`          |

### Locate Red Dawn safehouse

Source: `content/compendium/compendium_articles/locate_red_dawn_safehouse_article.yaml`

The profile of [Red Dawn](#red-dawn) points to a place it uses to hide people and supplies. Somewhere in the city, Red Dawn keeps a safehouse.

| `locate_red_dawn_safehouse` | Lead                                                      |
| --------------------------- | --------------------------------------------------------- |
| `name`                      | `Locate Red Dawn safehouse`                               |
| `description`               | `Use the Red Dawn profile to find one of its safehouses.` |
| `faction`                   | `red_dawn`                                                |
| `required_progress`         | `10`                                                      |
| `discovered_when`           | `{"lead_completed":"red_dawn_profile"}`                   |
| `investigate_again`         | `always`                                                  |
| `on_completion`             | `[{"create_mission_site":"raid_safehouse"}]`              |

### Peace on Earth

Source: `content/compendium/compendium_articles/peace_on_earth_article.yaml`

Every cult is gone. One last [operation](#faction-operations) remains, and it will decide whether the peace lasts.

| `peace_on_earth` | Lead |
| --- | --- |
| `name` | `Peace on Earth` |
| `description` | `With every cult terminated, coordinate the final operation that secures a lasting peace.` |
| `required_progress` | `30` |
| `discovered_when` | `{"all":[{"lead_completed":"terminate_red_dawn"},{"lead_completed":"terminate_exalt"},{"lead_completed":"terminate_black_lotus"}]}` |
| `on_completion` | `[{"win_campaign":true}]` |

### Red Dawn profile

Source: `content/compendium/compendium_articles/red_dawn_profile_article.yaml`

Scraps of testimony and surveillance come together into a picture of how [Red Dawn](#red-dawn) is organized and where it hides.

| `red_dawn_profile`  | Lead                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `name`              | `Red Dawn profile`                                                |
| `description`       | `Compile what is known of Red Dawn into an intelligence profile.` |
| `faction`           | `red_dawn`                                                        |
| `required_progress` | `5`                                                               |
| `discovered_when`   | `{"lead_completed":"interrogate_red_dawn_member"}`                |

### Terminate Black Lotus

Source: `content/compendium/compendium_articles/terminate_black_lotus_article.yaml`

With the leader's secrets in hand, strike every remaining part of the cult at once and end it for good.

| `terminate_black_lotus` | Lead                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `name`                  | `Terminate Black Lotus`                                    |
| `description`           | `Run the final operation that ends Black Lotus for good.`  |
| `faction`               | `black_lotus`                                              |
| `required_progress`     | `30`                                                       |
| `discovered_when`       | `{"lead_completed":"interrogate_black_lotus_cult_leader"}` |
| `on_completion`         | `[{"eliminate_faction":true}]`                             |

### Terminate Exalt

Source: `content/compendium/compendium_articles/terminate_exalt_article.yaml`

With the leader's secrets in hand, strike every remaining part of the cult at once and end it for good.

| `terminate_exalt`   | Lead                                                 |
| ------------------- | ---------------------------------------------------- |
| `name`              | `Terminate Exalt`                                    |
| `description`       | `Run the final operation that ends Exalt for good.`  |
| `faction`           | `exalt`                                              |
| `required_progress` | `30`                                                 |
| `discovered_when`   | `{"lead_completed":"interrogate_exalt_cult_leader"}` |
| `on_completion`     | `[{"eliminate_faction":true}]`                       |

### Terminate Red Dawn

Source: `content/compendium/compendium_articles/terminate_red_dawn_article.yaml`

With the leader's secrets in hand, strike every remaining part of the cult at once and end it for good.

| `terminate_red_dawn` | Lead                                                    |
| -------------------- | ------------------------------------------------------- |
| `name`               | `Terminate Red Dawn`                                    |
| `description`        | `Run the final operation that ends Red Dawn for good.`  |
| `faction`            | `red_dawn`                                              |
| `required_progress`  | `30`                                                    |
| `discovered_when`    | `{"lead_completed":"interrogate_red_dawn_cult_leader"}` |
| `on_completion`      | `[{"eliminate_faction":true}]`                          |

## Subject articles: MissionSiteArchetype

### Apprehend member

Source: `content/compendium/compendium_articles/apprehend_member_article.yaml`

A cult member has been found, lightly guarded. Bring the member in before the trail goes cold.

| `apprehend_member` | MissionSiteArchetype           |
| ------------------ | ------------------------------ |
| `kind`             | `initiative`                   |
| `name`             | `Apprehend member`             |
| `first_win_phrase` | `first apprehension`           |
| `expires_in_turns` | `3`                            |
| `enemies`          | `{"initiate":2,"operative":1}` |
| `on_win`           | `[{"money":50}]`               |

### Counter civilian terror

Source: `content/compendium/compendium_articles/counter_civilian_terror_article.yaml`

A cult is bringing terror to the streets of a city. End it before the city breaks.

| `counter_civilian_terror` | MissionSiteArchetype |
| --- | --- |
| `kind` | `response` |
| `name` | `Counter civilian terror` |
| `operation_level` | `4` |
| `expires_in_turns` | `1` |
| `enemies` | `{"initiate":30,"operative":24,"soldier":16,"elite":2,"handler":10,"lieutenant":4,"commander":1}` |

### Defend against HQ assault

Source: `content/compendium/compendium_articles/defend_against_hq_assault_article.yaml`

A cult has found your headquarters and is coming with everything it has. If the headquarters falls, the Campaign is lost.

| `defend_against_hq_assault` | MissionSiteArchetype |
| --- | --- |
| `kind` | `response` |
| `name` | `Defend against HQ assault` |
| `operation_level` | `5` |
| `expires_in_turns` | `3` |
| `enemies` | `{"initiate":30,"operative":20,"soldier":20,"elite":10,"handler":10,"lieutenant":4,"commander":4,"high_commander":1}` |

### Defend against office raid

Source: `content/compendium/compendium_articles/defend_against_office_raid_article.yaml`

A cult is about to storm one of your field offices. Hold it.

| `defend_against_office_raid` | MissionSiteArchetype                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| `kind`                       | `response`                                                            |
| `name`                       | `Defend against office raid`                                          |
| `operation_level`            | `2`                                                                   |
| `expires_in_turns`           | `1`                                                                   |
| `enemies`                    | `{"initiate":3,"operative":3,"soldier":4,"handler":2,"lieutenant":1}` |

### Foil bioweapon release

Source: `content/compendium/compendium_articles/foil_bioweapon_release_article.yaml`

A cult is ready to release a plague it has bred. If it gets out, the Campaign is lost.

| `foil_bioweapon_release` | MissionSiteArchetype |
| --- | --- |
| `kind` | `response` |
| `name` | `Foil bioweapon release` |
| `operation_level` | `5` |
| `expires_in_turns` | `3` |
| `enemies` | `{"operative":30,"soldier":24,"elite":8,"handler":6,"lieutenant":6,"commander":3,"high_commander":1}` |

### Foil business extortion

Source: `content/compendium/compendium_articles/foil_business_extortion_article.yaml`

A cult is squeezing local businesses for [money](#money-and-funding). Break the racket before the owners pay.

| `foil_business_extortion` | MissionSiteArchetype                       |
| ------------------------- | ------------------------------------------ |
| `kind`                    | `response`                                 |
| `name`                    | `Foil business extortion`                  |
| `operation_level`         | `1`                                        |
| `expires_in_turns`        | `1`                                        |
| `enemies`                 | `{"initiate":6,"operative":2,"handler":1}` |

### Foil financial heist

Source: `content/compendium/compendium_articles/foil_financial_heist_article.yaml`

A cult is after a fortune that would fund it for years. Stop the heist before the [money](#money-and-funding) is gone.

| `foil_financial_heist` | MissionSiteArchetype                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| `kind`                 | `response`                                                              |
| `name`                 | `Foil financial heist`                                                  |
| `operation_level`      | `3`                                                                     |
| `expires_in_turns`     | `1`                                                                     |
| `enemies`              | `{"initiate":12,"operative":10,"soldier":4,"handler":6,"lieutenant":1}` |

### Foil infrastructure attack

Source: `content/compendium/compendium_articles/foil_infrastructure_attack_article.yaml`

A cult is about to strike a power grid or a water supply. Whole cities depend on stopping it.

| `foil_infrastructure_attack` | MissionSiteArchetype |
| --- | --- |
| `kind` | `response` |
| `name` | `Foil infrastructure attack` |
| `operation_level` | `3` |
| `expires_in_turns` | `1` |
| `enemies` | `{"initiate":8,"operative":8,"soldier":6,"elite":2,"handler":4,"lieutenant":2,"commander":1}` |

### Foil nuclear plant bombing

Source: `content/compendium/compendium_articles/foil_nuclear_plant_bombing_article.yaml`

A cult means to blow up a nuclear plant. If it blows, a whole region is poisoned.

| `foil_nuclear_plant_bombing` | MissionSiteArchetype                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `kind`                       | `response`                                                                         |
| `name`                       | `Foil nuclear plant bombing`                                                       |
| `operation_level`            | `4`                                                                                |
| `expires_in_turns`           | `1`                                                                                |
| `enemies`                    | `{"operative":16,"soldier":16,"elite":6,"handler":4,"lieutenant":4,"commander":1}` |

### Foil prison break

Source: `content/compendium/compendium_articles/foil_prison_break_article.yaml`

A cult is storming a prison to free its captured fighters. If they walk out, the region burns.

| `foil_prison_break` | MissionSiteArchetype |
| --- | --- |
| `kind` | `response` |
| `name` | `Foil prison break` |
| `operation_level` | `4` |
| `expires_in_turns` | `1` |
| `enemies` | `{"initiate":24,"operative":8,"soldier":12,"elite":4,"handler":6,"lieutenant":3,"commander":1}` |

### Foil recruitment push

Source: `content/compendium/compendium_articles/foil_recruitment_push_article.yaml`

A cult is recruiting openly. Break up the rally before the cult grows.

| `foil_recruitment_push` | MissionSiteArchetype           |
| ----------------------- | ------------------------------ |
| `kind`                  | `response`                     |
| `name`                  | `Foil recruitment push`        |
| `operation_level`       | `1`                            |
| `expires_in_turns`      | `1`                            |
| `enemies`               | `{"initiate":4,"operative":1}` |

### Foil sabotage

Source: `content/compendium/compendium_articles/foil_sabotage_article.yaml`

A cult plans to strike critical infrastructure. Stop the saboteurs before the blast.

| `foil_sabotage`    | MissionSiteArchetype                                   |
| ------------------ | ------------------------------------------------------ |
| `kind`             | `response`                                             |
| `name`             | `Foil sabotage`                                        |
| `operation_level`  | `2`                                                    |
| `expires_in_turns` | `1`                                                    |
| `enemies`          | `{"initiate":2,"operative":2,"soldier":2,"handler":1}` |

### Foil supply theft

Source: `content/compendium/compendium_articles/foil_supply_theft_article.yaml`

A cult is stealing supplies to arm its members. Catch the thieves before the goods disappear.

| `foil_supply_theft` | MissionSiteArchetype           |
| ------------------- | ------------------------------ |
| `kind`              | `response`                     |
| `name`              | `Foil supply theft`            |
| `operation_level`   | `1`                            |
| `expires_in_turns`  | `1`                            |
| `enemies`           | `{"initiate":4,"operative":3}` |

### Foil VIP assassination

Source: `content/compendium/compendium_articles/foil_vip_assassination_article.yaml`

A cult has marked a public figure for death. Reach the killers before they reach their mark.

| `foil_vip_assassination` | MissionSiteArchetype                       |
| ------------------------ | ------------------------------------------ |
| `kind`                   | `response`                                 |
| `name`                   | `Foil VIP assassination`                   |
| `operation_level`        | `2`                                        |
| `expires_in_turns`       | `1`                                        |
| `enemies`                | `{"soldier":2,"handler":4,"lieutenant":1}` |

### Foil warhead launch

Source: `content/compendium/compendium_articles/foil_warhead_launch_article.yaml`

A cult has seized a nuclear warhead and the means to launch it. If it flies, the Campaign is lost.

| `foil_warhead_launch` | MissionSiteArchetype                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| `kind`                | `response`                                                                  |
| `name`                | `Foil warhead launch`                                                       |
| `operation_level`     | `5`                                                                         |
| `expires_in_turns`    | `3`                                                                         |
| `enemies`             | `{"soldier":24,"elite":16,"lieutenant":6,"commander":3,"high_commander":1}` |

### Intercept arms deal

Source: `content/compendium/compendium_articles/intercept_arms_deal_article.yaml`

A cult is buying military weapons. Hit the exchange before the shipment changes hands.

| `intercept_arms_deal` | MissionSiteArchetype                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| `kind`                | `response`                                                             |
| `name`                | `Intercept arms deal`                                                  |
| `operation_level`     | `3`                                                                    |
| `expires_in_turns`    | `1`                                                                    |
| `enemies`             | `{"initiate":4,"operative":8,"soldier":10,"handler":4,"lieutenant":3}` |

### Raid HQ

Source: `content/compendium/compendium_articles/raid_hq_article.yaml`

The final assault on the headquarters of a cult. Winning it puts the [Cult leader](#cult-leader) in your hands.

| `raid_hq`          | MissionSiteArchetype                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `kind`             | `initiative`                                                                                |
| `name`             | `Raid HQ`                                                                                   |
| `first_win_phrase` | `first successful HQ raid`                                                                  |
| `expires_in_turns` | `3`                                                                                         |
| `enemies`          | `{"soldier":32,"elite":12,"lieutenant":6,"commander":4,"high_commander":2,"cult_leader":1}` |
| `on_win`           | `[{"money":100000},{"funding":300},{"panic":-20}]`                                          |

### Raid logistics hub

Source: `content/compendium/compendium_articles/raid_logistics_hub_article.yaml`

The hub that keeps the cult supplied. Taking it will hurt the cult for a long time.

| `raid_logistics_hub` | MissionSiteArchetype |
| --- | --- |
| `kind` | `initiative` |
| `name` | `Raid logistics hub` |
| `first_win_phrase` | `first successful logistics hub raid` |
| `expires_in_turns` | `3` |
| `enemies` | `{"initiate":6,"operative":10,"soldier":6,"elite":2,"handler":4,"lieutenant":2,"commander":1}` |
| `on_win` | `[{"money":10000},{"funding":60},{"panic":-5}]` |

### Raid outpost

Source: `content/compendium/compendium_articles/raid_outpost_article.yaml`

A fortified outpost where the cult gathers its people. Expect a determined defence.

| `raid_outpost`     | MissionSiteArchetype                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `kind`             | `initiative`                                                          |
| `name`             | `Raid outpost`                                                        |
| `first_win_phrase` | `first successful outpost raid`                                       |
| `expires_in_turns` | `3`                                                                   |
| `enemies`          | `{"initiate":4,"operative":8,"soldier":2,"handler":3,"lieutenant":1}` |
| `on_win`           | `[{"money":4000},{"funding":30},{"panic":-2}]`                        |

### Raid regional stronghold

Source: `content/compendium/compendium_articles/raid_regional_stronghold_article.yaml`

A fortress that a [high commander](#high-commander) rules like a small kingdom. Bring everything you have.

| `raid_regional_stronghold` | MissionSiteArchetype                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| `kind`                     | `initiative`                                                               |
| `name`                     | `Raid regional stronghold`                                                 |
| `first_win_phrase`         | `first successful regional stronghold raid`                                |
| `expires_in_turns`         | `3`                                                                        |
| `enemies`                  | `{"soldier":24,"elite":6,"lieutenant":4,"commander":2,"high_commander":1}` |
| `on_win`                   | `[{"money":30000},{"funding":150},{"panic":-10}]`                          |

### Raid safehouse

Source: `content/compendium/compendium_articles/raid_safehouse_article.yaml`

Storm the safehouse of a cult before it is moved. Expect it to be well guarded.

| `raid_safehouse`   | MissionSiteArchetype                          |
| ------------------ | --------------------------------------------- |
| `kind`             | `initiative`                                  |
| `name`             | `Raid safehouse`                              |
| `first_win_phrase` | `first successful safehouse raid`             |
| `expires_in_turns` | `3`                                           |
| `enemies`          | `{"initiate":4,"operative":4,"handler":1}`    |
| `on_win`           | `[{"money":500},{"funding":10},{"panic":-1}]` |

## Subject articles: Upgrade

### Agent cap

Source: `content/compendium/compendium_articles/agent_cap_article.yaml`

Expands the barracks so that the Agency can employ more [Agents](#agents) at once.

| `agent_cap` | Upgrade     |
| ----------- | ----------- |
| `name`      | `Agent cap` |
| `price`     | `2000`      |
| `effect`    | `agent_cap` |
| `increment` | `20`        |

### Exhaustion recovery

Source: `content/compendium/compendium_articles/exhaustion_recovery_article.yaml`

Better quarters and rest rotations let every resting [Agent](#agents) shake off [exhaustion](#exhaustion) faster.

| `exhaustion_recovery` | Upgrade               |
| --------------------- | --------------------- |
| `name`                | `Exhaustion recovery` |
| `price`               | `1000`                |
| `effect`              | `exhaustion_recovery` |
| `increment`           | `1`                   |

### Health recovery

Source: `content/compendium/compendium_articles/health_recovery_article.yaml`

A better infirmary lets every [Agent](#agents) on [Recovery](#recovery) heal faster.

| `health_recovery` | Upgrade           |
| ----------------- | ----------------- |
| `name`            | `Health recovery` |
| `price`           | `1000`            |
| `effect`          | `health_recovery` |
| `increment`       | `1`               |

### Training cap

Source: `content/compendium/compendium_articles/training_cap_article.yaml`

Enlarges the [training](#training) grounds so that more [Agents](#agents) can be on Training at the same time.

| `training_cap` | Upgrade        |
| -------------- | -------------- |
| `name`         | `Training cap` |
| `price`        | `1000`         |
| `effect`       | `training_cap` |
| `increment`    | `10`           |

### Training skill gain

Source: `content/compendium/compendium_articles/training_skill_gain_article.yaml`

Better instructors and simulators make every [Agent](#agents) on [Training](#training) learn faster.

| `training_skill_gain` | Upgrade               |
| --------------------- | --------------------- |
| `name`                | `Training skill gain` |
| `price`               | `1000`                |
| `effect`              | `training_skill_gain` |
| `increment`           | `0.5`                 |

### Transport cap

Source: `content/compendium/compendium_articles/transport_cap_article.yaml`

Adds vehicles so that more [Agents](#agents) can be [deployed](#missions) to [Mission sites](#mission-sites) at the same time.

| `transport_cap` | Upgrade         |
| --------------- | --------------- |
| `name`          | `Transport cap` |
| `price`         | `1500`          |
| `effect`        | `transport_cap` |
| `increment`     | `8`             |

## Subject articles: Weapon

### Augmented laser rifle

Source: `content/compendium/compendium_articles/augmented_laser_rifle_article.yaml`

A [laser rifle](#laser-rifle) tuned past every safe limit, carried by the one person a cult trusts above all.

| `augmented_laser_rifle` | Weapon |
| --- | --- |
| `name` | `Augmented laser rifle` |
| `base_weapon_damage` | `32` |
| `shot` | `focused_laser_rifle` |
| `price` | `1000` |
| `ammo_type` | `laser_rifle_battery` |
| `unlocked_by` | `["interrogate_red_dawn_cult_leader","interrogate_exalt_cult_leader","interrogate_black_lotus_cult_leader"]` |

### Augmented rifle

Source: `content/compendium/compendium_articles/augmented_rifle_article.yaml`

A [rifle](#rifle) refitted with better sights, a heavier barrel, and stronger [rounds](#equipment-and-storage), carried by officers in the field.

| `augmented_rifle` | Weapon |
| --- | --- |
| `name` | `Augmented rifle` |
| `base_weapon_damage` | `16` |
| `shot` | `sighted_rifle` |
| `price` | `80` |
| `ammo_type` | `rifle_ammo` |
| `unlocked_by` | `["interrogate_red_dawn_lieutenant","interrogate_exalt_lieutenant","interrogate_black_lotus_lieutenant"]` |

### Basic pistol

Source: `content/compendium/compendium_articles/basic_pistol_article.yaml`

A cheap handgun handed to the newest recruits.

| `basic_pistol`       | Weapon         |
| -------------------- | -------------- |
| `name`               | `Basic pistol` |
| `base_weapon_damage` | `8`            |
| `shot`               | `light_pistol` |
| `price`              | `6`            |
| `ammo_type`          | `pistol_ammo`  |

### Combat pistol

Source: `content/compendium/compendium_articles/combat_pistol_article.yaml`

A full-size handgun built for a fight, with a larger magazine than a [basic pistol](#basic-pistol) and still easy to carry unseen. The Agency issues one to every [Agent](#agents) it [hires](#hiring-and-upkeep).

| `combat_pistol`      | Weapon          |
| -------------------- | --------------- |
| `name`               | `Combat pistol` |
| `base_weapon_damage` | `10`            |
| `shot`               | `heavy_pistol`  |
| `price`              | `10`            |
| `ammo_type`          | `pistol_ammo`   |

### Knife

Source: `content/compendium/compendium_articles/knife_article.yaml`

Every [Agent](#agents) carries one, and nobody can take it away. An Agent with no other weapon fights with it, and so does an Agent whose [rounds](#equipment-and-storage) run out in the middle of a [Combat](#combat).

| `knife`              | Weapon  |
| -------------------- | ------- |
| `name`               | `Knife` |
| `base_weapon_damage` | `5`     |
| `shot`               | `blade` |

See also: [Equipment and Storage](#equipment-and-storage)

### Laser pistol

Source: `content/compendium/compendium_articles/laser_pistol_article.yaml`

A handgun that fires a beam instead of a bullet, reserved for those a cult trusts most.

| `laser_pistol` | Weapon |
| --- | --- |
| `name` | `Laser pistol` |
| `base_weapon_damage` | `22` |
| `shot` | `laser_pistol` |
| `price` | `300` |
| `ammo_type` | `laser_pistol_battery` |
| `unlocked_by` | `["interrogate_red_dawn_commander","interrogate_exalt_commander","interrogate_black_lotus_commander"]` |

### Laser rifle

Source: `content/compendium/compendium_articles/laser_rifle_article.yaml`

A long-barrelled laser weapon, rare and devastating.

| `laser_rifle` | Weapon |
| --- | --- |
| `name` | `Laser rifle` |
| `base_weapon_damage` | `28` |
| `shot` | `laser_rifle` |
| `price` | `800` |
| `ammo_type` | `laser_rifle_battery` |
| `unlocked_by` | `["interrogate_red_dawn_high_commander","interrogate_exalt_high_commander","interrogate_black_lotus_high_commander"]` |

### Machine gun

Source: `content/compendium/compendium_articles/machine_gun_article.yaml`

A fast-firing automatic weapon issued to the best fighters of a cult.

| `machine_gun` | Weapon |
| --- | --- |
| `name` | `Machine gun` |
| `base_weapon_damage` | `20` |
| `shot` | `machine_gun` |
| `price` | `140` |
| `ammo_type` | `machine_gun_ammo` |
| `unlocked_by` | `["interrogate_red_dawn_commander","interrogate_exalt_commander","interrogate_black_lotus_commander"]` |

### Rifle

Source: `content/compendium/compendium_articles/rifle_article.yaml`

A reliable long gun for trained fighters.

| `rifle` | Weapon |
| --- | --- |
| `name` | `Rifle` |
| `base_weapon_damage` | `14` |
| `shot` | `rifle` |
| `price` | `30` |
| `ammo_type` | `rifle_ammo` |
| `unlocked_by` | `["interrogate_red_dawn_lieutenant","interrogate_exalt_lieutenant","interrogate_black_lotus_lieutenant"]` |
