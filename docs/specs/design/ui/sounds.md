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
| Sound | One short sound that the GUI plays in answer to the Player, [supplied as one audio file](#sound-set) and named by its Sound name. |
| Sound name | The name of a Sound, which is the name of its file without the extension, e.g. `main-click`. |
| Sound set | The [Sounds](#sound-set) that the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for the GUI to play. |
| Main click | A Player input that [does something](#main-click), e.g. opens a Detail view, advances the Turn, or hires Agents. |
| Select click | A Player input that [selects or clears an item, or chooses which items are shown](#select-click), without doing anything else, e.g. checking the selection checkbox of an Agent, selecting a Lead in the Leads View, or turning on a filter. |
| Go back | A Player input that [leaves what the Player is looking at or cancels what they were about to do](#go-back), without doing anything else, e.g. the Escape key. |
| Sounds on | The [Global configuration](../foundation/engine-contract.md#persisted-data) [setting](#sound-settings) that says whether the GUI plays Sounds. |
| Sounds volume | The Global configuration [setting](#sound-settings) that says how loud the GUI plays Sounds. |

# Sound set

The Sound set is authored as audio files, so that a sound designer replaces a Sound by replacing its file and nothing else. Each Sound is one audio file directly in the `assets/sounds/` directory at the repository root, in one of the following formats:

- WAV, with the extension `.wav`.
- Ogg Opus, with the extension `.opus`.
- MP3, with the extension `.mp3`.

The Game build supplies every Sound unchanged, in its own format. No two files of the directory have the same Sound name, and any other file in the directory, e.g. a README, is not a Sound.

The GUI plays the following Sounds. A file of the directory whose Sound name is not in the table is not played.

| Sound name | Plays |
| --- | --- |
| `main-click` | On every [Main click](#main-click), and on [releasing the Sounds volume slider](#sound-settings). |
| `select-click` | On every [Select click](#select-click). |
| `go-back-click` | On every [Go back](#go-back). |
| `interesting-turn-summary` | When the [Turn summary](screens/turn-summary.md#glossary) [appears after an Advance turn](#turn-summary). |

# When Sounds play

Every Sound answers one input of the Player, so the Player hears a Sound only for what they did, never for what the game does on its own, e.g. an [Advance turn](../foundation/engine-contract.md#player-actions-and-turns) that [Autopilot](../foundation/engine-contract.md#autopilot) requests plays no Sound. The Player's inputs fall into four kinds: a Main click, a Select click, a Go back, and every other input, which plays no Sound. A key that does what a button does, e.g. a keyboard shortcut, plays the Sound that the button plays.

## Main click

A Main click is the Player selecting a button that does something: it opens a view or a dialog, asks the engine for a [Player action](../foundation/engine-contract.md#player-actions-and-turns), confirms a choice, starts, loads, or saves a [Campaign](../foundation/core-concepts.md#campaign-and-session), or changes a setting of Global configuration. E.g., opening a Detail view from the [Side panel](gui.md#glossary), confirming a deployment at the [warning on deploying tired Agents](gui.md#warning-on-deploying-tired-agents), and the Music toggle of the [Music control](music.md#music-control), whichever way it turns the music, are Main clicks.

The GUI plays `main-click` when the Player selects the button, before the engine answers, so the Sound does not wait for a long Player action. Advance turn is the one exception: its Sound [waits for the Advance turn to end](#turn-summary). The Sounds toggle plays `main-click` when it turns Sounds on and no Sound when it turns them off.

The following inputs play no Sound, because each only changes how something is shown or prepares a later input:

- Changing a toggle that is neither a setting of Global configuration, a filter, nor an expand or collapse control, or a sort or tab, e.g. sorting a table by a column.
- Dragging a slider, typing text, giving a text field the keyboard focus, e.g. with the S key in the Compendium View, hovering, and scrolling.
- Releasing a slider other than the Sounds volume slider.

## Select click

A Select click is the Player selecting or clearing an item, or choosing which items are shown, which chooses what they look at or what a later Main click acts on, without doing anything else. It is one of the following:

- **Selection checkbox:** clicking, Shift-clicking, or dragging over the rows of a [table with selection checkboxes](visual-design.md#tables), e.g. checking the selection checkbox of an Agent in the [Agents View](screens/agents-view.md) or in the deployment pane of the [Missions View](screens/missions-view.md).
- **Select all:** checking or unchecking the Select all checkbox of such a table.
- **List item:** selecting an item of a list in a pane of a [Detail view](gui.md#glossary), which shows that item in the pane beside it, e.g. a [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) in the [Leads View](screens/leads-view.md), a Mission site in the Missions View, or an article in the Compendium View.
- **[Article link](../mechanics/compendium.md#glossary):** selecting an Article link in the [Compendium View](screens/compendium-view.md), which selects the article it links to.
- **[Article history](screens/compendium-view.md#glossary):** selecting the Previous article or Next article button of the Article history in the Compendium View.
- **Search:** pressing the Enter key in the search field of the Compendium View when an article matches, which [selects the first matching article](screens/compendium-view.md#panes). The Enter key when no article matches plays no Sound.
- **Filter:** turning on or off a filter, which chooses the items a list or table shows or lets be selected, e.g. a filter of [Row filters](screens/agents-view.md#row-filters) in the Agents View, an [Assignment filter](screens/agents-view.md#glossary), or the toggle of the Missions View that shows the Mission sites in a final state.
- **Expand or collapse:** expanding or collapsing a part of the [Side panel](gui.md#glossary) that chooses which of its controls are shown, i.e. the [Autopilot controls](screens/campaign-screen.md#autopilot-controls) with their toggle and the [Music control](music.md#music-control-in-the-side-panel) with its Collapse button, both alike.

The GUI plays `select-click` once for each Select click when the Player presses, also when the item already had the state the Select click gives it, so the Player hears every selection answered. A drag over several rows is one Select click, and plays `select-click` once, when the Player presses on its first row.

## Go back

A Go back is the Player leaving what they are looking at, or cancelling what they were about to do, without doing anything else. It is either the Escape key, when it closes, cancels, or goes back from something, or a control that closes, cancels, or goes back, e.g. the [close control](visual-design.md#close-controls) of a Detail view, the [Back control](gui.md#glossary), or dismissing the warning on deploying tired Agents without deploying. The GUI plays `go-back-click` on every Go back.

The Escape key when there is nothing to close or cancel, e.g. while the Campaign screen shows the globe with no dialog open, is not a Go back and plays no Sound. An input that [shows the Turn summary again](#turn-summary) is not a Go back either, because it opens a dialog.

## Turn summary

When an Advance turn that the Player requested [shows the Turn summary](screens/turn-summary.md#groups), the GUI announces it with a Sound of its own, so that the news is heard before it is read. The Player's Advance turn therefore plays one Sound, and the GUI chooses it when the Advance turn ends, because only then does it know whether there is news: `interesting-turn-summary`, at once as the Turn summary appears, when the Advance turn shows one, and `main-click` otherwise.

Reopening the Turn summary from the [Turn Report View](screens/turn-report-view.md) is a Main click and plays only `main-click`, because it brings no news. So is every input that [shows the Turn summary again from a Detail view](screens/campaign-screen.md#view-trail), whether the [Back control](gui.md#glossary) labelled "‹ Turn summary", the Escape key, or the close control of a Detail view whose [View trail](gui.md#glossary) begins with the Turn summary.

# Sound settings

The Player decides whether Sounds play and how loud they are, and the choice should survive the end of a [Session](../foundation/core-concepts.md#campaign-and-session), so both are settings of [Global configuration](../foundation/configuration.md#global-configuration).

| Setting       | Permitted values                         | Game build default |
| ------------- | ---------------------------------------- | ------------------ |
| Sounds on     | `true` or `false`                        | `true`             |
| Sounds volume | A whole number from 0 to 100, inclusive. | 100                |

The Sounds are authored to be heard over the music at their own level, so the [Game build default](../foundation/engine-contract.md#persisted-data) plays them as authored, and the Player turns them down from there.

The two settings are independent of [Music on and Music volume](music.md#music-settings), so the Player can silence the music and keep the Sounds, or the reverse. The Player sets both in one row of the [Settings panel](gui.md#settings-panel), labelled Sounds, which holds from left to right:

1. **Sounds toggle:** a neutral button showing a speaker, struck through while Sounds on is `false`, drawn as the Music toggle of the [Music control](music.md#music-control) is. Selecting it sets Sounds on to the opposite value. Its accessible name is "Sounds on" or "Sounds off", after the state it shows.
2. **Sounds volume slider:** a horizontal [slider](visual-design.md#sliders) from 0 to 100 in steps of 1, showing the Sounds volume, followed by the Sounds volume in the Figure style. The Sounds volume is set when the Player releases the slider, and on release `main-click` plays at the new Sounds volume, so the Player hears the level they chose. The slider stays enabled while Sounds on is `false`.

While Sounds on is `false`, the GUI plays no Sound. Otherwise it plays each Sound at this gain, a factor of the amplitude at which the Sound was authored, so that the Sounds volume follows the Player's ear as the [Music volume](music.md#loudness) does:

```text
gain = (Sounds volume / 100)²
```

E.g., with a Sounds volume of 50, the gain is 0.5² = 0.25.

# Playing a Sound

A Sound plays once, from its beginning to its end, without a fade. It plays over the music, which neither pauses nor changes its gain, and over any Sound already playing. Changing screen, opening or closing a [Detail view](gui.md#glossary), and a Go back do not stop a Sound that is playing. A change of Sounds on or Sounds volume applies to the Sounds that start after it.

A Sound is never worth interrupting play for, so every failure of it is silent: a Sound whose file the Game build lacks, or whose file cannot be loaded or decoded, plays nothing and shows no error to the Player, and every other Sound plays as usual. When the platform withholds sound until the Player first interacts with the GUI, e.g. a web browser that blocks sound until the first click or key press, a Sound withheld by it is not played later.
