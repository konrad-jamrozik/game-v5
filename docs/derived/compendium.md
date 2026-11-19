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

[Upgrades](#upgrades) are permanent improvements bought with [money](#money-and-funding). Each purchase raises one cap of the Agency, the [weapon damage](#damage) or [max health](#health) of every [Agent](#agents), or how fast every Agent trains, rests, or heals. An Upgrade can be bought again and again at the same price.

See also: [Upgrades](#upgrades) · [Money and funding](#money-and-funding)

### Fighting Missions

Source: `content/compendium/compendium_articles/guide_missions.yaml`

A [Mission site](#mission-sites) is a place where Enemies wait, and it expires after a few [turns](#turns). [Deploy](#missions) a team to it and the [Combat](#combat) is fought when the turn advances. A won Mission brings its rewards; a lost or ignored one can raise [Panic](#panic). [Tired](#exhaustion) [Agents](#agents) fight worse, so check exhaustion before you deploy, and compare your team's Combat rating with the Enemies'. Agents who survive a Mission gain [skill](#skill), win or lose.

See also: [Mission sites](#mission-sites) · [Missions](#missions) · [Combat](#combat) · [Retreat](#retreat)

### Following Leads

Source: `content/compendium/compendium_articles/guide_investigations.yaml`

Send [Agents](#agents) after a [Lead](#leads) and they form an [Investigation](#investigations), which gains progress each [turn](#turns). Partway through you learn roughly how much progress it needs. A completed Investigation reveals a [Mission site](#mission-sites). Taking Agents away loses progress, and taking them all away abandons the Investigation.

See also: [Leads](#leads) · [Investigations](#investigations)

### Keeping Panic down

Source: `content/compendium/compendium_articles/guide_panic.yaml`

[Panic](#panic) measures how frightened the world is. [Faction operations](#faction-operations) left unanswered raise it, and some won [Missions](#missions) bring it down. If Panic reaches its limit, the Campaign is lost, so answer the operations you can win. Eliminate every [Faction](#factions) to win.

See also: [Panic](#panic) · [Faction operations](#faction-operations) · [Winning and losing](#winning-and-losing)

### Putting Agents to work

Source: `content/compendium/compendium_articles/guide_agents.yaml`

Every [Agent](#agents) has one [Assignment](#assignments) at a time. On Standby it rests and waits for orders, [Contracting](#contracting) earns [money](#money-and-funding), [Training](#training) raises [skill](#skill), an [Investigation](#investigations) follows a [Lead](#leads), and a [Mission](#missions) fights at a [Mission site](#mission-sites). [Wounded](#recovery) Agents go to Recovery until they have healed. Sending an Agent away from base or calling it back costs a [turn](#turns) [in transit](#transit), so change Assignments with care, and let Agents rest before their [exhaustion](#exhaustion) builds up.

See also: [Assignments](#assignments) · [Transit](#transit) · [Exhaustion](#exhaustion)

## Mechanics articles

### Agents

Source: `content/compendium/compendium_articles/mechanics_agents.yaml`

Agents are the people of your Agency. Each one has [skill](#skill), [health](#health), and [exhaustion](#exhaustion), carries a weapon, and has one [Assignment](#assignments) at a time. You start with a small team and [hire](#hiring-and-upkeep) more as your [money](#money-and-funding) allows.

| Formulas            |                                                           |
| ------------------- | --------------------------------------------------------- |
| Starting team       | 4 Agents, ready for orders on the first [turn](#turns)    |
| A new Agent         | Skill 100, health 30, no exhaustion, armed with a Sidearm |
| A hired Agent       | Starts on Standby and arrives next turn                   |
| Killed or dismissed | The Agent is gone for good, and its skill with it         |

See also: [Skill](#skill) · [Health](#health) · [Exhaustion](#exhaustion) · [Assignments](#assignments) · [Hiring and upkeep](#hiring-and-upkeep) · [Field agent](#field-agent)

### Assignments

Source: `content/compendium/compendium_articles/mechanics_assignments.yaml`

Every [Agent](#agents) has exactly one Assignment: Standby, [Contracting](#contracting), [Training](#training), an [Investigation](#investigations), a [Mission](#missions), or [Recovery](#recovery). Standby and Training happen at your base; Contracting and Investigations happen away from it. Moving an Agent away from base or back costs a [turn](#turns) [in transit](#transit), so plan changes ahead.

| Formulas |  |
| --- | --- |
| Standby | The Agent rests and waits for orders |
| From Standby or Training | Switch to the other at once, go to Contracting or an Investigation, or deploy to a [Mission site](#mission-sites) |
| From Contracting or an Investigation | Can only be recalled to Standby |
| In transit, deployed, or on Recovery | Cannot be given orders |
| Starting Contracting, Training, or an Investigation | Needs [exhaustion](#exhaustion) of at most 30 |
| Dismissing | Only an Agent on Standby that is not in transit |

See also: [Contracting](#contracting) · [Training](#training) · [Investigations](#investigations) · [Missions](#missions) · [Recovery](#recovery) · [Transit](#transit)

### Combat

Source: `content/compendium/compendium_articles/mechanics_combat.yaml`

A Combat is fought in rounds. In each round every [Agent](#agents) attacks once, then every Enemy still able to fight attacks once. Attackers spread out over their opponents, and each prefers an opponent it clearly outclasses. The Combat ends when one side can no longer fight or your team [retreats](#retreat).

| Formulas |  |
| --- | --- |
| Chance to hit | A² ÷ (A² + D²), where A is the [effective skill](#skill) of the attacker and D that of the defender |
| Target | Among the opponents attacked least often this round, the one whose effective skill is nearest to 0.5 × that of the attacker, counting only those from 0.2 × to 0.8 × of it; effective skill is taken as it was when the round began |
| No such opponent | The opponent attacked least often this round |
| Taking cover | A [wounded](#recovery) opponent may stay out of reach of one attacker; the chance is the share of its [health](#health) it has lost |
| Each attack | +1 [exhaustion](#exhaustion) for the attacker and +1 for the defender, hit or miss |
| Incapacitated | Alive but unable to fight: effective skill at or below 0.1 × skill, or exhaustion of 100 or more |
| Combat rating | The effective skill of everyone on a side who is able to fight, added up |
| End of the Combat | After a round in which no Enemy is able to fight, no Agent is able to fight, or the team retreats |

See also: [Damage](#damage) · [Retreat](#retreat) · [Skill](#skill) · [Missions](#missions)

### Contracting

Source: `content/compendium/compendium_articles/mechanics_contracting.yaml`

Contracting sends an [Agent](#agents) out to work for [money](#money-and-funding). It is your steady income beside funding, and it pays a little more for a skilled Agent and a little less for a [tired](#exhaustion) one. An Agent on Contracting is away from base, so getting it back for a [Mission](#missions) takes a [turn](#turns).

| Formulas                      |                                                                         |
| ----------------------------- | ----------------------------------------------------------------------- |
| Income of one Agent each turn | 30 × (1 + ([effective skill](#skill) − 100) ÷ 500)                      |
| Total                         | The income of every Agent on Contracting is added up, then rounded down |
| Exhaustion                    | +1 each turn, after the income is paid                                  |
| Getting there and back        | One turn [in transit](#transit) each way, with no income                |

See also: [Money and funding](#money-and-funding) · [Exhaustion](#exhaustion) · [Transit](#transit)

### Damage

Source: `content/compendium/compendium_articles/mechanics_damage.yaml`

A hit removes [health](#health) from its target. How much depends on the weapon of the attacker, with some luck either way. [Upgrades](#upgrades) make the weapons of your [Agents](#agents) hit harder; an Enemy always deals the damage of the weapon it carries.

| Formulas |  |
| --- | --- |
| Damage of a hit | A whole number from weapon damage × (1 − 0.5), rounded up, to weapon damage × (1 + 0.5), rounded down; each is equally likely |
| Weapon damage of an Agent | That of its weapon, plus Upgrades |
| A miss | No damage |

See also: [Combat](#combat) · [Health](#health) · [Weapon damage](#weapon-damage) · [Pistol](#pistol) · [Sidearm](#sidearm) · [Rifle](#rifle) · [Battle rifle](#battle-rifle) · [Assault rifle](#assault-rifle) · [Heavy rifle](#heavy-rifle) · [Machine gun](#machine-gun)

### Exhaustion

Source: `content/compendium/compendium_articles/mechanics_exhaustion.yaml`

Exhaustion measures how tired an [Agent](#agents) is. Work and fighting raise it, and only rest on [Standby](#assignments) or [Recovery](#recovery) lowers it. A tired Agent works and fights worse, one that is too tired cannot start new work, and one that works on regardless is sent back to rest.

| Formulas |  |
| --- | --- |
| Each [turn](#turns) of [Contracting](#contracting) | +1 |
| Each turn of [Training](#training) | +1 |
| Each turn on an [Investigation](#investigations) | +1 |
| Each attack made in a [Combat](#combat) | +1, hit or miss |
| Each attack defended against | +1, hit or miss |
| Each [Mission](#missions) survived | +5, and +1 for each 1% of the team that was killed, rounded up |
| Each turn on Standby or Recovery | −5, plus [Upgrades](#upgrades), never below 0 |
| [In transit](#transit) or deployed | No rest |
| [Skill](#skill) penalty | −1% of skill for each point above 30 |
| New work can start at most at | 30; deploying to a [Mission site](#mission-sites) has no such limit |
| Work ends at | 70 or more: after that turn's work the Agent is sent to Standby |
| Unable to fight at | 100 or more |

See also: [Recovery](#recovery) · [Skill](#skill) · [Assignments](#assignments) · [Exhaustion recovery](#exhaustion-recovery)

### Faction operations

Source: `content/compendium/compendium_articles/mechanics_faction_operations.yaml`

From time to time a [Faction](#factions) carries out an operation. Each operation opens a [Mission site](#mission-sites) where you can stop it, for a few [turns](#turns) only. Stop it and you are rewarded; lose the [Mission](#missions) or let the Mission site expire and [Panic](#panic) rises.

| Formulas |  |
| --- | --- |
| Level | Each operation has a level, which sets the reward for stopping it and the penalty for failing |
| Stopped: the Mission is won | The reward of the level, e.g. [money](#money-and-funding) or funding |
| Not stopped: the Mission is lost or the Mission site expires | The penalty of the level, e.g. more Panic or less funding |
| Several at once | A new operation can begin while the Mission site of an earlier one is still open |

See also: [Factions](#factions) · [Mission sites](#mission-sites) · [Panic](#panic)

### Factions

Source: `content/compendium/compendium_articles/mechanics_factions.yaml`

Factions are the hostile groups you are fighting. Each acts on its own, grows more active the longer it survives, and carries out [operations](#faction-operations) that raise [Panic](#panic) if you do not stop them. Eliminate every Faction to win the Campaign.

| Formulas |  |
| --- | --- |
| Activity level | Sets how often a Faction carries out operations and how severe they are; it rises over time and never falls |
| Timing | When a Faction will next grow more active or carry out an operation is hidden |
| Eliminating a Faction | Win a [Mission](#missions) whose reward is the end of the Faction, e.g. the raid on its headquarters |
| Once eliminated | No more operations; its open [Mission sites](#mission-sites) are cancelled and its [Leads](#leads) are archived |
| Slowing a Faction | Nothing slows a Faction except eliminating it |

See also: [Faction operations](#faction-operations) · [Panic](#panic) · [Winning and losing](#winning-and-losing)

### Health

Source: `content/compendium/compendium_articles/mechanics_health.yaml`

Health is how much harm an [Agent](#agents) or an Enemy can still take. Hits in a [Combat](#combat) remove it, and an Agent whose health reaches zero is killed for good. An Agent that has lost health also fights worse until it has healed.

| Formulas |  |
| --- | --- |
| Max health of an Agent | 30, plus [Upgrades](#upgrades) |
| Health at zero | An Agent is killed; an Enemy is dead |
| Lost health | Lowers [effective skill](#skill) in proportion: half the health, half the skill |
| Healing | Only on [Recovery](#recovery), where every Agent that survives a [Mission](#missions) below max health is sent |
| Raising max health | An Upgrade raises the max health and the health of every Agent by the same amount, at once |

See also: [Recovery](#recovery) · [Damage](#damage) · [Skill](#skill) · [Max health](#max-health)

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

### Investigations

Source: `content/compendium/compendium_articles/mechanics_investigations.yaml`

An Investigation is a team of [Agents](#agents) following a [Lead](#leads). Each [turn](#turns) the team adds progress from its [skill](#skill), and when the progress reaches a hidden target the Investigation completes and reveals a [Mission site](#mission-sites). Pulling Agents out loses progress, and pulling them all out abandons the Investigation.

| Formulas |  |
| --- | --- |
| Progress each turn | (Effective skill of the whole team ÷ 100) × team efficiency, rounded down to hundredths |
| Team efficiency | n^0.8 ÷ n for n Agents at work: 1 for one Agent, and less for each Agent as the team grows |
| Target | From the required progress of the Lead up to 150% of it, set at the start and hidden |
| Assessment | At 25% of the required progress you learn the required progress and the range of the target |
| Removing Agents | Progress × (effective skill that stays ÷ effective skill before), rounded down |
| Removing every Agent | The Investigation is abandoned; a new one starts from zero |
| Completion | A Mission site appears, and the team goes to [Standby](#assignments), [in transit](#transit) |
| [Exhaustion](#exhaustion) | +1 for each Agent each turn of work |
| Joining | Agents are in transit for a turn before they add progress |

See also: [Leads](#leads) · [Mission sites](#mission-sites) · [Exhaustion](#exhaustion) · [Following Leads](#following-leads)

### Leads

Source: `content/compendium/compendium_articles/mechanics_leads.yaml`

A Lead is a trail your [Agents](#agents) can follow. An [Investigation](#investigations) that follows it to the end reveals a [Mission site](#mission-sites), and winning the [Mission](#missions) there can uncover the next Lead. You see only the Leads you have discovered.

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
| Enemies | Listed at the Mission site before you deploy, with their [Combat rating](#combat) |

See also: [Missions](#missions) · [Faction operations](#faction-operations) · [Leads](#leads)

### Missions

Source: `content/compendium/compendium_articles/mechanics_missions.yaml`

A Mission is your team's one attempt at a [Mission site](#mission-sites). You deploy [Agents](#agents) from base, the [Combat](#combat) is fought when the [turn](#turns) advances, and the Mission is won if no Enemy is left able to fight. Win or lose, the survivors come home [tired](#exhaustion) and a little more skilled.

| Formulas |  |
| --- | --- |
| Who can deploy | Agents on [Standby](#assignments) or [Training](#training), whatever their exhaustion |
| Transport cap | 4 Agents deployed at one time, over all Missions, plus [Upgrades](#upgrades) |
| Won | No Enemy is able to fight; the rewards of the Mission site apply |
| Lost | The team [retreats](#retreat), or no Agent is able to fight; no reward, and a [Faction operation](#faction-operations) that was not stopped applies its penalty |
| Exhaustion of survivors | +5, and +1 for each 1% of the team that was killed, rounded up |
| After the Combat | Survivors below [max health](#health) go to [Recovery](#recovery), the others to Standby; all are [in transit](#transit) for a turn |

See also: [Mission sites](#mission-sites) · [Combat](#combat) · [Retreat](#retreat) · [Skill gain](#skill-gain) · [Transport cap](#transport-cap)

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
| Changes | Counted in percentage points, added up once each [turn](#turns), and kept between 0% and 100% |

See also: [Faction operations](#faction-operations) · [Winning and losing](#winning-and-losing) · [Keeping Panic down](#keeping-panic-down)

### Recovery

Source: `content/compendium/compendium_articles/mechanics_recovery.yaml`

An [Agent](#agents) that comes back from a [Mission](#missions) with lost [health](#health) goes to Recovery and stays there until it is back at max health. You cannot send an Agent to Recovery or take it off early. A recovering Agent also rests, so its [exhaustion](#exhaustion) falls.

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
| The team retreats when both hold | Its Combat rating is below 0.5 × what it was at the start, and the Combat rating of the Enemies is at least 0.8 × that of the team now |
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

[Agents](#agents) get better by [Training](#training) and by living through [Missions](#missions). In a [Combat](#combat) an Agent learns from every attack it makes and from every attack made on it, and it learns more for surviving the Mission, most of all the first few times. An Agent killed in the Combat keeps nothing.

| Formulas                        |                                                                      |
| ------------------------------- | -------------------------------------------------------------------- |
| Each [turn](#turns) of Training | +1, plus [Upgrades](#upgrades)                                       |
| Each attack made that hits      | +4                                                                   |
| Each attack made that misses    | +2                                                                   |
| Each time the Agent is hit      | +1                                                                   |
| Each time the Agent is missed   | +2                                                                   |
| First Mission survived          | +30                                                                  |
| Second Mission survived         | +25                                                                  |
| Third Mission survived          | +20                                                                  |
| Every later Mission survived    | +15                                                                  |
| Won or lost                     | Survivors gain the same either way                                   |
| When it counts                  | The gain is added after the Combat, so it helps from the next job on |

See also: [Skill](#skill) · [Training](#training) · [Missions](#missions) · [Training skill gain](#training-skill-gain)

### Training

Source: `content/compendium/compendium_articles/mechanics_training.yaml`

Training raises an [Agent](#agents)'s [skill](#skill) a little every [turn](#turns). It happens at base, so an Agent on Training can be [deployed](#missions) to a [Mission site](#mission-sites) at once. Only as many Agents can train at one time as the Training cap allows, and a [tired](#exhaustion) Agent may learn nothing in a turn.

| Formulas |  |
| --- | --- |
| Skill gained each turn | +1, plus [Upgrades](#upgrades) |
| Chance to gain it | Certain up to 30 exhaustion; above it, 1% less likely for each further point |
| Exhaustion | +1 each turn |
| Training cap | 4 Agents, plus Upgrades |
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

Upgrades are permanent improvements bought with [money](#money-and-funding). Each purchase adds a fixed amount to one thing: a cap of the Agency, the [weapon damage](#damage) or [max health](#health) of every [Agent](#agents), or how fast every Agent trains, rests, or heals. An Upgrade can be bought any number of times.

| Formulas                                 |                                                                |
| ---------------------------------------- | -------------------------------------------------------------- |
| Price                                    | Fixed for each Upgrade; it never rises                         |
| Buying again                             | Every purchase adds the same amount, without limit             |
| Caps, weapon damage, and max health      | Raised at once                                                 |
| [Training](#training), rest, and healing | Faster from the next [turn](#turns)                            |
| Who benefits                             | Every Agent, including those [hired](#hiring-and-upkeep) later |

See also: [Agent cap](#agent-cap) · [Transport cap](#transport-cap) · [Training cap](#training-cap) · [Weapon damage](#weapon-damage) · [Max health](#max-health) · [Training skill gain](#training-skill-gain) · [Exhaustion recovery](#exhaustion-recovery) · [Health recovery](#health-recovery)

### Winning and losing

Source: `content/compendium/compendium_articles/mechanics_winning_and_losing.yaml`

You win the Campaign by eliminating every [Faction](#factions). You lose it if [Panic](#panic) reaches its limit or your [money](#money-and-funding) falls below zero. Both are checked at the end of every [turn](#turns), and a win counts first.

| Formulas              |                                |
| --------------------- | ------------------------------ |
| Victory               | Every Faction is eliminated    |
| Defeat by Panic       | Panic of 100% or more          |
| Defeat by money       | Money below 0 when a turn ends |
| Both in the same turn | Victory                        |

See also: [Factions](#factions) · [Panic](#panic) · [Money and funding](#money-and-funding)

## Subject articles: AgentArchetype

### Field agent

Source: `content/compendium/compendium_articles/field_agent_article.yaml`

The backbone of the Agency: a trained [operative](#operative) who can investigate, earn [money](#money-and-funding) on contract, train, or fight. Every [Agent](#agents) you [hire](#hiring-and-upkeep) starts as a Field agent and grows through [Training](#training) and the [Missions](#missions) it survives.

| `field_agent` | AgentArchetype |
| ------------- | -------------- |
| `name`        | `Field agent`  |
| `base_skill`  | `100`          |
| `base_health` | `30`           |
| `weapon`      | `sidearm`      |

## Subject articles: EnemyArchetype

### Commander

Source: `content/compendium/compendium_articles/commander_article.yaml`

A senior officer who directs the larger [operations](#faction-operations) of a cult, and fights as well as several [Soldiers](#soldier).

| `commander`   | EnemyArchetype |
| ------------- | -------------- |
| `name`        | `Commander`    |
| `base_skill`  | `300`          |
| `base_health` | `40`           |
| `weapon`      | `heavy_rifle`  |

### Cult leader

Source: `content/compendium/compendium_articles/cult_leader_article.yaml`

The heart of a cult, guarded in its headquarters. Only a strong, rested team should face the Cult leader.

| `cult_leader` | EnemyArchetype |
| ------------- | -------------- |
| `name`        | `Cult leader`  |
| `base_skill`  | `300`          |
| `base_health` | `40`           |
| `weapon`      | `heavy_rifle`  |

### Elite

Source: `content/compendium/compendium_articles/elite_article.yaml`

A hand-picked veteran, far more dangerous than a [Soldier](#soldier). Only well-trained [Agents](#agents) meet an Elite on even terms.

| `elite`       | EnemyArchetype  |
| ------------- | --------------- |
| `name`        | `Elite`         |
| `base_skill`  | `250`           |
| `base_health` | `40`            |
| `weapon`      | `assault_rifle` |

### Handler

Source: `content/compendium/compendium_articles/handler_article.yaml`

A junior officer who runs a cell of [Initiates](#initiate) and [Operatives](#operative).

| `handler`     | EnemyArchetype |
| ------------- | -------------- |
| `name`        | `Handler`      |
| `base_skill`  | `80`           |
| `base_health` | `25`           |
| `weapon`      | `sidearm`      |

### High commander

Source: `content/compendium/compendium_articles/high_commander_article.yaml`

One of the few who answer only to the [Cult leader](#cult-leader). A High commander is a match for a whole team of new [Agents](#agents).

| `high_commander` | EnemyArchetype   |
| ---------------- | ---------------- |
| `name`           | `High commander` |
| `base_skill`     | `500`            |
| `base_health`    | `50`             |
| `weapon`         | `machine_gun`    |

### Initiate

Source: `content/compendium/compendium_articles/initiate_article.yaml`

A new recruit of a hostile cult, with more zeal than [skill](#skill). Initiates are dangerous mainly in numbers.

| `initiate`    | EnemyArchetype |
| ------------- | -------------- |
| `name`        | `Initiate`     |
| `base_skill`  | `40`           |
| `base_health` | `20`           |
| `weapon`      | `pistol`       |

### Lieutenant

Source: `content/compendium/compendium_articles/lieutenant_article.yaml`

An officer who [leads](#leads) [Soldiers](#soldier) in the field, and fights a little better than those under command.

| `lieutenant`  | EnemyArchetype |
| ------------- | -------------- |
| `name`        | `Lieutenant`   |
| `base_skill`  | `140`          |
| `base_health` | `30`           |
| `weapon`      | `battle_rifle` |

### Operative

Source: `content/compendium/compendium_articles/operative_article.yaml`

A cult member trusted with real work. Operatives shoot straighter than [Initiates](#initiate) and stand beside them in most fights.

| `operative`   | EnemyArchetype |
| ------------- | -------------- |
| `name`        | `Operative`    |
| `base_skill`  | `60`           |
| `base_health` | `25`           |
| `weapon`      | `sidearm`      |

### Soldier

Source: `content/compendium/compendium_articles/soldier_article.yaml`

A seasoned fighter, roughly a match for a newly [hired](#hiring-and-upkeep) [Agent](#agents). Soldiers guard the places a [Faction](#factions) cannot afford to lose.

| `soldier`     | EnemyArchetype |
| ------------- | -------------- |
| `name`        | `Soldier`      |
| `base_skill`  | `120`          |
| `base_health` | `30`           |
| `weapon`      | `rifle`        |

## Subject articles: FactionArchetype

### Black Lotus

Source: `content/compendium/compendium_articles/black_lotus_article.yaml`

A ruthless cult that trades in fear and silence. Follow its members back to its safehouse and its headquarters, and a won raid on the headquarters ends Black Lotus for good.

| `black_lotus`            | FactionArchetype |
| ------------------------ | ---------------- |
| `name`                   | `Black Lotus`    |
| `initial_activity_level` | `faint`          |

### Exalt

Source: `content/compendium/compendium_articles/exalt_article.yaml`

A secretive cult that hides behind charity and patronage while it buys influence. Follow its members back to its safehouse and its headquarters, and a won raid on the headquarters ends Exalt for good.

| `exalt`                  | FactionArchetype |
| ------------------------ | ---------------- |
| `name`                   | `Exalt`          |
| `initial_activity_level` | `faint`          |

### Red Dawn

Source: `content/compendium/compendium_articles/red_dawn_article.yaml`

A violent cult that recruits in the shadows and grows bolder the longer it is left alone. Follow its members back to its safehouse and its headquarters, and a won raid on the headquarters ends Red Dawn for good.

| `red_dawn`               | FactionArchetype |
| ------------------------ | ---------------- |
| `name`                   | `Red Dawn`       |
| `initial_activity_level` | `faint`          |

## Subject articles: Lead

### Locate Black Lotus HQ

Source: `content/compendium/compendium_articles/locate_black_lotus_hq_article.yaml`

Documents seized at the safehouse point to the headquarters of [Black Lotus](#black-lotus) itself.

| `locate_black_lotus_hq` | Lead                                                                      |
| ----------------------- | ------------------------------------------------------------------------- |
| `name`                  | `Locate Black Lotus HQ`                                                   |
| `description`           | `Intelligence from the safehouse points to the Black Lotus headquarters.` |
| `faction`               | `black_lotus`                                                             |
| `required_progress`     | `10`                                                                      |
| `discovered_when`       | `{"mission_won":"raid_safehouse"}`                                        |
| `on_completion`         | `[{"create_mission_site":"raid_hq"}]`                                     |

### Locate Black Lotus member

Source: `content/compendium/compendium_articles/locate_black_lotus_member_article.yaml`

The first thread to pull: find a [Black Lotus](#black-lotus) member who can be brought in for questioning.

| `locate_black_lotus_member` | Lead                                                |
| --------------------------- | --------------------------------------------------- |
| `name`                      | `Locate Black Lotus member`                         |
| `description`               | `Track down a Black Lotus member for apprehension.` |
| `faction`                   | `black_lotus`                                       |
| `required_progress`         | `3`                                                 |
| `on_completion`             | `[{"create_mission_site":"apprehend_member"}]`      |

### Locate Black Lotus safehouse

Source: `content/compendium/compendium_articles/locate_black_lotus_safehouse_article.yaml`

The captured member has talked. Somewhere in the city, [Black Lotus](#black-lotus) keeps a safehouse.

| `locate_black_lotus_safehouse` | Lead                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `name`                         | `Locate Black Lotus safehouse`                          |
| `description`                  | `The captured member revealed a Black Lotus safehouse.` |
| `faction`                      | `black_lotus`                                           |
| `required_progress`            | `6`                                                     |
| `discovered_when`              | `{"mission_won":"apprehend_member"}`                    |
| `on_completion`                | `[{"create_mission_site":"raid_safehouse"}]`            |

### Locate Exalt HQ

Source: `content/compendium/compendium_articles/locate_exalt_hq_article.yaml`

Documents seized at the safehouse point to the headquarters of [Exalt](#exalt) itself.

| `locate_exalt_hq`   | Lead                                                                |
| ------------------- | ------------------------------------------------------------------- |
| `name`              | `Locate Exalt HQ`                                                   |
| `description`       | `Intelligence from the safehouse points to the Exalt headquarters.` |
| `faction`           | `exalt`                                                             |
| `required_progress` | `10`                                                                |
| `discovered_when`   | `{"mission_won":"raid_safehouse"}`                                  |
| `on_completion`     | `[{"create_mission_site":"raid_hq"}]`                               |

### Locate Exalt member

Source: `content/compendium/compendium_articles/locate_exalt_member_article.yaml`

The first thread to pull: find an [Exalt](#exalt) member who can be brought in for questioning.

| `locate_exalt_member` | Lead                                           |
| --------------------- | ---------------------------------------------- |
| `name`                | `Locate Exalt member`                          |
| `description`         | `Track down an Exalt member for apprehension.` |
| `faction`             | `exalt`                                        |
| `required_progress`   | `3`                                            |
| `on_completion`       | `[{"create_mission_site":"apprehend_member"}]` |

### Locate Exalt safehouse

Source: `content/compendium/compendium_articles/locate_exalt_safehouse_article.yaml`

The captured member has talked. Somewhere in the city, [Exalt](#exalt) keeps a safehouse.

| `locate_exalt_safehouse` | Lead                                               |
| ------------------------ | -------------------------------------------------- |
| `name`                   | `Locate Exalt safehouse`                           |
| `description`            | `The captured member revealed an Exalt safehouse.` |
| `faction`                | `exalt`                                            |
| `required_progress`      | `6`                                                |
| `discovered_when`        | `{"mission_won":"apprehend_member"}`               |
| `on_completion`          | `[{"create_mission_site":"raid_safehouse"}]`       |

### Locate Red Dawn HQ

Source: `content/compendium/compendium_articles/locate_red_dawn_hq_article.yaml`

Documents seized at the safehouse point to the headquarters of [Red Dawn](#red-dawn) itself.

| `locate_red_dawn_hq` | Lead                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `name`               | `Locate Red Dawn HQ`                                                   |
| `description`        | `Intelligence from the safehouse points to the Red Dawn headquarters.` |
| `faction`            | `red_dawn`                                                             |
| `required_progress`  | `10`                                                                   |
| `discovered_when`    | `{"mission_won":"raid_safehouse"}`                                     |
| `on_completion`      | `[{"create_mission_site":"raid_hq"}]`                                  |

### Locate Red Dawn member

Source: `content/compendium/compendium_articles/locate_red_dawn_member_article.yaml`

The first thread to pull: find a [Red Dawn](#red-dawn) member who can be brought in for questioning.

| `locate_red_dawn_member` | Lead                                             |
| ------------------------ | ------------------------------------------------ |
| `name`                   | `Locate Red Dawn member`                         |
| `description`            | `Track down a Red Dawn member for apprehension.` |
| `faction`                | `red_dawn`                                       |
| `required_progress`      | `3`                                              |
| `on_completion`          | `[{"create_mission_site":"apprehend_member"}]`   |

### Locate Red Dawn safehouse

Source: `content/compendium/compendium_articles/locate_red_dawn_safehouse_article.yaml`

The captured member has talked. Somewhere in the city, [Red Dawn](#red-dawn) keeps a safehouse.

| `locate_red_dawn_safehouse` | Lead                                                 |
| --------------------------- | ---------------------------------------------------- |
| `name`                      | `Locate Red Dawn safehouse`                          |
| `description`               | `The captured member revealed a Red Dawn safehouse.` |
| `faction`                   | `red_dawn`                                           |
| `required_progress`         | `6`                                                  |
| `discovered_when`           | `{"mission_won":"apprehend_member"}`                 |
| `on_completion`             | `[{"create_mission_site":"raid_safehouse"}]`         |

## Subject articles: MissionSiteArchetype

### Apprehend member

Source: `content/compendium/compendium_articles/apprehend_member_article.yaml`

A cult member has been found, lightly guarded. Bring the member in before the trail goes cold.

| `apprehend_member` | MissionSiteArchetype           |
| ------------------ | ------------------------------ |
| `kind`             | `initiative`                   |
| `name`             | `Apprehend member`             |
| `expires_in_turns` | `5`                            |
| `enemies`          | `{"initiate":2,"operative":1}` |
| `on_win`           | `[{"money":5},{"panic":-1}]`   |

### Foil recruitment push

Source: `content/compendium/compendium_articles/foil_recruitment_push_article.yaml`

A cult is recruiting openly. Break up the rally before the cult grows.

| `foil_recruitment_push` | MissionSiteArchetype           |
| ----------------------- | ------------------------------ |
| `kind`                  | `response`                     |
| `name`                  | `Foil recruitment push`        |
| `operation_level`       | `1`                            |
| `expires_in_turns`      | `3`                            |
| `enemies`               | `{"initiate":4,"operative":1}` |

### Foil sabotage

Source: `content/compendium/compendium_articles/foil_sabotage_article.yaml`

A cult plans to strike critical infrastructure. Stop the saboteurs before the blast.

| `foil_sabotage`    | MissionSiteArchetype                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `kind`             | `response`                                                            |
| `name`             | `Foil sabotage`                                                       |
| `operation_level`  | `2`                                                                   |
| `expires_in_turns` | `4`                                                                   |
| `enemies`          | `{"initiate":2,"operative":2,"soldier":2,"handler":1,"lieutenant":1}` |

### Raid HQ

Source: `content/compendium/compendium_articles/raid_hq_article.yaml`

The final assault on the headquarters of a cult. Winning it ends the cult for good.

| `raid_hq`          | MissionSiteArchetype                         |
| ------------------ | -------------------------------------------- |
| `kind`             | `initiative`                                 |
| `name`             | `Raid HQ`                                    |
| `expires_in_turns` | `20`                                         |
| `enemies`          | `{"initiate":6,"soldier":3,"cult_leader":1}` |
| `on_win`           | `[{"eliminate_faction":true}]`               |

### Raid safehouse

Source: `content/compendium/compendium_articles/raid_safehouse_article.yaml`

Storm the safehouse of a cult before it is moved. Expect it to be well guarded.

| `raid_safehouse`   | MissionSiteArchetype                         |
| ------------------ | -------------------------------------------- |
| `kind`             | `initiative`                                 |
| `name`             | `Raid safehouse`                             |
| `expires_in_turns` | `8`                                          |
| `enemies`          | `{"initiate":4,"operative":4,"handler":1}`   |
| `on_win`           | `[{"money":100},{"funding":5},{"panic":-2}]` |

## Subject articles: Upgrade

### Agent cap

Source: `content/compendium/compendium_articles/agent_cap_article.yaml`

Expands the barracks so that the Agency can employ more [Agents](#agents) at once.

| `agent_cap` | Upgrade     |
| ----------- | ----------- |
| `name`      | `Agent cap` |
| `price`     | `200`       |
| `effect`    | `agent_cap` |
| `increment` | `4`         |

### Exhaustion recovery

Source: `content/compendium/compendium_articles/exhaustion_recovery_article.yaml`

Better quarters and rest rotations let every resting [Agent](#agents) shake off [exhaustion](#exhaustion) faster.

| `exhaustion_recovery` | Upgrade               |
| --------------------- | --------------------- |
| `name`                | `Exhaustion recovery` |
| `price`               | `500`                 |
| `effect`              | `exhaustion_recovery` |
| `increment`           | `0.5`                 |

### Health recovery

Source: `content/compendium/compendium_articles/health_recovery_article.yaml`

A better infirmary lets every [Agent](#agents) on [Recovery](#recovery) heal faster.

| `health_recovery` | Upgrade           |
| ----------------- | ----------------- |
| `name`            | `Health recovery` |
| `price`           | `500`             |
| `effect`          | `health_recovery` |
| `increment`       | `0.2`             |

### Max health

Source: `content/compendium/compendium_articles/max_health_article.yaml`

Body armor and field medicine let every [Agent](#agents) take more harm before going down.

| `max_health` | Upgrade            |
| ------------ | ------------------ |
| `name`       | `Max health`       |
| `price`      | `500`              |
| `effect`     | `agent_max_health` |
| `increment`  | `1`                |

### Training cap

Source: `content/compendium/compendium_articles/training_cap_article.yaml`

Enlarges the [training](#training) grounds so that more [Agents](#agents) can be on Training at the same time.

| `training_cap` | Upgrade        |
| -------------- | -------------- |
| `name`         | `Training cap` |
| `price`        | `200`          |
| `effect`       | `training_cap` |
| `increment`    | `4`            |

### Training skill gain

Source: `content/compendium/compendium_articles/training_skill_gain_article.yaml`

Better instructors and simulators make every [Agent](#agents) on [Training](#training) learn faster.

| `training_skill_gain` | Upgrade               |
| --------------------- | --------------------- |
| `name`                | `Training skill gain` |
| `price`               | `500`                 |
| `effect`              | `training_skill_gain` |
| `increment`           | `0.1`                 |

### Transport cap

Source: `content/compendium/compendium_articles/transport_cap_article.yaml`

Adds vehicles so that more [Agents](#agents) can be [deployed](#missions) to [Mission sites](#mission-sites) at the same time.

| `transport_cap` | Upgrade         |
| --------------- | --------------- |
| `name`          | `Transport cap` |
| `price`         | `1000`          |
| `effect`        | `transport_cap` |
| `increment`     | `2`             |

### Weapon damage

Source: `content/compendium/compendium_articles/weapon_damage_article.yaml`

Better ammunition and gunsmithing make the weapons of every [Agent](#agents) hit harder.

| `weapon_damage` | Upgrade               |
| --------------- | --------------------- |
| `name`          | `Weapon damage`       |
| `price`         | `500`                 |
| `effect`        | `agent_weapon_damage` |
| `increment`     | `1`                   |

## Subject articles: Weapon

### Assault rifle

Source: `content/compendium/compendium_articles/assault_rifle_article.yaml`

A fast-firing long gun issued to the best fighters of a cult.

| `assault_rifle`      | Weapon          |
| -------------------- | --------------- |
| `name`               | `Assault rifle` |
| `base_weapon_damage` | `20`            |

### Battle rifle

Source: `content/compendium/compendium_articles/battle_rifle_article.yaml`

A full-power long gun carried by officers in the field.

| `battle_rifle`       | Weapon         |
| -------------------- | -------------- |
| `name`               | `Battle rifle` |
| `base_weapon_damage` | `16`           |

### Heavy rifle

Source: `content/compendium/compendium_articles/heavy_rifle_article.yaml`

A powerful weapon reserved for those a cult trusts most.

| `heavy_rifle`        | Weapon        |
| -------------------- | ------------- |
| `name`               | `Heavy rifle` |
| `base_weapon_damage` | `22`          |

### Machine gun

Source: `content/compendium/compendium_articles/machine_gun_article.yaml`

A heavy automatic weapon, rare and devastating.

| `machine_gun`        | Weapon        |
| -------------------- | ------------- |
| `name`               | `Machine gun` |
| `base_weapon_damage` | `28`          |

### Pistol

Source: `content/compendium/compendium_articles/pistol_article.yaml`

A cheap handgun handed to the newest recruits.

| `pistol`             | Weapon   |
| -------------------- | -------- |
| `name`               | `Pistol` |
| `base_weapon_damage` | `8`      |

### Rifle

Source: `content/compendium/compendium_articles/rifle_article.yaml`

A reliable long gun for trained fighters.

| `rifle`              | Weapon  |
| -------------------- | ------- |
| `name`               | `Rifle` |
| `base_weapon_damage` | `14`    |

### Sidearm

Source: `content/compendium/compendium_articles/sidearm_article.yaml`

A compact service handgun, easy to carry and easy to hide. [Upgrades](#upgrades) to [weapon damage](#damage) make it hit harder in [Agent](#agents) hands.

| `sidearm`            | Weapon    |
| -------------------- | --------- |
| `name`               | `Sidearm` |
| `base_weapon_damage` | `10`      |
