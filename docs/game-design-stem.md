# Game v5: Core Design Stem

## 1. Purpose and core concepts

Create `docs/game-design-stem.md` as inspiration for later specifications. Adapt the strategic ideas from `game-ts`; exact formulas, balance, content, and framework choices remain open.

The game is a **web-based, turn-based agency-management strategy game**, with presentation inspiration from [A Dark Room](https://adarkroom.doublespeakgames.com/) and [Universal Paperclips](https://www.decisionproblem.com/paperclips/index2.html).

**Core loop:** allocate agents → investigate leads → uncover opportunities → deploy teams → resolve the turn → manage consequences and reinvest.

The main domain concepts are:

- **Agency and campaign:** resources, capabilities, roster, progression, and current turn.
- **Agents:** persistent individuals with skill, health, exhaustion, equipment, assignments, and career history. Orders and physical availability are distinct.
- **Leads:** discoverable opportunities connected by prerequisites. They can be repeatable, one-time, blocked, or completed.
- **Investigations:** individual attempts to complete leads, with assigned agents, accumulated progress, and uncertain completion.
- **Initiative missions:** agency efforts to advance objectives, typically uncovered through investigations.
- **Faction operations and Response missions:** enemy activity and the agency’s opportunities to intervene.
- **Combat:** automatic battles with targeting, skill contests, damage, exhaustion, incapacitation, retreat, casualties, and experience.
- **Factions:** opponents that escalate, launch operations, can be suppressed, and can eventually be defeated.
- **Economy and panic:** money, recurring funding, upkeep, upgrades, and global pressure.
- **Reports and history:** structured explanations of decisions and consequences.

Initiative and Response describe agency purpose, independently of combat tactics. Avoid offensive/defensive as mission categories.

## 2. Strategic tension: what makes the game interesting

The player manages competing needs under uncertainty. Good play is about choosing commitments, maintaining readiness, and accepting some losses—not maximizing every activity simultaneously.

### A. Agent allocation: productivity versus readiness

Each agent can primarily:

- Earn money.
- Investigate a lead.
- Train.
- Fight.
- Recover.

Every assignment sacrifices alternatives. Training improves future effectiveness but produces neither immediate income nor investigative progress. Recovery restores useful capacity but temporarily removes an agent from productive work.

Changing tasks often incurs **transit downtime**. Frequent reshuffling can leave a large roster unavailable and accomplish less than a smaller, consistently assigned team. Transit rules should make commitment meaningful without assuming every assignment transition has an identical delay.

A further choice is **working everyone versus holding a ready reserve**. Idle readiness has an opportunity cost, but it allows the agency to respond to unexpected missions without abandoning investigations or waiting for agents to return.

### B. Spending: expansion, quality, or financial resilience

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

### C. Strategic direction: which opportunities to pursue

Lead selection determines where the agency invests its future.

The intended lead portfolio includes opportunities to improve long-term agency capabilities, improve agent effectiveness, gain information, and counter particular factions. These are design directions for v5; the existing catalog is primarily faction-progression chains and faction profiles.

The player must choose:

- Capability development versus immediate intervention.
- Learning about a faction versus directly advancing against it.
- Concentrating on one faction versus containing several.
- Repeatable opportunities versus deeper progression.
- Which Initiative missions justify committing scarce combat-ready agents.

Completing one faction’s defeat can remove a continuing source of pressure, but concentrating on it gives other factions time to strengthen.

### D. Investigations: focus, uncertainty, and commitment

**Focus versus breadth.** Additional investigators accelerate a lead sublinearly. Spreading agents across comparable leads improves aggregate progress, while concentrating them produces an important completion sooner. Progress spread across many unfinished leads delivers few immediate benefits.

**Uncertain timing.** Completion becomes more likely as progress accumulates, but its exact timing and true success probability are not fully known to the player. The player API should communicate useful estimates or uncertainty without exposing hidden values.

This matters because completing a lead can create a time-limited mission. The player must prepare for a plausible completion window instead of scheduling deployment around a known completion turn.

**Commitment cost.** Removing investigators loses progress in proportion to their contribution, following the existing effective-skill-based principle. Removing everyone abandons the attempt; a later attempt starts from zero. Adding agents does not erase progress.

**Fatigue versus continuity.** Long investigations exhaust their teams. Rotating agents preserves readiness but sacrifices progress and incurs travel delays. Keeping the team together preserves momentum but risks declining effectiveness or forced withdrawal.

### E. Operational tempo: progress versus overextension

Initiative and Response missions create a shared demand on the same agents and transport capacity.

Too little successful mission activity stalls rewards and progression while factions strengthen. Too much activity exhausts or injures the roster and leaves the agency unable to handle a critical threat.

Several difficult Response missions can arrive together. The player must triage using urgency, consequences, achievable outcomes, and available teams. Not every mission should be affordable or winnable.

Suppression provides another choice: **buy time now or pursue permanent defeat**. In `game-ts`, suppression delays operations without stopping faction escalation. Temporary relief therefore creates a preparation window rather than solving the underlying threat.

### F. Mission commitment: force concentration, casualties, and partial success

Deployment size trades confidence in one mission against coverage elsewhere. Transport capacity makes this a constraint even when enough agents exist.

Experienced agents are both powerful and valuable. Deploying them improves immediate prospects but risks losing accumulated training and combat experience. Injury also has a cost beyond the battle: prolonged recovery reduces future agency output.

**Attempting and failing must differ materially from ignoring a mission.** Damage inflicted on the enemy should provide a meaningful benefit even when the agency ultimately retreats or loses.

This is a v5 requirement rather than an inherited reward rule: existing mission rewards are conditioned on victory. Later specifications will define how inflicted damage translates into reduced consequences or other benefits. The principle is that useful resistance matters; merely showing up should not automatically neutralize an operation.

### G. Preparation matters more than tactical retries

Missions are auto-battles. The player chooses whether to commit and which agents to send, then accepts automatic resolution without controlling individual attacks.

Seeded determinism prevents replaying an identical attempt to obtain fresh rolls. Improving preparation may require revisiting earlier recruitment, training, recovery, and allocation decisions, abandoning the progress of that timeline.

This reduces the value of retrying combat, but does not eliminate foreknowledge from undo. Undo remains supported; no additional rewind penalty is introduced by this stem.

## 3. Shared API and progressive interfaces

The foundation is a **well-defined TypeScript API consisting of exposed functions and types**, not necessarily an HTTP service.

Humans and AI players must be able to play completely through it. It provides observations, decision-relevant derived information, action discovery, constraints, commands, structured outcomes, and undo/redo.

The player receives **all information needed to play and only information they are entitled to know**. Visibility restrictions apply equally to queries, action descriptions, errors, and reports. A separate **dev-mode API** exposes full authoritative state.

Supported interfaces develop progressively:

1. **TypeScript API:** a complete headless gameplay interface.
2. **Terminal CLI:** readable human output and structured machine output over the same API.
3. **Functional web UI:** feature-rich grids, trees, charts, buttons, and detail views. Prioritize filtering, sorting, selection, relationships, readability, and useful colors.
4. **Visual enrichment:** static graphics and selected animations.
5. **Possible browser-based 3D:** a future presentation layer over the same gameplay foundation.

Earlier interfaces remain supported. Graphics must not become necessary to access gameplay information or actions.

The engine owns rules, validation, visibility, and consequences. Clients own presentation or player strategy. Content definitions remain separate from campaign instances. Browser and terminal dependencies stay outside the engine.

Only these interfaces are in scope. Dedicated native game engines such as Unity are excluded. Choose the web framework later, with grid and tree capabilities as major criteria.

## 4. Turns, determinism, and history

Management commands take immediate effect. **Advance turn** atomically resolves time-dependent activity and generates a report. Combat rounds remain internal to that resolution.

- Identical initial state, rules/content version, and commands reproduce identical outcomes.
- Random-generator state and deterministic ID counters belong to authoritative state.
- Processing order and rounding are explicit. Queries, rendering, and wall-clock time do not influence gameplay.
- Every accepted command, including an entire turn advancement, is one history step.
- Undo restores state, randomness, and reports. Redo restores the recorded result without rerolling.
- A new command after undo replaces the redo continuation.
- Rejected commands change neither state nor history.
- UI preferences remain outside gameplay history. Persistent AI memory is restored with the session timeline when needed for automated continuation.

Begin with snapshots; optimize history storage later.

## 5. Delivery and acceptance

The immediate deliverable is the Markdown stem, not implementation. Exact formulas, content, balance, and partial-success calculations belong in subsequent specifications.

Future validation should establish that:

- A campaign is playable through the API and CLI without dev access.
- Equivalent API, CLI, and web commands produce identical results.
- Player information is complete within its visibility boundary.
- Seeded replay and undo/redo reproduce outcomes, reports, and generated IDs.
- Invalid commands cannot partially spend resources or assign agents.
- Transit, fatigue, recovery, investigation commitments, and capacity create consistent trade-offs.
- Failed missions can provide damage-related benefits distinct from expiration.
- UI and AI clients use engine-provided rules and information.
- Playtesting rewards preparedness and prioritization while allowing viable alternatives to a single dominant allocation strategy.

Use `game-ts` models, rules, turn resolution, APIs, history, and documentation as references. Mark inherited behavior, v5 requirements, and future design questions distinctly; do not preserve bugs or incidental implementation quirks as requirements.
