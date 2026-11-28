# Graphical User Interface

| Metadata | Value |
| --- | --- |
| Spec ID | GUI |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | Which screens the graphical user interface has, the progress indicators that several of them show, the warnings it gives, its developer tools, how it names an Agent, an Enemy, and a Mission site, and the Ranks of Agents. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Graphical User Interface (GUI) is where the Player plays the game through a graphical interface. It shows the game and acts on the Player's choices by calling the engine API of the [Engine Contract](../foundation/engine-contract.md).

Its screens follow the life of a [Session](../foundation/core-concepts.md#campaign-and-session) under [Campaign Lifecycle](../foundation/campaign-lifecycle.md): it opens at the [Main menu](../foundation/campaign-lifecycle.md#glossary), where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet, and once a Campaign is created or loaded it shows the screens for playing it. For every screen, the guiding question is what the Player needs to see by default and what can stay one step away. How each screen looks is owned by [Visual Design](visual-design.md).

# Glossary

| Term | Definition |
| --- | --- |
| Detail view | A panel of the [Campaign screen](screens/campaign-screen.md) for one part of the [Campaign](../foundation/core-concepts.md#campaign-and-session) that the Player looks at in detail or acts on, opened from the Side panel over the Globe stage. |
| Globe stage | The region of the Campaign screen that shows the globe and over which a Detail view opens. |
| Side panel | The region at the right of the Campaign screen that opens Detail views and holds the summary of the work waiting for the Player. |
| Completion estimate | The range of [Advance turns](../foundation/engine-contract.md#player-actions-and-turns) within which an Active [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) [may complete](#completion-estimate) if its projected progress gain stays as it is. |
| Progress bar | The [bar](#progress-bar) that shows an Investigation's progress against its [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s required progress. |
| Progress circle | The [small circle](#progress-circle) that shows an Active Investigation's progress as a share of its Lead's [Required progress](../mechanics/leads-and-progression.md#glossary). |
| Settings panel | The [panel](#settings-panel), shown on both screens, through which the Player sets [Global configuration](../foundation/engine-contract.md#persisted-data). |
| Ctrl | The modifier key that a specification names Ctrl, e.g. in "Ctrl+click": the Ctrl key, and on a Mac also the Command key, so that every action held with Ctrl works with the key a Mac uses in its place. |
| View trail | The places that the Player came through to reach the one shown, most recent last, which [the Escape key retraces](screens/campaign-screen.md#view-trail). |
| Back control | The button of the open Detail view that [goes back to the last place of the View trail](screens/campaign-screen.md#view-trail), shown while the View trail is not empty. |
| Enemy label | The name by which the GUI shows an [Enemy](../mechanics/domain-model.md#combat): its EnemyArchetype's name and [its number](#enemy-labels) among the Enemies of that EnemyArchetype at its [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), e.g. "initiate-2". |
| Short Enemy label | The [short form](#enemy-labels) of an Enemy label, by the EnemyArchetype's abbreviation, e.g. "init-2", used only where a full one has no room. |
| Mission site title | The [full name](#mission-site-titles) by which the GUI shows a Mission site wherever it reports what the Mission site's [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) brought, e.g. "Apprehend member · Red Dawn · Initiative · #3". |
| Rank | The [standing](#ranks) by which the GUI says how skilled an [Agent](../mechanics/domain-model.md#agency-and-agents) is when rested, e.g. "Junior Agent". |
| Rank insignia | The mark of a Rank, e.g. one chevron, drawn beside the Rank's name and beside an Agent's figure in the [Combat replay](screens/combat-replay.md#figures). |

# Screens

The GUI has three screens, and each has its own specification in the `screens/` directory, which owns what the screen shows, how it is laid out, and how it is illustrated:

- [Main Menu](screens/main-menu.md): the screen the GUI opens at, where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet.
- [Campaign Screen](screens/campaign-screen.md): the screen for playing the current Campaign. Its parts with a specification of their own are the [Situation Panel](screens/situation-panel.md), the [Turn Summary](screens/turn-summary.md) dialog, and one specification for each Detail view: the [Missions View](screens/missions-view.md), [Leads View](screens/leads-view.md), [Agents View](screens/agents-view.md), [Storage View](screens/storage-view.md), [Upgrades View](screens/upgrades-view.md), [Turn Report View](screens/turn-report-view.md), [History View](screens/history-view.md), [Charts View](screens/charts-view.md), and [Compendium View](screens/compendium-view.md), and the [Combat Replay](screens/combat-replay.md) of the Turn Report View.
- [Combat Simulator](screens/combat-simulator.md): the screen, hidden until the Game designer asks for it, on which two teams of the Game designer's choosing fight a [Combat](../mechanics/domain-model.md#combat) that the Combat Replay shows.

# Settings panel

The Player changes [Global configuration](../foundation/engine-contract.md#persisted-data) in one place, the Settings panel, so that a setting is found the same way on both screens, and the settings the Player rarely changes stay one click away rather than in view. On both it opens from a Settings button, in the [header of the Main Menu](screens/main-menu.md#layout) and in the [status bar of the Campaign Screen](screens/campaign-screen.md#status-bar-controls), drawn as a [dialog](visual-design.md#dialogs), except that it has no buttons at its bottom: the Player closes it with its [close control](visual-design.md#close-controls) or the Escape key. Opening it neither pauses nor changes the Campaign.

The Settings panel is titled Settings and holds these rows from top to bottom, each a [row of a settings list](visual-design.md#inputs):

1. **Music playback:** the [Music control](music.md#music-control-in-the-settings-panel).
2. **Music volume:** the [Music volume slider](music.md#music-volume-slider).
3. **Sounds volume:** the [Sounds toggle and the Sounds volume slider](sounds.md#sound-settings).
4. **Tutorials:** a checkbox labelled "Tutorials enabled" that shows and sets [Tutorials on](tutorials.md#tutorials-settings), and after it the [neutral button "Reset tutorials"](tutorials.md#tutorials-settings).
5. **Other settings:** one row for each other Global configuration setting, e.g. the [Autosave limit](../foundation/saves.md#glossary) or the [Screen limit](visual-design.md#screen-limit), with its input, except a setting that a control elsewhere sets where the Player uses it, e.g. the [Autopilot settings](screens/campaign-screen.md#autopilot-settings).
6. **Changed settings:** what the Player has [changed](#changed-settings).
7. **Tools,** on the Campaign Screen only: a neutral button for the [keyboard shortcuts](screens/campaign-screen.md#keyboard-shortcuts), and one for the developer tools. Each closes the Settings panel and opens what it names.

## Changed settings

A setting changed long ago, or in another place, is easy to forget, so the Settings panel lists in one place every Global configuration setting whose stored value overrides its [Game build default](../foundation/engine-contract.md#persisted-data), whatever row or control sets it. The row is headed "Changed settings" and lists them in the order of the [Global configuration table](../foundation/configuration.md#global-configuration), one line each: the setting's name, its value, and its Game build default, in plain words, e.g. "Autopilot Turns: 100 (default 10)", "Autopilot controls: shown (default hidden)", or "Music: off (default on)". A volume reads as a percentage, e.g. "Music volume: 30% (default 50%)". Each line ends with a neutral Reset button, which makes the setting follow its Game build default again, so that its line leaves the list. While no setting is changed, the row says "Every setting is at its default."

# Developer tools

The developer tools are for the Game designer and for testing, not for playing the game, so [Dev mode](../foundation/engine-contract.md#principals-and-access) gates all of them, and the Game designer who uses them sets them up once rather than in every [Session](../foundation/core-concepts.md#campaign-and-session) or [Campaign](../foundation/core-concepts.md#campaign-and-session). Two [Global configuration](../foundation/configuration.md#global-configuration) settings keep them:

| Setting | Permitted values | Game build default | Set by |
| --- | --- | --- | --- |
| Dev mode on | On or off | Off | The "Dev mode" checkbox of the developer tools. |
| Reveal hidden content on | On or off | Off | The "Reveal hidden content" checkbox of the developer tools. |

- **Gated by Dev mode:** Their first control is a [checkbox](visual-design.md#checkboxes) labelled "Dev mode", which enables and disables Dev mode. While Dev mode is disabled, every other control of the developer tools is disabled, with "Enable Dev mode first." as its tooltip, and a checkbox among them keeps its value.
- **Kept across Sessions:** While Dev mode on is on, the GUI enables Dev mode whenever a Campaign is current and Dev mode is disabled, e.g. after a create or a load, which disable it, and in a new Session; while it is off, the GUI disables Dev mode. Reveal hidden content is on exactly while Reveal hidden content on is on, and it is in effect only while Dev mode is enabled.
- **Fixed during an engagement:** The "Dev mode" checkbox is disabled while an [Autopilot](../foundation/engine-contract.md#autopilot) engagement is active, because Dev mode cannot change then.

## Reveal hidden content

The Game designer checks content in play by turning on [Reveal hidden content](../foundation/developer-access.md#revealed-presentation) with the developer tools' checkbox labelled "Reveal hidden content", which is also disabled while Autopilot is engaged.

# Warning on deploying tired Agents

The engine lets a tired [Agent](../mechanics/domain-model.md#agency-and-agents) be [deployed](../mechanics/missions.md#deploying-agents), so the GUI makes sure the Player deploys one knowingly. Before it makes a `deployAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) whose team includes an Agent with [exhaustion](../mechanics/agents-spec.md#combatant-attributes) of 20 or more, the GUI warns the Player and asks to confirm. The warning names each such Agent with its exhaustion and [effective skill](../mechanics/agents-spec.md#combatant-attributes). It is a warning, not a block: the Player may confirm and deploy. The threshold 20 is a constant of the GUI, not a [GDR](../foundation/core-concepts.md#game-build-and-content) value, because no game rule reads it.

# Progress bar

A Progress bar shows how far an Investigation is from completing while its [Actual required progress](../mechanics/investigations.md#glossary) stays hidden. How it is drawn depends on what the Player knows:

- **[Assessed Lead](../mechanics/investigations.md#glossary):** the bar spans 0 to the greatest value of the Lead's [Required progress range](../mechanics/investigations.md#glossary), e.g. 0 to 15 for a [Required progress](../mechanics/leads-and-progression.md#glossary) of 10. A tick marks the Required progress, and the part from it to the end of the bar is marked as the zone in which the Investigation may complete in any Advance turn. The fill runs from 0 to the [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). On an Active Investigation, a preview segment after the fill shows the [projected progress gain](../mechanics/investigations.md#projected-progress-gain), and a caption says that the Investigation may complete next turn when its progress and that gain together reach the Required progress, and that it may complete any turn once its progress has reached it.
- **Lead that is not an Assessed Lead:** the bar has no scale. It shows a short fixed stub that does not grow with progress, and a caption stating the assessment threshold as a share of the Required progress, from [`assessment_threshold_pct`](../mechanics/investigations.md#investigationparameters), e.g. "assessed at 25% of required".
- **Completed Investigation:** the bar is drawn as for an Assessed Lead. Its fill is split at the Investigation progress before the last Advance turn, so that the gain of that Advance turn, from the [Turn report](../foundation/campaign-state.md#glossary), is a separate segment, and a mark shows where the Investigation completed, labelled with its final Investigation progress.

The scale of a bar never changes, so that every bar of one Lead reads alike. A preview segment, a gain segment, or a completion mark that would pass the greatest value of the range ends at the bar's end, while every value written for it stays [the value it stands for](#decimal-quantities-shown), e.g. on a bar from 0 to 15, a final Investigation progress of 16.50 has its completion mark at the bar's end, labelled "16".

# Progress circle

A Progress circle lets the Player read in one glyph, on a line too short for a [Progress bar](#progress-bar), how far an Active Investigation has come. How it is drawn depends on what the Player knows:

- **Assessed Lead:** the circle fills clockwise from the top by the share of the Required progress that the Investigation progress has reached, e.g. three quarters for progress 7.50 of a Required progress of 10. Once the progress has reached the Required progress, the circle is full and carries a check.
- **Lead that is not an Assessed Lead:** the circle is an empty dashed outline with a question mark.

# Completion estimate

A Completion estimate tells the Player roughly when an Active Investigation will complete, so that a plan can be made without reading the Progress bar. It is worked out by the GUI from [Player-visible information](../foundation/engine-contract.md#api-surfaces) only: the Investigation progress p, the projected progress gain g, the Lead's Required progress range from R, its Required progress, to M, its greatest value, and the [Agent status](../mechanics/agents-spec.md#agent-statuses) of each member of the [Current team](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). It is not a [Derived value](../foundation/core-concepts.md#value-classification) of the engine, and it assumes that g stays as it is.

It is written with "T" for Advance turns, by the first of the following cases that applies:

1. **g is 0 and a member of the Current team is [In transit](../mechanics/domain-model.md#agency-and-agents):** "in transit", e.g. just after the Investigation started.
2. **g is 0 otherwise,** e.g. when every member is At assignment with an [Effective skill](../mechanics/agents-spec.md#effective-skill) of 0: "stalled".
3. **Lead that is not an Assessed Lead:** "ETA ?".
4. **Assessed Lead and g above 0:** the Investigation completes at the earliest after a = max(1, ⌈(R − p) / g⌉) and at the latest after b = ⌈(M − p) / g⌉ Advance turns, written "ETA a–b T", or "ETA a T" when a equals b, e.g. "ETA 3–5 T". Once p has reached R, it is written "ETA ≤ b T".

# Digit grouping

Every number of 1,000 or more, or of −1,000 or less, that the GUI shows has a comma between each group of three digits of its whole part, counted from the right, so that the Player reads its size at a glance, e.g. "45,817", "−1,040", and "1,250.50". This holds wherever a number is shown, e.g. on the status bar, in a table, on a chart axis, and in a Compendium article. Two kinds of digits are not numbers and stay ungrouped: an identifier, e.g. a [Campaign ID](../foundation/saves.md#identifiers) or a seed, and a number in a field while the Player edits it, e.g. the [Turns](../foundation/engine-contract.md#player-actions-and-turns) field of the [Autopilot controls](screens/campaign-screen.md#autopilot-controls).

# Decimal quantities shown

The rules read whole numbers, so the GUI shows every [Decimal quantity](../foundation/numbers.md#glossary) as a whole number, except the values listed below, which it shows with two decimals.

A Decimal quantity shown as a whole number is rounded so that it never reads as having reached a threshold it has not reached, and the Player can trust it at a glance:

- **Exhaustion:** an Agent's [Exact exhaustion](../mechanics/agents-spec.md#combatant-attributes) is shown as its [exhaustion](../mechanics/agents-spec.md#exhaustion-and-exact-exhaustion), i.e. rounded up, e.g. an Exact exhaustion of 3.12 reads "4".
- **Every other Decimal quantity:** rounded down, e.g. a [current health](../mechanics/agents-spec.md#combatant-attributes) of 29.40 against an effective max health of 30 reads "29 / 30", so that an Agent still on [Recovery](../mechanics/agents-spec.md#assignments) never reads "30 / 30".

Only these values are shown with two decimals, exactly, because they are what the Player watches creep toward the next whole number, and rounding would hide it:

- **Investigation progress gains:** the projected progress gain of an Active Investigation, the [Team progress estimate](../mechanics/investigations.md#team-progress-estimate), and the gain of an Investigation in one Advance turn, e.g. "+1.04 / turn".
- **Upgrade effects:** the rate that a [Rate Upgrade](../mechanics/economy-and-upgrades.md#glossary) raises, before and after one more acquisition, on the [Upgrade cards](screens/upgrades-view.md#upgrade-cards) of the Upgrades View, e.g. "Exhaustion recovery 5.00 → 5.50".
- **Agent details:** in the [Agent details](screens/agents-view.md#agent-details) of the Agents View, an Agent's [base skill](../mechanics/agents-spec.md#combatant-attributes), [current health](../mechanics/agents-spec.md#combatant-attributes), and exhaustion, shown as its Exact exhaustion, e.g. "101.90", "29.40 / 30", and "3.12". Everywhere else, these values are whole numbers.
- **Panic:** [Panic](../mechanics/domain-model.md#campaign-standing) and every Panic increase and Panic reduction, wherever one is shown, e.g. "24.35 / 100%" on the status bar and "Panic −0.05" among the [Consequences](../mechanics/missions.md#consequences) of a Mission.

A value that a Compendium article inserts for a [Placeholder](../mechanics/compendium.md#glossary) is text that [Player API](../foundation/engine-contract.md#api-surfaces) reports [already formatted](../mechanics/compendium.md#value-formatting), and the GUI shows it as reported and never rounds it, e.g. a multiplier that reads "0.5".

# EnemyArchetype order

The Player meets the same few kinds of Enemy everywhere, so the GUI lists them in one canonical order, from the weakest to the strongest as the Game designer wrote them: the EnemyArchetype order is the [authored order](../foundation/game-data-records.md#gdr-file-layout) of the EnemyArchetypes in their GDR file. Wherever the GUI lists EnemyArchetypes, or groups Enemies by EnemyArchetype, in an order that no rule of its own gives, it uses the EnemyArchetype order; and a rule that gives an order of its own uses it to break ties, e.g. for the [Enemies of a Mission site](screens/missions-view.md#selected-mission-site) in the Missions View.

# Agent shown by name

The Player knows Agents as people, so the GUI shows every [Agent](../mechanics/domain-model.md#agency-and-agents) by its [Agent name](../mechanics/agents-spec.md#agent-names), wherever it names one, e.g. in a table, a tooltip, the [Turn summary](screens/turn-summary.md), or a line of the [History View](screens/history-view.md). It shows an Agent's [Instance ID](../foundation/campaign-instances.md#glossary) only in its [Agent details](screens/agents-view.md#agent-details), labelled "Instance ID", e.g. "agent-7", because two Agents can share a name. A list in the order of the Agents' Instance IDs, e.g. the default order of the [Agent table](screens/agents-view.md#agent-table), keeps that order, which is the order in which they were hired, and a column of Agent names sorts by the name.

Only where a full Agent name has no room, i.e. beside a figure of the [Combat replay](screens/combat-replay.md#figures), does the GUI show its last name alone, e.g. "Kowalski" for "Jan Kowalski", or its first name when its last name is empty.

# Enemy labels

The Player meets Enemies only a few at a time, at one [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and tells them apart by what they are, so the GUI shows every Enemy by its Enemy label, never by its [Instance ID](../foundation/campaign-instances.md#glossary). The Enemy label is the `name` of the Enemy's EnemyArchetype in lower case, with each space replaced by a hyphen, then a hyphen and the Enemy's number: its position, counted from 1, among the Enemies of the same EnemyArchetype in its Mission site's [list of Enemies](../mechanics/combat.md#fixed-order-of-each-side), e.g. high-commander-1 for an Enemy of an EnemyArchetype named "High commander". An Enemy label is unique only within its Mission site, so wherever an Enemy is named outside the context of its Mission site, e.g. in the Cause column of the [Memorial](screens/agents-view.md#memorial), its Mission site is named beside it, there in the Where column.

E.g., a Mission site whose list of Enemies is three Initiates followed by two Soldiers, with the Instance IDs enemy-19 to enemy-23, shows them as initiate-1, initiate-2, initiate-3, soldier-1, and soldier-2.

Only where a full Enemy label has no room, i.e. beside a figure of the [Combat replay](screens/combat-replay.md#figures), does the GUI show the short Enemy label instead: the [`abbreviation`](../mechanics/combat.md#enemyarchetype) of the EnemyArchetype, then the same hyphen and number, e.g. sold-2 for soldier-2 when the abbreviation is `sold`.

# Ranks

A Rank lets the Player pick out the veterans among the Agents without reading numbers, so it must not change as an Agent is worn down. It is therefore taken from the Agent's [base skill](../mechanics/agents-spec.md#combatant-attributes), rounded down, which is its [effective skill](../mechanics/agents-spec.md#combatant-attributes) at full current health and without [exhaustion](../mechanics/agents-spec.md#combatant-attributes); an Enemy has no Rank.

Which base skill earns which Rank is content rather than design, so the Ranks come from the Rank [GDRs](../foundation/core-concepts.md#game-build-and-content), which serve the Display content purpose. An Agent has the Rank of the Rank GDR with the highest `min_base_skill` that its base skill reaches. An Agent whose base skill reaches no `min_base_skill`, e.g. one that the [Combat Simulator](screens/combat-simulator.md) makes weaker than any hire, has no Rank, and the GUI shows nothing in its place. Wherever the GUI shows a Rank, it shows its `name` followed by its Rank insignia, e.g. "Junior Agent" and one chevron, and a Rank without a `mark` shows its `name` alone. A table, whose columns are narrow, shows its `abbreviation` in place of its `name`, e.g. "Jr Agent" and one chevron, with the `name` in its tooltip.

| Property | Meaning |
| --- | --- |
| `name` | The Rank's name, e.g. "Junior Agent". |
| `abbreviation` | The Rank's short name for tables, of any length up to its `name`, e.g. "Jr Agent" or "Hi Cmdr". No two Rank GDRs share one. |
| `min_base_skill` | The least base skill that earns the Rank, a whole number of at least 0. No two Rank GDRs share one. |
| `mark` | Optional. The kind of the Rank insignia: `chevron`, `bar`, or `star`. Chevrons stand one above the other, bars and stars side by side. A Rank without it has no Rank insignia. |
| `count` | How many of the mark the Rank insignia holds, a whole number from 1 to 3. Present exactly when `mark` is. |

# Mission site titles

Several Mission sites of one MissionSiteArchetype can be met in one Campaign, so wherever the GUI reports what a [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) brought, it names the Mission site by its Mission site title, which tells them apart. The Mission site title is its MissionSiteArchetype's `name`, its target [Faction](../mechanics/domain-model.md#factions)'s `name`, its kind, "Initiative" or "Response", and "#" followed by the number that ends its [Instance ID](../foundation/campaign-instances.md#glossary), joined by " · ", e.g. "Apprehend member · Red Dawn · Initiative · #3" for mission-site-3. The name is in Text and the rest in Text muted.

# Links in tables

The Player who reads a name in a [table](visual-design.md#tables) often wants what lies behind it, so wherever a table cell names an [Agent](../mechanics/domain-model.md#agency-and-agents), a [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), or a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), the name is a link, e.g. the Mission site where a Killed Agent fell in the [Memorial](screens/agents-view.md#memorial), or an Agent in a [Combat report](screens/turn-report-view.md). The name keeps its style until the pointer is over it or it has keyboard focus, when it is underlined. Pressing it opens, as a [Follow](screens/campaign-screen.md#view-trail):

- for an Agent, its [Agent details](screens/agents-view.md#agent-details);
- for a Lead, or an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) by its Lead, the [Leads View](screens/leads-view.md) with that Lead selected;
- for a Mission site, or a [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) by its Mission site, the [Missions View](screens/missions-view.md) with that Mission site selected, which shows a Mission site whose Mission concluded as a [Concluded Mission site](screens/missions-view.md#concluded-mission-site).
