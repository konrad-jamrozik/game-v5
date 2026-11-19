# Sounds

| Metadata | Value |
| --- | --- |
| Spec ID | SOUNDS |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | The short sounds the graphical user interface plays in answer to the Player: the Sound set, when each Sound plays, and its settings. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The GUI answers the Player's clicks with short sounds, so that the command console feels like a responsive instrument and the Player hears that an order was taken without looking for its effect. Each Sound has one meaning: one Sound answers a Main click, which does something, another answers a Select click, which only chooses what to look at or act on, a third answers a Go back, which leaves or cancels something, and a fourth announces that an Advance turn brought news worth a Turn summary.

Sounds belong to the [Graphical User Interface](gui.md) alone, like the [Music](music.md) they play over. They read no game state beyond what the GUI already shows, change no [Campaign state](../foundation/core-concepts.md#campaign-and-session), and draw no random outcome of a [Campaign](../foundation/core-concepts.md#campaign-and-session); the [Command-Line Interface](cli.md) plays no sounds. Their two settings are part of [Global configuration](../foundation/engine-contract.md#persisted-data), so a choice the Player makes once applies in every later [Session](../foundation/core-concepts.md#campaign-and-session).

# Glossary

| Term | Definition |
| --- | --- |
| Sound | One short sound that the GUI plays in answer to the Player, supplied as one audio file and named by its Sound name, under [Sound set](#sound-set). |
| Sound name | The name of a Sound, which is the name of its file without the extension, e.g. `main-click`. |
| Sound set | The Sounds that the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for the GUI to play, under [Sound set](#sound-set). |
| Main click | A Player input that does something, e.g. opens a Detail view, advances the Turn, or hires Agents, under [Main click](#main-click). |
| Select click | A Player input that selects or clears an item, or chooses which items are shown, without doing anything else, e.g. checking the selection checkbox of an Agent, selecting a Lead in the Leads View, or turning on a filter, under [Select click](#select-click). |
| Go back | A Player input that leaves what the Player is looking at or cancels what they were about to do, without doing anything else, e.g. the Escape key, under [Go back](#go-back). |
| Sounds on | The [Global configuration](../foundation/engine-contract.md#persisted-data) setting that says whether the GUI plays Sounds, under [Sound settings](#sound-settings). |
| Sounds volume | The Global configuration setting that says how loud the GUI plays Sounds, under [Sound settings](#sound-settings). |

# Sound set

The Sound set is authored as audio files, so that a sound designer replaces a Sound by replacing its file and nothing else. Each Sound is one audio file directly in the `assets/sounds/` directory at the repository root, in one of the following formats; the list is complete:

- WAV, with the extension `.wav`.
- Ogg Opus, with the extension `.opus`.
- MP3, with the extension `.mp3`.

The Game build supplies every Sound unchanged, in its own format. No two files of the directory have the same Sound name, and any other file in the directory, e.g. a README, is not a Sound.

The GUI plays the following Sounds, each at the moments the linked section states; the table is complete. A file of the directory whose Sound name is not in the table is not played.

| Sound name | Plays |
| --- | --- |
| `main-click` | On every Main click, under [Main click](#main-click), and on releasing the Sounds volume slider, under [Sound settings](#sound-settings). |
| `select-click` | On every Select click, under [Select click](#select-click). |
| `go-back-click` | On every Go back, under [Go back](#go-back). |
| `interesting-turn-summary` | When the [Turn summary](screens/turn-summary.md#glossary) appears after an Advance turn, under [Turn summary](#turn-summary). |

# When Sounds play

Every Sound answers one input of the Player, so the Player hears a Sound only for what they did, never for what the game does on its own, e.g. an [Advance turn](../foundation/engine-contract.md#player-actions-and-turns) that [Autopilot](../foundation/engine-contract.md#autopilot) requests plays no Sound. The Player's inputs fall into four kinds: a Main click, a Select click, a Go back, and every other input, which plays no Sound. A key that does what a button does, e.g. a keyboard shortcut, plays the Sound that the button plays.

## Main click

A Main click is the Player selecting a button that does something: it opens a view or a dialog, asks the engine for a [Player action](../foundation/engine-contract.md#player-actions-and-turns), confirms a choice, starts, loads, or saves a [Campaign](../foundation/core-concepts.md#campaign-and-session), or changes a setting of Global configuration. E.g., each of these is a Main click: opening a Detail view from the [Side panel](gui.md#glossary), opening the [Settings panel](gui.md#settings-panel), Advance turn, Hire, assigning Agents, deploying Agents, confirming a deployment under [Warning on deploying tired Agents](gui.md#warning-on-deploying-tired-agents), Load on a Campaign save, opening the Turn Report View from the Turn summary, showing the Turn summary again from a Detail view under [Turn summary](#turn-summary), selecting an Article link in the [Compendium View](screens/compendium-view.md), which follows a reference to another article, and the Music toggle of the [Music control](music.md#music-control), whichever way it turns the music. The GUI plays `main-click` when the Player selects the button, before the engine answers, so the Sound does not wait for a long Player action. Advance turn is the one exception: its Sound waits for the Advance turn to end, under [Turn summary](#turn-summary). The Sounds toggle under [Sound settings](#sound-settings) plays `main-click` when it turns Sounds on and no Sound when it turns them off.

The following inputs are not Main clicks; the list is complete:

- A Select click, which plays its own Sound.
- Changing a toggle that is neither a setting of Global configuration nor a filter, or a sort or tab, e.g. expanding the Autopilot controls or sorting a table by a column.
- Dragging a slider, typing text, hovering, and scrolling. Releasing the Sounds volume slider plays `main-click` under [Sound settings](#sound-settings), and releasing any other slider plays no Sound.
- A Go back, which plays its own Sound.

Each input of the list other than a Select click and a Go back plays no Sound, because it only changes how something is shown or prepares a later input.

## Select click

A Select click is the Player selecting or clearing an item, or choosing which items are shown, which chooses what they look at or what a later Main click acts on, without doing anything else. It is one of the following; the list is complete:

- **Selection checkbox:** clicking, Shift-clicking, or dragging over the rows of a table with selection checkboxes, under [Tables](visual-design.md#tables), e.g. checking the selection checkbox of an Agent in the [Agents View](screens/agents-view.md) or in the deployment pane of the [Missions View](screens/missions-view.md).
- **Select all:** checking or unchecking the Select all checkbox of such a table.
- **List item:** selecting an item of a list in a pane of a [Detail view](gui.md#glossary), which shows that item in the pane beside it, e.g. a [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) in the [Leads View](screens/leads-view.md), a Mission site in the Missions View, or a category or an article in the Compendium View.
- **[Article history](screens/compendium-view.md#glossary):** selecting the Previous article or Next article button of the Article history in the Compendium View, which selects another article of the list the Player already passed through.
- **Filter:** turning on or off a filter, which chooses the items a list or table shows or lets be selected, e.g. a filter of [Row filters](screens/agents-view.md#row-filters) in the Agents View, an [Assignment filter](screens/agents-view.md#glossary), or the toggle of the Missions View that shows the Mission sites in a final state.

The GUI plays `select-click` once for each Select click when the Player presses, also when the item already had the state the Select click gives it, so the Player hears every selection answered. A drag over several rows is one Select click, and plays `select-click` once, when the Player presses on its first row. An item that the GUI selects on its own, e.g. the first item that the Leads View selects when it opens, plays no Sound.

## Go back

A Go back is the Player leaving what they are looking at, or cancelling what they were about to do, without doing anything else. It is either the Escape key, when it closes, cancels, or goes back from something, or a control that closes or goes back, e.g. the close control of a Detail view, of the Settings panel, or of the [Main menu](screens/main-menu.md), or the [Back control](gui.md#glossary). The GUI plays `go-back-click` on every Go back. An input that shows the Turn summary again is not a Go back, because it opens a dialog, under [Turn summary](#turn-summary). E.g., each of these is a Go back: closing the open Detail view, which shows the globe again; going back along the [View trail](screens/campaign-screen.md#view-trail), e.g. from the Leads View to the Turn Report View it was opened from; closing the [Main menu](../foundation/campaign-lifecycle.md#glossary), which returns to the Campaign; closing the [Settings panel](gui.md#glossary) or the developer tools; and cancelling a deployment of Agents before it is confirmed, e.g. dismissing the warning under [Warning on deploying tired Agents](gui.md#warning-on-deploying-tired-agents) without deploying.

The Escape key when there is nothing to close or cancel, e.g. while the Campaign screen shows the globe with no dialog open, is not a Go back and plays no Sound.

## Turn summary

When an Advance turn that the Player requested brings news that the Player must know, the GUI shows the [Turn summary](screens/turn-summary.md#glossary) under [Groups](screens/turn-summary.md#groups) in Turn Summary, and announces it with a Sound of its own, so that the news is heard before it is read. The Player's Advance turn therefore plays one Sound, and the GUI chooses it when the Advance turn ends, because only then does it know whether there is news: `interesting-turn-summary`, at once as the Turn summary appears, when the Advance turn shows one, and `main-click` otherwise. An Advance turn that shows a Turn summary plays no `main-click`, so the news is never heard after or over a click.

Reopening the Turn summary from the [Turn Report View](screens/turn-report-view.md) is a Main click and plays only `main-click`, because it brings no news. So is every input that shows the Turn summary again from a Detail view under [View trail](screens/campaign-screen.md#view-trail) in Campaign Screen, whether the [Back control](gui.md#glossary) labelled "‹ Turn summary", the Escape key, or the close control of a Detail view whose [View trail](gui.md#glossary) begins with the Turn summary, because each opens the Turn summary as a dialog rather than leaving one.

# Sound settings

The Player decides whether Sounds play and how loud they are, and the choice should survive the end of a [Session](../foundation/core-concepts.md#campaign-and-session), so both are settings of Global configuration, read and changed through `session.globalConfiguration` under [Global configuration](../foundation/configuration.md#global-configuration) in Configuration. The following table is complete for Sounds.

| Setting       | Permitted values                         | Game build default |
| ------------- | ---------------------------------------- | ------------------ |
| Sounds on     | `true` or `false`                        | `true`             |
| Sounds volume | A whole number from 0 to 100, inclusive. | 100                |

The Sounds are authored to be heard over the music at their own level, so the [Game build default](../foundation/engine-contract.md#persisted-data) plays them as authored, and the Player turns them down from there.

The two settings are independent of Music on and Music volume under [Music settings](music.md#music-settings), so the Player can silence the music and keep the Sounds, or the reverse. The Player sets both in one row of the [Settings panel](gui.md#settings-panel), labelled Sounds, which holds from left to right:

1. **Sounds toggle:** a neutral button showing a speaker, struck through while Sounds on is `false`, drawn as the Music toggle of the [Music control](music.md#music-control) is. Selecting it sets Sounds on to the opposite value through `session.globalConfiguration.set`. Its accessible name is "Sounds on" or "Sounds off", after the state it shows.
2. **Sounds volume slider:** a horizontal slider from 0 to 100 in steps of 1, under [Sliders](visual-design.md#sliders), showing the Sounds volume, followed by the Sounds volume in the Figure style. The Sounds volume is set through `session.globalConfiguration.set` when the Player releases the slider, and on release `main-click` plays at the new Sounds volume, so the Player hears the level they chose. The slider stays enabled while Sounds on is `false`, and then plays no Sound on release.

A setting that `session.globalConfiguration.set` rejects leaves the row showing the setting's previous value.

While Sounds on is `false`, the GUI plays no Sound. Otherwise it plays each Sound at the gain

gain = (v / 100)²

where v is the Sounds volume, a factor of the amplitude at which the Sound was authored, so that the Sounds volume follows the Player's ear as the Music volume does under [Loudness](music.md#loudness) in Music. No rounding occurs. E.g., with a Sounds volume of 50, the gain is 0.5² = 0.25.

# Playing a Sound

A Sound plays once, from its beginning to its end, without a fade. It plays over the music, which neither pauses nor changes its gain, and over any Sound already playing. Changing screen, opening or closing a [Detail view](gui.md#glossary), and a Go back do not stop a Sound that is playing. A change of Sounds on or Sounds volume applies to the Sounds that start after it.

# Edge cases and failure behavior

A Sound is never worth interrupting play for, so every failure of it is silent.

- **Missing Sound:** A Game build without the file of a Sound in the table under [Sound set](#sound-set) plays nothing at the moments that Sound would play, and every other Sound plays as usual.
- **Sound that cannot be played:** A Sound whose file cannot be loaded or decoded plays nothing, and no error is shown to the Player.
- **Blocked sound:** When the platform withholds sound until the Player first interacts with the GUI, e.g. a web browser that blocks sound until the first click or key press, a Sound withheld by it is not played later.
- **Invalid stored value:** A stored Sounds on or Sounds volume that is not permitted follows the [Game build default](../foundation/engine-contract.md#persisted-data), under [Edge cases and failure behavior](../foundation/configuration.md#edge-cases-and-failure-behavior) in Configuration.
