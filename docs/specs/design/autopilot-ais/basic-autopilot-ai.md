# Basic Autopilot AI

| Metadata | Value |
| --- | --- |
| Spec ID | BASICAI |
| Family | Autopilot AIs |
| Audience | AI designer, Implementer |
| Owns | How the Basic Autopilot AI measures the strength it needs, which Agents form its Strike team and which work, how it equips, deploys, and musters, which Leads it investigates, what it buys and sells and in which order, and the Tuning parameters it is built with. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Basic Autopilot AI is the [Autopilot AI](../foundation/engine-contract.md#principals-and-access) that a [Game build](../foundation/core-concepts.md#game-build-and-content) offers so that a [Campaign](../foundation/core-concepts.md#campaign-and-session) can be played without a human making every decision. Its goal is to grow strong enough to answer the [Factions](../mechanics/domain-model.md#factions) before their operations outgrow the Agency, because the Factions escalate on a clock the player cannot slow. It never sends a team that is likely to lose.

Its play follows from one idea: the Agency always has a next rung, and every decision closes the gap to it. The Strike goal is the stronger of the Threat, the strongest Faction operation a level above those recently seen, and the weakest Next rung, the next kind of Initiative Mission site to win against some Faction. The Strike team, the strongest Agents the Transport cap can carry, stays in base to answer it, and while it falls short, money buys it Weapons, Armors, and room for more Agents. Every other Agent researches several Leads at once or earns on Contracting.

A fixed [Turn routine](#turn-routine) applies this in each [Turn](../foundation/engine-contract.md#player-actions-and-turns). It decides each [Player action](../foundation/engine-contract.md#player-actions-and-turns) from the current [Player-visible information](../foundation/engine-contract.md#api-surfaces) alone and keeps no plan across Turns, within what [Autopilot](../foundation/autopilot.md) lets any Autopilot AI receive.

# Glossary

| Term | Definition |
| --- | --- |
| Basic Autopilot AI | The [Autopilot AI](../foundation/engine-contract.md#principals-and-access) described by this document. |
| Roster size | The number of [Serving](../mechanics/agents-spec.md#agent-statuses) Agents of the [Agency](../mechanics/domain-model.md#agency-and-agents), whatever their [Assignment](../mechanics/domain-model.md#agency-and-agents) and [Agent status](../mechanics/agents-spec.md#agent-statuses). |
| Agent order | The order in which the Basic Autopilot AI ranks Serving Agents for strength: the highest [base skill](../mechanics/agents-spec.md#combatant-attributes) first, among equal base skill the lower [Instance ID](../foundation/campaign-instances.md#glossary) first. |
| Rested rating | The [Combat rating](../mechanics/combat.md#combat-rating) a set of Agents would have fully rested and unhurt, with the Weapons and Armors they wear: each [Agent](../mechanics/domain-model.md#agency-and-agents)'s [effective skill](../mechanics/agents-spec.md#combatant-attributes) read as its base skill, rounded down. |
| Threat | The strongest [Combat rating](../mechanics/missions.md#player-visible-information) of the Enemies of a [MissionSiteArchetype](../mechanics/missions.md#missionsitearchetype) of kind `response` that serves the Threat level. The Threat level is the [Faction operation level](../mechanics/factions.md#glossary) Threat levels ahead above the highest one served by the [Response Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) created in the last Threat window [Turns](../foundation/engine-contract.md#player-actions-and-turns), read from the [Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) the [Campaign](../foundation/core-concepts.md#campaign-and-session) keeps, or above the lowest one while there is none, and the highest one when no level is that far above. The Threat looks ahead so that the Strike team is ready before the next level's operations arrive, since a Response Mission site expires within a few Turns. |
| Next rung | Of one [Faction](../mechanics/domain-model.md#factions) that is not [Eliminated](../mechanics/factions.md#glossary): the MissionSiteArchetype of kind `initiative` with the weakest [Combat rating](../mechanics/combat.md#combatant-condition-in-a-combat) of its Enemies that is stronger than every MissionSiteArchetype of kind `initiative` at which a [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) against that Faction is Won. A Won [Response Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) counts for no rung, so that answering a strong operation never skips the Faction's rungs and the [Leads](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) they discover. The weakest Next rung is the weakest of them over every such Faction. |
| Strike goal | The Combat rating the Strike team aims for: the stronger of the Threat and the Combat rating of the Enemies of the weakest Next rung, times the [Combat margin](#tuning-parameters). |
| Eligible Agent | A Serving Agent that is not on an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), [In transit](../mechanics/domain-model.md#agency-and-agents) to one included. |
| Strike team size | How many Agents the Strike goal asks for: the fewest first Eligible Agents in Agent order that reach the Strike goal with their Rested rating and number at least the Agents needed for the Enemies the Strike goal is set by; the [Transport cap](../mechanics/economy-and-upgrades.md#glossary) when no such number within it does. |
| Strike team | The first Eligible Agents in Agent order, as many as the Strike team size, but never more than the Transport cap, nor more than the Roster size less the [Contracting cap](../mechanics/economy-and-upgrades.md#glossary) and the Research team size, so that the Agency keeps its income however many Agents it loses. |
| Strength gap | Whether the Rested rating of the Strike team is below the Strike goal. |
| Required rating share | The least share of the Combat rating of a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s Enemies that a team's Combat rating must reach for the Basic Autopilot AI to deploy it there: the [Combat](../mechanics/domain-model.md#combat) margin plus the Loss margin step times the number of Lost Missions at Mission sites of the same MissionSiteArchetype. E.g., with the Game designer values, 120% before any such Lost Mission and 130% after two. |
| Winning team | A set of Agents whose Combat rating is at least the Required rating share of the Combat rating of a Mission site's Enemies, whose number is at least the number of those Enemies divided by Enemies per Agent, rounded up, and that the Transport cap [allows to deploy](../mechanics/missions.md#deploying-agents). |
| Projected Agent | An Agent on [Standby](../mechanics/agents-spec.md#assignments), [Training](../mechanics/agents-spec.md#assignments), or [Recovery](../mechanics/agents-spec.md#assignments) as it would be after the Recovery lookahead, i.e. after that many Advance turns of [Agent Recovery](../mechanics/agent-recovery.md) at the Agency's current rates, recovering only in the Advance turns in which [it would recover](../mechanics/agent-recovery.md#which-agents-recover). Its effective skill and whether it would be a [Deployable Agent](../mechanics/missions.md#glossary) are read from those projected values. |
| Muster | The team that the Basic Autopilot AI [gathers](#deploying-and-mustering) for an [Initiative Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that Deployable Agents alone cannot win yet, from Projected Agents and Contractors. |
| Contractor | A Serving Agent whose Assignment is [Contracting](../mechanics/agents-spec.md#assignments), In transit to it included. |
| Researcher | A Serving Agent whose Assignment is an Investigation, In transit to it included. |
| Free Agent | An Agent that is [Fit to start work](../mechanics/agents-spec.md#assignments), [At assignment](../mechanics/domain-model.md#agency-and-agents) on Standby or Training, and neither of the Strike team nor of the Muster: the Agents the roles may send to work. |
| Equipping plan | Which Weapon and which Armor each Serving Agent [is to wear](#equipping), with the rounds in [Storage](../mechanics/equipment.md#glossary) as they are. The Buying plan is the same with unlimited rounds of every [Unlocked](../mechanics/equipment.md#glossary) AmmoType. |
| Ammo need | Of an AmmoType: [`ammo_short_rounds_per_agent`](../mechanics/equipment.md#equipmentparameters) rounds for each Agent that a plan gives a Weapon of that AmmoType, i.e. what keeps the AmmoType from being [Ammo short](../mechanics/equipment.md#ammo-short). |
| Tuning parameter | One of [the values that the Basic Autopilot AI is built with](#tuning-parameters), e.g. the Combat margin. |
| Savings floor | The money the Basic Autopilot AI keeps unspent: the Savings floor Tuning parameter times the [projected upkeep](../mechanics/economy-and-upgrades.md#projected-income-and-upkeep) the Agency would have after the purchase. |

# Roles

Every Serving Agent has one role, and the Basic Autopilot AI moves an Agent between roles only as follows:

1. **Strike team:** it stays in base, on Standby, Training, or Recovery, or [Deployed](../mechanics/agents-spec.md#assignments). A Contractor that becomes a member of the Strike team, e.g. because a member was Killed, is recalled to Standby.
2. **Researchers:** Free Agents join Investigations, the highest [effective skill](../mechanics/agents-spec.md#combatant-attributes) first, so that the clock is answered by the most capable minds. The Basic Autopilot AI never assigns a Researcher elsewhere, so no Investigation it runs [loses progress](../mechanics/investigations.md#progress-loss) by its choice.
3. **Contractors:** Free Agents fill the [Contracting cap](../mechanics/economy-and-upgrades.md#glossary). A Contractor is recalled only to the Strike team or a Muster.
4. **Everyone else** rests, and trains while the [Training cap](../mechanics/economy-and-upgrades.md#glossary) has a place: first the Agents of the Strike team, then the others, the lowest base skill first.

Research and Contracting share the Free Agents in this order: one Investigation team first, so that research never stops; then Contracting up to its cap, because its money pays for everything else; then more Investigation teams, up to Most Investigations.

E.g., with a Roster size of 30, a Strike team of 10, a Research team size of 3, and a Contracting cap of 8, the 20 other Agents give 3 to research, 8 to Contracting, and the rest to further Investigations, while those not Fit to start work rest.

# Turn routine

During each Turn the Basic Autopilot AI makes its [Player actions](../foundation/engine-contract.md#player-actions-and-turns) in the following order, and then ends the Turn by [requesting Advance turn](../foundation/autopilot.md#autopilot-limits). After each Player action it starts again from step 1, so that each Player action is decided from the current [Player-visible information](../foundation/engine-contract.md#api-surfaces). When no step has a Player action left to make, e.g. when Autopilot is engaged again in a Turn it has already played through, its first request is Advance turn.

1. **Equip:** make the Agents wear the [Equipping plan](#equipping).
2. **Deploy and muster:** [deploy Winning teams to Mission sites and form at most one Muster](#deploying-and-mustering).
3. **Strike team:** recall a Contractor of the Strike team or of a Muster that is due.
4. **Research:** reinforce or start Investigations, as [Choosing Leads](#choosing-leads) says.
5. **Contract and train:** assign Free Agents to Contracting and to Training, as [Roles](#roles) says.
6. **Buy:** make the first [purchase that is due](#purchases).
7. **Sell:** sell every [Item](../mechanics/equipment.md#glossary) no Agent is to wear, beyond Spare Items of each, in one `sellItems`.

Equipping comes first because a team must leave with its gear; deploying comes before the roles because a Mission site expires, while every role can be filled on a later Turn.

When a Player action the Basic Autopilot AI attempts is rejected, it does not retry the same Player action in that Turn and continues with the next step, so a rejection cannot make it repeat itself until it fails.

## Equipping

The best gear goes to the strongest Agents, and an Agent carries a Weapon only when the Agency can feed it, because [a Combat rating reads the Weapon, never the Ammo](../mechanics/combat.md#combat-rating): a rifle without rounds is rated as a rifle but fights as the [Fallback Weapon](../mechanics/combat.md#ammo).

For Weapons, the Equipping plan takes every Weapon that a Serving Agent wears or Storage holds, from the highest `base_weapon_damage` down, and gives them out in Agent order. An Agent gets the best Weapon left whose AmmoType still has `ammo_short_rounds_per_agent` rounds in Storage for it on top of those of the Agents before it; otherwise the next best, and the Fallback Weapon when none qualifies. Armors are given out the same way, from the highest `base_armor` down, with no rounds to count. Agents beyond the Items keep the Fallback Weapon or the [Fallback Armor](../mechanics/equipment.md#glossary).

E.g., with 3 rifles, 25 rounds of rifle Ammo, and an `ammo_short_rounds_per_agent` of 10, the first two Agents get rifles and the third the best pistol whose rounds suffice; the third rifle waits in Storage for rounds.

The Basic Autopilot AI makes one [`equipAgent`](../mechanics/equipment.md#equipping-agents) for each Agent whose plan differs from what it wears, freeing an Item another Agent wears first when the plan moves it.

## Deploying and mustering

Step 2 considers every Active Mission site to which no team is deployed, in order of urgency: Response Mission sites first, the one whose loss would cost most first, i.e. one that loses the Campaign, then the largest [Panic](../mechanics/domain-model.md#campaign-standing) increase, then the largest funding loss; then Initiative Mission sites; and among equals, the one that expires soonest first.

1. **Deploy now:** when a Winning team of Deployable Agents can be formed for the Mission site from their current values, the Basic Autopilot AI deploys it. It takes the Deployable Agents with the lowest [exhaustion](../mechanics/agents-spec.md#combatant-attributes) first, among equal exhaustion the highest effective skill, so that rested Agents go first; when that order forms no Winning team within the Transport cap, the strongest first. Otherwise it deploys nobody rather than send a team likely to lose. Once a Winning team can be formed for a Response Mission site whose loss loses the Campaign, the Basic Autopilot AI sends in its place the strongest Deployable Agents the free Transport cap allows, because that loss can never be made good; to every other Mission site it sends the Winning team, so that the Agents it does not need stay free for the next one. The Required rating share rises with each Lost Mission so that a kind of Mission site the Combat rating underrates is attempted only with ever stronger teams.
2. **Muster:** for the most urgent Initiative Mission site to which no team can be deployed now, the Basic Autopilot AI forms a Muster when a Winning team of Projected Agents and Contractors can be formed whose last member becomes a Deployable Agent within the Recovery lookahead and in fewer Advance turns than the Mission site's Turns until expiration. It takes the Deployable Agents first, then the Projected Agents that become Deployable Agents soonest, and only then Contractors, so that it recalls as few Contractors as it can. A Response Mission site is never mustered for, because it expires before a recalled Agent arrives.
3. **Recall at the last moment:** step 3 recalls the Contractors of the Muster only when every other member is a Deployable Agent now or becomes one within one Advance turn, so that the recalled Agents earn until the team is ready.

An Agent of the Muster keeps the Assignment it has. Step 2 forms the Muster anew in every Turn.

## Choosing Leads

Research is what the clock runs against, so the Basic Autopilot AI runs several Investigations at once, up to Most Investigations, each with Research team size Agents. Step 4 first adds Free Agents to an Active Investigation whose team is smaller than that, and then starts an Investigation of the first [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that qualifies, in this order:

1. **A Lead that creates no Mission site**, always: the one that wins the Campaign, then the one that unlocks Contracting, then one that makes a Faction [Eliminated](../mechanics/domain-model.md#factions), then the others from the lowest [Initiative operation level](../mechanics/leads-and-progression.md#initiative-operation-level) up. Such a Lead advances progression by its completion alone, e.g. an interrogation unlocks gear for every Faction at once.
2. **A Lead that creates a Mission site at the Next rung of its Faction**, the lowest [Initiative operation level](../mechanics/leads-and-progression.md#glossary) first. Climbing every rung, rather than skipping one through a shortcut, matters because each first win raises the Contracting cap and discovers the next interrogation.
3. **A Lead that creates a Mission site at which a Mission against its Faction is already Won**, the highest Initiative operation level first, as a farm for money, funding, [Experience](../mechanics/agents-spec.md#growth), and Panic reduction. It qualifies only when no Lead of item 2 does, or when Panic is at least the Farming Panic.

A Lead that creates a Mission site qualifies only when the Strike team, as its Rested rating stands with the whole Transport cap, would be a Winning team for that MissionSiteArchetype's Enemies; while one such Investigation is Active or an Initiative Mission site is Active, no other is started, so that the Strike team answers one Mission site at a time. The Basic Autopilot AI judges a Lead only when it starts the Investigation.

# Purchases

The Basic Autopilot AI first keeps its Agents armed and its income growing, then buys strength while the Strength gap is open, then everything else. Step 6 makes the first purchase due in the following list, read again after every purchase:

1. **Ammo:** for each Unlocked AmmoType below the [Ammo](../mechanics/combat.md#ammo) reserve times its Ammo need under the Buying plan, the rounds that bring it there, all in one `buyItems`.
2. **Sidearms:** for every Agent the Buying plan leaves with the Fallback Weapon, the Unlocked Weapon with the highest `base_weapon_damage` whose `price` is at most the Sidearm price, in one `buyItems`.
3. **Hires and the [Agent cap](../mechanics/domain-model.md#agency-and-agents):** hire Agents, in one `hireAgents`, while the Roster size is below both the Agent cap and the wanted roster, and the planned net income stays at least the Least net income. When the Agent cap alone stops a hire, buy an Agent cap [Upgrade](../mechanics/domain-model.md#agency-and-agents).
4. **Health recovery:** while more than the Recovery share of the Serving Agents are on Recovery, a health recovery Upgrade, at most one a Turn, since its effect shows only from the next Advance turn.
5. **Strength:** while the Strength gap is open, the purchase that adds most Rested rating to the Strike team for its money: one Weapon or Armor for the member of the Strike team that gains most from it, with the rounds of its Ammo reserve for a Weapon counted in its cost; or, when the Strike team fills the Transport cap, a Transport cap Upgrade, with the hires that fill it counted in its cost and new Agents of the AgentArchetype counted in its gain.
6. **Other Upgrades:** a Training cap Upgrade while the Strike team is larger than the Training cap; otherwise the [Rate Upgrade](../mechanics/economy-and-upgrades.md#glossary) with the fewest acquisitions among those below their `max_acquisitions`, at most one Rate Upgrade a Turn, so that money left over after strength is not spent all at once on rates that change little.

The wanted roster is the Strike team size, one Investigation team per Lead being or qualifying to be investigated up to Most Investigations, and the Contracting cap, divided by one less the Rest share. The planned net income of a Roster size is the Agency's funding, plus `contracting_income_per_agent` for each Agent of that roster beyond the Rest share, the Strike team that roster would have, and one Investigation team, up to the Contracting cap, less `upkeep_per_agent` for each Agent. Hires that fill Contracting places therefore always pay, while hires for the Strike team and research stop where they would eat the income that buys strength.

A purchase is made only when money stays at or above the Savings floor after it, and a hire only when at least one Agent fits. When the first purchase due does not fit, the Basic Autopilot AI saves for it and buys nothing else that Turn.

E.g., in a new Campaign, the Strike goal is set by the Threat of the Faction operation level above the lowest, and Contracting is not yet unlocked. The Basic Autopilot AI keeps the strongest Agents as its Strike team, sends the others to investigate the Lead that unlocks Contracting, and hires only once Contractors can pay for the new Agents.

# Information

The Basic Autopilot AI decides each Player action from the current Player-visible information alone, within [what an Autopilot AI receives](../foundation/autopilot.md#what-an-autopilot-ai-receives), and keeps no plan across Turns. Every value above, e.g. the Threat, the Next rung, and the Strike team, is derived again from the current [World state](../foundation/engine-contract.md#player-actions-and-turns), the Missions and Mission sites the Campaign keeps, and the game data. It counts the Lost Missions of the Required rating share from the Missions the Campaign keeps, so it counts every Lost Mission alike, whoever deployed its team.

When several choices are equally good, it breaks the tie in a fixed order derived from Player-visible information, so that the same Player-visible information always yields the same Player actions.

# Tuning parameters

The [Game build](../foundation/core-concepts.md#game-build-and-content) offers the Basic Autopilot AI with one fixed set of Tuning parameters, and a player cannot change them.

| Tuning parameter | What it sets |
| --- | --- |
| Combat margin | The Required rating share while no Mission at a Mission site of the same MissionSiteArchetype is Lost, and the share of the Strike goal. |
| Loss margin step | What each such Lost Mission adds to the Required rating share. |
| Enemies per Agent | How many Enemies one Agent of a Winning team answers for; it may be fractional. |
| Recovery lookahead | The number of Advance turns over which a Projected Agent is projected. |
| Threat window | The number of Turns over which the Threat is read. |
| Threat levels ahead | How many Faction operation levels above those seen the Threat looks. |
| Research team size | The number of Agents each Investigation is given. |
| Most Investigations | The most Investigations the Basic Autopilot AI runs at once. |
| Farming Panic | The Panic, in percent, from which farming a Won rung qualifies even while a new rung does. |
| Ammo reserve | The rounds of each AmmoType bought, as a multiple of its Ammo need. |
| Sidearm price | The most a Weapon bought for an Agent with the Fallback Weapon may cost. |
| Spare Items | How many Items of each Weapon and Armor no Agent is to wear are kept rather than sold. |
| Rest share | The share of the roster expected to be resting or on Recovery, which the wanted roster adds. |
| Least net income | The least planned net income a hire may leave. |
| Recovery share | The share of the Serving Agents on Recovery above which a health recovery Upgrade is due. |
| Savings floor | The Savings floor, as a number of Turns of projected upkeep. |

## Game designer values

The Game designer sets the following values of the Game build.

| Tuning parameter | Value in the Game build |
| --- | --- |
| Combat margin | 120%. |
| Loss margin step | 5 percentage points. |
| Enemies per Agent | 2, e.g. a team of at least 5 Agents for 10 Enemies. |
| Recovery lookahead | 2 Advance turns. |
| Threat window | 20 Turns. |
| Threat levels ahead | 1. |
| Research team size | 3 Agents. |
| Most Investigations | 3. |
| Farming Panic | 30%. |
| Ammo reserve | 2, i.e. twice the rounds that keep an AmmoType from being [Ammo short](../mechanics/equipment.md#glossary). |
| Sidearm price | 10. |
| Spare Items | 4. |
| Rest share | 20%. |
| Least net income | 25 a Turn. |
| Recovery share | 20%. |
| Savings floor | 5 Turns of projected upkeep. |
