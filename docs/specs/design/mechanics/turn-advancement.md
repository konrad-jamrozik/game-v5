# Turn Advancement

| Metadata | Value |
| --- | --- |
| Spec ID | TURN |
| Family | Mechanics |
| Audience | Engine designer, AI designer, Implementer |
| Owns | The canonical order of Turn advancement steps and which values each step uses. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Time in the game moves only when the player ends a [Turn](../foundation/engine-contract.md#player-actions-and-turns). Advance turn is the [Player action](../foundation/engine-contract.md#player-actions-and-turns) that [does so](../foundation/engine-contract.md#player-actions), and everything that takes time happens in it at once, e.g. income, training, and [Combat](domain-model.md#combat).

Advance turn is a fixed sequence of twelve Turn advancement steps, from Agency income to Turn close, each applied exactly once and each applying the rules of one subject, e.g. in Upkeep the [Agency](domain-model.md#agency-and-agents) pays for every [Serving](agents-spec.md#agent-statuses) [Agent](domain-model.md#agency-and-agents). The sequence matters, because a step sees what the earlier steps of the same Advance turn did. Within one step the opposite holds: every rule uses Step-start values, apart from a few listed exceptions, so the order in which [Campaign instances](../foundation/core-concepts.md#campaign-instances) are processed never changes the result. Only the [World state](../foundation/engine-contract.md#player-actions-and-turns) after Advance turn is observable.

Each Mechanics specification says what its rules do; Turn Advancement says when each applies, in one place, so that the whole order can be read and checked at once.

# Canonical order

A rule applied during Advance turn has a place in the order of the [Turn advancement steps](domain-model.md#turn-advancement-steps), and only Turn Advancement states that place, so two specifications cannot come to disagree about it.

- **One step per rule:** Every rule that a specification states is applied during Advance turn belongs to exactly one step of [Turn advancement steps](#turn-advancement-steps). A rule that belongs to no step is not applied during Advance turn.
- **The canonical order takes precedence:** When another specification contradicts Turn Advancement about which step a rule belongs to, the order of the steps, or [which values a rule uses](#values-a-step-uses), that specification is defective and is corrected. What a rule computes or changes is decided by the specification that owns the rule.
- **Steps are named:** Every other specification refers to a step by its name, e.g. "the Mission resolution step", never by its number in the order.

# Turn advancement steps

Advance turn applies these twelve steps, each exactly once and in this order, in every Advance turn.

| Order | Turn advancement step | Applies to | What it applies | Rules owned by |
| --- | --- | --- | --- | --- |
| 1 | Agency income | The [Agency](domain-model.md#agency-and-agents); every [Serving](agents-spec.md#agent-statuses) [Agent](domain-model.md#agency-and-agents) on [Contracting](agents-spec.md#assignments) that is [At assignment](agents-spec.md#agent-statuses). | The Agency's money rises by its [income](economy-and-upgrades.md#agency-income): its funding plus what those Agents earn. Each of them then gains [work exhaustion](agents-spec.md#work-exhaustion) and may have a [Forced return](agents-spec.md#forced-return). | [Economy and Upgrades](economy-and-upgrades.md); [Agents](agents-spec.md) |
| 2 | Upkeep | The Agency; [every Serving Agent](#transit-across-the-steps). | The Agency's money falls by its [upkeep](economy-and-upgrades.md#upkeep). | [Economy and Upgrades](economy-and-upgrades.md) |
| 3 | Training | Every Serving Agent on [Training](agents-spec.md#assignments) that is [At assignment](domain-model.md#agency-and-agents). | Each has its [Training growth](agents-spec.md#training-growth) in [base skill](agents-spec.md#combatant-attributes), then gains work [exhaustion](agents-spec.md#combatant-attributes) and may have a [Forced return](agents-spec.md#assignments). | [Agents](agents-spec.md) |
| 4 | [Investigation progress](domain-model.md#leads-investigations-mission-sites-and-missions) | Every Active [Investigation](domain-model.md#leads-investigations-mission-sites-and-missions). | Each gains [Investigation progress](investigations.md#investigation-progress) from its [working members](investigations.md#glossary), may become [Assessed](investigations.md#glossary), and [completes](investigations.md#completion) when the progress reaches its [Actual required progress](investigations.md#glossary), which applies its [Lead](domain-model.md#leads-investigations-mission-sites-and-missions)'s [Completion effect](leads-and-progression.md#completion-effect) and may [create an Initiative Mission site](missions.md#mission-site-creation). Its working members then gain work exhaustion and may have a Forced return. | [Investigations](investigations.md); [Leads and Progression](leads-and-progression.md); [Missions](missions.md) |
| 5 | Mission resolution | Every [Deployed](agents-spec.md#assignments) [Mission](domain-model.md#leads-investigations-mission-sites-and-missions); then every Active [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions); then every Active Investigation. | Each Deployed Mission is [resolved](missions.md#resolving-one-mission): its [Combat](combat.md) is fought, it becomes Won or Lost, its survivors are sent back, and its [Consequences](missions.md#consequences) apply. Then every Active Mission site that [cannot exist](missions.md#whether-a-mission-site-can-exist) is [Cancelled](missions.md#cancellation). Then every Active Investigation whose Lead is [not available](leads-and-progression.md#lead-availability) is [interrupted](investigations.md#lead-no-longer-available). | [Missions](missions.md); [Combat](combat.md); [Leads and Progression](leads-and-progression.md); [Investigations](investigations.md) |
| 6 | Mission site expiration | Every Active Mission site that already existed in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns). | Each counts down toward its [expiration](missions.md#mission-site-expiration); one that reaches 0 is Expired and applies the [Consequences](domain-model.md#leads-investigations-mission-sites-and-missions) of being ignored. | [Missions](missions.md) |
| 7 | Faction activity | Every [Faction](domain-model.md#factions) that is not [Eliminated](domain-model.md#factions). | Each counts down to its next [Faction activity level](factions.md#glossary) and [escalates](factions.md#escalation) when the count ends, then [counts down to its next operation](factions.md#faction-activity), where one [Faction operation occurrence](factions.md#faction-operation-occurrence-generation) creates a [Response Mission site](missions.md#mission-site-creation). | [Factions](factions.md); [Missions](missions.md) |
| 8 | Agent recovery | Every Agent that is [Recovering](agents-spec.md#agent-statuses), or At assignment on [Standby](agents-spec.md#assignments). | Each [recovers](agent-recovery.md#which-agents-recover): [current health](agent-recovery.md#health-recovery) on [Recovery](agents-spec.md#assignments), which ends when the Agent is at full health, and [exhaustion](agent-recovery.md#exhaustion-recovery) on either [Assignment](domain-model.md#agency-and-agents). | [Agent Recovery](agent-recovery.md) |
| 9 | Previous turn transit arrivals | Every Serving Agent that is [In transit](agents-spec.md#agent-statuses) in the Turn-end state and still [In transit](domain-model.md#agency-and-agents), with the same [Assignment](domain-model.md#agency-and-agents), when the step begins, i.e. every Agent whose transit started before this Advance turn. | Each [arrives](agents-spec.md#transit-rule): it becomes At assignment, or Recovering when its Assignment is Recovery, and keeps its Assignment. | [Agents](agents-spec.md) |
| 10 | Panic | The [Campaign](../foundation/core-concepts.md#campaign-and-session)'s [Panic](domain-model.md#campaign-standing). | The [Pending panic change](panic-and-endings.md#pending-panic-change) of the Advance turn is [applied to Panic](panic-and-endings.md#panic-step) and discarded. | [Panic and Endings](panic-and-endings.md) |
| 11 | Ending check | The Campaign. | The [Ending check](panic-and-endings.md#ending-check-step) gives the Campaign its [Campaign ending](domain-model.md#campaign-standing) when [Victory](panic-and-endings.md#victory) or [Defeat](panic-and-endings.md#defeat) holds, with its [Ending reasons](panic-and-endings.md#glossary). | [Panic and Endings](panic-and-endings.md) |
| 12 | Turn close | The [Turn series](../foundation/world-history.md#glossary) and the [Turn](../foundation/engine-contract.md#player-actions-and-turns). | Both [Turn series of money](economy-and-upgrades.md#turn-series-of-money) are recorded and the [turn number](#turn-number) rises by one, which ends the Turn. | [Economy and Upgrades](economy-and-upgrades.md) |

## Turn number

The turn number is the number of the current Turn, a whole number that is 1 in the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session). Only Turn close changes it, raising it by 1 in every Advance turn.

## Transit across the steps

An Agent In transit is between two Assignments and takes part in neither, so every transit costs one Advance turn in which the Agent does nothing. These statements hold in every Advance turn, and a change to the order of the steps must keep them.

1. **At assignment in a step:** Wherever the rule of a step applies to Agents that are At assignment or Recovering, it applies to an Agent exactly when the Agent has that [Agent status](domain-model.md#agency-and-agents) when the step begins, as a [Step-start value](domain-model.md#turn-advancement-steps). An Agent In transit therefore does not work, fight, or recover.
2. **Arrival:** An Agent that arrives in an Advance turn does nothing else in it: it earns no income, gains no base skill, adds no Investigation progress, fights no [Combat](domain-model.md#combat), and recovers neither [current health](agents-spec.md#combatant-attributes) nor exhaustion.
3. **Upkeep counts every Serving Agent:** Upkeep is a cost of the Agency, not something an Agent does, so it counts every Serving Agent, including one In transit, one that arrives in the same Advance turn, one on Recovery, and one that is [Deployed](agents-spec.md#assignments).
4. **Departure:** An Agent that becomes In transit during an Advance turn, including one redirected while already In transit, does not arrive in that Advance turn. It is still In transit in the [World state](../foundation/engine-contract.md#player-actions-and-turns) after it and arrives in the next Advance turn.
5. **Destination ends during transit:** When the Assignment an Agent is In transit to ends because of something other than the Agent's own work, the Agent's Assignment changes as the rule that ends it states: a member still In transit to an Investigation that [completes](investigations.md#completion) or [is interrupted](investigations.md#lead-no-longer-available) goes to Standby, In transit, with the rest of the [Current team](domain-model.md#leads-investigations-mission-sites-and-missions). The redirect starts a new transit, so the Agent arrives at Standby in the next Advance turn.
6. **Deployment:** [Deploying Agents](missions.md#deploying-agents) takes no transit, so every Mission that is Deployed when an Advance turn begins is resolved in that Advance turn, and none waits for a later one.

**Informative rationale:** With one Advance turn for every transit, an Agent given an order that starts In transit works for the first time in the second Advance turn after the order, e.g. an Agent assigned to Contracting during Turn 5 arrives in the Advance turn ending Turn 5 and earns its first income in the Advance turn ending Turn 6. Placing the arrivals after every other step that applies to Agents makes "an arriving Agent does nothing else" follow from the order alone, and the Turn-end state is read in one place, the arrivals step, to keep this Advance turn's departures In transit.

## Same-turn interactions

Something that happens in one step of an Advance turn can change what another step of the same Advance turn does. What must come of each such meeting is decided, and the order of the steps is arranged to produce it; a change to the order must keep every statement.

- **A Mission site does not count down in the Advance turn that creates it:** Neither an [Initiative Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) nor a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) [counts down](missions.md#mission-site-expiration) in that Advance turn, and no Combat is fought at either in it.
- **No World state shows an Active Mission site that cannot exist:** A Mission site that cannot exist once the Missions of an Advance turn are resolved is Cancelled in that Advance turn, including one created in it, e.g. an Initiative Mission site whose target Faction a Mission Won in the same Advance turn made Eliminated.
- **No World state shows an Active Investigation whose Lead is not available:** An Investigation whose Lead stops being available during an Advance turn, e.g. because a Won Mission made its Faction Eliminated, is interrupted in that Advance turn, and the Investigation progress it gained in that Advance turn is lost with the rest.
- **A Deployed Mission is never cancelled:** Every Deployed Mission becomes Won or Lost, whatever else happens in its Advance turn, e.g. when another Won Mission makes its target Faction Eliminated.
- **A Deployed Mission site never expires:** A team deployed in the last Turn before a Mission site would be Expired fights its Combat, and the Mission site becomes Concluded, never Expired.
- **An Agent sent back does not recover in the same Advance turn:** A survivor of a Combat does not [recover](agent-recovery.md#which-agents-recover) in the Advance turn of that Combat. Neither does a member of an Investigation that completed or was interrupted, nor an Agent with a Forced return from Contracting or from an Investigation, in the Advance turn that sent it back.
- **Work exhaustion before recovery:** An Agent gains the work exhaustion of an Advance turn before any recovery of that Advance turn, so an Agent whose Forced return from Training puts it on Standby, At assignment, recovers exhaustion in the same Advance turn.
- **Upkeep before casualties:** An Agent [Killed](agents-spec.md#agent-statuses) in an Advance turn is counted in the Upkeep of that Advance turn and of no later one, and it stops counting toward the [Transport cap](economy-and-upgrades.md#glossary) when it is Killed.
- **A Faction Eliminated in an Advance turn does not act in it:** It neither escalates nor carries out an operation in that Advance turn, whether a Lead's Completion effect or a Won Mission made it Eliminated.
- **Funding changes affect income from the next Advance turn:** A [funding change](economy-and-upgrades.md#funding-changes) made in an Advance turn first affects Agency income in the next Advance turn.
- **Panic changes once:** Every Panic increase and Panic reduction of an Advance turn joins its [Pending panic change](panic-and-endings.md#glossary), Panic changes once, by their sum, and the Ending check judges Panic after that change.
- **Money is judged once:** The Ending check judges the money that the whole Advance turn leaves, so money that falls below 0 during an Advance turn causes no Defeat when a later change of the same Advance turn, e.g. the reward of a Won Mission, raises it to 0 or more.
- **Turn close after a Campaign ending:** When an Advance turn gives the Campaign its Campaign ending, Turn close still applies: both Turn series of money are recorded and the turn number rises, so the [Ending turn](panic-and-endings.md#recording-the-ending) is one less than the turn number of the World state after that Advance turn.

# Values a step uses

The result of Advance turn must not depend on how an implementation happens to order its work, so which value a rule reads, as it was before or after another rule changed it, is fixed.

- **Earlier steps are visible:** A Turn advancement step uses every value as it is after every earlier step of the same Advance turn. E.g., Mission resolution uses each Agent's base skill after the Training of the same Advance turn.
- **Step-start values within a step:** Every rule of one step uses Step-start values, apart from the [exceptions](#exceptions-to-step-start-values). E.g., when two Agents gain base skill in Training, neither gain depends on the other.

## Exceptions to Step-start values

A few rules need something other than a Step-start value: a value from before the Advance turn began, or a result that an earlier part of the same step has just produced.

1. **Values of the Turn-end state:** Three rules read a value of the Turn-end state. Previous turn transit arrivals reads whether an Agent was In transit, and with which Assignment; Mission site expiration reads whether a Mission site already existed; and Turn close reads the money that Money at the end of turn records.
2. **Ordered parts for one [Campaign instance](../foundation/core-concepts.md#campaign-instances):** Where the owning specification states the rule of a step for one Campaign instance as parts applied in order, each part reads the results of the earlier parts for that same Campaign instance, and never the results of this step for another Campaign instance. E.g., an Agent's Forced return is decided from the exhaustion that its work in that step has just added.
3. **Cancellation and interruption in Mission resolution:** Whether an Active Mission site can exist is read once every Deployed Mission of the step is resolved and its Consequences are applied, so a Faction that any Won Mission of the step made Eliminated counts. Whether the Lead of an Active Investigation is available is read after that cancellation.

## Combined results

When several changes reach the same value within an Advance turn, the result must still be one well-defined value, whichever change an implementation applies first.

The specification that owns a value states how several changes to it combine, e.g. the funding changes of one step are summed before their floor applies, and the Pending panic change sums every Panic change of the Advance turn. No Agent value is changed by the rules of two Campaign instances in one step, because an Agent belongs to at most one Current team.

## Campaign instances created during Advance turn

A Campaign instance created partway through an Advance turn meets steps written for the instances that existed when it began, so whether it takes part in them is decided rather than left to the order.

Mission sites and their Enemies are the only Campaign instances created during Advance turn; a Mission is created only by a [Player action](../foundation/engine-contract.md#player-actions-and-turns), during a Turn. A Campaign instance created during a step takes part in a later step of the same Advance turn only where a [Same-turn interaction](#same-turn-interactions) states so, which is the cancellation of a Mission site that cannot exist.
