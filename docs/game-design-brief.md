# Game v5: Game Design Brief

# 1. Purpose and core concepts

This document defines the intended gameplay, strategic trade-offs, and foundational constraints for Game v5. It guides the detailed specifications, which define exact rules, formulas, Game Data Records (GDRs), and interfaces. Adapt the strategic ideas from [game-ts](https://github.com/konrad-jamrozik/game-ts/); exact formulas, balance, GDRs, and framework choices remain open.

The game is a **turn-based agency-management strategy game**, with primary inspiration coming from the OG X-COM and presentation inspiration from [A Dark Room](https://adarkroom.doublespeakgames.com/) and [Universal Paperclips](https://www.decisionproblem.com/paperclips/index2.html).

**Core loop:** allocate agents → investigate Leads → uncover Leads and Missions → deploy teams → resolve the turn → manage consequences and reinvest.

The main domain concepts are:

- **Campaign** - One full playthrough where the player wages a secret war against numerous enemies of humanity, organized into factions.
- **Agency** - The entity the player manages, including its agents, finances, bases, equipment, etc.
- **Agents:** - The centerpiece of the game. Player hires and sends agents on assignments and missions to combat enemy factions and protect humanity.
- **Leads:** - That can be investigated to advance the game: discover new information about enemy factions, research new technologies, uncover plots, and ultimately eliminate enemy factions.
- **Investigations:** - Agents can be assigned to investigate leads.
- **Initiative missions:** - Missions the player can send agents to, to gain resources, counter enemy factions and otherwise gain advantage.
- **Faction operations and Response missions:** - Enemy activity and the agency’s opportunities to intervene.
- **Combat:** automatic combat happening during missions.
- **Factions:** - Powerful enemy organizations that escalate, launch operations, can be suppressed, and can eventually be eliminated.
- **Economy and panic:** - money, recurring funding, upkeep, upgrades, and global pressure.
- **Turn reports and history:** - what the latest Advance turn did in full, and every earlier Turn in reduced form.

# 2. Key engine features

The game shall have few key engine features:

- Turn-based: player makes a set of actions during turn, then advances the turn.
- Full determinism - same inputs produce the same output. As such, if the player starts a campaign again with the same campaign seed, on the same version of the game, and does exactly the same actions, they will reach exactly the same result.
- Undo & redo: the player can undo and redo their actions, even beyond turns, back to a limited number of earlier turns.
- Headless CLI allowing to play the game directly through its engine API, without any GUI on top.
- Autopilot AIs: player can delegate multiple player actions, also across turns, to an AI player, to simulate the playthrough.

# 3. Strategic tension: what makes the game interesting

The player manages competing needs under uncertainty. Good play is about choosing commitments, maintaining readiness, and accepting some losses—not maximizing every activity simultaneously.

## A. Agent allocation: productivity versus readiness

Each agent can primarily:

- Earn money.
- Investigate a lead.
- Train.
- Fight.
- Recover.

Every Current assignment sacrifices alternatives. Training improves future effectiveness but produces neither immediate income nor investigative progress. Recovery restores useful capacity but temporarily removes an agent from productive work.

Changing tasks often incurs **transit downtime**. Frequent reshuffling can leave a large roster unavailable and accomplish less than a smaller, consistently assigned team. Transit rules should make commitment meaningful without assuming every Current assignment transition has an identical delay.

A further choice is **working everyone versus holding a ready reserve**. Idle readiness has an opportunity cost, but it allows the agency to respond to unexpected missions without abandoning investigations or waiting for agents to return.

## B. Spending: expansion, quality, or financial resilience

Money can hire agents or improve the agency. The complete upgrade categories inherited from `game-ts` are:

| Upgrade             | Strategic benefit                             |
| ------------------- | --------------------------------------------- |
| Agent capacity      | Supports a larger roster.                     |
| Transport capacity  | Supports more simultaneous deployments.       |
| Training capacity   | Allows more agents to train concurrently.     |
| Training skill gain | Improves the speed of agent development.      |
| Exhaustion recovery | Returns tired agents to effectiveness sooner. |
| Hit-point recovery  | Reduces downtime from injuries.               |
| Maximum hit points  | Improves agent survivability.                 |
| Weapon damage       | Improves combat effectiveness.                |

Hiring increases flexibility but also recurring upkeep. Improving existing agents can raise effectiveness without expanding the roster, but does not necessarily solve shortages of personnel or deployment capacity.

Spending immediately competes with keeping cash available for upkeep and emergencies. Mission rewards also create a distinction between **immediate cash and recurring funding**: one solves today’s shortage; the other improves long-term sustainability.

## C. Strategic direction: which Leads to pursue

Lead selection determines where the agency invests its future.

The intended Lead portfolio includes Leads to improve long-term agency capabilities, improve agent effectiveness, gain information, and counter particular factions. These are design directions for v5; the existing catalog is primarily faction-progression chains and faction profiles.

The player must choose:

- Capability development versus immediate intervention.
- Learning about a faction versus directly advancing against it.
- Concentrating on one faction versus containing several.
- Repeatable Leads versus deeper progression.
- Which Initiative missions justify committing scarce combat-ready agents.

Completing one faction’s elimination can remove a continuing source of pressure, but concentrating on it gives other factions time to strengthen.

## D. Investigations: focus, uncertainty, and commitment

**Focus versus breadth.** Additional investigators accelerate a lead sublinearly. Spreading agents across comparable leads improves aggregate progress, while concentrating them produces an important completion sooner. Progress spread across many unfinished leads delivers few immediate benefits.

**Uncertain timing.** Completion becomes more likely as progress accumulates, but its exact timing and true success probability are not fully known to the player. The player API should communicate useful estimates or uncertainty without exposing hidden values.

This matters because completing a lead can create a time-limited mission. The player must prepare for a plausible completion window instead of scheduling deployment around a known completion turn.

**Commitment cost.** Removing investigators loses progress in proportion to their contribution, following the existing effective-skill-based principle. Removing everyone abandons the Investigation; a later Investigation starts from zero. Adding agents does not erase progress.

**Fatigue versus continuity.** Long investigations exhaust their teams. Rotating agents preserves readiness but sacrifices progress and incurs travel delays. Keeping the team together preserves momentum but risks declining effectiveness or forced withdrawal.

## E. Operational tempo: progress versus overextension

Initiative and Response missions create a shared demand on the same agents and transport capacity.

Too little successful mission activity stalls rewards and progression while factions strengthen. Too much activity exhausts or injures the roster and leaves the agency unable to handle a critical threat.

Several difficult Response missions can arrive together. The player must triage using urgency, consequences, achievable outcomes, and available teams. Not every mission should be affordable or winnable.

Suppression provides another choice: **buy time now or pursue permanent elimination**. In `game-ts`, suppression delays operations without stopping faction escalation. Temporary relief therefore creates a preparation window rather than solving the underlying threat.

## F. Mission commitment: force concentration, casualties, and partial success

Deployment size trades confidence in one mission against coverage elsewhere. Transport capacity makes this a constraint even when enough agents exist.

Experienced agents are both powerful and valuable. Deploying them improves immediate prospects but risks losing accumulated training and combat experience. Injury also has a cost beyond the combat: prolonged recovery reduces future agency output.

**Attempting and failing must differ materially from ignoring a mission.** Damage inflicted on the enemy should provide a meaningful benefit even when the agency ultimately retreats or loses.

This is a v5 requirement rather than an inherited reward rule: existing mission rewards are conditioned on victory. Later specifications will define how inflicted damage translates into reduced consequences or other benefits. The principle is that useful resistance matters; merely showing up should not automatically neutralize an operation.

## G. Preparation matters more than tactical retries

Missions are resolved by automatic combat. The player chooses whether to commit and which agents to send, then accepts automatic resolution without controlling individual attacks.

Seeded determinism prevents replaying an identical attempt to obtain fresh rolls. Improving preparation may require revisiting earlier recruitment, training, recovery, and allocation decisions, abandoning the progress made since.

This reduces the value of retrying combat, but does not eliminate foreknowledge from undo. Undo remains supported; no additional rewind penalty is introduced by this brief.

# 4. References

This game brief was originally based on what was implemented by `game-ts`. See:

- https://github.com/konrad-jamrozik/game-ts/
- https://konrad-jamrozik.github.io/game-ts/
