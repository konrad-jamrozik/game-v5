# Track tags

A tool that fixes the tags of music tracks. Music generators write their own tags into a download, e.g. Suno sets the title to the song's working title, e.g. `S6 SCNP+7Instr A`, and the contributing artist to the account name, so a media player shows a track under a name that is not the track's. The tool makes the tags match the track's name, as the [music README](../../assets/music/README.md) defines it.

For every `.mp3`, `.opus`, and `.ogg` file, it:

- sets the title to the file name without its extension, e.g. `Dark Omen.mp3` gets the title `Dark Omen`;
- removes every artist tag, i.e. the ID3 frames `TPE1` (contributing artist), `TPE2` (album artist), `TPE3`, and `TPE4`, and the Vorbis comments `ARTIST`, `ALBUMARTIST`, and `PERFORMER`.

It keeps every other tag, e.g. a Suno song URL, comment, cover image, or C2PA manifest, and never changes the audio. It does not write a file that is already correct, and keeps an MP3's ID3 version.

## Run it

It requires Python 3 with [mutagen](https://mutagen.readthedocs.io/):

```bash
pip install mutagen
```

From the repository root, give it track files or folders, which it searches recursively:

```bash
python lib/track-tags/track-tags.py --dry-run assets/music/tracks
python lib/track-tags/track-tags.py assets/music/tracks
```

| Option      | Effect                                                              |
| ----------- | ------------------------------------------------------------------- |
| `--dry-run` | Prints each change and writes nothing.                              |
| `--check`   | Writes nothing, and exits with status 1 when any file would change. |

Run it on each new track after it is renamed and before it is committed, and on every other copy of the tracks, e.g. a backup folder.
