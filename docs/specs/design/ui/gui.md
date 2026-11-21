# Graphical User Interface

| Metadata | Value |
| --- | --- |
| Spec ID | GUI |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | Which screens the graphical user interface has, the progress indicators that several of them show, the warnings it gives, and how it names an Enemy. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Graphical User Interface (GUI) is where the Player plays the game through a graphical interface. It shows the game and acts on the Player's choices by calling the engine API of the [Engine Contract](../foundation/engine-contract.md).

Its screens follow the life of a [Session](../foundation/core-concepts.md#campaign-and-session) under [Campaign Lifecycle](../foundation/campaign-lifecycle.md): it opens at the [Main menu](../foundation/campaign-lifecycle.md#glossary), where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet, and once a Campaign is created or loaded it shows the screens for playing it. For every screen, the guiding question is what the Player needs to see by default and what can stay one step away. How each screen looks is owned by [Visual Design](visual-design.md).

# Glossary

These terms are specific to the Graphical User Interface.

| Term | Definition |
| --- | --- |
| Detail view | A panel of the [Campaign screen](screens/campaign-screen.md) for one part of the [Campaign](../foundation/core-concepts.md#campaign-and-session) that the Player looks at in detail or acts on, opened from the Side panel over the Globe stage. |
| Globe stage | The region of the Campaign screen that shows the globe and over which a Detail view opens. |
| Side panel | The region at the right of the Campaign screen that opens Detail views and holds the summary of the work waiting for the Player. |
| Completion estimate | The range of [Advance turns](../foundation/engine-contract.md#player-actions-and-turns) within which an Active [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) may complete if its projected progress gain stays as it is, under [Completion estimate](#completion-estimate). |
| Progress bar | The bar that shows an Investigation's progress against its [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s required progress, under [Progress bar](#progress-bar). |
| Progress circle | The small circle that shows an Active Investigation's progress as a share of its Lead's [Required progress](../mechanics/leads-and-progression.md#glossary), under [Progress circle](#progress-circle). |
| Settings panel | The panel, shown on both screens, through which the Player sets [Global configuration](../foundation/engine-contract.md#persisted-data), under [Settings panel](#settings-panel). |
| View trail | The places that the Player came through to reach the one shown, most recent last, which the Escape key retraces, under [View trail](screens/campaign-screen.md#view-trail) in Campaign Screen. |
| Back control | The button of the open Detail view that goes back to the last place of the View trail, shown while the View trail is not empty, under [View trail](screens/campaign-screen.md#view-trail) in Campaign Screen. |
| Enemy label | The name by which the GUI shows an [Enemy](../mechanics/domain-model.md#combat): its EnemyArchetype and its number among the Enemies of that EnemyArchetype at its [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), e.g. "initiate-2", under [Enemy labels](#enemy-labels). |

# Screens

The GUI has two screens, and each has its own specification in the `screens/` directory, which owns what the screen shows, how it is laid out, and how it is illustrated:

- [Main Menu](screens/main-menu.md): the screen the GUI opens at, where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet.
- [Campaign Screen](screens/campaign-screen.md): the screen for playing the current Campaign. Its parts with a specification of their own are the [Situation Panel](screens/situation-panel.md), the [Turn Summary](screens/turn-summary.md) dialog, and one specification for each Detail view: the [Missions View](screens/missions-view.md), [Leads View](screens/leads-view.md), [Agents View](screens/agents-view.md), [Upgrades View](screens/upgrades-view.md), [Turn Report View](screens/turn-report-view.md), [History View](screens/history-view.md), [Charts View](screens/charts-view.md), and [Compendium View](screens/compendium-view.md).

Both screens play the same background music without a break between them, and both offer the Music control, under [Music](music.md). Both answer the Player's clicks with short sounds, under [Sounds](sounds.md). Both offer the Settings panel, under [Settings panel](#settings-panel).

# Settings panel

The Player changes [Global configuration](../foundation/engine-contract.md#persisted-data) in one place, the Settings panel, so that a setting is found the same way on both screens, and the settings the Player rarely changes stay one click away rather than in view. On the [Main Menu](screens/main-menu.md) the Settings panel stands in its right column, always in view, with no close control. On the [Campaign Screen](screens/campaign-screen.md) it opens from the Settings button in the footer of the Side panel, centred over a Scrim and drawn as a dialog under [Dialogs](visual-design.md#dialogs) in Visual Design, except that it has no buttons at its bottom: the Player closes it with its close control or the Escape key, under [Close controls](visual-design.md#close-controls). Opening it neither pauses nor changes the Campaign.

The Settings panel is titled Settings and holds these rows from top to bottom, each a row of a settings list under [Inputs](visual-design.md#inputs); the list is complete:

1. **Music volume:** the [Music volume slider](music.md#music-volume-slider).
2. **Sounds:** the Sounds toggle and the Sounds volume slider, under [Sound settings](sounds.md#sound-settings).
3. **Other settings:** one row for each other Global configuration setting, e.g. the [Autosave limit](../foundation/saves.md#glossary), with its input.
4. **Tools,** on the Campaign Screen only: a neutral button for the keyboard shortcuts, under [Keyboard shortcuts](screens/campaign-screen.md#keyboard-shortcuts) in Campaign Screen, and one for the developer tools. Each closes the Settings panel and opens what it names, which the Player closes with its close control or the Escape key, under Close controls.

Music on and Sounds on have no rows of their own beyond these: Music on is set with the Music control, and Sounds on with the Sounds toggle.

# Reveal hidden content

The Game designer checks content in play by turning on Reveal hidden content, under [Revealed presentation](../foundation/developer-access.md#revealed-presentation) in Developer Access, and finds it among the developer tools, beside the other powers that [Dev mode](../foundation/engine-contract.md#principals-and-access) gates. The developer tools hold a Reveal hidden content checkbox, under [Checkboxes](visual-design.md#checkboxes) in Visual Design, labelled "Reveal hidden content". It is disabled while [Dev mode](../foundation/engine-contract.md#principals-and-access) is disabled or [Autopilot](../foundation/engine-contract.md#autopilot) is engaged, and clears itself whenever Dev mode is disabled. While it is checked, every screen of the GUI presents the [Current campaign](../foundation/core-concepts.md#campaign-and-session) under Revealed presentation in Developer Access, e.g. the [Compendium View](screens/compendium-view.md) shows every Compendium article, and a revealed value is shown exactly as it is shown once revealed, without a mark of its own.

# Warning on deploying tired Agents

The engine lets an [Agent](../mechanics/domain-model.md#agency-and-agents) be deployed whatever its [exhaustion](../mechanics/agents-spec.md#combatant-attributes), short of one that would be [Incapacitated](../mechanics/combat.md#combatant-condition-in-a-combat) at the start of the [Combat](../mechanics/domain-model.md#combat), under [Deploying Agents](../mechanics/missions.md#deploying-agents) in Missions, because a tired team may be the only answer to a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). A tired Agent fights worse and drops out of a [Combat](../mechanics/domain-model.md#combat) sooner, under [Incapacitation condition](../mechanics/combat.md#incapacitation-condition) in Combat, so the GUI makes sure the Player deploys one knowingly. Before it makes a `deployAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) whose team includes an Agent with exhaustion of 20 or more, the GUI warns the Player and asks to confirm. The warning names each such Agent with its exhaustion and [effective skill](../mechanics/agents-spec.md#combatant-attributes). It is a warning, not a block: the Player may confirm and deploy. The threshold 20 is a constant of the GUI, not a [GDR](../foundation/core-concepts.md#game-build-and-content) value, because no game rule reads it.

# Progress bar

A Progress bar shows how far an Investigation is from completing while its [Actual required progress](../mechanics/investigations.md#glossary) stays hidden. How it is drawn depends on what the Player knows:

- **[Assessed Lead](../mechanics/investigations.md#glossary):** the bar spans 0 to the greatest value of the Lead's [Required progress range](../mechanics/investigations.md#glossary), e.g. 0 to 15 for a [Required progress](../mechanics/leads-and-progression.md#glossary) of 10. A tick marks the [Required progress](../mechanics/leads-and-progression.md#glossary), and the part from it to the end of the bar is marked as the zone in which the Investigation may complete in any Advance turn, because its Actual required progress lies there. The fill runs from 0 to the [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). On an Active Investigation, a preview segment after the fill shows the projected progress gain, and a caption says that the Investigation may complete next turn when its progress and that gain together reach the Required progress, and that it may complete any turn once its progress has reached it.
- **Lead that is not an Assessed Lead:** the bar has no scale, because the Required progress is hidden. It shows a short fixed stub that does not grow with progress, and a caption stating the assessment threshold as a share of the Required progress, from `assessment_threshold_pct` under [InvestigationParameters](../mechanics/investigations.md#investigationparameters) in Investigations, e.g. "assessed at 25% of required".
- **Completed Investigation:** the bar is drawn as for an Assessed Lead, because a Completed Investigation is always [Assessed](../mechanics/investigations.md#glossary). Its fill is split at the Investigation progress before the last Advance turn, so that the gain of that Advance turn, from the [Turn report](../foundation/campaign-state.md#glossary), is a separate segment, and a mark shows where the Investigation completed, labelled with its final Investigation progress.

The scale of a bar never changes, so that every bar of one Lead reads alike. A preview segment, a gain segment, or a completion mark that would pass the greatest value of the range ends at the bar's end, while every value written for it stays the value it stands for, under [Decimal quantities shown](#decimal-quantities-shown), e.g. on a bar from 0 to 15, an Investigation progress of 13 with a projected progress gain of 3.50 has a preview segment from 13 to 15 and the caption still gives "+3.50 / turn", and a final Investigation progress of 16.50 has its completion mark at the bar's end, labelled "16". The Investigation progress of an Active Investigation never passes the end of the bar, because the Investigation completes once its progress reaches its Actual required progress, which lies within the range.

# Progress circle

A Progress circle lets the Player read in one glyph, on a line too short for a [Progress bar](#progress-bar), how far an Active Investigation has come. Like the Progress bar, it keeps the [Actual required progress](../mechanics/investigations.md#glossary) hidden. How it is drawn depends on what the Player knows:

- **[Assessed Lead](../mechanics/investigations.md#glossary):** the circle fills clockwise from the top by the share of the [Required progress](../mechanics/leads-and-progression.md#glossary) that the [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) has reached, e.g. three quarters for progress 7.50 of a Required progress of 10. Once the progress has reached the Required progress, the circle is full and carries a check, because the Investigation may then complete in any Advance turn.
- **Lead that is not an Assessed Lead:** the circle is an empty dashed outline with a question mark, because the Required progress is hidden.

# Completion estimate

A Completion estimate tells the Player roughly when an Active Investigation will complete, so that a plan can be made without reading the Progress bar. It is worked out by the GUI from [Player-visible information](../foundation/engine-contract.md#api-surfaces) only: the Investigation progress p, the projected progress gain g, under [Projected progress gain](../mechanics/investigations.md#projected-progress-gain) in Investigations, the Lead's [Required progress range](../mechanics/investigations.md#glossary) from R, its Required progress, to M, its greatest value, and the [Agent status](../mechanics/agents-spec.md#agent-statuses) of each member of the [Current team](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). It is not a [Derived value](../foundation/core-concepts.md#value-classification) of the engine, and it assumes that g stays as it is. It is written with "T" for Advance turns, by the first of the following cases that applies:

1. **g is 0 and a member of the Current team is [In transit](../mechanics/domain-model.md#agency-and-agents):** "in transit", e.g. just after the Investigation started, because the Investigation gains progress once those members have arrived, under [Transit rule](../mechanics/agents-spec.md#transit-rule) in Agents.
2. **g is 0 otherwise,** e.g. when every member is At assignment with an [Effective skill](../mechanics/agents-spec.md#effective-skill) of 0: "stalled", because the Investigation gains no progress until the Player changes its Current team.
3. **Lead that is not an Assessed Lead:** "ETA ?", because R and M are hidden.
4. **Assessed Lead and g above 0:** the Investigation completes at the earliest after a = max(1, ⌈(R − p) / g⌉) and at the latest after b = ⌈(M − p) / g⌉ Advance turns, written "ETA a–b T", or "ETA a T" when a equals b, e.g. "ETA 3–5 T". Once p has reached R, it is written "ETA ≤ b T", because the Investigation may complete in any Advance turn.

# Decimal quantities shown

The rules that matter read whole numbers: where a rule reads a [Decimal quantity](../foundation/numbers.md#glossary), it reads a whole number made from it or compares it with a whole threshold, e.g. an Agent's [exhaustion](../mechanics/agents-spec.md#combatant-attributes) is its [Exact exhaustion](../mechanics/agents-spec.md#combatant-attributes) rounded up, and its [effective skill](../mechanics/agents-spec.md#combatant-attributes) is rounded down. The two decimals exist only so that a value can creep toward the next whole number, e.g. through a training skill gain, exhaustion recovery, or health recovery. The GUI therefore shows every value as a whole number, unless this section names it below as shown with two decimals.

A Decimal quantity shown as a whole number is rounded so that it never reads as having reached a threshold it has not reached, the way the rules count it, and the Player can trust it at a glance; the rounding is for display only and changes no value:

- **Exhaustion:** an Agent's exhaustion, i.e. its [Exact exhaustion](../mechanics/agents-spec.md#combatant-attributes) rounded up, under [Exhaustion and Exact exhaustion](../mechanics/agents-spec.md#exhaustion-and-exact-exhaustion) in Agents, e.g. an Exact exhaustion of 3.12 reads "4".
- **Every other Decimal quantity:** rounded down, e.g. a [base skill](../mechanics/agents-spec.md#combatant-attributes) of 101.90 reads "101"; a [current health](../mechanics/agents-spec.md#combatant-attributes) of 29.40 against an effective max health of 30 reads "29 / 30", so that an Agent still on [Recovery](../mechanics/agents-spec.md#assignments) never reads "30 / 30"; and an [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) stored as 702 reads "7", so that an Investigation never reads as having reached its [Required progress](../mechanics/leads-and-progression.md#glossary) before it has.

Only these values are shown with two decimals, exactly and never rounded, because they are what the Player watches creep toward the next whole number, and rounding would hide it:

- **Investigation progress gains:** the projected progress gain of an Active Investigation, under [Projected progress gain](../mechanics/investigations.md#projected-progress-gain) in Investigations, the [Team progress estimate](../mechanics/investigations.md#team-progress-estimate), and the gain of an Investigation in one Advance turn, e.g. "+1.04 / turn", because as a whole number a gain of 1.04 would read "+1" and one of 0.60 "+0".
- **Upgrade effects:** the rate that a [Rate Upgrade](../mechanics/economy-and-upgrades.md#glossary) raises, under [Rate Upgrades](../mechanics/economy-and-upgrades.md#rate-upgrades) in Economy and Upgrades, before and after one more acquisition, as the [Upgrade cards](screens/upgrades-view.md#upgrade-cards) of the Upgrades View show it, e.g. "Exhaustion recovery 5.00 → 5.50" and "Health recovery 2.00% → 2.20%".
- **Agent details:** an Agent's [base skill](../mechanics/agents-spec.md#combatant-attributes), [current health](../mechanics/agents-spec.md#combatant-attributes), and exhaustion, shown as its Exact exhaustion, under [Agent details](screens/agents-view.md#agent-details) in Agents View, e.g. "101.90", "29.40 / 30", and "3.12". Everywhere else, these values are whole numbers.
- **Panic:** [Panic](../mechanics/domain-model.md#campaign-standing) and every Panic increase and Panic reduction, wherever one is shown, e.g. "24.35 / 100%" on the status bar and "Panic −0.05" among the [Consequences](../mechanics/missions.md#consequences) of a Mission, because a single event changes Panic by hundredths of a percentage point. The [Panic limit](../mechanics/panic-and-endings.md#glossary) is a whole number and is shown as one.

A value that is a whole number by its rule is shown as it is, e.g. effective skill, effective max health, money, and an Enemy's current health.

A value that a Compendium article inserts for a [Placeholder](../mechanics/compendium.md#glossary) is text that [Player API](../foundation/engine-contract.md#api-surfaces) reports already formatted, under [Value formatting](../mechanics/compendium.md#value-formatting) in Compendium, and the GUI shows it as reported and never rounds it, e.g. a multiplier that reads "0.5".

A Decimal quantity is turned into its text from its whole number of hundredths, without a binary floating-point number, under [Decimal quantities](../foundation/numbers.md#decimal-quantities) in Numbers.

# Enemy labels

The Player meets Enemies only a few at a time, at one [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and tells them apart by what they are, so the GUI shows every Enemy by its Enemy label, never by its [Instance ID](../foundation/campaign-instances.md#glossary), which numbers every Enemy of the Campaign and so says nothing about the Mission site at hand. The Enemy label is the `name` of the Enemy's EnemyArchetype in lower case, with each space replaced by a hyphen, then a hyphen and the Enemy's number: its position, counted from 1, among the Enemies of the same EnemyArchetype in its Mission site's list of Enemies, under [Fixed order of each side](../mechanics/combat.md#fixed-order-of-each-side) in Combat. Each EnemyArchetype numbers its own Enemies, and each Mission site starts again from 1, whatever the Instance IDs and whatever earlier Mission sites held. An Enemy label is unique only within its Mission site, so wherever an Enemy is named outside the context of its Mission site, e.g. in the Killed by column of the [Memorial](screens/agents-view.md#memorial), its Mission site is named beside it, there in the Where column.

E.g., a Mission site whose list of Enemies is three Initiates followed by two Soldiers, with the Instance IDs enemy-19 to enemy-23, shows them as initiate-1, initiate-2, initiate-3, soldier-1, and soldier-2, even when four Mission sites with Initiates came before it. An Enemy of an EnemyArchetype named "Cult leader" is shown as cult-leader-1.
